import type { Evidence } from './types';

/**
 * Person-level facts. Company attribution and every conflicting number are
 * OUT of this file — see pending.ts.
 */

export const contact = {
  email: 'eric.zheng@drsfilms.com',
  site: 'ai.drsfilms.com',
  x: 'https://x.com/EZheng66099',
  evidence: {
    source: 'V28 contact block; V29:1523 (mailto)',
    verification: 'self',
  } as Evidence,
};

export const languages = ['Chinese', 'English'];

/**
 * Experience length: the only third-party figure is LBB 2024-09 "over 13
 * years of experience". Self-copy says "15 years" / "Fifteen Years" — roughly
 * consistent with 13+ in late 2024, but the display wording is Eric's call
 * (pending.ts: years-of-experience).
 */
export const experienceAnchor = {
  fact: '"over 13 years of experience in the production industry" as of 2024-09',
  evidence: {
    source:
      'LBBOnline 2024-09-13 "Eric Zheng Joins Final Frontier as Executive Producer" (browser-verified 2026-08-28)',
    verification: 'public',
    checkedAt: '2026-08-28',
  } as Evidence,
};

export const affiliations = [
  {
    name: 'Gold House',
    detail: 'Member',
    evidence: {
      source:
        'astro main src/components/TrackRecord.astro; independently confirmed by LBBOnline 2024-09-13',
      verification: 'public',
      checkedAt: '2026-08-28',
    } as Evidence,
  },
  {
    name: 'Final Frontier',
    detail:
      'Shanghai HQ Executive Producer (2024 announcement); lead producer → executive producer from 2022',
    evidence: {
      source: 'LBBOnline 2024-09-13 (browser-verified 2026-08-28)',
      verification: 'public',
      checkedAt: '2026-08-28',
    } as Evidence,
  },
  {
    name: 'Hyperagent',
    detail: 'Founding 500',
    evidence: {
      source: 'astro main src/components/TrackRecord.astro',
      verification: 'self',
    } as Evidence,
  },
  {
    name: 'Wonder Studios',
    detail: 'Community',
    evidence: {
      source: 'astro main src/components/TrackRecord.astro',
      verification: 'self',
    } as Evidence,
  },
];

/** Production footprint cities, as self-stated. */
export const productionFootprint = {
  cities: [
    'Copenhagen',
    'Paris',
    'Madrid',
    'Beijing',
    'Shanghai',
    'New York',
    'Los Angeles',
    'Buenos Aires',
  ],
  evidence: {
    source: 'astro main src/components/TrackRecord.astro',
    verification: 'self',
  } as Evidence,
};

/** Creative tool stack by production phase. */
export const toolStack = {
  phases: [
    { phase: 'Develop', tools: ['Claude', 'Cursor', 'OpenSpec', 'Midjourney'] },
    { phase: 'Pre-Vis', tools: ['Flux', 'Midjourney', 'Higgsfield'] },
    { phase: 'Generate', tools: ['Runway', 'Kling', 'Veo', 'Seedance'] },
    { phase: 'Finish', tools: ['ElevenLabs', 'Suno'] },
    {
      phase: 'Orchestrate',
      tools: ['Hyperagent', 'Astro', 'React', 'Cloudflare', 'D1', 'Three.js'],
    },
  ],
  evidence: {
    source: 'astro main src/components/ToolStack.astro',
    verification: 'self',
  } as Evidence,
};
