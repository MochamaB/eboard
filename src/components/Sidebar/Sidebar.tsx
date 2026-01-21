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
import { useOrgTheme } from '../../contexts';

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
  const { orgId } = useParams<{ orgId: string }>();
  const { theme, logoSidebar, logoSmall, currentOrg } = useOrgTheme();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint = 768px

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Navigate with orgId prefix
    if (orgId) {
      navigate(`/${orgId}${key}`);
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
          height: collapsed && !isMobile ? 80 : 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '26px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'height 0.2s',
        }}
      >
        {collapsed && !isMobile ? (
          <img 
            src={logoSmall} 
            alt={currentOrg.shortName}
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={logoSidebar} 
              alt={currentOrg.shortName}
              style={{ height: '100%', width: '100%', objectFit: 'contain' }}
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
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={250}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: theme.sidebarBgGradient || theme.sidebarBg,
      }}
      theme="dark"
    >
      {menuContent}
    </Sider>
  );
};

export default Sidebar;
