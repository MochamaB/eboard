/**
 * Authentication Types
 * Based on documented auth requirements
 */

import { z } from 'zod';
import { BoardRoleSchema } from './board.types';

// Login payload
export const LoginPayloadSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Login response
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(), // seconds
  user: z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    jobTitle: z.string(),
    avatar: z.string().nullable(),
    // Global role (if user has one) - from userBoardRoles with scope='global'
    globalRole: z.object({
      code: BoardRoleSchema,
      name: z.string(),
      scope: z.literal('global'),
    }).optional(),
    // Default board for initial navigation
    defaultBoardId: z.string().optional(),
    // Aggregated permissions from all roles
    permissions: z.array(z.string()),
    mfaEnabled: z.boolean(),
    mfaRequired: z.boolean(), // True if MFA verification needed
    mustChangePassword: z.boolean(), // True for first-time login
  }),
});

// MFA verification payload
export const MfaVerifyPayloadSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
  trustDevice: z.boolean().optional(),
});

// MFA setup response
export const MfaSetupResponseSchema = z.object({
  secret: z.string(),
  qrCodeUrl: z.string(),
  backupCodes: z.array(z.string()),
});

// Password requirements (from docs: 12+ chars, uppercase, lowercase, number, special)
export const PasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Change password payload
export const ChangePasswordPayloadSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Forgot password payload
export const ForgotPasswordPayloadSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Reset password payload
export const ResetPasswordPayloadSchema = z.object({
  token: z.string(),
  newPassword: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Auth state (for context)
export const AuthStateSchema = z.object({
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  user: LoginResponseSchema.shape.user.nullable(),
  accessToken: z.string().nullable(),
});

// Types
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type MfaVerifyPayload = z.infer<typeof MfaVerifyPayloadSchema>;
export type MfaSetupResponse = z.infer<typeof MfaSetupResponseSchema>;
export type ChangePasswordPayload = z.infer<typeof ChangePasswordPayloadSchema>;
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordPayloadSchema>;
export type ResetPasswordPayload = z.infer<typeof ResetPasswordPayloadSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;
export type AuthUser = LoginResponse['user'];

// Session info (from docs: 30 min inactivity timeout)
export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  LOCKOUT_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  TEMP_PASSWORD_EXPIRY_HOURS: 24,
  RESET_LINK_EXPIRY_HOURS: 1,
};
