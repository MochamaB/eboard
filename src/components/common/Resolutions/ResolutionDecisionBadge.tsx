/**
 * Resolution Decision Badge
 * Displays resolution decision with appropriate styling
 */

import React from 'react';
import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  MinusCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { ResolutionDecision } from '../../../types/resolutions.types';
import { RESOLUTION_DECISION_LABELS } from '../../../types/resolutions.types';

interface ResolutionDecisionBadgeProps {
  decision: ResolutionDecision;
  size?: 'small' | 'default' | 'large';
  showIcon?: boolean;
}

export const ResolutionDecisionBadge: React.FC<ResolutionDecisionBadgeProps> = ({
  decision,
  size = 'default',
  showIcon = true,
}) => {
  const { theme } = useBoardContext();

  const getDecisionConfig = () => {
    switch (decision) {
      case 'approved':
        return {
          label: RESOLUTION_DECISION_LABELS.approved,
          icon: <CheckCircleOutlined />,
          color: theme.successColor,
          bg: theme.successLight,
        };
      case 'rejected':
        return {
          label: RESOLUTION_DECISION_LABELS.rejected,
          icon: <CloseCircleOutlined />,
          color: theme.errorColor,
          bg: theme.errorLight,
        };
      case 'tabled':
        return {
          label: RESOLUTION_DECISION_LABELS.tabled,
          icon: <PauseCircleOutlined />,
          color: theme.warningColor,
          bg: theme.warningLight,
        };
      case 'withdrawn':
        return {
          label: RESOLUTION_DECISION_LABELS.withdrawn,
          icon: <MinusCircleOutlined />,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
      case 'consensus':
        return {
          label: RESOLUTION_DECISION_LABELS.consensus,
          icon: <TeamOutlined />,
          color: theme.infoColor,
          bg: theme.infoLight,
        };
      default:
        return {
          label: decision,
          icon: null,
          color: theme.textSecondary,
          bg: theme.backgroundTertiary,
        };
    }
  };

  const config = getDecisionConfig();

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
