"use strict";

/**
 * Moving visual bar: a new company Profile is judged against the newest
 * shipped public/{company}/index.html pages, not a frozen pair
 * (not ElevenLabs/Luma forever, not Wonder/Kalshi forever).
 *
 * Record lives on the package manifest as compared_to (existing package
 * field pattern). One checker. No sidecar.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { htmlHasWorkImages, firstViewportHasStill } = require("./profile-images");

const BAR_SIZE = 3;

function normalizeSlug(raw) {
  return String(raw || "")
    .trim()
    .replace(/^https?:\/\/ai\.drsfilms\.com\//i, "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function packageCompanySlug(pkg) {
  const url = pkg && pkg.manifest && pkg.manifest.profile_url;
  const fromUrl = normalizeSlug(url);
  if (fromUrl) return fromUrl.split("/")[0];
  const company = pkg && pkg.manifest && pkg.manifest.company;
  return String(company || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function recordedComparedTo(pkg) {
  const raw = pkg && pkg.manifest && pkg.manifest.compared_to;
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSlug).filter(Boolean);
}

function sameSlugSet(a, b) {
  const sa = [...a].map(normalizeSlug).filter(Boolean).sort();
  const sb = [...b].map(normalizeSlug).filter(Boolean).sort();
  if (sa.length !== sb.length) return false;
  return sa.every((x, i) => x === sb[i]);
}

function findGitRoot(start) {
  let dir = path.resolve(start || ".");
  for (let i = 0; i < 16; i++) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function listIndexPages(publicRoot) {
  const root = path.resolve(publicRoot || "");
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return [];
  }
  const out = [];
  let names = [];
  try {
    names = fs.readdirSync(root);
  } catch {
    return [];
  }
  for (const name of names) {
    const slug = normalizeSlug(name);
    if (!slug) continue;
    const indexPath = path.join(root, name, "index.html");
    try {
      if (fs.statSync(indexPath).isFile()) out.push({ slug, path: indexPath });
    } catch {
      // skip
    }
  }
  return out;
}

function resolvePublicRoot(pkg, opts = {}) {
  if (opts.publicRoot) return path.resolve(opts.publicRoot);
  const packageDir = (pkg && pkg.packageDir) || process.cwd();
  const local = path.join(packageDir, "public");
  if (listIndexPages(local).length) return local;
  const gitRoot =
    findGitRoot(packageDir) || findGitRoot(process.cwd()) || path.resolve(".");
  return path.join(gitRoot, "public");
}

function gitLastCommitUnix(absPath) {
  const root = findGitRoot(absPath);
  if (!root) {
    return { ts: null, source: "mtime", note: "git unavailable" };
  }
  const rel = path.relative(root, absPath).split(path.sep).join("/");
  try {
    const out = execFileSync(
      "git",
      ["-C", root, "log", "-1", "--format=%ct", "--", rel],
      {
        encoding: "utf8",
        timeout: 8000,
        stdio: ["ignore", "pipe", "ignore"],
      }
    );
    const n = parseInt(String(out || "").trim(), 10);
    if (Number.isFinite(n) && n > 0) return { ts: n, source: "git" };
  } catch {
    return { ts: null, source: "mtime", note: "git unavailable" };
  }
  return { ts: null, source: "mtime", note: "git unavailable" };
}

function fileMtimeUnix(absPath) {
  try {
    return Math.floor(fs.statSync(absPath).mtimeMs / 1000);
  } catch {
    return 0;
  }
}

function lastTouchUnix(absPath) {
  const git = gitLastCommitUnix(absPath);
  if (git.ts != null) return git;
  return {
    ts: fileMtimeUnix(absPath),
    source: "mtime",
    note: git.note || "git unavailable",
  };
}

function readHtml(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function isResumePage(html) {
  const src = String(html || "");
  if (!src.trim()) return true;
  return !htmlHasWorkImages(src).ok || !firstViewportHasStill(src).ok;
}

function hasFirstViewportStill(html) {
  const src = String(html || "");
  if (!src.trim()) return false;
  return htmlHasWorkImages(src).ok && firstViewportHasStill(src).ok;
}

function discoverPeers(pkg, opts = {}) {
  const publicRoot = resolvePublicRoot(pkg, opts);
  const self = packageCompanySlug(pkg);
  const pages = listIndexPages(publicRoot).filter((p) => p.slug !== self);
  const peers = pages.map((p) => {
    const touch = lastTouchUnix(p.path);
    return {
      slug: p.slug,
      path: p.path,
      ts: touch.ts || 0,
      source: touch.source,
      html: readHtml(p.path),
    };
  });
  peers.sort((a, b) => {
    if (b.ts !== a.ts) return b.ts - a.ts;
    return a.slug.localeCompare(b.slug);
  });
  const bar = peers.slice(0, BAR_SIZE);
  const usedMtime = peers.some((p) => p.source === "mtime");
  const usedGit = peers.some((p) => p.source === "git");
  let clock = "git";
  if (usedMtime && usedGit) clock = "git+mtime";
  else if (usedMtime) clock = "mtime; git unavailable";
  return {
    publicRoot,
    peers,
    bar,
    compared_to: bar.map((p) => p.slug),
    clock,
  };
}

function profileHtmlSides(pkg, opts = {}) {
  const localHtml =
    pkg && pkg.paths && pkg.paths.profileHtml && pkg.profileHtml && pkg.profileHtml.ok
      ? String(pkg.profileHtml.value || "").trim()
      : "";
  const liveHtml =
    opts.fetchResult && opts.fetchResult.body
      ? String(opts.fetchResult.body || "").trim()
      : "";
  return { localHtml, liveHtml };
}

function formatComparedTo(slugs) {
  return slugs.length ? slugs.join(", ") : "(none)";
}

function recentBarOk(pkg, opts = {}) {
  const discovered = discoverPeers(pkg, opts);
  const compared_to = discovered.compared_to;
  const recorded = recordedComparedTo(pkg);
  const clockNote = discovered.clock;
  const comparedPhrase = `compared_to: ${formatComparedTo(compared_to)} (${clockNote})`;

  if (!sameSlugSet(recorded, compared_to)) {
    const stalePair =
      recorded.length === 2 &&
      ((sameSlugSet(recorded, ["elevenlabs", "luma"]) &&
        compared_to.some((s) => s !== "elevenlabs" && s !== "luma")) ||
        (sameSlugSet(recorded, ["wonder", "kalshi"]) &&
          compared_to.some((s) => s !== "wonder" && s !== "kalshi")));
    return {
      ok: false,
      compared_to,
      recorded,
      clock: clockNote,
      reason: stalePair
        ? `stale fixed pair ${formatComparedTo(recorded)}; ${comparedPhrase}`
        : `recorded ${formatComparedTo(recorded)}; ${comparedPhrase}`,
    };
  }

  const { localHtml, liveHtml } = profileHtmlSides(pkg, opts);
  const sides = [];
  if (localHtml) sides.push({ name: "local HTML", html: localHtml });
  if (liveHtml) sides.push({ name: "live HTML", html: liveHtml });
  if (!sides.length) sides.push({ name: "Profile HTML", html: "" });

  const barHasStill = discovered.bar.some((p) => hasFirstViewportStill(p.html));
  const resumeSides = sides.filter((s) => isResumePage(s.html));
  if (barHasStill && resumeSides.length) {
    return {
      ok: false,
      compared_to,
      recorded,
      clock: clockNote,
      reason: `text/résumé page (${resumeSides
        .map((s) => s.name)
        .join(", ")}; 0 work images / empty first viewport) while bar has a first-viewport still; ${comparedPhrase}`,
    };
  }

  return {
    ok: true,
    compared_to,
    recorded,
    clock: clockNote,
    reason: comparedPhrase,
  };
}

function profileRecentBarGate(pkg, opts = {}) {
  const ev = recentBarOk(pkg, opts);
  return {
    ok: ev.ok,
    detail: ev.reason,
    compared_to: ev.compared_to,
  };
}

module.exports = {
  BAR_SIZE,
  normalizeSlug,
  packageCompanySlug,
  recordedComparedTo,
  sameSlugSet,
  resolvePublicRoot,
  discoverPeers,
  isResumePage,
  hasFirstViewportStill,
  recentBarOk,
  profileRecentBarGate,
};
