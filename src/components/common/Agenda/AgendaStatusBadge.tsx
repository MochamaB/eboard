/**
 * Agenda Status Badge
 * Displays agenda status with board-themed colors
 */

import React from 'react';
import { Tag } from 'antd';
import { CheckCircleOutlined, EditOutlined, InboxOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { AgendaStatus } from '../../../types/agenda.types';

interface AgendaStatusBadgeProps {
  status: AgendaStatus;
  size?: 'small' | 'default' | 'large';
  showIcon?: boolean;
}

export const AgendaStatusBadge: React.FC<AgendaStatusBadgeProps> = ({
  status,
  size = 'default',
  showIcon = true,
}) => {
  const { theme } = useBoardContext();

  const getStatusConfig = () => {
    switch (status) {
      case 'published':
        return {
          label: 'Published',
          icon: <CheckCircleOutlined />,
          color: theme.successColor,
          bg: theme.successLight,
        };
      case 'draft':
        return {
          label: 'Draft',
          icon: <EditOutlined />,
          color: theme.warningColor,
          bg: theme.warningLight,
        };
      case 'archived':
        return {
          label: 'Archived',
          icon: <InboxOutlined />,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
      default:
        return {
          label: status,
          icon: null,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tag
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.color,
        fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
        padding: size === 'small' ? '2px 8px' : size === 'large' ? '6px 16px' : '4px 12px',
        fontWeight: 500,
        borderRadius: '4px',
      }}
    >
      {showIcon && config.icon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
      {config.label}
    </Tag>
  );
};
