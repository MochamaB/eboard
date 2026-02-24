/**
 * Meeting Types
 * Zod schemas and TypeScript types for meeting management
 * Based on board-centric architecture (boardId instead of orgId)
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

// Status + SubStatus Model (5 primary statuses)
export const MeetingStatusSchema = z.enum([
  'draft',       // Being prepared
  'scheduled',   // Confirmed and scheduled
  'inprogress',  // Currently happening (backend: InProgress.ToString().ToLower())
  'completed',   // Finished
  'cancelled',   // Terminal state
]);

// SubStatus schemas (contextual to primary status)
export const DraftSubStatusSchema = z.enum([
  'incomplete', // Missing required fields/validations
  'complete',   // All validations passed, ready for approval
]);

export const ScheduledSubStatusSchema = z.enum([
  'pending_approval', // Awaiting confirmation/approval
  'approved',         // Confirmed and approved
  'rejected',         // Rejected, needs revision
]);

export const CompletedSubStatusSchema = z.enum([
  'recent',   // Active post-meeting work (minutes, action items)
  'archived', // Read-only historical record
]);

// Union of all substatus types (nullable)
export const MeetingSubStatusSchema = z.union([
  DraftSubStatusSchema,
  ScheduledSubStatusSchema,
  CompletedSubStatusSchema,
  z.null(),
]).optional();

// Meeting Event Types (31 lifecycle events across all phases)
export const MeetingEventTypeSchema = z.enum([
  // Pre-Meeting Phase (13 events)
  'meeting_created',           // Initial draft creation
  'configuration_complete',    // All required fields filled
  'submitted_for_approval',    // Secretary submits for confirmation
  'approved',                  // Approver signs and confirms
  'rejected',                  // Approver rejects with reason
  'resubmitted',               // After rejection, resubmitted
  'scheduled',                 // Meeting scheduled (if skip approval)
  'rescheduled',               // Date/time changed
  'participant_added',         // Board member/guest added
  'participant_removed',       // Participant removed
  'agenda_published',          // Agenda finalized
  'documents_uploaded',        // Documents added
  'reminder_sent',             // Notification sent to participants

  // During-Meeting Phase (10 events)
  'meeting_started',           // Meeting begins
  'participant_joined',        // Attendee joins
  'participant_left',          // Attendee leaves
  'quorum_achieved',           // Minimum attendance met
  'quorum_lost',               // Dropped below minimum
  'vote_started',              // Voting initiated
  'vote_closed',               // Voting completed
  'presentation_started',      // Presenter begins
  'presentation_ended',        // Presenter finishes
  'meeting_ended',             // Meeting concludes

  // Post-Meeting Phase (8 events)
  'minutes_created',           // Draft minutes generated
  'minutes_approved',          // Minutes signed and approved
  'action_item_created',       // Action item assigned
  'action_item_completed',     // Action item resolved
  'resolution_passed',         // Board resolution passed
  'follow_up_scheduled',       // Next meeting scheduled
  'archived',                  // Meeting archived
  'meeting_cancelled',         // Terminal cancellation (can happen in any phase)
]);

// Meeting type - Dynamic lookup from backend (use useLookups context)
// Values: 'regular', 'special', 'agm', 'emergency', 'committee'
export const MeetingTypeSchema = z.string();

export const LocationTypeSchema = z.enum([
  'virtual',
  'physical',
  'hybrid',
]);

export const RSVPStatusSchema = z.enum([
  'pending',     // Default status when participant is added
  'accepted',
  'declined',
  'tentative',
  'noresponse',  // Backend: NoResponse.ToString().ToLower()
]);

export const AttendanceStatusSchema = z.enum([
  'present',      // Attended the meeting
  'absent',       // Did not attend
  'late',         // Arrived late
  'leftearly',    // Left before meeting ended (backend: LeftEarly.ToString().ToLower())
  'excused',      // Absence was excused
]);

export const ConfirmationEventTypeSchema = z.enum([
  'submitted',      // Secretary submits meeting for confirmation
  'confirmed',      // Approver signs and confirms meeting
  'rejected',       // Approver rejects with reason
  'superseded',     // Previous confirmation invalidated due to meeting changes
  'resubmitted',    // Secretary resubmits after rejection or changes
]);

export const RejectionReasonSchema = z.enum([
  'incomplete_information',
  'scheduling_conflict',
  'agenda_not_approved',
  'quorum_concerns',
  'other',
]);

// ============================================================================
// NESTED SCHEMAS
// ============================================================================

// Board role object from backend (for participants)
export const ParticipantBoardRoleSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
}).nullable().optional();

// Meeting participant (board member + RSVP status)
export const MeetingParticipantSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  boardRole: ParticipantBoardRoleSchema, // Role object from backend
  rsvpStatus: RSVPStatusSchema.default('pending'),
  rsvpNote: z.string().nullable().optional(),
  isGuest: z.boolean().default(false),

  // For guests/presenters
  guestRole: z.string().nullable().optional(),
  timeSlotStart: z.string().nullable().optional(),
  timeSlotEnd: z.string().nullable().optional(),
  presentationTopic: z.string().nullable().optional(),
  canVote: z.boolean().default(true),
  canViewDocuments: z.boolean().default(false),
  canShareScreen: z.boolean().default(true),
  receiveMinutes: z.boolean().default(false),
  isRequired: z.boolean().default(true),
});

// Recurrence pattern (optional)
export const RecurrencePatternSchema = z.object({
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']),
  interval: z.number().default(1),
  endDate: z.string().optional(),
  occurrences: z.number().optional(),
  excludeDates: z.array(z.string()).optional(),
});

// Meeting validation overrides (for special circumstances)
export const MeetingOverridesSchema = z.object({
  skipAgenda: z.boolean().optional(),             // Allow meeting without agenda
  skipDocuments: z.boolean().optional(),          // Allow meeting without documents
  skipApproval: z.boolean().optional(),           // Skip confirmation workflow
  customMinParticipants: z.number().optional(),   // Override quorum calculation
}).nullable();

// Meeting event (replaces meetingConfirmationHistory)
export const MeetingEventSchema = z.object({
  id: z.number(),
  meetingId: z.number(),
  eventType: z.string(), // Event type as string from backend

  // Status transition (null for non-status-changing events)
  fromStatus: z.string().nullable().optional(),
  fromSubStatus: z.string().nullable().optional(),
  toStatus: z.string().nullable().optional(),
  toSubStatus: z.string().nullable().optional(),

  // Actor
  performedBy: z.number().nullable().optional(),
  performedByName: z.string().nullable().optional(),
  performedAt: z.string(),

  // System action flag
  isSystemAction: z.boolean().default(false),

  // Event-specific metadata (polymorphic JSON)
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),

  // Audit
  createdAt: z.string(),
});

// Meeting confirmation history event (DEPRECATED - use MeetingEventSchema)
export const MeetingConfirmationHistorySchema = z.object({
  id: z.string(),
  meetingId: z.string(),

  // Event type
  eventType: ConfirmationEventTypeSchema,

  // Actor
  performedBy: z.number(),
  performedByName: z.string(),
  performedAt: z.string(),

  // Submission details (for 'submitted' and 'resubmitted' events)
  submissionNotes: z.string().nullable().optional(),

  // Confirmation details (for 'confirmed' events)
  signatureId: z.string().nullable().optional(),

  // Rejection details (for 'rejected' events)
  rejectionReason: RejectionReasonSchema.nullable().optional(),
  rejectionComments: z.string().nullable().optional(),

  // Documents
  unsignedDocumentId: z.string().nullable().optional(),
  unsignedDocumentUrl: z.string().nullable().optional(),
  signedDocumentId: z.string().nullable().optional(),
  signedDocumentUrl: z.string().nullable().optional(),

  // Metadata
  createdAt: z.string(),
});

// ============================================================================
// MAIN MEETING SCHEMA
// ============================================================================

export const MeetingSchema = z.object({
  id: z.number(),

  // Board Association (board-centric architecture)
  boardId: z.number(),
  boardName: z.string(),
  boardType: z.string(), // Backend returns string code like 'main', 'subsidiary'
  parentBoardId: z.number().nullable().optional(), // If committee, parent board id
  parentBoardName: z.string().nullable().optional(), // If committee, parent board name

  // Basic Info
  title: z.string(),
  description: z.string().nullable().optional(),
  meetingType: z.string(), // Backend returns meeting type code

  // Schedule
  startDate: z.string(), // ISO date (YYYY-MM-DD)
  startTime: z.string(), // "h:mm tt" format (e.g., "2:30 PM")
  duration: z.number(), // minutes
  endDateTime: z.string(), // calculated ISO datetime
  timezone: z.string().default('Africa/Nairobi'),

  // Location
  locationType: z.string(), // Backend returns lowercase string
  locationDetails: z.string().nullable().optional(),
  virtualMeetingLink: z.string().nullable().optional(),
  physicalAddress: z.string().nullable().optional(),

  // Participants
  participants: z.array(MeetingParticipantSchema),
  quorumPercentage: z.number().min(0).max(100),
  quorumRequired: z.number(), // calculated number of people
  expectedAttendees: z.number(),

  // Confirmation
  requiresConfirmation: z.boolean(),
  confirmationStatus: z.enum(['pending', 'approved', 'rejected']).nullable().optional(),
  confirmedBy: z.number().nullable().optional(), // User ID
  confirmedByName: z.string().nullable().optional(),
  confirmedAt: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  confirmationDocumentUrl: z.string().nullable().optional(),

  // Status (Status + SubStatus model)
  status: z.string(), // Backend returns lowercase status
  subStatus: z.string().nullable().optional(), // Contextual substatus
  statusUpdatedAt: z.string(),                  // Last status change timestamp

  // Validation overrides (for special circumstances)
  overrides: MeetingOverridesSchema.nullable().optional(),
  overrideReason: z.string().nullable().optional(),

  // Recurrence
  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.nullable().optional(),
  recurrenceGroupId: z.string().nullable().optional(), // Group ID for series

  // Metadata
  createdBy: z.number(),
  createdByName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  cancelledAt: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
});

// Board Pack Status (for meeting list display)
export const BoardPackStatusSchema = z.object({
  agenda: z.object({
    status: z.enum(['none', 'draft', 'published']),
    itemCount: z.number(),
  }),
  documents: z.object({
    count: z.number(),
  }),
  minutes: z.object({
    status: z.enum(['none', 'draft', 'published']),
  }),
  votes: z.object({
    count: z.number(),
  }),
});

// Meeting list item (lighter for tables)
export const MeetingListItemSchema = z.object({
  id: z.number(),
  boardId: z.number(),
  boardName: z.string(),
  boardType: z.string(), // Backend returns string code
  parentBoardName: z.string().nullable().optional(), // For committees
  title: z.string(),
  meetingType: z.string(), // Backend returns meeting type code
  startDate: z.string(),
  startTime: z.string(), // "h:mm tt" format (e.g., "2:30 PM")
  duration: z.number(),
  locationType: z.string(), // Backend returns lowercase string
  physicalLocation: z.string().nullable().optional(), // Physical location address
  meetingLink: z.string().nullable().optional(), // Virtual meeting link
  status: z.string(), // Backend returns lowercase status
  subStatus: z.string().nullable().optional(), // Contextual substatus
  statusUpdatedAt: z.string(),
  participantCount: z.number(),
  expectedAttendees: z.number(), // Total expected participants
  quorumPercentage: z.number(),
  quorumRequired: z.number(), // Calculated quorum number
  requiresConfirmation: z.boolean(),
  createdByName: z.string(),
  createdAt: z.string(),
  // Board Pack status for quick overview
  boardPackStatus: BoardPackStatusSchema.nullable().optional(),
});

// ============================================================================
// API PAYLOADS
// ============================================================================

export const CreateMeetingPayloadSchema = z.object({
  boardId: z.number({ message: 'Board is required' }),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  meetingType: z.string(), // Meeting type code
  startDate: z.string(),
  startTime: z.string(), // HH:mm format for backend parsing
  duration: z.number().min(15).max(480),
  locationType: z.string(), // 'virtual', 'physical', 'hybrid'
  locationDetails: z.string().optional(),
  virtualMeetingLink: z.string().optional(),
  physicalAddress: z.string().optional(),
  quorumPercentage: z.number().min(0).max(100).optional(),

  // Participants auto-populated from board members
  // Guests added separately via addGuest endpoint

  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.optional(),

  // Validation overrides (for authorized special circumstances)
  overrides: MeetingOverridesSchema.optional(),
  overrideReason: z.string().optional(),
});

export const UpdateMeetingPayloadSchema = CreateMeetingPayloadSchema.partial().extend({
  // Can't change boardId after creation
  boardId: z.undefined(),
  status: z.string().optional(),
});

export const AddGuestPayloadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  guestRole: z.string(),
  timeSlotStart: z.string().optional(),
  timeSlotEnd: z.string().optional(),
  presentationTopic: z.string().optional(),
  canViewDocuments: z.boolean().default(false),
  canShareScreen: z.boolean().default(true),
  receiveMinutes: z.boolean().default(false),
});

export const UpdateRSVPPayloadSchema = z.object({
  rsvpStatus: RSVPStatusSchema,
});

export const CancelMeetingPayloadSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
  notifyParticipants: z.boolean().default(true),
});

export const RescheduleMeetingPayloadSchema = z.object({
  startDate: z.string(),
  startTime: z.string(),
  duration: z.number().min(15).max(480).optional(),
});

// ============================================================================
// FILTER PARAMETERS
// ============================================================================

export interface MeetingFilterParams {
  // Board filtering (board-centric)
  boardId?: number; // Filter by specific board
  boardIds?: number[]; // Filter by multiple boards (for chairman)
  boardType?: string; // main, subsidiary, factory, committee
  includeCommittees?: boolean; // Include committee meetings of this board
  committeeId?: number; // Filter by specific committee

  // Status & Type
  search?: string;
  status?: string | string[];
  subStatus?: string | string[];
  meetingType?: string;

  // Date filtering
  dateFrom?: string;
  dateTo?: string;
  month?: string; // YYYY-MM
  year?: string; // YYYY

  // User-specific
  myMeetingsOnly?: boolean; // Current user's meetings
  rsvpStatus?: string;

  // Confirmation
  pendingConfirmation?: boolean;

  // Pagination
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

// ============================================================================
// API RESPONSES
// ============================================================================

export const MeetingListResponseSchema = z.object({
  data: z.array(MeetingListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// Calendar data (meetings grouped by date)
export const CalendarMeetingSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  meetings: z.array(MeetingListItemSchema),
});

export const CalendarDataResponseSchema = z.object({
  data: z.array(CalendarMeetingSchema),
  dateFrom: z.string(),
  dateTo: z.string(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MeetingStatus = z.infer<typeof MeetingStatusSchema>;
export type DraftSubStatus = z.infer<typeof DraftSubStatusSchema>;
export type ScheduledSubStatus = z.infer<typeof ScheduledSubStatusSchema>;
export type CompletedSubStatus = z.infer<typeof CompletedSubStatusSchema>;
export type MeetingSubStatus = z.infer<typeof MeetingSubStatusSchema>;
export type MeetingEventType = z.infer<typeof MeetingEventTypeSchema>;
export type MeetingType = z.infer<typeof MeetingTypeSchema>;
export type LocationType = z.infer<typeof LocationTypeSchema>;
export type RSVPStatus = z.infer<typeof RSVPStatusSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;
export type ConfirmationEventType = z.infer<typeof ConfirmationEventTypeSchema>;
export type RejectionReason = z.infer<typeof RejectionReasonSchema>;
export type MeetingParticipant = z.infer<typeof MeetingParticipantSchema>;
export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>;
export type MeetingOverrides = z.infer<typeof MeetingOverridesSchema>;
export type MeetingEvent = z.infer<typeof MeetingEventSchema>;
export type MeetingConfirmationHistory = z.infer<typeof MeetingConfirmationHistorySchema>;
export type Meeting = z.infer<typeof MeetingSchema>;
export type BoardPackStatus = z.infer<typeof BoardPackStatusSchema>;
export type MeetingListItem = z.infer<typeof MeetingListItemSchema>;
export type CreateMeetingPayload = z.infer<typeof CreateMeetingPayloadSchema>;
export type UpdateMeetingPayload = z.infer<typeof UpdateMeetingPayloadSchema>;
export type AddGuestPayload = z.infer<typeof AddGuestPayloadSchema>;
export type UpdateRSVPPayload = z.infer<typeof UpdateRSVPPayloadSchema>;
export type CancelMeetingPayload = z.infer<typeof CancelMeetingPayloadSchema>;
export type RescheduleMeetingPayload = z.infer<typeof RescheduleMeetingPayloadSchema>;
export type MeetingListResponse = z.infer<typeof MeetingListResponseSchema>;
export type CalendarMeeting = z.infer<typeof CalendarMeetingSchema>;
export type CalendarDataResponse = z.infer<typeof CalendarDataResponseSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

// Status labels (5 primary statuses)
export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  inprogress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Status colors (Ant Design color names)
export const MEETING_STATUS_COLORS: Record<MeetingStatus, string> = {
  draft: 'default',
  scheduled: 'cyan',
  inprogress: 'processing',
  completed: 'success',
  cancelled: 'error',
};

// SubStatus labels (contextual)
export const DRAFT_SUBSTATUS_LABELS: Record<'incomplete' | 'complete', string> = {
  incomplete: 'Incomplete',
  complete: 'Complete',
};

export const SCHEDULED_SUBSTATUS_LABELS: Record<'pending_approval' | 'approved' | 'rejected', string> = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const COMPLETED_SUBSTATUS_LABELS: Record<'recent' | 'archived', string> = {
  recent: 'Recent',
  archived: 'Archived',
};

// SubStatus colors
export const DRAFT_SUBSTATUS_COLORS: Record<'incomplete' | 'complete', string> = {
  incomplete: 'orange',
  complete: 'blue',
};

export const SCHEDULED_SUBSTATUS_COLORS: Record<'pending_approval' | 'approved' | 'rejected', string> = {
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'error',
};

export const COMPLETED_SUBSTATUS_COLORS: Record<'recent' | 'archived', string> = {
  recent: 'cyan',
  archived: 'default',
};

// Meeting event type labels (31 lifecycle events)
export const MEETING_EVENT_LABELS: Record<MeetingEventType, string> = {
  // Pre-Meeting Phase
  meeting_created: 'Meeting Created',
  configuration_complete: 'Configuration Complete',
  submitted_for_approval: 'Submitted for Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  resubmitted: 'Resubmitted',
  scheduled: 'Scheduled',
  rescheduled: 'Rescheduled',
  participant_added: 'Participant Added',
  participant_removed: 'Participant Removed',
  agenda_published: 'Agenda Published',
  documents_uploaded: 'Documents Uploaded',
  reminder_sent: 'Reminder Sent',

  // During-Meeting Phase
  meeting_started: 'Meeting Started',
  participant_joined: 'Participant Joined',
  participant_left: 'Participant Left',
  quorum_achieved: 'Quorum Achieved',
  quorum_lost: 'Quorum Lost',
  vote_started: 'Vote Started',
  vote_closed: 'Vote Closed',
  presentation_started: 'Presentation Started',
  presentation_ended: 'Presentation Ended',
  meeting_ended: 'Meeting Ended',

  // Post-Meeting Phase
  minutes_created: 'Minutes Created',
  minutes_approved: 'Minutes Approved',
  action_item_created: 'Action Item Created',
  action_item_completed: 'Action Item Completed',
  resolution_passed: 'Resolution Passed',
  follow_up_scheduled: 'Follow-up Scheduled',
  archived: 'Archived',

  // Terminal
  meeting_cancelled: 'Meeting Cancelled',
};

// Meeting event type colors (grouped by phase)
export const MEETING_EVENT_COLORS: Record<MeetingEventType, string> = {
  // Pre-Meeting Phase
  meeting_created: 'default',
  configuration_complete: 'blue',
  submitted_for_approval: 'orange',
  approved: 'success',
  rejected: 'error',
  resubmitted: 'warning',
  scheduled: 'cyan',
  rescheduled: 'purple',
  participant_added: 'geekblue',
  participant_removed: 'volcano',
  agenda_published: 'blue',
  documents_uploaded: 'cyan',
  reminder_sent: 'default',

  // During-Meeting Phase
  meeting_started: 'processing',
  participant_joined: 'success',
  participant_left: 'default',
  quorum_achieved: 'success',
  quorum_lost: 'error',
  vote_started: 'orange',
  vote_closed: 'blue',
  presentation_started: 'purple',
  presentation_ended: 'default',
  meeting_ended: 'success',

  // Post-Meeting Phase
  minutes_created: 'cyan',
  minutes_approved: 'success',
  action_item_created: 'blue',
  action_item_completed: 'success',
  resolution_passed: 'green',
  follow_up_scheduled: 'cyan',
  archived: 'default',

  // Terminal
  meeting_cancelled: 'error',
};

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  regular: 'Regular Meeting',
  special: 'Special Meeting',
  agm: 'Annual General Meeting',
  emergency: 'Emergency Meeting',
  committee: 'Committee Meeting',
};

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  virtual: 'Virtual',
  physical: 'Physical',
  hybrid: 'Hybrid',
};

export const RSVP_STATUS_LABELS: Record<RSVPStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  tentative: 'Tentative',
  noresponse: 'No Response',
};

export const RSVP_STATUS_COLORS: Record<RSVPStatus, string> = {
  pending: 'processing',
  accepted: 'success',
  declined: 'error',
  tentative: 'warning',
  noresponse: 'default',
};

// Default meeting duration by type (in minutes)
export const DEFAULT_MEETING_DURATIONS: Record<MeetingType, number> = {
  regular: 180,      // 3 hours
  special: 120,      // 2 hours
  agm: 240,          // 4 hours
  emergency: 90,     // 1.5 hours
  committee: 120,    // 2 hours
};

// Confirmation event type labels
export const CONFIRMATION_EVENT_LABELS: Record<ConfirmationEventType, string> = {
  submitted: 'Submitted for Confirmation',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  superseded: 'Superseded',
  resubmitted: 'Resubmitted',
};

export const CONFIRMATION_EVENT_COLORS: Record<ConfirmationEventType, string> = {
  submitted: 'blue',
  confirmed: 'success',
  rejected: 'error',
  superseded: 'default',
  resubmitted: 'warning',
};

// Rejection reason labels
export const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  incomplete_information: 'Incomplete Information',
  scheduling_conflict: 'Scheduling Conflict',
  agenda_not_approved: 'Agenda Not Approved',
  quorum_concerns: 'Quorum Concerns',
  other: 'Other',
};
