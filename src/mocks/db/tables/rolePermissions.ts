/**
 * Role-Permission Mappings Table
 * 
 * Defines which permissions each role has.
 * This is a many-to-many relationship between roles and permissions.
 */

import { permissionsTable } from './permissions';

export interface RolePermissionRow {
  roleId: number;
  permissionId: number;
}

// ============================================================================
// ROLE-PERMISSION MAPPINGS
// ============================================================================

export const rolePermissionsTable: RolePermissionRow[] = [
  // -------------------------------------------------------------------------
  // GLOBAL SCOPE ROLES
  // -------------------------------------------------------------------------

  // System Admin (id: 1) - ALL permissions
  ...permissionsTable.map(p => ({ roleId: 1, permissionId: p.id })),

  // Group Chairman (id: 2) - All board access + meeting control + approvals
  { roleId: 2, permissionId: 1 },  // users.view
  { roleId: 2, permissionId: 10 }, // boards.view
  { roleId: 2, permissionId: 14 }, // boards.view_all
  { roleId: 2, permissionId: 20 }, // meetings.view
  { roleId: 2, permissionId: 24 }, // meetings.control
  { roleId: 2, permissionId: 30 }, // documents.view
  { roleId: 2, permissionId: 33 }, // documents.download
  { roleId: 2, permissionId: 40 }, // voting.view
  { roleId: 2, permissionId: 42 }, // voting.cast
  { roleId: 2, permissionId: 43 }, // voting.start
  { roleId: 2, permissionId: 50 }, // minutes.view
  { roleId: 2, permissionId: 52 }, // minutes.approve
  { roleId: 2, permissionId: 53 }, // minutes.sign
  { roleId: 2, permissionId: 60 }, // reports.view
  { roleId: 2, permissionId: 61 }, // reports.export
  { roleId: 2, permissionId: 62 }, // reports.all
  { roleId: 2, permissionId: 70 }, // settings.view

  // Group Company Secretary (id: 3) - Cross-board admin access
  { roleId: 3, permissionId: 1 },  // users.view
  { roleId: 3, permissionId: 2 },  // users.create
  { roleId: 3, permissionId: 3 },  // users.edit
  { roleId: 3, permissionId: 10 }, // boards.view
  { roleId: 3, permissionId: 12 }, // boards.edit
  { roleId: 3, permissionId: 13 }, // boards.members
  { roleId: 3, permissionId: 14 }, // boards.view_all
  { roleId: 3, permissionId: 20 }, // meetings.view
  { roleId: 3, permissionId: 21 }, // meetings.create
  { roleId: 3, permissionId: 22 }, // meetings.edit
  { roleId: 3, permissionId: 23 }, // meetings.cancel
  { roleId: 3, permissionId: 30 }, // documents.view
  { roleId: 3, permissionId: 31 }, // documents.upload
  { roleId: 3, permissionId: 32 }, // documents.delete
  { roleId: 3, permissionId: 33 }, // documents.download
  { roleId: 3, permissionId: 40 }, // voting.view
  { roleId: 3, permissionId: 41 }, // voting.create
  { roleId: 3, permissionId: 50 }, // minutes.view
  { roleId: 3, permissionId: 51 }, // minutes.create
  { roleId: 3, permissionId: 60 }, // reports.view
  { roleId: 3, permissionId: 61 }, // reports.export
  { roleId: 3, permissionId: 62 }, // reports.all
  { roleId: 3, permissionId: 70 }, // settings.view
  { roleId: 3, permissionId: 71 }, // settings.edit
  { roleId: 3, permissionId: 80 }, // admin.access
  { roleId: 3, permissionId: 81 }, // admin.audit

  // -------------------------------------------------------------------------
  // BOARD SCOPE ROLES
  // -------------------------------------------------------------------------

  // Chairman (id: 10) - Board-level chairman privileges
  { roleId: 10, permissionId: 1 },  // users.view
  { roleId: 10, permissionId: 10 }, // boards.view
  { roleId: 10, permissionId: 20 }, // meetings.view
  { roleId: 10, permissionId: 24 }, // meetings.control
  { roleId: 10, permissionId: 30 }, // documents.view
  { roleId: 10, permissionId: 33 }, // documents.download
  { roleId: 10, permissionId: 40 }, // voting.view
  { roleId: 10, permissionId: 42 }, // voting.cast
  { roleId: 10, permissionId: 43 }, // voting.start
  { roleId: 10, permissionId: 50 }, // minutes.view
  { roleId: 10, permissionId: 52 }, // minutes.approve
  { roleId: 10, permissionId: 53 }, // minutes.sign
  { roleId: 10, permissionId: 60 }, // reports.view
  { roleId: 10, permissionId: 61 }, // reports.export
  { roleId: 10, permissionId: 70 }, // settings.view

  // Vice Chairman (id: 11) - Similar to Chairman but no signing
  { roleId: 11, permissionId: 1 },  // users.view
  { roleId: 11, permissionId: 10 }, // boards.view
  { roleId: 11, permissionId: 20 }, // meetings.view
  { roleId: 11, permissionId: 24 }, // meetings.control
  { roleId: 11, permissionId: 30 }, // documents.view
  { roleId: 11, permissionId: 33 }, // documents.download
  { roleId: 11, permissionId: 40 }, // voting.view
  { roleId: 11, permissionId: 42 }, // voting.cast
  { roleId: 11, permissionId: 43 }, // voting.start
  { roleId: 11, permissionId: 50 }, // minutes.view
  { roleId: 11, permissionId: 52 }, // minutes.approve
  { roleId: 11, permissionId: 60 }, // reports.view
  { roleId: 11, permissionId: 61 }, // reports.export
  { roleId: 11, permissionId: 70 }, // settings.view

  // Company Secretary (id: 12) - Board-specific secretary
  { roleId: 12, permissionId: 1 },  // users.view
  { roleId: 12, permissionId: 10 }, // boards.view
  { roleId: 12, permissionId: 13 }, // boards.members
  { roleId: 12, permissionId: 20 }, // meetings.view
  { roleId: 12, permissionId: 21 }, // meetings.create
  { roleId: 12, permissionId: 22 }, // meetings.edit
  { roleId: 12, permissionId: 23 }, // meetings.cancel
  { roleId: 12, permissionId: 30 }, // documents.view
  { roleId: 12, permissionId: 31 }, // documents.upload
  { roleId: 12, permissionId: 32 }, // documents.delete
  { roleId: 12, permissionId: 33 }, // documents.download
  { roleId: 12, permissionId: 40 }, // voting.view
  { roleId: 12, permissionId: 41 }, // voting.create
  { roleId: 12, permissionId: 50 }, // minutes.view
  { roleId: 12, permissionId: 51 }, // minutes.create
  { roleId: 12, permissionId: 60 }, // reports.view
  { roleId: 12, permissionId: 61 }, // reports.export
  { roleId: 12, permissionId: 70 }, // settings.view

  // Board Member (id: 13) - Regular member with voting rights
  { roleId: 13, permissionId: 20 }, // meetings.view
  { roleId: 13, permissionId: 30 }, // documents.view
  { roleId: 13, permissionId: 33 }, // documents.download
  { roleId: 13, permissionId: 40 }, // voting.view
  { roleId: 13, permissionId: 42 }, // voting.cast
  { roleId: 13, permissionId: 50 }, // minutes.view
  { roleId: 13, permissionId: 60 }, // reports.view
  { roleId: 13, permissionId: 70 }, // settings.view

  // Committee Member (id: 14) - Committee participant
  { roleId: 14, permissionId: 20 }, // meetings.view
  { roleId: 14, permissionId: 30 }, // documents.view
  { roleId: 14, permissionId: 33 }, // documents.download
  { roleId: 14, permissionId: 40 }, // voting.view
  { roleId: 14, permissionId: 42 }, // voting.cast
  { roleId: 14, permissionId: 50 }, // minutes.view
  { roleId: 14, permissionId: 70 }, // settings.view

  // Executive Member (id: 15) - CEO, CFO, etc.
  { roleId: 15, permissionId: 1 },  // users.view
  { roleId: 15, permissionId: 10 }, // boards.view
  { roleId: 15, permissionId: 20 }, // meetings.view
  { roleId: 15, permissionId: 24 }, // meetings.control
  { roleId: 15, permissionId: 30 }, // documents.view
  { roleId: 15, permissionId: 31 }, // documents.upload
  { roleId: 15, permissionId: 33 }, // documents.download
  { roleId: 15, permissionId: 40 }, // voting.view
  { roleId: 15, permissionId: 42 }, // voting.cast
  { roleId: 15, permissionId: 50 }, // minutes.view
  { roleId: 15, permissionId: 51 }, // minutes.create
  { roleId: 15, permissionId: 52 }, // minutes.approve
  { roleId: 15, permissionId: 53 }, // minutes.sign
  { roleId: 15, permissionId: 60 }, // reports.view
  { roleId: 15, permissionId: 61 }, // reports.export
  { roleId: 15, permissionId: 62 }, // reports.all
  { roleId: 15, permissionId: 70 }, // settings.view

  // Observer (id: 16) - View-only access
  { roleId: 16, permissionId: 20 }, // meetings.view
  { roleId: 16, permissionId: 30 }, // documents.view
  { roleId: 16, permissionId: 40 }, // voting.view
  { roleId: 16, permissionId: 50 }, // minutes.view
  { roleId: 16, permissionId: 70 }, // settings.view

  // Presenter (id: 17) - Can present in meetings
  { roleId: 17, permissionId: 20 }, // meetings.view
  { roleId: 17, permissionId: 25 }, // meetings.present
  { roleId: 17, permissionId: 30 }, // documents.view
  { roleId: 17, permissionId: 31 }, // documents.upload
  { roleId: 17, permissionId: 33 }, // documents.download

  // Guest (id: 18) - Limited temporary access
  { roleId: 18, permissionId: 20 }, // meetings.view
  { roleId: 18, permissionId: 30 }, // documents.view
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all permission IDs for a role
 */
export const getPermissionIdsForRole = (roleId: number): number[] => {
  return rolePermissionsTable
    .filter(rp => rp.roleId === roleId)
    .map(rp => rp.permissionId);
};

/**
 * Get all permission codes for a role
 */
export const getPermissionCodesForRole = (roleId: number): string[] => {
  const permissionIds = getPermissionIdsForRole(roleId);
  return permissionsTable
    .filter(p => permissionIds.includes(p.id))
    .map(p => p.code);
};

/**
 * Check if a role has a specific permission
 */
export const roleHasPermission = (roleId: number, permissionId: number): boolean => {
  return rolePermissionsTable.some(
    rp => rp.roleId === roleId && rp.permissionId === permissionId
  );
};

/**
 * Check if a role has a specific permission by code
 */
export const roleHasPermissionCode = (roleId: number, permissionCode: string): boolean => {
  const permission = permissionsTable.find(p => p.code === permissionCode);
  if (!permission) return false;
  return roleHasPermission(roleId, permission.id);
};
