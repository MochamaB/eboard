/**
 * DocumentPickerModal Component
 * Modal for selecting existing documents to attach to an entity
 */

import React, { useState, useMemo } from 'react';
import { Modal, Input, Select, Button, Checkbox, Empty, Spin, Typography } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { useDocuments } from '../../../hooks/api/useDocuments';
import type { Document, DocumentCategory } from '../../../types/document.types';

const { Text } = Typography;
const { Option } = Select;

// File type icon mapping
const getFileIcon = (fileType: string): React.ReactNode => {
  const iconStyle = { fontSize: 24 };
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

// Category options
const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'board_pack', label: 'Board Pack' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'agenda', label: 'Agenda' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'report', label: 'Report' },
  { value: 'financial', label: 'Financial' },
  { value: 'audit', label: 'Audit' },
  { value: 'policy', label: 'Policy' },
  { value: 'attachment', label: 'Attachment' },
  { value: 'other', label: 'Other' },
];

interface DocumentPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (documents: Document[]) => void;
  onUploadNew?: () => void;
  boardId?: string;
  excludeIds?: string[];
  multiple?: boolean;
  title?: string;
}

export const DocumentPickerModal: React.FC<DocumentPickerModalProps> = ({
  open,
  onClose,
  onSelect,
  onUploadNew,
  boardId,
  excludeIds = [],
  multiple = true,
  title = 'Attach Documents',
}) => {
  const { theme, currentBoard } = useBoardContext();
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | undefined>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch documents
  const { data: documents = [], isLoading } = useDocuments({
    boardId: boardId || currentBoard.id,
    category: categoryFilter,
    status: 'published',
  });

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter((doc) => !excludeIds.includes(doc.id));

    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(search) ||
          doc.fileName.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [documents, excludeIds, searchValue]);

  const handleToggleSelect = (document: Document) => {
    if (multiple) {
      setSelectedIds((prev) =>
        prev.includes(document.id)
          ? prev.filter((id) => id !== document.id)
          : [...prev, document.id]
      );
    } else {
      setSelectedIds([document.id]);
    }
  };

  const handleConfirm = () => {
    const selectedDocs = documents.filter((doc) => selectedIds.includes(doc.id));
    onSelect(selectedDocs);
    handleClose();
  };

  const handleClose = () => {
    setSearchValue('');
    setCategoryFilter(undefined);
    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      width={600}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text type="secondary">
            {selectedIds.length > 0
              ? `${selectedIds.length} document${selectedIds.length > 1 ? 's' : ''} selected`
              : 'Select documents to attach'}
          </Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleClose}>Cancel</Button>
            {onUploadNew && (
              <Button icon={<PlusOutlined />} onClick={onUploadNew}>
                Upload New
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              style={{
                backgroundColor: theme.primaryColor,
                borderColor: theme.primaryColor,
              }}
            >
              Attach
            </Button>
          </div>
        </div>
      }
    >
      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Input
          placeholder="Search documents..."
          prefix={<SearchOutlined style={{ color: theme.textDisabled }} />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          allowClear
          style={{ width: 140 }}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* Document List */}
      <div
        style={{
          maxHeight: 400,
          overflowY: 'auto',
          border: `1px solid ${theme.borderColor}`,
          borderRadius: 8,
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <Spin />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Empty
            description="No documents found"
            style={{ padding: '40px 0' }}
          />
        ) : (
          filteredDocuments.map((document, index) => (
            <div
              key={document.id}
              onClick={() => handleToggleSelect(document)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom:
                  index < filteredDocuments.length - 1
                    ? `1px solid ${theme.borderColor}`
                    : 'none',
                cursor: 'pointer',
                backgroundColor: selectedIds.includes(document.id)
                  ? `${theme.primaryColor}08`
                  : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!selectedIds.includes(document.id)) {
                  e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedIds.includes(document.id)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Checkbox */}
              <Checkbox
                checked={selectedIds.includes(document.id)}
                style={{ marginRight: 12 }}
              />

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
                  flexShrink: 0,
                }}
              >
                {getFileIcon(document.fileType)}
              </div>

              {/* Document Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  ellipsis
                  strong
                  style={{ display: 'block', color: theme.textPrimary }}
                >
                  {document.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {document.uploadedByName} • {new Date(document.uploadedAt).toLocaleDateString()}
                </Text>
              </div>

              {/* File Size & Type */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  {formatFileSize(document.fileSize)}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {document.fileExtension.toUpperCase()}
                </Text>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default DocumentPickerModal;
