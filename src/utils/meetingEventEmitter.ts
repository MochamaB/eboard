/**
 * Meeting Event Emission Service
 * Handles emitting events to meetingEvents table for audit trail
 * NOTE: Requires meetingEvents table to be implemented (Phase A3)
 */

import type { MeetingStatus, MeetingSubStatus } from '../types/meeting.types';
import type { ValidationResult } from '../types/meetingRequirements.types';

// ============================================================================
// EVENT TYPES (from MEETING_LIFECYCLE_EVENTS.md)
// ============================================================================

export type MeetingEventType =
  // Pre-Meeting Phase (Draft)
  | 'meeting_created'
  | 'configuration_started'
  | 'configuration_complete'
  | 'validation_failed'
  | 'override_applied'
  
  // Pre-Meeting Phase (Scheduled)
  | 'submitted_for_approval'
  | 'approval_requested'
  | 'approved'
  | 'rejected'
  | 'revision_started'
  | 'scheduled'
  | 'rescheduled'
  
  // During Meeting Phase
  | 'meeting_started'
  | 'participant_joined'
  | 'participant_left'
  | 'recording_started'
  | 'recording_stopped'
  | 'vote_initiated'
  | 'vote_completed'
  | 'meeting_ended'
  
  // Post-Meeting Phase
  | 'minutes_draft_created'
  | 'minutes_updated'
  | 'minutes_approved'
  | 'action_item_created'
  | 'action_item_assigned'
  | 'action_item_completed'
  | 'resolution_created'
  | 'resolution_approved'
  | 'meeting_archived'
  
  // Cancellation
  | 'meeting_cancelled';

export interface MeetingEvent {
  id: string;
  meetingId: string;
  eventType: MeetingEventType;
  eventTimestamp: string;
  triggeredBy: number; // userId
  triggeredByName: string;
  metadata: Record<string, any>;
  previousStatus?: MeetingStatus;
  previousSubStatus?: MeetingSubStatus;
  newStatus?: MeetingStatus;
  newSubStatus?: MeetingSubStatus;
}

// ============================================================================
// EVENT EMISSION FUNCTIONS
// ============================================================================

/**
 * Emit a validation event when meeting configuration is validated
 */
export function emitValidationEvent(
  meetingId: string,
  userId: number,
  userName: string,
  validationResult: ValidationResult
): void {
  const eventType: MeetingEventType = validationResult.isValid 
    ? 'configuration_complete' 
    : 'validation_failed';

  const event: Partial<MeetingEvent> = {
    meetingId,
    eventType,
    eventTimestamp: new Date().toISOString(),
    triggeredBy: userId,
    triggeredByName: userName,
    metadata: {
      validationResult: {
        isValid: validationResult.isValid,
        errorCount: validationResult.summary.errorCount,
        warningCount: validationResult.summary.warningCount,
        errors: validationResult.errors.map(e => ({
          field: e.field,
          message: e.message,
          code: e.code,
        })),
      },
    },
  };

  // TODO: Save to meetingEvents table when implemented
  console.log('[Event Emission]', event);
}

/**
 * Emit a status transition event
 */
export function emitStatusTransitionEvent(
  meetingId: string,
  userId: number,
  userName: string,
  previousStatus: MeetingStatus,
  previousSubStatus: MeetingSubStatus,
  newStatus: MeetingStatus,
  newSubStatus: MeetingSubStatus,
  reason?: string
): void {
  const eventType = getEventTypeForTransition(previousStatus, newStatus, newSubStatus);

  const event: Partial<MeetingEvent> = {
    meetingId,
    eventType,
    eventTimestamp: new Date().toISOString(),
    triggeredBy: userId,
    triggeredByName: userName,
    previousStatus,
    previousSubStatus,
    newStatus,
    newSubStatus,
    metadata: {
      transition: `${previousStatus}.${previousSubStatus} → ${newStatus}.${newSubStatus}`,
      reason,
    },
  };

  // TODO: Save to meetingEvents table when implemented
  console.log('[Event Emission]', event);
}

/**
 * Emit an override event when meeting-level overrides are applied
 */
export function emitOverrideEvent(
  meetingId: string,
  userId: number,
  userName: string,
  overrideType: string,
  reason: string
): void {
  const event: Partial<MeetingEvent> = {
    meetingId,
    eventType: 'override_applied',
    eventTimestamp: new Date().toISOString(),
    triggeredBy: userId,
    triggeredByName: userName,
    metadata: {
      overrideType,
      reason,
    },
  };

  // TODO: Save to meetingEvents table when implemented
  console.log('[Event Emission]', event);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEventTypeForTransition(
  previousStatus: MeetingStatus,
  newStatus: MeetingStatus,
  newSubStatus: MeetingSubStatus
): MeetingEventType {
  // Map status transitions to event types
  if (newStatus === 'scheduled' && newSubStatus === 'pending_approval') {
    return 'submitted_for_approval';
  }
  if (newStatus === 'scheduled' && newSubStatus === 'approved') {
    return 'approved';
  }
  if (newStatus === 'scheduled' && newSubStatus === 'rejected') {
    return 'rejected';
  }
  if (newStatus === 'in_progress') {
    return 'meeting_started';
  }
  if (newStatus === 'completed') {
    return 'meeting_ended';
  }
  if (newStatus === 'cancelled') {
    return 'meeting_cancelled';
  }
  if (newSubStatus === 'archived') {
    return 'meeting_archived';
  }

  // Default to generic scheduled event
  return 'scheduled';
}

/**
 * Get all events for a meeting (for audit trail display)
 */
export function getMeetingEvents(meetingId: string): MeetingEvent[] {
  // TODO: Fetch from meetingEvents table when implemented
  console.log('[Get Events]', meetingId);
  return [];
}
