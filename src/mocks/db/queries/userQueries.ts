/**
 * User Queries - Relationship helpers (like SQL queries)
 */

import { usersTable, type UserRow } from '../tables/users';
import { userBoardRolesTable, getUserBoardRoles, getUserGlobalRoleAssignment, getUserDefaultBoardRole } from '../tables/userBoardRoles';
import { boardsTable } from '../tables/boards';
import { getRoleById } from '../tables/roles';
import { getAllUserPermissionCodes } from './roleQueries';
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
 * Get users by role code (searches in userBoardRoles)
 */
export const getUsersByRole = (roleCode: string): UserRow[] => {
  const userIdsWithRole = userBoardRolesTable
    .filter(ubr => {
      const role = getRoleById(ubr.roleId);
      return role?.code === roleCode && ubr.endDate === null;
    })
    .map(ubr => ubr.userId);
  
  return usersTable.filter(u => userIdsWithRole.includes(u.id));
};

/**
 * Get user's board memberships with role information
 * Only returns board-scoped roles (excludes global roles with null boardId)
 */
export const getUserMemberships = (userId: number) => {
  const boardRoles = getUserBoardRoles(userId);

  // Filter to only board-scoped roles (exclude global roles with null boardId)
  // BoardMembershipSchema expects boardId to be a string, not null
  return boardRoles
    .filter(br => br.scope === 'board' && br.boardId !== null)
    .map(br => {
      const board = boardsTable.find(b => b.id === br.boardId);
      const role = getRoleById(br.roleId);
      return {
        id: br.id,
        boardId: br.boardId as string, // Safe to assert as string since we filtered out nulls
        boardName: board?.name || '',
        boardType: board?.type || 'main',
        role: role?.code || 'unknown',
        roleName: role?.name || 'Unknown',
        roleId: br.roleId,
        startDate: br.startDate,
        endDate: br.endDate,
        isActive: br.endDate === null,
        isDefault: br.isDefault,
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
      isDefault: membership.isDefault,
    };
  }).filter(Boolean);
};

/**
 * Convert UserRow to AuthUser (for authentication)
 */
export const toAuthUser = (user: UserRow, boardId?: string): AuthUser => {
  // Get user's global role (if any)
  const globalRoleAssignment = getUserGlobalRoleAssignment(user.id);
  let globalRole = undefined;
  let jobTitle = 'User'; // Default
  
  if (globalRoleAssignment) {
    const role = getRoleById(globalRoleAssignment.roleId);
    if (role) {
      globalRole = {
        code: role.code as any, // BoardRole type
        name: role.name,
        scope: 'global' as const,
      };
      jobTitle = role.name; // Use global role name as job title
    }
  }
  
  // Get default board from parameter, default membership, or first membership
  const defaultBoardRole = getUserDefaultBoardRole(user.id);
  const memberships = getUserMemberships(user.id);
  const defaultBoardId = boardId || 
    defaultBoardRole?.boardId || 
    memberships[0]?.boardId || 
    undefined;
  
  // If no global role, use default board role name as job title
  if (!globalRole && defaultBoardRole) {
    const role = getRoleById(defaultBoardRole.roleId);
    if (role) {
      jobTitle = role.name;
    }
  } else if (!globalRole && memberships.length > 0 && memberships[0]) {
    // Fallback to first membership role name
    jobTitle = memberships[0].roleName;
  }
  
  // Get aggregated permissions from all roles
  const permissions = getAllUserPermissionCodes(user.id);
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    jobTitle,
    avatar: user.avatar,
    globalRole,
    defaultBoardId,
    permissions,
    mfaEnabled: user.mfaEnabled,
    mfaRequired: user.mfaEnabled && user.mfaSetupComplete,
    mustChangePassword: user.status === 'pending',
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
  
  // Role filter (filters by role code in userBoardRoles)
  if (options.role) {
    const userIdsWithRole = userBoardRolesTable
      .filter(ubr => {
        const role = getRoleById(ubr.roleId);
        return role?.code === options.role && ubr.endDate === null;
      })
      .map(ubr => ubr.userId);
    filtered = filtered.filter(u => userIdsWithRole.includes(u.id));
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

/**
 * Get user's primary role code for display in lists
 * Uses same logic as jobTitle in toAuthUser:
 * 1. Global role (if exists)
 * 2. Default board role
 * 3. First board membership role
 * 4. Default to 'board_member'
 */
export const getUserPrimaryRole = (userId: number): string => {
  // Check for global role first
  const globalRoleAssignment = getUserGlobalRoleAssignment(userId);
  if (globalRoleAssignment) {
    const role = getRoleById(globalRoleAssignment.roleId);
    if (role) return role.code;
  }

  // Check for default board role
  const defaultBoardRole = getUserDefaultBoardRole(userId);
  if (defaultBoardRole) {
    const role = getRoleById(defaultBoardRole.roleId);
    if (role) return role.code;
  }

  // Fallback to first membership role
  const memberships = getUserMemberships(userId);
  if (memberships.length > 0) {
    return memberships[0].role || 'board_member';
  }

  // Ultimate fallback
  return 'board_member';
};
