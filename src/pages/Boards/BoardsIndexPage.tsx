/**
 * Boards Index Page
 * List and manage boards with filtering and search
 * Based on docs/MODULES/Module02_BoardManagement/02_BOARDS_PAGES.md
 * 
 * Note: Board type filtering (Main, Subsidiary, Factory, Committee) is handled
 * by NavigationBar context, not by this page. This page shows boards based on
 * the current board context and activeCommittee filter.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Space,
  Tag,
  Tooltip,
  message,
  Typography,
  Badge,
  Progress,
  Input,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  EyeOutlined,
  EditOutlined,
  TeamOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useBoardContext } from '../../contexts';
import { useBoards } from '../../hooks/api';
import { DataTable, IndexPageLayout, type TabItem } from '../../components/common';
import type { BoardListItem, BoardStatus, Zone } from '../../types/board.types';

dayjs.extend(relativeTime);

const { Text } = Typography;

// Board type display config
const BOARD_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  main: { label: 'Main Board', color: 'purple' },
  subsidiary: { label: 'Subsidiary', color: 'blue' },
  factory: { label: 'Factory', color: 'green' },
  committee: { label: 'Committee', color: 'orange' },
};

// Zone display labels
const ZONE_LABELS: Record<Zone, string> = {
  zone_1: 'Zone 1',
  zone_2: 'Zone 2',
  zone_3: 'Zone 3',
  zone_4: 'Zone 4',
  zone_5: 'Zone 5',
  zone_6: 'Zone 6',
  zone_7: 'Zone 7',
};

export const BoardsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBoard, activeCommittee, theme, viewMode } = useBoardContext();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<Zone | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset filters when board changes
  useEffect(() => {
    setStatusFilter('all');
    setZoneFilter(undefined);
    setSearchValue('');
    setPage(1);
  }, [currentBoard?.id]);

  // Determine filter logic based on current board, viewMode, and active committee
  // viewMode === 'all' = show all boards user can access (global view)
  // activeCommittee === 'all' = show current board + its committees (type='committee' only)
  // activeCommittee === 'board' = show only current board
  // activeCommittee === specific committee = show only that committee
  const { boardIdFilter, parentIdFilter, typeFilter } = useMemo(() => {
    // Special case: View All mode shows all boards user can access
    if (viewMode === 'all') {
      return { boardIdFilter: undefined, parentIdFilter: undefined, typeFilter: undefined as 'committee' | undefined };
    }
    
    // If viewing a specific committee, show only that committee
    if (activeCommittee && activeCommittee !== 'all' && activeCommittee !== 'board') {
      return { boardIdFilter: activeCommittee, parentIdFilter: undefined, typeFilter: undefined as 'committee' | undefined };
    }
    
    // If viewing 'board' only, show only the current board
    if (activeCommittee === 'board') {
      return { boardIdFilter: currentBoard?.id, parentIdFilter: undefined, typeFilter: undefined as 'committee' | undefined };
    }
    
    // If viewing 'all', show current board + its committees (exclude subsidiaries/factories)
    // This means: boardId = currentBoard OR (parentId = currentBoard AND type = 'committee')
    return { 
      boardIdFilter: currentBoard?.id, 
      parentIdFilter: currentBoard?.id,
      typeFilter: 'committee' as const // Only show committees, not subsidiaries/factories
    };
  }, [activeCommittee, currentBoard?.id]);

  // Build filter params for API
  const filterParams = useMemo(() => ({
    search: searchValue || undefined,
    status: statusFilter !== 'all' ? (statusFilter as BoardStatus) : undefined,
    zone: zoneFilter,
    boardId: boardIdFilter,
    parentId: parentIdFilter,
    type: typeFilter,
    page,
    pageSize,
  }), [searchValue, statusFilter, zoneFilter, boardIdFilter, parentIdFilter, typeFilter, page, pageSize]);

  // Fetch boards
  const { data, isLoading, refetch } = useBoards(filterParams);

  // Quick filters (status tabs)
  const quickFilters = useMemo(() => {
    const total = data?.total || 0;
    return [
      { key: 'all', label: 'All', count: total },
      { key: 'active', label: 'Active' },
      { key: 'inactive', label: 'Inactive' },
    ];
  }, [data?.total]);

  // Handle quick filter change (tabs)
  const handleQuickFilterChange = useCallback((key: string) => {
    setStatusFilter(key);
    setPage(1);
  }, []);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  // Table columns
  const columns: ColumnsType<BoardListItem> = useMemo(() => [
    {
      title: 'Board Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      ellipsis: true,
      render: (name: string, record) => (
        <Space>
          <ApartmentOutlined style={{ color: theme.primaryColor }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500 }}>{name}</div>
            {record.shortName && record.shortName !== name && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.shortName}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const config = BOARD_TYPE_CONFIG[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Parent Board',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 160,
      ellipsis: true,
      render: (parentName: string | null) => parentName || '-',
    },
    {
      title: 'Zone',
      dataIndex: 'zone',
      key: 'zone',
      width: 100,
      render: (zone: Zone | null) => zone ? ZONE_LABELS[zone] : '-',
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      align: 'center',
      sorter: true,
      render: (count: number) => (
        <Tooltip title={`${count} member(s)`}>
          <Badge 
            count={count} 
            showZero 
            style={{ backgroundColor: theme.primaryColor }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Compliance',
      dataIndex: 'compliance',
      key: 'compliance',
      width: 120,
      sorter: true,
      render: (compliance: number) => {
        const status = compliance >= 100 ? 'success' : compliance >= 75 ? 'normal' : 'exception';
        return (
          <Tooltip title={`${compliance}% compliant`}>
            <Progress 
              percent={compliance} 
              size="small" 
              status={status}
              format={(percent) => `${percent}%`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: BoardStatus) => {
        const color = status === 'active' ? theme.successColor : 'default';
        return (
          <Tag color={color}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Last Meeting',
      dataIndex: 'lastMeetingDate',
      key: 'lastMeetingDate',
      width: 130,
      sorter: true,
      render: (date: string | null) => {
        if (!date) return <Text type="secondary">Never</Text>;
        return (
          <Tooltip title={dayjs(date).format('DD MMM YYYY')}>
            <Space size={4}>
              <CalendarOutlined />
              <span>{dayjs(date).fromNow()}</span>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${currentBoard?.id}/boards/${record.id}/details`);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${currentBoard?.id}/boards/${record.id}/edit`);
              }}
            />
          </Tooltip>
          <Tooltip title="Members">
            <Button
              type="text"
              size="small"
              icon={<TeamOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${currentBoard?.id}/boards/${record.id}/members`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [navigate, currentBoard?.id, theme]);

  // Handle row click
  const handleRowClick = useCallback((record: BoardListItem) => {
    navigate(`/${currentBoard?.id}/boards/${record.id}/details`);
  }, [navigate, currentBoard?.id]);

  // Handle table change (pagination, sorting)
  const handleTableChange = useCallback((pagination: any) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
  }, []);

  // Handle create board
  const handleCreateBoard = useCallback(() => {
    navigate(`/${currentBoard?.id}/boards/create`);
  }, [navigate, currentBoard?.id]);

  // Tab items for IndexPageLayout
  const tabs: TabItem[] = quickFilters.map(filter => ({
    key: filter.key,
    label: filter.label,
    count: filter.count,
  }));

  return (
    <IndexPageLayout
      title="Boards"
      subtitle={`Manage boards and committees under ${currentBoard?.name}`}
      subtitleAll="Manage all boards and committees"
      tabs={tabs}
      activeTab={statusFilter}
      onTabChange={handleQuickFilterChange}
      primaryActionLabel="New Board"
      onPrimaryAction={handleCreateBoard}
    >

      {/* Search and Filters Bar */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <Input.Search
          placeholder="Search boards..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          allowClear
          style={{ width: 320 }}
        />

        {/* Zone Filter - only show for factory boards or main board */}
        {(currentBoard?.type === 'factory' || currentBoard?.type === 'main') && (
          <Select
            placeholder="All Zones"
            value={zoneFilter}
            onChange={(value) => {
              setZoneFilter(value);
              setPage(1);
            }}
            allowClear
            style={{ width: 180 }}
            options={[
              { label: 'All Zones', value: undefined },
              ...Object.entries(ZONE_LABELS).map(([value, label]) => ({
                label,
                value,
              })),
            ]}
          />
        )}

        <div style={{ flex: 1 }} />

        {/* Action Buttons */}
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.info('Exporting...')}>
            Export
          </Button>
        </Space>
      </div>

      {/* Data Table */}
      <DataTable<BoardListItem>
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        showSearch={false}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} boards`,
        }}
        onChange={handleTableChange}
        onRowClick={handleRowClick}
        scroll={{ x: 1100 }}
      />
    </IndexPageLayout>
  );
};

export default BoardsIndexPage;
