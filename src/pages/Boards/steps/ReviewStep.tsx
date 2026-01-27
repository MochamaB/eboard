import React from 'react';
import { Typography, Divider, Row, Col, Tag } from 'antd';
import type { FormInstance } from 'antd';
import {
  BOARD_TYPE_LABELS,
  BOARD_TYPE_COLORS,
  ZONE_LABELS,
  type BoardType,
} from '../../../types/board.types';
import type { Board } from '../../../types/board.types';
import { getBoardTypeByCode } from '../../../mocks/db/tables/boardTypes';

const { Title, Text } = Typography;

interface ReviewStepProps {
  form: FormInstance;
  boardType?: string;
  requiresBranding: boolean;
  requiresParentBoard: boolean;
  requiresZone: boolean;
  availableParentBoards: Board[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  form,
  boardType,
  requiresBranding,
  requiresParentBoard,
  requiresZone,
  availableParentBoards,
}) => {
  const formValues = form.getFieldsValue(true);
  const boardTypeInfo = getBoardTypeByCode(formValues.type);
  const parentBoard = availableParentBoards.find(b => b.id === formValues.parentId);

  // Meeting frequency labels
  const meetingFrequencyLabels: Record<string, string> = {
    monthly: 'Monthly',
    bi_monthly: 'Bi-Monthly',
    quarterly: 'Quarterly',
    as_needed: 'As Needed',
  };

  // Voting threshold labels
  const votingThresholdLabels: Record<string, string> = {
    simple_majority: 'Simple Majority (>50%)',
    two_thirds: 'Two-Thirds (≥66.67%)',
    three_quarters: 'Three-Quarters (≥75%)',
    unanimous: 'Unanimous (100%)',
  };

  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Review & Create</Title>
      <Text type="secondary">
        Review all information before creating the board.
      </Text>
      <Divider />

      {/* Basic Information */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Basic Information
        </Text>
        <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
          <Row gutter={[24, 12]}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Board Type</Text>
              <div>
                <Tag color={BOARD_TYPE_COLORS[formValues.type as BoardType] || 'default'}>
                  {boardTypeInfo?.label || formValues.type || '-'}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Board Name</Text>
              <div><Text strong>{formValues.name || '-'}</Text></div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Short Name</Text>
              <div><Text strong>{formValues.shortName || '-'}</Text></div>
            </Col>
            {requiresParentBoard && formValues.parentId && (
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Parent Board</Text>
                <div><Text strong>{parentBoard?.name || '-'}</Text></div>
              </Col>
            )}
            {requiresZone && formValues.zone && (
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Zone</Text>
                <div><Text strong>{ZONE_LABELS[formValues.zone as keyof typeof ZONE_LABELS] || formValues.zone}</Text></div>
              </Col>
            )}
            {formValues.description && (
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>Description</Text>
                <div><Text>{formValues.description}</Text></div>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* Board Settings */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Board Settings
        </Text>
        <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
          <Row gutter={[24, 12]}>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Quorum Percentage</Text>
              <div><Text strong>{formValues.quorumPercentage ? `${formValues.quorumPercentage}%` : '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Meeting Frequency</Text>
              <div><Text strong>{meetingFrequencyLabels[formValues.meetingFrequency] || formValues.meetingFrequency || '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Min Meetings/Year</Text>
              <div><Text strong>{formValues.minMeetingsPerYear || '-'}</Text></div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Voting Threshold</Text>
              <div><Text strong>{votingThresholdLabels[formValues.votingThreshold] || formValues.votingThreshold || '-'}</Text></div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Confirmation Required</Text>
              <div>
                <Tag color={formValues.confirmationRequired ? 'success' : 'default'}>
                  {formValues.confirmationRequired ? 'Yes' : 'No'}
                </Tag>
              </div>
            </Col>
            {formValues.confirmationRequired && formValues.designatedApproverRole && (
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Approver Role</Text>
                <div><Text strong>{formValues.designatedApproverRole}</Text></div>
              </Col>
            )}
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Virtual Meetings</Text>
              <div>
                <Tag color={formValues.allowVirtualMeetings ? 'success' : 'default'}>
                  {formValues.allowVirtualMeetings ? 'Allowed' : 'Not Allowed'}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Attendance Tracking</Text>
              <div>
                <Tag color={formValues.requireAttendanceTracking ? 'success' : 'default'}>
                  {formValues.requireAttendanceTracking ? 'Required' : 'Not Required'}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Branding (if applicable) */}
      {requiresBranding && (
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Branding
          </Text>
          <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#fafafa', borderRadius: 8 }}>
            <Text type="secondary" italic>
              Default KTDA branding will be applied. Customize later in board settings.
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStep;
