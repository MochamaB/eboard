/**
 * Users Index Page
 * List and manage users with filtering, search, and bulk actions
 * Based on docs/MODULES/Module01_UserManagement/01_USERS_PAGES.md
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  Space,
  Avatar,
  Tag,
  Tooltip,
  message,
  Typography,
  Input,
  Select,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  MailOutlined,
  StopOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useBoardContext } from '../../contexts';
import { useUsers, useBulkDeactivateUsers } from '../../hooks/api';
import { DataTable, IndexPageLayout, type TabItem } from '../../components/common';
import type { BulkAction } from '../../components/common/DataTable';
import type { QuickFilter } from '../../components/common/FilterBar';
import type { UserListItem, UserStatus } from '../../types';
import { SYSTEM_ROLE_INFO } from '../../types/role.types';

dayjs.extend(relativeTime);

const { Text } = Typography;

// Helper to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const UsersIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBoard, activeCommittee, theme, viewMode: boardViewMode, allBoards } = useBoardContext();

  // Check if we're in "View All" mode (route is /all/users)
  const isAllBoardsView = location.pathname.startsWith('/all/');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Board filter for "View All" mode
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();

  // Reset filters when board changes or view mode changes
  useEffect(() => {
    setStatusFilter('all');
    setRoleFilter(undefined);
    setSearchValue('');
    setPage(1);
    setSelectedBoardId(undefined);
  }, [currentBoard?.id, isAllBoardsView]);

  // Determine board filter based on view mode and org context
  const effectiveBoardId = useMemo(() => {
    // In "View All" mode, use selectedBoardId if set, otherwise undefined (all boards)
    if (isAllBoardsView || boardViewMode === 'all') {
      return selectedBoardId; // undefined = all boards, or specific board if selected
    }
    
    // If viewing a specific committee (not 'all' or 'board'), filter by that committee
    if (activeCommittee && activeCommittee !== 'all' && activeCommittee !== 'board') {
      return activeCommittee;
    }
    // If viewing a specific board, filter by that board
    if (currentBoard) return currentBoard.id;
    // Otherwise, show all users (KTDA Group view or 'all' tab)
    return undefined;
  }, [activeCommittee, currentBoard, isAllBoardsView, boardViewMode, selectedBoardId]);

  // Build filter params
  const filterParams = useMemo(() => ({
    search: searchValue || undefined,
    status: statusFilter !== 'all' ? (statusFilter as UserStatus) : undefined,
    role: roleFilter,
    boardId: effectiveBoardId,
    page,
    pageSize,
  }), [searchValue, statusFilter, roleFilter, effectiveBoardId, page, pageSize]);

  // Fetch users
  const { data, isLoading, refetch } = useUsers(filterParams);
  const bulkDeactivateMutation = useBulkDeactivateUsers();

  // Table columns
  const columns: ColumnsType<UserListItem> = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'name',
      sorter: true,
      ellipsis: true,
      render: (name: string, record) => (
        <Space>
          <Avatar src={record.avatar} style={{ backgroundColor: theme.primaryColor }}>
            {getInitials(name)}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'primaryRole',
      key: 'role',
      width: 160,
      render: (role: string) => {
        const roleInfo = SYSTEM_ROLE_INFO[role as keyof typeof SYSTEM_ROLE_INFO];
        return (
          <Tag color={roleInfo?.color || theme.primaryColor}>
            {roleInfo?.label || role}
          </Tag>
        );
      },
    },
    {
      title: 'Boards',
      dataIndex: 'boardCount',
      key: 'boards',
      width: 90,
      align: 'center',
      sorter: true,
      render: (count: number) => (
        <Tooltip title={`Member of ${count || 0} board(s)`}>
          <Badge count={count || 0} showZero style={{ backgroundColor: theme.primaryColor }} />
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: UserStatus) => {
        const color = status === 'active' ? theme.successColor : 
                      status === 'pending' ? theme.warningColor : 'default';
        return (
          <Tag color={color}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'MFA',
      dataIndex: 'mfaEnabled',
      key: 'mfa',
      width: 70,
      align: 'center',
      render: (enabled: boolean) => (
        <Tag color={enabled ? theme.successColor : 'default'}>
          {enabled ? 'On' : 'Off'}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 130,
      sorter: true,
      render: (date: string | null | undefined) => (
        <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
          {date ? dayjs(date).fromNow() : 'Never'}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
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
                navigate(`/${currentBoard?.id}/users/${record.id}`);
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
                navigate(`/${currentBoard?.id}/users/${record.id}/edit`);
              }}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Activate'}>
            <Button
              type="text"
              size="small"
              danger={record.status === 'active'}
              icon={<StopOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                message.info(record.status === 'active' ? 'User deactivated' : 'User activated');
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [navigate, currentBoard?.id, theme]);

  // Quick filters (status tabs)
  const quickFilters: QuickFilter[] = useMemo(() => {
    const total = data?.total || 0;
    // These counts would ideally come from API, using estimates for now
    return [
      { key: 'all', label: 'All', count: total },
      { key: 'active', label: 'Active' },
      { key: 'inactive', label: 'Inactive' },
      { key: 'pending', label: 'Pending' },
    ];
  }, [data?.total]);

  // Bulk actions
  const bulkActions: BulkAction<UserListItem>[] = useMemo(() => [
    {
      key: 'email',
      label: 'Send Email',
      icon: <MailOutlined />,
      onClick: (selected) => {
        message.info(`Sending email to ${selected.length} users`);
      },
    },
    {
      key: 'deactivate',
      label: 'Deactivate',
      icon: <StopOutlined />,
      danger: true,
      onClick: async (selected) => {
        const ids = selected.map((u) => u.id);
        try {
          await bulkDeactivateMutation.mutateAsync({ userIds: ids });
          message.success(`${ids.length} users deactivated`);
          refetch();
        } catch {
          message.error('Failed to deactivate users');
        }
      },
    },
  ], [bulkDeactivateMutation, refetch]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const handleQuickFilterChange = useCallback((key: string) => {
    setStatusFilter(key);
    setPage(1);
  }, []);

  // Determine route prefix for navigation
  const routePrefix = isAllBoardsView ? 'all' : currentBoard?.id;

  const handleRowClick = useCallback((record: UserListItem) => {
    navigate(`/${routePrefix}/users/${record.id}`);
  }, [navigate, routePrefix]);

  const handleTableChange = useCallback((pagination: any) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
  }, []);

  const handleCreateUser = useCallback(() => {
    navigate(`/${routePrefix}/users/create`);
  }, [navigate, routePrefix]);

  // Tab items for IndexPageLayout
  const tabs: TabItem[] = quickFilters.map(filter => ({
    key: filter.key,
    label: filter.label,
    count: filter.count,
  }));

  return (
    <IndexPageLayout
      title="Users"
      subtitle={`Manage users and their board memberships for ${currentBoard?.name}`}
      subtitleAll="Manage users across all boards"
      tabs={tabs}
      activeTab={statusFilter}
      onTabChange={handleQuickFilterChange}
      primaryActionLabel="Create User"
      onPrimaryAction={handleCreateUser}
    >
      {/* Search and Filters Bar */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <Input.Search
            placeholder="Search by name or email..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            allowClear
            style={{ width: 320 }}
          />

          {/* Board filter - only shown in "View All" mode */}
          {isAllBoardsView && (
            <Select
              placeholder="All Boards"
              value={selectedBoardId}
              onChange={(value) => {
                setSelectedBoardId(value);
                setPage(1);
              }}
              allowClear
              style={{ width: 200 }}
              options={[
                { label: 'All Boards', value: undefined },
                ...allBoards.map(board => ({
                  label: board.name,
                  value: board.id,
                })),
              ]}
            />
          )}

          {/* Role Filter */}
          <Select
            placeholder="All Roles"
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            allowClear
            style={{ width: 180 }}
            options={[
              { label: 'All Roles', value: undefined },
              ...Object.entries(SYSTEM_ROLE_INFO).map(([key, info]) => ({
                label: info.label,
                value: key,
              })),
            ]}
          />

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
        <div className="users-table-wrapper">
          <style>{`
            .users-table-wrapper .ant-table-thead > tr > th:last-child {
              padding-right: 16px !important;
            }
            .users-table-wrapper .ant-table-tbody > tr > td:last-child {
              padding-right: 16px !important;
            }
          `}</style>
          <DataTable<UserListItem>
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            rowSelection
            bulkActions={bulkActions}
            onRowClick={handleRowClick}
            onChange={handleTableChange}
            showSearch={false}
            pagination={{
              current: page,
              pageSize,
              total: data?.total || 0,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            }}
            scroll={{ x: 'max-content' }}
          />
        </div>
    </IndexPageLayout>
  );
};

export default UsersIndexPage;
