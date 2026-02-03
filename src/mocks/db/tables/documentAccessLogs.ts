/**
 * Document Access Logs Table - Access Tracking
 * Tracks document views, downloads, prints, and shares
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DocumentAccessAction = 'view' | 'download' | 'print' | 'share';

export interface DocumentAccessLogRow {
  id: string;
  documentId: string;
  userId: number;
  userName: string;
  action: DocumentAccessAction;
  ipAddress: string | null;
  userAgent: string | null;
  accessedAt: string;
}

// ============================================================================
// DOCUMENT ACCESS LOGS TABLE DATA
// ============================================================================

export const documentAccessLogsTable: DocumentAccessLogRow[] = [
  // Board Pack Q1 2026 - Multiple views and downloads
  {
    id: 'log-001',
    documentId: 'doc-mtg001-001',
    userId: 1,
    userName: 'Hon. Chege Kirundi',
    action: 'view',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'log-002',
    documentId: 'doc-mtg001-001',
    userId: 1,
    userName: 'Hon. Chege Kirundi',
    action: 'download',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-15T10:05:00Z',
  },
  {
    id: 'log-003',
    documentId: 'doc-mtg001-001',
    userId: 17,
    userName: 'Kenneth Muhia',
    action: 'view',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    accessedAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'log-004',
    documentId: 'doc-mtg001-001',
    userId: 20,
    userName: 'Brian Mochama',
    action: 'view',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'log-005',
    documentId: 'doc-mtg001-001',
    userId: 20,
    userName: 'Brian Mochama',
    action: 'download',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-15T11:02:00Z',
  },

  // Financial Report - Views
  {
    id: 'log-006',
    documentId: 'doc-mtg001-003',
    userId: 1,
    userName: 'Hon. Chege Kirundi',
    action: 'view',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-14T14:00:00Z',
  },
  {
    id: 'log-007',
    documentId: 'doc-mtg001-003',
    userId: 18,
    userName: 'Isaac Chege',
    action: 'view',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-14T15:00:00Z',
  },
  {
    id: 'log-008',
    documentId: 'doc-mtg001-003',
    userId: 18,
    userName: 'Isaac Chege',
    action: 'download',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-14T15:05:00Z',
  },

  // Audit Report - Views and prints
  {
    id: 'log-009',
    documentId: 'doc-mtg004-001',
    userId: 21,
    userName: 'Winfred Kabuuri',
    action: 'view',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    accessedAt: '2026-01-08T14:30:00Z',
  },
  {
    id: 'log-010',
    documentId: 'doc-mtg004-001',
    userId: 21,
    userName: 'Winfred Kabuuri',
    action: 'print',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    accessedAt: '2026-01-08T14:35:00Z',
  },
  {
    id: 'log-011',
    documentId: 'doc-mtg004-001',
    userId: 1,
    userName: 'Hon. Chege Kirundi',
    action: 'view',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-09T09:00:00Z',
  },

  // Board Governance Charter - Views
  {
    id: 'log-012',
    documentId: 'doc-board-policy-001',
    userId: 17,
    userName: 'Kenneth Muhia',
    action: 'view',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    accessedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'log-013',
    documentId: 'doc-board-policy-001',
    userId: 20,
    userName: 'Brian Mochama',
    action: 'view',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-11T11:00:00Z',
  },

  // Document shared
  {
    id: 'log-014',
    documentId: 'doc-mtg001-004',
    userId: 20,
    userName: 'Brian Mochama',
    action: 'share',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    accessedAt: '2026-01-16T12:00:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get access logs for a document
 */
export const getDocumentAccessLogs = (documentId: string): DocumentAccessLogRow[] => {
  return documentAccessLogsTable
    .filter(log => log.documentId === documentId)
    .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime());
};

/**
 * Get view count for a document
 */
export const getDocumentViewCount = (documentId: string): number => {
  return documentAccessLogsTable.filter(
    log => log.documentId === documentId && log.action === 'view'
  ).length;
};

/**
 * Get download count for a document
 */
export const getDocumentDownloadCount = (documentId: string): number => {
  return documentAccessLogsTable.filter(
    log => log.documentId === documentId && log.action === 'download'
  ).length;
};

/**
 * Get access logs by user
 */
export const getUserAccessLogs = (userId: number): DocumentAccessLogRow[] => {
  return documentAccessLogsTable
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime());
};

/**
 * Log document access (for mutations)
 */
export const logDocumentAccess = (
  documentId: string,
  userId: number,
  userName: string,
  action: DocumentAccessAction,
  ipAddress?: string,
  userAgent?: string
): DocumentAccessLogRow => {
  const log: DocumentAccessLogRow = {
    id: `log-${Date.now()}`,
    documentId,
    userId,
    userName,
    action,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    accessedAt: new Date().toISOString(),
  };
  documentAccessLogsTable.push(log);
  return log;
};
