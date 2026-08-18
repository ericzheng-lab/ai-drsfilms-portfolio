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
const {
  htmlHasWorkImages,
  firstViewportHasStill,
  firstStillIsEarly,
  htmlHasEnoughStills,
} = require("./profile-images");

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

function companySlug(name) {
  return String(name || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function localProfileHtmlEvidence(pkg) {
  const htmlPresent = Boolean(
    pkg.paths.profileHtml && pkg.profileHtml.ok && String(pkg.profileHtml.value || "").trim()
  );
  if (!htmlPresent) {
    return { ok: false, reason: "no local profile HTML" };
  }
  const html = pkg.profileHtml.value || "";
  const looksHtml = /<!DOCTYPE\s+html/i.test(html) || /<html[\s>]/i.test(html);
  const hasTitle = /<title[\s>]/i.test(html) || /<h1[\s>]/i.test(html);
  if (!(looksHtml && hasTitle)) {
    return {
      ok: false,
      reason: "local profile HTML missing basic structure (html/title or h1)",
    };
  }
  return { ok: true, reason: "real local profile HTML" };
}

const BUILTIN_COMPANY_ALIASES = {
  "meta platforms inc": ["meta"],
  "meta platforms incorporated": ["meta"],
  "alphabet inc": ["google", "alphabet"],
  "alphabet incorporated": ["google", "alphabet"],
};

const LEGAL_NAME_STOPWORDS = new Set([
  "inc",
  "incorporated",
  "llc",
  "ltd",
  "limited",
  "corp",
  "corporation",
  "co",
  "company",
  "the",
  "of",
  "and",
  "plc",
  "gmbh",
  "ag",
  "sa",
]);

function normalizeCompanyKey(name) {
  return String(name || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function companyNameTokens(name) {
  return normalizeCompanyKey(name)
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !LEGAL_NAME_STOPWORDS.has(t));
}

function isBoundaryPrefix(haystack, needle) {
  if (!haystack || !needle || needle.length < 3) return false;
  if (!haystack.startsWith(needle)) return false;
  if (haystack.length === needle.length) return true;
  return haystack[needle.length] === "-";
}

function isShorteningOfCompany(company, alias) {
  const aliasSlug = companySlug(alias);
  if (!aliasSlug || aliasSlug.length < 2) return false;
  const tokens = companyNameTokens(company);
  if (tokens.length === 0) return false;
  if (tokens.includes(aliasSlug)) return true;
  const joinedHyphen = tokens.join("-");
  const joined = tokens.join("");
  const aliasCompact = aliasSlug.replace(/-/g, "");
  if (aliasSlug === joinedHyphen || aliasCompact === joined) return true;
  const first = tokens[0];
  if (isBoundaryPrefix(first, aliasSlug)) return true;
  if (isBoundaryPrefix(joinedHyphen, aliasSlug)) return true;
  if (isBoundaryPrefix(joined, aliasCompact)) return true;
  return false;
}

function isTrustedCompanyAlias(company, alias) {
  const s = companySlug(alias);
  if (!s) return false;
  const builtin = BUILTIN_COMPANY_ALIASES[normalizeCompanyKey(company)] || [];
  if (builtin.some((b) => companySlug(b) === s)) return true;
  return isShorteningOfCompany(company, alias);
}

function companyAliasSet(pkg) {
  const aliases = new Set();
  const company = String((pkg && pkg.manifest && pkg.manifest.company) || "").trim();
  const slug = companySlug(company);
  if (slug) aliases.add(slug);
  const builtin = BUILTIN_COMPANY_ALIASES[normalizeCompanyKey(company)] || [];
  for (const raw of builtin) {
    const s = companySlug(raw);
    if (s) aliases.add(s);
  }
  const fromManifest =
    (pkg && pkg.manifest && pkg.manifest.company_aliases) || [];
  if (Array.isArray(fromManifest)) {
    for (const raw of fromManifest) {
      if (!isTrustedCompanyAlias(company, raw)) continue;
      const s = companySlug(raw);
      if (s) aliases.add(s);
    }
  }
  return aliases;
}

function profileContentMarkers(pkg) {
  const markers = [];
  const company = String((pkg && pkg.manifest && pkg.manifest.company) || "").trim();
  if (company) markers.push(company);
  const classified = pkg ? classifyProfileUrl((pkg.manifest || {}).profile_url) : null;
  if (classified && classified.slug) markers.push(classified.slug);
  for (const alias of companyAliasSet(pkg)) markers.push(alias);
  return [...new Set(markers.filter(Boolean))];
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function bodyHasProfileMarker(body, pkg) {
  const src = String(body || "");
  if (!src.trim()) return { ok: false, marker: null };
  const lower = src.toLowerCase();
  const classified = pkg ? classifyProfileUrl((pkg.manifest || {}).profile_url) : null;
  if (classified && classified.ok && classified.slug) {
    const slug = classified.slug;
    const hostPath = `ai.drsfilms.com/${slug}`;
    const pathRe = new RegExp(
      `(?:^|[^a-z0-9-])/${escapeRe(slug)}(?:/|[^a-z0-9-]|$)`,
      "i"
    );
    if (lower.includes(hostPath) || pathRe.test(src)) {
      return { ok: true, marker: `/${slug}/` };
    }
  }
  return { ok: false, marker: null };
}

function liveFetchEvidence(fetchResult, pkg) {
  if (!fetchResult) {
    return { ok: false, performed: false, reason: "live fetch not performed" };
  }
  if (fetchResult.timedOut) {
    return { ok: false, performed: true, reason: "live fetch timeout" };
  }
  if (fetchResult.error) {
    return { ok: false, performed: true, reason: `live fetch error: ${fetchResult.error}` };
  }
  const status = fetchResult.status;
  if (typeof status !== "number") {
    return { ok: false, performed: true, reason: "live fetch returned no HTTP status" };
  }
  if (status < 200 || status >= 300) {
    return {
      ok: false,
      performed: true,
      reason: `live fetch HTTP ${status} (need 2xx)`,
    };
  }
  const marked = bodyHasProfileMarker(fetchResult.body, pkg);
  if (!marked.ok) {
    return {
      ok: false,
      performed: true,
      reason:
        "live fetch HTTP 2xx but body missing company/slug marker (SPA fallback / empty shell)",
    };
  }
  return {
    ok: true,
    performed: true,
    reason: `live fetch HTTP ${status} with marker ${marked.marker}`,
  };
}

function realProfileExists(pkg, opts = {}) {
  const local = localProfileHtmlEvidence(pkg);
  const live = liveFetchEvidence(opts.fetchResult, pkg);
  return {
    ok: Boolean(live.ok),
    local,
    live,
    detail: live.ok
      ? live.reason
      : `no qualifying live Profile evidence (${live.reason}${
          local.ok ? "; local HTML is not sufficient" : `; ${local.reason}`
        })`,
  };
}

function clDistinctFromCv(pkg) {
  const cl = String(pkg.cl.value || "").trim();
  const cv = String(pkg.cv.value || "").trim();
  if (!cl) return { ok: false, reason: "CL is empty" };
  if (cl === cv) return { ok: false, reason: "CL is a copy of the CV" };
  return { ok: true, reason: "CL is distinct and nonempty" };
}

function citesNormalized(text, normalized) {
  if (!normalized) return false;
  return extractUrls(text || "")
    .filter(isPortfolioMention)
    .map((raw) => classifyProfileUrl(raw))
    .some((c) => c.ok && c.normalized === normalized);
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

function textGateChecks(text, label, rules, idPrefix = "") {
  const cid = (id) => `${idPrefix}${id}`;
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
        cid(id),
        "P0",
        !hit,
        hit ? `${label} claim-lock: ${hit.excerpt}` : `${label} clear of ${id}`
      )
    );
  }
  const slop = scanSlop(text, slopLexicon(rules));
  checks.push(
    check(
      cid("slop-lexicon"),
      "P1",
      slop.length === 0,
      slop.length
        ? `${label} slop: ${slop.map((s) => s.phrase).join(", ")}`
        : `${label} clear of slop lexicon`
    )
  );
  return checks;
}

function skipLanguageCheck(text, label, rules, id) {
  const skips = scanSkipLanguage(text, skipPatterns(rules));
  return check(
    id,
    "P0",
    skips.length === 0,
    skips.length
      ? `${label} skip/omit/waive language: ${skips.map((s) => s.excerpt).join("; ")}`
      : `${label} clear of skip/omit language`
  );
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
  checks.push(...textGateChecks(pkg.cv.value || "", "CV", rules));

  const headerUrls = extractUrls(headerBlock(pkg.cv.value || "")).filter(isPortfolioMention);
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
  const distinct = clDistinctFromCv(pkg);
  checks.push(
    check("r1b-cl-distinct", "P0", distinct.ok, distinct.reason)
  );
  checks.push(...waiverChecks(pkg, ["cl"]));
  checks.push(...textGateChecks(pkg.cl.value || "", "CL", rules));
  return checks;
}

function profileUrlFromPkg(pkg) {
  return classifyProfileUrl(pkg.manifest.profile_url);
}

function slugMatchesCompany(pkg, classified) {
  const aliases = companyAliasSet(pkg);
  const expected = companySlug(pkg.manifest.company);
  const ok = Boolean(classified.ok && classified.slug && aliases.has(classified.slug));
  return {
    ok,
    expected,
    aliases: [...aliases],
    detail: ok
      ? `slug ${classified.slug} matches company alias set`
      : classified.ok
        ? `profile slug ${classified.slug} not in company alias set {${[...aliases].join(", ") || expected || "(empty)"}}`
        : "no company Profile slug to compare",
  };
}

function profileWorkImageGate(pkg, opts = {}) {
  const localHtml =
    pkg.paths.profileHtml && pkg.profileHtml.ok
      ? String(pkg.profileHtml.value || "").trim()
      : "";
  const liveHtml =
    opts.fetchResult && opts.fetchResult.body
      ? String(opts.fetchResult.body || "").trim()
      : "";
  const parts = [];
  let ok = true;
  if (localHtml) {
    const ev = htmlHasWorkImages(localHtml);
    parts.push(`local HTML: ${ev.reason}`);
    if (!ev.ok) ok = false;
  }
  if (liveHtml) {
    const ev = htmlHasWorkImages(liveHtml);
    parts.push(`live HTML: ${ev.reason}`);
    if (!ev.ok) ok = false;
  }
  if (!localHtml && !liveHtml) {
    return {
      ok: false,
      detail: "no Profile HTML to inspect for work images; text-only / missing stills",
    };
  }
  return {
    ok,
    detail: ok
      ? parts.join("; ")
      : `text-only Profile (work stills required): ${parts.join("; ")}`,
  };
}

function profileFirstViewportGate(pkg, opts = {}) {
  const localHtml =
    pkg.paths.profileHtml && pkg.profileHtml.ok
      ? String(pkg.profileHtml.value || "").trim()
      : "";
  const liveHtml =
    opts.fetchResult && opts.fetchResult.body
      ? String(opts.fetchResult.body || "").trim()
      : "";
  const parts = [];
  let ok = true;
  if (localHtml) {
    const ev = firstViewportHasStill(localHtml);
    parts.push(`local HTML: ${ev.reason}`);
    if (!ev.ok) ok = false;
  }
  if (liveHtml) {
    const ev = firstViewportHasStill(liveHtml);
    parts.push(`live HTML: ${ev.reason}`);
    if (!ev.ok) ok = false;
  }
  if (!localHtml && !liveHtml) {
    return { ok: false, detail: "no Profile HTML to inspect for first-viewport still" };
  }
  return {
    ok,
    detail: ok
      ? parts.join("; ")
      : `blank / spacer first viewport: ${parts.join("; ")}`,
  };
}

function profileHtmlSides(pkg, opts = {}) {
  const localHtml =
    pkg.paths.profileHtml && pkg.profileHtml.ok
      ? String(pkg.profileHtml.value || "").trim()
      : "";
  const liveHtml =
    opts.fetchResult && opts.fetchResult.body
      ? String(opts.fetchResult.body || "").trim()
      : "";
  return { localHtml, liveHtml };
}

function profileGateFrom(fn, emptyDetail, failPrefix) {
  return function profileGate(pkg, opts = {}) {
    const { localHtml, liveHtml } = profileHtmlSides(pkg, opts);
    const parts = [];
    let ok = true;
    if (localHtml) {
      const ev = fn(localHtml);
      parts.push(`local HTML: ${ev.reason}`);
      if (!ev.ok) ok = false;
    }
    if (liveHtml) {
      const ev = fn(liveHtml);
      parts.push(`live HTML: ${ev.reason}`);
      if (!ev.ok) ok = false;
    }
    if (!localHtml && !liveHtml) {
      return { ok: false, detail: emptyDetail };
    }
    return {
      ok,
      detail: ok ? parts.join("; ") : `${failPrefix}: ${parts.join("; ")}`,
    };
  };
}

const profileStillEarlyGate = profileGateFrom(
  firstStillIsEarly,
  "no Profile HTML to inspect for still-early (B-C6)",
  "first still is too late (B-C6 / B-WKS4 / B-P3)"
);

const profileStillCountGate = profileGateFrom(
  htmlHasEnoughStills,
  "no Profile HTML to inspect for still count (B-WKS4)",
  "too few work stills (B-WKS4)"
);

function hopR2(pkg, rules, opts = {}) {
  const checks = [];
  const classified = profileUrlFromPkg(pkg);
  const evidence = realProfileExists(pkg, opts);
  checks.push(
    check(
      "r2-profile-present",
      "P0",
      evidence.ok,
      evidence.detail
    )
  );
  const stills = profileWorkImageGate(pkg, opts);
  checks.push(check("r2-profile-work-images", "P0", stills.ok, stills.detail));
  const viewport = profileFirstViewportGate(pkg, opts);
  checks.push(
    check("r2-profile-first-viewport-still", "P0", viewport.ok, viewport.detail)
  );
  const early = profileStillEarlyGate(pkg, opts);
  checks.push(check("r2-profile-still-early", "P0", early.ok, early.detail));
  const count = profileStillCountGate(pkg, opts);
  checks.push(check("r2-profile-still-count", "P0", count.ok, count.detail));
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
  const slug = slugMatchesCompany(pkg, classified);
  checks.push(check("profile-slug-matches-company", "P0", slug.ok, slug.detail));
  checks.push(...waiverChecks(pkg, ["profile"]));

  const htmlPresent = evidence.local.ok || Boolean(pkg.paths.profileHtml && pkg.profileHtml.ok);
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
    checks.push(...textGateChecks(html, "Profile HTML", rules));
  }

  if (opts.fetchResult) {
    const live = evidence.live;
    checks.push(
      check(
        "r2-live-fetch",
        "P0",
        live.ok,
        live.reason
      )
    );
  }

  return checks;
}

function hopR3(pkg, rules, opts = {}) {
  const checks = [];
  const cvOk = Boolean(pkg.cv.ok && pkg.cv.value);
  const clOk = Boolean(pkg.cl.ok && pkg.cl.value);
  const classified = profileUrlFromPkg(pkg);
  const evidence = realProfileExists(pkg, opts);
  const profileOk = Boolean(classified.ok && evidence.ok);

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
  const distinct = clDistinctFromCv(pkg);
  checks.push(check("r3-cl-distinct", "P0", distinct.ok, distinct.reason));
  checks.push(
    check(
      "r3-profile-present",
      "P0",
      profileOk,
      profileOk
        ? `Profile ${classified.normalized} (${evidence.detail})`
        : evidence.ok
          ? classified.reason || "Profile URL is not a company route"
          : evidence.detail
    )
  );
  checks.push(
    check(
      "r3-three-live-pieces",
      "P0",
      cvOk && clOk && profileOk,
      cvOk && clOk && profileOk
        ? "CV + CL + a real company Profile exist now"
        : "closeout missing CV, cover letter, or a real company Profile"
    )
  );
  const stills = profileWorkImageGate(pkg, opts);
  checks.push(check("r3-profile-work-images", "P0", stills.ok, stills.detail));
  const viewport = profileFirstViewportGate(pkg, opts);
  checks.push(
    check("r3-profile-first-viewport-still", "P0", viewport.ok, viewport.detail)
  );
  const early = profileStillEarlyGate(pkg, opts);
  checks.push(check("r3-profile-still-early", "P0", early.ok, early.detail));
  const count = profileStillCountGate(pkg, opts);
  checks.push(check("r3-profile-still-count", "P0", count.ok, count.detail));
  const slug = slugMatchesCompany(pkg, classified);
  checks.push(check("profile-slug-matches-company", "P0", slug.ok, slug.detail));
  checks.push(...waiverChecks(pkg, ["profile", "cl"]));

  const mentions = extractUrls(`${pkg.cv.value || ""}\n${pkg.cl.value || ""}`)
    .filter(isPortfolioMention)
    .map((raw) => ({ raw, ...classifyProfileUrl(raw) }));

  const homepageMentions = mentions.filter((m) => !m.ok);
  const mismatched = mentions.filter(
    (m) => m.ok && classified.ok && m.normalized !== classified.normalized
  );
  const cvCites = citesNormalized(pkg.cv.value || "", classified.normalized);
  const clCites = citesNormalized(pkg.cl.value || "", classified.normalized);

  checks.push(
    check(
      "cv-cites-profile-url",
      "P0",
      cvCites,
      cvCites
        ? `CV cites ${classified.normalized}`
        : "CV must cite this package's company Profile URL"
    )
  );
  checks.push(
    check(
      "cl-cites-profile-url",
      "P0",
      clCites,
      clCites
        ? `CL cites ${classified.normalized}`
        : "CL must cite this package's company Profile URL"
    )
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
            ? `CV/CL portfolio URLs match ${classified.normalized}`
            : "no matching Profile URL to compare"
    )
  );

  if (opts.fetchResult) {
    const live = evidence.live;
    checks.push(check("r3-live-fetch", "P0", live.ok, live.reason));
  }

  // Disk ACCEPT reports cannot waive content gates. Re-scan current files.
  checks.push(...textGateChecks(pkg.brief.value || "", "Brief", rules, "r3-brief-"));
  checks.push(...textGateChecks(pkg.cv.value || "", "CV", rules, "r3-cv-"));
  checks.push(...textGateChecks(pkg.cl.value || "", "CL", rules, "r3-cl-"));
  checks.push(
    ...textGateChecks(
      (pkg.profileHtml && pkg.profileHtml.value) || "",
      "Profile HTML",
      rules,
      "r3-html-"
    )
  );
  checks.push(
    skipLanguageCheck(pkg.brief.value || "", "Brief", rules, "r3-brief-no-skip-language")
  );
  checks.push(skipLanguageCheck(pkg.cv.value || "", "CV", rules, "r3-cv-no-skip-language"));
  checks.push(skipLanguageCheck(pkg.cl.value || "", "CL", rules, "r3-cl-no-skip-language"));
  checks.push(
    skipLanguageCheck(
      (pkg.profileHtml && pkg.profileHtml.value) || "",
      "Profile HTML",
      rules,
      "r3-html-no-skip-language"
    )
  );

  // Disk ACCEPT cannot waive VI provenance. Re-run R-VI on current vi.json.
  checks.push(
    ...hopRVI(pkg).map((c) => ({
      ...c,
      id: c.id.startsWith("r3-") ? c.id : `r3-${c.id}`,
    }))
  );

  return checks;
}

const CLAIM_LOCK_IDS = [
  "claim-lock-sundance-win",
  "claim-lock-berlinale-win",
  "claim-lock-dungeon-fighter",
  "claim-lock-rmb-cny",
  "claim-lock-p007",
  "claim-lock-five-films-four-weeks",
];

const REQUIRED_HOP_CHECKS = {
  R0: [
    "brief-exists",
    "brief-names-cv",
    "brief-names-cl",
    "brief-names-profile",
    "brief-profile-route",
    "brief-selected-work-ids",
    "brief-no-skip-language",
    "no-profile-waiver",
    "no-cl-waiver",
  ],
  "R-VI": [
    "vi-exists",
    "vi-source-url",
    "vi-date",
    "vi-hex",
    "vi-font",
    "vi-radius",
    "vi-not-similar-to",
  ],
  R1: ["r1-cv-exists", ...CLAIM_LOCK_IDS, "slop-lexicon", "cv-header-not-homepage"],
  R1b: ["r1b-cl-exists", "r1b-cl-distinct", "no-cl-waiver", ...CLAIM_LOCK_IDS, "slop-lexicon"],
  R2: [
    "r2-profile-present",
    "r2-profile-work-images",
    "r2-profile-first-viewport-still",
    "r2-profile-still-early",
    "r2-profile-still-count",
    "profile-not-homepage",
    "profile-slug-matches-company",
    "no-profile-waiver",
  ],
  R3: [
    "r3-cv-exists",
    "r3-cl-exists",
    "r3-cl-distinct",
    "r3-profile-present",
    "r3-three-live-pieces",
    "r3-profile-work-images",
    "r3-profile-first-viewport-still",
    "r3-profile-still-early",
    "r3-profile-still-count",
    "profile-slug-matches-company",
    "cv-cites-profile-url",
    "cl-cites-profile-url",
    "portfolio-url-matches-profile",
    "r3-vi-exists",
    "r3-vi-source-url",
    "r3-vi-date",
    "r3-vi-hex",
    "r3-vi-font",
    "r3-vi-radius",
    "r3-vi-not-similar-to",
  ],
};

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
  realProfileExists,
  localProfileHtmlEvidence,
  liveFetchEvidence,
  profileWorkImageGate,
  companySlug,
  companyAliasSet,
  isTrustedCompanyAlias,
  isShorteningOfCompany,
  profileContentMarkers,
  bodyHasProfileMarker,
  REQUIRED_HOP_CHECKS,
  CLAIM_LOCK_IDS,
  BUILTIN_COMPANY_ALIASES,
};
