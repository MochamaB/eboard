/**
 * PreMeetingLobby — Left sidebar shown during waiting/pre-meeting phase
 * 
 * Mirrors Jitsi's pre-meeting join panel:
 * - Board logo (rounded container, same as main sidebar)
 * - "Join Meeting" heading + meeting title
 * - User display name
 * - Green "Join Meeting" / "Start Meeting" button
 * - Mode-aware controls below:
 *   - Virtual: Mic, Camera, Settings icons + red hangup
 *   - Physical: "Mark Present" button
 *   - Hybrid: "How are you joining?" selector → then appropriate controls
 * - Device status indicator
 * 
 * On mobile/tablet this takes full width (notice doc hidden).
 */

import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  PhoneOff,
  UserCheck,
  Monitor,
} from 'lucide-react';
import { useBoardContext } from '../../../../contexts';
import { useAuth } from '../../../../contexts/AuthContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';

// ============================================================================
// TYPES
// ============================================================================

type JoinType = 'in_person' | 'remote' | null;

interface PreMeetingLobbyProps {
  onJoin: () => void;
  onLeave: () => void;
}

// ============================================================================
// SMALL ICON BUTTON (for AV controls row)
// ============================================================================

const AVBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}> = ({ icon, label, onClick, active, danger }) => {
  const [hovered, setHovered] = useState(false);

  let bg = 'rgba(255,255,255,0.08)';
  if (hovered) bg = 'rgba(255,255,255,0.15)';
  if (active) bg = 'rgba(255,255,255,0.2)';
  if (danger) bg = hovered ? '#ff2020' : '#ee1133';

  return (
    <Tooltip title={label} placement="top">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: bg,
          color: danger ? '#fff' : '#d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s',
          outline: 'none',
          flexShrink: 0,
        }}
      >
        {icon}
      </button>
    </Tooltip>
  );
};

// ============================================================================
// COMPONENT
// ============================================================================

const PreMeetingLobby: React.FC<PreMeetingLobbyProps> = ({ onJoin, onLeave }) => {
  const { currentBoard } = useBoardContext();
  const { user } = useAuth();
  const { roomState } = useMeetingRoom();
  const permissions = useMeetingRoomPermissions();
  const mrTheme = useMeetingRoomTheme();
  const { meeting, mode, status, quorumMet } = roomState;

  // Local AV state (pre-join, not yet connected)
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // For hybrid meetings: user selects how they're joining
  const [joinType, setJoinType] = useState<JoinType>(
    mode === 'physical' ? 'in_person' :
    mode === 'virtual' ? 'remote' :
    null // hybrid → needs selection
  );

  const isHybrid = mode === 'hybrid';
  const isHost = permissions.canStartMeeting;
  const canJoin = status === 'waiting' || status === 'in_progress' || status === 'starting';

  // Determine effective join mode
  const effectiveJoinType: JoinType = joinType || (
    mode === 'physical' ? 'in_person' :
    mode === 'virtual' ? 'remote' :
    null
  );

  const showVirtualControls = effectiveJoinType === 'remote';
  const showPhysicalControls = effectiveJoinType === 'in_person';

  // Board logo
  const logoUrl = currentBoard?.branding?.logo?.main || currentBoard?.branding?.logo?.small || '';
  const boardName = currentBoard?.name || currentBoard?.shortName || 'eBoard';

  const handleJoin = () => {
    onJoin();
  };

  const userName =
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
  user?.email ||
  'Participant';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1a1a',
      padding: '24px 20px',
      overflow: 'auto',
    }}>

      {/* Board Logo — rounded container */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 32,
      }}>
        {logoUrl ? (
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#fff',
            border: `3px solid ${mrTheme.primaryColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            <img
              src={logoUrl}
              alt={boardName}
              style={{ width: 52, height: 52, objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: mrTheme.primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 600,
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            {boardName[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{
          color: '#e0e0e0',
          fontSize: 20,
          fontWeight: 700,
          margin: '0 0 8px 0',
        }}>
          {isHost ? 'Start Meeting' : 'Join Meeting'}
        </h2>
        <p style={{
          color: '#a0a0b0',
          fontSize: 13,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {meeting?.title || 'Meeting Room'}
        </p>
      </div>

      {/* User Name */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 16,
        textAlign: 'center',
        color: '#e0e0e0',
        fontSize: 14,
        fontWeight: 500,
      }}>
        {userName}
      </div>

      {/* Hybrid mode selector */}
      {isHybrid && !joinType && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#a0a0b0', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>
            How are you joining?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              block
              onClick={() => setJoinType('in_person')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e0e0e0',
                height: 40,
              }}
              icon={<UserCheck size={16} style={{ marginRight: 4 }} />}
            >
              In Person
            </Button>
            <Button
              block
              onClick={() => setJoinType('remote')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e0e0e0',
                height: 40,
              }}
              icon={<Monitor size={16} style={{ marginRight: 4 }} />}
            >
              Remote
            </Button>
          </div>
        </div>
      )}

      {/* Hybrid — selected type indicator */}
      {isHybrid && joinType && (
        <div style={{
          textAlign: 'center',
          marginBottom: 12,
          fontSize: 12,
          color: '#8ab4f8',
        }}>
          Joining {joinType === 'in_person' ? 'in person' : 'remotely'}
          <button
            onClick={() => setJoinType(null)}
            style={{
              background: 'none', border: 'none', color: '#666',
              fontSize: 11, cursor: 'pointer', marginLeft: 8,
              textDecoration: 'underline',
            }}
          >
            Change
          </button>
        </div>
      )}

      {/* Join / Start Button */}
      {(effectiveJoinType || !isHybrid) && (
        <Button
          type="primary"
          block
          size="large"
          onClick={handleJoin}
          disabled={!canJoin || (isHost && !quorumMet && status === 'waiting')}
          style={{
            height: 44,
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            background: '#2b8a3e',
            borderColor: '#2b8a3e',
            marginBottom: 16,
          }}
        >
          {isHost
            ? (quorumMet ? 'Start Meeting' : 'Quorum Not Met')
            : 'Join Meeting'
          }
        </Button>
      )}

      {/* AV Controls (virtual/remote join) */}
      {showVirtualControls && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
        }}>
          <AVBtn
            icon={micOn ? <Mic size={18} /> : <MicOff size={18} />}
            label={micOn ? 'Mute' : 'Unmute'}
            onClick={() => setMicOn(!micOn)}
            active={micOn}
          />
          <AVBtn
            icon={camOn ? <Video size={18} /> : <VideoOff size={18} />}
            label={camOn ? 'Camera Off' : 'Camera On'}
            onClick={() => setCamOn(!camOn)}
            active={camOn}
          />
          <AVBtn
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => { /* TODO: open settings modal */ }}
          />
          <AVBtn
            icon={<PhoneOff size={18} />}
            label="Leave"
            onClick={onLeave}
            danger
          />
        </div>
      )}

      {/* Physical Controls */}
      {showPhysicalControls && (
        <div style={{ marginBottom: 16 }}>
          <Button
            block
            icon={<UserCheck size={16} style={{ marginRight: 4 }} />}
            onClick={handleJoin}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#e0e0e0',
              height: 40,
            }}
          >
            Mark Present
          </Button>
        </div>
      )}

      {/* Device Status (virtual only) */}
      {showVirtualControls && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#52c41a',
          fontSize: 12,
          marginTop: 'auto',
          paddingTop: 16,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#52c41a', display: 'inline-block',
          }} />
          Your devices are working properly
        </div>
      )}

      {/* Physical join — quorum info */}
      {showPhysicalControls && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: '#a0a0b0',
          fontSize: 12,
          marginTop: 'auto',
          paddingTop: 16,
        }}>
          <span>
            Quorum: {roomState.presentCount}/{roomState.expectedCount}
          </span>
          <span style={{ color: quorumMet ? '#52c41a' : '#faad14' }}>
            {quorumMet ? '✓ Quorum Met' : '⚠ Waiting for quorum'}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(PreMeetingLobby);
