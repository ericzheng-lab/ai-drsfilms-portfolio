import type { AiFilmEntry, LabEntry } from './types';

/**
 * AI-native films (finished) and lab entries (dated experiments) —
 * display-safe fields only. Local asset paths, model-name caveats and
 * unproduced concepts live in sources.ts (concepts must never ship in a
 * client bundle).
 *
 * Display rules: only status 'finished' films render; lab renders only
 * entries whose verification is not 'pending'.
 */

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
  },
  {
    id: 'home-smarthome-manga-cut',
    title: 'HOME × SMARTHOME — Manga Cut',
    role: 'Director / Visual Execution',
    durationSec: 125,
    url: 'https://www.youtube.com/watch?v=7AGx2OsC6Yw',
    note: "JJ Lin's story translated into a complete manga visual sequence.",
    status: 'finished',
  },
  {
    id: 'home-smarthome-trailer',
    title: 'HOME × SMARTHOME — Trailer',
    role: 'Director / Visual Execution',
    durationSec: 69,
    note: 'Smart-home narrative rendered as a cinematic live-action trailer.',
    status: 'finished',
  },
  {
    id: 'my-new-haircut',
    title: 'My New Haircut',
    role: '',
    durationSec: 34,
    year: 2026,
    note: "A stylized school-day short built around a cat's new haircut.",
    status: 'pending',
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
  },
  {
    id: 'war-and-peace',
    title: 'War and Peace',
    role: '',
    note: 'Two cuts on disk. Designation pending.',
    status: 'pending',
  },
];

/**
 * Lab: dated experiments. The 2026-08-19 batch is a controlled comparison —
 * the same brief generated across three video models, with assembled
 * side-by-side triptychs. Methodology evidence for the responsible-AI story.
 */
export const lab: LabEntry[] = [
  {
    id: 'model-comparison-2026-08-19',
    date: '2026-08-19',
    title: 'Same brief, three models',
    what: 'Three briefs, each generated on three video models, with assembled triptych comparison cuts. 18 clips.',
    status: 'shipped',
    verification: 'self',
  },
  {
    id: 'ink-wash-seedance-2026-08-19',
    date: '2026-08-19',
    title: 'Ink-wash motion studies',
    what: 'Dragon and fisherman ink-wash motion tests, plus a brand-spot motion-graphics sequence.',
    status: 'shipped',
    verification: 'self',
  },
  {
    id: 'war-and-peace-2026-08-23',
    date: '2026-08-23',
    title: 'War and Peace — two cuts',
    what: 'Two cuts plus a still. Classification pending.',
    status: 'shipped',
    verification: 'pending',
  },
];
