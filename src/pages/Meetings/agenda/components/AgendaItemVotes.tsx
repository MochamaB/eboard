/**
 * AgendaItemVotes Component
 * Displays votes linked to a specific agenda item
 * Similar pattern to AgendaItemDocuments
 */

import React, { useState } from 'react';
import { Typography, Button, Space, Empty, Divider, message } from 'antd';
import { TrophyOutlined, PlusOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { VoteListItem } from '../../../../components/Voting';
import { VoteCreateModal } from '../../../../components/Voting';
import { useMeetingVotes } from '../../../../hooks/api/useVoting';
import type { VoteWithResults } from '../../../../types/voting.types';

const { Text } = Typography;

interface AgendaItemVotesProps {
  agendaItemId: string;
  agendaId: string;
  meetingId: string;
  boardId: string;
  mode: 'edit' | 'view' | 'execute';
  agendaItems?: Array<{ id: string; title: string; itemNumber?: string; parentItemId?: string | null }>;
  onVoteCreated?: (voteId: string) => void;
}

export const AgendaItemVotes: React.FC<AgendaItemVotesProps> = ({
  agendaItemId,
  agendaId,
  meetingId,
  boardId,
  mode,
  agendaItems = [],
  onVoteCreated,
}) => {
  const { theme } = useBoardContext();
  const [voteModalOpen, setVoteModalOpen] = useState(false);

  // Fetch all votes for this meeting
  const { data: allVotesData } = useMeetingVotes(meetingId);
  const allVotes = Array.isArray(allVotesData) ? allVotesData : [];

  // Filter votes linked to this specific agenda item
  const itemVotes = allVotes.filter(
    (vote: VoteWithResults) => vote.entityType === 'agenda_item' && vote.entityId === agendaItemId
  );

  const handleCreateVote = () => {
    setVoteModalOpen(true);
  };

  const handleVoteSuccess = (voteId: string) => {
    setVoteModalOpen(false);
    message.success('Vote created successfully');
    onVoteCreated?.(voteId);
  };

  const handleViewDetails = (voteId: string) => {
    // This will be handled by parent component or navigation
    console.log('View vote details:', voteId);
  };

  // Hide section if no votes and not in edit mode
  if (itemVotes.length === 0 && mode !== 'edit') {
    return null;
  }

  return (
    <>
      <div style={{ marginTop: 16 }}>
        {/* Header - Compact style like documents */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: theme.backgroundSecondary,
            borderBottom: `1px solid ${theme.borderColor}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrophyOutlined style={{ color: theme.textSecondary }} />
            <Text strong style={{ fontSize: 12 }}>
              Linked Votes ({itemVotes.length})
            </Text>
          </div>

          {mode === 'edit' && (
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleCreateVote}
              style={{ fontSize: 12, padding: '4px 8px' }}
            >
              Create Vote
            </Button>
          )}
        </div>

        {/* Votes List */}
        {itemVotes.length > 0 && (
          <div
            style={{
              backgroundColor: theme.backgroundPrimary,
              border: `1px solid ${theme.borderColor}`,
            }}
          >
            {itemVotes.map((vote: VoteWithResults) => (
              <VoteListItem
                key={vote.id}
                vote={vote}
                mode={mode}
                onViewDetails={handleViewDetails}
                themeColor={theme.primaryColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vote Creation Modal */}
      <VoteCreateModal
        open={voteModalOpen}
        meetingId={meetingId}
        boardId={boardId}
        agendaId={agendaId}
        agendaItems={agendaItems}
        contextEntityType="agenda_item"
        contextEntityId={agendaItemId}
        onSuccess={handleVoteSuccess}
        onCancel={() => setVoteModalOpen(false)}
      />
    </>
  );
};

export default AgendaItemVotes;
