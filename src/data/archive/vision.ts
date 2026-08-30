/**
 * Eric's central thesis — display-safe rendering only. His verbatim zh
 * statement, the source trail (session ids, internal doc paths) and the
 * public-safe boundary note live in sources.ts under key 'vision'.
 *
 * Rendered as vision (his position), never as fact claims about the
 * industry. The strategy layer around it must NEVER appear on any page.
 */

export interface Vision {
  /** English rendering for the site, built from his sentences. */
  statementEn: string;
  principlesEn: string[];
}

export const vision: Vision = {
  statementEn:
    "Every creative head under one roof, each taking what they need. Film crews wrote the coordination protocol a hundred years ago — I'm teaching it to agents.",
  principlesEn: [
    'Every department gets its own agent, listed like crew: producer, art, camera, lighting, wardrobe.',
    'Call sheets, dailies, purchase orders, sign-off chains: the paperwork becomes the messages agents exchange.',
    'Agents propose. People sign. Nothing generates without approval.',
    "If it isn't in the file, it didn't happen: one spine of files, read and written by every tool.",
  ],
};
