/**
 * Types Index
 * Re-export all types for easy importing
 */

// API types
export * from './api.types';

// Auth types
export * from './auth.types';

// User types
export * from './user.types';

// Role types
export * from './role.types';

// Board types — exclude BoardRole/BoardRoleSchema (already exported from role.types)
export {
  // Schemas
  BoardTypeSchema,
  BoardStatusSchema,
  MeetingFrequencySchema,
  VotingThresholdSchema,
  ZoneSchema,
  BoardContactInfoSchema,
  BoardSettingsSchema,
  BoardLogoSchema,
  BoardBrandingSchema,
  CommitteeSchema,
  BoardSchema,
  BoardListItemSchema,
  BoardTreeNodeSchema,
  BoardMembershipSchema,
  BoardMemberSchema,
  CreateBoardPayloadSchema,
  UpdateBoardPayloadSchema,
  CreateCommitteePayloadSchema,
  AddBoardMemberPayloadSchema,
  UpdateBoardMembershipPayloadSchema,
  BoardFilterParamsSchema,
  BoardMemberFilterParamsSchema,
  BoardListResponseSchema,
  BoardMemberListResponseSchema,
  // Types
  type BoardType,
  type BoardStatus,
  type MeetingFrequency,
  type VotingThreshold,
  type Zone,
  type BoardContactInfo,
  type BoardSettings,
  type BoardLogo,
  type BoardBranding,
  type Committee,
  type Board,
  type BoardListItem,
  type BoardTreeNode,
  type BoardMembership,
  type BoardMember,
  type CreateBoardPayload,
  type UpdateBoardPayload,
  type CreateCommitteePayload,
  type AddBoardMemberPayload,
  type UpdateBoardMembershipPayload,
  type BoardFilterParams,
  type BoardMemberFilterParams,
  // Constants
  BOARD_TYPE_LABELS,
  BOARD_TYPE_COLORS,
  BOARD_ROLE_LABELS,
} from './board.types';

// Document types
export * from './document.types';

// Voting types
export * from './voting.types';
