/**
 * Board Settings Table - Configuration for each board
 */

export interface BoardSettingsRow {
  boardId: string;
  quorumPercentage: number;
  meetingFrequency: 'monthly' | 'quarterly' | 'bi_monthly' | 'as_needed';
  votingThreshold: 'simple_majority' | 'two_thirds' | 'three_quarters' | 'unanimous';
  confirmationRequired: boolean;
  designatedApproverRole: string | null;
  minMeetingsPerYear: number;
  allowVirtualMeetings: boolean;
  requireAttendanceTracking: boolean;
}

// ============================================================================
// BOARD SETTINGS TABLE DATA
// ============================================================================

export const boardSettingsTable: BoardSettingsRow[] = [
  // Main Board
  {
    boardId: 'ktda-ms',
    quorumPercentage: 50,
    meetingFrequency: 'quarterly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    designatedApproverRole: 'company_secretary',
    minMeetingsPerYear: 4,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },

  // Committees
  {
    boardId: 'comm-audit',
    quorumPercentage: 50,
    meetingFrequency: 'quarterly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    designatedApproverRole: 'committee_chair',
    minMeetingsPerYear: 4,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },
  {
    boardId: 'comm-hr',
    quorumPercentage: 50,
    meetingFrequency: 'quarterly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    designatedApproverRole: 'committee_chair',
    minMeetingsPerYear: 4,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },
  {
    boardId: 'comm-finance',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    designatedApproverRole: 'committee_chair',
    minMeetingsPerYear: 6,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },
  {
    boardId: 'comm-nomination',
    quorumPercentage: 50,
    meetingFrequency: 'quarterly',
    votingThreshold: 'two_thirds',
    confirmationRequired: true,
    designatedApproverRole: 'chairman',
    minMeetingsPerYear: 2,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },

  // Subsidiaries (default settings)
  {
    boardId: 'ketepa',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    designatedApproverRole: 'company_secretary',
    minMeetingsPerYear: 12,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },
  {
    boardId: 'temec',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    designatedApproverRole: 'company_secretary',
    minMeetingsPerYear: 12,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },
  {
    boardId: 'chai-trading',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    designatedApproverRole: 'company_secretary',
    minMeetingsPerYear: 12,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },
];
