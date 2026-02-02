/**
 * Board Branding Table - Branding configuration per board
 * Stores logo paths and color schemes for each board
 */

export interface BoardBrandingRow {
  boardId: string;
  // Logo paths (relative to src/assets/)
  logoMain: string;
  logoSmall: string | null;
  logoDark: string | null;
  logoLight: string | null;
  
  // Primary Brand Colors
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  primaryContrast: string;
  
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
  
  // Neutral Colors - Backgrounds
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundQuaternary: string;
  backgroundHover: string;
  backgroundActive: string;
  backgroundDisabled: string;
  
  // Neutral Colors - Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textPlaceholder: string;
  textInverse: string;
  
  // Neutral Colors - Borders
  borderColor: string;
  borderColorHover: string;
  borderColorLight: string;
  borderColorStrong: string;
  borderColorFocus: string;
  
  // Depth-Specific Colors (for nested items)
  depthLevel1Bg: string;
  depthLevel2Bg: string;
  depthLevel3Bg: string;
  
  // Surface Colors (for elevated elements)
  surfaceElevated: string;
  surfaceSunken: string;
  surfaceOverlay: string;
  
  // Sidebar Specific
  sidebarBg: string;
  sidebarBgGradient: string | null;
  sidebarTextColor: string;
  sidebarActiveColor: string;
  sidebarActiveBg: string;
  
  // Link Colors
  linkColor: string;
  linkHover: string;
  linkActive: string;
}

// ============================================================================
// DEFAULT BRANDING (KTDA theme)
// ============================================================================

const defaultBranding: Omit<BoardBrandingRow, 'boardId'> = {
  // Logos
  logoMain: 'ktdadefault/ktdalogo-dark.png',
  logoSmall: 'ktdadefault/ktdalogo-sm.png',
  logoDark: 'ktdadefault/ktdalogo-dark.png',
  logoLight: 'ktdadefault/ktdalogo-light.png',
  
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
  
  // Neutral Colors - Backgrounds
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  backgroundQuaternary: '#f5f5f5',
  backgroundHover: '#f0f0f0',
  backgroundActive: '#e8e8e8',
  backgroundDisabled: '#fafafa',
  
  // Neutral Colors - Text
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textTertiary: 'rgba(0, 0, 0, 0.45)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  textPlaceholder: 'rgba(0, 0, 0, 0.35)',
  textInverse: '#ffffff',
  
  // Neutral Colors - Borders
  borderColor: '#d9d9d9',
  borderColorHover: '#40a9ff',
  borderColorLight: '#f0f0f0',
  borderColorStrong: '#bfbfbf',
  borderColorFocus: '#1890ff',
  
  // Depth-Specific Colors (for nested items)
  // Level 1 will use primaryLight (defined above as 'rgba(50, 71, 33, 0.1)')
  depthLevel1Bg: 'rgba(50, 71, 33, 0.12)',  // Light green tint (more visible)
  depthLevel2Bg: 'rgba(50, 71, 33, 0.08)',  // Lighter green tint
  depthLevel3Bg: 'rgba(50, 71, 33, 0.04)',  // Very subtle green
  
  // Surface Colors (for elevated elements)
  surfaceElevated: '#ffffff',
  surfaceSunken: '#f5f5f5',
  surfaceOverlay: 'rgba(0, 0, 0, 0.45)',
  
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

// ============================================================================
// BOARD BRANDING TABLE DATA
// ============================================================================

export const boardBrandingTable: BoardBrandingRow[] = [
  // KTDA MS (Main Board)
  {
    boardId: 'ktda-ms',
    ...defaultBranding,
  },

  // Committees (inherit from main)
  {
    boardId: 'comm-audit',
    ...defaultBranding,
  },
  {
    boardId: 'comm-hr',
    ...defaultBranding,
  },
  {
    boardId: 'comm-finance',
    ...defaultBranding,
  },
  {
    boardId: 'comm-nomination',
    ...defaultBranding,
  },

  // KETEPA
  {
    boardId: 'ketepa',
    ...defaultBranding,
    logoMain: 'ketepa/ketepa-logo-main.png',
    logoSmall: 'ketepa/ketepa-logo-main.png',
    logoDark: 'ketepa/Ketepa-logo-dark.png',
    logoLight: null,
    primaryColor: '#09301c',
    primaryHover: '#062215',
    primaryLight: 'rgba(9, 48, 28, 0.12)',
    primaryContrast: '#ffffff',
    secondaryColor: '#daa520',
    secondaryHover: '#c2941c',
    accentColor: '#daa520',
    sidebarBg: '#09301c',
    sidebarBgGradient: 'linear-gradient(to bottom, #09301c 0%, #062215 100%)',
    sidebarTextColor: '#e0e6e2',
    sidebarActiveColor: '#daa520',
    sidebarActiveBg: 'rgba(218, 165, 32, 0.18)',
  },

  // TEMEC
  {
    boardId: 'temec',
    ...defaultBranding,
    logoMain: 'temec/temec-logo-main.png',
  logoSmall: 'temec/temec-logo-main.png',
  logoDark: null,
  logoLight: null,
  primaryColor: '#411f1e',
  primaryHover: '#2f1514',
  primaryLight: 'rgba(65, 31, 30, 0.12)',
  primaryContrast: '#ffffff',
  secondaryColor: '#fe7902',
  secondaryHover: '#e56c00',
  accentColor: '#fe7902',
  sidebarBg: '#020e28',
  sidebarBgGradient: 'linear-gradient(to bottom, #020e28 0%, #411f1e 100%)',
  sidebarTextColor: '#c7ccd6',
  sidebarActiveColor: '#fe7902',
  sidebarActiveBg: 'rgba(254, 121, 2, 0.15)',
  },

  // Chai Trading
  {
    boardId: 'chai-trading',
    ...defaultBranding,
    logoMain: 'chaitrading/chaitrading-logo-main.jpg',
    logoSmall: 'chaitrading/chaitrading-logo-main.jpg',
    logoDark: null,
    logoLight: null,
    primaryColor: '#2E7D32',
    primaryHover: '#1b5e20',
    primaryLight: 'rgba(46, 125, 50, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#FF8F00',
    secondaryHover: '#e68200',
    accentColor: '#FF8F00',
    sidebarBg: '#2E7D32',
    sidebarBgGradient: 'linear-gradient(to bottom, #d2d587 0%, #a8c46a 18%, #2E7D32 45%, #1b5e20 100%)',
    sidebarTextColor: '#a5d6a7',
    sidebarActiveColor: '#FF8F00',
    sidebarActiveBg: 'rgba(255, 143, 0, 0.15)',
  },

  // KTDA Power
  {
    boardId: 'ktda-power',
    ...defaultBranding,
    primaryColor: '#1976D2',
    primaryHover: '#1565c0',
    sidebarBg: '#1976D2',
  },

  // Greenland Fedha
  {
    boardId: 'greenland-fedha',
    ...defaultBranding,
    logoMain: 'greenlandfedha-logo-main.jpg',
    logoSmall: 'greenlandfedha-logo-main.jpg',
    logoDark: null,
    logoLight: null,
    primaryColor: '#388E3C',
    primaryHover: '#2e7d32',
    primaryLight: 'rgba(56, 142, 60, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#FFC107',
    secondaryHover: '#e6ad00',
    accentColor: '#FFC107',
    sidebarBg: '#388E3C',
    sidebarBgGradient: 'linear-gradient(to bottom, #388E3C 0%, #2e7d32 100%)',
    sidebarTextColor: '#a5d6a7',
    sidebarActiveColor: '#FFC107',
    sidebarActiveBg: 'rgba(255, 193, 7, 0.15)',
  },

  // KTDA Foundation
  {
    boardId: 'ktda-foundation',
    ...defaultBranding,
    logoMain: 'ktdafoundation/ktdafoundation-logo-main.jpg',
    logoSmall: 'ktdafoundation/ktdafoundation-logo-main.jpg',
    logoDark: null,
    logoLight: null,
    primaryColor: '#324721',
    primaryHover: '#283a1a',
    primaryLight: 'rgba(50, 71, 33, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#ffaf00',
    secondaryHover: '#e69d00',
    accentColor: '#ffaf00',
    sidebarBg: '#324721',
    sidebarBgGradient: 'linear-gradient(to bottom, #324721 0%, #1e2b14 100%)',
    sidebarTextColor: '#929492',
    sidebarActiveColor: '#ffaf00',
    sidebarActiveBg: 'rgba(255, 175, 0, 0.15)',
  },

  // Chai Logistics
  {
    boardId: 'chai-logistics',
    ...defaultBranding,
    logoMain: 'chailogistics/chailogistics-logo-main.png',
    logoSmall: 'chailogistics/chailogistics-logo.png',
    logoDark: null,
    logoLight: null,
    primaryColor: '#455A64',
    primaryHover: '#37474f',
    primaryLight: 'rgba(69, 90, 100, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#FF9800',
    secondaryHover: '#e68900',
    accentColor: '#FF9800',
    sidebarBg: '#455A64',
    sidebarBgGradient: 'linear-gradient(to bottom, #455A64 0%, #37474f 100%)',
    sidebarTextColor: '#b0bec5',
    sidebarActiveColor: '#FF9800',
    sidebarActiveBg: 'rgba(255, 152, 0, 0.15)',
  },

  // Majani Insurance
  {
    boardId: 'majani-insurance',
    ...defaultBranding,
    logoMain: 'majaniinsurance/majaniinsurance-logo-main.png',
    logoSmall: 'majaniinsurance/majaniinsurance-logo-main.png',
    logoDark: 'majaniinsurance/majaniinsurance-logo-dark.jpg',
    logoLight: null,
    primaryColor: '#00695C',
    primaryHover: '#004d40',
    primaryLight: 'rgba(0, 105, 92, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#FFB300',
    secondaryHover: '#e6a200',
    accentColor: '#FFB300',
    sidebarBg: '#00695C',
    sidebarBgGradient: 'linear-gradient(to bottom, #00695C 0%, #004d40 100%)',
    sidebarTextColor: '#80cbc4',
    sidebarActiveColor: '#FFB300',
    sidebarActiveBg: 'rgba(255, 179, 0, 0.15)',
  },
  // DDMC
  {
    boardId: 'ddmc',
    ...defaultBranding,
    logoMain: 'ddmc/ddmc-logo-main.png',
    logoSmall: 'ddmc/ddmc-logo-main.png',
    logoDark: null,
    logoLight: null,
    primaryColor: '#1565C0',
    primaryHover: '#0d47a1',
    primaryLight: 'rgba(21, 101, 192, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#FFA000',
    secondaryHover: '#e69100',
    accentColor: '#FFA000',
    sidebarBg: '#1565C0',
    sidebarBgGradient: 'linear-gradient(to bottom, #1565C0 0%, #0d47a1 100%)',
    sidebarTextColor: '#90caf9',
    sidebarActiveColor: '#FFA000',
    sidebarActiveBg: 'rgba(255, 160, 0, 0.15)',
  },
  // DMCC
  {
    boardId: 'dmcc',
    ...defaultBranding,
    logoMain: 'DMCC/DMCC-logo-main.png',
    logoSmall: 'DMCC/DMCC-logo-sm.png',
    logoDark: 'DMCC/DMCC-logo-dark.png',
    logoLight: null,
    primaryColor: '#0a3d62',
    primaryHover: '#072e4a',
    primaryLight: 'rgba(10, 61, 98, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#f39c12',
    secondaryHover: '#d68910',
    accentColor: '#f39c12',
    sidebarBg: '#0a3d62',
    sidebarBgGradient: 'linear-gradient(to bottom, #0a3d62 0%, #072e4a 100%)',
    sidebarTextColor: '#a8c5d9',
    sidebarActiveColor: '#f39c12',
    sidebarActiveBg: 'rgba(243, 156, 18, 0.15)',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get branding for a board by ID
 * Returns default branding if not found
 */
export const getBrandingForBoard = (boardId: string): BoardBrandingRow => {
  const branding = boardBrandingTable.find(b => b.boardId === boardId);
  return branding || { boardId, ...defaultBranding };
};

/**
 * Get default branding
 */
export const getDefaultBranding = (): Omit<BoardBrandingRow, 'boardId'> => {
  return { ...defaultBranding };
};
