/**
 * Responsive Context
 * Provides a single source of truth for responsive breakpoints
 * Uses Ant Design's Grid.useBreakpoint() for consistency
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Grid } from 'antd';
import type { Breakpoint } from 'antd';

// Extended breakpoint info
interface ResponsiveContextValue {
  // Ant Design breakpoint screens
  screens: Partial<Record<Breakpoint, boolean>>;

  // Convenience flags
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;

  // Current breakpoint
  currentBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const ResponsiveContext = createContext<ResponsiveContextValue | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  // Use Ant Design's optimized breakpoint hook (only creates ONE listener)
  const screens = Grid.useBreakpoint();

  // Derive device flags from screens
  const isMobile = !screens.md; // < 768px
  const isTablet = screens.md && !screens.lg; // 768-991px
  const isDesktop = screens.lg && !screens.xl; // 992-1199px
  const isLargeDesktop = screens.xl; // >= 1200px

  // Determine current breakpoint (largest active breakpoint)
  const currentBreakpoint: ResponsiveContextValue['currentBreakpoint'] =
    screens.xxl ? 'xxl' :
    screens.xl ? 'xl' :
    screens.lg ? 'lg' :
    screens.md ? 'md' :
    screens.sm ? 'sm' : 'xs';

  const value: ResponsiveContextValue = {
    screens,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint,
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

/**
 * Hook to access responsive context
 * This replaces the custom useResponsive hook
 */
export const useResponsiveContext = (): ResponsiveContextValue => {
  const context = useContext(ResponsiveContext);

  if (!context) {
    throw new Error('useResponsiveContext must be used within ResponsiveProvider');
  }

  return context;
};

/**
 * Backward compatibility: alias to useResponsiveContext
 * This allows existing code to work without changes
 */
export const useResponsive = useResponsiveContext;

export default ResponsiveContext;
