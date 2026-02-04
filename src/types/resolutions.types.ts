/**
 * Resolutions Types - Formal board decisions and resolutions
 * Zod schemas and TypeScript types for resolutions
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & STATUS
// ============================================================================

export const ResolutionDecisionSchema = z.enum([
  'approved',   // Resolution approved
  'rejected',   // Resolution rejected
  'tabled',     // Discussion postponed
  'withdrawn',  // Resolution withdrawn
  'consensus',  // Approved by consensus (no formal vote)
]);

export type ResolutionDecision = z.infer<typeof ResolutionDecisionSchema>;

export const ResolutionCategorySchema = z.enum([
  'policy',       // Policy decisions
  'financial',    // Financial approvals
  'operational',  // Operational matters
  'strategic',    // Strategic initiatives
  'governance',   // Governance matters
  'other',        // Other resolutions
]);

export type ResolutionCategory = z.infer<typeof ResolutionCategorySchema>;

// ============================================================================
// RESOLUTION SCHEMA
// ============================================================================

export const ResolutionSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  boardId: z.string(),

  // Resolution details
  resolutionNumber: z.string(),           // "RES-2026-001"
  title: z.string(),
  text: z.string(),                       // Full resolution text
  category: ResolutionCategorySchema,

  // Decision
  decision: ResolutionDecisionSchema,
  decisionDate: z.string(),               // ISO date

  // Voting (optional - some resolutions are by consensus)
  voteId: z.string().nullable().optional(),
  voteSummary: z.string().nullable().optional(), // "14 Yes, 2 No, 1 Abstain"

  // Related entities
  agendaItemId: z.string().nullable().optional(),
  relatedDocumentIds: z.array(z.string()).optional().default([]),

  // Follow-up
  requiresFollowUp: z.boolean().default(false),
  followUpDeadline: z.string().nullable().optional(),
  followUpNotes: z.string().nullable().optional(),

  // Implementation tracking
  implementationStatus: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional().default('pending'),
  implementedAt: z.string().nullable().optional(),

  // Metadata
  createdBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Resolution = z.infer<typeof ResolutionSchema>;

// ============================================================================
// API PAYLOADS
// ============================================================================

// Create Resolution
export const CreateResolutionPayloadSchema = z.object({
  meetingId: z.string(),
  boardId: z.string(),

  resolutionNumber: z.string(),
  title: z.string(),
  text: z.string(),
  category: ResolutionCategorySchema.optional().default('other'),

  decision: ResolutionDecisionSchema,
  decisionDate: z.string(),

  voteId: z.string().optional(),
  voteSummary: z.string().optional(),

  agendaItemId: z.string().optional(),
  relatedDocumentIds: z.array(z.string()).optional(),

  requiresFollowUp: z.boolean().optional().default(false),
  followUpDeadline: z.string().optional(),
  followUpNotes: z.string().optional(),
});

export type CreateResolutionPayload = z.infer<typeof CreateResolutionPayloadSchema>;

// Update Resolution
export const UpdateResolutionPayloadSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  category: ResolutionCategorySchema.optional(),
  decision: ResolutionDecisionSchema.optional(),
  voteSummary: z.string().optional(),
  relatedDocumentIds: z.array(z.string()).optional(),
  requiresFollowUp: z.boolean().optional(),
  followUpDeadline: z.string().optional(),
  followUpNotes: z.string().optional(),
});

export type UpdateResolutionPayload = z.infer<typeof UpdateResolutionPayloadSchema>;

// Update Implementation Status
export const UpdateImplementationStatusPayloadSchema = z.object({
  implementationStatus: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  implementedAt: z.string().optional(),
});

export type UpdateImplementationStatusPayload = z.infer<typeof UpdateImplementationStatusPayloadSchema>;

// ============================================================================
// FILTER & QUERY SCHEMAS
// ============================================================================

export const ResolutionFiltersSchema = z.object({
  meetingId: z.string().optional(),
  boardId: z.string().optional(),
  decision: ResolutionDecisionSchema.optional(),
  category: ResolutionCategorySchema.optional(),
  requiresFollowUp: z.boolean().optional(),
  implementationStatus: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type ResolutionFilters = z.infer<typeof ResolutionFiltersSchema>;

// ============================================================================
// STATISTICS
// ============================================================================

export interface ResolutionsStats {
  total: number;
  approved: number;
  rejected: number;
  tabled: number;
  withdrawn: number;
  consensus: number;
  pending: number;
  overdue: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const RESOLUTION_DECISION_LABELS: Record<ResolutionDecision, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  tabled: 'Tabled',
  withdrawn: 'Withdrawn',
  consensus: 'Consensus',
};

export const RESOLUTION_DECISION_COLORS: Record<ResolutionDecision, string> = {
  approved: 'success',
  rejected: 'error',
  tabled: 'warning',
  withdrawn: 'default',
  consensus: 'cyan',
};

export const RESOLUTION_DECISION_ICONS: Record<ResolutionDecision, string> = {
  approved: 'CheckCircleOutlined',
  rejected: 'CloseCircleOutlined',
  tabled: 'PauseCircleOutlined',
  withdrawn: 'MinusCircleOutlined',
  consensus: 'TeamOutlined',
};

export const RESOLUTION_CATEGORY_LABELS: Record<ResolutionCategory, string> = {
  policy: 'Policy',
  financial: 'Financial',
  operational: 'Operational',
  strategic: 'Strategic',
  governance: 'Governance',
  other: 'Other',
};

export const RESOLUTION_CATEGORY_COLORS: Record<ResolutionCategory, string> = {
  policy: 'blue',
  financial: 'green',
  operational: 'orange',
  strategic: 'purple',
  governance: 'gold',
  other: 'default',
};

export const RESOLUTION_CATEGORY_ICONS: Record<ResolutionCategory, string> = {
  policy: 'FileProtectOutlined',
  financial: 'DollarOutlined',
  operational: 'SettingOutlined',
  strategic: 'RocketOutlined',
  governance: 'SafetyOutlined',
  other: 'FileTextOutlined',
};

export const IMPLEMENTATION_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const IMPLEMENTATION_STATUS_COLORS = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
};

// Helper: Generate resolution number
export const generateResolutionNumber = (boardId: string, year: number, sequence: number): string => {
  const boardPrefix = boardId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  return `RES-${boardPrefix}-${year}-${String(sequence).padStart(3, '0')}`;
};

// Helper: Check if resolution needs follow-up
export const needsFollowUp = (resolution: Resolution): boolean => {
  return resolution.requiresFollowUp && 
         resolution.decision === 'approved' && 
         resolution.implementationStatus !== 'completed';
};
