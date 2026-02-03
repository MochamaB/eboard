/**
 * Documents Table - Lean Core Document Storage
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
  url: '/mock-documents/sample.pdf',
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
// DOCUMENTS TABLE DATA - Documents across multiple boards and meetings
// Board IDs must match meetings.boardId for proper filtering
// ============================================================================

export const documentsTable: DocumentRow[] = [
  // ========================================================================
  // KTDA-MS MAIN BOARD MEETINGS
  // ========================================================================
  
  // MTG-001: Q1 2026 Board Meeting (boardId: ktda-ms)
  createDocument('doc-mtg001-001', 'Board Pack - Q1 2026', 'Complete board pack for Q1 2026', 'cat-board-pack', 'Board_Pack_Q1_2026.pdf', 'pdf', 2621440, 45, 'ktda-ms', 17, 'Kenneth Muhia', '2026-01-15T09:00:00Z', {}, true), // With watermark
  createDocument('doc-mtg001-002', 'Q4 2024 Minutes', 'Minutes from Q4 2024 board meeting', 'cat-minutes', 'Minutes_Q4_2024.pdf', 'pdf', 460800, 8, 'ktda-ms', 17, 'Kenneth Muhia', '2026-01-14T10:00:00Z'),
  createDocument('doc-mtg001-003', 'Q4 2025 Financial Report', 'Financial report for Q4 2025', 'cat-financial', 'Financial_Report_Q4_2025.xlsx', 'xlsx', 204800, 15, 'ktda-ms', 20, 'Brian Mochama', '2026-01-12T14:30:00Z', {}, true), // With watermark - Financial
  createDocument('doc-mtg001-004', 'Q1 2026 Budget Presentation', 'Budget presentation by Finance Director', 'cat-presentation', 'Budget_Q1_2026.pptx', 'pptx', 3250585, 28, 'ktda-ms', 20, 'Brian Mochama', '2026-01-16T11:00:00Z'),
  createDocument('doc-mtg001-005', 'Board Resolution - Strategic Plan', 'Resolution for strategic initiatives 2026 - CONFIDENTIAL', 'cat-resolution', 'Resolution_Strategic_2026.pdf', 'pdf', 911360, 12, 'ktda-ms', 1, 'Hon. Chege Kirundi', '2026-01-13T16:00:00Z', {}, true), // Confidential with watermark
  createDocument('doc-mtg001-006', 'Risk Assessment Report', 'Risk assessment for Q1 2026', 'cat-report', 'Risk_Assessment_Q1_2026.pdf', 'pdf', 1887436, 22, 'ktda-ms', 17, 'Kenneth Muhia', '2026-01-14T15:00:00Z'),
  createDocument('doc-mtg001-agenda', 'Q1 2026 Meeting Agenda', 'Official agenda for Q1 2026', 'cat-agenda', 'Agenda_Q1_2026.pdf', 'pdf', 327680, 4, 'ktda-ms', 17, 'Kenneth Muhia', '2026-01-15T10:00:00Z', { source: 'generated' }),

  // MTG-002: Emergency Strategy Session - COMPLETED (boardId: ktda-ms)
  createDocument('doc-mtg002-001', 'Market Analysis Report', 'Emergency market analysis', 'cat-report', 'Market_Analysis_Jan_2026.pdf', 'pdf', 1572864, 18, 'ktda-ms', 20, 'Brian Mochama', '2026-01-14T12:00:00Z', { status: 'archived' }),
  createDocument('doc-mtg002-002', 'Strategic Response Plan', 'Emergency response plan', 'cat-report', 'Response_Plan_Jan_2026.pdf', 'pdf', 911360, 12, 'ktda-ms', 1, 'Hon. Chege Kirundi', '2026-01-14T14:00:00Z', { status: 'archived' }),
  createDocument('doc-mtg002-003', 'Emergency Actions Summary', 'Summary of approved actions', 'cat-report', 'Emergency_Actions_Jan_2026.pdf', 'pdf', 430080, 5, 'ktda-ms', 17, 'Kenneth Muhia', '2026-01-15T17:00:00Z', { status: 'archived' }),

  // MTG-003: Budget Review Meeting - PENDING (boardId: ktda-ms)
  createDocument('doc-mtg003-001', '2025 Performance Review', 'Annual performance review for 2025', 'cat-report', 'Performance_Review_2025.pdf', 'pdf', 1258291, 16, 'ktda-ms', 20, 'Brian Mochama', '2026-01-10T10:00:00Z', { status: 'draft' }),
  createDocument('doc-mtg003-002', 'Draft 2026 Strategic Plan', 'Draft strategic plan document', 'cat-report', 'Draft_Strategic_Plan_2026.pdf', 'pdf', 911360, 22, 'ktda-ms', 20, 'Brian Mochama', '2026-01-11T09:00:00Z', { status: 'draft' }),

  // ========================================================================
  // AUDIT COMMITTEE (MTG-004, boardId: comm-audit)
  // ========================================================================
  
  createDocument('doc-mtg004-001', 'Internal Audit Report Q4 2025', 'Internal audit report for Q4 2025 - CONFIDENTIAL', 'cat-audit', 'Internal_Audit_Q4_2025.pdf', 'pdf', 1887436, 32, 'comm-audit', 21, 'Winfred Kabuuri', '2026-01-08T14:00:00Z', {}, true), // Confidential with watermark
  createDocument('doc-mtg004-002', 'Compliance Review Report', 'Compliance review findings', 'cat-report', 'Compliance_Review_2025.pdf', 'pdf', 573440, 8, 'comm-audit', 18, 'Isaac Chege', '2026-01-09T10:00:00Z'),
  createDocument('doc-mtg004-003', '2026 Audit Plan', 'Proposed audit plan for 2026', 'cat-report', 'Audit_Plan_2026.pdf', 'pdf', 737280, 12, 'comm-audit', 18, 'Isaac Chege', '2026-01-09T11:00:00Z'),
  createDocument('doc-mtg004-agenda', 'Audit Committee Agenda Q1 2026', 'Official agenda', 'cat-agenda', 'Audit_Agenda_Q1_2026.pdf', 'pdf', 286720, 3, 'comm-audit', 18, 'Isaac Chege', '2026-01-10T11:00:00Z', { source: 'generated' }),

  // ========================================================================
  // KETEPA SUBSIDIARY (MTG-008, boardId: ketepa)
  // ========================================================================
  
  createDocument('doc-mtg008-001', 'Board Pack Q4 2025', 'Complete board pack for Q4 2025', 'cat-board-pack', 'Board_Pack_Q4_2025.pdf', 'pdf', 2202009, 38, 'ketepa', 18, 'Isaac Chege', '2025-01-10T09:00:00Z', { status: 'archived' }),
  createDocument('doc-mtg008-002', 'Q3 2024 Minutes', 'Minutes from Q3 2024', 'cat-minutes', 'Minutes_Q3_2024.pdf', 'pdf', 430080, 7, 'ketepa', 18, 'Isaac Chege', '2025-01-08T10:00:00Z', { status: 'archived' }),
  createDocument('doc-mtg008-003', 'Operations Report Q4 2024', 'Quarterly operations report', 'cat-report', 'Operations_Q4_2024.pdf', 'pdf', 1003520, 11, 'ketepa', 18, 'Isaac Chege', '2025-01-09T09:00:00Z', { status: 'archived' }),
  createDocument('doc-mtg008-004', 'Sales Performance Presentation', 'Q4 sales performance', 'cat-presentation', 'Sales_Q4_2024.pptx', 'pptx', 2516582, 18, 'ketepa', 20, 'Brian Mochama', '2025-01-15T14:00:00Z', { status: 'archived' }),
  createDocument('doc-mtg008-005', 'Investment Strategy Proposal', 'Investment strategy for 2025', 'cat-report', 'Investment_Strategy_2025.pdf', 'pdf', 1153434, 14, 'ketepa', 18, 'Isaac Chege', '2025-01-12T11:00:00Z', { status: 'archived' }),

  // ========================================================================
  // GREENLAND FEDHA SUBSIDIARY - Additional documents
  // ========================================================================
  
  createDocument('doc-gf-001', 'Greenland Fedha Q4 2025 Report', 'Quarterly financial services report', 'cat-financial', 'GF_Q4_2025_Report.pdf', 'pdf', 1572864, 24, 'greenland-fedha', 18, 'Isaac Chege', '2025-12-20T10:00:00Z', {}, true), // With watermark
  createDocument('doc-gf-002', 'Loan Portfolio Analysis', 'Analysis of current loan portfolio - CONFIDENTIAL', 'cat-report', 'Loan_Portfolio_2025.xlsx', 'xlsx', 512000, 12, 'greenland-fedha', 20, 'Brian Mochama', '2025-12-15T14:00:00Z', {}, true), // Confidential with watermark
  createDocument('doc-gf-003', 'Risk Management Policy', 'Financial risk management framework', 'cat-policy', 'GF_Risk_Policy.pdf', 'pdf', 409600, 18, 'greenland-fedha', 17, 'Kenneth Muhia', '2025-06-01T10:00:00Z'),

  // ========================================================================
  // CHAI TRADING SUBSIDIARY (MTG-010, boardId: chai-trading)
  // ========================================================================
  
  createDocument('doc-ct-001', 'Export Performance Report', 'Tea export performance Q4 2024', 'cat-report', 'Export_Performance_Q4_2024.pdf', 'pdf', 1258291, 16, 'chai-trading', 18, 'Isaac Chege', '2025-01-20T09:00:00Z'),
  createDocument('doc-ct-002', 'Trading Partners Analysis', 'Analysis of key trading partners', 'cat-report', 'Trading_Partners_2025.pdf', 'pdf', 737280, 10, 'chai-trading', 20, 'Brian Mochama', '2025-01-18T11:00:00Z'),

  // ========================================================================
  // KTDA-MS BOARD-LEVEL DOCUMENTS (Policies, Governance)
  // ========================================================================
  
  createDocument('doc-board-policy-001', 'Board Governance Charter', 'Corporate governance framework', 'cat-policy', 'Governance_Charter.pdf', 'pdf', 512000, 24, 'ktda-ms', 1, 'Hon. Chege Kirundi', '2024-06-15T10:00:00Z'),
  createDocument('doc-board-policy-002', 'Code of Conduct', 'Board member code of conduct', 'cat-policy', 'Code_of_Conduct.pdf', 'pdf', 409600, 18, 'ktda-ms', 17, 'Kenneth Muhia', '2024-08-20T14:00:00Z'),
  createDocument('doc-board-policy-003', 'Conflict of Interest Policy', 'Director conflict of interest guidelines', 'cat-policy', 'Conflict_Interest_Policy.pdf', 'pdf', 327680, 12, 'ktda-ms', 17, 'Kenneth Muhia', '2024-09-10T10:00:00Z'),
  
  // System document (no board - available to all)
  createDocument('doc-system-001', 'Board Portal User Guide', 'System documentation for board members', 'cat-other', 'Board_Portal_Guide.pdf', 'pdf', 2097152, 56, null, 17, 'Kenneth Muhia', '2025-10-01T10:00:00Z'),
];
