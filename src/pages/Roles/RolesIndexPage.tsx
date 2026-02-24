/**
 * RolesIndexPage Component
 * Main page for roles management with DataTable
 * Includes create, edit, and delete functionality
 */

import React, { useState } from 'react';
import {
  Button,
  Table,
  Space,
  Tag,
  Popconfirm,
  message,
  Input,
  Typography,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LockOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBoardContext } from '../../contexts';
import { useRoles, useDeleteRole } from '../../hooks/api';
import type { Role } from '../../types';

const { Title, Text } = Typography;

export const RolesIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useBoardContext();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading, refetch } = useRoles({ page, pageSize });
  const deleteRoleMutation = useDeleteRole();

  const handleEdit = (role: Role) => {
    navigate(`/all/roles/${role.id}/edit`);
  };

  const handleDelete = async (role: Role) => {
    try {
      await deleteRoleMutation.mutateAsync(role.id);
      message.success('Role deleted successfully');
      refetch();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete role');
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      filteredValue: searchValue ? [searchValue] : null,
      onFilter: (value, record) => {
        const search = value.toString().toLowerCase();
        return (
          record.name.toLowerCase().includes(search) ||
          record.description.toLowerCase().includes(search) ||
          record.code.toLowerCase().includes(search)
        );
      },
      render: (name: string, record: Role) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{name}</Text>
            {record.isSystem && (
              <Tag icon={<LockOutlined />} color="blue">
                System
              </Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.code}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <Text type="secondary">{description || '—'}</Text>
      ),
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      key: 'scope',
      width: 100,
      render: (scope: string) => (
        <Tag color={scope === 'global' ? 'purple' : 'blue'}>
          {scope.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissionCount',
      key: 'permissionCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <Tag color={theme.primaryColor} style={{ minWidth: 40, textAlign: 'center' }}>
          {count}
        </Tag>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Text>{count || 0}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record: Role) => (
        <Space size="small">
          <Tooltip
            title={record.isSystem ? 'System roles cannot be modified' : 'Edit role'}
          >
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: theme.primaryColor }}
              disabled={record.isSystem}
            />
          </Tooltip>
          {!record.isSystem && (
            <Popconfirm
              title="Delete Role"
              description={
                record.userCount && record.userCount > 0
                  ? `This role is assigned to ${record.userCount} user(s). Are you sure you want to delete it?`
                  : 'Are you sure you want to delete this role?'
              }
              onConfirm={() => handleDelete(record)}
              okText="Yes, delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={(record.userCount ?? 0) > 0}
            >
              <Tooltip title={(record.userCount ?? 0) > 0 ? 'Cannot delete role with assigned users' : 'Delete role'}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={(record.userCount ?? 0) > 0}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={5} style={{ margin: 0, color: theme.textPrimary }}>
              Roles & Permissions
            </Title>
            <Text type="secondary">
              Manage system and custom roles with their permissions
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/all/roles/create')}
            size="middle"
            style={{ background: theme.primaryColor, borderColor: theme.primaryColor }}
          >
            Create Role
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search roles..."
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} roles`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
        }}
      />

    </div>
  );
};

export default RolesIndexPage;
