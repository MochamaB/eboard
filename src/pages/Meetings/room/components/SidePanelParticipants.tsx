/**
 * Side Panel - Participants Tab
 * Displays meeting participants with their status
 */

import React from 'react';
import { Button, Space, Avatar, Empty, Badge } from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  VideoCameraAddOutlined,
  AudioOutlined, 
  AudioMutedOutlined, 
  UserAddOutlined, 
  UserDeleteOutlined 
} from '@ant-design/icons';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const SidePanelParticipants: React.FC = () => {
  const { roomState, actions } = useMeetingRoom();
  const theme = useMeetingRoomTheme();
  const { isMobile } = useResponsive();
  const { participants } = roomState;
  const permissions = useMeetingRoomPermissions();
  
  // Group participants by status
  const inRoom = participants.filter(p => p.connectionStatus === 'in_room' && p.attendanceStatus === 'joined');
  const remote = participants.filter(p => p.connectionStatus === 'connected' && p.attendanceStatus === 'joined');
  const waiting = participants.filter(p => p.attendanceStatus === 'waiting');
  const guests = participants.filter(p => p.isGuest && p.attendanceStatus === 'joined');
  
  const panelPadding = isMobile ? 12 : 16;
  const itemGap = isMobile ? 8 : 12;
  
  const renderParticipant = (participant: typeof participants[0], showControls = false) => (
    <div 
      key={participant.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: itemGap,
        padding: isMobile ? 6 : 8,
        borderRadius: 8,
        cursor: 'default',
      }}
    >
      <div style={{ position: 'relative' }}>
        <Badge count={participant.hasRaisedHand ? '✋' : 0} size="small" offset={[-2, 2]}>
          <Avatar icon={<UserOutlined />} size="small" />
        </Badge>
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <span 
          style={{ 
            display: 'block', 
            ...getTypographyCSS('text'), fontWeight: 600,
            color: theme.textPrimary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {participant.name || `User ${participant.userId}`}
        </span>
        <span style={{ ...getTypographyCSS('caption'), color: theme.textSecondary, textTransform: 'capitalize' }}>
          {participant.boardRole || 'Participant'}
        </span>
      </div>
      
      {/* Status Icons */}
      <Space size={4}>
        {participant.connectionStatus !== 'in_room' && (
          <>
            {participant.isMuted ? (
              <AudioMutedOutlined style={{ color: theme.errorColor, fontSize: 12 }} />
            ) : (
              <AudioOutlined style={{ color: theme.successColor, fontSize: 12 }} />
            )}
            {participant.isVideoOn ? (
              <VideoCameraOutlined style={{ color: theme.successColor, fontSize: 12 }} />
            ) : (
              <VideoCameraAddOutlined style={{ color: theme.textTertiary, fontSize: 12 }} />
            )}
          </>
        )}
        {participant.isSpeaking && (
          <span style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: theme.successColor,
            display: 'inline-block',
          }} />
        )}
      </Space>
      
      {/* Host Controls */}
      {showControls && permissions.canRemoveParticipant && (
        <Button 
          type="text" 
          size="small"
          icon={<UserDeleteOutlined />}
          onClick={() => actions.removeParticipant(participant.id)}
        />
      )}
    </div>
  );
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: panelPadding }}>
        {/* In-Room Participants */}
        {inRoom.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ ...getTypographyCSS('sectionLabel'), textTransform: 'uppercase', display: 'block', marginBottom: 8, color: theme.textSecondary }}>
              🏢 In-Room ({inRoom.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {inRoom.map(p => renderParticipant(p, true))}
            </div>
          </div>
        )}
        
        {/* Remote Participants */}
        {remote.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ ...getTypographyCSS('sectionLabel'), textTransform: 'uppercase', display: 'block', marginBottom: 8, color: theme.textSecondary }}>
              💻 Remote ({remote.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {remote.map(p => renderParticipant(p, true))}
            </div>
          </div>
        )}
        
        {/* Waiting Room */}
        {waiting.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ ...getTypographyCSS('sectionLabel'), textTransform: 'uppercase', display: 'block', marginBottom: 8, color: theme.textSecondary }}>
              ⏳ Waiting Room ({waiting.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {waiting.map(participant => (
                <div 
                  key={participant.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 8,
                    borderRadius: 8,
                    background: theme.backgroundTertiary,
                  }}
                >
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ ...getTypographyCSS('text'), fontWeight: 600, color: theme.textPrimary }}>
                      {participant.name || `User ${participant.userId}`}
                    </span>
                  </div>
                  {permissions.canAdmitParticipants && (
                    <Button 
                      size="small"
                      onClick={() => actions.admitParticipant(participant.id)}
                    >
                      Admit
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {permissions.canAdmitParticipants && waiting.length > 1 && (
              <Button 
                block
                icon={<UserAddOutlined />}
                style={{ marginTop: 8 }}
                onClick={actions.admitAllParticipants}
              >
                Admit All
              </Button>
            )}
          </div>
        )}
        
        {/* Guests */}
        {guests.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ ...getTypographyCSS('sectionLabel'), textTransform: 'uppercase', display: 'block', marginBottom: 8, color: theme.textSecondary }}>
              👥 Guests ({guests.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {guests.map(p => renderParticipant(p))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {participants.length === 0 && (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="No participants yet" 
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(SidePanelParticipants);
