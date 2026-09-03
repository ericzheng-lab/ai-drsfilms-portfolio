// DoD checker for /starx-week-2/ (Film_Teaching plan §I + the branch charter in LOOP-STATE.md).
// Static checks read the deck's own data out of public/starx-week-2/index.html; nothing is
// measured "by totals" — every clip, slide and file is checked one by one.
//   node tools/starx-week-2/dod-check.mjs            static + oembed
//   node tools/starx-week-2/browser-audit.mjs <public dir | https://base> [shots dir]
//   node tools/starx-week-2/lightbox-test.mjs <public dir | https://base>
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const DECK = path.join(ROOT, 'public', 'starx-week-2');
const html = fs.readFileSync(path.join(DECK, 'index.html'), 'utf8');
const results = []; const ok = (name, pass, detail='') => { results.push({name, pass, detail}); console.log((pass?'PASS':'FAIL')+'  '+name+(detail?'  · '+detail:'')); };

// --- deck data, evaluated in isolation (ICONS stubbed: the icon section is string-only but not needed)
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const from = script.indexOf('var SEGMENTS'); const to = script.indexOf('// ---------- main render ----------');
// the slice now runs to the render loop so GALLERIES comes with it; everything between is
// function declarations and data, with no top-level DOM access to trip over
const data = new Function('var ICONS = new Proxy({}, {get:()=>""}); ' + script.slice(from, to) + '; return {SEGMENTS, SEG_BG, CLIPS, SLIDES, GALLERIES};')();
const { SEGMENTS, CLIPS, SLIDES, GALLERIES } = data;

ok('SLIDES.length === 24', SLIDES.length === 24, String(SLIDES.length));
ok('SEGMENTS ends 5/20/28/40/50/60', JSON.stringify(SEGMENTS.map(s=>s.end)) === '[5,20,28,40,50,60]', SEGMENTS.map(s=>s.end).join('/'));
ok('six seg-* classes mapped to a tint in CSS', [0,1,2,3,4,5].every(n=>new RegExp('\\.slide\\.seg-'+n+'\\{--seg-tint:var\\(--seg'+n+'\\)\\}').test(html)) && /--seg5:#/.test(html));
ok('bonus is last, outside the hour', SLIDES[SLIDES.length-1].bonus === true && SLIDES[SLIDES.length-1].seg < 0 && SLIDES.slice(0,-1).every(s=>s.seg>=0 && s.seg<=5));
ok('every slide has mode watch|do|tell', SLIDES.every(s=>['watch','do','tell'].includes(s.mode)));
const modes = SLIDES.map(s=>s.mode);
ok('no two consecutive tell', !modes.some((m,i)=>m==='tell' && modes[i-1]==='tell'), modes.map(m=>m[0]).join(''));
ok('>= 11 do screens', modes.filter(m=>m==='do').length >= 11, String(modes.filter(m=>m==='do').length));
ok('a do screen within the first three', modes.slice(0,3).includes('do'));
ok('every slide has a note', SLIDES.every(s=>s.note && s.note.trim().length>0));
const watchBad = SLIDES.map((s,i)=>[i+1,s]).filter(([,s])=>s.mode==='watch' && !(/\?/.test(s.note) || /watch for/i.test(s.note))).map(([n])=>n);
ok('every watch note has "?" or "watch for"', watchBad.length===0, watchBad.join(','));
const doBad = SLIDES.map((s,i)=>[i+1,s]).filter(([,s])=>s.mode==='do' && s.note.split('\n').filter(l=>l.trim()).length < 3).map(([n])=>n);
ok('every do note has three lines', doBad.length===0, doBad.join(','));
const strings = []; SLIDES.forEach((s,i)=>{ ['headline','sub','prompt','callout','eyebrow'].forEach(k=>{ if (s[k]) strings.push([i+1,k,s[k]]); }); });
const countWords = /\b(two|three|four|five|six)\b/i;
const selfCount = strings.filter(([n,k,v])=>['headline','sub','prompt'].includes(k) && countWords.test(v) && /(stops|pictures|faces|cards|rules|frames|screens)\b/i.test(v));
ok('no lead/body string counts its own items', selfCount.length===0, selfCount.map(x=>x[0]+':'+x[2]).join(' | '));
const onScreen = strings.map(x=>x[2]).join(' ') + Object.values(CLIPS).map(c=>c.title+' '+c.range).join(' ');
ok('no emoji / CJK / circled numerals in on-screen strings', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}一-鿿①-⓿❶-➓]/u.test(onScreen));
ok('Oz copy never says "the first colour film"', !/first colou?r film/i.test(html));

// --- pictures (Film_Teaching deck convention, Eric 2026-09-03: no screen bare, every
// picture clickable, and the count never goes down week over week). Counted screen by
// screen off the slide data, mirroring the fields the render actually turns into a
// picture; tools/starx-week-2/lightbox-test.mjs then opens every one in a real browser.
const picsOf = s => {
  const out = []; const push = o => { if (o && o.src) out.push(o); };
  push(s.reveal); push(s.photo); push(s.supportImg); push(s.midfall);
  (s.frames||[]).forEach(push); (s.pair||[]).forEach(push); (s.pics||[]).forEach(push);
  if (s.gallery) (GALLERIES[s.gallery].items||[]).forEach(push);
  return out;
};
const perScreen = SLIDES.map(picsOf);
const totalPics = perScreen.reduce((a,p)=>a+p.length, 0);
const bare = perScreen.map((p,i)=>p.length?null:i+1).filter(Boolean);
ok('no screen without a teaching picture', bare.length===0, bare.length?('bare: '+bare.join(',')):perScreen.map(p=>p.length).join('/'));
ok('at least 60 teaching pictures in the deck', totalPics >= 60, String(totalPics));
const noAlt = [].concat(...perScreen).filter(p=>!p.alt || p.alt.length < 8).map(p=>p.src);
ok('every picture has a real alt description', noAlt.length===0, noAlt.slice(0,4).join(' '));
const noCap = [].concat(...perScreen).filter(p=>!(p.cap||p.note)).map(p=>p.src);
ok('every picture has a caption Eric can read aloud', noCap.length===0, noCap.slice(0,4).join(' '));
const noCredit = [].concat(...perScreen).filter(p=>!p.credit || p.credit.length < 6).map(p=>p.src);
ok('every picture records its source and rights', noCredit.length===0, noCredit.slice(0,4).join(' '));
ok('four galleries carried over from Week 1', Object.keys(GALLERIES).length >= 4 && Object.values(GALLERIES).every(g=>g.lead && g.items.length>=4 && g.items.every(i=>i.t && i.y)), Object.keys(GALLERIES).map(k=>k+':'+GALLERIES[k].items.length).join(' '));

// --- click to enlarge: the wiring, asserted in the source so it cannot be deleted as unused
ok('every picture renders as a focusable button carrying data-pic',
   /function photoFrame\([\s\S]{0,700}?<button type="button" class="torn-frame/.test(script) &&
   /class="gal-thumb'\+\(it\.video\?' has-video':''\)\+'" data-pic=/.test(script));
ok('the lightbox has a picture path (openPicture + stepPicture)', /function openPicture\(/.test(script) && /function stepPicture\(/.test(script));
ok('a click on any data-pic opens the lightbox', /var picBtn = e\.target\.closest\('\[data-pic\]'\)/.test(script) && /openPicture\(parseInt\(pa\[0\],10\), parseInt\(pa\[1\],10\)\)/.test(script));
ok('arrows step inside the screen\'s picture set and never reach the deck',
   /picState && e\.key === 'ArrowRight'\)\{ stepPicture\(1\)/.test(script) && /picState && e\.key === 'ArrowLeft'\)\{ stepPicture\(-1\)/.test(script));
ok('Esc and the backdrop clear the picture state', /picState = null;/.test(script.slice(script.indexOf('function closeLightbox'))));
ok('Enter on a focused picture is left to the browser, not doubled onto a clip', /focused\.closest\('\[data-pic\]'\)\) return;/.test(script));
ok('a picture opens to at least 80% of the viewport height', /#lightbox-media img,#lightbox-media \.lb-imgwrap video\{display:block;position:static;height:80vh;/.test(html));
ok('the Week 1 gallery-video hotfix is still in that rule', /\.lb-imgwrap video\{display:block;position:static;/.test(html));
ok('decoration is never a picture: the drawn cast and doodles carry no data-pic',
   !/drawn-placeholder[^']*data-pic/.test(script) && !/dz sticker[^']*data-pic/.test(script) && !/class="mascot"[^']*data-pic/.test(script));

// --- clips
ok('every CLIPS entry declares start and end', Object.values(CLIPS).every(c=>typeof c.start==='number' && typeof c.end==='number' && c.end>c.start));
ok('every CLIPS entry has a credit', Object.values(CLIPS).every(c=>c.credit && c.credit.length>5));
const sum = p => Object.values(CLIPS).filter(c=>c.pri===p).reduce((a,c)=>a+(c.end-c.start),0);
ok('P1 video <= 9:00 from out-in', sum('P1') <= 540, (sum('P1')/60).toFixed(2)+' min');
ok('P1+P2 <= 12:00 from out-in', sum('P1')+sum('P2') <= 720, ((sum('P1')+sum('P2'))/60).toFixed(2)+' min');
const local = Object.values(CLIPS).filter(c=>c.type==='local');
ok('every local src exists', local.every(c=>fs.existsSync(path.join(DECK,c.src))));
ok('every clip frame exists', Object.values(CLIPS).every(c=>fs.existsSync(path.join(DECK,c.frame))));
const refs = [...new Set([...html.matchAll(/media\/[A-Za-z0-9_\-\/\.]+/g)].map(m=>m[0]))];
const missing = refs.filter(p=>!fs.existsSync(path.join(DECK,p)));
ok('every media/ reference in the deck exists ('+refs.length+')', missing.length===0, missing.join(','));
ok('zero img.youtube.com references', !/img\.youtube\.com/.test(html));
ok('fonts self-hosted (no googleapis/gstatic)', !/fonts\.googleapis|fonts\.gstatic/.test(html) && /media\/fonts\/.*\.woff2/.test(html));
ok('screen 13 end lands before the wall touches the ground', CLIPS.keatonUpTo.end + 0.3 <= 19.69, 'end='+CLIPS.keatonUpTo.end+' s; ground at 19.69 s (frame-accurate, see files/week-02-clips.md); 0.3 s margin for timeupdate jitter');

// --- files and route
const walk = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files = walk(DECK); const big = files.filter(f=>fs.statSync(f).size > 25*1024*1024);
ok('every media file <= 25 MB', big.length===0, big.map(f=>path.basename(f)).join(','));
const total = files.reduce((a,f)=>a+fs.statSync(f).size,0);
ok('route <= 100 MB', total <= 100*1024*1024, (total/1024/1024).toFixed(1)+' MB');
const headers = fs.readFileSync(path.join(ROOT,'public','_headers'),'utf8'); const redirects = fs.readFileSync(path.join(ROOT,'public','_redirects'),'utf8');
ok('_headers has the /starx-week-2/* noindex + no-store block', /\/starx-week-2\/\*\n\s+X-Robots-Tag: noindex, nofollow, noarchive, nosnippet\n\s+Cache-Control: private, no-store/.test(headers));
ok('_redirects has /starx-week-2 -> /starx-week-2/ 301', /^\/starx-week-2 \/starx-week-2\/ 301$/m.test(redirects));
let srcDiff = ''; try { srcDiff = execSync('git diff origin/main --stat -- src', {cwd:ROOT}).toString().trim(); } catch(e){ srcDiff = 'git failed: '+e.message; }
ok('git diff origin/main --stat -- src is empty', srcDiff === '', srcDiff.slice(0,80));
ok('nothing under public/starx-week-1 changed', (()=>{ try { return execSync('git diff origin/main --stat -- public/starx-week-1', {cwd:ROOT}).toString().trim()===''; } catch(e){ return false; } })());

// --- oembed for every ext id (network)
const ext = [...new Set(Object.values(CLIPS).filter(c=>c.type==='ext').map(c=>c.id))];
for (const id of ext){
  let code = 0, author = '';
  try { const r = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v='+id+'&format=json'); code = r.status; if (r.ok) author = (await r.json()).author_name; } catch(e){ code = -1; }
  ok('oembed 200 for '+id, code===200, author);
}
const fails = results.filter(r=>!r.pass).length;
console.log('\n'+(fails?fails+' FAIL':'ALL PASS')+' · '+results.length+' checks');
process.exit(fails?1:0);
