/**
 * Notification Queries (Mock)
 * Helper functions for sending notifications related to meeting confirmation workflow
 * 
 * In production, these would trigger actual email/push notifications via the backend.
 * For the prototype, we log to console and store in a mock notifications table.
 */

import { usersTable } from '../tables/users';
import { meetingsTable } from '../tables/meetings';
import { meetingParticipantsTable } from '../tables/meetingParticipants';
import { getBoardApproverRoleId } from '../tables/boardSettings';
import { userBoardRolesTable } from '../tables/userBoardRoles';
import { REJECTION_REASON_LABELS } from '../../../types/meeting.types';
import { idsMatch } from '../utils/idUtils';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationPayload {
  id: string;
  type: 'meeting_submitted' | 'meeting_confirmed' | 'meeting_rejected' | 'meeting_resubmitted';
  recipientId: number;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  meetingId: string;
  meetingTitle: string;
  boardId: string;
  createdAt: string;
  read: boolean;
}

// Mock notifications storage
const notificationsStore: NotificationPayload[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique notification ID
 */
const generateNotificationId = (): string => {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get user by ID
 */
const getUserById = (userId: number) => {
  return usersTable.find(u => u.id === userId);
};

/**
 * Get meeting by ID
 */
const getMeetingById = (meetingId: string) => {
  return meetingsTable.find(m => m.id === meetingId);
};

/**
 * Get the designated approver(s) for a board
 */
const getApproversForBoard = (boardId: string): typeof usersTable => {
  const approverRoleId = getBoardApproverRoleId(boardId);
  if (!approverRoleId) return [];

  // Find users with this role
  const userIdsWithRole = userBoardRolesTable
    .filter(ubr => ubr.roleId === approverRoleId)
    .map(ubr => ubr.userId);

  return usersTable.filter(u => userIdsWithRole.includes(u.id));
};

/**
 * Get meeting participants (for notification recipients)
 */
const getMeetingParticipantUsers = (meetingId: string): typeof usersTable => {
  const participants = meetingParticipantsTable.filter(p => idsMatch(p.meetingId, meetingId));
  const participantUserIds = participants
    .filter(p => p.userId)
    .map(p => p.userId);

  return usersTable.filter(u => participantUserIds.includes(u.id));
};

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send notification when a meeting is submitted for confirmation
 * Recipients: Designated approver(s) for the board
 */
export const sendMeetingSubmittedNotification = (
  meetingId: string,
  submittedByUserId: number
): NotificationPayload[] => {
  const meeting = getMeetingById(meetingId);
  const submitter = getUserById(submittedByUserId);
  
  if (!meeting || !submitter) {
    console.warn('[Notification] Meeting or submitter not found');
    return [];
  }

  const approvers = getApproversForBoard(meeting.boardId);
  const notifications: NotificationPayload[] = [];

  for (const approver of approvers) {
    const notification: NotificationPayload = {
      id: generateNotificationId(),
      type: 'meeting_submitted',
      recipientId: approver.id,
      recipientEmail: approver.email,
      recipientName: approver.fullName,
      subject: `Meeting Confirmation Required: ${meeting.title}`,
      body: `
Dear ${approver.fullName},

A meeting has been submitted for your confirmation:

Meeting: ${meeting.title}
Date: ${meeting.scheduledDate}
Submitted by: ${submitter.fullName}

Please review and approve or reject this meeting at your earliest convenience.

Best regards,
eBoard System
      `.trim(),
      meetingId,
      meetingTitle: meeting.title,
      boardId: meeting.boardId,
      createdAt: new Date().toISOString(),
      read: false,
    };

    notificationsStore.push(notification);
    notifications.push(notification);

    // Log for demo purposes
    console.log(`[Notification] Meeting submitted - sent to ${approver.fullName} (${approver.email})`);
  }

  return notifications;
};

/**
 * Send notification when a meeting is confirmed
 * Recipients: Meeting creator + all participants
 */
export const sendMeetingConfirmedNotification = (
  meetingId: string,
  confirmedByUserId: number
): NotificationPayload[] => {
  const meeting = getMeetingById(meetingId);
  const confirmer = getUserById(confirmedByUserId);
  
  if (!meeting || !confirmer) {
    console.warn('[Notification] Meeting or confirmer not found');
    return [];
  }

  // Get all recipients: creator + participants
  const creator = getUserById(meeting.createdBy);
  const participants = getMeetingParticipantUsers(meetingId);
  
  const recipientIds = new Set<number>();
  if (creator) recipientIds.add(creator.id);
  participants.forEach(p => recipientIds.add(p.id));

  const notifications: NotificationPayload[] = [];

  for (const recipientId of recipientIds) {
    const recipient = getUserById(recipientId);
    if (!recipient) continue;

    const notification: NotificationPayload = {
      id: generateNotificationId(),
      type: 'meeting_confirmed',
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      recipientName: recipient.fullName,
      subject: `Meeting Confirmed: ${meeting.title}`,
      body: `
Dear ${recipient.fullName},

The following meeting has been confirmed:

Meeting: ${meeting.title}
Date: ${meeting.scheduledDate}
Confirmed by: ${confirmer.fullName}

You may now view the signed meeting notice document.

Best regards,
eBoard System
      `.trim(),
      meetingId,
      meetingTitle: meeting.title,
      boardId: meeting.boardId,
      createdAt: new Date().toISOString(),
      read: false,
    };

    notificationsStore.push(notification);
    notifications.push(notification);

    // Log for demo purposes
    console.log(`[Notification] Meeting confirmed - sent to ${recipient.fullName} (${recipient.email})`);
  }

  return notifications;
};

/**
 * Send notification when a meeting confirmation is rejected
 * Recipients: Meeting creator
 */
export const sendMeetingRejectedNotification = (
  meetingId: string,
  rejectedByUserId: number,
  reason: string,
  comments?: string
): NotificationPayload[] => {
  const meeting = getMeetingById(meetingId);
  const rejector = getUserById(rejectedByUserId);
  const creator = meeting ? getUserById(meeting.createdBy) : null;
  
  if (!meeting || !rejector || !creator) {
    console.warn('[Notification] Meeting, rejector, or creator not found');
    return [];
  }

  const reasonLabel = REJECTION_REASON_LABELS[reason as keyof typeof REJECTION_REASON_LABELS] || reason;

  const notification: NotificationPayload = {
    id: generateNotificationId(),
    type: 'meeting_rejected',
    recipientId: creator.id,
    recipientEmail: creator.email,
    recipientName: creator.fullName,
    subject: `Meeting Confirmation Rejected: ${meeting.title}`,
    body: `
Dear ${creator.fullName},

The confirmation for the following meeting has been rejected:

Meeting: ${meeting.title}
Date: ${meeting.scheduledDate}
Rejected by: ${rejector.fullName}
Reason: ${reasonLabel}
${comments ? `Comments: ${comments}` : ''}

Please address the concerns and resubmit for confirmation.

Best regards,
eBoard System
    `.trim(),
    meetingId,
    meetingTitle: meeting.title,
    boardId: meeting.boardId,
    createdAt: new Date().toISOString(),
    read: false,
  };

  notificationsStore.push(notification);

  // Log for demo purposes
  console.log(`[Notification] Meeting rejected - sent to ${creator.fullName} (${creator.email})`);

  return [notification];
};

/**
 * Send notification when a meeting is resubmitted after rejection
 * Recipients: Designated approver(s) for the board
 */
export const sendMeetingResubmittedNotification = (
  meetingId: string,
  resubmittedByUserId: number
): NotificationPayload[] => {
  const meeting = getMeetingById(meetingId);
  const resubmitter = getUserById(resubmittedByUserId);
  
  if (!meeting || !resubmitter) {
    console.warn('[Notification] Meeting or resubmitter not found');
    return [];
  }

  const approvers = getApproversForBoard(meeting.boardId);
  const notifications: NotificationPayload[] = [];

  for (const approver of approvers) {
    const notification: NotificationPayload = {
      id: generateNotificationId(),
      type: 'meeting_resubmitted',
      recipientId: approver.id,
      recipientEmail: approver.email,
      recipientName: approver.fullName,
      subject: `Meeting Resubmitted for Confirmation: ${meeting.title}`,
      body: `
Dear ${approver.fullName},

A previously rejected meeting has been resubmitted for your confirmation:

Meeting: ${meeting.title}
Date: ${meeting.scheduledDate}
Resubmitted by: ${resubmitter.fullName}

Please review the updated meeting details and approve or reject.

Best regards,
eBoard System
      `.trim(),
      meetingId,
      meetingTitle: meeting.title,
      boardId: meeting.boardId,
      createdAt: new Date().toISOString(),
      read: false,
    };

    notificationsStore.push(notification);
    notifications.push(notification);

    // Log for demo purposes
    console.log(`[Notification] Meeting resubmitted - sent to ${approver.fullName} (${approver.email})`);
  }

  return notifications;
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all notifications for a user
 */
export const getNotificationsForUser = (userId: number): NotificationPayload[] => {
  return notificationsStore
    .filter(n => n.recipientId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = (userId: number): number => {
  return notificationsStore.filter(n => n.recipientId === userId && !n.read).length;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = (notificationId: string): boolean => {
  const notification = notificationsStore.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = (userId: number): number => {
  let count = 0;
  notificationsStore.forEach(n => {
    if (n.recipientId === userId && !n.read) {
      n.read = true;
      count++;
    }
  });
  return count;
};

/**
 * Get all notifications (for debugging)
 */
export const getAllNotifications = (): NotificationPayload[] => {
  return [...notificationsStore];
};
