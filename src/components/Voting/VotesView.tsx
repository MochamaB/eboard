/**
 * Votes View Component
 * Main orchestrator for vote management with mode awareness
 * Reusable for both Meeting Detail tabs and Meeting Room execution
 */

import React, { useState } from 'react';
import { Empty, Spin, Modal, message, Button, Typography } from 'antd';
import { PlusOutlined, TrophyOutlined } from '@ant-design/icons';
import type { VoteWithResults } from '../../types/voting.types';
import { useMeetingVotes, useDeleteVote } from '../../hooks/api/useVoting';
import { VoteListItem } from './VoteListItem';
import { VoteCreateModal } from './VoteCreateModal';
import { VoteDetailDrawer } from './VoteDetailDrawer';

const { Title } = Typography;

interface VotesViewProps {
  meetingId: string;
  mode: 'edit' | 'view' | 'execute';
  boardId?: string;
  agendaId?: string;
  agendaItems?: Array<{ id: string; title: string; itemNumber?: string; parentItemId?: string | null }>;
  participants?: Array<{ userId: number; name: string; votingWeight?: number }>;
  currentUserId?: number;
  canManageVotes?: boolean;
  canCastVote?: boolean;
  themeColor?: string;
  onVoteCreated?: (voteId: string) => void;
  onVoteOpened?: (voteId: string) => void;
  onVoteClosed?: (voteId: string) => void;
}

export const VotesView: React.FC<VotesViewProps> = ({
  meetingId,
  mode,
  boardId = '',
  agendaId,
  agendaItems = [],
  currentUserId = 1,
  canManageVotes = false,
  canCastVote = false,
  themeColor = '#1890ff',
  onVoteCreated,
  onVoteOpened: _onVoteOpened,
  onVoteClosed: _onVoteClosed,
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editVoteId, setEditVoteId] = useState<string | null>(null);
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);

  // Fetch votes for this meeting
  const { data: votesData, isLoading } = useMeetingVotes(meetingId);
  const votes = Array.isArray(votesData) ? votesData : [];

  // Helper function to get entity label for a vote
  const getEntityLabel = (vote: VoteWithResults): string | undefined => {
    if (!vote.entityType || !vote.entityId) return undefined;

    switch (vote.entityType) {
      case 'agenda':
        return 'Entire Agenda';
      case 'agenda_item': {
        const item = agendaItems.find(i => i.id === vote.entityId);
        return item ? `Item ${item.itemNumber || ''}: ${item.title}`.trim() : 'Agenda Item';
      }
      case 'minutes':
        return 'Minutes';
      case 'action_item':
        return 'Action Item';
      case 'resolution':
        return 'Resolution';
      default:
        return undefined;
    }
  };

  // Delete mutation
  const deleteVoteMutation = useDeleteVote({
    onSuccess: () => {
      message.success('Vote deleted successfully');
    },
    onError: (error) => {
      message.error(`Failed to delete vote: ${error.message}`);
    },
  });

  // Handlers
  const handleVoteCreated = (voteId: string) => {
    setCreateModalOpen(false);
    onVoteCreated?.(voteId);
  };

  const handleDeleteVote = (voteId: string) => {
    Modal.confirm({
      title: 'Delete Vote?',
      content: 'Are you sure you want to delete this vote? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteVoteMutation.mutate(voteId);
      },
    });
  };

  const handleViewDetails = (voteId: string) => {
    setSelectedVoteId(voteId);
  };

  const handleConfigure = (voteId: string) => {
    // Open modal in edit mode
    setEditVoteId(voteId);
  };

  const handleEditSuccess = (voteId: string) => {
    setEditVoteId(null);
    onVoteCreated?.(voteId);
  };

  // Empty state
  if (!isLoading && votes.length === 0) {
    return (
      <div>
        {/* Header with Create Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={5} 
                style={{ margin: 0, fontSize: 14, fontWeight: 500 }}
                >
            <TrophyOutlined /> Votes ({votes.length})
          </Title>
          {mode === 'edit' && canManageVotes && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              style={{ backgroundColor: themeColor, borderColor: themeColor }}
            >
              Create Vote
            </Button>
          )}
        </div>

        <Empty
          image={<TrophyOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description="No votes have been created for this meeting"
          style={{ padding: '60px 0' }}
        />

        {/* Create Vote Modal */}
        {/* Create Vote Modal */}
        <VoteCreateModal
          open={createModalOpen}
          meetingId={meetingId}
          boardId={boardId}
          agendaId={agendaId}
          agendaItems={agendaItems}
          onSuccess={handleVoteCreated}
          onCancel={() => setCreateModalOpen(false)}
        />

        {/* Edit Vote Modal */}
        <VoteCreateModal
          open={!!editVoteId}
          meetingId={meetingId}
          boardId={boardId}
          agendaId={agendaId}
          agendaItems={agendaItems}
          editVoteId={editVoteId || undefined}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditVoteId(null)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header with Create Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          <TrophyOutlined /> Votes ({votes.length})
        </Title>
        {mode === 'edit' && canManageVotes && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
          >
            Create Vote
          </Button>
        )}
      </div>

      {/* Create Vote Modal */}
      {/* Create Vote Modal */}
      <VoteCreateModal
        open={createModalOpen}
        meetingId={meetingId}
        boardId={boardId}
        agendaId={agendaId}
        agendaItems={agendaItems}
        onSuccess={handleVoteCreated}
        onCancel={() => setCreateModalOpen(false)}
      />

      {/* Edit Vote Modal */}
      <VoteCreateModal
        open={!!editVoteId}
        meetingId={meetingId}
        boardId={boardId}
        agendaId={agendaId}
        agendaItems={agendaItems}
        editVoteId={editVoteId || undefined}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditVoteId(null)}
      />

      {/* Votes List */}
      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {votes.map((vote: VoteWithResults) => (
          <VoteListItem
            key={vote.id}
            vote={vote}
            mode={mode}
            onViewDetails={handleViewDetails}
            onConfigure={mode === 'edit' ? handleConfigure : undefined}
            onDelete={mode === 'edit' ? handleDeleteVote : undefined}
            themeColor={themeColor}
            showEntityLabel={true}
            entityLabel={getEntityLabel(vote)}
          />
        ))}
      </div>

      {/* Vote Detail Drawer */}
      <VoteDetailDrawer
        voteId={selectedVoteId}
        open={!!selectedVoteId}
        onClose={() => setSelectedVoteId(null)}
        mode={mode}
        canManageVote={canManageVotes}
        canCastVote={canCastVote}
        currentUserId={currentUserId}
        themeColor={themeColor}
        onConfigure={handleConfigure}
        onDelete={handleDeleteVote}
      />
    </div>
  );
};

export default VotesView;
