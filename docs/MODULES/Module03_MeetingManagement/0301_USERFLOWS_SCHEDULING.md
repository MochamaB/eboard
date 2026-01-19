# Module 3: Meeting Management - Scheduling User Flows

**Module**: Meeting Management - Scheduling Phase  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Document

1. Create Meeting (Board)
2. Create Meeting (Committee)
3. Create Recurring Meetings
4. Edit Meeting (Before Confirmation)
5. Cancel Meeting
6. Reschedule Meeting
7. View Meetings Index Page
8. View Meeting Calendar
9. View Meeting Details
10. View Past Meetings

---

## Flow 1: Create Meeting (Board)

**Actor**: Board Secretary  
**Flow**: Meetings → Create → Select Board → Enter Details → Save

### Steps

1. Navigate to Meetings (sidebar)
2. Click "+ New Meeting" button
3. **Select Board** (CRITICAL):
   - Dropdown shows boards where user is Secretary
   - Select board (e.g., "KTDA Main Board", "KETEPA Limited")
   - Board name displayed prominently after selection
4. Select Meeting Type:
   - Regular Board Meeting
   - Special Meeting
   - Annual General Meeting
   - Emergency Meeting
5. Enter meeting details:
   - Title (required)
   - Date and Time (required)
   - Duration (default based on meeting type)
   - Location: Virtual / Physical / Hybrid
   - Description (optional)
6. **Participants** (auto-populated):
   - All board members shown with roles
   - Cannot add non-members (use Guest flow for presenters)
   - Set quorum requirement (default from board settings)
7. System checks confirmation requirement:
   - If required: Shows "This meeting requires confirmation by [Approver Name]"
   - If not required: Shows "Invitations will be sent immediately"
8. Click "Create Meeting"
9. Meeting created with status:
   - "Pending Confirmation" (if confirmation required)
   - "Scheduled" (if no confirmation required, invitations sent)
10. Redirect to Meeting Details page

### Error Flows

- **No board selected**: Show error "Please select a board"
- **Date in past**: Show error "Meeting date must be in the future"
- **Time conflict**: Show warning "Chairman has another meeting at this time"
- **Quorum impossible**: Show warning "Not enough members for quorum"

### Business Rules

- Secretary can only create meetings for boards they're Secretary of
- Main Board meetings ALWAYS require Company Secretary confirmation
- Factory board meetings: confirmation optional (per board settings)
- Meeting type can override confirmation requirement (Emergency = skip, AGM = force)

---

## Flow 2: Create Meeting (Committee)

**Actor**: Committee Secretary  
**Flow**: Meetings → Create → Select Committee → Enter Details → Save

### Steps

1. Navigate to Meetings (sidebar)
2. Click "+ New Meeting" button
3. **Select Committee** (CRITICAL):
   - Dropdown shows committees where user is Secretary
   - Committees shown with parent board: "Audit Committee (Main Board)"
   - Select committee
4. Select Meeting Type:
   - Committee Meeting (default)
   - Special Committee Meeting
5. Enter meeting details:
   - Title (required)
   - Date and Time (required)
   - Duration (default 2 hours for committees)
   - Location: Virtual / Physical / Hybrid
   - Description (optional)
6. **Participants** (auto-populated):
   - Only committee members shown (subset of parent board)
   - Roles: Committee Chairman, Committee Member, Committee Secretary
   - Set quorum (default from committee settings)
7. System checks confirmation requirement:
   - Committees: confirmation typically optional
   - If required: designated approver is Committee Chairman (default)
8. Click "Create Meeting"
9. Meeting created
10. Redirect to Meeting Details page

### Error Flows

- **No committee selected**: Show error "Please select a committee"
- **Committee inactive**: Show error "Cannot create meeting for inactive committee"

### Business Rules

- Committee meetings typically don't require confirmation (configurable)
- If confirmation required, Committee Chairman is default approver
- Parent board name always displayed with committee name
- Committee inherits parent board branding

---

## Flow 3: Create Recurring Meetings

**Actor**: Board/Committee Secretary  
**Flow**: Create Meeting → Enable Recurring → Set Pattern → Generate Series

### Steps

1. Start creating meeting (Flow 1 or 2)
2. Toggle "Recurring Meeting" ON
3. Select recurrence pattern:
   - Weekly (select days)
   - Monthly (select day of month or "first Monday", etc.)
   - Quarterly (select months)
   - Annually (select date)
4. Set recurrence details:
   - Start date
   - End date OR number of occurrences
   - Example: "12 monthly meetings starting January 2026"
5. Preview generated meetings:
   - List showing all dates
   - Highlight any conflicts
   - Option to exclude specific dates
6. Click "Create Series"
7. System creates all meetings:
   - Each meeting is independent (can be edited/cancelled individually)
   - All meetings inherit same settings
   - Status: All start as "Draft" or "Pending Confirmation"
8. Success: "12 meetings created for KETEPA Board"

### Error Flows

- **Too many meetings**: Show warning "This will create 52 meetings. Continue?"
- **Conflicts detected**: Show list of conflicting dates, allow exclusion
- **End date before start**: Show error "End date must be after start date"

### Business Rules

- Maximum 52 recurring meetings at once (1 year of weekly)
- Each meeting in series can be individually edited/cancelled
- Confirmation required for each meeting individually (not batch)
- Recurring pattern stored for reference but meetings are independent

---

## Flow 4: Edit Meeting (Before Confirmation)

**Actor**: Board/Committee Secretary  
**Flow**: Meeting Details → Edit → Modify → Save

### Steps

1. Navigate to Meeting Details page
2. Click "Edit" button
3. System checks meeting status:
   - If "Draft" or "Pending Confirmation": Allow full edit
   - If "Confirmed" or "Scheduled": See Flow 6 (Reschedule)
   - If "Completed" or "Cancelled": Edit not allowed
4. Modify allowed fields:
   - Title, Description
   - Date, Time, Duration
   - Location
   - Meeting Type
   - Quorum percentage
5. **Cannot modify**:
   - Board/Committee (must cancel and recreate)
   - Participants (managed separately)
6. Click "Save Changes"
7. If meeting was "Pending Confirmation":
   - Changes saved, still pending confirmation
   - Approver sees updated details
8. Success message displayed

### Error Flows

- **Meeting already started**: Show error "Cannot edit meeting in progress"
- **Meeting completed**: Show error "Cannot edit completed meeting"

### Business Rules

- Editing before confirmation: no re-confirmation needed
- Editing after confirmation: requires re-confirmation (see Confirmation flows)
- Audit trail maintained for all changes
- Cannot change board/committee after creation

---

## Flow 5: Cancel Meeting

**Actor**: Board/Committee Secretary  
**Flow**: Meeting Details → Cancel → Enter Reason → Confirm → Notify

### Steps

1. Navigate to Meeting Details page
2. Click "Cancel Meeting" button
3. Enter cancellation reason (required):
   - Dropdown: "Quorum not achievable", "Scheduling conflict", "Emergency", "Other"
   - Text field for additional details
4. Preview notification:
   - Shows email that will be sent to participants
   - Includes cancellation reason
5. Click "Confirm Cancellation"
6. System actions:
   - Meeting status → "Cancelled"
   - Notification sent to all participants
   - Calendar invites cancelled (.ics cancellation)
   - If meeting was confirmed: signed document marked as "Superseded"
7. Success: "Meeting cancelled. 15 participants notified."

### Error Flows

- **Meeting in progress**: Show error "Cannot cancel meeting in progress. End meeting first."
- **Meeting completed**: Show error "Cannot cancel completed meeting"

### Business Rules

- Cancelled meetings retained for audit (not deleted)
- Cancellation reason required for compliance
- If confirmed meeting cancelled, original confirmation document retained
- Guests also notified of cancellation

---

## Flow 6: Reschedule Meeting

**Actor**: Board/Committee Secretary  
**Flow**: Meeting Details → Reschedule → New Date/Time → Re-confirm (if needed)

### Steps

1. Navigate to Meeting Details page
2. Click "Reschedule" button
3. Enter new date and time
4. Optionally update:
   - Duration
   - Location
5. System checks if meeting was confirmed:
   - **If not confirmed**: Proceed to step 7
   - **If confirmed**: Show warning "This meeting was confirmed. Rescheduling requires re-confirmation."
6. If re-confirmation required:
   - Meeting status → "Pending Confirmation"
   - New confirmation document generated with updated details
   - Original confirmation marked as "Superseded"
7. Click "Reschedule Meeting"
8. System actions:
   - Update meeting details
   - Send reschedule notification to all participants
   - Update calendar invites
9. Success: "Meeting rescheduled to [new date]. Participants notified."

### Error Flows

- **New date in past**: Show error "New date must be in the future"
- **Conflict with same participants**: Show warning about conflicts

### Business Rules

- Rescheduling confirmed meeting = re-confirmation required
- Original confirmation document retained for audit
- Participants receive "Meeting Rescheduled" notification (not new invite)
- Guests also notified of reschedule

---

## Flow 7: View Meetings Index Page

**Actor**: Any Board/Committee Member  
**Flow**: Sidebar → Meetings → View Tabs → Filter → Select Meeting

### Steps

1. Navigate to Meetings (sidebar)
2. **Meetings Index Page** displays with tabs:
   - **Upcoming** (default) - Future meetings
   - **Calendar** - Calendar view
   - **Pending Confirmation** - Awaiting signature (Secretary/Approver only)
   - **Past** - Completed meetings
3. **Upcoming tab** (default view):
   - Table showing upcoming meetings
   - Columns: Title, Board/Committee, Date, Time, Status, Actions
   - Sorted by date (nearest first)
4. **Filter options** (apply to all tabs):
   - Board/Committee dropdown
   - Meeting Type dropdown
   - Date range picker
   - Search by title
5. **Organization Selector integration**:
   - If specific board selected in header: list shows only that board
   - If "KTDA Group (All)" selected: shows all user's meetings
6. Click meeting row to view details
7. Quick actions per row:
   - View, Edit (if Secretary), Join (if near start time)

### Error Flows

- **No meetings found**: Show "No upcoming meetings" with option to create

### Business Rules

- Users only see meetings for their boards/committees
- Chairman sees all 78 boards + all committees
- Default tab is "Upcoming"
- Tab badges show counts (e.g., "Pending Confirmation (3)")

---

## Flow 8: View Meeting Calendar

**Actor**: Any Board/Committee Member  
**Flow**: Meetings → Calendar Tab → Filter → Click Meeting

### Steps

1. Navigate to Meetings (sidebar)
2. Click "Calendar" tab
3. View calendar with meetings:
   - Month/Week/Day view toggle
   - Meetings color-coded by entity type:
     - Main Board: Blue
     - Committees: Purple
     - Subsidiaries: Green
     - Factories: Yellow
4. **Filter options**:
   - By board/committee (dropdown)
   - By meeting type
   - By status (Scheduled, Pending, Completed)
   - By date range
5. **Organization Selector integration**:
   - If specific board selected in header: calendar shows only that board
   - If "KTDA Group (All)" selected: shows all user's meetings
6. Click any meeting to view details
7. Hover for quick preview (title, time, status)

### Error Flows

- **No meetings found**: Show "No meetings scheduled for this period"

### Business Rules

- Users only see meetings for boards/committees they're members of
- Chairman sees all 78 boards + all committees
- Past meetings shown in lighter color
- Pending confirmation meetings shown with indicator icon

---

## Flow 9: View Meeting Details

**Actor**: Any Board/Committee Member  
**Flow**: Click Meeting → View Details → Access Documents/Agenda

### Steps

1. Click meeting from calendar or list
2. View Meeting Details page:
   - **Header**: Board/Committee name, Meeting title, Status badge
   - **Details section**:
     - Date, Time, Duration
     - Location (with join link if virtual)
     - Meeting type
     - Confirmation status
   - **Participants section**:
     - List of board/committee members with RSVP status
     - Guests/Presenters (if any) with time slots
   - **Agenda section**:
     - Linked agenda items (from Agenda module)
   - **Documents section**:
     - Board pack and meeting documents
     - Confirmation document (if confirmed)
   - **Actions section** (based on role):
     - Secretary: Edit, Cancel, Reschedule
     - Chairman: Start Meeting, Approve Confirmation
     - Member: RSVP, View Documents
3. Quick actions:
   - "Join Meeting" button (if virtual, near start time)
   - "Download Board Pack" button
   - "Add to Calendar" button

### Error Flows

- **No access**: Redirect to "Access Denied" page
- **Meeting not found**: Show "Meeting not found" error

### Business Rules

- All board/committee members can view meeting details
- Guests can only view details during their designated time slot
- Documents visible based on permissions
- Join button appears 15 minutes before meeting start

---

## Flow 10: View Past Meetings

**Actor**: Any Board/Committee Member  
**Flow**: Meetings → Past Tab → Filter → View Meeting → Access Minutes/Documents

### Steps

1. Navigate to Meetings (sidebar)
2. Click "Past" tab
3. **Past meetings list**:
   - Table showing completed meetings
   - Columns: Title, Board/Committee, Date, Attendance, Minutes Status, Actions
   - Sorted by date (most recent first)
4. **Filter options**:
   - Board/Committee dropdown
   - Meeting Type dropdown
   - Date range (default: last 12 months)
   - Year selector for older meetings
   - Search by title
5. **Minutes Status column**:
   - ✓ Approved (green)
   - ⏳ Pending Approval (yellow)
   - ○ Not Created (gray)
6. Click meeting row to view details
7. **Past Meeting Details** shows additional tabs:
   - Summary (meeting info, attendance summary)
   - Minutes (approved minutes, download)
   - Documents (board pack, all meeting documents)
   - Attendance (who attended, duration)
   - Action Items (tasks from this meeting)
   - Recording (if recorded)
8. Quick actions:
   - "Download Minutes" (if approved)
   - "Download Board Pack"
   - "View Recording" (if available)

### Error Flows

- **No past meetings**: Show "No completed meetings found"
- **Minutes not available**: Show "Minutes pending approval" or "Minutes not yet created"

### Business Rules

- Past meetings cannot be edited (read-only)
- All board/committee members can view past meetings they were invited to
- Chairman can view all past meetings across all 78 boards
- Documents remain accessible indefinitely (unless archived)
- Recordings available based on permissions
- Default date range: last 12 months (configurable)

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Meetings Index | `/meetings` | Tabbed view (Upcoming, Calendar, Pending, Past) |
| Meetings - Upcoming | `/meetings?tab=upcoming` | List upcoming meetings |
| Meetings - Calendar | `/meetings?tab=calendar` | Calendar view |
| Meetings - Pending | `/meetings?tab=pending` | Pending confirmation |
| Meetings - Past | `/meetings?tab=past` | Completed meetings |
| Meeting Create | `/meetings/create` | Create new meeting |
| Meeting Details | `/meetings/:id` | View meeting info |
| Meeting Edit | `/meetings/:id/edit` | Edit meeting details |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Board/Committee Selector | `Select` with groups | Select entity for meeting |
| Meeting Type Select | `Select` | Choose meeting type |
| Date/Time Picker | `DatePicker` + `TimePicker` | Schedule meeting |
| Recurring Pattern | `Radio.Group` + `Select` | Configure recurrence |
| Participant List | `Table` with RSVP status | Show attendees |
| Calendar View | `Calendar` or FullCalendar | Monthly/weekly view |
| Status Badge | `Tag` | Show meeting status |
| Meeting Card | `Card` | Quick meeting preview |

