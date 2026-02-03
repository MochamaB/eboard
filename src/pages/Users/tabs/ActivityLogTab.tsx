/**
 * Activity Log Tab
 * Displays user's activity history with filtering
 */

import React, { useState } from 'react';
import { Card, Table, Space, Tag, DatePicker, Select, Button, Typography } from 'antd';
import {
  ClockCircleOutlined,
  LoginOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '../../../types/user.types';
import { useUserActivities } from '../../../hooks/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ActivityLogTabProps {
  user: User;
  themeColor?: string;
}

// Activity type configuration
const activityConfig = {
  login: { icon: <LoginOutlined />, color: 'blue', label: 'Login' },
  logout: { icon: <LoginOutlined />, color: 'default', label: 'Logout' },
  document_view: { icon: <FileTextOutlined />, color: 'green', label: 'Document View' },
  document_download: { icon: <DownloadOutlined />, color: 'cyan', label: 'Document Download' },
  meeting_join: { icon: <CalendarOutlined />, color: 'purple', label: 'Meeting Join' },
  meeting_leave: { icon: <CalendarOutlined />, color: 'default', label: 'Meeting Leave' },
  vote_cast: { icon: <CheckCircleOutlined />, color: 'orange', label: 'Vote Cast' },
  profile_update: { icon: <ClockCircleOutlined />, color: 'geekblue', label: 'Profile Update' },
};

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ user, themeColor }) => {
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Fetch activities
  const { data: activitiesData, isLoading } = useUserActivities(user.id);

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action: string) => {
        const config = activityConfig[action as keyof typeof activityConfig] || {
          icon: <ClockCircleOutlined />,
          color: 'default',
          label: action,
        };
        return (
          <Space>
            {config.icon}
            <Tag color={config.color}>{config.label}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
      render: (ip: string) => ip || <Tag color="default">N/A</Tag>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => (
        <Space size={0} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>{dayjs(date).format('MMM D, YYYY')}</span>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(date).format('h:mm A')}
          </span>
        </Space>
      ),
      defaultSortOrder: 'descend',
    },
  ];

  // Filter options
  const actionOptions = Object.entries(activityConfig).map(([key, config]) => ({
    label: config.label,
    value: key,
  }));

  return (
    <div style={{ padding: 24 }}>
      {/* Filters */}
      <Space style={{ width: '100%', marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Action Type</Text>
          <Select
            style={{ width: 200 }}
            placeholder="All actions"
            allowClear
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { label: 'All Actions', value: undefined },
              ...actionOptions,
            ]}
          />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Date Range</Text>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="MMM D, YYYY"
            style={{ width: 280 }}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <Button
            type="default"
            icon={<DownloadOutlined />}
          >
            Export
          </Button>
        </div>
      </Space>

      {/* Activity Table */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Activity History</span>
            <Tag color={themeColor}>{activitiesData?.total || 0}</Tag>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={activitiesData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: activitiesData?.total || 0,
            pageSize: activitiesData?.pageSize || 20,
            current: activitiesData?.page || 1,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} activities`,
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ActivityLogTab;
