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
const ctx = await browser.newContext({viewport:{width:1280,height:720}, extraHTTPHeaders:{Referer:'https://ai.drsfilms.com/starx-week-2/'}});
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
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight');
r.indexWhileOpen = await idx();
await page.keyboard.press('Escape'); await page.waitForTimeout(100);
r.openAfterEsc = await page.evaluate(()=>document.getElementById('lightbox').classList.contains('open'));
r.mediaAfterEsc = await page.evaluate(()=>document.getElementById('lightbox-media').innerHTML.length);
r.indexAfterEsc = await idx();
results.ext = r;

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

// --- local path with end: screen 13 (index 12), key 1 = up to the moment
await goto(12);
await page.keyboard.press('1');
r = {};
r.hasVideo = await page.waitForSelector('#lightbox-media video', {timeout:3000}).then(()=>true).catch(()=>false);
r.canPlayH264 = await page.evaluate(()=>{ const v=document.createElement('video'); return v.canPlayType('video/mp4; codecs="avc1.42E01E"'); });
await page.evaluate(()=>{ const v=document.querySelector('#lightbox-media video'); v.muted = true; return v.play().catch(e=>String(e)); });
// wait until it pauses on its own (end=19.45) — poll up to 30 s
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
results.errors = errors;
console.log(JSON.stringify(results, null, 1));
await browser.close(); if (server) server.close();
