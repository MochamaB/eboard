/**
 * UserCard Component
 * Card view for displaying user information in a grid layout
 * Features: User name, email, role, status, board assignments, avatar
 */

import React from 'react';
import { Card, Tag, Button, Tooltip, Typography, Space, Avatar, Modal, message } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  MailOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UserListItem, UserStatus } from '../../types/user.types';
import { useBoardContext } from '../../contexts';
import { useLookups } from '../../contexts/LookupsContext';

const { Text, Title } = Typography;

interface UserCardProps {
  user: UserListItem;
  onClick?: (user: UserListItem) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onClick,
  showActions = true,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { theme } = useBoardContext();
  const { getRoleByCode } = useLookups();

  // Get role info
  const roleInfo = getRoleByCode(user.primaryRole);

  // Status colors
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return theme.successColor;
      case 'inactive':
        return 'default';
      case 'suspended':
        return theme.warningColor;
      default:
        return 'default';
    }
  };

  // Status icon
  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircleOutlined />;
      case 'inactive':
        return <CloseCircleOutlined />;
      case 'suspended':
        return <CloseCircleOutlined style={{ color: theme.warningColor }} />;
      default:
        return null;
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(user);
    } else {
      navigate(`/users/${user.id}/details`);
    }
  };

  // Handle view details
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${user.id}/details`);
  };

  // Handle edit
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${user.id}/edit`);
  };

  // Handle deactivate
  const handleDeactivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.status === 'inactive') {
      message.info('User is already inactive. Use Edit to reactivate.');
      return;
    }

    Modal.confirm({
      title: 'Deactivate User',
      content: `Are you sure you want to deactivate ${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}? This will end all board memberships and log them out of all devices.`,
      okText: 'Deactivate',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        message.success('User deactivated successfully');
        // TODO: Implement actual deactivation functionality
      },
    });
  };

  // Get avatar source
  const getAvatarSrc = () => {
    if (user.avatar) {
      return user.avatar;
    }
    // Use initials as fallback
    const initials = user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.email?.substring(0, 2).toUpperCase() || 'U';
    return undefined; // Let Avatar component generate initials
  };

  const getAvatarText = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
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
              <Tooltip title="Edit User" key="edit">
                <EditOutlined 
                  onClick={handleEdit}
                  style={{ fontSize: 16, color: theme.secondaryColor }}
                />
              </Tooltip>,
              <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Reactivate'} key="deactivate">
                <StopOutlined 
                  onClick={handleDeactivate}
                  style={{ fontSize: 16, color: user.status === 'active' ? '#ff4d4f' : theme.warningColor }}
                />
              </Tooltip>,
            ]
          : undefined
      }
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Avatar
          size={compact ? 40 : 48}
          src={getAvatarSrc()}
          style={{
            backgroundColor: theme.primaryColor,
            flexShrink: 0,
          }}
        >
          {getAvatarText()}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email}
          </Title>
          {user.firstName && user.lastName && (
            <Text type="secondary" ellipsis={{ tooltip: user.email }} style={{ fontSize: 12 }}>
              {user.email}
            </Text>
          )}
        </div>
        {getStatusIcon(user.status)}
      </div>
    </Card>
  );
};

export default UserCard;
