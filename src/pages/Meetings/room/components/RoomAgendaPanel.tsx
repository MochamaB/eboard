/**
 * RoomAgendaPanel — Agenda sidebar panel for the live meeting room
 *
 * Custom Tier 3 component that replaces SidePanelAgenda.
 * Same design/layout as the original SidePanelAgenda but with full
 * dark/light theme support via useMeetingRoomTheme() — no Ant Design
 * Text components (which ignore theme tokens).
 *
 * In dark mode, accent color uses successColor (bright green) instead
 * of board primaryColor (which is too dark on dark backgrounds).
 */

import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import {
  CheckOutlined,
  CaretRightFilled,
  ClockCircleOutlined,
  UserOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { ChevronLeft, ChevronRight, Check, SkipForward } from 'lucide-react';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import type { MeetingRoomTheme } from '../meetingRoomTheme';
import type { AgendaItem } from '../../../../types/agenda.types';

// ============================================================================
// HELPERS
// ============================================================================

/** In dark mode use successColor (bright green); in light mode use board primaryColor */
const accent = (t: MeetingRoomTheme) =>
  t.themeMode === 'dark' ? t.successColor : t.primaryColor;

/** 25% opacity tint of the accent color for current-item background */
const accentBg = (t: MeetingRoomTheme) => {
  const c = accent(t);
  // If hex, parse to rgba
  if (c.startsWith('#') && c.length >= 7) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.18)`;
  }
  return c;
};

// ============================================================================
// ROOM AGENDA PANEL
// ============================================================================

const RoomAgendaPanel: React.FC = () => {
  const { roomState, actions, capabilities } = useMeetingRoom();
  const t = useMeetingRoomTheme();
  const { isMobile } = useResponsive();
  const { agendaItems, currentAgendaItemId } = roomState;
  const permissions = useMeetingRoomPermissions();

  const canNavigate = capabilities.canNavigateAgenda && permissions.canNavigateAgenda;
  const canMark = capabilities.canMarkItemDiscussed && permissions.canMarkItemDiscussed;
  const canDefer = capabilities.canDeferItem && permissions.canDeferItem;

  const currentIndex = agendaItems.findIndex(item => item.id === currentAgendaItemId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < agendaItems.length - 1;

  const itemPadding = isMobile ? 8 : 12;
  const accentColor = accent(t);
  const currentBg = accentBg(t);

  // Build hierarchical structure: parent items with their children grouped
  const hierarchicalItems = useMemo(() => {
    const parents: AgendaItem[] = [];
    const childrenMap = new Map<string, AgendaItem[]>();

    for (const item of agendaItems) {
      if (item.parentItemId) {
        const siblings = childrenMap.get(item.parentItemId) || [];
        siblings.push(item);
        childrenMap.set(item.parentItemId, siblings);
      } else {
        parents.push(item);
      }
    }

    const result: { item: AgendaItem; isChild: boolean }[] = [];
    for (const parent of parents) {
      result.push({ item: parent, isChild: false });
      const children = childrenMap.get(parent.id) || [];
      for (const child of children) {
        result.push({ item: child, isChild: true });
      }
    }
    return result;
  }, [agendaItems]);

  const handlePrevItem = () => {
    if (canGoPrev) actions.navigateToItem(agendaItems[currentIndex - 1].id);
  };
  const handleNextItem = () => {
    if (canGoNext) actions.navigateToItem(agendaItems[currentIndex + 1].id);
  };

  const getItemStatusIcon = (item: typeof agendaItems[0]) => {
    if (item.id === currentAgendaItemId) {
      return <CaretRightFilled style={{ color: accentColor }} />;
    }
    if (item.status === 'completed') {
      return <CheckOutlined style={{ color: t.successColor }} />;
    }
    if (item.status === 'skipped') {
      return <span style={{ color: t.textTertiary, ...getTypographyCSS('textSm') }}>—</span>;
    }
    return <span style={{
      display: 'inline-block',
      width: 14, height: 14,
      borderRadius: '50%',
      border: `2px solid ${t.borderColor}`,
    }} />;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Agenda List */}
      <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? 12 : 16 }}>
        <span style={{
          display: 'block', marginBottom: 12,
          color: t.textPrimary,
          ...getTypographyCSS('h4'),
        }}>
          Agenda
        </span>

        {hierarchicalItems.length === 0 ? (
          <div style={{
            padding: 24, textAlign: 'center',
            color: t.textTertiary, ...getTypographyCSS('text'),
          }}>
            No agenda items
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
            {hierarchicalItems.map(({ item, isChild }) => {
              const isCurrent = item.id === currentAgendaItemId;
              const docCount = item.attachedDocumentIds?.length || 0;
              return (
                <div
                  key={item.id}
                  style={{
                    padding: itemPadding,
                    borderRadius: 8,
                    border: isCurrent
                      ? `1.5px solid ${accentColor}`
                      : `1px solid ${t.borderColorLight}`,
                    background: isCurrent ? currentBg : t.backgroundSecondary,
                    cursor: canNavigate ? 'pointer' : 'default',
                    opacity: item.status === 'completed' ? 0.6 : 1,
                    transition: 'background 0.15s, border-color 0.15s',
                    marginLeft: isChild ? (isMobile ? 20 : 28) : 0,
                  }}
                  onClick={() => canNavigate && actions.navigateToItem(item.id)}
                >
                  {/* Row 1: Status icon + Title + Clock */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
                    <div style={{ flexShrink: 0 }}>
                      {getItemStatusIcon(item)}
                    </div>
                    <span style={{
                      flex: 1, minWidth: 0,
                      ...getTypographyCSS('textLg'),
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCurrent ? accentColor : t.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.itemNumber}. {item.title}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                    }}>
                      <ClockCircleOutlined style={{ ...getTypographyCSS('caption'), color: t.textTertiary }} />
                      <span style={{ color: t.textSecondary, ...getTypographyCSS('textSm') }}>
                        {item.estimatedDuration}m
                      </span>
                    </span>
                  </div>

                  {/* Row 2: Metadata — presenter, documents */}
                  {(item.presenterName || docCount > 0) && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      marginTop: 4, paddingLeft: 26,
                    }}>
                      {item.presenterName && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          color: t.textTertiary, ...getTypographyCSS('textSm'),
                        }}>
                          <UserOutlined style={{ ...getTypographyCSS('textSm') }} />
                          {item.presenterName}
                        </span>
                      )}
                      {docCount > 0 && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          color: t.textTertiary, ...getTypographyCSS('textSm'),
                        }}>
                          <PaperClipOutlined style={{ ...getTypographyCSS('textSm') }} />
                          {docCount} {docCount === 1 ? 'document' : 'documents'}
                        </span>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Controls — icon-only bar */}
      {canNavigate && (
        <div style={{
          borderTop: `1px solid ${t.borderColor}`,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          background: t.backgroundSecondary,
        }}>
          <NavButton icon={<ChevronLeft size={18} />} tooltip="Previous Item"
            disabled={!canGoPrev} onClick={handlePrevItem} theme={t} />
          <NavButton icon={<ChevronRight size={18} />} tooltip="Next Item"
            disabled={!canGoNext} onClick={handleNextItem} theme={t} />
          <div style={{ width: 1, height: 20, background: t.borderColor, margin: '0 4px' }} />
          <NavButton icon={<Check size={18} />} tooltip="Mark Discussed"
            disabled={!currentAgendaItemId || !canMark}
            onClick={() => currentAgendaItemId && actions.markItemDiscussed(currentAgendaItemId)}
            theme={t} activeColor={t.successColor} />
          <NavButton icon={<SkipForward size={18} />} tooltip="Defer Item"
            disabled={!currentAgendaItemId || !canDefer}
            onClick={() => currentAgendaItemId && actions.deferItem(currentAgendaItemId)}
            theme={t} activeColor={t.warningColor} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// NAV BUTTON (bottom bar)
// ============================================================================

const NavButton: React.FC<{
  icon: React.ReactNode;
  tooltip: string;
  disabled: boolean;
  onClick: () => void;
  theme: MeetingRoomTheme;
  activeColor?: string;
}> = ({ icon, tooltip, disabled, onClick, theme: t, activeColor }) => {
  const color = disabled ? t.textDisabled : (activeColor || t.textPrimary);
  return (
    <Tooltip title={tooltip}>
      <button
        disabled={disabled}
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36,
          border: 'none', borderRadius: 6,
          background: 'transparent', color,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
          opacity: disabled ? 0.4 : 1,
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = t.backgroundHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {icon}
      </button>
    </Tooltip>
  );
};

export default React.memo(RoomAgendaPanel);
