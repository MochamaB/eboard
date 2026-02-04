/**
 * Resolutions API Handlers - MSW Request Handlers
 * Mock API endpoints for board resolutions management
 */

import { http, HttpResponse } from 'msw';
import {
  getResolutionById,
  getResolutionsByMeetingId,
  getResolutionsByBoardId,
  getAllResolutions,
  getResolutionsRequiringFollowUp,
  getOverdueResolutions,
  createResolution,
  updateResolution,
  updateImplementationStatus,
  deleteResolution,
  generateResolutionNumber,
  getResolutionsStats,
} from '../db/queries/resolutionsQueries';
import type {
  CreateResolutionPayload,
  UpdateResolutionPayload,
  UpdateImplementationStatusPayload,
} from '../../types/resolutions.types';

const API_BASE = '/api';

export const resolutionsHandlers = [
  // ========================================================================
  // RESOLUTIONS ENDPOINTS
  // ========================================================================

  /**
   * GET /api/resolutions/:resolutionId
   * Get specific resolution by ID
   */
  http.get(`${API_BASE}/resolutions/:resolutionId`, ({ params }) => {
    try {
      const { resolutionId } = params;
      const resolution = getResolutionById(resolutionId as string);

      if (!resolution) {
        return HttpResponse.json(
          { success: false, message: 'Resolution not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: resolution,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch resolution' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/meetings/:meetingId/resolutions
   * Get all resolutions for a meeting
   */
  http.get(`${API_BASE}/meetings/:meetingId/resolutions`, ({ params }) => {
    try {
      const { meetingId } = params;
      const resolutions = getResolutionsByMeetingId(meetingId as string);

      return HttpResponse.json({
        success: true,
        data: resolutions,
        total: resolutions.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch resolutions' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/boards/:boardId/resolutions
   * Get all resolutions for a board
   */
  http.get(`${API_BASE}/boards/:boardId/resolutions`, ({ params }) => {
    try {
      const { boardId } = params;
      const resolutions = getResolutionsByBoardId(boardId as string);

      return HttpResponse.json({
        success: true,
        data: resolutions,
        total: resolutions.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch resolutions' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/resolutions
   * Get all resolutions with optional filters
   */
  http.get(`${API_BASE}/resolutions`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const meetingId = url.searchParams.get('meetingId');
      const boardId = url.searchParams.get('boardId');
      const decision = url.searchParams.get('decision') as any;
      const category = url.searchParams.get('category') as any;
      const requiresFollowUp = url.searchParams.get('requiresFollowUp');
      const implementationStatus = url.searchParams.get('implementationStatus') as any;
      const dateFrom = url.searchParams.get('dateFrom');
      const dateTo = url.searchParams.get('dateTo');

      const filters: any = {};
      if (meetingId) filters.meetingId = meetingId;
      if (boardId) filters.boardId = boardId;
      if (decision) filters.decision = decision;
      if (category) filters.category = category;
      if (requiresFollowUp !== null) filters.requiresFollowUp = requiresFollowUp === 'true';
      if (implementationStatus) filters.implementationStatus = implementationStatus;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const resolutions = getAllResolutions(filters);

      return HttpResponse.json({
        success: true,
        data: resolutions,
        total: resolutions.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch resolutions' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/resolutions/follow-up
   * Get resolutions requiring follow-up
   */
  http.get(`${API_BASE}/resolutions/follow-up`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');
      
      const resolutions = getResolutionsRequiringFollowUp(
        boardId || undefined
      );

      return HttpResponse.json({
        success: true,
        data: resolutions,
        total: resolutions.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch resolutions requiring follow-up' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/resolutions/overdue
   * Get overdue resolutions
   */
  http.get(`${API_BASE}/resolutions/overdue`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');
      
      const resolutions = getOverdueResolutions(
        boardId || undefined
      );

      return HttpResponse.json({
        success: true,
        data: resolutions,
        total: resolutions.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch overdue resolutions' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/boards/:boardId/resolutions/stats
   * Get resolutions statistics for a board
   */
  http.get(`${API_BASE}/boards/:boardId/resolutions/stats`, ({ params }) => {
    try {
      const { boardId } = params;
      const stats = getResolutionsStats(boardId as string);

      return HttpResponse.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch resolutions stats' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/boards/:boardId/resolutions/next-number
   * Generate next resolution number for a board
   */
  http.get(`${API_BASE}/boards/:boardId/resolutions/next-number`, ({ params, request }) => {
    try {
      const { boardId } = params;
      const url = new URL(request.url);
      const year = url.searchParams.get('year');
      
      const resolutionNumber = generateResolutionNumber(
        boardId as string,
        year ? parseInt(year) : undefined
      );

      return HttpResponse.json({
        success: true,
        data: { resolutionNumber },
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to generate resolution number' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/resolutions
   * Create new resolution
   */
  http.post(`${API_BASE}/resolutions`, async ({ request }) => {
    try {
      const payload = (await request.json()) as CreateResolutionPayload;

      const resolution = createResolution({
        meetingId: payload.meetingId,
        boardId: payload.boardId,
        resolutionNumber: payload.resolutionNumber,
        title: payload.title,
        text: payload.text,
        category: payload.category,
        decision: payload.decision,
        decisionDate: payload.decisionDate,
        voteId: payload.voteId,
        voteSummary: payload.voteSummary,
        agendaItemId: payload.agendaItemId,
        relatedDocumentIds: payload.relatedDocumentIds,
        requiresFollowUp: payload.requiresFollowUp,
        followUpDeadline: payload.followUpDeadline,
        followUpNotes: payload.followUpNotes,
        createdBy: 1, // TODO: Get from auth context
      });

      return HttpResponse.json({
        success: true,
        data: resolution,
        message: 'Resolution created successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create resolution' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/resolutions/:resolutionId
   * Update resolution
   */
  http.put(`${API_BASE}/resolutions/:resolutionId`, async ({ params, request }) => {
    try {
      const { resolutionId } = params;
      const payload = (await request.json()) as UpdateResolutionPayload;

      const resolution = updateResolution(resolutionId as string, {
        title: payload.title,
        text: payload.text,
        category: payload.category,
        decision: payload.decision,
        voteSummary: payload.voteSummary,
        relatedDocumentIds: payload.relatedDocumentIds,
        requiresFollowUp: payload.requiresFollowUp,
        followUpDeadline: payload.followUpDeadline,
        followUpNotes: payload.followUpNotes,
      });

      if (!resolution) {
        return HttpResponse.json(
          { success: false, message: 'Resolution not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: resolution,
        message: 'Resolution updated successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update resolution' },
        { status: 500 }
      );
    }
  }),

  /**
   * PATCH /api/resolutions/:resolutionId/implementation-status
   * Update resolution implementation status
   */
  http.patch(`${API_BASE}/resolutions/:resolutionId/implementation-status`, async ({ params, request }) => {
    try {
      const { resolutionId } = params;
      const payload = (await request.json()) as UpdateImplementationStatusPayload;

      const resolution = updateImplementationStatus(
        resolutionId as string,
        payload.implementationStatus,
        payload.implementedAt
      );

      if (!resolution) {
        return HttpResponse.json(
          { success: false, message: 'Resolution not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: resolution,
        message: 'Implementation status updated',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update implementation status' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/resolutions/:resolutionId
   * Delete resolution
   */
  http.delete(`${API_BASE}/resolutions/:resolutionId`, ({ params }) => {
    try {
      const { resolutionId } = params;
      const success = deleteResolution(resolutionId as string);

      if (!success) {
        return HttpResponse.json(
          { success: false, message: 'Resolution not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'Resolution deleted successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete resolution' },
        { status: 500 }
      );
    }
  }),
];
