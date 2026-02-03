/**
 * DocumentList Component
 * Main list component with grid/table view toggle
 * Combines DocumentCard (grid) and DocumentListItem (list) views
 */

import React from 'react';
import { Empty, Spin, Row, Col } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { Document } from '../../../types/document.types';
import { DocumentCard } from './DocumentCard';
import { DocumentListItem } from './DocumentListItem';
import type { ViewMode } from './DocumentListFilters';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  viewMode?: ViewMode;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  showActions?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyText?: string;
  gridColumns?: number;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  viewMode = 'grid',
  onView,
  onDownload,
  onEdit,
  onDelete,
  showActions = true,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyText = 'No documents found',
  gridColumns = 4,
}) => {
  const { theme } = useBoardContext();

  const handleSelect = (document: Document, selected: boolean) => {
    if (!onSelectionChange) return;

    if (selected) {
      onSelectionChange([...selectedIds, document.id]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== document.id));
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Empty
        image={<FileOutlined style={{ fontSize: 64, color: theme.textDisabled }} />}
        description={emptyText}
        style={{ padding: '60px 0' }}
      />
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    // Calculate responsive column spans
    const colSpan = 24 / gridColumns;

    return (
      <Row gutter={[16, 16]}>
        {documents.map((document) => (
          <Col
            key={document.id}
            xs={24}
            sm={12}
            md={8}
            lg={colSpan}
            xl={colSpan}
          >
            <DocumentCard
              document={document}
              onView={onView}
              onDownload={onDownload}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
              selectable={selectable}
              selected={selectedIds.includes(document.id)}
              onSelect={handleSelect}
            />
          </Col>
        ))}
      </Row>
    );
  }

  // List View
  return (
    <div
      style={{
        border: `1px solid ${theme.borderColor}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          backgroundColor: theme.backgroundSecondary,
          borderBottom: `1px solid ${theme.borderColor}`,
          fontWeight: 500,
          fontSize: 12,
          color: theme.textSecondary,
        }}
      >
        {selectable && <div style={{ width: 32 }} />}
        <div style={{ width: 52 }} />
        <div style={{ flex: 1, minWidth: 0 }}>Name</div>
        <div style={{ width: 120 }}>Board</div>
        <div style={{ width: 100 }}>Category</div>
        <div style={{ width: 80 }}>Size</div>
        <div style={{ width: 100 }}>Date</div>
        {showActions && <div style={{ width: 100 }}>Actions</div>}
      </div>

      {/* Document Rows */}
      {documents.map((document) => (
        <DocumentListItem
          key={document.id}
          document={document}
          onView={onView}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          selectable={selectable}
          selected={selectedIds.includes(document.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};

export default DocumentList;
