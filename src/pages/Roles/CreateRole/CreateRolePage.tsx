/**
 * CreateRolePage Component
 * Full-page wizard for creating new roles
 */

import React from 'react';
import { Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { WizardForm } from '../../../components/common/WizardForm/WizardForm';
import type { WizardStep } from '../../../components/common/WizardForm/WizardForm';
import { RoleBasicInfoStep } from './RoleBasicInfoStep';
import { RolePermissionsStep } from './RolePermissionsStep';
import { useCreateRole } from '../../../hooks/api';
import type { CreateRolePayload } from '../../../types';

export const CreateRolePage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const createRoleMutation = useCreateRole();
  const handleFinish = async () => {
    try {
      const values = form.getFieldsValue();
      
      const payload: CreateRolePayload = {
        name: values.name,
        description: values.description || undefined,
        permissionIds: values.permissionIds || [],
      };

      await createRoleMutation.mutateAsync(payload);
      message.success('Role created successfully');
      navigate('/all/roles');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create role');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/all/roles');
  };

  const validateBasicInfo = async () => {
    try {
      await form.validateFields(['name', 'description']);
      return true;
    } catch {
      return false;
    }
  };

  const steps: WizardStep[] = [
    {
      key: 'basic',
      title: 'Basic Information',
      description: 'Role name and description',
      icon: <InfoCircleOutlined />,
      content: <RoleBasicInfoStep form={form} />,
      validate: validateBasicInfo,
    },
    {
      key: 'permissions',
      title: 'Permissions',
      description: 'Select role permissions',
      icon: <LockOutlined />,
      content: <RolePermissionsStep form={form} />,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <WizardForm
        steps={steps}
        title="Create New Role"
        subtitle="Define a custom role with specific permissions"
        onFinish={handleFinish}
        onCancel={handleCancel}
        finishButtonText="Create Role"
        loading={createRoleMutation.isPending}
        affixSteps={true}
        affixOffset={80}
      />
    </div>
  );
};

export default CreateRolePage;
