/**
 * NoticeParticipants Component
 * List of invited participants split into Board Members and In Attendance
 * 
 * Board Members: Chairman, Vice Chairman, Directors/Members (voting members)
 * In Attendance: Secretaries, Presenters, Guests, Observers (non-voting)
 */

import React from 'react';
import type { MeetingParticipant } from '../../../types/meeting.types';

// Role codes that are considered "In Attendance" (non-voting/support roles)
const IN_ATTENDANCE_ROLES = [
  'board_secretary',
  'secretary',
  'company_secretary',
  'group_company_secretary',
  'presenter',
  'guest',
  'observer',
];

// Map role codes to human-readable titles
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  chairman: 'Chairman',
  vice_chairman: 'Vice Chairman',
  group_chairman: 'Group Chairman',
  board_member: 'Director',
  member: 'Director',
  committee_member: 'Committee Member',
  executive_member: 'Executive Director',
  board_secretary: 'Board Secretary',
  secretary: 'Secretary',
  company_secretary: 'Company Secretary',
  group_company_secretary: 'Group Company Secretary',
  presenter: 'Presenter',
  guest: 'Guest',
  observer: 'Observer',
};

// Role priority for sorting (lower = higher priority)
const ROLE_PRIORITY: Record<string, number> = {
  group_chairman: 1,
  chairman: 2,
  vice_chairman: 3,
  executive_member: 4,
  board_member: 5,
  member: 5,
  committee_member: 6,
  group_company_secretary: 10,
  company_secretary: 11,
  board_secretary: 12,
  secretary: 13,
  presenter: 20,
  observer: 21,
  guest: 22,
};

interface NoticeParticipantsProps {
  participants: MeetingParticipant[];
  primaryColor?: string;
  compact?: boolean;
}

export const NoticeParticipants: React.FC<NoticeParticipantsProps> = ({
  participants,
  primaryColor = '#324721',
  compact = false,
}) => {
  if (!participants || participants.length === 0) {
    return null;
  }

  // Helper to get display name for a role
  const getRoleDisplayName = (role: string): string => {
    return ROLE_DISPLAY_NAMES[role] || role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Helper to get role priority for sorting
  const getRolePriority = (role: string): number => {
    return ROLE_PRIORITY[role] || 100;
  };

  // Sort participants by role priority
  const sortByRole = (a: MeetingParticipant, b: MeetingParticipant): number => {
    const priorityA = getRolePriority(a.boardRole);
    const priorityB = getRolePriority(b.boardRole);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.name.localeCompare(b.name);
  };

  // Filter into two groups
  const boardMembers = participants
    .filter(p => !p.isGuest && !IN_ATTENDANCE_ROLES.includes(p.boardRole))
    .sort(sortByRole);

  const inAttendance = participants
    .filter(p => p.isGuest || IN_ATTENDANCE_ROLES.includes(p.boardRole))
    .sort(sortByRole);

  // Render a participant row in formal document style
  const renderParticipant = (participant: MeetingParticipant, index: number) => (
    <tr key={participant.id}>
      <td style={{ 
        padding: '4px 8px 4px 0', 
        verticalAlign: 'top',
        width: 24,
        fontSize: compact ? 13 : 14,
      }}>
        {index + 1}.
      </td>
      <td style={{ 
        padding: '4px 16px 4px 0', 
        verticalAlign: 'top',
        fontSize: compact ? 13 : 14,
      }}>
        {participant.name}
      </td>
      <td style={{ 
        padding: '4px 0', 
        verticalAlign: 'top',
        color: '#666',
        fontStyle: 'italic',
        fontSize: compact ? 12 : 13,
      }}>
        {participant.isGuest && participant.guestRole 
          ? participant.guestRole 
          : getRoleDisplayName(participant.boardRole)}
      </td>
    </tr>
  );

  return (
    <div className="notice-participants" style={{ marginBottom: 24 }}>
      {/* Board Members Section */}
      {boardMembers.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ 
            fontWeight: 600, 
            marginBottom: 8,
            fontSize: compact ? 13 : 14,
            color: primaryColor,
          }}>
            Board Members:
          </p>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            marginLeft: 16,
          }}>
            <tbody>
              {boardMembers.map((p, i) => renderParticipant(p, i))}
            </tbody>
          </table>
        </div>
      )}

      {/* In Attendance Section */}
      {inAttendance.length > 0 && (
        <div>
          <p style={{ 
            fontWeight: 600, 
            marginBottom: 8,
            fontSize: compact ? 13 : 14,
            color: primaryColor,
          }}>
            In Attendance:
          </p>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            marginLeft: 16,
          }}>
            <tbody>
              {inAttendance.map((p, i) => renderParticipant(p, i))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NoticeParticipants;
