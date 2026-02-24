/**
 * BoardSelector Component
 * Reusable component for selecting board assignments
 * Similar to ParticipantSelector but for boards
 * Shows assigned boards in cards with add modal
 */

import React, { useMemo, useCallback, useState } from 'react';
import {
  Typography,
  Empty,
  Card,
  Avatar,
  Select,
  Alert,
  Spin,
  Tag,
  Space,
  Button,
} from 'antd';
import {
  DeleteOutlined,
  UserOutlined,
  BankOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { useLookups } from '../../../contexts/LookupsContext';
import { useBoardMembers } from '../../../hooks/api';
import dayjs from 'dayjs';
import type { BoardAssignment } from '../../../pages/Users/CreateUserSteps/types';
import './BoardSelector.css';

const { Text } = Typography;

// ============================================================================
// TYPES
// ============================================================================

export interface BoardSelectorProps {
  value?: BoardAssignment[];
  onChange?: (assignments: BoardAssignment[]) => void;
  selectedRole?: string; // Primary role from previous step
  mode?: 'create' | 'edit' | 'view';
  allowRoleChange?: boolean; // Allow changing role per board (default: false in create, true in edit)
  readOnly?: boolean; // Read-only mode for viewing only
}

// ============================================================================
// COMPONENT
// ============================================================================

export const BoardSelector: React.FC<BoardSelectorProps> = ({
  value = [],
  onChange,
  selectedRole,
  mode = 'create',
  allowRoleChange = mode === 'edit',
  readOnly = false,
}) => {
  const { allBoards, theme } = useBoardContext();
  const { roles, getRoleByCode } = useLookups();
  
  // For board-centric validation, we'll check leadership status per board
  // Since useBoardMembers requires boardId, we'll implement a simpler approach
  // that checks the current assignments and applies scope-based filtering
  
  // Board selection state (replaces modal state)
  const [selectedBoardIds, setSelectedBoardIds] = useState<number[]>([]);
  const defaultRole = selectedRole || 'director'; // User's default role
  
  // Check if board is already assigned
  const isAssigned = useCallback((boardId: number) => {
    return value.some(a => a.boardId === boardId);
  }, [value]);

  // Filter roles by scope (board and board_leadership only)
  const filteredRoleOptions = useMemo(() => {
    return roles.filter(role => {
      const scopeStr = String(role.scope);
      const isBoardScope = scopeStr === 'board' || scopeStr === '1';
      const isBoardLeadershipScope = scopeStr === 'board_leadership' || scopeStr === '2';
      
      return isBoardScope || isBoardLeadershipScope;
    }).map(role => ({
      label: role.name,
      value: role.code,
      disabled: false, // Will be updated per board
    }));
  }, [roles]);

  // Check if board already has leadership roles assigned
  const getBoardLeadershipStatus = useCallback((boardId: number) => {
    // For now, check current assignments for this board
    // In a real implementation, you'd fetch all board members
    const boardAssignments = value.filter(a => a.boardId === boardId);
    const hasChairman = boardAssignments.some(a => a.role === 'chairman');
    const hasViceChairman = boardAssignments.some(a => a.role === 'vice_chairman');
    
    return { hasChairman, hasViceChairman };
  }, [value]);

  // Get role options for a specific board with proper disabled state
  const getRoleOptionsForBoard = useCallback((boardId: number) => {
    const leadershipStatus = getBoardLeadershipStatus(boardId);
    
    return filteredRoleOptions.map(option => {
      const role = roles.find(r => r.code === option.value);
      if (!role) return option;
      
      const scopeStr = String(role.scope);
      const isLeadershipRole = scopeStr === 'board_leadership' || scopeStr === '2';
      
      // Disable leadership roles if already assigned on this board
      let isDisabled = false;
      let disabledReason = undefined;
      
      if (isLeadershipRole) {
        if (role.code === 'chairman' && leadershipStatus.hasChairman) {
          isDisabled = true;
          disabledReason = 'Already assigned on this board';
        } else if (role.code === 'vice_chairman' && leadershipStatus.hasViceChairman) {
          isDisabled = true;
          disabledReason = 'Already assigned on this board';
        }
      }
      
      return {
        ...option,
        disabled: isDisabled,
        disabledReason,
      };
    });
  }, [filteredRoleOptions, roles, getBoardLeadershipStatus]);

  // Handle board selection change (direct addition like MemberSelector)
  const handleBoardSelectionChange = useCallback((boardIds: number[]) => {
    setSelectedBoardIds(boardIds);
    
    // Add new boards immediately with default role
    const newBoardIds = boardIds.filter(id => !isAssigned(id));
    
    if (newBoardIds.length > 0) {
      const assignmentsToAdd: BoardAssignment[] = [];
      
      newBoardIds.forEach(boardId => {
        const board = allBoards?.find(b => b.id === boardId);
        const role = getRoleByCode(defaultRole);
        
        if (board && role) {
          assignmentsToAdd.push({
            boardId,
            boardName: board.name,
            role: defaultRole,
            roleId: role.id,
            roleName: role.name,
            startDate: dayjs().format('YYYY-MM-DD'),
          });
        }
      });
      
      if (assignmentsToAdd.length > 0) {
        onChange?.([...value, ...assignmentsToAdd]);
      }
    }
  }, [defaultRole, allBoards, getRoleByCode, isAssigned, onChange, value]);

  // Get available boards for selection (filtered by search)
  const availableBoards = useMemo(() => {
    if (!allBoards) return [];
    
    return allBoards.filter(b => !isAssigned(b.id));
  }, [allBoards, isAssigned]);

  // Remove board assignment
  const removeAssignment = (boardId: number) => {
    onChange?.(value.filter(a => a.boardId !== boardId));
  };
  
  // Update board role (only in edit mode)
  const updateAssignmentRole = (boardId: number, newRole: string) => {
    const role = getRoleByCode(newRole);
    onChange?.(value.map(a => 
      a.boardId === boardId 
        ? { ...a, role: newRole, roleId: role?.id, roleName: role?.name }
        : a
    ));
  };
  
  // Render assignment card with role dropdown on the right
  const renderAssignmentCard = (assignment: BoardAssignment) => {
    const board = allBoards?.find(b => b.id === assignment.boardId);
    const roleOptions = getRoleOptionsForBoard(assignment.boardId);
    
    return (
      <Card
        key={assignment.boardId}
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
            icon={<BankOutlined />}
            size={32}
            style={{
              backgroundColor: theme.primaryColor,
              flexShrink: 0,
              fontSize: 14,
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 13, display: 'block' }}>
              {assignment.boardName || board?.name || `Board ${assignment.boardId}`}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {assignment.roleName || assignment.role}
            </Text>
          </div>

          {allowRoleChange && !readOnly && (
            <Select
              value={assignment.role}
              onChange={(newRole) => updateAssignmentRole(assignment.boardId, newRole)}
              options={roleOptions}
              size="small"
              style={{ minWidth: 120 }}
              disabled={readOnly}
            />
          )}

          {!readOnly && (
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeAssignment(assignment.boardId)}
              style={{ flexShrink: 0 }}
            />
          )}
        </div>
      </Card>
    );
  };
  
  return (
    <div style={{ fontSize: 13 }}>
      {/* Board Multi-Select */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
          Select Boards
        </Text>
        <Select
          mode="multiple"
          placeholder="Search and select boards..."
          value={selectedBoardIds}
          onChange={handleBoardSelectionChange}
          style={{ width: '100%', fontSize: 13 }}
          size="middle"
          filterOption={(input, option) => {
            const searchText = option?.searchLabel || option?.label?.toString() || '';
            return searchText.toLowerCase().includes(input.toLowerCase());
          }}
          options={availableBoards.map(board => ({
            label: board.name,
            value: board.id,
            searchLabel: `${board.name} ${board.slug}`,
          }))}
          notFoundContent={
            availableBoards.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ fontSize: 11 }}>All boards have been assigned</span>}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ fontSize: 11 }}>No boards available</span>}
              />
            )
          }
        />
        <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
          New boards are assigned "{getRoleByCode(defaultRole)?.name || 'Director'}" role by default. Change roles below.
        </Text>
      </div>

      {/* Assigned Boards with Inline Role Editing */}
      {value.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ fontSize: 11 }}>No boards assigned yet. Select boards above.</span>}
          style={{ margin: '24px 0' }}
        />
      ) : (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
            Assigned Boards ({value.length})
          </Text>
          {/* Render all board assignment cards */}
          {value.map(renderAssignmentCard)}
        </div>
      )}
    </div>
  );
};

export default BoardSelector;
