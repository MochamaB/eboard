/**
 * Time Display Component
 * Displays time information in a consistent format
 */

import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

interface TimeDisplayProps {
  /** ISO timestamp or date string */
  time?: string | null;
  /** Display format: 'time' (HH:mm), 'datetime' (full), 'duration' (minutes), 'relative' (3 minutes ago) */
  format?: 'time' | 'datetime' | 'duration' | 'relative';
  /** Show clock icon */
  showIcon?: boolean;
  /** Custom style */
  style?: React.CSSProperties;
  /** Duration in minutes (for format='duration') */
  durationMinutes?: number;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  time,
  format = 'time',
  showIcon = false,
  style,
  durationMinutes,
}) => {
  const formatTime = () => {
    if (format === 'duration') {
      if (durationMinutes === undefined || durationMinutes === null) return '--';

      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes}m`;
    }

    if (!time) return '--';

    const date = dayjs(time);

    if (!date.isValid()) return '--';

    switch (format) {
      case 'time':
        return date.format('HH:mm');
      case 'datetime':
        return date.format('DD MMM YYYY, HH:mm');
      case 'relative':
        return date.fromNow();
      default:
        return date.format('HH:mm');
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '13px',
        color: 'rgba(0, 0, 0, 0.65)',
        ...style,
      }}
    >
      {showIcon && <ClockCircleOutlined style={{ fontSize: '12px' }} />}
      {formatTime()}
    </span>
  );
};
