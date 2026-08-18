"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { classifyProfileUrl } = require("./profile-url");
const {
  scanClaimLocks,
  scanSlop,
  findForbiddenWaivers,
  scanSkipLanguage,
} = require("./text-scan");
const { loadRuleset, runHops, optionalFetch } = require("./check");
const { loadPackage } = require("./manifest");
const {
  decideVerdict,
  GENERATOR,
  buildReport,
  writeReport,
  inputHashesFromPkg,
} = require("./reports");
const { REQUIRED_HOP_CHECKS, companySlug, bodyHasProfileMarker } = require("./hops");
const {
  PIN_PATH,
  REQUIRED_RULE_IDS,
  pinInputPaths,
  rulesetPin,
  expectedIntegrityPin,
} = require("./integrity");

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

function qualifyingFetchResult(company = "Acme", slug = "acme") {
  return {
    status: 200,
    timedOut: false,
    error: null,
    body: `<!DOCTYPE html><html><head><title>${company}</title></head><body><h1>${company}</h1><p>https://ai.drsfilms.com/${slug}/</p></body></html>`,
  };
}

function rulesetPinInputs() {
  return pinInputPaths();
}

function fakeHopChecks(hopId) {
  return (REQUIRED_HOP_CHECKS[hopId] || []).map((id) => ({
    id,
    severity: "P0",
    status: "PASS",
    detail: "forged pass",
  }));
}

function writeBoundReports(dir, hops, checksForHop) {
  const pkg = loadPackage({ packageDir: dir });
  const hashes = inputHashesFromPkg(pkg);
  const reportsDir = path.join(dir, "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const { version } = loadRuleset();
  for (const hop of hops) {
    writeReport(
      reportsDir,
      buildReport({
        hop,
        name: hop,
        ruleset: version,
        packageDir: dir,
        checks: checksForHop(hop),
        inputHashes: hashes,
      })
    );
  }
  return reportsDir;
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
    fetchResult: qualifyingFetchResult(),
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

async function testForgedReportWithRecomputedBindingRejected() {
  const dir = copyFixtureToTmp("pass-minimal-three");
  const reportsDir = writeBoundReports(dir, ["R0", "R-VI", "R1", "R1b", "R2"], () => []);
  const result = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(
    result.last.verdict === "REJECT",
    "empty-check reports with recomputed binding must REJECT R3"
  );
  assert(
    (result.last.checks || []).some(
      (c) =>
        c.id.startsWith("prerequisite-") &&
        c.status === "FAIL" &&
        /forged|empty|missing checks|do not match a real/i.test(c.detail)
    ),
    `recomputed-binding empty checks must fail prerequisites, got ${JSON.stringify(
      (result.last.checks || []).filter((c) => c.id.startsWith("prerequisite-"))
    )}`
  );
  return "REJECT";
}

async function testForgedReportWithFullshapedChecksRejected() {
  const dir = copyFixtureToTmp("pass-minimal-three");
  const reportsDir = writeBoundReports(dir, ["R0", "R-VI", "R1", "R1b", "R2"], fakeHopChecks);
  const result = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(
    result.last.verdict === "REJECT",
    "full-shaped id+PASS forged reports must REJECT R3"
  );
  assert(
    (result.last.checks || []).some(
      (c) =>
        c.id.startsWith("prerequisite-") &&
        c.status === "FAIL" &&
        /id\+PASS|stub|reproducible|evidence|forged/i.test(c.detail)
    ),
    `full-shaped forged checks must fail prerequisites, got ${JSON.stringify(
      (result.last.checks || []).filter((c) => c.id.startsWith("prerequisite-"))
    )}`
  );
  return "REJECT";
}

async function testR3RerunsViProvenance() {
  const dir = copyFixtureToTmp("pass-minimal-three");
  fs.writeFileSync(
    path.join(dir, "vi.json"),
    `${JSON.stringify({ note: "colors similar to Acme brand" }, null, 2)}\n`,
    "utf8"
  );
  const reportsDir = writeBoundReports(dir, ["R0", "R-VI", "R1", "R1b", "R2"], fakeHopChecks);
  const result = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(
    result.last.verdict === "REJECT",
    "R3 must REJECT garbage VI even if forged R-VI is ACCEPT"
  );
  assert(
    hasFail(result.last, "r3-vi-not-similar-to") ||
      hasFail(result.last, "r3-vi-source-url") ||
      hasFail(result.last, "r3-vi-hex") ||
      hasFail(result.last, "r3-vi-date") ||
      hasFail(result.last, "r3-vi-font") ||
      hasFail(result.last, "r3-vi-radius"),
    `R3 must independently re-verify VI provenance, got ${failuresOf(result.last)}`
  );
  return "REJECT";
}

async function testR3RescansClaimlockSlopOnCvCl() {
  const dir = copyFixtureToTmp("pass-minimal-three");
  fs.appendFileSync(
    path.join(dir, "cv.md"),
    "\nSundance winner. RMB 3M. Dungeon Fighter.\n",
    "utf8"
  );
  fs.appendFileSync(
    path.join(dir, "cl.md"),
    "\nA proven track record and cutting-edge process.\n",
    "utf8"
  );
  const reportsDir = writeBoundReports(
    dir,
    ["R0", "R-VI", "R1", "R1b", "R2"],
    fakeHopChecks
  );
  const result = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(
    result.last.verdict === "REJECT",
    "R3 must REJECT poisoned CV even when prior reports are bound ACCEPT"
  );
  assert(
    hasFail(result.last, "r3-cv-claim-lock-sundance-win") ||
      hasFail(result.last, "r3-cv-claim-lock-rmb-cny") ||
      hasFail(result.last, "r3-cv-claim-lock-dungeon-fighter"),
    `R3 must rescan CV claim-locks, got ${failuresOf(result.last)}`
  );
  assert(
    hasFail(result.last, "r3-cl-slop-lexicon"),
    `R3 must rescan CL slop, got ${failuresOf(result.last)}`
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
    fetchResult: qualifyingFetchResult(),
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
    fetchResult: qualifyingFetchResult("Graftco", "graftco"),
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
    fetchResult: qualifyingFetchResult(),
  });
  assert(pass.last.verdict === "ACCEPT", "stale-input must ACCEPT before mutation");
  fs.appendFileSync(path.join(dir, "cv.md"), "\nMutated after ACCEPT.\n", "utf8");
  const stale = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
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

async function testProfileRequiresDeploymentNotLocalHtml() {
  const r2 = await runHops({
    packageDir: fixture("pass-minimal-three"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(
    r2.last.verdict === "REJECT",
    "local HTML without live evidence must REJECT R2"
  );
  assert(
    hasFail(r2.last, "r2-profile-present"),
    `local-only Profile must fail r2-profile-present, got ${failuresOf(r2.last)}`
  );

  const r3 = await runHops({
    packageDir: fixture("pass-minimal-three"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(
    r3.last.verdict === "REJECT",
    "local HTML without live evidence must REJECT R3"
  );
  assert(
    hasFail(r3.last, "r3-profile-present") || hasFail(r3.last, "r3-three-live-pieces"),
    `local-only Profile must fail R3 closeout, got ${failuresOf(r3.last)}`
  );
  return "REJECT";
}

async function testLiveFetchRejectsSpaFallback() {
  const spa = {
    status: 200,
    timedOut: false,
    error: null,
    body: `<!DOCTYPE html><html><head><title>Portfolio</title></head><body><div id="root"></div><script src="/assets/index.js"></script></body></html>`,
  };
  const r2 = await runHops({
    packageDir: fixture("pass-minimal-three"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: spa,
  });
  assert(r2.last.verdict === "REJECT", "SPA 200 empty shell must REJECT R2");
  assert(
    hasFail(r2.last, "r2-profile-present") || hasFail(r2.last, "r2-live-fetch"),
    `SPA fallback must fail live Profile evidence, got ${failuresOf(r2.last)}`
  );
  assert(
    (r2.last.checks || []).some((c) => /SPA fallback|missing company\/slug marker/i.test(c.detail)),
    "SPA fallback detail must mention missing marker"
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

async function testWaiverDetectionNovelKeys() {
  const shapes = [
    { skip_artifacts: ["profile"] },
    { optional_deliverables: ["cover_letter"] },
    { omit: ["profile"] },
    { excluded: { profile: true } },
    { defer: ["专页"] },
    { profile: "optional" },
  ];
  for (const obj of shapes) {
    const hits = findForbiddenWaivers(obj);
    assert(hits.length > 0, `novel waiver key must be detected: ${JSON.stringify(obj)}`);
  }
  const required = findForbiddenWaivers({ artifacts: ["cv", "cover_letter", "profile"] });
  assert(
    required.length === 0,
    `required artifacts[] must not be treated as a waiver, got ${JSON.stringify(required)}`
  );
  return "REJECT";
}

const OPEN_VOCAB_SKIP_SAMPLES = [
  "Profile is out of scope for this engagement.",
  "We will defer the profile until the next cycle.",
  "Use the existing prompt-builder page in place of a dedicated profile.",
  "这次先不做公司专页，用主页代替。",
  "Profile 这轮先放一放。",
];

const SKIP_PATTERN_COVERAGE = [
  ["skip(ping)? (the )?(role[- ]specific )?profile", "Please skip the profile."],
  ["omit(ting)? (the )?(role[- ]specific )?profile", "We are omitting the profile."],
  ["no profile (needed|required|necessary)", "no profile needed"],
  ["(does not|doesn't|doesnt) need a profile", "does not need a profile"],
  ["waive[rd]? (the )?profile", "waive the profile"],
  ["profile[:\\s]+(n/?a|none|skipped|waived|optional|not needed)", "profile: optional"],
  ["skip(ping)? (the )?(cover letter|cl)\\b", "skip the cover letter"],
  ["omit(ting)? (the )?(cover letter|cl)\\b", "omit the cover letter"],
  ["no cover letter (needed|required|necessary)", "no cover letter needed"],
  ["(does not|doesn't|doesnt) need a (cover letter|cl)\\b", "does not need a cover letter"],
  ["waive[rd]? (the )?(cover letter|cl)\\b", "waive the cover letter"],
  ["(cover letter|cl)[:\\s]+(n/?a|none|skipped|waived|optional|not needed)", "cover letter: optional"],
  [
    "(leave out|drop|bypass|exclude|forgo|dispense with) (the )?(role[- ]specific )?(profile|cover letter|cl)\\b",
    "We can leave out the profile for this role.",
  ],
  [
    "(profile|cover letter) (is|are) (not )?(required|necessary|needed|optional)",
    "The cover letter is optional.",
  ],
  ["no need (for )?(a |the )?(role[- ]specific )?(profile|cover letter)", "No need for a cover letter."],
  [
    "(doesn't|does not|doesnt) (require|include) (a |the )?(role[- ]specific )?(profile|cover letter)",
    "doesn't require a profile",
  ],
  [
    "this role (does not|doesn't|doesnt) (need|require) (a )?(profile|cover letter)",
    "This role does not require a profile.",
  ],
  [
    "(profile|cover letter) (can|may|could) be (skipped|omitted|waived|dropped)",
    "profile can be skipped",
  ],
  ["without (a |the )?(role[- ]specific )?(profile|cover letter)\\b", "ship without a profile"],
  ["profile (not required|unnecessary|optional)", "profile not required"],
  ["cover letter (not required|unnecessary|optional)", "cover letter not required"],
  ["跳过.{0,16}(简介|角色页|作品页|profile|封面|求职信)", "本角色可以跳过简介，无需封面。"],
  ["省略.{0,16}(简介|角色页|作品页|profile|封面|求职信)", "不需要角色页，省略求职信。"],
  [
    "(不需要|无需|不用|不必).{0,16}(简介|角色页|作品页|profile|封面信|封面|求职信|cover letter)",
    "不需要角色页，省略求职信。",
  ],
  ["(简介|角色页|profile|封面信|求职信).{0,8}(可跳过|可省略|不需要|无需|可选)", "简介可跳过"],
  ["跳过(封面|求职信|简介)", "跳过封面"],
  ["无需(封面|求职信|简介)", "无需封面"],
  [
    "(profile|cover letter|role[- ]specific profile).{0,48}(out of scope|not in scope)",
    "Profile is out of scope for this engagement.",
  ],
  [
    "(out of scope|not in scope).{0,48}(profile|cover letter)",
    "Treat as out of scope: the profile.",
  ],
  [
    "(we will |will |we'll )?defer(ring)? (the )?(role[- ]specific )?(profile|cover letter)",
    "We will defer the profile until the next cycle.",
  ],
  [
    "(profile|cover letter).{0,32}(is |are )?(deferred|postponed)",
    "The profile is deferred this quarter.",
  ],
  [
    "(in place of|instead of).{0,40}(a |the )?(dedicated |role[- ]specific )?(profile|cover letter)",
    "Use the existing prompt-builder page in place of a dedicated profile.",
  ],
  [
    "use .{0,80}(in place of|instead of).{0,40}(a |the )?(dedicated )?(profile|cover letter)",
    "Use the existing prompt-builder page in place of a dedicated profile.",
  ],
  [
    "(prompt-builder|homepage|home page|main page).{0,48}(in place of|instead of).{0,32}(a |the )?(dedicated )?profile",
    "Use the existing prompt-builder page in place of a dedicated profile.",
  ],
  [
    "(profile|cover letter).{0,24}(this (round|cycle|pass)|for now|later)",
    "Hold the profile this round.",
  ],
  ["postpone.{0,40}(the )?(profile|cover letter)", "postpone the profile"],
  ["先不做.{0,20}(公司)?(专页|简介|角色页|profile|封面|求职信)", "这次先不做公司专页，用主页代替。"],
  [
    "(专页|公司专页|角色页|简介|profile).{0,16}(先不做|不做了|不要了|先放一放|放一放)",
    "Profile 这轮先放一放。",
  ],
  ["(这轮先|这次先).{0,16}(放一放|不做|省略|跳过|不要)", "Profile 这轮先放一放。"],
  ["用主页代替", "这次先不做公司专页，用主页代替。"],
  ["(用|使用).{0,12}(主页|首页|prompt-builder).{0,12}代替", "这次先不做公司专页，用主页代替。"],
  ["专页.{0,16}(可跳过|可省略|不需要|无需|可选|先放)", "专页可跳过"],
  [
    "nice[- ]to[- ]have.{0,40}(profile|cover letter|company page|role page|cl)\\b",
    "nice-to-have profile this round",
  ],
  [
    "(profile|cover letter|company page|role page).{0,32}nice[- ]to[- ]have",
    "The profile is a nice-to-have.",
  ],
  [
    "ship without (the )?(company page|role page|profile|cover letter|cl)\\b",
    "ship without the company page",
  ],
  ["without (the )?(company page|role page)\\b", "go without the role page"],
  [
    "(company page|role page)[:\\s]+(n/?a|none|skipped|waived|optional|not needed|nice[- ]to[- ]have)",
    "company page: optional",
  ],
  [
    "(skip|omit|waive|leave out|drop|bypass|exclude|forgo) (the )?(company page|role page)",
    "skip the company page",
  ],
  [
    "(company page|role page) (is|are) (not )?(required|necessary|needed|optional)",
    "The role page is optional.",
  ],
  [
    "(company page|role page) (can|may|could) be (skipped|omitted|waived|dropped)",
    "company page can be skipped",
  ],
  ["no need (for )?(a |the )?(company page|role page)", "No need for a role page."],
];

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

async function testSkipLanguageOpenVocabulary() {
  const { rules } = loadRuleset();
  const patterns =
    (rules.rules.find((r) => r.id === "brief-no-skip-language") || {}).patterns || [];
  for (const sample of OPEN_VOCAB_SKIP_SAMPLES) {
    const hits = scanSkipLanguage(sample, patterns);
    assert(hits.length > 0, `open-vocabulary skip language must match: ${sample}`);
  }
  return "REJECT";
}

async function rewritePackCompany(dir, { company, slug, aliases, profileUrl }) {
  const manifestPath = path.join(dir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.company = company;
  manifest.profile_url = profileUrl;
  if (aliases) manifest.company_aliases = aliases;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  for (const name of ["cv.md", "cl.md", "brief.md", "profile.html"]) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    let text = fs.readFileSync(file, "utf8");
    text = text.replace(/https:\/\/ai\.drsfilms\.com\/acme\//g, profileUrl);
    text = text.replace(/profile_route:\s*acme/g, `profile_route: ${slug}`);
    text = text.replace(/Acme/g, company);
    text = text.replace(/acme/g, slug);
    fs.writeFileSync(file, text, "utf8");
  }
}

async function testSlugMatchesCompanyAliasSet() {
  const good = copyFixtureToTmp("pass-minimal-three");
  await rewritePackCompany(good, {
    company: "Meta Platforms, Inc.",
    slug: "meta",
    aliases: ["meta"],
    profileUrl: "https://ai.drsfilms.com/meta/",
  });
  const goodLive = qualifyingFetchResult("Meta Platforms, Inc.", "meta");
  const ok = await runHops({
    packageDir: good,
    hops: ["R0", "R-VI", "R1", "R1b", "R2"],
    reportsDir: path.join(good, "reports"),
    stopOnFail: true,
    fetchResult: goodLive,
  });
  assert(ok.last.verdict === "ACCEPT", `Meta + /meta/ + aliases must ACCEPT R2, got ${ok.last.verdict}: ${(ok.last.failures || []).join("; ")}`);
  assert(
    (ok.last.checks || []).some(
      (c) => c.id === "profile-slug-matches-company" && c.status === "PASS"
    ),
    "alias set must PASS profile-slug-matches-company"
  );

  const bad = copyFixtureToTmp("pass-minimal-three");
  await rewritePackCompany(bad, {
    company: "Meta Platforms, Inc.",
    slug: "cloudflare",
    aliases: ["meta"],
    profileUrl: "https://ai.drsfilms.com/cloudflare/",
  });
  const wrong = await runHops({
    packageDir: bad,
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult("Meta Platforms, Inc.", "cloudflare"),
  });
  assert(wrong.last.verdict === "REJECT", "Meta pack pointing at /cloudflare/ must REJECT");
  assert(
    hasFail(wrong.last, "profile-slug-matches-company"),
    `wrong-company slug must fail alias set, got ${failuresOf(wrong.last)}`
  );
  return "ACCEPT";
}

async function testCompanyAliasesNotBuilderSelfCertified() {
  const steal = copyFixtureToTmp("pass-minimal-three");
  await rewritePackCompany(steal, {
    company: "Meta",
    slug: "cloudflare",
    aliases: ["cloudflare"],
    profileUrl: "https://ai.drsfilms.com/cloudflare/",
  });
  const stolen = await runHops({
    packageDir: steal,
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult("Meta", "cloudflare"),
  });
  assert(
    stolen.last.verdict === "REJECT",
    "Meta + aliases:[cloudflare] + /cloudflare/ must REJECT"
  );
  assert(
    hasFail(stolen.last, "profile-slug-matches-company"),
    `builder-self-certified foreign alias must fail, got ${failuresOf(stolen.last)}`
  );

  const legal = copyFixtureToTmp("pass-minimal-three");
  await rewritePackCompany(legal, {
    company: "Meta Platforms, Inc.",
    slug: "meta",
    aliases: ["meta"],
    profileUrl: "https://ai.drsfilms.com/meta/",
  });
  const ok = await runHops({
    packageDir: legal,
    hops: ["R0", "R-VI", "R1", "R1b", "R2"],
    reportsDir: path.join(legal, "reports"),
    stopOnFail: true,
    fetchResult: qualifyingFetchResult("Meta Platforms, Inc.", "meta"),
  });
  assert(
    ok.last.verdict === "ACCEPT",
    `Meta Platforms, Inc. + /meta/ must ACCEPT, got ${ok.last.verdict}: ${(ok.last.failures || []).join("; ")}`
  );
  return "REJECT";
}

async function testSkipLanguageNiceToHaveAndProfileSynonyms() {
  const { rules } = loadRuleset();
  const patterns =
    (rules.rules.find((r) => r.id === "brief-no-skip-language") || {}).patterns || [];
  const samples = [
    "The profile is a nice-to-have for this role.",
    "Cover letter is nice to have.",
    "We can ship without the company page.",
    "Skip the company page this cycle.",
    "The role page is optional.",
    "No need for a role page.",
  ];
  for (const sample of samples) {
    const hits = scanSkipLanguage(sample, patterns);
    assert(hits.length > 0, `skip language must match: ${sample}`);
  }
  return "REJECT";
}

function testRulesetPinCoversLibLogic() {
  assert(fs.existsSync(PIN_PATH), "integrity.pin must exist (git-tracked honesty pin, not an HSM)");
  const expected = expectedIntegrityPin();
  const pin = rulesetPin();
  assert(pin === expected, `ruleset integrity pin mismatch: got ${pin}`);
  const { libFiles, parts } = rulesetPinInputs();
  assert(libFiles.includes("hops.js"), "pin inputs must include hops.js");
  assert(libFiles.includes("text-scan.js"), "pin inputs must include text-scan.js");
  assert(libFiles.includes("reports.js"), "pin inputs must include reports.js");
  assert(libFiles.includes("integrity.js"), "pin inputs must include integrity.js");
  assert(libFiles.includes("check.js"), "pin inputs must include check.js");
  assert(!libFiles.includes("self-test.js"), "pin may exclude self-test.js");
  assert(
    parts.some((p) => p.endsWith(`${path.sep}hops.js`)),
    "pin parts must include lib/hops.js"
  );
  assert(
    parts.some((p) => p.endsWith(`${path.sep}integrity.js`)),
    "pin parts must include lib/integrity.js (pin comparison + assertion table)"
  );
  const integritySrc = fs.readFileSync(path.join(__dirname, "integrity.js"), "utf8");
  assert(
    /assertIntegrityPin/.test(integritySrc) && /REQUIRED_RULE_IDS/.test(integritySrc),
    "pin comparison and assertion table must live in pinned integrity.js"
  );
  const checkSrc = fs.readFileSync(path.join(__dirname, "check.js"), "utf8");
  assert(
    /assertIntegrityPin/.test(checkSrc),
    "loadRuleset must compare the pin (not only excluded self-test.js)"
  );
  const rulesOnly = crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(__dirname, "..", "rules", "rules.json")))
    .update("\n")
    .update(fs.readFileSync(path.join(__dirname, "..", "rules", "contracts.json")))
    .digest("hex");
  assert(rulesOnly !== expected, "pin must cover lib logic, not only rules+contracts");
  return "PASS";
}

function testLooseningAnyP0RuleBreaksSelftest() {
  const { rules } = loadRuleset();
  const p0 = (rules.rules || []).filter((r) => r.severity === "P0");
  for (const rule of p0) {
    assert(
      REQUIRED_RULE_IDS.includes(rule.id),
      `P0 rule ${rule.id} missing from REQUIRED_RULE_IDS dedicated assertion set`
    );
  }

  const skip = (rules.rules.find((r) => r.id === "brief-no-skip-language") || {}).patterns || [];
  const coveragePatterns = SKIP_PATTERN_COVERAGE.map((row) => row[0]);
  assert(
    JSON.stringify(skip) === JSON.stringify(coveragePatterns),
    `every skip regex needs a dedicated coverage sample (deleting one turns this red).\nrules: ${JSON.stringify(skip)}\ncoverage: ${JSON.stringify(coveragePatterns)}`
  );
  for (const [pattern, sample] of SKIP_PATTERN_COVERAGE) {
    const hits = scanSkipLanguage(sample, [pattern]);
    assert(hits.length > 0, `unused/broken skip regex: ${pattern} did not match: ${sample}`);
  }
  for (const sample of OPEN_VOCAB_SKIP_SAMPLES) {
    assert(
      scanSkipLanguage(sample, skip).length > 0,
      `open-vocab sample must keep matching: ${sample}`
    );
    assert(
      scanSkipLanguage(sample, []).length === 0,
      "empty skip list would miss open-vocab samples (loosening must be detectable)"
    );
  }

  const dedicated = {
    "no-profile-waiver": () =>
      assert(findForbiddenWaivers({ skip_artifacts: ["profile"] }).length > 0, "profile waiver"),
    "no-cl-waiver": () =>
      assert(
        findForbiddenWaivers({ optional_deliverables: ["cover_letter"] }).length > 0,
        "CL waiver"
      ),
    "brief-no-skip-language": () =>
      assert(
        scanSkipLanguage("Profile is out of scope.", skip).length > 0,
        "skip language"
      ),
    "profile-not-homepage": () =>
      assert(classifyProfileUrl("https://ai.drsfilms.com/").ok === false, "homepage"),
    "r3-three-live-pieces": () =>
      assert(
        (rules.rules || []).some((r) => r.id === "r3-three-live-pieces"),
        "r3 rule present"
      ),
    "portfolio-url-matches-profile": () =>
      assert(
        (rules.rules || []).some((r) => r.id === "portfolio-url-matches-profile"),
        "portfolio rule present"
      ),
    "claim-lock-sundance-win": () =>
      assert(
        scanClaimLocks("Sundance winner").some((h) => h.id === "claim-lock-sundance-win"),
        "sundance"
      ),
    "claim-lock-berlinale-win": () =>
      assert(
        scanClaimLocks("Berlinale winner").some((h) => h.id === "claim-lock-berlinale-win"),
        "berlinale"
      ),
    "claim-lock-dungeon-fighter": () =>
      assert(
        scanClaimLocks("Dungeon Fighter").some((h) => h.id === "claim-lock-dungeon-fighter"),
        "dungeon"
      ),
    "claim-lock-rmb-cny": () =>
      assert(scanClaimLocks("RMB 3M").some((h) => h.id === "claim-lock-rmb-cny"), "rmb"),
    "claim-lock-p007": () =>
      assert(scanClaimLocks("Launched P007").some((h) => h.id === "claim-lock-p007"), "p007"),
    "claim-lock-five-films-four-weeks": () =>
      assert(
        scanClaimLocks("5 films in 4 weeks").some(
          (h) => h.id === "claim-lock-five-films-four-weeks"
        ),
        "five films"
      ),
  };
  for (const id of REQUIRED_RULE_IDS.filter((x) => x !== "slop-lexicon")) {
    assert(typeof dedicated[id] === "function", `missing dedicated P0 assertion for ${id}`);
    dedicated[id]();
  }
  return "PASS";
}

async function runSelfTest() {
  const { rules, contracts } = loadRuleset();
  const lexicon = (rules.rules.find((r) => r.id === "slop-lexicon") || {}).lexicon || [];

  const pin = rulesetPin();
  assert(
    pin === expectedIntegrityPin(),
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

  const metaPkg = {
    manifest: { company: "Meta", profile_url: "https://ai.drsfilms.com/meta/" },
  };
  assert(
    bodyHasProfileMarker(
      "<html><head><title>Site</title></head><body>See metadata and other metadata.</body></html>",
      metaPkg
    ).ok === false,
    "Meta must not match metadata as a bare substring"
  );
  assert(
    bodyHasProfileMarker(
      '<html><p>https://ai.drsfilms.com/meta/</p></html>',
      metaPkg
    ).ok === true,
    "path identity /meta/ is a dedicated-profile marker"
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
    fetchResult: qualifyingFetchResult(),
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
    fetchResult: qualifyingFetchResult(),
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

  assert(companySlug("Meta Platforms, Inc.") === "meta-platforms-inc", "slugify legal name");

  const named = {
    "test-report-forgery-rejected": await testReportForgeryRejected(),
    "test-forged-report-with-recomputed-binding-rejected":
      await testForgedReportWithRecomputedBindingRejected(),
    "test-forged-report-with-fullshaped-checks-rejected":
      await testForgedReportWithFullshapedChecksRejected(),
    "test-r3-reruns-vi-provenance": await testR3RerunsViProvenance(),
    "test-r3-rescans-claimlock-slop-on-cv-cl": await testR3RescansClaimlockSlopOnCvCl(),
    "test-report-binds-to-package-and-inputs": await testReportBindsToPackageAndInputs(),
    "test-stale-report-invalidated-on-input-change": await testStaleReportInvalidatedOnInputChange(),
    "test-ghost-profile-url-without-live-page-rejected":
      await testGhostProfileUrlWithoutLivePageRejected(),
    "test-profile-requires-deployment-not-local-html":
      await testProfileRequiresDeploymentNotLocalHtml(),
    "test-live-fetch-rejects-spa-fallback": await testLiveFetchRejectsSpaFallback(),
    "test-fetch-profile-4xx-5xx-timeout-is-fail": await testFetchProfile4xx5xxTimeoutIsFail(),
    "test-waiver-detection-shape-variants": await testWaiverDetectionShapeVariants(),
    "test-waiver-detection-novel-keys": await testWaiverDetectionNovelKeys(),
    "test-skip-language-chinese-and-paraphrase": await testSkipLanguageChineseAndParaphrase(),
    "test-skip-language-open-vocabulary": await testSkipLanguageOpenVocabulary(),
    "test-slug-matches-company-alias-set": await testSlugMatchesCompanyAliasSet(),
    "test-company-aliases-not-builder-self-certified":
      await testCompanyAliasesNotBuilderSelfCertified(),
    "test-skip-language-nice-to-have-and-profile-synonyms":
      await testSkipLanguageNiceToHaveAndProfileSynonyms(),
    "test-ruleset-pin-covers-lib-logic": testRulesetPinCoversLibLogic(),
    "test-loosening-any-p0-rule-breaks-selftest": testLooseningAnyP0RuleBreaksSelftest(),
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
