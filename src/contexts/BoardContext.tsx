/**
 * Board Context
 * Provides current board, theme, and committee filtering throughout the app
 * Integrates with AuthContext for user-filtered board access
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ThemeConfig } from 'antd';
import { message } from 'antd';
import type { Board, BoardBranding } from '../types/board.types';
import { 
  getBoardById as getBoardRowById, 
  getCommitteesForBoard,
  toBoardObject,
  getBranding,
  getMainBoard,
  getAllBoards,
} from '../mocks/db/queries/boardQueries';
import { useAuth } from './AuthContext';

// Helper functions
const getBoardById = (id: string) => {
  const row = getBoardRowById(id);
  return row ? toBoardObject(row) : undefined;
};
const getCommitteesByBoard = (boardId: string) => {
  return getCommitteesForBoard(boardId).map(toBoardObject);
};

// Default branding - get from db for ktda-ms
const defaultBranding: BoardBranding = getBranding('ktda-ms');

// Get default board (KTDA MS or first main board)
const getDefaultBoard = (): Board => {
  const mainBoardRow = getMainBoard();
  if (mainBoardRow) return toBoardObject(mainBoardRow);
  // Fallback - should not happen in normal operation
  return {
    id: 'ktda-ms',
    name: 'KTDA Management Services',
    shortName: 'KTDA MS',
    type: 'main',
    status: 'active',
    memberCount: 0,
    committeeCount: 0,
    compliance: 100,
    meetingsThisYear: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// View mode: 'single' = viewing one board, 'all' = viewing aggregated data across boards
export type BoardViewMode = 'single' | 'all';

interface BoardContextValue {
  // Current board
  currentBoard: Board;
  setCurrentBoard: (boardId: string) => void;
  
  // View mode - 'single' for one board, 'all' for aggregated view
  viewMode: BoardViewMode;
  setViewMode: (mode: BoardViewMode) => void;
  
  // Active committee filter (for filtering content on current page)
  // 'all' = show all, 'board' = board only, or committee board id
  activeCommittee: string;
  setActiveCommittee: (committeeId: string) => void;
  
  // Child committees of current board (boards with type='committee' and parentId=currentBoard.id)
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
}

const BoardContext = createContext<BoardContextValue | undefined>(undefined);

interface BoardProviderProps {
  children: React.ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getUserBoards, getPrimaryBoard, canAccessBoard, hasMultiBoardAccess, hasGlobalAccess } = useAuth();
  
  const [currentBoard, setCurrentBoardState] = useState<Board>(getDefaultBoard());
  const [viewMode, setViewModeState] = useState<BoardViewMode>('single');
  const [activeCommittee, setActiveCommitteeState] = useState<string>('all');

  // Get boards user can access
  const userBoards = useMemo(() => {
    if (!user) return [getDefaultBoard()];
    if (hasGlobalAccess) {
      // Global access users see all boards (excluding committees for main list)
      return getAllBoards()
        .filter((b: { type: string }) => b.type !== 'committee')
        .map(toBoardObject);
    }
    return getUserBoards();
  }, [user, getUserBoards, hasGlobalAccess]);

  // Initialize current board based on user's primary board
  useEffect(() => {
    if (user) {
      const primaryBoard = getPrimaryBoard();
      if (primaryBoard) {
        setCurrentBoardState(primaryBoard);
      }
    }
  }, [user, getPrimaryBoard]);

  // Sync activeCommittee with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const committee = params.get('committee') || 'all';
    setActiveCommitteeState(committee);
  }, [location.search]);

  // Sync currentBoard with URL boardId parameter
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const urlBoardId = pathParts[1];
    
    if (urlBoardId && urlBoardId !== currentBoard.id) {
      const board = getBoardById(urlBoardId);
      if (board && canAccessBoard(urlBoardId)) {
        setCurrentBoardState(board);
        setViewModeState('single');
      }
    }
  }, [location.pathname, currentBoard.id, canAccessBoard]);

  const setCurrentBoard = useCallback((boardId: string) => {
    // Validate user can access this board
    if (!canAccessBoard(boardId)) {
      message.error('You do not have access to this board');
      return;
    }
    
    const board = getBoardById(boardId);
    if (board) {
      setCurrentBoardState(board);
      setViewModeState('single');
      // Reset committee filter when changing boards
      setActiveCommitteeState('all');
    }
  }, [canAccessBoard]);

  const setViewMode = useCallback((mode: BoardViewMode) => {
    setViewModeState(mode);
    if (mode === 'all') {
      // Reset committee filter in 'all' mode
      setActiveCommitteeState('all');
    }
  }, []);

  // Helper function to change committee filter and update URL
  const setActiveCommittee = useCallback((committeeId: string) => {
    const params = new URLSearchParams(location.search);
    
    if (committeeId === 'all') {
      params.delete('committee'); // Remove param for default 'all'
    } else {
      params.set('committee', committeeId);
    }
    
    const newSearch = params.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  // Get theme from current board's branding or use default
  const theme: BoardBranding = useMemo(() => {
    return currentBoard.branding || defaultBranding;
  }, [currentBoard]);

  // Get committees for current board (boards with type='committee' and parentId=currentBoard.id)
  const committees = useMemo(() => {
    if (viewMode === 'all') {
      return []; // No committee filter in 'all' mode
    }
    return getCommitteesByBoard(currentBoard.id);
  }, [currentBoard.id, viewMode]);

  const hasCommittees = committees.length > 0;

  // Compute Ant Design theme config based on current board's branding
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
      Select: {
        controlHeight: 36,
        fontSize: 14,
      },
      DatePicker: {
        controlHeight: 36,
        fontSize: 14,
      },
      InputNumber: {
        controlHeight: 36,
        fontSize: 14,
      },
      TimePicker: {
        controlHeight: 36,
        fontSize: 14,
      },
      Form: {
        labelFontSize: 13,
        labelFontWeight: 500,
        itemMarginBottom: 16,
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
  const logo = theme.logo?.main || defaultBranding.logo?.main || '';
  const logoSidebar = theme.logo?.sidebar || theme.logo?.main || defaultBranding.logo?.main || '';
  const logoSmall = theme.logo?.small || theme.logo?.main || defaultBranding.logo?.small || '';

  const value: BoardContextValue = useMemo(() => ({
    currentBoard,
    setCurrentBoard,
    viewMode,
    setViewMode,
    activeCommittee,
    setActiveCommittee,
    committees,
    hasCommittees,
    theme,
    antdTheme,
    logo,
    logoSidebar,
    logoSmall,
    allBoards: userBoards,
    hasMultipleBoardAccess: hasMultiBoardAccess || hasGlobalAccess,
  }), [currentBoard, setCurrentBoard, viewMode, setViewMode, activeCommittee, setActiveCommittee, committees, hasCommittees, theme, antdTheme, logo, logoSidebar, logoSmall, userBoards, hasMultiBoardAccess, hasGlobalAccess]);

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
    // Aliases for backward compatibility
    currentOrg: context.currentBoard,
    setCurrentOrg: context.setCurrentBoard,
  };
};

export default BoardContext;
