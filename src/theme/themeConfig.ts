import type { ThemeConfig } from 'antd';

/**
 * KTDA eBoard Theme Configuration
 * Based on docs/ktda-theme.css
 * 
 * Primary: Green #324721
 * Secondary: Yellow #ffaf00
 * Tertiary: Grey #f3f3f9
 */

// Color palette
export const colors = {
  // Primary - KTDA Green
  primary: '#324721',
  primaryHover: '#1e2b14',
  primarySubtle: 'rgba(50, 71, 33, 0.1)',
  primaryBgSubtle: '#e8ebe6',
  primaryBorderSubtle: '#d1d7cc',

  // Secondary - KTDA Yellow
  secondary: '#ffaf00',
  secondaryHover: '#cc8c00',
  secondarySubtle: 'rgba(255, 175, 0, 0.1)',
  secondaryBgSubtle: '#fff5e0',
  secondaryBorderSubtle: '#ffe4b3',

  // Tertiary - Light Grey
  tertiary: '#f3f3f9',
  tertiaryText: '#495057',
  tertiaryBgSubtle: '#fcfcfd',
  tertiaryBorderSubtle: '#e9ecef',

  // Info - Blue
  info: '#3577f1',
  infoHover: '#1f5ccf',
  infoSubtle: 'rgba(53, 119, 241, 0.1)',
  infoBgSubtle: '#e8f1ff',

  // Success - Green (same as primary)
  success: '#324721',
  successHover: '#1e2b14',
  successSubtle: 'rgba(50, 71, 33, 0.1)',

  // Warning - Yellow (same as secondary)
  warning: '#ffaf00',
  warningHover: '#cc8c00',
  warningSubtle: 'rgba(255, 175, 0, 0.1)',

  // Error/Danger - Red
  error: '#f06548',
  errorHover: '#d9534f',
  errorSubtle: 'rgba(240, 101, 72, 0.1)',

  // Neutral
  white: '#ffffff',
  black: '#000000',
  grey: '#c6c6c6',
  darkGrey: '#6c757d',
  lightGrey: '#f3f3f9',

  // Text
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  textMuted: '#929492',

  // Borders
  border: '#e9ecef',
  borderLight: '#f3f3f9',

  // Sidebar
  sidebarBg: '#324721',
  sidebarBgDark: '#1e2b14',
  sidebarText: '#929492',
  sidebarTextHover: '#ffaf00',
  sidebarActiveText: '#ffaf00',
  sidebarActiveBg: 'rgba(255, 175, 0, 0.15)',
} as const;

// Ant Design Theme Configuration
export const themeConfig: ThemeConfig = {
  token: {
    // Brand colors
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,

    // Link colors
    colorLink: colors.primary,
    colorLinkHover: colors.primaryHover,
    colorLinkActive: colors.primaryHover,

    // Background colors
    colorBgContainer: colors.white,
    colorBgLayout: colors.tertiary,
    colorBgElevated: colors.white,

    // Border
    colorBorder: colors.border,
    colorBorderSecondary: colors.borderLight,
    borderRadius: 4,

    // Typography
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    
    // Sizing
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,

    // Motion
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    Layout: {
      headerBg: colors.white,
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: colors.sidebarBg,
      bodyBg: colors.tertiary,
      triggerBg: colors.primaryHover,
      triggerColor: colors.white,
    },
    Menu: {
      darkItemBg: colors.sidebarBg,
      darkItemColor: colors.sidebarText,
      darkItemHoverBg: colors.sidebarActiveBg,
      darkItemHoverColor: colors.sidebarTextHover,
      darkItemSelectedBg: colors.sidebarActiveBg,
      darkItemSelectedColor: colors.sidebarActiveText,
      darkSubMenuItemBg: colors.sidebarBgDark,
      itemHeight: 44,
      iconSize: 18,
      collapsedIconSize: 20,
    },
    Button: {
      primaryColor: colors.white,
      defaultBorderColor: colors.border,
      fontWeight: 500,
    },
    Card: {
      headerBg: colors.white,
      paddingLG: 24,
    },
    Table: {
      headerBg: colors.tertiaryBgSubtle,
      headerColor: colors.textPrimary,
      rowHoverBg: 'rgba(50, 71, 33, 0.03)',
      borderColor: colors.border,
    },
    Input: {
      activeBorderColor: colors.primary,
      hoverBorderColor: colors.primary,
    },
    Select: {
      optionSelectedBg: colors.primarySubtle,
    },
    Tabs: {
      inkBarColor: colors.primary,
      itemActiveColor: colors.primary,
      itemHoverColor: colors.primary,
      itemSelectedColor: colors.primary,
    },
    Badge: {
      dotSize: 8,
    },
    Breadcrumb: {
      itemColor: colors.darkGrey,
      lastItemColor: colors.primary,
      linkColor: colors.darkGrey,
      linkHoverColor: colors.primary,
    },
    Steps: {
      colorPrimary: colors.primary,
    },
    Modal: {
      headerBg: colors.primary,
      titleColor: colors.white,
    },
    Notification: {
      colorBgElevated: colors.white,
    },
    Form: {
      labelFontSize: 14,
      labelColor: colors.textPrimary,
      labelHeight: 22,
      itemMarginBottom: 20,
      verticalLabelPadding: '0 0 4px',
      labelColonMarginInlineStart: 4,
      labelColonMarginInlineEnd: 8,
    },
  },
  // Custom CSS for Form labels (not directly supported in token system)
  // Apply via ConfigProvider or global CSS
};

// Sidebar theme options (for theme switching)
export type SidebarTheme = 'dark' | 'light';

export const sidebarThemes = {
  dark: {
    background: colors.sidebarBg,
    backgroundGradient: `linear-gradient(to bottom, ${colors.sidebarBg} 0%, ${colors.sidebarBgDark} 100%)`,
    textColor: colors.sidebarText,
    textHoverColor: colors.sidebarTextHover,
    activeTextColor: colors.sidebarActiveText,
    activeBgColor: colors.sidebarActiveBg,
    menuTitleColor: 'rgba(255, 255, 255, 0.6)',
  },
  light: {
    background: colors.white,
    backgroundGradient: colors.white,
    textColor: colors.textSecondary,
    textHoverColor: colors.primary,
    activeTextColor: colors.primary,
    activeBgColor: colors.primarySubtle,
    menuTitleColor: colors.textMuted,
  },
} as const;

export default themeConfig;
