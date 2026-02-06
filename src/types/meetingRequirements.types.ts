/**
 * Meeting Requirements and Validation Types
 * Defines the validation requirements hierarchy and validation results
 */

import { z } from 'zod';
import type { MeetingStatus, MeetingSubStatus } from './meeting.types';

// ============================================================================
// MEETING REQUIREMENTS
// ============================================================================

export const MeetingRequirementsSchema = z.object({
  // Participant requirements
  minParticipants: z.number().min(0),
  requireChairman: z.boolean(),
  requireSecretary: z.boolean(),
  requireQuorum: z.boolean(),
  quorumPercentage: z.number().min(0).max(100).optional(),

  // Agenda requirements
  minAgendaItems: z.number().min(0),
  agendaRequired: z.boolean(),

  // Document requirements
  documentsRequired: z.boolean(),
  requiredDocumentTypes: z.array(z.string()).optional(),
  minDocuments: z.number().min(0).optional(),

  // Approval requirements
  requiresApproval: z.boolean(),
  approverRoles: z.array(z.string()).optional(),

  // Overridable flags (for meeting-level exceptions)
  allowAgendaOverride: z.boolean().default(false),
  allowDocumentOverride: z.boolean().default(false),
  allowApprovalOverride: z.boolean().default(false),
});

export type MeetingRequirements = z.infer<typeof MeetingRequirementsSchema>;

// ============================================================================
// MEETING OVERRIDES
// ============================================================================

export const MeetingOverridesSchema = z.object({
  skipAgenda: z.boolean().optional(),
  skipDocuments: z.boolean().optional(),
  skipApproval: z.boolean().optional(),
  customMinParticipants: z.number().min(0).optional(),
  customQuorumPercentage: z.number().min(0).max(100).optional(),
});

export type MeetingOverrides = z.infer<typeof MeetingOverridesSchema>;

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: ValidationSeverity;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  canTransitionToDraftComplete: boolean;
  canSubmitForApproval: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

// ============================================================================
// VALIDATION CONTEXT
// ============================================================================

export interface ValidationContext {
  meeting: {
    id: string;
    boardId: string;
    meetingType: string;
    status: MeetingStatus;
    subStatus: MeetingSubStatus;
    participantCount: number;
    expectedAttendees: number;
    quorumPercentage: number;
    quorumRequired: number;
    agendaItemCount?: number;
    documentCount?: number;
    hasChairman?: boolean;
    hasSecretary?: boolean;
    overrides?: MeetingOverrides;
  };
  requirements: MeetingRequirements;
  targetStatus?: MeetingStatus;
  targetSubStatus?: MeetingSubStatus;
}

// ============================================================================
// BOARD SETTINGS FOR REQUIREMENTS
// ============================================================================

export interface BoardMeetingRequirements {
  boardId: string;
  defaultRequirements: MeetingRequirements;
  meetingTypeRequirements?: Record<string, Partial<MeetingRequirements>>;
  overridePermissions: {
    allowSecretarySkipAgenda: boolean;
    allowSecretarySkipDocuments: boolean;
    requireApprovalForOverrides: boolean;
    allowedOverrideRoles: string[];
  };
}

// ============================================================================
// VALIDATION ERROR CODES
// ============================================================================

export const ValidationErrorCode = {
  // Participant errors
  INSUFFICIENT_PARTICIPANTS: 'INSUFFICIENT_PARTICIPANTS',
  MISSING_CHAIRMAN: 'MISSING_CHAIRMAN',
  MISSING_SECRETARY: 'MISSING_SECRETARY',
  QUORUM_NOT_MET: 'QUORUM_NOT_MET',

  // Agenda errors
  INSUFFICIENT_AGENDA_ITEMS: 'INSUFFICIENT_AGENDA_ITEMS',
  AGENDA_REQUIRED: 'AGENDA_REQUIRED',

  // Document errors
  INSUFFICIENT_DOCUMENTS: 'INSUFFICIENT_DOCUMENTS',
  DOCUMENTS_REQUIRED: 'DOCUMENTS_REQUIRED',
  MISSING_REQUIRED_DOCUMENT_TYPE: 'MISSING_REQUIRED_DOCUMENT_TYPE',

  // Approval errors
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  INVALID_APPROVER: 'INVALID_APPROVER',

  // Status transition errors
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  CANNOT_TRANSITION_FROM_ARCHIVED: 'CANNOT_TRANSITION_FROM_ARCHIVED',
  CANNOT_TRANSITION_FROM_CANCELLED: 'CANNOT_TRANSITION_FROM_CANCELLED',

  // Override errors
  OVERRIDE_NOT_ALLOWED: 'OVERRIDE_NOT_ALLOWED',
  OVERRIDE_REQUIRES_APPROVAL: 'OVERRIDE_REQUIRES_APPROVAL',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
} as const;

export type ValidationErrorCode = typeof ValidationErrorCode[keyof typeof ValidationErrorCode];
