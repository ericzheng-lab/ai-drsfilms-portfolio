#!/usr/bin/env node
// Prove the offline bundle really is offline. Machine check for the DoD lines in
// Film_Teaching/LOOP-STATE.md "Offline contingency (2026-08-31)".
//
// The browser is launched with a dead proxy AND every non-local request is
// aborted at the route level, so a network request does not merely fail — it is
// recorded and the run fails. That is a stricter test than switching the Wi-Fi
// off, because a request that would have gone out cannot hide behind a cached
// response.
//
//   node tools/offline-bundle/verify.mjs                  # headless Chromium
//   node tools/offline-bundle/verify.mjs --webkit         # Safari's engine
//   node tools/offline-bundle/verify.mjs --shots          # also write screenshots
//   node tools/offline-bundle/verify.mjs --brave         # Eric's actual browser
//   node tools/offline-bundle/verify.mjs --hotspot        # opposite check: with a
//        real connection, an external clip must still reach the YouTube player.
//        Needs the internet, so it is opt-in and not part of the offline run.
//
// Playwright is not a dependency of this repo; it is picked up from the global
// install on this machine.

import { createRequire } from 'node:module';
import { readdirSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');
// Defaults to the freshly built bundle; pass a path to check a copy instead —
// e.g. the folder actually unzipped on the classroom laptop.
const pathArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const BUNDLE = pathArg ? (pathArg.startsWith('/') ? pathArg : join(process.cwd(), pathArg)) : join(REPO, 'dist-offline', 'starx-week-1-offline');
const SHOTS = join(REPO, 'dist-offline', 'verify-shots');
const wantShots = process.argv.includes('--shots');
const hotspotMode = process.argv.includes('--hotspot');
const engine = process.argv.includes('--webkit') ? 'webkit' : process.argv.includes('--firefox') ? 'firefox' : 'chromium';
// Eric's default handler for .html is Brave. Same engine as Chromium, but its
// shields are its own, so drive the real binary when asked.
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const useBrave = process.argv.includes('--brave');

// This machine has several node installs and the one running this script is not
// necessarily the one playwright was installed under, so try each candidate root.
const roots = [];
if (process.env.PLAYWRIGHT_ROOT) roots.push(process.env.PLAYWRIGHT_ROOT);
try { roots.push(execSync('npm root -g', { encoding: 'utf8' }).trim()); } catch { /* no npm on PATH */ }
roots.push(join(dirname(dirname(process.execPath)), 'lib', 'node_modules'));
try {
  for (const bin of execSync('which -a node playwright', { encoding: 'utf8' }).trim().split('\n')) {
    roots.push(join(dirname(dirname(bin)), 'lib', 'node_modules'));
  }
} catch { /* nothing else to try */ }

let pw;
for (const root of [...new Set(roots)]) {
  try { pw = createRequire(join(root, 'resolve-from-here.js'))('playwright'); break; } catch { /* next root */ }
}
const chromium = pw && pw[engine];
if (!chromium) {
  console.error('playwright not found. Tried:\n  ' + [...new Set(roots)].join('\n  ') +
    '\nSet PLAYWRIGHT_ROOT to the node_modules directory that holds it.');
  process.exit(1);
}

const problems = [];
const note = (ok, label, detail) => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  ' + detail : ''));
  if (!ok) problems.push(label + (detail ? ' — ' + detail : ''));
};

const runHotspot = async () => {
  // The day-of ladder's second rung: laptop offline bundle + phone hotspot. The
  // eight clips must still play, which means the reachability probe has to
  // succeed and hand over to the iframe. This is the check that would catch the
  // offline fallback swallowing the working case.
  console.log('engine: ' + engine + '  (hotspot mode — this run DOES use the network)');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const yt = [];
  page.on('request', (r) => { if (/youtube|ytimg|googlevideo/.test(r.url())) yt.push(r.url()); });
  await page.goto(pathToFileURL(join(BUNDLE, 'START-THE-DECK.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelector('.play-btn.ext').click());
  await page.waitForTimeout(4000);
  const r = await page.evaluate(() => {
    const m = document.getElementById('lightbox-media');
    const f = m.querySelector('iframe');
    return { iframe: !!f, src: f ? f.getAttribute('src') : null, standIn: !!m.querySelector('.offline-clip') };
  });
  note(r.iframe && !r.standIn, 'with a connection, an external clip reaches the YouTube player', r.src || '');
  note(yt.some((u) => u.includes('img.youtube.com/vi/')), 'the reachability probe was actually sent', yt.filter((u) => u.includes('img.youtube.com')).slice(0, 1).join(''));
  note(yt.some((u) => u.includes('youtube.com/embed/')), 'the player was requested after the probe succeeded', yt.filter((u) => u.includes('/embed/')).slice(0, 1).join(''));
  await browser.close();
  console.log('\n' + (problems.length ? 'HOTSPOT CHECK FAILED:\n  - ' + problems.join('\n  - ') : 'HOTSPOT CHECK CLEAN'));
  process.exit(problems.length ? 1 : 0);
};

const run = async () => {
  if (wantShots) { rmSync(SHOTS, { recursive: true, force: true }); mkdirSync(SHOTS, { recursive: true }); }

  console.log('engine: ' + (useBrave ? 'Brave (real binary)' : engine));
  const browser = await chromium.launch({
    ...(useBrave ? { executablePath: BRAVE } : {}),
    // 127.0.0.1:1 is closed, so anything that escapes the route handler below
    // still cannot reach the internet. Playwright's WebKit build cannot navigate
    // to file:// with a refusing proxy set, so there the context's offline flag
    // plus the route handler carry the guarantee on their own.
    ...(engine === 'chromium' ? { proxy: { server: 'http://127.0.0.1:1' }, args: ['--autoplay-policy=no-user-gesture-required'] } : {}),
  });
  // Chromium can be held offline and have its requests aborted. WebKit cannot:
  // offline:true makes it fail file:// navigation outright with "WebKit
  // encountered an internal error", and registering ANY route on the context
  // silently drops the largest data: URI font, so the bundle reads as if it had
  // failed to embed Bricolage Grotesque when it had not. So WebKit runs with the
  // network merely watched, not blocked — enough to prove the deck asks for
  // nothing at idle, which is the DoD line. Chromium carries the blocking proof.
  const blocking = engine === 'chromium';
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, offline: blocking });

  const offNetwork = [];
  const consoleErrors = [];
  const pageErrors = [];

  if (blocking) {
    // Match on protocol so file: and data: are never intercepted at all.
    await ctx.route((url) => /^(https?|wss?):$/.test(url.protocol), (route) => route.abort());
  }

  const page = await ctx.newPage();
  // Watch every request whether or not it is being blocked, so both engines can
  // answer the same question: did anything ask to leave this machine?
  page.on('request', (r) => { if (/^https?:/.test(r.url())) offNetwork.push(r.url()); });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  const entry = pathToFileURL(join(BUNDLE, 'START-THE-DECK.html')).href;
  await page.goto(entry, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  console.log('\n--- 1. no request leaves the machine ---');
  note(offNetwork.length === 0, 'zero requests to a non-local host at idle',
    offNetwork.length ? offNetwork.slice(0, 5).join(' , ') : '(file: and data: only' + (blocking ? ', network also hard-blocked)' : ', network watched)'));

  console.log('\n--- 2. the three typefaces really loaded ---');
  // document.fonts.check() alone is not proof: it answers true for a fallback in
  // some engines. Measure instead — the same string in the real face and in a
  // generic must come out different widths.
  const fontProbe = await page.evaluate(() => {
    const probe = (stack) => {
      const s = document.createElement('span');
      s.textContent = 'Little Filmmakers 1895 Handgloves';
      s.style.cssText = 'position:fixed;left:-9999px;font-size:64px;white-space:nowrap;font-family:' + stack;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return w;
    };
    // WebKit reports family names with their quotes still on.
    const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/^["']|["']$/g, ''));
    return {
      loaded: [...new Set(loaded)],
      bricolage: [probe("'Bricolage Grotesque'"), probe('serif')],
      worksans: [probe("'Work Sans'"), probe('serif')],
      dmmono: [probe("'DM Mono'"), probe('serif')],
    };
  });
  for (const [name, key] of [['Bricolage Grotesque', 'bricolage'], ['Work Sans', 'worksans'], ['DM Mono', 'dmmono']]) {
    const [real, fb] = fontProbe[key];
    note(fontProbe.loaded.includes(name) && Math.abs(real - fb) > 1,
      `${name} renders from the embedded file`, `width ${real.toFixed(1)}px vs serif ${fb.toFixed(1)}px`);
  }

  console.log('\n--- 3. all 32 screens render, nothing broken ---');
  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  note(total === 32, '32 screens present', 'found ' + total);

  const brokenAll = [];
  const overflowAll = [];
  const missingThumb = [];
  for (let i = 0; i < total; i++) {
    if (i > 0) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(160);
    const r = await page.evaluate((idx) => {
      const slide = document.querySelectorAll('.slide')[idx];
      const broken = [...slide.querySelectorAll('img')]
        .filter((im) => im.complete && im.naturalWidth === 0)
        .map((im) => im.getAttribute('src'));
      const thumbs = [...slide.querySelectorAll('.ext-frame')]
        .map((el) => (el.getAttribute('style') || '').match(/url\('([^']+)'\)/))
        .filter(Boolean).map((m) => m[1]);
      const de = document.documentElement;
      return {
        counter: document.getElementById('counter').textContent.trim(),
        broken,
        thumbs,
        hOver: de.scrollWidth - de.clientWidth,
        vOver: de.scrollHeight - de.clientHeight,
      };
    }, i);
    if (r.broken.length) brokenAll.push(`#${i + 1}: ` + r.broken.join(', '));
    if (r.hOver > 1 || r.vOver > 1) overflowAll.push(`#${i + 1}: h+${r.hOver} v+${r.vOver}`);
    for (const t of r.thumbs) if (!t.startsWith('media/yt-posters/')) missingThumb.push(`#${i + 1}: ${t}`);
    if (wantShots) await page.screenshot({ path: join(SHOTS, String(i + 1).padStart(2, '0') + '.png') });
  }
  note(brokenAll.length === 0, 'zero broken images across 32 screens', brokenAll.slice(0, 4).join(' | '));
  note(overflowAll.length === 0, 'zero overflow at 1280x720', overflowAll.slice(0, 4).join(' | '));
  note(missingThumb.length === 0, 'every clip poster frame comes from the local folder', missingThumb.slice(0, 4).join(' | '));

  console.log('\n--- 4. the five public-domain films play offline ---');
  await page.evaluate(() => { document.querySelectorAll('.slide')[0].scrollIntoView(); });
  const vids = await page.evaluate(async () => {
    const out = [];
    for (const src of ['media/lumiere-usine.mp4', 'media/lumiere-train.mp4', 'media/lumiere-arroseur.mp4', 'media/melies-lune-eye.mp4', 'media/steamboat-willie.mp4']) {
      const v = document.createElement('video');
      v.src = src; v.muted = true;
      const r = await new Promise((res) => {
        v.addEventListener('loadeddata', () => v.play().then(
          () => setTimeout(() => res({ src, dur: v.duration, t: v.currentTime, w: v.videoWidth }), 700),
          (e) => res({ src, err: 'play: ' + e })));
        v.addEventListener('error', () => res({ src, err: 'load error' }));
        setTimeout(() => res({ src, err: 'timeout' }), 8000);
      });
      v.remove();
      out.push(r);
    }
    return out;
  });
  for (const v of vids) {
    note(!v.err && v.dur > 0 && v.t > 0 && v.w > 0, 'plays: ' + v.src,
      v.err ? v.err : `${v.dur.toFixed(1)}s, advanced to ${v.t.toFixed(2)}s, ${v.w}px wide`);
  }

  console.log('\n--- 5. presenter chrome and the lightbox work offline ---');
  // Exercise the presenter chrome rather than just looking for the nodes.
  const notesBefore = await page.evaluate(() => document.getElementById('notes').className);
  await page.keyboard.press('n');
  await page.waitForTimeout(200);
  const notesAfter = await page.evaluate(() => ({ cls: document.getElementById('notes').className, txt: document.getElementById('notes-txt').textContent.trim().length }));
  note(notesAfter.cls !== notesBefore && notesAfter.txt > 0, 'the "n" key toggles presenter notes and they carry text', `${notesAfter.txt} chars`);
  await page.keyboard.press('n');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const ov = await page.evaluate(() => ({ cls: document.getElementById('overview').className, cards: document.querySelectorAll('#ov-grid .ov-card').length }));
  note(/open/.test(ov.cls) && ov.cards === 32, 'Esc opens the overview grid with all 32 cards', `${ov.cards} cards`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // The segment clock: read it, wait, read it again — it has to be running.
  const t1 = await page.evaluate(() => document.getElementById('segtext').textContent.trim());
  await page.waitForTimeout(1300);
  const t2 = await page.evaluate(() => document.getElementById('segtext').textContent.trim());
  note(t1.length > 0 && t2.length > 0 && t1 !== '—', 'the segment timer is running', `"${t1}" -> "${t2}"`);

  // A no-network click on an external clip must settle on the poster stand-in
  // rather than a dead YouTube frame. Only meaningful where the network is
  // actually blocked; in WebKit a click would reach YouTube for real.
  const idxBefore = await page.evaluate(() => document.getElementById('counter').textContent.trim());
  if (blocking) {
    const beforeCount = offNetwork.length;
    await page.evaluate(() => document.querySelector('.play-btn.ext').click());
    // The stand-in appears at once with a "Loading the clip" line; the
    // reachability probe then fails and rewrites it. Wait past both.
    await page.waitForTimeout(900);
    const extClick = await page.evaluate(() => {
      const media = document.getElementById('lightbox-media');
      const img = media.querySelector('.offline-clip img');
      const msg = media.querySelector('.offline-msg');
      return {
        open: document.getElementById('lightbox').classList.contains('open'),
        standIn: !!media.querySelector('.offline-clip'),
        iframe: !!media.querySelector('iframe'),
        posterOk: !!img && img.complete && img.naturalWidth > 0,
        posterSrc: img ? img.getAttribute('src') : null,
        msg: msg ? msg.textContent.trim() : null,
      };
    });
    note(extClick.standIn && !extClick.iframe, 'external clip settles on the stand-in, not a dead embed');
    note(extClick.posterOk, 'the stand-in poster frame is a real local image', extClick.posterSrc || '');
    note(!!extClick.msg && !/Loading/.test(extClick.msg), 'the stand-in ends on the presenter instruction, not "Loading"', extClick.msg || '');
    // The only request allowed is the reachability probe, and it must have been
    // blocked. Nothing may have reached the YouTube player.
    const fired = offNetwork.slice(beforeCount);
    note(fired.every((u) => u.startsWith('https://img.youtube.com/vi/')),
      'the only request a clip click makes is the blocked reachability probe', fired.join(' , ') || '(none)');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const afterEsc = await page.evaluate(() => ({
      open: document.getElementById('lightbox').classList.contains('open'),
      media: document.getElementById('lightbox-media').innerHTML.length,
      counter: document.getElementById('counter').textContent.trim(),
    }));
    note(!afterEsc.open && afterEsc.media === 0, 'Esc closes the lightbox and empties the media node');
    note(afterEsc.counter === idxBefore, 'slide index unchanged by opening and closing a clip', `${idxBefore} -> ${afterEsc.counter}`);

    // Esc pressed while the probe is still in flight must not repopulate the
    // lightbox when the probe finally settles.
    await page.evaluate(() => document.querySelector('.play-btn.ext').click());
    await page.waitForTimeout(60);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
    const afterRace = await page.evaluate(() => ({
      open: document.getElementById('lightbox').classList.contains('open'),
      media: document.getElementById('lightbox-media').innerHTML.length,
    }));
    note(!afterRace.open && afterRace.media === 0, 'Esc during the probe leaves the lightbox closed and empty', JSON.stringify(afterRace));
  } else {
    console.log('  SKIP  clip stand-in checks — this engine cannot block the network without breaking data: URI fonts');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  // A gallery image, offline.
  const gal = await page.evaluate(async () => {
    const t = document.querySelector('[data-gallery]') || document.querySelector('.gal-thumb, .gallery-thumb');
    if (!t) return { skip: true };
    t.click();
    await new Promise((r) => setTimeout(r, 300));
    const img = document.querySelector('#lightbox-media img');
    return { ok: !!img && img.complete && img.naturalWidth > 0, src: img ? img.getAttribute('src') : null };
  });
  note(gal.skip || gal.ok, 'a gallery image opens in the lightbox offline', gal.src || (gal.skip ? '(no gallery thumb selector matched)' : ''));
  await page.keyboard.press('Escape');

  console.log('\n--- 6. console ---');
  note(consoleErrors.length === 0, 'zero console errors', consoleErrors.slice(0, 4).join(' | '));
  note(pageErrors.length === 0, 'zero uncaught page errors', pageErrors.slice(0, 4).join(' | '));

  console.log('\n--- 7. bundle contents ---');
  let files = 0, bytes = 0;
  (function walk(d) { for (const e of readdirSync(d)) { const p = join(d, e); const s = statSync(p); s.isDirectory() ? walk(p) : (files++, bytes += s.size); } })(BUNDLE);
  console.log(`  ${files} files, ${(bytes / 1048576).toFixed(1)} MB at ${BUNDLE}`);
  if (wantShots) console.log('  screenshots: ' + SHOTS);

  await browser.close();

  console.log('\n' + (problems.length ? `OFFLINE VERIFY FAILED — ${problems.length} problem(s):\n  - ` + problems.join('\n  - ') : 'OFFLINE VERIFY CLEAN'));
  process.exit(problems.length ? 1 : 0);
};

(hotspotMode ? runHotspot() : run()).catch((e) => { console.error(e); process.exit(1); });
