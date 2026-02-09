/**
 * Action Items Table (Mock Data)
 * Tasks and action items from meetings and minutes
 */

export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActionItemSource = 'minutes' | 'meeting' | 'agenda_item' | 'manual';

export interface ActionItemRow {
  id: string;

  // Source tracking (polymorphic)
  source: ActionItemSource;
  sourceId: string | null;
  meetingId: string;
  boardId: string;

  // Action details
  title: string;
  description: string | null;

  // Assignment
  assignedTo: number;
  assignedBy: number;

  // Timeline
  dueDate: string;
  priority: ActionItemPriority;

  // Status
  status: ActionItemStatus;
  completedAt: string | null;
  completedBy: number | null;
  completionNotes: string | null;

  // Related entities
  relatedAgendaItemId: string | null;
  relatedDocumentIds: string;

  // Reminders
  reminderSent: boolean;
  lastReminderSentAt: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export const actionItemsTable: ActionItemRow[] = [
  // ========================================================================
  // MTG-008: KETEPA Board - January 2025 (3 items)
  // ========================================================================

  {
    id: 'action-mtg008-001',
    source: 'minutes',
    sourceId: 'minutes-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Prepare detailed market analysis for Tanzania and Uganda',
    description: 'Comprehensive market analysis covering demand, competition, pricing strategies, and entry barriers for Tanzania and Uganda tea markets',
    assignedTo: 20,
    assignedBy: 3,
    dueDate: '2025-02-15',
    priority: 'high',
    status: 'in_progress',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '[]',
    reminderSent: true,
    lastReminderSentAt: '2025-02-10T09:00:00Z',
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-01-25T14:00:00Z',
  },

  {
    id: 'action-mtg008-002',
    source: 'minutes',
    sourceId: 'minutes-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Circulate approved export strategy to department heads',
    description: 'Distribute the approved East African export strategy document to all department heads for implementation planning',
    assignedTo: 18,
    assignedBy: 3,
    dueDate: '2025-02-01',
    priority: 'medium',
    status: 'completed',
    completedAt: '2025-01-28T16:00:00Z',
    completedBy: 18,
    completionNotes: 'Distributed via email to all department heads on January 28. Confirmation received from all recipients.',
    relatedAgendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '["doc-mtg008-strategy"]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-01-28T16:00:00Z',
  },

  {
    id: 'action-mtg008-003',
    source: 'minutes',
    sourceId: 'minutes-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Schedule follow-up meeting with finance team',
    description: 'Arrange meeting with finance team to discuss budget allocation details for the export expansion strategy',
    assignedTo: 3,
    assignedBy: 3,
    dueDate: '2025-02-10',
    priority: 'high',
    status: 'in_progress',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-01-25T09:00:00Z',
  },

  {
    id: 'action-mtg008-004',
    source: 'minutes',
    sourceId: 'minutes-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Conduct competitor analysis for East African markets',
    description: 'Research and analyze key competitors in Tanzania and Uganda tea markets, including market share, pricing strategies, and distribution channels',
    assignedTo: 20,
    assignedBy: 3,
    dueDate: '2025-02-20',
    priority: 'medium',
    status: 'completed',
    completedAt: '2025-02-18T14:30:00Z',
    completedBy: 20,
    completionNotes: 'Comprehensive competitor analysis completed. Report submitted to board. Key findings: 3 major competitors identified with combined 45% market share.',
    relatedAgendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '["doc-competitor-analysis"]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-02-18T14:30:00Z',
  },

  {
    id: 'action-mtg008-005',
    source: 'minutes',
    sourceId: 'minutes-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Establish partnerships with local distributors',
    description: 'Identify and initiate discussions with potential distribution partners in Tanzania and Uganda markets',
    assignedTo: 20,
    assignedBy: 3,
    dueDate: '2025-03-15',
    priority: 'high',
    status: 'completed',
    completedAt: '2025-03-10T16:00:00Z',
    completedBy: 20,
    completionNotes: 'Successfully established partnerships with 2 distributors in Tanzania and 1 in Uganda. Contracts signed and distribution agreements finalized.',
    relatedAgendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '["doc-partnership-agreements"]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-03-10T16:00:00Z',
  },

  {
    id: 'action-mtg008-006',
    source: 'minutes',
    sourceId: 'minutes-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Develop marketing materials for new markets',
    description: 'Create localized marketing materials including brochures, product catalogs, and promotional content for Tanzania and Uganda markets',
    assignedTo: 16,
    assignedBy: 3,
    dueDate: '2025-02-28',
    priority: 'medium',
    status: 'completed',
    completedAt: '2025-02-25T11:00:00Z',
    completedBy: 16,
    completionNotes: 'Marketing materials completed and approved. Materials translated to Swahili and adapted for local market preferences. Ready for distribution.',
    relatedAgendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '["doc-marketing-materials"]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-02-25T11:00:00Z',
  },

  {
    id: 'action-mtg008-007',
    source: 'minutes',
    sourceId: 'minutes-mtg008-001',
    meetingId: 'mtg-008',
    boardId: 'ketepa',
    title: 'Secure export licenses and permits',
    description: 'Obtain all necessary export licenses, permits, and regulatory approvals for Tanzania and Uganda markets',
    assignedTo: 16,
    assignedBy: 3,
    dueDate: '2025-03-01',
    priority: 'high',
    status: 'completed',
    completedAt: '2025-02-28T15:00:00Z',
    completedBy: 16,
    completionNotes: 'All export licenses and permits secured. Regulatory compliance confirmed for both Tanzania and Uganda. Documentation filed and archived.',
    relatedAgendaItemId: 'item-mtg008-005',
    relatedDocumentIds: '["doc-export-licenses"]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-02-28T15:00:00Z',
  },

  // ========================================================================
  // MTG-002: Emergency Strategy Meeting (4 urgent items)
  // ========================================================================

  {
    id: 'action-mtg002-001',
    source: 'minutes',
    sourceId: 'minutes-mtg002-001',
    meetingId: 'mtg-002',
    boardId: 'ktda-ms',
    title: 'Implement market stabilization measures',
    description: 'Execute approved market stabilization plan including price support mechanisms and supply management',
    assignedTo: 15,
    assignedBy: 1,
    dueDate: '2026-01-18',
    priority: 'urgent',
    status: 'in_progress',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: 'item-mtg002-005',
    relatedDocumentIds: '["doc-mtg002-002"]',
    reminderSent: true,
    lastReminderSentAt: '2026-01-17T08:00:00Z',
    createdAt: '2026-01-15T18:00:00Z',
    updatedAt: '2026-01-16T10:00:00Z',
  },

  {
    id: 'action-mtg002-002',
    source: 'minutes',
    sourceId: 'minutes-mtg002-001',
    meetingId: 'mtg-002',
    boardId: 'ktda-ms',
    title: 'Prepare external communication statement',
    description: 'Draft and approve external communication statement addressing market conditions and KTDA response strategy',
    assignedTo: 16,
    assignedBy: 1,
    dueDate: '2026-01-16',
    priority: 'urgent',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: 'item-mtg002-004',
    relatedDocumentIds: '[]',
    reminderSent: true,
    lastReminderSentAt: '2026-01-16T07:00:00Z',
    createdAt: '2026-01-15T18:00:00Z',
    updatedAt: '2026-01-15T18:00:00Z',
  },

  {
    id: 'action-mtg002-003',
    source: 'minutes',
    sourceId: 'minutes-mtg002-001',
    meetingId: 'mtg-002',
    boardId: 'ktda-ms',
    title: 'Convene stakeholder briefing session',
    description: 'Organize and conduct briefing session for key stakeholders including factory directors and zone representatives',
    assignedTo: 1,
    assignedBy: 1,
    dueDate: '2026-01-20',
    priority: 'high',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2026-01-15T18:00:00Z',
    updatedAt: '2026-01-15T18:00:00Z',
  },

  {
    id: 'action-mtg002-004',
    source: 'minutes',
    sourceId: 'minutes-mtg002-001',
    meetingId: 'mtg-002',
    boardId: 'ktda-ms',
    title: 'Monitor daily market indicators and report',
    description: 'Establish daily monitoring of global tea market indicators and provide summary reports to board',
    assignedTo: 20,
    assignedBy: 1,
    dueDate: '2026-01-30',
    priority: 'high',
    status: 'in_progress',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: 'item-mtg002-003',
    relatedDocumentIds: '["doc-mtg002-001"]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2026-01-15T18:00:00Z',
    updatedAt: '2026-01-16T09:00:00Z',
  },

  // ========================================================================
  // MTG-006: Finance Committee - January 2026 (2 items)
  // ========================================================================

  {
    id: 'action-mtg006-001',
    source: 'minutes',
    sourceId: 'minutes-mtg006-001',
    meetingId: 'mtg-006',
    boardId: 'comm-finance',
    title: 'Review Q1 investment portfolio performance',
    description: 'Conduct comprehensive review of Q1 2026 investment portfolio performance against benchmarks and targets',
    assignedTo: 16,
    assignedBy: 4,
    dueDate: '2026-02-01',
    priority: 'medium',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2026-01-09T16:00:00Z',
    updatedAt: '2026-01-09T16:00:00Z',
  },

  {
    id: 'action-mtg006-002',
    source: 'minutes',
    sourceId: 'minutes-mtg006-001',
    meetingId: 'mtg-006',
    boardId: 'comm-finance',
    title: 'Prepare detailed variance report for board presentation',
    description: 'Compile detailed budget variance analysis report for presentation at next main board meeting',
    assignedTo: 20,
    assignedBy: 4,
    dueDate: '2026-02-05',
    priority: 'medium',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2026-01-09T16:00:00Z',
    updatedAt: '2026-01-09T16:00:00Z',
  },

  // ========================================================================
  // MTG-007: KTDA MS Board - January 2026 (3 items)
  // ========================================================================

  {
    id: 'action-mtg007-001',
    source: 'minutes',
    sourceId: 'minutes-mtg007-001',
    meetingId: 'mtg-007',
    boardId: 'ktda-ms',
    title: 'Prepare detailed budget breakdown',
    description: 'Prepare comprehensive breakdown of Q1 2026 capital expenditure budget showing allocation by department and project',
    assignedTo: 16,
    assignedBy: 1,
    dueDate: '2026-02-15',
    priority: 'high',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2026-01-28T13:30:00Z',
    updatedAt: '2026-01-28T13:30:00Z',
  },

  {
    id: 'action-mtg007-002',
    source: 'minutes',
    sourceId: 'minutes-mtg007-001',
    meetingId: 'mtg-007',
    boardId: 'ktda-ms',
    title: 'Schedule factory site visits',
    description: 'Organize site visits to Kericho factory for board members to review proposed expansion areas and current operations',
    assignedTo: 20,
    assignedBy: 1,
    dueDate: '2026-02-10',
    priority: 'medium',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2026-01-28T13:30:00Z',
    updatedAt: '2026-01-28T13:30:00Z',
  },

  {
    id: 'action-mtg007-003',
    source: 'minutes',
    sourceId: 'minutes-mtg007-001',
    meetingId: 'mtg-007',
    boardId: 'ktda-ms',
    title: 'Draft new procurement policy',
    description: 'Draft updated procurement policy incorporating new compliance requirements and approval thresholds for board review',
    assignedTo: 16,
    assignedBy: 1,
    dueDate: '2026-02-28',
    priority: 'medium',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2026-01-28T13:30:00Z',
    updatedAt: '2026-01-28T13:30:00Z',
  },

  // ========================================================================
  // MTG-010: Chai Trading Board - January 2025 (3 items)
  // ========================================================================

  {
    id: 'action-mtg010-001',
    source: 'minutes',
    sourceId: 'minutes-mtg010-001',
    meetingId: 'mtg-010',
    boardId: 'chai-trading',
    title: 'Finalize Q1 export contracts',
    description: 'Complete negotiation and finalization of Q1 2025 export contracts with approved terms and conditions',
    assignedTo: 20,
    assignedBy: 7,
    dueDate: '2025-02-05',
    priority: 'high',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-23T09:00:00Z',
    updatedAt: '2025-01-23T09:00:00Z',
  },

  {
    id: 'action-mtg010-002',
    source: 'minutes',
    sourceId: 'minutes-mtg010-001',
    meetingId: 'mtg-010',
    boardId: 'chai-trading',
    title: 'Prepare market entry feasibility study for MENA region',
    description: 'Conduct comprehensive feasibility study for market entry into Middle East and North Africa region',
    assignedTo: 16,
    assignedBy: 7,
    dueDate: '2025-03-01',
    priority: 'medium',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-23T09:00:00Z',
    updatedAt: '2025-01-23T09:00:00Z',
  },

  {
    id: 'action-mtg010-003',
    source: 'minutes',
    sourceId: 'minutes-mtg010-001',
    meetingId: 'mtg-010',
    boardId: 'chai-trading',
    title: 'Schedule stakeholder meeting with key buyers',
    description: 'Organize meeting with key international buyers to discuss Q1 contract terms and long-term partnerships',
    assignedTo: 7,
    assignedBy: 7,
    dueDate: '2025-02-15',
    priority: 'high',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: null,
    relatedDocumentIds: '[]',
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: '2025-01-23T09:00:00Z',
    updatedAt: '2025-01-23T09:00:00Z',
  },
];
