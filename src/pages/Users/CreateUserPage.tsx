/**
 * Create User Page
 * Multi-step wizard for creating new users with conditional logic
 * Based on docs/MODULES/Module01_UserManagement/01_USERFLOWS.md
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Select,
  Alert,
  Space,
  Typography,
  Button,
  message,
  Card,
  DatePicker,
  Upload,
} from 'antd';
import {
  UserOutlined,
  SafetyOutlined,
  TeamOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { WizardForm } from '../../components/common/WizardForm';
import type { WizardStep } from '../../components/common/WizardForm';
import { FormBuilder } from '../../components/common/FormBuilder';
import type { FormFieldConfig } from '../../components/common/FormBuilder';
import { useBoardContext } from '../../contexts';
import { SYSTEM_ROLE_INFO } from '../../constants/roles';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface UserFormData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeId?: string;
  
  // Step 2: Role
  primaryRole: string;
  
  // Step 3: Board Assignments (conditional)
  boardAssignments: Array<{
    boardId: string;
    role: string;
    startDate: string;
  }>;
  
  // Step 4: Certificate (conditional)
  certificate?: File;
  
  // Step 5: Account Settings
  requireMfa: boolean;
  status: 'active' | 'inactive';
  sendWelcomeEmail: boolean;
}

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBoard } = useBoardContext();
  const [form] = Form.useForm<UserFormData>();
  
  // Track form data across steps
  const [formData, setFormData] = useState<Partial<UserFormData>>({
    requireMfa: true,
    status: 'active',
    sendWelcomeEmail: true,
    boardAssignments: [],
  });

  // Determine which steps to show based on role
  const selectedRole = formData.primaryRole;
  const requiresBoardAssignment = selectedRole && selectedRole !== 'system_admin';
  const requiresCertificate = selectedRole === 'board_secretary';

  // Step 1: Basic Information - Field Configuration
  const basicInfoFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter first name',
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
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'phone',
      required: true,
      placeholder: '+254712345678',
    },
    {
      name: 'employeeId',
      label: 'Employee ID (Optional)',
      type: 'text',
      placeholder: 'Enter employee ID',
    },
  ], []);

  const BasicInfoStep = useMemo(() => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Basic Information</Title>
        <Text type="secondary">
          Enter the user's basic contact information. All fields are required.
        </Text>
      </div>

      <FormBuilder
        form={form}
        fields={basicInfoFields}
        initialValues={formData}
        onValuesChange={(_, values) => setFormData({ ...formData, ...values })}
      />
    </div>
  ), [form, formData, basicInfoFields]);

  // Step 2: Role & Permissions - Field Configuration
  const roleFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'primaryRole',
      label: 'Primary System Role',
      type: 'select',
      required: true,
      placeholder: 'Select a role',
      options: Object.entries(SYSTEM_ROLE_INFO).map(([key, info]) => ({
        label: info.label,
        value: key,
        description: info.description,
      })),
    },
  ], []);

  const RoleStep = useMemo(() => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Role & Permissions</Title>
        <Text type="secondary">
          Select the user's primary system role. This determines their access level and permissions.
        </Text>
      </div>

      <FormBuilder
        form={form}
        fields={roleFields}
        initialValues={formData}
        onValuesChange={(_, values) => setFormData({ ...formData, ...values })}
      />

      {selectedRole && (
        <Alert
          message="Role Information"
          description={SYSTEM_ROLE_INFO[selectedRole as keyof typeof SYSTEM_ROLE_INFO]?.description}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  ), [form, formData, selectedRole, roleFields]);

  // Step 3: Board Assignments (Conditional)
  const BoardAssignmentsStep = useMemo(() => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Board Assignments</Title>
        <Text type="secondary">
          Assign the user to one or more boards and specify their role on each board.
        </Text>
      </div>

      <Alert
        message="Board Membership Required"
        description="This role requires board membership. Please assign the user to at least one board."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        onValuesChange={(_, values) => setFormData({ ...formData, ...values })}
      >
        <Form.List name="boardAssignments">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Card
                  key={field.key}
                  size="small"
                  style={{ marginBottom: 16 }}
                  title={`Board Assignment ${index + 1}`}
                  extra={
                    fields.length > 1 && (
                      <Button type="link" danger onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    )
                  }
                >
                  <Form.Item
                    {...field}
                    label="Board/Committee"
                    name={[field.name, 'boardId']}
                    rules={[{ required: true, message: 'Please select a board' }]}
                  >
                    <Select
                      placeholder="Select board or committee"
                      size="large"
                      options={[
                        { label: 'KTDA Main Board', value: 'ktda-main' },
                        { label: 'Ketepa Ltd', value: 'ketepa' },
                        { label: 'TEMEC', value: 'temec' },
                        { label: 'Chai Trading Co. Ltd', value: 'chai-trading' },
                        { label: 'Audit Committee', value: 'audit-committee' },
                        { label: 'Finance Committee', value: 'finance-committee' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="Role on Board"
                    name={[field.name, 'role']}
                    rules={[{ required: true, message: 'Please select a role' }]}
                  >
                    <Select
                      placeholder="Select role"
                      size="large"
                      options={[
                        { label: 'Chairman', value: 'chairman' },
                        { label: 'Vice Chairman', value: 'vice_chairman' },
                        { label: 'Secretary', value: 'secretary' },
                        { label: 'Member', value: 'member' },
                        { label: 'Observer', value: 'observer' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="Start Date"
                    name={[field.name, 'startDate']}
                    rules={[{ required: true, message: 'Please select start date' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      size="large"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<TeamOutlined />}
                size="large"
              >
                Add Board Assignment
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </div>
  ), [form, formData]);

  // Step 4: Digital Certificate (Conditional)
  const CertificateStep = useMemo(() => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Digital Certificate</Title>
        <Text type="secondary">
          Upload the user's digital certificate for document signing. This step is optional and can be completed later.
        </Text>
      </div>

      <Alert
        message="Certificate Requirements"
        description="Upload a valid .pfx or .p12 certificate file. The certificate will be used for digitally signing board documents and minutes."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        onValuesChange={(_, values) => setFormData({ ...formData, ...values })}
      >
        <Form.Item
          label="Certificate File"
          name="certificate"
          valuePropName="file"
        >
          <Upload
            maxCount={1}
            accept=".pfx,.p12"
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />} size="large">
              Select Certificate File
            </Button>
          </Upload>
        </Form.Item>

        <Alert
          message="Optional Step"
          description="You can skip this step and upload the certificate later from the user's profile page."
          type="warning"
          showIcon
        />
      </Form>
    </div>
  ), [form, formData]);

  // Step 5: Account Settings - Field Configuration
  const accountSettingsFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'requireMfa',
      label: 'Multi-Factor Authentication (MFA)',
      type: 'switch',
      help: 'When enabled, the user will be required to set up MFA on their first login.',
      fieldProps: {
        checkedChildren: 'Required',
        unCheckedChildren: 'Optional',
      },
    },
    {
      name: 'status',
      label: 'Account Status',
      type: 'radio',
      required: true,
      help: 'Active accounts can log in immediately. Inactive accounts are created but cannot log in.',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'sendWelcomeEmail',
      label: '',
      type: 'checkbox',
      placeholder: 'Send welcome email with login credentials',
    },
  ], []);

  const AccountSettingsStep = useMemo(() => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Account Settings</Title>
        <Text type="secondary">
          Configure security and account status settings for the user.
        </Text>
      </div>

      <FormBuilder
        form={form}
        fields={accountSettingsFields}
        initialValues={formData}
        onValuesChange={(_, values) => setFormData({ ...formData, ...values })}
      />
    </div>
  ), [form, formData, accountSettingsFields]);

  // Step 6: Review & Submit
  const ReviewStep = useMemo(() => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Review & Submit</Title>
        <Text type="secondary">
          Please review all information before creating the user account.
        </Text>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Basic Information" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><Text strong>Name:</Text> {formData.firstName} {formData.lastName}</div>
            <div><Text strong>Email:</Text> {formData.email}</div>
            <div><Text strong>Phone:</Text> {formData.phone}</div>
            {formData.employeeId && (
              <div><Text strong>Employee ID:</Text> {formData.employeeId}</div>
            )}
          </Space>
        </Card>

        <Card title="Role & Permissions" size="small">
          <div>
            <Text strong>Primary Role:</Text>{' '}
            {SYSTEM_ROLE_INFO[formData.primaryRole as keyof typeof SYSTEM_ROLE_INFO]?.label}
          </div>
        </Card>

        {formData.boardAssignments && formData.boardAssignments.length > 0 && (
          <Card title="Board Assignments" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {formData.boardAssignments.map((assignment, index) => (
                <div key={index}>
                  <Text strong>Board {index + 1}:</Text> {assignment.boardId} - {assignment.role}
                  {assignment.startDate && ` (from ${dayjs(assignment.startDate).format('YYYY-MM-DD')})`}
                </div>
              ))}
            </Space>
          </Card>
        )}

        <Card title="Account Settings" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><Text strong>MFA Required:</Text> {formData.requireMfa ? 'Yes' : 'No'}</div>
            <div><Text strong>Status:</Text> {formData.status === 'active' ? 'Active' : 'Inactive'}</div>
            <div><Text strong>Welcome Email:</Text> {formData.sendWelcomeEmail ? 'Will be sent' : 'Will not be sent'}</div>
          </Space>
        </Card>

        <Alert
          message="Ready to Create User"
          description="Once you submit, a temporary password will be generated and sent to the user's email address if the welcome email option is enabled."
          type="success"
          showIcon
        />
      </Space>
    </div>
  ), [formData]);

  // Validation functions for each step
  const validateBasicInfo = useCallback(async () => {
    try {
      await form.validateFields(['firstName', 'lastName', 'email', 'phone']);
      return true;
    } catch {
      message.error('Please fill in all required fields correctly');
      return false;
    }
  }, [form]);

  const validateRole = useCallback(async () => {
    try {
      await form.validateFields(['primaryRole']);
      return true;
    } catch {
      message.error('Please select a role');
      return false;
    }
  }, [form]);

  const validateBoardAssignments = useCallback(async () => {
    if (!formData.boardAssignments || formData.boardAssignments.length === 0) {
      message.error('Please add at least one board assignment');
      return false;
    }
    return true;
  }, [formData.boardAssignments]);

  // Build wizard steps dynamically based on role
  const wizardSteps: WizardStep[] = useMemo(() => {
    const steps: WizardStep[] = [
      {
        key: 'basic-info',
        title: 'Basic Information',
        description: 'Name & contact',
        icon: <UserOutlined />,
        content: BasicInfoStep,
        validate: validateBasicInfo,
      },
      {
        key: 'role',
        title: 'Role & Permissions',
        description: 'System role',
        icon: <SafetyOutlined />,
        content: RoleStep,
        validate: validateRole,
      },
    ];

    // Conditionally add board assignments step
    if (requiresBoardAssignment) {
      steps.push({
        key: 'board-assignments',
        title: 'Board Assignments',
        description: 'Assign to boards',
        icon: <TeamOutlined />,
        content: BoardAssignmentsStep,
        validate: validateBoardAssignments,
        hidden: !requiresBoardAssignment,
      });
    }

    // Conditionally add certificate step
    if (requiresCertificate) {
      steps.push({
        key: 'certificate',
        title: 'Digital Certificate',
        description: 'Upload certificate',
        icon: <SafetyOutlined />,
        content: CertificateStep,
        optional: true,
        hidden: !requiresCertificate,
      });
    }

    // Always add account settings and review
    steps.push(
      {
        key: 'account-settings',
        title: 'Account Settings',
        description: 'Security & status',
        icon: <SettingOutlined />,
        content: AccountSettingsStep,
      },
      {
        key: 'review',
        title: 'Review & Submit',
        description: 'Confirm details',
        icon: <CheckCircleOutlined />,
        content: ReviewStep,
      }
    );

    return steps;
  }, [
    BasicInfoStep,
    RoleStep,
    BoardAssignmentsStep,
    CertificateStep,
    AccountSettingsStep,
    ReviewStep,
    requiresBoardAssignment,
    requiresCertificate,
    validateBasicInfo,
    validateRole,
    validateBoardAssignments,
  ]);

  // Handle form submission
  const handleFinish = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      message.success('User created successfully!');
      
      // Navigate back to users list
      setTimeout(() => {
        navigate(`/${currentBoard?.id}/users`);
      }, 2000);
    } catch (error) {
      message.error('Failed to create user. Please try again.');
      throw error;
    }
  }, [navigate, currentBoard]);

  const handleCancel = useCallback(() => {
    navigate(`/${currentBoard?.id}/users`);
  }, [navigate, currentBoard]);

  return (
    <div style={{ padding: '0 24px 24px' }}>
      <WizardForm
        steps={wizardSteps}
        title="Create New User"
        subtitle="Follow these steps to create a new user account. You'll define their role, board memberships, and security settings."
        onFinish={handleFinish}
        onCancel={handleCancel}
        finishButtonText="Create User"
        successResult={{
          title: 'User Created Successfully!',
          subTitle: 'The user account has been created and credentials have been sent to their email.',
          extra: (
            <Button type="primary" onClick={() => navigate(`/${currentBoard?.id}/users`)}>
              Back to Users
            </Button>
          ),
        }}
        errorResult={{
          title: 'Failed to Create User',
          subTitle: 'An error occurred while creating the user account. Please try again.',
        }}
      />
    </div>
  );
};

export default CreateUserPage;
