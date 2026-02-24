import React from 'react';
import { Row, Col, Space, Breadcrumb, Typography, Button, Select } from 'antd';
import {
  AppstoreOutlined,
  BankOutlined,
  AuditOutlined,
  TeamOutlined,
  DollarOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBoardContext, useMeetingPhase } from '../../contexts';
import { useResponsive } from '../../hooks';
import { responsiveHelpers } from '../../utils';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';
import { MeetingPhaseIndicator } from '../common';

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

export const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentBoard,
    committees,
    hasCommittees,
    activeCommittee,
    setActiveCommittee,
    theme,
    allBoards,
    routePrefix,
  } = useBoardContext();
  const { isInMeetingDetail, phaseInfo } = useMeetingPhase();
  const { isMobile, currentBreakpoint } = useResponsive();
  
  const rawBreadcrumbs = generateBreadcrumbs(location.pathname);
  
  // Context-aware back navigation logic
  const getBackNavigation = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Detail pages have 3+ segments: /:boardId/:module/:id
    if (pathSegments.length >= 3) {
      const module = pathSegments[1]; // meetings, boards, users, etc.
      const moduleTitle = getModuleDisplayName(module);
      
      // Special case for meeting room: go back to meeting details
      if (pathSegments.includes('room')) {
        return {
          label: 'Back to Meeting Details',
          action: () => navigate(`/${routePrefix}/meetings/${pathSegments[2]}`)
        };
      }
      
      return {
        label: `Back to ${moduleTitle}`,
        action: () => navigate(`/${routePrefix}/${module}`)
      };
    }
    
    // Create/edit pages have 3+ segments: /:boardId/:module/create or /:boardId/:module/:id/edit
    if (pathSegments.some(seg => ['create', 'edit'].includes(seg))) {
      const module = pathSegments[1];
      const moduleTitle = getModuleDisplayName(module);
      
      return {
        label: `Back to ${moduleTitle}`,
        action: () => navigate(`/${routePrefix}/${module}`)
      };
    }
    
    // Default: use browser history for index pages or unknown routes
    return {
      label: 'Back',
      action: () => navigate(-1)
    };
  };

  const getModuleDisplayName = (module: string): string => {
    const moduleNames: Record<string, string> = {
      meetings: 'Meetings',
      boards: 'Boards', 
      users: 'Users',
      documents: 'Documents',
      approvals: 'Approvals',
      notifications: 'Notifications',
      reports: 'Reports',
      roles: 'Roles',
      permissions: 'Permissions',
      settings: 'Settings'
    };
    
    return moduleNames[module] || module.charAt(0).toUpperCase() + module.slice(1);
  };

  const { label: backButtonLabel, action: handleBackNavigation } = getBackNavigation();
  
  // Post-process breadcrumbs to replace "Board Details" with actual board names
  const breadcrumbs = rawBreadcrumbs.map((crumb, index) => {
    if (crumb.title === 'Board Details') {
      // Extract board ID from current pathname (e.g., /ktda-ms/boards/2 or /ktda-ms/boards/2/details)
      const pathParts = location.pathname.split('/').filter(Boolean);
      const boardsIndex = pathParts.indexOf('boards');
      if (boardsIndex !== -1 && pathParts[boardsIndex + 1]) {
        const boardIdOrSlug = pathParts[boardsIndex + 1];
        
        // Look up board by numeric ID or slug
        const board = allBoards.find(b =>
          String(b.id) === boardIdOrSlug || b.slug === boardIdOrSlug
        );
        
        if (board) {
          return { ...crumb, title: board.name };
        }
      }
    }
    return crumb;
  });
  
  // Hide committees row on non-index pages
  // Index pages have exactly 2 path segments: /:boardId/:module (e.g., /ktda-ms/meetings)
  // Detail/create/edit pages have 3+ segments: /:boardId/:module/:id or /:boardId/:module/create
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isIndexPage = pathSegments.length === 2;
  const shouldHideCommittees = !isIndexPage;
  
  // Build committee items with icons (committees are now boards with type='committee')
  const committeeItems = [
    { key: 'all', label: 'ALL BOARDS', icon: committeeIcons.all },
    { key: 'board', label: currentBoard.shortName.toUpperCase(), icon: committeeIcons.board },
    ...committees.map(c => ({
      key: c.id.toString(),
      label: c.shortName.toUpperCase(),
      icon: getCommitteeIcon(c.shortName),
    })),
  ];

  // Responsive spacing
  const navPadding = responsiveHelpers.getResponsiveSpacing({
    xs: 16,
    md: 20,
    lg: 24
  }, currentBreakpoint);

  const navMargin = responsiveHelpers.getResponsiveSpacing({
    xs: 8,
    md: 12,
    lg: 16
  }, currentBreakpoint);
  
  return (
    <div
      className="container-responsive"
      style={{
        background: 'transparent',
        padding: `0 ${navPadding}px`,
        marginLeft: navMargin,
        marginTop: navMargin,
      }}
    >
      {/* ROW 1: Breadcrumbs + Phase Indicator + Back Button */}
      <Row align="middle" style={{ paddingBottom: 12, borderBottom: '1px solid #dfdfe4' }}>
        {/* LEFT: Breadcrumbs */}
        <Col flex="auto">
          <Breadcrumb
            separator={
              <span style={{
                fontSize: isMobile ? 12 : 14,
                color: theme.textSecondary,
                margin: '0 4px'
              }}>
                ›
              </span>
            }
            items={[
              {
                title: (
                  <a
                    href={`/${routePrefix}/dashboard`}
                    style={{
                      color: theme.textSecondary,
                      fontSize: isMobile ? 12 : 14,
                    }}
                  >
                    Home
                  </a>
                )
              },
              ...breadcrumbs.map((b, index) => ({
                title: index === breadcrumbs.length - 1 ? (
                  <span style={{
                    color: theme.primaryColor,
                    fontWeight: 500,
                    fontSize: isMobile ? 12 : 14,
                  }}>
                    {b.title}
                  </span>
                ) : (
                  <a
                    href={b.path}
                    style={{
                      color: theme.textSecondary,
                      fontSize: isMobile ? 12 : 14,
                    }}
                  >
                    {b.title}
                  </a>
                ),
              })),
            ]}
          />
        </Col>

        {/* CENTER: Meeting Phase Indicator (only show in meeting detail on desktop) */}
        {!isMobile && isInMeetingDetail && phaseInfo && (
          <Col flex="none" style={{ marginLeft: 24, marginRight: 24 }}>
            <MeetingPhaseIndicator
              phase={phaseInfo.phase}
              status={phaseInfo.status}
              compact
            />
          </Col>
        )}

        {/* RIGHT: Context-Aware Back Button (hidden on mobile) */}
        {!isMobile && (
          <Col flex="none" style={{ marginRight: -navMargin }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackNavigation}
              className="touch-target"
              style={{
                color: theme.primaryColor,
                height: responsiveHelpers.responsiveTouch.getTouchTargetSize(currentBreakpoint),
              }}
            >
              {backButtonLabel}
            </Button>
          </Col>
        )}
      </Row>

      {/* ROW 2: COMMITTEES Label + Committee Pills/Dropdown (Hidden on create/edit/wizard pages) */}
      {!shouldHideCommittees && hasCommittees && (
        <Row align="middle" justify="space-between" style={{ paddingTop: 12, gap: 12 }}>
          {/* LEFT: COMMITTEES Label */}
          <Col flex="none">
            <Text
              style={{
                fontSize: isMobile ? 10 : 11,
                fontWeight: 600,
                color: theme.textSecondary,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Committees
            </Text>
          </Col>

          {/* RIGHT: Committee Pills or Dropdown */}
          <Col flex="auto" style={{ textAlign: 'right' }}>
            {isMobile ? (
              // MOBILE: Dropdown for better UX - shows full names, no scrolling needed
              <Select
                value={activeCommittee}
                onChange={setActiveCommittee}
                style={{ width: '100%', maxWidth: 220, fontSize: 13 }}
                size="middle"
                popupMatchSelectWidth={false}
              >
                {committeeItems.map(item => (
                  <Select.Option key={item.key} value={item.key}>
                    <Space size={8}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 13 }}>{item.label}</span>
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            ) : (
              // TABLET/DESKTOP: Wrapping pills with full labels
              <Space size={[8, 8]} wrap style={{ justifyContent: 'flex-end' }}>
                {committeeItems.map(item => (
                  <div
                    key={item.key}
                    onClick={() => setActiveCommittee(item.key)}
                    className="touch-target"
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
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </Space>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};
