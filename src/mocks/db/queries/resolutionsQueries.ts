/**
 * Resolutions Query Helpers
 * Helper functions for querying resolutions data
 */

import { resolutionsTable } from '../tables/resolutions';
import type {
  ResolutionRow,
  ResolutionDecision,
  ResolutionCategory,
  ImplementationStatus,
} from '../tables/resolutions';

// ============================================================================
// RESOLUTIONS QUERIES
// ============================================================================

/**
 * Get resolution by ID
 */
export function getResolutionById(resolutionId: string): ResolutionRow | null {
  return resolutionsTable.find(r => r.id === resolutionId) || null;
}

/**
 * Get resolutions by meeting ID
 */
export function getResolutionsByMeetingId(meetingId: string): ResolutionRow[] {
  return resolutionsTable
    .filter(r => r.meetingId === meetingId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get resolutions by board ID
 */
export function getResolutionsByBoardId(boardId: string): ResolutionRow[] {
  return resolutionsTable
    .filter(r => r.boardId === boardId)
    .sort((a, b) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());
}

/**
 * Get all resolutions with filters
 */
export function getAllResolutions(filters?: {
  meetingId?: string;
  boardId?: string;
  decision?: ResolutionDecision;
  category?: ResolutionCategory;
  requiresFollowUp?: boolean;
  implementationStatus?: ImplementationStatus;
  dateFrom?: string;
  dateTo?: string;
}): ResolutionRow[] {
  let results = [...resolutionsTable];

  if (filters?.meetingId) {
    results = results.filter(r => r.meetingId === filters.meetingId);
  }

  if (filters?.boardId) {
    results = results.filter(r => r.boardId === filters.boardId);
  }

  if (filters?.decision) {
    results = results.filter(r => r.decision === filters.decision);
  }

  if (filters?.category) {
    results = results.filter(r => r.category === filters.category);
  }

  if (filters?.requiresFollowUp !== undefined) {
    results = results.filter(r => r.requiresFollowUp === filters.requiresFollowUp);
  }

  if (filters?.implementationStatus) {
    results = results.filter(r => r.implementationStatus === filters.implementationStatus);
  }

  if (filters?.dateFrom) {
    results = results.filter(r => r.decisionDate >= filters.dateFrom!);
  }

  if (filters?.dateTo) {
    results = results.filter(r => r.decisionDate <= filters.dateTo!);
  }

  return results.sort((a, b) => 
    new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime()
  );
}

/**
 * Get resolutions requiring follow-up
 */
export function getResolutionsRequiringFollowUp(boardId?: string): ResolutionRow[] {
  let results = resolutionsTable.filter(r => 
    r.requiresFollowUp && 
    r.implementationStatus !== 'completed' &&
    r.implementationStatus !== 'cancelled'
  );

  if (boardId) {
    results = results.filter(r => r.boardId === boardId);
  }

  return results.sort((a, b) => {
    if (!a.followUpDeadline) return 1;
    if (!b.followUpDeadline) return -1;
    return new Date(a.followUpDeadline).getTime() - new Date(b.followUpDeadline).getTime();
  });
}

/**
 * Get overdue resolutions (past follow-up deadline)
 */
export function getOverdueResolutions(boardId?: string): ResolutionRow[] {
  const now = new Date();
  let results = resolutionsTable.filter(r => {
    if (!r.requiresFollowUp || !r.followUpDeadline) return false;
    if (r.implementationStatus === 'completed' || r.implementationStatus === 'cancelled') return false;
    return new Date(r.followUpDeadline) < now;
  });

  if (boardId) {
    results = results.filter(r => r.boardId === boardId);
  }

  return results.sort((a, b) => 
    new Date(a.followUpDeadline!).getTime() - new Date(b.followUpDeadline!).getTime()
  );
}

/**
 * Create resolution
 */
export function createResolution(data: {
  meetingId: string;
  boardId: string;
  resolutionNumber: string;
  title: string;
  text: string;
  category?: ResolutionCategory;
  decision: ResolutionDecision;
  decisionDate: string;
  voteId?: string;
  voteSummary?: string;
  agendaItemId?: string;
  relatedDocumentIds?: string[];
  requiresFollowUp?: boolean;
  followUpDeadline?: string;
  followUpNotes?: string;
  createdBy: number;
}): ResolutionRow {
  const now = new Date().toISOString();
  const newResolution: ResolutionRow = {
    id: `res-${data.meetingId}-${Date.now()}`,
    meetingId: data.meetingId,
    boardId: data.boardId,
    resolutionNumber: data.resolutionNumber,
    title: data.title,
    text: data.text,
    category: data.category || 'other',
    decision: data.decision,
    decisionDate: data.decisionDate,
    voteId: data.voteId || null,
    voteSummary: data.voteSummary || null,
    agendaItemId: data.agendaItemId || null,
    relatedDocumentIds: JSON.stringify(data.relatedDocumentIds || []),
    requiresFollowUp: data.requiresFollowUp || false,
    followUpDeadline: data.followUpDeadline || null,
    followUpNotes: data.followUpNotes || null,
    implementationStatus: 'pending',
    implementedAt: null,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  resolutionsTable.push(newResolution);
  return newResolution;
}

/**
 * Update resolution
 */
export function updateResolution(
  resolutionId: string,
  data: {
    title?: string;
    text?: string;
    category?: ResolutionCategory;
    decision?: ResolutionDecision;
    voteSummary?: string;
    relatedDocumentIds?: string[];
    requiresFollowUp?: boolean;
    followUpDeadline?: string;
    followUpNotes?: string;
  }
): ResolutionRow | null {
  const index = resolutionsTable.findIndex(r => r.id === resolutionId);
  if (index === -1) return null;

  const resolution = resolutionsTable[index];
  
  resolutionsTable[index] = {
    ...resolution,
    title: data.title !== undefined ? data.title : resolution.title,
    text: data.text !== undefined ? data.text : resolution.text,
    category: data.category !== undefined ? data.category : resolution.category,
    decision: data.decision !== undefined ? data.decision : resolution.decision,
    voteSummary: data.voteSummary !== undefined ? data.voteSummary : resolution.voteSummary,
    relatedDocumentIds: data.relatedDocumentIds !== undefined 
      ? JSON.stringify(data.relatedDocumentIds) 
      : resolution.relatedDocumentIds,
    requiresFollowUp: data.requiresFollowUp !== undefined ? data.requiresFollowUp : resolution.requiresFollowUp,
    followUpDeadline: data.followUpDeadline !== undefined ? data.followUpDeadline : resolution.followUpDeadline,
    followUpNotes: data.followUpNotes !== undefined ? data.followUpNotes : resolution.followUpNotes,
    updatedAt: new Date().toISOString(),
  };

  return resolutionsTable[index];
}

/**
 * Update implementation status
 */
export function updateImplementationStatus(
  resolutionId: string,
  implementationStatus: ImplementationStatus,
  implementedAt?: string
): ResolutionRow | null {
  const index = resolutionsTable.findIndex(r => r.id === resolutionId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  resolutionsTable[index] = {
    ...resolutionsTable[index],
    implementationStatus,
    implementedAt: implementationStatus === 'completed' ? (implementedAt || now) : null,
    updatedAt: now,
  };

  return resolutionsTable[index];
}

/**
 * Delete resolution
 */
export function deleteResolution(resolutionId: string): boolean {
  const index = resolutionsTable.findIndex(r => r.id === resolutionId);
  if (index === -1) return false;

  resolutionsTable.splice(index, 1);
  return true;
}

/**
 * Generate resolution number
 */
export function generateResolutionNumber(boardId: string, year?: number): string {
  const resYear = year || new Date().getFullYear();
  const boardPrefix = boardId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  
  // Find existing resolutions for this board and year
  const existingResolutions = resolutionsTable.filter(r => 
    r.boardId === boardId && 
    r.resolutionNumber.includes(`-${resYear}-`)
  );
  
  const nextSequence = existingResolutions.length + 1;
  return `RES-${boardPrefix}-${resYear}-${String(nextSequence).padStart(3, '0')}`;
}

/**
 * Get resolutions statistics for a board
 */
export function getResolutionsStats(boardId: string): {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  requiresFollowUp: number;
  overdue: number;
} {
  const boardResolutions = getResolutionsByBoardId(boardId);
  const now = new Date();

  return {
    total: boardResolutions.length,
    approved: boardResolutions.filter(r => r.decision === 'approved').length,
    rejected: boardResolutions.filter(r => r.decision === 'rejected').length,
    pending: boardResolutions.filter(r => 
      r.implementationStatus === 'pending' || r.implementationStatus === 'in_progress'
    ).length,
    requiresFollowUp: boardResolutions.filter(r => 
      r.requiresFollowUp && 
      r.implementationStatus !== 'completed' &&
      r.implementationStatus !== 'cancelled'
    ).length,
    overdue: boardResolutions.filter(r => {
      if (!r.requiresFollowUp || !r.followUpDeadline) return false;
      if (r.implementationStatus === 'completed' || r.implementationStatus === 'cancelled') return false;
      return new Date(r.followUpDeadline) < now;
    }).length,
  };
}
