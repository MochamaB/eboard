/**
 * Confirmation Workflow Utilities
 * Helper functions for meeting confirmation/approval workflow
 * 
 * Key Rules:
 * - System Admin CANNOT approve meetings (governance function, not admin privilege)
 * - Only the designated approver role for each board can approve
 * - Approver role is defined in BoardSettings.approverRoleId
 */

import { usersTable } from '../mocks/db/tables/users';
import { getBoardSettingsById, getBoardApproverRoleId } from '../mocks/db/tables/boardSettings';
import { userBoardRolesTable } from '../mocks/db/tables/userBoardRoles';
import { getRoleById } from '../mocks/db/tables/roles';
import { getLatestApprovalEvent, getApprovalEvents } from '../mocks/db/queries/meetingQueries';
import type { MeetingEventRow } from '../mocks/db/tables/meetingEvents';
import type { MeetingEvent } from '../types/meeting.types';
import { getDocumentSignatures } from '../mocks/db/tables/documentSignatures';
import { boardsTable } from '../mocks/db/tables/boards';

// ============================================================================
// TYPES
// ============================================================================

export interface ApproverInfo {
  canApprove: boolean;
  userId: number;
  userName: string;
  roleId: number;
  roleCode: string;
  roleLabel: string;
  reason?: string; // Why they can/cannot approve
}

export interface CertificateStatus {
  hasCertificate: boolean;
  certificateExpiry: string | null;
  isExpired: boolean;
  expiresWithin30Days: boolean;
  daysUntilExpiry: number | null;
}

export interface ConfirmationDisplayInfo {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  preparedBy: {
    name: string;
    title: string;
    date: string;
  };
  approvedBy?: {
    name: string;
    title: string;
    date: string;
    signatureId?: string;
    signatureImageUrl?: string; // Base64 data URL of drawn signature
  };
  rejectedBy?: {
    name: string;
    reason: string;
    reasonLabel: string;
    comments?: string;
    date: string;
  };
  unsignedDocumentUrl?: string;
  signedDocumentUrl?: string;
}

// Role labels for display
const ROLE_LABELS: Record<string, string> = {
  group_company_secretary: 'Group Company Secretary',
  company_secretary: 'Company Secretary',
  chairman: 'Chairman',
  board_secretary: 'Board Secretary',
  system_admin: 'System Administrator',
};

// Rejection reason labels
const REJECTION_REASON_LABELS: Record<string, string> = {
  incomplete_information: 'Incomplete Information',
  scheduling_conflict: 'Scheduling Conflict',
  agenda_not_approved: 'Agenda Not Approved',
  quorum_concerns: 'Quorum Concerns',
  other: 'Other',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user by ID
 */
const getUserById = (userId: number) => {
  return usersTable.find(u => u.id === userId);
};

/**
 * Get user's role on a specific board
 */
const getUserRoleOnBoard = (userId: number, boardId: string) => {
  const userBoardRole = userBoardRolesTable.find(
    ubr => ubr.userId === userId && ubr.boardId === boardId
  );
  if (!userBoardRole) return null;
  
  const role = getRoleById(userBoardRole.roleId);
  return role;
};

/**
 * Check if user has a specific role (by roleId) on any board or globally
 */
const userHasRole = (userId: number, roleId: number): boolean => {
  // Check if user has this role on any board
  return userBoardRolesTable.some(
    ubr => ubr.userId === userId && ubr.roleId === roleId
  );
};

/**
 * Check if user has a specific role on a specific board
 */
const userHasRoleOnBoard = (userId: number, roleId: number, boardId: string): boolean => {
  return userBoardRolesTable.some(
    ubr => ubr.userId === userId && ubr.roleId === roleId && ubr.boardId === boardId
  );
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Check if a user can approve meetings for a specific board
 * 
 * Rules:
 * 1. System Admin CANNOT approve (governance function)
 * 2. User must have the role specified in BoardSettings.approverRoleId
 * 3. For main boards, typically Group Company Secretary (roleId: 3)
 * 4. User must have valid certificate
 */
export const canUserApproveMeeting = (userId: number, boardId: string): ApproverInfo => {
  const user = getUserById(userId);
  if (!user) {
    return {
      canApprove: false,
      userId,
      userName: 'Unknown',
      roleId: 0,
      roleCode: '',
      roleLabel: '',
      reason: 'User not found',
    };
  }

  // Get the required approver role for this board
  const approverRoleId = getBoardApproverRoleId(boardId);
  if (!approverRoleId) {
    return {
      canApprove: false,
      userId,
      userName: user.fullName,
      roleId: 0,
      roleCode: '',
      roleLabel: '',
      reason: 'Board settings not found',
    };
  }

  const approverRole = getRoleById(approverRoleId);
  if (!approverRole) {
    return {
      canApprove: false,
      userId,
      userName: user.fullName,
      roleId: approverRoleId,
      roleCode: '',
      roleLabel: '',
      reason: 'Approver role not found',
    };
  }

  // Check if user has the required approver role
  // The approver role is typically a global role (like Group Company Secretary)
  // so we check if user has this role on ANY board or the specific board
  const hasApproverRole = userHasRole(userId, approverRoleId);

  if (!hasApproverRole) {
    // Get user's actual role on this board for display
    const userRole = getUserRoleOnBoard(userId, boardId);
    return {
      canApprove: false,
      userId,
      userName: user.fullName,
      roleId: userRole?.id || 0,
      roleCode: userRole?.code || '',
      roleLabel: ROLE_LABELS[userRole?.code || ''] || userRole?.name || 'Unknown Role',
      reason: `Only ${ROLE_LABELS[approverRole.code] || approverRole.name} can approve meetings for this board`,
    };
  }

  // User has the approver role
  return {
    canApprove: true,
    userId,
    userName: user.fullName,
    roleId: approverRoleId,
    roleCode: approverRole.code,
    roleLabel: ROLE_LABELS[approverRole.code] || approverRole.name,
    reason: `Approving as ${ROLE_LABELS[approverRole.code] || approverRole.name}`,
  };
};

/**
 * Get user's certificate status
 */
export const getUserCertificateStatus = (userId: number): CertificateStatus => {
  const user = getUserById(userId);
  if (!user) {
    return {
      hasCertificate: false,
      certificateExpiry: null,
      isExpired: true,
      expiresWithin30Days: false,
      daysUntilExpiry: null,
    };
  }

  if (!user.hasCertificate || !user.certificateExpiry) {
    return {
      hasCertificate: false,
      certificateExpiry: null,
      isExpired: true,
      expiresWithin30Days: false,
      daysUntilExpiry: null,
    };
  }

  const now = new Date();
  const expiryDate = new Date(user.certificateExpiry);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysUntilExpiry < 0;
  const expiresWithin30Days = !isExpired && daysUntilExpiry <= 30;

  return {
    hasCertificate: true,
    certificateExpiry: user.certificateExpiry,
    isExpired,
    expiresWithin30Days,
    daysUntilExpiry: isExpired ? null : daysUntilExpiry,
  };
};

/**
 * Get the designated approver for a board
 * Returns the user who should approve meetings for this board
 */
export const getBoardDesignatedApprover = (boardId: string): ApproverInfo | null => {
  const approverRoleId = getBoardApproverRoleId(boardId);
  if (!approverRoleId) return null;

  // Find a user who has this role
  const userWithRole = userBoardRolesTable.find(ubr => ubr.roleId === approverRoleId);
  if (!userWithRole) return null;

  const user = getUserById(userWithRole.userId);
  const role = getRoleById(approverRoleId);

  if (!user || !role) return null;

  return {
    canApprove: true,
    userId: user.id,
    userName: user.fullName,
    roleId: role.id,
    roleCode: role.code,
    roleLabel: ROLE_LABELS[role.code] || role.name,
  };
};

/**
 * Get confirmation display info for a meeting
 * Uses meetingEvents to determine approval status and display info
 */
export const getConfirmationDisplayInfo = (
  meetingId: string,
  createdBy: number,
  createdByName: string,
  createdAt: string,
  boardId?: string,
  meetingEvents?: (MeetingEvent | MeetingEventRow)[]
): ConfirmationDisplayInfo => {
  // Get the latest approval-related event for this meeting
  // Use provided events array if available, otherwise query mock table
  const latestEvent = meetingEvents 
    ? meetingEvents
        .filter(e => ['submitted_for_approval', 'approved', 'rejected', 'resubmitted'].includes(e.eventType))
        .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0]
    : getLatestApprovalEvent(meetingId);
  
  // Base info - always show prepared by
  const displayInfo: ConfirmationDisplayInfo = {
    status: 'none',
    preparedBy: {
      name: createdByName,
      title: 'Board Secretary',
      date: createdAt,
    },
  };

  // No approval events yet
  if (!latestEvent) {
    displayInfo.status = 'none';
    return displayInfo;
  }

  // Determine status based on latest event type
  const eventType = latestEvent.eventType;
  const metadata = latestEvent.metadata as Record<string, unknown> | null;

  if (eventType === 'approved') {
    displayInfo.status = 'approved';
    
    // Get approver details from event
    const approver = getUserById(latestEvent.performedBy);
    const approverRole = boardId 
      ? getUserRoleOnBoard(latestEvent.performedBy, boardId)
      : null;

    // Get signature image from documentSignatures table
    let signatureImageUrl: string | undefined;
    const signedDocId = metadata?.signedDocumentId as string | undefined;
    if (signedDocId) {
      const signatures = getDocumentSignatures(signedDocId);
      if (signatures.length > 0) {
        signatureImageUrl = signatures[0].signatureData || undefined;
      }
    }

    displayInfo.approvedBy = {
      name: latestEvent.performedByName || approver?.fullName || 'Unknown',
      title: approverRole ? (ROLE_LABELS[approverRole.code] || approverRole.name) : 'Approver',
      date: latestEvent.performedAt,
      signatureId: metadata?.signatureId as string | undefined,
      signatureImageUrl: signatureImageUrl,
    };
    
  } else if (eventType === 'rejected') {
    displayInfo.status = 'rejected';
    
    displayInfo.rejectedBy = {
      name: latestEvent.performedByName || 'Unknown',
      reason: (metadata?.rejectionReason as string) || 'other',
      reasonLabel: REJECTION_REASON_LABELS[(metadata?.rejectionReason as string) || 'other'] || 'Other',
      comments: metadata?.comments as string | undefined,
      date: latestEvent.performedAt,
    };
    
  } else if (eventType === 'submitted_for_approval' || eventType === 'resubmitted') {
    displayInfo.status = 'pending';
  }

  return displayInfo;
};

/**
 * Check if meeting requires confirmation based on board settings and meeting type
 */
export const meetingRequiresConfirmation = (boardId: string, meetingType: string): boolean => {
  // Emergency meetings skip confirmation
  if (meetingType === 'emergency') {
    return false;
  }

  const settings = getBoardSettingsById(boardId);
  return settings?.confirmationRequired ?? true; // Default to true for safety
};

/**
 * Get board name for display
 */
export const getBoardName = (boardId: string): string => {
  const board = boardsTable.find(b => b.id === boardId);
  return board?.name || 'Unknown Board';
};
