/**
 * useBoardRoleValidation Hook
 *
 * Centralized validation for BoardLeadership role assignments.
 * Used across board creation, board edit, user creation, and user edit.
 *
 * BoardLeadership roles (chairman, vice_chairman) are singular per board:
 * - Only one user can hold each BoardLeadership role per board
 * - Chairman is required for a valid board
 *
 * Usage:
 * - Board creation: Pass current member assignments to validate
 * - Board edit: Pass existing board members to check before adding new ones
 * - User creation/edit: Pass board's current members to validate role assignment
 */

import { useMemo, useCallback } from 'react';
import { useLookups } from '../contexts/LookupsContext';
import type { RoleLookup } from '../types/lookup.types';

// ============================================================================
// TYPES
// ============================================================================

export interface RoleAssignment {
  userId: number;
  roleCode: string;
  roleId?: number;
}

export interface BoardRoleValidationResult {
  /** Whether the assignment is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
}

export interface BoardValidationResult {
  /** Whether the board has valid leadership */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** Whether chairman is assigned */
  hasChairman: boolean;
  /** Whether vice chairman is assigned */
  hasViceChairman: boolean;
}

export interface RoleOptionWithState {
  role: RoleLookup;
  isDisabled: boolean;
  disabledReason?: string;
}

// ============================================================================
// CONSTANTS - Known role codes for fallback when DB scope isn't set
// ============================================================================

// Board leadership roles - singular per board (one chairman, one vice_chairman)
const KNOWN_LEADERSHIP_ROLES = ['chairman', 'vice_chairman'];

// Global roles - should not be assignable to boards
const KNOWN_GLOBAL_ROLES = ['super_admin', 'system_admin', 'group_chairman', 'group_company_secretary'];

// Scope values - backend may return as number or string
const SCOPE_GLOBAL = ['global', '0', 0];
const SCOPE_BOARD = ['board', '1', 1];
const SCOPE_BOARD_LEADERSHIP = ['board_leadership', '2', 2];

// Helper to check scope (handles both string and numeric values)
const isGlobalScope = (scope: string | number): boolean => SCOPE_GLOBAL.includes(scope);
const isBoardScope = (scope: string | number): boolean => SCOPE_BOARD.includes(scope);
const isBoardLeadershipScope = (scope: string | number): boolean => SCOPE_BOARD_LEADERSHIP.includes(scope);

// ============================================================================
// HOOK
// ============================================================================

export function useBoardRoleValidation() {
  const { roles } = useLookups();

  /**
   * Check if a role code is a leadership role (by scope or known code)
   */
  const isKnownLeadershipRole = useCallback((roleCode: string): boolean => {
    return KNOWN_LEADERSHIP_ROLES.includes(roleCode);
  }, []);

  /**
   * Get all BoardLeadership roles (chairman, vice_chairman, etc.)
   * Uses scope if available, falls back to known leadership codes
   */
  const leadershipRoles = useMemo(() => {
    return roles.filter(r =>
      isBoardLeadershipScope(r.scope) || KNOWN_LEADERSHIP_ROLES.includes(r.code)
    );
  }, [roles]);

  /**
   * Get all board-assignable roles (Board + BoardLeadership scope)
   * Excludes global roles
   */
  const boardAssignableRoles = useMemo(() => {
    return roles.filter(r => {
      // Exclude known global roles
      if (KNOWN_GLOBAL_ROLES.includes(r.code) || isGlobalScope(r.scope)) {
        return false;
      }
      // Include board and board_leadership scope, or known leadership roles
      return isBoardScope(r.scope) || isBoardLeadershipScope(r.scope) || KNOWN_LEADERSHIP_ROLES.includes(r.code);
    });
  }, [roles]);

  /**
   * Get leadership role codes for quick lookup
   */
  const leadershipRoleCodes = useMemo(() => {
    const fromRoles = new Set(leadershipRoles.map(r => r.code));
    // Also include known leadership roles as fallback
    KNOWN_LEADERSHIP_ROLES.forEach(code => fromRoles.add(code));
    return fromRoles;
  }, [leadershipRoles]);

  /**
   * Check if a role code is a BoardLeadership role
   */
  const isLeadershipRole = useCallback((roleCode: string): boolean => {
    return leadershipRoleCodes.has(roleCode) || isKnownLeadershipRole(roleCode);
  }, [leadershipRoleCodes, isKnownLeadershipRole]);

  /**
   * Get which BoardLeadership roles are already assigned from a list of assignments
   */
  const getAssignedLeadershipRoles = useCallback((assignments: RoleAssignment[]): Set<string> => {
    const assigned = new Set<string>();
    for (const assignment of assignments) {
      if (isLeadershipRole(assignment.roleCode)) {
        assigned.add(assignment.roleCode);
      }
    }
    return assigned;
  }, [isLeadershipRole]);

  /**
   * Check if a specific leadership role is already assigned
   */
  const isLeadershipRoleAssigned = useCallback(
    (roleCode: string, currentAssignments: RoleAssignment[]): boolean => {
      if (!isLeadershipRole(roleCode)) return false;
      return currentAssignments.some(a => a.roleCode === roleCode);
    },
    [isLeadershipRole]
  );

  /**
   * Validate if a new role assignment is allowed
   * Returns validation result with error message if invalid
   */
  const validateRoleAssignment = useCallback(
    (
      roleCode: string,
      userId: number,
      currentAssignments: RoleAssignment[]
    ): BoardRoleValidationResult => {
      // Check if user is already assigned to this board
      const existingAssignment = currentAssignments.find(a => a.userId === userId);
      if (existingAssignment) {
        return {
          isValid: false,
          error: 'User is already assigned to this board',
        };
      }

      // Check BoardLeadership constraint
      if (isLeadershipRole(roleCode)) {
        if (isLeadershipRoleAssigned(roleCode, currentAssignments)) {
          const role = roles.find(r => r.code === roleCode);
          return {
            isValid: false,
            error: `This board already has a ${role?.name || roleCode}. Only one ${role?.name || roleCode} is allowed per board.`,
          };
        }
      }

      return { isValid: true };
    },
    [isLeadershipRole, isLeadershipRoleAssigned, roles]
  );

  /**
   * Validate board leadership requirements
   * Checks if board has required leadership roles (chairman required)
   */
  const validateBoardLeadership = useCallback(
    (assignments: RoleAssignment[]): BoardValidationResult => {
      const assignedLeadership = getAssignedLeadershipRoles(assignments);
      const errors: string[] = [];

      const hasChairman = assignedLeadership.has('chairman');
      const hasViceChairman = assignedLeadership.has('vice_chairman');

      // Chairman is required
      if (!hasChairman) {
        errors.push('A Chairman must be assigned to the board');
      }

      return {
        isValid: errors.length === 0,
        errors,
        hasChairman,
        hasViceChairman,
      };
    },
    [getAssignedLeadershipRoles]
  );

  /**
   * Get role options with disabled state for UI dropdowns
   * Leadership roles that are already assigned will be disabled
   */
  const getRoleOptionsWithState = useCallback(
    (currentAssignments: RoleAssignment[]): RoleOptionWithState[] => {
      const assignedLeadership = getAssignedLeadershipRoles(currentAssignments);

      return boardAssignableRoles.map(role => {
        // Check if leadership by scope OR by known code
        const isLeadership = isBoardLeadershipScope(role.scope) || KNOWN_LEADERSHIP_ROLES.includes(role.code);
        const isAssigned = assignedLeadership.has(role.code);

        return {
          role,
          isDisabled: isLeadership && isAssigned,
          disabledReason: isAssigned ? `Already assigned` : undefined,
        };
      });
    },
    [boardAssignableRoles, getAssignedLeadershipRoles]
  );

  /**
   * Get available roles for assignment (filters out already-assigned leadership roles)
   */
  const getAvailableRoles = useCallback(
    (currentAssignments: RoleAssignment[]): RoleLookup[] => {
      const assignedLeadership = getAssignedLeadershipRoles(currentAssignments);

      return boardAssignableRoles.filter(role => {
        // Check if leadership by scope OR by known code
        if (isBoardLeadershipScope(role.scope) || KNOWN_LEADERSHIP_ROLES.includes(role.code)) {
          return !assignedLeadership.has(role.code);
        }
        return true;
      });
    },
    [boardAssignableRoles, getAssignedLeadershipRoles]
  );

  /**
   * Check if changing a user's role is allowed
   * Used when editing an existing assignment
   */
  const validateRoleChange = useCallback(
    (
      userId: number,
      currentRoleCode: string,
      newRoleCode: string,
      currentAssignments: RoleAssignment[]
    ): BoardRoleValidationResult => {
      // If same role, always valid
      if (currentRoleCode === newRoleCode) {
        return { isValid: true };
      }

      // Check if new role is a leadership role that's already assigned
      if (isLeadershipRole(newRoleCode)) {
        const otherAssignments = currentAssignments.filter(a => a.userId !== userId);
        if (isLeadershipRoleAssigned(newRoleCode, otherAssignments)) {
          const role = roles.find(r => r.code === newRoleCode);
          return {
            isValid: false,
            error: `Cannot change to ${role?.name || newRoleCode}. Another user already holds this role.`,
          };
        }
      }

      return { isValid: true };
    },
    [isLeadershipRole, isLeadershipRoleAssigned, roles]
  );

  return {
    // Role lists
    leadershipRoles,
    boardAssignableRoles,

    // Validation checks
    isLeadershipRole,
    isLeadershipRoleAssigned,
    getAssignedLeadershipRoles,

    // Validation methods
    validateRoleAssignment,
    validateBoardLeadership,
    validateRoleChange,

    // UI helpers
    getRoleOptionsWithState,
    getAvailableRoles,
  };
}

export default useBoardRoleValidation;
