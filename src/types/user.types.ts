/**
 * User Types
 * Based on documented user management requirements
 */

import { z } from 'zod';
import { SystemRoleSchema } from './role.types';
import { BoardMembershipSchema } from './board.types';

// User status
export const UserStatusSchema = z.enum(['active', 'inactive', 'pending']);

// User (list view - minimal data)
export const UserListItemSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  avatar: z.string().nullable(),
  primaryRole: SystemRoleSchema,
  status: UserStatusSchema,
  boardCount: z.number(),
  mfaEnabled: z.boolean(),
  lastLogin: z.string().nullable(),
  createdAt: z.string(),
});

// User (detail view - full data)
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  alternatePhone: z.string().nullable(),
  alternateEmail: z.string().email().nullable(),
  employeeId: z.string().nullable(),
  avatar: z.string().nullable(),
  timezone: z.string().default('Africa/Nairobi'),
  primaryRole: SystemRoleSchema,
  status: UserStatusSchema,
  mfaEnabled: z.boolean(),
  mfaSetupComplete: z.boolean(),
  hasCertificate: z.boolean(),
  certificateExpiry: z.string().nullable(),
  boardMemberships: z.array(BoardMembershipSchema),
  lastLogin: z.string().nullable(),
  lastPasswordChange: z.string().nullable(),
  failedLoginAttempts: z.number(),
  lockedUntil: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().nullable(),
});

// Create user payload (from wizard)
export const CreateUserPayloadSchema = z.object({
  // Step 1: Basic Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format').optional().or(z.literal('')),
  alternatePhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format').optional().or(z.literal('')),
  alternateEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  employeeId: z.string().optional(),

  // Step 2: Role & Permissions
  primaryRole: SystemRoleSchema,
  requireMfa: z.boolean().default(true),
  status: z.enum(['active', 'inactive']).default('active'),

  // Step 3: Board Assignments
  boardAssignments: z.array(z.object({
    boardId: z.string(),
    role: z.string(),
    startDate: z.string(),
  })).optional(),
});

// Update user payload
export const UpdateUserPayloadSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/).optional().or(z.literal('')),
  alternatePhone: z.string().regex(/^\+?[0-9]{10,15}$/).optional().or(z.literal('')),
  alternateEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  employeeId: z.string().optional(),
  primaryRole: SystemRoleSchema.optional(),
  requireMfa: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  deactivationReason: z.string().optional(),
  timezone: z.string().optional(),
});

// Email check response
export const EmailCheckResponseSchema = z.object({
  available: z.boolean(),
  message: z.string().optional(),
});

// User activity log
export const UserActivitySchema = z.object({
  id: z.number(),
  userId: z.number(),
  action: z.string(),
  description: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
});

// Device type
export const DeviceTypeSchema = z.enum(['mobile', 'tablet', 'desktop', 'unknown']);

// User session (device tracking)
export const UserSessionSchema = z.object({
  id: z.string(),
  userId: z.number(),

  // Device Information
  deviceType: DeviceTypeSchema,
  deviceName: z.string(), // "iPhone 13", "Windows PC", etc.
  browser: z.string(), // "Chrome", "Safari", "Firefox"
  browserVersion: z.string(),
  operatingSystem: z.string(), // "iOS 15", "Windows 11", etc.

  // Network Information
  ipAddress: z.string(),
  location: z.string().nullable(), // City, Country (from IP geolocation)

  // Session Tracking
  userAgent: z.string(), // Full user agent string
  sessionToken: z.string(), // Reference to auth session
  isActive: z.boolean(),
  lastAccessedAt: z.string(), // ISO timestamp
  firstAccessedAt: z.string(), // ISO timestamp
  expiresAt: z.string(), // Session expiry

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Types
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UserListItem = z.infer<typeof UserListItemSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserPayload = z.infer<typeof CreateUserPayloadSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;
export type EmailCheckResponse = z.infer<typeof EmailCheckResponseSchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type DeviceType = z.infer<typeof DeviceTypeSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;

// User filter params
export interface UserFilterParams {
  search?: string;
  status?: UserStatus;
  role?: string;
  boardId?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}
