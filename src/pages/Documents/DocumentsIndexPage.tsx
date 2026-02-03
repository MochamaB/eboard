/**
 * Documents Index Page
 * Main documents page with board context, filtering, and document management
 * Based on MeetingsIndexPage pattern for consistency
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Button, Space, Tag, Tooltip, message, Modal, Select, Input, Flex, Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  EditOutlined,
  TableOutlined,
  AppstoreOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useBoardContext } from '../../contexts';
import { useDocuments, useDeleteDocument } from '../../hooks/api/useDocuments';
import { useActiveDocumentCategories } from '../../hooks/api/useDocumentCategories';
import { DataTable, IndexPageLayout, CardView, type TabItem } from '../../components/common';
import { DocumentUploadModal, DocumentViewerModal } from '../../components/Documents';
import { DocumentCard } from '../../components/Documents/DocumentList/DocumentCard';
import { getFileIconMedium } from '../../components/Documents/utils/fileIcons';
import { formatFileSize, DOCUMENT_STATUSES, getStatusConfig } from '../../constants/documents';
import type { Document, DocumentStatus, DocumentFilter } from '../../types/document.types';

const { Text } = Typography;
const { Search } = Input;

export const DocumentsIndexPage: React.FC = () => {
  const location = useLocation();
  const { currentBoard, activeCommittee, viewMode: boardViewMode } = useBoardContext();

  // Check if we're in "View All" mode
  const isAllBoardsView = location.pathname.startsWith('/all/');

  // Filter state
  const [statusTab, setStatusTab] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);

  // Determine boardId filter - use current board/committee from context
  const boardIdFilter = useMemo(() => {
    if (isAllBoardsView || boardViewMode === 'all') {
      return undefined; // Show all documents across all boards
    }
    if (activeCommittee === 'all' || activeCommittee === 'board') {
      return currentBoard?.id;
    }
    return activeCommittee;
  }, [activeCommittee, currentBoard?.id, isAllBoardsView, boardViewMode]);

  // Fetch dynamic categories
  const { data: categories = [] } = useActiveDocumentCategories(
    boardIdFilter
  );

  // Reset filters when board changes
  useEffect(() => {
    setStatusTab('all');
    setCategoryFilter(undefined);
    setSearchValue('');
    setPage(1);
  }, [currentBoard?.id, isAllBoardsView]);

  // Get category name and color for a document
  const getCategoryInfo = useCallback((categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return {
      name: cat?.name || categoryId,
      color: cat?.color || '#d9d9d9',
    };
  }, [categories]);

  // Map status tab to actual status filter
  const statusFilterParam = useMemo(() => {
    if (statusTab === 'all') return undefined;
    if (statusTab === 'active') return ['published', 'approved'] as DocumentStatus[];
    if (statusTab === 'draft') return ['draft', 'pending_review'] as DocumentStatus[];
    return statusTab as DocumentStatus;
  }, [statusTab]);

  // Build filter params
  const filterParams: DocumentFilter = useMemo(() => ({
    boardId: boardIdFilter,
    categories: categoryFilter ? [categoryFilter] : undefined,
    status: statusFilterParam,
    search: searchValue || undefined,
  }), [boardIdFilter, categoryFilter, statusFilterParam, searchValue]);

  // Fetch documents
  const { data: documents = [], isLoading, refetch } = useDocuments(filterParams);

  // Fetch all documents for tab counts
  const { data: allDocuments = [] } = useDocuments({ boardId: boardIdFilter });

  // Delete mutation
  const deleteMutation = useDeleteDocument({
    onSuccess: () => {
      message.success('Document deleted successfully');
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete document');
    },
  });

  // Calculate status tab counts
  const statusCounts = useMemo(() => {
    return {
      all: allDocuments.length,
      active: allDocuments.filter(d => ['published', 'approved'].includes(d.status)).length,
      draft: allDocuments.filter(d => ['draft', 'pending_review'].includes(d.status)).length,
      archived: allDocuments.filter(d => d.status === 'archived').length,
    };
  }, [allDocuments]);

  // Handlers
  const handleStatusTabChange = useCallback((key: string) => {
    setStatusTab(key);
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleViewDocument = useCallback((document: Document) => {
    setViewerDocument(document);
  }, []);

  const handleDownloadDocument = useCallback((document: Document) => {
    window.open(document.url, '_blank');
  }, []);

  const handleDeleteDocument = useCallback((document: Document) => {
    Modal.confirm({
      title: 'Delete Document',
      content: `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteMutation.mutate(document.id),
    });
  }, [deleteMutation]);

  const handleUploadSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Status tabs configuration - realistic tabs for board document management
  const statusTabs: TabItem[] = useMemo(() => [
    { 
      key: 'all', 
      label: 'All', 
      icon: <FileOutlined />, 
      count: statusCounts.all 
    },
    { 
      key: 'active', 
      label: 'Active', 
      icon: <CheckCircleOutlined />, 
      count: statusCounts.active 
    },
    { 
      key: 'draft', 
      label: 'Drafts', 
      icon: <EditOutlined />, 
      count: statusCounts.draft 
    },
    { 
      key: 'archived', 
      label: 'Archived', 
      icon: <InboxOutlined />, 
      count: statusCounts.archived 
    },
  ], [statusCounts]);

  // Table columns
  const columns: ColumnsType<Document> = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (name: string, record: Document) => (
        <Space>
          {getFileIconMedium(record.fileType)}
          <div>
            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {name}
              {record.isConfidential && (
                <Tag icon={<LockOutlined />} color="red" style={{ fontSize: 11, marginLeft: 4 }}>
                  Confidential
                </Tag>
              )}
              {record.watermarkEnabled && (
                <Tag icon={<SafetyCertificateOutlined />} color="orange" style={{ fontSize: 11, marginLeft: 4 }}>
                  Watermarked
                </Tag>
              )}
              {record.isSigned && (
                <Tooltip title="Digitally Signed">
                  <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: 12, marginLeft: 4 }} />
                </Tooltip>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.uploadedByName}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Board',
      dataIndex: 'boardName',
      key: 'boardName',
      width: '15%',
      render: (boardName: string | null) => (
        <Text type="secondary">{boardName || '-'}</Text>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '12%',
      render: (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? (
          <Tag color={cat.color}>{cat.name}</Tag>
        ) : (
          <Tag>{categoryId}</Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: DocumentStatus) => {
        const statusConfig = getStatusConfig(status);
        return (
          <Tag color={statusConfig.color}>
            {statusConfig.label}
          </Tag>
        );
      },
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: '10%',
      render: (size: number) => (
        <Text type="secondary">{formatFileSize(size)}</Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: '12%',
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).format('MMM D, YYYY')}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_: any, record: Document) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewDocument(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadDocument(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDocument(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [categories, handleViewDocument, handleDownloadDocument, handleDeleteDocument]);

  // Filters section
  const filtersSection = (
    <Flex gap={16} style={{ marginBottom: 16 }} align="center" justify="space-between">
      <Flex gap={16}>
        <Search
          placeholder="Search documents..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Filter by category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 200 }}
          allowClear
          loading={!categories.length}
        >
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              <Space size={4}>
                <Tag color={cat.color}>{cat.name}</Tag>
              </Space>
            </Select.Option>
          ))}
        </Select>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Flex>
      <Segmented
        value={viewMode}
        onChange={(value) => setViewMode(value as 'table' | 'cards')}
        options={[
          { label: 'Table', value: 'table', icon: <TableOutlined /> },
          { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
        ]}
      />
    </Flex>
  );

  return (
    <IndexPageLayout
      title="Documents"
      subtitle="Manage board documents, policies, reports, and meeting materials"
      tabs={statusTabs}
      activeTab={statusTab}
      onTabChange={handleStatusTabChange}
      primaryActionLabel="Upload Document"
      primaryActionIcon={<PlusOutlined />}
      onPrimaryAction={() => setUploadModalOpen(true)}
    >
      {/* Filters */}
      {filtersSection}

      {/* Document Table or Card View */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          dataSource={documents}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: documents.length,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} documents`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize || 20);
            },
          }}
          onRowClick={handleViewDocument}
          showSearch={false}
          emptyText={
            searchValue
              ? 'No documents match your search'
              : categoryFilter
              ? 'No documents found for this category'
              : 'No documents uploaded yet'
          }
        />
      ) : (
        <CardView
          data={documents}
          loading={isLoading}
          renderCard={(doc) => {
            const catInfo = getCategoryInfo(doc.categoryId);
            return (
              <DocumentCard
                document={doc}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
                onDelete={handleDeleteDocument}
                categoryName={catInfo.name}
                categoryColor={catInfo.color}
                showActions
              />
            );
          }}
          columns={{
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            xl: 6,
            xxl: 4,
          }}
          emptyText={
            searchValue
              ? 'No documents match your search'
              : categoryFilter
              ? 'No documents found for this category'
              : 'No documents uploaded yet'
          }
        />
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        boardId={boardIdFilter}
      />

      {/* Viewer Modal */}
      <DocumentViewerModal
        open={!!viewerDocument}
        onClose={() => setViewerDocument(null)}
        document={viewerDocument}
        onDownload={handleDownloadDocument}
      />
    </IndexPageLayout>
  );
};

export default DocumentsIndexPage;
