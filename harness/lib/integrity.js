"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PIN_PATH = path.join(__dirname, "..", "rules", "integrity.pin");

// Assertion table lives in a pinned file so deleting a required P0 id
// changes the honesty pin. Comparison is here, not only in excluded self-test.js.
const REQUIRED_RULE_IDS = [
  "no-profile-waiver",
  "no-cl-waiver",
  "brief-no-skip-language",
  "profile-not-homepage",
  "r2-profile-work-images",
  "r2-profile-first-viewport-still",
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

function pinInputPaths() {
  const root = path.join(__dirname, "..");
  const parts = [
    path.join(root, "rules", "rules.json"),
    path.join(root, "rules", "contracts.json"),
  ];
  const libDir = path.join(root, "lib");
  const libFiles = fs
    .readdirSync(libDir)
    .filter((f) => f.endsWith(".js") && f !== "self-test.js")
    .sort();
  for (const f of libFiles) parts.push(path.join(libDir, f));
  return { root, parts, libFiles };
}

function rulesetPin() {
  const { root, parts } = pinInputPaths();
  const h = crypto.createHash("sha256");
  for (const p of parts) {
    h.update(path.relative(root, p).split(path.sep).join("/"));
    h.update("\0");
    h.update(fs.readFileSync(p));
    h.update("\0");
  }
  h.update("REQUIRED_RULE_IDS\0");
  h.update(JSON.stringify(REQUIRED_RULE_IDS));
  h.update("\0");
  return h.digest("hex");
}

function expectedIntegrityPin() {
  const raw = fs.readFileSync(PIN_PATH, "utf8");
  const line = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .pop();
  return line || "";
}

function assertIntegrityPin() {
  const pin = rulesetPin();
  const expected = expectedIntegrityPin();
  if (pin !== expected) {
    const err = new Error(`ruleset integrity pin mismatch: got ${pin}`);
    err.code = "INTEGRITY";
    throw err;
  }
  return pin;
}

module.exports = {
  PIN_PATH,
  REQUIRED_RULE_IDS,
  pinInputPaths,
  rulesetPin,
  expectedIntegrityPin,
  assertIntegrityPin,
};
