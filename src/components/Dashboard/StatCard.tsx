import React from 'react';
import { Card, Statistic, Row, Col, Typography, Badge } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useOrgTheme } from '../../contexts';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
  precision?: number;
  loading?: boolean;
  onClick?: () => void;
  backgroundColor?: string;
  colorMode?: 'light' | 'colored';
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  suffix,
  precision = 0,
  loading = false,
  onClick,
  backgroundColor,
  colorMode = 'light',
  accentColor,
}) => {
  const { theme } = useOrgTheme();

  const trendColor = trend?.isPositive ? theme.successColor : theme.errorColor;
  const TrendIcon = trend?.isPositive ? ArrowUpOutlined : ArrowDownOutlined;
  
  const isColored = colorMode === 'colored';
  const finalAccentColor = accentColor || backgroundColor || theme.primaryColor;

  return (
    <Card
      variant="borderless"
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        background: isColored ? backgroundColor : (backgroundColor || '#fff'),
      }}
      styles={{ body: { padding: '16px' } }}
      loading={loading}
    >
      <Row gutter={[0, 4]}>
        {/* Icon and Title Row */}
        <Col span={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: isColored ? '#fff' : `${theme.primaryColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: isColored ? finalAccentColor : theme.primaryColor,
                flexShrink: 0,
                boxShadow: isColored ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {icon}
            </div>
            <Text
              type={isColored ? undefined : 'secondary'}
              style={{
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 1.2,
                color: isColored ? 'rgba(255,255,255,0.85)' : undefined,
              }}
            >
              {title}
            </Text>
          </div>
        </Col>

        {/* Value and Trend Row (inline) */}
        <Col span={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
            <Statistic
              value={value}
              suffix={suffix}
              precision={precision}
              styles={{
                content: {
                  fontSize: 24,
                  fontWeight: 600,
                  color: isColored ? '#fff' : theme.textPrimary,
                  lineHeight: 1,
                },
              }}
            />
            {trend && (
              <Badge
                count={
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: isColored ? 'rgba(255,255,255,0.95)' : `${trendColor}15`,
                    }}
                  >
                    <TrendIcon style={{ fontSize: 10, color: trendColor }} />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: trendColor,
                        lineHeight: 1,
                      }}
                    >
                      {Math.abs(trend.value)}%
                    </Text>
                  </div>
                }
                style={{ boxShadow: 'none' }}
              />
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
}
