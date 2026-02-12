/**
 * BottomControlBar — Jitsi Meet-style floating toolbar
 * 
 * 4-section layout with vertical separators:
 *   Section 1 (AV):          Mic | Camera | Share Screen | Raise Hand
 *   Section 2 (Right Panel):  Notice | Agenda | Participants | Documents  → opens RIGHT sidebar
 *   Section 3 (Left Panel):   Voting | Minutes | Chat | Notes            → opens LEFT sidebar
 *   Section 4 (Actions):      More (...) dropdown → Hangup
 * 
 * Responsive behavior:
 *   Desktop / Tablet: All sections visible
 *   Mobile + Virtual:  AV controls + active panel icon + More (panels in dropdown) + Hangup
 *   Mobile + Physical: Right panel tabs + More (left tabs, actions in dropdown)
 *   Mobile + Hybrid:   Same as virtual mobile
 * 
 * The More dropdown (dark menu) contains overflow items + lifecycle actions + Create Vote.
 * Permission-gated, mode-aware.
 */

import React, { useState, useMemo } from 'react';
import { Tooltip, Modal, Badge, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  MicOff,
  VideoOff,
  MonitorUp,
  Hand,
  Bell,
  List,
  Users,
  FolderOpen,
  Trophy,
  PenLine,
  MessageSquare,
  StickyNote,
  Play,
  Pause,
  PhoneOff,
  MoreHorizontal,
  Settings,
  Maximize,
  CircleDot,
  Sun,
  Moon,
} from 'lucide-react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { useMeetingRoomTheme, useDisplayMode } from '../MeetingRoomThemeContext';
import type { SidePanelTab } from '../../../../types/meetingRoom.types';
import type { MeetingRoomTheme } from '../meetingRoomTheme';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZE = 20;
const MENU_ICON = 16;

// Right sidebar tabs — governance / meeting structure (opens RIGHT sidebar)
const RIGHT_SIDEBAR_TABS: { key: SidePanelTab; label: string; icon: React.ReactNode }[] = [
  { key: 'notice', label: 'Details', icon: <Bell size={ICON_SIZE} /> },
  { key: 'agenda', label: 'Agenda', icon: <List size={ICON_SIZE} /> },
  { key: 'participants', label: 'Members', icon: <Users size={ICON_SIZE} /> },
  { key: 'documents', label: 'Documents', icon: <FolderOpen size={ICON_SIZE} /> },
];

// Left sidebar tabs — utility / action panels (opens LEFT sidebar)
const LEFT_SIDEBAR_TABS: { key: SidePanelTab; label: string; icon: React.ReactNode }[] = [
  { key: 'voting', label: 'Voting', icon: <Trophy size={ICON_SIZE} /> },
  { key: 'minutes', label: 'Minutes', icon: <PenLine size={ICON_SIZE} /> },
  { key: 'chat', label: 'Chat', icon: <MessageSquare size={ICON_SIZE} /> },
  { key: 'notes', label: 'Notes', icon: <StickyNote size={ICON_SIZE} /> },
];

// Combined for mobile overflow lookup
const ALL_TABS = [...RIGHT_SIDEBAR_TABS, ...LEFT_SIDEBAR_TABS];

// ============================================================================
// VERTICAL SEPARATOR
// ============================================================================

const Sep: React.FC<{ theme: MeetingRoomTheme }> = ({ theme: t }) => (
  <div style={{
    width: 1,
    height: 24,
    background: t.borderColorStrong,
    margin: '0 4px',
    flexShrink: 0,
  }} />
);

// ============================================================================
// TOOLBAR ICON BUTTON
// ============================================================================

interface TBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
  accent?: boolean;
  /** Show label text below the icon (Zoom-style) */
  showLabel?: boolean;
  theme: MeetingRoomTheme;
}

const TBtn: React.FC<TBtnProps> = ({ icon, label, onClick, active, disabled, badge, accent, showLabel, theme: t }) => {
  const [hovered, setHovered] = useState(false);

  let bg = 'transparent';
  let color = t.textSecondary;
  if (hovered) { bg = t.backgroundHover; }
  if (active) { bg = t.backgroundActive; color = t.textPrimary; }
  if (accent) { bg = t.primaryColor; color = t.primaryContrast; }
  if (disabled) { color = t.textDisabled; }

  const btnContent = showLabel ? (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 64,
        height: 52,
        borderRadius: 8,
        border: 'none',
        background: bg,
        color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0,
        outline: 'none',
        padding: '4px 0',
      }}
    >
      {icon}
      <span style={{
        ...getTypographyCSS('sectionLabel'), fontWeight: active ? 600 : 400,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 60,
      }}>
        {label}
      </span>
    </button>
  ) : (
    <Tooltip title={label} placement="top">
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          background: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
          opacity: disabled ? 0.4 : 1,
          flexShrink: 0,
          outline: 'none',
        }}
      >
        {icon}
      </button>
    </Tooltip>
  );

  if (badge && badge > 0) {
    return <Badge count={badge} size="small" offset={[-6, 6]} style={{ boxShadow: 'none' }}>{btnContent}</Badge>;
  }
  return btnContent;
};

// ============================================================================
// HANGUP / END BUTTON (red pill)
// ============================================================================

const HangupBtn: React.FC<{ label: string; onClick: () => void; theme: MeetingRoomTheme }> = ({ label, onClick, theme: t }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Tooltip title={label} placement="top">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 56,
          height: 38,
          borderRadius: 10,
          border: 'none',
          background: hovered ? t.btnDangerHover : t.btnDanger,
          color: t.primaryContrast,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s',
          flexShrink: 0,
          outline: 'none',
          marginLeft: 4,
        }}
      >
        <PhoneOff size={20} />
      </button>
    </Tooltip>
  );
};

// ============================================================================
// PROPS
// ============================================================================

interface BottomControlBarProps {
  activeTab: SidePanelTab | undefined;
  onTabClick: (tab: SidePanelTab) => void;
  onCreateVote?: () => void;
  /** Parent passes visibility state for coordinated auto-hide */
  visible?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const BottomControlBar: React.FC<BottomControlBarProps> = ({
  activeTab,
  onTabClick,
  onCreateVote,
  visible = true,
}) => {
  const { roomState, actions, capabilities, modeFeatures } = useMeetingRoom();
  const { isMobile } = useResponsive();
  const permissions = useMeetingRoomPermissions();
  const mrTheme = useMeetingRoomTheme();
  const { isDark, toggleMode } = useDisplayMode();
  const { status, quorumMet, participants } = roomState;

  const [, setLoading] = useState<string | null>(null);
  const waitingCount = participants.filter(p => p.attendanceStatus === 'waiting').length;

  const isVirtual = modeFeatures.showVirtualFeatures;
  const showAllSections = !isMobile; // tablet + desktop show everything

  const handleAction = async (name: string, action: () => Promise<void>) => {
    setLoading(name);
    try { await action(); } catch (err) { console.error(`${name} failed:`, err); }
    finally { setLoading(null); }
  };

  const confirmEnd = () => {
    Modal.confirm({
      title: 'End Meeting',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure? This cannot be undone.',
      okText: 'End Meeting',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleAction('end', actions.endMeeting),
    });
  };

  // ── Build "More" dropdown menu items ──
  const moreMenuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [];

    // On mobile, overflow panels go into the menu
    if (isMobile) {
      if (isVirtual) {
        // Mobile + virtual: right sidebar tabs go to dropdown
        items.push({
          key: 'right-panels-header',
          type: 'group',
          label: 'Meeting',
          children: RIGHT_SIDEBAR_TABS.map(tab => ({
            key: `panel-${tab.key}`,
            icon: React.cloneElement(tab.icon as React.ReactElement<{ size: number }>, { size: MENU_ICON }),
            label: tab.label,
            onClick: () => onTabClick(tab.key),
          })),
        });
        items.push({ type: 'divider', key: 'div-right-panels' });
      }
      // Left sidebar tabs always in dropdown on mobile
      items.push({
        key: 'left-panels-header',
        type: 'group',
        label: 'Tools',
        children: LEFT_SIDEBAR_TABS.map(tab => ({
          key: `panel-${tab.key}`,
          icon: React.cloneElement(tab.icon as React.ReactElement<{ size: number }>, { size: MENU_ICON }),
          label: tab.label,
          onClick: () => onTabClick(tab.key),
        })),
      });
      items.push({ type: 'divider', key: 'div-actions' });
    }

    // Lifecycle actions
    if ((status === 'waiting' || status === 'starting') && permissions.canStartMeeting) {
      items.push({
        key: 'start',
        icon: <Play size={MENU_ICON} />,
        label: quorumMet ? 'Start Meeting' : 'Quorum not met',
        disabled: !quorumMet || status === 'starting',
        onClick: () => handleAction('start', actions.startMeeting),
      });
    }

    if (status === 'in_progress' && permissions.canPauseMeeting) {
      items.push({
        key: 'pause',
        icon: <Pause size={MENU_ICON} />,
        label: 'Pause Meeting',
        onClick: () => handleAction('pause', actions.pauseMeeting),
      });
    }

    if (status === 'paused' && permissions.canPauseMeeting) {
      items.push({
        key: 'resume',
        icon: <Play size={MENU_ICON} />,
        label: 'Resume Meeting',
        onClick: () => handleAction('resume', actions.resumeMeeting),
      });
    }

    // Create Vote
    if (status === 'in_progress' && capabilities.canCreateVote && permissions.canCreateVote) {
      items.push({
        key: 'create-vote',
        icon: <Trophy size={MENU_ICON} />,
        label: 'Create Vote',
        onClick: () => onCreateVote?.(),
      });
    }

    if (items.length > 0 && items[items.length - 1]?.key !== 'div-settings') {
      items.push({ type: 'divider', key: 'div-settings' });
    }

    // Recording placeholder
    items.push({
      key: 'record',
      icon: <CircleDot size={MENU_ICON} />,
      label: 'Start Recording',
      disabled: true,
      onClick: () => {},
    });

    // Fullscreen
    items.push({
      key: 'fullscreen',
      icon: <Maximize size={MENU_ICON} />,
      label: 'View Full Screen',
      onClick: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      },
    });

    // Dark / Light mode toggle
    items.push({
      key: 'toggle-theme',
      icon: isDark ? <Sun size={MENU_ICON} /> : <Moon size={MENU_ICON} />,
      label: isDark ? 'Light Mode' : 'Dark Mode',
      onClick: toggleMode,
    });

    // Settings placeholder
    items.push({
      key: 'settings',
      icon: <Settings size={MENU_ICON} />,
      label: 'Settings',
      disabled: true,
      onClick: () => {},
    });

    return items;
  }, [isMobile, isVirtual, status, quorumMet, permissions, capabilities, actions, onCreateVote, onTabClick, isDark, toggleMode]);

  // Ended state — thin centered message
  if (status === 'ended' || status === 'ending') {
    return (
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: mrTheme.toolbar,
        borderRadius: 12,
        padding: '10px 24px',
        color: mrTheme.textTertiary,
        ...getTypographyCSS('text'),
      }}>
        {status === 'ending' ? 'Meeting is ending...' : 'Meeting has ended'}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: visible
          ? 'translate(-50%, 0)'
          : 'translate(-50%, 80px)',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        opacity: visible ? 1 : 0,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 2 : 4,
        background: mrTheme.toolbar,
        borderRadius: '14px 14px 0 0',
        padding: isMobile ? '6px 8px' : '6px 12px',
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ── SECTION 1: AV Controls (virtual/hybrid only) ── */}
      {isVirtual && (
        <>
          <TBtn icon={<MicOff size={ICON_SIZE} />} label="Mute" onClick={actions.toggleMute} theme={mrTheme} />
          <TBtn icon={<VideoOff size={ICON_SIZE} />} label="Camera" onClick={actions.toggleVideo} theme={mrTheme} />
          {showAllSections && (
            <TBtn icon={<MonitorUp size={ICON_SIZE} />} label="Share Screen" onClick={() => actions.startScreenShare()} theme={mrTheme} />
          )}
          <TBtn icon={<Hand size={ICON_SIZE} />} label="Raise Hand" onClick={actions.raiseHand} theme={mrTheme} />
          <Sep theme={mrTheme} />
        </>
      )}

      {/* ── SECTION 2: Right Sidebar Tabs (governance) ── */}
      {/* Desktop/Tablet: show all right sidebar tabs */}
      {/* Mobile + Physical: show right sidebar tabs (primary interaction) */}
      {/* Mobile + Virtual: show only active panel icon (rest in More dropdown) */}
      {(showAllSections || !isVirtual) ? (
        <>
          {RIGHT_SIDEBAR_TABS.map(tab => (
            <TBtn
              key={tab.key}
              icon={tab.icon}
              label={tab.label}
              onClick={() => onTabClick(tab.key)}
              active={activeTab === tab.key}
              badge={tab.key === 'participants' ? waitingCount : 0}
              showLabel
              theme={mrTheme}
            />
          ))}
        </>
      ) : (
        /* Mobile + Virtual: only show active panel button if one is open */
        activeTab && ALL_TABS.find(at => at.key === activeTab) ? (
          <TBtn
            icon={ALL_TABS.find(at => at.key === activeTab)!.icon}
            label={ALL_TABS.find(at => at.key === activeTab)!.label}
            onClick={() => onTabClick(activeTab)}
            active
            theme={mrTheme}
          />
        ) : null
      )}

      {/* Separator between right and left sidebar tabs */}
      {showAllSections && <Sep theme={mrTheme} />}

      {/* ── SECTION 3: Left Sidebar Tabs (utility / actions) ── */}
      {/* Desktop/Tablet: show Voting, Minutes, Chat, Notes */}
      {showAllSections && (
        <>
          {LEFT_SIDEBAR_TABS.map(tab => (
            <TBtn
              key={tab.key}
              icon={tab.icon}
              label={tab.label}
              onClick={() => onTabClick(tab.key)}
              active={activeTab === tab.key}
              showLabel
              theme={mrTheme}
            />
          ))}
        </>
      )}

      {/* Separator before actions */}
      {showAllSections && <Sep theme={mrTheme} />}

      {/* More dropdown */}
      <Dropdown
        menu={{
          items: moreMenuItems,
          style: {
            background: mrTheme.backgroundTertiary,
            borderRadius: 8,
            border: `1px solid ${mrTheme.borderColor}`,
            padding: '4px 0',
            minWidth: 200,
          },
        }}
        trigger={['click']}
        placement="topRight"
        overlayClassName="meeting-room-more-dropdown"
      >
        <span>
          <TBtn icon={<MoreHorizontal size={ICON_SIZE} />} label="More" onClick={() => {}} theme={mrTheme} />
        </span>
      </Dropdown>

      {/* ── End / Hangup — red pill ── */}
      {(status === 'in_progress' || status === 'paused') && permissions.canEndMeeting && (
        <HangupBtn label="End Meeting" onClick={confirmEnd} theme={mrTheme} />
      )}
    </div>
  );
};

export default React.memo(BottomControlBar);
