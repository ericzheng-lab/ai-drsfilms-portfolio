import type { ToolEntry } from './types';

/**
 * Self-built production tools. All URLs re-checked 2026-08-28 (HTTP 200).
 *
 * The suite narrative (approved by Eric 2026-08-28): TTL → CODA → Martini is
 * one production pipeline — breakdown, budgeting, scheduling — and should be
 * presented as a suite, not as scattered tools. `stage` carries that order.
 *
 * Status corrections vs older copies (V29 said "5 tools · 1 live" and marked
 * CODA/ttl-breakdown private): CODA, ttl-breakdown, AI Canvas Studio,
 * VideoAgent Studio and OpenVideoAgent all serve publicly today.
 */

export const tools: ToolEntry[] = [
  {
    id: 'ttl-breakdown',
    name: 'TTL Breakdown',
    stage: 'breakdown',
    status: 'live',
    blurb:
      'A controlled script-breakdown workspace with revision-aware scenes, elements and production views.',
    url: 'https://ttl.sentimentalargument.com',
    evidence: {
      source: 'V29:4230 (blurb); URL live per curl 2026-08-27 and 2026-08-28',
      verification: 'public',
      checkedAt: '2026-08-28',
      note: 'The "245 scenes · 2,961 items digitized" figures from astro main WhatIBuilt.astro are NOT entered — pending Eric (pending.ts: ttl-numbers).',
    },
  },
  {
    id: 'coda',
    name: 'CODA — Film Budget Studio',
    stage: 'budgeting',
    status: 'live',
    blurb:
      'A film-budgeting application built around account rollups, production totals and controlled agent operations.',
    url: 'https://film-budget-studio.pages.dev',
    evidence: {
      source: 'V29:4233 (blurb); URL live per curl 2026-08-28',
      verification: 'public',
      checkedAt: '2026-08-28',
    },
  },
  {
    id: 'martini',
    name: 'Martini — Film Production Scheduling',
    stage: 'scheduling',
    status: 'live',
    blurb:
      'A film-first scheduling desk: Gantt, calendar grid, schedule table, cast Day Out of Days, call/wrap checks and JSON/CSV/Excel exports. Manual mode is the complete product; a BYOK agent can operate the same live schedule through validated tools.',
    url: 'https://feat-martini-v1-goal-audit.martini-f0v.pages.dev',
    evidence: {
      source:
        'projects/martini README.md (read 2026-08-28: "80 passing" tests badge, live preview link, BYOK agent, exports); URL live per curl 2026-08-28',
      verification: 'public',
      checkedAt: '2026-08-28',
      note: 'Preview URL is a branch deployment — expect it to change when Martini lands a stable URL. The "80 tests" figure is the repo\'s own badge (not independently re-run).',
    },
  },
  {
    id: 'prompt-builder',
    name: 'Prompt Builder',
    stage: 'prompting',
    status: 'live',
    blurb:
      'Intent-first presets and model-specific cards compile creative choices into controllable image prompts.',
    url: 'https://ai.drsfilms.com/prompt-builder',
    evidence: {
      source: 'V29:4229; URL live per curl 2026-08-28',
      verification: 'public',
      checkedAt: '2026-08-28',
    },
  },
  {
    id: 'ai-canvas-studio',
    name: 'AI Canvas Studio',
    stage: 'generation',
    status: 'live',
    blurb:
      'A browser-native generative canvas: React Flow nodes for text, reference images, image/video generation and notes.',
    url: 'https://video-canvas.pages.dev',
    evidence: {
      source:
        'portfolio site.ts tools[]; browser-verified interactive 2026-08-27; URL 200 again 2026-08-28',
      verification: 'public',
      checkedAt: '2026-08-28',
      note: 'The "G0–G7 gated pipeline" and "5 AI-native shorts in under 4 weeks" claims from astro main are NOT entered — pending Eric (pending.ts: canvas-numbers).',
    },
  },
  {
    id: 'videoagent-studio',
    name: 'VideoAgent Studio',
    stage: 'generation',
    status: 'live',
    blurb:
      'AI video and image generation workspace — multiple models behind one unified interface.',
    url: 'https://videoagent-studio.vercel.app',
    evidence: {
      source: 'portfolio site.ts tools[]; URL live per curl 2026-08-28',
      verification: 'public',
      checkedAt: '2026-08-28',
      note: 'Hosted on Vercel free tier — flagged as a liveness risk under the garage "no free-tier backends" rule; candidate for Cloudflare migration.',
    },
  },
  {
    id: 'open-video-agent',
    name: 'OpenVideoAgent',
    stage: 'generation',
    status: 'live',
    blurb:
      'Open-source AI video generation — browser-direct API connection, bring your own key.',
    url: 'https://openvideoagent.pages.dev',
    evidence: {
      source: 'portfolio site.ts tools[]; URL live per curl 2026-08-28',
      verification: 'public',
      checkedAt: '2026-08-28',
    },
  },
  {
    id: 'ai-film-studio',
    name: 'AI Film Studio',
    stage: 'shot-production',
    status: 'active-development',
    blurb:
      'A gated shot-production system with blocking, canonical references and exact-hash human approval.',
    evidence: {
      source: 'V29:4231',
      verification: 'self',
      note: 'Preview deployments exist but are PR-scoped; no stable public URL yet.',
    },
  },
];

/** The pipeline story, in order, for the suite section. */
export const pipelineOrder = [
  'ttl-breakdown',
  'coda',
  'martini',
] as const;
