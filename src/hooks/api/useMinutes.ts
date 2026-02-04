/**
 * Minutes React Query Hooks
 * Custom hooks for meeting minutes management using React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as minutesApi from '../../api/minutes.api';
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
} from '../../types/minutes.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const minutesKeys = {
  all: ['minutes'] as const,
  byMeeting: (meetingId: string) => [...minutesKeys.all, 'meeting', meetingId] as const,
  byId: (minutesId: string) => [...minutesKeys.all, 'id', minutesId] as const,
  list: (filters?: MinutesFilters) => [...minutesKeys.all, 'list', filters] as const,
  pendingApproval: () => [...minutesKeys.all, 'pending-approval'] as const,
  comments: (minutesId: string) => [...minutesKeys.all, minutesId, 'comments'] as const,
  signatures: (minutesId: string) => [...minutesKeys.all, minutesId, 'signatures'] as const,
};

// ============================================================================
// QUERY HOOKS - MINUTES
// ============================================================================

/**
 * Get minutes for a meeting
 */
export const useMinutesByMeeting = (
  meetingId: string,
  options?: Omit<UseQueryOptions<Minutes>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesKeys.byMeeting(meetingId),
    queryFn: () => minutesApi.getMinutesByMeetingId(meetingId),
    enabled: !!meetingId && meetingId.length > 0,
    retry: false,
    staleTime: 0,
    ...options,
  });
};

/**
 * Get minutes by ID
 */
export const useMinutes = (
  minutesId: string,
  options?: Omit<UseQueryOptions<Minutes>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesKeys.byId(minutesId),
    queryFn: () => minutesApi.getMinutesById(minutesId),
    enabled: !!minutesId && minutesId.length > 0,
    retry: false,
    ...options,
  });
};

/**
 * Get all minutes with optional filters
 */
export const useAllMinutes = (
  filters?: MinutesFilters,
  options?: Omit<UseQueryOptions<Minutes[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesKeys.list(filters),
    queryFn: () => minutesApi.getAllMinutes(filters),
    ...options,
  });
};

/**
 * Get minutes pending approval
 */
export const useMinutesPendingApproval = (
  options?: Omit<UseQueryOptions<Minutes[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesKeys.pendingApproval(),
    queryFn: () => minutesApi.getMinutesPendingApproval(),
    ...options,
  });
};

// ============================================================================
// QUERY HOOKS - COMMENTS
// ============================================================================

/**
 * Get comments for minutes
 */
export const useMinutesComments = (
  minutesId: string,
  options?: Omit<UseQueryOptions<MinutesComment[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesKeys.comments(minutesId),
    queryFn: () => minutesApi.getCommentsByMinutesId(minutesId),
    enabled: !!minutesId && minutesId.length > 0,
    ...options,
  });
};

// ============================================================================
// QUERY HOOKS - SIGNATURES
// ============================================================================

/**
 * Get signatures for minutes
 */
export const useMinutesSignatures = (
  minutesId: string,
  options?: Omit<UseQueryOptions<MinutesSignature[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesKeys.signatures(minutesId),
    queryFn: () => minutesApi.getSignaturesByMinutesId(minutesId),
    enabled: !!minutesId && minutesId.length > 0,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS - MINUTES
// ============================================================================

/**
 * Create minutes
 */
export const useCreateMinutes = (
  options?: UseMutationOptions<Minutes, Error, CreateMinutesPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: CreateMinutesPayload) => minutesApi.createMinutes(payload),
    onSuccess: async (...args) => {
      const [_data, variables] = args;
      await queryClient.refetchQueries({ queryKey: minutesKeys.byMeeting(variables.meetingId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update minutes
 */
export const useUpdateMinutes = (
  minutesId: string,
  meetingId: string,
  options?: UseMutationOptions<Minutes, Error, UpdateMinutesPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: UpdateMinutesPayload) => minutesApi.updateMinutes(minutesId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.byId(minutesId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Submit minutes for review
 */
export const useSubmitMinutes = (
  minutesId: string,
  meetingId: string,
  options?: UseMutationOptions<Minutes, Error, SubmitMinutesPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: SubmitMinutesPayload) => minutesApi.submitMinutesForReview(minutesId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.byId(minutesId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.pendingApproval() });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Approve minutes
 */
export const useApproveMinutes = (
  minutesId: string,
  meetingId: string,
  options?: UseMutationOptions<Minutes, Error, ApproveMinutesPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: ApproveMinutesPayload) => minutesApi.approveMinutes(minutesId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.byId(minutesId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.pendingApproval() });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Request revision on minutes
 */
export const useRequestRevision = (
  minutesId: string,
  meetingId: string,
  options?: UseMutationOptions<Minutes, Error, RequestRevisionPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: RequestRevisionPayload) => minutesApi.requestMinutesRevision(minutesId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.byId(minutesId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.pendingApproval() });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Publish minutes
 */
export const usePublishMinutes = (
  minutesId: string,
  meetingId: string,
  options?: UseMutationOptions<Minutes, Error, PublishMinutesPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: PublishMinutesPayload) => minutesApi.publishMinutes(minutesId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: minutesKeys.byId(minutesId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Delete minutes
 */
export const useDeleteMinutes = (
  meetingId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (minutesId: string) => minutesApi.deleteMinutes(minutesId),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.byMeeting(meetingId) });
      await queryClient.invalidateQueries({ queryKey: minutesKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

// ============================================================================
// MUTATION HOOKS - COMMENTS
// ============================================================================

/**
 * Add comment to minutes
 */
export const useAddComment = (
  minutesId: string,
  options?: UseMutationOptions<MinutesComment, Error, AddCommentPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: AddCommentPayload) => minutesApi.addComment(minutesId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.comments(minutesId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Resolve comment
 */
export const useResolveComment = (
  minutesId: string,
  options?: UseMutationOptions<MinutesComment, Error, { commentId: string; payload: ResolveCommentPayload }>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: ({ commentId, payload }) => minutesApi.resolveComment(commentId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.comments(minutesId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Delete comment
 */
export const useDeleteComment = (
  minutesId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (commentId: string) => minutesApi.deleteComment(commentId),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.comments(minutesId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

// ============================================================================
// MUTATION HOOKS - SIGNATURES
// ============================================================================

/**
 * Add signature to minutes
 */
export const useAddSignature = (
  minutesId: string,
  options?: UseMutationOptions<MinutesSignature, Error, AddSignaturePayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: AddSignaturePayload) => minutesApi.addSignature(minutesId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: minutesKeys.signatures(minutesId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};
