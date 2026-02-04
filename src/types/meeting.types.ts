/**
 * Meeting Types
 * Zod schemas and TypeScript types for meeting management
 * Based on board-centric architecture (boardId instead of orgId)
 */

import { z } from 'zod';
import { BoardTypeSchema, BoardRoleSchema } from './board.types';

// ============================================================================
// ENUMS
// ============================================================================

export const MeetingStatusSchema = z.enum([
  'draft',
  'pending_confirmation',
  'confirmed',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
]);

export const MeetingTypeSchema = z.enum([
  'regular',      // Regular board meeting
  'special',      // Special board meeting
  'agm',          // Annual General Meeting
  'emergency',    // Emergency meeting
  'committee',    // Committee meeting
]);

export const LocationTypeSchema = z.enum([
  'virtual',
  'physical',
  'hybrid',
]);

export const RSVPStatusSchema = z.enum([
  'accepted',
  'declined',
  'tentative',
  'no_response',
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

// Meeting participant (board member + RSVP status)
export const MeetingParticipantSchema = z.object({
  id: z.string(),
  userId: z.union([z.string(), z.number()]),
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  boardRole: BoardRoleSchema, // From board membership
  rsvpStatus: RSVPStatusSchema.default('no_response'),
  isGuest: z.boolean().default(false),

  // For guests/presenters
  guestRole: z.string().optional(),
  timeSlotStart: z.string().optional(),
  timeSlotEnd: z.string().optional(),
  presentationTopic: z.string().optional(),
  canViewDocuments: z.boolean().default(false),
  canShareScreen: z.boolean().default(true),
  receiveMinutes: z.boolean().default(false),
});

// Recurrence pattern (optional)
export const RecurrencePatternSchema = z.object({
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']),
  interval: z.number().default(1),
  endDate: z.string().optional(),
  occurrences: z.number().optional(),
  excludeDates: z.array(z.string()).optional(),
});

// Meeting confirmation history event
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
  id: z.string(),

  // Board Association (board-centric architecture)
  boardId: z.string(),
  boardName: z.string(),
  boardType: BoardTypeSchema,
  parentBoardId: z.string().optional(), // If committee, parent board id
  parentBoardName: z.string().optional(), // If committee, parent board name

  // Basic Info
  title: z.string(),
  description: z.string().optional(),
  meetingType: MeetingTypeSchema,

  // Schedule
  startDate: z.string(), // ISO date (YYYY-MM-DD)
  startTime: z.string(), // HH:mm format
  duration: z.number(), // minutes
  endDateTime: z.string(), // calculated ISO datetime
  timezone: z.string().default('Africa/Nairobi'),

  // Location
  locationType: LocationTypeSchema,
  locationDetails: z.string().optional(),
  virtualMeetingLink: z.string().optional(),
  physicalAddress: z.string().optional(),

  // Participants
  participants: z.array(MeetingParticipantSchema),
  quorumPercentage: z.number().min(0).max(100),
  quorumRequired: z.number(), // calculated number of people
  expectedAttendees: z.number(),

  // Confirmation
  requiresConfirmation: z.boolean(),
  confirmationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  confirmedBy: z.string().optional(), // User ID
  confirmedByName: z.string().optional(),
  confirmedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  confirmationDocumentUrl: z.string().optional(),

  // Status
  status: MeetingStatusSchema,

  // Recurrence
  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.optional(),
  recurrenceGroupId: z.string().optional(), // Group ID for series

  // Metadata
  createdBy: z.string(),
  createdByName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  cancelledAt: z.string().optional(),
  cancellationReason: z.string().optional(),
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
  id: z.string(),
  boardId: z.string(),
  boardName: z.string(),
  boardType: BoardTypeSchema,
  parentBoardName: z.string().optional(), // For committees
  title: z.string(),
  meetingType: MeetingTypeSchema,
  startDate: z.string(),
  startTime: z.string(),
  duration: z.number(),
  locationType: LocationTypeSchema,
  physicalLocation: z.string().nullable().optional(), // Physical location address
  meetingLink: z.string().nullable().optional(), // Virtual meeting link
  status: MeetingStatusSchema,
  participantCount: z.number(),
  expectedAttendees: z.number(), // Total expected participants
  quorumPercentage: z.number(),
  quorumRequired: z.number(), // Calculated quorum number
  requiresConfirmation: z.boolean(),
  confirmationStatus: z.string().optional(),
  createdByName: z.string(),
  createdAt: z.string(),
  // Board Pack status for quick overview
  boardPackStatus: BoardPackStatusSchema.optional(),
});

// ============================================================================
// API PAYLOADS
// ============================================================================

export const CreateMeetingPayloadSchema = z.object({
  boardId: z.string().min(1, 'Board is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  meetingType: MeetingTypeSchema,
  startDate: z.string(),
  startTime: z.string(),
  duration: z.number().min(15).max(480),
  locationType: LocationTypeSchema,
  locationDetails: z.string().optional(),
  virtualMeetingLink: z.string().optional(),
  physicalAddress: z.string().optional(),
  quorumPercentage: z.number().min(0).max(100).optional(),

  // Participants auto-populated from board members
  // Guests added separately via addGuest endpoint

  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.optional(),
});

export const UpdateMeetingPayloadSchema = CreateMeetingPayloadSchema.partial().extend({
  // Can't change boardId after creation
  boardId: z.undefined(),
  status: MeetingStatusSchema.optional(),
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
  boardId?: string; // Filter by specific board
  boardIds?: string[]; // Filter by multiple boards (for chairman)
  boardType?: string; // main, subsidiary, factory, committee
  includeCommittees?: boolean; // Include committee meetings of this board
  committeeId?: string; // Filter by specific committee

  // Status & Type
  search?: string;
  status?: string | string[];
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
export type MeetingType = z.infer<typeof MeetingTypeSchema>;
export type LocationType = z.infer<typeof LocationTypeSchema>;
export type RSVPStatus = z.infer<typeof RSVPStatusSchema>;
export type ConfirmationEventType = z.infer<typeof ConfirmationEventTypeSchema>;
export type RejectionReason = z.infer<typeof RejectionReasonSchema>;
export type MeetingParticipant = z.infer<typeof MeetingParticipantSchema>;
export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>;
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

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  draft: 'Draft',
  pending_confirmation: 'Pending Confirmation',
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export const MEETING_STATUS_COLORS: Record<MeetingStatus, string> = {
  draft: 'default',
  pending_confirmation: 'warning',
  confirmed: 'blue',
  scheduled: 'cyan',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
  rejected: 'error',
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
  accepted: 'Accepted',
  declined: 'Declined',
  tentative: 'Tentative',
  no_response: 'No Response',
};

export const RSVP_STATUS_COLORS: Record<RSVPStatus, string> = {
  accepted: 'success',
  declined: 'error',
  tentative: 'warning',
  no_response: 'default',
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
