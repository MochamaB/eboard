/**
 * Meetings Index Page
 * List and manage meetings with filtering, search, and multiple views (table, calendar, cards)
 * Based on docs/MODULES/Module03_MeetingManagement pattern
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Input,
  Select,
  Segmented,
  Flex,
  Dropdown,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import type { MenuProps } from 'antd';
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
  MoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useBoardContext } from '../../contexts';
import { useResponsive } from '../../hooks';
import { useMeetings } from '../../hooks/api';
import { DataTable, IndexPageLayout, type TabItem } from '../../components/common';
import { MeetingStatusBadge, BoardCommitteeSelector, MeetingCard, MeetingDateTimeCard, MeetingsCalendarView, BoardPackStatusCell } from '../../components/Meetings';
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

// Status badge colors mapping - DEPRECATED: Now using MeetingStatusBadge component
// Kept for reference only
// const STATUS_BADGE_COLORS: Record<MeetingStatus, string> = {
//   draft: 'default',
//   scheduled: 'cyan',
//   in_progress: 'processing',
//   completed: 'success',
//   cancelled: 'error',
// };

export const MeetingsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentBoard, activeCommittee, theme, viewMode: boardViewMode, allBoards } = useBoardContext();
  const { isMobile } = useResponsive();

  // Check if we're in "View All" mode (route is /all/meetings)
  const isAllBoardsView = location.pathname.startsWith('/all/');

  // View mode state - default to cards on mobile
  const [viewMode, setViewMode] = useState<ViewMode>(() => isMobile ? 'cards' : 'table');

  // Force cards view on mobile (table is not suitable for small screens)
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('cards');
    }
  }, [isMobile, viewMode]);

  // Smart default tab selection based on priority
  const getSmartDefaultTab = useCallback((meetings: MeetingListItem[] | undefined) => {
    if (!meetings || meetings.length === 0) return 'all';
    
    // Priority 1: If any meeting is in progress, show that
    const hasInProgress = meetings.some(m => m.status === 'in_progress');
    if (hasInProgress) return 'in_progress';
    
    // Priority 2: If any pending approval, show that
    const hasPendingApproval = meetings.some(m => m.status === 'scheduled' && m.subStatus === 'pending_approval');
    if (hasPendingApproval) return 'pending_approval';
    
    // Priority 3: If any upcoming meetings, show that
    const hasUpcoming = meetings.some(m => m.status === 'scheduled' && m.subStatus === 'approved');
    if (hasUpcoming) return 'upcoming';
    
    // Priority 4: If any drafts, show that
    const hasDrafts = meetings.some(m => m.status === 'draft');
    if (hasDrafts) return 'drafts';
    
    // Default: Show all
    return 'all';
  }, []);

  // State management with URL persistence
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    // Read from URL query params first
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      return tabFromUrl;
    }
    // Default to 'in_progress' - will be updated by smart default when data loads
    return 'in_progress';
  });
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<MeetingType | undefined>();
  const [locationTypeFilter, setLocationTypeFilter] = useState<LocationType | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Board filter for "View All" mode - allows filtering by specific board
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();

  // Reset filters when board changes or view mode changes
  useEffect(() => {
    // Don't reset statusFilter - let smart default handle it
    // Only reset if there's no URL param
    const tabFromUrl = searchParams.get('tab');
    if (!tabFromUrl) {
      // Will be set by smart default when data loads
      setStatusFilter('in_progress');
    }
    setMeetingTypeFilter(undefined);
    setLocationTypeFilter(undefined);
    setSearchValue('');
    setPage(1);
  }, [currentBoard?.id, activeCommittee, isAllBoardsView, searchParams]);

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
    // Map status filter to actual statuses and subStatuses
    let statusParam: MeetingStatus | MeetingStatus[] | undefined;
    let subStatusParam: string | string[] | undefined;
    
    if (statusFilter === 'drafts') {
      statusParam = 'draft';
      // Show both incomplete and complete drafts
    } else if (statusFilter === 'pending_approval') {
      statusParam = 'scheduled';
      subStatusParam = 'pending_approval';
    } else if (statusFilter === 'upcoming') {
      statusParam = 'scheduled';
      subStatusParam = 'approved';
    } else if (statusFilter === 'in_progress') {
      statusParam = 'in_progress';
    } else if (statusFilter === 'past') {
      // Past includes completed (recent + archived) and cancelled
      statusParam = ['completed', 'cancelled'] as MeetingStatus[];
    } else if (statusFilter !== 'all') {
      statusParam = statusFilter as MeetingStatus;
    }

    return {
      search: searchValue || undefined,
      status: statusParam,
      subStatus: subStatusParam,
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

  // Update default tab when data loads (only if no URL param and still on initial state)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    // Only apply smart default if:
    // 1. Data is loaded
    // 2. No tab in URL
    // 3. Still on initial 'in_progress' state
    if (allMeetingsData?.data && !tabFromUrl && statusFilter === 'in_progress') {
      const smartDefault = getSmartDefaultTab(allMeetingsData.data);
      setStatusFilter(smartDefault);
      // Update URL with smart default
      setSearchParams({ tab: smartDefault }, { replace: true });
    }
  }, [allMeetingsData?.data, getSmartDefaultTab, statusFilter, searchParams, setSearchParams]);

  // Status tabs with counts - Ordered by time-sensitive priority
  const statusTabs = useMemo(() => {
    const allMeetings = allMeetingsData?.data || [];
    const total = allMeetingsData?.total || 0;

    const getCount = (status: MeetingStatus, subStatus?: string | string[]) => {
      return allMeetings.filter(m => {
        if (m.status !== status) return false;
        if (!subStatus) return true;
        if (Array.isArray(subStatus)) {
          return subStatus.includes(m.subStatus || '');
        }
        return m.subStatus === subStatus;
      }).length;
    };

    const getPastCount = () => {
      return allMeetings.filter(m => 
        m.status === 'completed' || m.status === 'cancelled'
      ).length;
    };

    // Time-sensitive priority order: In Progress → Pending Approval → Upcoming → Drafts → Past → All
    return [
      { key: 'in_progress', label: 'In Progress', icon: <PlayCircleOutlined />, count: getCount('in_progress') },
      { key: 'pending_approval', label: 'Pending Approval', icon: <ClockCircleOutlined />, count: getCount('scheduled', 'pending_approval') },
      { key: 'upcoming', label: 'Upcoming', icon: <CalendarOutlined />, count: getCount('scheduled', 'approved') },
      { key: 'drafts', label: 'Drafts', icon: <EditOutlined />, count: getCount('draft') },
      { key: 'past', label: 'Past', icon: <CheckCircleOutlined />, count: getPastCount() },
      { key: 'all', label: 'All', icon: <AppstoreOutlined />, count: total },
    ];
  }, [allMeetingsData]);

  // Handle status tab change - update both state and URL
  const handleStatusTabChange = useCallback((key: string) => {
    setStatusFilter(key);
    setPage(1);
    // Update URL query params
    setSearchParams({ tab: key }, { replace: true });
  }, [setSearchParams]);

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
      width: 160,
      sorter: true,
      render: (_: string, record) => {
        return <MeetingDateTimeCard meeting={record} />;
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
    // Board Pack column
    {
      title: 'Board Pack',
      key: 'boardPack',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <BoardPackStatusCell
          meetingId={record.id}
          boardId={currentBoard?.id || record.boardId}
          boardPackStatus={record.boardPackStatus}
          meetingStatus={record.status}
        />
      ),
    },
    // Actions dropdown
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center',
      render: (_, record) => {
        const status = record.status;
        
        // Build menu items based on status
        const getMenuItems = (): MenuProps['items'] => {
          const items: MenuProps['items'] = [
            {
              key: 'view',
              label: 'View Details',
              icon: <EyeOutlined />,
              onClick: () => navigate(`/${currentBoard?.id}/meetings/${record.id}`),
            },
          ];

          // Draft actions
          if (status === 'draft') {
            items.push(
              { type: 'divider' },
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => navigate(`/${currentBoard?.id}/meetings/${record.id}/edit`),
              },
              {
                key: 'submit',
                label: 'Submit for Approval',
                icon: <SendOutlined />,
                onClick: () => message.info('Submit for approval functionality coming soon'),
                disabled: record.subStatus === 'incomplete',
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => message.info('Delete meeting functionality coming soon'),
              },
            );
          }

          // Pending approval actions (scheduled.pending_approval)
          if (status === 'scheduled' && record.subStatus === 'pending_approval') {
            items.push(
              { type: 'divider' },
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => navigate(`/${currentBoard?.id}/meetings/${record.id}/edit`),
              },
              {
                key: 'approve',
                label: 'Approve',
                icon: <CheckOutlined style={{ color: '#52c41a' }} />,
                onClick: () => message.info('Approve meeting functionality coming soon'),
              },
              {
                key: 'reject',
                label: 'Reject',
                icon: <CloseOutlined />,
                danger: true,
                onClick: () => message.info('Reject meeting functionality coming soon'),
              },
            );
          }

          // Approved scheduled actions (scheduled.approved)
          if (status === 'scheduled' && record.subStatus === 'approved') {
            items.push(
              { type: 'divider' },
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => navigate(`/${currentBoard?.id}/meetings/${record.id}/edit`),
              },
              {
                key: 'reschedule',
                label: 'Reschedule',
                icon: <CalendarOutlined />,
                onClick: () => message.info('Reschedule meeting functionality coming soon'),
              },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'Cancel Meeting',
                icon: <StopOutlined />,
                danger: true,
                onClick: () => message.info('Cancel meeting functionality coming soon'),
              },
            );
          }

          // Scheduled actions
          if (status === 'scheduled') {
            items.push(
              { type: 'divider' },
              {
                key: 'start',
                label: 'Start Meeting',
                icon: <PlayCircleOutlined style={{ color: '#52c41a' }} />,
                onClick: () => message.info('Start meeting functionality coming soon'),
              },
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => navigate(`/${currentBoard?.id}/meetings/${record.id}/edit`),
              },
              {
                key: 'reschedule',
                label: 'Reschedule',
                icon: <CalendarOutlined />,
                onClick: () => message.info('Reschedule meeting functionality coming soon'),
              },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'Cancel Meeting',
                icon: <StopOutlined />,
                danger: true,
                onClick: () => message.info('Cancel meeting functionality coming soon'),
              },
            );
          }

          // In progress actions
          if (status === 'in_progress') {
            items.push(
              { type: 'divider' },
              {
                key: 'end',
                label: 'End Meeting',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                onClick: () => message.info('End meeting functionality coming soon'),
              },
            );
          }

          // Completed actions
          if (status === 'completed') {
            items.push(
              { type: 'divider' },
              {
                key: 'download',
                label: 'Download Minutes',
                icon: <DownloadOutlined />,
                onClick: () => message.info('Download minutes functionality coming soon'),
              },
            );
          }

          // Cancelled or Rejected actions
          if (status === 'cancelled' || (status === 'scheduled' && record.subStatus === 'rejected')) {
            items.push(
              { type: 'divider' },
              {
                key: 'reschedule',
                label: 'Reschedule (Create New)',
                icon: <CalendarOutlined />,
                onClick: () => message.info('Reschedule meeting functionality coming soon'),
              },
            );
          }

          return items;
        };

        return (
          <Dropdown
            menu={{ items: getMenuItems() }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
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
      <Flex
        vertical={isMobile}
        justify="space-between"
        align={isMobile ? 'stretch' : 'center'}
        gap={isMobile ? 8 : 12}
        style={{ marginBottom: 16 }}
      >
        {/* Search and Filters */}
        <Flex gap={8} wrap="wrap" flex={isMobile ? undefined : 1}>
          <Input.Search
            placeholder="Search meetings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            allowClear
            style={{ width: isMobile ? '100%' : 280 }}
          />

          {/* On mobile: stack selects side by side */}
          <Flex gap={8} style={{ width: isMobile ? '100%' : undefined }}>
            <Select
              placeholder="Type"
              value={meetingTypeFilter}
              onChange={(value) => {
                setMeetingTypeFilter(value);
                setPage(1);
              }}
              allowClear
              style={{ flex: isMobile ? 1 : undefined, width: isMobile ? undefined : 160 }}
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
              style={{ flex: isMobile ? 1 : undefined, width: isMobile ? undefined : 140 }}
              options={[
                { label: 'All Locations', value: undefined },
                { label: 'Virtual', value: 'virtual' },
                { label: 'Physical', value: 'physical' },
                { label: 'Hybrid', value: 'hybrid' },
              ]}
            />
          </Flex>
        </Flex>

        {/* View Switcher and Actions */}
        <Flex gap={8} align="center" justify={isMobile ? 'space-between' : undefined}>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={
              isMobile
                ? [
                    { value: 'calendar', icon: <CalendarOutlined /> },
                    { value: 'cards', icon: <AppstoreOutlined /> },
                  ]
                : [
                    { label: 'Table', value: 'table', icon: <TableOutlined /> },
                    { label: 'Calendar', value: 'calendar', icon: <CalendarOutlined /> },
                    { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
                  ]
            }
          />

          <Flex gap={8}>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Tooltip>

            <Tooltip title="Export">
              <Button icon={<DownloadOutlined />} onClick={handleExport} />
            </Tooltip>
          </Flex>
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
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: isMobile ? 12 : 16,
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
