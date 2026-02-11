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
  MeetingMode,
  RoomStatus,
  RoomParticipant,
  ActiveVote,
  CastingDocument,
  MeetingHostInfo,
  MeetingRoomSettings,
  RoomCapabilities,
  ModeFeatures,
  ModeTransition,
} from '../types/meetingRoom.types';
import {
  determineMeetingHost,
  getStatusCapabilities,
  computeModeFeatures,
  DEFAULT_MEETING_ROOM_SETTINGS,
} from '../types/meetingRoom.types';
import type { AgendaItem } from '../types/agenda.types';
import { useAgenda } from '../hooks/api/useAgenda';
import { useMeetingDocuments } from '../hooks/api/useDocuments';

// ============================================================================
// CONTEXT
// ============================================================================

export const MeetingRoomContext = createContext<MeetingRoomContextType | undefined>(undefined);

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
  
  // Fetch agenda data dynamically for any meeting
  const { data: agendaData, isLoading: _isAgendaLoading } = useAgenda(meetingId);
  
  // Fetch meeting documents for casting lookup
  const { data: meetingDocsData } = useMeetingDocuments(meetingId);
  
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

  // Host info
  const [hostInfo, setHostInfo] = useState<MeetingHostInfo>({
    hostUserId: null, hostName: null, cohostUserId: null, cohostName: null,
  });

  // Settings
  const [settings, setSettings] = useState<MeetingRoomSettings>({ ...DEFAULT_MEETING_ROOM_SETTINGS });

  // Mode transition tracking
  const [previousMode, setPreviousMode] = useState<MeetingMode | null>(null);
  const [modeTransitions, setModeTransitions] = useState<ModeTransition[]>([]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const mode = useMemo((): MeetingMode => {
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

  // Mode-derived feature visibility (recomputes when mode or participants change)
  const modeFeatures: ModeFeatures = useMemo(() => {
    return computeModeFeatures(mode, participants);
  }, [mode, participants]);

  // Mode-change detection — track transitions and log them
  useEffect(() => {
    if (previousMode !== null && previousMode !== mode) {
      const transition: ModeTransition = {
        from: previousMode,
        to: mode,
        timestamp: new Date().toISOString(),
        trigger: mode === 'hybrid'
          ? 'Remote participant joined'
          : mode === 'physical'
            ? 'All virtual participants left'
            : 'All physical participants went remote',
      };
      setModeTransitions(prev => [...prev, transition]);
      console.log(`[MeetingRoom] Mode transition: ${previousMode} → ${mode}`, transition);
    }
    setPreviousMode(mode);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
        if (meeting) {
          // Determine meeting host from participants
          const computedHostInfo = determineMeetingHost(
            (meeting.participants || []).map(p => ({
              userId: p.userId,
              name: p.name,
              boardRole: p.boardRole,
            }))
          );
          setHostInfo(computedHostInfo);

          // Determine initial attendance status based on meeting status + location type
          const isAlreadyInProgress = meeting.status === 'in_progress';
          const isPhysical = meeting.locationType === 'physical';
          const isVirtual = meeting.locationType === 'virtual';
          // const isHybrid = meeting.locationType === 'hybrid';

          const roomParticipants: RoomParticipant[] = (meeting.participants || []).map(p => {
            let attendance: 'expected' | 'waiting' | 'joined' = 'expected';
            let connection: 'in_room' | 'connected' | 'connecting' | 'disconnected' = 'in_room';
            const accepted = p.rsvpStatus === 'accepted' || p.rsvpStatus === 'no_response';

            if (isAlreadyInProgress) {
              // Meeting already running — accepted participants are joined
              attendance = accepted ? 'joined' : 'expected';
              connection = isPhysical ? 'in_room' : 'connected';
            } else if (isPhysical) {
              // Physical meeting lobby: accepted participants have arrived
              attendance = accepted ? 'joined' : 'expected';
              connection = 'in_room';
            } else if (isVirtual) {
              // Virtual meeting lobby: accepted go to waiting room
              attendance = accepted ? 'waiting' : 'expected';
              connection = accepted ? 'connecting' : 'disconnected';
            } else {
              // Hybrid: physical participants join, virtual wait
              // For mock: treat all as physical (joined) since we don't track per-participant location
              attendance = accepted ? 'joined' : 'expected';
              connection = 'in_room';
            }

            return {
              ...p,
              attendanceStatus: attendance,
              connectionStatus: connection,
              joinedAt: attendance === 'joined' ? new Date().toISOString() : null,
              leftAt: null,
              isMuted: false,
              isVideoOn: false,
              isScreenSharing: false,
              hasRaisedHand: false,
              handRaisedAt: null,
              isSpeaking: false,
              lastActiveAt: null,
            };
          });
          
          setParticipants(roomParticipants);
          
          // Set initial status based on meeting status
          if (isAlreadyInProgress) {
            setStatus('in_progress');
            setStartedAt(meeting.statusUpdatedAt);
          } else if (meeting.status === 'completed') {
            setStatus('ended');
            setEndedAt(meeting.statusUpdatedAt);
          } else {
            setStatus('waiting');
          }

          // Apply settings based on location type
          setSettings(prev => ({
            ...prev,
            enableWaitingRoom: !isPhysical, // Only for virtual/hybrid
            muteParticipantsOnEntry: !isPhysical, // Only for virtual/hybrid
          }));
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

  // Seed agenda items from useAgenda hook when data loads
  useEffect(() => {
    if (agendaData?.items && agendaData.items.length > 0) {
      setAgendaItems(agendaData.items);
      
      // For in_progress meetings, find the current item from mock data
      // (the item with status 'in_progress', or the first non-completed item)
      if (meeting?.status === 'in_progress' && !currentAgendaItemId) {
        const inProgressItem = agendaData.items.find(item => item.status === 'in_progress');
        const firstPendingItem = agendaData.items.find(item => item.status === 'pending');
        const currentItem = inProgressItem || firstPendingItem;
        if (currentItem) {
          setCurrentAgendaItemId(currentItem.id);
        }
      }
    }
  }, [agendaData, meeting?.status, currentAgendaItemId]);

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
      // Look up document from meeting documents
      const docAttachment = meetingDocsData?.find(att => att.document.id === documentId);
      const doc = docAttachment?.document;
      
      setCastingDocument({
        documentId,
        documentName: doc?.name || 'Document',
        documentUrl: doc?.url || '/mock-documents/sample.pdf',
        fileType: doc?.fileType || 'pdf',
        currentPage: 1,
        totalPages: 10, // DocumentSummary doesn't include pageCount; production will get from full Document
        casterId: user?.id?.toString() || '',
        casterName: user?.fullName || '',
        startedAt: new Date().toISOString(),
        watermarkEnabled: doc?.watermarkEnabled || false,
        isConfidential: doc?.isConfidential || false,
      });
    } catch (err) {
      throw err;
    }
  }, [user, meetingDocsData]);
  
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
      const voteDuration = settings.defaultVoteDuration; // From room settings
      const now = new Date();
      const endsAt = new Date(now.getTime() + voteDuration * 1000);
      
      setActiveVote(prev => prev ? {
        ...prev,
        status: 'open',
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        timeRemaining: voteDuration,
      } : null);
    } catch (err) {
      throw err;
    }
  }, [settings.defaultVoteDuration]);
  
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
  // MODE TRANSITION ACTIONS
  // ============================================================================

  /**
   * Toggle a participant's location between in_room ↔ connected.
   * This triggers mode recomputation (Physical ↔ Hybrid ↔ Virtual).
   * Used for testing/demo of dynamic mode transitions per Section 3 of 0308.
   */
  const toggleParticipantLocation = useCallback((participantId: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id !== participantId) return p;
      const newConnectionStatus = p.connectionStatus === 'in_room' ? 'connected' as const : 'in_room' as const;
      return {
        ...p,
        connectionStatus: newConnectionStatus,
        // If switching to virtual, ensure they have virtual defaults
        isMuted: newConnectionStatus === 'connected' ? (settings.muteParticipantsOnEntry || p.isMuted) : false,
        isVideoOn: newConnectionStatus === 'connected' ? false : false,
      };
    }));
  }, [settings.muteParticipantsOnEntry]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  // Compute capabilities from current room status
  const capabilities: RoomCapabilities = useMemo(() => {
    return getStatusCapabilities(status);
  }, [status]);

  const roomState: MeetingRoomState = useMemo(() => ({
    meetingId,
    meeting,
    status,
    mode,
    previousMode,
    modeFeatures,
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
    hostInfo,
    settings,
    activeVote,
    castingDocument,
    isConnected,
    isSyncing,
    lastSyncAt,
    isRecording,
    recordingStartedAt,
  }), [
    meetingId, meeting, status, mode, previousMode, modeFeatures, startedAt, endedAt, pausedAt, duration,
    currentAgendaItemId, currentAgendaItem, agendaItems, participants,
    expectedCount, presentCount, quorumRequired, quorumMet, hostInfo, settings,
    activeVote, castingDocument, isConnected, isSyncing, lastSyncAt, isRecording, recordingStartedAt
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
    toggleParticipantLocation,
  }), [
    startMeeting, endMeeting, pauseMeeting, resumeMeeting, leaveMeeting,
    navigateToItem, markItemDiscussed, deferItem, startCasting, stopCasting,
    navigatePage, createVote, startVote, castVote, closeVote, raiseHand,
    lowerHand, toggleMute, toggleVideo, startScreenShare, stopScreenShare,
    admitParticipant, admitAllParticipants, removeParticipant, muteParticipant,
    promoteToPresenter, startRecording, stopRecording, toggleParticipantLocation
  ]);
  
  const value: MeetingRoomContextType = useMemo(() => ({
    roomState,
    actions,
    capabilities,
    modeFeatures,
    isLoading,
    isInitializing,
    error,
  }), [roomState, actions, capabilities, modeFeatures, isLoading, isInitializing, error]);

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
