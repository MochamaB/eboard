import React, { useState, useMemo } from 'react';
import { Button, Space, Tag, Typography, Input, Select, Flex, Avatar, Tooltip, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import { DataTable } from '../../../components/common';
import { useBoardContext } from '../../../contexts';
import { useBoardMembers } from '../../../hooks/api/useBoards';
import { useLookups } from '../../../contexts/LookupsContext';
import type { Board, BoardMember } from '../../../types/board.types';

const { Text } = Typography;

interface MembersTabProps {
  board: Board;
}

export const MembersTab: React.FC<MembersTabProps> = ({ board }) => {
  const { theme } = useBoardContext();
  const { getRoleByCode } = useLookups();
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch members from API
  const { data: membersData, isLoading } = useBoardMembers(board.id, {
    page,
    pageSize,
    search: searchValue || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  });

  // Get members from API response
  const members = membersData?.data ?? [];
  const totalMembers = membersData?.total ?? 0;

  // Table columns
  const columns: ColumnsType<BoardMember> = useMemo(() => [
    {
      title: 'Member',
      key: 'member',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: theme.primaryColor }}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.fullName}</Text>
            {record.title && (
              <Text type="secondary" style={{ fontSize: 12 }}>{record.title}</Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space size={4}>
            <MailOutlined style={{ color: theme.textSecondary }} />
            <Text style={{ fontSize: 13 }}>{record.email}</Text>
          </Space>
          {record.phone && (
            <Space size={4}>
              <PhoneOutlined style={{ color: theme.textSecondary }} />
              <Text style={{ fontSize: 13 }}>{record.phone}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'roleCode',
      key: 'role',
      width: 150,
      render: (roleCode: string) => {
        const roleInfo = getRoleByCode(roleCode);
        return (
          <Tag color={
            roleCode === 'chairman' ? 'purple' :
            roleCode === 'director' ? 'blue' :
            roleCode === 'secretary' ? 'green' :
            'default'
          }>
            {roleInfo?.name || roleCode.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => (
        <Text type="secondary">{date ? new Date(date).toLocaleDateString() : '-'}</Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="Edit Member">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: theme.primaryColor }} />}
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Navigate to edit member
              }}
            />
          </Tooltip>
          <Tooltip title="Remove Member">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Show remove confirmation
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [theme, getRoleByCode]);

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading members...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Header with Add Button */}
        <Flex justify="space-between" align="center">
          <div>
            <Text strong style={{ fontSize: 16 }}>Board Members</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Manage board membership and roles
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // TODO: Open add member modal
            }}
          >
            Add Member
          </Button>
        </Flex>

        {/* Filters */}
        <Flex gap={12} wrap="wrap">
          <Input
            placeholder="Search members..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />

          <Select
            placeholder="Filter by Role"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 160 }}
            options={[
              { label: 'All Roles', value: 'all' },
              { label: 'Chairman', value: 'chairman' },
              { label: 'Director', value: 'director' },
              { label: 'Secretary', value: 'secretary' },
              { label: 'Member', value: 'member' },
            ]}
          />
        </Flex>

        {/* Members Table */}
        {members.length === 0 ? (
          <div style={{
            padding: 48,
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px dashed #d9d9d9'
          }}>
            <UserOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 16 }}>
                No members found
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Add members to this board to get started
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginTop: 16 }}
              onClick={() => {
                // TODO: Open add member modal
              }}
            >
              Add First Member
            </Button>
          </div>
        ) : (
          <DataTable<BoardMember>
            columns={columns}
            dataSource={members}
            loading={isLoading}
            rowKey="id"
            showSearch={false}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalMembers,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`,
            }}
            onChange={(pagination) => {
              setPage(pagination.current || 1);
              setPageSize(pagination.pageSize || 10);
            }}
          />
        )}
      </Space>
    </div>
  );
};

export default MembersTab;
