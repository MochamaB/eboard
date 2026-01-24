/**
 * Role Queries - Helper functions for role and permission lookups
 */

import type { RoleRow } from '../tables/roles';
import type { PermissionRow } from '../tables/permissions';
import { 
  getRoleById,
  getRoleByCode
} from '../tables/roles';
import { 
  permissionsTable
} from '../tables/permissions';
import { 
  getPermissionIdsForRole,
  getPermissionCodesForRole,
  roleHasPermissionCode 
} from '../tables/rolePermissions';
import { 
  userBoardRolesTable,
  getUserBoardRoles,
  getUserRoleOnBoard,
  getUsersWithRoleOnBoard,
  getUserBoardIds
} from '../tables/userBoardRoles';

// ============================================================================
// ROLE PERMISSION QUERIES
// ============================================================================

/**
 * Get all permissions for a specific role
 * @param roleId - Role ID
 * @returns Array of permission objects
 */
export const getRolePermissions = (roleId: number): PermissionRow[] => {
  const permissionIds = getPermissionIdsForRole(roleId);
  return permissionsTable.filter(p => permissionIds.includes(p.id));
};

/**
 * Get permission codes for a role (useful for authorization checks)
 * @param roleId - Role ID
 * @returns Array of permission codes (e.g., ['users.view', 'boards.create'])
 */
export const getRolePermissionCodes = (roleId: number): string[] => {
  return getPermissionCodesForRole(roleId);
};

// ============================================================================
// USER PERMISSION QUERIES
// ============================================================================

/**
 * Get all permissions for a user on a specific board
 * Looks up user's role on the board, then gets permissions for that role
 * @param userId - User ID
 * @param boardId - Board ID
 * @returns Array of permission objects
 */
export const getUserPermissionsOnBoard = (
  userId: number,
  boardId: string
): PermissionRow[] => {
  const userBoardRole = getUserRoleOnBoard(userId, boardId);
  if (!userBoardRole) return [];

  const role = getRoleById(userBoardRole.roleId);
  if (!role) return [];

  // If global scope role, get permissions for that role
  if (role.scope === 'global') {
    return getRolePermissions(role.id);
  }

  // If board scope role, get permissions for that role
  return getRolePermissions(role.id);
};

/**
 * Get all permission codes for a user on a specific board
 * @param userId - User ID
 * @param boardId - Board ID
 * @returns Array of permission codes
 */
export const getUserPermissionCodesOnBoard = (
  userId: number,
  boardId: string
): string[] => {
  const permissions = getUserPermissionsOnBoard(userId, boardId);
  return permissions.map(p => p.code);
};

/**
 * Check if user has a specific permission on a board
 * @param userId - User ID
 * @param boardId - Board ID
 * @param permissionCode - Permission code (e.g., 'meetings.create')
 * @returns True if user has permission
 */
export const userHasPermissionOnBoard = (
  userId: number,
  boardId: string,
  permissionCode: string
): boolean => {
  const userBoardRole = getUserRoleOnBoard(userId, boardId);
  if (!userBoardRole) return false;

  return roleHasPermissionCode(userBoardRole.roleId, permissionCode);
};

/**
 * Get all permissions for a user across all their boards
 * Aggregates unique permissions from all board roles
 * @param userId - User ID
 * @returns Array of unique permission objects
 */
export const getAllUserPermissions = (userId: number): PermissionRow[] => {
  const boardRoles = getUserBoardRoles(userId);
  const allPermissionIds = new Set<number>();

  boardRoles.forEach(br => {
    const permIds = getPermissionIdsForRole(br.roleId);
    permIds.forEach(id => allPermissionIds.add(id));
  });

  return permissionsTable.filter(p => allPermissionIds.has(p.id));
};

/**
 * Get all unique permission codes for a user across all boards
 * @param userId - User ID
 * @returns Array of unique permission codes
 */
export const getAllUserPermissionCodes = (userId: number): string[] => {
  const permissions = getAllUserPermissions(userId);
  return permissions.map(p => p.code);
};

// ============================================================================
// USER ROLE QUERIES
// ============================================================================

/**
 * Get user's role object on a specific board
 * @param userId - User ID
 * @param boardId - Board ID
 * @returns Role object or undefined
 */
export const getUserRoleObjectOnBoard = (
  userId: number,
  boardId: string
): RoleRow | undefined => {
  const userBoardRole = getUserRoleOnBoard(userId, boardId);
  if (!userBoardRole) return undefined;

  return getRoleById(userBoardRole.roleId);
};

/**
 * Check if user has a global scope role
 * @param userId - User ID
 * @returns True if user has any global role
 */
export const userHasGlobalRole = (userId: number): boolean => {
  const boardRoles = getUserBoardRoles(userId);
  return boardRoles.some(br => {
    const role = getRoleById(br.roleId);
    return role?.scope === 'global';
  });
};

/**
 * Get user's global role if they have one
 * @param userId - User ID
 * @returns Global role object or undefined
 */
export const getUserGlobalRole = (userId: number): RoleRow | undefined => {
  const boardRoles = getUserBoardRoles(userId);
  
  for (const br of boardRoles) {
    const role = getRoleById(br.roleId);
    if (role?.scope === 'global') {
      return role;
    }
  }
  
  return undefined;
};

/**
 * Check if user is system admin
 * @param userId - User ID
 * @returns True if user has system_admin role
 */
export const isSystemAdmin = (userId: number): boolean => {
  const globalRole = getUserGlobalRole(userId);
  return globalRole?.code === 'system_admin';
};

/**
 * Check if user is group chairman
 * @param userId - User ID
 * @returns True if user has group_chairman role
 */
export const isGroupChairman = (userId: number): boolean => {
  const globalRole = getUserGlobalRole(userId);
  return globalRole?.code === 'group_chairman';
};

/**
 * Check if user is group company secretary
 * @param userId - User ID
 * @returns True if user has group_company_secretary role
 */
export const isGroupCompanySecretary = (userId: number): boolean => {
  const globalRole = getUserGlobalRole(userId);
  return globalRole?.code === 'group_company_secretary';
};

// ============================================================================
// BOARD ACCESS QUERIES
// ============================================================================

/**
 * Get all boards a user has access to with their roles
 * @param userId - User ID
 * @returns Array of objects with boardId and role
 */
export const getUserBoardAccess = (userId: number): Array<{
  boardId: string;
  roleId: number;
  roleName: string;
  roleCode: string;
  isPrimary: boolean;
}> => {
  const boardRoles = getUserBoardRoles(userId);
  
  return boardRoles.map(br => {
    const role = getRoleById(br.roleId);
    return {
      boardId: br.boardId,
      roleId: br.roleId,
      roleName: role?.name || 'Unknown',
      roleCode: role?.code || 'unknown',
      isPrimary: br.isPrimary,
    };
  });
};

/**
 * Check if user can access multiple boards (useful for "all boards" view)
 * @param userId - User ID
 * @returns True if user has global role or access to multiple boards
 */
export const canAccessAllBoards = (userId: number): boolean => {
  // System admins, group chairmen, and group secretaries can access all boards
  if (userHasGlobalRole(userId)) {
    return true;
  }

  // Users with access to multiple boards
  const boardIds = getUserBoardIds(userId);
  return boardIds.length > 1;
};

// ============================================================================
// BOARD MEMBER QUERIES
// ============================================================================

/**
 * Get all members of a board with their roles
 * @param boardId - Board ID
 * @returns Array of user-role mappings
 */
export const getBoardMembers = (boardId: string): Array<{
  userId: number;
  roleId: number;
  roleName: string;
  roleCode: string;
  isPrimary: boolean;
  startDate: string;
}> => {
  const memberships = userBoardRolesTable.filter(
    ubr => ubr.boardId === boardId && ubr.endDate === null
  );

  return memberships.map(m => {
    const role = getRoleById(m.roleId);
    return {
      userId: m.userId,
      roleId: m.roleId,
      roleName: role?.name || 'Unknown',
      roleCode: role?.code || 'unknown',
      isPrimary: m.isPrimary,
      startDate: m.startDate,
    };
  });
};

/**
 * Get board chairman
 * @param boardId - Board ID
 * @returns User ID of chairman or undefined
 */
export const getBoardChairman = (boardId: string): number | undefined => {
  const chairmanRole = getRoleByCode('chairman');
  if (!chairmanRole) return undefined;

  const chairmen = getUsersWithRoleOnBoard(boardId, chairmanRole.id);
  return chairmen.length > 0 ? chairmen[0].userId : undefined;
};

/**
 * Get board secretary
 * @param boardId - Board ID
 * @returns User ID of secretary or undefined
 */
export const getBoardSecretary = (boardId: string): number | undefined => {
  const secretaryRole = getRoleByCode('company_secretary');
  if (!secretaryRole) return undefined;

  const secretaries = getUsersWithRoleOnBoard(boardId, secretaryRole.id);
  return secretaries.length > 0 ? secretaries[0].userId : undefined;
};
