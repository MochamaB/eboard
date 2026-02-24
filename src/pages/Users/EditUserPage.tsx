/**
 * Edit User Page
 * Vertical tabs layout for editing existing users
 * Each tab has its own save button for granular updates
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, message, Spin, Alert } from 'antd';
import {
  UserOutlined,
  SafetyOutlined,
  TeamOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { VerticalTabsLayout } from '../../components/common/VerticalTabsLayout';
import type { VerticalTabItem } from '../../components/common/VerticalTabsLayout';
import { useBoardContext } from '../../contexts';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { useUser, useUpdateUser, useUpdateUserBoardAssignments } from '../../hooks/api/useUsers';
import type { UpdateUserPayload, UpdateUserBoardAssignmentsPayload } from '../../types/user.types';
import {
  BasicInfoStep,
  RoleSelectionStep,
  BoardAssignmentsStep,
  CertificateUploadStep,
  AccountSettingsStep,
  type UserFormData,
} from './CreateUserSteps';

export const EditUserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { theme, routePrefix } = useBoardContext();
  const [form] = Form.useForm<UserFormData>();
  const updateUserMutation = useUpdateUser();
  const updateBoardAssignmentsMutation = useUpdateUserBoardAssignments();

  // Parse userId to number
  const numericUserId = userId ? parseInt(userId, 10) : 0;
  const { data: user, isLoading, error } = useUser(numericUserId);

  // URL tab navigation - default to 'basic-info'
  const [activeTab, setActiveTab] = useTabNavigation('basic-info');

  // Track which tab is currently saving
  const [savingTab, setSavingTab] = useState<string | null>(null);

  // Track form data across tabs
  const [formData, setFormData] = useState<Partial<UserFormData>>({});

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      const initialData: Partial<UserFormData> = {
        firstName: user.firstName,
        middleName: user.middleName || undefined,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        alternatePhone: user.alternatePhone || undefined,
        alternateEmail: user.alternateEmail || undefined,
        employeeId: user.employeeId || undefined,
        primaryRole: user.primaryRole,
        requireMfa: user.mfaEnabled,
        status: user.status as 'active' | 'inactive',
        boardAssignments:
          user.boardRoles
            ?.filter(bm => bm.boardId != null)
            .map(bm => ({
              boardId: bm.boardId!,
              boardName: bm.boardName ?? undefined,
              role: bm.roleCode,
              roleId: bm.roleId,
              roleName: bm.roleName,
              startDate: bm.startDate ? new Date(bm.startDate).toISOString() : new Date().toISOString(),
              endDate: bm.endDate ? new Date(bm.endDate).toISOString() : null,
              isDefault: bm.isDefault,
            })) || [],
      };
      setFormData(initialData);
      form.setFieldsValue(initialData);
    }
  }, [user, form]);

  // Determine which tabs to show based on role
  const selectedRole = formData.primaryRole;
  const requiresBoardAssignment = selectedRole && selectedRole !== 'system_admin';
  const requiresCertificate = selectedRole === 'board_secretary';

  // Individual save handlers for each tab
  const handleSaveBasicInfo = useCallback(async (data: Partial<UserFormData>) => {
    setSavingTab('basic-info');
    try {
      const payload: UpdateUserPayload = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        alternateEmail: data.alternateEmail,
        employeeId: data.employeeId,
      };

      await updateUserMutation.mutateAsync({ id: numericUserId, payload });
      message.success('Basic information updated successfully');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update basic information');
      throw error;
    } finally {
      setSavingTab(null);
    }
  }, [numericUserId, updateUserMutation]);

  const handleSaveAccountSettings = useCallback(async (data: Partial<UserFormData>) => {
    setSavingTab('account-settings');
    try {
      const payload: UpdateUserPayload = {
        mfaEnabled: data.requireMfa,
        status: data.status,
      };

      await updateUserMutation.mutateAsync({ id: numericUserId, payload });
      message.success('Account settings updated successfully');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update account settings');
      throw error;
    } finally {
      setSavingTab(null);
    }
  }, [numericUserId, updateUserMutation]);

  const handleSaveBoardAssignments = useCallback(async (data: Partial<UserFormData>) => {
    setSavingTab('board-assignments');
    try {
      const assignments = (data.boardAssignments || []).map((assignment) => {
        if (!assignment.roleId) {
          throw new Error('Each assignment must have a selected role.');
        }

        return {
          boardId: assignment.boardId,
          roleId: assignment.roleId,
          startDate: assignment.startDate,
          endDate: assignment.endDate ?? null,
          isDefault: assignment.isDefault ?? false,
        };
      });

      const payload: UpdateUserBoardAssignmentsPayload = { assignments };

      const updatedUser = await updateBoardAssignmentsMutation.mutateAsync({
        id: numericUserId,
        payload,
      });

      message.success('Board assignments updated successfully');

      // Sync local form state with latest server response
      const refreshedAssignments = updatedUser.boardRoles
        .filter((bm) => bm.boardId != null)
        .map((bm) => ({
          boardId: bm.boardId!,
          boardName: bm.boardName ?? undefined,
          role: bm.roleCode,
          roleId: bm.roleId,
          roleName: bm.roleName,
          startDate: bm.startDate ? new Date(bm.startDate).toISOString() : new Date().toISOString(),
          endDate: bm.endDate ? new Date(bm.endDate).toISOString() : null,
          isDefault: bm.isDefault,
        }));

      setFormData((prev) => ({
        ...prev,
        boardAssignments: refreshedAssignments,
      }));
      form.setFieldsValue({ boardAssignments: refreshedAssignments });
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('Failed to update board assignments');
      }
      throw error;
    } finally {
      setSavingTab(null);
    }
  }, [numericUserId, updateBoardAssignmentsMutation, form]);

  // Build tabs dynamically based on role
  const tabs: VerticalTabItem[] = useMemo(() => {
    const tabItems: VerticalTabItem[] = [
      {
        key: 'basic-info',
        label: 'Basic Information',
        description: 'Name & contact details',
        icon: <UserOutlined />,
        content: (
          <BasicInfoStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="edit"
            originalUser={user}
            onSave={handleSaveBasicInfo}
            isSaving={savingTab === 'basic-info'}
          />
        ),
      },
      {
        key: 'role',
        label: 'Role & Permissions',
        description: 'System role (read-only)',
        icon: <SafetyOutlined />,
        content: (
          <RoleSelectionStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="edit"
            selectedRole={selectedRole}
          />
        ),
        disabled: true, // Role changes not allowed in edit mode
      },
    ];

    // Conditionally add board assignments tab
    if (requiresBoardAssignment) {
      tabItems.push({
        key: 'board-assignments',
        label: 'Board Assignments',
        description: 'Manage board memberships',
        icon: <TeamOutlined />,
        content: (
          <BoardAssignmentsStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="edit"
            selectedRole={selectedRole}
            onSave={handleSaveBoardAssignments}
            isSaving={savingTab === 'board-assignments'}
          />
        ),
      });
    }

    // Conditionally add certificate tab
    if (requiresCertificate) {
      tabItems.push({
        key: 'certificate',
        label: 'Digital Certificate',
        description: 'Upload or replace certificate',
        icon: <SafetyCertificateOutlined />,
        content: (
          <CertificateUploadStep
            formData={formData}
            onChange={setFormData}
            form={form}
            mode="edit"
          />
        ),
      });
    }

    // Always add account settings
    tabItems.push({
      key: 'account-settings',
      label: 'Account Settings',
      description: 'Security & status',
      icon: <SettingOutlined />,
      content: (
        <AccountSettingsStep
          formData={formData}
          onChange={setFormData}
          form={form}
          mode="edit"
          onSave={handleSaveAccountSettings}
          isSaving={savingTab === 'account-settings'}
        />
      ),
    });

    return tabItems;
  }, [
    formData,
    form,
    user,
    selectedRole,
    requiresBoardAssignment,
    requiresCertificate,
    savingTab,
    handleSaveBasicInfo,
    handleSaveAccountSettings,
    handleSaveBoardAssignments,
  ]);

  const handleBack = useCallback(() => {
    navigate(`/${routePrefix}/users/${numericUserId}`);
  }, [navigate, routePrefix, numericUserId]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#999' }}>Loading user data...</div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error Loading User"
          description="Unable to load user data. The user may not exist or you may not have permission to edit this user."
          type="error"
          showIcon
          action={
            <Button onClick={handleBack}>
              Back to Users
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          Edit User: {user.fullName}
        </h2>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          Update user information using the tabs below. Each section can be saved individually.
        </p>
      </div>

      {/* Vertical Tabs Layout */}
      <VerticalTabsLayout
        tabs={tabs}
        defaultActiveKey={activeTab}
        onChange={setActiveTab}
        primaryColor={theme.primaryColor}
        sidebarWidth={280}
      />
    </div>
  );
};

export default EditUserPage;
