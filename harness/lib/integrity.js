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
  "brief-page-slots",
  "brief-lead-matches-archetype",
  "brief-lead-assets-clearable",
  "r2-profile-follows-brief-slots",
  "profile-not-homepage",
  "r2-profile-work-images",
  "r2-profile-first-viewport-still",
  "r2-profile-still-early",
  "r2-profile-still-count",
  "r2-profile-traditional-credits",
  "r2-profile-traditional-lead",
  "r2-profile-ai-film-order",
  "r2-profile-vimeo-in-card",
  "r2-profile-not-old-shell",
  "r2-profile-not-homepage-skin",
  "vi-usage",
  "vi-not-chrome-only",
  "vi-primary-as-field",
  "r2-profile-showreel-picture",
  "r2-profile-credits-not-legal",
  "r2-profile-no-internal-ids",
  "r2-profile-invocation",
  "r2-profile-empty-work-cards",
  "r2-profile-brand-stills",
  "r2-profile-six-stage",
  "r2-profile-asset-clearance",
  "r2-profile-58node-route",
  "r2-profile-dev4-private",
  "r2-profile-p-led-pb-gallery",
  "r2-profile-recent-bar",
  "r2-profile-max-width",
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
    path.join(root, "rules", "asset-clearance.json"),
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
