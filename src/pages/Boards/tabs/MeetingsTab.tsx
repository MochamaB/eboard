import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Space,
  Tooltip,
  message,
  Typography,
  Input,
  Select,
  Flex,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import {
  EyeOutlined,
  EditOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useBoardContext } from '../../../contexts';
import { useMeetings } from '../../../hooks/api';
import { DataTable } from '../../../components/common';
import type {
  MeetingListItem,
  MeetingStatus,
  MeetingType,
  LocationType,
  MeetingFilterParams,
} from '../../../types/meeting.types';
import {
  MEETING_TYPE_LABELS,
  LOCATION_TYPE_LABELS,
} from '../../../types/meeting.types';
import { MeetingStatusBadge } from '../../../components/Meetings';

const { Text } = Typography;

interface MeetingsTabProps {
  boardId: string;
}

// Status badge colors mapping - DEPRECATED: Now using MeetingStatusBadge component
// Kept for reference only

export const MeetingsTab: React.FC<MeetingsTabProps> = ({ boardId }) => {
  const navigate = useNavigate();
  const { currentBoard, theme } = useBoardContext();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'all'>('all');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<MeetingType | undefined>();
  const [locationTypeFilter, setLocationTypeFilter] = useState<LocationType | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build filter params for API - always filter by the specific board
  const filterParams: MeetingFilterParams = useMemo(() => {
    return {
      search: searchValue || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      boardId: boardId, // Always filter by this specific board
      meetingType: meetingTypeFilter,
      locationType: locationTypeFilter,
      includeCommittees: false, // Only show this board's meetings, not committees
      page,
      pageSize,
    };
  }, [searchValue, statusFilter, boardId, meetingTypeFilter, locationTypeFilter, page, pageSize]);

  // Fetch meetings
  const { data, isLoading, refetch } = useMeetings(filterParams);

  // Location icon helper
  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'virtual':
        return <VideoCameraOutlined style={{ color: theme.infoColor }} />;
      case 'physical':
        return <EnvironmentOutlined style={{ color: theme.successColor }} />;
      case 'hybrid':
        return <HomeOutlined style={{ color: theme.warningColor }} />;
    }
  };

  // Table columns
  const columns: ColumnsType<MeetingListItem> = useMemo(() => [
    {
      title: 'Date & Time',
      dataIndex: 'meetingDate',
      key: 'meetingDate',
      width: 130,
      sorter: true,
      render: (_: string, record) => {
        const startDateTime = dayjs(`${record.startDate} ${record.startTime}`);
        const endDateTime = startDateTime.add(record.duration, 'minute');
        const startTimeFormatted = startDateTime.format('h:mm A');
        const endTimeFormatted = endDateTime.format('h:mm A');

        return (
          <Space direction="vertical" size={2}>
            <div style={{ fontWeight: 500 }}>{dayjs(record.startDate).format('DD MMM YYYY')}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {startTimeFormatted} - {endTimeFormatted}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({record.duration}min)
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Meeting Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true,
      render: (title: string) => (
        <div style={{ fontWeight: 500 }}>{title}</div>
      ),
    },
    {
      title: 'Location & Type',
      key: 'locationAndType',
      width: 180,
      render: (_, record) => {
        const locationDisplay = record.locationType === 'physical'
          ? record.physicalLocation
          : record.locationType === 'hybrid'
          ? record.physicalLocation || record.meetingLink
          : record.meetingLink;

        return (
          <Flex gap={8} align="flex-start">
            <div style={{ fontSize: 20, lineHeight: '1', marginTop: 4 }}>
              {getLocationIcon(record.locationType)}
            </div>
            <Space direction="vertical" size={2} style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13 }}>
                {LOCATION_TYPE_LABELS[record.locationType]}
              </Text>
              <MeetingStatusBadge
                status={record.status}
                subStatus={record.subStatus}
                style={{ fontSize: 11 }}
              />
            </Space>
          </Flex>
        );
      },
    },
    {
      title: 'Participants',
      dataIndex: 'participantCount',
      key: 'participantCount',
      width: 90,
      align: 'center',
      render: (count: number, record) => (
        <Tooltip
          title={
            <div>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>Participants</div>
              <div>{count} of {record.expectedAttendees} invited</div>
            </div>
          }
        >
          <Space size={4} style={{ cursor: 'help' }}>
            <TeamOutlined />
            <span>{count}/{record.expectedAttendees}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: theme.primaryColor }} />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${currentBoard?.id}/meetings/${record.id}`);
              }}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ color: '#1890ff' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${currentBoard?.id}/meetings/${record.id}/edit`);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ], [navigate, currentBoard?.id, theme, getLocationIcon]);

  // Handle row click
  const handleRowClick = useCallback((record: MeetingListItem) => {
    navigate(`/${currentBoard?.id}/meetings/${record.id}`);
  }, [navigate, currentBoard?.id]);

  // Handle table change (pagination)
  const handleTableChange = useCallback((pagination: any) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  }, []);

  // Handle create meeting
  const handleCreateMeeting = useCallback(() => {
    navigate(`/${currentBoard?.id}/meetings/create?boardId=${boardId}`);
  }, [navigate, currentBoard?.id, boardId]);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Header with Create Button */}
        <Flex justify="space-between" align="center">
          <div>
            <Text strong style={{ fontSize: 16 }}>Board Meetings</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Meetings scheduled for this board
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateMeeting}
          >
            Schedule Meeting
          </Button>
        </Flex>

        {/* Filters */}
        <Flex gap={12} wrap="wrap">
          <Input.Search
            placeholder="Search meetings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />

          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            style={{ width: 160 }}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Pending', value: 'pending_confirmation' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
          />

          <Select
            placeholder="Meeting Type"
            value={meetingTypeFilter}
            onChange={(value) => {
              setMeetingTypeFilter(value);
              setPage(1);
            }}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'All Types', value: undefined },
              { label: 'Regular', value: 'regular' },
              { label: 'Special', value: 'special' },
              { label: 'Emergency', value: 'emergency' },
              { label: 'Committee', value: 'committee' },
            ]}
          />

          <Select
            placeholder="Location"
            value={locationTypeFilter}
            onChange={(value) => {
              setLocationTypeFilter(value);
              setPage(1);
            }}
            allowClear
            style={{ width: 130 }}
            options={[
              { label: 'All Locations', value: undefined },
              { label: 'Virtual', value: 'virtual' },
              { label: 'Physical', value: 'physical' },
              { label: 'Hybrid', value: 'hybrid' },
            ]}
          />

          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
          </Tooltip>
        </Flex>

        {/* Meetings Table */}
        <DataTable<MeetingListItem>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} meetings`,
          }}
          onChange={handleTableChange}
          onRowClick={handleRowClick}
        />
      </Space>
    </div>
  );
};

export default MeetingsTab;
