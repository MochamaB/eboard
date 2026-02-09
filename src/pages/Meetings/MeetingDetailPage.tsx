/**
 * Meeting Detail Page
 * View full meeting details with tabbed sections
 * Actions: Edit, Cancel, Reschedule, Confirm, Join Meeting
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Alert, Space } from 'antd';
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
  TrophyOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { useBoardContext, useMeetingPhase } from '../../contexts';
import { useMeeting } from '../../hooks/api';
import { useMeetingPermissions } from '../../hooks/meetings';
import { useMeetingDocuments } from '../../hooks/api/useDocuments';
import { useMeetingVotes } from '../../hooks/api/useVoting';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { DetailPageLayout } from '../../components/common';
import type { MetadataItem, ActionButton } from '../../components/common';
import type { HorizontalTabItem } from '../../components/common';
import { MeetingStatusBadge } from '../../components/Meetings/MeetingStatusBadge';
import { validateMeeting, getMergedRequirements } from '../../utils/meetingValidation';
import type { ValidationContext } from '../../types/meetingRequirements.types';
import type { MeetingSubStatus } from '../../types/meeting.types';
import {
  MeetingNoticeTab,
  MeetingParticipantsTab,
  MeetingAgendaTab,
  MeetingDocumentsTab,
  MeetingVotesTab,
  MeetingActivityTab,
  MeetingMinutesTab,
} from './tabs';

export const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { currentBoard, theme } = useBoardContext();
  const meetingPhase = useMeetingPhase();
  
  const [activeTab, setActiveTab] = useTabNavigation('notice');
  
  // Get meeting permissions
  const permissions = useMeetingPermissions();

  // Fetch meeting data from API
  const { data: meeting, isLoading, error } = useMeeting(meetingId || '');
  
  // Fetch meeting documents for count badge
  const { data: meetingDocuments = [] } = useMeetingDocuments(meetingId || '', {
    enabled: !!meetingId,
  });

  // Fetch meeting votes for count badge
  const { data: meetingVotes = [] } = useMeetingVotes(meetingId || '', {
    enabled: !!meetingId,
  });

  // Set meeting in phase context when data loads
  React.useEffect(() => {
    if (meeting) {
      meetingPhase.setMeeting(meeting);
    }
    return () => {
      meetingPhase.clearMeeting();
    };
  }, [meeting, meetingPhase]);

  // Validate meeting if draft.incomplete
  const validationResult = useMemo(() => {
    if (!meeting || meeting.status !== 'draft' || meeting.subStatus !== 'incomplete') {
      return null;
    }
    
    // Get merged requirements for validation
    const requirements = getMergedRequirements(
      currentBoard?.id || '',
      meeting.meetingType
    );
    
    // Build validation context
    const context: ValidationContext = {
      meeting: {
        id: meeting.id,
        boardId: meeting.boardId,
        meetingType: meeting.meetingType,
        status: meeting.status,
        subStatus: (meeting.subStatus || 'incomplete') as MeetingSubStatus,
        participantCount: meeting.participants?.length || 0,
        expectedAttendees: meeting.expectedAttendees || 0,
        quorumPercentage: meeting.quorumPercentage || 0,
        quorumRequired: meeting.quorumRequired || 0,
        agendaItemCount: 0, // TODO: Get from agenda API
        documentCount: 0, // TODO: Get from documents API
        hasChairman: meeting.participants?.some(p => p.boardRole?.toLowerCase().includes('chairman')) || false,
        hasSecretary: meeting.participants?.some(p => p.boardRole?.toLowerCase().includes('secretary')) || false,
      },
      requirements,
    };
    
    return validateMeeting(context);
  }, [meeting, currentBoard?.id]);

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
        key: 'votes',
        label: 'Votes',
        icon: <TrophyOutlined />,
        badge: meetingVotes.length,
      },
      {
        key: 'minutes',
        label: 'Minutes',
        icon: <FileTextOutlined />,
      },
      {
        key: 'activity',
        label: 'Activity',
        icon: <ClockCircleOutlined />,
      },
    ];
  }, [meeting, meetingDocuments.length, meetingVotes.length]);

  // Header metadata
  const metadata: MetadataItem[] = useMemo(() => {
    if (!meeting) return [];

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
        value: meeting.status,
        type: 'custom',
        render: () => (
          <MeetingStatusBadge 
            status={meeting.status} 
            subStatus={meeting.subStatus}
          />
        ),
      },
      {
        label: 'Type',
        value: typeLabels[meeting.meetingType] || meeting.meetingType,
        type: 'tag',
        color: theme.primaryColor,
      },
    ];
  }, [meeting, theme]);

  // Primary action - Context-aware based on status + subStatus
  const primaryAction: ActionButton | undefined = useMemo(() => {
    if (!meeting) return undefined;

    // Draft.incomplete - Show validation errors
    if (meeting.status === 'draft' && meeting.subStatus === 'incomplete') {
      return {
        key: 'complete-setup',
        label: 'Complete Setup',
        icon: <InfoCircleOutlined />,
        type: 'default',
        onClick: () => {
          message.info('Please complete all required fields to proceed');
        },
      };
    }

    // Draft.complete - Submit for approval
    if (meeting.status === 'draft' && meeting.subStatus === 'complete') {
      return {
        key: 'submit',
        label: 'Submit for Approval',
        icon: <CheckCircleOutlined />,
        type: 'primary',
        onClick: () => {
          message.info('Submit for approval - Coming soon');
        },
      };
    }

    // Scheduled.pending_approval - Approve meeting
    if (meeting.status === 'scheduled' && meeting.subStatus === 'pending_approval') {
      return {
        key: 'approve',
        label: 'Approve Meeting',
        icon: <CheckCircleOutlined />,
        type: 'primary',
        onClick: () => {
          message.info('Approve meeting - Coming soon');
        },
      };
    }

    // Scheduled.approved - Host can start meeting
    if (meeting.status === 'scheduled' && meeting.subStatus === 'approved') {
      if (permissions.canStartMeeting) {
        return {
          key: 'start',
          label: 'Start Meeting',
          icon: <PlayCircleOutlined />,
          type: 'primary',
          onClick: () => {
            navigate(`/${currentBoard?.id}/meetings/${meeting.id}/room`);
          },
        };
      } else {
        // Non-host sees disabled button
        return {
          key: 'waiting',
          label: 'Waiting for Host',
          icon: <ClockCircleOutlined />,
          type: 'default',
          disabled: true,
        };
      }
    }
    
    // In progress - Anyone can join
    if (meeting.status === 'in_progress') {
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
          navigate(`/${currentBoard?.id}/meetings/${meeting.id}/room`);
        },
      };
    }

    // Completed.recent - Archive meeting
    if (meeting.status === 'completed' && meeting.subStatus === 'recent') {
      return {
        key: 'archive',
        label: 'Archive Meeting',
        icon: <CheckCircleOutlined />,
        type: 'default',
        onClick: () => {
          message.info('Archive meeting - Coming soon');
        },
      };
    }

    return undefined;
  }, [meeting, currentBoard?.id]);

  // Dropdown actions - Context-aware based on status
  const dropdownActions: MenuProps['items'] = useMemo(() => {
    if (!meeting) return [];

    const actions: MenuProps['items'] = [];

    // Edit - Available for draft and scheduled meetings
    if (meeting.status === 'draft' || meeting.status === 'scheduled') {
      actions.push({
        key: 'edit',
        label: 'Edit Meeting',
        icon: <EditOutlined />,
        onClick: () => {
          message.info('Edit meeting - Coming soon');
        },
      });
    }

    // Reschedule - Available for scheduled meetings
    if (meeting.status === 'scheduled') {
      actions.push({
        key: 'reschedule',
        label: 'Reschedule Meeting',
        icon: <ScheduleOutlined />,
        onClick: () => {
          message.info('Reschedule meeting - Coming soon');
        },
      });
    }

    // Reject - Available for pending approval
    if (meeting.status === 'scheduled' && meeting.subStatus === 'pending_approval') {
      actions.push({
        key: 'reject',
        label: 'Reject Meeting',
        icon: <StopOutlined />,
        danger: true,
        onClick: () => {
          message.info('Reject meeting - Coming soon');
        },
      });
    }

    // Start Meeting - Available for approved meetings (host only)
    if (meeting.status === 'scheduled' && meeting.subStatus === 'approved' && permissions.canStartMeeting) {
      actions.push({
        key: 'start',
        label: 'Start Meeting',
        icon: <PlayCircleOutlined />,
        onClick: () => {
          navigate(`/${currentBoard?.id}/meetings/${meeting.id}/room`);
        },
      });
    }

    // Cancel - Available for draft and scheduled meetings
    if (meeting.status === 'draft' || meeting.status === 'scheduled') {
      if (actions.length > 0) {
        actions.push({
          key: 'divider1',
          type: 'divider',
        });
      }
      actions.push({
        key: 'cancel',
        label: 'Cancel Meeting',
        icon: <StopOutlined />,
        danger: true,
        onClick: () => {
          message.info('Cancel meeting - Coming soon');
        },
      });
    }

    return actions;
  }, [meeting]);

  // Handle back navigation
  const handleBack = () => {
    navigate(`/${currentBoard?.id}/meetings`);
  };

  // Render validation errors for draft.incomplete
  const renderValidationErrors = () => {
    if (!validationResult || validationResult.isValid) return null;

    return (
      <Alert
        type="warning"
        message="Meeting Configuration Incomplete"
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {validationResult.errors.map((error, index) => (
              <div key={index}>• {error.message}</div>
            ))}
          </Space>
        }
        style={{ marginBottom: 16 }}
        showIcon
      />
    );
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
      case 'votes':
        return <MeetingVotesTab meeting={meeting} themeColor={theme.primaryColor} />;
      case 'minutes':
        return <MeetingMinutesTab meeting={meeting} themeColor={theme.primaryColor} />;
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
      headerAlert={renderValidationErrors()}
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
