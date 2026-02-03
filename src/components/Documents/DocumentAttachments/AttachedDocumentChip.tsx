/**
 * AttachedDocumentChip Component
 * Minimal inline chip for displaying an attached document
 */

import React from 'react';
import { Button, Tooltip, Typography } from 'antd';
import {
  EyeOutlined,
  CloseOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { Document } from '../../../types/document.types';

const { Text } = Typography;

// File type icon mapping
const getFileIcon = (fileType: string): React.ReactNode => {
  const iconStyle = { fontSize: 14 };
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

interface AttachedDocumentChipProps {
  document: Document;
  onView?: (document: Document) => void;
  onRemove?: (document: Document) => void;
  showRemove?: boolean;
  maxWidth?: number;
}

export const AttachedDocumentChip: React.FC<AttachedDocumentChipProps> = ({
  document,
  onView,
  onRemove,
  showRemove = true,
  maxWidth = 200,
}) => {
  const { theme } = useBoardContext();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        backgroundColor: theme.backgroundTertiary,
        border: `1px solid ${theme.borderColor}`,
        borderRadius: 4,
        maxWidth,
      }}
    >
      {/* File Icon */}
      {getFileIcon(document.fileType)}

      {/* Document Name */}
      <Tooltip title={document.name}>
        <Text
          ellipsis
          style={{
            fontSize: 12,
            color: theme.textPrimary,
            maxWidth: maxWidth - 70,
          }}
        >
          {document.name}
        </Text>
      </Tooltip>

      {/* View Button */}
      {onView && (
        <Tooltip title="View">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ fontSize: 12 }} />}
            onClick={(e) => {
              e.stopPropagation();
              onView(document);
            }}
            style={{ padding: '0 4px', height: 20, minWidth: 20 }}
          />
        </Tooltip>
      )}

      {/* Remove Button */}
      {showRemove && onRemove && (
        <Tooltip title="Remove">
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined style={{ fontSize: 10 }} />}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(document);
            }}
            style={{
              padding: '0 4px',
              height: 20,
              minWidth: 20,
              color: theme.textSecondary,
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default AttachedDocumentChip;
