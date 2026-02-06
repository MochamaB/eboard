/**
 * Agendas Table - Database-like structure
 * Stores agenda records for meetings
 * REBUILT to match new meetings table with uppercase IDs (MTG-001 format)
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
// AGENDAS TABLE DATA - Aligned with 9 Test Meetings
// ============================================================================

export const agendasTable: AgendaRow[] = [
  // ========================================================================
  // MTG-001: draft.incomplete - Agenda in draft (not published yet)
  // ========================================================================
  {
    id: 'agenda-MTG-001',
    meetingId: 'MTG-001',
    status: 'draft',
    publishedAt: null,
    publishedBy: null,
    publishedByName: null,
    pdfDocumentId: null,
    pdfDocumentUrl: null,
    version: 1,
    templateId: 'template-standard-board',
    templateName: 'Standard Board Meeting',
    createdBy: 17, // Kenneth Muhia
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-02-01T08:30:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },

  // ========================================================================
  // MTG-002: draft.complete - Agenda published (ready for approval)
  // ========================================================================
  {
    id: 'agenda-MTG-002',
    meetingId: 'MTG-002',
    status: 'published',
    publishedAt: '2026-02-10T15:00:00Z',
    publishedBy: 17,
    publishedByName: 'Kenneth Muhia',
    pdfDocumentId: 'doc-agenda-MTG-002',
    pdfDocumentUrl: '/mock-documents/agenda-MTG-002.pdf',
    version: 1,
    templateId: 'template-standard-board',
    templateName: 'Standard Board Meeting',
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-02-05T09:30:00Z',
    updatedAt: '2026-02-10T15:00:00Z',
  },

  // ========================================================================
  // MTG-003: scheduled.pending_approval - Agenda published, awaiting approval
  // ========================================================================
  {
    id: 'agenda-MTG-003',
    meetingId: 'MTG-003',
    status: 'published',
    publishedAt: '2026-02-15T11:00:00Z',
    publishedBy: 18, // Isaac Chege
    publishedByName: 'Isaac Chege',
    pdfDocumentId: 'doc-agenda-MTG-003',
    pdfDocumentUrl: '/mock-documents/agenda-MTG-003.pdf',
    version: 1,
    templateId: 'template-audit-committee',
    templateName: 'Audit Committee Standard',
    createdBy: 18,
    createdByName: 'Isaac Chege',
    createdAt: '2026-02-10T09:30:00Z',
    updatedAt: '2026-02-15T11:00:00Z',
  },

  // ========================================================================
  // MTG-004: scheduled.approved - Agenda published, meeting approved
  // ========================================================================
  {
    id: 'agenda-MTG-004',
    meetingId: 'MTG-004',
    status: 'published',
    publishedAt: '2026-02-25T10:00:00Z',
    publishedBy: 19, // Jane Njeri
    publishedByName: 'Jane Njeri',
    pdfDocumentId: 'doc-agenda-MTG-004',
    pdfDocumentUrl: '/mock-documents/agenda-MTG-004.pdf',
    version: 1,
    templateId: 'template-standard-board',
    templateName: 'Standard Board Meeting',
    createdBy: 19,
    createdByName: 'Jane Njeri',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
  },

  // ========================================================================
  // MTG-005: scheduled.rejected - Agenda published but meeting rejected
  // ========================================================================
  {
    id: 'agenda-MTG-005',
    meetingId: 'MTG-005',
    status: 'published',
    publishedAt: '2026-03-01T09:00:00Z',
    publishedBy: 19,
    publishedByName: 'Jane Njeri',
    pdfDocumentId: 'doc-agenda-MTG-005',
    pdfDocumentUrl: '/mock-documents/agenda-MTG-005.pdf',
    version: 1,
    templateId: 'template-hr-committee',
    templateName: 'HR Committee Standard',
    createdBy: 19,
    createdByName: 'Jane Njeri',
    createdAt: '2026-02-25T10:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },

  // ========================================================================
  // MTG-006: in_progress - Agenda published, meeting currently happening
  // ========================================================================
  {
    id: 'agenda-MTG-006',
    meetingId: 'MTG-006',
    status: 'published',
    publishedAt: '2026-02-04T11:00:00Z', // Published quickly for emergency
    publishedBy: 17,
    publishedByName: 'Kenneth Muhia',
    pdfDocumentId: 'doc-agenda-MTG-006',
    pdfDocumentUrl: '/mock-documents/agenda-MTG-006.pdf',
    version: 1,
    templateId: null, // Emergency meeting, no template
    templateName: null,
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2026-02-04T10:15:00Z',
    updatedAt: '2026-02-04T11:00:00Z',
  },

  // ========================================================================
  // MTG-007: completed.recent - Agenda archived, meeting completed recently
  // ========================================================================
  {
    id: 'agenda-MTG-007',
    meetingId: 'MTG-007',
    status: 'archived',
    publishedAt: '2026-01-10T09:00:00Z',
    publishedBy: 19,
    publishedByName: 'Jane Njeri',
    pdfDocumentId: 'doc-agenda-MTG-007',
    pdfDocumentUrl: '/mock-documents/agenda-MTG-007.pdf',
    version: 1,
    templateId: 'template-standard-board',
    templateName: 'Standard Board Meeting',
    createdBy: 19,
    createdByName: 'Jane Njeri',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-20T12:05:00Z', // Archived after meeting completed
  },

  // ========================================================================
  // MTG-008: completed.archived - Agenda archived, historical meeting
  // ========================================================================
  {
    id: 'agenda-MTG-008',
    meetingId: 'MTG-008',
    status: 'archived',
    publishedAt: '2025-10-01T10:00:00Z',
    publishedBy: 18,
    publishedByName: 'Isaac Chege',
    pdfDocumentId: 'doc-agenda-MTG-008',
    pdfDocumentUrl: '/mock-documents/agenda-MTG-008.pdf',
    version: 1,
    templateId: 'template-standard-board',
    templateName: 'Standard Board Meeting',
    createdBy: 18,
    createdByName: 'Isaac Chege',
    createdAt: '2025-09-20T08:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z', // Auto-archived 30 days after meeting
  },

  // ========================================================================
  // MTG-009: cancelled - Agenda draft, meeting was cancelled before publishing
  // ========================================================================
  {
    id: 'agenda-MTG-009',
    meetingId: 'MTG-009',
    status: 'draft',
    publishedAt: null,
    publishedBy: null,
    publishedByName: null,
    pdfDocumentId: null,
    pdfDocumentUrl: null,
    version: 1,
    templateId: 'template-finance-committee',
    templateName: 'Finance Committee Standard',
    createdBy: 18,
    createdByName: 'Isaac Chege',
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get agenda by meeting ID
 */
export const getAgendaByMeetingId = (meetingId: string): AgendaRow | undefined => {
  return agendasTable.find((a) => a.meetingId === meetingId);
};

/**
 * Get agenda by ID
 */
export const getAgendaById = (agendaId: string): AgendaRow | undefined => {
  return agendasTable.find((a) => a.id === agendaId);
};

/**
 * Get all published agendas
 */
export const getPublishedAgendas = (): AgendaRow[] => {
  return agendasTable.filter((a) => a.status === 'published');
};

/**
 * Get all draft agendas
 */
export const getDraftAgendas = (): AgendaRow[] => {
  return agendasTable.filter((a) => a.status === 'draft');
};

/**
 * Get all archived agendas
 */
export const getArchivedAgendas = (): AgendaRow[] => {
  return agendasTable.filter((a) => a.status === 'archived');
};
