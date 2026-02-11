/**
 * MeetingCard Component
 * Card view for displaying meeting information in a grid layout
 * Features: Date block, status badge, time/location/participants, status-based actions
 */

import React from 'react';
import { Card, Tag, Button, Tooltip, Progress, Typography, Divider, message } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import type { MeetingListItem, MeetingStatus, MeetingType, LocationType } from '../../types/meeting.types';
import { MEETING_TYPE_LABELS } from '../../types/meeting.types';
import { useBoardContext } from '../../contexts';
import { MeetingStatusBadge } from './MeetingStatusBadge';
import { BoardPackStatusCell } from './BoardPackStatusCell';

const { Text, Title } = Typography;

// Meeting type colors (Ant Design preset colors)
const MEETING_TYPE_COLORS: Record<MeetingType, string> = {
  regular: 'blue',
  special: 'purple',
  emergency: 'red',
  agm: 'gold',
  committee: 'orange',
};

interface MeetingCardProps {
  meeting: MeetingListItem;
  showActions?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  showActions = true,
  compact = false,
  onClick,
}) => {
  const navigate = useNavigate();
  const { currentBoard, theme } = useBoardContext();
  
  const status = meeting.status;
  
  // Get status-based accent color from theme (updated for new status model)
  const getStatusColor = (meetingStatus: MeetingStatus, subStatus?: string | null): string => {
    // Handle combined status + subStatus for more specific colors
    if (subStatus) {
      const combinedKey = `${meetingStatus}.${subStatus}`;
      switch (combinedKey) {
        case 'draft.incomplete': return theme.textDisabled || '#d9d9d9';
        case 'draft.complete': return theme.infoColor || '#1890ff';
        case 'scheduled.pending_approval': return theme.warningColor || '#faad14';
        case 'scheduled.approved': return theme.successColor || '#52c41a';
        case 'scheduled.rejected': return theme.errorColor || '#ff4d4f';
        case 'completed.recent': return theme.successColor || '#52c41a';
        case 'completed.archived': return theme.textDisabled || '#d9d9d9';
      }
    }
    
    // Fallback to primary status colors
    switch (meetingStatus) {
      case 'draft': return theme.textDisabled || '#d9d9d9';
      case 'scheduled': return theme.primaryColor || '#13c2c2';
      case 'in_progress': return theme.successColor || '#52c41a';
      case 'completed': return theme.successColor || '#52c41a';
      case 'cancelled': return theme.errorColor || '#ff4d4f';
      default: return theme.primaryColor || '#324721';
    }
  };
  
  const accentColor = getStatusColor(status, meeting.subStatus);
  
  // Parse date and time
  const meetingDate = dayjs(meeting.startDate);
  const startTime = dayjs(`${meeting.startDate} ${meeting.startTime}`);
  const endTime = startTime.add(meeting.duration, 'minute');
  
  // Calculate quorum percentage
  const quorumPercentage = meeting.expectedAttendees > 0 
    ? Math.round((meeting.participantCount / meeting.expectedAttendees) * 100)
    : 0;

  // Get location icon - use theme secondary text color
  const iconColor = theme.textSecondary || '#8c8c8c';
  
  const getLocationIcon = (locationType: LocationType) => {
    switch (locationType) {
      case 'virtual': return <VideoCameraOutlined style={{ color: iconColor }} />;
      case 'physical': return <HomeOutlined style={{ color: iconColor }} />;
      case 'hybrid': return <GlobalOutlined style={{ color: iconColor }} />;
      default: return <GlobalOutlined style={{ color: iconColor }} />;
    }
  };

  // Get location label
  const getLocationLabel = (locationType: LocationType) => {
    switch (locationType) {
      case 'virtual': return 'Virtual';
      case 'physical': return 'Physical';
      case 'hybrid': return 'Hybrid';
      default: return 'Meeting';
    }
  };

  // Action handlers
  const handleView = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/${currentBoard?.id || meeting.boardId}/meetings/${meeting.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${currentBoard?.id || meeting.boardId}/meetings/${meeting.id}/edit`);
  };

  const handleAction = (e: React.MouseEvent, actionName: string) => {
    e.stopPropagation();
    message.info(`${actionName} functionality coming soon`);
  };

  // Render action buttons based on status - using theme colors
  const renderActions = () => {
    if (!showActions || compact) return null;
    
    const actions: React.ReactNode[] = [];
    
    // Theme-based colors
    const primaryColor = theme.primaryColor || '#324721';
    const infoColor = theme.infoColor || '#1890ff';
    const successColor = theme.successColor || '#52c41a';
    const warningColor = theme.warningColor || '#faad14';

    // View - always available
    actions.push(
      <Tooltip title="View" key="view">
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined style={{ color: primaryColor }} />}
          onClick={handleView}
        />
      </Tooltip>
    );

    // Status-specific actions (updated for new status model)
    switch (status) {
      case 'draft':
        actions.push(
          <Tooltip title="Edit" key="edit">
            <Button type="text" size="small" icon={<EditOutlined style={{ color: infoColor }} />} onClick={handleEdit} />
          </Tooltip>,
          <Tooltip title="Revise" key="revise">
            <Button type="text" size="small" icon={<EditOutlined style={{ color: warningColor }} />} onClick={(e) => handleAction(e, 'Revise')} />
          </Tooltip>
        );
        break;
      case 'scheduled':
        // Handle scheduled meetings based on subStatus
        if (meeting.subStatus === 'pending_approval') {
          actions.push(
            <Tooltip title="Edit" key="edit">
              <Button type="text" size="small" icon={<EditOutlined style={{ color: infoColor }} />} onClick={handleEdit} />
            </Tooltip>,
            <Tooltip title="Approve" key="approve">
              <Button type="text" size="small" icon={<CheckOutlined style={{ color: successColor }} />} onClick={(e) => handleAction(e, 'Approve')} />
            </Tooltip>,
            <Tooltip title="Reject" key="reject">
              <Button type="text" size="small" danger icon={<CloseOutlined />} onClick={(e) => handleAction(e, 'Reject')} />
            </Tooltip>
          );
        } else if (meeting.subStatus === 'approved') {
          actions.push(
            <Tooltip title="Edit" key="edit">
              <Button type="text" size="small" icon={<EditOutlined style={{ color: infoColor }} />} onClick={handleEdit} />
            </Tooltip>,
            <Tooltip title="Reschedule" key="reschedule">
              <Button type="text" size="small" icon={<CalendarOutlined style={{ color: warningColor }} />} onClick={(e) => handleAction(e, 'Reschedule')} />
            </Tooltip>,
            <Tooltip title="Cancel" key="cancel">
              <Button type="text" size="small" danger icon={<StopOutlined />} onClick={(e) => handleAction(e, 'Cancel')} />
            </Tooltip>
          );
        } else if (meeting.subStatus === 'rejected') {
          actions.push(
            <Tooltip title="Start" key="start">
              <Button type="text" size="small" icon={<PlayCircleOutlined style={{ color: successColor }} />} onClick={(e) => handleAction(e, 'Start')} />
            </Tooltip>,
            <Tooltip title="Reschedule" key="reschedule">
              <Button type="text" size="small" icon={<CalendarOutlined style={{ color: warningColor }} />} onClick={(e) => handleAction(e, 'Reschedule')} />
            </Tooltip>,
            <Tooltip title="Cancel" key="cancel">
              <Button type="text" size="small" danger icon={<StopOutlined />} onClick={(e) => handleAction(e, 'Cancel')} />
            </Tooltip>
          );
        }
        break;
      case 'in_progress':
        actions.push(
          <Tooltip title="End Meeting" key="end">
            <Button type="text" size="small" icon={<CheckCircleOutlined style={{ color: successColor }} />} onClick={(e) => handleAction(e, 'End')} />
          </Tooltip>
        );
        break;
      case 'completed':
        actions.push(
          <Tooltip title="Download Minutes" key="download">
            <Button type="text" size="small" icon={<DownloadOutlined style={{ color: infoColor }} />} onClick={(e) => handleAction(e, 'Download')} />
          </Tooltip>
        );
        break;
      case 'cancelled':
        actions.push(
          <Tooltip title="Reschedule" key="reschedule">
            <Button type="text" size="small" icon={<CalendarOutlined style={{ color: warningColor }} />} onClick={(e) => handleAction(e, 'Reschedule')} />
          </Tooltip>
        );
        break;
    }

    return actions;
  };

  // Compact card for dashboard/tooltips
  if (compact) {
    return (
      <Card
        hoverable={!!onClick}
        onClick={onClick || handleView}
        size="small"
        style={{ borderLeft: `3px solid ${accentColor}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 13 }} ellipsis>{meeting.title}</Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {meetingDate.format('DD MMM')} • {startTime.format('h:mm A')}
            </div>
          </div>
          <Tag color={getStatusColor(status, meeting.subStatus)} style={{ marginLeft: 8, flexShrink: 0 }}>
            <MeetingStatusBadge status={status} subStatus={meeting.subStatus} />
          </Tag>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hoverable
      onClick={onClick || handleView}
      style={{
        borderLeft: `4px solid ${accentColor}`,
        height: '100%',
      }}
      styles={{
        body: { padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }
      }}
    >
      {/* Header: Date Block + Title + Status */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {/* Date Block */}
        <div
          style={{
            minWidth: 52,
            textAlign: 'center',
            padding: '6px 4px',
            background: `${accentColor}15`,
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: accentColor }}>
            {meetingDate.format('DD')}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: accentColor }}>
            {meetingDate.format('MMM')}
          </div>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>
            {meetingDate.format('YYYY')}
          </div>
        </div>

        {/* Title & Board */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <Title
              level={5}
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {meeting.title}
            </Title>
            <div style={{ marginBottom: 8 }}>
              <MeetingStatusBadge status={status} subStatus={meeting.subStatus} />
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {meeting.boardName}
          </Text>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Details */}
      <div style={{ flex: 1 }}>
        {/* Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <ClockCircleOutlined style={{ color: iconColor, fontSize: 13 }} />
          <Text style={{ fontSize: 12 }}>
            {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
            <Text type="secondary" style={{ marginLeft: 6 }}>({meeting.duration}min)</Text>
          </Text>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {getLocationIcon(meeting.locationType)}
          <Text style={{ fontSize: 12 }}>
            {getLocationLabel(meeting.locationType)}
            {meeting.physicalLocation && (
              <Text type="secondary"> • {meeting.physicalLocation}</Text>
            )}
          </Text>
        </div>

        {/* Participants & Quorum */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeamOutlined style={{ color: iconColor, fontSize: 13 }} />
            <Text style={{ fontSize: 12 }}>
              {meeting.participantCount}/{meeting.expectedAttendees}
            </Text>
          </div>
          {meeting.quorumRequired && (
            <Tooltip title={`Quorum: ${meeting.quorumPercentage}% required`}>
              <Progress
                type="circle"
                percent={quorumPercentage}
                size={28}
                strokeColor={quorumPercentage >= (meeting.quorumPercentage || 0) ? theme.successColor : theme.warningColor}
                format={() => <span style={{ fontSize: 9 }}>{quorumPercentage}%</span>}
              />
            </Tooltip>
          )}
        </div>

        {/* Meeting Type Tag + Board Pack Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <Tag color={MEETING_TYPE_COLORS[meeting.meetingType]} style={{ fontSize: 11, margin: 0 }}>
            {MEETING_TYPE_LABELS[meeting.meetingType]}
          </Tag>
          <div onClick={(e) => e.stopPropagation()}>
            <BoardPackStatusCell
              meetingId={meeting.id}
              boardId={meeting.boardId}
              boardPackStatus={meeting.boardPackStatus}
              meetingStatus={meeting.status}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            gap: 2,
            borderTop: `1px solid ${theme.borderColor || '#f0f0f0'}`,
            paddingTop: 10,
            marginTop: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {renderActions()}
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
