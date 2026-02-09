/**
 * Meeting Phase Context
 * Manages meeting phase state and controls sidebar collapse for meeting detail pages
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Meeting, MeetingStatus } from '../types/meeting.types';
import type { MeetingPermissions } from '../types/meetingPermissions.types';

export type MeetingPhase = 'pre-meeting' | 'during-meeting' | 'post-meeting';
export type MeetingPhaseStatus = 'active' | 'completed' | 'cancelled' | 'rejected' | 'error';

export interface PhaseInfo {
  phase: MeetingPhase;
  status: MeetingPhaseStatus;
  canProceed: boolean;
  subStatusLabel?: string;
}

interface MeetingPhaseContextType {
  meetingId: string | null;
  meeting: Meeting | null;
  phaseInfo: PhaseInfo | null;
  permissions: MeetingPermissions | null;
  isInMeetingDetail: boolean;
  setMeeting: (meeting: Meeting | null) => void;
  clearMeeting: () => void;
}

const MeetingPhaseContext = createContext<MeetingPhaseContextType | undefined>(undefined);

/**
 * Determine meeting phase based on status + subStatus
 * Updated for new status model with 5 primary statuses and contextual subStatuses
 */
const getPhaseInfo = (meetingStatus: MeetingStatus, subStatus?: string | null): PhaseInfo => {
  // Handle draft status
  if (meetingStatus === 'draft') {
    if (subStatus === 'incomplete') {
      return { 
        phase: 'pre-meeting', 
        status: 'active', 
        canProceed: true,
        subStatusLabel: 'Configuration Incomplete'
      };
    }
    if (subStatus === 'complete') {
      return { 
        phase: 'pre-meeting', 
        status: 'active', 
        canProceed: true,
        subStatusLabel: 'Ready for Submission'
      };
    }
    return { phase: 'pre-meeting', status: 'active', canProceed: true };
  }

  // Handle scheduled status
  if (meetingStatus === 'scheduled') {
    if (subStatus === 'pending_approval') {
      return { 
        phase: 'pre-meeting', 
        status: 'active', 
        canProceed: true,
        subStatusLabel: 'Awaiting Approval'
      };
    }
    if (subStatus === 'approved') {
      return { 
        phase: 'pre-meeting', 
        status: 'completed', 
        canProceed: true,
        subStatusLabel: 'Approved'
      };
    }
    if (subStatus === 'rejected') {
      return { 
        phase: 'pre-meeting', 
        status: 'rejected', 
        canProceed: true,
        subStatusLabel: 'Rejected - Needs Revision'
      };
    }
    return { phase: 'pre-meeting', status: 'active', canProceed: true };
  }

  // Handle in_progress status
  if (meetingStatus === 'in_progress') {
    return { 
      phase: 'during-meeting', 
      status: 'active', 
      canProceed: true,
      subStatusLabel: 'Meeting in Progress'
    };
  }

  // Handle completed status
  if (meetingStatus === 'completed') {
    if (subStatus === 'recent') {
      return { 
        phase: 'post-meeting', 
        status: 'active', 
        canProceed: true,
        subStatusLabel: 'Post-Meeting Work Active'
      };
    }
    if (subStatus === 'archived') {
      return { 
        phase: 'post-meeting', 
        status: 'completed', 
        canProceed: false,
        subStatusLabel: 'Archived'
      };
    }
    return { phase: 'post-meeting', status: 'completed', canProceed: false };
  }

  // Handle cancelled status (terminal state)
  if (meetingStatus === 'cancelled') {
    return { 
      phase: 'pre-meeting', 
      status: 'cancelled', 
      canProceed: false,
      subStatusLabel: 'Cancelled'
    };
  }

  // Default fallback
  return { phase: 'pre-meeting', status: 'active', canProceed: true };
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
    return getPhaseInfo(meeting.status, meeting.subStatus);
  }, [meeting]);

  const value = useMemo<MeetingPhaseContextType>(
    () => ({
      meetingId: meeting?.id || null,
      meeting,
      phaseInfo,
      permissions: null, // Will be computed by useMeetingPermissions hook in consuming components
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
