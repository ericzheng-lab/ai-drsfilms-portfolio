"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { classifyProfileUrl } = require("./profile-url");
const { scanClaimLocks, scanSlop, findForbiddenWaivers, scanSkipLanguage } = require("./text-scan");
const { loadRuleset, runHops, optionalFetch } = require("./check");
const { decideVerdict, GENERATOR } = require("./reports");

const REQUIRED_RULE_IDS = [
  "no-profile-waiver",
  "no-cl-waiver",
  "brief-no-skip-language",
  "profile-not-homepage",
  "r3-three-live-pieces",
  "portfolio-url-matches-profile",
  "slop-lexicon",
  "claim-lock-sundance-win",
  "claim-lock-berlinale-win",
  "claim-lock-dungeon-fighter",
  "claim-lock-rmb-cny",
  "claim-lock-p007",
  "claim-lock-five-films-four-weeks",
];

const RULESET_INTEGRITY_PIN =
  "6690af63c2e6c24ee8c34dd606aa82fba771f3c4d5eba4094ea00b61f3d6e5df";

function assert(cond, message) {
  if (!cond) {
    const err = new Error(message);
    err.code = "SELF_TEST";
    throw err;
  }
}

function tmpReports() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "career-hop-"));
}

function fixture(name) {
  return path.join(__dirname, "..", "fixtures", name);
}

function copyFixtureToTmp(name) {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), `career-hop-${name}-`));
  fs.cpSync(fixture(name), dest, { recursive: true });
  return dest;
}

function failuresOf(report) {
  return (report.checks || [])
    .filter((c) => c.status === "FAIL")
    .map((c) => c.id);
}

function hasFail(report, idPrefix) {
  return failuresOf(report).some((id) => id === idPrefix || id.startsWith(idPrefix));
}

function rulesetPin() {
  const rulesPath = path.join(__dirname, "..", "rules", "rules.json");
  const contractsPath = path.join(__dirname, "..", "rules", "contracts.json");
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(rulesPath))
    .update("\n")
    .update(fs.readFileSync(contractsPath))
    .digest("hex");
}

async function testReportForgeryRejected() {
  const dir = copyFixtureToTmp("forged-reports");
  const reportsDir = path.join(dir, "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const handwritten = path.join(dir, "handwritten");
  for (const hop of ["R0", "R-VI", "R1", "R1b", "R2"]) {
    const src = path.join(handwritten, `${hop}.json`);
    const dest = path.join(reportsDir, `${hop}.json`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    } else {
      fs.writeFileSync(dest, JSON.stringify({ verdict: "ACCEPT" }), "utf8");
    }
  }
  const result = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
  });
  assert(result.last.verdict === "REJECT", "forged reports must REJECT R3");
  assert(
    failuresOf(result.last).some((id) => id.startsWith("prerequisite-")),
    `forged reports must fail prerequisites, got ${failuresOf(result.last)}`
  );
  assert(
    (result.last.checks || []).some(
      (c) => c.id.startsWith("prerequisite-") && /forged/i.test(c.detail)
    ),
    "forged reports must be labeled forged"
  );
  return "REJECT";
}

async function testReportBindsToPackageAndInputs() {
  const donor = copyFixtureToTmp("pass-minimal-three");
  const graft = copyFixtureToTmp("cross-package-graft");
  const donorReports = path.join(donor, "reports");
  const pass = await runHops({
    packageDir: donor,
    hops: ["R0", "R-VI", "R1", "R1b", "R2", "R3"],
    reportsDir: donorReports,
    stopOnFail: true,
  });
  assert(pass.last.verdict === "ACCEPT", "donor chain must ACCEPT before graft");

  const graftReports = path.join(graft, "reports");
  fs.mkdirSync(graftReports, { recursive: true });
  for (const hop of ["R0", "R-VI", "R1", "R1b", "R2"]) {
    fs.copyFileSync(
      path.join(donorReports, `${hop}.json`),
      path.join(graftReports, `${hop}.json`)
    );
  }
  const grafted = await runHops({
    packageDir: graft,
    hops: ["R3"],
    reportsDir: graftReports,
    stopOnFail: false,
  });
  assert(grafted.last.verdict === "REJECT", "cross-package grafted reports must REJECT");
  assert(
    (grafted.last.checks || []).some(
      (c) =>
        c.id.startsWith("prerequisite-") &&
        c.status === "FAIL" &&
        /package_dir|hash|forged|bind|cross-package|stale/i.test(c.detail)
    ),
    `grafted reports must fail binding, got ${JSON.stringify(
      (grafted.last.checks || []).filter((c) => c.id.startsWith("prerequisite-"))
    )}`
  );
  return "REJECT";
}

async function testStaleReportInvalidatedOnInputChange() {
  const dir = copyFixtureToTmp("stale-input");
  const reportsDir = path.join(dir, "reports");
  const pass = await runHops({
    packageDir: dir,
    hops: ["R0", "R-VI", "R1", "R1b", "R2", "R3"],
    reportsDir,
    stopOnFail: true,
  });
  assert(pass.last.verdict === "ACCEPT", "stale-input must ACCEPT before mutation");
  fs.appendFileSync(path.join(dir, "cv.md"), "\nMutated after ACCEPT.\n", "utf8");
  const stale = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
  });
  assert(stale.last.verdict === "REJECT", "mutating CV after ACCEPT must REJECT R3");
  assert(
    (stale.last.checks || []).some(
      (c) =>
        c.id.startsWith("prerequisite-") &&
        c.status === "FAIL" &&
        /stale|hash|forged|bind/i.test(c.detail)
    ),
    `stale reports must fail hash binding, got ${JSON.stringify(
      (stale.last.checks || []).filter((c) => c.id.startsWith("prerequisite-"))
    )}`
  );
  return "REJECT";
}

async function testGhostProfileUrlWithoutLivePageRejected() {
  const r2 = await runHops({
    packageDir: fixture("ghost-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(r2.last.verdict === "REJECT", "ghost-profile R2 must REJECT");
  assert(
    hasFail(r2.last, "r2-profile-present"),
    `ghost-profile R2 must fail r2-profile-present, got ${failuresOf(r2.last)}`
  );

  const r3 = await runHops({
    packageDir: fixture("ghost-profile"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(r3.last.verdict === "REJECT", "ghost-profile R3 must REJECT");
  assert(
    hasFail(r3.last, "r3-profile-present") || hasFail(r3.last, "r3-three-live-pieces"),
    `ghost-profile R3 must fail real Profile closeout, got ${failuresOf(r3.last)}`
  );
  return "REJECT";
}

async function testFetchProfile4xx5xxTimeoutIsFail() {
  const cases = [
    { status: 404, timedOut: false, error: null, label: "4xx" },
    { status: 503, timedOut: false, error: null, label: "5xx" },
    { status: null, timedOut: true, error: "timeout", label: "timeout" },
    { status: null, timedOut: false, error: "socket hang up", label: "error" },
  ];
  for (const fetchResult of cases) {
    const r = await runHops({
      packageDir: fixture("pass-minimal-three"),
      hops: ["R2"],
      reportsDir: tmpReports(),
      stopOnFail: false,
      fetchResult,
    });
    assert(
      hasFail(r.last, "r2-live-fetch"),
      `--fetch-profile ${fetchResult.label} must FAIL r2-live-fetch, got ${failuresOf(r.last)}`
    );
    assert(
      r.last.verdict === "REJECT",
      `--fetch-profile ${fetchResult.label} must REJECT, got ${r.last.verdict}`
    );
  }

  const liveMiss = await optionalFetch("https://127.0.0.1:1/", 200);
  assert(liveMiss.error || liveMiss.timedOut, "optional fetch must not throw");
  const live = await runHops({
    packageDir: fixture("pass-minimal-three"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: liveMiss,
  });
  assert(hasFail(live.last, "r2-live-fetch"), "real fetch error must FAIL r2-live-fetch");
  assert(live.last.verdict === "REJECT", "real fetch error must REJECT");
  return "REJECT";
}

async function testWaiverDetectionShapeVariants() {
  const shapes = [
    { waivers: ["profile"] },
    { waivers: "waive the profile" },
    { waivers: [{ artifact: "profile", reason: "builder optional" }] },
    { waived: { profile: true } },
    { exemptions: ["cover_letter"] },
    { exemptions: { "cover letter": true } },
    { ｗａｉｖｅｒｓ: ["ｐｒｏｆｉｌｅ"] },
  ];
  for (const obj of shapes) {
    const hits = findForbiddenWaivers(obj);
    assert(
      hits.length > 0,
      `waiver shape must be detected: ${JSON.stringify(obj)}`
    );
  }

  const r0 = await runHops({
    packageDir: fixture("waiver-object"),
    hops: ["R0"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(r0.last.verdict === "REJECT", "waiver-object R0 must REJECT");
  assert(
    hasFail(r0.last, "no-profile-waiver") || hasFail(r0.last, "no-cl-waiver"),
    `waiver-object must fail a waiver check, got ${failuresOf(r0.last)}`
  );
  return "REJECT";
}

async function testSkipLanguageChineseAndParaphrase() {
  const { rules } = loadRuleset();
  const patterns =
    (rules.rules.find((r) => r.id === "brief-no-skip-language") || {}).patterns || [];
  const samples = [
    "本角色可以跳过简介，无需封面。",
    "不需要角色页，省略求职信。",
    "We can leave out the profile for this role.",
    "The cover letter is optional.",
    "This role does not require a profile.",
    "No need for a cover letter.",
  ];
  for (const sample of samples) {
    const hits = scanSkipLanguage(sample, patterns);
    assert(hits.length > 0, `skip language must match: ${sample}`);
  }

  const r0 = await runHops({
    packageDir: fixture("chinese-skip"),
    hops: ["R0"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(r0.last.verdict === "REJECT", "chinese-skip R0 must REJECT");
  assert(
    hasFail(r0.last, "brief-no-skip-language"),
    `chinese-skip must fail brief-no-skip-language, got ${failuresOf(r0.last)}`
  );
  return "REJECT";
}

async function runSelfTest() {
  const { rules, contracts } = loadRuleset();
  const lexicon = (rules.rules.find((r) => r.id === "slop-lexicon") || {}).lexicon || [];

  const pin = rulesetPin();
  assert(
    pin === RULESET_INTEGRITY_PIN,
    `ruleset integrity pin mismatch: got ${pin}`
  );
  for (const id of REQUIRED_RULE_IDS) {
    assert(
      (rules.rules || []).some((r) => r.id === id),
      `ruleset missing required rule ${id}`
    );
  }
  assert(contracts.version === rules.version, "rules and contracts versions must match");

  const homepageCases = [
    ["https://drsfilms.com", false, "homepage"],
    ["https://www.drsfilms.com", false, "homepage"],
    ["https://ai.drsfilms.com", false, "homepage"],
    ["https://ai.drsfilms.com/", false, "homepage"],
    ["https://ai.drsfilms.com/prompt-builder/", false, "homepage"],
    ["https://linkedin.com/in/fixture", false, "linkedin"],
    ["https://acme.test", false, "bare-domain"],
    ["https://ai.drsfilms.com/acme", true, "company-route"],
    ["https://ai.drsfilms.com/acme/", true, "company-route"],
  ];
  for (const [url, ok, kind] of homepageCases) {
    const got = classifyProfileUrl(url);
    assert(got.ok === ok && got.kind === kind, `classify ${url} => ${got.kind}/${got.ok}, expected ${kind}/${ok}`);
  }
  assert(
    classifyProfileUrl("https://ai.drsfilms.com/acme").normalized ===
      "https://ai.drsfilms.com/acme/",
    "trailing slash normalized"
  );

  const sundanceWin = scanClaimLocks("Selected at Sundance as winner of a sidebar prize.");
  assert(
    sundanceWin.some((h) => h.id === "claim-lock-sundance-win"),
    "Sundance + winner must fail"
  );
  const sundanceOk = scanClaimLocks("Sundance Grand Jury nominee; Berlinale Panorama selection.");
  assert(sundanceOk.length === 0, "nominee / Panorama must not trip win locks");

  const berlinaleWin = scanClaimLocks("Berlinale winner in a sidebar.");
  assert(
    berlinaleWin.some((h) => h.id === "claim-lock-berlinale-win"),
    "Berlinale as a win must fail"
  );

  const far = `Sundance ${"x ".repeat(40)} winner of a sidebar.`;
  assert(
    scanClaimLocks(far).some((h) => h.id === "claim-lock-sundance-win"),
    "Sundance + winner with a longer window must fail"
  );

  assert(
    scanClaimLocks("Shipped Dungeon Fighter content.").some(
      (h) => h.id === "claim-lock-dungeon-fighter"
    ),
    "Dungeon Fighter without & must fail"
  );
  assert(
    scanClaimLocks("Shipped Dungeon-Fighter content.").some(
      (h) => h.id === "claim-lock-dungeon-fighter"
    ),
    "Dungeon-Fighter without & must fail"
  );
  assert(
    scanClaimLocks("Shipped Dungeon & Fighter content.").every(
      (h) => h.id !== "claim-lock-dungeon-fighter"
    ),
    "Dungeon & Fighter must pass"
  );
  assert(
    scanClaimLocks("Shipped Dungeon＆Fighter content.").every(
      (h) => h.id !== "claim-lock-dungeon-fighter"
    ),
    "Dungeon＋fullwidth &＋Fighter must pass"
  );

  assert(
    scanClaimLocks("Grant of 1M RMB recorded.").some((h) => h.id === "claim-lock-rmb-cny"),
    "RMB must fail"
  );
  assert(
    scanClaimLocks("Budget marked ¥500k.").some((h) => h.id === "claim-lock-rmb-cny"),
    "¥ must fail"
  );
  assert(
    scanClaimLocks("金额人民币一百万。").some((h) => h.id === "claim-lock-rmb-cny"),
    "人民币 must fail"
  );
  assert(
    scanClaimLocks("Launched P007 for a studio.").some((h) => h.id === "claim-lock-p007"),
    "P007 as a product name must fail"
  );
  assert(
    scanClaimLocks(
      "Authored and directed 5 AI-native shorts in under 4 weeks on a stack."
    ).some((h) => h.id === "claim-lock-five-films-four-weeks"),
    "five-films-in-four-weeks must fail"
  );

  const slopHits = scanSlop("A proven track record and cutting-edge process.", lexicon);
  assert(slopHits.length >= 2, "slop lexicon must flag shared-doc phrases");

  const waiverHits = findForbiddenWaivers({ waivers: ["profile", "cl"] });
  assert(waiverHits.length === 2, "waivers[] for profile/CL must be detected");

  const skipReports = tmpReports();
  const skip = await runHops({
    packageDir: fixture("fail-skip-profile"),
    hops: ["R3"],
    reportsDir: skipReports,
    stopOnFail: false,
  });
  assert(skip.last.verdict === "REJECT", "fail-skip-profile R3 must REJECT");
  assert(
    hasFail(skip.last, "r3-profile-present") || hasFail(skip.last, "r3-three-live-pieces"),
    `fail-skip-profile must fail Profile closeout, got ${failuresOf(skip.last)}`
  );

  const homeReports = tmpReports();
  const home = await runHops({
    packageDir: fixture("fail-generic-homepage"),
    hops: ["R2"],
    reportsDir: homeReports,
    stopOnFail: false,
  });
  assert(home.last.verdict === "REJECT", "fail-generic-homepage R2 must REJECT");
  assert(
    hasFail(home.last, "profile-not-homepage"),
    `fail-generic-homepage must fail homepage rule, got ${failuresOf(home.last)}`
  );

  const home3 = await runHops({
    packageDir: fixture("fail-generic-homepage"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(home3.last.verdict === "REJECT", "fail-generic-homepage R3 must REJECT");

  const missReports = tmpReports();
  const missCl = await runHops({
    packageDir: fixture("fail-missing-cl"),
    hops: ["R1b"],
    reportsDir: missReports,
    stopOnFail: false,
  });
  assert(missCl.last.verdict === "REJECT", "fail-missing-cl R1b must REJECT");
  assert(hasFail(missCl.last, "r1b-cl-exists"), "fail-missing-cl must fail r1b-cl-exists");

  const missR3 = await runHops({
    packageDir: fixture("fail-missing-cl"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(missR3.last.verdict === "REJECT", "fail-missing-cl R3 must REJECT");
  assert(
    hasFail(missR3.last, "r3-cl-exists") || hasFail(missR3.last, "r3-three-live-pieces"),
    "fail-missing-cl closeout must notice missing CL"
  );

  const passReports = tmpReports();
  const pass = await runHops({
    packageDir: fixture("pass-minimal-three"),
    hops: ["R0", "R-VI", "R1", "R1b", "R2", "R3"],
    reportsDir: passReports,
    stopOnFail: true,
  });
  assert(pass.reports.length === 6, `pass chain should finish 6 hops, got ${pass.reports.length}`);
  for (const r of pass.reports) {
    assert(r.verdict === "ACCEPT", `${r.hop} should ACCEPT, got ${r.verdict}: ${r.failures.join("; ")}`);
    assert(r.generator === GENERATOR, `${r.hop} report must be harness-generated`);
    assert(r.binding && r.input_hashes, `${r.hop} report must bind input hashes`);
  }

  const orphanR3 = await runHops({
    packageDir: fixture("pass-minimal-three"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(
    orphanR3.last.verdict !== "ACCEPT",
    "R3 cannot ACCEPT without earlier ACCEPT reports"
  );
  assert(
    failuresOf(orphanR3.last).some((id) => id.startsWith("prerequisite-")),
    "R3 without prior hops must fail prerequisites"
  );

  const repairChecks = [
    { id: "slop-lexicon", severity: "P1", status: "FAIL", detail: "x" },
  ];
  assert(decideVerdict(repairChecks) === "REPAIR", "P1-only fail is REPAIR, not ACCEPT");
  assert(
    decideVerdict([
      { id: "x", severity: "P0", status: "FAIL", detail: "x" },
      { id: "y", severity: "P1", status: "FAIL", detail: "y" },
    ]) === "REJECT",
    "P0 FAIL is REJECT and does not fall through to a judgment score"
  );

  const fetchMiss = await optionalFetch("https://127.0.0.1:1/", 200);
  assert(fetchMiss.error || fetchMiss.timedOut, "optional fetch must not throw");

  const named = {
    "test-report-forgery-rejected": await testReportForgeryRejected(),
    "test-report-binds-to-package-and-inputs": await testReportBindsToPackageAndInputs(),
    "test-stale-report-invalidated-on-input-change": await testStaleReportInvalidatedOnInputChange(),
    "test-ghost-profile-url-without-live-page-rejected": await testGhostProfileUrlWithoutLivePageRejected(),
    "test-fetch-profile-4xx-5xx-timeout-is-fail": await testFetchProfile4xx5xxTimeoutIsFail(),
    "test-waiver-detection-shape-variants": await testWaiverDetectionShapeVariants(),
    "test-skip-language-chinese-and-paraphrase": await testSkipLanguageChineseAndParaphrase(),
  };

  return {
    ok: true,
    fixtures: {
      "fail-skip-profile": skip.last.verdict,
      "fail-generic-homepage": home.last.verdict,
      "fail-missing-cl": missCl.last.verdict,
      "pass-minimal-three": pass.last.verdict,
    },
    named,
  };
}

module.exports = { runSelfTest, rulesetPin, REQUIRED_RULE_IDS };
