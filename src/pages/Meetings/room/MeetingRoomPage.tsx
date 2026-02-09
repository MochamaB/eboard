/**
 * Meeting Room Page
 * Entry point for the live meeting room experience
 * 
 * This page:
 * - Loads meeting data
 * - Initializes MeetingRoomContext
 * - Renders MeetingRoomLayout
 * - Handles loading/error states
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Button, Result } from 'antd';
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { useMeetingPhase } from '../../../contexts/MeetingPhaseContext';
import { MeetingRoomProvider, useMeetingRoom } from '../../../contexts/MeetingRoomContext';
import { useMeeting } from '../../../hooks/api/useMeetings';
import MeetingRoomLayout from './MeetingRoomLayout';

// ============================================================================
// INNER COMPONENT (has access to MeetingRoomContext)
// ============================================================================

const MeetingRoomContent: React.FC = () => {
  const { isLoading, isInitializing, error } = useMeetingRoom();
  
  if (isInitializing || isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <p style={{ marginTop: 16, color: '#666' }}>Initializing meeting room...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24 }}>
        <Alert type="error" message="Error" description={error} showIcon />
      </div>
    );
  }
  
  return <MeetingRoomLayout />;
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const MeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { setMeeting } = useMeetingPhase();
  
  // Fetch meeting data
  const { data: meeting, isLoading, error } = useMeeting(meetingId || '');
  
  // Set meeting in phase context when loaded
  useEffect(() => {
    if (meeting) {
      setMeeting(meeting);
    }
  }, [meeting, setMeeting]);
  
  // Handle missing meeting ID
  if (!meetingId) {
    return (
      <Result
        status="error"
        title="Invalid Meeting"
        subTitle="No meeting ID provided."
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/meetings')}>
            Back to Meetings
          </Button>
        }
      />
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <p style={{ marginTop: 16, color: '#666' }}>Loading meeting...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !meeting) {
    return (
      <Result
        status="error"
        title="Meeting Not Found"
        subTitle={error?.message || 'The requested meeting could not be found.'}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/meetings')}>
            Back to Meetings
          </Button>
        }
      />
    );
  }
  
  // Check if meeting can be accessed as a room
  // Only in_progress or scheduled.approved meetings can enter room
  const canEnterRoom = 
    meeting.status === 'in_progress' || 
    (meeting.status === 'scheduled' && meeting.subStatus === 'approved');
  
  if (!canEnterRoom) {
    return (
      <Result
        status="warning"
        title="Meeting Not Available"
        subTitle={`This meeting is not currently available for joining. Status: ${meeting.status}${meeting.subStatus ? ` (${meeting.subStatus})` : ''}`}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/meetings/${meetingId}`)}>
            Back to Meeting Details
          </Button>
        }
      />
    );
  }
  
  return (
    <MeetingRoomProvider meetingId={meetingId}>
      <MeetingRoomContent />
    </MeetingRoomProvider>
  );
};

export default MeetingRoomPage;
