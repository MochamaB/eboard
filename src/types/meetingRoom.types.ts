/**
 * Meeting Room Types
 * Type definitions for live meeting room state and behavior
 */

import type { Meeting, MeetingParticipant } from './meeting.types';
import type { AgendaItem } from './agenda.types';

// ============================================================================
// ROOM STATUS & MODE
// ============================================================================

/**
 * Room status during live meeting session
 */
export type RoomStatus = 
  | 'waiting'      // Meeting not yet started, waiting for host
  | 'starting'     // Meeting is being initialized
  | 'in_progress'  // Meeting actively running
  | 'paused'       // Meeting temporarily paused
  | 'ending'       // Meeting being wrapped up
  | 'ended';       // Meeting has concluded

/**
 * Meeting mode - computed from participant locations
 * Physical: All participants in-room
 * Virtual: All participants remote
 * Hybrid: Mix of in-room and remote
 */
export type MeetingMode = 'physical' | 'virtual' | 'hybrid';

/**
 * Participant's connection status in virtual/hybrid meetings
 */
export type ParticipantConnectionStatus = 
  | 'connected'    // Active connection
  | 'connecting'   // Establishing connection
  | 'reconnecting' // Lost connection, attempting to reconnect
  | 'disconnected' // No connection
  | 'in_room';     // Physically present (no virtual connection needed)

/**
 * Participant's attendance status
 */
export type AttendanceStatus = 
  | 'expected'     // Expected but not yet joined
  | 'waiting'      // In waiting room
  | 'joined'       // Actively in meeting
  | 'left'         // Left the meeting
  | 'removed';     // Removed by host

// ============================================================================
// PARTICIPANT STATE (Live Meeting)
// ============================================================================

/**
 * Extended participant info for live meeting room
 */
export interface RoomParticipant extends MeetingParticipant {
  attendanceStatus: AttendanceStatus;
  connectionStatus: ParticipantConnectionStatus;
  joinedAt: string | null;
  leftAt: string | null;
  
  // Virtual meeting state
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  hasRaisedHand: boolean;
  handRaisedAt: string | null;
  
  // Activity
  isSpeaking: boolean;
  lastActiveAt: string | null;
}

// ============================================================================
// DOCUMENT CASTING
// ============================================================================

/**
 * State when a document is being cast/presented
 */
export interface CastingDocument {
  documentId: string;
  documentName: string;
  documentUrl: string;
  currentPage: number;
  totalPages: number;
  casterId: string;
  casterName: string;
  startedAt: string;
}

// ============================================================================
// ACTIVE VOTE STATE
// ============================================================================

/**
 * Active vote state in meeting room
 */
export interface ActiveVote {
  id: string;
  motionText: string;
  proposedBy: string;
  proposedByName: string;
  secondedBy: string | null;
  secondedByName: string | null;
  status: 'pending' | 'open' | 'closed';
  startedAt: string | null;
  endsAt: string | null;
  timeRemaining: number; // seconds
  
  // Vote counts
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  requiredVotes: number;
  
  // Current user's vote
  userHasVoted: boolean;
  userVote: 'for' | 'against' | 'abstain' | null;
}

// ============================================================================
// MAIN ROOM STATE
// ============================================================================

/**
 * Complete meeting room state
 */
export interface MeetingRoomState {
  // Core identifiers
  meetingId: string;
  meeting: Meeting | null;
  
  // Room status
  status: RoomStatus;
  mode: MeetingMode;
  
  // Timing
  startedAt: string | null;
  endedAt: string | null;
  pausedAt: string | null;
  duration: number; // seconds elapsed
  
  // Agenda tracking
  currentAgendaItemId: string | null;
  currentAgendaItem: AgendaItem | null;
  agendaItems: AgendaItem[];
  
  // Participants
  participants: RoomParticipant[];
  expectedCount: number;
  presentCount: number;
  quorumRequired: number;
  quorumMet: boolean;
  
  // Voting
  activeVote: ActiveVote | null;
  
  // Document casting
  castingDocument: CastingDocument | null;
  
  // Connection
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  
  // Recording (virtual/hybrid)
  isRecording: boolean;
  recordingStartedAt: string | null;
}

// ============================================================================
// ROOM ACTIONS
// ============================================================================

/**
 * Actions available in the meeting room
 */
export interface MeetingRoomActions {
  // Meeting lifecycle
  startMeeting: () => Promise<void>;
  endMeeting: () => Promise<void>;
  pauseMeeting: () => Promise<void>;
  resumeMeeting: () => Promise<void>;
  leaveMeeting: () => Promise<void>;
  
  // Agenda navigation
  navigateToItem: (itemId: string) => Promise<void>;
  markItemDiscussed: (itemId: string) => Promise<void>;
  deferItem: (itemId: string) => Promise<void>;
  
  // Document casting
  startCasting: (documentId: string) => Promise<void>;
  stopCasting: () => Promise<void>;
  navigatePage: (page: number) => void;
  
  // Voting
  createVote: (motionText: string) => Promise<void>;
  startVote: (voteId: string) => Promise<void>;
  castVote: (voteId: string, vote: 'for' | 'against' | 'abstain') => Promise<void>;
  closeVote: (voteId: string) => Promise<void>;
  
  // Participant actions
  raiseHand: () => void;
  lowerHand: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  
  // Host actions
  admitParticipant: (participantId: string) => Promise<void>;
  admitAllParticipants: () => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  muteParticipant: (participantId: string) => Promise<void>;
  promoteToPresenter: (participantId: string) => Promise<void>;
  
  // Recording
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

// ============================================================================
// CONTEXT TYPE
// ============================================================================

/**
 * Complete Meeting Room context type
 */
export interface MeetingRoomContextType {
  // State
  roomState: MeetingRoomState;
  
  // Actions
  actions: MeetingRoomActions;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

// ============================================================================
// SIDE PANEL
// ============================================================================

/**
 * Side panel tab options
 */
export type SidePanelTab = 'notice' | 'agenda' | 'participants' | 'documents';

/**
 * Side panel state
 */
export interface SidePanelState {
  isCollapsed: boolean;
  activeTab: SidePanelTab;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Compute meeting mode from participants
 */
export function computeMeetingMode(participants: RoomParticipant[]): MeetingMode {
  const joinedParticipants = participants.filter(p => p.attendanceStatus === 'joined');
  
  const inRoomCount = joinedParticipants.filter(
    p => p.connectionStatus === 'in_room'
  ).length;
  
  const remoteCount = joinedParticipants.filter(
    p => p.connectionStatus === 'connected' || p.connectionStatus === 'connecting'
  ).length;
  
  if (inRoomCount > 0 && remoteCount > 0) return 'hybrid';
  if (remoteCount > 0) return 'virtual';
  return 'physical';
}

/**
 * Check if quorum is met
 */
export function checkQuorum(
  participants: RoomParticipant[], 
  quorumRequired: number
): boolean {
  const presentCount = participants.filter(
    p => p.attendanceStatus === 'joined' && !p.isGuest
  ).length;
  
  return presentCount >= quorumRequired;
}

/**
 * Get initial room state
 */
export function getInitialRoomState(meetingId: string): MeetingRoomState {
  return {
    meetingId,
    meeting: null,
    status: 'waiting',
    mode: 'physical',
    startedAt: null,
    endedAt: null,
    pausedAt: null,
    duration: 0,
    currentAgendaItemId: null,
    currentAgendaItem: null,
    agendaItems: [],
    participants: [],
    expectedCount: 0,
    presentCount: 0,
    quorumRequired: 0,
    quorumMet: false,
    activeVote: null,
    castingDocument: null,
    isConnected: false,
    isSyncing: false,
    lastSyncAt: null,
    isRecording: false,
    recordingStartedAt: null,
  };
}
