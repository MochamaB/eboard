/**
 * Quick Action Item Form
 * Inline form to quickly add action items during minutes editing
 */

import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Card } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { ActionItemPriority, ActionItemSource } from '../../../types/actionItems.types';
import { ACTION_ITEM_PRIORITY_LABELS } from '../../../types/actionItems.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface QuickActionItemFormProps {
  meetingId: string;
  boardId: string;
  sourceId?: string;
  source?: ActionItemSource;
  onSubmit: (payload: {
    meetingId: string;
    boardId: string;
    source: ActionItemSource;
    sourceId?: string;
    title: string;
    description?: string;
    assignedTo: number;
    dueDate: string;
    priority: ActionItemPriority;
  }) => void;
  onCancel: () => void;
  availableAssignees?: { userId: number; userName: string }[];
}

export const QuickActionItemForm: React.FC<QuickActionItemFormProps> = ({
  meetingId,
  boardId,
  sourceId,
  source = 'minutes',
  onSubmit,
  onCancel,
  availableAssignees = [],
}) => {
  const { theme } = useBoardContext();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      onSubmit({
        meetingId,
        boardId,
        source,
        sourceId,
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate.toISOString(),
        priority: values.priority,
      });

      form.resetFields();
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      size="small"
      style={{
        marginBottom: '16px',
        borderColor: theme.primaryColor,
      }}
      styles={{
        body: { padding: '16px' },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'medium',
          dueDate: dayjs().add(7, 'days'),
        }}
      >
        <Form.Item
          name="title"
          label="Action Item Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Enter action item title..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <TextArea
            placeholder="Enter description..."
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>

        <Space style={{ width: '100%' }} size={16}>
          <Form.Item
            name="assignedTo"
            label="Assign To"
            rules={[{ required: true, message: 'Please select an assignee' }]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Select
              placeholder="Select assignee"
              showSearch
              optionFilterProp="label"
              options={availableAssignees.map(assignee => ({
                value: assignee.userId,
                label: assignee.userName,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Select
              options={[
                { value: 'low', label: ACTION_ITEM_PRIORITY_LABELS.low },
                { value: 'medium', label: ACTION_ITEM_PRIORITY_LABELS.medium },
                { value: 'high', label: ACTION_ITEM_PRIORITY_LABELS.high },
                { value: 'urgent', label: ACTION_ITEM_PRIORITY_LABELS.urgent },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Space>

        <Space style={{ marginTop: '16px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            Add Action Item
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Space>
      </Form>
    </Card>
  );
};
