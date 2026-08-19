"use strict";

/**
 * Page composition is locked at R0 Brief analysis, not after a Profile exists.
 * Giant Spoon shipped as a movie page because R2 hung public BHOAF stills
 * instead of the Brief's ad/reel lead. Named from that miss.
 */

const { workIdsFrom } = require("./manifest");
const { loadCatalog } = require("./asset-clearance");
const { workImagesInHtml } = require("./profile-images");

const SLOT_KEYS = ["archetype", "lead", "second", "supporting", "omit"];

const CATEGORY = {
  TRAD_REEL: "trad_reel",
  BRAND_SPOT: "brand_spot",
  INDIE_FILM: "indie_film",
};

function asList(v) {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => String(x == null ? "" : x).trim())
      .filter(Boolean);
  }
  const s = String(v).trim();
  return s ? [s] : [];
}

function normalizeToken(raw) {
  return String(raw || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, "-")
    .replace(/\s+/g, " ");
}

function compactToken(raw) {
  return normalizeToken(raw).replace(/[^a-z0-9]+/g, "");
}

function workCatalog() {
  const catalog = loadCatalog();
  return Array.isArray(catalog.work) ? catalog.work : [];
}

function catalogMatch(raw) {
  const n = normalizeToken(raw);
  const compact = compactToken(raw);
  if (!n && !compact) return null;
  for (const row of workCatalog()) {
    const ids = [row.id, ...(row.aliases || [])].map(normalizeToken);
    if (ids.includes(n)) return row;
    if (ids.map(compactToken).includes(compact)) return row;
  }
  return null;
}

function categorize(raw) {
  const row = catalogMatch(raw);
  if (row && row.category) return row.category;
  const n = normalizeToken(raw);
  const compact = compactToken(raw);
  if (
    /^(trad(itional)?\s+reel|showreel|a-showreel-trad|showreel-trad)$/.test(n) ||
    /traditional\s+advertising\s+(show)?reel/.test(n) ||
    compact === "showreel" ||
    compact === "showreeltrad" ||
    compact === "traditionalreel" ||
    compact === "tradreel" ||
    compact === "traditionaladvertisingshowreel" ||
    compact === "traditionaladvertisingreel"
  ) {
    return CATEGORY.TRAD_REEL;
  }
  if (
    /^(brand\s+spot|ads?|campaign|coach([- ]spot)?|nike|bmw)$/.test(n) ||
    /coach\s+brand\s+spot/.test(n) ||
    compact === "brandspot" ||
    compact === "coachspot" ||
    compact === "coach" ||
    compact === "coachbrandspot"
  ) {
    return CATEGORY.BRAND_SPOT;
  }
  if (
    /brief\s*history|bhoaf|brief-history/.test(n) ||
    compact === "briefhistoryofafamily" ||
    compact === "bhoaf"
  ) {
    return CATEGORY.INDIE_FILM;
  }
  return null;
}

function isAdsOrReel(raw) {
  const c = categorize(raw);
  return c === CATEGORY.TRAD_REEL || c === CATEGORY.BRAND_SPOT;
}

function isIndieFilm(raw) {
  return categorize(raw) === CATEGORY.INDIE_FILM;
}

function slotsSource(attrs) {
  const a = attrs && typeof attrs === "object" ? attrs : {};
  const nested = a.page_slots;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return { src: nested, via: "page_slots" };
  }
  const topHas = SLOT_KEYS.some((k) => Object.prototype.hasOwnProperty.call(a, k));
  if (topHas) return { src: a, via: "frontmatter" };
  return { src: null, via: "missing" };
}

function pageSlotsFrom(attrs) {
  const { src, via } = slotsSource(attrs);
  if (!src) {
    return {
      ok: false,
      via,
      missing: SLOT_KEYS.slice(),
      archetype: "",
      lead: [],
      second: [],
      supporting: [],
      omit: [],
    };
  }
  const missing = SLOT_KEYS.filter((k) => !Object.prototype.hasOwnProperty.call(src, k));
  return {
    ok: missing.length === 0,
    via,
    missing,
    archetype: src.archetype == null ? "" : String(src.archetype).trim(),
    lead: asList(src.lead),
    second: asList(src.second),
    supporting: asList(src.supporting),
    omit: asList(src.omit),
  };
}

function yamlSelectedWorkIds(attrs) {
  const a = attrs && typeof attrs === "object" ? attrs : {};
  return asList(a.selected_work_ids || a.work_ids || a.selected_work);
}

function leadIsFirst(workIds, leadItems) {
  const ids = workIds.map(normalizeToken);
  const leads = leadItems.map(normalizeToken).filter(Boolean);
  if (!leads.length) return { ok: false, reason: "page_slots.lead is empty" };
  if (!ids.length) {
    return { ok: false, reason: "selected_work_ids missing; cannot lock lead-first" };
  }
  const leadCats = leads.map(categorize);
  const namedOnly = leads.every((item, i) => !catalogMatch(item) && leadCats[i]);
  if (namedOnly) {
    const first = categorize(ids[0]);
    const allowed = new Set(leadCats.filter(Boolean));
    if (first && allowed.has(first)) {
      return { ok: true, reason: `selected_work_ids lead-first (${ids[0]} ∈ ${first})` };
    }
    return {
      ok: false,
      reason: `selected_work_ids must start with Brief lead category (${leads.join(", ")}); got ${ids[0]}`,
    };
  }
  for (let i = 0; i < leads.length; i += 1) {
    if (ids[i] !== leads[i] && compactToken(ids[i]) !== compactToken(leads[i])) {
      const idCat = categorize(ids[i]);
      const leadCat = categorize(leads[i]);
      if (idCat && leadCat && idCat === leadCat) continue;
      return {
        ok: false,
        reason: `selected_work_ids must be lead-first; expected ${leads.join(", ")} at the front, got ${ids.join(", ")}`,
      };
    }
  }
  return { ok: true, reason: `selected_work_ids lead-first: ${ids.slice(0, leads.length).join(", ")}` };
}

function briefPageSlotsOk(attrs) {
  const slots = pageSlotsFrom(attrs);
  if (!slots.ok) {
    return {
      ok: false,
      slots,
      reason: `Brief missing page_slots (or equivalent frontmatter) keys: ${slots.missing.join(", ") || "page_slots"}`,
    };
  }
  if (!slots.archetype) {
    return { ok: false, slots, reason: "page_slots.archetype is empty" };
  }
  if (!slots.lead.length) {
    return { ok: false, slots, reason: "page_slots.lead is empty" };
  }
  const workIds = yamlSelectedWorkIds(attrs);
  const order = leadIsFirst(workIds, slots.lead);
  if (!order.ok) return { ok: false, slots, reason: order.reason };
  return {
    ok: true,
    slots,
    reason: `page_slots ${slots.via}: archetype ${slots.archetype}; lead ${slots.lead.join(", ")}; ${order.reason}`,
  };
}

function isPLedAgencyProducer(pkg, slots) {
  const arch = `${(slots && slots.archetype) || ""} ${
    (pkg && pkg.briefAttrs && pkg.briefAttrs.archetype) || ""
  }`;
  const blob = [
    arch,
    (pkg && pkg.brief && pkg.brief.value) || "",
    JSON.stringify((pkg && pkg.briefAttrs) || {}),
    (pkg && pkg.manifest && pkg.manifest.role) || "",
    (pkg && pkg.manifest && pkg.manifest.company) || "",
  ].join("\n");
  const pLed = /\bp[- ]?led\b/i.test(blob) || /archetype:\s*p\b/i.test(blob);
  const agencyProd =
    /\b(senior\s+)?producer\b/i.test(blob) ||
    /\bagency\b/i.test(blob) ||
    /\bintegrated\s+production\b/i.test(blob);
  return pLed && agencyProd;
}

function briefLeadMatchesArchetype(attrs, pkg) {
  const slots = pageSlotsFrom(attrs);
  if (!slots.ok || !slots.lead.length) {
    return { ok: true, reason: "lead/archetype N/A until page_slots exist" };
  }
  if (!isPLedAgencyProducer(pkg, slots)) {
    return { ok: true, reason: "lead/archetype gate is for P-led agency/producer Briefs" };
  }
  const leadFilmOnly = slots.lead.length > 0 && slots.lead.every(isIndieFilm);
  const workIds = [
    ...yamlSelectedWorkIds(attrs),
    ...workIdsFrom(attrs || {}, (pkg && pkg.briefBody) || ""),
  ];
  const adsInList = workIds.some(isAdsOrReel);
  if (leadFilmOnly && adsInList) {
    return {
      ok: false,
      reason:
        "P-led agency/producer Brief lead is indie-film-only while ads/reel ids are in selected_work_ids (Giant Spoon miss)",
    };
  }
  return {
    ok: true,
    reason: `P-led lead ${slots.lead.join(", ")} matches agency/producer archetype`,
  };
}

function dualGateClearable(row) {
  return Boolean(row && row.external_ready && row.drs_public);
}

const ALLOWED_LEAD_VIMEO = {
  "190660903": {
    ids: ["coach-make-the-ground-shake", "coach-spot"],
    aliases: ["coach", "coach brand spot", "brand spot"],
    category: CATEGORY.BRAND_SPOT,
  },
  "1174467043": {
    ids: ["showreel-trad"],
    aliases: [
      "trad reel",
      "traditional reel",
      "showreel",
      "traditional advertising showreel",
      "traditional advertising reel",
    ],
    category: CATEGORY.TRAD_REEL,
  },
};

function allowedLeadVimeo(item, row) {
  const n = normalizeToken(item);
  const compact = compactToken(item);
  const rowId = row && row.id ? normalizeToken(row.id) : "";
  for (const [vimeoId, meta] of Object.entries(ALLOWED_LEAD_VIMEO)) {
    const ids = meta.ids.map(normalizeToken);
    const aliases = (meta.aliases || []).map(normalizeToken);
    if (rowId && ids.includes(rowId)) {
      return { ok: true, vimeoId, reason: `allowed Vimeo ${vimeoId}` };
    }
    if (ids.includes(n) || aliases.includes(n)) {
      return { ok: true, vimeoId, reason: `allowed Vimeo ${vimeoId}` };
    }
    if (
      ids.map(compactToken).includes(compact) ||
      aliases.map(compactToken).includes(compact)
    ) {
      return { ok: true, vimeoId, reason: `allowed Vimeo ${vimeoId}` };
    }
    if (row && row.category === meta.category && ids.includes(rowId)) {
      return { ok: true, vimeoId, reason: `allowed Vimeo ${vimeoId}` };
    }
  }
  return { ok: false, vimeoId: null, reason: null };
}

function leadItemHangable(item) {
  const row = catalogMatch(item);
  if (row && dualGateClearable(row)) {
    return { ok: true, reason: `dual-gate still (${row.id})` };
  }
  const vimeo = allowedLeadVimeo(item, row);
  if (vimeo.ok) {
    return {
      ok: true,
      reason: `${vimeo.reason} (Coach 190660903 / trad reel 1174467043)`,
    };
  }
  if (row) {
    return {
      ok: false,
      reason: `${row.id} has no dual-gate still and is not an allowed Vimeo embed`,
    };
  }
  const cat = categorize(item);
  if (cat) {
    const peers = workCatalog().filter((w) => w.category === cat);
    if (peers.some(dualGateClearable)) {
      return { ok: true, reason: `category ${cat} has a dual-gate still` };
    }
    const vimeoPeer = peers.some((w) => allowedLeadVimeo(w.id, w).ok);
    if (vimeoPeer) {
      return { ok: true, reason: `category ${cat} has an allowed Vimeo embed` };
    }
    if (peers.length) {
      return {
        ok: false,
        reason: `${item} has no dual-gate still and is not an allowed Vimeo embed`,
      };
    }
  }
  return {
    ok: false,
    reason:
      "uncatalogued fixture id is not a lead asset; need Vimeo or INDEX public:true still",
  };
}

function briefLeadAssetsClearable(attrs) {
  const slots = pageSlotsFrom(attrs);
  if (!slots.ok || !slots.lead.length) {
    return { ok: true, reason: "lead-asset clearance N/A until page_slots.lead exists" };
  }
  // R0 STOP is page_slots.lead only. selected_work_ids, second, and supporting
  // are not the lead slot. A second-slot work with no still is not an R0 STOP;
  // r2-profile-no-type-slab-work is the page exam for that hang. Missing a
  // reel id from selected_work_ids does not promote the next listed work to lead.
  const seen = new Set();
  const blocked = [];
  for (const item of slots.lead) {
    const key = normalizeToken(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const hang = leadItemHangable(item);
    if (!hang.ok) blocked.push(item);
  }
  if (blocked.length) {
    return {
      ok: false,
      reason: `lead id cannot be hung (no dual-gate still / allowed Vimeo, and uncatalogued files are not lead assets): ${blocked.join(
        ", "
      )} — STOP; do not substitute another category later`,
    };
  }
  return {
    ok: true,
    reason:
      "Brief lead ids are dual-gate clearable, or allowed Vimeo (Coach 190660903 / trad reel 1174467043)",
  };
}

function surfaceCategories(text) {
  const src = String(text || "");
  const cats = new Set();
  if (/showreel|traditional\s+reel|reel-poster|a-showreel-trad/i.test(src)) {
    cats.add(CATEGORY.TRAD_REEL);
  }
  if (/\b(coach|nike|bmw|brand\s+spot|campaign\s+spot)\b/i.test(src)) {
    cats.add(CATEGORY.BRAND_SPOT);
  }
  if (/brief\s*history|bhoaf/i.test(src)) {
    cats.add(CATEGORY.INDIE_FILM);
  }
  return cats;
}

function firstWorkRow(html) {
  const src = String(html || "");
  const workCard = src.match(
    /<article\b[^>]*class=["'][^"']*\bwork-card\b[^"']*["'][^>]*>[\s\S]*?<\/article>/i
  );
  if (workCard) return workCard[0];
  const article = src.match(/<article\b[^>]*>[\s\S]*?<\/article>/i);
  return article ? article[0] : "";
}

function firstViewportChunk(html) {
  const src = String(html || "");
  const body = src.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const chunk = body ? body[1] : src;
  const art = chunk.search(/<article\b/i);
  if (art >= 0) return chunk.slice(0, art);
  const img = chunk.match(/<img\b[^>]*>/i);
  if (img) {
    const end = chunk.indexOf(img[0]) + img[0].length;
    return chunk.slice(0, Math.min(chunk.length, end + 400));
  }
  return chunk.slice(0, 1600);
}

const FILM_SLATE_SRC_RE =
  /traditional-showreel-poster|2135053992|film-producer-slate|film_producer[_-]slate/i;
const FILM_SLATE_TEXT_RE =
  /\bfilm\s+producer\b|roles:\s*executive\s+producer/i;
const ADS_SHOWREEL_COPY_RE =
  /advertising\s+showreel|traditional\s+advertising\s+(?:show)?reel/i;
const AI_FILM_STILL_RE =
  /one-click-mute|one\s*click\s*mute|home-smarthome-manga|manga\s*cut|doombrush/i;
const ADS_LEAD_STILL_RE =
  /showreel|reel-poster|coach|advertising|brand\s+spot|make-the-ground-shake|campaign\s+spot|190660903|1174467043/i;
const ADS_VIMEO_RE =
  /player\.vimeo\.com\/video\/(190660903|1174467043)/i;

function firstImgTag(html) {
  const imgs = workImagesInHtml(html);
  return imgs.length ? imgs[0] : null;
}

function firstViewportSurface(html) {
  const first = firstImgTag(html);
  return `${firstViewportChunk(html)}\n${firstWorkRow(html)}\n${
    first ? `${first.tag} ${first.src}` : ""
  }`;
}

function filmSlateSignal(surface) {
  const src = String(surface || "");
  if (FILM_SLATE_SRC_RE.test(src)) {
    return "film-producer slate poster (traditional-showreel-poster / Vimeo 2135053992 title card)";
  }
  if (FILM_SLATE_TEXT_RE.test(src.replace(/<[^>]+>/g, " "))) {
    return "FILM PRODUCER / film-slate wordmark in the first viewport";
  }
  return null;
}

function pLedAdsBrief(pkg) {
  const attrs = (pkg && pkg.briefAttrs) || {};
  const slots = pageSlotsFrom(attrs);
  if (!isPLedAgencyProducer(pkg, slots)) return false;
  if (slots.lead.some(isAdsOrReel)) return true;
  const blob = `${(pkg && pkg.brief && pkg.brief.value) || ""}\n${JSON.stringify(attrs)}`;
  return ADS_SHOWREEL_COPY_RE.test(blob) || /coach/i.test(blob);
}

function pLedLeadNotFilmSlate(html, pkg) {
  const attrs = (pkg && pkg.briefAttrs) || {};
  const slots = pageSlotsFrom(attrs);
  if (!isPLedAgencyProducer(pkg, slots)) {
    return { ok: true, reason: "film-slate gate is for P-led agency/producer Briefs" };
  }
  const surface = firstViewportSurface(html);
  const slate = filmSlateSignal(surface);
  if (!slate) {
    return { ok: true, reason: "first viewport is not a FILM PRODUCER / film-slate wordmark" };
  }
  const adsBrief = pLedAdsBrief(pkg) || ADS_SHOWREEL_COPY_RE.test(surface);
  if (!adsBrief && !ADS_SHOWREEL_COPY_RE.test(String(html || ""))) {
    return { ok: true, reason: "film-slate gate requires a P-led ads Brief or advertising-showreel copy" };
  }
  return {
    ok: false,
    reason: `P-led ads Brief first viewport shows ${slate} fighting advertising showreel (Giant Spoon live 1.15.0 miss)`,
  };
}

function imgIndex(html, tag) {
  const src = String(html || "");
  const i = src.indexOf(tag);
  return i >= 0 ? i : Infinity;
}

function adsLeadFrames(html) {
  const src = String(html || "");
  const frames = [];
  for (const img of workImagesInHtml(src)) {
    const blob = `${img.tag} ${img.src}`;
    if (AI_FILM_STILL_RE.test(blob) && !ADS_LEAD_STILL_RE.test(blob)) continue;
    if (ADS_LEAD_STILL_RE.test(blob) || FILM_SLATE_SRC_RE.test(blob)) {
      frames.push({ kind: "img", index: imgIndex(src, img.tag), src: img.src, tag: img.tag });
    }
  }
  const iframeRe = /<iframe\b[^>]*>/gi;
  let m;
  while ((m = iframeRe.exec(src))) {
    if (ADS_VIMEO_RE.test(m[0])) {
      frames.push({ kind: "vimeo", index: m.index, tag: m[0] });
    }
  }
  frames.sort((a, b) => a.index - b.index);
  return frames;
}

function aiFilmStills(html) {
  const src = String(html || "");
  const stills = [];
  for (const img of workImagesInHtml(src)) {
    const blob = `${img.tag} ${img.src}`;
    if (!AI_FILM_STILL_RE.test(blob)) continue;
    stills.push({ src: img.src, tag: img.tag, index: imgIndex(src, img.tag) });
  }
  stills.sort((a, b) => a.index - b.index);
  return stills;
}

function aiThreeTileHero(html) {
  const src = String(html || "");
  const blocks = [
    ...src.matchAll(
      /<(div|section|article)([^>]*class=["'][^"']*\bai-strip\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi
    ),
  ];
  for (const b of blocks) {
    if (aiFilmStills(b[3]).length >= 3) return true;
  }
  if (
    /grid-template-columns\s*:\s*repeat\(\s*3/i.test(src) &&
    aiFilmStills(src).length >= 3
  ) {
    return true;
  }
  return false;
}

function pLedAiMustNotDominate(html, pkg) {
  const attrs = (pkg && pkg.briefAttrs) || {};
  const slots = pageSlotsFrom(attrs);
  if (!isPLedAgencyProducer(pkg, slots)) {
    return { ok: true, reason: "AI-dominate gate is for P-led agency/producer pages" };
  }
  const ai = aiFilmStills(html);
  const ads = adsLeadFrames(html);
  if (!ai.length) {
    return { ok: true, reason: "no OCM/Manga/DoomBrush stills hung" };
  }
  if (aiThreeTileHero(html)) {
    return {
      ok: false,
      reason:
        "P-led page hangs AI film stills (OCM/Manga/DoomBrush) as a three-tile hero — larger/more numerous than ads lead frames",
    };
  }
  const firstAi = ai[0] ? ai[0].index : Infinity;
  const firstAds = ads[0] ? ads[0].index : Infinity;
  if (firstAi < firstAds) {
    return {
      ok: false,
      reason:
        "P-led: AI film stills (OCM/Manga/DoomBrush) appear before ads lead frames",
    };
  }
  if (ai.length > ads.length) {
    return {
      ok: false,
      reason: `P-led: AI film stills (${ai.length}) are more numerous than ads lead frames (${ads.length}) (OCM/Manga/DoomBrush vs reel/Coach)`,
    };
  }
  return {
    ok: true,
    reason: `AI film stills (${ai.length}) do not dominate ads lead frames (${ads.length})`,
  };
}

function profileFollowsBriefSlots(html, pkg) {
  const attrs = (pkg && pkg.briefAttrs) || {};
  const slots = pageSlotsFrom(attrs);
  if (!slots.ok || !slots.lead.length) {
    return { ok: true, reason: "no Brief page_slots.lead; R0 owns that gate" };
  }
  const viewport = firstViewportChunk(html);
  const row = firstWorkRow(html);
  const surface = `${viewport}\n${row}`;
  const surfaceCats = new Set([
    ...surfaceCategories(viewport),
    ...surfaceCategories(row),
  ]);
  const leadCats = new Set(slots.lead.map(categorize).filter(Boolean));
  const leadTokens = slots.lead.map(normalizeToken);
  const surfaceNorm = normalizeToken(surface.replace(/<[^>]+>/g, " "));
  const idHit = leadTokens.some(
    (t) => t && (surfaceNorm.includes(t) || compactToken(surfaceNorm).includes(compactToken(t)))
  );
  const catHit = [...leadCats].some((c) => surfaceCats.has(c));
  if (idHit || catHit) {
    return {
      ok: true,
      reason: `first viewport / first work row matches Brief lead (${slots.lead.join(", ")})`,
    };
  }
  const leadIsAdsReel = [...leadCats].some(
    (c) => c === CATEGORY.TRAD_REEL || c === CATEGORY.BRAND_SPOT
  );
  const surfaceOnlyFilm =
    surfaceCats.size > 0 && [...surfaceCats].every((c) => c === CATEGORY.INDIE_FILM);
  if (leadIsAdsReel && surfaceOnlyFilm) {
    return {
      ok: false,
      reason:
        "page first work is only film stills while Brief lead is ads/reel (Giant Spoon / BHOAF substitution)",
    };
  }
  return {
    ok: false,
    reason: `first viewport / first work row does not match Brief page_slots.lead (${slots.lead.join(", ")})`,
  };
}

module.exports = {
  SLOT_KEYS,
  CATEGORY,
  asList,
  categorize,
  pageSlotsFrom,
  yamlSelectedWorkIds,
  briefPageSlotsOk,
  briefLeadMatchesArchetype,
  briefLeadAssetsClearable,
  profileFollowsBriefSlots,
  pLedLeadNotFilmSlate,
  pLedAiMustNotDominate,
  isPLedAgencyProducer,
  firstWorkRow,
  firstViewportChunk,
  firstViewportSurface,
  ALLOWED_LEAD_VIMEO,
  allowedLeadVimeo,
};
