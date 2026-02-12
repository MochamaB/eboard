/**
 * MeetingRoomThemeContext
 * 
 * Provides the dark Jitsi-style theme to all meeting room components.
 * Built from the board's accent colors + dark palette overrides.
 * 
 * Usage: wrap MeetingRoomLayout with <MeetingRoomThemeProvider>
 * Components use useMeetingRoomTheme() instead of useBoardContext().theme
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useBoardContext } from '../../../contexts';
import { buildMeetingRoomTheme, defaultMeetingRoomTheme } from './meetingRoomTheme';
import type { MeetingRoomTheme } from './meetingRoomTheme';

const MeetingRoomThemeCtx = createContext<MeetingRoomTheme>(defaultMeetingRoomTheme);

export const useMeetingRoomTheme = (): MeetingRoomTheme => useContext(MeetingRoomThemeCtx);

interface Props {
  children: React.ReactNode;
}

export const MeetingRoomThemeProvider: React.FC<Props> = ({ children }) => {
  const { theme: boardTheme } = useBoardContext();

  const darkTheme = useMemo(
    () => buildMeetingRoomTheme(boardTheme),
    [boardTheme]
  );

  return (
    <MeetingRoomThemeCtx.Provider value={darkTheme}>
      {children}
    </MeetingRoomThemeCtx.Provider>
  );
};
