/**
 * RoleBasicInfoStep Component
 * Step 1 of role creation wizard - basic information
 */

import React from 'react';
import { Form, Input, Alert } from 'antd';

const { TextArea } = Input;

interface RoleBasicInfoStepProps {
  form: any;
}

export const RoleBasicInfoFields: React.FC = () => (
  <>
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
        size="middle"
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

    <Alert
      type="info"
      message="Custom roles are created with Board scope by default. They can be assigned to users on specific boards."
      showIcon
      style={{ marginTop: 16 }}
    />
  </>
);

export const RoleBasicInfoStep: React.FC<RoleBasicInfoStepProps> = ({ form }) => {
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <RoleBasicInfoFields />
      </Form>
    </div>
  );
};

export default RoleBasicInfoStep;
