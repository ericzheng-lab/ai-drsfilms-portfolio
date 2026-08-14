# LOOP-STATE — TTL-BP presentation engine repair

Tier: L2
Reason: production route on ai.drsfilms.com; in this repo a merge to the default branch IS the production deploy.

## Loop 0 snapshot (read-only, taken before any mutation)

- Repo: ericzheng-lab/ai-drsfilms-portfolio, base 3f9fb724cec999155dcc3363e2afb812cd1854be
- Live https://ai.drsfilms.com/TTL-BP/ was byte-identical to the deployed source:
  sha256 `9c2afc5de0056e8f3e5de56c84f919d80ef4921213c146fbdc1abec76a685f64`, 1,125,193 B
- Live browser console: `Uncaught SyntaxError: Unexpected token '}'`
- Consequence measured in-browser: `nextSlide` / `prevSlide` / `goToSlide` /
  `updatePresenterUI` all `undefined`; 0 of 18 pagination dots rendered; 18 slides
  in the DOM, only slide 1 reachable; footer PREV/NEXT and arrow keys inert.
- Slide count settled by set difference, not by total: 19 `class="...slide..."` matches
  minus the `slide-wrapper` container = **18** real slides, matching `totalSlides = 18`.

## Root cause

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

## Scope decision — the rotation overlay was never built

70c61c9 added only `@keyframes rotate-hint`. There is no `#rotationOverlay` element, no
`.rotation-overlay` ruleset and no copy anywhere in the file — only the JS that looks for
the element. Authoring investor-facing UI that Eric never reviewed is a product decision,
not an execution one, and the feature has never once run in production. The dead JS and
the orphan keyframes were therefore removed rather than completed. **Open question for
Eric: does he still want force-landscape on mobile?** If yes it needs designing, not
patching.

## DoD

- [x] D1: every inline `<script>` in `public/**/*.html` parses; `npm run check:html` exits 0.
- [x] D2: real browser on the built `dist/` — 18 slides walk 1→18 and back, clamped at both
      ends; `goToSlide(12)` syncs slide, dot and counter; real ArrowRight/ArrowLeft, real
      PREV/NEXT clicks and real pagination-dot clicks all navigate; console errors = 0.
- [x] D3: no guaranteed-null DOM reference left behind (`#rotationOverlay` fully removed).
- [x] D4: regression gate added and proven in both directions — green on the fix, red when
      pointed at the pre-fix file (exit 1).
- [ ] D5: CI green on Node 20 (verified by the Draft PR's `checks` job, not locally —
      Node 20 is not installed on this machine).
- [ ] D6: **merge + live verification — blocked on Eric.** `push` is not `live`.

## Regression gate

`scripts/check-inline-js.mjs` extracts inline scripts the way the HTML parser does (a block
ends at the first literal `</script>`, so a nested opener is a syntax error, not a new block)
and compiles each with `vm.Script` without executing it. Wired as `npm run check:html` and as
a `checks` job in `.github/workflows/deploy.yml` that also runs on `pull_request`, so a break
goes red *before* merge. The deploy job now has `needs: checks` and is guarded to
push-on-default-branch, so a PR still never deploys.

Baseline measured before setting the bar: on the pre-fix tree exactly **1** of 22 HTML files
failed — the TTL-BP block — so "zero broken inline scripts" was already reachable everywhere
else and is not an unmeetable standard.

Extractor validated by set difference: 23 `<script>` openers − 3 with `src` − 1 non-JS
`type` = 19 candidates; the checker reports 18, the difference being the nested opener it
correctly consumes as block text.

## Loop log

- Loop 0: read-only audit of 5 open PRs; found the live breakage while checking PR #6/#4.
- Loop 1: traced root cause commit-by-commit; completed 70c61c9's mis-cut deletion.
- Loop 2: added `scripts/check-inline-js.mjs`; measured baseline; wired into CI.
- Loop 3: browser-verified all navigation paths against the built `dist/`.

## Not done / handed back

- Merge and production verification — Eric's gate.
- Force-landscape overlay — needs a design decision, see above.
- Pre-existing and untouched: this page loads Tailwind from `cdn.tailwindcss.com`, which
  warns that it is not for production. Out of scope here.
- The other four open PRs (#13, #11, #9, #4, #6) — audit delivered, disposition is Eric's.
