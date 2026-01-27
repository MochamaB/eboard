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

  // Chairman (id: 4) - Board-level chairman privileges
  { roleId: 4, permissionId: 1 },  // users.view
  { roleId: 4, permissionId: 10 }, // boards.view
  { roleId: 4, permissionId: 20 }, // meetings.view
  { roleId: 4, permissionId: 24 }, // meetings.control
  { roleId: 4, permissionId: 30 }, // documents.view
  { roleId: 4, permissionId: 33 }, // documents.download
  { roleId: 4, permissionId: 40 }, // voting.view
  { roleId: 4, permissionId: 42 }, // voting.cast
  { roleId: 4, permissionId: 43 }, // voting.start
  { roleId: 4, permissionId: 50 }, // minutes.view
  { roleId: 4, permissionId: 52 }, // minutes.approve
  { roleId: 4, permissionId: 53 }, // minutes.sign
  { roleId: 4, permissionId: 60 }, // reports.view
  { roleId: 4, permissionId: 61 }, // reports.export
  { roleId: 4, permissionId: 70 }, // settings.view

  // Vice Chairman (id: 5) - Similar to Chairman but no signing
  { roleId: 5, permissionId: 1 },  // users.view
  { roleId: 5, permissionId: 10 }, // boards.view
  { roleId: 5, permissionId: 20 }, // meetings.view
  { roleId: 5, permissionId: 24 }, // meetings.control
  { roleId: 5, permissionId: 30 }, // documents.view
  { roleId: 5, permissionId: 33 }, // documents.download
  { roleId: 5, permissionId: 40 }, // voting.view
  { roleId: 5, permissionId: 42 }, // voting.cast
  { roleId: 5, permissionId: 43 }, // voting.start
  { roleId: 5, permissionId: 50 }, // minutes.view
  { roleId: 5, permissionId: 52 }, // minutes.approve
  { roleId: 5, permissionId: 60 }, // reports.view
  { roleId: 5, permissionId: 61 }, // reports.export
  { roleId: 5, permissionId: 70 }, // settings.view

  // Board Secretary (id: 6) - Board-specific secretary
  { roleId: 6, permissionId: 1 },  // users.view
  { roleId: 6, permissionId: 10 }, // boards.view
  { roleId: 6, permissionId: 13 }, // boards.members
  { roleId: 6, permissionId: 20 }, // meetings.view
  { roleId: 6, permissionId: 21 }, // meetings.create
  { roleId: 6, permissionId: 22 }, // meetings.edit
  { roleId: 6, permissionId: 23 }, // meetings.cancel
  { roleId: 6, permissionId: 30 }, // documents.view
  { roleId: 6, permissionId: 31 }, // documents.upload
  { roleId: 6, permissionId: 32 }, // documents.delete
  { roleId: 6, permissionId: 33 }, // documents.download
  { roleId: 6, permissionId: 40 }, // voting.view
  { roleId: 6, permissionId: 41 }, // voting.create
  { roleId: 6, permissionId: 50 }, // minutes.view
  { roleId: 6, permissionId: 51 }, // minutes.create
  { roleId: 6, permissionId: 60 }, // reports.view
  { roleId: 6, permissionId: 61 }, // reports.export
  { roleId: 6, permissionId: 70 }, // settings.view

  // Board Member (id: 7) - Regular member with voting rights
  { roleId: 7, permissionId: 20 }, // meetings.view
  { roleId: 7, permissionId: 30 }, // documents.view
  { roleId: 7, permissionId: 33 }, // documents.download
  { roleId: 7, permissionId: 40 }, // voting.view
  { roleId: 7, permissionId: 42 }, // voting.cast
  { roleId: 7, permissionId: 50 }, // minutes.view
  { roleId: 7, permissionId: 60 }, // reports.view
  { roleId: 7, permissionId: 70 }, // settings.view

  // Committee Member (id: 8) - Committee participant
  { roleId: 8, permissionId: 20 }, // meetings.view
  { roleId: 8, permissionId: 30 }, // documents.view
  { roleId: 8, permissionId: 33 }, // documents.download
  { roleId: 8, permissionId: 40 }, // voting.view
  { roleId: 8, permissionId: 42 }, // voting.cast
  { roleId: 8, permissionId: 50 }, // minutes.view
  { roleId: 8, permissionId: 70 }, // settings.view

  // Executive Member (id: 9) - CEO, CFO, etc.
  { roleId: 9, permissionId: 1 },  // users.view
  { roleId: 9, permissionId: 10 }, // boards.view
  { roleId: 9, permissionId: 20 }, // meetings.view
  { roleId: 9, permissionId: 24 }, // meetings.control
  { roleId: 9, permissionId: 30 }, // documents.view
  { roleId: 9, permissionId: 31 }, // documents.upload
  { roleId: 9, permissionId: 33 }, // documents.download
  { roleId: 9, permissionId: 40 }, // voting.view
  { roleId: 9, permissionId: 42 }, // voting.cast
  { roleId: 9, permissionId: 50 }, // minutes.view
  { roleId: 9, permissionId: 51 }, // minutes.create
  { roleId: 9, permissionId: 52 }, // minutes.approve
  { roleId: 9, permissionId: 53 }, // minutes.sign
  { roleId: 9, permissionId: 60 }, // reports.view
  { roleId: 9, permissionId: 61 }, // reports.export
  { roleId: 9, permissionId: 62 }, // reports.all
  { roleId: 9, permissionId: 70 }, // settings.view

  // Observer (id: 10) - View-only access
  { roleId: 10, permissionId: 20 }, // meetings.view
  { roleId: 10, permissionId: 30 }, // documents.view
  { roleId: 10, permissionId: 40 }, // voting.view
  { roleId: 10, permissionId: 50 }, // minutes.view
  { roleId: 10, permissionId: 70 }, // settings.view

  // Presenter (id: 11) - Can present in meetings
  { roleId: 11, permissionId: 20 }, // meetings.view
  { roleId: 11, permissionId: 25 }, // meetings.present
  { roleId: 11, permissionId: 30 }, // documents.view
  { roleId: 11, permissionId: 31 }, // documents.upload
  { roleId: 11, permissionId: 33 }, // documents.download

  // Guest (id: 12) - Limited temporary access
  { roleId: 12, permissionId: 20 }, // meetings.view
  { roleId: 12, permissionId: 30 }, // documents.view

  // Company Secretary (id: 13) - Board-specific company secretary
  { roleId: 13, permissionId: 1 },  // users.view
  { roleId: 13, permissionId: 10 }, // boards.view
  { roleId: 13, permissionId: 13 }, // boards.members
  { roleId: 13, permissionId: 20 }, // meetings.view
  { roleId: 13, permissionId: 21 }, // meetings.create
  { roleId: 13, permissionId: 22 }, // meetings.edit
  { roleId: 13, permissionId: 23 }, // meetings.cancel
  { roleId: 13, permissionId: 30 }, // documents.view
  { roleId: 13, permissionId: 31 }, // documents.upload
  { roleId: 13, permissionId: 32 }, // documents.delete
  { roleId: 13, permissionId: 33 }, // documents.download
  { roleId: 13, permissionId: 40 }, // voting.view
  { roleId: 13, permissionId: 41 }, // voting.create
  { roleId: 13, permissionId: 50 }, // minutes.view
  { roleId: 13, permissionId: 51 }, // minutes.create
  { roleId: 13, permissionId: 60 }, // reports.view
  { roleId: 13, permissionId: 61 }, // reports.export
  { roleId: 13, permissionId: 70 }, // settings.view
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
