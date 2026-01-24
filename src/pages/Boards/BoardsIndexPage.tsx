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
  Card,
  Badge,
  Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  TeamOutlined,
  CalendarOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useBoardContext } from '../../contexts';
import { useBoards } from '../../hooks/api';
import { DataTable, SearchBox, FilterBar } from '../../components/common';
import type { FilterConfig } from '../../components/common';
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
  zone_8: 'Zone 8',
  zone_9: 'Zone 9',
  zone_10: 'Zone 10',
  zone_11: 'Zone 11',
  zone_12: 'Zone 12',
};

export const BoardsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBoard, activeCommittee, theme, viewMode } = useBoardContext();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<BoardStatus | undefined>();
  const [zoneFilter, setZoneFilter] = useState<Zone | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset filters when board changes
  useEffect(() => {
    setStatusFilter(undefined);
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
    status: statusFilter,
    zone: zoneFilter,
    boardId: boardIdFilter,
    parentId: parentIdFilter,
    type: typeFilter,
    page,
    pageSize,
  }), [searchValue, statusFilter, zoneFilter, boardIdFilter, parentIdFilter, typeFilter, page, pageSize]);

  // Fetch boards
  const { data, isLoading, refetch } = useBoards(filterParams);

  // Filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'All Statuses',
        width: 140,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    ];

    // Only show zone filter for factory boards
    if (currentBoard?.type === 'factory' || currentBoard?.type === 'main') {
      configs.push({
        key: 'zone',
        label: 'Zone',
        type: 'select',
        placeholder: 'All Zones',
        width: 140,
        options: Object.entries(ZONE_LABELS).map(([value, label]) => ({
          label,
          value,
        })),
      });
    }

    return configs;
  }, [currentBoard?.type]);

  // Filter values for FilterBar
  const filterValues = useMemo(() => ({
    status: statusFilter,
    zone: zoneFilter,
  }), [statusFilter, zoneFilter]);

  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: unknown) => {
    if (key === 'status') {
      setStatusFilter(value as BoardStatus | undefined);
    } else if (key === 'zone') {
      setZoneFilter(value as Zone | undefined);
    }
    setPage(1);
  }, []);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    setStatusFilter(undefined);
    setZoneFilter(undefined);
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
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${currentBoard?.id}/boards/${record.id}`);
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
    navigate(`/${currentBoard?.id}/boards/${record.id}`);
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

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0, marginBottom: 4 }}>
            Boards
          </Typography.Title>
          <Text type="secondary">
            Manage boards and committees
            {currentBoard && (
              <> under <strong>{currentBoard.name}</strong></>
            )}
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateBoard} 
          size="large"
        >
          New Board
        </Button>
      </div>

      {/* Main Card */}
      <Card 
        bordered={false} 
        style={{ 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' 
        }}
      >
        {/* Search and Filters Row */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBox
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search boards..."
            width={280}
          />
          <FilterBar
            filters={filterConfigs}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
            compact
          />
          <div style={{ marginLeft: 'auto' }}>
            <Button onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable<BoardListItem>
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
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
      </Card>
    </div>
  );
};

export default BoardsIndexPage;
