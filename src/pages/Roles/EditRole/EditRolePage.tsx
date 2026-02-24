/**
 * EditRolePage Component
 * Dedicated page for editing an existing role
 */

import React from 'react';
import { Button, Result, Space, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { RoleEditTabs } from '../../../components/Roles/RoleEditTabs';

const { Title, Text } = Typography;

export const EditRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { roleId: roleIdParam } = useParams<{ roleId: string }>();
  const roleId = Number(roleIdParam);

  if (!roleIdParam || Number.isNaN(roleId) || roleId <= 0) {
    return (
      <Result
        status="404"
        title="Role not found"
        subTitle="The role you are trying to edit could not be located."
        extra={(
          <Button type="primary" onClick={() => navigate('/all/roles')}>
            Back to Roles
          </Button>
        )}
      />
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Space direction="vertical" size={8} style={{ marginBottom: 24 }}>
        <Space align="center" size={16}>
          <Title level={5} style={{ margin: 0 }}>
            Edit Role
          </Title>
         
        </Space>
        <Text type="secondary">
          Update the basic details and permissions associated with this role.
        </Text>
      </Space>

      <RoleEditTabs
        roleId={roleId}
        onCancel={() => navigate('/all/roles')}
        onSuccess={() => navigate('/all/roles')}
      />
    </div>
  );
};

export default EditRolePage;
