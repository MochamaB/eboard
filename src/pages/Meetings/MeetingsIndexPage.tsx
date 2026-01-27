/**
 * Meetings Index Page
 * List and manage meetings with filtering, search, and multiple views (table, calendar, cards)
 * Based on docs/MODULES/Module03_MeetingManagement pattern
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  Space,
  Tag,
  Tooltip,
  message,
  Typography,
  Input,
  Select,
  Segmented,
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
  DownloadOutlined,
  TableOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useBoardContext } from '../../contexts';
import { useMeetings } from '../../hooks/api';
import { DataTable, IndexPageLayout, type TabItem } from '../../components/common';
import { MeetingCard, MeetingsCalendarView } from '../../components/Meetings';
import type {
  MeetingListItem,
  MeetingStatus,
  MeetingType,
  LocationType,
  MeetingFilterParams,
} from '../../types/meeting.types';
import {
  MEETING_STATUS_LABELS,
  MEETING_STATUS_COLORS,
  MEETING_TYPE_LABELS,
  LOCATION_TYPE_LABELS,
} from '../../types/meeting.types';

dayjs.extend(relativeTime);

const { Text } = Typography;

// View mode type
type ViewMode = 'table' | 'calendar' | 'cards';

// Status badge colors mapping
const STATUS_BADGE_COLORS: Record<MeetingStatus, string> = {
  draft: 'default',
  pending_confirmation: 'warning',
  confirmed: 'blue',
  scheduled: 'cyan',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
  rejected: 'error',
};

export const MeetingsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBoard, activeCommittee, theme, viewMode: boardViewMode, allBoards } = useBoardContext();

  // Check if we're in "View All" mode (route is /all/meetings)
  const isAllBoardsView = location.pathname.startsWith('/all/');

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('upcoming');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<MeetingType | undefined>();
  const [locationTypeFilter, setLocationTypeFilter] = useState<LocationType | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Board filter for "View All" mode - allows filtering by specific board
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();

  // Reset filters when board changes or view mode changes
  useEffect(() => {
    setStatusFilter('upcoming');
    setMeetingTypeFilter(undefined);
    setLocationTypeFilter(undefined);
    setSearchValue('');
    setPage(1);
    setSelectedBoardId(undefined);
  }, [currentBoard?.id, isAllBoardsView]);

  // Determine boardId filter based on view mode and active committee
  const boardIdFilter = useMemo(() => {
    // In "View All" mode, use selectedBoardId if set, otherwise undefined (all boards)
    if (isAllBoardsView || boardViewMode === 'all') {
      return selectedBoardId; // undefined = all boards, or specific board if selected
    }
    
    // In single board mode
    if (activeCommittee === 'all') {
      return currentBoard?.id; // Show board + committees
    }
    if (activeCommittee === 'board') {
      return currentBoard?.id; // Show only board
    }
    return activeCommittee; // Specific committee
  }, [activeCommittee, currentBoard?.id, isAllBoardsView, boardViewMode, selectedBoardId]);

  // Build filter params for API
  const filterParams: MeetingFilterParams = useMemo(() => {
    // Map status filter to actual statuses
    let statusParam: MeetingStatus | MeetingStatus[] | undefined;
    if (statusFilter === 'upcoming') {
      statusParam = ['confirmed', 'scheduled'] as MeetingStatus[];
    } else if (statusFilter === 'cancelled') {
      // Cancelled tab includes both cancelled and rejected
      statusParam = ['cancelled', 'rejected'] as MeetingStatus[];
    } else if (statusFilter !== 'all') {
      statusParam = statusFilter as MeetingStatus;
    }

    return {
      search: searchValue || undefined,
      status: statusParam,
      boardId: boardIdFilter,
      meetingType: meetingTypeFilter,
      locationType: locationTypeFilter,
      includeCommittees: activeCommittee === 'all',
      page,
      pageSize,
    };
  }, [searchValue, statusFilter, boardIdFilter, meetingTypeFilter, locationTypeFilter, activeCommittee, page, pageSize]);

  // Fetch meetings with status filter for display
  const { data, isLoading, refetch } = useMeetings(filterParams);

  // Fetch all meetings (without status filter) for tab counts
  const countParams = useMemo(() => ({
    boardId: boardIdFilter,
    includeCommittees: activeCommittee === 'all',
    pageSize: 1000, // Get all for counting
  }), [boardIdFilter, activeCommittee]);
  
  const { data: allMeetingsData } = useMeetings(countParams);

  // Status tabs with counts - ALL tab is last
  const statusTabs = useMemo(() => {
    const allMeetings = allMeetingsData?.data || [];
    const total = allMeetingsData?.total || 0;

    const getCount = (statuses: MeetingStatus[]) =>
      allMeetings.filter(m => statuses.includes(m.status)).length;

    return [
      { key: 'upcoming', label: 'Upcoming', icon: <CalendarOutlined />, count: getCount(['confirmed', 'scheduled']) },
      { key: 'pending_confirmation', label: 'Pending', icon: <ClockCircleOutlined />, count: getCount(['pending_confirmation']) },
      { key: 'draft', label: 'Draft', icon: <EditOutlined />, count: getCount(['draft']) },
      { key: 'in_progress', label: 'In Progress', icon: <PlayCircleOutlined />, count: getCount(['in_progress']) },
      { key: 'completed', label: 'Completed', icon: <CheckCircleOutlined />, count: getCount(['completed']) },
      { key: 'cancelled', label: 'Cancelled', icon: <StopOutlined />, count: getCount(['cancelled', 'rejected']) },
      { key: 'all', label: 'All', icon: <AppstoreOutlined />, count: total },
    ];
  }, [allMeetingsData]);

  // Handle status tab change
  const handleStatusTabChange = useCallback((key: string) => {
    setStatusFilter(key);
    setPage(1);
  }, []);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

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
        // Calculate end time from startTime + duration and format with AM/PM
        const startDateTime = dayjs(`${record.startDate} ${record.startTime}`);
        const endDateTime = startDateTime.add(record.duration, 'minute');
        const startTimeFormatted = startDateTime.format('h:mm A');
        const endTimeFormatted = endDateTime.format('h:mm A');
        
        return (
          <Space orientation="vertical" size={2}>
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
      width: 280,
      ellipsis: true,
      render: (title: string, record) => (
        <Space orientation="vertical" size={2} style={{ width: '100%', minWidth: 200, maxWidth: 350 }}>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.boardName}
          </Text>
        </Space>
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
            <Space orientation="vertical" size={2} style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13 }}>
                {LOCATION_TYPE_LABELS[record.locationType]}
              </Text>
              <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                {MEETING_TYPE_LABELS[record.meetingType]}
              </Tag>
              {(record.locationType === 'physical' || record.locationType === 'hybrid') && locationDisplay && (
                <Text type="secondary" style={{ fontSize: 10 }} ellipsis={{ tooltip: locationDisplay }}>
                  {locationDisplay}
                </Text>
              )}
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
              <div style={{ marginTop: 4, fontSize: 11 }}>
                Quorum: {record.quorumRequired} ({record.quorumPercentage}%)
              </div>
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
    // Status column - only visible on 'all' tab
    ...(statusFilter === 'all' ? [{
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: MeetingStatus) => (
        <Badge
          status={STATUS_BADGE_COLORS[status] as any}
          text={MEETING_STATUS_LABELS[status]}
        />
      ),
    }] : []),
    {
      title: '',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const status = record.status;
        
        // Define action handlers
        const handleView = (e: React.MouseEvent) => {
          e.stopPropagation();
          navigate(`/${currentBoard?.id}/meetings/${record.id}`);
        };
        
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          navigate(`/${currentBoard?.id}/meetings/${record.id}/edit`);
        };
        
        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('Delete meeting functionality coming soon');
        };
        
        const handleSubmit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('Submit for approval functionality coming soon');
        };
        
        const handleApprove = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('Approve meeting functionality coming soon');
        };
        
        const handleReject = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('Reject meeting functionality coming soon');
        };
        
        const handleCancel = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('Cancel meeting functionality coming soon');
        };
        
        const handleReschedule = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('Reschedule meeting functionality coming soon');
        };
        
        const handleStart = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('Start meeting functionality coming soon');
        };
        
        const handleEnd = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.info('End meeting functionality coming soon');
        };

        // Render actions based on status
        return (
          <Space size={0}>
            {/* View - Always visible */}
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined style={{ color: theme.primaryColor }} />}
                onClick={handleView}
              />
            </Tooltip>

            {/* Draft actions */}
            {status === 'draft' && (
              <>
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined style={{ color: '#1890ff' }} />}
                    onClick={handleEdit}
                  />
                </Tooltip>
                <Tooltip title="Submit for Approval">
                  <Button
                    type="text"
                    size="small"
                    icon={<SendOutlined style={{ color: '#52c41a' }} />}
                    onClick={handleSubmit}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  />
                </Tooltip>
              </>
            )}

            {/* Pending confirmation actions */}
            {status === 'pending_confirmation' && (
              <>
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined style={{ color: '#1890ff' }} />}
                    onClick={handleEdit}
                  />
                </Tooltip>
                <Tooltip title="Approve">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                    onClick={handleApprove}
                  />
                </Tooltip>
                <Tooltip title="Reject">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={handleReject}
                  />
                </Tooltip>
              </>
            )}

            {/* Confirmed actions */}
            {status === 'confirmed' && (
              <>
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined style={{ color: '#1890ff' }} />}
                    onClick={handleEdit}
                  />
                </Tooltip>
                <Tooltip title="Reschedule">
                  <Button
                    type="text"
                    size="small"
                    icon={<CalendarOutlined style={{ color: '#faad14' }} />}
                    onClick={handleReschedule}
                  />
                </Tooltip>
                <Tooltip title="Cancel">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<StopOutlined />}
                    onClick={handleCancel}
                  />
                </Tooltip>
              </>
            )}

            {/* Scheduled actions */}
            {status === 'scheduled' && (
              <>
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined style={{ color: '#1890ff' }} />}
                    onClick={handleEdit}
                  />
                </Tooltip>
                <Tooltip title="Start Meeting">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
                    onClick={handleStart}
                  />
                </Tooltip>
                <Tooltip title="Reschedule">
                  <Button
                    type="text"
                    size="small"
                    icon={<CalendarOutlined style={{ color: '#faad14' }} />}
                    onClick={handleReschedule}
                  />
                </Tooltip>
                <Tooltip title="Cancel">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<StopOutlined />}
                    onClick={handleCancel}
                  />
                </Tooltip>
              </>
            )}

            {/* In progress actions */}
            {status === 'in_progress' && (
              <Tooltip title="End Meeting">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  onClick={handleEnd}
                />
              </Tooltip>
            )}

            {/* Completed - View only, add download minutes */}
            {status === 'completed' && (
              <Tooltip title="Download Minutes">
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined style={{ color: '#1890ff' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    message.info('Download minutes functionality coming soon');
                  }}
                />
              </Tooltip>
            )}

            {/* Cancelled/Rejected - can reschedule (create new) */}
            {(status === 'cancelled' || status === 'rejected') && (
              <Tooltip title="Reschedule (Create New)">
                <Button
                  type="text"
                  size="small"
                  icon={<CalendarOutlined style={{ color: '#faad14' }} />}
                  onClick={handleReschedule}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ], [navigate, currentBoard?.id, theme, getLocationIcon, statusFilter]);

  // Handle row click
  const handleRowClick = useCallback((record: MeetingListItem) => {
    navigate(`/${currentBoard?.id}/meetings/${record.id}`);
  }, [navigate, currentBoard?.id]);

  // Handle table change (pagination)
  const handleTableChange = useCallback((pagination: any) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
  }, []);

  // Handle create meeting
  const handleCreateMeeting = useCallback(() => {
    navigate(`/${currentBoard?.id}/meetings/create`);
  }, [navigate, currentBoard?.id]);

  // Handle export
  const handleExport = useCallback(() => {
    message.info('Export functionality coming soon');
  }, []);

  // Tab items for IndexPageLayout
  const tabs: TabItem[] = statusTabs.map(tab => ({
    key: tab.key,
    label: tab.label,
    icon: tab.icon,
    count: tab.count,
  }));

  return (
    <IndexPageLayout
      title="Meetings"
      subtitle={`Manage and schedule meetings for ${currentBoard?.name}`}
      subtitleAll="Manage and schedule meetings across all boards"
      tabs={tabs}
      activeTab={statusFilter}
      onTabChange={handleStatusTabChange}
      primaryActionLabel="Schedule Meeting"
      onPrimaryAction={handleCreateMeeting}
    >

      {/* Filters and View Switcher */}
      <Flex justify="space-between" align="center" gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
        {/* Search and Filters */}
        <Flex gap={12} wrap="wrap" flex={1}>
          <Input.Search
            placeholder="Search meetings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            allowClear
            style={{ width: 280 }}
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

          <Select
            placeholder="Meeting Type"
            value={meetingTypeFilter}
            onChange={(value) => {
              setMeetingTypeFilter(value);
              setPage(1);
            }}
            allowClear
            style={{ width: 160 }}
            options={[
              { label: 'All Types', value: undefined },
              { label: 'Regular', value: 'regular' },
              { label: 'Special', value: 'special' },
              { label: 'Emergency', value: 'emergency' },
              { label: 'Committee', value: 'committee' },
            ]}
          />

          <Select
            placeholder="Location Type"
            value={locationTypeFilter}
            onChange={(value) => {
              setLocationTypeFilter(value);
              setPage(1);
            }}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'All Locations', value: undefined },
              { label: 'Virtual', value: 'virtual' },
              { label: 'Physical', value: 'physical' },
              { label: 'Hybrid', value: 'hybrid' },
            ]}
          />
        </Flex>

        {/* View Switcher and Actions */}
        <Flex gap={12} align="center">
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              { label: 'Table', value: 'table', icon: <TableOutlined /> },
              { label: 'Calendar', value: 'calendar', icon: <CalendarOutlined /> },
              { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
            ]}
          />

          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
          </Tooltip>

          <Tooltip title="Export">
            <Button icon={<DownloadOutlined />} onClick={handleExport} />
          </Tooltip>
        </Flex>
      </Flex>

      {/* View Content */}
      {viewMode === 'table' && (
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
      )}

      {viewMode === 'calendar' && (
        <MeetingsCalendarView
          meetings={data?.data || []}
          loading={isLoading}
          onDateClick={(date) => {
            // Navigate to create meeting with pre-filled date
            const dateStr = date.toISOString().split('T')[0];
            navigate(`/${currentBoard?.id}/meetings/create?date=${dateStr}`);
          }}
        />
      )}

      {viewMode === 'cards' && (
        <>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Text type="secondary">Loading meetings...</Text>
            </div>
          ) : (data?.data || []).length === 0 ? (
            <div style={{
              padding: 48,
              textAlign: 'center',
              background: '#fafafa',
              borderRadius: 4,
              border: '1px dashed #d9d9d9'
            }}>
              <AppstoreOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
              <div>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  No meetings found
                </Text>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
              }}
            >
              {(data?.data || []).map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  showActions
                />
              ))}
            </div>
          )}
          
          {/* Pagination for cards view */}
          {(data?.total || 0) > pageSize && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Text type="secondary">
                Showing {Math.min(pageSize, data?.data?.length || 0)} of {data?.total || 0} meetings
              </Text>
            </div>
          )}
        </>
      )}
    </IndexPageLayout>
  );
};

export default MeetingsIndexPage;
