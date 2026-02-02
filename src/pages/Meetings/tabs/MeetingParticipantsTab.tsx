/**
 * Meeting Participants Tab
 * Displays participant list with RSVP status and attendance tracking
 */

import React from 'react';
import { Table, Tag, Avatar, Space, Typography, Card, Progress, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Meeting, MeetingParticipant } from '../../../types/meeting.types';

const { Text } = Typography;

interface MeetingParticipantsTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingParticipantsTab: React.FC<MeetingParticipantsTabProps> = ({
  meeting,
  themeColor = '#1890ff',
}) => {
  const participants = meeting.participants || [];

  // Calculate RSVP stats
  const rsvpStats = {
    accepted: participants.filter(p => p.rsvpStatus === 'accepted').length,
    declined: participants.filter(p => p.rsvpStatus === 'declined').length,
    tentative: participants.filter(p => p.rsvpStatus === 'tentative').length,
    pending: participants.filter(p => p.rsvpStatus === 'no_response').length,
  };

  const acceptanceRate = participants.length > 0 
    ? Math.round((rsvpStats.accepted / participants.length) * 100) 
    : 0;

  // RSVP status config
  const rsvpStatusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    accepted: { color: 'success', icon: <CheckCircleOutlined />, label: 'Accepted' },
    declined: { color: 'error', icon: <CloseCircleOutlined />, label: 'Declined' },
    tentative: { color: 'warning', icon: <QuestionCircleOutlined />, label: 'Tentative' },
    pending: { color: 'default', icon: <ClockCircleOutlined />, label: 'Pending' },
    no_response: { color: 'default', icon: <ClockCircleOutlined />, label: 'No Response' },
  };

  // Role display config
  const getRoleDisplay = (role: string) => {
    const roleLabels: Record<string, string> = {
      chairman: 'Chairman',
      vice_chairman: 'Vice Chairman',
      board_secretary: 'Board Secretary',
      board_member: 'Board Member',
      committee_member: 'Committee Member',
      executive_member: 'Executive Member',
      observer: 'Observer',
      presenter: 'Presenter',
      guest: 'Guest',
      company_secretary: 'Company Secretary',
    };
    return roleLabels[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Table columns
  const columns: ColumnsType<MeetingParticipant> = [
    {
      title: 'Participant',
      key: 'participant',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            style={{ backgroundColor: themeColor }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={themeColor}>{getRoleDisplay(record.boardRole)}</Tag>
          {record.isGuest && record.guestRole && (
            <Text type="secondary" style={{ fontSize: 11 }}>{record.guestRole}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'RSVP Status',
      key: 'rsvpStatus',
      render: (_, record) => {
        const config = rsvpStatusConfig[record.rsvpStatus] || rsvpStatusConfig.pending;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.isGuest ? 'orange' : 'blue'}>
          {record.isGuest ? 'Guest' : 'Member'}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      {/* RSVP Summary */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Statistic 
              title="Total Invited" 
              value={participants.length}
              valueStyle={{ color: themeColor }}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Statistic 
              title="Accepted" 
              value={rsvpStats.accepted}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Statistic 
              title="Declined" 
              value={rsvpStats.declined}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Statistic 
              title="Tentative" 
              value={rsvpStats.tentative}
              valueStyle={{ color: '#faad14' }}
              prefix={<QuestionCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Acceptance Rate</Text>
              <Progress 
                percent={acceptanceRate} 
                size="small" 
                strokeColor={themeColor}
                style={{ marginBottom: 0 }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Participants Table */}
      <Table
        columns={columns}
        dataSource={participants}
        rowKey="id"
        size="small"
        pagination={participants.length > 10 ? { pageSize: 10 } : false}
      />
    </div>
  );
};

export default MeetingParticipantsTab;
