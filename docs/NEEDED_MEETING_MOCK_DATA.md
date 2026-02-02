# Needed Meeting Mock Data - Analysis & Implementation Plan

**Document**: Mock Data Requirements for Full Meeting Execution Simulation
**Date**: January 2026
**Purpose**: Define comprehensive mock data needed for Agenda, Documents, Votes, and Minutes to support complete meeting room testing

---

## Executive Summary

Based on analysis of existing meetings mock data ([src/mocks/db/tables/meetings.ts](../src/mocks/db/tables/meetings.ts) and [src/mocks/db/tables/meetingParticipants.ts](../src/mocks/db/tables/meetingParticipants.ts)), we need to create mock data for **5 key meetings** that cover all execution scenarios:

- **2 Scheduled meetings** (for live execution testing)
- **2 Completed meetings** (for historical data and minutes)
- **1 Draft meeting** (for agenda creation workflow)

**Total Mock Data Required**:
- **5 Agendas** with ~30 agenda items total
- **21 Document records**
- **3 Votes** with ~12 vote casts
- **2 Minutes** with ~6 action items

---

## Current Meeting Landscape

### Meetings by Status:
- **Scheduled (ready for execution)**: 5 meetings (mtg-001, mtg-004, mtg-009, mtg-012, mtg-014)
- **Completed (past meetings)**: 6 meetings (mtg-002, mtg-006, mtg-008, mtg-010, mtg-011, mtg-013)
- **Pending Confirmation**: 4 meetings (mtg-003, mtg-005, mtg-007, mtg-015)
- **Cancelled/Rejected**: 2 meetings (mtg-016, mtg-017)

### Meetings by Location Type:
- **Hybrid**: 5 meetings (mtg-001, mtg-003, mtg-005, mtg-009)
- **Virtual**: 7 meetings (mtg-002, mtg-004, mtg-006, mtg-010, mtg-014, mtg-016)
- **Physical**: 5 meetings (mtg-007, mtg-008, mtg-011, mtg-012, mtg-013, mtg-015)

### Meetings with Presenters/Guests:
- **mtg-001**: Finance Director presenting Q1 Budget (10:00-10:45)
- **mtg-004**: External Auditor presenting audit findings (10:15-11:00)
- **mtg-008**: Sales Manager presenting sales report (10:30-11:00) - **COMPLETED with join/leave times**

---

## Recommended Meetings for Full Mock Data

### **1. MTG-001: Q1 2026 Board Meeting** ⭐ PRIMARY TEST MEETING

**Meeting Details**:
- **ID**: `mtg-001`
- **Board**: ktda-ms (Main Board)
- **Status**: `scheduled`
- **Date**: 2026-01-28
- **Time**: 09:00 - 13:00 (240 minutes)
- **Location Type**: `hybrid`
- **Location**: KTDA Head Office, Nairobi - Board Room
- **Virtual Link**: https://meet.ktda.co.ke/board-q1-2026
- **Quorum**: 8 of 16 (50%)

**Participants** (10 total):
- Chairman: Hon. Chege Kirundi (userId: 1) - RSVP: Accepted
- Vice Chairman: Hon. David Mwangi (userId: 2) - RSVP: Accepted
- 6 Board Members (userIds: 3, 4, 5, 6, 7, 8) - RSVP: 5 Accepted, 1 Tentative
- Company Secretary: Kenneth Muhia (userId: 17) - RSVP: Accepted
- **Presenter**: Finance Director - Brian Mochama (userId: 20) - RSVP: Accepted
  - Presentation Topic: "Q1 2026 Budget Presentation"
  - Time Slot: 10:00 - 10:45

**Why This Meeting**:
- ✅ **Scheduled** (ready for live execution testing)
- ✅ **Hybrid** location (tests both physical and virtual flows)
- ✅ **Has presenter** with specific time slot
- ✅ **240 minutes** (long meeting with multiple agenda items)
- ✅ **10 participants** (substantial group)
- ✅ **Quorum required** (tests quorum tracking)

**Mock Data Needed**:

#### **Agenda** (Status: `published`):
Published on: 2026-01-15T10:00:00Z by Kenneth Muhia (userId: 17)

| # | Title | Type | Duration | Presenter | Documents |
|---|-------|------|----------|-----------|-----------|
| 1 | Call to Order | information | 5 min | Chairman | - |
| 2 | Approval of Previous Minutes | decision | 10 min | Secretary | Q4 2024 Minutes PDF |
| 3 | Q4 2025 Performance Review | information | 30 min | Chairman | Q4 2025 Performance Report PDF |
| 4 | Q1 2026 Budget Presentation | decision | 45 min | Finance Director (userId: 20) | Q1 2026 Budget Presentation PDF |
| 5 | Strategic Initiatives Update | discussion | 40 min | Chairman | Strategic Initiatives Document PDF |
| 6 | Factory Performance Reports | committee_report | 30 min | Zone Directors | Factory Performance Reports PDF |
| 7 | New Business & AOB | discussion | 30 min | Chairman | - |
| 8 | Adjournment | information | 5 min | Chairman | - |

**Total Estimated Duration**: 195 minutes (within 240-minute meeting duration)

#### **Documents** (7 documents):

| ID | Name | Type | Size | Pages | Visible to Guests |
|----|------|------|------|-------|-------------------|
| doc-mtg001-001 | Board Pack - Q1 2026 | board_pack | 2.5 MB | 45 | No |
| doc-mtg001-002 | Q4 2024 Minutes | minutes | 450 KB | 8 | No |
| doc-mtg001-003 | Q4 2025 Performance Report | attachment | 1.2 MB | 15 | No |
| doc-mtg001-004 | Q1 2026 Budget Presentation | presentation | 3.1 MB | 28 | Yes (for presenter) |
| doc-mtg001-005 | Strategic Initiatives Document | attachment | 890 KB | 12 | No |
| doc-mtg001-006 | Factory Performance Reports | attachment | 1.8 MB | 22 | No |
| doc-mtg001-agenda | Q1 2026 Meeting Agenda | agenda | 320 KB | 4 | Yes |

#### **Votes**: None yet (meeting not started)

#### **Minutes**: None yet (meeting not started)

---

### **2. MTG-004: Audit Committee Q1 2026**

**Meeting Details**:
- **ID**: `mtg-004`
- **Board**: comm-audit (Audit Committee)
- **Status**: `scheduled`
- **Date**: 2026-01-20
- **Time**: 10:00 - 12:00 (120 minutes)
- **Location Type**: `virtual`
- **Virtual Link**: https://meet.ktda.co.ke/audit-q1-2026
- **Quorum**: 3 of 5 (50%)

**Participants** (5 total):
- Committee Chair: Hon. G Kagombe (userId: 4) - RSVP: Accepted
- Committee Members: Hon. P Langat, Hon. J Mutai (userIds: 5, 6) - RSVP: Accepted
- Board Secretary: Isaac Chege (userId: 18) - RSVP: Accepted
- **Guest**: External Auditor - Winfred Kabuuri (userId: 21) - RSVP: Accepted
  - Role: External Auditor - PwC
  - Presentation Topic: "2024 Audit Findings and Recommendations"
  - Time Slot: 10:15 - 11:00
  - Permissions: canViewBoardDocuments: false (limited access)

**Why This Meeting**:
- ✅ **Scheduled** (tests virtual meeting room with Jitsi)
- ✅ **Virtual only** (pure virtual scenario)
- ✅ **External guest** with limited permissions
- ✅ **Committee meeting** (smaller group)
- ✅ **Tests guest admission workflow**

**Mock Data Needed**:

#### **Agenda** (Status: `published`):
Published on: 2026-01-10T11:00:00Z by Isaac Chege (userId: 18)

| # | Title | Type | Duration | Presenter | Documents |
|---|-------|------|----------|-----------|-----------|
| 1 | Call to Order | information | 5 min | Committee Chair | - |
| 2 | Review of 2024 Audit Findings | information | 30 min | External Auditor (userId: 21) | 2024 Audit Report PDF |
| 3 | Management Response to Findings | discussion | 20 min | Committee Chair | Management Response Document PDF |
| 4 | Approval of 2026 Audit Plan | decision | 25 min | Committee Chair | 2026 Audit Plan PDF |
| 5 | Any Other Business | discussion | 15 min | Committee Chair | - |
| 6 | Adjournment | information | 5 min | Committee Chair | - |

**Total Estimated Duration**: 100 minutes (within 120-minute meeting duration)

#### **Documents** (4 documents):

| ID | Name | Type | Size | Pages | Visible to Guests |
|----|------|------|------|-------|-------------------|
| doc-mtg004-001 | 2024 Audit Report | attachment | 1.8 MB | 32 | Yes (auditor needs this) |
| doc-mtg004-002 | Management Response Document | attachment | 560 KB | 8 | No |
| doc-mtg004-003 | 2026 Audit Plan | attachment | 720 KB | 12 | No |
| doc-mtg004-agenda | Audit Committee Agenda - Q1 2026 | agenda | 280 KB | 3 | Yes |

#### **Votes**: None yet (meeting not started)

#### **Minutes**: None yet (meeting not started)

---

### **3. MTG-008: KETEPA Board - January 2025** ⭐ PRIMARY COMPLETED MEETING

**Meeting Details**:
- **ID**: `mtg-008`
- **Board**: ketepa (Subsidiary)
- **Status**: `completed`
- **Date**: 2025-01-20
- **Time**: 10:00 - 12:00 (120 minutes)
- **Location Type**: `physical`
- **Location**: KETEPA Office, Nairobi
- **Quorum**: 4 of 7 (50%)

**Participants** (4 total):
- Chairman: John Kamau (userId: 3) - Present (09:55 - 12:10)
- Board Member: Hon. G Kagombe (userId: 4) - Present (09:58 - 12:05)
- Board Secretary: Isaac Chege (userId: 18) - Present (09:50 - 12:30)
- **Presenter**: Sales Manager - Brian Mochama (userId: 20) - Present (10:30 - 11:15)
  - Role: Sales Manager
  - Presentation Topic: "January Sales Performance Report"
  - Time Slot: 10:30 - 11:00
  - **Actual**: Joined at 10:30, left at 11:15 (stayed 15 min extra)

**Why This Meeting**:
- ✅ **Completed** (full historical data)
- ✅ **Physical location** (tests paperless in-person flows)
- ✅ **Has presenter who joined/left** with actual times
- ✅ **All participants have attendance data**
- ✅ **Real attendance tracking** scenario
- ✅ **Document casting** scenario during presentation
- ✅ **Votes and Minutes** completed

**Mock Data Needed**:

#### **Agenda** (Status: `archived`):
Published on: 2025-01-10T10:00:00Z by Isaac Chege (userId: 18)

| # | Title | Type | Duration | Status | Actual Times | Documents |
|---|-------|------|----------|--------|--------------|-----------|
| 1 | Call to Order | information | 5 min | completed | 09:55 - 10:00 | - |
| 2 | Approval of December Minutes | decision | 10 min | completed | 10:00 - 10:08 | December 2024 Minutes PDF |
| 3 | Monthly Operations Report | information | 20 min | completed | 10:08 - 10:30 | Operations Report January PDF |
| 4 | **Sales Performance Presentation** | information | 30 min | completed | 10:30 - 11:05 | **Sales Performance Report PDF** (CASTED) |
| 5 | New Export Market Strategy | decision | 20 min | completed | 11:05 - 11:30 | Export Market Strategy Proposal PDF |
| 6 | Adjournment | information | 5 min | completed | 11:30 - 11:35 | - |

**Total Duration**: 110 minutes actual (ran 5 min over estimate, still within meeting time)

**Key Execution Details**:
- **Quorum**: Met (3 voting members present)
- **Presenter**: Joined at actual agenda item time (10:30), left after Q&A (11:15)
- **Document Casting**: During item 4, Sales Performance Report was cast to all devices:
  - Casting started: 10:32
  - Casting ended: 11:05
  - Presenter controlled pages, all participants saw synced view

#### **Documents** (5 documents):

| ID | Name | Type | Size | Pages | Was Cast | Cast Details |
|----|------|------|------|-------|----------|--------------|
| doc-mtg008-001 | KETEPA Board Pack January 2025 | board_pack | 2.1 MB | 38 | No | - |
| doc-mtg008-002 | December 2024 Minutes | minutes | 420 KB | 7 | No | - |
| doc-mtg008-003 | Operations Report January | attachment | 980 KB | 11 | No | - |
| doc-mtg008-004 | **Sales Performance Report** | presentation | 2.4 MB | 18 | **Yes** | Presenter: userId 20, Pages navigated: 1→18 |
| doc-mtg008-005 | Export Market Strategy Proposal | attachment | 1.1 MB | 14 | No | - |

#### **Votes** (2 votes):

**Vote 1**: Approval of December Minutes
- **ID**: vote-mtg008-001
- **Agenda Item**: Item 2
- **Motion**: "Approve the minutes of the December 2024 board meeting as presented"
- **Type**: yes_no_abstain
- **Status**: closed
- **Started At**: 2025-01-20T10:06:00Z
- **Closed At**: 2025-01-20T10:08:00Z
- **Duration**: 2 minutes
- **Anonymous**: false
- **Results**:
  - Yes: 3 (userIds: 3, 4, 6)
  - No: 0
  - Abstain: 0
- **Outcome**: passed (unanimous)
- **Total Votes**: 3 of 3 voting members

**Vote 2**: Approval of Export Market Strategy
- **ID**: vote-mtg008-002
- **Agenda Item**: Item 5
- **Motion**: "Approve the proposed East African market expansion strategy with a budget allocation of KES 12M"
- **Type**: yes_no_abstain
- **Status**: closed
- **Started At**: 2025-01-20T11:25:00Z
- **Closed At**: 2025-01-20T11:30:00Z
- **Duration**: 5 minutes
- **Anonymous**: false
- **Results**:
  - Yes: 3 (userIds: 3, 4, 6)
  - No: 0
  - Abstain: 0
- **Outcome**: passed (unanimous)
- **Total Votes**: 3 of 3 voting members

#### **Minutes** (Status: `published`):

**Minutes ID**: minutes-mtg008-001
**Status**: published
**Version**: 1
**Created By**: Isaac Chege (userId: 18)
**Created At**: 2025-01-20T14:30:00Z (day of meeting)
**Reviewed By**: John Kamau (userId: 3, Chairman)
**Reviewed At**: 2025-01-21T09:00:00Z
**Approved By**: John Kamau (userId: 3)
**Approved At**: 2025-01-21T10:00:00Z
**Published At**: 2025-01-21T10:05:00Z

**Attendance Summary**:
- Total Participants: 4 (3 voting members + 1 secretary + 1 guest)
- Present: 4
- Absent: 0
- Late: 0
- Quorum: Met (3 of 3 voting members = 100%)

**Agenda Items Summary**:
- Total Items: 6
- Completed: 6
- Skipped: 0
- Ad-Hoc Items: 0

**Decisions Recorded**:
1. **December Minutes Approval**: Approved unanimously (Vote: 3-0-0)
2. **Export Market Strategy**: Approved unanimously with KES 12M budget allocation (Vote: 3-0-0)

**Action Items** (3 items):

| ID | Description | Assigned To | Due Date | Priority | Status |
|----|-------------|-------------|----------|----------|--------|
| action-mtg008-001 | Prepare detailed market analysis for Tanzania and Uganda markets | Sales Manager (userId: 20) | 2025-02-15 | high | pending |
| action-mtg008-002 | Circulate approved export strategy document to all department heads | Board Secretary (userId: 18) | 2025-02-01 | medium | completed |
| action-mtg008-003 | Schedule follow-up meeting with finance team for budget allocation | Chairman (userId: 3) | 2025-02-10 | high | pending |

**Summary Notes**: "Productive meeting with strong sales performance reported. Export strategy unanimously approved. All members expressed confidence in expansion plans."

**Document URL**: `/mock-documents/minutes-mtg008-001.pdf`

---

### **4. MTG-002: Emergency Strategy Meeting**

**Meeting Details**:
- **ID**: `mtg-002`
- **Board**: ktda-ms (Main Board)
- **Status**: `completed`
- **Date**: 2026-01-15
- **Time**: 14:00 - 16:00 (120 minutes)
- **Location Type**: `virtual`
- **Virtual Link**: https://meet.ktda.co.ke/emergency-jan-2026
- **Quorum**: 8 of 16 (50%)

**Participants**: 7 board members + secretary (quorum not specified in participants table, assume met)

**Why This Meeting**:
- ✅ **Completed** (historical data)
- ✅ **Virtual** (Jitsi meeting completed)
- ✅ **Emergency type** (different workflow - no confirmation)
- ✅ **Shorter duration** (120 minutes, focused)
- ✅ **Ad-hoc item** added during meeting

**Mock Data Needed**:

#### **Agenda** (Status: `archived`):
Published on: 2026-01-14T16:00:00Z by Kenneth Muhia (userId: 17)

| # | Title | Type | Duration | Status | Actual Times | Is Ad-Hoc |
|---|-------|------|----------|--------|--------------|-----------|
| 1 | Call to Order - Emergency Declaration | information | 5 min | completed | 14:00 - 14:05 | No |
| 2 | Market Conditions Analysis | information | 30 min | completed | 14:05 - 14:38 | No |
| 3 | Strategic Response Plan | discussion | 50 min | completed | 14:38 - 15:25 | No |
| 4 | **Communications Strategy** (Ad-Hoc) | discussion | 15 min | completed | 15:25 - 15:40 | **Yes** |
| 5 | Approval of Immediate Actions | decision | 30 min | completed | 15:40 - 16:05 | No |

**Total Duration**: 125 minutes (ran 5 min over)

**Note**: Item 4 was added during the meeting by Chairman when communications concerns were raised

#### **Documents** (3 documents):

| ID | Name | Type | Size | Pages |
|----|------|------|------|-------|
| doc-mtg002-001 | Market Analysis Report | attachment | 1.5 MB | 18 |
| doc-mtg002-002 | Strategic Response Plan | attachment | 890 KB | 12 |
| doc-mtg002-003 | Emergency Actions Summary | attachment | 420 KB | 5 |

#### **Votes** (1 vote):

**Vote 1**: Approve Immediate Response Actions
- **ID**: vote-mtg002-001
- **Agenda Item**: Item 5
- **Motion**: "Approve the emergency response actions including market stabilization measures and communication plan"
- **Type**: yes_no_abstain
- **Status**: closed
- **Started At**: 2026-01-15T15:58:00Z
- **Closed At**: 2026-01-15T16:03:00Z
- **Duration**: 5 minutes
- **Anonymous**: false
- **Results**:
  - Yes: 6
  - No: 0
  - Abstain: 1
- **Outcome**: passed
- **Total Votes**: 7 of 7 voting members

#### **Minutes** (Status: `draft`):

**Minutes ID**: minutes-mtg002-001
**Status**: draft (not yet approved)
**Version**: 1
**Created By**: Kenneth Muhia (userId: 17)
**Created At**: 2026-01-15T18:00:00Z (same day)
**Reviewed By**: null
**Reviewed At**: null
**Approved By**: null
**Approved At**: null
**Published At**: null

**Attendance Summary**:
- Quorum: Met (7 voting members)

**Decisions Recorded**:
1. **Emergency Response Actions**: Approved (Vote: 6-0-1)

**Action Items** (4 urgent items):

| ID | Description | Assigned To | Due Date | Priority | Status |
|----|-------------|-------------|----------|----------|--------|
| action-mtg002-001 | Implement market stabilization measures | CEO (userId: 15) | 2026-01-18 | urgent | pending |
| action-mtg002-002 | Prepare external communication statement | Communications Director | 2026-01-16 | urgent | pending |
| action-mtg002-003 | Convene stakeholder briefing session | Chairman (userId: 1) | 2026-01-20 | high | pending |
| action-mtg002-004 | Monitor daily market indicators and report | Finance Director (userId: 20) | 2026-01-30 | high | pending |

**Summary Notes**: "Emergency meeting convened to address sudden drop in global tea prices. Comprehensive response plan approved. All members committed to swift action."

**Document URL**: `/mock-documents/minutes-mtg002-001-draft.pdf`

---

### **5. MTG-003: Budget Review Meeting**

**Meeting Details**:
- **ID**: `mtg-003`
- **Board**: ktda-ms (Main Board)
- **Status**: `pending_confirmation`
- **Date**: 2026-01-22
- **Time**: 10:00 - 12:00 (120 minutes)
- **Location Type**: `hybrid`
- **Location**: KTDA Head Office, Nairobi - Board Room
- **Virtual Link**: https://meet.ktda.co.ke/budget-2026
- **Quorum**: 8 of 16 (50%)

**Participants**: Not yet finalized (meeting pending confirmation)

**Why This Meeting**:
- ✅ **Pending confirmation** (not finalized yet)
- ✅ **Draft agenda** (tests creation/editing flow)
- ✅ **Not yet published** (tests publish workflow)
- ✅ **Incomplete documents** (realistic scenario)

**Mock Data Needed**:

#### **Agenda** (Status: `draft`):
Created on: 2026-01-10T12:00:00Z by Kenneth Muhia (userId: 17)
**Not Published Yet**

| # | Title | Type | Duration | Presenter | Documents | Notes |
|---|-------|------|----------|-----------|-----------|-------|
| 1 | Call to Order | information | 5 min | Not assigned | - | - |
| 2 | Review 2025 Budget Performance | information | 20 min | **Not assigned** | 2025 Budget Performance Report PDF | Need to assign presenter |
| 3 | 2026 Budget Revisions Discussion | discussion | 40 min | Finance Director | **No documents yet** | Awaiting final docs |
| 4 | Capital Expenditure Approvals | decision | 30 min | Not assigned | Draft 2026 Budget PDF | Incomplete |
| 5 | Adjournment | information | 5 min | Chairman | - | - |

**Total Estimated Duration**: 100 minutes

**Issues**:
- Presenters not assigned for items 2 and 4
- Missing critical documents for item 3
- Budget document incomplete
- Agenda ready for editing/completion before publish

#### **Documents** (2 documents - incomplete):

| ID | Name | Type | Size | Pages | Status |
|----|------|------|------|-------|--------|
| doc-mtg003-001 | 2025 Budget Performance Report | attachment | 1.2 MB | 16 | Complete |
| doc-mtg003-002 | Draft 2026 Budget | attachment | 890 KB | 22 | **Incomplete** (marked as draft) |

**Missing Documents**:
- Capital Expenditure Detailed Breakdown
- Revised Budget Projections Document

#### **Votes**: None (meeting not scheduled yet)

#### **Minutes**: None (meeting not scheduled yet)

---

## Summary: Mock Data Coverage

### **Meetings Coverage Table**:

| Meeting ID | Status | Location | Agenda Status | Documents | Votes | Minutes | Primary Purpose |
|------------|--------|----------|---------------|-----------|-------|---------|-----------------|
| mtg-001 | scheduled | Hybrid | Published (7 items) | 7 docs | None yet | None yet | **Live execution testing** |
| mtg-004 | scheduled | Virtual | Published (5 items) | 4 docs | None yet | None yet | **Virtual + Guest testing** |
| mtg-008 | completed | Physical | Archived (6 items) | 5 docs | 2 votes | Published | **Physical complete** ⭐ |
| mtg-002 | completed | Virtual | Archived (5 items, 1 ad-hoc) | 3 docs | 1 vote | Draft | **Virtual complete + Ad-hoc** |
| mtg-003 | pending | Hybrid | Draft (5 items) | 2 docs | None | None | **Draft agenda workflow** |

### **Total Mock Data Required**:

| Data Type | Count | Details |
|-----------|-------|---------|
| **Agendas** | 5 | 1 draft, 2 published, 2 archived |
| **Agenda Items** | 30 | ~6 items per meeting (includes 1 ad-hoc) |
| **Documents** | 21 | Various types (board_pack, presentation, attachment, minutes, agenda) |
| **Votes** | 3 | 2 in mtg-008, 1 in mtg-002 |
| **Vote Casts** | 13 | Individual vote records from participants |
| **Minutes** | 2 | 1 published (mtg-008), 1 draft (mtg-002) |
| **Action Items** | 7 | 3 in mtg-008, 4 in mtg-002 |

---

## Implementation Priorities

### **Phase 0.1: Critical Scheduled Meeting (Week 1)**
**Target**: mtg-001 - Q1 2026 Board Meeting
- Create 7 agenda items (published status)
- Create 7 document records
- **Deliverable**: Can test live meeting execution flow

### **Phase 0.2: Critical Completed Physical Meeting (Week 1-2)**
**Target**: mtg-008 - KETEPA Board January 2025
- Create 6 agenda items (archived status with actual times)
- Create 5 document records (including casting metadata)
- Create 2 votes with 6 vote casts
- Create 1 published minutes with 3 action items
- **Deliverable**: Can test complete physical meeting workflow with history

### **Phase 0.3: Virtual Meeting (Week 2)**
**Target**: mtg-004 - Audit Committee Q1 2026
- Create 6 agenda items (published status)
- Create 4 document records
- **Deliverable**: Can test virtual meeting with external guest

### **Phase 0.4: Completed Virtual Meeting (Week 2)**
**Target**: mtg-002 - Emergency Strategy Meeting
- Create 5 agenda items (archived, including 1 ad-hoc)
- Create 3 document records
- Create 1 vote with 7 vote casts
- Create 1 draft minutes with 4 action items
- **Deliverable**: Can test completed virtual meeting with ad-hoc item

### **Phase 0.5: Draft Agenda Workflow (Week 3)**
**Target**: mtg-003 - Budget Review Meeting
- Create 5 agenda items (draft status, incomplete)
- Create 2 document records (incomplete)
- **Deliverable**: Can test agenda creation and editing workflow

---

## Special Features to Test

### **1. Document Casting (Physical Meetings)**
**Meeting**: mtg-008, Agenda Item 4
- Document: Sales Performance Report PDF
- Presenter: Brian Mochama (userId: 20)
- Casting window: 10:32 - 11:05
- All participants saw presenter's screen synchronized
- Presenter controlled page navigation (pages 1-18)

### **2. Ad-Hoc Agenda Items**
**Meeting**: mtg-002, Agenda Item 4
- Title: "Communications Strategy"
- Added during meeting by Chairman
- Marked with `isAdHoc: true`
- Discussion lasted 15 minutes
- Included in final minutes

### **3. Presenter Time Slots**
**Meeting**: mtg-001, Agenda Item 4
- Presenter joins at specific time (10:00)
- Presents for allocated slot (10:00-10:45)
- System tracks actual join/leave times

### **4. Guest Permissions**
**Meeting**: mtg-004
- External Auditor (guest) has limited permissions
- `canViewBoardDocuments: false`
- Can only see documents explicitly attached to their presentation
- Cannot vote

### **5. Attendance Tracking**
**Meeting**: mtg-008
- All participants have `joinedAt` and `leftAt` times
- Late arrivals tracked (if joined > 5 min after start)
- Early departures tracked (presenter left at 11:15, meeting ended 12:10)
- Quorum calculated based on actual attendance

### **6. Draft to Published Workflow**
**Meeting**: mtg-003
- Agenda in `draft` status
- Missing presenters for some items
- Missing documents for some items
- Tests agenda editing and completion before publish

---

## Database Schema Requirements

Based on this analysis, the following tables are needed:

### **Already Exist**:
- ✅ meetings
- ✅ meetingParticipants
- ✅ meetingTypes
- ✅ meetingConfirmationHistory

### **Need to Create**:
- ❌ agendas
- ❌ agendaItems
- ❌ agendaTemplates
- ❌ meetingDocuments
- ❌ meetingVotes
- ❌ meetingVoteCasts
- ❌ meetingMinutes
- ❌ meetingActionItems

---

## Next Steps

1. **Review this analysis** with development team
2. **Create database table structures** for new tables
3. **Implement Phase 0.1** - Create mock data for mtg-001
4. **Test agenda display** in meeting details page
5. **Continue with subsequent phases** as outlined above

---

## Notes

- All dates use ISO 8601 format
- All times are in Africa/Nairobi timezone (EAT, UTC+3)
- Document URLs point to `/mock-documents/` directory (to be implemented)
- User IDs reference existing users in users table
- Board IDs reference existing boards in boards table
- All mock data should be realistic and internally consistent
