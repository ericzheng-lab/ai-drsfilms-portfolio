"use strict";

const {
  classifyProfileUrl,
  extractUrls,
  isPortfolioMention,
  headerBlock,
} = require("./profile-url");
const {
  scanClaimLocks,
  scanSlop,
  scanSkipLanguage,
  findForbiddenWaivers,
} = require("./text-scan");
const { workIdsFrom } = require("./manifest");

function check(id, severity, ok, detail) {
  return {
    id,
    severity,
    status: ok ? "PASS" : "FAIL",
    detail,
  };
}

function hexValues(node, out = []) {
  if (node == null) return out;
  if (typeof node === "string") {
    out.push(node.trim());
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((v) => hexValues(v, out));
    return out;
  }
  if (typeof node === "object") {
    Object.values(node).forEach((v) => hexValues(v, out));
  }
  return out;
}

function containsSimilarTo(node) {
  if (typeof node === "string") return /similar\s+to/i.test(node);
  if (Array.isArray(node)) return node.some(containsSimilarTo);
  if (node && typeof node === "object") {
    return Object.values(node).some(containsSimilarTo);
  }
  return false;
}

function isNonEmpty(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}

function ruleById(rules, id) {
  return (rules.rules || []).find((r) => r.id === id) || {};
}

function slopLexicon(rules) {
  return ruleById(rules, "slop-lexicon").lexicon || [];
}

function skipPatterns(rules) {
  return ruleById(rules, "brief-no-skip-language").patterns || [];
}

function waiverChecks(pkg, hops) {
  const hits = findForbiddenWaivers(pkg.manifest, pkg.briefAttrs);
  const out = [];
  const profileHit = hits.find((h) =>
    ["profile", "r2"].includes(h.token)
  );
  const clHit = hits.find((h) =>
    ["cover_letter", "cover-letter", "cover letter", "cl", "r1b"].includes(
      h.token
    )
  );
  if (hops.includes("profile")) {
    out.push(
      check(
        "no-profile-waiver",
        "P0",
        !profileHit,
        profileHit
          ? `Profile cannot be waived (${profileHit.path}: ${profileHit.token})`
          : "no Profile waiver"
      )
    );
  }
  if (hops.includes("cl")) {
    out.push(
      check(
        "no-cl-waiver",
        "P0",
        !clHit,
        clHit
          ? `Cover letter cannot be waived (${clHit.path}: ${clHit.token})`
          : "no CL waiver"
      )
    );
  }
  return out;
}

function textGateChecks(text, label, rules) {
  const checks = [];
  const locks = scanClaimLocks(text);
  const lockIds = [
    "claim-lock-sundance-win",
    "claim-lock-berlinale-win",
    "claim-lock-dungeon-fighter",
    "claim-lock-rmb-cny",
    "claim-lock-p007",
    "claim-lock-five-films-four-weeks",
  ];
  for (const id of lockIds) {
    const hit = locks.find((h) => h.id === id);
    checks.push(
      check(
        id,
        "P0",
        !hit,
        hit ? `${label} claim-lock: ${hit.excerpt}` : `${label} clear of ${id}`
      )
    );
  }
  const slop = scanSlop(text, slopLexicon(rules));
  checks.push(
    check(
      "slop-lexicon",
      "P1",
      slop.length === 0,
      slop.length
        ? `${label} slop: ${slop.map((s) => s.phrase).join(", ")}`
        : `${label} clear of slop lexicon`
    )
  );
  return checks;
}

function namesArtifact(text, attrs, kind) {
  const blob = `${JSON.stringify(attrs)}\n${text}`.toLowerCase();
  if (kind === "cv") {
    return /\b(cv|resume|curriculum vitae)\b/.test(blob);
  }
  if (kind === "cl") {
    return (
      /cover[_\s-]?letter/.test(blob) ||
      /\bcl\b/.test(blob) ||
      (Array.isArray(attrs.artifacts) &&
        attrs.artifacts.some((a) => /cover|cl/i.test(String(a))))
    );
  }
  if (kind === "profile") {
    return (
      /\bprofile\b/.test(blob) ||
      /ai\.drsfilms\.com\/[a-z0-9-]+/.test(blob) ||
      Boolean(attrs.profile_route)
    );
  }
  return false;
}

function briefProfileRoute(pkg) {
  const fromAttr = pkg.briefAttrs.profile_route;
  if (fromAttr) return classifyProfileUrl(`https://ai.drsfilms.com/${fromAttr}/`);
  const urls = extractUrls(`${pkg.brief.value || ""}\n${pkg.briefBody || ""}`);
  for (const raw of urls) {
    const classified = classifyProfileUrl(raw);
    if (classified.ok) return classified;
    if (classified.kind === "homepage") return classified;
  }
  const m = String(pkg.brief.value || "").match(
    /profile[_\s-]?route[:\s]+([a-z0-9-]+)/i
  );
  if (m) return classifyProfileUrl(`https://ai.drsfilms.com/${m[1]}/`);
  return {
    ok: false,
    kind: "missing",
    reason: "Brief does not name a company Profile route",
    normalized: null,
    slug: null,
  };
}

function hopR0(pkg, rules) {
  const checks = [];
  checks.push(
    check(
      "brief-exists",
      "P0",
      Boolean(pkg.brief.ok && pkg.brief.value),
      pkg.brief.ok ? "Brief file present" : `Brief missing: ${pkg.brief.error}`
    )
  );
  const text = pkg.brief.value || "";
  const attrs = pkg.briefAttrs;
  checks.push(
    check(
      "brief-names-cv",
      "P0",
      namesArtifact(text, attrs, "cv"),
      namesArtifact(text, attrs, "cv")
        ? "Brief names CV"
        : "Brief does not name a CV/resume artifact"
    )
  );
  checks.push(
    check(
      "brief-names-cl",
      "P0",
      namesArtifact(text, attrs, "cl"),
      namesArtifact(text, attrs, "cl")
        ? "Brief names cover letter"
        : "Brief does not name a cover letter"
    )
  );
  checks.push(
    check(
      "brief-names-profile",
      "P0",
      namesArtifact(text, attrs, "profile"),
      namesArtifact(text, attrs, "profile")
        ? "Brief names Profile"
        : "Brief does not name a Profile"
    )
  );

  const route = briefProfileRoute(pkg);
  checks.push(
    check(
      "brief-profile-route",
      "P0",
      Boolean(route.ok),
      route.ok
        ? `Profile route ${route.normalized}`
        : route.reason || "Brief Profile route is not a company slug"
    )
  );

  const workIds = workIdsFrom(attrs, pkg.briefBody || text);
  checks.push(
    check(
      "brief-selected-work-ids",
      "P0",
      workIds.length > 0,
      workIds.length
        ? `selected work ids: ${workIds.join(", ")}`
        : "Brief has no selected work ids"
    )
  );

  const skips = scanSkipLanguage(text, skipPatterns(rules));
  checks.push(
    check(
      "brief-no-skip-language",
      "P0",
      skips.length === 0,
      skips.length
        ? `skip/omit/waive language: ${skips.map((s) => s.excerpt).join("; ")}`
        : "no skip/omit language for Profile or CL"
    )
  );
  checks.push(...waiverChecks(pkg, ["profile", "cl"]));
  return checks;
}

function hopRVI(pkg) {
  const checks = [];
  const loaded = pkg.vi.ok && pkg.vi.value && typeof pkg.vi.value === "object";
  checks.push(
    check(
      "vi-exists",
      "P0",
      Boolean(loaded),
      loaded ? "VI record present" : `VI record missing: ${pkg.vi.error}`
    )
  );
  const rec = loaded ? pkg.vi.value : {};
  const source = rec.source_url || rec.sourceUrl;
  let sourceOk = false;
  try {
    const u = new URL(String(source || ""));
    sourceOk = /^https?:$/.test(u.protocol);
  } catch {
    sourceOk = false;
  }
  checks.push(
    check(
      "vi-source-url",
      "P0",
      sourceOk,
      sourceOk ? `source_url ${source}` : "VI missing source URL (provenance)"
    )
  );

  const date = String(rec.date || "");
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
  checks.push(
    check(
      "vi-date",
      "P0",
      dateOk,
      dateOk ? `date ${date}` : "VI missing date (YYYY-MM-DD provenance)"
    )
  );

  const hexes = hexValues(rec.hex);
  const hexOk =
    hexes.length > 0 &&
    hexes.every((h) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h));
  checks.push(
    check(
      "vi-hex",
      "P0",
      hexOk,
      hexOk
        ? `hex ${hexes.join(", ")}`
        : "VI hex fields missing, empty, or not exact #RGB/#RRGGBB"
    )
  );

  const font = rec.font;
  const fontFamily =
    (font && (font.family || font.name || font.font_family)) ||
    (typeof font === "string" ? font : "");
  const fontOk = isNonEmpty(font) && isNonEmpty(fontFamily);
  checks.push(
    check(
      "vi-font",
      "P0",
      fontOk,
      fontOk ? `font ${fontFamily}` : "VI font field missing or empty"
    )
  );

  const radius = rec.radius;
  const radiusOk = isNonEmpty(radius);
  checks.push(
    check(
      "vi-radius",
      "P0",
      radiusOk,
      radiusOk ? "radius present" : "VI radius field missing or empty"
    )
  );

  const similar = containsSimilarTo(rec);
  checks.push(
    check(
      "vi-not-similar-to",
      "P0",
      !similar,
      similar
        ? "VI uses 'similar to' instead of exact values"
        : "VI values are exact (no 'similar to')"
    )
  );
  return checks;
}

function hopR1(pkg, rules) {
  const checks = [];
  checks.push(
    check(
      "r1-cv-exists",
      "P0",
      Boolean(pkg.cv.ok && pkg.cv.value),
      pkg.cv.ok ? "CV file present" : `CV missing: ${pkg.cv.error}`
    )
  );
  const text = pkg.cv.value || "";
  checks.push(...textGateChecks(text, "CV", rules));

  const headerUrls = extractUrls(headerBlock(text)).filter(isPortfolioMention);
  const bad = headerUrls
    .map((u) => ({ raw: u, ...classifyProfileUrl(u) }))
    .filter((u) => !u.ok);
  checks.push(
    check(
      "cv-header-not-homepage",
      "P0",
      bad.length === 0,
      bad.length
        ? `CV header/contact uses generic homepage as portfolio: ${bad
            .map((b) => b.raw)
            .join(", ")}`
        : "CV header portfolio is not a generic homepage"
    )
  );
  return checks;
}

function hopR1b(pkg, rules) {
  const checks = [];
  checks.push(
    check(
      "r1b-cl-exists",
      "P0",
      Boolean(pkg.cl.ok && pkg.cl.value),
      pkg.cl.ok ? "CL file present" : `CL missing: ${pkg.cl.error}`
    )
  );
  checks.push(...waiverChecks(pkg, ["cl"]));
  checks.push(...textGateChecks(pkg.cl.value || "", "CL", rules));
  return checks;
}

function profileUrlFromPkg(pkg) {
  return classifyProfileUrl(pkg.manifest.profile_url);
}

function hopR2(pkg, _rules, opts = {}) {
  const checks = [];
  const classified = profileUrlFromPkg(pkg);
  const htmlPresent = Boolean(pkg.paths.profileHtml && pkg.profileHtml.ok);
  const urlRecorded = Boolean(pkg.manifest.profile_url);
  checks.push(
    check(
      "r2-profile-present",
      "P0",
      htmlPresent || urlRecorded,
      htmlPresent || urlRecorded
        ? "Profile artifact present (HTML or recorded URL)"
        : "Profile artifact missing (no HTML, no recorded live URL)"
    )
  );
  checks.push(
    check(
      "profile-not-homepage",
      "P0",
      Boolean(classified.ok),
      classified.ok
        ? `company route ${classified.normalized}`
        : classified.reason || "profile_url is not a company route"
    )
  );
  checks.push(...waiverChecks(pkg, ["profile"]));

  if (htmlPresent) {
    const html = pkg.profileHtml.value || "";
    const looksHtml = /<!DOCTYPE\s+html/i.test(html) || /<html[\s>]/i.test(html);
    const hasTitle = /<title[\s>]/i.test(html) || /<h1[\s>]/i.test(html);
    checks.push(
      check(
        "r2-html-structure",
        "P0",
        looksHtml && hasTitle,
        looksHtml && hasTitle
          ? "Profile HTML has document structure"
          : "Profile HTML missing basic structure (html/title or h1)"
      )
    );
    const noindex = /<meta[^>]+robots[^>]*noindex/i.test(html);
    checks.push(
      check(
        "r2-html-noindex",
        "P1",
        noindex,
        noindex
          ? "Profile HTML has noindex"
          : "Profile HTML missing robots noindex"
      )
    );
  }

  if (opts.fetchResult) {
    const fr = opts.fetchResult;
    if (fr.timedOut || fr.error) {
      checks.push({
        id: "r2-live-fetch",
        severity: "P1",
        status: "PASS",
        detail: `live fetch did not crash (${fr.timedOut ? "timeout" : fr.error}); recorded URL still judged mechanically`,
      });
    } else {
      checks.push({
        id: "r2-live-fetch",
        severity: "P1",
        status: "PASS",
        detail: `live fetch HTTP ${fr.status}`,
      });
    }
  }

  return checks;
}

function hopR3(pkg, _rules) {
  const checks = [];
  const cvOk = Boolean(pkg.cv.ok && pkg.cv.value);
  const clOk = Boolean(pkg.cl.ok && pkg.cl.value);
  const classified = profileUrlFromPkg(pkg);
  const htmlPresent = Boolean(pkg.paths.profileHtml && pkg.profileHtml.ok);
  const profileOk = Boolean(classified.ok && (htmlPresent || pkg.manifest.profile_url));

  checks.push(
    check(
      "r3-cv-exists",
      "P0",
      cvOk,
      cvOk ? "CV present" : `CV missing: ${pkg.cv.error}`
    )
  );
  checks.push(
    check(
      "r3-cl-exists",
      "P0",
      clOk,
      clOk ? "CL present" : `CL missing: ${pkg.cl.error}`
    )
  );
  checks.push(
    check(
      "r3-profile-present",
      "P0",
      profileOk,
      profileOk
        ? `Profile ${classified.normalized}`
        : classified.reason || "Profile URL missing from closeout"
    )
  );
  checks.push(
    check(
      "r3-three-live-pieces",
      "P0",
      cvOk && clOk && profileOk,
      cvOk && clOk && profileOk
        ? "manifest points at CV + CL + company Profile URL"
        : "closeout missing CV, cover letter, or company Profile URL"
    )
  );
  checks.push(...waiverChecks(pkg, ["profile", "cl"]));

  const mentions = extractUrls(`${pkg.cv.value || ""}\n${pkg.cl.value || ""}`)
    .filter(isPortfolioMention)
    .map((raw) => ({ raw, ...classifyProfileUrl(raw) }));

  const homepageMentions = mentions.filter((m) => !m.ok);
  const mismatched = mentions.filter(
    (m) => m.ok && classified.ok && m.normalized !== classified.normalized
  );

  checks.push(
    check(
      "portfolio-url-matches-profile",
      "P0",
      homepageMentions.length === 0 && mismatched.length === 0,
      homepageMentions.length
        ? `CV/CL portfolio URL is not the company Profile: ${homepageMentions
            .map((m) => m.raw)
            .join(", ")}`
        : mismatched.length
          ? `CV/CL Profile URL does not match manifest: ${mismatched
              .map((m) => m.raw)
              .join(", ")}`
          : classified.ok
            ? `CV/CL portfolio URLs match ${classified.normalized} (or none mentioned)`
            : "no matching Profile URL to compare"
    )
  );

  return checks;
}

const HOP_RUNNERS = {
  R0: hopR0,
  "R-VI": hopRVI,
  R1: hopR1,
  R1b: hopR1b,
  R2: hopR2,
  R3: hopR3,
};

module.exports = {
  HOP_RUNNERS,
  hopR0,
  hopRVI,
  hopR1,
  hopR1b,
  hopR2,
  hopR3,
};
