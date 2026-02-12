/**
 * Meeting Room Dark Theme
 * 
 * Jitsi-style dark palette used exclusively inside the meeting room.
 * Mirrors BoardBranding property names so components can consume it
 * the same way they consume the board theme.
 * 
 * The board's primaryColor is preserved as the accent for governance branding.
 */

import type { BoardBranding } from '../../../types/board.types';

// ============================================================================
// DARK PALETTE CONSTANTS
// ============================================================================

const DARK = {
  // Core surfaces
  bg: '#111111',
  bgSecondary: '#1a1a1a',
  bgTertiary: '#1e1e1e',
  bgQuaternary: '#232323',
  bgHover: '#2a2a2a',
  bgActive: '#333333',

  // Toolbar / header
  toolbar: '#1c1c1c',
  toolbarBorder: '#2a2a2a',

  // Text
  textPrimary: '#e0e0e0',
  textSecondary: '#a0a0a0',
  textTertiary: '#707070',
  textDisabled: '#505050',
  textPlaceholder: '#606060',

  // Borders
  border: '#2e2e2e',
  borderLight: '#252525',
  borderStrong: '#3a3a3a',
  borderHover: '#4a4a4a',

  // Surfaces
  card: '#1e1e1e',
  cardHover: '#252525',
  elevated: '#232323',
  sunken: '#151515',
  overlay: 'rgba(0, 0, 0, 0.65)',

  // Filmstrip / participant tiles
  tile: '#2a2a2a',
  tileBorder: '#3a3a3a',

  // Semantic (slightly muted for dark)
  success: '#52c41a',
  successLight: 'rgba(82, 196, 26, 0.15)',
  warning: '#faad14',
  warningLight: 'rgba(250, 173, 20, 0.15)',
  error: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.15)',
  info: '#1890ff',
  infoLight: 'rgba(24, 144, 255, 0.15)',

  // Buttons
  btnDefault: '#2a2a2a',
  btnDefaultBorder: '#3a3a3a',
  btnDefaultText: '#ccc',
  btnDanger: '#dc2626',
  btnDangerHover: '#ef4444',
  btnActive: '#4a4a4a',
} as const;

// ============================================================================
// BUILD DARK THEME FROM BOARD BRANDING
// ============================================================================

/**
 * Creates a dark meeting room theme that preserves the board's accent colors
 * (primaryColor, secondaryColor) but overrides all surface/text/border colors
 * with the dark Jitsi-style palette.
 */
export const buildMeetingRoomTheme = (boardTheme: BoardBranding): MeetingRoomTheme => ({
  // Preserve board accent colors for governance branding
  primaryColor: boardTheme.primaryColor,
  primaryHover: boardTheme.primaryHover,
  primaryLight: boardTheme.primaryLight,
  primaryContrast: boardTheme.primaryContrast,
  secondaryColor: boardTheme.secondaryColor,
  secondaryHover: boardTheme.secondaryHover,
  accentColor: boardTheme.accentColor,

  // Dark backgrounds
  backgroundPrimary: DARK.bg,
  backgroundSecondary: DARK.bgSecondary,
  backgroundTertiary: DARK.bgTertiary,
  backgroundQuaternary: DARK.bgQuaternary,
  backgroundHover: DARK.bgHover,
  backgroundActive: DARK.bgActive,
  backgroundDisabled: DARK.bgQuaternary,

  // Dark text
  textPrimary: DARK.textPrimary,
  textSecondary: DARK.textSecondary,
  textTertiary: DARK.textTertiary,
  textDisabled: DARK.textDisabled,
  textPlaceholder: DARK.textPlaceholder,
  textInverse: '#111111',

  // Dark borders
  borderColor: DARK.border,
  borderColorHover: DARK.borderHover,
  borderColorLight: DARK.borderLight,
  borderColorStrong: DARK.borderStrong,
  borderColorFocus: boardTheme.primaryColor,

  // Semantic colors (same, work well on dark)
  successColor: DARK.success,
  successLight: DARK.successLight,
  warningColor: DARK.warning,
  warningLight: DARK.warningLight,
  errorColor: DARK.error,
  errorLight: DARK.errorLight,
  infoColor: DARK.info,
  infoLight: DARK.infoLight,

  // Surfaces
  surfaceElevated: DARK.elevated,
  surfaceSunken: DARK.sunken,
  surfaceOverlay: DARK.overlay,

  // Depth
  depthLevel1Bg: DARK.bgSecondary,
  depthLevel2Bg: DARK.bgTertiary,
  depthLevel3Bg: DARK.bgQuaternary,

  // Links
  linkColor: boardTheme.primaryColor,
  linkHover: boardTheme.accentColor,
  linkActive: boardTheme.primaryHover,

  // Sidebar (not used in meeting room, but keeping for type compat)
  sidebarBg: DARK.toolbar,
  sidebarTextColor: DARK.textSecondary,
  sidebarActiveColor: boardTheme.accentColor,
  sidebarActiveBg: `${boardTheme.accentColor}25`,

  // Theme mode
  themeMode: 'dark' as const,
  inheritFromParent: false,

  // Meeting room specific tokens
  toolbar: DARK.toolbar,
  toolbarBorder: DARK.toolbarBorder,
  tile: DARK.tile,
  tileBorder: DARK.tileBorder,
  card: DARK.card,
  cardHover: DARK.cardHover,
  btnDefault: DARK.btnDefault,
  btnDefaultBorder: DARK.btnDefaultBorder,
  btnDefaultText: DARK.btnDefaultText,
  btnDanger: DARK.btnDanger,
  btnDangerHover: DARK.btnDangerHover,
  btnActive: DARK.btnActive,
});

// ============================================================================
// TYPE
// ============================================================================

export interface MeetingRoomTheme extends BoardBranding {
  // Meeting room specific tokens (beyond BoardBranding)
  toolbar: string;
  toolbarBorder: string;
  tile: string;
  tileBorder: string;
  card: string;
  cardHover: string;
  btnDefault: string;
  btnDefaultBorder: string;
  btnDefaultText: string;
  btnDanger: string;
  btnDangerHover: string;
  btnActive: string;
}

// ============================================================================
// DEFAULT (fallback if no board theme available)
// ============================================================================

export const defaultMeetingRoomTheme: MeetingRoomTheme = {
  primaryColor: '#4a6cf7',
  primaryHover: '#3b5de8',
  primaryLight: 'rgba(74, 108, 247, 0.15)',
  primaryContrast: '#ffffff',
  secondaryColor: '#ffaf00',
  secondaryHover: '#e69d00',
  accentColor: '#ffaf00',

  backgroundPrimary: DARK.bg,
  backgroundSecondary: DARK.bgSecondary,
  backgroundTertiary: DARK.bgTertiary,
  backgroundQuaternary: DARK.bgQuaternary,
  backgroundHover: DARK.bgHover,
  backgroundActive: DARK.bgActive,
  backgroundDisabled: DARK.bgQuaternary,

  textPrimary: DARK.textPrimary,
  textSecondary: DARK.textSecondary,
  textTertiary: DARK.textTertiary,
  textDisabled: DARK.textDisabled,
  textPlaceholder: DARK.textPlaceholder,
  textInverse: '#111111',

  borderColor: DARK.border,
  borderColorHover: DARK.borderHover,
  borderColorLight: DARK.borderLight,
  borderColorStrong: DARK.borderStrong,
  borderColorFocus: '#4a6cf7',

  successColor: DARK.success,
  successLight: DARK.successLight,
  warningColor: DARK.warning,
  warningLight: DARK.warningLight,
  errorColor: DARK.error,
  errorLight: DARK.errorLight,
  infoColor: DARK.info,
  infoLight: DARK.infoLight,

  surfaceElevated: DARK.elevated,
  surfaceSunken: DARK.sunken,
  surfaceOverlay: DARK.overlay,

  depthLevel1Bg: DARK.bgSecondary,
  depthLevel2Bg: DARK.bgTertiary,
  depthLevel3Bg: DARK.bgQuaternary,

  linkColor: '#4a6cf7',
  linkHover: '#ffaf00',
  linkActive: '#3b5de8',

  sidebarBg: DARK.toolbar,
  sidebarTextColor: DARK.textSecondary,
  sidebarActiveColor: '#ffaf00',
  sidebarActiveBg: 'rgba(255, 175, 0, 0.15)',

  themeMode: 'dark' as const,
  inheritFromParent: false,

  toolbar: DARK.toolbar,
  toolbarBorder: DARK.toolbarBorder,
  tile: DARK.tile,
  tileBorder: DARK.tileBorder,
  card: DARK.card,
  cardHover: DARK.cardHover,
  btnDefault: DARK.btnDefault,
  btnDefaultBorder: DARK.btnDefaultBorder,
  btnDefaultText: DARK.btnDefaultText,
  btnDanger: DARK.btnDanger,
  btnDangerHover: DARK.btnDangerHover,
  btnActive: DARK.btnActive,
};
