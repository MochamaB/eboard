/**
 * Meeting Activity Tab
 * Displays activity timeline and audit log for the meeting
 */

import React from 'react';
import { Timeline, Card, Typography, Tag, Space } from 'antd';
import {
  PlusCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  SendOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Meeting } from '../../../types/meeting.types';

const { Text } = Typography;

interface MeetingActivityTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingActivityTab: React.FC<MeetingActivityTabProps> = ({
  meeting,
  themeColor = '#1890ff',
}) => {
  // Generate activity items from meeting data
  const activityItems = [
    {
      dot: <PlusCircleOutlined style={{ color: themeColor }} />,
      children: (
        <Space direction="vertical" size={0}>
          <Text strong>Meeting Created</Text>
          <Text type="secondary">
            Created by {meeting.createdByName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(meeting.createdAt).toLocaleString()}
          </Text>
        </Space>
      ),
    },
  ];

  // Add confirmation status if applicable
  if (meeting.requiresConfirmation) {
    if (meeting.confirmedAt && meeting.confirmedByName) {
      activityItems.push({
        dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        children: (
          <Space direction="vertical" size={0}>
            <Text strong>Meeting Confirmed</Text>
            <Text type="secondary">
              Confirmed by {meeting.confirmedByName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(meeting.confirmedAt).toLocaleString()}
            </Text>
          </Space>
        ),
      });
    } else if (meeting.status === 'scheduled' && meeting.subStatus === 'pending_approval') {
      activityItems.push({
        dot: <ClockCircleOutlined style={{ color: '#faad14' }} />,
        children: (
          <Space direction="vertical" size={0}>
            <Text strong>Awaiting Approval</Text>
            <Tag color="warning">Pending</Tag>
          </Space>
        ),
      });
    }
  }

  // Add status change if different from created
  if (meeting.status === 'scheduled') {
    activityItems.push({
      dot: <SendOutlined style={{ color: themeColor }} />,
      children: (
        <Space direction="vertical" size={0}>
          <Text strong>Invitations Sent</Text>
          <Text type="secondary">
            {meeting.participants?.length || 0} participants invited
          </Text>
        </Space>
      ),
    });
  }

  // Add last update if different from creation
  if (meeting.updatedAt !== meeting.createdAt) {
    activityItems.push({
      dot: <EditOutlined style={{ color: '#8c8c8c' }} />,
      children: (
        <Space direction="vertical" size={0}>
          <Text strong>Meeting Updated</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(meeting.updatedAt).toLocaleString()}
          </Text>
        </Space>
      ),
    });
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <Card title="Activity Timeline" size="small">
        <Timeline
          items={activityItems}
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* Future: Full Audit Log */}
      <Card 
        title="Audit Log" 
        size="small" 
        style={{ marginTop: 16 }}
        extra={<Tag color="default">Coming Soon</Tag>}
      >
        <Text type="secondary">
          Detailed audit log with all changes, RSVP updates, and document access will be available in a future update.
        </Text>
      </Card>
    </div>
  );
};

export default MeetingActivityTab;
