import React, { useEffect } from 'react';
import { Form, Button, Space, Typography, message, Divider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import type { Board } from '../../../types/board.types';
import { BoardSettingsStep } from '../steps';

const { Title, Text } = Typography;

interface SettingsTabProps {
  board: Board;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ board }) => {
  const [form] = Form.useForm();

  // Initialize form with board settings
  useEffect(() => {
    if (board.settings) {
      form.setFieldsValue({
        quorumPercentage: board.settings.quorumPercentage,
        meetingFrequency: board.settings.meetingFrequency,
        votingThreshold: board.settings.votingThreshold,
        minMeetingsPerYear: board.settings.minMeetingsPerYear,
        confirmationRequired: board.settings.confirmationRequired,
        designatedApproverRole: board.settings.designatedApproverRole,
        allowVirtualMeetings: board.settings.allowVirtualMeetings,
        requireAttendanceTracking: board.settings.requireAttendanceTracking,
      });
    }
  }, [board.settings, form]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // TODO: Call API to update board settings
      console.log('Updated settings:', values);
      message.success('Board settings updated successfully');
    } catch (error) {
      message.error('Please fix the validation errors');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 800 }}>
        {/* Header */}
        <div>
          <Title level={4} style={{ margin: 0 }}>Board Settings</Title>
          <Text type="secondary">
            Configure governance rules and meeting requirements for {board.name}
          </Text>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Settings Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <BoardSettingsStep
            form={form}
            boardType={board.type}
            defaultSettings={board.settings || {}}
          />

          {/* Actions */}
          <Divider />
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  if (board.settings) {
                    form.setFieldsValue({
                      quorumPercentage: board.settings.quorumPercentage,
                      meetingFrequency: board.settings.meetingFrequency,
                      votingThreshold: board.settings.votingThreshold,
                      minMeetingsPerYear: board.settings.minMeetingsPerYear,
                      confirmationRequired: board.settings.confirmationRequired,
                      designatedApproverRole: board.settings.designatedApproverRole,
                      allowVirtualMeetings: board.settings.allowVirtualMeetings,
                      requireAttendanceTracking: board.settings.requireAttendanceTracking,
                    });
                  }
                  message.info('Changes discarded');
                }}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
};

export default SettingsTab;
