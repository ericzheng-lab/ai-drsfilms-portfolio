"use strict";

/**
 * Generic Profile-frame law (every company, not a screenshot patch).
 *
 * 1. First viewport is the Brief lead as a *frame*: real video (Vimeo iframe
 *    or <video>) or an INDEX public:true still. Picture/video fills the
 *    work *column* after thin chrome (≤56px). Not 100vw.
 * 2. Wordmark is thin chrome. A fat brand-color document header that also
 *    holds role + location is a résumé masthead = REJECT.
 * 3. A solid brand-color block whose only content is title + paragraph is
 *    not a work slot (type slab ≠ lead asset).
 * 4. Uncatalogued files and invented frames are not lead assets.
 *
 * These checkers look at rendered HTML/CSS. They must not name a company,
 * a campaign, or a screenshot string. Live pages are the exam of the law,
 * not the source of the law.
 */

const { workImagesInHtml, isRealWorkSrc } = require("./profile-images");
const { loadCatalog } = require("./asset-clearance");

const FRAME_CHROME_MAX_PX = 56;
const FRAME_MIN_VH = 70;
const ROLE_RE =
  /\b(senior\s+)?(producer|director|designer|engineer|executive producer|creative director|art director)\b/i;
const LOCATION_RE =
  /\b(nyc|ny\b|new york|hybrid|remote|los angeles|\bla\b|london|san francisco|\bsf\b|chicago|paris)\b/i;
const HEADER_SEL_RE =
  /(^|[\s,#.>+~])(wordmark|masthead|site-nav|navbar|brand-mark|logo|header)\b/i;
const LATE_SEL_RE = /\b(footer|closing|legal|source|credits|contact|brand-field)\b/i;
const WORK_PATH_RE =
  /\/(work|works|case|cases|campaign|campaigns|project|projects|reel|reels|film|films)(\/|$)/i;
const PORTFOLIO_HOSTS = new Set(["ai.drsfilms.com", "www.ai.drsfilms.com", "drsfilms.com", "www.drsfilms.com"]);
const VIMEO_RE = /player\.vimeo\.com\/video\//i;
const YT_RE = /(?:youtube\.com\/embed\/|player\.youtube\.com)/i;

function styleBlocks(html) {
  return [...String(html || "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
}

function cssRules(css) {
  const src = String(css || "").replace(/\/\*[\s\S]*?\*\//g, " ");
  const rules = [];
  const re = /([^{}]+)\{([^{}]+)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const sel = m[1].trim();
    if (sel && !/^@/.test(sel)) rules.push({ selector: sel, body: m[2] });
  }
  return rules;
}

function normalizeHex(raw) {
  let s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  return "";
}

function collectVars(css, html) {
  const vars = {};
  const from = `${css}\n${html || ""}`;
  const re = /(--[a-zA-Z0-9-_]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
  let m;
  while ((m = re.exec(from))) {
    const hex = normalizeHex(m[2]);
    if (hex) vars[m[1]] = hex;
  }
  return vars;
}

function resolvedHexes(value, vars) {
  const out = [];
  const src = String(value || "");
  const hexRe = /#([0-9a-fA-F]{3,8})/g;
  let m;
  while ((m = hexRe.exec(src))) {
    const n = normalizeHex(m[0]);
    if (n) out.push(n);
  }
  const varRe = /var\(\s*(--[a-zA-Z0-9-_]+)/g;
  while ((m = varRe.exec(src))) {
    if (vars[m[1]]) out.push(vars[m[1]]);
  }
  return out;
}

function hexFamily(primary) {
  const n = normalizeHex(primary);
  const set = new Set();
  if (n) set.add(n);
  if (n === "#0033a0") set.add("#0033a1");
  if (n === "#0033a1") set.add("#0033a0");
  return set;
}

function mentionsFamily(value, family, vars) {
  if (!family || !family.size) return false;
  return resolvedHexes(value, vars).some((h) => family.has(h));
}

function hasSolidBackground(body) {
  return /background(?:-color)?\s*:\s*(?!transparent|none|inherit)/i.test(
    String(body || "")
  );
}

function fontSizePx(body) {
  const m = String(body || "").match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/i);
  return m ? Number(m[1]) : null;
}

function paddingVertPx(body) {
  const raw = String(body || "");
  let top = 0;
  let bottom = 0;
  const shorthand = raw.match(/padding\s*:\s*([^;]+)/i);
  if (shorthand) {
    const nums = [...shorthand[1].matchAll(/(\d+(?:\.\d+)?)px/g)].map((n) =>
      Number(n[1])
    );
    if (nums.length === 1) {
      top = bottom = nums[0];
    } else if (nums.length >= 2) {
      top = nums[0];
      bottom = nums[0];
      if (nums.length >= 3) bottom = nums[2];
    }
  }
  const pt = raw.match(/padding-top\s*:\s*(\d+(?:\.\d+)?)px/i);
  const pb = raw.match(/padding-bottom\s*:\s*(\d+(?:\.\d+)?)px/i);
  if (pt) top = Number(pt[1]);
  if (pb) bottom = Number(pb[1]);
  return top + bottom;
}

function declaredHeightPx(body) {
  const maxH = String(body || "").match(/max-height\s*:\s*(\d+(?:\.\d+)?)px/i);
  if (maxH) return Number(maxH[1]);
  const h = String(body || "").match(/(?:^|;)\s*height\s*:\s*(\d+(?:\.\d+)?)px/i);
  if (h) return Number(h[1]);
  return null;
}

function estimatedChromePx(body, extraLines) {
  const declared = declaredHeightPx(body);
  if (declared != null) return declared;
  const font = fontSizePx(body) || 16;
  const pad = paddingVertPx(body);
  const lines = Math.max(1, extraLines || 1);
  return pad + font * lines;
}

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

function visibleText(htmlChunk) {
  return stripChrome(htmlChunk)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMediaMatch(html) {
  const chunk = stripChrome(bodyInner(html));
  const re =
    /<(img|video|iframe)\b([^>]*?)>/gi;
  let m;
  while ((m = re.exec(chunk))) {
    const tag = m[0];
    const name = m[1].toLowerCase();
    if (name === "img") {
      const src = /(?:src|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(
        tag
      );
      const url = src ? src[1] || src[2] || src[3] || "" : "";
      if (isRealWorkSrc(url) || /reel-poster|\bposter\b/i.test(tag)) {
        return { kind: "img", tag, index: m.index, src: url };
      }
      continue;
    }
    if (name === "video") {
      return { kind: "video", tag, index: m.index, src: tag };
    }
    if (VIMEO_RE.test(tag) || YT_RE.test(tag)) {
      return { kind: "iframe", tag, index: m.index, src: tag };
    }
  }
  return null;
}

function classList(tag) {
  const m = String(tag || "").match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const raw = m ? m[1] || m[2] || "" : "";
  return raw.split(/\s+/).filter(Boolean);
}

function rulesForClass(rules, className) {
  const needle = new RegExp(
    `(^|[\\s,#.>+~])\\.${className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
  );
  return rules.filter((r) => needle.test(r.selector));
}

function mediaFillsColumn(tag, parentChunk, rules) {
  const blobs = [tag, parentChunk, rules.map((r) => r.body).join("\n")];
  const css = blobs.join("\n");
  const calc = [
    ...css.matchAll(
      /min-height\s*:\s*calc\(\s*100vh\s*-\s*(\d+(?:\.\d+)?)px\s*\)/gi
    ),
    ...css.matchAll(
      /height\s*:\s*calc\(\s*100vh\s*-\s*(\d+(?:\.\d+)?)px\s*\)/gi
    ),
  ];
  if (calc.some((m) => Number(m[1]) <= FRAME_CHROME_MAX_PX + 8)) return true;
  const vh = [
    ...css.matchAll(/min-height\s*:\s*(\d+(?:\.\d+)?)vh/gi),
    ...css.matchAll(/(?:^|;)\s*height\s*:\s*(\d+(?:\.\d+)?)vh/gi),
  ];
  if (vh.some((m) => Number(m[1]) >= FRAME_MIN_VH)) return true;
  return false;
}

function firstHeaderMarkup(html) {
  const chunk = stripChrome(bodyInner(html));
  const m = chunk.match(
    /<(header|div|nav)([^>]*\bclass=["'][^"']*\b(?:wordmark|masthead|site-nav|navbar|brand-mark)\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/i
  );
  if (m) return { tag: m[0], attrs: m[2] || "", inner: m[3] || "", name: m[1] };
  const h = chunk.match(/<header\b([^>]*)>([\s\S]*?)<\/header>/i);
  if (h) return { tag: h[0], attrs: h[1] || "", inner: h[2] || "", name: "header" };
  return null;
}

function chromeRules(rules) {
  return rules.filter(
    (r) => HEADER_SEL_RE.test(r.selector) && !LATE_SEL_RE.test(r.selector)
  );
}

function firstViewportIsFrame(html) {
  const src = String(html || "");
  if (!src.trim()) {
    return { ok: false, reason: "empty HTML; first viewport is not a work frame" };
  }
  const rules = cssRules(styleBlocks(src));
  const header = firstHeaderMarkup(src);
  let extraLines = 1;
  if (header && /<small\b|<br\s*\/?>/i.test(header.inner)) extraLines = 2;
  const chrome = chromeRules(rules);
  let chromePx = 0;
  for (const rule of chrome) {
    chromePx = Math.max(chromePx, estimatedChromePx(rule.body, extraLines));
  }
  if (header) {
    const classes = classList(header.attrs);
    for (const c of classes) {
      for (const rule of rulesForClass(rules, c)) {
        chromePx = Math.max(chromePx, estimatedChromePx(rule.body, extraLines));
      }
    }
  }
  if (chromePx > FRAME_CHROME_MAX_PX) {
    return {
      ok: false,
      reason: `wordmark/header chrome is ${Math.round(
        chromePx
      )}px (max ${FRAME_CHROME_MAX_PX}px); first viewport is not a work frame`,
    };
  }

  const media = firstMediaMatch(src);
  if (!media) {
    return {
      ok: false,
      reason: "first viewport has no video / still frame (type-led open)",
    };
  }

  const parent = stripChrome(bodyInner(src)).slice(
    Math.max(0, media.index - 500),
    media.index + media.tag.length + 200
  );
  const classNames = [
    ...classList(media.tag),
    ...classList(parent.match(/<article\b([^>]*)>/i)?.[1] || ""),
    ...classList(
      parent.match(
        /<(div|section)\b([^>]*\bclass=["'][^"']*\b(?:lead-frame|frame|stage|work-card)\b[^"']*["'][^>]*)>/i
      )?.[0] || ""
    ),
  ];
  const matchedRules = [];
  for (const c of classNames) {
    matchedRules.push(...rulesForClass(rules, c));
  }
  const kindRules = rules.filter((r) => {
    if (media.kind === "iframe" && /\biframe\b/i.test(r.selector)) return true;
    if (media.kind === "video" && /\bvideo\b/i.test(r.selector)) return true;
    if (media.kind === "img" && /\bimg\b/i.test(r.selector)) return true;
    return false;
  });
  if (!mediaFillsColumn(media.tag, parent, [...matchedRules, ...kindRules])) {
    return {
      ok: false,
      reason:
        "lead media does not fill the work column (need min-height calc(100vh - ≤56px) or ≥70vh inside the capped column; 21:9 boxed card is not a frame)",
    };
  }
  return {
    ok: true,
    reason: `first viewport is a ${media.kind} work frame after ≤${FRAME_CHROME_MAX_PX}px chrome`,
  };
}

function headerIsBrandColorBlock(header, rules, vars, family) {
  if (!header) return false;
  const classes = classList(header.attrs);
  const inline = /style\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(header.attrs);
  const style = inline ? inline[1] || inline[2] || "" : "";
  if (style && /background/i.test(style)) {
    if (!family.size || mentionsFamily(style, family, vars) || hasSolidBackground(style)) {
      if (estimatedChromePx(style, /<small\b/.test(header.inner) ? 2 : 1) > FRAME_CHROME_MAX_PX) {
        return true;
      }
    }
  }
  for (const c of classes) {
    for (const rule of rulesForClass(rules, c)) {
      const bg = /background(?:-color)?\s*:\s*([^;]+)/i.exec(rule.body);
      if (!bg) continue;
      const colored =
        (family.size && mentionsFamily(bg[1], family, vars)) ||
        hasSolidBackground(rule.body);
      if (!colored) continue;
      const lines = /<small\b|<br\s*\/?>/i.test(header.inner) ? 2 : 1;
      if (estimatedChromePx(rule.body, lines) > FRAME_CHROME_MAX_PX) return true;
    }
  }
  for (const rule of chromeRules(rules)) {
    const bg = /background(?:-color)?\s*:\s*([^;]+)/i.exec(rule.body);
    if (!bg) continue;
    const colored =
      (family.size && mentionsFamily(bg[1], family, vars)) ||
      hasSolidBackground(rule.body);
    if (!colored) continue;
    if (estimatedChromePx(rule.body, 2) > FRAME_CHROME_MAX_PX) return true;
  }
  return false;
}

function noResumeMasthead(html, primaryHex) {
  const src = String(html || "");
  if (!src.trim()) {
    return { ok: false, reason: "empty HTML; cannot prove the header is not a résumé masthead" };
  }
  const css = styleBlocks(src);
  const rules = cssRules(css);
  const vars = collectVars(css, src);
  const family = hexFamily(primaryHex);
  const header = firstHeaderMarkup(src);
  const text = visibleText(header ? header.inner : src.slice(0, 800));
  const hasRole = ROLE_RE.test(text);
  const hasLoc = LOCATION_RE.test(text);
  if (!hasRole || !hasLoc) {
    return { ok: true, reason: "document header does not combine role + location" };
  }
  if (!headerIsBrandColorBlock(header, rules, vars, family)) {
    return {
      ok: true,
      reason: "role + location are not in a fat brand-color document header",
    };
  }
  return {
    ok: false,
    reason:
      "résumé masthead: fat brand-color document header holds role + location (wordmark must be thin chrome)",
  };
}

function noTypeSlabWorkSlot(html, primaryHex) {
  const src = String(html || "");
  if (!src.trim()) {
    return { ok: true, reason: "no HTML; type-slab work slot N/A" };
  }
  const css = styleBlocks(src);
  const rules = cssRules(css);
  const vars = collectVars(css, src);
  const family = hexFamily(primaryHex);
  const chunk = stripChrome(bodyInner(src));
  const blocks = [
    ...chunk.matchAll(
      /<(article|section|div)([^>]*\bclass=["'][^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi
    ),
  ];
  for (const b of blocks) {
    const attrs = b[2] || "";
    const inner = b[3] || "";
    if (LATE_SEL_RE.test(attrs)) continue;
    if (/<(img|video|iframe)\b/i.test(inner)) continue;
    const text = visibleText(inner);
    if (!text) continue;
    const hasHeading = /<h[1-6]\b/i.test(inner);
    const hasP = /<p\b/i.test(inner);
    if (!hasHeading || !hasP) continue;
    const classes = classList(attrs);
    let solid = false;
    for (const c of classes) {
      for (const rule of rulesForClass(rules, c)) {
        const bg = /background(?:-color)?\s*:\s*([^;]+)/i.exec(rule.body);
        if (!bg) continue;
        if (family.size && mentionsFamily(bg[1], family, vars)) solid = true;
        else if (!family.size && hasSolidBackground(rule.body)) solid = true;
      }
    }
    if (!solid) continue;
    return {
      ok: false,
      reason:
        "solid brand-color type slab (heading + paragraph, no video/still) standing in for a work slot",
    };
  }
  return { ok: true, reason: "no brand-color type slab used as a work slot" };
}

function catalogAssetForSrc(src, catalog) {
  const assets = (catalog && catalog.assets) || [];
  const blob = String(src || "");
  for (const asset of assets) {
    const pats = asset.src_patterns || [];
    if (pats.some((p) => new RegExp(p, "i").test(blob))) return asset;
  }
  return null;
}

function leadMediaCleared(html) {
  const media = firstMediaMatch(html);
  if (!media) {
    return {
      ok: false,
      reason: "lead has no real video and no still (type is not a lead asset)",
    };
  }
  if (media.kind === "iframe" || media.kind === "video") {
    if (media.kind === "iframe" && !(VIMEO_RE.test(media.tag) || YT_RE.test(media.tag))) {
      return {
        ok: false,
        reason: "lead iframe is not a real video embed (Vimeo/YouTube)",
      };
    }
    return { ok: true, reason: `lead is a real ${media.kind} frame` };
  }
  const catalog = loadCatalog();
  const hit = catalogAssetForSrc(`${media.tag} ${media.src}`, catalog);
  if (!hit) {
    return {
      ok: false,
      reason:
        "lead still is uncatalogued (invented/fixture file is not a lead asset; need Vimeo or INDEX public:true still)",
    };
  }
  if (!(hit.external_ready && hit.drs_public)) {
    return {
      ok: false,
      reason: `lead still ${hit.id || media.src} is not INDEX public:true + external_ready`,
    };
  }
  return { ok: true, reason: `lead still ${hit.id} is dual-gate clearable` };
}

function registrableHost(hostname) {
  return String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
}

function viSourceHost(pkg) {
  const rec =
    pkg && pkg.vi && pkg.vi.ok && pkg.vi.value && typeof pkg.vi.value === "object"
      ? pkg.vi.value
      : {};
  const raw = rec.source_url || rec.sourceUrl || "";
  try {
    return registrableHost(new URL(String(raw)).hostname);
  } catch {
    return "";
  }
}

function officialWorkUrlOk(raw, viHost) {
  const s = String(raw || "").trim();
  if (!/^https:\/\//i.test(s)) {
    return {
      ok: false,
      reason: `compared_to entry is not an external https work/case URL (${s || "empty"})`,
    };
  }
  let u;
  try {
    u = new URL(s);
  } catch {
    return { ok: false, reason: `compared_to entry is not a URL (${s})` };
  }
  if (u.protocol !== "https:") {
    return { ok: false, reason: `compared_to must be https (${s})` };
  }
  const host = registrableHost(u.hostname);
  if (PORTFOLIO_HOSTS.has(host) || PORTFOLIO_HOSTS.has(u.hostname.toLowerCase())) {
    return {
      ok: false,
      reason: "compared_to must not be our live portfolio (ai.drsfilms.com)",
    };
  }
  if (viHost && host !== viHost) {
    return {
      ok: false,
      reason: `compared_to host ${host} is not this company's official site (${viHost})`,
    };
  }
  const path = u.pathname || "/";
  if (path === "/" || path === "") {
    return {
      ok: false,
      reason: "compared_to home URL is chrome, not a work/case page",
    };
  }
  if (!WORK_PATH_RE.test(path)) {
    return {
      ok: false,
      reason: `compared_to must be an official work/case page path (${s})`,
    };
  }
  return { ok: true, reason: s };
}

function officialWorkBarOk(pkg) {
  const recorded = recordedComparedTo(pkg);
  const viHost = viSourceHost(pkg);
  if (recorded.length < 2) {
    return {
      ok: false,
      compared_to: recorded,
      reason:
        "compared_to must name this company's official work/case pages (at least two external https URLs). Not our live portfolio, not a timestamp type-wall bar.",
    };
  }
  const notes = [];
  for (const item of recorded) {
    const ev = officialWorkUrlOk(item, viHost);
    notes.push(ev.ok ? ev.reason : ev.reason);
    if (!ev.ok) {
      return {
        ok: false,
        compared_to: recorded,
        reason: ev.reason,
      };
    }
  }
  return {
    ok: true,
    compared_to: recorded,
    reason: `official work/case bar: ${recorded.join(", ")}`,
  };
}

function recordedComparedTo(pkg) {
  const raw = pkg && pkg.manifest && pkg.manifest.compared_to;
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => String(s || "").trim()).filter(Boolean);
}

function sameSlugSet(a, b) {
  const sa = [...(a || [])].map((x) => String(x || "").trim()).filter(Boolean).sort();
  const sb = [...(b || [])].map((x) => String(x || "").trim()).filter(Boolean).sort();
  if (sa.length !== sb.length) return false;
  return sa.every((x, i) => x === sb[i]);
}

function fatBrandColorDocumentHeader(html, primaryHex) {
  const src = String(html || "");
  if (!src.trim()) return { hit: false, reason: "no HTML" };
  const css = styleBlocks(src);
  const rules = cssRules(css);
  const vars = collectVars(css, src);
  const family = hexFamily(primaryHex);
  const header = firstHeaderMarkup(src);
  if (!headerIsBrandColorBlock(header, rules, vars, family)) {
    return { hit: false, reason: "no fat brand-color document header" };
  }
  return { hit: true, reason: "fat brand-color document header" };
}

module.exports = {
  FRAME_CHROME_MAX_PX,
  FRAME_MIN_VH,
  firstViewportIsFrame,
  noResumeMasthead,
  noTypeSlabWorkSlot,
  leadMediaCleared,
  officialWorkBarOk,
  officialWorkUrlOk,
  recordedComparedTo,
  sameSlugSet,
  fatBrandColorDocumentHeader,
  firstMediaMatch,
  viSourceHost,
};
