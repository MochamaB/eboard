# Module 3: Meeting Management - Meeting Room Implementation Plan

**Module**: Meeting Management - Meeting Room (Phase 1 Implementation)
**Version**: 1.0
**Last Updated**: January 2026

---

## Overview

This document provides the complete implementation plan for the Meeting Room functionality, covering both Physical and Virtual meeting modes. The meeting room is the core execution environment where meetings take place, participants interact, documents are presented, votes are conducted, and minutes are captured.

---

## File & Folder Structure

```
src/
├── pages/
│   └── Meetings/
│       ├── MeetingRoomPage.tsx                    // Main meeting room container
│       ├── MeetingRoomVirtualPage.tsx             // Virtual meeting wrapper (Jitsi)
│       ├── MeetingRoomPhysicalPage.tsx            // Physical meeting wrapper
│       └── room/                                   // Meeting room components
│           ├── components/
│           │   ├── AgendaPanel/
│           │   │   ├── AgendaPanel.tsx            // Agenda viewer + navigation
│           │   │   ├── AgendaItem.tsx             // Single agenda item card
│           │   │   ├── AgendaTimer.tsx            // Time tracking for items
│           │   │   └── index.ts
│           │   ├── DocumentViewer/
│           │   │   ├── DocumentViewer.tsx         // PDF/doc viewer
│           │   │   ├── DocumentControls.tsx       // Presenter controls
│           │   │   ├── CastingMode.tsx            // Sync to all screens
│           │   │   ├── DocumentPointer.tsx        // Highlight tool
│           │   │   └── index.ts
│           │   ├── ParticipantPanel/
│           │   │   ├── ParticipantPanel.tsx       // Participant list
│           │   │   ├── ParticipantCard.tsx        // Individual participant
│           │   │   ├── AttendanceTracker.tsx      // Check-in/out tracking
│           │   │   ├── QuorumIndicator.tsx        // Real-time quorum status
│           │   │   └── index.ts
│           │   ├── VotingPanel/
│           │   │   ├── VotingPanel.tsx            // Voting interface
│           │   │   ├── VoteCreationModal.tsx      // Create vote (Chairman)
│           │   │   ├── VoteCard.tsx               // Active vote display
│           │   │   ├── VoteResultsCard.tsx        // Results display
│           │   │   └── index.ts
│           │   ├── MinutesPanel/
│           │   │   ├── MinutesPanel.tsx           // Minutes editor (Secretary)
│           │   │   ├── MinutesEditor.tsx          // Rich text editor
│           │   │   ├── ActionItemForm.tsx         // Quick add action
│           │   │   ├── ResolutionForm.tsx         // Record resolution
│           │   │   └── index.ts
│           │   ├── MeetingControls/
│           │   │   ├── MeetingControls.tsx        // Host control bar
│           │   │   ├── HostControls.tsx           // Chairman/Secretary actions
│           │   │   ├── ParticipantControls.tsx    // Standard participant actions
│           │   │   └── index.ts
│           │   ├── VirtualMeeting/
│           │   │   ├── JitsiContainer.tsx         // Jitsi integration
│           │   │   ├── WaitingRoom.tsx            // Virtual waiting room
│           │   │   ├── PreJoinScreen.tsx          // Camera/mic preview
│           │   │   └── index.ts
│           │   └── shared/
│           │       ├── RaiseHandButton.tsx        // Digital hand raise
│           │       ├── PersonalNotes.tsx          // Private notes
│           │       ├── ConnectionStatus.tsx       // Network indicator
│           │       └── index.ts
│           └── index.ts
│
├── components/
│   └── Meetings/
│       ├── MeetingRoomLayout.tsx                  // Layout wrapper for room
│       └── ... (existing meeting components)
│
├── hooks/
│   └── meetings/
│       ├── useMeetingRoom.ts                      // Main meeting room hook
│       ├── useAgenda.ts                           // Agenda navigation
│       ├── useDocumentCasting.ts                  // Document sync
│       ├── useVoting.ts                           // Voting state
│       ├── useAttendance.ts                       // Attendance tracking
│       ├── useMinutes.ts                          // Minutes capture
│       ├── useRealTimeSync.ts                     // WebSocket connection
│       └── useJitsi.ts                            // Jitsi API wrapper
│
├── contexts/
│   └── MeetingRoomContext.tsx                     // Meeting room state
│
├── services/
│   └── meetings/
│       ├── meetingRoomService.ts                  // API calls
│       ├── websocketService.ts                    // Real-time sync
│       └── jitsiService.ts                        // Jitsi integration
│
└── types/
    └── meetingRoom.types.ts                       // Meeting room types
```

---

## Type Definitions

### Core Types

```typescript
// src/types/meetingRoom.types.ts

export type MeetingRoomMode = 'physical' | 'virtual' | 'hybrid';

export type MeetingRoomStatus =
  | 'waiting'      // Before start time
  | 'starting'     // Host starting meeting
  | 'in_progress'  // Active meeting
  | 'paused'       // Break/pause
  | 'ending'       // Host ending meeting
  | 'ended';       // Completed

export type ParticipantStatus =
  | 'invited'      // Not joined yet
  | 'waiting'      // In waiting room (virtual)
  | 'joined'       // In meeting room
  | 'left'         // Left meeting
  | 'removed';     // Removed by host

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'left_early'
  | 'excused';

export interface MeetingRoomState {
  meetingId: string;
  mode: MeetingRoomMode;
  status: MeetingRoomStatus;
  startTime: string | null;
  endTime: string | null;
  duration: number; // in minutes

  // Agenda
  currentAgendaItemId: string | null;
  agendaItems: AgendaItem[];

  // Participants
  participants: MeetingParticipant[];
  expectedCount: number;
  quorumRequired: number;
  quorumMet: boolean;

  // Voting
  activeVote: Vote | null;
  voteHistory: Vote[];

  // Document Casting
  castingDocument: {
    documentId: string;
    currentPage: number;
    totalPages: number;
    presenterId: string;
  } | null;

  // Minutes
  draftMinutes: MeetingMinutes | null;

  // Connection
  isConnected: boolean;
  isSyncing: boolean;
}

export interface MeetingParticipant {
  userId: string;
  name: string;
  role: string; // 'chairman', 'secretary', 'member', 'guest'
  avatar?: string;

  // Status
  status: ParticipantStatus;
  attendanceStatus: AttendanceStatus;

  // Timestamps
  joinedAt: string | null;
  leftAt: string | null;

  // Virtual meeting
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor';

  // Interactions
  handRaised: boolean;
  isPresenting: boolean;
  isSpeaking: boolean;

  // Voting
  canVote: boolean;
  hasVoted?: boolean;
}

export interface AgendaItem {
  id: string;
  orderNumber: number;
  title: string;
  description?: string;
  presenter?: string;
  timeAllocated: number; // minutes
  timeSpent: number; // minutes

  status: 'pending' | 'current' | 'discussed' | 'deferred' | 'completed';

  // Related
  documentIds: string[];

  // Minutes
  notes?: string;
  actionItems: ActionItem[];
  resolutions: Resolution[];

  // Timestamps
  startedAt?: string;
  completedAt?: string;
}

export interface Vote {
  id: string;
  meetingId: string;
  agendaItemId: string;

  // Vote details
  motion: string;
  description?: string;
  voteType: 'yes_no_abstain' | 'custom';
  options: VoteOption[];

  // Settings
  isAnonymous: boolean;
  duration?: number; // seconds
  requireAllMembers: boolean;

  // Status
  status: 'active' | 'closed';
  startedAt: string;
  closedAt?: string;

  // Results
  votes: VoteCast[];
  results: VoteResults;

  // Outcome
  passed: boolean;
  resolutionNumber?: string;
}

export interface VoteOption {
  id: string;
  label: string;
  value: string;
}

export interface VoteCast {
  userId: string;
  userName?: string; // Only if not anonymous
  option: string;
  timestamp: string;
}

export interface VoteResults {
  totalVotes: number;
  totalEligible: number;
  breakdown: {
    option: string;
    count: number;
    percentage: number;
  }[];
}

export interface ActionItem {
  id: string;
  agendaItemId: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Resolution {
  id: string;
  resolutionNumber: string; // e.g., "2025-001"
  agendaItemId: string;
  text: string;
  voteId?: string;
  createdAt: string;
}

export interface MeetingMinutes {
  meetingId: string;
  status: 'draft' | 'pending_approval' | 'approved';

  // Auto-captured
  attendance: AttendanceRecord[];
  agendaItems: AgendaItemMinutes[];
  votes: Vote[];

  // Manual
  openingRemarks?: string;
  closingRemarks?: string;

  // Metadata
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AttendanceRecord {
  userId: string;
  name: string;
  role: string;
  status: AttendanceStatus;
  joinedAt?: string;
  leftAt?: string;
  duration?: number;
}

export interface AgendaItemMinutes {
  agendaItem: AgendaItem;
  notes: string;
  actionItems: ActionItem[];
  resolutions: Resolution[];
  documentsPresented: string[];
}

// WebSocket Events
export type MeetingRoomEvent =
  | { type: 'participant_joined'; data: MeetingParticipant }
  | { type: 'participant_left'; data: { userId: string } }
  | { type: 'agenda_changed'; data: { agendaItemId: string } }
  | { type: 'document_cast_started'; data: { documentId: string; presenterId: string } }
  | { type: 'document_page_changed'; data: { page: number } }
  | { type: 'document_cast_stopped'; data: {} }
  | { type: 'vote_started'; data: Vote }
  | { type: 'vote_updated'; data: { voteId: string; results: VoteResults } }
  | { type: 'vote_closed'; data: { voteId: string; results: VoteResults } }
  | { type: 'hand_raised'; data: { userId: string; raised: boolean } }
  | { type: 'quorum_changed'; data: { met: boolean; count: number } }
  | { type: 'meeting_ended'; data: {} };
```

---

## Page Layouts

### Physical Meeting Room Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ MEETING ROOM HEADER                                                          │
│ Q1 2025 Board Meeting • In Progress • Quorum: 12/15 ✓ • Connected ●         │
│                                                         [Pause] [End Meeting] │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┬──────────────────────────────────────┐
│ MAIN CONTENT (60-70%)               │ SIDE PANELS (30-40%)                 │
│                                     │                                      │
│ ┌─────────────────────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ CURRENT AGENDA ITEM             │ │ │ TABS: [Agenda] [Participants]    │ │
│ │                                 │ │ │       [Documents] [Minutes]      │ │
│ │ 4. Financial Report Q4 2024     │ │ └──────────────────────────────────┘ │
│ │                                 │ │                                      │
│ │ Presenter: CFO John Kamau       │ │ ┌──────────────────────────────────┐ │
│ │ Time: 12:45 / 30:00             │ │ │ AGENDA PANEL                     │ │
│ │                                 │ │ │                                  │ │
│ │ [View Documents] [Next Item]    │ │ │ 1. ✓ Call to Order               │ │
│ └─────────────────────────────────┘ │ │ 2. ✓ Approval of Minutes         │ │
│                                     │ │ 3. ✓ Chairman's Report           │ │
│ ┌─────────────────────────────────┐ │ │ 4. ► Financial Report (current)  │ │
│ │ DOCUMENT VIEWER                 │ │ │ 5.   CEO Report                  │ │
│ │                                 │ │ │ 6.   Strategy Discussion         │ │
│ │ ╔═══════════════════════════╗   │ │ │                                  │ │
│ │ ║ Financial Statements.pdf  ║   │ │ │ [Next Item] [Previous]           │ │
│ │ ║                           ║   │ │ └──────────────────────────────────┘ │
│ │ ║ Q4 2024 Financial Report  ║   │ │                                      │
│ │ ║                           ║   │ │ ┌──────────────────────────────────┐ │
│ │ ║ [Document content...]     ║   │ │ │ QUORUM INDICATOR                 │ │
│ │ ║                           ║   │ │ │                                  │ │
│ │ ╚═══════════════════════════╝   │ │ │ ✓ Quorum Met: 12/15 members      │ │
│ │                                 │ │ │   (Required: 8 members)          │ │
│ │ 🎯 Synced with Presenter        │ │ │                                  │ │
│ │ Page 3 of 24                    │ │ │ ████████░░░░░░░ 80%              │ │
│ │                                 │ │ └──────────────────────────────────┘ │
│ │ [Cast to All] [◄] [►] [Zoom]    │ │                                      │
│ └─────────────────────────────────┘ │                                      │
│                                     │                                      │
│ ┌─────────────────────────────────┐ │                                      │
│ │ ACTIVE VOTE (when vote open)    │ │                                      │
│ │                                 │ │                                      │
│ │ Motion: Approve Q4 Report       │ │                                      │
│ │                                 │ │                                      │
│ │ [  YES  ] [   NO   ] [ ABSTAIN ]│ │                                      │
│ │                                 │ │                                      │
│ │ 8 of 12 members have voted      │ │                                      │
│ │ Time remaining: 1:23            │ │                                      │
│ └─────────────────────────────────┘ │                                      │
└─────────────────────────────────────┴──────────────────────────────────────┘
```

### Virtual Meeting Room Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ MEETING ROOM HEADER                                                          │
│ Q1 2025 Board Meeting • In Progress • Quorum: 12/15 ✓ • Connected ●         │
│                                           [Recording] [Share] [End Meeting]  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┬──────────────────────────────────────┐
│ VIDEO CONFERENCE (JITSI)            │ SIDE PANELS                          │
│                                     │                                      │
│ ┌─────────────────────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐      │ │ │ TABS: [Agenda] [Participants]    │ │
│ │ │ John │ │ Mary │ │ David│      │ │ │       [Documents] [Chat]         │ │
│ │ │ 🎤📹 │ │ 🎤📹 │ │ 🎤📹 │      │ │ └──────────────────────────────────┘ │
│ │ └──────┘ └──────┘ └──────┘      │ │                                      │
│ │                                 │ │ ┌──────────────────────────────────┐ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐      │ │ │ PARTICIPANTS                     │ │
│ │ │ Sarah│ │ James│ │ Peter│      │ │ │                                  │ │
│ │ │ 🎤📹 │ │ 🔇📹 │ │ 🎤📷 │      │ │ │ ✓ John Kamau (Chairman) 🎤📹     │ │
│ │ └──────┘ └──────┘ └──────┘      │ │ │ ✓ Mary Wanjiru (Secretary) 🎤📹  │ │
│ │                                 │ │ │ ✓ David Mwangi (Director) 🎤📹   │ │
│ │ ┌─────────────────────────────┐ │ │ │ ✓ Sarah Njeri (Director) 🎤📹    │ │
│ │ │ Screen Share (optional)     │ │ │ │ ✓ James Omondi (Director) 🔇📹   │ │
│ │ │ [Shared content...]         │ │ │ │ ✓ Peter Kariuki (Director) 🎤📷  │ │
│ │ └─────────────────────────────┘ │ │ │                                  │ │
│ │                                 │ │ │ ⏳ WAITING ROOM (2)               │ │
│ │ [🎤] [📹] [💬] [✋] [👥] [⏺] [📤]│ │ │ • Grace Akinyi                   │ │
│ └─────────────────────────────────┘ │ │ • Michael Otieno                 │ │
│                                     │ │ [Admit] [Admit All]              │ │
│                                     │ │ └──────────────────────────────────┘ │
└─────────────────────────────────────┴──────────────────────────────────────┘
```

---

## Component Wireframes

### 1. Agenda Panel

```
┌──────────────────────────────────────┐
│ AGENDA                               │
│ ──────────────────────────────────── │
│                                      │
│ ✓ 1. Call to Order           [5min] │
│    Completed at 9:05 AM              │
│                                      │
│ ✓ 2. Approval of Previous Minutes   │
│    [10min] • Resolution 2025-001     │
│    Completed at 9:15 AM              │
│                                      │
│ ✓ 3. Chairman's Report       [20min]│
│    Completed at 9:35 AM              │
│                                      │
│ ► 4. Financial Report Q4 2024        │
│    [30min] • Presenter: CFO          │
│    📄 2 documents                    │
│    ⏱ 12:45 elapsed (42% over)       │
│    ▶ CURRENT ITEM                    │
│                                      │
│ 5. CEO Report                [25min] │
│    Presenter: CEO                    │
│    📄 3 documents                    │
│                                      │
│ 6. Strategy Discussion       [45min] │
│    Presenter: Chairman               │
│    📄 1 document                     │
│                                      │
│ 7. AOB                       [15min] │
│                                      │
│ ──────────────────────────────────── │
│ [Previous Item] [Next Item]          │
│ [Mark as Discussed] [Defer]          │
└──────────────────────────────────────┘
```

### 2. Document Viewer (Normal Mode)

```
┌──────────────────────────────────────────────────┐
│ 📄 Financial Statements Q4 2024.pdf              │
│ ──────────────────────────────────────────────   │
│                                                  │
│ ╔════════════════════════════════════════════╗  │
│ ║                                            ║  │
│ ║  KTDA Management Services                  ║  │
│ ║  Financial Statements                      ║  │
│ ║  Quarter 4, 2024                           ║  │
│ ║                                            ║  │
│ ║  1. Executive Summary                      ║  │
│ ║     • Total Revenue: KES 2.4B (+12%)      ║  │
│ ║     • Operating Income: KES 480M (+8%)    ║  │
│ ║     • Net Profit: KES 320M (+15%)         ║  │
│ ║                                            ║  │
│ ║  2. Revenue Breakdown                      ║  │
│ ║     [Chart showing revenue sources]        ║  │
│ ║                                            ║  │
│ ║  3. Expense Analysis                       ║  │
│ ║     [Document content continues...]        ║  │
│ ║                                            ║  │
│ ╚════════════════════════════════════════════╝  │
│                                                  │
│ Page 3 of 24                                     │
│                                                  │
│ [◄] [►] [⊟] [⊞] [🔍-] [🔍+] [↓ Download]       │
│                                                  │
│ [🎯 Cast to All Participants]                    │
└──────────────────────────────────────────────────┘
```

### 3. Document Viewer (Casting Mode - Presenter)

```
┌──────────────────────────────────────────────────┐
│ 📄 Financial Statements Q4 2024.pdf              │
│ 🎯 CASTING TO ALL PARTICIPANTS                   │
│ ──────────────────────────────────────────────   │
│                                                  │
│ ╔════════════════════════════════════════════╗  │
│ ║                                            ║  │
│ ║  [Document content as above]               ║  │
│ ║                                            ║  │
│ ║  👆 Click to highlight areas               ║  │
│ ║                                            ║  │
│ ╚════════════════════════════════════════════╝  │
│                                                  │
│ Page 3 of 24 • 12 participants viewing           │
│                                                  │
│ [◄] [►] [⊟] [⊞] [🔍-] [🔍+] [👆 Pointer]       │
│                                                  │
│ [⏹ Stop Casting]                                 │
└──────────────────────────────────────────────────┘
```

### 4. Document Viewer (Casting Mode - Participant Synced)

```
┌──────────────────────────────────────────────────┐
│ 📄 Financial Statements Q4 2024.pdf              │
│ 🎯 Synced with Presenter (CFO John Kamau)        │
│ ──────────────────────────────────────────────   │
│                                                  │
│ ╔════════════════════════════════════════════╗  │
│ ║                                            ║  │
│ ║  [Document content - same as presenter]    ║  │
│ ║                                            ║  │
│ ║  👆 Red dot showing presenter's pointer    ║  │
│ ║                                            ║  │
│ ╚════════════════════════════════════════════╝  │
│                                                  │
│ Page 3 of 24 • Following presenter               │
│                                                  │
│ [🔍-] [🔍+] (zoom only)                          │
│                                                  │
│ [📖 Browse Independently]                        │
└──────────────────────────────────────────────────┘
```

### 5. Document Viewer (Independent Browsing)

```
┌──────────────────────────────────────────────────┐
│ 📄 Financial Statements Q4 2024.pdf              │
│ 📖 Browsing Independently                        │
│ ──────────────────────────────────────────────   │
│                                                  │
│ ╔════════════════════════════════════════════╗  │
│ ║                                            ║  │
│ ║  [Different page from presenter]           ║  │
│ ║                                            ║  │
│ ║  You are on page 7                         ║  │
│ ║  Presenter is on page 3                    ║  │
│ ║                                            ║  │
│ ╚════════════════════════════════════════════╝  │
│                                                  │
│ Page 7 of 24 • Independent view                  │
│                                                  │
│ [◄] [►] [⊟] [⊞] [🔍-] [🔍+] [↓ Download]       │
│                                                  │
│ [🎯 Sync with Presenter]                         │
└──────────────────────────────────────────────────┘
```

### 6. Participant Panel

```
┌──────────────────────────────────────┐
│ PARTICIPANTS                         │
│ ──────────────────────────────────── │
│                                      │
│ 🟢 PRESENT (12 of 15)                │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 👤 Hon. John Kamau     [Chairman]│ │
│ │    🎤 Speaking • 📄 Presenting   │ │
│ │    Joined: 9:00 AM               │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 👤 Mary Wanjiru      [Secretary] │ │
│ │    ✋ Hand Raised                 │ │
│ │    Joined: 9:00 AM               │ │
│ │    [Lower Hand] [Mute]           │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 👤 David Mwangi      [Director]  │ │
│ │    Joined: 9:00 AM               │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 👤 Sarah Njeri       [Director]  │ │
│ │    Joined: 9:02 AM (Late)        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ... (more participants)              │
│                                      │
│ ──────────────────────────────────── │
│ 🔴 ABSENT (3)                        │
│                                      │
│ • Grace Akinyi (Excused)             │
│ • Michael Otieno (No response)       │
│ • Alice Wambui (No response)         │
│                                      │
│ ──────────────────────────────────── │
│ 👥 GUESTS (2)                        │
│                                      │
│ • Francis Odhiambo (Consultant)      │
│ • Jane Muthoni (Auditor)             │
│                                      │
│ ──────────────────────────────────── │
│ [Mark Attendance] [Export]           │
└──────────────────────────────────────┘
```

### 7. Quorum Indicator

```
┌──────────────────────────────────────┐
│ QUORUM STATUS                        │
│ ──────────────────────────────────── │
│                                      │
│ ✅ QUORUM MET                        │
│                                      │
│ Present: 12 members                  │
│ Required: 8 members (50%)            │
│                                      │
│ ████████████░░░                      │
│ 80% attendance                       │
│                                      │
│ Voting Members: 12/15                │
│ Guests: 2                            │
│                                      │
└──────────────────────────────────────┘

// OR when NOT met:

┌──────────────────────────────────────┐
│ QUORUM STATUS                        │
│ ──────────────────────────────────── │
│                                      │
│ ⚠️ QUORUM NOT MET                    │
│                                      │
│ Present: 6 members                   │
│ Required: 8 members (50%)            │
│                                      │
│ ██████░░░░░░░░░                      │
│ 40% attendance                       │
│                                      │
│ ⚠️ 2 more members needed              │
│                                      │
│ Voting Members: 6/15                 │
│ Guests: 1                            │
│                                      │
└──────────────────────────────────────┘
```

### 8. Voting Panel (Active Vote - Member View)

```
┌──────────────────────────────────────────────────┐
│ 🗳️ ACTIVE VOTE                                   │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Motion #2025-004                                 │
│                                                  │
│ "Approve the Q4 2024 Financial Statements        │
│  as presented by the CFO"                        │
│                                                  │
│ Cast your vote:                                  │
│                                                  │
│ ┌────────────────┐                              │
│ │      YES       │                              │
│ │                │                              │
│ │   ✓ Approve    │                              │
│ └────────────────┘                              │
│                                                  │
│ ┌────────────────┐                              │
│ │       NO       │                              │
│ │                │                              │
│ │   ✗ Reject     │                              │
│ └────────────────┘                              │
│                                                  │
│ ┌────────────────┐                              │
│ │    ABSTAIN     │                              │
│ │                │                              │
│ │   ○ No Vote    │                              │
│ └────────────────┘                              │
│                                                  │
│ ⏱️ Time remaining: 01:23                         │
│ 📊 8 of 12 members have voted                    │
│                                                  │
│ ℹ️ Your vote is final and cannot be changed      │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 9. Voting Panel (Results Display)

```
┌──────────────────────────────────────────────────┐
│ 🗳️ VOTE RESULTS                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Motion #2025-004                                 │
│ "Approve the Q4 2024 Financial Statements"       │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ ✅ YES           8 votes (62%)                   │
│ ████████████████░░░░░░░                         │
│                                                  │
│ ❌ NO            3 votes (23%)                   │
│ ██████░░░░░░░░░░░░░░░░░                         │
│                                                  │
│ ⚪ ABSTAIN       2 votes (15%)                   │
│ ████░░░░░░░░░░░░░░░░░░░                         │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Total Votes: 13 of 13 eligible                   │
│                                                  │
│ ✅ MOTION PASSED                                 │
│                                                  │
│ Resolution: 2025-004                             │
│ Passed: February 25, 2025 at 10:47 AM           │
│                                                  │
│ [View Details] [Close]                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 10. Vote Creation Modal (Chairman Only)

```
┌────────────────────────────────────────────────────┐
│ CREATE VOTE                                    [✕] │
│ ────────────────────────────────────────────────── │
│                                                    │
│ Motion / Question *                                │
│ ┌────────────────────────────────────────────────┐ │
│ │ Approve the Q4 2024 Financial Statements       │ │
│ │ as presented by the CFO                        │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Description (optional)                             │
│ ┌────────────────────────────────────────────────┐ │
│ │                                                │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Vote Type *                                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ ● Yes / No / Abstain (default)                 │ │
│ │ ○ Custom Options                               │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Duration (optional)                                │
│ ┌──────────┐                                       │
│ │ 120      │ seconds (leave blank for no limit)   │
│ └──────────┘                                       │
│                                                    │
│ Settings                                           │
│ ☑ Anonymous voting                                 │
│ ☐ Require all members to vote                      │
│                                                    │
│ ℹ️ Quorum check: 12 of 15 members present          │
│ ✅ Quorum requirement met                           │
│                                                    │
│ ────────────────────────────────────────────────── │
│                                                    │
│             [Cancel]  [Start Vote]                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 11. Minutes Panel (Secretary View)

```
┌──────────────────────────────────────────────────┐
│ MEETING MINUTES                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Current Item: 4. Financial Report Q4 2024        │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ DISCUSSION NOTES                             │ │
│ │ ────────────────────────────────────────────  │ │
│ │                                              │ │
│ │ The CFO presented the Q4 2024 financial      │ │
│ │ statements showing:                          │ │
│ │ - Revenue of KES 2.4B, up 12% YoY            │ │
│ │ - Operating income of KES 480M, up 8%        │ │
│ │ - Net profit of KES 320M, up 15%             │ │
│ │                                              │ │
│ │ Directors raised questions regarding:        │ │
│ │ 1. Marketing expenses increase of 25%        │ │
│ │ 2. Currency fluctuation impact               │ │
│ │                                              │ │
│ │ [Typing notes here...]                       │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ ACTION ITEMS (2)                             │ │
│ │ ────────────────────────────────────────────  │ │
│ │                                              │ │
│ │ 1. CFO to provide detailed breakdown of      │ │
│ │    marketing expenses                        │ │
│ │    → Assignee: John Kamau (CFO)              │ │
│ │    → Due: March 15, 2025                     │ │
│ │                                              │ │
│ │ 2. Finance team to prepare currency impact   │ │
│ │    analysis for next meeting                 │ │
│ │    → Assignee: Finance Team                  │ │
│ │    → Due: March 20, 2025                     │ │
│ │                                              │ │
│ │ [+ Add Action Item]                          │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ RESOLUTIONS (1)                              │ │
│ │ ────────────────────────────────────────────  │ │
│ │                                              │ │
│ │ Resolution 2025-004:                         │ │
│ │ Approved Q4 2024 Financial Statements        │ │
│ │ Vote: Yes: 8 (62%), No: 3, Abstain: 2        │ │
│ │ Status: PASSED                               │ │
│ │                                              │ │
│ │ [+ Add Resolution]                           │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ──────────────────────────────────────────────── │
│ Auto-saved at 10:48 AM              [Save Now]   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 12. Meeting Controls Bar (Host)

```
┌──────────────────────────────────────────────────────────────┐
│ MEETING CONTROLS (HOST)                                      │
│ ──────────────────────────────────────────────────────────── │
│                                                              │
│ [▶️ Start Meeting] (before meeting)                          │
│                                                              │
│ OR during meeting:                                           │
│                                                              │
│ [⏸️ Pause]  [🗳️ Start Vote]  [📄 Documents]  [⏹️ End Meeting]│
│                                                              │
└──────────────────────────────────────────────────────────────┘

// Participant controls:

┌──────────────────────────────────────────────────────────────┐
│ MEETING CONTROLS (PARTICIPANT)                               │
│ ──────────────────────────────────────────────────────────── │
│                                                              │
│ [✋ Raise Hand]  [📝 Notes]  [🚪 Leave Meeting]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 13. Current Agenda Item Card

```
┌──────────────────────────────────────────────────┐
│ CURRENT AGENDA ITEM                              │
│ ──────────────────────────────────────────────── │
│                                                  │
│ 4. Financial Report Q4 2024                      │
│                                                  │
│ Presenter: CFO John Kamau                        │
│                                                  │
│ ⏱️ Time Allocated: 30 minutes                    │
│ ⏱️ Time Elapsed:   38 minutes                    │
│ ⚠️ 8 minutes over allocated time                 │
│                                                  │
│ ████████████████░░░░░░░ 127%                     │
│                                                  │
│ 📄 Documents (2):                                │
│ • Financial Statements Q4 2024.pdf               │
│ • Budget vs Actual Analysis.xlsx                 │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ [View Documents]  [Next Item]  [Mark Complete]   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 14. Personal Notes (Private)

```
┌──────────────────────────────────────────────────┐
│ MY NOTES                                         │
│ ──────────────────────────────────────────────── │
│                                                  │
│ 📝 Private notes (visible only to you)           │
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │ Financial Report Notes:                    │   │
│ │                                            │   │
│ │ - Revenue growth impressive                │   │
│ │ - Need to follow up on marketing spend     │   │
│ │ - Currency hedging strategy needed?        │   │
│ │ - Ask about Q1 projections in AOB          │   │
│ │                                            │   │
│ │ Action for me:                             │   │
│ │ - Review marketing budget before next mtg  │   │
│ │                                            │   │
│ │ [Typing notes here...]                     │   │
│ │                                            │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ──────────────────────────────────────────────── │
│ Auto-saved at 10:49 AM          [Export Notes]   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up basic structure and routing

**Tasks**:
- [ ] Create type definitions in `meetingRoom.types.ts`
- [ ] Set up MeetingRoomContext with basic state
- [ ] Create MeetingRoomLayout component
- [ ] Add routes for meeting room pages
- [ ] Create MeetingRoomPage router component
- [ ] Create basic MeetingRoomPhysicalPage structure

**Deliverable**: Empty meeting room page that loads and routes correctly

---

### Phase 2: Core Components - View Only (Week 2-3)
**Goal**: Display meeting information (no interactions yet)

**Tasks**:
- [ ] **AgendaPanel**: Display agenda items list
  - Show item order, title, time allocated
  - Highlight current item
  - Show status badges (pending/current/completed)
- [ ] **ParticipantPanel**: Display participant list
  - Show name, role, avatar
  - Show join status (joined/not joined)
  - Group by present/absent/guests
- [ ] **QuorumIndicator**: Display quorum status
  - Calculate and show present vs required
  - Visual progress bar
  - Warning when not met
- [ ] **MeetingControls**: Basic control bar
  - Start/End meeting buttons
  - Leave meeting button
- [ ] **CurrentAgendaItemCard**: Show current agenda item details
  - Title, presenter, time tracking
  - List related documents

**Deliverable**: Meeting room displays all information correctly

---

### Phase 3: Document Viewer (Week 4)
**Goal**: View and navigate documents

**Tasks**:
- [ ] **DocumentViewer**: Basic PDF viewer
  - Integrate PDF.js for PDF rendering
  - Page navigation (next/previous)
  - Zoom controls
  - Page indicator
- [ ] **DocumentControls**: Navigation controls
  - Next/previous page buttons
  - Zoom in/out buttons
  - Page number input
  - Download button
- [ ] Documents list panel
  - Show meeting documents
  - Click to open in viewer

**Deliverable**: Can view and navigate PDF documents

---

### Phase 4: Real-time Synchronization (Week 5-6)
**Goal**: Implement WebSocket for real-time updates

**Tasks**:
- [ ] **WebSocketService**: Connection management
  - Connect to WebSocket server
  - Handle connection/disconnection
  - Reconnection logic
  - Event emission and listening
- [ ] **useRealTimeSync hook**: React WebSocket integration
  - Connect on mount
  - Handle incoming events
  - Send outgoing events
  - Cleanup on unmount
- [ ] **Document Casting**: Sync document viewing
  - "Cast to All" functionality
  - Sync page changes to all participants
  - "Synced with Presenter" indicator
  - "Browse Independently" mode
  - "Sync with Presenter" to rejoin
- [ ] **Agenda Navigation Sync**: Sync current agenda item
  - Chairman navigation updates all participants
  - Real-time current item update
- [ ] **Participant Tracking**: Real-time join/leave
  - Update participant list on join/leave
  - Update quorum indicator
  - Show connection status

**Deliverable**: All participants see synced content in real-time

---

### Phase 5: Voting System (Week 7-8)
**Goal**: Conduct digital votes during meeting

**Tasks**:
- [ ] **VoteCreationModal**: Chairman creates vote
  - Form for motion/question
  - Vote type selection (Yes/No/Abstain or custom)
  - Duration timer setting
  - Anonymous option
  - Quorum check
- [ ] **VotingPanel**: Member voting interface
  - Display motion and options
  - Vote buttons (Yes/No/Abstain)
  - Timer countdown
  - Vote count indicator
  - Confirmation after voting
  - Disabled state for guests
- [ ] **VoteResultsCard**: Display results
  - Vote breakdown with percentages
  - Visual bar charts
  - Passed/Failed status
  - Resolution number assignment
- [ ] **Real-time vote sync**:
  - Vote opens on all devices simultaneously
  - Live vote count updates
  - Auto-close when time expires or all voted
  - Results display to all participants
- [ ] **Vote recording**:
  - Save vote to meeting record
  - Link to agenda item
  - Generate resolution number

**Deliverable**: Fully functional voting system with real-time sync

---

### Phase 6: Minutes Capture (Week 9-10)
**Goal**: Secretary can capture meeting minutes in real-time

**Tasks**:
- [ ] **MinutesPanel**: Secretary's minutes editor
  - Rich text editor for discussion notes
  - Linked to current agenda item
  - Auto-save functionality
  - Timestamp tracking
- [ ] **ActionItemForm**: Quick add action items
  - Description input
  - Assignee selection
  - Due date picker
  - Link to agenda item
- [ ] **ResolutionForm**: Record resolutions
  - Resolution text input
  - Auto-number generation (e.g., 2025-001)
  - Link to vote (if applicable)
- [ ] **Auto-capture integration**:
  - Vote results auto-added
  - Attendance auto-recorded
  - Agenda item times auto-tracked
  - Documents presented auto-logged
- [ ] **Draft minutes generation**:
  - Generate Markdown format
  - Include all auto-captured data
  - Format for readability
  - Export functionality

**Deliverable**: Secretary can capture comprehensive meeting minutes

---

### Phase 7: Virtual Meeting (Jitsi) (Week 11-12)
**Goal**: Integrate video conferencing for virtual meetings

**Tasks**:
- [ ] **JitsiContainer**: Embed Jitsi Meet
  - Install `@jitsi/react-sdk`
  - Configure Jitsi settings
  - Embed video conference
  - Handle API ready event
- [ ] **PreJoinScreen**: Camera/mic preview
  - Device selection
  - Preview camera/microphone
  - Display name input
  - Join button
- [ ] **WaitingRoom**: Virtual waiting room
  - Display waiting message
  - Show meeting info
  - Host admission controls
- [ ] **Host controls for virtual**:
  - Admit participants from waiting room
  - Mute/unmute participants
  - Mute all functionality
  - Remove participant
  - Promote to co-host
- [ ] **Recording controls**:
  - Start/stop recording
  - Recording indicator
  - Save recording to documents
- [ ] **Virtual + Physical sync**:
  - Ensure agenda/documents sync works in virtual mode
  - Voting works with video conference
  - Minutes capture during virtual meeting

**Deliverable**: Full virtual meeting support with video conferencing

---

## Technical Dependencies

### Required Libraries

```json
{
  "dependencies": {
    // PDF Viewing
    "react-pdf": "^7.5.1",
    "pdfjs-dist": "^3.11.174",

    // Rich Text Editor (for minutes)
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",

    // Video Conferencing (Phase 7)
    "@jitsi/react-sdk": "^1.3.0",

    // WebSocket (if not using built-in)
    "socket.io-client": "^4.5.4",

    // Existing
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "antd": "^5.12.0",
    "dayjs": "^1.11.10"
  }
}
```

### Backend Requirements

**API Endpoints**:
```
POST   /api/meetings/:id/room/start          // Start meeting
POST   /api/meetings/:id/room/end            // End meeting
GET    /api/meetings/:id/room/state          // Get current state
PUT    /api/meetings/:id/room/agenda/current // Update current item
POST   /api/meetings/:id/room/votes          // Create vote
POST   /api/meetings/:id/room/votes/:id/cast // Cast vote
POST   /api/meetings/:id/room/documents/cast // Start casting
POST   /api/meetings/:id/room/minutes        // Save minutes
POST   /api/meetings/:id/room/attendance     // Mark attendance
```

**WebSocket Events**:
```
// Server -> Client
participant_joined
participant_left
agenda_changed
document_cast_started
document_page_changed
document_cast_stopped
vote_started
vote_updated
vote_closed
hand_raised
quorum_changed
meeting_ended

// Client -> Server
navigate_agenda
cast_document
change_page
stop_casting
create_vote
cast_vote
close_vote
raise_hand
update_attendance
```

---

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock WebSocket connections
- Test vote calculations
- Test quorum calculations

### Integration Tests
- Test WebSocket event flow
- Test document casting sync
- Test voting flow end-to-end
- Test minutes capture

### E2E Tests (Playwright/Cypress)
- Full meeting flow: start → conduct → vote → end
- Multi-user scenario with separate browser sessions
- Document casting across users
- Voting with multiple participants

---

## Performance Considerations

### Optimization Strategies
1. **Virtual Scrolling**: For long participant lists and agenda items
2. **PDF Caching**: Cache rendered PDF pages
3. **WebSocket Connection Pooling**: Efficient connection management
4. **Lazy Loading**: Load components only when needed
5. **Debouncing**: Debounce WebSocket events (e.g., page changes)
6. **Memoization**: React.memo for expensive components

### Offline Support
- Cache meeting documents for offline viewing
- Queue actions when connection lost
- Sync when connection restored
- Show clear connection status indicator

---

## Security Considerations

1. **JWT Authentication**: Secure WebSocket connections with JWT tokens
2. **Room Access Control**: Verify participant permissions before joining
3. **Vote Integrity**: Ensure one vote per member, prevent vote manipulation
4. **Minutes Access**: Restrict minutes editing to Secretary role
5. **Document Security**: Ensure only meeting participants can access documents
6. **Audit Trail**: Log all actions (votes, agenda changes, document views)

---

## Mobile Responsiveness

### Mobile Layout (< 768px)
- Single column layout
- Bottom tab navigation instead of side panels
- Tabs: Agenda | Document | Vote | Participants
- Full-screen document viewer
- Simplified controls (larger buttons)
- Swipe gestures for document navigation

### Tablet Layout (768px - 1024px)
- Two column layout (60/40 split)
- Collapsible side panel
- Touch-optimized controls
- Landscape mode optimized for document viewing

---

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all actions
- **Screen Reader Support**: Proper ARIA labels
- **High Contrast Mode**: Support for high contrast themes
- **Focus Indicators**: Clear focus states for interactive elements
- **Alternative Text**: Alt text for all images and icons
- **Captions**: Support for video captions (Jitsi integration)

---

## Success Metrics

### Phase 1-3 (Core Components)
- Meeting room loads in < 2 seconds
- All participants can view agenda and documents
- Quorum calculated correctly
- UI responsive and intuitive

### Phase 4 (Real-time Sync)
- Document page changes sync within 100ms
- Agenda navigation syncs within 100ms
- Participant join/leave updates within 500ms
- WebSocket connection stable (< 1% disconnection rate)

### Phase 5 (Voting)
- Vote opens on all devices within 200ms
- Vote count updates in real-time
- 100% vote recording accuracy
- Anonymous votes maintain privacy

### Phase 6 (Minutes)
- Auto-save every 30 seconds
- 100% capture of votes and resolutions
- Draft minutes generated immediately after meeting
- Action items properly assigned and tracked

### Phase 7 (Virtual)
- Video conference loads in < 3 seconds
- Audio/video quality acceptable (> 720p, < 200ms latency)
- Recording works reliably
- Waiting room admits participants quickly

---

## Future Enhancements (Post-MVP)

1. **AI-Powered Transcription**: Automatic meeting transcription
2. **Smart Minutes**: AI-assisted minutes generation
3. **Breakout Rooms**: Support for committee discussions
4. **Polling**: Quick polls beyond formal votes
5. **Whiteboard**: Collaborative whiteboard for discussions
6. **Translation**: Real-time translation for international boards
7. **Mobile Apps**: Native iOS/Android apps
8. **Integration**: Integrate with Microsoft Teams, Zoom as alternatives to Jitsi
9. **Analytics**: Meeting analytics and insights dashboard
10. **Archive Search**: Search across historical meeting minutes

---

## Conclusion

This implementation plan provides a structured approach to building the Meeting Room functionality. By following the phased approach, the team can deliver incremental value while building toward the complete vision of a paperless, efficient, and modern board meeting experience.

The physical meeting room (Phases 1-6) should be prioritized as it provides the most immediate value for in-person board meetings, which are the most common meeting type. Virtual meeting support (Phase 7) can be added once the core functionality is stable and tested.

---

**Document Control**
- **Version**: 1.0
- **Last Updated**: January 2026
- **Next Review**: March 2026
- **Owner**: Development Team
