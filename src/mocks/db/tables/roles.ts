/**
 * Roles Table - System role definitions
 * 
 * Scope types:
 * - 'global': Access to all boards (system_admin, group_chairman, group_company_secretary)
 * - 'board': Access scoped to assigned board(s)
 */

export type RoleScope = 'global' | 'board';

export interface RoleRow {
  id: number;
  code: string;
  name: string;
  description: string;
  isSystemRole: boolean;  // true = cannot be deleted
  scope: RoleScope;       // global = cross-board access, board = scoped to tenant
}


// ============================================================================
// ROLES TABLE
// ============================================================================

export const rolesTable: RoleRow[] = [
  // GLOBAL SCOPE ROLES - Access to all boards
  { 
    id: 1, 
    code: 'system_admin', 
    name: 'System Administrator', 
    description: 'Full system access across all boards and settings', 
    isSystemRole: true,
    scope: 'global',
  },
  { 
    id: 2, 
    code: 'group_chairman', 
    name: 'Group Chairman', 
    description: 'Group-level chairman with access to all boards, can also be chairman of any board', 
    isSystemRole: true,
    scope: 'global',
  },
  { 
    id: 3, 
    code: 'group_company_secretary', 
    name: 'Group Company Secretary', 
    description: 'Group-level secretary with cross-board administrative access', 
    isSystemRole: true,
    scope: 'global',
  },

  // BOARD SCOPE ROLES - Access scoped to assigned board(s)
  { 
    id: 10, 
    code: 'chairman', 
    name: 'Chairman', 
    description: 'Board chairman with elevated privileges for their board', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 11, 
    code: 'vice_chairman', 
    name: 'Vice Chairman', 
    description: 'Deputy to the chairman for their board', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 12, 
    code: 'company_secretary', 
    name: 'Company Secretary', 
    description: 'Board-specific secretary managing administration', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 13, 
    code: 'board_member', 
    name: 'Board Member', 
    description: 'Regular board member with voting rights', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 14, 
    code: 'committee_member', 
    name: 'Committee Member', 
    description: 'Committee participant with committee-level access', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 15, 
    code: 'executive_member', 
    name: 'Executive Member', 
    description: 'Executive (CEO, CFO, etc.) with special board access', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 16, 
    code: 'observer', 
    name: 'Observer', 
    description: 'View-only access to board meetings and documents', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 17, 
    code: 'presenter', 
    name: 'Presenter', 
    description: 'User who can present in meetings, added via meeting participants', 
    isSystemRole: false,
    scope: 'board',
  },
  { 
    id: 18, 
    code: 'guest', 
    name: 'Guest', 
    description: 'Limited temporary access, typically for specific meetings', 
    isSystemRole: false,
    scope: 'board',
  },
];


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get role by code
 */
export const getRoleByCode = (code: string): RoleRow | undefined => {
  return rolesTable.find(r => r.code === code);
};

/**
 * Get role by ID
 */
export const getRoleById = (id: number): RoleRow | undefined => {
  return rolesTable.find(r => r.id === id);
};

/**
 * Get all global scope roles
 */
export const getGlobalRoles = (): RoleRow[] => {
  return rolesTable.filter(r => r.scope === 'global');
};

/**
 * Get all board scope roles
 */
export const getBoardRoles = (): RoleRow[] => {
  return rolesTable.filter(r => r.scope === 'board');
};
