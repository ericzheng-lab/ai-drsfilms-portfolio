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

CHARTER: feat/starx-week-2-deck
- 级别: L1
- DoD: /starx-week-2/ returns 200 on the branch preview; SLIDES.length===24 (the plan's §C screen list — 23 screens + the bonus; §I's "25" is that list miscounted); SEGMENTS ends 5/20/28/40/50/60 and six seg-* tints render; every slide has mode, no two consecutive tell, >=11 do, a do within the first three; every CLIPS entry declares in/out, P1 video <= 9:00 and P1+P2 <= 12:00 from out-in; every watch note has "?" or "watch for", every do note has three lines; every type:ext id answers oembed 200, every local src/frame exists, zero img.youtube.com references; every media file <= 25 MB, route <= 100 MB; git diff origin/main --stat -- src empty; headline >= 48px, body >= 28px, support photos >= 22vh, zero overflow at 1280x720 / 1366x768 / 1920x1080, zero console errors, zero emoji / Chinese / circled numerals rendered; lightbox index-hold and stop-on-close hold on both ext and local paths; screen 13 end lands before the wall touches the ground (timestamp in files/week-02-clips.md); Draft PR only, never merged
- Loop log (2026-09-02): P0 route files + charter → P1 media (four PD cuts, frames, fonts) → P2 deck assembled from the Week 1 template + delta (SEGMENTS/CLIPS/SLIDES, six mechanisms, sixth tint) → P3 tools/starx-week-2 checker + browser audits → blind audit round 1 on 726ebce (7 should-fix findings) → fixes in 2b8dbda → blind audit round 2 on 2b8dbda (3 new low findings) → fixes in d3e3fd7 → blind audit round 3 on d3e3fd7 (clean; one harness gap fixed in 0bcc399, deck bytes unchanged) → verified on the deployed preview https://feat-starx-week-2-deck.ai-drsfilms.pages.dev/starx-week-2/ (200, noindex + no-store, 301 without slash; 37/37 static checks; zero overflow at 1280x720 / 1366x768 / 1920x1080 incl. revealed states (and at 1024x768 / 1280x800 / 1440x900); six tints; headline 67px / body 28.8px / labels >= 28px at 1080p; pictures >= 22.8vh; zero console errors from the deck; lightbox index-hold + stop-on-close on ext and local, Esc works with the player focused; screen 13 pauses at ~19.14 s, wall on the ground at 19.69 s).
- Review grade: 真盲审 x3 (cold-reader agents, file package, no conversation context), then builder re-verification on the preview. Static HTML; no execution path spends money.
- Gaps carried into the PR: Oz door and Mickey stream from non-official channels (no rights-holder upload exists); Gold Rush 1942-narration and the Jazz Singer line's second not verified by ear; no PD photo of a cinema pianist found (a 1922 Fotoplayer photo with Ben Turpin stands in, captioned as such); plan §I says 25 screens, §C lists 24 — built 24; engine sections 5–6 trimmed to this deck's kinds rather than kept whole; the Film_Teaching repo has no remote, so the manifest commits are local only.
- Handoff: Completed — everything above, Draft PR open. Not completed — nothing in scope; the PR waits for Eric's review of screen 16's timeline line and screen 14's three beats, and for the merge decision (never merged by this session). Where to resume — the PR; copy edits go in public/starx-week-2/index.html SECTION 4 (SLIDES), then `node tools/starx-week-2/dod-check.mjs` and the two browser scripts against the preview. Open questions for Eric — the two copy items; whether the non-official Oz/Mickey embeds stand; whether to swap the Gold Rush embed for the PD silent cut (manifest section A) if the official upload narrates; whether the trimmed engine is acceptable.
AUDIT 0bcc399c2273adeacfbba5988a4ec357b2ab7e2d: three blind-audit rounds by cold-reader agents (file package, no conversation context) → round 1 on 726ebce: 7 should-fix findings (Keaton end point 1–3 frames short of ground contact; posters with player chrome; Esc dead with the player focused; two labels under 28px; screens 2/7 pictures 14.9vh; manifest statements) → fixed in 2b8dbda; round 2 on 2b8dbda: all round-1 items fixed or accurately disclosed, 3 new low findings (picture row spilling outside the DoD sizes; Esc · close clipped since Week 1; diagram/card text under 28px) → fixed in d3e3fd7; round 3 on d3e3fd7: clean on the DoD, two low notes (cosmetic padding intrusion at 720p, left; a test-harness Referer header that blocked the embed in the lightbox test — fixed in 0bcc399, which changes only tools/starx-week-2/lightbox-test.mjs; deck bytes identical to d3e3fd7). Disclosed and not fixed, for Eric: non-official Oz/Mickey channels; engine sections 5–6 trimmed rather than kept whole.
USABLE 0bcc399c2273adeacfbba5988a4ec357b2ab7e2d
