/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, tokenManager } from '../api';
import type { AuthUser, LoginPayload, LoginResponse } from '../types';

interface AuthContextValue {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth methods
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verifyMfa: (code: string) => Promise<LoginResponse>;
  
  // Helpers
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
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

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.primaryRole === role;
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
  }), [user, isLoading, login, logout, verifyMfa, hasPermission, hasRole, refreshUser]);

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
