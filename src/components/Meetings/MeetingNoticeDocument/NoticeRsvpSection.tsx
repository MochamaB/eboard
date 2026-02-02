/**
 * NoticeRsvpSection Component
 * RSVP response buttons for member view
 */

import React from 'react';
import { Typography, Button, Space, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

type RsvpResponse = 'attending' | 'not_attending' | 'tentative';

interface NoticeRsvpSectionProps {
  onRsvp?: (response: RsvpResponse) => void;
  currentResponse?: RsvpResponse;
  deadline?: string;
  disabled?: boolean;
  compact?: boolean;
}

export const NoticeRsvpSection: React.FC<NoticeRsvpSectionProps> = ({
  onRsvp,
  currentResponse,
  deadline,
  disabled = false,
  compact = false,
}) => {
  const getResponseLabel = (response: RsvpResponse) => {
    switch (response) {
      case 'attending':
        return 'Attending';
      case 'not_attending':
        return 'Not Attending';
      case 'tentative':
        return 'Tentative';
    }
  };

  const getResponseColor = (response: RsvpResponse) => {
    switch (response) {
      case 'attending':
        return 'success';
      case 'not_attending':
        return 'error';
      case 'tentative':
        return 'warning';
    }
  };

  return (
    <div
      className="notice-rsvp-section"
      style={{
        marginTop: 24,
        padding: compact ? 16 : 24,
        background: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: 8,
      }}
    >
      <Text strong style={{ display: 'block', marginBottom: 12, fontSize: compact ? 14 : 16 }}>
        Please confirm your attendance
      </Text>

      {deadline && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: compact ? 12 : 13 }}>
          RSVP by: {dayjs(deadline).format('dddd, DD MMMM YYYY')}
        </Text>
      )}

      {currentResponse && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: compact ? 12 : 13 }}>
            Your current response:{' '}
          </Text>
          <Tag color={getResponseColor(currentResponse)}>
            {getResponseLabel(currentResponse)}
          </Tag>
        </div>
      )}

      <Space wrap size={compact ? 8 : 12}>
        <Button
          type={currentResponse === 'attending' ? 'primary' : 'default'}
          icon={<CheckCircleOutlined />}
          onClick={() => onRsvp?.('attending')}
          disabled={disabled}
          style={{
            backgroundColor: currentResponse === 'attending' ? '#52c41a' : undefined,
            borderColor: currentResponse === 'attending' ? '#52c41a' : undefined,
          }}
        >
          Attending
        </Button>
        <Button
          type={currentResponse === 'tentative' ? 'primary' : 'default'}
          icon={<QuestionCircleOutlined />}
          onClick={() => onRsvp?.('tentative')}
          disabled={disabled}
          style={{
            backgroundColor: currentResponse === 'tentative' ? '#faad14' : undefined,
            borderColor: currentResponse === 'tentative' ? '#faad14' : undefined,
          }}
        >
          Tentative
        </Button>
        <Button
          type={currentResponse === 'not_attending' ? 'primary' : 'default'}
          icon={<CloseCircleOutlined />}
          onClick={() => onRsvp?.('not_attending')}
          disabled={disabled}
          danger={currentResponse === 'not_attending'}
        >
          Not Attending
        </Button>
      </Space>
    </div>
  );
};

export default NoticeRsvpSection;
