/**
 * HorizontalTabs Component
 * Reusable horizontal tab navigation with badge support
 * Can be used in details pages, dashboards, or any section requiring tabbed navigation
 */

import React, { useMemo } from 'react';
import { Tabs, Badge } from 'antd';
import type { TabsProps } from 'antd';
import { useResponsive } from '../../../hooks';
import { useBoardContext } from '../../../contexts';

export interface HorizontalTabItem {
  key: string;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface HorizontalTabsProps {
  items: HorizontalTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  size?: 'small' | 'middle' | 'large';
  type?: 'line' | 'card';
  centered?: boolean;
  className?: string;
  style?: React.CSSProperties;
  tabBarStyle?: React.CSSProperties;
  tabBarExtraContent?: React.ReactNode;
}

// Extract inline styles to constants to prevent re-creation on every render
const LABEL_CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const BADGE_STYLE: React.CSSProperties = {
  backgroundColor: '#324721',
  marginLeft: 4,
};

export const HorizontalTabs: React.FC<HorizontalTabsProps> = ({
  items,
  activeKey,
  onChange,
  size = 'large',
  type = 'line',
  centered = false,
  className,
  style,
  tabBarStyle,
  tabBarExtraContent,
}) => {
  const { isMobile } = useResponsive();
  const { theme } = useBoardContext();

  // Transform items to Ant Design Tabs format - memoized to prevent re-creation
  const tabItems: TabsProps['items'] = useMemo(() => items.map(item => ({
    key: item.key,
    label: isMobile && item.icon ? (
      // Mobile: badge overlaid on icon (top-right), text below (Material Design style)
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 48 }}>
        <Badge
          count={item.badge}
          size="small"
          style={{ backgroundColor: theme.primaryColor, fontSize: 9, height: 14, minWidth: 14, lineHeight: '14px' }}
          overflowCount={99}
        >
          <span style={{ fontSize: 16, lineHeight: 1, display: 'block' }}>{item.icon}</span>
        </Badge>
        <span style={{ fontSize: 10, fontWeight: 500, lineHeight: 1 }}>{item.label}</span>
      </div>
    ) : (
      // Tablet/Desktop: icon + label inline + badge
      <span style={LABEL_CONTAINER_STYLE}>
        {item.icon}
        <span>{item.label}</span>
        {item.badge !== undefined && (
          <Badge 
            count={item.badge} 
            showZero={false}
            style={BADGE_STYLE}
          />
        )}
      </span>
    ),
    disabled: item.disabled,
  })), [items, isMobile, theme.primaryColor]);

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
      items={tabItems}
      size={size}
      type={type}
      centered={centered}
      className={className}
      style={style}
      tabBarStyle={tabBarStyle}
      tabBarExtraContent={tabBarExtraContent}
    />
  );
};

export default HorizontalTabs;
