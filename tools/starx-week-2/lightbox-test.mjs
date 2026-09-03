// Lightbox guarantees on both hosting paths + the Week 2 mechanisms, against a served copy of public/.
import { createRequire } from 'node:module';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire(import.meta.url);
function loadPlaywright(){ try { return require('playwright'); } catch (e) { return createRequire('/Users/yuezheng/.nvm/versions/node/v22.22.2/lib/node_modules/playwright/package.json')('playwright'); } }
const { chromium } = loadPlaywright();
const ROOT = process.argv[2];
const MIME = {'.html':'text/html','.mp4':'video/mp4','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
let base = ROOT, server = null;
if (!/^https?:/.test(ROOT)){
  server = http.createServer((req,res)=>{
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p); if (!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}
    const st = fs.statSync(f), ext = path.extname(f), range = req.headers.range;
    if (range){ const [a,b]=range.replace('bytes=','').split('-'); const s=+a, e=b?+b:st.size-1;
      res.writeHead(206,{'Content-Type':MIME[ext]||'application/octet-stream','Content-Range':`bytes ${s}-${e}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':e-s+1}); fs.createReadStream(f,{start:s,end:e}).pipe(res); return; }
    res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Content-Length':st.size,'Accept-Ranges':'bytes'}); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r=>server.listen(0,r)); base='http://127.0.0.1:'+server.address().port;
}
const URL = base+'/starx-week-2/';
const browser = await chromium.launch({channel:'chrome', args:['--autoplay-policy=no-user-gesture-required']});
// no forced Referer here: system Chrome answers a header-overridden iframe navigation with
// ERR_BLOCKED_BY_CLIENT, and every focus check would then run against an error page
const ctx = await browser.newContext({viewport:{width:1280,height:720}});
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e=>errors.push(String(e))); page.on('console', m=>{ if (m.type()==='error') errors.push(m.text()); });
await page.goto(URL, {waitUntil:'load'});
const idx = ()=>page.evaluate(()=>+document.querySelector('.slide.active').dataset.i);
const results = {};
const goto = async (n)=>{ await page.evaluate(()=>{}); for (let k=0;k<40;k++){ if (await idx()===n) return; await page.keyboard.press(await idx()<n?'ArrowRight':'ArrowLeft'); } };

// --- ext path: screen 6 (index 5), The Gold Rush
await goto(5);
await page.keyboard.press('Enter'); await page.waitForTimeout(300);
let r = {};
r.open = await page.evaluate(()=>document.getElementById('lightbox').classList.contains('open'));
r.src = await page.evaluate(()=>{ const f=document.querySelector('#lightbox-media iframe'); return f? f.getAttribute('src') : null; });
await page.waitForTimeout(1500);
r.frameUrl = (page.frames().find(f=>f !== page.mainFrame()) || {url:()=>null}).url();
r.frameIsPlayer = /^https:\/\/www\.youtube\.com\/embed\//.test(r.frameUrl || '');
if (!r.frameIsPlayer) errors.push('FAIL: the embed frame did not load the player: '+r.frameUrl);
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight');
r.indexWhileOpen = await idx();
await page.keyboard.press('Escape'); await page.waitForTimeout(100);
r.openAfterEsc = await page.evaluate(()=>document.getElementById('lightbox').classList.contains('open'));
r.mediaAfterEsc = await page.evaluate(()=>document.getElementById('lightbox-media').innerHTML.length);
r.indexAfterEsc = await idx();
results.ext = r;

// --- ext path with the player focused: a click inside the iframe, then Esc must still close
await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
const fr = await page.$('#lightbox-media iframe'); const fb = await fr.boundingBox();
await page.mouse.click(fb.x + fb.width*0.5, fb.y + fb.height*0.85); await page.waitForTimeout(300);
results.focusAfterClick = await page.evaluate(()=>document.activeElement && document.activeElement.tagName);
await page.keyboard.press('Escape'); await page.waitForTimeout(150);
results.escClosesWithPlayerFocus = !(await page.evaluate(()=>document.getElementById('lightbox').classList.contains('open')));
if (results.focusAfterClick !== 'BUTTON' || !results.escClosesWithPlayerFocus) results.errors = (results.errors||[]).concat(['FAIL: focus not handed back to the deck after a click in the player']);
// close button must be visible and clickable, and the backdrop must close too
await page.keyboard.press('Enter'); await page.waitForTimeout(400);
results.closeBtnVisible = await page.evaluate(()=>{ const b=document.getElementById('lightbox-close'); const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); return e===b || b.contains(e); });
await page.click('#lightbox-close'); await page.waitForTimeout(150);
results.closeBtnCloses = !(await page.evaluate(()=>document.getElementById('lightbox').classList.contains('open')));
await page.keyboard.press('Enter'); await page.waitForTimeout(400); await page.mouse.click(8,8); await page.waitForTimeout(150);
results.backdropCloses = !(await page.evaluate(()=>document.getElementById('lightbox').classList.contains('open')));
// --- muted pill: screen 9 (index 8) — key 2 → mute=1 on the embed
await goto(8);
await page.keyboard.press('2'); await page.waitForTimeout(200);
results.mutedPill = await page.evaluate(()=>{ const f=document.querySelector('#lightbox-media iframe'); return f? f.getAttribute('src') : null; });
await page.keyboard.press('Escape');
await page.keyboard.press('1'); await page.waitForTimeout(200);
results.musicPill = await page.evaluate(()=>{ const f=document.querySelector('#lightbox-media iframe'); return f? f.getAttribute('src') : null; });
await page.keyboard.press('Escape');

// --- charades: screen 11 (index 10) — keys toggle DONE
await goto(10);
await page.keyboard.press('3'); await page.keyboard.press('5'); await page.keyboard.press('5'); await page.waitForTimeout(50);
results.charades = await page.evaluate(()=>[...document.querySelectorAll('.slide.active .game-slot')].map(s=>s.classList.contains('opened')?1:0).join(''));

// --- local path with end (CLIPS.keatonUpTo.end): screen 13 (index 12), key 1 = up to the moment
await goto(12);
await page.keyboard.press('1');
r = {};
r.hasVideo = await page.waitForSelector('#lightbox-media video', {timeout:3000}).then(()=>true).catch(()=>false);
r.canPlayH264 = await page.evaluate(()=>{ const v=document.createElement('video'); return v.canPlayType('video/mp4; codecs="avc1.42E01E"'); });
await page.evaluate(()=>{ const v=document.querySelector('#lightbox-media video'); v.muted = true; return v.play().catch(e=>String(e)); });
// wait until it pauses on its own (end = CLIPS.keatonUpTo.end) — poll up to 30 s
const t0 = Date.now(); let paused=false, ct=null, dur=null;
while (Date.now()-t0 < 32000){
  const s = await page.evaluate(()=>{ const v=document.querySelector('#lightbox-media video'); return v? {p:v.paused, t:v.currentTime, d:v.duration, rs:v.readyState, ended:v.ended} : null; });
  if (!s) break; ct = s.t; dur = s.d; if (s.p && s.t > 1){ paused = true; break; }
  await page.waitForTimeout(200);
}
r.pausedBySelf = paused; r.pausedAt = ct; r.duration = dur;
await page.keyboard.press('ArrowRight'); r.indexWhileOpen = await idx();
await page.keyboard.press('Escape'); await page.waitForTimeout(100);
r.mediaAfterEsc = await page.evaluate(()=>document.getElementById('lightbox-media').innerHTML.length);
r.indexAfterEsc = await idx();
// key 2 = whole thing
await page.keyboard.press('2'); await page.waitForTimeout(200);
r.wholeSrc = await page.evaluate(()=>{ const v=document.querySelector('#lightbox-media video'); return v? v.getAttribute('src') : null; });
await page.keyboard.press('Escape');
results.local = r;

// --- beats: screen 14 (index 13) — R reveals one at a time
await goto(13);
const vis = ()=>page.evaluate(()=>[...document.querySelectorAll('.slide.active .beat-item')].filter(b=>b.style.display!=='none').length);
results.beats = [await vis()]; await page.keyboard.press('r'); results.beats.push(await vis()); await page.keyboard.press('r'); results.beats.push(await vis());

// --- Enter on a screen with no clip is inert
await goto(2); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
results.enterInert = !(await page.evaluate(()=>document.getElementById('lightbox').classList.contains('open')));
// --- every teaching picture, one by one. Not a sample: the number opened has to equal
// the number that exist, and the deck must be exactly where it was when each one closes.
const walk = {perScreen:[], exist:0, opened:0, failures:[]};
for (let i=0;i<await page.evaluate(()=>document.querySelectorAll('.slide').length);i++){
  await goto(i);
  const n = await page.evaluate(()=>document.querySelector('.slide.active').querySelectorAll('[data-pic]').length);
  walk.perScreen.push(n); walk.exist += n;
  for (let k=0;k<n;k++){
    const before = await idx();
    await page.evaluate(k=>document.querySelector('.slide.active').querySelectorAll('[data-pic]')[k].click(), k);
    await page.waitForTimeout(80);
    const m = await page.evaluate(()=>{
      const el = document.querySelector('#lightbox-media img, #lightbox-media .lb-imgwrap video');
      const cap = document.querySelector('#lightbox-media .lb-cap');
      if (!el) return {open:false};
      const r = el.getBoundingClientRect();
      return {open:document.getElementById('lightbox').classList.contains('open'),
              w:+(r.width/innerWidth*100).toFixed(1), h:+(r.height/innerHeight*100).toFixed(1),
              cap:!!cap && cap.innerText.trim().length>0,
              credit:!!document.querySelector('#lightbox-media .lb-credit')};
    });
    if (m.open) walk.opened++;
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft');
    const whileOpen = await idx();
    await page.keyboard.press('Escape'); await page.waitForTimeout(60);
    const after = await idx();
    const closed = await page.evaluate(()=>!document.getElementById('lightbox').classList.contains('open') && document.getElementById('lightbox-media').innerHTML.length===0);
    // "85% of the width or 80% of the height", the line Eric's 「太小了」 turned into a rule
    if (!m.open || !(m.w>=85 || m.h>=80) || !m.cap || !m.credit || before!==after || whileOpen!==before || !closed)
      walk.failures.push({screen:i+1, picture:k+1, ...m, before, whileOpen, after, closed});
  }
}
walk.screensWithNoPicture = walk.perScreen.map((n,i)=>n?null:i+1).filter(Boolean);
results.pictures = walk;
if (walk.exist !== walk.opened) errors.push('FAIL: '+walk.exist+' pictures exist, '+walk.opened+' opened');
if (walk.exist < 60) errors.push('FAIL: only '+walk.exist+' teaching pictures in the deck');
if (walk.screensWithNoPicture.length) errors.push('FAIL: screens with no picture: '+walk.screensWithNoPicture.join(','));
if (walk.failures.length) errors.push('FAIL: '+walk.failures.length+' pictures did not meet the enlarge guarantees');

// --- the Week 1 gallery-video hotfix. No gallery item in this deck is a video, so the rule
// that was patched that day is proved by putting one in the image stage and measuring it:
// under the old CSS the video kept position:absolute, .lb-imgwrap collapsed to 0 and the
// stage clipped to the caption strip.
await goto(2);
await page.evaluate(()=>document.querySelector('.slide.active [data-pic]').click());
await page.waitForTimeout(120);
await page.evaluate(()=>{ document.querySelector('#lightbox-media .lb-imgwrap').innerHTML =
  '<video src="media/keaton-steamboat-bill-wall.mp4" playsinline controls></video>'; });
await page.waitForTimeout(1200);
results.galleryVideo = await page.evaluate(()=>{
  const v = document.querySelector('#lightbox-media .lb-imgwrap video');
  const w = document.querySelector('#lightbox-media .lb-imgwrap');
  return {position:getComputedStyle(v).position, videoH:Math.round(v.getBoundingClientRect().height), wrapH:Math.round(w.getBoundingClientRect().height)};
});
if (results.galleryVideo.position !== 'static' || results.galleryVideo.wrapH < 200)
  errors.push('FAIL: a gallery video renders as a strip again — the round-5 hotfix is gone');
await page.keyboard.press('Escape');

results.errors = errors;
console.log(JSON.stringify(results, null, 1));
await browser.close(); if (server) server.close();
