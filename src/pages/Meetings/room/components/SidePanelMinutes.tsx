/**
 * Side Panel - Minutes Tab
 * Compact minutes view for the live meeting room
 * 
 * - Secretary: sees MinutesEditor in compact mode with auto-save
 * - Others: sees read-only minutes content or placeholder
 * 
 * Responsive + board branding applied
 */

import React from 'react';
import { Empty, Spin, Button } from 'antd';
import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { useMinutesByMeeting } from '../../../../hooks/api/useMinutes';

const SidePanelMinutes: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const theme = useMeetingRoomTheme();
  const { isMobile } = useResponsive();
  const permissions = useMeetingRoomPermissions();
  const { meetingId, status } = roomState;

  // Fetch minutes for this meeting (returns a single Minutes object or undefined)
  const { data: minutesData, isLoading } = useMinutesByMeeting(meetingId);
  const activeMinutes = minutesData || null;

  const panelPadding = isMobile ? 12 : 16;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="small" />
      </div>
    );
  }

  // No minutes yet
  if (!activeMinutes) {
    return (
      <div style={{ padding: panelPadding, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <span style={{ ...getTypographyCSS('sectionLabel'), textTransform: 'uppercase', display: 'block', marginBottom: 12, color: theme.textSecondary }}>
          Meeting Minutes
        </span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Empty
            image={<FileTextOutlined style={{ fontSize: 48, color: theme.textTertiary }} />}
            description={
              <div>
                <span style={{ ...getTypographyCSS('text'), color: theme.textSecondary }}>No minutes created yet</span>
                {permissions.canTakeMinutes && status === 'in_progress' && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ ...getTypographyCSS('textSm'), color: theme.textSecondary }}>
                      Minutes can be started from the Minutes tab in meeting details.
                    </span>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </div>
    );
  }

  // Minutes exist — show status and content preview
  return (
    <div style={{ padding: panelPadding, height: '100%', overflow: 'auto' }}>
      <span style={{ ...getTypographyCSS('sectionLabel'), textTransform: 'uppercase', display: 'block', marginBottom: 12, color: theme.textSecondary }}>
        Meeting Minutes
      </span>

      {/* Minutes status card */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${theme.borderColorLight}`,
        background: theme.backgroundSecondary,
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ ...getTypographyCSS('h4'), margin: 0, color: theme.textPrimary }}>
            Meeting Minutes
          </span>
          <span style={{
            ...getTypographyCSS('caption'),
            padding: '2px 8px',
            borderRadius: 4,
            background: activeMinutes.status === 'draft' ? theme.warningColor : theme.successColor,
            color: '#fff',
            textTransform: 'capitalize',
          }}>
            {activeMinutes.status}
          </span>
        </div>

        {activeMinutes.version > 1 && (
          <span style={{ ...getTypographyCSS('caption'), display: 'block', color: theme.textSecondary }}>
            Version {activeMinutes.version}
          </span>
        )}

        {activeMinutes.updatedAt && (
          <span style={{ ...getTypographyCSS('caption'), display: 'block', color: theme.textSecondary }}>
            Updated: {new Date(activeMinutes.updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Secretary: edit prompt */}
      {permissions.canTakeMinutes && (
        <div style={{
          padding: 12,
          borderRadius: 8,
          border: `1px dashed ${theme.primaryColor}`,
          background: theme.primaryLight,
          textAlign: 'center',
        }}>
          <EditOutlined style={{ fontSize: 24, color: theme.primaryColor, marginBottom: 8 }} />
          <span style={{ display: 'block', ...getTypographyCSS('text'), color: theme.primaryColor, fontWeight: 500 }}>
            Minutes Editor
          </span>
          <span style={{ display: 'block', ...getTypographyCSS('caption'), marginTop: 4, marginBottom: 8, color: theme.textSecondary }}>
            Open full minutes editor in meeting details for rich editing.
          </span>
          <Button
            size="small"
            icon={<EditOutlined />}
            style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
          >
            {isMobile ? 'Edit' : 'Open Editor'}
          </Button>
        </div>
      )}

      {/* Non-secretary: read-only content preview */}
      {!permissions.canTakeMinutes && permissions.canViewMinutes && activeMinutes.content && (
        <div style={{
          padding: 12,
          borderRadius: 8,
          border: `1px solid ${theme.borderColorLight}`,
          background: theme.backgroundTertiary,
          maxHeight: 300,
          overflow: 'auto',
          ...getTypographyCSS('text'),
        }}>
          <div dangerouslySetInnerHTML={{ __html: activeMinutes.content }} />
        </div>
      )}
    </div>
  );
};

export default React.memo(SidePanelMinutes);
