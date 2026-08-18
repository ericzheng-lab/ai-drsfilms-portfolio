# Giant Spoon — house-standard loops

Date: 2026-08-18. Route: `/giant-spoon/`. Role: Senior Producer (NYC hybrid).  
Canon: `_CAREER` case book, not a Wonder/Kalshi HTML diff.  
Stills: `ericzheng-lab/drs-source` `INDEX.json`, `public: true` only, copied under `public/giant-spoon/stills/`.

A loop is 调研 (`_CAREER` B-layer + every shipped company page) → 自检 (对照 B 层「算对的标准」) → 辩论 → 加固 harness → page fix → commit.  
A loop that never cites `_CAREER` does not count.

---

## `_CAREER` required reading (before loop 1)

Local path on Eric’s machine (not in this VM; GitHub `VSCODE_CC` is a stub; `Hyperagent` MCP needs auth; `career-ops` does not contain these files). B-ids and 算对的标准 below are taken from the case book excerpts Eric named as acceptance tests, not as color commentary.

1. `job-hunt-copilot/career-eric-zheng.md` — A/B case book (情境 / 做错了 / 你当时怎么说 / 后来怎么改 / **算对的标准**).
2. `job-hunt-copilot/conversation-backup/skills/harness/assets.json` — work-sample SoT. Highest evidence = work samples. `A-FILM-*` / `A-SHOWREEL-TRAD` / `A-WORKFLOW-6STAGE` / `A-PROFILES-PATTERN`. Canonical covers for One Click Mute / DoomBrush must not be swapped.
3. `conversation-backup/memories/attached-memories.md` memory 6 — distill official Giant Spoon / Wpromote VI (URL + date + exact hex/font/radius) before design. No guessed skin. Structure: **hero → credentials → work samples → method → fit → contact**. Only the skin changes.
4. `conversation-backup/skills/career-application-loop.method.md` — Company-specific Profile Branch + Closeout. Giant Spoon Senior Producer is **traditional integrated production (P-led)**: campaign / budget / vendors / **showreel lead**; AI translated into schedule/cost language; **AI share ≤25%**.

### Profile-lane acceptance tests (算对的标准)

| ID | 算对的标准 | Named failure |
|---|---|---|
| **B-C4** | 背景不能纯白 | Empty white void / type-only paper |
| **B-C5** | 不要打补丁，整页重蒸公司官网 VI | Patch-on-old-shell |
| **B-C6** | 导出或首屏大块空白 = 未完成 | Giant Spoon #18 `78vh` empty hero; export whitespace |
| **B-WKS3** | AI 片固定顺序：One Click Mute → Manga Cut → DoomBrush，其余后置 | Swapped AI covers / wrong stack order |
| **B-WKS4** | 作品多、话少、没照片。两个片子撑不起一页 | Two-film / text-heavy page |
| **B-WKS5** | 传统 film/brand credits 必须页内可见，不能只剩 AI 片 | AI-only stack |
| **B-WKS6** | 拍摄岗不要三张 3D；主位真人片 | 3D/AI in the lead slot |
| **B-WKS7** | 分镜不折叠；Vimeo 内嵌同卡 | Storyboard folded; Vimeo only in a modal |
| **B-DEP1** | 未 live 不算完成 | Local HTML without live route |
| **B-EL1** | 不像官网 = 蒸馏失败，不是差一个按钮 | Homepage-as-profile / guessed skin |
| **B-P3** | 给人看之前自己核验（页上仍有空白/无图 = 没核过） | Shipped blank / no-still page |

Harness must REJECT: text-only, blank first viewport, no real stills, patch-on-old-shell, homepage-as-profile.

### assets.json / work-sample SoT used here

| Token | Use on Giant Spoon |
|---|---|
| `A-SHOWREEL-TRAD` | Traditional showreel lead. Vimeo `1174467043`, in-card (B-WKS7). |
| `A-FILM-*` Brief History | Live-action feature stills `brief-history-of-a-family-still-01/02`. Vimeo `1172739705` in-card. |
| `A-FILM-*` One Click Mute | Canonical cover `one-click-mute-key-frame-01`. YouTube `6C--JC5iFmQ`. AI stack #1 (B-WKS3). |
| `A-FILM-*` Manga Cut | Canonical cover `home-smarthome-manga-cut-01`. YouTube `7AGx2OsC6Yw`. AI stack #2. Do not swap with DoomBrush. |
| `A-FILM-*` DoomBrush | Canonical cover `doombrush-key-frame-01`. YouTube `YG5Si7HXRB0`. AI stack #3. |
| `A-WORKFLOW-6STAGE` | Method section after work samples (memory 6). |
| `A-PROFILES-PATTERN` | Family of existing `/company/` profiles — survey every shipped page; do not copy ElevenLabs/Luma/#18. |

No invented frames. No `public: false` product UIs.

### Memory 6 / method — Giant Spoon P-led

- Distill `https://giantspoon.com/` on **2026-08-18**: `#0033a0` / `#000000` / `#ffffff` / Sora / button `0px` / popup `10px`. Written in `vi.json`.
- B-C4 vs official white paper: official hex stays; first viewport must be a still so the open is not 纯白空白. Blue/black chrome from the distill, not a guessed dark theme.
- Structure: hero (still) → credentials → work samples (traditional lead, AI ≤25% and after) → method → fit → contact.
- Role stays Senior Producer. Showreel / campaign / budget / vendors lead. AI in schedule/cost language.

---

## Design checklist (B-layer + full `public/` survey)

Use this in every self-check. Update when a later loop finds a missed pattern.

1. **B-C6 / B-P3 / B-C4 — first viewport is a still.** Compact masthead only. No type-only hero. No `.hero { min-height: 78vh }` empty box. Automatic FAIL if the first screen is blank, résumé text, or empty white.
2. **B-WKS4 — image density.** Cloudflare 21, Wonder 12, Braze/Nen/Code-Theory 9–10, Kalshi 5 + showreel. FAIL: ASCAP 0, Giant Spoon #18 = 1 remote thumb, BPI-family = 3 hotlinked thumbs. Two films do not carry a page.
3. **B-WKS5 / B-WKS6 / method — traditional lead.** Showreel + live-action credits on the page. AI after, share ≤25%. Never three 3D posters in the lead. Memory 6: work samples before method.
4. **B-WKS3 — AI order** One Click Mute → Manga Cut → DoomBrush, rest after. Canonical covers, not swapped.
5. **B-WKS7 — Vimeo in-card**, storyboards not folded.
6. **B-C5 / B-EL1 — restew, do not patch.** Official VI. If it does not look like the distilled site, that is a distill failure, not a missing button. Homepage-as-profile REJECT.
7. **B-DEP1 — live route** `https://ai.drsfilms.com/giant-spoon/` only.
8. **Claims.** Sundance = nominee; Berlinale ≠ won; Dungeon **&** Fighter; amounts USD; no P007. Production-company EP ≠ in-house Giant Spoon producer.

Wonder and Kalshi remain the high bar for grid and density. **Neither opens with a still** (B-C6 fail if copied). Cloudflare is the closest “work soon” page (80 words). #18 / Luma / ASCAP / BPI-family are the never-copy set.

---

## Full inventory — every `public/*/index.html` company page

Skipped non-pages: `_headers`, `_redirects`, `generated`, `media`, `uploads`, `prompt-builder`, `prompt-builder-next`, `cursor-*`.

| Page | First viewport | Imgs / video / iframe | Embed | Work-stack vs resume | Steal | Never copy | B-layer |
|---|---|---|---|---|---|---|---|
| **wonder** | Type-only. 72px `site-nav`, then 88px-padded header, **597 words before first img**. | 12 / 0 / 0 | 12 data-URI | High. `film-grid` 3-col stills *after* evidence/sell/workflow. | 3-col media-cards, 12-still density, films-before-tools. | **Type-only open.** | B-C6 / B-P3 fail on open; B-WKS4 density later. AI order in grid is usable. |
| **kalshi** | Type-only dark hero (**407 words** before first poster). | 5 / 0 / 2 | 5 data-URI | `work-grid` + 21:9 showreel, then workflow. | Poster grid, showreel span, VI-tight type. | **Text-first hero.** | B-C6 open fail; A-SHOWREEL-TRAD idea is right, placement is after a text wall. |
| alibaba-startup | Slide deck, type-first. | 5 / 0 / 0 | data-URI | Deck, not a role profile. | — | Not a company Profile. | Homepage/deck-as-profile (B-EL1). |
| amazon | Type-only mast + thesis. 418 words. | 5 / 0 / 0 | 2 data + 3 YouTube | Systems essay then work. | Film titles. | Text-first thesis. | B-C6 / B-WKS4 thin. |
| amazon-creator | Type-only. 409 words. | 10 / 0 / 0 | 5 data + 5 http | Work later. | Later density. | Type-only open. | B-C6. |
| amgen | Kalshi clone, type-only. 416 words. | 5 / 0 / 2 | 5 data-URI | Later grid. | Grid if needed. | Clone hero. | B-C5 patch-family / B-C6. |
| ascap | **Type-only. 0 images.** 649 words. | 0 / 0 / 0 | none | Resume. | — | **Zero stills.** | **B-C6 / B-P3 / B-WKS4.** Harness REJECT class. |
| autodesk-flow-studio | Type-only Kalshi-family. | 4 / 0 / 2 | 3 data + 1 YT | Thin later. | — | Text hero. | B-C6; two-plus films barely (B-WKS4). |
| bpi | Short type hero, 3 remote thumbs. | 3 / 0 / 0 | 3 http | Thin proof strip. | — | Hotlink 3-thumb template. | B-WKS4. |
| braze | Type hero then stats; stills later (265 words). | 9 / 0 / 2 | 9 data-URI | Strong later grid. | Density. | Text-first open. | B-C6 open; density OK. |
| cloudflare | Compact topbar + short “Selected work” (**80 words**), then 21 posters. | 21 / 1 / 2 | 21 data-URI | Highest density. | Compact mast, work immediately, 21 stills. | Do not put a 78vh void in front. | Closest B-WKS4; still fails “first viewport is a still.” |
| code-theory | Type-only Kalshi-family. 419 words. | 10 / 1 / 2 | 10 data-URI | Strong later. | Density. | Text hero. | B-C6. |
| compass | BPI thin template. | 3 / 0 / 0 | 3 http | Resume + 3 thumbs. | — | Thin hotlink. | B-WKS4. |
| elevenlabs | Topbar + type hero (204 words), then work. | 7 / 0 / 1 | 4 data + 3 YT | Films after type. | Titles only. | Empty-hero / thin-stack as the standard. | B-C6; not the VI distill. |
| **giant-spoon (#18 live fail)** | **Blank spacer.** `.hero { min-height: 78vh }`. **368 words, 1 image** (`vumbnail.com`). | 1 / 0 / 1 | 1 http | Resume + delivery model before the one thumb. | Role/claims only. | **The open, the patch, the one thumb.** | **B-C6, B-C5, B-C4, B-WKS4, B-WKS5, B-P3, B-EL1.** |
| google | Compact “Selected work.” then posters (91 words). | 10 / 0 / 0 | 4 data + 6 http | Work-led IA. | Short selected-work line. | Remote thumbs as the library. | Near B-WKS4; open still type. |
| hims | Compact nav + type hero (139 words). | 4 / 0 / 0 | 4 http | Work later. | Honest production-company framing. | Type-first. | B-C6; borderline B-WKS4. |
| lionsgate | Type-only Kalshi-family. | 3 / 0 / 2 | 3 data-URI | Thin AI stack. | — | Text hero + 3 stills. | B-C6 / B-WKS4 / B-WKS5 risk. |
| luma | `min-height: 78vh` hero + type (172 words). | 7 / 0 / 1 | 4 data + 3 YT | Same stack as ElevenLabs. | Titles only. | **78vh hero.** | B-C6 sibling of #18. |
| mercury | BPI thin template. | 3 / 0 / 0 | 3 http | Resume. | — | Thin hotlink. | B-WKS4. |
| meta | Type-only process hero. 375 words. | 4 / 0 / 0 | 2 data + 2 YT | Process before work. | — | Essay open. | B-C6. |
| meta-voice | Type-only. 568 words. | 4 / 0 / 0 | 2 data + 2 YT | Voice essay. | — | Text wall. | B-C6 / B-P3. |
| nen | Kalshi-family, type-only. 411 words. | 10 / 1 / 2 | 10 data-URI | Strong later. | Grid density. | Text hero. | B-C6. |
| palo-alto-networks | Kalshi clone. | 5 / 0 / 2 | 5 data-URI | Later grid. | — | Clone hero. | B-C5 / B-C6. |
| perplexity | BPI thin template. | 3 / 0 / 0 | 3 http | Resume. | — | Thin hotlink. | B-WKS4. |
| underdog | Kalshi clone. | 5 / 0 / 2 | 5 data-URI | Later grid. | — | Clone hero. | B-C5 / B-C6. |
| wpp-production | BPI thin template. | 3 / 0 / 0 | 3 http | Resume. | — | Thin hotlink. | B-WKS4. |
| TTL-BP | Password gate / 融资 deck. | 1 / 0 / 0 | 1 data-URI | Not a role Profile. | — | Not a company page. | B-EL1 homepage/deck. |

**High bar among the set:** Wonder (grid + 12 stills), Kalshi (poster grid + showreel), Cloudflare (density + shortest path to stills), Braze/Nen/Code-Theory (9–10 posters).  
**Old / thin:** ElevenLabs, Luma (78vh), ASCAP (zero stills), BPI-family (3 vumbnails), Giant Spoon #18 (78vh + 1 thumb).

---

## Loop 1 — 2026-08-18

**Closed B-ids:** B-C6 (text-only / no stills), B-P3 (shipped with no figure = 没核过), B-WKS4 (ASCAP / zero-still class).

### 1) 调研

Read `_CAREER` Profile-lane cases first (table above). Then opened all 28 company `index.html` files. #18 and ASCAP are the book’s text-only / blank-export class. Wonder/Kalshi have stills *later* and still fail B-C6 on the open.

### 2) 自检

Live `/giant-spoon/` (#18) vs 算对的标准:

- **B-C6 FAIL** — 78vh empty hero; 368 words; 1 remote thumb.
- **B-P3 FAIL** — blank first screen shipped.
- **B-WKS4 FAIL** — one thumb is not a work page.
- **B-C5 / B-EL1 FAIL** — Kalshi-clone résumé, not a Giant Spoon distill.
- **B-WKS5 FAIL** — no traditional stack on the first screen; delivery model before work.

Harness before this loop: R2 could ACCEPT a text-only Profile. `pass-minimal-three` was text-only and ACCEPTed.

### 3) 辩论

A “has `<img>`” gate is the minimum B-C6/B-P3 encoding. Hole: #18 *already has one `<img>`* (`vumbnail.com`). Work-images alone still **ACCEPT #18**. ASCAP fails; GS #18 does not. That leftover is B-C6’s blank-viewport clause — Loop 2.

### 4) 加固 harness

- P0 `r2-profile-work-images` on R2 and R3.
- Real `<img src>` required (not empty / placeholder / spacer / 1x1 / decorative / tiny GIF).
- Fixture `fail-text-only-profile` + `test-text-only-profile-rejected`.
- `pass-minimal-three` / `stale-input` gained a real `work-still.png`.

**Not yet:** B-C6 78vh spacer with a later thumb (Loop 2).

### Page change

Rebuilt `public/giant-spoon/index.html` (not a patch of #18). First viewport: catalog still, not an empty hero box.

### `drs-source` asset ids (`public: true`)

| id | why |
|---|---|
| `one-click-mute-key-frame-01` | Canonical OCM cover (B-WKS3). |
| `home-smarthome-manga-cut-01` | Canonical Manga Cut cover. Do not swap with DoomBrush. |
| `sys-mere-key-frame-01` | Extra finished-film density (B-WKS4). |
| `doombrush-key-frame-01` | Canonical DoomBrush cover. |
| `monet-cyberpunk-key-frame-01` | AI remainder, after the three. |
| `my-new-haircut-key-frame-01` | Extra short (B-WKS4). |
| `brief-history-of-a-family-still-01` | Traditional live-action (B-WKS5 / B-WKS6). |
| `brief-history-of-a-family-still-02` | Second feature still. |
| `prompt-builder-ui-01` | Tools after work (memory 6). |

Never used: `ai-film-studio-ui-01`, `coda-ui-01`, `martini-ui-01`, `ttl-breakdown-ui-01` (`public: false`).

---

## Loop 2 — 2026-08-18

**Closed B-ids:** B-C6 (blank first viewport / 78vh empty hero), B-C4 (empty white void as the open), B-P3 (spacer shipped = 没核过).

### 1) 调研

`_CAREER` B-C6 names the #18 `78vh` empty hero as the unfinished-export case. Full inventory: **Luma** `.hero-grid { min-height: 78vh }` is the same class. Hims 620px min-height is a later panel. Wonder/Kalshi/Braze/Amgen/Nen/Code-Theory/Underdog/Palo Alto are type-first *without* 78vh — still B-C6 on “first screen is not a still,” but a different mechanical hole.

### 2) 自检

- Loop 1 work-image rule **PASSES** live #18 (one `vumbnail`). **FAIL** vs B-C6 算对的标准.
- Rebuilt page (this branch): first element after a 52px nav is an `<img>`. No `.hero { min-height: 78vh }`. PASS on spacer. Still wrong vs B-WKS6 (AI lead) — later loops.

### 3) 辩论

Eric’s hard fail was the void. A supervisor could ACCEPT R2 on live #18 because it has one `<img>`. If B-C6 is not encoded as “spacer hero = REJECT,” the book’s named case stays legal.

**Next hole (Loop 3):** Wonder (597 words) and Kalshi (407 words) open type-only *without* 78vh. A Kalshi-clone with four posters below the fold still ACCEPT. That is B-C6 + B-WKS4 + B-P3: still must be early, and two films do not carry a page.

### 4) 加固 harness

- P0 `r2-profile-first-viewport-still` (R2 + R3).
- `.hero` / `header` with `min-height >= 70vh` and no `<img>` in that hero is REJECT. A later thumb does not save it.
- Fixture `fail-empty-hero-profile`: 78vh hero, work still *after* the hero. Work-images PASS; first-viewport FAIL.
- Self-test asserts the #18 CSS+markup pattern REJECTS.

### Page change

No return to a text hero. First viewport remains a catalog still (Loop 4 must move the lead to live-action / A-SHOWREEL-TRAD per B-WKS5 / B-WKS6).

---

## Loop 3 — 2026-08-18

**Closed B-ids:** B-C6 (type-only open without 78vh), B-WKS4 (两个片子撑不起一页), B-P3 (long text then stills = 没核过 first screen).

### 1) 调研

`_CAREER` B-C6 is not only the 78vh spacer. Wonder **597 words** and Kalshi **407 words** before the first still are the same unfinished first screen. Cloudflare is 80 words — the cutoff. B-WKS4: ASCAP 0, #18 = 1, BPI/Compass/Mercury/Perplexity/WPP = 3. Two films do not carry a page.

### 2) 自检

- After Loop 2, a Kalshi-clone with four data-URI posters *below* a type hero ACCEPTs (no 70vh spacer). **FAIL** vs B-C6 算对的标准.
- A page with two early stills ACCEPTs work-images + viewport + still-early. **FAIL** vs B-WKS4.
- This branch’s Giant Spoon: 12 words then a still, 9 catalog imgs. PASS on these two gates. Still FAIL B-WKS6 (AI lead) and B-WKS7 (Vimeo in modal only).

### 3) 辩论

If I only encode 78vh, Wonder/Kalshi remain the legal high-water mark — Eric already said that open is wrong. If I only encode “has an `<img>` early,” a two-thumb BPI page still ACCEPT. Both holes are in the book. Encode both.

**Next hole (Loop 4):** page can pass density and still lead with three AI/3D posters, hide traditional credits, and fold Vimeo into a modal. B-WKS3 / B-WKS5 / B-WKS6 / B-WKS7 / P-led method (showreel lead, AI ≤25%).

### 4) 加固 harness

- P0 `r2-profile-still-early`: first real `<img>` within 80 words of visible body text.
- P0 `r2-profile-still-count`: ≥4 real work images.
- Fixtures `fail-late-stills-profile` (140 words then 4 stills; viewport PASS) and `fail-thin-stack-profile` (2 stills first; early PASS).
- `pass-minimal-three` / live fetch body now ship 4 stills at the top of `<body>`.

### Page change

No Giant Spoon HTML change this loop. Density and still-early already hold. Loop 4 rebuilds the lead to traditional / A-SHOWREEL-TRAD.

---

## Loop 4 — 2026-08-18

**Closed B-ids:** B-WKS3 (AI order), B-WKS5 (traditional credits on the page), B-WKS6 (live-action lead), B-WKS7 (Vimeo in-card), plus method memory 6 / P-led (showreel lead, AI after, AI in schedule/cost language).

### 1) 调研

`career-application-loop.method.md`: Giant Spoon Senior Producer is traditional integrated production (P-led). Showreel lead. AI share ≤25%, translated into schedule/cost.  
`assets.json`: `A-SHOWREEL-TRAD` (Vimeo `1174467043`), Brief History stills, canon OCM / Manga Cut / DoomBrush covers — do not swap.  
B-WKS3/5/6/7 are the work-sample cases. Shipped pages that hide traditional credits or fold Vimeo (this branch’s previous rebuild: OCM hero, Vimeo only in a modal) fail the book even when density is high. Kalshi has a showreel iframe but after a type hero. Wonder puts OCM in the grid after a text open.

### 2) 自检

Previous Giant Spoon rebuild vs 算对的标准:

- **B-WKS6 FAIL** — first viewport was One Click Mute (AI).
- **B-WKS5 weak** — Brief History existed later; brand credits were a footnote after an AI grid.
- **B-WKS7 FAIL** — Vimeo only in `#modal`, not on the card.
- **B-WKS3** — grid order was Manga → SYS/MERE → DoomBrush, OCM on the hero. Not the book order as a stack.
- **P-led / AI ≤25% FAIL** — AI opened the page.

Harness after Loop 3 would still ACCEPT that page (9 stills, still-early, no 78vh).

### 3) 辩论

A density gate cannot see “wrong film in the lead.” If I do not encode traditional-visible, traditional-leads, AI order, and in-card Vimeo, a three-3D open with a modal reel stays legal. That is the book.

**Next hole (Loop 5):** stuffing an `<img>` into the #18 `.hero { min-height:78vh }` shell (B-C5 patch) still PASSES first-viewport-still. A Giant Spoon homepage clone with four decorative stills and no role / no work titles (B-EL1 homepage-as-profile) can also sneak past if we only count `<img>` tags.

### 4) 加固 harness

- P0 `r2-profile-traditional-credits` (B-WKS5)
- P0 `r2-profile-traditional-lead` (B-WKS6)
- P0 `r2-profile-ai-film-order` (B-WKS3)
- P0 `r2-profile-vimeo-in-card` (B-WKS7)
- Fixtures: `fail-ai-only-profile`, `fail-ai-lead-profile`, `fail-ai-order-profile`, `fail-folded-vimeo-profile`

### Page change

Rebuilt `/giant-spoon/` again (not a patch of #18, not a patch of the OCM-hero rebuild).

**First viewport:** 52px black masthead, then full-width **Brief History of A Family** still (`brief-history-of-a-family-still-01.jpg`) filling `min(78vh, 16:9)`. The image occupies the first screen.

**Then:** credentials → work samples (traditional showreel iframe `1174467043` + Brief History iframe `1172739705` on the same cards) → brand credits on the page (COACH / Nike / BMW as earlier production-company work) → AI strip in book order with canon covers → method (6-stage) → fit → contact.

### Assets used (unchanged catalog, new order)

| id | slot |
|---|---|
| `brief-history-of-a-family-still-01` | Hero / first viewport (B-WKS6) |
| `brief-history-of-a-family-still-02` | Feature card with in-card Vimeo |
| `one-click-mute-key-frame-01` | AI 01 canon cover |
| `home-smarthome-manga-cut-01` | AI 02 canon cover |
| `doombrush-key-frame-01` | AI 03 canon cover |
| `monet-cyberpunk-key-frame-01` / `my-new-haircut-key-frame-01` / `sys-mere-key-frame-01` | AI remainder |
| `prompt-builder-ui-01` | Tools after work |

---

## Loop 5 — 2026-08-18

**Closed B-ids:** B-C5 (不要打补丁), B-EL1 (不像官网 / homepage-as-profile), B-DEP1 (re-confirmed: live route still required; local HTML is not closeout).

### 1) 调研

B-C5: restew the official site; do not patch the old page. #18’s `.hero { min-height:78vh }` is that shell. Loop 2 only rejected the shell when it had **no** still. Stuffing an `<img>` into the same 78vh hero is the patch the book forbids.  
B-EL1: if it does not look like a distilled role page — company homepage marketing with decorative photos — that is a distill failure, not a missing button. TTL-BP / alibaba-startup / a Giant Spoon.com clone with four lobby stills are this class.  
B-DEP1: already encoded as R2/R3 live 2xx + slug marker. Named again so closeout cannot pretend local `index.html` is done.

### 2) 自检

Current `/giant-spoon/` vs the full B-layer:

| ID | This page |
|---|---|
| B-C4 | First viewport is a still on black, not empty white. Official paper + blue chrome from `giantspoon.com` 2026-08-18. PASS |
| B-C5 | New document, no `.hero { min-height:78vh }`. PASS |
| B-C6 | Still in the first screen; 12 words in the masthead before the img. PASS |
| B-WKS3 | OCM → Manga Cut → DoomBrush, remainder after. Canon covers. PASS |
| B-WKS4 | 9 catalog stills. PASS |
| B-WKS5 | Showreel + Brief History + COACH/Nike/BMW on the page. PASS |
| B-WKS6 | Brief History still leads. PASS |
| B-WKS7 | Vimeo `1174467043` and `1172739705` in-card. PASS |
| B-DEP1 | Route `/giant-spoon/` remains; harness still requires live 2xx. (Live until merge+Pages.) |
| B-EL1 | Role + work titles + distilled VI, not a GS homepage clone. PASS |
| B-P3 | Still + no spacer; self-checked against the book before handoff. PASS |

Harness after Loop 4 would still ACCEPT (a) #18 with an `<img>` dropped into the 78vh hero, and (b) “We are Giant Spoon” plus four decorative stills.

### 3) 辩论

Those two are the failures Eric named for the harness: **patch-on-old-shell** and **homepage-as-profile**. If they stay legal, Loops 1–4 were image accounting, not the case book. Encode them. No further named book hole after this pair; remaining risk is live deploy (B-DEP1) after merge.

### 4) 加固 harness

- P0 `r2-profile-not-old-shell`: any `.hero` / `header` `min-height >= 70vh` is REJECT, even with an `<img>` inside.
- P0 `r2-profile-not-homepage-skin`: must name a production role and ≥2 work-sample titles.
- Fixtures `fail-patched-shell-profile` (viewport PASS, shell FAIL) and `fail-homepage-skin-profile` (4 stills, no role/titles).

### Page change

No further Giant Spoon HTML change. Loop 4 rebuild already clears the B-layer table above.

---

## B-ids closed by loop

| Loop | B-ids closed |
|---|---|
| 1 | B-C6 (text-only / no stills), B-P3, B-WKS4 (zero-still class) |
| 2 | B-C6 (78vh blank first viewport), B-C4 (empty white void), B-P3 |
| 3 | B-C6 (type-only open), B-WKS4 (two films), B-P3 |
| 4 | B-WKS3, B-WKS5, B-WKS6, B-WKS7 |
| 5 | B-C5, B-EL1, B-DEP1 (re-confirmed) |

Canon cited every loop: `_CAREER/job-hunt-copilot/career-eric-zheng.md` Profile-lane cases, `assets.json` work-sample SoT, memory 6 VI + structure, `career-application-loop.method.md` P-led Giant Spoon closeout. Plus the full `public/*/index.html` survey.

---

## `node harness/cli.js --self-test` (2026-08-18)

```
self-test PASS
```

Fixtures: fail-skip-profile, fail-generic-homepage, fail-missing-cl, fail-text-only-profile, fail-empty-hero-profile, fail-late-stills-profile, fail-thin-stack-profile, fail-ai-only-profile, fail-ai-lead-profile, fail-ai-order-profile, fail-folded-vimeo-profile, fail-patched-shell-profile, fail-homepage-skin-profile → **REJECT**. `pass-minimal-three` → **ACCEPT**.

Named Career Profile tests: `test-text-only-profile-rejected`, `test-empty-hero-profile-rejected`, `test-late-stills-profile-rejected`, `test-thin-stack-profile-rejected`, `test-named-career-work-sample-rejected`, `test-patched-shell-and-homepage-skin-rejected` → **REJECT** as required. Pin + P0 loosening assertions → **PASS**.

---

## Loops 6–8 — 2026-08-18 (R-VI / R2 pipeline, then exam)

These loops are harness first. A restyle-only loop does not count.

### Loop 6 — R-VI token-only

**Escaped failure:** `vi.json` listed `#0033A0` / Sora with no USAGE. Distill without usage is a fail.

**Harness:** P0 `vi-usage`. Fixture `fail-vi-token-only` (Giant Spoon-like tokens, no usage notes). `--self-test` PASS.

### Loop 7 — primary only in 10px labels

**Escaped failure:** Official Klein Blue is a wordmark/field on a white canvas. Live page was a B/W résumé with 10px blue labels. Token+usage without applied chrome still ACCEPT.

**Harness:** P0 `vi-primary-as-field` / `r2-profile-vi-field`. Fixture `fail-vi-tiny-labels`. #18 CSS+markup still FAIL. Token+usage + applied chrome is the pass path. `--self-test` PASS.

### Loop 8 — text cards, legal credits, visible ids, invocation

**Escaped failure:** Showreel described in a paragraph (`A-SHOWREEL-TRAD · IN-CARD`). Brand credits as a legal grey wall. Internal asset ids on the public page. Assets dumped instead of invoked by JD.

**Harness:** P0 `r2-profile-showreel-picture`, `r2-profile-credits-not-legal`, `r2-profile-no-internal-ids`, `r2-profile-invocation`. Fixtures: `fail-text-showreel-card`, `fail-legal-credits-profile`, `fail-internal-asset-ids`, `fail-p-led-58node`, `fail-p-led-indev-wall`, `fail-o-led-58node`, `fail-a-led-tools-first`. Invocation matrix named in `harness/README.md` (do not copy HyperAgent files). `--self-test` PASS.

### Exam page (not the deliverable)

Only after those hops REJECT the current `/giant-spoon/` failure modes, the page was rebuilt so it would ACCEPT them:

- Klein Blue `#0033A0` as a wordmark/field on a white canvas. Palette is primary + black + white. Sora. Usage notes in `vi.json`.
- Showreel as a *picture* on the card (still + in-card Vimeo).
- Brand marks as a mark row (COACH / Nike / BMW), not a legal paragraph.
- No visible `A-*` ids.
- Six-stage silent strip. Prompt Builder last, one card. No 58-node. No in-dev tool wall.

Existing B-layer REJECTS from PR #19 stay encoded and still FAIL their fixtures.

---

## Loop 9 — 2026-08-18 (closed-debate cards, fixtures first)

Two debates closed. Compiled as R2 / R-VI fixtures, not a Giant Spoon restyle.

**P-led REJECT:** text showreel card; legal-paragraph credits; empty white work cards; 58-node / 7-stage on Senior Producer; in-dev tool wall before/taller than the trad reel; visible internal asset ids; Klein Blue only as 10px labels.

**P-led MUST:** reel poster 21:9 + play; brand stills, not wordmarks; `A-WORKFLOW-6STAGE` as one reskinned PNG/SVG + locked footnote; Prompt Builder last, one card.

**A-led (Wonder exam)** may use films-first + tools strip + 58-node — different fixture (`pass-a-led-wonder` ACCEPT).

### 1) Harness first

New checks: `r2-profile-empty-work-cards`, `r2-profile-brand-stills`, `r2-profile-six-stage`. Showreel picture now requires 21:9 + play.

Fixtures: `fail-empty-white-cards`, `fail-showreel-not-21x9`, `fail-brand-wordmarks`, `fail-p-led-7stage`, `fail-p-led-6stage-text`, `fail-indev-before-reel`, `pass-a-led-wonder`. `--self-test` PASS (`test-closed-debate-cards-rejected`).

### 2) Current `/giant-spoon/` vs those fixtures (before exam rebuild)

The previous exam still **FAILED** the new gates: 16:9 reel without play; COACH/Nike/BMW typeset wordmarks (empty white brand cards); 6-cell text strip instead of one PNG/SVG + footnote. That is why this page was rebuilt *after* the fixtures, not instead of them.

### 3) Exam page (secondary)

Only after those hops REJECT the text cards:

- Reel poster `21:9` + play. In-card Vimeo kept.
- Brand wordmark row **omitted** (no real brand stills in `stills/`; do not invent photos).
- One `stills/workflow-6stage.svg` (Klein Blue / black / white) + locked footnote.
- Prompt Builder last, one card. No 58-node. No in-dev wall. Klein Blue remains a wordmark/field.

Ruleset 1.10.0. Claim-locks unchanged.

---

## Loop 10 — 2026-08-18 (asset librarian, fixtures first)

Third debate closed. Compiled as harness law, not a page restyle.

**ANY company page:**

- Outward image requires `assets.json` `external_ready:true` AND drs-source INDEX `public:true`. Text may cite a READY-but-private asset; the file cannot hang.
- `A-WORKFLOW-58NODE` file only legal on `/wonder/` until a generic public version is READY + DRS `public:true`.
- `A-TOOLS-DEV4` screenshots (`ai-film-studio-ui-01`, `coda-ui-01`, `martini-ui-01`, `ttl-breakdown-ui-01`) are `public:false`. Hanging them is REJECT. In-development does not waive INDEX. `prompt-builder-ui-01` is the only public:true product shot today.
- `A-WORKFLOW-6STAGE` is READY on Drive (`1hZxTsSjSSvLRkpFe4-8jDSKbWN_HPkz5`, sha `0cb95ffb…`) but not in DRS INDEX. Non-Wonder pages must reskin. Never mix 6 vs 7/58 in captions. P-led: not the lead; method slot only if JD has process/gates as must-or-should and the strip is a picture. O-led: required (DOC-6/R8). A-led: supporting only.
- Visible internal ids = REJECT.

**P-led exam (this page):** lead `A-SHOWREEL-TRAD` as a picture. No 58-node file. No DEV4 suite. No Prompt Builder gallery. Brand stills omitted — no cleared brand frames in `stills/` (do not invent).

### 1) Harness first

Catalog: `harness/rules/asset-clearance.json`. New checks: `r2-profile-asset-clearance`, `r2-profile-58node-route`, `r2-profile-dev4-private`, `r2-profile-p-led-pb-gallery`. Fixtures: `fail-private-asset-hung`, `fail-dev4-indev-label`, `fail-58node-off-wonder`, `fail-6stage-drive-original`, `fail-6stage-caption-mix`, `fail-o-led-missing-6stage`, `fail-p-led-pb-gallery`, `pass-wonder-58node`. `--self-test` PASS (`test-asset-librarian-rejected`).

### 2) Current `/giant-spoon/` vs those fixtures (before exam)

`fail-p-led-pb-gallery` **REJECTED** the previous tools section (`prompt-builder-ui-01` hung). No DEV4. No 58-node file. 6-stage was already a reskin + footnote.

### 3) Exam page (secondary)

Removed the Prompt Builder gallery / tools section. Reel stays 21:9 + play. Reskinned `workflow-6stage.svg` stays in the method slot. No invented brand photos.

---

## Loop 11 — 2026-08-18 (R-VI official audit, fixtures first)

Official Giant Spoon distill (giantspoon.com, 2026-08-18). Compiled as hop fixtures. **Page HTML not restyled.**

Chrome-only distill = REJECT even if hex/font match. Home hero type-only white is chrome, not the brand. Distill must include work/case pages (full-bleed autoplay video + duotone scrims, named gradients, Yeti #D26403, HBO oxblood/black, 6 videos + 29 images, zero illustration). A black/white/navy résumé page = R-VI FAIL.

### 1) Harness first

New P0 `vi-not-chrome-only`. Fixtures: `fail-vi-chrome-only`, `fail-vi-home-hero-brand`, `fail-vi-bw-navy-resume`, `pass-vi-gs-content-distill`. `--self-test` PASS (`test-vi-chrome-only-rejected`).

### 2) Current exam `vi.json` vs those fixtures

The previous exam record (white / Klein Blue / black + “do not invent extra colors”) **FAILED** `vi-not-chrome-only`.

### 3) Exam record (secondary; not a page restyle)

`public/giant-spoon/vi.json` now holds the audit chrome + work/case content. The page remains the exam, not the deliverable.

---

## Loop 12 — 2026-08-18 (moving visual bar, fixtures first)

Every **new** company Profile is built and judged against the most recently shipped `public/*/index.html` pages, not a frozen pair (not ElevenLabs/Luma forever, not Wonder/Kalshi forever). **Page HTML not restyled.**

### 1) Harness first

P0 `r2-profile-recent-bar` (R2 + R3 echo). Discover peers except the package company. Sort by `git log -1 --format=%ct -- path`; mtime fallback if git is unavailable (said on the check). Newest 3 = the bar; written on the check as `compared_to`. ACCEPT only if manifest `compared_to` records that same set. A stale fixed pair while a newer peer exists is REJECT. A text/résumé page (0 work images / empty first viewport) is REJECT when any of the newest 3 has a first-viewport still. Reuses existing still gates.

Fixtures: `fail-stale-classic-bar`, `pass-recent-bar`. `--self-test` PASS (`test-recent-bar-fixtures`). Ruleset 1.12.0. Claim-locks unchanged.

### 2) Current `/giant-spoon/` vs those fixtures

Not restyled this loop. The law is the moving bar, not a page skin.

---

## Revert — page restyle not shipped

`index.html` restored to `main`. Homemade `stills/workflow-6stage.svg` removed — invented frame, not `A-WORKFLOW-6STAGE` (Drive PNG `1hZxTsSjSSvLRkpFe4-8jDSKbWN_HPkz5`, not in DRS INDEX). P-led exam must not hang an invented diagram. Deliverable is hops / fixtures / rules. `vi.json` exam record kept.
