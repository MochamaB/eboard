/**
 * Meeting Participants Table - Junction table with role-based permissions
 * Unified table for members, guests, presenters, and observers
 */

export type RSVPStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'left_early' | 'excused' | null;

export interface MeetingParticipantRow {
  id: string;
  meetingId: string;
  userId: number;

  // Role assignment - FK to roles table (authoritative source)
  roleId: number;

  // Role display title (e.g., "Committee Chair", "External Auditor")
  // Can differ from role name for context-specific titles
  roleTitle: string | null;

  // RSVP
  rsvpStatus: RSVPStatus;
  rsvpAt: string | null;
  rsvpNote: string | null;

  // Attendance tracking (Module 9)
  attendanceStatus: AttendanceStatus;
  joinedAt: string | null;
  leftAt: string | null;

  // Permissions (role-based)
  canVote: boolean;
  canUploadDocuments: boolean;
  canViewBoardDocuments: boolean;
  canShareScreen: boolean;

  // Guest-specific (only for roleId=12 (guest) or roleId=11 (presenter))
  presentationTopic: string | null;
  presentationStartTime: string | null;
  presentationEndTime: string | null;
  admittedAt: string | null;
  removedAt: string | null;

  // Flags
  isRequired: boolean; // for quorum calculation

  // Metadata
  addedBy: number;
  addedAt: string;
}

// ============================================================================
// MEETING PARTICIPANTS TABLE DATA
// ============================================================================

export const meetingParticipantsTable: MeetingParticipantRow[] = [
  // ========================================================================
  // MTG-001: draft.incomplete - Only 2 participants (NEED 8 for quorum)
  // ========================================================================
  {
    id: 'part-mtg001-001',
    meetingId: 'MTG-001',
    userId: 1, // Hon. Chege Kirundi (Chairman)
    roleId: 4, // chairman
    roleTitle: 'Chairman',
    rsvpStatus: 'pending',
    rsvpAt: null,
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'part-mtg001-002',
    meetingId: 'MTG-001',
    userId: 17, // Kenneth Muhia (Secretary)
    roleId: 6, // board_secretary
    roleTitle: 'Company Secretary',
    rsvpStatus: 'pending',
    rsvpAt: null,
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2026-02-01T08:00:00Z',
  },

  // ========================================================================
  // MTG-002: draft.complete - 15 participants (all requirements met)
  // ========================================================================
  {
    id: 'part-mtg002-001',
    meetingId: 'MTG-002',
    userId: 1,
    roleId: 4, // chairman
    roleTitle: 'Chairman',
    rsvpStatus: 'accepted',
    rsvpAt: '2024-11-16T08:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2024-12-15T08:55:00Z',
    leftAt: '2024-12-15T13:10:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2024-11-01T08:00:00Z',
  },
  {
    id: 'part-012',
    meetingId: 'mtg-003',
    userId: 2,
    roleId: 7, // board_member
    roleTitle: 'Vice Chairman',
    rsvpStatus: 'accepted',
    rsvpAt: '2024-11-16T09:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2024-12-15T08:58:00Z',
    leftAt: '2024-12-15T13:05:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2024-11-01T08:00:00Z',
  },
  {
    id: 'part-013',
    meetingId: 'mtg-003',
    userId: 4,
    roleId: 7, // board_member
    roleTitle: 'Board Member',
    rsvpStatus: 'accepted',
    rsvpAt: '2024-11-16T10:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'late',
    joinedAt: '2024-12-15T09:25:00Z',
    leftAt: '2024-12-15T13:08:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2024-11-01T08:00:00Z',
  },
  {
    id: 'part-014',
    meetingId: 'mtg-003',
    userId: 17,
    roleId: 6, // board_secretary
    roleTitle: 'Company Secretary',
    rsvpStatus: 'accepted',
    rsvpAt: '2024-11-15T10:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2024-12-15T08:45:00Z',
    leftAt: '2024-12-15T13:30:00Z',
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2024-11-01T08:00:00Z',
  },

  // ========================================================================
  // MTG-004: Audit Committee Q1 2025
  // ========================================================================
  {
    id: 'part-020',
    meetingId: 'mtg-004',
    userId: 4, // Committee Chair
    roleId: 4, // chairman
    roleTitle: 'Committee Chair',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-21T08:00:00Z',
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 18,
    addedAt: '2025-02-10T08:00:00Z',
  },
  {
    id: 'part-021',
    meetingId: 'mtg-004',
    userId: 5,
    roleId: 7, // board_member
    roleTitle: 'Committee Member',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-21T09:00:00Z',
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 18,
    addedAt: '2025-02-10T08:00:00Z',
  },
  {
    id: 'part-022',
    meetingId: 'mtg-004',
    userId: 6,
    roleId: 7, // board_member
    roleTitle: 'Committee Member',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-21T10:00:00Z',
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 18,
    addedAt: '2025-02-10T08:00:00Z',
  },
  {
    id: 'part-023',
    meetingId: 'mtg-004',
    userId: 18, // Isaac Chege (Board Secretary)
    roleId: 6, // board_secretary
    roleTitle: 'Board Secretary',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-20T09:00:00Z',
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 18,
    addedAt: '2025-02-10T08:00:00Z',
  },
  // Guest: External Auditor
  {
    id: 'part-024',
    meetingId: 'mtg-004',
    userId: 21, // Winfred Kabuuri (as external auditor guest)
    roleId: 12, // guest
    roleTitle: 'External Auditor - PwC',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-22T08:00:00Z',
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: false,
    canShareScreen: true,
    presentationTopic: '2024 Audit Findings and Recommendations',
    presentationStartTime: '10:15',
    presentationEndTime: '11:00',
    admittedAt: null,
    removedAt: null,
    isRequired: false,
    addedBy: 18,
    addedAt: '2025-02-15T08:00:00Z',
  },

  // ========================================================================
  // MTG-005: HR Committee (COMPLETED)
  // ========================================================================
  {
    id: 'part-030',
    meetingId: 'mtg-005',
    userId: 5, // Committee Chair
    roleId: 4, // chairman
    roleTitle: 'Committee Chair',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-21T08:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-02-05T13:55:00Z',
    leftAt: '2025-02-05T16:05:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 19,
    addedAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'part-031',
    meetingId: 'mtg-005',
    userId: 7,
    roleId: 7, // board_member
    roleTitle: 'Committee Member',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-21T09:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-02-05T13:58:00Z',
    leftAt: '2025-02-05T16:02:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 19,
    addedAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'part-032',
    meetingId: 'mtg-005',
    userId: 8,
    roleId: 7, // board_member
    roleTitle: 'Committee Member',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-21T10:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-02-05T14:00:00Z',
    leftAt: '2025-02-05T16:00:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 19,
    addedAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'part-033',
    meetingId: 'mtg-005',
    userId: 19, // Jane Njeri
    roleId: 6, // board_secretary
    roleTitle: 'Board Secretary',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-20T10:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-02-05T13:50:00Z',
    leftAt: '2025-02-05T16:30:00Z',
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 19,
    addedAt: '2025-01-10T08:00:00Z',
  },

  // ========================================================================
  // MTG-008: KETEPA Board (COMPLETED)
  // ========================================================================
  {
    id: 'part-040',
    meetingId: 'mtg-008',
    userId: 3, // Chairman of KETEPA
    roleId: 4, // chairman
    roleTitle: 'Chairman',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-11T08:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-01-20T09:55:00Z',
    leftAt: '2025-01-20T12:10:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 18,
    addedAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'part-041',
    meetingId: 'mtg-008',
    userId: 4,
    roleId: 7, // board_member
    roleTitle: 'Board Member',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-11T09:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-01-20T09:58:00Z',
    leftAt: '2025-01-20T12:05:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 18,
    addedAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'part-042',
    meetingId: 'mtg-008',
    userId: 18, // Board Secretary
    roleId: 6, // board_secretary
    roleTitle: 'Board Secretary',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-10T09:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-01-20T09:50:00Z',
    leftAt: '2025-01-20T12:30:00Z',
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 18,
    addedAt: '2025-01-05T08:00:00Z',
  },
  // Guest: Sales Manager presenting
  {
    id: 'part-043',
    meetingId: 'mtg-008',
    userId: 20, // Brian Mochama as Sales Manager guest
    roleId: 11, // presenter
    roleTitle: 'Sales Manager',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-12T08:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-01-20T10:30:00Z',
    leftAt: '2025-01-20T11:15:00Z',
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: false,
    canShareScreen: true,
    presentationTopic: 'January Sales Performance Report',
    presentationStartTime: '10:30',
    presentationEndTime: '11:00',
    admittedAt: '2025-01-20T10:30:00Z',
    removedAt: '2025-01-20T11:15:00Z',
    isRequired: false,
    addedBy: 18,
    addedAt: '2025-01-08T08:00:00Z',
  },

  // ========================================================================
  // MTG-011: Chebut Factory Board (COMPLETED)
  // ========================================================================
  {
    id: 'part-050',
    meetingId: 'mtg-011',
    userId: 4,
    roleId: 4, // chairman
    roleTitle: 'Factory Board Chairman',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-06T08:00:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-01-15T08:55:00Z',
    leftAt: '2025-01-15T11:05:00Z',
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'part-051',
    meetingId: 'mtg-011',
    userId: 17, // Secretary
    roleId: 6, // board_secretary
    roleTitle: 'Board Secretary',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-01-05T08:30:00Z',
    rsvpNote: null,
    attendanceStatus: 'present',
    joinedAt: '2025-01-15T08:50:00Z',
    leftAt: '2025-01-15T11:30:00Z',
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2025-01-05T08:00:00Z',
  },

  // ========================================================================
  // MTG-014: Emergency Board Meeting (SCHEDULED)
  // ========================================================================
  {
    id: 'part-060',
    meetingId: 'mtg-014',
    userId: 1, // Chairman
    roleId: 4, // chairman
    roleTitle: 'Chairman',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-27T16:30:00Z',
    rsvpNote: 'Will join immediately',
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2025-02-27T16:00:00Z',
  },
  {
    id: 'part-061',
    meetingId: 'mtg-014',
    userId: 2,
    roleId: 7, // board_member
    roleTitle: 'Vice Chairman',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-27T16:35:00Z',
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2025-02-27T16:00:00Z',
  },
  {
    id: 'part-062',
    meetingId: 'mtg-014',
    userId: 3,
    roleId: 7, // board_member
    roleTitle: 'Executive Member',
    rsvpStatus: 'tentative',
    rsvpAt: '2025-02-27T17:00:00Z',
    rsvpNote: 'Will try to join, currently in transit',
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: true,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2025-02-27T16:00:00Z',
  },
  {
    id: 'part-063',
    meetingId: 'mtg-014',
    userId: 17, // Secretary
    roleId: 6, // board_secretary
    roleTitle: 'Company Secretary',
    rsvpStatus: 'accepted',
    rsvpAt: '2025-02-27T16:15:00Z',
    rsvpNote: null,
    attendanceStatus: null,
    joinedAt: null,
    leftAt: null,
    canVote: false,
    canUploadDocuments: true,
    canViewBoardDocuments: true,
    canShareScreen: true,
    presentationTopic: null,
    presentationStartTime: null,
    presentationEndTime: null,
    admittedAt: null,
    removedAt: null,
    isRequired: true,
    addedBy: 17,
    addedAt: '2025-02-27T16:00:00Z',
  },
];
