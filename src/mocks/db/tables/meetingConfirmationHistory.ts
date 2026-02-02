/**
 * Meeting Confirmation History Table
 * Audit trail for meeting confirmation workflow events
 */

export type ConfirmationEventType = 
  | 'submitted'      // Secretary submits meeting for confirmation
  | 'confirmed'      // Approver signs and confirms meeting
  | 'rejected'       // Approver rejects with reason
  | 'superseded'     // Previous confirmation invalidated due to meeting changes
  | 'resubmitted';   // Secretary resubmits after rejection or changes

export type RejectionReason = 
  | 'incomplete_information'
  | 'scheduling_conflict'
  | 'agenda_not_approved'
  | 'quorum_concerns'
  | 'other';

export interface MeetingConfirmationHistoryRow {
  id: string;
  meetingId: string;

  // Event type
  eventType: ConfirmationEventType;

  // Actor
  performedBy: number; // userId who performed this action
  performedAt: string;

  // Submission details (for 'submitted' and 'resubmitted' events)
  submissionNotes: string | null;

  // Confirmation details (for 'confirmed' events)
  signatureId: string | null;  // Reference to digital signature record
  signatureImageUrl: string | null; // Base64 data URL of drawn signature

  // Rejection details (for 'rejected' events)
  rejectionReason: RejectionReason | null;
  rejectionComments: string | null;

  // Documents - generated at each stage
  unsignedDocumentId: string | null;   // Draft PDF before signing
  unsignedDocumentUrl: string | null;  // Mock URL for download
  signedDocumentId: string | null;     // Signed PDF after confirmation
  signedDocumentUrl: string | null;    // Mock URL for download

  // Metadata
  createdAt: string;
}

// ============================================================================
// MEETING CONFIRMATION HISTORY TABLE DATA
// ============================================================================

export const meetingConfirmationHistoryTable: MeetingConfirmationHistoryRow[] = [
  // ========================================================================
  // mtg-001: Q1 2026 Board Meeting - CONFIRMED
  // Submitted by Board Secretary (17), Confirmed by Group Company Secretary (17)
  // ========================================================================
  {
    id: 'conf-hist-001',
    meetingId: 'mtg-001',
    eventType: 'submitted',
    performedBy: 17, // Kenneth Muhia (Board Secretary submitting)
    performedAt: '2026-01-10T09:00:00Z',
    submissionNotes: 'Meeting details finalized. Agenda attached.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-001-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-001-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'conf-hist-002',
    meetingId: 'mtg-001',
    eventType: 'confirmed',
    performedBy: 3, // Mathews Odero (Group Company Secretary - approver for main board)
    performedAt: '2026-01-15T10:30:00Z',
    submissionNotes: null,
    signatureId: 'sig-001',
    signatureImageUrl: null, // Would contain base64 signature image in real scenario
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-001-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-001-unsigned/download',
    signedDocumentId: 'doc-conf-001-signed',
    signedDocumentUrl: '/api/documents/doc-conf-001-signed/download',
    createdAt: '2026-01-15T10:30:00Z',
  },

  // ========================================================================
  // mtg-002: Emergency Board Meeting - NO CONFIRMATION REQUIRED
  // Emergency meetings skip confirmation workflow per business rules
  // ========================================================================

  // ========================================================================
  // mtg-003: Budget Review Meeting - PENDING CONFIRMATION
  // Submitted by Board Secretary, awaiting Group Company Secretary approval
  // ========================================================================
  {
    id: 'conf-hist-003',
    meetingId: 'mtg-003',
    eventType: 'submitted',
    performedBy: 17, // Kenneth Muhia (Board Secretary)
    performedAt: '2026-01-20T11:00:00Z',
    submissionNotes: 'Budget review meeting scheduled. All financial documents attached.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-003-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-003-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2026-01-20T11:00:00Z',
  },

  // ========================================================================
  // mtg-004: Audit Committee Q1 2026 - CONFIRMED
  // Submitted by Board Secretary (18), Confirmed by Company Secretary (17)
  // ========================================================================
  {
    id: 'conf-hist-004',
    meetingId: 'mtg-004',
    eventType: 'submitted',
    performedBy: 18, // Isaac Chege (Board Secretary)
    performedAt: '2026-01-08T09:00:00Z',
    submissionNotes: 'Audit Committee Q1 2026 meeting - Q4 2025 audit findings review.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-004-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-004-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2026-01-08T09:00:00Z',
  },
  {
    id: 'conf-hist-005',
    meetingId: 'mtg-004',
    eventType: 'confirmed',
    performedBy: 3, // Mathews Odero (Company Secretary)
    performedAt: '2026-01-10T09:00:00Z',
    submissionNotes: null,
    signatureId: 'sig-004',
    signatureImageUrl: null, // Would contain base64 signature image in real scenario
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-004-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-004-unsigned/download',
    signedDocumentId: 'doc-conf-004-signed',
    signedDocumentUrl: '/api/documents/doc-conf-004-signed/download',
    createdAt: '2026-01-10T09:00:00Z',
  },

  // ========================================================================
  // mtg-005: HR Committee Meeting - PENDING CONFIRMATION
  // Submitted by HR Committee Secretary, awaiting Company Secretary approval
  // ========================================================================
  {
    id: 'conf-hist-006',
    meetingId: 'mtg-005',
    eventType: 'submitted',
    performedBy: 19, // Jane Njeri (HR Committee Secretary)
    performedAt: '2026-01-25T11:00:00Z',
    submissionNotes: 'HR Committee meeting to review executive compensation.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-005-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-005-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2026-01-25T11:00:00Z',
  },

  // ========================================================================
  // mtg-007: Nomination Committee - REJECTED then RESUBMITTED (PENDING)
  // Shows full rejection and resubmission workflow
  // ========================================================================
  {
    id: 'conf-hist-007',
    meetingId: 'mtg-007',
    eventType: 'submitted',
    performedBy: 17, // Kenneth Muhia (Board Secretary)
    performedAt: '2026-01-22T10:00:00Z',
    submissionNotes: 'Nomination Committee meeting for Zone 3 director selection.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-007-v1-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-007-v1-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'conf-hist-008',
    meetingId: 'mtg-007',
    eventType: 'rejected',
    performedBy: 3, // Mathews Odero (Group Company Secretary) - approver for nomination committee
    performedAt: '2026-01-23T09:00:00Z',
    submissionNotes: null,
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: 'incomplete_information',
    rejectionComments: 'Please include candidate CVs and background check reports.',
    unsignedDocumentId: 'doc-conf-007-v1-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-007-v1-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2026-01-23T09:00:00Z',
  },
  {
    id: 'conf-hist-009',
    meetingId: 'mtg-007',
    eventType: 'resubmitted',
    performedBy: 17, // Kenneth Muhia (Board Secretary)
    performedAt: '2026-01-26T08:30:00Z',
    submissionNotes: 'Added candidate CVs and background check reports as requested.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-007-v2-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-007-v2-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2026-01-26T08:30:00Z',
  },

  // ========================================================================
  // mtg-015: KETEPA Special Board Meeting - PENDING CONFIRMATION
  // Submitted by Board Secretary, awaiting Company Secretary approval
  // ========================================================================
  {
    id: 'conf-hist-010',
    meetingId: 'mtg-015',
    eventType: 'submitted',
    performedBy: 18, // Isaac Chege (Board Secretary)
    performedAt: '2025-02-15T10:00:00Z',
    submissionNotes: 'Special meeting for East African market expansion approval.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-015-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-015-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2025-02-15T10:00:00Z',
  },

  // ========================================================================
  // mtg-017: Board Meeting Proposed Merger - REJECTED
  // Shows a permanently rejected meeting
  // ========================================================================
  {
    id: 'conf-hist-011',
    meetingId: 'mtg-017',
    eventType: 'submitted',
    performedBy: 17, // Kenneth Muhia (Board Secretary)
    performedAt: '2025-01-25T09:00:00Z',
    submissionNotes: 'Special meeting to discuss proposed merger.',
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: 'doc-conf-017-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-017-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2025-01-25T09:00:00Z',
  },
  {
    id: 'conf-hist-012',
    meetingId: 'mtg-017',
    eventType: 'rejected',
    performedBy: 3, // Mathews Odero (Group Company Secretary)
    performedAt: '2025-01-28T10:00:00Z',
    submissionNotes: null,
    signatureId: null,
    signatureImageUrl: null,
    rejectionReason: 'incomplete_information',
    rejectionComments: 'Insufficient documentation provided. Please provide complete merger proposal and legal opinions before scheduling meeting.',
    unsignedDocumentId: 'doc-conf-017-unsigned',
    unsignedDocumentUrl: '/api/documents/doc-conf-017-unsigned/download',
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: '2025-01-28T10:00:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get confirmation history for a meeting
 */
export const getConfirmationHistoryByMeetingId = (meetingId: string): MeetingConfirmationHistoryRow[] => {
  return meetingConfirmationHistoryTable
    .filter(h => h.meetingId === meetingId)
    .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());
};

/**
 * Get the latest confirmation event for a meeting
 */
export const getLatestConfirmationEvent = (meetingId: string): MeetingConfirmationHistoryRow | undefined => {
  const history = getConfirmationHistoryByMeetingId(meetingId);
  return history.length > 0 ? history[history.length - 1] : undefined;
};

/**
 * Check if meeting is pending confirmation (latest event is 'submitted' or 'resubmitted')
 */
export const isPendingConfirmation = (meetingId: string): boolean => {
  const latest = getLatestConfirmationEvent(meetingId);
  return latest?.eventType === 'submitted' || latest?.eventType === 'resubmitted';
};

/**
 * Get all meetings pending confirmation
 */
export const getPendingConfirmationMeetingIds = (): string[] => {
  const meetingIds = new Set<string>();
  
  meetingConfirmationHistoryTable.forEach(h => {
    meetingIds.add(h.meetingId);
  });

  return Array.from(meetingIds).filter(isPendingConfirmation);
};

/**
 * Check if meeting is confirmed (latest event is 'confirmed')
 */
export const isConfirmed = (meetingId: string): boolean => {
  const latest = getLatestConfirmationEvent(meetingId);
  return latest?.eventType === 'confirmed';
};

/**
 * Check if meeting is rejected (latest event is 'rejected')
 */
export const isRejected = (meetingId: string): boolean => {
  const latest = getLatestConfirmationEvent(meetingId);
  return latest?.eventType === 'rejected';
};

/**
 * Get confirmation status details for a meeting
 * Single source of truth for all confirmation-related data
 */
export interface MeetingConfirmationStatus {
  hasHistory: boolean;
  isConfirmed: boolean;
  isPending: boolean;
  isRejected: boolean;
  confirmedBy: number | null;
  confirmedAt: string | null;
  signedDocumentId: string | null;
  signedDocumentUrl: string | null;
  unsignedDocumentUrl: string | null;
  signatureImageUrl: string | null; // Base64 data URL of drawn signature
  rejectionReason: RejectionReason | null;
  rejectionComments: string | null;
  latestEvent: MeetingConfirmationHistoryRow | null;
}

export const getMeetingConfirmationStatus = (meetingId: string): MeetingConfirmationStatus => {
  const history = getConfirmationHistoryByMeetingId(meetingId);
  const latest = history.length > 0 ? history[history.length - 1] : null;
  
  // Find the confirmed event (if any)
  const confirmedEvent = history.find(h => h.eventType === 'confirmed');
  
  // Find the latest rejection (if any)
  const rejectedEvent = [...history].reverse().find(h => h.eventType === 'rejected');
  
  return {
    hasHistory: history.length > 0,
    isConfirmed: latest?.eventType === 'confirmed',
    isPending: latest?.eventType === 'submitted' || latest?.eventType === 'resubmitted',
    isRejected: latest?.eventType === 'rejected',
    confirmedBy: confirmedEvent?.performedBy || null,
    confirmedAt: confirmedEvent?.performedAt || null,
    signedDocumentId: confirmedEvent?.signedDocumentId || null,
    signedDocumentUrl: confirmedEvent?.signedDocumentUrl || null,
    unsignedDocumentUrl: latest?.unsignedDocumentUrl || null,
    signatureImageUrl: confirmedEvent?.signatureImageUrl || null,
    rejectionReason: rejectedEvent?.rejectionReason || null,
    rejectionComments: rejectedEvent?.rejectionComments || null,
    latestEvent: latest,
  };
};
