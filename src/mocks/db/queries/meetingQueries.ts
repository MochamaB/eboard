/**
 * Meeting Queries - Helper functions for meeting operations
 */

import { meetingsTable, type MeetingRow } from '../tables/meetings';
import { meetingParticipantsTable, type MeetingParticipantRow } from '../tables/meetingParticipants';
import { 
  meetingConfirmationHistoryTable, 
  type MeetingConfirmationHistoryRow,
  getConfirmationHistoryByMeetingId,
  getLatestConfirmationEvent,
  getMeetingConfirmationStatus,
} from '../tables/meetingConfirmationHistory';
import { boardRequiresConfirmation } from '../tables/boardSettings';
import { usersTable } from '../tables/users';
import { boardsTable } from '../tables/boards';
import { getRoleById } from '../tables/roles';
import { agendasTable } from '../tables/agendas';
import { agendaItemsTable } from '../tables/agendaItems';
import { documentAttachmentsTable } from '../tables/documentAttachments';
import { votesTable } from '../tables/votes';
import type { Meeting, MeetingListItem, MeetingParticipant, MeetingConfirmationHistory, BoardPackStatus } from '../../../types/meeting.types';

/**
 * Get the board role code for a participant using roleId FK
 */
const getParticipantBoardRole = (participant: MeetingParticipantRow): string => {
  const role = getRoleById(participant.roleId);
  return role?.code || 'board_member';
};

/**
 * Check if participant is a guest/presenter (non-voting, temporary access)
 */
const isGuestParticipant = (roleId: number): boolean => {
  // roleId 11 = presenter, roleId 12 = guest
  return roleId === 11 || roleId === 12;
};

/**
 * Get board pack status for a meeting
 * Returns agenda status, document count, and minutes status
 */
const getBoardPackStatus = (meetingId: string, meetingStatus: string): BoardPackStatus => {
  // Get agenda for this meeting
  const agenda = agendasTable.find(a => a.meetingId === meetingId);
  const agendaItems = agendaItemsTable.filter(i => i.meetingId === meetingId);
  
  // Agenda status
  let agendaStatus: 'none' | 'draft' | 'published' = 'none';
  if (agenda) {
    if (agenda.status === 'published' || agenda.status === 'archived') {
      agendaStatus = 'published';
    } else if (agenda.status === 'draft') {
      agendaStatus = 'draft';
    }
  }
  
  // Document count - count unique documents from DocumentAttachments table
  // Count documents attached directly to the meeting
  const meetingDocuments = documentAttachmentsTable.filter(
    att => att.entityType === 'meeting' && att.entityId === meetingId
  );
  
  // Also count documents attached to agenda items of this meeting
  const agendaItemIds = agendaItems.map(item => item.id);
  const agendaItemDocuments = documentAttachmentsTable.filter(
    att => att.entityType === 'agenda_item' && agendaItemIds.includes(att.entityId)
  );
  
  // Get unique document IDs (a document might be attached to multiple items)
  const documentIds = new Set<string>();
  meetingDocuments.forEach(att => documentIds.add(att.documentId));
  agendaItemDocuments.forEach(att => documentIds.add(att.documentId));
  
  const documentCount = documentIds.size;
  
  // Minutes status - for now, derive from meeting status
  // Completed meetings have published minutes, in_progress may have draft
  let minutesStatus: 'none' | 'draft' | 'published' = 'none';
  if (meetingStatus === 'completed') {
    // Check if this is one of our known completed meetings with minutes
    if (meetingId === 'mtg-008') {
      minutesStatus = 'published';
    } else if (meetingId === 'mtg-002') {
      minutesStatus = 'draft';
    } else {
      // Default: completed meetings should have at least draft minutes
      minutesStatus = 'draft';
    }
  }

  // Votes count - count all votes for this meeting
  const meetingVotes = votesTable.filter(v => v.meetingId === meetingId);
  const votesCount = meetingVotes.length;

  return {
    agenda: {
      status: agendaStatus,
      itemCount: agendaItems.length,
    },
    documents: {
      count: documentCount,
    },
    minutes: {
      status: minutesStatus,
    },
    votes: {
      count: votesCount,
    },
  };
};

// ============================================================================
// BASIC QUERIES
// ============================================================================

/**
 * Get meeting by ID
 */
export const getMeetingById = (id: string): MeetingRow | undefined => {
  return meetingsTable.find(m => m.id === id);
};

/**
 * Get all meetings
 */
export const getAllMeetings = (): MeetingRow[] => {
  return [...meetingsTable];
};

/**
 * Get meetings by board
 */
export const getMeetingsByBoard = (boardId: string): MeetingRow[] => {
  return meetingsTable.filter(m => m.boardId === boardId);
};

/**
 * Get meetings by board with committees
 */
export const getMeetingsByBoardWithCommittees = (boardId: string): MeetingRow[] => {
  const board = boardsTable.find(b => b.id === boardId);
  if (!board) return [];

  // Get all committees for this board
  const committees = boardsTable.filter(
    b => b.parentId === boardId && b.type === 'committee'
  );
  const committeeIds = committees.map(c => c.id);

  return meetingsTable.filter(
    m => m.boardId === boardId || committeeIds.includes(m.boardId)
  );
};

/**
 * Get meetings by status
 */
export const getMeetingsByStatus = (status: MeetingRow['status']): MeetingRow[] => {
  return meetingsTable.filter(m => m.status === status);
};

/**
 * Get upcoming meetings
 */
export const getUpcomingMeetings = (limit?: number): MeetingRow[] => {
  const now = new Date().toISOString().split('T')[0];
  const upcoming = meetingsTable
    .filter(m => m.scheduledDate >= now && m.status !== 'cancelled' && m.status !== 'completed')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  return limit ? upcoming.slice(0, limit) : upcoming;
};

/**
 * Get pending confirmation meetings
 */
export const getPendingConfirmationMeetings = (): MeetingRow[] => {
  return meetingsTable.filter(m => m.status === 'pending_confirmation');
};

/**
 * Get meetings by date range
 */
export const getMeetingsByDateRange = (startDate: string, endDate: string): MeetingRow[] => {
  return meetingsTable.filter(
    m => m.scheduledDate >= startDate && m.scheduledDate <= endDate
  );
};

// ============================================================================
// PARTICIPANT QUERIES
// ============================================================================

/**
 * Get participants for a meeting
 */
export const getMeetingParticipants = (meetingId: string): MeetingParticipantRow[] => {
  return meetingParticipantsTable.filter(p => p.meetingId === meetingId);
};

/**
 * Get user's meetings
 */
export const getUserMeetings = (userId: number): MeetingRow[] => {
  const participations = meetingParticipantsTable.filter(p => p.userId === userId);
  const meetingIds = participations.map(p => p.meetingId);
  
  return meetingsTable.filter(m => meetingIds.includes(m.id));
};

/**
 * Check if user is participant in meeting
 */
export const isUserParticipant = (meetingId: string, userId: number): boolean => {
  return meetingParticipantsTable.some(
    p => p.meetingId === meetingId && p.userId === userId
  );
};

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Convert MeetingRow to full Meeting object with participants
 */
export const toMeetingObject = (row: MeetingRow): Meeting => {
  const board = boardsTable.find(b => b.id === row.boardId);
  const participants = getMeetingParticipants(row.id);
  
  // Transform participants to Meeting type format
  const meetingParticipants: MeetingParticipant[] = participants.map(p => {
    const user = usersTable.find(u => u.id === p.userId);
    // Get board role code from roleId FK
    const boardRole = getParticipantBoardRole(p);
    const isGuest = isGuestParticipant(p.roleId);
    return {
      id: p.id,
      userId: p.userId,
      name: user?.fullName || 'Unknown User',
      email: user?.email || '',
      avatar: user?.avatar || undefined,
      boardRole,
      rsvpStatus: p.rsvpStatus,
      rsvpAt: p.rsvpAt || undefined,
      rsvpNote: p.rsvpNote || undefined,
      attendanceStatus: p.attendanceStatus || undefined,
      isGuest,
      guestRole: isGuest ? p.roleTitle || undefined : undefined,
      presentationTopic: p.presentationTopic || undefined,
      timeSlotStart: p.presentationStartTime || undefined,
      timeSlotEnd: p.presentationEndTime || undefined,
      canViewDocuments: p.canViewBoardDocuments,
      canShareScreen: p.canShareScreen,
      receiveMinutes: !isGuest,
    } as MeetingParticipant;
  });

  // Calculate end date time
  const [hours, minutes] = row.startTime.split(':').map(Number);
  const date = new Date(row.scheduledDate);
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + row.duration);
  const endDateTime = date.toISOString();

  // Get confirmation status from history (single source of truth)
  const confirmationStatus = getMeetingConfirmationStatus(row.id);
  const requiresConfirmation = boardRequiresConfirmation(row.boardId) && row.meetingType !== 'emergency';
  
  // Get confirmer name if confirmed
  const confirmerName = confirmationStatus.confirmedBy 
    ? usersTable.find(u => u.id === confirmationStatus.confirmedBy)?.fullName 
    : undefined;

  return {
    id: row.id,
    boardId: row.boardId,
    boardName: board?.name || 'Unknown Board',
    boardType: board?.type || 'main',
    title: row.title,
    description: row.description,
    meetingType: (row.meetingType === 'annual' ? 'agm' : row.meetingType) as Meeting['meetingType'],
    startDate: row.scheduledDate,
    startTime: row.startTime,
    duration: row.duration,
    endDateTime,
    timezone: row.timezone,
    locationType: row.locationType,
    locationDetails: row.locationType === 'hybrid' 
      ? `${row.physicalLocation} + Virtual` 
      : row.locationType === 'physical' 
        ? row.physicalLocation || '' 
        : 'Virtual',
    virtualMeetingLink: row.meetingLink || undefined,
    physicalAddress: row.physicalLocation || undefined,
    participants: meetingParticipants,
    quorumPercentage: row.quorumPercentage,
    quorumRequired: row.quorumRequired,
    expectedAttendees: participants.filter(p => p.isRequired).length,
    // Confirmation data derived from MeetingConfirmationHistory
    requiresConfirmation,
    confirmationStatus: confirmationStatus.isConfirmed ? 'approved' : confirmationStatus.isRejected ? 'rejected' : 'pending',
    confirmedBy: confirmationStatus.confirmedBy?.toString() || undefined,
    confirmedByName: confirmerName,
    confirmedAt: confirmationStatus.confirmedAt || undefined,
    confirmationDocumentUrl: confirmationStatus.signedDocumentUrl || undefined,
    rejectionReason: confirmationStatus.rejectionComments || undefined,
    status: row.status,
    isRecurring: false,
    createdBy: row.createdBy.toString(),
    createdByName: usersTable.find(u => u.id === row.createdBy)?.fullName || 'Unknown',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

/**
 * Convert MeetingRow to MeetingListItem (lightweight)
 */
export const toMeetingListItem = (row: MeetingRow): MeetingListItem => {
  const board = boardsTable.find(b => b.id === row.boardId);
  const parentBoard = board?.parentId ? boardsTable.find(b => b.id === board.parentId) : undefined;
  const participants = getMeetingParticipants(row.id);
  const requiredParticipants = participants.filter(p => p.isRequired);
  
  // Get confirmation status from history (single source of truth)
  const confirmationStatus = getMeetingConfirmationStatus(row.id);
  const requiresConfirmation = boardRequiresConfirmation(row.boardId) && row.meetingType !== 'emergency';
  
  // Get board pack status (agenda, documents, minutes)
  const boardPackStatus = getBoardPackStatus(row.id, row.status);
  
  return {
    id: row.id,
    boardId: row.boardId,
    boardName: board?.name || 'Unknown Board',
    boardType: board?.type || 'main',
    parentBoardName: parentBoard?.name,
    title: row.title,
    meetingType: (row.meetingType === 'annual' ? 'agm' : row.meetingType) as MeetingListItem['meetingType'],
    startDate: row.scheduledDate,
    startTime: row.startTime,
    duration: row.duration,
    locationType: row.locationType,
    physicalLocation: row.physicalLocation,
    meetingLink: row.meetingLink,
    status: row.status,
    participantCount: participants.length,
    expectedAttendees: requiredParticipants.length || participants.length || row.quorumRequired * 2,
    quorumPercentage: row.quorumPercentage,
    quorumRequired: row.quorumRequired,
    // Confirmation data derived from MeetingConfirmationHistory
    requiresConfirmation,
    confirmationStatus: confirmationStatus.isConfirmed ? 'approved' : confirmationStatus.isRejected ? 'rejected' : 'pending',
    createdByName: usersTable.find(u => u.id === row.createdBy)?.fullName || 'Unknown',
    createdAt: row.createdAt,
    // Board pack status for quick overview
    boardPackStatus,
  };
};

/**
 * Get all meetings as full Meeting objects
 */
export const getAllMeetingObjects = (): Meeting[] => {
  return meetingsTable.map(toMeetingObject);
};

/**
 * Get all meetings as list items
 */
export const getAllMeetingListItems = (): MeetingListItem[] => {
  return meetingsTable.map(toMeetingListItem);
};

/**
 * Filter meetings with advanced options
 */
export interface MeetingFilterOptions {
  boardId?: string;
  includeCommittees?: boolean;
  status?: MeetingRow['status'];
  meetingType?: MeetingRow['meetingType'];
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const filterMeetings = (options: MeetingFilterOptions): MeetingRow[] => {
  let filtered = [...meetingsTable];

  // Board filter
  if (options.boardId) {
    if (options.includeCommittees) {
      filtered = getMeetingsByBoardWithCommittees(options.boardId);
    } else {
      filtered = filtered.filter(m => m.boardId === options.boardId);
    }
  }

  // Status filter
  if (options.status) {
    filtered = filtered.filter(m => m.status === options.status);
  }

  // Meeting type filter
  if (options.meetingType) {
    filtered = filtered.filter(m => m.meetingType === options.meetingType);
  }

  // Date range filter
  if (options.startDate) {
    filtered = filtered.filter(m => m.scheduledDate >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter(m => m.scheduledDate <= options.endDate!);
  }

  // Search filter
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(searchLower) ||
      m.description.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

// ============================================================================
// CONFIRMATION QUERIES
// ============================================================================

/**
 * Transform confirmation history row to API response format
 */
const toConfirmationHistoryObject = (row: MeetingConfirmationHistoryRow): MeetingConfirmationHistory => {
  const user = usersTable.find(u => u.id === row.performedBy);
  
  return {
    id: row.id,
    meetingId: row.meetingId,
    eventType: row.eventType,
    performedBy: row.performedBy,
    performedByName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
    performedAt: row.performedAt,
    submissionNotes: row.submissionNotes,
    signatureId: row.signatureId,
    rejectionReason: row.rejectionReason,
    rejectionComments: row.rejectionComments,
    unsignedDocumentId: row.unsignedDocumentId,
    unsignedDocumentUrl: row.unsignedDocumentId ? `/api/documents/${row.unsignedDocumentId}` : null,
    signedDocumentId: row.signedDocumentId,
    signedDocumentUrl: row.signedDocumentId ? `/api/documents/${row.signedDocumentId}` : null,
    createdAt: row.createdAt,
  };
};

/**
 * Get meetings pending confirmation as list items
 */
export const getPendingConfirmationMeetingListItems = (): MeetingListItem[] => {
  const pendingMeetings = getPendingConfirmationMeetings();
  return pendingMeetings.map(toMeetingListItem);
};

/**
 * Get confirmation history for a meeting (transformed to API format)
 */
export const getMeetingConfirmationHistory = (meetingId: string): MeetingConfirmationHistory[] => {
  const history = getConfirmationHistoryByMeetingId(meetingId);
  return history.map(toConfirmationHistoryObject);
};

/**
 * Get the latest confirmation event for a meeting (transformed to API format)
 */
export const getLatestMeetingConfirmationEvent = (meetingId: string): MeetingConfirmationHistory | null => {
  const latest = getLatestConfirmationEvent(meetingId);
  return latest ? toConfirmationHistoryObject(latest) : null;
};

/**
 * Submit meeting for confirmation
 */
export const submitMeetingForConfirmation = (
  meetingId: string,
  submittedBy: number,
  notes?: string
): MeetingConfirmationHistory | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting) return null;

  // Update meeting status
  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'pending_confirmation';
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  // Create confirmation history entry with document URLs
  const unsignedDocId = `doc-conf-${meetingId}-unsigned`;
  const newEntry: MeetingConfirmationHistoryRow = {
    id: `conf-hist-${Date.now()}`,
    meetingId,
    eventType: 'submitted',
    performedBy: submittedBy,
    performedAt: new Date().toISOString(),
    submissionNotes: notes || null,
    signatureId: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: unsignedDocId,
    unsignedDocumentUrl: `/api/documents/${unsignedDocId}/download`,
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: new Date().toISOString(),
  };

  meetingConfirmationHistoryTable.push(newEntry);

  // Return the entry with performedByName for API response
  return {
    ...newEntry,
    performedByName: getUserName(submittedBy),
  };
};

/**
 * Helper: Get user name by ID
 */
const getUserName = (userId: number): string => {
  const user = usersTable.find(u => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
};

/**
 * Confirm a meeting (approve)
 */
export const confirmMeeting = (
  meetingId: string,
  confirmedBy: number,
  signatureId: string,
  signatureImageUrl?: string // Base64 data URL of drawn signature
): MeetingConfirmationHistory | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting || meeting.status !== 'pending_confirmation') return null;

  // Update meeting status only (confirmation details now in history)
  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'scheduled'; // Confirmed meetings become scheduled
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  // Get the latest submission entry to reference the unsigned document
  const latestSubmission = getLatestConfirmationEvent(meetingId);
  const signedDocId = `doc-conf-${meetingId}-signed`;

  // Create confirmation history entry with document URLs
  const newEntry: MeetingConfirmationHistoryRow = {
    id: `conf-hist-${Date.now()}`,
    meetingId,
    eventType: 'confirmed',
    performedBy: confirmedBy,
    performedAt: new Date().toISOString(),
    submissionNotes: null,
    signatureId,
    signatureImageUrl: signatureImageUrl || null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: latestSubmission?.unsignedDocumentId || null,
    unsignedDocumentUrl: latestSubmission?.unsignedDocumentUrl || null,
    signedDocumentId: signedDocId,
    signedDocumentUrl: `/api/documents/${signedDocId}/download`,
    createdAt: new Date().toISOString(),
  };

  meetingConfirmationHistoryTable.push(newEntry);

  // Return the entry with performedByName for API response
  return {
    ...newEntry,
    performedByName: getUserName(confirmedBy),
  };
};

/**
 * Reject a meeting confirmation
 */
export const rejectMeetingConfirmation = (
  meetingId: string,
  rejectedBy: number,
  reason: MeetingConfirmationHistoryRow['rejectionReason'],
  comments?: string
): MeetingConfirmationHistory | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting || meeting.status !== 'pending_confirmation') return null;

  // Update meeting status only (rejection details now in history)
  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'rejected';
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  // Get the latest submission entry to reference the unsigned document
  const latestSubmission = getLatestConfirmationEvent(meetingId);

  // Create confirmation history entry with document URLs
  const newEntry: MeetingConfirmationHistoryRow = {
    id: `conf-hist-${Date.now()}`,
    meetingId,
    eventType: 'rejected',
    performedBy: rejectedBy,
    performedAt: new Date().toISOString(),
    submissionNotes: null,
    signatureId: null,
    rejectionReason: reason,
    rejectionComments: comments || null,
    unsignedDocumentId: latestSubmission?.unsignedDocumentId || null,
    unsignedDocumentUrl: latestSubmission?.unsignedDocumentUrl || null,
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: new Date().toISOString(),
  };

  meetingConfirmationHistoryTable.push(newEntry);

  // Return the entry with performedByName for API response
  return {
    ...newEntry,
    performedByName: getUserName(rejectedBy),
  };
};

/**
 * Resubmit meeting for confirmation (after rejection)
 */
export const resubmitMeetingForConfirmation = (
  meetingId: string,
  submittedBy: number,
  notes?: string
): MeetingConfirmationHistory | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting || meeting.status !== 'rejected') return null;

  // Update meeting status back to pending (rejection details remain in history)
  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'pending_confirmation';
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  // Create confirmation history entry with new document version
  const unsignedDocId = `doc-conf-${meetingId}-v${Date.now()}-unsigned`;
  const newEntry: MeetingConfirmationHistoryRow = {
    id: `conf-hist-${Date.now()}`,
    meetingId,
    eventType: 'resubmitted',
    performedBy: submittedBy,
    performedAt: new Date().toISOString(),
    submissionNotes: notes || null,
    signatureId: null,
    rejectionReason: null,
    rejectionComments: null,
    unsignedDocumentId: unsignedDocId,
    unsignedDocumentUrl: `/api/documents/${unsignedDocId}/download`,
    signedDocumentId: null,
    signedDocumentUrl: null,
    createdAt: new Date().toISOString(),
  };

  meetingConfirmationHistoryTable.push(newEntry);

  // Return the entry with performedByName for API response
  return {
    ...newEntry,
    performedByName: getUserName(submittedBy),
  };
};
