/**
 * Security Tab
 * Manages MFA, certificates, passwords, and active sessions
 */

import React, { useState } from 'react';
import { Card, Row, Col, Space, Button, Table, Tag, Typography, message, Popconfirm, Tooltip, Divider } from 'antd';
import {
  SafetyOutlined,
  LockOutlined,
  MobileOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  MailOutlined,
  DesktopOutlined,
  TabletOutlined,
  GlobalOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User, UserSession } from '../../../types/user.types';
import { useUserSessions, useTerminateSession, useTerminateAllUserSessions } from '../../../hooks/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface SecurityTabProps {
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
      {value}
    </Space>
  </div>
);

export const SecurityTab: React.FC<SecurityTabProps> = ({ user, themeColor }) => {
  const [showAllSessions, setShowAllSessions] = useState(false);

  // Fetch sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useUserSessions(user.id, !showAllSessions);
  const terminateSessionMutation = useTerminateSession();
  const terminateAllSessionsMutation = useTerminateAllUserSessions();

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <MobileOutlined />;
      case 'tablet':
        return <TabletOutlined />;
      case 'desktop':
        return <DesktopOutlined />;
      default:
        return <DesktopOutlined />;
    }
  };

  // Handle terminate session
  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSessionMutation.mutateAsync(sessionId);
      message.success('Session terminated successfully');
    } catch (error) {
      message.error('Failed to terminate session');
    }
  };

  // Handle terminate all sessions
  const handleTerminateAllSessions = async () => {
    try {
      const result = await terminateAllSessionsMutation.mutateAsync(user.id);
      message.success(`Terminated ${result.count} active session(s)`);
    } catch (error) {
      message.error('Failed to terminate sessions');
    }
  };

  // Sessions table columns
  const sessionsColumns: ColumnsType<UserSession> = [
    {
      title: 'Device',
      key: 'device',
      width: 250,
      render: (_, record) => (
        <Space>
          {getDeviceIcon(record.deviceType)}
          <Space size={0} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text strong>{record.deviceName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.browser} {record.browserVersion}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.operatingSystem}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 180,
      render: (_, record) => (
        <Space size={0} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Space size={4}>
            <GlobalOutlined style={{ fontSize: 12 }} />
            <Text>{record.location || 'Unknown'}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.ipAddress}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
        ) : (
          <Tag color="default">Expired</Tag>
        ),
    },
    {
      title: 'Last Accessed',
      dataIndex: 'lastAccessedAt',
      key: 'lastAccessedAt',
      width: 150,
      sorter: (a, b) => dayjs(a.lastAccessedAt).unix() - dayjs(b.lastAccessedAt).unix(),
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('MMM D, YYYY h:mm A')}>
          <span>{dayjs(date).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) =>
        record.isActive ? (
          <Popconfirm
            title="Terminate Session"
            description="This will log out this device. Continue?"
            onConfirm={() => handleTerminateSession(record.id)}
            okText="Terminate"
            okType="danger"
            cancelText="Cancel"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={terminateSessionMutation.isPending}
            >
              Terminate
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const activeSessions = sessionsData?.data.filter(s => s.isActive).length || 0;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 24]}>
        {/* MFA Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyOutlined />
                <span>Multi-Factor Authentication</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <InfoItem
              icon={user.mfaEnabled ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <WarningOutlined style={{ color: '#fa8c16' }} />}
              label="MFA Status"
              value={
                user.mfaEnabled ? (
                  <Tag color="green">Enabled</Tag>
                ) : (
                  <Tag color="orange">Disabled</Tag>
                )
              }
            />
            <InfoItem
              label="Setup Status"
              value={
                user.mfaSetupComplete ? (
                  <Tag color="green">✓ Complete</Tag>
                ) : (
                  <Tag color="default">Not Complete</Tag>
                )
              }
            />
            <Divider style={{ margin: '16px 0' }} />
            <Space wrap>
              {!user.mfaEnabled || !user.mfaSetupComplete ? (
                <Button type="primary" icon={<SafetyOutlined />}>
                  Setup MFA
                </Button>
              ) : (
                <>
                  <Button type="default" icon={<KeyOutlined />}>
                    Reset MFA
                  </Button>
                  <Button type="default" icon={<DownloadOutlined />}>
                    Backup Codes
                  </Button>
                </>
              )}
            </Space>
          </Card>
        </Col>

        {/* Digital Certificate Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                <span>Digital Certificate</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <InfoItem
              icon={user.hasCertificate ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : undefined}
              label="Certificate Status"
              value={
                user.hasCertificate ? (
                  <Tag color="green">Uploaded</Tag>
                ) : (
                  <Tag color="default">Not Uploaded</Tag>
                )
              }
            />
            {user.certificateExpiry && (
              <InfoItem
                label="Expiry Date"
                value={
                  <Space>
                    <span>{dayjs(user.certificateExpiry).format('MMM D, YYYY')}</span>
                    {dayjs(user.certificateExpiry).isBefore(dayjs().add(30, 'days')) && (
                      <Tag color="warning" icon={<WarningOutlined />}>
                        Expires Soon
                      </Tag>
                    )}
                  </Space>
                }
              />
            )}
            <Divider style={{ margin: '16px 0' }} />
            <Space wrap>
              <Button type="primary" icon={<SafetyCertificateOutlined />}>
                {user.hasCertificate ? 'Replace' : 'Upload'}
              </Button>
              {user.hasCertificate && (
                <Button type="default" danger icon={<DeleteOutlined />}>
                  Remove
                </Button>
              )}
            </Space>
          </Card>
        </Col>

        {/* Password Management */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <LockOutlined />
                <span>Password Management</span>
              </Space>
            }
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={8}>
                <InfoItem
                  icon={<LockOutlined />}
                  label="Last Password Change"
                  value={
                    user.lastPasswordChange
                      ? dayjs(user.lastPasswordChange).format('MMM D, YYYY')
                      : 'Never changed'
                  }
                />
              </Col>
              {user.lockedUntil && (
                <Col xs={24} sm={12} md={8}>
                  <InfoItem
                    icon={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                    label="Account Status"
                    value={
                      <Tag color="red">
                        Locked until {dayjs(user.lockedUntil).format('MMM D, YYYY h:mm A')}
                      </Tag>
                    }
                  />
                </Col>
              )}
              <Col xs={24}>
                <Divider style={{ margin: '8px 0 16px' }} />
                <Space wrap>
                  <Button type="primary" icon={<LockOutlined />}>
                    Force Password Reset
                  </Button>
                  <Button type="default" icon={<MailOutlined />}>
                    Resend Welcome Email
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Active Sessions Section */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <DesktopOutlined />
                <span>Active Sessions</span>
                <Tag color={themeColor}>{activeSessions}</Tag>
              </Space>
            }
            extra={
              activeSessions > 0 && (
                <Popconfirm
                  title="Terminate All Sessions"
                  description="This will log out this user from all devices. Continue?"
                  onConfirm={handleTerminateAllSessions}
                  okText="Terminate All"
                  okType="danger"
                  cancelText="Cancel"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={terminateAllSessionsMutation.isPending}
                  >
                    Terminate All
                  </Button>
                </Popconfirm>
              )
            }
          >
            <Space style={{ marginBottom: 16 }}>
              <Button
                type={showAllSessions ? 'default' : 'primary'}
                size="small"
                onClick={() => setShowAllSessions(false)}
              >
                Active Only ({activeSessions})
              </Button>
              <Button
                type={showAllSessions ? 'primary' : 'default'}
                size="small"
                onClick={() => setShowAllSessions(true)}
              >
                All Sessions ({sessionsData?.total || 0})
              </Button>
            </Space>

            <Table
              columns={sessionsColumns}
              dataSource={sessionsData?.data || []}
              rowKey="id"
              loading={sessionsLoading}
              pagination={false}
              scroll={{ x: 800 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SecurityTab;
