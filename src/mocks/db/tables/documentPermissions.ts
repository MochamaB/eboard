/**
 * Document Permissions Table - Access Control
 * Manages document-level permissions for meeting execution and access control
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type PermissionGranteeType = 'user' | 'role' | 'board' | 'committee' | 'meeting';

export interface DocumentPermissionRow {
  id: string;
  documentId: string;
  
  // Who gets this permission
  granteeType: PermissionGranteeType;
  granteeId: string;
  
  // Permissions
  canView: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canShare: boolean;
  canPresent: boolean;  // For meeting execution - can cast to screen
  
  // Time-bound access
  expiresAt: string | null;
  
  // Metadata
  grantedBy: number;
  grantedByName: string;
  grantedAt: string;
}

// ============================================================================
// DOCUMENT PERMISSIONS TABLE DATA
// ============================================================================

export const documentPermissionsTable: DocumentPermissionRow[] = [
  // Board Pack Q1 2026 - Meeting-level permission for presentation
  {
    id: 'perm-001',
    documentId: 'doc-mtg001-001',
    granteeType: 'meeting',
    granteeId: 'mtg-001',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: true,
    expiresAt: null,
    grantedBy: 17,
    grantedByName: 'Kenneth Muhia',
    grantedAt: '2026-01-15T09:00:00Z',
  },

  // Budget Presentation - Presentable during meeting
  {
    id: 'perm-002',
    documentId: 'doc-mtg001-004',
    granteeType: 'meeting',
    granteeId: 'mtg-001',
    canView: true,
    canDownload: true,
    canPrint: false,
    canShare: false,
    canPresent: true,
    expiresAt: null,
    grantedBy: 20,
    grantedByName: 'Brian Mochama',
    grantedAt: '2026-01-16T11:00:00Z',
  },

  // Financial Report - Board members can view and download
  {
    id: 'perm-003',
    documentId: 'doc-mtg001-003',
    granteeType: 'role',
    granteeId: 'board_member',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: 20,
    grantedByName: 'Brian Mochama',
    grantedAt: '2026-01-12T14:30:00Z',
  },

  // Confidential Resolution - Chairman only
  {
    id: 'perm-004',
    documentId: 'doc-mtg001-005',
    granteeType: 'user',
    granteeId: '1',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: 17,
    grantedByName: 'Kenneth Muhia',
    grantedAt: '2026-01-13T16:00:00Z',
  },
  {
    id: 'perm-005',
    documentId: 'doc-mtg001-005',
    granteeType: 'user',
    granteeId: '17',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: 17,
    grantedByName: 'Kenneth Muhia',
    grantedAt: '2026-01-13T16:00:00Z',
  },

  // Audit Report - Audit Committee members
  {
    id: 'perm-006',
    documentId: 'doc-mtg004-001',
    granteeType: 'committee',
    granteeId: 'audit-committee',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: true,
    expiresAt: null,
    grantedBy: 21,
    grantedByName: 'Winfred Kabuuri',
    grantedAt: '2026-01-08T14:00:00Z',
  },

  // Board Governance Charter - All board members
  {
    id: 'perm-007',
    documentId: 'doc-board-policy-001',
    granteeType: 'board',
    granteeId: 'greenland-fedha',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: 1,
    grantedByName: 'Hon. Chege Kirundi',
    grantedAt: '2024-06-15T10:00:00Z',
  },

  // Code of Conduct - All board members
  {
    id: 'perm-008',
    documentId: 'doc-board-policy-002',
    granteeType: 'board',
    granteeId: 'greenland-fedha',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: 17,
    grantedByName: 'Kenneth Muhia',
    grantedAt: '2024-08-20T14:00:00Z',
  },

  // Time-limited access - External auditor access to audit report
  {
    id: 'perm-009',
    documentId: 'doc-mtg004-001',
    granteeType: 'user',
    granteeId: '99',  // External auditor user ID
    canView: true,
    canDownload: false,
    canPrint: false,
    canShare: false,
    canPresent: false,
    expiresAt: '2026-02-28T23:59:59Z',
    grantedBy: 21,
    grantedByName: 'Winfred Kabuuri',
    grantedAt: '2026-01-10T10:00:00Z',
  },

  // Sales Presentation - Presentable during Q4 meeting
  {
    id: 'perm-010',
    documentId: 'doc-mtg008-004',
    granteeType: 'meeting',
    granteeId: 'mtg-008',
    canView: true,
    canDownload: true,
    canPrint: false,
    canShare: false,
    canPresent: true,
    expiresAt: null,
    grantedBy: 20,
    grantedByName: 'Brian Mochama',
    grantedAt: '2025-01-15T14:00:00Z',
  },

  // Loan Portfolio Analysis - Confidential (Greenland Fedha)
  // Only Finance Director and Chairman can access
  {
    id: 'perm-011',
    documentId: 'doc-gf-002',
    granteeType: 'user',
    granteeId: '20', // Brian Mochama - Finance Director (uploader)
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: 20,
    grantedByName: 'Brian Mochama',
    grantedAt: '2025-12-15T14:00:00Z',
  },
  {
    id: 'perm-012',
    documentId: 'doc-gf-002',
    granteeType: 'role',
    granteeId: 'chairman',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: true,
    canPresent: false,
    expiresAt: null,
    grantedBy: 20,
    grantedByName: 'Brian Mochama',
    grantedAt: '2025-12-15T14:00:00Z',
  },
  {
    id: 'perm-013',
    documentId: 'doc-gf-002',
    granteeType: 'role',
    granteeId: 'secretary',
    canView: true,
    canDownload: true,
    canPrint: false,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: 20,
    grantedByName: 'Brian Mochama',
    grantedAt: '2025-12-15T14:00:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get permissions for a document
 */
export const getDocumentPermissions = (documentId: string): DocumentPermissionRow[] => {
  return documentPermissionsTable.filter(p => p.documentId === documentId);
};

/**
 * Get permissions for a specific grantee
 */
export const getGranteePermissions = (
  granteeType: PermissionGranteeType,
  granteeId: string
): DocumentPermissionRow[] => {
  return documentPermissionsTable.filter(
    p => p.granteeType === granteeType && p.granteeId === granteeId
  );
};

/**
 * Check if user can present document in meeting
 */
export const canPresentInMeeting = (documentId: string, meetingId: string): boolean => {
  return documentPermissionsTable.some(
    p => p.documentId === documentId &&
         p.granteeType === 'meeting' &&
         p.granteeId === meetingId &&
         p.canPresent
  );
};

/**
 * Get presentable documents for a meeting
 */
export const getPresentableDocuments = (meetingId: string): string[] => {
  return documentPermissionsTable
    .filter(p => p.granteeType === 'meeting' && p.granteeId === meetingId && p.canPresent)
    .map(p => p.documentId);
};

/**
 * Check if permission is expired
 */
export const isPermissionExpired = (permission: DocumentPermissionRow): boolean => {
  if (!permission.expiresAt) return false;
  return new Date(permission.expiresAt) < new Date();
};

/**
 * Get active (non-expired) permissions for a document
 */
export const getActiveDocumentPermissions = (documentId: string): DocumentPermissionRow[] => {
  return documentPermissionsTable.filter(
    p => p.documentId === documentId && !isPermissionExpired(p)
  );
};
