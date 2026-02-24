/**
 * Lookup React Query Hooks
 * Hooks for fetching lookup tables from backend
 * All lookups are cached and refetched on window focus
 */

import { useQuery } from '@tanstack/react-query';
import {
  getBoardTypes,
  getBoardZones,
  getMeetingTypes,
  getMeetingFrequencies,
  getVotingThresholds,
  getDocumentCategories,
  getAgendaItemTypes,
  getResolutionCategories,
  getRoles,
  getPermissions,
} from '../../api/lookups.api';
import type {
  BoardTypeLookup,
  BoardZoneLookup,
  MeetingTypeLookup,
  MeetingFrequencyLookup,
  VotingThresholdLookup,
  DocumentCategoryLookup,
  AgendaItemTypeLookup,
  ResolutionCategoryLookup,
  RoleLookup,
  PermissionGroup,
} from '../../types/lookup.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const lookupKeys = {
  all: ['lookups'] as const,
  boardTypes: () => [...lookupKeys.all, 'board-types'] as const,
  boardZones: () => [...lookupKeys.all, 'board-zones'] as const,
  meetingTypes: () => [...lookupKeys.all, 'meeting-types'] as const,
  meetingFrequencies: () => [...lookupKeys.all, 'meeting-frequencies'] as const,
  votingThresholds: () => [...lookupKeys.all, 'voting-thresholds'] as const,
  documentCategories: () => [...lookupKeys.all, 'document-categories'] as const,
  agendaItemTypes: () => [...lookupKeys.all, 'agenda-item-types'] as const,
  resolutionCategories: () => [...lookupKeys.all, 'resolution-categories'] as const,
  roles: () => [...lookupKeys.all, 'roles'] as const,
  permissions: () => [...lookupKeys.all, 'permissions'] as const,
};

// ============================================================================
// LOOKUP QUERY OPTIONS
// ============================================================================

const LOOKUP_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 30, // 30 minutes - lookups rarely change
  gcTime: 1000 * 60 * 60, // 1 hour cache
  refetchOnWindowFocus: true,
  refetchOnMount: false,
  retry: 3,
};

// ============================================================================
// BOARD TYPE LOOKUPS
// ============================================================================

export const useBoardTypes = () => {
  return useQuery<BoardTypeLookup[]>({
    queryKey: lookupKeys.boardTypes(),
    queryFn: async () => {
      const response = await getBoardTypes();
      return response; // Response is already the array (unwrapped by axios interceptor)
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
};

// ============================================================================
// BOARD ZONE LOOKUPS
// ============================================================================

export const useBoardZones = () => {
  return useQuery<BoardZoneLookup[]>({
    queryKey: lookupKeys.boardZones(),
    queryFn: async () => {
      const response = await getBoardZones();
      return response; // Response is already the array (unwrapped by axios interceptor)
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
};

// ============================================================================
// MEETING TYPE LOOKUPS
// ============================================================================

export const useMeetingTypes = () => {
  return useQuery<MeetingTypeLookup[]>({
    queryKey: lookupKeys.meetingTypes(),
    queryFn: async () => {
      const response = await getMeetingTypes();
      return response; // Response is already the array (unwrapped by axios interceptor)
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
};

// ============================================================================
// MEETING FREQUENCY LOOKUPS
// ============================================================================

export const useMeetingFrequencies = () => {
  return useQuery<MeetingFrequencyLookup[]>({
    queryKey: lookupKeys.meetingFrequencies(),
    queryFn: async () => {
      const response = await getMeetingFrequencies();
      return response; // Response is already the array (unwrapped by axios interceptor)
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
};

// ============================================================================
// VOTING THRESHOLD LOOKUPS
// ============================================================================

export const useVotingThresholds = () => {
  return useQuery<VotingThresholdLookup[]>({
    queryKey: lookupKeys.votingThresholds(),
    queryFn: async () => {
      const response = await getVotingThresholds();
      return response; // Response is already the array (unwrapped by axios interceptor)
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
};

// ============================================================================
// DOCUMENT CATEGORY LOOKUPS
// ============================================================================

export const useDocumentCategories = () => {
  return useQuery<DocumentCategoryLookup[]>({
    queryKey: lookupKeys.documentCategories(),
    queryFn: async () => {
      const response = await getDocumentCategories();
      return response; // Response is already the array (unwrapped by axios interceptor)
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
};

// ============================================================================
// AGENDA ITEM TYPE LOOKUPS
// ============================================================================

export const useAgendaItemTypes = () => {
  return useQuery<AgendaItemTypeLookup[]>({
    queryKey: lookupKeys.agendaItemTypes(),
    queryFn: async () => {
      const response = await getAgendaItemTypes();
      return response; // Response is already the array (unwrapped by axios interceptor)
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
};

// ============================================================================
// RESOLUTION CATEGORY LOOKUPS
// ============================================================================

export function useResolutionCategories() {
  return useQuery<ResolutionCategoryLookup[]>({
    queryKey: lookupKeys.resolutionCategories(),
    queryFn: getResolutionCategories,
    ...LOOKUP_QUERY_OPTIONS,
  });
}

// ============================================================================
// ROLE HOOKS
// ============================================================================

export function useRoles() {
  return useQuery<RoleLookup[]>({
    queryKey: lookupKeys.roles(),
    queryFn: getRoles,
    ...LOOKUP_QUERY_OPTIONS,
  });
}

/**
 * Fetch roles that have a specific permission
 * Uses the admin roles API to get full role objects with permissions
 */
export function useRolesByPermission(permissionCode: string) {
  return useQuery({
    queryKey: [...lookupKeys.roles(), 'by-permission', permissionCode],
    queryFn: async () => {
      // Import rolesApi dynamically to avoid circular dependencies
      const { rolesApi } = await import('../../api/roles.api');
      const response = await rolesApi.getRoles({
        includeSystem: true,
        includePermissions: true // Required to get permissions array for filtering
      });

      // Filter roles that have the specified permission
      return response.data.filter(role =>
        role.permissions?.some(p => p.code === permissionCode) ?? false
      );
    },
    ...LOOKUP_QUERY_OPTIONS,
  });
}

// ============================================================================
// PERMISSION HOOKS
// ============================================================================

export function usePermissions() {
  return useQuery<PermissionGroup[]>({
    queryKey: lookupKeys.permissions(),
    queryFn: getPermissions,
    ...LOOKUP_QUERY_OPTIONS,
  });
}
