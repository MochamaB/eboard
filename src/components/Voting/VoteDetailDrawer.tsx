/**
 * Vote Detail Drawer
 * Comprehensive vote details with results, individual votes, audit log, and vote casting
 * Mode-aware for edit/view/execute contexts
 */

import React from 'react';
import {
  Drawer,
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
  Modal,
  message,
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
  PlayCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useVote, useVoteResults, useVoteActions, useOpenVote, useCloseVote, useReopenVote } from '../../hooks/api/useVoting';
import { VoteCastForm } from './VoteCastForm';

const { Title, Text, Paragraph } = Typography;

interface VoteDetailDrawerProps {
  voteId: string | null;
  open: boolean;
  onClose: () => void;
  mode: 'edit' | 'view' | 'execute';
  meetingStatus?: string;
  canManageVote?: boolean;
  canCastVote?: boolean;
  currentUserId?: number;
  themeColor?: string;
  onConfigure?: (voteId: string) => void;
  onDelete?: (voteId: string) => void;
}

export const VoteDetailDrawer: React.FC<VoteDetailDrawerProps> = ({
  voteId,
  open,
  onClose,
  mode,
  canManageVote = false,
  canCastVote = false,
  currentUserId = 1,
  themeColor = '#1890ff',
  onConfigure,
  onDelete,
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

  // Mutations
  const openVoteMutation = useOpenVote(voteId || '', {
    onSuccess: () => {
      message.success('Vote opened successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to open vote: ${error.message}`);
    },
  });

  const closeVoteMutation = useCloseVote(voteId || '', {
    onSuccess: () => {
      message.success('Vote closed successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to close vote: ${error.message}`);
    },
  });

  const reopenVoteMutation = useReopenVote(voteId || '', {
    onSuccess: () => {
      message.success('Vote reopened successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to reopen vote: ${error.message}`);
    },
  });

  const isLoading = voteLoading || resultsLoading || actionsLoading;

  if (!voteId) return null;

  // Check if current user has voted
  const hasVoted = vote?.votes?.some(v => v.userId === currentUserId) || false;
  const currentUserVote = vote?.votes?.find(v => v.userId === currentUserId);

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
            </Space>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  // Render action buttons based on mode and vote status
  const renderActions = () => {
    if (mode === 'view') return null;

    const actions: React.ReactNode[] = [];

    if (mode === 'edit') {
      // Edit mode: Configure, Delete
      if (vote?.status === 'draft' || vote?.status === 'configured') {
        if (onConfigure) {
          actions.push(
            <Button
              key="configure"
              icon={<SettingOutlined />}
              onClick={() => onConfigure(voteId)}
            >
              {vote?.status === 'draft' ? 'Configure' : 'Edit Configuration'}
            </Button>
          );
        }
        if (onDelete) {
          actions.push(
            <Button
              key="delete"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Vote?',
                  content: 'Are you sure you want to delete this vote? This action cannot be undone.',
                  okText: 'Yes, Delete',
                  okType: 'danger',
                  cancelText: 'Cancel',
                  onOk: () => onDelete(voteId),
                });
              }}
            >
              Delete
            </Button>
          );
        }
      }
    }

    if (mode === 'execute') {
      // Execute mode: Open, Close, Reopen
      if (vote?.status === 'configured' && canManageVote) {
        actions.push(
          <Button
            key="open"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => openVoteMutation.mutate(undefined)}
            loading={openVoteMutation.isPending}
          >
            Open Vote
          </Button>
        );
      }

      if (vote?.status === 'open' && canManageVote) {
        actions.push(
          <Button
            key="close"
            icon={<StopOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Close Vote?',
                content: 'Are you sure you want to close this vote? Results will be finalized.',
                okText: 'Yes, Close Vote',
                cancelText: 'Cancel',
                onOk: () => closeVoteMutation.mutate({ force: false }),
              });
            }}
            loading={closeVoteMutation.isPending}
          >
            Close Vote
          </Button>
        );
      }

      if (vote?.status === 'closed' && canManageVote) {
        actions.push(
          <Button
            key="reopen"
            icon={<ReloadOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Reopen Vote?',
                content: 'Are you sure you want to reopen this vote? This action will be recorded in the audit log.',
                okText: 'Yes, Reopen',
                cancelText: 'Cancel',
                onOk: () => reopenVoteMutation.mutate({ reason: 'Reopened by moderator' }),
              });
            }}
            loading={reopenVoteMutation.isPending}
          >
            Reopen Vote
          </Button>
        );
      }
    }

    return actions.length > 0 ? (
      <Space style={{ marginBottom: 16 }}>
        {actions}
      </Space>
    ) : null;
  };

  return (
    <Drawer
      title={vote?.title || 'Vote Details'}
      open={open}
      onClose={onClose}
      width={720}
      placement="right"
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Description */}
          {vote?.description && (
            <Paragraph type="secondary">{vote.description}</Paragraph>
          )}

          {/* Action Buttons */}
          {renderActions()}

          {/* Vote Cast Form (if vote is open and user can vote) */}
          {vote?.status === 'open' && canCastVote && mode === 'execute' && vote.options && (
            <>
              <VoteCastForm
                voteId={voteId}
                options={vote.options}
                hasVoted={hasVoted}
                currentVote={currentUserVote?.optionId}
                allowChange={vote.configuration?.allowChangeVote}
                onSuccess={() => {
                  message.success('Vote cast successfully');
                }}
              />
              <Divider />
            </>
          )}

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

          {outcomeConfig && <Divider />}

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
    </Drawer>
  );
};

export default VoteDetailDrawer;
