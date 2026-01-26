/**
 * CalendarView Component
 * Generic reusable calendar component for displaying events
 * Can be used for meetings, tasks, appointments, or any time-based events
 * Uses react-big-calendar library
 */

import React, { useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { Spin } from 'antd';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';

const localizer = momentLocalizer(moment);

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  [key: string]: any;
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  loading?: boolean;
  defaultView?: View;
  defaultDate?: Date;
  views?: View[];
  style?: React.CSSProperties;
  className?: string;
  eventStyle?: (event: CalendarEvent) => React.CSSProperties;
  height?: number | string;
  selectable?: boolean;
  toolbar?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onEventClick,
  onSelectSlot,
  loading = false,
  defaultView = 'month',
  defaultDate = new Date(),
  views = ['month', 'week', 'day', 'agenda'],
  style,
  className,
  eventStyle,
  height = 600,
  selectable = false,
  toolbar = true,
}) => {
  // Transform events to ensure dates are Date objects
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      start: event.start instanceof Date ? event.start : new Date(event.start),
      end: event.end instanceof Date ? event.end : new Date(event.end),
    }));
  }, [events]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  }, [onEventClick]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  }, [onSelectSlot]);

  // Event style getter
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    if (eventStyle) {
      return {
        style: eventStyle(event),
      };
    }
    return {};
  }, [eventStyle]);

  if (loading) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      className={`calendar-view ${className || ''}`}
      style={{ height, ...style }}
    >
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        defaultDate={defaultDate}
        views={views}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={selectable}
        eventPropGetter={eventStyleGetter}
        toolbar={toolbar}
        style={{ height: '100%' }}
        popup
      />
    </div>
  );
};

export default CalendarView;
