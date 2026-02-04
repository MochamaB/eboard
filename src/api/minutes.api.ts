/**
 * Minutes API Client
 * API functions for meeting minutes management
 */

import type {
  Minutes,
  MinutesComment,
  MinutesSignature,
  CreateMinutesPayload,
  UpdateMinutesPayload,
  SubmitMinutesPayload,
  ApproveMinutesPayload,
  RequestRevisionPayload,
  PublishMinutesPayload,
  AddCommentPayload,
  ResolveCommentPayload,
  AddSignaturePayload,
  MinutesFilters,
} from '../types/minutes.types';

const API_BASE = '/api';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

// ============================================================================
// MINUTES ENDPOINTS
// ============================================================================

/**
 * Get minutes for a meeting
 */
export async function getMinutesByMeetingId(meetingId: string): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/minutes`);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Minutes not found');
  }

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch minutes');
  }

  return result.data!;
}

/**
 * Get minutes by ID
 */
export async function getMinutesById(minutesId: string): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}`);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Minutes not found');
  }

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch minutes');
  }

  return result.data!;
}

/**
 * Get all minutes with optional filters
 */
export async function getAllMinutes(filters?: MinutesFilters): Promise<Minutes[]> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.boardId) params.append('boardId', filters.boardId);
  if (filters?.createdBy) params.append('createdBy', filters.createdBy.toString());

  const url = `${API_BASE}/minutes${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<Minutes[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch minutes');
  }

  return result.data!;
}

/**
 * Get minutes pending approval
 */
export async function getMinutesPendingApproval(): Promise<Minutes[]> {
  const response = await fetch(`${API_BASE}/minutes/pending-approval`);

  const result: ApiResponse<Minutes[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch pending minutes');
  }

  return result.data!;
}

/**
 * Create new minutes for a meeting
 */
export async function createMinutes(payload: CreateMinutesPayload): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/meetings/${payload.meetingId}/minutes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create minutes');
  }

  return result.data!;
}

/**
 * Update minutes content
 */
export async function updateMinutes(
  minutesId: string,
  payload: UpdateMinutesPayload
): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update minutes');
  }

  return result.data!;
}

/**
 * Submit minutes for review
 */
export async function submitMinutesForReview(
  minutesId: string,
  payload: SubmitMinutesPayload
): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to submit minutes');
  }

  return result.data!;
}

/**
 * Approve minutes
 */
export async function approveMinutes(
  minutesId: string,
  payload: ApproveMinutesPayload
): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to approve minutes');
  }

  return result.data!;
}

/**
 * Request revision on minutes
 */
export async function requestMinutesRevision(
  minutesId: string,
  payload: RequestRevisionPayload
): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/request-revision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to request revision');
  }

  return result.data!;
}

/**
 * Publish approved minutes
 */
export async function publishMinutes(
  minutesId: string,
  payload: PublishMinutesPayload
): Promise<Minutes> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Minutes> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to publish minutes');
  }

  return result.data!;
}

/**
 * Delete minutes
 */
export async function deleteMinutes(minutesId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete minutes');
  }
}

// ============================================================================
// COMMENTS ENDPOINTS
// ============================================================================

/**
 * Get all comments for minutes
 */
export async function getCommentsByMinutesId(minutesId: string): Promise<MinutesComment[]> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/comments`);

  const result: ApiResponse<MinutesComment[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch comments');
  }

  return result.data!;
}

/**
 * Add comment to minutes
 */
export async function addComment(
  minutesId: string,
  payload: AddCommentPayload
): Promise<MinutesComment> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<MinutesComment> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add comment');
  }

  return result.data!;
}

/**
 * Resolve a comment
 */
export async function resolveComment(
  commentId: string,
  payload: ResolveCommentPayload
): Promise<MinutesComment> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/resolve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<MinutesComment> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to resolve comment');
  }

  return result.data!;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete comment');
  }
}

// ============================================================================
// SIGNATURES ENDPOINTS
// ============================================================================

/**
 * Get all signatures for minutes
 */
export async function getSignaturesByMinutesId(minutesId: string): Promise<MinutesSignature[]> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/signatures`);

  const result: ApiResponse<MinutesSignature[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch signatures');
  }

  return result.data!;
}

/**
 * Add signature to minutes
 */
export async function addSignature(
  minutesId: string,
  payload: AddSignaturePayload
): Promise<MinutesSignature> {
  const response = await fetch(`${API_BASE}/minutes/${minutesId}/signatures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<MinutesSignature> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add signature');
  }

  return result.data!;
}
