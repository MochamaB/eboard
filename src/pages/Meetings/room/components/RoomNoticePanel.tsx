/**
 * RoomNoticePanel — Meeting Details sidebar panel for the live meeting room
 * 
 * Custom Tier 3 component that replaces SidePanelNotice.
 * Uses useMeetingRoomTheme() exclusively for theming.
 * 
 * Sections:
 *   1. Meeting Info (title, board, date/time, duration, location)
 *   2. Quorum Status (live progress bar)
 *   3. Connection Status (connected/disconnected indicator)
 *   4. Meeting Status (status + mode)
 *   5. "View Full Notice" button → opens MeetingNoticeDocument in a modal
 */

import React, { useState } from 'react';
import { Modal, Progress, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
  Calendar,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  Users,
  FileText,
} from 'lucide-react';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useBoardContext } from '../../../../contexts';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import { useAgenda } from '../../../../hooks/api/useAgenda';
import { MeetingNoticeDocument } from '../../../../components/Meetings';
import { getConfirmationDisplayInfo } from '../../../../utils/confirmationWorkflow';
import type { MeetingRoomTheme } from '../meetingRoomTheme';

// ============================================================================
// SECTION HEADING
// ============================================================================

const SectionHeading: React.FC<{ label: string; theme: MeetingRoomTheme }> = ({ label, theme: t }) => (
  <div style={{
    ...getTypographyCSS('h4'),
    color: t.textPrimary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${t.borderColor}`,
  }}>
    {label}
  </div>
);

// ============================================================================
// INFO ROW
// ============================================================================

const InfoRow: React.FC<{
  icon: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  theme: MeetingRoomTheme;
}> = ({ icon, primary, secondary, theme: t }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
    <div style={{ color: t.textTertiary, marginTop: 2, flexShrink: 0 }}>{icon}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ color: t.textPrimary, ...getTypographyCSS('text') }}>{primary}</div>
      {secondary && (
        <div style={{ color: t.textTertiary, ...getTypographyCSS('textSm'), marginTop: 2 }}>{secondary}</div>
      )}
    </div>
  </div>
);

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge: React.FC<{
  label: string;
  color: string;
  bg: string;
  theme: MeetingRoomTheme;
}> = ({ label, color, bg, theme: t }) => (
  <span style={{
    ...getTypographyCSS('caption'),
    color,
    background: bg,
    padding: '2px 10px',
    borderRadius: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

// ============================================================================
// KEY-VALUE ROW
// ============================================================================

const KVRow: React.FC<{
  label: string;
  value: React.ReactNode;
  theme: MeetingRoomTheme;
}> = ({ label, value, theme: t }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  }}>
    <span style={{ color: t.textSecondary, ...getTypographyCSS('text') }}>{label}</span>
    <span style={{ color: t.textPrimary, ...getTypographyCSS('text'), textTransform: 'capitalize' }}>{value}</span>
  </div>
);

// ============================================================================
// ROOM NOTICE PANEL
// ============================================================================

const RoomNoticePanel: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { currentBoard, theme: boardTheme, logo } = useBoardContext();
  const t = useMeetingRoomTheme();
  const { isMobile } = useResponsive();
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  const {
    meeting,
    status,
    mode,
    presentCount,
    expectedCount,
    quorumRequired,
    quorumMet,
    isConnected,
    lastSyncAt,
  } = roomState;

  // Fetch agenda for the full notice document
  const { data: agendaData } = useAgenda(meeting?.id || '');
  const agendaItems = agendaData?.items || [];

  // Build confirmation display info for signatures
  const confirmationInfo = meeting
    ? getConfirmationDisplayInfo(
        meeting.id,
        Number(meeting.createdBy),
        meeting.createdByName || 'Board Secretary',
        meeting.createdAt,
        meeting.boardId
      )
    : undefined;

  // Determine approval status from meeting state
  const approvalStatus = meeting?.subStatus === 'approved'
    ? 'approved' as const
    : meeting?.subStatus === 'rejected'
      ? 'rejected' as const
      : 'none' as const;

  const quorumPercentage = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;
  const padding = isMobile ? 12 : 16;

  return (
    <div style={{ padding }}>

      {/* ── Meeting Info ── */}
      <SectionHeading label="Meeting Notice" theme={t} />

      <InfoRow
        icon={<Calendar size={16} />}
        primary={meeting?.title || 'Meeting'}
        secondary={meeting?.boardName}
        theme={t}
      />
      <InfoRow
        icon={<Clock size={16} />}
        primary={`${meeting?.startDate} at ${meeting?.startTime}`}
        secondary={meeting?.duration ? `${meeting.duration} minutes` : undefined}
        theme={t}
      />
      <InfoRow
        icon={<MapPin size={16} />}
        primary={<span style={{ textTransform: 'capitalize' }}>{meeting?.locationType || mode}</span>}
        secondary={meeting?.physicalAddress || undefined}
        theme={t}
      />

      {/* Spacer */}
      <div style={{ height: 8 }} />

      {/* ── Quorum Status ── */}
      <SectionHeading label="Quorum Status" theme={t} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      }}>
        <span style={{ color: t.textSecondary, ...getTypographyCSS('text') }}>Status</span>
        <StatusBadge
          label={quorumMet ? '✓ Quorum Met' : '⚠ No Quorum'}
          color={quorumMet ? t.successColor : t.warningColor}
          bg={quorumMet ? t.successLight : t.warningLight}
          theme={t}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Users size={16} style={{ color: t.textTertiary, marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}>
            <span style={{ color: t.textPrimary, ...getTypographyCSS('text') }}>
              Present: {presentCount}/{expectedCount}
            </span>
            <span style={{ color: t.textSecondary, ...getTypographyCSS('text') }}>
              {quorumPercentage}%
            </span>
          </div>
          <Progress
            percent={quorumPercentage}
            showInfo={false}
            strokeColor={quorumMet ? t.successColor : t.warningColor}
            trailColor={t.backgroundTertiary}
            size="small"
          />
          <div style={{ color: t.textTertiary, ...getTypographyCSS('textSm'), marginTop: 4 }}>
            {quorumRequired} members required for quorum
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: 8 }} />

      {/* ── Connection Status ── */}
      <SectionHeading label="Connection" theme={t} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {isConnected ? (
          <>
            <Wifi size={16} style={{ color: t.successColor, marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ color: t.successColor, ...getTypographyCSS('text') }}>Connected</div>
              {lastSyncAt && (
                <div style={{ color: t.textTertiary, ...getTypographyCSS('textSm'), marginTop: 2 }}>
                  Last sync: {new Date(lastSyncAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <WifiOff size={16} style={{ color: t.errorColor, marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ color: t.errorColor, ...getTypographyCSS('text') }}>Disconnected</div>
              <div style={{ color: t.textTertiary, ...getTypographyCSS('textSm'), marginTop: 2 }}>
                Attempting to reconnect...
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spacer */}
      <div style={{ height: 8 }} />

      {/* ── Meeting Status ── */}
      <SectionHeading label="Meeting Status" theme={t} />

      <KVRow label="Status" value={status.replace('_', ' ')} theme={t} />
      <KVRow label="Mode" value={mode} theme={t} />

      {/* Spacer */}
      <div style={{ height: 16 }} />

      {/* ── View Full Notice Button ── */}
      <button
        onClick={() => setNoticeModalOpen(true)}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: 8,
          border: `1px solid ${t.borderColor}`,
          background: t.backgroundTertiary,
          color: t.textPrimary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 0.15s',
          ...getTypographyCSS('text'),
        }}
        onMouseEnter={e => (e.currentTarget.style.background = t.backgroundHover)}
        onMouseLeave={e => (e.currentTarget.style.background = t.backgroundTertiary)}
      >
        <FileText size={16} />
        View Full Notice
      </button>

      {/* ── Notice Document Modal ── */}
      <Modal
        open={noticeModalOpen}
        onCancel={() => setNoticeModalOpen(false)}
        footer={
          <div style={{ textAlign: 'right', padding: '8px 0' }}>
            <Button onClick={() => setNoticeModalOpen(false)}>Close</Button>
          </div>
        }
        title="Meeting Notice"
        closeIcon={<CloseOutlined />}
        width={isMobile ? '100%' : 860}
        style={{ top: isMobile ? 0 : 40 }}
        styles={{
          body: { padding: 0, maxHeight: '75vh', overflow: 'auto' },
        }}
        destroyOnClose
      >
        {meeting && (
          <MeetingNoticeDocument
            meeting={meeting}
            board={currentBoard}
            branding={boardTheme}
            contactInfo={currentBoard?.contactInfo}
            logoUrl={logo}
            mode="print"
            agendaItems={agendaItems}
            confirmationInfo={confirmationInfo}
            approvalStatus={approvalStatus}
            compact={isMobile}
          />
        )}
      </Modal>
    </div>
  );
};

export default React.memo(RoomNoticePanel);
