/**
 * Meeting Votes Tab
 * Displays all votes conducted in this meeting
 */

import React, { useState } from 'react';
import { Table, Tag, Space, Typography, Button, Empty } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Meeting } from '../../../types/meeting.types';
import type { VoteWithResults } from '../../../types/voting.types';
import { useMeetingVotes } from '../../../hooks/api/useVoting';
import { VoteDetailModal } from '../../../components/Voting';
import dayjs from 'dayjs';

const { Text } = Typography;

interface MeetingVotesTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingVotesTab: React.FC<MeetingVotesTabProps> = ({
  meeting,
  themeColor = '#1890ff',
}) => {
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);

  // Fetch votes for this meeting
  const { data: votes = [], isLoading } = useMeetingVotes(meeting.id);

  // Get outcome badge
  const getOutcomeBadge = (outcome?: 'passed' | 'failed' | 'invalid') => {
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      draft: { color: 'default', label: 'Draft' },
      configured: { color: 'processing', label: 'Configured' },
      open: { color: 'success', label: 'Open' },
      closed: { color: 'default', label: 'Closed' },
      archived: { color: 'default', label: 'Archived' },
    };

    const { color, label } = config[status] || { color: 'default', label: status };
    return <Tag color={color}>{label}</Tag>;
  };

  // Get entity type badge
  const getEntityTypeBadge = (entityType: string) => {
    const config: Record<string, { color: string; label: string }> = {
      agenda_item: { color: 'blue', label: 'Agenda Item' },
      minutes: { color: 'purple', label: 'Minutes' },
      action_item: { color: 'orange', label: 'Action Item' },
      resolution: { color: 'green', label: 'Resolution' },
    };

    const { color, label } = config[entityType] || { color: 'default', label: entityType };
    return <Tag color={color}>{label}</Tag>;
  };

  // Format vote counts
  const getVoteCounts = (vote: VoteWithResults) => {
    if (!vote.resultsSummary?.results || vote.resultsSummary.results.length === 0) {
      return <Text type="secondary">No votes cast</Text>;
    }

    const counts = vote.resultsSummary.results.map(r => (
      <Text key={r.optionId}>
        <strong>{r.optionLabel}:</strong> {r.totalWeight.toFixed(0)}
      </Text>
    ));

    return <Space size="small" direction="vertical">{counts}</Space>;
  };

  // Format time range
  const getTimeRange = (vote: VoteWithResults) => {
    if (!vote.openedAt) return <Text type="secondary">Not opened</Text>;

    const opened = dayjs(vote.openedAt).format('HH:mm');
    const closed = vote.closedAt ? dayjs(vote.closedAt).format('HH:mm') : 'Ongoing';

    return (
      <Text>
        {opened} - {closed}
      </Text>
    );
  };

  // Table columns
  const columns: ColumnsType<VoteWithResults> = [
    {
      title: 'Motion / Title',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (title: string, record: VoteWithResults) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: themeColor }}>{title}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: '15%',
      render: (entityType: string) => getEntityTypeBadge(entityType),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Result',
      dataIndex: 'outcome',
      key: 'outcome',
      width: '12%',
      render: (outcome?: 'passed' | 'failed' | 'invalid') => getOutcomeBadge(outcome),
    },
    {
      title: 'Vote Counts',
      key: 'counts',
      width: '18%',
      render: (_, record: VoteWithResults) => getVoteCounts(record),
    },
    {
      title: 'Time',
      key: 'time',
      width: '13%',
      render: (_, record: VoteWithResults) => getTimeRange(record),
    },
  ];

  // Empty state
  if (!isLoading && votes.length === 0) {
    return (
      <div style={{ padding: '40px 0' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size="small">
              <Text type="secondary">No votes have been conducted in this meeting</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Votes will appear here once they are created during the meeting
              </Text>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Table
        columns={columns}
        dataSource={votes}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        onRow={(record) => ({
          onClick: () => setSelectedVoteId(record.id),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No votes found"
            />
          ),
        }}
      />

      {/* Vote Detail Modal */}
      <VoteDetailModal
        voteId={selectedVoteId}
        open={!!selectedVoteId}
        onClose={() => setSelectedVoteId(null)}
        themeColor={themeColor}
      />
    </div>
  );
};

export default MeetingVotesTab;
