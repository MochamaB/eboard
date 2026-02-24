/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 * All board access and permissions derived from user.boardRoles (from backend API)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, tokenManager } from '../api';
import type { AuthUser, LoginPayload, LoginResponse, UserBoardRoleInfo } from '../types';

// Global access role codes — these roles can see all boards
const GLOBAL_ACCESS_ROLES = ['system_admin', 'group_chairman', 'group_company_secretary'];

// ============================================================================
// HELPER: Lightweight board info derived from boardRoles (no API call needed)
// ============================================================================
interface UserBoardInfo {
  boardId: number;
  boardSlug: string;
  boardName: string;
}

/** Extract unique boards the user is assigned to from boardRoles */
const getBoardsFromRoles = (boardRoles: UserBoardRoleInfo[]): UserBoardInfo[] => {
  const seen = new Set<number>();
  const boards: UserBoardInfo[] = [];
  for (const br of boardRoles) {
    if (br.boardId && br.boardSlug && !seen.has(br.boardId)) {
      seen.add(br.boardId);
      boards.push({
        boardId: br.boardId,
        boardSlug: br.boardSlug,
        boardName: br.boardName || br.boardSlug,
      });
    }
  }
  return boards;
};

/** Get the default board slug from boardRoles */
const getDefaultBoardSlug = (boardRoles: UserBoardRoleInfo[]): string | undefined => {
  // First: explicitly marked default (board or board_leadership scope)
  const defaultRole = boardRoles.find(br =>
    br.isDefault &&
    (br.scope === 'board' || br.scope === 'board_leadership') &&
    br.boardSlug
  );
  if (defaultRole?.boardSlug) return defaultRole.boardSlug;

  // For global users, return first board slug available
  const globalRole = boardRoles.find(br => br.scope === 'global');
  if (globalRole) {
    const firstBoard = boardRoles.find(br => br.boardSlug);
    return firstBoard?.boardSlug ?? undefined;
  }

  // Fallback: first board role with a slug
  const first = boardRoles.find(br => br.boardSlug);
  return first?.boardSlug ?? undefined;
};

/** Check if user has a global-scope role */
const hasGlobalRole = (boardRoles: UserBoardRoleInfo[]): boolean => {
  return boardRoles.some(br => br.scope === 'global');
};

/** Check if user has a global access role (system_admin, group_chairman, etc.) */
const isGlobalAccessUser = (boardRoles: UserBoardRoleInfo[]): boolean => {
  return boardRoles.some(
    br => br.scope === 'global' && GLOBAL_ACCESS_ROLES.includes(br.roleCode)
  );
};

/** Check if user can access a specific board (by slug) */
const canAccessBoardBySlug = (boardRoles: UserBoardRoleInfo[], boardSlug: string): boolean => {
  if (isGlobalAccessUser(boardRoles)) return true;
  return boardRoles.some(br => br.boardSlug === boardSlug);
};

/** Check if user has a specific permission on a board (by slug) */
const hasPermissionOnBoardBySlug = (
  boardRoles: UserBoardRoleInfo[],
  boardSlug: string,
  permission: string
): boolean => {
  // Global access roles have all permissions
  if (isGlobalAccessUser(boardRoles)) {
    const globalPerms = boardRoles
      .filter(br => br.scope === 'global')
      .flatMap(br => br.permissions);
    if (globalPerms.includes(permission)) return true;
  }
  // Check board-specific permissions
  return boardRoles
    .filter(br => br.boardSlug === boardSlug)
    .some(br => br.permissions.includes(permission));
};

/** Get all permissions user has on a specific board (by slug) */
const getPermissionsForBoard = (boardRoles: UserBoardRoleInfo[], boardSlug: string): string[] => {
  const perms = new Set<string>();
  // Add global role permissions
  boardRoles
    .filter(br => br.scope === 'global')
    .forEach(br => br.permissions.forEach(p => perms.add(p)));
  // Add board-specific permissions
  boardRoles
    .filter(br => br.boardSlug === boardSlug)
    .forEach(br => br.permissions.forEach(p => perms.add(p)));
  return Array.from(perms);
};

/** Aggregate all permissions from all roles */
const getAllPermissions = (boardRoles: UserBoardRoleInfo[]): string[] => {
  const perms = new Set<string>();
  boardRoles.forEach(br => br.permissions.forEach(p => perms.add(p)));
  return Array.from(perms);
};

// ============================================================================
// CONTEXT
// ============================================================================

interface AuthContextValue {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth methods
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verifyMfa: (code: string) => Promise<LoginResponse>;
  
  // Permission helpers
  hasPermission: (permission: string, boardSlug?: string) => boolean;
  hasRole: (roleCode: string) => boolean;
  refreshUser: () => Promise<void>;
  
  // Board-scoped helpers
  getUserBoardList: () => UserBoardInfo[];
  getDefaultBoard: () => string | undefined;
  canAccessBoard: (boardSlug: string) => boolean;
  getBoardPermissions: (boardSlug: string) => string[];
  hasMultiBoardAccess: boolean;
  hasGlobalAccess: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getAccessToken();
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch {
          // Token invalid, clear it
          tokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await authApi.login(payload);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      navigate('/auth/login');
    }
  }, [navigate]);

  const verifyMfa = useCallback(async (code: string): Promise<LoginResponse> => {
    const response = await authApi.verifyMfa({ code });
    setUser(response.user);
    return response;
  }, []);

  // Permission check — supports optional boardSlug for board-scoped checks
  const hasPermission = useCallback((permission: string, boardSlug?: string): boolean => {
    if (!user) return false;
    if (boardSlug) {
      return hasPermissionOnBoardBySlug(user.boardRoles, boardSlug, permission);
    }
    // Check aggregated permissions across all roles
    return getAllPermissions(user.boardRoles).includes(permission);
  }, [user]);

  const hasRole = useCallback((roleCode: string): boolean => {
    if (!user) return false;
    return user.boardRoles.some(br => br.roleCode === roleCode);
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch {
      await logout();
    }
  }, [logout]);

  // Get lightweight board list from boardRoles
  const getUserBoardList = useCallback((): UserBoardInfo[] => {
    if (!user) return [];
    return getBoardsFromRoles(user.boardRoles);
  }, [user]);

  // Get user's default board slug
  const getDefaultBoard = useCallback((): string | undefined => {
    if (!user) return undefined;
    return getDefaultBoardSlug(user.boardRoles);
  }, [user]);

  // Check if user can access a board (by slug)
  const canAccessBoard = useCallback((boardSlug: string): boolean => {
    if (!user) return false;
    return canAccessBoardBySlug(user.boardRoles, boardSlug);
  }, [user]);

  // Get permissions on a specific board
  const getBoardPermissions = useCallback((boardSlug: string): string[] => {
    if (!user) return [];
    return getPermissionsForBoard(user.boardRoles, boardSlug);
  }, [user]);

  // Multiple board access
  const hasMultiBoardAccess = useMemo((): boolean => {
    if (!user) return false;
    return getBoardsFromRoles(user.boardRoles).length > 1;
  }, [user]);

  // Global access
  const hasGlobalAccess = useMemo((): boolean => {
    if (!user) return false;
    return isGlobalAccessUser(user.boardRoles);
  }, [user]);

  const value: AuthContextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    verifyMfa,
    hasPermission,
    hasRole,
    refreshUser,
    getUserBoardList,
    getDefaultBoard,
    canAccessBoard,
    getBoardPermissions,
    hasMultiBoardAccess,
    hasGlobalAccess,
  }), [user, isLoading, login, logout, verifyMfa, hasPermission, hasRole, refreshUser, getUserBoardList, getDefaultBoard, canAccessBoard, getBoardPermissions, hasMultiBoardAccess, hasGlobalAccess]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
