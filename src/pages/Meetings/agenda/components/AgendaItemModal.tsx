/**
 * AgendaItemModal Component
 * Enhanced modal for adding/editing agenda items
 * Supports both root items and sub-items with presenter selection
 */

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Typography, Space, Avatar } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import type { AgendaItem, CreateAgendaItemPayload } from '../../../../types/agenda.types';
import type { SelectedParticipant } from '../../../../components/common';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface AgendaItemModalProps {
  /** Modal visibility */
  open: boolean;
  /** Modal mode */
  mode: 'add' | 'edit';
  /** Close handler */
  onCancel: () => void;
  /** Submit handler */
  onSubmit: (payload: CreateAgendaItemPayload) => void;
  /** Loading state */
  loading?: boolean;
  /** Existing item (for edit mode) */
  item?: AgendaItem;
  /** All agenda items (for parent selection) */
  allItems?: AgendaItem[];
  /** Meeting participants for presenter selection */
  participants?: SelectedParticipant[];
  /** Parent item ID (when adding sub-item) */
  parentItemId?: string | null;
}

export const AgendaItemModal: React.FC<AgendaItemModalProps> = ({
  open,
  mode,
  onCancel,
  onSubmit,
  loading = false,
  item,
  allItems = [],
  participants = [],
  parentItemId,
}) => {
  const [form] = Form.useForm();
  const { theme } = useBoardContext();
  const [selectedPresenterId, setSelectedPresenterId] = useState<number | null>(null);

  // Get root items only (for parent selection)
  const rootItems = allItems.filter(i => !i.parentItemId);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && item) {
        form.setFieldsValue({
          title: item.title,
          description: item.description,
          itemType: item.itemType,
          estimatedDuration: item.estimatedDuration,
          presenterId: item.presenterId,
          parentItemId: item.parentItemId,
        });
        setSelectedPresenterId(item.presenterId || null);
      } else {
        form.resetFields();
        if (parentItemId) {
          form.setFieldValue('parentItemId', parentItemId);
        }
        setSelectedPresenterId(null);
      }
    }
  }, [open, mode, item, form, parentItemId]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Find presenter name from participants
      const presenter = participants.find(p => Number(p.userId) === values.presenterId);
      
      const payload: CreateAgendaItemPayload = {
        title: values.title,
        description: values.description || '',
        itemType: values.itemType,
        estimatedDuration: values.estimatedDuration || 15,
        presenterId: values.presenterId || null,
        presenterName: presenter?.name || null,
        parentItemId: values.parentItemId || null,
        orderIndex: 999, // Will be auto-calculated by backend
        isAdHoc: false,
        attachedDocumentIds: [],
      };

      onSubmit(payload);
    });
  };

  const handlePresenterChange = (value: number) => {
    setSelectedPresenterId(value);
  };

  // Get selected presenter details
  const selectedPresenter = participants.find(p => Number(p.userId) === selectedPresenterId);

  return (
    <Modal
      title={mode === 'add' ? 'Add Agenda Item' : 'Edit Agenda Item'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={700}
      okText={mode === 'add' ? 'Add Item' : 'Save Changes'}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        {/* Parent Item Selection (for sub-items) */}
        {mode === 'add' && (
          <Form.Item
            label="Parent Item (Optional)"
            name="parentItemId"
            tooltip="Select a parent item to create a sub-item (e.g., 1.1, 1.2)"
          >
            <Select
              placeholder="Select parent item (leave empty for root item)"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {rootItems.map((rootItem) => (
                <Option key={rootItem.id} value={rootItem.id}>
                  {rootItem.itemNumber}. {rootItem.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter item title' }]}
        >
          <Input placeholder="Enter agenda item title" size="middle" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Enter detailed description (optional)" />
        </Form.Item>

        {/* Type and Duration Row */}
        <Space style={{ width: '100%', display: 'flex', gap: '16px' }}>
          <Form.Item
            label="Type"
            name="itemType"
            rules={[{ required: true, message: 'Please select item type' }]}
            initialValue="discussion"
            style={{ flex: 1 }}
          >
            <Select size="middle">
              <Option value="discussion">
                <Space>
                  <span style={{ 
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.infoColor,
                  }} />
                  Discussion
                </Space>
              </Option>
              <Option value="decision">
                <Space>
                  <span style={{ 
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.warningColor,
                  }} />
                  Decision
                </Space>
              </Option>
              <Option value="information">
                <Space>
                  <span style={{ 
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.successColor,
                  }} />
                  Information
                </Space>
              </Option>
              <Option value="committee_report">
                <Space>
                  <span style={{ 
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.primaryColor,
                  }} />
                  Committee Report
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Duration (minutes)"
            name="estimatedDuration"
            initialValue={15}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={1}
              max={480}
              size="middle"
              style={{ width: '100%' }}
              prefix={<ClockCircleOutlined />}
              placeholder="Duration"
            />
          </Form.Item>
        </Space>

        {/* Presenter Selection */}
        <Form.Item
          label="Presenter / Responsible Person"
          name="presenterId"
          tooltip="Select the person who will present or lead this agenda item"
        >
          <Select
            placeholder="Select presenter from meeting participants"
            allowClear
            showSearch
            size="middle"
            optionFilterProp="children"
            onChange={handlePresenterChange}
            filterOption={(input, option) =>
              (option?.children as any)?.props?.children?.[1]?.props?.children
                ?.toLowerCase()
                ?.includes(input.toLowerCase())
            }
          >
            {participants.map((participant) => (
              <Option key={participant.userId} value={Number(participant.userId)}>
                <Space>
                  <Avatar
                    size="small"
                    src={participant.avatar}
                    icon={!participant.avatar && <UserOutlined />}
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <span>{participant.name}</span>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ({participant.roleName})
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Selected Presenter Info */}
        {selectedPresenter && (
          <div
            style={{
              padding: '12px',
              backgroundColor: theme.backgroundTertiary,
              borderRadius: '6px',
              marginTop: '-8px',
              marginBottom: '16px',
            }}
          >
            <Space>
              <Avatar
                src={selectedPresenter.avatar}
                icon={!selectedPresenter.avatar && <UserOutlined />}
                style={{ backgroundColor: theme.primaryColor }}
              />
              <div>
                <Text strong>{selectedPresenter.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {selectedPresenter.roleName} • {selectedPresenter.email}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default AgendaItemModal;
