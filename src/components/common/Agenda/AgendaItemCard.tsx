/**
 * Agenda Item Card
 * Displays an agenda item with board-themed styling
 * Supports different display modes: list, detail, execution
 */

import React from 'react';
import { Card, Space, Typography, Tag } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { AgendaItem, AgendaItemStatus } from '../../../types/agenda.types';
import { ItemNumberBadge } from './ItemNumberBadge';
import { ItemTypeTag } from './ItemTypeTag';
import { TimeDisplay } from './TimeDisplay';

const { Text, Paragraph } = Typography;

interface AgendaItemCardProps {
  item: AgendaItem;
  /** Display mode: 'list' (compact), 'detail' (full info), 'execution' (with timing) */
  mode?: 'list' | 'detail' | 'execution';
  /** Is this item currently selected */
  isSelected?: boolean;
  /** Is this a child item */
  isChild?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom actions to show */
  actions?: React.ReactNode;
  /** Show drag handle for reordering */
  isDraggable?: boolean;
}

export const AgendaItemCard: React.FC<AgendaItemCardProps> = ({
  item,
  mode = 'list',
  isSelected = false,
  isChild = false,
  onClick,
  actions,
  isDraggable = false,
}) => {
  const { theme } = useBoardContext();

  const getStatusColor = (status: AgendaItemStatus) => {
    switch (status) {
      case 'completed':
        return theme.successColor;
      case 'in_progress':
        return theme.primaryColor;
      case 'skipped':
        return theme.textDisabled;
      case 'pending':
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: AgendaItemStatus) => {
    if (status === 'completed') return <CheckCircleOutlined />;
    return null;
  };

  const renderListMode = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: isSelected ? theme.primaryLight : 'transparent',
        borderLeft: isSelected ? `3px solid ${theme.primaryColor}` : '3px solid transparent',
        borderBottom: `1px solid ${theme.borderColor}`,
        transition: 'all 0.2s',
        marginLeft: isChild ? '32px' : '0',
      }}
      onClick={onClick}
    >
      {/* Item Number */}
      <ItemNumberBadge number={item.itemNumber} isParent={!isChild} size="default" />

      {/* Item Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Text style={{ fontSize: '14px', color: theme.textPrimary }}>
            {item.title}
          </Text>
          <ItemTypeTag type={item.itemType} size="small" showIcon={false} />
          {item.isAdHoc && (
            <Tag color={theme.warningColor} style={{ fontSize: '10px', padding: '0 4px' }}>
              AD-HOC
            </Tag>
          )}
        </div>

        <Space size="small" style={{ fontSize: '12px', color: theme.textSecondary }}>
          {item.estimatedDuration && (
            <span>
              <ClockCircleOutlined style={{ marginRight: '4px' }} />
              <TimeDisplay durationMinutes={item.estimatedDuration} format="duration" />
            </span>
          )}
          {item.presenterName && (
            <span>
              <UserOutlined style={{ marginRight: '4px' }} />
              {item.presenterName}
            </span>
          )}
          {item.attachedDocumentIds && item.attachedDocumentIds.length > 0 && (
            <span>
              <FileTextOutlined style={{ marginRight: '4px' }} />
              {item.attachedDocumentIds.length}
            </span>
          )}
        </Space>
      </div>

      {/* Status indicator for execution mode */}
      {mode === 'execution' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {getStatusIcon(item.status) && (
            <span style={{ color: getStatusColor(item.status), fontSize: '16px' }}>
              {getStatusIcon(item.status)}
            </span>
          )}
          {item.actualStartTime && (
            <TimeDisplay time={item.actualStartTime} format="time" showIcon />
          )}
        </div>
      )}

      {/* Actions */}
      {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
    </div>
  );

  const renderDetailMode = () => (
    <Card
      style={{
        marginBottom: '12px',
        borderColor: isSelected ? theme.primaryColor : theme.borderColor,
        borderWidth: isSelected ? 2 : 1,
      }}
      styles={{ body: { padding: '16px' } }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <ItemNumberBadge number={item.itemNumber} isParent={!isChild} size="large" />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Text style={{ fontSize: '16px', color: theme.textPrimary }}>
              {item.title}
            </Text>
            <ItemTypeTag type={item.itemType} />
            {item.isAdHoc && <Tag color={theme.warningColor}>AD-HOC</Tag>}
          </div>

          {item.description && (
            <Paragraph
              style={{ marginBottom: '12px', color: theme.textSecondary }}
              ellipsis={{ rows: 3, expandable: true }}
            >
              {item.description}
            </Paragraph>
          )}

          <Space size="middle" wrap>
            {item.estimatedDuration && (
              <span>
                <ClockCircleOutlined style={{ marginRight: '4px', color: theme.textSecondary }} />
                <TimeDisplay durationMinutes={item.estimatedDuration} format="duration" />
              </span>
            )}
            {item.presenterName && (
              <span>
                <UserOutlined style={{ marginRight: '4px', color: theme.textSecondary }} />
                <Text type="secondary">{item.presenterName}</Text>
              </span>
            )}
            {item.attachedDocumentIds && item.attachedDocumentIds.length > 0 && (
              <span>
                <FileTextOutlined style={{ marginRight: '4px', color: theme.textSecondary }} />
                <Text type="secondary">{item.attachedDocumentIds.length} documents</Text>
              </span>
            )}
          </Space>

          {actions && <div style={{ marginTop: '12px' }}>{actions}</div>}
        </div>
      </div>
    </Card>
  );

  // Choose rendering based on mode
  if (mode === 'detail') {
    return renderDetailMode();
  }

  return renderListMode();
};
