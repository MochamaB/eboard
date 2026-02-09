/**
 * Resolutions Table (Mock Data)
 * Formal board decisions and resolutions from meetings
 */

export type ResolutionDecision = 'approved' | 'rejected' | 'tabled' | 'withdrawn' | 'consensus';
export type ResolutionCategory = 'policy' | 'financial' | 'operational' | 'strategic' | 'governance' | 'other';
export type ImplementationStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ResolutionRow {
  id: string;
  meetingId: string;
  boardId: string;

  // Resolution details
  resolutionNumber: string;
  title: string;
  text: string;
  category: ResolutionCategory;

  // Decision
  decision: ResolutionDecision;
  decisionDate: string;

  // Voting (optional - some resolutions are by consensus)
  voteId: string | null;
  voteSummary: string | null;

  // Related entities
  agendaItemId: string | null;
  relatedDocumentIds: string;

  // Follow-up
  requiresFollowUp: boolean;
  followUpDeadline: string | null;
  followUpNotes: string | null;

  // Implementation tracking
  implementationStatus: ImplementationStatus;
  implementedAt: string | null;

  // Metadata
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export const resolutionsTable: ResolutionRow[] = [
  // ========================================================================
  // MTG-008: KETEPA Board - January 2025 (2 resolutions)
  // ========================================================================

  {
    id: 'res-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    resolutionNumber: 'RES-KETE-2025-001',
    title: 'Approval of December 2024 Minutes',
    text: 'RESOLVED that the minutes of the December 2024 board meeting be and are hereby approved as presented without amendments.',
    category: 'governance',
    decision: 'approved',
    decisionDate: '2025-01-20',
    voteId: 'vote-mtg008-001',
    voteSummary: '3 Yes, 0 No, 0 Abstain',
    agendaItemId: 'item-mtg008-002',
    relatedDocumentIds: '["doc-mtg008-minutes-dec"]',
    requiresFollowUp: false,
    followUpDeadline: null,
    followUpNotes: null,
    implementationStatus: 'completed',
    implementedAt: '2025-01-20T10:08:00Z',
    createdBy: 18,
    createdAt: '2025-01-20T10:08:00Z',
    updatedAt: '2025-01-20T10:08:00Z',
  },

  {
    id: 'res-mtg008-002',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    resolutionNumber: 'RES-KETE-2025-002',
    title: 'Export Market Strategy Approval',
    text: 'RESOLVED that the proposed East African market expansion strategy targeting Tanzania and Uganda markets, with a total budget allocation of KES 12,000,000 (Twelve Million Kenya Shillings), be and is hereby approved for implementation commencing February 2025.',
    category: 'strategic',
    decision: 'approved',
    decisionDate: '2025-01-20',
    voteId: 'vote-mtg008-002',
    voteSummary: '3 Yes, 0 No, 0 Abstain',
    agendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '["doc-mtg008-strategy"]',
    requiresFollowUp: true,
    followUpDeadline: '2025-03-31',
    followUpNotes: 'Implementation progress to be reported in Q1 2025 board meeting. Market analysis and initial market entry activities to be completed by March 31, 2025.',
    implementationStatus: 'in_progress',
    implementedAt: null,
    createdBy: 18,
    createdAt: '2025-01-20T11:30:00Z',
    updatedAt: '2025-01-25T14:00:00Z',
  },

  // ========================================================================
  // MTG-002: Emergency Strategy Meeting (1 resolution)
  // ========================================================================

  {
    id: 'res-mtg002-001',
    meetingId: 'mtg-002',
    boardId: 'ktda-ms',
    resolutionNumber: 'RES-KTDA-2026-001',
    title: 'Emergency Response Actions',
    text: 'RESOLVED that the emergency response actions including market stabilization measures, communication plan, and stakeholder engagement strategy be and are hereby approved for immediate implementation to address current global tea market volatility.',
    category: 'operational',
    decision: 'approved',
    decisionDate: '2026-01-15',
    voteId: 'vote-mtg002-001',
    voteSummary: '6 Yes, 0 No, 1 Abstain',
    agendaItemId: 'item-mtg002-005',
    relatedDocumentIds: '["doc-mtg002-002", "doc-mtg002-003"]',
    requiresFollowUp: true,
    followUpDeadline: '2026-01-30',
    followUpNotes: 'Daily monitoring required. CEO to provide weekly progress reports to Chairman. Full impact assessment to be presented at next board meeting.',
    implementationStatus: 'in_progress',
    implementedAt: null,
    createdBy: 17,
    createdAt: '2026-01-15T16:03:00Z',
    updatedAt: '2026-01-16T10:00:00Z',
  },

  // ========================================================================
  // MTG-006: Finance Committee - January 2026 (1 resolution)
  // ========================================================================

  {
    id: 'res-mtg006-001',
    meetingId: 'mtg-006',
    boardId: 'comm-finance',
    resolutionNumber: 'RES-FINC-2026-001',
    title: 'Q1 Investment Portfolio Rebalancing',
    text: 'RESOLVED by consensus that the investment portfolio be rebalanced as recommended by the Chief Financial Officer, with increased allocation to fixed income instruments (40% to 55%) and reduced equity exposure (60% to 45%) to manage risk in current market conditions.',
    category: 'financial',
    decision: 'consensus',
    decisionDate: '2026-01-08',
    voteId: null,
    voteSummary: 'Approved by consensus - no formal vote required',
    agendaItemId: null,
    relatedDocumentIds: '[]',
    requiresFollowUp: true,
    followUpDeadline: '2026-02-15',
    followUpNotes: 'CFO to execute rebalancing by February 15, 2026. Performance review scheduled for next committee meeting.',
    implementationStatus: 'pending',
    implementedAt: null,
    createdBy: 18,
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
  },

  // ========================================================================
  // MTG-007: KTDA MS Board - January 2026 (1 resolution)
  // ========================================================================

  {
    id: 'res-mtg007-001',
    meetingId: 'mtg-007',
    boardId: 'ktda-ms',
    resolutionNumber: 'RES-KTDA-2026-002',
    title: 'Approve Q1 2026 Operational Budget',
    text: 'RESOLVED that the Q1 2026 Operational Budget totaling KES 520,000,000 (Five Hundred Twenty Million Kenya Shillings), comprising operational expenses of KES 380M, capital expenditure of KES 100M, and marketing and development costs of KES 40M, be and is hereby approved for implementation with immediate effect.',
    category: 'financial',
    decision: 'approved',
    decisionDate: '2026-01-28',
    voteId: 'vote-mtg007-001',
    voteSummary: '7 Yes, 0 No, 1 Abstain',
    agendaItemId: null,
    relatedDocumentIds: '["doc-q1-budget-2026"]',
    requiresFollowUp: true,
    followUpDeadline: '2026-04-30',
    followUpNotes: 'CFO to provide monthly budget execution reports. Mid-quarter review scheduled for mid-February. Any budget variances exceeding 10% to be reported immediately to board.',
    implementationStatus: 'pending',
    implementedAt: null,
    createdBy: 17,
    createdAt: '2026-01-28T12:30:00Z',
    updatedAt: '2026-01-28T12:30:00Z',
  },

  // ========================================================================
  // MTG-010: Chai Trading Board - January 2025 (1 resolution)
  // ========================================================================

  {
    id: 'res-mtg010-001',
    meetingId: 'mtg-010',
    boardId: 'chai-trading',
    resolutionNumber: 'RES-CHAI-2025-001',
    title: 'Export Contract Terms Approval',
    text: 'RESOLVED that the revised export contract terms for Q1 2025, including updated pricing structures, payment terms (30-day credit period), and quality specifications, be and are hereby approved for implementation with immediate effect.',
    category: 'operational',
    decision: 'approved',
    decisionDate: '2025-01-22',
    voteId: null,
    voteSummary: 'Unanimous approval - no formal vote required',
    agendaItemId: null,
    relatedDocumentIds: '[]',
    requiresFollowUp: false,
    followUpDeadline: null,
    followUpNotes: null,
    implementationStatus: 'completed',
    implementedAt: '2025-01-22T11:45:00Z',
    createdBy: 19,
    createdAt: '2025-01-22T11:45:00Z',
    updatedAt: '2025-01-22T11:45:00Z',
  },
];
