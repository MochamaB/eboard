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
} from 'antd';
import {
  HistoryOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import type { Meeting, MeetingConfirmationHistory } from '../../../types/meeting.types';
import { CONFIRMATION_EVENT_LABELS, REJECTION_REASON_LABELS } from '../../../types/meeting.types';
import { useBoardContext } from '../../../contexts';
import { useConfirmationHistory } from '../../../hooks/api/useMeetings';
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
  
  const { data: historyData, isLoading: historyLoading } = useConfirmationHistory(meeting.id);
  const { data: agendaData } = useAgenda(meeting.id);
  
  const isMobile = !screens.md;
  const confirmationHistory = historyData?.data || [];
  const agendaItems = agendaData?.items || [];
  
  // Get confirmation display info for the document
  const confirmationInfo = getConfirmationDisplayInfo(
    meeting.id,
    Number(meeting.createdBy),
    meeting.createdByName || 'Board Secretary',
    meeting.createdAt
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

  // Determine status display
  const isPending = meeting.status === 'pending_confirmation';
  const isConfirmed = meeting.status === 'scheduled' || meeting.status === 'confirmed';
  const isRejected = meeting.status === 'rejected';

  const getStatusIcon = () => {
    if (isPending) return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />;
    if (isConfirmed) return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
    if (isRejected) return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
    return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
  };

  const getStatusText = () => {
    if (isPending) return 'Pending Confirmation';
    if (isConfirmed) return 'Confirmed';
    if (isRejected) return 'Rejected';
    return meeting.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusDescription = () => {
    if (isPending) return 'This meeting is awaiting approval from the designated approver.';
    if (isConfirmed) return `Confirmed ${dayjs(meeting.updatedAt).fromNow()}`;
    if (isRejected) return 'This meeting confirmation was rejected.';
    return `Status updated ${dayjs(meeting.updatedAt).fromNow()}`;
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
        {/* Status Banner */}
        <Card 
          size="small" 
          style={{ marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space>
              {getStatusIcon()}
              <Text strong style={{ fontSize: 16 }}>
                {getStatusText()}
              </Text>
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
          loading={historyLoading}
        >
          {confirmationHistory.length === 0 ? (
            <Empty 
              description="No confirmation history" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '16px 0' }}
            />
          ) : (
            <Timeline
              style={{ marginTop: 8 }}
              items={confirmationHistory.map((event: MeetingConfirmationHistory) => ({
                color: getTimelineItemColor(event.eventType),
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>
                      {CONFIRMATION_EVENT_LABELS[event.eventType]}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {event.performedByName}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(event.performedAt).format('DD MMM YYYY, HH:mm')}
                    </Text>
                    {event.submissionNotes && (
                      <Paragraph 
                        type="secondary" 
                        style={{ fontSize: 11, marginTop: 4, marginBottom: 0 }}
                      >
                        {event.submissionNotes}
                      </Paragraph>
                    )}
                    {event.rejectionReason && (
                      <div style={{ marginTop: 4 }}>
                        <Tag color="error" style={{ fontSize: 10 }}>
                          {REJECTION_REASON_LABELS[event.rejectionReason]}
                        </Tag>
                        {event.rejectionComments && (
                          <Paragraph 
                            type="secondary" 
                            style={{ fontSize: 11, marginTop: 4, marginBottom: 0 }}
                          >
                            {event.rejectionComments}
                          </Paragraph>
                        )}
                      </div>
                    )}
                    {/* Document Download Links */}
                    {(event.unsignedDocumentUrl || event.signedDocumentUrl) && (
                      <div style={{ marginTop: 8 }}>
                        <Space size={8}>
                          {event.unsignedDocumentUrl && (
                            <Button 
                              size="small" 
                              icon={<DownloadOutlined />}
                              href={event.unsignedDocumentUrl}
                              target="_blank"
                              style={{ fontSize: 11 }}
                            >
                              Draft
                            </Button>
                          )}
                          {event.signedDocumentUrl && (
                            <Button 
                              size="small" 
                              type="primary"
                              icon={<DownloadOutlined />}
                              href={event.signedDocumentUrl}
                              target="_blank"
                              style={{ fontSize: 11 }}
                            >
                              Signed
                            </Button>
                          )}
                        </Space>
                      </div>
                    )}
                  </div>
                ),
              }))}
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
