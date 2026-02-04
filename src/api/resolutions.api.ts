/**
 * Resolutions API Client
 * API functions for board resolutions management
 */

import type {
  Resolution,
  CreateResolutionPayload,
  UpdateResolutionPayload,
  UpdateImplementationStatusPayload,
  ResolutionFilters,
  ResolutionsStats,
} from '../types/resolutions.types';

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
// RESOLUTIONS ENDPOINTS
// ============================================================================

/**
 * Get resolution by ID
 */
export async function getResolutionById(resolutionId: string): Promise<Resolution> {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}`);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Resolution not found');
  }

  const result: ApiResponse<Resolution> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch resolution');
  }

  return result.data!;
}

/**
 * Get resolutions by meeting ID
 */
export async function getResolutionsByMeetingId(meetingId: string): Promise<Resolution[]> {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/resolutions`);

  const result: ApiResponse<Resolution[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch resolutions');
  }

  return result.data!;
}

/**
 * Get resolutions by board ID
 */
export async function getResolutionsByBoardId(boardId: string): Promise<Resolution[]> {
  const response = await fetch(`${API_BASE}/boards/${boardId}/resolutions`);

  const result: ApiResponse<Resolution[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch resolutions');
  }

  return result.data!;
}

/**
 * Get all resolutions with optional filters
 */
export async function getAllResolutions(filters?: ResolutionFilters): Promise<Resolution[]> {
  const params = new URLSearchParams();
  
  if (filters?.meetingId) params.append('meetingId', filters.meetingId);
  if (filters?.boardId) params.append('boardId', filters.boardId);
  if (filters?.decision) params.append('decision', filters.decision);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.requiresFollowUp !== undefined) {
    params.append('requiresFollowUp', filters.requiresFollowUp.toString());
  }
  if (filters?.implementationStatus) {
    params.append('implementationStatus', filters.implementationStatus);
  }
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  const url = `${API_BASE}/resolutions${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<Resolution[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch resolutions');
  }

  return result.data!;
}

/**
 * Get resolutions requiring follow-up
 */
export async function getResolutionsRequiringFollowUp(boardId?: string): Promise<Resolution[]> {
  const params = new URLSearchParams();
  if (boardId) params.append('boardId', boardId);

  const url = `${API_BASE}/resolutions/follow-up${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<Resolution[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch resolutions requiring follow-up');
  }

  return result.data!;
}

/**
 * Get overdue resolutions
 */
export async function getOverdueResolutions(boardId?: string): Promise<Resolution[]> {
  const params = new URLSearchParams();
  if (boardId) params.append('boardId', boardId);

  const url = `${API_BASE}/resolutions/overdue${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<Resolution[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch overdue resolutions');
  }

  return result.data!;
}

/**
 * Get resolutions statistics for a board
 */
export async function getResolutionsStats(boardId: string): Promise<ResolutionsStats> {
  const response = await fetch(`${API_BASE}/boards/${boardId}/resolutions/stats`);

  const result: ApiResponse<ResolutionsStats> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch resolutions stats');
  }

  return result.data!;
}

/**
 * Generate next resolution number for a board
 */
export async function generateResolutionNumber(
  boardId: string,
  year?: number
): Promise<string> {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());

  const url = `${API_BASE}/boards/${boardId}/resolutions/next-number${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<{ resolutionNumber: string }> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to generate resolution number');
  }

  return result.data!.resolutionNumber;
}

/**
 * Create new resolution
 */
export async function createResolution(payload: CreateResolutionPayload): Promise<Resolution> {
  const response = await fetch(`${API_BASE}/resolutions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Resolution> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create resolution');
  }

  return result.data!;
}

/**
 * Update resolution
 */
export async function updateResolution(
  resolutionId: string,
  payload: UpdateResolutionPayload
): Promise<Resolution> {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Resolution> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update resolution');
  }

  return result.data!;
}

/**
 * Update resolution implementation status
 */
export async function updateImplementationStatus(
  resolutionId: string,
  payload: UpdateImplementationStatusPayload
): Promise<Resolution> {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}/implementation-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Resolution> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update implementation status');
  }

  return result.data!;
}

/**
 * Delete resolution
 */
export async function deleteResolution(resolutionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/resolutions/${resolutionId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete resolution');
  }
}
