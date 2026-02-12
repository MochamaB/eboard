/**
 * Meeting Room Types
 * Type definitions for live meeting room state and behavior
 */

import type { Meeting, MeetingParticipant } from './meeting.types';
import type { AgendaItem } from './agenda.types';

// ============================================================================
// MEETING ROOM SETTINGS (Core 5)
// ============================================================================

/**
 * Voting method options
 */
export type VotingMethod = 'show_of_hands' | 'secret_ballot' | 'roll_call';

/**
 * Quorum enforcement mode
 */
export type QuorumEnforcement = 'block' | 'warn';

/**
 * Meeting room settings — configurable by host before/during meeting
 * Core 5 settings for initial implementation
 */
export interface MeetingRoomSettings {
  // 1. Waiting room (virtual/hybrid)
  enableWaitingRoom: boolean;
  allowJoinBeforeHost: boolean;

  // 2. Mute on entry (virtual/hybrid)
  muteParticipantsOnEntry: boolean;
  allowSelfUnmute: boolean;

  // 3. Quorum enforcement
  quorumEnforcement: QuorumEnforcement; // 'block' = prevent start, 'warn' = allow override

  // 4. Default vote duration (seconds)
  defaultVoteDuration: number;
  requireSeconding: boolean;
  votingMethod: VotingMethod;

  // 5. Auto-record
  autoRecord: boolean;
}

/**
 * Default meeting room settings
 */
export const DEFAULT_MEETING_ROOM_SETTINGS: MeetingRoomSettings = {
  enableWaitingRoom: true,
  allowJoinBeforeHost: false,
  muteParticipantsOnEntry: true,
  allowSelfUnmute: true,
  quorumEnforcement: 'block',
  defaultVoteDuration: 120, // 2 minutes
  requireSeconding: false,
  votingMethod: 'show_of_hands',
  autoRecord: false,
};

// ============================================================================
// MEETING HOST
// ============================================================================

/**
 * Meeting host role in the room
 */
export type HostRole = 'host' | 'cohost' | 'participant';

/**
 * Meeting host info
 */
export interface MeetingHostInfo {
  hostUserId: string | number | null;
  hostName: string | null;
  cohostUserId: string | number | null;
  cohostName: string | null;
}

/**
 * Determine the meeting host from participants.
 * Host = Chairman (presides), CoHost = Secretary (admin duties).
 * Falls back to Vice Chairman if Chairman absent.
 */
export function determineMeetingHost(
  participants: Array<{ userId: string | number; name?: string; boardRole?: string }>
): MeetingHostInfo {
  const chairman = participants.find(p =>
    p.boardRole === 'chairman' || p.boardRole === 'group_chairman'
  );
  const viceChairman = participants.find(p =>
    p.boardRole === 'vice_chairman'
  );
  const secretary = participants.find(p =>
    p.boardRole === 'board_secretary' ||
    p.boardRole === 'company_secretary' ||
    p.boardRole === 'group_company_secretary'
  );

  const host = chairman || viceChairman;

  return {
    hostUserId: host?.userId ?? null,
    hostName: host?.name ?? null,
    cohostUserId: secretary?.userId ?? null,
    cohostName: secretary?.name ?? null,
  };
}

/**
 * Check if a user is the meeting host, cohost, or system admin
 */
export function getUserHostRole(
  userId: string | number,
  hostInfo: MeetingHostInfo,
  globalRoleCode?: string
): HostRole {
  // System admin is always treated as host
  if (globalRoleCode === 'system_admin') return 'host';
  if (String(userId) === String(hostInfo.hostUserId)) return 'host';
  if (String(userId) === String(hostInfo.cohostUserId)) return 'cohost';
  return 'participant';
}

// ============================================================================
// STATE GUARDS / ROOM CAPABILITIES
// ============================================================================

/**
 * What is possible at the current room status.
 * Combined with user permissions to produce final capabilities.
 */
export interface RoomCapabilities {
  // Agenda
  canNavigateAgenda: boolean;
  canMarkItemDiscussed: boolean;
  canDeferItem: boolean;

  // Voting
  canCreateVote: boolean;
  canStartVote: boolean;
  canCastVote: boolean;
  canCloseVote: boolean;
  isVoteTimerRunning: boolean;

  // Documents
  canBrowseDocuments: boolean;
  canCastDocument: boolean;
  canNavigatePages: boolean;
  canStopCasting: boolean;

  // Recording
  canToggleRecording: boolean;

  // Meeting Control
  canStart: boolean;
  canPause: boolean;
  canResume: boolean;
  canEnd: boolean;
  canLeave: boolean;

  // Display
  showQuorumIndicator: boolean;
  showParticipantStrip: boolean;
  showControlsBar: boolean;
  showActiveVote: boolean;
  isReadOnly: boolean;
}

/**
 * Get what actions are structurally possible at a given room status.
 * This is STATUS-based only — does NOT factor in user permissions.
 * Combine with permission checks for the final result.
 */
export function getStatusCapabilities(status: RoomStatus): RoomCapabilities {
  switch (status) {
    case 'waiting':
      return {
        canNavigateAgenda: false,
        canMarkItemDiscussed: false,
        canDeferItem: false,
        canCreateVote: false,
        canStartVote: false,
        canCastVote: false,
        canCloseVote: false,
        isVoteTimerRunning: false,
        canBrowseDocuments: true,
        canCastDocument: false,
        canNavigatePages: false,
        canStopCasting: false,
        canToggleRecording: false,
        canStart: true,
        canPause: false,
        canResume: false,
        canEnd: false,
        canLeave: true,
        showQuorumIndicator: true,
        showParticipantStrip: true,
        showControlsBar: true,
        showActiveVote: false,
        isReadOnly: false,
      };
    case 'starting':
      return {
        canNavigateAgenda: false,
        canMarkItemDiscussed: false,
        canDeferItem: false,
        canCreateVote: false,
        canStartVote: false,
        canCastVote: false,
        canCloseVote: false,
        isVoteTimerRunning: false,
        canBrowseDocuments: false,
        canCastDocument: false,
        canNavigatePages: false,
        canStopCasting: false,
        canToggleRecording: false,
        canStart: false,
        canPause: false,
        canResume: false,
        canEnd: false,
        canLeave: false,
        showQuorumIndicator: true,
        showParticipantStrip: true,
        showControlsBar: true,
        showActiveVote: false,
        isReadOnly: false,
      };
    case 'in_progress':
      return {
        canNavigateAgenda: true,
        canMarkItemDiscussed: true,
        canDeferItem: true,
        canCreateVote: true,
        canStartVote: true,
        canCastVote: true,
        canCloseVote: true,
        isVoteTimerRunning: true,
        canBrowseDocuments: true,
        canCastDocument: true,
        canNavigatePages: true,
        canStopCasting: true,
        canToggleRecording: true,
        canStart: false,
        canPause: true,
        canResume: false,
        canEnd: true,
        canLeave: true,
        showQuorumIndicator: true,
        showParticipantStrip: true,
        showControlsBar: true,
        showActiveVote: true,
        isReadOnly: false,
      };
    case 'paused':
      return {
        canNavigateAgenda: false,
        canMarkItemDiscussed: false,
        canDeferItem: false,
        canCreateVote: false,
        canStartVote: false,
        canCastVote: false,
        canCloseVote: false,
        isVoteTimerRunning: false, // Timer paused
        canBrowseDocuments: true,
        canCastDocument: false,
        canNavigatePages: true, // Existing cast continues
        canStopCasting: true,
        canToggleRecording: false,
        canStart: false,
        canPause: false,
        canResume: true,
        canEnd: true,
        canLeave: true,
        showQuorumIndicator: true,
        showParticipantStrip: true,
        showControlsBar: true,
        showActiveVote: true, // Show but frozen
        isReadOnly: false,
      };
    case 'ending':
      return {
        canNavigateAgenda: false,
        canMarkItemDiscussed: false,
        canDeferItem: false,
        canCreateVote: false,
        canStartVote: false,
        canCastVote: false,
        canCloseVote: false,
        isVoteTimerRunning: false,
        canBrowseDocuments: false,
        canCastDocument: false,
        canNavigatePages: false,
        canStopCasting: false,
        canToggleRecording: false,
        canStart: false,
        canPause: false,
        canResume: false,
        canEnd: false,
        canLeave: false,
        showQuorumIndicator: false,
        showParticipantStrip: true,
        showControlsBar: true,
        showActiveVote: false,
        isReadOnly: true,
      };
    case 'ended':
      return {
        canNavigateAgenda: false,
        canMarkItemDiscussed: false,
        canDeferItem: false,
        canCreateVote: false,
        canStartVote: false,
        canCastVote: false,
        canCloseVote: false,
        isVoteTimerRunning: false,
        canBrowseDocuments: true,
        canCastDocument: false,
        canNavigatePages: false,
        canStopCasting: false,
        canToggleRecording: false,
        canStart: false,
        canPause: false,
        canResume: false,
        canEnd: false,
        canLeave: true,
        showQuorumIndicator: false,
        showParticipantStrip: false,
        showControlsBar: true,
        showActiveVote: false,
        isReadOnly: true,
      };
  }
}

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
// MODE FEATURES & TRANSITIONS
// ============================================================================

/**
 * Feature visibility flags derived from current computed mode.
 * Maps to Section 2.3 of 0308_MEETING_ROOM_IMPLEMENTATION.md:
 *   Physical: core + physical features
 *   Virtual:  core + virtual features
 *   Hybrid:   core + physical + virtual + hybrid features
 */
export interface ModeFeatures {
  // Which feature groups are visible
  showVirtualFeatures: boolean;   // Video tiles, AV controls, screen share, waiting room
  showPhysicalFeatures: boolean;  // QR check-in, manual attendance, in-room indicators
  showHybridFeatures: boolean;    // Audio bridge, mode indicator, split view

  // Participant counts by location
  physicalCount: number;
  virtualCount: number;

  // Convenience
  isPhysicalOnly: boolean;
  isVirtualOnly: boolean;
  isHybrid: boolean;
}

/**
 * Mode transition record for notifications
 */
export interface ModeTransition {
  from: MeetingMode;
  to: MeetingMode;
  timestamp: string;
  trigger?: string; // e.g. "Remote participant joined"
}

/**
 * Compute feature visibility from current mode and participant states.
 */
export function computeModeFeatures(mode: MeetingMode, participants: Array<{ attendanceStatus: string; connectionStatus: string }>): ModeFeatures {
  const joined = participants.filter(p => p.attendanceStatus === 'joined');
  const physicalCount = joined.filter(p => p.connectionStatus === 'in_room').length;
  const virtualCount = joined.filter(p => p.connectionStatus === 'connected' || p.connectionStatus === 'connecting').length;

  return {
    showVirtualFeatures: mode === 'virtual' || mode === 'hybrid',
    showPhysicalFeatures: mode === 'physical' || mode === 'hybrid',
    showHybridFeatures: mode === 'hybrid',
    physicalCount,
    virtualCount,
    isPhysicalOnly: mode === 'physical',
    isVirtualOnly: mode === 'virtual',
    isHybrid: mode === 'hybrid',
  };
}

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
  fileType: string;
  currentPage: number;
  totalPages: number;
  casterId: string;
  casterName: string;
  startedAt: string;
  // Security (from Document model)
  watermarkEnabled: boolean;
  isConfidential: boolean;
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
  previousMode: MeetingMode | null;
  modeFeatures: ModeFeatures;
  
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
  
  // Host
  hostInfo: MeetingHostInfo;
  
  // Settings
  settings: MeetingRoomSettings;
  
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
  
  // Mode transitions (for testing/demo)
  toggleParticipantLocation: (participantId: string) => void;
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
  
  // State guards
  capabilities: RoomCapabilities;
  
  // Mode-derived feature visibility
  modeFeatures: ModeFeatures;
  
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
export type SidePanelTab = 'notice' | 'agenda' | 'participants' | 'documents' | 'voting' | 'minutes' | 'chat' | 'notes';

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
    previousMode: null,
    modeFeatures: computeModeFeatures('physical', []),
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
    hostInfo: { hostUserId: null, hostName: null, cohostUserId: null, cohostName: null },
    settings: { ...DEFAULT_MEETING_ROOM_SETTINGS },
    activeVote: null,
    castingDocument: null,
    isConnected: false,
    isSyncing: false,
    lastSyncAt: null,
    isRecording: false,
    recordingStartedAt: null,
  };
}
