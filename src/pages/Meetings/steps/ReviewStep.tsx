import React from 'react';
import { Typography, Divider, Alert, Row, Col, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import type { SelectedParticipant } from '../../../components/common';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BOARD_TYPE_OPTIONS = [
  { value: 'main', label: 'Main Board' },
  { value: 'committee', label: 'Committee' },
];

const MEETING_TYPE_OPTIONS = [
  { value: 'regular', label: 'Regular Board Meeting' },
  { value: 'special', label: 'Special Board Meeting' },
  { value: 'agm', label: 'Annual General Meeting' },
  { value: 'emergency', label: 'Emergency Board Meeting' },
  { value: 'committee', label: 'Committee Meeting' },
];

interface ReviewStepProps {
  form: any;
  selectedBoard?: { label: string; value: string };
  participants: SelectedParticipant[];
  quorumPercentage: number;
  isRecurring: boolean;
  recurrencePattern: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  generatedDates: { date: Dayjs; excluded: boolean }[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  form,
  selectedBoard,
  participants,
  quorumPercentage,
  isRecurring,
  recurrencePattern,
  generatedDates,
}) => {
  const allFormValues = form.getFieldsValue(true);
  
  const boardTypeLabel = BOARD_TYPE_OPTIONS.find(b => b.value === allFormValues.boardType)?.label || allFormValues.boardType || '-';
  const meetingTypeLabel = MEETING_TYPE_OPTIONS.find(m => m.value === allFormValues.meetingType)?.label || allFormValues.meetingType || '-';
  
  const locationTypeLabels: Record<string, string> = {
    physical: 'Physical (In-person)',
    virtual: 'Virtual (Jitsi Meet)',
    hybrid: 'Hybrid (Both)',
  };

  const nonGuestCount = participants.filter(p => !p.isGuest).length;
  const requiredForQuorum = Math.ceil((nonGuestCount * quorumPercentage) / 100);
  const canMeetQuorum = nonGuestCount >= requiredForQuorum;

  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Review & Create</Title>
      <Text type="secondary">
        {isRecurring 
          ? 'Review all details before creating the meeting series.' 
          : 'Review all meeting details before creating the meeting.'}
      </Text>
      <Divider />

      {/* Board & Meeting Type */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Board & Meeting Type
        </Text>
        <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
          <Row gutter={[24, 8]}>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Board Type</Text>
              <div><Text strong>{boardTypeLabel}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Board/Committee</Text>
              <div><Text strong>{selectedBoard?.label || '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Meeting Type</Text>
              <div><Text strong>{meetingTypeLabel}</Text></div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Meeting Details */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Meeting Details
        </Text>
        <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
          <Row gutter={[24, 12]}>
            <Col span={24}>
              <Text type="secondary" style={{ fontSize: 12 }}>Title</Text>
              <div><Text strong>{allFormValues.title || '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Date</Text>
              <div><Text strong>{allFormValues.scheduledDate ? dayjs(allFormValues.scheduledDate).format('dddd, MMMM D, YYYY') : '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Time</Text>
              <div>
                <Text strong>
                  {allFormValues.startTime ? dayjs(allFormValues.startTime).format('h:mm A') : '-'} - {allFormValues.endTime ? dayjs(allFormValues.endTime).format('h:mm A') : '-'}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Duration</Text>
              <div><Text strong>{allFormValues.duration ? `${allFormValues.duration} minutes` : '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Location Type</Text>
              <div><Text strong>{locationTypeLabels[allFormValues.locationType] || '-'}</Text></div>
            </Col>
            {(allFormValues.locationType === 'physical' || allFormValues.locationType === 'hybrid') && (
              <Col span={16}>
                <Text type="secondary" style={{ fontSize: 12 }}>Venue</Text>
                <div><Text strong>{allFormValues.physicalLocation || '-'}</Text></div>
              </Col>
            )}
            {(allFormValues.locationType === 'virtual' || allFormValues.locationType === 'hybrid') && (
              <Col span={16}>
                <Text type="secondary" style={{ fontSize: 12 }}>Virtual Meeting</Text>
                <div><Text strong style={{ color: '#1890ff' }}>Jitsi Meet link will be auto-generated</Text></div>
              </Col>
            )}
            {allFormValues.description && (
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>Description</Text>
                <div><Text>{allFormValues.description}</Text></div>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* Recurring Meeting Series */}
      {isRecurring && generatedDates.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <SyncOutlined style={{ marginRight: 8 }} />
            Meeting Series ({generatedDates.filter(d => !d.excluded).length} meetings)
          </Text>
          <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
            <Row gutter={[24, 8]}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Pattern</Text>
                <div><Text strong>{recurrencePattern.charAt(0).toUpperCase() + recurrencePattern.slice(1)}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Total Meetings</Text>
                <div><Text strong>{generatedDates.filter(d => !d.excluded).length}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Date Range</Text>
                <div>
                  <Text strong>
                    {generatedDates[0]?.date.format('MMM D, YYYY')} - {generatedDates[generatedDates.length - 1]?.date.format('MMM D, YYYY')}
                  </Text>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Meeting Dates:</Text>
              <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {generatedDates.filter(d => !d.excluded).slice(0, 6).map((d, i) => (
                  <Tag key={i} color="blue">{d.date.format('MMM D')}</Tag>
                ))}
                {generatedDates.filter(d => !d.excluded).length > 6 && (
                  <Tag>+{generatedDates.filter(d => !d.excluded).length - 6} more</Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participants */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Participants ({participants.length})
        </Text>
        <div style={{ marginTop: 12 }}>
          <Alert
            type={canMeetQuorum ? 'success' : 'warning'}
            message={
              <span>
                Quorum: {quorumPercentage}% ({requiredForQuorum} of {nonGuestCount} required)
                {canMeetQuorum ? ' — Can be met' : ' — May not be met'}
              </span>
            }
            style={{ marginBottom: 12 }}
            showIcon
          />
          
          <div style={{ backgroundColor: '#fafafa', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '40px 1fr 1fr', 
              padding: '8px 16px', 
              backgroundColor: '#f0f0f0',
              fontWeight: 500,
              fontSize: 12,
              color: '#8c8c8c',
            }}>
              <div>#</div>
              <div>Name</div>
              <div>Role</div>
            </div>
            <div>
              {participants.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <Text type="secondary">No participants selected</Text>
                </div>
              ) : (
                participants.map((p, index) => (
                  <div 
                    key={p.userId} 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '40px 1fr 1fr', 
                      padding: '8px 16px',
                      borderBottom: index < participants.length - 1 ? '1px solid #f0f0f0' : 'none',
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <Text type="secondary">{index + 1}</Text>
                    </div>
                    <div>
                      <Text>{p.name}</Text>
                    </div>
                    <div>
                      <Text type="secondary">{p.roleName}</Text>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
