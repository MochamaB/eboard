import { Layout, Space, Input, Badge, Avatar, Dropdown, Button, Select } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Mock data for board selector
const boards = [
  { value: 'ktda-main', label: 'KTDA Main Board' },
  { value: 'audit-committee', label: 'Audit Committee' },
  { value: 'hr-committee', label: 'HR Committee' },
  { value: 'finance-committee', label: 'Finance Committee' },
];

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
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      console.log('Logout clicked');
    } else if (key === 'profile') {
      console.log('Profile clicked');
    } else if (key === 'settings') {
      console.log('Settings clicked');
    }
  };

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: colors.white,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left section */}
      <Space size="middle">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          style={{ fontSize: 16, width: 40, height: 40 }}
        />

        {/* Board Selector */}
        <Select
          defaultValue="ktda-main"
          style={{ width: 200 }}
          options={boards}
          suffixIcon={<SwapOutlined />}
          variant="borderless"
          dropdownStyle={{ minWidth: 220 }}
        />
      </Space>

      {/* Center - Search */}
      <Input
        placeholder="Search meetings, documents, users..."
        prefix={<SearchOutlined style={{ color: colors.textMuted }} />}
        style={{
          width: 400,
          borderRadius: 20,
          background: colors.tertiary,
        }}
        variant="filled"
      />

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
              style={{ width: 40, height: 40 }}
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
              style={{ backgroundColor: colors.primary }}
              icon={<UserOutlined />}
            />
            <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
              John Kamau
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
