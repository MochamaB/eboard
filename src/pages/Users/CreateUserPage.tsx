/**
 * Create User Page
 * Multi-step wizard for creating new users with conditional logic
 * Based on docs/MODULES/Module01_UserManagement/01_USERFLOWS.md
 * Refactored to use separate step components for better maintainability
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal, message } from 'antd';
import { CheckCircleOutlined as SuccessIcon, CloseCircleOutlined as ErrorIcon } from '@ant-design/icons';
import {
  UserOutlined,
  SafetyOutlined,
  TeamOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { WizardForm } from '../../components/common/WizardForm';
import type { WizardStep } from '../../components/common/WizardForm';
import { useBoardContext } from '../../contexts';
import { useLookups } from '../../contexts/LookupsContext';
import { useCreateUser } from '../../hooks/api/useUsers';
import { usersApi } from '../../api';
import type { CreateUserPayload } from '../../types/user.types';
import {
  BasicInfoStep,
  RoleSelectionStep,
  BoardAssignmentsStep,
  CertificateUploadStep,
  AccountSettingsStep,
  ReviewStep,
  type UserFormData,
} from './CreateUserSteps';

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { routePrefix } = useBoardContext();
  const { getRoleByCode } = useLookups();
  const [form] = Form.useForm<UserFormData>();
  const createUserMutation = useCreateUser();

  // Track form data across steps
  const [formData, setFormData] = useState<Partial<UserFormData>>({
    requireMfa: true,
    status: 'active',
    sendWelcomeEmail: true,
    boardAssignments: [],
  });

  // Modal state for success/error
  const [modalState, setModalState] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    userId?: number;
  }>({ visible: false, type: 'success', title: '', message: '' });

  // Determine which steps to show based on role scope
  const selectedRole = formData.primaryRole;
  const selectedRoleInfo = selectedRole ? getRoleByCode(selectedRole) : null;
  const roleScope = selectedRoleInfo?.scope?.toLowerCase();

  // Only show board assignments for Board and BoardLeadership scopes
  // Participant and Global roles don't need board assignments
  const requiresBoardAssignment = roleScope === 'board' || roleScope === 'boardleadership';

  // Only secretary roles need certificates
  const requiresCertificate = selectedRole === 'secretary' || selectedRole === 'board_secretary';

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
        content: (
          <BasicInfoStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="create"
          />
        ),
        validate: validateBasicInfo,
      },
      {
        key: 'role',
        title: 'Role & Permissions',
        description: 'System role',
        icon: <SafetyOutlined />,
        content: (
          <RoleSelectionStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="create"
            selectedRole={selectedRole}
          />
        ),
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
        content: (
          <BoardAssignmentsStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="create"
            selectedRole={selectedRole}
          />
        ),
        validate: validateBoardAssignments,
      });
    }

    // Conditionally add certificate step
    if (requiresCertificate) {
      steps.push({
        key: 'certificate',
        title: 'Digital Certificate',
        description: 'Upload certificate',
        icon: <SafetyCertificateOutlined />,
        content: (
          <CertificateUploadStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="create"
          />
        ),
        optional: true,
      });
    }

    // Always add account settings and review
    steps.push(
      {
        key: 'account-settings',
        title: 'Account Settings',
        description: 'Security & status',
        icon: <SettingOutlined />,
        content: (
          <AccountSettingsStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="create"
          />
        ),
      },
      {
        key: 'review',
        title: 'Review & Submit',
        description: 'Confirm details',
        icon: <CheckCircleOutlined />,
        content: (
          <ReviewStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="create"
            selectedRole={selectedRole}
          />
        ),
      }
    );

    return steps;
  }, [
    formData,
    form,
    selectedRole,
    roleScope,
    requiresBoardAssignment,
    requiresCertificate,
    validateBasicInfo,
    validateRole,
    validateBoardAssignments,
  ]);

  // Handle form submission
  const handleFinish = useCallback(async () => {
    try {
      // Map form data to API payload
      const payload: CreateUserPayload = {
        firstName: formData.firstName!,
        middleName: formData.middleName,
        lastName: formData.lastName!,
        email: formData.email!,
        phone: formData.phone || undefined,
        alternatePhone: formData.alternatePhone || undefined,
        alternateEmail: formData.alternateEmail || undefined,
        employeeId: formData.employeeId,
        primaryRole: formData.primaryRole!,
        mfaEnabled: formData.requireMfa ?? false,
        status: formData.status || 'active',
        timezone: 'Africa/Nairobi',
        boardAssignments: formData.boardAssignments?.map(assignment => ({
          boardId: assignment.boardId,
          roleId: assignment.roleId!,
          startDate: assignment.startDate,
        })),
      };

      console.log('=== CREATE USER PAYLOAD ===');
      console.log(JSON.stringify(payload, null, 2));

      // Create user
      const createdUser = await createUserMutation.mutateAsync(payload);
      
      // If certificate was uploaded, handle it separately
      let certWarning = '';
      if (formData.certificate && createdUser.id) {
        try {
          await usersApi.uploadCertificate(createdUser.id, formData.certificate, '');
        } catch (certError) {
          console.error('Certificate upload failed:', certError);
          certWarning = ' However, certificate upload failed. You can upload it later from the user profile.';
        }
      }
      
      // Show success modal
      setModalState({
        visible: true,
        type: 'success',
        title: 'User Created Successfully!',
        message: `${createdUser.fullName || createdUser.email} has been created and credentials have been sent to their email.${certWarning}`,
        userId: createdUser.id,
      });
      
      // Auto-close modal and navigate after 3 seconds
      setTimeout(() => {
        setModalState(prev => ({ ...prev, visible: false }));
        navigate(`/${routePrefix}/users/${createdUser.id}`);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create user. Please try again.';
      const errorDetails = error?.response?.data?.errors 
        ? Object.entries(error.response.data.errors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n')
        : '';
      
      // Show error modal (stays open until user action)
      setModalState({
        visible: true,
        type: 'error',
        title: 'Failed to Create User',
        message: errorDetails || errorMessage,
      });
      
      throw error;
    }
  }, [formData, createUserMutation, navigate, routePrefix]);

  const handleCancel = useCallback(() => {
    navigate(`/${routePrefix}/users`);
  }, [navigate, routePrefix]);

  // Handle modal actions
  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }));
    if (modalState.type === 'error') {
      // On error, stay on the page so user can retry
      // Modal will close but form data is preserved
    }
  }, [modalState.type]);

  const handleRetry = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }));
    // Form data is preserved, user can modify and retry
  }, []);

  const handleGoToIndex = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }));
    navigate(`/${routePrefix}/users`);
  }, [navigate, routePrefix]);

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
            <Button type="primary" onClick={() => navigate(`/${routePrefix}/users`)}>
              Back to Users
            </Button>
          ),
        }}
      />

      {/* Success/Error Modal */}
      <Modal
        open={modalState.visible}
        closable={modalState.type === 'error'}
        onCancel={handleModalClose}
        footer={modalState.type === 'success' ? null : [
          <Button key="retry" onClick={handleRetry}>
            Retry
          </Button>,
          <Button key="close" type="primary" onClick={handleGoToIndex}>
            Go to Users List
          </Button>,
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          {modalState.type === 'success' ? (
            <SuccessIcon style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
          ) : (
            <ErrorIcon style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 16 }} />
          )}
          <h2 style={{ marginBottom: 8 }}>{modalState.title}</h2>
          <p style={{ whiteSpace: 'pre-line', color: '#666' }}>{modalState.message}</p>
          {modalState.type === 'success' && (
            <p style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
              Redirecting to user profile...
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
