/**
 * Board Context
 * Provides current board, theme, and committee filtering throughout the app
 * Fetches board data from API. Branding/settings/children come from API endpoints.
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ThemeConfig } from 'antd';
import { message } from 'antd';
import type { Board, BoardBranding } from '../types/board.types';
import { boardsApi } from '../api/boards.api';
import { useAuth } from './AuthContext';

// ============================================================================
// DEFAULT BRANDING (used before API data loads)
// ============================================================================
const defaultBranding: BoardBranding = {
  logo: {
    main: '/assets/ktdadefault/ktdalogo-light.png',
    small: '/assets/ktdadefault/ktdalogo-light.png',
    sidebar: '/assets/ktdadefault/ktdalogo-light.png',
  },
  primaryColor: '#1B5E20',
  primaryHover: '#2E7D32',
  primaryLight: 'rgba(27, 94, 32, 0.08)',
  primaryContrast: '#ffffff',
  secondaryColor: '#FF6F00',
  secondaryHover: '#FF8F00',
  accentColor: '#0288D1',
  successColor: '#52c41a',
  successLight: 'rgba(82, 196, 26, 0.1)',
  warningColor: '#faad14',
  warningLight: 'rgba(250, 173, 20, 0.1)',
  errorColor: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.1)',
  infoColor: '#1890ff',
  infoLight: 'rgba(24, 144, 255, 0.1)',
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  backgroundQuaternary: '#f5f5f5',
  backgroundHover: '#f0f0f0',
  backgroundActive: '#e8e8e8',
  backgroundDisabled: '#fafafa',
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textTertiary: 'rgba(0, 0, 0, 0.45)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  textPlaceholder: 'rgba(0, 0, 0, 0.35)',
  textInverse: '#ffffff',
  borderColor: '#d9d9d9',
  borderColorHover: '#40a9ff',
  borderColorLight: '#f0f0f0',
  borderColorStrong: '#bfbfbf',
  borderColorFocus: '#1890ff',
  depthLevel1Bg: '#fafafa',
  depthLevel2Bg: '#f5f5f5',
  depthLevel3Bg: '#f0f0f0',
  surfaceElevated: '#ffffff',
  surfaceSunken: '#f5f5f5',
  surfaceOverlay: 'rgba(0, 0, 0, 0.45)',
  sidebarBg: '#1B5E20',
  sidebarTextColor: 'rgba(255, 255, 255, 0.85)',
  sidebarActiveColor: '#ffffff',
  sidebarActiveBg: 'rgba(255, 255, 255, 0.15)',
  linkColor: '#1B5E20',
  linkHover: '#FF6F00',
  linkActive: '#2E7D32',
  themeMode: 'light',
  inheritFromParent: false,
};

// Placeholder board used before API data loads
const placeholderBoard: Board = {
  id: 0,
  slug:'loading',
  name: 'Loading...',
  shortName: 'Loading',
  type: 'main',
  status: 'active',
  memberCount: 0,
  committeeCount: 0,
  compliance: 100,
  meetingsThisYear: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// View mode: 'single' = viewing one board, 'all' = viewing aggregated data across boards
export type BoardViewMode = 'single' | 'all';

interface BoardContextValue {
  // Current board
  currentBoard: Board;
  setCurrentBoard: (boardSlug: string) => void;
  
  // View mode - 'single' for one board, 'all' for aggregated view
  viewMode: BoardViewMode;
  setViewMode: (mode: BoardViewMode) => void;
  
  // Active committee filter (for filtering content on current page)
  // 'all' = show all, 'board' = board only, or committee board slug
  activeCommittee: string;
  setActiveCommittee: (committeeId: string) => void;
  
  // Child committees of current board
  committees: Board[];
  hasCommittees: boolean;
  
  // Theme/branding values
  theme: BoardBranding;
  
  // Ant Design theme config
  antdTheme: ThemeConfig;
  
  // Computed logo values
  logo: string;
  logoSidebar: string;
  logoSmall: string;
  
  // All boards user can access (filtered by user permissions)
  allBoards: Board[];
  
  // Does user have access to multiple boards?
  hasMultipleBoardAccess: boolean;

  // Whether current theme uses default branding assets
  isDefaultBranding: boolean;

  // Whether board-specific resources are currently loading
  isBoardLoading: boolean;

  // Route prefix helper - returns slug for single board view, 'all' for all boards view
  routePrefix: string;
}

const BoardContext = createContext<BoardContextValue | undefined>(undefined);

// Helper: prepend /assets/ to a logo path if it's a relative path
const resolveLogoPath = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  // Already absolute or data URI
  if (path.startsWith('/') || path.startsWith('http') || path.startsWith('data:')) return path;
  return `/assets/${path}`;
};

interface BoardProviderProps {
  children: React.ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, canAccessBoard, hasMultiBoardAccess, hasGlobalAccess, getDefaultBoard: getDefaultBoardSlug } = useAuth();
  
  const [currentBoard, setCurrentBoardState] = useState<Board>(placeholderBoard);
  const [viewMode, setViewModeState] = useState<BoardViewMode>('single');
  const [activeCommittee, setActiveCommitteeState] = useState<string>('all');
  
  // Cached data from API
  const [allBoardsList, setAllBoardsList] = useState<Board[]>([]);
  const [committees, setCommittees] = useState<Board[]>([]);
  const [branding, setBranding] = useState<BoardBranding>(defaultBranding);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  
  // Track if we've done initial board load
  const initialLoadDone = useRef(false);

  // Fetch all boards the user can access (backend already scopes by user)
  useEffect(() => {
    if (!user) return;
    
    const fetchBoards = async () => {
      try {
        const response = await boardsApi.getBoards();
        // Backend now returns paginated: { data: [...], total, page, pageSize, totalPages }
        const rawBoards = response.data || [];
        const boards: Board[] = rawBoards.map((b: any) => {
          // Build logo object from flat backend fields
          const logoMain = b.logoMain;
          const logoSmall = b.logoSmall;
          const boardLogo = (logoMain || logoSmall) ? {
            main: resolveLogoPath(logoMain) || '',
            small: resolveLogoPath(logoSmall),
          } : undefined;

          return {
            id: b.id,
            slug: b.slug,
            name: b.name,
            shortName: b.shortName,
            description: b.description,
            type: b.type || b.typeName?.toLowerCase() || 'main',
            parentId: b.parentId ?? undefined,
            parentName: b.parentName,
            status: (b.status || 'active').toString().toLowerCase(),
            zone: b.zone,
            memberCount: b.memberCount || 0,
            committeeCount: b.committeeCount || 0,
            compliance: b.compliance || 100,
            meetingsThisYear: b.meetingsThisYear || 0,
            lastMeetingDate: b.lastMeetingDate,
            nextMeetingDate: b.nextMeetingDate,
            branding: boardLogo ? { ...defaultBranding, logo: boardLogo } : undefined,
            createdAt: b.createdAt || new Date().toISOString(),
            updatedAt: b.updatedAt || new Date().toISOString(),
          };
        });
        setAllBoardsList(boards);
        
        // Set initial current board if not yet done
        if (!initialLoadDone.current && boards.length > 0) {
          initialLoadDone.current = true;
          const defaultSlug = getDefaultBoardSlug();
          const defaultBoard = defaultSlug 
            ? boards.find(b => b.slug === defaultSlug) 
            : boards[0];
          if (defaultBoard) {
            setCurrentBoardState(defaultBoard);
            // Fetch branding for the default board
            void loadBoardResources(defaultBoard);
          } else {
            setIsBoardLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch boards:', err);
        setIsBoardLoading(false);
      }
    };
    
    fetchBoards();
  }, [user, getDefaultBoardSlug]);

  // Helper: map flat backend branding to frontend BoardBranding shape
  const mapBrandingResponse = (raw: any): BoardBranding => {
    const logo = (raw.logoMain || raw.logoSmall) ? {
      main: resolveLogoPath(raw.logoMain) || '',
      small: resolveLogoPath(raw.logoSmall),
      dark: resolveLogoPath(raw.logoDark),
      light: resolveLogoPath(raw.logoLight),
    } : undefined;

    return {
      ...defaultBranding,
      logo,
      primaryColor: raw.primaryColor || defaultBranding.primaryColor,
      primaryHover: raw.primaryHover || defaultBranding.primaryHover,
      primaryLight: raw.primaryLight || defaultBranding.primaryLight,
      primaryContrast: raw.primaryContrast || defaultBranding.primaryContrast,
      secondaryColor: raw.secondaryColor || defaultBranding.secondaryColor,
      secondaryHover: raw.secondaryHover || defaultBranding.secondaryHover,
      accentColor: raw.accentColor || defaultBranding.accentColor,
      successColor: raw.successColor || defaultBranding.successColor,
      successLight: raw.successLight || defaultBranding.successLight,
      warningColor: raw.warningColor || defaultBranding.warningColor,
      warningLight: raw.warningLight || defaultBranding.warningLight,
      errorColor: raw.errorColor || defaultBranding.errorColor,
      errorLight: raw.errorLight || defaultBranding.errorLight,
      infoColor: raw.infoColor || defaultBranding.infoColor,
      infoLight: raw.infoLight || defaultBranding.infoLight,
      backgroundPrimary: raw.backgroundPrimary || defaultBranding.backgroundPrimary,
      backgroundSecondary: raw.backgroundSecondary || defaultBranding.backgroundSecondary,
      backgroundTertiary: raw.backgroundTertiary || defaultBranding.backgroundTertiary,
      backgroundQuaternary: raw.backgroundQuaternary || defaultBranding.backgroundQuaternary,
      backgroundHover: raw.backgroundHover || defaultBranding.backgroundHover,
      backgroundActive: raw.backgroundActive || defaultBranding.backgroundActive,
      backgroundDisabled: raw.backgroundDisabled || defaultBranding.backgroundDisabled,
      textPrimary: raw.textPrimary || defaultBranding.textPrimary,
      textSecondary: raw.textSecondary || defaultBranding.textSecondary,
      textTertiary: raw.textTertiary || defaultBranding.textTertiary,
      textDisabled: raw.textDisabled || defaultBranding.textDisabled,
      textPlaceholder: raw.textPlaceholder || defaultBranding.textPlaceholder,
      textInverse: raw.textInverse || defaultBranding.textInverse,
      borderColor: raw.borderColor || defaultBranding.borderColor,
      borderColorHover: raw.borderColorHover || defaultBranding.borderColorHover,
      borderColorLight: raw.borderColorLight || defaultBranding.borderColorLight,
      borderColorStrong: raw.borderColorStrong || defaultBranding.borderColorStrong,
      borderColorFocus: raw.borderColorFocus || defaultBranding.borderColorFocus,
      depthLevel1Bg: raw.depthLevel1Bg || defaultBranding.depthLevel1Bg,
      depthLevel2Bg: raw.depthLevel2Bg || defaultBranding.depthLevel2Bg,
      depthLevel3Bg: raw.depthLevel3Bg || defaultBranding.depthLevel3Bg,
      surfaceElevated: raw.surfaceElevated || defaultBranding.surfaceElevated,
      surfaceSunken: raw.surfaceSunken || defaultBranding.surfaceSunken,
      surfaceOverlay: raw.surfaceOverlay || defaultBranding.surfaceOverlay,
      sidebarBg: raw.sidebarBg || defaultBranding.sidebarBg,
      sidebarBgGradient: raw.sidebarBgGradient || defaultBranding.sidebarBgGradient,
      sidebarTextColor: raw.sidebarTextColor || defaultBranding.sidebarTextColor,
      sidebarActiveColor: raw.sidebarActiveColor || defaultBranding.sidebarActiveColor,
      sidebarActiveBg: raw.sidebarActiveBg || defaultBranding.sidebarActiveBg,
      linkColor: raw.linkColor || defaultBranding.linkColor,
      linkHover: raw.linkHover || defaultBranding.linkHover,
      linkActive: raw.linkActive || defaultBranding.linkActive,
    };
  };

  // Fetch branding for a board using its ID
  const fetchBranding = useCallback(async (board: Board) => {
    if (!board.id) {
      setBranding(defaultBranding);
      return;
    }
    try {
      const brandingData = await boardsApi.getBoardBranding(board.id);
      if (brandingData) {
        setBranding(mapBrandingResponse(brandingData));
        return;
      }
    } catch {
      // Branding not found — use defaults
    }
    setBranding(defaultBranding);
  }, []);

  // Fetch child boards (committees) for a board using its ID
  const fetchChildren = useCallback(async (board: Board) => {
    if (!board.id) {
      setCommittees([]);
      return;
    }
    try {
      const childrenResponse = await boardsApi.getBoardChildren(board.id);
      if (childrenResponse && Array.isArray(childrenResponse)) {
        const committeeOnly = childrenResponse.filter((c: any) => (c.type || '').toLowerCase() === 'committee');
        const childBoards: Board[] = committeeOnly.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          shortName: c.shortName,
          type: c.type || 'committee',
          status: (c.status || 'active').toString().toLowerCase(),
          memberCount: c.memberCount || 0,
          committeeCount: c.committeeCount || 0,
          compliance: 100,
          meetingsThisYear: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setCommittees(childBoards);
        return;
      }
    } catch {
      // No children found
    }
    setCommittees([]);
  }, []);

  const loadBoardResources = useCallback(async (board: Board | null) => {
    if (!board) {
      setBranding(defaultBranding);
      setCommittees([]);
      setIsBoardLoading(false);
      return;
    }
    
    setIsBoardLoading(true);
    try {
      await Promise.all([fetchBranding(board), fetchChildren(board)]);
    } finally {
      setIsBoardLoading(false);
    }
  }, [fetchBranding, fetchChildren]);

  // Sync activeCommittee with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const committee = params.get('committee') || 'all';
    setActiveCommitteeState(committee);
  }, [location.search]);

  // Sync currentBoard with URL board slug in path
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const urlBoardSlug = pathParts[1];
    
    // Handle "all" view
    if (urlBoardSlug === 'all') {
      if (viewMode !== 'all') {
        setViewModeState('all');
        setBranding(defaultBranding);
        setCommittees([]);
      }
      setIsBoardLoading(false);
      return;
    }
    
    // Handle specific board view
    if (urlBoardSlug && urlBoardSlug !== currentBoard.slug && allBoardsList.length > 0) {
      const board = allBoardsList.find(b => b.slug === urlBoardSlug);
      if (board && canAccessBoard(urlBoardSlug)) {
        setCurrentBoardState(board);
        setViewModeState('single');
        setIsBoardLoading(true);
        void loadBoardResources(board);
      }
    }
  }, [location.pathname, currentBoard.slug, canAccessBoard, allBoardsList, viewMode, loadBoardResources]);

  const setCurrentBoard = useCallback((boardSlug: string) => {
    if (!canAccessBoard(boardSlug)) {
      message.error('You do not have access to this board');
      return;
    }
    
    const board = allBoardsList.find(b => b.slug === boardSlug);
    if (board) {
      setCurrentBoardState(board);
      setViewModeState('single');
      setActiveCommitteeState('all');
      void loadBoardResources(board);
    }
  }, [canAccessBoard, allBoardsList, loadBoardResources]);

  const setViewMode = useCallback((mode: BoardViewMode) => {
    setViewModeState(mode);
    if (mode === 'all') {
      setActiveCommitteeState('all');
      void loadBoardResources(null);
    }
  }, [loadBoardResources]);

  const setActiveCommittee = useCallback((committeeId: string) => {
    const params = new URLSearchParams(location.search);
    
    if (committeeId === 'all') {
      params.delete('committee');
    } else {
      params.set('committee', committeeId);
    }
    
    const newSearch = params.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  // Theme: use board branding or default
  const theme: BoardBranding = useMemo(() => {
    if (viewMode === 'all') return defaultBranding;
    return branding;
  }, [branding, viewMode]);

  const isDefaultBranding = theme === defaultBranding;

  const hasCommittees = committees.length > 0;

  // Ant Design theme config
  const antdTheme: ThemeConfig = useMemo(() => ({
    token: {
      colorPrimary: theme.primaryColor,
      colorPrimaryHover: theme.primaryHover,
      colorPrimaryBg: theme.primaryLight,
      colorPrimaryBorder: theme.primaryColor,
      colorLink: theme.linkColor,
      colorLinkHover: theme.linkHover,
      colorLinkActive: theme.linkActive,
      colorSuccess: theme.successColor,
      colorSuccessBg: theme.successLight,
      colorWarning: theme.warningColor,
      colorWarningBg: theme.warningLight,
      colorError: theme.errorColor,
      colorErrorBg: theme.errorLight,
      colorInfo: theme.infoColor,
      colorInfoBg: theme.infoLight,
      colorText: theme.textPrimary,
      colorTextSecondary: theme.textSecondary,
      colorTextDisabled: theme.textDisabled,
      colorBgBase: theme.backgroundSecondary,
      colorBgContainer: theme.backgroundSecondary,
      colorBgElevated: theme.backgroundSecondary,
      colorBgLayout: theme.backgroundPrimary,
      colorBorder: theme.borderColor,
      colorBorderSecondary: theme.borderColor,
      borderRadius: 4,
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
        controlHeight: 36,
        fontSize: 14,
      },
      Select: { controlHeight: 36, fontSize: 14 },
      DatePicker: { controlHeight: 36, fontSize: 14 },
      InputNumber: { controlHeight: 36, fontSize: 14 },
      TimePicker: { controlHeight: 36, fontSize: 14 },
      Form: { labelFontSize: 13, labelFontWeight: 500, itemMarginBottom: 16 },
      Tabs: {
        inkBarColor: theme.primaryColor,
        itemActiveColor: theme.primaryColor,
        itemHoverColor: theme.primaryHover,
        itemSelectedColor: theme.primaryColor,
      },
      Table: { headerBg: theme.backgroundTertiary, rowHoverBg: theme.primaryLight },
      Card: { colorBorderSecondary: theme.borderColor },
      Tag: { defaultBg: theme.backgroundTertiary },
      Badge: { colorPrimary: theme.secondaryColor },
    },
  }), [theme]);

  const logo = theme.logo?.main || defaultBranding.logo?.main || '';
  const logoSidebar = theme.logo?.sidebar || theme.logo?.main || defaultBranding.logo?.main || '';
  const logoSmall = theme.logo?.small || theme.logo?.main || defaultBranding.logo?.small || '';

  const routePrefix = viewMode === 'all' ? 'all' : currentBoard.slug;

  const value: BoardContextValue = useMemo(() => ({
    currentBoard,
    setCurrentBoard,
    viewMode,
    setViewMode,
    activeCommittee,
    setActiveCommittee,
    committees: viewMode === 'all' ? [] : committees,
    hasCommittees: viewMode === 'all' ? false : hasCommittees,
    theme,
    antdTheme,
    logo,
    logoSidebar,
    logoSmall,
    allBoards: allBoardsList,
    hasMultipleBoardAccess: hasMultiBoardAccess || hasGlobalAccess,
    isDefaultBranding,
    isBoardLoading,
    routePrefix,
  }), [currentBoard, setCurrentBoard, viewMode, setViewMode, activeCommittee, setActiveCommittee, committees, hasCommittees, theme, antdTheme, logo, logoSidebar, logoSmall, allBoardsList, hasMultiBoardAccess, hasGlobalAccess, isDefaultBranding, isBoardLoading, routePrefix]);

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = (): BoardContextValue => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

// Alias for backward compatibility during migration
export const useOrgTheme = (): BoardContextValue & {
  currentOrg: Board;
  setCurrentOrg: (id: string) => void;
} => {
  const context = useBoardContext();
  return {
    ...context,
    currentOrg: context.currentBoard,
    setCurrentOrg: context.setCurrentBoard,
  };
};

export default BoardContext;
