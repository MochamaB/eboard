/**
 * Document Versions Table - Version History
 * REBUILT to match new documents with uppercase meeting IDs (MTG-001 format)
 * Tracks version history for documents (simple versioning)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DocumentVersionRow {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  url: string;
  uploadedBy: number;
  uploadedByName: string;
  uploadedAt: string;
  changeNotes: string | null;
  isLatest: boolean;
}

// ============================================================================
// DOCUMENT VERSIONS TABLE DATA - Aligned with new documents
// ============================================================================

export const documentVersionsTable: DocumentVersionRow[] = [
  // ========================================================================
  // MTG-002 Financial Statements - 3 versions (iterative improvements)
  // ========================================================================
  {
    id: 'ver-MTG-002-002-v1',
    documentId: 'doc-MTG-002-002',
    versionNumber: 1,
    fileName: 'Financial_Statements_Q4_2025_v1.pdf',
    fileSize: 1400000,
    url: '/mock-documents/Financial_Statements_Q4_2025_v1.pdf',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-01-28T09:00:00Z',
    changeNotes: 'Initial draft with preliminary figures',
    isLatest: false,
  },
  {
    id: 'ver-MTG-002-002-v2',
    documentId: 'doc-MTG-002-002',
    versionNumber: 2,
    fileName: 'Financial_Statements_Q4_2025_v2.pdf',
    fileSize: 1500000,
    url: '/mock-documents/Financial_Statements_Q4_2025_v2.pdf',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-02-02T14:00:00Z',
    changeNotes: 'Updated with final December figures and audit adjustments',
    isLatest: false,
  },
  {
    id: 'ver-MTG-002-002-v3',
    documentId: 'doc-MTG-002-002',
    versionNumber: 3,
    fileName: 'Financial_Statements_Q4_2025.pdf',
    fileSize: 1572864,
    url: '/mock-documents/Financial_Statements_Q4_2025.pdf',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-02-04T09:00:00Z',
    changeNotes: 'Final version with watermark applied',
    isLatest: true,
  },

  // ========================================================================
  // MTG-002 Budget - 2 versions
  // ========================================================================
  {
    id: 'ver-MTG-002-003-v1',
    documentId: 'doc-MTG-002-003',
    versionNumber: 1,
    fileName: 'Budget_Q1_2026_v1.xlsx',
    fileSize: 180000,
    url: '/mock-documents/Budget_Q1_2026_v1.xlsx',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-01-30T10:00:00Z',
    changeNotes: 'Initial budget draft',
    isLatest: false,
  },
  {
    id: 'ver-MTG-002-003-v2',
    documentId: 'doc-MTG-002-003',
    versionNumber: 2,
    fileName: 'Budget_Q1_2026.xlsx',
    fileSize: 204800,
    url: '/mock-documents/Budget_Q1_2026.xlsx',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-02-04T11:00:00Z',
    changeNotes: 'Revised based on CFO feedback',
    isLatest: true,
  },

  // ========================================================================
  // MTG-003 Internal Audit Report - 2 versions
  // ========================================================================
  {
    id: 'ver-MTG-003-001-v1',
    documentId: 'doc-MTG-003-001',
    versionNumber: 1,
    fileName: 'Internal_Audit_Q4_2025_Draft.pdf',
    fileSize: 1700000,
    url: '/mock-documents/Internal_Audit_Q4_2025_Draft.pdf',
    uploadedBy: 21,
    uploadedByName: 'Winfred Kabuuri',
    uploadedAt: '2026-02-01T09:00:00Z',
    changeNotes: 'Draft for internal review',
    isLatest: false,
  },
  {
    id: 'ver-MTG-003-001-v2',
    documentId: 'doc-MTG-003-001',
    versionNumber: 2,
    fileName: 'Internal_Audit_Q4_2025.pdf',
    fileSize: 1887436,
    url: '/mock-documents/Internal_Audit_Q4_2025.pdf',
    uploadedBy: 21,
    uploadedByName: 'Winfred Kabuuri',
    uploadedAt: '2026-02-08T14:00:00Z',
    changeNotes: 'Incorporated management responses and added confidential watermark',
    isLatest: true,
  },

  // ========================================================================
  // MTG-004 Board Pack - 2 versions
  // ========================================================================
  {
    id: 'ver-MTG-004-001-v1',
    documentId: 'doc-MTG-004-001',
    versionNumber: 1,
    fileName: 'Board_Pack_KETEPA_Q1_2026_Draft.pdf',
    fileSize: 2400000,
    url: '/mock-documents/Board_Pack_KETEPA_Q1_2026_Draft.pdf',
    uploadedBy: 19,
    uploadedByName: 'Jane Njeri',
    uploadedAt: '2026-02-15T09:00:00Z',
    changeNotes: 'Initial board pack draft',
    isLatest: false,
  },
  {
    id: 'ver-MTG-004-001-v2',
    documentId: 'doc-MTG-004-001',
    versionNumber: 2,
    fileName: 'Board_Pack_KETEPA_Q1_2026.pdf',
    fileSize: 2621440,
    url: '/mock-documents/Board_Pack_KETEPA_Q1_2026.pdf',
    uploadedBy: 19,
    uploadedByName: 'Jane Njeri',
    uploadedAt: '2026-02-18T09:00:00Z',
    changeNotes: 'Final version with updated export projections and watermark',
    isLatest: true,
  },

  // ========================================================================
  // MTG-007 Board Pack - 3 versions (more iterations)
  // ========================================================================
  {
    id: 'ver-MTG-007-001-v1',
    documentId: 'doc-MTG-007-001',
    versionNumber: 1,
    fileName: 'Board_Pack_Jan_2026_v1.pdf',
    fileSize: 2000000,
    url: '/mock-documents/Board_Pack_Jan_2026_v1.pdf',
    uploadedBy: 17,
    uploadedByName: 'Kenneth Muhia',
    uploadedAt: '2026-01-03T09:00:00Z',
    changeNotes: 'Initial compilation of materials',
    isLatest: false,
  },
  {
    id: 'ver-MTG-007-001-v2',
    documentId: 'doc-MTG-007-001',
    versionNumber: 2,
    fileName: 'Board_Pack_Jan_2026_v2.pdf',
    fileSize: 2100000,
    url: '/mock-documents/Board_Pack_Jan_2026_v2.pdf',
    uploadedBy: 17,
    uploadedByName: 'Kenneth Muhia',
    uploadedAt: '2026-01-08T14:00:00Z',
    changeNotes: 'Added missing financial tables',
    isLatest: false,
  },
  {
    id: 'ver-MTG-007-001-v3',
    documentId: 'doc-MTG-007-001',
    versionNumber: 3,
    fileName: 'Board_Pack_Jan_2026.pdf',
    fileSize: 2202009,
    url: '/mock-documents/Board_Pack_Jan_2026.pdf',
    uploadedBy: 17,
    uploadedByName: 'Kenneth Muhia',
    uploadedAt: '2026-01-10T09:00:00Z',
    changeNotes: 'Final version with watermark applied',
    isLatest: true,
  },

  // ========================================================================
  // Board Policy Documents - Version history
  // ========================================================================
  {
    id: 'ver-policy-001-v1',
    documentId: 'doc-board-policy-001',
    versionNumber: 1,
    fileName: 'Governance_Charter_v1.pdf',
    fileSize: 450000,
    url: '/mock-documents/Governance_Charter_v1.pdf',
    uploadedBy: 1,
    uploadedByName: 'Hon. Chege Kirundi',
    uploadedAt: '2024-01-15T10:00:00Z',
    changeNotes: 'Original charter approved by board',
    isLatest: false,
  },
  {
    id: 'ver-policy-001-v2',
    documentId: 'doc-board-policy-001',
    versionNumber: 2,
    fileName: 'Governance_Charter.pdf',
    fileSize: 512000,
    url: '/mock-documents/Governance_Charter.pdf',
    uploadedBy: 1,
    uploadedByName: 'Hon. Chege Kirundi',
    uploadedAt: '2024-06-15T10:00:00Z',
    changeNotes: 'Annual review updates - revised committee structures',
    isLatest: true,
  },

  // ========================================================================
  // KETEPA Annual Report - 2 versions
  // ========================================================================
  {
    id: 'ver-ketepa-001-v1',
    documentId: 'doc-ketepa-001',
    versionNumber: 1,
    fileName: 'KETEPA_Annual_Report_2025_Draft.pdf',
    fileSize: 2900000,
    url: '/mock-documents/KETEPA_Annual_Report_2025_Draft.pdf',
    uploadedBy: 19,
    uploadedByName: 'Jane Njeri',
    uploadedAt: '2025-12-10T10:00:00Z',
    changeNotes: 'Draft annual report for review',
    isLatest: false,
  },
  {
    id: 'ver-ketepa-001-v2',
    documentId: 'doc-ketepa-001',
    versionNumber: 2,
    fileName: 'KETEPA_Annual_Report_2025.pdf',
    fileSize: 3145728,
    url: '/mock-documents/KETEPA_Annual_Report_2025.pdf',
    uploadedBy: 19,
    uploadedByName: 'Jane Njeri',
    uploadedAt: '2025-12-20T10:00:00Z',
    changeNotes: 'Final approved version with watermark',
    isLatest: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all versions for a document
 */
export const getDocumentVersions = (documentId: string): DocumentVersionRow[] => {
  return documentVersionsTable
    .filter(v => v.documentId === documentId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
};

/**
 * Get latest version for a document
 */
export const getLatestVersion = (documentId: string): DocumentVersionRow | undefined => {
  return documentVersionsTable.find(v => v.documentId === documentId && v.isLatest);
};

/**
 * Get specific version
 */
export const getVersion = (documentId: string, versionNumber: number): DocumentVersionRow | undefined => {
  return documentVersionsTable.find(
    v => v.documentId === documentId && v.versionNumber === versionNumber
  );
};

/**
 * Get version count for a document
 */
export const getVersionCount = (documentId: string): number => {
  return documentVersionsTable.filter(v => v.documentId === documentId).length;
};

/**
 * Check if document has multiple versions
 */
export const hasMultipleVersions = (documentId: string): boolean => {
  return getVersionCount(documentId) > 1;
};
