/**
 * Sourced fact archive — the single data layer under the three-layer site
 * plan (fact archive → one permanent main site → per-company one-screen
 * pages). Approved by Eric 2026-08-28.
 *
 * Nothing imports this yet; the main-site rebuild and the company-page
 * template consume it in later loops. Until then it is inert data, kept
 * typechecked by the build.
 *
 * Counts are DERIVED here so no page can ever overstate them.
 */

export * from './types';
export { briefHistory, briefHistoryFestivalRecord, thisTimewornLand } from './films';
export { press, photoNotes } from './press';
export { commercials, showreel } from './commercials';
export { tools, pipelineOrder } from './tools';
export { aiFilms, lab } from './ai-work';
export {
  contact,
  languages,
  experienceAnchor,
  affiliations,
  productionFootprint,
  toolStack,
} from './profile';
export { pending } from './pending';
export { vision } from './vision';

import { briefHistoryFestivalRecord } from './films';
import { press } from './press';
import { commercials } from './commercials';
import { tools } from './tools';
import { aiFilms, lab } from './ai-work';

export const counts = {
  features: 1,
  featuresInDevelopment: 1,
  festivalWins: briefHistoryFestivalRecord.filter((f) => f.outcome === 'won').length,
  festivalNominations: briefHistoryFestivalRecord.filter((f) => f.outcome === 'nomination').length,
  pressItems: press.length,
  pressReviews: press.filter((p) => p.kind === 'review').length,
  commercialCredits: commercials.length,
  commercialPubliclyVerified: commercials.filter((c) => c.evidence.verification === 'public').length,
  commercialWithProofLink: commercials.filter((c) => c.proofUrl || c.publicCreditUrl).length,
  tools: tools.length,
  toolsLive: tools.filter((t) => t.status === 'live').length,
  aiFilmsFinished: aiFilms.filter((f) => f.status === 'finished').length,
  labShipped: lab.filter((l) => l.status === 'shipped').length,
};
