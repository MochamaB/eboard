import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ThemeConfig } from 'antd';
import type { Organization, OrgThemeConfig, Committee } from '../data/organizations';
import { defaultOrganization, getOrganizationById } from '../data/organizations';

interface OrgThemeContextValue {
  // Current organization
  currentOrg: Organization;
  setCurrentOrg: (orgId: string) => void;
  
  // Current committee (if any)
  activeCommittee: string | null; // 'board' or committee id
  setActiveCommittee: (committeeId: string | null) => void;
  
  // Theme values
  theme: OrgThemeConfig;
  
  // Ant Design theme config
  antdTheme: ThemeConfig;
  
  // Computed values
  logo: string;
  logoSidebar: string;
  logoSmall: string;
  committees: Committee[];
  hasCommittees: boolean;
}

const OrgThemeContext = createContext<OrgThemeContextValue | undefined>(undefined);

interface OrgThemeProviderProps {
  children: React.ReactNode;
}

export const OrgThemeProvider: React.FC<OrgThemeProviderProps> = ({ children }) => {
  const [currentOrg, setCurrentOrgState] = useState<Organization>(defaultOrganization);
  const [activeCommittee, setActiveCommittee] = useState<string | null>('board');

  const setCurrentOrg = useCallback((orgId: string) => {
    const org = getOrganizationById(orgId);
    if (org) {
      setCurrentOrgState(org);
      // Reset to 'board' tab when switching organizations
      setActiveCommittee(org.committees?.length ? 'board' : null);
    }
  }, []);

  const theme = currentOrg.theme;

  // Compute Ant Design theme config based on current org
  const antdTheme: ThemeConfig = useMemo(() => ({
    token: {
      // Primary Colors
      colorPrimary: theme.primaryColor,
      colorPrimaryHover: theme.primaryHover,
      colorPrimaryBg: theme.primaryLight,
      colorPrimaryBorder: theme.primaryColor,
      
      // Link Colors
      colorLink: theme.linkColor,
      colorLinkHover: theme.linkHover,
      colorLinkActive: theme.linkActive,
      
      // Semantic Colors
      colorSuccess: theme.successColor,
      colorSuccessBg: theme.successLight,
      colorWarning: theme.warningColor,
      colorWarningBg: theme.warningLight,
      colorError: theme.errorColor,
      colorErrorBg: theme.errorLight,
      colorInfo: theme.infoColor,
      colorInfoBg: theme.infoLight,
      
      // Text Colors
      colorText: theme.textPrimary,
      colorTextSecondary: theme.textSecondary,
      colorTextDisabled: theme.textDisabled,
      
      // Background Colors
      colorBgBase: theme.backgroundSecondary,
      colorBgContainer: theme.backgroundSecondary,
      colorBgElevated: theme.backgroundSecondary,
      colorBgLayout: theme.backgroundPrimary,
      
      // Border Colors
      colorBorder: theme.borderColor,
      colorBorderSecondary: theme.borderColor,
      
      // Typography
      borderRadius: 4,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    components: {
      Layout: {
        headerBg: theme.backgroundSecondary,
        headerHeight: 64,
        siderBg: theme.sidebarBg,
        bodyBg: theme.backgroundPrimary,
        triggerBg: theme.sidebarBg,
        triggerColor: '#ffffff',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkItemColor: theme.sidebarTextColor,
        darkItemHoverBg: theme.sidebarActiveBg,
        darkItemHoverColor: theme.sidebarActiveColor,
        darkItemSelectedBg: theme.sidebarActiveBg,
        darkItemSelectedColor: theme.sidebarActiveColor,
        darkSubMenuItemBg: 'rgba(0, 0, 0, 0.2)',
        itemHeight: 44,
        iconSize: 18,
      },
      Button: {
        primaryColor: theme.primaryContrast,
        colorPrimary: theme.primaryColor,
        colorPrimaryHover: theme.primaryHover,
        defaultBorderColor: theme.borderColor,
        fontWeight: 500,
      },
      Input: {
        colorBorder: theme.borderColor,
        colorPrimaryHover: theme.borderColorHover,
        activeBorderColor: theme.primaryColor,
      },
      Tabs: {
        inkBarColor: theme.primaryColor,
        itemActiveColor: theme.primaryColor,
        itemHoverColor: theme.primaryHover,
        itemSelectedColor: theme.primaryColor,
      },
      Table: {
        headerBg: theme.backgroundTertiary,
        rowHoverBg: theme.primaryLight,
      },
      Card: {
        colorBorderSecondary: theme.borderColor,
      },
      Tag: {
        defaultBg: theme.backgroundTertiary,
      },
      Badge: {
        colorPrimary: theme.secondaryColor,
      },
    },
  }), [theme]);

  // Get logos for different contexts
  const logoSidebar = currentOrg.logo.sidebar || currentOrg.logo.main; // Sidebar logo for expanded state (with fallback)
  const logoSmall = currentOrg.logo.small || currentOrg.logo.main; // Small logo for collapsed sidebar
  const logo = currentOrg.logo.main; // Main logo for header/other uses

  const committees = currentOrg.committees || [];
  const hasCommittees = committees.length > 0;

  const value: OrgThemeContextValue = {
    currentOrg,
    setCurrentOrg,
    activeCommittee,
    setActiveCommittee,
    theme,
    antdTheme,
    logo,
    logoSidebar,
    logoSmall,
    committees,
    hasCommittees,
  };

  return (
    <OrgThemeContext.Provider value={value}>
      {children}
    </OrgThemeContext.Provider>
  );
};

export const useOrgTheme = (): OrgThemeContextValue => {
  const context = useContext(OrgThemeContext);
  if (!context) {
    throw new Error('useOrgTheme must be used within an OrgThemeProvider');
  }
  return context;
};

export default OrgThemeContext;
