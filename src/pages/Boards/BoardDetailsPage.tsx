/**
 * Board Details Page
 * View and manage board information with tabbed navigation
 * Based on docs/MODULES/Module02_BoardManagement/02_BOARDS_PAGES.md
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  ApartmentOutlined,
  EditOutlined,
  StopOutlined,
  SettingOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BgColorsOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { useBoardContext } from '../../contexts';
import { useBoard } from '../../hooks/api';
import { useLookups } from '../../contexts/LookupsContext';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { DetailPageLayout } from '../../components/common';
import type { HorizontalTabItem } from '../../components/common';
import {
  OverviewTab,
  MeetingsTab,
  MembersTab,
  CommitteesTab,
  DocumentsTab,
  SettingsTab,
  BrandingTab,
} from './tabs';

export const BoardDetailsPage: React.FC = () => {
  const { targetBoardId } = useParams<{ targetBoardId: string }>();
  const navigate = useNavigate();
  const { currentBoard, theme, routePrefix, logo } = useBoardContext();
  const { getBoardTypeByCode } = useLookups();
  
  const [activeTab, setActiveTab] = useTabNavigation('overview');

  // Fetch board data from API using numeric ID parsed from URL
  const numericBoardId = targetBoardId ? parseInt(targetBoardId, 10) : currentBoard?.id || 0;
  const { data: board, isLoading, error } = useBoard(isNaN(numericBoardId) ? 0 : numericBoardId);

  // Tab items with badges
  const tabItems: HorizontalTabItem[] = useMemo(() => {
    if (!board) return [];

    const items: HorizontalTabItem[] = [
      {
        key: 'overview',
        label: 'Overview',
        icon: <EyeOutlined />,
      },
      {
        key: 'meetings',
        label: 'Meetings',
        icon: <CalendarOutlined />,
        badge: board.meetingsThisYear || 0,
      },
      {
        key: 'members',
        label: 'Members',
        icon: <TeamOutlined />,
        badge: board.memberCount || 0,
      },
      {
        key: 'documents',
        label: 'Documents',
        icon: <FileTextOutlined />,
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingOutlined />,
      },
    ];

    // Add Committees tab for main boards and subsidiaries
    if (board.type === 'main' || board.type === 'subsidiary') {
      items.splice(3, 0, {
        key: 'committees',
        label: 'Committees',
        icon: <ApartmentOutlined />,
        badge: board.committeeCount || 0,
      });
    }

    // Add Branding tab for main boards and subsidiaries
    if (board.type === 'main' || board.type === 'subsidiary') {
      items.push({
        key: 'branding',
        label: 'Branding',
        icon: <BgColorsOutlined />,
      });
    }

    return items;
  }, [board]);

  // Header metadata
  const metadata = useMemo(() => {
    if (!board) return [];

    const typeInfo = getBoardTypeByCode(board.type);

    return [
      {
        label: 'Type',
        value: typeInfo?.name || board.type,
        type: 'tag' as const,
        color: board.type === 'main' ? 'purple' :
               board.type === 'subsidiary' ? 'blue' :
               board.type === 'factory' ? 'green' : 'orange',
      },
      {
        label: 'Status',
        value: board.status === 'active' ? 'Active' : 'Inactive',
        type: 'tag' as const,
        color: board.status === 'active' ? theme.successColor : 'default',
      },
    ];
  }, [board, theme, getBoardTypeByCode]);

  // Dropdown actions
  const dropdownActions: MenuProps['items'] = useMemo(() => {
    if (!board) return [];

    return [
      {
        key: 'edit',
        label: 'Edit Board',
        icon: <EditOutlined />,
        onClick: () => navigate(`/${routePrefix}/boards/${board.id}/edit`),
      },
      {
        key: 'deactivate',
        label: board.status === 'active' ? 'Deactivate Board' : 'Activate Board',
        icon: <StopOutlined />,
        danger: board.status === 'active',
        onClick: () => {
          message.info(board.status === 'active' ? 'Board deactivated' : 'Board activated');
        },
      },
    ];
  }, [board, targetBoardId, currentBoard?.id, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <DetailPageLayout
        title=""
        isLoading
      >
        {null}
      </DetailPageLayout>
    );
  }

  // Error state
  if (error || !board) {
    const errorMessage = typeof error === 'string' ? error : error?.message;
    return (
      <DetailPageLayout
        title=""
        error={errorMessage || 'Board not found'}
        showBackButton={false}
      >
        {null}
      </DetailPageLayout>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab board={board} />;

      case 'meetings':
        return <MeetingsTab boardId={board.id} />;

      case 'committees':
        return <CommitteesTab board={board} />;

      case 'members':
        return <MembersTab board={board} />;

      case 'documents':
        return <DocumentsTab board={board} />;

      case 'settings':
        return <SettingsTab board={board} />;

      case 'branding':
        return <BrandingTab board={board} />;

      default:
        return null;
    }
  };

  return (
    <DetailPageLayout
      icon={logo ? <img src={logo} alt={board.name} style={{ width: 40, height: 40, objectFit: 'contain' }} /> : <ApartmentOutlined />}
      title={board.name}
      description={board.description || undefined}
      metadata={metadata}
      dropdownActions={dropdownActions}
      tabs={tabItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabBarStyle={{
        borderBottom: `2px solid ${theme.borderColor}`,
      }}
    >
      {renderTabContent()}
    </DetailPageLayout>
  );
}

export default BoardDetailsPage;
