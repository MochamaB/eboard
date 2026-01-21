/**
 * Boards API
 * API functions for board management
 */

import apiClient from './client';
import { z } from 'zod';
import {
  BoardSchema,
  BoardTreeNodeSchema,
  type Board,
  type BoardTreeNode,
} from '../types/board.types';
import type { PaginatedResponse } from '../types/api.types';

// Response schemas
const BoardsListResponseSchema = z.object({
  data: z.array(BoardSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

const BoardTreeResponseSchema = z.object({
  data: z.array(BoardTreeNodeSchema),
});

export const boardsApi = {
  /**
   * Get all boards
   */
  getBoards: async (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<Board>> => {
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
   * Get board tree for hierarchical selection
   * Used in user creation wizard for board assignment
   */
  getBoardTree: async (): Promise<BoardTreeNode[]> => {
    const response = await apiClient.get('/boards/tree');
    const parsed = BoardTreeResponseSchema.parse(response.data);
    return parsed.data;
  },

  /**
   * Get boards for a specific user
   */
  getUserBoards: async (userId: number): Promise<Board[]> => {
    const response = await apiClient.get(`/users/${userId}/boards`);
    return z.array(BoardSchema).parse(response.data);
  },
};

export default boardsApi;
