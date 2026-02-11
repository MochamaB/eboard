/**
 * Vote Creation Modal (Live Room)
 * Lightweight modal for creating votes during a live meeting session
 * 
 * Unlike the full VoteCreateModal (2-step wizard for pre-meeting setup),
 * this is a single-step form that directly calls context actions:
 *   1. actions.createVote(motionText)
 *   2. actions.startVote(voteId)
 * 
 * Fields: Motion text, duration, anonymous toggle
 * Responsive + board branding applied
 */

import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Space, Typography, Alert } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';

const { Text } = Typography;
const { TextArea } = Input;

interface VoteCreationModalProps {
  open: boolean;
  onClose: () => void;
}

const VoteCreationModal: React.FC<VoteCreationModalProps> = ({ open, onClose }) => {
  const { roomState, actions, capabilities } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const { quorumMet, activeVote } = roomState;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Create vote via context
      await actions.createVote(values.motionText);

      // Small delay to let state propagate, then start vote
      // The createVote sets activeVote, startVote reads it
      setTimeout(async () => {
        try {
          const voteId = roomState.activeVote?.id || `vote-${Date.now()}`;
          await actions.startVote(voteId);
        } catch {
          // Vote was created but start failed — still close modal
        }
        setLoading(false);
        form.resetFields();
        onClose();
      }, 600);

    } catch {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined style={{ color: theme.primaryColor }} />
          <span>Create Vote</span>
        </Space>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Create & Start Vote"
      okButtonProps={{
        loading,
        disabled: !quorumMet || !!activeVote || !capabilities.canCreateVote,
        style: { background: theme.primaryColor, borderColor: theme.primaryColor },
      }}
      cancelButtonProps={{ disabled: loading }}
      width={isMobile ? '95%' : 520}
      centered={isMobile}
      destroyOnClose
    >
      {!quorumMet && (
        <Alert
          message="Quorum not met"
          description="Votes require quorum to be met before they can be created."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {activeVote && (
        <Alert
          message="Vote already active"
          description="Close the current vote before creating a new one."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{ duration: 2, anonymous: false }}
        disabled={!quorumMet || !!activeVote}
      >
        <Form.Item
          name="motionText"
          label="Motion / Question"
          rules={[{ required: true, message: 'Please enter the motion or question' }]}
        >
          <TextArea
            rows={3}
            placeholder="e.g., Approve the proposed 2026 annual budget"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Space size={isMobile ? 12 : 24} direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Set duration' }]}
            style={{ marginBottom: isMobile ? 0 : undefined }}
          >
            <InputNumber min={1} max={30} style={{ width: isMobile ? '100%' : 120 }} />
          </Form.Item>

          <Form.Item
            name="anonymous"
            label="Anonymous Voting"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Space>

        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          borderRadius: 6,
          background: theme.backgroundTertiary,
          border: `1px solid ${theme.borderColorLight}`,
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Vote type: <Text strong style={{ fontSize: 12 }}>For / Against / Abstain</Text>
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            The vote will start immediately after creation. All eligible participants will be prompted to vote.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default React.memo(VoteCreationModal);
