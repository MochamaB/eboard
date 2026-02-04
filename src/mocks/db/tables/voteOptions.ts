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
  // Options for vote-mtg008-001 (Minutes Approval)
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
  // Options for vote-mtg008-002 (Export Strategy)
  // ========================================================================
  {
    id: 'opt-vote-mtg008-002-yes',
    voteId: 'vote-mtg008-002',
    label: 'Yes',
    description: 'Approve the export strategy and budget',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg008-002-no',
    voteId: 'vote-mtg008-002',
    label: 'No',
    description: 'Reject the export strategy',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg008-002-abstain',
    voteId: 'vote-mtg008-002',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },

  // ========================================================================
  // Options for vote-mtg002-001 (Emergency Actions)
  // ========================================================================
  {
    id: 'opt-vote-mtg002-001-yes',
    voteId: 'vote-mtg002-001',
    label: 'Yes',
    description: 'Approve the emergency response actions',
    displayOrder: 1,
  },
  {
    id: 'opt-vote-mtg002-001-no',
    voteId: 'vote-mtg002-001',
    label: 'No',
    description: 'Reject the emergency response actions',
    displayOrder: 2,
  },
  {
    id: 'opt-vote-mtg002-001-abstain',
    voteId: 'vote-mtg002-001',
    label: 'Abstain',
    description: 'Abstain from voting',
    displayOrder: 3,
  },
];
