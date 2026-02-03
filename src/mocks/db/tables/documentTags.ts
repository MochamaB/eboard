/**
 * Document Tags Table - Tags & Assignments
 * Manages document tags and their assignments to documents
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DocumentTagRow {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  boardId: string | null;  // null = system-wide tag
  isSystem: boolean;
  createdAt: string;
  createdBy: number | null;
}

export interface DocumentTagAssignmentRow {
  id: string;
  documentId: string;
  tagId: string;
  assignedBy: number;
  assignedAt: string;
}

// ============================================================================
// DOCUMENT TAGS TABLE DATA
// ============================================================================

export const documentTagsTable: DocumentTagRow[] = [
  // System-wide tags
  {
    id: 'tag-001',
    name: 'Confidential',
    slug: 'confidential',
    color: '#dc2626',
    description: 'Confidential documents with restricted access',
    boardId: null,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: null,
  },
  {
    id: 'tag-002',
    name: 'Draft',
    slug: 'draft',
    color: '#f59e0b',
    description: 'Documents still in draft status',
    boardId: null,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: null,
  },
  {
    id: 'tag-003',
    name: 'Final',
    slug: 'final',
    color: '#10b981',
    description: 'Finalized and approved documents',
    boardId: null,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: null,
  },
  {
    id: 'tag-004',
    name: 'Urgent',
    slug: 'urgent',
    color: '#ef4444',
    description: 'Documents requiring immediate attention',
    boardId: null,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: null,
  },
  {
    id: 'tag-005',
    name: 'For Review',
    slug: 'for-review',
    color: '#3b82f6',
    description: 'Documents pending review',
    boardId: null,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: null,
  },

  // Board-specific tags - Greenland Fedha
  {
    id: 'tag-006',
    name: 'Financial',
    slug: 'financial',
    color: '#059669',
    description: 'Financial reports and statements',
    boardId: 'greenland-fedha',
    isSystem: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 20,
  },
  {
    id: 'tag-007',
    name: 'Governance',
    slug: 'governance',
    color: '#7c3aed',
    description: 'Governance and policy documents',
    boardId: 'greenland-fedha',
    isSystem: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 17,
  },
  {
    id: 'tag-008',
    name: 'Audit',
    slug: 'audit',
    color: '#0891b2',
    description: 'Audit-related documents',
    boardId: 'greenland-fedha',
    isSystem: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 21,
  },
  {
    id: 'tag-009',
    name: 'Strategy',
    slug: 'strategy',
    color: '#6366f1',
    description: 'Strategic planning documents',
    boardId: 'greenland-fedha',
    isSystem: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 1,
  },
  {
    id: 'tag-010',
    name: 'HR',
    slug: 'hr',
    color: '#ec4899',
    description: 'Human resources documents',
    boardId: 'greenland-fedha',
    isSystem: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 17,
  },
];

// ============================================================================
// DOCUMENT TAG ASSIGNMENTS TABLE DATA
// ============================================================================

export const documentTagAssignmentsTable: DocumentTagAssignmentRow[] = [
  // Board Pack Q1 2026 - Final
  {
    id: 'assign-001',
    documentId: 'doc-mtg001-001',
    tagId: 'tag-003',
    assignedBy: 17,
    assignedAt: '2026-01-15T09:00:00Z',
  },

  // Financial Report - Financial, Final
  {
    id: 'assign-002',
    documentId: 'doc-mtg001-003',
    tagId: 'tag-006',
    assignedBy: 20,
    assignedAt: '2026-01-12T14:30:00Z',
  },
  {
    id: 'assign-003',
    documentId: 'doc-mtg001-003',
    tagId: 'tag-003',
    assignedBy: 20,
    assignedAt: '2026-01-12T14:30:00Z',
  },

  // Board Resolution - Confidential, Governance
  {
    id: 'assign-004',
    documentId: 'doc-mtg001-005',
    tagId: 'tag-001',
    assignedBy: 1,
    assignedAt: '2026-01-13T16:00:00Z',
  },
  {
    id: 'assign-005',
    documentId: 'doc-mtg001-005',
    tagId: 'tag-007',
    assignedBy: 17,
    assignedAt: '2026-01-13T16:00:00Z',
  },

  // Audit Report - Audit, For Review
  {
    id: 'assign-006',
    documentId: 'doc-mtg004-001',
    tagId: 'tag-008',
    assignedBy: 21,
    assignedAt: '2026-01-08T14:00:00Z',
  },
  {
    id: 'assign-007',
    documentId: 'doc-mtg004-001',
    tagId: 'tag-005',
    assignedBy: 21,
    assignedAt: '2026-01-08T14:00:00Z',
  },

  // Board Governance Charter - Governance, Final
  {
    id: 'assign-008',
    documentId: 'doc-board-policy-001',
    tagId: 'tag-007',
    assignedBy: 1,
    assignedAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 'assign-009',
    documentId: 'doc-board-policy-001',
    tagId: 'tag-003',
    assignedBy: 1,
    assignedAt: '2024-06-15T10:00:00Z',
  },

  // Code of Conduct - Governance, Final
  {
    id: 'assign-010',
    documentId: 'doc-board-policy-002',
    tagId: 'tag-007',
    assignedBy: 17,
    assignedAt: '2024-08-20T14:00:00Z',
  },
  {
    id: 'assign-011',
    documentId: 'doc-board-policy-002',
    tagId: 'tag-003',
    assignedBy: 17,
    assignedAt: '2024-08-20T14:00:00Z',
  },

  // Strategy Document - Strategy, Draft
  {
    id: 'assign-012',
    documentId: 'doc-mtg003-001',
    tagId: 'tag-009',
    assignedBy: 20,
    assignedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'assign-013',
    documentId: 'doc-mtg003-001',
    tagId: 'tag-002',
    assignedBy: 20,
    assignedAt: '2026-01-10T10:00:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all tags for a board (including system tags)
 */
export const getBoardTags = (boardId: string): DocumentTagRow[] => {
  return documentTagsTable.filter(
    tag => tag.boardId === boardId || tag.isSystem
  );
};

/**
 * Get system-wide tags only
 */
export const getSystemTags = (): DocumentTagRow[] => {
  return documentTagsTable.filter(tag => tag.isSystem);
};

/**
 * Get tags assigned to a document
 */
export const getDocumentTags = (documentId: string): DocumentTagRow[] => {
  const assignments = documentTagAssignmentsTable.filter(a => a.documentId === documentId);
  const tagIds = assignments.map(a => a.tagId);
  return documentTagsTable.filter(tag => tagIds.includes(tag.id));
};

/**
 * Get documents with a specific tag
 */
export const getDocumentsByTag = (tagId: string): string[] => {
  return documentTagAssignmentsTable
    .filter(a => a.tagId === tagId)
    .map(a => a.documentId);
};

/**
 * Get tag by slug
 */
export const getTagBySlug = (slug: string, boardId?: string): DocumentTagRow | undefined => {
  return documentTagsTable.find(
    tag => tag.slug === slug && (tag.boardId === boardId || tag.isSystem)
  );
};
