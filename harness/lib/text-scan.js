"use strict";

function foldText(text) {
  return String(text || "").normalize("NFKC");
}

function excerpt(slice) {
  return String(slice || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function findNearby(text, patternA, patternB, windowChars = 160) {
  const src = foldText(text);
  const a = new RegExp(patternA, "gi");
  let m;
  while ((m = a.exec(src)) !== null) {
    const start = Math.max(0, m.index - windowChars);
    const end = Math.min(src.length, m.index + m[0].length + windowChars);
    const slice = src.slice(start, end);
    if (new RegExp(patternB, "i").test(slice)) {
      return excerpt(slice);
    }
    if (m[0].length === 0) a.lastIndex += 1;
  }
  return null;
}

function dungeonFighterWithoutAmp(src) {
  const re = /Dungeon([\s\S]{0,8})Fighter/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    const mid = m[1];
    if (/[&＆]/.test(mid)) continue;
    if (mid === "" || /^[\s\-–—]+$/.test(mid)) {
      return excerpt(m[0]);
    }
  }
  return null;
}

function scanClaimLocks(text) {
  const src = foldText(text);
  const hits = [];

  const sundance = findNearby(
    src,
    "sundance",
    "\\b(won|winner)\\b|获奖",
    160
  );
  if (sundance) {
    hits.push({
      id: "claim-lock-sundance-win",
      excerpt: sundance,
    });
  }

  const berlinale = findNearby(
    src,
    "berlinale",
    "\\b(won|winner)\\b|获奖|berlinale\\s+win\\b",
    160
  );
  if (berlinale) {
    hits.push({
      id: "claim-lock-berlinale-win",
      excerpt: berlinale,
    });
  }

  const dungeon = dungeonFighterWithoutAmp(src);
  if (dungeon) {
    hits.push({
      id: "claim-lock-dungeon-fighter",
      excerpt: dungeon,
    });
  }

  const money = src.match(/\b(RMB|CNY)\b|[¥￥]|人民币/);
  if (money) {
    hits.push({
      id: "claim-lock-rmb-cny",
      excerpt: excerpt(money[0]),
    });
  }

  const p007 = src.match(/\bP007\b/);
  if (p007) {
    hits.push({
      id: "claim-lock-p007",
      excerpt: excerpt(p007[0]),
    });
  }

  const fiveFilms =
    src.match(
      /\b(?:five|5)\b[\s\S]{0,160}\b(?:films?|shorts?)\b[\s\S]{0,100}\b(?:in|within|under|across)\b[\s\S]{0,60}\b(?:four|4)\b[\s\S]{0,24}\bweeks?\b/i
    ) ||
    src.match(
      /\b(?:four|4)\s+weeks?[\s\S]{0,100}\b(?:five|5)\b[\s\S]{0,60}\b(?:films?|shorts?)\b/i
    );
  if (fiveFilms) {
    hits.push({
      id: "claim-lock-five-films-four-weeks",
      excerpt: excerpt(fiveFilms[0]),
    });
  }

  return hits;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scanSlop(text, lexicon) {
  const src = foldText(text);
  const hits = [];
  for (const phrase of lexicon || []) {
    const re = new RegExp(`\\b${escapeRe(foldText(phrase))}\\b`, "i");
    const m = src.match(re);
    if (m) {
      hits.push({ phrase, excerpt: excerpt(m[0]) });
    }
  }
  return hits;
}

function scanSkipLanguage(text, patterns) {
  const src = foldText(text);
  const hits = [];
  for (const pat of patterns || []) {
    const re = new RegExp(pat, "i");
    const m = src.match(re);
    if (m) hits.push({ pattern: pat, excerpt: excerpt(m[0]) });
  }
  return hits;
}

const WAIVER_TOKENS = new Set([
  "profile",
  "cover_letter",
  "cover-letter",
  "cover letter",
  "cl",
  "r2",
  "r1b",
]);

const WAIVER_KEY_RE = /^(waivers?|waived|exemptions?)$/;

function normalizeKey(k) {
  return foldText(k)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function isWaiverKey(k) {
  return WAIVER_KEY_RE.test(normalizeKey(k));
}

function extractArtifactToken(str) {
  const n = foldText(str).toLowerCase().trim();
  if (!n) return null;
  if (WAIVER_TOKENS.has(n)) {
    if (n === "r2" || n === "profile") return "profile";
    return n === "r1b" || n === "cl" ? "cover_letter" : n.replace(/[-\s]/g, "_") === "cover_letter" || /cover/.test(n) ? "cover_letter" : n;
  }
  if (/(^|[^a-z0-9])profile([^a-z0-9]|$)|(^|[^a-z0-9])r2([^a-z0-9]|$)/.test(n)) {
    return "profile";
  }
  if (/cover[_\s-]?letter|\bcoverletter\b|(^|[^a-z0-9])cl([^a-z0-9]|$)|(^|[^a-z0-9])r1b([^a-z0-9]|$)/.test(n)) {
    return "cover_letter";
  }
  return null;
}

function lastKeySegment(path) {
  if (!path) return "";
  const cleaned = String(path).replace(/\[\d+\]/g, "");
  const parts = cleaned.split(".").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function collectWaiverHits(value, path, out, inWaiverContext) {
  if (value == null) return;
  const context = Boolean(inWaiverContext) || isWaiverKey(lastKeySegment(path));

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    if (context) {
      const token = extractArtifactToken(String(value));
      if (token) out.push({ path: path || "(root)", token });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      collectWaiverHits(item, `${path}[${i}]`, out, context);
    });
    return;
  }

  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const next = path ? `${path}.${k}` : k;
      const keyIsWaiver = isWaiverKey(k);
      const keyToken = context || keyIsWaiver ? extractArtifactToken(k) : null;
      if ((context || keyIsWaiver) && keyToken) {
        out.push({ path: next, token: keyToken });
      }
      collectWaiverHits(v, next, out, context || keyIsWaiver);
    }
  }
}

function findForbiddenWaivers(...objects) {
  const hits = [];
  for (const obj of objects) {
    if (obj && typeof obj === "object") collectWaiverHits(obj, "", hits, false);
  }
  return hits;
}

module.exports = {
  findNearby,
  foldText,
  scanClaimLocks,
  scanSlop,
  scanSkipLanguage,
  findForbiddenWaivers,
  WAIVER_TOKENS,
  extractArtifactToken,
};
