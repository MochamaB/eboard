/**
 * Auth API
 * API functions for authentication
 */

import apiClient, { tokenManager } from './client';
import { safeParseResponse, safeParsePayload } from '../utils/safeParseResponse';
import {
  LoginPayloadSchema,
  LoginResponseSchema,
  ChangePasswordPayloadSchema,
  ForgotPasswordPayloadSchema,
  ResetPasswordPayloadSchema,
  type LoginPayload,
  type LoginResponse,
  type ChangePasswordPayload,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
} from '../types/auth.types';

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const validatedPayload = safeParsePayload(LoginPayloadSchema, payload, 'login');
    const response = await apiClient.post('/auth/login', validatedPayload);
    const data = safeParseResponse(LoginResponseSchema, response.data, 'login');
    
    // Store tokens
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    
    return data;
  },

  /**
   * Logout - clear tokens and invalidate session
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenManager.clearTokens();
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    
    tokenManager.setAccessToken(accessToken);
    
    return { accessToken };
  },

  /**
   * Verify MFA code (placeholder - not yet implemented in backend)
   */
  verifyMfa: async (payload: { code: string }): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/mfa/verify', payload);
    const data = safeParseResponse(LoginResponseSchema, response.data, 'verifyMfa');
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  /**
   * Change password (for logged-in users)
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    const validatedPayload = safeParsePayload(ChangePasswordPayloadSchema, payload, 'changePassword');
    await apiClient.post('/auth/change-password', validatedPayload);
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    const validatedPayload = safeParsePayload(ForgotPasswordPayloadSchema, payload, 'forgotPassword');
    await apiClient.post('/auth/forgot-password', validatedPayload);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    const validatedPayload = safeParsePayload(ResetPasswordPayloadSchema, payload, 'resetPassword');
    await apiClient.post('/auth/reset-password', validatedPayload);
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<LoginResponse['user']> => {
    const response = await apiClient.get('/users/me');
    return safeParseResponse(LoginResponseSchema.shape.user, response.data, 'getCurrentUser');
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};

export default authApi;
