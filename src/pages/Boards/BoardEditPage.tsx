/**
 * BoardEditPage Component
 * Edit existing board using VerticalTabsLayout with reusable form sections
 */

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Space, Typography, message, Spin, Result } from 'antd';
import { 
  SaveOutlined, 
  CloseOutlined, 
  InfoCircleOutlined,
  PhoneOutlined,
  SettingOutlined,
  BgColorsOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { VerticalTabsLayout } from '../../components/common';
import { useBoardContext } from '../../contexts';
import { useLookups } from '../../contexts/LookupsContext';
import { useBoard, useUpdateBoard, useBoardMembers } from '../../hooks/api';
import { boardsApi } from '../../api';
import { BasicInfoStep } from './steps';
import { BoardSettingsStep } from './steps';
import { BrandingStep } from './steps';
import ContactInfoSection from './components/ContactInfoSection';
import BoardMembersSection from './components/BoardMembersSection';
import type { UpdateBoardPayload, AddBoardMemberPayload } from '../../types/board.types';
import type { BoardMemberAssignment } from '../../components/Boards/MemberSelector/MemberSelector';

const { Title, Text } = Typography;

export const BoardEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { targetBoardId } = useParams<{ targetBoardId: string }>();
  const { routePrefix, allBoards } = useBoardContext();
  const {
    getBoardTypeByCode,
    getBoardZoneByCode,
    getMeetingFrequencyByCode,
    getVotingThresholdByCode,
    getRoleByCode
  } = useLookups();
  const [form] = Form.useForm();

  // Convert targetBoardId to numeric ID for API call
  const numericBoardId = useMemo(() => {
    if (!targetBoardId) return 0;
    const parsed = parseInt(targetBoardId, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [targetBoardId]);

  // Fetch board data
  const { data: board, isLoading, error } = useBoard(numericBoardId);

  // Fetch initial board members for comparison during save
  const { data: initialBoardMembersData } = useBoardMembers(
    numericBoardId,
    { page: 1, pageSize: 100 }
  );

  // Update mutation
  const updateBoardMutation = useUpdateBoard();

  // Watch board type for conditional rendering
  const boardType = Form.useWatch('type', form);

  // Determine conditional field visibility
  const requiresParentBoard = useMemo(() => {
    return boardType === 'subsidiary' || boardType === 'factory' || boardType === 'committee';
  }, [boardType]);

  const requiresZone = useMemo(() => {
    return boardType === 'factory';
  }, [boardType]);

  const requiresBranding = useMemo(() => {
    return boardType === 'main' || boardType === 'subsidiary';
  }, [boardType]);

  // Filter boards for parent board selection based on type
  const availableParentBoards = useMemo(() => {
    if (!boardType) return [];

    if (boardType === 'subsidiary') {
      return allBoards.filter(b => b.type === 'main');
    } else if (boardType === 'factory') {
      return allBoards.filter(b => b.type === 'main');
    } else if (boardType === 'committee') {
      return allBoards.filter(b => b.type === 'main' || b.type === 'subsidiary');
    }

    return [];
  }, [boardType, allBoards]);

  // Initialize form with board data
  useEffect(() => {
    if (board) {
      form.setFieldsValue({
        type: board.type,
        slug: board.slug,
        name: board.name,
        shortName: board.shortName,
        description: board.description || '',
        parentId: board.parentId ?? undefined,
        zone: board.zone || undefined,
        isActive: board.status === 'active',

        // Contact Info - use flat field names
        contactAddress: board.contactInfo?.address || '',
        contactPoBox: board.contactInfo?.poBox || '',
        contactCity: board.contactInfo?.city || '',
        contactCountry: board.contactInfo?.country || '',
        contactPhone: board.contactInfo?.phone || '',
        contactPhoneAlt: board.contactInfo?.phoneAlt || '',
        contactEmail: board.contactInfo?.email || '',
        contactWebsite: board.contactInfo?.website || '',

        // Settings
        quorumPercentage: board.settings?.quorumPercentage || 50,
        meetingFrequency: board.settings?.meetingFrequency || 'quarterly',
        votingThreshold: board.settings?.votingThreshold || 'simple_majority',
        minMeetingsPerYear: board.settings?.minMeetingsPerYear || 4,
        confirmationRequired: board.settings?.confirmationRequired ?? true,
        designatedApproverRole: board.settings?.approverRoleCode || '',
        allowVirtualMeetings: board.settings?.allowVirtualMeetings ?? true,
        requireAttendanceTracking: board.settings?.requireAttendanceTracking ?? true,
        allowSecretarySkipAgenda: board.settings?.allowSecretarySkipAgenda ?? false,
        allowSecretarySkipDocuments: board.settings?.allowSecretarySkipDocuments ?? false,
        requireApprovalForOverrides: board.settings?.requireApprovalForOverrides ?? true,
      });

      // Note: members field will be initialized by BoardMembersSection component
    }
  }, [board, form]);

  // Handler for type change
  const handleTypeChange = () => {
    form.setFieldValue('parentId', undefined);
    form.setFieldValue('zone', undefined);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log('=== BOARD EDIT DEBUG ===');
      console.log('Form values:', values);
      console.log('Board type from form:', values.type);
      console.log('Board type from loaded data:', board?.type);

      // In edit mode, use the loaded board type if form value is missing
      // This handles cases where the user never visited the Basic Info tab
      const boardTypeCode = values.type || board?.type;
      console.log('Using board type code:', boardTypeCode);

      if (!boardTypeCode) {
        message.error('Board type is missing. Please refresh the page and try again.');
        return;
      }

      // Step 1: Map lookup codes to IDs
      const boardTypeResult = getBoardTypeByCode(boardTypeCode);
      console.log('getBoardTypeByCode result:', boardTypeResult);

      const boardTypeId = boardTypeResult?.id;
      console.log('Extracted boardTypeId:', boardTypeId);

      if (!boardTypeId) {
        console.error('❌ Board type validation failed!');
        console.error('boardTypeCode:', boardTypeCode, 'type:', typeof boardTypeCode);
        console.error('getBoardTypeByCode returned:', boardTypeResult);
        message.error(`Invalid board type: "${boardTypeCode}". Please refresh the page and try again.`);
        return;
      }

      const zoneId = values.zone ? getBoardZoneByCode(values.zone)?.id : undefined;

      // Step 2: Prepare basic board info payload (NO SETTINGS, NO STATUS)
      // Backend doesn't support status update via this endpoint
      const basicInfoPayload: UpdateBoardPayload = {
        name: values.name,
        shortName: values.shortName,
        description: values.description,
        boardTypeId,
        parentId: values.parentId,
        zoneId,

        // Contact Info
        contactAddress: values.contactAddress,
        contactPoBox: values.contactPoBox,
        contactCity: values.contactCity,
        contactCountry: values.contactCountry,
        contactPhone: values.contactPhone,
        contactPhoneAlt: values.contactPhoneAlt,
        contactEmail: values.contactEmail,
        contactWebsite: values.contactWebsite,
      };

      // Step 3: Prepare settings payload separately
      const meetingFrequencyId = values.meetingFrequency ?
        getMeetingFrequencyByCode(values.meetingFrequency)?.id : undefined;
      const votingThresholdId = values.votingThreshold ?
        getVotingThresholdByCode(values.votingThreshold)?.id : undefined;
      const approverRoleId = values.designatedApproverRole ?
        getRoleByCode(values.designatedApproverRole)?.id : undefined;

      const settingsPayload = {
        quorumPercentage: values.quorumPercentage,
        meetingFrequencyId,
        votingThresholdId,
        confirmationRequired: values.confirmationRequired,
        approverRoleId,
        minMeetingsPerYear: values.minMeetingsPerYear,
        allowVirtualMeetings: values.allowVirtualMeetings,
        requireAttendanceTracking: values.requireAttendanceTracking,
        allowSecretarySkipAgenda: values.allowSecretarySkipAgenda,
        allowSecretarySkipDocuments: values.allowSecretarySkipDocuments,
        requireApprovalForOverrides: values.requireApprovalForOverrides,
      };

      // Step 4: Call both endpoints sequentially
      // First update basic board info
      await updateBoardMutation.mutateAsync({
        id: numericBoardId,
        payload: basicInfoPayload,
      });

      // Then update settings separately
      await boardsApi.updateBoardSettings(numericBoardId, settingsPayload);

      // Step 5: Handle member changes (add/remove)
      const currentMembers: BoardMemberAssignment[] = values.members || [];
      const initialMembers = initialBoardMembersData?.data || [];

      // Create sets of user IDs for comparison
      const currentUserIds = new Set(currentMembers.map(m => m.userId));
      const initialUserIds = new Set(initialMembers.map(m => m.userId));

      // Determine which members were added (in current but not in initial)
      const addedMembers = currentMembers.filter(m => !initialUserIds.has(m.userId));

      // Determine which members were removed (in initial but not in current)
      const removedMembers = initialMembers.filter(m => !currentUserIds.has(m.userId));

      // Add new members
      for (const member of addedMembers) {
        const addPayload: AddBoardMemberPayload = {
          userId: member.userId,
          roleId: member.roleId,
          startDate: member.startDate,
        };
        await boardsApi.addBoardMember(numericBoardId, addPayload);
      }

      // Remove deleted members
      for (const member of removedMembers) {
        // Use the member.id (which is the membership ID) for deletion
        const membershipId = member.id || member.membershipId;
        if (membershipId) {
          await boardsApi.removeBoardMember(numericBoardId, membershipId);
        }
      }

      message.success('Board updated successfully!');
      navigate(`/${routePrefix}/boards/${targetBoardId}/details`);
    } catch (error: any) {
      console.error('Error updating board:', error);
      if (error?.errorFields) {
        message.error('Please fix the validation errors');
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update board';
        message.error(errorMessage);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/${routePrefix}/boards/${targetBoardId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading board details...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !board) {
    return (
      <Result
        status="404"
        title="Board Not Found"
        subTitle="The board you are trying to edit could not be located."
        extra={
          <Button type="primary" onClick={() => navigate(`/${routePrefix}/boards`)}>
            Back to Boards
          </Button>
        }
      />
    );
  }

  // Define tabs for VerticalTabsLayout
  const tabs = [
    {
      key: 'basic-info',
      label: 'Basic Information',
      description: 'Name & type',
      icon: <InfoCircleOutlined />,
      content: (
        <BasicInfoStep
          form={form}
          boardType={boardType}
          requiresParentBoard={requiresParentBoard}
          requiresZone={requiresZone}
          availableParentBoards={availableParentBoards}
          onTypeChange={handleTypeChange}
          mode="edit"
          slug={board.slug}
        />
      ),
    },
    {
      key: 'contact-info',
      label: 'Contact Information',
      description: 'Address & contacts',
      icon: <PhoneOutlined />,
      content: <ContactInfoSection form={form} />,
    },
    {
      key: 'settings',
      label: 'Board Settings',
      description: 'Governance rules',
      icon: <SettingOutlined />,
      content: (
        <BoardSettingsStep
          form={form}
          boardType={boardType}
          defaultSettings={board.settings || {}}
        />
      ),
    },
    ...(requiresBranding
      ? [
          {
            key: 'branding',
            label: 'Branding',
            description: 'Logo & colors',
            icon: <BgColorsOutlined />,
            content: <BrandingStep form={form} boardType={boardType} />,
          },
        ]
      : []),
    {
      key: 'members',
      label: 'Board Members',
      description: 'Manage membership',
      icon: <TeamOutlined />,
      content: (
        <BoardMembersSection
          form={form}
          boardId={board?.id || numericBoardId}
          initialMemberCount={board?.memberCount}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Header */}
      <Space direction="vertical" size={8} style={{ marginBottom: 24, width: '100%' }}>
        <Space align="center" size={16}>
          <Title level={5} style={{ margin: 0 }}>
            Edit Board
          </Title>
        </Space>
        <Text type="secondary">
          Update the details, settings, and membership for {board.name}
        </Text>
      </Space>

      {/* Form with VerticalTabsLayout */}
      <Form form={form} layout="vertical">
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <VerticalTabsLayout tabs={tabs} defaultActiveKey="basic-info" />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            marginTop: 24,
            padding: '16px 24px',
            background: '#fff',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={updateBoardMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BoardEditPage;
