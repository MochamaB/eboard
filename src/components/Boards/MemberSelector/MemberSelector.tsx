/**
 * MemberSelector Component
 * Reusable component for selecting board members during board creation
 * Simplified flow: multi-select users → auto-assign default role → edit role inline
 * Uses centralized useBoardRoleValidation hook for BoardLeadership validation
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import {
  Typography,
  Empty,
  Card,
  Avatar,
  Select,
  Alert,
  Spin,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { useLookups } from '../../../contexts/LookupsContext';
import { useBoardRoleValidation, useUsers } from '../../../hooks';
import dayjs from 'dayjs';

const { Text } = Typography;

// ============================================================================
// TYPES
// ============================================================================

export interface BoardMemberAssignment {
  userId: number;
  userName: string;
  userEmail?: string;
  roleCode: string;
  roleId: number;
  roleName: string;
  startDate: string;
}

export interface MemberSelectorProps {
  value?: BoardMemberAssignment[];
  onChange?: (members: BoardMemberAssignment[]) => void;
  /** Callback to report validation status to parent */
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

// User option for dropdown display
interface UserOption {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  primaryRole: string;
}

// ============================================================================
// CONSTANTS - Handle both string and numeric scope values from backend
// ============================================================================

const KNOWN_GLOBAL_ROLES = ['super_admin', 'system_admin', 'group_chairman', 'group_company_secretary'];
const KNOWN_LEADERSHIP_ROLES = ['chairman', 'vice_chairman'];

// Scope can be string or number from backend
const isGlobalScope = (scope: string | number): boolean => ['global', '0', 0].includes(scope);
const isBoardLeadershipScope = (scope: string | number): boolean => ['board_leadership', '2', 2].includes(scope);

// ============================================================================
// COMPONENT
// ============================================================================

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  value = [],
  onChange,
  onValidationChange,
}) => {
  const { theme } = useBoardContext();
  const { roles } = useLookups();

  // Use centralized validation hook
  const {
    validateBoardLeadership,
    getRoleOptionsWithState,
    isLeadershipRoleAssigned,
  } = useBoardRoleValidation();

  // Get global scope role codes to filter out
  const globalRoleCodes = useMemo(() => {
    const fromScope = roles
      .filter(r => isGlobalScope(r.scope))
      .map(r => r.code);
    // Combine with known global roles
    return [...new Set([...fromScope, ...KNOWN_GLOBAL_ROLES])];
  }, [roles]);

  // Convert value to RoleAssignment format for validation
  const currentAssignments = useMemo(() => {
    return value.map(m => ({
      userId: m.userId,
      roleCode: m.roleCode,
      roleId: m.roleId,
    }));
  }, [value]);

  // Validate board leadership and report to parent
  const leadershipValidation = useMemo(() => {
    return validateBoardLeadership(currentAssignments);
  }, [validateBoardLeadership, currentAssignments]);

  // Report validation status to parent whenever it changes
  useEffect(() => {
    onValidationChange?.(leadershipValidation.isValid, leadershipValidation.errors);
  }, [leadershipValidation, onValidationChange]);

  // Fetch users from API - get all active users for selection
  const { data: usersData, isLoading: usersLoading } = useUsers({
    status: 'active',
    pageSize: 100,
  });

  // Map API users to UserOption format, filtering out global scope users
  const availableUsers: UserOption[] = useMemo(() => {
    if (!usersData?.data) return [];
    return usersData.data
      .filter(user => !globalRoleCodes.includes(user.primaryRole))
      .map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        avatar: user.avatar,
        primaryRole: user.primaryRole,
      }));
  }, [usersData, globalRoleCodes]);

  // Get default role for new members (first non-leadership board role, typically "director")
  const defaultRole = useMemo(() => {
    // Prefer "director" role, fallback to first board scope role
    const directorRole = roles.find(r => r.code === 'director');
    if (directorRole) return directorRole;

    const boardRole = roles.find(r => r.scope === 'board');
    return boardRole || roles[0];
  }, [roles]);

  // Get role name from code
  const getRoleName = useCallback((roleCode: string) => {
    const role = roles.find(r => r.code === roleCode);
    return role?.name || roleCode;
  }, [roles]);

  // Get currently selected user IDs
  const selectedUserIds = useMemo(() => {
    return value.map(m => m.userId);
  }, [value]);

  // Get available users (not already assigned) with label showing name and role
  const availableUserOptions = useMemo(() => {
    return availableUsers
      .filter(u => !selectedUserIds.includes(u.id))
      .map(user => ({
        label: `${user.name} - ${getRoleName(user.primaryRole)}`,
        value: user.id,
        searchLabel: `${user.name} ${user.email}`,
        user,
      }));
  }, [availableUsers, selectedUserIds, getRoleName]);

  // Handle user selection change (multi-select)
  const handleUserSelectionChange = useCallback((newSelectedIds: number[]) => {
    if (!defaultRole) return;

    // Find newly added users
    const addedIds = newSelectedIds.filter(id => !selectedUserIds.includes(id));
    // Find removed users
    const removedIds = selectedUserIds.filter(id => !newSelectedIds.includes(id));

    // Start with current members minus removed ones
    let updatedMembers = value.filter(m => !removedIds.includes(m.userId));

    // Add new members with default role
    for (const userId of addedIds) {
      const user = availableUsers.find(u => u.id === userId);
      if (user) {
        const newMember: BoardMemberAssignment = {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          roleCode: defaultRole.code,
          roleId: defaultRole.id,
          roleName: defaultRole.name,
          startDate: dayjs().format('YYYY-MM-DD'),
        };
        updatedMembers = [...updatedMembers, newMember];
      }
    }

    onChange?.(updatedMembers);
  }, [value, selectedUserIds, availableUsers, defaultRole, onChange]);

  // Remove member
  const removeMember = useCallback((userId: number) => {
    onChange?.(value.filter(m => m.userId !== userId));
  }, [value, onChange]);

  // Update member role
  const updateMemberRole = useCallback((userId: number, newRoleCode: string) => {
    const role = roles.find(r => r.code === newRoleCode);
    if (!role) return;

    // Check leadership constraint for role changes (exclude current user from check)
    const otherAssignments = currentAssignments.filter(a => a.userId !== userId);
    if ((isBoardLeadershipScope(role.scope) || KNOWN_LEADERSHIP_ROLES.includes(newRoleCode)) && isLeadershipRoleAssigned(newRoleCode, otherAssignments)) {
      return;
    }

    onChange?.(value.map(m =>
      m.userId === userId
        ? { ...m, roleCode: newRoleCode, roleId: role.id, roleName: role.name }
        : m
    ));
  }, [value, roles, currentAssignments, isLeadershipRoleAssigned, onChange]);

  // Get role options with disabled state for a specific user
  const getRoleOptionsForUser = useCallback((userId: number) => {
    // Exclude this user's current assignment when checking constraints
    const otherAssignments = currentAssignments.filter(a => a.userId !== userId);
    const optionsWithState = getRoleOptionsWithState(otherAssignments);

    return optionsWithState.map(({ role, isDisabled, disabledReason }) => ({
      label: (
        <span style={{ fontSize: 13 }}>
          {(isBoardLeadershipScope(role.scope) || KNOWN_LEADERSHIP_ROLES.includes(role.code)) && (
            <CrownOutlined style={{ marginRight: 4, color: '#faad14' }} />
          )}
          {role.name}
          {isDisabled && (
            <Text type="secondary" style={{ marginLeft: 6, fontSize: 11 }}>({disabledReason})</Text>
          )}
        </span>
      ),
      value: role.code,
      disabled: isDisabled,
    }));
  }, [getRoleOptionsWithState, currentAssignments]);

  // Get role style based on scope
  const getRoleStyle = useCallback((roleCode: string) => {
    const role = roles.find(r => r.code === roleCode);
    if (role && (isBoardLeadershipScope(role.scope) || KNOWN_LEADERSHIP_ROLES.includes(roleCode))) {
      return { color: 'gold', icon: <CrownOutlined style={{ fontSize: 10 }} /> };
    }
    return { color: theme.primaryColor, icon: null };
  }, [roles, theme.primaryColor]);

  // Render member card with inline role editing
  const renderMemberCard = useCallback((member: BoardMemberAssignment) => {
    const roleStyle = getRoleStyle(member.roleCode);
    const roleOptionsForUser = getRoleOptionsForUser(member.userId);

    return (
      <Card
        key={member.userId}
        size="small"
        style={{
          marginBottom: 8,
          border: `1px solid ${theme.borderColor}`,
          borderRadius: 6,
        }}
        styles={{ body: { padding: '8px 12px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            icon={<UserOutlined />}
            size={32}
            style={{
              backgroundColor: theme.primaryColor,
              flexShrink: 0,
              fontSize: 14,
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 13, display: 'block' }}>
              {member.userName}
            </Text>
            {member.userEmail && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {member.userEmail}
              </Text>
            )}
          </div>

          <Select
            value={member.roleCode}
            onChange={(newRole) => updateMemberRole(member.userId, newRole)}
            size="small"
            style={{ width: 150, fontSize: 11 }}
            options={roleOptionsForUser}
            popupMatchSelectWidth={false}
            suffixIcon={roleStyle.icon}
          />

          <DeleteOutlined
            style={{
              color: '#ff4d4f',
              fontSize: 14,
              cursor: 'pointer',
              padding: 4,
            }}
            onClick={() => removeMember(member.userId)}
          />
        </div>
      </Card>
    );
  }, [theme, getRoleStyle, getRoleOptionsForUser, updateMemberRole, removeMember]);

  // Custom tag render for multi-select to show user names
  const tagRender = useCallback((props: { label: React.ReactNode; value: number; closable: boolean; onClose: () => void }) => {
    const { value: userId, closable, onClose } = props;
    const member = value.find(m => m.userId === userId);
    const displayName = member?.userName || `User ${userId}`;

    return (
      <Tag
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 4, fontSize: 11 }}
      >
        {displayName}
      </Tag>
    );
  }, [value]);

  return (
    <div style={{ fontSize: 13 }}>
      {/* Leadership Status Alert */}
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 15 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {leadershipValidation.hasChairman ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13 }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 13 }} />
              )}
              Chairman: {leadershipValidation.hasChairman ? 'Assigned' : 'Required'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {leadershipValidation.hasViceChairman ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 15 }} />
              ) : (
                <span style={{ color: '#8c8c8c', fontSize: 13 }}>○</span>
              )}
              Vice Chairman: {leadershipValidation.hasViceChairman ? 'Assigned' : 'Optional'}
            </span>
          </div>
        }
        description={
          <span style={{ fontSize: 13 }}>
            Select users below and assign their roles. Leadership roles can only be assigned to one person each.
          </span>
        }
        type={leadershipValidation.isValid ? 'success' : 'warning'}
        showIcon
        icon={leadershipValidation.isValid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        style={{ marginBottom: 12 }}
      />

      {/* User Multi-Select */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
          Select Members
        </Text>
        <Select
          mode="multiple"
          placeholder="Search and select users..."
          value={selectedUserIds}
          onChange={handleUserSelectionChange}
          style={{ width: '100%', fontSize: 13 }}
          size="middle"
          loading={usersLoading}
          tagRender={tagRender}
          filterOption={(input, option) => {
            const searchText = option?.searchLabel || option?.label?.toString() || '';
            return searchText.toLowerCase().includes(input.toLowerCase());
          }}
          options={availableUserOptions}
          notFoundContent={
            usersLoading ? (
              <div style={{ padding: 12, textAlign: 'center' }}>
                <Spin size="small" />
                <div style={{ marginTop: 6, fontSize: 11 }}>Loading users...</div>
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ fontSize: 11 }}>No users available</span>}
              />
            )
          }
        />
        <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
          New members are assigned "{defaultRole?.name || 'Director'}" role by default. Change roles below.
        </Text>
      </div>

      {/* Assigned Members with Inline Role Editing */}
      {value.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ fontSize: 11 }}>No members assigned yet. Select users above.</span>}
          style={{ margin: '24px 0' }}
        />
      ) : (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
            Assigned Members ({value.length})
          </Text>
          {/* Leadership roles first */}
          {value
            .filter(m => {
              const role = roles.find(r => r.code === m.roleCode);
              return role && (isBoardLeadershipScope(role.scope) || KNOWN_LEADERSHIP_ROLES.includes(m.roleCode));
            })
            .map(renderMemberCard)}
          {/* Then regular roles */}
          {value
            .filter(m => {
              const role = roles.find(r => r.code === m.roleCode);
              return !role || (!isBoardLeadershipScope(role.scope) && !KNOWN_LEADERSHIP_ROLES.includes(m.roleCode));
            })
            .map(renderMemberCard)}
        </div>
      )}
    </div>
  );
};

export default MemberSelector;
