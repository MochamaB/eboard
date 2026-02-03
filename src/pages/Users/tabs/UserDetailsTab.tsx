/**
 * User Details Tab
 * Displays user's personal information and account statistics
 */

import React from 'react';
import { Card, Row, Col, Space, Typography, Tag, Statistic, Divider } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  GlobalOutlined,
  SafetyOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  LoginOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { User } from '../../../types/user.types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface UserDetailsTabProps {
  user: User;
  themeColor?: string;
}

// Info item component for cleaner layout
const InfoItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div style={{ marginBottom: 16 }}>
    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
      {label}
    </Text>
    <Space>
      {icon}
      <Text strong>{value}</Text>
    </Space>
  </div>
);

export const UserDetailsTab: React.FC<UserDetailsTabProps> = ({ user, themeColor }) => {
  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Quick Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#fafafa' }}>
              <Statistic
                title="Board Memberships"
                value={user.boardMemberships?.length || 0}
                prefix={<ApartmentOutlined />}
                valueStyle={{ color: themeColor || '#324721' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#fafafa' }}>
              <Statistic
                title="MFA Status"
                value={user.mfaEnabled ? 'Enabled' : 'Disabled'}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: user.mfaEnabled ? '#52c41a' : '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#fafafa' }}>
              <Statistic
                title="Last Login"
                value={user.lastLogin ? dayjs(user.lastLogin).fromNow() : 'Never'}
                prefix={<LoginOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#fafafa' }}>
              <Statistic
                title="Account Age"
                value={dayjs().diff(dayjs(user.createdAt), 'day')}
                suffix="days"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Contact Information */}
        <Card bordered={false} title="Contact Information">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <InfoItem
                icon={<MailOutlined />}
                label="Primary Email"
                value={user.email}
              />
            </Col>
            <Col xs={24} sm={12}>
              <InfoItem
                icon={<PhoneOutlined />}
                label="Primary Phone"
                value={user.phone || <Text type="secondary">Not provided</Text>}
              />
            </Col>
            {user.alternateEmail && (
              <Col xs={24} sm={12}>
                <InfoItem
                  icon={<MailOutlined />}
                  label="Alternate Email"
                  value={
                    <Space>
                      {user.alternateEmail}
                      <Tag color="blue" style={{ margin: 0 }}>Alternate</Tag>
                    </Space>
                  }
                />
              </Col>
            )}
            {user.alternatePhone && (
              <Col xs={24} sm={12}>
                <InfoItem
                  icon={<PhoneOutlined />}
                  label="Alternate Phone"
                  value={
                    <Space>
                      {user.alternatePhone}
                      <Tag color="blue" style={{ margin: 0 }}>Alternate</Tag>
                    </Space>
                  }
                />
              </Col>
            )}
          </Row>
        </Card>

        {/* Personal Information */}
        <Card bordered={false} title="Personal Information">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <InfoItem
                label="First Name"
                value={user.firstName}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <InfoItem
                label="Last Name"
                value={user.lastName}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <InfoItem
                icon={<IdcardOutlined />}
                label="Employee ID"
                value={user.employeeId || <Text type="secondary">Not assigned</Text>}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <InfoItem
                icon={<GlobalOutlined />}
                label="Timezone"
                value={user.timezone}
              />
            </Col>
          </Row>
        </Card>

        {/* Account Information */}
        <Card bordered={false} title="Account Information">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Account Status
                </Text>
                <Tag color={user.status === 'active' ? 'green' : user.status === 'pending' ? 'orange' : 'default'}>
                  {user.status.toUpperCase()}
                </Tag>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Primary Role
                </Text>
                <Tag color="blue">
                  {user.primaryRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Tag>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  MFA Status
                </Text>
                <Space>
                  {user.mfaEnabled ? (
                    <Tag color="green">✓ Enabled</Tag>
                  ) : (
                    <Tag color="orange">Disabled</Tag>
                  )}
                  {user.mfaSetupComplete ? (
                    <Tag color="green">Setup Complete</Tag>
                  ) : (
                    <Tag color="default">Setup Incomplete</Tag>
                  )}
                </Space>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <InfoItem
                icon={<SafetyCertificateOutlined />}
                label="Digital Certificate"
                value={
                  user.hasCertificate ? (
                    <Space direction="vertical" size={0}>
                      <Tag color="green">✓ Uploaded</Tag>
                      {user.certificateExpiry && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Expires: {dayjs(user.certificateExpiry).format('MMM D, YYYY')}
                        </Text>
                      )}
                    </Space>
                  ) : (
                    <Tag color="default">Not Uploaded</Tag>
                  )
                }
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <InfoItem
                icon={<ClockCircleOutlined />}
                label="Last Password Change"
                value={
                  user.lastPasswordChange
                    ? dayjs(user.lastPasswordChange).format('MMM D, YYYY')
                    : <Text type="secondary">Never changed</Text>
                }
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <InfoItem
                icon={<CalendarOutlined />}
                label="Account Created"
                value={dayjs(user.createdAt).format('MMM D, YYYY')}
              />
            </Col>
            {user.lockedUntil && (
              <Col xs={24}>
                <Divider />
                <Space>
                  <Tag color="red">⚠ Account Locked</Tag>
                  <Text type="secondary">
                    Locked until {dayjs(user.lockedUntil).format('MMM D, YYYY h:mm A')}
                  </Text>
                </Space>
              </Col>
            )}
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default UserDetailsTab;
