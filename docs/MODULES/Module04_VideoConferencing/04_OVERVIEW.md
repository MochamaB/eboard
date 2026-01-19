# Module 4: Video Conferencing (Jitsi Meet Integration)

**Purpose**: Enable board members to join virtual meetings with video and audio

## What We Need:

### 1. Join Meeting (Board-Specific)
- One-click join button on meeting page
- System generates secure Jitsi meeting room URL with board identifier (e.g., eboard-mainboard-{meetingId}, eboard-ketepa-{meetingId})
- Users automatically identified by their name from profile
- System verifies user is member of that board before allowing join
- Waiting room for guests (Chairman must admit them)
- Chairman can join any meeting across all 78 boards

### 2. Video and Audio Controls
- Turn camera on/off
- Mute/unmute microphone
- Select which camera/microphone to use (if multiple devices)
- Chairman can mute all participants at once

### 3. Screen Sharing
- Any participant can share their screen (with permission)
- Share entire screen or specific application window
- Only one person can share screen at a time

### 4. Meeting Layout Options
- Grid view - see all participants equally
- Speaker view - active speaker shown large, others small
- Pin specific participant's video

### 5. Chat Functionality
- Public chat visible to all participants
- Private messages between two participants
- Share files in chat (images, small documents)
- Chat history saved with meeting record

### 6. Hand Raising
- Participants can raise hand to request to speak
- Chairman sees queue of raised hands
- Chairman can lower hands and manage speaking order

### 7. Recording
- Chairman or Secretary can start/stop recording
- All participants see notification when recording starts
- Recording includes video, audio, screen shares, and chat
- Recordings stored securely and available after meeting

### 8. Participant Management
- See list of all participants (who's in the meeting)
- **Participants categorized**:
  - Board/Committee Members (voting participants)
  - **Guests/Presenters** (non-voting, marked with "Guest" label)
- See who has camera on/off, mic muted/unmuted
- Chairman can remove disruptive participants
- **Chairman can admit/remove guests**:
  - "Admit Guest: [Name]" button when guest's time slot arrives
  - "Remove Guest: [Name]" button after presentation
  - Auto-remove guest after time slot expires (configurable)
- Lock meeting to prevent new participants from joining

### 9. Network Quality Indicator
- Show connection quality (good, fair, poor)
- Display warning if connection is unstable
