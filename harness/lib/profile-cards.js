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
const SEVEN_STAGE_RE = /7[- ]stage|seven[- ]stage/i;
const BRAND_RE = /\b(coach|nike|bmw|tencent)\b/i;
const RATIO_21_RE = /aspect-ratio\s*:\s*21\s*[/:]\s*9/i;
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

function pageCss(html) {
  return [...String(html || "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
}

function hasPlayControl(chunk) {
  return (
    /class=["'][^"']*\bplay\b/i.test(chunk) ||
    /aria-label=["'][^"']*play/i.test(chunk) ||
    />\s*play\s*</i.test(chunk)
  );
}

function cardHas21x9(card, html) {
  if (RATIO_21_RE.test(card)) return true;
  if (/\b(reel-poster|poster-21|ratio-21)\b/i.test(card) && RATIO_21_RE.test(pageCss(html))) {
    return true;
  }
  return false;
}

function reelArticles(html) {
  const src = visibleHtml(html);
  return [...src.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)]
    .map((m) => m[1])
    .filter((body) => SHOWREEL_RE.test(body));
}

function showreelIsPicture(html) {
  const src = visibleHtml(html);
  if (!SHOWREEL_RE.test(src)) {
    return { ok: true, reason: "no showreel claimed" };
  }
  const reelCards = reelArticles(html);
  if (reelCards.length) {
    const pictured = reelCards.filter((body) => workImagesInHtml(body).length > 0);
    if (!pictured.length) {
      return {
        ok: false,
        reason: "showreel card has no picture (text/iframe-only · IN-CARD class)",
      };
    }
    const wide = pictured.some((body) => cardHas21x9(body, html));
    const play = pictured.some((body) => hasPlayControl(body));
    if (!wide || !play) {
      return {
        ok: false,
        reason: "showreel must be a 21:9 poster + play (not a 16:9 text/iframe card)",
      };
    }
    return { ok: true, reason: "showreel card is a 21:9 poster + play" };
  }
  return {
    ok: false,
    reason: "showreel described in a paragraph (text-card · recruiter 6-second FAIL)",
  };
}

function noEmptyWhiteWorkCards(html) {
  const src = visibleHtml(html);
  const cards = [...src.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)];
  for (const m of cards) {
    const attrs = m[1] || "";
    const body = m[2] || "";
    if (!/\bwork-card\b/i.test(attrs)) continue;
    if (workImagesInHtml(body).length === 0) {
      return {
        ok: false,
        reason: "empty white work card (no still) — recruiter 6-second FAIL",
      };
    }
  }
  const marks = src.match(/<ul\b[^>]*class=["'][^"']*\bmarks\b[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
  if (marks && BRAND_RE.test(marks[1]) && workImagesInHtml(marks[1]).length === 0) {
    return {
      ok: false,
      reason: "empty white brand cards (wordmarks, no stills)",
    };
  }
  return { ok: true, reason: "no empty white work cards" };
}

function brandStillsNotWordmarks(html) {
  const src = String(html || "");
  if (!BRAND_RE.test(src)) {
    return { ok: true, reason: "no brand credits claimed" };
  }
  const imgs = workImagesInHtml(src)
    .map((i) => i.tag)
    .join(" ");
  const claimed = ["coach", "nike", "bmw", "tencent"].filter((b) =>
    new RegExp(`\\b${b}\\b`, "i").test(src)
  );
  const stills = claimed.filter((b) => new RegExp(b, "i").test(imgs));
  if (stills.length === 0) {
    return {
      ok: false,
      reason: "brand credits are wordmarks, not stills",
    };
  }
  if (stills.length < Math.min(2, claimed.length)) {
    return {
      ok: false,
      reason: "brand stills required; wordmarks are not credits",
    };
  }
  return { ok: true, reason: "brand credits are stills, not wordmarks" };
}

function jdAsksProcessGates(pkg) {
  const brief = `${(pkg && pkg.brief && pkg.brief.value) || ""}\n${JSON.stringify(
    (pkg && pkg.briefAttrs) || {}
  )}`;
  return (
    /\b(must|should)\b[\s\S]{0,80}\b(process|gates)\b/i.test(brief) ||
    /\b(process|gates)\b[\s\S]{0,80}\b(must|should)\b/i.test(brief) ||
    /\bDOC-6\b|\bR8\b/.test(brief)
  );
}

function sixStageImgs(html) {
  return [...String(html || "").matchAll(/<img\b[^>]*>/gi)].filter((m) => {
    const tag = m[0];
    return (
      /6[- ]?stage|workflow-6stage|method-strip|six-stage/i.test(tag) &&
      /\.(png|svg)(\?|"|'|\s|>)/i.test(tag)
    );
  });
}

function sixVs58CaptionMix(html) {
  const src = String(html || "");
  const blocks = [
    ...src.matchAll(/<(figcaption|p|h[1-6]|span)[^>]*>([\s\S]*?)<\/\1>/gi),
  ];
  for (const b of blocks) {
    const t = String(b[2] || "").replace(/<[^>]+>/g, " ");
    const has6 = /6[- ]?stage|six[- ]stage/i.test(t);
    const has758 = /7[- ]stage|seven[- ]stage|58[- ]node/i.test(t);
    if (
      has6 &&
      has758 &&
      !/distinct|must not be mixed|not the same|do not mix|numbers must not/i.test(t)
    ) {
      return true;
    }
  }
  for (const img of src.matchAll(/<img\b[^>]*>/gi)) {
    const t = img[0];
    if (
      /6[- ]?stage|six[- ]stage/i.test(t) &&
      /7[- ]stage|58[- ]node/i.test(t)
    ) {
      return true;
    }
  }
  return false;
}

function sixStageOneGraphic(html, pkg) {
  const arch = archetypeOf(pkg);
  const src = String(html || "");
  if (sixVs58CaptionMix(src)) {
    return {
      ok: false,
      reason: "6-stage caption mixed with 7-stage/58-node (numbers must not be mixed)",
    };
  }

  const stageImgs = sixStageImgs(src);
  const textGrid =
    /6[- ]stage|six[- ]stage/i.test(src) &&
    stageImgs.length === 0 &&
    (/<div\b[^>]*class=["'][^"']*\bstrip\b/i.test(src) ||
      (src.match(/<(p|div)[^>]*>\s*0[1-6]\b/gi) || []).length >= 6);

  if (arch === "O") {
    if (stageImgs.length !== 1 || textGrid) {
      return {
        ok: false,
        reason: "O-led A-WORKFLOW-6STAGE is required (DOC-6/R8) as one picture, not six <p> boxes",
      };
    }
    return { ok: true, reason: "O-led 6-stage is one graphic (DOC-6/R8)" };
  }

  if (arch === "A") {
    if (!stageImgs.length && !textGrid) {
      return { ok: true, reason: "A-led 6-stage supporting N/A (not invoked)" };
    }
    const film = /one\s*click\s*mute|manga\s*cut|doombrush|brief\s*history|showreel/i.exec(
      src
    );
    const stage = /6[- ]stage|six[- ]stage|workflow-6stage|from first brief/i.exec(src);
    if (stage && film && stage.index < film.index) {
      return { ok: false, reason: "A-led 6-stage must be supporting only, not the lead" };
    }
    if (textGrid) {
      return { ok: false, reason: "A-led 6-stage must be a picture, not six <p> boxes" };
    }
    return { ok: true, reason: "A-led 6-stage is supporting only" };
  }

  if (arch !== "P") {
    return { ok: true, reason: "6-stage graphic N/A off P/O/A" };
  }

  if (SEVEN_STAGE_RE.test(src) && /6[- ]stage|six[- ]stage/i.test(src)) {
    return { ok: false, reason: "P-led page mixed 6-stage with 7-stage" };
  }
  if (SEVEN_STAGE_RE.test(src) && !/6[- ]stage|six[- ]stage/i.test(src)) {
    return { ok: false, reason: "P-led page invoked 7-stage (forbidden)" };
  }

  const work = /brief\s*history|showreel|one\s*click\s*mute/i.exec(src);
  const stageHit = /6[- ]stage|six[- ]stage|workflow-6stage|from first brief/i.exec(src);
  if (stageHit && work && stageHit.index < work.index) {
    return { ok: false, reason: "P-led 6-stage is the lead (method slot only)" };
  }

  if (textGrid || ( /6[- ]stage|six[- ]stage/i.test(src) && stageImgs.length !== 1 )) {
    return {
      ok: false,
      reason: "P-led A-WORKFLOW-6STAGE must be one reskinned PNG/SVG, not a text grid / six <p> boxes",
    };
  }

  if (stageImgs.length === 1) {
    if (!/footnote|figcaption|locked six[- ]stage|locked method/i.test(src)) {
      return { ok: false, reason: "P-led 6-stage missing locked footnote" };
    }
    return { ok: true, reason: "P-led 6-stage is one graphic + locked footnote in the method slot" };
  }

  if (jdAsksProcessGates(pkg)) {
    return {
      ok: false,
      reason: "P-led JD asks process/gates as must-or-should; 6-stage picture required in the method slot",
    };
  }
  return { ok: true, reason: "P-led 6-stage not required (JD has no process/gates must-or-should)" };
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
    if (SEVEN_STAGE_RE.test(src)) {
      return { ok: false, reason: "P-led page invoked 7-stage (forbidden on Senior Producer)" };
    }
    const reel = SHOWREEL_RE.exec(src);
    const inDev = [...src.matchAll(/in development/gi)];
    if (inDev.length >= 2) {
      return { ok: false, reason: "P-led page has an in-dev tool wall taller than the trad reel" };
    }
    if (inDev[0] && reel && inDev[0].index < reel.index) {
      return { ok: false, reason: "P-led in-dev tool wall appears before the trad reel" };
    }
    const pbHits = [...src.matchAll(/prompt builder/gi)];
    const work = /brief\s*history|showreel|one\s*click\s*mute/i.exec(src);
    if (pbHits[0] && work && pbHits[0].index < work.index) {
      return { ok: false, reason: "P-led page leads with Prompt Builder" };
    }
    const pbCards = [...visibleHtml(src).matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)]
      .map((m) => m[1])
      .filter((body) => /prompt builder/i.test(body));
    if (pbCards.length > 1) {
      return { ok: false, reason: "P-led Prompt Builder must be last, one card" };
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
        "P-led invocation: reel first, 6-stage graphic, no 58-node/7-stage, no in-dev wall, Prompt Builder last",
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
    return {
      ok: true,
      reason: "A-led invocation: films first; tools strip and 58-node allowed",
    };
  }

  return { ok: true, reason: "invocation N/A" };
}

module.exports = {
  showreelIsPicture,
  creditsNotLegalParagraph,
  noInternalAssetIds,
  invocationOk,
  archetypeOf,
  noEmptyWhiteWorkCards,
  brandStillsNotWordmarks,
  sixStageOneGraphic,
  jdAsksProcessGates,
  INTERNAL_ASSET_IDS,
};
