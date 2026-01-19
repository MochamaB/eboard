# Module 8: Meeting Minutes - User Flows

**Module**: Meeting Minutes  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Create Meeting Minutes
2. Use Minutes Template
3. Auto-Populate Minutes Data
4. Add Action Item from Minutes
5. Submit Minutes for Review
6. Review and Comment on Minutes
7. Approve Minutes (Chairman)
8. Request Minutes Revision
9. Publish Approved Minutes
10. Search and View Past Minutes

---

## Flow 1: Create Meeting Minutes

**Actor**: Board Secretary  
**Flow**: Meeting Details → Minutes Tab → Create → Edit → Save Draft

### Steps

1. Navigate to Meeting Details (completed meeting)
2. Click "Minutes" tab
3. If no minutes exist:
   - Click "Create Minutes" button
   - Options:
     - "Start from template" (recommended)
     - "Start blank"
4. **Minutes editor opens**:
   - Rich text editor with formatting toolbar
   - Auto-populated meeting details (see Flow 3)
   - Agenda structure pre-loaded
5. **Write minutes**:
   - Document discussions for each agenda item
   - Record decisions and resolutions
   - Note vote results (auto-inserted)
   - Add action items (see Flow 4)
6. **Auto-save**:
   - Draft saved every 30 seconds
   - "Last saved: 2 minutes ago" indicator
   - Manual save: Ctrl+S or "Save Draft" button
7. Click "Save Draft" when done
8. Minutes saved with status "Draft"

### Error Flows

- **Meeting not completed**: Show "Minutes can only be created after meeting ends"
- **Minutes already exist**: Show existing minutes, offer to edit
- **Connection lost**: Show "Offline - changes will sync when connected"

### Business Rules

- Only Secretary can create minutes
- One set of minutes per meeting
- Minutes start in "Draft" status
- Can be edited freely until submitted for approval
- Auto-save prevents data loss

---

## Flow 2: Use Minutes Template

**Actor**: Board Secretary  
**Flow**: Create Minutes → Select Template → Customize

### Steps

1. Click "Create Minutes" → "Start from template"
2. **Template selection**:
   - List of available templates
   - Filter by meeting type
   - Preview template structure
3. Select template (e.g., "Standard Board Meeting Minutes")
4. **Template structure applied**:
   ```
   MEETING MINUTES
   [Board Name] - [Meeting Type]
   
   1. MEETING DETAILS
      - Date: [auto-filled]
      - Time: [auto-filled]
      - Location: [auto-filled]
   
   2. ATTENDANCE
      - Present: [auto-filled from attendance]
      - Apologies: [auto-filled]
      - Guests: [auto-filled]
   
   3. APPROVAL OF PREVIOUS MINUTES
      [Secretary to complete]
   
   4. MATTERS ARISING
      [Secretary to complete]
   
   5. AGENDA ITEMS
      5.1 [Agenda Item 1 Title]
          Discussion: 
          Decision: 
      5.2 [Agenda Item 2 Title]
          ...
   
   6. DECISIONS AND RESOLUTIONS
      [Auto-populated from votes]
   
   7. ACTION ITEMS
      [Auto-populated as added]
   
   8. NEXT MEETING
      Date: 
      Time: 
   
   9. ADJOURNMENT
      Meeting adjourned at [time]
   ```
5. Fill in sections as needed
6. Save draft

### Error Flows

- **Template not found**: Show "Template no longer available"

### Business Rules

- Templates provide consistent structure
- Different templates for different meeting types
- Template is starting point, fully customizable
- Board-specific templates can be created

---

## Flow 3: Auto-Populate Minutes Data

**Actor**: System (Automatic)  
**Flow**: Create Minutes → System Populates → Secretary Reviews

### Steps

1. When minutes are created, system auto-populates:
   - **Meeting details**:
     - Board/Committee name
     - Meeting title and type
     - Date, start time, end time
     - Location (physical or virtual)
   - **Attendance** (from Attendance module):
     - Present: List of attendees
     - Apologies: Members who sent apologies
     - Absent: Members who didn't attend
     - Guests: Guest/presenter names
   - **Agenda structure**:
     - All agenda items with titles
     - Time spent on each item
     - Item status (Completed, Skipped, Postponed)
   - **Vote results** (from Voting module):
     - Motion text
     - Vote counts (Yes/No/Abstain)
     - Result (Passed/Failed)
     - For open ballots: who voted what
   - **Action items** (if created during meeting):
     - Description, assignee, due date
2. Secretary reviews auto-populated data
3. Corrects any errors or adds missing information
4. Adds discussion notes and context

### Error Flows

- **Attendance not recorded**: Show "Attendance data not available" with manual entry option

### Business Rules

- Auto-population saves time and ensures accuracy
- Secretary can edit all auto-populated content
- Vote results are read-only (cannot be modified)
- Links maintained to source data (attendance, votes)

---

## Flow 4: Add Action Item from Minutes

**Actor**: Board Secretary  
**Flow**: Writing Minutes → Add Action Item → Assign → Set Due Date

### Steps

1. While writing minutes, identify action item
2. Highlight text or click "Add Action Item" button
3. **Action item form**:
   - Description (required): "Prepare Q1 budget proposal"
   - Assigned to (required): Select board member
   - Due date (required): Date picker
   - Priority: Low / Medium / High
   - Related agenda item: Auto-linked
4. Click "Add"
5. Action item created:
   - Appears in Action Items section of minutes
   - Added to assignee's task list
   - Notification sent to assignee
6. **Action item display in minutes**:
   ```
   ACTION: Prepare Q1 budget proposal
   Assigned to: John Kamau
   Due: February 15, 2026
   Priority: High
   ```
7. Can add multiple action items

### Error Flows

- **No assignee selected**: Show "Please select who is responsible"
- **Past due date**: Show "Due date cannot be in the past"

### Business Rules

- Action items tracked in separate module
- Assignee receives notification
- Action items appear in minutes and task dashboard
- Status tracked: Open → In Progress → Completed
- Reminders sent as due date approaches

---

## Flow 5: Submit Minutes for Review

**Actor**: Board Secretary  
**Flow**: Draft Minutes → Review → Submit for Approval

### Steps

1. Complete draft minutes
2. Click "Submit for Review"
3. **Pre-submission checklist**:
   - All agenda items documented ✓
   - Attendance recorded ✓
   - Vote results included ✓
   - Action items assigned ✓
   - No empty sections ✓
4. **Submission options**:
   - Notify all board members: Yes/No
   - Allow comments: Yes (default)
   - Review deadline: 3 days (configurable)
5. Click "Submit"
6. System actions:
   - Minutes status → "Pending Review"
   - Notification sent to Chairman
   - Optional: Notification to all members
   - Review period begins
7. Success: "Minutes submitted for review"

### Error Flows

- **Incomplete sections**: Show warning with list of empty sections
- **No attendance data**: Show "Please record attendance before submitting"

### Business Rules

- Submission locks minutes from further Secretary edits
- Chairman must approve before publishing
- Members can comment during review period
- Secretary can recall submission if needed

---

## Flow 6: Review and Comment on Minutes

**Actor**: Board/Committee Member  
**Flow**: Notification → View Minutes → Add Comment → Submit

### Steps

1. Receive notification: "Minutes available for review"
2. Click link or navigate to Meeting Details → Minutes
3. View minutes in read-only mode
4. **Add comment**:
   - Highlight text to comment on
   - Or click "Add Comment" button
   - Enter comment: "I believe the vote count was 8-4, not 7-5"
   - Click "Submit Comment"
5. Comment appears in sidebar:
   - Commenter name
   - Timestamp
   - Highlighted text reference
6. **View all comments**:
   - Comments panel shows all feedback
   - Filter: All / Unresolved / Resolved
7. Secretary notified of new comments

### Error Flows

- **Review period ended**: Show "Review period has closed"
- **Not a member**: Show "You don't have access to these minutes"

### Business Rules

- All board members can comment
- Comments visible to Secretary and Chairman
- Secretary can respond to comments
- Comments can be marked as "Resolved"
- Comment history retained for audit

---

## Flow 7: Approve Minutes (Chairman)

**Actor**: Chairman  
**Flow**: Review Minutes → Review Comments → Approve

### Steps

1. Receive notification: "Minutes ready for approval"
2. Navigate to Meeting Details → Minutes
3. **Review minutes**:
   - Read full minutes content
   - Review all comments and responses
   - Verify accuracy of recorded decisions
4. **Check unresolved comments**:
   - If unresolved comments exist: Warning shown
   - Can approve anyway or request revision
5. **Approval decision**:
   - Click "Approve Minutes" (proceed to step 6)
   - Or "Request Revision" (see Flow 8)
6. **Approval confirmation**:
   - "Approve these minutes as the official record?"
   - Optional: Add approval note
   - Click "Confirm Approval"
7. System actions:
   - Minutes status → "Approved"
   - Minutes locked (read-only)
   - Approval recorded: Chairman name, date, time
   - Ready for publishing
8. Success: "Minutes approved"

### Error Flows

- **Not Chairman**: Show "Only Chairman can approve minutes"
- **Already approved**: Show "Minutes have already been approved"

### Business Rules

- Only Chairman can approve
- Approval locks minutes permanently
- Approval timestamp and name recorded
- Cannot be unapproved (new version required for corrections)
- Approved minutes can be published

---

## Flow 8: Request Minutes Revision

**Actor**: Chairman  
**Flow**: Review Minutes → Find Issues → Request Revision

### Steps

1. While reviewing minutes, identify issues
2. Click "Request Revision"
3. **Revision request form**:
   - Reason (required): "Please correct the vote count in section 5.2"
   - Specific sections to revise (optional)
   - Deadline for revision: Date picker
4. Click "Submit Request"
5. System actions:
   - Minutes status → "Revision Requested"
   - Minutes unlocked for Secretary editing
   - Notification sent to Secretary
   - Revision reason displayed
6. Secretary makes corrections
7. Secretary resubmits for review
8. Chairman reviews again

### Error Flows

- **No reason provided**: Show "Please provide revision reason"

### Business Rules

- Chairman can request unlimited revisions
- Each revision request logged
- Secretary must address all comments
- Revision history maintained
- Previous versions accessible for comparison

---

## Flow 9: Publish Approved Minutes

**Actor**: Board Secretary  
**Flow**: Approved Minutes → Publish → Distribute

### Steps

1. Navigate to approved minutes
2. Click "Publish Minutes"
3. **Publish options**:
   - Generate PDF: Yes (default)
   - Include digital signature: Yes/No
   - Distribution list: All participants (default)
   - Email notification: Yes (default)
4. Click "Publish"
5. System actions:
   - Generate official PDF
   - Apply digital signature (if enabled)
   - Minutes status → "Published"
   - Email sent to all participants with PDF attached
   - Minutes added to meeting archive
   - Minutes linked to meeting record
6. **Published minutes display**:
   - "Published on January 20, 2026"
   - "Approved by: John Kamau, Chairman"
   - Download PDF button
7. Success: "Minutes published to 15 participants"

### Error Flows

- **Not approved**: Show "Minutes must be approved before publishing"
- **PDF generation failed**: Show "Failed to generate PDF. Try again."

### Business Rules

- Only approved minutes can be published
- Published minutes are permanent record
- PDF includes board branding
- Digital signature optional but recommended
- All participants receive copy

---

## Flow 10: Search and View Past Minutes

**Actor**: Board/Committee Member  
**Flow**: Minutes Archive → Search/Filter → View → Download

### Steps

1. Navigate to Documents or Meeting Archive
2. Click "Minutes" filter or tab
3. **Search options**:
   - Keyword search: Search within minutes content
   - Date range: From/To
   - Board/Committee: Dropdown
   - Meeting type: Regular, Special, AGM, etc.
4. **Results displayed**:
   - Meeting title
   - Date
   - Board/Committee name
   - Status (Draft, Pending, Approved, Published)
   - Actions
5. Click minutes to view:
   - Full minutes displayed
   - Related documents linked
   - Recording link (if available)
   - Action items from this meeting
6. **Download options**:
   - Download PDF
   - Download Word (if available)
7. **Cross-reference**:
   - Link to meeting details
   - Link to attendance record
   - Link to vote records

### Error Flows

- **No results**: Show "No minutes found. Try different search terms."
- **No access**: Show "You don't have access to these minutes"

### Business Rules

- Users can only view minutes for their boards
- Chairman can view all 78 boards' minutes
- Published minutes always accessible
- Draft minutes only visible to Secretary
- Full-text search available

---

## Summary: Minutes Status Lifecycle

```
Draft → Pending Review → Approved → Published
          ↓
    Revision Requested → Draft (revised) → Pending Review → ...
```

**Status Definitions**:
- **Draft**: Being written, editable by Secretary
- **Pending Review**: Submitted, awaiting Chairman approval
- **Revision Requested**: Returned to Secretary for corrections
- **Approved**: Chairman approved, locked
- **Published**: Distributed to all participants

---

## Summary: Minutes Template Sections

| Section | Content | Auto-Populated |
|---------|---------|----------------|
| Meeting Details | Date, time, location | ✓ Yes |
| Attendance | Present, apologies, guests | ✓ Yes |
| Previous Minutes | Approval of last minutes | ✗ No |
| Matters Arising | Follow-up from last meeting | ✗ No |
| Agenda Items | Discussion per item | Partial (structure only) |
| Decisions | Vote results, resolutions | ✓ Yes |
| Action Items | Tasks assigned | ✓ Yes (as added) |
| Next Meeting | Date and time | ✗ No |
| Adjournment | End time | ✓ Yes |

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Minutes Editor | `/meetings/:id/minutes/edit` | Create/edit minutes |
| Minutes View | `/meetings/:id/minutes` | View minutes |
| Minutes Archive | `/minutes` | Search all minutes |
| Minutes Review | `/meetings/:id/minutes/review` | Review and comment |

---

## Summary: Key Components

| Component | Ant Design / Library | Purpose |
|-----------|---------------------|---------|
| Rich Text Editor | TinyMCE / Quill | Format minutes |
| Template Select | `Select` with preview | Choose template |
| Comment Panel | `Comment` + `List` | Review comments |
| Status Badge | `Tag` | Show minutes status |
| Action Item Form | `Form` + `Modal` | Add action items |
| PDF Generator | jsPDF / react-pdf | Generate PDF |
| Search Input | `Input.Search` | Search minutes |
| Filter Panel | `Form` + `Select` + `DatePicker` | Filter options |
| Approval Buttons | `Button` | Approve/Reject |
| Auto-save Indicator | Custom | Show save status |

