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
  options?: Omit<UseQueryOptions<{ data: MeetingListItem[]; total: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.pendingConfirmation(),
    queryFn: () => meetingsApi.getPendingConfirmations(),
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
    onSuccess: (_, id) => {
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
export const useSubmitForConfirmation = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meetingsApi.submitForConfirmation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
    },
    ...options,
  });
};

/**
 * Confirm meeting (approve)
 */
export const useConfirmMeeting = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meetingsApi.confirmMeeting(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
    },
    ...options,
  });
};

/**
 * Reject meeting confirmation
 */
export const useRejectMeeting = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => meetingsApi.rejectMeeting(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
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
