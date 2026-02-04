/**
 * Minutes Workflow Timeline
 * Display minutes workflow progress (draft → review → approved → published)
 */

import React from 'react';
import { Steps, Space, Typography, Tag } from 'antd';
import {
  EditOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { Minutes } from '../../../types/minutes.types';

const { Text } = Typography;

interface MinutesWorkflowTimelineProps {
  minutes: Minutes;
  compact?: boolean;
}

export const MinutesWorkflowTimeline: React.FC<MinutesWorkflowTimelineProps> = ({
  minutes,
  compact = false,
}) => {
  const { theme } = useBoardContext();

  const getCurrentStep = () => {
    switch (minutes.status) {
      case 'draft':
        return 0;
      case 'pending_review':
        return 1;
      case 'revision_requested':
        return 1;
      case 'approved':
        return 2;
      case 'published':
        return 3;
      default:
        return 0;
    }
  };

  const getStepStatus = (stepIndex: number): 'wait' | 'process' | 'finish' | 'error' => {
    const currentStep = getCurrentStep();
    
    if (minutes.status === 'revision_requested' && stepIndex === 1) {
      return 'error';
    }
    
    if (stepIndex < currentStep) {
      return 'finish';
    } else if (stepIndex === currentStep) {
      return 'process';
    } else {
      return 'wait';
    }
  };

  const steps = [
    {
      title: 'Draft',
      icon: <EditOutlined />,
      description: minutes.createdAt ? (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Created by User {minutes.createdBy}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(minutes.createdAt).toLocaleString()}
          </Text>
        </Space>
      ) : null,
    },
    {
      title: minutes.status === 'revision_requested' ? 'Revision Requested' : 'Under Review',
      icon: minutes.status === 'revision_requested' ? <ExclamationCircleOutlined /> : <ClockCircleOutlined />,
      description: minutes.submittedAt ? (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {minutes.status === 'revision_requested' 
              ? `Revision requested by User ${minutes.revisionRequestedBy}`
              : `Submitted by User ${minutes.submittedBy}`
            }
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(minutes.status === 'revision_requested' && minutes.revisionRequestedAt 
              ? minutes.revisionRequestedAt 
              : minutes.submittedAt
            ).toLocaleString()}
          </Text>
          {minutes.status === 'revision_requested' && minutes.revisionReason && (
            <Text type="danger" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Reason: {minutes.revisionReason}
            </Text>
          )}
          {minutes.reviewDeadline && minutes.status === 'pending_review' && (
            <Tag color={theme.warningColor} style={{ fontSize: '10px', marginTop: '4px' }}>
              Due: {new Date(minutes.reviewDeadline).toLocaleDateString()}
            </Tag>
          )}
        </Space>
      ) : null,
    },
    {
      title: 'Approved',
      icon: <CheckCircleOutlined />,
      description: minutes.approvedAt ? (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Approved by User {minutes.approvedBy}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(minutes.approvedAt).toLocaleString()}
          </Text>
          {minutes.approvalNotes && (
            <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Notes: {minutes.approvalNotes}
            </Text>
          )}
        </Space>
      ) : null,
    },
    {
      title: 'Published',
      icon: <GlobalOutlined />,
      description: minutes.publishedAt ? (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Published by User {minutes.publishedBy}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(minutes.publishedAt).toLocaleString()}
          </Text>
          {minutes.pdfUrl && (
            <a 
              href={minutes.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}
            >
              View PDF
            </a>
          )}
        </Space>
      ) : null,
    },
  ];

  if (compact) {
    return (
      <Steps
        current={getCurrentStep()}
        size="small"
        items={steps.map((step, index) => ({
          title: step.title,
          icon: step.icon,
          status: getStepStatus(index),
        }))}
      />
    );
  }

  return (
    <Steps
      current={getCurrentStep()}
      direction="vertical"
      items={steps.map((step, index) => ({
        title: step.title,
        description: step.description,
        icon: step.icon,
        status: getStepStatus(index),
      }))}
    />
  );
};
