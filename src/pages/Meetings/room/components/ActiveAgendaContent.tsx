/**
 * ActiveAgendaContent — Main content area for the live meeting room
 * 
 * Renders the current agenda item as a formal document-style brief,
 * suitable for PDF export. Sections:
 *   Header (item number + title + type + duration)
 *   Description
 *   Presenter
 *   Attached Documents
 *   Sub-Items
 *   Votes
 *   Action Items
 *   Resolutions
 *   ── Action Bar (host-only: Create Vote, Action Item, Resolution)
 * 
 * Uses useMeetingRoomTheme() for dark/light mode. No Ant Design layout
 * components — all native HTML styled with theme tokens.
 */

import React from 'react';
import {
  Clock,
  User,
  Paperclip,
  FileText,
  Vote,
  ListChecks,
  Gavel,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Plus,
} from 'lucide-react';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useBoardContext } from '../../../../contexts';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import { useAgenda } from '../../../../hooks/api/useAgenda';
import { useMeetingVotes } from '../../../../hooks/api/useVoting';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { getChildItems, generateHierarchicalNumber } from '../../../../utils/agendaHierarchy';
import type { MeetingRoomTheme } from '../meetingRoomTheme';
import type { AgendaItem } from '../../../../types/agenda.types';
import type { VoteWithResults } from '../../../../types/voting.types';

// ============================================================================
// HELPERS
// ============================================================================

const ITEM_TYPE_LABELS: Record<string, string> = {
  discussion: 'Discussion',
  decision: 'Decision',
  information: 'Information',
  committee_report: 'Committee Report',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
  deferred: 'Deferred',
};

/** Thin horizontal rule using theme border color */
const Divider: React.FC<{ t: MeetingRoomTheme; heavy?: boolean }> = ({ t, heavy }) => (
  <hr style={{
    border: 'none',
    borderTop: heavy
      ? `2px solid ${t.borderColorStrong}`
      : `1px solid ${t.borderColorLight}`,
    margin: heavy ? '28px 0' : '20px 0',
  }} />
);

/** Uppercase section heading */
const SectionHeading: React.FC<{
  t: MeetingRoomTheme;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ t, icon, children }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  }}>
    <span style={{ color: t.textTertiary, display: 'flex', alignItems: 'center' }}>{icon}</span>
    <span style={{
      ...getTypographyCSS('sectionLabel'),
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      color: t.textTertiary,
    }}>
      {children}
    </span>
  </div>
);

/** Empty-state placeholder text */
const EmptyText: React.FC<{ t: MeetingRoomTheme; children: React.ReactNode }> = ({ t, children }) => (
  <span style={{
    color: t.textDisabled,
    fontStyle: 'italic',
    ...getTypographyCSS('text'),
  }}>
    {children}
  </span>
);

/** Status dot + label for sub-items */
const StatusIndicator: React.FC<{ status: string; t: MeetingRoomTheme }> = ({ status, t }) => {
  const colorMap: Record<string, string> = {
    completed: t.successColor,
    in_progress: t.infoColor,
    skipped: t.textDisabled,
    deferred: t.warningColor,
    pending: t.textTertiary,
  };
  const color = colorMap[status] || t.textTertiary;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...getTypographyCSS('textSm'), color }}>
      {status === 'completed' ? <CheckCircle2 size={13} /> :
       status === 'skipped' ? <XCircle size={13} /> :
       <MinusCircle size={13} />}
      {STATUS_LABELS[status] || status}
    </span>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ActiveAgendaContent: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { currentBoard } = useBoardContext();
  const t = useMeetingRoomTheme();
  const { isMobile } = useResponsive();
  const permissions = useMeetingRoomPermissions();
  const { currentAgendaItemId, currentAgendaItem, agendaItems, meeting } = roomState;

  const meetingId = meeting?.id || '';
  const boardId = currentBoard?.id || '';

  // Fetch agenda + votes
  const { data: agendaData } = useAgenda(meetingId);
  const { data: votesData } = useMeetingVotes(meetingId);
  const allVotes = Array.isArray(votesData) ? votesData : [];

  const item = currentAgendaItem;

  // ── No active item placeholder ──
  if (!item || !currentAgendaItemId) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <span style={{ color: t.textSecondary, ...getTypographyCSS('textLg') }}>
          No active agenda item
        </span>
        <span style={{ color: t.textTertiary, ...getTypographyCSS('text') }}>
          Waiting for the host to navigate to an agenda item
        </span>
      </div>
    );
  }

  // ── Derived data ──
  const hierarchicalNumber = generateHierarchicalNumber(item, agendaItems);
  const children = getChildItems(item.id, agendaItems);
  const itemVotes = allVotes.filter(
    (v: VoteWithResults) => v.entityType === 'agenda_item' && v.entityId === item.id
  );
  const docCount = item.attachedDocumentIds?.length || 0;
  const isHost = permissions.canNavigateAgenda;
  const isDark = t.themeMode === 'dark';

  // ── Document page styling ──
  const pageBg = isDark ? t.card : '#ffffff';
  const pageBorder = isDark ? t.borderColor : '#e0e0e0';
  const pageShadow = isDark
    ? '0 1px 4px rgba(0,0,0,0.4)'
    : '0 1px 8px rgba(0,0,0,0.08)';

  return (
    <div
      className="meeting-room-scrollable"
      style={{
        width: '100%', height: '100%', overflow: 'auto',
        background: t.backgroundPrimary,
        padding: isMobile ? 12 : 32,
        display: 'flex', justifyContent: 'center',
      }}
    >
      {/* Document page */}
      <div style={{
        maxWidth: 780, width: '100%',
        background: pageBg,
        border: `1px solid ${pageBorder}`,
        boxShadow: pageShadow,
        padding: isMobile ? '24px 20px' : '40px 48px',
        minHeight: 'fit-content',
        alignSelf: 'flex-start',
      }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: 4 }}>
          <span style={{
            ...getTypographyCSS('sectionLabel'),
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: t.textTertiary,
          }}>
            Agenda Item {hierarchicalNumber}
          </span>
        </div>

        <h1 style={{
          margin: '4px 0 0 0',
          ...getTypographyCSS(isMobile ? 'h2' : 'h1'),
          fontWeight: 600,
          color: t.textPrimary,
        }}>
          {item.title}
        </h1>

        {/* Meta line: type · duration · ad-hoc */}
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap',
          gap: 16, marginTop: 12,
          ...getTypographyCSS('text'), color: t.textSecondary,
        }}>
          <span style={{
            padding: '2px 10px',
            borderRadius: 3,
            ...getTypographyCSS('textSm'), fontWeight: 500,
            background: isDark ? t.backgroundTertiary : '#f0f0f0',
            color: isDark ? t.textSecondary : '#555',
            border: `1px solid ${isDark ? t.borderColor : '#ddd'}`,
          }}>
            {ITEM_TYPE_LABELS[item.itemType] || item.itemType}
          </span>
          {item.estimatedDuration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} />
              {item.estimatedDuration} minutes
            </span>
          )}
          {item.isAdHoc && (
            <span style={{
              padding: '2px 8px', borderRadius: 3,
              ...getTypographyCSS('sectionLabel'),
              background: t.warningLight,
              color: t.warningColor,
            }}>
              AD-HOC
            </span>
          )}
        </div>

        <Divider t={t} />

        {/* ═══ DESCRIPTION ═══ */}
        {item.description && (
          <>
            <SectionHeading t={t} icon={<FileText size={14} />}>Description</SectionHeading>
            <p style={{
              margin: 0,
              ...getTypographyCSS('textLg'),
              color: t.textPrimary,
              whiteSpace: 'pre-wrap',
            }}>
              {item.description}
            </p>
            <Divider t={t} />
          </>
        )}

        {/* ═══ PRESENTER ═══ */}
        <SectionHeading t={t} icon={<User size={14} />}>Presenter</SectionHeading>
        {item.presenterName ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            ...getTypographyCSS('textLg'), color: t.textPrimary,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: isDark ? t.backgroundTertiary : '#e8e8e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.textSecondary,
            }}>
              <User size={16} />
            </div>
            <span style={{ fontWeight: 500 }}>{item.presenterName}</span>
          </div>
        ) : (
          <EmptyText t={t}>No presenter assigned</EmptyText>
        )}

        <Divider t={t} />

        {/* ═══ ATTACHED DOCUMENTS ═══ */}
        <SectionHeading t={t} icon={<Paperclip size={14} />}>
          Attached Documents {docCount > 0 && `(${docCount})`}
        </SectionHeading>
        {docCount > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.attachedDocumentIds.map((docId: string, idx: number) => (
              <div key={docId} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px',
                borderRadius: 4,
                background: isDark ? t.backgroundTertiary : '#fafafa',
                border: `1px solid ${isDark ? t.borderColorLight : '#eee'}`,
                ...getTypographyCSS('text'), color: t.textPrimary,
                cursor: 'pointer',
              }}>
                <Paperclip size={13} style={{ color: t.textTertiary, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {docId}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyText t={t}>No documents attached to this item</EmptyText>
        )}

        <Divider t={t} />

        {/* ═══ SUB-ITEMS ═══ */}
        <SectionHeading t={t} icon={<ListChecks size={14} />}>
          Sub-Items {children.length > 0 && `(${children.length})`}
        </SectionHeading>
        {children.length > 0 ? (
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            ...getTypographyCSS('text'), color: t.textPrimary,
          }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.borderColorLight}` }}>
                <th style={{ ...thStyle(t), width: 50 }}>No.</th>
                <th style={{ ...thStyle(t), textAlign: 'left' }}>Title</th>
                <th style={{ ...thStyle(t), width: 80, textAlign: 'center' }}>Duration</th>
                <th style={{ ...thStyle(t), width: 100, textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child: AgendaItem) => {
                const childNum = generateHierarchicalNumber(child, agendaItems);
                return (
                  <tr key={child.id} style={{ borderBottom: `1px solid ${t.borderColorLight}` }}>
                    <td style={{ ...tdStyle(t), ...getTypographyCSS('text'), fontWeight: 500 }}>{childNum}</td>
                    <td style={tdStyle(t)}>
                      {child.title}
                      {child.presenterName && (
                        <span style={{ color: t.textTertiary, ...getTypographyCSS('textSm'), marginLeft: 8 }}>
                          — {child.presenterName}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle(t), textAlign: 'center', color: t.textSecondary }}>
                      {child.estimatedDuration ? `${child.estimatedDuration}m` : '—'}
                    </td>
                    <td style={{ ...tdStyle(t), textAlign: 'right' }}>
                      <StatusIndicator status={child.status} t={t} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyText t={t}>No sub-items under this agenda item</EmptyText>
        )}

        <Divider t={t} />

        {/* ═══ VOTES ═══ */}
        <SectionHeading t={t} icon={<Vote size={14} />}>
          Votes {itemVotes.length > 0 && `(${itemVotes.length})`}
        </SectionHeading>
        {itemVotes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {itemVotes.map((vote: VoteWithResults) => (
              <div key={vote.id} style={{
                padding: '10px 14px',
                borderRadius: 4,
                border: `1px solid ${isDark ? t.borderColor : '#e0e0e0'}`,
                background: isDark ? t.backgroundTertiary : '#fafafa',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  ...getTypographyCSS('text'), color: t.textPrimary,
                }}>
                  <span style={{ fontWeight: 500 }}>{vote.title}</span>
                  <span style={{
                    ...getTypographyCSS('caption'), fontWeight: 500,
                    padding: '1px 8px', borderRadius: 3,
                    background: vote.status === 'closed'
                      ? t.successLight : vote.status === 'open'
                      ? t.infoLight : t.backgroundQuaternary,
                    color: vote.status === 'closed'
                      ? t.successColor : vote.status === 'open'
                      ? t.infoColor : t.textSecondary,
                  }}>
                    {vote.status.toUpperCase()}
                  </span>
                </div>
                {vote.outcome && (
                  <span style={{ ...getTypographyCSS('textSm'), color: t.textSecondary, marginTop: 4, display: 'block' }}>
                    Outcome: <strong>{vote.outcome}</strong>
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyText t={t}>No votes linked to this item</EmptyText>
        )}

        <Divider t={t} />

        {/* ═══ ACTION ITEMS ═══ */}
        <SectionHeading t={t} icon={<ListChecks size={14} />}>Action Items</SectionHeading>
        <EmptyText t={t}>No action items recorded yet</EmptyText>

        <Divider t={t} />

        {/* ═══ RESOLUTIONS ═══ */}
        <SectionHeading t={t} icon={<Gavel size={14} />}>Resolutions</SectionHeading>
        <EmptyText t={t}>No resolutions recorded yet</EmptyText>

        {/* ═══ ACTION BAR (host only) ═══ */}
        {isHost && (
          <>
            <Divider t={t} heavy />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexWrap: 'wrap', gap: 12,
            }}>
              <ActionButton t={t} isDark={isDark} onClick={() => console.log('Create Vote')}>
                <Plus size={14} /> Create Vote
              </ActionButton>
              <ActionButton t={t} isDark={isDark} onClick={() => console.log('Add Action Item')}>
                <Plus size={14} /> Action Item
              </ActionButton>
              <ActionButton t={t} isDark={isDark} onClick={() => console.log('Add Resolution')}>
                <Plus size={14} /> Resolution
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TABLE CELL STYLES
// ============================================================================

const thStyle = (t: MeetingRoomTheme): React.CSSProperties => ({
  padding: '8px 10px',
  ...getTypographyCSS('sectionLabel'),
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: t.textTertiary,
});

const tdStyle = (t: MeetingRoomTheme): React.CSSProperties => ({
  padding: '10px 10px',
  verticalAlign: 'top',
});

// ============================================================================
// ACTION BUTTON
// ============================================================================

const ActionButton: React.FC<{
  t: MeetingRoomTheme;
  isDark: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ t, isDark, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 18px',
      borderRadius: 4,
      border: `1px solid ${isDark ? t.borderColorStrong : '#ccc'}`,
      background: isDark ? t.backgroundTertiary : '#fafafa',
      color: t.textPrimary,
      ...getTypographyCSS('text'), fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'background 0.15s, border-color 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = isDark ? t.backgroundHover : '#f0f0f0';
      e.currentTarget.style.borderColor = isDark ? t.borderColorHover : '#aaa';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = isDark ? t.backgroundTertiary : '#fafafa';
      e.currentTarget.style.borderColor = isDark ? t.borderColorStrong : '#ccc';
    }}
  >
    {children}
  </button>
);

export default React.memo(ActiveAgendaContent);
