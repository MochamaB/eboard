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
  Segmented,
  Modal,
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
  TableOutlined,
  AppstoreOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useBoardContext } from '../../contexts';
import { useBoards, useDeleteBoard } from '../../hooks/api';
import { DataTable, IndexPageLayout, CardView, type TabItem } from '../../components/common';
import { BoardCard } from '../../components/Boards/BoardCard';
import type { BoardListItem, BoardStatus } from '../../types/board.types';
import { useLookups } from '../../contexts/LookupsContext';
import { useResponsive } from '../../hooks';

dayjs.extend(relativeTime);

const { Text } = Typography;

// View mode type
type ViewMode = 'table' | 'cards';

// Board type colors (still hardcoded for now)
const BOARD_TYPE_COLORS: Record<string, string> = {
  main: 'purple',
  subsidiary: 'blue',
  factory: 'green',
  committee: 'orange',
};

export const BoardsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBoard, activeCommittee, setActiveCommittee, allBoards, theme, routePrefix, viewMode: boardViewMode, logoSmall } = useBoardContext();
  const { getBoardTypeByCode, getBoardZoneByCode, boardZoneOptions } = useLookups();
  const { isMobile } = useResponsive();

  // Filter state
  const [searchValue, setSearchValue] = useState('');
  const [boardTypeFilter, setBoardTypeFilter] = useState<string | undefined>();
  const [zoneFilter, setZoneFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // View mode state - default to cards on mobile
  const [viewMode, setViewMode] = useState<ViewMode>(() => isMobile ? 'cards' : 'table');

  // Force cards view on mobile (table is not suitable for small screens)
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('cards');
    }
  }, [isMobile, viewMode]);

  // Reset filters when board changes
  useEffect(() => {
    setBoardTypeFilter(undefined);
    setZoneFilter(undefined);
    setSearchValue('');
    setStatusFilter('all');
    setPage(1);
  }, [currentBoard?.id]);

  // Determine filter logic based on current board, boardViewMode, and active committee
  // boardViewMode === 'all' = show all boards user can access (global view)
  // activeCommittee === 'all' = show current board + its committees (type='committee' only)
  // activeCommittee === 'board' = show only current board
  // activeCommittee === specific committee = show only that committee
  const { boardIdFilter, parentIdFilter, typeFilter } = useMemo(() => {
    // Special case: View All mode shows all boards user can access
    if (boardViewMode === 'all') {
      return { boardIdFilter: undefined, parentIdFilter: undefined, typeFilter: undefined as 'committee' | undefined };
    }
    
    // If viewing a specific committee, show only that committee
    if (activeCommittee && activeCommittee !== 'all' && activeCommittee !== 'board') {
      const committeeBoard = allBoards.find(b => b.slug === activeCommittee);
      return { boardIdFilter: committeeBoard?.id, parentIdFilter: undefined, typeFilter: undefined as 'committee' | undefined };
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
  }, [activeCommittee, currentBoard?.id, allBoards, boardViewMode]);

  // Build filter params for API
  const filterParams = useMemo(() => ({
    search: searchValue || undefined,
    status: statusFilter !== 'all' ? (statusFilter as BoardStatus) : undefined,
    zone: zoneFilter,
    boardId: boardIdFilter,
    parentId: parentIdFilter,
    type: boardTypeFilter || typeFilter,
    page,
    pageSize,
  }), [searchValue, statusFilter, zoneFilter, boardIdFilter, parentIdFilter, boardTypeFilter, typeFilter, page, pageSize]);

  // Fetch boards
  const { data, isLoading, refetch } = useBoards(filterParams);

  // Delete board mutation
  const deleteBoardMutation = useDeleteBoard();

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
      render: (name: string, record) => {
        const boardLogo = getBoardLogo(record);
        return (
          <Space>
            {boardLogo ? (
              <img 
                src={boardLogo} 
                alt={record.name}
                style={{ 
                  width: 24, 
                  height: 24, 
                  objectFit: 'contain',
                  borderRadius: 4 
                }}
              />
            ) : (
              <ApartmentOutlined style={{ color: theme.primaryColor }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500 }}>{name}</div>
              {record.shortName && record.shortName !== name && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.shortName}
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeInfo = getBoardTypeByCode(type);
        const color = BOARD_TYPE_COLORS[type] || 'default';
        return <Tag color={color}>{typeInfo?.name || type}</Tag>;
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
      render: (zone: string | null) => {
        if (!zone) return '-';
        const zoneInfo = getBoardZoneByCode(zone);
        return zoneInfo?.name || zone;
      },
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
        const statusStr = String(status || 'inactive');
        return (
          <Tag color={color}>
            {statusStr.charAt(0).toUpperCase() + statusStr.slice(1)}
          </Tag>
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
            <EyeOutlined 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${routePrefix}/boards/${record.id}/details`);
              }}
              style={{ fontSize: 16, color: theme.primaryColor }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <EditOutlined 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${routePrefix}/boards/${record.id}/edit`);
              }}
              style={{ fontSize: 16, color: theme.secondaryColor }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record);
              }}
              style={{ fontSize: 16, color: '#ff4d4f' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [navigate, routePrefix, theme]);

  // Helper function to get board logo
  const getBoardLogo = (board: BoardListItem): string | undefined => {
    // Find the board in allBoards to get its branding/logo
    const boardWithBranding = allBoards.find(b => b.id === board.id);
    return boardWithBranding?.branding?.logo?.main || boardWithBranding?.branding?.logo?.small;
  };

  // Handle row click
  const handleRowClick = useCallback((board: BoardListItem) => {
    navigate(`/${routePrefix}/boards/${board.id}/details`);
  }, [navigate, routePrefix]);

  // Handle delete board
  const handleDelete = useCallback((board: BoardListItem) => {
    Modal.confirm({
      title: 'Delete Board',
      content: `Are you sure you want to delete ${board.name}? This will soft delete the board and all its related entities (settings, branding, members, meetings). This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteBoardMutation.mutateAsync(board.id);
          message.success(`Board "${board.name}" deleted successfully`);
          refetch(); // Refresh the list
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Failed to delete board');
        }
      },
    });
  }, [deleteBoardMutation, refetch]);

  // Handle table change (pagination, sorting)
  const handleTableChange = useCallback((pagination: any) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
  }, []);

  // Handle create board
  const handleCreateBoard = useCallback(() => {
    navigate(`/${routePrefix}/boards/create`);
  }, [navigate, routePrefix]);

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
            options={boardZoneOptions}
          />
        )}

        <div style={{ flex: 1 }} />

        {/* Action Buttons and View Switcher */}
        <Space>
          {/* View Switcher - Hide text on mobile */}
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={
              isMobile
                ? [
                    { value: 'table', icon: <TableOutlined /> },
                    { value: 'cards', icon: <AppstoreOutlined /> },
                  ]
                : [
                    { label: 'Table', value: 'table', icon: <TableOutlined /> },
                    { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
                  ]
            }
          />
          
          {/* Refresh and Export - Hide text on mobile */}
          {isMobile ? (
            <>
              <Tooltip title="Refresh">
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Tooltip title="Export">
                <Button icon={<DownloadOutlined />} onClick={() => message.info('Exporting...')} />
              </Tooltip>
            </>
          ) : (
            <>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => message.info('Exporting...')}>
                Export
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* Table or Card View */}
      {viewMode === 'table' ? (
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
      ) : (
        <CardView
          data={data?.data || []}
          loading={isLoading}
          renderCard={(board, index) => (
            <BoardCard
              key={board.id}
              board={board}
              allBoards={allBoards}
              onClick={() => handleRowClick(board)}
              showActions
            />
          )}
          emptyText="No boards found"
          columns={{
            xs: 24,  // 1 card on mobile
            sm: 24,  // 1 card on small tablet
            md: 12,  // 2 cards on tablet
            lg: 8,   // 3 cards on desktop
            xl: 6,   // 4 cards on large desktop
          }}
        />
      )}
    </IndexPageLayout>
  );
};

export default BoardsIndexPage;
