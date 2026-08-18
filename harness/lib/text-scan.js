"use strict";

function findNearby(text, patternA, patternB, windowChars = 80) {
  const src = String(text || "");
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

function excerpt(slice) {
  return slice.replace(/\s+/g, " ").trim().slice(0, 180);
}

function scanClaimLocks(text) {
  const src = String(text || "");
  const hits = [];

  const sundance = findNearby(
    src,
    "sundance",
    "\\b(won|winner)\\b|获奖",
    80
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
    80
  );
  if (berlinale) {
    hits.push({
      id: "claim-lock-berlinale-win",
      excerpt: berlinale,
    });
  }

  const dungeon = src.match(/Dungeon\s+Fighter/i);
  if (dungeon) {
    hits.push({
      id: "claim-lock-dungeon-fighter",
      excerpt: excerpt(dungeon[0]),
    });
  }

  const money = src.match(/\b(RMB|CNY)\b/);
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
      /\b(?:five|5)\b[\s\S]{0,120}\b(?:films?|shorts?)\b[\s\S]{0,80}\b(?:in|within|under|across)\b[\s\S]{0,40}\b(?:four|4)\b[\s\S]{0,16}\bweeks?\b/i
    ) ||
    src.match(
      /\b(?:four|4)\s+weeks?[\s\S]{0,80}\b(?:five|5)\b[\s\S]{0,40}\b(?:films?|shorts?)\b/i
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
  const src = String(text || "");
  const hits = [];
  for (const phrase of lexicon || []) {
    const re = new RegExp(`\\b${escapeRe(phrase)}\\b`, "i");
    const m = src.match(re);
    if (m) {
      hits.push({ phrase, excerpt: excerpt(m[0]) });
    }
  }
  return hits;
}

function scanSkipLanguage(text, patterns) {
  const src = String(text || "");
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

function collectWaiverHits(value, path, out) {
  if (value == null) return;
  if (Array.isArray(value)) {
    if (/(^|\.)waivers$/.test(path) || path.endsWith("waivers")) {
      for (const item of value) {
        const token = String(item || "")
          .trim()
          .toLowerCase();
        if (WAIVER_TOKENS.has(token)) {
          out.push({ path, token });
        }
      }
    } else {
      value.forEach((item, i) => collectWaiverHits(item, `${path}[${i}]`, out));
    }
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const next = path ? `${path}.${k}` : k;
      collectWaiverHits(v, next, out);
    }
  }
}

function findForbiddenWaivers(...objects) {
  const hits = [];
  for (const obj of objects) {
    if (obj && typeof obj === "object") collectWaiverHits(obj, "", hits);
  }
  return hits;
}

module.exports = {
  findNearby,
  scanClaimLocks,
  scanSlop,
  scanSkipLanguage,
  findForbiddenWaivers,
  WAIVER_TOKENS,
};
