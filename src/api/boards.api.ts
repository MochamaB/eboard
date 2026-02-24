/**
 * Boards API
 * API functions for board management
 */

import apiClient from './client';
import { safeParseResponse } from '../utils/safeParseResponse';
import { z } from 'zod';
import {
  BoardSchema,
  BoardListItemSchema,
  BoardTreeNodeSchema,
  CommitteeSchema,
  BoardMemberSchema,
  type Board,
  type BoardListItem,
  type BoardTreeNode,
  type Committee,
  type BoardMember,
  type BoardFilterParams,
  type CreateBoardPayload,
  type UpdateBoardPayload,
  type AddBoardMemberPayload,
} from '../types/board.types';
import type { PaginatedResponse } from '../types/api.types';

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

const BoardsListResponseSchema = z.object({
  data: z.array(BoardListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

const BoardTreeResponseSchema = z.object({
  data: z.array(BoardTreeNodeSchema),
});

const BoardMembersResponseSchema = z.union([
  // Backend returns paginated object
  z.object({
    data: z.array(BoardMemberSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  }),
  // Backend returns raw array - transform to paginated format
  z.array(BoardMemberSchema).transform(data => ({
    data,
    total: data.length,
    page: 1,
    pageSize: data.length,
    totalPages: 1,
  }))
]);

const CommitteesResponseSchema = z.object({
  data: z.array(CommitteeSchema),
  total: z.number(),
});

const BoardStatsSchema = z.object({
  memberCount: z.number(),
  committeeCount: z.number(),
  meetingsThisYear: z.number(),
  compliance: z.number(),
  upcomingMeetings: z.number(),
  pendingResolutions: z.number(),
  documentsCount: z.number(),
});

export type BoardStats = z.infer<typeof BoardStatsSchema>;

// ============================================================================
// BOARDS API
// ============================================================================

export const boardsApi = {
  // ==========================================================================
  // BOARD CRUD
  // ==========================================================================

  /**
   * Get paginated list of boards with filters
   */
  getBoards: async (params?: BoardFilterParams): Promise<PaginatedResponse<BoardListItem>> => {
    const response = await apiClient.get('/boards', { params });
    return safeParseResponse(BoardsListResponseSchema, response.data, 'getBoards');
  },

  /**
   * Get single board by numeric ID
   */
  getBoard: async (id: number): Promise<Board> => {
    const response = await apiClient.get(`/boards/${id}`);
    return safeParseResponse(BoardSchema, response.data, 'getBoard');
  },

  /**
   * Create new board
   */
  createBoard: async (payload: CreateBoardPayload): Promise<Board> => {
    const response = await apiClient.post('/boards', payload);
    return safeParseResponse(BoardSchema, response.data, 'createBoard');
  },

  /**
   * Update existing board (basic info and contact only)
   */
  updateBoard: async (id: number, payload: UpdateBoardPayload): Promise<Board> => {
    const response = await apiClient.put(`/boards/${id}`, payload);
    return safeParseResponse(BoardSchema, response.data, 'updateBoard');
  },

  /**
   * Update board settings separately
   */
  updateBoardSettings: async (id: number, payload: {
    quorumPercentage?: number;
    meetingFrequencyId?: number;
    votingThresholdId?: number;
    approverRoleId?: number;
    confirmationRequired?: boolean;
    minMeetingsPerYear?: number;
    allowVirtualMeetings?: boolean;
    requireAttendanceTracking?: boolean;
    allowSecretarySkipAgenda?: boolean;
    allowSecretarySkipDocuments?: boolean;
    requireApprovalForOverrides?: boolean;
  }): Promise<Board> => {
    const response = await apiClient.put(`/boards/${id}/settings`, payload);
    return safeParseResponse(BoardSchema, response.data, 'updateBoardSettings');
  },

  /**
   * Deactivate board (soft delete)
   */
  deleteBoard: async (id: number): Promise<void> => {
    await apiClient.delete(`/boards/${id}`);
  },

  // ==========================================================================
  // BOARD TREE / HIERARCHY
  // ==========================================================================

  /**
   * Get board hierarchy tree for selection/visualization
   */
  getBoardTree: async (): Promise<BoardTreeNode[]> => {
    const response = await apiClient.get('/boards/tree');
    const parsed = safeParseResponse(BoardTreeResponseSchema, response.data, 'getBoardTree');
    return parsed.data;
  },

  // ==========================================================================
  // BOARD MEMBERS
  // ==========================================================================

  /**
   * Get members of a board
   */
  getBoardMembers: async (
    boardId: number,
    params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      role?: string;
    }
  ): Promise<PaginatedResponse<BoardMember>> => {
    const response = await apiClient.get(`/boards/${boardId}/members`, { params });
    return safeParseResponse(BoardMembersResponseSchema, response.data, 'getBoardMembers');
  },

  /**
   * Add member to board
   */
  addBoardMember: async (boardId: number, payload: AddBoardMemberPayload): Promise<BoardMember> => {
    const response = await apiClient.post(`/boards/${boardId}/members`, payload);
    return safeParseResponse(BoardMemberSchema, response.data, 'addBoardMember');
  },

  /**
   * Remove member from board
   */
  removeBoardMember: async (boardId: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/members/${memberId}`);
  },

  // ==========================================================================
  // COMMITTEES
  // ==========================================================================

  /**
   * Get committees of a board (uses /children endpoint and filters by type)
   */
  getBoardCommittees: async (boardId: number): Promise<{ data: Committee[]; total: number }> => {
    const response = await apiClient.get(`/boards/${boardId}/children`);
    // Backend returns array directly from /children, filter for committees only
    const allChildren = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    const committees = allChildren.filter((child: any) => child.type === 'committee');
    return {
      data: committees,
      total: committees.length,
    };
  },

  /**
   * Create committee under a board
   */
  createCommittee: async (
    boardId: number,
    payload: { name: string; shortName?: string; description?: string }
  ): Promise<Committee> => {
    const response = await apiClient.post(`/boards/${boardId}/committees`, payload);
    return safeParseResponse(CommitteeSchema, response.data, 'createCommittee');
  },

  // ==========================================================================
  // BOARD BRANDING
  // ==========================================================================

  /**
   * Get board branding/theme
   */
  getBoardBranding: async (boardId: number): Promise<any> => {
    const response = await apiClient.get(`/boards/${boardId}/branding`);
    return response.data;
  },

  // ==========================================================================
  // BOARD CHILDREN
  // ==========================================================================

  /**
   * Get child boards (committees, subsidiaries) for a parent board
   */
  getBoardChildren: async (boardId: number): Promise<any[]> => {
    const response = await apiClient.get(`/boards/${boardId}/children`);
    return Array.isArray(response.data) ? response.data : [];
  },

  // ==========================================================================
  // USER BOARDS
  // ==========================================================================

  /**
   * Get boards for a specific user
   */
  getUserBoards: async (userId: number | string): Promise<{ data: Board[]; total: number }> => {
    const response = await apiClient.get(`/users/${userId}/boards`);
    return z.object({
      data: z.array(BoardSchema),
      total: z.number(),
    }).safeParse(response.data).data ?? response.data;
  },

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get board statistics
   */
  getBoardStats: async (boardId: number): Promise<BoardStats> => {
    const response = await apiClient.get(`/boards/${boardId}/stats`);
    return safeParseResponse(BoardStatsSchema, response.data, 'getBoardStats');
  },
};

export default boardsApi;
