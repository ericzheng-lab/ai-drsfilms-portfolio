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

const MIN_STILL_COUNT = 4;
const MAX_WORDS_BEFORE_STILL = 80;

function stripToWords(htmlChunk) {
  const stripped = String(htmlChunk || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped ? stripped.split(/\s+/) : [];
}

function visibleTextBeforeFirstImage(html) {
  const src = String(html || "");
  const body = src.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const chunk = body ? body[1] : src;
  const img = /<img\b/i.exec(chunk);
  const before = img ? chunk.slice(0, img.index) : chunk;
  const words = stripToWords(before);
  return { words: words.length, text: words.join(" ") };
}

function firstStillIsEarly(html) {
  const images = workImagesInHtml(html);
  const { words } = visibleTextBeforeFirstImage(html);
  if (!images.length) {
    return {
      ok: false,
      wordsBefore: words,
      reason: "no real still; first viewport is text (B-C6 / B-P3)",
    };
  }
  if (words > MAX_WORDS_BEFORE_STILL) {
    return {
      ok: false,
      wordsBefore: words,
      reason: `${words} words before first still (max ${MAX_WORDS_BEFORE_STILL}; B-C6 / B-WKS4)`,
    };
  }
  return {
    ok: true,
    wordsBefore: words,
    reason: `first still after ${words} words`,
  };
}

function htmlHasEnoughStills(html, min = MIN_STILL_COUNT) {
  const images = workImagesInHtml(html);
  return {
    ok: images.length >= min,
    count: images.length,
    reason: images.length >= min
      ? `${images.length} real work image(s) (>=${min})`
      : `${images.length} still(s); B-WKS4 two films do not carry a page (need >=${min})`,
  };
}

const WORK_TITLES = [
  { id: "ocm", re: /one\s*click\s*mute/i },
  { id: "manga", re: /manga\s*cut|home\s*[×x]\s*smarthome/i },
  { id: "doombrush", re: /doombrush/i },
  { id: "brief", re: /brief\s*history/i },
  { id: "showreel", re: /showreel|traditional\s+reel/i },
  { id: "sysmere", re: /sys\s*\/\s*mere|sysmere/i },
  { id: "monet", re: /monet/i },
  { id: "haircut", re: /new\s+haircut/i },
];

const TRADITIONAL_IDS = new Set(["brief", "showreel"]);
const AI_ORDER = ["ocm", "manga", "doombrush"];

function titleHits(html) {
  const src = String(html || "");
  return WORK_TITLES.map((t) => {
    const m = t.re.exec(src);
    return { id: t.id, index: m ? m.index : -1 };
  }).filter((h) => h.index >= 0);
}

function hasTraditionalCredits(html) {
  const trad = titleHits(html).filter((h) => TRADITIONAL_IDS.has(h.id));
  if (!trad.length) {
    return {
      ok: false,
      reason: "no traditional film/showreel credits on the page (B-WKS5)",
    };
  }
  return {
    ok: true,
    reason: `traditional credits visible: ${trad.map((t) => t.id).join(", ")}`,
  };
}

function traditionalLeads(html) {
  const hits = titleHits(html).sort((a, b) => a.index - b.index);
  const trad = hits.filter((h) => TRADITIONAL_IDS.has(h.id));
  if (!trad.length) {
    return {
      ok: false,
      reason: "no traditional lead; shooting seats cannot open on 3D/AI (B-WKS6)",
    };
  }
  if (hits[0] && AI_ORDER.includes(hits[0].id)) {
    return {
      ok: false,
      reason: `AI title ${hits[0].id} appears before traditional credits (B-WKS6)`,
    };
  }
  return {
    ok: true,
    reason: `traditional lead ${hits[0] ? hits[0].id : trad[0].id}`,
  };
}

function aiFilmOrderOk(html) {
  const src = String(html || "");
  const present = [];
  for (const id of AI_ORDER) {
    const t = WORK_TITLES.find((x) => x.id === id);
    const m = t.re.exec(src);
    if (m) present.push({ id, index: m.index });
  }
  if (present.length < 2) {
    return { ok: true, reason: "fewer than two named AI stack titles; order N/A" };
  }
  for (let i = 1; i < present.length; i++) {
    if (present[i].index < present[i - 1].index) {
      return {
        ok: false,
        reason: `AI stack order ${present.map((p) => p.id).join(" → ")} violates One Click Mute → Manga Cut → DoomBrush (B-WKS3)`,
      };
    }
  }
  return {
    ok: true,
    reason: `AI stack order ${present.map((p) => p.id).join(" → ")}`,
  };
}

function vimeoEmbedInCard(html) {
  const src = String(html || "");
  if (!/brief\s*history|showreel|traditional\s+reel/i.test(src)) {
    return { ok: true, reason: "no traditional Vimeo piece claimed" };
  }
  const withoutModal = src.replace(
    /<(div|section|aside)[^>]*class=["'][^"']*\bmodal\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi,
    " "
  );
  const inCard = /<iframe\b[^>]*src=["'][^"']*player\.vimeo\.com[^"']*["'][^>]*>/i.test(
    withoutModal
  );
  if (!inCard) {
    return {
      ok: false,
      reason: "traditional Vimeo is not embedded on the card (B-WKS7); modal-only is folded",
    };
  }
  return { ok: true, reason: "Vimeo embed on the work card" };
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
  firstStillIsEarly,
  htmlHasEnoughStills,
  visibleTextBeforeFirstImage,
  hasTraditionalCredits,
  traditionalLeads,
  aiFilmOrderOk,
  vimeoEmbedInCard,
  titleHits,
  heroMinHeightVh,
  MIN_STILL_COUNT,
  MAX_WORDS_BEFORE_STILL,
};
