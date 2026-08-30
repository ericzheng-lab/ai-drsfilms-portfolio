/**
 * Shared types for the sourced fact archive (src/data/archive/).
 *
 * Rules of the archive:
 * 1. Data files carry DISPLAY-SAFE fields only — anything a page imports
 *    ships verbatim in the public JS bundle. Provenance, verification
 *    notes, internal paths and unpublished material live in sources.ts,
 *    which no page may ever import.
 * 2. Every entry id has a matching key in sources.ts (checked in review).
 * 3. Conflicting or unconfirmed facts live in pending.ts, never in
 *    display-ready fields. Claim locks: Sundance is "World Cinema Dramatic
 *    Competition, Grand Jury Prize nominee" (never winner); Berlinale is
 *    "Panorama".
 */

export type Verification =
  /** A third-party page (press, festival, platform credit block) confirms it. */
  | 'public'
  /** Appears only in Eric's own materials (site data, showreel, repo docs). */
  | 'self'
  /** Conflicting sources or missing designation — pages must filter these out. */
  | 'pending';

/** Provenance record — lives ONLY in sources.ts. */
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
}

export interface FestivalEntry {
  festival: string;
  year: number;
  result: string;
  outcome: 'won' | 'nomination' | 'selection';
}

export interface CommercialEntry {
  id: string;
  brand: string;
  title: string;
  role: string;
  proofUrl?: string;
  /** Third-party page that names Eric on this piece, when one exists. */
  publicCreditUrl?: string;
  /** Pages group by this; 'pending' entries never render. */
  verification: Verification;
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
}

export interface LabEntry {
  id: string;
  date: string;
  title: string;
  what: string;
  /** Pages render only 'shipped' entries whose verification is not 'pending'. */
  status: 'shipped';
  verification: Verification;
}

export interface PendingItem {
  id: string;
  question: string;
  conflict: string;
  /** What Eric has to decide or supply before this can ship. */
  needed: string;
}
