/**
 * Users Index Page
 * List and manage users with filtering, search, and bulk actions
 * Based on docs/MODULES/Module01_UserManagement/01_USERS_PAGES.md
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Space,
  Avatar,
  Tag,
  Tooltip,
  Dropdown,
  message,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  PlusOutlined,
  MailOutlined,
  StopOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useOrgTheme } from '../../contexts';
import { useUsers, useBulkDeactivateUsers } from '../../hooks/api';
import { DataTable, FilterBar } from '../../components/common';
import type { BulkAction, ExportOption } from '../../components/common/DataTable';
import type { FilterConfig, QuickFilter } from '../../components/common/FilterBar';
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

// Status color map
const statusColors: Record<UserStatus, string> = {
  active: 'green',
  inactive: 'default',
  pending: 'orange',
};

export const UsersIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrg, activeCommittee } = useOrgTheme();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [boardFilter, setBoardFilter] = useState<string | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Determine board filter based on org context
  const effectiveBoardId = useMemo(() => {
    // If user selected a specific board filter, use that
    if (boardFilter) return boardFilter;
    // If viewing a specific committee (not 'all' or 'board'), filter by that committee
    if (activeCommittee && activeCommittee !== 'all' && activeCommittee !== 'board') {
      return activeCommittee;
    }
    // If viewing a specific org (not group), filter by that org's board
    if (currentOrg && currentOrg.type !== 'group') return currentOrg.id;
    // Otherwise, show all users (KTDA Group view or 'all' tab)
    return undefined;
  }, [boardFilter, activeCommittee, currentOrg]);

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
      render: (name: string, record) => (
        <Space>
          <Avatar src={record.avatar} style={{ backgroundColor: '#1890ff' }}>
            {getInitials(name)}
          </Avatar>
          <div>
            <div>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'primaryRole',
      key: 'role',
      width: 180,
      render: (role: string) => {
        const roleInfo = SYSTEM_ROLE_INFO[role as keyof typeof SYSTEM_ROLE_INFO];
        return (
          <Tag color={roleInfo?.color || 'default'}>
            {roleInfo?.label || role}
          </Tag>
        );
      },
    },
    {
      title: 'Boards',
      dataIndex: 'boardCount',
      key: 'boards',
      width: 100,
      align: 'center',
      sorter: true,
      render: (count: number) => (
        <Tooltip title={`Member of ${count} board(s)`}>
          <Tag>{count}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: UserStatus) => (
        <Tag color={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'MFA',
      dataIndex: 'mfaEnabled',
      key: 'mfa',
      width: 80,
      align: 'center',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>
          {enabled ? 'On' : 'Off'}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 140,
      sorter: true,
      render: (date: string | null) => (
        <Text type="secondary">
          {date ? dayjs(date).fromNow() : 'Never'}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => navigate(`/${currentOrg?.id}/users/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit User',
                onClick: () => navigate(`/${currentOrg?.id}/users/${record.id}/edit`),
              },
              {
                key: 'reset-password',
                icon: <KeyOutlined />,
                label: 'Reset Password',
                onClick: () => message.info('Password reset email sent'),
              },
              { type: 'divider' },
              {
                key: 'deactivate',
                icon: <StopOutlined />,
                label: record.status === 'active' ? 'Deactivate' : 'Activate',
                danger: record.status === 'active',
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ], [navigate, currentOrg?.id]);

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

  // Filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'All Roles',
      width: 180,
      options: Object.entries(SYSTEM_ROLE_INFO).map(([key, info]) => ({
        label: info.label,
        value: key,
      })),
    },
  ], []);

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

  // Export options
  const exportOptions: ExportOption[] = useMemo(() => [
    {
      key: 'csv',
      label: 'Export as CSV',
      format: 'csv',
      onClick: () => message.info('Exporting as CSV...'),
    },
    {
      key: 'xlsx',
      label: 'Export as Excel',
      format: 'xlsx',
      onClick: () => message.info('Exporting as Excel...'),
    },
  ], []);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const handleQuickFilterChange = useCallback((key: string) => {
    setStatusFilter(key);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    if (key === 'role') {
      setRoleFilter(value as string | undefined);
    } else if (key === 'board') {
      setBoardFilter(value as string | undefined);
    }
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setStatusFilter('all');
    setRoleFilter(undefined);
    setBoardFilter(undefined);
    setSearchValue('');
    setPage(1);
  }, []);

  const handleRowClick = useCallback((record: UserListItem) => {
    navigate(`/${currentOrg?.id}/users/${record.id}`);
  }, [navigate, currentOrg?.id]);

  const handleTableChange = useCallback((pagination: any) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
  }, []);

  const handleCreateUser = useCallback(() => {
    navigate(`/${currentOrg?.id}/users/create`);
  }, [navigate, currentOrg?.id]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>Users</Typography.Title>
            <Text type="secondary">
              Manage users and their board memberships
              {currentOrg && currentOrg.type !== 'group' && (
                <> for <strong>{currentOrg.name}</strong></>
              )}
            </Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
            Create User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        quickFilters={quickFilters}
        activeQuickFilter={statusFilter}
        onQuickFilterChange={handleQuickFilterChange}
        filters={filterConfigs}
        values={{ role: roleFilter, board: boardFilter }}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Data Table */}
      <DataTable<UserListItem>
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowSelection
        searchPlaceholder="Search by name or email..."
        searchValue={searchValue}
        onSearch={handleSearch}
        bulkActions={bulkActions}
        exportOptions={exportOptions}
        onRowClick={handleRowClick}
        onRefresh={() => refetch()}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
        }}
        scroll={{ x: 900 }}
      />
    </div>
  );
};

export default UsersIndexPage;
