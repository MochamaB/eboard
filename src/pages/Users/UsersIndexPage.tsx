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
  Modal,
  Segmented,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  MailOutlined,
  StopOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  DownloadOutlined,
  TableOutlined,
  AppstoreOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useBoardContext } from '../../contexts';
import { useUsers, useDeleteUser, useBulkDeactivateUsers } from '../../hooks/api';
import { DataTable, IndexPageLayout, CardView, type TabItem } from '../../components/common';
import { UserCard } from '../../components/users/UserCard';
import type { BulkAction } from '../../components/common/DataTable';
import type { QuickFilter } from '../../components/common/FilterBar';
import type { UserListItem, UserStatus } from '../../types';
import { useLookups } from '../../contexts/LookupsContext';
import { useResponsive } from '../../hooks';

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
  const { currentBoard, activeCommittee, allBoards, theme, routePrefix } = useBoardContext();
  const { roles, getRoleByCode } = useLookups();
  const { isMobile } = useResponsive();

  // View mode state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Force cards on mobile
  const actualViewMode = isMobile ? 'cards' : viewMode;

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
  // Returns numeric ID for API calls, not slug
  const effectiveBoardId = useMemo(() => {
    // In "View All" mode, use selectedBoardId if set, otherwise undefined (all boards)
    if (isAllBoardsView || routePrefix === 'all') {
      // selectedBoardId is a slug, need to find the numeric ID
      if (selectedBoardId) {
        const selectedBoard = allBoards.find(b => b.slug === selectedBoardId);
        return selectedBoard?.id;
      }
      return undefined; // all boards
    }
    
    // If viewing a committee, filter by that committee's numeric ID
    if (activeCommittee && activeCommittee !== 'all' && activeCommittee !== 'board') {
      // activeCommittee is a slug, find the numeric ID from committees or allBoards
      const committeeBoard = allBoards.find(b => b.slug === activeCommittee);
      return committeeBoard?.id;
    }
    // If viewing a specific board, filter by that board's numeric ID
    if (currentBoard) return currentBoard.id;
    // Otherwise, show all users (KTDA Group view or 'all' tab)
    return undefined;
  }, [activeCommittee, currentBoard, isAllBoardsView, routePrefix, selectedBoardId, allBoards]);

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
  const deleteUserMutation = useDeleteUser();
  const bulkDeactivateMutation = useBulkDeactivateUsers();

  // Handle individual user deactivation
  const handleDeactivate = useCallback((user: UserListItem) => {
    if (user.status === 'inactive') {
      message.info('User is already inactive. Use Edit to reactivate.');
      return;
    }

    Modal.confirm({
      title: 'Deactivate User',
      content: `Are you sure you want to deactivate ${user.fullName}? This will end all board memberships and log them out of all devices.`,
      okText: 'Deactivate',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteUserMutation.mutateAsync(user.id);
          message.success(`User "${user.fullName}" deactivated successfully`);
          refetch();
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Failed to deactivate user');
        }
      },
    });
  }, [deleteUserMutation, refetch]);

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
        const roleInfo = getRoleByCode(role);
        return (
          <Tag color={theme.primaryColor}>
            {roleInfo?.name || role}
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
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <EyeOutlined 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${routePrefix}/users/${record.id}`);
              }}
              style={{ fontSize: 16, color: theme.primaryColor }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <EditOutlined 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${routePrefix}/users/${record.id}/edit`);
              }}
              style={{ fontSize: 16, color: theme.secondaryColor }}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Reactivate'}>
            <StopOutlined 
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(record);
              }}
              style={{ fontSize: 16, color: record.status === 'active' ? '#ff4d4f' : theme.warningColor }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [navigate, routePrefix, theme, handleDeactivate]);

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
              ...roles.map(role => ({
                label: role.name,
                value: role.code,
              })),
            ]}
          />

          <div style={{ flex: 1 }} />

          {/* Action Buttons and View Switcher */}
          <Space>
            {/* View Switcher - Hide text on mobile */}
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as 'table' | 'cards')}
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
        {actualViewMode === 'table' ? (
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
        ) : (
          <CardView
            data={data?.data || []}
            loading={isLoading}
            renderCard={(user, index) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => handleRowClick(user)}
                showActions
              />
            )}
            emptyText="No users found"
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

export default UsersIndexPage;
