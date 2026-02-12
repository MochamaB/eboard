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
import { Typography, Empty, Spin, Button } from 'antd';
import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { useMinutesByMeeting } from '../../../../hooks/api/useMinutes';

const { Text, Title } = Typography;

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
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
          Meeting Minutes
        </Text>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Empty
            image={<FileTextOutlined style={{ fontSize: 48, color: theme.textTertiary }} />}
            description={
              <div>
                <Text type="secondary">No minutes created yet</Text>
                {permissions.canTakeMinutes && status === 'in_progress' && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Minutes can be started from the Minutes tab in meeting details.
                    </Text>
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
      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
        Meeting Minutes
      </Text>

      {/* Minutes status card */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${theme.borderColorLight}`,
        background: theme.backgroundSecondary,
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Title level={5} style={{ margin: 0, fontSize: 14 }}>
            Meeting Minutes
          </Title>
          <span style={{
            fontSize: 11,
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
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
            Version {activeMinutes.version}
          </Text>
        )}

        {activeMinutes.updatedAt && (
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
            Updated: {new Date(activeMinutes.updatedAt).toLocaleTimeString()}
          </Text>
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
          <Text style={{ display: 'block', fontSize: 13, color: theme.primaryColor, fontWeight: 500 }}>
            Minutes Editor
          </Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 4, marginBottom: 8 }}>
            Open full minutes editor in meeting details for rich editing.
          </Text>
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
          fontSize: 13,
        }}>
          <div dangerouslySetInnerHTML={{ __html: activeMinutes.content }} />
        </div>
      )}
    </div>
  );
};

export default React.memo(SidePanelMinutes);
