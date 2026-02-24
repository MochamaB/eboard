/**
 * Board Types
 * Based on docs/MODULES/Module02_BoardManagement/02_OVERVIEW.md
 * Comprehensive types for board management including hierarchy, settings, and memberships
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

// Board types - Dynamic lookup from backend (use useLookups context)
// Values: 'main', 'subsidiary', 'factory', 'committee'
export const BoardTypeSchema = z.string();

// Board status - System state enum (not a lookup)
export const BoardStatusSchema = z.enum(['active', 'inactive']);

// Meeting frequency - Dynamic lookup from backend (use useLookups context)
// Values: 'monthly', 'bi_monthly', 'quarterly', 'semi_annual', 'annual', 'as_needed'
export const MeetingFrequencySchema = z.string();

// Voting threshold - Dynamic lookup from backend (use useLookups context)
// Values: 'simple_majority', 'two_thirds', 'three_quarters', 'unanimous'
export const VotingThresholdSchema = z.string();

// Board roles (per-board assignment) - validated as strings from backend
export const BoardRoleSchema = z.string();

// Board zones - Dynamic lookup from backend (use useLookups context)
// Values: 'zone_1' through 'zone_12'
export const ZoneSchema = z.string().nullable().optional();

// ============================================================================
// BOARD CONTACT INFO
// ============================================================================

export const BoardContactInfoSchema = z.object({
  address: z.string().nullable().optional(),
  poBox: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  phoneAlt: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().nullable().optional(),
});

// ============================================================================
// BOARD SETTINGS
// ============================================================================

export const BoardSettingsSchema = z.object({
  quorumPercentage: z.number().min(0).max(100).default(50),
  meetingFrequency: MeetingFrequencySchema.default('quarterly'),
  votingThreshold: VotingThresholdSchema.default('simple_majority'),
  confirmationRequired: z.boolean().default(true),
  designatedApprover: z.string().optional(), // User ID of approver
  designatedApproverRole: z.string().optional(), // e.g., 'company_secretary', 'chairman'
  // Backend returns these fields
  approverRoleId: z.number().nullable().optional(),
  approverRoleCode: z.string().nullable().optional(),
  approverRoleName: z.string().nullable().optional(),
  minMeetingsPerYear: z.number().default(4),
  allowVirtualMeetings: z.boolean().default(true),
  requireAttendanceTracking: z.boolean().default(true),
  allowSecretarySkipAgenda: z.boolean().default(false),
  allowSecretarySkipDocuments: z.boolean().default(false),
  requireApprovalForOverrides: z.boolean().default(true),
});

// ============================================================================
// BOARD BRANDING
// ============================================================================

export const BoardLogoSchema = z.object({
  main: z.string(),
  dark: z.string().optional(),
  light: z.string().optional(),
  small: z.string().optional(),
  sidebar: z.string().optional(),
});

export const BoardBrandingSchema = z.object({
  // Logo configuration
  logo: BoardLogoSchema.optional(),
  
  // Primary Brand Colors
  primaryColor: z.string().default('#324721'),
  primaryHover: z.string().default('#283a1a'),
  primaryLight: z.string().default('rgba(50, 71, 33, 0.1)'),
  primaryContrast: z.string().default('#ffffff'),
  
  // Secondary/Accent Colors
  secondaryColor: z.string().default('#ffaf00'),
  secondaryHover: z.string().default('#e69d00'),
  accentColor: z.string().default('#ffaf00'),
  
  // Semantic Colors
  successColor: z.string().default('#52c41a'),
  successLight: z.string().default('rgba(82, 196, 26, 0.1)'),
  warningColor: z.string().default('#faad14'),
  warningLight: z.string().default('rgba(250, 173, 20, 0.1)'),
  errorColor: z.string().default('#ff4d4f'),
  errorLight: z.string().default('rgba(255, 77, 79, 0.1)'),
  infoColor: z.string().default('#1890ff'),
  infoLight: z.string().default('rgba(24, 144, 255, 0.1)'),
  
  // Neutral Colors - Backgrounds
  backgroundPrimary: z.string().default('#f3f3f9'),
  backgroundSecondary: z.string().default('#ffffff'),
  backgroundTertiary: z.string().default('#fafafa'),
  backgroundQuaternary: z.string().default('#f5f5f5'),
  backgroundHover: z.string().default('#f0f0f0'),
  backgroundActive: z.string().default('#e8e8e8'),
  backgroundDisabled: z.string().default('#fafafa'),
  
  // Neutral Colors - Text
  textPrimary: z.string().default('rgba(0, 0, 0, 0.85)'),
  textSecondary: z.string().default('rgba(0, 0, 0, 0.65)'),
  textTertiary: z.string().default('rgba(0, 0, 0, 0.45)'),
  textDisabled: z.string().default('rgba(0, 0, 0, 0.25)'),
  textPlaceholder: z.string().default('rgba(0, 0, 0, 0.35)'),
  textInverse: z.string().default('#ffffff'),
  
  // Neutral Colors - Borders
  borderColor: z.string().default('#d9d9d9'),
  borderColorHover: z.string().default('#40a9ff'),
  borderColorLight: z.string().default('#f0f0f0'),
  borderColorStrong: z.string().default('#bfbfbf'),
  borderColorFocus: z.string().default('#1890ff'),
  
  // Depth-Specific Colors (for nested items)
  depthLevel1Bg: z.string().default('#fafafa'),
  depthLevel2Bg: z.string().default('#f5f5f5'),
  depthLevel3Bg: z.string().default('#f0f0f0'),
  
  // Surface Colors (for elevated elements)
  surfaceElevated: z.string().default('#ffffff'),
  surfaceSunken: z.string().default('#f5f5f5'),
  surfaceOverlay: z.string().default('rgba(0, 0, 0, 0.45)'),
  
  // Sidebar Specific
  sidebarBg: z.string().default('#324721'),
  sidebarBgGradient: z.string().optional(),
  sidebarTextColor: z.string().default('#929492'),
  sidebarActiveColor: z.string().default('#ffaf00'),
  sidebarActiveBg: z.string().default('rgba(255, 175, 0, 0.15)'),
  
  // Link Colors
  linkColor: z.string().default('#324721'),
  linkHover: z.string().default('#ffaf00'),
  linkActive: z.string().default('#283a1a'),
  
  // Theme mode and inheritance
  themeMode: z.enum(['light', 'dark']).default('light'),
  inheritFromParent: z.boolean().default(false),
});

// ============================================================================
// COMMITTEE
// ============================================================================

export const CommitteeSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortName: z.string(),
  description: z.string().optional(),
  parentBoardId: z.number(),
  parentBoardName: z.string().optional(),
  status: BoardStatusSchema.default('active'),
  memberCount: z.number().default(0),
  settings: BoardSettingsSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// BOARD (MAIN ENTITY)
// ============================================================================

export const BoardSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string(),
  description: z.string().nullable().optional(),
  type: BoardTypeSchema,
  parentId: z.number().nullable().optional(), // For subsidiaries → main, factories → subsidiary
  parentName: z.string().nullable().optional(),
  status: BoardStatusSchema.default('active'),
  zone: ZoneSchema, // For factory boards
  
  // Counts
  memberCount: z.number().default(0),
  committeeCount: z.number().default(0),
  
  // Contact information
  contactInfo: BoardContactInfoSchema.optional(),
  
  // Nested data
  committees: z.array(CommitteeSchema).optional(),
  settings: BoardSettingsSchema.optional(),
  branding: BoardBrandingSchema.optional(),
  
  // Compliance
  compliance: z.number().min(0).max(100).default(100), // Meeting compliance %
  meetingsThisYear: z.number().default(0),
  lastMeetingDate: z.string().nullable().optional(),
  nextMeetingDate: z.string().nullable().optional(),
  
  // Timestamps
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

// Board list item (for index page - lighter version)
export const BoardListItemSchema = z.object({
  id: z.number(),
  slug: z.string().optional(),
  name: z.string(),
  shortName: z.string(),
  type: BoardTypeSchema,
  parentId: z.number().nullable().optional(),
  parentName: z.string().nullable().optional(),
  status: BoardStatusSchema,
  zone: ZoneSchema,
  memberCount: z.number(),
  committeeCount: z.number(),
  compliance: z.number(),
  lastMeetingDate: z.string().nullable().optional(),
  nextMeetingDate: z.string().nullable().optional(),
  meetingsThisYear: z.number().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  logoMain: z.string().nullable().optional(),
  logoSmall: z.string().nullable().optional(),
});

// ============================================================================
// BOARD HIERARCHY / TREE
// ============================================================================

export const BoardTreeNodeSchema: z.ZodType<BoardTreeNode> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    shortName: z.string(),
    type: BoardTypeSchema,
    status: z.string().transform(val => val.toLowerCase() as 'active' | 'inactive'),
    memberCount: z.number(),
    compliance: z.number(),
    zone: z.string().nullable().optional(),
    children: z.array(BoardTreeNodeSchema).optional(),
  })
);

export interface BoardTreeNode {
  id: number;
  name: string;
  shortName: string;
  type: string; // Board type lookup code
  status: 'active' | 'inactive';
  memberCount: number;
  compliance: number;
  zone?: string | null;
  children?: BoardTreeNode[];
}

// ============================================================================
// BOARD MEMBERSHIP
// ============================================================================

export const BoardMembershipSchema = z.object({
  id: z.number(),
  userId: z.number().optional(),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  userAvatar: z.string().optional(),
  boardId: z.number(),
  boardName: z.string(),
  boardType: BoardTypeSchema,
  role: BoardRoleSchema,
  roleName: z.string().optional(), // Human-readable role name (e.g., "Company Secretary")
  roleId: z.number().optional(), // FK to roles table
  startDate: z.string(),
  endDate: z.string().nullable(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().optional(), // Whether this is the user's default board
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Board member (for board detail page - user with their role on that board)
export const BoardMemberSchema = z.object({
  id: z.number(),
  membershipId: z.number().optional(),
  userId: z.number(),
  fullName: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  // Backend returns roleCode, map it to role
  roleCode: z.string().optional(),
  role: z.string().optional(),
  roleName: z.string().optional(),
  roleId: z.number().optional(),
  startDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? val : val.toISOString()).optional(),
  endDate: z.union([z.string(), z.date()]).transform(val => val === null ? null : typeof val === 'string' ? val : val.toISOString()).nullable().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  userStatus: z.string().optional(),
  // Additional user info
  phone: z.string().nullable().optional(),
  title: z.string().nullable().optional(), // Job title
  otherBoardsCount: z.number().optional(), // How many other boards they're on
}).transform(data => ({
  ...data,
  // Map roleCode to role if role is missing
  role: data.role || data.roleCode || 'board_member',
}));

// ============================================================================
// API PAYLOADS
// ============================================================================

// Create board payload (matches backend CreateBoardRequest)
export const CreateBoardPayloadSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  description: z.string().optional(),
  boardTypeId: z.number(),
  parentId: z.number().optional(),
  zoneId: z.number().optional(),
  // Contact fields (flat structure)
  contactAddress: z.string().optional(),
  contactPoBox: z.string().optional(),
  contactCity: z.string().optional(),
  contactCountry: z.string().optional(),
  contactPhone: z.string().optional(),
  contactPhoneAlt: z.string().optional(),
  contactEmail: z.string().optional(),
  contactWebsite: z.string().optional(),
  // Settings fields (flat structure)
  quorumPercentage: z.number().optional(),
  meetingFrequencyId: z.number().optional(),
  votingThresholdId: z.number().optional(),
  confirmationRequired: z.boolean().optional(),
  approverRoleId: z.number().optional(),
  minMeetingsPerYear: z.number().optional(),
  allowVirtualMeetings: z.boolean().optional(),
  requireAttendanceTracking: z.boolean().optional(),
});

// Update board payload (matches backend UpdateBoardRequest - NO settings, NO status)
export const UpdateBoardPayloadSchema = z.object({
  name: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  boardTypeId: z.number().optional(),
  parentId: z.number().optional(),
  zoneId: z.number().optional(),
  // Contact fields only
  contactAddress: z.string().optional(),
  contactPoBox: z.string().optional(),
  contactCity: z.string().optional(),
  contactCountry: z.string().optional(),
  contactPhone: z.string().optional(),
  contactPhoneAlt: z.string().optional(),
  contactEmail: z.string().optional(),
  contactWebsite: z.string().optional(),
});

// Create committee payload
export const CreateCommitteePayloadSchema = z.object({
  name: z.string().min(1, 'Committee name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  description: z.string().optional(),
  parentBoardId: z.number(),
  settings: BoardSettingsSchema.optional(),
});

// Add member to board payload (matches backend AddBoardMemberRequest)
export const AddBoardMemberPayloadSchema = z.object({
  userId: z.number(),
  roleId: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// Update membership payload
export const UpdateBoardMembershipPayloadSchema = z.object({
  role: BoardRoleSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// FILTER PARAMETERS
// ============================================================================

export const BoardFilterParamsSchema = z.object({
  search: z.string().optional(),
  type: BoardTypeSchema.optional(),
  types: z.array(BoardTypeSchema).optional(), // Multiple types
  status: BoardStatusSchema.optional(),
  zone: ZoneSchema.optional(),
  boardId: z.number().optional(), // Filter by specific board ID
  parentId: z.number().optional(),
  hasCommittees: z.boolean().optional(),
  complianceMin: z.number().optional(),
  complianceMax: z.number().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const BoardMemberFilterParamsSchema = z.object({
  boardId: z.number(),
  search: z.string().optional(),
  role: BoardRoleSchema.optional(),
  isActive: z.boolean().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

// ============================================================================
// API RESPONSES
// ============================================================================

export const BoardListResponseSchema = z.object({
  data: z.array(BoardListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const BoardMemberListResponseSchema = z.object({
  data: z.array(BoardMemberSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BoardType = z.infer<typeof BoardTypeSchema>;
export type BoardStatus = z.infer<typeof BoardStatusSchema>;
export type MeetingFrequency = z.infer<typeof MeetingFrequencySchema>;
export type VotingThreshold = z.infer<typeof VotingThresholdSchema>;
export type BoardRole = string;
export type Zone = z.infer<typeof ZoneSchema>;

export type BoardContactInfo = z.infer<typeof BoardContactInfoSchema>;
export type BoardSettings = z.infer<typeof BoardSettingsSchema>;
export type BoardLogo = z.infer<typeof BoardLogoSchema>;
export type BoardBranding = z.infer<typeof BoardBrandingSchema>;
export type Committee = z.infer<typeof CommitteeSchema>;
export type Board = z.infer<typeof BoardSchema>;
export type BoardListItem = z.infer<typeof BoardListItemSchema>;
export type BoardMembership = z.infer<typeof BoardMembershipSchema>;
export type BoardMember = z.infer<typeof BoardMemberSchema>;

export type CreateBoardPayload = z.infer<typeof CreateBoardPayloadSchema>;
export type UpdateBoardPayload = z.infer<typeof UpdateBoardPayloadSchema>;
export type CreateCommitteePayload = z.infer<typeof CreateCommitteePayloadSchema>;
export type AddBoardMemberPayload = z.infer<typeof AddBoardMemberPayloadSchema>;
export type UpdateBoardMembershipPayload = z.infer<typeof UpdateBoardMembershipPayloadSchema>;

export type BoardFilterParams = z.infer<typeof BoardFilterParamsSchema>;
export type BoardMemberFilterParams = z.infer<typeof BoardMemberFilterParamsSchema>;
export type BoardListResponse = z.infer<typeof BoardListResponseSchema>;
export type BoardMemberListResponse = z.infer<typeof BoardMemberListResponseSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * @deprecated Use useLookups().boardTypeOptions instead for dynamic lookup data
 * This constant is kept for backward compatibility during migration
 */
export const BOARD_TYPE_LABELS: Record<string, string> = {
  main: 'Main Board',
  subsidiary: 'Subsidiary',
  factory: 'Factory',
  committee: 'Committee',
};

/**
 * @deprecated Use theme colors or lookup metadata instead
 * This constant is kept for backward compatibility during migration
 */
export const BOARD_TYPE_COLORS: Record<string, string> = {
  main: '#1B5E20',      // Dark green
  subsidiary: '#2196F3', // Blue
  factory: '#FF9800',    // Orange
  committee: '#9C27B0',  // Purple
};

export const BOARD_ROLE_LABELS: Record<BoardRole, string> = {
  chairman: 'Chairman',
  vice_chairman: 'Vice Chairman',
  group_company_secretary: 'Group Company Secretary',
  company_secretary: 'Company Secretary',
  board_secretary: 'Board Secretary',
  board_member: 'Board Member',
  independent_director: 'Independent Director',
  executive_member: 'Executive Member',
  committee_chairman: 'Committee Chairman',
  committee_member: 'Committee Member',
  committee_secretary: 'Committee Secretary',
  observer: 'Observer',
};

/**
 * @deprecated Use useLookups().boardZoneOptions instead for dynamic lookup data
 * This constant is kept for backward compatibility during migration
 */
export const ZONE_LABELS: Record<string, string> = {
  zone_1: 'Zone 1',
  zone_2: 'Zone 2',
  zone_3: 'Zone 3',
  zone_4: 'Zone 4',
  zone_5: 'Zone 5',
  zone_6: 'Zone 6',
  zone_7: 'Zone 7',
  'Zone 1': 'Zone 1',
  'Zone 2': 'Zone 2',
  'Zone 3': 'Zone 3',
  'Zone 4': 'Zone 4',
  'Zone 5': 'Zone 5',
  'Zone 6': 'Zone 6',
  'Zone 7': 'Zone 7',
  'Zone 8': 'Zone 8',
  'Zone 9': 'Zone 9',
  'Zone 10': 'Zone 10',
  'Zone 11': 'Zone 11',
  'Zone 12': 'Zone 12',
};

// Default settings by board type
export const DEFAULT_BOARD_SETTINGS: Record<string, Partial<BoardSettings>> = {
  main: {
    quorumPercentage: 50,
    meetingFrequency: 'quarterly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    minMeetingsPerYear: 4,
  },
  subsidiary: {
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    minMeetingsPerYear: 12,
  },
  factory: {
    quorumPercentage: 60,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: false,
    minMeetingsPerYear: 12,
  },
  committee: {
    quorumPercentage: 60,
    meetingFrequency: 'quarterly',
    votingThreshold: 'simple_majority',
    confirmationRequired: false,
    minMeetingsPerYear: 4,
  },
};
