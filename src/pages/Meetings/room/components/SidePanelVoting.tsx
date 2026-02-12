/**
 * Side Panel - Voting Tab
 * Wraps the existing VotesView component in 'execute' mode for the live meeting room
 * 
 * Responsive + board branding applied
 */

import React from 'react';
import { useBoardContext } from '../../../../contexts';
import { useMeetingRoomTheme } from '../MeetingRoomThemeContext';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { getTypographyCSS } from '../../../../styles/responsive';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { useAuth } from '../../../../contexts/AuthContext';
import { useAgenda } from '../../../../hooks/api/useAgenda';
import { VotesView } from '../../../../components/Voting';

const SidePanelVoting: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { currentBoard } = useBoardContext();
  const theme = useMeetingRoomTheme();
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
      <span style={{ ...getTypographyCSS('sectionLabel'), textTransform: 'uppercase', display: 'block', marginBottom: 12, color: theme.textSecondary }}>
        Meeting Votes
      </span>

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
