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

## 11. Prototype Scope

This implementation plan targets a **frontend prototype** — no backend API or real-time infrastructure. All state is managed locally via React Context with mock data from the existing MSW mock tables (see MOCK_DATA_PLAN.md). The goal is to simulate the full meeting room experience end-to-end using MTG-006 (in_progress) as the primary test meeting.

### What Is Simulated (Local State)

- Meeting lifecycle (waiting → starting → in_progress ↔ paused → ending → ended)
- Agenda navigation and item status tracking
- Participant join/leave and attendance status
- Voting creation, casting, and results
- Document casting state (presenter controls, page navigation)
- Mode computation and transitions (physical ↔ virtual ↔ hybrid)
- Minutes note-taking (secretary only)
- Recording state toggle

### What Uses Placeholder UI (Deferred to Production)

- Video conferencing (Jitsi) — styled placeholder, appears when mode ≠ physical
- PDF document rendering (PDF.js) — document preview card with page controls, no actual PDF
- Real-time sync (SignalR/WebSocket) — connection indicator shows "connected" statically
- Chat panel — deferred entirely

### What Is Skipped Entirely

- Backend API endpoints (all actions use local state mutations with simulated delays)
- WebSocket service and real-time multi-user sync
- Optimistic updates / offline queue / state reconciliation
- JWT authentication for meeting rooms
- Screen sharing via browser API

---

## 12. Current Implementation Status

### Phase 1 (Foundation) — ✅ Complete

| Component | File | Status |
|-----------|------|--------|
| `meetingRoom.types.ts` | `src/types/meetingRoom.types.ts` | ✅ 331 lines, all types defined |
| `MeetingRoomContext` | `src/contexts/MeetingRoomContext.tsx` | ✅ 724 lines, 27 actions, full state |
| `MeetingRoomPage` | `src/pages/Meetings/room/MeetingRoomPage.tsx` | ✅ Entry point with access guards |
| Routing (`/meetings/:id/room`) | App router | ✅ Working |
| `MeetingRoomLayout` | `src/pages/Meetings/room/MeetingRoomLayout.tsx` | ✅ Main + side panel + icon strip |
| Room status management | `MeetingRoomContext` | ✅ `waiting→starting→in_progress↔paused→ending→ended` |
| Mode computation | `MeetingRoomContext` | ✅ Derived from participant `connectionStatus` |
| `useMeetingRoomPermissions` | `src/hooks/meetings/useMeetingRoomPermissions.ts` | ⚠️ Stub — accepts optional `RoomState`, not wired to actual context |

### Phase 2 (Core Components) — ⚠️ Partially Complete

| Component | File | Status |
|-----------|------|--------|
| `MeetingRoomHeader` | `room/components/MeetingRoomHeader.tsx` | ✅ Title, status, timer, quorum, mode, connection |
| `SidePanelAgenda` | `room/components/SidePanelAgenda.tsx` | ✅ Clickable items, prev/next, mark discussed, defer |
| `CurrentItemDisplay` | Inside `MainContentArea.tsx` | ✅ Shows current agenda item or cast document |
| `SidePanelParticipants` | `room/components/SidePanelParticipants.tsx` | ✅ Grouped by in-room/remote/waiting/guests, host controls |
| `SidePanelNotice` | `room/components/SidePanelNotice.tsx` | ✅ Meeting info, quorum detail, connection status |
| `SidePanelDocuments` | `room/components/SidePanelDocuments.tsx` | ⚠️ Uses hardcoded placeholder data, not wired to mock |
| `ActiveVotePanel` | Inside `MainContentArea.tsx` | ✅ Vote display, For/Against/Abstain buttons, progress |
| `ParticipantFunctions` | Inside `MainContentArea.tsx` | ⚠️ Basic buttons only — raise hand, notes, follow presenter |
| **`MeetingControlsBar`** | — | ❌ **MISSING** — No UI to start/pause/resume/end/leave |
| **`VoteCreationModal`** | — | ❌ **MISSING** — No way to create a vote from room UI |
| **`ParticipantStrip`** | — | ❌ **MISSING** — No Zoom-like avatar row in main area |
| Feature visibility by mode | — | ❌ **MISSING** — No conditional show/hide by physical/virtual/hybrid |
| Side panel: Voting tab | — | ❌ **MISSING** — Only 4 tabs (notice, agenda, participants, documents) |
| Side panel: Minutes tab | — | ❌ **MISSING** — Secretary minutes panel not built |
| Mock data seeding | `MeetingRoomContext` | ❌ **MISSING** — Agenda items and documents not loaded from mock data |

### Reusable Components from Detail Page

| Detail Component | Reuse in Room | Adaptation |
|-----------------|---------------|------------|
| `VotesView` (`components/Voting`) | **High** — vote list + results | Use in `execute` mode inside new `SidePanelVoting` |
| `MinutesEditor` (`components/common/Minutes`) | **High** — rich text editor | Wrap in compact `SidePanelMinutes` for side panel |
| `MeetingStatusBadge` | **Direct reuse** | Already used |
| `AgendaView` (`pages/Meetings/agenda`) | **Low** — room has own `SidePanelAgenda` | Room's simplified version is better for live context |
| `MeetingNoticeDocument` | **Medium** — formal notice rendering | Could embed in `SidePanelNotice` |

---

## 13. Implementation Plan (Prototype)

### Cross-Cutting: Responsive Design Guidelines

All meeting room components MUST follow the responsive design approach established in `RESPONSIVE_APPROACH_COMPARISON.md`. These rules apply across **every phase**:

1. **Use `useResponsive()` from `ResponsiveContext`** — never create new `ResizeObserver` instances. One observer for the entire app.
2. **Prefer CSS/Tailwind for styling** — use `className="p-4 md:p-6"` instead of `style={{ padding: isMobile ? 16 : 24 }}`.
3. **Use JS (`useResponsive`) only for** conditional rendering (show/hide components) and different component logic per breakpoint.
4. **Use Ant Design responsive Grid** — `<Row gutter={{ xs: 8, sm: 16, md: 24 }}>` and `<Col xs={24} md={12}>`.
5. **Memoize layout components** — wrap with `React.memo` to prevent unnecessary re-renders from context changes.
6. **Breakpoints** (Ant Design standard): xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600.

**Meeting Room Responsive Considerations:**

| Component | Desktop (lg+) | Tablet (md) | Mobile (< md) |
|-----------|--------------|-------------|----------------|
| `MeetingRoomLayout` | Main + side panel side-by-side | Main + collapsed side panel | Full-width main, side panel as bottom sheet/overlay |
| `MeetingRoomHeader` | Full info row (title, status, timer, quorum, mode, connection) | Compact row, quorum collapses to icon | Stacked: title row + status row |
| `MeetingControlsBar` | All buttons visible with labels | Icons + labels | Icons only, overflow menu for secondary actions |
| `ParticipantStrip` | Up to 15 avatars visible | Up to 8 avatars + "+N" overflow | Up to 5 avatars + "+N" overflow |
| `SidePanel` content | 420px fixed width | 360px width | Full-width overlay/drawer |
| `VoteCreationModal` | Centered modal (480px) | Centered modal (90% width) | Full-screen drawer |
| `MainContentArea` | Flexible with side panel | Full width when panel collapsed | Full width, stacked layout |

---

### Phase 1: Data Wiring & Remaining Foundation

**Goal**: Make existing components work with real mock data and complete the foundation gaps.

**Tasks**

1. **Seed agenda items from mock data**
   - In `MeetingRoomContext` initialization, fetch MTG-006 agenda items using existing `useAgenda` hook or direct mock table import
   - Set first agenda item as current when meeting starts
   - Agenda panel should display all 8 items from MTG-006

2. **Wire documents from mock data**
   - Replace hardcoded documents in `SidePanelDocuments` with meeting documents fetched via existing `useMeetingDocuments` hook
   - Group by "current item documents" vs "all meeting documents"

3. **Wire `useMeetingRoomPermissions` to actual context**
   - Remove optional `RoomState` parameter from `useMeetingRoomPermissions`
   - Have hook read directly from `useMeetingRoom()` context
   - All room components already call this hook — wiring it means permissions become live

4. **Implement feature visibility system**
   - Create `useModeVisibility` hook or utility that returns `{ showVirtualFeatures, showPhysicalFeatures, showHybridFeatures }` based on computed mode
   - Components use these flags to conditionally render mode-specific sections

**Deliverables**
- Agenda panel shows 8 real items from MTG-006
- Documents panel shows real meeting documents
- Permissions respond to actual room state changes
- Mode-aware feature visibility working

---

### Phase 2: Missing Core Components

**Goal**: Build the critical missing UI components that enable the meeting flow.

**Tasks**

1. **Build `MeetingControlsBar` component**
   - Sticky bar at the bottom of the main content area (or top, below header)
   - Status-aware buttons:
     - `waiting` state: "Start Meeting" button (enabled when quorum met, disabled otherwise with tooltip)
     - `in_progress` state: "Pause" + "End Meeting" + "Leave" buttons
     - `paused` state: "Resume" + "End Meeting" + "Leave" buttons
     - `ending`/`ended` state: Disabled/hidden
   - Permission-gated: Start/Pause/End require `canStartMeeting`/`canPauseMeeting`/`canEndMeeting`
   - Leave is always available
   - Additional host controls: "Create Vote" button (opens modal), "Enable Virtual" toggle

2. **Build `VoteCreationModal` component**
   - Ant Design Modal with form fields:
     - Motion/question text (required, textarea)
     - Vote type: Yes/No/Abstain (default) or custom options
     - Duration: number input with "minutes" suffix (default 2)
     - Anonymous toggle (switch)
   - On submit: calls `actions.createVote()` then `actions.startVote()`
   - Quorum check before allowing creation
   - Only visible when `permissions.canCreateVote` is true

3. **Build `ParticipantStrip` component**
   - Horizontal scrollable strip at the bottom of `MainContentArea`
   - Shows circular avatar for each joined participant
   - Visual indicators overlaid on avatar:
     - Green ring: speaking
     - Hand emoji badge: raised hand
     - Mic-off icon: muted
     - Small "remote" icon: virtual participant
   - Clicking avatar could show participant info tooltip
   - Gives the meeting room a "Zoom-like" feel without actual video

4. **Enhance `ActiveVotePanel` with countdown timer**
   - Add `useEffect` interval that decrements `timeRemaining` every second
   - Show visual countdown (progress bar or digital timer)
   - Auto-close vote when timer reaches 0

5. **Extend side panel with Voting and Minutes tabs**
   - Update `SidePanelTab` type: add `'voting'` and `'minutes'`
   - Add two new icon strip buttons (trophy/gavel icon for voting, pen icon for minutes)
   - `SidePanelVoting`: wraps existing `VotesView` component in `execute` mode
   - `SidePanelMinutes`: wraps existing `MinutesEditor` in compact form (secretary-only)

**Deliverables**
- Can start, pause, resume, end meeting from the UI
- Can create and run votes from the room
- Participant avatars visible in main content area
- Vote timer counts down
- 6 side panel tabs: Notice, Agenda, Participants, Documents, Voting, Minutes

---

### Phase 3: Document & Virtual Placeholders

**Goal**: Add mode-aware placeholders for features that need external libraries in production.

**Tasks**

1. **Build `DocumentPreview` placeholder component**
   - Replaces current simple icon+text in `CurrentItemDisplay`
   - Styled card showing:
     - Document name and type icon
     - "Page X of Y" indicator with prev/next buttons (calls `actions.navigatePage`)
     - Presenter name and "Casting to all" indicator
     - Large centered area with document icon and "PDF Viewer — Integration Pending" text
     - "Stop Casting" button for presenter
   - Uses `castingDocument` state from context

2. **Build `VirtualConferencePlaceholder` component**
   - Only visible when `showVirtualFeatures` is true (mode ≠ physical)
   - Styled container in `MainContentArea` showing:
     - Grid of participant avatar cards (simulating video tiles)
     - "Video Conference — Jitsi Integration Pending" overlay text
     - Audio/Video/ScreenShare toggle buttons at bottom of placeholder
     - These toggles call existing context actions (`toggleMute`, `toggleVideo`, `startScreenShare`)
   - Fades in/out with mode transitions

3. **Build `PhysicalAttendancePlaceholder` component**
   - Only visible when `showPhysicalFeatures` is true (mode ≠ virtual)
   - Shows:
     - "Physical Check-In" card with QR code placeholder
     - Manual check-in button for secretary
     - Check-in count indicator

4. **Mode-aware layout in `MainContentArea`**
   - Reorganize `MainContentArea` to conditionally render:
     - Virtual conference placeholder (when mode includes virtual)
     - Physical attendance card (when mode includes physical)
     - Current item display (always)
     - Participant strip (always)
     - Active vote panel (when vote exists)
     - Meeting controls bar (always, at bottom)

**Deliverables**
- Document casting shows styled preview with page controls
- Virtual placeholder appears/disappears based on mode
- Physical features appear/disappear based on mode
- Mode transitions visually change the room layout

---

### Phase 4: Minutes Panel & Component Integration

**Goal**: Add live minutes capture and integrate reusable components from the detail page.

**Tasks**

1. **Build `SidePanelMinutes` component**
   - Compact wrapper around existing `MinutesEditor`
   - Only visible to users with `canTakeMinutes` permission (secretary)
   - Shows current agenda item context at top
   - Rich text editor area for discussion notes
   - Quick-add buttons for:
     - Action item (assignee, due date, description — simple inline form)
     - Resolution (text, link to vote)
   - Auto-save indicator

2. **Build `SidePanelVoting` component**
   - Wraps existing `VotesView` in `execute` mode
   - Shows vote history for current meeting
   - Active vote highlighted at top
   - "Create Vote" button at top (opens `VoteCreationModal`)
   - Vote results display for closed votes

3. **Integrate `MeetingNoticeDocument` into `SidePanelNotice`**
   - Optionally embed the formal meeting notice rendering below the current notice info
   - Or add a "View Full Notice" button that expands the notice

**Deliverables**
- Secretary can take notes during meeting via side panel
- Vote history visible in side panel
- All 6 side panel tabs populated with content

---

### Phase 5: Demo Flow & Polish

**Goal**: Ensure the complete meeting flow works end-to-end and feels polished.

**Tasks**

1. **End-to-end flow verification**
   - Walk through: Enter room (waiting) → Start meeting → Navigate agenda items → Cast document → Create vote → Members vote → Close vote → End meeting
   - Verify all state transitions, button states, and permission gates work correctly
   - Verify timer ticks, quorum updates, and vote countdown work

2. **Mode transition demonstration**
   - Build a small `DemoToolbar` (dev-only, toggleable) that allows:
     - Toggle individual participants between `in_room` ↔ `connected` connection status
     - Observe mode badge in header changing dynamically
     - Observe virtual/physical features appearing/disappearing
   - This demonstrates the computed mode architecture

3. **Styling and consistency**
   - Apply board theme colors consistently across all room components
   - Ensure side panel transitions are smooth
   - Ensure meeting controls bar matches the overall design language
   - Status-appropriate colors (green for active, orange for paused, etc.)

4. **Error and edge case handling**
   - "No quorum" warning when trying to start meeting
   - "Vote already in progress" message when trying to create second vote
   - Confirmation modals for destructive actions (end meeting, remove participant)
   - Empty states for all panels when no data

5. **Room entry and exit experience**
   - Smooth loading state when entering room
   - Post-meeting redirect to meeting detail page after ending
   - "Meeting has ended" result screen

6. **Responsive verification**
   - Test all room components at desktop (1280px+), tablet (768px), and mobile (375px) widths
   - Verify `MeetingRoomLayout` side panel behavior: side-by-side on desktop, collapsed on tablet, overlay/drawer on mobile
   - Verify `MeetingControlsBar` adapts: full labels → icons + labels → icons only with overflow
   - Verify `MeetingRoomHeader` collapses gracefully on smaller screens
   - Verify `ParticipantStrip` truncates with "+N" indicator
   - Verify all components use `useResponsive()` from context, not custom observers
   - Verify CSS/Tailwind used for spacing/sizing, JS only for conditional rendering

**Deliverables**
- Complete demo flow working seamlessly
- Mode transitions demonstrable
- Polished, consistent UI
- Proper error handling and edge cases
- Responsive behavior verified at 3 breakpoints (desktop, tablet, mobile)

---

## 14. Technical Dependencies

### Frontend Libraries (Prototype)

| Library | Purpose | Status |
|---------|---------|--------|
| antd | UI component library | ✅ Already installed |
| @ant-design/icons | Icon library | ✅ Already installed |
| react-router-dom | Routing | ✅ Already installed |
| @tiptap/react | Rich text editor (minutes panel) | ✅ Already installed (used in detail page) |

### Libraries Deferred to Production

| Library | Purpose | When Needed |
|---------|---------|-------------|
| @jitsi/react-sdk | Video conferencing | Production Phase 6 |
| react-pdf / pdfjs-dist | PDF document rendering | Production Phase 3 |
| @microsoft/signalr | Real-time WebSocket client | Production Phase 5 |

### Mock Data Sources (Prototype)

| Data | Mock Source | Used By |
|------|-----------|---------|
| Meeting (MTG-006) | `mocks/db/tables/meetings.ts` | `MeetingRoomContext` initialization |
| Participants (15) | `mocks/db/tables/meetingParticipants.ts` | Participant panel, quorum, mode computation |
| Agenda Items (8) | Fetched via `useAgenda` hook / MSW handlers | Agenda panel, current item display |
| Documents (5+) | Fetched via `useMeetingDocuments` hook / MSW handlers | Documents panel, casting |
| Votes (3) | Fetched via `useMeetingVotes` hook / MSW handlers | Voting panel, active vote |
| Minutes | Fetched via `useMinutesByMeeting` hook / MSW handlers | Minutes panel |

### Backend API Endpoints (Deferred to Production)

| Endpoint | Purpose | Prototype Alternative |
|----------|---------|----------------------|
| POST /meetings/{id}/room/start | Start meeting | Local state: `setStatus('in_progress')` |
| POST /meetings/{id}/room/end | End meeting | Local state: `setStatus('ended')` |
| GET /meetings/{id}/room/state | Get room state | Built from MeetingPhaseContext + mock data |
| PUT /meetings/{id}/room/agenda/current | Navigate agenda | Local state: `setCurrentAgendaItemId()` |
| POST /meetings/{id}/room/votes | Create vote | Local state: `setActiveVote()` |
| POST /meetings/{id}/room/votes/{vid}/cast | Cast vote | Local state: update vote counts |
| POST /meetings/{id}/room/documents/cast | Cast document | Local state: `setCastingDocument()` |
| POST /meetings/{id}/room/attendance | Attendance | Local state: update participant status |
| WebSocket /hubs/meeting-room | Real-time sync | Not needed — single-user prototype |

---

## 15. Success Criteria (Prototype)

1. Single unified UI adapts to all meeting modes (physical, virtual, hybrid)
2. Mode transitions happen seamlessly when participant connection status changes
3. Complete meeting flow works end-to-end: waiting → start → agenda → vote → end
4. Voting workflow completes: create → cast → close → view results
5. Document casting UI shows presenter controls with page navigation
6. Virtual conference placeholder appears/disappears based on mode
7. Physical attendance features appear/disappears based on mode
8. Minutes capture panel available for secretary role
9. All actions gated by two-layer permission system
10. Mock data from MTG-006 populates all panels correctly
11. Meeting controls bar provides clear, status-aware host/participant actions

### Production Success Criteria (Deferred)

These criteria from the original plan will be validated when backend integration is complete:

- Real-time sync keeps all participants in sync (SignalR)
- Video conferencing functional (Jitsi)
- PDF documents render in viewer (PDF.js)
- Performance acceptable with 20+ concurrent participants
- Handles network disconnection and reconnection gracefully
- Recording start/stop functional

---

## 16. File Structure (Target)

```
src/pages/Meetings/room/
├── MeetingRoomPage.tsx              # Entry point, data loading, access guard
├── MeetingRoomLayout.tsx            # Main + side panel layout
├── components/
│   ├── index.ts                     # Barrel exports
│   ├── MeetingRoomHeader.tsx        # ✅ Title, status, timer, quorum, mode
│   ├── MainContentArea.tsx          # ✅ Orchestrates main content (needs update)
│   ├── MeetingControlsBar.tsx       # 🆕 Start/Pause/Resume/End/Leave + Create Vote
│   ├── ParticipantStrip.tsx         # 🆕 Horizontal avatar row (Zoom-like)
│   ├── VoteCreationModal.tsx        # 🆕 Form to create a vote
│   ├── DocumentPreview.tsx          # 🆕 Styled document casting placeholder
│   ├── VirtualConferencePlaceholder.tsx  # 🆕 Video conference placeholder
│   ├── PhysicalAttendancePlaceholder.tsx # 🆕 Check-in placeholder
│   ├── CurrentItemDisplay.tsx       # Extract from MainContentArea
│   ├── ActiveVotePanel.tsx          # Extract from MainContentArea (+ timer)
│   ├── ParticipantFunctions.tsx     # Extract from MainContentArea
│   ├── DemoToolbar.tsx              # 🆕 Dev-only mode transition demo
│   ├── SidePanelNotice.tsx          # ✅ Meeting info, quorum, connection
│   ├── SidePanelAgenda.tsx          # ✅ Agenda list with navigation
│   ├── SidePanelParticipants.tsx    # ✅ Participant groups with controls
│   ├── SidePanelDocuments.tsx       # ✅ Document list (needs mock data wiring)
│   ├── SidePanelVoting.tsx          # 🆕 Wraps VotesView in execute mode
│   └── SidePanelMinutes.tsx         # 🆕 Wraps MinutesEditor (secretary only)
```

---

## Related Documents

- 0306_MEETING_ARCHITECTURE_OVERVIEW.md - Overall architecture
- 0307_PRE_POST_MEETING_IMPLEMENTATION.md - Pre/post meeting details
- 0305_MEETING_ROOM_IMPLEMENTATION_PLAN.md - Original wireframes and detailed specs
- MOCK_DATA_PLAN.md - Mock data strategy (MTG-006 is primary test meeting)
