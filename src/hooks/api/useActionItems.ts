/**
 * Action Items React Query Hooks
 * Custom hooks for action items management using React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as actionItemsApi from '../../api/actionItems.api';
import type {
  ActionItem,
  CreateActionItemPayload,
  UpdateActionItemPayload,
  UpdateActionItemStatusPayload,
  CompleteActionItemPayload,
  ActionItemFilters,
  ActionItemsStats,
} from '../../types/actionItems.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const actionItemsKeys = {
  all: ['actionItems'] as const,
  byId: (actionItemId: string) => [...actionItemsKeys.all, 'id', actionItemId] as const,
  byMeeting: (meetingId: string) => [...actionItemsKeys.all, 'meeting', meetingId] as const,
  byBoard: (boardId: string) => [...actionItemsKeys.all, 'board', boardId] as const,
  byAssignee: (userId: number) => [...actionItemsKeys.all, 'assignee', userId] as const,
  list: (filters?: ActionItemFilters) => [...actionItemsKeys.all, 'list', filters] as const,
  overdue: (userId?: number) => [...actionItemsKeys.all, 'overdue', userId] as const,
  dueSoon: (userId?: number) => [...actionItemsKeys.all, 'due-soon', userId] as const,
  stats: (userId: number) => [...actionItemsKeys.all, 'stats', userId] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get action item by ID
 */
export const useActionItem = (
  actionItemId: string,
  options?: Omit<UseQueryOptions<ActionItem>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.byId(actionItemId),
    queryFn: () => actionItemsApi.getActionItemById(actionItemId),
    enabled: !!actionItemId && actionItemId.length > 0,
    retry: false,
    ...options,
  });
};

/**
 * Get action items by meeting ID
 */
export const useActionItemsByMeeting = (
  meetingId: string,
  options?: Omit<UseQueryOptions<ActionItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.byMeeting(meetingId),
    queryFn: () => actionItemsApi.getActionItemsByMeetingId(meetingId),
    enabled: !!meetingId && meetingId.length > 0,
    ...options,
  });
};

/**
 * Get action items by board ID
 */
export const useActionItemsByBoard = (
  boardId: string,
  options?: Omit<UseQueryOptions<ActionItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.byBoard(boardId),
    queryFn: () => actionItemsApi.getActionItemsByBoardId(boardId),
    enabled: !!boardId && boardId.length > 0,
    ...options,
  });
};

/**
 * Get action items by assignee
 */
export const useActionItemsByAssignee = (
  userId: number,
  options?: Omit<UseQueryOptions<ActionItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.byAssignee(userId),
    queryFn: () => actionItemsApi.getActionItemsByAssignee(userId),
    enabled: !!userId && userId > 0,
    ...options,
  });
};

/**
 * Get all action items with optional filters
 */
export const useAllActionItems = (
  filters?: ActionItemFilters,
  options?: Omit<UseQueryOptions<ActionItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.list(filters),
    queryFn: () => actionItemsApi.getAllActionItems(filters),
    ...options,
  });
};

/**
 * Get overdue action items
 */
export const useOverdueActionItems = (
  userId?: number,
  options?: Omit<UseQueryOptions<ActionItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.overdue(userId),
    queryFn: () => actionItemsApi.getOverdueActionItems(userId),
    ...options,
  });
};

/**
 * Get action items due soon
 */
export const useActionItemsDueSoon = (
  userId?: number,
  options?: Omit<UseQueryOptions<ActionItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.dueSoon(userId),
    queryFn: () => actionItemsApi.getActionItemsDueSoon(userId),
    ...options,
  });
};

/**
 * Get action items statistics
 */
export const useActionItemsStats = (
  userId: number,
  options?: Omit<UseQueryOptions<ActionItemsStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: actionItemsKeys.stats(userId),
    queryFn: () => actionItemsApi.getActionItemsStats(userId),
    enabled: !!userId && userId > 0,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create action item
 */
export const useCreateActionItem = (
  options?: UseMutationOptions<ActionItem, Error, CreateActionItemPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: CreateActionItemPayload) => actionItemsApi.createActionItem(payload),
    onSuccess: async (...args) => {
      const [_data, variables] = args;
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byMeeting(variables.meetingId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byBoard(variables.boardId) });
      if (variables.assignedTo) {
        await queryClient.refetchQueries({ queryKey: actionItemsKeys.byAssignee(variables.assignedTo) });
      }
      await queryClient.invalidateQueries({ queryKey: actionItemsKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update action item
 */
export const useUpdateActionItem = (
  actionItemId: string,
  meetingId: string,
  boardId: string,
  options?: UseMutationOptions<ActionItem, Error, UpdateActionItemPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: UpdateActionItemPayload) => actionItemsApi.updateActionItem(actionItemId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byId(actionItemId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byBoard(boardId) });
      await queryClient.invalidateQueries({ queryKey: actionItemsKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update action item status
 */
export const useUpdateActionItemStatus = (
  actionItemId: string,
  meetingId: string,
  boardId: string,
  assignedTo: number,
  options?: UseMutationOptions<ActionItem, Error, UpdateActionItemStatusPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: UpdateActionItemStatusPayload) => actionItemsApi.updateActionItemStatus(actionItemId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byId(actionItemId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byBoard(boardId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byAssignee(assignedTo) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.stats(assignedTo) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.overdue(assignedTo) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.dueSoon(assignedTo) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Complete action item
 */
export const useCompleteActionItem = (
  actionItemId: string,
  meetingId: string,
  boardId: string,
  assignedTo: number,
  options?: UseMutationOptions<ActionItem, Error, CompleteActionItemPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: CompleteActionItemPayload) => actionItemsApi.completeActionItem(actionItemId, payload),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byId(actionItemId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byBoard(boardId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byAssignee(assignedTo) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.stats(assignedTo) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.overdue(assignedTo) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.dueSoon(assignedTo) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Delete action item
 */
export const useDeleteActionItem = (
  meetingId: string,
  boardId: string,
  assignedTo: number,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (actionItemId: string) => actionItemsApi.deleteActionItem(actionItemId),
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byMeeting(meetingId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byBoard(boardId) });
      await queryClient.refetchQueries({ queryKey: actionItemsKeys.byAssignee(assignedTo) });
      await queryClient.invalidateQueries({ queryKey: actionItemsKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};
