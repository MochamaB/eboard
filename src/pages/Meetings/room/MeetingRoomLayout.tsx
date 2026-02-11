/**
 * Meeting Room Layout
 * Main layout component for the live meeting room
 * 
 * Layout Structure:
 * - Desktop (≥992px): Main content + inline side panel (icon strip + content panel)
 * - Tablet (768–991px): Main content full-width + side panel as overlay drawer from right
 * - Mobile (<768px): Main content full-width + side panel as full-screen drawer + bottom tab bar
 * 
 * Board branding applied to icon strip, panel header, and active tab indicators.
 */

import React, { useState, useMemo } from 'react';
import { Layout, Button, Tooltip, Typography, Drawer, Badge } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  FolderOutlined,
  TrophyOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { useResponsive } from '../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../contexts/MeetingRoomContext';
import type { SidePanelTab } from '../../../types/meetingRoom.types';

import MeetingRoomHeader from './components/MeetingRoomHeader';
import MainContentArea from './components/MainContentArea';
import SidePanelNotice from './components/SidePanelNotice';
import SidePanelAgenda from './components/SidePanelAgenda';
import SidePanelParticipants from './components/SidePanelParticipants';
import SidePanelDocuments from './components/SidePanelDocuments';
import SidePanelVoting from './components/SidePanelVoting';
import SidePanelMinutes from './components/SidePanelMinutes';

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
  { key: 'voting', label: 'Voting', icon: <TrophyOutlined /> },
  { key: 'minutes', label: 'Minutes', icon: <EditOutlined /> },
];

// Responsive widths
const ICON_STRIP_WIDTH = 48;
const CONTENT_PANEL_WIDTH_LG = 420;
const CONTENT_PANEL_WIDTH_MD = 320;
const DRAWER_WIDTH_MD = 380;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MeetingRoomLayout: React.FC = () => {
  const { theme } = useBoardContext();
  const { roomState } = useMeetingRoom();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Side panel state
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<SidePanelTab>('agenda');
  
  // On mobile/tablet, panel is a drawer — track open state separately
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Use drawer mode for mobile and tablet
  const useDrawerMode = isMobile || isTablet;
  
  // Responsive content panel width
  const contentPanelWidth = isDesktop ? CONTENT_PANEL_WIDTH_LG : CONTENT_PANEL_WIDTH_MD;
  
  // Responsive content padding
  const contentPadding = isMobile ? 8 : isTablet ? 12 : 16;
  
  // Waiting room count for badge on participants tab
  const waitingCount = useMemo(() => {
    return roomState.participants.filter(p => p.attendanceStatus === 'waiting').length;
  }, [roomState.participants]);

  const togglePanel = () => {
    if (useDrawerMode) {
      setIsDrawerOpen(!isDrawerOpen);
    } else {
      setIsPanelExpanded(!isPanelExpanded);
    }
  };
  
  const handleTabClick = (tabKey: SidePanelTab) => {
    if (useDrawerMode) {
      if (activeTab === tabKey && isDrawerOpen) {
        setIsDrawerOpen(false);
      } else {
        setActiveTab(tabKey);
        setIsDrawerOpen(true);
      }
    } else {
      if (activeTab === tabKey && isPanelExpanded) {
        setIsPanelExpanded(false);
      } else {
        setActiveTab(tabKey);
        setIsPanelExpanded(true);
      }
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
      case 'voting':
        return <SidePanelVoting />;
      case 'minutes':
        return <SidePanelMinutes />;
      default:
        return null;
    }
  };
  
  const getActiveTabLabel = () => {
    const tab = SIDE_PANEL_TABS.find(t => t.key === activeTab);
    return tab?.label || '';
  };
  
  // Tab badge count (e.g. waiting participants)
  const getTabBadge = (tabKey: SidePanelTab): number => {
    if (tabKey === 'participants' && waitingCount > 0) return waitingCount;
    return 0;
  };

  // Calculate total side panel width (desktop only)
  const sidePanelWidth = isPanelExpanded 
    ? ICON_STRIP_WIDTH + contentPanelWidth 
    : ICON_STRIP_WIDTH;

  // Shared tab button renderer
  const renderTabButton = (tab: typeof SIDE_PANEL_TABS[0], isHorizontal = false) => {
    const isActive = activeTab === tab.key;
    const badge = getTabBadge(tab.key);
    
    const button = (
      <Button
        type={isActive ? 'primary' : 'text'}
        icon={tab.icon}
        onClick={() => handleTabClick(tab.key)}
        style={{
          width: isHorizontal ? 'auto' : 40,
          height: isHorizontal ? 44 : 60,
          fontSize: isHorizontal ? 16 : 20,
          borderRadius: isHorizontal ? 8 : 0,
          borderBottom: isHorizontal ? 'none' : `3px solid ${isActive ? theme.primaryColor : theme.borderColorLight}`,
          flex: isHorizontal ? 1 : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {isHorizontal && <span style={{ fontSize: 12 }}>{tab.label}</span>}
      </Button>
    );

    if (badge > 0) {
      return (
        <Badge key={tab.key} count={badge} size="small" offset={isHorizontal ? [-4, 0] : [-2, 2]}>
          {isHorizontal ? button : <Tooltip title={tab.label} placement="left">{button}</Tooltip>}
        </Badge>
      );
    }

    return isHorizontal 
      ? <React.Fragment key={tab.key}>{button}</React.Fragment>
      : <Tooltip key={tab.key} title={tab.label} placement="left">{button}</Tooltip>;
  };

  // ========================================================================
  // DRAWER MODE (Mobile + Tablet)
  // ========================================================================
  
  if (useDrawerMode) {
    return (
      <Layout style={{ height: '100%', background: 'transparent' }}>
        <MeetingRoomHeader />
        
        <Content style={{ overflow: 'auto', padding: contentPadding, flex: 1 }}>
          <MainContentArea />
        </Content>
        
        {/* Bottom Tab Bar (Mobile/Tablet) */}
        <div 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '4px 8px',
            borderTop: `1px solid ${theme.borderColor}`,
            background: theme.backgroundSecondary,
          }}
        >
          {SIDE_PANEL_TABS.map((tab) => renderTabButton(tab, true))}
        </div>
        
        {/* Drawer Panel */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ 
                width: 4, 
                height: 20, 
                borderRadius: 2, 
                background: theme.primaryColor, 
                display: 'inline-block' 
              }} />
              {getActiveTabLabel()}
            </div>
          }
          placement="right"
          width={isMobile ? '100%' : DRAWER_WIDTH_MD}
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          closeIcon={<CloseOutlined />}
          styles={{
            header: { 
              borderBottom: `1px solid ${theme.borderColor}`,
              background: theme.backgroundTertiary,
            },
            body: { padding: 0 },
          }}
        >
          {renderTabContent()}
        </Drawer>
      </Layout>
    );
  }

  // ========================================================================
  // DESKTOP MODE — inline side panel
  // ========================================================================
  
  return (
    <Layout style={{ height: '100%', background: 'transparent' }}>
      <MeetingRoomHeader />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        {/* Left: Main Content */}
        <Content style={{ overflow: 'auto', padding: contentPadding, flex: 1 }}>
          <MainContentArea />
        </Content>
        
        {/* Right: Two-Column Side Panel */}
        <div 
          style={{ 
            display: 'flex',
            width: sidePanelWidth,
            transition: 'width 0.2s ease-in-out',
            borderLeft: `1px solid ${theme.borderColor}`,
            background: theme.backgroundSecondary,
          }}
        >
          {/* Content Panel (collapsible) */}
          {isPanelExpanded && (
            <div 
              style={{ 
                width: contentPanelWidth,
                display: 'flex',
                flexDirection: 'column',
                borderRight: `1px solid ${theme.borderColorLight}`,
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
                  borderBottom: `1px solid ${theme.borderColor}`,
                  background: theme.backgroundTertiary,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ 
                    width: 4, 
                    height: 20, 
                    borderRadius: 2, 
                    background: theme.primaryColor, 
                    display: 'inline-block' 
                  }} />
                  <Title level={5} style={{ margin: 0 }}>
                    {getActiveTabLabel()}
                  </Title>
                </div>
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
          
          {/* Icon Strip (always visible on desktop) */}
          <div 
            style={{ 
              width: ICON_STRIP_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48,
              gap: 14,
              background: theme.primaryLight || theme.backgroundTertiary,
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
            {SIDE_PANEL_TABS.map((tab) => renderTabButton(tab, false))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default React.memo(MeetingRoomLayout);
