/**
 * Meeting Queries - Helper functions for meeting operations
 */

import { meetingsTable, type MeetingRow } from '../tables/meetings';
import { meetingParticipantsTable, type MeetingParticipantRow } from '../tables/meetingParticipants';
import { usersTable } from '../tables/users';
import { boardsTable } from '../tables/boards';
import type { Meeting, MeetingListItem, MeetingParticipant } from '../../../types/meeting.types';

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
    return {
      id: p.id,
      userId: p.userId,
      name: user?.fullName || 'Unknown User',
      email: user?.email || '',
      avatar: user?.avatar || undefined,
      boardRole: p.roleTitle || 'board_member',
      rsvpStatus: p.rsvpStatus,
      rsvpAt: p.rsvpAt || undefined,
      rsvpNote: p.rsvpNote || undefined,
      attendanceStatus: p.attendanceStatus || undefined,
      isGuest: p.participantType === 'guest' || p.participantType === 'presenter',
      guestRole: p.participantType === 'guest' || p.participantType === 'presenter' ? p.roleTitle || undefined : undefined,
      presentationTopic: p.presentationTopic || undefined,
      timeSlotStart: p.presentationStartTime || undefined,
      timeSlotEnd: p.presentationEndTime || undefined,
      canViewDocuments: p.canViewBoardDocuments,
      canShareScreen: p.canShareScreen,
      receiveMinutes: p.participantType !== 'guest' && p.participantType !== 'presenter',
    } as MeetingParticipant;
  });

  // Calculate end date time
  const [hours, minutes] = row.startTime.split(':').map(Number);
  const date = new Date(row.scheduledDate);
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + row.duration);
  const endDateTime = date.toISOString();

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
    requiresConfirmation: row.confirmationRequired,
    confirmationStatus: row.confirmedAt ? 'approved' : row.rejectionReason ? 'rejected' : 'pending',
    confirmedBy: row.confirmedBy?.toString() || undefined,
    confirmedByName: row.confirmedBy ? usersTable.find(u => u.id === row.confirmedBy)?.fullName : undefined,
    confirmedAt: row.confirmedAt || undefined,
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
    requiresConfirmation: row.confirmationRequired,
    confirmationStatus: row.confirmedAt ? 'approved' : row.rejectionReason ? 'rejected' : 'pending',
    createdByName: usersTable.find(u => u.id === row.createdBy)?.fullName || 'Unknown',
    createdAt: row.createdAt,
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
