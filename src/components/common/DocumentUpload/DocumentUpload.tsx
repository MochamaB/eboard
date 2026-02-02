/**
 * DocumentUpload Component
 * Reusable drag-and-drop file upload component with progress indicator
 */

import React from 'react';
import { Upload, Progress, Typography, Space } from 'antd';
import {
  UploadOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useBoardContext } from '../../../contexts';

const { Text } = Typography;

export interface DocumentUploadProps {
  /** Accepted file types (e.g., '.pdf,.docx,.txt') */
  accept?: string;
  /** Handler called when file is selected */
  onFileSelect: (file: File) => Promise<void>;
  /** Whether upload is in progress */
  loading?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Status message to display */
  statusMessage?: string;
  /** Error message if upload failed */
  errorMessage?: string;
  /** Whether upload was successful */
  success?: boolean;
  /** Compact mode for smaller display */
  compact?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Supported formats text */
  formatsText?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  accept = '.pdf,.docx,.txt',
  onFileSelect,
  loading = false,
  progress = 0,
  statusMessage,
  errorMessage,
  success = false,
  compact = false,
  placeholder = 'Drop file or click to upload',
  formatsText = 'PDF, Word, Text',
  disabled = false,
}) => {
  const { theme } = useBoardContext();

  const handleUpload: UploadProps['beforeUpload'] = async (file) => {
    await onFileSelect(file);
    return false; // Prevent default upload behavior
  };

  const getFileIcon = () => {
    if (success) {
      return <CheckCircleOutlined style={{ fontSize: compact ? 16 : 20, color: theme.successColor }} />;
    }
    if (errorMessage) {
      return <CloseCircleOutlined style={{ fontSize: compact ? 16 : 20, color: theme.errorColor }} />;
    }
    return <UploadOutlined style={{ fontSize: compact ? 16 : 20, color: theme.primaryColor }} />;
  };

  // Compact inline layout
  if (compact) {
    return (
      <Upload.Dragger
        accept={accept}
        beforeUpload={handleUpload}
        showUploadList={false}
        disabled={disabled || loading}
        style={{
          padding: '12px',
          backgroundColor: theme.backgroundTertiary,
          borderColor: errorMessage ? theme.errorColor : theme.borderColor,
          borderRadius: '8px',
          transition: 'all 0.2s',
        }}
      >
        {loading ? (
          <div style={{ padding: '4px 0' }}>
            <Progress
              percent={progress}
              size="small"
              status="active"
              strokeColor={theme.primaryColor}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {statusMessage || 'Processing...'}
            </Text>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {getFileIcon()}
            <div style={{ textAlign: 'left' }}>
              <Text style={{ color: theme.textPrimary, fontSize: '13px', display: 'block' }}>
                {errorMessage || placeholder}
              </Text>
              <Space size={4}>
                <FileWordOutlined style={{ color: '#2b579a', fontSize: '12px' }} />
                <FilePdfOutlined style={{ color: '#f40f02', fontSize: '12px' }} />
                <FileTextOutlined style={{ color: '#666', fontSize: '12px' }} />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {formatsText}
                </Text>
              </Space>
            </div>
          </div>
        )}
      </Upload.Dragger>
    );
  }

  // Full layout
  return (
    <Upload.Dragger
      accept={accept}
      beforeUpload={handleUpload}
      showUploadList={false}
      disabled={disabled || loading}
      style={{
        padding: '24px',
        backgroundColor: theme.backgroundTertiary,
        borderColor: errorMessage ? theme.errorColor : theme.borderColor,
        borderRadius: '8px',
        transition: 'all 0.2s',
      }}
    >
      {loading ? (
        <div style={{ padding: '16px 0' }}>
          <Progress
            percent={progress}
            status="active"
            strokeColor={theme.primaryColor}
            style={{ maxWidth: '300px', margin: '0 auto 12px' }}
          />
          <Text style={{ color: theme.textPrimary, display: 'block' }}>
            {statusMessage || 'Processing document...'}
          </Text>
        </div>
      ) : (
        <div style={{ padding: '8px 0' }}>
          <p style={{ marginBottom: '12px' }}>
            {getFileIcon()}
          </p>
          <Text
            style={{
              color: errorMessage ? theme.errorColor : theme.textPrimary,
              display: 'block',
              marginBottom: '8px',
            }}
          >
            {errorMessage || placeholder}
          </Text>
          <Space size="middle">
            <Space size={4}>
              <FileWordOutlined style={{ color: '#2b579a' }} />
              <Text type="secondary">Word</Text>
            </Space>
            <Space size={4}>
              <FilePdfOutlined style={{ color: '#f40f02' }} />
              <Text type="secondary">PDF</Text>
            </Space>
            <Space size={4}>
              <FileTextOutlined style={{ color: '#666' }} />
              <Text type="secondary">Text</Text>
            </Space>
          </Space>
        </div>
      )}
    </Upload.Dragger>
  );
};

export default DocumentUpload;
