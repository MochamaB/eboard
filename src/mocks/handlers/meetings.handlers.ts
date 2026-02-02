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
  getMeetingsByBoard,
  getMeetingsByBoardWithCommittees,
  getUpcomingMeetings,
  getPendingConfirmationMeetings,
  getAllMeetingObjects,
  getAllMeetingListItems,
  toMeetingListItem,
  getMeetingConfirmationHistory,
  getLatestMeetingConfirmationEvent,
  submitMeetingForConfirmation,
  confirmMeeting,
  rejectMeetingConfirmation,
  resubmitMeetingForConfirmation,
} from '../db/queries/meetingQueries';
import { getBoardById, getBoardMembers } from '../db/queries/boardQueries';
import { boardsTable } from '../db/tables/boards';
import { usersTable } from '../db/tables/users';
import { checkConfirmationRequired, getInitialMeetingStatus } from '../../utils/meetingConfirmation';
import type { BoardRole } from '../../types/board.types';

// In-memory storage for created/updated meetings
let meetings = getAllMeetingObjects();
let meetingListItems = getAllMeetingListItems();

// Helper to generate new meeting ID
const generateMeetingId = () => `mtg-new-${Date.now()}`;

// Helper to get board members as meeting participants
const getBoardMembersAsParticipants = (boardId: string) => {
  const members = getBoardMembers(boardId);
  return members.filter(m => m !== null).map(member => {
    const user = usersTable.find(u => u.id === member!.id);
    
    // Convert null to undefined for optional fields to match Zod schema
    const avatarValue = member!.avatar || user?.avatar;
    const avatar = avatarValue === null ? undefined : avatarValue;
    
    // Use actual board role from member, fallback to 'board_member' if undefined
    const boardRole = (member!.role || 'board_member') as BoardRole;
    
    return {
      id: `part-${member!.id}`,
      userId: member!.id,
      name: user?.fullName || member!.odooUserName || 'Unknown User',
      email: member!.email || user?.email || '',
      avatar,
      boardRole,
      rsvpStatus: 'no_response' as const,
      isGuest: false,
      canViewDocuments: true,
      canShareScreen: true,
      receiveMinutes: true,
    };
  });
};

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

// Helper to filter meetings (using imported filterMeetings from queries)
const filterMeetingsLocal = (params: MeetingFilterParams): MeetingListItem[] => {
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

  // Status filtering - handle both single status and array of statuses
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    filtered = filtered.filter(m => statuses.includes(m.status as string));
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
    
    // Parse status - can be single value, comma-separated, or array format (status[]=x&status[]=y)
    let statusParam: string | string[] | undefined;
    const statusValues = url.searchParams.getAll('status[]');
    if (statusValues.length > 0) {
      statusParam = statusValues;
    } else {
      const singleStatus = url.searchParams.get('status');
      if (singleStatus) {
        // Check if comma-separated
        statusParam = singleStatus.includes(',') ? singleStatus.split(',') : singleStatus;
      }
    }
    
    const params: MeetingFilterParams = {
      boardId: url.searchParams.get('boardId') || undefined,
      boardIds: url.searchParams.get('boardIds')?.split(',') || undefined,
      boardType: url.searchParams.get('boardType') || undefined,
      includeCommittees: url.searchParams.get('includeCommittees') === 'true',
      committeeId: url.searchParams.get('committeeId') || undefined,
      status: statusParam,
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

    const filtered = filterMeetingsLocal(params);
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

    let boardMeetingRows;
    if (includeCommittees) {
      boardMeetingRows = getMeetingsByBoardWithCommittees(boardId as string);
    } else {
      boardMeetingRows = getMeetingsByBoard(boardId as string);
    }

    // Use the transformation function to get proper list items
    const listItems = boardMeetingRows.map(row => toMeetingListItem(row));

    const paginated = paginate(listItems, page, pageSize);
    return HttpResponse.json(paginated);
  }),

  // Get upcoming meetings (for dashboard) - MUST be before /:id route
  http.get('/api/meetings/upcoming', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');

    const upcoming = getUpcomingMeetings(limit);
    const listItems = upcoming.map(row => toMeetingListItem(row));

    return HttpResponse.json({ data: listItems, total: listItems.length });
  }),

  // Get pending confirmations - MUST be before /:id route
  http.get('/api/meetings/pending-confirmation', ({ request }) => {
    const url = new URL(request.url);
    const boardId = url.searchParams.get('boardId') || undefined;
    const includeCommittees = url.searchParams.get('includeCommittees') === 'true';

    let pending = getPendingConfirmationMeetings();
    
    // Filter by boardId if provided
    if (boardId) {
      pending = pending.filter(m => {
        // Match direct board
        if (m.boardId === boardId) return true;
        // If includeCommittees, also match committees of this board (NOT subsidiaries or factories)
        if (includeCommittees) {
          const board = boardsTable.find(b => b.id === m.boardId);
          return board?.parentId === boardId && board?.type === 'committee';
        }
        return false;
      });
    }

    const listItems = pending.map(row => toMeetingListItem(row));

    return HttpResponse.json({ data: listItems, total: listItems.length });
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
    
    // Use board's quorum if not provided, fallback to 50%
    const quorumPercentage = payload.quorumPercentage ?? 50;
    const quorumRequired = Math.ceil((participants.length * quorumPercentage) / 100);

    // Calculate end date time
    const [hours, minutes] = payload.startTime.split(':').map(Number);
    const startDateTime = new Date(payload.startDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + payload.duration);

    // Determine if requires confirmation using business rules
    const requiresConfirmation = checkConfirmationRequired(
      board.type,
      payload.meetingType,
      { type: board.type }
    );
    
    // Get initial status based on confirmation requirement
    const initialStatus = getInitialMeetingStatus(requiresConfirmation);

    const newMeeting: Meeting = {
      id: generateMeetingId(),
      boardId: payload.boardId,
      boardName: board.name,
      boardType: board.type,
      // Convert null to undefined for optional Zod fields
      parentBoardId: board.parentId || undefined,
      parentBoardName: board.parentId ? boardsTable.find(b => b.id === board.parentId)?.name : undefined,
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
      confirmationStatus: requiresConfirmation ? 'pending' : undefined,
      status: initialStatus,
      isRecurring: payload.isRecurring || false,
      recurrencePattern: payload.recurrencePattern,
      createdBy: '17', // Mock user - Kenneth Muhia (Company Secretary)
      createdByName: 'Kenneth Mwangi Muhia',
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
      physicalLocation: newMeeting.physicalAddress || null,
      meetingLink: newMeeting.virtualMeetingLink || null,
      status: newMeeting.status,
      participantCount: newMeeting.participants.length,
      expectedAttendees: newMeeting.expectedAttendees,
      quorumPercentage: newMeeting.quorumPercentage,
      quorumRequired: newMeeting.quorumRequired,
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

    // Destructure boardId out since it can't be changed after creation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { boardId: _ignoredBoardId, ...updateFields } = payload;

    // Update meeting - ensure required fields are preserved from existing meeting
    const updatedMeeting: Meeting = {
      ...existingMeeting,
      ...updateFields,
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

  // REMOVED DUPLICATE HANDLERS (lines 611-674)
  // The correct confirm/reject handlers are defined later in the file (lines 842+)
  // and properly return { success, data, message } format

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

  // ============================================================================
  // CONFIRMATION WORKFLOW ENDPOINTS
  // ============================================================================

  // Get confirmation history for a meeting
  http.get('/api/meetings/:id/confirmation-history', ({ params }) => {
    const { id } = params;
    const history = getMeetingConfirmationHistory(id as string);
    
    return HttpResponse.json({ data: history, total: history.length });
  }),

  // Get latest confirmation event for a meeting
  http.get('/api/meetings/:id/confirmation-status', ({ params }) => {
    const { id } = params;
    const latest = getLatestMeetingConfirmationEvent(id as string);
    
    if (!latest) {
      return HttpResponse.json({ data: null, message: 'No confirmation history found' });
    }
    
    return HttpResponse.json({ data: latest });
  }),

  // Submit meeting for confirmation
  http.post('/api/meetings/:id/submit-for-confirmation', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { notes?: string; submittedBy: number };
    
    const result = submitMeetingForConfirmation(
      id as string,
      body.submittedBy,
      body.notes
    );
    
    if (!result) {
      return HttpResponse.json(
        { error: 'Meeting not found or cannot be submitted' },
        { status: 400 }
      );
    }
    
    console.log('📝 Meeting submitted for confirmation:', id);
    
    // Update in-memory meetings list
    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex !== -1) {
      meetings[meetingIndex].status = 'pending_confirmation';
      meetings[meetingIndex].updatedAt = new Date().toISOString();
    }
    
    return HttpResponse.json({ 
      success: true, 
      data: result,
      message: 'Meeting submitted for confirmation' 
    });
  }),

  // Confirm (approve) a meeting
  http.post('/api/meetings/:id/confirm', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { 
      confirmedBy: number; 
      pin: string;
      signatureId?: string;
      signatureImage?: string; // Base64 data URL of drawn signature
    };
    
    // In a real app, we'd verify the PIN here
    // For mock, we just generate a signature ID
    const signatureId = body.signatureId || `sig-${Date.now()}`;
    
    const result = confirmMeeting(
      id as string,
      body.confirmedBy,
      signatureId,
      body.signatureImage // Pass signature image to be stored
    );
    
    if (!result) {
      return HttpResponse.json(
        { error: 'Meeting not found or not pending confirmation' },
        { status: 400 }
      );
    }
    
    console.log('✅ Meeting confirmed:', id);
    
    // Update in-memory meetings list
    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex !== -1) {
      meetings[meetingIndex].status = 'confirmed';
      meetings[meetingIndex].confirmedBy = String(body.confirmedBy);
      meetings[meetingIndex].confirmedAt = new Date().toISOString();
      meetings[meetingIndex].updatedAt = new Date().toISOString();
    }
    
    return HttpResponse.json({ 
      success: true, 
      data: result,
      message: 'Meeting confirmed successfully' 
    });
  }),

  // Reject a meeting confirmation
  http.post('/api/meetings/:id/reject', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { 
      rejectedBy: number; 
      reason: 'incomplete_information' | 'scheduling_conflict' | 'agenda_not_approved' | 'quorum_concerns' | 'other';
      comments?: string;
    };
    
    const result = rejectMeetingConfirmation(
      id as string,
      body.rejectedBy,
      body.reason,
      body.comments
    );
    
    if (!result) {
      return HttpResponse.json(
        { error: 'Meeting not found or not pending confirmation' },
        { status: 400 }
      );
    }
    
    console.log('❌ Meeting confirmation rejected:', id, '-', body.reason);
    
    // Update in-memory meetings list
    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex !== -1) {
      meetings[meetingIndex].status = 'rejected';
      meetings[meetingIndex].rejectionReason = body.comments || body.reason;
      meetings[meetingIndex].updatedAt = new Date().toISOString();
    }
    
    return HttpResponse.json({ 
      success: true, 
      data: result,
      message: 'Meeting confirmation rejected' 
    });
  }),

  // Resubmit meeting for confirmation (after rejection)
  http.post('/api/meetings/:id/resubmit-for-confirmation', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { notes?: string; submittedBy: number };
    
    const result = resubmitMeetingForConfirmation(
      id as string,
      body.submittedBy,
      body.notes
    );
    
    if (!result) {
      return HttpResponse.json(
        { error: 'Meeting not found or not in rejected status' },
        { status: 400 }
      );
    }
    
    console.log('🔄 Meeting resubmitted for confirmation:', id);
    
    // Update in-memory meetings list
    const meetingIndex = meetings.findIndex(m => m.id === id);
    if (meetingIndex !== -1) {
      meetings[meetingIndex].status = 'pending_confirmation';
      meetings[meetingIndex].rejectionReason = undefined;
      meetings[meetingIndex].updatedAt = new Date().toISOString();
    }
    
    return HttpResponse.json({ 
      success: true, 
      data: result,
      message: 'Meeting resubmitted for confirmation' 
    });
  }),
];

export default meetingsHandlers;
