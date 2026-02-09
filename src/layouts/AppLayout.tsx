import { useState, useEffect } from 'react';
import { Layout, Grid } from 'antd';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { NavigationBar } from '../components/NavigationBar';
import { useBoardContext, MeetingPhaseProvider, useIsInMeetingDetail } from '../contexts';
import { getBoardById } from '../mocks/db';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const SIDEBAR_WIDTH_EXPANDED = 256;
const SIDEBAR_WIDTH_COLLAPSED = 80;

const AppLayoutInner: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint = 768px
  const location = useLocation();
  
  // Check if we're in the Meeting Room (full-width mode)
  const isInMeetingRoom = location.pathname.includes('/meetings/') && location.pathname.endsWith('/room');
  
  // Initialize collapsed state based on screen size to prevent transition flash
  const [collapsed, setCollapsed] = useState(() => isMobile);
  const [userCollapsed, setUserCollapsed] = useState(false); // Track if user manually collapsed
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { currentBoard, setCurrentBoard } = useBoardContext();
  const isInMeetingDetail = useIsInMeetingDetail();

  // Auto-collapse sidebar when entering meeting detail (unless user manually expanded it)
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true); // Always closed on mobile
    } else if (isInMeetingDetail) {
      if (!userCollapsed) {
        setCollapsed(true); // Auto-collapse for meeting detail
      }
    } else {
      setCollapsed(false); // Expand when leaving meeting detail
      setUserCollapsed(false); // Reset user preference
    }
  }, [isMobile, isInMeetingDetail, userCollapsed]);

  // Sync URL boardId with context on mount and URL change
  useEffect(() => {
    if (boardId) {
      const board = getBoardById(boardId);
      if (board) {
        // Only update context if different from current
        if (currentBoard.id !== boardId) {
          setCurrentBoard(boardId);
        }
      } else {
        // Invalid boardId, redirect to default
        navigate('/ktda-ms/dashboard', { replace: true });
      }
    }
  }, [boardId, currentBoard.id, setCurrentBoard, navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: 'margin-left 0.15s ease-in-out',
        }}
      >
        <Header collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        
        {/* Navigation Bar - org selector, breadcrumbs, committee tabs */}
        <NavigationBar />
        
        <Content
          style={{
            margin: isInMeetingRoom ? 0 : (isMobile ? '16px' : '24px'),
            padding: isInMeetingRoom ? 0 : (isMobile ? '16px' : '24px'),
            minHeight: 280,
            backgroundColor: isInMeetingRoom ? 'transparent' : '#fff',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <MeetingPhaseProvider>
      <AppLayoutInner />
    </MeetingPhaseProvider>
  );
};

export default AppLayout;
