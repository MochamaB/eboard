/**
 * Vote Configurations Table (Mock Data)
 * Immutable rules snapshot - locked after voting opens
 */

export interface VoteConfigurationRow {
  id: string;
  voteId: string;
  votingMethod: 'yes_no' | 'yes_no_abstain' | 'multiple_choice' | 'ranked';
  quorumRequired: boolean;
  quorumPercentage: number;
  passThresholdPercentage: number;
  passingRule: 'simple_majority' | 'two_thirds' | 'three_quarters' | 'unanimous';
  anonymous: boolean;
  allowAbstain: boolean;
  allowChangeVote: boolean;
  timeLimit?: number;
  autoCloseWhenAllVoted: boolean;
  createdAt: string;
}

export const voteConfigurationsTable: VoteConfigurationRow[] = [
  // ========================================================================
  // MTG-002: Annual Budget Approval - 2 configurations
  // ========================================================================
  {
    id: 'config-vote-mtg002-001',
    voteId: 'vote-mtg002-001',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 50,
    passingRule: 'simple_majority',
    anonymous: false, // Open ballot
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-02-08T09:00:00Z',
  },

  {
    id: 'config-vote-mtg002-002',
    voteId: 'vote-mtg002-002',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 66.67, // Two-thirds for budget approval
    passingRule: 'two_thirds',
    anonymous: false,
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-02-09T10:30:00Z',
  },

  // ========================================================================
  // MTG-006: Emergency Board Meeting - 3 configurations
  // ========================================================================
  {
    id: 'config-vote-mtg006-001',
    voteId: 'vote-mtg006-001',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 50,
    passingRule: 'simple_majority',
    anonymous: false,
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-02-04T14:30:00Z',
  },

  {
    id: 'config-vote-mtg006-002',
    voteId: 'vote-mtg006-002',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 66.67, // Two-thirds for emergency budget
    passingRule: 'two_thirds',
    anonymous: false,
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-02-04T14:50:00Z',
  },

  {
    id: 'config-vote-mtg006-003',
    voteId: 'vote-mtg006-003',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 50,
    passingRule: 'simple_majority',
    anonymous: false,
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-02-04T15:00:00Z',
  },

  // ========================================================================
  // MTG-007: KETEPA January Meeting - 3 configurations
  // ========================================================================
  {
    id: 'config-vote-mtg007-001',
    voteId: 'vote-mtg007-001',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 50,
    passingRule: 'simple_majority',
    anonymous: false,
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-01-20T10:05:00Z',
  },

  {
    id: 'config-vote-mtg007-002',
    voteId: 'vote-mtg007-002',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 66.67, // Two-thirds for budget approval
    passingRule: 'two_thirds',
    anonymous: false,
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-01-20T10:40:00Z',
  },

  {
    id: 'config-vote-mtg007-003',
    voteId: 'vote-mtg007-003',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 50,
    passingRule: 'simple_majority',
    anonymous: false,
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2026-01-20T11:02:00Z',
  },

  // ========================================================================
  // MTG-008: Chai Trading Q4 Review - 2 configurations
  // ========================================================================
  {
    id: 'config-vote-mtg008-001',
    voteId: 'vote-mtg008-001',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 50,
    passingRule: 'simple_majority',
    anonymous: false, // Open ballot
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2025-10-15T10:05:00Z',
  },

  {
    id: 'config-vote-mtg008-002',
    voteId: 'vote-mtg008-002',
    votingMethod: 'yes_no_abstain',
    quorumRequired: true,
    quorumPercentage: 50,
    passThresholdPercentage: 50,
    passingRule: 'simple_majority',
    anonymous: false, // Open ballot
    allowAbstain: true,
    allowChangeVote: false,
    timeLimit: undefined,
    autoCloseWhenAllVoted: true,
    createdAt: '2025-10-15T11:12:00Z',
  },
];
