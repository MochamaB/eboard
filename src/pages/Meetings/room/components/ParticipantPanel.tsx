/**
 * ParticipantPanel — Unified participant strip
 * 
 * Compact horizontal strip of participant cards (max 5 visible).
 * Theme-branded (light background), scroll arrows on overflow.
 * AV controls moved to BottomControlBar.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Avatar, Typography, Tooltip, Tag } from 'antd';
import {
  UserOutlined,
  AudioMutedOutlined,
  LeftOutlined,
  RightOutlined,
  WifiOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import type { RoomParticipant } from '../../../../types/meetingRoom.types';

const { Text } = Typography;

// ============================================================================
// PARTICIPANT CARD
// ============================================================================

interface ParticipantCardProps {
  participant: RoomParticipant;
  showVirtualFeatures: boolean;
  isMobile: boolean;
}

const ParticipantCard: React.FC<ParticipantCardProps> = React.memo(({
  participant,
  showVirtualFeatures,
  isMobile,
}) => {
  const { theme } = useBoardContext();

  const isRemote = participant.connectionStatus === 'connected' || participant.connectionStatus === 'connecting';
  const isConnecting = participant.connectionStatus === 'connecting';
  const isInRoom = participant.connectionStatus === 'in_room';
  const isSpeaking = participant.isSpeaking;
  const isMuted = participant.isMuted;
  const hasRaisedHand = participant.hasRaisedHand;

  const cardWidth = isMobile ? 72 : 90;
  const cardHeight = isMobile ? 80 : 96;
  const avatarSize = isMobile ? 32 : 40;

  const firstName = (participant.name || `User ${participant.userId}`).split(' ')[0];
  const roleName = participant.boardRole || 'Participant';

  const tooltipContent = (
    <div style={{ textAlign: 'center' }}>
      <div>{participant.name || `User ${participant.userId}`}</div>
      <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'capitalize' }}>
        {roleName}
        {isRemote ? ' · Remote' : ' · In Room'}
      </div>
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="top">
      <div
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: 8,
          background: theme.backgroundQuaternary || '#f8f8f4',
          border: isSpeaking
            ? `2px solid ${theme.successColor}`
            : `1px solid ${theme.borderColor || '#e5e7eb'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          position: 'relative',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: isSpeaking ? `0 0 8px ${theme.successColor}40` : 'none',
        }}
      >
        {/* Raised hand badge */}
        {hasRaisedHand && (
          <div style={{
            position: 'absolute',
            top: 2,
            left: 4,
            fontSize: 12,
            lineHeight: 1,
          }}>
            ✋
          </div>
        )}

        {/* Avatar */}
        <Avatar
          icon={<UserOutlined />}
          size={avatarSize}
          style={{
            background: isSpeaking ? theme.primaryColor : (theme.textTertiary || '#999'),
            transition: 'background 0.2s',
          }}
        />

        {/* Name */}
        <Text
          style={{
            fontSize: isMobile ? 9 : 10,
            color: theme.textSecondary,
            maxWidth: cardWidth - 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {firstName}
        </Text>

        {/* Mode badge */}
        <div style={{
          fontSize: isMobile ? 8 : 9,
          padding: '1px 4px',
          borderRadius: 3,
          background: isInRoom ? 'rgba(82, 196, 26, 0.15)' : 'rgba(24, 144, 255, 0.15)',
          color: isInRoom ? '#52c41a' : '#1890ff',
          lineHeight: 1.3,
          fontWeight: 500,
        }}>
          {isInRoom ? '🏢 In Room' : '💻 Remote'}
        </div>

        {/* Muted indicator (bottom-right, virtual only) */}
        {showVirtualFeatures && isRemote && isMuted && (
          <div style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            background: '#dc2626',
            borderRadius: '50%',
            width: 14,
            height: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AudioMutedOutlined style={{ fontSize: 7, color: '#fff' }} />
          </div>
        )}

        {/* Connecting pulse (top-right) */}
        {isConnecting && (
          <div style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#faad14',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        )}
      </div>
    </Tooltip>
  );
});

ParticipantCard.displayName = 'ParticipantCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MAX_VISIBLE_CARDS = 5;

const ParticipantPanel: React.FC = () => {
  const { roomState, modeFeatures } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const { participants } = roomState;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Only show joined participants
  const joinedParticipants = participants.filter(p => p.attendanceStatus === 'joined');

  // Check scroll overflow
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateArrows);
      const resizeObs = new ResizeObserver(updateArrows);
      resizeObs.observe(el);
      return () => {
        el.removeEventListener('scroll', updateArrows);
        resizeObs.disconnect();
      };
    }
  }, [updateArrows, joinedParticipants.length]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = isMobile ? 160 : 220;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const overflowCount = Math.max(0, joinedParticipants.length - MAX_VISIBLE_CARDS);

  if (joinedParticipants.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      borderRadius: isMobile ? 8 : 12,
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      overflow: 'hidden',
      background: theme.backgroundSecondary || '#fff',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '6px 10px' : '8px 14px',
        borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: 600 }}>
            Participants ({joinedParticipants.length})
          </Text>
          {modeFeatures.isHybrid && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              <HomeOutlined style={{ marginRight: 3 }} />
              {modeFeatures.physicalCount} in room
              <span style={{ margin: '0 4px' }}>·</span>
              <WifiOutlined style={{ marginRight: 3 }} />
              {modeFeatures.virtualCount} remote
            </Text>
          )}
          {modeFeatures.isPhysicalOnly && (
            <Tag color="green" style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>
              Physical
            </Tag>
          )}
          {modeFeatures.isVirtualOnly && (
            <Tag color="blue" style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>
              Virtual
            </Tag>
          )}
        </div>
      </div>

      {/* Scrollable strip with arrows */}
      <div style={{ position: 'relative', padding: isMobile ? '8px 0' : '10px 0' }}>
        {/* Left arrow */}
        {showLeftArrow && (
          <div
            onClick={() => scrollBy('left')}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(to right, ${theme.backgroundSecondary || '#fff'} 60%, transparent)`,
              zIndex: 2,
              cursor: 'pointer',
              color: theme.textSecondary,
              fontSize: 14,
            }}
          >
            <LeftOutlined />
          </div>
        )}

        {/* Cards strip */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: isMobile ? 8 : 10,
            overflowX: 'auto',
            padding: isMobile ? '0 10px' : '0 14px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {joinedParticipants.map(p => (
            <ParticipantCard
              key={p.id}
              participant={p}
              showVirtualFeatures={modeFeatures.showVirtualFeatures}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Right arrow + overflow count */}
        {showRightArrow && (
          <div
            onClick={() => scrollBy('right')}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: overflowCount > 0 ? 52 : 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: `linear-gradient(to left, ${theme.backgroundSecondary || '#fff'} 60%, transparent)`,
              zIndex: 2,
              cursor: 'pointer',
              color: theme.textSecondary,
              fontSize: 14,
            }}
          >
            {overflowCount > 0 && (
              <Text style={{ fontSize: 11, fontWeight: 500, color: theme.textSecondary }}>+{overflowCount}</Text>
            )}
            <RightOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ParticipantPanel);
