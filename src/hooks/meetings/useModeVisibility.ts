/**
 * useModeVisibility Hook
 * Returns feature visibility flags based on the computed meeting mode.
 * 
 * Used by meeting room components to conditionally render mode-specific sections:
 * - Physical features (check-in, attendance card)
 * - Virtual features (video conference, media controls)
 * - Hybrid features (both physical + virtual)
 * 
 * The mode is computed dynamically from participant connection states,
 * so visibility flags update automatically during mode transitions.
 */

import { useMemo, useContext } from 'react';
import { MeetingRoomContext } from '../../contexts/MeetingRoomContext';
import type { MeetingMode } from '../../types/meetingRoom.types';

export interface ModeVisibility {
  /** Current computed meeting mode */
  mode: MeetingMode;
  /** Show physical-only features (mode is physical or hybrid) */
  showPhysicalFeatures: boolean;
  /** Show virtual-only features (mode is virtual or hybrid) */
  showVirtualFeatures: boolean;
  /** Show features that only appear in hybrid mode */
  showHybridFeatures: boolean;
  /** Show media controls (mute, video, screen share) — virtual or hybrid only */
  showMediaControls: boolean;
  /** Show recording controls — virtual or hybrid only */
  showRecordingControls: boolean;
}

/**
 * Hook to determine which mode-specific features should be visible.
 * Safe to call outside MeetingRoomProvider (returns physical defaults).
 */
export function useModeVisibility(): ModeVisibility {
  const roomContext = useContext(MeetingRoomContext);

  return useMemo(() => {
    const mode: MeetingMode = roomContext?.roomState?.mode || 'physical';

    const isPhysical = mode === 'physical';
    const isVirtual = mode === 'virtual';
    const isHybrid = mode === 'hybrid';

    return {
      mode,
      showPhysicalFeatures: isPhysical || isHybrid,
      showVirtualFeatures: isVirtual || isHybrid,
      showHybridFeatures: isHybrid,
      showMediaControls: isVirtual || isHybrid,
      showRecordingControls: isVirtual || isHybrid,
    };
  }, [roomContext?.roomState?.mode]);
}
