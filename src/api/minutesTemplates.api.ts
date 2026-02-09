/**
 * Minutes Templates API Client
 * API functions for minutes templates management
 */

import type {
  MinutesTemplate,
  CreateMinutesTemplatePayload,
  UpdateMinutesTemplatePayload,
  MinutesTemplateFilters,
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
// MINUTES TEMPLATES ENDPOINTS
// ============================================================================

/**
 * Get all minutes templates with optional filters
 */
export async function getAllMinutesTemplates(filters?: MinutesTemplateFilters): Promise<MinutesTemplate[]> {
  const params = new URLSearchParams();
  
  if (filters?.boardType) params.append('boardType', filters.boardType);
  if (filters?.meetingType) params.append('meetingType', filters.meetingType);
  if (filters?.isGlobal !== undefined) params.append('isGlobal', filters.isGlobal.toString());

  const url = `${API_BASE}/minutes-templates${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const result: ApiResponse<MinutesTemplate[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch minutes templates');
  }

  return result.data!;
}

/**
 * Get minutes template by ID
 */
export async function getMinutesTemplateById(templateId: string): Promise<MinutesTemplate> {
  const response = await fetch(`${API_BASE}/minutes-templates/${templateId}`);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Template not found');
  }

  const result: ApiResponse<MinutesTemplate> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch template');
  }

  return result.data!;
}

/**
 * Create new minutes template
 */
export async function createMinutesTemplate(payload: CreateMinutesTemplatePayload): Promise<MinutesTemplate> {
  const response = await fetch(`${API_BASE}/minutes-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<MinutesTemplate> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create template');
  }

  return result.data!;
}

/**
 * Update minutes template
 */
export async function updateMinutesTemplate(
  templateId: string,
  payload: UpdateMinutesTemplatePayload
): Promise<MinutesTemplate> {
  const response = await fetch(`${API_BASE}/minutes-templates/${templateId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<MinutesTemplate> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update template');
  }

  return result.data!;
}

/**
 * Delete minutes template
 */
export async function deleteMinutesTemplate(templateId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/minutes-templates/${templateId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete template');
  }
}
