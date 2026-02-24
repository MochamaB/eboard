/**
 * DetailsHeader Component
 * Reusable header for entity details pages
 * Displays icon, title, description, metadata badges, and action buttons
 */

import React from 'react';
import { Card, Space, Tag, Badge, Button, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

import { useResponsive } from '../../../hooks';
import { responsiveHelpers } from '../../../utils';

const { Text, Title } = Typography;

export interface MetadataItem {
  label: string;
  value: string | number | React.ReactNode;
  type?: 'text' | 'tag' | 'badge' | 'custom';
  color?: string;
  render?: () => React.ReactNode;
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
  alert?: React.ReactNode;
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
  alert,
  style,
}) => {
  const { isMobile, currentBreakpoint } = useResponsive();

  const iconSize = responsiveHelpers.getResponsiveSpacing(
    {
      xs: 48,
      md: 58,
      lg: 66,
    },
    currentBreakpoint,
  );

  const iconMarginRight = responsiveHelpers.getResponsiveSpacing(
    {
      xs: 12,
      md: 14,
      lg: 16,
    },
    currentBreakpoint,
  );

  const titleLevel = isMobile ? 5 : 4;
  const titleMarginBottom = isMobile ? 2 : 4;
  const descriptionMarginBottom = isMobile ? 8 : 12;
  const metadataGap = isMobile ? 8 : 12;
  const actionsGap = isMobile ? 6 : 8;

  const headerFlexDirection = isMobile ? 'column' : 'row';
  const headerAlignItems = isMobile ? 'flex-start' : 'flex-start';
  const headerJustifyContent = isMobile ? 'flex-start' : 'space-between';
  const headerGap = isMobile ? 12 : 0;

  const leftContentFlex = isMobile ? '1 1 auto' : '1 1 auto';
  const rightContentFlex = isMobile ? '1 1 auto' : '0 0 auto';
  const rightContentMarginTop = isMobile ? 12 : 0;
  const rightContentAlignSelf = isMobile ? 'flex-start' : 'auto';

  const cardPadding = responsiveHelpers.getResponsiveSpacing(
    {
      xs: 16,
      md: 20,
      lg: 24,
    },
    currentBreakpoint,
  );

  const mergedCardStyle: React.CSSProperties = {
    marginBottom: alert ? 16 : 24,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    padding: cardPadding,
    ...style,
  };
  const renderMetadataItem = (item: MetadataItem) => {
    const content = item.value;

    if (item.type === 'custom' && item.render) {
      return item.render();
    }

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
    <>
      <Card 
        bordered={false} 
        style={mergedCardStyle}
      >
      <div style={{ 
        display: 'flex', 
        flexDirection: headerFlexDirection,
        justifyContent: headerJustifyContent,
        alignItems: headerAlignItems,
        gap: headerGap,
      }}>
        {/* Left side: Icon + Title + Description + Metadata */}
        <div style={{ flex: leftContentFlex, minWidth: 0 }}>
          <Space align="start" size={iconMarginRight}>
            {icon && (
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: iconSize,
                height: iconSize,
                backgroundColor: 'rgba(50, 71, 33, 0.05)',
                borderRadius: 8,
                overflow: 'hidden',
              }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title level={titleLevel} style={{ margin: 0, marginBottom: titleMarginBottom }}>
                {title}
              </Title>
              {description && (
                <Text type="secondary" style={{ display: 'block', marginBottom: descriptionMarginBottom }}>
                  {description}
                </Text>
              )}
              {metadata.length > 0 && (
                <Space size={metadataGap} wrap>
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
        <Space 
          size={actionsGap}
          direction={isMobile ? 'vertical' : 'horizontal'}
          style={{ 
            marginTop: rightContentMarginTop,
            alignSelf: rightContentAlignSelf,
            flex: rightContentFlex,
          }}
        >
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
              <Button 
                icon={<MoreOutlined />}
                size={isMobile ? 'middle' : 'middle'}
              >
                Actions
              </Button>
            </Dropdown>
          )}
        </Space>
      </div>
      </Card>
      {alert && (
        <div style={{ marginBottom: 24 }}>
          {alert}
        </div>
      )}
    </>
  );
};

export default DetailsHeader;
