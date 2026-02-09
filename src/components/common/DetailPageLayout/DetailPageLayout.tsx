/**
 * DetailPageLayout Component
 * Reusable layout wrapper for entity detail/view pages
 * Provides consistent structure: back button, header, tabs, and content area
 * Similar to IndexPageLayout but for detail views
 */

import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { DetailsHeader, HorizontalTabs } from '../';
import type { MetadataItem, ActionButton } from '../DetailsHeader/DetailsHeader';
import type { HorizontalTabItem } from '../HorizontalTabs/HorizontalTabs';
import type { MenuProps } from 'antd';

export interface DetailPageLayoutProps {
  // Back navigation
  backLabel?: string;
  backPath?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  
  // Header props (passed to DetailsHeader)
  icon?: React.ReactNode;
  title: string;
  description?: string;
  metadata?: MetadataItem[];
  primaryAction?: ActionButton;
  dropdownActions?: MenuProps['items'];
  extraActions?: ActionButton[];
  headerAlert?: React.ReactNode;
  
  // Tabs (optional)
  tabs?: HorizontalTabItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  tabBarExtraContent?: React.ReactNode;
  
  // Content
  children: React.ReactNode;
  
  // Loading/Error states
  isLoading?: boolean;
  error?: Error | string | null;
  emptyStateMessage?: string;
  
  // Styling
  contentPadding?: number | string;
  contentBackground?: string;
  contentMinHeight?: number | string;
  headerStyle?: React.CSSProperties;
  tabBarStyle?: React.CSSProperties;
}

export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  backLabel = 'Back',
  onBack,
  showBackButton = true,
  icon,
  title,
  description,
  metadata,
  primaryAction,
  dropdownActions,
  extraActions,
  headerAlert,
  tabs,
  activeTab,
  onTabChange,
  tabBarExtraContent,
  children,
  isLoading = false,
  error = null,
  emptyStateMessage,
  contentPadding = 24,
  contentBackground = '#fff',
  contentMinHeight = 400,
  headerStyle,
  tabBarStyle,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: '#ff4d4f' }}>Error: {errorMessage}</p>
        {showBackButton && onBack && (
          <Button onClick={onBack} style={{ marginTop: 16 }}>
            {backLabel}
          </Button>
        )}
      </div>
    );
  }

  // Empty state (no title means no data)
  if (!title && emptyStateMessage) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>{emptyStateMessage}</p>
        {showBackButton && onBack && (
          <Button onClick={onBack} style={{ marginTop: 16 }}>
            {backLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '0 24px 24px' }}>
      

      {/* Details Header */}
      <DetailsHeader
        icon={icon}
        title={title}
        description={description}
        metadata={metadata}
        primaryAction={primaryAction}
        dropdownActions={dropdownActions}
        extraActions={extraActions}
        alert={headerAlert}
        style={headerStyle}
      />

      {/* Horizontal Tabs (optional) */}
      {tabs && tabs.length > 0 && activeTab && onTabChange && (
        <HorizontalTabs
          items={tabs}
          activeKey={activeTab}
          onChange={onTabChange}
          size="middle"
          style={{ marginBottom: 0 }}
          tabBarStyle={tabBarStyle}
          tabBarExtraContent={tabBarExtraContent}
        />
      )}

      {/* Content Area */}
      <div
        style={{
          backgroundColor: contentBackground,
          borderRadius: tabs && tabs.length > 0 ? '0 0 8px 8px' : '8px',
          minHeight: contentMinHeight,
          padding: contentPadding,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DetailPageLayout;
