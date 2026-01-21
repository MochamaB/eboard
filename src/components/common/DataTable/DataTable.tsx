/**
 * DataTable Component
 * Reusable table with search, filters, pagination, and bulk actions
 * Based on docs/05_COMPONENT_SPECIFICATION.md section 3.1
 */

import React, { useState, useMemo } from 'react';
import {
  Table,
  Input,
  Space,
  Button,
  Dropdown,
  Typography,
  Flex,
  Tooltip,
  Alert,
} from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, SorterResult, FilterValue } from 'antd/es/table/interface';
import {
  SearchOutlined,
  DownloadOutlined,
  MoreOutlined,
  CloseOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: (selectedRows: T[]) => void;
  disabled?: boolean;
}

export interface ExportOption {
  key: string;
  label: string;
  format: 'csv' | 'xlsx' | 'pdf';
  onClick: () => void;
}

export interface DataTableProps<T extends { id: number | string }> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  pagination?: TablePaginationConfig | false;
  rowSelection?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  bulkActions?: BulkAction<T>[];
  exportOptions?: ExportOption[];
  onRowClick?: (record: T) => void;
  onRefresh?: () => void;
  onChange?: TableProps<T>['onChange'];
  rowKey?: string | ((record: T) => string);
  scroll?: TableProps<T>['scroll'];
  size?: 'small' | 'middle' | 'large';
  showSearch?: boolean;
  emptyText?: string;
  headerExtra?: React.ReactNode;
}

export function DataTable<T extends { id: number | string }>({
  columns,
  dataSource,
  loading = false,
  pagination,
  rowSelection = false,
  searchPlaceholder = 'Search...',
  onSearch,
  searchValue,
  bulkActions = [],
  exportOptions = [],
  onRowClick,
  onRefresh,
  onChange,
  rowKey = 'id',
  scroll,
  size = 'middle',
  showSearch = true,
  emptyText = 'No data found',
  headerExtra,
}: DataTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [localSearchValue, setLocalSearchValue] = useState('');

  const searchVal = searchValue !== undefined ? searchValue : localSearchValue;

  const selectedRows = useMemo(() => {
    return dataSource.filter((item) => {
      const key = typeof rowKey === 'function' ? rowKey(item) : item[rowKey as keyof T];
      return selectedRowKeys.includes(key as React.Key);
    });
  }, [dataSource, selectedRowKeys, rowKey]);

  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value);
    } else {
      setLocalSearchValue(value);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchValue === undefined) {
      setLocalSearchValue(value);
    }
    // Debounced search on change
    if (onSearch && value === '') {
      onSearch('');
    }
  };

  const handleRowSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const clearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleTableChange = (
    paginationConfig: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    if (onChange) {
      onChange(paginationConfig, filters, sorter, {
        currentDataSource: dataSource,
        action: 'sort',
      });
    }
  };

  const exportMenuItems = exportOptions.map((option) => ({
    key: option.key,
    label: option.label,
    onClick: option.onClick,
  }));

  const bulkActionMenuItems = bulkActions.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    danger: action.danger,
    disabled: action.disabled,
    onClick: () => action.onClick(selectedRows),
  }));

  const tableRowSelection = rowSelection
    ? {
        selectedRowKeys,
        onChange: handleRowSelectionChange,
        preserveSelectedRowKeys: true,
      }
    : undefined;

  return (
    <div className="data-table">
      {/* Header with search and actions */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={16}
        style={{ marginBottom: 16 }}
      >
        <Flex gap={12} align="center" wrap="wrap">
          {showSearch && (
            <Input.Search
              placeholder={searchPlaceholder}
              allowClear
              value={searchVal}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              style={{ width: 280 }}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          )}
          {headerExtra}
        </Flex>

        <Flex gap={8} align="center">
          {onRefresh && (
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
            </Tooltip>
          )}
          {exportOptions.length > 0 && (
            <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
          )}
        </Flex>
      </Flex>

      {/* Bulk action bar - shown when items selected */}
      {rowSelection && selectedRowKeys.length > 0 && (
        <Alert
          type="info"
          showIcon={false}
          style={{ marginBottom: 16 }}
          message={
            <Flex justify="space-between" align="center">
              <Space>
                <Text strong>{selectedRowKeys.length} selected</Text>
                {bulkActions.length > 0 && (
                  <>
                    <span style={{ color: '#d9d9d9' }}>|</span>
                    {bulkActions.slice(0, 3).map((action) => (
                      <Button
                        key={action.key}
                        type="link"
                        size="small"
                        icon={action.icon}
                        danger={action.danger}
                        disabled={action.disabled}
                        onClick={() => action.onClick(selectedRows)}
                      >
                        {action.label}
                      </Button>
                    ))}
                    {bulkActions.length > 3 && (
                      <Dropdown
                        menu={{ items: bulkActionMenuItems.slice(3) }}
                        trigger={['click']}
                      >
                        <Button type="link" size="small" icon={<MoreOutlined />}>
                          More
                        </Button>
                      </Dropdown>
                    )}
                  </>
                )}
              </Space>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={clearSelection}
              >
                Clear
              </Button>
            </Flex>
          }
        />
      )}

      {/* Table */}
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={
          pagination === false
            ? false
            : {
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                pageSizeOptions: ['10', '20', '50', '100'],
                ...pagination,
              }
        }
        rowSelection={tableRowSelection}
        rowKey={rowKey}
        onChange={handleTableChange}
        onRow={
          onRowClick
            ? (record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: 'pointer' },
              })
            : undefined
        }
        scroll={scroll}
        size={size}
        locale={{ emptyText }}
      />
    </div>
  );
}

export default DataTable;
