/**
 * MeetingStatusBadge Component
 * Displays meeting status with appropriate color coding
 */

import React from 'react';
import { Tag } from 'antd';
import type { MeetingStatus } from '../../types/meeting.types';
import { MEETING_STATUS_LABELS, MEETING_STATUS_COLORS } from '../../types/meeting.types';

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
  style?: React.CSSProperties;
}

export const MeetingStatusBadge: React.FC<MeetingStatusBadgeProps> = ({ status, style }) => {
  const label = MEETING_STATUS_LABELS[status];
  const color = MEETING_STATUS_COLORS[status];

  // Add pulse animation for in-progress meetings
  const isInProgress = status === 'in_progress';

  return (
    <Tag
      color={color}
      style={{
        ...style,
        ...(isInProgress && {
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }),
      }}
    >
      {label}
    </Tag>
  );
};

export default MeetingStatusBadge;
