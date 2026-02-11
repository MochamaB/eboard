/**
 * MeetingCreatePage - Refactored with separate step components
 * Multi-step wizard for creating new meetings with optional recurring series
 * Steps:
 * 1. Select Board/Committee
 * 2. Meeting Details
 * 3. Recurring Settings (conditional - only if recurring enabled)
 * 4. Participants
 * 5. Review & Create
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  BankOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { WizardForm, type WizardStep, type SelectedParticipant } from '../../components/common';
import { useBoardContext } from '../../contexts';
import type { MeetingType, CreateMeetingPayload, MeetingOverrides } from '../../types/meeting.types';
import { getMeetingTypeByCode } from '../../mocks/db/tables/meetingTypes';
import { checkConfirmationRequired, getApproverRole } from '../../utils/meetingConfirmation';
import { useCreateMeeting } from '../../hooks';
import {
  BoardSelectionStep,
  MeetingDetailsStep,
  RecurringSettingsStep,
  ParticipantsStep,
  ReviewStep,
} from './steps';

const MeetingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBoard, allBoards, committees } = useBoardContext();
  const [form] = Form.useForm();
  const createMeetingMutation = useCreateMeeting();

  // Board selection state
  const [selectedBoardType, setSelectedBoardType] = useState<string | undefined>();
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();
  const [meetingType, setMeetingType] = useState<MeetingType | undefined>();
  
  // Participants state
  const [participants, setParticipants] = useState<SelectedParticipant[]>([]);
  const [quorumPercentage, setQuorumPercentage] = useState<number>(50);
  
  // Recurring meeting state
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'weekly' | 'monthly' | 'quarterly' | 'annually'>('monthly');
  const [weeklyDays, setWeeklyDays] = useState<string[]>(['monday']);
  const [monthlyType, setMonthlyType] = useState<'dayOfMonth' | 'dayOfWeek'>('dayOfMonth');
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState<number>(15);
  const [monthlyWeekOfMonth, setMonthlyWeekOfMonth] = useState<number>(1);
  const [monthlyDayOfWeek, setMonthlyDayOfWeek] = useState<string>('monday');
  const [quarterlyMonths, setQuarterlyMonths] = useState<number[]>([1, 4, 7, 10]);
  const [endType, setEndType] = useState<'date' | 'occurrences'>('occurrences');
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [occurrences, setOccurrences] = useState<number>(12);
  const [generatedDates, setGeneratedDates] = useState<{ date: Dayjs; excluded: boolean; conflict?: string }[]>([]);
  const [excludedDates, setExcludedDates] = useState<Set<string>>(new Set());

  // Override state (for ReviewStep)
  const [overrides, setOverrides] = useState<MeetingOverrides | undefined>(undefined);
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Form field watches
  const locationType = Form.useWatch('locationType', form);

  // Get all boards including committees
  const allBoardsWithCommittees = useMemo(() => {
    const boards = allBoards.map(board => ({
      value: board.id,
      label: board.name,
      type: board.type,
      shortName: board.shortName,
      parentName: undefined as string | undefined,
    }));
    
    const committeeOptions = committees.map(comm => ({
      value: comm.id,
      label: comm.name,
      type: 'committee' as const,
      shortName: comm.shortName,
      parentName: currentBoard?.name,
    }));
    
    return [...boards, ...committeeOptions];
  }, [allBoards, committees, currentBoard]);

  const selectedBoard = useMemo(() => {
    const board = allBoardsWithCommittees.find(b => b.value === selectedBoardId);
    console.log('🏢 MeetingCreatePage - selectedBoard computed:', {
      selectedBoardId,
      foundBoard: board,
      allBoardsCount: allBoardsWithCommittees.length
    });
    return board;
  }, [allBoardsWithCommittees, selectedBoardId]);

  // Handlers
  const handleBoardTypeChange = (value: string) => {
    setSelectedBoardType(value);
    setSelectedBoardId(undefined);
    form.setFieldValue('boardId', undefined);
  };

  const handleBoardChange = (value: string) => {
    setSelectedBoardId(value);
  };

  const handleMeetingTypeChange = (value: MeetingType) => {
    // Update both state and form field
    setMeetingType(value);
    form.setFieldValue('meetingType', value);
    
    // Set default duration based on meeting type
    const selectedType = getMeetingTypeByCode(value);
    if (selectedType) {
      form.setFieldValue('duration', selectedType.defaultDuration);
    }
  };

  const handleStartTimeOrDurationChange = () => {
    const startTime = form.getFieldValue('startTime');
    const duration = form.getFieldValue('duration');
    if (startTime && duration) {
      const endTime = startTime.add(duration, 'minute');
      form.setFieldValue('endTime', endTime);
    }
  };

  const handleEndTimeChange = () => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    if (startTime && endTime) {
      const diff = endTime.diff(startTime, 'minute');
      if (diff > 0) {
        form.setFieldValue('duration', diff);
      }
    }
  };

  // Generate recurring dates
  const generateRecurringDates = () => {
    const startDate = form.getFieldValue('scheduledDate') as Dayjs;
    if (!startDate) {
      message.warning('Please select a start date first');
      return;
    }

    const WEEKDAYS = [
      { value: 'sunday', label: 'Sunday' },
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
    ];

    const WEEK_OF_MONTH_OPTIONS = [
      { value: 1, label: 'First' },
      { value: 2, label: 'Second' },
      { value: 3, label: 'Third' },
      { value: 4, label: 'Fourth' },
      { value: -1, label: 'Last' },
    ];

    const dates: { date: Dayjs; excluded: boolean; conflict?: string }[] = [];
    let currentDate = startDate.clone();
    const maxDates = endType === 'occurrences' ? occurrences : 52;
    const finalEndDate = endType === 'date' && endDate ? endDate : startDate.add(2, 'year');

    const getDayIndex = (day: string): number => {
      return WEEKDAYS.findIndex(w => w.value === day);
    };

    const getNthDayOfMonth = (date: Dayjs, weekOfMonth: number, dayOfWeek: string): Dayjs => {
      const dayIndex = getDayIndex(dayOfWeek);
      let result: Dayjs;
      
      if (weekOfMonth === -1) {
        result = date.endOf('month');
        while (result.day() !== dayIndex) {
          result = result.subtract(1, 'day');
        }
      } else {
        result = date.startOf('month');
        let count = 0;
        while (count < weekOfMonth) {
          if (result.day() === dayIndex) {
            count++;
            if (count === weekOfMonth) break;
          }
          result = result.add(1, 'day');
        }
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
            meetingDate = currentDate.date(Math.min(monthlyDayOfMonth, currentDate.daysInMonth()));
          } else {
            meetingDate = getNthDayOfMonth(currentDate, monthlyWeekOfMonth, monthlyDayOfWeek);
          }
          if ((meetingDate.isSame(startDate, 'day') || meetingDate.isAfter(startDate, 'day')) && meetingDate.isBefore(finalEndDate)) {
            dates.push({ date: meetingDate, excluded: excludedDates.has(meetingDate.format('YYYY-MM-DD')) });
          }
          currentDate = currentDate.add(1, 'month');
          break;

        case 'quarterly':
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

    dates.sort((a, b) => a.date.valueOf() - b.date.valueOf());
    const limitedDates = dates.slice(0, Math.min(dates.length, 52));
    
    setGeneratedDates(limitedDates);
    
    if (limitedDates.length > 0) {
      message.success(`Generated ${limitedDates.length} meeting dates`);
    }
  };

  const toggleDateExclusion = (dateStr: string) => {
    const newExcluded = new Set(excludedDates);
    if (newExcluded.has(dateStr)) {
      newExcluded.delete(dateStr);
    } else {
      newExcluded.add(dateStr);
    }
    setExcludedDates(newExcluded);
    
    setGeneratedDates(prev => prev.map(d => ({
      ...d,
      excluded: newExcluded.has(d.date.format('YYYY-MM-DD'))
    })));
  };

  // Validation functions
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
      
      if (locationTypeValue === 'physical' || locationTypeValue === 'hybrid') {
        fieldsToValidate.push('physicalLocation');
      }
      
      await form.validateFields(fieldsToValidate);
      return true;
    } catch {
      return false;
    }
  };

  const validateRecurring = async (): Promise<boolean> => {
    if (!isRecurring) return true; // Skip validation if not recurring
    
    if (generatedDates.length === 0) {
      message.error('Please generate meeting dates first');
      return false;
    }
    
    const includedDates = generatedDates.filter(d => !d.excluded);
    if (includedDates.length === 0) {
      message.error('At least one meeting date must be included');
      return false;
    }
    
    return true;
  };

  const validateParticipants = async (): Promise<boolean> => {
    if (participants.length === 0) {
      message.error('Please select at least one participant');
      return false;
    }
    
    const nonGuestCount = participants.filter(p => !p.isGuest).length;
    const requiredForQuorum = Math.ceil((nonGuestCount * quorumPercentage) / 100);
    if (nonGuestCount < requiredForQuorum) {
      message.warning('Current participants may not meet quorum requirements');
    }
    
    return true;
  };

  // Define wizard steps
  const steps: WizardStep[] = useMemo(() => {
    const baseSteps: WizardStep[] = [
      {
        key: 'board',
        title: 'Select Board',
        description: 'Choose board or committee',
        icon: <BankOutlined />,
        content: (
          <BoardSelectionStep
            form={form}
            selectedBoardType={selectedBoardType}
            selectedBoardId={selectedBoardId}
            allBoardsWithCommittees={allBoardsWithCommittees}
            onBoardTypeChange={handleBoardTypeChange}
            onBoardChange={handleBoardChange}
            onMeetingTypeChange={handleMeetingTypeChange}
          />
        ),
        validate: validateStep1,
      },
      {
        key: 'details',
        title: 'Meeting Details',
        description: 'Title, date, time & location',
        icon: <CalendarOutlined />,
        content: (
          <MeetingDetailsStep
            form={form}
            locationType={locationType}
            selectedBoard={selectedBoard}
            meetingType={meetingType}
            onStartTimeOrDurationChange={handleStartTimeOrDurationChange}
            onEndTimeChange={handleEndTimeChange}
          />
        ),
        validate: validateStep2,
      },
      {
        key: 'recurring',
        title: 'Recurring Settings',
        description: 'Configure meeting series',
        icon: <SyncOutlined />,
        content: (
          <RecurringSettingsStep
            form={form}
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            recurrencePattern={recurrencePattern}
            setRecurrencePattern={setRecurrencePattern}
            weeklyDays={weeklyDays}
            setWeeklyDays={setWeeklyDays}
            monthlyType={monthlyType}
            setMonthlyType={setMonthlyType}
            monthlyDayOfMonth={monthlyDayOfMonth}
            setMonthlyDayOfMonth={setMonthlyDayOfMonth}
            monthlyWeekOfMonth={monthlyWeekOfMonth}
            setMonthlyWeekOfMonth={setMonthlyWeekOfMonth}
            monthlyDayOfWeek={monthlyDayOfWeek}
            setMonthlyDayOfWeek={setMonthlyDayOfWeek}
            quarterlyMonths={quarterlyMonths}
            setQuarterlyMonths={setQuarterlyMonths}
            endType={endType}
            setEndType={setEndType}
            endDate={endDate}
            setEndDate={setEndDate}
            occurrences={occurrences}
            setOccurrences={setOccurrences}
            generatedDates={generatedDates}
            onGenerateDates={generateRecurringDates}
            onToggleDateExclusion={toggleDateExclusion}
          />
        ),
        validate: validateRecurring,
      },
      {
        key: 'participants',
        title: 'Participants',
        description: 'Review attendees & quorum',
        icon: <TeamOutlined />,
        content: (
          <ParticipantsStep
            boardId={selectedBoardId}
            participants={participants}
            setParticipants={setParticipants}
            quorumPercentage={quorumPercentage}
            setQuorumPercentage={setQuorumPercentage}
          />
        ),
        validate: validateParticipants,
      },
      {
        key: 'review',
        title: 'Review & Create',
        description: 'Confirm meeting details',
        icon: <CheckCircleOutlined />,
        content: (
          <ReviewStep
            form={form}
            selectedBoard={selectedBoard}
            participants={participants}
            quorumPercentage={quorumPercentage}
            isRecurring={isRecurring}
            recurrencePattern={recurrencePattern}
            generatedDates={generatedDates}
            overrides={overrides}
            overrideReason={overrideReason}
            onOverridesChange={setOverrides}
            onOverrideReasonChange={setOverrideReason}
          />
        ),
      },
    ];

    return baseSteps;
  }, [
    form,
    selectedBoardType,
    selectedBoardId,
    selectedBoard,
    allBoardsWithCommittees,
    locationType,
    participants,
    quorumPercentage,
    isRecurring,
    recurrencePattern,
    weeklyDays,
    monthlyType,
    monthlyDayOfMonth,
    monthlyWeekOfMonth,
    monthlyDayOfWeek,
    quarterlyMonths,
    endType,
    endDate,
    occurrences,
    generatedDates,
    overrides,
    overrideReason,
  ]);

  // Handle form submission
  const handleFinish = async () => {
    try {
      const values = form.getFieldsValue(true);
      const selectedBoardData = allBoardsWithCommittees.find(b => b.value === selectedBoardId);
      
      if (!selectedBoardData) {
        message.error('Please select a board or committee');
        return;
      }

      // Check if confirmation is required
      const requiresConfirmation = checkConfirmationRequired(
        selectedBoardData.type as 'main' | 'subsidiary' | 'committee' | 'factory',
        values.meetingType,
        { type: selectedBoardData.type as 'main' | 'subsidiary' | 'committee' | 'factory' }
      );

      // Build the meeting payload
      const meetingPayload: CreateMeetingPayload = {
        boardId: selectedBoardId!,
        title: values.title,
        description: values.description || undefined,
        meetingType: values.meetingType,
        startDate: values.scheduledDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        duration: values.duration,
        locationType: values.locationType,
        locationDetails: values.physicalLocation || undefined,
        physicalAddress: values.locationType === 'physical' || values.locationType === 'hybrid' ? values.physicalLocation : undefined,
        virtualMeetingLink: values.locationType === 'virtual' || values.locationType === 'hybrid' ? 'auto-generated' : undefined,
        quorumPercentage: quorumPercentage,
        isRecurring: isRecurring,
        recurrencePattern: isRecurring ? {
          frequency: recurrencePattern,
          interval: 1,
          endDate: endType === 'date' && endDate ? endDate.format('YYYY-MM-DD') : undefined,
          occurrences: endType === 'occurrences' ? occurrences : undefined,
          excludeDates: isRecurring ? generatedDates.filter(d => d.excluded).map(d => d.date.format('YYYY-MM-DD')) : undefined,
        } : undefined,
        overrides: overrides ?? undefined,
        overrideReason: overrideReason || undefined,
      };

      // Create meeting via React Query mutation
      const createdMeeting = await createMeetingMutation.mutateAsync(meetingPayload);

      // Show success message based on confirmation requirement
      if (requiresConfirmation) {
        const approverRole = getApproverRole(selectedBoardData.type as 'main' | 'subsidiary' | 'committee' | 'factory');
        message.success({
          content: `Meeting created successfully! Awaiting confirmation from ${approverRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}.`,
          duration: 5,
        });
      } else {
        if (isRecurring) {
          const includedDates = generatedDates.filter(d => !d.excluded);
          message.success({
            content: `Meeting series created! ${includedDates.length} meetings scheduled. Invitations sent to ${participants.length} participants.`,
            duration: 5,
          });
        } else {
          message.success({
            content: `Meeting created successfully! Invitations sent to ${participants.length} participants.`,
            duration: 5,
          });
        }
      }

      // Redirect to meeting details page
      navigate(`/${currentBoard?.id}/meetings/${createdMeeting.id}`);
      
    } catch (error: any) {
      console.error('Failed to create meeting:', error);
      message.error({
        content: error?.message || 'Failed to create meeting. Please try again.',
        duration: 5,
      });
    }
  };

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
        finishButtonText={isRecurring ? "Create Meeting Series" : "Create Meeting"}
      />
    </Form>
  );
};

export default MeetingCreatePage;
