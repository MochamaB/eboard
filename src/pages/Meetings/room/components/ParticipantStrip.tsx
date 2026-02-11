/**
 * Participant Strip
 * Horizontal scrollable strip of participant avatars
 * 
 * Visual indicators:
 * - Green ring: speaking
 * - Hand emoji badge: raised hand
 * - Mic-off icon: muted (virtual/hybrid only)
 * - Small "remote" dot: virtual participant
 * 
 * Responsive: smaller avatars on mobile, larger on desktop
 * Board branding on active/speaking ring colors
 */

import React from 'react';
import { Avatar, Badge, Tooltip, Typography } from 'antd';
import {
  UserOutlined,
  AudioMutedOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import type { RoomParticipant } from '../../../../types/meetingRoom.types';

const { Text } = Typography;

const ParticipantStrip: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const { participants, mode } = roomState;

  // Only show joined participants
  const joinedParticipants = participants.filter(p => p.attendanceStatus === 'joined');

  if (joinedParticipants.length === 0) return null;

  const avatarSize = isMobile ? 40 : 52;
  const showVirtualIndicators = mode === 'virtual' || mode === 'hybrid';

  const renderAvatar = (participant: RoomParticipant) => {
    const isSpeaking = participant.isSpeaking;
    const hasRaisedHand = participant.hasRaisedHand;
    const isMuted = participant.isMuted;
    const isRemote = participant.connectionStatus === 'connected' || participant.connectionStatus === 'connecting';

    const tooltipContent = (
      <div style={{ textAlign: 'center' }}>
        <div>{participant.name || `User ${participant.userId}`}</div>
        <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'capitalize' }}>
          {participant.boardRole || 'Participant'}
          {isRemote ? ' (Remote)' : ''}
        </div>
      </div>
    );

    const avatar = (
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        {/* Avatar with speaking ring */}
        <div
          style={{
            borderRadius: '50%',
            padding: 2,
            border: isSpeaking
              ? `2px solid ${theme.successColor}`
              : '2px solid transparent',
            transition: 'border-color 0.2s',
          }}
        >
          <Avatar
            icon={<UserOutlined />}
            size={avatarSize}
            style={{
              background: isSpeaking ? theme.primaryColor : theme.textTertiary,
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Muted indicator (bottom-left) */}
        {showVirtualIndicators && isMuted && (
          <div style={{
            position: 'absolute',
            bottom: isMobile ? 8 : 10,
            left: -2,
            background: theme.errorColor,
            borderRadius: '50%',
            width: isMobile ? 14 : 16,
            height: isMobile ? 14 : 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AudioMutedOutlined style={{ fontSize: 8, color: '#fff' }} />
          </div>
        )}

        {/* Remote indicator (bottom-right) */}
        {showVirtualIndicators && isRemote && (
          <div style={{
            position: 'absolute',
            bottom: isMobile ? 8 : 10,
            right: -2,
            background: theme.infoColor || theme.primaryColor,
            borderRadius: '50%',
            width: isMobile ? 14 : 16,
            height: isMobile ? 14 : 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <WifiOutlined style={{ fontSize: 8, color: '#fff' }} />
          </div>
        )}

        {/* Name label (truncated) */}
        {!isMobile && (
          <Text
            style={{
              fontSize: 10,
              maxWidth: avatarSize + 8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              lineHeight: 1.2,
              color: theme.textSecondary,
            }}
          >
            {(participant.name || '').split(' ')[0]}
          </Text>
        )}
      </div>
    );

    // Wrap with raised hand badge
    const withBadge = hasRaisedHand ? (
      <Badge count="✋" size="small" offset={[-4, 4]} key={participant.id}>
        {avatar}
      </Badge>
    ) : (
      <React.Fragment key={participant.id}>{avatar}</React.Fragment>
    );

    return (
      <Tooltip key={participant.id} title={tooltipContent} placement="top">
        {withBadge}
      </Tooltip>
    );
  };

  return (
    <div style={{
      width: '100%',
      background: theme.backgroundTertiary || '#f8f9fb',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? '8px 10px' : '12px 16px',
    }}>
      {/* Label */}
      <Text
        type="secondary"
        style={{
          fontSize: isMobile ? 11 : 12,
          fontWeight: 600,
          display: 'block',
          marginBottom: isMobile ? 6 : 8,
        }}
      >
        Participants ({joinedParticipants.length})
      </Text>

      {/* Scrollable strip */}
      <div
        style={{
          display: 'flex',
          gap: isMobile ? 10 : 16,
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
        }}
      >
        {joinedParticipants.map(renderAvatar)}
      </div>
    </div>
  );
};

export default React.memo(ParticipantStrip);
