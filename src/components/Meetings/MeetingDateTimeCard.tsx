/**
 * MeetingDateTimeCard Component
 * Card-style date/time display for table view
 * Shows date prominently with month/year, time range, and status badge
 */

import React from 'react';
import { Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { MeetingListItem, MeetingStatus } from '../../types/meeting.types';
import { MEETING_STATUS_LABELS, MEETING_STATUS_COLORS } from '../../types/meeting.types';
import { useBoardContext } from '../../contexts';

const { Text } = Typography;

// Map Ant Design preset colors to actual hex values for badge dot
const STATUS_DOT_COLORS: Record<string, string> = {
  default: '#d9d9d9',
  warning: '#faad14',
  blue: '#1890ff',
  cyan: '#13c2c2',
  processing: '#52c41a',
  success: '#52c41a',
  error: '#ff4d4f',
};

interface MeetingDateTimeCardProps {
  meeting: MeetingListItem;
  compact?: boolean;
}

export const MeetingDateTimeCard: React.FC<MeetingDateTimeCardProps> = ({
  meeting,
  compact = false,
}) => {
  const { theme } = useBoardContext();
  
  // Parse date and time
  const meetingDate = dayjs(meeting.startDate);
  const startTime = dayjs(`${meeting.startDate} ${meeting.startTime}`);
  const endTime = startTime.add(meeting.duration, 'minute');
  
  // Use theme primary color for accent
  const accentColor = theme.primaryColor || '#324721';
  
  // Compact version for smaller spaces
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            minWidth: 40,
            textAlign: 'center',
            padding: '4px 2px',
            background: `${accentColor}15`,
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1, color: accentColor }}>
            {meetingDate.format('DD')}
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: accentColor }}>
            {meetingDate.format('MMM')}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 500 }}>
            {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
          </div>
          <Text type="secondary" style={{ fontSize: 10 }}>
            ({meeting.duration}min)
          </Text>
        </div>
      </div>
    );
  }
  
  // Get status color
  const statusColor = MEETING_STATUS_COLORS[meeting.status as MeetingStatus] || 'default';
  const dotColor = STATUS_DOT_COLORS[statusColor] || STATUS_DOT_COLORS.default;
  const statusLabel = MEETING_STATUS_LABELS[meeting.status as MeetingStatus] || meeting.status;
  
  // Full version for table view
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      {/* Date Block */}
      <div
        style={{
          minWidth: 52,
          textAlign: 'center',
          padding: '6px 4px',
          background: `${accentColor}15`,
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: accentColor }}>
          {meetingDate.format('DD')}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: accentColor }}>
          {meetingDate.format('MMM')}
        </div>
        <div style={{ fontSize: 10, color: '#8c8c8c' }}>
          {meetingDate.format('YYYY')}
        </div>
      </div>
      
      {/* Time Range & Status */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <ClockCircleOutlined style={{ color: accentColor, fontSize: 12 }} />
          <Text style={{ fontSize: 12, fontWeight: 500 }}>
            {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
          </Text>
        </div>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginLeft: 18, marginBottom: 4 }}>
          ({meeting.duration}min)
        </Text>
        {/* Status Badge */}
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: `${dotColor}15`,
          }}
        >
          <span 
            style={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              backgroundColor: dotColor,
            }} 
          />
          <Text 
            style={{ 
              fontSize: 11, 
              fontWeight: 500,
              color: dotColor, 
              textTransform: 'uppercase',
            }}
          >
            {statusLabel}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default MeetingDateTimeCard;
