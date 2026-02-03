/**
 * DocumentCard Component
 * Card/tile view for displaying document information in a grid layout
 * Features: File type icon, name, category tag, size, date, uploader, actions
 */

import React from 'react';
import { Card, Tag, Button, Tooltip, Typography, Dropdown } from 'antd';
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
import relativeTime from 'dayjs/plugin/relativeTime';
import { useBoardContext } from '../../../contexts';
import type { Document } from '../../../types/document.types';
import { getFileIconMedium } from '../utils/fileIcons';
import { formatFileSize } from '../../../constants/documents';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface DocumentCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  showActions?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (document: Document, selected: boolean) => void;
  categoryName?: string;
  categoryColor?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDownload,
  onEdit,
  onDelete,
  showActions = true,
  selectable = false,
  selected = false,
  onSelect,
  categoryName,
  categoryColor,
}) => {
  const { theme } = useBoardContext();

  const fileIcon = getFileIconMedium(document.fileType);
  const displayCategoryColor = categoryColor || theme.primaryColor;
  const displayCategoryName = categoryName || document.categoryId;

  // More menu items
  const moreMenuItems: MenuProps['items'] = [
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

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(document, !selected);
    } else if (onView) {
      onView(document);
    }
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={{
        borderRadius: 8,
        border: selected ? `2px solid ${theme.primaryColor}` : `1px solid ${theme.borderColor}`,
        backgroundColor: selected ? `${theme.primaryColor}08` : theme.backgroundPrimary,
        transition: 'all 0.2s',
      }}
      styles={{
        body: { padding: 16 },
      }}
    >
      {/* File Type Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 80,
          backgroundColor: theme.backgroundTertiary,
          borderRadius: 6,
          marginBottom: 12,
          position: 'relative',
        }}
      >
        <span style={{ fontSize: 40 }}>{fileIcon}</span>
        
        {/* Confidential/Signed badges */}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          {document.isConfidential && (
            <Tooltip title="Confidential">
              <LockOutlined style={{ color: theme.errorColor, fontSize: 14 }} />
            </Tooltip>
          )}
          {document.isSigned && (
            <Tooltip title="Digitally Signed">
              <SafetyCertificateOutlined style={{ color: theme.successColor, fontSize: 14 }} />
            </Tooltip>
          )}
        </div>

        {/* File extension badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {document.fileExtension}
        </div>
      </div>

      {/* Document Name */}
      <Paragraph
        ellipsis={{ rows: 2, tooltip: document.name }}
        style={{
          marginBottom: 4,
          fontWeight: 500,
          color: theme.textPrimary,
          fontSize: 14,
          lineHeight: 1.4,
        }}
      >
        {document.name}
      </Paragraph>

      {/* Board Name */}
      {document.boardName && (
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            display: 'block',
            marginBottom: 8,
          }}
        >
          {document.boardName}
        </Text>
      )}

      {/* Category Tag */}
      <Tag
        color={displayCategoryColor}
        style={{ marginBottom: 8, fontSize: 11 }}
      >
        {displayCategoryName}
      </Tag>

      {/* Status Badges */}
      <div style={{ marginBottom: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {document.isConfidential && (
          <Tag icon={<LockOutlined />} color="red" style={{ fontSize: 11 }}>
            Confidential
          </Tag>
        )}
        {document.watermarkEnabled && (
          <Tag icon={<SafetyCertificateOutlined />} color="orange" style={{ fontSize: 11 }}>
            Watermarked
          </Tag>
        )}
      </div>

      {/* File Info */}
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          {formatFileSize(document.fileSize)}
          {document.pageCount && ` • ${document.pageCount} pages`}
        </Text>
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          {dayjs(document.uploadedAt).format('MMM D, YYYY')}
        </Text>
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          {document.uploadedByName}
        </Text>
      </div>

      {/* Actions */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            gap: 4,
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${theme.borderColor}`,
          }}
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
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </div>
      )}
    </Card>
  );
};

export default DocumentCard;
