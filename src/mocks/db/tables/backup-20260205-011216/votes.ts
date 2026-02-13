/**
 * Votes Table (Mock Data)
 * Voting instances - lean table with polymorphic entity relationships
 */

export interface VoteRow {
  id: string;
  entityType: 'agenda_item' | 'minutes' | 'action_item' | 'resolution';
  entityId: string;
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
  // MTG-008: KETEPA Board Meeting (January 2025) - COMPLETED
  // ========================================================================

  // Vote 1: Approval of December Minutes
  {
    id: 'vote-mtg008-001',
    entityType: 'agenda_item',
    entityId: 'item-mtg008-002',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Approval of December 2024 Minutes',
    description: 'Approve the minutes of the December 2024 board meeting as presented',
    status: 'closed',
    outcome: 'passed',
    createdBy: 3,
    createdByName: 'Mathews Odero',
    createdAt: '2025-01-20T10:05:00Z',
    openedAt: '2025-01-20T10:06:00Z',
    closedAt: '2025-01-20T10:08:00Z',
  },

  // Vote 2: Export Market Strategy Approval
  {
    id: 'vote-mtg008-002',
    entityType: 'agenda_item',
    entityId: 'item-mtg008-005',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Export Market Strategy Approval',
    description: 'Approve the proposed East African market expansion strategy with a budget allocation of KES 12M',
    status: 'closed',
    outcome: 'passed',
    createdBy: 3,
    createdByName: 'Mathews Odero',
    createdAt: '2025-01-20T11:24:00Z',
    openedAt: '2025-01-20T11:25:00Z',
    closedAt: '2025-01-20T11:30:00Z',
  },

  // ========================================================================
  // MTG-002: Emergency Strategy Meeting - COMPLETED
  // ========================================================================

  // Vote 3: Approve Immediate Response Actions
  {
    id: 'vote-mtg002-001',
    entityType: 'agenda_item',
    entityId: 'item-mtg002-005',
    meetingId: 'mtg-002',
    boardId: 'ktda-ms',
    title: 'Emergency Response Actions',
    description: 'Approve the emergency response actions including market stabilization measures and communication plan',
    status: 'closed',
    outcome: 'passed',
    createdBy: 1,
    createdByName: 'Hon. Chege Kirundi',
    createdAt: '2026-01-15T15:57:00Z',
    openedAt: '2026-01-15T15:58:00Z',
    closedAt: '2026-01-15T16:03:00Z',
  },
];
