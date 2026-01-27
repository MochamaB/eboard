/**
 * IndexPageLayout Component
 * Centralized layout for index/list pages with consistent header, tabs, and structure
 * Use this for all module index pages (Meetings, Users, Documents, etc.)
 */

import React, { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Button, Tabs, Badge, Flex } from 'antd';
import type { TabsProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';

const { Text } = Typography;

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface IndexPageLayoutProps {
  /** Module name (e.g., "Meetings", "Users", "Documents") */
  title: string;
  /** Subtitle when viewing a specific board */
  subtitle?: string;
  /** Subtitle when viewing all boards */
  subtitleAll?: string;
  /** Tab items for filtering */
  tabs?: TabItem[];
  /** Currently active tab key */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (key: string) => void;
  /** Primary action button label */
  primaryActionLabel?: string;
  /** Primary action button icon (defaults to PlusOutlined) */
  primaryActionIcon?: ReactNode;
  /** Callback for primary action button */
  onPrimaryAction?: () => void;
  /** Hide primary action button */
  hidePrimaryAction?: boolean;
  /** Children - typically filters and content */
  children: ReactNode;
}

export const IndexPageLayout: React.FC<IndexPageLayoutProps> = ({
  title,
  subtitle,
  subtitleAll,
  tabs,
  activeTab,
  onTabChange,
  primaryActionLabel,
  primaryActionIcon = <PlusOutlined />,
  onPrimaryAction,
  hidePrimaryAction = false,
  children,
}) => {
  const location = useLocation();
  const { currentBoard, theme } = useBoardContext();

  // Check if we're in "View All" mode (route is /all/*)
  const isAllBoardsView = location.pathname.startsWith('/all/');

  // Generate page title with "All" prefix when in View All mode
  const pageTitle = isAllBoardsView ? `All ${title}` : title;

  // Generate subtitle
  const pageSubtitle = isAllBoardsView
    ? (subtitleAll || `Manage ${title.toLowerCase()} across all boards`)
    : (subtitle || `Manage ${title.toLowerCase()} for ${currentBoard?.name || 'this board'}`);

  // Tab items with badges
  const tabItems: TabsProps['items'] = tabs?.map(tab => ({
    key: tab.key,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        {tab.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>}
        <span>{tab.label}</span>
        {tab.count !== undefined && (
          <Badge 
            count={tab.count} 
            showZero 
            style={{ backgroundColor: theme.primaryColor }} 
          />
        )}
      </span>
    ),
  }));

  return (
    <div style={{ padding: '0 4px 24px' }}>
      {/* Page Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 0 }}>
        <div>
          <Typography.Title level={5} style={{ margin: 0, marginBottom: 4 }}>
            {pageTitle}
          </Typography.Title>
          <Text type="secondary">{pageSubtitle}</Text>
        </div>
        {!hidePrimaryAction && onPrimaryAction && (
          <Button
            type="primary"
            icon={primaryActionIcon}
            onClick={onPrimaryAction}
            size="middle"
          >
            {primaryActionLabel || `Create ${title.slice(0, -1)}`}
          </Button>
        )}
      </Flex>

      {/* Status Tabs */}
      {tabs && tabs.length > 0 && (
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          type="line"
          size="middle"
          style={{ marginBottom: 16 }}
          items={tabItems}
        />
      )}

      {/* Content (filters, table, etc.) */}
      {children}
    </div>
  );
};

export default IndexPageLayout;
