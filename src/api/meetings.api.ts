/**
 * Meetings API
 * API functions for meeting management
 */

import apiClient from './client';
import { z } from 'zod';
import {
  MeetingSchema,
  MeetingListItemSchema,
  MeetingListResponseSchema,
  MeetingConfirmationHistorySchema,
  type Meeting,
  type MeetingListItem,
  type MeetingFilterParams,
  type CreateMeetingPayload,
  type UpdateMeetingPayload,
  type AddGuestPayload,
  type UpdateRSVPPayload,
  type CancelMeetingPayload,
  type RescheduleMeetingPayload,
  type MeetingConfirmationHistory,
  type RejectionReason,
} from '../types/meeting.types';
import type { PaginatedResponse } from '../types/api.types';

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

const UpcomingMeetingsResponseSchema = z.object({
  data: z.array(MeetingListItemSchema),
  total: z.number(),
});

const ConfirmationHistoryResponseSchema = z.object({
  data: z.array(MeetingConfirmationHistorySchema),
  total: z.number(),
});

const ConfirmationStatusResponseSchema = z.object({
  data: MeetingConfirmationHistorySchema.nullable(),
  message: z.string().optional(),
});

const ConfirmationActionResponseSchema = z.object({
  success: z.boolean(),
  data: MeetingConfirmationHistorySchema.optional(),
  message: z.string(),
});

// ============================================================================
// MEETINGS API
// ============================================================================

export const meetingsApi = {
  // ==========================================================================
  // MEETING CRUD
  // ==========================================================================

  /**
   * Get meetings with filters
   */
  getMeetings: async (params?: MeetingFilterParams): Promise<PaginatedResponse<MeetingListItem>> => {
    const response = await apiClient.get('/meetings', { params });
    return MeetingListResponseSchema.parse(response.data);
  },

  /**
   * Get meetings for a specific board (including committees if specified)
   */
  getBoardMeetings: async (
    boardId: string,
    params?: { includeCommittees?: boolean; page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<MeetingListItem>> => {
    const response = await apiClient.get(`/boards/${boardId}/meetings`, { params });
    return MeetingListResponseSchema.parse(response.data);
  },

  /**
   * Get single meeting by ID
   */
  getMeeting: async (id: string): Promise<Meeting> => {
    const response = await apiClient.get(`/meetings/${id}`);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Create new meeting
   */
  createMeeting: async (payload: CreateMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.post('/meetings', payload);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Update existing meeting
   */
  updateMeeting: async (id: string, payload: UpdateMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.put(`/meetings/${id}`, payload);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Delete meeting
   */
  deleteMeeting: async (id: string): Promise<void> => {
    await apiClient.delete(`/meetings/${id}`);
  },

  // ==========================================================================
  // MEETING STATUS WORKFLOW
  // ==========================================================================

  /**
   * Cancel meeting
   */
  cancelMeeting: async (id: string, payload: CancelMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/cancel`, payload);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Reschedule meeting
   */
  rescheduleMeeting: async (id: string, payload: RescheduleMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/reschedule`, payload);
    return MeetingSchema.parse(response.data);
  },

  // ==========================================================================
  // PARTICIPANT MANAGEMENT
  // ==========================================================================

  /**
   * Update RSVP status
   */
  updateRSVP: async (id: string, payload: UpdateRSVPPayload): Promise<Meeting> => {
    const response = await apiClient.put(`/meetings/${id}/rsvp`, payload);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Add guest/presenter to meeting
   */
  addGuest: async (id: string, payload: AddGuestPayload): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/guests`, payload);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Remove guest from meeting
   */
  removeGuest: async (id: string, guestId: string): Promise<void> => {
    await apiClient.delete(`/meetings/${id}/guests/${guestId}`);
  },

  // ==========================================================================
  // SPECIALIZED QUERIES
  // ==========================================================================

  /**
   * Get upcoming meetings (for dashboard)
   */
  getUpcomingMeetings: async (limit: number = 5): Promise<{ data: MeetingListItem[]; total: number }> => {
    const response = await apiClient.get('/meetings/upcoming', { params: { limit } });
    return UpcomingMeetingsResponseSchema.parse(response.data);
  },

  /**
   * Get meetings pending confirmation (for approvers)
   */
  getPendingConfirmations: async (
    boardId?: string,
    includeCommittees?: boolean
  ): Promise<{ data: MeetingListItem[]; total: number }> => {
    const params: Record<string, string> = {};
    if (boardId) params.boardId = boardId;
    if (includeCommittees) params.includeCommittees = 'true';
    
    const response = await apiClient.get('/meetings/pending-confirmation', { params });
    return UpcomingMeetingsResponseSchema.parse(response.data);
  },

  // ==========================================================================
  // CONFIRMATION WORKFLOW
  // ==========================================================================

  /**
   * Get confirmation history for a meeting
   */
  getConfirmationHistory: async (meetingId: string): Promise<{ data: MeetingConfirmationHistory[]; total: number }> => {
    const response = await apiClient.get(`/meetings/${meetingId}/confirmation-history`);
    return ConfirmationHistoryResponseSchema.parse(response.data);
  },

  /**
   * Get latest confirmation status for a meeting
   */
  getConfirmationStatus: async (meetingId: string): Promise<{ data: MeetingConfirmationHistory | null; message?: string }> => {
    const response = await apiClient.get(`/meetings/${meetingId}/confirmation-status`);
    return ConfirmationStatusResponseSchema.parse(response.data);
  },

  /**
   * Submit meeting for confirmation
   */
  submitForConfirmation: async (
    meetingId: string, 
    payload: { submittedBy: number; notes?: string }
  ): Promise<{ success: boolean; data?: MeetingConfirmationHistory; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/submit-for-confirmation`, payload);
    return ConfirmationActionResponseSchema.parse(response.data);
  },

  /**
   * Confirm (approve) a meeting
   */
  confirmMeeting: async (
    meetingId: string,
    payload: { confirmedBy: number; pin: string; signatureId?: string; signatureImage?: string }
  ): Promise<{ success: boolean; data?: MeetingConfirmationHistory; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/confirm`, payload);
    return ConfirmationActionResponseSchema.parse(response.data);
  },

  /**
   * Reject a meeting confirmation
   */
  rejectMeeting: async (
    meetingId: string,
    payload: { rejectedBy: number; reason: RejectionReason; comments?: string }
  ): Promise<{ success: boolean; data?: MeetingConfirmationHistory; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/reject`, payload);
    return ConfirmationActionResponseSchema.parse(response.data);
  },

  /**
   * Resubmit meeting for confirmation (after rejection)
   */
  resubmitForConfirmation: async (
    meetingId: string,
    payload: { submittedBy: number; notes?: string }
  ): Promise<{ success: boolean; data?: MeetingConfirmationHistory; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/resubmit-for-confirmation`, payload);
    return ConfirmationActionResponseSchema.parse(response.data);
  },
};

export default meetingsApi;
