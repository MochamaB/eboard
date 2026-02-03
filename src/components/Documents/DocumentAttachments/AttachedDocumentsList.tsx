/**
 * AttachedDocumentsList Component
 * Compact list of attached documents for agenda items and other entities
 */

import React from 'react';
import { Button, Tooltip, Typography, Empty, Tag } from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
  SafetyCertificateOutlined,
  PaperClipOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { Document, DocumentSummary } from '../../../types/document.types';

const { Text } = Typography;

// File type icon mapping
const getFileIcon = (fileType: string): React.ReactNode => {
  const iconStyle = { fontSize: 20 };
  switch (fileType) {
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

interface AttachedDocumentsListProps {
  documents: (Document | DocumentSummary)[];
  onView?: (document: Document | DocumentSummary) => void;
  onDownload?: (document: Document | DocumentSummary) => void;
  onRemove?: (document: Document | DocumentSummary) => void;
  onAttach?: () => void;
  onUpload?: () => void;
  showAttachButton?: boolean;
  showUploadButton?: boolean;
  showRemoveButton?: boolean;
  title?: string;
  emptyText?: string;
  compact?: boolean;
  hideEmptyState?: boolean;
  showEntityLabels?: boolean; // Show entity attachment labels (Meeting, Item 2, etc.)
}

export const AttachedDocumentsList: React.FC<AttachedDocumentsListProps> = ({
  documents,
  onView,
  onDownload,
  onRemove,
  onAttach,
  onUpload,
  showAttachButton = true,
  showUploadButton = true,
  showRemoveButton = true,
  title = 'Attached Documents',
  emptyText = 'No documents attached',
  compact = false,
  hideEmptyState = false,
  showEntityLabels = false,
}) => {
  const { theme } = useBoardContext();

  return (
    <div
      style={{
        
        borderRadius: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: compact ? '8px 12px' : '10px 16px',
          backgroundColor: theme.backgroundSecondary,
          borderBottom: `1px solid ${theme.borderColor}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PaperClipOutlined style={{ color: theme.textSecondary }} />
          <Text strong style={{ fontSize: compact ? 12 : 14 }}>
            {title} ({documents.length})
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {showUploadButton && onUpload && (
            <Button 
            type="link" 
            size="middle" 
            icon={<UploadOutlined />} 
            onClick={onUpload} 
            style={{
            backgroundColor: theme.primaryColor,
            borderColor: theme.primaryColor,
            color: '#fff',
          }} > 
            Upload New 
            </Button>
          )}
          {showAttachButton && onAttach && (
            <Button
              type="default"
              size="middle"
              icon={<PlusOutlined />}
              onClick={onAttach}
              style={{
              borderColor: theme.primaryColor,
              color: theme.primaryColor,
            }}
            >
              Attach Existing
            </Button>
          )}
        </div>
      </div>

      {/* Document List */}
      {!hideEmptyState || documents.length > 0 ? (
        <div style={{ 
          backgroundColor: theme.backgroundPrimary,
          border: `1px solid ${theme.borderColor}`,
        }}>
          {documents.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyText}
              style={{ padding: compact ? '16px 0' : '24px 0' }}
            />
          ) : (
          documents.map((document, index) => {
            // Type assertion to access entityLabel if it exists
            const docWithEntity = document as any;
            const entityLabel = docWithEntity.entityLabel;
            const entityType = docWithEntity.entityType;
            
            return (
            <div
              key={document.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: compact ? '8px 12px' : '10px 16px',
                borderBottom:
                  index < documents.length - 1
                    ? `1px solid ${theme.borderColor}`
                    : 'none',
                gap: 12,
                cursor: onView ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                backgroundColor: 'transparent',
              }}
              onClick={() => onView && onView(document)}
              onMouseEnter={(e) => {
                if (onView) {
                  e.currentTarget.style.backgroundColor = theme.backgroundTertiary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* File Icon */}
              <div
                style={{
                  width: compact ? 32 : 40,
                  height: compact ? 32 : 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.backgroundTertiary,
                  borderRadius: 6,
                  flexShrink: 0,
                }}
              >
                {getFileIcon(document.fileType)}
              </div>

              {/* Document Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text
                    ellipsis
                    style={{
                      fontWeight: 500,
                      fontSize: compact ? 12 : 13,
                      color: theme.textPrimary,
                    }}
                  >
                    {document.name}
                  </Text>
                  {showEntityLabels && entityLabel && (
                    <Tag 
                      color={entityType === 'meeting' ? 'blue' : 'green'} 
                      style={{ fontSize: 10, padding: '0 6px', marginLeft: 4 }}
                    >
                      {entityLabel}
                    </Tag>
                  )}
                  {document.isConfidential && (
                    <Tag icon={<LockOutlined />} color="red" style={{ fontSize: 10, padding: '0 4px' }}>
                      Confidential
                    </Tag>
                  )}
                  {document.watermarkEnabled && (
                    <Tag icon={<SafetyCertificateOutlined />} color="orange" style={{ fontSize: 10, padding: '0 4px' }}>
                      Watermarked
                    </Tag>
                  )}
                  {document.isSigned && (
                    <Tooltip title="Digitally Signed">
                      <SafetyCertificateOutlined
                        style={{ color: theme.successColor, fontSize: 12 }}
                      />
                    </Tooltip>
                  )}
                </div>
                <Text
                  type="secondary"
                  style={{ fontSize: compact ? 11 : 12 }}
                >
                  {formatFileSize(document.fileSize)} •{' '}
                  {document.fileExtension.toUpperCase()}
                </Text>
              </div>

              {/* Actions */}
              <div
                style={{ display: 'flex', gap: 4, flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {onView && (
                  <Tooltip title="View">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => onView(document)}
                      style={{ color: theme.primaryColor }}
                    />
                  </Tooltip>
                )}
                {onDownload && (
                  <Tooltip title="Download">
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => onDownload(document)}
                      style={{ color: theme.primaryColor }}
                    />
                  </Tooltip>
                )}
                {showRemoveButton && onRemove && (
                  <Tooltip title="Remove">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onRemove(document)}
                      style={{ color: theme.errorColor }}
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          );
          })
        )}
        </div>
      ) : null}
    </div>
  );
};

export default AttachedDocumentsList;
