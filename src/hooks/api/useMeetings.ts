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
  MeetingStatus,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  AddGuestPayload,
  UpdateRSVPPayload,
  CancelMeetingPayload,
  RescheduleMeetingPayload,
  MeetingEvent,
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
  meetingEvents: (id: string) => [...meetingKeys.all, 'events', id] as const,
  latestApprovalEvent: (id: string) => [...meetingKeys.all, 'latest-approval-event', id] as const,
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
      if (data.requiresConfirmation && data.status === 'scheduled' && data.subStatus === 'pending_approval') {
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
      if (data.status === 'scheduled' && data.subStatus === 'pending_approval') {
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
      if (data.status === 'scheduled' && data.subStatus === 'pending_approval') {
        queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      }
    },
    ...options,
  });
};

/**
 * Submit meeting for approval
 */
type SubmitForApprovalPayload = { submittedBy: number; notes?: string };
type ApprovalActionResponse = { success: boolean; data?: MeetingEvent; message: string };

export const useSubmitForApproval = (
  id: string,
  options?: UseMutationOptions<ApprovalActionResponse, Error, SubmitForApprovalPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitForApprovalPayload) => meetingsApi.submitForApproval(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.meetingEvents(id) });
    },
    ...options,
  });
};

/**
 * Approve meeting
 */
type ApproveMeetingPayload = { approvedBy: number; pin: string; signatureId?: string; signatureImage?: string };

export const useApproveMeeting = (
  id: string,
  options?: UseMutationOptions<ApprovalActionResponse, Error, ApproveMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApproveMeetingPayload) => meetingsApi.approveMeeting(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.meetingEvents(id) });
    },
    ...options,
  });
};

/**
 * Reject meeting
 */
type RejectMeetingPayload = { rejectedBy: number; reason: RejectionReason; comments?: string };

export const useRejectMeeting = (
  id: string,
  options?: UseMutationOptions<ApprovalActionResponse, Error, RejectMeetingPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RejectMeetingPayload) => meetingsApi.rejectMeeting(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.meetingEvents(id) });
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
 * Get all meeting events (audit trail)
 */
export const useMeetingEvents = (
  meetingId: string,
  options?: Omit<UseQueryOptions<{ data: MeetingEvent[]; total: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.meetingEvents(meetingId),
    queryFn: () => meetingsApi.getMeetingEvents(meetingId),
    enabled: !!meetingId,
    ...options,
  });
};

/**
 * Get latest approval event for a meeting
 */
export const useLatestApprovalEvent = (
  meetingId: string,
  options?: Omit<UseQueryOptions<{ data: MeetingEvent | null; message?: string }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: meetingKeys.latestApprovalEvent(meetingId),
    queryFn: () => meetingsApi.getLatestApprovalEvent(meetingId),
    enabled: !!meetingId,
    ...options,
  });
};

/**
 * Resubmit meeting for approval (after rejection)
 */
type ResubmitForApprovalPayload = { submittedBy: number; notes?: string };

export const useResubmitForApproval = (
  id: string,
  options?: UseMutationOptions<ApprovalActionResponse, Error, ResubmitForApprovalPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResubmitForApprovalPayload) => meetingsApi.resubmitForApproval(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.pendingConfirmation() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.meetingEvents(id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.latestApprovalEvent(id) });
    },
    ...options,
  });
};

// ============================================================================
// DOCUMENT EXPORT HOOKS
// ============================================================================

/**
 * Download meeting notice as PDF
 */
export const useDownloadNoticePDF = (
  options?: UseMutationOptions<Blob, Error, string>
) => {
  return useMutation({
    mutationFn: (meetingId: string) => meetingsApi.downloadNoticePDF(meetingId),
    ...options,
  });
};

// ============================================================================
// LIFECYCLE TRANSITION HOOKS
// ============================================================================

/**
 * Archive a completed meeting (completed.recent → completed.archived).
 * Uses refetchQueries (not invalidateQueries) because the detail page is
 * mounted and must show the updated status immediately — with 5-min staleTime,
 * invalidateQueries would not trigger a visible UI update.
 */
export const useArchiveMeeting = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meetingsApi.archiveMeeting(id),
    onSuccess: async (data) => {
      // Refetch detail immediately — status must update in the mounted detail page
      await queryClient.refetchQueries({ queryKey: meetingKeys.detail(id) });
      // Lazily invalidate lists (not actively mounted, eventual consistency is fine)
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
    },
    ...options,
  });
};

/**
 * Generic status transition: Start Meeting (→ in_progress), End Meeting (→ completed.recent), etc.
 * Uses refetchQueries on the detail query because these transitions happen while
 * the user is on the detail page and the new status must be visible immediately.
 */
type TransitionPayload = { status: MeetingStatus; subStatus?: string; reason?: string };

export const useTransitionMeetingStatus = (
  id: string,
  options?: UseMutationOptions<Meeting, Error, TransitionPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransitionPayload) => meetingsApi.transitionMeetingStatus(id, payload),
    onSuccess: async (data) => {
      // Refetch detail immediately — user is on the detail page watching the status change
      await queryClient.refetchQueries({ queryKey: meetingKeys.detail(id) });
      await queryClient.refetchQueries({ queryKey: meetingKeys.meetingEvents(id) });
      // Lazily invalidate lists and upcoming — not actively mounted
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.boardMeetings(data.boardId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.upcoming() });
    },
    ...options,
  });
};
