/**
 * Action Item Status Tag
 * Displays action item status with color coding
 */

import React from 'react';
import { Tag } from 'antd';
import {
  FileTextOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { ActionItemStatus } from '../../../types/actionItems.types';
import { ACTION_ITEM_STATUS_LABELS } from '../../../types/actionItems.types';

interface ActionItemStatusTagProps {
  status: ActionItemStatus;
  size?: 'small' | 'default';
  showIcon?: boolean;
}

export const ActionItemStatusTag: React.FC<ActionItemStatusTagProps> = ({
  status,
  size = 'default',
  showIcon = true,
}) => {
  const { theme } = useBoardContext();

  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          label: ACTION_ITEM_STATUS_LABELS.open,
          icon: <FileTextOutlined />,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
      case 'in_progress':
        return {
          label: ACTION_ITEM_STATUS_LABELS.in_progress,
          icon: <SyncOutlined spin />,
          color: theme.infoColor,
          bg: theme.infoLight,
        };
      case 'completed':
        return {
          label: ACTION_ITEM_STATUS_LABELS.completed,
          icon: <CheckCircleOutlined />,
          color: theme.successColor,
          bg: theme.successLight,
        };
      case 'cancelled':
        return {
          label: ACTION_ITEM_STATUS_LABELS.cancelled,
          icon: <CloseCircleOutlined />,
          color: theme.errorColor,
          bg: theme.errorLight,
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
        fontSize: size === 'small' ? '12px' : '14px',
        padding: size === 'small' ? '2px 8px' : '4px 12px',
        fontWeight: 500,
        borderRadius: '4px',
      }}
    >
      {showIcon && config.icon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
      {config.label}
    </Tag>
  );
};
