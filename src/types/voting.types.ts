/**
 * Voting Types
 * Zod schemas and TypeScript types for voting and polling
 * Multi-table architecture with polymorphic entity support
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const VoteStatusSchema = z.enum([
  'draft',        // Initial creation
  'configured',   // Configuration set
  'open',         // Voting in progress
  'closed',       // Voting ended
  'archived',     // Archived
]);

export const VoteOutcomeSchema = z.enum([
  'passed',   // Motion passed
  'failed',   // Motion failed
  'invalid',  // Quorum not met
]);

export const VotingMethodSchema = z.enum([
  'yes_no',           // Simple yes/no
  'yes_no_abstain',   // Yes/No/Abstain (default)
  'multiple_choice',  // Custom options
  'ranked',           // Ranked choice (future)
]);

export const VoteEntityTypeSchema = z.enum([
  'agenda_item',   // Vote on agenda item
  'minutes',       // Approve minutes
  'action_item',   // Vote on action item
  'resolution',    // Vote on resolution
]);

export const PassingRuleSchema = z.enum([
  'simple_majority',   // >50%
  'two_thirds',        // ≥66.67%
  'three_quarters',    // ≥75%
  'unanimous',         // 100%
]);

export const VoteActionTypeSchema = z.enum([
  'created',            // Vote created
  'configured',         // Configuration set
  'opened',             // Voting opened
  'vote_cast',          // Individual vote cast
  'vote_changed',       // Vote changed (if allowed)
  'closed',             // Voting closed
  'results_generated',  // Results calculated
  'reopened',           // Voting reopened
  'archived',           // Archived
]);

// ============================================================================
// CORE SCHEMAS
// ============================================================================

/**
 * Vote - Voting Instance (Lean)
 */
export const VoteSchema = z.object({
  id: z.string(),

  // Polymorphic entity relationship
  entityType: VoteEntityTypeSchema,
  entityId: z.string(),

  // Context (denormalized for performance)
  meetingId: z.string(),
  boardId: z.string(),

  // Basic info
  title: z.string(),
  description: z.string().optional(),

  // Status
  status: VoteStatusSchema,
  outcome: VoteOutcomeSchema.optional(),

  // Timestamps
  createdBy: z.number(),
  createdByName: z.string(),
  createdAt: z.string(),
  openedAt: z.string().optional(),
  closedAt: z.string().optional(),
});

/**
 * Vote Configuration - Rules Snapshot (Immutable after opening)
 */
export const VoteConfigurationSchema = z.object({
  id: z.string(),
  voteId: z.string(),

  // Voting method
  votingMethod: VotingMethodSchema,

  // Quorum rules
  quorumRequired: z.boolean(),
  quorumPercentage: z.number().min(0).max(100),

  // Passing threshold
  passThresholdPercentage: z.number().min(0).max(100),
  passingRule: PassingRuleSchema,

  // Ballot settings
  anonymous: z.boolean(),
  allowAbstain: z.boolean(),
  allowChangeVote: z.boolean(),

  // Time constraints
  timeLimit: z.number().optional(), // minutes
  autoCloseWhenAllVoted: z.boolean(),

  // Timestamp (never updated after creation)
  createdAt: z.string(),
});

/**
 * Vote Option - Choice in vote
 */
export const VoteOptionSchema = z.object({
  id: z.string(),
  voteId: z.string(),
  label: z.string(),
  description: z.string().optional(),
  displayOrder: z.number(),
});

/**
 * Vote Eligibility - Who can vote
 */
export const VoteEligibilitySchema = z.object({
  id: z.string(),
  voteId: z.string(),
  userId: z.number(),
  userName: z.string(),
  userRole: z.string(),
  weight: z.number().default(1.0), // For weighted voting
  eligible: z.boolean().default(true),
});

/**
 * Vote Cast - Recorded vote (Append-only)
 */
export const VoteCastSchema = z.object({
  id: z.string(),
  voteId: z.string(),
  optionId: z.string(),
  userId: z.number().nullable(), // null if anonymous
  userName: z.string().optional(),
  weightApplied: z.number(),
  castAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

/**
 * Vote Action - Audit event
 */
export const VoteActionSchema = z.object({
  id: z.string(),
  voteId: z.string(),
  actionType: VoteActionTypeSchema,
  performedBy: z.number(),
  performedByName: z.string(),
  metadata: z.record(z.any()).optional(), // JSON metadata
  createdAt: z.string(),
});

/**
 * Vote Result - Computed results (Derived from votes_cast)
 */
export const VoteResultSchema = z.object({
  voteId: z.string(),
  optionId: z.string(),
  optionLabel: z.string(),
  totalWeight: z.number(),
  voteCount: z.number(),
  percentage: z.number(),
  isWinner: z.boolean().default(false),
});

/**
 * Vote Results Summary
 */
export const VoteResultsSummarySchema = z.object({
  totalEligible: z.number(),
  totalVoted: z.number(),
  totalWeight: z.number(),
  quorumRequired: z.number(),
  quorumMet: z.boolean(),
  thresholdPercentage: z.number(),
  outcome: VoteOutcomeSchema,
  results: z.array(VoteResultSchema),
  computedAt: z.string(),
});

// ============================================================================
// COMPOSITE SCHEMAS (API Responses)
// ============================================================================

/**
 * Vote with Configuration and Options
 */
export const VoteFullSchema = VoteSchema.extend({
  configuration: VoteConfigurationSchema.optional(),
  options: z.array(VoteOptionSchema),
  eligibility: z.array(VoteEligibilitySchema),
});

/**
 * Vote with Results
 */
export const VoteWithResultsSchema = VoteSchema.extend({
  configuration: VoteConfigurationSchema.optional(),
  options: z.array(VoteOptionSchema),
  resultsSummary: VoteResultsSummarySchema.optional(),
});

/**
 * Vote Detail (Complete view)
 */
export const VoteDetailSchema = VoteSchema.extend({
  configuration: VoteConfigurationSchema.optional(),
  options: z.array(VoteOptionSchema),
  eligibility: z.array(VoteEligibilitySchema),
  votes: z.array(VoteCastSchema).optional(), // Only if open ballot
  resultsSummary: VoteResultsSummarySchema.optional(),
  actions: z.array(VoteActionSchema),
});

// ============================================================================
// API PAYLOADS
// ============================================================================

/**
 * Create Vote Payload
 */
export const CreateVotePayloadSchema = z.object({
  entityType: VoteEntityTypeSchema,
  entityId: z.string(),
  meetingId: z.string(),
  boardId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

/**
 * Configure Vote Payload
 */
export const ConfigureVotePayloadSchema = z.object({
  votingMethod: VotingMethodSchema,
  quorumRequired: z.boolean(),
  quorumPercentage: z.number().min(0).max(100),
  passThresholdPercentage: z.number().min(0).max(100),
  passingRule: PassingRuleSchema,
  anonymous: z.boolean(),
  allowAbstain: z.boolean(),
  allowChangeVote: z.boolean(),
  timeLimit: z.number().optional(),
  autoCloseWhenAllVoted: z.boolean(),
  customOptions: z.array(z.string()).optional(), // For multiple_choice
});

/**
 * Open Vote Payload
 */
export const OpenVotePayloadSchema = z.object({
  // Empty for now, may add validation data later
});

/**
 * Cast Vote Payload
 */
export const CastVotePayloadSchema = z.object({
  optionId: z.string(),
});

/**
 * Close Vote Payload
 */
export const CloseVotePayloadSchema = z.object({
  force: z.boolean().default(false), // Force close even if not all voted
});

/**
 * Reopen Vote Payload
 */
export const ReopenVotePayloadSchema = z.object({
  reason: z.string().min(1, 'Reason is required for audit'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type VoteStatus = z.infer<typeof VoteStatusSchema>;
export type VoteOutcome = z.infer<typeof VoteOutcomeSchema>;
export type VotingMethod = z.infer<typeof VotingMethodSchema>;
export type VoteEntityType = z.infer<typeof VoteEntityTypeSchema>;
export type PassingRule = z.infer<typeof PassingRuleSchema>;
export type VoteActionType = z.infer<typeof VoteActionTypeSchema>;

export type Vote = z.infer<typeof VoteSchema>;
export type VoteConfiguration = z.infer<typeof VoteConfigurationSchema>;
export type VoteOption = z.infer<typeof VoteOptionSchema>;
export type VoteEligibility = z.infer<typeof VoteEligibilitySchema>;
export type VoteCast = z.infer<typeof VoteCastSchema>;
export type VoteAction = z.infer<typeof VoteActionSchema>;
export type VoteResult = z.infer<typeof VoteResultSchema>;
export type VoteResultsSummary = z.infer<typeof VoteResultsSummarySchema>;

export type VoteFull = z.infer<typeof VoteFullSchema>;
export type VoteWithResults = z.infer<typeof VoteWithResultsSchema>;
export type VoteDetail = z.infer<typeof VoteDetailSchema>;

export type CreateVotePayload = z.infer<typeof CreateVotePayloadSchema>;
export type ConfigureVotePayload = z.infer<typeof ConfigureVotePayloadSchema>;
export type OpenVotePayload = z.infer<typeof OpenVotePayloadSchema>;
export type CastVotePayload = z.infer<typeof CastVotePayloadSchema>;
export type CloseVotePayload = z.infer<typeof CloseVotePayloadSchema>;
export type ReopenVotePayload = z.infer<typeof ReopenVotePayloadSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const VOTE_STATUS_LABELS: Record<VoteStatus, string> = {
  draft: 'Draft',
  configured: 'Configured',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
};

export const VOTE_STATUS_COLORS: Record<VoteStatus, string> = {
  draft: 'default',
  configured: 'blue',
  open: 'processing',
  closed: 'success',
  archived: 'default',
};

export const VOTE_OUTCOME_LABELS: Record<VoteOutcome, string> = {
  passed: 'Passed',
  failed: 'Failed',
  invalid: 'Invalid - Quorum Not Met',
};

export const VOTE_OUTCOME_COLORS: Record<VoteOutcome, string> = {
  passed: 'success',
  failed: 'error',
  invalid: 'warning',
};

export const VOTING_METHOD_LABELS: Record<VotingMethod, string> = {
  yes_no: 'Yes / No',
  yes_no_abstain: 'Yes / No / Abstain',
  multiple_choice: 'Multiple Choice',
  ranked: 'Ranked Choice',
};

export const PASSING_RULE_LABELS: Record<PassingRule, string> = {
  simple_majority: 'Simple Majority (>50%)',
  two_thirds: 'Two-Thirds (≥66.67%)',
  three_quarters: 'Three-Quarters (≥75%)',
  unanimous: 'Unanimous (100%)',
};

export const PASSING_RULE_THRESHOLDS: Record<PassingRule, number> = {
  simple_majority: 50,
  two_thirds: 66.67,
  three_quarters: 75,
  unanimous: 100,
};

export const VOTE_ENTITY_TYPE_LABELS: Record<VoteEntityType, string> = {
  agenda_item: 'Agenda Item',
  minutes: 'Minutes',
  action_item: 'Action Item',
  resolution: 'Resolution',
};

export const VOTE_ACTION_TYPE_LABELS: Record<VoteActionType, string> = {
  created: 'Created',
  configured: 'Configured',
  opened: 'Opened',
  vote_cast: 'Vote Cast',
  vote_changed: 'Vote Changed',
  closed: 'Closed',
  results_generated: 'Results Generated',
  reopened: 'Reopened',
  archived: 'Archived',
};

export const VOTE_ACTION_TYPE_COLORS: Record<VoteActionType, string> = {
  created: 'default',
  configured: 'blue',
  opened: 'cyan',
  vote_cast: 'purple',
  vote_changed: 'orange',
  closed: 'green',
  results_generated: 'geekblue',
  reopened: 'warning',
  archived: 'default',
};
