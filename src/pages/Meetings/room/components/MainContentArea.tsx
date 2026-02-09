/**
 * Main Content Area
 * Left side of the meeting room layout
 * 
 * Contains:
 * - Current Item Display (document, video, agenda item)
 * - Participant Functions (raise hand, notes, follow presenter)
 * - Active Vote Panel (when vote in progress)
 * - Meeting Actions (host controls)
 */

import React from 'react';
import { Card, Button, Space, Progress, Typography, Empty } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  DesktopOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const { Text, Title } = Typography;

// ============================================================================
// CURRENT ITEM DISPLAY
// ============================================================================

const CurrentItemDisplay: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { currentAgendaItem, castingDocument } = roomState;
  
  // If document is being cast, show document viewer
  if (castingDocument) {
    return (
      <Card 
        title={
          <Space>
            <DesktopOutlined />
            <span>Document Being Presented</span>
          </Space>
        }
        style={{ flex: 1 }}
      >
        <div style={{ 
          background: '#f5f5f5', 
          borderRadius: 8, 
          padding: 32, 
          minHeight: 400, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <FileTextOutlined style={{ fontSize: 64, color: '#999', marginBottom: 16 }} />
          <Title level={4}>{castingDocument.documentName}</Title>
          <Text type="secondary">
            Page {castingDocument.currentPage} of {castingDocument.totalPages}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
            Presented by {castingDocument.casterName}
          </Text>
        </div>
      </Card>
    );
  }
  
  // Show current agenda item
  if (currentAgendaItem) {
    return (
      <Card title="Current Agenda Item" style={{ flex: 1 }}>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 24, minHeight: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary">Item {currentAgendaItem.itemNumber}</Text>
              <Title level={3} style={{ marginTop: 4 }}>{currentAgendaItem.title}</Title>
            </div>
            <Text type="secondary">{currentAgendaItem.estimatedDuration} min</Text>
          </div>
          
          {currentAgendaItem.description && (
            <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
              {currentAgendaItem.description}
            </Text>
          )}
          
          {currentAgendaItem.presenterId && (
            <Space style={{ marginTop: 16 }}>
              <UserOutlined />
              <Text>Presenter ID: {currentAgendaItem.presenterId}</Text>
            </Space>
          )}
        </div>
      </Card>
    );
  }
  
  // No current item
  return (
    <Card style={{ flex: 1 }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            No agenda item selected<br />
            <Text type="secondary">Select an item from the agenda panel</Text>
          </span>
        }
        style={{ minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      />
    </Card>
  );
};

// ============================================================================
// PARTICIPANT FUNCTIONS
// ============================================================================

const ParticipantFunctions: React.FC = () => {
  const { actions } = useMeetingRoom();
  
  return (
    <Card title="Participant Functions" size="small">
      <Space wrap>
        <Button icon={<span>✋</span>} onClick={actions.raiseHand}>
          Raise Hand
        </Button>
        <Button icon={<FormOutlined />}>
          My Notes
        </Button>
        <Button icon={<UserOutlined />}>
          Follow Presenter
        </Button>
      </Space>
    </Card>
  );
};

// ============================================================================
// ACTIVE VOTE PANEL
// ============================================================================

const ActiveVotePanel: React.FC = () => {
  const { roomState, actions } = useMeetingRoom();
  const { activeVote } = roomState;
  const permissions = useMeetingRoomPermissions();
  
  if (!activeVote) return null;
  
  const totalVotes = activeVote.votesFor + activeVote.votesAgainst + activeVote.votesAbstain;
  const progressPercentage = activeVote.requiredVotes > 0 
    ? Math.round((totalVotes / activeVote.requiredVotes) * 100) 
    : 0;
  
  return (
    <Card 
      title={
        <Space>
          <span>🗳️</span>
          <span>Active Vote</span>
          {activeVote.status === 'open' && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: 12, 
              background: '#f6ffed', 
              color: '#52c41a', 
              padding: '2px 8px', 
              borderRadius: 4 
            }}>
              {activeVote.timeRemaining}s remaining
            </span>
          )}
        </Space>
      }
      style={{ borderColor: '#1890ff' }}
    >
      <Text strong style={{ display: 'block', marginBottom: 16 }}>{activeVote.motionText}</Text>
      
      {activeVote.status === 'open' && !activeVote.userHasVoted && permissions.canCastVote && (
        <Space style={{ marginBottom: 16, width: '100%' }} size="middle">
          <Button 
            type="primary"
            style={{ background: '#52c41a', borderColor: '#52c41a', flex: 1 }}
            onClick={() => actions.castVote(activeVote.id, 'for')}
          >
            ✓ For
          </Button>
          <Button 
            type="primary" 
            danger
            style={{ flex: 1 }}
            onClick={() => actions.castVote(activeVote.id, 'against')}
          >
            ✗ Against
          </Button>
          <Button 
            style={{ flex: 1 }}
            onClick={() => actions.castVote(activeVote.id, 'abstain')}
          >
            ○ Abstain
          </Button>
        </Space>
      )}
      
      {activeVote.userHasVoted && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          You voted: <Text strong style={{ textTransform: 'capitalize' }}>{activeVote.userVote}</Text>
        </Text>
      )}
      
      {/* Vote Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Votes: {totalVotes}/{activeVote.requiredVotes}</Text>
          <Text>{progressPercentage}%</Text>
        </div>
        <Progress percent={progressPercentage} showInfo={false} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>For: {activeVote.votesFor}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Against: {activeVote.votesAgainst}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Abstain: {activeVote.votesAbstain}</Text>
        </div>
      </div>
      
      {/* Close Vote Button (for chairman) */}
      {permissions.canCloseVote && activeVote.status === 'open' && (
        <Button 
          block 
          style={{ marginTop: 16 }}
          onClick={() => actions.closeVote(activeVote.id)}
        >
          Close Vote
        </Button>
      )}
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MainContentArea: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Current Item Display */}
      <CurrentItemDisplay />
      
      {/* Participant Functions */}
      <ParticipantFunctions />
      
      {/* Active Vote (conditional) */}
      <ActiveVotePanel />
    </div>
  );
};

export default MainContentArea;
