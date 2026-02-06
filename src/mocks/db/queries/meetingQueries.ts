/**
 * Meeting Queries - Clean implementation for Status+SubStatus model
 * Uses meetingEvents for audit trail instead of deprecated meetingConfirmationHistory
 */

import { meetingsTable, type MeetingRow } from '../tables/meetings';
import { meetingParticipantsTable, type MeetingParticipantRow } from '../tables/meetingParticipants';
import { meetingEventsTable, type MeetingEventRow } from '../tables/meetingEvents';
import { boardRequiresConfirmation } from '../tables/boardSettings';
import { usersTable } from '../tables/users';
import { boardsTable } from '../tables/boards';
import { getRoleById } from '../tables/roles';
import { agendasTable } from '../tables/agendas';
import { agendaItemsTable } from '../tables/agendaItems';
import { documentAttachmentsTable } from '../tables/documentAttachments';
import { votesTable } from '../tables/votes';
import type { Meeting, MeetingListItem, MeetingParticipant, MeetingEvent, BoardPackStatus } from '../../../types/meeting.types';
import { normalizeId, idsMatch } from '../utils/idUtils';

// ============================================================================
// BASIC QUERIES
// ============================================================================

export const getMeetingById = (id: string): MeetingRow | undefined => {
  return meetingsTable.find(m => idsMatch(m.id, id));
};

export const getAllMeetings = (): MeetingRow[] => {
  return [...meetingsTable];
};

export const getMeetingsByBoard = (boardId: string): MeetingRow[] => {
  return meetingsTable.filter(m => idsMatch(m.boardId, boardId));
};

export const getMeetingsByBoardWithCommittees = (boardId: string): MeetingRow[] => {
  const board = boardsTable.find(b => idsMatch(b.id, boardId));
  if (!board) return [];

  const committees = boardsTable.filter(b => b.parentId && idsMatch(b.parentId, boardId) && b.type === 'committee');
  const committeeIds = committees.map(c => normalizeId(c.id));

  return meetingsTable.filter(m => idsMatch(m.boardId, boardId) || committeeIds.includes(normalizeId(m.boardId)));
};

export const getMeetingsByStatus = (status: MeetingRow['status']): MeetingRow[] => {
  return meetingsTable.filter(m => m.status === status);
};

export const getMeetingsByStatusAndSubStatus = (
  status: MeetingRow['status'],
  subStatus: string | null
): MeetingRow[] => {
  return meetingsTable.filter(m => m.status === status && m.subStatus === subStatus);
};

export const getUpcomingMeetings = (limit?: number): MeetingRow[] => {
  const now = new Date().toISOString().split('T')[0];
  const upcoming = meetingsTable
    .filter(m => m.scheduledDate >= now && m.status !== 'cancelled' && m.status !== 'completed')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  return limit ? upcoming.slice(0, limit) : upcoming;
};

export const getPendingApprovalMeetings = (): MeetingRow[] => {
  return meetingsTable.filter(m => m.status === 'scheduled' && m.subStatus === 'pending_approval');
};

export const getMeetingsByDateRange = (startDate: string, endDate: string): MeetingRow[] => {
  return meetingsTable.filter(m => m.scheduledDate >= startDate && m.scheduledDate <= endDate);
};

// ============================================================================
// PARTICIPANT QUERIES
// ============================================================================

export const getMeetingParticipants = (meetingId: string): MeetingParticipantRow[] => {
  return meetingParticipantsTable.filter(p => idsMatch(p.meetingId, meetingId));
};

export const getUserMeetings = (userId: number): MeetingRow[] => {
  const participations = meetingParticipantsTable.filter(p => p.userId === userId);
  const meetingIds = participations.map(p => normalizeId(p.meetingId));
  return meetingsTable.filter(m => meetingIds.includes(normalizeId(m.id)));
};

export const isUserParticipant = (meetingId: string, userId: number): boolean => {
  return meetingParticipantsTable.some(p => idsMatch(p.meetingId, meetingId) && p.userId === userId);
};

// ============================================================================
// EVENT QUERIES
// ============================================================================

export const getMeetingEvents = (meetingId: string): MeetingEventRow[] => {
  return meetingEventsTable
    .filter(e => idsMatch(e.meetingId, meetingId))
    .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());
};

export const getLatestMeetingEvent = (meetingId: string): MeetingEventRow | null => {
  const events = getMeetingEvents(meetingId);
  return events.length > 0 ? events[events.length - 1] : null;
};

export const getMeetingEventsByType = (
  meetingId: string,
  eventType: MeetingEventRow['eventType']
): MeetingEventRow[] => {
  return meetingEventsTable
    .filter(e => idsMatch(e.meetingId, meetingId) && e.eventType === eventType)
    .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());
};

export const getApprovalEvents = (meetingId: string): MeetingEventRow[] => {
  const approvalEventTypes = ['submitted_for_approval', 'approved', 'rejected', 'resubmitted'];
  return meetingEventsTable
    .filter(e => idsMatch(e.meetingId, meetingId) && approvalEventTypes.includes(e.eventType))
    .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());
};

export const getLatestApprovalEvent = (meetingId: string): MeetingEventRow | null => {
  const events = getApprovalEvents(meetingId);
  return events.length > 0 ? events[events.length - 1] : null;
};

// ============================================================================
// STATUS HELPERS
// ============================================================================

export const hasMeetingStatus = (
  meetingId: string,
  status: string,
  subStatus?: string | null
): boolean => {
  const meeting = getMeetingById(meetingId);
  if (!meeting) return false;

  if (subStatus !== undefined) {
    return meeting.status === status && meeting.subStatus === subStatus;
  }
  return meeting.status === status;
};

export const isDraftMeeting = (meetingId: string): boolean => hasMeetingStatus(meetingId, 'draft');
export const isScheduledMeeting = (meetingId: string): boolean => hasMeetingStatus(meetingId, 'scheduled');
export const isInProgressMeeting = (meetingId: string): boolean => hasMeetingStatus(meetingId, 'in_progress');
export const isCompletedMeeting = (meetingId: string): boolean => hasMeetingStatus(meetingId, 'completed');
export const isCancelledMeeting = (meetingId: string): boolean => hasMeetingStatus(meetingId, 'cancelled');

export const isMeetingApproved = (meetingId: string): boolean => {
  return hasMeetingStatus(meetingId, 'scheduled', 'approved');
};

export const isMeetingRejected = (meetingId: string): boolean => {
  return hasMeetingStatus(meetingId, 'scheduled', 'rejected');
};

export const isMeetingPendingApproval = (meetingId: string): boolean => {
  return hasMeetingStatus(meetingId, 'scheduled', 'pending_approval');
};

// ============================================================================
// BOARD PACK STATUS
// ============================================================================

const getBoardPackStatus = (meetingId: string, meetingStatus: string): BoardPackStatus => {
  const agenda = agendasTable.find(a => idsMatch(a.meetingId, meetingId));
  const agendaItems = agendaItemsTable.filter(i => idsMatch(i.meetingId, meetingId));

  let agendaStatus: 'none' | 'draft' | 'published' = 'none';
  if (agenda) {
    if (agenda.status === 'published' || agenda.status === 'archived') {
      agendaStatus = 'published';
    } else if (agenda.status === 'draft') {
      agendaStatus = 'draft';
    }
  }

  const meetingDocuments = documentAttachmentsTable.filter(
    att => att.entityType === 'meeting' && idsMatch(att.entityId, meetingId)
  );

  const agendaItemIds = agendaItems.map(item => normalizeId(item.id));
  const agendaItemDocuments = documentAttachmentsTable.filter(
    att => att.entityType === 'agenda_item' && agendaItemIds.includes(normalizeId(att.entityId))
  );

  const documentIds = new Set<string>();
  meetingDocuments.forEach(att => documentIds.add(att.documentId));
  agendaItemDocuments.forEach(att => documentIds.add(att.documentId));

  let minutesStatus: 'none' | 'draft' | 'published' = 'none';
  if (meetingStatus === 'completed') {
    minutesStatus = idsMatch(meetingId, 'MTG-008') ? 'published' : 'draft';
  }

  const meetingVotes = votesTable.filter(v => idsMatch(v.meetingId, meetingId));

  return {
    agenda: {
      status: agendaStatus,
      itemCount: agendaItems.length,
    },
    documents: {
      count: documentIds.size,
    },
    minutes: {
      status: minutesStatus,
    },
    votes: {
      count: meetingVotes.length,
    },
  };
};

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

const getParticipantBoardRole = (participant: MeetingParticipantRow): string => {
  const role = getRoleById(participant.roleId);
  return role?.code || 'board_member';
};

const isGuestParticipant = (roleId: number): boolean => {
  return roleId === 11 || roleId === 12;
};

export const toMeetingObject = (row: MeetingRow): Meeting => {
  const board = boardsTable.find(b => idsMatch(b.id, row.boardId));
  const participants = getMeetingParticipants(row.id);

  const meetingParticipants: MeetingParticipant[] = participants.map(p => {
    const user = usersTable.find(u => u.id === p.userId);
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

  const [hours, minutes] = row.startTime.split(':').map(Number);
  const date = new Date(row.scheduledDate);
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + row.duration);
  const endDateTime = date.toISOString();

  const approvalEvent = getLatestApprovalEvent(row.id);
  const requiresConfirmation = boardRequiresConfirmation(row.boardId) && row.meetingType !== 'emergency';

  return {
    id: row.id,
    boardId: row.boardId,
    boardName: board?.name || 'Unknown Board',
    boardType: board?.type || 'main',
    title: row.title,
    description: row.description,
    meetingType: row.meetingType as Meeting['meetingType'],
    startDate: row.scheduledDate,
    startTime: row.startTime,
    duration: row.duration,
    endDateTime,
    timezone: row.timezone,
    locationType: row.locationType,
    locationDetails:
      row.locationType === 'hybrid'
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
    requiresConfirmation,
    confirmationStatus:
      row.subStatus === 'approved'
        ? 'approved'
        : row.subStatus === 'rejected'
        ? 'rejected'
        : row.subStatus === 'pending_approval'
        ? 'pending'
        : 'pending',
    confirmedBy: approvalEvent?.eventType === 'approved' ? approvalEvent.performedBy.toString() : undefined,
    confirmedByName: approvalEvent?.eventType === 'approved' ? approvalEvent.performedByName : undefined,
    confirmedAt: approvalEvent?.eventType === 'approved' ? approvalEvent.performedAt : undefined,
    confirmationDocumentUrl: approvalEvent?.metadata?.signedDocumentId
      ? `/api/documents/${approvalEvent.metadata.signedDocumentId}`
      : undefined,
    rejectionReason:
      approvalEvent?.eventType === 'rejected'
        ? (approvalEvent.metadata?.rejectionComments as string)
        : undefined,
    status: row.status,
    subStatus: row.subStatus,
    statusUpdatedAt: row.statusUpdatedAt,
    overrides: row.overrides,
    overrideReason: row.overrideReason,
    isRecurring: false,
    createdBy: row.createdBy.toString(),
    createdByName: usersTable.find(u => u.id === row.createdBy)?.fullName || 'Unknown',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const toMeetingListItem = (row: MeetingRow): MeetingListItem => {
  const board = boardsTable.find(b => idsMatch(b.id, row.boardId));
  const parentBoard = board?.parentId ? boardsTable.find(b => board.parentId && idsMatch(b.id, board.parentId)) : undefined;
  const participants = getMeetingParticipants(row.id);
  const requiredParticipants = participants.filter(p => p.isRequired);
  const requiresConfirmation = boardRequiresConfirmation(row.boardId) && row.meetingType !== 'emergency';
  const boardPackStatus = getBoardPackStatus(row.id, row.status);

  return {
    id: row.id,
    boardId: row.boardId,
    boardName: board?.name || 'Unknown Board',
    boardType: board?.type || 'main',
    parentBoardName: parentBoard?.name,
    title: row.title,
    meetingType: row.meetingType as MeetingListItem['meetingType'],
    startDate: row.scheduledDate,
    startTime: row.startTime,
    duration: row.duration,
    locationType: row.locationType,
    physicalLocation: row.physicalLocation,
    meetingLink: row.meetingLink,
    status: row.status,
    subStatus: row.subStatus,
    statusUpdatedAt: row.statusUpdatedAt,
    participantCount: participants.length,
    expectedAttendees: requiredParticipants.length || participants.length || row.quorumRequired * 2,
    quorumPercentage: row.quorumPercentage,
    quorumRequired: row.quorumRequired,
    requiresConfirmation,
    createdByName: usersTable.find(u => u.id === row.createdBy)?.fullName || 'Unknown',
    createdAt: row.createdAt,
    boardPackStatus,
  };
};

export const getAllMeetingObjects = (): Meeting[] => {
  return meetingsTable.map(toMeetingObject);
};

export const getAllMeetingListItems = (): MeetingListItem[] => {
  return meetingsTable.map(toMeetingListItem);
};

export const getPendingApprovalMeetingListItems = (): MeetingListItem[] => {
  return getPendingApprovalMeetings().map(toMeetingListItem);
};

// ============================================================================
// FILTERING
// ============================================================================

export interface MeetingFilterOptions {
  boardId?: string;
  includeCommittees?: boolean;
  status?: MeetingRow['status'];
  subStatus?: string | null;
  meetingType?: MeetingRow['meetingType'];
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const filterMeetings = (options: MeetingFilterOptions): MeetingRow[] => {
  let filtered = [...meetingsTable];

  if (options.boardId) {
    filtered = options.includeCommittees
      ? getMeetingsByBoardWithCommittees(options.boardId)
      : filtered.filter(m => idsMatch(m.boardId, options.boardId!));
  }

  if (options.status) {
    filtered = filtered.filter(m => m.status === options.status);
  }

  if (options.subStatus !== undefined) {
    filtered = filtered.filter(m => m.subStatus === options.subStatus);
  }

  if (options.meetingType) {
    filtered = filtered.filter(m => m.meetingType === options.meetingType);
  }

  if (options.startDate) {
    filtered = filtered.filter(m => m.scheduledDate >= options.startDate!);
  }

  if (options.endDate) {
    filtered = filtered.filter(m => m.scheduledDate <= options.endDate!);
  }

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(
      m => m.title.toLowerCase().includes(searchLower) || m.description.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

// ============================================================================
// STATE TRANSITIONS (Emit events to meetingEvents table)
// ============================================================================

const getUserName = (userId: number): string => {
  const user = usersTable.find(u => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
};

export const submitMeetingForApproval = (
  meetingId: string,
  submittedBy: number,
  notes?: string
): MeetingEvent | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting || meeting.status !== 'draft' || meeting.subStatus !== 'complete') return null;

  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'scheduled';
    meetingsTable[meetingIndex].subStatus = 'pending_approval';
    meetingsTable[meetingIndex].statusUpdatedAt = new Date().toISOString();
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  const performedAt = new Date().toISOString();
  const newEvent: MeetingEventRow = {
    id: `evt-${meetingId}-${Date.now()}`,
    meetingId,
    eventType: 'submitted_for_approval',
    fromStatus: 'draft',
    fromSubStatus: 'complete',
    toStatus: 'scheduled',
    toSubStatus: 'pending_approval',
    performedBy: submittedBy,
    performedByName: getUserName(submittedBy),
    performedAt,
    metadata: {
      submissionNotes: notes || null,
      unsignedDocumentId: `doc-conf-${meetingId}-unsigned`,
    },
    createdAt: performedAt,
  };

  meetingEventsTable.push(newEvent);
  return newEvent as MeetingEvent;
};

export const approveMeeting = (
  meetingId: string,
  approvedBy: number,
  signatureId: string
): MeetingEvent | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting || meeting.status !== 'scheduled' || meeting.subStatus !== 'pending_approval') return null;

  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'scheduled';
    meetingsTable[meetingIndex].subStatus = 'approved';
    meetingsTable[meetingIndex].statusUpdatedAt = new Date().toISOString();
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  const performedAt = new Date().toISOString();
  const newEvent: MeetingEventRow = {
    id: `evt-${meetingId}-${Date.now()}`,
    meetingId,
    eventType: 'approved',
    fromStatus: 'scheduled',
    fromSubStatus: 'pending_approval',
    toStatus: 'scheduled',
    toSubStatus: 'approved',
    performedBy: approvedBy,
    performedByName: getUserName(approvedBy),
    performedAt,
    metadata: {
      signatureId,
      // signedDocumentId will be set by the handler after document creation
    },
    createdAt: performedAt,
  };

  meetingEventsTable.push(newEvent);
  return newEvent as MeetingEvent;
};

export const rejectMeeting = (
  meetingId: string,
  rejectedBy: number,
  reason: string,
  comments?: string
): MeetingEvent | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting || meeting.status !== 'scheduled' || meeting.subStatus !== 'pending_approval') return null;

  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'scheduled';
    meetingsTable[meetingIndex].subStatus = 'rejected';
    meetingsTable[meetingIndex].statusUpdatedAt = new Date().toISOString();
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  const performedAt = new Date().toISOString();
  const newEvent: MeetingEventRow = {
    id: `evt-${meetingId}-${Date.now()}`,
    meetingId,
    eventType: 'rejected',
    fromStatus: 'scheduled',
    fromSubStatus: 'pending_approval',
    toStatus: 'scheduled',
    toSubStatus: 'rejected',
    performedBy: rejectedBy,
    performedByName: getUserName(rejectedBy),
    performedAt,
    metadata: {
      rejectionReason: reason,
      rejectionComments: comments || null,
    },
    createdAt: performedAt,
  };

  meetingEventsTable.push(newEvent);
  return newEvent as MeetingEvent;
};

export const startRevision = (meetingId: string, userId: number): MeetingEvent | null => {
  const meeting = getMeetingById(meetingId);
  if (!meeting || meeting.status !== 'scheduled' || meeting.subStatus !== 'rejected') return null;

  const meetingIndex = meetingsTable.findIndex(m => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetingsTable[meetingIndex].status = 'draft';
    meetingsTable[meetingIndex].subStatus = 'incomplete';
    meetingsTable[meetingIndex].statusUpdatedAt = new Date().toISOString();
    meetingsTable[meetingIndex].updatedAt = new Date().toISOString();
  }

  const performedAt = new Date().toISOString();
  const newEvent: MeetingEventRow = {
    id: `evt-${meetingId}-${Date.now()}`,
    meetingId,
    eventType: 'resubmitted',
    fromStatus: 'scheduled',
    fromSubStatus: 'rejected',
    toStatus: 'draft',
    toSubStatus: 'incomplete',
    performedBy: userId,
    performedByName: getUserName(userId),
    performedAt,
    metadata: null,
    createdAt: performedAt,
  };

  meetingEventsTable.push(newEvent);
  return newEvent as MeetingEvent;
};
