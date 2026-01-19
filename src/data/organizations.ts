/**
 * Organization Data
 * Defines all organizations with their theme configurations and logos
 */

// Logo imports
import ktdaLogoDark from '../assets/ktdadefault/ktdalogo-dark.png';
import ktdaLogoLight from '../assets/ktdadefault/ktdalogo-light.png';
import ktdaLogoSm from '../assets/ktdadefault/ktdalogo-sm.png';
import ktdaLogoMain from '../assets/ktdadefault/ktdalogo-login.gif';
import ketepaLogoMain from '../assets/ketepa/ketepa-logo-main.png';
import ketepaLogoDark from '../assets/ketepa/Ketepa-logo-dark.png';
import chaitradingLogo from '../assets/chaitrading/chaitrading-logo-main.jpg';
import chailogisticsLogo from '../assets/chailogistics/chailogistics-logo-main.png';
import ktdafoundationLogo from '../assets/ktdafoundation/ktdafoundation-logo-main.jpg';
import temecLogo from '../assets/temec/temec-logo-main.png';
import majaniLogoMain from '../assets/majaniinsurance/majaniinsurance-logo-main.png';
import majaniLogoDark from '../assets/majaniinsurance/majaniinsurance-logo-dark.jpg';
import greenlandfedhaLogo from '../assets/greenlandfedha-logo-main.jpg';
import dmccLogo from '../assets/DMCC/dmcc-logo-main.jpg';

export type OrgType = 'group' | 'main' | 'subsidiary' | 'factory' | 'committee';

export interface OrgThemeConfig {
  // Primary Brand Colors
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  primaryContrast: string; // Text color on primary background
  
  // Secondary/Accent Colors
  secondaryColor: string;
  secondaryHover: string;
  accentColor: string;
  
  // Semantic Colors
  successColor: string;
  successLight: string;
  warningColor: string;
  warningLight: string;
  errorColor: string;
  errorLight: string;
  infoColor: string;
  infoLight: string;
  
  // Neutral Colors
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  borderColor: string;
  borderColorHover: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  
  // Sidebar Specific
  sidebarBg: string;
  sidebarBgGradient?: string;
  sidebarTextColor: string;
  sidebarActiveColor: string;
  sidebarActiveBg: string;
  
  // Link Colors
  linkColor: string;
  linkHover: string;
  linkActive: string;
}

export interface Committee {
  id: string;
  name: string;
  shortName: string;
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  type: OrgType;
  parentId?: string;
  logo: {
    main: string;
    dark?: string;
    light?: string;
    small?: string;
    sidebar?: string; // Optional sidebar-specific logo
  };
  theme: OrgThemeConfig;
  committees?: Committee[];
  zone?: number; // For factories
}

// Default KTDA Theme
const ktdaTheme: OrgThemeConfig = {
  // Primary Brand Colors
  primaryColor: '#324721',
  primaryHover: '#283a1a',
  primaryLight: 'rgba(50, 71, 33, 0.1)',
  primaryContrast: '#ffffff',
  
  // Secondary/Accent Colors
  secondaryColor: '#ffaf00',
  secondaryHover: '#e69d00',
  accentColor: '#ffaf00',
  
  // Semantic Colors
  successColor: '#52c41a',
  successLight: 'rgba(82, 196, 26, 0.1)',
  warningColor: '#faad14',
  warningLight: 'rgba(250, 173, 20, 0.1)',
  errorColor: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.1)',
  infoColor: '#1890ff',
  infoLight: 'rgba(24, 144, 255, 0.1)',
  
  // Neutral Colors
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  borderColor: '#d9d9d9',
  borderColorHover: '#40a9ff',
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  
  // Sidebar Specific
  sidebarBg: '#324721',
  sidebarBgGradient: 'linear-gradient(to bottom, #324721 0%, #1e2b14 100%)',
  sidebarTextColor: '#929492',
  sidebarActiveColor: '#ffaf00',
  sidebarActiveBg: 'rgba(255, 175, 0, 0.15)',
  
  // Link Colors
  linkColor: '#324721',
  linkHover: '#ffaf00',
  linkActive: '#283a1a',
};

// KETEPA Theme (Green/Yellow)
const ketepaTheme: OrgThemeConfig = {
  // Primary Brand Colors (Dark Green)
  primaryColor: '#09301c',
  primaryHover: '#072418',
  primaryLight: 'rgba(9, 48, 28, 0.1)',
  primaryContrast: '#ffffff',
  
  // Secondary/Accent Colors (Yellow/Gold)
  secondaryColor: '#daa520',
  secondaryHover: '#c49320',
  accentColor: '#daa520',
  
  // Semantic Colors (Using KETEPA palette)
  successColor: '#005213', // Light green from palette
  successLight: 'rgba(0, 82, 19, 0.1)',
  warningColor: '#d2d587', // Light yellow from palette
  warningLight: 'rgba(210, 213, 135, 0.15)',
  errorColor: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.1)',
  infoColor: '#1890ff',
  infoLight: 'rgba(24, 144, 255, 0.1)',
  
  // Neutral Colors
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  borderColor: '#d9d9d9',
  borderColorHover: '#daa520',
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  
  // Sidebar Specific (Gold gradient)
  sidebarBg: '#09301c',
  sidebarBgGradient: 'linear-gradient(to bottom, #09301c 0%, #072418 100%)',
  sidebarTextColor: '#d2d587',
  sidebarActiveColor: '#daa520',
  sidebarActiveBg: 'rgba(218, 165, 32, 0.15)',
  
  // Link Colors
  linkColor: '#09301c',
  linkHover: '#daa520',
  linkActive: '#005213',
};

// TEMEC Theme (Brown/Orange/Blue)
const temecTheme: OrgThemeConfig = {
  // Primary Brand Colors (Dark Brown)
  primaryColor: '#411f1e',
  primaryHover: '#331816',
  primaryLight: 'rgba(65, 31, 30, 0.1)',
  primaryContrast: '#ffffff',
  
  // Secondary/Accent Colors (Light Orange)
  secondaryColor: '#fe7902',
  secondaryHover: '#e56d02',
  accentColor: '#fe7902',
  
  // Semantic Colors (Using TEMEC palette)
  successColor: '#52c41a',
  successLight: 'rgba(82, 196, 26, 0.1)',
  warningColor: '#fe7902', // Orange from palette
  warningLight: 'rgba(254, 121, 2, 0.1)',
  errorColor: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.1)',
  infoColor: '#020e28', // Dark blue from palette
  infoLight: 'rgba(2, 14, 40, 0.1)',
  
  // Neutral Colors
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  borderColor: '#d9d9d9',
  borderColorHover: '#fe7902',
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  
  // Sidebar Specific (Dark Brown with blue accent)
  sidebarBg: '#411f1e',
  sidebarBgGradient: 'linear-gradient(to bottom, #411f1e 0%, #020e28 100%)',
  sidebarTextColor: 'rgba(254, 121, 2, 0.7)',
  sidebarActiveColor: '#fe7902',
  sidebarActiveBg: 'rgba(254, 121, 2, 0.15)',
  
  // Link Colors
  linkColor: '#411f1e',
  linkHover: '#fe7902',
  linkActive: '#020e28',
};

// Generic Subsidiary Theme (Green) - Used for subsidiaries without custom themes
const subsidiaryTheme: OrgThemeConfig = {
  // Primary Brand Colors
  primaryColor: '#52c41a',
  primaryHover: '#3fa514',
  primaryLight: 'rgba(82, 196, 26, 0.1)',
  primaryContrast: '#ffffff',
  
  // Secondary/Accent Colors
  secondaryColor: '#73d13d',
  secondaryHover: '#5bb829',
  accentColor: '#52c41a',
  
  // Semantic Colors
  successColor: '#52c41a',
  successLight: 'rgba(82, 196, 26, 0.1)',
  warningColor: '#faad14',
  warningLight: 'rgba(250, 173, 20, 0.1)',
  errorColor: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.1)',
  infoColor: '#1890ff',
  infoLight: 'rgba(24, 144, 255, 0.1)',
  
  // Neutral Colors
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  borderColor: '#d9d9d9',
  borderColorHover: '#52c41a',
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  
  // Sidebar Specific
  sidebarBg: '#1a3a1a',
  sidebarBgGradient: 'linear-gradient(to bottom, #1a3a1a 0%, #0d1f0d 100%)',
  sidebarTextColor: '#a6adb4',
  sidebarActiveColor: '#52c41a',
  sidebarActiveBg: 'rgba(82, 196, 26, 0.15)',
  
  // Link Colors
  linkColor: '#52c41a',
  linkHover: '#73d13d',
  linkActive: '#3fa514',
};

// Factory Theme (Gold/Orange) - Inherits KTDA branding with factory accent
const factoryTheme: OrgThemeConfig = {
  // Primary Brand Colors (Inherits KTDA green)
  primaryColor: '#324721',
  primaryHover: '#283a1a',
  primaryLight: 'rgba(50, 71, 33, 0.1)',
  primaryContrast: '#ffffff',
  
  // Secondary/Accent Colors (Factory gold)
  secondaryColor: '#faad14',
  secondaryHover: '#e69d00',
  accentColor: '#faad14',
  
  // Semantic Colors
  successColor: '#52c41a',
  successLight: 'rgba(82, 196, 26, 0.1)',
  warningColor: '#faad14',
  warningLight: 'rgba(250, 173, 20, 0.1)',
  errorColor: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.1)',
  infoColor: '#1890ff',
  infoLight: 'rgba(24, 144, 255, 0.1)',
  
  // Neutral Colors
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  borderColor: '#d9d9d9',
  borderColorHover: '#faad14',
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  
  // Sidebar Specific (Inherits KTDA)
  sidebarBg: '#324721',
  sidebarBgGradient: 'linear-gradient(to bottom, #324721 0%, #1e2b14 100%)',
  sidebarTextColor: '#929492',
  sidebarActiveColor: '#faad14',
  sidebarActiveBg: 'rgba(250, 173, 20, 0.15)',
  
  // Link Colors
  linkColor: '#324721',
  linkHover: '#faad14',
  linkActive: '#283a1a',
};

// KTDA Main Board Committees
const ktdaCommittees: Committee[] = [
  { id: 'audit', name: 'Audit Committee', shortName: 'Audit' },
  { id: 'hr', name: 'HR Committee', shortName: 'HR' },
  { id: 'nomination', name: 'Nomination Committee', shortName: 'Nomination' },
  { id: 'sales', name: 'Sales Committee', shortName: 'Sales' },
  { id: 'finance', name: 'Finance Committee', shortName: 'Finance' },
];

// KETEPA Committees
const ketepaCommittees: Committee[] = [
  { id: 'ketepa-audit', name: 'Audit Committee', shortName: 'Audit' },
  { id: 'ketepa-hr', name: 'HR Committee', shortName: 'HR' },
];

// All Organizations
export const organizations: Organization[] = [
  // KTDA Group (Aggregated View)
  {
    id: 'ktda-group',
    name: 'KTDA Group',
    shortName: 'All Entities',
    type: 'group',
    logo: {
      main: ktdaLogoMain,
      dark: ktdaLogoDark,
      light: ktdaLogoLight,
      small: ktdaLogoSm,
      sidebar: ktdaLogoLight,
    },
    theme: ktdaTheme,
  },

  // KTDA Main Board
  {
    id: 'ktda-main',
    name: 'KTDA Main Board',
    shortName: 'Main Board',
    type: 'main',
    logo: {
      main: ktdaLogoMain,
      dark: ktdaLogoDark,
      light: ktdaLogoLight,
      small: ktdaLogoSm,
      sidebar: ktdaLogoLight,
    },
    theme: ktdaTheme,
    committees: ktdaCommittees,
  },

  // Subsidiaries
  {
    id: 'ketepa',
    name: 'KETEPA Limited',
    shortName: 'KETEPA',
    type: 'subsidiary',
    logo: {
      main: ketepaLogoMain,
      dark: ketepaLogoDark,
    },
    theme: ketepaTheme,
    committees: ketepaCommittees,
  },
  {
    id: 'chai-trading',
    name: 'Chai Trading Company',
    shortName: 'Chai Trading',
    type: 'subsidiary',
    logo: {
      main: chaitradingLogo,
    },
    theme: subsidiaryTheme,
  },
  {
    id: 'chai-logistics',
    name: 'Chai Logistics Limited',
    shortName: 'Chai Logistics',
    type: 'subsidiary',
    logo: {
      main: chailogisticsLogo,
    },
    theme: subsidiaryTheme,
  },
  {
    id: 'greenland-fedha',
    name: 'Greenland Fedha Limited',
    shortName: 'Greenland Fedha',
    type: 'subsidiary',
    logo: {
      main: greenlandfedhaLogo,
    },
    theme: subsidiaryTheme,
  },
  {
    id: 'majani-insurance',
    name: 'Majani Insurance Brokers',
    shortName: 'Majani Insurance',
    type: 'subsidiary',
    logo: {
      main: majaniLogoMain,
      dark: majaniLogoDark,
    },
    theme: subsidiaryTheme,
  },
  {
    id: 'ktda-power',
    name: 'KTDA Power Company',
    shortName: 'KTDA Power',
    type: 'subsidiary',
    logo: {
      main: ktdaLogoDark, // Uses KTDA logo
      dark: ktdaLogoDark,
      light: ktdaLogoLight,
    },
    theme: subsidiaryTheme,
  },
  {
    id: 'temec',
    name: 'Tea Machinery & Equipment Company',
    shortName: 'TEMEC',
    type: 'subsidiary',
    logo: {
      main: temecLogo,
    },
    theme: temecTheme,
  },
  {
    id: 'ktda-foundation',
    name: 'KTDA Foundation',
    shortName: 'Foundation',
    type: 'subsidiary',
    logo: {
      main: ktdafoundationLogo,
    },
    theme: subsidiaryTheme,
  },
  {
    id: 'dmcc',
    name: 'DMCC Tea Trading',
    shortName: 'DMCC',
    type: 'subsidiary',
    logo: {
      main: dmccLogo,
    },
    theme: subsidiaryTheme,
  },

  // Sample Factories (Zone 1)
  {
    id: 'factory-chebut',
    name: 'Chebut Tea Factory',
    shortName: 'Chebut',
    type: 'factory',
    zone: 1,
    logo: {
      main: ktdaLogoDark,
      dark: ktdaLogoDark,
      light: ktdaLogoLight,
    },
    theme: factoryTheme,
  },
  {
    id: 'factory-kapkatet',
    name: 'Kapkatet Tea Factory',
    shortName: 'Kapkatet',
    type: 'factory',
    zone: 1,
    logo: {
      main: ktdaLogoDark,
      dark: ktdaLogoDark,
      light: ktdaLogoLight,
    },
    theme: factoryTheme,
  },
  {
    id: 'factory-litein',
    name: 'Litein Tea Factory',
    shortName: 'Litein',
    type: 'factory',
    zone: 2,
    logo: {
      main: ktdaLogoDark,
      dark: ktdaLogoDark,
      light: ktdaLogoLight,
    },
    theme: factoryTheme,
  },
  {
    id: 'factory-mogogosiek',
    name: 'Mogogosiek Tea Factory',
    shortName: 'Mogogosiek',
    type: 'factory',
    zone: 2,
    logo: {
      main: ktdaLogoDark,
      dark: ktdaLogoDark,
      light: ktdaLogoLight,
    },
    theme: factoryTheme,
  },
];

// Helper functions
export const getOrganizationById = (id: string): Organization | undefined => {
  return organizations.find(org => org.id === id);
};

export const getOrganizationsByType = (type: OrgType): Organization[] => {
  return organizations.filter(org => org.type === type);
};

export const getSubsidiaries = (): Organization[] => {
  return getOrganizationsByType('subsidiary');
};

export const getFactories = (): Organization[] => {
  return getOrganizationsByType('factory');
};

export const getFactoriesByZone = (zone: number): Organization[] => {
  return organizations.filter(org => org.type === 'factory' && org.zone === zone);
};

export const getUniqueZones = (): number[] => {
  const zones = organizations
    .filter(org => org.type === 'factory' && org.zone)
    .map(org => org.zone as number);
  return [...new Set(zones)].sort((a, b) => a - b);
};

// Default organization (KTDA Main Board)
export const defaultOrganization = organizations.find(org => org.id === 'ktda-main')!;
