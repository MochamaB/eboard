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
  // Primary colors
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  primaryContrast: string;
  // Secondary colors
  secondaryColor: string;
  secondaryHover: string;
  accentColor: string;
  // Sidebar colors
  sidebarBg: string;
  sidebarBgGradient: string | null;
  sidebarTextColor: string;
  sidebarActiveColor: string;
  sidebarActiveBg: string;
}

// ============================================================================
// DEFAULT BRANDING (KTDA theme)
// ============================================================================

const defaultBranding: Omit<BoardBrandingRow, 'boardId'> = {
  logoMain: 'ktdadefault/ktdalogo-dark.png',
  logoSmall: 'ktdadefault/ktdalogo-sm.png',
  logoDark: 'ktdadefault/ktdalogo-dark.png',
  logoLight: 'ktdadefault/ktdalogo-light.png',
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
    logoMain: 'ketepa/ketepa-logo-main.png',
    logoSmall: 'ketepa/ketepa-logo-main.png',
    logoDark: 'ketepa/Ketepa-logo-dark.png',
    logoLight: null,
    primaryColor: '#8B4513',
    primaryHover: '#6d360f',
    primaryLight: 'rgba(139, 69, 19, 0.1)',
    primaryContrast: '#ffffff',
    secondaryColor: '#FFD700',
    secondaryHover: '#e6c200',
    accentColor: '#FFD700',
    sidebarBg: '#8B4513',
    sidebarBgGradient: 'linear-gradient(to bottom, #8B4513 0%, #5c2d0e 100%)',
    sidebarTextColor: '#d4a574',
    sidebarActiveColor: '#FFD700',
    sidebarActiveBg: 'rgba(255, 215, 0, 0.15)',
  },

  // TEMEC
  {
    boardId: 'temec',
    logoMain: 'temec/temec-logo-main.png',
    logoSmall: 'temec/temec-logo-main.png',
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

  // Chai Trading
  {
    boardId: 'chai-trading',
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
    sidebarBgGradient: 'linear-gradient(to bottom, #2E7D32 0%, #1b5e20 100%)',
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
