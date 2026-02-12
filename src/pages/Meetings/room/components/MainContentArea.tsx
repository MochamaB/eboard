/**
 * Main Content Area
 * Left side of the meeting room layout
 * 
 * Contains:
 * - Current Item Display (document, video, agenda item)
 * - Participant Functions (raise hand, notes, follow presenter)
 * - Active Vote Panel (when vote in progress)
 * - Meeting Actions (host controls)
 * 
 * Responsive:
 * - Desktop: Full cards with generous padding
 * - Tablet: Reduced padding, smaller minHeight
 * - Mobile: Compact cards, icon-only buttons, stacked vote buttons
 * 
 * Board branding: card accents, vote panel border, progress bar colors
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Progress, Typography, Empty } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import DocumentPreview from './DocumentPreview';
import ParticipantPanel from './ParticipantPanel';

const { Text, Title } = Typography;

// ============================================================================
// CURRENT ITEM DISPLAY
// ============================================================================

const CurrentItemDisplay: React.FC = () => {
  const { roomState } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile, isTablet } = useResponsive();
  const { currentAgendaItem, castingDocument } = roomState;
  
  const contentMinHeight = isMobile ? 200 : isTablet ? 300 : 400;
  
  // If document is being cast, show DocumentPreview (with watermark/confidential/page nav)
  if (castingDocument) {
    return <DocumentPreview />;
  }
  
  // Show current agenda item
  if (currentAgendaItem) {
    return (
      <Card 
        title="Current Agenda Item" 
        style={{ flex: 1 }}
        styles={{ body: { padding: isMobile ? 12 : undefined } }}
      >
        <div style={{ 
          background: theme.backgroundQuaternary, 
          borderRadius: 8, 
          padding: isMobile ? 16 : 24, 
          minHeight: contentMinHeight 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text type="secondary">Item {currentAgendaItem.itemNumber}</Text>
              <Title level={isMobile ? 4 : 3} style={{ marginTop: 4 }}>{currentAgendaItem.title}</Title>
            </div>
            <Text type="secondary" style={{ whiteSpace: 'nowrap', marginLeft: 12 }}>
              {currentAgendaItem.estimatedDuration} min
            </Text>
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
        style={{ minHeight: contentMinHeight, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      />
    </Card>
  );
};

// ============================================================================
// ACTIVE VOTE PANEL
// ============================================================================

const ActiveVotePanel: React.FC = () => {
  const { roomState, actions, capabilities } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const { activeVote } = roomState;
  const permissions = useMeetingRoomPermissions();
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // Initialize and run countdown
  useEffect(() => {
    if (!activeVote || activeVote.status !== 'open') {
      setTimeLeft(0);
      return;
    }
    
    // Set initial time from activeVote
    setTimeLeft(activeVote.timeRemaining);
    if (totalDuration === 0 && activeVote.timeRemaining > 0) {
      setTotalDuration(activeVote.timeRemaining);
    }
    
    // Only tick when vote timer should be running (not paused)
    if (!capabilities.isVoteTimerRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-close vote when timer hits 0
          actions.closeVote(activeVote.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeVote?.id, activeVote?.status, capabilities.isVoteTimerRunning]); // eslint-disable-line react-hooks/exhaustive-deps
  
  if (!activeVote) return null;
  
  const totalVotes = activeVote.votesFor + activeVote.votesAgainst + activeVote.votesAbstain;
  const progressPercentage = activeVote.requiredVotes > 0 
    ? Math.round((totalVotes / activeVote.requiredVotes) * 100) 
    : 0;
  
  // Countdown display helpers
  const countdownMinutes = Math.floor(timeLeft / 60);
  const countdownSeconds = timeLeft % 60;
  const countdownText = `${countdownMinutes}:${countdownSeconds.toString().padStart(2, '0')}`;
  const countdownPercent = totalDuration > 0 ? Math.round((timeLeft / totalDuration) * 100) : 0;
  const isUrgent = timeLeft > 0 && timeLeft <= 30;
  
  return (
    <Card 
      title={
        <Space>
          <span>🗳️</span>
          <span>Active Vote</span>
          {activeVote.status === 'open' && timeLeft > 0 && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: 13, 
              fontFamily: 'monospace',
              fontWeight: 700,
              background: isUrgent ? theme.errorColor : theme.successColor, 
              color: '#fff', 
              padding: '2px 10px', 
              borderRadius: 4,
              animation: isUrgent ? 'pulse 1s infinite' : undefined,
            }}>
              {countdownText}
            </span>
          )}
          {activeVote.status === 'closed' && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: 12, 
              background: theme.backgroundTertiary, 
              color: theme.textSecondary, 
              padding: '2px 8px', 
              borderRadius: 4 
            }}>
              Closed
            </span>
          )}
        </Space>
      }
      style={{ borderColor: activeVote.status === 'open' ? theme.primaryColor : theme.borderColor }}
      styles={{ body: { padding: isMobile ? 12 : undefined } }}
    >
      {/* Countdown progress bar */}
      {activeVote.status === 'open' && totalDuration > 0 && (
        <Progress
          percent={countdownPercent}
          showInfo={false}
          strokeColor={isUrgent ? theme.errorColor : theme.primaryColor}
          trailColor={theme.borderColorLight}
          size="small"
          style={{ marginBottom: 12 }}
        />
      )}
      <Text strong style={{ display: 'block', marginBottom: 16 }}>{activeVote.motionText}</Text>
      
      {activeVote.status === 'open' && !activeVote.userHasVoted && capabilities.canCastVote && permissions.canCastVote && (
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 8, 
          marginBottom: 16 
        }}>
          <Button 
            type="primary"
            style={{ background: theme.successColor, borderColor: theme.successColor, flex: 1 }}
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
        </div>
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
        <Progress 
          percent={progressPercentage} 
          showInfo={false} 
          strokeColor={theme.primaryColor}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>For: {activeVote.votesFor}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Against: {activeVote.votesAgainst}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Abstain: {activeVote.votesAbstain}</Text>
        </div>
      </div>
      
      {/* Close Vote Button (for chairman) */}
      {capabilities.canCloseVote && permissions.canCloseVote && activeVote.status === 'open' && (
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
  const { isMobile } = useResponsive();
  const { capabilities } = useMeetingRoom();
  const gap = isMobile ? 8 : 16;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, height: '100%' }}>
      {/* Current Item Display / Document Preview */}
      <CurrentItemDisplay />

      {/* Unified Participant Panel (theme-branded, max 5 cards) */}
      {capabilities.showParticipantStrip && <ParticipantPanel />}
      
      {/* Active Vote (conditional — only when status allows) */}
      {capabilities.showActiveVote && <ActiveVotePanel />}
    </div>
  );
};

export default React.memo(MainContentArea);
