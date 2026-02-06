/**
 * Meetings Table - Status + SubStatus Model
 * Stores meeting records across all boards with new lifecycle statuses
 */

export type MeetingType = 'regular' | 'special' | 'emergency' | 'agm' | 'committee';
export type LocationType = 'physical' | 'virtual' | 'hybrid';

// Status + SubStatus Model (5 primary statuses)
export type MeetingStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type DraftSubStatus = 'incomplete' | 'complete';
export type ScheduledSubStatus = 'pending_approval' | 'approved' | 'rejected';
export type CompletedSubStatus = 'recent' | 'archived';

export interface MeetingOverrides {
  skipAgenda?: boolean;
  skipDocuments?: boolean;
  skipApproval?: boolean;
  customMinParticipants?: number;
}

export interface MeetingRow {
  id: string;
  boardId: string;

  // Basic info
  title: string;
  description: string;
  meetingType: MeetingType;

  // Scheduling
  scheduledDate: string; // ISO date
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes
  timezone: string;

  // Location
  locationType: LocationType;
  physicalLocation: string | null;
  meetingLink: string | null;

  // Status + SubStatus Model
  status: MeetingStatus;
  subStatus: string | null; // Contextual: incomplete/complete, pending_approval/approved/rejected, recent/archived
  statusUpdatedAt: string;

  // Validation overrides (for special circumstances)
  overrides: MeetingOverrides | null;
  overrideReason: string | null;

  // Quorum settings
  quorumPercentage: number;
  quorumRequired: number; // calculated absolute number
  requiresConfirmation: boolean;

  // Metadata
  createdBy: number; // userId
  createdAt: string;
  updatedAt: string;
  cancelledBy: number | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

// ============================================================================
// MEETINGS TABLE DATA - Status + SubStatus Test Coverage
// 9 test meetings covering all status+substatus combinations
// ============================================================================

export const meetingsTable: MeetingRow[] = [
  // ========================================================================
  // MTG-001: draft.incomplete - Missing required validations
  // ========================================================================
  {
    id: 'MTG-001',
    boardId: 'ktda-ms',
    title: 'Q1 2026 Strategic Planning',
    description: 'Quarterly board meeting - work in progress',
    meetingType: 'regular',
    scheduledDate: '2026-03-15',
    startTime: '09:00',
    endTime: '13:00',
    duration: 240,
    timezone: 'Africa/Nairobi',
    locationType: 'hybrid',
    physicalLocation: 'KTDA Head Office, Nairobi - Board Room',
    meetingLink: 'https://meet.ktda.co.ke/q1-2026',
    status: 'draft',
    subStatus: 'incomplete',
    statusUpdatedAt: '2026-02-01T08:00:00Z',
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 8,
    requiresConfirmation: true,
    createdBy: 17, // Group Company Secretary
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-01T08:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-002: draft.complete - All validations passed, ready for approval
  // ========================================================================
  {
    id: 'MTG-002',
    boardId: 'ktda-ms',
    title: 'Annual Budget Approval 2026',
    description: 'Review and approve annual budget for fiscal year 2026',
    meetingType: 'special',
    scheduledDate: '2026-03-20',
    startTime: '10:00',
    endTime: '14:00',
    duration: 240,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'KTDA Head Office, Nairobi - Board Room',
    meetingLink: null,
    status: 'draft',
    subStatus: 'complete',
    statusUpdatedAt: '2026-02-10T14:30:00Z',
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 8,
    requiresConfirmation: true,
    createdBy: 17,
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-003: scheduled.pending_approval - Awaiting confirmation signature
  // ========================================================================
  {
    id: 'MTG-003',
    boardId: 'comm-audit',
    title: 'Audit Committee Q1 Review',
    description: 'Quarterly audit review and compliance assessment',
    meetingType: 'committee',
    scheduledDate: '2026-03-25',
    startTime: '14:00',
    endTime: '16:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/audit-q1',
    status: 'scheduled',
    subStatus: 'pending_approval',
    statusUpdatedAt: '2026-02-15T10:00:00Z',
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 3,
    requiresConfirmation: true,
    createdBy: 18, // Isaac Chege (Board Secretary)
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-004: scheduled.approved - Confirmed and ready to start
  // ========================================================================
  {
    id: 'MTG-004',
    boardId: 'ketepa',
    title: 'KETEPA Board - Market Expansion Strategy',
    description: 'Strategic planning for export market expansion',
    meetingType: 'regular',
    scheduledDate: '2026-04-10',
    startTime: '10:00',
    endTime: '13:00',
    duration: 180,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'KETEPA Office, Nairobi - Board Room',
    meetingLink: null,
    status: 'scheduled',
    subStatus: 'approved',
    statusUpdatedAt: '2026-03-01T11:15:00Z',
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 4,
    requiresConfirmation: true,
    createdBy: 19, // Jane Njeri (Board Secretary)
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-03-01T11:15:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-005: scheduled.rejected - Rejected by approver, needs revision
  // ========================================================================
  {
    id: 'MTG-005',
    boardId: 'comm-hr',
    title: 'HR Committee - Compensation Review',
    description: 'Annual review of executive compensation and benefits - Rejected due to incomplete supporting documents',
    meetingType: 'committee',
    scheduledDate: '2026-04-15',
    startTime: '14:00',
    endTime: '16:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'hybrid',
    physicalLocation: 'KTDA Head Office - Conference Room 2',
    meetingLink: 'https://meet.ktda.co.ke/hr-comp-q2',
    status: 'scheduled',
    subStatus: 'rejected',
    statusUpdatedAt: '2026-03-05T09:20:00Z',
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 4,
    requiresConfirmation: true,
    createdBy: 19, // Jane Njeri (Board Secretary)
    createdAt: '2026-02-25T09:00:00Z',
    updatedAt: '2026-03-05T09:20:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-006: in_progress - Meeting currently happening
  // ========================================================================
  {
    id: 'MTG-006',
    boardId: 'ktda-ms',
    title: 'Emergency Board Meeting - Market Response',
    description: 'Emergency meeting to discuss market conditions and strategic response - Currently in progress',
    meetingType: 'emergency',
    scheduledDate: '2026-02-04',
    startTime: '14:00',
    endTime: '16:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/emergency-feb-2026',
    status: 'in_progress',
    subStatus: null, // in_progress has no substatus
    statusUpdatedAt: '2026-02-04T14:00:00Z',
    overrides: {
      skipApproval: true, // Emergency meetings skip approval
    },
    overrideReason: 'Emergency meeting - requires immediate action',
    quorumPercentage: 50,
    quorumRequired: 8,
    requiresConfirmation: false, // Emergency meetings skip confirmation
    createdBy: 17,
    createdAt: '2026-02-04T10:00:00Z',
    updatedAt: '2026-02-04T14:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-007: completed.recent - Meeting ended, active post-meeting work
  // ========================================================================
  {
    id: 'MTG-007',
    boardId: 'ketepa',
    title: 'KETEPA Monthly Board Meeting - January 2026',
    description: 'Monthly board meeting to review operations and sales performance',
    meetingType: 'regular',
    scheduledDate: '2026-01-20',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'KETEPA Office, Nairobi - Board Room',
    meetingLink: null,
    status: 'completed',
    subStatus: 'recent',
    statusUpdatedAt: '2026-01-20T12:00:00Z',
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 4,
    requiresConfirmation: true,
    createdBy: 19,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-20T12:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-008: completed.archived - Historical meeting, read-only
  // ========================================================================
  {
    id: 'MTG-008',
    boardId: 'chai-trading',
    title: 'Chai Trading Board - Q4 2025 Review',
    description: 'Quarterly review of tea exports and trading performance - Archived historical record',
    meetingType: 'regular',
    scheduledDate: '2025-10-15',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'Chai Trading Office, Mombasa - Board Room',
    meetingLink: null,
    status: 'completed',
    subStatus: 'archived',
    statusUpdatedAt: '2025-11-15T00:00:00Z', // Auto-archived 30 days after meeting
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 4,
    requiresConfirmation: true,
    createdBy: 18,
    createdAt: '2025-09-20T08:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // MTG-009: cancelled - Terminal state, meeting was cancelled
  // ========================================================================
  {
    id: 'MTG-009',
    boardId: 'comm-finance',
    title: 'Finance Committee - Special Budget Review (CANCELLED)',
    description: 'Special meeting to review budget allocations - Cancelled due to lack of quorum confirmations',
    meetingType: 'committee',
    scheduledDate: '2026-03-10',
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/finance-special',
    status: 'cancelled',
    subStatus: null, // cancelled has no substatus
    statusUpdatedAt: '2026-03-08T16:00:00Z',
    overrides: null,
    overrideReason: null,
    quorumPercentage: 50,
    quorumRequired: 3,
    requiresConfirmation: true,
    createdBy: 18,
    createdAt: '2026-02-20T08:00:00Z',
    updatedAt: '2026-03-08T16:00:00Z',
    cancelledBy: 17,
    cancelledAt: '2026-03-08T16:00:00Z',
    cancellationReason: 'Insufficient quorum confirmations received. Only 2 of 6 participants confirmed attendance. Meeting will be rescheduled.',
  },
];
    