#!/usr/bin/env node
"use strict";

// Quality gate only. Does not apply to jobs or restyle public/ pages.

const { loadRuleset, parseHopList, runHops, formatReport } = require("./lib/check");
const { exitCodeFor } = require("./lib/reports");
const { runSelfTest } = require("./lib/self-test");

function printHelp() {
  const text = `
Career hop harness — gate JD → Brief → CV + CL + company Profile → closeout.

Usage:
  node harness/cli.js --self-test
  node harness/cli.js --hop <R0|R-VI|R1|R1b|R2|R3|chain> --package <dir>
  node harness/cli.js --hop R3 --manifest <path>
  node harness/cli.js --verify --hop R3 --package <dir>
  node harness/cli.js --hop R3 --verify --package <dir>

Options:
  --hop <id>           One hop, comma list, or chain
  --package <dir>      Apply-package directory (contains manifest.json)
  --manifest <path>    Manifest file (package dir = its dirname)
  --reports <dir>      Where hop reports are written (default: <package>/reports)
  --fetch-profile      Live GET of profile_url. ACCEPT needs HTTP 2xx AND dedicated-profile path identity (/{slug}/) in the body. Company-word mention alone is not enough. SPA 200 empty shell / 4xx / 5xx / timeout / error is FAIL. Local profile.html is not enough.
  --verify             Supervisor mode for R3: re-run R3 live and re-derive decideVerdict. Do not trust disk reports/R3.json. Missing, handwritten, or disk-vs-live disagreement is REJECT. Exit 0 only if live R3 ACCEPT.
  --json               Print reports as JSON
  --self-test          Run built-in units + the four fixtures; exit 0 on pass
  --help               This help

Exit codes:
  0  ACCEPT (or --self-test passed)
  1  REJECT  mechanical P0 FAIL — stop. Do not score as if it passed.
  2  REPAIR  not ACCEPT — cannot advance the chain. Fix and re-run the same hop.
  64 usage error

Nobody may waive Profile or cover letter. Recover = re-run the same hop after fix.
This CLI does not apply to jobs, fill an ATS, or submit anything.
Reports are harness-generated and bound to this package's input hashes. Prerequisite ACCEPT is decideVerdict(checks); the self-certified verdict field is not trusted. Forged, empty-check, id+PASS stub, or stale reports are REJECT. R3 re-scans current CV/CL/Brief/Profile HTML and re-verifies VI provenance. Supervisors must --verify (or a fresh --hop R3) before ATS fill; a disk R3.json verdict is never sufficient.
`.trim();
  console.log(text);
}

function parseArgs(argv) {
  const out = {
    hop: null,
    packageDir: null,
    manifestPath: null,
    reportsDir: null,
    fetchProfile: false,
    json: false,
    verify: false,
    selfTest: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--self-test") out.selfTest = true;
    else if (a === "--json") out.json = true;
    else if (a === "--verify") out.verify = true;
    else if (a === "--fetch-profile") out.fetchProfile = true;
    else if (a === "--hop") out.hop = argv[++i];
    else if (a === "--package") out.packageDir = argv[++i];
    else if (a === "--manifest") out.manifestPath = argv[++i];
    else if (a === "--reports") out.reportsDir = argv[++i];
    else if (a.startsWith("--hop=")) out.hop = a.slice(6);
    else if (a.startsWith("--package=")) out.packageDir = a.slice(10);
    else if (a.startsWith("--manifest=")) out.manifestPath = a.slice(11);
    else if (a.startsWith("--reports=")) out.reportsDir = a.slice(10);
    else {
      const err = new Error(`unknown argument: ${a}`);
      err.code = "USAGE";
      throw err;
    }
  }
  return out;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    printHelp();
    process.exit(64);
  }

  if (args.help || process.argv.length <= 2) {
    printHelp();
    process.exit(args.help ? 0 : 64);
  }

  if (args.selfTest) {
    try {
      const result = await runSelfTest();
      console.log("self-test PASS");
      console.log(JSON.stringify(result.fixtures, null, 2));
      if (result.named) {
        console.log(JSON.stringify(result.named, null, 2));
      }
      process.exit(0);
    } catch (err) {
      console.error(`self-test FAIL: ${err.message}`);
      process.exit(1);
    }
  }

  if (args.verify && !args.hop) {
    args.hop = "R3";
  }

  if (!args.hop) {
    console.error("--hop is required unless --self-test or --verify");
    printHelp();
    process.exit(64);
  }
  if (!args.packageDir && !args.manifestPath) {
    console.error("--package or --manifest is required");
    printHelp();
    process.exit(64);
  }

  const ruleset = loadRuleset();
  let hops;
  try {
    hops = parseHopList(args.hop, ruleset.contracts);
  } catch (err) {
    console.error(err.message);
    process.exit(64);
  }

  if (args.verify && (hops.length !== 1 || hops[0] !== "R3")) {
    console.error("--verify only supports --hop R3 (or --verify with hop defaulting to R3)");
    printHelp();
    process.exit(64);
  }

  const result = await runHops({
    packageDir: args.packageDir,
    manifestPath: args.manifestPath,
    reportsDir: args.reportsDir,
    hops,
    fetchProfile: args.fetchProfile,
    verify: args.verify,
    ruleset,
  });

  if (args.json) {
    console.log(JSON.stringify(result.reports, null, 2));
  } else {
    for (const report of result.reports) {
      console.log(formatReport(report));
      console.log(`report: ${result.reportsDir}/${report.hop}.json`);
      console.log("");
    }
  }

  const last = result.last;
  process.exit(exitCodeFor(last ? last.verdict : "REJECT", ruleset.contracts.exit_codes));
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
