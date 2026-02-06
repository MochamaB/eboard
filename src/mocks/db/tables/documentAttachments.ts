/**
 * Document Attachments Table - Polymorphic Junction
 * REBUILT to match new meetings/documents with uppercase IDs (MTG-001 format)
 * Links documents to any entity (meetings, agenda items, boards, etc.)
 */

import type { DocumentEntityType } from '../../../types/document.types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DocumentAttachmentRow {
  id: string;
  documentId: string;
  entityType: DocumentEntityType;
  entityId: string;
  attachedBy: number;
  attachedByName: string;
  attachedAt: string;
  isPrimary: boolean;
  displayOrder: number;
  notes: string | null;
  visibleToGuests: boolean;
}

// ============================================================================
// DOCUMENT ATTACHMENTS TABLE DATA - Aligned with 9 Test Meetings
// ============================================================================

export const documentAttachmentsTable: DocumentAttachmentRow[] = [
  // ========================================================================
  // MTG-001: draft.incomplete - NO DOCUMENT ATTACHMENTS
  // ========================================================================
  // No documents attached - part of the validation failure

  // ========================================================================
  // MTG-002: draft.complete - 5 Documents Attached to Meeting
  // ========================================================================

  // Meeting-level attachments
  {
    id: 'att-MTG-002-001',
    documentId: 'doc-MTG-002-001',
    entityType: 'meeting',
    entityId: 'MTG-002',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-02-03T10:00:00Z',
    isPrimary: false,
    displayOrder: 1,
    notes: 'Previous meeting minutes for approval',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-002-002',
    documentId: 'doc-MTG-002-002',
    entityType: 'meeting',
    entityId: 'MTG-002',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-02-04T09:00:00Z',
    isPrimary: true,
    displayOrder: 2,
    notes: 'Main financial statements - watermarked',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-002-003',
    documentId: 'doc-MTG-002-003',
    entityType: 'meeting',
    entityId: 'MTG-002',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-02-04T11:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Budget spreadsheet for review',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-002-004',
    documentId: 'doc-MTG-002-004',
    entityType: 'meeting',
    entityId: 'MTG-002',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-02-05T10:00:00Z',
    isPrimary: false,
    displayOrder: 4,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-002-005',
    documentId: 'doc-MTG-002-005',
    entityType: 'meeting',
    entityId: 'MTG-002',
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2026-02-05T14:00:00Z',
    isPrimary: false,
    displayOrder: 5,
    notes: null,
    visibleToGuests: false,
  },

  // Agenda item attachments for MTG-002
  {
    id: 'att-MTG-002-agenda-002',
    documentId: 'doc-MTG-002-001',
    entityType: 'agenda_item',
    entityId: 'item-MTG-002-002', // Approval of Previous Minutes
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-02-03T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Minutes to be approved',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-002-agenda-003',
    documentId: 'doc-MTG-002-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-002-003', // Q4 2025 Financial Performance
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-02-04T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-002-agenda-004',
    documentId: 'doc-MTG-002-003',
    entityType: 'agenda_item',
    entityId: 'item-MTG-002-004', // Q1 2026 Budget Approval
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-02-04T11:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Budget for approval',
    visibleToGuests: false,
  },

  // ========================================================================
  // MTG-003: scheduled.pending_approval - Audit Committee
  // ========================================================================

  // Meeting-level attachments
  {
    id: 'att-MTG-003-001',
    documentId: 'doc-MTG-003-agenda',
    entityType: 'meeting',
    entityId: 'MTG-003',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-02-10T11:00:00Z',
    isPrimary: false,
    displayOrder: 1,
    notes: 'Official agenda',
    visibleToGuests: true,
  },
  {
    id: 'att-MTG-003-002',
    documentId: 'doc-MTG-003-confirmation-unsigned',
    entityType: 'meeting',
    entityId: 'MTG-003',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-02-15T11:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Awaiting chairman signature',
    visibleToGuests: false,
  },

  // Agenda item attachments for MTG-003
  {
    id: 'att-MTG-003-agenda-002',
    documentId: 'doc-MTG-003-001',
    entityType: 'agenda_item',
    entityId: 'item-MTG-003-002', // Internal Audit Report Review
    attachedBy: 21,
    attachedByName: 'Winfred Kabuuri',
    attachedAt: '2026-02-08T14:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Confidential audit report',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-003-agenda-003',
    documentId: 'doc-MTG-003-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-003-003', // Compliance Review
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-02-09T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-003-agenda-004',
    documentId: 'doc-MTG-003-003',
    entityType: 'agenda_item',
    entityId: 'item-MTG-003-004', // 2026 Audit Plan Approval
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-02-09T11:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },

  // ========================================================================
  // MTG-004: scheduled.approved - KETEPA Board
  // ========================================================================

  // Meeting-level attachments
  {
    id: 'att-MTG-004-001',
    documentId: 'doc-MTG-004-001',
    entityType: 'meeting',
    entityId: 'MTG-004',
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2026-02-18T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Main board pack - watermarked',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-004-002',
    documentId: 'doc-MTG-004-agenda',
    entityType: 'meeting',
    entityId: 'MTG-004',
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2026-02-22T10:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Official agenda',
    visibleToGuests: true,
  },
  {
    id: 'att-MTG-004-003',
    documentId: 'doc-MTG-004-confirmation-signed',
    entityType: 'meeting',
    entityId: 'MTG-004',
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2026-02-25T10:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Signed by chairman - meeting approved',
    visibleToGuests: false,
  },

  // Agenda item attachments for MTG-004
  {
    id: 'att-MTG-004-agenda-003',
    documentId: 'doc-MTG-004-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-004-003', // Q4 2025 Operations Report
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2026-02-19T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-004-agenda-005',
    documentId: 'doc-MTG-004-003',
    entityType: 'agenda_item',
    entityId: 'item-MTG-004-005', // Export Performance Presentation
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-02-20T14:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Presentation slides',
    visibleToGuests: true,
  },

  // ========================================================================
  // MTG-005: scheduled.rejected - HR Committee (Incomplete Docs)
  // ========================================================================

  {
    id: 'att-MTG-005-001',
    documentId: 'doc-MTG-005-001',
    entityType: 'meeting',
    entityId: 'MTG-005',
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2026-02-23T10:00:00Z',
    isPrimary: false,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-005-002',
    documentId: 'doc-MTG-005-002',
    entityType: 'meeting',
    entityId: 'MTG-005',
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2026-02-24T11:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Draft framework',
    visibleToGuests: false,
  },
  // NOTE: Missing required budget documents - reason for rejection

  // ========================================================================
  // MTG-006: in_progress - Emergency Strategy Session
  // ========================================================================

  {
    id: 'att-MTG-006-001',
    documentId: 'doc-MTG-006-001',
    entityType: 'meeting',
    entityId: 'MTG-006',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-02-04T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Crisis analysis',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-006-002',
    documentId: 'doc-MTG-006-002',
    entityType: 'meeting',
    entityId: 'MTG-006',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-02-04T10:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Response plan',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-006-003',
    documentId: 'doc-MTG-006-agenda',
    entityType: 'meeting',
    entityId: 'MTG-006',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-02-04T11:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Emergency agenda',
    visibleToGuests: true,
  },

  // ========================================================================
  // MTG-007: completed.recent - With Draft Minutes
  // ========================================================================

  // Meeting-level attachments
  {
    id: 'att-MTG-007-001',
    documentId: 'doc-MTG-007-001',
    entityType: 'meeting',
    entityId: 'MTG-007',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-10T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Main board pack - watermarked',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-007-002',
    documentId: 'doc-MTG-007-agenda',
    entityType: 'meeting',
    entityId: 'MTG-007',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-13T10:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Official agenda',
    visibleToGuests: true,
  },
  {
    id: 'att-MTG-007-003',
    documentId: 'doc-MTG-007-minutes-draft',
    entityType: 'meeting',
    entityId: 'MTG-007',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-20T12:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Draft minutes - awaiting approval',
    visibleToGuests: false,
  },

  // Agenda item attachments for MTG-007
  {
    id: 'att-MTG-007-agenda-002',
    documentId: 'doc-MTG-007-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-007-002', // Approval of Previous Minutes
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-08T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Q3 2025 minutes for approval',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-007-agenda-003',
    documentId: 'doc-MTG-007-003',
    entityType: 'agenda_item',
    entityId: 'item-MTG-007-003', // Financial Performance Review
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-01-09T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Watermarked financial report',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-007-agenda-004',
    documentId: 'doc-MTG-007-004',
    entityType: 'agenda_item',
    entityId: 'item-MTG-007-004', // Q1 2026 Strategic Initiatives
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-01-12T14:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Strategy presentation',
    visibleToGuests: true,
  },

  // ========================================================================
  // MTG-008: completed.archived - Historical with Approved Minutes
  // ========================================================================

  // Meeting-level attachments
  {
    id: 'att-MTG-008-001',
    documentId: 'doc-MTG-008-001',
    entityType: 'meeting',
    entityId: 'MTG-008',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-09-20T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Main board pack - watermarked',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-008-002',
    documentId: 'doc-MTG-008-agenda',
    entityType: 'meeting',
    entityId: 'MTG-008',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-09-28T10:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Official agenda',
    visibleToGuests: true,
  },
  {
    id: 'att-MTG-008-003',
    documentId: 'doc-MTG-008-minutes-approved',
    entityType: 'meeting',
    entityId: 'MTG-008',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-11-15T10:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Final approved minutes with chairman signature',
    visibleToGuests: false,
  },

  // Agenda item attachments for MTG-008
  {
    id: 'att-MTG-008-agenda-002',
    documentId: 'doc-MTG-008-002',
    entityType: 'agenda_item',
    entityId: 'item-MTG-008-002', // Approval of Previous Minutes
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-09-18T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Q2 2025 minutes',
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-008-agenda-003',
    documentId: 'doc-MTG-008-003',
    entityType: 'agenda_item',
    entityId: 'item-MTG-008-003', // Operations Report
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2025-09-22T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-008-agenda-004',
    documentId: 'doc-MTG-008-004',
    entityType: 'agenda_item',
    entityId: 'item-MTG-008-004', // Investment Strategy
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2025-09-25T14:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Investment proposal',
    visibleToGuests: false,
  },

  // ========================================================================
  // MTG-009: cancelled - Finance Committee
  // ========================================================================

  {
    id: 'att-MTG-009-001',
    documentId: 'doc-MTG-009-001',
    entityType: 'meeting',
    entityId: 'MTG-009',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-02-20T09:00:00Z',
    isPrimary: false,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-009-002',
    documentId: 'doc-MTG-009-002',
    entityType: 'meeting',
    entityId: 'MTG-009',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-02-21T10:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-MTG-009-003',
    documentId: 'doc-MTG-009-agenda',
    entityType: 'meeting',
    entityId: 'MTG-009',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-02-22T11:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Agenda for cancelled meeting',
    visibleToGuests: true,
  },

  // ========================================================================
  // BOARD-LEVEL DOCUMENTS (Not meeting-specific)
  // ========================================================================

  {
    id: 'att-board-policy-001',
    documentId: 'doc-board-policy-001',
    entityType: 'board',
    entityId: 'ktda-ms',
    attachedBy: 1,
    attachedByName: 'Hon. Chege Kirundi',
    attachedAt: '2024-06-15T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Board governance charter',
    visibleToGuests: false,
  },
  {
    id: 'att-board-policy-002',
    documentId: 'doc-board-policy-002',
    entityType: 'board',
    entityId: 'ktda-ms',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2024-08-20T14:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Code of conduct',
    visibleToGuests: false,
  },
  {
    id: 'att-board-policy-003',
    documentId: 'doc-board-policy-003',
    entityType: 'board',
    entityId: 'ktda-ms',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2024-09-10T10:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Conflict of interest policy',
    visibleToGuests: false,
  },

  // ========================================================================
  // KETEPA SUBSIDIARY DOCUMENTS
  // ========================================================================

  {
    id: 'att-ketepa-001',
    documentId: 'doc-ketepa-001',
    entityType: 'board',
    entityId: 'ketepa',
    attachedBy: 19,
    attachedByName: 'Jane Njeri',
    attachedAt: '2025-12-20T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Annual report 2025',
    visibleToGuests: false,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get attachments for a specific entity
 */
export const getAttachmentsByEntity = (
  entityType: DocumentEntityType,
  entityId: string
): DocumentAttachmentRow[] => {
  return documentAttachmentsTable.filter(
    att => att.entityType === entityType && att.entityId === entityId
  );
};

/**
 * Get attachments for a document
 */
export const getAttachmentsByDocument = (documentId: string): DocumentAttachmentRow[] => {
  return documentAttachmentsTable.filter(att => att.documentId === documentId);
};

/**
 * Get meeting attachments
 */
export const getMeetingAttachments = (meetingId: string): DocumentAttachmentRow[] => {
  return getAttachmentsByEntity('meeting', meetingId);
};

/**
 * Get agenda item attachments
 */
export const getAgendaItemAttachments = (agendaItemId: string): DocumentAttachmentRow[] => {
  return getAttachmentsByEntity('agenda_item', agendaItemId);
};

/**
 * Get board attachments
 */
export const getBoardAttachments = (boardId: string): DocumentAttachmentRow[] => {
  return getAttachmentsByEntity('board', boardId);
};

/**
 * Get primary document for an entity
 */
export const getPrimaryAttachment = (
  entityType: DocumentEntityType,
  entityId: string
): DocumentAttachmentRow | undefined => {
  return documentAttachmentsTable.find(
    att => att.entityType === entityType && att.entityId === entityId && att.isPrimary
  );
};
