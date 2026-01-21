/**
 * Board React Query Hooks
 * Hooks for board management operations
 */

import { useQuery } from '@tanstack/react-query';
import { boardsApi } from '../../api';
import type { Board, BoardTreeNode } from '../../types';
import type { PaginatedResponse } from '../../types/api.types';

// Query keys
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (params?: { type?: string; status?: string }) => [...boardKeys.lists(), params] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
  tree: () => [...boardKeys.all, 'tree'] as const,
  userBoards: (userId: number) => [...boardKeys.all, 'user', userId] as const,
};

/**
 * Hook to fetch all boards
 */
export const useBoards = (params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
}) => {
  return useQuery<PaginatedResponse<Board>>({
    queryKey: boardKeys.list(params),
    queryFn: () => boardsApi.getBoards(params),
  });
};

/**
 * Hook to fetch single board by ID
 */
export const useBoard = (id: string) => {
  return useQuery<Board>({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardsApi.getBoard(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch board tree for hierarchical selection
 */
export const useBoardTree = () => {
  return useQuery<BoardTreeNode[]>({
    queryKey: boardKeys.tree(),
    queryFn: () => boardsApi.getBoardTree(),
  });
};

/**
 * Hook to fetch boards for a specific user
 */
export const useUserBoards = (userId: number) => {
  return useQuery<Board[]>({
    queryKey: boardKeys.userBoards(userId),
    queryFn: () => boardsApi.getUserBoards(userId),
    enabled: !!userId,
  });
};
