/**
 * Vote Options Table (Mock Data)
 * Choices available for each vote
 */

export interface VoteOptionRow {
  id: string;
  voteId: string;
  label: string;
  description?: string;
  displayOrder: number;
}

export const voteOptionsTable: VoteOptionRow[] = [
  // ========================================================================
  // MTG-002: Annual Budget Approval - Vote 1 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg002-001-yes',
    voteId: 'vote-mtg002-001',
    label: 'Yes',
    description: 'Approve the minutes as presented',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg002-001-no',
    voteId: 'vote-mtg002-001',
    label: 'No',
    description: 'Reject the minutes',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg002-001-abstain',
    voteId: 'vote-mtg002-001',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-002: Annual Budget Approval - Vote 2 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg002-002-yes',
    voteId: 'vote-mtg002-002',
    label: 'Yes',
    description: 'Approve the 2026 annual budget',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg002-002-no',
    voteId: 'vote-mtg002-002',
    label: 'No',
    description: 'Reject the 2026 annual budget',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg002-002-abstain',
    voteId: 'vote-mtg002-002',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-006: Emergency Board Meeting - Vote 1 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg006-001-yes',
    voteId: 'vote-mtg006-001',
    label: 'Yes',
    description: 'Approve the emergency response actions',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg006-001-no',
    voteId: 'vote-mtg006-001',
    label: 'No',
    description: 'Reject the emergency response actions',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg006-001-abstain',
    voteId: 'vote-mtg006-001',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-006: Emergency Board Meeting - Vote 2 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg006-002-yes',
    voteId: 'vote-mtg006-002',
    label: 'Yes',
    description: 'Authorize the emergency budget allocation',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg006-002-no',
    voteId: 'vote-mtg006-002',
    label: 'No',
    description: 'Reject the emergency budget allocation',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg006-002-abstain',
    voteId: 'vote-mtg006-002',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-006: Emergency Board Meeting - Vote 3 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg006-003-yes',
    voteId: 'vote-mtg006-003',
    label: 'Yes',
    description: 'Approve the crisis communication strategy',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg006-003-no',
    voteId: 'vote-mtg006-003',
    label: 'No',
    description: 'Reject the crisis communication strategy',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg006-003-abstain',
    voteId: 'vote-mtg006-003',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-007: KETEPA January Meeting - Vote 1 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg007-001-yes',
    voteId: 'vote-mtg007-001',
    label: 'Yes',
    description: 'Approve the minutes as presented',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg007-001-no',
    voteId: 'vote-mtg007-001',
    label: 'No',
    description: 'Reject the minutes',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg007-001-abstain',
    voteId: 'vote-mtg007-001',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-007: KETEPA January Meeting - Vote 2 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg007-002-yes',
    voteId: 'vote-mtg007-002',
    label: 'Yes',
    description: 'Approve the Q1 operational budget',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg007-002-no',
    voteId: 'vote-mtg007-002',
    label: 'No',
    description: 'Reject the Q1 operational budget',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg007-002-abstain',
    voteId: 'vote-mtg007-002',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-007: KETEPA January Meeting - Vote 3 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg007-003-yes',
    voteId: 'vote-mtg007-003',
    label: 'Yes',
    description: 'Approve the sales performance targets',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg007-003-no',
    voteId: 'vote-mtg007-003',
    label: 'No',
    description: 'Reject the sales performance targets',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg007-003-abstain',
    voteId: 'vote-mtg007-003',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-008: Chai Trading Q4 Review - Vote 1 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg008-001-yes',
    voteId: 'vote-mtg008-001',
    label: 'Yes',
    description: 'Approve the minutes as presented',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg008-001-no',
    voteId: 'vote-mtg008-001',
    label: 'No',
    description: 'Reject the minutes',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg008-001-abstain',
    voteId: 'vote-mtg008-001',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // MTG-008: Chai Trading Q4 Review - Vote 2 Options
  // ========================================================================
  {
    id: 'opt-vote-mtg008-002-yes',
    voteId: 'vote-mtg008-002',
    label: 'Yes',
    description: 'Approve the export contract terms',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg008-002-no',
    voteId: 'vote-mtg008-002',
    label: 'No',
    description: 'Reject the export contract terms',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg008-002-abstain',
    voteId: 'vote-mtg008-002',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },
];
