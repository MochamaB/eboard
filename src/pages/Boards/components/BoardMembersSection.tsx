import React, { useMemo, useEffect, useState } from 'react';
import { Form, Typography, Divider, Spin, Alert } from 'antd';
import type { FormInstance } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { useBoardMembers } from '../../../hooks/api';
import { useLookups } from '../../../contexts/LookupsContext';
import { MemberSelector } from '../../../components/Boards/MemberSelector';
import type { BoardMemberAssignment } from '../../../components/Boards/MemberSelector/MemberSelector';

const { Title, Text } = Typography;

interface BoardMembersSectionProps {
  form: FormInstance;
  boardId?: number;
  isLoadingMembers?: boolean;
  initialMemberCount?: number;
}

const BoardMembersSection: React.FC<BoardMembersSectionProps> = ({
  form,
  boardId,
  isLoadingMembers = false,
  initialMemberCount,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [members, setMembers] = useState<BoardMemberAssignment[]>([]);
  const { getRoleByCode } = useLookups();

  // Fetch existing board members from API
  const { data: boardMembersData, isLoading: isLoadingBoardMembers } = useBoardMembers(
    boardId || 0,
    { page: 1, pageSize: 100 }
  );

  const existingBoardMembers = useMemo(() => boardMembersData?.data || [], [boardMembersData?.data]);

  // Initialize local state and form with existing board members (convert to MemberSelector format)
  useEffect(() => {
    if (!isInitialized && existingBoardMembers.length > 0) {
      const initialMembers: BoardMemberAssignment[] = existingBoardMembers.map(member => {
        const roleInfo = getRoleByCode(member.roleCode || member.role || 'board_member');
        return {
          userId: member.userId,
          userName: member.fullName || `User ${member.userId}`,
          userEmail: member.email,
          roleCode: member.roleCode || member.role || 'board_member',
          roleId: member.roleId || roleInfo?.id || 0,
          roleName: member.roleName || roleInfo?.name || 'Board Member',
          startDate: member.startDate ? new Date(member.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        };
      });
      setMembers(initialMembers);
      form.setFieldValue('members', initialMembers);
      setIsInitialized(true);
    }
  }, [existingBoardMembers, isInitialized, form, getRoleByCode]);

  // Handle validation changes from MemberSelector
  const handleValidationChange = (isValid: boolean, errors: string[]) => {
    setValidationErrors(errors);
  };

  // Handle members change - update both local state and form
  const handleMembersChange = (newMembers: BoardMemberAssignment[]) => {
    setMembers(newMembers);
    form.setFieldValue('members', newMembers);
  };

  const isLoading = isLoadingMembers || isLoadingBoardMembers;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
          Board Members
        </Title>
        <Text type="secondary">
          Assign users to this board and define their roles. Leadership roles (Chairman, Vice Chairman) can only be assigned to one person each.
        </Text>
      </div>
      <Divider style={{ margin: '16px 0' }} />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading members...</Text>
          </div>
        </div>
      ) : (
        <>
          {/* Show validation errors if any */}
          {validationErrors.length > 0 && (
            <Alert
              message="Board Membership Issues"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Use MemberSelector component */}
          <MemberSelector
            value={members}
            onChange={handleMembersChange}
            onValidationChange={handleValidationChange}
          />

          {initialMemberCount !== undefined && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Original board had {initialMemberCount} member{initialMemberCount !== 1 ? 's' : ''}
              </Text>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoardMembersSection;
