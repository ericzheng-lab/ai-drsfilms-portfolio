/**
 * The governance layer that ALREADY runs Eric's studio operation — the
 * receipts behind the powerhouse principles. Display-safe claims only;
 * the inventory sources (file paths, private repo names, counts' origins)
 * live in sources.ts and must never ship in a client bundle.
 *
 * Display vocabulary rule (2026-08-29 market research): the market's words
 * are "approval workflow / human sign-off / review trail / pipeline", NOT
 * "harness" — internal codenames never render. Whether any receipt gets a
 * public LINK is Eric's call — pending.ts: governance-public-links.
 */

export interface GovernanceReceipt {
  id: string;
  claim: string;
}

export const governance: GovernanceReceipt[] = [
  {
    id: 'commit-gate',
    claim:
      '131 adversarial tests guard the commit gate every project on his machine passes through — protected branches locked, disguised commands caught before they reach git.',
  },
  {
    id: 'audit-trail',
    claim:
      'No branch merges without a review trail: every branch opens with a charter and a machine-checkable definition of done, and a cold reader who never saw the work signs the audit.',
  },
  {
    id: 'outbound-gate',
    claim:
      'Outbound work ships through a quality gate of its own: 45 rules and 440 test fixtures — including forged-report and ghost-input attacks — self-tested in CI on every push.',
  },
  {
    id: 'money-lock',
    claim:
      'Money has its own lock: paid generation runs only after a person approves the exact hash of what will be generated — no agent path can click that button.',
  },
  {
    id: 'this-page',
    claim:
      'This page was assembled by agents working under those gates — charter, build-on-commit, audit line, then a person approved it.',
  },
];
