/**
 * MinutesMetadata Component
 * Display meeting metadata (date, time, location, prepared by)
 */

import React from 'react';
import { Space, Typography, Row, Col } from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Meeting } from '../../../../types/meeting.types';

const { Text } = Typography;

interface MinutesMetadataProps {
  meeting: Meeting;
  preparedBy: string;
  preparedAt: string;
  primaryColor?: string;
}

export const MinutesMetadata: React.FC<MinutesMetadataProps> = ({
  meeting,
  preparedBy,
  preparedAt,
  primaryColor = '#324721',
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Row gutter={[24, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Space>
          <ClockCircleOutlined style={{ color: primaryColor }} />
          <div>
            <Text strong style={{ display: 'block', fontSize: '12px' }}>Date & Time</Text>
            <Text style={{ fontSize: '14px' }}>{formatDate(meeting.startDate)}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {formatTime(meeting.startDate)} - {formatTime(meeting.endDateTime)}
            </Text>
          </div>
        </Space>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Space>
          <EnvironmentOutlined style={{ color: primaryColor }} />
          <div>
            <Text strong style={{ display: 'block', fontSize: '12px' }}>Location</Text>
            <Text style={{ fontSize: '14px' }}>
              {meeting.locationType === 'physical' && meeting.physicalAddress ? meeting.physicalAddress :
               meeting.locationType === 'virtual' && meeting.virtualMeetingLink ? 'Virtual Meeting' :
               meeting.locationDetails || 'Not specified'}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {meeting.locationType === 'virtual' ? 'Virtual Meeting' : 
               meeting.locationType === 'hybrid' ? 'Hybrid Meeting' : 'Physical Meeting'}
            </Text>
          </div>
        </Space>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Space>
          <UserOutlined style={{ color: primaryColor }} />
          <div>
            <Text strong style={{ display: 'block', fontSize: '12px' }}>Prepared By</Text>
            <Text style={{ fontSize: '14px' }}>{preparedBy}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {formatDate(preparedAt)}
            </Text>
          </div>
        </Space>
      </Col>
    </Row>
  );
};

export default MinutesMetadata;
