/**
 * DocumentListFilters Component
 * Filter bar for document list with search, category, status, and view toggle
 */

import React from 'react';
import { Input, Select, Button, Segmented, Tooltip } from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { DocumentCategory, DocumentStatus } from '../../../types/document.types';

const { Option } = Select;

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
  { value: 'contract', label: 'Contract' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'notice', label: 'Notice' },
  { value: 'resolution', label: 'Resolution' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'attachment', label: 'Attachment' },
  { value: 'other', label: 'Other' },
];

// Status options
const STATUS_OPTIONS: { value: DocumentStatus; label: string }[] = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
];

export type ViewMode = 'grid' | 'list';

interface DocumentListFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryFilter?: DocumentCategory;
  onCategoryChange: (category?: DocumentCategory) => void;
  statusFilter?: DocumentStatus;
  onStatusChange: (status?: DocumentStatus) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh?: () => void;
  onUpload?: () => void;
  showUploadButton?: boolean;
  showViewToggle?: boolean;
  compact?: boolean;
}

export const DocumentListFilters: React.FC<DocumentListFiltersProps> = ({
  searchValue,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  onUpload,
  showUploadButton = true,
  showViewToggle = true,
  compact = false,
}) => {
  const { theme } = useBoardContext();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: compact ? '8px 0' : '12px 0',
        flexWrap: 'wrap',
      }}
    >
      {/* Search */}
      <Input
        placeholder="Search documents..."
        prefix={<SearchOutlined style={{ color: theme.textDisabled }} />}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
        style={{ width: compact ? 200 : 280 }}
      />

      {/* Category Filter */}
      <Select
        placeholder="Category"
        value={categoryFilter}
        onChange={onCategoryChange}
        allowClear
        style={{ width: 140 }}
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>

      {/* Status Filter */}
      <Select
        placeholder="Status"
        value={statusFilter}
        onChange={onStatusChange}
        allowClear
        style={{ width: 130 }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* View Toggle */}
      {showViewToggle && (
        <Segmented
          value={viewMode}
          onChange={(value) => onViewModeChange(value as ViewMode)}
          options={[
            {
              value: 'grid',
              icon: <AppstoreOutlined />,
            },
            {
              value: 'list',
              icon: <UnorderedListOutlined />,
            },
          ]}
        />
      )}

      {/* Refresh */}
      {onRefresh && (
        <Tooltip title="Refresh">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          />
        </Tooltip>
      )}

      {/* Upload Button */}
      {showUploadButton && onUpload && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onUpload}
          style={{
            backgroundColor: theme.primaryColor,
            borderColor: theme.primaryColor,
          }}
        >
          Upload Document
        </Button>
      )}
    </div>
  );
};

export default DocumentListFilters;
