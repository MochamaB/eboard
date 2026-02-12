/**
 * Users API
 * API functions for user management
 */

import apiClient from './client';
import { safeParseResponse, safeParsePayload } from '../utils/safeParseResponse';
import { z } from 'zod';
import {
  UserSchema,
  UserListItemSchema,
  CreateUserPayloadSchema,
  UpdateUserPayloadSchema,
  EmailCheckResponseSchema,
  UserActivitySchema,
  UserSessionSchema,
  type User,
  type UserListItem,
  type CreateUserPayload,
  type UpdateUserPayload,
  type EmailCheckResponse,
  type UserActivity,
  type UserSession,
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

const UserSessionsResponseSchema = z.object({
  data: z.array(UserSessionSchema),
  total: z.number(),
});

export const usersApi = {
  /**
   * Get paginated list of users
   */
  getUsers: async (params?: UserFilterParams): Promise<PaginatedResponse<UserListItem>> => {
    const response = await apiClient.get('/users', { params });
    return safeParseResponse(UsersListResponseSchema, response.data, 'getUsers');
  },

  /**
   * Get single user by ID
   */
  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return safeParseResponse(UserSchema, response.data, 'getUser');
  },

  /**
   * Create new user
   */
  createUser: async (payload: CreateUserPayload): Promise<User> => {
    // Validate payload before sending
    const validatedPayload = safeParsePayload(CreateUserPayloadSchema, payload, 'createUser');
    const response = await apiClient.post('/users', validatedPayload);
    return safeParseResponse(UserSchema, response.data, 'createUser');
  },

  /**
   * Update existing user
   */
  updateUser: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const validatedPayload = safeParsePayload(UpdateUserPayloadSchema, payload, 'updateUser');
    const response = await apiClient.put(`/users/${id}`, validatedPayload);
    return safeParseResponse(UserSchema, response.data, 'updateUser');
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
    return safeParseResponse(EmailCheckResponseSchema, response.data, 'checkEmail');
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
    return safeParseResponse(UserActivitiesResponseSchema, response.data, 'getUserActivities');
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

  // ============================================================================
  // SESSION MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Get all sessions for a user
   */
  getUserSessions: async (userId: number, activeOnly: boolean = false): Promise<{ data: UserSession[]; total: number }> => {
    const response = await apiClient.get(`/users/${userId}/sessions`, {
      params: { activeOnly },
    });
    return safeParseResponse(UserSessionsResponseSchema, response.data, 'getUserSessions');
  },

  /**
   * Get single session by ID
   */
  getSession: async (sessionId: string): Promise<UserSession> => {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return safeParseResponse(UserSessionSchema, response.data, 'getSession');
  },

  /**
   * Terminate a specific session (logout single device)
   */
  terminateSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  /**
   * Terminate all sessions for a user (force logout all devices)
   */
  terminateAllUserSessions: async (userId: number): Promise<{ count: number }> => {
    const response = await apiClient.delete(`/users/${userId}/sessions`);
    return response.data;
  },
};

export default usersApi;
