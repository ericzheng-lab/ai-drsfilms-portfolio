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

function oldShellIsGone(html) {
  const spacers = heroMinHeightVh(html);
  if (spacers.length) {
    return {
      ok: false,
      reason: `old-shell hero min-height ${spacers[0].vh}vh (B-C5 patch-on-old-shell)`,
    };
  }
  return { ok: true, reason: "no leftover 70vh+ hero shell" };
}

function isRoleProfileNotHomepage(html) {
  const src = String(html || "");
  const role = /\b(senior\s+)?producer\b|\bdirector\b|\bexecutive producer\b/i.test(
    src
  );
  const hits = titleHits(src);
  if (!role) {
    return {
      ok: false,
      reason: "homepage-as-profile: no role on the page (B-EL1)",
    };
  }
  if (hits.length < 2) {
    return {
      ok: false,
      reason: "homepage-as-profile: fewer than two work-sample titles (B-EL1)",
    };
  }
  return {
    ok: true,
    reason: `role profile with ${hits.length} work titles`,
  };
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

const FIRST_VIEWPORT_PX = 800;
const STILL_LED_MAX_WORDS = 24;
const WORK_WRAP_MIN_PX = 1080;
const WORK_WRAP_MAX_PX = 1240;
const WORK_WRAP_FORMULA_RE =
  /min\(\s*1120px\s*,\s*calc\(\s*100%\s*-\s*40px\s*\)\s*\)/i;
const NAV_CHROME_RE =
  /(^|[\s,#.>+~])(wordmark|nav|navbar|site-nav|brand-mark|logo|masthead)\b/i;
const WORK_MEDIA_RE =
  /\b(img|iframe|video|work-card|work-col(?:umn)?|work-wrap|reel-poster|poster|article|main)\b/i;

function bodyInner(html) {
  const src = String(html || "");
  const body = src.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  return body ? body[1] : src;
}

function stripChrome(htmlChunk) {
  return String(htmlChunk || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
}

function firstVisualStillIndex(chunk) {
  const src = String(chunk || "");
  const candidates = [];
  const imgRe = /<img\b[^>]*>/gi;
  let m;
  while ((m = imgRe.exec(src))) {
    const attrs = attrValues(m[0]);
    const urls = [...attrs.src];
    for (const set of attrs.srcset) urls.push(...srcsetUrls(set));
    if (urls.some(isRealWorkSrc) || /reel-poster|\bposter\b/i.test(m[0])) {
      candidates.push(m.index);
      break;
    }
  }
  const iframe = /<iframe\b[^>]*src=["'][^"']*(?:player\.)?vimeo\.com[^"']*["'][^>]*>/i.exec(
    src
  );
  if (iframe) candidates.push(iframe.index);
  const video = /<video\b[^>]*>/i.exec(src);
  if (video) candidates.push(video.index);
  if (!candidates.length) return -1;
  return Math.min(...candidates);
}

function firstViewportIsStillLed(html) {
  const src = String(html || "");
  if (!src.trim()) {
    return { ok: false, reason: "empty HTML; first 800px is not still-led" };
  }
  const chunk = stripChrome(bodyInner(src));
  const visualAt = firstVisualStillIndex(chunk);
  if (visualAt < 0) {
    return {
      ok: false,
      reason: "first 800px has no still / reel poster (type-wall / Thread B)",
    };
  }
  const prefix = chunk.slice(0, visualAt);
  const words = stripToWords(prefix);
  if (words.length > STILL_LED_MAX_WORDS) {
    return {
      ok: false,
      reason: `first ${FIRST_VIEWPORT_PX}px is type-led (${words.length} words before still/reel poster; Thread B)`,
    };
  }
  if (prefix.length > 3500) {
    return {
      ok: false,
      reason: "first 800px is a type-wall / Thread B (markup before still is a type hero)",
    };
  }
  return {
    ok: true,
    reason: `first ${FIRST_VIEWPORT_PX}px is still/reel-poster led`,
  };
}

function isStillFirstPage(html) {
  const src = String(html || "");
  if (!src.trim()) return false;
  if (!htmlHasWorkImages(src).ok) return false;
  if (!firstViewportHasStill(src).ok) return false;
  if (!firstStillIsEarly(src).ok) return false;
  return firstViewportIsStillLed(src).ok;
}

function isTypeWallPage(html) {
  return !isStillFirstPage(html);
}

function isNavChromeSelector(sel) {
  const parts = String(sel || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return false;
  return parts.every(
    (p) => NAV_CHROME_RE.test(p) && !WORK_MEDIA_RE.test(p)
  );
}

function looksLikeWorkSelector(sel) {
  const s = String(sel || "");
  if (isNavChromeSelector(s)) return false;
  if (WORK_MEDIA_RE.test(s)) return true;
  if (/(^|[\s,#.>+~])wrap\b/i.test(s)) return true;
  if (/\b(img|iframe|video)\b/i.test(s)) return true;
  return false;
}

function stripMinFn(cssBody) {
  return String(cssBody || "").replace(/min\s*\((?:[^)(]+|\([^)(]*\))*\)/gi, " ");
}

function ruleHasUncapped100vw(cssBody) {
  const stripped = stripMinFn(cssBody);
  return /(?:max-)?width\s*:\s*100vw\b/i.test(stripped);
}

function wrapCapFromBody(cssBody) {
  const body = String(cssBody || "");
  if (WORK_WRAP_FORMULA_RE.test(body)) {
    return { ok: true, px: 1120, via: "min(1120px, calc(100% - 40px))" };
  }
  const minPx = body.match(/min\(\s*(\d+)px\b/i);
  if (minPx) {
    const n = Number(minPx[1]);
    if (n >= WORK_WRAP_MIN_PX && n <= WORK_WRAP_MAX_PX) {
      return { ok: true, px: n, via: `min(${n}px, …)` };
    }
  }
  const widths = [
    ...body.matchAll(/(?:max-width|width)\s*:\s*(\d+)px/gi),
  ].map((m) => Number(m[1]));
  const band = widths.filter(
    (n) => n >= WORK_WRAP_MIN_PX && n <= WORK_WRAP_MAX_PX
  );
  if (band.length) {
    return { ok: true, px: band[0], via: `${band[0]}px` };
  }
  return { ok: false, px: null, via: null };
}

function inlineWorkFullBleed(html) {
  const src = String(html || "");
  const hits = [];
  const mediaRe = /<(img|iframe|video)\b[^>]*>/gi;
  let m;
  while ((m = mediaRe.exec(src))) {
    const tag = m[0];
    if (!/(?:max-)?width\s*:\s*100vw\b/i.test(tag)) continue;
    const before = src.slice(Math.max(0, m.index - 400), m.index);
    if (
      /<(header|nav)\b[^>]*(wordmark|site-nav|navbar|logo)[^>]*>[\s\S]*$/i.test(
        before
      )
    ) {
      continue;
    }
    hits.push(m[1]);
  }
  return hits;
}

function workColumnMaxWidthOk(html) {
  const src = String(html || "");
  const css = styleBlocks(src);
  const fullBleed = [];
  const ruleRe = /([^{}]+)\{([^{}]+)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const sel = m[1];
    const body = m[2];
    if (!ruleHasUncapped100vw(body)) continue;
    if (isNavChromeSelector(sel)) continue;
    if (looksLikeWorkSelector(sel) || /\b(img|iframe|video)\b/i.test(sel)) {
      fullBleed.push(sel.trim().replace(/\s+/g, " ").slice(0, 80));
    } else if (!NAV_CHROME_RE.test(sel)) {
      fullBleed.push(sel.trim().replace(/\s+/g, " ").slice(0, 80));
    }
  }
  const inlineHits = inlineWorkFullBleed(src);
  if (fullBleed.length || inlineHits.length) {
    const who = fullBleed.length
      ? fullBleed[0]
      : `${inlineHits[0]}[style]`;
    return {
      ok: false,
      reason: `work img/iframe/video is 100vw (${who}); cap work column at min(1120px, calc(100% - 40px)) (1080–1240). Wordmark/nav may be full row`,
    };
  }

  const hasWork =
    workImagesInHtml(src).length > 0 ||
    /<iframe\b/i.test(src) ||
    /<video\b/i.test(src);
  if (!hasWork) {
    return { ok: true, reason: "no work media to cap" };
  }

  let cap = { ok: false };
  ruleRe.lastIndex = 0;
  while ((m = ruleRe.exec(css))) {
    const sel = m[1];
    const body = m[2];
    if (isNavChromeSelector(sel)) continue;
    const found = wrapCapFromBody(body);
    if (!found.ok) continue;
    if (
      looksLikeWorkSelector(sel) ||
      /(^|[\s,#.>+~])wrap\b/i.test(sel) ||
      WORK_WRAP_FORMULA_RE.test(body)
    ) {
      cap = found;
      break;
    }
  }
  if (!cap.ok && WORK_WRAP_FORMULA_RE.test(css)) {
    cap = { ok: true, px: 1120, via: "min(1120px, calc(100% - 40px))" };
  }
  if (!cap.ok) {
    return {
      ok: false,
      reason:
        "work column is not capped at min(1120px, calc(100% - 40px)) (1080–1240 band)",
    };
  }
  return {
    ok: true,
    reason: `work column capped ${cap.via}`,
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
  oldShellIsGone,
  isRoleProfileNotHomepage,
  titleHits,
  heroMinHeightVh,
  firstViewportIsStillLed,
  isStillFirstPage,
  isTypeWallPage,
  workColumnMaxWidthOk,
  FIRST_VIEWPORT_PX,
  WORK_WRAP_MIN_PX,
  WORK_WRAP_MAX_PX,
  MIN_STILL_COUNT,
  MAX_WORDS_BEFORE_STILL,
};
