/**
 * Meetings API
 * API functions for meeting management
 */

import apiClient from './client';
import { safeParseResponse } from '../utils/safeParseResponse';
import { z } from 'zod';
import {
  MeetingSchema,
  MeetingListItemSchema,
  MeetingListResponseSchema,
  MeetingEventSchema,
  type Meeting,
  type MeetingListItem,
  type MeetingFilterParams,
  type CreateMeetingPayload,
  type UpdateMeetingPayload,
  type AddGuestPayload,
  type UpdateRSVPPayload,
  type CancelMeetingPayload,
  type RescheduleMeetingPayload,
  type MeetingEvent,
  type MeetingStatus,
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

const MeetingEventsResponseSchema = z.object({
  data: z.array(MeetingEventSchema),
  total: z.number(),
});

const LatestEventResponseSchema = z.object({
  data: MeetingEventSchema.nullable(),
  message: z.string().optional(),
});

const ApprovalActionResponseSchema = z.object({
  success: z.boolean(),
  data: MeetingEventSchema.optional(),
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
    return safeParseResponse(MeetingListResponseSchema, response.data, 'getMeetings');
  },

  /**
   * Get meetings for a specific board (including committees if specified)
   */
  getBoardMeetings: async (
    boardId: string,
    params?: { includeCommittees?: boolean; page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<MeetingListItem>> => {
    const response = await apiClient.get(`/boards/${boardId}/meetings`, { params });
    return safeParseResponse(MeetingListResponseSchema, response.data, 'getBoardMeetings');
  },

  /**
   * Get single meeting by ID
   */
  getMeeting: async (id: string): Promise<Meeting> => {
    const response = await apiClient.get(`/meetings/${id}`);
    return safeParseResponse(MeetingSchema, response.data, 'getMeeting');
  },

  /**
   * Create new meeting
   */
  createMeeting: async (payload: CreateMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.post('/meetings', payload);
    return safeParseResponse(MeetingSchema, response.data, 'createMeeting');
  },

  /**
   * Update existing meeting
   */
  updateMeeting: async (id: string, payload: UpdateMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.put(`/meetings/${id}`, payload);
    return safeParseResponse(MeetingSchema, response.data, 'updateMeeting');
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
    return safeParseResponse(MeetingSchema, response.data, 'cancelMeeting');
  },

  /**
   * Reschedule meeting
   */
  rescheduleMeeting: async (id: string, payload: RescheduleMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/reschedule`, payload);
    return safeParseResponse(MeetingSchema, response.data, 'rescheduleMeeting');
  },

  // ==========================================================================
  // PARTICIPANT MANAGEMENT
  // ==========================================================================

  /**
   * Update RSVP status
   */
  updateRSVP: async (id: string, payload: UpdateRSVPPayload): Promise<Meeting> => {
    const response = await apiClient.put(`/meetings/${id}/rsvp`, payload);
    return safeParseResponse(MeetingSchema, response.data, 'updateRSVP');
  },

  /**
   * Add guest/presenter to meeting
   */
  addGuest: async (id: string, payload: AddGuestPayload): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/guests`, payload);
    return safeParseResponse(MeetingSchema, response.data, 'addGuest');
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
    return safeParseResponse(UpcomingMeetingsResponseSchema, response.data, 'getUpcomingMeetings');
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
    return safeParseResponse(UpcomingMeetingsResponseSchema, response.data, 'getPendingConfirmations');
  },

  // ==========================================================================
  // APPROVAL WORKFLOW
  // ==========================================================================

  /**
   * Get all meeting events (audit trail)
   */
  getMeetingEvents: async (meetingId: string): Promise<{ data: MeetingEvent[]; total: number }> => {
    const response = await apiClient.get(`/meetings/${meetingId}/events`);
    return safeParseResponse(MeetingEventsResponseSchema, response.data, 'getMeetingEvents');
  },

  /**
   * Get latest approval event for a meeting
   */
  getLatestApprovalEvent: async (meetingId: string): Promise<{ data: MeetingEvent | null; message?: string }> => {
    const response = await apiClient.get(`/meetings/${meetingId}/latest-approval-event`);
    return safeParseResponse(LatestEventResponseSchema, response.data, 'getLatestApprovalEvent');
  },

  /**
   * Submit meeting for approval
   */
  submitForApproval: async (
    meetingId: string, 
    payload: { submittedBy: number; notes?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/submit-for-approval`, payload);
    return safeParseResponse(ApprovalActionResponseSchema, response.data, 'submitForApproval');
  },

  /**
   * Approve a meeting
   */
  approveMeeting: async (
    meetingId: string,
    payload: { approvedBy: number; pin: string; signatureId?: string; signatureImage?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/approve`, payload);
    return safeParseResponse(ApprovalActionResponseSchema, response.data, 'approveMeeting');
  },

  /**
   * Reject a meeting
   */
  rejectMeeting: async (
    meetingId: string,
    payload: { rejectedBy: number; reason: RejectionReason; comments?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/reject`, payload);
    return safeParseResponse(ApprovalActionResponseSchema, response.data, 'rejectMeeting');
  },

  /**
   * Resubmit meeting for approval (after rejection)
   */
  resubmitForApproval: async (
    meetingId: string,
    payload: { submittedBy: number; notes?: string }
  ): Promise<{ success: boolean; data?: MeetingEvent; message: string }> => {
    const response = await apiClient.post(`/meetings/${meetingId}/resubmit-for-approval`, payload);
    return safeParseResponse(ApprovalActionResponseSchema, response.data, 'resubmitForApproval');
  },

  /**
   * Archive a completed meeting (completed.recent → completed.archived)
   */
  archiveMeeting: async (meetingId: string): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${meetingId}/archive`);
    return safeParseResponse(MeetingSchema, response.data, 'archiveMeeting');
  },

  /**
   * Generic status transition (start, end, etc.)
   */
  transitionMeetingStatus: async (
    meetingId: string,
    payload: { status: MeetingStatus; subStatus?: string; reason?: string }
  ): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${meetingId}/transition`, payload);
    return safeParseResponse(MeetingSchema, response.data, 'transitionMeetingStatus');
  },

  /**
   * Download meeting notice as PDF
   */
  downloadNoticePDF: async (meetingId: string): Promise<Blob> => {
    const response = await apiClient.get(`/meetings/${meetingId}/notice/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default meetingsApi;
