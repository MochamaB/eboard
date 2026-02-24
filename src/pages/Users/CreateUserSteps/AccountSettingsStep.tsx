/**
 * AccountSettingsStep Component
 * Step 5: Configure account security and notification settings
 * Reusable in both Create and Edit user flows
 */

import React, { useMemo } from 'react';
import { Typography, Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { FormBuilder } from '../../../components/common/FormBuilder';
import type { FormFieldConfig } from '../../../components/common/FormBuilder';
import type { AccountSettingsStepProps } from './types';

const { Title, Text } = Typography;

export const AccountSettingsStep: React.FC<AccountSettingsStepProps> = ({
  formData,
  onChange,
  form,
  mode = 'create',
  onSave,
  isSaving = false,
}) => {
  const fields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'requireMfa',
      label: 'Enable Multi-Factor Authentication (MFA)',
      type: 'switch',
      required: false,
      tooltip: 'Enable MFA for this user account (Note: MFA functionality is not yet implemented)',
      initialValue: false,
    },
    {
      name: 'status',
      label: 'Account Status',
      type: 'select',
      required: true,
      size: 'middle',
      fieldProps: {
        style: { fontSize: 14 },
      },
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'sendWelcomeEmail',
      label: 'Send Welcome Email',
      type: 'switch',
      required: false,
      tooltip: mode === 'create' 
        ? 'Send account credentials and welcome message to user'
        : 'Send notification email about account changes',
      hidden: mode === 'edit', // Hide in edit mode
    },
  ], [mode]);

  const handleSave = async () => {
    try {
      await form.validateFields(['requireMfa', 'status']);
      if (onSave) {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Account Settings
        </Title>
        <Text type="secondary">
          {mode === 'create'
            ? 'Configure security settings and notification preferences for the new user account.'
            : 'Update security settings and notification preferences for this user account.'}
        </Text>
      </div>

      <FormBuilder
        form={form}
        fields={fields}
        initialValues={formData}
        onValuesChange={(_, values) => onChange({ ...formData, ...values })}
      />

      {mode === 'edit' && onSave && (
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
            size="middle"
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsStep;
