/**
 * ParticipantList Component
 * Displays meeting participants with RSVP status
 * Shows quorum achievement and allows RSVP updates
 */

import React, { useMemo } from 'react';
import { Table, Tag, Avatar, Space, Progress, Card, Statistic, Row, Col, Button, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { MeetingParticipant } from '../../types/meeting.types';
import { RSVP_STATUS_LABELS, RSVP_STATUS_COLORS } from '../../types/meeting.types';
import { BOARD_ROLE_LABELS } from '../../types/board.types';

const { Text } = Typography;

interface ParticipantListProps {
  participants: MeetingParticipant[];
  quorumPercentage: number;
  quorumRequired: number;
  showQuorumStatus?: boolean;
  allowRSVPUpdate?: boolean;
  currentUserId?: string | number;
  onRSVPUpdate?: (participantId: string, rsvpStatus: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  quorumPercentage,
  quorumRequired,
  showQuorumStatus = true,
  allowRSVPUpdate = false,
  currentUserId,
  onRSVPUpdate,
}) => {
  // Calculate RSVP statistics
  const rsvpStats = useMemo(() => {
    const accepted = participants.filter(p => p.rsvpStatus === 'accepted').length;
    const declined = participants.filter(p => p.rsvpStatus === 'declined').length;
    const tentative = participants.filter(p => p.rsvpStatus === 'tentative').length;
    const noResponse = participants.filter(p => p.rsvpStatus === 'no_response').length;
    const guests = participants.filter(p => p.isGuest).length;

    const quorumAchieved = accepted >= quorumRequired;
    const quorumPercentageAchieved = Math.round((accepted / participants.length) * 100);

    return {
      accepted,
      declined,
      tentative,
      noResponse,
      guests,
      quorumAchieved,
      quorumPercentageAchieved,
    };
  }, [participants, quorumRequired]);

  // Get RSVP icon
  const getRSVPIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'declined':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'tentative':
        return <QuestionCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    if (role === 'chairman' || role === 'committee_chairman') {
      return <CrownOutlined style={{ color: '#faad14', marginRight: 4 }} />;
    }
    if (role === 'board_secretary' || role === 'committee_secretary') {
      return <StarOutlined style={{ color: '#1890ff', marginRight: 4 }} />;
    }
    return null;
  };

  // Table columns
  const columns: ColumnsType<MeetingParticipant> = [
    {
      title: 'Participant',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar
            size="small"
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: record.isGuest ? '#9C27B0' : '#1890ff' }}
          />
          <div>
            <div>
              {getRoleIcon(record.boardRole)}
              <Text strong={record.userId === currentUserId}>
                {name}
              </Text>
              {record.userId === currentUserId && (
                <Tag color="blue" style={{ marginLeft: 8, fontSize: '10px' }}>
                  You
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'boardRole',
      key: 'boardRole',
      width: 180,
      render: (role, record) => (
        <Space direction="vertical" size={0}>
          <Text>{BOARD_ROLE_LABELS[role] || role}</Text>
          {record.isGuest && record.guestRole && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Guest: {record.guestRole}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isGuest',
      key: 'type',
      width: 100,
      render: (isGuest) => (
        <Tag color={isGuest ? 'purple' : 'default'}>
          {isGuest ? 'Guest' : 'Member'}
        </Tag>
      ),
    },
    {
      title: 'RSVP Status',
      dataIndex: 'rsvpStatus',
      key: 'rsvpStatus',
      width: 150,
      render: (status) => (
        <Space>
          {getRSVPIcon(status)}
          <Tag color={RSVP_STATUS_COLORS[status as keyof typeof RSVP_STATUS_COLORS]}>
            {RSVP_STATUS_LABELS[status as keyof typeof RSVP_STATUS_LABELS]}
          </Tag>
        </Space>
      ),
    },
  ];

  // Add actions column if RSVP update is allowed
  if (allowRSVPUpdate) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        if (String(record.userId) !== String(currentUserId)) {
          return null;
        }

        return (
          <Space size="small">
            <Tooltip title="Accept">
              <Button
                type={record.rsvpStatus === 'accepted' ? 'primary' : 'default'}
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onRSVPUpdate?.(record.id, 'accepted')}
              />
            </Tooltip>
            <Tooltip title="Decline">
              <Button
                type={record.rsvpStatus === 'declined' ? 'primary' : 'default'}
                size="small"
                danger={record.rsvpStatus === 'declined'}
                icon={<CloseCircleOutlined />}
                onClick={() => onRSVPUpdate?.(record.id, 'declined')}
              />
            </Tooltip>
          </Space>
        );
      },
    });
  }

  return (
    <div>
      {/* Quorum Status Card */}
      {showQuorumStatus && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Total Participants"
                value={participants.length}
                suffix={`(${rsvpStats.guests} guests)`}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Accepted"
                value={rsvpStats.accepted}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Quorum Required"
                value={quorumRequired}
                suffix={`(${quorumPercentage}%)`}
              />
            </Col>
            <Col span={6}>
              <div>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: 8 }}>
                  Quorum Status
                </Text>
                <Progress
                  percent={rsvpStats.quorumPercentageAchieved}
                  success={{ percent: rsvpStats.quorumAchieved ? rsvpStats.quorumPercentageAchieved : 0 }}
                  status={rsvpStats.quorumAchieved ? 'success' : 'active'}
                  strokeColor={rsvpStats.quorumAchieved ? '#52c41a' : '#faad14'}
                />
                <Text
                  strong
                  style={{
                    color: rsvpStats.quorumAchieved ? '#52c41a' : '#faad14',
                    fontSize: '12px',
                  }}
                >
                  {rsvpStats.quorumAchieved ? '✓ Quorum Achieved' : '⚠ Quorum Not Met'}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Participants Table */}
      <Table
        columns={columns}
        dataSource={participants}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} participants`,
        }}
        size="middle"
      />

      {/* RSVP Summary */}
      <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Tag icon={<CheckCircleOutlined />} color="success">
          Accepted: {rsvpStats.accepted}
        </Tag>
        <Tag icon={<CloseCircleOutlined />} color="error">
          Declined: {rsvpStats.declined}
        </Tag>
        <Tag icon={<QuestionCircleOutlined />} color="warning">
          Tentative: {rsvpStats.tentative}
        </Tag>
        <Tag icon={<ClockCircleOutlined />} color="default">
          No Response: {rsvpStats.noResponse}
        </Tag>
      </div>
    </div>
  );
};

export default ParticipantList;
