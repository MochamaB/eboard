/**
 * User Queries - Relationship helpers (like SQL queries)
 */

import { usersTable, type UserRow } from '../tables/users';
import { userBoardRolesTable, getUserBoardRoles } from '../tables/userBoardRoles';
import { boardsTable } from '../tables/boards';
import { getRoleById } from '../tables/roles';
import { getUserPermissionCodesOnBoard, getAllUserPermissionCodes } from './roleQueries';
import type { AuthUser } from '../../../types/auth.types';

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all users
 */
export const getAllUsers = (): UserRow[] => {
  return [...usersTable];
};

/**
 * Get user by ID
 */
export const getUserById = (id: number): UserRow | undefined => {
  return usersTable.find(u => u.id === id);
};

/**
 * Get user by email
 */
export const getUserByEmail = (email: string): UserRow | undefined => {
  return usersTable.find(u => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * Get users by role
 */
export const getUsersByRole = (role: string): UserRow[] => {
  return usersTable.filter(u => u.primaryRole === role);
};

/**
 * Get user's board memberships with role information
 */
export const getUserMemberships = (userId: number) => {
  const boardRoles = getUserBoardRoles(userId);
  
  return boardRoles.map(br => {
    const board = boardsTable.find(b => b.id === br.boardId);
    const role = getRoleById(br.roleId);
    return {
      id: br.id,
      boardId: br.boardId,
      boardName: board?.name || '',
      boardType: board?.type || 'main',
      role: role?.code || 'unknown',
      roleName: role?.name || 'Unknown',
      roleId: br.roleId,
      startDate: br.startDate,
      endDate: br.endDate,
      isActive: br.endDate === null,
      isPrimary: br.isPrimary,
    };
  });
};

/**
 * Get users for a specific board
 */
export const getUsersForBoard = (boardId: string) => {
  const memberships = userBoardRolesTable.filter(
    ubr => ubr.boardId === boardId && ubr.endDate === null
  );
  
  return memberships.map(membership => {
    const user = usersTable.find(u => u.id === membership.userId);
    if (!user) return null;
    
    const role = getRoleById(membership.roleId);
    
    return {
      ...user,
      boardRole: role?.code || 'unknown',
      boardRoleName: role?.name || 'Unknown',
      roleId: membership.roleId,
      membershipStartDate: membership.startDate,
      isPrimary: membership.isPrimary,
    };
  }).filter(Boolean);
};

/**
 * Convert UserRow to AuthUser (for authentication)
 */
export const toAuthUser = (user: UserRow, boardId?: string): AuthUser => {
  const memberships = getUserMemberships(user.id);
  
  // Get default board from parameter, primary membership, or ktda-ms
  const defaultBoardId = boardId || 
    memberships.find(m => m.isPrimary)?.boardId || 
    memberships[0]?.boardId || 
    'ktda-ms';
  
  // Get permissions for the default board context
  const permissions = boardId 
    ? getUserPermissionCodesOnBoard(user.id, boardId)
    : getAllUserPermissionCodes(user.id);
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    avatar: user.avatar,
    primaryRole: user.primaryRole as AuthUser['primaryRole'],
    permissions,
    mfaEnabled: user.mfaEnabled,
    mfaRequired: user.mfaEnabled && user.mfaSetupComplete,
    mustChangePassword: user.status === 'pending',
    defaultOrgId: defaultBoardId,
  };
};

/**
 * Filter users with pagination
 */
export interface UserFilterOptions {
  search?: string;
  role?: string;
  status?: UserRow['status'];
  boardId?: string;
  page?: number;
  pageSize?: number;
}

export const filterUsers = (options: UserFilterOptions) => {
  let filtered = [...usersTable];
  
  // Search filter
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(u =>
      u.fullName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.firstName.toLowerCase().includes(searchLower) ||
      u.lastName.toLowerCase().includes(searchLower)
    );
  }
  
  // Role filter
  if (options.role) {
    filtered = filtered.filter(u => u.primaryRole === options.role);
  }
  
  // Status filter
  if (options.status) {
    filtered = filtered.filter(u => u.status === options.status);
  }
  
  // Board filter (users who are members of a specific board)
  if (options.boardId) {
    const boardUserIds = userBoardRolesTable
      .filter(ubr => ubr.boardId === options.boardId && ubr.endDate === null)
      .map(ubr => ubr.userId);
    filtered = filtered.filter(u => boardUserIds.includes(u.id));
  }
  
  // Pagination
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  
  // Add memberships to each user
  const usersWithMemberships = paginated.map(user => ({
    ...user,
    boardMemberships: getUserMemberships(user.id),
  }));
  
  return {
    data: usersWithMemberships,
    total,
    page,
    pageSize,
    totalPages,
  };
};
