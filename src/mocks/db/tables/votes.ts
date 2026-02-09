/**
 * Votes Table (Mock Data)
 * Voting instances - lean table with polymorphic entity relationships
 */

export interface VoteRow {
  id: string;
  entityType?: 'agenda' | 'agenda_item' | 'minutes' | 'action_item' | 'resolution';
  entityId?: string;
  meetingId: string;
  boardId: string;
  title: string;
  description?: string;
  status: 'draft' | 'configured' | 'open' | 'closed' | 'archived';
  outcome?: 'passed' | 'failed' | 'invalid';
  createdBy: number;
  createdByName: string;
  createdAt: string;
  openedAt?: string;
  closedAt?: string;
}

export const votesTable: VoteRow[] = [
  // ========================================================================
  // MTG-002: Annual Budget Approval (draft.complete) - 2 votes
  // Status: 'draft' - votes configured but not opened (meeting hasn't happened)
  // ========================================================================

  // Vote 1: Approval of Previous Minutes
  {
    id: 'vote-mtg002-001',
    entityType: 'agenda_item',
    entityId: 'item-MTG-002-002',
    meetingId: 'MTG-002',
    boardId: 'ktda-ms',
    title: 'Approval of December 2025 Minutes',
    description: 'Approve the minutes of the December 2025 board meeting as presented',
    status: 'draft',
    outcome: undefined,
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-02-08T09:00:00Z',
    openedAt: undefined,
    closedAt: undefined,
  },

  // Vote 2: Approval of 2026 Annual Budget
  {
    id: 'vote-mtg002-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-002-004',
    meetingId: 'MTG-002',
    boardId: 'ktda-ms',
    title: 'Approval of 2026 Annual Budget',
    description: 'Approve the proposed 2026 annual budget and financial projections totaling KES 450M',
    status: 'draft',
    outcome: undefined,
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-02-09T10:30:00Z',
    openedAt: undefined,
    closedAt: undefined,
  },

  // ========================================================================
  // MTG-006: Emergency Board Meeting (in_progress) - 3 votes
  // Status: 'closed' - votes opened, cast, and closed during meeting
  // ========================================================================

  // Vote 1: Emergency Response Plan Approval
  {
    id: 'vote-mtg006-001',
    entityType: 'agenda_item',
    entityId: 'item-MTG-006-004',
    meetingId: 'MTG-006',
    boardId: 'ktda-ms',
    title: 'Approval of Emergency Response Actions',
    description: 'Approve immediate emergency response measures including market stabilization and stakeholder communications',
    status: 'closed',
    outcome: 'passed',
    createdBy: 1,
    createdByName: 'Hon. Chege Kirundi',
    createdAt: '2026-02-04T14:30:00Z',
    openedAt: '2026-02-04T14:32:00Z',
    closedAt: '2026-02-04T14:38:00Z',
  },

  // Vote 2: Emergency Budget Authorization
  {
    id: 'vote-mtg006-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-006-003',
    meetingId: 'MTG-006',
    boardId: 'ktda-ms',
    title: 'Authorization of Emergency Budget Allocation',
    description: 'Authorize emergency budget allocation of KES 25M for crisis response activities',
    status: 'closed',
    outcome: 'passed',
    createdBy: 1,
    createdByName: 'Hon. Chege Kirundi',
    createdAt: '2026-02-04T14:50:00Z',
    openedAt: '2026-02-04T14:52:00Z',
    closedAt: '2026-02-04T14:57:00Z',
  },

  // Vote 3: Communications Strategy Approval
  {
    id: 'vote-mtg006-003',
    entityType: 'agenda_item',
    entityId: 'item-MTG-006-003',
    meetingId: 'MTG-006',
    boardId: 'ktda-ms',
    title: 'Approval of Crisis Communication Strategy',
    description: 'Approve the crisis communication strategy and authorize CEO to execute stakeholder communications',
    status: 'closed',
    outcome: 'passed',
    createdBy: 1,
    createdByName: 'Hon. Chege Kirundi',
    createdAt: '2026-02-04T15:00:00Z',
    openedAt: '2026-02-04T15:02:00Z',
    closedAt: '2026-02-04T15:08:00Z',
  },

  // ========================================================================
  // MTG-007: KETEPA January Meeting (completed.recent) - 3 votes
  // Status: 'closed' - votes completed with results computed
  // ========================================================================

  // Vote 1: Approval of December Minutes
  {
    id: 'vote-mtg007-001',
    entityType: 'agenda_item',
    entityId: 'item-MTG-007-002',
    meetingId: 'MTG-007',
    boardId: 'ketepa',
    title: 'Approval of December 2025 Minutes',
    description: 'Approve the minutes of the December 2025 KETEPA board meeting as presented',
    status: 'closed',
    outcome: 'passed',
    createdBy: 18,
    createdByName: 'Isaac Chege',
    createdAt: '2026-01-20T10:05:00Z',
    openedAt: '2026-01-20T10:06:00Z',
    closedAt: '2026-01-20T10:13:00Z',
  },

  // Vote 2: Approval of Q1 Operational Budget
  {
    id: 'vote-mtg007-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-007-003',
    meetingId: 'MTG-007',
    boardId: 'ketepa',
    title: 'Approval of Q1 2026 Operational Budget',
    description: 'Approve the Q1 2026 operational budget allocation of KES 8.5M for production and operations',
    status: 'closed',
    outcome: 'passed',
    createdBy: 6,
    createdByName: 'Patrick Njoroge',
    createdAt: '2026-01-20T10:40:00Z',
    openedAt: '2026-01-20T10:42:00Z',
    closedAt: '2026-01-20T10:48:00Z',
  },

  // Vote 3: Sales Performance Targets
  {
    id: 'vote-mtg007-003',
    entityType: 'agenda_item',
    entityId: 'item-MTG-007-004',
    meetingId: 'MTG-007',
    boardId: 'ketepa',
    title: 'Approval of Sales Performance Targets',
    description: 'Approve the revised sales performance targets for Q1 2026 export markets',
    status: 'closed',
    outcome: 'passed',
    createdBy: 6,
    createdByName: 'Patrick Njoroge',
    createdAt: '2026-01-20T11:02:00Z',
    openedAt: '2026-01-20T11:04:00Z',
    closedAt: '2026-01-20T11:10:00Z',
  },

  // ========================================================================
  // MTG-008: Chai Trading Q4 Review (completed.archived) - 2 votes
  // Status: 'archived' - historical votes from archived meeting
  // ========================================================================

  // Vote 1: Approval of Q3 Minutes
  {
    id: 'vote-mtg008-001',
    entityType: 'agenda_item',
    entityId: 'item-MTG-008-002',
    meetingId: 'MTG-008',
    boardId: 'chai-trading',
    title: 'Approval of Q3 2025 Minutes',
    description: 'Approve the minutes of the Q3 2025 board meeting as presented',
    status: 'archived',
    outcome: 'passed',
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2025-10-15T10:05:00Z',
    openedAt: '2025-10-15T10:06:00Z',
    closedAt: '2025-10-15T10:12:00Z',
  },

  // Vote 2: Export Contract Terms Approval
  {
    id: 'vote-mtg008-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-008-004',
    meetingId: 'MTG-008',
    boardId: 'chai-trading',
    title: 'Export Contract Terms Approval',
    description: 'Approve the revised export contract terms for Q4 2025 with updated pricing structures',
    status: 'archived',
    outcome: 'passed',
    createdBy: 1,
    createdByName: 'Hon. Chege Kirundi',
    createdAt: '2025-10-15T11:12:00Z',
    openedAt: '2025-10-15T11:14:00Z',
    closedAt: '2025-10-15T11:22:00Z',
  },
];
