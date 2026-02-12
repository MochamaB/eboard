/**
 * Meeting Room Layout — Two-Sidebar Architecture
 * 
 * Two distinct layouts based on meeting status:
 * 
 * 1. PRE-MEETING (waiting/starting):
 *    - LEFT: PreMeetingLobby sidebar (board logo, join controls, mode-aware)
 *    - CENTER: Meeting Notice Document (execution mode)
 *    - BOTTOM: Floating toolbar (always present)
 *    - Mobile/Tablet: Lobby sidebar takes full width, notice hidden
 * 
 * 2. IN-MEETING (in_progress/paused/ended):
 *    Three-column layout with decoupled center content:
 *    - LEFT SIDEBAR: Utility panels (Voting, Minutes, Chat, Notes)
 *    - CENTER: Priority-based content (Document Cast > Active Vote > Current Agenda Item > Placeholder)
 *    - RIGHT SIDEBAR: Governance panels (Agenda, Participants, Documents, Notice)
 *    - BOTTOM: Floating toolbar with auto-hide
 * 
 * Key design principle:
 *   The center content is controlled ONLY by roomState (host actions),
 *   never by which sidebar tab is open. Sidebars are personal browsing views.
 * 
 * Responsive behavior:
 *   Desktop (lg+): Both sidebars can be open simultaneously
 *   Tablet (md): Only one sidebar at a time
 *   Mobile (< md): Sidebar opens as full-width overlay, one at a time
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { useMeetingRoom } from '../../../contexts/MeetingRoomContext';
import { useBoardContext } from '../../../contexts';
import { useMeetingRoomTheme } from './MeetingRoomThemeContext';
import { useResponsive } from '../../../contexts/ResponsiveContext';
import { useAgenda } from '../../../hooks/api/useAgenda';
import { getTypographyCSS } from '../../../styles/responsive';
import { MeetingNoticeDocument } from '../../../components/Meetings';
import type { RightPanelTab, LeftPanelTab } from '../../../types/meetingRoom.types';
import type { MeetingRoomTheme } from './meetingRoomTheme';
import BottomControlBar from './components/BottomControlBar';
import PreMeetingLobby from './components/PreMeetingLobby';
import ActiveAgendaContent from './components/ActiveAgendaContent';
import DocumentPreview from './components/DocumentPreview';
import RoomNoticePanel from './components/RoomNoticePanel';
import RoomAgendaPanel from './components/RoomAgendaPanel';
import SidePanelParticipants from './components/SidePanelParticipants';
import SidePanelDocuments from './components/SidePanelDocuments';
import SidePanelVoting from './components/SidePanelVoting';
import SidePanelMinutes from './components/SidePanelMinutes';

// ============================================================================
// CONSTANTS
// ============================================================================

const AUTO_HIDE_MS = 4000;
const PANEL_WIDTH = 360;
const PANEL_WIDTH_MOBILE = '100%';
const LOBBY_WIDTH = 280;

const RIGHT_TAB_LABELS: Record<RightPanelTab, string> = {
  agenda: 'Agenda',
  participants: 'Participants',
  documents: 'Documents',
  notice: 'Details',
};

const LEFT_TAB_LABELS: Record<LeftPanelTab, string> = {
  voting: 'Voting',
  minutes: 'Minutes',
  chat: 'Chat',
  notes: 'Notes',
};

// Which tabs belong to which sidebar
const RIGHT_TABS: Set<string> = new Set(['agenda', 'participants', 'documents', 'notice']);
const LEFT_TABS: Set<string> = new Set(['voting', 'minutes', 'chat', 'notes']);

// ============================================================================
// SIDEBAR CONTAINER (reusable for left and right)
// ============================================================================

interface SidebarContainerProps {
  open: boolean;
  label: string;
  onClose: () => void;
  side: 'left' | 'right';
  isMobile: boolean;
  theme: MeetingRoomTheme;
  children: React.ReactNode;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  open,
  label,
  onClose,
  side,
  isMobile,
  theme: t,
  children,
}) => {
  const panelWidth = isMobile ? PANEL_WIDTH_MOBILE : PANEL_WIDTH;
  const borderSide = side === 'left' ? 'borderRight' : 'borderLeft';

  return (
    <div style={{
      width: open ? panelWidth : 0,
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: t.backgroundSecondary,
      [borderSide]: open ? `1px solid ${t.borderColor}` : 'none',
      // Mobile: overlay positioning
      ...(isMobile && open ? {
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        [side]: 0,
        zIndex: 200,
        width: '100%',
      } : {}),
    }}>
      {/* Panel Header */}
      <div style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: `1px solid ${t.borderColor}`,
        flexShrink: 0,
        background: t.backgroundTertiary,
      }}>
        <span style={{ color: t.textPrimary, ...getTypographyCSS('h4') }}>
          {label}
        </span>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: 'none', background: 'transparent', color: t.textTertiary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = t.backgroundHover)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <X size={18} />
        </button>
      </div>

      {/* Panel Content */}
      <div
        className="meeting-room-scrollable"
        style={{
          flex: 1,
          overflow: 'auto',
          minWidth: isMobile ? '100vw' : PANEL_WIDTH,
        }}
      >
        {open && children}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT
// ============================================================================

const MeetingRoomLayout: React.FC = () => {
  const mrTheme = useMeetingRoomTheme();
  const { roomState, actions } = useMeetingRoom();
  const { currentBoard, theme, logo } = useBoardContext();
  const { meeting, status, duration } = roomState;
  const { isMobile, isTablet } = useResponsive();
  const isSmallScreen = isMobile || isTablet;

  // Has the user "joined" (clicked Join/Start in lobby)?
  const [hasJoined, setHasJoined] = useState(false);

  // Two independent sidebar states
  const [rightPanel, setRightPanel] = useState<{ open: boolean; tab: RightPanelTab }>({
    open: false,
    tab: 'agenda',
  });
  const [leftPanel, setLeftPanel] = useState<{ open: boolean; tab: LeftPanelTab }>({
    open: false,
    tab: 'voting',
  });

  // Auto-hide state for toolbar + header (in-meeting only)
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch agenda for notice document (pre-meeting)
  const { data: agendaData } = useAgenda(meeting?.id || '');
  const agendaItems = agendaData?.items || [];

  // Determine if we're in pre-meeting phase
  const isPreMeeting = (status === 'waiting' || status === 'starting') && !hasJoined;

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), AUTO_HIDE_MS);
  }, []);

  // Mouse movement auto-hide (only active when not in pre-meeting)
  useEffect(() => {
    if (isPreMeeting) {
      setControlsVisible(true);
      return;
    }
    const handler = () => resetHideTimer();
    window.addEventListener('mousemove', handler);
    window.addEventListener('mousedown', handler);
    resetHideTimer();
    return () => {
      window.removeEventListener('mousemove', handler);
      window.removeEventListener('mousedown', handler);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [resetHideTimer, isPreMeeting]);

  // ── Sidebar toggle handlers ──

  const handleRightTabClick = useCallback((tab: RightPanelTab) => {
    setRightPanel(prev => {
      if (prev.open && prev.tab === tab) {
        return { ...prev, open: false };
      }
      return { open: true, tab };
    });
    // On tablet: close left panel when opening right
    if (isTablet) {
      setLeftPanel(prev => ({ ...prev, open: false }));
    }
    // On mobile: close left panel when opening right
    if (isMobile) {
      setLeftPanel(prev => ({ ...prev, open: false }));
    }
  }, [isTablet, isMobile]);

  const handleLeftTabClick = useCallback((tab: LeftPanelTab) => {
    setLeftPanel(prev => {
      if (prev.open && prev.tab === tab) {
        return { ...prev, open: false };
      }
      return { open: true, tab };
    });
    // On tablet: close right panel when opening left
    if (isTablet) {
      setRightPanel(prev => ({ ...prev, open: false }));
    }
    // On mobile: close right panel when opening left
    if (isMobile) {
      setRightPanel(prev => ({ ...prev, open: false }));
    }
  }, [isTablet, isMobile]);

  // Unified handler for BottomControlBar (routes to correct sidebar)
  const handleTabClick = useCallback((tabKey: string) => {
    if (RIGHT_TABS.has(tabKey)) {
      handleRightTabClick(tabKey as RightPanelTab);
    } else if (LEFT_TABS.has(tabKey)) {
      handleLeftTabClick(tabKey as LeftPanelTab);
    }
  }, [handleRightTabClick, handleLeftTabClick]);

  const handleJoin = () => {
    setHasJoined(true);
    // If host and status is waiting, trigger start meeting
    if (status === 'waiting') {
      actions.startMeeting().catch(err => console.error('Start failed:', err));
    }
  };

  const handleLeave = () => {
    window.close();
  };

  // ── Render sidebar content ──

  const renderRightPanelContent = () => {
    switch (rightPanel.tab) {
      case 'agenda': return <RoomAgendaPanel />;
      case 'participants': return <SidePanelParticipants />;
      case 'documents': return <SidePanelDocuments />;
      case 'notice': return <RoomNoticePanel />;
      default: return null;
    }
  };

  const renderLeftPanelContent = () => {
    switch (leftPanel.tab) {
      case 'voting': return <SidePanelVoting />;
      case 'minutes': return <SidePanelMinutes />;
      case 'chat':
        return <div style={{ padding: 24, color: mrTheme.textTertiary, textAlign: 'center', ...getTypographyCSS('text') }}>Chat — Coming soon</div>;
      case 'notes':
        return <div style={{ padding: 24, color: mrTheme.textTertiary, textAlign: 'center', ...getTypographyCSS('text') }}>Notes — Coming soon</div>;
      default: return null;
    }
  };

  // ── Render center content (priority-based, decoupled from sidebars) ──

  const renderCenterContent = () => {
    // Priority 1: Document being cast
    if (roomState.castingDocument) {
      return <DocumentPreview />;
    }

    // Priority 2: Current agenda item (always shown when available)
    // Active vote overlays on top of this via ActiveVotePanel (future)
    if (roomState.currentAgendaItemId) {
      return <ActiveAgendaContent />;
    }

    // Priority 3: No agenda item — waiting placeholder
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: mrTheme.primaryColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...getTypographyCSS('h1'), fontWeight: 300, color: mrTheme.primaryContrast, userSelect: 'none',
          opacity: 0.6,
        }}>
          {(meeting?.title || 'M')[0].toUpperCase()}
        </div>
        <span style={{ color: mrTheme.textTertiary, ...getTypographyCSS('text') }}>
          Waiting for the host to navigate to an agenda item
        </span>
      </div>
    );
  };

  // Format duration
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const secs = duration % 60;
  const timeStr = hours > 0
    ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins}:${secs.toString().padStart(2, '0')}`;

  // Compute active tab for BottomControlBar highlight
  const activeTabForToolbar = rightPanel.open
    ? rightPanel.tab
    : leftPanel.open
      ? leftPanel.tab
      : undefined;

  // ========================================================================
  // PRE-MEETING LAYOUT
  // ========================================================================
  if (isPreMeeting) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: mrTheme.backgroundPrimary,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* LEFT: Lobby Sidebar */}
        <div style={{
          width: isSmallScreen ? '100%' : LOBBY_WIDTH,
          flexShrink: 0,
          borderRight: isSmallScreen ? 'none' : `1px solid ${mrTheme.borderColor}`,
          overflow: 'hidden',
        }}>
          <PreMeetingLobby onJoin={handleJoin} onLeave={handleLeave} />
        </div>

        {/* CENTER: Meeting Notice Document (hidden on mobile/tablet) */}
        {!isSmallScreen && (
          <div style={{
            flex: 1,
            overflow: 'auto',
            background: mrTheme.backgroundPrimary,
            padding: 32,
            display: 'flex',
            justifyContent: 'center',
          }}>
            {meeting && (
              <div style={{ maxWidth: 800, width: '100%' }}>
                <MeetingNoticeDocument
                  meeting={meeting}
                  board={currentBoard}
                  branding={theme}
                  contactInfo={currentBoard?.contactInfo}
                  logoUrl={logo}
                  mode="execution"
                  agendaItems={agendaItems}
                  compact={false}
                />
              </div>
            )}
          </div>
        )}

        {/* BOTTOM TOOLBAR (always visible in pre-meeting) */}
        <BottomControlBar
          activeTab={undefined}
          onTabClick={handleTabClick}
          visible={true}
        />
      </div>
    );
  }

  // ========================================================================
  // IN-MEETING LAYOUT (in_progress / paused / ending / ended)
  // Three-column: [Left Sidebar] [Center Content] [Right Sidebar]
  // ========================================================================
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: mrTheme.backgroundPrimary,
      overflow: 'hidden',
      cursor: controlsVisible ? 'default' : 'none',
      display: 'flex',
    }}>

      {/* ── LEFT SIDEBAR: Utility panels (Voting, Minutes, Chat, Notes) ── */}
      <SidebarContainer
        open={leftPanel.open}
        label={LEFT_TAB_LABELS[leftPanel.tab]}
        onClose={() => setLeftPanel(prev => ({ ...prev, open: false }))}
        side="left"
        isMobile={isMobile}
        theme={mrTheme}
      >
        {renderLeftPanelContent()}
      </SidebarContainer>

      {/* ── CENTER: Main content area ── */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>

        {/* HEADER (Jitsi-style transparent overlay, auto-hides) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          zIndex: 90,
          background: mrTheme.themeMode === 'dark'
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, transparent 100%)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          opacity: controlsVisible ? 1 : 0,
          transform: controlsVisible ? 'translateY(0)' : 'translateY(-20px)',
          pointerEvents: controlsVisible ? 'auto' : 'none',
        }}>
          <span style={{
            color: mrTheme.textPrimary,
            ...getTypographyCSS('h4'),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '40%',
          }}>
            {meeting?.title || 'Meeting Room'}
          </span>
          <span style={{ color: mrTheme.infoColor, fontFamily: 'monospace', ...getTypographyCSS('text') }}>
            {timeStr}
          </span>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', border: `1px solid ${mrTheme.borderColorStrong}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            ...getTypographyCSS('sectionLabel'), color: mrTheme.textTertiary, cursor: 'pointer',
          }}>
            🔒
          </span>
        </div>

        {/* MAIN CONTENT — priority-based, decoupled from sidebars */}
        {renderCenterContent()}

        {/* FLOATING BOTTOM TOOLBAR */}
        <BottomControlBar
          activeTab={activeTabForToolbar}
          onTabClick={handleTabClick}
          visible={controlsVisible}
        />
      </div>

      {/* ── RIGHT SIDEBAR: Governance panels (Agenda, Participants, Documents, Notice) ── */}
      <SidebarContainer
        open={rightPanel.open}
        label={RIGHT_TAB_LABELS[rightPanel.tab]}
        onClose={() => setRightPanel(prev => ({ ...prev, open: false }))}
        side="right"
        isMobile={isMobile}
        theme={mrTheme}
      >
        {renderRightPanelContent()}
      </SidebarContainer>
    </div>
  );
};

export default React.memo(MeetingRoomLayout);
