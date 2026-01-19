import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BellOutlined,
  BarChartOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrgTheme } from '../../contexts';

const { Sider } = Layout;

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
  const { theme, logoSidebar, logoSmall, currentOrg } = useOrgTheme();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  // Find the selected key based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    // For nested routes, find the matching menu item
    if (path === '/') return ['/'];
    
    // Check for exact match first
    const exactMatch = menuItems.find(item => item && 'key' in item && item.key === path);
    if (exactMatch) return [path];
    
    // Check for parent match (e.g., /users/123 should highlight /users)
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      return [`/${segments[0]}`];
    }
    
    return ['/'];
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
      {/* Logo Area */}
      <div
        style={{
          height: collapsed ? 80 : 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'height 0.2s',
        }}
      >
        {collapsed ? (
          <img 
            src={logoSmall} 
            alt={currentOrg.shortName}
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
          />
        ) : (
          <>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={logoSidebar} 
                alt={currentOrg.shortName}
                style={{ maxHeight: 60, width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                marginTop: 12,
                paddingTop: 8,
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, fontWeight: 500, letterSpacing: 1 }}>
                eBOARD
              </span>
            </div>
          </>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={collapsed ? [] : getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          borderRight: 0,
          marginTop: 8,
        }}
      />
    </Sider>
  );
};

export default Sidebar;
