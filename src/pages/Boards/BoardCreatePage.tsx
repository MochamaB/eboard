/**
 * BoardCreatePage - Refactored with separate step components
 * Multi-step wizard for creating new boards
 * Uses WizardForm component with up to 5 steps:
 * 1. Basic Information
 * 2. Board Settings
 * 3. Branding (conditional - only for main/subsidiary)
 * 4. Members (assign board members including required Chairman)
 * 5. Review & Create
 */

import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import {
  ApartmentOutlined,
  SettingOutlined,
  BgColorsOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { WizardForm, type WizardStep } from '../../components/common';
import { useBoardContext } from '../../contexts';
import { useLookups } from '../../contexts/LookupsContext';
import { useCreateBoard, useAddBoardMember } from '../../hooks/api/useBoards';
import {
  DEFAULT_BOARD_SETTINGS,
  type BoardType,
} from '../../types/board.types';
import {
  BasicInfoStep,
  BoardSettingsStep,
  BrandingStep,
  MembersStep,
  ReviewStep,
} from './steps';

const BoardCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { allBoards, routePrefix } = useBoardContext();
  const {
    getBoardTypeByCode,
    getBoardZoneByCode,
    getMeetingFrequencyByCode,
    getVotingThresholdByCode,
    getRoleByCode
  } = useLookups();
  const [form] = Form.useForm();

  // Mutations
  const createBoardMutation = useCreateBoard();
  const addMemberMutation = useAddBoardMember();

  // Track members validation state
  const [membersValid, setMembersValid] = useState(false);

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
      // Subsidiaries can only have Main Board as parent
      return allBoards.filter(b => b.type === 'main');
    } else if (boardType === 'factory') {
      // CORRECTED: Factories report to main board (KTDA MS), not subsidiaries
      return allBoards.filter(b => b.type === 'main');
    } else if (boardType === 'committee') {
      // Committees can have Main or Subsidiary as parent
      return allBoards.filter(b => b.type === 'main' || b.type === 'subsidiary');
    }

    return [];
  }, [boardType, allBoards]);

  // Auto-apply default settings when board type changes
  useEffect(() => {
    if (boardType && DEFAULT_BOARD_SETTINGS[boardType as BoardType]) {
      const defaults = DEFAULT_BOARD_SETTINGS[boardType as BoardType];
      form.setFieldsValue({
        quorumPercentage: defaults.quorumPercentage,
        meetingFrequency: defaults.meetingFrequency,
        votingThreshold: defaults.votingThreshold,
        minMeetingsPerYear: defaults.minMeetingsPerYear,
        confirmationRequired: defaults.confirmationRequired,
        designatedApproverRole: defaults.designatedApproverRole,
        allowVirtualMeetings: defaults.allowVirtualMeetings,
        requireAttendanceTracking: defaults.requireAttendanceTracking,
      });
    }
  }, [boardType, form]);

  // Handler for type change
  const handleTypeChange = () => {
    // Reset dependent fields when type changes
    form.setFieldValue('parentId', undefined);
    form.setFieldValue('zone', undefined);
  };

  // Validation functions for each step
  const validateStep1 = async (): Promise<boolean> => {
    try {
      const fieldsToValidate = ['type', 'name', 'shortName'];

      // Add conditional required fields
      if (requiresParentBoard) {
        fieldsToValidate.push('parentId');
      }
      if (requiresZone) {
        fieldsToValidate.push('zone');
      }

      await form.validateFields(fieldsToValidate);
      return true;
    } catch {
      message.error('Please fill in all required fields');
      return false;
    }
  };

  const validateStep2 = async (): Promise<boolean> => {
    try {
      const fieldsToValidate = [
        'quorumPercentage',
        'meetingFrequency',
        'votingThreshold',
        'minMeetingsPerYear',
      ];

      // Add conditional validation for approver role
      if (form.getFieldValue('confirmationRequired')) {
        fieldsToValidate.push('designatedApproverRole');
      }

      await form.validateFields(fieldsToValidate);
      return true;
    } catch {
      message.error('Please fill in all required settings');
      return false;
    }
  };

  const validateMembers = async (): Promise<boolean> => {
    try {
      await form.validateFields(['members']);
      if (!membersValid) {
        message.error('A Chairman must be assigned to the board');
        return false;
      }
      return true;
    } catch {
      message.error('Please assign at least a Chairman to the board');
      return false;
    }
  };

  // Define wizard steps dynamically
  const steps: WizardStep[] = useMemo(() => {
    const allSteps: WizardStep[] = [
      {
        key: 'basic-info',
        title: 'Basic Information',
        description: 'Name & type',
        icon: <ApartmentOutlined />,
        content: (
          <BasicInfoStep
            form={form}
            boardType={boardType}
            requiresParentBoard={requiresParentBoard}
            requiresZone={requiresZone}
            availableParentBoards={availableParentBoards}
            onTypeChange={handleTypeChange}
          />
        ),
        validate: validateStep1,
      },
      {
        key: 'settings',
        title: 'Board Settings',
        description: 'Governance rules',
        icon: <SettingOutlined />,
        content: (
          <BoardSettingsStep
            form={form}
            boardType={boardType}
            defaultSettings={DEFAULT_BOARD_SETTINGS[boardType as BoardType] || {}}
          />
        ),
        validate: validateStep2,
      },
    ];

    // Conditionally add branding step for main/subsidiary boards
    if (requiresBranding) {
      allSteps.push({
        key: 'branding',
        title: 'Branding',
        description: 'Visual identity',
        icon: <BgColorsOutlined />,
        content: (
          <BrandingStep
            form={form}
            boardType={boardType}
          />
        ),
        optional: true,
      });
    }

    // Add members step (Chairman required)
    allSteps.push({
      key: 'members',
      title: 'Members',
      description: 'Assign members',
      icon: <TeamOutlined />,
      content: (
        <MembersStep
          form={form}
          onValidationChange={setMembersValid}
        />
      ),
      validate: validateMembers,
    });

    // Always add review step
    allSteps.push({
      key: 'review',
      title: 'Review & Create',
      description: 'Confirm details',
      icon: <CheckCircleOutlined />,
      content: (
        <ReviewStep
          form={form}
          boardType={boardType}
          requiresBranding={requiresBranding}
          requiresParentBoard={requiresParentBoard}
          requiresZone={requiresZone}
          availableParentBoards={availableParentBoards}
        />
      ),
    });

    return allSteps;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    boardType,
    requiresBranding,
    requiresParentBoard,
    requiresZone,
    availableParentBoards,
    form,
    membersValid,
  ]);

  // Handle form submission
  const handleFinish = async () => {
    const values = form.getFieldsValue(true);
    console.log('Creating board with values:', values);

    try {
      // Step 1: Map lookup codes to IDs
      const boardTypeId = getBoardTypeByCode(values.type)?.id;
      if (!boardTypeId) {
        message.error('Invalid board type selected');
        return;
      }

      const zoneId = values.zone ? getBoardZoneByCode(values.zone)?.id : undefined;

      // Step 2: Map settings lookup codes to IDs
      const meetingFrequencyId = values.meetingFrequency ?
        getMeetingFrequencyByCode(values.meetingFrequency)?.id : undefined;
      const votingThresholdId = values.votingThreshold ?
        getVotingThresholdByCode(values.votingThreshold)?.id : undefined;
      const approverRoleId = values.designatedApproverRole ?
        getRoleByCode(values.designatedApproverRole)?.id : undefined;

      // Step 3: Prepare create board payload
      const createPayload = {
        name: values.name,
        shortName: values.shortName,
        description: values.description,
        boardTypeId,
        parentId: values.parentId,
        zoneId,
        contactAddress: values.contactAddress,
        contactPoBox: values.contactPoBox,
        contactCity: values.contactCity,
        contactCountry: values.contactCountry,
        contactPhone: values.contactPhone,
        contactPhoneAlt: values.contactPhoneAlt,
        contactEmail: values.contactEmail,
        contactWebsite: values.contactWebsite,
        // Board Settings
        quorumPercentage: values.quorumPercentage,
        meetingFrequencyId,
        votingThresholdId,
        confirmationRequired: values.confirmationRequired,
        approverRoleId,
        minMeetingsPerYear: values.minMeetingsPerYear,
        allowVirtualMeetings: values.allowVirtualMeetings,
        requireAttendanceTracking: values.requireAttendanceTracking,
      };

      // Step 4: Create the board
      const createdBoard = await createBoardMutation.mutateAsync(createPayload);
      message.success(`Board "${createdBoard.name}" created successfully!`);

      // Step 5: Add members if any
      if (values.members && values.members.length > 0) {
        const memberPromises = values.members.map((member: any) =>
          addMemberMutation.mutateAsync({
            boardId: createdBoard.id,
            payload: {
              userId: member.userId,
              roleId: member.roleId,
              startDate: member.startDate,
              isDefault: false,
            },
          })
        );

        await Promise.all(memberPromises);
        message.success(`Added ${values.members.length} member(s) to the board`);
      }

      // Step 6: Navigate to the new board's detail page
      setTimeout(() => {
        navigate(`/${routePrefix}/boards/${createdBoard.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error creating board:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create board';
      message.error(errorMessage);
      throw error; // Re-throw to let WizardForm handle error state
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/${routePrefix}/boards`);
  };

  return (
    <Form form={form} layout="vertical">
      <WizardForm
        steps={steps}
        title="Create New Board"
        subtitle="Follow these steps to create a new board or committee in the organizational hierarchy."
        onFinish={handleFinish}
        onCancel={handleCancel}
        finishButtonText="Create Board"
        successResult={{
          title: 'Board Created Successfully!',
          subTitle: 'The board has been created and members have been assigned.',
        }}
        errorResult={{
          title: 'Failed to Create Board',
          subTitle: 'An error occurred while creating the board. Please try again.',
        }}
      />
    </Form>
  );
};

export default BoardCreatePage;
