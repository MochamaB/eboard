/**
 * Agendas Table - Database-like structure
 * Stores agenda records for meetings
 */

export type AgendaStatus = 'draft' | 'published' | 'archived';

export interface AgendaRow {
  id: string;
  meetingId: string;
  status: AgendaStatus;
  publishedAt: string | null;
  publishedBy: number | null;
  publishedByName: string | null;
  pdfDocumentId: string | null;
  pdfDocumentUrl: string | null;
  version: number;
  templateId: string | null;
  templateName: string | null;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AGENDAS TABLE DATA
// ============================================================================

export const agendasTable: AgendaRow[] = [
  // ========================================================================
  // MTG-001: Q1 2026 Board Meeting (SCHEDULED - PUBLISHED AGENDA)
  // ========================================================================
  {
    id: 'agenda-mtg001',
    meetingId: 'mtg-001',
    status: 'published',
    publishedAt: '2026-01-15T10:00:00Z',
    publishedBy: 17,
    publishedByName: 'Kenneth Muhia',
    pdfDocumentId: 'doc-mtg001-agenda',
    pdfDocumentUrl: '/mock-documents/agenda-mtg001.pdf',
    version: 1,
    templateId: 'template-standard-board',
    templateName: 'Standard Board Meeting',
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },

  // ========================================================================
  // MTG-004: Audit Committee Q1 2026 (SCHEDULED - PUBLISHED AGENDA)
  // ========================================================================
  {
    id: 'agenda-mtg004',
    meetingId: 'mtg-004',
    status: 'published',
    publishedAt: '2026-01-10T11:00:00Z',
    publishedBy: 18,
    publishedByName: 'Isaac Chege',
    pdfDocumentId: 'doc-mtg004-agenda',
    pdfDocumentUrl: '/mock-documents/agenda-mtg004.pdf',
    version: 1,
    templateId: 'template-audit-committee',
    templateName: 'Audit Committee Standard',
    createdBy: 18,
    createdByName: 'Isaac Chege',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },

  // ========================================================================
  // MTG-008: KETEPA Board January 2025 (COMPLETED - ARCHIVED AGENDA)
  // ========================================================================
  {
    id: 'agenda-mtg008',
    meetingId: 'mtg-008',
    status: 'archived',
    publishedAt: '2025-01-10T10:00:00Z',
    publishedBy: 18,
    publishedByName: 'Isaac Chege',
    pdfDocumentId: 'doc-mtg008-agenda',
    pdfDocumentUrl: '/mock-documents/agenda-mtg008.pdf',
    version: 1,
    templateId: 'template-standard-board',
    templateName: 'Standard Board Meeting',
    createdBy: 18,
    createdByName: 'Isaac Chege',
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-01-20T12:30:00Z', // Updated after meeting completed
  },

  // ========================================================================
  // MTG-002: Emergency Strategy Meeting (COMPLETED - ARCHIVED AGENDA)
  // ========================================================================
  {
    id: 'agenda-mtg002',
    meetingId: 'mtg-002',
    status: 'archived',
    publishedAt: '2026-01-14T16:00:00Z',
    publishedBy: 17,
    publishedByName: 'Kenneth Muhia',
    pdfDocumentId: 'doc-mtg002-agenda',
    pdfDocumentUrl: '/mock-documents/agenda-mtg002.pdf',
    version: 1,
    templateId: null, // Emergency meeting, no template
    templateName: null,
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-01-14T15:00:00Z',
    updatedAt: '2026-01-15T16:30:00Z', // Updated after meeting completed
  },

  // ========================================================================
  // MTG-003: Budget Review Meeting (PENDING - DRAFT AGENDA)
  // ========================================================================
  {
    id: 'agenda-mtg003',
    meetingId: 'mtg-003',
    status: 'draft',
    publishedAt: null,
    publishedBy: null,
    publishedByName: null,
    pdfDocumentId: null,
    pdfDocumentUrl: null,
    version: 1,
    templateId: null,
    templateName: null,
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },

  // ========================================================================
  // MTG-018: Safety Committee Meeting (SCHEDULED - DRAFT WITH NESTED ITEMS)
  // ========================================================================
  {
    id: 'agenda-mtg018',
    meetingId: 'mtg-018',
    status: 'draft',
    publishedAt: null,
    publishedBy: null,
    publishedByName: null,
    pdfDocumentId: null,
    pdfDocumentUrl: null,
    version: 1,
    templateId: null,
    templateName: null,
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2025-09-20T08:00:00Z',
    updatedAt: '2025-09-25T10:00:00Z',
  },
];
