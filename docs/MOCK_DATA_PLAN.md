# Mock Data Plan - Meeting Status Refactor Testing

**Created:** February 4, 2026
**Purpose:** Comprehensive mock data strategy to test all status+subStatus combinations and event flows
**Based on:** DATABASE_SCHEMA.md, MEETING_LIFECYCLE_EVENTS.md, MEETING_STATUS_REFACTOR.md

---

## 📋 Executive Summary

This plan creates **9 test meetings** covering all lifecycle phases, status combinations, and edge cases. Each meeting has complete related data (participants, events, agenda, documents, votes, minutes, action items, resolutions) to enable thorough testing of the new status+subStatus model.

**Total Data:**
- 9 meetings across 3 boards
- 89 events (complete audit trail)
- 120+ participants
- 57 agenda items
- 40 documents
- 10 votes with 120 individual vote records
- 2 minutes (draft + approved)
- 10 action items
- 3 resolutions

---

## 🎯 Test Coverage Matrix

| Meeting ID | Board | Status | SubStatus | Phase | Test Purpose | Events | Related Data |
|------------|-------|--------|-----------|-------|--------------|--------|--------------|
| **MTG-001** | ktda-ms | draft | incomplete | Pre | Validation failures | 2 | 2 participants (need 8), 0 agenda, 0 docs |
| **MTG-002** | ktda-ms | draft | complete | Pre | Ready for approval | 4 | 15 participants, 8 agenda, 5 docs |
| **MTG-003** | ktda-factory-001 | scheduled | pending_approval | Pre | Approval workflow | 6 | Unsigned confirmation PDF |
| **MTG-004** | ktda-ms | scheduled | approved | Pre | Approved, ready | 7 | Signed confirmation PDF, signatures |
| **MTG-005** | ktda-ms | scheduled | rejected | Pre | Rejection → revision | 8 | Rejection metadata |
| **MTG-006** | ktda-ms | in_progress | null | During | Live execution | 15 | 3 votes, attendance tracking |
| **MTG-007** | ktda-ms | completed | recent | Post | Active minutes work | 20 | Draft minutes, 3 action items |
| **MTG-008** | ktda-factory-001 | completed | archived | Post | Read-only historical | 22 | Approved minutes, completed actions |
| **MTG-009** | ktda-committee-001 | cancelled | null | Terminal | Cancellation flow | 5 | Cancellation metadata |

**Total Events:** 89 events tracking complete meeting lifecycle

---

## 🔄 Data Flow Patterns

### Pattern 1: Complete Happy Path (Full Lifecycle)

```
MTG-002: draft.complete
├─ Created: 2026-01-05 by Secretary
├─ Participants: 15 (1 chairman, 1 secretary, 11 members, 2 observers)
├─ Agenda: 8 items (all required fields)
├─ Documents: 5 docs (financials, reports)
├─ Validation: PASSED ✓
└─ Events: meeting_created, participants_updated, agenda_updated, configuration_complete

        ↓ Secretary submits for approval

MTG-003: scheduled.pending_approval
├─ Transition: draft.complete → scheduled.pending_approval
├─ Document: Unsigned confirmation PDF generated
├─ Notification: Sent to chairman (email + in-app)
├─ Metadata: submissionNotes, unsignedDocumentId
└─ Events: + submitted_for_approval

        ↓ Chairman reviews and approves

MTG-004: scheduled.approved
├─ Transition: scheduled.pending_approval → scheduled.approved
├─ Digital Signature: Chairman signs confirmation PDF
├─ Document: Signed confirmation PDF
├─ Notifications: Invitations to all 15 participants
├─ Metadata: signatureId, signedDocumentId
└─ Events: + approved

        ↓ Meeting time arrives, chairman starts

MTG-006: in_progress
├─ Transition: scheduled.approved → in_progress
├─ Attendance: 15 participants join (timestamps recorded)
├─ Quorum: Achieved (8/15 required)
├─ Agenda Execution: Items marked in_progress → completed
├─ Votes: 3 votes conducted (15 voters × 3 votes = 45 vote records)
├─ Recording: Started → Stopped
└─ Events: + meeting_started, participant_joined (×15), quorum_achieved,
           vote_started (×3), vote_closed (×3), recording_started,
           recording_stopped, meeting_ended

        ↓ Meeting ends

MTG-007: completed.recent
├─ Transition: in_progress → completed.recent
├─ Minutes: Draft created (12 pages, rich HTML content)
├─ Action Items: 3 tasks assigned with due dates
├─ Resolutions: 1 formal resolution recorded
├─ Vote Results: Computed and cached
├─ Status: Active post-meeting work
└─ Events: + minutes_created, action_item_created (×3), resolution_recorded

        ↓ 90 days later or manual archive

MTG-008: completed.archived
├─ Transition: completed.recent → completed.archived
├─ Minutes: Approved with chairman signature
├─ Minutes PDF: Final approved version generated
├─ Action Items: 7 items (4 completed, 3 in_progress)
├─ Resolutions: 2 resolutions (both implemented)
├─ State: READ-ONLY (terminal)
└─ Events: + minutes_submitted, minutes_approved, archived
```

### Pattern 2: Rejection & Revision Flow

```
MTG-005 Initial: scheduled.pending_approval
├─ All requirements met
└─ Submitted for approval

        ↓ Chairman reviews and rejects

MTG-005 Rejected: scheduled.rejected
├─ Rejection Reason: 'agenda_not_approved'
├─ Comments: 'Budget section needs more financial detail and projections'
├─ Notification: Rejection notice sent to secretary
├─ Status: Cannot proceed, needs revision
└─ Events: + rejected (with metadata)

        ↓ Secretary clicks "Start Revision"

MTG-005 Revised: draft.incomplete
├─ Transition: scheduled.rejected → draft.incomplete
├─ Status: Back to draft for editing
├─ Secretary: Can edit agenda, add docs, resubmit
└─ Events: + revision_started
```

### Pattern 3: Direct Scheduling (No Approval - Emergency)

```
MTG-EMERGENCY: draft.complete
├─ Meeting Type: 'emergency'
├─ Overrides: { skipApproval: true }
├─ Override Reason: 'Emergency market conditions require immediate board decision'
├─ Validation: Custom rules apply

        ↓ Schedule directly (skips approval workflow)

MTG-EMERGENCY: scheduled.approved
├─ Transition: draft.complete → scheduled.approved (DIRECT)
├─ NO approval workflow (submitted_for_approval event skipped)
├─ NO confirmation PDF generation
├─ Notifications: Direct invitations to participants
└─ Events: + scheduled_directly (not submitted_for_approval)
```

### Pattern 4: Cancellation Flow

```
MTG-009: scheduled.approved
├─ Meeting was approved and scheduled
└─ Participants invited

        ↓ Secretary cancels meeting

MTG-009: cancelled
├─ Transition: scheduled.approved → cancelled
├─ Cancellation Reason: 'Quorum cannot be achieved due to travel restrictions'
├─ Notifications: Cancellation notice to all 8 participants
├─ State: Terminal (no further transitions possible)
└─ Events: + cancelled (with metadata)
```

---

## 📊 Detailed Meeting Specifications

### Meeting 1: Draft Incomplete (Validation Failure)

```typescript
Meeting: MTG-001
{
  id: 'mtg-001',
  boardId: 'ktda-ms',
  title: 'Q2 2026 Planning Session',
  description: 'Quarterly planning meeting - still being configured',
  meetingType: 'regular',
  scheduledDate: '2026-03-15',
  startTime: '09:00',
  endTime: '12:00',
  duration: 180,
  timezone: 'Africa/Nairobi',
  locationType: 'hybrid',
  physicalLocation: 'KTDA Head Office - Board Room',
  meetingLink: null, // Not generated yet

  // NEW FIELDS
  status: 'draft',
  subStatus: 'incomplete',
  statusUpdatedAt: '2026-02-01T14:30:00Z',
  overrides: null,
  overrideReason: null,

  quorumPercentage: 50,
  quorumRequired: 8,
  createdBy: 17, // Jane Muthoni (Secretary)
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T14:30:00Z'
}

Participants: 2 (NEED 8 FOR QUORUM)
- Chairman: John Kamau (userId: 1)
- Secretary: Jane Muthoni (userId: 17)

Agenda Items: 0 (REQUIRED: minimum 1)

Documents: 0 (REQUIRED: minimum 1)

Events: 2
1. meeting_created (2026-02-01T10:00:00Z)
   - fromStatus: null → toStatus: draft, toSubStatus: incomplete
2. meeting_updated (2026-02-01T14:30:00Z)
   - Updated location details

Validation Result:
{
  isValid: false,
  errors: [
    'Minimum 8 participants required (currently: 2)',
    'At least 1 agenda item required (currently: 0)',
    'At least 1 document required (currently: 0)',
    'Chairman present but insufficient quorum'
  ],
  warnings: []
}

UI State:
- "Submit for Approval" button: DISABLED
- "Edit Meeting" button: ENABLED
- Validation errors displayed prominently
- Progress indicator: 3/6 requirements met
```

### Meeting 2: Draft Complete (Ready for Approval)

```typescript
Meeting: MTG-002
{
  id: 'mtg-002',
  boardId: 'ktda-ms',
  title: 'Q1 2026 Board Meeting',
  description: 'Quarterly review of Q4 2025 performance and Q1 2026 budget approval',
  meetingType: 'regular',
  scheduledDate: '2026-01-28',
  startTime: '09:00',
  endTime: '13:00',
  duration: 240,
  timezone: 'Africa/Nairobi',
  locationType: 'hybrid',
  physicalLocation: 'KTDA Head Office - Board Room',
  meetingLink: 'https://meet.ktda.co.ke/board-q1-2026',

  status: 'draft',
  subStatus: 'complete',
  statusUpdatedAt: '2026-01-10T16:00:00Z',
  overrides: null,
  overrideReason: null,

  quorumPercentage: 50,
  quorumRequired: 8,
  createdBy: 17,
  createdAt: '2026-01-05T08:00:00Z',
  updatedAt: '2026-01-10T16:00:00Z'
}

Participants: 15
- 1 Chairman (can vote, required)
- 1 Secretary (cannot vote, required)
- 11 Board Members (can vote, required)
- 2 Observers (cannot vote, not required)

Agenda Items: 8
1. Opening and Prayer (information, 5 min)
2. Approval of Previous Minutes (decision, requires vote, 15 min)
3. Q4 2025 Financial Performance (information, 45 min)
4. Q1 2026 Budget Approval (decision, requires vote, 60 min)
5. Market Review and Trends (information, 30 min)
6. Strategic Initiatives Update (discussion, 30 min)
7. Factory Performance Reports (information, 20 min)
8. Any Other Business (discussion, 15 min)

Documents: 5
- Q4 2025 Minutes - Draft (12 pages, PDF)
- Q4 2025 Financial Statements (35 pages, PDF, watermarked)
- Q1 2026 Operational Budget (Excel)
- Market Analysis Report (PDF)
- Factory Performance Summary (PDF)

Events: 4
1. meeting_created (2026-01-05T08:00:00Z)
2. participants_updated (2026-01-06T10:00:00Z) - 15 added
3. agenda_updated (2026-01-08T14:00:00Z) - 8 items created
4. configuration_complete (2026-01-10T16:00:00Z) - AUTOMATIC

Validation Result:
{
  isValid: true,
  errors: [],
  warnings: []
}

UI State:
- "Submit for Approval" button: ENABLED ✓
- Green checkmark: "All requirements met"
- Progress indicator: 6/6 complete
```

---

## 🗂️ Event Timeline (89 Total Events)

### Pre-Meeting Phase Events (45 events)

**Creation & Configuration (30 events)**
```
MTG-001: 2 events (created, updated)
MTG-002: 4 events (created, participants, agenda, configuration_complete)
MTG-003: 6 events (created, participants, agenda, docs, configuration_complete, submitted)
MTG-004: 7 events (all above + approved)
MTG-005: 8 events (all above + rejected)
MTG-009: 5 events (created through cancelled)
```

**Approval Workflow (8 events)**
```
- submitted_for_approval: 3 times (MTG-003, MTG-004, MTG-005)
- approved: 2 times (MTG-004, MTG-006)
- rejected: 1 time (MTG-005)
- revision_started: 1 time (MTG-005)
- scheduled_directly: 1 time (emergency meeting)
```

**Lifecycle Management (7 events)**
```
- rescheduled: 1 time (MTG-003 date changed)
- cancelled: 1 time (MTG-009)
- documents_updated: 5 times (various meetings)
```

### During-Meeting Phase Events (28 events)

**Meeting Execution (3 meetings × events)**
```
MTG-006, MTG-007, MTG-008:
- meeting_started: 3 times
- participant_joined: 45 times (15 per meeting × 3)
- participant_left: 45 times
- quorum_achieved: 3 times
- vote_started: 10 times total
- vote_closed: 10 times total
- recording_started: 2 times
- recording_stopped: 2 times
- meeting_ended: 3 times
```

### Post-Meeting Phase Events (16 events)

**Minutes & Deliverables**
```
- minutes_created: 2 times (MTG-007, MTG-008)
- minutes_submitted: 1 time (MTG-008)
- minutes_approved: 1 time (MTG-008)
- action_item_created: 10 times
- action_item_completed: 4 times
- resolution_recorded: 3 times
- archived: 1 time (MTG-008)
```

---

## 📁 Related Data Specifications

### Participants Distribution (120+ total)

```
MTG-001: 2 participants
  - Chairman + Secretary only (INCOMPLETE)

MTG-002: 15 participants
  - 1 Chairman (John Kamau, can vote)
  - 1 Secretary (Jane Muthoni, cannot vote)
  - 11 Board Members (can vote)
  - 2 Observers (cannot vote, no doc access)

MTG-003: 6 participants (Factory Committee)
  - 1 Committee Chair
  - 1 Secretary
  - 4 Committee Members

MTG-004: 15 participants (same as MTG-002)

MTG-005: 15 participants (same as MTG-002)

MTG-006: 15 participants + attendance tracking
  - All joined with timestamps
  - joinedAt: 09:00-09:15 range
  - leftAt: 13:00-13:10 range
  - attendanceStatus: 'present'

MTG-007: 15 participants + attendance

MTG-008: 10 participants + attendance

MTG-009: 8 participants (Committee)
```

### Agenda Items (57 total)

```
Distribution:
- MTG-001: 0 items (validation fail)
- MTG-002: 8 items
- MTG-003: 5 items
- MTG-004: 8 items
- MTG-005: 6 items
- MTG-006: 8 items (with execution timing)
- MTG-007: 8 items (completed)
- MTG-008: 7 items (completed)
- MTG-009: 7 items (cancelled)

Item Types Distribution:
- information: 20 items
- decision: 15 items (require votes)
- discussion: 12 items
- committee_report: 10 items

Status Distribution (for in_progress/completed meetings):
- pending: 0 (all started)
- in_progress: 0 (all completed or skipped)
- completed: 45
- skipped: 2
- postponed: 3
```

### Documents (40 total)

```
Category Distribution:
- Minutes (previous meetings): 8 docs
- Financial statements: 10 docs
- Reports/presentations: 12 docs
- Confirmation PDFs: 4 docs (unsigned + signed)
- Approved minutes PDFs: 2 docs
- Supporting materials: 4 docs

File Types:
- PDF: 30 docs
- Excel: 6 docs
- PowerPoint: 4 docs

Attachment Types:
- meeting: 20 attachments
- agenda_item: 15 attachments
- minutes: 3 attachments
- resolution: 2 attachments
```

### Votes (10 votes, 120 individual vote records)

```
Vote Distribution:
- MTG-002: 2 votes (configured but not opened - meeting still draft)
- MTG-006: 3 votes (opened, cast, closed)
- MTG-007: 3 votes (closed, results computed)
- MTG-008: 2 votes (archived)

Voting Methods:
- yes_no_abstain: 8 votes
- multiple_choice: 2 votes

Vote Status:
- draft: 2 (MTG-002)
- closed: 8 (MTG-006, MTG-007, MTG-008)

Individual Votes Cast: 120 records
- 3 votes (MTG-006) × 15 voters = 45 records
- 3 votes (MTG-007) × 15 voters = 45 records
- 2 votes (MTG-008) × 15 voters = 30 records

Vote Results: All computed
- Quorum met: 8/8 votes
- Outcome: 7 passed, 1 failed
```

### Minutes (2 records)

```
MTG-007: Draft Minutes
{
  id: 'min-007',
  meetingId: 'mtg-007',
  status: 'draft',
  content: '<rich HTML with all meeting details>',
  wordCount: 3500,
  version: 1,
  createdBy: 17 (Secretary),
  createdAt: '2026-01-28T13:30:00Z',
  pdfUrl: null,
  allowComments: true
}

MTG-008: Approved Minutes
{
  id: 'min-008',
  meetingId: 'mtg-008',
  status: 'approved',
  content: '<rich HTML>',
  wordCount: 4200,
  version: 3,
  approvedBy: 1 (Chairman),
  approvedAt: '2023-12-20T10:00:00Z',
  pdfUrl: '/documents/min-008-approved.pdf',
  allowComments: false
}

With 1 signature:
- Chairman digital signature on MTG-008 minutes
- Signature method: 'digital'
- Certificate-based authentication
```

### Action Items (10 items)

```
MTG-007: 3 action items
1. "Prepare detailed budget breakdown" → CFO, due: Feb 15
2. "Schedule factory site visits" → Operations Manager, due: Feb 10
3. "Draft new procurement policy" → Legal, due: Feb 28

MTG-008: 7 action items
1-4: Completed items (status: 'completed')
5-7: In-progress items (status: 'in_progress')

Priority Distribution:
- urgent: 1
- high: 4
- medium: 3
- low: 2
```

### Resolutions (3 records)

```
MTG-007: 1 resolution
- "Approve Q1 2026 Operational Budget"
- Category: 'financial'
- Decision: 'approved'
- Linked to vote
- Implementation status: 'pending'

MTG-008: 2 resolutions
1. "Approve Factory Expansion Plan"
   - Decision: 'approved'
   - Implementation: 'completed'
2. "Adopt New Safety Protocols"
   - Decision: 'approved'
   - Implementation: 'in_progress'
```

---

## ✅ Test Scenarios Covered

### 1. Validation Testing
- ✅ Incomplete meeting (missing participants)
- ✅ Incomplete meeting (missing agenda)
- ✅ Incomplete meeting (missing documents)
- ✅ Complete meeting (all requirements met)
- ✅ Custom validation with overrides

### 2. Approval Workflow Testing
- ✅ Submit for approval
- ✅ Chairman approves
- ✅ Chairman rejects
- ✅ Revision after rejection
- ✅ Direct scheduling (emergency)

### 3. Meeting Execution Testing
- ✅ Start meeting
- ✅ Participant join/leave tracking
- ✅ Quorum achievement
- ✅ Vote opening and casting
- ✅ Meeting recording
- ✅ Meeting end

### 4. Post-Meeting Testing
- ✅ Minutes creation (draft)
- ✅ Minutes approval workflow
- ✅ Action item assignment
- ✅ Resolution recording
- ✅ Archival

### 5. Edge Cases Testing
- ✅ Cancellation from various states
- ✅ Rescheduling with re-approval
- ✅ Anonymous voting
- ✅ Weighted voting
- ✅ Meeting overrides

---

## 🎯 Implementation Roadmap

### Week 1: Core Foundation

**Day 1-2: Type Definitions**
- [ ] Update `meeting.types.ts` with status+subStatus
- [ ] Create `meetingEvent.types.ts` with 31 event types
- [ ] Add MeetingOverrides interface

**Day 3-4: Core Tables**
- [ ] Create `meetingEvents.ts` (89 events)
- [ ] Update `meetings.ts` (9 meetings)
- [ ] Update `meetingParticipants.ts` (120+ participants)

**Day 5: Query Helpers**
- [ ] Create `meetingEventQueries.ts`
- [ ] Update `meetingQueries.ts` for status+subStatus
- [ ] Add validation query helpers

### Week 2: Related Modules

**Day 1-2: Agenda & Documents**
- [ ] Create `agendaItems.ts` (57 items)
- [ ] Update `documents.ts` (40 docs)
- [ ] Create `documentAttachments.ts`

**Day 3-4: Voting & Minutes**
- [ ] Update `votes.ts` (10 votes)
- [ ] Update `votesCast.ts` (120 records)
- [ ] Create `minutes.ts` (2 records)

**Day 5: Action Items & Resolutions**
- [ ] Create `actionItems.ts` (10 items)
- [ ] Create `resolutions.ts` (3 records)
- [ ] Update handlers for event emission

---

## 📊 Data Integrity Checks

Before implementation completion, verify:

- [ ] All 9 meetings have valid status+subStatus combinations
- [ ] All 89 events have proper state transitions (fromStatus → toStatus)
- [ ] All participants have valid userId references
- [ ] All agenda items link to existing meetings
- [ ] All documents have valid attachments
- [ ] All votes have complete configuration + eligibility
- [ ] All votesCast records are append-only (no updates)
- [ ] All minutes have proper workflow status
- [ ] All action items have valid assignees
- [ ] All resolutions link to valid votes
- [ ] Event timeline is chronologically consistent
- [ ] No orphaned records (referential integrity)

---

**Last Updated:** February 4, 2026
**Status:** Ready for Implementation
**Next Step:** Begin Phase A.1 - Update meeting.types.ts
