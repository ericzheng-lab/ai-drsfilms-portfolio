import type { Evidence } from './types';

/**
 * ⛔ PROVENANCE FILE — NEVER import this from any page, component, or
 * client-side module. Anything imported by a page ships verbatim in the
 * public JS bundle (confirmed 2026-08-29: evidence notes, private repo
 * names and local paths leaked into assets/homeNext-*.js before this file
 * existed). Sources, verification notes, internal paths, session ids and
 * unproduced concepts live HERE; the sibling data files carry display-safe
 * fields only.
 *
 * Invariant: every entry id in the data files has a key here. Checked by
 * the review pass, not by the compiler.
 *
 * Source shorthand:
 *  V29    = ai-drsfilms-astro repo, public/ukiyo-e-v29/hero-inline.html
 *           @ feat/ukiyo-e-v29-branding-ttl (blind-audited via receipts.ts
 *           at c88a19f on feat/role-pages)
 *  V28    = drs-source/_incoming/ukiyo-e-v28/content.json
 *  ASTRO  = ai-drsfilms-astro repo @ main, src/components/
 */

export const sources: Record<string, Evidence> = {
  // ---- films ---------------------------------------------------------------
  'brief-history-of-a-family': {
    source:
      'V29:4179-4188 (facts), :4214-4221 (credits), :1054 (trailer URL); V28 feature block; producer trio per Wikipedia (web research 2026-08-27)',
    verification: 'public',
    checkedAt: '2026-08-28',
    note:
      'WARNING recorded twice (2026-08-27 and 2026-08-28): search-engine AI summaries assert the film WON the Grand Jury Prize. It did not — Sujo won; Wikipedia awards table says "Nominated". Never write festival copy from search results.',
  },
  'brief-history-rt': {
    source: 'web research 2026-08-27 (rottentomatoes.com, opened at source)',
    verification: 'public',
    checkedAt: '2026-08-27',
  },
  'brief-history-metascore': {
    source: 'web research 2026-08-27 (metacritic.com, opened at source)',
    verification: 'public',
    checkedAt: '2026-08-27',
  },
  'this-timeworn-land': {
    source:
      'ASTRO Films.astro; producer trio and official support wording per SIFF PROJECT 2026 public record (web research 2026-08-27); site HTTP 200 2026-08-28',
    verification: 'public',
    checkedAt: '2026-08-28',
    note:
      'Support wording is 海纳, NOT 海纳百川 (a repo note elsewhere has it wrong). Budget figures ($340K / $3.4M track) from Films.astro are NOT entered — see pending.ts.',
  },
  // festival record (key: fest:<festival>:<year>) — all V29:4195-4213
  'fest:Cairo International Film Festival:2024': { source: 'V29:4196', verification: 'self' },
  'fest:Noir in Festival:2024': { source: 'V29:4197', verification: 'self' },
  'fest:Jakarta World Film Festival:2024': { source: 'V29:4198', verification: 'self' },
  'fest:Beijing International Film Festival:2024': { source: 'V29:4199', verification: 'self' },
  'fest:Zurich Film Festival:2024': { source: 'V29:4200', verification: 'self', note: 'V28 wording variant: "Jury Special Mention"' },
  'fest:Athens International Film Festival:2024': { source: 'V29:4201', verification: 'self' },
  'fest:SIFF PROJECT · Shanghai:2018': { source: 'V29:4202', verification: 'self' },
  'fest:Sundance Film Festival:2024': { source: 'V29:4205; Wikipedia awards table (web research 2026-08-27)', verification: 'public', checkedAt: '2026-08-28' },
  'fest:Berlinale:2024': { source: 'V29:4206', verification: 'public', note: 'Panorama selection is public record (Screen Daily, Variety)' },
  'fest:EnergaCAMERIMAGE:2024': { source: 'V29:4207', verification: 'self' },
  'fest:Golden Rooster Awards:2025': { source: 'V29:4208', verification: 'public', note: 'Nominations belong to writer (Lin Jianjie) and supporting actor (Zu Feng) — display must attribute them to the film.' },
  'fest:Stockholm International Film Festival:2024': { source: 'V29:4209', verification: 'self' },
  'fest:Singapore International Film Festival:2024': { source: 'V29:4210', verification: 'self' },
  'fest:Hong Kong International Film Festival:2024': { source: 'V29:4211', verification: 'public', note: 'HKIFF selection in public record (web research 2026-08-27)' },
  'fest:Karlovy Vary · Sydney:2024': { source: 'V29:4212', verification: 'self' },

  // ---- press (all HTTP-checked 2026-08-28; log: session scratchpad) --------
  'variety-review': { source: 'web search 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'thr-review': { source: 'web search 2026-08-28; title fetched verbatim from page', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'screendaily-review': { source: 'web search 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'filmstage-review': { source: 'web search 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'scmp-review': { source: 'web search 2026-08-28; title fetched verbatim from page', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'paste-review': { source: 'web search 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'variety-debut-news': { source: 'web search 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'variety-trailer-news': { source: 'web search 2026-08-28; title fetched verbatim from page (earlier slug-derived title was wrong and corrected)', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'wikipedia-film': { source: 'web research 2026-08-27, re-checked 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'lbb-eric-joins-ff': { source: 'browser-verified 2026-08-28 (full text read)', verification: 'public', checkedAt: '2026-08-28', note: 'curl returns 403 (bot block); loads normally in a browser.' },
  'lbb-naraka': { source: 'browser-verified 2026-08-28 (full text read)', verification: 'public', checkedAt: '2026-08-28', note: 'curl returns 403 (bot block); loads normally in a browser.' },
  'stash-naraka': { source: 'web search 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'press-negative-findings': {
    source: 'web searches 2026-08-28',
    verification: 'public',
    note:
      'Deadline: no coverage of Brief History of A Family found — do not cite. Slant review exists but 403s to automated checks — left out. Getty holds a Sundance 2024 premiere photo of Eric — LICENSED: link only, never embed. Personal Berlinale/Sundance photo folder awaited from Eric (pending.ts: photos-folder).',
  },

  // ---- commercials (V28 commercial[]; V29 proof URLs) ----------------------
  '3i-robotics-brand-film': { source: 'V28; V29:4155; finalfrontier.tv credit block', verification: 'public', checkedAt: '2026-08-28', note: 'finalfrontier.tv names Eric among the executive producers.' },
  'riot-lol-mobile-anniversary': { source: 'V28; finalfrontier.tv project page', verification: 'public', checkedAt: '2026-08-28', note: 'Public credit reads "Lead Producer: Eric Zheng" — stronger than the V28 "Producer". Use the public wording.' },
  'netease-naraka-asian-games': { source: 'V28; LBBOnline (browser-verified 2026-08-28); also stashmedia.tv and finalfrontier.tv project page', verification: 'public', checkedAt: '2026-08-28', note: 'LBB quotes "Final Frontier executive producer Eric Zheng" on this film.' },
  'mihoyo-clockboy-world': { source: 'V28; V29:4158', verification: 'self', checkedAt: '2026-08-28', note: 'Possibly the same film as "Tick-Tock! Let\'s Dream Together!" (Honkai: Star Rail) where finalfrontier.tv lists Eric among EPs — if Eric confirms, upgrade to public. pending.ts: clockboy-ticktock.' },
  'coach-brand-film': { source: 'V28; V29:4151', verification: 'self', checkedAt: '2026-08-28', note: 'No public credit found (2026-08-27 research).' },
  'beats-flex': { source: 'V28; V29:4152', verification: 'self', checkedAt: '2026-08-28', note: 'No public credit found (2026-08-27 research).' },
  'vivo-x-series': { source: 'V28; V29:4153', verification: 'self', checkedAt: '2026-08-28', note: 'Name not found in X80/X90/X100 public credit blocks (2026-08-27 research).' },
  'vivo-s17': { source: 'V28', verification: 'self' },
  'innisfree-white-peony': { source: 'V28; V29:4154', verification: 'self', checkedAt: '2026-08-28', note: 'No public credit found (2026-08-27 research).' },
  'tencent-dnf': { source: 'V28; V29:4156', verification: 'self', checkedAt: '2026-08-28', note: 'No public credit found (2026-08-27 research).' },
  'riot-lunar-god': { source: 'V28; V29:4157', verification: 'pending', note: 'No piece under this title found to exist under any studio (2026-08-27 research). Possibly a misremembering of the LoL Mobile Anniversary piece. Do NOT ship until Eric identifies it. pending.ts: lunar-god.' },
  'mihoyo-tin-master': { source: 'V28', verification: 'self' },
  'mihoyo-section-6': { source: 'V28', verification: 'self' },
  'netease-naraka-showdown': { source: 'V28', verification: 'self' },
  'zhiben-yifinite': { source: 'V28', verification: 'self' },
  'kafellon-product-launch': { source: 'V28', verification: 'self' },
  'showreel-2026': { source: 'V29:4159 (fact string "2 min 34 sec" → durationSec 154)', verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },

  // ---- tools (URLs curl-200 2026-08-28) ------------------------------------
  'ttl-breakdown': { source: 'V29:4230 (blurb); URL live per curl 2026-08-27/28', verification: 'public', checkedAt: '2026-08-28', note: '"245 scenes · 2,961 items" figures from ASTRO WhatIBuilt.astro NOT entered — pending.ts: ttl-numbers.' },
  coda: { source: 'V29:4233 (blurb); URL live per curl 2026-08-28', verification: 'public', checkedAt: '2026-08-28' },
  martini: { source: 'projects/martini README.md read 2026-08-28 ("80 passing" badge — repo self-report, not re-run; BYOK agent; exports); URL live per curl 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'Preview URL is a branch deployment; expect it to change when a stable URL lands.' },
  'prompt-builder': { source: 'V29:4229; URL live per curl 2026-08-28', verification: 'public', checkedAt: '2026-08-28' },
  'ai-canvas-studio': { source: 'portfolio site.ts tools[]; browser-verified interactive 2026-08-27; URL 200 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: '"G0–G7 pipeline" and "5 shorts in 4 weeks" claims NOT entered — pending.ts: canvas-numbers.' },
  'videoagent-studio': { source: 'portfolio site.ts tools[]; URL live per curl 2026-08-28', verification: 'public', checkedAt: '2026-08-28', note: 'Vercel free tier — liveness risk under the no-free-tier-backends rule; Cloudflare migration candidate.' },
  'open-video-agent': { source: 'portfolio site.ts tools[]; URL live per curl 2026-08-28', verification: 'public', checkedAt: '2026-08-28' },
  'ai-film-studio': { source: 'V29:4231', verification: 'self', note: 'Internal alias P007. Preview deployments are PR-scoped; no stable public URL yet.' },

  // ---- ai films & lab ------------------------------------------------------
  'one-click-mute': { source: 'V29:4142; V28 aiFilms[]', verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'home-smarthome-manga-cut': { source: 'V29:4143; V28 aiFilms[]', verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'home-smarthome-trailer': { source: 'V29:4144; V28 aiFilms[]', verification: 'self', note: 'No public URL in any source copy.' },
  'my-new-haircut': { source: 'V29:4145; V28 aiFilms[]', verification: 'pending', note: 'Role marked 待補 in source; no URL. Needs Eric.' },
  'sys-mere-fashion-film': { source: 'V29:4146; V28 aiFilms[]', verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  doombrush: { source: 'V29:4147; V28 aiFilms[]', verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'monet-cyberpunk': { source: 'V29:4148; V28 aiFilms[]', verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  'war-and-peace': { source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-23/ (two cuts + still, listed 2026-08-28)', verification: 'pending', note: 'Finished film or test? pending.ts: war-and-peace.' },
  'model-comparison-2026-08-19': {
    source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-19/ — Tea/Typography/Canime x H3/Omni/SD2.5 + Triptych cuts, 18 clips. Listed 2026-08-28.',
    verification: 'self',
    note: 'Model names transcribed from filenames; confirm exact versions with Eric before publishing captions.',
  },
  'ink-wash-seedance-2026-08-19': { source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-19/ (p021_*, p022_*, 渔翁垂钓*, Brand_spot_*)', verification: 'self' },
  'war-and-peace-2026-08-23': { source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-23/', verification: 'pending' },

  // ---- profile -------------------------------------------------------------
  contact: { source: 'V28 contact block; V29:1523 (mailto)', verification: 'self' },
  'experience-anchor': { source: 'LBBOnline 2024-09-13 hire announcement (browser-verified 2026-08-28): "over 13 years of experience" as of 2024-09', verification: 'public', checkedAt: '2026-08-28' },
  'affiliation-gold-house': { source: 'ASTRO TrackRecord.astro; independently confirmed by LBBOnline 2024-09-13', verification: 'public', checkedAt: '2026-08-28' },
  'affiliation-final-frontier': { source: 'LBBOnline 2024-09-13 (browser-verified 2026-08-28)', verification: 'public', checkedAt: '2026-08-28' },
  'affiliation-hyperagent': { source: 'ASTRO TrackRecord.astro', verification: 'self' },
  'affiliation-wonder-studios': { source: 'ASTRO TrackRecord.astro', verification: 'self' },
  'production-footprint': { source: 'ASTRO TrackRecord.astro', verification: 'self' },
  'tool-stack': { source: 'ASTRO ToolStack.astro', verification: 'self' },

  // ---- vision --------------------------------------------------------------
  vision: {
    source:
      'Eric verbatim (session of 2026-08-29) + his approved blueprint v0.2 principles in CC session 「AI 电影制作平台架构」 (local_f38ca49e, 2026-08-27) + ai-film-studio docs/ai-film-production-pipeline-v2.svg ("No generation without approval", "One approval can unlock exploration", "Exploration ≠ Master") and docs/ai-film-role-control-v2.svg. Principle 4 zh 「一切以书面为准」 from the blueprint 共同事实 clause.',
    verification: 'self',
    note: 'Vision, not fact claims. Strategy layer (platform partners, wedges, moats, phases — still under internal debate) must NEVER render or ship.',
  },

  // ---- governance receipts (inventory 2026-08-29, read-only sweep) ---------
  'commit-gate': {
    source:
      'VSCODE_CC/.claude/hooks/lgsa-guardrails.js (1,168 lines, registered machine-wide in settings.json) + lgsa-guardrails.test.js: 131 cases (76 deny, 55 allow).',
    verification: 'self',
    note: 'Machine-local; no public link. Sanitized excerpt publishable if Eric wants — pending.ts: governance-public-links.',
  },
  'audit-trail': {
    source:
      'LOOP-STATE protocol (CHARTER/AUDIT/USABLE lines) enforced by the commit gate; blind-audit grading rule in ~/.claude/CLAUDE.md; public receipt: LOOP-STATE.md in this repo on feat/data-archive.',
    verification: 'public',
    checkedAt: '2026-08-29',
  },
  'outbound-gate': {
    source:
      'ai-drsfilms-portfolio/harness/: rules/rules.json (45 rule IDs), 61 fixture dirs / 440 files incl. forged-reports and ghost-profile, cli.js exit-code contract, career-hop-harness.yml runs --self-test on every push/PR.',
    verification: 'public',
    checkedAt: '2026-08-29',
    note: 'Public repo, but it is the job-application machinery — link or not is Eric\'s call (pending.ts: governance-public-links). Claim wording deliberately says "outbound work".',
  },
  'money-lock': {
    source:
      'ai-film-studio CLAUDE.md invariant ("G6 exact-hash approval is always a manual click by Eric, no automated/agent path may bypass"); ai-film-prompt-system contracts/APPROVAL-GATES.md hash-bound payment plans; G0-G7 DB CHECK in SECURITY_AUDIT_REPORT.md.',
    verification: 'self',
    note: 'Private repos; renders as description without links or codenames.',
  },
  'this-page': {
    source:
      'This repo, branch feat/data-archive: LOOP-STATE.md CHARTER blocks, AUDIT/USABLE lines, evidence log; commits gated by the machine-wide build hook.',
    verification: 'public',
    checkedAt: '2026-08-29',
  },
};

/**
 * Eric's vision, verbatim zh (archive of record; the site renders only the
 * English rendering in vision.ts).
 */
export const visionZh = {
  statement:
    '我想象的未来的电影制作,就是所有的 creative heads 都是在同一个 powerhouse 里面各取所需。现在做的这些事情都是在为那个方向努力。',
  principles: [
    '每个部门有自己的 agent:制片人有制片人的 agent,美术组有美术组的,摄影、灯光、服化道都一样。',
    '剧组本来就是一个 agent 网络:部门制、通告单、日报、签字权层级——一百年打磨好的书面协议,就是 agent 协作的现成蓝本。',
    'Agent 只能提议,人签字才算数;没有批准就没有生成。',
    '项目真相是一套普通文件,所有工具只对同一套文件读写。一切以书面为准。',
  ],
};

/**
 * Unproduced clip concepts — creative material that must never ship in any
 * client bundle (they leaked into the public JS before this file existed).
 * Kept here as archive-of-record only.
 */
export const concepts = [
  { id: 'concept-twelve-universes', date: '2026-08', title: 'One Second, Twelve Universes', what: 'One spinning back kick style-morphed across 12 art styles. Full MJ v7 prompt set written.', source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/Twelve_Universes.md' },
  { id: 'concept-8bit-evolution', date: '2026-08', title: '8bit Evolution', what: 'Five game-era style mutations, 15-20s evolution cut. Prompt set written.', source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/8bit_Evolution.md' },
  { id: 'concept-multistyle-fighter', date: '2026-08', title: 'Multistyle Fighter', what: 'Every fight beat in a different art style. Prompt set written.', source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/Multistyle_Fighter.md' },
  { id: 'concept-ideas-batch', date: '2026-08', title: 'Clip ideas batch (ink kung-fu, neon, toys, mirror, pixel god)', what: 'Five one-line concepts with style directions.', source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/Ideas.md' },
];
