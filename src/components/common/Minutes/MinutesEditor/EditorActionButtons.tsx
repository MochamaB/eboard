/**
 * EditorActionButtons Component
 * Action buttons for saving and submitting minutes
 */

import React from 'react';
import { Space, Button } from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

interface EditorActionButtonsProps {
  onSave: () => void;
  onSubmit?: () => void;
  onDiscard?: () => void;
  isSaving: boolean;
  canSubmit: boolean;
  primaryColor?: string;
}

export const EditorActionButtons: React.FC<EditorActionButtonsProps> = ({
  onSave,
  onSubmit,
  onDiscard,
  isSaving,
  canSubmit,
  primaryColor = '#324721',
}) => {
  return (
    <div
      style={{
        padding: '16px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Left: Discard */}
      <div>
        {onDiscard && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onDiscard}
            disabled={isSaving}
          >
            Discard Changes
          </Button>
        )}
      </div>

      {/* Right: Save and Submit */}
      <Space>
        <Button
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={isSaving}
          disabled={isSaving}
        >
          Save Draft
        </Button>

        {onSubmit && (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSubmit}
            disabled={!canSubmit || isSaving}
            style={{
              backgroundColor: canSubmit ? primaryColor : undefined,
              borderColor: canSubmit ? primaryColor : undefined,
            }}
          >
            Submit for Review
          </Button>
        )}
      </Space>
    </div>
  );
};

export default EditorActionButtons;
