"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { REQUIRED_HOP_CHECKS } = require("./hops");

const GENERATOR = "career-hop-harness";
const HASH_KEYS = ["manifest", "brief", "cv", "cl", "vi", "profile_html"];

function reportFilename(hopId) {
  return `${hopId}.json`;
}

function reportPath(reportsDir, hopId) {
  return path.join(reportsDir, reportFilename(hopId));
}

function sha256Text(text) {
  return crypto.createHash("sha256").update(String(text ?? ""), "utf8").digest("hex");
}

function fileHash(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return null;
  }
  return sha256Text(fs.readFileSync(filePath));
}

function canonicalPackageDir(dir) {
  return path.resolve(dir || "");
}

function inputHashesFromPkg(pkg) {
  return {
    manifest: fileHash(pkg && pkg.manifestPath),
    brief: fileHash(pkg && pkg.paths && pkg.paths.brief),
    cv: fileHash(pkg && pkg.paths && pkg.paths.cv),
    cl: fileHash(pkg && pkg.paths && pkg.paths.cl),
    vi: fileHash(pkg && pkg.paths && pkg.paths.vi),
    profile_html: fileHash(pkg && pkg.paths && pkg.paths.profileHtml),
  };
}

function computeBinding({ hop, verdict, ruleset, package_dir, input_hashes }) {
  const hashes = {};
  for (const key of HASH_KEYS) {
    hashes[key] = (input_hashes && input_hashes[key]) || null;
  }
  const canonical = JSON.stringify({
    generator: GENERATOR,
    hop,
    verdict,
    ruleset,
    package_dir: canonicalPackageDir(package_dir),
    input_hashes: hashes,
  });
  return sha256Text(canonical);
}

function hashesEqual(a, b) {
  for (const key of HASH_KEYS) {
    const left = (a && a[key]) || null;
    const right = (b && b[key]) || null;
    if (left !== right) return false;
  }
  return true;
}

function reportLooksHarnessGenerated(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) return false;
  if (report.generator !== GENERATOR) return false;
  if (!report.hop || !report.verdict || !report.ruleset) return false;
  if (!report.package_dir || typeof report.package_dir !== "string") return false;
  if (!report.input_hashes || typeof report.input_hashes !== "object") return false;
  if (!report.binding || typeof report.binding !== "string") return false;
  if (!Array.isArray(report.checks) || report.checks.length === 0) return false;
  if (report.checks.some((c) => !c || !c.id || !c.severity || !c.status)) return false;
  return computeBinding(report) === report.binding;
}

function checksMatchRealHopRun(report, hopId) {
  if (!report || !Array.isArray(report.checks) || report.checks.length === 0) {
    return { ok: false, reason: "empty or missing checks" };
  }
  const required = REQUIRED_HOP_CHECKS[hopId] || [];
  const ids = new Set(report.checks.map((c) => c && c.id).filter(Boolean));
  const missing = required.filter((id) => !ids.has(id));
  if (missing.length) {
    return {
      ok: false,
      reason: `checks do not match a real ${hopId} hop run (missing ${missing.join(", ")})`,
    };
  }
  return { ok: true, reason: "checks match a real hop run" };
}

function validatePrerequisiteReport(report, hopId, pkg) {
  if (!report) {
    return { ok: false, reason: "missing" };
  }
  if (!reportLooksHarnessGenerated(report)) {
    return { ok: false, reason: "forged (not harness-generated or binding invalid)" };
  }
  if (report.hop !== hopId) {
    return { ok: false, reason: `hop mismatch (${report.hop} != ${hopId})` };
  }
  if (report.verdict !== "ACCEPT") {
    return { ok: false, reason: `verdict=${report.verdict}` };
  }
  const currentDir = canonicalPackageDir(pkg.packageDir);
  if (canonicalPackageDir(report.package_dir) !== currentDir) {
    return { ok: false, reason: "package_dir does not bind to this package" };
  }
  const currentHashes = inputHashesFromPkg(pkg);
  if (!hashesEqual(report.input_hashes, currentHashes)) {
    return { ok: false, reason: "stale or cross-package input hashes" };
  }
  const hopShape = checksMatchRealHopRun(report, hopId);
  if (!hopShape.ok) {
    return { ok: false, reason: hopShape.reason };
  }
  return { ok: true, reason: "harness-generated, bound, fresh, real hop checks" };
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

function buildReport({ hop, name, ruleset, packageDir, checks, inputHashes }) {
  const verdict = decideVerdict(checks);
  const package_dir = canonicalPackageDir(packageDir);
  const input_hashes = {};
  for (const key of HASH_KEYS) {
    input_hashes[key] = (inputHashes && inputHashes[key]) || null;
  }
  const report = {
    generator: GENERATOR,
    hop,
    name,
    verdict,
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

module.exports = {
  GENERATOR,
  HASH_KEYS,
  reportFilename,
  reportPath,
  readReport,
  writeReport,
  loadReports,
  decideVerdict,
  exitCodeFor,
  buildReport,
  sha256Text,
  fileHash,
  inputHashesFromPkg,
  computeBinding,
  hashesEqual,
  reportLooksHarnessGenerated,
  validatePrerequisiteReport,
  canonicalPackageDir,
  checksMatchRealHopRun,
};
