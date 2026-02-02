/**
 * Meetings Table - Flat database-like structure
 * Stores meeting records across all boards
 */

export type MeetingType = 'regular' | 'special' | 'emergency' | 'annual' | 'committee';
export type LocationType = 'physical' | 'virtual' | 'hybrid';
export type MeetingStatus =
  | 'draft'
  | 'pending_confirmation'
  | 'confirmed'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

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

  // Workflow status
  // Note: Confirmation details (confirmedBy, confirmedAt, documents) are now
  // derived from MeetingConfirmationHistoryRow - single source of truth
  status: MeetingStatus;

  // Quorum settings
  quorumPercentage: number;
  quorumRequired: number; // calculated absolute number

  // Metadata
  createdBy: number; // userId
  createdAt: string;
  updatedAt: string;
  cancelledBy: number | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

// ============================================================================
// MEETINGS TABLE DATA
// ============================================================================

export const meetingsTable: MeetingRow[] = [
  // ========================================================================
  // MAIN BOARD MEETINGS (ktda-ms)
  // ========================================================================
  {
    id: 'mtg-001',
    boardId: 'ktda-ms',
    title: 'Q1 2026 Board Meeting',
    description: 'Quarterly board meeting to review Q4 2025 performance and approve Q1 2026 budget',
    meetingType: 'regular',
    scheduledDate: '2026-01-28',
    startTime: '09:00',
    endTime: '13:00',
    duration: 240,
    timezone: 'Africa/Nairobi',
    locationType: 'hybrid',
    physicalLocation: 'KTDA Head Office, Nairobi - Board Room',
    meetingLink: 'https://meet.ktda.co.ke/board-q1-2026',
    status: 'scheduled', // Confirmed via MeetingConfirmationHistory
    quorumPercentage: 50,
    quorumRequired: 8,
    createdBy: 17,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-002',
    boardId: 'ktda-ms',
    title: 'Emergency Strategy Meeting',
    description: 'Emergency meeting to discuss market conditions and strategic response',
    meetingType: 'emergency', // Emergency meetings skip confirmation
    scheduledDate: '2026-01-15',
    startTime: '14:00',
    endTime: '16:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/emergency-jan-2026',
    status: 'completed',
    quorumPercentage: 50,
    quorumRequired: 8,
    createdBy: 17,
    createdAt: '2026-01-14T09:00:00Z',
    updatedAt: '2026-01-15T16:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-003',
    boardId: 'ktda-ms',
    title: 'Budget Review Meeting',
    description: 'Review and finalize 2026 annual budget',
    meetingType: 'special',
    scheduledDate: '2026-01-22',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'hybrid',
    physicalLocation: 'KTDA Head Office, Nairobi - Board Room',
    meetingLink: 'https://meet.ktda.co.ke/budget-2026',
    status: 'pending_confirmation', // Awaiting approval in MeetingConfirmationHistory
    quorumPercentage: 50,
    quorumRequired: 8,
    createdBy: 17,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // COMMITTEE MEETINGS
  // ========================================================================
  {
    id: 'mtg-004',
    boardId: 'comm-audit',
    title: 'Audit Committee - Q1 2026 Review',
    description: 'Review of Q4 2025 audit findings and 2026 audit plan',
    meetingType: 'committee',
    scheduledDate: '2026-01-20',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/audit-q1-2026',
    status: 'scheduled', // Confirmed via MeetingConfirmationHistory
    quorumPercentage: 50,
    quorumRequired: 3,
    createdBy: 18, // Isaac Chege (Board Secretary)
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-005',
    boardId: 'comm-hr',
    title: 'HR Committee - Compensation Review',
    description: 'Annual review of executive compensation and benefits',
    meetingType: 'committee',
    scheduledDate: '2026-01-30',
    startTime: '14:00',
    endTime: '16:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'hybrid',
    physicalLocation: 'KTDA Head Office - Conference Room 2',
    meetingLink: 'https://meet.ktda.co.ke/hr-comp-2026',
    status: 'pending_confirmation', // Awaiting approval in MeetingConfirmationHistory
    quorumPercentage: 50,
    quorumRequired: 4,
    createdBy: 19, // Jane Njeri (Board Secretary)
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-01-25T11:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-006',
    boardId: 'comm-finance',
    title: 'Finance Committee - January 2026',
    description: 'Monthly financial review and investment updates',
    meetingType: 'committee',
    scheduledDate: '2026-01-08',
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/finance-jan-2026',
    status: 'completed',
    quorumPercentage: 50,
    quorumRequired: 3,
    createdBy: 18,
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2025-01-12T11:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-007',
    boardId: 'comm-nomination',
    title: 'Nomination Committee - Director Selection',
    description: 'Review of candidates for Zone 3 director position',
    meetingType: 'committee',
    scheduledDate: '2026-02-05',
    startTime: '11:00',
    endTime: '13:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'KTDA Head Office - Executive Suite',
    meetingLink: null,
    status: 'pending_confirmation', // Resubmitted after rejection, awaiting Chairman approval
    quorumPercentage: 50,
    quorumRequired: 2,
    createdBy: 17,
    createdAt: '2025-01-20T08:00:00Z',
    updatedAt: '2025-01-26T08:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // SUBSIDIARY MEETINGS
  // ========================================================================
  {
    id: 'mtg-008',
    boardId: 'ketepa',
    title: 'KETEPA Board - January 2025',
    description: 'Monthly board meeting to review operations and sales performance',
    meetingType: 'regular',
    scheduledDate: '2025-01-20',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'KETEPA Office, Nairobi',
    meetingLink: null,
    status: 'completed',
    quorumPercentage: 50,
    quorumRequired: 4,
    createdBy: 18,
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-01-20T12:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-009',
    boardId: 'temec',
    title: 'TEMEC Board - February 2025',
    description: 'Monthly review of manufacturing operations and equipment orders',
    meetingType: 'regular',
    scheduledDate: '2025-02-18',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'hybrid',
    physicalLocation: 'TEMEC Factory, Thika',
    meetingLink: 'https://meet.ktda.co.ke/temec-feb-2025',
    status: 'scheduled',
    quorumPercentage: 50,
    quorumRequired: 4,
    createdBy: 19,
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-02-05T09:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-010',
    boardId: 'chai-trading',
    title: 'Chai Trading Board - January 2025',
    description: 'Monthly review of tea exports and trading performance',
    meetingType: 'regular',
    scheduledDate: '2025-01-22',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/chai-jan-2025',
    status: 'completed',
    quorumPercentage: 50,
    quorumRequired: 4,
    createdBy: 18,
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-01-22T12:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // FACTORY MEETINGS
  // ========================================================================
  {
    id: 'mtg-011',
    boardId: 'factory-chebut',
    title: 'Chebut Factory Board - January 2025',
    description: 'Monthly factory board meeting - production and farmer payments',
    meetingType: 'regular',
    scheduledDate: '2025-01-15',
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'Chebut Tea Factory - Board Room',
    meetingLink: null,
    status: 'completed', // Factory meetings - no confirmation required per BoardSettings
    quorumPercentage: 50,
    quorumRequired: 4,
    createdBy: 17,
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-01-15T11:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-012',
    boardId: 'factory-kapkatet',
    title: 'Kapkatet Factory Board - February 2025',
    description: 'Monthly factory board meeting - quality improvement initiatives',
    meetingType: 'regular',
    scheduledDate: '2025-02-10',
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'Kapkatet Tea Factory - Board Room',
    meetingLink: null,
    status: 'scheduled', // Factory meetings - no confirmation required per BoardSettings
    quorumPercentage: 50,
    quorumRequired: 3,
    createdBy: 17,
    createdAt: '2025-01-25T08:00:00Z',
    updatedAt: '2025-01-25T08:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-013',
    boardId: 'factory-litein',
    title: 'Litein Factory Board - January 2025',
    description: 'Monthly factory board meeting - new equipment installation',
    meetingType: 'regular',
    scheduledDate: '2025-01-20',
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'Litein Tea Factory - Board Room',
    meetingLink: null,
    status: 'completed', // Factory meetings - no confirmation required per BoardSettings
    quorumPercentage: 50,
    quorumRequired: 4,
    createdBy: 17,
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-01-20T11:30:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // SPECIAL & EMERGENCY MEETINGS
  // ========================================================================
  {
    id: 'mtg-014',
    boardId: 'ktda-ms',
    title: 'Emergency Board Meeting - Market Price Crisis',
    description: 'Emergency meeting to address sudden drop in global tea prices',
    meetingType: 'emergency', // Emergency meetings skip confirmation per business rules
    scheduledDate: '2025-02-28',
    startTime: '15:00',
    endTime: '17:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/emergency-feb-2025',
    status: 'scheduled',
    quorumPercentage: 50,
    quorumRequired: 8,
    createdBy: 17,
    createdAt: '2025-02-27T16:00:00Z',
    updatedAt: '2025-02-27T16:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-015',
    boardId: 'ketepa',
    title: 'Special Board Meeting - New Market Expansion',
    description: 'Special meeting to approve expansion into East African markets',
    meetingType: 'special',
    scheduledDate: '2025-03-25',
    startTime: '10:00',
    endTime: '14:00',
    duration: 240,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'KETEPA Office, Nairobi - Board Room',
    meetingLink: null,
    status: 'pending_confirmation', // Awaiting approval in MeetingConfirmationHistory
    quorumPercentage: 50,
    quorumRequired: 4,
    createdBy: 18,
    createdAt: '2025-02-15T08:00:00Z',
    updatedAt: '2025-02-15T08:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },

  // ========================================================================
  // CANCELLED & REJECTED MEETINGS (for testing workflows)
  // ========================================================================
  {
    id: 'mtg-016',
    boardId: 'comm-finance',
    title: 'Finance Committee - December 2024 (CANCELLED)',
    description: 'Monthly financial review - cancelled due to quorum issues',
    meetingType: 'committee',
    scheduledDate: '2024-12-20',
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'virtual',
    physicalLocation: null,
    meetingLink: 'https://meet.ktda.co.ke/finance-dec-2024',
    status: 'cancelled', // Was confirmed but later cancelled
    quorumPercentage: 50,
    quorumRequired: 3,
    createdBy: 18,
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-18T10:00:00Z',
    cancelledBy: 17,
    cancelledAt: '2024-12-18T10:00:00Z',
    cancellationReason: 'Insufficient attendance confirmations. Meeting rescheduled to January.',
  },
  {
    id: 'mtg-017',
    boardId: 'ktda-ms',
    title: 'Board Meeting - Proposed Merger (REJECTED)',
    description: 'Special meeting to discuss proposed merger - rejected by company secretary',
    meetingType: 'special',
    scheduledDate: '2025-04-10',
    startTime: '10:00',
    endTime: '14:00',
    duration: 240,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'KTDA Head Office - Board Room',
    meetingLink: null,
    status: 'rejected', // Rejection details in MeetingConfirmationHistory
    quorumPercentage: 50,
    quorumRequired: 8,
    createdBy: 17,
    createdAt: '2025-01-25T08:00:00Z',
    updatedAt: '2025-01-28T10:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
  {
    id: 'mtg-018',
    boardId: 'ktda-ms',
    title: 'KTDA Safety and Health Committee Meeting',
    description: 'Quarterly safety and health committee meeting with comprehensive nested agenda',
    meetingType: 'committee',
    scheduledDate: '2025-10-16',
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    timezone: 'Africa/Nairobi',
    locationType: 'physical',
    physicalLocation: 'Main Boardroom, KTDA Head Office',
    meetingLink: null,
    status: 'scheduled',
    quorumPercentage: 50,
    quorumRequired: 3,
    createdBy: 17,
    createdAt: '2025-09-20T08:00:00Z',
    updatedAt: '2025-09-25T10:00:00Z',
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
  },
];
