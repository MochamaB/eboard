# Meeting Room Logic and Implementation Plan

**Module**: Meeting Management - Live Meeting Room  
**Version**: 1.0  
**Last Updated**: February 2026

---

## 1. Overview

This document details the implementation plan for the Meeting Room - the live meeting execution environment. The Meeting Room is a unified, adaptive interface that supports physical, virtual, and hybrid meetings with seamless transitions between modes during the meeting.

---

## 2. Core Design Principles

### 2.1 Unified UI Approach

A single Meeting Room page adapts to the current meeting mode rather than having separate pages for physical, virtual, and hybrid meetings.

**Rationale**
- Meetings can change mode dynamically during execution
- Reduces code duplication and maintenance burden
- Provides consistent user experience
- Enables seamless transitions without page reloads

### 2.2 Computed Meeting Mode

Meeting mode is derived from participant states, not statically configured.

**Mode Computation**
- Physical: At least one physical participant, zero virtual participants
- Virtual: Zero physical participants, at least one virtual participant
- Hybrid: At least one physical AND at least one virtual participant

### 2.3 Feature Visibility by Mode

| Feature Category | Physical | Virtual | Hybrid |
|------------------|----------|---------|--------|
| Core Features | Always | Always | Always |
| Virtual Features | Hidden | Visible | Visible |
| Physical Features | Visible | Hidden | Visible |
| Hybrid Features | Hidden | Hidden | Visible |

---

## 3. Dynamic Mode Transition Scenarios

### 3.1 Physical → Hybrid

**Scenario**: Remote participant joins a physical meeting

**Triggers**
- External presenter sent join link
- Board member joins remotely for quorum
- Guest speaker connects for specific agenda item

**System Response**
1. Video conference automatically activates
2. Virtual participant panel appears
3. Screen sharing becomes available
4. Audio bridge controls appear
5. Notification shown to physical attendees

### 3.2 Hybrid → Physical

**Scenario**: All virtual participants leave

**Triggers**
- Virtual presenters complete their items and disconnect
- Technical issues force virtual participants to drop

**System Response**
1. Prompt host: "All virtual participants have left. Stop video conference?"
2. If confirmed, video conference stops
3. Virtual features hide
4. UI simplifies to physical-only view

### 3.3 Physical → Virtual

**Scenario**: Entire meeting goes remote

**Triggers**
- Emergency evacuation of physical location
- Technical failure in boardroom
- Weather or security situation

**System Response**
1. Physical participants join via their devices
2. Physical check-in features hide
3. Full virtual features activate
4. Meeting continues without interruption

### 3.4 Virtual → Hybrid

**Scenario**: Some virtual participants gather physically

**Triggers**
- Participants in same city decide to meet in person
- Subset joins from conference room

**System Response**
1. Physical attendance tracking activates
2. System tracks co-located participants
3. Individual voting still required per person
4. Room display mode becomes available

### 3.5 Ad-Hoc Guest Joins

**Scenario**: External expert needed for specific item

**Triggers**
- Agenda item requires specialist input
- Legal/financial advisor needed for discussion

**System Response**
1. Host sends temporary join link
2. Guest joins with limited permissions (view, present, no vote)
3. Guest automatically removed after their item or manually by host
4. Mode transitions if this creates first virtual participant

---

## 4. Meeting Room State Management

### 4.1 MeetingRoomContext

The MeetingRoomContext manages all live session state.

**Core State**
- Meeting ID and basic info
- Room status (waiting, starting, in_progress, paused, ending, ended)
- Planned mode vs current computed mode
- Start time, elapsed duration

**Participant State**
- Physical participants list with check-in status
- Virtual participants list with connection status
- Pending/invited participants
- Waiting room queue (virtual)

**Agenda State**
- All agenda items
- Current agenda item ID
- Time tracking per item (allocated vs spent)
- Item status (pending, current, discussed, deferred)

**Voting State**
- Active vote (if any)
- Vote history for this meeting
- Current user's vote status

**Document State**
- Currently viewed document
- Casting state (who is casting, to whom)
- Current page and sync status

**Connection State**
- WebSocket connection status
- Reconnection attempts
- Last sync timestamp

### 4.2 Room Status Flow

```
waiting → starting → in_progress ↔ paused → ending → ended
```

**Status Definitions**
- waiting: Before scheduled start time, participants can join
- starting: Host initiating meeting, quorum check
- in_progress: Active meeting execution
- paused: Temporary break (bio break, technical issue)
- ending: Host ending meeting, final confirmations
- ended: Meeting concluded, transitioning to post-meeting

---

## 5. Core Features (Always Visible)

### 5.1 Meeting Header

**Elements**
- Meeting title and type
- Current status indicator
- Elapsed time / scheduled duration
- Quorum status (met/not met with count)
- Connection status indicator
- Mode indicator (physical/virtual/hybrid)

**Actions**
- None (display only)

### 5.2 Agenda Panel

**Elements**
- Ordered list of agenda items
- Current item highlighted
- Status badges (pending, current, discussed, deferred)
- Time allocated vs time spent per item
- Presenter name per item
- Document count per item

**Actions (Chairman only)**
- Navigate to next/previous item
- Mark item as discussed
- Defer item to next meeting
- Skip item

**Actions (All)**
- View item details
- View linked documents

### 5.3 Current Agenda Item Card

**Elements**
- Item number and title
- Presenter name and avatar
- Time tracking (allocated, elapsed, over/under)
- Progress bar
- Linked documents list
- Notes/description

**Actions**
- View documents button
- Next item button (chairman)
- Mark complete button (chairman)

### 5.4 Participant Panel

**Elements**
- Grouped by: Present (physical), Present (virtual), Absent, Guests
- Each participant shows: name, role, avatar, status indicators
- Status indicators: speaking, presenting, hand raised, muted
- Join/leave timestamps

**Actions (Host)**
- Mute participant (virtual)
- Remove participant
- Promote to presenter
- Lower raised hand

**Actions (Self)**
- Raise/lower hand

### 5.5 Quorum Indicator

**Elements**
- Current count vs required count
- Visual progress bar
- Met/not met status with icon
- Breakdown: voting members present, guests

**Behavior**
- Updates in real-time as participants join/leave
- Warning state when quorum lost
- Prevents certain actions (voting) if quorum not met

### 5.6 Document Viewer

**Elements**
- Document display area (PDF rendering)
- Page indicator (current / total)
- Zoom level indicator
- Sync status (synced with presenter / browsing independently)

**Actions (All)**
- Navigate pages (when browsing independently)
- Zoom in/out
- Download document
- Toggle sync with presenter

**Actions (Presenter/Host)**
- Cast document to all participants
- Navigate pages (syncs to all when casting)
- Use pointer/highlight tool
- Stop casting

### 5.7 Voting Panel

**When No Active Vote**
- Hidden or shows "No active vote"

**When Vote Active - Voter View**
- Motion/question text
- Vote options (Yes/No/Abstain or custom)
- Timer countdown (if timed)
- Vote count progress (X of Y have voted)
- Confirmation after voting

**When Vote Active - Host View**
- All voter view elements
- Close vote early button
- Extend time button

**When Vote Closed**
- Results display with breakdown
- Outcome (passed/failed/invalid)
- Resolution number if passed

**Actions**
- Cast vote (eligible voters, once per vote)
- Create vote (chairman)
- Close vote (chairman)

### 5.8 Minutes Panel (Secretary Only)

**Elements**
- Current agenda item context
- Rich text editor for discussion notes
- Action items list with quick-add
- Resolutions list
- Auto-save indicator

**Actions**
- Type/edit notes
- Add action item (assignee, due date, description)
- Add resolution (text, link to vote)
- Save manually

### 5.9 Meeting Controls

**Host Controls**
- Start Meeting button (when waiting)
- Pause/Resume button (when in_progress)
- End Meeting button
- Enable Virtual Access button (physical mode only)

**Participant Controls**
- Raise Hand button
- Personal Notes button
- Leave Meeting button

---

## 6. Virtual Features (When Mode ≠ Physical)

### 6.1 Video Conference Container

**Integration**: Jitsi Meet (embedded via @jitsi/react-sdk)

**Elements**
- Video grid showing participant feeds
- Active speaker highlight
- Screen share display area
- Local preview (self view)

**Configuration**
- Room name derived from meeting ID
- JWT authentication for participants
- Lobby/waiting room enabled
- Recording capability

### 6.2 Audio/Video Controls

**Elements**
- Microphone toggle (mute/unmute)
- Camera toggle (on/off)
- Speaker/audio output selector
- Device settings access

**Actions**
- Toggle own microphone
- Toggle own camera
- Change audio/video devices

### 6.3 Screen Sharing

**Elements**
- Share screen button
- Active share indicator
- Stop sharing button

**Actions**
- Start screen share (select screen/window/tab)
- Stop screen share

### 6.4 Virtual Waiting Room

**Elements**
- List of participants waiting to be admitted
- Participant name and requested role

**Actions (Host)**
- Admit individual participant
- Admit all waiting
- Deny entry (with optional message)

### 6.5 Chat Panel

**Elements**
- Message list with sender and timestamp
- Message input field
- Unread indicator

**Actions**
- Send message
- View message history

### 6.6 Recording Controls (Host Only)

**Elements**
- Record button
- Recording indicator (when active)
- Recording duration

**Actions**
- Start recording
- Stop recording
- Pause recording

### 6.7 Connection Quality Indicator

**Elements**
- Signal strength icon per participant
- Own connection quality
- Bandwidth usage

---

## 7. Physical Features (When Mode ≠ Virtual)

### 7.1 Physical Attendance Check-In

**Elements**
- Check-in button for self
- QR code for quick check-in
- Manual check-in list (secretary)

**Actions**
- Self check-in
- Mark others present (secretary)
- Mark late arrival
- Mark early departure

### 7.2 Room Display Mode

**Purpose**: Optimized view for projection in boardroom

**Elements**
- Simplified, large-text display
- Current agenda item prominent
- Timer clearly visible
- Voting results full-screen when active

**Actions**
- Toggle room display mode
- Select what to display (agenda, document, vote)

### 7.3 QR Code Attendance

**Elements**
- Generated QR code for meeting
- Scan to check-in functionality

**Actions**
- Display QR code
- Refresh QR code

---

## 8. Hybrid Features (When Mode = Hybrid)

### 8.1 Split Participant View

**Elements**
- Physical attendees section
- Virtual attendees section
- Clear visual separation
- Combined quorum count

### 8.2 Bridge Audio Controls

**Purpose**: Manage audio between physical room and virtual participants

**Elements**
- Room microphone status
- Room speaker status
- Echo cancellation indicator

**Actions**
- Mute room microphone
- Adjust room speaker volume

### 8.3 Sync Indicators

**Elements**
- Physical ↔ Virtual sync status
- Latency indicator
- "All participants seeing same content" confirmation

---

## 9. Real-Time Synchronization

### 9.1 WebSocket Events

**Server → Client Events**
- participant_joined: New participant entered
- participant_left: Participant exited
- participant_status_changed: Hand raised, muted, etc.
- agenda_item_changed: Current item updated
- document_cast_started: Presenter started casting
- document_page_changed: Page navigation during cast
- document_cast_stopped: Casting ended
- vote_started: New vote initiated
- vote_cast_received: Vote count updated (anonymous)
- vote_closed: Voting ended, results available
- quorum_changed: Quorum status updated
- meeting_paused: Meeting paused by host
- meeting_resumed: Meeting resumed
- meeting_ended: Meeting concluded

**Client → Server Events**
- join_meeting: Participant joining
- leave_meeting: Participant leaving
- raise_hand: Toggle hand raised
- navigate_agenda: Change current item
- start_document_cast: Begin casting document
- change_document_page: Navigate during cast
- stop_document_cast: End casting
- create_vote: Initiate new vote
- cast_vote: Submit vote choice
- close_vote: End voting
- update_minutes: Save minutes content
- check_in_physical: Physical attendance

### 9.2 Optimistic Updates

For responsiveness, UI updates immediately on user action, then reconciles with server response.

**Optimistic Actions**
- Raise/lower hand
- Cast vote
- Navigate document pages

**Server-Authoritative Actions**
- Start/end meeting
- Create/close vote
- Change agenda item

### 9.3 Reconnection Handling

**On Disconnect**
1. Show connection lost indicator
2. Attempt automatic reconnection (exponential backoff)
3. Queue outgoing events
4. Show reconnecting status

**On Reconnect**
1. Fetch current room state
2. Reconcile with local state
3. Replay queued events
4. Resume normal operation

---

## 10. Permission System (Meeting Room)

### 10.1 Two-Layer Permission Architecture

The Meeting Room uses the same two-layer permission system as the rest of the meeting management module.

**Layer 1: Base Permissions (Existing System)**
- Configured in Admin Panel → Roles & Permissions
- Checked via `hasPermission(code, boardId)` from AuthContext
- Examples: `meetings.control`, `voting.start`, `voting.cast`

**Layer 2: Room Contextual Permissions (useMeetingRoomPermissions)**
- Computed at runtime based on room state
- NOT configurable - these are business logic rules
- Combines base permission with room state checks

### 10.2 Base Permissions Required for Room Actions

| Action | Base Permission Required |
|--------|-------------------------|
| Start/End meeting | `meetings.control` |
| Navigate agenda | `meetings.control` |
| Create vote | `voting.create` |
| Start/Close vote | `voting.start` |
| Cast vote | `voting.cast` |
| Cast document | `meetings.present` |
| Take minutes | `minutes.create` |
| Start recording | `meetings.control` |
| Admit/Remove participants | `meetings.control` |

### 10.3 Room Contextual Permissions

These are computed by combining base permissions with room state:

| Permission | Base Permission | Room State Condition |
|------------|-----------------|---------------------|
| canStartMeeting | `meetings.control` | room.status === 'waiting' AND quorum met |
| canEndMeeting | `meetings.control` | room.status === 'in_progress' AND user is chairman |
| canPauseMeeting | `meetings.control` | room.status === 'in_progress' |
| canNavigateAgenda | `meetings.control` | room.status === 'in_progress' |
| canCreateVote | `voting.create` | room.status === 'in_progress' AND no active vote |
| canCloseVote | `voting.start` | activeVote exists AND activeVote.status === 'open' |
| canCastVote | `voting.cast` | activeVote exists AND user hasn't voted AND user is voting member |
| canCastDocument | `meetings.present` | room.status === 'in_progress' AND (user is presenter OR chairman) |
| canTakeMinutes | `minutes.create` | room.status === 'in_progress' AND user is secretary |
| canAdmitParticipants | `meetings.control` | waitingRoom has participants |
| canRemoveParticipant | `meetings.control` | user is chairman |
| canMuteOthers | `meetings.control` | mode includes virtual AND user is chairman |
| canStartRecording | `meetings.control` | mode includes virtual AND not already recording |
| canRaiseHand | (none) | always allowed for all participants |
| canViewDocuments | `documents.view` | always allowed |
| canLeave | (none) | always allowed |

### 10.4 Role-Based Permission Summary

| Action | Chairman | Secretary | Member | Guest |
|------------|----------|-----------|--------|-------|
| Start meeting | ✓ | ✓ | - | - |
| End meeting | ✓ | - | - | - |
| Pause meeting | ✓ | - | - | - |
| Navigate agenda | ✓ | - | - | - |
| Mark item discussed | ✓ | - | - | - |
| Create vote | ✓ | - | - | - |
| Close vote | ✓ | - | - | - |
| Cast vote | ✓ | ✓ | ✓ | - |
| Cast document | ✓ | ✓ | Presenter | - |
| Take minutes | - | ✓ | - | - |
| Admit participants | ✓ | ✓ | - | - |
| Remove participant | ✓ | - | - | - |
| Mute others | ✓ | - | - | - |
| Start recording | ✓ | ✓ | - | - |
| Raise hand | ✓ | ✓ | ✓ | ✓ |
| View documents | ✓ | ✓ | ✓ | ✓ |
| Leave meeting | ✓ | ✓ | ✓ | ✓ |

### 10.5 Permission Display in Meeting Room UI

**Base Permissions (Layer 1)**
- Configured in: Admin Panel → Roles & Permissions
- If user lacks base permission: Control/button hidden entirely

**Room Contextual Permissions (Layer 2)**
- NOT configurable - business logic rules
- If user has base permission but room state doesn't allow: Button disabled with tooltip
- Example: "Start Vote" disabled with tooltip "A vote is already in progress"

### 10.6 Integration with Existing System

The `useMeetingRoomPermissions` hook uses:
- `useAuth()` for `hasPermission()` and `user`
- `useMeetingRoom()` for room state (activeVote, participants, mode, etc.)
- `useBoardContext()` for boardId

No changes needed to AuthContext or existing permission tables.

---

## 11. Implementation Plan

### Phase 1: Foundation (Weeks 3-4)

**Week 3 Tasks**
1. Create meetingRoom.types.ts with all type definitions
2. Create MeetingRoomContext with basic state structure
3. Create MeetingRoomPage component shell
4. Set up routing (/meetings/:id/room)
5. Create MeetingRoomLayout wrapper

**Week 4 Tasks**
1. Implement room status management
2. Implement mode computation logic
3. Create feature visibility system
4. Add basic meeting controls (start, end, leave)
5. Connect to meeting API for initial data

**Deliverables**
- Meeting room loads and displays basic info
- Can start and end meeting
- Mode computed correctly

### Phase 2: Core Components (Weeks 5-6)

**Week 5 Tasks**
1. Build AgendaPanel component
2. Build CurrentAgendaItemCard component
3. Build ParticipantPanel component
4. Build QuorumIndicator component
5. Implement agenda navigation (chairman)

**Week 6 Tasks**
1. Build MeetingHeader component
2. Build MeetingControls component
3. Implement participant status tracking
4. Add raise hand functionality
5. Style and polish core components

**Deliverables**
- All core panels functional
- Agenda navigation works
- Participant list updates

### Phase 3: Document Viewer (Weeks 7-8)

**Week 7 Tasks**
1. Integrate PDF.js for document rendering
2. Build DocumentViewer component
3. Implement page navigation
4. Implement zoom controls
5. Add document selection from meeting documents

**Week 8 Tasks**
1. Build document casting system
2. Implement presenter controls
3. Implement sync/independent browsing toggle
4. Add pointer/highlight tool (basic)
5. Test document sync across participants

**Deliverables**
- Documents viewable in meeting room
- Casting works between participants
- Sync toggle functional

### Phase 4: Voting System (Weeks 9-10)

**Week 9 Tasks**
1. Build VoteCreationModal component
2. Build VotingPanel component
3. Build VoteResultsCard component
4. Implement vote creation flow
5. Implement vote casting flow

**Week 10 Tasks**
1. Implement vote closing and results
2. Add timer functionality
3. Add anonymous voting support
4. Implement quorum check for voting
5. Link votes to resolutions

**Deliverables**
- Full voting workflow functional
- Results display correctly
- Resolutions created from passed votes

### Phase 5: Real-Time Infrastructure (Weeks 11-12)

**Week 11 Tasks**
1. Create WebSocket service
2. Implement connection management
3. Implement event handlers for all server events
4. Add reconnection logic
5. Create useRealTimeSync hook

**Week 12 Tasks**
1. Implement optimistic updates
2. Add offline queue for events
3. Implement state reconciliation
4. Add connection status UI
5. Test multi-user scenarios

**Deliverables**
- Real-time sync working
- Multiple participants see updates
- Handles disconnection gracefully

### Phase 6: Virtual Meeting Integration (Weeks 13-14)

**Week 13 Tasks**
1. Integrate Jitsi React SDK
2. Build JitsiContainer component
3. Build PreJoinScreen component
4. Implement audio/video controls
5. Configure Jitsi settings

**Week 14 Tasks**
1. Build WaitingRoom component
2. Implement admit/deny functionality
3. Build screen sharing controls
4. Implement recording controls
5. Add chat panel

**Deliverables**
- Video conferencing functional
- Waiting room works
- Recording available

### Phase 7: Minutes Capture (Weeks 15-16)

**Week 15 Tasks**
1. Build MinutesPanel component
2. Integrate rich text editor
3. Implement auto-save
4. Build ActionItemForm component
5. Build ResolutionForm component

**Week 16 Tasks**
1. Implement auto-capture (votes, attendance)
2. Link minutes to agenda items
3. Add export functionality
4. Test minutes workflow end-to-end
5. Polish and bug fixes

**Deliverables**
- Secretary can capture minutes live
- Action items and resolutions recorded
- Auto-capture working

### Phase 8: Polish and Testing (Weeks 17-18)

**Tasks**
1. Cross-browser testing
2. Mobile responsiveness
3. Performance optimization
4. Accessibility audit
5. User acceptance testing
6. Bug fixes and refinements

**Deliverables**
- Production-ready meeting room
- All features tested
- Documentation complete

---

## 12. Technical Dependencies

### Frontend Libraries

| Library | Purpose |
|---------|---------|
| @jitsi/react-sdk | Video conferencing |
| react-pdf / pdfjs-dist | PDF rendering |
| @tiptap/react | Rich text editor for minutes |
| socket.io-client or @microsoft/signalr | WebSocket client |

### Backend Requirements

| Endpoint | Purpose |
|----------|---------|
| POST /meetings/{id}/room/start | Start meeting |
| POST /meetings/{id}/room/end | End meeting |
| GET /meetings/{id}/room/state | Get current room state |
| PUT /meetings/{id}/room/agenda/current | Update current item |
| POST /meetings/{id}/room/votes | Create vote |
| POST /meetings/{id}/room/votes/{vid}/cast | Cast vote |
| POST /meetings/{id}/room/documents/cast | Start document cast |
| POST /meetings/{id}/room/attendance | Update attendance |
| WebSocket /hubs/meeting-room | Real-time connection |

---

## 13. Success Criteria

1. Single unified UI adapts to all meeting modes
2. Mode transitions happen seamlessly without page reload
3. Real-time sync keeps all participants in sync
4. Voting workflow completes end-to-end
5. Document casting works across all participants
6. Virtual meeting integration functional
7. Minutes capture works for secretary
8. Performance acceptable with 20+ participants
9. Handles network issues gracefully

---

## Related Documents

- 0306_MEETING_ARCHITECTURE_OVERVIEW.md - Overall architecture
- 0307_PRE_POST_MEETING_IMPLEMENTATION.md - Pre/post meeting details
- 0305_MEETING_ROOM_IMPLEMENTATION_PLAN.md - Original wireframes and detailed specs
