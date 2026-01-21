/**
 * Auth React Query Hooks
 * Hooks for authentication operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api';
import type {
  LoginPayload,
  LoginResponse,
  MfaVerifyPayload,
  MfaSetupResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthUser,
} from '../../types';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  mfaSetup: ['auth', 'mfa-setup'] as const,
};

/**
 * Hook to get current authenticated user
 */
export const useCurrentUser = () => {
  return useQuery<AuthUser>({
    queryKey: authKeys.user,
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

/**
 * Hook to logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

/**
 * Hook to verify MFA code
 */
export const useVerifyMfa = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, MfaVerifyPayload>({
    mutationFn: (payload) => authApi.verifyMfa(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

/**
 * Hook to setup MFA
 */
export const useSetupMfa = () => {
  return useMutation<MfaSetupResponse, Error, void>({
    mutationFn: () => authApi.setupMfa(),
  });
};

/**
 * Hook to confirm MFA setup
 */
export const useConfirmMfaSetup = () => {
  const queryClient = useQueryClient();

  return useMutation<{ backupCodes: string[] }, Error, string>({
    mutationFn: (code) => authApi.confirmMfaSetup(code),
    onSuccess: () => {
      // Refresh user data to reflect MFA enabled
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
};

/**
 * Hook to disable MFA
 */
export const useDisableMfa = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (password) => authApi.disableMfa(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation<void, Error, ChangePasswordPayload>({
    mutationFn: (payload) => authApi.changePassword(payload),
  });
};

/**
 * Hook to request password reset
 */
export const useForgotPassword = () => {
  return useMutation<void, Error, ForgotPasswordPayload>({
    mutationFn: (payload) => authApi.forgotPassword(payload),
  });
};

/**
 * Hook to reset password with token
 */
export const useResetPassword = () => {
  return useMutation<void, Error, ResetPasswordPayload>({
    mutationFn: (payload) => authApi.resetPassword(payload),
  });
};
