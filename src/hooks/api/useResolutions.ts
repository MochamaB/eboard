/**
 * Resolutions React Query Hooks
 * Custom hooks for board resolutions management using React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as resolutionsApi from '../../api/resolutions.api';
import type {
  Resolution,
  CreateResolutionPayload,
  UpdateResolutionPayload,
  UpdateImplementationStatusPayload,
  ResolutionFilters,
  ResolutionsStats,
} from '../../types/resolutions.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const resolutionsKeys = {
  all: ['resolutions'] as const,
  byId: (resolutionId: string) => [...resolutionsKeys.all, 'id', resolutionId] as const,
  byMeeting: (meetingId: string) => [...resolutionsKeys.all, 'meeting', meetingId] as const,
  byBoard: (boardId: string) => [...resolutionsKeys.all, 'board', boardId] as const,
  list: (filters?: ResolutionFilters) => [...resolutionsKeys.all, 'list', filters] as const,
  followUp: (boardId?: string) => [...resolutionsKeys.all, 'follow-up', boardId] as const,
  overdue: (boardId?: string) => [...resolutionsKeys.all, 'overdue', boardId] as const,
  stats: (boardId: string) => [...resolutionsKeys.all, 'stats', boardId] as const,
  nextNumber: (boardId: string, year?: number) => [...resolutionsKeys.all, 'next-number', boardId, year] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get resolution by ID
 */
export const useResolution = (
  resolutionId: string,
  options?: Omit<UseQueryOptions<Resolution>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.byId(resolutionId),
    queryFn: () => resolutionsApi.getResolutionById(resolutionId),
    enabled: !!resolutionId && resolutionId.length > 0,
    retry: false,
    ...options,
  });
};

/**
 * Get resolutions by meeting ID
 */
export const useResolutionsByMeeting = (
  meetingId: string,
  options?: Omit<UseQueryOptions<Resolution[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.byMeeting(meetingId),
    queryFn: () => resolutionsApi.getResolutionsByMeetingId(meetingId),
    enabled: !!meetingId && meetingId.length > 0,
    ...options,
  });
};

/**
 * Get resolutions by board ID
 */
export const useResolutionsByBoard = (
  boardId: string,
  options?: Omit<UseQueryOptions<Resolution[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.byBoard(boardId),
    queryFn: () => resolutionsApi.getResolutionsByBoardId(boardId),
    enabled: !!boardId && boardId.length > 0,
    ...options,
  });
};

/**
 * Get all resolutions with optional filters
 */
export const useAllResolutions = (
  filters?: ResolutionFilters,
  options?: Omit<UseQueryOptions<Resolution[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.list(filters),
    queryFn: () => resolutionsApi.getAllResolutions(filters),
    ...options,
  });
};

/**
 * Get resolutions requiring follow-up
 */
export const useResolutionsRequiringFollowUp = (
  boardId?: string,
  options?: Omit<UseQueryOptions<Resolution[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.followUp(boardId),
    queryFn: () => resolutionsApi.getResolutionsRequiringFollowUp(boardId),
    ...options,
  });
};

/**
 * Get overdue resolutions
 */
export const useOverdueResolutions = (
  boardId?: string,
  options?: Omit<UseQueryOptions<Resolution[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.overdue(boardId),
    queryFn: () => resolutionsApi.getOverdueResolutions(boardId),
    ...options,
  });
};

/**
 * Get resolutions statistics
 */
export const useResolutionsStats = (
  boardId: string,
  options?: Omit<UseQueryOptions<ResolutionsStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.stats(boardId),
    queryFn: () => resolutionsApi.getResolutionsStats(boardId),
    enabled: !!boardId && boardId.length > 0,
    ...options,
  });
};

/**
 * Generate next resolution number
 */
export const useNextResolutionNumber = (
  boardId: string,
  year?: number,
  options?: Omit<UseQueryOptions<string>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: resolutionsKeys.nextNumber(boardId, year),
    queryFn: () => resolutionsApi.generateResolutionNumber(boardId, year),
    enabled: !!boardId && boardId.length > 0,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create resolution
 */
export const useCreateResolution = (
  options?: UseMutationOptions<Resolution, Error, CreateResolutionPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: CreateResolutionPayload) => resolutionsApi.createResolution(payload),
    onSuccess: async (...args) => {
      const [_data, variables] = args;
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byMeeting(variables.meetingId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byBoard(variables.boardId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.stats(variables.boardId) });
      await queryClient.invalidateQueries({ queryKey: resolutionsKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update resolution
 */
export const useUpdateResolution = (
  resolutionId: string,
  meetingId: string,
  boardId: string,
  options?: UseMutationOptions<Resolution, Error, UpdateResolutionPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: UpdateResolutionPayload) => resolutionsApi.updateResolution(resolutionId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byId(resolutionId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byBoard(boardId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.stats(boardId) });
      await queryClient.invalidateQueries({ queryKey: resolutionsKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update implementation status
 */
export const useUpdateImplementationStatus = (
  resolutionId: string,
  meetingId: string,
  boardId: string,
  options?: UseMutationOptions<Resolution, Error, UpdateImplementationStatusPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: UpdateImplementationStatusPayload) => resolutionsApi.updateImplementationStatus(resolutionId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byId(resolutionId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byBoard(boardId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.stats(boardId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.followUp(boardId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.overdue(boardId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Delete resolution
 */
export const useDeleteResolution = (
  meetingId: string,
  boardId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (resolutionId: string) => resolutionsApi.deleteResolution(resolutionId),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.byBoard(boardId) });
      await queryClient.refetchQueries({ queryKey: resolutionsKeys.stats(boardId) });
      await queryClient.invalidateQueries({ queryKey: resolutionsKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};
