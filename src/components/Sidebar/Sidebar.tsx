import React, { useMemo } from 'react';
import { Layout, Menu, Drawer } from 'antd';
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
  KeyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useBoardContext } from '../../contexts';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../hooks';
import { responsiveHelpers } from '../../utils';
import { usePendingConfirmations } from '../../hooks/api/useMeetings';
import { useMinutesPendingApproval } from '../../hooks/api/useMinutes';
import './Sidebar.css';

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


interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId } = useParams<{ boardId: string }>();
  const { theme, currentBoard, isDefaultBranding } = useBoardContext();
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();
  const { hasPermission, user, getBoardPermissions } = useAuth();

  // Pending approvals badge count
  const { data: pendingMeetings } = usePendingConfirmations(undefined, true);
  const { data: pendingMinutes = [] } = useMinutesPendingApproval();
  const pendingApprovalsCount = (pendingMeetings?.total ?? 0) + pendingMinutes.length;

  // Debug: Log user permissions
  React.useEffect(() => {
    if (user) {
      console.log('=== SIDEBAR PERMISSION DEBUG ===');
      console.log('User:', user.email);
      console.log('Board Roles:', user.boardRoles);
      console.log('Current Board:', currentBoard?.slug);
      if (currentBoard?.slug) {
        const boardPerms = getBoardPermissions(currentBoard.slug);
        console.log(`Permissions for board "${currentBoard.slug}":`, boardPerms);
      }
      console.log('Has meetings.view?', hasPermission('meetings.view', currentBoard?.slug));
      console.log('Has boards.view_all?', hasPermission('boards.view_all'));
      console.log('Has users.view?', hasPermission('users.view'));
      console.log('================================');
    }
  }, [user, currentBoard, hasPermission, getBoardPermissions]);

  // Dynamic menu items with permission checks
  const menuItems = useMemo((): MenuItem[] => {
    const mainMenuItems: MenuItem[] = [];
    const adminMenuItems: MenuItem[] = [];

    // Always show Dashboard
    mainMenuItems.push(getItem('Dashboard', '/', <DashboardOutlined />));

    // Meetings - requires meetings.view permission
    if (hasPermission('meetings.view', currentBoard?.slug)) {
      mainMenuItems.push(getItem('Meetings', '/meetings', <CalendarOutlined />));
    }

    // Approvals - requires meetings.approve or minutes.approve
    if (hasPermission('meetings.approve', currentBoard?.slug) || hasPermission('minutes.approve', currentBoard?.slug)) {
      mainMenuItems.push(
        getItem(
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Approvals
            {pendingApprovalsCount > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: 'currentColor',
                fontSize: 11,
                fontWeight: 700,
                padding: '0 5px',
                lineHeight: '18px',
              }}>
                <span style={{ color: theme.sidebarBg }}>
                  {pendingApprovalsCount}
                </span>
              </span>
            )}
          </span>,
          '/approvals',
          <SafetyCertificateOutlined />,
        )
      );
    }

    // Documents - requires documents.view permission
    if (hasPermission('documents.view', currentBoard?.slug)) {
      mainMenuItems.push(getItem('Documents', '/documents', <FileTextOutlined />));
    }

    // Notifications - always visible
    mainMenuItems.push(getItem('Notifications', '/notifications', <BellOutlined />));

    // Reports - requires reports.view permission
    if (hasPermission('reports.view', currentBoard?.slug)) {
      mainMenuItems.push(getItem('Reports', '/reports', <BarChartOutlined />));
    }

    // Admin section
    // Boards - requires boards.view_all permission
    if (hasPermission('boards.view_all')) {
      adminMenuItems.push(getItem('Boards', '/boards', <ApartmentOutlined />));
    }

    // Users - requires users.view permission
    if (hasPermission('users.view')) {
      adminMenuItems.push(getItem('Users', '/users', <TeamOutlined />));
    }

    // Roles - requires admin.access permission
    if (hasPermission('admin.access')) {
      adminMenuItems.push(getItem('Roles', '/roles', <SafetyCertificateOutlined />));
    }

    // Permissions - requires admin.access permission
    if (hasPermission('admin.access')) {
      adminMenuItems.push(getItem('Permissions', '/permissions', <KeyOutlined />));
    }

    const items: MenuItem[] = [];

    // Add main menu group
    if (mainMenuItems.length > 0) {
      items.push(
        getItemGroup(
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, opacity: 0.6 }}>MAIN MENU</span>,
          mainMenuItems
        )
      );
    }

    // Add divider and admin section if there are admin items
    if (adminMenuItems.length > 0) {
      items.push({ type: 'divider', style: { margin: '0px 0', opacity: 0.2 } });
      items.push(
        getItemGroup(
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, opacity: 0.6 }}>ADMINISTRATION</span>,
          adminMenuItems
        )
      );
    }

    // Add Settings (not profile - that will be separate)

    items.push(getItem('Settings', '/settings', <SettingOutlined />));

    return items;
  }, [pendingApprovalsCount, hasPermission, currentBoard, theme.sidebarBg, theme.secondaryColor, user]);

  // Use drawer for mobile AND tablet (better UX on smaller screens)
  const useDrawerMode = isMobile || isTablet;

  // Check if we're in "View All" mode (route starts with /all/)
  const isAllView = location.pathname.startsWith('/all/');
  
  // Determine the route prefix - use 'all' for View All mode, otherwise use boardId (slug)
  const routePrefix = isAllView ? 'all' : (boardId || currentBoard?.slug);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Global routes that should always use /all prefix (not board-specific)
    const globalRoutes = ['/roles', '/permissions'];
    
    // Navigate with appropriate prefix
    if (globalRoutes.includes(key)) {
      // Always use /all for global admin routes
      navigate(`/all${key}`);
    } else if (routePrefix) {
      // Use board prefix or 'all' for other routes
      navigate(`/${routePrefix}${key}`);
    }

    // Close drawer on mobile after navigation
    if (isMobile) {
      onCollapse(true);
    }
  };

  // Find the selected key based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Empty path or root
    if (segments.length === 0) return ['/'];
    
    // Only board prefix (e.g., /ktda-ms)
    if (segments.length === 1) return ['/'];
    
    // Dashboard is special case - always map to root
    if (segments[1] === 'dashboard') return ['/'];
    
    // Extract all menu keys dynamically from menuItems
    const extractMenuKeys = (items: MenuItem[]): string[] => {
      const keys: string[] = [];
      items.forEach(item => {
        if (item && typeof item === 'object') {
          if ('key' in item && typeof item.key === 'string') {
            keys.push(item.key);
          }
          if ('children' in item && Array.isArray(item.children)) {
            keys.push(...extractMenuKeys(item.children));
          }
        }
      });
      return keys;
    };
    
    const availableMenuKeys = extractMenuKeys(menuItems);
    
    // Try to match base path (e.g., /users for /users/create or /users/25)
    const basePath = `/${segments[1]}`;
    
    // Check if base path exists in menu
    if (availableMenuKeys.includes(basePath)) {
      return [basePath];
    }
    
    // Try full path for exact match (e.g., /meetings/123/room)
    const fullPath = `/${segments.slice(1).join('/')}`;
    if (availableMenuKeys.includes(fullPath)) {
      return [fullPath];
    }
    
    // Fallback: return base path even if not in menu (better than nothing)
    return [basePath];
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Area */}
      <div
        style={{
          height: collapsed && !useDrawerMode ? 96 : 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'height 0.2s',
          flexShrink: 0,
        }}
      >
        {(() => {
          const logoSrc = theme.logo?.sidebar || theme.logo?.main || theme.logo?.small;

          if (!logoSrc) {
            const fallbackText = currentBoard.shortName?.charAt(0) || 'B';
            return (
              <div
                style={{
                  width: collapsed && !useDrawerMode ? 56 : 120,
                  height: collapsed && !useDrawerMode ? 56 : 120,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `${collapsed && !useDrawerMode ? 3 : 4}px solid ${theme.primaryColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: collapsed && !useDrawerMode
                    ? '0 2px 8px rgba(0,0,0,0.15)'
                    : '0 4px 12px rgba(0,0,0,0.2)',
                  margin: collapsed && !useDrawerMode ? undefined : '0 auto',
                }}
              >
                <span
                  style={{
                    fontSize: collapsed && !useDrawerMode ? 18 : 36,
                    fontWeight: 700,
                    color: theme.primaryColor,
                  }}
                >
                  {fallbackText}
                </span>
              </div>
            );
          }

          if (isDefaultBranding) {
            return (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={logoSrc}
                  alt="KTDA"
                  style={{
                    width: collapsed && !useDrawerMode ? 56 : 160,
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
            );
          }

          const isCollapsedDesktop = collapsed && !useDrawerMode;
          return (
            <div
              style={{
                width: isCollapsedDesktop ? 56 : 120,
                height: isCollapsedDesktop ? 56 : 120,
                borderRadius: '50%',
                background: '#fff',
                border: `${isCollapsedDesktop ? 3 : 4}px solid ${theme.primaryColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: isCollapsedDesktop
                  ? '0 2px 8px rgba(0,0,0,0.15)'
                  : '0 4px 12px rgba(0,0,0,0.2)',
                margin: isCollapsedDesktop ? undefined : '0 auto',
              }}
            >
              <img
                src={logoSrc}
                alt={currentBoard.shortName}
                style={{
                  width: isCollapsedDesktop ? 36 : 80,
                  height: isCollapsedDesktop ? 36 : 80,
                  objectFit: 'contain',
                }}
              />
            </div>
          );
        })()}
      </div>

      {/* Scrollable Menu Area */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          // Hide scrollbar for Chrome, Safari and Opera
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
        }}
        className="sidebar-menu-scroll"
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={collapsed && !useDrawerMode ? [] : getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 0,
            marginTop: 8,
            paddingBottom: 8,
          }}
        />
      </div>

      {/* Fixed Profile Section at Bottom */}
      {user && (
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKeys()}
            items={[
              getItem(
                <span style={{ color: theme.secondaryColor }}>
                  {user.fullName || user.email}
                </span>,
                '/profile',
                <UserOutlined style={{ color: theme.secondaryColor }} />
              ),
            ]}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              borderRight: 0,
            }}
          />
        </div>
      )}
    </div>
  );

  // Mobile & Tablet: Use Drawer (better UX on smaller screens)
  if (useDrawerMode) {
    const drawerWidth = responsiveHelpers.getResponsiveSpacing({
      xs: 280,
      sm: 300,
      md: 320
    }, currentBreakpoint);

    return (
      <Drawer
        placement="left"
        onClose={() => onCollapse(true)}
        open={!collapsed}
        closable={false}
        size="default"
        width={drawerWidth}
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
  const sidebarWidth = responsiveHelpers.responsiveLayout.getSidebarWidth(collapsed, currentBreakpoint);
  
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
        transition: 'all 0.15s ease-in-out',
        width: sidebarWidth,
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
