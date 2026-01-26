/**
 * DetailsHeader Component
 * Reusable header for entity details pages
 * Displays icon, title, description, metadata badges, and action buttons
 */

import React from 'react';
import { Card, Space, Tag, Badge, Button, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export interface MetadataItem {
  label: string;
  value: string | number | React.ReactNode;
  type?: 'text' | 'tag' | 'badge';
  color?: string;
}

export interface ActionButton {
  key: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'primary' | 'default' | 'text' | 'link' | 'dashed';
  danger?: boolean;
  onClick?: () => void;
}

export interface DetailsHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  metadata?: MetadataItem[];
  primaryAction?: ActionButton;
  dropdownActions?: MenuProps['items'];
  extraActions?: ActionButton[];
  style?: React.CSSProperties;
}

export const DetailsHeader: React.FC<DetailsHeaderProps> = ({
  icon,
  title,
  description,
  metadata = [],
  primaryAction,
  dropdownActions,
  extraActions = [],
  style,
}) => {
  const renderMetadataItem = (item: MetadataItem) => {
    const content = item.value;

    if (item.type === 'tag') {
      return (
        <Tag color={item.color || 'default'}>
          {content}
        </Tag>
      );
    }

    if (item.type === 'badge') {
      return (
        <Badge 
          count={content} 
          showZero 
          style={{ backgroundColor: item.color || '#324721' }}
        />
      );
    }

    // Default text type
    return (
      <Space size={4}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {item.label}:
        </Text>
        <Text style={{ fontSize: 12 }}>{content}</Text>
      </Space>
    );
  };

  return (
    <Card 
      bordered={false} 
      style={{ 
        marginBottom: 24,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Left side: Icon + Title + Description + Metadata */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Space align="start" size={16}>
            {icon && (
              <div style={{ 
                fontSize: 40, 
                color: '#324721',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                backgroundColor: 'rgba(50, 71, 33, 0.05)',
                borderRadius: 8,
              }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                {title}
              </Title>
              {description && (
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  {description}
                </Text>
              )}
              {metadata.length > 0 && (
                <Space size={12} wrap>
                  {metadata.map((item, index) => (
                    <React.Fragment key={index}>
                      {renderMetadataItem(item)}
                    </React.Fragment>
                  ))}
                </Space>
              )}
            </div>
          </Space>
        </div>

        {/* Right side: Action buttons */}
        <Space size={8}>
          {extraActions.map(action => (
            <Button
              key={action.key}
              type={action.type || 'default'}
              icon={action.icon}
              danger={action.danger}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
          {primaryAction && (
            <Button
              type={primaryAction.type || 'primary'}
              icon={primaryAction.icon}
              danger={primaryAction.danger}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {dropdownActions && (
            <Dropdown menu={{ items: dropdownActions }} trigger={['click']}>
              <Button icon={<MoreOutlined />}>
                Actions
              </Button>
            </Dropdown>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default DetailsHeader;
