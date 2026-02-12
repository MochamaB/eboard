/**
 * Board Memberships Tab
 * Displays user's board and committee assignments with management actions
 */

import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, Button, Empty, Tooltip } from 'antd';
import {
  ApartmentOutlined,
  TeamOutlined,
  StarFilled,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { User } from '../../../types/user.types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface BoardMembershipsTabProps {
  user: User;
  themeColor?: string;
}

export const BoardMembershipsTab: React.FC<BoardMembershipsTabProps> = ({ user, themeColor }) => {
  // Get board type icon
  const getBoardTypeIcon = (boardType: string) => {
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
  const getBoardTypeColor = (boardType: string) => {
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

  // Handle add to board
  const handleAddToBoard = () => {
    // TODO: Open modal to add user to board
    console.log('Add to board clicked');
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
          <Tag color={themeColor}>{user.boardMemberships?.length || 0}</Tag>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddToBoard}
        >
          Add to Board
        </Button>
      </div>

      {user.boardMemberships && user.boardMemberships.length > 0 ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Board Memberships Grid */}
          <Row gutter={[16, 16]}>
            {user.boardMemberships.map((membership) => (
              <Col xs={24} sm={24} md={12} lg={8} key={membership.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  bodyStyle={{
                    padding: 20,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Icon and Title */}
                  <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div>{getBoardTypeIcon(membership.boardType)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 16 }}>
                          {membership.boardName}
                        </Text>
                        {membership.isDefault && (
                          <Tooltip title="Default Board">
                            <StarFilled style={{ color: '#faad14', fontSize: 16 }} />
                          </Tooltip>
                        )}
                      </div>
                      <Tag color={getBoardTypeColor(membership.boardType)} style={{ marginBottom: 8 }}>
                        {membership.boardType.toUpperCase()}
                      </Tag>
                    </div>
                  </div>

                  {/* Role and Status */}
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      Role
                    </Text>
                    <Tag color="blue" style={{ marginBottom: 8 }}>
                      {membership.roleName || membership.role}
                    </Tag>
                    <div>
                      {membership.isActive ? (
                        <Tag color="green">Active</Tag>
                      ) : (
                        <Tag color="default">Inactive</Tag>
                      )}
                    </div>
                  </div>

                  {/* Date Info */}
                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Since: {dayjs(membership.startDate).format('MMM D, YYYY')}
                    </Text>
                    {membership.endDate && (
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        Until: {dayjs(membership.endDate).format('MMM D, YYYY')}
                      </Text>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <Tooltip title="Edit Role">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditRole(Number(membership.id))}
                        size="small"
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip title="Remove from Board">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveFromBoard(Number(membership.id))}
                        size="small"
                      >
                        Remove
                      </Button>
                    </Tooltip>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Total Boards</Text>
                <Text strong style={{ fontSize: 24, display: 'block', marginTop: 8 }}>
                  {user.boardMemberships?.length || 0}
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Active Memberships</Text>
                <Text strong style={{ fontSize: 24, display: 'block', marginTop: 8 }}>
                  {user.boardMemberships?.filter(m => m.isActive).length || 0}
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa' }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Default Board</Text>
                <Text strong style={{ fontSize: 14, display: 'block', marginTop: 8, wordBreak: 'break-word' }}>
                  {user.boardMemberships?.find(m => m.isDefault)?.boardName || 'None set'}
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Info Note */}
          <Card bordered={false} size="small" style={{ background: '#f0f5ff', borderLeft: '4px solid #1890ff' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              <strong>Note:</strong> Board memberships determine which boards and committees this user can access.
            </Text>
          </Card>
        </Space>
      ) : (
        <Empty
          description="No board memberships"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '60px 0' }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddToBoard}>
            Add to Board
          </Button>
        </Empty>
      )}
    </div>
  );
};

export default BoardMembershipsTab;
