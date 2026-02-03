/**
 * DocumentListItem Component
 * Row/list view for displaying document information in a table layout
 * Features: Checkbox, file icon, name, category, size, date, uploader, actions
 */

import React from 'react';
import { Tag, Button, Tooltip, Typography, Dropdown, Checkbox } from 'antd';
import type { MenuProps } from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useBoardContext } from '../../../contexts';
import type { Document, DocumentCategory } from '../../../types/document.types';

const { Text } = Typography;

// File type icon mapping
const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: '#f40f02' }} />,
  docx: <FileWordOutlined style={{ color: '#2b579a' }} />,
  doc: <FileWordOutlined style={{ color: '#2b579a' }} />,
  xlsx: <FileExcelOutlined style={{ color: '#217346' }} />,
  xls: <FileExcelOutlined style={{ color: '#217346' }} />,
  pptx: <FilePptOutlined style={{ color: '#d24726' }} />,
  ppt: <FilePptOutlined style={{ color: '#d24726' }} />,
  jpg: <FileImageOutlined style={{ color: '#1890ff' }} />,
  jpeg: <FileImageOutlined style={{ color: '#1890ff' }} />,
  png: <FileImageOutlined style={{ color: '#1890ff' }} />,
  gif: <FileImageOutlined style={{ color: '#1890ff' }} />,
  zip: <FileZipOutlined style={{ color: '#faad14' }} />,
  rar: <FileZipOutlined style={{ color: '#faad14' }} />,
  txt: <FileTextOutlined style={{ color: '#666' }} />,
  csv: <FileTextOutlined style={{ color: '#217346' }} />,
};

// Category color mapping
const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  agenda: '#1890ff',
  minutes: '#52c41a',
  board_pack: '#722ed1',
  presentation: '#eb2f96',
  report: '#fa8c16',
  policy: '#13c2c2',
  contract: '#f5222d',
  correspondence: '#2f54eb',
  attachment: '#8c8c8c',
  notice: '#fadb14',
  resolution: '#a0d911',
  certificate: '#gold',
  financial: '#13c2c2',
  audit: '#eb2f96',
  compliance: '#fa541c',
  other: '#d9d9d9',
};

// Category labels
const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  agenda: 'Agenda',
  minutes: 'Minutes',
  board_pack: 'Board Pack',
  presentation: 'Presentation',
  report: 'Report',
  policy: 'Policy',
  contract: 'Contract',
  correspondence: 'Correspondence',
  attachment: 'Attachment',
  notice: 'Notice',
  resolution: 'Resolution',
  certificate: 'Certificate',
  financial: 'Financial',
  audit: 'Audit',
  compliance: 'Compliance',
  other: 'Other',
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

interface DocumentListItemProps {
  document: Document;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  showActions?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (document: Document, selected: boolean) => void;
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  onView,
  onDownload,
  onEdit,
  onDelete,
  showActions = true,
  selectable = false,
  selected = false,
  onSelect,
}) => {
  const { theme } = useBoardContext();

  const fileIcon = FILE_TYPE_ICONS[document.fileType] || <FileOutlined style={{ color: '#8c8c8c' }} />;
  const categoryColor = CATEGORY_COLORS[document.categoryId as DocumentCategory] || theme.primaryColor;
  const categoryLabel = CATEGORY_LABELS[document.categoryId as DocumentCategory] || document.categoryId;

  // More menu items
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View',
      onClick: () => onView?.(document),
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download',
      onClick: () => onDownload?.(document),
    },
    {
      type: 'divider',
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Details',
      onClick: () => onEdit?.(document),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => onDelete?.(document),
    },
  ];

  const handleRowClick = () => {
    if (selectable && onSelect) {
      onSelect(document, !selected);
    } else if (onView) {
      onView(document);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: selected ? `${theme.primaryColor}08` : theme.backgroundPrimary,
        borderBottom: `1px solid ${theme.borderColor}`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = theme.backgroundPrimary;
        }
      }}
    >
      {/* Checkbox (if selectable) */}
      {selectable && (
        <div style={{ marginRight: 12 }} onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect?.(document, e.target.checked)}
          />
        </div>
      )}

      {/* File Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.backgroundTertiary,
          borderRadius: 6,
          marginRight: 12,
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {fileIcon}
      </div>

      {/* Document Name & Info */}
      <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text
            strong
            ellipsis
            style={{ color: theme.textPrimary, fontSize: 14 }}
          >
            {document.name}
          </Text>
          {document.isConfidential && (
            <Tag icon={<LockOutlined />} color="red" style={{ fontSize: 11, marginLeft: 4 }}>
              Confidential
            </Tag>
          )}
          {document.watermarkEnabled && (
            <Tag icon={<SafetyCertificateOutlined />} color="orange" style={{ fontSize: 11, marginLeft: 4 }}>
              Watermarked
            </Tag>
          )}
          {document.isSigned && (
            <Tooltip title="Digitally Signed">
              <SafetyCertificateOutlined style={{ color: theme.successColor, fontSize: 12 }} />
            </Tooltip>
          )}
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {document.uploadedByName}
        </Text>
      </div>

      {/* Board */}
      <div style={{ width: 120, flexShrink: 0, marginRight: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {document.boardName || '-'}
        </Text>
      </div>

      {/* Category */}
      <div style={{ width: 100, flexShrink: 0, marginRight: 16 }}>
        <Tag color={categoryColor} style={{ fontSize: 11 }}>
          {categoryLabel}
        </Tag>
      </div>

      {/* File Size */}
      <div style={{ width: 80, flexShrink: 0, marginRight: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatFileSize(document.fileSize)}
        </Text>
      </div>

      {/* Date */}
      <div style={{ width: 100, flexShrink: 0, marginRight: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(document.uploadedAt).format('MMM D, YYYY')}
        </Text>
      </div>

      {/* Actions */}
      {showActions && (
        <div
          style={{ display: 'flex', gap: 4, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(document)}
              style={{ color: theme.primaryColor }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => onDownload?.(document)}
              style={{ color: theme.primaryColor }}
            />
          </Tooltip>
          <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default DocumentListItem;
