# Meeting Room State Specification

## Overview

This document defines the complete state matrix for the Meeting Room — what every sub-system
looks like at each `RoomStatus`, how transitions happen, and how mock simulation works.

The MeetingRoomContext is the single source of truth for all room components.
Getting the state management right means components built on top work correctly from day one.

---

## 1. Room Status Lifecycle

```
┌───────────┐     ┌──────────┐     ┌──────────────┐
│  waiting   │────>│ starting │────>│ in_progress   │──┐
│  (lobby)   │     └──────────┘     └──────┬───────┘  │
└───────────┘                              │     ▲     │
                                     pause │     │     │ end
                                           ▼     │     │
                                      ┌─────────┐│     │
                                      │ paused   │┘     │
                                      └─────────┘      │
                                           resume      │
                                                        │
                                    ┌────────┐   ┌──────▼──┐
                                    │ ending │──>│  ended   │
                                    └────────┘   └─────────┘
```

### Status Definitions

| Status | Description | Duration | Entry |
|--------|-------------|----------|-------|
| `waiting` | Lobby/pre-start. Participants arriving, quorum building. | Until host starts | Room opens for `scheduled.approved` meeting |
| `starting` | Transitional. System initializing session. | ~500ms-2s | Host clicks "Start Meeting" |
| `in_progress` | Active meeting. All features available. | Minutes to hours | After `starting` completes |
| `paused` | Temporarily halted. Timer stops, most actions frozen. | Until resumed or ended | Host clicks "Pause" |
| `ending` | Transitional. System finalizing session. | ~500ms-2s | Host clicks "End Meeting" |
| `ended` | Terminal. Meeting concluded. Read-only summary. | Permanent | After `ending` completes |

### Allowed Transitions

```
waiting    → starting    (host action, requires quorum)
starting   → in_progress (automatic after init)
starting   → waiting     (rollback on error)
in_progress → paused     (host action)
in_progress → ending     (host action)
paused     → in_progress (host resumes)
paused     → ending      (host ends from paused)
ending     → ended       (automatic after cleanup)
ending     → in_progress (rollback on error)
```

---

## 2. Sub-System State Matrix

### 2.1 Participants

| Status | Attendance Init | Quorum | Arrival | Actions |
|--------|----------------|--------|---------|---------|
| `waiting` | Physical: `joined` (auto-arrive). Virtual: `waiting` (lobby). | Building — shown as "X/Y" | Physical: auto-mark on room entry. Virtual: waiting room queue. | Secretary can mark arrivals. Host admits from waiting room. |
| `starting` | Transitioning remaining `expected`/`waiting` → `joined` | Must be met (validated) | Frozen during transition | None |
| `in_progress` | Most `joined`. Late joiners possible. | Monitored — warn if drops below threshold | Late arrivals auto-join or go to waiting room | Raise hand, mute/unmute, video, screen share |
| `paused` | Stay `joined`. No status changes. | Still monitored | No new arrivals processed | None (frozen) |
| `ending` | Transitioning all → `left` | N/A | Blocked | None |
| `ended` | All `left` | N/A | N/A | None |

**Participant Attendance Flow:**
```
expected → waiting → joined → left
expected → joined → left        (physical auto-join)
expected → joined → removed     (kicked by host)
```

**Mock Simulation for Physical Meetings:**
- When room opens for a physical meeting, participants with `rsvpStatus: 'accepted'`
  are auto-set to `joined` (they walked into the room).
- This immediately builds quorum so the "Start Meeting" button enables.

**Mock Simulation for Virtual Meetings:**
- Participants with `rsvpStatus: 'accepted'` are set to `waiting` (in lobby).
- Host must "Admit All" or admit individually → transitions to `joined`.
- A timer can simulate gradual arrival (every 2-3 seconds, one more joins).

### 2.2 Agenda

| Status | State | Current Item | Navigation | Item Actions |
|--------|-------|-------------|------------|-------------|
| `waiting` | Loaded from API, all items `pending` | None (no current item) | View-only (browse list) | None |
| `starting` | Setting first item as current | Transitioning to first item | Disabled | None |
| `in_progress` | Active — tracking progress | Highlighted in side panel | Next/Previous/Jump enabled | Mark Discussed, Defer, Skip |
| `paused` | Frozen on current item | Stays highlighted | Disabled | Disabled |
| `ending` | Frozen | Last item stays | Disabled | Auto-mark remaining as deferred |
| `ended` | Finalized — all items have terminal status | None | View-only (review) | None |

**Agenda Item Statuses:**
- `pending` → not yet reached
- `in_progress` → currently being discussed
- `completed` → discussed and concluded
- `skipped` → deferred to another meeting
- `deferred` → postponed

### 2.3 Voting

| Status | Create Vote | Start Vote | Cast Vote | Close Vote | Active Vote Timer |
|--------|-------------|------------|-----------|------------|-------------------|
| `waiting` | Disabled | Disabled | Disabled | Disabled | N/A |
| `starting` | Disabled | Disabled | Disabled | Disabled | N/A |
| `in_progress` | Enabled (host/secretary) | Enabled (host) | Enabled (voting members) | Enabled (host, or auto on timer) | Running ⏱ |
| `paused` | Disabled | Disabled | Disabled | Disabled | **Paused** (freeze countdown) |
| `ending` | Disabled | Disabled | Disabled | **Force-close** any open vote | Stopped |
| `ended` | Disabled | Disabled | Disabled | Disabled | N/A — results shown |

**Vote Lifecycle within Room:**
```
[Create] → pending → [Start] → open (timer running) → [Close/Timer expires] → closed
```

**On Pause:** If a vote is `open`, the countdown timer freezes. When resumed, timer continues
from where it stopped. No new votes can be cast while paused.

**On End:** Any `open` vote is force-closed with current results.

### 2.4 Documents / Casting

| Status | Browse | Cast to All | Navigate Pages | Stop Casting |
|--------|--------|-------------|----------------|-------------|
| `waiting` | View document list | Disabled | N/A | N/A |
| `starting` | Disabled | Disabled | N/A | N/A |
| `in_progress` | Full access | Enabled (presenter/host) | Enabled (caster only) | Enabled (caster/host) |
| `paused` | View only | Disabled (no new casts) | **Continues** (presenter may keep doc up) | Enabled |
| `ending` | Disabled | **Auto-stop** all casting | Disabled | N/A |
| `ended` | View/download only | Disabled | N/A | N/A |

### 2.5 Connection State

| Status | Connection | Heartbeat | Sync |
|--------|-----------|-----------|------|
| `waiting` | Connected to room service | Active (30s interval) | Initial sync on join |
| `starting` | Connected | Active | Syncing participant states |
| `in_progress` | Active | Active (15s interval) | Real-time sync |
| `paused` | Active (keep-alive) | Active (30s interval) | Reduced sync |
| `ending` | Graceful disconnect starting | Final heartbeat | Final state sync |
| `ended` | Disconnected | Stopped | N/A |

### 2.6 Recording

| Status | Available | State |
|--------|-----------|-------|
| `waiting` | No | N/A |
| `starting` | No | N/A |
| `in_progress` | Yes — Start/Stop | Running or stopped |
| `paused` | No new actions | **Auto-paused** |
| `ending` | No | **Auto-stopped** |
| `ended` | No | Stopped — recording saved |

### 2.7 UI Controls (MeetingControlsBar)

| Status | Primary Action | Secondary Actions | Leave |
|--------|---------------|-------------------|-------|
| `waiting` | **Start Meeting** (enabled if quorum met, host only) | None | Leave (anyone) |
| `starting` | Spinner — "Starting..." | None | Disabled |
| `in_progress` | **Create Vote** | Pause, End Meeting | Leave |
| `paused` | **Resume** | End Meeting | Leave |
| `ending` | Spinner — "Ending..." | None | Disabled |
| `ended` | "Meeting Ended" (info) | View Summary, Back to Detail | Auto-redirect |

### 2.8 Quorum

| Status | Tracking | Display | Impact |
|--------|----------|---------|--------|
| `waiting` | Active — count as participants arrive | "X/Y required — Quorum met/not met" | Blocks Start Meeting if not met |
| `starting` | Validated — must be met to proceed | Brief validation message | Fails start if lost during transition |
| `in_progress` | Monitored — warn if drops | Warning banner if quorum lost | Warning only (meeting continues) |
| `paused` | Monitored | Same as in_progress | Warning only |
| `ending` | N/A | N/A | N/A |
| `ended` | N/A | Final attendance count shown | N/A |

---

## 3. Initialization by Meeting Status

When the MeetingRoomContext loads, it must seed state based on the meeting's current
`status` + `subStatus` from the database.

### 3.1 `scheduled.approved` → Room Status: `waiting`

```
Room Status:     waiting
Participants:    Physical → auto-joined (rsvpStatus=accepted → attendanceStatus=joined)
                 Virtual  → waiting (lobby)
Agenda:          Loaded, all items 'pending', no current item
Active Vote:     null
Casting:         null
Recording:       false
Connection:      connected
Quorum:          Computed from joined participants
```

**Rationale:** For physical meetings, people walk in before the meeting starts.
The system should reflect that they're present. For virtual, they land in a lobby.

### 3.2 `in_progress` → Room Status: `in_progress`

```
Room Status:     in_progress
Participants:    All with attendanceStatus from DB (mock: accepted → joined)
Agenda:          Loaded, current item = first in_progress or first pending item
Active Vote:     From DB if any open vote exists
Casting:         From DB if active casting session
Recording:       From DB
Connection:      connected
Quorum:          Computed (should be met since meeting is running)
Started At:      meeting.statusUpdatedAt
```

**Rationale:** Meeting already started. Respect existing state from the database.

### 3.3 `completed.*` → Room Status: `ended`

```
Room Status:     ended
Participants:    All 'left'
Agenda:          All items finalized
Active Vote:     null (all closed)
Casting:         null
Recording:       false
Connection:      disconnected
```

**Rationale:** Historical view. Show summary, redirect to detail page.

### 3.4 Other Statuses → Block Room Entry

Meetings with status `draft`, `scheduled.pending_approval`, `scheduled.rejected`,
or `cancelled` cannot enter the meeting room. The `MeetingRoomPage` already guards
this with `canEnterRoom` check.

---

## 4. Meeting Host & Settings

### 4.1 Host Determination

The meeting host is computed from participant `boardRole`:

| Priority | Board Role | Host Role | Rationale |
|----------|-----------|-----------|-----------|
| 1 | `chairman` / `group_chairman` | `host` | Presides over meeting, controls flow |
| 2 | `vice_chairman` | `host` (fallback) | Presides if Chairman absent |
| 3 | `board_secretary` / `company_secretary` / `group_company_secretary` | `cohost` | Admin duties, minutes, documents |
| — | `system_admin` (global role) | `host` (override) | Full access for development/testing |
| — | All others | `participant` | Standard meeting participant |

Host and cohost get elevated room control permissions regardless of base permission checks.

### 4.2 Meeting Room Settings (Core 5)

Configurable by host. Defaults applied based on meeting location type.

| Setting | Type | Default (Physical) | Default (Virtual) | Description |
|---------|------|-------------------|-------------------|-------------|
| `enableWaitingRoom` | boolean | `false` | `true` | Virtual participants must be admitted |
| `allowJoinBeforeHost` | boolean | `false` | `false` | Can participants enter before host |
| `muteParticipantsOnEntry` | boolean | `false` | `true` | Auto-mute on join |
| `allowSelfUnmute` | boolean | `true` | `true` | Participants can unmute themselves |
| `quorumEnforcement` | `block` / `warn` | `block` | `block` | Block start vs. warn only |
| `defaultVoteDuration` | number (seconds) | `120` | `120` | Countdown per vote |
| `requireSeconding` | boolean | `false` | `false` | Motions must be seconded |
| `votingMethod` | enum | `show_of_hands` | `show_of_hands` | How votes are conducted |
| `autoRecord` | boolean | `false` | `false` | Auto-start recording |

---

## 5. Permission Fix Required (IMPLEMENTED)

### Current Bug

`useMeetingPermissions.ts` uses `meetings.edit` as proxy for `meetings.control`:

```typescript
const hasControlPermission = hasPermission(PERMISSION_CODES.MEETINGS_EDIT, boardId);
// Using edit as proxy for control ← WRONG
```

### Permission Matrix (from rolePermissions)

| Role | meetings.edit (22) | meetings.control (24) |
|------|-------------------|---------------------|
| System Admin (1) | ✅ | ✅ |
| Group Chairman (2) | ❌ | ✅ |
| Group Secretary (3) | ✅ | ❌ |
| Board Chairman (4) | ❌ | ✅ |
| Vice Chairman (5) | ❌ | ✅ |
| Company Secretary (6) | ✅ | ❌ |
| Board Member (7) | ❌ | ❌ |

### Impact

- Chairman sees "Waiting for Host" instead of "Start Meeting"
- Secretary can "Start Meeting" but shouldn't be the one to start it

### Fix

Add `MEETINGS_CONTROL: 'meetings.control'` to both permission hooks and use it for:
- `canStartMeeting` (detail page + room)
- `canEndMeeting` (room)
- `canPauseMeeting` (room)

---

## 5. Mock Simulation Approach

### The Problem

Currently there is no way to go through the full meeting lifecycle because:
1. **Permission bug** — Chairman can't start meeting (wrong permission checked)
2. **No arrival simulation** — All participants init as `expected`, quorum never met
3. **No status transition** — Starting a meeting in the room doesn't update the
   meeting's API status from `scheduled` to `in_progress`

### Simulation Strategy (3 layers)

#### Layer 1: Fix Permission Check
- Use `meetings.control` instead of `meetings.edit` for room control actions
- This lets Chairman/Vice Chairman see "Start Meeting" button

#### Layer 2: Smart Participant Initialization
In `MeetingRoomContext.initializeRoom()`:

```
IF meeting.status === 'in_progress':
  → All accepted participants → attendanceStatus: 'joined'
  → Set status: 'in_progress', startedAt from meeting data

ELSE IF meeting.status === 'scheduled' && meeting.subStatus === 'approved':
  → IF locationType === 'physical':
      All accepted participants → attendanceStatus: 'joined' (auto-arrive)
  → IF locationType === 'virtual':
      All accepted → attendanceStatus: 'waiting' (lobby)
  → IF locationType === 'hybrid':
      Physical participants → 'joined', Virtual → 'waiting'
  → Set status: 'waiting'
  → Compute quorum from joined count
```

#### Layer 3: Mock API Status Transition (Optional)
When `startMeeting()` is called in the room context, also update the mock meeting
record so the detail page reflects `in_progress`:

```
POST /api/meetings/:id/start → updates meetingsTable status to 'in_progress'
POST /api/meetings/:id/end   → updates meetingsTable status to 'completed'
```

This keeps the detail page and room page in sync.

---

## 6. Implementation Order

1. **Create state spec** (this document) ✅
2. **Fix permission bug** — Add `MEETINGS_CONTROL` to both permission hooks
3. **Fix MeetingRoomContext initialization** — Smart participant seeding per meeting status
4. **Add state guards** — Centralized helper: `getRoomCapabilities(status) → { canCreateVote, canNavigateAgenda, ... }`
5. **Add pause behavior** — Freeze vote timer, recording on pause
6. **Add quorum monitoring** — Warning when quorum drops during in_progress
7. **Update components** — MeetingControlsBar, ActiveVotePanel, ParticipantStrip to use state guards
8. **Test with MTG-004** — Full lifecycle: waiting → start → vote → pause → resume → end

---

## 7. State Guards API Design

A centralized helper that components can query instead of individually checking status:

```typescript
interface RoomCapabilities {
  // Agenda
  canNavigateAgenda: boolean;
  canMarkItemDiscussed: boolean;
  canDeferItem: boolean;

  // Voting
  canCreateVote: boolean;
  canStartVote: boolean;
  canCastVote: boolean;
  canCloseVote: boolean;
  isVoteTimerRunning: boolean;

  // Documents
  canBrowseDocuments: boolean;
  canCastDocument: boolean;
  canNavigatePages: boolean;
  canStopCasting: boolean;

  // Recording
  canStartRecording: boolean;
  canStopRecording: boolean;

  // Meeting Control
  canStart: boolean;
  canPause: boolean;
  canResume: boolean;
  canEnd: boolean;
  canLeave: boolean;

  // Display
  showQuorumIndicator: boolean;
  showParticipantStrip: boolean;
  showControlsBar: boolean;
  showActiveVote: boolean;
  isReadOnly: boolean;
}

function getRoomCapabilities(
  roomStatus: RoomStatus,
  permissions: MeetingRoomPermissions
): RoomCapabilities;
```

This function combines room status (what's POSSIBLE at this state) with permissions
(what THIS USER can do) to produce a single capabilities object that components consume.

---

## 8. Test Plan — MTG-004 Full Lifecycle

### Prerequisites
- Logged in as user with `meetings.control` permission on KETEPA board
- MTG-004 status: `scheduled.approved`

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to MTG-004 detail page | See "Start Meeting" button (not "Waiting for Host") |
| 2 | Click "Start Meeting" | Navigates to `/ketepa/meetings/MTG-004/room` |
| 3 | Room loads in `waiting` state | See participant strip with 8 avatars, quorum "8/4 — Quorum Met" |
| 4 | Click "Start Meeting" in controls bar | Brief spinner → status changes to `in_progress` |
| 5 | See agenda panel | First item highlighted as current |
| 6 | Click "Create Vote" | VoteCreationModal opens |
| 7 | Fill motion text, click Create | Vote created → ActiveVotePanel appears with countdown |
| 8 | Cast a vote (For/Against/Abstain) | Vote tally updates, "You voted: X" shown |
| 9 | Wait for timer or close vote | Vote closes, results displayed briefly, then clears |
| 10 | Click "Pause" | Status → `paused`, controls show "Resume" |
| 11 | Click "Resume" | Status → `in_progress`, timer resumes |
| 12 | Click "End Meeting" | Brief spinner → status → `ended`, summary shown |
