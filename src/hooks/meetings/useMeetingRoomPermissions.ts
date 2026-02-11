/**
 * useMeetingRoomPermissions Hook
 * Computes contextual permissions for live Meeting Room (during-meeting phase)
 * 
 * Layer 2 of the two-layer permission system:
 * - Takes base permissions from AuthContext (Layer 1)
 * - Combines with room state from MeetingRoomContext to compute contextual permissions
 * - Used in Meeting Room during in_progress meetings
 */

import { useMemo, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBoardContext } from '../../contexts/BoardContext';
import { useMeetingPhase } from '../../contexts/MeetingPhaseContext';
import { MeetingRoomContext } from '../../contexts/MeetingRoomContext';
import { getUserHostRole } from '../../types/meetingRoom.types';
import type { 
  MeetingRoomPermissions, 
  RoomState 
} from '../../types/meetingPermissions.types';

const PERMISSION_CODES = {
  MEETINGS_CONTROL: 'meetings.control',
  MEETINGS_PRESENT: 'meetings.present',
  VOTING_CREATE: 'voting.create',
  VOTING_START: 'voting.start',
  VOTING_CAST: 'voting.cast',
  VOTING_VIEW: 'voting.view',
  DOCUMENTS_VIEW: 'documents.view',
  MINUTES_CREATE: 'minutes.create',
  MINUTES_VIEW: 'minutes.view',
} as const;

/**
 * Main hook for computing meeting room permissions
 * 
 * Reads room state directly from MeetingRoomContext via useContext.
 * Falls back to safe defaults when called outside the MeetingRoomProvider.
 */
export function useMeetingRoomPermissions(): MeetingRoomPermissions {
  const { user, hasPermission } = useAuth();
  const { currentBoard } = useBoardContext();
  const { meeting, phaseInfo } = useMeetingPhase();
  
  // Read room context directly (safe — returns undefined if outside provider)
  const roomContext = useContext(MeetingRoomContext);
  
  return useMemo(() => {
    // Default: minimal permissions
    if (!user || !meeting || !phaseInfo || !currentBoard) {
      return {
        canStartMeeting: false,
        canEndMeeting: false,
        canPauseMeeting: false,
        canNavigateAgenda: false,
        canMarkItemDiscussed: false,
        canDeferItem: false,
        canCreateVote: false,
        canStartVote: false,
        canCloseVote: false,
        canCastVote: false,
        canViewVoteResults: false,
        canCastDocument: false,
        canNavigateDocument: false,
        canStopCasting: false,
        canViewDocuments: false,
        canTakeMinutes: false,
        canViewMinutes: false,
        canAdmitParticipants: false,
        canRemoveParticipant: false,
        canMuteOthers: false,
        canPromoteToPresenter: false,
        canStartRecording: false,
        canShareScreen: false,
        canToggleVideo: false,
        canToggleAudio: false,
        canRaiseHand: true, // Always allowed
        canSendChat: false,
        canLeave: true, // Always allowed
      };
    }
    
    const boardId = currentBoard.id;
    
    // System admin & host detection
    const isSystemAdmin = user.globalRole?.code === 'system_admin';
    const hostInfo = roomContext?.roomState?.hostInfo 
      ?? { hostUserId: null, hostName: null, cohostUserId: null, cohostName: null };
    const userHostRole = getUserHostRole(user.id, hostInfo, user.globalRole?.code);
    const isHostOrCohost = userHostRole === 'host' || userHostRole === 'cohost';
    
    // Check base permissions (Layer 1)
    // System admin and host/cohost get control permission automatically
    const hasControlPermission = isSystemAdmin || isHostOrCohost || hasPermission(PERMISSION_CODES.MEETINGS_CONTROL, boardId);
    const hasPresentPermission = isSystemAdmin || hasPermission(PERMISSION_CODES.MEETINGS_PRESENT, boardId);
    const hasCreateVotePermission = isSystemAdmin || isHostOrCohost || hasPermission(PERMISSION_CODES.VOTING_CREATE, boardId);
    const hasStartVotePermission = isSystemAdmin || isHostOrCohost || hasPermission(PERMISSION_CODES.VOTING_START, boardId);
    const hasCastVotePermission = hasPermission(PERMISSION_CODES.VOTING_CAST, boardId); // Everyone votes on their own
    const hasViewVotePermission = hasPermission(PERMISSION_CODES.VOTING_VIEW, boardId) || isSystemAdmin;
    const hasViewDocsPermission = hasPermission(PERMISSION_CODES.DOCUMENTS_VIEW, boardId) || isSystemAdmin;
    const hasCreateMinutesPermission = isSystemAdmin || hasPermission(PERMISSION_CODES.MINUTES_CREATE, boardId);
    const hasViewMinutesPermission = hasPermission(PERMISSION_CODES.MINUTES_VIEW, boardId) || isSystemAdmin;
    
    // Build RoomState from actual MeetingRoomContext, or use defaults if outside provider
    const rs = roomContext?.roomState;
    const waitingCount = rs
      ? rs.participants.filter(p => p.attendanceStatus === 'waiting').length
      : 0;
    
    const room: RoomState = rs
      ? {
          status: rs.status,
          mode: rs.mode,
          quorumRequired: rs.quorumRequired,
          quorumMet: rs.quorumMet,
          activeVote: rs.activeVote
            ? { id: rs.activeVote.id, status: rs.activeVote.status as 'open' | 'closed', userHasVoted: rs.activeVote.userHasVoted }
            : null,
          castingDocument: rs.castingDocument
            ? { documentId: rs.castingDocument.documentId, casterId: rs.castingDocument.casterId }
            : null,
          isRecording: rs.isRecording,
          waitingRoomCount: waitingCount,
        }
      : {
          status: 'waiting',
          mode: 'physical',
          quorumRequired: 0,
          quorumMet: false,
          activeVote: null,
          castingDocument: null,
          isRecording: false,
          waitingRoomCount: 0,
        };
    
    // Use ROOM status (live local state) not meeting.status (API, may be stale)
    const isInProgress = room.status === 'in_progress';
    
    // MEETING CONTROL PERMISSIONS
    const canStartMeeting = 
      hasControlPermission && 
      room.status === 'waiting' &&
      room.quorumMet;
    
    const canEndMeeting = 
      hasControlPermission && 
      room.status === 'in_progress';
    
    const canPauseMeeting = 
      hasControlPermission && 
      room.status === 'in_progress';
    
    // AGENDA CONTROL PERMISSIONS
    const canNavigateAgenda = 
      hasControlPermission && 
      isInProgress;
    
    const canMarkItemDiscussed = 
      hasControlPermission && 
      isInProgress;
    
    const canDeferItem = 
      hasControlPermission && 
      isInProgress;
    
    // VOTING PERMISSIONS
    const canCreateVote = 
      hasCreateVotePermission && 
      isInProgress &&
      !room.activeVote;
    
    const canStartVote = 
      hasStartVotePermission && 
      isInProgress;
    
    const canCloseVote = 
      hasStartVotePermission && 
      room.activeVote?.status === 'open';
    
    const canCastVote = 
      hasCastVotePermission && 
      room.activeVote?.status === 'open' &&
      !room.activeVote?.userHasVoted;
    
    const canViewVoteResults = hasViewVotePermission;
    
    // DOCUMENT PERMISSIONS
    const canCastDocument = 
      hasPresentPermission && 
      isInProgress &&
      !room.castingDocument;
    
    const canNavigateDocument = 
      hasPresentPermission && 
      room.castingDocument !== null;
    
    const canStopCasting = 
      hasPresentPermission && 
      room.castingDocument !== null;
    
    const canViewDocuments = hasViewDocsPermission;
    
    // MINUTES PERMISSIONS
    const canTakeMinutes = 
      hasCreateMinutesPermission && 
      isInProgress;
    
    const canViewMinutes = hasViewMinutesPermission;
    
    // PARTICIPANT MANAGEMENT PERMISSIONS
    const canAdmitParticipants = 
      hasControlPermission && 
      room.waitingRoomCount > 0;
    
    const canRemoveParticipant = 
      hasControlPermission;
    
    const canMuteOthers = 
      hasControlPermission && 
      (room.mode === 'virtual' || room.mode === 'hybrid');
    
    const canPromoteToPresenter = 
      hasControlPermission;
    
    // RECORDING & MEDIA PERMISSIONS
    const canStartRecording = 
      hasControlPermission && 
      (room.mode === 'virtual' || room.mode === 'hybrid') &&
      !room.isRecording;
    
    const canShareScreen = 
      hasPresentPermission && 
      (room.mode === 'virtual' || room.mode === 'hybrid');
    
    const canToggleVideo = 
      (room.mode === 'virtual' || room.mode === 'hybrid');
    
    const canToggleAudio = 
      (room.mode === 'virtual' || room.mode === 'hybrid');
    
    // GENERAL PERMISSIONS (always allowed)
    const canRaiseHand = true;
    const canSendChat = isInProgress;
    const canLeave = true;
    
    return {
      canStartMeeting,
      canEndMeeting,
      canPauseMeeting,
      canNavigateAgenda,
      canMarkItemDiscussed,
      canDeferItem,
      canCreateVote,
      canStartVote,
      canCloseVote,
      canCastVote,
      canViewVoteResults,
      canCastDocument,
      canNavigateDocument,
      canStopCasting,
      canViewDocuments,
      canTakeMinutes,
      canViewMinutes,
      canAdmitParticipants,
      canRemoveParticipant,
      canMuteOthers,
      canPromoteToPresenter,
      canStartRecording,
      canShareScreen,
      canToggleVideo,
      canToggleAudio,
      canRaiseHand,
      canSendChat,
      canLeave,
    };
  }, [user, meeting, phaseInfo, currentBoard, roomContext, hasPermission]);
}
