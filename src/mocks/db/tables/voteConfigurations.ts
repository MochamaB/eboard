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
  // Configuration for vote-mtg008-001
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
    createdAt: '2025-01-20T10:05:00Z',
  },

  // Configuration for vote-mtg008-002
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
    createdAt: '2025-01-20T11:24:00Z',
  },

  // Configuration for vote-mtg002-001
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
    createdAt: '2026-01-15T15:57:00Z',
  },
];
