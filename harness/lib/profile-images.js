"use strict";

/**
 * Mechanical work-still evidence for company Profile HTML.
 * Text-only pages, empty <img>, placeholders, and decorative marks are not stills.
 * Images are not optional. There is no waiver.
 */

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const ATTR_RE = /\b(src|data-src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

const EMPTY_SRC = new Set(["", "#", "about:blank", "javascript:void(0)", "javascript:void(0);"]);

const BAD_SRC_RE = [
  /^\s*$/,
  /^#$/,
  /^about:blank/i,
  /^javascript:/i,
  /placeholder/i,
  /spacer/i,
  /transparent/i,
  /\b1x1\b/i,
  /blank\.(gif|png|jpe?g|webp|svg)/i,
  /decorative/i,
];

const TINY_GIF = /^data:image\/gif;base64,R0lGODlhAQAB/i;

function attrValues(tag) {
  const found = { src: [], srcset: [] };
  ATTR_RE.lastIndex = 0;
  let m;
  const src = String(tag || "");
  while ((m = ATTR_RE.exec(src))) {
    const key = m[1].toLowerCase();
    const val = m[2] != null ? m[2] : m[3] != null ? m[3] : m[4] || "";
    if (key === "srcset") found.srcset.push(val);
    else found.src.push(val);
  }
  return found;
}

function srcsetUrls(raw) {
  return String(raw || "")
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function isRealWorkSrc(raw) {
  const src = String(raw || "").trim();
  if (EMPTY_SRC.has(src.toLowerCase())) return false;
  if (BAD_SRC_RE.some((re) => re.test(src))) return false;
  if (TINY_GIF.test(src)) return false;
  if (/^data:image\//i.test(src)) {
    const payload = src.split(",")[1] || "";
    return payload.length >= 200;
  }
  if (/^https?:\/\//i.test(src)) return true;
  if (/^data:/i.test(src)) return false;
  return src.length > 0;
}

function workImagesInHtml(html) {
  const images = [];
  const tags = String(html || "").match(IMG_TAG_RE) || [];
  for (const tag of tags) {
    const attrs = attrValues(tag);
    const candidates = [...attrs.src];
    for (const set of attrs.srcset) candidates.push(...srcsetUrls(set));
    const real = candidates.find(isRealWorkSrc);
    if (real) images.push({ src: real, tag });
  }
  return images;
}

function htmlHasWorkImages(html) {
  const images = workImagesInHtml(html);
  return {
    ok: images.length > 0,
    count: images.length,
    images,
    reason: images.length
      ? `${images.length} real work image(s)`
      : "Profile HTML has no real work images (text-only or placeholder/empty <img>)",
  };
}

function styleBlocks(html) {
  return [...String(html || "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
}

function heroMinHeightVh(html) {
  const css = styleBlocks(html);
  const out = [];
  const ruleRe = /([^{}]+)\{([^{}]+)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const sel = m[1];
    const body = m[2];
    if (!/(^|[\s,#.])hero\b/.test(sel) && !/\bheader\b/.test(sel)) continue;
    const vh = body.match(/min-height\s*:\s*(\d+(?:\.\d+)?)vh/i);
    if (vh) {
      const n = Number(vh[1]);
      if (n >= 70) out.push({ selector: sel.trim(), vh: n });
    }
  }
  return out;
}

function firstHeroMarkup(html) {
  const src = String(html || "");
  const tagged = src.match(
    /<(header|section|div)([^>]*\bclass=["'][^"']*\bhero\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/i
  );
  if (tagged) return tagged[0];
  return "";
}

function firstViewportHasStill(html) {
  const src = String(html || "");
  const spacers = heroMinHeightVh(src);
  const hero = firstHeroMarkup(src);
  const heroHasImg = /<img\b/i.test(hero);
  if (spacers.length && (!hero || !heroHasImg)) {
    return {
      ok: false,
      reason: `first viewport is a ${spacers[0].vh}vh hero spacer with no still`,
    };
  }
  if (hero && !heroHasImg && /min-height\s*:\s*\d/.test(src)) {
    const anyLarge = /min-height\s*:\s*(\d+(?:\.\d+)?)vh/i.exec(styleBlocks(src));
    if (anyLarge && Number(anyLarge[1]) >= 70) {
      return {
        ok: false,
        reason: `hero has no still and page uses ${anyLarge[1]}vh min-height spacer`,
      };
    }
  }
  return {
    ok: true,
    reason: heroHasImg
      ? "hero contains a work still"
      : "no empty min-height hero spacer",
  };
}

module.exports = {
  workImagesInHtml,
  htmlHasWorkImages,
  isRealWorkSrc,
  firstViewportHasStill,
  heroMinHeightVh,
};
