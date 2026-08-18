"use strict";

/**
 * Asset-librarian gates. Catalog is harness/rules/asset-clearance.json
 * (named from assets.json + drs-source INDEX; HyperAgent files are not copied).
 * Text may cite a READY-but-private id. The file cannot hang.
 */

const fs = require("fs");
const path = require("path");
const { archetypeOf } = require("./profile-cards");

const CATALOG_PATH = path.join(__dirname, "..", "rules", "asset-clearance.json");

function loadCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
}

function isWonderRoute(pkg, html) {
  const url = String((pkg && pkg.manifest && pkg.manifest.profile_url) || "");
  const company = String((pkg && pkg.manifest && pkg.manifest.company) || "");
  if (/\/wonder\/?(?:[?#]|$)/i.test(url)) return true;
  if (/^wonder$/i.test(company.trim())) return true;
  if (/ai\.drsfilms\.com\/wonder\//i.test(String(html || ""))) return true;
  return false;
}

function imgTags(html) {
  return [...String(html || "").matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
}

function matchCatalogAsset(tag, catalog) {
  const assets = (catalog && catalog.assets) || [];
  for (const asset of assets) {
    const pats = asset.src_patterns || [];
    if (pats.some((p) => new RegExp(p, "i").test(tag))) return asset;
  }
  return null;
}

function outwardImagesCleared(html, pkg) {
  const catalog = loadCatalog();
  const wonder = isWonderRoute(pkg, html);
  for (const tag of imgTags(html)) {
    const asset = matchCatalogAsset(tag, catalog);
    if (!asset) continue;
    if (asset.wonder_only_until_generic_public) {
      if (catalog.generic_58node_public || wonder) continue;
      return {
        ok: false,
        reason:
          "A-WORKFLOW-58NODE hung off /wonder/ (no generic public:true version yet)",
      };
    }
    if (asset.must_reskin_off_wonder && !wonder) {
      return {
        ok: false,
        reason:
          "A-WORKFLOW-6STAGE Drive original hung; not in DRS INDEX — non-Wonder pages must reskin",
      };
    }
    if (asset.external_ready && asset.drs_public) continue;
    return {
      ok: false,
      reason: `outward image ${asset.id} requires assets.json external_ready:true AND INDEX public:true (file cannot hang; text cite OK)`,
    };
  }
  return {
    ok: true,
    reason: "hung images are cleared (external_ready + DRS public), or uncatalogued fixture stills",
  };
}

function fiftyEightNodeRouteOk(html, pkg) {
  const catalog = loadCatalog();
  const hung = imgTags(html).some((tag) => {
    const asset = matchCatalogAsset(tag, catalog);
    return asset && asset.wonder_only_until_generic_public;
  });
  if (!hung) {
    return { ok: true, reason: "no 58-node file hung" };
  }
  if (catalog.generic_58node_public) {
    return { ok: true, reason: "generic 58-node is READY + DRS public" };
  }
  if (isWonderRoute(pkg, html)) {
    return { ok: true, reason: "58-node file legal on /wonder/ until a generic public version exists" };
  }
  return {
    ok: false,
    reason: "A-WORKFLOW-58NODE file hung off /wonder/ (REJECT until generic public:true)",
  };
}

function dev4NotHung(html) {
  const catalog = loadCatalog();
  for (const tag of imgTags(html)) {
    const asset = matchCatalogAsset(tag, catalog);
    if (asset && asset.suite === "DEV4") {
      return {
        ok: false,
        reason:
          "A-TOOLS-DEV4 screenshot hung (all four UIs are public:false; in-development label does not waive INDEX)",
      };
    }
  }
  return { ok: true, reason: "no DEV4 screenshots hung" };
}

function pLedNoPbGallery(html, pkg) {
  if (archetypeOf(pkg) !== "P") {
    return { ok: true, reason: "Prompt Builder gallery N/A off P-led" };
  }
  const src = String(html || "");
  const pbImgs = imgTags(src).filter((t) => /prompt-builder-ui/i.test(t));
  if (pbImgs.length >= 2) {
    return {
      ok: false,
      reason: "P-led Prompt Builder gallery (multiple UI stills)",
    };
  }
  const tools = src.match(
    /<section\b[^>]*(?:id|class)=["'][^"']*\btools\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i
  );
  if (tools && /<img\b[^>]*prompt-builder-ui/i.test(tools[1])) {
    return {
      ok: false,
      reason: "P-led Prompt Builder gallery (product shot hung in tools)",
    };
  }
  if (pbImgs.length === 1) {
    return {
      ok: false,
      reason: "P-led Prompt Builder gallery (product shot hung)",
    };
  }
  return { ok: true, reason: "no P-led Prompt Builder gallery" };
}

module.exports = {
  CATALOG_PATH,
  loadCatalog,
  isWonderRoute,
  outwardImagesCleared,
  fiftyEightNodeRouteOk,
  dev4NotHung,
  pLedNoPbGallery,
};
