/**
 * Meeting Room Page
 * Full-screen entry point for the live meeting room (Jitsi-style dark UI).
 * 
 * Opens in its own route WITHOUT AppLayout (no sidebar, no header).
 * Provides its own MeetingPhaseProvider + MeetingRoomThemeProvider.
 * 
 * Sets document title to meeting name.
 * Dark loading/error states matching the room aesthetic.
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Result, ConfigProvider, theme as antdThemeAlgo } from 'antd';
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { MeetingPhaseProvider, useMeetingPhase, useBoardContext } from '../../../contexts';
import { MeetingRoomProvider, useMeetingRoom } from '../../../contexts/MeetingRoomContext';
import { useMeeting } from '../../../hooks/api/useMeetings';
import { MeetingRoomThemeProvider, useMeetingRoomTheme } from './MeetingRoomThemeContext';
import { getBoardById } from '../../../mocks/db/queries/boardQueries';
import MeetingRoomLayout from './MeetingRoomLayout';

// ============================================================================
// DARK SHELL STYLES
// ============================================================================

const darkShellStyle: React.CSSProperties = {
  width: '100vw',
  height: '100dvh',
  background: '#111111',
  color: '#e0e0e0',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const centeredStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: 24,
};

// ============================================================================
// INNER COMPONENT (has access to MeetingRoomContext)
// ============================================================================

const MeetingRoomContent: React.FC = () => {
  const { isLoading, isInitializing, error } = useMeetingRoom();
  const mrTheme = useMeetingRoomTheme();
  
  if (isInitializing || isLoading) {
    return (
      <div style={{ ...darkShellStyle, ...centeredStyle }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: mrTheme.primaryColor }} spin />} />
        <p style={{ marginTop: 16, color: mrTheme.textSecondary }}>Initializing meeting room...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ ...darkShellStyle, ...centeredStyle }}>
        <Result
          status="error"
          title={<span style={{ color: mrTheme.textPrimary }}>Room Error</span>}
          subTitle={<span style={{ color: mrTheme.textSecondary }}>{error}</span>}
        />
      </div>
    );
  }
  
  return (
    <div style={darkShellStyle}>
      <MeetingRoomLayout />
    </div>
  );
};

// ============================================================================
// ROOM LOADER (inside MeetingPhaseProvider, outside MeetingRoomProvider)
// ============================================================================

const MeetingRoomLoader: React.FC = () => {
  const { meetingId, boardId } = useParams<{ meetingId: string; boardId: string }>();
  const navigate = useNavigate();
  const { setMeeting } = useMeetingPhase();
  const { setCurrentBoard, currentBoard } = useBoardContext();
  
  // Sync board context from URL
  useEffect(() => {
    if (boardId && currentBoard.id !== boardId) {
      const board = getBoardById(boardId);
      if (board) {
        setCurrentBoard(boardId);
      }
    }
  }, [boardId, currentBoard.id, setCurrentBoard]);
  
  // Fetch meeting data
  const { data: meeting, isLoading, error } = useMeeting(meetingId || '');
  
  // Set meeting in phase context + document title
  useEffect(() => {
    if (meeting) {
      setMeeting(meeting);
      document.title = `${meeting.title} — eBoard Room`;
    }
    return () => { document.title = 'eBoard'; };
  }, [meeting, setMeeting]);
  
  // Handle missing meeting ID
  if (!meetingId) {
    return (
      <div style={{ ...darkShellStyle, ...centeredStyle }}>
        <Result
          status="error"
          title={<span style={{ color: '#e0e0e0' }}>Invalid Meeting</span>}
          subTitle={<span style={{ color: '#a0a0b0' }}>No meeting ID provided.</span>}
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }
  
  // Loading
  if (isLoading) {
    return (
      <div style={{ ...darkShellStyle, ...centeredStyle }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#4a6cf7' }} spin />} />
        <p style={{ marginTop: 16, color: '#a0a0b0' }}>Loading meeting...</p>
      </div>
    );
  }
  
  // Error / not found
  if (error || !meeting) {
    return (
      <div style={{ ...darkShellStyle, ...centeredStyle }}>
        <Result
          status="error"
          title={<span style={{ color: '#e0e0e0' }}>Meeting Not Found</span>}
          subTitle={<span style={{ color: '#a0a0b0' }}>{error?.message || 'The requested meeting could not be found.'}</span>}
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }
  
  // Access guard
  const canEnterRoom = 
    meeting.status === 'in_progress' || 
    (meeting.status === 'scheduled' && meeting.subStatus === 'approved');
  
  if (!canEnterRoom) {
    return (
      <div style={{ ...darkShellStyle, ...centeredStyle }}>
        <Result
          status="warning"
          title={<span style={{ color: '#e0e0e0' }}>Meeting Not Available</span>}
          subTitle={
            <span style={{ color: '#a0a0b0' }}>
              Status: {meeting.status}{meeting.subStatus ? ` (${meeting.subStatus})` : ''}
            </span>
          }
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }
  
  return (
    <MeetingRoomThemeProvider>
      <MeetingRoomProvider meetingId={meetingId}>
        <MeetingRoomContent />
      </MeetingRoomProvider>
    </MeetingRoomThemeProvider>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT — wraps with MeetingPhaseProvider + dark Ant Design
// ============================================================================

const MeetingRoomPage: React.FC = () => {
  return (
    <MeetingPhaseProvider>
      <ConfigProvider
        theme={{
          algorithm: antdThemeAlgo.darkAlgorithm,
          token: {
            colorBgContainer: '#1a1a1a',
            colorBgElevated: '#232323',
            colorBgLayout: '#111111',
            colorBgSpotlight: 'rgba(30,30,30,0.95)',
            colorBorder: '#2e2e2e',
            colorText: '#e0e0e0',
            colorTextSecondary: '#a0a0a0',
            colorTextLightSolid: '#e0e0e0',
          },
        }}
      >
        <MeetingRoomLoader />
      </ConfigProvider>
    </MeetingPhaseProvider>
  );
};

export default MeetingRoomPage;
