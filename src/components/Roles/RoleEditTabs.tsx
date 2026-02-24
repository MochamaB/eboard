/**
 * RoleEditTabs Component
 * Vertical tabs layout for editing existing roles
 * Tab 1: Role details (name, description)
 * Tab 2: Permissions
 */

import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Space, message, Alert, Spin } from 'antd';
import { SaveOutlined, InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { VerticalTabsLayout } from '../common/VerticalTabsLayout';
import { useRole, useUpdateRole } from '../../hooks/api';
import { useBoardContext } from '../../contexts';
import type { UpdateRolePayload } from '../../types';
import { RoleBasicInfoFields } from '../../pages/Roles/CreateRole/RoleBasicInfoStep';
import { RolePermissionsFields } from '../../pages/Roles/CreateRole/RolePermissionsStep';
import type { PermissionSelectorHandle } from './PermissionSelector';

interface RoleEditTabsProps {
  roleId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RoleEditTabs: React.FC<RoleEditTabsProps> = ({
  roleId,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('details');
  const [hasChanges, setHasChanges] = useState(false);
  const { theme } = useBoardContext();
  const permissionsSelectorRef = useRef<PermissionSelectorHandle | null>(null);
  
  const { data: role, isLoading, error } = useRole(roleId);
  const updateRoleMutation = useUpdateRole();

  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissionIds: role.permissions.map(p => p.id),
      });
    }
  }, [role, form]);

  useEffect(() => {
    permissionsSelectorRef.current?.expandFirst();
  }, [role?.id]);

  const handleFormChange = () => {
    setHasChanges(true);
  };

  const handleSaveDetails = async () => {
    try {
      await form.validateFields(['name', 'description']);
      const values = form.getFieldsValue(['name', 'description']);
      
      const payload: UpdateRolePayload = {
        name: values.name,
        description: values.description || undefined,
      };

      await updateRoleMutation.mutateAsync({ id: roleId, payload });
      message.success('Role details updated successfully');
      setHasChanges(false);
      onSuccess?.();
    } catch (error: any) {
      if (error?.errorFields) {
        // Validation error
        return;
      }
      message.error(error?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleSavePermissions = async () => {
    try {
      const values = form.getFieldsValue(['permissionIds']);
      
      const payload: UpdateRolePayload = {
        permissionIds: values.permissionIds || [],
      };

      await updateRoleMutation.mutateAsync({ id: roleId, payload });
      message.success('Role permissions updated successfully');
      setHasChanges(false);
      onSuccess?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update permissions');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading role...</div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <Alert
        type="error"
        message="Failed to load role"
        description="The role could not be found or loaded."
        showIcon
      />
    );
  }

  const isSystemRole = role.isSystem;

  const tabs = [
    {
      key: 'details',
      label: 'Role Details',
      icon: <InfoCircleOutlined />,
      content: (
        <div>
          {isSystemRole && (
            <Alert
              type="warning"
              message="System Role"
              description="This is a system role and cannot be modified. System roles are predefined and protected."
              icon={<LockOutlined />}
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <RoleBasicInfoFields />

          <div style={{ 
            padding: 16, 
            background: '#f5f5f5', 
            borderRadius: 6,
            marginBottom: 16 
          }}>
            <Space direction="vertical" size={4}>
              <div style={{ fontSize: 13, color: '#666' }}>
                <strong>Scope:</strong> {role.scope}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                <strong>Users with this role:</strong> {role.userCount || 0}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                <strong>Created:</strong> {new Date(role.createdAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                <strong>Last updated:</strong> {new Date(role.updatedAt).toLocaleDateString()}
              </div>
            </Space>
          </div>

          {!isSystemRole && (
            <div style={{ 
              marginTop: 24, 
              paddingTop: 16, 
              borderTop: '1px solid #f0f0f0' 
            }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveDetails}
                  loading={updateRoleMutation.isPending}
                  disabled={!hasChanges}
                  style={{ 
                    background: theme.primaryColor, 
                    borderColor: theme.primaryColor 
                  }}
                >
                  Save Changes
                </Button>
                <Button onClick={onCancel}>
                  Cancel
                </Button>
              </Space>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      icon: <LockOutlined />,
      content: (
        <div>
          {isSystemRole && (
            <Alert
              type="warning"
              message="System Role Permissions"
              description="System role permissions cannot be modified."
              icon={<LockOutlined />}
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <RolePermissionsFields
            selectorRef={permissionsSelectorRef}
            primaryColor={theme.primaryColor}
            disabled={isSystemRole}
          />

          {!isSystemRole && (
            <div style={{ 
              marginTop: 24, 
              paddingTop: 16, 
              borderTop: '1px solid #f0f0f0' 
            }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSavePermissions}
                  loading={updateRoleMutation.isPending}
                  disabled={!hasChanges}
                  style={{ 
                    background: theme.primaryColor, 
                    borderColor: theme.primaryColor 
                  }}
                >
                  Save Permissions
                </Button>
                <Button onClick={onCancel}>
                  Cancel
                </Button>
              </Space>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleFormChange}
      disabled={isSystemRole}
    >
      <VerticalTabsLayout
        tabs={tabs}
        defaultActiveKey={activeTab}
        onChange={setActiveTab}
        primaryColor={theme.primaryColor}
        sidebarWidth={180}
      />
    </Form>
  );
};

export default RoleEditTabs;
