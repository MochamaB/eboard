/**
 * Board Settings Table - Configuration for each board
 */

export interface BoardSettingsRow {
  boardId: string;
  quorumPercentage: number;
  meetingFrequency: 'monthly' | 'quarterly' | 'bi_monthly' | 'as_needed';
  votingThreshold: 'simple_majority' | 'two_thirds' | 'three_quarters' | 'unanimous';
  
  // Confirmation workflow settings
  confirmationRequired: boolean;
  approverRoleId: number;  // FK to roles table - which role can approve meetings for this board
  
  minMeetingsPerYear: number;
  allowVirtualMeetings: boolean;
  requireAttendanceTracking: boolean;
}

// ============================================================================
// BOARD SETTINGS TABLE DATA
// ============================================================================

export const boardSettingsTable: BoardSettingsRow[] = [
  // Main Board - requires Group Company Secretary approval (roleId: 3)
  {
    boardId: 'ktda-ms',
    quorumPercentage: 50,
    meetingFrequency: 'quarterly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    approverRoleId: 3,  // group_company_secretary
    minMeetingsPerYear: 4,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },

  // Committees - require Company Secretary approval (roleId: 13)
  {
    boardId: 'comm-audit',
    quorumPercentage: 50,
    meetingFrequency: 'quarterly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    approverRoleId: 3,  // group_company_secretary
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
    approverRoleId: 3,  // group_company_secretary
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
    approverRoleId: 3,  // group_company_secretary
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
    approverRoleId: 3,  // group_company_secretary
    minMeetingsPerYear: 2,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },

  // Subsidiaries - require Company Secretary approval (roleId: 13)
  {
    boardId: 'ketepa',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: true,
    approverRoleId: 3,  // group_company_secretary
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
    approverRoleId: 3,  // group_company_secretary
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
    approverRoleId: 3,  // group_company_secretary
    minMeetingsPerYear: 12,
    allowVirtualMeetings: true,
    requireAttendanceTracking: true,
  },

  // Factories - confirmation optional, but if required, Board Secretary can approve (roleId: 6)
  {
    boardId: 'factory-chebut',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: false,
    approverRoleId: 3,  // group_company_secretary (if confirmation ever required)
    minMeetingsPerYear: 12,
    allowVirtualMeetings: false,
    requireAttendanceTracking: true,
  },
  {
    boardId: 'factory-kapkatet',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: false,
    approverRoleId: 3,  // group_company_secretary
    minMeetingsPerYear: 12,
    allowVirtualMeetings: false,
    requireAttendanceTracking: true,
  },
  {
    boardId: 'factory-litein',
    quorumPercentage: 50,
    meetingFrequency: 'monthly',
    votingThreshold: 'simple_majority',
    confirmationRequired: false,
    approverRoleId: 3,  // group_company_secretary
    minMeetingsPerYear: 12,
    allowVirtualMeetings: false,
    requireAttendanceTracking: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get board settings by board ID
 */
export const getBoardSettingsById = (boardId: string): BoardSettingsRow | undefined => {
  return boardSettingsTable.find(s => s.boardId === boardId);
};

/**
 * Check if a board requires meeting confirmation
 */
export const boardRequiresConfirmation = (boardId: string): boolean => {
  const settings = getBoardSettingsById(boardId);
  return settings?.confirmationRequired ?? true; // Default to true for safety
};

/**
 * Get the approver role ID for a board
 */
export const getBoardApproverRoleId = (boardId: string): number | null => {
  const settings = getBoardSettingsById(boardId);
  return settings?.approverRoleId ?? null;
};
