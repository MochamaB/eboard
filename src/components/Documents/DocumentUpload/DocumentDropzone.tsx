/**
 * DocumentDropzone Component
 * Drag and drop file upload area with file preview
 */

import React, { useCallback } from 'react';
import { Upload, Typography, Progress } from 'antd';
import {
  InboxOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { useBoardContext } from '../../../contexts';

const { Text } = Typography;
const { Dragger } = Upload;

// File type icon mapping
const getFileIcon = (fileName: string): React.ReactNode => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const iconStyle = { fontSize: 24 };
  
  switch (ext) {
    case 'pdf':
      return <FilePdfOutlined style={{ ...iconStyle, color: '#f40f02' }} />;
    case 'doc':
    case 'docx':
      return <FileWordOutlined style={{ ...iconStyle, color: '#2b579a' }} />;
    case 'xls':
    case 'xlsx':
      return <FileExcelOutlined style={{ ...iconStyle, color: '#217346' }} />;
    case 'ppt':
    case 'pptx':
      return <FilePptOutlined style={{ ...iconStyle, color: '#d24726' }} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FileImageOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    default:
      return <FileOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

interface DocumentDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  loading?: boolean;
  progress?: number;
  disabled?: boolean;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  onFileSelect,
  selectedFile,
  onRemoveFile,
  accept = '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.jpg,.jpeg,.png,.gif,.txt,.csv',
  maxSize = 50 * 1024 * 1024, // 50MB default
  loading = false,
  progress = 0,
  disabled = false,
}) => {
  const { theme } = useBoardContext();

  const handleBeforeUpload: UploadProps['beforeUpload'] = useCallback(
    (file: File) => {
      // Check file size
      if (file.size > maxSize) {
        return false;
      }
      onFileSelect(file);
      return false; // Prevent auto upload
    },
    [maxSize, onFileSelect]
  );

  // If file is selected, show preview
  if (selectedFile) {
    return (
      <div
        style={{
          padding: 16,
          border: `1px solid ${theme.borderColor}`,
          borderRadius: 8,
          backgroundColor: theme.backgroundTertiary,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* File Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.backgroundPrimary,
              borderRadius: 6,
            }}
          >
            {getFileIcon(selectedFile.name)}
          </div>

          {/* File Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              ellipsis
              style={{ display: 'block', color: theme.textPrimary }}
            >
              {selectedFile.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatFileSize(selectedFile.size)}
            </Text>
          </div>

          {/* Status/Actions */}
          {loading ? (
            <div style={{ width: 100 }}>
              <Progress percent={progress} size="small" status="active" />
            </div>
          ) : (
            <>
              <CheckCircleOutlined
                style={{ color: theme.successColor, fontSize: 18 }}
              />
              {onRemoveFile && (
                <DeleteOutlined
                  style={{
                    color: theme.errorColor,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                  onClick={onRemoveFile}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Dropzone
  return (
    <Dragger
      accept={accept}
      beforeUpload={handleBeforeUpload}
      showUploadList={false}
      disabled={disabled || loading}
      style={{
        padding: 24,
        backgroundColor: theme.backgroundTertiary,
        borderColor: theme.borderColor,
        borderRadius: 8,
        transition: 'all 0.2s',
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined
          style={{
            fontSize: 48,
            color: theme.textDisabled,
          }}
        />
      </p>
      <p
        className="ant-upload-text"
        style={{ color: theme.textPrimary, marginBottom: 8 }}
      >
        Drag & drop files here or click to browse
      </p>
      <p className="ant-upload-hint" style={{ color: theme.textSecondary }}>
        Supported: PDF, Word, Excel, PowerPoint, Images
        <br />
        Max size: {formatFileSize(maxSize)}
      </p>
    </Dragger>
  );
};

export default DocumentDropzone;
