/**
 * Agenda Header Component
 * Shared header for both AccordionView and MasterPanel
 * Shows status, item count, and action buttons based on agenda status
 */

import React from 'react';
import { Button, Space, Typography } from 'antd';
import {
  EditOutlined,
  DownloadOutlined,
  SendOutlined,
  PlusOutlined,
  MenuOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { AgendaStatusBadge } from './AgendaStatusBadge';
import type { AgendaStatus } from '../../../types/agenda.types';
import { formatDuration, checkDurationExceeded } from '../../../utils/agendaTimeManagement';

const { Title, Text } = Typography;

export interface AgendaHeaderProps {
  /** Agenda status */
  status: AgendaStatus | 'none';
  /** Number of agenda items */
  itemCount: number;
  /** Total duration of all agenda items in minutes */
  totalDuration?: number;
  /** Meeting scheduled duration in minutes */
  meetingDuration?: number;
  /** Published date (ISO string) */
  publishedAt?: string | null;
  /** Published by user name */
  publishedBy?: string | null;
  /** Edit handler (draft status) */
  onEdit?: () => void;
  /** Publish handler (draft status) */
  onPublish?: () => void;
  /** Unpublish handler (published status) */
  onUnpublish?: () => void;
  /** Export PDF handler - receives board branding for styling */
  onExport?: (branding: { boardName: string; primaryColor: string; logo?: string }) => void;
  /** Add item handler (edit mode) */
  onAddItem?: () => void;
  /** Toggle reorder mode handler (edit mode) */
  onToggleReorder?: () => void;
  /** Is reorder mode active */
  reorderMode?: boolean;
  /** Current view mode */
  mode?: 'edit' | 'view' | 'execute';
  /** Show edit mode actions (Add Item, Reorder) */
  showEditActions?: boolean;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  status,
  itemCount,
  totalDuration,
  meetingDuration,
  publishedAt,
  publishedBy,
  onEdit,
  onPublish,
  onUnpublish,
  onExport,
  onAddItem,
  onToggleReorder,
  reorderMode = false,
  mode = 'view',
  showEditActions = false,
}) => {
  const { theme, currentBoard, logo } = useBoardContext();

  // Check if duration exceeds meeting time
  const durationCheck = totalDuration && meetingDuration 
    ? checkDurationExceeded(totalDuration, meetingDuration)
    : null;

  // Handle export with branding info
  const handleExport = () => {
    if (onExport) {
      onExport({
        boardName: currentBoard.name,
        primaryColor: theme.primaryColor,
        logo: logo,
      });
    }
  };

  return (
    <div
      style={{
        padding: '16px 24px',
        backgroundColor: theme.backgroundSecondary,
        borderBottom: `1px solid ${theme.borderColor}`,
      }}
    >
      {/* Main Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left: Title, Status Badge, Item Count, Duration */}
        <div>
          <Space size="middle" align="center">
            <Title level={5} style={{ margin: 0, color: theme.textPrimary }}>
              Meeting Agenda
            </Title>
            {status !== 'none' && <AgendaStatusBadge status={status as AgendaStatus} />}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
            
            {/* Duration Display */}
            {totalDuration !== undefined && totalDuration > 0 && (
              <>
                <Text type="secondary" style={{ fontSize: '12px' }}>•</Text>
                <Space size={4} style={{ fontSize: '12px' }}>
                  <ClockCircleOutlined style={{ color: durationCheck?.exceeded ? theme.errorColor : theme.textSecondary }} />
                  <Text 
                    style={{ 
                      color: durationCheck?.exceeded ? theme.errorColor : theme.textSecondary,
                      fontWeight: durationCheck?.exceeded ? 500 : 400,
                    }}
                  >
                    {formatDuration(totalDuration)}
                    {meetingDuration && ` / ${formatDuration(meetingDuration)}`}
                  </Text>
                  {durationCheck?.exceeded && (
                    <WarningOutlined style={{ color: theme.errorColor, fontSize: '14px' }} />
                  )}
                </Space>
              </>
            )}
          </Space>
        </div>

        {/* Right: Action Buttons */}
        <Space size="middle">
          {/* Export PDF - always visible when agenda exists */}
          {status !== 'none' && onExport && (
            <Button
              size="middle"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              style={{
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              }}
            >
              Export PDF
            </Button>
          )}

          {/* Draft status actions */}
          {status === 'draft' && (
            <>
              {onPublish && (
                <Button
                  type="primary"
                  size="middle"
                  icon={<SendOutlined />}
                  onClick={onPublish}
                  style={{
                    backgroundColor: theme.successColor,
                    borderColor: theme.successColor,
                  }}
                >
                  Publish Agenda
                </Button>
              )}
              {onEdit && (
                <Button
                  size="middle"
                  icon={<EditOutlined />}
                  onClick={onEdit}
                  style={{
                    borderColor: theme.primaryColor,
                    color: theme.primaryColor,
                  }}
                >
                  Edit Agenda
                </Button>
              )}
            </>
          )}

          {/* Published status actions */}
          {status === 'published' && onUnpublish && (
            <Button
              size="middle"
              icon={<EditOutlined />}
              onClick={onUnpublish}
              style={{
                borderColor: theme.warningColor,
                color: theme.warningColor,
              }}
            >
              Unpublish & Edit
            </Button>
          )}

          {/* Edit mode actions (Add Item, Reorder) */}
          {showEditActions && mode === 'edit' && (
            <>
              {onToggleReorder && (
                <Button
                  size="middle"
                  icon={<MenuOutlined />}
                  type={reorderMode ? 'primary' : 'default'}
                  onClick={onToggleReorder}
                  style={{
                    backgroundColor: reorderMode ? theme.primaryColor : undefined,
                    borderColor: reorderMode ? theme.primaryColor : theme.borderColor,
                  }}
                >
                  {reorderMode ? 'Done' : 'Reorder'}
                </Button>
              )}
              {onAddItem && (
                <Button
                  type="primary"
                  size="middle"
                  icon={<PlusOutlined />}
                  onClick={onAddItem}
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderColor: theme.primaryColor,
                  }}
                >
                  Add Item
                </Button>
              )}
            </>
          )}
        </Space>
      </div>

      {/* Published info line */}
      {status === 'published' && publishedAt && (
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
          Published on {new Date(publishedAt).toLocaleDateString()} by {publishedBy || 'System'}
        </Text>
      )}
    </div>
  );
};
