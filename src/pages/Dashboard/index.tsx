import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useOrgTheme } from '../../contexts';
import { StatCard, DashboardFilters, MeetingTrendsChart, MeetingDistributionChart, UpcomingMeetings, RecentActivity, QuickStats } from '../../components/Dashboard';
import { getDashboardMetrics, formatMinutesToHours, type DashboardMetrics } from '../../services/dashboardService';
import { getMeetingTrendsData, getMeetingDistribution, type MeetingTrendsData, type DistributionData } from '../../services/chartDataService';
import { getUpcomingMeetings, getRecentActivity, getQuickStats, type UpcomingMeeting, type ActivityItem, type QuickStat } from '../../services/widgetDataService';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { currentOrg, activeCommittee, theme } = useOrgTheme();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [trendsData, setTrendsData] = useState<MeetingTrendsData[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);

  // Fetch all dashboard data when organization, committee, date range, or period changes
  useEffect(() => {
    if (orgId) {
      setLoading(true);
      // Simulate API call with timeout
      setTimeout(() => {
        const data = getDashboardMetrics(orgId, activeCommittee, dateRange);
        const trends = getMeetingTrendsData(orgId, activeCommittee, dateRange, period);
        const distribution = getMeetingDistribution(orgId, activeCommittee, dateRange);
        const meetings = getUpcomingMeetings(orgId, activeCommittee, dateRange);
        const activity = getRecentActivity(orgId, activeCommittee, 8);
        const stats = getQuickStats(orgId, activeCommittee);
        
        setMetrics(data);
        setTrendsData(trends);
        setDistributionData(distribution);
        setUpcomingMeetings(meetings);
        setRecentActivity(activity);
        setQuickStats(stats);
        setLoading(false);
      }, 500);
    }
  }, [orgId, activeCommittee, dateRange, period]);

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates) {
      setDateRange(dates);
    } else {
      // Reset to current month if cleared
      setDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    message.success(`Exporting dashboard as ${format.toUpperCase()}...`);
    // TODO: Implement actual export functionality
  };

  const handleStatClick = (stat: QuickStat) => {
    navigate(`/${orgId}${stat.linkTo}`);
  };


  return (
    <div>
      {/* Welcome Header with Filters */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} wrap>
        <Col xs={24} md={12}>
          <Title level={4} style={{ marginBottom: 4 }}>
            Welcome back, John Kamau
          </Title>
          <Text type="secondary">
            {activeCommittee === 'all' 
              ? `Viewing all boards and committees in ${currentOrg.shortName}`
              : activeCommittee === 'board'
              ? `Viewing ${currentOrg.shortName} board`
              : `Viewing ${currentOrg.committees?.find(c => c.id === activeCommittee)?.name || 'Committee'}`
            }
          </Text>
        </Col>
        <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <DashboardFilters
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onExport={handleExport}
          />
        </Col>
      </Row>

      {/* KPI Stats Row - 5 cards distributed evenly */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={24/5} flex="1">
          <StatCard
            title="Meetings"
            value={metrics?.meetings.total || 0}
            icon={<CalendarOutlined />}
            trend={{
              value: metrics?.meetings.trend || 0,
              isPositive: (metrics?.meetings.trend || 0) > 0,
            }}
            loading={loading}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={24/5} flex="1">
          <StatCard
            title="Frequency"
            value={metrics?.meetings.frequency || 0}
            suffix="/month"
            icon={<BarChartOutlined />}
            trend={{
              value: metrics?.meetings.frequencyTrend || 0,
              isPositive: (metrics?.meetings.frequencyTrend || 0) > 0,
            }}
            loading={loading}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={24/5} flex="1">
          <StatCard
            title="Meeting Time"
            value={formatMinutesToHours(metrics?.meetings.totalTime || 0)}
            icon={<ClockCircleOutlined />}
            trend={{
              value: metrics?.meetings.totalTimeTrend || 0,
              isPositive: (metrics?.meetings.totalTimeTrend || 0) < 0,
            }}
            loading={loading}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={24/5} flex="1">
          <StatCard
            title="Avg. Duration"
            value={metrics?.meetings.avgDuration || 0}
            suffix="min"
            icon={<ClockCircleOutlined />}
            trend={{
              value: metrics?.meetings.avgDurationTrend || 0,
              isPositive: (metrics?.meetings.avgDurationTrend || 0) < 0,
            }}
            loading={loading}
            colorMode="colored"
            backgroundColor={theme.primaryColor}
            accentColor={theme.primaryColor}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={24/5} flex="1">
          <StatCard
            title="Action Items"
            value={metrics?.governance.actionItemsRate || 0}
            suffix="%"
            icon={<CheckSquareOutlined />}
            trend={{
              value: metrics?.governance.actionItemsRateTrend || 0,
              isPositive: (metrics?.governance.actionItemsRateTrend || 0) > 0,
            }}
            loading={loading}
            colorMode="colored"
            backgroundColor={theme.secondaryColor}
            accentColor={theme.secondaryColor}
          />
        </Col>
      </Row>

      {/* Charts Row: Meeting Trends (2/3) + Distribution (1/3) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Meeting Trends"
            styles={{ body: { padding: '16px' } }}
            style={{ height: '100%' }}
          >
            <MeetingTrendsChart
              data={trendsData}
              loading={loading}
              onPeriodChange={setPeriod}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card
            title="Meeting Length Distribution"
            styles={{ body: { padding: '16px' } }}
            style={{ height: '100%' }}
          >
            <MeetingDistributionChart
              data={distributionData}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Widgets Row: Upcoming Meetings (1/2) + Recent Activity (1/2) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Upcoming Meetings"
            extra={<a href={`/${orgId}/meetings`}>View All <RightOutlined /></a>}
            styles={{ body: { padding: '16px' } }}
            style={{ height: '100%' }}
          >
            <UpcomingMeetings
              meetings={upcomingMeetings}
              loading={loading}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activity"
            styles={{ body: { padding: '16px' } }}
            style={{ height: '100%' }}
          >
            <RecentActivity
              activities={recentActivity}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Quick Stats"
            styles={{ body: { padding: '16px' } }}
          >
            <QuickStats
              stats={quickStats}
              loading={loading}
              onStatClick={handleStatClick}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
