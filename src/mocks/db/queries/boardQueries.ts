/**
 * Board Queries - Relationship helpers (like SQL queries)
 */

import { boardsTable, type BoardRow } from '../tables/boards';
import { boardSettingsTable } from '../tables/boardSettings';
import { userBoardRolesTable } from '../tables/userBoardRoles';
import { usersTable } from '../tables/users';
import { getRoleById } from '../tables/roles';
import { getBrandingForBoard, type BoardBrandingRow } from '../tables/boardBranding';
import type { Board, BoardListItem, BoardBranding } from '../../../types/board.types';

// ============================================================================
// BRANDING HELPER
// ============================================================================

/**
 * Convert BoardBrandingRow to full BoardBranding type
 * Adds semantic colors and other defaults
 */
const toBoardBranding = (row: BoardBrandingRow): BoardBranding => ({
  logo: {
    main: `/src/assets/${row.logoMain}`,
    small: row.logoSmall ? `/src/assets/${row.logoSmall}` : `/src/assets/${row.logoMain}`,
    dark: row.logoDark ? `/src/assets/${row.logoDark}` : undefined,
    light: row.logoLight ? `/src/assets/${row.logoLight}` : undefined,
  },
  primaryColor: row.primaryColor,
  primaryHover: row.primaryHover,
  primaryLight: row.primaryLight,
  primaryContrast: row.primaryContrast,
  secondaryColor: row.secondaryColor,
  secondaryHover: row.secondaryHover,
  accentColor: row.accentColor,
  // Semantic colors (same for all boards)
  successColor: '#52c41a',
  successLight: 'rgba(82, 196, 26, 0.1)',
  warningColor: '#faad14',
  warningLight: 'rgba(250, 173, 20, 0.1)',
  errorColor: '#ff4d4f',
  errorLight: 'rgba(255, 77, 79, 0.1)',
  infoColor: '#1890ff',
  infoLight: 'rgba(24, 144, 255, 0.1)',
  // Neutral colors (same for all boards)
  backgroundPrimary: '#f3f3f9',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafafa',
  borderColor: '#d9d9d9',
  borderColorHover: '#40a9ff',
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  // Sidebar
  sidebarBg: row.sidebarBg,
  sidebarBgGradient: row.sidebarBgGradient || undefined,
  sidebarTextColor: row.sidebarTextColor,
  sidebarActiveColor: row.sidebarActiveColor,
  sidebarActiveBg: row.sidebarActiveBg,
  // Links
  linkColor: row.primaryColor,
  linkHover: row.secondaryColor,
  linkActive: row.primaryHover,
  // Theme
  themeMode: 'light',
  inheritFromParent: false,
});

/**
 * Get full branding for a board
 */
export const getBranding = (boardId: string): BoardBranding => {
  const brandingRow = getBrandingForBoard(boardId);
  return toBoardBranding(brandingRow);
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all boards (flat list)
 */
export const getAllBoards = (): BoardRow[] => {
  return [...boardsTable];
};

/**
 * Get board by ID
 */
export const getBoardById = (id: string): BoardRow | undefined => {
  return boardsTable.find(b => b.id === id);
};

/**
 * Get boards by type
 */
export const getBoardsByType = (type: BoardRow['type']): BoardRow[] => {
  return boardsTable.filter(b => b.type === type);
};

/**
 * Get boards by parent ID (children of a board)
 */
export const getBoardsByParentId = (parentId: string): BoardRow[] => {
  return boardsTable.filter(b => b.parentId === parentId);
};

/**
 * Get committees for a board
 */
export const getCommitteesForBoard = (boardId: string): BoardRow[] => {
  return boardsTable.filter(b => b.parentId === boardId && b.type === 'committee');
};

/**
 * Get subsidiaries
 */
export const getSubsidiaries = (): BoardRow[] => {
  return boardsTable.filter(b => b.type === 'subsidiary');
};

/**
 * Get factories by zone
 */
export const getFactoriesByZone = (zone: string): BoardRow[] => {
  return boardsTable.filter(b => b.type === 'factory' && b.zone === zone);
};

/**
 * Get main board
 */
export const getMainBoard = (): BoardRow | undefined => {
  return boardsTable.find(b => b.type === 'main');
};

/**
 * Convert BoardRow to full Board object (with settings and branding)
 */
export const toBoardObject = (row: BoardRow): Board => {
  const settings = boardSettingsTable.find(s => s.boardId === row.id);
  const parent = row.parentId ? getBoardById(row.parentId) : undefined;
  
  return {
    id: row.id,
    name: row.name,
    shortName: row.shortName,
    description: row.description,
    type: row.type,
    parentId: row.parentId || undefined,
    parentName: parent?.name,
    status: row.status,
    zone: row.zone,
    memberCount: row.memberCount,
    committeeCount: row.committeeCount,
    branding: getBranding(row.id),
    settings: settings ? {
      quorumPercentage: settings.quorumPercentage,
      meetingFrequency: settings.meetingFrequency,
      votingThreshold: settings.votingThreshold,
      confirmationRequired: settings.confirmationRequired,
      designatedApproverRole: settings.designatedApproverRole || undefined,
      minMeetingsPerYear: settings.minMeetingsPerYear,
      allowVirtualMeetings: settings.allowVirtualMeetings,
      requireAttendanceTracking: settings.requireAttendanceTracking,
    } : undefined,
    compliance: row.compliance,
    meetingsThisYear: row.meetingsThisYear,
    lastMeetingDate: row.lastMeetingDate || undefined,
    nextMeetingDate: row.nextMeetingDate || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

/**
 * Convert BoardRow to BoardListItem (for index pages)
 */
export const toBoardListItem = (row: BoardRow): BoardListItem => {
  const parent = row.parentId ? getBoardById(row.parentId) : undefined;
  
  return {
    id: row.id,
    name: row.name,
    shortName: row.shortName,
    type: row.type,
    parentId: row.parentId || undefined,
    parentName: parent?.name,
    status: row.status,
    zone: row.zone,
    memberCount: row.memberCount,
    committeeCount: row.committeeCount,
    compliance: row.compliance,
    lastMeetingDate: row.lastMeetingDate || undefined,
  };
};

/**
 * Filter boards with pagination
 */
export interface BoardFilterOptions {
  search?: string;
  type?: BoardRow['type'];
  status?: BoardRow['status'];
  zone?: string;
  boardId?: string;
  parentId?: string;
  page?: number;
  pageSize?: number;
}

export const filterBoards = (options: BoardFilterOptions) => {
  let filtered = [...boardsTable];
  
  // Search filter
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(searchLower) ||
      b.shortName.toLowerCase().includes(searchLower)
    );
  }
  
  // Status filter
  if (options.status) {
    filtered = filtered.filter(b => b.status === options.status);
  }
  
  // Zone filter
  if (options.zone) {
    filtered = filtered.filter(b => b.zone === options.zone);
  }
  
  // Board ID + Parent ID filter (for showing board + its children)
  // When both are provided, show the board itself + its committees
  // Type filter is NOT applied in this case to preserve the main board
  if (options.boardId && options.parentId) {
    // Show the board itself OR its committees (not subsidiaries/factories)
    filtered = filtered.filter(b =>
      b.id === options.boardId || 
      (b.parentId === options.parentId && b.type === 'committee')
    );
    // Skip type filter - we want to show main board + committees
  } else if (options.boardId) {
    filtered = filtered.filter(b => b.id === options.boardId);
    // Apply type filter only if not in combined view
    if (options.type) {
      filtered = filtered.filter(b => b.type === options.type);
    }
  } else if (options.parentId) {
    filtered = filtered.filter(b => b.parentId === options.parentId);
    // Apply type filter only if not in combined view
    if (options.type) {
      filtered = filtered.filter(b => b.type === options.type);
    }
  } else {
    // No boardId/parentId - apply type filter normally
    if (options.type) {
      filtered = filtered.filter(b => b.type === options.type);
    }
  }
  
  // Pagination
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  
  return {
    data: paginated.map(toBoardListItem),
    total,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * Get board members (users) for a board
 */
export const getBoardMembers = (boardId: string) => {
  const memberships = userBoardRolesTable.filter(
    ubr => ubr.boardId === boardId && ubr.endDate === null
  );
  
  return memberships.map(membership => {
    const user = usersTable.find(u => u.id === membership.userId);
    if (!user) return null;
    
    const role = getRoleById(membership.roleId);
    
    return {
      id: membership.id,
      odooUserId: user.id,
      odooUserName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: role?.code || 'unknown',
      roleName: role?.name || 'Unknown',
      roleId: membership.roleId,
      startDate: membership.startDate,
      endDate: membership.endDate,
      isActive: membership.endDate === null,
      isPrimary: membership.isPrimary,
      hasCertificate: user.hasCertificate,
      certificateExpiry: user.certificateExpiry,
    };
  }).filter(Boolean);
};

/**
 * Get board tree structure
 */
export const getBoardTree = () => {
  const mainBoard = getMainBoard();
  if (!mainBoard) return [];
  
  const committees = getCommitteesForBoard(mainBoard.id);
  const subsidiaries = getSubsidiaries();
  const zones = ['zone_1', 'zone_2', 'zone_3'];
  
  return [{
    id: mainBoard.id,
    name: mainBoard.name,
    shortName: mainBoard.shortName,
    type: mainBoard.type,
    status: mainBoard.status,
    memberCount: mainBoard.memberCount,
    compliance: mainBoard.compliance,
    children: [
      // Committees
      ...committees.map(c => ({
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        type: c.type,
        status: c.status,
        memberCount: c.memberCount,
        compliance: c.compliance,
      })),
      // Subsidiaries
      ...subsidiaries.map(s => ({
        id: s.id,
        name: s.name,
        shortName: s.shortName,
        type: s.type,
        status: s.status,
        memberCount: s.memberCount,
        compliance: s.compliance,
      })),
      // Factory zones
      ...zones.map(zone => {
        const factories = getFactoriesByZone(zone);
        return {
          id: zone,
          name: `${zone.replace('_', ' ').toUpperCase()} Factories`,
          shortName: zone.replace('_', ' ').toUpperCase(),
          type: 'factory' as const,
          status: 'active' as const,
          memberCount: factories.reduce((sum, f) => sum + f.memberCount, 0),
          compliance: Math.round(factories.reduce((sum, f) => sum + f.compliance, 0) / factories.length),
          zone,
          children: factories.map(f => ({
            id: f.id,
            name: f.name,
            shortName: f.shortName,
            type: f.type,
            status: f.status,
            memberCount: f.memberCount,
            compliance: f.compliance,
            zone: f.zone,
          })),
        };
      }),
    ],
  }];
};
