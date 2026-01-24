/**
 * Boards API
 * API functions for board management
 */

import apiClient from './client';
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

const BoardMembersResponseSchema = z.object({
  data: z.array(BoardMemberSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

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
    return BoardsListResponseSchema.parse(response.data);
  },

  /**
   * Get single board by ID
   */
  getBoard: async (id: string): Promise<Board> => {
    const response = await apiClient.get(`/boards/${id}`);
    return BoardSchema.parse(response.data);
  },

  /**
   * Create new board
   */
  createBoard: async (payload: CreateBoardPayload): Promise<Board> => {
    const response = await apiClient.post('/boards', payload);
    return BoardSchema.parse(response.data);
  },

  /**
   * Update existing board
   */
  updateBoard: async (id: string, payload: UpdateBoardPayload): Promise<Board> => {
    const response = await apiClient.put(`/boards/${id}`, payload);
    return BoardSchema.parse(response.data);
  },

  /**
   * Deactivate board (soft delete)
   */
  deleteBoard: async (id: string): Promise<void> => {
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
    const parsed = BoardTreeResponseSchema.parse(response.data);
    return parsed.data;
  },

  // ==========================================================================
  // BOARD MEMBERS
  // ==========================================================================

  /**
   * Get members of a board
   */
  getBoardMembers: async (
    boardId: string,
    params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      role?: string;
    }
  ): Promise<PaginatedResponse<BoardMember>> => {
    const response = await apiClient.get(`/boards/${boardId}/members`, { params });
    return BoardMembersResponseSchema.parse(response.data);
  },

  /**
   * Add member to board
   */
  addBoardMember: async (boardId: string, payload: AddBoardMemberPayload): Promise<BoardMember> => {
    const response = await apiClient.post(`/boards/${boardId}/members`, payload);
    return BoardMemberSchema.parse(response.data);
  },

  /**
   * Remove member from board
   */
  removeBoardMember: async (boardId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/members/${memberId}`);
  },

  // ==========================================================================
  // COMMITTEES
  // ==========================================================================

  /**
   * Get committees of a board
   */
  getBoardCommittees: async (boardId: string): Promise<{ data: Committee[]; total: number }> => {
    const response = await apiClient.get(`/boards/${boardId}/committees`);
    return CommitteesResponseSchema.parse(response.data);
  },

  /**
   * Create committee under a board
   */
  createCommittee: async (
    boardId: string,
    payload: { name: string; shortName?: string; description?: string }
  ): Promise<Committee> => {
    const response = await apiClient.post(`/boards/${boardId}/committees`, payload);
    return CommitteeSchema.parse(response.data);
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
    }).parse(response.data);
  },

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get board statistics
   */
  getBoardStats: async (boardId: string): Promise<BoardStats> => {
    const response = await apiClient.get(`/boards/${boardId}/stats`);
    return BoardStatsSchema.parse(response.data);
  },
};

export default boardsApi;
