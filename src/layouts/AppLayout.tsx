import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { NavigationBar } from '../components/NavigationBar';
import { useBoardContext, MeetingPhaseProvider, useIsInMeetingDetail } from '../contexts';
import { useResponsive } from '../hooks';
import { responsiveHelpers } from '../utils';

const { Content } = Layout;

const AppLayoutInner: React.FC = () => {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBoard, setCurrentBoard, allBoards } = useBoardContext();
  const isInMeetingDetail = useIsInMeetingDetail();

  // Drawer mode for mobile and tablet (overlay)
  const useDrawerMode = isMobile || isTablet;

  // Initialize collapsed state based on screen size to prevent transition flash
  const [collapsed, setCollapsed] = useState(() => useDrawerMode);
  const [userCollapsed, setUserCollapsed] = useState(false); // Track if user manually collapsed

  // Use responsive sidebar width calculation
  const sidebarWidth = responsiveHelpers.responsiveLayout.getSidebarWidth(collapsed, currentBreakpoint);

  // Auto-collapse sidebar when entering meeting detail (unless user manually expanded it)
  useEffect(() => {
    if (useDrawerMode) {
      setCollapsed(true); // Always closed on mobile/tablet
    } else if (isInMeetingDetail) {
      if (!userCollapsed) {
        setCollapsed(true); // Auto-collapse for meeting detail
      }
    } else {
      setCollapsed(false); // Expand when leaving meeting detail
      setUserCollapsed(false); // Reset user preference
    }
  }, [useDrawerMode, isInMeetingDetail, userCollapsed]);

  // Sync URL boardId (slug) with context on mount and URL change
  useEffect(() => {
    // Skip board validation for global routes (/all/*)
    const isGlobalRoute = location.pathname.startsWith('/all/');
    
    if (!isGlobalRoute && boardId && allBoards.length > 0) {
      const boardExists = allBoards.some(b => b.slug === boardId);
      if (boardExists) {
        if (currentBoard.slug !== boardId) {
          setCurrentBoard(boardId);
        }
      } else {
        // Invalid boardId, redirect to default
        navigate('/ktda-ms/dashboard', { replace: true });
      }
    }
  }, [boardId, currentBoard.slug, setCurrentBoard, navigate, allBoards, location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
        style={{
          marginLeft: responsiveHelpers.responsiveLayout.getContentMargin(sidebarWidth, currentBreakpoint),
          transition: 'margin-left 0.15s ease-in-out',
        }}
      >
        <Header collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        
        {/* Navigation Bar - org selector, breadcrumbs, committee tabs */}
        <NavigationBar />
        
        <Content
          style={{
            margin: `${responsiveHelpers.getResponsiveSpacing({ xs: 16, md: 20, lg: 24 }, currentBreakpoint)}px ${responsiveHelpers.getResponsiveSpacing({ xs: 16, md: 20, lg: 24 }, currentBreakpoint)}px`,
            padding: responsiveHelpers.getResponsiveSpacing({ xs: 16, md: 20, lg: 24 }, currentBreakpoint),
            minHeight: 280,
            backgroundColor: '#fff',
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
