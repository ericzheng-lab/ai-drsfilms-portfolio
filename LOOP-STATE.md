# LOOP-STATE — Career hop harness

Tier: L1
Reason: quality-gate CLI only. Does not touch `public/` routes or production deploy artifacts.

## Loop 0 snapshot
- Repo: ericzheng-lab/ai-drsfilms-portfolio
- Base: origin/main at 13a21279890be53bddaeb1a4ea930d8118e42b28
- Static convention: `public/<company>/index.html` → `https://ai.drsfilms.com/{company}/`
- Prior completed L2 (historical): Alibaba Startup Deck, PR #10, `71a37122e12157c42c4c79164cd1834efdb8bce4`

## Guardrails
- Quality gate only. Do not apply to jobs. Do not restyle the public site.
- Do not alter existing portfolio routes.
- Fixtures synthetic only. No invented biography.
- Nobody may waive Profile or cover letter.
- career-ops PR #5 is scrap only; checker canon lives here.

## DoD
- [x] D1: `node harness/cli.js --self-test` exits 0
- [x] D2: four fixtures behave (skip-profile REJECT / generic-homepage REJECT / missing-cl REJECT / pass-minimal-three ACCEPT)
- [x] D3: `public/` and site source untouched vs origin/main
- [x] D4: Draft PR #17 open; not merged (https://github.com/ericzheng-lab/ai-drsfilms-portfolio/pull/17)

## Loop log
- Loop 0: read origin/main, existing Actions `deploy.yml`, career-ops PR #5 as scrap.
- Loop 1: add `harness/` CLI, versioned rules, schema, fixtures, isolated Actions workflow.
- Verify: `--self-test` green; fixture hops match named outcomes; `git diff origin/main -- public src` empty.
- Draft PR: https://github.com/ericzheng-lab/ai-drsfilms-portfolio/pull/17 (not merged).

- Loop 2: close leftover harness classes on `feat/career-hop-harness` (R3 content rescan, live 2xx+marker Profile, novel waiver/skip class, company aliases, lib integrity pin). No merge. No `public/` restyle. No apply.
- Loop 3: close remaining holes on `feat/career-hop-harness` — R3 re-runs VI provenance; reject full-shaped id+PASS stub reports; company_aliases not builder-self-certified; skip-language nice-to-have / company-page synonyms; pin comparison moved into pinned `lib/integrity.js`. Draft PR #17. No merge. No `public/` restyle. No apply.
- Loop 4: close leftover #1 on `feat/career-hop-harness` — prerequisite ACCEPT is `decideVerdict(checks)`, not the self-certified verdict field. Forged prereq that copies live FAILs + ACCEPT + recomputed binding is REJECT. R0/R1/R2-only gates (brief-selected-work-ids, cv-header-not-homepage, r2-html-noindex) survive forged prereq. Cheap extras: Metaphor+meta prefix collision REJECT; live marker requires dedicated `/{slug}/` path. Draft PR #17. No merge. No `public/` restyle. No apply. Leftovers #2–#5 stay closed.
- Loop 5: supervisor `--verify --hop R3` on `feat/career-hop-harness`. Re-runs R3 live and re-derives `decideVerdict`; missing / handwritten / disk-vs-live disagreement is REJECT. Disk `R3.json` verdict is never sufficient before ATS fill. Leftovers #1–#5 stay closed. Draft PR #17. No merge. No `public/` restyle. No apply.


---

CHARTER: feat/starx-week-1-deck
- 级别: L1
- DoD: route returns 200 in local build; 4 PD clips play start-to-finish; `git diff origin/main --stat -- src` empty; 0 console errors

AUDIT a21ec39907944b05ed84dd5f7aaef6dd482206da
USABLE a21ec39907944b05ed84dd5f7aaef6dd482206da
- Self-verified (指挥层复核, not blind audit — see PR description): built dist, served with
  vite preview, drove all 15 slides via real DOM keydown events, confirmed 200 on
  /starx-week-1/, confirmed each of the 4 local <video> elements loads with correct
  ffprobe-matching duration/codec and renders the correct frame content on seek,
  confirmed all 8 external video IDs return 200 + valid oembed, confirmed 0 console
  errors on a clean tab, confirmed `git diff origin/main --stat -- src` is empty.

AUDIT 5d2226b52b1dba7bdf5e7ec3395ef2394fbc55e8
USABLE 5d2226b52b1dba7bdf5e7ec3395ef2394fbc55e8
- Round 2, same branch/PR, per Eric's live-preview feedback relayed via a peer session.
  Self-verified (指挥层复核, not blind audit): rebuilt dist, fresh tab each check (avoids
  stale cross-navigation console buffer, same as round 1).
  - 16 slides now (added an agenda slide); measured every slide's `.slide-inner`
    getBoundingClientRect at 1366x768, 1280x720 and 1024x768 with all slides cycled
    active in turn — 0 overflow at any of the three after tightening game-grid sizing
    (first pass overflowed 1366x768 by ~10px top+bottom on the game slide only).
  - All 8 external clips switched from window.open to lazy inline <iframe> (YouTube
    embed, src set on click, not on load). Re-confirmed embeddable via oEmbed HTTP 200
    for all 8 ids (a 401 there is YouTube's documented signal for embedding disabled —
    none hit it). Verified via real DOM events: clicking a play-btn swaps in the
    correct embed URL (incl. correct `&start=` offset on the one hard-example clip that
    needs it); navigating away removes the iframe and restores the idle state, including
    when 3 game-grid clips were opened simultaneously (all 3 torn down together) — matters
    live since these now play in-page instead of a separate tab.
  - Local clips: confirmed the 4 <video> posters resolve 200 and are real ffmpeg
    frame-grabs from the clips themselves (not stock imagery). Found and fixed one real
    bug while testing: clicking a local clip's play button left an unhandled promise
    rejection (`AbortError`, media power-saving pausing an unawaited `.play()`) visible
    in the console; added `.catch()`, reverified 0 console errors after the same click.
  - NOT independently verified: literal real-time playback of the YouTube iframes
    (autoplay + visible video advancing) — same sandbox constraint as round 1
    (backgrounded-tab media throttling); relied on oEmbed 200 + correct embed URL
    construction + no console/network errors instead. Presenter notes were rewritten
    Chinese-to-English by me, not back-translated/checked by a separate pass.
  - `git diff origin/main --stat -- src` still empty.

AUDIT 312b31368666886419c7b91b382a41f1be2493af
USABLE 312b31368666886419c7b91b382a41f1be2493af
- Small follow-up, flagged by a peer session's own independent click-through of round 2
  (not Eric): slide 3 ("Four kinds of film" divider) declared layout:split but only put 4
  small text chips in the media column — same sparse-composition pattern this whole pass
  was meant to fix, just missed on this one slide. Replaced with a 2x2 grid of the same
  icon marks already used on the 4 category slides (no new assets, no judgment call).
  Self-verified (指挥层复核): rebuilt, fresh tab, confirmed 4 icons render with correct
  labels, re-measured all 16 slides overflow-free at 1366x768/1280x720/1024x768, 0 console
  errors. All other split-layout slides checked against the same pattern — none had it.

AUDIT 3d5dbadc96594326b815f25facf6c31b2c12a3b8
USABLE 3d5dbadc96594326b815f25facf6c31b2c12a3b8
- Round 3, Eric's second live-preview pass (relayed): deck still read as thin/text-heavy —
  wants every slide to pair a real image with its video, decided not proposed. Real content
  pass, not spot fixes:
  - Animation example swapped Lion King (ext link) -> Steamboat Willie (1928), self-hosted
    like the other 4 PD clips. Verified PD via archive.org licenseurl (same method as
    original 4: creativecommons.org/publicdomain/mark/1.0/), not assumed. Trimmed to the
    wheel-whistling sequence (20.0-42.0s), picked via the same ffmpeg contact-sheet method
    as round 1. Orphaned `lionking94` CLIPS entry deleted (dead code) once nothing referenced
    it — g2 in the game grid has its own independent id, unaffected.
  - Added a real supporting photo next to 3 clips that were video-only: 1896 Lumière poster
    (Henri Brispot) on the usine slide, a period Méliès portrait on the lune slide, a CC
    BY-SA panther-chameleon photo (credited, Charles J. Sharp) beside the existing
    documentary clip. Every license tag verified by reading the actual Wikimedia Commons
    file page myself before downloading — not taken on a peer's word.
  - Added 2 original abstract SVG graphics (opening-question, next-week) — no real photo
    exists for a pure open-ended question, so used the same icon technique as the 4
    category marks rather than forcing a mismatched stock image.
  - Documentary: did NOT swap in a self-hosted Prelinger short. Best candidate found
    (`Private Life of a Cat`, 1947) has a known on-screen birth scene — can't confirm
    K-3-appropriate without watching end-to-end, which this sandbox can't do. Used the
    explicitly-authorized fallback (photo, not video) instead of guessing on child-safety.
  - Found and fixed a real bug while testing: local `<video>` clips stayed stuck in the
    "playing" state (play button hidden) if the presenter navigated away before the clip
    ended — only ext iframes were being torn down on slide change. Local frames now reset
    the same way. Also dropped an invalid `web-share` token from the iframe allow-list
    (was logging a console warning on every external clip play — now genuinely 0 console
    output, not just 0 errors).
  - Sourcing note: the new downloads (1 video, 3 images) come from the same trust tier
    (archive.org, Wikimedia Commons with a verified PD/CC tag) and fall under the same
    standing copyright policy already written into this file for round 1 — applied to
    newly-identified sources this round, not a new category of action. Flagged explicitly
    in the PR description rather than left silent, since the request to source them arrived
    via a peer relay rather than Eric directly in this repo's own thread.
  - Self-verified (指挥层复核, not blind audit): rebuilt, fresh tab each check, all 16
    slides re-measured overflow-free at 1366x768/1280x720/1024x768, confirmed all 4 new
    files (1 video + 3 images) return 200 and match expected ffprobe/dimensions, confirmed
    the new local clip's readyState/duration, confirmed the navigate-away fix with a direct
    before/after repro. `git diff origin/main --stat -- src` still empty.

AUDIT d772388bdadeea0e16b7eaf72f757301a2b64ce0
USABLE d772388bdadeea0e16b7eaf72f757301a2b64ce0
- Round 4, Eric's third pass (relayed), then his own one-word follow-up "以此类推": not
  just more/better clips — wants explicit teaching content (definition + diagram) paired
  with every concept beat, traced to a pattern in his own Gamma reference deck this build
  never adopted. Then extended by his own instruction to the historical slides too, using
  judgment on what "definition" means for a historical fact vs. a category.
  - New slide 2 ("What is a Film?"): plain-language definition, filmstrip SVG diagram,
    4-word synonym row. 16 slides -> 17.
  - 4 kind-of-film slides: added a 3-item fact-bullet row (explicit definitional facts)
    and an original mechanism-diagram + caption (distinct from the 4 identity icons
    already in use) to each — kept the existing poetic headline/sub/callout, definition
    and hook now coexist rather than one replacing the other.
  - 4 historical slides (usine/train/arroseur/lune): added a compact fact-line (year,
    place, one distinguishing historical detail) — same density upgrade, different content
    register, per Eric's own framing of the extension.
  - Deliberately skipped, per the same instruction's explicit carve-out: game slide,
    agenda, opening/think-back/next-week bookends — logistics/transition, not concept
    teaching. Judgment call recorded so it's visible, not silent.
  - No new media downloads this round — everything is text + original inline SVG, so no
    new sourcing/provenance question like round 3's.
  - Separately: the peer relaying this round also referenced "movie title swaps from my
    last message" (Lion King/Kubo/HTTYD) that never actually arrived in this session —
    did NOT guess at specifics (which slide, which clip id, timestamps); flagged the gap
    back to the peer instead of fabricating parameters for a message I don't have.
  - Self-verified (指挥层复核, not blind audit): rebuilt, fresh tab, all 17 slides
    re-measured overflow-free at 1366x768/1280x720/1024x768 — including the documentary
    slide, which now stacks 3 media-column elements (clip-stage + mech-diagram +
    support-img) and still clears with 161-187px margin at every size. Confirmed exact
    counts/content of all new elements (4 synonym chips, 12 fact-bullets, 4 mech-diagrams,
    4 fact-lines) via direct DOM inspection, not just visual spot-check. Full 17-slide
    keyboard walk + overview grid (17 cards) + game-slot multi-open/close all reconfirmed
    working. 0 console output throughout. `git diff origin/main --stat -- src` still empty.

AUDIT 4e753f6a8f6182078d05d50479af86e4a9a5ea62
USABLE 4e753f6a8f6182078d05d50479af86e4a9a5ea62
- Round 5 ("v2 rebuild"), Eric's decision after judging the 17-screen deck couldn't sustain a
  60-minute class. Full-scope rebuild per the written spec in `Film_Teaching/LOOP-STATE.md`
  (branch `docs/week-01-deck-v2-plan`, read-only, read in full before starting, never switched
  to), not incremental feedback like rounds 2-4. 17 screens -> 32, in 5 timed segments matching
  the spec's minute boundaries exactly (ends at 7/33/43/55/60).
  - Full visual-identity replacement ("童趣"/childlike, per spec): 5 per-segment background
    tints; a recurring hand-drawn character cast built on one shared SVG turbulence/displacement
    filter (#wob) so every character/doodle shares one hand-drawn line quality; the 4 prior
    geometric category icons redrawn as characters (camera/pencil/puppet/binoculars, each with
    the same dot-eyes+smile grammar) instead of logos; one consistent photo treatment (torn-frame
    border + tape corners) applied everywhere a photo appears; zero emoji anywhere (checked with
    a regex sweep, not spot-check - one ambiguous Unicode arrow character replaced with plain
    text out of caution even though it likely wasn't a true match).
  - New sourced/license-verified assets: Muybridge motion-study plate + loop (Wikimedia Commons,
    file page read directly), Melies "Escamotage" vanishing-trick before/after frame pair
    (archive.org licenseurl, PD; visually confirmed both frames share identical camera framing
    before trusting them as a pair), Chaplin portrait (Wikimedia, PD), and a 24-frame/1-second
    sequence extracted from the already-committed already-PD Steamboat Willie clip at native
    ~24fps for the "24 drawings = one second" screen - deliberately one consecutive second, not
    frames spread across the clip, to match the actual arithmetic being taught.
  - Rejected one sourced candidate on editorial grounds, not licensing: a CC BY-SA wildlife-
    photographer photo was correctly licensed but framed as a heroic adventure portrait, which
    contradicts the spec's explicit "must look uncomfortable and boring" intent for that beat.
    Used the spec's own pre-authorized drawn-diagram fallback instead of forcing a mismatched
    photo just because it cleared the license bar.
  - Screens 2, 9, 31 need material only Eric can supply. Per an explicit peer follow-up
    instruction, built as finished drawn illustrations (not grey boxes/"pending" placeholders):
    screen 2 a clapperboard/camera illustration, screen 9 a labelled overhead set diagram
    (actors/camera/boom/lights/crew - deliberately not attempted as a real photo since a labelled
    drawing may beat a chaotic real set photo for this age group), screen 31 a phone propped on
    books pointed at toys. All three still flagged below as open, not quietly finalized.
  - Removed the "open on YouTube" fallback link (idle-state escape hatch carried since round 1):
    every clip id is now independently oEmbed-verified embeddable and the spec's DoD reads "zero
    links that open elsewhere" literally. Cleaned up the now-dead CSS and click-handler branch
    that went with it.
  - Real bugs found and fixed while testing, each confirmed via getBoundingClientRect/DOM
    checks rather than visual guessing: (1) several character icons collapsed to 0 height -
    sizing was on the wrapper div but not the raw child <svg>, one consolidated CSS rule fixes
    every instance; (2) the Lumiere poster (tall portrait image, no height cap) overflowed the
    viewport both above and below, hiding the headline - fixed with a height-capped rule plus a
    global default safety-net for any other bare photo use; (3) the sorting-game grid overflowed
    ~45px past the right edge at 1920x1080 only - a CSS Grid min-width:auto trap on the grid
    children, fixed with explicit min-width:0; (4) 4 of 11 interaction screens were missing
    their on-screen prompt line - 2 had the text in data but the render branch never emitted it,
    2 had no prompt in the data at all. All 11 interaction screens re-verified to render a
    non-empty prompt after the fix.
  - Self-verified (指挥层复核, not blind audit): rebuilt dist, confirmed all 32 screens present
    in the correct 6/12/3/7/4 per-segment distribution via direct array inspection (not a total
    count - the spec's own DoD warns a matching total can hide one thing fixed and one thing
    broken); re-measured overflow-free at 1366x768/1920x1080/1280x720 (the 1920 case is what
    caught the game-grid bug above); confirmed 0 console errors across a full interaction battery
    (all 32 screens, notes, overview grid, every clip type including simultaneous multi-clip
    teardown, the new flipbook and beat-reveal interactions); confirmed zero emoji and zero
    Chinese characters by sweep, not spot-check; confirmed complete alt-text and on-screen-prompt
    coverage; confirmed headline/body type sizes clear the spec's 48px/28px floor at the 1920px
    reference; visually spot-checked (screenshot, settled) every screen carrying new media or a
    new drawn illustration, including the three Eric-material placeholders; confirmed
    `git diff origin/main --stat -- src` empty, `_redirects`/`_headers` unchanged and correct,
    `public/starx-week-1/media/` contains only PD-sourced files (no accidental self-host of
    copyrighted material - copyrighted clips remain embed-only throughout).
  - NOT independently verified (same standing caveats as prior rounds, unchanged): literal
    real-time playback of the YouTube iframes under this sandbox's background-tab media
    throttling - relied on oEmbed 200 + correct embed-URL construction + clean console/network
    instead, as in every prior round. The English presenter-note register is a transcreation by
    me, not back-translated or checked by a separate pass.
  - Four content decisions the spec flagged as open (live-action clip title, Shaun-vs-Kubo,
    whether to include a modern animated film, whether Eric appears in his own deck) were built
    per the spec's own stated recommendations, left provisional, not quietly finalized.

AUDIT 55c04f990ffb5789807b43e67339e545e8493d36
USABLE 55c04f990ffb5789807b43e67339e545e8493d36
- Round 6, a peer session's independent review of the round-5 v2 rebuild (not Eric directly;
  peer stated it verified structure/licensing/type-floors itself before flagging these). Two
  real issues, both confirmed against the actual code/render before fixing, not taken on the
  peer's word alone:
  - Screen 6 (agenda, "Four stops today") was a plain grey numbered list — thin rules, grey
    ordinal numbers, no color, no illustration — while every other screen in the deck carries
    the childlike sticker-card identity. Confirmed by reading the render branch and CSS
    directly: this was real, not a false positive. Fixed by giving each of the 4 agenda rows
    the same illustrated-card treatment used elsewhere (colored `.kind-icon` badge + ink
    border + offset shadow), reusing the existing live/anim/stop/doc cast in order rather than
    drawing new art. Checked the 3 sibling screens the peer flagged as likely-same-failure (7,
    19, 22): all three already use the correct card+icon treatment — confirmed via direct code
    read and a settled screenshot of each, no change needed.
  - 10 eyebrows used circled numerals (①②③④). Confirmed count via grep before touching
    anything. Replaced with plain digits plus the "N · LABEL" separator convention already
    used elsewhere in the deck (e.g. "1895 · WHAT A CINEMA WAS"), rather than a bare
    "1 LABEL" run-together. Re-verified 0 circled numerals remain and the new eyebrows render
    correctly in the mono display face (no font-fallback mismatch).
  - Found one more real bug while re-verifying, not flagged by the peer: screen 11
    (drawings24 — giant "24" + frame preview + 24-thumbnail grid) overflowed the viewport at
    1280x720 specifically (fine at 1366x768 and 1920x1080 — an ~8-9px top+bottom overflow that
    only shows up at the shorter 720px height). Reproduced with real app navigation and a
    screenshot, not just the bulk DOM sweep that first flagged it. Fixed with a
    `max-height:760px` breakpoint that shrinks the three elements together; confirmed via grep
    that `huge-num`/`flip-preview`/`flip-grid` are used only on this one screen, so the fix has
    no effect elsewhere. Re-verified 0 overflow at 1280x720 via real navigation after the fix.
  - Self-verified (指挥层复核, not blind audit): rebuilt; re-confirmed all three fixes with
    real app navigation (overview grid + keyboard), not a synthetic DOM-only check — a first
    attempt at a bulk 32-screen overflow sweep via direct `classList` manipulation corrupted
    the page's own active-slide state (an artifact of the test method, not the app), so the
    screen-11 fix was re-verified after a fresh reload instead. 0 console errors; `git diff
    origin/main --stat -- src` still empty.
  - **Review-grade disclosure, on the record per the peer's explicit request**: every round on
    this deck, including this one, has been self-verification (指挥层复核) by whichever Claude
    session did the work. None has been a 真盲审 (a cold reader with no context, handed the
    files fresh). This deck executes JavaScript in front of a live K-3 classroom, so that
    distinction matters — five (now six) rounds of self-review should not read as five rounds
    of independent review. Recorded here rather than left implicit so it's Eric's call whether
    a blind pass happens before this is used live, not something papered over by the AUDIT
    label alone.

AUDIT 2d131042037c63de8570fb71bea75dff78486854
USABLE 2d131042037c63de8570fb71bea75dff78486854
- Round 3 (in progress — this entry covers commits 5aa8bd6 and 2d13104; the D group's
  remaining 14 images are still being sourced, a further commit and AUDIT update will follow).
  Built against a real spec, not a paraphrase: Eric ran the round-5 deck on a projector with
  real children and wrote up specific findings in Film_Teaching/LOOP-STATE.md
  (docs/week-01-deck-v2-plan, read in full, read-only, commit f4ddeea at time of reading).
  - **A — two class-breaking bugs, both confirmed against the actual code before fixing**:
    (1) game-grid thumbnails (screen 20) overflowed their cards and covered the reveal-answer
    link — root-caused to `.clip-stage{width:min(460px,88vw,42vh)}`, a fixed-width rule shared
    with single-clip screens, leaking into the 3-column grid where each column only has ~280px.
    Fixed with a scoped `.game-slot .clip-stage{width:100%;min-width:0}` override. (2) opening
    a video jumped the deck back to slide 1 — root-caused to an emergent interaction, not an
    explicit bug: native browser video-fullscreen plus the native Escape-to-exit convention,
    colliding with this deck's own global Escape handler (which opens the overview grid, one
    click from slide 1). No `goTo(0)` call existed anywhere — the fix was architectural
    (eliminate reliance on native fullscreen via a proper in-page lightbox), not a patch on the
    handler, so it can't regress the next time a browser changes fullscreen behaviour.
  - **C — universal video lightbox**, one mechanism for self-hosted `<video>` and YouTube
    `<iframe>`: ≥90vw/85vh centered, dimmed backdrop, `innerHTML=''` teardown on close (stops
    playback for both element types without needing the YouTube Player API), arrow keys inert
    while open via an early-return guard placed first in the shared keydown handler. All 5
    sub-requirements verified in-browser with real navigation and real `KeyboardEvent`
    dispatch, across 1280x720/1366x768/1920x1080/1024x768, not just code-read. Found and fixed
    a real defect while wiring it up: the 6 game-grid clips (g1-g6) had no `title` field, so the
    new lightbox's iframe rendered `title="undefined"` — fetched real titles via YouTube oEmbed
    for all 6 and added them.
  - **B — background illustration**, all 32 screens: reuses the existing small icon-badge SVG
    cast at 70vh via pure CSS scaling (`opacity:.09`) — no new artwork, per the spec's explicit
    "reuse the cast, not 32 new drawings." A segment-default array (`SEG_BG`) plus per-slide
    `bgIcon`/`icon` fallback chain assigns all 32 screens with only 7 manual overrides. Contrast
    proven by construction, not sampled: computed the WCAG ratio in JS for the theoretical
    worst case (dark ink text directly over the illustration's own darkest silhouette pixel) —
    12.77:1 against the spec's 4.5:1 floor.
  - **D2 — screen-2 portrait loop**: 4 illustrated portraits Eric supplied, already
    normalised/compressed by the peer, cycling 1→2→3→4→1 at 0.7s continuously while the screen
    is active. Eager unconditional preload at script-init (not on first visit), hold-last-frame
    on load failure, timer started/stopped exclusively from `goTo()` (verified no stacked
    timer on leave-and-return), `prefers-reduced-motion` honoured (shows frame 1 static).
    **Closes one of three "waiting on Eric" gaps — screen 2 no longer waiting.** Screens 9 and
    31 remain open.
  - **Mid-arc policy change, verified directly against Film_Teaching/LOOP-STATE.md before
    acting on it**: Eric lifted the copyright/licence constraint for this deck's media
    ("internal classroom teaching, not public teaching... pick the best picture, full stop").
    Clips may now be self-hosted/trimmed even if copyrighted. Still constrains: Cloudflare
    Pages' 25MB/file cap; the route staying private/noindex, which is now explicitly
    load-bearing to the whole decision and not something to change without going back to Eric;
    credits stay where pedagogically useful, not because the licence requires them.
  - **D (part 1 of 2) — 5 of 19 support pictures**, the "free by age" historical set (screens
    23, 24, 25, 30, 32), sourced via a background agent from Wikimedia Commons and
    independently viewed by me before integration, not taken on the agent's manifest alone:
    screen 23 gained the actual surviving Cinématographe camera (alongside the existing 1896
    poster); screen 24's supportImg was replaced (the Lumière-brothers portrait now sits there
    instead of the 1896 poster, which was redundant with screen 23); screen 25 gained a 1941
    London cinema-queue photo; screen 30 gained Méliès's glass-roofed studio interior; screen
    32 gained a second Chaplin image (the Tramp walking away, 1915) alongside the existing
    seated portrait. Introduced a `supportImgs` (plural) field + render-loop for the two-image
    cases, reusing the existing `supportImgHTML`/`photoFrame` helpers unchanged.
  - **Disclosed judgment call, not silently resolved**: screen 25's cinema-queue photo is dated
    1941 — later than the deck's other 1895-1915 material, since no photo of the actual first
    (1895) audience survives and the agent's search for an earlier queue photo came up short on
    quality/resolution. Accepted rather than escalated (reads unambiguously "old" to a
    six-year-old, and the brief was "pick the best picture, full stop"), but a peer session
    caught a real gap in that reasoning: an *un*captioned 1941 photo beside an "1895" headline
    quietly asserts something false to any adult in the room who can date 1940s coats and cars,
    even though a child can't. Fixed per that note: built a reusable `.photo-date-tag` overlay
    (visible on the photo itself, not just in body text) plus led the caption with the same
    disclosure in words. Checked the same rule against the other 4 period images — none needed
    it (23's Cinématographe photo is a modern photograph of the genuine 1895 artifact, which
    doesn't misrepresent the era; 24/30/32 are all period-matched to their screens).
  - **Real bug found and fixed while verifying** (same discipline as every round — checked
    after every change, not assumed): the new screen-30 glass-studio card pushed that screen
    past the viewport at both 1280x720 and 1366x768. The existing `max-height:760px` breakpoint
    (from round 6's screen-11 fix) doesn't cover 768 — confirmed this gap by testing 768
    specifically, not by assuming the existing breakpoint was sufficient. Scoped a *separate*
    `max-height:800px` rule to just the screen-30 portrait photo, rather than widening the
    shared 760px breakpoint and risking a regression on screen 11's already-verified fix.
    Re-verified 0 overflow on all 5 touched screens (23, 24, 25, 30, 32) at all 3 standard
    resolutions after the fix, 0 console errors.
  - **Independently confirmed by the peer session, not by me — recorded with that attribution**:
    the peer verified this build's bug-1/bug-2/lightbox fixes themselves on the deployed
    preview (thumbnails contained, slide index held through open/close, arrow keys inert,
    iframe count drops to zero on close) before passing the checkpoint to Eric, rather than
    taking my report on trust. They also got real YouTube playback inside the lightbox
    (Paddington actually played) — closing a gap that has been open and unverifiable from this
    sandbox for five rounds running, since backgrounded-tab media throttling here blocks any
    first-hand check of literal real-time playback.
  - Self-verified (指挥层复核, not blind audit) by me for everything not attributed to the peer
    above: `node --check` clean after every edit batch; `npm run build` succeeds; rebuilt and
    served via `vite preview`; `git diff origin/main --stat -- src` empty both commits; no
    `git add -A` used, files staged explicitly and reviewed via `git status`/`git diff --cached
    --stat` before each commit.
  - **Screens 9 and 31 still waiting on material only Eric can supply** — the D-group images on
    screen 9 (boom operator, lighting setup) supplement the labelled diagram, they don't
    replace the "waiting on Eric" tag; his own set photo may still end up sitting beside them.

AUDIT 7ec51f4ffc3deeac02cebc20aee4aee2af4df851
USABLE 7ec51f4ffc3deeac02cebc20aee4aee2af4df851
- Round 3, D group part 2 of 2 — completes all 19 of 19 support pictures across the 17 named
  screens (4, 5×2, 8, 9×2, 10, 11, 12, 13, 14, 15, 16, 17, plus part 1's 23, 24, 25, 30, 32).
  Sourced by a second background agent (14 items), independently viewed and confirmed by me
  before integration, same discipline as part 1 — not taken on the agent's manifest alone.
  - **2 of the agent's early deliveries were rejected and sent back for a re-source, not
    integrated as-is**: screen 11's cel photo was originally a fan holding a framed, signed
    animation cel at what looked like a comic-shop signing event (people, an autograph, a
    retail setting) — the brief needed a clean shot of a painted cel's artwork, not a person
    holding a collectible. Screen 12's flipbook photo had the correct action (a hand thumbing
    pages) but the visible cover carried "Enjoy Responsibly" next to sports-sponsor-style
    branding — almost certainly alcohol or gambling promotional material, not appropriate to
    put on screen in front of 6-8-year-olds regardless of the licence question. Flagged both to
    the agent by name while it was still active (not after it finished), so the re-source
    folded into the same run. Both replacements independently viewed and confirmed clean: 11 is
    now an uncluttered Heritage Auctions catalog photo of a real painted Ariel cel; 12 is now
    cropped tight to just the hand-thumbing action with the branded cover excluded entirely.
  - **Replaced 2 drawn fallbacks with real photos now that they exist**: screen 10 (animator's
    desk, a real Disney Archives exhibit photo) and screen 13 (puppet armature, a real
    workbench of stop-motion skeletons with metal ball joints visible) — both previously shown
    as drawn placeholders per round 5's disclosed fallback, now upgraded.
  - **Provenance is partial, disclosed explicitly rather than smoothed over — per the peer's
    direct instruction to record this and name which items**: the sourcing agent hit a context
    compaction mid-task and lost its own source-URL trail for several images; rather than
    fabricate citations, it marked what it could and couldn't re-confirm, and I read its
    manifest in full (not just the completion summary) before writing a single credit line.
    Credit text is tiered to match exactly what's confirmed, never overstated:
    - Exact source URL confirmed (3): screen 8 (Wikimedia Commons/Flickr, CC BY 2.0), screen 10
      (Flickr, CC BY-NC-ND 2.0), screen 12 (Wikimedia Commons, CC BY-SA 3.0).
    - Photographer/site identity confirmed, exact page not re-pinned (4): screen 11 (Heritage
      Auctions — also visible baked into the image itself), screen 13 (Instagram @13fingerfx —
      visible watermark), screen 16 (Hari Patibanda, Flickr — visible watermark), screen 15
      (gigazine.net).
    - Not re-confirmed at all (6): screens 4, 5×2 (zoetrope, projector), 9×2 (boom operator,
      lighting setup), 14 (miniature set — the agent's own film-identity guess for this one was
      hedged as unconfirmed too, so it's treated as unknown, not asserted). These carry a bare
      "photo" credit — honest and non-alarming on a live classroom screen, but making no claim
      the manifest doesn't support.
  - **Two real overflow bugs found and fixed while verifying, same discipline as every prior
    fix in this round**: (1) screen 5 (motion) overflowed 89px at 1280×720 once the 2 new
    support cards stacked below its existing hero photo + loop row. Fixed by laying the 2 new
    cards side-by-side (`.support-img-row`) instead of stacked, plus a height cap on the hero
    photo at short viewports. First attempt at that cap had zero effect — `.motion-block
    .torn-frame img`'s existing two-class specificity beat my single-class override regardless
    of the media query matching; caught by checking the computed style directly rather than
    assuming the CSS took effect, fixed by matching specificity. (2) screen 11 (drawings24)
    overflowed 36px at 1366×768 once the new cel photo was added — the round-6 fix for this
    same screen was scoped to `max-height:760px`, which doesn't cover 768 (the same gap that
    hit screen 30 in part 1). Widened that screen-only breakpoint to 800px after confirming via
    grep the affected classes are used nowhere else in the deck.
  - Self-verified (指挥层复核, not blind audit): re-verified 0 overflow across all 17
    touched/re-checked screens (this batch's 12 + part 1's 5) at 1280×720/1366×768/1920×1080 —
    every screen re-measured after every fix, not assumed from the first pass; 0 console
    errors; every one of the 19 images confirmed actually loaded via DOM inspection
    (`img.complete`/`naturalWidth`, not just src-attribute presence) with correct alt text,
    caption, and credit content, not just image count; `node --check` clean after every edit
    batch; `npm run build` succeeds; `git diff origin/main --stat -- src` empty; files staged
    explicitly per commit, no `git add -A`.
  - **D group complete. Round 3 (A, B, C, D, D2) now fully landed and pushed** across commits
    5aa8bd6, 2d13104, 2647f47, 7ec51f4. Only screens 9 and 31 remain waiting on Eric's own
    material — everything else in the round-3 spec is built, verified, and on the branch.
  - **Review-grade, unchanged from every prior round**: self-verification (指挥层复核) only.
    No blind audit (真盲审) has happened on this deck at any point. Whether one happens before
    it runs live in front of the actual class is still Eric's call, not mine to assume.

AUDIT 572a85aa1b109d964e49187be97a5acbb43420f3
USABLE 572a85aa1b109d964e49187be97a5acbb43420f3
- Post-integration D-group review by a peer session, who built a contact sheet of all 14
  screens-4-17 images and reviewed them side by side rather than one at a time — a genuinely
  different vantage point from mine, and it surfaced something real: the deck's own
  `.support-img img{object-fit:cover}` treatment center-crops every one of these photos into a
  fixed square box, so a file that reads fine at native resolution can render very differently
  on screen. I hadn't been checking that specific transform before this round.
  - **2 of the peer's 4 flagged items confirmed and fixed**: screen 11's cel photo carried a
    burned-in "Imaged by Heritage Auctions, HA.com" band at the bottom that survives the
    cover-crop (verified by reproducing the exact crop with PIL, not by assuming) — found the
    exact pixel row via a colour-sample script and cropped precisely, leaving the artwork and
    its legitimate Disney copyright mark untouched. Screen 12's flipbook photo was an extreme
    3.2:1 letterbox crop that the cover-crop reduced to a bare sliver of finger on screen — far
    worse than it looked at native resolution, confirming the peer's read. Re-downloaded the
    original Wikimedia source (same photographer, same CC BY-SA 3.0 licence, just a different
    region of the same photo) and iterated 3 candidate square crops, checking each against a
    reproduction of the actual on-screen cover-crop before picking the one where the fanned
    pages and thumb are unambiguously the subject across the full frame.
  - **2 of the peer's 4 flagged items disputed, with reproduced evidence, not deferred to
    either party's assertion**: for boom-operator.jpg and lighting-setup.jpg, I reproduced the
    exact `object-fit:cover` crop with PIL (matching the CSS math precisely) before accepting
    or rejecting the claim. In both reproductions, the flagged subject — the boom pole and
    furry windscreen; the three lit lamp heads — remains clearly visible and prominent, not
    lost or clipped. This contradicts "no boom pole visible at all" and "murky, nothing reads
    at a glance." Flagged the disagreement back to the peer with the reproduced crops as
    evidence and a specific hypothesis for the discrepancy (a multi-image contact sheet likely
    renders each photo smaller than either the source file or the deck's own individual 52-70px
    thumbnail, which could wash out exactly this kind of detail at contact-sheet scale without
    it being a problem at the deck's actual display size) — not yet resolved as of this commit.
  - Self-verified (指挥层复核): both fixes re-confirmed via DOM inspection after rebuild
    (`img.complete`, correct new dimensions — cel 1600×1468, flipbook 1300×1300 exactly square
    so no further browser-side crop applies); `npm run build` succeeds; files staged explicitly,
    no `git add -A`.
  - **Process note worth keeping**: this is the first point in the whole D-group review where
    checking the *actual rendered crop* rather than the *source file* changed a verdict. Worth
    applying retroactively — none of the other 17 D-group images (this round or part 1) have
    had their on-screen `object-fit:cover` crop specifically checked yet, only their source
    content. Not treating that as urgent right now since the peer's own contact-sheet pass
    already looked at all 14 of this round's images together and only flagged these 2 as
    genuinely broken (plus the 2 disputed above) — but flagging the gap in method honestly
    rather than silently assuming the rest are fine by extension.
