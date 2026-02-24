/**
 * Role & Permission Types
 * Based on documented system roles and permissions
 */

import { z } from 'zod';

// System Roles - Now dynamic from backend API
// Use useLookups().roles and useLookups().roleOptions instead
// Values fetched from /api/lookups/roles (board-scope only, excludes global roles)
export const SystemRoleSchema = z.string();

// Board-specific roles - Now dynamic from backend API
// Use useLookups().roles and useLookups().roleOptions instead
export const BoardRoleSchema = z.string();

// Role scope - defines access breadth and assignment rules
export const RoleScopeSchema = z.enum([
  'global',           // System-wide roles with cross-board access (group_chairman, group_company_secretary)
  'board',            // Board-specific roles, multiple users allowed (board_member, observer, secretary)
  'board_leadership', // Board leadership roles, singular per board (chairman, vice_chairman),
  'participant',      // Participant roles, multiple users allowed (participant)
]);

// Permission categories - must match backend categories from RolePermissionSeeder
export const PermissionCategorySchema = z.enum([
  'users',
  'boards',
  'meetings',
  'agenda',
  'documents',
  'voting',
  'minutes',
  'actions',
  'resolutions',
  'templates',
  'reports',
  'settings',
  'admin',
]);

// Individual permission
export const PermissionSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  category: PermissionCategorySchema,
});

export const PermissionGroupSchema = z.object({
  category: PermissionCategorySchema,
  permissions: z.array(PermissionSchema),
});

// Role with permissions
export const RoleSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  isSystem: z.boolean(), // System roles cannot be deleted
  scope: z.string(), // 'global' or 'board'
  permissions: z.array(PermissionSchema).optional(), // Only included when includePermissions=true
  permissionCount: z.number().optional(), // Included when permissions array is not
  userCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Create/Update role payload
export const CreateRolePayloadSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  permissionIds: z.array(z.number()),
});

export const UpdateRolePayloadSchema = CreateRolePayloadSchema.partial();

// Types
export type SystemRole = string; // Dynamic role code from backend
export type BoardRole = string; // Dynamic role code from backend
export type RoleScope = z.infer<typeof RoleScopeSchema>;
export type PermissionCategory = z.infer<typeof PermissionCategorySchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type PermissionGroup = z.infer<typeof PermissionGroupSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type CreateRolePayload = z.infer<typeof CreateRolePayloadSchema>;
export type UpdateRolePayload = z.infer<typeof UpdateRolePayloadSchema>;

/**
 * @deprecated Use useLookups().roles and useLookups().getRoleByCode() instead
 * This hardcoded mapping will be removed once all components migrate to dynamic roles
 */
export const SYSTEM_ROLE_INFO: Record<string, { label: string; description: string; color: string }> = {
  system_admin: {
    label: 'System Administrator',
    description: 'Full system access across all boards and committees',
    color: 'red',
  },
  group_chairman: {
    label: 'Group Chairman',
    description: 'Group-level chairman with global board access',
    color: 'gold',
  },
  group_company_secretary: {
    label: 'Group Company Secretary',
    description: 'Group-level secretary with global board access',
    color: 'purple',
  },
  board_secretary: {
    label: 'Board Secretary',
    description: 'Can create meetings, upload documents, manage participants',
    color: 'blue',
  },
  chairman: {
    label: 'Chairman',
    description: 'Can control meetings, start votes, approve minutes',
    color: 'gold',
  },
  vice_chairman: {
    label: 'Vice Chairman',
    description: 'Similar to Chairman but for specific board/committee',
    color: 'orange',
  },
  company_secretary: {
    label: 'Company Secretary',
    description: 'Board-level secretary managing administration',
    color: 'blue',
  },
  board_member: {
    label: 'Board Member',
    description: 'Can join meetings, vote, view documents',
    color: 'green',
  },
  committee_member: {
    label: 'Committee Member',
    description: 'Can join committee meetings, vote, view committee documents',
    color: 'cyan',
  },
  executive_member: {
    label: 'Executive Member',
    description: 'CEO, Company Secretary, Group Finance Director',
    color: 'purple',
  },
  presenter: {
    label: 'Presenter',
    description: 'Can present at meetings',
    color: 'geekblue',
  },
  observer: {
    label: 'Observer',
    description: 'Can view meetings but cannot vote',
    color: 'default',
  },
  guest: {
    label: 'Guest',
    description: 'Temporary access to specific meeting only',
    color: 'default',
  },
};

/**
 * @deprecated Use useLookups().roles and useLookups().getRoleByCode() instead
 * This hardcoded mapping will be removed once all components migrate to dynamic roles
 */
export const BOARD_ROLE_INFO: Record<string, { label: string; color: string }> = {
  chairman: { label: 'Chairman', color: 'gold' },
  vice_chairman: { label: 'Vice Chairman', color: 'orange' },
  secretary: { label: 'Secretary', color: 'blue' },
  member: { label: 'Member', color: 'green' },
  observer: { label: 'Observer', color: 'default' },
};
