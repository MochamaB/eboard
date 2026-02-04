/**
 * Vote Results Table (Mock Data)
 * Cached computed results - DERIVED from votes_cast
 * Results are always recomputable; this is for performance only
 */

export interface VoteResultRow {
  voteId: string;
  optionId: string;
  optionLabel: string;
  totalWeight: number;
  voteCount: number;
  percentage: number;
  isWinner: boolean;
}

export interface VoteResultsSummaryRow {
  voteId: string;
  totalEligible: number;
  totalVoted: number;
  totalWeight: number;
  quorumRequired: number;
  quorumMet: boolean;
  thresholdPercentage: number;
  outcome: 'passed' | 'failed' | 'invalid';
  computedAt: string;
}

export const voteResultsTable: VoteResultRow[] = [
  // ========================================================================
  // Vote 1: MTG-008 - Minutes Approval (vote-mtg008-001)
  // Result: 3 Yes (100%), 0 No (0%), 0 Abstain (0%)
  // ========================================================================
  {
    voteId: 'vote-mtg008-001',
    optionId: 'opt-vote-mtg008-001-yes',
    optionLabel: 'Yes',
    totalWeight: 3.0,
    voteCount: 3,
    percentage: 100.0,
    isWinner: true,
  },
  {
    voteId: 'vote-mtg008-001',
    optionId: 'opt-vote-mtg008-001-no',
    optionLabel: 'No',
    totalWeight: 0.0,
    voteCount: 0,
    percentage: 0.0,
    isWinner: false,
  },
  {
    voteId: 'vote-mtg008-001',
    optionId: 'opt-vote-mtg008-001-abstain',
    optionLabel: 'Abstain',
    totalWeight: 0.0,
    voteCount: 0,
    percentage: 0.0,
    isWinner: false,
  },

  // ========================================================================
  // Vote 2: MTG-008 - Export Strategy (vote-mtg008-002)
  // Result: 3 Yes (100%), 0 No (0%), 0 Abstain (0%)
  // ========================================================================
  {
    voteId: 'vote-mtg008-002',
    optionId: 'opt-vote-mtg008-002-yes',
    optionLabel: 'Yes',
    totalWeight: 3.0,
    voteCount: 3,
    percentage: 100.0,
    isWinner: true,
  },
  {
    voteId: 'vote-mtg008-002',
    optionId: 'opt-vote-mtg008-002-no',
    optionLabel: 'No',
    totalWeight: 0.0,
    voteCount: 0,
    percentage: 0.0,
    isWinner: false,
  },
  {
    voteId: 'vote-mtg008-002',
    optionId: 'opt-vote-mtg008-002-abstain',
    optionLabel: 'Abstain',
    totalWeight: 0.0,
    voteCount: 0,
    percentage: 0.0,
    isWinner: false,
  },

  // ========================================================================
  // Vote 3: MTG-002 - Emergency Actions (vote-mtg002-001)
  // Result: 6 Yes (85.7%), 0 No (0%), 1 Abstain (14.3%)
  // Note: Percentage calculated on decisive votes only (6 yes / 6 decisive = 100%)
  // ========================================================================
  {
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-yes',
    optionLabel: 'Yes',
    totalWeight: 6.0,
    voteCount: 6,
    percentage: 100.0, // 6 out of 6 decisive votes
    isWinner: true,
  },
  {
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-no',
    optionLabel: 'No',
    totalWeight: 0.0,
    voteCount: 0,
    percentage: 0.0,
    isWinner: false,
  },
  {
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-abstain',
    optionLabel: 'Abstain',
    totalWeight: 1.0,
    voteCount: 1,
    percentage: 0.0, // Not counted in percentage calculation
    isWinner: false,
  },
];

export const voteResultsSummariesTable: VoteResultsSummaryRow[] = [
  // Vote 1: MTG-008 - Minutes Approval
  {
    voteId: 'vote-mtg008-001',
    totalEligible: 3,
    totalVoted: 3,
    totalWeight: 3.0,
    quorumRequired: 2, // 50% of 3
    quorumMet: true,
    thresholdPercentage: 50.0,
    outcome: 'passed',
    computedAt: '2025-01-15T10:08:05.000Z',
  },

  // Vote 2: MTG-008 - Export Strategy
  {
    voteId: 'vote-mtg008-002',
    totalEligible: 3,
    totalVoted: 3,
    totalWeight: 3.0,
    quorumRequired: 2, // 50% of 3
    quorumMet: true,
    thresholdPercentage: 50.0,
    outcome: 'passed',
    computedAt: '2025-01-15T11:30:05.000Z',
  },

  // Vote 3: MTG-002 - Emergency Actions
  {
    voteId: 'vote-mtg002-001',
    totalEligible: 7,
    totalVoted: 7,
    totalWeight: 7.0,
    quorumRequired: 4, // 50% of 7 (rounded up)
    quorumMet: true,
    thresholdPercentage: 50.0,
    outcome: 'passed',
    computedAt: '2025-01-08T16:03:05.000Z',
  },
];
