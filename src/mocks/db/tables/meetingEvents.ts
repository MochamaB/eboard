/**
 * Meeting Events Table - Event-Driven Audit Log
 * Replaces meetingConfirmationHistory with comprehensive lifecycle tracking
 * Covers all 31 event types across pre-meeting, during-meeting, and post-meeting phases
 */

export type MeetingEventType =
  // Pre-Meeting Phase (13 events)
  | 'meeting_created'
  | 'configuration_complete'
  | 'submitted_for_approval'
  | 'approved'
  | 'rejected'
  | 'resubmitted'
  | 'scheduled'
  | 'rescheduled'
  | 'participant_added'
  | 'participant_removed'
  | 'agenda_published'
  | 'documents_uploaded'
  | 'reminder_sent'
  // During-Meeting Phase (10 events)
  | 'meeting_started'
  | 'participant_joined'
  | 'participant_left'
  | 'quorum_achieved'
  | 'quorum_lost'
  | 'vote_started'
  | 'vote_closed'
  | 'presentation_started'
  | 'presentation_ended'
  | 'meeting_ended'
  // Post-Meeting Phase (8 events)
  | 'minutes_created'
  | 'minutes_approved'
  | 'action_item_created'
  | 'action_item_completed'
  | 'resolution_passed'
  | 'follow_up_scheduled'
  | 'archived'
  | 'meeting_cancelled';

export interface MeetingEventRow {
  id: string;
  meetingId: string;
  eventType: MeetingEventType;

  // Status transition (null for non-status-changing events)
  fromStatus: string | null;
  fromSubStatus: string | null;
  toStatus: string | null;
  toSubStatus: string | null;

  // Actor (denormalized for immutable audit trail)
  performedBy: number; // userId
  performedByName: string; // Full name snapshot at time of event
  performedAt: string; // ISO timestamp

  // Event-specific metadata (polymorphic JSON)
  metadata: Record<string, unknown> | null;

  // Audit
  createdAt: string;
}

// ============================================================================
// MEETING EVENTS TABLE DATA
// Sample events for 9 test meetings covering all status+substatus combinations
// ============================================================================

export const meetingEventsTable: MeetingEventRow[] = [
  // ==========================================================================
  // MTG-001: draft.incomplete - Missing required validations
  // Events: Created only (still being configured)
  // ==========================================================================
  {
    id: 'evt-mtg001-001',
    meetingId: 'MTG-001',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-01T08:00:00Z',
    metadata: {
      meetingType: 'regular',
      boardId: 'ktda-ms',
      initialTitle: 'Q1 2026 Strategic Planning',
    },
    createdAt: '2026-02-01T08:00:00Z',
  },

  // ==========================================================================
  // MTG-002: draft.complete - All validations passed, ready for approval
  // Events: Created → Configuration Complete
  // ==========================================================================
  {
    id: 'evt-mtg002-001',
    meetingId: 'MTG-002',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-05T09:00:00Z',
    metadata: {
      meetingType: 'special',
      boardId: 'ktda-ms',
      initialTitle: 'Annual Budget Approval 2026',
    },
    createdAt: '2026-02-05T09:00:00Z',
  },
  {
    id: 'evt-mtg002-002',
    meetingId: 'MTG-002',
    eventType: 'participant_added',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-05T10:15:00Z',
    metadata: {
      participantsAdded: 8,
      quorumCalculated: 8,
    },
    createdAt: '2026-02-05T10:15:00Z',
  },
  {
    id: 'evt-mtg002-003',
    meetingId: 'MTG-002',
    eventType: 'agenda_published',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-08T11:30:00Z',
    metadata: {
      agendaItemCount: 5,
      agendaId: 'agenda-mtg002',
    },
    createdAt: '2026-02-08T11:30:00Z',
  },
  {
    id: 'evt-mtg002-004',
    meetingId: 'MTG-002',
    eventType: 'documents_uploaded',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-09T14:00:00Z',
    metadata: {
      documentCount: 3,
      documentTypes: ['agenda', 'budget_proposal', 'financial_report'],
    },
    createdAt: '2026-02-09T14:00:00Z',
  },
  {
    id: 'evt-mtg002-005',
    meetingId: 'MTG-002',
    eventType: 'configuration_complete',
    fromStatus: 'draft',
    fromSubStatus: 'incomplete',
    toStatus: 'draft',
    toSubStatus: 'complete',
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-10T14:30:00Z',
    metadata: {
      validationsPassed: [
        'has_participants',
        'has_quorum_settings',
        'has_agenda',
        'has_documents',
        'has_schedule',
      ],
    },
    createdAt: '2026-02-10T14:30:00Z',
  },

  // ==========================================================================
  // MTG-003: scheduled.pending_approval - Awaiting confirmation signature
  // Events: Created → Complete → Submitted for Approval
  // ==========================================================================
  {
    id: 'evt-mtg003-001',
    meetingId: 'MTG-003',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2026-02-10T09:00:00Z',
    metadata: {
      meetingType: 'committee',
      boardId: 'comm-audit',
      initialTitle: 'Audit Committee Q1 Review',
    },
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'evt-mtg003-002',
    meetingId: 'MTG-003',
    eventType: 'configuration_complete',
    fromStatus: 'draft',
    fromSubStatus: 'incomplete',
    toStatus: 'draft',
    toSubStatus: 'complete',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2026-02-12T16:00:00Z',
    metadata: {
      validationsPassed: [
        'has_participants',
        'has_quorum_settings',
        'has_agenda',
        'has_schedule',
      ],
    },
    createdAt: '2026-02-12T16:00:00Z',
  },
  {
    id: 'evt-mtg003-003',
    meetingId: 'MTG-003',
    eventType: 'submitted_for_approval',
    fromStatus: 'draft',
    fromSubStatus: 'complete',
    toStatus: 'scheduled',
    toSubStatus: 'pending_approval',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2026-02-15T10:00:00Z',
    metadata: {
      submittedTo: 1, // Chairman
      submittedToName: 'Chege Kirundi',
      requiresSignature: true,
    },
    createdAt: '2026-02-15T10:00:00Z',
  },

  // ==========================================================================
  // MTG-004: scheduled.approved - Confirmed and ready to start
  // Events: Created → Complete → Submitted → Approved
  // ==========================================================================
  {
    id: 'evt-mtg004-001',
    meetingId: 'MTG-004',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-02-20T09:00:00Z',
    metadata: {
      meetingType: 'regular',
      boardId: 'ketepa',
      initialTitle: 'KETEPA Board - Market Expansion Strategy',
    },
    createdAt: '2026-02-20T09:00:00Z',
  },
  {
    id: 'evt-mtg004-002',
    meetingId: 'MTG-004',
    eventType: 'configuration_complete',
    fromStatus: 'draft',
    fromSubStatus: 'incomplete',
    toStatus: 'draft',
    toSubStatus: 'complete',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-02-25T11:30:00Z',
    metadata: {
      validationsPassed: [
        'has_participants',
        'has_quorum_settings',
        'has_agenda',
        'has_documents',
        'has_schedule',
      ],
    },
    createdAt: '2026-02-25T11:30:00Z',
  },
  {
    id: 'evt-mtg004-003',
    meetingId: 'MTG-004',
    eventType: 'submitted_for_approval',
    fromStatus: 'draft',
    fromSubStatus: 'complete',
    toStatus: 'scheduled',
    toSubStatus: 'pending_approval',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-02-28T14:00:00Z',
    metadata: {
      submittedTo: 1, // Chairman
      submittedToName: 'Chege Kirundi',
      requiresSignature: true,
    },
    createdAt: '2026-02-28T14:00:00Z',
  },
  {
    id: 'evt-mtg004-004',
    meetingId: 'MTG-004',
    eventType: 'approved',
    fromStatus: 'scheduled',
    fromSubStatus: 'pending_approval',
    toStatus: 'scheduled',
    toSubStatus: 'approved',
    performedBy: 3,
    performedByName: 'Mathews Odero',
    performedAt: '2026-03-01T11:15:00Z',
    metadata: {
      approvalMethod: 'digital_signature',
      signatureId: 'sig-mtg004-001',
      signedDocumentId: 'doc-MTG-004-confirmation-signed',
      comments: 'Approved for market expansion discussion',
    },
    createdAt: '2026-03-01T11:15:00Z',
  },
  {
    id: 'evt-mtg004-005',
    meetingId: 'MTG-004',
    eventType: 'reminder_sent',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-03-10T08:00:00Z',
    metadata: {
      reminderType: 'meeting_start',
      recipientCount: 8,
      daysBeforeMeeting: 31,
    },
    createdAt: '2026-03-10T08:00:00Z',
  },

  // ==========================================================================
  // MTG-005: scheduled.rejected - Rejected by approver, needs revision
  // Events: Created → Complete → Submitted → Rejected
  // ==========================================================================
  {
    id: 'evt-mtg005-001',
    meetingId: 'MTG-005',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-02-25T09:00:00Z',
    metadata: {
      meetingType: 'committee',
      boardId: 'comm-hr',
      initialTitle: 'HR Committee - Compensation Review',
    },
    createdAt: '2026-02-25T09:00:00Z',
  },
  {
    id: 'evt-mtg005-002',
    meetingId: 'MTG-005',
    eventType: 'configuration_complete',
    fromStatus: 'draft',
    fromSubStatus: 'incomplete',
    toStatus: 'draft',
    toSubStatus: 'complete',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-02-28T15:00:00Z',
    metadata: {
      validationsPassed: [
        'has_participants',
        'has_quorum_settings',
        'has_agenda',
        'has_schedule',
      ],
    },
    createdAt: '2026-02-28T15:00:00Z',
  },
  {
    id: 'evt-mtg005-003',
    meetingId: 'MTG-005',
    eventType: 'submitted_for_approval',
    fromStatus: 'draft',
    fromSubStatus: 'complete',
    toStatus: 'scheduled',
    toSubStatus: 'pending_approval',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-03-01T10:00:00Z',
    metadata: {
      submittedTo: 1, // Chairman
      submittedToName: 'Chege Kirundi',
      requiresSignature: true,
    },
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'evt-mtg005-004',
    meetingId: 'MTG-005',
    eventType: 'rejected',
    fromStatus: 'scheduled',
    fromSubStatus: 'pending_approval',
    toStatus: 'scheduled',
    toSubStatus: 'rejected',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-03-05T09:20:00Z',
    metadata: {
      rejectionReason: 'incomplete_information',
      comments: 'Compensation benchmarking data missing. Please include market comparison report before resubmission.',
      documentsRequired: ['market_comparison_report', 'salary_survey_data'],
    },
    createdAt: '2026-03-05T09:20:00Z',
  },

  // ==========================================================================
  // MTG-006: in_progress - Meeting currently happening (Emergency)
  // Events: Created → Scheduled (skipped approval) → Started
  // ==========================================================================
  {
    id: 'evt-mtg006-001',
    meetingId: 'MTG-006',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-04T10:00:00Z',
    metadata: {
      meetingType: 'emergency',
      boardId: 'ktda-ms',
      initialTitle: 'Emergency Board Meeting - Market Response',
      urgency: 'high',
    },
    createdAt: '2026-02-04T10:00:00Z',
  },
  {
    id: 'evt-mtg006-002',
    meetingId: 'MTG-006',
    eventType: 'scheduled',
    fromStatus: 'draft',
    fromSubStatus: 'incomplete',
    toStatus: 'scheduled',
    toSubStatus: 'approved',
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-04T10:30:00Z',
    metadata: {
      skipApproval: true,
      overrideReason: 'Emergency meeting - requires immediate action',
      scheduledDate: '2026-02-04',
      startTime: '14:00',
    },
    createdAt: '2026-02-04T10:30:00Z',
  },
  {
    id: 'evt-mtg006-003',
    meetingId: 'MTG-006',
    eventType: 'reminder_sent',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-02-04T11:00:00Z',
    metadata: {
      reminderType: 'emergency_meeting',
      recipientCount: 15,
      hoursBeforeMeeting: 3,
    },
    createdAt: '2026-02-04T11:00:00Z',
  },
  {
    id: 'evt-mtg006-004',
    meetingId: 'MTG-006',
    eventType: 'meeting_started',
    fromStatus: 'scheduled',
    fromSubStatus: 'approved',
    toStatus: 'in_progress',
    toSubStatus: null,
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-02-04T14:00:00Z',
    metadata: {
      startedBy: 1,
      startedByRole: 'chairman',
      initialAttendeeCount: 12,
    },
    createdAt: '2026-02-04T14:00:00Z',
  },
  {
    id: 'evt-mtg006-005',
    meetingId: 'MTG-006',
    eventType: 'quorum_achieved',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-02-04T14:05:00Z',
    metadata: {
      quorumRequired: 8,
      presentCount: 12,
      quorumPercentage: 50,
    },
    createdAt: '2026-02-04T14:05:00Z',
  },

  // ==========================================================================
  // MTG-007: completed.recent - Meeting ended, active post-meeting work
  // Events: Full lifecycle including meeting start/end
  // ==========================================================================
  {
    id: 'evt-mtg007-001',
    meetingId: 'MTG-007',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-01-05T08:00:00Z',
    metadata: {
      meetingType: 'regular',
      boardId: 'ketepa',
      initialTitle: 'KETEPA Monthly Board Meeting - January 2026',
    },
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'evt-mtg007-002',
    meetingId: 'MTG-007',
    eventType: 'configuration_complete',
    fromStatus: 'draft',
    fromSubStatus: 'incomplete',
    toStatus: 'draft',
    toSubStatus: 'complete',
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-01-08T14:00:00Z',
    metadata: {
      validationsPassed: [
        'has_participants',
        'has_quorum_settings',
        'has_agenda',
        'has_documents',
        'has_schedule',
      ],
    },
    createdAt: '2026-01-08T14:00:00Z',
  },
  {
    id: 'evt-mtg007-003',
    meetingId: 'MTG-007',
    eventType: 'approved',
    fromStatus: 'draft',
    fromSubStatus: 'complete',
    toStatus: 'scheduled',
    toSubStatus: 'approved',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-01-10T10:30:00Z',
    metadata: {
      approvalMethod: 'digital_signature',
      signatureId: 'sig-mtg007-001',
    },
    createdAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 'evt-mtg007-004',
    meetingId: 'MTG-007',
    eventType: 'meeting_started',
    fromStatus: 'scheduled',
    fromSubStatus: 'approved',
    toStatus: 'in_progress',
    toSubStatus: null,
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-01-20T10:00:00Z',
    metadata: {
      startedBy: 1,
      startedByRole: 'chairman',
      initialAttendeeCount: 7,
    },
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'evt-mtg007-005',
    meetingId: 'MTG-007',
    eventType: 'quorum_achieved',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-01-20T10:03:00Z',
    metadata: {
      quorumRequired: 4,
      presentCount: 7,
      quorumPercentage: 50,
    },
    createdAt: '2026-01-20T10:03:00Z',
  },
  {
    id: 'evt-mtg007-006',
    meetingId: 'MTG-007',
    eventType: 'meeting_ended',
    fromStatus: 'in_progress',
    fromSubStatus: null,
    toStatus: 'completed',
    toSubStatus: 'recent',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-01-20T12:00:00Z',
    metadata: {
      endedBy: 1,
      endedByRole: 'chairman',
      finalAttendeeCount: 7,
      durationMinutes: 120,
    },
    createdAt: '2026-01-20T12:00:00Z',
  },
  {
    id: 'evt-mtg007-007',
    meetingId: 'MTG-007',
    eventType: 'minutes_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 19,
    performedByName: 'Jane Njeri Njeri',
    performedAt: '2026-01-21T09:00:00Z',
    metadata: {
      minutesId: 'min-mtg007',
      status: 'draft',
    },
    createdAt: '2026-01-21T09:00:00Z',
  },

  // ==========================================================================
  // MTG-008: completed.archived - Historical meeting, read-only
  // Events: Full lifecycle including archival
  // ==========================================================================
  {
    id: 'evt-mtg008-001',
    meetingId: 'MTG-008',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2025-09-20T08:00:00Z',
    metadata: {
      meetingType: 'regular',
      boardId: 'chai-trading',
      initialTitle: 'Chai Trading Board - Q4 2025 Review',
    },
    createdAt: '2025-09-20T08:00:00Z',
  },
  {
    id: 'evt-mtg008-002',
    meetingId: 'MTG-008',
    eventType: 'approved',
    fromStatus: 'draft',
    fromSubStatus: 'complete',
    toStatus: 'scheduled',
    toSubStatus: 'approved',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2025-09-25T14:00:00Z',
    metadata: {
      approvalMethod: 'digital_signature',
      signatureId: 'sig-mtg008-001',
    },
    createdAt: '2025-09-25T14:00:00Z',
  },
  {
    id: 'evt-mtg008-003',
    meetingId: 'MTG-008',
    eventType: 'meeting_started',
    fromStatus: 'scheduled',
    fromSubStatus: 'approved',
    toStatus: 'in_progress',
    toSubStatus: null,
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2025-10-15T10:00:00Z',
    metadata: {
      startedBy: 1,
      startedByRole: 'chairman',
      initialAttendeeCount: 6,
    },
    createdAt: '2025-10-15T10:00:00Z',
  },
  {
    id: 'evt-mtg008-004',
    meetingId: 'MTG-008',
    eventType: 'meeting_ended',
    fromStatus: 'in_progress',
    fromSubStatus: null,
    toStatus: 'completed',
    toSubStatus: 'recent',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2025-10-15T12:00:00Z',
    metadata: {
      endedBy: 1,
      endedByRole: 'chairman',
      finalAttendeeCount: 6,
      durationMinutes: 120,
    },
    createdAt: '2025-10-15T12:00:00Z',
  },
  {
    id: 'evt-mtg008-005',
    meetingId: 'MTG-008',
    eventType: 'minutes_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2025-10-16T09:00:00Z',
    metadata: {
      minutesId: 'min-mtg008',
      status: 'draft',
    },
    createdAt: '2025-10-16T09:00:00Z',
  },
  {
    id: 'evt-mtg008-006',
    meetingId: 'MTG-008',
    eventType: 'minutes_approved',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2025-10-20T10:30:00Z',
    metadata: {
      minutesId: 'min-mtg008',
      approvalMethod: 'digital_signature',
      signatureId: 'sig-min-mtg008-001',
    },
    createdAt: '2025-10-20T10:30:00Z',
  },
  {
    id: 'evt-mtg008-007',
    meetingId: 'MTG-008',
    eventType: 'archived',
    fromStatus: 'completed',
    fromSubStatus: 'recent',
    toStatus: 'completed',
    toSubStatus: 'archived',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2025-11-15T00:00:00Z',
    metadata: {
      archivalReason: 'auto_archive',
      daysAfterMeeting: 31,
      triggerType: 'system',
    },
    createdAt: '2025-11-15T00:00:00Z',
  },

  // ==========================================================================
  // MTG-009: cancelled - Terminal state, meeting was cancelled
  // Events: Created → Approved → Cancelled
  // ==========================================================================
  {
    id: 'evt-mtg009-001',
    meetingId: 'MTG-009',
    eventType: 'meeting_created',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2026-02-20T08:00:00Z',
    metadata: {
      meetingType: 'committee',
      boardId: 'comm-finance',
      initialTitle: 'Finance Committee - Special Budget Review',
    },
    createdAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'evt-mtg009-002',
    meetingId: 'MTG-009',
    eventType: 'configuration_complete',
    fromStatus: 'draft',
    fromSubStatus: 'incomplete',
    toStatus: 'draft',
    toSubStatus: 'complete',
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2026-02-22T11:00:00Z',
    metadata: {
      validationsPassed: [
        'has_participants',
        'has_quorum_settings',
        'has_agenda',
        'has_schedule',
      ],
    },
    createdAt: '2026-02-22T11:00:00Z',
  },
  {
    id: 'evt-mtg009-003',
    meetingId: 'MTG-009',
    eventType: 'approved',
    fromStatus: 'draft',
    fromSubStatus: 'complete',
    toStatus: 'scheduled',
    toSubStatus: 'approved',
    performedBy: 1,
    performedByName: 'Chege Kirundi',
    performedAt: '2026-02-25T10:00:00Z',
    metadata: {
      approvalMethod: 'digital_signature',
      signatureId: 'sig-mtg009-001',
    },
    createdAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'evt-mtg009-004',
    meetingId: 'MTG-009',
    eventType: 'reminder_sent',
    fromStatus: null,
    fromSubStatus: null,
    toStatus: null,
    toSubStatus: null,
    performedBy: 18,
    performedByName: 'Isaac Mungai Chege',
    performedAt: '2026-03-03T08:00:00Z',
    metadata: {
      reminderType: 'meeting_start',
      recipientCount: 6,
      daysBeforeMeeting: 7,
    },
    createdAt: '2026-03-03T08:00:00Z',
  },
  {
    id: 'evt-mtg009-005',
    meetingId: 'MTG-009',
    eventType: 'meeting_cancelled',
    fromStatus: 'scheduled',
    fromSubStatus: 'approved',
    toStatus: 'cancelled',
    toSubStatus: null,
    performedBy: 17,
    performedByName: 'Kenneth Mwangi Muhia',
    performedAt: '2026-03-08T16:00:00Z',
    metadata: {
      cancellationReason: 'Insufficient quorum confirmations received. Only 2 of 6 participants confirmed attendance. Meeting will be rescheduled.',
      confirmedCount: 2,
      requiredCount: 6,
      notifiedParticipants: true,
    },
    createdAt: '2026-03-08T16:00:00Z',
  },
];
