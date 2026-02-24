/**
 * RoleSelectionStep Component
 * Step 2: Select primary system role
 * Reusable in both Create and Edit user flows
 */

import React, { useMemo } from 'react';
import { Typography, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { FormBuilder } from '../../../components/common/FormBuilder';
import type { FormFieldConfig } from '../../../components/common/FormBuilder';
import { useLookups } from '../../../contexts/LookupsContext';
import type { RoleSelectionStepProps } from './types';

const { Title, Text } = Typography;

export const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({
  formData,
  onChange,
  form,
  mode = 'create',
  selectedRole,
}) => {
  const { roles, getRoleByCode } = useLookups();

  const fields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'primaryRole',
      label: 'Primary System Role',
      type: 'select',
      required: true,
      placeholder: 'Select a role',
      size: 'large', // Use large size for better visibility
      fieldProps: {
        style: { fontSize: 14 }, // Custom font size for select
      },
      options: roles.map(role => ({
        label: role.name,
        value: role.code,
        description: role.description || undefined,
      })),
    },
  ], [roles]);

  const roleInfo = selectedRole ? getRoleByCode(selectedRole) : null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8, fontSize: 16 }}>
          Role & Permissions
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {mode === 'create'
            ? "Select the user's primary system role. This determines their access level and permissions."
            : "Update the user's primary system role. This will affect their access level and permissions."}
        </Text>
      </div>

      <FormBuilder
        form={form}
        fields={fields}
        initialValues={formData}
        onValuesChange={(_, values) => onChange({ ...formData, ...values })}
      />

      {roleInfo && (
        <Alert
          message={<span style={{ fontSize: 13, fontWeight: 600 }}>Role Information</span>}
          description={<span style={{ fontSize: 13 }}>{roleInfo.description}</span>}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default RoleSelectionStep;
