/**
 * Rejection Modal
 * Modal for rejecting a meeting confirmation with reason selection
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Alert, Space, Select } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useRejectMeeting } from '../../../hooks/api/useMeetings';
import { useAuth } from '../../../contexts/AuthContext';
import { REJECTION_REASON_LABELS, type RejectionReason } from '../../../types/meeting.types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface RejectionModalProps {
  open: boolean;
  meetingId: string;
  meetingTitle: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  open,
  meetingId,
  meetingTitle,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const rejectMutation = useRejectMeeting(meetingId);

  const handleSubmit = async (values: { reason: RejectionReason; comments?: string }) => {
    setError(null);
    
    try {
      await rejectMutation.mutateAsync({
        rejectedBy: user?.id || 0,
        reason: values.reason,
        comments: values.comments,
      });
      form.resetFields();
      onSuccess();
    } catch (err) {
      setError('Failed to reject meeting confirmation. Please try again.');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    onCancel();
  };

  const rejectionReasonOptions = Object.entries(REJECTION_REASON_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Modal
      title={
        <Space>
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Reject Confirmation</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
    >
      <div style={{ marginBottom: 24 }}>
        <Paragraph>
          You are about to reject the confirmation for:
        </Paragraph>
        <Text strong style={{ fontSize: 16 }}>{meetingTitle}</Text>
      </div>

      <Alert
        message="Rejection Notice"
        description="The meeting organizer will be notified and can resubmit after addressing your concerns."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="reason"
          label="Rejection Reason"
          rules={[{ required: true, message: 'Please select a reason' }]}
        >
          <Select
            placeholder="Select a reason"
            options={rejectionReasonOptions}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="comments"
          label="Additional Comments (Optional)"
        >
          <TextArea
            placeholder="Provide additional details or instructions for the organizer..."
            rows={4}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              danger
              type="primary"
              htmlType="submit"
              icon={<CloseCircleOutlined />}
              loading={rejectMutation.isPending}
            >
              Reject Confirmation
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RejectionModal;
