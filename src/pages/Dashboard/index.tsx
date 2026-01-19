import { Row, Col, Card, List, Avatar, Tag, Typography, Space, Button } from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  RightOutlined,
  CheckSquareOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme';

const { Title, Text } = Typography;

// Mock data - My Boards (grid cards as per spec)
const myBoards = [
  { 
    id: '1', 
    name: 'KTDA Main Board', 
    type: 'main',
    memberCount: 15, 
    nextMeeting: { date: 'Feb 15', title: 'Q1 Board Meeting' },
    color: colors.primary,
  },
  { 
    id: '2', 
    name: 'Audit Committee', 
    type: 'committee',
    memberCount: 5, 
    nextMeeting: { date: 'Jan 20', title: 'Q4 Audit Review' },
    color: '#3577f1',
  },
  { 
    id: '3', 
    name: 'KETEPA Limited', 
    type: 'subsidiary',
    memberCount: 8, 
    nextMeeting: { date: 'Jan 25', title: 'Monthly Review' },
    color: '#f06548',
  },
  { 
    id: '4', 
    name: 'Chebut Factory', 
    type: 'factory',
    memberCount: 7, 
    nextMeeting: null,
    color: colors.secondary,
  },
  { 
    id: '5', 
    name: 'Kapkatet Factory', 
    type: 'factory',
    memberCount: 6, 
    nextMeeting: { date: 'Feb 1', title: 'Factory Review' },
    color: colors.secondary,
  },
];

// Quick Stats
const quickStats = {
  meetingsThisWeek: 3,
  pendingActionItems: 5,
  documentsToReview: 2,
  activeVotes: 1,
};

// Upcoming Meetings (grouped by date as per spec)
const upcomingMeetings = [
  {
    id: '1',
    title: 'Q4 Audit Review',
    board: 'Audit Committee',
    date: 'TODAY',
    time: '2:00 PM',
    location: 'Virtual',
    isVirtual: true,
    canJoin: true,
  },
  {
    id: '2',
    title: 'Monthly Board Meeting',
    board: 'KTDA Main Board',
    date: 'TOMORROW',
    time: '10:00 AM',
    location: 'Boardroom 1',
    isVirtual: false,
    canJoin: false,
  },
  {
    id: '3',
    title: 'Budget Review',
    board: 'Finance Committee',
    date: 'JAN 20',
    time: '9:00 AM',
    location: 'Virtual',
    isVirtual: true,
    canJoin: false,
  },
];

// Pending Action Items (grouped by urgency as per spec)
const pendingActions = [
  {
    id: '1',
    title: 'Prepare Q4 budget report',
    board: 'KTDA Main Board',
    dueDate: 'Jan 10',
    status: 'overdue',
  },
  {
    id: '2',
    title: 'Review audit findings',
    board: 'Audit Committee',
    dueDate: 'Jan 16',
    status: 'due_today',
  },
  {
    id: '3',
    title: 'Submit compliance report',
    board: 'KETEPA Limited',
    dueDate: 'Jan 20',
    status: 'due_this_week',
  },
  {
    id: '4',
    title: 'Prepare meeting agenda',
    board: 'Finance Committee',
    dueDate: 'Jan 22',
    status: 'due_this_week',
  },
];

// Recent Documents
const recentDocuments = [
  {
    id: '1',
    title: 'Q4 Financial Report.pdf',
    board: 'KTDA Main Board',
    size: '2.4 MB',
    uploadedAt: '2 hours ago',
  },
  {
    id: '2',
    title: 'Audit Findings Summary.docx',
    board: 'Audit Committee',
    size: '1.1 MB',
    uploadedAt: 'Yesterday',
  },
  {
    id: '3',
    title: 'Board Pack - January 2026.pdf',
    board: 'KTDA Main Board',
    size: '15.2 MB',
    uploadedAt: '2 days ago',
  },
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'overdue':
      return { label: 'OVERDUE', color: colors.error };
    case 'due_today':
      return { label: 'DUE TODAY', color: colors.error };
    case 'due_this_week':
      return { label: 'DUE THIS WEEK', color: colors.warning };
    default:
      return { label: 'UPCOMING', color: colors.textMuted };
  }
};

const getDateColor = (date: string) => {
  if (date === 'TODAY') return colors.info;
  if (date === 'TOMORROW') return colors.primary;
  return colors.textSecondary;
};

export const Dashboard: React.FC = () => {
  return (
    <div>
      {/* Welcome Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Welcome back, John Kamau
          </Title>
          <Text type="secondary">Last login: Today at 9:30 AM</Text>
        </Col>
        <Col>
          <Text type="secondary">Jan 16, 2026</Text>
        </Col>
      </Row>

      {/* Row 1: My Boards (2/3) + Quick Stats (1/3) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* My Boards - Grid of Cards */}
        <Col xs={24} lg={16}>
          <Card
            title="My Boards"
            extra={<a href="/boards">View All <RightOutlined /></a>}
          >
            <Row gutter={[12, 12]}>
              {myBoards.map((board) => (
                <Col xs={12} sm={8} key={board.id}>
                  <Card
                    size="small"
                    hoverable
                    style={{ 
                      borderTop: `3px solid ${board.color}`,
                      height: '100%',
                    }}
                  >
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Avatar 
                        style={{ backgroundColor: board.color }}
                        size="small"
                      >
                        {board.name.charAt(0)}
                      </Avatar>
                      <Text strong style={{ fontSize: 13 }}>{board.name}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {board.memberCount} members
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {board.nextMeeting 
                          ? `Next: ${board.nextMeeting.date}` 
                          : 'No upcoming meetings'}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
              {/* +X more card */}
              <Col xs={12} sm={8}>
                <Card
                  size="small"
                  hoverable
                  style={{ 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: colors.tertiary,
                  }}
                >
                  <Space direction="vertical" align="center">
                    <Text type="secondary">+3 more</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>View all boards</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col xs={24} lg={8}>
          <Card title="Quick Stats" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <CalendarOutlined style={{ fontSize: 20, color: colors.primary }} />
                <div>
                  <Text strong style={{ fontSize: 18 }}>{quickStats.meetingsThisWeek}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>Meetings this week</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <CheckSquareOutlined style={{ fontSize: 20, color: colors.warning }} />
                <div>
                  <Text strong style={{ fontSize: 18 }}>{quickStats.pendingActionItems}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>Pending action items</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <FileTextOutlined style={{ fontSize: 20, color: colors.info }} />
                <div>
                  <Text strong style={{ fontSize: 18 }}>{quickStats.documentsToReview}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>Documents to review</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <CheckCircleOutlined style={{ fontSize: 20, color: colors.success }} />
                <div>
                  <Text strong style={{ fontSize: 18 }}>{quickStats.activeVotes}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>Active vote</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Upcoming Meetings (1/2) + Pending Actions (1/2) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Upcoming Meetings */}
        <Col xs={24} lg={12}>
          <Card
            title="Upcoming Meetings"
            extra={<a href="/meetings">View All <RightOutlined /></a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={upcomingMeetings}
              renderItem={(item) => (
                <List.Item
                  actions={
                    item.canJoin 
                      ? [<Button type="primary" size="small" key="join">Join</Button>]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ textAlign: 'center', minWidth: 50 }}>
                        <Tag color={getDateColor(item.date)} style={{ margin: 0 }}>
                          {item.date}
                        </Tag>
                      </div>
                    }
                    title={item.title}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{item.board}</Text>
                        <Space size="small">
                          <ClockCircleOutlined style={{ fontSize: 12 }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                          {item.isVirtual ? (
                            <><VideoCameraOutlined style={{ fontSize: 12 }} /> <Text type="secondary" style={{ fontSize: 12 }}>Virtual</Text></>
                          ) : (
                            <><EnvironmentOutlined style={{ fontSize: 12 }} /> <Text type="secondary" style={{ fontSize: 12 }}>{item.location}</Text></>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Pending Action Items */}
        <Col xs={24} lg={12}>
          <Card
            title="Pending Action Items"
            extra={<a href="/actions">View All <RightOutlined /></a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={pendingActions}
              renderItem={(item) => {
                const statusInfo = getStatusLabel(item.status);
                return (
                  <List.Item
                    actions={[
                      <Button size="small" key="done" icon={<CheckCircleOutlined />}>
                        Done
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Tag color={statusInfo.color} style={{ fontSize: 10 }}>
                          {statusInfo.label}
                        </Tag>
                      }
                      title={item.title}
                      description={
                        <Text type="secondary">
                          {item.board} • Due: {item.dueDate}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 3: Recent Documents (1/2) + Recent Notifications (1/2) */}
      <Row gutter={[16, 16]}>
        {/* Recent Documents */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Documents"
            extra={<a href="/documents">View All <RightOutlined /></a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentDocuments}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small" key="view">View</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: colors.infoSubtle }}
                        icon={<FileTextOutlined style={{ color: colors.info }} />}
                      />
                    }
                    title={item.title}
                    description={
                      <Text type="secondary">
                        {item.board} • {item.size} • {item.uploadedAt}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Notifications */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Notifications"
            extra={<a href="/notifications">View All <RightOutlined /></a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={[
                { id: '1', title: 'New meeting scheduled', desc: 'Q1 Board Meeting on Feb 15', time: '2 hours ago' },
                { id: '2', title: 'Document shared with you', desc: 'Q4 Financial Report.pdf', time: '5 hours ago' },
                { id: '3', title: 'Action item assigned', desc: 'Review audit findings by Jan 16', time: '1 day ago' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{ backgroundColor: colors.primarySubtle }}
                        icon={<TeamOutlined style={{ color: colors.primary }} />}
                      />
                    }
                    title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.time}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
