# Module 4: Video Conferencing - User Flows

**Module**: Video Conferencing (Jitsi Meet Integration)  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Join Meeting (Board Member)
2. Configure Audio/Video Settings
3. Share Screen
4. Use In-Meeting Chat
5. Raise Hand to Speak
6. Start/Stop Recording
7. Manage Participants (Host)
8. Change Meeting Layout
9. Lock/Unlock Meeting
10. Handle Connection Issues

---

## Flow 1: Join Meeting (Board Member)

**Actor**: Board/Committee Member  
**Flow**: Meeting Link → Pre-Join Screen → Configure Devices → Join → Participate

### Steps

1. Access meeting via:
   - Click "Join Meeting" from Meeting Details page
   - Click meeting link from email invitation
   - Click meeting from Dashboard calendar
2. System verifies access:
   - Check user is member of the board/committee
   - Check meeting is active or starting soon
3. **Pre-join screen**:
   - Preview camera feed
   - Test microphone (audio level indicator)
   - Select devices (if multiple cameras/mics)
   - Display name (pre-filled from profile)
   - Toggle: Join with camera on/off
   - Toggle: Join with mic muted/unmuted
4. Click "Join Meeting"
5. **If waiting room enabled**:
   - Message: "Please wait. The host will admit you shortly."
   - Host receives notification
6. **Admitted to meeting**:
   - See other participants
   - Meeting controls visible at bottom
   - Participant panel on side
7. Participate in meeting

### Error Flows

- **Not a member**: Show "You are not invited to this meeting"
- **Meeting not started**: Show "Meeting has not started yet. Please wait."
- **Meeting ended**: Show "This meeting has ended"
- **No camera detected**: Show warning, allow audio-only join
- **Browser not supported**: Show "Please use Chrome, Firefox, or Edge"

### Business Rules

- Only board/committee members can join (guests have separate flow)
- Chairman can join any meeting across all 78 boards
- Join button active 15 minutes before scheduled time
- User identity verified from profile (no anonymous join)
- Board identifier included in room URL for security

---

## Flow 2: Configure Audio/Video Settings

**Actor**: Any Participant  
**Flow**: During Meeting → Settings → Select Devices → Apply

### Steps

1. Click "Settings" (gear icon) in meeting controls
2. **Audio settings tab**:
   - Select microphone from dropdown
   - Test microphone (speak and see audio level)
   - Select speaker/output device
   - Test speaker (play test sound)
   - Adjust volume levels
3. **Video settings tab**:
   - Select camera from dropdown
   - Preview camera feed
   - Adjust video quality (Auto/High/Medium/Low)
   - Enable/disable virtual background (if supported)
4. Click "Apply" or close settings
5. Changes take effect immediately

### Error Flows

- **Device not found**: Show "Selected device not available. Please reconnect."
- **Permission denied**: Show "Browser blocked access. Check permissions."

### Business Rules

- Settings persist for session
- Default to last used devices
- Low bandwidth mode available for poor connections
- Virtual backgrounds optional (Jitsi feature)

---

## Flow 3: Share Screen

**Actor**: Any Participant (with permission)  
**Flow**: Click Share → Select Content → Share → Stop Sharing

### Steps

1. Click "Share Screen" button in meeting controls
2. Browser permission dialog appears
3. **Select what to share**:
   - Entire screen
   - Application window (e.g., PowerPoint, Excel)
   - Browser tab
4. Click "Share"
5. **Sharing active**:
   - Your shared content visible to all
   - "You are sharing your screen" indicator
   - Red border around shared content (browser feature)
   - "Stop Sharing" button prominent
6. Present content as needed
7. Click "Stop Sharing" when done
8. Return to normal video view

### Error Flows

- **Permission denied**: Show "Screen sharing permission denied. Check browser settings."
- **Another person sharing**: Show "Someone else is sharing. Wait for them to stop."
- **Share failed**: Show "Screen share failed. Try again."

### Business Rules

- Only one person can share at a time
- Host can stop anyone's screen share
- Guests can only share during their time slot
- Shared content included in recording (if recording)
- Audio sharing optional (for videos with sound)

---

## Flow 4: Use In-Meeting Chat

**Actor**: Any Participant  
**Flow**: Open Chat → Type Message → Send → View History

### Steps

1. Click "Chat" button in meeting controls
2. Chat panel opens on side
3. **Public chat** (default):
   - Type message in input field
   - Press Enter or click Send
   - Message visible to all participants
   - Shows: sender name, timestamp, message
4. **Private message**:
   - Click participant name in chat or participant list
   - Select "Send private message"
   - Type message
   - Only recipient sees message (marked "Private")
5. **Share file in chat**:
   - Click attachment icon
   - Select file (images, small documents < 10MB)
   - File uploaded and shared
6. View chat history (scrollable)
7. Close chat panel when done

### Error Flows

- **File too large**: Show "File must be under 10MB"
- **File type not allowed**: Show "This file type is not supported"

### Business Rules

- Chat history saved with meeting record
- Private messages NOT saved (privacy)
- Guests can chat during their session only
- Host can disable chat for all (if needed)
- Links in chat are clickable

---

## Flow 5: Raise Hand to Speak

**Actor**: Any Participant  
**Flow**: Raise Hand → Wait in Queue → Speak → Lower Hand

### Steps

1. Click "Raise Hand" button in meeting controls
2. Hand icon appears next to your name in participant list
3. **Host/Chairman sees**:
   - Notification: "[Name] raised their hand"
   - Queue of raised hands in order
4. Wait for Chairman to acknowledge
5. Chairman says "Go ahead, [Name]"
6. Unmute and speak
7. When finished:
   - Click "Lower Hand" to lower your own hand
   - Or Chairman clicks to lower your hand
8. Hand icon removed

### Error Flows

- **Hand already raised**: Button shows "Lower Hand" instead

### Business Rules

- Raised hands shown in order (first raised = first in queue)
- Chairman manages speaking order
- Chairman can lower anyone's hand
- Visual and audio notification to host when hand raised
- Polite way to request speaking without interrupting

---

## Flow 6: Start/Stop Recording

**Actor**: Chairman / Board Secretary (Host)  
**Flow**: Start Recording → Notify Participants → Record → Stop → Save

### Steps

1. Click "Record" button in meeting controls
2. **Confirmation dialog**:
   - "Start recording this meeting?"
   - "All participants will be notified"
   - "Recording will include video, audio, and screen shares"
3. Click "Start Recording"
4. **Recording starts**:
   - All participants see: "This meeting is being recorded"
   - Red "REC" indicator visible to all
   - Recording timer shows duration
5. Meeting continues with recording active
6. **To stop recording**:
   - Click "Stop Recording" button
   - Confirm: "Stop recording?"
7. Recording stops
8. **Processing**:
   - Message: "Recording is being processed..."
   - Processing happens in background
9. **Recording available**:
   - Notification: "Recording ready"
   - Available in Meeting Details → Documents

### Error Flows

- **Recording failed to start**: Show "Recording failed. Try again."
- **Storage limit reached**: Show "Cannot record. Storage limit reached."
- **Processing failed**: Show "Recording processing failed. Contact admin."

### Business Rules

- Only host (Chairman/Secretary) can record
- All participants notified when recording starts
- Consent implied by staying in meeting
- Recordings stored securely with meeting
- Guests do NOT have access to recordings
- Recording includes chat (public only)

---

## Flow 7: Manage Participants (Host)

**Actor**: Chairman / Board Secretary (Host)  
**Flow**: Open Participants → View List → Manage → Mute/Remove/Admit

### Steps

1. Click "Participants" button in meeting controls
2. Participant panel shows:
   - **Board Members**: Listed with roles (Chairman, Member, Secretary)
   - **Guests**: Listed with "Guest" badge and time slot
   - Status icons: camera on/off, mic muted/unmuted
   - Connection quality indicator
3. **Admit from waiting room**:
   - See waiting participants at top
   - Click "Admit" next to name
   - Or "Admit All" for multiple
4. **Mute participant**:
   - Click mic icon next to participant
   - Participant notified: "Host muted you"
5. **Mute all**:
   - Click "Mute All" button
   - All participants muted
   - Option: "Allow participants to unmute"
6. **Remove participant**:
   - Click "..." menu next to participant
   - Select "Remove from meeting"
   - Confirm removal
   - Participant disconnected
7. **Make co-host**:
   - Click "..." menu
   - Select "Make co-host"
   - Participant gains host controls

### Error Flows

- **Cannot remove Chairman**: Show "Cannot remove meeting Chairman"
- **Cannot mute host**: Host can only mute themselves

### Business Rules

- Only host can manage participants
- Chairman cannot be removed
- Removed participants go back to waiting room if they try to rejoin
- Co-host has same controls as host
- Guest management follows time slot rules

---

## Flow 8: Change Meeting Layout

**Actor**: Any Participant  
**Flow**: Click Layout → Select View → Apply

### Steps

1. Click "Layout" or "View" button in meeting controls
2. **Select layout option**:
   - **Grid View**: All participants shown equally in grid
   - **Speaker View**: Active speaker large, others in strip
   - **Spotlight**: Pin specific participant as main view
3. Click desired layout
4. View changes immediately
5. **Pin a participant** (in any view):
   - Click on participant's video
   - Select "Pin" or click pin icon
   - That participant stays as main view
6. **Unpin**:
   - Click pinned video
   - Select "Unpin"

### Error Flows

- **Too many participants for grid**: Auto-paginate or switch to speaker view

### Business Rules

- Layout choice is personal (doesn't affect others)
- Speaker view auto-switches to active speaker
- Pinned participant stays even when others speak
- Layout resets when rejoining meeting

---

## Flow 9: Lock/Unlock Meeting

**Actor**: Chairman / Board Secretary (Host)  
**Flow**: Meeting Controls → Lock → Confirm → Meeting Locked

### Steps

1. Click "Security" or "More" in meeting controls
2. Select "Lock Meeting"
3. **Confirmation**:
   - "Lock this meeting?"
   - "No new participants will be able to join"
4. Click "Lock"
5. **Meeting locked**:
   - Lock icon shown in meeting
   - New join attempts blocked
   - Message to blocked users: "This meeting is locked"
6. **To unlock**:
   - Click "Security" → "Unlock Meeting"
   - New participants can join again

### Error Flows

- **Participant trying to join locked meeting**: Show "Meeting is locked. Contact the host."

### Business Rules

- Only host can lock/unlock
- Useful after all expected participants have joined
- Prevents unauthorized access
- Waiting room still works (host can admit manually)
- Lock status visible to all participants

---

## Flow 10: Handle Connection Issues

**Actor**: Any Participant  
**Flow**: Connection Drops → Auto-Reconnect → Manual Reconnect if Needed

### Steps

1. **Connection quality indicator**:
   - Green: Good connection
   - Yellow: Fair connection (may experience lag)
   - Red: Poor connection (audio/video issues likely)
2. **If connection degrades**:
   - Warning: "Your connection is unstable"
   - Auto-reduce video quality
   - Suggestion: "Turn off camera to improve audio"
3. **If connection lost**:
   - Message: "Reconnecting..."
   - Auto-reconnect attempts (3 times)
4. **If auto-reconnect fails**:
   - Message: "Connection lost. Click to rejoin."
   - Click "Rejoin" button
5. **Rejoin meeting**:
   - Skip pre-join screen (use previous settings)
   - Rejoin waiting room or directly (based on settings)
   - Continue participating

### Error Flows

- **Cannot reconnect**: Show "Unable to reconnect. Check your internet connection."
- **Meeting ended while disconnected**: Show "Meeting has ended"

### Business Rules

- Auto-reconnect is seamless if brief disconnection
- Participant marked as "reconnecting" to others
- Chat history preserved on reconnect
- If disconnected > 5 minutes, may need re-admission
- Connection quality logged for troubleshooting

---

## Summary: Meeting Controls Reference

| Control | Who Can Use | Purpose |
|---------|-------------|---------|
| Mute/Unmute | Everyone (self) | Toggle microphone |
| Camera On/Off | Everyone (self) | Toggle video |
| Share Screen | Everyone (configurable) | Present content |
| Chat | Everyone | Text communication |
| Raise Hand | Everyone | Request to speak |
| Participants | Everyone (view), Host (manage) | See/manage attendees |
| Record | Host only | Record meeting |
| Layout | Everyone | Change personal view |
| Lock Meeting | Host only | Prevent new joins |
| End Meeting | Host only | Close for all |
| Settings | Everyone | Configure devices |

---

## Summary: Pages/Components Required

| Component | Technology | Purpose |
|-----------|------------|---------|
| Video Conference | Jitsi Meet (embedded) | Main video interface |
| Pre-Join Screen | Custom React | Device setup before joining |
| Participant Panel | Custom React | List and manage participants |
| Chat Panel | Jitsi Chat / Custom | Text messaging |
| Recording Controls | Jitsi API | Start/stop recording |
| Layout Selector | Jitsi API | Change view mode |
| Connection Indicator | Custom | Show network quality |
| Waiting Room | Jitsi Lobby | Hold participants before admission |

---

## Jitsi Configuration Notes

**Key Jitsi Config Options**:
```javascript
configOverwrite: {
  startWithAudioMuted: true,
  startWithVideoMuted: false,
  enableWelcomePage: false,
  prejoinPageEnabled: true,
  enableLobby: true,           // Waiting room
  disableDeepLinking: true,
  enableClosePage: false,
  disableInviteFunctions: true, // We handle invites
  toolbarButtons: [
    'microphone', 'camera', 'desktop', 
    'chat', 'raisehand', 'participants',
    'tileview', 'settings', 'hangup'
  ],
  // Recording (requires Jibri for server-side)
  fileRecordingsEnabled: true,
  liveStreamingEnabled: false,
}
```

**JWT Token for Secure Rooms**:
- Generate JWT on backend with user info
- Include: userId, displayName, email, avatar, role
- Set room permissions (moderator for host)
- Token expires after meeting duration

