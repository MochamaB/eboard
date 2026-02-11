/**
 * Meeting Controls Bar
 * Sticky bar with status-aware meeting lifecycle buttons
 * 
 * Status-aware buttons:
 * - waiting: "Start Meeting" (enabled when quorum met)
 * - in_progress: "Pause" + "End Meeting" + "Leave" + host controls
 * - paused: "Resume" + "End Meeting" + "Leave"
 * - ending/ended: Disabled/hidden
 * 
 * Permission-gated via useMeetingRoomPermissions
 * Responsive: icon-only on mobile, full labels on desktop
 * Board branding applied to button colors and bar styling
 */

import React, { useState } from 'react';
import { Button, Space, Tooltip, Modal, Typography, Divider } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  PoweroffOutlined,
  LogoutOutlined,
  CaretRightOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const { Text } = Typography;

interface MeetingControlsBarProps {
  onCreateVote?: () => void;
}

const MeetingControlsBar: React.FC<MeetingControlsBarProps> = ({ onCreateVote }) => {
  const { roomState, actions, capabilities } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile, isTablet } = useResponsive();
  const permissions = useMeetingRoomPermissions();
  const { status, quorumMet } = roomState;

  const [loading, setLoading] = useState<string | null>(null);

  const isCompact = isMobile || isTablet;

  const handleAction = async (actionName: string, action: () => Promise<void>) => {
    setLoading(actionName);
    try {
      await action();
    } catch (err) {
      console.error(`${actionName} failed:`, err);
    } finally {
      setLoading(null);
    }
  };

  const confirmEnd = () => {
    Modal.confirm({
      title: 'End Meeting',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to end this meeting? This action cannot be undone.',
      okText: 'Yes, End Meeting',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleAction('end', actions.endMeeting),
    });
  };

  const confirmLeave = () => {
    Modal.confirm({
      title: 'Leave Meeting',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to leave? You can rejoin later.',
      okText: 'Leave',
      cancelText: 'Stay',
      onOk: () => handleAction('leave', actions.leaveMeeting),
    });
  };

  // Don't show controls if meeting has ended
  if (status === 'ended' || status === 'ending') {
    return (
      <div style={{
        padding: isMobile ? '8px 12px' : '10px 16px',
        borderTop: `1px solid ${theme.borderColor}`,
        background: theme.backgroundTertiary,
        textAlign: 'center',
      }}>
        <Text type="secondary">
          {status === 'ending' ? 'Meeting is ending...' : 'Meeting has ended'}
        </Text>
      </div>
    );
  }

  // ---- WAITING STATE ----
  if (status === 'waiting' || status === 'starting') {
    return (
      <div style={{
        padding: isMobile ? '8px 12px' : '12px 16px',
        borderTop: `2px solid ${theme.primaryColor}`,
        background: theme.backgroundSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!quorumMet && (
            <Text type="warning" style={{ fontSize: isMobile ? 11 : 12 }}>
              ⚠ Quorum not met — waiting for participants
            </Text>
          )}
          {quorumMet && (
            <Text style={{ fontSize: isMobile ? 11 : 12, color: theme.successColor }}>
              ✓ Quorum met — ready to start
            </Text>
          )}
        </div>
        {permissions.canStartMeeting && (
          <Tooltip title={!quorumMet ? 'Quorum must be met to start' : ''}>
            <Button
              type="primary"
              size={isMobile ? 'middle' : 'large'}
              icon={status === 'starting' ? <LoadingOutlined /> : <PlayCircleOutlined />}
              disabled={!quorumMet || status === 'starting'}
              onClick={() => handleAction('start', actions.startMeeting)}
              loading={loading === 'start'}
              style={{
                background: theme.primaryColor,
                borderColor: theme.primaryColor,
                fontWeight: 600,
              }}
            >
              {!isCompact && 'Start Meeting'}
            </Button>
          </Tooltip>
        )}
      </div>
    );
  }

  // ---- PAUSED STATE ----
  if (status === 'paused') {
    return (
      <div style={{
        padding: isMobile ? '8px 12px' : '12px 16px',
        borderTop: `2px solid ${theme.warningColor}`,
        background: theme.backgroundSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <Text style={{ fontSize: isMobile ? 11 : 12, color: theme.warningColor, fontWeight: 600 }}>
          ⏸ Meeting Paused
        </Text>
        <Space size={isMobile ? 4 : 8}>
          {permissions.canPauseMeeting && (
            isCompact ? (
              <Tooltip title="Resume Meeting">
                <Button
                  type="primary"
                  icon={<CaretRightOutlined />}
                  onClick={() => handleAction('resume', actions.resumeMeeting)}
                  loading={loading === 'resume'}
                  style={{ background: theme.successColor, borderColor: theme.successColor }}
                />
              </Tooltip>
            ) : (
              <Button
                type="primary"
                icon={<CaretRightOutlined />}
                onClick={() => handleAction('resume', actions.resumeMeeting)}
                loading={loading === 'resume'}
                style={{ background: theme.successColor, borderColor: theme.successColor }}
              >
                Resume
              </Button>
            )
          )}
          {permissions.canEndMeeting && (
            isCompact ? (
              <Tooltip title="End Meeting">
                <Button danger icon={<PoweroffOutlined />} onClick={confirmEnd} />
              </Tooltip>
            ) : (
              <Button danger icon={<PoweroffOutlined />} onClick={confirmEnd}>
                End Meeting
              </Button>
            )
          )}
          {permissions.canLeave && (
            isCompact ? (
              <Tooltip title="Leave">
                <Button type="text" icon={<LogoutOutlined />} onClick={confirmLeave} />
              </Tooltip>
            ) : (
              <Button type="text" icon={<LogoutOutlined />} onClick={confirmLeave}>
                Leave
              </Button>
            )
          )}
        </Space>
      </div>
    );
  }

  // ---- IN_PROGRESS STATE ----
  return (
    <div style={{
      padding: isMobile ? '8px 12px' : '12px 16px',
      borderTop: `2px solid ${theme.primaryColor}`,
      background: theme.backgroundSecondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    }}>
      {/* Left: Host controls */}
      <Space size={isMobile ? 4 : 8} wrap={false}>
        {capabilities.canCreateVote && permissions.canCreateVote && onCreateVote && (
          isCompact ? (
            <Tooltip title="Create Vote">
              <Button
                icon={<TrophyOutlined />}
                onClick={onCreateVote}
                style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
              />
            </Tooltip>
          ) : (
            <Button
              icon={<TrophyOutlined />}
              onClick={onCreateVote}
              style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
            >
              Create Vote
            </Button>
          )
        )}
      </Space>

      {/* Right: Meeting lifecycle */}
      <Space size={isMobile ? 4 : 8} wrap={false}>
        {permissions.canPauseMeeting && (
          isCompact ? (
            <Tooltip title="Pause Meeting">
              <Button
                icon={<PauseCircleOutlined />}
                onClick={() => handleAction('pause', actions.pauseMeeting)}
                loading={loading === 'pause'}
                style={{ borderColor: theme.warningColor, color: theme.warningColor }}
              />
            </Tooltip>
          ) : (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={() => handleAction('pause', actions.pauseMeeting)}
              loading={loading === 'pause'}
              style={{ borderColor: theme.warningColor, color: theme.warningColor }}
            >
              Pause
            </Button>
          )
        )}
        {permissions.canEndMeeting && (
          isCompact ? (
            <Tooltip title="End Meeting">
              <Button danger icon={<PoweroffOutlined />} onClick={confirmEnd} />
            </Tooltip>
          ) : (
            <Button danger icon={<PoweroffOutlined />} onClick={confirmEnd}>
              End Meeting
            </Button>
          )
        )}

        {(permissions.canPauseMeeting || permissions.canEndMeeting) && permissions.canLeave && (
          <Divider type="vertical" style={{ borderColor: theme.borderColor, margin: 0 }} />
        )}

        {permissions.canLeave && (
          isCompact ? (
            <Tooltip title="Leave Meeting">
              <Button type="text" icon={<LogoutOutlined />} onClick={confirmLeave} />
            </Tooltip>
          ) : (
            <Button type="text" icon={<LogoutOutlined />} onClick={confirmLeave}>
              Leave
            </Button>
          )
        )}
      </Space>
    </div>
  );
};

export default React.memo(MeetingControlsBar);
