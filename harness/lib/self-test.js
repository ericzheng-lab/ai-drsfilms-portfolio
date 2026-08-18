"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { classifyProfileUrl } = require("./profile-url");
const { scanClaimLocks, scanSlop, findForbiddenWaivers } = require("./text-scan");
const { loadRuleset, runHops, optionalFetch } = require("./check");
const { decideVerdict } = require("./reports");

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

function failuresOf(report) {
  return (report.checks || [])
    .filter((c) => c.status === "FAIL")
    .map((c) => c.id);
}

function hasFail(report, idPrefix) {
  return failuresOf(report).some((id) => id === idPrefix || id.startsWith(idPrefix));
}

async function runSelfTest() {
  const { rules } = loadRuleset();
  const lexicon = (rules.rules.find((r) => r.id === "slop-lexicon") || {}).lexicon || [];

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

  assert(
    scanClaimLocks("Shipped Dungeon Fighter content.").some(
      (h) => h.id === "claim-lock-dungeon-fighter"
    ),
    "Dungeon Fighter without & must fail"
  );
  assert(
    scanClaimLocks("Shipped Dungeon & Fighter content.").every(
      (h) => h.id !== "claim-lock-dungeon-fighter"
    ),
    "Dungeon & Fighter must pass"
  );

  assert(
    scanClaimLocks("Grant of 1M RMB recorded.").some((h) => h.id === "claim-lock-rmb-cny"),
    "RMB must fail"
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

  return {
    ok: true,
    fixtures: {
      "fail-skip-profile": skip.last.verdict,
      "fail-generic-homepage": home.last.verdict,
      "fail-missing-cl": missCl.last.verdict,
      "pass-minimal-three": pass.last.verdict,
    },
  };
}

module.exports = { runSelfTest };
