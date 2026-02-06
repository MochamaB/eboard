/**
 * Approval Review Page
 * Review a single meeting and approve/reject confirmation
 * Two-column layout: Meeting Notice document (left), Actions/History (right)
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tag,
  Alert,
  Spin,
  Empty,
  Timeline,
  message,
  Grid,
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ArrowLeftOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  DownloadOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../contexts';
import { useAuth } from '../../contexts/AuthContext';
import { useMeeting, useMeetingEvents } from '../../hooks/api/useMeetings';
import { useAgenda } from '../../hooks/api/useAgenda';
import {
  MEETING_EVENT_LABELS,
  REJECTION_REASON_LABELS,
} from '../../types/meeting.types';
import type { MeetingEvent } from '../../types/meeting.types';
import { SignatureModal, RejectionModal } from './components';
import { MeetingNoticeDocument, MeetingStatusBadge } from '../../components/Meetings';
import {
  canUserApproveMeeting,
  getUserCertificateStatus,
  getConfirmationDisplayInfo,
  type ApproverInfo,
  type CertificateStatus,
} from '../../utils/confirmationWorkflow';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export const ApprovalReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { boardId, meetingId } = useParams<{ boardId: string; meetingId: string }>();
  const screens = useBreakpoint();
  const { theme, logo, currentBoard } = useBoardContext();
  const { user } = useAuth();
  
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

  const { data: meeting, isLoading: meetingLoading, error: meetingError } = useMeeting(meetingId || '');
  const { data: eventsData, isLoading: eventsLoading } = useMeetingEvents(meetingId || '');
  const { data: agendaData, isLoading: agendaLoading } = useAgenda(meetingId || '');

  // Check if current user can approve this meeting
  const approverInfo: ApproverInfo | null = user && meeting 
    ? canUserApproveMeeting(user.id, meeting.boardId)
    : null;
  
  // Get user's certificate status
  const certStatus: CertificateStatus | null = user 
    ? getUserCertificateStatus(user.id)
    : null;
  
  // Get confirmation display info for the document
  const confirmationInfo = meeting
    ? getConfirmationDisplayInfo(
        meeting.id,
        Number(meeting.createdBy),
        meeting.createdByName || 'Board Secretary',
        meeting.createdAt,
        meeting.boardId
      )
    : undefined;
  
  // Responsive check - must be after all hooks
  const isMobile = !screens.md;

  const meetingEvents = eventsData?.data || [];

  // Recalculate confirmation info with fresh events data
  const confirmationInfoWithEvents = meeting
    ? getConfirmationDisplayInfo(
        meeting.id,
        Number(meeting.createdBy),
        meeting.createdByName || 'Board Secretary',
        meeting.createdAt,
        meeting.boardId,
        meetingEvents
      )
    : confirmationInfo;

  const handleBack = () => {
    navigate(`/${boardId}/approvals`);
  };

  const handleApproveSuccess = () => {
    message.success('Meeting confirmed successfully');
    setSignatureModalOpen(false);
    navigate(`/${boardId}/approvals`);
  };

  const handleRejectSuccess = () => {
    message.success('Meeting confirmation rejected');
    setRejectionModalOpen(false);
    navigate(`/${boardId}/approvals`);
  };

  const getTimelineItemColor = (eventType: string): string => {
    const colors: Record<string, string> = {
      submitted: 'blue',
      confirmed: 'green',
      rejected: 'red',
      superseded: 'gray',
      resubmitted: 'orange',
    };
    return colors[eventType] || 'gray';
  };

  // Get agenda items
  const agendaItems = agendaData?.items || [];

  if (meetingLoading || eventsLoading || agendaLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (meetingError || !meeting) {
    return (
      <div style={{ padding: 24 }}>
        <Empty
          description="Meeting not found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleBack}>
            Back to Approvals
          </Button>
        </Empty>
      </div>
    );
  }

  const isPending = meeting.status === 'scheduled' && meeting.subStatus === 'pending_approval';
  const canApprove = approverInfo?.canApprove ?? false;
  const hasCertificateIssue = certStatus ? (!certStatus.hasCertificate || certStatus.isExpired) : false;

  return (
    <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          size={isMobile ? 'small' : 'middle'}
        >
          Back to Approvals
        </Button>
      </div>

      {/* Status Alert */}
      {!isPending && (
        <Alert
          message="This meeting is no longer pending approval"
          description={
            <Space>
              <span>Current status:</span>
              <MeetingStatusBadge status={meeting.status} subStatus={meeting.subStatus} />
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Permission Alert - if user cannot approve */}
      {isPending && !canApprove && approverInfo && (
        <Alert
          message="You cannot approve this meeting"
          description={approverInfo.reason}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Certificate Alert - if user has certificate issues */}
      {isPending && canApprove && hasCertificateIssue && (
        <Alert
          message="Certificate Issue"
          description={
            !certStatus?.hasCertificate 
              ? "You don't have a digital certificate. Please upload one to approve meetings."
              : "Your digital certificate has expired. Please renew it to approve meetings."
          }
          type="error"
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Certificate Expiry Warning */}
      {isPending && canApprove && certStatus?.expiresWithin30Days && (
        <Alert
          message="Certificate Expiring Soon"
          description={`Your certificate expires on ${dayjs(certStatus.certificateExpiry).format('DD MMM YYYY')} (${certStatus.daysUntilExpiry} days remaining)`}
          type="warning"
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
          gap: isMobile ? 16 : 24,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Meeting Notice Document */}
        <div style={{ order: isMobile ? 1 : 1 }}>
          <MeetingNoticeDocument
            meeting={meeting}
            board={currentBoard}
            branding={theme}
            contactInfo={currentBoard?.contactInfo}
            logoUrl={logo}
            mode="approval"
            agendaItems={agendaItems}
            confirmationInfo={confirmationInfoWithEvents}
            approvalStatus={isPending ? 'pending' : meeting.subStatus === 'approved' ? 'approved' : meeting.subStatus === 'rejected' ? 'rejected' : 'none'}
            compact={isMobile}
          />
        </div>

        {/* Right Column: Status, Actions, History, Info */}
        <div style={{ order: isMobile ? 2 : 2 }}>
          {/* Status Banner */}
          <Card 
            size="small" 
            style={{ marginBottom: 16 }}
            styles={{ body: { padding: 16 } }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <ExclamationCircleOutlined 
                  style={{ 
                    color: isPending ? '#faad14' : 
                           meeting.subStatus === 'approved' ? '#52c41a' : 
                           meeting.subStatus === 'rejected' ? '#ff4d4f' : '#1890ff',
                    fontSize: 14,
                  }} 
                />
                <MeetingStatusBadge status={meeting.status} subStatus={meeting.subStatus} />
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {isPending 
                  ? 'This meeting requires your approval before it can proceed.'
                  : `Status updated ${dayjs(meeting.updatedAt).fromNow()}`
                }
              </Text>
            </Space>
          </Card>

          {/* Approver Info Card */}
          {isPending && canApprove && (
            <Card 
              size="small" 
              title={<Space><UserOutlined /> Approving As</Space>}
              style={{ marginBottom: 16 }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>{user?.fullName}</Text>
                <Text type="secondary">{approverInfo?.roleLabel}</Text>
                {certStatus?.hasCertificate && !certStatus.isExpired && (
                  <div style={{ marginTop: 8 }}>
                    <Space size={4}>
                      <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Certificate valid until {dayjs(certStatus.certificateExpiry).format('DD MMM YYYY')}
                      </Text>
                    </Space>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {/* Action Buttons */}
          {isPending && (
            <Card 
              size="small" 
              title="Actions" 
              style={{ marginBottom: 16 }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Button 
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setSignatureModalOpen(true)}
                  block
                  size="middle"
                  disabled={!canApprove || hasCertificateIssue}
                >
                  Approve & Sign
                </Button>
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejectionModalOpen(true)}
                  block
                  disabled={!canApprove}
                >
                  Reject
                </Button>
              </Space>
            </Card>
          )}

          {/* Confirmation History */}
          <Card 
            size="small" 
            title={<Space><HistoryOutlined /> Confirmation History</Space>}
            style={{ marginBottom: 16 }}
            styles={{ body: { padding: 16 } }}
          >
            {meetingEvents.length === 0 ? (
              <Empty 
                description="No history yet" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '16px 0' }}
              />
            ) : (
              <Timeline
                style={{ marginTop: 8 }}
                items={meetingEvents.map((event: MeetingEvent) => {
                  const metadata = event.metadata as Record<string, unknown> | null;
                  const rejectionReason = metadata?.rejectionReason as string | undefined;
                  const comments = metadata?.comments as string | undefined;
                  
                  return {
                    color: getTimelineItemColor(event.eventType),
                    children: (
                      <div>
                        <Text strong style={{ fontSize: 13 }}>
                          {MEETING_EVENT_LABELS[event.eventType] || event.eventType}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {event.performedByName}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(event.performedAt).format('DD MMM YYYY, HH:mm')}
                        </Text>
                        {rejectionReason && (
                          <div style={{ marginTop: 4 }}>
                            <Tag color="error" style={{ fontSize: 10 }}>
                              {REJECTION_REASON_LABELS[rejectionReason as keyof typeof REJECTION_REASON_LABELS] || rejectionReason}
                            </Tag>
                            {comments && (
                              <Paragraph 
                                type="secondary" 
                                style={{ fontSize: 11, marginTop: 4, marginBottom: 0 }}
                              >
                                {comments}
                              </Paragraph>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  };
                })}
              />
            )}
          </Card>

          {/* Meeting Info Summary */}
          <Card 
            size="small" 
            title={<Space><InfoCircleOutlined /> Meeting Info</Space>}
            styles={{ body: { padding: 16 } }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Participants</Text>
                <Space size={4}>
                  <TeamOutlined />
                  <Text>{meeting.participants.length}</Text>
                </Space>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Quorum Required</Text>
                <Text>{meeting.quorumRequired} ({meeting.quorumPercentage}%)</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Duration</Text>
                <Text>{meeting.duration} mins</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Created</Text>
                <Text>{dayjs(meeting.createdAt).format('DD MMM YYYY')}</Text>
              </div>
            </Space>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <SignatureModal
        open={signatureModalOpen}
        meetingId={meetingId || ''}
        meetingTitle={meeting.title}
        boardId={meeting.boardId}
        onCancel={() => setSignatureModalOpen(false)}
        onSuccess={handleApproveSuccess}
      />

      <RejectionModal
        open={rejectionModalOpen}
        meetingId={meetingId || ''}
        meetingTitle={meeting.title}
        onCancel={() => setRejectionModalOpen(false)}
        onSuccess={handleRejectSuccess}
      />
    </div>
  );
};

export default ApprovalReviewPage;
