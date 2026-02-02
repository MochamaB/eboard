/**
 * MeetingsCalendarView Component
 * Calendar view for meetings using FullCalendar
 * Displays meetings in month/week/day/list views with theme-based colors
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import type { EventInput, EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { Tooltip, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { MeetingListItem, MeetingStatus, LocationType } from '../../../types/meeting.types';
import { MEETING_STATUS_LABELS, MEETING_TYPE_LABELS, MEETING_STATUS_COLORS, LOCATION_TYPE_LABELS } from '../../../types/meeting.types';
import { VideoCameraOutlined, EnvironmentOutlined, HomeOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import './MeetingsCalendarView.css';

export interface MeetingsCalendarViewProps {
  meetings: MeetingListItem[];
  loading?: boolean;
  onDateClick?: (date: Date) => void;
  onMeetingClick?: (meeting: MeetingListItem) => void;
}

export const MeetingsCalendarView: React.FC<MeetingsCalendarViewProps> = ({
  meetings,
  loading = false,
  onDateClick,
  onMeetingClick,
}) => {
  const navigate = useNavigate();
  const { currentBoard, theme } = useBoardContext();

  // Status color mapping (consistent with MeetingDateTimeCard)
  const STATUS_DOT_COLORS: Record<string, string> = {
    default: '#d9d9d9',
    warning: '#faad14',
    blue: '#1890ff',
    cyan: '#13c2c2',
    processing: '#52c41a',
    success: '#52c41a',
    error: '#ff4d4f',
  };

  // Get status color using consistent color scheme
  const getStatusColor = useCallback((status: MeetingStatus): string => {
    const colorKey = MEETING_STATUS_COLORS[status] || 'default';
    return STATUS_DOT_COLORS[colorKey] || STATUS_DOT_COLORS.default;
  }, []);

  // Get location icon
  const getLocationIcon = useCallback((locationType: LocationType) => {
    switch (locationType) {
      case 'virtual': return <VideoCameraOutlined style={{ fontSize: 11 }} />;
      case 'physical': return <EnvironmentOutlined style={{ fontSize: 11 }} />;
      case 'hybrid': return <HomeOutlined style={{ fontSize: 11 }} />;
      default: return null;
    }
  }, []);

  // Get text color based on background brightness
  const getTextColor = useCallback((bgColor: string): string => {
    // Simple brightness check - if color is light, use dark text
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }, []);

  // Debug: log meetings data
  useEffect(() => {
    if (meetings.length > 0) {
      console.log('Calendar meetings:', meetings.slice(0, 3).map(m => ({
        title: m.title,
        startDate: m.startDate,
        startTime: m.startTime,
      })));
    }
  }, [meetings]);

  // Transform meetings to FullCalendar events - sorted by time
  const events: EventInput[] = useMemo(() => {
    // Sort meetings by date and time (earliest first)
    const sortedMeetings = [...meetings].sort((a, b) => {
      const dateTimeA = new Date(`${a.startDate}T${a.startTime}:00`).getTime();
      const dateTimeB = new Date(`${b.startDate}T${b.startTime}:00`).getTime();
      return dateTimeA - dateTimeB;
    });

    return sortedMeetings.map((meeting) => {
      const statusColor = getStatusColor(meeting.status);
      // Use light background (15% opacity) with colored text like MeetingDateTimeCard
      const bgColor = `${statusColor}15`;
      const textColor = statusColor;
      
      // Create start and end datetime - ensure proper format
      // startDate format: "2025-01-15", startTime format: "10:00"
      const startDateTime = `${meeting.startDate}T${meeting.startTime}:00`;
      const endDate = new Date(startDateTime);
      endDate.setMinutes(endDate.getMinutes() + meeting.duration);
      
      return {
        id: meeting.id,
        title: meeting.title,
        start: startDateTime,
        end: endDate.toISOString(),
        backgroundColor: bgColor,
        borderColor: statusColor,
        textColor: textColor,
        extendedProps: {
          meeting: meeting,
          status: meeting.status,
          statusColor: statusColor,
          boardName: meeting.boardName,
          locationType: meeting.locationType,
          meetingType: meeting.meetingType,
          participantCount: meeting.participantCount,
        },
      };
    });
  }, [meetings, getStatusColor]);

  // Handle event click
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const meeting = clickInfo.event.extendedProps.meeting as MeetingListItem;
    if (onMeetingClick) {
      onMeetingClick(meeting);
    } else {
      navigate(`/${currentBoard?.id || meeting.boardId}/meetings/${meeting.id}`);
    }
  }, [navigate, currentBoard?.id, onMeetingClick]);

  // Handle date click (for creating new meeting)
  const handleDateClick = useCallback((clickInfo: DateClickArg) => {
    if (onDateClick) {
      onDateClick(clickInfo.date);
    }
  }, [onDateClick]);

  // Custom event content renderer
  const renderEventContent = useCallback((eventInfo: any) => {
    const { event } = eventInfo;
    const meeting = event.extendedProps.meeting as MeetingListItem;
    const statusColor = event.extendedProps.statusColor as string;
    const isListView = eventInfo.view.type === 'listWeek' || eventInfo.view.type === 'listMonth';
    
    if (isListView) {
      // List view - show more details with status badge and location
      return (
        <div className="meeting-event-list">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {/* Status Badge */}
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 4,
                padding: '1px 6px',
                borderRadius: 3,
                backgroundColor: `${statusColor}15`,
                fontSize: 10,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: statusColor }} />
              <span style={{ color: statusColor, fontWeight: 500, textTransform: 'uppercase' }}>
                {MEETING_STATUS_LABELS[meeting.status]}
              </span>
            </div>
            {/* Location Icon */}
            <span style={{ color: statusColor }}>
              {getLocationIcon(meeting.locationType)}
            </span>
          </div>
          <div className="meeting-event-title" style={{ fontWeight: 500 }}>{event.title}</div>
          <div className="meeting-event-meta">
            <Tag style={{ fontSize: 10 }}>
              {MEETING_TYPE_LABELS[meeting.meetingType]}
            </Tag>
            <span className="meeting-event-board">{meeting.boardName}</span>
          </div>
        </div>
      );
    }

    // Grid view - compact display with status and location
    return (
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{event.title}</div>
            <div style={{ fontSize: 12 }}>
              <div>{meeting.boardName}</div>
              <div>{meeting.startTime} • {meeting.duration}min</div>
              <div>{MEETING_STATUS_LABELS[meeting.status]}</div>
              <div>{LOCATION_TYPE_LABELS[meeting.locationType]} • {MEETING_TYPE_LABELS[meeting.meetingType]}</div>
              <div>{meeting.participantCount} participants</div>
            </div>
          </div>
        }
        placement="top"
      >
        <div className="meeting-event-grid">
          {/* Status dot */}
          <span 
            style={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              backgroundColor: statusColor,
              flexShrink: 0,
            }} 
          />
          {/* Location icon */}
          <span style={{ flexShrink: 0 }}>
            {getLocationIcon(meeting.locationType)}
          </span>
          {/* Time */}
          <div className="meeting-event-time">{eventInfo.timeText}</div>
          {/* Title */}
          <div className="meeting-event-title">{event.title}</div>
        </div>
      </Tooltip>
    );
  }, [getLocationIcon]);

  return (
    <div className="meetings-calendar-view" style={{ opacity: loading ? 0.6 : 1 }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        buttonText={{
          today: 'Today',
          year: 'Year',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          list: 'List',
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
        height="auto"
        contentHeight={650}
        dayMaxEvents={5}
        moreLinkText={(num) => `+${num} more`}
        eventOrder="start,-duration,allDay,title"
        nowIndicator={true}
        weekends={true}
        firstDay={1} // Monday
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        // Styling
        themeSystem="standard"
        eventDisplay="block"
        eventMaxStack={3}
      />
    </div>
  );
};

export default MeetingsCalendarView;
