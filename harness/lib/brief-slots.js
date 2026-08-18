"use strict";

/**
 * Page composition is locked at R0 Brief analysis, not after a Profile exists.
 * Giant Spoon shipped as a movie page because R2 hung public BHOAF stills
 * instead of the Brief's ad/reel lead. Named from that miss.
 */

const { workIdsFrom } = require("./manifest");
const { loadCatalog } = require("./asset-clearance");

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

function briefLeadAssetsClearable(attrs) {
  const slots = pageSlotsFrom(attrs);
  if (!slots.ok || !slots.lead.length) {
    return { ok: true, reason: "lead-asset clearance N/A until page_slots.lead exists" };
  }
  const blocked = [];
  for (const item of slots.lead) {
    const row = catalogMatch(item);
    if (row && !dualGateClearable(row)) {
      blocked.push(row.id || item);
      continue;
    }
    const cat = categorize(item);
    if (!row && cat) {
      const peers = workCatalog().filter((w) => w.category === cat);
      if (peers.length && !peers.some(dualGateClearable)) {
        blocked.push(item);
      }
    }
  }
  if (blocked.length) {
    return {
      ok: false,
      reason: `lead id cannot be hung (no dual-gate still): ${blocked.join(", ")} — do not substitute another category later`,
    };
  }
  return {
    ok: true,
    reason: "Brief lead ids are dual-gate clearable, or uncatalogued fixture ids",
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
  isPLedAgencyProducer,
  firstWorkRow,
  firstViewportChunk,
};
