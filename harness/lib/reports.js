"use strict";

const fs = require("fs");
const path = require("path");

function reportFilename(hopId) {
  return `${hopId}.json`;
}

function reportPath(reportsDir, hopId) {
  return path.join(reportsDir, reportFilename(hopId));
}

function readReport(reportsDir, hopId) {
  const file = reportPath(reportsDir, hopId);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { hop: hopId, verdict: "INVALID", error: "report is not valid JSON" };
  }
}

function writeReport(reportsDir, report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  const file = reportPath(reportsDir, report.hop);
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

function loadReports(reportsDir, hopIds) {
  const out = {};
  for (const id of hopIds) {
    out[id] = readReport(reportsDir, id);
  }
  return out;
}

function decideVerdict(checks) {
  const fails = (checks || []).filter((c) => c.status === "FAIL");
  if (fails.some((c) => c.severity === "P0")) return "REJECT";
  if (fails.length) return "REPAIR";
  return "ACCEPT";
}

function exitCodeFor(verdict, exitCodes) {
  const map = exitCodes || { ACCEPT: 0, REJECT: 1, REPAIR: 2 };
  return map[verdict] ?? 1;
}

function buildReport({ hop, name, ruleset, packageDir, checks }) {
  const verdict = decideVerdict(checks);
  return {
    hop,
    name,
    verdict,
    ruleset,
    generated_at: new Date().toISOString(),
    package_dir: packageDir,
    checks,
    failures: (checks || [])
      .filter((c) => c.status === "FAIL")
      .map((c) => `${c.id}: ${c.detail}`),
  };
}

module.exports = {
  reportFilename,
  reportPath,
  readReport,
  writeReport,
  loadReports,
  decideVerdict,
  exitCodeFor,
  buildReport,
};
