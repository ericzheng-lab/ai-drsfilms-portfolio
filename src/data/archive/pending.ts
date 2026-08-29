import type { PendingItem } from './types';

/**
 * The decision register. Nothing in this file may appear on any page.
 * Each item ships only after Eric rules; the ruling then moves the fact into
 * the proper archive file with its source updated.
 */

export const pending: PendingItem[] = [
  {
    id: 'photos-folder',
    question: 'Berlinale / Sundance photos — which folder, which selection?',
    conflict:
      'Eric holds many personal festival photos (2026-08-28). None are in any repo. A Getty premiere photo exists but is licensed (link only, never embed).',
    needed:
      'A folder path with his selected photos (3–5 for the main site). Selection is editorial and his.',
  },
  {
    id: 'company-presentation',
    question:
      'How do First Light Films / Final Frontier / DRS Films appear on the site?',
    conflict:
      'Public record: feature credits sit with First Light Films; commercial credits with Final Frontier (LBB 2024-09-13 names him Shanghai HQ EP). "DRS Films" has no public footprint — it is his personal brand and the site domain.',
    needed: 'A presentation rule, e.g. credits named under their public entities, DRS Films framed as his studio banner.',
  },
  {
    id: 'money-figures',
    question: 'Which money figures may ship, in what wording?',
    conflict:
      '$2.5M vs ~$1.5M feature budget; "$8M+ commercial portfolio" was deleted as unsourced in v29 commit 691aa2e yet is still live on astro main; TTL $340K / $3.4M co-production track only in Films.astro.',
    needed: 'Per-figure ruling: publish (with what source), or drop.',
  },
  {
    id: 'territories-60',
    question: '"60+ territories" for Brief History of A Family?',
    conflict:
      'Self-copy says 60+; Box Office Mojo shows box office recorded in 5 territories and no US theatrical. Sales-territory count and box-office-territory count are different measures — but the site must say which it means.',
    needed: 'Confirm the 60+ figure source (e.g. Films Boutique sales sheet) or reword.',
  },
  {
    id: 'years-of-experience',
    question: '"15 years" vs LBB\'s "over 13 years" (as of 2024-09)?',
    conflict: 'Self-copy rounds up; the third-party figure is 13+ in 2024.',
    needed: 'Pick display wording (e.g. "15 years" is defensible by 2026 if 13+ was true in 2024 — Eric confirms).',
  },
  {
    id: 'basing',
    question: 'Where is Eric based, for the site header?',
    conflict:
      'V28 says Greater New York; LBB 2024-09 says Shanghai HQ; the Pixel application context says SF Bay Area.',
    needed: 'One basing line (and whether it varies per company page).',
  },
  {
    id: 'lunar-god',
    question: 'What is "Lunar God Cinematic"?',
    conflict:
      'Listed in V28/V29; no piece under this title found under any studio (2026-08-27 research). Possibly a misremembering of the LoL Mobile Anniversary film.',
    needed: 'Identify the actual piece (client, title, link) or drop the entry.',
  },
  {
    id: 'clockboy-ticktock',
    question:
      'Is "Clockboy World Cinematic" the same film as "Tick-Tock! Let\'s Dream Together!" (Honkai: Star Rail)?',
    conflict:
      'V28 lists Clockboy (vimeo.com/924606118); finalfrontier.tv publicly lists Eric among EPs on Tick-Tock. If they are one film, the entry upgrades to publicly verified.',
    needed: 'Yes/no from Eric.',
  },
  {
    id: 'ttl-numbers',
    question: 'TTL Breakdown "245 scenes · 2,961 items digitized"?',
    conflict: 'Only in astro main WhatIBuilt.astro; no second source.',
    needed: 'Confirm or drop.',
  },
  {
    id: 'canvas-numbers',
    question:
      'AI Canvas Studio "G0–G7 gated pipeline" and "5 AI-native shorts shipped in under 4 weeks"?',
    conflict: 'Only in astro main WhatIBuilt.astro; no second source.',
    needed: 'Confirm or drop.',
  },
  {
    id: 'war-and-peace',
    question: 'War and Peace (2026-08-23, two cuts) — finished film or test?',
    conflict: 'Two cuts on disk; no designation anywhere.',
    needed: 'Classify: finished (→ aiFilms, with role + URL when published) or lab entry only.',
  },
  {
    id: 'my-new-haircut-role',
    question: 'My New Haircut — role credit and URL?',
    conflict: 'Role marked 待補 in v29; no public URL in any copy.',
    needed: 'Role + link, or keep off the films section.',
  },
  {
    id: 'commercial-count-twelve',
    question: 'v29 page copy says "twelve campaigns"; data arrays hold 8 with links, 16 total in V28.',
    conflict: 'Three different counts across copies.',
    needed: 'Pick the canonical count = what the archive derives (16 entries, of which 8 carry proof links) or trim.',
  },
];
