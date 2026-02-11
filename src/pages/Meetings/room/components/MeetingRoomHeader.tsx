/**
 * Meeting Room Header
 * Displays meeting title, status, duration, quorum, and mode indicator
 * 
 * Responsive:
 * - Desktop: Full single-row layout with all details
 * - Tablet: Two-row layout, simplified quorum
 * - Mobile: Compact two-row, minimal quorum, icon-only connection
 * 
 * Board branding: header border accent, background, tag colors
 */

import React from 'react';
import { Space, Tag, Progress, Typography, Tooltip } from 'antd';
import { ClockCircleOutlined, TeamOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';

const { Text, Title } = Typography;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'green';
    case 'paused':
      return 'orange';
    case 'waiting':
      return 'blue';
    case 'ending':
    case 'ended':
      return 'default';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'paused':
      return 'Paused';
    case 'waiting':
      return 'Waiting to Start';
    case 'starting':
      return 'Starting...';
    case 'ending':
      return 'Ending...';
    case 'ended':
      return 'Ended';
    default:
      return status;
  }
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'physical':
      return 'Physical';
    case 'virtual':
      return 'Virtual';
    case 'hybrid':
      return 'Hybrid';
    default:
      return mode;
  }
}

function getModeColor(mode: string): string {
  switch (mode) {
    case 'virtual':
      return 'purple';
    case 'hybrid':
      return 'cyan';
    default:
      return 'default';
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

const MeetingRoomHeader: React.FC = () => {
  const { theme } = useBoardContext();
  const { roomState } = useMeetingRoom();
  const { isMobile, isTablet } = useResponsive();
  const { meeting, status, mode, duration, presentCount, expectedCount, quorumRequired, quorumMet, isConnected } = roomState;
  
  const quorumPercentage = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;
  
  // ---- MOBILE LAYOUT ----
  if (isMobile) {
    return (
      <div style={{ 
        borderBottom: `2px solid ${theme.primaryColor}`, 
        background: theme.backgroundSecondary, 
        padding: '8px 12px' 
      }}>
        {/* Row 1: Title + Duration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Title level={5} style={{ margin: 0, fontSize: 14, maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meeting?.title || 'Meeting Room'}
          </Title>
          <Space size={4}>
            <ClockCircleOutlined style={{ fontSize: 14, color: theme.textSecondary }} />
            <Text style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 600 }}>
              {formatDuration(duration)}
            </Text>
          </Space>
        </div>
        {/* Row 2: Tags + Quorum compact + Connection dot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={4}>
            <Tag color={getStatusColor(status)} style={{ margin: 0, fontSize: 11 }}>
              {getStatusLabel(status)}
            </Tag>
            <Tag color={getModeColor(mode)} style={{ margin: 0, fontSize: 11 }}>
              {getModeLabel(mode)}
            </Tag>
          </Space>
          <Space size={8}>
            <Tooltip title={`${presentCount}/${expectedCount} present, ${quorumRequired} required`}>
              <Space size={4}>
                <TeamOutlined style={{ fontSize: 13, color: theme.textSecondary }} />
                <Text strong style={{ fontSize: 12 }}>{presentCount}/{expectedCount}</Text>
                <span style={{ 
                  width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                  background: quorumMet ? theme.successColor : theme.warningColor,
                }} />
              </Space>
            </Tooltip>
            <Tooltip title={isConnected ? 'Connected' : 'Disconnected'}>
              <span style={{ 
                width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                background: isConnected ? theme.successColor : theme.errorColor,
              }} />
            </Tooltip>
          </Space>
        </div>
      </div>
    );
  }
  
  // ---- TABLET LAYOUT ----
  if (isTablet) {
    return (
      <div style={{ 
        borderBottom: `2px solid ${theme.primaryColor}`, 
        background: theme.backgroundSecondary, 
        padding: '10px 16px' 
      }}>
        {/* Row 1: Title + Tags */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={5} style={{ margin: 0, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meeting?.title || 'Meeting Room'}
            </Title>
            <Text type="secondary" style={{ fontSize: 11 }}>{meeting?.boardName}</Text>
          </div>
          <Space size={6}>
            <Tag color={getStatusColor(status)} style={{ margin: 0 }}>{getStatusLabel(status)}</Tag>
            <Tag color={getModeColor(mode)} style={{ margin: 0 }}>{getModeLabel(mode)}</Tag>
          </Space>
        </div>
        {/* Row 2: Duration + Quorum + Connection */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={8}>
            <ClockCircleOutlined style={{ fontSize: 16, color: theme.textSecondary }} />
            <Text style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 600 }}>
              {formatDuration(duration)}
            </Text>
          </Space>
          <Space size={16}>
            <Space size={6}>
              <TeamOutlined style={{ fontSize: 16, color: theme.textSecondary }} />
              <Text strong>{presentCount}/{expectedCount}</Text>
              <Tag color={quorumMet ? 'success' : 'warning'} style={{ margin: 0, fontSize: 11 }}>
                {quorumMet ? '✓ Quorum' : '✗ No Quorum'}
              </Tag>
            </Space>
            <Space size={4}>
              {isConnected ? (
                <WifiOutlined style={{ color: theme.successColor }} />
              ) : (
                <DisconnectOutlined style={{ color: theme.errorColor }} />
              )}
              <Text style={{ color: isConnected ? theme.successColor : theme.errorColor, fontSize: 12 }}>
                {isConnected ? 'Connected' : 'Offline'}
              </Text>
            </Space>
          </Space>
        </div>
      </div>
    );
  }

  // ---- DESKTOP LAYOUT ----
  return (
    <div style={{ 
      borderBottom: `2px solid ${theme.primaryColor}`, 
      background: theme.backgroundSecondary, 
      padding: '12px 16px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Meeting Title and Status */}
        <Space size="large">
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {meeting?.title || 'Meeting Room'}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {meeting?.boardName}
            </Text>
          </div>
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
          <Tag color={getModeColor(mode)}>
            {getModeLabel(mode)}
          </Tag>
        </Space>
        
        {/* Center: Duration */}
        <Space>
          <ClockCircleOutlined style={{ fontSize: 18, color: theme.textSecondary }} />
          <Text style={{ fontSize: 18, fontFamily: 'monospace' }}>
            {formatDuration(duration)}
          </Text>
        </Space>
        
        {/* Right: Quorum and Connection */}
        <Space size="large">
          <Space>
            <TeamOutlined style={{ fontSize: 18, color: theme.textSecondary }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong>{presentCount}/{expectedCount}</Text>
                <Tag color={quorumMet ? 'success' : 'warning'}>
                  {quorumMet ? '✓ Quorum' : '✗ No Quorum'}
                </Tag>
              </div>
              <Progress 
                percent={quorumPercentage} 
                size="small" 
                showInfo={false}
                strokeColor={quorumMet ? theme.successColor : theme.warningColor}
                style={{ width: 100, margin: '4px 0' }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {quorumRequired} required
              </Text>
            </div>
          </Space>
          <Space>
            {isConnected ? (
              <>
                <WifiOutlined style={{ color: theme.successColor }} />
                <Text style={{ color: theme.successColor, fontSize: 12 }}>Connected</Text>
              </>
            ) : (
              <>
                <DisconnectOutlined style={{ color: theme.errorColor }} />
                <Text style={{ color: theme.errorColor, fontSize: 12 }}>Disconnected</Text>
              </>
            )}
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default React.memo(MeetingRoomHeader);
