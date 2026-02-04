/**
 * Votes List Component
 * Reusable list for displaying votes for any entity (agenda item, minutes, action item, resolution)
 */

import React, { useState } from 'react';
import { List, Tag, Space, Typography, Empty, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEntityVotes } from '../../hooks/api/useVoting';
import type { VoteEntityType } from '../../types/voting.types';
import { VoteDetailModal } from './VoteDetailModal';

const { Text } = Typography;

interface VotesListProps {
  entityType: VoteEntityType;
  entityId: string;
  themeColor?: string;
  onReopen?: (voteId: string) => void;
}

export const VotesList: React.FC<VotesListProps> = ({
  entityType,
  entityId,
  themeColor = '#1890ff',
  onReopen,
}) => {
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);

  // Fetch votes for this entity
  const { data: votes = [], isLoading } = useEntityVotes(entityType, entityId);

  // Get outcome icon and color
  const getOutcomeDisplay = (outcome?: 'passed' | 'failed' | 'invalid') => {
    if (!outcome) return null;

    const config = {
      passed: { icon: <CheckCircleOutlined />, color: 'success', label: 'Passed' },
      failed: { icon: <CloseCircleOutlined />, color: 'error', label: 'Failed' },
      invalid: { icon: <ExclamationCircleOutlined />, color: 'warning', label: 'Invalid' },
    };

    const { icon, color, label } = config[outcome];
    return (
      <Tag icon={icon} color={color}>
        {label}
      </Tag>
    );
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    const config: Record<string, { color: string; label: string; icon?: React.ReactNode }> = {
      draft: { color: 'default', label: 'Draft', icon: <ClockCircleOutlined /> },
      configured: { color: 'processing', label: 'Configured', icon: <ClockCircleOutlined /> },
      open: { color: 'success', label: 'Open', icon: <ClockCircleOutlined /> },
      closed: { color: 'default', label: 'Closed', icon: <ClockCircleOutlined /> },
      archived: { color: 'default', label: 'Archived', icon: <ClockCircleOutlined /> },
    };

    const { color, label, icon } = config[status] || { color: 'default', label: status };
    return (
      <Tag icon={icon} color={color}>
        {label}
      </Tag>
    );
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin />
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No votes found for this item"
      />
    );
  }

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={votes}
        renderItem={(vote) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedVoteId(vote.id)}
            actions={[
              <Space key="status">
                {getStatusDisplay(vote.status)}
                {vote.outcome && getOutcomeDisplay(vote.outcome)}
              </Space>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                  <Text strong style={{ color: themeColor }}>
                    {vote.title}
                  </Text>
                  {vote.openedAt && vote.closedAt && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(vote.openedAt).format('MMM DD, HH:mm')} -{' '}
                      {dayjs(vote.closedAt).format('HH:mm')}
                    </Text>
                  )}
                </Space>
              }
              description={
                vote.description && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {vote.description}
                  </Text>
                )
              }
            />
          </List.Item>
        )}
      />

      {/* Vote Detail Modal */}
      <VoteDetailModal
        voteId={selectedVoteId}
        open={!!selectedVoteId}
        onClose={() => setSelectedVoteId(null)}
        themeColor={themeColor}
        onReopen={onReopen}
      />
    </>
  );
};

export default VotesList;
