# Module 7: Voting and Polling - User Flows

**Module**: Voting and Polling  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Create Formal Vote
2. Cast Vote (Board Member)
3. View Real-Time Vote Results
4. Close Vote and Announce Result
5. Reopen Vote (Chairman)
6. Create Informal Poll
7. Respond to Poll
8. View Vote History
9. Export Vote Results
10. Configure Board Voting Rules

---

## Flow 1: Create Formal Vote

**Actor**: Chairman  
**Flow**: During Meeting → Agenda Item → Create Vote → Configure → Launch

### Steps

1. During active meeting, navigate to Decision agenda item
2. Click "Start Vote" button
3. **Vote configuration form**:
   - Motion/Resolution text (required):
     - "Resolved: Approve the Q4 financial report as presented"
   - Vote type:
     - Yes/No/Abstain (default)
     - Multiple choice (custom options)
   - Ballot type:
     - Open ballot (votes visible to all)
     - Secret ballot (anonymous)
   - Quorum requirement (pre-filled from board settings):
     - "10 of 15 members must vote"
   - Passing threshold (pre-filled from board settings):
     - Simple Majority (>50%)
     - Two-Thirds Majority (≥66%)
     - Three-Quarters (≥75%)
     - Unanimous (100%)
   - Time limit (optional): 2 minutes
4. Click "Preview Vote"
5. **Preview shows**:
   - Motion text
   - Eligible voters (board members only)
   - Quorum and threshold requirements
6. Click "Launch Vote"
7. Vote appears on all participants' screens
8. Timer starts (if set)

### Error Flows

- **No motion text**: Show "Motion text is required"
- **Meeting not in progress**: Show "Vote can only be created during active meeting"
- **Not Chairman**: Show "Only Chairman can create votes"

### Business Rules

- Only Chairman can create formal votes
- Vote linked to current agenda item
- Guests CANNOT vote (system enforces)
- Quorum/threshold defaults from board settings
- Vote recorded in meeting minutes automatically

---

## Flow 2: Cast Vote (Board Member)

**Actor**: Board/Committee Member  
**Flow**: Vote Appears → Review Motion → Select Option → Confirm → Submit

### Steps

1. Vote notification appears on screen:
   - Modal or prominent panel
   - Motion text displayed
   - Vote options shown
2. **Eligibility check** (automatic):
   - System verifies user is voting member of this board
   - Observers see vote but cannot participate
   - Guests see message: "Guests cannot vote"
3. **Review motion**:
   - Read full motion text
   - View any linked documents
4. **Select vote option**:
   - Large, clear buttons: YES | NO | ABSTAIN
   - Or multiple choice options if configured
5. **Confirmation**:
   - "You are voting: YES. Confirm?"
   - Warning: "Vote cannot be changed after submission"
6. Click "Confirm Vote"
7. Vote submitted:
   - Confirmation: "Your vote has been recorded"
   - Button changes to "Voted ✓"
   - Cannot vote again (unless reopened)
8. See real-time vote count updating

### Error Flows

- **Not eligible**: Show "You are not eligible to vote on this board"
- **Already voted**: Show "You have already voted"
- **Vote closed**: Show "Voting has ended"
- **Connection lost**: Queue vote, submit when reconnected

### Business Rules

- Only board members with voting rights can vote
- One vote per member per motion
- Vote is final once submitted (unless Chairman reopens)
- Abstain counts toward quorum but not pass/fail
- Vote timestamp recorded

---

## Flow 3: View Real-Time Vote Results

**Actor**: All Participants  
**Flow**: Vote Active → View Progress → See Results Update

### Steps

1. While vote is active, view results panel:
   - **Quorum indicator**:
     - "8 of 10 required votes received"
     - Progress bar showing quorum progress
     - ✓ Green when quorum met
   - **Vote count** (updates in real-time):
     - For open ballot: Shows who voted what
     - For secret ballot: Shows only totals
2. **Open ballot display**:
   ```
   YES (8):  John K., Mary W., Peter M., ...
   NO (3):   James O., Sarah N., ...
   ABSTAIN (1): David L.
   ```
3. **Secret ballot display**:
   ```
   YES: 8 (67%)
   NO: 3 (25%)
   ABSTAIN: 1 (8%)
   ```
4. **Timer countdown** (if set):
   - Shows remaining time
   - Warning at 30 seconds
   - Auto-closes when timer ends
5. **Waiting indicator**:
   - "Waiting for 3 more votes..."
   - List of members who haven't voted (open ballot only)

### Error Flows

- **Results not loading**: Show "Loading results..." with retry

### Business Rules

- Results update in real-time via WebSocket
- Secret ballot never reveals individual votes
- Open ballot shows all votes to all participants
- Chairman sees who hasn't voted yet

---

## Flow 4: Close Vote and Announce Result

**Actor**: Chairman  
**Flow**: Vote Complete → Close Vote → Calculate Result → Announce

### Steps

1. Chairman monitors vote progress
2. **Auto-close triggers**:
   - All eligible members have voted, OR
   - Timer expires (if set)
3. **Manual close**:
   - Chairman clicks "Close Vote"
   - Confirmation: "Close voting now? 3 members haven't voted."
4. Vote closes:
   - No more votes accepted
   - Final calculation performed
5. **Result calculation**:
   - Check quorum: Met / Not Met
   - Calculate percentage: YES votes / (YES + NO)
   - Compare to threshold
   - Determine: PASSED or FAILED
6. **Result announcement** (displayed to all):
   ```
   ┌─────────────────────────────────────┐
   │  VOTE RESULT: PASSED ✓             │
   │                                     │
   │  Motion: Approve Q4 Financial Report│
   │                                     │
   │  YES: 10 (77%)  NO: 3 (23%)        │
   │  Abstain: 2                         │
   │                                     │
   │  Quorum: Met (15 of 12 required)   │
   │  Threshold: Simple Majority (>50%) │
   └─────────────────────────────────────┘
   ```
7. Result recorded in meeting minutes
8. Chairman proceeds to next agenda item

### Error Flows

- **Quorum not met**: Show "VOTE INVALID - Quorum not met. 8 of 10 required votes received."

### Business Rules

- Vote result is final once closed
- Quorum not met = vote invalid (not failed)
- Result automatically added to minutes
- All vote details stored for audit

---

## Flow 5: Reopen Vote (Chairman)

**Actor**: Chairman  
**Flow**: Closed Vote → Reopen → Members Revote

### Steps

1. After vote is closed, Chairman reviews result
2. If issue identified (e.g., member had technical difficulty):
   - Click "Reopen Vote"
3. **Confirmation dialog**:
   - "Reopen this vote?"
   - "All previous votes will be cleared"
   - "Members will need to vote again"
   - Enter reason: "Technical issue prevented member from voting"
4. Click "Confirm Reopen"
5. Vote reopened:
   - All previous votes cleared
   - Vote appears again on all screens
   - Members vote again
6. Reopen event logged in audit trail

### Error Flows

- **Meeting ended**: Show "Cannot reopen vote after meeting ends"

### Business Rules

- Only Chairman can reopen
- All previous votes cleared (fresh start)
- Reason required for audit trail
- Can only reopen during same meeting
- Reopen event recorded in minutes

---

## Flow 6: Create Informal Poll

**Actor**: Chairman / Secretary  
**Flow**: During Meeting → Create Poll → Configure → Launch

### Steps

1. During meeting, click "Create Poll"
2. **Poll configuration**:
   - Question: "What time works best for next meeting?"
   - Poll type:
     - Single choice (select one)
     - Multiple choice (select multiple)
   - Options:
     - Option A: "Monday 10 AM"
     - Option B: "Tuesday 2 PM"
     - Option C: "Wednesday 9 AM"
     - [+ Add Option]
   - Anonymous: Yes/No (default: Yes)
   - Allow "Other" option: Yes/No
3. Click "Launch Poll"
4. Poll appears on all participants' screens
5. **Note**: Polls are non-binding (informational only)

### Error Flows

- **No question**: Show "Question is required"
- **Less than 2 options**: Show "At least 2 options required"

### Business Rules

- Polls are informal and non-binding
- Both Chairman and Secretary can create polls
- Guests CAN respond to polls (unlike votes)
- Results shown as charts
- Not recorded in formal minutes (optional inclusion)

---

## Flow 7: Respond to Poll

**Actor**: Any Participant (including Guests)  
**Flow**: Poll Appears → Select Option(s) → Submit

### Steps

1. Poll notification appears on screen
2. View question and options
3. **Select response**:
   - Single choice: Click one option
   - Multiple choice: Check multiple options
   - Other: Enter custom response (if allowed)
4. Click "Submit Response"
5. Response recorded
6. See real-time results:
   - Bar chart or pie chart
   - Percentage for each option
   - Total responses count
7. Can change response until poll closes (unlike formal votes)

### Error Flows

- **No selection**: Show "Please select at least one option"

### Business Rules

- All participants can respond (including guests)
- Anonymous by default
- Can change response before poll closes
- Results visible in real-time
- Non-binding (informational only)

---

## Flow 8: View Vote History

**Actor**: Board/Committee Member  
**Flow**: Meeting Details → Votes Tab → View History

### Steps

1. Navigate to Meeting Details (past or current meeting)
2. Click "Votes" tab
3. **Vote history list**:
   - All votes from this meeting
   - Columns: Motion, Result, Yes/No/Abstain, Time
4. Click vote to view details:
   - Full motion text
   - Vote type (open/secret)
   - Quorum status
   - Threshold used
   - Final result
   - **For open ballot**: Individual votes
   - **For secret ballot**: Totals only
   - Timestamp
5. **Filter options**:
   - By result (Passed/Failed/Invalid)
   - By date range
6. **Cross-meeting view**:
   - Navigate to board's vote history
   - See all votes across all meetings for that board

### Error Flows

- **No votes**: Show "No votes recorded for this meeting"

### Business Rules

- All board members can view vote history
- Secret ballot votes never show individual choices
- Vote history retained permanently
- Accessible from meeting details or board dashboard

---

## Flow 9: Export Vote Results

**Actor**: Board Secretary / Chairman  
**Flow**: Vote History → Select Vote → Export → Download

### Steps

1. Navigate to vote in Vote History
2. Click "Export" button
3. **Export options**:
   - Format: PDF (default), Excel
   - Include:
     - ✓ Motion text
     - ✓ Vote summary
     - ✓ Individual votes (open ballot only)
     - ✓ Quorum and threshold details
     - ✓ Timestamp
     - ✓ Board and meeting details
4. Click "Generate Export"
5. File generated and downloaded
6. **Bulk export** (optional):
   - Select multiple votes
   - Export all as single PDF or Excel

### Error Flows

- **Export failed**: Show "Export failed. Please try again."

### Business Rules

- Secretary and Chairman can export
- Secret ballot exports show totals only
- Export includes board branding (logo, colors)
- Audit trail records who exported and when

---

## Flow 10: Configure Board Voting Rules

**Actor**: System Admin  
**Flow**: Board Settings → Voting Rules → Configure → Save

### Steps

1. Navigate to Board Management → Select Board
2. Click "Settings" → "Voting Rules"
3. **Configure voting defaults**:
   - **Quorum**:
     - Type: Percentage or Fixed Number
     - Value: 50% or "10 members"
   - **Default Passing Threshold**:
     - Simple Majority (>50%)
     - Two-Thirds (≥66%)
     - Three-Quarters (≥75%)
     - Unanimous (100%)
   - **Default Ballot Type**:
     - Open ballot
     - Secret ballot
   - **Allow proxy voting**: Yes/No
   - **Allow vote reopening**: Yes/No
4. **Special thresholds** (optional):
   - "Constitutional amendments require 75%"
   - "Budget approval requires 66%"
5. Click "Save Settings"
6. Settings apply to all future votes for this board

### Error Flows

- **Invalid quorum**: Show "Quorum cannot exceed total members"

### Business Rules

- Each board can have different voting rules
- Settings are defaults (Chairman can override per vote)
- Changes don't affect past votes
- Main Board may have stricter requirements
- Factory boards may have simpler rules

---

## Summary: Vote vs Poll Comparison

| Feature | Formal Vote | Informal Poll |
|---------|-------------|---------------|
| Purpose | Binding decision | Non-binding feedback |
| Created by | Chairman only | Chairman or Secretary |
| Who can respond | Board members only | All participants (incl. guests) |
| Can change response | No (unless reopened) | Yes (until closed) |
| Recorded in minutes | Yes (automatic) | Optional |
| Quorum required | Yes | No |
| Threshold required | Yes | No |
| Result | Passed/Failed/Invalid | Percentages |

---

## Summary: Vote Result States

| State | Condition | Display |
|-------|-----------|---------|
| **Passed** | Quorum met AND threshold met | ✓ Green "PASSED" |
| **Failed** | Quorum met AND threshold NOT met | ✗ Red "FAILED" |
| **Invalid** | Quorum NOT met | ⚠ Yellow "INVALID - Quorum not met" |

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Vote Panel | (In-meeting component) | Create and display votes |
| Poll Panel | (In-meeting component) | Create and display polls |
| Vote History | `/meetings/:id/votes` | View past votes |
| Board Vote History | `/boards/:id/votes` | All votes for a board |
| Voting Settings | `/boards/:id/settings/voting` | Configure rules |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Vote Modal | `Modal` | Display vote to participants |
| Vote Buttons | `Button` (large) | YES / NO / ABSTAIN |
| Progress Bar | `Progress` | Quorum progress |
| Result Card | `Card` + `Result` | Display vote outcome |
| Vote Chart | `Pie` / `Bar` (Ant Charts) | Visualize results |
| Timer | Custom | Countdown for timed votes |
| Voter List | `List` | Show who voted (open ballot) |
| Poll Options | `Radio.Group` / `Checkbox.Group` | Poll responses |
| Settings Form | `Form` + `InputNumber` + `Select` | Configure voting rules |

