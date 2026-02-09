/**
 * VoteListItem Component
 * Simple list item for displaying vote information
 * Similar to DocumentListItem but for votes
 */

import React from 'react';
import { Tag, Button, Tooltip, Typography, Space } from 'antd';
import {
  EyeOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { VoteWithResults } from '../../types/voting.types';

const { Text } = Typography;

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  draft: '#8c8c8c',
  configured: '#1890ff',
  open: '#52c41a',
  closed: '#722ed1',
  archived: '#d9d9d9',
};

// Status labels
const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  configured: 'Configured',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
};

// Outcome icons
const OUTCOME_ICONS: Record<string, React.ReactNode> = {
  passed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  failed: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  invalid: <CloseCircleOutlined style={{ color: '#faad14' }} />,
};

interface VoteListItemProps {
  vote: VoteWithResults;
  mode: 'edit' | 'view' | 'execute';
  onViewDetails?: (voteId: string) => void;
  onConfigure?: (voteId: string) => void;
  onDelete?: (voteId: string) => void;
  themeColor?: string;
  showEntityLabel?: boolean;
  entityLabel?: string;
}

export const VoteListItem: React.FC<VoteListItemProps> = ({
  vote,
  mode,
  onViewDetails,
  onConfigure,
  onDelete,
  themeColor = '#1890ff',
  showEntityLabel = false,
  entityLabel,
}) => {
  const statusColor = STATUS_COLORS[vote.status] || '#8c8c8c';
  const statusLabel = STATUS_LABELS[vote.status] || vote.status;
  const outcomeIcon = vote.outcome ? OUTCOME_ICONS[vote.outcome] : null;

  const handleRowClick = () => {
    onViewDetails?.(vote.id);
  };

  // Calculate participation if results available
  const participation = vote.resultsSummary
    ? vote.resultsSummary.totalEligible > 0
      ? Math.round((vote.resultsSummary.totalVoted / vote.resultsSummary.totalEligible) * 100)
      : 0
    : null;

  return (
    <div
      onClick={handleRowClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fff';
      }}
    >
      {/* Vote Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${themeColor}15`,
          borderRadius: 6,
          marginRight: 12,
          fontSize: 20,
          flexShrink: 0,
          color: themeColor,
        }}
      >
        <TrophyOutlined />
      </div>

      {/* Vote Title & Description */}
      <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text
            ellipsis
            style={{ fontSize: 14 }}
          >
            {vote.title}
          </Text>
          {outcomeIcon && (
            <span style={{ fontSize: 16 }}>{outcomeIcon}</span>
          )}
          {showEntityLabel && entityLabel && (
            <Tag 
              icon={<LinkOutlined />}
              color="blue" 
              style={{ fontSize: 10, padding: '0 6px', marginLeft: 4 }}
            >
              {entityLabel}
            </Tag>
          )}
        </div>
        {vote.description && (
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {vote.description}
          </Text>
        )}
      </div>

      {/* Status */}
      <div style={{ width: 100, flexShrink: 0, marginRight: 16 }}>
        <Tag color={statusColor} style={{ fontSize: 11 }}>
          {statusLabel}
        </Tag>
      </div>

      {/* Participation or Config Status */}
      <div style={{ width: 120, flexShrink: 0, marginRight: 16 }}>
        {vote.status === 'draft' && !vote.configuration && (
          <Text type="warning" style={{ fontSize: 12 }}>
            <ClockCircleOutlined /> Not configured
          </Text>
        )}
        {participation !== null && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {participation}% participation
          </Text>
        )}
      </div>

      {/* Date */}
      <div style={{ width: 100, flexShrink: 0, marginRight: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {vote.openedAt
            ? dayjs(vote.openedAt).format('MMM D, YYYY')
            : dayjs(vote.createdAt).format('MMM D, YYYY')}
        </Text>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', gap: 4, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="View Details">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails?.(vote.id)}
            style={{ color: themeColor }}
          />
        </Tooltip>
        {mode === 'edit' && onConfigure && (
          <Tooltip title="Configure">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onConfigure(vote.id)}
              style={{ color: themeColor }}
            />
          </Tooltip>
        )}
        {mode === 'edit' && onDelete && (
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(vote.id)}
              danger
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default VoteListItem;
