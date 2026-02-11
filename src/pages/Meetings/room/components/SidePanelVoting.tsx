/**
 * Side Panel - Voting Tab
 * Wraps the existing VotesView component in 'execute' mode for the live meeting room
 * 
 * Responsive + board branding applied
 */

import React from 'react';
import { Typography } from 'antd';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { useAuth } from '../../../../contexts/AuthContext';
import { useAgenda } from '../../../../hooks/api/useAgenda';
import { VotesView } from '../../../../components/Voting';

const { Text } = Typography;

const SidePanelVoting: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { theme, currentBoard } = useBoardContext();
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  const permissions = useMeetingRoomPermissions();
  const { meetingId, meeting } = roomState;

  // Fetch agenda for linking votes to agenda items
  const { data: agendaData } = useAgenda(meetingId);

  const agendaItems = agendaData?.items?.map(item => ({
    id: item.id,
    title: item.title,
    itemNumber: item.itemNumber,
    parentItemId: item.parentItemId,
  })) || [];

  return (
    <div style={{ padding: isMobile ? 12 : 16, height: '100%', overflow: 'auto' }}>
      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
        Meeting Votes
      </Text>

      <VotesView
        meetingId={meetingId}
        mode="execute"
        boardId={meeting?.boardId || currentBoard.id}
        agendaId={agendaData?.id}
        agendaItems={agendaItems}
        currentUserId={user?.id}
        canManageVotes={permissions.canCreateVote}
        canCastVote={permissions.canCastVote}
        themeColor={theme.primaryColor}
      />
    </div>
  );
};

export default React.memo(SidePanelVoting);
