/**
 * Auth API
 * API functions for authentication
 */

import apiClient, { tokenManager } from './client';
import { safeParseResponse, safeParsePayload } from '../utils/safeParseResponse';
import {
  LoginPayloadSchema,
  LoginResponseSchema,
  MfaVerifyPayloadSchema,
  MfaSetupResponseSchema,
  ChangePasswordPayloadSchema,
  ForgotPasswordPayloadSchema,
  ResetPasswordPayloadSchema,
  type LoginPayload,
  type LoginResponse,
  type MfaVerifyPayload,
  type MfaSetupResponse,
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
   * Verify MFA code
   */
  verifyMfa: async (payload: MfaVerifyPayload): Promise<LoginResponse> => {
    const validatedPayload = safeParsePayload(MfaVerifyPayloadSchema, payload, 'verifyMfa');
    const response = await apiClient.post('/auth/mfa/verify', validatedPayload);
    const data = safeParseResponse(LoginResponseSchema, response.data, 'verifyMfa');
    
    // Store tokens after successful MFA
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    
    return data;
  },

  /**
   * Setup MFA - get QR code and backup codes
   */
  setupMfa: async (): Promise<MfaSetupResponse> => {
    const response = await apiClient.post('/auth/mfa/setup');
    return safeParseResponse(MfaSetupResponseSchema, response.data, 'setupMfa');
  },

  /**
   * Confirm MFA setup with verification code
   */
  confirmMfaSetup: async (code: string): Promise<{ backupCodes: string[] }> => {
    const response = await apiClient.post('/auth/mfa/confirm', { code });
    return response.data;
  },

  /**
   * Disable MFA (requires password confirmation)
   */
  disableMfa: async (password: string): Promise<void> => {
    await apiClient.post('/auth/mfa/disable', { password });
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
    const response = await apiClient.get('/auth/me');
    // Mock API returns { data: user }, real API might return user directly
    const userData = response.data.data || response.data;
    return safeParseResponse(LoginResponseSchema.shape.user, userData, 'getCurrentUser');
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};

export default authApi;
