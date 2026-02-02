import React, { useState } from 'react';
import { Button, Card, Row, Col, Space, Typography, Tag, Avatar, Input, Flex, Empty } from 'antd';
import {
  ApartmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import { useBoardContext } from '../../../contexts';
import type { Board } from '../../../types/board.types';

const { Text, Title } = Typography;

interface CommitteesTabProps {
  board: Board;
}

// Mock committee type - will be replaced with actual API
interface Committee {
  id: string;
  name: string;
  shortName: string;
  description: string;
  type: 'committee';
  status: 'active' | 'inactive';
  memberCount: number;
  meetingsThisYear: number;
  chairman?: {
    name: string;
    avatar?: string;
  };
}

export const CommitteesTab: React.FC<CommitteesTabProps> = ({ board }) => {
  const { theme } = useBoardContext();
  const [searchValue, setSearchValue] = useState('');

  // Mock data - will be replaced with API call
  const mockCommittees: Committee[] = [];

  // Filter committees based on search
  const filteredCommittees = mockCommittees.filter(committee =>
    !searchValue ||
    committee.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    committee.shortName.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Header with Add Button */}
        <Flex justify="space-between" align="center">
          <div>
            <Text strong style={{ fontSize: 16 }}>Board Committees</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Committees under {board.name}
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // TODO: Navigate to create committee
            }}
          >
            Create Committee
          </Button>
        </Flex>

        {/* Search */}
        <Input
          placeholder="Search committees..."
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
          style={{ width: 320 }}
        />

        {/* Committees Grid */}
        {filteredCommittees.length === 0 ? (
          <div style={{
            padding: 48,
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px dashed #d9d9d9'
          }}>
            <ApartmentOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 16 }}>
                No committees found
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Create committees to organize board work effectively
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginTop: 16 }}
              onClick={() => {
                // TODO: Navigate to create committee
              }}
            >
              Create First Committee
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredCommittees.map((committee) => (
              <Col xs={24} sm={12} lg={8} key={committee.id}>
                <Card
                  hoverable
                  onClick={() => {
                    // TODO: Navigate to committee details
                  }}
                  styles={{
                    body: { padding: 20 }
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Header */}
                    <Flex justify="space-between" align="flex-start">
                      <Space>
                        <Avatar
                          icon={<ApartmentOutlined />}
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <div>
                          <Title level={5} style={{ margin: 0 }}>
                            {committee.name}
                          </Title>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {committee.shortName}
                          </Text>
                        </div>
                      </Space>
                      <Tag color={committee.status === 'active' ? 'success' : 'default'}>
                        {committee.status === 'active' ? 'Active' : 'Inactive'}
                      </Tag>
                    </Flex>

                    {/* Description */}
                    <Text type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 13 }}>
                      {committee.description}
                    </Text>

                    {/* Chairman */}
                    {committee.chairman && (
                      <Flex align="center" gap={8}>
                        <Avatar
                          size="small"
                          src={committee.chairman.avatar}
                          style={{ backgroundColor: theme.infoColor }}
                        >
                          {committee.chairman.name.charAt(0)}
                        </Avatar>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>Chairman</Text>
                          <div>
                            <Text strong style={{ fontSize: 12 }}>
                              {committee.chairman.name}
                            </Text>
                          </div>
                        </div>
                      </Flex>
                    )}

                    {/* Stats */}
                    <Flex justify="space-between">
                      <Space size={4}>
                        <TeamOutlined style={{ color: theme.textSecondary }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {committee.memberCount} members
                        </Text>
                      </Space>
                      <Space size={4}>
                        <CalendarOutlined style={{ color: theme.textSecondary }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {committee.meetingsThisYear} meetings
                        </Text>
                      </Space>
                    </Flex>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
};

export default CommitteesTab;
