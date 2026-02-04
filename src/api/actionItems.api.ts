/**
 * Action Items API Client
 * API functions for action items management
 */

import type {
  ActionItem,
  CreateActionItemPayload,
  UpdateActionItemPayload,
  UpdateActionItemStatusPayload,
  CompleteActionItemPayload,
  ActionItemFilters,
  ActionItemsStats,
} from '../types/actionItems.types';

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
// ACTION ITEMS ENDPOINTS
// ============================================================================

/**
 * Get action item by ID
 */
export async function getActionItemById(actionItemId: string): Promise<ActionItem> {
  const response = await fetch(`${API_BASE}/action-items/${actionItemId}`);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Action item not found');
  }

  const result: ApiResponse<ActionItem> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch action item');
  }

  return result.data!;
}

/**
 * Get action items by meeting ID
 */
export async function getActionItemsByMeetingId(meetingId: string): Promise<ActionItem[]> {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/action-items`);

  const result: ApiResponse<ActionItem[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch action items');
  }

  return result.data!;
}

/**
 * Get action items by board ID
 */
export async function getActionItemsByBoardId(boardId: string): Promise<ActionItem[]> {
  const response = await fetch(`${API_BASE}/boards/${boardId}/action-items`);

  const result: ApiResponse<ActionItem[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch action items');
  }

  return result.data!;
}

/**
 * Get action items assigned to a user
 */
export async function getActionItemsByAssignee(userId: number): Promise<ActionItem[]> {
  const response = await fetch(`${API_BASE}/users/${userId}/action-items`);

  const result: ApiResponse<ActionItem[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch action items');
  }

  return result.data!;
}

/**
 * Get all action items with optional filters
 */
export async function getAllActionItems(filters?: ActionItemFilters): Promise<ActionItem[]> {
  const params = new URLSearchParams();
  
  if (filters?.meetingId) params.append('meetingId', filters.meetingId);
  if (filters?.boardId) params.append('boardId', filters.boardId);
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.source) params.append('source', filters.source);
  if (filters?.overdue) params.append('overdue', 'true');

  const url = `${API_BASE}/action-items${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<ActionItem[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch action items');
  }

  return result.data!;
}

/**
 * Get overdue action items
 */
export async function getOverdueActionItems(userId?: number): Promise<ActionItem[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());

  const url = `${API_BASE}/action-items/overdue${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<ActionItem[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch overdue action items');
  }

  return result.data!;
}

/**
 * Get action items due soon (within 7 days)
 */
export async function getActionItemsDueSoon(userId?: number): Promise<ActionItem[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());

  const url = `${API_BASE}/action-items/due-soon${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<ActionItem[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch action items due soon');
  }

  return result.data!;
}

/**
 * Get action items statistics for a user
 */
export async function getActionItemsStats(userId: number): Promise<ActionItemsStats> {
  const response = await fetch(`${API_BASE}/users/${userId}/action-items/stats`);

  const result: ApiResponse<ActionItemsStats> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch action items stats');
  }

  return result.data!;
}

/**
 * Create new action item
 */
export async function createActionItem(payload: CreateActionItemPayload): Promise<ActionItem> {
  const response = await fetch(`${API_BASE}/action-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<ActionItem> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create action item');
  }

  return result.data!;
}

/**
 * Update action item
 */
export async function updateActionItem(
  actionItemId: string,
  payload: UpdateActionItemPayload
): Promise<ActionItem> {
  const response = await fetch(`${API_BASE}/action-items/${actionItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<ActionItem> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update action item');
  }

  return result.data!;
}

/**
 * Update action item status
 */
export async function updateActionItemStatus(
  actionItemId: string,
  payload: UpdateActionItemStatusPayload
): Promise<ActionItem> {
  const response = await fetch(`${API_BASE}/action-items/${actionItemId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<ActionItem> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update action item status');
  }

  return result.data!;
}

/**
 * Mark action item as completed
 */
export async function completeActionItem(
  actionItemId: string,
  payload: CompleteActionItemPayload
): Promise<ActionItem> {
  const response = await fetch(`${API_BASE}/action-items/${actionItemId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<ActionItem> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to complete action item');
  }

  return result.data!;
}

/**
 * Delete action item
 */
export async function deleteActionItem(actionItemId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/action-items/${actionItemId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete action item');
  }
}
