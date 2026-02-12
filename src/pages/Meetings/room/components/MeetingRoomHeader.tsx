/**
 * Meeting Room Header
 * Displays meeting title, status, duration, quorum, and mode indicator
 * 
 * Responsive:
 * - Desktop: Full single-row layout with all details
 * - Tablet: Two-row layout, simplified quorum
 * - Mobile: Compact two-row, minimal quorum, icon-only connection
 * 
 * Uses useMeetingRoomTheme() for dark/light mode support.
 * No Ant Design layout components — native HTML + theme tokens.
 */

import React from 'react';
import { Clock, Users, Wifi, WifiOff } from 'lucide-react';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import type { MeetingRoomTheme } from '../meetingRoomTheme';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'paused':
      return 'Paused';
    case 'waiting':
      return 'Waiting to Start';
    case 'starting':
      return 'Starting...';
    case 'ending':
      return 'Ending...';
    case 'ended':
      return 'Ended';
    default:
      return status;
  }
}

function getStatusBadgeStyle(status: string, t: MeetingRoomTheme): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '2px 10px', borderRadius: 3,
    ...getTypographyCSS('sectionLabel'),
    lineHeight: '18px', whiteSpace: 'nowrap',
  };
  switch (status) {
    case 'in_progress':
      return { ...base, background: t.successLight, color: t.successColor };
    case 'paused':
      return { ...base, background: t.warningLight, color: t.warningColor };
    case 'waiting':
    case 'starting':
      return { ...base, background: t.infoLight, color: t.infoColor };
    default:
      return { ...base, background: t.backgroundQuaternary, color: t.textSecondary };
  }
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'physical':
      return 'Physical';
    case 'virtual':
      return 'Virtual';
    case 'hybrid':
      return 'Hybrid';
    default:
      return mode;
  }
}

function getModeBadgeStyle(mode: string, t: MeetingRoomTheme): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '2px 10px', borderRadius: 3,
    ...getTypographyCSS('caption'), fontWeight: 500,
    lineHeight: '18px', whiteSpace: 'nowrap',
    border: `1px solid ${t.borderColor}`,
  };
  switch (mode) {
    case 'virtual':
      return { ...base, background: 'rgba(114, 46, 209, 0.12)', color: '#a855f7', borderColor: 'rgba(114, 46, 209, 0.25)' };
    case 'hybrid':
      return { ...base, background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.25)' };
    default:
      return { ...base, background: t.backgroundTertiary, color: t.textSecondary };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

const MeetingRoomHeader: React.FC = () => {
  const t = useMeetingRoomTheme();
  const { roomState } = useMeetingRoom();
  const { isMobile, isTablet } = useResponsive();
  const { meeting, status, mode, duration, presentCount, expectedCount, quorumRequired, quorumMet, isConnected } = roomState;
  
  const quorumPercentage = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;

  // Shared styles
  const headerBase: React.CSSProperties = {
    borderBottom: `2px solid ${t.primaryColor}`,
    background: t.backgroundSecondary,
  };

  const durationStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontWeight: 600,
    color: t.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  };

  const quorumDot = (met: boolean): React.CSSProperties => ({
    width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
    background: met ? t.successColor : t.warningColor,
    flexShrink: 0,
  });

  const connectionDot = (connected: boolean): React.CSSProperties => ({
    width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
    background: connected ? t.successColor : t.errorColor,
    flexShrink: 0,
  });
  
  // ---- MOBILE LAYOUT ----
  if (isMobile) {
    return (
      <div style={{ ...headerBase, padding: '8px 12px' }}>
        {/* Row 1: Title + Duration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            margin: 0, ...getTypographyCSS('h4'), fontWeight: 600,
            maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: t.textPrimary,
          }}>
            {meeting?.title || 'Meeting Room'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} style={{ color: t.textSecondary }} />
            <span style={{ ...durationStyle, ...getTypographyCSS('textLg') }}>
              {formatDuration(duration)}
            </span>
          </span>
        </div>
        {/* Row 2: Tags + Quorum compact + Connection dot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={getStatusBadgeStyle(status, t)}>{getStatusLabel(status)}</span>
            <span style={getModeBadgeStyle(mode, t)}>{getModeLabel(mode)}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} title={`${presentCount}/${expectedCount} present, ${quorumRequired} required`}>
              <Users size={13} style={{ color: t.textSecondary }} />
              <span style={{ ...getTypographyCSS('textSm'), fontWeight: 600, color: t.textPrimary }}>{presentCount}/{expectedCount}</span>
              <span style={quorumDot(quorumMet)} />
            </span>
            <span style={connectionDot(isConnected)} title={isConnected ? 'Connected' : 'Disconnected'} />
          </span>
        </div>
      </div>
    );
  }
  
  // ---- TABLET LAYOUT ----
  if (isTablet) {
    return (
      <div style={{ ...headerBase, padding: '10px 16px' }}>
        {/* Row 1: Title + Tags */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              margin: 0, ...getTypographyCSS('h4'), fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: t.textPrimary,
            }}>
              {meeting?.title || 'Meeting Room'}
            </div>
            <span style={{ ...getTypographyCSS('caption'), color: t.textTertiary }}>{meeting?.boardName}</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={getStatusBadgeStyle(status, t)}>{getStatusLabel(status)}</span>
            <span style={getModeBadgeStyle(mode, t)}>{getModeLabel(mode)}</span>
          </span>
        </div>
        {/* Row 2: Duration + Quorum + Connection */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} style={{ color: t.textSecondary }} />
            <span style={{ ...durationStyle, ...getTypographyCSS('textLg') }}>
              {formatDuration(duration)}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} style={{ color: t.textSecondary }} />
              <span style={{ ...getTypographyCSS('text'), fontWeight: 600, color: t.textPrimary }}>{presentCount}/{expectedCount}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 3,
                ...getTypographyCSS('caption'), fontWeight: 500,
                background: quorumMet ? t.successLight : t.warningLight,
                color: quorumMet ? t.successColor : t.warningColor,
              }}>
                {quorumMet ? '✓ Quorum' : '✗ No Quorum'}
              </span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isConnected ? (
                <Wifi size={14} style={{ color: t.successColor }} />
              ) : (
                <WifiOff size={14} style={{ color: t.errorColor }} />
              )}
              <span style={{ color: isConnected ? t.successColor : t.errorColor, ...getTypographyCSS('textSm') }}>
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </span>
          </span>
        </div>
      </div>
    );
  }

  // ---- DESKTOP LAYOUT ----
  return (
    <div style={{ ...headerBase, padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Meeting Title and Status */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ margin: 0, color: t.textPrimary, ...getTypographyCSS('h3'), fontWeight: 600 }}>
              {meeting?.title || 'Meeting Room'}
            </div>
            <span style={{ ...getTypographyCSS('textSm'), color: t.textTertiary }}>
              {meeting?.boardName}
            </span>
          </div>
          <span style={getStatusBadgeStyle(status, t)}>{getStatusLabel(status)}</span>
          <span style={getModeBadgeStyle(mode, t)}>{getModeLabel(mode)}</span>
        </span>
        
        {/* Center: Duration */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} style={{ color: t.textSecondary }} />
          <span style={{ ...durationStyle, ...getTypographyCSS('h3') }}>
            {formatDuration(duration)}
          </span>
        </span>
        
        {/* Right: Quorum and Connection */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={18} style={{ color: t.textSecondary }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...getTypographyCSS('text'), fontWeight: 600, color: t.textPrimary }}>{presentCount}/{expectedCount}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 3,
                  ...getTypographyCSS('caption'), fontWeight: 500,
                  background: quorumMet ? t.successLight : t.warningLight,
                  color: quorumMet ? t.successColor : t.warningColor,
                }}>
                  {quorumMet ? '✓ Quorum' : '✗ No Quorum'}
                </span>
              </div>
              {/* Quorum progress bar */}
              <div style={{
                width: 100, height: 4, borderRadius: 2, margin: '4px 0',
                background: t.backgroundQuaternary,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(quorumPercentage, 100)}%`,
                  height: '100%', borderRadius: 2,
                  background: quorumMet ? t.successColor : t.warningColor,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ ...getTypographyCSS('caption'), color: t.textTertiary }}>
                {quorumRequired} required
              </span>
            </div>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isConnected ? (
              <>
                <Wifi size={14} style={{ color: t.successColor }} />
                <span style={{ color: t.successColor, ...getTypographyCSS('textSm') }}>Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={14} style={{ color: t.errorColor }} />
                <span style={{ color: t.errorColor, ...getTypographyCSS('textSm') }}>Disconnected</span>
              </>
            )}
          </span>
        </span>
      </div>
    </div>
  );
};

export default React.memo(MeetingRoomHeader);
