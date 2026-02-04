/**
 * Minutes Types - Meeting minutes management
 * Zod schemas and TypeScript types for minutes, comments, and signatures
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & STATUS
// ============================================================================

export const MinutesStatusSchema = z.enum([
  'draft',              // Being written by Secretary
  'pending_review',     // Submitted, awaiting Chairman approval
  'revision_requested', // Returned to Secretary for corrections
  'approved',           // Chairman approved, locked
  'published',          // Distributed to participants
]);

export type MinutesStatus = z.infer<typeof MinutesStatusSchema>;

// ============================================================================
// MINUTES SCHEMA
// ============================================================================

export const MinutesSchema = z.object({
  id: z.string(),
  meetingId: z.string(),

  // Content
  content: z.string(),                    // Rich HTML content
  contentPlainText: z.string(),           // Plain text for search

  // Template used (optional)
  templateId: z.string().nullable().optional(),

  // Status
  status: MinutesStatusSchema,

  // Workflow tracking - Creation
  createdBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Workflow tracking - Submission
  submittedAt: z.string().nullable().optional(),
  submittedBy: z.number().nullable().optional(),

  // Workflow tracking - Approval
  approvedAt: z.string().nullable().optional(),
  approvedBy: z.number().nullable().optional(),
  approvalNotes: z.string().nullable().optional(),

  // Workflow tracking - Revision
  revisionRequestedAt: z.string().nullable().optional(),
  revisionRequestedBy: z.number().nullable().optional(),
  revisionReason: z.string().nullable().optional(),

  // Workflow tracking - Publishing
  publishedAt: z.string().nullable().optional(),
  publishedBy: z.number().nullable().optional(),

  // Version tracking
  version: z.number(),

  // Generated assets
  pdfUrl: z.string().nullable().optional(),

  // Settings
  allowComments: z.boolean().default(true),
  reviewDeadline: z.string().nullable().optional(),

  // Metadata
  wordCount: z.number().optional(),
  estimatedReadTime: z.number().optional(), // minutes
});

export type Minutes = z.infer<typeof MinutesSchema>;

// ============================================================================
// MINUTES COMMENT SCHEMA
// ============================================================================

export const MinutesCommentSchema = z.object({
  id: z.string(),
  minutesId: z.string(),

  // Comment content
  comment: z.string(),
  commentType: z.enum(['general', 'section', 'highlight']).default('general'),

  // Reference to content
  sectionReference: z.string().nullable().optional(),
  highlightedText: z.string().nullable().optional(),
  textPosition: z.object({
    start: z.number(),
    end: z.number(),
  }).nullable().optional(),

  // Author
  createdBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),

  // Status
  resolved: z.boolean().default(false),
  resolvedAt: z.string().nullable().optional(),
  resolvedBy: z.number().nullable().optional(),

  // Threading (for replies)
  parentCommentId: z.string().nullable().optional(),

  // Secretary response
  secretaryResponse: z.string().nullable().optional(),
  respondedAt: z.string().nullable().optional(),
  respondedBy: z.number().nullable().optional(),
});

export type MinutesComment = z.infer<typeof MinutesCommentSchema>;

// ============================================================================
// MINUTES SIGNATURE SCHEMA
// ============================================================================

export const MinutesSignatureSchema = z.object({
  id: z.string(),
  minutesId: z.string(),

  // Signer
  signedBy: z.number(),
  signerRole: z.string(),
  signerName: z.string(),

  // Digital signature
  signatureHash: z.string(),
  signatureMethod: z.enum(['digital', 'biometric', 'pin']).default('digital'),
  certificateId: z.string().nullable().optional(),

  // Verification
  verified: z.boolean().default(true),
  verificationDate: z.string().nullable().optional(),

  signedAt: z.string(),

  // Optional: Image/data
  signatureData: z.string().nullable().optional(),
});

export type MinutesSignature = z.infer<typeof MinutesSignatureSchema>;

// ============================================================================
// API PAYLOADS
// ============================================================================

// Create Minutes
export const CreateMinutesPayloadSchema = z.object({
  meetingId: z.string(),
  templateId: z.string().optional(),
  content: z.string().optional().default(''),
  allowComments: z.boolean().optional().default(true),
});

export type CreateMinutesPayload = z.infer<typeof CreateMinutesPayloadSchema>;

// Update Minutes
export const UpdateMinutesPayloadSchema = z.object({
  content: z.string(),
  contentPlainText: z.string().optional(),
  wordCount: z.number().optional(),
});

export type UpdateMinutesPayload = z.infer<typeof UpdateMinutesPayloadSchema>;

// Submit for Review
export const SubmitForReviewPayloadSchema = z.object({
  notifyMembers: z.boolean().optional().default(true),
  reviewDeadline: z.string().optional(),
});

export type SubmitForReviewPayload = z.infer<typeof SubmitForReviewPayloadSchema>;

// Approve Minutes
export const ApproveMinutesPayloadSchema = z.object({
  approvalNotes: z.string().optional(),
});

export type ApproveMinutesPayload = z.infer<typeof ApproveMinutesPayloadSchema>;

// Request Revision
export const RequestRevisionPayloadSchema = z.object({
  revisionReason: z.string(),
  specificSections: z.array(z.string()).optional(),
  revisionDeadline: z.string().optional(),
});

export type RequestRevisionPayload = z.infer<typeof RequestRevisionPayloadSchema>;

// Publish Minutes
export const PublishMinutesPayloadSchema = z.object({
  generatePdf: z.boolean().optional().default(true),
  includeDigitalSignature: z.boolean().optional().default(false),
  distributionList: z.array(z.number()).optional(), // userIds
  emailNotification: z.boolean().optional().default(true),
});

export type PublishMinutesPayload = z.infer<typeof PublishMinutesPayloadSchema>;

// Add Comment
export const AddCommentPayloadSchema = z.object({
  comment: z.string(),
  commentType: z.enum(['general', 'section', 'highlight']).optional().default('general'),
  sectionReference: z.string().optional(),
  highlightedText: z.string().optional(),
  textPosition: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
  parentCommentId: z.string().optional(),
});

export type AddCommentPayload = z.infer<typeof AddCommentPayloadSchema>;

// Resolve Comment
export const ResolveCommentPayloadSchema = z.object({
  secretaryResponse: z.string().optional(),
});

export type ResolveCommentPayload = z.infer<typeof ResolveCommentPayloadSchema>;

// Add Signature
export const AddSignaturePayloadSchema = z.object({
  signatureHash: z.string(),
  signatureMethod: z.enum(['digital', 'biometric', 'pin']).optional().default('digital'),
  signatureData: z.string().optional(),
});

export type AddSignaturePayload = z.infer<typeof AddSignaturePayloadSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const MINUTES_STATUS_LABELS: Record<MinutesStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  published: 'Published',
};

export const MINUTES_STATUS_COLORS: Record<MinutesStatus, string> = {
  draft: 'default',
  pending_review: 'processing',
  revision_requested: 'warning',
  approved: 'success',
  published: 'cyan',
};

export const MINUTES_STATUS_ICONS: Record<MinutesStatus, string> = {
  draft: 'EditOutlined',
  pending_review: 'ClockCircleOutlined',
  revision_requested: 'ExclamationCircleOutlined',
  approved: 'CheckCircleOutlined',
  published: 'SendOutlined',
};
