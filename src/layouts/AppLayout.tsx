import { useState, useEffect } from 'react';
import { Layout, Grid } from 'antd';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { NavigationBar } from '../components/NavigationBar';
import { colors } from '../theme';
import { useOrgTheme } from '../contexts';
import { getOrganizationById } from '../data/organizations';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const SIDEBAR_WIDTH_EXPANDED = 256;
const SIDEBAR_WIDTH_COLLAPSED = 80;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint = 768px
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { currentOrg, setCurrentOrg } = useOrgTheme();

  // Auto-close sidebar drawer on mobile (but keep it ready to open)
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true); // Closed by default on mobile
    } else {
      setCollapsed(false); // Expanded by default on desktop
    }
  }, [isMobile]);

  // Sync URL orgId with context on mount and URL change
  useEffect(() => {
    if (orgId) {
      const org = getOrganizationById(orgId);
      if (org) {
        // Only update context if different from current
        if (currentOrg.id !== orgId) {
          setCurrentOrg(orgId);
        }
      } else {
        // Invalid orgId, redirect to default
        navigate('/ktda-main/dashboard', { replace: true });
      }
    }
  }, [orgId, currentOrg.id, setCurrentOrg, navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        
        {/* Navigation Bar - org selector, breadcrumbs, committee tabs */}
        <NavigationBar />
        
        <Content
          style={{
            margin: isMobile ? '16px' : '24px',
            padding: isMobile ? '16px' : '24px',
            minHeight: 280,
            background: colors.white,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
