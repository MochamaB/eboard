/**
 * BoardSelector Component
 * Compact board selector for the header
 * Allows switching between boards with hierarchical grouping
 */

import React from 'react';
import { Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  DownOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBoardContext } from '../../contexts';
import { useAuth } from '../../contexts/AuthContext';
import type { Board } from '../../types/board.types';

const { Text } = Typography;

export const BoardSelector: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasGlobalAccess } = useAuth();
  const { 
    currentBoard, 
    setCurrentBoard, 
    theme, 
    allBoards,
    viewMode,
    setViewMode,
    hasMultipleBoardAccess,
  } = useBoardContext();

  // Group boards by type
  const mainBoard = allBoards.find(b => b.type === 'main');
  const subsidiaries = allBoards.filter(b => b.type === 'subsidiary');
  const factories = allBoards.filter(b => b.type === 'factory');
  
  // Group factories by zone
  const factoriesByZone = factories.reduce((acc, factory) => {
    const zone = factory.zone || 'zone_1';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(factory);
    return acc;
  }, {} as Record<string, Board[]>);
  const zones = Object.keys(factoriesByZone).sort();

  // Get current module from URL path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isAllView = pathParts[0] === 'all';
  const currentModule = isAllView ? (pathParts[1] || 'dashboard') : (pathParts[1] || 'dashboard');

  // Map module to display name for "View All [Module]" label
  const moduleLabels: Record<string, string> = {
    'dashboard': 'Dashboards',
    'meetings': 'Meetings',
    'users': 'Users',
    'documents': 'Documents',
    'members': 'Members',
    'boards': 'Boards',
    'settings': 'Settings',
  };
  const moduleLabel = moduleLabels[currentModule] || 'Boards';

  const handleBoardSelect = (board: Board) => {
    setCurrentBoard(board.id);
    setViewMode('single');
    // Preserve current module when switching boards
    navigate(`/${board.id}/${currentModule}`);
  };

  const handleViewAll = () => {
    setViewMode('all');
    // Navigate to /all/{currentModule}
    navigate(`/all/${currentModule}`);
  };

  const getBoardLogo = (board: Board): string => {
    return board.branding?.logo?.main || board.branding?.logo?.small || '';
  };

  // Build "View All [Module]" option - context aware
  const showAllBoardsOption = hasMultipleBoardAccess || hasGlobalAccess;
  
  const allBoardsViewOption = showAllBoardsOption ? [{
    key: 'view-all',
    label: (
      <Space>
        <AppstoreOutlined style={{ fontSize: 16 }} />
        <Text strong>{viewMode === 'all' ? `✓ Viewing All ${moduleLabel}` : `View All ${moduleLabel}`}</Text>
      </Space>
    ),
    onClick: handleViewAll,
    style: { 
      borderBottom: '1px solid #f0f0f0', 
      paddingBottom: 8, 
      marginBottom: 8,
      background: viewMode === 'all' ? 'rgba(50, 71, 33, 0.05)' : undefined,
    },
  }] : [];

  const boardMenuItems: MenuProps['items'] = [
    ...allBoardsViewOption,
    {
      key: 'main-header',
      type: 'group' as const,
      label: <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>MAIN BOARD</Text>,
      children: mainBoard ? [{
        key: mainBoard.id,
        label: (
          <Space>
            <img src={getBoardLogo(mainBoard)} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
            {mainBoard.name}
          </Space>
        ),
        onClick: () => handleBoardSelect(mainBoard),
      }] : [],
    },
    {
      key: 'subsidiaries-header',
      type: 'group',
      label: <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>SUBSIDIARIES</Text>,
      children: subsidiaries.map(board => ({
        key: board.id,
        label: (
          <Space>
            <img src={getBoardLogo(board)} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
            {board.name}
          </Space>
        ),
        onClick: () => handleBoardSelect(board),
      })),
    },
    ...zones.map(zone => ({
      key: `zone-${zone}`,
      type: 'group' as const,
      label: <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>{zone.replace('_', ' ').toUpperCase()} FACTORIES</Text>,
      children: factoriesByZone[zone].map(board => ({
        key: board.id,
        label: (
          <Space>
            <img src={getBoardLogo(board)} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
            {board.name}
          </Space>
        ),
        onClick: () => handleBoardSelect(board),
      })),
    })),
  ];

  // Determine display based on view mode
  const isViewingAll = isAllView || viewMode === 'all';

  return (
    <div style={{ borderLeft: `4px solid ${theme.primaryColor}`, paddingLeft: 0 }}>
      <Dropdown
        menu={{ items: boardMenuItems, style: { maxHeight: 400, overflow: 'auto' } }}
        trigger={['click']}
        placement="bottomLeft"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 12px',
            borderRadius: 6,
            border: '1px solid #e0e0e0',
            background: '#fff',
            transition: 'all 0.2s',
            height: 50,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.primaryColor;
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
        {/* Compact Logo or Global Icon */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: isViewingAll ? theme.primaryColor : '#fff',
            border: `2px solid ${theme.primaryColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {isViewingAll ? (
            <AppstoreOutlined style={{ fontSize: 18, color: '#fff' }} />
          ) : (
            <img
              src={getBoardLogo(currentBoard)}
              alt={currentBoard?.shortName}
              style={{ width: 26, height: 26, objectFit: 'contain' }}
            />
          )}
        </div>
        
        {/* Board Name or "View All" - Hidden on mobile */}
        <div 
          style={{ 
            fontWeight: 500, 
            fontSize: 15, 
            color: theme.textPrimary,
            whiteSpace: 'nowrap',
          }}
          className="board-selector-name"
        >
          {isViewingAll ? `All ${moduleLabel}` : currentBoard?.shortName}
        </div>
        
        {/* Dropdown Arrow */}
        <DownOutlined style={{ fontSize: 10, color: theme.textSecondary }} />
        </div>
      </Dropdown>
    </div>
  );
};

export default BoardSelector;
