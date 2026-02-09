/**
 * Meeting Participants Tab
 * Displays participant list with RSVP status and attendance tracking
 * Uses ParticipantSelector for editable states, read-only table for approved/completed
 */

import React, { useState, useCallback } from 'react';
import { Table, Tag, Avatar, Space, Typography, Card, Progress, Row, Col, Statistic, Alert, Button } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Meeting, MeetingParticipant } from '../../../types/meeting.types';
import { useMeetingPermissions } from '../../../hooks/meetings';
import { ParticipantSelector, type SelectedParticipant } from '../../../components/common/ParticipantSelector/ParticipantSelector';

const { Text } = Typography;

interface MeetingParticipantsTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingParticipantsTab: React.FC<MeetingParticipantsTabProps> = ({
  meeting,
  themeColor = '#1890ff',
}) => {
  const permissions = useMeetingPermissions();
  const participants = meeting.participants || [];
  
  // Debug logging
  console.log('MeetingParticipantsTab - Meeting Status:', meeting.status, meeting.subStatus);
  console.log('MeetingParticipantsTab - Permissions:', permissions);
  console.log('MeetingParticipantsTab - canEditParticipants:', permissions.canEditParticipants);
  
  // Local state for participant editing
  const [selectedParticipants, setSelectedParticipants] = useState<SelectedParticipant[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Determine if editable - with fallback logic based on meeting status
  // Editable if: draft.* OR scheduled.pending_approval OR scheduled.rejected
  const isEditableByStatus = 
    meeting.status === 'draft' || 
    (meeting.status === 'scheduled' && (meeting.subStatus === 'pending_approval' || meeting.subStatus === 'rejected'));
  
  // Use permission if available, otherwise fall back to status check
  const isEditable = permissions.canEditParticipants || isEditableByStatus;
  
  const isCancelled = meeting.status === 'cancelled';
  const isApproved = meeting.status === 'scheduled' && meeting.subStatus === 'approved';
  const isCompleted = meeting.status === 'completed';
  
  console.log('MeetingParticipantsTab - isEditableByStatus:', isEditableByStatus);
  console.log('MeetingParticipantsTab - Final isEditable:', isEditable);
  
  // Convert meeting participants to SelectedParticipant format
  const mapToSelectedParticipant = useCallback((p: MeetingParticipant): SelectedParticipant => ({
    id: p.id,
    userId: p.userId,
    name: p.name,
    email: p.email,
    avatar: p.avatar,
    role: p.boardRole,
    roleName: p.boardRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    isGuest: p.isGuest,
    guestRole: p.guestRole,
  }), []);
  
  // Handle participant changes
  const handleParticipantsChange = useCallback((newParticipants: SelectedParticipant[]) => {
    setSelectedParticipants(newParticipants);
    setHasChanges(true);
  }, []);
  
  // Handle save
  const handleSave = useCallback(() => {
    // TODO: Implement API call to update participants
    console.log('Saving participants:', selectedParticipants);
    setHasChanges(false);
  }, [selectedParticipants]);

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
      {/* Editable Mode: Use ParticipantSelector */}
      {isEditable && (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Typography.Text strong>Manage Participants</Typography.Text>
              {hasChanges && (
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  size="small"
                >
                  Save Changes
                </Button>
              )}
            </Space>
          </Card>
          
          <ParticipantSelector
            boardId={meeting.boardId}
            value={selectedParticipants.length > 0 ? selectedParticipants : participants.map(mapToSelectedParticipant)}
            onChange={handleParticipantsChange}
            defaultSelected="none"
            showQuorumSettings={true}
            quorumPercentage={meeting.quorumPercentage}
            allowGuests={true}
            allowRemoveRequired={false}
          />
        </>
      )}
      
      {/* Read-Only Mode: Show RSVP Summary and Table */}
      {!isEditable && (
        <>
          {/* Status Banners */}
          {isCancelled && (
            <Alert
              message="Meeting Cancelled"
              description="This meeting has been cancelled. Participant list is read-only."
              type="warning"
              icon={<StopOutlined />}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          {isApproved && (
            <Alert
              message="Participant List Finalized"
              description="This meeting has been approved. The participant list cannot be modified."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          {isCompleted && (
            <Alert
              message="Meeting Completed"
              description="This meeting has been completed. Viewing final attendance record."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
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
        </>
      )}
    </div>
  );
};

export default MeetingParticipantsTab;
