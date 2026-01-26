import { Layout, Menu, Drawer, Grid } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  BellOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useBoardContext } from '../../contexts';
import './Sidebar.css';

const { Sider } = Layout;
const { useBreakpoint } = Grid;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

// Menu section header component
function getItemGroup(
  label: React.ReactNode,
  children: MenuItem[],
): MenuItem {
  return {
    type: 'group',
    label,
    children,
  } as MenuItem;
}

const menuItems: MenuItem[] = [
  getItemGroup(
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, opacity: 0.6 }}>MAIN MENU</span>,
    [
      getItem('Dashboard', '/', <DashboardOutlined />),
      getItem('Meetings', '/meetings', <CalendarOutlined />),
      getItem('Approvals', '/approvals', <SafetyCertificateOutlined />),
      getItem('Documents', '/documents', <FileTextOutlined />),
      getItem('Notifications', '/notifications', <BellOutlined />),
      getItem('Reports', '/reports', <BarChartOutlined />),
    ]
  ),
  
  { type: 'divider', style: { margin: '16px 0', opacity: 0.2 } },
  
  getItemGroup(
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, opacity: 0.6 }}>ADMINISTRATION</span>,
    [
      getItem('Boards', '/boards', <ApartmentOutlined />),
      getItem('Committees', '/committees', <ApartmentOutlined />),
      getItem('Users', '/users', <TeamOutlined />),
      getItem('Roles', '/roles', <SafetyCertificateOutlined />),
      getItem('Permissions', '/permissions', <SettingOutlined />),
    ]
  ),
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId } = useParams<{ boardId: string }>();
  const { theme, currentBoard } = useBoardContext();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint = 768px

  // Check if we're in "View All" mode (route starts with /all/)
  const isAllView = location.pathname.startsWith('/all/');
  
  // Determine the route prefix - use 'all' for View All mode, otherwise use boardId
  const routePrefix = isAllView ? 'all' : (boardId || currentBoard?.id);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Navigate with appropriate prefix (boardId or 'all')
    if (routePrefix) {
      navigate(`/${routePrefix}${key}`);
    }
  };

  // Find the selected key based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    // Remove orgId prefix to match menu keys
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return ['/'];
    
    // Skip first segment (orgId) and reconstruct path
    if (segments.length === 1) return ['/'];
    const menuPath = `/${segments.slice(1).join('/')}`;
    
    // Dashboard is special case
    if (segments[1] === 'dashboard') return ['/'];
    
    // Check for exact match
    const exactMatch = menuItems.find(item => item && 'key' in item && item.key === menuPath);
    if (exactMatch) return [menuPath];
    
    // Check for parent match (e.g., /users/123 should highlight /users)
    if (segments.length > 2) {
      return [`/${segments[1]}`];
    }
    
    return [menuPath];
  };

  // Find open keys for submenus
  const getOpenKeys = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      return [`/${segments[0]}`];
    }
    return [];
  };

  // Shared menu content component
  const menuContent = (
    <>
      {/* Logo Area */}
      <div
        style={{
          height: collapsed && !isMobile ? 96 : 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'height 0.2s',
        }}
      >
        {collapsed && !isMobile ? (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fff',
              border: `3px solid ${theme.primaryColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <img
              src={currentBoard.branding?.logo?.main || currentBoard.branding?.logo?.small || ''}
              alt={currentBoard.shortName}
              style={{ width: 36, height: 36, objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: '#fff',
              border: `4px solid ${theme.primaryColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              margin: '0 auto',
            }}
          >
            <img
              src={currentBoard.branding?.logo?.main || currentBoard.branding?.logo?.small || ''}
              alt={currentBoard.shortName}
              style={{ width: 80, height: 80, objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={collapsed && !isMobile ? [] : getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          borderRight: 0,
          marginTop: 8,
        }}
      />
    </>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        onClose={() => onCollapse(true)}
        open={!collapsed}
        closable={false}
        size="default"
        width={250}
        styles={{
          body: {
            padding: 0,
            background: theme.sidebarBgGradient || theme.sidebarBg,
          },
        }}
      >
        {menuContent}
      </Drawer>
    );
  }

  // Desktop: Use Sider
  return (
    <Sider
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      trigger={null}
      className="sidebar-container"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: theme.sidebarBgGradient || theme.sidebarBg,
        // CSS variables for dynamic primary color
        ['--sidebar-primary-color' as string]: theme.primaryColor,
        ['--sidebar-primary-color-hover' as string]: theme.primaryHover || theme.primaryColor,
      }}
      theme="dark"
    >
      {menuContent}
    </Sider>
  );
};

export default Sidebar;
