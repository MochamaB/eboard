/**
 * Roles API
 * API functions for role and permission management
 */

import apiClient from './client';
import { z } from 'zod';
import {
  RoleSchema,
  PermissionSchema,
  CreateRolePayloadSchema,
  UpdateRolePayloadSchema,
  type Role,
  type Permission,
  type CreateRolePayload,
  type UpdateRolePayload,
} from '../types/role.types';
import type { PaginatedResponse } from '../types/api.types';

// Response schemas
const RolesListResponseSchema = z.object({
  data: z.array(RoleSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

const PermissionsListResponseSchema = z.object({
  data: z.array(PermissionSchema),
});

export const rolesApi = {
  /**
   * Get all roles
   */
  getRoles: async (params?: {
    page?: number;
    pageSize?: number;
    includeSystem?: boolean;
  }): Promise<PaginatedResponse<Role>> => {
    const response = await apiClient.get('/roles', { params });
    return RolesListResponseSchema.parse(response.data);
  },

  /**
   * Get single role by ID
   */
  getRole: async (id: number): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return RoleSchema.parse(response.data);
  },

  /**
   * Create new custom role
   */
  createRole: async (payload: CreateRolePayload): Promise<Role> => {
    const validatedPayload = CreateRolePayloadSchema.parse(payload);
    const response = await apiClient.post('/roles', validatedPayload);
    return RoleSchema.parse(response.data);
  },

  /**
   * Update existing role
   */
  updateRole: async (id: number, payload: UpdateRolePayload): Promise<Role> => {
    const validatedPayload = UpdateRolePayloadSchema.parse(payload);
    const response = await apiClient.put(`/roles/${id}`, validatedPayload);
    return RoleSchema.parse(response.data);
  },

  /**
   * Delete custom role (system roles cannot be deleted)
   */
  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  /**
   * Get all available permissions
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get('/permissions');
    const parsed = PermissionsListResponseSchema.parse(response.data);
    return parsed.data;
  },

  /**
   * Get permissions grouped by category
   */
  getPermissionsByCategory: async (): Promise<Record<string, Permission[]>> => {
    const permissions = await rolesApi.getPermissions();
    return permissions.reduce((acc, permission) => {
      const category = permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  },
};

export default rolesApi;
