/**
 * ReviewStep Component
 * Step 6: Review all information before submission
 * Reusable in both Create and Edit user flows
 */

import React from 'react';
import { Typography, Card, Space } from 'antd';
import { useBoardContext } from '../../../contexts';
import { useLookups } from '../../../contexts/LookupsContext';
import type { ReviewStepProps } from './types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  mode = 'create',
  selectedRole,
}) => {
  const { getRoleByCode } = useLookups();
  const { theme } = useBoardContext();
  const roleInfo = selectedRole ? getRoleByCode(selectedRole) : null;

  const cardHeadStyle = {
    background: theme.backgroundSecondary,
    color: theme.textPrimary,
    borderBottom: `1px solid ${theme.borderColorLight}`,
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Review & Confirm
        </Title>
        <Text type="secondary">
          {mode === 'create'
            ? 'Please review all information before creating the user account.'
            : 'Please review all changes before updating the user account.'}
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card title="Basic Information" size="small" headStyle={cardHeadStyle}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><Text strong>Name:</Text> {formData.firstName} {formData.lastName}</div>
            <div><Text strong>Email:</Text> {formData.email}</div>
            <div><Text strong>Phone:</Text> {formData.phone}</div>
            {formData.alternateEmail && (
              <div><Text strong>Alternate Email:</Text> {formData.alternateEmail}</div>
            )}
            {formData.alternatePhone && (
              <div><Text strong>Alternate Phone:</Text> {formData.alternatePhone}</div>
            )}
            {formData.employeeId && (
              <div><Text strong>Employee ID:</Text> {formData.employeeId}</div>
            )}
          </Space>
        </Card>

        <Card title="Role & Permissions" size="small" headStyle={cardHeadStyle}>
          <div>
            <Text strong>Primary Role:</Text>{' '}
            {roleInfo?.name || formData.primaryRole}
          </div>
        </Card>

        {formData.boardAssignments && formData.boardAssignments.length > 0 && (
          <Card title="Board Assignments" size="small" headStyle={cardHeadStyle}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {formData.boardAssignments.map((assignment, index) => (
                <div key={index}>
                  <Text strong>Board {index + 1}:</Text> {assignment.boardName || assignment.boardId} - {assignment.roleName || assignment.role}
                  {assignment.startDate && ` (from ${dayjs(assignment.startDate).format('MMM DD, YYYY')})`}
                </div>
              ))}
            </Space>
          </Card>
        )}

        {formData.certificate && (
          <Card title="Certificate" size="small" headStyle={cardHeadStyle}>
            <div>
              <Text strong>Certificate File:</Text> Uploaded
            </div>
          </Card>
        )}

        <Card title="Account Settings" size="small" headStyle={cardHeadStyle}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Multi-Factor Authentication:</Text>{' '}
              {formData.requireMfa ? 'Required' : 'Optional'}
            </div>
            <div>
              <Text strong>Account Status:</Text>{' '}
              {formData.status === 'active' ? 'Active' : 'Inactive'}
            </div>
            <div>
              <Text strong>Welcome Email:</Text>{' '}
              {formData.sendWelcomeEmail ? 'Will be sent' : 'Will not be sent'}
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ReviewStep;
