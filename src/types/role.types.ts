/**
 * Role & Permission Types
 * Based on documented system roles and permissions
 */

import { z } from 'zod';

// System Roles (from docs/02_REQUIREMENTS_DOCUMENT.md)
export const SystemRoleSchema = z.enum([
  'system_admin',           // Full system access across all boards
  'group_chairman',         // Group-level chairman (global access)
  'group_company_secretary', // Group-level company secretary (global access)
  'board_secretary',        // Create meetings, upload documents, manage participants
  'chairman',               // Control meetings, start votes, approve minutes
  'vice_chairman',          // Similar to Chairman for specific board
  'company_secretary',      // Board-level company secretary
  'board_member',           // Join meetings, vote, view documents
  'committee_member',       // Committee-specific access
  'executive_member',       // CEO, Company Secretary, Group Finance Director
  'presenter',              // Present at meetings
  'observer',               // View meetings but cannot vote
  'guest',                  // Temporary meeting access
]);

// Board-specific roles (role a user has ON a specific board)
export const BoardRoleSchema = z.enum([
  'chairman',
  'vice_chairman',
  'secretary',
  'member',
  'observer',
]);

// Permission categories
export const PermissionCategorySchema = z.enum([
  'users',
  'boards',
  'meetings',
  'documents',
  'voting',
  'minutes',
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

// Role with permissions
export const RoleSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  isSystem: z.boolean(), // System roles cannot be deleted
  permissions: z.array(PermissionSchema),
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
export type SystemRole = z.infer<typeof SystemRoleSchema>;
export type BoardRole = z.infer<typeof BoardRoleSchema>;
export type PermissionCategory = z.infer<typeof PermissionCategorySchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type CreateRolePayload = z.infer<typeof CreateRolePayloadSchema>;
export type UpdateRolePayload = z.infer<typeof UpdateRolePayloadSchema>;

// Role display info (for UI)
export const SYSTEM_ROLE_INFO: Record<SystemRole, { label: string; description: string; color: string }> = {
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

export const BOARD_ROLE_INFO: Record<BoardRole, { label: string; color: string }> = {
  chairman: { label: 'Chairman', color: 'gold' },
  vice_chairman: { label: 'Vice Chairman', color: 'orange' },
  secretary: { label: 'Secretary', color: 'blue' },
  member: { label: 'Member', color: 'green' },
  observer: { label: 'Observer', color: 'default' },
};
