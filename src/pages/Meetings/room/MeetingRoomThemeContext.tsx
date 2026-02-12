/**
 * MeetingRoomThemeContext
 * 
 * Provides a mode-aware theme (dark or light) to all meeting room components.
 * Built from the board's accent colors + mode-specific palette overrides.
 * 
 * Usage: wrap MeetingRoomLayout with <MeetingRoomThemeProvider>
 * Components use:
 *   - useMeetingRoomTheme() for theme tokens (colors, typography, etc.)
 *   - useDisplayMode() for current mode + setter to toggle
 * 
 * Never use useBoardContext().theme directly inside the meeting room.
 */

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useBoardContext } from '../../../contexts';
import { buildMeetingRoomTheme, defaultMeetingRoomTheme } from './meetingRoomTheme';
import type { MeetingRoomTheme, DisplayMode } from './meetingRoomTheme';

// ── Theme context (colors, typography, tokens) ──

const MeetingRoomThemeCtx = createContext<MeetingRoomTheme>(defaultMeetingRoomTheme);

export const useMeetingRoomTheme = (): MeetingRoomTheme => useContext(MeetingRoomThemeCtx);

// ── Display mode context (mode + toggle) ──

interface DisplayModeContextValue {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  toggleMode: () => void;
  isDark: boolean;
}

const DisplayModeCtx = createContext<DisplayModeContextValue>({
  mode: 'dark',
  setMode: () => {},
  toggleMode: () => {},
  isDark: true,
});

export const useDisplayMode = (): DisplayModeContextValue => useContext(DisplayModeCtx);

// ── Provider ──

interface Props {
  children: React.ReactNode;
  defaultMode?: DisplayMode;
}

export const MeetingRoomThemeProvider: React.FC<Props> = ({ children, defaultMode = 'dark' }) => {
  const { theme: boardTheme } = useBoardContext();
  const [mode, setMode] = useState<DisplayMode>(defaultMode);

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = useMemo(
    () => buildMeetingRoomTheme(boardTheme, mode),
    [boardTheme, mode]
  );

  const displayModeValue = useMemo<DisplayModeContextValue>(
    () => ({ mode, setMode, toggleMode, isDark: mode === 'dark' }),
    [mode, toggleMode]
  );

  return (
    <DisplayModeCtx.Provider value={displayModeValue}>
      <MeetingRoomThemeCtx.Provider value={theme}>
        {children}
      </MeetingRoomThemeCtx.Provider>
    </DisplayModeCtx.Provider>
  );
};
