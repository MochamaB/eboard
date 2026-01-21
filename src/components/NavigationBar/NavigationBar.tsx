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
import { useOrgTheme } from '../../contexts';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';
import {
  organizations,
  getSubsidiaries,
  getFactoriesByZone,
  getUniqueZones,
} from '../../data/organizations';
import type { Organization } from '../../data/organizations';

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

// Organization type labels
const typeLabels: Record<string, string> = {
  group: 'Group',
  main: 'Main Board',
  subsidiary: 'Subsidiary',
  factory: 'Factory',
};

export const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentOrg, committees, hasCommittees, activeCommittee, setActiveCommittee, setCurrentOrg, theme } = useOrgTheme();
  
  const breadcrumbs = generateBreadcrumbs(location.pathname);
  
  // Hide committees row on create/edit/wizard pages
  const shouldHideCommittees = 
    location.pathname.includes('/create') || 
    location.pathname.includes('/edit') ||
    location.pathname.includes('/wizard');
  
  // Build committee items with icons
  const committeeItems = [
    { key: 'all', label: 'ALL', icon: committeeIcons.all },
    { key: 'board', label: currentOrg.shortName.toUpperCase(), icon: committeeIcons.board },
    ...committees.map(c => ({
      key: c.id,
      label: c.shortName.toUpperCase(),
      icon: getCommitteeIcon(c.shortName),
    })),
  ];

  // Organization selector dropdown
  const subsidiaries = getSubsidiaries();
  const zones = getUniqueZones();
  const ktdaGroup = organizations.find(org => org.id === 'ktda-group');
  const mainBoard = organizations.find(org => org.id === 'ktda-main');

  const handleOrgSelect = (org: Organization) => {
    setCurrentOrg(org.id);
    navigate(`/${org.id}/dashboard`);
  };

  const orgMenuItems: MenuProps['items'] = [
    {
      key: 'group-header',
      type: 'group',
      label: <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>KTDA GROUP</Text>,
      children: ktdaGroup ? [{
        key: ktdaGroup.id,
        label: (
          <Space>
            <img src={ktdaGroup.logo.small || ktdaGroup.logo.main} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
            {ktdaGroup.name}
          </Space>
        ),
        onClick: () => handleOrgSelect(ktdaGroup),
      }] : [],
    },
    {
      key: 'main-header',
      type: 'group',
      label: <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>MAIN BOARD</Text>,
      children: mainBoard ? [{
        key: mainBoard.id,
        label: (
          <Space>
            <img src={mainBoard.logo.small || mainBoard.logo.main} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
            {mainBoard.name}
          </Space>
        ),
        onClick: () => handleOrgSelect(mainBoard),
      }] : [],
    },
    {
      key: 'subsidiaries-header',
      type: 'group',
      label: <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>SUBSIDIARIES</Text>,
      children: subsidiaries.map(org => ({
        key: org.id,
        label: (
          <Space>
            <img src={org.logo.small || org.logo.main} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
            {org.name}
          </Space>
        ),
        onClick: () => handleOrgSelect(org),
      })),
    },
    ...zones.map(zone => ({
      key: `zone-${zone}`,
      type: 'group' as const,
      label: <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>ZONE {zone} FACTORIES</Text>,
      children: getFactoriesByZone(zone).map(org => ({
        key: org.id,
        label: (
          <Space>
            <img src={org.logo.small || org.logo.main} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
            {org.name}
          </Space>
        ),
        onClick: () => handleOrgSelect(org),
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
      {/* ROW 1: Organization Selector + Breadcrumbs */}
      <Row align="middle" justify="space-between" style={{ paddingBottom: 12, borderBottom: '1px solid #dfdfe4' }}>
        {/* LEFT: Organization Selector */}
        <Col>
          <Dropdown
            menu={{ items: orgMenuItems, style: { maxHeight: 400, overflow: 'auto' } }}
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
                  src={currentOrg.logo.small || currentOrg.logo.main}
                  alt={currentOrg.shortName}
                  style={{ width: 28, height: 28, objectFit: 'contain' }}
                />
              </div>
              
              {/* Organization Name & Type */}
              <div style={{ lineHeight: 1.3, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: theme.textPrimary }}>
                  {currentOrg.name}
                </div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>
                  {typeLabels[currentOrg.type] || currentOrg.type}
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
                { title: <a href={`/${currentOrg.id}/dashboard`} style={{ color: theme.textSecondary }}>Home</a> },
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
