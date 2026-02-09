/**
 * Vote Cast Form Component
 * UI for casting votes during active voting
 */

import React, { useState } from 'react';
import { Form, Radio, Space, Button, Typography, Alert, Modal } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { VoteOption } from '../../types/voting.types';
import { useCastVote } from '../../hooks/api/useVoting';

const { Text } = Typography;

interface VoteCastFormProps {
  voteId: string;
  options: VoteOption[];
  hasVoted?: boolean;
  currentVote?: string; // optionId if already voted
  allowChange?: boolean;
  onSuccess: () => void;
}

export const VoteCastForm: React.FC<VoteCastFormProps> = ({
  voteId,
  options,
  hasVoted = false,
  currentVote,
  allowChange = false,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState<string | undefined>(currentVote);

  const castVoteMutation = useCastVote(voteId, {
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // If already voted and changing vote, show confirmation
      if (hasVoted && allowChange && currentVote !== values.optionId) {
        Modal.confirm({
          title: 'Change Your Vote?',
          content: 'Are you sure you want to change your vote? This action will be recorded in the audit log.',
          okText: 'Yes, Change Vote',
          cancelText: 'Cancel',
          onOk: () => {
            castVoteMutation.mutate({ optionId: values.optionId });
          },
        });
      } else {
        castVoteMutation.mutate({ optionId: values.optionId });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Sort options by display order
  const sortedOptions = [...options].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div style={{ padding: '16px 0' }}>
      {hasVoted && !allowChange && (
        <Alert
          message="You have already voted"
          description="Vote changes are not allowed for this vote."
          type="info"
          icon={<CheckCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {hasVoted && allowChange && (
        <Alert
          message="You have already voted"
          description="You can change your vote if needed. The change will be recorded in the audit log."
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{ optionId: currentVote }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="optionId"
          label={<Text strong>Cast Your Vote</Text>}
          rules={[{ required: true, message: 'Please select an option' }]}
        >
          <Radio.Group
            onChange={(e) => setSelectedOption(e.target.value)}
            disabled={hasVoted && !allowChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {sortedOptions.map((option) => (
                <Radio
                  key={option.id}
                  value={option.id}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    backgroundColor: selectedOption === option.id ? '#f0f5ff' : 'transparent',
                  }}
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>{option.label}</Text>
                    {option.description && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {option.description}
                      </Text>
                    )}
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={castVoteMutation.isPending}
            disabled={hasVoted && !allowChange}
            block
          >
            {hasVoted && allowChange ? 'Change Vote' : 'Cast Vote'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VoteCastForm;
