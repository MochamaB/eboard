import React from 'react';
import { List, Tag, Button, Space, Typography, Spin } from 'antd';
import { VideoCameraOutlined, EnvironmentOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UpcomingMeeting } from '../../services/widgetDataService';
import { useOrgTheme } from '../../contexts';

const { Text } = Typography;

interface UpcomingMeetingsProps {
  meetings: UpcomingMeeting[];
  loading?: boolean;
}

export const UpcomingMeetings: React.FC<UpcomingMeetingsProps> = ({
  meetings,
  loading = false,
}) => {
  const { theme } = useOrgTheme();

  const getStatusColor = (status: UpcomingMeeting['status']) => {
    switch (status) {
      case 'today':
        return theme.errorColor;
      case 'tomorrow':
        return theme.primaryColor;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: UpcomingMeeting['status'], date: Date) => {
    switch (status) {
      case 'today':
        return 'TODAY';
      case 'tomorrow':
        return 'TOMORROW';
      default:
        return dayjs(date).format('MMM DD');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">No upcoming meetings</Text>
      </div>
    );
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={meetings}
      renderItem={(meeting) => (
        <List.Item
          actions={
            meeting.status === 'today' && meeting.type === 'virtual'
              ? [
                  <Button
                    type="primary"
                    size="small"
                    icon={<VideoCameraOutlined />}
                    key="join"
                    style={{
                      background: theme.primaryColor,
                      borderColor: theme.primaryColor,
                    }}
                  >
                    Join
                  </Button>
                ]
              : undefined
          }
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <List.Item.Meta
            avatar={
              <div style={{ minWidth: 60, textAlign: 'center' }}>
                <Tag
                  color={getStatusColor(meeting.status)}
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 8px',
                  }}
                >
                  {getStatusLabel(meeting.status, meeting.date)}
                </Tag>
              </div>
            }
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong style={{ fontSize: 13 }}>{meeting.title}</Text>
                {!meeting.hasAgenda && (
                  <Tag color="warning" style={{ fontSize: 10, margin: 0 }}>No Agenda</Tag>
                )}
              </div>
            }
            description={
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {meeting.committee}
                </Text>
                <Space size="small" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined style={{ color: theme.textSecondary }} />
                  <Text type="secondary">{meeting.time}</Text>
                  
                  {meeting.type === 'virtual' ? (
                    <>
                      <VideoCameraOutlined style={{ color: theme.primaryColor }} />
                      <Text type="secondary">Virtual</Text>
                    </>
                  ) : (
                    <>
                      <EnvironmentOutlined style={{ color: theme.textSecondary }} />
                      <Text type="secondary">{meeting.location}</Text>
                    </>
                  )}
                  
                  <TeamOutlined style={{ color: theme.textSecondary }} />
                  <Text type="secondary">{meeting.participants}</Text>
                </Space>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};
