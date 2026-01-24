/**
 * MeetingCard Component
 * Displays meeting summary in a card format
 * Used in dashboard, calendar tooltips, and list views
 */

import React from 'react';
import { Card, Space, Tag, Button, Typography, Tooltip } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  GlobalOutlined,
  EyeOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { MeetingListItem } from '../../types/meeting.types';
import { MEETING_TYPE_LABELS, LOCATION_TYPE_LABELS } from '../../types/meeting.types';
import { BOARD_TYPE_COLORS } from '../../types/board.types';
import { MeetingStatusBadge } from './MeetingStatusBadge';
import { useBoardContext } from '../../contexts';

const { Text, Title } = Typography;

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
  const { currentBoard } = useBoardContext();

  // Format date and time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Location icon
  const getLocationIcon = () => {
    switch (meeting.locationType) {
      case 'virtual':
        return <VideoCameraOutlined />;
      case 'physical':
        return <HomeOutlined />;
      case 'hybrid':
        return <GlobalOutlined />;
      default:
        return <EnvironmentOutlined />;
    }
  };

  // Board type color
  const boardColor = BOARD_TYPE_COLORS[meeting.boardType];

  // Quick actions
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${meeting.boardId}/meetings/${meeting.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${meeting.boardId}/meetings/${meeting.id}/edit`);
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Join meeting logic
    console.log('Join meeting:', meeting.id);
  };

  // Check if meeting is near start time (within 15 minutes)
  const isNearStart = () => {
    const now = new Date();
    const meetingStart = new Date(`${meeting.startDate}T${meeting.startTime}`);
    const diffMinutes = (meetingStart.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes >= -15 && diffMinutes <= 15;
  };

  const canJoin = meeting.status === 'in_progress' || (meeting.status === 'scheduled' && isNearStart());

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{ height: '100%' }}
      styles={{
        body: { padding: compact ? '12px' : '16px' },
      }}
      bordered
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Header: Board badge + Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={4}>
            <Tag
              color={boardColor}
              style={{ margin: 0, fontSize: compact ? '10px' : '11px' }}
            >
              {meeting.boardName}
            </Tag>
            {meeting.parentBoardName && (
              <Text type="secondary" style={{ fontSize: compact ? '10px' : '11px' }}>
                ({meeting.parentBoardName})
              </Text>
            )}
          </Space>
          <MeetingStatusBadge status={meeting.status} />
        </div>

        {/* Title */}
        <Title
          level={compact ? 5 : 4}
          style={{ margin: 0, marginTop: compact ? 4 : 8 }}
          ellipsis={{ rows: 2 }}
        >
          {meeting.title}
        </Title>

        {/* Meeting metadata */}
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          {/* Date & Time */}
          <Space size={4}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <Text style={{ fontSize: compact ? '12px' : '13px' }}>
              {formatDate(meeting.startDate)}
            </Text>
            <Text type="secondary" style={{ fontSize: compact ? '12px' : '13px' }}>•</Text>
            <ClockCircleOutlined style={{ color: '#52c41a' }} />
            <Text style={{ fontSize: compact ? '12px' : '13px' }}>
              {formatTime(meeting.startTime)}
            </Text>
            <Text type="secondary" style={{ fontSize: compact ? '12px' : '13px' }}>
              ({meeting.duration} min)
            </Text>
          </Space>

          {/* Location */}
          <Space size={4}>
            {getLocationIcon()}
            <Text type="secondary" style={{ fontSize: compact ? '12px' : '13px' }}>
              {LOCATION_TYPE_LABELS[meeting.locationType]}
            </Text>
          </Space>

          {/* Participants & Quorum */}
          <Space size={4}>
            <TeamOutlined style={{ color: '#9C27B0' }} />
            <Text type="secondary" style={{ fontSize: compact ? '12px' : '13px' }}>
              {meeting.participantCount} participants
            </Text>
            <Text type="secondary" style={{ fontSize: compact ? '12px' : '13px' }}>•</Text>
            <Text type="secondary" style={{ fontSize: compact ? '12px' : '13px' }}>
              Quorum: {meeting.quorumPercentage}%
            </Text>
          </Space>

          {/* Meeting Type */}
          {!compact && (
            <Tag style={{ fontSize: '11px', marginTop: 4 }}>
              {MEETING_TYPE_LABELS[meeting.meetingType]}
            </Tag>
          )}

          {/* Confirmation status */}
          {meeting.requiresConfirmation && meeting.confirmationStatus === 'pending' && (
            <Tag color="warning" style={{ fontSize: '11px', marginTop: 4 }}>
              Pending Confirmation
            </Tag>
          )}
        </Space>

        {/* Actions */}
        {showActions && !compact && (
          <Space style={{ marginTop: 8, width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={handleView}
              />
            </Tooltip>

            {meeting.status === 'draft' && (
              <Tooltip title="Edit Meeting">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={handleEdit}
                />
              </Tooltip>
            )}

            {canJoin && meeting.locationType !== 'physical' && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                size="small"
                onClick={handleJoin}
              >
                Join
              </Button>
            )}
          </Space>
        )}
      </Space>
    </Card>
  );
};

export default MeetingCard;
