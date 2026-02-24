/**
 * Board Memberships Tab
 * Displays user's board and committee assignments with management actions
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Space, Typography, Tag, Button, Empty, Tooltip } from 'antd';
import {
  ApartmentOutlined,
  TeamOutlined,
  StarFilled,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../../types/user.types';
import { useBoardContext } from '../../../contexts';
import { BoardSelector } from '../../../components/users/BoardSelector/BoardSelector';
import type { BoardAssignment } from '../../../pages/Users/CreateUserSteps/types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface BoardMembershipsTabProps {
  user: User;
  themeColor?: string;
}

export const BoardMembershipsTab: React.FC<BoardMembershipsTabProps> = ({ user, themeColor }) => {
  const { allBoards, currentBoard } = useBoardContext();
  const navigate = useNavigate();

  // Get board type from board data using boardId
  const getBoardType = (boardId: number | null): string => {
    if (!boardId) return 'unknown';
    const board = allBoards.find(b => b.id === boardId);
    return board?.type || 'unknown';
  };

  // Get board type icon
  const getBoardTypeIcon = (boardId: number | null) => {
    const boardType = getBoardType(boardId);
    switch (boardType) {
      case 'main':
        return <ApartmentOutlined style={{ color: '#722ed1', fontSize: 32 }} />;
      case 'subsidiary':
        return <ApartmentOutlined style={{ color: '#1890ff', fontSize: 32 }} />;
      case 'committee':
        return <TeamOutlined style={{ color: '#fa8c16', fontSize: 32 }} />;
      case 'factory':
        return <ApartmentOutlined style={{ color: '#52c41a', fontSize: 32 }} />;
      default:
        return <ApartmentOutlined style={{ fontSize: 32 }} />;
    }
  };

  // Get board type color
  const getBoardTypeColor = (boardId: number | null) => {
    const boardType = getBoardType(boardId);
    switch (boardType) {
      case 'main':
        return 'purple';
      case 'subsidiary':
        return 'blue';
      case 'committee':
        return 'orange';
      case 'factory':
        return 'green';
      default:
        return 'default';
    }
  };

  // Check if membership is active (has no end date or end date is in the future)
  const isMembershipActive = (endDate: string | null): boolean => {
    if (!endDate) return true; // No end date means active
    return dayjs(endDate).isAfter(dayjs());
  };

  // Transform user.boardRoles to BoardAssignment format
  const boardAssignments: BoardAssignment[] = useMemo(() => {
    return (user.boardRoles || []).map(role => ({
      boardId: role.boardId || 0,
      boardName: role.boardName || '',
      role: role.roleCode,
      roleId: role.roleId,
      roleName: role.roleName,
      startDate: role.startDate,
      endDate: role.endDate,
      isDefault: role.isDefault,
    }));
  }, [user.boardRoles]);

  // Handle add to board
  const handleAddToBoard = () => {
    // Navigate to EditUserPage with board-assignments tab using current board slug
    navigate(`/${currentBoard.slug}/users/${user.id}/edit?tab=board-assignments`);
  };

  // Handle edit role
  const handleEditRole = (membershipId: number) => {
    // TODO: Open modal to edit role
    console.log('Edit role clicked', membershipId);
  };

  // Handle remove from board
  const handleRemoveFromBoard = (membershipId: number) => {
    // TODO: Open confirmation modal
    console.log('Remove from board clicked', membershipId);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <Space>
          <ApartmentOutlined style={{ fontSize: 20 }} />
          <Text strong style={{ fontSize: 16 }}>Board & Committee Memberships</Text>
          <Tag color={themeColor}>{user.boardRoles?.length || 0}</Tag>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddToBoard}
        >
          Add to Board
        </Button>
      </div>

      {/* Summary Cards - Moved to Top */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Total Boards</Text>
            <Text strong style={{ fontSize: 24, display: 'block', marginTop: 8 }}>
              {user.boardRoles?.length || 0}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Active Memberships</Text>
            <Text strong style={{ fontSize: 24, display: 'block', marginTop: 8 }}>
              {user.boardRoles?.filter(m => isMembershipActive(m.endDate)).length || 0}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Default Board</Text>
            <Text strong style={{ fontSize: 14, display: 'block', marginTop: 8, wordBreak: 'break-word' }}>
              {user.boardRoles?.find(m => m.isDefault)?.boardName || 'None set'}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Board Selector Component */}
      <BoardSelector
        value={boardAssignments}
        mode="view"
        readOnly={true}
        allowRoleChange={false}
      />

      {/* Info Note */}
      <Card bordered={false} size="small" style={{ marginTop: 24, background: '#f0f5ff', borderLeft: '4px solid #1890ff' }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          <strong>Note:</strong> Board memberships determine which boards and committees this user can access.
        </Text>
      </Card>
    </div>
  );
};

export default BoardMembershipsTab;
