import type { Evidence } from './types';

/**
 * The governance layer that ALREADY runs Eric's studio operation — the
 * receipts behind the powerhouse principles. Inventoried 2026-08-29 by a
 * read-only sweep (counts read from files, nothing executed).
 *
 * Display vocabulary rule (from 2026-08-29 market research): the market's
 * words are "approval workflow / human sign-off / review trail / pipeline",
 * NOT "harness" — internal codenames (LGSA, hook, worktree, repo names of
 * private systems) never render.
 *
 * Public-receipt status: only ai-drsfilms-astro and ai-drsfilms-portfolio
 * are public repos. Whether to LINK the public quality-gate directory (it
 * exposes the job-application machinery) is Eric's call — see pending.ts:
 * governance-public-links. Until he rules, entries render as descriptions
 * without repo links.
 */

export interface GovernanceReceipt {
  id: string;
  /** Display line, market vocabulary, no codenames. */
  claim: string;
  evidence: Evidence;
}

export const governance: GovernanceReceipt[] = [
  {
    id: 'commit-gate',
    claim:
      '131 adversarial tests guard the commit gate every project on his machine passes through — protected branches locked, disguised commands caught before they reach git.',
    evidence: {
      source:
        'VSCODE_CC/.claude/hooks/lgsa-guardrails.js (1,168 lines, registered machine-wide in settings.json) + lgsa-guardrails.test.js: 131 cases counted (76 deny, 55 allow). Inventory 2026-08-29.',
      verification: 'self',
      note: 'Machine-local; no public link. Sanitized excerpt publishable if Eric wants — pending.ts.',
    },
  },
  {
    id: 'audit-trail',
    claim:
      'No branch merges without a review trail: every branch opens with a charter and a machine-checkable definition of done, and a cold reader who never saw the work signs the audit.',
    evidence: {
      source:
        'LOOP-STATE protocol with CHARTER/AUDIT/USABLE lines, enforced by the commit gate; blind-audit grading rule (真盲审 vs 指挥层复核) in ~/.claude/CLAUDE.md. Visible in this public repo: LOOP-STATE.md on branch feat/data-archive.',
      verification: 'public',
      checkedAt: '2026-08-29',
      note: 'The LOOP-STATE.md files in the two public repos are themselves the public receipt.',
    },
  },
  {
    id: 'outbound-gate',
    claim:
      'Outbound work ships through a quality gate of its own: 45 rules and 440 test fixtures — including forged-report and ghost-input attacks — self-tested in CI on every push.',
    evidence: {
      source:
        'ai-drsfilms-portfolio/harness/: rules/rules.json (45 rule IDs, 466 lines), 61 fixture dirs / 440 files, cli.js exit-code contract, .github/workflows/career-hop-harness.yml runs --self-test on push and PR. Inventory 2026-08-29.',
      verification: 'public',
      checkedAt: '2026-08-29',
      note: 'Lives in this public repo but is the job-application machinery — whether to link it directly is Eric\'s call (pending.ts: governance-public-links). Claim wording deliberately says "outbound work", not "job applications".',
    },
  },
  {
    id: 'money-lock',
    claim:
      'Money has its own lock: paid generation runs only after a person approves the exact hash of what will be generated — no agent path can click that button.',
    evidence: {
      source:
        'P007 CLAUDE.md invariant ("G6 exact-hash approval is always a manual click by Eric, no automated/agent path may bypass"); FastLane contracts/APPROVAL-GATES.md hash-bound payment plans; G0-G7 gate constraint in SECURITY_AUDIT_REPORT.md (DB CHECK). Inventory 2026-08-29.',
      verification: 'self',
      note: 'Private repos; renders as system description without links or codenames.',
    },
  },
  {
    id: 'this-page',
    claim:
      'This page was assembled by agents working under those gates — charter, build-on-commit, audit line, then a person approved it.',
    evidence: {
      source:
        'This repo: branch feat/data-archive LOOP-STATE.md (CHARTER blocks, AUDIT/USABLE lines, evidence log), commits gated by the machine-wide build hook.',
      verification: 'public',
      checkedAt: '2026-08-29',
    },
  },
];
