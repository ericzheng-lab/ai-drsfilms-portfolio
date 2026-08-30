import type { FestivalEntry } from './types';

/**
 * Feature-film record — display-safe fields only.
 * Provenance for every entry: sources.ts (never imported by pages).
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
  trailerUrl?: string;
  reception: { metric: string; value: string }[];
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
  trailerUrl: 'https://vimeo.com/1172739705',
  reception: [
    { metric: 'Rotten Tomatoes', value: '92%' },
    { metric: 'Metascore', value: '80' },
  ],
};

/**
 * The film's festival record. These are the FILM's results; Eric's credit is
 * Producer. Display must group them under the film's name so no prize reads
 * as personally his. Provenance keys: sources.ts `fest:<festival>:<year>`.
 */
export const briefHistoryFestivalRecord: FestivalEntry[] = [
  { festival: 'Cairo International Film Festival', year: 2024, result: 'NETPAC Award · Best Asian Film', outcome: 'won' },
  { festival: 'Noir in Festival', year: 2024, result: 'Black Panther Award · Best Film', outcome: 'won' },
  { festival: 'Jakarta World Film Festival', year: 2024, result: 'Best Director', outcome: 'won' },
  { festival: 'Beijing International Film Festival', year: 2024, result: 'Forward Future · Best Director and Outstanding Artistic Contribution', outcome: 'won' },
  { festival: 'Zurich Film Festival', year: 2024, result: 'Special Mention · Competition', outcome: 'won' },
  { festival: 'Athens International Film Festival', year: 2024, result: 'Special Mention · Competition', outcome: 'won' },
  { festival: 'SIFF PROJECT · Shanghai', year: 2018, result: 'Best Young Director Project', outcome: 'won' },
  { festival: 'Sundance Film Festival', year: 2024, result: 'World Cinema Dramatic Competition · Grand Jury Prize nominee', outcome: 'nomination' },
  { festival: 'Berlinale', year: 2024, result: 'Panorama Audience Award nominee', outcome: 'nomination' },
  { festival: 'EnergaCAMERIMAGE', year: 2024, result: 'Best Director Debut · Best Cinematographer Debut', outcome: 'nomination' },
  { festival: 'Golden Rooster Awards', year: 2025, result: 'Best Original Screenplay · Best Supporting Actor', outcome: 'nomination' },
  { festival: 'Stockholm International Film Festival', year: 2024, result: 'Competition', outcome: 'nomination' },
  { festival: 'Singapore International Film Festival', year: 2024, result: 'Asian Feature Film Competition', outcome: 'nomination' },
  { festival: 'Hong Kong International Film Festival', year: 2024, result: 'Young Cinema Competition · Chinese Language', outcome: 'nomination' },
  { festival: 'Karlovy Vary · Sydney', year: 2024, result: 'Official Selection', outcome: 'selection' },
];

/** Second feature credit — in development. Provenance: sources.ts. */
export interface DevelopmentFilm {
  id: string;
  title: string;
  titleZh: string;
  director: string;
  status: string;
  producers: string[];
  officialSite: string;
  supportLabel: string;
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
};
