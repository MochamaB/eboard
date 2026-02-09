/**
 * Meeting Minutes Tab
 * Main orchestrator for minutes functionality
 * Renders different views based on meeting phase and minutes status
 */

import React, { useState } from 'react';
import { Empty, Alert, Card, Space, Button, Spin, Typography, Result } from 'antd';
import {
  ClockCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useBoardContext, useMeetingPhase } from '../../../contexts';
import { useMinutesByMeeting, useCreateMinutes } from '../../../hooks/api/useMinutes';
import { useAuth } from '../../../contexts';
import { MinutesStatusBadge } from '../../../components/common/Minutes/MinutesStatusBadge';
import { MinutesDocument } from '../../../components/common/Minutes/MinutesDocument';
import { MinutesEditor } from '../../../components/common/Minutes/MinutesEditor';
import { useUpdateMinutes } from '../../../hooks/api/useMinutes';
import type { Meeting } from '../../../types/meeting.types';

const { Title, Text, Paragraph } = Typography;

interface MeetingMinutesTabProps {
  meeting: Meeting;
  themeColor: string;
}

export const MeetingMinutesTab: React.FC<MeetingMinutesTabProps> = ({
  meeting,
  themeColor,
}) => {
  const { theme, logo, currentBoard } = useBoardContext();
  const { phaseInfo } = useMeetingPhase();
  const { user } = useAuth();
  
  // State for toggling between editor and viewer
  const [isEditing, setIsEditing] = useState(false);
  
  // Only fetch minutes if meeting is completed
  const shouldFetchMinutes = meeting.status === 'completed';
  const { data: minutes, isLoading, error } = useMinutesByMeeting(
    meeting.id,
    { enabled: shouldFetchMinutes }
  );
  
  const createMinutesMutation = useCreateMinutes();
  // Always call hook, but use empty string if no minutes yet
  const updateMinutesMutation = useUpdateMinutes(
    minutes?.id || '',
    meeting.id
  );

  // Permission-based checks using user.permissions array
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };
  
  // Check specific permissions
  const canEditMeeting = hasPermission('meeting.edit');
  const canCreateMinutesPermission = hasPermission('minutes.create');
  const canEditMinutesPermission = hasPermission('minutes.create'); // Use create permission for editing
  const canApproveMinutes = hasPermission('minutes.approve');
  const canPublishMinutes = hasPermission('minutes.publish');

  // Check if meeting is archived (read-only)
  const isArchived = meeting.status === 'completed' && meeting.subStatus === 'archived';
  const isRecentlyCompleted = meeting.status === 'completed' && meeting.subStatus === 'recent';

  // Determine what to show based on permissions and meeting state
  const canCreateMinutes = canCreateMinutesPermission && phaseInfo?.phase === 'post-meeting' && !isArchived;
  const canEditMinutes = canEditMinutesPermission && isRecentlyCompleted;
  const canViewMinutes = minutes !== null && minutes !== undefined;

  // Handle create minutes
  const handleCreateMinutes = () => {
    createMinutesMutation.mutate({
      meetingId: meeting.id,
      content: '', // Will be auto-populated by backend
      allowComments: true,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16, color: theme.textSecondary }}>
          Loading minutes...
        </Paragraph>
      </div>
    );
  }

  // Error state (only show if we should be fetching minutes)
  if (error && shouldFetchMinutes) {
    return (
      <Result
        status="error"
        title="Failed to Load Minutes"
        subTitle="There was an error loading the meeting minutes. Please try again."
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      />
    );
  }

  // PRE-MEETING PHASE
  if (phaseInfo?.phase === 'pre-meeting') {
    // Check if meeting is cancelled or rejected
    if (phaseInfo.status === 'cancelled') {
      return (
        <Empty
          image={<ExclamationCircleOutlined style={{ fontSize: 64, color: theme.errorColor }} />}
          description={
            <Space direction="vertical" size={8}>
              <Title level={4} style={{ margin: 0 }}>Meeting Cancelled</Title>
              <Text type="secondary">
                This meeting has been cancelled. No minutes will be created.
              </Text>
            </Space>
          }
        />
      );
    }

    if (phaseInfo.status === 'rejected') {
      return (
        <Alert
          message="Meeting Confirmation Rejected"
          description="This meeting's confirmation was rejected. Minutes will be available once the meeting is rescheduled and completed."
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ margin: '24px 0' }}
        />
      );
    }

    // Normal pre-meeting state
    return (
      <Empty
        image={<ClockCircleOutlined style={{ fontSize: 64, color: theme.primaryColor }} />}
        description={
          <Space direction="vertical" size={8}>
            <Title level={4} style={{ margin: 0 }}>Minutes Not Yet Available</Title>
            <Text type="secondary">
              Meeting minutes will be available after the meeting is completed.
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Meeting scheduled for: {meeting.startDate} at {meeting.startTime}
            </Text>
          </Space>
        }
      />
    );
  }

  // DURING-MEETING PHASE
  if (phaseInfo?.phase === 'during-meeting') {
    return (
      <Card>
        <Alert
          message="Meeting in Progress"
          description={
            <Space direction="vertical" size={12}>
              <Paragraph style={{ margin: 0 }}>
                This meeting is currently in progress. Minutes can be created after the meeting concludes.
              </Paragraph>
              {canCreateMinutesPermission && (
                <Paragraph style={{ margin: 0, fontSize: '12px' }} type="secondary">
                  <strong>Note for Secretary:</strong> You can take live notes during the meeting and 
                  finalize them as official minutes once the meeting is completed.
                </Paragraph>
              )}
            </Space>
          }
          type="info"
          showIcon
          icon={<PlayCircleOutlined />}
        />
      </Card>
    );
  }

  // POST-MEETING PHASE - Main minutes workflow
  if (phaseInfo?.phase === 'post-meeting') {
    // Archived meeting - read-only minutes
    if (meeting.status === 'completed' && meeting.subStatus === 'archived' && minutes) {
      return (
        <MinutesDocument
          minutes={minutes}
          meeting={meeting}
          boardName={meeting.boardName}
          boardType={meeting.boardType}
          logoUrl={logo}
          primaryColor={theme.primaryColor}
          contactInfo={currentBoard?.contactInfo || null}
          showActions={true}
          showSignatures={minutes.status === 'approved' || minutes.status === 'published'}
          archivedDate={meeting.statusUpdatedAt}
          onDownloadPDF={() => {
            if (minutes.pdfUrl) {
              window.open(minutes.pdfUrl, '_blank');
            }
          }}
        />
      );
    }

    // No minutes created yet
    if (!canViewMinutes) {
      return (
        <Card>
          <Empty
            image={<FileTextOutlined style={{ fontSize: 64, color: theme.primaryColor }} />}
            description={
              <Space direction="vertical" size={16}>
                <div>
                  <Title level={4} style={{ margin: 0 }}>No Minutes Created</Title>
                  <Text type="secondary">
                    Meeting minutes have not been created yet for this meeting.
                  </Text>
                </div>
                
                {canCreateMinutes ? (
                  <Space direction="vertical" size={8}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={handleCreateMinutes}
                      loading={createMinutesMutation.isPending}
                      style={{ backgroundColor: themeColor, borderColor: themeColor }}
                    >
                      Create Minutes
                    </Button>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Minutes will be auto-populated with meeting details
                    </Text>
                  </Space>
                ) : (
                  <Alert
                    message="Waiting for Secretary"
                    description="The board secretary will create the minutes for this meeting."
                    type="info"
                    showIcon
                  />
                )}
              </Space>
            }
          />
        </Card>
      );
    }

    // Minutes exist - show appropriate view based on status and role
    return (
      
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          
          {/* Status-based content */}
          {minutes.status === 'draft' && canEditMinutesPermission && (
            <Alert
              message="Draft Mode"
              description="You can edit and refine the minutes. Submit for review when ready."
              type="info"
              showIcon
            />
          )}

          {minutes.status === 'pending_review' && canApproveMinutes && (
            <Alert
              message="Pending Review"
              description="Please review the minutes and provide feedback or approve them."
              type="warning"
              showIcon
            />
          )}

          {minutes.status === 'revision_requested' && canEditMinutesPermission && (
            <Alert
              message="Revision Requested"
              description="The chairman has requested revisions. Please review the comments and update the minutes."
              type="error"
              showIcon
            />
          )}

          {minutes.status === 'approved' && (
            <Alert
              message="Minutes Approved"
              description="These minutes have been approved and are awaiting signatures before publication."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          )}

          {minutes.status === 'published' && (
            <Alert
              message="Minutes Published"
              description="These are the official published minutes of the meeting."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          )}

          {/* Minutes Content - Editor or Viewer */}
          {(minutes.status === 'draft' || minutes.status === 'revision_requested') && isEditing && canEditMinutes ? (
            <MinutesEditor
              minutes={minutes}
              meeting={meeting}
              onSave={async (content: string) => {
                if (minutes?.id) {
                  await updateMinutesMutation.mutateAsync({
                    content,
                  });
                }
              }}
              onSubmit={() => {
                // TODO: Implement submit for review
                console.log('Submit for review');
              }}
              primaryColor={theme.primaryColor}
              autoSave={true}
              autoSaveInterval={30000}
            />
          ) : (
            <>
              {/* Edit/View Toggle Button for Secretary */}
              {canEditMinutes && (minutes.status === 'draft' || minutes.status === 'revision_requested') && (
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="primary"
                    icon={isEditing ? <EyeOutlined /> : <EditOutlined />}
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ backgroundColor: theme.primaryColor, borderColor: theme.primaryColor }}
                  >
                    {isEditing ? 'View Minutes' : 'Edit Minutes'}
                  </Button>
                </div>
              )}
              
              <MinutesDocument
                minutes={minutes}
                meeting={meeting}
                boardName={meeting.boardName}
                boardType={meeting.boardType}
                logoUrl={logo}
                primaryColor={theme.primaryColor}
                contactInfo={currentBoard?.contactInfo || null}
                showActions={true}
                showSignatures={minutes.status === 'approved' || minutes.status === 'published'}
                onDownloadPDF={() => {
                  if (minutes.pdfUrl) {
                    window.open(minutes.pdfUrl, '_blank');
                  }
                }}
              />
            </>
          )}
        </Space>
      
    );
  }

  // Fallback
  return (
    <Empty description="Unable to determine meeting phase" />
  );
};

export default MeetingMinutesTab;
