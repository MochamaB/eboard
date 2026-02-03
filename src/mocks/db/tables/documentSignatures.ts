/**
 * Document Signatures Table - Digital Signatures
 * Tracks digital signatures on documents
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SignatureMethod = 'digital' | 'electronic' | 'wet';

export interface DocumentSignatureRow {
  id: string;
  documentId: string;
  signedBy: number;
  signedByName: string;
  signedAt: string;
  signatureMethod: SignatureMethod;
  signatureData: string | null;       // Hash or certificate reference
  certificateId: string | null;
  isValid: boolean;
  validatedAt: string | null;
  expiresAt: string | null;
}

// ============================================================================
// DOCUMENT SIGNATURES TABLE DATA
// ============================================================================

export const documentSignaturesTable: DocumentSignatureRow[] = [
  // Board Governance Charter - signed by Chairman
  {
    id: 'sig-001',
    documentId: 'doc-board-policy-001',
    signedBy: 1,
    signedByName: 'Hon. Chege Kirundi',
    signedAt: '2024-06-15T11:00:00Z',
    signatureMethod: 'digital',
    signatureData: 'sha256:a1b2c3d4e5f6...',
    certificateId: 'cert-chairman-001',
    isValid: true,
    validatedAt: '2024-06-15T11:00:00Z',
    expiresAt: '2026-06-15T11:00:00Z',
  },

  // Code of Conduct - signed by Company Secretary
  {
    id: 'sig-002',
    documentId: 'doc-board-policy-002',
    signedBy: 17,
    signedByName: 'Kenneth Muhia',
    signedAt: '2024-08-20T15:00:00Z',
    signatureMethod: 'digital',
    signatureData: 'sha256:b2c3d4e5f6g7...',
    certificateId: 'cert-secretary-001',
    isValid: true,
    validatedAt: '2024-08-20T15:00:00Z',
    expiresAt: '2026-08-20T15:00:00Z',
  },

  // Q4 2025 Minutes - signed by Chairman and Secretary
  {
    id: 'sig-003',
    documentId: 'doc-mtg008-002',
    signedBy: 1,
    signedByName: 'Hon. Chege Kirundi',
    signedAt: '2025-01-20T10:00:00Z',
    signatureMethod: 'digital',
    signatureData: 'sha256:c3d4e5f6g7h8...',
    certificateId: 'cert-chairman-001',
    isValid: true,
    validatedAt: '2025-01-20T10:00:00Z',
    expiresAt: '2027-01-20T10:00:00Z',
  },
  {
    id: 'sig-004',
    documentId: 'doc-mtg008-002',
    signedBy: 17,
    signedByName: 'Kenneth Muhia',
    signedAt: '2025-01-20T10:30:00Z',
    signatureMethod: 'digital',
    signatureData: 'sha256:d4e5f6g7h8i9...',
    certificateId: 'cert-secretary-001',
    isValid: true,
    validatedAt: '2025-01-20T10:30:00Z',
    expiresAt: '2027-01-20T10:30:00Z',
  },

  // Audit Report - signed by Audit Committee Chair
  {
    id: 'sig-005',
    documentId: 'doc-mtg004-001',
    signedBy: 21,
    signedByName: 'Winfred Kabuuri',
    signedAt: '2026-01-08T16:00:00Z',
    signatureMethod: 'electronic',
    signatureData: null,
    certificateId: null,
    isValid: true,
    validatedAt: '2026-01-08T16:00:00Z',
    expiresAt: null,
  },

  // Board Resolution - multiple signatures
  {
    id: 'sig-006',
    documentId: 'doc-mtg001-005',
    signedBy: 1,
    signedByName: 'Hon. Chege Kirundi',
    signedAt: '2026-01-13T17:00:00Z',
    signatureMethod: 'digital',
    signatureData: 'sha256:e5f6g7h8i9j0...',
    certificateId: 'cert-chairman-001',
    isValid: true,
    validatedAt: '2026-01-13T17:00:00Z',
    expiresAt: '2028-01-13T17:00:00Z',
  },
  {
    id: 'sig-007',
    documentId: 'doc-mtg001-005',
    signedBy: 17,
    signedByName: 'Kenneth Muhia',
    signedAt: '2026-01-13T17:15:00Z',
    signatureMethod: 'digital',
    signatureData: 'sha256:f6g7h8i9j0k1...',
    certificateId: 'cert-secretary-001',
    isValid: true,
    validatedAt: '2026-01-13T17:15:00Z',
    expiresAt: '2028-01-13T17:15:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all signatures for a document
 */
export const getDocumentSignatures = (documentId: string): DocumentSignatureRow[] => {
  return documentSignaturesTable.filter(s => s.documentId === documentId);
};

/**
 * Check if document is signed
 */
export const isDocumentSigned = (documentId: string): boolean => {
  return documentSignaturesTable.some(s => s.documentId === documentId && s.isValid);
};

/**
 * Get signatures by user
 */
export const getSignaturesByUser = (userId: number): DocumentSignatureRow[] => {
  return documentSignaturesTable.filter(s => s.signedBy === userId);
};

/**
 * Get valid signatures count for a document
 */
export const getValidSignatureCount = (documentId: string): number => {
  return documentSignaturesTable.filter(s => s.documentId === documentId && s.isValid).length;
};
