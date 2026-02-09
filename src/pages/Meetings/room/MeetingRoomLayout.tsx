/**
 * Meeting Room Layout
 * Main layout component for the live meeting room
 * 
 * Layout Structure:
 * - Uses collapsed sidebar from app shell
 * - Header with meeting title, status, duration, quorum
 * - Left: Main content area (current item display, participant functions, voting, actions)
 * - Right: Two-column side panel (content panel + icon strip)
 */

import React, { useState } from 'react';
import { Layout, Button, Tooltip, Typography } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { useMeetingRoom } from '../../../contexts/MeetingRoomContext';
import type { SidePanelTab } from '../../../types/meetingRoom.types';

import MeetingRoomHeader from './components/MeetingRoomHeader';
import MainContentArea from './components/MainContentArea';
import SidePanelNotice from './components/SidePanelNotice';
import SidePanelAgenda from './components/SidePanelAgenda';
import SidePanelParticipants from './components/SidePanelParticipants';
import SidePanelDocuments from './components/SidePanelDocuments';

const { Content } = Layout;
const { Title } = Typography;

// ============================================================================
// SIDE PANEL TAB CONFIG
// ============================================================================

const SIDE_PANEL_TABS: { key: SidePanelTab; label: string; icon: React.ReactNode }[] = [
  { key: 'notice', label: 'Notice', icon: <FileTextOutlined /> },
  { key: 'agenda', label: 'Agenda', icon: <UnorderedListOutlined /> },
  { key: 'participants', label: 'Participants', icon: <TeamOutlined /> },
  { key: 'documents', label: 'Documents', icon: <FolderOutlined /> },
];

// Icon strip width
const ICON_STRIP_WIDTH = 48;
// Content panel width when expanded
const CONTENT_PANEL_WIDTH = 420;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MeetingRoomLayout: React.FC = () => {
  const { theme } = useBoardContext();
  const { roomState: _roomState } = useMeetingRoom();
  
  // Side panel state
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<SidePanelTab>('agenda');
  
  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };
  
  const handleTabClick = (tabKey: SidePanelTab) => {
    if (activeTab === tabKey && isPanelExpanded) {
      // Clicking active tab collapses the panel
      setIsPanelExpanded(false);
    } else {
      setActiveTab(tabKey);
      setIsPanelExpanded(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notice':
        return <SidePanelNotice />;
      case 'agenda':
        return <SidePanelAgenda />;
      case 'participants':
        return <SidePanelParticipants />;
      case 'documents':
        return <SidePanelDocuments />;
      default:
        return null;
    }
  };
  
  const getActiveTabLabel = () => {
    const tab = SIDE_PANEL_TABS.find(t => t.key === activeTab);
    return tab?.label || '';
  };

  // Calculate total side panel width
  const sidePanelWidth = isPanelExpanded 
    ? ICON_STRIP_WIDTH + CONTENT_PANEL_WIDTH 
    : ICON_STRIP_WIDTH;

  return (
    <Layout style={{ height: '100%', background: 'transparent' }}>
      {/* Meeting Room Header */}
      <MeetingRoomHeader />
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        {/* Left: Main Content */}
        <Content style={{ overflow: 'auto', padding: 16, flex: 1 }}>
          <MainContentArea />
        </Content>
        
        {/* Right: Two-Column Side Panel */}
        <div 
          style={{ 
            display: 'flex',
            width: sidePanelWidth,
            transition: 'width 0.2s ease-in-out',
            borderLeft: '1px solid #f0f0f0',
            background: '#fff',
          }}
        >
          {/* Content Panel (collapsible) */}
          {isPanelExpanded && (
            <div 
              style={{ 
                width: CONTENT_PANEL_WIDTH,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #f0f0f0',
                overflow: 'hidden',
              }}
            >
              {/* Panel Header with collapse button */}
              <div 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  background: '#fafafa',
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {getActiveTabLabel()}
                </Title>
                <Button
                  type="text"
                  size="small"
                  icon={<RightOutlined />}
                  onClick={togglePanel}
                  title="Collapse panel"
                />
              </div>
              
              {/* Panel Content */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                {renderTabContent()}
              </div>
            </div>
          )}
          
          {/* Icon Strip (always visible) */}
          <div 
            style={{ 
              width: ICON_STRIP_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48,
              gap: 14,
              background: theme.primaryLight || '#fafafa',
            }}
          >
            {/* Expand button when collapsed */}
            {!isPanelExpanded && (
              <Tooltip title="Expand panel" placement="left">
                <Button
                  type="text"
                  size="small"
                  icon={<LeftOutlined />}
                  onClick={togglePanel}
                  style={{ marginBottom: 8 }}
                />
              </Tooltip>
            )}
            
            {/* Tab Icons */}
            {SIDE_PANEL_TABS.map((tab) => (
              <Tooltip key={tab.key} title={tab.label} placement="left">
                <Button
                  type={activeTab === tab.key ? 'primary' : 'text'}
                  icon={tab.icon}
                  onClick={() => handleTabClick(tab.key)}
                  style={{
                    width: 40,
                    height: 60,
                    fontSize: 20,
                    borderRadius: 0,
                    borderBottom: '3px solid #c6c6c6',
                  }}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MeetingRoomLayout;
