import React from 'react';
import { List, Avatar, Typography, Space, Spin } from 'antd';
import { 
  CalendarOutlined, 
  FileTextOutlined, 
  CheckSquareOutlined, 
  TrophyOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ActivityItem } from '../../services/widgetDataService';
import { useOrgTheme } from '../../contexts';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  loading = false,
}) => {
  const { theme } = useOrgTheme();

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconProps = { style: { fontSize: 14 } };
    switch (type) {
      case 'meeting':
        return <CalendarOutlined {...iconProps} />;
      case 'document':
        return <FileTextOutlined {...iconProps} />;
      case 'action':
        return <CheckSquareOutlined {...iconProps} />;
      case 'decision':
        return <TrophyOutlined {...iconProps} />;
      case 'member':
        return <TeamOutlined {...iconProps} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'meeting':
        return theme.primaryColor;
      case 'document':
        return theme.infoColor;
      case 'action':
        return theme.warningColor;
      case 'decision':
        return theme.successColor;
      case 'member':
        return theme.secondaryColor;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">No recent activity</Text>
      </div>
    );
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={activities}
      renderItem={(activity) => {
        const color = getActivityColor(activity.type);
        return (
          <List.Item
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <List.Item.Meta
              avatar={
                <div style={{ position: 'relative' }}>
                  <Avatar
                    size={36}
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      border: `2px solid ${color}30`,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {activity.user.avatar}
                  </Avatar>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      border: `1px solid #f0f0f0`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.cloneElement(getActivityIcon(activity.type), {
                      style: { fontSize: 10, color },
                    })}
                  </div>
                </div>
              }
              title={
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {activity.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {activity.description}
                  </Text>
                </Space>
              }
              description={
                <Space size={4} style={{ fontSize: 11 }}>
                  <Text type="secondary">{activity.user.name}</Text>
                  <Text type="secondary">•</Text>
                  <Text type="secondary">{dayjs(activity.timestamp).fromNow()}</Text>
                </Space>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};
