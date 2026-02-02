import React from 'react';
import { Card, Row, Col, Statistic, Space, Typography } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import type { Board } from '../../../types/board.types';
import { useBoardContext } from '../../../contexts';

const { Title, Text } = Typography;

interface OverviewTabProps {
  board: Board;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ board }) => {
  const { theme } = useBoardContext();

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Members"
                value={board.memberCount || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: theme.primaryColor }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Meetings (2026)"
                value={board.meetingsThisYear || 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: theme.infoColor }}
              />
            </Card>
          </Col>
          {(board.type === 'main' || board.type === 'subsidiary') && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Committees"
                  value={board.committeeCount || 0}
                  prefix={<ApartmentOutlined />}
                  valueStyle={{ color: theme.warningColor }}
                />
              </Card>
            </Col>
          )}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Documents"
                value={0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: theme.successColor }}
              />
            </Card>
          </Col>
        </Row>

        {/* Board Information */}
        <Card title="Board Information">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary" strong>Description</Text>
              <div style={{ marginTop: 4 }}>
                <Text>{board.description || 'No description provided'}</Text>
              </div>
            </div>

            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Text type="secondary" strong>Board Type</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>
                    {board.type === 'main' ? 'Main Board' :
                     board.type === 'subsidiary' ? 'Subsidiary' :
                     board.type === 'factory' ? 'Factory' : 'Committee'}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" strong>Status</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>
                    {board.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </div>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Recent Activity - Placeholder */}
        <Card title="Recent Activity">
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Text type="secondary">Recent activity timeline will be displayed here</Text>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default OverviewTab;
