import type { AiFilmEntry, LabEntry } from './types';

/**
 * AI-native films (finished) and lab entries (dated experiments).
 *
 * Display rules approved 2026-08-28:
 * - Only `status: 'finished'` films go in the AI Films section.
 * - Lab entries are dated and can be added weekly — the liveness signal.
 * - `status: 'concept'` lab items NEVER render — written-but-unproduced ideas
 *   stay off the site until shipped.
 */

const V29 = 'ai-drsfilms-astro public/ukiyo-e-v29/hero-inline.html';

export const aiFilms: AiFilmEntry[] = [
  {
    id: 'one-click-mute',
    title: 'One Click Mute',
    role: 'Director',
    durationSec: 47,
    year: 2026,
    url: 'https://www.youtube.com/watch?v=6C--JC5iFmQ',
    note: 'Concept, visual development, generation, edit and sound/post.',
    status: 'finished',
    evidence: { source: `${V29}:4142; V28 aiFilms[]`, verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  },
  {
    id: 'home-smarthome-manga-cut',
    title: 'HOME × SMARTHOME — Manga Cut',
    role: 'Director / Visual Execution',
    durationSec: 125,
    url: 'https://www.youtube.com/watch?v=7AGx2OsC6Yw',
    note: "JJ Lin's story translated into a complete manga visual sequence.",
    status: 'finished',
    evidence: { source: `${V29}:4143; V28 aiFilms[]`, verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  },
  {
    id: 'home-smarthome-trailer',
    title: 'HOME × SMARTHOME — Trailer',
    role: 'Director / Visual Execution',
    durationSec: 69,
    note: 'Smart-home narrative rendered as a cinematic live-action trailer.',
    status: 'finished',
    evidence: { source: `${V29}:4144; V28 aiFilms[]`, verification: 'self', note: 'No public URL in any source copy.' },
  },
  {
    id: 'my-new-haircut',
    title: 'My New Haircut',
    role: '',
    durationSec: 34,
    year: 2026,
    note: "A stylized school-day short built around a cat's new haircut.",
    status: 'pending',
    evidence: { source: `${V29}:4145; V28 aiFilms[]`, verification: 'pending', note: 'Role marked 待補 in source; no URL. Needs Eric.' },
  },
  {
    id: 'sys-mere-fashion-film',
    title: 'SYS/MERE — Fashion Film',
    role: 'Director',
    durationSec: 48,
    year: 2026,
    url: 'https://www.youtube.com/watch?v=WL2dvDxIiHw',
    note: 'Black-and-gold fashion direction held across architecture, wardrobe and performance.',
    status: 'finished',
    evidence: { source: `${V29}:4146; V28 aiFilms[]`, verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  },
  {
    id: 'doombrush',
    title: 'DoomBrush',
    role: 'Director',
    durationSec: 95,
    year: 2026,
    url: 'https://www.youtube.com/watch?v=YG5Si7HXRB0',
    note: 'A narrative spec film moving from bathroom threat to product payoff.',
    status: 'finished',
    evidence: { source: `${V29}:4147; V28 aiFilms[]`, verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  },
  {
    id: 'monet-cyberpunk',
    title: 'Monet CyberPunk',
    role: 'Director',
    durationSec: 19,
    year: 2026,
    url: 'https://www.youtube.com/watch?v=CWPLMs9-CgU',
    note: 'Impressionist city imagery translated into a square-format cyberpunk study.',
    status: 'finished',
    evidence: { source: `${V29}:4148; V28 aiFilms[]`, verification: 'self', checkedAt: '2026-08-28', note: 'HTTP 200' },
  },
  {
    id: 'war-and-peace',
    title: 'War and Peace',
    role: '',
    note: 'Two cuts on disk (War-and-Peace.mp4, War-and-Peace_2.mp4, 2026-08-23). Finished film or test? Needs Eric.',
    status: 'pending',
    evidence: {
      source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-23/ (listed 2026-08-28)',
      verification: 'pending',
      note: 'See pending.ts: war-and-peace.',
    },
  },
];

/**
 * Lab: dated experiments. The 2026-08-19 batch is a controlled comparison —
 * the same brief generated across three video models, plus assembled
 * side-by-side triptychs. Methodology evidence for the
 * creative-technologist story ("responsible uses of AI" in producer terms).
 */
export const lab: LabEntry[] = [
  {
    id: 'model-comparison-2026-08-19',
    date: '2026-08-19',
    title: 'Same brief, three models',
    what:
      'Three briefs (Tea, Typography, Canime) each generated on three models (H3, Omni, SD2.5), with assembled triptych comparison cuts. 18 clips on disk.',
    status: 'shipped',
    localAssets: [
      '~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-19/ (Tea_H3/Omni/SD2.5, Typography_H3/Omni/SD2.5, Canime H3/Omni/SD2.5 + Triptych cuts)',
    ],
    evidence: {
      source: 'directory listing 2026-08-28',
      verification: 'self',
      note: 'Model names transcribed from filenames; confirm exact model versions with Eric before publishing captions.',
    },
  },
  {
    id: 'ink-wash-seedance-2026-08-19',
    date: '2026-08-19',
    title: 'Ink-wash motion tests (Seedance)',
    what:
      'p021 dragon and ink-wash fisherman studies (渔翁垂钓朱砂鲤鱼跃水), plus p022 and a brand-spot motion-graphics sequence.',
    status: 'shipped',
    localAssets: ['~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-19/ (p021_*, p022_*, 渔翁垂钓*, Brand_spot_*)'],
    evidence: { source: 'directory listing 2026-08-28', verification: 'self' },
  },
  {
    id: 'war-and-peace-2026-08-23',
    date: '2026-08-23',
    title: 'War and Peace — two cuts',
    what: 'Two cuts plus a still. Classification pending (see aiFilms).',
    status: 'shipped',
    localAssets: ['~/Movies/VIDEO_PRJ/_ai/ai_Clips/2026-08-23/'],
    evidence: { source: 'directory listing 2026-08-28', verification: 'pending' },
  },
  // ---- Written, not produced. NEVER rendered on the site. ----
  {
    id: 'concept-twelve-universes',
    date: '2026-08',
    title: 'One Second, Twelve Universes',
    what: 'One spinning back kick style-morphed across 12 art styles. Full MJ v7 prompt set written.',
    status: 'concept',
    evidence: { source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/Twelve_Universes.md', verification: 'self' },
  },
  {
    id: 'concept-8bit-evolution',
    date: '2026-08',
    title: '8bit Evolution',
    what: 'Five game-era style mutations, 15–20s evolution cut. Prompt set written.',
    status: 'concept',
    evidence: { source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/8bit_Evolution.md', verification: 'self' },
  },
  {
    id: 'concept-multistyle-fighter',
    date: '2026-08',
    title: 'Multistyle Fighter',
    what: 'Every fight beat in a different art style. Prompt set written.',
    status: 'concept',
    evidence: { source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/Multistyle_Fighter.md', verification: 'self' },
  },
  {
    id: 'concept-ideas-batch',
    date: '2026-08',
    title: 'Clip ideas batch (ink kung-fu, neon, toys, mirror, pixel god)',
    what: 'Five one-line concepts with style directions.',
    status: 'concept',
    evidence: { source: '~/Movies/VIDEO_PRJ/_ai/ai_Clips/Ideas.md', verification: 'self' },
  },
];
