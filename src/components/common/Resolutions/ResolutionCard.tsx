/**
 * Resolution Card
 * Displays board resolution with decision, vote summary, and implementation status
 */

import React from 'react';
import { Card, Space, Typography, Tag, Button, Dropdown, Progress } from 'antd';
import type { MenuProps } from 'antd';
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { Resolution } from '../../../types/resolutions.types';
import { ResolutionDecisionBadge } from './ResolutionDecisionBadge';
import { RESOLUTION_CATEGORY_LABELS } from '../../../types/resolutions.types';

const { Text, Paragraph, Title } = Typography;

interface ResolutionCardProps {
  resolution: Resolution;
  mode?: 'compact' | 'detailed';
  showVoteSummary?: boolean;
  showImplementation?: boolean;
  onEdit?: () => void;
  onUpdateStatus?: (status: Resolution['implementationStatus']) => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const ResolutionCard: React.FC<ResolutionCardProps> = ({
  resolution,
  mode = 'detailed',
  showVoteSummary = true,
  showImplementation = true,
  onEdit,
  onUpdateStatus,
  onDelete,
  onClick,
}) => {
  const { theme } = useBoardContext();

  const isOverdue = resolution.requiresFollowUp && 
    resolution.followUpDeadline && 
    resolution.implementationStatus !== 'completed' &&
    new Date(resolution.followUpDeadline) < new Date();

  const getImplementationProgress = () => {
    switch (resolution.implementationStatus) {
      case 'pending':
        return 0;
      case 'in_progress':
        return 50;
      case 'completed':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const getImplementationColor = () => {
    switch (resolution.implementationStatus) {
      case 'completed':
        return theme.successColor;
      case 'in_progress':
        return theme.infoColor;
      case 'cancelled':
        return theme.errorColor;
      default:
        return theme.textSecondary;
    }
  };

  const menuItems: MenuProps['items'] = [
    onUpdateStatus && resolution.implementationStatus !== 'completed' && {
      key: 'complete',
      icon: <CheckCircleOutlined />,
      label: 'Mark as Implemented',
      onClick: () => onUpdateStatus('completed'),
    },
    onEdit && {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: onEdit,
    },
    onDelete && {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: onDelete,
    },
  ].filter(Boolean) as MenuProps['items'];

  const renderCompactMode = () => (
    <div
      style={{
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: `1px solid ${theme.borderColor}`,
        transition: 'background-color 0.2s',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
          <Space size={8}>
            <Tag color={theme.primaryColor}>{resolution.resolutionNumber}</Tag>
            <Text strong style={{ fontSize: '14px' }}>{resolution.title}</Text>
          </Space>
          {menuItems && menuItems.length > 0 && (
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <ResolutionDecisionBadge decision={resolution.decision} size="small" />
          <Tag>{RESOLUTION_CATEGORY_LABELS[resolution.category]}</Tag>
          <Space size={4}>
            <CalendarOutlined style={{ fontSize: '12px', color: theme.textSecondary }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(resolution.decisionDate).toLocaleDateString()}
            </Text>
          </Space>
        </div>
      </Space>
    </div>
  );

  const renderDetailedMode = () => (
    <Card
      size="small"
      style={{
        marginBottom: '16px',
        borderColor: isOverdue ? theme.errorColor : theme.borderColor,
        borderWidth: isOverdue ? '2px' : '1px',
      }}
      styles={{
        body: { padding: '20px' },
      }}
      extra={
        menuItems && menuItems.length > 0 ? (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        ) : null
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Space size={8} style={{ marginBottom: '8px' }}>
            <Tag 
              color={theme.primaryColor} 
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {resolution.resolutionNumber}
            </Tag>
            <Tag>{RESOLUTION_CATEGORY_LABELS[resolution.category]}</Tag>
          </Space>
          <Title level={5} style={{ marginBottom: '8px', marginTop: 0 }}>
            {resolution.title}
          </Title>
          <Paragraph style={{ marginBottom: 0, color: theme.textSecondary }}>
            {resolution.text}
          </Paragraph>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Decision
            </Text>
            <ResolutionDecisionBadge decision={resolution.decision} />
          </div>

          <div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Decision Date
            </Text>
            <Space size={4}>
              <CalendarOutlined style={{ color: theme.textPrimary }} />
              <Text strong>{new Date(resolution.decisionDate).toLocaleDateString()}</Text>
            </Space>
          </div>
        </div>

        {showVoteSummary && resolution.voteSummary && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: theme.backgroundSecondary, 
            borderRadius: '6px',
            border: `1px solid ${theme.borderColor}`,
          }}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
              Vote Summary
            </Text>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>Total Votes:</Text>
                <Text strong style={{ fontSize: '12px' }}>{resolution.voteSummary}</Text>
              </div>
            </Space>
          </div>
        )}

        {showImplementation && resolution.requiresFollowUp && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: isOverdue ? theme.errorLight : theme.backgroundSecondary, 
            borderRadius: '6px',
            border: `1px solid ${isOverdue ? theme.errorColor : theme.borderColor}`,
          }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '13px' }}>Implementation Status</Text>
                <Tag color={getImplementationColor()}>
                  {resolution.implementationStatus.replace('_', ' ').toUpperCase()}
                </Tag>
              </div>
              
              <Progress 
                percent={getImplementationProgress()} 
                strokeColor={getImplementationColor()}
                size="small"
              />

              {resolution.followUpDeadline && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Follow-up Deadline:</Text>
                  <Text 
                    strong 
                    style={{ 
                      fontSize: '12px',
                      color: isOverdue ? theme.errorColor : theme.textPrimary 
                    }}
                  >
                    {new Date(resolution.followUpDeadline).toLocaleDateString()}
                    {isOverdue && ' (Overdue)'}
                  </Text>
                </div>
              )}

              {resolution.followUpNotes && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    Notes:
                  </Text>
                  <Text style={{ fontSize: '12px' }}>{resolution.followUpNotes}</Text>
                </div>
              )}

              {resolution.implementedAt && (
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: theme.successLight, 
                  borderRadius: '4px',
                  marginTop: '4px',
                }}>
                  <Space size={4}>
                    <CheckCircleOutlined style={{ color: theme.successColor }} />
                    <Text style={{ fontSize: '12px', color: theme.successColor }}>
                      Implemented on {new Date(resolution.implementedAt).toLocaleDateString()}
                    </Text>
                  </Space>
                </div>
              )}
            </Space>
          </div>
        )}

        {resolution.agendaItemId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileTextOutlined style={{ fontSize: '12px', color: theme.textSecondary }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Related to Agenda Item
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );

  return mode === 'compact' ? renderCompactMode() : renderDetailedMode();
};
