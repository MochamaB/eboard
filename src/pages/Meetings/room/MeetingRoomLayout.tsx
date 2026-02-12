/**
 * Meeting Room Layout — Phase-Aware Jitsi Meet-style
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
 *    - CENTER: Video placeholder / content area (Jitsi-style, auto-hide header)
 *    - RIGHT: Side panels toggle from toolbar
 *    - BOTTOM: Floating toolbar with auto-hide
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, User, Paperclip } from 'lucide-react';
import { Typography, Space, Tag } from 'antd';
import { useMeetingRoom } from '../../../contexts/MeetingRoomContext';
import { useBoardContext } from '../../../contexts';
import { useMeetingRoomTheme } from './MeetingRoomThemeContext';
import { useResponsive } from '../../../contexts/ResponsiveContext';
import { useAgenda } from '../../../hooks/api/useAgenda';
import { MeetingNoticeDocument } from '../../../components/Meetings';
import { ItemNumberBadge, ItemTypeTag } from '../../../components/common';
import { AgendaItemDocuments, AgendaItemVotes } from '../agenda/components';
import { getChildItems, generateHierarchicalNumber } from '../../../utils/agendaHierarchy';
import type { SidePanelTab, MeetingRoomState } from '../../../types/meetingRoom.types';
import type { Agenda } from '../../../types/agenda.types';
import type { Board, BoardBranding } from '../../../types/board.types';
import BottomControlBar from './components/BottomControlBar';
import PreMeetingLobby from './components/PreMeetingLobby';
import SidePanelNotice from './components/SidePanelNotice';
import SidePanelAgenda from './components/SidePanelAgenda';
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

const TAB_LABELS: Record<SidePanelTab, string> = {
  notice: 'Notice',
  agenda: 'Agenda',
  participants: 'Participants',
  documents: 'Documents',
  voting: 'Voting',
  minutes: 'Minutes',
  chat: 'Chat',
  notes: 'Notes',
};

// ============================================================================
// ACTIVE AGENDA ITEM — Main Content Area
// ============================================================================

const { Text } = Typography;

interface ActiveAgendaContentProps {
  roomState: MeetingRoomState;
  agendaData?: Agenda;
  meeting: MeetingRoomState['meeting'];
  currentBoard: Board;
  theme: BoardBranding;
}

const ActiveAgendaContent: React.FC<ActiveAgendaContentProps> = ({
  roomState,
  agendaData,
  meeting,
  currentBoard,
  theme,
}) => {
  const { currentAgendaItemId, currentAgendaItem, agendaItems } = roomState;
  const item = currentAgendaItem;

  if (!item || !currentAgendaItemId) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#888',
      }}>
        No active agenda item
      </div>
    );
  }

  const hierarchicalNumber = generateHierarchicalNumber(item, agendaItems);
  const children = getChildItems(item.id, agendaItems);
  const hasChildren = children.length > 0;
  const meetingId = meeting?.id || '';
  const boardId = currentBoard?.id || '';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'auto',
      background: '#121212',
      padding: 32,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        {/* Item Card */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          {/* Header: Item Number + Title + Type */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <ItemNumberBadge number={hierarchicalNumber} isParent={!item.parentItemId} size="large" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Typography.Title level={4} style={{ margin: 0, color: theme.textPrimary }}>
                  {item.title}
                </Typography.Title>
                <ItemTypeTag type={item.itemType} />
                {item.isAdHoc && (
                  <Tag color="orange" style={{ fontSize: 11 }}>AD-HOC</Tag>
                )}
              </div>

              {/* Metadata row */}
              <Space size="middle" style={{ marginTop: 8, fontSize: 13, color: theme.textSecondary }}>
                {item.estimatedDuration && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    {item.estimatedDuration}m
                  </span>
                )}
                {item.presenterName && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={14} />
                    {item.presenterName}
                  </span>
                )}
                {item.attachedDocumentIds && item.attachedDocumentIds.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Paperclip size={14} />
                    {item.attachedDocumentIds.length} document{item.attachedDocumentIds.length !== 1 ? 's' : ''}
                  </span>
                )}
              </Space>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div style={{
              marginBottom: 20,
              padding: 16,
              background: theme.backgroundTertiary || '#fafafa',
              borderRadius: 8,
              borderLeft: `3px solid ${theme.primaryColor}`,
            }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary, whiteSpace: 'pre-wrap' }}>
                {item.description}
              </Text>
            </div>
          )}

          {/* Documents */}
          <AgendaItemDocuments
            agendaItemId={item.id}
            mode="execute"
            boardId={boardId}
            meetingId={meetingId}
          />

          {/* Votes */}
          {agendaData && (
            <AgendaItemVotes
              agendaItemId={item.id}
              agendaId={agendaData.id}
              meetingId={meetingId}
              boardId={boardId}
              mode="execute"
              agendaItems={agendaItems.map(ai => ({
                id: ai.id,
                title: ai.title,
                itemNumber: ai.itemNumber,
                parentItemId: ai.parentItemId ?? null,
              }))}
            />
          )}

          {/* Sub-items */}
          {hasChildren && (
            <div style={{ marginTop: 20 }}>
              <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
                Sub-Items ({children.length})
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {children.map(child => {
                  const childNumber = generateHierarchicalNumber(child, agendaItems);
                  return (
                    <div
                      key={child.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: `1px solid ${theme.borderColor || '#e8e8e8'}`,
                        background: theme.backgroundSecondary || '#fafafa',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ItemNumberBadge number={childNumber} isParent={false} size="small" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: 13, fontWeight: 500 }}>{child.title}</Text>
                          <Space size="small" style={{ display: 'flex', marginTop: 4, fontSize: 12, color: theme.textSecondary }}>
                            <ItemTypeTag type={child.itemType} size="small" showIcon={false} />
                            {child.estimatedDuration && (
                              <span><Clock size={12} /> {child.estimatedDuration}m</span>
                            )}
                            {child.presenterName && (
                              <span><User size={12} /> {child.presenterName}</span>
                            )}
                          </Space>
                        </div>
                        {child.status === 'completed' && (
                          <Tag color="green" style={{ fontSize: 11 }}>Done</Tag>
                        )}
                        {child.status === 'skipped' && (
                          <Tag style={{ fontSize: 11 }}>Skipped</Tag>
                        )}
                      </div>
                      {child.description && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                          {child.description}
                        </Text>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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

  // Side panel state (for in-meeting)
  const [activeTab, setActiveTab] = useState<SidePanelTab>('agenda');
  const [panelOpen, setPanelOpen] = useState(false);

  // Auto-hide state for toolbar + header (in-meeting only)
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch agenda for notice document
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

  // Toggle panel: same tab = close, different tab = open to that tab
  const handleTabClick = (tabKey: SidePanelTab) => {
    if (panelOpen && activeTab === tabKey) {
      setPanelOpen(false);
    } else {
      setActiveTab(tabKey);
      setPanelOpen(true);
    }
  };

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

  const renderPanelContent = () => {
    switch (activeTab) {
      case 'notice': return <SidePanelNotice />;
      case 'agenda': return <SidePanelAgenda />;
      case 'participants': return <SidePanelParticipants />;
      case 'documents': return <SidePanelDocuments />;
      case 'voting': return <SidePanelVoting />;
      case 'minutes': return <SidePanelMinutes />;
      case 'chat':
        return <div style={{ padding: 24, color: '#888', textAlign: 'center' }}>Chat — Coming soon</div>;
      case 'notes':
        return <div style={{ padding: 24, color: '#888', textAlign: 'center' }}>Notes — Coming soon</div>;
      default: return null;
    }
  };

  // Format duration
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const secs = duration % 60;
  const timeStr = hours > 0
    ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins}:${secs.toString().padStart(2, '0')}`;

  const panelWidth = isMobile ? PANEL_WIDTH_MOBILE : PANEL_WIDTH;

  // ========================================================================
  // PRE-MEETING LAYOUT
  // ========================================================================
  if (isPreMeeting) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* LEFT: Lobby Sidebar */}
        <div style={{
          width: isSmallScreen ? '100%' : LOBBY_WIDTH,
          flexShrink: 0,
          borderRight: isSmallScreen ? 'none' : '1px solid #2a2a2a',
          overflow: 'hidden',
        }}>
          <PreMeetingLobby onJoin={handleJoin} onLeave={handleLeave} />
        </div>

        {/* CENTER: Meeting Notice Document (hidden on mobile/tablet) */}
        {!isSmallScreen && (
          <div style={{
            flex: 1,
            overflow: 'auto',
            background: '#121212',
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
  // ========================================================================
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#000',
      overflow: 'hidden',
      cursor: controlsVisible ? 'default' : 'none',
      display: 'flex',
    }}>

      {/* ── LEFT: Main area (black + avatar + overlays) ── */}
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
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          opacity: controlsVisible ? 1 : 0,
          transform: controlsVisible ? 'translateY(0)' : 'translateY(-20px)',
          pointerEvents: controlsVisible ? 'auto' : 'none',
        }}>
          <span style={{
            color: '#e0e0e0',
            fontSize: 14,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '40%',
          }}>
            {meeting?.title || 'Meeting Room'}
          </span>
          <span style={{ color: '#8ab4f8', fontFamily: 'monospace', fontSize: 13 }}>
            {timeStr}
          </span>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', border: '1px solid #555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#888', cursor: 'pointer',
          }}>
            🔒
          </span>
        </div>

        {/* MAIN CONTENT — context-aware */}
        {panelOpen && activeTab === 'notice' && meeting ? (
          /* Notice Document in main content when notice panel is active */
          <div style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            background: '#121212',
            padding: 32,
            display: 'flex',
            justifyContent: 'center',
          }}>
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
          </div>
        ) : panelOpen && activeTab === 'agenda' && roomState.currentAgendaItemId ? (
          /* Active Agenda Item in main content when agenda panel is active */
          <ActiveAgendaContent
            roomState={roomState}
            agendaData={agendaData}
            meeting={meeting}
            currentBoard={currentBoard}
            theme={theme}
          />
        ) : (
          /* Default: centered avatar (future: Jitsi video) */
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 200, height: 200, borderRadius: '50%',
              background: mrTheme.primaryColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 80, fontWeight: 300, color: '#fff', userSelect: 'none',
            }}>
              {(meeting?.title || 'M')[0].toUpperCase()}
            </div>
          </div>
        )}

        {/* FLOATING BOTTOM TOOLBAR */}
        <BottomControlBar
          activeTab={panelOpen ? activeTab : undefined}
          onTabClick={handleTabClick}
          visible={controlsVisible}
        />
      </div>

      {/* ── RIGHT: Side Panel (dark, slides in) ── */}
      <div style={{
        width: panelOpen ? panelWidth : 0,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a1a',
        borderLeft: panelOpen ? '1px solid #2a2a2a' : 'none',
      }}>
        {/* Panel Header */}
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid #2a2a2a',
          flexShrink: 0,
          background: '#1e1e1e',
        }}>
          <span style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>
            {TAB_LABELS[activeTab]}
          </span>
          <button
            onClick={() => setPanelOpen(false)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: 'none', background: 'transparent', color: '#999',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          minWidth: isMobile ? '100vw' : PANEL_WIDTH,
        }}>
          {panelOpen && renderPanelContent()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MeetingRoomLayout);
