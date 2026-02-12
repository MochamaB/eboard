/**
 * Minutes API Handlers - MSW Request Handlers
 * Mock API endpoints for meeting minutes management
 */

import { http, HttpResponse } from 'msw';
import {
  getMinutesByMeetingId,
  getMinutesById,
  getAllMinutes,
  getMinutesPendingApproval,
  createMinutes,
  updateMinutes,
  submitMinutesForReview,
  approveMinutes,
  requestMinutesRevision,
  publishMinutes,
  deleteMinutes,
  getCommentsByMinutesId,
  getCommentById,
  addComment,
  resolveComment,
  deleteComment,
  getSignaturesByMinutesId,
  addSignature,
} from '../db/queries/minutesQueries';
import type {
  CreateMinutesPayload,
  UpdateMinutesPayload,
  SubmitMinutesPayload,
  ApproveMinutesPayload,
  RequestRevisionPayload,
  PublishMinutesPayload,
  AddCommentPayload,
  ResolveCommentPayload,
  AddSignaturePayload,
} from '../../types/minutes.types';

const API_BASE = '/api';

export const minutesHandlers = [
  // ========================================================================
  // MINUTES ENDPOINTS
  // ========================================================================

  /**
   * GET /api/meetings/:meetingId/minutes
   * Get minutes for a specific meeting
   */
  http.get(`${API_BASE}/meetings/:meetingId/minutes`, ({ params }) => {
    try {
      const { meetingId } = params;
      const minutes = getMinutesByMeetingId(meetingId as string);

      if (!minutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found for this meeting' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: minutes,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/minutes/:minutesId
   * Get specific minutes by ID
   */
  http.get(`${API_BASE}/minutes/:minutesId`, ({ params }) => {
    try {
      const { minutesId } = params;
      const minutes = getMinutesById(minutesId as string);

      if (!minutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: minutes,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/minutes
   * Get all minutes with optional filters
   */
  http.get(`${API_BASE}/minutes`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const status = url.searchParams.get('status') as any;
      const boardId = url.searchParams.get('boardId');
      const createdBy = url.searchParams.get('createdBy');

      const filters: any = {};
      if (status) filters.status = status;
      if (boardId) filters.boardId = boardId;
      if (createdBy) filters.createdBy = parseInt(createdBy);

      const minutes = getAllMinutes(filters);

      return HttpResponse.json({
        success: true,
        data: minutes,
        total: minutes.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/minutes/pending-approval
   * Get minutes pending approval
   */
  http.get(`${API_BASE}/minutes/pending-approval`, () => {
    try {
      const minutes = getMinutesPendingApproval();

      return HttpResponse.json({
        success: true,
        data: minutes,
        total: minutes.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch pending minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/meetings/:meetingId/minutes
   * Create new minutes for a meeting
   */
  http.post(`${API_BASE}/meetings/:meetingId/minutes`, async ({ params, request }) => {
    try {
      const { meetingId } = params;
      const payload = (await request.json()) as CreateMinutesPayload;

      // Check if minutes already exist
      const existingMinutes = getMinutesByMeetingId(meetingId as string);
      if (existingMinutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes already exist for this meeting' },
          { status: 400 }
        );
      }

      const minutes = createMinutes({
        meetingId: meetingId as string,
        content: payload.content,
        templateId: payload.templateId,
        createdBy: 1, // TODO: Get from auth context
      });

      return HttpResponse.json({
        success: true,
        data: minutes,
        message: 'Minutes created successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/minutes/:minutesId
   * Update minutes content
   */
  http.put(`${API_BASE}/minutes/:minutesId`, async ({ params, request }) => {
    try {
      const { minutesId } = params;
      const payload = (await request.json()) as UpdateMinutesPayload;

      const minutes = updateMinutes(minutesId as string, {
        content: payload.content,
        contentPlainText: payload.contentPlainText,
        wordCount: payload.wordCount,
      });

      if (!minutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: minutes,
        message: 'Minutes updated successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/minutes/:minutesId/submit
   * Submit minutes for review
   */
  http.post(`${API_BASE}/minutes/:minutesId/submit`, async ({ params, request }) => {
    try {
      const { minutesId } = params;
      const payload = (await request.json()) as SubmitMinutesPayload;

      const minutes = submitMinutesForReview(
        minutesId as string,
        1, // TODO: Get from auth context
        payload.reviewDeadline
      );

      if (!minutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: minutes,
        message: 'Minutes submitted for review',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to submit minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/minutes/:minutesId/approve
   * Approve minutes
   */
  http.post(`${API_BASE}/minutes/:minutesId/approve`, async ({ params, request }) => {
    try {
      const { minutesId } = params;
      const payload = (await request.json()) as ApproveMinutesPayload;

      const minutes = approveMinutes(
        minutesId as string,
        1, // TODO: Get from auth context
        payload.approvalNotes
      );

      if (!minutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: minutes,
        message: 'Minutes approved successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to approve minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/minutes/:minutesId/request-revision
   * Request revision on minutes
   */
  http.post(`${API_BASE}/minutes/:minutesId/request-revision`, async ({ params, request }) => {
    try {
      const { minutesId } = params;
      const payload = (await request.json()) as RequestRevisionPayload;

      const minutes = requestMinutesRevision(
        minutesId as string,
        1, // TODO: Get from auth context
        payload.revisionReason
      );

      if (!minutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: minutes,
        message: 'Revision requested',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to request revision' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/minutes/:minutesId/publish
   * Publish approved minutes
   */
  http.post(`${API_BASE}/minutes/:minutesId/publish`, async ({ params, request }) => {
    try {
      const { minutesId } = params;
      const payload = (await request.json()) as PublishMinutesPayload;

      const minutes = publishMinutes(
        minutesId as string,
        1, // TODO: Get from auth context
        payload.pdfUrl
      );

      if (!minutes) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: minutes,
        message: 'Minutes published successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to publish minutes' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/minutes/:minutesId
   * Delete minutes
   */
  http.delete(`${API_BASE}/minutes/:minutesId`, ({ params }) => {
    try {
      const { minutesId } = params;
      const success = deleteMinutes(minutesId as string);

      if (!success) {
        return HttpResponse.json(
          { success: false, message: 'Minutes not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'Minutes deleted successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete minutes' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // COMMENTS ENDPOINTS
  // ========================================================================

  /**
   * GET /api/minutes/:minutesId/comments
   * Get all comments for minutes
   */
  http.get(`${API_BASE}/minutes/:minutesId/comments`, ({ params }) => {
    try {
      const { minutesId } = params;
      const comments = getCommentsByMinutesId(minutesId as string);

      return HttpResponse.json({
        success: true,
        data: comments,
        total: comments.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch comments' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/minutes/:minutesId/comments
   * Add comment to minutes
   */
  http.post(`${API_BASE}/minutes/:minutesId/comments`, async ({ params, request }) => {
    try {
      const { minutesId } = params;
      const payload = (await request.json()) as AddCommentPayload;

      const comment = addComment({
        minutesId: minutesId as string,
        comment: payload.comment,
        commentType: payload.commentType,
        sectionReference: payload.sectionReference,
        highlightedText: payload.highlightedText,
        textPosition: payload.textPosition,
        createdBy: 1, // TODO: Get from auth context
        parentCommentId: payload.parentCommentId,
      });

      return HttpResponse.json({
        success: true,
        data: comment,
        message: 'Comment added successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to add comment' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/comments/:commentId/resolve
   * Resolve a comment
   */
  http.put(`${API_BASE}/comments/:commentId/resolve`, async ({ params, request }) => {
    try {
      const { commentId } = params;
      const payload = (await request.json()) as ResolveCommentPayload;

      const comment = resolveComment(
        commentId as string,
        1, // TODO: Get from auth context
        payload.secretaryResponse
      );

      if (!comment) {
        return HttpResponse.json(
          { success: false, message: 'Comment not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: comment,
        message: 'Comment resolved',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to resolve comment' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/comments/:commentId
   * Delete a comment
   */
  http.delete(`${API_BASE}/comments/:commentId`, ({ params }) => {
    try {
      const { commentId } = params;
      const success = deleteComment(commentId as string);

      if (!success) {
        return HttpResponse.json(
          { success: false, message: 'Comment not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete comment' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // SIGNATURES ENDPOINTS
  // ========================================================================

  /**
   * GET /api/minutes/:minutesId/signatures
   * Get all signatures for minutes
   */
  http.get(`${API_BASE}/minutes/:minutesId/signatures`, ({ params }) => {
    try {
      const { minutesId } = params;
      const signatures = getSignaturesByMinutesId(minutesId as string);

      return HttpResponse.json({
        success: true,
        data: signatures,
        total: signatures.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch signatures' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/minutes/:minutesId/signatures
   * Add signature to minutes
   */
  http.post(`${API_BASE}/minutes/:minutesId/signatures`, async ({ params, request }) => {
    try {
      const { minutesId } = params;
      const payload = (await request.json()) as AddSignaturePayload;

      const signature = addSignature({
        minutesId: minutesId as string,
        signedBy: 1, // TODO: Get from auth context
        signerRole: payload.signerRole || 'Unknown',
        signerName: payload.signerName || 'Unknown',
        signatureHash: payload.signatureHash,
        signatureMethod: payload.signatureMethod,
        certificateId: payload.certificateId,
      });

      return HttpResponse.json({
        success: true,
        data: signature,
        message: 'Signature added successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to add signature' },
        { status: 500 }
      );
    }
  }),
];
