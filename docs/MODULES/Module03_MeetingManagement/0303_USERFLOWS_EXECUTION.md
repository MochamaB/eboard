# Module 3: Meeting Management - Execution User Flows

**Module**: Meeting Management - Execution Phase (During Meeting)  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Document

1. Start Meeting (Host)
2. Join Meeting (Participant)
3. Manage Participants (Host Controls)
4. Share Screen / Present Documents
5. Record Meeting
6. Conduct Vote During Meeting
7. End Meeting

---

## Flow 1: Start Meeting (Host)

**Actor**: Chairman / Board Secretary  
**Flow**: Meeting Details → Start Meeting → Launch Video → Wait for Participants

### Steps

1. Navigate to Meeting Details page
2. "Start Meeting" button becomes active 15 minutes before scheduled time
3. Click "Start Meeting"
4. System actions:
   - Generate secure Jitsi room URL
   - Meeting status → "In Progress"
   - Notification sent to all participants: "Meeting has started"
5. Video conference launches in new tab/window:
   - Host joins automatically with camera/mic options
   - Waiting room enabled (participants wait for admission)
   - Host controls visible
6. Host sees participant list:
   - Expected participants with join status
   - "Waiting" / "Joined" / "Not Joined"
7. Admit participants from waiting room
8. Meeting in progress

### Error Flows

- **Too early**: Show "Meeting can be started 15 minutes before scheduled time"
- **Jitsi unavailable**: Show error "Video service unavailable. Try again."
- **No camera/mic**: Show warning "No camera detected. Continue with audio only?"

### Business Rules

- Only Chairman or Secretary can start meeting
- Meeting can start up to 15 minutes early
- Late start allowed (no time limit)
- Waiting room enabled by default for security
- Host must admit each participant

---

## Flow 2: Join Meeting (Participant)

**Actor**: Board/Committee Member  
**Flow**: Notification/Dashboard → Join → Enter Waiting Room → Admitted → Participate

### Steps

1. Receive notification: "Meeting has started"
   - Or navigate to Meeting Details page
   - Or click meeting from dashboard
2. Click "Join Meeting" button
3. **Pre-join screen**:
   - Preview camera and microphone
   - Select audio/video devices
   - Enter display name (pre-filled from profile)
   - Toggle camera on/off
   - Toggle microphone on/off
4. Click "Join"
5. Enter waiting room:
   - Message: "Please wait. The host will admit you shortly."
   - See: Meeting title, expected wait
6. Host admits participant
7. Join main meeting room:
   - See other participants
   - View shared screen/documents
   - Access chat
8. Participate in meeting

### Error Flows

- **Meeting not started**: Show "Meeting has not started yet. Please wait."
- **Not a participant**: Show "You are not invited to this meeting"
- **Browser not supported**: Show "Please use Chrome, Firefox, or Edge"
- **Connection failed**: Show "Connection failed. Check your internet and try again."

### Business Rules

- Only invited participants can join
- Participants must wait in waiting room until admitted
- Camera/mic optional (can join with both off)
- Late joining allowed
- Participant can leave and rejoin

---

## Flow 3: Manage Participants (Host Controls)

**Actor**: Chairman / Board Secretary (Host)  
**Flow**: During Meeting → Participant Panel → Manage → Mute/Remove/Promote

### Steps

1. During active meeting, click "Participants" panel
2. View participant list:
   - Name, Role (Chairman, Member, Secretary)
   - Audio status (muted/unmuted)
   - Video status (on/off)
   - Connection quality indicator
3. **Admit from waiting room**:
   - See list of waiting participants
   - Click "Admit" individually or "Admit All"
4. **Mute participant**:
   - Click mute icon next to participant
   - Participant notified: "Host has muted you"
   - Participant can unmute themselves
5. **Mute all**:
   - Click "Mute All" button
   - All participants muted
   - Option: "Allow participants to unmute themselves"
6. **Remove participant**:
   - Click "Remove" next to participant
   - Confirm: "Remove [Name] from meeting?"
   - Participant removed and notified
   - Cannot rejoin unless re-admitted
7. **Promote to co-host**:
   - Click "Make Co-Host"
   - Participant gains host controls
8. **Lower hand**:
   - If participant raised hand, click to lower

### Error Flows

- **Cannot remove Chairman**: Show "Cannot remove meeting Chairman"
- **Last host leaving**: Show "You are the only host. Assign another host before leaving."

### Business Rules

- Only host can manage participants
- Chairman cannot be removed
- Removed participants can request to rejoin (goes to waiting room)
- Co-host has same controls as host
- Mute/unmute actions logged for minutes

---

## Flow 4: Share Screen / Present Documents

**Actor**: Any Participant (with permission) / Guest Presenter  
**Flow**: During Meeting → Share Screen → Select Content → Present

### Steps

1. Click "Share Screen" button in meeting controls
2. Select what to share:
   - Entire screen
   - Application window
   - Browser tab
3. Click "Share"
4. Content visible to all participants
5. **Alternative: Share document from board pack**:
   - Click "Documents" panel
   - Select document from meeting documents
   - Click "Present"
   - Document opens in shared viewer
   - Presenter controls navigation (next/previous page)
   - Participants see same page as presenter
6. To stop sharing:
   - Click "Stop Sharing" button
   - Or close shared window

### Error Flows

- **Permission denied**: Show "Screen sharing permission denied. Check browser settings."
- **No content selected**: Show "Please select a screen or window to share"

### Business Rules

- Any participant can share screen (configurable)
- Guests can only share during their designated time slot
- Only one person can share at a time
- Document sharing tracks which pages were viewed (for minutes)
- Shared content not recorded unless recording is on

---

## Flow 5: Record Meeting

**Actor**: Chairman / Board Secretary (Host)  
**Flow**: During Meeting → Start Recording → Record → Stop → Save

### Steps

1. Click "Record" button in meeting controls
2. Confirmation modal:
   - "Recording will capture audio and video of all participants"
   - "All participants will be notified"
   - "Recording will be saved to meeting documents"
3. Click "Start Recording"
4. System actions:
   - Recording indicator shown to all participants
   - Notification: "This meeting is being recorded"
   - Recording starts
5. During recording:
   - Red "Recording" indicator visible
   - Timer shows recording duration
6. Click "Stop Recording" when done
7. Recording saved:
   - Processing notification: "Recording is being processed..."
   - Once complete: "Recording saved to meeting documents"
8. Recording available in Meeting Documents section

### Error Flows

- **Recording failed**: Show "Recording failed to start. Try again."
- **Storage full**: Show "Storage limit reached. Cannot record."
- **Processing failed**: Show "Recording processing failed. Contact admin."

### Business Rules

- Only host can start/stop recording
- All participants notified when recording starts
- Recording consent implied by staying in meeting
- Recordings stored securely with meeting documents
- Recordings accessible only to board members
- Guests do NOT have access to recordings

---

## Flow 6: Conduct Vote During Meeting

**Actor**: Chairman  
**Flow**: During Meeting → Create Vote → Members Vote → Show Results

### Steps

1. Chairman clicks "Start Vote" button
2. **Quick vote modal**:
   - Enter motion/question
   - Select vote type: Yes/No/Abstain (default) or Custom options
   - Set duration (optional): 2 minutes default
   - Anonymous: Yes/No
3. Click "Start Vote"
4. **Voting interface appears for all members**:
   - Motion displayed
   - Vote buttons (Yes / No / Abstain)
   - Timer countdown (if set)
   - "X of Y members have voted"
5. Members cast votes:
   - Click their choice
   - Confirmation: "Vote recorded"
   - Cannot change vote after submission
6. **Guests cannot vote** (buttons disabled, message shown)
7. Vote closes:
   - Automatically when timer ends, OR
   - Chairman clicks "Close Vote"
8. **Results displayed**:
   - Yes: 8 (53%)
   - No: 5 (33%)
   - Abstain: 2 (13%)
   - Motion: Passed / Failed
9. Results saved to meeting record

### Error Flows

- **Not enough participants**: Show warning "Quorum not met. Vote may not be valid."
- **Vote already in progress**: Show "Please wait for current vote to complete"

### Business Rules

- Only Chairman can initiate votes
- Only board/committee members can vote (not guests)
- Each member gets one vote
- Votes are final (no changing)
- Results recorded in meeting minutes automatically
- Anonymous votes don't show individual choices
- Quorum checked before vote starts

---

## Flow 7: End Meeting

**Actor**: Chairman / Board Secretary (Host)  
**Flow**: During Meeting → End Meeting → Confirm → Close for All

### Steps

1. Click "End Meeting" button
2. Confirmation modal:
   - "End meeting for all participants?"
   - Options:
     - "End for All" - closes meeting for everyone
     - "Leave Meeting" - host leaves, meeting continues
     - "Cancel" - return to meeting
3. Click "End for All"
4. System actions:
   - All participants disconnected
   - Message shown: "Meeting has ended"
   - Meeting status → "Completed"
   - Recording stopped (if active)
   - Attendance automatically recorded
5. **Post-meeting prompt**:
   - "Create meeting minutes now?"
   - Options: "Create Minutes" / "Later"
6. Redirect to Meeting Details page
7. Meeting marked as completed

### Error Flows

- **Recording still processing**: Show "Recording is still processing. End anyway?"

### Business Rules

- Only host can end meeting for all
- Any participant can leave individually
- Attendance tracked: join time, leave time, duration
- Meeting duration recorded
- If host leaves without ending, meeting continues with remaining participants
- Last person leaving auto-ends meeting

---

## Summary: Video Conference Controls

| Control | Who Can Use | Purpose |
|---------|-------------|---------|
| Start Meeting | Chairman, Secretary | Launch video conference |
| Admit Participants | Host | Let people in from waiting room |
| Mute/Unmute | Self (anyone), Others (host only) | Audio control |
| Camera On/Off | Self only | Video control |
| Share Screen | Anyone (configurable) | Present content |
| Record | Host only | Record meeting |
| Start Vote | Chairman only | Conduct voting |
| Remove Participant | Host only | Remove from meeting |
| End Meeting | Host only | Close for all |

---

## Summary: Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Video Conference | Jitsi Meet (embedded) | Video/audio communication |
| Participant Panel | Custom React | Manage participants |
| Screen Share | Jitsi API | Share screen/window |
| Document Presenter | Custom (PDF.js) | Present documents |
| Voting Modal | Ant Design Modal | Quick voting interface |
| Recording Controls | Jitsi API | Start/stop recording |
| Chat Panel | Jitsi Chat | Text communication |

---

## Jitsi Integration Notes

**Embedding Jitsi**:
```jsx
import { JitsiMeeting } from '@jitsi/react-sdk';

<JitsiMeeting
  domain="meet.jit.si"  // or self-hosted domain
  roomName={meetingRoomId}
  configOverwrite={{
    startWithAudioMuted: true,
    startWithVideoMuted: false,
    enableWelcomePage: false,
    prejoinPageEnabled: true,
    enableLobby: true,  // waiting room
  }}
  interfaceConfigOverwrite={{
    TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'chat', 'raisehand', 'participants', 'recording'],
  }}
  userInfo={{
    displayName: user.fullName,
    email: user.email,
  }}
  onApiReady={(api) => {
    // Store API reference for controls
    jitsiApiRef.current = api;
  }}
/>
```

**JWT Authentication** (for private rooms):
- Generate JWT token on backend
- Include user info and room permissions
- Pass to Jitsi for secure room access

