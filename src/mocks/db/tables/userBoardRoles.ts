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
  boardId: string;        // FK to boards table (tenant)
  roleId: number;         // FK to roles table
  isPrimary: boolean;     // Primary role for this board (for display purposes)
  startDate: string;
  endDate: string | null; // null = currently active
  assignedBy: number;     // userId who assigned this role
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// USER-BOARD-ROLE ASSIGNMENTS
// ============================================================================

export const userBoardRolesTable: UserBoardRoleRow[] = [
  // -------------------------------------------------------------------------
  // SYSTEM ADMINS (Global Access)
  // -------------------------------------------------------------------------

  // Brian Mochama (id: 20) - System Admin
  {
    id: 1,
    userId: 20,
    boardId: 'ktda-ms',
    roleId: 1, // system_admin
    isPrimary: true,
    startDate: '2023-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },

  // Winfred Kabuuri (id: 21) - System Admin
  {
    id: 2,
    userId: 21,
    boardId: 'ktda-ms',
    roleId: 1, // system_admin
    isPrimary: true,
    startDate: '2023-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // GROUP COMPANY SECRETARY (Global Access)
  // -------------------------------------------------------------------------

  // Mathews Odiero (id: 3) - Group Company Secretary
  {
    id: 3,
    userId: 3,
    boardId: 'ktda-ms',
    roleId: 3, // group_company_secretary
    isPrimary: true,
    startDate: '2019-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2019-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS (Main Board) - Leadership
  // -------------------------------------------------------------------------

  // Chege Kirundi (id: 1) - Chairman of KTDA MS
  {
    id: 10,
    userId: 1,
    boardId: 'ktda-ms',
    roleId: 10, // chairman
    isPrimary: true,
    startDate: '2020-01-15',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2020-01-15T00:00:00Z',
  },

  // James Ombasa (id: 2) - Vice Chairman of KTDA MS
  {
    id: 11,
    userId: 2,
    boardId: 'ktda-ms',
    roleId: 11, // vice_chairman
    isPrimary: true,
    startDate: '2020-01-15',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2020-01-15T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS - Board Members (Zone Directors)
  // -------------------------------------------------------------------------

  // G.G Kagombe (id: 4) - Zone 1
  {
    id: 14,
    userId: 4,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // James Githinji (id: 5) - Zone 2
  {
    id: 15,
    userId: 5,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // David Ndung'u (id: 6) - Zone 4
  {
    id: 16,
    userId: 6,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // John Wasusana (id: 7) - Zone 5
  {
    id: 17,
    userId: 7,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Enos Njeru (id: 8) - Zone 6
  {
    id: 18,
    userId: 8,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Baptista Kanyaru (id: 9) - Zone 7
  {
    id: 19,
    userId: 9,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Philip Langat (id: 10) - Zone 8
  {
    id: 20,
    userId: 10,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Samson Menjo (id: 11) - Zone 9
  {
    id: 21,
    userId: 11,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Vincent Ansi (id: 12) - Zone 10
  {
    id: 22,
    userId: 12,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Francis Kimotho (id: 13) - Zone 12
  {
    id: 23,
    userId: 13,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Catherine Mankura (id: 14) - Independent Director
  {
    id: 24,
    userId: 14,
    boardId: 'ktda-ms',
    roleId: 13, // board_member
    isPrimary: true,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS - Executive Members
  // -------------------------------------------------------------------------

  // Francis Miano (id: 15) - CEO
  {
    id: 25,
    userId: 15,
    boardId: 'ktda-ms',
    roleId: 15, // executive_member
    isPrimary: true,
    startDate: '2024-06-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },

  // Simeon Rugutt (id: 16) - GFSD
  {
    id: 26,
    userId: 16,
    boardId: 'ktda-ms',
    roleId: 15, // executive_member
    isPrimary: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KTDA MS - Board Secretaries
  // -------------------------------------------------------------------------

  // Kenneth Muhia (id: 17) - Company Secretary
  {
    id: 27,
    userId: 17,
    boardId: 'ktda-ms',
    roleId: 12, // company_secretary
    isPrimary: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // Isaac Chege (id: 18) - Assistant Secretary
  {
    id: 28,
    userId: 18,
    boardId: 'ktda-ms',
    roleId: 12, // company_secretary
    isPrimary: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // Jane Njeri (id: 19) - Assistant Secretary
  {
    id: 29,
    userId: 19,
    boardId: 'ktda-ms',
    roleId: 12, // company_secretary
    isPrimary: true,
    startDate: '2020-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // AUDIT COMMITTEE
  // -------------------------------------------------------------------------

  // G.G Kagombe (id: 4) - Chairman
  {
    id: 40,
    userId: 4,
    boardId: 'comm-audit',
    roleId: 10, // chairman
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // James Githinji (id: 5) - Member
  {
    id: 41,
    userId: 5,
    boardId: 'comm-audit',
    roleId: 14, // committee_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // David Ndung'u (id: 6) - Member
  {
    id: 42,
    userId: 6,
    boardId: 'comm-audit',
    roleId: 14, // committee_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Isaac Chege (id: 18) - Secretary
  {
    id: 43,
    userId: 18,
    boardId: 'comm-audit',
    roleId: 12, // company_secretary
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // HR COMMITTEE
  // -------------------------------------------------------------------------

  // James Githinji (id: 5) - Chairman
  {
    id: 50,
    userId: 5,
    boardId: 'comm-hr',
    roleId: 10, // chairman
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // John Wasusana (id: 7) - Member
  {
    id: 51,
    userId: 7,
    boardId: 'comm-hr',
    roleId: 14, // committee_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Enos Njeru (id: 8) - Member
  {
    id: 52,
    userId: 8,
    boardId: 'comm-hr',
    roleId: 14, // committee_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Jane Njeri (id: 19) - Secretary
  {
    id: 53,
    userId: 19,
    boardId: 'comm-hr',
    roleId: 12, // company_secretary
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // FINANCE COMMITTEE
  // -------------------------------------------------------------------------

  // David Ndung'u (id: 6) - Chairman
  {
    id: 60,
    userId: 6,
    boardId: 'comm-finance',
    roleId: 10, // chairman
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // G.G Kagombe (id: 4) - Member
  {
    id: 61,
    userId: 4,
    boardId: 'comm-finance',
    roleId: 14, // committee_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Mathews Odiero (id: 3) - Member (Group Secretary)
  {
    id: 62,
    userId: 3,
    boardId: 'comm-finance',
    roleId: 14, // committee_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Isaac Chege (id: 18) - Secretary
  {
    id: 63,
    userId: 18,
    boardId: 'comm-finance',
    roleId: 12, // company_secretary
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // NOMINATION COMMITTEE
  // -------------------------------------------------------------------------

  // Chege Kirundi (id: 1) - Chairman
  {
    id: 70,
    userId: 1,
    boardId: 'comm-nomination',
    roleId: 10, // chairman
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // James Ombasa (id: 2) - Member
  {
    id: 71,
    userId: 2,
    boardId: 'comm-nomination',
    roleId: 14, // committee_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Kenneth Muhia (id: 17) - Secretary
  {
    id: 72,
    userId: 17,
    boardId: 'comm-nomination',
    roleId: 12, // company_secretary
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // KETEPA BOARD (Subsidiary)
  // -------------------------------------------------------------------------

  // Mathews Odiero (id: 3) - Chairman
  {
    id: 80,
    userId: 3,
    boardId: 'ketepa',
    roleId: 10, // chairman
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // G.G Kagombe (id: 4) - Member
  {
    id: 81,
    userId: 4,
    boardId: 'ketepa',
    roleId: 13, // board_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Isaac Chege (id: 18) - Secretary
  {
    id: 82,
    userId: 18,
    boardId: 'ketepa',
    roleId: 12, // company_secretary
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // -------------------------------------------------------------------------
  // TEMEC BOARD (Subsidiary)
  // -------------------------------------------------------------------------

  // James Githinji (id: 5) - Chairman
  {
    id: 90,
    userId: 5,
    boardId: 'temec',
    roleId: 10, // chairman
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // David Ndung'u (id: 6) - Member
  {
    id: 91,
    userId: 6,
    boardId: 'temec',
    roleId: 13, // board_member
    isPrimary: false,
    startDate: '2021-01-01',
    endDate: null,
    assignedBy: 1,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },

  // Jane Njeri (id: 19) - Secretary
  {
    id: 92,
    userId: 19,
    boardId: 'temec',
    roleId: 12, // company_secretary
    isPrimary: false,
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
      .filter(ubr => ubr.userId === userId && ubr.endDate === null)
      .map(ubr => ubr.boardId)
  )];
};

/**
 * Get user's primary board role
 */
export const getUserPrimaryBoardRole = (userId: number): UserBoardRoleRow | undefined => {
  return userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.isPrimary && ubr.endDate === null
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
