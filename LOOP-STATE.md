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
