/**
 * Action Item Priority Tag
 * Displays action item priority with color coding
 */

import React from 'react';
import { Tag } from 'antd';
import {
  ArrowDownOutlined,
  MinusOutlined,
  ArrowUpOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { ActionItemPriority } from '../../../types/actionItems.types';
import { ACTION_ITEM_PRIORITY_LABELS } from '../../../types/actionItems.types';

interface ActionItemPriorityTagProps {
  priority: ActionItemPriority;
  size?: 'small' | 'default';
  showIcon?: boolean;
}

export const ActionItemPriorityTag: React.FC<ActionItemPriorityTagProps> = ({
  priority,
  size = 'default',
  showIcon = true,
}) => {
  const { theme } = useBoardContext();

  const getPriorityConfig = () => {
    switch (priority) {
      case 'low':
        return {
          label: ACTION_ITEM_PRIORITY_LABELS.low,
          icon: <ArrowDownOutlined />,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
      case 'medium':
        return {
          label: ACTION_ITEM_PRIORITY_LABELS.medium,
          icon: <MinusOutlined />,
          color: theme.infoColor,
          bg: theme.infoLight,
        };
      case 'high':
        return {
          label: ACTION_ITEM_PRIORITY_LABELS.high,
          icon: <ArrowUpOutlined />,
          color: theme.warningColor,
          bg: theme.warningLight,
        };
      case 'urgent':
        return {
          label: ACTION_ITEM_PRIORITY_LABELS.urgent,
          icon: <WarningOutlined />,
          color: theme.errorColor,
          bg: theme.errorLight,
        };
      default:
        return {
          label: priority,
          icon: null,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
    }
  };

  const config = getPriorityConfig();

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
