/**
 * Approvals Index Page
 * Lists all meetings pending confirmation for the current approver
 * Follows the same pattern as MeetingsIndexPage for board context and filtering
 * Fully responsive - card-based layout for mobile/tablet
 */

import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Tag, 
  Button, 
  Card, 
  Space, 
  Typography, 
  Empty,
  Spin,
  Tooltip,
  Badge,
  Divider,
  Grid,
  Flex,
  Segmented,
} from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import { 
  CheckCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  RightOutlined,
  TableOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../contexts';
import { usePendingConfirmations } from '../../hooks/api/useMeetings';
import { DataTable } from '../../components/common';
import { MeetingDateTimeCard, MeetingsCalendarView, MeetingCard } from '../../components/Meetings';
import type { MeetingListItem, LocationType } from '../../types/meeting.types';
import { 
  MEETING_TYPE_LABELS, 
  LOCATION_TYPE_LABELS,
} from '../../types/meeting.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Location icon helper for mobile card (standalone version)
const getLocationIconStatic = (type: LocationType) => {
  switch (type) {
    case 'virtual':
      return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
    case 'physical':
      return <EnvironmentOutlined style={{ color: '#52c41a' }} />;
    case 'hybrid':
      return <HomeOutlined style={{ color: '#722ed1' }} />;
  }
};

// Mobile approval card component
interface ApprovalCardProps {
  meeting: MeetingListItem;
  onReview: (id: string) => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ meeting, onReview }) => {
  return (
    <Card 
      size="small" 
      style={{ marginBottom: 12 }}
      hoverable
      onClick={() => onReview(meeting.id)}
    >
      {/* Header: Date and Location Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Space size={4}>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text style={{ fontSize: 13 }}>{dayjs(meeting.startDate).format('DD MMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>• {meeting.startTime}</Text>
        </Space>
        <Space size={4}>
          {getLocationIconStatic(meeting.locationType)}
          <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
            {MEETING_TYPE_LABELS[meeting.meetingType]}
          </Tag>
        </Space>
      </div>

      {/* Title */}
      <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>
        {meeting.title}
      </Text>
      
      {/* Board name */}
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        {meeting.boardName}
        {meeting.parentBoardName && ` • ${meeting.parentBoardName}`}
      </Text>

      {/* Footer: Participants, Submitted, Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Space split={<Divider type="vertical" style={{ margin: '0 4px' }} />}>
          <Space size={4}>
            <TeamOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {meeting.participantCount}/{meeting.expectedAttendees}
            </Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(meeting.createdAt).fromNow()}
          </Text>
        </Space>
        <Button 
          type="primary" 
          size="small"
          icon={<RightOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onReview(meeting.id);
          }}
        >
          Review
        </Button>
      </div>
    </Card>
  );
};

type ViewMode = 'table' | 'calendar' | 'cards';

export const ApprovalsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const { currentBoard, activeCommittee, viewMode: boardViewMode, theme } = useBoardContext();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Location icon helper (same as MeetingsIndexPage)
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

  // Responsive: show cards on mobile/tablet (< lg), table on desktop
  const isMobile = !screens.lg;

  // Check if we're in "View All" mode (route is /all/approvals)
  const isAllBoardsView = location.pathname.startsWith('/all/');

  // Determine boardId filter based on view mode and active committee (same logic as MeetingsIndexPage)
  const boardIdFilter = useMemo(() => {
    // In "View All" mode, show all boards (undefined = no filter)
    if (isAllBoardsView || boardViewMode === 'all') {
      return undefined;
    }
    
    // In single board mode
    if (activeCommittee === 'all') {
      return currentBoard?.id; // Show board + committees
    }
    if (activeCommittee === 'board') {
      return currentBoard?.id; // Show only board
    }
    return activeCommittee; // Specific committee
  }, [activeCommittee, currentBoard?.id, isAllBoardsView, boardViewMode]);

  // Include committees when viewing all for a board
  const includeCommittees = activeCommittee === 'all' && !isAllBoardsView && boardViewMode !== 'all';

  const { data, isLoading, error } = usePendingConfirmations(boardIdFilter, includeCommittees);
  
  const pendingMeetings = data?.data || [];

  const handleReview = (meetingId: string) => {
    // Navigate using currentBoard or 'all' for View All mode
    const navBoardId = isAllBoardsView ? 'all' : currentBoard?.id;
    navigate(`/${navBoardId}/approvals/${meetingId}`);
  };

  const handleViewMeeting = (meetingId: string, meetingBoardId: string) => {
    navigate(`/${meetingBoardId}/meetings/${meetingId}`);
  };

  // Table columns - matching MeetingsIndexPage structure
  const columns: ColumnsType<MeetingListItem> = useMemo(() => [
    {
      title: 'Date & Time',
      dataIndex: 'meetingDate',
      key: 'meetingDate',
      width: 160,
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
        <Space direction="vertical" size={2} style={{ width: '100%', minWidth: 200, maxWidth: 350 }}>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.boardName}
            {record.parentBoardName && ` • ${record.parentBoardName}`}
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
            <Space direction="vertical" size={2} style={{ flex: 1 }}>
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
    {
      title: '',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="View Meeting Details">
            <Button 
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: theme.primaryColor }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewMeeting(record.id, record.boardId);
              }}
            />
          </Tooltip>
          <Button 
            type="primary"
            icon={<CheckCircleOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleReview(record.id);
            }}
          >
            Review
          </Button>
        </Space>
      ),
    },
  ], [theme, getLocationIcon, handleReview, handleViewMeeting]);

  if (error) {
    return (
      <Card>
        <Empty
          description="Failed to load pending approvals"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  // Mobile card list view
  const renderMobileView = () => (
    <div>
      {pendingMeetings.map((meeting) => (
        <ApprovalCard
          key={meeting.id}
          meeting={meeting}
          onReview={handleReview}
        />
      ))}
      {pendingMeetings.length > 10 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            Showing {pendingMeetings.length} pending approvals
          </Text>
        </div>
      )}
    </div>
  );

  // Handle row click to navigate to review
  const handleRowClick = (record: MeetingListItem) => {
    handleReview(record.id);
  };

  // Render cards view
  const renderCardsView = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}
    >
      {pendingMeetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onClick={() => handleReview(meeting.id)}
        />
      ))}
    </div>
  );

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      {/* Header with View Switcher */}
      <Flex 
        justify="space-between" 
        align="flex-start" 
        wrap="wrap" 
        gap={16}
        style={{ marginBottom: isMobile ? 16 : 24 }}
      >
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <Title level={isMobile ? 4 : 5} style={{ margin: 0 }}>
              Pending Approvals
            </Title>
            <Badge 
              count={pendingMeetings.length} 
              style={{ backgroundColor: pendingMeetings.length > 0 ? '#faad14' : '#52c41a' }}
            />
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: isMobile ? 13 : 14 }}>
            Review and approve meeting confirmations
          </Text>
        </div>

        {/* View Switcher - only show on desktop */}
        {!isMobile && (
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              { label: 'Table', value: 'table', icon: <TableOutlined /> },
              { label: 'Calendar', value: 'calendar', icon: <CalendarOutlined /> },
              { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
            ]}
          />
        )}
      </Flex>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : pendingMeetings.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={4}>
              <Text>No pending approvals</Text>
              <Text type="secondary">All meeting confirmations have been processed</Text>
            </Space>
          }
        >
          <Button type="primary" onClick={() => navigate(`/${isAllBoardsView ? 'all' : currentBoard?.id}/meetings`)}>
            View All Meetings
          </Button>
        </Empty>
      ) : isMobile ? (
        // Mobile: Always show cards
        renderMobileView()
      ) : (
        // Desktop: Show based on viewMode
        <>
          {viewMode === 'table' && (
            <DataTable<MeetingListItem>
              columns={columns}
              dataSource={pendingMeetings}
              loading={isLoading}
              rowKey="id"
              showSearch={false}
              scroll={{ x: 900 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} pending`,
              }}
              onRowClick={handleRowClick}
            />
          )}

          {viewMode === 'calendar' && (
            <MeetingsCalendarView
              meetings={pendingMeetings}
              loading={isLoading}
              onMeetingClick={(meeting) => handleReview(meeting.id)}
            />
          )}

          {viewMode === 'cards' && renderCardsView()}
        </>
      )}
    </div>
  );
};

export default ApprovalsIndexPage;
