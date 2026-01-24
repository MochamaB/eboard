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
  type Meeting,
  type MeetingListItem,
  type MeetingFilterParams,
  type CreateMeetingPayload,
  type UpdateMeetingPayload,
  type AddGuestPayload,
  type UpdateRSVPPayload,
  type CancelMeetingPayload,
  type RescheduleMeetingPayload,
} from '../types/meeting.types';
import type { PaginatedResponse } from '../types/api.types';

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

const UpcomingMeetingsResponseSchema = z.object({
  data: z.array(MeetingListItemSchema),
  total: z.number(),
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

  /**
   * Submit meeting for confirmation
   */
  submitForConfirmation: async (id: string): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/submit-for-confirmation`);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Confirm meeting (approve)
   */
  confirmMeeting: async (id: string): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/confirm`);
    return MeetingSchema.parse(response.data);
  },

  /**
   * Reject meeting confirmation
   */
  rejectMeeting: async (id: string, reason: string): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/reject`, { reason });
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
  getPendingConfirmations: async (): Promise<{ data: MeetingListItem[]; total: number }> => {
    const response = await apiClient.get('/meetings/pending-confirmation');
    return UpcomingMeetingsResponseSchema.parse(response.data);
  },
};

export default meetingsApi;
