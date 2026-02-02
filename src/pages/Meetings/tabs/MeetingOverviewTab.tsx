/**
 * Meeting Overview Tab
 * Displays meeting details, schedule, location, and quorum information
 */

import React from 'react';
import { Row, Col, Card, Descriptions, Tag, Typography, Space } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { Meeting } from '../../../types/meeting.types';

const { Text, Paragraph } = Typography;

interface MeetingOverviewTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingOverviewTab: React.FC<MeetingOverviewTabProps> = ({
  meeting,
  themeColor = '#1890ff',
}) => {
  // Format date
  const formattedDate = new Date(meeting.startDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Format time range
  const formatTimeRange = () => {
    const [hours, minutes] = meeting.startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + meeting.duration);
    
    const formatTime = (date: Date) => 
      date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  // Location type labels
  const locationTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    virtual: { label: 'Virtual Meeting', icon: <VideoCameraOutlined /> },
    physical: { label: 'In-Person', icon: <EnvironmentOutlined /> },
    hybrid: { label: 'Hybrid', icon: <TeamOutlined /> },
  };

  const locationType = locationTypeLabels[meeting.locationType] || locationTypeLabels.physical;

  return (
    <div style={{ padding: '8px 0' }}>
      <Row gutter={[24, 24]}>
        {/* Schedule & Location Card */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CalendarOutlined style={{ color: themeColor }} />
                <span>Schedule & Location</span>
              </Space>
            }
            size="small"
          >
            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 500 }}>
              <Descriptions.Item label="Date">
                {formattedDate}
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                {formatTimeRange()} ({meeting.duration} minutes)
              </Descriptions.Item>
              <Descriptions.Item label="Timezone">
                {meeting.timezone}
              </Descriptions.Item>
              <Descriptions.Item label="Location Type">
                <Tag icon={locationType.icon} color={themeColor}>
                  {locationType.label}
                </Tag>
              </Descriptions.Item>
              {meeting.physicalAddress && (
                <Descriptions.Item label="Address">
                  {meeting.physicalAddress}
                </Descriptions.Item>
              )}
              {meeting.virtualMeetingLink && (
                <Descriptions.Item label="Meeting Link">
                  <a href={meeting.virtualMeetingLink} target="_blank" rel="noopener noreferrer">
                    Join Virtual Meeting
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Quorum & Attendance Card */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TeamOutlined style={{ color: themeColor }} />
                <span>Quorum & Attendance</span>
              </Space>
            }
            size="small"
          >
            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 500 }}>
              <Descriptions.Item label="Quorum Required">
                {meeting.quorumPercentage}% ({meeting.quorumRequired} members)
              </Descriptions.Item>
              <Descriptions.Item label="Expected Attendees">
                {meeting.expectedAttendees} participants
              </Descriptions.Item>
              <Descriptions.Item label="Total Invited">
                {meeting.participants?.length || 0} participants
              </Descriptions.Item>
              <Descriptions.Item label="Confirmation Required">
                {meeting.requiresConfirmation ? (
                  <Tag icon={<CheckCircleOutlined />} color="orange">Yes</Tag>
                ) : (
                  <Tag color="default">No</Tag>
                )}
              </Descriptions.Item>
              {meeting.confirmedByName && (
                <Descriptions.Item label="Confirmed By">
                  {meeting.confirmedByName}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Description Card */}
        {meeting.description && (
          <Col xs={24}>
            <Card 
              title="Description"
              size="small"
            >
              <Paragraph style={{ marginBottom: 0 }}>
                {meeting.description}
              </Paragraph>
            </Card>
          </Col>
        )}

        {/* Meeting Info Card */}
        <Col xs={24}>
          <Card 
            title="Meeting Information"
            size="small"
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" labelStyle={{ fontWeight: 500 }}>
              <Descriptions.Item label="Meeting ID">
                <Text code>{meeting.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Board">
                {meeting.boardName}
              </Descriptions.Item>
              <Descriptions.Item label="Meeting Type">
                <Tag color={themeColor}>
                  {meeting.meetingType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {meeting.createdByName}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(meeting.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(meeting.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MeetingOverviewTab;
