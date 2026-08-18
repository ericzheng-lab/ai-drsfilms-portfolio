# Giant Spoon — house-standard loops

Date: 2026-08-18. Route: `/giant-spoon/`. Role: Senior Producer (NYC hybrid).  
Stills: `ericzheng-lab/drs-source` `INDEX.json`, `public: true` only, copied under `public/giant-spoon/stills/`.

A loop is 调研 (every shipped company page, not Wonder/Kalshi alone) → 自检 → 辩论 → 加固 harness → page fix → commit.

## Design checklist (from the full survey)

Use this in every self-check. Update when a later loop finds a missed pattern.

1. **First viewport is a still.** Compact masthead only (Cloudflare ~topbar, Wonder `site-nav` 72px). No type-only hero. No `.hero { min-height: 78vh }` empty box (live Giant Spoon fail; Luma also ships 78vh). Automatic FAIL if the first screen is blank or résumé text.
2. **Image density.** High bar: Cloudflare 21 stills, Wonder 12, Braze/Nen/Code-Theory 9–10, Kalshi 5 posters + showreel. FAIL: ASCAP 0, Giant Spoon #18 = 1 remote thumb, BPI/Compass/Mercury/Perplexity/WPP = 3 hotlinked thumbs.
3. **Work-stack of finished films first.** Wonder `film-grid` / Kalshi `work-grid` of 16:9 posters, then feature/showreel, *then* the system. Never Kalshi-clone “delivery model” before any still.
4. **How stills are sourced.** In-repo files or embedded data URIs of real frames. Steal Wonder/Kalshi/Cloudflare/Braze embed-in-page. Never invent/generate frames. Never hotlink `raw.githubusercontent` / private `drs-source`. Prefer relative `stills/*.jpg`. Do not lean on `vumbnail.com` / random YouTube thumbs unless that exact film already uses that pattern on a classic page — and even then, this rebuild copies catalog files.
5. **Type / craft.** Giant Spoon VI (Sora, `#0033A0`, `#000`, `#FFF`, button radius 0). Steal Wonder/Kalshi section rail + 3-col grid + poster density. Never copy ElevenLabs/Luma empty-hero / thin stack as the open.
6. **Claims.** Sundance = nominee; Berlinale ≠ won; Dungeon **&** Fighter; amounts USD; no P007. Do not invent agency-client work. Production-company EP ≠ in-house Giant Spoon producer.

Wonder and Kalshi remain the high bar for grid, density, and “films first” IA. **Neither opens with a still.** Cloudflare is the closest “work soon” page (80 words then 21 posters). Giant Spoon must beat the high bar on first viewport (Eric: still, not blank) while stealing Wonder/Kalshi work-stack craft.

---

## Full inventory — every `public/*/index.html` company page

Skipped non-pages: `_headers`, `_redirects`, `generated`, `media`, `uploads`, `prompt-builder`, `prompt-builder-next`, `cursor-*`.

| Page | First viewport | Imgs / video / iframe | Embed | Work-stack vs resume | Steal | Never copy |
|---|---|---|---|---|---|---|
| **wonder** | Type-only. 72px `site-nav`, then 88px-padded header, **597 words before first img**. Proof tiles, no still. | 12 / 0 / 0 | 12 data-URI | High. `film-grid` 3-col `media-card` stills (One Click Mute, HOME, DoomBrush, …) *after* evidence/sell/workflow. Films first inside that section. | 3-col media-cards, 12-still density, films-before-tools, in-repo frames, workflow plate. | **Do not copy the type-only open.** 88px section padding before any still. |
| **kalshi** | Type-only dark hero (padding 54/58, **407 words** before first poster). | 5 / 0 / 2 | 5 data-URI | High. `work-grid` 3-col posters (COACH, Brief History, Naraka) + 21:9 showreel, then workflow image. | Poster grid, showreel span, VI-tight type, embedded stills. | **Do not copy text-first hero.** System sections before showcase. |
| alibaba-startup | Slide deck, type-first. | 5 / 0 / 0 | data-URI | Deck, not a role profile. | — | Not a company Profile pattern. Password-free deck ≠ `/company/` film stack. |
| amazon | Type-only mast + thesis. 418 words before stills. | 5 / 0 / 0 | 2 data + 3 YouTube | Mixed: systems essay then finished work. | Film titles. | Text-first “application thesis” open; YouTube thumbs as the only posters. |
| amazon-creator | Type-only Google-family hero. 409 words. | 10 / 0 / 0 | 5 data + 5 http | Work exists later (traditional / film / AI). | Later poster density. | Type-only “I run branded production” open. |
| amgen | Kalshi clone, type-only hero. 416 words. | 5 / 0 / 2 | 5 data-URI | Same Kalshi work-grid, later. | Grid if needed. | Clone hero + “systems” before stills. |
| ascap | **Type-only. 0 images.** 649 words. | 0 / 0 / 0 | none | Resume / rights essay. | — | **Zero stills. Harness must REJECT this class.** |
| autodesk-flow-studio | Type-only Kalshi-family hero. | 4 / 0 / 2 | 3 data + 1 YT | Partial film stack later. | — | Text hero; thin stack. |
| bpi | Short type hero, 3 remote thumbs later. | 3 / 0 / 0 | 3 http (`vumbnail`, FF CDN) | Thin proof strip. | — | **Hotlink-only 3-thumb template.** Same as compass/mercury/perplexity/wpp. |
| braze | Type hero then stats; stills in showcase (265 words). | 9 / 0 / 2 | 9 data-URI | Strong Kalshi-family grid + tools. | Density, embedded posters. | Text-first open. |
| cloudflare | Compact topbar + short “Selected work” hero (**80 words**), then 21 posters. Closest to work-immediate. | 21 / 1 / 2 | 21 data-URI | Featured + AI + traditional + motion. Highest density. | Compact mast, work immediately after a short line, 21-still density. | Do not inflate a 78vh void in front of this. |
| code-theory | Type-only Kalshi-family. 419 words. | 10 / 1 / 2 | 10 data-URI | Strong later stack. | Density. | Text hero. |
| compass | Same thin template as BPI. | 3 / 0 / 0 | 3 http vumbnail | Resume + 3 thumbs. | — | Thin hotlink template. |
| elevenlabs | **Old.** Topbar + type hero (204 words), then work-stack. | 7 / 0 / 1 | 4 data + 3 YT | Films first *after* type hero. Useful titles only. | Film set / titles. | Empty-hero / thin-stack as the standard. Mixed YouTube thumbs. |
| **giant-spoon (#18 live fail)** | **Blank spacer.** `.hero { min-height: 78vh }` type-only. **368 words, 1 image** (`vumbnail.com`). | 1 / 0 / 1 | 1 http | Resume + delivery model *before* the one thumb. | Role/claims only. | **Everything about the open.** 78vh void, 1 remote thumb, text wall. |
| google | Compact “Selected work.” then posters (91 words). | 10 / 0 / 0 | 4 data + 6 http | Work-led IA, mixed YT/Vimeo thumbs. | Short “selected work” line. | Remote thumbs as the library. |
| hims | Compact nav + type hero (139 words); 4 `drsfilms.com` stills later. | 4 / 0 / 0 | 4 http | Work later. CSS has a large min-height on a panel. | Honest production-company framing. | Type-first; remote site thumbs. |
| lionsgate | Type-only Kalshi-family. | 3 / 0 / 2 | 3 data-URI | Thin AI stack later. | — | Text hero + 3 stills. |
| luma | **Old.** `min-height: 78vh` hero + type (172 words). | 7 / 0 / 1 | 4 data + 3 YT | Same stack as ElevenLabs. | Titles only. | **78vh hero.** Do not copy. |
| mercury | Thin BPI template. | 3 / 0 / 0 | 3 http | Resume. | — | Thin hotlink template. |
| meta | Type-only process hero. 375 words. | 4 / 0 / 0 | 2 data + 2 YT | Process before work. | — | Essay open. |
| meta-voice | Type-only. 568 words. | 4 / 0 / 0 | 2 data + 2 YT | Voice essay. | — | Text wall. |
| nen | Kalshi-family, type-only. 411 words. | 10 / 1 / 2 | 10 data-URI | Strong later density. | Grid density. | Text hero. |
| palo-alto-networks | Kalshi clone, type-only. | 5 / 0 / 2 | 5 data-URI | Later grid. | — | Clone hero. |
| perplexity | Thin BPI template. | 3 / 0 / 0 | 3 http | Resume. | — | Thin hotlink template. |
| underdog | Kalshi clone, type-only. | 5 / 0 / 2 | 5 data-URI | Later grid. | — | Clone hero. |
| wpp-production | Thin BPI template. | 3 / 0 / 0 | 3 http | Resume. | — | Thin hotlink template. |
| TTL-BP | Password gate / 融资 deck. 1 image. | 1 / 0 / 0 | 1 data-URI | Not a role Profile. | — | Not a company page pattern. |

**High bar among the set:** Wonder (grid + 12 stills + films-first section), Kalshi (poster grid + showreel), Cloudflare (density + shortest path to stills), Braze/Nen/Code-Theory (9–10 embedded posters).  
**Old / thin:** ElevenLabs, Luma (78vh), ASCAP (zero stills), BPI-family (3 vumbnails), Giant Spoon #18 (78vh + 1 thumb).

---

## Loop 1 — 2026-08-18

### 1) 调研案例

Opened all 28 company `index.html` files listed above (plus this branch’s `public/giant-spoon`). Extracted first viewport, img/video/iframe counts, embed method, section IA, and steal/never-copy. Checklist written from that full set, not from Wonder/Kalshi alone.

### 2) 自检

Against the checklist, **live `/giant-spoon/` (#18) FAILs:**

- First viewport is not a still — **automatic FAIL**. `.hero { min-height: 78vh }` empty type block.
- Image density FAIL: 1 remote `vumbnail.com` thumb.
- Work-stack FAIL: delivery-model / résumé before the one still.
- Stills not in-repo catalog files.

Harness **before this loop:** R2 could ACCEPT a text-only Profile (ASCAP class) and the live Giant Spoon HTML (1 remote img + 78vh). `pass-minimal-three` was text-only and ACCEPTed.

### 3) 辩论

A rebuild that only “adds a few `<img>` tags” to #18 would still look like a Kalshi-clone résumé with a void on top. Eric already called that 太差.

**Remaining hole after a naïve “has `<img>`” gate:** the live Giant Spoon page *already has one `<img>`* (Vimeo thumb). A work-image rule alone would still **ACCEPT #18**. ASCAP (0 imgs) would fail; GS #18 would not. Loops 1–4 must keep finding holes — this is hole #1’s sibling: **empty-hero / first-viewport-still is not encoded yet.** Also: hotlinked thumbs, no local files, R3 not independently re-checking viewport, Kalshi-clone text-first pages would still pass.

If I cannot name that, I am not looking. I named it. Loop 2 must REJECT 78vh / blank first viewport even when one later thumb exists.

### 4) 加固 harness

- New P0 `r2-profile-work-images` on R2 and R3.
- Local Profile HTML and live fetch body must contain a real `<img src>` (not empty / placeholder / spacer / 1x1 / decorative / tiny GIF).
- Text-only pages REJECT. Local HTML without stills REJECT. No waiver.
- Fixture `fail-text-only-profile` + `--self-test` `test-text-only-profile-rejected`.
- `pass-minimal-three` / `stale-input` now include a real `work-still.png` so ACCEPT packages are not text-only.
- Existing URL rules unchanged (`https://ai.drsfilms.com/{company}/` only).

**Not yet (named hole for loop 2):** 78vh empty hero with a later thumb still ACCEPTs.

### Page change

Rebuilt `public/giant-spoon/index.html` (not a patch of #18).

**First viewport (screenshot-level):** 52px black masthead (`Eric Zheng · Giant Spoon` / `Senior Producer · NYC hybrid`). Immediately under it, a full-width **One Click Mute** still (`stills/one-click-mute-key-frame-01.jpg`) filling `min(78vh, 16:9 of viewport)` — the *image* occupies the first screen, not an empty hero box. Caption + Play sit on the still. No `min-height: 78vh` on a text header.

Then 3-col film-grid (Wonder/Kalshi), feature row, *then* delivery model / team / Prompt Builder.

### `drs-source` asset ids picked (all `public: true`)

| id | why |
|---|---|
| `one-click-mute-key-frame-01` | Wonder/Cloudflare lead film; first-viewport still. |
| `home-smarthome-manga-cut-01` | Wonder film-grid #2. |
| `sys-mere-key-frame-01` | Classic finished-fashion film in the same stack. |
| `doombrush-key-frame-01` | Wonder film-grid. |
| `monet-cyberpunk-key-frame-01` | Environmental short in the same stack. |
| `my-new-haircut-key-frame-01` | Extra finished-short density (public catalog). |
| `brief-history-of-a-family-still-01` | Kalshi feature poster equivalent, official still. |
| `brief-history-of-a-family-still-02` | Second feature still for density. |
| `prompt-builder-ui-01` | Only public product UI; tools section (Wonder “tools second”). |

Never used: `ai-film-studio-ui-01`, `coda-ui-01`, `martini-ui-01`, `ttl-breakdown-ui-01` (`public: false`).

---
