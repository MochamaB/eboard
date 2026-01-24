/**
 * User Board Queries - Functions for user-board access relationships
 * Determines which boards a user can access based on userBoardRoles
 */

import { boardsTable, type BoardRow } from '../tables/boards';
import { userBoardRolesTable } from '../tables/userBoardRoles';
import { rolesTable } from '../tables/roles';
import { getRolePermissions } from './roleQueries';

// ============================================================================
// USER BOARD ACCESS QUERIES
// ============================================================================

/**
 * Get all boards a user has direct access to (via userBoardRoles)
 * Does NOT include inherited access (e.g., committee access from parent board)
 */
export const getUserDirectBoards = (userId: number): BoardRow[] => {
  // Get user's active board-role assignments
  const memberships = userBoardRolesTable.filter(
    ubr => ubr.userId === userId && ubr.endDate === null
  );
  
  const boardIds = new Set(memberships.map(m => m.boardId));
  
  // Get boards user is directly a member of
  return boardsTable.filter(b => boardIds.has(b.id));
};

/**
 * Get all boards a user can access (direct + inherited)
 * Inherited access: If user is on a parent board, they can view its committees
 */
export const getUserAccessibleBoards = (userId: number): BoardRow[] => {
  const directBoards = getUserDirectBoards(userId);
  const directBoardIds = new Set(directBoards.map(b => b.id));
  
  // Get committees of boards user is member of (inherited access)
  const inheritedCommittees = boardsTable.filter(b => 
    b.type === 'committee' && 
    b.parentId && 
    directBoardIds.has(b.parentId) &&
    !directBoardIds.has(b.id) // Not already directly assigned
  );
  
  return [...directBoards, ...inheritedCommittees];
};

/**
 * Check if user has direct membership on a board
 */
export const isUserDirectMember = (userId: number, boardId: string): boolean => {
  return userBoardRolesTable.some(
    ubr => ubr.userId === userId && ubr.boardId === boardId && ubr.endDate === null
  );
};

/**
 * Check if user can access a specific board (direct or inherited)
 */
export const canUserAccessBoard = (userId: number, boardId: string): boolean => {
  // Check direct membership
  if (isUserDirectMember(userId, boardId)) {
    return true;
  }
  
  // Check inherited access (for committees)
  const board = boardsTable.find(b => b.id === boardId);
  if (board?.type === 'committee' && board.parentId) {
    return isUserDirectMember(userId, board.parentId);
  }
  
  return false;
};

/**
 * Get user's role on a specific board
 */
export const getUserRoleOnBoard = (userId: number, boardId: string): string | null => {
  const membership = userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.boardId === boardId && ubr.endDate === null
  );
  
  if (!membership) return null;
  
  const role = rolesTable.find(r => r.id === membership.roleId);
  return role?.code || null;
};

/**
 * Get user's primary board (the board marked as isPrimary, or first main board)
 */
export const getUserPrimaryBoard = (userId: number): BoardRow | undefined => {
  // First, check for explicitly marked primary board
  const primaryMembership = userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.isPrimary && ubr.endDate === null
  );
  
  if (primaryMembership) {
    const board = boardsTable.find(b => b.id === primaryMembership.boardId);
    if (board) return board;
  }
  
  // Fallback: Get user's boards and prioritize by type
  const userBoards = getUserDirectBoards(userId);
  
  // Priority: main > subsidiary > factory > committee
  const typeOrder: BoardRow['type'][] = ['main', 'subsidiary', 'factory', 'committee'];
  
  for (const type of typeOrder) {
    const board = userBoards.find(b => b.type === type);
    if (board) return board;
  }
  
  // Last resort: first board
  return userBoards[0];
};

/**
 * Check if user has access to multiple boards
 */
export const hasMultiBoardAccess = (userId: number): boolean => {
  return getUserDirectBoards(userId).length > 1;
};

/**
 * Check if user has a specific permission on a board
 */
export const hasPermissionOnBoard = (
  userId: number, 
  boardId: string, 
  permissionCode: string
): boolean => {
  // Get user's membership on this board
  const membership = userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.boardId === boardId && ubr.endDate === null
  );
  
  if (!membership) {
    // Check inherited access for committees
    const board = boardsTable.find(b => b.id === boardId);
    if (board?.type === 'committee' && board.parentId) {
      const parentMembership = userBoardRolesTable.find(
        ubr => ubr.userId === userId && ubr.boardId === board.parentId && ubr.endDate === null
      );
      if (!parentMembership) return false;
      
      // Use parent board role permissions
      const permissions = getRolePermissions(parentMembership.roleId);
      return permissions.some(p => p.code === permissionCode);
    }
    return false;
  }
  
  // Get permissions for user's role
  const permissions = getRolePermissions(membership.roleId);
  return permissions.some(p => p.code === permissionCode);
};

/**
 * Get all permissions user has on a specific board
 */
export const getUserBoardPermissions = (userId: number, boardId: string): string[] => {
  const membership = userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.boardId === boardId && ubr.endDate === null
  );
  
  if (!membership) {
    // Check inherited access for committees
    const board = boardsTable.find(b => b.id === boardId);
    if (board?.type === 'committee' && board.parentId) {
      const parentMembership = userBoardRolesTable.find(
        ubr => ubr.userId === userId && ubr.boardId === board.parentId && ubr.endDate === null
      );
      if (!parentMembership) return [];
      
      const permissions = getRolePermissions(parentMembership.roleId);
      return permissions.map(p => p.code);
    }
    return [];
  }
  
  const permissions = getRolePermissions(membership.roleId);
  return permissions.map(p => p.code);
};

/**
 * Get boards grouped by type for a user (for board selector UI)
 */
export const getUserBoardsGrouped = (userId: number) => {
  const boards = getUserAccessibleBoards(userId);
  
  return {
    main: boards.filter(b => b.type === 'main'),
    subsidiaries: boards.filter(b => b.type === 'subsidiary'),
    factories: boards.filter(b => b.type === 'factory'),
    committees: boards.filter(b => b.type === 'committee'),
  };
};

/**
 * Get factories grouped by zone for a user
 */
export const getUserFactoriesByZone = (userId: number) => {
  const boards = getUserAccessibleBoards(userId);
  const factories = boards.filter(b => b.type === 'factory');
  
  return factories.reduce((acc, factory) => {
    const zone = factory.zone || 'zone_1';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(factory);
    return acc;
  }, {} as Record<string, BoardRow[]>);
};

/**
 * Check if user has global admin access (can see all boards)
 * Global access roles: system_admin, group_chairman, group_company_secretary
 */
export const hasGlobalBoardAccess = (userId: number): boolean => {
  // Global access role codes
  const globalAccessRoles = ['system_admin', 'group_chairman', 'group_company_secretary'];
  
  // Check if user has any global access role on any board
  const globalMembership = userBoardRolesTable.find(ubr => {
    if (ubr.userId !== userId || ubr.endDate !== null) return false;
    const role = rolesTable.find(r => r.id === ubr.roleId);
    return role && globalAccessRoles.includes(role.code);
  });
  
  if (globalMembership) return true;
  
  // Check if user has 'boards.view_all' permission on any board
  const memberships = userBoardRolesTable.filter(
    ubr => ubr.userId === userId && ubr.endDate === null
  );
  
  for (const membership of memberships) {
    const permissions = getRolePermissions(membership.roleId);
    if (permissions.some(p => p.code === 'boards.view_all')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get all boards (for users with global access)
 */
export const getAllAccessibleBoards = (): BoardRow[] => {
  return [...boardsTable];
};
