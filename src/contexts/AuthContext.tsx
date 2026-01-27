/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 * Enhanced with board-scoped permission checking
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, tokenManager } from '../api';
import type { AuthUser, LoginPayload, LoginResponse } from '../types';
import type { Board } from '../types/board.types';
import {
  getUserAccessibleBoards,
  getUserPrimaryBoard,
  canUserAccessBoard,
  hasPermissionOnBoard,
  hasMultiBoardAccess as checkMultiBoardAccess,
  hasGlobalBoardAccess,
  getUserBoardPermissions,
} from '../mocks/db';
import { toBoardObject } from '../mocks/db/queries/boardQueries';

interface AuthContextValue {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth methods
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verifyMfa: (code: string) => Promise<LoginResponse>;
  
  // Global permission helpers (backward compatible)
  hasPermission: (permission: string, boardId?: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
  
  // Board-scoped helpers (new)
  getUserBoards: () => Board[];
  getPrimaryBoard: () => Board | undefined;
  canAccessBoard: (boardId: string) => boolean;
  getBoardPermissions: (boardId: string) => string[];
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
    
    // If MFA is required, don't set user yet
    if (response.user.mfaRequired) {
      return response;
    }
    
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

  // Enhanced hasPermission - supports optional boardId for board-scoped checks
  const hasPermission = useCallback((permission: string, boardId?: string): boolean => {
    if (!user) return false;
    
    // If boardId provided, check board-scoped permission
    if (boardId) {
      return hasPermissionOnBoard(user.id, boardId, permission);
    }
    
    // Otherwise check global permissions from user object
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.globalRole?.code === role;
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch {
      // If refresh fails, logout
      await logout();
    }
  }, [logout]);

  // Get all boards user can access
  const getUserBoards = useCallback((): Board[] => {
    if (!user) return [];
    const boardRows = getUserAccessibleBoards(user.id);
    return boardRows.map(toBoardObject);
  }, [user]);

  // Get user's primary/default board
  const getPrimaryBoard = useCallback((): Board | undefined => {
    if (!user) return undefined;
    const boardRow = getUserPrimaryBoard(user.id);
    return boardRow ? toBoardObject(boardRow) : undefined;
  }, [user]);

  // Check if user can access a specific board
  const canAccessBoard = useCallback((boardId: string): boolean => {
    if (!user) return false;
    // Global access users can access all boards
    if (hasGlobalBoardAccess(user.id)) return true;
    return canUserAccessBoard(user.id, boardId);
  }, [user]);

  // Get all permissions user has on a specific board
  const getBoardPermissions = useCallback((boardId: string): string[] => {
    if (!user) return [];
    return getUserBoardPermissions(user.id, boardId);
  }, [user]);

  // Check if user has access to multiple boards
  const hasMultiBoardAccess = useMemo((): boolean => {
    if (!user) return false;
    return checkMultiBoardAccess(user.id);
  }, [user]);

  // Check if user has global board access (can see all boards)
  const hasGlobalAccess = useMemo((): boolean => {
    if (!user) return false;
    return hasGlobalBoardAccess(user.id);
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
    // Board-scoped helpers
    getUserBoards,
    getPrimaryBoard,
    canAccessBoard,
    getBoardPermissions,
    hasMultiBoardAccess,
    hasGlobalAccess,
  }), [user, isLoading, login, logout, verifyMfa, hasPermission, hasRole, refreshUser, getUserBoards, getPrimaryBoard, canAccessBoard, getBoardPermissions, hasMultiBoardAccess, hasGlobalAccess]);

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
