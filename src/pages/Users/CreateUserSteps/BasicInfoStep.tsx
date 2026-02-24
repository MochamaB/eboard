/**
 * BasicInfoStep Component
 * Step 1: Collect basic user information
 * Reusable in both Create and Edit user flows
 */

import React, { useMemo } from 'react';
import { Typography, Form, Button, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import FormBuilder from '../../../components/common/FormBuilder/FormBuilder';
import type { FormFieldConfig } from '../../../components/common/FormBuilder/fieldTypes';
import { usersApi } from '../../../api/users.api';
import type { BasicInfoStepProps } from './types';

const { Title, Text } = Typography;

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onChange,
  form,
  mode = 'create',
  originalUser,
  onSave,
  isSaving = false,
}) => {

  const fields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter first name',
      colSpan: 12,
    },
    {
      name: 'middleName',
      label: 'Middle Name',
      type: 'text',
      required: false,
      placeholder: 'Enter middle name (optional)',
      colSpan: 12,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Enter last name',
      colSpan: 12,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'user@example.com',
      colSpan: 12,
      rules: [
        { required: true, message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email address' },
        { 
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: 'Invalid email format'
        },
        {
          validator: async (_, value) => {
            if (!value || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
              return Promise.resolve();
            }
            
            // Skip uniqueness check if in edit mode and email hasn't changed
            if (mode === 'edit' && originalUser && value.toLowerCase() === originalUser.email?.toLowerCase()) {
              return Promise.resolve();
            }
            
            try {
              const response = await usersApi.checkEmail(value);
              if (!response.available) {
                return Promise.reject(new Error('This email is already registered'));
              }
              return Promise.resolve();
            } catch (error) {
              console.error('Email check failed:', error);
              return Promise.resolve();
            }
          },
          validateTrigger: 'onBlur',
        },
      ],
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
      placeholder: '+254 700 000 000',
      colSpan: 12,
      rules: [
        { required: true, message: 'Phone number is required' },
        { 
          pattern: /^\+?[0-9]{10,15}$/,
          message: 'Please enter a valid phone number (10-15 digits, optional + prefix)'
        },
        {
          validator: async (_, value) => {
            if (!value || !/^\+?[0-9]{10,15}$/.test(value)) {
              return Promise.resolve();
            }
            
            // Skip uniqueness check if in edit mode and phone hasn't changed
            if (mode === 'edit' && originalUser && value === originalUser.phone) {
              return Promise.resolve();
            }
            
            try {
              const response = await usersApi.checkPhone(value);
              if (!response.available) {
                return Promise.reject(new Error('This phone number is already registered'));
              }
              return Promise.resolve();
            } catch (error) {
              console.error('Phone check failed:', error);
              return Promise.resolve();
            }
          },
          validateTrigger: 'onBlur',
        },
      ],
    },
    {
      name: 'alternateEmail',
      label: 'Alternate Email',
      type: 'email',
      required: false,
      placeholder: 'alternate@example.com',
      colSpan: 12,
      rules: [
        { type: 'email', message: 'Please enter a valid email address' },
        { 
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: 'Invalid email format'
        },
      ],
    },
    {
      name: 'alternatePhone',
      label: 'Alternate Phone',
      type: 'text',
      required: false,
      placeholder: '+254 700 000 000',
      colSpan: 12,
      rules: [
        { 
          pattern: /^\+?[0-9]{10,15}$/,
          message: 'Please enter a valid phone number (10-15 digits, optional + prefix)'
        },
      ],
    },
    {
      name: 'employeeId',
      label: 'Employee ID',
      type: 'text',
      required: false,
      placeholder: 'SAP-12345',
      colSpan: 12,
    },
  ], [mode, originalUser]);

  const handleSave = async () => {
    try {
      await form.validateFields(['firstName', 'lastName', 'email', 'phone', 'alternateEmail', 'alternatePhone', 'employeeId']);
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
          Basic Information
        </Title>
        <Text type="secondary">
          {mode === 'create' 
            ? "Enter the user's basic contact information. All fields marked with * are required."
            : "Update the user's basic contact information."}
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

export default BasicInfoStep;
