import React from 'react';
import { Row, Col, Space, Breadcrumb, Typography, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  DownOutlined,
  AppstoreOutlined,
  BankOutlined,
  AuditOutlined,
  TeamOutlined,
  DollarOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBoardContext } from '../../contexts';
import { useAuth } from '../../contexts/AuthContext';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';
import type { Board } from '../../types/board.types';
import { BOARD_TYPE_LABELS } from '../../types/board.types';

const { Text } = Typography;

// Committee icons mapping
const committeeIcons: Record<string, React.ReactNode> = {
  all: <AppstoreOutlined />,
  board: <BankOutlined />,
  audit: <AuditOutlined />,
  hr: <TeamOutlined />,
  finance: <DollarOutlined />,
  nomination: <TeamOutlined />,
  sales: <DollarOutlined />,
  default: <SettingOutlined />,
};

const getCommitteeIcon = (key: string): React.ReactNode => {
  const lowerKey = key.toLowerCase();
  for (const [iconKey, icon] of Object.entries(committeeIcons)) {
    if (lowerKey.includes(iconKey)) return icon;
  }
  return committeeIcons.default;
};

// Board type labels (using imported constants)
const typeLabels = BOARD_TYPE_LABELS;

export const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasGlobalAccess } = useAuth();
  const { 
    currentBoard, 
    committees, 
    hasCommittees, 
    activeCommittee, 
    setActiveCommittee, 
    setCurrentBoard, 
    theme, 
    allBoards,
    viewMode,
    setViewMode,
    hasMultipleBoardAccess,
  } = useBoardContext();
  
  const breadcrumbs = generateBreadcrumbs(location.pathname);
  
  // Hide committees row on create/edit/wizard pages
  const shouldHideCommittees = 
    location.pathname.includes('/create') || 
    location.pathname.includes('/edit') ||
    location.pathname.includes('/wizard');
  
  // Build committee items with icons (committees are now boards with type='committee')
  const committeeItems = [
    { key: 'all', label: 'ALL', icon: committeeIcons.all },
    { key: 'board', label: currentBoard.shortName.toUpperCase(), icon: committeeIcons.board },
    ...committees.map(c => ({
      key: c.id,
      label: c.shortName.toUpperCase(),
      icon: getCommitteeIcon(c.shortName),
    })),
  ];

  // Board selector dropdown - group boards by type
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

  const handleBoardSelect = (board: Board) => {
    setCurrentBoard(board.id);
    // Preserve current module when switching boards (e.g., /ktda-main/users -> /temec/users)
    const pathParts = location.pathname.split('/');
    const currentModule = pathParts[2] || 'dashboard';
    navigate(`/${board.id}/${currentModule}`);
  };

  const getBoardLogo = (board: Board): string => {
    return board.branding?.logo?.small || board.branding?.logo?.main || '';
  };

  // Build "View All Boards" option if user has multi-board access or global access
  const showAllBoardsOption = hasMultipleBoardAccess || hasGlobalAccess;
  
  const allBoardsViewOption = showAllBoardsOption ? [{
    key: 'view-all-boards',
    label: (
      <Space>
        <AppstoreOutlined style={{ fontSize: 16 }} />
        <Text strong>{viewMode === 'all' ? '✓ Viewing All Boards' : 'View All My Boards'}</Text>
      </Space>
    ),
    onClick: () => {
      setViewMode('all');
      navigate('/boards'); // Navigate to global boards page
    },
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
  
  return (
    <div
      style={{
        background: 'transparent',
        padding: '16px 24px',
        borderLeft: `4px solid ${theme.primaryColor}`,
        marginLeft: 20,
        marginTop: 20,
      }}
    >
      {/* ROW 1: Board Selector + Breadcrumbs */}
      <Row align="middle" justify="space-between" style={{ paddingBottom: 12, borderBottom: '1px solid #dfdfe4' }}>
        {/* LEFT: Board Selector */}
        <Col>
          <Dropdown
            menu={{ items: boardMenuItems, style: { maxHeight: 400, overflow: 'auto' } }}
            trigger={['click']}
            placement="bottomLeft"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                background: '#fff',
                transition: 'all 0.2s',
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
              {/* Rounded Logo */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `2px solid ${theme.primaryColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={getBoardLogo(currentBoard)}
                  alt={currentBoard.shortName}
                  style={{ width: 28, height: 28, objectFit: 'contain' }}
                />
              </div>
              
              {/* Board Name & Type */}
              <div style={{ lineHeight: 1.3, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: theme.textPrimary }}>
                  {currentBoard.name}
                </div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>
                  {viewMode === 'all' ? 'Viewing All Boards' : (typeLabels[currentBoard.type] || currentBoard.type)}
                </div>
              </div>
              
              {/* Dropdown Arrow */}
              <DownOutlined style={{ fontSize: 11, color: theme.textSecondary, marginLeft: 8 }} />
            </div>
          </Dropdown>
        </Col>

        {/* RIGHT: Breadcrumbs + Back Link */}
        <Col style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Breadcrumb
              separator={
                <span style={{ fontSize: 16, color: theme.textSecondary, margin: '0 4px' }}>›</span>
              }
              items={[
                { title: <a href={`/${currentBoard.id}/dashboard`} style={{ color: theme.textSecondary }}>Home</a> },
                ...breadcrumbs.map((b, index) => ({
                  title: index === breadcrumbs.length - 1 ? (
                    <span style={{ color: theme.primaryColor, fontWeight: 500 }}>{b.title}</span>
                  ) : (
                    <a href={b.path} style={{ color: theme.textSecondary }}>{b.title}</a>
                  ),
                })),
              ]}
            />
            {/* Back Button */}
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              }}
            >
              Back
            </Button>
          </div>
        </Col>
      </Row>

      {/* ROW 2: COMMITTEES Label + Committee Pills (Hidden on create/edit/wizard pages) */}
      {!shouldHideCommittees && hasCommittees && (
        <Row align="middle" justify="space-between" style={{ paddingTop: 12 }}>
          {/* LEFT: COMMITTEES Label */}
          <Col>
            <Text 
              style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: theme.textSecondary,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Committees
            </Text>
          </Col>
          
          {/* RIGHT: Committee Pills */}
          <Col>
            <Space size={8}>
              {committeeItems.map(item => (
                <div
                  key={item.key}
                  onClick={() => setActiveCommittee(item.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    transition: 'all 0.2s',
                    background: activeCommittee === item.key ? theme.primaryColor : '#fff',
                    color: activeCommittee === item.key ? '#fff' : theme.textSecondary,
                    border: activeCommittee === item.key ? `1px solid ${theme.primaryColor}` : '1px solid #e0e0e0',
                  }}
                >
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </Space>
          </Col>
        </Row>
      )}
    </div>
  );
};
