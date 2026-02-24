/**
 * Lookup Types
 * TypeScript types for backend lookup tables
 * All lookups are database-driven and fetched from /api/lookups/* endpoints
 */

import { z } from 'zod';

// ============================================================================
// BASE LOOKUP SCHEMA
// ============================================================================

export const BaseLookupSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type BaseLookup = z.infer<typeof BaseLookupSchema>;

// ============================================================================
// BOARD TYPE LOOKUP
// ============================================================================

export const BoardTypeLookupSchema = BaseLookupSchema.extend({
  icon: z.string().nullable().optional(),
});

export type BoardTypeLookup = z.infer<typeof BoardTypeLookupSchema>;

// ============================================================================
// BOARD ZONE LOOKUP
// ============================================================================

export const BoardZoneLookupSchema = BaseLookupSchema;

export type BoardZoneLookup = z.infer<typeof BoardZoneLookupSchema>;

// ============================================================================
// MEETING TYPE LOOKUP
// ============================================================================

export const MeetingTypeLookupSchema = BaseLookupSchema.extend({
  defaultDuration: z.number().nullable().optional(),
  requiresNotice: z.boolean().optional(),
  noticeMinimumDays: z.number().nullable().optional(),
});

export type MeetingTypeLookup = z.infer<typeof MeetingTypeLookupSchema>;

// ============================================================================
// MEETING FREQUENCY LOOKUP
// ============================================================================

export const MeetingFrequencyLookupSchema = BaseLookupSchema;

export type MeetingFrequencyLookup = z.infer<typeof MeetingFrequencyLookupSchema>;

// ============================================================================
// VOTING THRESHOLD LOOKUP
// ============================================================================

export const VotingThresholdLookupSchema = BaseLookupSchema.extend({
  percentage: z.number(),
});

export type VotingThresholdLookup = z.infer<typeof VotingThresholdLookupSchema>;

// ============================================================================
// DOCUMENT CATEGORY LOOKUP
// ============================================================================

export const DocumentCategoryLookupSchema = BaseLookupSchema.extend({
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isSystem: z.boolean().optional(),
});

export type DocumentCategoryLookup = z.infer<typeof DocumentCategoryLookupSchema>;

// ============================================================================
// AGENDA ITEM TYPE LOOKUP
// ============================================================================

export const AgendaItemTypeLookupSchema = BaseLookupSchema;

export type AgendaItemTypeLookup = z.infer<typeof AgendaItemTypeLookupSchema>;

// ============================================================================
// RESOLUTION CATEGORY LOOKUP
// ============================================================================

export const ResolutionCategoryLookupSchema = BaseLookupSchema;

export type ResolutionCategoryLookup = z.infer<typeof ResolutionCategoryLookupSchema>;

// ============================================================================
// ROLE LOOKUP
// ============================================================================

export const RoleLookupSchema = BaseLookupSchema.extend({
  isSystem: z.boolean(),
  scope: z.string(), // 'global' or 'board'
});

export type RoleLookup = z.infer<typeof RoleLookupSchema>;

// ============================================================================
// PERMISSION LOOKUP
// ============================================================================

export const PermissionLookupSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
});

export const PermissionGroupSchema = z.object({
  category: z.string(),
  permissions: z.array(PermissionLookupSchema),
});

export type PermissionLookup = z.infer<typeof PermissionLookupSchema>;
export type PermissionGroup = z.infer<typeof PermissionGroupSchema>;

// ============================================================================
// LOOKUP RESPONSE SCHEMAS
// ============================================================================

// Note: axios interceptor unwraps ApiResponse automatically, so we receive arrays directly
export const BoardTypesResponseSchema = z.array(BoardTypeLookupSchema);

export const BoardZonesResponseSchema = z.array(BoardZoneLookupSchema);

export const MeetingTypesResponseSchema = z.array(MeetingTypeLookupSchema);

export const MeetingFrequenciesResponseSchema = z.array(MeetingFrequencyLookupSchema);

export const VotingThresholdsResponseSchema = z.array(VotingThresholdLookupSchema);

export const DocumentCategoriesResponseSchema = z.array(DocumentCategoryLookupSchema);

export const AgendaItemTypesResponseSchema = z.array(AgendaItemTypeLookupSchema);

export const ResolutionCategoriesResponseSchema = z.array(ResolutionCategoryLookupSchema);

export const RolesResponseSchema = z.array(RoleLookupSchema);

export const PermissionsResponseSchema = z.array(PermissionGroupSchema);

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type BoardTypesResponse = z.infer<typeof BoardTypesResponseSchema>;
export type BoardZonesResponse = z.infer<typeof BoardZonesResponseSchema>;
export type MeetingTypesResponse = z.infer<typeof MeetingTypesResponseSchema>;
export type MeetingFrequenciesResponse = z.infer<typeof MeetingFrequenciesResponseSchema>;
export type VotingThresholdsResponse = z.infer<typeof VotingThresholdsResponseSchema>;
export type DocumentCategoriesResponse = z.infer<typeof DocumentCategoriesResponseSchema>;
export type AgendaItemTypesResponse = z.infer<typeof AgendaItemTypesResponseSchema>;
export type ResolutionCategoriesResponse = z.infer<typeof ResolutionCategoriesResponseSchema>;
export type RolesResponse = z.infer<typeof RolesResponseSchema>;
export type PermissionsResponse = z.infer<typeof PermissionsResponseSchema>;

// ============================================================================
// AGGREGATED LOOKUPS TYPE (for context)
// ============================================================================

export interface AllLookups {
  boardTypes: BoardTypeLookup[];
  boardZones: BoardZoneLookup[];
  meetingTypes: MeetingTypeLookup[];
  meetingFrequencies: MeetingFrequencyLookup[];
  votingThresholds: VotingThresholdLookup[];
  documentCategories: DocumentCategoryLookup[];
  agendaItemTypes: AgendaItemTypeLookup[];
  resolutionCategories: ResolutionCategoryLookup[];
  roles: RoleLookup[];
  permissionGroups: PermissionGroup[];
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type LookupCode = string;
export type LookupId = number;

export interface LookupOption {
  value: string; // code
  label: string; // name
  id: number;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  metadata?: Record<string, any>;
}
