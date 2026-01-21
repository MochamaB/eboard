/**
 * Role React Query Hooks
 * Hooks for role and permission management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../../api';
import type { Role, Permission, CreateRolePayload, UpdateRolePayload } from '../../types';
import type { PaginatedResponse } from '../../types/api.types';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: { includeSystem?: boolean }) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
  permissions: () => ['permissions'] as const,
  permissionsByCategory: () => [...roleKeys.permissions(), 'byCategory'] as const,
};

/**
 * Hook to fetch all roles
 */
export const useRoles = (params?: { page?: number; pageSize?: number; includeSystem?: boolean }) => {
  return useQuery<PaginatedResponse<Role>>({
    queryKey: roleKeys.list(params),
    queryFn: () => rolesApi.getRoles(params),
  });
};

/**
 * Hook to fetch single role by ID
 */
export const useRole = (id: number) => {
  return useQuery<Role>({
    queryKey: roleKeys.detail(id),
    queryFn: () => rolesApi.getRole(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch all permissions
 */
export const usePermissions = () => {
  return useQuery<Permission[]>({
    queryKey: roleKeys.permissions(),
    queryFn: () => rolesApi.getPermissions(),
  });
};

/**
 * Hook to fetch permissions grouped by category
 */
export const usePermissionsByCategory = () => {
  return useQuery<Record<string, Permission[]>>({
    queryKey: roleKeys.permissionsByCategory(),
    queryFn: () => rolesApi.getPermissionsByCategory(),
  });
};

/**
 * Hook to create a new role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing role
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRolePayload }) =>
      rolesApi.updateRole(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(roleKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

/**
 * Hook to delete a role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};
