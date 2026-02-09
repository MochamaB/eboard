/**
 * Meeting Permission Types
 * Type definitions for the two-layer meeting permission system
 * 
 * Layer 1: Base permissions (from AuthContext) - role-based, configurable
 * Layer 2: Contextual permissions (computed) - meeting state-based, not configurable
 * 
 * NOTE: This system uses existing BoardRole from board.types.ts
 * No separate MeetingRole abstraction is needed.
 */

import type { MeetingStatus } from './meeting.types';

// ============================================================================
// PRE/POST MEETING PERMISSIONS (Meeting Detail Page)
// ============================================================================

/**
 * Contextual permissions for Pre-Meeting and Post-Meeting phases
 * Used in Meeting Detail page tabs
 */
export interface MeetingPermissions {
  // Editing Permissions
  canEditMeeting: boolean;           // Edit basic meeting info
  canEditParticipants: boolean;      // Add/remove participants
  canEditAgenda: boolean;            // Modify agenda items
  canEditDocuments: boolean;         // Upload/remove documents
  
  // Workflow Permissions (Pre-Meeting)
  canSubmitForApproval: boolean;     // Submit draft for approval
  canApprove: boolean;               // Approve pending meeting
  canReject: boolean;                // Reject pending meeting
  canCancel: boolean;                // Cancel meeting
  
  // Meeting Room Access Permissions
  canStartMeeting: boolean;          // Start meeting (host only, when scheduled.approved)
  canJoinMeeting: boolean;           // Join meeting (when in_progress)
  
  // Minutes Permissions (Post-Meeting)
  canCreateMinutes: boolean;         // Create new minutes
  canEditMinutes: boolean;           // Edit draft minutes
  canSubmitMinutes: boolean;         // Submit draft minutes for review
  canApproveMinutes: boolean;        // Approve minutes (Chairman)
  canRequestRevision: boolean;       // Request revision on minutes (Chairman)
  canPublishMinutes: boolean;        // Publish approved minutes
  canSignMinutes: boolean;           // Digitally sign minutes
  canCommentOnMinutes: boolean;      // Add comments during review
  canResolveComments: boolean;       // Resolve comments (Secretary)
  canViewMinutes: boolean;           // View minutes (any status)
  
  // General Permissions
  isReadOnly: boolean;               // All editing disabled
  canExport: boolean;                // Export meeting data
  canDownload: boolean;              // Download documents
  canViewDocuments: boolean;         // View attached documents
}

// ============================================================================
// MEETING ROOM PERMISSIONS (Live Meeting)
// ============================================================================

/**
 * Contextual permissions for live Meeting Room
 * Used during in_progress meetings
 */
export interface MeetingRoomPermissions {
  // Meeting Control
  canStartMeeting: boolean;          // Start the meeting
  canEndMeeting: boolean;            // End the meeting
  canPauseMeeting: boolean;          // Pause/resume meeting
  
  // Agenda Control
  canNavigateAgenda: boolean;        // Move to next/previous item
  canMarkItemDiscussed: boolean;     // Mark agenda item as discussed
  canDeferItem: boolean;             // Defer item to next meeting
  
  // Voting Permissions
  canCreateVote: boolean;            // Create new vote
  canStartVote: boolean;             // Start/open voting
  canCloseVote: boolean;             // Close voting
  canCastVote: boolean;              // Cast own vote
  canViewVoteResults: boolean;       // View results (may be restricted)
  
  // Document Permissions
  canCastDocument: boolean;          // Cast/present document to all
  canNavigateDocument: boolean;      // Control document pages during cast
  canStopCasting: boolean;           // Stop document casting
  canViewDocuments: boolean;         // View meeting documents
  
  // Minutes Permissions
  canTakeMinutes: boolean;           // Edit live minutes
  canViewMinutes: boolean;           // View minutes panel
  
  // Participant Management
  canAdmitParticipants: boolean;     // Admit from waiting room
  canRemoveParticipant: boolean;     // Remove participant from meeting
  canMuteOthers: boolean;            // Mute other participants
  canPromoteToPresenter: boolean;    // Give presenter permissions
  
  // Recording & Media
  canStartRecording: boolean;        // Start/stop recording
  canShareScreen: boolean;           // Share own screen
  canToggleVideo: boolean;           // Control own video
  canToggleAudio: boolean;           // Control own audio
  
  // General
  canRaiseHand: boolean;             // Raise hand (always allowed)
  canSendChat: boolean;              // Send chat messages
  canLeave: boolean;                 // Leave meeting (always allowed)
}

// ============================================================================
// PERMISSION CONTEXT (Inputs for computation)
// ============================================================================

/**
 * Context information needed to compute permissions
 * Gathered from various contexts and state
 * 
 * NOTE: This interface is not currently used by the hooks.
 * Keeping for reference but may be removed in future.
 */
export interface PermissionContext {
  // User info
  userId: number | string;
  boardRole: string | undefined;     // From participant.boardRole
  
  // Meeting state
  meetingId: string;
  meetingStatus: MeetingStatus;
  meetingSubStatus: string | null | undefined;
  
  // Board context
  boardId: string;
  
  // Base permissions (from Layer 1)
  hasBasePermission: (code: string, boardId?: string) => boolean;
}

// ============================================================================
// ROOM STATE (for room permissions)
// ============================================================================

/**
 * Meeting room state needed for permission computation
 * Will be provided by MeetingRoomContext
 */
export interface RoomState {
  status: 'waiting' | 'starting' | 'in_progress' | 'paused' | 'ending' | 'ended';
  mode: 'physical' | 'virtual' | 'hybrid';
  
  // Quorum
  quorumRequired: number;
  quorumMet: boolean;
  
  // Active states
  activeVote: {
    id: string;
    status: 'open' | 'closed';
    userHasVoted: boolean;
  } | null;
  
  castingDocument: {
    documentId: string;
    casterId: string | number;
  } | null;
  
  isRecording: boolean;
  
  // Participants
  waitingRoomCount: number;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Permission check result with reason
 * Useful for displaying tooltips on disabled buttons
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Base permission codes used in the system
 * Reference to existing permission system
 */
export const BASE_PERMISSION_CODES = {
  // Meetings
  MEETINGS_VIEW: 'meetings.view',
  MEETINGS_CREATE: 'meetings.create',
  MEETINGS_EDIT: 'meetings.edit',
  MEETINGS_CANCEL: 'meetings.cancel',
  MEETINGS_CONTROL: 'meetings.control',
  MEETINGS_PRESENT: 'meetings.present',
  
  // Documents
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  
  // Voting
  VOTING_VIEW: 'voting.view',
  VOTING_CREATE: 'voting.create',
  VOTING_CAST: 'voting.cast',
  VOTING_START: 'voting.start',
  
  // Minutes
  MINUTES_VIEW: 'minutes.view',
  MINUTES_CREATE: 'minutes.create',
  MINUTES_APPROVE: 'minutes.approve',
  MINUTES_SIGN: 'minutes.sign',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
} as const;
