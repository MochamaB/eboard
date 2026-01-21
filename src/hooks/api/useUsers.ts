/**
 * User React Query Hooks
 * Hooks for user management operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api';
import type {
  User,
  UserListItem,
  CreateUserPayload,
  UpdateUserPayload,
  UserFilterParams,
  UserActivity,
} from '../../types';
import type { PaginatedResponse } from '../../types/api.types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserFilterParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  activities: (id: number) => [...userKeys.detail(id), 'activities'] as const,
};

/**
 * Hook to fetch paginated list of users
 */
export const useUsers = (params?: UserFilterParams) => {
  return useQuery<PaginatedResponse<UserListItem>>({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
  });
};

/**
 * Hook to fetch single user by ID
 */
export const useUser = (id: number) => {
  return useQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch user activities
 */
export const useUserActivities = (
  userId: number,
  params?: { page?: number; pageSize?: number }
) => {
  return useQuery<PaginatedResponse<UserActivity>>({
    queryKey: userKeys.activities(userId),
    queryFn: () => usersApi.getUserActivities(userId, params),
    enabled: !!userId,
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createUser(payload),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.updateUser(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(variables.id), data);
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

/**
 * Hook to delete (deactivate) a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

/**
 * Hook to check email availability
 */
export const useCheckEmail = () => {
  return useMutation({
    mutationFn: (email: string) => usersApi.checkEmail(email),
  });
};

/**
 * Hook to bulk deactivate users
 */
export const useBulkDeactivateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, reason }: { userIds: number[]; reason?: string }) =>
      usersApi.bulkDeactivate(userIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

/**
 * Hook to upload user avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: number; file: File }) =>
      usersApi.uploadAvatar(userId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
    },
  });
};

/**
 * Hook to resend welcome email
 */
export const useResendWelcomeEmail = () => {
  return useMutation({
    mutationFn: (userId: number) => usersApi.resendWelcomeEmail(userId),
  });
};
