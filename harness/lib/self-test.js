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
  HASH_KEYS,
  buildReport,
  writeReport,
  inputHashesFromPkg,
  computeBinding,
  canonicalPackageDir,
  validatePrerequisiteReport,
} = require("./reports");
const {
  REQUIRED_HOP_CHECKS,
  HOP_RUNNERS,
  companySlug,
  bodyHasProfileMarker,
} = require("./hops");
const {
  htmlHasWorkImages,
  firstViewportHasStill,
  firstStillIsEarly,
  htmlHasEnoughStills,
  hasTraditionalCredits,
  traditionalLeads,
  aiFilmOrderOk,
  vimeoEmbedInCard,
  oldShellIsGone,
  isRoleProfileNotHomepage,
  workColumnMaxWidthOk,
  isStillFirstPage,
  firstViewportIsStillLed,
} = require("./profile-images");
const {
  viHasUsage,
  primaryAppliedAsField,
  primaryHexFromVi,
  viNotChromeOnly,
} = require("./vi-apply");
const {
  showreelIsPicture,
  creditsNotLegalParagraph,
  noInternalAssetIds,
  invocationOk,
  noEmptyWhiteWorkCards,
  brandStillsNotWordmarks,
  sixStageOneGraphic,
} = require("./profile-cards");
const {
  outwardImagesCleared,
  fiftyEightNodeRouteOk,
  dev4NotHung,
  pLedNoPbGallery,
} = require("./asset-clearance");
const { recentBarOk, sameSlugSet } = require("./profile-recent-bar");
const {
  firstViewportIsFrame,
  noResumeMasthead,
  noTypeSlabWorkSlot,
  leadMediaCleared,
} = require("./profile-frame");
const {
  briefPageSlotsOk,
  briefLeadMatchesArchetype,
  briefLeadAssetsClearable,
  profileFollowsBriefSlots,
  categorize,
  pLedLeadNotFilmSlate,
  pLedAiMustNotDominate,
} = require("./brief-slots");
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
  const img = (alt) =>
    `<img src="https://ai.drsfilms.com/${slug}/work-still.png" alt="${alt}" width="640" height="360">`;
  return {
    status: 200,
    timedOut: false,
    error: null,
    body: `<!DOCTYPE html><html><head><meta name="robots" content="noindex"><title>${company} Senior Producer</title><style>.wordmark{max-height:48px;height:48px;background:#1A2B3C;color:#fff;padding:8px 16px;font-size:16px}.wrap{width:min(1120px, calc(100% - 40px));margin:0 auto}.lead-frame iframe{display:block;width:100%;min-height:calc(100vh - 56px);border:0}.brand-field{background:#1A2B3C;color:#fff;min-height:72px;padding:24px;margin:24px 0}.reel-poster{aspect-ratio:21/9;width:100%}</style></head><body><header class="wordmark">${company}</header><div class="wrap"><div class="lead-frame"><iframe src="https://player.vimeo.com/video/1174467043?background=1&autoplay=1" title="Traditional showreel"></iframe></div><p>Brief History of a Family. One Click Mute. Manga Cut. DoomBrush.</p>${img(company + " selected work still")}${img("One Click Mute still")}${img("Manga Cut still")}${img("DoomBrush still")}<div class="brand-field">Field</div><h1>${company} Senior Producer</h1><p>https://ai.drsfilms.com/${slug}/</p><article class="work-card"><img class="reel-poster" src="https://ai.drsfilms.com/${slug}/work-still.png" alt="Traditional showreel still" width="840" height="360"><span class="play">Play</span><iframe src="https://player.vimeo.com/video/1174467043" title="Traditional showreel"></iframe></article><figure><img src="https://ai.drsfilms.com/${slug}/workflow-6stage.svg" alt="Six-stage production method"><figcaption class="footnote">Locked six-stage method.</figcaption></figure></div></body></html>`,
  };
}

function fixtureFetchResult(name) {
  const dir = fixture(name);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
  const htmlPath = path.join(dir, "profile.html");
  let body = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";
  const url = String(manifest.profile_url || "https://ai.drsfilms.com/acme/");
  const slug =
    url
      .replace(/^https?:\/\/ai\.drsfilms\.com\//i, "")
      .replace(/\/+$/, "")
      .split("/")[0] || "acme";
  const marker = `ai.drsfilms.com/${slug}`;
  if (body && !body.toLowerCase().includes(marker.toLowerCase())) {
    const tag = `<p>https://ai.drsfilms.com/${slug}/</p>`;
    body = /<\/body>/i.test(body)
      ? body.replace(/<\/body>/i, `${tag}</body>`)
      : `${body}${tag}`;
  }
  return { status: 200, timedOut: false, error: null, body };
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

function forgeAcceptReport({ hop, name, ruleset, packageDir, checks, inputHashes }) {
  const package_dir = canonicalPackageDir(packageDir);
  const input_hashes = {};
  for (const key of HASH_KEYS) {
    input_hashes[key] = (inputHashes && inputHashes[key]) || null;
  }
  const report = {
    generator: GENERATOR,
    hop,
    name: name || hop,
    verdict: "ACCEPT",
    ruleset,
    generated_at: new Date().toISOString(),
    package_dir,
    input_hashes,
    checks,
    failures: (checks || [])
      .filter((c) => c.status === "FAIL")
      .map((c) => `${c.id}: ${c.detail}`),
  };
  report.binding = computeBinding(report);
  return report;
}

function writeLiveHopReports(dir, hops, { forgeAcceptHops = [], fetchResult } = {}) {
  const pkg = loadPackage({ packageDir: dir });
  const hashes = inputHashesFromPkg(pkg);
  const reportsDir = path.join(dir, "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const { rules, version } = loadRuleset();
  for (const hop of hops) {
    const checks = HOP_RUNNERS[hop](pkg, rules, { fetchResult });
    if (forgeAcceptHops.includes(hop)) {
      writeReport(
        reportsDir,
        forgeAcceptReport({
          hop,
          name: hop,
          ruleset: version,
          packageDir: dir,
          checks,
          inputHashes: hashes,
        })
      );
    } else {
      writeReport(
        reportsDir,
        buildReport({
          hop,
          name: hop,
          ruleset: version,
          packageDir: dir,
          checks,
          inputHashes: hashes,
        })
      );
    }
  }
  return reportsDir;
}

function emptyBriefSelectedWorkIds(dir) {
  const briefPath = path.join(dir, "brief.md");
  let text = fs.readFileSync(briefPath, "utf8");
  text = text.replace(/selected_work_ids:\s*\n(?:\s+-\s+.+\n)*/m, "selected_work_ids: []\n");
  text = text.replace(/\bwork-[A-Za-z0-9._-]+/g, "item-synth");
  fs.writeFileSync(briefPath, text, "utf8");
}

async function testVerdictMustBeDerivedFromChecks() {
  const dir = copyFixtureToTmp("pass-minimal-three");
  emptyBriefSelectedWorkIds(dir);
  const pkg = loadPackage({ packageDir: dir });
  const { rules, version } = loadRuleset();
  const live = HOP_RUNNERS.R0(pkg, rules, {});
  assert(decideVerdict(live) !== "ACCEPT", "broken brief live R0 must not ACCEPT");
  assert(
    live.some((c) => c.id === "brief-selected-work-ids" && c.status === "FAIL"),
    "broken brief must FAIL brief-selected-work-ids"
  );
  const forged = forgeAcceptReport({
    hop: "R0",
    name: "Brief",
    ruleset: version,
    packageDir: dir,
    checks: live,
    inputHashes: inputHashesFromPkg(pkg),
  });
  assert(forged.verdict === "ACCEPT", "forged report self-certifies ACCEPT");
  assert(forged.binding === computeBinding(forged), "forged report has recomputed public binding");
  assert(decideVerdict(forged.checks) !== "ACCEPT", "copied live checks must not derive ACCEPT");
  const validation = validatePrerequisiteReport(forged, "R0", pkg, live);
  assert(!validation.ok, "prereq must reject when derived verdict is not ACCEPT");
  assert(
    /derived verdict/i.test(validation.reason),
    `prereq reason must cite derived verdict, got ${validation.reason}`
  );
  return "REJECT";
}

async function testForgedPrereqWithReproducedFailRejected() {
  const dir = copyFixtureToTmp("pass-minimal-three");
  emptyBriefSelectedWorkIds(dir);
  const fetchResult = qualifyingFetchResult();
  const reportsDir = writeLiveHopReports(dir, ["R0", "R-VI", "R1", "R1b", "R2"], {
    forgeAcceptHops: ["R0"],
    fetchResult,
  });
  const r0 = JSON.parse(fs.readFileSync(path.join(reportsDir, "R0.json"), "utf8"));
  assert(r0.verdict === "ACCEPT", "forged R0 self-certifies ACCEPT");
  assert(
    (r0.checks || []).some((c) => c.id === "brief-selected-work-ids" && c.status === "FAIL"),
    "forged R0 must reproduce the live brief-selected-work-ids FAIL"
  );
  const result = await runHops({
    packageDir: dir,
    hops: ["R3"],
    reportsDir,
    stopOnFail: false,
    fetchResult,
  });
  assert(
    result.last.verdict === "REJECT",
    "forged prereq that copies live FAILs + ACCEPT + binding must REJECT R3"
  );
  assert(
    (result.last.checks || []).some(
      (c) =>
        c.id === "prerequisite-R0" &&
        c.status === "FAIL" &&
        /derived verdict|live hop derives/i.test(c.detail)
    ),
    `forged reproduced-fail R0 must fail prerequisite-R0, got ${JSON.stringify(
      (result.last.checks || []).filter((c) => c.id.startsWith("prerequisite-"))
    )}`
  );
  return "REJECT";
}

async function testR0R1R2OnlyGatesSurviveForgedPrereq() {
  const fetchResult = qualifyingFetchResult();

  const briefDir = copyFixtureToTmp("pass-minimal-three");
  emptyBriefSelectedWorkIds(briefDir);
  const briefReports = writeLiveHopReports(briefDir, ["R0", "R-VI", "R1", "R1b", "R2"], {
    forgeAcceptHops: ["R0"],
    fetchResult,
  });
  const briefR3 = await runHops({
    packageDir: briefDir,
    hops: ["R3"],
    reportsDir: briefReports,
    stopOnFail: false,
    fetchResult,
  });
  assert(
    briefR3.last.verdict === "REJECT",
    "broken brief + forged R0 ACCEPT must still REJECT closeout"
  );
  assert(
    (briefR3.last.checks || []).some(
      (c) => c.id === "prerequisite-R0" && c.status === "FAIL"
    ),
    `broken brief closeout must fail prerequisite-R0, got ${failuresOf(briefR3.last)}`
  );

  const cvDir = copyFixtureToTmp("pass-minimal-three");
  const cvPath = path.join(cvDir, "cv.md");
  let cv = fs.readFileSync(cvPath, "utf8");
  cv = cv.replace("https://ai.drsfilms.com/acme/", "https://ai.drsfilms.com/");
  cv += "\nAlso see https://ai.drsfilms.com/acme/\n";
  fs.writeFileSync(cvPath, cv, "utf8");
  const cvReports = writeLiveHopReports(cvDir, ["R0", "R-VI", "R1", "R1b", "R2"], {
    forgeAcceptHops: ["R1"],
    fetchResult,
  });
  const liveR1 = HOP_RUNNERS.R1(
    loadPackage({ packageDir: cvDir }),
    loadRuleset().rules,
    {}
  );
  assert(
    liveR1.some((c) => c.id === "cv-header-not-homepage" && c.status === "FAIL"),
    "homepage CV header must FAIL cv-header-not-homepage"
  );
  const cvR3 = await runHops({
    packageDir: cvDir,
    hops: ["R3"],
    reportsDir: cvReports,
    stopOnFail: false,
    fetchResult,
  });
  assert(
    cvR3.last.verdict === "REJECT",
    "homepage CV header + forged R1 ACCEPT must still REJECT closeout"
  );
  assert(
    (cvR3.last.checks || []).some(
      (c) => c.id === "prerequisite-R1" && c.status === "FAIL"
    ),
    `homepage CV header closeout must fail prerequisite-R1, got ${failuresOf(cvR3.last)}`
  );

  const htmlDir = copyFixtureToTmp("pass-minimal-three");
  const htmlPath = path.join(htmlDir, "profile.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  html = html.replace(/\s*<meta name="robots" content="noindex" \/>\s*/i, "\n");
  fs.writeFileSync(htmlPath, html, "utf8");
  const fetchMissingNoindex = {
    ...fetchResult,
    body: String(fetchResult.body || "").replace(
      /\s*<meta name="robots" content="noindex"\s*\/?>\s*/i,
      "\n"
    ),
  };
  const htmlReports = writeLiveHopReports(htmlDir, ["R0", "R-VI", "R1", "R1b", "R2"], {
    forgeAcceptHops: ["R2"],
    fetchResult: fetchMissingNoindex,
  });
  const liveR2 = HOP_RUNNERS.R2(
    loadPackage({ packageDir: htmlDir }),
    loadRuleset().rules,
    { fetchResult: fetchMissingNoindex }
  );
  assert(
    liveR2.some((c) => c.id === "r2-html-noindex" && c.status === "FAIL"),
    "missing noindex must FAIL r2-html-noindex"
  );
  assert(
    decideVerdict(liveR2) !== "ACCEPT",
    "missing noindex live R2 must not derive ACCEPT"
  );
  const htmlR3 = await runHops({
    packageDir: htmlDir,
    hops: ["R3"],
    reportsDir: htmlReports,
    stopOnFail: false,
    fetchResult: fetchMissingNoindex,
  });
  assert(
    htmlR3.last.verdict === "REJECT",
    "R2 HTML missing noindex + forged R2 ACCEPT must still REJECT closeout"
  );
  assert(
    (htmlR3.last.checks || []).some(
      (c) => c.id === "prerequisite-R2" && c.status === "FAIL"
    ),
    `missing noindex closeout must fail prerequisite-R2, got ${failuresOf(htmlR3.last)}`
  );
  return "REJECT";
}

async function testAliasPrefixCollision() {
  const dir = copyFixtureToTmp("pass-minimal-three");
  await rewritePackCompany(dir, {
    company: "Metaphor Inc",
    slug: "meta",
    aliases: ["meta"],
    profileUrl: "https://ai.drsfilms.com/meta/",
  });
  const stolen = await runHops({
    packageDir: dir,
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult("Metaphor Inc", "meta"),
  });
  assert(
    stolen.last.verdict === "REJECT",
    "Metaphor Inc + aliases meta + /meta/ must REJECT"
  );
  assert(
    hasFail(stolen.last, "profile-slug-matches-company"),
    `alias prefix collision must fail profile-slug-matches-company, got ${failuresOf(stolen.last)}`
  );
  return "REJECT";
}

async function testLiveMarkerMustBeDedicatedRoute() {
  const pkg = loadPackage({ packageDir: fixture("pass-minimal-three") });
  const wordOnly = {
    status: 200,
    timedOut: false,
    error: null,
    body: "<!DOCTYPE html><html><head><title>Home</title></head><body><h1>Welcome</h1><p>We sometimes mention Acme on this same-host page.</p></body></html>",
  };
  assert(
    bodyHasProfileMarker(wordOnly.body, pkg).ok === false,
    "same-host page that only mentions the company word is not a dedicated profile"
  );
  const withPath = qualifyingFetchResult();
  assert(
    bodyHasProfileMarker(withPath.body, pkg).ok === true,
    "dedicated /acme/ path identity remains a profile marker"
  );
  const r2 = await runHops({
    packageDir: fixture("pass-minimal-three"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: wordOnly,
  });
  assert(r2.last.verdict === "REJECT", "company-word-only live page must REJECT R2");
  assert(
    hasFail(r2.last, "r2-live-fetch") || hasFail(r2.last, "r2-profile-present"),
    `company-word-only live page must fail live evidence, got ${failuresOf(r2.last)}`
  );
  return "REJECT";
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
      hasFail(result.last, "r3-vi-radius") ||
      hasFail(result.last, "r3-vi-usage"),
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

function liveChecksOf(report) {
  return (report.checks || []).filter((c) => !String(c.id).startsWith("verify-r3-"));
}

async function testVerifyModeRederivesR3() {
  const fetchResult = qualifyingFetchResult();

  const handwrittenDir = copyFixtureToTmp("pass-minimal-three");
  const handwrittenReports = path.join(handwrittenDir, "reports");
  const handwrittenChain = await runHops({
    packageDir: handwrittenDir,
    hops: ["R0", "R-VI", "R1", "R1b", "R2", "R3"],
    reportsDir: handwrittenReports,
    fetchResult,
  });
  assert(handwrittenChain.last.verdict === "ACCEPT", "setup chain must ACCEPT before handwritten overwrite");
  fs.writeFileSync(
    path.join(handwrittenReports, "R3.json"),
    `${JSON.stringify({ verdict: "ACCEPT" }, null, 2)}\n`,
    "utf8"
  );
  const handwritten = await runHops({
    packageDir: handwrittenDir,
    hops: ["R3"],
    reportsDir: handwrittenReports,
    stopOnFail: false,
    fetchResult,
    verify: true,
  });
  assert(
    handwritten.last.verdict === "REJECT",
    "handwritten reports/R3.json verdict ACCEPT must fail --verify"
  );
  assert(
    hasFail(handwritten.last, "verify-r3-harness-generated"),
    `handwritten R3 must fail harness-generated check, got ${failuresOf(handwritten.last)}`
  );
  assert(
    decideVerdict(liveChecksOf(handwritten.last)) === "ACCEPT",
    "live R3 must ACCEPT so --verify fail is from the handwritten disk file"
  );

  const missDir = copyFixtureToTmp("pass-minimal-three");
  const missReports = path.join(missDir, "reports");
  await runHops({
    packageDir: missDir,
    hops: ["R0", "R-VI", "R1", "R1b", "R2"],
    reportsDir: missReports,
    fetchResult,
  });
  const missing = await runHops({
    packageDir: missDir,
    hops: ["R3"],
    reportsDir: missReports,
    stopOnFail: false,
    fetchResult,
    verify: true,
  });
  assert(missing.last.verdict === "REJECT", "missing reports/R3.json must fail --verify");
  assert(
    hasFail(missing.last, "verify-r3-disk-present"),
    `missing R3 must fail disk-present, got ${failuresOf(missing.last)}`
  );

  const disagreeDir = copyFixtureToTmp("pass-minimal-three");
  const disagreeReports = path.join(disagreeDir, "reports");
  const disagreeChain = await runHops({
    packageDir: disagreeDir,
    hops: ["R0", "R-VI", "R1", "R1b", "R2", "R3"],
    reportsDir: disagreeReports,
    fetchResult,
  });
  assert(disagreeChain.last.verdict === "ACCEPT", "disagree setup chain must ACCEPT");
  fs.appendFileSync(path.join(disagreeDir, "cv.md"), "\nSundance winner.\n", "utf8");
  const disagree = await runHops({
    packageDir: disagreeDir,
    hops: ["R3"],
    reportsDir: disagreeReports,
    stopOnFail: false,
    fetchResult,
    verify: true,
  });
  assert(
    disagree.last.verdict === "REJECT",
    "disk ACCEPT that disagrees with live derive must fail --verify"
  );
  assert(
    hasFail(disagree.last, "verify-r3-verdict-matches-live"),
    `disk-vs-live disagreement must fail, got ${failuresOf(disagree.last)}`
  );
  assert(
    decideVerdict(liveChecksOf(disagree.last)) !== "ACCEPT",
    "live derive after CV poison must not ACCEPT"
  );

  const realDir = copyFixtureToTmp("pass-minimal-three");
  const realReports = path.join(realDir, "reports");
  const real = await runHops({
    packageDir: realDir,
    hops: ["R0", "R-VI", "R1", "R1b", "R2", "R3"],
    reportsDir: realReports,
    fetchResult,
  });
  assert(real.last.verdict === "ACCEPT", "real ACCEPT package setup must ACCEPT");
  const verified = await runHops({
    packageDir: realDir,
    hops: ["R3"],
    reportsDir: realReports,
    fetchResult,
    verify: true,
  });
  assert(verified.last.verdict === "ACCEPT", "real ACCEPT package must pass --verify");
  assert(
    decideVerdict(liveChecksOf(verified.last)) === "ACCEPT",
    "--verify must re-derive ACCEPT from live checks"
  );
  assert(
    !failuresOf(verified.last).some((id) => id.startsWith("verify-r3-")),
    `real ACCEPT --verify checks must PASS, got ${failuresOf(verified.last)}`
  );
  return "PASS";
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

async function testEmptyHeroProfileRejected() {
  const fetchResult = fixtureFetchResult("fail-empty-hero-profile");
  const r2 = await runHops({
    packageDir: fixture("fail-empty-hero-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult,
  });
  assert(r2.last.verdict === "REJECT", "78vh empty hero must REJECT R2");
  assert(
    hasFail(r2.last, "r2-profile-first-viewport-is-frame"),
    `empty hero must fail r2-profile-first-viewport-is-frame, got ${failuresOf(r2.last)}`
  );
  assert(
    !hasFail(r2.last, "r2-profile-work-images"),
    "empty-hero fixture still has a later work image; fail must be the spacer, not zero stills"
  );

  const gs18 = `<style>.hero{min-height:78vh;display:flex;align-items:center;padding:72px 0 56px}</style><header class="hero"><h1>Concept through delivery.</h1></header><img src="https://vumbnail.com/1172739705.jpg" alt="later">`;
  assert(
    firstViewportHasStill(gs18).ok === false,
    "Giant Spoon #18 spacer pattern must fail first-viewport still"
  );
  const rebuiltLead = `<nav class="site-nav"></nav><a class="lead-still"><img src="stills/one-click-mute-key-frame-01.jpg" alt="One Click Mute film still"></a>`;
  assert(
    firstViewportHasStill(rebuiltLead).ok === true,
    "lead still without hero spacer must pass"
  );
  return "REJECT";
}

async function testLateStillsProfileRejected() {
  const fetchResult = fixtureFetchResult("fail-late-stills-profile");
  const r2 = await runHops({
    packageDir: fixture("fail-late-stills-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult,
  });
  assert(r2.last.verdict === "REJECT", "type-only open with later stills must REJECT R2");
  assert(
    hasFail(r2.last, "r2-profile-still-early"),
    `late stills must fail r2-profile-still-early, got ${failuresOf(r2.last)}`
  );
  assert(
    !hasFail(r2.last, "r2-profile-work-images"),
    "late-stills fixture has four real images; fail must be timing, not zero stills"
  );
  return "REJECT";
}

async function testPatchedShellAndHomepageSkinRejected() {
  const patched = await runHops({
    packageDir: fixture("fail-patched-shell-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-patched-shell-profile"),
  });
  assert(patched.last.verdict === "REJECT", "patched #18 shell must REJECT R2");
  assert(
    hasFail(patched.last, "r2-profile-not-old-shell"),
    `patched shell must fail r2-profile-not-old-shell, got ${failuresOf(patched.last)}`
  );

  const home = await runHops({
    packageDir: fixture("fail-homepage-skin-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-homepage-skin-profile"),
  });
  assert(home.last.verdict === "REJECT", "homepage skin must REJECT R2");
  assert(
    hasFail(home.last, "r2-profile-not-homepage-skin"),
    `homepage skin must fail r2-profile-not-homepage-skin, got ${failuresOf(home.last)}`
  );
  return "REJECT";
}

async function testNamedCareerWorkSampleRejected() {
  const cases = [
    ["fail-ai-only-profile", "r2-profile-traditional-credits", "AI-only stack"],
    ["fail-ai-lead-profile", "r2-profile-traditional-lead", "AI lead"],
    ["fail-ai-order-profile", "r2-profile-ai-film-order", "swapped AI order"],
    ["fail-folded-vimeo-profile", "r2-profile-vimeo-in-card", "folded Vimeo"],
  ];
  for (const [name, checkId, label] of cases) {
    const r2 = await runHops({
      packageDir: fixture(name),
      hops: ["R2"],
      reportsDir: tmpReports(),
      stopOnFail: false,
      fetchResult: fixtureFetchResult(name),
    });
    assert(r2.last.verdict === "REJECT", `${label} must REJECT R2`);
    assert(
      hasFail(r2.last, checkId),
      `${label} must fail ${checkId}, got ${failuresOf(r2.last)}`
    );
  }
  return "REJECT";
}

async function testThinStackProfileRejected() {
  const fetchResult = fixtureFetchResult("fail-thin-stack-profile");
  const r2 = await runHops({
    packageDir: fixture("fail-thin-stack-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult,
  });
  assert(r2.last.verdict === "REJECT", "two-film stack must REJECT R2");
  assert(
    hasFail(r2.last, "r2-profile-still-count"),
    `thin stack must fail r2-profile-still-count, got ${failuresOf(r2.last)}`
  );
  assert(
    !hasFail(r2.last, "r2-profile-work-images"),
    "thin-stack fixture has real images; fail must be count, not zero stills"
  );
  return "REJECT";
}

async function testTextOnlyProfileRejected() {
  const fetchResult = fixtureFetchResult("fail-text-only-profile");
  const r2 = await runHops({
    packageDir: fixture("fail-text-only-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult,
  });
  assert(r2.last.verdict === "REJECT", "text-only Profile must REJECT R2");
  assert(
    hasFail(r2.last, "r2-profile-work-images"),
    `text-only Profile must fail r2-profile-work-images, got ${failuresOf(r2.last)}`
  );

  const liveText = {
    status: 200,
    timedOut: false,
    error: null,
    body: `<!DOCTYPE html><html><head><title>Acme</title></head><body><h1>Acme</h1><p>https://ai.drsfilms.com/acme/</p><p>Resume text only. No stills.</p></body></html>`,
  };
  const liveOnly = await runHops({
    packageDir: fixture("fail-text-only-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: liveText,
  });
  assert(liveOnly.last.verdict === "REJECT", "text-only live Profile must REJECT R2");
  assert(
    hasFail(liveOnly.last, "r2-profile-work-images"),
    `text-only live Profile must fail r2-profile-work-images, got ${failuresOf(liveOnly.last)}`
  );

  assert(htmlHasWorkImages("").ok === false, "empty HTML is not work images");
  assert(
    htmlHasWorkImages('<img src="" alt="x">').ok === false,
    "empty src is not a work image"
  );
  assert(
    htmlHasWorkImages('<img src="placeholder.png" alt="x">').ok === false,
    "placeholder src is not a work image"
  );
  assert(
    htmlHasWorkImages(
      '<img src="https://ai.drsfilms.com/acme/work-still.png" alt="Acme still">'
    ).ok === true,
    "http still must count"
  );
  return "REJECT";
}

async function testViTokenOnlyRejected() {
  const rvi = await runHops({
    packageDir: fixture("fail-vi-token-only"),
    hops: ["R-VI"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(rvi.last.verdict === "REJECT", "Giant Spoon-like tokens without usage must REJECT R-VI");
  assert(
    hasFail(rvi.last, "vi-usage"),
    `token-only VI must fail vi-usage, got ${failuresOf(rvi.last)}`
  );

  const rec = JSON.parse(
    fs.readFileSync(path.join(fixture("fail-vi-token-only"), "vi.json"), "utf8")
  );
  assert(viHasUsage(rec).ok === false, "hex/font without usage notes is token-only");
  return "REJECT";
}

async function testViChromeOnlyRejected() {
  const cases = [
    ["fail-vi-chrome-only", "vi-not-chrome-only", "chrome-only GS distill"],
    ["fail-vi-home-hero-brand", "vi-not-chrome-only", "home hero treated as the brand"],
  ];
  for (const [name, checkId, label] of cases) {
    const rvi = await runHops({
      packageDir: fixture(name),
      hops: ["R-VI"],
      reportsDir: tmpReports(),
      stopOnFail: false,
    });
    assert(rvi.last.verdict === "REJECT", `${label} must REJECT R-VI`);
    assert(
      hasFail(rvi.last, checkId),
      `${label} must fail ${checkId}, got ${failuresOf(rvi.last)}`
    );
    assert(
      !hasFail(rvi.last, "vi-usage"),
      `${label} has chrome usage; fail must not be missing usage`
    );
    assert(
      !hasFail(rvi.last, "vi-hex") && !hasFail(rvi.last, "vi-font"),
      `${label} hex/font match; chrome-only is still REJECT`
    );
  }

  const resume = await runHops({
    packageDir: fixture("fail-vi-bw-navy-resume"),
    hops: ["R-VI"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(resume.last.verdict === "REJECT", "B/W/navy résumé must REJECT R-VI");
  assert(
    hasFail(resume.last, "vi-primary-as-field"),
    `B/W/navy résumé must fail vi-primary-as-field, got ${failuresOf(resume.last)}`
  );

  const pass = await runHops({
    packageDir: fixture("pass-vi-gs-content-distill"),
    hops: ["R0", "R-VI"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(
    pass.last.verdict === "ACCEPT",
    `complete GS work/case distill must ACCEPT R-VI, got ${failuresOf(pass.last)}`
  );

  const chromeRec = JSON.parse(
    fs.readFileSync(path.join(fixture("fail-vi-chrome-only"), "vi.json"), "utf8")
  );
  assert(viNotChromeOnly(chromeRec).ok === false, "chrome-only record unit");
  const examRec = JSON.parse(
    fs.readFileSync(path.join(fixture("pass-vi-gs-content-distill"), "vi.json"), "utf8")
  );
  assert(viNotChromeOnly(examRec).ok === true, "content distill unit");
  return "REJECT";
}

async function testViTinyLabelsRejected() {
  const rvi = await runHops({
    packageDir: fixture("fail-vi-tiny-labels"),
    hops: ["R-VI"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(rvi.last.verdict === "REJECT", "usage + B/W résumé with 10px blue labels must REJECT R-VI");
  assert(
    hasFail(rvi.last, "vi-primary-as-field"),
    `tiny-label résumé must fail vi-primary-as-field, got ${failuresOf(rvi.last)}`
  );
  assert(
    !hasFail(rvi.last, "vi-usage"),
    "tiny-labels fixture has usage notes; fail must be application, not missing usage"
  );

  const r2 = await runHops({
    packageDir: fixture("fail-vi-tiny-labels"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-vi-tiny-labels"),
  });
  assert(r2.last.verdict === "REJECT", "tiny-label résumé must REJECT R2");
  assert(
    hasFail(r2.last, "r2-profile-vi-field"),
    `tiny-label résumé must fail r2-profile-vi-field, got ${failuresOf(r2.last)}`
  );

  const gsTokens = {
    hex: { primary: "#0033A0" },
  };
  const bw = fs.readFileSync(
    path.join(fixture("fail-vi-tiny-labels"), "profile.html"),
    "utf8"
  );
  assert(
    primaryAppliedAsField(bw, primaryHexFromVi(gsTokens)).ok === false,
    "Giant Spoon-like tokens + B/W résumé HTML must fail primary-as-field"
  );
  const applied = `<style>.wordmark{max-height:48px;height:48px;background:#0033A0;color:#fff;padding:8px 16px;font-size:16px}.brand-field{background:#0033A0;min-height:72px;padding:24px}</style><header class="wordmark">Acme</header><div class="brand-field"></div>`;
  assert(
    primaryAppliedAsField(applied, "#0033A0").ok === true,
    "thin chrome + later field must pass primary-as-field"
  );
  const fat = `<style>.wordmark{background:#0033A0;color:#fff;padding:24px 28px;font-size:28px}.brand-field{background:#0033A0;min-height:80px;padding:24px}</style><header class="wordmark">Acme</header><div class="brand-field"></div>`;
  assert(
    primaryAppliedAsField(fat, "#0033A0").ok === false,
    "fat brand-color document header fails even with a later field"
  );
  return "REJECT";
}

async function testTextCardAndCreditsRejected() {
  const cases = [
    ["fail-text-showreel-card", "r2-profile-showreel-picture", "text-only showreel card"],
    ["fail-legal-credits-profile", "r2-profile-credits-not-legal", "legal-paragraph credits"],
    ["fail-internal-asset-ids", "r2-profile-no-internal-ids", "visible internal asset ids"],
  ];
  for (const [name, checkId, label] of cases) {
    const r2 = await runHops({
      packageDir: fixture(name),
      hops: ["R2"],
      reportsDir: tmpReports(),
      stopOnFail: false,
      fetchResult: fixtureFetchResult(name),
    });
    assert(r2.last.verdict === "REJECT", `${label} must REJECT R2`);
    assert(
      hasFail(r2.last, checkId),
      `${label} must fail ${checkId}, got ${failuresOf(r2.last)}`
    );
  }

  const textCard = `<article class="work-card"><h3>Traditional showreel</h3><p>A-SHOWREEL-TRAD · IN-CARD. Described, not pictured.</p></article>`;
  assert(showreelIsPicture(textCard).ok === false, "text-card showreel pattern must fail");
  const legal =
    '<p class="credits">Traditional brand credits on this page, from the production-company side — not Giant Spoon clients: COACH, Nike, BMW. Tencent package was production-company EP after the first film, not an in-house agency producer. $8M+ is an aggregate across earlier brand work, not a single job.</p>';
  assert(creditsNotLegalParagraph(legal).ok === false, "legal grey wall must fail");
  assert(
    noInternalAssetIds("<p>A-SHOWREEL-TRAD · IN-CARD</p>").ok === false,
    "visible A-SHOWREEL-TRAD must fail"
  );
  return "REJECT";
}

async function testInvocationMatrixRejected() {
  const cases = [
    ["fail-p-led-58node", "r2-profile-invocation", "P-led 58-node"],
    ["fail-p-led-indev-wall", "r2-profile-invocation", "P-led in-dev tool wall"],
    ["fail-o-led-58node", "r2-profile-invocation", "O-led 58-node without process depth"],
    ["fail-a-led-tools-first", "r2-profile-invocation", "A-led tools before films"],
  ];
  for (const [name, checkId, label] of cases) {
    const r2 = await runHops({
      packageDir: fixture(name),
      hops: ["R2"],
      reportsDir: tmpReports(),
      stopOnFail: false,
      fetchResult: fixtureFetchResult(name),
    });
    assert(r2.last.verdict === "REJECT", `${label} must REJECT R2`);
    assert(
      hasFail(r2.last, checkId),
      `${label} must fail ${checkId}, got ${failuresOf(r2.last)}`
    );
  }

  const pLedPkg = {
    manifest: { role: "Senior Producer" },
    brief: { value: "Archetype: p-led." },
    briefAttrs: {},
  };
  assert(
    invocationOk("<p>58-node workflow graph</p><p>Brief History showreel</p>", pLedPkg).ok ===
      false,
    "P-led + 58-node must fail"
  );
  const oLedPkg = {
    manifest: { role: "Operations Lead" },
    brief: { value: "Archetype: o-led. No process-depth ask." },
    briefAttrs: {},
  };
  assert(
    invocationOk("<p>58-node</p>", oLedPkg).ok === false,
    "O-led 58-node without JD depth must fail"
  );
  return "REJECT";
}

async function testClosedDebateCardsRejected() {
  const cases = [
    ["fail-empty-white-cards", "r2-profile-empty-work-cards", "empty white work cards"],
    ["fail-showreel-not-21x9", "r2-profile-showreel-picture", "showreel not 21:9 + play"],
    ["fail-brand-wordmarks", "r2-profile-brand-stills", "brand wordmarks not stills"],
    ["fail-p-led-7stage", "r2-profile-invocation", "P-led 7-stage"],
    ["fail-p-led-6stage-text", "r2-profile-six-stage", "P-led 6-stage text grid"],
    ["fail-indev-before-reel", "r2-profile-invocation", "P-led in-dev before reel"],
  ];
  for (const [name, checkId, label] of cases) {
    const r2 = await runHops({
      packageDir: fixture(name),
      hops: ["R2"],
      reportsDir: tmpReports(),
      stopOnFail: false,
      fetchResult: fixtureFetchResult(name),
    });
    assert(r2.last.verdict === "REJECT", `${label} must REJECT R2`);
    assert(
      hasFail(r2.last, checkId),
      `${label} must fail ${checkId}, got ${failuresOf(r2.last)}`
    );
  }

  const wonder = await runHops({
    packageDir: fixture("pass-a-led-wonder"),
    hops: ["R0", "R-VI", "R1", "R1b", "R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(
    wonder.last.verdict === "ACCEPT",
    `A-led Wonder exam (films first + tools + 58-node) must ACCEPT R2, got ${failuresOf(wonder.last)}`
  );

  const pLedPkg = {
    manifest: { role: "Senior Producer" },
    brief: { value: "Archetype: p-led." },
    briefAttrs: {},
  };
  const aLedPkg = {
    manifest: { role: "Wonder Creative Technologist" },
    brief: { value: "Archetype: a-led. Wonder is the exam." },
    briefAttrs: {},
  };
  assert(
    invocationOk("<p>7-stage</p><p>Traditional showreel</p>", pLedPkg).ok === false,
    "P-led + 7-stage must fail"
  );
  assert(
    invocationOk(
      "<p>Brief History of a Family. One Click Mute. Manga Cut. DoomBrush.</p><p>Prompt Builder. In development. 58-node</p>",
      aLedPkg
    ).ok === true,
    "A-led films-first + tools strip + 58-node must pass"
  );
  assert(
    showreelIsPicture(
      '<style>.poster{aspect-ratio:16/9}</style><article><img class="poster" src="work-still.png" alt="Traditional showreel still"></article>'
    ).ok === false,
    "16:9 showreel without play must fail"
  );
  assert(
    noEmptyWhiteWorkCards(
      '<article class="work-card"><h3>Empty</h3></article>'
    ).ok === false,
    "empty work-card must fail"
  );
  assert(
    brandStillsNotWordmarks("<p>COACH. Nike. BMW.</p>").ok === false,
    "typeset brand wordmarks must fail"
  );
  assert(
    brandStillsNotWordmarks(
      '<iframe src="https://player.vimeo.com/video/190660903" title="COACH"></iframe><h2>Tencent Dungeon &amp; Fighter</h2>'
    ).ok === false,
    "a heading type card is not a brand hang"
  );
  assert(
    brandStillsNotWordmarks(
      '<iframe src="https://player.vimeo.com/video/190660903" title="COACH"></iframe><img src="nike-spot.jpg" alt="Nike campaign still">'
    ).ok === true,
    "Coach Vimeo plus a brand still is a hang"
  );
  assert(
    sixStageOneGraphic(
      '<div class="strip"><div>01 Intake</div><div>02 Route</div></div><p>6-stage</p>',
      pLedPkg
    ).ok === false,
    "P-led 6-stage text grid must fail"
  );
  return "REJECT";
}

async function testAssetLibrarianRejected() {
  const cases = [
    ["fail-private-asset-hung", "r2-profile-asset-clearance", "private asset hung"],
    ["fail-dev4-indev-label", "r2-profile-dev4-private", "DEV4 hung with in-dev label"],
    ["fail-58node-off-wonder", "r2-profile-58node-route", "58-node file off /wonder/"],
    ["fail-6stage-drive-original", "r2-profile-asset-clearance", "6-stage Drive original hung"],
    ["fail-6stage-caption-mix", "r2-profile-six-stage", "6 vs 7/58 caption mix"],
    ["fail-o-led-missing-6stage", "r2-profile-six-stage", "O-led missing 6-stage picture"],
    ["fail-p-led-pb-gallery", "r2-profile-p-led-pb-gallery", "P-led Prompt Builder gallery"],
  ];
  for (const [name, checkId, label] of cases) {
    const r2 = await runHops({
      packageDir: fixture(name),
      hops: ["R2"],
      reportsDir: tmpReports(),
      stopOnFail: false,
      fetchResult: fixtureFetchResult(name),
    });
    assert(r2.last.verdict === "REJECT", `${label} must REJECT R2`);
    assert(
      hasFail(r2.last, checkId),
      `${label} must fail ${checkId}, got ${failuresOf(r2.last)}`
    );
  }

  const wonder = await runHops({
    packageDir: fixture("pass-wonder-58node"),
    hops: ["R0", "R-VI", "R1", "R1b", "R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult("Wonder", "wonder"),
  });
  assert(
    wonder.last.verdict === "ACCEPT",
    `Wonder may hang 58-node until generic public:true, got ${failuresOf(wonder.last)}`
  );

  const acmePkg = {
    manifest: { company: "Acme", profile_url: "https://ai.drsfilms.com/acme/", role: "Senior Producer" },
    brief: { value: "p-led" },
    briefAttrs: {},
  };
  const wonderPkg = {
    manifest: { company: "Wonder", profile_url: "https://ai.drsfilms.com/wonder/", role: "Creative Technologist" },
    brief: { value: "a-led" },
    briefAttrs: {},
  };
  assert(
    outwardImagesCleared('<img src="coda-ui-01.jpg">', acmePkg).ok === false,
    "coda-ui-01 cannot hang"
  );
  assert(
    outwardImagesCleared('<p>coda-ui-01 is READY-but-private; cited in text only.</p>', acmePkg)
      .ok === true,
    "text cite of private asset is OK"
  );
  assert(
    fiftyEightNodeRouteOk('<img src="workflow-58node.png">', acmePkg).ok === false,
    "58-node file off wonder must fail"
  );
  assert(
    fiftyEightNodeRouteOk('<img src="workflow-58node.png">', wonderPkg).ok === true,
    "58-node file on /wonder/ must pass"
  );
  assert(
    dev4NotHung('<p>In development.</p><img src="ai-film-studio-ui-01.jpg">').ok === false,
    "in-dev label does not waive DEV4"
  );
  assert(
    pLedNoPbGallery(
      '<section id="tools"><img src="prompt-builder-ui-01.jpg"></section>',
      acmePkg
    ).ok === false,
    "P-led PB gallery must fail"
  );
  assert(
    pLedNoPbGallery(
      '<img src="prompt-builder-ui-01.jpg" alt="Prompt Builder">',
      acmePkg
    ).ok === true,
    "P-led one Prompt Builder screenshot is not a gallery"
  );
  return "REJECT";
}

async function testRecentBarFixtures() {
  const stale = await runHops({
    packageDir: fixture("fail-stale-classic-bar"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(stale.last.verdict === "REJECT", "stale classic bar must REJECT R2");
  assert(
    hasFail(stale.last, "r2-profile-recent-bar"),
    `stale classic bar must fail r2-profile-recent-bar, got ${failuresOf(stale.last)}`
  );
  const staleCheck = (stale.last.checks || []).find((c) => c.id === "r2-profile-recent-bar");
  assert(
    staleCheck && sameSlugSet(staleCheck.compared_to || [], ["elevenlabs", "luma"]),
    `stale check must write the recorded illegal compared_to, got ${JSON.stringify(staleCheck && staleCheck.compared_to)}`
  );
  assert(
    /not an external https|work\/case/i.test(staleCheck.detail),
    `stale detail must say compared_to is not an official work/case URL, got ${staleCheck.detail}`
  );

  const recent = await runHops({
    packageDir: fixture("pass-recent-bar"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  const recentCheck = (recent.last.checks || []).find((c) => c.id === "r2-profile-recent-bar");
  assert(
    recentCheck && recentCheck.status === "PASS",
    `pass-recent-bar must PASS r2-profile-recent-bar, got ${failuresOf(recent.last)}`
  );
  assert(
    sameSlugSet(recentCheck.compared_to || [], [
      "https://www.example.test/work/case-one",
      "https://www.example.test/work/case-two",
    ]),
    `pass-recent-bar compared_to must be official work/case URLs, got ${JSON.stringify(recentCheck.compared_to)}`
  );

  const r3 = await runHops({
    packageDir: fixture("fail-stale-classic-bar"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(
    hasFail(r3.last, "r3-profile-recent-bar"),
    `R3 must echo r3-profile-recent-bar, got ${failuresOf(r3.last)}`
  );
  return "REJECT";
}

async function testBriefPageSlotsRejected() {
  const noSlots = await runHops({
    packageDir: fixture("fail-brief-no-slots"),
    hops: ["R0"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(noSlots.last.verdict === "REJECT", "fail-brief-no-slots R0 must REJECT");
  assert(
    hasFail(noSlots.last, "brief-page-slots"),
    `fail-brief-no-slots must fail brief-page-slots, got ${failuresOf(noSlots.last)}`
  );

  const filmLead = await runHops({
    packageDir: fixture("fail-p-led-film-lead"),
    hops: ["R0"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(filmLead.last.verdict === "REJECT", "fail-p-led-film-lead R0 must REJECT");
  assert(
    hasFail(filmLead.last, "brief-lead-matches-archetype"),
    `fail-p-led-film-lead must fail brief-lead-matches-archetype, got ${failuresOf(filmLead.last)}`
  );
  assert(
    !hasFail(filmLead.last, "brief-page-slots"),
    "P-led film-lead fixture must have slots so the archetype miss is the named fail"
  );

  const img =
    '<img src="https://ai.drsfilms.com/acme/work-still.png" alt="Brief History of a Family still" width="640" height="360">';
  const filmPage = await runHops({
    packageDir: fixture("fail-page-ignores-brief-lead"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: {
      status: 200,
      timedOut: false,
      error: null,
      body: `<!DOCTYPE html><html><head><title>Acme Senior Producer</title><style>.wordmark{background:#1A2B3C;color:#fff;padding:20px 24px;font-size:22px}</style></head><body><header class="wordmark">Acme</header>${img}${img}${img}${img}<h1>Acme Senior Producer</h1><p>https://ai.drsfilms.com/acme/</p><article class="work-card">${img}<h3>Brief History of a Family</h3><iframe src="https://player.vimeo.com/video/1172739705" title="Brief History of a Family"></iframe></article><article class="work-card">${img}<h3>Brief History of a Family</h3></article><article class="work-card">${img}<h3>Brief History of a Family</h3></article><article class="work-card">${img}<h3>Brief History of a Family</h3></article><p>One Click Mute. Manga Cut. DoomBrush.</p><figure><img src="https://ai.drsfilms.com/acme/workflow-6stage.svg" alt="Six-stage production method"><figcaption class="footnote">Locked six-stage method.</figcaption></figure></body></html>`,
    },
  });
  assert(filmPage.last.verdict === "REJECT", "fail-page-ignores-brief-lead R2 must REJECT");
  assert(
    hasFail(filmPage.last, "r2-profile-follows-brief-slots"),
    `fail-page-ignores-brief-lead must fail r2-profile-follows-brief-slots, got ${failuresOf(filmPage.last)}`
  );

  const r3echo = await runHops({
    packageDir: fixture("fail-page-ignores-brief-lead"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: {
      status: 200,
      timedOut: false,
      error: null,
      body: `<!DOCTYPE html><html><head><title>Acme Senior Producer</title></head><body><header class="wordmark">Acme</header>${img}${img}${img}${img}<h1>Acme Senior Producer</h1><p>https://ai.drsfilms.com/acme/</p><article class="work-card">${img}<h3>Brief History of a Family</h3></article></body></html>`,
    },
  });
  assert(
    hasFail(r3echo.last, "r3-profile-follows-brief-slots"),
    `R3 must echo r3-profile-follows-brief-slots, got ${failuresOf(r3echo.last)}`
  );

  const passSlots = await runHops({
    packageDir: fixture("pass-brief-slots-lead"),
    hops: ["R0", "R-VI", "R1", "R1b", "R2"],
    reportsDir: tmpReports(),
    stopOnFail: true,
    fetchResult: qualifyingFetchResult(),
  });
  assert(
    passSlots.reports.length === 5,
    `pass-brief-slots-lead should finish 5 hops, got ${passSlots.reports.length}`
  );
  for (const r of passSlots.reports) {
    assert(
      r.verdict === "ACCEPT",
      `${r.hop} should ACCEPT on pass-brief-slots-lead, got ${r.verdict}: ${r.failures.join("; ")}`
    );
  }

  const unclearable = briefLeadAssetsClearable({
    selected_work_ids: ["unclearable-lead-still"],
    page_slots: {
      archetype: "P-led",
      lead: "unclearable-lead-still",
      second: [],
      supporting: [],
      omit: [],
    },
  });
  assert(unclearable.ok === false, "unclearable lead must fail brief-lead-assets-clearable");
  assert(
    decideVerdict([
      {
        id: "brief-lead-assets-clearable",
        severity: "P0",
        status: "FAIL",
        detail: unclearable.reason,
      },
    ]) === "REJECT",
    "lead that cannot be hung is R0 REJECT, not a later-hop category swap"
  );

  return "REJECT";
}

async function testTypewallAsRecentBarRejected() {
  const r2 = await runHops({
    packageDir: fixture("fail-typewall-as-recent-bar"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: qualifyingFetchResult(),
  });
  assert(r2.last.verdict === "REJECT", "fail-typewall-as-recent-bar R2 must REJECT");
  assert(
    hasFail(r2.last, "r2-profile-recent-bar"),
    `type-wall as recent bar must fail r2-profile-recent-bar, got ${failuresOf(r2.last)}`
  );
  const check = (r2.last.checks || []).find((c) => c.id === "r2-profile-recent-bar");
  assert(
    check && /not an external https|work\/case/i.test(check.detail),
    `type-wall bar detail must say compared_to is not an official work/case URL, got ${check && check.detail}`
  );
  assert(
    sameSlugSet(check.compared_to || [], ["aaa-typewall", "bbb-typewall", "ccc-typewall"]),
    `recorded type-wall slugs must be the compared_to exam, got ${JSON.stringify(check.compared_to)}`
  );
  const typeHtml = fs.readFileSync(
    path.join(fixture("fail-typewall-as-recent-bar"), "public", "aaa-typewall", "index.html"),
    "utf8"
  );
  assert(isStillFirstPage(typeHtml) === false, "aaa-typewall must be type-wall, not still-first");
  const stillHtml = fs.readFileSync(
    path.join(fixture("fail-typewall-as-recent-bar"), "public", "still-alpha", "index.html"),
    "utf8"
  );
  assert(isStillFirstPage(stillHtml) === true, "still-alpha must be still-first");
  return "REJECT";
}

async function testBriefLeadNotClearableRepair() {
  const r0 = await runHops({
    packageDir: fixture("fail-brief-lead-not-clearable"),
    hops: ["R0"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(r0.last.verdict === "REJECT", "fail-brief-lead-not-clearable R0 must REJECT");
  assert(
    hasFail(r0.last, "brief-lead-assets-clearable"),
    `must fail brief-lead-assets-clearable, got ${failuresOf(r0.last)}`
  );
  assert(
    !hasFail(r0.last, "brief-page-slots"),
    "slots must exist so the named fail is lead clearance"
  );
  return "REJECT";
}

async function testFullBleedProfileRejected() {
  const r2 = await runHops({
    packageDir: fixture("fail-full-bleed-profile"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-full-bleed-profile"),
  });
  assert(r2.last.verdict === "REJECT", "fail-full-bleed-profile R2 must REJECT");
  assert(
    hasFail(r2.last, "r2-profile-max-width"),
    `full-bleed must fail r2-profile-max-width, got ${failuresOf(r2.last)}`
  );
  const r3 = await runHops({
    packageDir: fixture("fail-full-bleed-profile"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-full-bleed-profile"),
  });
  assert(
    hasFail(r3.last, "r3-profile-max-width"),
    `R3 must echo r3-profile-max-width, got ${failuresOf(r3.last)}`
  );
  return "REJECT";
}

async function testLiveOverStaleLocalAccepted() {
  const live = qualifyingFetchResult();
  const r2 = await runHops({
    packageDir: fixture("pass-still-first-live-over-stale"),
    hops: ["R0", "R-VI", "R1", "R1b", "R2"],
    reportsDir: tmpReports(),
    stopOnFail: true,
    fetchResult: live,
  });
  assert(
    r2.reports.length === 5,
    `pass-still-first-live-over-stale should finish 5 hops, got ${r2.reports.length}`
  );
  for (const r of r2.reports) {
    assert(
      r.verdict === "ACCEPT",
      `${r.hop} should ACCEPT when fetch live wins over stale local, got ${r.verdict}: ${r.failures.join("; ")}`
    );
  }
  const recent = (r2.last.checks || []).find((c) => c.id === "r2-profile-recent-bar");
  assert(
    recent && recent.status === "PASS",
    "official work/case compared_to must PASS r2-profile-recent-bar"
  );
  assert(
    sameSlugSet(recent.compared_to || [], [
      "https://www.example.test/work/case-one",
      "https://www.example.test/work/case-two",
    ]),
    `compared_to must be official work/case URLs, got ${JSON.stringify(recent && recent.compared_to)}`
  );
  const width = (r2.last.checks || []).find((c) => c.id === "r2-profile-max-width");
  assert(width && width.status === "PASS", "capped wrap on live body must PASS r2-profile-max-width");

  const localOnly = await runHops({
    packageDir: fixture("pass-still-first-live-over-stale"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
  });
  assert(
    hasFail(localOnly.last, "r2-profile-first-viewport-is-frame") ||
      hasFail(localOnly.last, "r2-profile-not-old-shell"),
    `local-only must still judge stale 78vh HTML, got ${failuresOf(localOnly.last)}`
  );
  assert(
    firstViewportIsStillLed(live.body).ok === true,
    "live body first 800px must be still-led"
  );
  return "ACCEPT";
}

async function testLiveGiantSpoonFilmSlateAndAiDominateRejected() {
  const live = fs.readFileSync(
    path.join(fixture("fail-p-led-film-slate"), "profile.html"),
    "utf8"
  );
  assert(
    /traditional-showreel-poster/i.test(live),
    "fail fixture must be the live page that hung traditional-showreel-poster"
  );
  assert(
    !/FILM\s+PRODUCER/i.test(live),
    "the 1.15.0 miss is the hung slate still, not typeset FILM PRODUCER copy"
  );

  const pLedPkg = loadPackage({ packageDir: fixture("fail-p-led-film-slate") });
  assert(
    pLedLeadNotFilmSlate(live, pLedPkg).ok === false,
    "live Giant Spoon HTML must fail pLedLeadNotFilmSlate"
  );
  assert(
    pLedAiMustNotDominate(live, pLedPkg).ok === false,
    "live Giant Spoon HTML must fail pLedAiMustNotDominate"
  );

  const slate = await runHops({
    packageDir: fixture("fail-p-led-film-slate"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-p-led-film-slate"),
  });
  assert(slate.last.verdict === "REJECT", "fail-p-led-film-slate R2 must REJECT");
  assert(
    hasFail(slate.last, "r2-profile-lead-not-film-slate"),
    `live film-slate page must fail r2-profile-lead-not-film-slate, got ${failuresOf(slate.last)}`
  );

  const ai = await runHops({
    packageDir: fixture("fail-p-led-ai-dominate"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-p-led-ai-dominate"),
  });
  assert(ai.last.verdict === "REJECT", "fail-p-led-ai-dominate R2 must REJECT");
  assert(
    hasFail(ai.last, "r2-profile-ai-must-not-dominate"),
    `live three-tile AI strip must fail r2-profile-ai-must-not-dominate, got ${failuresOf(ai.last)}`
  );

  const r3 = await runHops({
    packageDir: fixture("fail-p-led-film-slate"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-p-led-film-slate"),
  });
  assert(
    hasFail(r3.last, "r3-profile-lead-not-film-slate"),
    `R3 must echo r3-profile-lead-not-film-slate, got ${failuresOf(r3.last)}`
  );
  const r3ai = await runHops({
    packageDir: fixture("fail-p-led-ai-dominate"),
    hops: ["R3"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: fixtureFetchResult("fail-p-led-ai-dominate"),
  });
  assert(
    hasFail(r3ai.last, "r3-profile-ai-must-not-dominate"),
    `R3 must echo r3-profile-ai-must-not-dominate, got ${failuresOf(r3ai.last)}`
  );
  return "REJECT";
}

async function testGs18HtmlStillRejected() {
  const gs18 = `<style>:root{--blue:#0033a0}.hero{min-height:78vh;display:flex;align-items:center;padding:72px 0 56px}.hero .header-line{font-size:14px;color:var(--blue)}.stat span{font-size:11px;color:var(--blue)}</style><header class="hero"><h1>Concept through delivery.</h1></header><img src="https://vumbnail.com/1172739705.jpg" alt="later">`;
  assert(
    firstViewportHasStill(gs18).ok === false,
    "Giant Spoon #18 spacer pattern must still fail first-viewport still"
  );
  assert(
    primaryAppliedAsField(gs18, "#0033A0").ok === false,
    "Giant Spoon #18 B/W résumé with 10px blue labels must fail primary-as-field"
  );
  assert(
    showreelIsPicture(
      "<p>A-SHOWREEL-TRAD · IN-CARD. Traditional showreel lives in this paragraph.</p>"
    ).ok === false,
    "text-card showreel pattern must fail"
  );
  assert(
    showreelIsPicture(
      '<article><iframe src="https://player.vimeo.com/video/1174467043?background=1" title="Traditional showreel"></iframe></article>'
    ).ok === true,
    "Vimeo iframe with background=1 is a showreel picture"
  );
  return "REJECT";
}

async function testRenderedLiveExamRejected() {
  const snapshotPath = path.join(fixture("fail-rendered-live-exam"), "live-snapshot.html");
  const snapshot = fs.readFileSync(snapshotPath, "utf8");
  let body = snapshot;
  const fetched = await optionalFetch("https://ai.drsfilms.com/giant-spoon/", 8000);
  if (fetched && fetched.status === 200 && fetched.body && String(fetched.body).length > 500) {
    body = fetched.body;
  }
  assert(
    firstViewportIsFrame(body).ok === false,
    "live exam must fail first-viewport-is-frame"
  );
  assert(
    noResumeMasthead(body, "#0033A0").ok === false,
    "live exam must fail no-resume-masthead"
  );
  assert(
    noTypeSlabWorkSlot(body, "#0033A0").ok === false,
    "live exam must fail no-type-slab-work"
  );
  assert(
    leadMediaCleared(body).ok === false,
    "live exam must fail lead-media-cleared"
  );

  const r2 = await runHops({
    packageDir: fixture("fail-rendered-live-exam"),
    hops: ["R2"],
    reportsDir: tmpReports(),
    stopOnFail: false,
    fetchResult: { status: 200, timedOut: false, error: null, body },
  });
  assert(r2.last.verdict === "REJECT", "live rendered exam must REJECT R2");
  assert(
    hasFail(r2.last, "r2-profile-first-viewport-is-frame"),
    `live exam must fail r2-profile-first-viewport-is-frame, got ${failuresOf(r2.last)}`
  );
  assert(
    hasFail(r2.last, "r2-profile-no-resume-masthead"),
    `live exam must fail r2-profile-no-resume-masthead, got ${failuresOf(r2.last)}`
  );
  assert(
    hasFail(r2.last, "r2-profile-no-type-slab-work"),
    `live exam must fail r2-profile-no-type-slab-work, got ${failuresOf(r2.last)}`
  );
  assert(
    hasFail(r2.last, "r2-profile-lead-media-cleared"),
    `live exam must fail r2-profile-lead-media-cleared, got ${failuresOf(r2.last)}`
  );
  const blob = JSON.stringify((r2.last.checks || []).map((c) => `${c.id}:${c.detail}`));
  assert(
    !/reject this blue bar|reject this tencent slab/i.test(blob),
    "exam details must stay generic; do not encode screenshot strings into the law"
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
    "r2-profile-work-images": () =>
      assert(
        htmlHasWorkImages("<html><body><h1>Acme</h1><p>text only</p></body></html>").ok ===
          false,
        "text-only Profile HTML"
      ),
    "r2-profile-first-viewport-is-frame": () =>
      assert(
        firstViewportIsFrame(
          '<style>.hero{min-height:78vh}</style><header class="hero"><h1>x</h1></header><img src="later.jpg">'
        ).ok === false,
        "78vh type hero is not a work frame"
      ),
    "r2-profile-no-resume-masthead": () =>
      assert(
        noResumeMasthead(
          '<style>.wordmark{background:#1A2B3C;padding:24px 28px;font-size:28px}</style><header class="wordmark">Acme<small>Senior Producer · NYC hybrid</small></header>',
          "#1A2B3C"
        ).ok === false,
        "fat brand-color header with role + location"
      ),
    "r2-profile-no-type-slab-work": () =>
      assert(
        noTypeSlabWorkSlot(
          '<style>.type-card{background:#1A2B3C;padding:48px}</style><article class="type-card"><h2>Work title</h2><p>No still. Type only.</p></article>',
          "#1A2B3C"
        ).ok === false,
        "brand-color type slab as a work slot"
      ),
    "r2-profile-lead-media-cleared": () =>
      assert(
        leadMediaCleared(
          '<img src="stills/uncatalogued-fixture.webp" alt="invented lead">'
        ).ok === false,
        "uncatalogued fixture still is not a lead asset"
      ),
    "r2-profile-still-early": () =>
      assert(
        firstStillIsEarly(
          `<body><h1>x</h1><p>${"word ".repeat(90)}</p><img src="later.jpg"></body>`
        ).ok === false,
        "stills below a long type hero"
      ),
    "r2-profile-still-count": () =>
      assert(
        htmlHasEnoughStills(
          '<img src="a.jpg"><img src="b.jpg">'
        ).ok === false,
        "two stills do not carry a page"
      ),
    "r2-profile-traditional-credits": () =>
      assert(
        hasTraditionalCredits(
          "<p>One Click Mute. Manga Cut. DoomBrush.</p>"
        ).ok === false,
        "AI-only stack"
      ),
    "r2-profile-traditional-lead": () =>
      assert(
        traditionalLeads(
          "<p>One Click Mute. Brief History of a Family. showreel.</p>"
        ).ok === false,
        "AI title before traditional"
      ),
    "r2-profile-ai-film-order": () =>
      assert(
        aiFilmOrderOk("<p>DoomBrush. One Click Mute. Manga Cut.</p>").ok === false,
        "swapped AI stack"
      ),
    "r2-profile-vimeo-in-card": () =>
      assert(
        vimeoEmbedInCard(
          '<p>Brief History</p><div class="modal"><iframe src="https://player.vimeo.com/video/1"></iframe></div>'
        ).ok === false,
        "modal-only Vimeo"
      ),
    "r2-profile-not-old-shell": () =>
      assert(
        oldShellIsGone(
          '<style>.hero{min-height:78vh}</style><header class="hero"><img src="x.jpg"></header>'
        ).ok === false,
        "patched 78vh hero"
      ),
    "r2-profile-not-homepage-skin": () =>
      assert(
        isRoleProfileNotHomepage(
          "<h1>We are Acme</h1><p>Independent creative company.</p>"
        ).ok === false,
        "homepage skin"
      ),
    "vi-usage": () =>
      assert(
        viHasUsage({
          hex: { primary: "#0033A0" },
          font: { family: "Sora" },
        }).ok === false,
        "token-only VI"
      ),
    "vi-not-chrome-only": () =>
      assert(
        viNotChromeOnly({
          source_url: "https://giantspoon.com/",
          hex: { primary: "#0033A0", black: "#000000", white: "#FFFFFF" },
          font: { family: "Sora" },
          usage: {
            canvas: "white",
            primary: "Klein Blue as wordmark/field on the canvas",
          },
        }).ok === false,
        "chrome-only GS distill"
      ),
    "vi-primary-as-field": () =>
      assert(
        primaryAppliedAsField(
          '<style>.kicker{font-size:10px;color:#0033a0}</style><p class="kicker">label</p>',
          "#0033A0"
        ).ok === false,
        "tiny-label primary"
      ),
    "r2-profile-showreel-picture": () =>
      assert(
        showreelIsPicture(
          "<p>Traditional showreel described in this paragraph. No picture.</p>"
        ).ok === false,
        "text-card showreel"
      ),
    "r2-profile-credits-not-legal": () =>
      assert(
        creditsNotLegalParagraph(
          '<p class="credits">Traditional brand credits on this page, from the production-company side — not Giant Spoon clients: COACH, Nike, BMW. Tencent package was production-company EP after the first film, not an in-house agency producer. $8M+ is an aggregate across earlier brand work, not a single job.</p>'
        ).ok === false,
        "legal-paragraph credits"
      ),
    "r2-profile-no-internal-ids": () =>
      assert(
        noInternalAssetIds("<span>A-SHOWREEL-TRAD · IN-CARD</span>").ok === false,
        "visible internal ids"
      ),
    "r2-profile-invocation": () =>
      assert(
        invocationOk("<p>58-node</p>", {
          manifest: { role: "Senior Producer" },
          brief: { value: "p-led" },
          briefAttrs: {},
        }).ok === false,
        "P-led 58-node"
      ),
    "r2-profile-empty-work-cards": () =>
      assert(
        noEmptyWhiteWorkCards(
          '<article class="work-card"><h3>Empty white card</h3><p>No still.</p></article>'
        ).ok === false,
        "empty white work card"
      ),
    "r2-profile-brand-stills": () =>
      assert(
        brandStillsNotWordmarks("<p>COACH. Nike. BMW.</p>").ok === false,
        "brand wordmarks"
      ),
    "r2-profile-six-stage": () =>
      assert(
        sixStageOneGraphic('<div class="strip">6-stage text grid</div>', {
          manifest: { role: "Senior Producer" },
          brief: { value: "p-led" },
          briefAttrs: {},
        }).ok === false,
        "P-led text 6-stage"
      ),
    "r2-profile-asset-clearance": () =>
      assert(
        outwardImagesCleared('<img src="coda-ui-01.jpg" alt="Coda">', {
          manifest: { company: "Acme", profile_url: "https://ai.drsfilms.com/acme/" },
        }).ok === false,
        "private asset hung"
      ),
    "r2-profile-58node-route": () =>
      assert(
        fiftyEightNodeRouteOk('<img src="workflow-58node.png" alt="graph">', {
          manifest: { company: "Acme", profile_url: "https://ai.drsfilms.com/acme/" },
        }).ok === false,
        "58-node off wonder"
      ),
    "r2-profile-dev4-private": () =>
      assert(
        dev4NotHung('<p>In development.</p><img src="martini-ui-01.jpg" alt="Martini">').ok ===
          false,
        "DEV4 hung"
      ),
    "r2-profile-p-led-pb-gallery": () =>
      assert(
        pLedNoPbGallery(
          '<section id="tools"><img src="prompt-builder-ui-01.jpg" alt="Prompt Builder"></section>',
          { manifest: { role: "Senior Producer" }, brief: { value: "p-led" }, briefAttrs: {} }
        ).ok === false,
        "P-led PB gallery"
      ),
    "r2-profile-recent-bar": () => {
      const stale = loadPackage({ packageDir: fixture("fail-stale-classic-bar") });
      assert(recentBarOk(stale).ok === false, "portfolio slugs are not official work URLs");
      const recent = loadPackage({ packageDir: fixture("pass-recent-bar") });
      assert(recentBarOk(recent).ok === true, "official work/case URLs");
      const typewall = loadPackage({ packageDir: fixture("fail-typewall-as-recent-bar") });
      assert(
        recentBarOk(typewall).ok === false,
        "type-wall slug bar is not official work URLs"
      );
    },
    "brief-page-slots": () => {
      assert(
        briefPageSlotsOk({ selected_work_ids: ["showreel-trad", "coach-spot"] }).ok === false,
        "missing page_slots"
      );
      assert(
        categorize("traditional advertising showreel") === "trad_reel",
        "GS lead reel token"
      );
      assert(categorize("Coach brand spot") === "brand_spot", "GS lead coach token");
      assert(
        briefPageSlotsOk({
          selected_work_ids: [
            "coach-make-the-ground-shake",
            "tencent-dungeon-and-fighter",
            "brief-history-of-a-family",
          ],
          page_slots: {
            archetype: "P-led",
            lead: ["traditional advertising showreel", "Coach brand spot"],
            second: ["Tencent Dungeon & Fighter"],
            supporting: ["Brief History of A Family"],
            omit: ["58-node"],
          },
        }).ok === true,
        "GS ads-lead slots"
      );
    },
    "brief-lead-matches-archetype": () =>
      assert(
        briefLeadMatchesArchetype(
          {
            selected_work_ids: [
              "brief-history-of-a-family",
              "showreel-trad",
              "coach-spot",
            ],
            page_slots: {
              archetype: "P-led",
              lead: "brief-history-of-a-family",
              second: "showreel-trad",
              supporting: ["coach-spot"],
              omit: [],
            },
          },
          {
            manifest: { role: "Senior Producer" },
            brief: { value: "Archetype: p-led. Agency integrated production." },
            briefAttrs: { archetype: "P-led" },
          }
        ).ok === false,
        "P-led film-only lead"
      ),
    "brief-lead-assets-clearable": () => {
      assert(
        briefLeadAssetsClearable({
          selected_work_ids: ["unclearable-lead-still"],
          page_slots: {
            archetype: "P-led",
            lead: "unclearable-lead-still",
            second: [],
            supporting: [],
            omit: [],
          },
        }).ok === false,
        "lead without dual-gate still"
      );
      assert(
        briefLeadAssetsClearable({
          selected_work_ids: ["coach-make-the-ground-shake", "showreel-trad"],
          page_slots: {
            archetype: "P-led",
            lead: ["Coach brand spot", "traditional advertising showreel"],
            second: [],
            supporting: [],
            omit: [],
          },
        }).ok === true,
        "Coach 190660903 / trad reel 1174467043 are allowed lead hangs"
      );
    },
    "r2-profile-follows-brief-slots": () => {
      assert(
        profileFollowsBriefSlots(
          '<h1>Senior Producer</h1><article class="work-card"><img src="a.jpg" alt="Brief History of a Family"><h3>Brief History of a Family</h3></article>',
          {
            briefAttrs: {
              page_slots: {
                archetype: "P-led",
                lead: ["showreel-trad", "coach-spot"],
                second: "brief-history-of-a-family",
                supporting: [],
                omit: [],
              },
            },
          }
        ).ok === false,
        "four-BHOAF page vs reel+coach lead"
      );
      assert(
        profileFollowsBriefSlots(
          '<article class="work-card"><img class="reel-poster" alt="Traditional advertising showreel"><h1>Traditional advertising showreel</h1></article>',
          {
            briefAttrs: {
              page_slots: {
                archetype: "P-led",
                lead: ["traditional advertising showreel", "Coach brand spot"],
                second: ["Tencent Dungeon & Fighter"],
                supporting: ["Brief History of A Family"],
                omit: [],
              },
            },
          }
        ).ok === true,
        "ads-first work row matches Brief lead"
      );
    },
    "r2-profile-max-width": () => {
      assert(
        workColumnMaxWidthOk(
          '<style>.work img{width:100vw}</style><img src="a.jpg" alt="still">'
        ).ok === false,
        "100vw work img"
      );
      assert(
        workColumnMaxWidthOk(
          '<style>.wordmark{width:100vw;background:#1A2B3C}.wrap{width:min(1120px, calc(100% - 40px))}</style><header class="wordmark">Acme</header><div class="wrap"><img src="a.jpg" alt="still"></div>'
        ).ok === true,
        "wordmark may be full row when work wrap is capped"
      );
    },
    "r2-profile-lead-not-film-slate": () => {
      const pkg = loadPackage({ packageDir: fixture("fail-p-led-film-slate") });
      assert(
        pLedLeadNotFilmSlate(pkg.profileHtml.value, pkg).ok === false,
        "live GS film-slate poster"
      );
    },
    "r2-profile-ai-must-not-dominate": () => {
      const pkg = loadPackage({ packageDir: fixture("fail-p-led-ai-dominate") });
      assert(
        pLedAiMustNotDominate(pkg.profileHtml.value, pkg).ok === false,
        "live GS three-tile AI strip"
      );
    },
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
  assert(
    scanClaimLocks("禁止：Sundance won / winner / 获奖").every(
      (h) => h.id !== "claim-lock-sundance-win"
    ),
    "forbid-list context naming Sundance won must not trip the lock"
  );
  assert(
    scanClaimLocks("Sundance nominee is allowed; only Sundance+won/winner fails.").every(
      (h) => h.id !== "claim-lock-sundance-win"
    ),
    "lock explanation with Sundance+won must not trip"
  );

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
    "test-verdict-must-be-derived-from-checks":
      await testVerdictMustBeDerivedFromChecks(),
    "test-forged-prereq-with-reproduced-fail-rejected":
      await testForgedPrereqWithReproducedFailRejected(),
    "test-r0-r1-r2-only-gates-survive-forged-prereq":
      await testR0R1R2OnlyGatesSurviveForgedPrereq(),
    "test-alias-prefix-collision": await testAliasPrefixCollision(),
    "test-live-marker-must-be-dedicated-route":
      await testLiveMarkerMustBeDedicatedRoute(),
    "test-r3-reruns-vi-provenance": await testR3RerunsViProvenance(),
    "test-r3-rescans-claimlock-slop-on-cv-cl": await testR3RescansClaimlockSlopOnCvCl(),
    "test-verify-mode-rederives-r3": await testVerifyModeRederivesR3(),
    "test-report-binds-to-package-and-inputs": await testReportBindsToPackageAndInputs(),
    "test-stale-report-invalidated-on-input-change": await testStaleReportInvalidatedOnInputChange(),
    "test-ghost-profile-url-without-live-page-rejected":
      await testGhostProfileUrlWithoutLivePageRejected(),
    "test-empty-hero-profile-rejected": await testEmptyHeroProfileRejected(),
    "test-late-stills-profile-rejected": await testLateStillsProfileRejected(),
    "test-thin-stack-profile-rejected": await testThinStackProfileRejected(),
    "test-named-career-work-sample-rejected": await testNamedCareerWorkSampleRejected(),
    "test-patched-shell-and-homepage-skin-rejected":
      await testPatchedShellAndHomepageSkinRejected(),
    "test-text-only-profile-rejected": await testTextOnlyProfileRejected(),
    "test-vi-token-only-rejected": await testViTokenOnlyRejected(),
    "test-vi-chrome-only-rejected": await testViChromeOnlyRejected(),
    "test-vi-tiny-labels-rejected": await testViTinyLabelsRejected(),
    "test-text-card-and-credits-rejected": await testTextCardAndCreditsRejected(),
    "test-invocation-matrix-rejected": await testInvocationMatrixRejected(),
    "test-closed-debate-cards-rejected": await testClosedDebateCardsRejected(),
    "test-asset-librarian-rejected": await testAssetLibrarianRejected(),
    "test-recent-bar-fixtures": await testRecentBarFixtures(),
    "test-typewall-as-recent-bar": await testTypewallAsRecentBarRejected(),
    "test-brief-lead-not-clearable": await testBriefLeadNotClearableRepair(),
    "test-full-bleed-profile": await testFullBleedProfileRejected(),
    "test-live-over-stale-local": await testLiveOverStaleLocalAccepted(),
    "test-live-gs-film-slate-and-ai-dominate":
      await testLiveGiantSpoonFilmSlateAndAiDominateRejected(),
    "test-brief-page-slots-rejected": await testBriefPageSlotsRejected(),
    "test-gs18-html-still-rejected": await testGs18HtmlStillRejected(),
    "test-rendered-live-exam-rejected": await testRenderedLiveExamRejected(),
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
      "fail-text-only-profile": "REJECT",
      "fail-empty-hero-profile": "REJECT",
      "fail-late-stills-profile": "REJECT",
      "fail-thin-stack-profile": "REJECT",
      "fail-ai-only-profile": "REJECT",
      "fail-ai-lead-profile": "REJECT",
      "fail-ai-order-profile": "REJECT",
      "fail-folded-vimeo-profile": "REJECT",
      "fail-patched-shell-profile": "REJECT",
      "fail-homepage-skin-profile": "REJECT",
      "fail-vi-token-only": "REJECT",
      "fail-vi-chrome-only": "REJECT",
      "fail-vi-home-hero-brand": "REJECT",
      "fail-vi-bw-navy-resume": "REJECT",
      "fail-vi-tiny-labels": "REJECT",
      "pass-vi-gs-content-distill": "ACCEPT",
      "fail-text-showreel-card": "REJECT",
      "fail-legal-credits-profile": "REJECT",
      "fail-internal-asset-ids": "REJECT",
      "fail-p-led-58node": "REJECT",
      "fail-p-led-indev-wall": "REJECT",
      "fail-o-led-58node": "REJECT",
      "fail-a-led-tools-first": "REJECT",
      "fail-empty-white-cards": "REJECT",
      "fail-showreel-not-21x9": "REJECT",
      "fail-brand-wordmarks": "REJECT",
      "fail-p-led-7stage": "REJECT",
      "fail-p-led-6stage-text": "REJECT",
      "fail-indev-before-reel": "REJECT",
      "fail-private-asset-hung": "REJECT",
      "fail-dev4-indev-label": "REJECT",
      "fail-58node-off-wonder": "REJECT",
      "fail-6stage-drive-original": "REJECT",
      "fail-6stage-caption-mix": "REJECT",
      "fail-o-led-missing-6stage": "REJECT",
      "fail-p-led-pb-gallery": "REJECT",
      "fail-stale-classic-bar": "REJECT",
      "fail-typewall-as-recent-bar": "REJECT",
      "fail-brief-lead-not-clearable": "REJECT",
      "fail-full-bleed-profile": "REJECT",
      "pass-still-first-live-over-stale": "ACCEPT",
      "pass-recent-bar": "ACCEPT",
      "fail-brief-no-slots": "REJECT",
      "fail-p-led-film-lead": "REJECT",
      "fail-page-ignores-brief-lead": "REJECT",
      "fail-p-led-film-slate": "REJECT",
      "fail-p-led-ai-dominate": "REJECT",
      "fail-rendered-live-exam": "REJECT",
      "pass-brief-slots-lead": "ACCEPT",
      "pass-a-led-wonder": "ACCEPT",
      "pass-wonder-58node": "ACCEPT",
      "pass-minimal-three": pass.last.verdict,
    },
    named,
  };
}

module.exports = { runSelfTest, rulesetPin, REQUIRED_RULE_IDS };
