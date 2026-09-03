// Week 2 deck audit: serves public/, walks every screen at three viewports.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
function loadPlaywright(){ try { return require('playwright'); } catch (e) { return createRequire('/Users/yuezheng/.nvm/versions/node/v22.22.2/lib/node_modules/playwright/package.json')('playwright'); } }
const { chromium } = loadPlaywright();
const ROOT = process.argv[2];            // public/ dir  OR  https://… base URL
const SHOTS = process.argv[3] || '';     // dir for screenshots (optional)
const VIEWPORTS = process.env.VIEWPORTS ? process.env.VIEWPORTS.split(',').map(s=>s.split('x').map(Number)) : [[1280,720],[1366,768],[1920,1080]];
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.gif':'image/gif','.webp':'image/webp'};
let base = ROOT, server = null;
if (!/^https?:/.test(ROOT)){
  server = http.createServer((req,res)=>{
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); res.end('nf'); return; }
    const st = fs.statSync(f); const ext = path.extname(f);
    const range = req.headers.range;
    if (range){ const [a,b] = range.replace('bytes=','').split('-'); const s = +a, e = b? +b : st.size-1;
      res.writeHead(206, {'Content-Type':MIME[ext]||'application/octet-stream','Content-Range':`bytes ${s}-${e}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':e-s+1});
      fs.createReadStream(f,{start:s,end:e}).pipe(res); return; }
    res.writeHead(200, {'Content-Type':MIME[ext]||'application/octet-stream','Content-Length':st.size,'Accept-Ranges':'bytes'});
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r=>server.listen(0, r));
  base = 'http://127.0.0.1:'+server.address().port;
}
const URL = base + '/starx-week-2/';
const browser = await chromium.launch();
const report = {url:URL, viewports:{}, console:[], pageErrors:[], requestFailures:[]};
const NEUTRAL = '*{animation:none!important;transition:none!important}';
for (const [w,h] of VIEWPORTS){
  const ctx = await browser.newContext({viewport:{width:w,height:h}, extraHTTPHeaders:{Referer:'https://ai.drsfilms.com/starx-week-2/'}});
  const page = await ctx.newPage();
  page.on('console', m=>{ if (m.type()==='error'||m.type()==='warning') report.console.push({vp:w+'x'+h, type:m.type(), text:m.text().slice(0,200)}); });
  page.on('pageerror', e=>report.pageErrors.push({vp:w+'x'+h, text:String(e).slice(0,200)}));
  page.on('requestfailed', r=>report.requestFailures.push({vp:w+'x'+h, url:r.url().slice(0,160), err:r.failure()&&r.failure().errorText}));
  const resp = await page.goto(URL, {waitUntil:'load'});
  await page.addStyleTag({content:NEUTRAL});
  await page.evaluate(()=>document.fonts.ready);
  const vp = {status: resp.status(), slides:[], total: await page.evaluate(()=>document.querySelectorAll('.slide').length)};
  const measure = async (label)=>{
    return await page.evaluate((label)=>{
      const act = document.querySelector('.slide.active');
      const W = innerWidth, H = innerHeight;
      const vis = el=>{ const cs = getComputedStyle(el); if (cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) return false; let p = el; while (p && p !== act){ const c = getComputedStyle(p); if (c.display==='none'||c.visibility==='hidden') return false; p = p.parentElement; } return true; };
      const over = [];
      // the gallery strip and the picture strip hang off the section as siblings of
      // .slide-inner, so they have to be in this sweep or a row that spills off the
      // bottom of the screen would never be seen by the overflow check
      act.querySelectorAll('.slide-inner, .slide-inner *, .gallery-block, .gallery-block *, .picstrip, .picstrip *').forEach(el=>{
        if (!vis(el)) return; const r = el.getBoundingClientRect(); if (r.width===0&&r.height===0) return;
        const o = Math.max(0, r.bottom-H, r.right-W, -r.top, -r.left);
        if (o > 1) over.push({tag:el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ').slice(0,2).join('.'):''), by:Math.round(o), h:Math.round(r.height)});
      });
      const fs = sel=>[...act.querySelectorAll(sel)].filter(vis).map(el=>parseFloat(getComputedStyle(el).fontSize));
      const min = a=>a.length?Math.min(...a):null;
      const imgs = [...act.querySelectorAll('.support-img img, .frame-card img, .frame-pair img, .reveal-pair img')].filter(vis).map(el=>Math.round(el.getBoundingClientRect().height/H*1000)/10);
      const sc = act.scrollHeight - act.clientHeight;
      const bg = getComputedStyle(act).backgroundImage + '|' + getComputedStyle(act).backgroundColor;
      const tint = getComputedStyle(act).getPropertyValue('--seg-tint').trim();
      const txt = act.innerText;
      const bad = {emoji: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(txt), cjk: /[一-鿿]/.test(txt), circled: /[①-⓿❶-➓]/.test(txt)};
      return {label, seg:[...act.classList].find(c=>/^seg-/.test(c)), tint, mode:act.dataset.mode, overflow:over.slice(0,6), overflowCount:over.length, scrollOver:sc,
        headline:min(fs('.headline, .title-slide h1')), body:min(fs('.subline, .prompt-line, .fact-bullet, .callout')),
        labels:min(fs('.fr-text, .fc-label, .ac-label, .gs-label, .tl-label, .tl-answer, .rp-cap, .beat-item, .a-t, .a-d, .dual-label, .fp-cap, .tagline')),
        supportVh: imgs, bad};
    }, label);
  };
  for (let i=0;i<vp.total;i++){
    if (i>0) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(60);
    const m = await measure('s'+(i+1));
    vp.slides.push(m);
    if (SHOTS && w===1280){ await page.screenshot({path:path.join(SHOTS, `s${String(i+1).padStart(2,'0')}.png`)}); }
    // revealed state, if the screen has one
    const hasReveal = await page.evaluate(()=>!!document.querySelector('.slide.active [data-reveal], .slide.active [data-beatnext]'));
    if (hasReveal){
      for (let k=0;k<3;k++) await page.keyboard.press('r');
      await page.waitForTimeout(60);
      const m2 = await measure('s'+(i+1)+'-revealed'); vp.slides.push(m2);
      if (SHOTS && w===1280) await page.screenshot({path:path.join(SHOTS, `s${String(i+1).padStart(2,'0')}r.png`)});
      // reset: reveal state is sticky by design; reload later viewports fresh anyway
    }
  }
  report.viewports[w+'x'+h] = vp;
  await ctx.close();
}
await browser.close(); if (server) server.close();
fs.writeFileSync(path.join(SHOTS||'.', 'audit.json'), JSON.stringify(report,null,1));
// summary
for (const [k,vp] of Object.entries(report.viewports)){
  const ov = vp.slides.filter(s=>s.overflowCount>0);
  console.log(k, 'status', vp.status, 'slides', vp.total, 'overflowing:', ov.map(s=>s.label+'('+(s.overflow[0]?s.overflow[0].tag+'+'+s.overflow[0].by:'scroll'+s.scrollOver)+')').join(' ')||'none');
  const hl = Math.min(...vp.slides.map(s=>s.headline).filter(x=>x!=null)); const bd = Math.min(...vp.slides.map(s=>s.body).filter(x=>x!=null)); const lb = Math.min(...vp.slides.map(s=>s.labels).filter(x=>x!=null));
  console.log('  min headline', hl, 'min body', bd, 'min label', lb, 'support min vh', Math.min(...vp.slides.flatMap(s=>s.supportVh)));
  console.log('  tints', [...new Set(vp.slides.map(s=>s.seg+'='+s.tint))].join(' '));
  console.log('  bad text', vp.slides.filter(s=>s.bad.emoji||s.bad.cjk||s.bad.circled).map(s=>s.label).join(' ')||'none');
}
console.log('console', report.console.length, JSON.stringify(report.console.slice(0,5)));
console.log('pageErrors', JSON.stringify(report.pageErrors.slice(0,5)), 'requestFailures', JSON.stringify(report.requestFailures.slice(0,5)));
