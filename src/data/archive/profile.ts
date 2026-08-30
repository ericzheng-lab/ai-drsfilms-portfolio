/**
 * Person-level facts — display-safe fields only. Provenance: sources.ts.
 * Company attribution and every conflicting number are OUT of this file —
 * see pending.ts.
 */

export const contact = {
  email: 'eric.zheng@drsfilms.com',
  site: 'ai.drsfilms.com',
  x: 'https://x.com/EZheng66099',
};

export const languages = ['Chinese', 'English'];

/**
 * The only third-party experience figure: LBB 2024-09 "over 13 years".
 * Display wording is Eric's call (pending.ts: years-of-experience).
 */
export const experienceAnchor = {
  id: 'experience-anchor',
  fact: '"over 13 years of experience in the production industry" as of 2024-09',
};

export const affiliations = [
  { id: 'affiliation-gold-house', name: 'Gold House', detail: 'Member' },
  {
    id: 'affiliation-final-frontier',
    name: 'Final Frontier',
    detail:
      'Shanghai HQ Executive Producer (2024 announcement); lead producer → executive producer from 2022',
  },
  { id: 'affiliation-hyperagent', name: 'Hyperagent', detail: 'Founding 500' },
  { id: 'affiliation-wonder-studios', name: 'Wonder Studios', detail: 'Community' },
];

/** Production footprint cities, as self-stated. */
export const productionFootprint = {
  id: 'production-footprint',
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
};

/** Creative tool stack by production phase. */
export const toolStack = {
  id: 'tool-stack',
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
};
