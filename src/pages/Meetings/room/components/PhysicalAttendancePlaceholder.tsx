/**
 * PhysicalAttendancePlaceholder Component
 * Placeholder for physical attendance tracking (QR check-in integration pending).
 * 
 * Only visible when modeFeatures.showPhysicalFeatures is true (mode ≠ virtual).
 * Shows:
 * - QR code placeholder for self check-in
 * - Manual check-in button for secretary/host
 * - Check-in count indicator
 * - List of physically present participants
 * 
 * Per Section 3 of 0308_MEETING_ROOM_IMPLEMENTATION.md
 */

import React from 'react';
import { Avatar, Button, Space, Typography, Tooltip, Tag } from 'antd';
import {
  UserOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const { Text } = Typography;

const PhysicalAttendancePlaceholder: React.FC = () => {
  const { roomState, actions, modeFeatures, capabilities } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const permissions = useMeetingRoomPermissions();
  const { participants } = roomState;

  // Only show when physical features are active
  if (!modeFeatures.showPhysicalFeatures) return null;

  // Physical participants (in_room)
  const physicalParticipants = participants.filter(
    p => p.attendanceStatus === 'joined' && p.connectionStatus === 'in_room'
  );

  // Expected but not yet checked in
  const pendingParticipants = participants.filter(
    p => p.attendanceStatus === 'expected' && p.connectionStatus === 'in_room'
  );

  const canAdmit = permissions.canAdmitParticipants && capabilities.canStart;

  return (
    <div style={{
      width: '100%',
      borderRadius: isMobile ? 8 : 12,
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      overflow: 'hidden',
      background: theme.backgroundTertiary || '#f8f9fb',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '8px 10px' : '10px 16px',
        borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}`,
        background: theme.backgroundSecondary,
      }}>
        <Space size={8}>
          <TeamOutlined style={{ color: theme.primaryColor }} />
          <Text strong style={{ fontSize: 12 }}>
            Physical Attendance
          </Text>
          <Tag
            color={theme.successColor}
            style={{ margin: 0, fontSize: 10 }}
          >
            {physicalParticipants.length} checked in
          </Tag>
        </Space>
        {modeFeatures.isHybrid && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {modeFeatures.virtualCount} remote
          </Text>
        )}
      </div>

      <div style={{
        padding: isMobile ? 10 : 16,
        display: 'flex',
        gap: isMobile ? 10 : 16,
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        {/* QR Code placeholder */}
        <div style={{
          width: isMobile ? '100%' : 120,
          minHeight: 120,
          borderRadius: 8,
          border: `2px dashed ${theme.borderColor || '#d9d9d9'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: '#fff',
          flexShrink: 0,
        }}>
          <QrcodeOutlined style={{ fontSize: 36, color: theme.textTertiary }} />
          <Text type="secondary" style={{ fontSize: 10, textAlign: 'center' }}>
            QR Check-In
          </Text>
          <Text type="secondary" style={{ fontSize: 9, textAlign: 'center', color: theme.textDisabled }}>
            Integration Pending
          </Text>
        </div>

        {/* Checked-in participants list */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Checked in */}
          {physicalParticipants.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Checked In ({physicalParticipants.length})
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {physicalParticipants.map(p => (
                  <Tooltip key={p.id} title={`${p.name} — ${p.boardRole || 'Participant'}`}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: '#fff',
                      border: `1px solid ${theme.borderColorLight || '#e8e8e8'}`,
                      fontSize: 11,
                    }}>
                      <Avatar icon={<UserOutlined />} size={20} style={{ background: theme.primaryColor }} />
                      <Text style={{ fontSize: 11 }}>{(p.name || '').split(' ')[0]}</Text>
                      <CheckCircleOutlined style={{ color: theme.successColor, fontSize: 12 }} />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* Pending check-in */}
          {pendingParticipants.length > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Pending ({pendingParticipants.length})
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pendingParticipants.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: '#fff',
                      border: `1px dashed ${theme.borderColor || '#d9d9d9'}`,
                      fontSize: 11,
                      opacity: 0.7,
                    }}
                  >
                    <Avatar icon={<UserOutlined />} size={20} style={{ background: theme.textTertiary }} />
                    <Text type="secondary" style={{ fontSize: 11 }}>{(p.name || '').split(' ')[0]}</Text>
                    {canAdmit && (
                      <Tooltip title="Manual check-in">
                        <Button
                          type="link"
                          size="small"
                          style={{ padding: 0, height: 'auto', fontSize: 10, color: theme.primaryColor }}
                          onClick={() => actions.admitParticipant(p.id)}
                        >
                          Check In
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PhysicalAttendancePlaceholder);
