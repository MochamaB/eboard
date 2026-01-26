/**
 * Board Details Page
 * View and manage board information with tabbed navigation
 * Based on docs/MODULES/Module02_BoardManagement/02_BOARDS_PAGES.md
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
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
import { DetailsHeader, HorizontalTabs } from '../../components/common';
import type { HorizontalTabItem } from '../../components/common';

export const BoardDetailsPage: React.FC = () => {
  const { targetBoardId } = useParams<{ targetBoardId: string }>();
  const navigate = useNavigate();
  const { currentBoard, theme } = useBoardContext();
  
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Fetch board data from API
  const { data: board, isLoading, error } = useBoard(targetBoardId || '');

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

    return [
      {
        label: 'Type',
        value: board.type === 'main' ? 'Main Board' : 
               board.type === 'subsidiary' ? 'Subsidiary' :
               board.type === 'factory' ? 'Factory' : 'Committee',
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
      {
        label: 'Members',
        value: board.memberCount || 0,
        type: 'badge' as const,
        color: theme.primaryColor,
      },
      ...(board.type === 'main' || board.type === 'subsidiary' ? [{
        label: 'Committees',
        value: board.committeeCount || 0,
        type: 'badge' as const,
        color: theme.primaryColor,
      }] : []),
      {
        label: 'Meetings (2026)',
        value: board.meetingsThisYear || 0,
        type: 'badge' as const,
        color: theme.primaryColor,
      },
    ];
  }, [board, theme]);

  // Dropdown actions
  const dropdownActions: MenuProps['items'] = useMemo(() => {
    if (!board) return [];

    return [
      {
        key: 'edit',
        label: 'Edit Board',
        icon: <EditOutlined />,
        onClick: () => navigate(`/${currentBoard?.id}/boards/${targetBoardId}/edit`),
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
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Loading board details...</p>
      </div>
    );
  }

  // Error state
  if (error || !board) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Board not found</p>
        <Button onClick={() => navigate(`/${currentBoard?.id}/boards`)}>Back to Boards</Button>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ padding: 24 }}>
            {/* TODO: Implement Overview tab content */}
            <p>Overview tab content - Board statistics, recent activity, quick actions</p>
          </div>
        );

      case 'meetings':
        return (
          <div style={{ padding: 24 }}>
            {/* TODO: Implement Meetings tab content */}
            <p>Meetings tab content - List of meetings, upcoming/past meetings</p>
          </div>
        );

      case 'committees':
        return (
          <div style={{ padding: 24 }}>
            {/* TODO: Implement Committees tab content */}
            <p>Committees tab content - List of committees with cards</p>
          </div>
        );

      case 'members':
        return (
          <div style={{ padding: 24 }}>
            {/* TODO: Implement Members tab content */}
            <p>Members tab content - Members table with add/remove actions</p>
          </div>
        );

      case 'documents':
        return (
          <div style={{ padding: 24 }}>
            {/* TODO: Implement Documents tab content */}
            <p>Documents tab content - Shared documents and files</p>
          </div>
        );

      case 'settings':
        return (
          <div style={{ padding: 24 }}>
            {/* TODO: Implement Settings tab content */}
            <p>Settings tab content - Board settings form (quorum, voting threshold, etc.)</p>
          </div>
        );

      case 'branding':
        return (
          <div style={{ padding: 24 }}>
            {/* TODO: Implement Branding tab content */}
            <p>Branding tab content - Logo upload, color pickers, theme preview</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Back Button */}
      <Button
        type="link"
        onClick={() => navigate(`/${currentBoard?.id}/boards`)}
        style={{ paddingLeft: 0, marginBottom: 16 }}
      >
        ← Back to Boards
      </Button>

      {/* Details Header */}
      <DetailsHeader
        icon={<ApartmentOutlined />}
        title={board.name}
        description={board.description}
        metadata={metadata}
        dropdownActions={dropdownActions}
      />

      {/* Horizontal Tabs */}
      <HorizontalTabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 0 }}
        tabBarStyle={{
          borderBottom: `2px solid ${theme.borderColor}`,
          paddingLeft: 0,
        }}
      />

      {/* Tab Content */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '0 0 8px 8px',
        minHeight: 400,
      }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BoardDetailsPage;
