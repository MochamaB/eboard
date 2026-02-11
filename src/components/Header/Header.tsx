import { Layout, Space, Input, Badge, Avatar, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme';
import { useOrgTheme, useAuth } from '../../contexts';
import { useResponsive } from '../../hooks';
import { responsiveHelpers } from '../../utils';
import { BoardSelector } from './BoardSelector';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// User dropdown menu items
const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'My Profile',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    danger: true,
  },
];

// Notification dropdown items
const notificationItems: MenuProps['items'] = [
  {
    key: 'header',
    label: (
      <div style={{ padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}>
        <strong>Notifications</strong>
        <span style={{ float: 'right', color: colors.primary, cursor: 'pointer', fontSize: 12 }}>
          Mark all as read
        </span>
      </div>
    ),
    disabled: true,
  },
  {
    key: '1',
    label: (
      <div style={{ maxWidth: 300 }}>
        <div style={{ fontWeight: 500 }}>New meeting scheduled</div>
        <div style={{ fontSize: 12, color: colors.textSecondary }}>
          Board meeting on Jan 25, 2026 at 10:00 AM
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>2 hours ago</div>
      </div>
    ),
  },
  {
    key: '2',
    label: (
      <div style={{ maxWidth: 300 }}>
        <div style={{ fontWeight: 500 }}>Document requires review</div>
        <div style={{ fontSize: 12, color: colors.textSecondary }}>
          Q4 Financial Report needs your approval
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>5 hours ago</div>
      </div>
    ),
  },
  {
    key: '3',
    label: (
      <div style={{ maxWidth: 300 }}>
        <div style={{ fontWeight: 500 }}>Action item assigned</div>
        <div style={{ fontSize: 12, color: colors.textSecondary }}>
          Review budget proposal by Jan 20
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>1 day ago</div>
      </div>
    ),
  },
  {
    type: 'divider',
  },
  {
    key: 'view-all',
    label: (
      <div style={{ textAlign: 'center', color: colors.primary }}>
        View all notifications
      </div>
    ),
  },
];

export const Header: React.FC<HeaderProps> = ({ collapsed, onToggleCollapse }) => {
  const { theme } = useOrgTheme();
  const { user, logout } = useAuth();
  const { isMobile, currentBreakpoint } = useResponsive();

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      console.log('Profile clicked');
    } else if (key === 'settings') {
      console.log('Settings clicked');
    }
  };

  // Responsive header height
  const headerHeight = responsiveHelpers.responsiveLayout.getHeaderHeight(currentBreakpoint);
  
  // Responsive padding
  const headerPadding = responsiveHelpers.getResponsiveSpacing({
    xs: 12,
    md: 20,
    lg: 24
  }, currentBreakpoint);

  return (
    <AntHeader
      style={{
        padding: `0 ${headerPadding}px`,
        background: colors.white,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: headerHeight,
      }}
    >
      {/* Left section - Menu toggle + Board Selector */}
      <Space size="middle" align="center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          className="touch-target"
          style={{ 
            fontSize: 16, 
            width: responsiveHelpers.responsiveTouch.getTouchTargetSize(currentBreakpoint), 
            height: responsiveHelpers.responsiveTouch.getTouchTargetSize(currentBreakpoint) 
          }}
        />
        <BoardSelector />
      </Space>

      {/* Center - Search (hidden on mobile) */}
      {!isMobile && (
        <Input
          className="header-search-bar"
          placeholder="Search meetings, documents, users..."
          prefix={<SearchOutlined style={{ color: colors.textMuted }} />}
          style={{
            width: isMobile ? '100%' : 400,
            borderRadius: 20,
            background: colors.tertiary,
          }}
          variant="filled"
        />
      )}

      {/* Right section */}
      <Space size="middle">
        {/* Notifications */}
        <Dropdown
          menu={{ items: notificationItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Badge count={5} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 18 }} />}
              className="touch-target"
              style={{ 
                width: responsiveHelpers.responsiveTouch.getTouchTargetSize(currentBreakpoint), 
                height: responsiveHelpers.responsiveTouch.getTouchTargetSize(currentBreakpoint) 
              }}
            />
          </Badge>
        </Dropdown>

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              style={{ backgroundColor: theme.primaryColor }}
              icon={<UserOutlined />}
            />
            {!isMobile && (
              <div className="header-user-info" style={{ lineHeight: 1.3 }}>
                <div style={{ color: colors.textPrimary, fontWeight: 500 }}>
                  {user?.fullName || 'Guest'}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: 11 }}>
                  {user?.jobTitle || ''}
                </div>
              </div>
            )}
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
