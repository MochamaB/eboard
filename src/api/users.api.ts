/**
 * Users API
 * API functions for user management
 */

import apiClient from './client';
import { z } from 'zod';
import {
  UserSchema,
  UserListItemSchema,
  CreateUserPayloadSchema,
  UpdateUserPayloadSchema,
  EmailCheckResponseSchema,
  UserActivitySchema,
  type User,
  type UserListItem,
  type CreateUserPayload,
  type UpdateUserPayload,
  type EmailCheckResponse,
  type UserActivity,
  type UserFilterParams,
} from '../types/user.types';
import type { PaginatedResponse } from '../types/api.types';

// Response schemas
const UsersListResponseSchema = z.object({
  data: z.array(UserListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

const UserActivitiesResponseSchema = z.object({
  data: z.array(UserActivitySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const usersApi = {
  /**
   * Get paginated list of users
   */
  getUsers: async (params?: UserFilterParams): Promise<PaginatedResponse<UserListItem>> => {
    const response = await apiClient.get('/users', { params });
    return UsersListResponseSchema.parse(response.data);
  },

  /**
   * Get single user by ID
   */
  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return UserSchema.parse(response.data);
  },

  /**
   * Create new user
   */
  createUser: async (payload: CreateUserPayload): Promise<User> => {
    // Validate payload before sending
    const validatedPayload = CreateUserPayloadSchema.parse(payload);
    const response = await apiClient.post('/users', validatedPayload);
    return UserSchema.parse(response.data);
  },

  /**
   * Update existing user
   */
  updateUser: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const validatedPayload = UpdateUserPayloadSchema.parse(payload);
    const response = await apiClient.put(`/users/${id}`, validatedPayload);
    return UserSchema.parse(response.data);
  },

  /**
   * Delete user (soft delete - deactivate)
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Check if email is available
   */
  checkEmail: async (email: string): Promise<EmailCheckResponse> => {
    const response = await apiClient.get('/users/check-email', { params: { email } });
    return EmailCheckResponseSchema.parse(response.data);
  },

  /**
   * Bulk deactivate users
   */
  bulkDeactivate: async (userIds: number[], reason?: string): Promise<void> => {
    await apiClient.post('/users/bulk-deactivate', { userIds, reason });
  },

  /**
   * Bulk send email to users
   */
  bulkEmail: async (userIds: number[], subject: string, message: string): Promise<void> => {
    await apiClient.post('/users/bulk-email', { userIds, subject, message });
  },

  /**
   * Export users to file
   */
  exportUsers: async (format: 'csv' | 'xlsx', params?: UserFilterParams): Promise<Blob> => {
    const response = await apiClient.get('/users/export', {
      params: { format, ...params },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get user activity log
   */
  getUserActivities: async (
    userId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<UserActivity>> => {
    const response = await apiClient.get(`/users/${userId}/activities`, { params });
    return UserActivitiesResponseSchema.parse(response.data);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (userId: number, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload digital certificate (Company Secretary only)
   */
  uploadCertificate: async (
    userId: number,
    file: File,
    password: string
  ): Promise<{ expiryDate: string }> => {
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('password', password);
    const response = await apiClient.post(`/users/${userId}/certificate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Resend welcome email with temporary password
   */
  resendWelcomeEmail: async (userId: number): Promise<void> => {
    await apiClient.post(`/users/${userId}/resend-welcome`);
  },
};

export default usersApi;
