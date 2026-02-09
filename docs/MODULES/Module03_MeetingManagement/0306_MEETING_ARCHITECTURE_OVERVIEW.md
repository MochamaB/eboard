# Meeting Management Architecture Overview

**Module**: Meeting Management  
**Version**: 1.0  
**Last Updated**: February 2026

---

## 1. Executive Summary

This document outlines the complete architecture for the eBoard Meeting Management system. The system handles the full meeting lifecycle from creation through execution to archival, supporting physical, virtual, and hybrid meeting modes with seamless transitions between them.

---

## 2. Three-Layer Context Architecture

The meeting management system uses a layered context architecture to manage state at different scopes.

### Layer 1: Application Layer (Global)

**AuthContext**
- Current user identity and profile
- User roles and permissions
- Authentication state

**BoardContext**
- Current board/organization selection
- Board theme and branding
- Committee relationships

### Layer 2: Meeting Layer (Meeting Scope)

**MeetingPhaseContext (Enhanced)**
- Current meeting data
- Meeting phase (pre-meeting, during-meeting, post-meeting)
- Phase status and sub-status
- Computed permissions based on phase + role
- Read-only state indicator

### Layer 3: Meeting Room Layer (Live Session Scope)

**MeetingRoomContext**
- Live session state (only active during in_progress)
- Real-time participant tracking
- Current agenda item and time tracking
- Active vote state
- Document casting state
- WebSocket connection management
- Meeting mode (physical/virtual/hybrid)

---

## 3. Meeting Lifecycle and UI Mapping

### 3.1 Three Distinct UI Contexts

| Context | Phase | Purpose | UI Paradigm |
|---------|-------|---------|-------------|
| Meeting Detail | Pre-meeting | Configuration, planning, approval | Tab-based detail page |
| Meeting Room | During-meeting | Live execution | Full-screen immersive |
| Meeting Review | Post-meeting | Minutes, review, archive | Read-only detail view |

### 3.2 Status and SubStatus Model

**Primary Statuses (5)**
- `draft` - Meeting being prepared
- `scheduled` - Confirmed and scheduled
- `in_progress` - Currently happening
- `completed` - Finished
- `cancelled` - Terminal state

**SubStatuses by Primary Status**

| Primary Status | SubStatus Options | Phase |
|----------------|-------------------|-------|
| draft | incomplete, complete | Pre-meeting |
| scheduled | pending_approval, approved, rejected | Pre-meeting |
| in_progress | (none) | During-meeting |
| completed | recent, archived | Post-meeting |
| cancelled | (none) | Terminal |

### 3.3 Phase Mapping

**Pre-Meeting Phase**
- draft.incomplete → Configuration in progress
- draft.complete → Ready for submission
- scheduled.pending_approval → Awaiting approver action
- scheduled.approved → Ready for execution
- scheduled.rejected → Needs revision

**During-Meeting Phase**
- in_progress → Live meeting execution

**Post-Meeting Phase**
- completed.recent → Active post-meeting work (minutes, actions)
- completed.archived → Read-only historical record

**Terminal State**
- cancelled → Meeting terminated (can occur from any pre-meeting state)

---

## 4. Meeting Mode Architecture

### 4.1 Mode Definitions

| Mode | Physical Attendees | Virtual Attendees | Video Conference |
|------|-------------------|-------------------|------------------|
| Physical | All/Most | None | Off |
| Virtual | None | All | On |
| Hybrid | Some | Some | On |

### 4.2 Dynamic Mode Computation

Meeting mode is **computed from participant states**, not statically configured. This allows seamless transitions during live meetings.

**Computation Rules**
- Physical: >0 physical participants, 0 virtual participants
- Virtual: 0 physical participants, >0 virtual participants
- Hybrid: >0 physical participants AND >0 virtual participants

### 4.3 Mode Transition Scenarios

| Scenario | Trigger | From | To |
|----------|---------|------|-----|
| Remote presenter joins | Virtual participant connects | Physical | Hybrid |
| Emergency remote join | Board member joins virtually for quorum | Physical | Hybrid |
| Co-located participants | Multiple virtual join from same room | Virtual | Hybrid |
| All virtual leave | Last virtual participant disconnects | Hybrid | Physical |
| Physical evacuates | Emergency forces physical to join remotely | Hybrid | Virtual |
| Full remote switch | Technical issues force all to go virtual | Physical | Virtual |
| Guest speaker | External expert joins for specific item | Any | Hybrid (if physical) |

### 4.4 Unified Meeting Room UI

Instead of separate pages for each mode, a single unified Meeting Room page adapts its features based on current mode:

**Always Visible (Core Features)**
- Meeting header and status
- Agenda panel with navigation
- Participant panel with attendance
- Document viewer
- Voting panel (when vote active)
- Minutes panel (secretary only)
- Meeting controls

**Conditional: Virtual Features** (when mode ≠ physical)
- Video conference container
- Audio/video controls
- Screen sharing
- Virtual waiting room
- Chat panel
- Recording controls

**Conditional: Physical Features** (when mode ≠ virtual)
- Physical attendance check-in
- Room display mode (projector)
- QR code attendance

**Conditional: Hybrid Features** (when mode = hybrid)
- Split participant view
- Bridge audio controls
- Sync indicators

---

## 5. Permission System

### 5.1 Two-Layer Permission Architecture

The meeting permission system uses a **two-layer approach** that extends the existing role-based permission system without replacing it.

**Layer 1: Base Permissions (Existing System)**
- Role-based, board-scoped permissions
- Configured in Admin Panel → Roles & Permissions
- Answers: "Does user have the CAPABILITY to do X?"
- Examples: `meetings.edit`, `voting.cast`, `minutes.create`
- Used for: Navigation guards, menu visibility, API authorization

**Layer 2: Meeting Contextual Permissions (New - `useMeetingPermissions`)**
- Context-aware, meeting-scoped permissions
- Computed at runtime based on meeting state
- NOT configurable in UI - these are business logic rules
- Answers: "Can user do X on THIS meeting RIGHT NOW?"
- Used for: Button visibility, action enablement, UI state

### 5.2 How the Layers Work Together

Each action requires BOTH layers to pass:

```
canDoAction = hasBasePermission(action) AND meetingStateAllows(action)
```

**Example: Approve Meeting**
- Layer 1: `hasPermission('meetings.edit')` → User has base capability
- Layer 2: `meeting.status === 'scheduled' AND meeting.subStatus === 'pending_approval' AND user is approver`
- Result: Button enabled only if BOTH are true

### 5.3 Base Permissions (Layer 1 - Configurable)

These are configured in Admin Panel and stored in the existing permission system:

| Permission Code | Description | Configured By |
|-----------------|-------------|---------------|
| `meetings.view` | Can view meeting list | Admin |
| `meetings.create` | Can schedule meetings | Admin |
| `meetings.edit` | Can edit meeting details | Admin |
| `meetings.cancel` | Can cancel meetings | Admin |
| `meetings.control` | Can start/end meetings | Admin |
| `meetings.present` | Can present during meetings | Admin |
| `voting.view` | Can view voting results | Admin |
| `voting.create` | Can create voting items | Admin |
| `voting.cast` | Can cast votes | Admin |
| `voting.start` | Can start/stop voting | Admin |
| `minutes.view` | Can view meeting minutes | Admin |
| `minutes.create` | Can create minutes | Admin |
| `minutes.approve` | Can approve minutes | Admin |
| `minutes.sign` | Can digitally sign minutes | Admin |

### 5.4 Contextual Permissions (Layer 2 - Business Logic)

These are computed by `useMeetingPermissions` hook and are NOT user-configurable:

**Pre-Meeting Actions**
- `canEditMeeting` - Only when draft.* or scheduled.rejected
- `canEditParticipants` - Only when draft.* or scheduled.pending_approval or scheduled.rejected
- `canEditAgenda` - Only when draft.* or scheduled.pending_approval or scheduled.rejected
- `canEditDocuments` - Only when draft.* or scheduled.pending_approval or scheduled.rejected
- `canSubmitForApproval` - Only when draft.complete AND user is secretary
- `canApprove` - Only when scheduled.pending_approval AND user is approver
- `canReject` - Only when scheduled.pending_approval AND user is approver
- `canCancel` - Only in pre-meeting phase AND user is chairman/secretary

**During-Meeting Actions**
- `canStartMeeting` - Only when scheduled.approved AND meeting time reached
- `canEndMeeting` - Only when in_progress AND user is chairman
- `canNavigateAgenda` - Only when in_progress AND user is chairman
- `canCreateVote` - Only when in_progress AND user is chairman
- `canCastVote` - Only when in_progress AND vote is active AND user hasn't voted
- `canCastDocument` - Only when in_progress AND user is presenter/chairman
- `canTakeMinutes` - Only when in_progress AND user is secretary

**Post-Meeting Actions**
- `canCreateMinutes` - Only when completed.recent AND no minutes exist AND user is secretary
- `canEditMinutes` - Only when completed.recent AND minutes in draft AND user is secretary
- `canApproveMinutes` - Only when completed.recent AND minutes pending approval AND user is chairman

**General**
- `isReadOnly` - True when completed.archived OR cancelled

### 5.5 Permission Display Points

| Permission Type | Configurable? | Where Configured | Where Displayed |
|-----------------|---------------|------------------|-----------------|
| Base Permissions | ✅ Yes | Admin Panel → Roles | Role management UI |
| Role Assignments | ✅ Yes | Board Settings → Members | Member management UI |
| Meeting Contextual | ❌ No | N/A (code logic) | Affects button states in meeting UI |

### 5.6 Role-Based Permissions Summary

| Action | Chairman | Secretary | Member | Guest |
|--------|----------|-----------|--------|-------|
| Edit meeting | ✓ | ✓ | - | - |
| Approve meeting | ✓ | - | - | - |
| Start meeting | ✓ | ✓ | - | - |
| Navigate agenda | ✓ | - | - | - |
| Create vote | ✓ | - | - | - |
| Cast vote | ✓ | ✓ | ✓ | - |
| Cast documents | ✓ | ✓ | Presenter | - |
| Take minutes | - | ✓ | - | - |
| End meeting | ✓ | - | - | - |

---

## 6. Component Reuse Strategy

### 6.1 Shared Components

Components used across both Meeting Detail and Meeting Room:
- QuorumIndicator
- DocumentViewer (core)
- ParticipantAvatar
- StatusBadges

### 6.2 Adapted Components

Same data, different presentation:
- AgendaView (detail) → AgendaPanel (room)
- ParticipantList (detail) → ParticipantPanel (room)
- VoteResults (detail) → VotingPanel (room)

### 6.3 Context-Specific Components

**Meeting Detail Only**
- MeetingNoticeDocument
- ApprovalWorkflow
- RSVPManagement

**Meeting Room Only**
- JitsiContainer
- DocumentCasting
- LiveMinutesEditor
- MeetingControls
- WaitingRoom

---

## 7. Real-Time Infrastructure

### 7.1 Technology Stack

- **WebSocket Provider**: SignalR (ASP.NET Core)
- **State Management**: React Context + useReducer
- **Optimistic Updates**: For responsiveness
- **Server Reconciliation**: For consistency

### 7.2 Real-Time Events

**Server → Client**
- participant_joined / participant_left
- agenda_changed
- document_cast_started / document_page_changed / document_cast_stopped
- vote_started / vote_updated / vote_closed
- quorum_changed
- meeting_ended

**Client → Server**
- navigate_agenda
- cast_document / change_page / stop_casting
- create_vote / cast_vote / close_vote
- update_attendance

---

## 8. File Structure Overview

```
src/
├── contexts/
│   ├── MeetingPhaseContext.tsx    # Enhanced with permissions
│   └── MeetingRoomContext.tsx     # Live session state
│
├── hooks/
│   ├── useMeetingPhase.ts
│   ├── useMeetingPermissions.ts   # Computed permissions
│   ├── useMeetingRoom.ts          # Room state + actions
│   └── useRealTimeSync.ts         # WebSocket connection
│
├── pages/Meetings/
│   ├── MeetingDetailPage.tsx      # Pre/post meeting UI
│   ├── MeetingRoomPage.tsx        # Unified live meeting UI
│   ├── tabs/                      # Detail page tabs
│   └── room/                      # Room components
│
├── services/
│   ├── meetingRoomService.ts      # API calls
│   └── websocketService.ts        # Real-time sync
│
└── types/
    ├── meeting.types.ts
    ├── meetingRoom.types.ts
    └── meetingPermissions.types.ts
```

---

## 9. Implementation Phases Summary

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Permission system foundation | Week 1 |
| 2 | Phase-aware detail tabs | Week 2 |
| 3 | Meeting Room foundation | Week 3-4 |
| 4 | Core room components | Week 5-6 |
| 5 | Document viewer and casting | Week 7-8 |
| 6 | Voting system | Week 9-10 |
| 7 | Real-time infrastructure | Week 11-12 |
| 8 | Virtual meeting integration | Week 13-14 |
| 9 | Minutes capture | Week 15-16 |

---

## 10. Key Architectural Decisions

1. **Unified Meeting Room UI**: Single adaptive page instead of separate physical/virtual/hybrid pages
2. **Computed Meeting Mode**: Mode derived from participant states, enabling seamless transitions
3. **Layered Contexts**: Separation of concerns between application, meeting, and room state
4. **Permission-First Design**: All actions gated by computed permissions
5. **Real-Time Foundation**: WebSocket infrastructure for live collaboration
6. **Component Reuse**: Shared base components with context-specific adaptations

---

## Related Documents

- 0307_PRE_POST_MEETING_IMPLEMENTATION.md - Pre and post meeting phase details
- 0308_MEETING_ROOM_IMPLEMENTATION.md - Live meeting room details
- 0305_MEETING_ROOM_IMPLEMENTATION_PLAN.md - Original detailed wireframes and specs
