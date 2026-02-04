/**
 * Minutes Status Badge
 * Displays minutes workflow status with board-themed colors
 */

import React from 'react';
import { Tag } from 'antd';
import {
  EditOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { MinutesStatus } from '../../../types/minutes.types';

interface MinutesStatusBadgeProps {
  status: MinutesStatus;
  size?: 'small' | 'default' | 'large';
  showIcon?: boolean;
}

export const MinutesStatusBadge: React.FC<MinutesStatusBadgeProps> = ({
  status,
  size = 'default',
  showIcon = true,
}) => {
  const { theme } = useBoardContext();

  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          icon: <EditOutlined />,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
      case 'pending_review':
        return {
          label: 'Pending Review',
          icon: <ClockCircleOutlined />,
          color: theme.warningColor,
          bg: theme.warningLight,
        };
      case 'revision_requested':
        return {
          label: 'Revision Requested',
          icon: <ExclamationCircleOutlined />,
          color: theme.errorColor,
          bg: theme.errorLight,
        };
      case 'approved':
        return {
          label: 'Approved',
          icon: <CheckCircleOutlined />,
          color: theme.infoColor,
          bg: theme.infoLight,
        };
      case 'published':
        return {
          label: 'Published',
          icon: <GlobalOutlined />,
          color: theme.successColor,
          bg: theme.successLight,
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
