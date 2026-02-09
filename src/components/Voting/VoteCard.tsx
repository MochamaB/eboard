/**
 * Vote Card Component
 * Card-based display for individual votes with inline actions and visual states
 */

import React from 'react';
import { Card, Space, Tag, Progress, Typography, Button, Row, Col, Badge } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  EyeOutlined,
  SettingOutlined,
  DeleteOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { VoteWithResults } from '../../types/voting.types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface VoteCardProps {
  vote: VoteWithResults;
  mode: 'edit' | 'view' | 'execute';
  onOpen?: (voteId: string) => void;
  onClose?: (voteId: string) => void;
  onConfigure?: (voteId: string) => void;
  onDelete?: (voteId: string) => void;
  onViewDetails?: (voteId: string) => void;
  themeColor?: string;
}

export const VoteCard: React.FC<VoteCardProps> = ({
  vote,
  mode,
  onOpen,
  onClose,
  onConfigure,
  onDelete,
  onViewDetails,
  themeColor = '#1890ff',
}) => {
  // Get status badge configuration
  const getStatusBadge = () => {
    const configs: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      draft: { color: 'default', label: 'Draft', icon: <ClockCircleOutlined /> },
      configured: { color: 'processing', label: 'Ready', icon: <CheckCircleOutlined /> },
      open: { color: 'success', label: 'Voting Now', icon: <PlayCircleOutlined /> },
      closed: { color: 'default', label: 'Closed', icon: <StopOutlined /> },
      archived: { color: 'default', label: 'Archived', icon: <ClockCircleOutlined /> },
    };

    const config = configs[vote.status] || { color: 'default', label: vote.status, icon: null };
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.label}
      </Tag>
    );
  };

  // Get outcome badge configuration
  const getOutcomeBadge = () => {
    if (!vote.outcome) return null;

    const configs = {
      passed: { icon: <CheckCircleOutlined />, color: 'success', label: 'Passed' },
      failed: { icon: <CloseCircleOutlined />, color: 'error', label: 'Failed' },
      invalid: { icon: <ExclamationCircleOutlined />, color: 'warning', label: 'Invalid' },
    };

    const config = configs[vote.outcome];
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.label}
      </Tag>
    );
  };

  // Get card border color based on status
  const getBorderColor = () => {
    if (vote.status === 'open') return '#52c41a'; // Green for active voting
    if (vote.status === 'configured') return themeColor; // Theme color for ready
    if (vote.outcome === 'passed') return '#52c41a'; // Green for passed
    if (vote.outcome === 'failed') return '#ff4d4f'; // Red for failed
    return '#d9d9d9'; // Default gray
  };

  // Render vote results progress bars
  const renderResults = () => {
    if (!vote.resultsSummary?.results || vote.resultsSummary.results.length === 0) {
      return <Text type="secondary">No votes cast yet</Text>;
    }

    const totalVotes = vote.resultsSummary.totalVoted || 0;

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {vote.resultsSummary.results.slice(0, 3).map((result) => {
          const percentage = totalVotes > 0 ? (result.totalWeight / totalVotes) * 100 : 0;

          return (
            <div key={result.optionId}>
              <Row justify="space-between" style={{ marginBottom: 4 }}>
                <Col>
                  <Text strong style={{ fontSize: 12 }}>
                    {result.optionLabel}
                  </Text>
                </Col>
                <Col>
                  <Text style={{ fontSize: 12 }}>
                    {result.totalWeight.toFixed(0)} ({percentage.toFixed(1)}%)
                  </Text>
                </Col>
              </Row>
              <Progress
                percent={percentage}
                strokeColor={themeColor}
                showInfo={false}
                size="small"
              />
            </div>
          );
        })}
      </Space>
    );
  };

  // Render action buttons based on mode and status
  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    // View Details button (always available)
    if (onViewDetails) {
      actions.push(
        <Button
          key="view"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(vote.id)}
        >
          View Details
        </Button>
      );
    }

    if (mode === 'edit') {
      // Edit mode: Configure, Delete
      if ((vote.status === 'draft' || vote.status === 'configured') && onConfigure) {
        actions.push(
          <Button
            key="configure"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => onConfigure(vote.id)}
          >
            {vote.status === 'draft' ? 'Configure' : 'Edit'}
          </Button>
        );
      }
      if ((vote.status === 'draft' || vote.status === 'configured') && onDelete) {
        actions.push(
          <Button
            key="delete"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(vote.id)}
          >
            Delete
          </Button>
        );
      }
    }

    if (mode === 'execute') {
      // Execute mode: Open, Close
      if (vote.status === 'configured' && onOpen) {
        actions.push(
          <Button
            key="open"
            size="small"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => onOpen(vote.id)}
          >
            Open Vote
          </Button>
        );
      }
      if (vote.status === 'open' && onClose) {
        actions.push(
          <Button
            key="close"
            size="small"
            icon={<StopOutlined />}
            onClick={() => onClose(vote.id)}
          >
            Close Vote
          </Button>
        );
      }
    }

    return actions;
  };

  // Get participation info
  const getParticipationInfo = () => {
    if (!vote.resultsSummary) return null;

    const { totalEligible, totalVoted, quorumMet } = vote.resultsSummary;
    const participationRate = totalEligible > 0 ? (totalVoted / totalEligible) * 100 : 0;

    return (
      <Space size="middle">
        <Text type="secondary" style={{ fontSize: 12 }}>
          Votes: {totalVoted}/{totalEligible}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          •
        </Text>
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            color: quorumMet ? '#52c41a' : '#ff4d4f',
          }}
        >
          Quorum: {quorumMet ? 'Met' : 'Not Met'}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          •
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {participationRate.toFixed(0)}% participation
        </Text>
      </Space>
    );
  };

  // Get time info
  const getTimeInfo = () => {
    if (vote.status === 'open' && vote.openedAt) {
      const duration = dayjs().diff(dayjs(vote.openedAt), 'minute');
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ClockCircleOutlined /> Open for {duration} min
        </Text>
      );
    }
    if (vote.closedAt) {
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Closed at {dayjs(vote.closedAt).format('HH:mm')}
        </Text>
      );
    }
    return null;
  };

  const actions = renderActions();

  return (
    <Badge.Ribbon
      text={vote.status === 'open' ? 'VOTING NOW' : undefined}
      color={vote.status === 'open' ? 'green' : undefined}
    >
      <Card
        size="small"
        hoverable
        onClick={() => onViewDetails?.(vote.id)}
        style={{
          borderLeft: `4px solid ${getBorderColor()}`,
          cursor: 'pointer',
          marginBottom: 12,
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* Header */}
          <Row justify="space-between" align="middle">
            <Col flex="auto">
              <Space>
                <TrophyOutlined style={{ color: themeColor }} />
                <Text strong style={{ fontSize: 14 }}>
                  {vote.title}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space size="small">
                {getStatusBadge()}
                {getOutcomeBadge()}
              </Space>
            </Col>
          </Row>

          {/* Description */}
          {vote.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {vote.description}
            </Text>
          )}

          {/* Results */}
          {vote.resultsSummary && vote.resultsSummary.results.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {renderResults()}
            </div>
          )}

          {/* Participation Info */}
          {vote.resultsSummary && (
            <div style={{ marginTop: 8 }}>
              {getParticipationInfo()}
            </div>
          )}

          {/* Time Info */}
          {getTimeInfo() && (
            <div style={{ marginTop: 4 }}>
              {getTimeInfo()}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div
              style={{ marginTop: 12 }}
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
            >
              <Space size="small">
                {actions}
              </Space>
            </div>
          )}

          {/* Warning for draft votes */}
          {vote.status === 'draft' && (
            <Text type="warning" style={{ fontSize: 12 }}>
              <ExclamationCircleOutlined /> Not configured yet
            </Text>
          )}
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

export default VoteCard;
