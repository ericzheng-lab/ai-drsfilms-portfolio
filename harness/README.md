# Career hop harness

Quality gate for the apply chain. It lives in this checkout because Cursor
ships role Profiles from here:

`public/{company}/index.html` → `https://ai.drsfilms.com/{company}/`

```
JD → Brief → CV + cover letter + company Profile → closeout
```

This is **not** a job application, **not** a résumé pack, **not** ATS
automation, and **not** a restyle of the public site. A hop that finishes
without a hard verify did not happen.

## Why here, not career-ops

The checker canon has to sit next to the pages it judges. The live Apply
piece is the company route on this host. Putting the gate in career-ops
is how Profile became optional in production: the dashboard could move
on while `ai.drsfilms.com/{company}/` was never shipped.

career-ops remains scrap / dashboard only. Do not move this CLI there.

HyperAgent already had a partial harness (`career-application-loop`:
check.js + rules v1.3). It failed because:

1. It lived as cloud skill scripts, not a git-tracked gate.
2. It did not hard-stop the *chain* when Profile was skipped.
3. The builder could declare “this role does not need a Profile.”

Treat that loop as **failure cases to encode**, not files to paste.

The CLI is `harness/` at repo root: standalone Node, zero extra deps,
runnable without building the Vite site. Existing `public/` pages are
out of scope for this PR.

## Locked product rules

An Apply package is always three live pieces:

1. Role-specific CV
2. Cover letter (file must exist even if an ATS has no cover field)
3. Company Profile URL of the form `https://ai.drsfilms.com/{company}/`
   (trailing slash normalized)

Generic homepage is **REJECT**: `drsfilms.com`, `www.drsfilms.com`,
`ai.drsfilms.com`, `ai.drsfilms.com/`, prompt-builder home, LinkedIn, or a
bare domain.

**Nobody** — including this harness, this README, or a Brief `waivers[]`
field — may waive Profile or cover letter. There is no `--waive` flag.
Recover = fix the failing hop and re-run **that same hop**. Never waive and
proceed.

Anti-AI-slop is a first-class hop dimension (P1 `REPAIR`), not “looks fine.”
Mechanical P0 FAIL is `REJECT`. Stop. Do not continue to a judgment score as
if it passed.

Do not apply to jobs, fill an ATS, submit anything, write a real 9_CV pack,
or restyle the public site from this tree. Fixtures are synthetic/redacted
only. Do not invent biography, emails, metrics, or project facts.

## Algebra

| Verdict | Meaning | Exit |
|---|---|---|
| `ACCEPT` | That hop’s required checks are green | `0` |
| `REJECT` | Mechanical P0 FAIL. Stop. | `1` |
| `REPAIR` | Not ACCEPT. Cannot advance the chain. | `2` |
| usage | Bad args | `64` |

`--self-test` exits `0` when units + fixtures pass, else `1`.

A later hop **cannot** be marked `ACCEPT` unless required earlier hops have
harness-generated `ACCEPT` reports bound to **this** package directory and
the current input-file hashes (same run or disk). Handwritten
`{"verdict":"ACCEPT"}`, cross-package copies, and stale reports after an
input change are `REJECT`.

Hop order:

1. **R0 Brief** — names CV, cover letter, and a Profile *route* (company
   slug, not a homepage); `selected_work_ids` lead-first; `page_slots`
   (or equivalent frontmatter) with `archetype`, `lead`, `second`,
   `supporting`, `omit`; no skip/omit/waive language for Profile or CL.
   Missing slot order is `REJECT` (`brief-page-slots`). A P-led
   agency/producer Brief whose `lead` is indie-film-only while ads/reel
   ids are in the list is `REJECT` (`brief-lead-matches-archetype`).
   A lead id with no dual-gate still is `REPAIR`
   (`brief-lead-assets-clearable`) — later hops may not substitute
   another category (film for ads). Allowed Vimeo embeds that count
   as a hang when INDEX has no still: Coach `190660903`, trad reel
   `1174467043`. Page composition is locked here, not after the
   Profile exists.
2. **R-VI** — VI distill record has source URL + date + exact hex / font /
   radius **and usage notes** (how the primary is a wordmark/field on the
   canvas). Empty or “similar to” = REJECT. Missing provenance = REJECT.
   Hex/font without USAGE = token-only = REJECT. A **chrome-only**
   Giant Spoon distill is REJECT even if hex/font match (official
   giantspoon.com audit, 2026-08-18). Home hero type-only white is
   chrome, not the brand; the record must include work/case pages
   (full-bleed autoplay video cards, per-project duotone scrims, real
   gradients, Yeti #D26403, HBO oxblood/black, 6 videos + 29 images,
   zero illustration). When profile HTML is present, the primary hex
   must be applied as a real field/wordmark — a black/white/navy
   résumé page is R-VI FAIL even when tokens match.
3. **R1 CV** — file exists; claim-lock + slop lexicons; header/contact
   cannot use a generic homepage as the portfolio URL.
4. **R1b CL** — file exists; same slop / claim-lock checks. Cannot be waived.
5. **R2 Profile** — qualifying **live** evidence: HTTP 2xx **and** a
   company-name or slug marker in the response body. Local `profile.html`
   or a well-formed `profile_url` is **not** enough. Cloudflare/SPA `200`
   empty shells are `FAIL`. URL must be the company route (slug may match
   `slugify(company)` or a *trusted* alias: built-in legal-name map, or
   a shortening/token of the company name). Manifest `company_aliases`
   cannot point at another company's slug. Live marker prefers route/slug
   path identity; tiny tokens like `Meta` must not match `metadata`.
   HTML, when present, still gets structure + noindex + claim-lock/slop
   checks, and **must contain real work stills** (`<img>` with a real src).
   Text-only pages, empty/placeholder/decorative marks, and local HTML
   without stills are `REJECT` (`_CAREER` B-C6 / B-P3 / B-WKS4). A
   `.hero` / `header` with `min-height >= 70vh` and no still in that
   hero is `REJECT` even if a thumb appears later (B-C6 blank first
   viewport; Giant Spoon #18). A type-only open with stills after 80
   words of body copy is `REJECT` (Wonder/Kalshi class; B-C6 / B-WKS4).
   Fewer than 4 real work images is `REJECT` (B-WKS4). A    leftover
   70vh+ `.hero` shell is `REJECT` even with an image inside (B-C5
   patch-on-old-shell). A company homepage skin without a role and
   work-sample titles is `REJECT` (B-EL1). Token-only VI application
   (primary only in tiny labels) is `REJECT`. A showreel described in a
   paragraph (`A-SHOWREEL-TRAD · IN-CARD`) is `REJECT` — the reel must
   be a *21:9 poster + play*. Brand credits as a legal grey wall or as
   typeset wordmarks are `REJECT`. Empty white work cards are `REJECT`.
   Visible internal asset ids (`A-SHOWREEL-TRAD`, `A-WORKFLOW-6STAGE`,
   `A-WORKFLOW-58NODE`, `A-TOOL-PROMPTBUILDER`, `A-TOOLS-DEV4`,
   `A-FILM-*`) on the public page are `REJECT`. An outward image
   requires `assets.json` `external_ready:true` **and** drs-source
   INDEX `public:true` (catalog: `rules/asset-clearance.json`). Text
   may cite a READY-but-private asset; the file cannot hang.
   `A-WORKFLOW-58NODE` may be hung only on `/wonder/` until a generic
   public version exists. `A-TOOLS-DEV4` screenshots are all
   `public:false`; an In-development label does not waive INDEX.
   `prompt-builder-ui-01` is the only public:true product shot today.
   `A-WORKFLOW-6STAGE` is READY on Drive but not in DRS INDEX:
   non-Wonder pages must reskin; never mix 6 vs 7/58 in captions.
   P-led: not the lead; method slot only if the JD has process/gates
   as must-or-should and the strip is a picture. O-led: required
   (DOC-6/R8). A-led: supporting only.    P-led pages may not hang a
   Prompt Builder gallery. Invocation must match the JD archetype
   (see matrix below). Every new Profile is judged against the
   **newest 3 still-first** shipped `public/*/index.html` peers (last git
   commit that touched the file; mtime if git is unavailable). Skip
   type-wall / Thread B pages whose first viewport is type, not a
   still/reel poster. Manifest `compared_to` must record that same
   still-first set (`r2-profile-recent-bar` / R3 echo). Timestamp-only
   newest-3 that are type-first while a still-first peer exists is
   `REJECT`. First
   viewport / first work row must match Brief `page_slots.lead` (ids
   or named category: trad reel, brand spot). A page that is only film
   stills while Brief lead is ads/reel is `REJECT`
   (`r2-profile-follows-brief-slots`).    `/giant-spoon/` must follow
   Brief `page_slots` (ads/reel first). A P-led ads Brief whose first
   viewport is a FILM PRODUCER / film-slate wordmark fighting
   “advertising showreel” is `REJECT` (`r2-profile-lead-not-film-slate`).
   P-led AI film stills (OCM/Manga/DoomBrush) that are larger, earlier,
   or more numerous than ads lead frames are `REJECT`
   (`r2-profile-ai-must-not-dominate`). A
   text/résumé page (0 work images / empty first viewport) is `REJECT`
   when any of those 3 has a first-viewport still. Work column capped
   `min(1120px, calc(100% - 40px))` (1080–1240 band);
   `100vw` work img/iframe/video is `REJECT` (`r2-profile-max-width`).
   Wordmark/nav may be a full row. Images are not optional; there is no waiver.
   `--fetch-profile` is how the CLI obtains live evidence; 4xx /
   5xx / timeout / error is `FAIL` (not PASS). When `--fetch-profile`
   succeeds against `https://ai.drsfilms.com/{company}/`, profile
   content gates judge the **live** body. A stale package `profile.html`
   (old 78vh spacer) must not flip R2/R3 to `REJECT` if live would
   `PASS`. Local-only runs (no fetch) still judge local HTML. Self-test
   may inject a
   qualifying `fetchResult` so fixtures do not need the public internet.
6. **R3 Closeout** — `ACCEPT` means CV + cover letter + a *real* company
   Profile exist and match **this** package *now* (qualifying live
   evidence, bound, fresh). Prior hop reports must be harness-generated,
   bound to this `package_dir` + current file hashes, and reproduce a
   live hop re-run (id+PASS stubs are REJECT).    Disk `ACCEPT` reports
   **cannot** waive content gates: R3 independently re-runs claim-lock,
   slop, skip-language, waiver, and R-VI provenance (source URL, date,
   exact hex/font/radius, usage notes, no "similar to", primary applied
   as field/wordmark) on current files. CV/CL must
   cite that Profile URL. Missing any piece = REJECT.

## Supervisor contract — exact commands

From the **repo root**. Set `PACKAGE` to the apply-package directory
(it must contain `manifest.json`).

```bash
# R0 Brief
node harness/cli.js --hop R0 --package "$PACKAGE"

# R-VI
node harness/cli.js --hop R-VI --package "$PACKAGE"

# R1 CV
node harness/cli.js --hop R1 --package "$PACKAGE"

# R1b cover letter
node harness/cli.js --hop R1b --package "$PACKAGE"

# R2 Profile
node harness/cli.js --hop R2 --package "$PACKAGE"

# R3 Closeout — required before any ATS fill
node harness/cli.js --hop R3 --package "$PACKAGE"

# Supervisor verify — MUST run before ATS fill (re-runs R3 live)
node harness/cli.js --verify --hop R3 --package "$PACKAGE"
# equivalent:
node harness/cli.js --hop R3 --verify --package "$PACKAGE"

# Whole chain (stops on first non-ACCEPT)
node harness/cli.js --hop chain --package "$PACKAGE"

# Gate check (CI / local)
node harness/cli.js --self-test
npm test
```

Optional:

```bash
node harness/cli.js --hop R2 --package "$PACKAGE" --fetch-profile
node harness/cli.js --hop R3 --manifest "$PACKAGE/manifest.json" --json
```

`--fetch-profile` treats HTTP 2xx **plus** a company/slug marker in the
body as live evidence. SPA `200` empty shells, 4xx, 5xx, timeout, and
transport error are `FAIL` (P0), not a silent PASS. Default CLI without
`--fetch-profile` (and without a test-injected `fetchResult`) `REJECT`s
ghost URLs even when local `profile.html` exists.

Reports are written to `$PACKAGE/reports/<HOP>.json` unless `--reports` is
set. Those files are harness-generated and include a binding over
`package_dir` + input hashes. Forged or stale reports cannot unlock R3.

### Supervisor hard stop

Supervisors **MUST** call `--verify` (or a fresh `--hop R3`) before any
ATS fill. Never treat a disk `reports/R3.json` `verdict` field as
sufficient — a handwritten `{"verdict":"ACCEPT"}` can fool a reader that
only opens the file.

`--verify --hop R3` re-runs R3 live, re-derives `decideVerdict` from those
live checks, and exits `0` only if live R3 is `ACCEPT`. If
`$PACKAGE/reports/R3.json` is missing, handwritten / not
harness-generated, or its `verdict` disagrees with the live derive,
`--verify` is `REJECT` (nonzero).

If `$PACKAGE/reports/R3.json` is missing, not harness-generated, not bound
to this package's current input hashes, or `verdict` is not `ACCEPT`,
**refuse** to fill an ATS, refuse to submit, and refuse to treat the
package as ready. R3 `ACCEPT` is live / bound / fresh: CV + CL + a real
company Profile exist and match this package now. Tell the operator which
hop to recover. Do not invent a waiver.

This CLI will not apply, submit, or restyle `public/` for you.

### Supervisor first-viewport screenshot

First-viewport screenshot compare is a **supervisor check**, not CI.
Career Manager / Mac takes the shot of `https://ai.drsfilms.com/{company}/`
and compares it to the still-first bar. This repo has no Playwright;
`--self-test` does not open a browser. The mechanical stand-in is a
cheap HTML heuristic: the first 800px of body text/images must be
still-led (work `<img>` / reel poster / in-page Vimeo before a type-wall).
A type-first Thread B page is not the recent bar.

## How a Cursor Profile PR drops an R2 report

1. Put role-specific Profile HTML at `public/{company}/index.html` and
   record `profile_url` as `https://ai.drsfilms.com/{company}/`
   (optional local copy via `manifest.profile_html`).
2. From repo root:

   ```bash
   node harness/cli.js --hop R2 --package "$PACKAGE"
   ```

3. Commit the Profile artifact **and** `$PACKAGE/reports/R2.json` only when
   that file says `"verdict": "ACCEPT"`.
4. Later hops (including R3) read that report from disk. `REJECT` / `REPAIR`
   on R2 means R3 cannot `ACCEPT`.
5. If R2 is `REPAIR` or `REJECT`, fix the Profile and re-run **R2**. Do not
   skip to closeout. Do not restyle unrelated `public/` routes.

## Manifest schema

See `schema/package-manifest.schema.json`. Required fields:

| Field | Role |
|---|---|
| `company` | Company name |
| `role` | Role title |
| `brief` | Path to Brief |
| `cv` | Path to CV |
| `cl` | Path to cover letter |
| `profile_url` | Company Profile URL |
| `profile_html` | Optional local HTML (not sufficient for R2/R3 ACCEPT) |
| `company_aliases` | Trusted shortenings only (whole token or hyphen-boundary prefix of `company`, or built-in map). Prefix collisions inside a longer token (Metaphor + meta) and foreign slugs are ignored. |
| `vi` | VI distill record (required for R-VI) |
| `compared_to` | Newest 3 **still-first** shipped `public/{company}/` routes this Profile was built against (skip type-wall / Thread B). `r2-profile-recent-bar` ACCEPT only when this matches that still-first bar. |
| `waivers` | **Forbidden** for Profile / CL. Presence is P0 REJECT. Novel skip/omit/optional/defer keys are also REJECT. |

Paths are relative to the package directory.

## Fixtures

| Package | Expected |
|---|---|
| `fixtures/fail-skip-profile` | R3 `REJECT` (no Profile URL/HTML) |
| `fixtures/fail-generic-homepage` | R2 or R3 `REJECT` (`ai.drsfilms.com/` root) |
| `fixtures/fail-missing-cl` | `REJECT` (no cover letter file) |
| `fixtures/fail-text-only-profile` | R2 `REJECT` (Profile HTML has no real work stills) |
| `fixtures/fail-empty-hero-profile` | R2 `REJECT` (78vh / min-height hero spacer, no still in first viewport) |
| `fixtures/fail-late-stills-profile` | R2 `REJECT` (type-only open; stills below 80 words) |
| `fixtures/fail-thin-stack-profile` | R2 `REJECT` (fewer than 4 real work stills) |
| `fixtures/fail-ai-only-profile` | R2 `REJECT` (no traditional film/showreel credits) |
| `fixtures/fail-ai-lead-profile` | R2 `REJECT` (AI title in the lead slot) |
| `fixtures/fail-ai-order-profile` | R2 `REJECT` (AI stack not OCM → Manga Cut → DoomBrush) |
| `fixtures/fail-folded-vimeo-profile` | R2 `REJECT` (traditional Vimeo only in a modal) |
| `fixtures/fail-patched-shell-profile` | R2 `REJECT` (78vh hero shell kept; image stuffed in) |
| `fixtures/fail-homepage-skin-profile` | R2 `REJECT` (company homepage skin, no role/work titles) |
| `fixtures/fail-vi-token-only` | R-VI `REJECT` (Giant Spoon-like hex/font, no usage notes) |
| `fixtures/fail-vi-chrome-only` | R-VI `REJECT` (hex/font/usage match chrome; work/case content missing) |
| `fixtures/fail-vi-home-hero-brand` | R-VI `REJECT` (type-only white home hero treated as the brand) |
| `fixtures/fail-vi-bw-navy-resume` | R-VI `REJECT` (complete distill + black/white/navy résumé HTML) |
| `fixtures/fail-vi-tiny-labels` | R-VI / R2 `REJECT` (usage present; primary only in 10px labels on a B/W résumé) |
| `fixtures/pass-vi-gs-content-distill` | R-VI `ACCEPT` (chrome + work/case content from the 2026-08-18 audit) |
| `fixtures/fail-text-showreel-card` | R2 `REJECT` (showreel described in a paragraph / iframe-only) |
| `fixtures/fail-legal-credits-profile` | R2 `REJECT` (brand marks as a legal grey wall) |
| `fixtures/fail-internal-asset-ids` | R2 `REJECT` (visible `A-SHOWREEL-TRAD` / `A-WORKFLOW-6STAGE`) |
| `fixtures/fail-p-led-58node` | R2 `REJECT` (P-led page invoked `A-WORKFLOW-58NODE`) |
| `fixtures/fail-p-led-indev-wall` | R2 `REJECT` (P-led in-dev tool wall) |
| `fixtures/fail-o-led-58node` | R2 `REJECT` (O-led `A-WORKFLOW-58NODE` without JD process depth) |
| `fixtures/fail-a-led-tools-first` | R2 `REJECT` (A-led tools before `A-FILM-*`; Wonder exam) |
| `fixtures/fail-empty-white-cards` | R2 `REJECT` (work-card / brand row with no still) |
| `fixtures/fail-showreel-not-21x9` | R2 `REJECT` (showreel img is not 21:9 + play) |
| `fixtures/fail-brand-wordmarks` | R2 `REJECT` (COACH/Nike/BMW as typeset wordmarks) |
| `fixtures/fail-p-led-7stage` | R2 `REJECT` (7-stage on Senior Producer) |
| `fixtures/fail-p-led-6stage-text` | R2 `REJECT` (P-led 6-stage as a text grid) |
| `fixtures/fail-indev-before-reel` | R2 `REJECT` (in-dev tools before the trad reel) |
| `fixtures/fail-private-asset-hung` | R2 `REJECT` (INDEX `public:false` file hung) |
| `fixtures/fail-dev4-indev-label` | R2 `REJECT` (DEV4 hung; in-dev label does not waive) |
| `fixtures/fail-58node-off-wonder` | R2 `REJECT` (58-node file hung off `/wonder/`) |
| `fixtures/fail-6stage-drive-original` | R2 `REJECT` (Drive original hung; must reskin) |
| `fixtures/fail-6stage-caption-mix` | R2 `REJECT` (6-stage caption mixed with 7/58) |
| `fixtures/fail-o-led-missing-6stage` | R2 `REJECT` (O-led missing 6-stage picture) |
| `fixtures/fail-p-led-pb-gallery` | R2 `REJECT` (P-led Prompt Builder gallery) |
| `fixtures/fail-stale-classic-bar` | R2 `REJECT` (`compared_to` is elevenlabs+luma while a newer peer exists) |
| `fixtures/fail-typewall-as-recent-bar` | R2 `REJECT` (timestamp-only newest 3 are type-wall / Thread B while a still-first peer exists) |
| `fixtures/pass-recent-bar` | `r2-profile-recent-bar` `ACCEPT` (`compared_to` matches the newest 3 in the fixture tree) |
| `fixtures/fail-brief-lead-not-clearable` | R0 `REPAIR` (`brief-lead-assets-clearable`; lead cannot hang dual-gate still or allowed Vimeo) |
| `fixtures/fail-full-bleed-profile` | R2 `REJECT` (`r2-profile-max-width`; work img/iframe/video is `100vw`) |
| `fixtures/pass-still-first-live-over-stale` | R2 `ACCEPT` when fetch is on (still-first `compared_to` + capped wrap + live body wins over stale local 78vh exam HTML) |
| `fixtures/fail-brief-no-slots` | R0 `REJECT` (no `page_slots` / slot order) |
| `fixtures/fail-p-led-film-lead` | R0 `REJECT` (P-led agency producer, lead = BHOAF only while ads/reel ids are listed) |
| `fixtures/fail-page-ignores-brief-lead` | R2 `REJECT` (Brief lead = reel+coach; HTML is four BHOAF cards) |
| `fixtures/fail-p-led-film-slate` | R2 `REJECT` (`r2-profile-lead-not-film-slate`; saved copy of live `/giant-spoon/` — FILM PRODUCER title card hung as the ads reel poster) |
| `fixtures/fail-p-led-ai-dominate` | R2 `REJECT` (`r2-profile-ai-must-not-dominate`; same live page — three-tile OCM/Manga/DoomBrush hero) |
| `fixtures/pass-brief-slots-lead` | R2 `ACCEPT` (slots present; first work matches Brief lead) |
| `fixtures/pass-a-led-wonder` | R2 `ACCEPT` (A-led films first + tools strip; 58-node *text* cite) |
| `fixtures/pass-wonder-58node` | R2 `ACCEPT` (58-node *file* legal on `/wonder/`) |
| `fixtures/pass-minimal-three` | mechanical `ACCEPT` on R3 (`https://ai.drsfilms.com/acme/`) |

## Asset invocation matrix

Do not copy HyperAgent files into this repo. Name the asset id and the rule.

| Archetype | Invoke | Forbidden |
|---|---|---|
| **P-led** (agency Senior Producer) | `A-SHOWREEL-TRAD` as a *21:9 poster + play* + brand hang (still, or Coach in-page Vimeo if INDEX has no still); `A-WORKFLOW-6STAGE` in the method slot only if the JD has process/gates as must-or-should, as one reskin picture; Prompt Builder at most one public screenshot | text showreel; legal-paragraph credits; empty white cards; 58-node *file*; DEV4 suite; Prompt Builder gallery / tools wall; 7-stage; in-dev wall before/taller than the reel; visible `A-*` ids; Drive original 6-stage; Klein Blue only as 10px labels |
| **O-led** | `A-WORKFLOW-6STAGE` required (DOC-6/R8), one picture | `A-WORKFLOW-58NODE` file (unless `/wonder/` or generic public); 58-node without JD process depth |
| **A-led** (Wonder is the exam) | `A-FILM-*` first, then a tools strip; 58-node *file* only on `/wonder/` until generic public:true; 6-stage supporting only | tools before films; 58-node file off `/wonder/`; DEV4 screenshots |

All fixture people, emails, companies, and sentences are synthetic.

## Claim-locks (mechanical)

These strings must fail if they appear in CV or CL:

- “Sundance” + won / winner / 获奖 (nominee is allowed; 禁止 / forbid-list
  lines that name the lock do not trip)
- Berlinale as a win
- “Dungeon Fighter” without `&` (`Dungeon & Fighter` is allowed)
- RMB / CNY money
- `P007` as an external product name
- five-films-in-four-weeks style claims

Further locks: add only from a **named real leak**. See
`TODO_additional_claim_locks` in `rules/rules.json`. Do not invent biography
here.

## Rules / contracts

- `rules/rules.json` — versioned, named-failure rules only
  (skip-Profile, generic homepage, missing CL, claim-lock leaks, slop
  lexicon from the apply-doc shared list).
- `rules/contracts.json` — hop order, algebra, exit codes, non-waivable
  artifacts.
- `rules/integrity.pin` — git-tracked SHA-256 of rules + `harness/lib/*.js`
  (except `self-test.js`) plus the required-rule assertion table. Compared
  from `lib/integrity.js` / `loadRuleset()`, not only from excluded
  `self-test.js`. Honesty pin, not an external HSM.

New rules only from named real failures. Do not dump speculative L0 lists.

## What this CLI will not do

- Apply to jobs
- Fill or submit an ATS form
- Write a real 9_CV application pack
- Invent emails, phone numbers, metrics, or project facts
- Restyle or rewrite existing public site pages
- Accept a homepage as a Profile
- Honor a Profile or cover-letter waiver
