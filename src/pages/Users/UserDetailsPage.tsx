/**
 * User Details Page
 * View user profile with tabbed sections
 * Actions: Edit Profile, Resend Welcome Email, Force Password Reset, Deactivate
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  LockOutlined,
  StopOutlined,
  InfoCircleOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { useBoardContext } from '../../contexts';
import { useUser } from '../../hooks/api';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { DetailPageLayout } from '../../components/common';
import type { MetadataItem, ActionButton } from '../../components/common';
import type { HorizontalTabItem } from '../../components/common';
import {
  UserDetailsTab,
  BoardMembershipsTab,
  ActivityLogTab,
  SecurityTab,
} from './tabs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentBoard, theme } = useBoardContext();

  const [activeTab, setActiveTab] = useTabNavigation('details');

  // Fetch user data from API
  const { data: user, isLoading, error } = useUser(parseInt(userId || '0'));

  // Tab items
  const tabItems: HorizontalTabItem[] = useMemo(() => {
    if (!user) return [];

    return [
      {
        key: 'details',
        label: 'Details',
        icon: <InfoCircleOutlined />,
      },
      {
        key: 'boards',
        label: 'Board Memberships',
        icon: <ApartmentOutlined />,
        badge: user.boardMemberships?.length || 0,
      },
      {
        key: 'activity',
        label: 'Activity Log',
        icon: <ClockCircleOutlined />,
      },
      {
        key: 'security',
        label: 'Security',
        icon: <SafetyOutlined />,
      },
    ];
  }, [user]);

  // Header metadata
  const metadata: MetadataItem[] = useMemo(() => {
    if (!user) return [];

    // Role color mapping
    const roleColors: Record<string, string> = {
      system_admin: 'red',
      group_chairman: 'purple',
      group_company_secretary: 'blue',
      board_secretary: 'cyan',
      chairman: 'purple',
      vice_chairman: 'geekblue',
      company_secretary: 'blue',
      board_member: 'default',
      committee_member: 'orange',
      executive_member: 'gold',
      presenter: 'lime',
      observer: 'default',
      guest: 'default',
    };

    // Status colors
    const statusColors: Record<string, string> = {
      active: 'success',
      inactive: 'default',
      pending: 'warning',
    };

    return [
      {
        label: 'Primary Role',
        value: user.primaryRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'tag',
        color: roleColors[user.primaryRole] || 'default',
      },
      {
        label: 'Status',
        value: user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Pending',
        type: 'tag',
        color: statusColors[user.status] || 'default',
      },
      {
        label: 'Boards',
        value: user.boardMemberships?.length || 0,
        type: 'badge',
        color: theme.primaryColor,
      },
      {
        label: 'MFA',
        value: user.mfaEnabled ? '✓ Enabled' : 'Disabled',
        type: 'tag',
        color: user.mfaEnabled ? 'green' : 'orange',
      },
      ...(user.lastLogin ? [{
        label: 'Last Login',
        value: dayjs(user.lastLogin).fromNow(),
        type: 'text' as const,
      }] : []),
    ];
  }, [user, theme]);

  // Primary action - Edit Profile
  const primaryAction: ActionButton | undefined = useMemo(() => {
    if (!user) return undefined;

    return {
      key: 'edit',
      label: 'Edit Profile',
      icon: <EditOutlined />,
      type: 'primary',
      onClick: () => {
        message.info('Edit user - Coming soon');
        // navigate(`/${currentBoard?.id}/users/${user.id}/edit`);
      },
    };
  }, [user]);

  // Dropdown actions
  const dropdownActions: MenuProps['items'] = useMemo(() => {
    if (!user) return [];

    const actions: MenuProps['items'] = [
      {
        key: 'resend-welcome',
        label: 'Resend Welcome Email',
        icon: <MailOutlined />,
        onClick: () => {
          message.info('Resend welcome email - Coming soon');
        },
      },
      {
        key: 'reset-password',
        label: 'Force Password Reset',
        icon: <LockOutlined />,
        onClick: () => {
          message.info('Force password reset - Coming soon');
        },
      },
    ];

    // Add divider and deactivate action
    actions.push({
      key: 'divider1',
      type: 'divider',
    });
    actions.push({
      key: 'deactivate',
      label: user.status === 'active' ? 'Deactivate User' : 'Activate User',
      icon: <StopOutlined />,
      danger: user.status === 'active',
      onClick: () => {
        message.info(user.status === 'active' ? 'Deactivate user - Coming soon' : 'Activate user - Coming soon');
      },
    });

    return actions;
  }, [user]);

  // Handle back navigation
  const handleBack = () => {
    navigate(`/${currentBoard?.id}/users`);
  };

  // Render tab content using separate tab components
  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'details':
        return <UserDetailsTab user={user} themeColor={theme.primaryColor} />;

      case 'boards':
        return <BoardMembershipsTab user={user} themeColor={theme.primaryColor} />;

      case 'activity':
        return <ActivityLogTab user={user} themeColor={theme.primaryColor} />;

      case 'security':
        return <SecurityTab user={user} themeColor={theme.primaryColor} />;

      default:
        return null;
    }
  };

  return (
    <DetailPageLayout
      backLabel="Back to Users"
      onBack={handleBack}
      icon={<UserOutlined />}
      title={user?.fullName || 'User Details'}
      description={user?.email}
      metadata={metadata}
      primaryAction={primaryAction}
      dropdownActions={dropdownActions}
      tabs={tabItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
      error={error}
      emptyStateMessage="User not found"
    >
      {renderTabContent()}
    </DetailPageLayout>
  );
};

export default UserDetailsPage;
