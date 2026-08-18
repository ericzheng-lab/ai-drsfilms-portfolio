"use strict";

const PROFILE_HOST = "ai.drsfilms.com";
const GENERIC_HOSTS = new Set(["drsfilms.com", "www.drsfilms.com"]);
const RESERVED_SLUGS = new Set([
  "",
  "www",
  "prompt-builder",
  "index",
  "home",
  "careerops",
  "career-ops",
  "login",
  "about",
]);

const URL_RE = /https?:\/\/[^\s)\]>'"`]+/gi;
const BARE_PORTFOLIO_RE =
  /(?:^|[\s(\[])((?:www\.)?(?:ai\.)?drsfilms\.com(?:\/[^\s)\]>'"`]*)?)/gi;

function stripTrailingJunk(raw) {
  return String(raw || "").replace(/[.,;:!?]+$/g, "").trim();
}

function parseUrl(raw) {
  const cleaned = stripTrailingJunk(raw);
  if (!cleaned) return null;
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)
      ? cleaned
      : `https://${cleaned}`;
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function hostOf(url) {
  return (url.hostname || "").replace(/^www\./, "").toLowerCase();
}

function slugFromPath(pathname) {
  const parts = String(pathname || "/")
    .split("/")
    .filter(Boolean);
  return parts[0] ? parts[0].toLowerCase() : "";
}

function isLinkedIn(url) {
  const host = (url.hostname || "").toLowerCase();
  return host === "linkedin.com" || host.endsWith(".linkedin.com");
}

function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(slug);
}

/**
 * Classify a URL as a company Profile route, a generic homepage, or other reject.
 * Valid form: https://ai.drsfilms.com/{company} or /{company}/ (slash normalized).
 */
function classifyProfileUrl(raw) {
  const url = parseUrl(raw);
  if (!url) {
    return {
      ok: false,
      kind: "invalid",
      reason: "not a URL",
      normalized: null,
      slug: null,
    };
  }

  if (isLinkedIn(url)) {
    return {
      ok: false,
      kind: "linkedin",
      reason: "LinkedIn is not a company Profile",
      normalized: null,
      slug: null,
    };
  }

  const host = (url.hostname || "").toLowerCase();
  const hostBare = hostOf(url);
  const slug = slugFromPath(url.pathname);
  const extraParts = String(url.pathname || "/")
    .split("/")
    .filter(Boolean).length;

  if (GENERIC_HOSTS.has(host) || GENERIC_HOSTS.has(hostBare)) {
    return {
      ok: false,
      kind: "homepage",
      reason: `${host} is a generic homepage, not a company Profile`,
      normalized: null,
      slug: null,
    };
  }

  if (host === PROFILE_HOST || host === `www.${PROFILE_HOST}`) {
    if (!slug || extraParts !== 1 || isReservedSlug(slug)) {
      return {
        ok: false,
        kind: "homepage",
        reason:
          slug && isReservedSlug(slug)
            ? `/${slug} is a generic/reserved path, not a company Profile`
            : "ai.drsfilms.com root (or reserved path) is not a company Profile",
        normalized: null,
        slug: slug || null,
      };
    }
    if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(slug)) {
      return {
        ok: false,
        kind: "invalid",
        reason: "company slug must be lowercase alphanumeric + hyphen",
        normalized: null,
        slug,
      };
    }
    return {
      ok: true,
      kind: "company-route",
      reason: null,
      normalized: `https://${PROFILE_HOST}/${slug}/`,
      slug,
    };
  }

  const pathEmpty = !slug;
  if (pathEmpty) {
    return {
      ok: false,
      kind: "bare-domain",
      reason: "bare domain is not a company Profile",
      normalized: null,
      slug: null,
    };
  }

  return {
    ok: false,
    kind: "other",
    reason: "Profile URL must be https://ai.drsfilms.com/{company}/",
    normalized: null,
    slug: null,
  };
}

function extractUrls(text) {
  const found = [];
  const seen = new Set();
  const add = (raw) => {
    const cleaned = stripTrailingJunk(raw);
    if (!cleaned || seen.has(cleaned)) return;
    seen.add(cleaned);
    found.push(cleaned);
  };

  const src = String(text || "");
  for (const m of src.matchAll(URL_RE)) add(m[0]);
  for (const m of src.matchAll(BARE_PORTFOLIO_RE)) add(m[1]);
  return found;
}

function isPortfolioMention(raw) {
  const url = parseUrl(raw);
  if (!url) return false;
  const host = (url.hostname || "").toLowerCase();
  const bare = hostOf(url);
  if (isLinkedIn(url)) return false;
  return (
    host === PROFILE_HOST ||
    host === `www.${PROFILE_HOST}` ||
    GENERIC_HOSTS.has(host) ||
    GENERIC_HOSTS.has(bare)
  );
}

function headerBlock(text, lineCount = 12) {
  const lines = String(text || "").split(/\r?\n/);
  const cut = [];
  for (let i = 0; i < lines.length && cut.length < lineCount; i += 1) {
    const line = lines[i];
    if (/^#{1,3}\s+(experience|work|selected work)/i.test(line)) break;
    if (i > 2 && /^---+\s*$/.test(line)) break;
    cut.push(line);
  }
  return cut.join("\n");
}

module.exports = {
  PROFILE_HOST,
  RESERVED_SLUGS,
  classifyProfileUrl,
  extractUrls,
  isPortfolioMention,
  headerBlock,
  parseUrl,
};
