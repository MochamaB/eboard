/**
 * Meeting Agenda Tab
 * Displays and manages meeting agenda using AgendaView component
 */

import React, { useState } from 'react';
import { message } from 'antd';
import type { Meeting } from '../../../types/meeting.types';
import { AgendaView } from '../agenda/components';
import { AgendaItemModal } from '../agenda/components/AgendaItemModal';
import { useAddAgendaItem, useAgenda } from '../../../hooks/api';
import type { CreateAgendaItemPayload } from '../../../types/agenda.types';
import type { SelectedParticipant } from '../../../components/common';

interface MeetingAgendaTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingAgendaTab: React.FC<MeetingAgendaTabProps> = ({
  meeting,
}) => {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [parentItemId, setParentItemId] = useState<string | null>(null);

  // Fetch agenda to get the correct agenda ID
  const { data: agenda } = useAgenda(meeting.id);

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

  // Determine mode based on meeting status
  const getViewMode = (): 'edit' | 'view' | 'execute' => {
    // Completed or cancelled meetings are read-only
    if (meeting.status === 'completed' || meeting.status === 'cancelled') {
      return 'view';
    }
    // Active meetings show in execute mode
    if (meeting.status === 'in_progress') {
      return 'execute';
    }
    // Draft, scheduled, or confirmed meetings are editable
    return 'edit';
  };

  const viewMode = getViewMode();

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
