/**
 * Board React Query Hooks
 * Hooks for board management operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi, type BoardStats } from '../../api/boards.api';
import type { 
  Board, 
  BoardListItem,
  BoardTreeNode, 
  BoardMember,
  Committee,
  BoardFilterParams,
  CreateBoardPayload,
  UpdateBoardPayload,
  AddBoardMemberPayload,
} from '../../types/board.types';
import type { PaginatedResponse } from '../../types/api.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (params?: BoardFilterParams) => [...boardKeys.lists(), params] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...boardKeys.details(), id] as const,
  tree: () => [...boardKeys.all, 'tree'] as const,
  members: (boardId: number) => [...boardKeys.all, boardId, 'members'] as const,
  membersList: (boardId: number, params?: Record<string, unknown>) => [...boardKeys.members(boardId), params] as const,
  committees: (boardId: number) => [...boardKeys.all, boardId, 'committees'] as const,
  stats: (boardId: number) => [...boardKeys.all, boardId, 'stats'] as const,
  userBoards: (userId: number | string) => [...boardKeys.all, 'user', userId] as const,
};

// ============================================================================
// BOARD QUERIES
// ============================================================================

/**
 * Hook to fetch paginated list of boards
 */
export const useBoards = (params?: BoardFilterParams) => {
  return useQuery<PaginatedResponse<BoardListItem>>({
    queryKey: boardKeys.list(params),
    queryFn: () => boardsApi.getBoards(params),
  });
};

/**
 * Hook to fetch single board by numeric ID
 */
export const useBoard = (id: number) => {
  return useQuery<Board>({
    queryKey: boardKeys.detail(String(id)),
    queryFn: () => boardsApi.getBoard(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch board hierarchy tree
 */
export const useBoardTree = () => {
  return useQuery<BoardTreeNode[]>({
    queryKey: boardKeys.tree(),
    queryFn: () => boardsApi.getBoardTree(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Hook to fetch board statistics
 */
export const useBoardStats = (boardId: number) => {
  return useQuery<BoardStats>({
    queryKey: boardKeys.stats(boardId),
    queryFn: () => boardsApi.getBoardStats(boardId),
    enabled: !!boardId,
  });
};

// ============================================================================
// BOARD MUTATIONS
// ============================================================================

/**
 * Hook to create a new board
 */
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateBoardPayload) => boardsApi.createBoard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardKeys.tree() });
    },
  });
};

/**
 * Hook to update a board
 */
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBoardPayload }) => 
      boardsApi.updateBoard(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardKeys.tree() });
    },
  });
};

/**
 * Hook to delete (deactivate) a board
 */
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => boardsApi.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardKeys.tree() });
    },
  });
};

// ============================================================================
// BOARD MEMBERS QUERIES & MUTATIONS
// ============================================================================

/**
 * Hook to fetch board members
 */
export const useBoardMembers = (
  boardId: number,
  params?: { page?: number; pageSize?: number; search?: string; role?: string }
) => {
  return useQuery<PaginatedResponse<BoardMember>>({
    queryKey: boardKeys.membersList(boardId, params),
    queryFn: () => boardsApi.getBoardMembers(boardId, params),
    enabled: !!boardId,
  });
};

/**
 * Hook to add member to board
 */
export const useAddBoardMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ boardId, payload }: { boardId: number; payload: AddBoardMemberPayload }) =>
      boardsApi.addBoardMember(boardId, payload),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.members(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.stats(boardId) });
    },
  });
};

/**
 * Hook to remove member from board
 */
export const useRemoveBoardMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ boardId, memberId }: { boardId: number; memberId: number }) =>
      boardsApi.removeBoardMember(boardId, memberId),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.members(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.stats(boardId) });
    },
  });
};

// ============================================================================
// COMMITTEE QUERIES & MUTATIONS
// ============================================================================

/**
 * Hook to fetch board committees
 */
export const useBoardCommittees = (boardId: number) => {
  return useQuery<{ data: Committee[]; total: number }>({
    queryKey: boardKeys.committees(boardId),
    queryFn: () => boardsApi.getBoardCommittees(boardId),
    enabled: !!boardId,
  });
};

/**
 * Hook to create committee
 */
export const useCreateCommittee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      boardId, 
      payload 
    }: { 
      boardId: number; 
      payload: { name: string; shortName?: string; description?: string } 
    }) => boardsApi.createCommittee(boardId, payload),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.committees(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.tree() });
    },
  });
};

// ============================================================================
// USER BOARDS
// ============================================================================

/**
 * Hook to fetch boards for a specific user
 */
export const useUserBoards = (userId: number | string) => {
  return useQuery<{ data: Board[]; total: number }>({
    queryKey: boardKeys.userBoards(userId),
    queryFn: () => boardsApi.getUserBoards(userId),
    enabled: !!userId,
  });
};
