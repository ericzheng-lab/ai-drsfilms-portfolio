"use strict";

const fs = require("fs");
const path = require("path");
const { loadPackage } = require("./manifest");
const { HOP_RUNNERS } = require("./hops");
const { assertIntegrityPin } = require("./integrity");
const {
  buildReport,
  writeReport,
  readReport,
  exitCodeFor,
  inputHashesFromPkg,
  validatePrerequisiteReport,
  verifyDiskReportAgainstLive,
} = require("./reports");

const HARNESS_ROOT = path.join(__dirname, "..");

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(HARNESS_ROOT, rel), "utf8"));
}

function loadRuleset() {
  assertIntegrityPin();
  const rules = loadJson("rules/rules.json");
  const contracts = loadJson("rules/contracts.json");
  return { rules, contracts, version: contracts.version };
}

const HOP_ALIASES = {
  r0: "R0",
  brief: "R0",
  "r-vi": "R-VI",
  rvi: "R-VI",
  vi: "R-VI",
  r1: "R1",
  cv: "R1",
  r1b: "R1b",
  cl: "R1b",
  r2: "R2",
  profile: "R2",
  r3: "R3",
  closeout: "R3",
  chain: "chain",
  all: "chain",
};

function resolveHop(raw) {
  const key = String(raw || "").trim();
  if (!key) return null;
  if (HOP_ALIASES[key.toLowerCase()]) return HOP_ALIASES[key.toLowerCase()];
  if (HOP_RUNNERS[key]) return key;
  return null;
}

function hopOrder(contracts) {
  return contracts.hops.map((h) => h.id);
}

function hopMeta(contracts, hopId) {
  return contracts.hops.find((h) => h.id === hopId);
}

async function optionalFetch(url, timeoutMs) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      redirect: "manual",
      headers: { "user-agent": "career-hop-harness/1.0" },
    });
    let body = "";
    try {
      body = await res.text();
      if (body.length > 512 * 1024) body = body.slice(0, 512 * 1024);
    } catch {
      body = "";
    }
    return { status: res.status, timedOut: false, error: null, body };
  } catch (err) {
    const timedOut = err && (err.name === "AbortError" || /aborted/i.test(err.message || ""));
    return {
      status: null,
      timedOut,
      error: timedOut ? "timeout" : (err && err.message) || "fetch failed",
      body: "",
    };
  } finally {
    clearTimeout(timer);
  }
}

function prerequisiteChecks(hopId, contracts, memoryReports, reportsDir, pkg, rules, hopOpts) {
  const meta = hopMeta(contracts, hopId);
  const required = (meta && meta.requires) || [];
  return required.map((reqId) => {
    const mem = memoryReports[reqId];
    const disk = mem ? null : readReport(reportsDir, reqId);
    const report = mem || disk;
    const where = mem ? "this run" : disk ? "disk" : "missing";
    const runner = HOP_RUNNERS[reqId];
    const liveChecks = runner ? runner(pkg, rules, hopOpts || {}) : [];
    const validation = validatePrerequisiteReport(report, reqId, pkg, liveChecks);
    const ok = Boolean(validation.ok);
    return {
      id: `prerequisite-${reqId}`,
      severity: "P0",
      status: ok ? "PASS" : "FAIL",
      detail: ok
        ? `${reqId} ACCEPT (${where}, bound)`
        : `${reqId} has no valid ACCEPT report (${where}${report ? `, ${validation.reason}` : ""})`,
    };
  });
}

function formatReport(report) {
  const lines = [
    `${report.hop} ${report.name}  ${report.verdict}  (rules ${report.ruleset})`,
  ];
  for (const c of report.checks || []) {
    lines.push(`  ${c.status.padEnd(4)}  ${c.id}  ${c.severity}  ${c.detail}`);
  }
  return lines.join("\n");
}

async function runHops(opts) {
  const { rules, contracts, version } = opts.ruleset || loadRuleset();
  const pkg = loadPackage({
    packageDir: opts.packageDir,
    manifestPath: opts.manifestPath,
  });
  const reportsDir = path.resolve(opts.reportsDir || path.join(pkg.packageDir, "reports"));
  const requested = opts.hops;
  const memoryReports = { ...(opts.memoryReports || {}) };
  const inputHashes = inputHashesFromPkg(pkg);

  let fetchResult = opts.fetchResult || null;
  if (fetchResult == null && opts.fetchProfile && pkg.manifest.profile_url) {
    fetchResult = await optionalFetch(pkg.manifest.profile_url, opts.fetchTimeoutMs || 5000);
  }

  const reports = [];
  for (const hopId of requested) {
    const runner = HOP_RUNNERS[hopId];
    if (!runner) {
      throw new Error(`unknown hop ${hopId}`);
    }
    const meta = hopMeta(contracts, hopId);
    const hopOpts = { fetchResult };
    const diskBefore =
      opts.verify && hopId === "R3" ? readReport(reportsDir, hopId) : null;
    const checks = runner(pkg, rules, hopOpts);
    checks.push(
      ...prerequisiteChecks(
        hopId,
        contracts,
        memoryReports,
        reportsDir,
        pkg,
        rules,
        hopOpts
      )
    );
    if (opts.verify && hopId === "R3") {
      // Live re-run + decideVerdict(live checks). Disk verdict is not trusted.
      checks.push(...verifyDiskReportAgainstLive(diskBefore, checks, hopId));
    }
    const report = buildReport({
      hop: hopId,
      name: meta ? meta.name : hopId,
      ruleset: version,
      packageDir: pkg.packageDir,
      checks,
      inputHashes,
    });
    if (!opts.dryRun) writeReport(reportsDir, report);
    memoryReports[hopId] = report;
    reports.push(report);
    if (report.verdict !== "ACCEPT" && opts.stopOnFail !== false) {
      break;
    }
  }

  return {
    pkg,
    reportsDir,
    reports,
    last: reports[reports.length - 1] || null,
  };
}

function parseHopList(raw, contracts) {
  if (!raw) return [];
  const parts = String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const order = hopOrder(contracts);
  const hops = [];
  for (const part of parts) {
    const resolved = resolveHop(part);
    if (!resolved) {
      const err = new Error(`unknown hop: ${part}`);
      err.code = "USAGE";
      throw err;
    }
    if (resolved === "chain") {
      hops.push(...order);
    } else {
      hops.push(resolved);
    }
  }
  return hops;
}

module.exports = {
  HARNESS_ROOT,
  loadRuleset,
  resolveHop,
  hopOrder,
  parseHopList,
  runHops,
  formatReport,
  exitCodeFor,
  optionalFetch,
  prerequisiteChecks,
};
