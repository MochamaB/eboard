# Module 3: Meeting Management - Physical Meeting Room User Flows

**Module**: Meeting Management - Physical Meeting Room (Paperless Experience)  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Overview

This document covers user flows for **physical (in-person) meetings** where participants use the eBoard system on their devices (laptops, tablets) during the meeting. The goal is a **paperless board meeting experience** where all participants interact with digital documents, agendas, and voting systems.

### Key Difference from Virtual Meetings

| Feature | Virtual Meeting | Physical Meeting |
|---------|-----------------|------------------|
| Video/Audio | ✅ Jitsi integration | ❌ Not needed (in same room) |
| Agenda Viewer | ✅ | ✅ |
| Document Viewer | ✅ | ✅ |
| Document Casting | ✅ Screen share | ✅ Presenter mode (sync to all) |
| Voting | ✅ | ✅ |
| Attendance | ✅ Auto-tracked | ✅ Manual check-in + system tracking |
| Chat | ✅ | ⚠️ Optional (can use for notes) |
| Recording | ✅ Video recording | ❌ Not applicable |
| Minutes Capture | ✅ | ✅ |

---

## Flows in This Document

1. Start Physical Meeting (Host)
2. Join Physical Meeting Room (Participant)
3. Check-In / Mark Attendance
4. View and Navigate Agenda
5. Present Documents (Casting Mode)
6. Conduct Vote During Physical Meeting
7. Capture Minutes / Action Items
8. End Physical Meeting

---

## Flow 1: Start Physical Meeting (Host)

**Actor**: Chairman / Board Secretary  
**Flow**: Meeting Details → Start Meeting → Open Meeting Room → Participants Join

### Steps

1. Navigate to Meeting Details page
2. "Start Meeting" button becomes active 15 minutes before scheduled time
3. Click "Start Meeting"
4. System actions:
   - Meeting status → "In Progress"
   - Notification sent to all participants: "Meeting has started - Join the Meeting Room"
   - Meeting Room URL becomes active
5. **Meeting Room opens** (no video interface):
   - Host dashboard with controls
   - Participant list (expected vs joined)
   - Agenda panel
   - Documents panel
   - Quorum indicator
6. Host announces: "Please join the meeting room on your devices"
7. Participants join via their devices
8. Host monitors quorum status
9. When quorum met, proceed with meeting

### Host Controls (Physical Meeting)

| Control | Purpose |
|---------|---------|
| Start Meeting | Activate meeting room |
| Mark Attendance | Manually mark present/absent |
| Navigate Agenda | Move to next/previous item |
| Cast Document | Sync document to all screens |
| Start Vote | Initiate voting |
| Capture Action Item | Record action during discussion |
| End Meeting | Close meeting for all |

### Business Rules

- Only Chairman or Secretary can start meeting
- Meeting can start up to 15 minutes early
- No waiting room needed (physical presence verified)
- Quorum checked before formal proceedings

---

## Flow 2: Join Physical Meeting Room (Participant)

**Actor**: Board/Committee Member  
**Flow**: Notification → Open Meeting Room → Check-In → Participate

### Steps

1. Receive notification: "Meeting has started - Join the Meeting Room"
   - Or navigate to Meeting Details page
   - Or click meeting from dashboard
2. Click "Enter Meeting Room" button
3. **Meeting Room opens on participant's device**:
   - Current agenda item displayed
   - Document viewer (synced with presenter)
   - Voting panel (when vote active)
   - Participant list
4. System auto-marks participant as "Joined"
5. Participant can:
   - View current agenda item
   - View presented document (synced)
   - Browse documents independently (unsync mode)
   - Cast vote when voting is active
   - Raise hand (digital indicator)
6. Participate in meeting

### Participant View Components

| Component | Description |
|-----------|-------------|
| Agenda Panel | Current item highlighted, can see full agenda |
| Document Viewer | Shows presenter's document or browse independently |
| Voting Panel | Appears when vote is active |
| Participant List | See who's in the room |
| Raise Hand | Digital hand raise indicator |
| Notes | Personal notes (private) |

### Business Rules

- Only invited participants can join
- Participants can join late
- Participants can leave and rejoin
- Device tracks join/leave times for attendance

---

## Flow 3: Check-In / Mark Attendance

**Actor**: Board Secretary / System  
**Flow**: Participant Joins → Auto Check-In → Secretary Verifies

### Steps

1. **Automatic check-in**:
   - When participant opens Meeting Room, system records:
     - Join time
     - Device info
     - Status: "Present"
2. **Secretary verification** (optional):
   - Secretary sees participant list
   - Can manually mark attendance:
     - Present (in room and on system)
     - Present (in room, not on system) - for tech issues
     - Absent
     - Excused
3. **Quorum tracking**:
   - System shows: "X of Y required members present"
   - Quorum indicator: Met / Not Met
   - Warning if quorum lost (member leaves)
4. **Late arrivals**:
   - System records late join time
   - Marked as "Late" in attendance record
5. **Early departures**:
   - If participant closes Meeting Room early
   - System records leave time
   - Marked as "Left Early" in attendance record

### Attendance Record

| Field | Description |
|-------|-------------|
| Participant | Name and role |
| Status | Present / Absent / Excused / Late / Left Early |
| Join Time | When they opened Meeting Room |
| Leave Time | When they closed Meeting Room |
| Duration | Total time in meeting |
| Verified By | Secretary (if manually verified) |

### Business Rules

- Attendance auto-tracked by system
- Secretary can override/correct attendance
- Quorum calculated from voting members only
- Guests not counted in quorum
- Attendance record saved with meeting minutes

---

## Flow 4: View and Navigate Agenda

**Actor**: Chairman (navigate) / All Participants (view)  
**Flow**: Meeting Room → Agenda Panel → Navigate Items → Track Progress

### Steps

1. **Agenda visible to all participants**:
   - List of agenda items with time allocations
   - Current item highlighted
   - Completed items marked with checkmark
   - Upcoming items visible
2. **Chairman navigates agenda**:
   - Click "Next Item" to advance
   - Click "Previous Item" to go back
   - Click specific item to jump
3. **All participants see current item**:
   - Item title and description
   - Allocated time
   - Presenter (if assigned)
   - Related documents
4. **Time tracking**:
   - Timer shows time spent on current item
   - Warning when exceeding allocated time
   - Total meeting time displayed
5. **Item status**:
   - Chairman can mark item as:
     - Discussed
     - Deferred
     - Action Required
     - Resolution Passed

### Agenda Item Display

```
┌─────────────────────────────────────────────────────────┐
│ CURRENT ITEM                                            │
├─────────────────────────────────────────────────────────┤
│ 4. Financial Report Q4 2024                             │
│                                                         │
│ Presenter: CFO - John Kamau                             │
│ Time Allocated: 30 minutes                              │
│ Time Elapsed: 12:45                                     │
│                                                         │
│ Documents:                                              │
│ • Q4 Financial Statements.pdf                           │
│ • Budget vs Actual Analysis.xlsx                        │
│                                                         │
│ [View Document] [Next Item] [Mark Complete]             │
└─────────────────────────────────────────────────────────┘
```

### Business Rules

- Only Chairman can navigate agenda
- All participants see same current item
- Participants can view full agenda list
- Time tracking automatic
- Agenda changes logged for minutes

---

## Flow 5: Present Documents (Casting Mode)

**Actor**: Presenter (Chairman, Secretary, or designated presenter)  
**Flow**: Select Document → Cast to All → Navigate Pages → Stop Casting

### Steps

1. **Select document to present**:
   - Click "Documents" panel
   - See list of meeting documents (board pack)
   - Click document to open
2. **Start casting**:
   - Click "Cast to All" button
   - Notification to all: "Document is being presented"
3. **Presenter controls**:
   - Navigate pages (next/previous)
   - Zoom in/out
   - Use pointer tool (highlights area)
   - Jump to specific page
4. **Participant view**:
   - Document synced to presenter's view
   - See same page as presenter
   - Can zoom on their device
   - "Synced with presenter" indicator
5. **Independent viewing** (optional):
   - Participant can click "Browse Independently"
   - Breaks sync with presenter
   - Can navigate document freely
   - Click "Sync with Presenter" to rejoin
6. **Stop casting**:
   - Presenter clicks "Stop Casting"
   - Participants return to default view

### Presenter Controls

| Control | Function |
|---------|----------|
| Cast to All | Sync document to all participants |
| Next Page | Advance to next page |
| Previous Page | Go back one page |
| Go to Page | Jump to specific page number |
| Zoom | Zoom in/out |
| Pointer | Highlight area on document |
| Stop Casting | End presentation mode |

### Business Rules

- Any participant with presenter permission can cast
- Guests can only cast during their designated time slot
- Only one document can be cast at a time
- Pages viewed are logged (for minutes)
- Participants can always browse independently

---

## Flow 6: Conduct Vote During Physical Meeting

**Actor**: Chairman  
**Flow**: Initiate Vote → Members Vote on Devices → Results Displayed

### Steps

1. Chairman announces vote verbally
2. Chairman clicks "Start Vote" in Meeting Room
3. **Vote creation modal**:
   - Enter motion/question
   - Select vote type: Yes/No/Abstain (default) or Custom
   - Set duration (optional): 2 minutes default
   - Anonymous: Yes/No
   - Require all members to vote: Yes/No
4. Click "Start Vote"
5. **Voting interface appears on ALL participant devices**:
   - Motion displayed prominently
   - Vote buttons (Yes / No / Abstain)
   - Timer countdown (if set)
   - "X of Y members have voted"
6. **Members cast votes on their devices**:
   - Tap their choice
   - Confirmation: "Vote recorded"
   - Cannot change vote after submission
7. **Guests see disabled interface**:
   - Message: "Voting members only"
   - Can observe but not vote
8. **Vote closes**:
   - Automatically when timer ends, OR
   - Chairman clicks "Close Vote", OR
   - All members have voted
9. **Results displayed on all screens**:
   ```
   ┌─────────────────────────────────────────┐
   │ VOTE RESULTS                            │
   ├─────────────────────────────────────────┤
   │ Motion: Approve Q4 Financial Report     │
   │                                         │
   │ Yes:     8 votes (62%)  ████████░░░     │
   │ No:      3 votes (23%)  ███░░░░░░░░     │
   │ Abstain: 2 votes (15%)  ██░░░░░░░░░     │
   │                                         │
   │ Result: MOTION PASSED                   │
   └─────────────────────────────────────────┘
   ```
10. Results automatically saved to meeting record

### Physical Meeting Voting Advantages

- **Speed**: All votes cast simultaneously on devices
- **Accuracy**: No counting errors
- **Privacy**: Anonymous voting truly anonymous
- **Record**: Automatic documentation
- **Quorum**: System verifies quorum before vote

### Business Rules

- Only Chairman can initiate votes
- Only voting members can vote (not guests, observers)
- Each member gets one vote
- Votes are final (no changing)
- Results recorded in meeting minutes automatically
- Anonymous votes don't show individual choices
- Quorum checked before vote starts
- If quorum not met, warning shown but vote can proceed

---

## Flow 7: Capture Minutes / Action Items

**Actor**: Board Secretary  
**Flow**: During Meeting → Capture Notes → Record Actions → Save

### Steps

1. **Secretary has Minutes Panel open**:
   - Linked to current agenda item
   - Text editor for notes
   - Action item quick-add
2. **Capture discussion notes**:
   - Type notes during discussion
   - Notes linked to agenda item
   - Timestamp auto-added
3. **Record action items**:
   - Click "Add Action Item"
   - Enter: Description, Assignee, Due Date
   - Action linked to agenda item
4. **Record resolutions**:
   - Click "Add Resolution"
   - Enter resolution text
   - Link to vote (if applicable)
   - Resolution number auto-generated
5. **Record attendance changes**:
   - If member leaves/joins during meeting
   - Note automatically added
6. **Auto-captured items**:
   - Vote results (automatic)
   - Attendance (automatic)
   - Agenda item times (automatic)
   - Documents presented (automatic)
7. **Save progress**:
   - Auto-save every 30 seconds
   - Manual save button available

### Minutes Template (Auto-generated)

```markdown
# Meeting Minutes
**Board**: KTDA Management Services
**Meeting**: Q1 2025 Board Meeting
**Date**: February 25, 2025
**Time**: 9:00 AM - 1:00 PM
**Location**: KTDA Headquarters, Boardroom A

## Attendance
| Name | Role | Status |
|------|------|--------|
| Hon. Chege Kirundi | Chairman | Present |
| Hon. David Mwangi | Vice Chairman | Present |
| ... | ... | ... |

**Quorum**: Met (12 of 15 members present)

## Agenda Items

### 1. Call to Order
- Meeting called to order at 9:05 AM by Chairman
- [Secretary notes...]

### 2. Approval of Previous Minutes
- Motion to approve minutes of Q4 2024 meeting
- **Vote**: Yes: 12, No: 0, Abstain: 0
- **Resolution 2025-001**: Minutes approved

### 3. Financial Report
- Presented by: CFO John Kamau
- Documents: Q4 Financial Statements.pdf
- [Discussion notes...]
- **Action Item**: CFO to provide detailed breakdown of marketing expenses
  - Assignee: John Kamau
  - Due: March 15, 2025

...
```

### Business Rules

- Only Secretary can edit minutes during meeting
- Minutes auto-linked to agenda items
- Action items require assignee and due date
- Resolutions auto-numbered per year
- Draft minutes available immediately after meeting
- Final minutes require Chairman approval

---

## Flow 8: End Physical Meeting

**Actor**: Chairman  
**Flow**: Conclude Agenda → End Meeting → Generate Minutes → Close

### Steps

1. Chairman completes final agenda item
2. Chairman announces meeting adjournment
3. Click "End Meeting" button
4. **Confirmation modal**:
   - "End meeting and close Meeting Room?"
   - Summary: Duration, Items Discussed, Votes Conducted
   - Options:
     - "End Meeting" - closes for all
     - "Cancel" - return to meeting
5. Click "End Meeting"
6. System actions:
   - All participant Meeting Rooms close
   - Message shown: "Meeting has ended"
   - Meeting status → "Completed"
   - Final attendance recorded
   - Draft minutes generated
7. **Post-meeting prompt** (for Secretary):
   - "Review and finalize meeting minutes?"
   - Options: "Review Now" / "Later"
8. Participants redirected to Meeting Details page
9. Meeting marked as completed

### Post-Meeting Artifacts

| Artifact | Status | Access |
|----------|--------|--------|
| Draft Minutes | Auto-generated | Secretary, Chairman |
| Attendance Record | Complete | All participants |
| Vote Results | Recorded | All participants |
| Action Items | Created | Assignees notified |
| Documents Presented | Logged | All participants |

### Business Rules

- Only Chairman can end meeting
- All participants disconnected from Meeting Room
- Attendance finalized at end time
- Draft minutes available immediately
- Secretary has 48 hours to finalize minutes
- Chairman must approve final minutes

---

## Summary: Physical Meeting Room Components

| Component | Purpose | Who Uses |
|-----------|---------|----------|
| Agenda Panel | View/navigate agenda items | All (navigate: Chairman) |
| Document Viewer | View meeting documents | All |
| Casting Mode | Sync document to all screens | Presenter |
| Voting Panel | Cast votes on motions | Voting members |
| Participant List | See who's in meeting | All |
| Attendance Panel | Mark/verify attendance | Secretary |
| Minutes Panel | Capture notes, actions, resolutions | Secretary |
| Quorum Indicator | Show quorum status | All |
| Raise Hand | Digital hand raise | All |
| Meeting Controls | Start, end, manage meeting | Chairman, Secretary |

---

## Physical vs Virtual Meeting Room Comparison

| Feature | Physical Meeting Room | Virtual Meeting Room |
|---------|----------------------|---------------------|
| Video/Audio | ❌ Not included | ✅ Jitsi integration |
| Waiting Room | ❌ Not needed | ✅ Required |
| Screen Share | ❌ Use casting mode | ✅ Jitsi screen share |
| Recording | ❌ Not applicable | ✅ Video recording |
| Agenda Viewer | ✅ Same | ✅ Same |
| Document Viewer | ✅ Same | ✅ Same |
| Voting | ✅ Same | ✅ Same |
| Attendance | ✅ Device-based + manual | ✅ Auto-tracked |
| Minutes | ✅ Same | ✅ Same |
| Chat | ⚠️ Optional | ✅ Included |

---

## Technical Implementation Notes

### Meeting Room Page Structure

```
/meetings/:meetingId/room

├── MeetingRoomPage.tsx
│   ├── AgendaPanel.tsx
│   ├── DocumentViewer.tsx
│   ├── ParticipantList.tsx
│   ├── VotingPanel.tsx
│   ├── MinutesPanel.tsx (Secretary only)
│   ├── MeetingControls.tsx (Host only)
│   └── QuorumIndicator.tsx
```

### Real-time Sync

- Use WebSocket or Server-Sent Events for:
  - Agenda navigation sync
  - Document casting sync
  - Voting state sync
  - Participant join/leave
  - Raise hand notifications

### Offline Considerations

- Cache meeting documents for offline viewing
- Queue votes if connection lost
- Sync when connection restored
- Show connection status indicator
