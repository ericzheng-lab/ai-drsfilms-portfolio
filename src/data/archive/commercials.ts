import type { CommercialEntry } from './types';

/**
 * All 16 commercial credits from V28 content.json (the richest copy),
 * merged with proof URLs from V29 (8 campaigns carry Vimeo links) and
 * third-party credit pages recaptured 2026-08-28.
 *
 * verification meanings here:
 *  public  — a third-party page names Eric on this piece
 *  self    — only Eric's own materials carry it (common for internal EP roles;
 *            absence of a public credit is not proof the credit is false)
 *  pending — existence of the piece itself is unconfirmed
 *
 * The public production-company context is Final Frontier (Eric was Shanghai
 * HQ executive producer, LBB 2024-09-13). How to present company attribution
 * on the site is Eric's open decision — see pending.ts: company-presentation.
 */

const V28 = 'drs-source/_incoming/ukiyo-e-v28/content.json commercial[]';
const V29 = 'ai-drsfilms-astro public/ukiyo-e-v29/hero-inline.html';

export const commercials: CommercialEntry[] = [
  {
    id: '3i-robotics-brand-film',
    brand: '3i Robotics',
    title: 'Brand Film (Intelligent Vacuum)',
    role: 'Producer',
    proofUrl: 'https://vimeo.com/893965010',
    publicCreditUrl: 'https://finalfrontier.tv/news/view/3i-intelligent-vacuum',
    evidence: {
      source: `${V28}; ${V29}:4155; finalfrontier.tv credit block`,
      verification: 'public',
      checkedAt: '2026-08-28',
      note: 'finalfrontier.tv names Eric among the executive producers.',
    },
  },
  {
    id: 'riot-lol-mobile-anniversary',
    brand: 'Tencent / Riot Games',
    title: 'League of Legends — Mobile Anniversary Campaign',
    role: 'Producer',
    publicCreditUrl: 'https://finalfrontier.tv/2022/07/07/league-of-legends-mobile-anniversary/',
    evidence: {
      source: `${V28}; finalfrontier.tv project page`,
      verification: 'public',
      checkedAt: '2026-08-28',
      note: 'Public credit reads "Lead Producer: Eric Zheng" — stronger than the V28 "Producer". Use the public wording.',
    },
  },
  {
    id: 'netease-naraka-asian-games',
    brand: 'NetEase',
    title: 'Naraka: Bladepoint · Asian Games',
    role: 'Producer',
    publicCreditUrl: 'https://lbbonline.com/news/final-frontier-crafts-mixed-media-sporting-showcase-for-naraka-bladepoint',
    evidence: {
      source: `${V28}; LBBOnline (browser-verified 2026-08-28); also stashmedia.tv and finalfrontier.tv project page`,
      verification: 'public',
      checkedAt: '2026-08-28',
      note: 'LBB quotes "Final Frontier executive producer Eric Zheng" on this film.',
    },
  },
  {
    id: 'mihoyo-clockboy-world',
    brand: 'miHoYo',
    title: 'Clockboy World Cinematic',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/924606118',
    evidence: {
      source: `${V28}; ${V29}:4158`,
      verification: 'self',
      checkedAt: '2026-08-28',
      note: 'Possibly the same film as "Tick-Tock! Let\'s Dream Together!" (Honkai: Star Rail), where finalfrontier.tv publicly lists Eric Zheng among EPs — if Eric confirms they are one film, this entry upgrades to public. See pending.ts: clockboy-ticktock.',
    },
  },
  {
    id: 'coach-brand-film',
    brand: 'COACH',
    title: 'Brand Film',
    role: 'Producer',
    proofUrl: 'https://vimeo.com/476258858',
    evidence: {
      source: `${V28}; ${V29}:4151`,
      verification: 'self',
      checkedAt: '2026-08-28',
      note: 'No public credit found (2026-08-27 research).',
    },
  },
  {
    id: 'beats-flex',
    brand: 'Beats',
    title: 'Flex Earphones Campaign',
    role: 'Producer',
    proofUrl: 'https://vimeo.com/1172775488',
    evidence: {
      source: `${V28}; ${V29}:4152`,
      verification: 'self',
      checkedAt: '2026-08-28',
      note: 'No public credit found (2026-08-27 research).',
    },
  },
  {
    id: 'vivo-x-series',
    brand: 'vivo',
    title: 'X Series Multi-Year Campaign',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/749395556',
    evidence: {
      source: `${V28}; ${V29}:4153`,
      verification: 'self',
      checkedAt: '2026-08-28',
      note: 'Name not found in X80/X90/X100 public credit blocks (2026-08-27 research).',
    },
  },
  {
    id: 'vivo-s17',
    brand: 'vivo',
    title: 'S17 Product Launch',
    role: 'Executive Producer',
    evidence: { source: V28, verification: 'self' },
  },
  {
    id: 'innisfree-white-peony',
    brand: 'INNISFREE',
    title: 'White Peony Product Film',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/1174256822',
    evidence: {
      source: `${V28}; ${V29}:4154`,
      verification: 'self',
      checkedAt: '2026-08-28',
      note: 'No public credit found (2026-08-27 research).',
    },
  },
  {
    id: 'tencent-dnf',
    brand: 'Tencent',
    title: 'Dungeon & Fighter Cinematics',
    role: 'Executive Producer',
    proofUrl: 'https://vimeo.com/1090618108',
    evidence: {
      source: `${V28}; ${V29}:4156`,
      verification: 'self',
      checkedAt: '2026-08-28',
      note: 'No public credit found (2026-08-27 research).',
    },
  },
  {
    id: 'riot-lunar-god',
    brand: 'Tencent / Riot Games',
    title: 'Lunar God Cinematic',
    role: 'Executive Producer',
    evidence: {
      source: `${V28}; ${V29}:4157`,
      verification: 'pending',
      note: 'No piece under this title could be found to exist under any studio (2026-08-27 research). Possibly a misremembering of the LoL Mobile Anniversary piece. Do NOT ship until Eric identifies it. See pending.ts: lunar-god.',
    },
  },
  {
    id: 'mihoyo-tin-master',
    brand: 'miHoYo',
    title: 'Tin Master Coffee Shop Film',
    role: 'Executive Producer',
    evidence: { source: V28, verification: 'self' },
  },
  {
    id: 'mihoyo-section-6',
    brand: 'miHoYo',
    title: 'Section 6 Campaign Film',
    role: 'Executive Producer',
    evidence: { source: V28, verification: 'self' },
  },
  {
    id: 'netease-naraka-showdown',
    brand: 'NetEase',
    title: 'Naraka: Bladepoint Showdown',
    role: 'Producer',
    evidence: { source: V28, verification: 'self' },
  },
  {
    id: 'zhiben-yifinite',
    brand: 'ZHIBEN & YIFINITE',
    title: 'Brand Visual Identity',
    role: 'Executive Producer',
    evidence: { source: V28, verification: 'self' },
  },
  {
    id: 'kafellon-product-launch',
    brand: 'Kafellon',
    title: 'Product Launch Film',
    role: 'Producer',
    evidence: { source: V28, verification: 'self' },
  },
];

/** 2 min 34 sec reel covering the campaign work above. */
export const showreel = {
  title: 'Eric Zheng Showreel 2026',
  url: 'https://vimeo.com/1174467043',
  evidence: {
    source: `${V29}:4159`,
    verification: 'self' as const,
    checkedAt: '2026-08-28',
    note: 'HTTP 200',
  },
};
