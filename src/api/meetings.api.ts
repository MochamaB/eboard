/**
 * Meetings API
 * API functions for meeting management
 * Updated for backend integration with integer IDs
 */

import apiClient from './client';
import { safeParseResponse } from '../utils/safeParseResponse';
import { z } from 'zod';
import {
  MeetingSchema,
  MeetingListResponseSchema,
  MeetingEventSchema,
  MeetingParticipantSchema,
  type Meeting,
  type MeetingListItem,
  type MeetingFilterParams,
  type CreateMeetingPayload,
  type UpdateMeetingPayload,
  type UpdateRSVPPayload,
  type CancelMeetingPayload,
  type RescheduleMeetingPayload,
  type MeetingEvent,
  type MeetingParticipant,
} from '../types/meeting.types';
import type { PaginatedResponse } from '../types/api.types';

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

const MeetingEventsResponseSchema = z.array(MeetingEventSchema);

const ParticipantsResponseSchema = z.array(MeetingParticipantSchema);

const AllowedTransitionsResponseSchema = z.array(z.object({
  targetStatus: z.string(),
  targetSubStatus: z.string().nullable().optional(),
  label: z.string(),
  description: z.string().nullable().optional(),
  requiresReason: z.boolean(),
  requiredPermission: z.string().nullable().optional(),
}));

const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

const TransitionResultSchema = z.object({
  message: z.string(),
  status: z.string().optional(),
  subStatus: z.string().nullable().optional(),
  eventId: z.number().optional(),
});

// ============================================================================
// MEETINGS API
// ============================================================================

export const meetingsApi = {
  // ==========================================================================
  // MEETING CRUD
  // ==========================================================================

  /**
   * Get meetings for a specific board (paginated, filtered)
   */
  getBoardMeetings: async (
    boardId: number,
    params?: MeetingFilterParams
  ): Promise<PaginatedResponse<MeetingListItem>> => {
    const response = await apiClient.get(`/boards/${boardId}/meetings`, { params });
    return safeParseResponse(MeetingListResponseSchema, response.data, 'getBoardMeetings');
  },

  /**
   * Get single meeting by ID
   */
  getMeeting: async (id: number): Promise<Meeting> => {
    const response = await apiClient.get(`/meetings/${id}`);
    return safeParseResponse(MeetingSchema, response.data, 'getMeeting');
  },

  /**
   * Create new meeting
   */
  createMeeting: async (payload: CreateMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.post(`/boards/${payload.boardId}/meetings`, payload);
    return safeParseResponse(MeetingSchema, response.data, 'createMeeting');
  },

  /**
   * Update existing meeting
   */
  updateMeeting: async (id: number, payload: UpdateMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.put(`/meetings/${id}`, payload);
    return safeParseResponse(MeetingSchema, response.data, 'updateMeeting');
  },

  /**
   * Delete/cancel meeting
   */
  deleteMeeting: async (id: number, payload?: CancelMeetingPayload): Promise<void> => {
    await apiClient.delete(`/meetings/${id}`, { data: payload });
  },

  // ==========================================================================
  // PARTICIPANT MANAGEMENT
  // ==========================================================================

  /**
   * Get meeting participants
   */
  getParticipants: async (meetingId: number): Promise<MeetingParticipant[]> => {
    const response = await apiClient.get(`/meetings/${meetingId}/participants`);
    return safeParseResponse(ParticipantsResponseSchema, response.data, 'getParticipants');
  },

  /**
   * Add participant to meeting
   */
  addParticipant: async (meetingId: number, payload: {
    userId: number;
    roleId?: number;
    roleTitle?: string;
    canVote?: boolean;
    canUploadDocuments?: boolean;
    canViewDocuments?: boolean;
    canShareScreen?: boolean;
    receiveMinutes?: boolean;
    isRequired?: boolean;
    presentationTopic?: string;
    timeSlotStart?: string;
    timeSlotEnd?: string;
  }): Promise<MeetingParticipant> => {
    const response = await apiClient.post(`/meetings/${meetingId}/participants`, payload);
    return safeParseResponse(MeetingParticipantSchema, response.data, 'addParticipant');
  },

  /**
   * Update participant
   */
  updateParticipant: async (meetingId: number, participantId: number, payload: {
    roleId?: number;
    roleTitle?: string;
    canVote?: boolean;
    canUploadDocuments?: boolean;
    canViewDocuments?: boolean;
    canShareScreen?: boolean;
    receiveMinutes?: boolean;
    isRequired?: boolean;
    presentationTopic?: string;
    timeSlotStart?: string;
    timeSlotEnd?: string;
  }): Promise<void> => {
    await apiClient.put(`/meetings/${meetingId}/participants/${participantId}`, payload);
  },

  /**
   * Remove participant from meeting
   */
  removeParticipant: async (meetingId: number, participantId: number): Promise<void> => {
    await apiClient.delete(`/meetings/${meetingId}/participants/${participantId}`);
  },

  /**
   * Update RSVP status for current user
   */
  updateRSVP: async (meetingId: number, payload: UpdateRSVPPayload): Promise<{ message: string; rsvpStatus: string }> => {
    const response = await apiClient.put(`/meetings/${meetingId}/rsvp`, {
      rsvpStatus: payload.rsvpStatus,
      note: (payload as { note?: string }).note,
    });
    return response.data;
  },

  // ==========================================================================
  // STATUS TRANSITIONS
  // ==========================================================================

  /**
   * Get allowed status transitions for a meeting
   */
  getAllowedTransitions: async (meetingId: number): Promise<Array<{
    targetStatus: string;
    targetSubStatus?: string | null;
    label: string;
    description?: string | null;
    requiresReason: boolean;
    requiredPermission?: string | null;
  }>> => {
    const response = await apiClient.get(`/meetings/${meetingId}/allowed-transitions`);
    return safeParseResponse(AllowedTransitionsResponseSchema, response.data, 'getAllowedTransitions');
  },

  /**
   * Transition meeting to a new status
   */
  transitionMeeting: async (meetingId: number, payload: {
    targetStatus: string;
    targetSubStatus?: string | null;
    reason?: string;
  }): Promise<{ message: string; status?: string; subStatus?: string | null; eventId?: number }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/transition`, payload);
    return safeParseResponse(TransitionResultSchema, response.data, 'transitionMeeting');
  },

  /**
   * Validate meeting configuration
   */
  validateMeeting: async (meetingId: number): Promise<{
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  }> => {
    const response = await apiClient.get(`/meetings/${meetingId}/validate`);
    return safeParseResponse(ValidationResultSchema, response.data, 'validateMeeting');
  },

  // ==========================================================================
  // MEETING EVENTS (AUDIT TRAIL)
  // ==========================================================================

  /**
   * Get meeting event history (audit trail)
   */
  getMeetingEvents: async (meetingId: number): Promise<MeetingEvent[]> => {
    const response = await apiClient.get(`/meetings/${meetingId}/events`);
    return safeParseResponse(MeetingEventsResponseSchema, response.data, 'getMeetingEvents');
  },

  // ==========================================================================
  // LEGACY METHODS (for backwards compatibility with existing hooks)
  // ==========================================================================

  /**
   * @deprecated Use getBoardMeetings instead
   */
  getMeetings: async (params?: MeetingFilterParams): Promise<PaginatedResponse<MeetingListItem>> => {
    if (!params?.boardId) {
      console.warn('getMeetings: boardId is required. Use getBoardMeetings instead.');
      return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
    return meetingsApi.getBoardMeetings(params.boardId, params);
  },

  /**
   * Cancel meeting
   */
  cancelMeeting: async (id: number, payload: CancelMeetingPayload): Promise<void> => {
    // Use the transition endpoint to cancel
    await meetingsApi.transitionMeeting(id, {
      targetStatus: 'cancelled',
      targetSubStatus: null,
      reason: payload.reason,
    });
  },

  /**
   * Reschedule meeting (update date/time)
   */
  rescheduleMeeting: async (id: number, payload: RescheduleMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.put(`/meetings/${id}`, {
      startDate: payload.startDate,
      startTime: payload.startTime,
      duration: payload.duration,
    });
    return safeParseResponse(MeetingSchema, response.data, 'rescheduleMeeting');
  },

  /**
   * @deprecated Use addParticipant instead
   */
  addGuest: async (id: number, payload: {
    name: string;
    email: string;
    guestRole: string;
    timeSlotStart?: string;
    timeSlotEnd?: string;
    presentationTopic?: string;
    canViewDocuments?: boolean;
    canShareScreen?: boolean;
    receiveMinutes?: boolean;
  }): Promise<Meeting> => {
    // This would need a user ID - for now, return current meeting
    console.warn('addGuest: This method needs to be updated to work with the new participant system');
    return meetingsApi.getMeeting(id);
  },

  /**
   * @deprecated Use removeParticipant instead
   */
  removeGuest: async (meetingId: number, guestId: number): Promise<void> => {
    await meetingsApi.removeParticipant(meetingId, guestId);
  },

  /**
   * Get upcoming meetings (for dashboard) - requires backend endpoint
   */
  getUpcomingMeetings: async (_limit: number = 5): Promise<{ data: MeetingListItem[]; total: number }> => {
    // This endpoint needs to be added to the backend
    console.warn('getUpcomingMeetings: This endpoint is not yet implemented on the backend');
    return { data: [], total: 0 };
  },

  /**
   * Get meetings pending confirmation
   */
  getPendingConfirmations: async (
    boardId?: number,
    includeCommittees?: boolean
  ): Promise<{ data: MeetingListItem[]; total: number }> => {
    if (!boardId) {
      return { data: [], total: 0 };
    }
    // Use getBoardMeetings with pendingConfirmation filter
    const result = await meetingsApi.getBoardMeetings(boardId, {
      pendingConfirmation: true,
      includeCommittees,
    });
    return { data: result.data, total: result.total };
  },

  /**
   * Archive a completed meeting
   */
  archiveMeeting: async (meetingId: number): Promise<Meeting> => {
    // Use transition endpoint
    await meetingsApi.transitionMeeting(meetingId, {
      targetStatus: 'completed',
      targetSubStatus: 'archived',
    });
    return meetingsApi.getMeeting(meetingId);
  },

  /**
   * Generic status transition - wrapper for transitionMeeting
   */
  transitionMeetingStatus: async (
    meetingId: number,
    payload: { status: string; subStatus?: string; reason?: string }
  ): Promise<Meeting> => {
    await meetingsApi.transitionMeeting(meetingId, {
      targetStatus: payload.status,
      targetSubStatus: payload.subStatus || null,
      reason: payload.reason,
    });
    return meetingsApi.getMeeting(meetingId);
  },

  /**
   * Download meeting notice as PDF - requires backend endpoint
   */
  downloadNoticePDF: async (_meetingId: number): Promise<Blob> => {
    console.warn('downloadNoticePDF: This endpoint is not yet implemented on the backend');
    return new Blob();
  },

  // Approval workflow methods (for backwards compatibility)
  getLatestApprovalEvent: async (meetingId: number): Promise<{ data: MeetingEvent | null; message?: string }> => {
    const events = await meetingsApi.getMeetingEvents(meetingId);
    const approvalEvents = events.filter(e =>
      e.eventType === 'approved' ||
      e.eventType === 'rejected' ||
      e.eventType === 'submitted_for_approval'
    );
    return { data: approvalEvents[0] || null };
  },

  submitForApproval: async (
    meetingId: number,
    _payload: { submittedBy: number; notes?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    try {
      await meetingsApi.transitionMeeting(meetingId, {
        targetStatus: 'scheduled',
        targetSubStatus: 'pending_approval',
      });
      return { success: true, message: 'Meeting submitted for approval' };
    } catch (error: unknown) {
      const err = error as Error;
      return { success: false, message: err.message || 'Failed to submit for approval' };
    }
  },

  approveMeeting: async (
    meetingId: number,
    _payload: { approvedBy: number; pin: string; signatureId?: string; signatureImage?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    try {
      await meetingsApi.transitionMeeting(meetingId, {
        targetStatus: 'scheduled',
        targetSubStatus: 'approved',
      });
      return { success: true, message: 'Meeting approved' };
    } catch (error: unknown) {
      const err = error as Error;
      return { success: false, message: err.message || 'Failed to approve meeting' };
    }
  },

  rejectMeeting: async (
    meetingId: number,
    payload: { rejectedBy: number; reason: string; comments?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    try {
      await meetingsApi.transitionMeeting(meetingId, {
        targetStatus: 'scheduled',
        targetSubStatus: 'rejected',
        reason: payload.comments || payload.reason,
      });
      return { success: true, message: 'Meeting rejected' };
    } catch (error: unknown) {
      const err = error as Error;
      return { success: false, message: err.message || 'Failed to reject meeting' };
    }
  },

  resubmitForApproval: async (
    meetingId: number,
    _payload: { submittedBy: number; notes?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    try {
      await meetingsApi.transitionMeeting(meetingId, {
        targetStatus: 'scheduled',
        targetSubStatus: 'pending_approval',
      });
      return { success: true, message: 'Meeting resubmitted for approval' };
    } catch (error: unknown) {
      const err = error as Error;
      return { success: false, message: err.message || 'Failed to resubmit for approval' };
    }
  },
};

export default meetingsApi;
