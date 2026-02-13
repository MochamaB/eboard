/**
 * User-Board-Role Assignments Table
 * 
 * This is the core authorization table that defines what role(s) a user has
 * on each board. A user can have different roles on different boards.
 * 
 * Examples:
 * - User A is Chairman on Board X, but Board Member on Board Y
 * - User B is Company Secretary on multiple boards
 * - User C has global role (system_admin) so doesn't need board assignments
 */

export interface UserBoardRoleRow {
  id: number;
  userId: number;
  scope: 'global' | 'board';  // MUST match role.scope - enforces global vs board-scoped roles
  boardId: string | null;     // null when scope='global', required when scope='board'
  roleId: number;             // FK to roles table
  isDefault: boolean;         // Default board to show on login (only meaningful for scope='board')
  startDate: string;
  endDate: string | null;     // null = currently active
  assignedBy: number;         // userId who assigned this role
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// USER-BOARD-ROLE ASSIGNMENTS
// ============================================================================

export const userBoardRolesTable: UserBoardRoleRow[] = [
  // -------------------------------------------------------------------------
  // SYSTEM ADMINS (Global Access) - IDs 1-2
  // -------------------------------------------------------------------------

  // Brian Mochama (userId: 20) - System Admin
  {
    id: 1,
    userId: 20,
    scope: 'global',
    boardId: null,
    roleId: 1, // system_admin
    isDefault: false,
    startDate: '2023-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },

  // Winfred Kabuuri (userId: 21) - System Admin
  {
    id: 2,
    userId: 21,
    scope: 'global',
    boardId: null,
    roleId: 1, // system_admin
    isDefault: false,
    startDate: '2023-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // GROUP COMPANY SECRETARY (Global Access) - ID 3
  // -------------------------------------------------------------------------

  // Mathews Odero (userId: 3) - Group Company Secretary
  {
    id: 3,
    userId: 3,
    scope: 'global',
    boardId: null,
    roleId: 3, // group_company_secretary
    isDefault: false,
    startDate: '2019-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2019-01-01T00:00:00Z',
  },
   // Esther Osoro (userId: 24) - Group Company Secretary
  {
    id: 24,
    userId: 24,
    scope: 'global',
    boardId: null,
    roleId: 3, // group_company_secretary
    isDefault: false,
    startDate: '2019-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2019-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS (Main Board) - Leadership - IDs 4-5
  // -------------------------------------------------------------------------

  // Chege Kirundi (userId: 1) - Group Chairman (Global Role)
  {
    id: 4,
    userId: 1,
    scope: 'global',
    boardId: null,
    roleId: 2, // group_chairman
    isDefault: false,
    startDate: '2020-01-15',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2020-01-15T00:00:00Z',
  },

  // Chege Kirundi (userId: 1) - Chairman of KTDA MS (Board Role)
  {
    id: 5,
    userId: 1,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 4, // chairman
    isDefault: true,
    startDate: '2020-01-15',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2020-01-15T00:00:00Z',
  },

  // James Ombasa (userId: 2) - Vice Chairman of KTDA MS
  {
    id: 6,
    userId: 2,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 5, // vice_chairman
    isDefault: true,
    startDate: '2020-01-15',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2020-01-15T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS - Board Members (Zone Directors) - IDs 6-16
  // -------------------------------------------------------------------------

  // G.G Kagombe (userId: 4) - Zone 1
  {
    id: 7,
    userId: 4,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // James Githinji (userId: 5) - Zone 2
  {
    id: 8,
    userId: 5,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // David Ndung'u (userId: 6) - Zone 4
  {
    id: 8,
    userId: 6,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // John Wasusana (userId: 7) - Zone 5
  {
    id: 9,
    userId: 7,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Enos Njeru (userId: 8) - Zone 6
  {
    id: 10,
    userId: 8,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Baptista Kanyaru (userId: 9) - Zone 7
  {
    id: 11,
    userId: 9,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Philip Langat (userId: 10) - Zone 8
  {
    id: 12,
    userId: 10,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Samson Menjo (userId: 11) - Zone 9
  {
    id: 13,
    userId: 11,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Vincent Ansi (userId: 12) - Zone 10
  {
    id: 14,
    userId: 12,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Francis Kimotho (userId: 13) - Zone 12
  {
    id: 15,
    userId: 13,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Catherine Mankura (userId: 14) - Independent Director
  {
    id: 16,
    userId: 14,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 7, // board_member
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS - Executive Members - IDs 17-18
  // -------------------------------------------------------------------------

  // Francis Miano (userId: 15) - CEO
  {
    id: 17,
    userId: 15,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 9, // executive_member
    isDefault: true,
    startDate: '2024-06-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },

  // Simeon Rugutt (userId: 16) - GFSD
  {
    id: 18,
    userId: 16,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 9, // executive_member
    isDefault: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS - Board Secretaries - IDs 19-21
  // -------------------------------------------------------------------------

  // Kenneth Muhia (userId: 17) - board Secretary
  {
    id: 19,
    userId: 17,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 6, // board_secretary
    isDefault: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // Isaac Chege (userId: 18) - Assistant Secretary
  {
    id: 20,
    userId: 18,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 6, // board_secretary
    isDefault: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // Jane Njeri (userId: 19) - Assistant Secretary
  {
    id: 21,
    userId: 19,
    scope: 'board',
    boardId: 'ktda-ms',
    roleId: 6, // board_secretary
    isDefault: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // AUDIT COMMITTEE - IDs 22-25
  // -------------------------------------------------------------------------

  // G.G Kagombe (userId: 4) - Chairman
  {
    id: 22,
    userId: 4,
    scope: 'board',
    boardId: 'comm-audit',
    roleId: 4, // chairman
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // James Githinji (userId: 5) - Member
  {
    id: 23,
    userId: 5,
    scope: 'board',
    boardId: 'comm-audit',
    roleId: 8, // committee_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // David Ndung'u (userId: 6) - Member
  {
    id: 24,
    userId: 6,
    scope: 'board',
    boardId: 'comm-audit',
    roleId: 8, // committee_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Isaac Chege (userId: 18) - Secretary
  {
    id: 25,
    userId: 18,
    scope: 'board',
    boardId: 'comm-audit',
    roleId: 13, // company_secretary
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // HR COMMITTEE - IDs 26-29
  // -------------------------------------------------------------------------

  // James Githinji (userId: 5) - Chairman
  {
    id: 26,
    userId: 5,
    scope: 'board',
    boardId: 'comm-hr',
    roleId: 4, // chairman
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // John Wasusana (userId: 7) - Member
  {
    id: 27,
    userId: 7,
    scope: 'board',
    boardId: 'comm-hr',
    roleId: 8, // committee_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Enos Njeru (userId: 8) - Member
  {
    id: 28,
    userId: 8,
    scope: 'board',
    boardId: 'comm-hr',
    roleId: 8, // committee_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Jane Njeri (userId: 19) - Secretary
  {
    id: 29,
    userId: 19,
    scope: 'board',
    boardId: 'comm-hr',
    roleId: 6, // company_secretary
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // FINANCE COMMITTEE - IDs 30-33
  // -------------------------------------------------------------------------

  // David Ndung'u (userId: 6) - Chairman
  {
    id: 30,
    userId: 6,
    scope: 'board',
    boardId: 'comm-finance',
    roleId: 4, // chairman
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // G.G Kagombe (userId: 4) - Member
  {
    id: 31,
    userId: 4,
    scope: 'board',
    boardId: 'comm-finance',
    roleId: 8, // committee_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Mathews Odero (userId: 3) - Member (Group Secretary)
  {
    id: 32,
    userId: 3,
    scope: 'board',
    boardId: 'comm-finance',
    roleId: 8, // committee_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Isaac Chege (userId: 18) - Secretary
  {
    id: 33,
    userId: 18,
    scope: 'board',
    boardId: 'comm-finance',
    roleId: 13, // company_secretary
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // NOMINATION COMMITTEE - IDs 34-36
  // -------------------------------------------------------------------------

  // Chege Kirundi (userId: 1) - Chairman
  {
    id: 34,
    userId: 1,
    scope: 'board',
    boardId: 'comm-nomination',
    roleId: 4, // chairman
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // James Ombasa (userId: 2) - Member
  {
    id: 35,
    userId: 2,
    scope: 'board',
    boardId: 'comm-nomination',
    roleId: 8, // committee_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Kenneth Muhia (userId: 17) - Secretary
  {
    id: 36,
    userId: 17,
    scope: 'board',
    boardId: 'comm-nomination',
    roleId: 6, // board_secretary
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KETEPA BOARD (Subsidiary) - IDs 37-39
  // -------------------------------------------------------------------------

  // Mathews Odero (userId: 3) - Chairman
  {
    id: 37,
    userId: 3,
    scope: 'board',
    boardId: 'ketepa',
    roleId: 4, // chairman
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // G.G Kagombe (userId: 4) - Member
  {
    id: 38,
    userId: 4,
    scope: 'board',
    boardId: 'ketepa',
    roleId: 7, // board_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Isaac Chege (userId: 18) - Secretary
  {
    id: 39,
    userId: 18,
    scope: 'board',
    boardId: 'ketepa',
    roleId: 6, // board_secretary
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // TEMEC BOARD (Subsidiary) - IDs 40-42
  // -------------------------------------------------------------------------

  // James Githinji (userId: 5) - Chairman
  {
    id: 40,
    userId: 5,
    scope: 'board',
    boardId: 'temec',
    roleId: 4, // chairman
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // David Ndung'u (userId: 6) - Member
  {
    id: 41,
    userId: 6,
    scope: 'board',
    boardId: 'temec',
    roleId: 7, // board_member
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Jane Njeri (userId: 19) - Secretary
  {
    id: 42,
    userId: 19,
    scope: 'board',
    boardId: 'temec',
    roleId: 6, // company_secretary
    isDefault: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // PRESENTERS (External - not board-specific) - IDs 43-44
  // Note: Presenters are external invitees, not filtered by boardId
  // -------------------------------------------------------------------------

  // Martin Mwarangu (userId: 22) - Head of ICT, Presenter
  {
    id: 43,
    userId: 22,
    scope: 'board',
    boardId: 'global', // External presenter, not board-specific
    roleId: 11, // presenter
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Charles Kireru (userId: 23) - Head of HR, Presenter
  {
    id: 44,
    userId: 23,
    scope: 'board',
    boardId: 'global', // External presenter, not board-specific
    roleId: 11, // presenter
    isDefault: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all board roles for a user
 */
export const getUserBoardRoles = (userId: number): UserBoardRoleRow[] => {
  return userBoardRolesTable.filter(
    ubr => ubr.userId === userId && ubr.endDate === null
  );
};

/**
 * Get user's role on a specific board
 */
export const getUserRoleOnBoard = (userId: number, boardId: string): UserBoardRoleRow | undefined => {
  return userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.boardId === boardId && ubr.endDate === null
  );
};

/**
 * Get all users with a specific role on a board
 */
export const getUsersWithRoleOnBoard = (boardId: string, roleId: number): UserBoardRoleRow[] => {
  return userBoardRolesTable.filter(
    ubr => ubr.boardId === boardId && ubr.roleId === roleId && ubr.endDate === null
  );
};

/**
 * Get all board IDs a user has access to
 */
export const getUserBoardIds = (userId: number): string[] => {
  return [...new Set(
    userBoardRolesTable
      .filter(ubr => ubr.userId === userId && ubr.scope === 'board' && ubr.endDate === null && ubr.boardId !== null)
      .map(ubr => ubr.boardId!)
  )];
};

/**
 * Get user's default board role (for initial navigation)
 */
export const getUserDefaultBoardRole = (userId: number): UserBoardRoleRow | undefined => {
  return userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.scope === 'board' && ubr.isDefault && ubr.endDate === null
  );
};

/**
 * Get user's global role assignment (if any)
 */
export const getUserGlobalRoleAssignment = (userId: number): UserBoardRoleRow | undefined => {
  return userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.scope === 'global' && ubr.endDate === null
  );
};

/**
 * Check if user has access to a board
 */
export const userHasBoardAccess = (userId: number, boardId: string): boolean => {
  return userBoardRolesTable.some(
    ubr => ubr.userId === userId && ubr.boardId === boardId && ubr.endDate === null
  );
};
