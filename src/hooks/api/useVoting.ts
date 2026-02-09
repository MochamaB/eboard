/**
 * Voting React Query Hooks
 * Custom hooks for voting and polling using React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as votingApi from '../../api/voting.api';
import type {
  Vote,
  VoteDetail,
  VoteWithResults,
  VoteAction,
  VoteResultsSummary,
  CreateVotePayload,
  UpdateVotePayload,
  ConfigureVotePayload,
  OpenVotePayload,
  CastVotePayload,
  CloseVotePayload,
  ReopenVotePayload,
  VoteEntityType,
} from '../../types/voting.types';

// ============================================================================
// QUERY KEYS (Hierarchical)
// ============================================================================

export const votingKeys = {
  all: ['voting'] as const,
  byId: (id: string) => [...votingKeys.all, id] as const,
  byEntity: (type: VoteEntityType, id: string) => [...votingKeys.all, 'entity', type, id] as const,
  byMeeting: (meetingId: string) => [...votingKeys.all, 'meeting', meetingId] as const,
  results: (voteId: string) => [...votingKeys.byId(voteId), 'results'] as const,
  actions: (voteId: string) => [...votingKeys.byId(voteId), 'actions'] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get vote details by ID
 */
export const useVote = (
  voteId: string,
  options?: Omit<UseQueryOptions<VoteDetail>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: votingKeys.byId(voteId),
    queryFn: () => votingApi.getVote(voteId),
    enabled: !!voteId,
    ...options,
  });
};

/**
 * Get vote results (polled if status='open')
 */
export const useVoteResults = (
  voteId: string,
  options?: Omit<UseQueryOptions<VoteResultsSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: votingKeys.results(voteId),
    queryFn: () => votingApi.getVoteResults(voteId),
    enabled: !!voteId,
    refetchInterval: (data) => {
      // Poll every 3 seconds if vote is open
      return data && 'outcome' in data ? false : 3000;
    },
    ...options,
  });
};

/**
 * Get vote audit log
 */
export const useVoteActions = (
  voteId: string,
  options?: Omit<UseQueryOptions<VoteAction[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: votingKeys.actions(voteId),
    queryFn: () => votingApi.getVoteActions(voteId),
    enabled: !!voteId,
    ...options,
  });
};

/**
 * Get votes for a specific entity (polymorphic)
 */
export const useEntityVotes = (
  entityType: VoteEntityType,
  entityId: string,
  options?: Omit<UseQueryOptions<Vote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: votingKeys.byEntity(entityType, entityId),
    queryFn: () => votingApi.getEntityVotes(entityType, entityId),
    enabled: !!entityType && !!entityId,
    ...options,
  });
};

/**
 * Get all votes for a meeting
 */
export const useMeetingVotes = (
  meetingId: string,
  options?: Omit<UseQueryOptions<VoteWithResults[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: votingKeys.byMeeting(meetingId),
    queryFn: () => votingApi.getMeetingVotes(meetingId),
    enabled: !!meetingId,
    staleTime: 0, // Always refetch when invalidated
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new vote (draft)
 */
export const useCreateVote = (
  options?: UseMutationOptions<Vote, Error, CreateVotePayload> & { skipRefetch?: boolean }
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;
  const skipRefetch = options?.skipRefetch || false;

  return useMutation({
    ...options,
    mutationFn: votingApi.createVote,
    onSuccess: async (...args) => {
      const [_data, variables] = args;
      
      // Only refetch if not skipped (used in multi-step wizards)
      if (!skipRefetch) {
        // Refetch meeting votes immediately to update UI
        await queryClient.refetchQueries({ 
          queryKey: votingKeys.byMeeting(variables.meetingId) 
        });
        
        // Refetch entity votes if linked to an entity
        if (variables.entityType && variables.entityId) {
          await queryClient.refetchQueries({
            queryKey: votingKeys.byEntity(variables.entityType, variables.entityId),
          });
        }
      }
      
      // Call user's onSuccess callback after refetch completes (or immediately if skipped)
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update vote basic information
 */
export const useUpdateVote = (
  voteId: string,
  options?: UseMutationOptions<Vote, Error, UpdateVotePayload> & { meetingId?: string; skipRefetch?: boolean }
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;
  const meetingId = options?.meetingId;
  const skipRefetch = options?.skipRefetch || false;

  return useMutation({
    ...options,
    mutationFn: (payload) => votingApi.updateVote(voteId, payload),
    onSuccess: async (...args) => {
      // Only refetch if not skipped
      if (!skipRefetch) {
        // Refetch vote details
        await queryClient.refetchQueries({
          queryKey: votingKeys.byId(voteId),
        });
        
        // Refetch meeting votes list if meetingId provided
        if (meetingId) {
          await queryClient.refetchQueries({
            queryKey: votingKeys.byMeeting(meetingId),
          });
        }
      }
      
      // Call user's onSuccess callback after refetch completes
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Configure vote rules
 */
export const useConfigureVote = (
  voteId: string,
  options?: UseMutationOptions<VoteDetail, Error, ConfigureVotePayload> & { meetingId?: string }
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;
  const meetingId = options?.meetingId;

  return useMutation({
    ...options,
    mutationFn: (payload) => votingApi.configureVote(voteId, payload),
    onSuccess: async (...args) => {
      // Refetch vote details
      await queryClient.refetchQueries({
        queryKey: votingKeys.byId(voteId),
      });
      
      // Refetch meeting votes list if meetingId provided
      if (meetingId) {
        await queryClient.refetchQueries({
          queryKey: votingKeys.byMeeting(meetingId),
        });
      }
      
      // Call user's onSuccess callback after refetch completes
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Open voting
 */
export const useOpenVote = (
  voteId: string,
  options?: UseMutationOptions<VoteDetail, Error, OpenVotePayload | undefined>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => votingApi.openVote(voteId, payload),
    onSuccess: () => {
      // Refetch vote details and results
      queryClient.invalidateQueries({
        queryKey: votingKeys.byId(voteId),
      });
      queryClient.invalidateQueries({
        queryKey: votingKeys.results(voteId),
      });
    },
    ...options,
  });
};

/**
 * Cast a vote
 */
export const useCastVote = (
  voteId: string,
  options?: UseMutationOptions<VoteDetail, Error, CastVotePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => votingApi.castVote(voteId, payload),
    onSuccess: () => {
      // Refetch results immediately
      queryClient.invalidateQueries({
        queryKey: votingKeys.results(voteId),
      });
      // Refetch vote details
      queryClient.invalidateQueries({
        queryKey: votingKeys.byId(voteId),
      });
    },
    ...options,
  });
};

/**
 * Close voting
 */
export const useCloseVote = (
  voteId: string,
  options?: UseMutationOptions<VoteDetail, Error, CloseVotePayload | undefined>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => votingApi.closeVote(voteId, payload),
    onSuccess: () => {
      // Refetch vote details and results
      queryClient.invalidateQueries({
        queryKey: votingKeys.byId(voteId),
      });
      queryClient.invalidateQueries({
        queryKey: votingKeys.results(voteId),
      });
    },
    ...options,
  });
};

/**
 * Reopen voting
 */
export const useReopenVote = (
  voteId: string,
  options?: UseMutationOptions<VoteDetail, Error, ReopenVotePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => votingApi.reopenVote(voteId, payload),
    onSuccess: () => {
      // Refetch vote details and results
      queryClient.invalidateQueries({
        queryKey: votingKeys.byId(voteId),
      });
      queryClient.invalidateQueries({
        queryKey: votingKeys.results(voteId),
      });
      // Refetch actions (audit log)
      queryClient.invalidateQueries({
        queryKey: votingKeys.actions(voteId),
      });
    },
    ...options,
  });
};

/**
 * Delete a vote (only if in draft status)
 */
export const useDeleteVote = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: votingApi.deleteVote,
    onSuccess: (_, voteId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: votingKeys.byId(voteId),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: votingKeys.all,
      });
    },
    ...options,
  });
};
