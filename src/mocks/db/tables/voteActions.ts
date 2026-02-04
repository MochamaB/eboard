/**
 * Vote Actions Table (Mock Data)
 * Audit log - captures EVERY action in voting lifecycle
 * Critical for traceability and legal defensibility
 */

export type VoteActionType =
  | 'created'
  | 'configured'
  | 'opened'
  | 'vote_cast'
  | 'vote_changed'
  | 'closed'
  | 'results_generated'
  | 'reopened'
  | 'archived';

export interface VoteActionRow {
  id: string;
  voteId: string;
  actionType: VoteActionType;
  performedBy: number;
  performedByName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const voteActionsTable: VoteActionRow[] = [
  // ========================================================================
  // Vote 1: MTG-008 - Minutes Approval (vote-mtg008-001)
  // ========================================================================
  {
    id: 'action-vote-mtg008-001-001',
    voteId: 'vote-mtg008-001',
    actionType: 'created',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    metadata: {
      entityType: 'agenda_item',
      entityId: 'item-mtg008-002',
    },
    createdAt: '2025-01-15T10:05:00.000Z',
  },
  {
    id: 'action-vote-mtg008-001-002',
    voteId: 'vote-mtg008-001',
    actionType: 'configured',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    metadata: {
      votingMethod: 'yes_no_abstain',
      quorumRequired: true,
      passingRule: 'simple_majority',
    },
    createdAt: '2025-01-15T10:05:15.000Z',
  },
  {
    id: 'action-vote-mtg008-001-003',
    voteId: 'vote-mtg008-001',
    actionType: 'opened',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      totalEligible: 3,
    },
    createdAt: '2025-01-15T10:06:00.000Z',
  },
  {
    id: 'action-vote-mtg008-001-004',
    voteId: 'vote-mtg008-001',
    actionType: 'vote_cast',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      optionId: 'opt-vote-mtg008-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-15T10:06:30.000Z',
  },
  {
    id: 'action-vote-mtg008-001-005',
    voteId: 'vote-mtg008-001',
    actionType: 'vote_cast',
    performedBy: 4,
    performedByName: 'Hon G.G Kagombe',
    metadata: {
      optionId: 'opt-vote-mtg008-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-15T10:07:15.000Z',
  },
  {
    id: 'action-vote-mtg008-001-006',
    voteId: 'vote-mtg008-001',
    actionType: 'vote_cast',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    metadata: {
      optionId: 'opt-vote-mtg008-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-15T10:07:45.000Z',
  },
  {
    id: 'action-vote-mtg008-001-007',
    voteId: 'vote-mtg008-001',
    actionType: 'closed',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      reason: 'All eligible voters have cast their votes',
    },
    createdAt: '2025-01-15T10:08:00.000Z',
  },
  {
    id: 'action-vote-mtg008-001-008',
    voteId: 'vote-mtg008-001',
    actionType: 'results_generated',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      outcome: 'passed',
      totalVoted: 3,
      quorumMet: true,
    },
    createdAt: '2025-01-15T10:08:05.000Z',
  },

  // ========================================================================
  // Vote 2: MTG-008 - Export Strategy (vote-mtg008-002)
  // ========================================================================
  {
    id: 'action-vote-mtg008-002-001',
    voteId: 'vote-mtg008-002',
    actionType: 'created',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    metadata: {
      entityType: 'agenda_item',
      entityId: 'item-mtg008-005',
    },
    createdAt: '2025-01-15T11:23:00.000Z',
  },
  {
    id: 'action-vote-mtg008-002-002',
    voteId: 'vote-mtg008-002',
    actionType: 'configured',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    metadata: {
      votingMethod: 'yes_no_abstain',
      quorumRequired: true,
      passingRule: 'simple_majority',
    },
    createdAt: '2025-01-15T11:23:30.000Z',
  },
  {
    id: 'action-vote-mtg008-002-003',
    voteId: 'vote-mtg008-002',
    actionType: 'opened',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      totalEligible: 3,
    },
    createdAt: '2025-01-15T11:25:00.000Z',
  },
  {
    id: 'action-vote-mtg008-002-004',
    voteId: 'vote-mtg008-002',
    actionType: 'vote_cast',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      optionId: 'opt-vote-mtg008-002-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-15T11:26:00.000Z',
  },
  {
    id: 'action-vote-mtg008-002-005',
    voteId: 'vote-mtg008-002',
    actionType: 'vote_cast',
    performedBy: 4,
    performedByName: 'Hon G.G Kagombe',
    metadata: {
      optionId: 'opt-vote-mtg008-002-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-15T11:27:30.000Z',
  },
  {
    id: 'action-vote-mtg008-002-006',
    voteId: 'vote-mtg008-002',
    actionType: 'vote_cast',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    metadata: {
      optionId: 'opt-vote-mtg008-002-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-15T11:29:00.000Z',
  },
  {
    id: 'action-vote-mtg008-002-007',
    voteId: 'vote-mtg008-002',
    actionType: 'closed',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      reason: 'All eligible voters have cast their votes',
    },
    createdAt: '2025-01-15T11:30:00.000Z',
  },
  {
    id: 'action-vote-mtg008-002-008',
    voteId: 'vote-mtg008-002',
    actionType: 'results_generated',
    performedBy: 3,
    performedByName: 'Mathews Odiero',
    metadata: {
      outcome: 'passed',
      totalVoted: 3,
      quorumMet: true,
    },
    createdAt: '2025-01-15T11:30:05.000Z',
  },

  // ========================================================================
  // Vote 3: MTG-002 - Emergency Actions (vote-mtg002-001)
  // ========================================================================
  {
    id: 'action-vote-mtg002-001-001',
    voteId: 'vote-mtg002-001',
    actionType: 'created',
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    metadata: {
      entityType: 'agenda_item',
      entityId: 'item-mtg002-005',
    },
    createdAt: '2025-01-08T15:56:00.000Z',
  },
  {
    id: 'action-vote-mtg002-001-002',
    voteId: 'vote-mtg002-001',
    actionType: 'configured',
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    metadata: {
      votingMethod: 'yes_no_abstain',
      quorumRequired: true,
      passingRule: 'simple_majority',
    },
    createdAt: '2025-01-08T15:56:30.000Z',
  },
  {
    id: 'action-vote-mtg002-001-003',
    voteId: 'vote-mtg002-001',
    actionType: 'opened',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    metadata: {
      totalEligible: 7,
    },
    createdAt: '2025-01-08T15:58:00.000Z',
  },
  {
    id: 'action-vote-mtg002-001-004',
    voteId: 'vote-mtg002-001',
    actionType: 'vote_cast',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    metadata: {
      optionId: 'opt-vote-mtg002-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-08T15:59:00.000Z',
  },
  {
    id: 'action-vote-mtg002-001-005',
    voteId: 'vote-mtg002-001',
    actionType: 'vote_cast',
    performedBy: 2,
    performedByName: 'James Ombasa Omweno',
    metadata: {
      optionId: 'opt-vote-mtg002-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-08T15:59:30.000Z',
  },
  {
    id: 'action-vote-mtg002-001-006',
    voteId: 'vote-mtg002-001',
    actionType: 'vote_cast',
    performedBy: 4,
    performedByName: 'Hon G.G Kagombe',
    metadata: {
      optionId: 'opt-vote-mtg002-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-08T16:00:00.000Z',
  },
  {
    id: 'action-vote-mtg002-001-007',
    voteId: 'vote-mtg002-001',
    actionType: 'vote_cast',
    performedBy: 5,
    performedByName: 'James Githinji Mwangi',
    metadata: {
      optionId: 'opt-vote-mtg002-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-08T16:00:45.000Z',
  },
  {
    id: 'action-vote-mtg002-001-008',
    voteId: 'vote-mtg002-001',
    actionType: 'vote_cast',
    performedBy: 6,
    performedByName: "David Ndung'u",
    metadata: {
      optionId: 'opt-vote-mtg002-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-08T16:01:15.000Z',
  },
  {
    id: 'action-vote-mtg002-001-009',
    voteId: 'vote-mtg002-001',
    actionType: 'vote_cast',
    performedBy: 7,
    performedByName: 'John Mthamo Wasusana',
    metadata: {
      optionId: 'opt-vote-mtg002-001-yes',
      weight: 1.0,
    },
    createdAt: '2025-01-08T16:01:45.000Z',
  },
  {
    id: 'action-vote-mtg002-001-010',
    voteId: 'vote-mtg002-001',
    actionType: 'vote_cast',
    performedBy: 8,
    performedByName: 'Enos Njeru',
    metadata: {
      optionId: 'opt-vote-mtg002-001-abstain',
      weight: 1.0,
    },
    createdAt: '2025-01-08T16:02:30.000Z',
  },
  {
    id: 'action-vote-mtg002-001-011',
    voteId: 'vote-mtg002-001',
    actionType: 'closed',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    metadata: {
      reason: 'All eligible voters have cast their votes',
    },
    createdAt: '2025-01-08T16:03:00.000Z',
  },
  {
    id: 'action-vote-mtg002-001-012',
    voteId: 'vote-mtg002-001',
    actionType: 'results_generated',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    metadata: {
      outcome: 'passed',
      totalVoted: 7,
      quorumMet: true,
    },
    createdAt: '2025-01-08T16:03:05.000Z',
  },
];
