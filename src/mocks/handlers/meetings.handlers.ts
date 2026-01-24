/**
 * MSW Handlers for Meetings API
 * Mock API endpoints for meeting management
 */

import { http, HttpResponse } from 'msw';
import type {
  Meeting,
  MeetingListItem,
  MeetingFilterParams,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  AddGuestPayload,
  UpdateRSVPPayload,
  CancelMeetingPayload,
  RescheduleMeetingPayload,
} from '../../types/meeting.types';
import {
  getMeetingById,
  getMeetingsByBoard,
  getMeetingsByBoardWithCommittees,
  getMeetingsByStatus,
  getUpcomingMeetings,
  getPendingConfirmationMeetings,
  getAllMeetingObjects,
  getAllMeetingListItems,
  toMeetingObject,
  toMeetingListItem,
  filterMeetings,
} from '../db/queries/meetingQueries';
import { getBoardById } from '../db/queries/boardQueries';
import { meetingsTable, type MeetingRow } from '../db/tables/meetings';
import { meetingParticipantsTable } from '../db/tables/meetingParticipants';

// In-memory storage for created/updated meetings
let meetings = getAllMeetingObjects();
let meetingListItems = getAllMeetingListItems();

// Helper to generate new meeting ID
const generateMeetingId = () => `mtg-new-${Date.now()}`;

// Helper to calculate pagination
const paginate = <T,>(data: T[], page: number = 1, pageSize: number = 20) => {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages,
  };
};

// Helper to filter meetings
const filterMeetings = (params: MeetingFilterParams): MeetingListItem[] => {
  let filtered = [...meetingListItems];

  // Board filtering
  if (params.boardId) {
    if (params.includeCommittees) {
      const boardMeetings = getMeetingsByBoardWithCommittees(params.boardId);
      const boardMeetingIds = boardMeetings.map(m => m.id);
      filtered = filtered.filter(m => boardMeetingIds.includes(m.id));
    } else {
      filtered = filtered.filter(m => m.boardId === params.boardId);
    }
  }

  if (params.boardIds && params.boardIds.length > 0) {
    filtered = filtered.filter(m => params.boardIds!.includes(m.boardId));
  }

  if (params.boardType) {
    filtered = filtered.filter(m => m.boardType === params.boardType);
  }

  if (params.committeeId) {
    filtered = filtered.filter(m => m.boardId === params.committeeId && m.boardType === 'committee');
  }

  // Status filtering
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    filtered = filtered.filter(m => statuses.includes(m.status));
  }

  // Meeting type filtering
  if (params.meetingType) {
    filtered = filtered.filter(m => m.meetingType === params.meetingType);
  }

  // Date filtering
  if (params.dateFrom) {
    filtered = filtered.filter(m => m.startDate >= params.dateFrom!);
  }

  if (params.dateTo) {
    filtered = filtered.filter(m => m.startDate <= params.dateTo!);
  }

  if (params.month) {
    // Format: YYYY-MM
    filtered = filtered.filter(m => m.startDate.startsWith(params.month!));
  }

  if (params.year) {
    // Format: YYYY
    filtered = filtered.filter(m => m.startDate.startsWith(params.year!));
  }

  // Pending confirmation filter
  if (params.pendingConfirmation) {
    filtered = filtered.filter(m => m.status === 'pending_confirmation');
  }

  // Search filter (title)
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(searchLower) ||
      m.boardName.toLowerCase().includes(searchLower)
    );
  }

  // Sorting
  const sortField = params.sortField || 'startDate';
  const sortOrder = params.sortOrder || 'ascend';

  filtered.sort((a, b) => {
    let aVal: any = (a as any)[sortField];
    let bVal: any = (b as any)[sortField];

    // Handle date/time fields
    if (sortField === 'startDate') {
      aVal = `${a.startDate} ${a.startTime}`;
      bVal = `${b.startDate} ${b.startTime}`;
    }

    if (aVal < bVal) return sortOrder === 'ascend' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'ascend' ? 1 : -1;
    return 0;
  });

  return filtered;
};

// ============================================================================
// HANDLERS
// ============================================================================

export const meetingsHandlers = [
  // Get meetings with filters
  http.get('/api/meetings', ({ request }) => {
    const url = new URL(request.url);
    const params: MeetingFilterParams = {
      boardId: url.searchParams.get('boardId') || undefined,
      boardIds: url.searchParams.get('boardIds')?.split(',') || undefined,
      boardType: url.searchParams.get('boardType') || undefined,
      includeCommittees: url.searchParams.get('includeCommittees') === 'true',
      committeeId: url.searchParams.get('committeeId') || undefined,
      status: url.searchParams.get('status') || undefined,
      meetingType: url.searchParams.get('meetingType') || undefined,
      dateFrom: url.searchParams.get('dateFrom') || undefined,
      dateTo: url.searchParams.get('dateTo') || undefined,
      month: url.searchParams.get('month') || undefined,
      year: url.searchParams.get('year') || undefined,
      pendingConfirmation: url.searchParams.get('pendingConfirmation') === 'true',
      search: url.searchParams.get('search') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') || '20'),
      sortField: url.searchParams.get('sortField') || undefined,
      sortOrder: (url.searchParams.get('sortOrder') as 'ascend' | 'descend') || undefined,
    };

    const filtered = filterMeetings(params);
    const paginated = paginate(filtered, params.page, params.pageSize);

    return HttpResponse.json(paginated);
  }),

  // Get meetings for a specific board
  http.get('/api/boards/:boardId/meetings', ({ params, request }) => {
    const { boardId } = params;
    const url = new URL(request.url);
    const includeCommittees = url.searchParams.get('includeCommittees') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let boardMeetings: Meeting[];
    if (includeCommittees) {
      boardMeetings = getMeetingsByBoardWithCommittees(boardId as string);
    } else {
      boardMeetings = getMeetingsByBoard(boardId as string);
    }

    const listItems: MeetingListItem[] = boardMeetings.map(m => ({
      id: m.id,
      boardId: m.boardId,
      boardName: m.boardName,
      boardType: m.boardType,
      parentBoardName: m.parentBoardName,
      title: m.title,
      meetingType: m.meetingType,
      startDate: m.startDate,
      startTime: m.startTime,
      duration: m.duration,
      locationType: m.locationType,
      status: m.status,
      participantCount: m.participants.length,
      quorumPercentage: m.quorumPercentage,
      requiresConfirmation: m.requiresConfirmation,
      confirmationStatus: m.confirmationStatus,
      createdByName: m.createdByName,
      createdAt: m.createdAt,
    }));

    const paginated = paginate(listItems, page, pageSize);
    return HttpResponse.json(paginated);
  }),

  // Get single meeting
  http.get('/api/meetings/:id', ({ params }) => {
    const { id } = params;
    const meeting = meetings.find(m => m.id === id);

    if (!meeting) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(meeting);
  }),

  // Create meeting
  http.post('/api/meetings', async ({ request }) => {
    const payload = await request.json() as CreateMeetingPayload;

    // Validate board exists
    const board = getBoardById(payload.boardId);
    if (!board) {
      return HttpResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Auto-populate participants from board members
    const participants = getBoardMembersAsParticipants(payload.boardId);

    // Use board's quorum if not provided
    const quorumPercentage = payload.quorumPercentage ?? board.settings?.quorumPercentage ?? 50;
    const quorumRequired = Math.ceil((participants.length * quorumPercentage) / 100);

    // Calculate end date time
    const [hours, minutes] = payload.startTime.split(':').map(Number);
    const startDateTime = new Date(payload.startDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + payload.duration);

    // Determine if requires confirmation from board settings
    const requiresConfirmation = board.settings?.confirmationRequired ?? false;

    const newMeeting: Meeting = {
      id: generateMeetingId(),
      boardId: payload.boardId,
      boardName: board.name,
      boardType: board.type,
      parentBoardId: board.parentId,
      parentBoardName: board.parentName,
      title: payload.title,
      description: payload.description,
      meetingType: payload.meetingType,
      startDate: payload.startDate,
      startTime: payload.startTime,
      duration: payload.duration,
      endDateTime: endDateTime.toISOString(),
      timezone: 'Africa/Nairobi',
      locationType: payload.locationType,
      locationDetails: payload.locationDetails,
      virtualMeetingLink: payload.virtualMeetingLink,
      physicalAddress: payload.physicalAddress,
      participants,
      quorumPercentage,
      quorumRequired,
      expectedAttendees: participants.length,
      requiresConfirmation,
      status: requiresConfirmation ? 'pending_confirmation' : 'draft',
      isRecurring: payload.isRecurring || false,
      recurrencePattern: payload.recurrencePattern,
      createdBy: '4', // Mock user
      createdByName: 'Jane Mwangi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    meetings.push(newMeeting);

    // Update list items
    meetingListItems.push({
      id: newMeeting.id,
      boardId: newMeeting.boardId,
      boardName: newMeeting.boardName,
      boardType: newMeeting.boardType,
      parentBoardName: newMeeting.parentBoardName,
      title: newMeeting.title,
      meetingType: newMeeting.meetingType,
      startDate: newMeeting.startDate,
      startTime: newMeeting.startTime,
      duration: newMeeting.duration,
      locationType: newMeeting.locationType,
      status: newMeeting.status,
      participantCount: newMeeting.participants.length,
      quorumPercentage: newMeeting.quorumPercentage,
      requiresConfirmation: newMeeting.requiresConfirmation,
      confirmationStatus: newMeeting.confirmationStatus,
      createdByName: newMeeting.createdByName,
      createdAt: newMeeting.createdAt,
    });

    console.log('📅 Meeting created:', newMeeting.title, `(${newMeeting.boardName})`);

    return HttpResponse.json(newMeeting, { status: 201 });
  }),

  // Update meeting
  http.put('/api/meetings/:id', async ({ params, request }) => {
    const { id } = params;
    const payload = await request.json() as UpdateMeetingPayload;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const existingMeeting = meetings[meetingIndex];

    // Update meeting
    const updatedMeeting: Meeting = {
      ...existingMeeting,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    // If meeting was confirmed and details changed, reset to pending confirmation
    if (
      existingMeeting.status === 'confirmed' &&
      (payload.startDate || payload.startTime || payload.duration)
    ) {
      updatedMeeting.status = 'pending_confirmation';
      updatedMeeting.confirmationStatus = 'pending';
      console.log('⚠️ Meeting modified after confirmation, requires re-confirmation');
    }

    meetings[meetingIndex] = updatedMeeting;

    // Update list items
    const listIndex = meetingListItems.findIndex(m => m.id === id);
    if (listIndex !== -1) {
      meetingListItems[listIndex] = {
        ...meetingListItems[listIndex],
        title: updatedMeeting.title,
        startDate: updatedMeeting.startDate,
        startTime: updatedMeeting.startTime,
        duration: updatedMeeting.duration,
        status: updatedMeeting.status,
      };
    }

    console.log('✏️ Meeting updated:', updatedMeeting.title);

    return HttpResponse.json(updatedMeeting);
  }),

  // Delete meeting
  http.delete('/api/meetings/:id', ({ params }) => {
    const { id } = params;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    meetings.splice(meetingIndex, 1);

    const listIndex = meetingListItems.findIndex(m => m.id === id);
    if (listIndex !== -1) {
      meetingListItems.splice(listIndex, 1);
    }

    console.log('🗑️ Meeting deleted:', meeting.title);

    return HttpResponse.json({ success: true });
  }),

  // Cancel meeting
  http.post('/api/meetings/:id/cancel', async ({ params, request }) => {
    const { id } = params;
    const payload = await request.json() as CancelMeetingPayload;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    meeting.status = 'cancelled';
    meeting.cancelledAt = new Date().toISOString();
    meeting.cancellationReason = payload.reason;
    meeting.updatedAt = new Date().toISOString();

    // Update list item
    const listIndex = meetingListItems.findIndex(m => m.id === id);
    if (listIndex !== -1) {
      meetingListItems[listIndex].status = 'cancelled';
    }

    console.log('❌ Meeting cancelled:', meeting.title, `Reason: ${payload.reason}`);
    if (payload.notifyParticipants) {
      console.log(`📧 Would send cancellation notifications to ${meeting.participants.length} participants`);
    }

    return HttpResponse.json(meeting);
  }),

  // Reschedule meeting
  http.post('/api/meetings/:id/reschedule', async ({ params, request }) => {
    const { id } = params;
    const payload = await request.json() as RescheduleMeetingPayload;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    const wasConfirmed = meeting.status === 'confirmed';

    meeting.startDate = payload.startDate;
    meeting.startTime = payload.startTime;
    if (payload.duration) {
      meeting.duration = payload.duration;
    }

    // Recalculate end date time
    const [hours, minutes] = payload.startTime.split(':').map(Number);
    const startDateTime = new Date(payload.startDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + meeting.duration);
    meeting.endDateTime = endDateTime.toISOString();

    // If was confirmed, require re-confirmation
    if (wasConfirmed) {
      meeting.status = 'pending_confirmation';
      meeting.confirmationStatus = 'pending';
      console.log('⚠️ Meeting rescheduled after confirmation, requires re-confirmation');
    }

    meeting.updatedAt = new Date().toISOString();

    // Update list item
    const listIndex = meetingListItems.findIndex(m => m.id === id);
    if (listIndex !== -1) {
      meetingListItems[listIndex].startDate = meeting.startDate;
      meetingListItems[listIndex].startTime = meeting.startTime;
      meetingListItems[listIndex].duration = meeting.duration;
      meetingListItems[listIndex].status = meeting.status;
    }

    console.log('📅 Meeting rescheduled:', meeting.title, `to ${payload.startDate} ${payload.startTime}`);
    console.log(`📧 Would send reschedule notifications to ${meeting.participants.length} participants`);

    return HttpResponse.json(meeting);
  }),

  // Submit for confirmation
  http.post('/api/meetings/:id/submit-for-confirmation', ({ params }) => {
    const { id } = params;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    meeting.status = 'pending_confirmation';
    meeting.confirmationStatus = 'pending';
    meeting.updatedAt = new Date().toISOString();

    // Update list item
    const listIndex = meetingListItems.findIndex(m => m.id === id);
    if (listIndex !== -1) {
      meetingListItems[listIndex].status = 'pending_confirmation';
      meetingListItems[listIndex].confirmationStatus = 'pending';
    }

    console.log('📝 Meeting submitted for confirmation:', meeting.title);
    console.log('📧 Would send confirmation request to approver');

    return HttpResponse.json(meeting);
  }),

  // Confirm meeting (sign)
  http.post('/api/meetings/:id/confirm', ({ params }) => {
    const { id } = params;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    meeting.status = 'confirmed';
    meeting.confirmationStatus = 'approved';
    meeting.confirmedBy = '5'; // Mock Company Secretary
    meeting.confirmedByName = 'Sarah Kimani';
    meeting.confirmedAt = new Date().toISOString();
    meeting.updatedAt = new Date().toISOString();

    // Update list item
    const listIndex = meetingListItems.findIndex(m => m.id === id);
    if (listIndex !== -1) {
      meetingListItems[listIndex].status = 'confirmed';
      meetingListItems[listIndex].confirmationStatus = 'approved';
    }

    console.log('✅ Meeting confirmed:', meeting.title);
    console.log(`📧 Would send invitations to ${meeting.participants.length} participants`);

    return HttpResponse.json(meeting);
  }),

  // Reject meeting
  http.post('/api/meetings/:id/reject', async ({ params, request }) => {
    const { id } = params;
    const { reason } = await request.json() as { reason: string };

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    meeting.status = 'rejected';
    meeting.confirmationStatus = 'rejected';
    meeting.rejectionReason = reason;
    meeting.updatedAt = new Date().toISOString();

    // Update list item
    const listIndex = meetingListItems.findIndex(m => m.id === id);
    if (listIndex !== -1) {
      meetingListItems[listIndex].status = 'rejected';
      meetingListItems[listIndex].confirmationStatus = 'rejected';
    }

    console.log('❌ Meeting rejected:', meeting.title, `Reason: ${reason}`);
    console.log('📧 Would notify secretary of rejection');

    return HttpResponse.json(meeting);
  }),

  // Update RSVP
  http.put('/api/meetings/:id/rsvp', async ({ params, request }) => {
    const { id } = params;
    const payload = await request.json() as UpdateRSVPPayload;
    const userId = '1'; // Mock current user

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    const participantIndex = meeting.participants.findIndex(p => String(p.userId) === userId);

    if (participantIndex === -1) {
      return HttpResponse.json(
        { error: 'You are not a participant of this meeting' },
        { status: 403 }
      );
    }

    meeting.participants[participantIndex].rsvpStatus = payload.rsvpStatus;
    meeting.updatedAt = new Date().toISOString();

    console.log('📧 RSVP updated:', meeting.participants[participantIndex].name, payload.rsvpStatus);

    return HttpResponse.json(meeting);
  }),

  // Add guest
  http.post('/api/meetings/:id/guests', async ({ params, request }) => {
    const { id } = params;
    const payload = await request.json() as AddGuestPayload;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];

    const guest = {
      id: `guest-${Date.now()}`,
      userId: `guest-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      boardRole: 'observer' as const,
      rsvpStatus: 'no_response' as const,
      isGuest: true,
      guestRole: payload.guestRole,
      timeSlotStart: payload.timeSlotStart,
      timeSlotEnd: payload.timeSlotEnd,
      presentationTopic: payload.presentationTopic,
      canViewDocuments: payload.canViewDocuments,
      canShareScreen: payload.canShareScreen,
      receiveMinutes: payload.receiveMinutes,
    };

    meeting.participants.push(guest);
    meeting.expectedAttendees = meeting.participants.length;
    meeting.updatedAt = new Date().toISOString();

    console.log('👤 Guest added to meeting:', payload.name, `(${meeting.title})`);

    return HttpResponse.json(meeting);
  }),

  // Remove guest
  http.delete('/api/meetings/:id/guests/:guestId', ({ params }) => {
    const { id, guestId } = params;

    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return HttpResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetings[meetingIndex];
    const participantIndex = meeting.participants.findIndex(
      p => p.id === guestId && p.isGuest
    );

    if (participantIndex === -1) {
      return HttpResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    const guest = meeting.participants[participantIndex];
    meeting.participants.splice(participantIndex, 1);
    meeting.expectedAttendees = meeting.participants.length;
    meeting.updatedAt = new Date().toISOString();

    console.log('👤 Guest removed from meeting:', guest.name);

    return HttpResponse.json({ success: true });
  }),

  // Get upcoming meetings (for dashboard)
  http.get('/api/meetings/upcoming', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');

    const upcoming = getUpcomingMeetings(limit);
    const listItems: MeetingListItem[] = upcoming.map(m => ({
      id: m.id,
      boardId: m.boardId,
      boardName: m.boardName,
      boardType: m.boardType,
      parentBoardName: m.parentBoardName,
      title: m.title,
      meetingType: m.meetingType,
      startDate: m.startDate,
      startTime: m.startTime,
      duration: m.duration,
      locationType: m.locationType,
      status: m.status,
      participantCount: m.participants.length,
      quorumPercentage: m.quorumPercentage,
      requiresConfirmation: m.requiresConfirmation,
      confirmationStatus: m.confirmationStatus,
      createdByName: m.createdByName,
      createdAt: m.createdAt,
    }));

    return HttpResponse.json({ data: listItems, total: listItems.length });
  }),

  // Get pending confirmations
  http.get('/api/meetings/pending-confirmation', () => {
    const pending = getPendingConfirmationMeetings();
    const listItems: MeetingListItem[] = pending.map(m => ({
      id: m.id,
      boardId: m.boardId,
      boardName: m.boardName,
      boardType: m.boardType,
      parentBoardName: m.parentBoardName,
      title: m.title,
      meetingType: m.meetingType,
      startDate: m.startDate,
      startTime: m.startTime,
      duration: m.duration,
      locationType: m.locationType,
      status: m.status,
      participantCount: m.participants.length,
      quorumPercentage: m.quorumPercentage,
      requiresConfirmation: m.requiresConfirmation,
      confirmationStatus: m.confirmationStatus,
      createdByName: m.createdByName,
      createdAt: m.createdAt,
    }));

    return HttpResponse.json({ data: listItems, total: listItems.length });
  }),
];

export default meetingsHandlers;
