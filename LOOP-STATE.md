# LOOP-STATE — retire the /TTL-BP/ route, keep the inline-JS regression gate

CHARTER: fix/ttl-bp-presentation-engine
- 级别: L2
- 理由: production route on ai.drsfilms.com; in this repo a merge to the default branch IS
  the production deploy, so there is no separate deploy step to catch a mistake.
- DoD: `npm run check:html` exits 0 across 21 HTML files; `public/TTL-BP/` absent from the
  tree and from a fresh `dist/`; zero references to the route in any carrier — link,
  `_redirects`, `_headers`, sitemap, service-worker manifest; after deploy `/TTL-BP/` returns
  the homepage bytes (2,025 B, sha256 `8e4a86b1…`), not the 1,125,193 B page.
- Loop 0: live page sha256 `9c2afc5de0056e8f3e5de56c84f919d80ef4921213c146fbdc1abec76a685f64`,
  1,125,193 B, captured 2026-08-14 before any edit; base
  3f9fb724cec999155dcc3363e2afb812cd1854be. Full snapshot below.

CHARTER: claude/kind-lalande-a8deee
- 级别: L2
- DoD: identical to the block above — same work, same finish line. This is only the worktree
  branch the commit is authored on: `fix/ttl-bp-presentation-engine` was already checked out
  in another worktree, so the commit is made here and pushed to the PR branch.
- Loop 0: the same snapshot —
  sha256 `9c2afc5de0056e8f3e5de56c84f919d80ef4921213c146fbdc1abec76a685f64`.

## What changed mid-flight

This loop started as a repair of the `/TTL-BP/` presentation engine and the repair landed and
was verified. On 2026-08-14 Eric decided the page comes down instead: "ai.drsfilms.com/TTL-BP/
== 可以删了". The repair is therefore superseded and `public/TTL-BP/` is removed.

The regression gate added alongside the repair is **kept**. It guards every inline `<script>`
under `public/`, and the other 21 HTML files are the reason it exists — not TTL-BP.

## Loop 0 snapshot (read-only, taken before any mutation)

- Repo: ericzheng-lab/ai-drsfilms-portfolio, base 3f9fb724cec999155dcc3363e2afb812cd1854be
- Live https://ai.drsfilms.com/TTL-BP/ was byte-identical to the deployed source:
  sha256 `9c2afc5de0056e8f3e5de56c84f919d80ef4921213c146fbdc1abec76a685f64`, 1,125,193 B
- Live browser console: `Uncaught SyntaxError: Unexpected token '}'`
- Consequence measured in-browser: `nextSlide` / `prevSlide` / `goToSlide` /
  `updatePresenterUI` all `undefined`; 0 of 18 pagination dots rendered; 18 slides
  in the DOM, only slide 1 reachable; footer PREV/NEXT and arrow keys inert.

## Root cause (kept as the record of why the gate exists)

Commit 70c61c9 ("Force landscape on mobile", PR #8) intended to delete the touch-swipe
block and add a portrait rotation overlay. The deletion was mis-cut: the head of
`function handleSwipe()` was removed but its tail survived as an orphaned `if` plus a
stray `}`. The same edit deleted the presentation engine's closing `</script>` and
opened a nested `<script>` inside the still-open block.

Regression history, established by syntax-checking every revision of the file:

| commit | state |
|---|---|
| bd652c8, 45723cf | OK |
| **cd75e32 (PR #3)** | **broke** |
| da22a10 (PR #5) | still broken |
| **c33caa2 (PR #7)** | **repaired** |
| 85bcc89 | OK |
| **70c61c9 (PR #8)** | **broke again** — shipped, live since 2026-05-21 |

A syntax error discards the entire `<script>` block at load time, so every function it
defines disappears. Nothing in the pipeline parsed inline JS, so it stayed broken ~3 months.

## Removal completeness audit

The route was an orphan: nothing in the repo linked to it. Each carrier checked individually
rather than inferring from the folder delete.

- Text references to `TTL-BP` outside the folder: **2**, both intentional —
  this file, and the `why this exists` header comment in `scripts/check-inline-js.mjs`.
  No third reference anywhere in `src/`, root `index.html`, `.github/`, or `package.json`.
- `public/_redirects`: no `/TTL-BP` entry (only amazon, amazon-creator, meta, luma, hims,
  code-theory).
- `public/_headers`: no `/TTL-BP/*` rule.
- Sitemap / robots: the only pair in the repo is `public/prompt-builder/{sitemap.xml,robots.txt}`
  and the sitemap lists two prompt-builder URLs only.
- Service worker: the only one is `public/prompt-builder/sw.js`, registered as relative
  `sw.js` from `/prompt-builder/`, so its scope is `/prompt-builder/` and no
  `Service-Worker-Allowed` header exists anywhere to widen it. Its `ASSETS` array lists ten
  prompt-builder paths, none under TTL-BP. It never controlled `/TTL-BP/`, so `CACHE_NAME`
  is deliberately NOT bumped — that would be an unrelated change to another route.
- Returning visitors: live `/TTL-BP/` served `cache-control: public, max-age=0,
  must-revalidate`, so browsers revalidate on every load and no stale copy survives.
- Assets: the page referenced no local files — every image was an inline `data:` URI, and its
  only external links were Google Fonts and `cdn.tailwindcss.com`. Deleting it orphans nothing
  under `public/media`, `public/uploads` or `public/generated`.
- `dist/` is gitignored and untracked (0 files under `dist/` in the index); a fresh build was
  run and checked, see D3.

Two case-insensitive hits for `ttlbp` in `public/code-theory/index.html` and
`public/cloudflare/index.html` were inspected and are base64 noise inside embedded images
(`...h4ttLbPP50...`, `...1TTLbPXhcSy...`), not references.

## DoD

- [x] D1: `public/TTL-BP/` removed (1 file, 1,125,193 B); no reference to the route remains
      in any carrier — link, redirect, header rule, sitemap, robots or service-worker manifest.
- [x] D2: gate kept and re-measured after the deletion, not carried over from the old run:
      `npm run check:html` → `inline-js: PASSED -- 21 HTML file(s), 14 inline script block(s)`,
      exit 0. Zero-tolerance still holds and now covers only pages that remain.
- [x] D3: `npm ci --legacy-peer-deps && npm run build` passes; `dist/` contains no `TTL-BP`
      directory, no path matching `*ttl*`, and no file containing the string. 22 HTML files in
      `dist/` = the 21 under `public/` plus the built root `index.html`.
- [x] D4: gate proven still to bite on a page that remains — an orphan `}` injected into the
      inline block of `public/wonder/index.html` produced
      `inline-js: FAILED -- 1 broken block(s)`, `SyntaxError: Unexpected token '}'`, exit 1.
      File restored; `git status` shows the deletion only.
- [x] D5: CI agrees with the local number on its own Node 20 — run 31856163588 on commit
      403bb8b, `checks` succeeded on Node 20.20.2 with
      `inline-js: PASSED -- 21 HTML file(s), 14 inline script block(s)`, and `deploy`
      correctly reported `skipped` on a `pull_request` event.
- [ ] D6: **merge + live verification — blocked on Eric.** `push` is not `live`.

AUDIT 403bb8b: none — no independent blind audit was run on this commit. Every number above
is self-verified by the commands shown, and CI re-ran the gate independently on Node 20, but
that is the same check, not a second pair of eyes. Weigh D1–D5 accordingly.

USABLE 403bb8b: not yet in effect. The branch is correct and CI is green, but the page is
still live at https://ai.drsfilms.com/TTL-BP/ and stays live until Eric merges — in this repo
merge is the deploy. Nothing else on the site changes when he does.

## How to verify after merge — compare bytes, not status codes

Cloudflare Pages serves the SPA fallback for unknown paths, so a retired route returns **200**,
not 404. Status code proves nothing here. Measured on 2026-08-14 before the change:

- `/TTL-BP/` → 200, 1,125,193 B, sha256 `9c2afc5d…`, title 《流俗地》电影项目路演商业计划书
- a nonexistent control path → 200, 2,025 B, sha256 `8e4a86b1a9e2b1dd05488eaa83d62e10663cb9535984d088308ea5d94b3da722`
- `/` → 200, 2,025 B, **same sha as the control path**

`dist/index.html` from this branch is byte-identical to that live homepage (2,025 B, same
sha256), so after merge `/TTL-BP/` must return those homepage bytes. Passing looks like:

```bash
curl -s https://ai.drsfilms.com/TTL-BP/ | shasum -a 256
```

Pass = `8e4a86b1a9e2b1dd05488eaa83d62e10663cb9535984d088308ea5d94b3da722`.
Fail = `9c2afc5d…` (page still live) — a 200 alone is not evidence either way.

## Loop log

- Loop 0: read-only audit of 5 open PRs; found the live breakage while checking PR #6/#4.
- Loop 1: traced root cause commit-by-commit; completed 70c61c9's mis-cut deletion.
- Loop 2: added `scripts/check-inline-js.mjs`; measured baseline (1 of 22 files failing);
  wired into CI as a `checks` job that also runs on `pull_request`.
- Loop 3: browser-verified all navigation paths against the built `dist/`.
- Loop 4: CI green on Node 20 — run 31847479535, `checks` succeeded, `deploy` correctly
  `skipped` on a `pull_request` event.
- Loop 5: Eric retired the route; deleted `public/TTL-BP/`, audited every removal carrier,
  re-measured the gate at 21 files / 14 blocks and re-proved it red on a remaining page.

## Not done / handed back

- Merge and production verification — Eric's gate. In this repo merge = deploy.
- Force-landscape on mobile: the question is now moot for this page and no longer open.
- `/TTL-BP/` will fall through to the homepage rather than 404 or redirect. No `_redirects`
  entry was added — where a stale link should land is Eric's call, not an execution one.
- Git history is untouched. This repo is public and the BP still exists in earlier commits;
  what to do about that is a separate decision and was not part of this loop.
- The other open PRs (#13, #11, #9, #6, #4) — audit delivered, disposition is Eric's.
