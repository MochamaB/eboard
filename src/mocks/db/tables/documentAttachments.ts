/**
 * Document Attachments Table - Polymorphic Junction
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
// DOCUMENT ATTACHMENTS TABLE DATA
// ============================================================================

export const documentAttachmentsTable: DocumentAttachmentRow[] = [
  // ========================================================================
  // MTG-001: Q1 2026 Board Meeting (KTDA-MS Main Board - Scheduled)
  // ========================================================================
  
  // Meeting-level attachments
  {
    id: 'att-001',
    documentId: 'doc-mtg001-001',
    entityType: 'meeting',
    entityId: 'mtg-001',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-15T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Main board pack',
    visibleToGuests: false,
  },
  {
    id: 'att-002',
    documentId: 'doc-mtg001-agenda',
    entityType: 'meeting',
    entityId: 'mtg-001',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-15T10:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Published agenda',
    visibleToGuests: true,
  },

  // Agenda item attachments for MTG-001
  {
    id: 'att-003',
    documentId: 'doc-mtg001-002',
    entityType: 'agenda_item',
    entityId: 'item-mtg001-002',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-14T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Previous minutes for approval',
    visibleToGuests: false,
  },
  {
    id: 'att-004',
    documentId: 'doc-mtg001-003',
    entityType: 'agenda_item',
    entityId: 'item-mtg001-003',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-01-12T14:30:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-005',
    documentId: 'doc-mtg001-004',
    entityType: 'agenda_item',
    entityId: 'item-mtg001-004',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-01-16T11:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Budget presentation slides',
    visibleToGuests: true,
  },
  {
    id: 'att-006',
    documentId: 'doc-mtg001-005',
    entityType: 'agenda_item',
    entityId: 'item-mtg001-005',
    attachedBy: 1,
    attachedByName: 'Hon. Chege Kirundi',
    attachedAt: '2026-01-13T16:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-007',
    documentId: 'doc-mtg001-006',
    entityType: 'agenda_item',
    entityId: 'item-mtg001-006',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-14T15:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },

  // ========================================================================
  // MTG-002: Emergency Strategy Session (KTDA-MS Main Board - Completed)
  // ========================================================================
  
  {
    id: 'att-017',
    documentId: 'doc-mtg002-001',
    entityType: 'meeting',
    entityId: 'mtg-002',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-01-14T12:00:00Z',
    isPrimary: false,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-018',
    documentId: 'doc-mtg002-002',
    entityType: 'meeting',
    entityId: 'mtg-002',
    attachedBy: 1,
    attachedByName: 'Hon. Chege Kirundi',
    attachedAt: '2026-01-14T14:00:00Z',
    isPrimary: true,
    displayOrder: 2,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-019',
    documentId: 'doc-mtg002-003',
    entityType: 'meeting',
    entityId: 'mtg-002',
    attachedBy: 17,
    attachedByName: 'Kenneth Muhia',
    attachedAt: '2026-01-15T17:00:00Z',
    isPrimary: false,
    displayOrder: 3,
    notes: 'Post-meeting summary',
    visibleToGuests: false,
  },

  // ========================================================================
  // MTG-003: Budget Review Meeting (KTDA-MS Main Board - Pending)
  // ========================================================================
  
  {
    id: 'att-020',
    documentId: 'doc-mtg003-001',
    entityType: 'meeting',
    entityId: 'mtg-003',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-01-10T10:00:00Z',
    isPrimary: false,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-021',
    documentId: 'doc-mtg003-002',
    entityType: 'meeting',
    entityId: 'mtg-003',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2026-01-11T09:00:00Z',
    isPrimary: false,
    displayOrder: 2,
    notes: 'Draft - incomplete',
    visibleToGuests: false,
  },

  // ========================================================================
  // MTG-004: Audit Committee Q1 Review (comm-audit - Scheduled)
  // ========================================================================
  
  {
    id: 'att-008',
    documentId: 'doc-mtg004-agenda',
    entityType: 'meeting',
    entityId: 'mtg-004',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-01-10T11:00:00Z',
    isPrimary: false,
    displayOrder: 1,
    notes: 'Published agenda',
    visibleToGuests: true,
  },

  // Agenda item attachments for MTG-004
  {
    id: 'att-009',
    documentId: 'doc-mtg004-001',
    entityType: 'agenda_item',
    entityId: 'item-mtg004-002',
    attachedBy: 21,
    attachedByName: 'Winfred Kabuuri',
    attachedAt: '2026-01-08T14:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Audit report for review',
    visibleToGuests: true,
  },
  {
    id: 'att-010',
    documentId: 'doc-mtg004-002',
    entityType: 'agenda_item',
    entityId: 'item-mtg004-003',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-01-09T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-011',
    documentId: 'doc-mtg004-003',
    entityType: 'agenda_item',
    entityId: 'item-mtg004-004',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2026-01-09T11:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },

  // ========================================================================
  // MTG-008: KETEPA Board Meeting January 2025 (ketepa - Completed)
  // ========================================================================
  
  {
    id: 'att-012',
    documentId: 'doc-mtg008-001',
    entityType: 'meeting',
    entityId: 'mtg-008',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-01-10T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Main board pack',
    visibleToGuests: false,
  },

  // Agenda item attachments for MTG-008
  {
    id: 'att-013',
    documentId: 'doc-mtg008-002',
    entityType: 'agenda_item',
    entityId: 'item-mtg008-002',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-01-08T10:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Previous minutes',
    visibleToGuests: false,
  },
  {
    id: 'att-014',
    documentId: 'doc-mtg008-003',
    entityType: 'agenda_item',
    entityId: 'item-mtg008-003',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-01-09T09:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },
  {
    id: 'att-015',
    documentId: 'doc-mtg008-004',
    entityType: 'agenda_item',
    entityId: 'item-mtg008-004',
    attachedBy: 20,
    attachedByName: 'Brian Mochama',
    attachedAt: '2025-01-15T14:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: 'Sales presentation - was cast during meeting',
    visibleToGuests: true,
  },
  {
    id: 'att-016',
    documentId: 'doc-mtg008-005',
    entityType: 'agenda_item',
    entityId: 'item-mtg008-005',
    attachedBy: 18,
    attachedByName: 'Isaac Chege',
    attachedAt: '2025-01-12T11:00:00Z',
    isPrimary: true,
    displayOrder: 1,
    notes: null,
    visibleToGuests: false,
  },

  // ========================================================================
  // Board-level document attachments (Policies, Governance)
  // ========================================================================
  
  {
    id: 'att-022',
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
    id: 'att-023',
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
