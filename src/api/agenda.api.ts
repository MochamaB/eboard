/**
 * Agenda API Client
 * API functions for agenda management
 */

import type {
  Agenda,
  AgendaTemplate,
  CreateAgendaPayload,
  UpdateAgendaPayload,
  CreateAgendaItemPayload,
  UpdateAgendaItemPayload,
  ReorderAgendaItemsPayload,
  PublishAgendaPayload,
  CreateAgendaTemplatePayload,
  UpdateAgendaTemplatePayload,
} from '../types/agenda.types';

const API_BASE = '/api';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ============================================================================
// AGENDA ENDPOINTS
// ============================================================================

/**
 * Get agenda for a meeting
 */
export async function getAgendaByMeetingId(meetingId: string): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/meetings/${meetingId}/agenda`);
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // Non-JSON response (likely HTML 404 page) - treat as not found
    throw new Error('Agenda not found');
  }

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch agenda');
  }

  return result.data!;
}

/**
 * Create agenda for a meeting
 */
export async function createAgenda(payload: CreateAgendaPayload): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/meetings/${payload.meetingId}/agenda`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create agenda');
  }

  return result.data!;
}

/**
 * Update agenda
 */
export async function updateAgenda(
  agendaId: string,
  payload: UpdateAgendaPayload
): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/agendas/${agendaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update agenda');
  }

  return result.data!;
}

/**
 * Publish agenda
 */
export async function publishAgenda(
  agendaId: string,
  payload: PublishAgendaPayload
): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/agendas/${agendaId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to publish agenda');
  }

  return result.data!;
}

/**
 * Delete agenda
 */
export async function deleteAgenda(agendaId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/agendas/${agendaId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete agenda');
  }
}

// ============================================================================
// AGENDA ITEM ENDPOINTS
// ============================================================================

/**
 * Add agenda item
 */
export async function addAgendaItem(
  agendaId: string,
  payload: CreateAgendaItemPayload
): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/agendas/${agendaId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Invalid response format from server');
  }

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add agenda item');
  }

  return result.data!;
}

/**
 * Update agenda item
 */
export async function updateAgendaItem(
  agendaId: string,
  itemId: string,
  payload: UpdateAgendaItemPayload
): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/agendas/${agendaId}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update agenda item');
  }

  return result.data!;
}

/**
 * Delete agenda item
 */
export async function deleteAgendaItem(agendaId: string, itemId: string): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/agendas/${agendaId}/items/${itemId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete agenda item');
  }

  return result.data!;
}

/**
 * Reorder agenda items
 */
export async function reorderAgendaItems(
  agendaId: string,
  payload: ReorderAgendaItemsPayload
): Promise<Agenda> {
  const response = await fetch(`${API_BASE}/agendas/${agendaId}/items/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Agenda> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to reorder agenda items');
  }

  return result.data!;
}

// ============================================================================
// AGENDA TEMPLATE ENDPOINTS
// ============================================================================

/**
 * Get all agenda templates
 */
export async function getAgendaTemplates(boardType?: string): Promise<AgendaTemplate[]> {
  const params = new URLSearchParams();
  if (boardType) {
    params.append('boardType', boardType);
  }

  const response = await fetch(`${API_BASE}/agenda-templates?${params.toString()}`);
  const result: ApiResponse<AgendaTemplate[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch templates');
  }

  return result.data || [];
}

/**
 * Get single agenda template
 */
export async function getAgendaTemplate(templateId: string): Promise<AgendaTemplate> {
  const response = await fetch(`${API_BASE}/agenda-templates/${templateId}`);
  const result: ApiResponse<AgendaTemplate> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch template');
  }

  return result.data!;
}

/**
 * Create agenda template
 */
export async function createAgendaTemplate(
  payload: CreateAgendaTemplatePayload
): Promise<AgendaTemplate> {
  const response = await fetch(`${API_BASE}/agenda-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<AgendaTemplate> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create template');
  }

  return result.data!;
}

/**
 * Update agenda template
 */
export async function updateAgendaTemplate(
  templateId: string,
  payload: UpdateAgendaTemplatePayload
): Promise<AgendaTemplate> {
  const response = await fetch(`${API_BASE}/agenda-templates/${templateId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<AgendaTemplate> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update template');
  }

  return result.data!;
}

/**
 * Delete agenda template
 */
export async function deleteAgendaTemplate(templateId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/agenda-templates/${templateId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete template');
  }
}
