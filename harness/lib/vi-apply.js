"use strict";

/**
 * R-VI: tokens without USAGE are a fail. Official distill is hex/font *and*
 * how they are used (wordmark/field on a canvas). Applying the primary only
 * as 10px labels on a black/white résumé is token-only.
 */

function isNonEmpty(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}

function usageNode(rec) {
  if (!rec || typeof rec !== "object") return null;
  return rec.usage || rec.usage_notes || rec.usageNotes || rec.application || null;
}

function usageText(rec) {
  const u = usageNode(rec);
  if (u == null) return "";
  if (typeof u === "string") return u;
  try {
    return JSON.stringify(u);
  } catch {
    return String(u);
  }
}

function viHasUsage(rec) {
  const text = usageText(rec);
  if (!text.trim()) {
    return {
      ok: false,
      reason: "VI has tokens but no usage notes (token-only distill)",
    };
  }
  if (!/(wordmark|field|canvas|masthead|chrome|applied as|background)/i.test(text)) {
    return {
      ok: false,
      reason:
        "VI usage notes do not say how tokens are applied (field/wordmark/canvas)",
    };
  }
  return { ok: true, reason: "VI usage notes present" };
}

function normalizeHex(raw) {
  let s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{8}$/.test(s)) return s.slice(0, 7);
  return "";
}

function hexValues(node, out = []) {
  if (node == null) return out;
  if (typeof node === "string") {
    const n = normalizeHex(node);
    if (n) out.push(n);
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((v) => hexValues(v, out));
    return out;
  }
  if (typeof node === "object") {
    Object.values(node).forEach((v) => hexValues(v, out));
  }
  return out;
}

function primaryHexFromVi(rec) {
  if (!rec || typeof rec !== "object") return "";
  const hex = rec.hex;
  if (hex && typeof hex === "object" && !Array.isArray(hex) && hex.primary) {
    return normalizeHex(hex.primary);
  }
  return hexValues(hex)[0] || "";
}

function hexFamily(primary) {
  const n = normalizeHex(primary);
  const set = new Set();
  if (n) set.add(n);
  // Official Giant Spoon Klein Blue is recorded as #0033A0 / #0033A1.
  if (n === "#0033a0") set.add("#0033a1");
  if (n === "#0033a1") set.add("#0033a0");
  return set;
}

function styleBlocks(html) {
  return [...String(html || "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
}

function cssRules(css) {
  const src = String(css || "").replace(/\/\*[\s\S]*?\*\//g, " ");
  const rules = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open < 0) break;
    const sel = src.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < src.length && depth) {
      if (src[j] === "{") depth += 1;
      else if (src[j] === "}") depth -= 1;
      j += 1;
    }
    const body = src.slice(open + 1, j - 1);
    if (body.includes("{")) {
      rules.push(...cssRules(body));
    } else if (sel && !/^@/.test(sel)) {
      rules.push({ selector: sel, body });
    }
    i = j;
  }
  return rules;
}

function collectVars(rules, html) {
  const vars = {};
  const from = `${rules.map((r) => r.body).join("\n")}\n${html || ""}`;
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

function mentionsFamily(value, family, vars) {
  return resolvedHexes(value, vars).some((h) => family.has(h));
}

function declValue(body, propRe) {
  const m = String(body || "").match(propRe);
  return m ? m[1].trim() : "";
}

function fontSizePx(body) {
  const m = String(body || "").match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/i);
  return m ? Number(m[1]) : null;
}

function paddingPx(body) {
  const nums = [...String(body || "").matchAll(/padding(?:-[a-z]+)?\s*:\s*([^;]+)/gi)]
    .flatMap((m) => [...String(m[1]).matchAll(/(\d+(?:\.\d+)?)px/g)].map((n) => Number(n[1])));
  return nums.length ? Math.max(...nums) : 0;
}

function minHeightPx(body) {
  const m = String(body || "").match(/min-height\s*:\s*(\d+(?:\.\d+)?)px/i);
  return m ? Number(m[1]) : 0;
}

const HOVER_SEL = /:(hover|focus|active|visited)\b/;
const LATE_SEL = /\b(footer|closing|legal|source|credits)\b/i;
const TICKER_SEL = /\b(emb-strip|ticker|kicker|eyebrow|index|tag|label|mono|stat\s+span|step\s+b)\b/i;
const FIELD_SEL =
  /\b(wordmark|brand-field|brandbar|masthead|vi-field|field-chrome|site-nav|\.brand\b)\b/i;

function classifyRule(rule, family, vars) {
  const sel = rule.selector || "";
  const body = rule.body || "";
  if (HOVER_SEL.test(sel)) return null;
  const bgVal = declValue(body, /background(?:-color)?\s*:\s*([^;]+)/i);
  const colorVal = declValue(body, /(?:^|;)\s*color\s*:\s*([^;]+)/i);
  const bgHit = bgVal && mentionsFamily(bgVal, family, vars);
  const colorHit = colorVal && mentionsFamily(colorVal, family, vars);
  if (!bgHit && !colorHit) return null;
  const px = fontSizePx(body);
  const pad = paddingPx(body);
  const minH = minHeightPx(body);
  if (bgHit && !LATE_SEL.test(sel)) {
    if (px != null && px <= 12) return "tiny";
    if (TICKER_SEL.test(sel) && (px == null || px <= 14)) return "tiny";
    if (FIELD_SEL.test(sel)) return "field";
    if (minH >= 48 || pad >= 18 || (px != null && px >= 18)) return "field";
    if (/\b(header|nav)\b/i.test(sel) && !/\bhero\b/i.test(sel)) return "field";
    return "weak-bg";
  }
  if (colorHit) {
    if (px != null && px <= 12) return "tiny";
    if (TICKER_SEL.test(sel)) return "tiny";
    return "color";
  }
  return null;
}

function inlineFieldHits(html, family, vars) {
  const src = String(html || "");
  const hits = [];
  const re = /<([a-z0-9]+)([^>]*style\s*=\s*["']([^"']*)["'][^>]*)>/gi;
  let m;
  while ((m = re.exec(src))) {
    const tag = m[1];
    const attrs = m[2] || "";
    const style = m[3] || "";
    const bgVal = declValue(style, /background(?:-color)?\s*:\s*([^;]+)/i);
    if (!bgVal || !mentionsFamily(bgVal, family, vars)) continue;
    if (LATE_SEL.test(tag) || LATE_SEL.test(attrs)) continue;
    const px = fontSizePx(style);
    if (px != null && px <= 12) continue;
    const pad = paddingPx(style);
    if (FIELD_SEL.test(attrs) || pad >= 18 || (px != null && px >= 18)) {
      hits.push(tag);
    }
  }
  return hits;
}

function primaryAppliedAsField(html, primaryHex) {
  const family = hexFamily(primaryHex);
  if (!family.size) {
    return { ok: false, reason: "no primary hex to apply as a field/wordmark" };
  }
  const src = String(html || "");
  if (!src.trim()) {
    return { ok: false, reason: "no profile HTML; primary cannot be a field" };
  }
  const rules = cssRules(styleBlocks(src));
  const vars = collectVars(rules, src);
  const kinds = [];
  for (const rule of rules) {
    const kind = classifyRule(rule, family, vars);
    if (kind) kinds.push({ kind, selector: rule.selector });
  }
  const inlines = inlineFieldHits(src, family, vars);
  const fields = kinds.filter((k) => k.kind === "field");
  if (fields.length || inlines.length) {
    return {
      ok: true,
      reason: `primary used as field/wordmark (${
        fields[0] ? fields[0].selector.trim() : "inline"
      })`,
    };
  }
  const tiny = kinds.filter((k) => k.kind === "tiny");
  const weak = kinds.filter((k) => k.kind === "weak-bg");
  if (tiny.length && !fields.length) {
    return {
      ok: false,
      reason:
        "primary hex only in tiny labels / almost no brand-color area (token-only VI)",
    };
  }
  if (weak.length && !fields.length) {
    return {
      ok: false,
      reason:
        "primary appears as a thin/late wash, not a wordmark or field (token-only VI)",
    };
  }
  return {
    ok: false,
    reason: "primary brand color not applied as a real field/wordmark",
  };
}

module.exports = {
  viHasUsage,
  usageNode,
  usageText,
  primaryHexFromVi,
  primaryAppliedAsField,
  normalizeHex,
  hexFamily,
  hexValues,
};
