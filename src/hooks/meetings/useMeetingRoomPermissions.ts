/**
 * useMeetingRoomPermissions Hook
 * Computes contextual permissions for live Meeting Room (during-meeting phase)
 * 
 * Layer 2 of the two-layer permission system:
 * - Takes base permissions from AuthContext (Layer 1)
 * - Combines with room state to compute contextual permissions
 * - Used in Meeting Room during in_progress meetings
 * 
 * NOTE: This is currently a STUB implementation since MeetingRoomContext doesn't exist yet.
 * It will be fully implemented when the Meeting Room is built.
 */

import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBoardContext } from '../../contexts/BoardContext';
import { useMeetingPhase } from '../../contexts/MeetingPhaseContext';
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
 * TODO: This is a STUB. When MeetingRoomContext is created, replace the stub roomState
 * with actual state from useMeetingRoom() hook.
 */
export function useMeetingRoomPermissions(
  roomState?: RoomState // Optional for now, will come from MeetingRoomContext later
): MeetingRoomPermissions {
  const { user, hasPermission } = useAuth();
  const { currentBoard } = useBoardContext();
  const { meeting, phaseInfo } = useMeetingPhase();
  
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
    
    // Check base permissions (Layer 1)
    const hasControlPermission = hasPermission(PERMISSION_CODES.MEETINGS_CONTROL, boardId);
    const hasPresentPermission = hasPermission(PERMISSION_CODES.MEETINGS_PRESENT, boardId);
    const hasCreateVotePermission = hasPermission(PERMISSION_CODES.VOTING_CREATE, boardId);
    const hasStartVotePermission = hasPermission(PERMISSION_CODES.VOTING_START, boardId);
    const hasCastVotePermission = hasPermission(PERMISSION_CODES.VOTING_CAST, boardId);
    const hasViewVotePermission = hasPermission(PERMISSION_CODES.VOTING_VIEW, boardId);
    const hasViewDocsPermission = hasPermission(PERMISSION_CODES.DOCUMENTS_VIEW, boardId);
    const hasCreateMinutesPermission = hasPermission(PERMISSION_CODES.MINUTES_CREATE, boardId);
    const hasViewMinutesPermission = hasPermission(PERMISSION_CODES.MINUTES_VIEW, boardId);
    
    // STUB: Use provided roomState or create default
    // When MeetingRoomContext exists, this will come from useMeetingRoom()
    const defaultRoomState: RoomState = {
      status: 'waiting',
      mode: 'physical',
      quorumRequired: 0,
      quorumMet: false,
      activeVote: null,
      castingDocument: null,
      isRecording: false,
      waitingRoomCount: 0,
    };
    
    const room = roomState || defaultRoomState;
    
    // Only allow room actions if meeting is in_progress
    const isInProgress = meeting.status === 'in_progress';
    
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
  }, [user, meeting, phaseInfo, currentBoard, roomState, hasPermission]);
}
