/**
 * useMeetingPermissions Hook
 * Computes contextual permissions for Pre-Meeting and Post-Meeting phases
 * 
 * Layer 2 of the two-layer permission system:
 * - Takes base permissions from AuthContext (Layer 1)
 * - Combines with meeting state to compute contextual permissions
 * - Used in Meeting Detail page tabs
 */

import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBoardContext } from '../../contexts/BoardContext';
import { useMeetingPhase } from '../../contexts/MeetingPhaseContext';
import { useMinutesByMeeting } from '../api/useMinutes';
import { determineMeetingHost, getUserHostRole } from '../../types/meetingRoom.types';
import type { MeetingPermissions } from '../../types/meetingPermissions.types';

const PERMISSION_CODES = {
  MEETINGS_EDIT: 'meetings.edit',
  MEETINGS_CANCEL: 'meetings.cancel',
  MEETINGS_CONTROL: 'meetings.control',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  DOCUMENTS_VIEW: 'documents.view',
  MINUTES_CREATE: 'minutes.create',
  MINUTES_APPROVE: 'minutes.approve',
  MINUTES_SIGN: 'minutes.sign',
  REPORTS_EXPORT: 'reports.export',
} as const;

/**
 * Main hook for computing meeting permissions
 */
export function useMeetingPermissions(): MeetingPermissions {
  const { user, hasPermission } = useAuth();
  const { currentBoard } = useBoardContext();
  const { meeting, phaseInfo } = useMeetingPhase();
  
  // Fetch minutes data for status checks
  const { data: minutes } = useMinutesByMeeting(meeting?.id || '', {
    enabled: !!meeting?.id && meeting?.status === 'completed',
  });
  
  return useMemo(() => {
    // Default: no permissions
    if (!user || !meeting || !phaseInfo || !currentBoard) {
      return {
        canEditMeeting: false,
        canEditParticipants: false,
        canEditAgenda: false,
        canEditDocuments: false,
        canSubmitForApproval: false,
        canApprove: false,
        canReject: false,
        canCancel: false,
        canStartMeeting: false,
        canJoinMeeting: false,
        canCreateMinutes: false,
        canEditMinutes: false,
        canSubmitMinutes: false,
        canApproveMinutes: false,
        canRequestRevision: false,
        canPublishMinutes: false,
        canSignMinutes: false,
        canCommentOnMinutes: false,
        canResolveComments: false,
        canViewMinutes: false,
        isReadOnly: true,
        canExport: false,
        canDownload: false,
        canViewDocuments: false,
      };
    }
    
    const boardId = currentBoard.id;
    const { status, subStatus } = meeting;
    const { phase } = phaseInfo;
    
    // Check base permissions (Layer 1)
    const hasEditPermission = hasPermission(PERMISSION_CODES.MEETINGS_EDIT, boardId);
    const hasCancelPermission = hasPermission(PERMISSION_CODES.MEETINGS_CANCEL, boardId);
    const hasUploadPermission = hasPermission(PERMISSION_CODES.DOCUMENTS_UPLOAD, boardId);
    const hasDownloadPermission = hasPermission(PERMISSION_CODES.DOCUMENTS_DOWNLOAD, boardId);
    const hasViewDocsPermission = hasPermission(PERMISSION_CODES.DOCUMENTS_VIEW, boardId);
    const hasCreateMinutesPermission = hasPermission(PERMISSION_CODES.MINUTES_CREATE, boardId);
    const hasApproveMinutesPermission = hasPermission(PERMISSION_CODES.MINUTES_APPROVE, boardId);
    const hasSignMinutesPermission = hasPermission(PERMISSION_CODES.MINUTES_SIGN, boardId);
    const hasExportPermission = hasPermission(PERMISSION_CODES.REPORTS_EXPORT, boardId);
    
    // Determine if meeting is in read-only state
    const isReadOnly = 
      status === 'cancelled' || 
      (status === 'completed' && subStatus === 'archived');
    
    // If read-only, return minimal permissions
    if (isReadOnly) {
      return {
        canEditMeeting: false,
        canEditParticipants: false,
        canEditAgenda: false,
        canEditDocuments: false,
        canSubmitForApproval: false,
        canApprove: false,
        canReject: false,
        canCancel: false,
        canStartMeeting: false,
        canJoinMeeting: false,
        canCreateMinutes: false,
        canEditMinutes: false,
        canSubmitMinutes: false,
        canApproveMinutes: false,
        canRequestRevision: false,
        canPublishMinutes: false,
        canSignMinutes: false,
        canCommentOnMinutes: false,
        canResolveComments: false,
        canViewMinutes: !!minutes,
        isReadOnly: true,
        canExport: hasExportPermission,
        canDownload: hasDownloadPermission,
        canViewDocuments: hasViewDocsPermission,
      };
    }
    
    // Compute contextual permissions based on phase and status
    // Layer 2: Only check meeting state conditions - base permissions already checked in Layer 1
    
    // PRE-MEETING PERMISSIONS
    const canEditMeeting = 
      hasEditPermission && 
      (status === 'draft' || (status === 'scheduled' && subStatus === 'rejected'));
    
    const canEditParticipants = 
      hasEditPermission && 
      (
        status === 'draft' || 
        (status === 'scheduled' && (subStatus === 'pending_approval' || subStatus === 'rejected'))
      );
    
    const canEditAgenda = 
      hasEditPermission && 
      (
        status === 'draft' || 
        (status === 'scheduled' && (subStatus === 'pending_approval' || subStatus === 'rejected'))
      );
    
    const canEditDocuments = 
      hasUploadPermission && 
      (
        status === 'draft' || 
        (status === 'scheduled' && (subStatus === 'pending_approval' || subStatus === 'rejected')) ||
        (status === 'completed' && subStatus === 'recent') // Allow post-meeting docs
      );
    
    const canSubmitForApproval = 
      hasEditPermission && 
      status === 'draft' && 
      subStatus === 'complete';
    
    const canApprove = 
      hasEditPermission && 
      status === 'scheduled' && 
      subStatus === 'pending_approval';
    
    const canReject = 
      hasEditPermission && 
      status === 'scheduled' && 
      subStatus === 'pending_approval';
    
    const canCancel = 
      hasCancelPermission && 
      phase === 'pre-meeting';
    
    // MEETING ROOM ACCESS PERMISSIONS
    // Determine host from meeting participants
    const hostInfo = meeting.participants 
      ? determineMeetingHost(meeting.participants.map(p => ({
          userId: p.userId,
          name: p.name,
          boardRole: p.boardRole,
        })))
      : { hostUserId: null, hostName: null, cohostUserId: null, cohostName: null };
    
    const userHostRole = getUserHostRole(
      user.id,
      hostInfo,
      user.globalRole?.code
    );
    const isSystemAdmin = user.globalRole?.code === 'system_admin';
    const isHostOrCohost = userHostRole === 'host' || userHostRole === 'cohost';
    
    // Can start meeting: host/cohost/admin with control permission, when scheduled.approved
    const hasControlPermission = hasPermission(PERMISSION_CODES.MEETINGS_CONTROL, boardId);
    const canStartMeeting = 
      (hasControlPermission || isHostOrCohost || isSystemAdmin) && 
      status === 'scheduled' && 
      subStatus === 'approved';
    
    // Can join meeting: any participant when meeting is in_progress
    const canJoinMeeting = status === 'in_progress';
    
    // POST-MEETING PERMISSIONS
    // Minutes creation and editing
    const canCreateMinutes = 
      hasCreateMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      !minutes; // No minutes exist yet
    
    const canEditMinutes = 
      hasCreateMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      minutes?.status === 'draft'; // Minutes in draft state
    
    const canSubmitMinutes = 
      hasCreateMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      minutes?.status === 'draft'; // Can submit draft for review
    
    // Minutes approval workflow
    const canApproveMinutes = 
      hasApproveMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      minutes?.status === 'pending_review'; // Minutes pending approval
    
    const canRequestRevision = 
      hasApproveMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      minutes?.status === 'pending_review'; // Can request changes
    
    // Minutes publishing and signing
    const canPublishMinutes = 
      hasCreateMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      minutes?.status === 'approved'; // Approved but not published
    
    const canSignMinutes = 
      hasSignMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      (minutes?.status === 'approved' || minutes?.status === 'published'); // Can sign approved/published minutes
    
    // Minutes collaboration
    const canCommentOnMinutes = 
      status === 'completed' && 
      subStatus === 'recent' &&
      minutes?.status === 'pending_review' &&
      (minutes?.allowComments ?? false); // Comments enabled during review
    
    const canResolveComments = 
      hasCreateMinutesPermission && 
      status === 'completed' && 
      subStatus === 'recent' &&
      minutes?.status === 'pending_review'; // Secretary can resolve comments
    
    const canViewMinutes = 
      hasViewDocsPermission &&
      !!minutes; // Can view if minutes exist
    
    // GENERAL PERMISSIONS
    const canExport = hasExportPermission;
    const canDownload = hasDownloadPermission;
    const canViewDocuments = hasViewDocsPermission;
    
    return {
      canEditMeeting,
      canEditParticipants,
      canEditAgenda,
      canEditDocuments,
      canSubmitForApproval,
      canApprove,
      canReject,
      canCancel,
      canStartMeeting,
      canJoinMeeting,
      canCreateMinutes,
      canEditMinutes,
      canSubmitMinutes,
      canApproveMinutes,
      canRequestRevision,
      canPublishMinutes,
      canSignMinutes,
      canCommentOnMinutes,
      canResolveComments,
      canViewMinutes,
      isReadOnly,
      canExport,
      canDownload,
      canViewDocuments,
    };
  }, [user, meeting, phaseInfo, currentBoard, hasPermission]);
}
