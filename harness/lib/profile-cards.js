"use strict";

/**
 * Recruiter 6-second gates: showreel as a picture, brand marks not a
 * legal paragraph, no internal asset ids, archetype-based invocation.
 * Asset ids are named here; HyperAgent files are not copied.
 */

const { workImagesInHtml } = require("./profile-images");

const INTERNAL_ASSET_IDS = [
  /\bA-SHOWREEL-TRAD\b/i,
  /\bA-WORKFLOW-6STAGE\b/i,
  /\bA-WORKFLOW-58NODE\b/i,
  /\bA-TOOL-PROMPTBUILDER\b/i,
  /\bA-TOOLS-DEV4\b/i,
  /\bA-FILM-[A-Z0-9-]+\b/i,
];

const SHOWREEL_RE = /showreel|traditional\s+reel/i;
const FIFTY_EIGHT_RE = /58[- ]node|A-WORKFLOW-58NODE|workflow-58/i;
const BRAND_RE = /\b(coach|nike|bmw|tencent)\b/i;
const HEDGE_RE =
  /not (my|a|an|giant)|production-company|aggregate|disclaimer|not an in-house|earlier brand work|not a single job|from the production-company/i;

function visibleHtml(html) {
  return String(html || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
}

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

function showreelIsPicture(html) {
  const src = visibleHtml(html);
  if (!SHOWREEL_RE.test(src)) {
    return { ok: true, reason: "no showreel claimed" };
  }
  // Judge the showreel *article*, not a parent <section> that also holds other stills.
  const articles = [...src.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)].map(
    (m) => m[1]
  );
  const reelCards = articles.filter((body) => SHOWREEL_RE.test(body));
  if (reelCards.length) {
    if (reelCards.some((body) => workImagesInHtml(body).length > 0)) {
      return { ok: true, reason: "showreel card has a picture" };
    }
    return {
      ok: false,
      reason: "showreel card has no picture (text/iframe-only · IN-CARD class)",
    };
  }
  if (
    workImagesInHtml(src).length > 0 &&
    /<img\b[\s\S]{0,500}(?:showreel|traditional\s+reel)|(?:showreel|traditional\s+reel)[\s\S]{0,500}<img\b/i.test(
      src
    )
  ) {
    return { ok: true, reason: "showreel has an adjacent picture" };
  }
  return {
    ok: false,
    reason: "showreel described in a paragraph (text-card · recruiter 6-second FAIL)",
  };
}

function creditsNotLegalParagraph(html) {
  const src = String(html || "");
  if (!BRAND_RE.test(src)) {
    return { ok: true, reason: "no brand-credit wall claimed" };
  }
  const blocks = [
    ...src.matchAll(/<(p|div)([^>]*)>([\s\S]*?)<\/\1>/gi),
  ];
  for (const b of blocks) {
    const attrs = b[2] || "";
    const inner = b[3] || "";
    const words = stripToWords(inner);
    const text = words.join(" ");
    if (!BRAND_RE.test(text)) continue;
    const hedge = HEDGE_RE.test(text);
    const isCredits = /\bcredits\b/i.test(attrs);
    if ((words.length >= 40 && hedge) || (isCredits && words.length >= 30 && hedge)) {
      return {
        ok: false,
        reason: "brand credits are a legal paragraph (recruiter 6-second FAIL)",
      };
    }
  }
  return { ok: true, reason: "brand credits are not a legal wall" };
}

function noInternalAssetIds(html) {
  const visible = visibleHtml(html);
  const hits = INTERNAL_ASSET_IDS.filter((re) => re.test(visible)).map((re) =>
    String(re)
  );
  if (hits.length) {
    return {
      ok: false,
      reason: "internal asset ids visible on the public page (A-SHOWREEL-TRAD class)",
    };
  }
  return { ok: true, reason: "no internal asset ids on the page" };
}

function archetypeOf(pkg) {
  const brief = `${JSON.stringify((pkg && pkg.briefAttrs) || {})}\n${
    (pkg && pkg.brief && pkg.brief.value) || ""
  }`;
  const role = String((pkg && pkg.manifest && pkg.manifest.role) || "");
  if (/\bp-led\b/i.test(brief) || /archetype:\s*p\b/i.test(brief)) return "P";
  if (/\bo-led\b/i.test(brief) || /archetype:\s*o\b/i.test(brief)) return "O";
  if (/\ba-led\b/i.test(brief) || /archetype:\s*a\b/i.test(brief)) return "A";
  if (/operations/i.test(role)) return "O";
  if (/\b(senior\s+)?producer\b/i.test(role)) return "P";
  if (/\bai\b|creative technologist|wonder/i.test(role)) return "A";
  return null;
}

function invocationOk(html, pkg) {
  const src = String(html || "");
  const arch = archetypeOf(pkg);
  if (!arch) return { ok: true, reason: "no P/O/A archetype to invoke" };

  if (arch === "P") {
    if (FIFTY_EIGHT_RE.test(src)) {
      return { ok: false, reason: "P-led page invoked A-WORKFLOW-58NODE (forbidden)" };
    }
    const inDev = [...src.matchAll(/in development/gi)];
    if (inDev.length >= 2) {
      return { ok: false, reason: "P-led page has an in-dev tool wall (A-TOOLS-DEV4)" };
    }
    const pb = /prompt builder/i.exec(src);
    const work = /brief\s*history|showreel|one\s*click\s*mute/i.exec(src);
    if (pb && work && pb.index < work.index) {
      return { ok: false, reason: "P-led page leads with Prompt Builder" };
    }
    const stage = /(?:6[- ]stage|from first brief|intake)/i.exec(src);
    if (stage && work && stage.index < work.index) {
      return {
        ok: false,
        reason: "P-led page leads with A-WORKFLOW-6STAGE instead of the reel",
      };
    }
    return {
      ok: true,
      reason:
        "P-led invocation: reel/work first, no 58-node, no in-dev wall, Prompt Builder last",
    };
  }

  if (arch === "O") {
    const brief = String((pkg && pkg.brief && pkg.brief.value) || "");
    const wantsDepth =
      !/\bno\s+process[- ]depth\b/i.test(brief) &&
      /process[- ]depth|58[- ]node|node graph|workflow depth/i.test(brief);
    if (FIFTY_EIGHT_RE.test(src) && !wantsDepth) {
      return {
        ok: false,
        reason: "O-led page invoked A-WORKFLOW-58NODE without JD process depth",
      };
    }
    return { ok: true, reason: "O-led invocation ok" };
  }

  if (arch === "A") {
    const film = /one\s*click\s*mute|manga\s*cut|doombrush|brief\s*history/i.exec(
      src
    );
    const tools = /prompt builder|in development/i.exec(src);
    if (tools && film && tools.index < film.index) {
      return { ok: false, reason: "A-led page puts tools before A-FILM-* (Wonder exam)" };
    }
    return { ok: true, reason: "A-led invocation: films first" };
  }

  return { ok: true, reason: "invocation N/A" };
}

module.exports = {
  showreelIsPicture,
  creditsNotLegalParagraph,
  noInternalAssetIds,
  invocationOk,
  archetypeOf,
  INTERNAL_ASSET_IDS,
};
