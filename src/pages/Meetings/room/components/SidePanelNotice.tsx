/**
 * Side Panel - Notice Tab
 * Displays meeting notice information, quorum status, and connection status
 */

import React from 'react';
import { Space, Progress, Typography, Divider, Tag } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  WifiOutlined, 
  DisconnectOutlined,
  TeamOutlined 
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';

const { Text, Title } = Typography;

const SidePanelNotice: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { 
    meeting, 
    status, 
    mode, 
    presentCount, 
    expectedCount, 
    quorumRequired, 
    quorumMet, 
    isConnected,
    lastSyncAt,
  } = roomState;
  
  const quorumPercentage = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;
  
  return (
    <div style={{ padding: 16 }}>
      {/* Meeting Info */}
      <div>
        <Title level={5}>Meeting Notice</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space align="start">
            <CalendarOutlined style={{ color: '#666', marginTop: 4 }} />
            <div>
              <Text strong>{meeting?.title || 'Meeting'}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>{meeting?.boardName}</Text>
            </div>
          </Space>
          
          <Space>
            <ClockCircleOutlined style={{ color: '#666' }} />
            <div>
              <Text>{meeting?.startDate} at {meeting?.startTime}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>{meeting?.duration} minutes</Text>
            </div>
          </Space>
          
          <Space>
            <EnvironmentOutlined style={{ color: '#666' }} />
            <div>
              <Text style={{ textTransform: 'capitalize' }}>{meeting?.locationType || mode}</Text>
              {meeting?.physicalAddress && (
                <>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{meeting.physicalAddress}</Text>
                </>
              )}
            </div>
          </Space>
        </Space>
      </div>
      
      <Divider />
      
      {/* Quorum Status */}
      <div>
        <Title level={5}>Quorum Status</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Status</Text>
            <Tag color={quorumMet ? 'success' : 'warning'}>
              {quorumMet ? '✓ Quorum Met' : '⚠ No Quorum'}
            </Tag>
          </div>
          
          <Space style={{ width: '100%' }}>
            <TeamOutlined style={{ color: '#666' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>Present: {presentCount}/{expectedCount}</Text>
                <Text style={{ fontSize: 13 }}>{quorumPercentage}%</Text>
              </div>
              <Progress 
                percent={quorumPercentage} 
                showInfo={false} 
                strokeColor={quorumMet ? '#52c41a' : '#faad14'}
                size="small"
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {quorumRequired} members required for quorum
              </Text>
            </div>
          </Space>
        </Space>
      </div>
      
      <Divider />
      
      {/* Connection Status */}
      <div>
        <Title level={5}>Connection</Title>
        <Space>
          {isConnected ? (
            <>
              <WifiOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text style={{ color: '#52c41a' }}>Connected</Text>
                {lastSyncAt && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Last sync: {new Date(lastSyncAt).toLocaleTimeString()}
                    </Text>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <DisconnectOutlined style={{ color: '#ff4d4f' }} />
              <div>
                <Text style={{ color: '#ff4d4f' }}>Disconnected</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>Attempting to reconnect...</Text>
              </div>
            </>
          )}
        </Space>
      </div>
      
      <Divider />
      
      {/* Meeting Status */}
      <div>
        <Title level={5}>Meeting Status</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Status</Text>
            <Text style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Mode</Text>
            <Text style={{ textTransform: 'capitalize' }}>{mode}</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanelNotice;
