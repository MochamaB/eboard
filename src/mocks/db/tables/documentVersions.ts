/**
 * Document Versions Table - Version History
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
// DOCUMENT VERSIONS TABLE DATA
// ============================================================================

export const documentVersionsTable: DocumentVersionRow[] = [
  // Board Pack Q1 2026 - has 2 versions
  {
    id: 'ver-001',
    documentId: 'doc-mtg001-001',
    versionNumber: 1,
    fileName: 'Board_Pack_Q1_2026_v1.pdf',
    fileSize: 2400000,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 17,
    uploadedByName: 'Kenneth Muhia',
    uploadedAt: '2026-01-10T09:00:00Z',
    changeNotes: 'Initial draft',
    isLatest: false,
  },
  {
    id: 'ver-002',
    documentId: 'doc-mtg001-001',
    versionNumber: 2,
    fileName: 'Board_Pack_Q1_2026_v2.pdf',
    fileSize: 2621440,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 17,
    uploadedByName: 'Kenneth Muhia',
    uploadedAt: '2026-01-15T09:00:00Z',
    changeNotes: 'Updated financial projections',
    isLatest: true,
  },

  // Financial Report - has 3 versions
  {
    id: 'ver-003',
    documentId: 'doc-mtg001-003',
    versionNumber: 1,
    fileName: 'Financial_Report_Q4_2025_v1.xlsx',
    fileSize: 180000,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-01-05T10:00:00Z',
    changeNotes: 'Initial draft',
    isLatest: false,
  },
  {
    id: 'ver-004',
    documentId: 'doc-mtg001-003',
    versionNumber: 2,
    fileName: 'Financial_Report_Q4_2025_v2.xlsx',
    fileSize: 195000,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-01-08T14:00:00Z',
    changeNotes: 'Added December figures',
    isLatest: false,
  },
  {
    id: 'ver-005',
    documentId: 'doc-mtg001-003',
    versionNumber: 3,
    fileName: 'Financial_Report_Q4_2025_v3.xlsx',
    fileSize: 204800,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 20,
    uploadedByName: 'Brian Mochama',
    uploadedAt: '2026-01-12T14:30:00Z',
    changeNotes: 'Final review corrections',
    isLatest: true,
  },

  // Audit Report - has 2 versions
  {
    id: 'ver-006',
    documentId: 'doc-mtg004-001',
    versionNumber: 1,
    fileName: 'Internal_Audit_Report_Q4_v1.pdf',
    fileSize: 1800000,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 21,
    uploadedByName: 'Winfred Kabuuri',
    uploadedAt: '2026-01-02T09:00:00Z',
    changeNotes: 'Draft for internal review',
    isLatest: false,
  },
  {
    id: 'ver-007',
    documentId: 'doc-mtg004-001',
    versionNumber: 2,
    fileName: 'Internal_Audit_Report_Q4_v2.pdf',
    fileSize: 1887436,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 21,
    uploadedByName: 'Winfred Kabuuri',
    uploadedAt: '2026-01-08T14:00:00Z',
    changeNotes: 'Incorporated management responses',
    isLatest: true,
  },

  // Board Governance Charter - has 2 versions
  {
    id: 'ver-008',
    documentId: 'doc-board-policy-001',
    versionNumber: 1,
    fileName: 'Board_Governance_Charter_v1.pdf',
    fileSize: 450000,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 1,
    uploadedByName: 'Hon. Chege Kirundi',
    uploadedAt: '2024-01-15T10:00:00Z',
    changeNotes: 'Original charter',
    isLatest: false,
  },
  {
    id: 'ver-009',
    documentId: 'doc-board-policy-001',
    versionNumber: 2,
    fileName: 'Board_Governance_Charter_v2.pdf',
    fileSize: 512000,
    url: '/mock-documents/sample.pdf',
    uploadedBy: 1,
    uploadedByName: 'Hon. Chege Kirundi',
    uploadedAt: '2024-06-15T10:00:00Z',
    changeNotes: 'Annual review updates',
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
