/**
 * Meeting Agenda Tab
 * Displays and manages meeting agenda using AgendaView component
 * Status-aware with pre/post-meeting support
 */

import React, { useState, useMemo } from 'react';
import { message, Alert, Card, Row, Col, Statistic } from 'antd';
import {
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { Meeting } from '../../../types/meeting.types';
import { AgendaView } from '../agenda/components';
import { AgendaItemModal } from '../agenda/components/AgendaItemModal';
import { useAddAgendaItem, useAgenda } from '../../../hooks/api';
import type { CreateAgendaItemPayload } from '../../../types/agenda.types';
import type { SelectedParticipant } from '../../../components/common';
import { useMeetingPermissions } from '../../../hooks/meetings';

interface MeetingAgendaTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingAgendaTab: React.FC<MeetingAgendaTabProps> = ({
  meeting,
}) => {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [parentItemId, setParentItemId] = useState<string | null>(null);

  // Get permissions
  const permissions = useMeetingPermissions();

  // Fetch agenda to get the correct agenda ID
  const { data: agenda } = useAgenda(meeting.id);

  // Status flags
  const isCancelled = meeting.status === 'cancelled';
  const isApproved = meeting.status === 'scheduled' && meeting.subStatus === 'approved';
  const isCompleted = meeting.status === 'completed';
  const isRejected = meeting.status === 'scheduled' && meeting.subStatus === 'rejected';

  // Convert meeting participants to SelectedParticipant format
  const participants: SelectedParticipant[] = meeting.participants?.map(p => ({
    id: String(p.userId),
    userId: p.userId,
    name: p.name,
    email: p.email || '',
    avatar: p.avatar,
    role: p.isGuest ? (p.guestRole || 'guest') : p.boardRole,
    roleName: p.isGuest ? (p.guestRole || 'Guest') : p.boardRole,
    isRequired: !p.isGuest, // Board members are required, guests are optional
    isGuest: p.isGuest,
  })) || [];

  // Determine mode based on meeting status and permissions
  const getViewMode = (): 'edit' | 'view' | 'execute' => {
    // Active meetings show in execute mode
    if (meeting.status === 'in_progress') {
      return 'execute';
    }
    
    // Use permission for edit mode with fallback
    const isEditableByStatus = 
      meeting.status === 'draft' || 
      (meeting.status === 'scheduled' && (meeting.subStatus === 'pending_approval' || meeting.subStatus === 'rejected'));
    
    if (permissions.canEditAgenda || isEditableByStatus) {
      return 'edit';
    }
    
    // Everything else is read-only
    return 'view';
  };

  const viewMode = getViewMode();

  // Calculate post-meeting statistics
  const agendaStats = useMemo(() => {
    if (!agenda?.items || !isCompleted) return null;

    const items = agenda.items;
    const completed = items.filter(item => item.status === 'completed').length;
    const skipped = items.filter(item => item.status === 'skipped').length;
    const pending = items.filter(item => item.status === 'pending').length;
    const totalEstimated = items.reduce((sum, item) => sum + item.estimatedDuration, 0);
    const totalActual = items.reduce((sum, item) => sum + (item.actualDuration || 0), 0);
    const timeVariance = totalActual - totalEstimated;
    const timeVariancePercent = totalEstimated > 0 ? Math.round((timeVariance / totalEstimated) * 100) : 0;

    return {
      total: items.length,
      completed,
      skipped,
      pending,
      totalEstimated,
      totalActual,
      timeVariance,
      timeVariancePercent,
    };
  }, [agenda?.items, isCompleted]);

  // Mutations - use actual agenda ID from fetched data
  const addItemMutation = useAddAgendaItem(agenda?.id || '', meeting.id, {
    onSuccess: () => {
      message.success('Agenda item added successfully');
      setIsAddItemModalOpen(false);
    },
    onError: (error) => {
      message.error(`Failed to add item: ${error.message}`);
    },
  });

  const handleAddItem = () => {
    if (!agenda?.id) {
      message.error('Agenda not loaded yet. Please wait...');
      return;
    }
    setParentItemId(null); // Root item
    setIsAddItemModalOpen(true);
  };

  const handleAddSubItem = (parentId: string) => {
    if (!agenda?.id) {
      message.error('Agenda not loaded yet. Please wait...');
      return;
    }
    setParentItemId(parentId); // Set parent for sub-item
    setIsAddItemModalOpen(true);
  };

  const handleModalSubmit = (payload: CreateAgendaItemPayload) => {
    if (!agenda?.id) {
      message.error('Agenda ID not available');
      return;
    }

    addItemMutation.mutate(payload);
  };

  const handleModalCancel = () => {
    setIsAddItemModalOpen(false);
    setParentItemId(null);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Cancellation Banner */}
      {isCancelled && (
        <Alert
          message="Meeting Cancelled"
          description="This meeting has been cancelled. Agenda is read-only."
          type="warning"
          icon={<StopOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Approved Banner */}
      {isApproved && (
        <Alert
          message="Agenda Finalized"
          description="This meeting has been approved. The agenda cannot be modified."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <Alert
          message="Meeting Rejected"
          description="This meeting was rejected. You can revise the agenda and resubmit."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Post-Meeting Summary */}
      {isCompleted && agendaStats && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Statistic
                title="Total Items"
                value={agendaStats.total}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Completed"
                value={agendaStats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Skipped"
                value={agendaStats.skipped}
                valueStyle={{ color: '#8c8c8c' }}
                prefix={<MinusCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Pending"
                value={agendaStats.pending}
                valueStyle={{ color: '#faad14' }}
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={12} sm={8}>
              <Statistic
                title="Estimated Time"
                value={agendaStats.totalEstimated}
                suffix="min"
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="Actual Time"
                value={agendaStats.totalActual}
                suffix="min"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Time Variance"
                value={agendaStats.timeVariance}
                suffix="min"
                valueStyle={{ 
                  color: agendaStats.timeVariance > 0 ? '#ff4d4f' : '#52c41a' 
                }}
                prefix={agendaStats.timeVariance > 0 ? '+' : ''}
              />
            </Col>
          </Row>
        </Card>
      )}

      <AgendaView
        meetingId={meeting.id}
        mode={viewMode}
        meetingDuration={meeting.duration}
        participants={participants.map(p => ({
          userId: Number(p.userId),
          name: p.name,
          roleName: p.roleName,
          avatar: p.avatar,
        }))}
        onAddItem={viewMode === 'edit' ? handleAddItem : undefined}
        onAddSubItem={viewMode === 'edit' ? handleAddSubItem : undefined}
      />

      {/* Add/Edit Item Modal */}
      <AgendaItemModal
        open={isAddItemModalOpen}
        mode="add"
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        loading={addItemMutation.isPending}
        allItems={agenda?.items || []}
        participants={participants}
        parentItemId={parentItemId}
      />
    </div>
  );
};

export default MeetingAgendaTab;
