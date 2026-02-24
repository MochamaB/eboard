/**
 * RolePermissionsStep Component
 * Step 2 of role creation wizard - permission selection
 */

import React, { useRef, useEffect } from 'react';
import { Button, Form, Space, Typography } from 'antd';
import {
  PermissionSelector,
  type PermissionSelectorHandle,
} from '../../../components/Roles/PermissionSelector';
import { useBoardContext } from '../../../contexts';

interface RolePermissionsStepProps {
  form: any;
}

export const RolePermissionsStep: React.FC<RolePermissionsStepProps> = ({ form }) => {
  const { theme } = useBoardContext();
  const selectorRef = useRef<PermissionSelectorHandle | null>(null);

  useEffect(() => {
    selectorRef.current?.expandFirst();
  }, [selectorRef]);

  const fields = (
    <RolePermissionsFields
      selectorRef={selectorRef}
      primaryColor={theme.primaryColor}
    />
  );

  return (
    <div>
      <Form form={form} layout="vertical">
        {fields}
      </Form>
    </div>
  );
};

export default RolePermissionsStep;

interface RolePermissionsFieldsProps {
  selectorRef?: React.MutableRefObject<PermissionSelectorHandle | null>;
  primaryColor: string;
  disabled?: boolean;
}

export const RolePermissionsFields: React.FC<RolePermissionsFieldsProps> = ({
  selectorRef,
  primaryColor,
  disabled = false,
}) => {
  const { theme } = useBoardContext();

  return (
    <Form.Item
      name="permissionIds"
      label={
        <Space align="center" size={12}>
          <Typography.Text strong>Select Permissions</Typography.Text>
          <Space size={8}>
            <Button
              type="link"
              size="small"
              onClick={() => selectorRef?.current?.collapseAll()}
              disabled={disabled}
            >
              Collapse all
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => selectorRef?.current?.expandAll()}
              disabled={disabled}
            >
              Expand all
            </Button>
          </Space>
        </Space>
      }
      extra="Choose the permissions this role should have. You can select all permissions in a category or individual permissions."
    >
      <PermissionSelector
        ref={selectorRef}
        primaryColor={primaryColor || theme.primaryColor}
        disabled={disabled}
      />
    </Form.Item>
  );
};
