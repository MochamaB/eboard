/**
 * Meeting Room Context
 * Manages live meeting room state and actions
 * 
 * This context is used within the Meeting Room page to manage:
 * - Room status (waiting, in_progress, paused, ended)
 * - Meeting mode (physical, virtual, hybrid)
 * - Participant state
 * - Agenda navigation
 * - Document casting
 * - Voting
 * - Real-time synchronization (stub for now)
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useMeetingPhase } from './MeetingPhaseContext';
import { useBoardContext } from './BoardContext';
import { useAuth } from './AuthContext';
import type {
  MeetingRoomState,
  MeetingRoomActions,
  MeetingRoomContextType,
  RoomStatus,
  RoomParticipant,
  ActiveVote,
  CastingDocument,
} from '../types/meetingRoom.types';
import type { AgendaItem } from '../types/agenda.types';

// ============================================================================
// CONTEXT
// ============================================================================

const MeetingRoomContext = createContext<MeetingRoomContextType | undefined>(undefined);

// ============================================================================
// PROVIDER PROPS
// ============================================================================

interface MeetingRoomProviderProps {
  children: React.ReactNode;
  meetingId: string;
}

// ============================================================================
// PROVIDER
// ============================================================================

export const MeetingRoomProvider: React.FC<MeetingRoomProviderProps> = ({ 
  children, 
  meetingId 
}) => {
  const { meeting } = useMeetingPhase();
  const { currentBoard: _currentBoard } = useBoardContext(); // Will be used for branding
  const { user } = useAuth();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Room state
  const [status, setStatus] = useState<RoomStatus>('waiting');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [pausedAt, setPausedAt] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  
  // Agenda state
  const [currentAgendaItemId, setCurrentAgendaItemId] = useState<string | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  
  // Participants state
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  
  // Voting state
  const [activeVote, setActiveVote] = useState<ActiveVote | null>(null);
  
  // Document casting state
  const [castingDocument, setCastingDocument] = useState<CastingDocument | null>(null);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<string | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const mode = useMemo(() => {
    if (participants.length === 0) return 'physical';
    
    const joinedParticipants = participants.filter(p => p.attendanceStatus === 'joined');
    const inRoomCount = joinedParticipants.filter(p => p.connectionStatus === 'in_room').length;
    const remoteCount = joinedParticipants.filter(
      p => p.connectionStatus === 'connected' || p.connectionStatus === 'connecting'
    ).length;
    
    if (inRoomCount > 0 && remoteCount > 0) return 'hybrid';
    if (remoteCount > 0) return 'virtual';
    return 'physical';
  }, [participants]);
  
  const presentCount = useMemo(() => {
    return participants.filter(p => p.attendanceStatus === 'joined').length;
  }, [participants]);
  
  const expectedCount = useMemo(() => {
    return meeting?.participants?.length || 0;
  }, [meeting]);
  
  const quorumRequired = useMemo(() => {
    return meeting?.quorumRequired || 0;
  }, [meeting]);
  
  const quorumMet = useMemo(() => {
    const votingMembers = participants.filter(
      p => p.attendanceStatus === 'joined' && !p.isGuest
    ).length;
    return votingMembers >= quorumRequired;
  }, [participants, quorumRequired]);
  
  const currentAgendaItem = useMemo(() => {
    if (!currentAgendaItemId) return null;
    return agendaItems.find(item => item.id === currentAgendaItemId) || null;
  }, [currentAgendaItemId, agendaItems]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  useEffect(() => {
    const initializeRoom = async () => {
      setIsInitializing(true);
      setError(null);
      
      try {
        // TODO: Fetch meeting data, agenda, participants from API
        // For now, use data from MeetingPhaseContext
        
        if (meeting) {
          // Convert meeting participants to room participants
          const roomParticipants: RoomParticipant[] = (meeting.participants || []).map(p => ({
            ...p,
            attendanceStatus: 'expected' as const,
            connectionStatus: 'in_room' as const,
            joinedAt: null,
            leftAt: null,
            isMuted: false,
            isVideoOn: false,
            isScreenSharing: false,
            hasRaisedHand: false,
            handRaisedAt: null,
            isSpeaking: false,
            lastActiveAt: null,
          }));
          
          setParticipants(roomParticipants);
          
          // TODO: Fetch agenda items
          // setAgendaItems(fetchedAgendaItems);
          
          // Set initial status based on meeting status
          if (meeting.status === 'in_progress') {
            setStatus('in_progress');
            setStartedAt(meeting.statusUpdatedAt);
          }
        }
        
        // Simulate connection
        setIsConnected(true);
        setLastSyncAt(new Date().toISOString());
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize meeting room');
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    };
    
    initializeRoom();
  }, [meetingId, meeting]);

  // ============================================================================
  // DURATION TIMER
  // ============================================================================
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (status === 'in_progress' && startedAt) {
      interval = setInterval(() => {
        const start = new Date(startedAt).getTime();
        const now = Date.now();
        setDuration(Math.floor((now - start) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, startedAt]);

  // ============================================================================
  // ACTIONS
  // ============================================================================
  
  const startMeeting = useCallback(async () => {
    if (!quorumMet) {
      throw new Error('Cannot start meeting: Quorum not met');
    }
    
    setStatus('starting');
    
    try {
      // TODO: API call to start meeting
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API
      
      const now = new Date().toISOString();
      setStartedAt(now);
      setStatus('in_progress');
      
      // Mark all expected participants as joined (for demo)
      setParticipants(prev => prev.map(p => ({
        ...p,
        attendanceStatus: 'joined' as const,
        joinedAt: now,
      })));
      
      // Set first agenda item as current
      if (agendaItems.length > 0) {
        setCurrentAgendaItemId(agendaItems[0].id);
      }
      
    } catch (err) {
      setStatus('waiting');
      throw err;
    }
  }, [quorumMet, agendaItems]);
  
  const endMeeting = useCallback(async () => {
    setStatus('ending');
    
    try {
      // TODO: API call to end meeting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date().toISOString();
      setEndedAt(now);
      setStatus('ended');
      
      // Mark all participants as left
      setParticipants(prev => prev.map(p => ({
        ...p,
        attendanceStatus: 'left' as const,
        leftAt: now,
      })));
      
    } catch (err) {
      setStatus('in_progress');
      throw err;
    }
  }, []);
  
  const pauseMeeting = useCallback(async () => {
    try {
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPausedAt(new Date().toISOString());
      setStatus('paused');
    } catch (err) {
      throw err;
    }
  }, []);
  
  const resumeMeeting = useCallback(async () => {
    try {
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPausedAt(null);
      setStatus('in_progress');
    } catch (err) {
      throw err;
    }
  }, []);
  
  const leaveMeeting = useCallback(async () => {
    try {
      // TODO: API call to record user leaving
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update current user's participant status
      if (user) {
        setParticipants(prev => prev.map(p => 
          String(p.userId) === String(user.id)
            ? { ...p, attendanceStatus: 'left' as const, leftAt: new Date().toISOString() }
            : p
        ));
      }
    } catch (err) {
      throw err;
    }
  }, [user]);
  
  // Agenda actions
  const navigateToItem = useCallback(async (itemId: string) => {
    try {
      // TODO: API call
      setCurrentAgendaItemId(itemId);
    } catch (err) {
      throw err;
    }
  }, []);
  
  const markItemDiscussed = useCallback(async (itemId: string) => {
    try {
      // TODO: API call
      setAgendaItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: 'completed' as const } : item
      ));
      
      // Move to next item
      const currentIndex = agendaItems.findIndex(item => item.id === itemId);
      if (currentIndex < agendaItems.length - 1) {
        setCurrentAgendaItemId(agendaItems[currentIndex + 1].id);
      }
    } catch (err) {
      throw err;
    }
  }, [agendaItems]);
  
  const deferItem = useCallback(async (itemId: string) => {
    try {
      // TODO: API call
      setAgendaItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: 'skipped' as const } : item
      ));
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Document casting actions
  const startCasting = useCallback(async (documentId: string) => {
    try {
      // TODO: API call to get document details and start casting
      setCastingDocument({
        documentId,
        documentName: 'Document.pdf', // TODO: Get from API
        documentUrl: '', // TODO: Get from API
        currentPage: 1,
        totalPages: 10, // TODO: Get from API
        casterId: user?.id?.toString() || '',
        casterName: user?.fullName || '',
        startedAt: new Date().toISOString(),
      });
    } catch (err) {
      throw err;
    }
  }, [user]);
  
  const stopCasting = useCallback(async () => {
    try {
      // TODO: API call
      setCastingDocument(null);
    } catch (err) {
      throw err;
    }
  }, []);
  
  const navigatePage = useCallback((page: number) => {
    setCastingDocument(prev => prev ? { ...prev, currentPage: page } : null);
  }, []);
  
  // Voting actions
  const createVote = useCallback(async (motionText: string) => {
    try {
      // TODO: API call
      setActiveVote({
        id: `vote-${Date.now()}`,
        motionText,
        proposedBy: user?.id?.toString() || '',
        proposedByName: user?.fullName || '',
        secondedBy: null,
        secondedByName: null,
        status: 'pending',
        startedAt: null,
        endsAt: null,
        timeRemaining: 0,
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        totalVotes: 0,
        requiredVotes: quorumRequired,
        userHasVoted: false,
        userVote: null,
      });
    } catch (err) {
      throw err;
    }
  }, [user, quorumRequired]);
  
  const startVote = useCallback(async (_voteId: string) => {
    try {
      // TODO: API call
      const now = new Date();
      const endsAt = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes
      
      setActiveVote(prev => prev ? {
        ...prev,
        status: 'open',
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        timeRemaining: 120,
      } : null);
    } catch (err) {
      throw err;
    }
  }, []);
  
  const castVote = useCallback(async (_voteId: string, vote: 'for' | 'against' | 'abstain') => {
    try {
      // TODO: API call
      setActiveVote(prev => {
        if (!prev) return null;
        
        const updates = {
          votesFor: prev.votesFor + (vote === 'for' ? 1 : 0),
          votesAgainst: prev.votesAgainst + (vote === 'against' ? 1 : 0),
          votesAbstain: prev.votesAbstain + (vote === 'abstain' ? 1 : 0),
          totalVotes: prev.totalVotes + 1,
          userHasVoted: true,
          userVote: vote,
        };
        
        return { ...prev, ...updates };
      });
    } catch (err) {
      throw err;
    }
  }, []);
  
  const closeVote = useCallback(async (_voteId: string) => {
    try {
      // TODO: API call
      setActiveVote(prev => prev ? { ...prev, status: 'closed' } : null);
      
      // Clear active vote after a delay
      setTimeout(() => setActiveVote(null), 5000);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Participant actions
  const raiseHand = useCallback(() => {
    if (!user) return;
    
    setParticipants(prev => prev.map(p =>
      String(p.userId) === String(user.id)
        ? { ...p, hasRaisedHand: true, handRaisedAt: new Date().toISOString() }
        : p
    ));
  }, [user]);
  
  const lowerHand = useCallback(() => {
    if (!user) return;
    
    setParticipants(prev => prev.map(p =>
      String(p.userId) === String(user.id)
        ? { ...p, hasRaisedHand: false, handRaisedAt: null }
        : p
    ));
  }, [user]);
  
  const toggleMute = useCallback(() => {
    if (!user) return;
    
    setParticipants(prev => prev.map(p =>
      String(p.userId) === String(user.id)
        ? { ...p, isMuted: !p.isMuted }
        : p
    ));
  }, [user]);
  
  const toggleVideo = useCallback(() => {
    if (!user) return;
    
    setParticipants(prev => prev.map(p =>
      String(p.userId) === String(user.id)
        ? { ...p, isVideoOn: !p.isVideoOn }
        : p
    ));
  }, [user]);
  
  const startScreenShare = useCallback(async () => {
    if (!user) return;
    
    setParticipants(prev => prev.map(p =>
      String(p.userId) === String(user.id)
        ? { ...p, isScreenSharing: true }
        : p
    ));
  }, [user]);
  
  const stopScreenShare = useCallback(() => {
    if (!user) return;
    
    setParticipants(prev => prev.map(p =>
      String(p.userId) === String(user.id)
        ? { ...p, isScreenSharing: false }
        : p
    ));
  }, [user]);
  
  // Host actions
  const admitParticipant = useCallback(async (participantId: string) => {
    try {
      // TODO: API call
      setParticipants(prev => prev.map(p =>
        p.id === participantId
          ? { ...p, attendanceStatus: 'joined' as const, joinedAt: new Date().toISOString() }
          : p
      ));
    } catch (err) {
      throw err;
    }
  }, []);
  
  const admitAllParticipants = useCallback(async () => {
    try {
      // TODO: API call
      const now = new Date().toISOString();
      setParticipants(prev => prev.map(p =>
        p.attendanceStatus === 'waiting'
          ? { ...p, attendanceStatus: 'joined' as const, joinedAt: now }
          : p
      ));
    } catch (err) {
      throw err;
    }
  }, []);
  
  const removeParticipant = useCallback(async (participantId: string) => {
    try {
      // TODO: API call
      setParticipants(prev => prev.map(p =>
        p.id === participantId
          ? { ...p, attendanceStatus: 'removed' as const, leftAt: new Date().toISOString() }
          : p
      ));
    } catch (err) {
      throw err;
    }
  }, []);
  
  const muteParticipant = useCallback(async (participantId: string) => {
    try {
      // TODO: API call
      setParticipants(prev => prev.map(p =>
        p.id === participantId ? { ...p, isMuted: true } : p
      ));
    } catch (err) {
      throw err;
    }
  }, []);
  
  const promoteToPresenter = useCallback(async (participantId: string) => {
    try {
      // TODO: API call
      console.log('Promoting participant to presenter:', participantId);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Recording actions
  const startRecording = useCallback(async () => {
    try {
      // TODO: API call
      setIsRecording(true);
      setRecordingStartedAt(new Date().toISOString());
    } catch (err) {
      throw err;
    }
  }, []);
  
  const stopRecording = useCallback(async () => {
    try {
      // TODO: API call
      setIsRecording(false);
      setRecordingStartedAt(null);
    } catch (err) {
      throw err;
    }
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const roomState: MeetingRoomState = useMemo(() => ({
    meetingId,
    meeting,
    status,
    mode,
    startedAt,
    endedAt,
    pausedAt,
    duration,
    currentAgendaItemId,
    currentAgendaItem,
    agendaItems,
    participants,
    expectedCount,
    presentCount,
    quorumRequired,
    quorumMet,
    activeVote,
    castingDocument,
    isConnected,
    isSyncing,
    lastSyncAt,
    isRecording,
    recordingStartedAt,
  }), [
    meetingId, meeting, status, mode, startedAt, endedAt, pausedAt, duration,
    currentAgendaItemId, currentAgendaItem, agendaItems, participants,
    expectedCount, presentCount, quorumRequired, quorumMet, activeVote,
    castingDocument, isConnected, isSyncing, lastSyncAt, isRecording, recordingStartedAt
  ]);
  
  const actions: MeetingRoomActions = useMemo(() => ({
    startMeeting,
    endMeeting,
    pauseMeeting,
    resumeMeeting,
    leaveMeeting,
    navigateToItem,
    markItemDiscussed,
    deferItem,
    startCasting,
    stopCasting,
    navigatePage,
    createVote,
    startVote,
    castVote,
    closeVote,
    raiseHand,
    lowerHand,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    admitParticipant,
    admitAllParticipants,
    removeParticipant,
    muteParticipant,
    promoteToPresenter,
    startRecording,
    stopRecording,
  }), [
    startMeeting, endMeeting, pauseMeeting, resumeMeeting, leaveMeeting,
    navigateToItem, markItemDiscussed, deferItem, startCasting, stopCasting,
    navigatePage, createVote, startVote, castVote, closeVote, raiseHand,
    lowerHand, toggleMute, toggleVideo, startScreenShare, stopScreenShare,
    admitParticipant, admitAllParticipants, removeParticipant, muteParticipant,
    promoteToPresenter, startRecording, stopRecording
  ]);
  
  const value: MeetingRoomContextType = useMemo(() => ({
    roomState,
    actions,
    isLoading,
    isInitializing,
    error,
  }), [roomState, actions, isLoading, isInitializing, error]);

  return (
    <MeetingRoomContext.Provider value={value}>
      {children}
    </MeetingRoomContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to access meeting room context
 */
export const useMeetingRoom = (): MeetingRoomContextType => {
  const context = useContext(MeetingRoomContext);
  if (context === undefined) {
    throw new Error('useMeetingRoom must be used within a MeetingRoomProvider');
  }
  return context;
};

/**
 * Hook to access room state only
 */
export const useRoomState = (): MeetingRoomState => {
  const { roomState } = useMeetingRoom();
  return roomState;
};

/**
 * Hook to access room actions only
 */
export const useRoomActions = (): MeetingRoomActions => {
  const { actions } = useMeetingRoom();
  return actions;
};
