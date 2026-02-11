/**
 * ParticipantPanel — Unified participant display
 * 
 * Compact horizontal scrollable strip of participant cards.
 * Each card adapts based on participant state (physical/virtual).
 * 
 * Layout:
 * - Header: participant count + mode split (e.g., "3 in room · 2 remote")
 * - Strip: scrollable row of small cards with left/right arrows on overflow
 * - Footer: AV controls bar (only when showVirtualFeatures)
 * 
 * Per-card:
 * - Avatar + first name
 * - Mode badge: green "In Room" or blue "Remote"
 * - Speaking: green border highlight
 * - Muted: red mic-off indicator (virtual only)
 * - Raised hand: ✋ badge
 * - Connecting: yellow pulse dot
 * 
 * Replaces: ParticipantStrip, VirtualConferencePlaceholder, PhysicalAttendancePlaceholder
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Avatar, Button, Typography, Tooltip, Tag } from 'antd';
import {
  UserOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
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
          background: '#2a2a3e',
          border: isSpeaking
            ? `2px solid ${theme.successColor}`
            : '1px solid #3a3a5a',
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
            background: isSpeaking ? theme.primaryColor : '#555',
            transition: 'background 0.2s',
          }}
        />

        {/* Name */}
        <Text
          style={{
            fontSize: isMobile ? 9 : 10,
            color: '#ccc',
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

const ParticipantPanel: React.FC = () => {
  const { roomState, actions, modeFeatures } = useMeetingRoom();
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

  if (joinedParticipants.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      borderRadius: isMobile ? 8 : 12,
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      overflow: 'hidden',
      background: '#1e1e32',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '6px 10px' : '8px 14px',
        borderBottom: '1px solid #2a2a4a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#ccc', fontSize: 12, fontWeight: 600 }}>
            Participants ({joinedParticipants.length})
          </Text>
          {modeFeatures.isHybrid && (
            <Text style={{ color: '#888', fontSize: 11 }}>
              <HomeOutlined style={{ marginRight: 3 }} />
              {modeFeatures.physicalCount} in room
              <span style={{ margin: '0 4px', color: '#555' }}>·</span>
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
              background: 'linear-gradient(to right, #1e1e32 60%, transparent)',
              zIndex: 2,
              cursor: 'pointer',
              color: '#ccc',
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
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE
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

        {/* Right arrow */}
        {showRightArrow && (
          <div
            onClick={() => scrollBy('right')}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to left, #1e1e32 60%, transparent)',
              zIndex: 2,
              cursor: 'pointer',
              color: '#ccc',
              fontSize: 14,
            }}
          >
            <RightOutlined />
          </div>
        )}
      </div>

      {/* AV Controls toolbar (only when virtual features active) */}
      {modeFeatures.showVirtualFeatures && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '6px 8px' : '8px 14px',
          borderTop: '1px solid #2a2a4a',
          gap: isMobile ? 10 : 16,
        }}>
          <Tooltip title="Toggle Mute">
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
      )}

      {/* Hide scrollbar CSS */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default React.memo(ParticipantPanel);
