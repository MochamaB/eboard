/**
 * Action Item Card
 * Displays an action item with status, priority, assignee, and due date
 */

import React from 'react';
import { Card, Space, Typography, Avatar, Tooltip, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { ActionItem } from '../../../types/actionItems.types';
import { ActionItemStatusTag } from './ActionItemStatusTag';
import { ActionItemPriorityTag } from './ActionItemPriorityTag';
import { isActionItemOverdue, getDaysUntilDue } from '../../../types/actionItems.types';

const { Text, Paragraph } = Typography;

interface ActionItemCardProps {
  actionItem: ActionItem;
  mode?: 'compact' | 'detailed' | 'dashboard';
  showAssignee?: boolean;
  showMeeting?: boolean;
  onStatusChange?: (status: ActionItem['status']) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({
  actionItem,
  mode = 'detailed',
  showAssignee = true,
  showMeeting = false,
  onStatusChange,
  onEdit,
  onDelete,
  onClick,
}) => {
  const { theme } = useBoardContext();

  const isOverdue = isActionItemOverdue(actionItem);
  const daysUntilDue = getDaysUntilDue(actionItem.dueDate);
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7 && actionItem.status !== 'completed';

  const menuItems: MenuProps['items'] = [
    onStatusChange && actionItem.status !== 'completed' && {
      key: 'complete',
      icon: <CheckOutlined />,
      label: 'Mark as Completed',
      onClick: () => onStatusChange('completed'),
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
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <ActionItemPriorityTag priority={actionItem.priority} size="small" />
            <Text strong style={{ fontSize: '14px' }}>{actionItem.title}</Text>
          </div>
          <Space size={12}>
            <ActionItemStatusTag status={actionItem.status} size="small" />
            {showAssignee && (
              <Space size={4}>
                <UserOutlined style={{ fontSize: '12px', color: theme.textSecondary }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {actionItem.assignedToName}
                </Text>
              </Space>
            )}
            <Space size={4}>
              <CalendarOutlined 
                style={{ 
                  fontSize: '12px', 
                  color: isOverdue ? theme.errorColor : isDueSoon ? theme.warningColor : theme.textSecondary 
                }} 
              />
              <Text 
                type={isOverdue ? 'danger' : isDueSoon ? 'warning' : 'secondary'} 
                style={{ fontSize: '12px' }}
              >
                {new Date(actionItem.dueDate).toLocaleDateString()}
              </Text>
            </Space>
          </Space>
        </Space>
      </div>
      {menuItems && menuItems.length > 0 && (
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      )}
    </div>
  );

  const renderDetailedMode = () => (
    <Card
      size="small"
      style={{
        marginBottom: '12px',
        borderColor: isOverdue ? theme.errorColor : isDueSoon ? theme.warningColor : theme.borderColor,
        borderWidth: isOverdue || isDueSoon ? '2px' : '1px',
      }}
      styles={{
        body: { padding: '16px' },
      }}
      extra={
        menuItems && menuItems.length > 0 ? (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        ) : null
      }
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <ActionItemPriorityTag priority={actionItem.priority} />
                <Text strong style={{ fontSize: '16px' }}>{actionItem.title}</Text>
              </div>
              {actionItem.description && (
                <Paragraph 
                  style={{ marginBottom: 0, color: theme.textSecondary }}
                  ellipsis={{ rows: 2, expandable: true }}
                >
                  {actionItem.description}
                </Paragraph>
              )}
            </Space>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <ActionItemStatusTag status={actionItem.status} />
          
          {showAssignee && (
            <Space size={8}>
              <Avatar size="small" icon={<UserOutlined />} />
              <div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                  Assigned to
                </Text>
                <Text strong style={{ fontSize: '13px' }}>
                  {actionItem.assignedToName}
                </Text>
              </div>
            </Space>
          )}

          <div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Due Date
            </Text>
            <Space size={4}>
              <CalendarOutlined 
                style={{ 
                  color: isOverdue ? theme.errorColor : isDueSoon ? theme.warningColor : theme.textPrimary 
                }} 
              />
              <Text 
                strong 
                style={{ 
                  fontSize: '13px',
                  color: isOverdue ? theme.errorColor : isDueSoon ? theme.warningColor : theme.textPrimary 
                }}
              >
                {new Date(actionItem.dueDate).toLocaleDateString()}
              </Text>
              {isOverdue && (
                <Text type="danger" style={{ fontSize: '12px' }}>
                  (Overdue)
                </Text>
              )}
              {isDueSoon && !isOverdue && (
                <Text type="warning" style={{ fontSize: '12px' }}>
                  (Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'})
                </Text>
              )}
            </Space>
          </div>
        </div>

        {actionItem.completedAt && (
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: theme.successLight, 
            borderRadius: '4px',
            borderLeft: `3px solid ${theme.successColor}`,
          }}>
            <Text style={{ fontSize: '12px', color: theme.successColor }}>
              Completed on {new Date(actionItem.completedAt).toLocaleDateString()}
              {actionItem.completionNotes && ` - ${actionItem.completionNotes}`}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );

  const renderDashboardMode = () => (
    <div
      style={{
        padding: '12px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ActionItemPriorityTag priority={actionItem.priority} size="small" showIcon={false} />
          <Text strong style={{ fontSize: '14px', flex: 1 }}>{actionItem.title}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={4}>
            <CalendarOutlined 
              style={{ 
                fontSize: '12px', 
                color: isOverdue ? theme.errorColor : isDueSoon ? theme.warningColor : theme.textSecondary 
              }} 
            />
            <Text 
              type={isOverdue ? 'danger' : isDueSoon ? 'warning' : 'secondary'} 
              style={{ fontSize: '12px' }}
            >
              {new Date(actionItem.dueDate).toLocaleDateString()}
            </Text>
          </Space>
          <ActionItemStatusTag status={actionItem.status} size="small" showIcon={false} />
        </div>
      </Space>
    </div>
  );

  switch (mode) {
    case 'compact':
      return renderCompactMode();
    case 'dashboard':
      return renderDashboardMode();
    case 'detailed':
    default:
      return renderDetailedMode();
  }
};
