/**
 * BoardCreatePage - Refactored with separate step components
 * Multi-step wizard for creating new boards
 * Uses WizardForm component with 4 steps:
 * 1. Basic Information
 * 2. Board Settings
 * 3. Branding (conditional - only for main/subsidiary)
 * 4. Review & Create
 */

import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import {
  ApartmentOutlined,
  SettingOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { WizardForm, type WizardStep } from '../../components/common';
import { useBoardContext } from '../../contexts';
import {
  DEFAULT_BOARD_SETTINGS,
  type BoardType,
} from '../../types/board.types';
import {
  BasicInfoStep,
  BoardSettingsStep,
  BrandingStep,
  ReviewStep,
} from './steps';

const BoardCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBoard, allBoards } = useBoardContext();
  const [form] = Form.useForm();

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
  }, [
    boardType,
    requiresBranding,
    requiresParentBoard,
    requiresZone,
    availableParentBoards,
    form,
  ]);

  // Handle form submission
  const handleFinish = async () => {
    const values = form.getFieldsValue(true);
    console.log('Creating board with values:', values);

    // TODO: Call API to create board
    message.success('Board created successfully!');

    // Navigate to boards list after success
    setTimeout(() => {
      navigate(`/${currentBoard?.id}/boards`);
    }, 1500);
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/${currentBoard?.id}/boards`);
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
          subTitle: 'The board has been created. You can now add members and committees.',
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
