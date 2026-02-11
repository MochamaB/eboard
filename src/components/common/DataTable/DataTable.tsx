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
import { useResponsive } from '../../../hooks';
import { responsiveHelpers } from '../../../utils';

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
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();

  const searchVal = searchValue !== undefined ? searchValue : localSearchValue;

  // Responsive search input width
  const searchWidth = responsiveHelpers.getResponsiveSpacing({
    xs: 280, // Full width on mobile (will be constrained by container)
    sm: 280,
    md: 280,
    lg: 300,
    xl: 320,
  }, currentBreakpoint);

  // Calculate responsive scroll width if not explicitly provided
  const responsiveScroll = useMemo(() => {
    if (scroll) return scroll;

    // Only enforce horizontal scroll on small screens (mobile/tablet)
    // On desktop (lg+) let the table auto-fit the container width
    const scrollWidths: Partial<Record<typeof currentBreakpoint, number>> = {
      xs: 600,
      sm: 700,
      md: 800,
    };

    const xWidth = scrollWidths[currentBreakpoint];
    return xWidth ? { x: xWidth } : undefined;
  }, [scroll, currentBreakpoint]);

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
        vertical={isMobile}
        justify="space-between"
        align={isMobile ? 'stretch' : 'center'}
        gap={isMobile ? 8 : 16}
        style={{ marginBottom: 16 }}
      >
        {/* Search + filters row */}
        <Flex
          gap={8}
          align="center"
          wrap={isMobile ? undefined : 'wrap'}
          style={{ flex: isMobile ? undefined : 1 }}
        >
          {showSearch && (
            <Input.Search
              placeholder={searchPlaceholder}
              allowClear
              value={searchVal}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              style={{ width: isMobile ? '100%' : searchWidth }}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          )}
          {headerExtra}
        </Flex>

        {/* Action buttons row */}
        <Flex gap={8} align="center" justify={isMobile ? 'flex-end' : undefined} style={{ flexShrink: 0 }}>
          {onRefresh && (
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
            </Tooltip>
          )}
          {exportOptions.length > 0 && (
            <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
              <Button icon={<DownloadOutlined />}>
                {!isMobile && 'Export'}
              </Button>
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
            <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
              <Space wrap>
                <Text strong>{selectedRowKeys.length} selected</Text>
                {bulkActions.length > 0 && (
                  <>
                    {!isMobile && <span style={{ color: '#d9d9d9' }}>|</span>}
                    {/* On mobile show max 2 actions inline, rest in dropdown */}
                    {bulkActions.slice(0, isMobile ? 2 : 3).map((action) => (
                      <Button
                        key={action.key}
                        type="link"
                        size="small"
                        icon={action.icon}
                        danger={action.danger}
                        disabled={action.disabled}
                        onClick={() => action.onClick(selectedRows)}
                      >
                        {isMobile ? null : action.label}
                      </Button>
                    ))}
                    {(isMobile ? bulkActions.length > 2 : bulkActions.length > 3) && (
                      <Dropdown
                        menu={{ items: isMobile ? bulkActionMenuItems.slice(2) : bulkActionMenuItems.slice(3) }}
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
                {!isMobile && 'Clear'}
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
                showSizeChanger: !isMobile,
                showTotal: isMobile
                  ? undefined
                  : (total, range) => `${range[0]}-${range[1]} of ${total}`,
                pageSizeOptions: ['10', '20', '50', '100'],
                size: isMobile ? 'small' : 'default',
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
        scroll={responsiveScroll}
        size={isMobile ? 'small' : size}
        locale={{ emptyText }}
      />
    </div>
  );
}

export default DataTable;
