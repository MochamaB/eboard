/**
 * Item Type Tag
 * Displays agenda item type with board-themed colors
 */

import React from 'react';
import { Tag } from 'antd';
import {
  CommentOutlined,
  CheckSquareOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { AgendaItemType } from '../../../types/agenda.types';

interface ItemTypeTagProps {
  type: AgendaItemType;
  size?: 'small' | 'default';
  showIcon?: boolean;
}

export const ItemTypeTag: React.FC<ItemTypeTagProps> = ({
  type,
  size = 'default',
  showIcon = true,
}) => {
  const { theme } = useBoardContext();

  const getTypeConfig = () => {
    switch (type) {
      case 'discussion':
        return {
          label: 'Discussion',
          icon: <CommentOutlined />,
          // Use primary color blend for discussion items
          color: theme.primaryColor,
          bg: theme.primaryLight,
        };
      case 'decision':
        return {
          label: 'Decision',
          icon: <CheckSquareOutlined />,
          // Use accent color for important decision items
          color: theme.accentColor,
          bg: `${theme.accentColor}15`, // 15 = hex for ~8% opacity
        };
      case 'information':
        return {
          label: 'Information',
          icon: <InfoCircleOutlined />,
          // Use info color for informational items
          color: theme.infoColor,
          bg: theme.infoLight,
        };
      case 'committee_report':
        return {
          label: 'Committee Report',
          icon: <FileTextOutlined />,
          // Use secondary color for committee reports
          color: theme.secondaryColor,
          bg: `${theme.secondaryColor}15`,
        };
      default:
        return {
          label: type,
          icon: null,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Tag
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.color,
        fontSize: size === 'small' ? '11px' : '12px',
        padding: size === 'small' ? '1px 6px' : '2px 8px',
        fontWeight: 500,
        borderRadius: '3px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {showIcon && config.icon && config.icon}
      {config.label}
    </Tag>
  );
};
