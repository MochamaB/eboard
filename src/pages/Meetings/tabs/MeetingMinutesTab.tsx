/**
 * Meeting Minutes Tab
 * Main orchestrator for minutes functionality
 * Renders different views based on meeting phase and minutes status
 */

import React, { useMemo } from 'react';
import { Empty, Alert, Card, Space, Button, Spin, Typography, Result } from 'antd';
import {
  ClockCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useBoardContext, useMeetingPhase } from '../../../contexts';
import { useMinutesByMeeting, useCreateMinutes } from '../../../hooks/api/useMinutes';
import { useAuth } from '../../../contexts';
import { MinutesStatusBadge } from '../../../components/common/Minutes/MinutesStatusBadge';
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
  const { theme } = useBoardContext();
  const { phaseInfo } = useMeetingPhase();
  const { user, hasRole } = useAuth();
  const { data: minutes, isLoading, error } = useMinutesByMeeting(meeting.id);
  const createMinutesMutation = useCreateMinutes();

  // Permission checks using hasRole helper
  const isSecretary = hasRole('board_secretary') || hasRole('secretary');
  const isChairman = hasRole('chairman');
  const isBoardMember = hasRole('chairman') || hasRole('director') || hasRole('member');

  // Determine what to show
  const canCreateMinutes = isSecretary && phaseInfo?.phase === 'post-meeting';
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

  // Error state
  if (error) {
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
              {isSecretary && (
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
      <Card>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Minutes Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>Meeting Minutes</Title>
              <MinutesStatusBadge status={minutes.status} />
            </Space>
            
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Created: {new Date(minutes.createdAt).toLocaleDateString()}
              </Text>
            </Space>
          </div>

          {/* Status-based content */}
          {minutes.status === 'draft' && isSecretary && (
            <Alert
              message="Draft Mode"
              description="You can edit and refine the minutes. Submit for review when ready."
              type="info"
              showIcon
            />
          )}

          {minutes.status === 'pending_review' && (isChairman || isBoardMember) && (
            <Alert
              message="Pending Review"
              description="Please review the minutes and provide feedback or approve them."
              type="warning"
              showIcon
            />
          )}

          {minutes.status === 'revision_requested' && isSecretary && (
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

          {/* Placeholder for actual editor/viewer components */}
          <Card type="inner" style={{ backgroundColor: theme.backgroundSecondary }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Text strong>Minutes Content</Text>
              <Paragraph type="secondary">
                {minutes.status === 'draft' && isSecretary
                  ? 'MinutesEditor component will be rendered here (Phase 9 Step 4)'
                  : 'MinutesViewer component will be rendered here (Phase 9 Step 3)'}
              </Paragraph>
              
              <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Minutes ID: {minutes.id}<br />
                  Status: {minutes.status}<br />
                  Word Count: {minutes.wordCount || 0}<br />
                  Last Updated: {new Date(minutes.updatedAt).toLocaleString()}
                </Text>
              </div>
            </Space>
          </Card>
        </Space>
      </Card>
    );
  }

  // Fallback
  return (
    <Empty description="Unable to determine meeting phase" />
  );
};

export default MeetingMinutesTab;
