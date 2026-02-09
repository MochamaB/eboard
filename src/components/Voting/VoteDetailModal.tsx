/**
 * Vote Detail Modal
 * Comprehensive vote details with results, individual votes, and audit log
 */

import React from 'react';
import {
  Modal,
  Space,
  Typography,
  Tag,
  Progress,
  Divider,
  Timeline,
  List,
  Avatar,
  Button,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  PercentageOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useVote, useVoteResults, useVoteActions } from '../../hooks/api/useVoting';

const { Title, Text, Paragraph } = Typography;

interface VoteDetailModalProps {
  voteId: string | null;
  open: boolean;
  onClose: () => void;
  themeColor?: string;
  onReopen?: (voteId: string) => void;
}

export const VoteDetailModal: React.FC<VoteDetailModalProps> = ({
  voteId,
  open,
  onClose,
  themeColor = '#1890ff',
  onReopen,
}) => {
  // Fetch vote details
  const { data: vote, isLoading: voteLoading } = useVote(voteId || '', {
    enabled: !!voteId && open,
  });

  // Fetch results
  const { data: results, isLoading: resultsLoading } = useVoteResults(voteId || '', {
    enabled: !!voteId && open,
  });

  // Fetch actions (audit log)
  const { data: actions = [], isLoading: actionsLoading } = useVoteActions(voteId || '', {
    enabled: !!voteId && open,
  });

  const isLoading = voteLoading || resultsLoading || actionsLoading;

  if (!voteId) return null;

  // Get outcome configuration
  const getOutcomeConfig = (outcome?: 'passed' | 'failed' | 'invalid') => {
    if (!outcome) return null;

    const configs = {
      passed: {
        icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
        color: '#52c41a',
        label: 'PASSED',
        bgColor: '#f6ffed',
      },
      failed: {
        icon: <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />,
        color: '#ff4d4f',
        label: 'FAILED',
        bgColor: '#fff2f0',
      },
      invalid: {
        icon: <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />,
        color: '#faad14',
        label: 'INVALID',
        bgColor: '#fffbe6',
      },
    };

    return configs[outcome];
  };

  const outcomeConfig = getOutcomeConfig(vote?.outcome);

  // Render result breakdown
  const renderResultBreakdown = () => {
    if (!results || !results.results || results.results.length === 0) {
      return <Text type="secondary">No votes cast yet</Text>;
    }

    const totalVotes = results.totalVoted || 0;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {results.results.map((result) => {
          const percentage = totalVotes > 0 ? (result.totalWeight / totalVotes) * 100 : 0;

          return (
            <div key={result.optionId}>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col>
                  <Text strong>{result.optionLabel}</Text>
                </Col>
                <Col>
                  <Text strong>
                    {result.totalWeight.toFixed(0)} votes ({percentage.toFixed(1)}%)
                  </Text>
                </Col>
              </Row>
              <Progress
                percent={percentage}
                strokeColor={themeColor}
                showInfo={false}
              />
            </div>
          );
        })}
      </Space>
    );
  };

  // Render individual votes (if not anonymous)
  const renderIndividualVotes = () => {
    if (!vote?.votes || vote.votes.length === 0) {
      return <Empty description="No votes cast yet" />;
    }

    // Check if anonymous
    const isAnonymous = vote.configuration?.anonymous;

    if (isAnonymous) {
      return (
        <Empty
          description="Anonymous voting - individual votes are hidden"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={vote.votes}
        renderItem={(cast) => {
          // Find the option label
          const option = vote.options?.find((o) => o.id === cast.optionId);
          const optionLabel = option?.label || 'Unknown';

          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={cast.userName || 'Anonymous'}
                description={
                  <Space size="small">
                    <Tag color={themeColor}>{optionLabel}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(cast.castAt).format('MMM DD, YYYY HH:mm')}
                    </Text>
                  </Space>
                }
              />
              <div>
                <Text type="secondary">Weight: {cast.weightApplied.toFixed(1)}</Text>
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  // Render audit timeline
  const renderAuditLog = () => {
    if (actions.length === 0) {
      return <Empty description="No actions recorded" />;
    }

    const getActionIcon = (actionType: string) => {
      const icons: Record<string, React.ReactNode> = {
        created: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
        configured: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
        opened: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        vote_cast: <CheckCircleOutlined style={{ color: themeColor }} />,
        vote_changed: <ReloadOutlined style={{ color: '#faad14' }} />,
        closed: <CloseCircleOutlined style={{ color: '#8c8c8c' }} />,
        results_generated: <TrophyOutlined style={{ color: '#faad14' }} />,
        reopened: <ReloadOutlined style={{ color: '#1890ff' }} />,
        archived: <ClockCircleOutlined style={{ color: '#8c8c8c' }} />,
      };

      return icons[actionType] || <ClockCircleOutlined />;
    };

    const getActionLabel = (actionType: string) => {
      const labels: Record<string, string> = {
        created: 'Vote Created',
        configured: 'Configuration Set',
        opened: 'Voting Opened',
        vote_cast: 'Vote Cast',
        vote_changed: 'Vote Changed',
        closed: 'Voting Closed',
        results_generated: 'Results Generated',
        reopened: 'Voting Reopened',
        archived: 'Vote Archived',
      };

      return labels[actionType] || actionType;
    };

    return (
      <Timeline mode="left">
        {actions.map((action) => (
          <Timeline.Item
            key={action.id}
            dot={getActionIcon(action.actionType)}
            label={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(action.createdAt).format('MMM DD, HH:mm')}
              </Text>
            }
          >
            <Space direction="vertical" size={0}>
              <Text strong>{getActionLabel(action.actionType)}</Text>
              <Text type="secondary">{action.performedByName}</Text>
              {action.metadata && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {JSON.stringify(action.metadata, null, 2)}
                </Text>
              )}
            </Space>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        onReopen && vote?.status === 'closed' && (
          <Button
            key="reopen"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => onReopen(voteId)}
          >
            Reopen Vote
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Motion Title */}
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ marginBottom: 8 }}>
              {vote?.title}
            </Title>
            {vote?.description && (
              <Paragraph type="secondary">{vote.description}</Paragraph>
            )}
          </div>

          {/* Outcome Badge */}
          {outcomeConfig && (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                backgroundColor: outcomeConfig.bgColor,
                borderRadius: 8,
              }}
            >
              {outcomeConfig.icon}
              <div style={{ marginTop: 12 }}>
                <Text
                  strong
                  style={{ fontSize: 24, color: outcomeConfig.color }}
                >
                  {outcomeConfig.label}
                </Text>
              </div>
            </div>
          )}

          <Divider />

          {/* Statistics */}
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Total Eligible"
                value={results?.totalEligible || 0}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Votes Cast"
                value={results?.totalVoted || 0}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Quorum"
                value={results?.quorumMet ? 'Met' : 'Not Met'}
                valueStyle={{
                  color: results?.quorumMet ? '#52c41a' : '#ff4d4f',
                }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Threshold"
                value={vote?.configuration?.passThresholdPercentage || 0}
                suffix="%"
                prefix={<PercentageOutlined />}
              />
            </Col>
          </Row>

          <Divider />

          {/* Vote Breakdown */}
          <div>
            <Title level={5}>Vote Breakdown</Title>
            {renderResultBreakdown()}
          </div>

          <Divider />

          {/* Individual Votes */}
          <div>
            <Title level={5}>Individual Votes</Title>
            {renderIndividualVotes()}
          </div>

          <Divider />

          {/* Audit Log */}
          <div>
            <Title level={5}>Activity Timeline</Title>
            {renderAuditLog()}
          </div>
        </Space>
      )}
    </Modal>
  );
};

export default VoteDetailModal;
