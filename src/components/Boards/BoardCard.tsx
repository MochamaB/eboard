/**
 * BoardCard Component
 * Card view for displaying board information in a grid layout
 * Features: Board name, type, status, member count, compliance, branding colors
 */

import React from 'react';
import { Card, Tag, Button, Tooltip, Progress, Typography, Space, Modal, message } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { BoardListItem, BoardStatus } from '../../types/board.types';
import { useBoardContext } from '../../contexts';
import { useLookups } from '../../contexts/LookupsContext';

const { Text, Title } = Typography;

interface BoardCardProps {
  board: BoardListItem;
  onClick?: (board: BoardListItem) => void;
  showActions?: boolean;
  compact?: boolean;
  allBoards?: BoardListItem[];
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onClick,
  showActions = true,
  compact = false,
  allBoards = [],
}) => {
  const navigate = useNavigate();
  const { theme } = useBoardContext();
  const { getBoardTypeByCode } = useLookups();

  // Get board type info
  const typeInfo = getBoardTypeByCode(board.type);

  // Helper function to get board logo
  const getBoardLogo = (board: BoardListItem, allBoards: BoardListItem[]): string | undefined => {
    // Find the board in allBoards to get its branding/logo (allBoards contains full Board objects)
    const boardWithBranding = allBoards.find(b => b.id === board.id) as any;
    return boardWithBranding?.branding?.logo?.main || boardWithBranding?.branding?.logo?.small;
  };

  // Get board logo
  const boardLogo = getBoardLogo(board, allBoards);

  // Board type colors
  const BOARD_TYPE_COLORS: Record<string, string> = {
    main: 'purple',
    subsidiary: 'blue',
    factory: 'green',
    committee: 'orange',
  };

  // Status colors
  const getStatusColor = (status: BoardStatus) => {
    return status === 'active' ? theme.successColor : 'default';
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(board);
    } else {
      navigate(`/boards/${board.id}/details`);
    }
  };

  // Handle view details
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/boards/${board.id}/details`);
  };

  // Handle edit
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/boards/${board.id}/edit`);
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Delete Board',
      content: `Are you sure you want to delete ${board.name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        message.success('Board deleted successfully');
        // TODO: Implement actual delete functionality
      },
    });
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={{
        height: '100%',
        borderColor: theme.borderColor,
        borderWidth: 1,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'column',
      }}
      headStyle={{
        height: 80,
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: `1px solid ${theme.borderColor}`,
        marginBottom: 12,
      }}
      bodyStyle={{ 
        padding: compact ? 16 : 20,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      actions={
        showActions
          ? [
              <Tooltip title="View Details" key="view">
                <EyeOutlined 
                  onClick={handleViewDetails}
                  style={{ fontSize: 16, color: theme.primaryColor }}
                />
              </Tooltip>,
              <Tooltip title="Edit Board" key="edit">
                <EditOutlined 
                  onClick={handleEdit}
                  style={{ fontSize: 16, color: '#666' }}
                />
              </Tooltip>,
              <Tooltip title="Delete Board" key="delete">
                <DeleteOutlined 
                  onClick={handleDelete}
                  style={{ fontSize: 16, color: '#ff4d4f' }}
                />
              </Tooltip>,
            ]
          : undefined
      }
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12,marginBottom: 4 }}>
        {boardLogo ? (
          <img 
            src={boardLogo} 
            alt={board.name}
            style={{ 
              width: 50, 
              height: 70, 
              objectFit: 'contain',
              borderRadius: 6 
            }}
          />
        ) : (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            backgroundColor: theme.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ApartmentOutlined style={{ fontSize: 20, color: theme.primaryColor }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
            {board.name}
          </Title>
          {board.shortName && board.shortName !== board.name && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {board.shortName}
            </Text>
          )}
        </div>
      </div>
      {/* Card Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tags: Type and Status */}
        <Space size={[4, 4]} wrap style={{ marginBottom: 12 }}>
          <Tag color={BOARD_TYPE_COLORS[board.type] || 'default'}>
            {typeInfo?.name || board.type}
          </Tag>
          <Tag color={getStatusColor(board.status)}>
            {board.status === 'active' ? 'Active' : 'Inactive'}
          </Tag>
        </Space>

        {/* Stats Section */}
        <div style={{ marginBottom: 12 }}>
          <Space size={16} split={<span style={{ borderRight: '1px solid #f0f0f0' }}></span>}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Members
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TeamOutlined style={{ fontSize: 14, color: theme.primaryColor }} />
                <Text strong>{board.memberCount}</Text>
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Committees
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ApartmentOutlined style={{ fontSize: 14, color: theme.primaryColor }} />
                <Text strong>{board.committeeCount}</Text>
              </div>
            </div>
          </Space>
        </div>

        {/* Compliance */}
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
            Compliance
          </Text>
          <Progress
            percent={board.compliance}
            size="small"
            status={board.compliance >= 100 ? 'success' : board.compliance >= 75 ? 'normal' : 'exception'}
            format={(percent) => `${percent}%`}
          />
        </div>

        {/* Next Meeting */}
        {board.nextMeetingDate && !compact && (
          <div style={{ marginTop: 'auto' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Next Meeting: {dayjs(board.nextMeetingDate).format('DD MMM YYYY')}
            </Text>
          </div>
        )}
      </div>

      {/* Description (if available) */}
      {/* Note: BoardListItem doesn't have description field, using BoardSchema would be needed */}
      {/* board.description && !compact && (
        <Text
          type="secondary"
          ellipsis={{ tooltip: board.description }}
          style={{
            fontSize: 12,
            display: 'block',
            marginBottom: 12,
            minHeight: 32,
          }}
        >
          {board.description}
        </Text>
      )} */}

      {/* Stats Section */}
      <div style={{ marginBottom: 12 }}>
        <Space size={16} split={<span style={{ borderRight: '1px solid #f0f0f0' }}></span>}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Members
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TeamOutlined style={{ fontSize: 14, color: theme.primaryColor }} />
              <Text strong>{board.memberCount || 0}</Text>
            </div>
          </div>
          
          {board.compliance !== undefined && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Compliance
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Progress
                  percent={board.compliance}
                  size="small"
                  strokeColor={board.compliance >= 80 ? theme.successColor : board.compliance >= 60 ? theme.warningColor : theme.errorColor}
                  style={{ margin: 0, width: 40 }}
                  showInfo={false}
                />
                <Text strong style={{ fontSize: 12 }}>{board.compliance}%</Text>
              </div>
            </div>
          )}
        </Space>
      </div>

      {/* Meeting Info (if available) */}
      {board.meetingsThisYear !== undefined && !compact && (
        <div style={{ marginBottom: 8 }}>
          <Space size={4}>
            <CalendarOutlined style={{ fontSize: 12, color: theme.primaryColor }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {board.meetingsThisYear} meeting{board.meetingsThisYear !== 1 ? 's' : ''} this year
            </Text>
          </Space>
        </div>
      )}

      {/* Parent Board Info (for subsidiaries/factories) */}
      {board.parentName && !compact && (
        <div>
          <Space size={4}>
            <ApartmentOutlined style={{ fontSize: 12, color: theme.primaryColor }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Part of {board.parentName}
            </Text>
          </Space>
        </div>
      )}

      {/* Last Meeting Date */}
      {board.lastMeetingDate && !compact && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last meeting: {new Date(board.lastMeetingDate).toLocaleDateString()}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default BoardCard;
