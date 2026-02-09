/**
 * Meeting Votes Tab
 * Displays all votes conducted in this meeting
 */

import React, { useMemo } from 'react';
import { Alert, Card, Row, Col, Statistic } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { Meeting } from '../../../types/meeting.types';
import { useMeetingVotes } from '../../../hooks/api/useVoting';
import { VotesView } from '../../../components/Voting';
import { useAgenda } from '../../../hooks/api';
import { useMeetingPermissions } from '../../../hooks/meetings';

interface MeetingVotesTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingVotesTab: React.FC<MeetingVotesTabProps> = ({
  meeting,
  themeColor = '#1890ff',
}) => {
  // Fetch votes for this meeting
  const { data: votes = [] } = useMeetingVotes(meeting.id);

  // Fetch agenda to get agenda items for vote creation
  const { data: agenda } = useAgenda(meeting.id);

  // Get permissions
  const permissions = useMeetingPermissions();

  // Status flags
  const isCancelled = meeting.status === 'cancelled';
  const isCompleted = meeting.status.startsWith('completed');
  const isInProgress = meeting.status === 'in_progress';
  const isApproved = meeting.status === 'scheduled' && meeting.subStatus === 'approved';
  const isRejected = meeting.status === 'scheduled' && meeting.subStatus === 'rejected';

  // Determine view mode
  const getViewMode = (): 'edit' | 'view' | 'execute' => {
    if (isInProgress) return 'execute';
    
    const isEditableByStatus = 
      meeting.status === 'draft' || 
      (meeting.status === 'scheduled' && (meeting.subStatus === 'pending_approval' || meeting.subStatus === 'rejected'));
    
    if (permissions.canEditAgenda || isEditableByStatus) {
      return 'edit';
    }
    
    return 'view';
  };

  const viewMode = getViewMode();
  const canManageVotes = viewMode === 'edit';

  // Calculate post-meeting statistics
  const voteStats = useMemo(() => {
    if (!isCompleted || votes.length === 0) return null;

    const total = votes.length;
    const passed = votes.filter(v => v.outcome === 'passed').length;
    const failed = votes.filter(v => v.outcome === 'failed').length;
    const invalid = votes.filter(v => v.outcome === 'invalid').length;
    
    // Calculate average participation rate
    const votesWithResults = votes.filter(v => v.resultsSummary);
    const avgParticipation = votesWithResults.length > 0
      ? votesWithResults.reduce((sum, v) => {
          const summary = v.resultsSummary;
          if (!summary) return sum;
          const rate = summary.totalEligible > 0 ? (summary.totalVoted / summary.totalEligible) * 100 : 0;
          return sum + rate;
        }, 0) / votesWithResults.length
      : 0;

    return {
      total,
      passed,
      failed,
      invalid,
      avgParticipation: Math.round(avgParticipation),
    };
  }, [votes, isCompleted]);

  return (
    <div style={{ width: '100%' }}>
      {/* Cancellation Banner */}
      {isCancelled && (
        <Alert
          message="Meeting Cancelled"
          description="This meeting has been cancelled. Votes are read-only."
          type="warning"
          icon={<StopOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Approved Banner */}
      {isApproved && (
        <Alert
          message="Meeting Approved"
          description="This meeting has been approved. Votes can be configured but not opened until the meeting starts."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <Alert
          message="Meeting Rejected"
          description="This meeting was rejected. You can revise votes and resubmit."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Post-Meeting Summary */}
      {isCompleted && voteStats && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Statistic
                title="Total Votes"
                value={voteStats.total}
                prefix={<TrophyOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Passed"
                value={voteStats.passed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Failed"
                value={voteStats.failed}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Avg Participation"
                value={voteStats.avgParticipation}
                suffix="%"
                prefix={<ExclamationCircleOutlined />}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Votes View */}
      <VotesView
        meetingId={meeting.id}
        mode={viewMode}
        boardId={meeting.boardId}
        agendaId={agenda?.id}
        agendaItems={agenda?.items?.map(item => ({
          id: item.id,
          title: item.title,
          itemNumber: item.itemNumber,
          parentItemId: item.parentItemId,
        })) || []}
        canManageVotes={canManageVotes}
        canCastVote={viewMode === 'execute'}
        themeColor={themeColor}
      />
    </div>
  );
};

export default MeetingVotesTab;
