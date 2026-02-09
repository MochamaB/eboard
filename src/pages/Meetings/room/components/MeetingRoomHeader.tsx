/**
 * Meeting Room Header
 * Displays meeting title, status, duration, quorum, and mode indicator
 */

import React from 'react';
import { Space, Tag, Progress, Typography } from 'antd';
import { ClockCircleOutlined, TeamOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
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
  const { meeting, status, mode, duration, presentCount, expectedCount, quorumRequired, quorumMet, isConnected } = roomState;
  
  const quorumPercentage = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;
  
  return (
    <div style={{ 
      borderBottom: '1px solid #f0f0f0', 
      background: '#fff', 
      padding: '12px 16px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Meeting Title and Status */}
        <Space size="large">
          {/* Meeting Title */}
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {meeting?.title || 'Meeting Room'}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {meeting?.boardName}
            </Text>
          </div>
          
          {/* Status Indicator */}
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
          
          {/* Mode Badge */}
          <Tag color={getModeColor(mode)}>
            {getModeLabel(mode)}
          </Tag>
        </Space>
        
        {/* Center: Duration */}
        <Space>
          <ClockCircleOutlined style={{ fontSize: 18, color: '#666' }} />
          <Text style={{ fontSize: 18, fontFamily: 'monospace' }}>
            {formatDuration(duration)}
          </Text>
        </Space>
        
        {/* Right: Quorum and Connection */}
        <Space size="large">
          {/* Quorum Status */}
          <Space>
            <TeamOutlined style={{ fontSize: 18, color: '#666' }} />
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
                strokeColor={quorumMet ? '#52c41a' : '#faad14'}
                style={{ width: 100, margin: '4px 0' }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {quorumRequired} required
              </Text>
            </div>
          </Space>
          
          {/* Connection Status */}
          <Space>
            {isConnected ? (
              <>
                <WifiOutlined style={{ color: '#52c41a' }} />
                <Text style={{ color: '#52c41a', fontSize: 12 }}>Connected</Text>
              </>
            ) : (
              <>
                <DisconnectOutlined style={{ color: '#ff4d4f' }} />
                <Text style={{ color: '#ff4d4f', fontSize: 12 }}>Disconnected</Text>
              </>
            )}
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default MeetingRoomHeader;
