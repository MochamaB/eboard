/**
 * MeetingCreatePage
 * Multi-step wizard for creating new meetings
 * Uses WizardForm component with 4 steps:
 * 1. Select Board/Committee
 * 2. Meeting Details
 * 3. Participants
 * 4. Review & Create
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Typography, message, Divider, Select, Space, Alert, Input, DatePicker, TimePicker, InputNumber, Row, Col, Switch, Radio, Checkbox, Tag, Table } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  BankOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { WizardForm, type WizardStep, ParticipantSelector, type SelectedParticipant } from '../../components/common';
import { useBoardContext } from '../../contexts';
import type { MeetingType } from '../../types/meeting.types';

const { Title, Text } = Typography;

// Meeting type options with descriptions
const MEETING_TYPE_OPTIONS: { value: MeetingType; label: string; description: string; defaultDuration: number }[] = [
  { value: 'regular', label: 'Regular Board Meeting', description: 'Scheduled periodic board meeting', defaultDuration: 240 },
  { value: 'special', label: 'Special Meeting', description: 'Called for specific urgent matters', defaultDuration: 120 },
  { value: 'agm', label: 'Annual General Meeting', description: 'Yearly shareholder meeting', defaultDuration: 360 },
  { value: 'emergency', label: 'Emergency Meeting', description: 'Urgent meeting with short notice', defaultDuration: 120 },
  { value: 'committee', label: 'Committee Meeting', description: 'Committee-specific meeting', defaultDuration: 120 },
];

// Board type options
const BOARD_TYPE_OPTIONS = [
  { value: 'main', label: 'Main Board', description: 'Primary organization board', icon: <BankOutlined /> },
  { value: 'subsidiary', label: 'Subsidiary Board', description: 'Subsidiary company boards', icon: <BankOutlined /> },
  { value: 'factory', label: 'Factory Board', description: 'Factory-level boards', icon: <BankOutlined /> },
  { value: 'committee', label: 'Committee', description: 'Board committees', icon: <ApartmentOutlined /> },
];

const MeetingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBoard, allBoards, committees } = useBoardContext();
  const [form] = Form.useForm();
  const [selectedBoardType, setSelectedBoardType] = useState<string | undefined>();
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();
  const [participants, setParticipants] = useState<SelectedParticipant[]>([]);
  const [quorumPercentage, setQuorumPercentage] = useState<number>(50);
  
  // Recurring meeting state
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'weekly' | 'monthly' | 'quarterly' | 'annually'>('monthly');
  const [weeklyDays, setWeeklyDays] = useState<string[]>(['monday']);
  const [monthlyType, setMonthlyType] = useState<'dayOfMonth' | 'dayOfWeek'>('dayOfMonth');
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState<number>(15);
  const [monthlyWeekOfMonth, setMonthlyWeekOfMonth] = useState<number>(1); // 1st, 2nd, 3rd, 4th, last
  const [monthlyDayOfWeek, setMonthlyDayOfWeek] = useState<string>('monday');
  const [quarterlyMonths, setQuarterlyMonths] = useState<number[]>([1, 4, 7, 10]); // Jan, Apr, Jul, Oct
  const [endType, setEndType] = useState<'date' | 'occurrences'>('occurrences');
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [occurrences, setOccurrences] = useState<number>(12);
  const [generatedDates, setGeneratedDates] = useState<{ date: Dayjs; excluded: boolean; conflict?: string }[]>([]);
  const [excludedDates, setExcludedDates] = useState<Set<string>>(new Set());

  // Get all boards including committees
  const allBoardsWithCommittees = useMemo(() => {
    const boards = allBoards.map(board => ({
      value: board.id,
      label: board.name,
      type: board.type,
      shortName: board.shortName,
      parentName: undefined as string | undefined,
    }));
    
    // Add committees
    const committeeOptions = committees.map(comm => ({
      value: comm.id,
      label: comm.name,
      type: 'committee' as const,
      shortName: comm.shortName,
      parentName: currentBoard?.name,
    }));
    
    return [...boards, ...committeeOptions];
  }, [allBoards, committees, currentBoard]);

  // Filter boards by selected type
  const filteredBoards = useMemo(() => {
    if (!selectedBoardType) return [];
    return allBoardsWithCommittees.filter(b => b.type === selectedBoardType);
  }, [allBoardsWithCommittees, selectedBoardType]);

  // Get selected board details
  const selectedBoard = useMemo(() => {
    return allBoardsWithCommittees.find(b => b.value === selectedBoardId);
  }, [allBoardsWithCommittees, selectedBoardId]);

  // Filter meeting types based on board type
  const availableMeetingTypes = useMemo(() => {
    if (selectedBoardType === 'committee') {
      return MEETING_TYPE_OPTIONS.filter(t => t.value === 'committee' || t.value === 'special');
    }
    return MEETING_TYPE_OPTIONS.filter(t => t.value !== 'committee');
  }, [selectedBoardType]);

  // Step 1: Board Selection
  const BoardSelectionStep = () => (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Select Board or Committee</Title>
      <Text type="secondary">
        Choose the board type, then select the specific board or committee for your meeting.
      </Text>
      <Divider />
      
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Step 1.1: Board Type Selection */}
        <Form.Item
          name="boardType"
          label="Board Type"
          rules={[{ required: true, message: 'Please select a board type' }]}
        >
          <Select
            placeholder="Select board type"
            onChange={(value) => {
              setSelectedBoardType(value);
              setSelectedBoardId(undefined);
              form.setFieldValue('boardId', undefined);
              form.setFieldValue('meetingType', undefined);
            }}
            optionRender={(option) => {
              const typeInfo = BOARD_TYPE_OPTIONS.find(t => t.value === option.value);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                  <span style={{ fontSize: 18, color: '#8c8c8c' }}>{typeInfo?.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{typeInfo?.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{typeInfo?.description}</div>
                  </div>
                </div>
              );
            }}
            options={BOARD_TYPE_OPTIONS.map(type => ({
              value: type.value,
              label: type.label,
            }))}
          />
        </Form.Item>

        {/* Step 1.2: Board Selection (filtered by type) */}
        <Form.Item
          name="boardId"
          label={selectedBoardType === 'committee' ? 'Committee' : 'Board'}
          rules={[{ required: true, message: `Please select a ${selectedBoardType === 'committee' ? 'committee' : 'board'}` }]}
        >
          <Select
            placeholder={selectedBoardType ? `Select a ${selectedBoardType === 'committee' ? 'committee' : 'board'}` : 'Select board type first'}
            showSearch
            optionFilterProp="label"
            disabled={!selectedBoardType}
            onChange={(value) => {
              setSelectedBoardId(value);
              form.setFieldValue('meetingType', undefined);
            }}
            options={filteredBoards.map(board => ({
              value: board.value,
              label: board.label,
            }))}
            optionRender={(option) => {
              const boardInfo = filteredBoards.find(b => b.value === option.value);
              return (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: 500 }}>{boardInfo?.label}</div>
                  {boardInfo?.parentName && (
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                      Parent: {boardInfo.parentName}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </Form.Item>

        

        {/* Step 1.3: Meeting Type Selection */}
        <Form.Item
          name="meetingType"
          label="Meeting Type"
          rules={[{ required: true, message: 'Please select a meeting type' }]}
        >
          <Select
            placeholder={selectedBoardId ? 'Select meeting type' : 'Select a board first'}
            disabled={!selectedBoardId}
            options={availableMeetingTypes.map(type => ({
              value: type.value,
              label: type.label,
            }))}
            optionRender={(option) => {
              const typeInfo = availableMeetingTypes.find(t => t.value === option.value);
              return (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: 500 }}>{typeInfo?.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{typeInfo?.description}</div>
                </div>
              );
            }}
          />
        </Form.Item>

        {/* Info about confirmation requirement */}
        {form.getFieldValue('meetingType') === 'emergency' && (
          <Alert
            message="Emergency Meeting"
            description="Emergency meetings skip the confirmation workflow and invitations are sent immediately."
            type="warning"
            showIcon
          />
        )}

        {form.getFieldValue('meetingType') === 'agm' && (
          <Alert
            message="Annual General Meeting"
            description="AGM requires confirmation by the Company Secretary before invitations are sent."
            type="info"
            showIcon
          />
        )}
      </Space>
    </div>
  );

  // Generate default title based on selected board and meeting type
  const generateDefaultTitle = () => {
    const meetingTypeLabel = MEETING_TYPE_OPTIONS.find(t => t.value === form.getFieldValue('meetingType'))?.label || 'Meeting';
    const boardName = selectedBoard?.label || '';
    return `${boardName} - ${meetingTypeLabel}`;
  };

  // Get default duration based on meeting type
  const getDefaultDuration = () => {
    const meetingType = form.getFieldValue('meetingType');
    return MEETING_TYPE_OPTIONS.find(t => t.value === meetingType)?.defaultDuration || 120;
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: Dayjs | null, duration: number): Dayjs | null => {
    if (!startTime) return null;
    return startTime.add(duration, 'minute');
  };

  // Calculate duration based on start and end time
  const calculateDuration = (startTime: Dayjs | null, endTime: Dayjs | null): number | null => {
    if (!startTime || !endTime) return null;
    const diff = endTime.diff(startTime, 'minute');
    return diff > 0 ? diff : null;
  };

  // Handle start time or duration change to update end time
  const handleStartTimeOrDurationChange = () => {
    const startTime = form.getFieldValue('startTime');
    const duration = form.getFieldValue('duration');
    if (startTime && duration) {
      const endTime = calculateEndTime(startTime, duration);
      form.setFieldValue('endTime', endTime);
    }
  };

  // Handle end time change to update duration
  const handleEndTimeChange = () => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    if (startTime && endTime) {
      const duration = calculateDuration(startTime, endTime);
      if (duration && duration > 0) {
        form.setFieldValue('duration', duration);
      }
    }
  };

  // Day of week mapping
  const WEEKDAYS = [
    { value: 'sunday', label: 'Sunday', short: 'Sun' },
    { value: 'monday', label: 'Monday', short: 'Mon' },
    { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { value: 'thursday', label: 'Thursday', short: 'Thu' },
    { value: 'friday', label: 'Friday', short: 'Fri' },
    { value: 'saturday', label: 'Saturday', short: 'Sat' },
  ];

  const WEEK_OF_MONTH_OPTIONS = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' },
    { value: -1, label: 'Last' },
  ];

  // Generate recurring dates based on pattern
  const generateRecurringDates = () => {
    const startDate = form.getFieldValue('scheduledDate') as Dayjs;
    if (!startDate) {
      message.warning('Please select a start date first');
      return;
    }

    const dates: { date: Dayjs; excluded: boolean; conflict?: string }[] = [];
    let currentDate = startDate.clone();
    const maxDates = endType === 'occurrences' ? occurrences : 52; // Max 52 for safety
    const finalEndDate = endType === 'date' && endDate ? endDate : startDate.add(2, 'year');

    const getDayIndex = (day: string): number => {
      return WEEKDAYS.findIndex(w => w.value === day);
    };

    const getNthDayOfMonth = (date: Dayjs, weekOfMonth: number, dayOfWeek: string): Dayjs => {
      const dayIndex = getDayIndex(dayOfWeek);
      let result: Dayjs;
      
      if (weekOfMonth === -1) {
        // Last occurrence of the day in the month
        result = date.endOf('month');
        while (result.day() !== dayIndex) {
          result = result.subtract(1, 'day');
        }
      } else {
        // Nth occurrence of the day in the month
        result = date.startOf('month');
        let count = 0;
        while (count < weekOfMonth) {
          if (result.day() === dayIndex) {
            count++;
            if (count === weekOfMonth) break;
          }
          result = result.add(1, 'day');
        }
        // If we didn't find the right day, find the first occurrence
        while (result.day() !== dayIndex) {
          result = result.add(1, 'day');
        }
      }
      return result;
    };

    while (dates.length < maxDates && currentDate.isBefore(finalEndDate)) {
      let meetingDate: Dayjs | null = null;

      switch (recurrencePattern) {
        case 'weekly':
          // For weekly, add dates for each selected day
          for (const day of weeklyDays) {
            const dayIndex = getDayIndex(day);
            let weekDate = currentDate.startOf('week').add(dayIndex, 'day');
            if (weekDate.isBefore(startDate)) {
              weekDate = weekDate.add(1, 'week');
            }
            if (weekDate.isBefore(finalEndDate) && dates.length < maxDates) {
              if (!dates.some(d => d.date.isSame(weekDate, 'day'))) {
                dates.push({ date: weekDate, excluded: excludedDates.has(weekDate.format('YYYY-MM-DD')) });
              }
            }
          }
          currentDate = currentDate.add(1, 'week');
          break;

        case 'monthly':
          if (monthlyType === 'dayOfMonth') {
            // Specific day of month (e.g., 15th)
            meetingDate = currentDate.date(Math.min(monthlyDayOfMonth, currentDate.daysInMonth()));
          } else {
            // Nth weekday of month (e.g., "Second Tuesday")
            meetingDate = getNthDayOfMonth(currentDate, monthlyWeekOfMonth, monthlyDayOfWeek);
          }
          if ((meetingDate.isSame(startDate, 'day') || meetingDate.isAfter(startDate, 'day')) && meetingDate.isBefore(finalEndDate)) {
            dates.push({ date: meetingDate, excluded: excludedDates.has(meetingDate.format('YYYY-MM-DD')) });
          }
          currentDate = currentDate.add(1, 'month');
          break;

        case 'quarterly':
          // Check if current month is in quarterly months
          if (quarterlyMonths.includes(currentDate.month() + 1)) {
            if (monthlyType === 'dayOfMonth') {
              meetingDate = currentDate.date(Math.min(monthlyDayOfMonth, currentDate.daysInMonth()));
            } else {
              meetingDate = getNthDayOfMonth(currentDate, monthlyWeekOfMonth, monthlyDayOfWeek);
            }
            if ((meetingDate.isSame(startDate, 'day') || meetingDate.isAfter(startDate, 'day')) && meetingDate.isBefore(finalEndDate)) {
              dates.push({ date: meetingDate, excluded: excludedDates.has(meetingDate.format('YYYY-MM-DD')) });
            }
          }
          currentDate = currentDate.add(1, 'month');
          break;

        case 'annually':
          meetingDate = currentDate;
          if ((meetingDate.isSame(startDate, 'day') || meetingDate.isAfter(startDate, 'day')) && meetingDate.isBefore(finalEndDate)) {
            dates.push({ date: meetingDate, excluded: excludedDates.has(meetingDate.format('YYYY-MM-DD')) });
          }
          currentDate = currentDate.add(1, 'year');
          break;
      }
    }

    // Sort dates and limit to max
    dates.sort((a, b) => a.date.valueOf() - b.date.valueOf());
    const limitedDates = dates.slice(0, Math.min(dates.length, 52));
    
    setGeneratedDates(limitedDates);
    
    if (limitedDates.length > 0) {
      message.success(`Generated ${limitedDates.length} meeting dates`);
    }
  };

  // Toggle date exclusion
  const toggleDateExclusion = (dateStr: string) => {
    const newExcluded = new Set(excludedDates);
    if (newExcluded.has(dateStr)) {
      newExcluded.delete(dateStr);
    } else {
      newExcluded.add(dateStr);
    }
    setExcludedDates(newExcluded);
    
    // Update generated dates
    setGeneratedDates(prev => prev.map(d => ({
      ...d,
      excluded: newExcluded.has(d.date.format('YYYY-MM-DD'))
    })));
  };

  // Location type for conditional rendering
  const locationType = Form.useWatch('locationType', form);

  // Step 2: Meeting Details
  const MeetingDetailsStep = () => (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Meeting Details</Title>
      <Text type="secondary">
        Enter the meeting title, date, time, and location information.
      </Text>
      <Divider />
      
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Meeting Title */}
        <Form.Item
          name="title"
          label="Meeting Title"
          rules={[{ required: true, message: 'Please enter a meeting title' }]}
          initialValue={generateDefaultTitle()}
        >
          <Input placeholder="Enter meeting title" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label="Description / Agenda"
        >
          <Input.TextArea 
            placeholder="Enter meeting description or agenda items"
            rows={3}
          />
        </Form.Item>

        {/* Date and Time Row */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="scheduledDate"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true, message: 'Please select start time' }]}
            >
              <TimePicker 
                style={{ width: '100%' }}
                format="h:mm A"
                use12Hours
                minuteStep={15}
                needConfirm={false}
                onChange={() => handleStartTimeOrDurationChange()}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endTime"
              label="End Time"
              rules={[{ required: true, message: 'Please select end time' }]}
            >
              <TimePicker 
                style={{ width: '100%' }}
                format="h:mm A"
                use12Hours
                minuteStep={15}
                needConfirm={false}
                onChange={() => handleEndTimeChange()}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Duration and Timezone Row */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration' }]}
              initialValue={getDefaultDuration()}
            >
              <InputNumber 
                style={{ width: '100%' }}
                min={15}
                max={480}
                step={15}
                onChange={() => handleStartTimeOrDurationChange()}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timezone"
              label="Timezone"
              rules={[{ required: true, message: 'Please select timezone' }]}
              initialValue="Africa/Nairobi"
            >
              <Select
                showSearch
                placeholder="Select timezone"
                options={[
                  { value: 'Africa/Nairobi', label: 'East Africa Time (EAT) - Nairobi' },
                  { value: 'Africa/Lagos', label: 'West Africa Time (WAT) - Lagos' },
                  { value: 'Africa/Johannesburg', label: 'South Africa Time (SAST) - Johannesburg' },
                  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London' },
                  { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
                  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Location Type Cards */}
        <Form.Item
          name="locationType"
          label="Location Type"
          rules={[{ required: true, message: 'Please select location type' }]}
          initialValue="virtual"
        >
          <Input type="hidden" />
        </Form.Item>
        <Row gutter={12} style={{ marginTop: -8, marginBottom: 16 }}>
          {[
            { value: 'physical', label: 'Physical', desc: 'In-person venue', icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#52c41a' }} />, color: '#52c41a' },
            { value: 'virtual', label: 'Virtual', desc: 'Jitsi Meet link', icon: <VideoCameraOutlined style={{ fontSize: 24, color: '#1890ff' }} />, color: '#1890ff' },
            { value: 'hybrid', label: 'Hybrid', desc: 'Both options', icon: <HomeOutlined style={{ fontSize: 24, color: '#faad14' }} />, color: '#faad14' },
          ].map((option) => {
            const isSelected = locationType === option.value;
            return (
              <Col span={8} key={option.value}>
                <div
                  onClick={() => form.setFieldValue('locationType', option.value)}
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    borderRadius: 8,
                    border: isSelected ? `2px solid ${option.color}` : '1px solid #d9d9d9',
                    backgroundColor: isSelected ? `${option.color}08` : '#fff',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: isSelected ? `${option.color}15` : '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {option.icon}
                    </div>
                    <Text strong style={{ fontSize: 13 }}>{option.label}</Text>
                    <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>
                      {option.desc}
                    </Text>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>

        {/* Physical Location (conditional) */}
        {(locationType === 'physical' || locationType === 'hybrid') && (
          <Form.Item
            name="physicalLocation"
            label="Physical Location"
            rules={[{ required: locationType === 'physical', message: 'Please enter the physical location' }]}
          >
            <Input placeholder="Enter venue address" />
          </Form.Item>
        )}

        <Divider />

        {/* Recurring Meeting Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: isRecurring ? '#e6f7ff' : '#fafafa',
          borderRadius: 8,
          border: isRecurring ? '1px solid #91d5ff' : '1px solid #d9d9d9',
          marginBottom: isRecurring ? 16 : 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SyncOutlined style={{ fontSize: 20, color: isRecurring ? '#1890ff' : '#8c8c8c' }} />
            <div>
              <Text strong>Recurring Meeting</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Create a series of meetings with the same settings
                </Text>
              </div>
            </div>
          </div>
          <Switch 
            checked={isRecurring} 
            onChange={(checked) => {
              setIsRecurring(checked);
              if (!checked) {
                setGeneratedDates([]);
                setExcludedDates(new Set());
              }
            }}
          />
        </div>

        {/* Recurring Options (conditional) */}
        {isRecurring && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fafafa', 
            borderRadius: 8,
            border: '1px solid #d9d9d9',
          }}>
            {/* Recurrence Pattern - Card Based */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Recurrence Pattern</Text>
              <Row gutter={12}>
                {[
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'annually', label: 'Annually' },
                ].map((option) => {
                  const isSelected = recurrencePattern === option.value;
                  return (
                    <Col span={6} key={option.value}>
                      <div
                        onClick={() => setRecurrencePattern(option.value as 'weekly' | 'monthly' | 'quarterly' | 'annually')}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          borderRadius: 6,
                          border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          backgroundColor: isSelected ? '#e6f7ff' : '#fff',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                      >
                        <Text strong style={{ fontSize: 13, color: isSelected ? '#1890ff' : '#595959' }}>
                          {option.label}
                        </Text>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>

            {/* Weekly Options */}
            {recurrencePattern === 'weekly' && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Repeat on</Text>
                <Checkbox.Group 
                  value={weeklyDays} 
                  onChange={(values) => setWeeklyDays(values as string[])}
                >
                  <Row gutter={[8, 8]}>
                    {WEEKDAYS.map(day => (
                      <Col key={day.value}>
                        <Checkbox value={day.value}>{day.short}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </div>
            )}

            {/* Monthly Options */}
            {(recurrencePattern === 'monthly' || recurrencePattern === 'quarterly') && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Day Selection</Text>
                <Row gutter={12}>
                  <Col span={24}>
                    <Select
                      value={monthlyType}
                      onChange={setMonthlyType}
                      style={{ width: '100%', marginBottom: 12 }}
                      options={[
                        { value: 'dayOfMonth', label: 'Specific day of month' },
                        { value: 'dayOfWeek', label: 'Specific day of week' },
                      ]}
                    />
                  </Col>
                </Row>
                {monthlyType === 'dayOfMonth' && (
                  <Row gutter={12} align="middle">
                    <Col flex="none">
                      <Text>Day</Text>
                    </Col>
                    <Col flex="none">
                      <InputNumber 
                        min={1} 
                        max={31} 
                        value={monthlyDayOfMonth}
                        onChange={(v) => setMonthlyDayOfMonth(v || 1)}
                        style={{ width: 70 }}
                      />
                    </Col>
                    <Col flex="none">
                      <Text>of the month</Text>
                    </Col>
                  </Row>
                )}
                {monthlyType === 'dayOfWeek' && (
                  <Row gutter={12} align="middle">
                    <Col flex="none">
                      <Text>The</Text>
                    </Col>
                    <Col flex="none">
                      <Select
                        value={monthlyWeekOfMonth}
                        onChange={setMonthlyWeekOfMonth}
                        style={{ width: 100 }}
                        options={WEEK_OF_MONTH_OPTIONS}
                      />
                    </Col>
                    <Col flex="none">
                      <Select
                        value={monthlyDayOfWeek}
                        onChange={setMonthlyDayOfWeek}
                        style={{ width: 120 }}
                        options={WEEKDAYS.map(d => ({ value: d.value, label: d.label }))}
                      />
                    </Col>
                  </Row>
                )}
              </div>
            )}

            {/* Quarterly Months Selection */}
            {recurrencePattern === 'quarterly' && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Quarters</Text>
                <Checkbox.Group 
                  value={quarterlyMonths} 
                  onChange={(values) => setQuarterlyMonths(values as number[])}
                >
                  <Space>
                    <Checkbox value={1}>Q1 (Jan)</Checkbox>
                    <Checkbox value={4}>Q2 (Apr)</Checkbox>
                    <Checkbox value={7}>Q3 (Jul)</Checkbox>
                    <Checkbox value={10}>Q4 (Oct)</Checkbox>
                  </Space>
                </Checkbox.Group>
              </div>
            )}

            <Divider style={{ margin: '12px 0' }} />

            {/* End Condition */}
            <div style={{ marginBottom: 0 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>End</Text>
              <Row gutter={12}>
                <Col span={24}>
                  <Select
                    value={endType}
                    onChange={setEndType}
                    style={{ width: '100%', marginBottom: 12 }}
                    options={[
                      { value: 'occurrences', label: 'After specific number of occurrences' },
                      { value: 'date', label: 'On a specific date' },
                    ]}
                  />
                </Col>
              </Row>
              {endType === 'occurrences' && (
                <Row gutter={12} align="middle">
                  <Col flex="none">
                    <Text>After</Text>
                  </Col>
                  <Col flex="none">
                    <InputNumber 
                      min={2} 
                      max={52} 
                      value={occurrences}
                      onChange={(v) => setOccurrences(v || 12)}
                      style={{ width: 80 }}
                    />
                  </Col>
                  <Col flex="none">
                    <Text>occurrences (max 52)</Text>
                  </Col>
                </Row>
              )}
              {endType === 'date' && (
                <Row gutter={12} align="middle">
                  <Col flex="none">
                    <Text>On date</Text>
                  </Col>
                  <Col flex="auto">
                    <DatePicker 
                      value={endDate}
                      onChange={setEndDate}
                      style={{ width: '100%' }}
                      disabledDate={(current) => {
                        const startDate = form.getFieldValue('scheduledDate');
                        return current && startDate && current.isBefore(startDate, 'day');
                      }}
                    />
                  </Col>
                </Row>
              )}
            </div>
          </div>
        )}
      </Space>
    </div>
  );

  // Step 3: Participants
  const ParticipantsStep = () => (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Participants</Title>
      <Text type="secondary">
        Select meeting participants and configure quorum requirements.
      </Text>
      <Divider />
      <ParticipantSelector
        boardId={selectedBoardId}
        value={participants}
        onChange={setParticipants}
        showQuorumSettings={true}
        quorumPercentage={quorumPercentage}
        onQuorumChange={setQuorumPercentage}
        allowGuests={true}
        defaultSelected="board_members"
        maxHeight={350}
      />
    </div>
  );

  // Step 4: Preview Series (only shown when recurring is enabled)
  const PreviewSeriesStep = () => {
    const includedDates = generatedDates.filter(d => !d.excluded);
    const excludedCount = generatedDates.filter(d => d.excluded).length;

    return (
      <div>
        <Title level={5} style={{ marginBottom: 4 }}>Preview Meeting Series</Title>
        <Text type="secondary">
          Review the generated meeting dates. You can exclude specific dates if needed.
        </Text>
        <Divider />

        {/* Summary */}
        <Alert
          type="info"
          message={
            <span>
              <strong>{includedDates.length}</strong> meetings will be created
              {excludedCount > 0 && <span> ({excludedCount} excluded)</span>}
            </span>
          }
          description={
            <span>
              Pattern: {recurrencePattern.charAt(0).toUpperCase() + recurrencePattern.slice(1)} • 
              {recurrencePattern === 'weekly' && ` Every ${weeklyDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`}
              {recurrencePattern === 'monthly' && (monthlyType === 'dayOfMonth' 
                ? ` Day ${monthlyDayOfMonth} of each month`
                : ` ${WEEK_OF_MONTH_OPTIONS.find(w => w.value === monthlyWeekOfMonth)?.label} ${monthlyDayOfWeek.charAt(0).toUpperCase() + monthlyDayOfWeek.slice(1)} of each month`
              )}
              {recurrencePattern === 'quarterly' && ` Quarters: ${quarterlyMonths.map(m => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m-1]).join(', ')}`}
              {recurrencePattern === 'annually' && ' Same date each year'}
            </span>
          }
          style={{ marginBottom: 16 }}
          showIcon
          action={
            generatedDates.length === 0 ? (
              <button 
                onClick={generateRecurringDates}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#1890ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Generate Dates
              </button>
            ) : (
              <button 
                onClick={generateRecurringDates}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#fff',
                  color: '#1890ff',
                  border: '1px solid #1890ff',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Regenerate
              </button>
            )
          }
        />

        {generatedDates.length > 0 && (
          <>
            {/* Warning for too many meetings */}
            {generatedDates.length > 24 && (
              <Alert
                type="warning"
                message={`This will create ${includedDates.length} meetings`}
                description="Consider reducing the number of occurrences or using a longer interval."
                style={{ marginBottom: 16 }}
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            )}

            {/* Dates Table */}
            <Table
              dataSource={generatedDates.map((d, i) => ({
                key: i,
                index: i + 1,
                date: d.date,
                dateStr: d.date.format('YYYY-MM-DD'),
                dayOfWeek: d.date.format('dddd'),
                formattedDate: d.date.format('MMMM D, YYYY'),
                excluded: d.excluded,
                conflict: d.conflict,
              }))}
              columns={[
                {
                  title: '#',
                  dataIndex: 'index',
                  width: 50,
                  render: (index: number, record: { excluded: boolean }) => (
                    <Text type={record.excluded ? 'secondary' : undefined} delete={record.excluded}>
                      {index}
                    </Text>
                  ),
                },
                {
                  title: 'Date',
                  dataIndex: 'formattedDate',
                  render: (text: string, record: { excluded: boolean; dayOfWeek: string }) => (
                    <div>
                      <Text type={record.excluded ? 'secondary' : undefined} delete={record.excluded}>
                        {text}
                      </Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.dayOfWeek}</Text>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'excluded',
                  width: 120,
                  render: (excluded: boolean, record: { conflict?: string }) => (
                    <Space>
                      {excluded ? (
                        <Tag color="default">Excluded</Tag>
                      ) : record.conflict ? (
                        <Tag color="warning" icon={<ExclamationCircleOutlined />}>Conflict</Tag>
                      ) : (
                        <Tag color="success">Included</Tag>
                      )}
                    </Space>
                  ),
                },
                {
                  title: 'Action',
                  width: 100,
                  render: (_: unknown, record: { dateStr: string; excluded: boolean }) => (
                    <button
                      onClick={() => toggleDateExclusion(record.dateStr)}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'transparent',
                        color: record.excluded ? '#1890ff' : '#ff4d4f',
                        border: `1px solid ${record.excluded ? '#1890ff' : '#ff4d4f'}`,
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {record.excluded ? 'Include' : 'Exclude'}
                    </button>
                  ),
                },
              ]}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </>
        )}

        {generatedDates.length === 0 && (
          <div style={{ 
            padding: 40, 
            textAlign: 'center', 
            backgroundColor: '#fafafa', 
            borderRadius: 8,
            border: '1px dashed #d9d9d9',
          }}>
            <SyncOutlined style={{ fontSize: 32, color: '#8c8c8c', marginBottom: 12 }} />
            <div>
              <Text type="secondary">Click "Generate Dates" to preview the meeting series</Text>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Watch form values for ReviewStep
  const watchedBoardType = Form.useWatch('boardType', form);
  const watchedMeetingType = Form.useWatch('meetingType', form);
  const watchedTitle = Form.useWatch('title', form);
  const watchedScheduledDate = Form.useWatch('scheduledDate', form);
  const watchedStartTime = Form.useWatch('startTime', form);
  const watchedEndTime = Form.useWatch('endTime', form);
  const watchedDuration = Form.useWatch('duration', form);
  const watchedLocationType = Form.useWatch('locationType', form);
  const watchedPhysicalLocation = Form.useWatch('physicalLocation', form);
  const watchedDescription = Form.useWatch('description', form);

  // Step 4: Review & Create
  const ReviewStep = () => {
    // Get all form values directly
    const allFormValues = form.getFieldsValue(true);
    
    // Debug: Log form values
    console.log('ReviewStep - Form Values:', allFormValues);
    console.log('ReviewStep - Watched boardType:', watchedBoardType);
    console.log('ReviewStep - Watched meetingType:', watchedMeetingType);
    console.log('ReviewStep - Participants:', participants);
    
    const boardTypeLabel = BOARD_TYPE_OPTIONS.find(b => b.value === allFormValues.boardType)?.label || allFormValues.boardType || '-';
    const meetingTypeLabel = MEETING_TYPE_OPTIONS.find(m => m.value === allFormValues.meetingType)?.label || allFormValues.meetingType || '-';
    const locationTypeLabels: Record<string, string> = {
      physical: 'Physical (In-person)',
      virtual: 'Virtual (Jitsi Meet)',
      hybrid: 'Hybrid (Both)',
    };

    // Calculate quorum info
    const nonGuestCount = participants.filter(p => !p.isGuest).length;
    const requiredForQuorum = Math.ceil((nonGuestCount * quorumPercentage) / 100);
    const canMeetQuorum = nonGuestCount >= requiredForQuorum;

    return (
      <div>
        <Title level={5} style={{ marginBottom: 4 }}>Review & Create</Title>
        <Text type="secondary">
          Review all meeting details before creating the meeting.
        </Text>
        <Divider />

        {/* Board & Meeting Type */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Board & Meeting Type
          </Text>
          <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
            <Row gutter={[24, 8]}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Board Type</Text>
                <div><Text strong>{boardTypeLabel}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Board/Committee</Text>
                <div><Text strong>{selectedBoard?.label || '-'}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Meeting Type</Text>
                <div><Text strong>{meetingTypeLabel}</Text></div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Meeting Details */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Meeting Details
          </Text>
          <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
            <Row gutter={[24, 12]}>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>Title</Text>
                <div><Text strong>{allFormValues.title || '-'}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Date</Text>
                <div><Text strong>{allFormValues.scheduledDate ? dayjs(allFormValues.scheduledDate).format('dddd, MMMM D, YYYY') : '-'}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Time</Text>
                <div>
                  <Text strong>
                    {allFormValues.startTime ? dayjs(allFormValues.startTime).format('h:mm A') : '-'} - {allFormValues.endTime ? dayjs(allFormValues.endTime).format('h:mm A') : '-'}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Duration</Text>
                <div><Text strong>{allFormValues.duration ? `${allFormValues.duration} minutes` : '-'}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Location Type</Text>
                <div><Text strong>{locationTypeLabels[allFormValues.locationType] || '-'}</Text></div>
              </Col>
              {(allFormValues.locationType === 'physical' || allFormValues.locationType === 'hybrid') && (
                <Col span={16}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Venue</Text>
                  <div><Text strong>{allFormValues.physicalLocation || '-'}</Text></div>
                </Col>
              )}
              {(allFormValues.locationType === 'virtual' || allFormValues.locationType === 'hybrid') && (
                <Col span={16}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Virtual Meeting</Text>
                  <div><Text strong style={{ color: '#1890ff' }}>Jitsi Meet link will be auto-generated</Text></div>
                </Col>
              )}
              {allFormValues.description && (
                <Col span={24}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Description</Text>
                  <div><Text>{allFormValues.description}</Text></div>
                </Col>
              )}
            </Row>
          </div>
        </div>

        {/* Recurring Meeting Series (conditional) */}
        {isRecurring && generatedDates.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <SyncOutlined style={{ marginRight: 8 }} />
              Meeting Series ({generatedDates.filter(d => !d.excluded).length} meetings)
            </Text>
            <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
              <Row gutter={[24, 8]}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Pattern</Text>
                  <div><Text strong>{recurrencePattern.charAt(0).toUpperCase() + recurrencePattern.slice(1)}</Text></div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Total Meetings</Text>
                  <div><Text strong>{generatedDates.filter(d => !d.excluded).length}</Text></div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Date Range</Text>
                  <div>
                    <Text strong>
                      {generatedDates[0]?.date.format('MMM D, YYYY')} - {generatedDates[generatedDates.length - 1]?.date.format('MMM D, YYYY')}
                    </Text>
                  </div>
                </Col>
              </Row>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Meeting Dates:</Text>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {generatedDates.filter(d => !d.excluded).slice(0, 6).map((d, i) => (
                    <Tag key={i} color="blue">{d.date.format('MMM D')}</Tag>
                  ))}
                  {generatedDates.filter(d => !d.excluded).length > 6 && (
                    <Tag>+{generatedDates.filter(d => !d.excluded).length - 6} more</Tag>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Participants ({participants.length})
          </Text>
          <div style={{ marginTop: 12 }}>
            {/* Quorum Status */}
            <Alert
              type={canMeetQuorum ? 'success' : 'warning'}
              message={
                <span>
                  Quorum: {quorumPercentage}% ({requiredForQuorum} of {nonGuestCount} required)
                  {canMeetQuorum ? ' — Can be met' : ' — May not be met'}
                </span>
              }
              style={{ marginBottom: 12 }}
              showIcon
            />
            
            {/* Participants Table */}
            <div style={{ backgroundColor: '#fafafa', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '40px 1fr 1fr', 
                padding: '8px 16px', 
                backgroundColor: '#f0f0f0',
                fontWeight: 500,
                fontSize: 12,
                color: '#8c8c8c',
              }}>
                <div>#</div>
                <div>Name</div>
                <div>Role</div>
              </div>
              <div>
                {participants.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <Text type="secondary">No participants selected</Text>
                  </div>
                ) : (
                  participants.map((p, index) => (
                    <div 
                      key={p.userId} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '40px 1fr 1fr', 
                        padding: '8px 16px',
                        borderBottom: index < participants.length - 1 ? '1px solid #f0f0f0' : 'none',
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <Text type="secondary">{index + 1}</Text>
                      </div>
                      <div>
                        <Text>{p.name}</Text>
                      </div>
                      <div>
                        <Text type="secondary">{p.roleName}</Text>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Validation functions for each step
  const validateStep1 = async (): Promise<boolean> => {
    try {
      await form.validateFields(['boardType', 'boardId', 'meetingType']);
      return true;
    } catch {
      return false;
    }
  };

  const validateStep2 = async (): Promise<boolean> => {
    try {
      const locationTypeValue = form.getFieldValue('locationType');
      const fieldsToValidate = ['title', 'scheduledDate', 'startTime', 'endTime', 'duration', 'timezone', 'locationType'];
      
      // Add physical location field if physical or hybrid meeting
      if (locationTypeValue === 'physical' || locationTypeValue === 'hybrid') {
        fieldsToValidate.push('physicalLocation');
      }
      // Note: meetingLink is auto-generated via Jitsi, no validation needed
      
      await form.validateFields(fieldsToValidate);
      return true;
    } catch {
      return false;
    }
  };

  const validateStep3 = async (): Promise<boolean> => {
    // Validate that at least some participants are selected
    if (participants.length === 0) {
      message.error('Please select at least one participant');
      return false;
    }
    
    // Validate quorum can be met
    const nonGuestCount = participants.filter(p => !p.isGuest).length;
    const requiredForQuorum = Math.ceil((nonGuestCount * quorumPercentage) / 100);
    if (nonGuestCount < requiredForQuorum) {
      message.warning('Current participants may not meet quorum requirements');
    }
    
    return true;
  };

  const validatePreviewSeries = async (): Promise<boolean> => {
    // For recurring meetings, ensure dates have been generated
    if (generatedDates.length === 0) {
      message.error('Please generate meeting dates first');
      return false;
    }
    
    // Ensure at least one date is included
    const includedDates = generatedDates.filter(d => !d.excluded);
    if (includedDates.length === 0) {
      message.error('At least one meeting date must be included');
      return false;
    }
    
    return true;
  };

  // Define wizard steps - memoized with dependencies to ensure fresh data in ReviewStep
  // Conditionally include Preview Series step when recurring is enabled
  const steps: WizardStep[] = useMemo(() => {
    const baseSteps: WizardStep[] = [
      {
        key: 'board',
        title: 'Select Board',
        description: 'Choose board or committee',
        icon: <BankOutlined />,
        content: <BoardSelectionStep />,
        validate: validateStep1,
      },
      {
        key: 'details',
        title: 'Meeting Details',
        description: 'Title, date, time & location',
        icon: <CalendarOutlined />,
        content: <MeetingDetailsStep />,
        validate: validateStep2,
      },
      {
        key: 'participants',
        title: 'Participants',
        description: 'Review attendees & quorum',
        icon: <TeamOutlined />,
        content: <ParticipantsStep />,
        validate: validateStep3,
      },
    ];

    // Add Preview Series step if recurring is enabled
    if (isRecurring) {
      baseSteps.push({
        key: 'preview-series',
        title: 'Preview Series',
        description: 'Review generated dates',
        icon: <SyncOutlined />,
        content: <PreviewSeriesStep />,
        validate: validatePreviewSeries,
      });
    }

    // Always add Review step at the end
    baseSteps.push({
      key: 'review',
      title: 'Review & Create',
      description: 'Confirm meeting details',
      icon: <CheckCircleOutlined />,
      content: <ReviewStep />,
    });

    return baseSteps;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, quorumPercentage, selectedBoard, selectedBoardId, selectedBoardType, 
      watchedBoardType, watchedMeetingType, watchedTitle, watchedScheduledDate, 
      watchedStartTime, watchedEndTime, watchedDuration, watchedLocationType, 
      watchedPhysicalLocation, watchedDescription, isRecurring, generatedDates]);

  // Handle form submission
  const handleFinish = async () => {
    const values = form.getFieldsValue(true);
    
    if (isRecurring) {
      // Create multiple meetings for recurring series
      const includedDates = generatedDates.filter(d => !d.excluded);
      console.log('Creating recurring meeting series:', {
        ...values,
        isRecurring: true,
        recurrencePattern,
        dates: includedDates.map(d => d.date.format('YYYY-MM-DD')),
        participants,
      });
      
      // TODO: Call API to create meeting series
      message.success(`${includedDates.length} meetings created successfully!`);
    } else {
      // Create single meeting
      console.log('Creating single meeting:', {
        ...values,
        participants,
      });
      
      // TODO: Call API to create meeting
      message.success('Meeting created successfully!');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/${currentBoard?.id}/meetings`);
  };

  return (
    <Form form={form} layout="vertical" preserve={true}>
      <WizardForm
        steps={steps}
        title="Schedule New Meeting"
        subtitle={`Create a meeting for ${currentBoard?.name || 'your board'}`}
        onFinish={handleFinish}
        onCancel={handleCancel}
        finishButtonText="Create Meeting"
        successResult={{
          title: 'Meeting Created Successfully!',
          subTitle: 'Participants will be notified about the upcoming meeting.',
          extra: (
            <button onClick={() => navigate(`/${currentBoard?.id}/meetings`)}>
              View Meetings
            </button>
          ),
        }}
        errorResult={{
          title: 'Failed to Create Meeting',
          subTitle: 'Please try again or contact support if the problem persists.',
        }}
      />
    </Form>
  );
};

export default MeetingCreatePage;
