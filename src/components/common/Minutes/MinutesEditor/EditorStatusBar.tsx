/**
 * EditorStatusBar Component
 * Display editor status, word count, and save information
 */

import React from 'react';
import { Space, Typography, Tag, Switch, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface EditorStatusBarProps {
  wordCount: number;
  characterCount: number;
  lastSaved?: Date | null;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  onToggleAutoSave?: () => void;
  error?: Error | null;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  wordCount,
  characterCount,
  lastSaved,
  isSaving,
  autoSaveEnabled,
  onToggleAutoSave,
  error,
}) => {
  const formatLastSaved = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleString();
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#fafafa',
        borderTop: '1px solid #d9d9d9',
        borderRadius: '0 0 4px 4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      {/* Left: Status and Counts */}
      <Space size={16} wrap>
        {/* Save Status */}
        {error ? (
          <Tooltip title={error.message}>
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              Save Failed
            </Tag>
          </Tooltip>
        ) : isSaving ? (
          <Tag icon={<SyncOutlined spin />} color="processing">
            Saving...
          </Tag>
        ) : lastSaved ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Saved
          </Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="default">
            Not Saved
          </Tag>
        )}

        {/* Last Saved Time */}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Last saved: {formatLastSaved(lastSaved)}
        </Text>

        {/* Word Count */}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <strong>{wordCount.toLocaleString()}</strong> words
        </Text>

        {/* Character Count */}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <strong>{characterCount.toLocaleString()}</strong> characters
        </Text>
      </Space>

      {/* Right: Auto-save Toggle */}
      {onToggleAutoSave && (
        <Space size={8}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Auto-save
          </Text>
          <Switch
            size="small"
            checked={autoSaveEnabled}
            onChange={onToggleAutoSave}
          />
        </Space>
      )}
    </div>
  );
};

export default EditorStatusBar;
