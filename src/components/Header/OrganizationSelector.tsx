import React, { useState, useRef, useEffect } from 'react';
import { Dropdown, Input, Space, Typography, Divider, Badge } from 'antd';
import {
  DownOutlined,
  SearchOutlined,
  BankOutlined,
  ApartmentOutlined,
  HomeOutlined,
  GlobalOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrgTheme } from '../../contexts';
import {
  organizations,
  getSubsidiaries,
  getFactoriesByZone,
  getUniqueZones,
} from '../../data/organizations';
import type { Organization } from '../../data/organizations';

const { Text } = Typography;

interface OrganizationSelectorProps {
  collapsed?: boolean;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ collapsed = false }) => {
  const { currentOrg, setCurrentOrg, logo } = useOrgTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [expandedZones, setExpandedZones] = useState<number[]>([]);
  const searchInputRef = useRef<any>(null);

  const subsidiaries = getSubsidiaries();
  const zones = getUniqueZones();

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSelect = (org: Organization) => {
    setCurrentOrg(org.id);
    navigate(`/${org.id}/dashboard`);
    setOpen(false);
    setSearchText('');
  };

  const toggleZone = (zone: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedZones(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  // Filter organizations by search
  const filterOrgs = (orgs: Organization[]) => {
    if (!searchText) return orgs;
    const lower = searchText.toLowerCase();
    return orgs.filter(org => 
      org.name.toLowerCase().includes(lower) || 
      org.shortName.toLowerCase().includes(lower)
    );
  };

  const ktdaGroup = organizations.find(org => org.id === 'ktda-group');
  const mainBoard = organizations.find(org => org.id === 'ktda-main');
  const filteredSubsidiaries = filterOrgs(subsidiaries);

  const renderOrgItem = (org: Organization, indent = 0) => (
    <div
      key={org.id}
      onClick={() => handleSelect(org)}
      style={{
        padding: '12px 16px',
        paddingLeft: 16 + indent * 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: currentOrg.id === org.id ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
        borderLeft: currentOrg.id === org.id ? '3px solid #1890ff' : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (currentOrg.id !== org.id) {
          e.currentTarget.style.background = '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (currentOrg.id !== org.id) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <img
        src={org.logo.small || org.logo.main}
        alt={org.shortName}
        style={{
          width: 24,
          height: 24,
          objectFit: 'contain',
          borderRadius: 4,
        }}
      />
      <Text style={{ flex: 1 }}>{org.name}</Text>
      {org.committees && org.committees.length > 0 && (
        <Badge count={org.committees.length} size="small" style={{ backgroundColor: '#722ed1' }} />
      )}
    </div>
  );

  const dropdownContent = (
    <div
      style={{
        width: 450,
        maxHeight: 480,
        overflow: 'auto',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <Input
          ref={searchInputRef}
          placeholder="Search organizations..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      {/* KTDA Group */}
      {ktdaGroup && (!searchText || ktdaGroup.name.toLowerCase().includes(searchText.toLowerCase())) && (
        <>
          <div style={{ padding: '8px 12px', background: '#fafafa' }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
              <GlobalOutlined style={{ marginRight: 6 }} />
              KTDA Group
            </Text>
          </div>
          {renderOrgItem(ktdaGroup)}
        </>
      )}

      <Divider style={{ margin: '4px 0' }} />

      {/* Main Board */}
      {mainBoard && (!searchText || mainBoard.name.toLowerCase().includes(searchText.toLowerCase())) && (
        <>
          <div style={{ padding: '8px 12px', background: '#fafafa' }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
              <BankOutlined style={{ marginRight: 6, color: '#1890ff' }} />
              Main Board
            </Text>
          </div>
          {renderOrgItem(mainBoard)}
        </>
      )}

      <Divider style={{ margin: '4px 0' }} />

      {/* Subsidiaries */}
      <div style={{ padding: '8px 12px', background: '#fafafa' }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
          <ApartmentOutlined style={{ marginRight: 6, color: '#52c41a' }} />
          Subsidiaries ({subsidiaries.length})
        </Text>
      </div>
      {filteredSubsidiaries.map(org => renderOrgItem(org))}

      {filteredSubsidiaries.length === 0 && searchText && (
        <div style={{ padding: '8px 12px', color: '#999' }}>
          <Text type="secondary">No subsidiaries match "{searchText}"</Text>
        </div>
      )}

      <Divider style={{ margin: '4px 0' }} />

      {/* Factories by Zone */}
      <div style={{ padding: '8px 12px', background: '#fafafa' }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
          <HomeOutlined style={{ marginRight: 6, color: '#faad14' }} />
          Factories by Zone ({organizations.filter(o => o.type === 'factory').length})
        </Text>
      </div>

      {zones.map(zone => {
        const zoneFactories = filterOrgs(getFactoriesByZone(zone));
        if (zoneFactories.length === 0 && searchText) return null;
        
        const isExpanded = expandedZones.includes(zone);
        
        return (
          <div key={zone}>
            <div
              onClick={(e) => toggleZone(zone, e)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <RightOutlined 
                style={{ 
                  fontSize: 10, 
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }} 
              />
              <Text>Zone {zone}</Text>
              <Badge count={zoneFactories.length} size="small" style={{ backgroundColor: '#faad14' }} />
            </div>
            {isExpanded && zoneFactories.map(org => renderOrgItem(org, 1))}
          </div>
        );
      })}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
    >
      <Space
        style={{
          cursor: 'pointer',
          padding: '4px 12px',
          borderRadius: 6,
          border: '1px solid #e8e8e8',
          background: '#fafafa',
          minWidth: collapsed ? 'auto' : 200,
        }}
      >
        <img 
          src={logo} 
          alt={currentOrg.shortName}
          style={{ height: 28, width: 'auto', objectFit: 'contain' }}
        />
        {!collapsed && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 13 }}>{currentOrg.shortName}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{currentOrg.type}</Text>
            </div>
            <DownOutlined style={{ fontSize: 10, color: '#999' }} />
          </>
        )}
      </Space>
    </Dropdown>
  );
};

export default OrganizationSelector;
