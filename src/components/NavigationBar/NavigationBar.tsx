import React from 'react';
import { Row, Col, Space, Breadcrumb, Typography, Button } from 'antd';
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
import { useBoardContext } from '../../contexts';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';

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
  } = useBoardContext();
  
  const breadcrumbs = generateBreadcrumbs(location.pathname);
  
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
      key: c.id,
      label: c.shortName.toUpperCase(),
      icon: getCommitteeIcon(c.shortName),
    })),
  ];
  
  return (
    <div
      style={{
        background: 'transparent',
        padding: '0px 24px',
        marginLeft: 20,
        marginTop: 10,
      }}
    >
      {/* ROW 1: Breadcrumbs + Back Button */}
      <Row align="middle" justify="space-between" style={{ paddingBottom: 12, borderBottom: '1px solid #dfdfe4' }}>
        {/* LEFT: Breadcrumbs */}
        <Col>
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
        </Col>

        {/* RIGHT: Back Button */}
        <Col>
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
