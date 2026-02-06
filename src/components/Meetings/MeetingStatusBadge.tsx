/**
 * MeetingStatusBadge Component
 * Displays meeting status with appropriate color coding
 * Supports combined status + subStatus display
 */

import React from 'react';
import { Tag } from 'antd';
import type { MeetingStatus } from '../../types/meeting.types';

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
  subStatus?: string | null;
  showSubStatus?: boolean;
  style?: React.CSSProperties;
}

/**
 * Get display label for status + subStatus combination
 */
const getStatusLabel = (status: MeetingStatus, subStatus?: string | null, showSubStatus?: boolean): string => {
  // If not showing subStatus, return primary status only
  if (!showSubStatus || !subStatus) {
    const labels: Record<MeetingStatus, string> = {
      draft: 'Draft',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status];
  }

  // Combined status + subStatus labels
  const combinedKey = `${status}.${subStatus}`;
  const combinedLabels: Record<string, string> = {
    'draft.incomplete': 'Draft - Incomplete',
    'draft.complete': 'Draft - Ready',
    'scheduled.pending_approval': 'Pending Approval',
    'scheduled.approved': 'Approved',
    'scheduled.rejected': 'Rejected',
    'in_progress.active': 'In Progress',
    'completed.recent': 'Completed',
    'completed.archived': 'Archived',
  };

  return combinedLabels[combinedKey] || getStatusLabel(status, null, false);
};

/**
 * Get color for status + subStatus combination
 * Based on refactor spec color scheme
 */
const getStatusColor = (status: MeetingStatus, subStatus?: string | null): string => {
  // Handle combined status + subStatus
  if (subStatus) {
    const combinedKey = `${status}.${subStatus}`;
    const colorMap: Record<string, string> = {
      'draft.incomplete': 'default',        // grey
      'draft.complete': 'blue',             // blue
      'scheduled.pending_approval': 'orange', // orange
      'scheduled.approved': 'green',        // green
      'scheduled.rejected': 'red',          // red
      'in_progress.active': 'processing',   // blue/active
      'completed.recent': 'success',        // green
      'completed.archived': 'default',      // grey
    };
    
    if (colorMap[combinedKey]) {
      return colorMap[combinedKey];
    }
  }

  // Fallback to primary status colors
  const statusColors: Record<MeetingStatus, string> = {
    draft: 'default',
    scheduled: 'cyan',
    in_progress: 'processing',
    completed: 'success',
    cancelled: 'error',
  };

  return statusColors[status];
};

export const MeetingStatusBadge: React.FC<MeetingStatusBadgeProps> = ({ 
  status, 
  subStatus,
  showSubStatus = true,
  style 
}) => {
  const label = getStatusLabel(status, subStatus, showSubStatus);
  const color = getStatusColor(status, subStatus);

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
