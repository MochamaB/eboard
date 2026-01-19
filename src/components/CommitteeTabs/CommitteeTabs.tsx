import React from 'react';
import { Tabs } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { useOrgTheme } from '../../contexts';

interface CommitteeTabsProps {
  style?: React.CSSProperties;
}

export const CommitteeTabs: React.FC<CommitteeTabsProps> = ({ style }) => {
  const { currentOrg, committees, hasCommittees, activeCommittee, setActiveCommittee } = useOrgTheme();

  if (!hasCommittees) {
    return null;
  }

  const items = [
    {
      key: 'board',
      label: (
        <span>
          <ApartmentOutlined style={{ marginRight: 6 }} />
          {currentOrg.shortName || 'Board'}
        </span>
      ),
    },
    ...committees.map(committee => ({
      key: committee.id,
      label: committee.shortName,
    })),
  ];

  return (
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        paddingLeft: 24,
        paddingRight: 24,
        ...style,
      }}
    >
      <Tabs
        activeKey={activeCommittee || 'board'}
        onChange={(key) => setActiveCommittee(key)}
        items={items}
        style={{ marginBottom: 0 }}
        tabBarStyle={{ 
          marginBottom: 0,
          borderBottom: 'none',
        }}
        tabBarGutter={32}
        indicator={{ size: (origin) => origin - 16, align: 'center' }}
      />
    </div>
  );
};

export default CommitteeTabs;
