/**
 * Documents Table - Lean Core Document Storage
 * REBUILT to match new meetings table with uppercase IDs (MTG-001 format)
 *
 * This table stores ONLY core document metadata.
 * Related data is stored in separate tables:
 * - documentAttachments.ts - Links documents to entities
 * - documentVersions.ts - Version history
 * - documentSignatures.ts - Digital signatures
 * - documentAccessLogs.ts - View/download tracking
 * - documentPermissions.ts - Access control
 * - documentTags.ts - Tags and assignments
 */

import type {
  DocumentStatus,
  DocumentSource,
  FileType,
} from '../../../types/document.types';
import { getMimeType } from '../../../constants/documents';

// ============================================================================
// TYPE DEFINITIONS - LEAN DOCUMENT ROW
// ============================================================================

export interface DocumentRow {
  // Identity
  id: string;
  name: string;
  description: string | null;

  // File Metadata (immutable after upload)
  fileName: string;
  fileExtension: string;
  fileType: FileType;
  mimeType: string;
  fileSize: number;
  pageCount: number | null;

  // Storage (immutable)
  storageProvider: 'local' | 'azure' | 's3' | 'gcs';
  storageKey: string;
  storageBucket: string | null;
  url: string;
  thumbnailUrl: string | null;

  // Organization
  categoryId: string;           // FK to document_categories
  boardId: string | null;       // Which board owns this document

  // Upload Info
  uploadedBy: number;
  uploadedByName: string;
  uploadedAt: string;
  source: DocumentSource;

  // Status
  status: DocumentStatus;

  // Security Features
  watermarkEnabled: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// HELPER FUNCTION
// ============================================================================

const createDocument = (
  id: string,
  name: string,
  description: string | null,
  categoryId: string,
  fileName: string,
  fileType: FileType,
  fileSize: number,
  pageCount: number | null,
  boardId: string | null,
  uploadedBy: number,
  uploadedByName: string,
  uploadedAt: string,
  options: Partial<DocumentRow> = {},
  watermarkEnabled: boolean = false
): DocumentRow => ({
  id,
  name,
  description,
  fileName,
  fileExtension: fileType,
  fileType,
  mimeType: getMimeType(fileType),
  fileSize,
  pageCount,
  storageProvider: 'local',
  storageKey: `documents/${id}/${fileName}`,
  storageBucket: null,
  url: `/mock-documents/${fileName}`,
  thumbnailUrl: null,
  categoryId,
  boardId,
  uploadedBy,
  uploadedByName,
  uploadedAt,
  source: 'upload',
  status: 'published',
  watermarkEnabled,
  createdAt: uploadedAt,
  updatedAt: uploadedAt,
  ...options,
});

// ============================================================================
// DOCUMENTS TABLE DATA - 40 Documents across 9 Test Meetings
// Aligned with MOCK_DATA_PLAN.md
// ============================================================================

export const documentsTable: DocumentRow[] = [
  // ========================================================================
  // MTG-001: draft.incomplete - NO DOCUMENTS (validation fail)
  // ========================================================================
  // Meeting lacks documents - part of incomplete state validation

  // ========================================================================
  // MTG-002: draft.complete - 5 Documents (Ready for Approval)
  // ========================================================================
  createDocument(
    'doc-MTG-002-001',
    'Q4 2025 Minutes - Draft',
    'Minutes from Q4 2025 board meeting',
    'cat-minutes',
    'Minutes_Q4_2025.pdf',
    'pdf',
    460800,
    12,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2026-02-03T10:00:00Z'
  ),
  createDocument(
    'doc-MTG-002-002',
    'Q4 2025 Financial Statements',
    'Complete financial statements for Q4 2025',
    'cat-financial',
    'Financial_Statements_Q4_2025.pdf',
    'pdf',
    1572864,
    35,
    'ktda-ms',
    20,
    'Brian Mochama',
    '2026-02-04T09:00:00Z',
    {},
    true // Watermarked - financial doc
  ),
  createDocument(
    'doc-MTG-002-003',
    'Q1 2026 Operational Budget',
    'Proposed operational budget for Q1 2026',
    'cat-financial',
    'Budget_Q1_2026.xlsx',
    'xlsx',
    204800,
    15,
    'ktda-ms',
    20,
    'Brian Mochama',
    '2026-02-04T11:00:00Z'
  ),
  createDocument(
    'doc-MTG-002-004',
    'Market Analysis Report',
    'Tea market trends and analysis for Q1 2026',
    'cat-report',
    'Market_Analysis_Q1_2026.pdf',
    'pdf',
    911360,
    18,
    'ktda-ms',
    18,
    'Isaac Chege',
    '2026-02-05T10:00:00Z'
  ),
  createDocument(
    'doc-MTG-002-005',
    'Factory Performance Summary',
    'Performance metrics for all factory operations',
    'cat-report',
    'Factory_Performance_2025.pdf',
    'pdf',
    737280,
    22,
    'ktda-ms',
    19,
    'Jane Njeri',
    '2026-02-05T14:00:00Z'
  ),

  // ========================================================================
  // MTG-003: scheduled.pending_approval - Audit Committee
  // ========================================================================
  createDocument(
    'doc-MTG-003-001',
    'Internal Audit Report Q4 2025',
    'Comprehensive internal audit findings - CONFIDENTIAL',
    'cat-audit',
    'Internal_Audit_Q4_2025.pdf',
    'pdf',
    1887436,
    32,
    'comm-audit',
    21,
    'Winfred Kabuuri',
    '2026-02-08T14:00:00Z',
    {},
    true // Watermarked - confidential audit
  ),
  createDocument(
    'doc-MTG-003-002',
    'Compliance Review Report',
    'Compliance review findings and recommendations',
    'cat-report',
    'Compliance_Review_2025.pdf',
    'pdf',
    573440,
    14,
    'comm-audit',
    18,
    'Isaac Chege',
    '2026-02-09T10:00:00Z'
  ),
  createDocument(
    'doc-MTG-003-003',
    '2026 Audit Plan',
    'Proposed audit plan for fiscal year 2026',
    'cat-report',
    'Audit_Plan_2026.pdf',
    'pdf',
    737280,
    18,
    'comm-audit',
    18,
    'Isaac Chege',
    '2026-02-09T11:00:00Z'
  ),
  createDocument(
    'doc-MTG-003-agenda',
    'Audit Committee Agenda',
    'Official agenda for Audit Committee meeting',
    'cat-agenda',
    'Agenda_MTG_003.pdf',
    'pdf',
    286720,
    4,
    'comm-audit',
    18,
    'Isaac Chege',
    '2026-02-10T11:00:00Z',
    { source: 'generated' }
  ),
  createDocument(
    'doc-MTG-003-confirmation-unsigned',
    'Meeting Confirmation - Unsigned',
    'Unsigned confirmation PDF awaiting chairman approval',
    'cat-confirmation',
    'Confirmation_MTG_003_Unsigned.pdf',
    'pdf',
    327680,
    2,
    'comm-audit',
    18,
    'Isaac Chege',
    '2026-02-15T11:00:00Z',
    { source: 'generated' }
  ),

  // ========================================================================
  // MTG-004: scheduled.approved - KETEPA Board (with signed confirmation)
  // ========================================================================
  createDocument(
    'doc-MTG-004-001',
    'Board Pack Q1 2026',
    'Complete board pack for KETEPA Q1 2026',
    'cat-board-pack',
    'Board_Pack_KETEPA_Q1_2026.pdf',
    'pdf',
    2621440,
    45,
    'ketepa',
    19,
    'Jane Njeri',
    '2026-02-18T09:00:00Z',
    {},
    true // Watermarked - board pack
  ),
  createDocument(
    'doc-MTG-004-002',
    'Q4 2025 Operations Report',
    'KETEPA operational performance for Q4 2025',
    'cat-report',
    'Operations_Q4_2025.pdf',
    'pdf',
    1003520,
    16,
    'ketepa',
    19,
    'Jane Njeri',
    '2026-02-19T10:00:00Z'
  ),
  createDocument(
    'doc-MTG-004-003',
    'Export Performance Presentation',
    'Q4 2025 export performance and projections',
    'cat-presentation',
    'Export_Performance_Q4_2025.pptx',
    'pptx',
    3250585,
    28,
    'ketepa',
    20,
    'Brian Mochama',
    '2026-02-20T14:00:00Z'
  ),
  createDocument(
    'doc-MTG-004-agenda',
    'KETEPA Board Agenda',
    'Official agenda for KETEPA Board meeting',
    'cat-agenda',
    'Agenda_MTG_004.pdf',
    'pdf',
    327680,
    5,
    'ketepa',
    19,
    'Jane Njeri',
    '2026-02-22T10:00:00Z',
    { source: 'generated' }
  ),
  createDocument(
    'doc-MTG-004-confirmation-signed',
    'Meeting Confirmation - Signed',
    'Digitally signed confirmation PDF by chairman',
    'cat-confirmation',
    'Confirmation_MTG_004_Signed.pdf',
    'pdf',
    409600,
    2,
    'ketepa',
    19,
    'Jane Njeri',
    '2026-02-25T10:00:00Z',
    { source: 'signed' }
  ),

  // ========================================================================
  // MTG-005: scheduled.rejected - HR Committee (Missing Documents)
  // ========================================================================
  createDocument(
    'doc-MTG-005-001',
    'HR Policy Review',
    'Review of current HR policies',
    'cat-policy',
    'HR_Policy_Review_2025.pdf',
    'pdf',
    573440,
    12,
    'comm-hr',
    19,
    'Jane Njeri',
    '2026-02-23T10:00:00Z'
  ),
  createDocument(
    'doc-MTG-005-002',
    'Performance Management Framework',
    'Proposed performance management system',
    'cat-report',
    'Performance_Framework.pdf',
    'pdf',
    737280,
    18,
    'comm-hr',
    19,
    'Jane Njeri',
    '2026-02-24T11:00:00Z'
  ),
  // NOTE: This meeting was rejected due to incomplete documentation
  // Several planned documents are missing, which justified the rejection

  // ========================================================================
  // MTG-006: in_progress - Emergency Strategy Session
  // ========================================================================
  createDocument(
    'doc-MTG-006-001',
    'Market Crisis Analysis',
    'Urgent market situation analysis',
    'cat-report',
    'Market_Crisis_Analysis.pdf',
    'pdf',
    1258291,
    16,
    'ktda-ms',
    20,
    'Brian Mochama',
    '2026-02-04T09:00:00Z'
  ),
  createDocument(
    'doc-MTG-006-002',
    'Emergency Response Plan',
    'Proposed emergency response actions',
    'cat-report',
    'Emergency_Response_Plan.pdf',
    'pdf',
    911360,
    12,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2026-02-04T10:00:00Z'
  ),
  createDocument(
    'doc-MTG-006-agenda',
    'Emergency Meeting Agenda',
    'Agenda for emergency strategy session',
    'cat-agenda',
    'Agenda_MTG_006.pdf',
    'pdf',
    204800,
    2,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2026-02-04T11:00:00Z',
    { source: 'generated' }
  ),

  // ========================================================================
  // MTG-007: completed.recent - Post-Meeting with Draft Minutes
  // ========================================================================
  createDocument(
    'doc-MTG-007-001',
    'Board Pack - January 2026',
    'Complete board pack for January 2026 meeting',
    'cat-board-pack',
    'Board_Pack_Jan_2026.pdf',
    'pdf',
    2202009,
    38,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2026-01-10T09:00:00Z',
    {},
    true // Watermarked
  ),
  createDocument(
    'doc-MTG-007-002',
    'Q3 2025 Minutes',
    'Approved minutes from Q3 2025 meeting',
    'cat-minutes',
    'Minutes_Q3_2025.pdf',
    'pdf',
    430080,
    8,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2026-01-08T10:00:00Z',
    { status: 'archived' }
  ),
  createDocument(
    'doc-MTG-007-003',
    'Financial Performance Q4 2025',
    'Quarterly financial performance report',
    'cat-financial',
    'Financial_Q4_2025.pdf',
    'pdf',
    1153434,
    24,
    'ktda-ms',
    20,
    'Brian Mochama',
    '2026-01-09T09:00:00Z',
    {},
    true // Watermarked financial
  ),
  createDocument(
    'doc-MTG-007-004',
    'Strategy Presentation Q1 2026',
    'Strategic initiatives for Q1 2026',
    'cat-presentation',
    'Strategy_Q1_2026.pptx',
    'pptx',
    2516582,
    22,
    'ktda-ms',
    18,
    'Isaac Chege',
    '2026-01-12T14:00:00Z'
  ),
  createDocument(
    'doc-MTG-007-agenda',
    'January 2026 Meeting Agenda',
    'Official agenda for January 2026 board meeting',
    'cat-agenda',
    'Agenda_MTG_007.pdf',
    'pdf',
    327680,
    5,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2026-01-13T10:00:00Z',
    { source: 'generated' }
  ),
  createDocument(
    'doc-MTG-007-minutes-draft',
    'January 2026 Minutes - Draft',
    'Draft minutes awaiting approval - NOT YET FINAL',
    'cat-minutes',
    'Minutes_MTG_007_Draft.pdf',
    'pdf',
    512000,
    14,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2026-01-20T12:00:00Z',
    { source: 'generated', status: 'draft' }
  ),

  // ========================================================================
  // MTG-008: completed.archived - Historical with Approved Minutes
  // ========================================================================
  createDocument(
    'doc-MTG-008-001',
    'Board Pack - October 2025',
    'Complete board pack for October 2025 meeting',
    'cat-board-pack',
    'Board_Pack_Oct_2025.pdf',
    'pdf',
    2097152,
    42,
    'ktda-ms',
    18,
    'Isaac Chege',
    '2025-09-20T09:00:00Z',
    { status: 'archived' },
    true // Watermarked
  ),
  createDocument(
    'doc-MTG-008-002',
    'Q2 2025 Minutes',
    'Approved minutes from Q2 2025 meeting',
    'cat-minutes',
    'Minutes_Q2_2025.pdf',
    'pdf',
    409600,
    10,
    'ktda-ms',
    18,
    'Isaac Chege',
    '2025-09-18T10:00:00Z',
    { status: 'archived' }
  ),
  createDocument(
    'doc-MTG-008-003',
    'Operations Report Q3 2025',
    'Comprehensive operational report',
    'cat-report',
    'Operations_Q3_2025.pdf',
    'pdf',
    1003520,
    18,
    'ktda-ms',
    19,
    'Jane Njeri',
    '2025-09-22T09:00:00Z',
    { status: 'archived' }
  ),
  createDocument(
    'doc-MTG-008-004',
    'Investment Strategy Analysis',
    'Long-term investment strategy proposal',
    'cat-report',
    'Investment_Strategy_2025.pdf',
    'pdf',
    1153434,
    26,
    'ktda-ms',
    20,
    'Brian Mochama',
    '2025-09-25T14:00:00Z',
    { status: 'archived' }
  ),
  createDocument(
    'doc-MTG-008-agenda',
    'October 2025 Meeting Agenda',
    'Official agenda for October 2025 board meeting',
    'cat-agenda',
    'Agenda_MTG_008.pdf',
    'pdf',
    286720,
    4,
    'ktda-ms',
    18,
    'Isaac Chege',
    '2025-09-28T10:00:00Z',
    { source: 'generated', status: 'archived' }
  ),
  createDocument(
    'doc-MTG-008-minutes-approved',
    'October 2025 Minutes - Approved',
    'Final approved minutes with chairman signature',
    'cat-minutes',
    'Minutes_MTG_008_Approved.pdf',
    'pdf',
    614400,
    16,
    'ktda-ms',
    18,
    'Isaac Chege',
    '2025-11-15T10:00:00Z',
    { source: 'signed', status: 'archived' }
  ),

  // ========================================================================
  // MTG-009: cancelled - Finance Committee (Cancelled Before Execution)
  // ========================================================================
  createDocument(
    'doc-MTG-009-001',
    'Finance Committee Report',
    'Quarterly finance committee report',
    'cat-report',
    'Finance_Committee_Q4_2025.pdf',
    'pdf',
    737280,
    14,
    'comm-finance',
    18,
    'Isaac Chege',
    '2026-02-20T09:00:00Z'
  ),
  createDocument(
    'doc-MTG-009-002',
    'Budget Variance Analysis',
    'Analysis of budget variances Q4 2025',
    'cat-financial',
    'Budget_Variance_Q4_2025.xlsx',
    'xlsx',
    307200,
    8,
    'comm-finance',
    20,
    'Brian Mochama',
    '2026-02-21T10:00:00Z'
  ),
  createDocument(
    'doc-MTG-009-agenda',
    'Finance Committee Agenda',
    'Agenda for cancelled finance committee meeting',
    'cat-agenda',
    'Agenda_MTG_009.pdf',
    'pdf',
    204800,
    3,
    'comm-finance',
    18,
    'Isaac Chege',
    '2026-02-22T11:00:00Z',
    { source: 'generated' }
  ),

  // ========================================================================
  // BOARD-LEVEL DOCUMENTS (Not meeting-specific)
  // ========================================================================
  createDocument(
    'doc-board-policy-001',
    'Board Governance Charter',
    'Corporate governance framework and board charter',
    'cat-policy',
    'Governance_Charter.pdf',
    'pdf',
    512000,
    24,
    'ktda-ms',
    1,
    'Hon. Chege Kirundi',
    '2024-06-15T10:00:00Z'
  ),
  createDocument(
    'doc-board-policy-002',
    'Code of Conduct for Directors',
    'Board member code of conduct and ethics',
    'cat-policy',
    'Code_of_Conduct.pdf',
    'pdf',
    409600,
    18,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2024-08-20T14:00:00Z'
  ),
  createDocument(
    'doc-board-policy-003',
    'Conflict of Interest Policy',
    'Director conflict of interest guidelines',
    'cat-policy',
    'Conflict_Interest_Policy.pdf',
    'pdf',
    327680,
    12,
    'ktda-ms',
    17,
    'Kenneth Muhia',
    '2024-09-10T10:00:00Z'
  ),

  // ========================================================================
  // SUBSIDIARY DOCUMENTS (KETEPA)
  // ========================================================================
  createDocument(
    'doc-ketepa-001',
    'KETEPA Annual Report 2025',
    'Complete annual report for KETEPA subsidiary',
    'cat-report',
    'KETEPA_Annual_Report_2025.pdf',
    'pdf',
    3145728,
    64,
    'ketepa',
    19,
    'Jane Njeri',
    '2025-12-20T10:00:00Z',
    {},
    true // Watermarked annual report
  ),

  // ========================================================================
  // SYSTEM DOCUMENT (Available to all)
  // ========================================================================
  createDocument(
    'doc-system-001',
    'Board Portal User Guide',
    'Comprehensive user guide for board portal system',
    'cat-other',
    'Board_Portal_Guide.pdf',
    'pdf',
    2097152,
    56,
    null, // No board - available to all
    17,
    'Kenneth Muhia',
    '2025-10-01T10:00:00Z'
  ),
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get documents by meeting ID
 */
export const getDocumentsByMeetingId = (meetingId: string): DocumentRow[] => {
  // Documents with meeting ID in their ID (convention: doc-MTG-XXX-YYY)
  return documentsTable.filter((doc) => doc.id.includes(meetingId));
};

/**
 * Get documents by board ID
 */
export const getDocumentsByBoardId = (boardId: string): DocumentRow[] => {
  return documentsTable.filter((doc) => doc.boardId === boardId);
};

/**
 * Get document by ID
 */
export const getDocumentById = (documentId: string): DocumentRow | undefined => {
  return documentsTable.find((doc) => doc.id === documentId);
};

/**
 * Get documents by category
 */
export const getDocumentsByCategory = (categoryId: string): DocumentRow[] => {
  return documentsTable.filter((doc) => doc.categoryId === categoryId);
};

/**
 * Get documents by status
 */
export const getDocumentsByStatus = (status: DocumentStatus): DocumentRow[] => {
  return documentsTable.filter((doc) => doc.status === status);
};

/**
 * Get published documents (most common query)
 */
export const getPublishedDocuments = (): DocumentRow[] => {
  return documentsTable.filter((doc) => doc.status === 'published');
};

/**
 * Get archived documents
 */
export const getArchivedDocuments = (): DocumentRow[] => {
  return documentsTable.filter((doc) => doc.status === 'archived');
};

/**
 * Get watermarked documents
 */
export const getWatermarkedDocuments = (): DocumentRow[] => {
  return documentsTable.filter((doc) => doc.watermarkEnabled);
};
