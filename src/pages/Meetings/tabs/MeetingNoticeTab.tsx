/**
 * MeetingNoticeTab Component
 * Displays the formal meeting notice document with confirmation history
 * Reuses MeetingNoticeDocument component - read-only view (no approve/reject actions)
 */

import React from 'react';
import {
  Card,
  Space,
  Typography,
  Tag,
  Empty,
  Timeline,
  Button,
  Grid,
  message,
} from 'antd';
import {
  HistoryOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import type { Meeting, MeetingEvent } from '../../../types/meeting.types';
import { MEETING_EVENT_LABELS, REJECTION_REASON_LABELS } from '../../../types/meeting.types';
import { useBoardContext } from '../../../contexts';
import { useMeetingEvents, useDownloadNoticePDF } from '../../../hooks/api/useMeetings';
import { useAgenda } from '../../../hooks/api/useAgenda';
import { MeetingNoticeDocument } from '../../../components/Meetings';
import { getConfirmationDisplayInfo } from '../../../utils/confirmationWorkflow';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

interface MeetingNoticeTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingNoticeTab: React.FC<MeetingNoticeTabProps> = ({
  meeting,
}) => {
  const screens = useBreakpoint();
  const { theme, logo, currentBoard } = useBoardContext();
  
  const { data: eventsData, isLoading: eventsLoading } = useMeetingEvents(meeting.id);
  const { data: agendaData } = useAgenda(meeting.id);
  
  const isMobile = !screens.md;
  const meetingEvents = eventsData?.data || [];
  const agendaItems = agendaData?.items || [];
  
  // Get confirmation display info for the document
  // Pass meetingEvents array so it uses fresh React Query data instead of stale mock table
  const confirmationInfo = getConfirmationDisplayInfo(
    meeting.id,
    Number(meeting.createdBy),
    meeting.createdByName || 'Board Secretary',
    meeting.createdAt,
    meeting.boardId,
    meetingEvents
  );

  // Timeline item color based on event type
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

  // Determine status display (using new status+subStatus model)
  const isDraftIncomplete = meeting.status === 'draft' && meeting.subStatus === 'incomplete';
  const isDraftComplete = meeting.status === 'draft' && meeting.subStatus === 'complete';
  const isPending = meeting.status === 'scheduled' && meeting.subStatus === 'pending_approval';
  const isConfirmed = meeting.status === 'scheduled' && meeting.subStatus === 'approved';
  const isRejected = meeting.status === 'scheduled' && meeting.subStatus === 'rejected';
  const isCancelled = meeting.status === 'cancelled';
  const isCompleted = meeting.status === 'completed';

  const getStatusIcon = () => {
    if (isCancelled) return <StopOutlined style={{ color: '#8c8c8c', fontSize: 20 }} />;
    if (isDraftIncomplete) return <WarningOutlined style={{ color: '#faad14', fontSize: 20 }} />;
    if (isDraftComplete) return <FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
    if (isPending) return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />;
    if (isConfirmed) return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
    if (isRejected) return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
    if (isCompleted) return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
    return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
  };

  const getStatusText = () => {
    if (isCancelled) return 'Cancelled';
    if (isDraftIncomplete) return 'Draft - Incomplete';
    if (isDraftComplete) return 'Draft - Ready for Submission';
    if (isPending) return 'Pending Approval';
    if (isConfirmed) return 'Approved';
    if (isRejected) return 'Rejected';
    if (isCompleted) return 'Completed';
    // Fallback: format status nicely
    return meeting.subStatus 
      ? `${meeting.subStatus}`.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : meeting.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusDescription = () => {
    if (isCancelled) return 'This meeting has been cancelled and is read-only.';
    if (isDraftIncomplete) return 'This meeting has validation issues that need to be resolved.';
    if (isDraftComplete) return 'This meeting is ready to be submitted for approval.';
    if (isPending) return 'This meeting is awaiting approval from the designated approver.';
    if (isConfirmed) return `Approved ${dayjs(meeting.updatedAt).fromNow()}`;
    if (isRejected) return 'This meeting was rejected and needs revision.';
    if (isCompleted) return 'This meeting has been completed.';
    return `Status updated ${dayjs(meeting.updatedAt).fromNow()}`;
  };

  // Get rejection details from events
  const getRejectionDetails = () => {
    const rejectionEvent = meetingEvents.find((e: MeetingEvent) => e.eventType === 'rejected');
    if (!rejectionEvent) return null;
    
    const metadata = rejectionEvent.metadata as Record<string, unknown> | null;
    return {
      reason: metadata?.rejectionReason as string | undefined,
      comments: metadata?.comments as string | undefined,
      rejectedBy: rejectionEvent.performedByName,
      rejectedAt: rejectionEvent.performedAt,
    };
  };

  // Get cancellation details from events
  const getCancellationDetails = () => {
    const cancellationEvent = meetingEvents.find((e: MeetingEvent) => e.eventType === 'meeting_cancelled');
    if (!cancellationEvent) return null;
    
    const metadata = cancellationEvent.metadata as Record<string, unknown> | null;
    return {
      reason: metadata?.cancellationReason as string | undefined,
      comments: metadata?.comments as string | undefined,
      cancelledBy: cancellationEvent.performedByName,
      cancelledAt: cancellationEvent.performedAt,
    };
  };

  // PDF download mutation
  const downloadPDF = useDownloadNoticePDF({
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Meeting-Notice-${meeting.id}-${dayjs(meeting.startDate).format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('PDF downloaded successfully');
    },
    onError: (error) => {
      console.error('PDF download error:', error);
      message.error('Failed to download PDF. Please try again.');
    },
  });

  // Handle PDF download
  const handleDownloadPDF = () => {
    downloadPDF.mutate(meeting.id);
  };

  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', 
        gap: isMobile ? 16 : 24,
        alignItems: 'start',
      }}
    >
      {/* Left Column: Meeting Notice Document */}
      <div style={{ order: isMobile ? 2 : 1 }}>
        <MeetingNoticeDocument
          meeting={meeting}
          board={currentBoard}
          branding={theme}
          contactInfo={currentBoard?.contactInfo}
          logoUrl={logo}
          mode="preview"
          agendaItems={agendaItems}
          confirmationInfo={confirmationInfo}
          compact={isMobile}
        />
      </div>

      {/* Right Column: Status & History */}
      <div style={{ order: isMobile ? 1 : 2 }}>
        {/* Cancellation Banner (if cancelled) */}
        {isCancelled && (() => {
          const cancellationDetails = getCancellationDetails();
          return (
            <Card 
              size="small" 
              style={{ marginBottom: 16, borderColor: '#d9d9d9', background: '#fafafa' }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Space>
                  <StopOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15, color: '#595959' }}>
                    Meeting Cancelled
                  </Text>
                </Space>
                {cancellationDetails && (
                  <>
                    {cancellationDetails.reason && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>Reason:</Text>
                        <br />
                        <Text style={{ fontSize: 12 }}>{cancellationDetails.reason}</Text>
                      </div>
                    )}
                    {cancellationDetails.comments && (
                      <Paragraph type="secondary" style={{ fontSize: 11, marginBottom: 0 }}>
                        {cancellationDetails.comments}
                      </Paragraph>
                    )}
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Cancelled by {cancellationDetails.cancelledBy} on {dayjs(cancellationDetails.cancelledAt).format('DD MMM YYYY, HH:mm')}
                    </Text>
                  </>
                )}
              </Space>
            </Card>
          );
        })()}

        {/* Rejection Details Banner (if rejected) */}
        {isRejected && (() => {
          const rejectionDetails = getRejectionDetails();
          return (
            <Card 
              size="small" 
              style={{ marginBottom: 16, borderColor: '#ff4d4f', background: '#fff2f0' }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Space>
                  <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15, color: '#cf1322' }}>
                    Meeting Rejected
                  </Text>
                </Space>
                {rejectionDetails && (
                  <>
                    {rejectionDetails.reason && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>Reason:</Text>
                        <br />
                        <Tag color="error" style={{ fontSize: 11, marginTop: 4 }}>
                          {REJECTION_REASON_LABELS[rejectionDetails.reason as keyof typeof REJECTION_REASON_LABELS] || rejectionDetails.reason}
                        </Tag>
                      </div>
                    )}
                    {rejectionDetails.comments && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>Comments:</Text>
                        <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0 }}>
                          {rejectionDetails.comments}
                        </Paragraph>
                      </div>
                    )}
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Rejected by {rejectionDetails.rejectedBy} on {dayjs(rejectionDetails.rejectedAt).format('DD MMM YYYY, HH:mm')}
                    </Text>
                  </>
                )}
              </Space>
            </Card>
          );
        })()}

        {/* Status Banner */}
        <Card 
          size="small" 
          style={{ marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                {getStatusIcon()}
                <Text strong style={{ fontSize: 16 }}>
                  {getStatusText()}
                </Text>
              </Space>
              {/* PDF Download button for approved meetings */}
              {isConfirmed && (
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadPDF}
                  loading={downloadPDF.isPending}
                >
                  PDF
                </Button>
              )}
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {getStatusDescription()}
            </Text>
          </Space>
        </Card>

        {/* Confirmation History */}
        <Card 
          size="small" 
          title={<Space><HistoryOutlined /> Confirmation History</Space>}
          style={{ marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
          loading={eventsLoading}
        >
          {meetingEvents.length === 0 ? (
            <Empty 
              description="No event history" 
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
                <Text>{meeting.participants?.length || 0}</Text>
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
  );
};

export default MeetingNoticeTab;
