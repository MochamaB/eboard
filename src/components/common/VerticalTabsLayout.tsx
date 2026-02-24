/**
 * VerticalTabsLayout Component
 * Reusable vertical tabs layout with left sidebar
 * Can be used across modules (roles, users, boards, meetings, etc.)
 */

import React, { useState } from 'react';

export interface VerticalTabItem {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface VerticalTabsLayoutProps {
  tabs: VerticalTabItem[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  primaryColor?: string;
  sidebarWidth?: number;
}

export const VerticalTabsLayout: React.FC<VerticalTabsLayoutProps> = ({
  tabs,
  defaultActiveKey,
  onChange,
  primaryColor = '#324721',
  sidebarWidth = 300,
}) => {
  const [activeKey, setActiveKey] = useState<string>(
    defaultActiveKey || tabs[0]?.key || ''
  );

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveKey(key);
    onChange?.(key);
  };

  const activeTab = tabs.find(tab => tab.key === activeKey);

  return (
    <div style={{ display: 'flex', minHeight: 400, background: '#fff' }}>
      {/* Left Sidebar with Tabs */}
      <div
        style={{
          width: sidebarWidth,
          borderRight: '1px solid #f0f0f0',
          background: '#fafafa',
          padding: '16px 12px',
        }}
      >
        <style>{`
          .vertical-tabs-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .vertical-tab-item {
            display: flex;
            align-items: flex-start;
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            background-color: transparent;
          }
          
          .vertical-tab-item:hover:not(.disabled) {
            background-color: ${primaryColor}08;
          }
          
          .vertical-tab-item.active {
            background-color: ${primaryColor}10;
            border-color: ${primaryColor}40;
          }
          
          .vertical-tab-item.disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }
          
          .vertical-tab-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            font-size: 18px;
            background-color: #e8e8e8;
            color: #595959;
            transition: all 0.2s ease;
          }
          
          .vertical-tab-item.active .vertical-tab-icon {
            background-color: ${primaryColor}15;
            color: ${primaryColor};
          }
          
          .vertical-tab-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 40px;
          }
          
          .vertical-tab-title {
            font-weight: 600;
            font-size: 14px;
            color: #262626;
            margin-bottom: 2px;
            line-height: 1.4;
          }
          
          .vertical-tab-description {
            font-size: 12px;
            color: #8c8c8c;
            line-height: 1.4;
          }
          
          .vertical-tab-item.active .vertical-tab-title {
            color: ${primaryColor};
          }
          
          .vertical-tab-item.disabled .vertical-tab-title,
          .vertical-tab-item.disabled .vertical-tab-description {
            color: #bfbfbf;
          }
        `}</style>
        
        <div className="vertical-tabs-container">
          {tabs.map((tab) => {
            const isActive = tab.key === activeKey;
            
            return (
              <div
                key={tab.key}
                className={`vertical-tab-item ${isActive ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                onClick={() => handleTabClick(tab.key, tab.disabled)}
              >
                {/* Icon */}
                {tab.icon && (
                  <div className="vertical-tab-icon">{tab.icon}</div>
                )}
                
                {/* Text content */}
                <div className="vertical-tab-text">
                  <div className="vertical-tab-title">{tab.label}</div>
                  {tab.description && (
                    <div className="vertical-tab-description">{tab.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content Area */}
      <div
        style={{
          flex: 1,
          padding: 24,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 300px)',
        }}
      >
        {activeTab?.content || (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No content available
          </div>
        )}
      </div>
    </div>
  );
};

export default VerticalTabsLayout;
