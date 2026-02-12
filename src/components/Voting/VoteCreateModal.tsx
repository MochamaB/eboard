/**
 * Vote Create Modal Component
 * Modal dialog for creating new votes with configuration wizard
 * Mobile-responsive with full-screen behavior on small screens
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Steps, message, Divider, Checkbox, Spin } from 'antd';
import { ArrowRightOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import type { CreateVotePayload, ConfigureVotePayload } from '../../types/voting.types';
import { useCreateVote, useConfigureVote, useVote, useUpdateVote } from '../../hooks/api/useVoting';
import { VoteConfigurationForm } from './VoteConfigurationForm';

const { TextArea } = Input;
const { Option } = Select;

interface VoteCreateModalProps {
  open: boolean;
  meetingId: string;
  boardId: string;
  agendaId?: string;
  agendaItems?: Array<{ id: string; title: string; itemNumber?: string; parentItemId?: string | null }>;
  contextEntityType?: 'agenda' | 'agenda_item';
  contextEntityId?: string;
  editVoteId?: string; // If provided, modal is in edit mode
  onSuccess: (voteId: string) => void;
  onCancel: () => void;
}

export const VoteCreateModal: React.FC<VoteCreateModalProps> = ({
  open,
  meetingId,
  boardId,
  agendaId,
  agendaItems = [],
  contextEntityType,
  contextEntityId,
  editVoteId,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!editVoteId;
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [createdVoteId, setCreatedVoteId] = useState<string | null>(editVoteId || null);
  const [linkToEntity, setLinkToEntity] = useState(false);
  const [_basicInfo, setBasicInfo] = useState<{
    title: string;
    description?: string;
    entityType?: 'agenda' | 'agenda_item' | 'minutes' | 'action_item' | 'resolution';
    entityId?: string;
  } | null>(null);

  // Fetch existing vote data if in edit mode
  const { data: existingVote, isLoading: loadingVote } = useVote(editVoteId || '', {
    enabled: isEditMode && !!editVoteId && open,
  });

  // Create vote mutation - don't refetch until configuration is complete
  const createVoteMutation = useCreateVote({
    skipRefetch: true, // Prevent UI update until step 2 is complete
    onSuccess: (vote) => {
      setCreatedVoteId(vote.id);
      setCurrentStep(1);
      // Don't show success message yet - wait until configuration is complete
    },
    onError: (error) => {
      message.error(`Failed to create vote: ${error.message}`);
    },
  });

  // Update vote mutation (for editing basic info)
  const updateVoteMutation = useUpdateVote(editVoteId || '', {
    meetingId,
    skipRefetch: true,
    onSuccess: () => {
      setCurrentStep(1);
    },
    onError: (error: Error) => {
      message.error(`Failed to update vote: ${error.message}`);
    },
  });

  // Configure vote mutation
  const configureVoteMutation = useConfigureVote(createdVoteId || '', {
    meetingId, // Pass meetingId to trigger refetch of meeting votes list
    onSuccess: () => {
      message.success('Vote created and configured successfully');
      if (createdVoteId) {
        onSuccess(createdVoteId);
        handleClose();
      }
    },
    onError: (error) => {
      message.error(`Failed to configure vote: ${error.message}`);
    },
  });

  // Handle step 1: Create or update vote with basic info
  const handleBasicInfoSubmit = async () => {
    try {
      const values = await form.validateFields();
      setBasicInfo(values);

      if (isEditMode) {
        // Update existing vote
        const payload = {
          title: values.title,
          description: values.description,
          entityType: values.entityType,
          entityId: values.entityId,
        };
        updateVoteMutation.mutate(payload);
      } else {
        // Create new vote
        const payload: CreateVotePayload = {
          entityType: values.entityType,
          entityId: values.entityId,
          meetingId,
          boardId,
          title: values.title,
          description: values.description,
        };
        createVoteMutation.mutate(payload);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Handle step 2: Configure vote rules
  const handleConfigurationSubmit = (config: ConfigureVotePayload) => {
    if (!createdVoteId) {
      message.error('Vote ID not found');
      return;
    }
    configureVoteMutation.mutate(config);
  };

  // Load existing vote data into form when in edit mode
  useEffect(() => {
    if (isEditMode && existingVote && open) {
      const hasEntity = !!(existingVote.entityType && existingVote.entityId);
      setLinkToEntity(hasEntity);
      
      form.setFieldsValue({
        title: existingVote.title,
        description: existingVote.description,
        linkToEntity: hasEntity,
        entityType: existingVote.entityType,
        entityId: existingVote.entityId,
      });
    }
  }, [isEditMode, existingVote, open, form]);

  // Reset state when modal closes
  const handleClose = () => {
    setCurrentStep(0);
    if (!isEditMode) {
      setCreatedVoteId(null);
    }
    setBasicInfo(null);
    setLinkToEntity(false);
    form.resetFields();
    onCancel();
  };

  const steps = [
    {
      title: 'Basic Info',
      content: 'Vote details',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Configuration',
      content: 'Voting rules',
      icon: <SettingOutlined />,
    },
  ];

  // Show loading state while fetching vote data in edit mode
  if (isEditMode && loadingVote) {
    return (
      <Modal
        title="Edit Vote"
        open={open}
        onCancel={handleClose}
        footer={null}
        width={700}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading vote data...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={isEditMode ? 'Edit Vote' : 'Create New Vote'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
      style={{ top: 20 }}
      styles={{ 
        body: {
          maxHeight: 'calc(100vh - 200px)', 
          overflowY: 'auto',
          paddingTop: 24,
        }
      }}
    >
      <Steps current={currentStep} items={steps} size="small" style={{ marginBottom: 24 }} />

      {/* Step 1: Basic Information */}
      {currentStep === 0 && (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            linkToEntity: !!contextEntityType,
            entityType: contextEntityType,
            entityId: contextEntityId,
          }}
        >
          <Form.Item
            name="title"
            label="Vote Title"
            rules={[{ required: true, message: 'Please enter vote title' }]}
          >
            <Input placeholder="e.g., Approval of 2026 Budget" size="middle" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            help="Optional: Provide additional context"
          >
            <TextArea
              rows={3}
              placeholder="e.g., Vote to approve the proposed 2026 annual budget..."
            />
          </Form.Item>

          <Form.Item name="linkToEntity" valuePropName="checked">
            <Checkbox
              checked={linkToEntity}
              onChange={(e) => {
                setLinkToEntity(e.target.checked);
                if (!e.target.checked) {
                  form.setFieldsValue({ entityType: undefined, entityId: undefined });
                }
              }}
            >
              Link this vote to a specific item
            </Checkbox>
          </Form.Item>

          {linkToEntity && (
            <>
              <Form.Item
                name="entityType"
                label="Link to"
                rules={[{ required: linkToEntity, message: 'Please select entity type' }]}
              >
                <Select placeholder="Select what this vote is for">
                  <Option value="agenda">Agenda</Option>
                  <Option value="agenda_item">Agenda Item</Option>
                  <Option value="minutes">Minutes</Option>
                  <Option value="action_item">Action Item</Option>
                  <Option value="resolution">Resolution</Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.entityType !== currentValues.entityType
                }
              >
                {({ getFieldValue }) => {
                  const entityType = getFieldValue('entityType');
                  
                  // Show agenda selector
                  if (entityType === 'agenda' && agendaId) {
                    return (
                      <Form.Item
                        name="entityId"
                        label="Agenda"
                        rules={[{ required: linkToEntity, message: 'Please select agenda' }]}
                        initialValue={agendaId}
                      >
                        <Select placeholder="Select agenda" disabled>
                          <Option value={agendaId}>Current Meeting Agenda</Option>
                        </Select>
                      </Form.Item>
                    );
                  }
                  
                  // Show agenda items selector with hierarchy
                  if (entityType === 'agenda_item' && agendaItems.length > 0) {
                    // Group items by parent to show hierarchy
                    const topLevelItems = agendaItems.filter((item: any) => !item.parentItemId);
                    const getSubItems = (parentId: string) => 
                      agendaItems.filter((item: any) => item.parentItemId === parentId);

                    return (
                      <Form.Item
                        name="entityId"
                        label="Select Item"
                        rules={[{ required: linkToEntity, message: 'Please select an item' }]}
                      >
                        <Select 
                          placeholder="Select agenda item or subitem"
                          showSearch
                          optionFilterProp="children"
                        >
                          {topLevelItems.map((item: any) => {
                            const subItems = getSubItems(item.id);
                            return (
                              <React.Fragment key={item.id}>
                                <Option value={item.id}>
                                  {item.itemNumber ? `${item.itemNumber}. ` : ''}{item.title}
                                </Option>
                                {subItems.map((subItem: any) => (
                                  <Option key={subItem.id} value={subItem.id}>
                                    &nbsp;&nbsp;&nbsp;&nbsp;{subItem.itemNumber ? `${subItem.itemNumber}. ` : ''}{subItem.title}
                                  </Option>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    );
                  }

                  if (entityType) {
                    return (
                      <Form.Item
                        name="entityId"
                        label="Entity ID"
                        rules={[{ required: linkToEntity, message: 'Please enter entity ID' }]}
                        help="Enter the ID of the item this vote is for"
                      >
                        <Input placeholder="e.g., min-2026-01" />
                      </Form.Item>
                    );
                  }
                  return null;
                }}
              </Form.Item>
            </>
          )}

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} size="middle">
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={handleBasicInfoSubmit}
              loading={createVoteMutation.isPending}
              size="middle"
            >
              Next: Configure Rules
            </Button>
          </Space>
        </Form>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 1 && (createdVoteId || editVoteId) && (
        <div>
          <VoteConfigurationForm
            voteId={createdVoteId || editVoteId}
            onSubmit={handleConfigurationSubmit}
            loading={configureVoteMutation.isPending}
            onCancel={() => setCurrentStep(0)}
          />
        </div>
      )}
    </Modal>
  );
};

export default VoteCreateModal;
