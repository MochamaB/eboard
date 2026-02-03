/**
 * Meeting Detail Page
 * View full meeting details with tabbed sections
 * Actions: Edit, Cancel, Reschedule, Confirm, Join Meeting
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  StopOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { useBoardContext } from '../../contexts';
import { useMeeting } from '../../hooks/api';
import { useMeetingDocuments } from '../../hooks/api/useDocuments';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { DetailPageLayout } from '../../components/common';
import type { MetadataItem, ActionButton } from '../../components/common';
import type { HorizontalTabItem } from '../../components/common';
import {
  MeetingNoticeTab,
  MeetingParticipantsTab,
  MeetingAgendaTab,
  MeetingDocumentsTab,
  MeetingActivityTab,
} from './tabs';

export const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { currentBoard, theme } = useBoardContext();
  
  const [activeTab, setActiveTab] = useTabNavigation('notice');

  // Fetch meeting data from API
  const { data: meeting, isLoading, error } = useMeeting(meetingId || '');
  
  // Fetch meeting documents for count badge
  const { data: meetingDocuments = [] } = useMeetingDocuments(meetingId || '', {
    enabled: !!meetingId,
  });

  // Tab items
  const tabItems: HorizontalTabItem[] = useMemo(() => {
    if (!meeting) return [];

    return [
      {
        key: 'notice',
        label: 'Notice',
        icon: <FileTextOutlined />,
      },
      {
        key: 'participants',
        label: 'Participants',
        icon: <TeamOutlined />,
        badge: meeting.participants?.length || 0,
      },
      {
        key: 'agenda',
        label: 'Agenda',
        icon: <FileTextOutlined />,
      },
      {
        key: 'documents',
        label: 'Documents',
        icon: <FileTextOutlined />,
        badge: meetingDocuments.length,
      },
      {
        key: 'activity',
        label: 'Activity',
        icon: <ClockCircleOutlined />,
      },
    ];
  }, [meeting, meetingDocuments.length]);

  // Header metadata
  const metadata: MetadataItem[] = useMemo(() => {
    if (!meeting) return [];

    // Status color mapping
    const statusColors: Record<string, string> = {
      draft: 'default',
      pending_confirmation: 'warning',
      confirmed: 'blue',
      scheduled: 'cyan',
      in_progress: 'processing',
      completed: 'success',
      cancelled: 'error',
      rejected: 'error',
    };

    // Meeting type labels
    const typeLabels: Record<string, string> = {
      regular: 'Regular',
      special: 'Special',
      agm: 'Annual General',
      emergency: 'Emergency',
      committee: 'Committee',
    };

    return [
      {
        label: 'Status',
        value: meeting.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'tag',
        color: statusColors[meeting.status] || 'default',
      },
      {
        label: 'Type',
        value: typeLabels[meeting.meetingType] || meeting.meetingType,
        type: 'tag',
        color: theme.primaryColor,
      },
      {
        label: 'Participants',
        value: meeting.participants?.length || 0,
        type: 'badge',
        color: theme.primaryColor,
      },
      ...(meeting.requiresConfirmation ? [{
        label: 'Requires Confirmation',
        value: '✓',
        type: 'tag' as const,
        color: 'orange',
      }] : []),
    ];
  }, [meeting, theme]);

  // Primary action - Join Meeting (for all scheduled/confirmed meetings)
  // This opens the Meeting Room UI where participants can view agenda, documents, vote, etc.
  // For physical meetings: No video, just the meeting room interface
  // For virtual/hybrid: Includes video conferencing features
  const primaryAction: ActionButton | undefined = useMemo(() => {
    if (!meeting) return undefined;

    // Show Join Meeting for active meeting statuses
    const joinableStatuses = ['scheduled', 'confirmed', 'in_progress'];
    if (!joinableStatuses.includes(meeting.status)) {
      return undefined;
    }

    // Determine button label based on location type
    const getButtonLabel = () => {
      switch (meeting.locationType) {
        case 'virtual':
          return 'Join Virtual Meeting';
        case 'hybrid':
          return 'Join Meeting';
        case 'physical':
        default:
          return 'Enter Meeting Room';
      }
    };

    return {
      key: 'join',
      label: getButtonLabel(),
      icon: <VideoCameraOutlined />,
      type: 'primary',
      onClick: () => {
        // TODO: Navigate to Meeting Room UI
        // For now, if virtual link exists, open it
        // In future: navigate(`/${currentBoard?.id}/meetings/${meeting.id}/room`)
        if (meeting.virtualMeetingLink && meeting.locationType !== 'physical') {
          window.open(meeting.virtualMeetingLink, '_blank');
        } else {
          message.info('Meeting Room UI - Coming soon');
        }
      },
    };
  }, [meeting]);

  // Dropdown actions
  const dropdownActions: MenuProps['items'] = useMemo(() => {
    if (!meeting) return [];

    const actions: MenuProps['items'] = [
      {
        key: 'edit',
        label: 'Edit Meeting',
        icon: <EditOutlined />,
        onClick: () => {
          message.info('Edit meeting - Coming soon');
        },
      },
      {
        key: 'reschedule',
        label: 'Reschedule Meeting',
        icon: <ScheduleOutlined />,
        onClick: () => {
          message.info('Reschedule meeting - Coming soon');
        },
      },
    ];

    // Add confirmation action if needed
    if (meeting.requiresConfirmation && meeting.status === 'pending_confirmation') {
      actions.push({
        key: 'confirm',
        label: 'Confirm Meeting',
        icon: <CheckCircleOutlined />,
        onClick: () => {
          message.info('Confirm meeting - Coming soon');
        },
      });
    }

    // Add cancel action
    actions.push({
      key: 'divider1',
      type: 'divider',
    });
    actions.push({
      key: 'cancel',
      label: 'Cancel Meeting',
      icon: <StopOutlined />,
      danger: true,
      onClick: () => {
        message.info('Cancel meeting - Coming soon');
      },
    });

    return actions;
  }, [meeting]);

  // Handle back navigation
  const handleBack = () => {
    navigate(`/${currentBoard?.id}/meetings`);
  };

  // Render tab content using separate tab components
  const renderTabContent = () => {
    if (!meeting) return null;

    switch (activeTab) {
      case 'notice':
        return <MeetingNoticeTab meeting={meeting} themeColor={theme.primaryColor} />;

      case 'participants':
        return <MeetingParticipantsTab meeting={meeting} themeColor={theme.primaryColor} />;

      case 'agenda':
        return <MeetingAgendaTab meeting={meeting} themeColor={theme.primaryColor} />;

      case 'documents':
        return <MeetingDocumentsTab meeting={meeting} themeColor={theme.primaryColor} />;

      case 'activity':
        return <MeetingActivityTab meeting={meeting} themeColor={theme.primaryColor} />;

      default:
        return null;
    }
  };

  return (
    <DetailPageLayout
      backLabel="Back to Meetings"
      onBack={handleBack}
      icon={<CalendarOutlined />}
      title={meeting?.title || 'Meeting Details'}
      description={meeting?.boardName}
      metadata={metadata}
      primaryAction={primaryAction}
      dropdownActions={dropdownActions}
      tabs={tabItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
      error={error}
      emptyStateMessage="Meeting not found"
    >
      {renderTabContent()}
    </DetailPageLayout>
  );
};

export default MeetingDetailPage;
