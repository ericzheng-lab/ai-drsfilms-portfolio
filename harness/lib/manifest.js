"use strict";

const fs = require("fs");
const path = require("path");

const MANIFEST_NAMES = ["manifest.json", "package.manifest.json"];

function parseFrontmatter(text) {
  const src = String(text || "");
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!m) return { attrs: {}, body: src };
  return { attrs: parseSimpleYaml(m[1]), body: src.slice(m[0].length) };
}

function parseYamlScalar(rest) {
  const t = String(rest || "").trim();
  if (t === "") return [];
  if (t.startsWith("[") && t.endsWith("]")) {
    return t
      .slice(1, -1)
      .split(",")
      .map((s) => unquote(s.trim()))
      .filter((s) => s.length > 0);
  }
  return unquote(t);
}

function isPlainMap(v) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function ensureMap(attrs, key) {
  if (isPlainMap(attrs[key])) return;
  if (Array.isArray(attrs[key]) && attrs[key].length === 0) {
    attrs[key] = {};
    return;
  }
  if (attrs[key] == null) {
    attrs[key] = {};
    return;
  }
  attrs[key] = {};
}

function parseSimpleYaml(block) {
  const attrs = {};
  const lines = String(block || "").split(/\r?\n/);
  let currentKey = null;
  let nestedKey = null;
  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const top = raw.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (top) {
      currentKey = top[1];
      nestedKey = null;
      attrs[currentKey] = parseYamlScalar(top[2]);
      continue;
    }
    const nest = raw.match(/^(\s+)([A-Za-z0-9_]+):\s*(.*)$/);
    if (nest && currentKey) {
      ensureMap(attrs, currentKey);
      nestedKey = nest[2];
      attrs[currentKey][nestedKey] = parseYamlScalar(nest[3]);
      continue;
    }
    const list = raw.match(/^\s+-\s+(.+)$/);
    if (list && currentKey) {
      if (nestedKey && isPlainMap(attrs[currentKey])) {
        if (!Array.isArray(attrs[currentKey][nestedKey])) {
          attrs[currentKey][nestedKey] = [];
        }
        attrs[currentKey][nestedKey].push(unquote(list[1].trim()));
      } else {
        if (!Array.isArray(attrs[currentKey])) attrs[currentKey] = [];
        attrs[currentKey].push(unquote(list[1].trim()));
      }
      continue;
    }
  }
  return attrs;
}

function unquote(s) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return { ok: true, value: JSON.parse(raw), error: null };
  } catch (err) {
    return { ok: false, value: null, error: err.message };
  }
}

function readText(filePath) {
  try {
    return { ok: true, value: fs.readFileSync(filePath, "utf8"), error: null };
  } catch (err) {
    return { ok: false, value: null, error: err.message };
  }
}

function resolveManifestPath(packageDir, explicit) {
  if (explicit) return path.resolve(explicit);
  for (const name of MANIFEST_NAMES) {
    const candidate = path.join(packageDir, name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.join(packageDir, "manifest.json");
}

function loadPackage(opts) {
  const manifestPath = opts.manifestPath
    ? path.resolve(opts.manifestPath)
    : resolveManifestPath(path.resolve(opts.packageDir || "."));
  const packageDir = opts.packageDir
    ? path.resolve(opts.packageDir)
    : path.dirname(manifestPath);

  const loaded = readJson(manifestPath);
  const manifest = loaded.ok && loaded.value && typeof loaded.value === "object"
    ? loaded.value
    : {};

  const rel = (p) => (p ? path.resolve(packageDir, p) : null);

  const briefPath = rel(manifest.brief);
  const cvPath = rel(manifest.cv);
  const clPath = rel(manifest.cl);
  const viPath = rel(manifest.vi);
  const htmlPath = rel(manifest.profile_html);

  const briefFile = briefPath ? readText(briefPath) : { ok: false, value: "", error: "brief path missing" };
  const parsedBrief = parseFrontmatter(briefFile.value || "");

  const cvFile = cvPath ? readText(cvPath) : { ok: false, value: "", error: "cv path missing" };
  const clFile = clPath ? readText(clPath) : { ok: false, value: "", error: "cl path missing" };
  const htmlFile = htmlPath
    ? readText(htmlPath)
    : { ok: false, value: "", error: htmlPath ? "unreadable" : "profile_html omitted" };
  const viFile = viPath ? readJson(viPath) : { ok: false, value: null, error: "vi path missing" };

  return {
    packageDir,
    manifestPath,
    manifestLoaded: loaded.ok,
    manifestError: loaded.error,
    manifest,
    paths: {
      brief: briefPath,
      cv: cvPath,
      cl: clPath,
      vi: viPath,
      profileHtml: htmlPath,
    },
    brief: briefFile,
    briefAttrs: parsedBrief.attrs,
    briefBody: parsedBrief.body,
    cv: cvFile,
    cl: clFile,
    profileHtml: htmlFile,
    vi: viFile,
  };
}

function workIdsFrom(attrs, body) {
  const collected = [];
  const push = (v) => {
    if (Array.isArray(v)) v.forEach(push);
    else if (v != null && String(v).trim()) collected.push(String(v).trim());
  };
  push(attrs.selected_work_ids);
  push(attrs.work_ids);
  push(attrs.selected_work);
  const fromBody = String(body || "").match(/\bwork-[A-Za-z0-9._-]+/g) || [];
  fromBody.forEach(push);
  return [...new Set(collected)];
}

module.exports = {
  parseFrontmatter,
  parseSimpleYaml,
  loadPackage,
  resolveManifestPath,
  workIdsFrom,
  readJson,
  readText,
};
