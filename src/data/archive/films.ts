import type { Evidence, FestivalEntry } from './types';

/**
 * Feature-film record. Source shorthand:
 *  V29    = ai-drsfilms-astro repo, public/ukiyo-e-v29/hero-inline.html
 *           @ feat/ukiyo-e-v29-branding-ttl (line refs; blind-audited via
 *           receipts.ts at c88a19f on feat/role-pages)
 *  V28    = drs-source/_incoming/ukiyo-e-v28/content.json
 *  ASTRO  = ai-drsfilms-astro repo @ main, src/components/
 */

export interface FeatureFilm {
  id: string;
  title: string;
  titleZh: string;
  year: number;
  role: string;
  director: string;
  runtimeMin: number;
  /** The locked full form. Never shorten, never upgrade to "winner". */
  positioningLine: string;
  producers: string[];
  productionCompanies: string[];
  sales: string;
  logline: string;
  reception: { metric: string; value: string; evidence: Evidence }[];
  evidence: Evidence;
}

export const briefHistory: FeatureFilm = {
  id: 'brief-history-of-a-family',
  title: 'Brief History of A Family',
  titleZh: '家庭简史',
  year: 2024,
  role: 'Producer',
  director: 'Lin Jianjie',
  runtimeMin: 99,
  positioningLine:
    'Sundance 2024 World Cinema Dramatic Competition, Grand Jury Prize nominee · Berlinale 2024 Panorama',
  producers: ['Lou Ying', 'Yue (Eric) Zheng', 'Wang Yiwen'],
  productionCompanies: ['First Light Films', 'Films du Milieu', 'Tambo Film'],
  sales: 'Films Boutique',
  logline:
    "A middle-class family becomes entangled with their only son's enigmatic friend in post-one-child-policy China.",
  reception: [
    {
      metric: 'Rotten Tomatoes',
      value: '92%',
      evidence: {
        source: 'web research 2026-08-27 (rottentomatoes.com, opened at source)',
        verification: 'public',
        checkedAt: '2026-08-27',
      },
    },
    {
      metric: 'Metascore',
      value: '80',
      evidence: {
        source: 'web research 2026-08-27 (metacritic.com, opened at source)',
        verification: 'public',
        checkedAt: '2026-08-27',
      },
    },
  ],
  evidence: {
    source:
      'V29:4179-4188 (facts), :4214-4221 (credits); V28 feature block; producer trio per Wikipedia (web research 2026-08-27)',
    verification: 'public',
    checkedAt: '2026-08-28',
    note:
      'WARNING recorded twice (2026-08-27 and 2026-08-28): search-engine AI summaries assert the film WON the Grand Jury Prize. It did not — Sujo won; Wikipedia awards table says "Nominated". Never write festival copy from search results.',
  },
};

/**
 * The film's festival record. These are the FILM's results; Eric's credit is
 * Producer. Display must group them under the film's name so no prize reads
 * as personally his. Transcribed from V29:4195-4213 via audited receipts.ts.
 */
export const briefHistoryFestivalRecord: FestivalEntry[] = [
  { festival: 'Cairo International Film Festival', year: 2024, result: 'NETPAC Award · Best Asian Film', outcome: 'won', evidence: { source: 'V29:4196', verification: 'self' } },
  { festival: 'Noir in Festival', year: 2024, result: 'Black Panther Award · Best Film', outcome: 'won', evidence: { source: 'V29:4197', verification: 'self' } },
  { festival: 'Jakarta World Film Festival', year: 2024, result: 'Best Director', outcome: 'won', evidence: { source: 'V29:4198', verification: 'self' } },
  { festival: 'Beijing International Film Festival', year: 2024, result: 'Forward Future · Best Director and Outstanding Artistic Contribution', outcome: 'won', evidence: { source: 'V29:4199', verification: 'self' } },
  { festival: 'Zurich Film Festival', year: 2024, result: 'Special Mention · Competition', outcome: 'won', evidence: { source: 'V29:4200', verification: 'self', note: 'V28 wording variant: "Jury Special Mention"' } },
  { festival: 'Athens International Film Festival', year: 2024, result: 'Special Mention · Competition', outcome: 'won', evidence: { source: 'V29:4201', verification: 'self' } },
  { festival: 'SIFF PROJECT · Shanghai', year: 2018, result: 'Best Young Director Project', outcome: 'won', evidence: { source: 'V29:4202', verification: 'self' } },
  { festival: 'Sundance Film Festival', year: 2024, result: 'World Cinema Dramatic Competition · Grand Jury Prize nominee', outcome: 'nomination', evidence: { source: 'V29:4205; Wikipedia awards table (web research 2026-08-27)', verification: 'public', checkedAt: '2026-08-28' } },
  { festival: 'Berlinale', year: 2024, result: 'Panorama Audience Award nominee', outcome: 'nomination', evidence: { source: 'V29:4206', verification: 'public', note: 'Panorama selection is public record (Screen Daily, Variety)' } },
  { festival: 'EnergaCAMERIMAGE', year: 2024, result: 'Best Director Debut · Best Cinematographer Debut', outcome: 'nomination', evidence: { source: 'V29:4207', verification: 'self' } },
  { festival: 'Golden Rooster Awards', year: 2025, result: 'Best Original Screenplay · Best Supporting Actor', outcome: 'nomination', evidence: { source: 'V29:4208', verification: 'public', note: 'Nominations belong to writer (Lin Jianjie) and supporting actor (Zu Feng), not to a producer credit — display must attribute them to the film.' } },
  { festival: 'Stockholm International Film Festival', year: 2024, result: 'Competition', outcome: 'nomination', evidence: { source: 'V29:4209', verification: 'self' } },
  { festival: 'Singapore International Film Festival', year: 2024, result: 'Asian Feature Film Competition', outcome: 'nomination', evidence: { source: 'V29:4210', verification: 'self' } },
  { festival: 'Hong Kong International Film Festival', year: 2024, result: 'Young Cinema Competition · Chinese Language', outcome: 'nomination', evidence: { source: 'V29:4211', verification: 'public', note: 'HKIFF selection appears in public record (web research 2026-08-27)' } },
  { festival: 'Karlovy Vary · Sydney', year: 2024, result: 'Official Selection', outcome: 'selection', evidence: { source: 'V29:4212', verification: 'self' } },
];

/** Second feature credit — in development. */
export interface DevelopmentFilm {
  id: string;
  title: string;
  titleZh: string;
  director: string;
  status: string;
  producers: string[];
  officialSite: string;
  supportLabel: string;
  evidence: Evidence;
}

export const thisTimewornLand: DevelopmentFilm = {
  id: 'this-timeworn-land',
  title: 'This Timeworn Land',
  titleZh: '流俗地',
  director: 'You Xing',
  status: 'SIFF PROJECT 2026 Selected · in development',
  producers: ['Qiao Yanmai', 'Hu Mengchu', 'Yue (Eric) Zheng'],
  officialSite: 'https://ttl.sentimentalargument.com',
  supportLabel: '大麦娱乐海纳支持项目',
  evidence: {
    source:
      'ASTRO main src/components/Films.astro; producer trio and official support wording per SIFF PROJECT 2026 public record (web research 2026-08-27); site HTTP 200 2026-08-28',
    verification: 'public',
    checkedAt: '2026-08-28',
    note:
      'Support wording is 海纳, NOT 海纳百川 (a repo note elsewhere has it wrong). Budget figures ($340K / $3.4M track) from Films.astro are NOT entered here — see pending.ts.',
  },
};
