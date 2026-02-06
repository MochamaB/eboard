/**
 * Meeting Validation Service
 * Implements hierarchical validation with system defaults, board settings, and meeting overrides
 */

import type {
  MeetingRequirements,
  MeetingOverrides,
  ValidationResult,
  ValidationIssue,
  ValidationContext,
  BoardMeetingRequirements,
} from '../types/meetingRequirements.types';
import { ValidationErrorCode } from '../types/meetingRequirements.types';
import type { MeetingStatus, MeetingSubStatus } from '../types/meeting.types';

// ============================================================================
// SYSTEM DEFAULTS
// ============================================================================

export function getSystemDefaults(): MeetingRequirements {
  return {
    // Participant requirements
    minParticipants: 2,
    requireChairman: true,
    requireSecretary: true,
    requireQuorum: true,
    quorumPercentage: 50,

    // Agenda requirements
    minAgendaItems: 1,
    agendaRequired: true,

    // Document requirements
    documentsRequired: false,
    requiredDocumentTypes: [],
    minDocuments: 0,

    // Approval requirements
    requiresApproval: true,
    approverRoles: ['chairman'],

    // Override permissions
    allowAgendaOverride: true,
    allowDocumentOverride: true,
    allowApprovalOverride: false,
  };
}

// ============================================================================
// BOARD REQUIREMENTS (Mock - would come from API)
// ============================================================================

export function getBoardRequirements(boardId: string): Partial<MeetingRequirements> {
  // In production, this would fetch from boardSettings API
  // For now, return empty to use system defaults
  return {};
}

// ============================================================================
// MEETING TYPE REQUIREMENTS
// ============================================================================

export function getMeetingTypeRequirements(meetingType: string): Partial<MeetingRequirements> {
  const typeRequirements: Record<string, Partial<MeetingRequirements>> = {
    emergency: {
      requiresApproval: false,
      minAgendaItems: 0,
      agendaRequired: false,
      allowApprovalOverride: true,
    },
    special: {
      requiresApproval: true,
      minAgendaItems: 1,
    },
    regular: {
      requiresApproval: true,
      minAgendaItems: 3,
    },
    annual: {
      requiresApproval: true,
      minAgendaItems: 5,
      documentsRequired: true,
      minDocuments: 2,
    },
  };

  return typeRequirements[meetingType] || {};
}

// ============================================================================
// HIERARCHICAL MERGE
// ============================================================================

export function getMergedRequirements(
  boardId: string,
  meetingType: string,
  overrides?: MeetingOverrides
): MeetingRequirements {
  // Start with system defaults
  let requirements = { ...getSystemDefaults() };

  // Merge board settings
  const boardReqs = getBoardRequirements(boardId);
  requirements = { ...requirements, ...boardReqs };

  // Merge meeting type settings
  const typeReqs = getMeetingTypeRequirements(meetingType);
  requirements = { ...requirements, ...typeReqs };

  // Apply meeting-level overrides
  if (overrides) {
    if (overrides.skipAgenda && requirements.allowAgendaOverride) {
      requirements.agendaRequired = false;
      requirements.minAgendaItems = 0;
    }
    if (overrides.skipDocuments && requirements.allowDocumentOverride) {
      requirements.documentsRequired = false;
      requirements.minDocuments = 0;
    }
    if (overrides.skipApproval && requirements.allowApprovalOverride) {
      requirements.requiresApproval = false;
    }
    if (overrides.customMinParticipants !== undefined) {
      requirements.minParticipants = overrides.customMinParticipants;
    }
    if (overrides.customQuorumPercentage !== undefined) {
      requirements.quorumPercentage = overrides.customQuorumPercentage;
    }
  }

  return requirements;
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateMeeting(context: ValidationContext): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  const { meeting, requirements } = context;

  // Validate participants
  if (meeting.participantCount < requirements.minParticipants) {
    errors.push({
      field: 'participants',
      message: `At least ${requirements.minParticipants} participants required. Currently have ${meeting.participantCount}.`,
      severity: 'error',
      code: ValidationErrorCode.INSUFFICIENT_PARTICIPANTS,
    });
  }

  if (requirements.requireChairman && !meeting.hasChairman) {
    errors.push({
      field: 'participants',
      message: 'Chairman is required for this meeting.',
      severity: 'error',
      code: ValidationErrorCode.MISSING_CHAIRMAN,
    });
  }

  if (requirements.requireSecretary && !meeting.hasSecretary) {
    errors.push({
      field: 'participants',
      message: 'Secretary is required for this meeting.',
      severity: 'error',
      code: ValidationErrorCode.MISSING_SECRETARY,
    });
  }

  // Validate quorum
  if (requirements.requireQuorum) {
    const quorumMet = meeting.participantCount >= meeting.quorumRequired;
    if (!quorumMet) {
      errors.push({
        field: 'participants',
        message: `Quorum not met. Need ${meeting.quorumRequired} participants (${requirements.quorumPercentage}%), have ${meeting.participantCount}.`,
        severity: 'error',
        code: ValidationErrorCode.QUORUM_NOT_MET,
      });
    }
  }

  // Validate agenda
  const agendaCount = meeting.agendaItemCount || 0;
  if (requirements.agendaRequired && agendaCount === 0) {
    errors.push({
      field: 'agenda',
      message: 'Agenda is required for this meeting.',
      severity: 'error',
      code: ValidationErrorCode.AGENDA_REQUIRED,
    });
  }

  if (agendaCount < requirements.minAgendaItems) {
    errors.push({
      field: 'agenda',
      message: `At least ${requirements.minAgendaItems} agenda items required. Currently have ${agendaCount}.`,
      severity: 'error',
      code: ValidationErrorCode.INSUFFICIENT_AGENDA_ITEMS,
    });
  }

  // Validate documents
  const docCount = meeting.documentCount || 0;
  if (requirements.documentsRequired && docCount === 0) {
    errors.push({
      field: 'documents',
      message: 'Documents are required for this meeting.',
      severity: 'error',
      code: ValidationErrorCode.DOCUMENTS_REQUIRED,
    });
  }

  if (requirements.minDocuments && docCount < requirements.minDocuments) {
    errors.push({
      field: 'documents',
      message: `At least ${requirements.minDocuments} documents required. Currently have ${docCount}.`,
      severity: 'error',
      code: ValidationErrorCode.INSUFFICIENT_DOCUMENTS,
    });
  }

  // Add info about overrides
  if (meeting.overrides) {
    if (meeting.overrides.skipAgenda) {
      info.push({
        field: 'agenda',
        message: 'Agenda requirement waived for this meeting.',
        severity: 'info',
        code: 'OVERRIDE_AGENDA',
      });
    }
    if (meeting.overrides.skipDocuments) {
      info.push({
        field: 'documents',
        message: 'Document requirement waived for this meeting.',
        severity: 'info',
        code: 'OVERRIDE_DOCUMENTS',
      });
    }
    if (meeting.overrides.skipApproval) {
      info.push({
        field: 'approval',
        message: 'Approval requirement waived for this meeting.',
        severity: 'info',
        code: 'OVERRIDE_APPROVAL',
      });
    }
  }

  const isValid = errors.length === 0;
  const canTransitionToDraftComplete = isValid;
  const canSubmitForApproval = isValid && requirements.requiresApproval;

  return {
    isValid,
    canTransitionToDraftComplete,
    canSubmitForApproval,
    errors,
    warnings,
    info,
    summary: {
      totalIssues: errors.length + warnings.length + info.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      infoCount: info.length,
    },
  };
}

// ============================================================================
// STATUS TRANSITION VALIDATION
// ============================================================================

export function canTransitionTo(
  currentStatus: MeetingStatus,
  currentSubStatus: MeetingSubStatus,
  targetStatus: MeetingStatus,
  targetSubStatus?: MeetingSubStatus
): { allowed: boolean; reason?: string } {
  // Terminal states
  if (currentStatus === 'cancelled') {
    return { allowed: false, reason: 'Cannot transition from cancelled meeting' };
  }

  if (currentStatus === 'completed' && currentSubStatus === 'archived') {
    return { allowed: false, reason: 'Cannot transition from archived meeting' };
  }

  // Define valid transitions
  const validTransitions: Record<string, string[]> = {
    'draft.incomplete': ['draft.complete'],
    'draft.complete': ['scheduled.pending_approval', 'scheduled.approved'],
    'scheduled.pending_approval': ['scheduled.approved', 'scheduled.rejected', 'cancelled'],
    'scheduled.approved': ['in_progress', 'cancelled'],
    'scheduled.rejected': ['draft.incomplete', 'cancelled'],
    'in_progress': ['completed.recent', 'cancelled'],
    'completed.recent': ['completed.archived'],
    'completed.archived': [],
    'cancelled': [],
  };

  const currentKey = `${currentStatus}.${currentSubStatus || ''}`.replace(/\.$/, '');
  const targetKey = `${targetStatus}.${targetSubStatus || ''}`.replace(/\.$/, '');

  const allowedTransitions = validTransitions[currentKey] || [];

  if (allowedTransitions.includes(targetKey)) {
    return { allowed: true };
  }

  // Special case: any non-terminal status can transition to cancelled
  if (targetStatus === 'cancelled' && currentStatus !== 'cancelled' && 
      !(currentStatus === 'completed' && currentSubStatus === 'archived')) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Invalid transition from ${currentKey} to ${targetKey}`,
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function getValidationSummaryText(result: ValidationResult): string {
  if (result.isValid) {
    return 'All requirements met';
  }

  const parts: string[] = [];
  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} error${result.errors.length > 1 ? 's' : ''}`);
  }
  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}

export function getNextRequiredAction(result: ValidationResult): string | null {
  if (result.isValid) {
    return null;
  }

  // Return the first error message as the next action
  if (result.errors.length > 0) {
    return result.errors[0].message;
  }

  return null;
}
