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
   slug, not a homepage); selected work ids; no skip/omit/waive language
   for Profile or CL.
2. **R-VI** — VI distill record has source URL + date + exact hex / font /
   radius **and usage notes** (how the primary is a wordmark/field on the
   canvas). Empty or “similar to” = REJECT. Missing provenance = REJECT.
   Hex/font without USAGE = token-only = REJECT. When profile HTML is
   present, the primary hex must be applied as a real field/wordmark —
   10px labels on a black/white résumé (Giant Spoon-like tokens + B/W
   page) = REJECT. Do not invent extra colors the site does not have.
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
   `A-FILM-*`) on the public page are `REJECT`. P-led `A-WORKFLOW-6STAGE`
   must be one PNG/SVG + locked footnote (not a text grid / 7-stage).
   Invocation must match the JD archetype (see matrix below). Images
   are not optional; there is no waiver.
   `--fetch-profile` is how the CLI obtains live evidence; 4xx /
   5xx / timeout / error is `FAIL` (not PASS). Self-test may inject a
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
| `fixtures/fail-vi-tiny-labels` | R-VI / R2 `REJECT` (usage present; primary only in 10px labels on a B/W résumé) |
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
| `fixtures/pass-a-led-wonder` | R2 `ACCEPT` (A-led films first + tools strip + 58-node) |
| `fixtures/pass-minimal-three` | mechanical `ACCEPT` on R3 (`https://ai.drsfilms.com/acme/`) |

## Asset invocation matrix

Do not copy HyperAgent files into this repo. Name the asset id and the rule.

| Archetype | Invoke | Forbidden |
|---|---|---|
| **P-led** (agency Senior Producer) | `A-SHOWREEL-TRAD` as a *21:9 poster + play*; brand *stills*, not wordmarks; `A-WORKFLOW-6STAGE` as one reskinned PNG/SVG + locked footnote; `A-TOOL-PROMPTBUILDER` last, one card | text showreel card; legal-paragraph credits; empty white work cards; `A-WORKFLOW-58NODE` / 7-stage; in-dev tool wall before/taller than the trad reel; visible `A-*` ids; Klein Blue only as 10px labels |
| **O-led** | `A-WORKFLOW-6STAGE` first | `A-WORKFLOW-58NODE` unless the JD asks for process depth |
| **A-led** (Wonder is the exam) | `A-FILM-*` first, then a tools strip with *In development* labels; `A-WORKFLOW-58NODE` **allowed** | tools before films |

All fixture people, emails, companies, and sentences are synthetic.

## Claim-locks (mechanical)

These strings must fail if they appear in CV or CL:

- “Sundance” + won / winner / 获奖
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
