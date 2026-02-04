/**
 * Action Items API Handlers - MSW Request Handlers
 * Mock API endpoints for action items management
 */

import { http, HttpResponse } from 'msw';
import {
  getActionItemById,
  getActionItemsByMeetingId,
  getActionItemsByBoardId,
  getActionItemsByAssignee,
  getAllActionItems,
  getOverdueActionItems,
  getActionItemsDueSoon,
  createActionItem,
  updateActionItem,
  updateActionItemStatus,
  completeActionItem,
  deleteActionItem,
  getActionItemsStats,
} from '../db/queries/actionItemsQueries';
import type {
  CreateActionItemPayload,
  UpdateActionItemPayload,
  UpdateActionItemStatusPayload,
  CompleteActionItemPayload,
} from '../../types/actionItems.types';

const API_BASE = '/api';

export const actionItemsHandlers = [
  // ========================================================================
  // ACTION ITEMS ENDPOINTS
  // ========================================================================

  /**
   * GET /api/action-items/:actionItemId
   * Get specific action item by ID
   */
  http.get(`${API_BASE}/action-items/:actionItemId`, ({ params }) => {
    try {
      const { actionItemId } = params;
      const actionItem = getActionItemById(actionItemId as string);

      if (!actionItem) {
        return HttpResponse.json(
          { success: false, message: 'Action item not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: actionItem,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch action item' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/meetings/:meetingId/action-items
   * Get all action items for a meeting
   */
  http.get(`${API_BASE}/meetings/:meetingId/action-items`, ({ params }) => {
    try {
      const { meetingId } = params;
      const actionItems = getActionItemsByMeetingId(meetingId as string);

      return HttpResponse.json({
        success: true,
        data: actionItems,
        total: actionItems.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch action items' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/boards/:boardId/action-items
   * Get all action items for a board
   */
  http.get(`${API_BASE}/boards/:boardId/action-items`, ({ params }) => {
    try {
      const { boardId } = params;
      const actionItems = getActionItemsByBoardId(boardId as string);

      return HttpResponse.json({
        success: true,
        data: actionItems,
        total: actionItems.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch action items' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/users/:userId/action-items
   * Get all action items assigned to a user
   */
  http.get(`${API_BASE}/users/:userId/action-items`, ({ params }) => {
    try {
      const { userId } = params;
      const actionItems = getActionItemsByAssignee(parseInt(userId as string));

      return HttpResponse.json({
        success: true,
        data: actionItems,
        total: actionItems.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch action items' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/action-items
   * Get all action items with optional filters
   */
  http.get(`${API_BASE}/action-items`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const meetingId = url.searchParams.get('meetingId');
      const boardId = url.searchParams.get('boardId');
      const assignedTo = url.searchParams.get('assignedTo');
      const status = url.searchParams.get('status') as any;
      const priority = url.searchParams.get('priority') as any;
      const source = url.searchParams.get('source') as any;
      const overdue = url.searchParams.get('overdue');

      const filters: any = {};
      if (meetingId) filters.meetingId = meetingId;
      if (boardId) filters.boardId = boardId;
      if (assignedTo) filters.assignedTo = parseInt(assignedTo);
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (source) filters.source = source;
      if (overdue === 'true') filters.overdue = true;

      const actionItems = getAllActionItems(filters);

      return HttpResponse.json({
        success: true,
        data: actionItems,
        total: actionItems.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch action items' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/action-items/overdue
   * Get overdue action items
   */
  http.get(`${API_BASE}/action-items/overdue`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      
      const actionItems = getOverdueActionItems(
        userId ? parseInt(userId) : undefined
      );

      return HttpResponse.json({
        success: true,
        data: actionItems,
        total: actionItems.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch overdue action items' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/action-items/due-soon
   * Get action items due soon (within 7 days)
   */
  http.get(`${API_BASE}/action-items/due-soon`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      
      const actionItems = getActionItemsDueSoon(
        userId ? parseInt(userId) : undefined
      );

      return HttpResponse.json({
        success: true,
        data: actionItems,
        total: actionItems.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch action items due soon' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/users/:userId/action-items/stats
   * Get action items statistics for a user
   */
  http.get(`${API_BASE}/users/:userId/action-items/stats`, ({ params }) => {
    try {
      const { userId } = params;
      const stats = getActionItemsStats(parseInt(userId as string));

      return HttpResponse.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch action items stats' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/action-items
   * Create new action item
   */
  http.post(`${API_BASE}/action-items`, async ({ request }) => {
    try {
      const payload = (await request.json()) as CreateActionItemPayload;

      const actionItem = createActionItem({
        meetingId: payload.meetingId,
        boardId: payload.boardId,
        source: payload.source,
        sourceId: payload.sourceId,
        title: payload.title,
        description: payload.description,
        assignedTo: payload.assignedTo,
        assignedBy: 1, // TODO: Get from auth context
        dueDate: payload.dueDate,
        priority: payload.priority,
        relatedAgendaItemId: payload.relatedAgendaItemId,
        relatedDocumentIds: payload.relatedDocumentIds,
      });

      return HttpResponse.json({
        success: true,
        data: actionItem,
        message: 'Action item created successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create action item' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/action-items/:actionItemId
   * Update action item
   */
  http.put(`${API_BASE}/action-items/:actionItemId`, async ({ params, request }) => {
    try {
      const { actionItemId } = params;
      const payload = (await request.json()) as UpdateActionItemPayload;

      const actionItem = updateActionItem(actionItemId as string, {
        title: payload.title,
        description: payload.description,
        assignedTo: payload.assignedTo,
        dueDate: payload.dueDate,
        priority: payload.priority,
        relatedDocumentIds: payload.relatedDocumentIds,
      });

      if (!actionItem) {
        return HttpResponse.json(
          { success: false, message: 'Action item not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: actionItem,
        message: 'Action item updated successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update action item' },
        { status: 500 }
      );
    }
  }),

  /**
   * PATCH /api/action-items/:actionItemId/status
   * Update action item status
   */
  http.patch(`${API_BASE}/action-items/:actionItemId/status`, async ({ params, request }) => {
    try {
      const { actionItemId } = params;
      const payload = (await request.json()) as UpdateActionItemStatusPayload;

      const actionItem = updateActionItemStatus(
        actionItemId as string,
        payload.status,
        payload.completionNotes
      );

      if (!actionItem) {
        return HttpResponse.json(
          { success: false, message: 'Action item not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: actionItem,
        message: 'Action item status updated',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update action item status' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/action-items/:actionItemId/complete
   * Mark action item as completed
   */
  http.post(`${API_BASE}/action-items/:actionItemId/complete`, async ({ params, request }) => {
    try {
      const { actionItemId } = params;
      const payload = (await request.json()) as CompleteActionItemPayload;

      const actionItem = completeActionItem(
        actionItemId as string,
        1, // TODO: Get from auth context
        payload.completionNotes
      );

      if (!actionItem) {
        return HttpResponse.json(
          { success: false, message: 'Action item not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: actionItem,
        message: 'Action item completed',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to complete action item' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/action-items/:actionItemId
   * Delete action item
   */
  http.delete(`${API_BASE}/action-items/:actionItemId`, ({ params }) => {
    try {
      const { actionItemId } = params;
      const success = deleteActionItem(actionItemId as string);

      if (!success) {
        return HttpResponse.json(
          { success: false, message: 'Action item not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'Action item deleted successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete action item' },
        { status: 500 }
      );
    }
  }),
];
