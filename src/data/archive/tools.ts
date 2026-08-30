import type { ToolEntry } from './types';

/**
 * Self-built production tools — display-safe fields only. URL check dates
 * and status-correction notes live in sources.ts.
 *
 * Suite narrative (approved by Eric 2026-08-28): TTL → CODA → Martini is
 * one production pipeline — breakdown, budgeting, scheduling — presented
 * as a suite, not scattered tools. `stage` carries that order.
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
  },
  {
    id: 'coda',
    name: 'CODA — Film Budget Studio',
    stage: 'budgeting',
    status: 'live',
    blurb:
      'A film-budgeting application built around account rollups, production totals and controlled agent operations.',
    url: 'https://film-budget-studio.pages.dev',
  },
  {
    id: 'martini',
    name: 'Martini — Film Production Scheduling',
    stage: 'scheduling',
    status: 'live',
    blurb:
      'A film-first scheduling desk: Gantt, calendar grid, schedule table, cast Day Out of Days, call/wrap checks and JSON/CSV/Excel exports. Manual mode is the complete product; a BYOK agent can operate the same live schedule through validated tools.',
    url: 'https://feat-martini-v1-goal-audit.martini-f0v.pages.dev',
  },
  {
    id: 'prompt-builder',
    name: 'Prompt Builder',
    stage: 'prompting',
    status: 'live',
    blurb:
      'Intent-first presets and model-specific cards compile creative choices into controllable image prompts.',
    url: 'https://ai.drsfilms.com/prompt-builder',
  },
  {
    id: 'ai-canvas-studio',
    name: 'AI Canvas Studio',
    stage: 'generation',
    status: 'live',
    blurb:
      'A browser-native generative canvas: React Flow nodes for text, reference images, image/video generation and notes.',
    url: 'https://video-canvas.pages.dev',
  },
  {
    id: 'videoagent-studio',
    name: 'VideoAgent Studio',
    stage: 'generation',
    status: 'live',
    blurb:
      'AI video and image generation workspace — multiple models behind one unified interface.',
    url: 'https://videoagent-studio.vercel.app',
  },
  {
    id: 'open-video-agent',
    name: 'OpenVideoAgent',
    stage: 'generation',
    status: 'live',
    blurb:
      'Open-source AI video generation — browser-direct API connection, bring your own key.',
    url: 'https://openvideoagent.pages.dev',
  },
  {
    id: 'ai-film-studio',
    name: 'AI Film Studio',
    stage: 'shot-production',
    status: 'active-development',
    blurb:
      'A gated shot-production system with blocking, canonical references and exact-hash human approval.',
  },
];

/** The pipeline story, in order, for the suite section. */
export const pipelineOrder = ['ttl-breakdown', 'coda', 'martini'] as const;
