/**
 * Shared types for the sourced fact archive (src/data/archive/).
 *
 * Rules of the archive:
 * 1. Every entry carries `source` — where the fact was transcribed from.
 * 2. `verification` states how strongly the outside world backs it.
 * 3. Conflicting or unconfirmed numbers live in pending.ts, never in
 *    display-ready fields. Claim locks: Sundance is "World Cinema Dramatic
 *    Competition, Grand Jury Prize nominee" (never winner); Berlinale is
 *    "Panorama".
 */

export type Verification =
  /** A third-party page (press, festival, platform credit block) confirms it. */
  | 'public'
  /** Appears only in Eric's own materials (site data, showreel, repo docs). */
  | 'self'
  /** Conflicting sources or missing designation — do not publish until Eric rules. */
  | 'pending';

export interface Evidence {
  /** File:line, URL, or "Eric" for facts he stated directly. Never empty. */
  source: string;
  verification: Verification;
  /** ISO date the proofUrl (or source URL) was last checked. */
  checkedAt?: string;
  note?: string;
}

export interface PressItem {
  id: string;
  outlet: string;
  title: string;
  url: string;
  /** review = about the film; news = coverage; credit = names Eric directly. */
  kind: 'review' | 'news' | 'credit';
  date?: string;
  /** What this item is evidence FOR — quote it, do not paraphrase into praise of Eric. */
  supports: string;
  evidence: Evidence;
}

export interface FestivalEntry {
  festival: string;
  year: number;
  result: string;
  outcome: 'won' | 'nomination' | 'selection';
  evidence: Evidence;
}

export interface CommercialEntry {
  id: string;
  brand: string;
  title: string;
  role: string;
  proofUrl?: string;
  /** Third-party page that names Eric on this piece, when one exists. */
  publicCreditUrl?: string;
  evidence: Evidence;
}

export interface ToolEntry {
  id: string;
  name: string;
  /** Position in the production pipeline, for the suite narrative. */
  stage:
    | 'prompting'
    | 'generation'
    | 'breakdown'
    | 'budgeting'
    | 'scheduling'
    | 'shot-production';
  status: 'live' | 'active-development' | 'working';
  blurb: string;
  url?: string;
  evidence: Evidence;
}

export interface AiFilmEntry {
  id: string;
  title: string;
  role: string;
  durationSec?: number;
  year?: number;
  url?: string;
  note: string;
  /** finished = shippable on the site; pending = awaiting Eric's designation. */
  status: 'finished' | 'pending';
  evidence: Evidence;
}

export interface LabEntry {
  id: string;
  date: string;
  title: string;
  what: string;
  /** shipped = clips exist on disk; concept = written but not produced. */
  status: 'shipped' | 'concept';
  /** Local paths under ~/Movies/VIDEO_PRJ/_ai/ai_Clips/ — not web URLs. */
  localAssets?: string[];
  evidence: Evidence;
}

export interface PendingItem {
  id: string;
  question: string;
  conflict: string;
  /** What Eric has to decide or supply before this can ship. */
  needed: string;
}
