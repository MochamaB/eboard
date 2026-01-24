/**
 * MeetingCalendar Component
 * Calendar view for meetings with color-coded board types
 */

import React, { useMemo } from 'react';
import { Calendar, Badge, Card, List, Typography, Space, Tag, Empty } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { MeetingListItem } from '../../types/meeting.types';
import { BOARD_TYPE_COLORS } from '../../types/board.types';
import { MeetingStatusBadge } from './MeetingStatusBadge';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface MeetingCalendarProps {
  meetings: MeetingListItem[];
  onDateSelect?: (date: Dayjs) => void;
  onMeetingClick?: (meeting: MeetingListItem) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  meetings,
  onDateSelect,
  onMeetingClick,
}) => {
  const navigate = useNavigate();

  // Group meetings by date
  const meetingsByDate = useMemo(() => {
    const grouped = new Map<string, MeetingListItem[]>();

    meetings.forEach(meeting => {
      const dateKey = meeting.startDate;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(meeting);
    });

    // Sort meetings within each date by start time
    grouped.forEach((dateMeetings) => {
      dateMeetings.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [meetings]);

  // Get meetings for a specific date
  const getMeetingsForDate = (date: Dayjs): MeetingListItem[] => {
    const dateKey = date.format('YYYY-MM-DD');
    return meetingsByDate.get(dateKey) || [];
  };

  // Cell renderer for calendar dates
  const dateCellRender = (value: Dayjs) => {
    const dateMeetings = getMeetingsForDate(value);

    if (dateMeetings.length === 0) {
      return null;
    }

    return (
      <div style={{ overflow: 'hidden' }}>
        {dateMeetings.slice(0, 3).map((meeting) => {
          const boardColor = BOARD_TYPE_COLORS[meeting.boardType];
          return (
            <div
              key={meeting.id}
              style={{
                marginBottom: 2,
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onMeetingClick) {
                  onMeetingClick(meeting);
                } else {
                  navigate(`/${meeting.boardId}/meetings/${meeting.id}`);
                }
              }}
            >
              <Badge
                color={boardColor}
                text={
                  <Text
                    style={{ fontSize: '11px' }}
                    ellipsis
                    title={`${meeting.startTime} - ${meeting.title}`}
                  >
                    {meeting.startTime} {meeting.title}
                  </Text>
                }
              />
            </div>
          );
        })}
        {dateMeetings.length > 3 && (
          <Text type="secondary" style={{ fontSize: '10px' }}>
            +{dateMeetings.length - 3} more
          </Text>
        )}
      </div>
    );
  };

  // Month cell renderer (for month view header)
  const monthCellRender = (value: Dayjs) => {
    const month = value.format('YYYY-MM');
    const monthMeetings = meetings.filter(m => m.startDate.startsWith(month));

    if (monthMeetings.length === 0) {
      return null;
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {monthMeetings.length} meetings
        </Text>
      </div>
    );
  };

  // Selected date panel (shows meetings for selected date)
  const [selectedDate, setSelectedDate] = React.useState<Dayjs>(dayjs());

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const selectedDateMeetings = getMeetingsForDate(selectedDate);

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Calendar */}
      <div style={{ flex: 1 }}>
        <Calendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          onSelect={handleDateSelect}
        />
      </div>

      {/* Selected Date Meetings Panel */}
      <div style={{ width: 350 }}>
        <Card
          title={
            <Space direction="vertical" size={0}>
              <Text strong>{selectedDate.format('MMMM D, YYYY')}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {selectedDateMeetings.length} meeting(s)
              </Text>
            </Space>
          }
          size="small"
        >
          {selectedDateMeetings.length === 0 ? (
            <Empty
              description="No meetings scheduled"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={selectedDateMeetings}
              renderItem={(meeting) => {
                const boardColor = BOARD_TYPE_COLORS[meeting.boardType];
                return (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                    onClick={() => {
                      if (onMeetingClick) {
                        onMeetingClick(meeting);
                      } else {
                        navigate(`/${meeting.boardId}/meetings/${meeting.id}`);
                      }
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 4,
                            height: '100%',
                            backgroundColor: boardColor,
                            borderRadius: 2,
                          }}
                        />
                      }
                      title={
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '13px' }} ellipsis>
                              {meeting.title}
                            </Text>
                            <MeetingStatusBadge status={meeting.status} />
                          </div>
                          <Space size={4}>
                            <Tag color={boardColor} style={{ fontSize: '10px', margin: 0 }}>
                              {meeting.boardName}
                            </Tag>
                            {meeting.parentBoardName && (
                              <Text type="secondary" style={{ fontSize: '10px' }}>
                                ({meeting.parentBoardName})
                              </Text>
                            )}
                          </Space>
                        </Space>
                      }
                      description={
                        <Space size={4}>
                          <ClockCircleOutlined style={{ fontSize: '11px' }} />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {formatTime(meeting.startTime)} • {meeting.duration} min
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default MeetingCalendar;
