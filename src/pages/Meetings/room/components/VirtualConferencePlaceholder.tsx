/**
 * VirtualConferencePlaceholder Component
 * Placeholder for video conferencing (Jitsi integration pending).
 * 
 * Only visible when modeFeatures.showVirtualFeatures is true (mode ≠ physical).
 * Shows:
 * - Grid of participant avatar cards simulating video tiles
 * - "Video Conference — Jitsi Integration Pending" overlay
 * - Audio/Video/ScreenShare toggle buttons
 * - Fades in/out with mode transitions
 * 
 * Per Section 3 of 0308_MEETING_ROOM_IMPLEMENTATION.md
 */

import React from 'react';
import { Avatar, Button, Space, Typography, Tooltip, Badge } from 'antd';
import {
  UserOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';

const { Text } = Typography;

const VirtualConferencePlaceholder: React.FC = () => {
  const { roomState, actions, modeFeatures } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const { participants } = roomState;

  // Only show when virtual features are active
  if (!modeFeatures.showVirtualFeatures) return null;

  // Virtual participants (connected/connecting)
  const virtualParticipants = participants.filter(
    p => p.attendanceStatus === 'joined' &&
      (p.connectionStatus === 'connected' || p.connectionStatus === 'connecting')
  );

  const tileSize = isMobile ? 80 : 110;
  const gap = isMobile ? 6 : 12;

  return (
    <div style={{
      width: '100%',
      borderRadius: isMobile ? 8 : 12,
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1a2e',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '6px 10px' : '8px 16px',
        background: theme.backgroundSecondary,
        borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      }}>
        <Space size={8}>
          <WifiOutlined style={{ color: theme.primaryColor }} />
          <Text strong style={{ fontSize: 12 }}>
            Virtual Participants ({virtualParticipants.length})
          </Text>
          {modeFeatures.isHybrid && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Hybrid Mode
            </Text>
          )}
        </Space>
      </div>

      {/* Video tiles grid */}
      <div style={{
        padding: isMobile ? 8 : 16,
        minHeight: isMobile ? 120 : 180,
        position: 'relative',
      }}>
        {virtualParticipants.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: isMobile ? 100 : 150,
            gap: 8,
          }}>
            <WifiOutlined style={{ fontSize: 32, color: '#555' }} />
            <Text style={{ color: '#888', fontSize: 13 }}>
              No virtual participants connected
            </Text>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap,
            justifyContent: 'center',
          }}>
            {virtualParticipants.map(p => (
              <div
                key={p.id}
                style={{
                  width: tileSize,
                  height: tileSize,
                  borderRadius: 8,
                  background: '#2a2a4a',
                  border: p.isSpeaking
                    ? `2px solid ${theme.successColor}`
                    : '2px solid #3a3a5a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  gap: 4,
                  transition: 'border-color 0.3s',
                }}
              >
                {/* Avatar (simulates video tile) */}
                <Avatar
                  icon={<UserOutlined />}
                  size={isMobile ? 28 : 36}
                  style={{
                    background: p.isSpeaking ? theme.primaryColor : '#555',
                  }}
                />
                {/* Name */}
                <Text
                  style={{
                    color: '#ccc',
                    fontSize: isMobile ? 9 : 10,
                    maxWidth: tileSize - 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                >
                  {(p.name || '').split(' ')[0]}
                </Text>

                {/* Muted indicator */}
                {p.isMuted && (
                  <div style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    background: '#dc2626',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <AudioMutedOutlined style={{ fontSize: 8, color: '#fff' }} />
                  </div>
                )}

                {/* Connecting indicator */}
                {p.connectionStatus === 'connecting' && (
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    fontSize: 10,
                    color: theme.warningColor,
                  }}>
                    ●
                  </div>
                )}

                {/* Raised hand */}
                {p.hasRaisedHand && (
                  <Badge
                    count="✋"
                    size="small"
                    style={{ position: 'absolute', top: 2, left: 2 }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Integration pending overlay */}
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 8 : 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: '#888',
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: 10,
          whiteSpace: 'nowrap',
        }}>
          Video Conference — Jitsi Integration Pending
        </div>
      </div>

      {/* AV controls bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '6px 8px' : '8px 16px',
        background: '#111128',
        borderTop: '1px solid #2a2a4a',
        gap: isMobile ? 8 : 16,
      }}>
        <Tooltip title={roomState.participants.find(p => p.userId === Number(roomState.meetingId))?.isMuted ? 'Unmute' : 'Mute'}>
          <Button
            shape="circle"
            size={isMobile ? 'small' : 'middle'}
            icon={<AudioOutlined />}
            onClick={actions.toggleMute}
            style={{
              background: '#2a2a4a',
              borderColor: '#3a3a5a',
              color: '#ccc',
            }}
          />
        </Tooltip>
        <Tooltip title="Toggle Video">
          <Button
            shape="circle"
            size={isMobile ? 'small' : 'middle'}
            icon={<VideoCameraOutlined />}
            onClick={actions.toggleVideo}
            style={{
              background: '#2a2a4a',
              borderColor: '#3a3a5a',
              color: '#ccc',
            }}
          />
        </Tooltip>
        <Tooltip title="Share Screen">
          <Button
            shape="circle"
            size={isMobile ? 'small' : 'middle'}
            icon={<DesktopOutlined />}
            onClick={() => actions.startScreenShare()}
            style={{
              background: '#2a2a4a',
              borderColor: '#3a3a5a',
              color: '#ccc',
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default React.memo(VirtualConferencePlaceholder);
