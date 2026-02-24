/**
 * Lookups API
 * API functions for fetching lookup tables from backend
 * All lookups are database-driven and configurable
 */

import apiClient from './client';
import { safeParseResponse } from '../utils/safeParseResponse';
import {
  BoardTypesResponseSchema,
  BoardZonesResponseSchema,
  MeetingTypesResponseSchema,
  MeetingFrequenciesResponseSchema,
  VotingThresholdsResponseSchema,
  DocumentCategoriesResponseSchema,
  AgendaItemTypesResponseSchema,
  ResolutionCategoriesResponseSchema,
  RolesResponseSchema,
  PermissionsResponseSchema,
  type BoardTypesResponse,
  type BoardZonesResponse,
  type MeetingTypesResponse,
  type MeetingFrequenciesResponse,
  type VotingThresholdsResponse,
  type DocumentCategoriesResponse,
  type AgendaItemTypesResponse,
  type ResolutionCategoriesResponse,
  type RolesResponse,
  type PermissionsResponse,
} from '../types/lookup.types';

// ============================================================================
// BOARD TYPE LOOKUPS
// ============================================================================

export async function getBoardTypes(): Promise<BoardTypesResponse> {
  const response = await apiClient.get('/lookups/board-types');
  return safeParseResponse(BoardTypesResponseSchema, response.data);
}

// ============================================================================
// BOARD ZONE LOOKUPS
// ============================================================================

export async function getBoardZones(): Promise<BoardZonesResponse> {
  const response = await apiClient.get('/lookups/board-zones');
  return safeParseResponse(BoardZonesResponseSchema, response.data);
}

// ============================================================================
// MEETING TYPE LOOKUPS
// ============================================================================

export async function getMeetingTypes(): Promise<MeetingTypesResponse> {
  const response = await apiClient.get('/lookups/meeting-types');
  return safeParseResponse(MeetingTypesResponseSchema, response.data);
}

// ============================================================================
// MEETING FREQUENCY LOOKUPS
// ============================================================================

export async function getMeetingFrequencies(): Promise<MeetingFrequenciesResponse> {
  const response = await apiClient.get('/lookups/meeting-frequencies');
  return safeParseResponse(MeetingFrequenciesResponseSchema, response.data);
}

// ============================================================================
// VOTING THRESHOLD LOOKUPS
// ============================================================================

export async function getVotingThresholds(): Promise<VotingThresholdsResponse> {
  const response = await apiClient.get('/lookups/voting-thresholds');
  return safeParseResponse(VotingThresholdsResponseSchema, response.data);
}

// ============================================================================
// DOCUMENT CATEGORY LOOKUPS
// ============================================================================

export async function getDocumentCategories(): Promise<DocumentCategoriesResponse> {
  const response = await apiClient.get('/lookups/document-categories');
  return safeParseResponse(DocumentCategoriesResponseSchema, response.data);
}

// ============================================================================
// AGENDA ITEM TYPE LOOKUPS
// ============================================================================

export async function getAgendaItemTypes(): Promise<AgendaItemTypesResponse> {
  const response = await apiClient.get('/lookups/agenda-item-types');
  return safeParseResponse(AgendaItemTypesResponseSchema, response.data);
}

// ============================================================================
// RESOLUTION CATEGORY LOOKUPS
// ============================================================================

export async function getResolutionCategories(): Promise<ResolutionCategoriesResponse> {
  const response = await apiClient.get('/lookups/resolution-categories');
  return safeParseResponse(ResolutionCategoriesResponseSchema, response.data);
}

// ============================================================================
// ROLE LOOKUPS
// ============================================================================

export async function getRoles(): Promise<RolesResponse> {
  const response = await apiClient.get('/lookups/roles');
  return safeParseResponse(RolesResponseSchema, response.data);
}

// ============================================================================
// PERMISSION LOOKUPS
// ============================================================================

export async function getPermissions(): Promise<PermissionsResponse> {
  const response = await apiClient.get('/lookups/permissions');
  return safeParseResponse(PermissionsResponseSchema, response.data);
}
