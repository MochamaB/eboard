/**
 * BoardAssignmentsStep Component
 * Step 3: Assign user to boards (conditional - only for non-system_admin roles)
 * Uses BoardSelector component for card-based UI
 * Reusable in both Create and Edit user flows
 */

import React from 'react';
import { Typography, Alert, Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { BoardSelector } from '../../../components/users/BoardSelector';
import type { BoardAssignmentsStepProps } from './types';

const { Title, Text } = Typography;

export const BoardAssignmentsStep: React.FC<BoardAssignmentsStepProps> = ({
  formData,
  onChange,
  mode = 'create',
  selectedRole,
  onSave,
  isSaving = false,
}) => {
  const handleSave = async () => {
    if (onSave) {
      await onSave(formData);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Board Assignments
        </Title>
        <Text type="secondary">
          {mode === 'create'
            ? "Assign the user to one or more boards and specify their role on each board."
            : "Update the user's board assignments and roles."}
        </Text>
      </div>

      <Alert
        message={<span style={{ fontSize: 13, fontWeight: 600 }}>Board Membership Required</span>}
        description={
          <span style={{ fontSize: 12 }}>
            This role requires board membership. Please assign the user to at least one board.
          </span>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 24, padding: '12px 16px' }}
      />

      <BoardSelector
        value={formData.boardAssignments || []}
        onChange={(assignments) => onChange({ ...formData, boardAssignments: assignments })}
        selectedRole={selectedRole}
        mode={mode}
        allowRoleChange={mode === 'edit'}
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

export default BoardAssignmentsStep;
