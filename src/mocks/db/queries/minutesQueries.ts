/**
 * Minutes Query Helpers
 * Helper functions for querying minutes-related data
 */

import { minutesTable } from '../tables/minutes';
import type { MinutesRow, MinutesStatus } from '../tables/minutes';
import { minutesCommentsTable } from '../tables/minutesComments';
import type { MinutesCommentRow } from '../tables/minutesComments';
import { minutesSignaturesTable } from '../tables/minutesSignatures';
import type { MinutesSignatureRow } from '../tables/minutesSignatures';
import { actionItemsTable } from '../tables/actionItems';
import type { ActionItemRow } from '../tables/actionItems';
import { resolutionsTable } from '../tables/resolutions';
import type { ResolutionRow } from '../tables/resolutions';
import { idsMatch } from '../utils/idUtils';

// ============================================================================
// MINUTES QUERIES
// ============================================================================

/**
 * Get minutes by meeting ID
 */
export function getMinutesByMeetingId(meetingId: string): MinutesRow | null {
  return minutesTable.find(m => idsMatch(m.meetingId, meetingId)) || null;
}

/**
 * Get minutes by ID
 */
export function getMinutesById(minutesId: string): MinutesRow | null {
  return minutesTable.find(m => idsMatch(m.id, minutesId)) || null;
}

/**
 * Get all minutes (with optional filters)
 */
export function getAllMinutes(filters?: {
  status?: MinutesStatus;
  boardId?: string;
  createdBy?: number;
}): MinutesRow[] {
  let results = [...minutesTable];

  if (filters?.status) {
    results = results.filter(m => m.status === filters.status);
  }

  if (filters?.createdBy) {
    results = results.filter(m => m.createdBy === filters.createdBy);
  }

  // Sort by created date (newest first)
  return results.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get minutes pending approval (for Chairman)
 */
export function getMinutesPendingApproval(): MinutesRow[] {
  return minutesTable.filter(m => m.status === 'pending_review');
}

/**
 * Create new minutes
 */
export function createMinutes(data: {
  meetingId: string;
  content?: string;
  templateId?: string;
  createdBy: number;
}): MinutesRow {
  const now = new Date().toISOString();
  const newMinutes: MinutesRow = {
    id: `minutes-${data.meetingId}-${Date.now()}`,
    meetingId: data.meetingId,
    content: data.content || '',
    contentPlainText: '',
    templateId: data.templateId || null,
    status: 'draft',
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    submittedBy: null,
    approvedAt: null,
    approvedBy: null,
    approvalNotes: null,
    revisionRequestedAt: null,
    revisionRequestedBy: null,
    revisionReason: null,
    publishedAt: null,
    publishedBy: null,
    version: 1,
    pdfUrl: null,
    allowComments: true,
    reviewDeadline: null,
    wordCount: 0,
    estimatedReadTime: 0,
  };

  minutesTable.push(newMinutes);
  return newMinutes;
}

/**
 * Update minutes content
 */
export function updateMinutes(
  minutesId: string,
  data: {
    content?: string;
    contentPlainText?: string;
    wordCount?: number;
  }
): MinutesRow | null {
  const index = minutesTable.findIndex(m => idsMatch(m.id, minutesId));
  if (index === -1) return null;

  const minutes = minutesTable[index];
  
  minutesTable[index] = {
    ...minutes,
    content: data.content !== undefined ? data.content : minutes.content,
    contentPlainText: data.contentPlainText !== undefined ? data.contentPlainText : minutes.contentPlainText,
    wordCount: data.wordCount !== undefined ? data.wordCount : minutes.wordCount,
    estimatedReadTime: data.wordCount ? Math.ceil(data.wordCount / 250) : minutes.estimatedReadTime,
    updatedAt: new Date().toISOString(),
  };

  return minutesTable[index];
}

/**
 * Submit minutes for review
 */
export function submitMinutesForReview(
  minutesId: string,
  submittedBy: number,
  reviewDeadline?: string
): MinutesRow | null {
  const index = minutesTable.findIndex(m => idsMatch(m.id, minutesId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  minutesTable[index] = {
    ...minutesTable[index],
    status: 'pending_review',
    submittedAt: now,
    submittedBy,
    reviewDeadline: reviewDeadline || null,
    updatedAt: now,
  };

  return minutesTable[index];
}

/**
 * Approve minutes
 */
export function approveMinutes(
  minutesId: string,
  approvedBy: number,
  approvalNotes?: string
): MinutesRow | null {
  const index = minutesTable.findIndex(m => idsMatch(m.id, minutesId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  minutesTable[index] = {
    ...minutesTable[index],
    status: 'approved',
    approvedAt: now,
    approvedBy,
    approvalNotes: approvalNotes || null,
    allowComments: false,
    updatedAt: now,
  };

  return minutesTable[index];
}

/**
 * Request revision
 */
export function requestMinutesRevision(
  minutesId: string,
  requestedBy: number,
  revisionReason: string
): MinutesRow | null {
  const index = minutesTable.findIndex(m => idsMatch(m.id, minutesId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  minutesTable[index] = {
    ...minutesTable[index],
    status: 'revision_requested',
    revisionRequestedAt: now,
    revisionRequestedBy: requestedBy,
    revisionReason,
    updatedAt: now,
  };

  return minutesTable[index];
}

/**
 * Publish minutes
 */
export function publishMinutes(
  minutesId: string,
  publishedBy: number,
  pdfUrl?: string
): MinutesRow | null {
  const index = minutesTable.findIndex(m => idsMatch(m.id, minutesId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  minutesTable[index] = {
    ...minutesTable[index],
    status: 'published',
    publishedAt: now,
    publishedBy,
    pdfUrl: pdfUrl || `/mock-documents/minutes-${minutesId}.pdf`,
    allowComments: false,
    updatedAt: now,
  };

  return minutesTable[index];
}

/**
 * Delete minutes
 */
export function deleteMinutes(minutesId: string): boolean {
  const index = minutesTable.findIndex(m => idsMatch(m.id, minutesId));
  if (index === -1) return false;

  minutesTable.splice(index, 1);
  return true;
}

// ============================================================================
// COMMENTS QUERIES
// ============================================================================

/**
 * Get comments by minutes ID
 */
export function getCommentsByMinutesId(minutesId: string): MinutesCommentRow[] {
  return minutesCommentsTable
    .filter(c => idsMatch(c.minutesId, minutesId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get comment by ID
 */
export function getCommentById(commentId: string): MinutesCommentRow | null {
  return minutesCommentsTable.find(c => idsMatch(c.id, commentId)) || null;
}

/**
 * Add comment
 */
export function addComment(data: {
  minutesId: string;
  comment: string;
  commentType?: 'general' | 'section' | 'highlight';
  sectionReference?: string;
  highlightedText?: string;
  textPosition?: { start: number; end: number };
  createdBy: number;
  parentCommentId?: string;
}): MinutesCommentRow {
  const now = new Date().toISOString();
  const newComment: MinutesCommentRow = {
    id: `comment-${data.minutesId}-${Date.now()}`,
    minutesId: data.minutesId,
    comment: data.comment,
    commentType: data.commentType || 'general',
    sectionReference: data.sectionReference || null,
    highlightedText: data.highlightedText || null,
    textPosition: data.textPosition || null,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: null,
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
    parentCommentId: data.parentCommentId || null,
    secretaryResponse: null,
    respondedAt: null,
    respondedBy: null,
  };

  minutesCommentsTable.push(newComment);
  return newComment;
}

/**
 * Resolve comment
 */
export function resolveComment(
  commentId: string,
  resolvedBy: number,
  secretaryResponse?: string
): MinutesCommentRow | null {
  const index = minutesCommentsTable.findIndex(c => idsMatch(c.id, commentId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  minutesCommentsTable[index] = {
    ...minutesCommentsTable[index],
    resolved: true,
    resolvedAt: now,
    resolvedBy,
    secretaryResponse: secretaryResponse || null,
    respondedAt: secretaryResponse ? now : null,
    respondedBy: secretaryResponse ? resolvedBy : null,
    updatedAt: now,
  };

  return minutesCommentsTable[index];
}

/**
 * Delete comment
 */
export function deleteComment(commentId: string): boolean {
  const index = minutesCommentsTable.findIndex(c => idsMatch(c.id, commentId));
  if (index === -1) return false;

  minutesCommentsTable.splice(index, 1);
  return true;
}

// ============================================================================
// SIGNATURES QUERIES
// ============================================================================

/**
 * Get signatures by minutes ID
 */
export function getSignaturesByMinutesId(minutesId: string): MinutesSignatureRow[] {
  return minutesSignaturesTable
    .filter(s => idsMatch(s.minutesId, minutesId))
    .sort((a, b) => new Date(a.signedAt).getTime() - new Date(b.signedAt).getTime());
}

/**
 * Add signature
 */
export function addSignature(data: {
  minutesId: string;
  signedBy: number;
  signerRole: string;
  signerName: string;
  signatureHash: string;
  signatureMethod?: 'digital' | 'biometric' | 'pin';
  certificateId?: string;
  signatureData?: string;
}): MinutesSignatureRow {
  const now = new Date().toISOString();
  const newSignature: MinutesSignatureRow = {
    id: `sig-minutes-${data.minutesId}-${Date.now()}`,
    minutesId: data.minutesId,
    signedBy: data.signedBy,
    signerRole: data.signerRole,
    signerName: data.signerName,
    signatureHash: data.signatureHash,
    signatureMethod: data.signatureMethod || 'digital',
    certificateId: data.certificateId || null,
    verified: true,
    verificationDate: now,
    signedAt: now,
    signatureData: null,
  };

  minutesSignaturesTable.push(newSignature);
  return newSignature;
}

/**
 * Check if minutes has required signatures
 */
export function hasRequiredSignatures(minutesId: string): boolean {
  const signatures = getSignaturesByMinutesId(minutesId);
  
  // Require at least Chairman and Secretary signatures
  const hasChairmanSignature = signatures.some(s => 
    s.signerRole.toLowerCase().includes('chairman') || 
    s.signerRole.toLowerCase().includes('chair')
  );
  const hasSecretarySignature = signatures.some(s => 
    s.signerRole.toLowerCase().includes('secretary')
  );

  return hasChairmanSignature && hasSecretarySignature;
}

// ============================================================================
// ACTION ITEMS QUERIES
// ============================================================================

/**
 * Get action items by minutes ID
 */
export function getActionItemsByMinutesId(minutesId: string): ActionItemRow[] {
  return actionItemsTable
    .filter(item => item.source === 'minutes' && item.sourceId && idsMatch(item.sourceId, minutesId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get action items by meeting ID
 */
export function getActionItemsByMeetingId(meetingId: string): ActionItemRow[] {
  return actionItemsTable
    .filter(item => idsMatch(item.meetingId, meetingId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ============================================================================
// RESOLUTIONS QUERIES
// ============================================================================

/**
 * Get resolutions by meeting ID
 */
export function getResolutionsByMeetingId(meetingId: string): ResolutionRow[] {
  return resolutionsTable
    .filter(res => idsMatch(res.meetingId, meetingId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ============================================================================
// COMBINED QUERIES
// ============================================================================

/**
 * Get minutes with all related data (complete details)
 */
export function getMinutesWithDetails(minutesId: string) {
  const minutes = getMinutesById(minutesId);
  if (!minutes) return null;

  return {
    ...minutes,
    comments: getCommentsByMinutesId(minutesId),
    signatures: getSignaturesByMinutesId(minutesId),
    actionItems: getActionItemsByMinutesId(minutesId),
    resolutions: getResolutionsByMeetingId(minutes.meetingId),
  };
}

/**
 * Get meeting minutes summary (for meeting detail view)
 */
export function getMeetingMinutesSummary(meetingId: string) {
  const minutes = getMinutesByMeetingId(meetingId);
  if (!minutes) return null;

  return {
    minutes,
    actionItems: getActionItemsByMeetingId(meetingId),
    resolutions: getResolutionsByMeetingId(meetingId),
    hasSignatures: getSignaturesByMinutesId(minutes.id).length > 0,
    hasRequiredSignatures: hasRequiredSignatures(minutes.id),
    commentCount: getCommentsByMinutesId(minutes.id).length,
    unresolvedCommentCount: getCommentsByMinutesId(minutes.id).filter(c => !c.resolved).length,
  };
}
