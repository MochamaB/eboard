/**
 * RoleWizardForm Component
 * 2-step wizard for creating new roles
 * Step 1: Basic information (name, description, scope)
 * Step 2: Permission selection
 */

import React, { useState } from 'react';
import { Steps, Form, Input, Button, Space, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined } from '@ant-design/icons';
import { PermissionSelector } from './PermissionSelector';
import { useCreateRole } from '../../hooks/api';
import { useBoardContext } from '../../contexts';
import type { CreateRolePayload } from '../../types';

const { TextArea } = Input;

interface RoleWizardFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RoleWizardForm: React.FC<RoleWizardFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateRolePayload>>({});
  const { theme } = useBoardContext();
  const createRoleMutation = useCreateRole();

  const steps = [
    {
      title: 'Basic Information',
      description: 'Role name and description',
    },
    {
      title: 'Permissions',
      description: 'Select role permissions',
    },
  ];

  const handleNext = async () => {
    try {
      // Validate current step fields
      if (currentStep === 0) {
        await form.validateFields(['name', 'description']);
        const values = form.getFieldsValue(['name', 'description']);
        setFormData({ ...formData, ...values });
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // Validation failed
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      const payload: CreateRolePayload = {
        name: values.name,
        description: values.description || undefined,
        permissionIds: values.permissionIds || [],
      };

      await createRoleMutation.mutateAsync(payload);
      message.success('Role created successfully');
      form.resetFields();
      setCurrentStep(0);
      setFormData({});
      onSuccess?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create role');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    setFormData({});
    onCancel?.();
  };

  return (
    <div>
      {/* Progress Steps */}
      <Steps
        current={currentStep}
        style={{ marginBottom: 32 }}
        items={steps.map(step => ({
          title: step.title,
          description: step.description,
        }))}
      />

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        style={{ minHeight: 300 }}
      >
        {/* Step 1: Basic Information */}
        {currentStep === 0 && (
          <div>
            <Form.Item
              name="name"
              label="Role Name"
              rules={[
                { required: true, message: 'Please enter role name' },
                { min: 2, message: 'Role name must be at least 2 characters' },
                { max: 100, message: 'Role name must not exceed 100 characters' },
              ]}
            >
              <Input
                placeholder="e.g., Finance Committee Member"
                size="large"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { max: 500, message: 'Description must not exceed 500 characters' },
              ]}
            >
              <TextArea
                placeholder="Describe the role and its responsibilities..."
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <div style={{ 
              padding: 16, 
              background: '#f5f5f5', 
              borderRadius: 6,
              marginTop: 16 
            }}>
              <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
                <strong>Note:</strong> Custom roles are created with Board scope by default. 
                They can be assigned to users on specific boards.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Permissions */}
        {currentStep === 1 && (
          <div>
            <Form.Item
              name="permissionIds"
              label="Select Permissions"
              extra="Choose the permissions this role should have. You can select all permissions in a category or individual permissions."
            >
              <PermissionSelector primaryColor={theme.primaryColor} />
            </Form.Item>
          </div>
        )}
      </Form>

      {/* Navigation Buttons */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={handleCancel}>
          Cancel
        </Button>

        <Space>
          {currentStep > 0 && (
            <Button onClick={handlePrevious} icon={<ArrowLeftOutlined />}>
              Previous
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleNext}
              icon={<ArrowRightOutlined />}
              style={{ background: theme.primaryColor, borderColor: theme.primaryColor }}
            >
              Next
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createRoleMutation.isPending}
              icon={<SaveOutlined />}
              style={{ background: theme.primaryColor, borderColor: theme.primaryColor }}
            >
              Create Role
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default RoleWizardForm;
