/**
 * Meetings React Query Hooks
 * Custom hooks for meeting management using React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { meetingsApi } from '../../api/meetings.api';
import type {
  Meeting,
  MeetingListItem,
  MeetingFilterParams,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  AddGuestPayload,
  UpdateRSVPPayload,
  CancelMeetingPayload,
  RescheduleMeetingPayload,
  MeetingConfirmationHistory,
  RejectionReason,
} from '../../types/meeting.types';
import type { PaginatedResponse } from '../../types/api.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (params?: MeetingFilterParams) => [...meetingKeys.lists(), params] as const,
  details: () => [...meetingKeys.all, 'detail'] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
  boardMeetings: (boardId: string, includeCommittees?: boolean) =>
    [...meetingKeys.all, 'board', boardId, includeCommittees] as const,
  upcoming: (limit?: number) => [...meetingKeys.all, 'upcoming', limit] as const,
  pendingConfirmation: () => [...meetingKeys.all, 'pending-confirmation'] as const,
  confirmationHistory: (id: string) => [...meetingKeys.all, 'confirmation-history', id] as const,
  confirmationStatus: (id: string) => [...meetingKeys.all, 'confirmation-status', id] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get meetings with filters
 */
export const useMeetings = (
  params?: MeetingFilterParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<MeetingListItem>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.list(params),
    queryFn: () => meetingsApi.getMeetings(params),
    ...options,
  });
};

/**
 * Get meetings for a specific board
 */
export const useBoardMeetings = (
  boardId: string,
  params?: { includeCommittees?: boolean; page?: number; pageSize?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<MeetingListItem>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.boardMeetings(boardId, params?.includeCommittees),
    queryFn: () => meetingsApi.getBoardMeetings(boardId, params),
    enabled: !!boardId,
    ...options,
  });
};

/**
 * Get single meeting
 */
export const useMeeting = (
  id: string,
  options?: Omit<UseQueryOptions<Meeting>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => meetingsApi.getMeeting(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Get upcoming meetings (for dashboard)
 */
export const useUpcomingMeetings = (
  limit: number = 5,
  options?: Omit<UseQueryOptions<{ data: MeetingListItem[]; total: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.upcoming(limit),
    queryFn: () => meetingsApi.getUpcomingMeetings(limit),
    ...options,
  });
};

/**
 * Get meetings pending confirmation (for approvers)
 */
export const usePendingConfirmations = (
  boardId?: string,
  includeCommittees?: boolean,
  options?: Omit<UseQueryOptions<{ data: MeetingListItem[]; total: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...meetingKeys.pendingConfirmation(), boardId, includeCommittees],
    queryFn: () => meetingsApi.getPendingConfirmations(boardId, includeCommittees),
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create meeting
 */
export const useCreateMeeting = (
  options?: UseMutationOptions<Meeting, Error, CreateMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) => meetingsApi.createMeeting(payload),
    onSuccess: (data) => {
      // Invalidate meeting lists
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
      if (data.requiresConfirmation && data.status === 'pending_confirmation') {
        queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      }
    },
    ...options,
  });
};

/**
 * Update meeting
 */
export const useUpdateMeeting = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, UpdateMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMeetingPayload) => meetingsApi.updateMeeting(id, payload),
    onSuccess: (data) => {
      // Invalidate specific meeting
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
      if (data.status === 'pending_confirmation') {
        queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      }
    },
    ...options,
  });
};

/**
 * Delete meeting
 */
export const useDeleteMeeting = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingsApi.deleteMeeting(id),
    onSuccess: () => {
      // Invalidate all meeting queries
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    },
    ...options,
  });
};

/**
 * Cancel meeting
 */
export const useCancelMeeting = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, CancelMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelMeetingPayload) => meetingsApi.cancelMeeting(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
    },
    ...options,
  });
};

/**
 * Reschedule meeting
 */
export const useRescheduleMeeting = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, RescheduleMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RescheduleMeetingPayload) => meetingsApi.rescheduleMeeting(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
      if (data.status === 'pending_confirmation') {
        queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      }
    },
    ...options,
  });
};

/**
 * Submit meeting for confirmation
 */
type SubmitForConfirmationPayload = { submittedBy: number; notes?: string };
type ConfirmationActionResponse = { success: boolean; data?: MeetingConfirmationHistory; message: string };

export const useSubmitForConfirmation = (
  id: string,
  options?: UseMutationOptions<ConfirmationActionResponse, Error, SubmitForConfirmationPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitForConfirmationPayload) => meetingsApi.submitForConfirmation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
    },
    ...options,
  });
};

/**
 * Confirm meeting (approve)
 */
type ConfirmMeetingPayload = { confirmedBy: number; pin: string; signatureId?: string; signatureImage?: string };

export const useConfirmMeeting = (
  id: string,
  options?: UseMutationOptions<ConfirmationActionResponse, Error, ConfirmMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfirmMeetingPayload) => meetingsApi.confirmMeeting(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
    },
    ...options,
  });
};

/**
 * Reject meeting confirmation
 */
type RejectMeetingPayload = { rejectedBy: number; reason: RejectionReason; comments?: string };

export const useRejectMeeting = (
  id: string,
  options?: UseMutationOptions<ConfirmationActionResponse, Error, RejectMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RejectMeetingPayload) => meetingsApi.rejectMeeting(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
    },
    ...options,
  });
};

/**
 * Update RSVP status
 */
export const useUpdateRSVP = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, UpdateRSVPPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRSVPPayload) => meetingsApi.updateRSVP(id, payload),
    onSuccess: () => {
      // Optimistically update meeting detail
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      // Update lists (participant count might change RSVP counts)
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
    ...options,
  });
};

/**
 * Add guest to meeting
 */
export const useAddGuest = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, AddGuestPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddGuestPayload) => meetingsApi.addGuest(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
    },
    ...options,
  });
};

/**
 * Remove guest from meeting
 */
export const useRemoveGuest = (
  id: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestId: string) => meetingsApi.removeGuest(id, guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
    ...options,
  });
};

// ============================================================================
// CONFIRMATION QUERY HOOKS
// ============================================================================

/**
 * Get confirmation history for a meeting
 */
export const useConfirmationHistory = (
  meetingId: string,
  options?: Omit<UseQueryOptions<{ data: MeetingConfirmationHistory[]; total: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.confirmationHistory(meetingId),
    queryFn: () => meetingsApi.getConfirmationHistory(meetingId),
    enabled: !!meetingId,
    ...options,
  });
};

/**
 * Get latest confirmation status for a meeting
 */
export const useConfirmationStatus = (
  meetingId: string,
  options?: Omit<UseQueryOptions<{ data: MeetingConfirmationHistory | null; message?: string }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.confirmationStatus(meetingId),
    queryFn: () => meetingsApi.getConfirmationStatus(meetingId),
    enabled: !!meetingId,
    ...options,
  });
};

/**
 * Resubmit meeting for confirmation (after rejection)
 */
type ResubmitForConfirmationPayload = { submittedBy: number; notes?: string };

export const useResubmitForConfirmation = (
  id: string,
  options?: UseMutationOptions<ConfirmationActionResponse, Error, ResubmitForConfirmationPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResubmitForConfirmationPayload) => meetingsApi.resubmitForConfirmation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.confirmationHistory(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.confirmationStatus(id) });
    },
    ...options,
  });
};
