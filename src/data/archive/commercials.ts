import type { CommercialEntry } from './types';

/**
 * All 16 commercial credits — display-safe fields only. Per-entry research
 * notes and check dates live in sources.ts.
 *
 * verification: 'public' = a third-party page names Eric on the piece;
 * 'self' = only his own materials carry it (common for internal EP roles);
 * 'pending' = the piece itself is unconfirmed — pages must never render it.
 */

export const commercials: CommercialEntry[] = [
  {
    id: '3i-robotics-brand-film',
    brand: '3i Robotics',
    title: 'Brand Film (Intelligent Vacuum)',
    role: 'Producer',
    proofUrl: 'https://vimeo.com/893965010',
    publicCreditUrl: 'https://finalfrontier.tv/news/view/3i-intelligent-vacuum',
    verification: 'public',
  },
  {
    id: 'riot-lol-mobile-anniversary',
    brand: 'Tencent / Riot Games',
    title: 'League of Legends — Mobile Anniversary Campaign',
    role: 'Lead Producer',
    publicCreditUrl: 'https://finalfrontier.tv/2022/07/07/league-of-legends-mobile-anniversary/',
    verification: 'public',
  },
  {
    id: 'netease-naraka-asian-games',
    brand: 'NetEase',
    title: 'Naraka: Bladepoint · Asian Games',
    role: 'Executive Producer',
    publicCreditUrl: 'https://lbbonline.com/news/final-frontier-crafts-mixed-media-sporting-showcase-for-naraka-bladepoint',
    verification: 'public',
  },
  {
    id: 'mihoyo-clockboy-world',
    brand: 'miHoYo',
    title: 'Clockboy World Cinematic',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/924606118',
    verification: 'self',
  },
  {
    id: 'coach-brand-film',
    brand: 'COACH',
    title: 'Brand Film',
    role: 'Producer',
    proofUrl: 'https://vimeo.com/476258858',
    verification: 'self',
  },
  {
    id: 'beats-flex',
    brand: 'Beats',
    title: 'Flex Earphones Campaign',
    role: 'Producer',
    proofUrl: 'https://vimeo.com/1172775488',
    verification: 'self',
  },
  {
    id: 'vivo-x-series',
    brand: 'vivo',
    title: 'X Series Multi-Year Campaign',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/749395556',
    verification: 'self',
  },
  {
    id: 'vivo-s17',
    brand: 'vivo',
    title: 'S17 Product Launch',
    role: 'Executive Producer',
    verification: 'self',
  },
  {
    id: 'innisfree-white-peony',
    brand: 'INNISFREE',
    title: 'White Peony Product Film',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/1174256822',
    verification: 'self',
  },
  {
    id: 'tencent-dnf',
    brand: 'Tencent',
    title: 'Dungeon & Fighter Cinematics',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/1090618108',
    verification: 'self',
  },
  {
    id: 'riot-lunar-god',
    brand: 'Tencent / Riot Games',
    title: 'Lunar God Cinematic',
    role: 'Executive Producer',
    verification: 'pending',
  },
  {
    id: 'mihoyo-tin-master',
    brand: 'miHoYo',
    title: 'Tin Master Coffee Shop Film',
    role: 'Executive Producer',
    verification: 'self',
  },
  {
    id: 'mihoyo-section-6',
    brand: 'miHoYo',
    title: 'Section 6 Campaign Film',
    role: 'Executive Producer',
    verification: 'self',
  },
  {
    id: 'netease-naraka-showdown',
    brand: 'NetEase',
    title: 'Naraka: Bladepoint Showdown',
    role: 'Producer',
    verification: 'self',
  },
  {
    id: 'zhiben-yifinite',
    brand: 'ZHIBEN & YIFINITE',
    title: 'Brand Visual Identity',
    role: 'Executive Producer',
    verification: 'self',
  },
  {
    id: 'kafellon-product-launch',
    brand: 'Kafellon',
    title: 'Product Launch Film',
    role: 'Producer',
    verification: 'self',
  },
];

/** 2 min 34 sec reel covering the campaign work above. */
export const showreel = {
  id: 'showreel-2026',
  title: 'Eric Zheng Showreel 2026',
  durationSec: 154,
  url: 'https://vimeo.com/1174467043',
};
