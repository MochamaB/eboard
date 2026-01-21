import React from 'react';
import { Space, Typography, Badge, Spin } from 'antd';
import { 
  CalendarOutlined, 
  CheckSquareOutlined, 
  FileTextOutlined, 
  TrophyOutlined 
} from '@ant-design/icons';
import type { QuickStat } from '../../services/widgetDataService';
import { useOrgTheme } from '../../contexts';

const { Text } = Typography;

interface QuickStatsProps {
  stats: QuickStat[];
  loading?: boolean;
  onStatClick?: (stat: QuickStat) => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  stats,
  loading = false,
  onStatClick,
}) => {
  const { theme } = useOrgTheme();

  const getStatIcon = (id: string) => {
    const iconProps = { style: { fontSize: 20 } };
    switch (id) {
      case 'meetings-week':
        return <CalendarOutlined {...iconProps} />;
      case 'action-items':
        return <CheckSquareOutlined {...iconProps} />;
      case 'documents':
        return <FileTextOutlined {...iconProps} />;
      case 'votes':
        return <TrophyOutlined {...iconProps} />;
      default:
        return <CalendarOutlined {...iconProps} />;
    }
  };

  const getStatColor = (id: string) => {
    switch (id) {
      case 'meetings-week':
        return theme.primaryColor;
      case 'action-items':
        return theme.warningColor;
      case 'documents':
        return theme.infoColor;
      case 'votes':
        return theme.successColor;
      default:
        return theme.primaryColor;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {stats.map((stat) => {
        const color = getStatColor(stat.id);
        return (
          <div
            key={stat.id}
            onClick={() => onStatClick?.(stat)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: onStatClick ? 'pointer' : 'default',
              padding: '8px',
              borderRadius: 8,
              transition: 'all 0.2s',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (onStatClick) {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              if (onStatClick) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                flexShrink: 0,
              }}
            >
              {getStatIcon(stat.id)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong style={{ fontSize: 20, lineHeight: 1 }}>
                  {stat.count}
                </Text>
                {stat.urgent && stat.urgent > 0 && (
                  <Badge
                    count={stat.urgent}
                    style={{
                      backgroundColor: theme.errorColor,
                      fontSize: 10,
                      height: 18,
                      minWidth: 18,
                      lineHeight: '18px',
                    }}
                  />
                )}
              </div>
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                {stat.label}
              </Text>
            </div>
          </div>
        );
      })}
    </Space>
  );
};
