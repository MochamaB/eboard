/**
 * Meeting Phase Context
 * Manages meeting phase state and controls sidebar collapse for meeting detail pages
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Meeting, MeetingStatus } from '../types/meeting.types';

export type MeetingPhase = 'pre-meeting' | 'during-meeting' | 'post-meeting';
export type MeetingPhaseStatus = 'active' | 'completed' | 'cancelled' | 'rejected';

export interface PhaseInfo {
  phase: MeetingPhase;
  status: MeetingPhaseStatus;
  canProceed: boolean;
}

interface MeetingPhaseContextType {
  meetingId: string | null;
  meeting: Meeting | null;
  phaseInfo: PhaseInfo | null;
  isInMeetingDetail: boolean;
  setMeeting: (meeting: Meeting | null) => void;
  clearMeeting: () => void;
}

const MeetingPhaseContext = createContext<MeetingPhaseContextType | undefined>(undefined);

/**
 * Determine meeting phase based on status
 */
const getPhaseInfo = (meetingStatus: MeetingStatus): PhaseInfo => {
  switch (meetingStatus) {
    case 'draft':
    case 'pending_confirmation':
    case 'confirmed':
    case 'scheduled':
      return { phase: 'pre-meeting', status: 'active', canProceed: true };
    
    case 'rejected':
      return { phase: 'pre-meeting', status: 'rejected', canProceed: true }; // Can resubmit
    
    case 'cancelled':
      return { phase: 'pre-meeting', status: 'cancelled', canProceed: false }; // Terminal
    
    case 'in_progress':
      return { phase: 'during-meeting', status: 'active', canProceed: true };
    
    case 'completed':
      return { phase: 'post-meeting', status: 'completed', canProceed: false }; // Final state
    
    default:
      return { phase: 'pre-meeting', status: 'active', canProceed: true };
  }
};

interface MeetingPhaseProviderProps {
  children: React.ReactNode;
}

export const MeetingPhaseProvider: React.FC<MeetingPhaseProviderProps> = ({ children }) => {
  const [meeting, setMeetingState] = useState<Meeting | null>(null);

  const setMeeting = useCallback((newMeeting: Meeting | null) => {
    setMeetingState(newMeeting);
  }, []);

  const clearMeeting = useCallback(() => {
    setMeetingState(null);
  }, []);

  const phaseInfo = useMemo(() => {
    if (!meeting) return null;
    return getPhaseInfo(meeting.status);
  }, [meeting]);

  const value = useMemo<MeetingPhaseContextType>(
    () => ({
      meetingId: meeting?.id || null,
      meeting,
      phaseInfo,
      isInMeetingDetail: meeting !== null,
      setMeeting,
      clearMeeting,
    }),
    [meeting, phaseInfo, setMeeting, clearMeeting]
  );

  return (
    <MeetingPhaseContext.Provider value={value}>
      {children}
    </MeetingPhaseContext.Provider>
  );
};

/**
 * Hook to access meeting phase context
 */
export const useMeetingPhase = (): MeetingPhaseContextType => {
  const context = useContext(MeetingPhaseContext);
  if (context === undefined) {
    throw new Error('useMeetingPhase must be used within a MeetingPhaseProvider');
  }
  return context;
};

/**
 * Hook to check if currently in meeting detail view
 */
export const useIsInMeetingDetail = (): boolean => {
  const context = useContext(MeetingPhaseContext);
  return context?.isInMeetingDetail ?? false;
};
