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

# LOOP-STATE — Sourced fact archive (bottom layer of the three-layer site plan)

CHARTER: feat/data-archive
- 级别: L2
- DoD: `npm run build` exits 0 AND `npx tsc --noEmit` exits 0 in this worktree; every archive entry carries a non-empty `source`; all proofUrls checked and statuses logged in Evidence below; `git diff work/current -- src/components src/App.tsx public index.html` is empty (additive only); Draft PR open and NOT merged. Blind audit is a merge gate, not a PR gate: this loop ships data only, no execution path imports it yet.
- Loop 0: aef4afe671c1c9b7b59064513df31d652b71ef6a (work/current == origin/main at branch time; working tree clean except registered worktrees)

## What this loop builds
`src/data/archive/` — the single sourced fact layer Eric approved on 2026-08-28
(三层站点架构的底层). Consolidates: receipts.ts (ai-drsfilms-astro
feat/role-pages, blind-audited CLEAN at c88a19f), ukiyo-e v28 content.json
(16 commercial entries), main-branch astro components (TrackRecord/Films/
WhatIBuilt/ToolStack), and 2026-08-27/28 web research with per-URL checks.

## Guardrails
- Additive only: nothing in `src/components`, `src/App.tsx`, `public/`, `index.html` changes.
- Claim locks absolute: Sundance = "World Cinema Dramatic Competition, Grand Jury Prize nominee" (never winner); Berlinale = "Panorama".
- Conflicting or unsourced numbers go to `pending.ts`, never into display-ready fields.
- Never merge, never deploy, never touch the live domain.

## Evidence
- Loop 0 base: aef4afe671c1c9b7b59064513df31d652b71ef6a
- Link check 2026-08-28 (37 URLs, log: scratchpad/linkcheck-archive.txt): 34x HTTP 200; 3x 403 bot-block (slantmagazine x1 — dropped; lbbonline x2 — both browser-verified live 2026-08-28, content read in full).
- LBB 2024-09-13 hire announcement independently confirms: Gold House membership, NIKE/miHoYo/Tencent/NetEase at Final Frontier, "over 13 years" experience as of 2024-09, Shanghai HQ EP role, "more than 50 credits".
- `npx tsc --noEmit` exit 0; `npm run build` exit 0 (pre-commit hook re-ran build on commit and amend).
- Additive-only proof: `git diff work/current --stat -- src/components src/App.tsx public index.html` is empty.
- Review pass 2026-08-28 (grade: 指挥层复核 / command-layer review, NOT a blind audit — data only, no execution path imports the archive; blind audit remains the merge gate): claim-lock greps clean (no winner language outside the warning note; every Berlinale claim says Panorama); dollar figures appear only in pending.ts and one explicit exclusion note (verified with `grep -F` after the `\$` regex proved unreliable under this machine's grep); three press titles fetched verbatim from live pages, one invented-from-slug title corrected before push (variety-trailer-news).

AUDIT d069ae0f9fbc348d83c5a7ea9cf36cd175534d08: command-layer review of the full archive diff against sources — CLEAN at this grade. Blind audit deferred to the merge gate per the two-grades rule (data/documentation loop, nothing executes it).
USABLE d069ae0f9fbc348d83c5a7ea9cf36cd175534d08: build green, tsc clean, archive importable but unimported; Draft PR to follow, never merged without Eric.

