/**
 * Meeting Phase Indicator
 * Horizontal step indicator showing current meeting phase
 * Displays: Pre-Meeting → During Meeting → Post-Meeting
 */

import React from 'react';
import { Steps, Tag, Space } from 'antd';
import {
  EditOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { useResponsive } from '../../../hooks';
import type { MeetingPhase, MeetingPhaseStatus } from '../../../contexts/MeetingPhaseContext';

interface MeetingPhaseIndicatorProps {
  phase: MeetingPhase;
  status: MeetingPhaseStatus;
  subStatusLabel?: string;
  compact?: boolean;
}

export const MeetingPhaseIndicator: React.FC<MeetingPhaseIndicatorProps> = ({
  phase,
  status,
  subStatusLabel,
  compact = false,
}) => {
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();

  const getCurrentStep = (): number => {
    switch (phase) {
      case 'pre-meeting':
        return 0;
      case 'during-meeting':
        return 1;
      case 'post-meeting':
        return 2;
      default:
        return 0;
    }
  };

  const getStepStatus = (stepIndex: number): 'wait' | 'process' | 'finish' | 'error' => {
    const currentStep = getCurrentStep();

    // Handle special statuses (these are phaseInfo.status values, not primary meeting statuses)
    // 'cancelled' and 'rejected' are mapped from MeetingPhaseContext
    if (status === 'cancelled' || status === 'rejected') {
      if (stepIndex === currentStep) {
        return 'error';
      }
      return 'wait'; // Grey out all other steps
    }

    // Normal flow: Only show active phase as active, grey out others
    if (stepIndex === currentStep) {
      return status === 'completed' ? 'finish' : 'process';
    } else {
      return 'wait'; // Grey out all non-current phases
    }
  };

  const getStatusBadge = () => {
    if (status === 'cancelled') {
      return (
        <Tag 
          icon={<CloseCircleOutlined />} 
          color={theme.errorColor}
          style={{ marginLeft: 8, fontSize: compact ? '10px' : '11px' }}
        >
          CANCELLED
        </Tag>
      );
    }
    if (status === 'rejected') {
      return (
        <Tag 
          icon={<ExclamationCircleOutlined />} 
          color={theme.warningColor}
          style={{ marginLeft: 8, fontSize: compact ? '10px' : '11px' }}
        >
          REJECTED
        </Tag>
      );
    }
    // Show subStatus label if available (for active states)
    if (subStatusLabel && status === 'active') {
      return (
        <Tag 
          color="blue"
          style={{ marginLeft: 8, fontSize: compact ? '10px' : '11px' }}
        >
          {subStatusLabel}
        </Tag>
      );
    }
    return null;
  };

  const steps = [
    {
      title: 'Pre-Meeting',
      icon: <EditOutlined />,
    },
    {
      title: 'During Meeting',
      icon: <PlayCircleOutlined />,
    },
    {
      title: 'Post-Meeting',
      icon: <CheckCircleOutlined />,
    },
  ];

  const currentStepIndex = getCurrentStep();
  const currentStepData = steps[currentStepIndex];

  // Mobile: Show only active phase with blinking icon
  if (isMobile) {
    return (
      <Space size={4} align="center">
        <span
          className={status === 'active' ? 'phase-indicator-blink' : ''}
          style={{
            fontSize: 16,
            color: status === 'cancelled' || status === 'rejected'
              ? theme.errorColor
              : theme.primaryColor,
          }}
        >
          {currentStepData.icon}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: status === 'cancelled' || status === 'rejected'
              ? theme.errorColor
              : theme.primaryColor,
          }}
        >
          {currentStepData.title}
        </span>
        {getStatusBadge()}
      </Space>
    );
  }

  // Desktop: Show all phases with Steps component
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Steps
        current={currentStepIndex}
        size="small"
        items={steps.map((step, index) => ({
          title: step.title,
          icon: (
            <span className={index === currentStepIndex && status === 'active' ? 'phase-indicator-blink' : ''}>
              {step.icon}
            </span>
          ),
          status: getStepStatus(index),
        }))}
        style={{
          maxWidth: compact ? '450px' : '500px',
          fontSize: compact ? '11px' : '14px',
        }}
      />
      {getStatusBadge()}
    </div>
  );
};
