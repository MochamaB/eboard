import React, { useState } from 'react';
import { Button, Space, Typography, Input, Select, Flex, Tag, Empty, List, Avatar } from 'antd';
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import { useBoardContext } from '../../../contexts';
import type { Board } from '../../../types/board.types';

const { Text } = Typography;

interface DocumentsTabProps {
  board: Board;
}

// Mock document type - will be replaced with actual API
interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'excel' | 'other';
  size: number;
  uploadedBy: string;
  uploadedDate: string;
  category: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ board }) => {
  const { theme } = useBoardContext();
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Mock data - will be replaced with API call
  const mockDocuments: Document[] = [];

  // Filter documents based on search and category
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = !searchValue ||
      doc.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get document icon based on type
  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />;
      case 'word':
        return <FileWordOutlined style={{ fontSize: 32, color: '#1890ff' }} />;
      case 'excel':
        return <FileExcelOutlined style={{ fontSize: 32, color: '#52c41a' }} />;
      default:
        return <FileOutlined style={{ fontSize: 32, color: theme.textSecondary }} />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Header with Upload Button */}
        <Flex justify="space-between" align="center">
          <div>
            <Text strong style={{ fontSize: 16 }}>Board Documents</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Shared documents and files for {board.name}
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => {
              // TODO: Open upload modal
            }}
          >
            Upload Document
          </Button>
        </Flex>

        {/* Filters */}
        <Flex gap={12} wrap="wrap">
          <Input
            placeholder="Search documents..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />

          <Select
            placeholder="Filter by Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 180 }}
            options={[
              { label: 'All Categories', value: 'all' },
              { label: 'Meeting Minutes', value: 'minutes' },
              { label: 'Reports', value: 'reports' },
              { label: 'Policies', value: 'policies' },
              { label: 'Resolutions', value: 'resolutions' },
              { label: 'Other', value: 'other' },
            ]}
          />
        </Flex>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div style={{
            padding: 48,
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px dashed #d9d9d9'
          }}>
            <FileTextOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 16 }}>
                No documents found
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Upload documents to share with board members
              </Text>
            </div>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              style={{ marginTop: 16 }}
              onClick={() => {
                // TODO: Open upload modal
              }}
            >
              Upload First Document
            </Button>
          </div>
        ) : (
          <List
            dataSource={filteredDocuments}
            renderItem={(doc) => (
              <List.Item
                key={doc.id}
                actions={[
                  <Button
                    key="view"
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      // TODO: Open document viewer
                    }}
                  >
                    View
                  </Button>,
                  <Button
                    key="download"
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      // TODO: Download document
                    }}
                  >
                    Download
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      // TODO: Show delete confirmation
                    }}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={getDocumentIcon(doc.type)}
                  title={
                    <Space>
                      <Text strong>{doc.name}</Text>
                      <Tag color="blue">{doc.category}</Tag>
                    </Space>
                  }
                  description={
                    <Space split="|" size={8}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatFileSize(doc.size)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Uploaded by {doc.uploadedBy}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(doc.uploadedDate).toLocaleDateString()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
            bordered
            style={{ backgroundColor: '#fff', borderRadius: 8 }}
          />
        )}
      </Space>
    </div>
  );
};

export default DocumentsTab;
