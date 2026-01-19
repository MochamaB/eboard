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
import { colors } from '../../theme';

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

const menuItems: MenuItem[] = [
  getItem('Dashboard', '/', <DashboardOutlined />),
  
  { type: 'divider' },
  
  getItem('Meetings', '/meetings', <CalendarOutlined />, [
    getItem('All Meetings', '/meetings'),
    getItem('Calendar', '/meetings/calendar'),
    getItem('Create Meeting', '/meetings/create'),
  ]),
  
  getItem('Documents', '/documents', <FileTextOutlined />, [
    getItem('All Documents', '/documents'),
    getItem('Board Packs', '/documents/board-packs'),
    getItem('Templates', '/documents/templates'),
  ]),
  
  getItem('Notifications', '/notifications', <BellOutlined />),
  
  getItem('Reports', '/reports', <BarChartOutlined />, [
    getItem('Meeting Reports', '/reports/meetings'),
    getItem('Attendance', '/reports/attendance'),
    getItem('Compliance', '/reports/compliance'),
  ]),
  
  { type: 'divider' },
  
  getItem('Users', '/users', <TeamOutlined />, [
    getItem('All Users', '/users'),
    getItem('Roles & Permissions', '/users/roles'),
  ]),
  
  getItem('Boards', '/boards', <ApartmentOutlined />, [
    getItem('All Boards', '/boards'),
    getItem('Committees', '/boards/committees'),
  ]),
  
  getItem('Settings', '/settings', <SettingOutlined />, [
    getItem('General', '/settings/general'),
    getItem('Notifications', '/settings/notifications'),
    getItem('Integrations', '/settings/integrations'),
  ]),
  
  getItem('Admin', '/admin', <SafetyCertificateOutlined />, [
    getItem('System Settings', '/admin/system'),
    getItem('Audit Logs', '/admin/audit-logs'),
    getItem('Backup', '/admin/backup'),
  ]),
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        background: `linear-gradient(to bottom, ${colors.sidebarBg} 0%, ${colors.sidebarBgDark} 100%)`,
      }}
      theme="dark"
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          background: 'rgba(30, 43, 20, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {collapsed ? (
          <span style={{ color: colors.secondary, fontSize: 24, fontWeight: 700 }}>K</span>
        ) : (
          <span style={{ color: colors.white, fontSize: 20, fontWeight: 600 }}>
            <span style={{ color: colors.secondary }}>KTDA</span> eBoard
          </span>
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
