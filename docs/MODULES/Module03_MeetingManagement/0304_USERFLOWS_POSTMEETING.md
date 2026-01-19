# Module 3: Meeting Management - Post-Meeting User Flows

**Module**: Meeting Management - Post-Meeting Phase  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Document

1. Create Meeting Minutes
2. Review and Approve Minutes
3. Create Action Items
4. Track and Update Action Items
5. Complete Action Item
6. Generate Meeting Report

---

## Flow 1: Create Meeting Minutes

**Actor**: Board Secretary  
**Flow**: Completed Meeting → Create Minutes → Draft Content → Save

### Steps

1. Navigate to completed meeting (status: "Completed")
2. Click "Create Minutes" button
3. System pre-populates template with:
   - Meeting details (date, time, location, board name)
   - Attendees list (from attendance tracking)
   - Absentees list (with apologies noted)
   - Agenda items (from meeting agenda)
   - Votes conducted (with results)
4. Secretary drafts minutes content:
   - **Opening**: Meeting called to order, quorum confirmed
   - **Per agenda item**:
     - Discussion summary
     - Decisions made
     - Action items arising
   - **Votes**: Motion, proposer, seconder, result
   - **Closing**: Next meeting date, adjournment time
5. **Rich text editor** with formatting:
   - Headers, bold, italic
   - Bullet points, numbered lists
   - Tables
6. **Auto-save** every 30 seconds
7. Click "Save Draft" to save and continue later
8. Click "Submit for Approval" when complete
9. Minutes status → "Pending Approval"
10. Notification sent to Chairman for review

### Error Flows

- **Meeting not completed**: Show "Minutes can only be created after meeting ends"
- **Minutes already exist**: Show "Minutes already created. Edit existing?"
- **Lost connection**: Auto-saved draft preserved

### Business Rules

- Only Secretary can create minutes
- Minutes must be created within 7 days of meeting (configurable)
- Attendance auto-populated from video conference data
- Votes auto-populated from in-meeting voting
- Draft can be edited until submitted for approval

---

## Flow 2: Review and Approve Minutes

**Actor**: Chairman  
**Flow**: Notification → Review Minutes → Approve/Request Changes

### Steps

1. Chairman receives notification: "Minutes ready for approval"
2. Navigate to Meeting Details → Minutes tab
3. Review minutes content:
   - Check accuracy of discussions
   - Verify decisions recorded correctly
   - Confirm action items are clear
   - Verify attendance is accurate
4. **Option A: Approve**
   - Click "Approve Minutes"
   - Confirmation: "Approve these minutes?"
   - Minutes status → "Approved"
   - Notification sent to all board members
   - Minutes available for download
5. **Option B: Request Changes**
   - Click "Request Changes"
   - Enter comments/corrections needed
   - Example: "Please add John's comments on budget item"
   - Minutes status → "Changes Requested"
   - Notification sent to Secretary
   - Secretary revises and resubmits

### Error Flows

- **No minutes to review**: Show "Minutes not yet submitted"

### Business Rules

- Only Chairman can approve minutes
- Approved minutes cannot be edited (audit trail)
- If changes needed, Secretary revises and resubmits
- Approval timestamp recorded
- Approved minutes distributed to all board members
- Guests receive minutes only if Chairman granted permission

---

## Flow 3: Create Action Items

**Actor**: Board Secretary  
**Flow**: During Minutes Creation OR Separately → Add Action Item → Assign → Set Due Date

### Steps

1. **Option A: During minutes creation**
   - While drafting minutes, click "Add Action Item"
   - Action item linked to current agenda item
2. **Option B: From meeting details**
   - Navigate to Meeting Details → Action Items tab
   - Click "+ New Action Item"
3. Enter action item details:
   - Title (required): "Submit Q4 financial report"
   - Description: Detailed explanation
   - Assignee (required): Select from board members
   - Due date (required)
   - Priority: High / Medium / Low
   - Related agenda item (optional)
4. Click "Create Action Item"
5. System actions:
   - Action item created and linked to meeting
   - Notification sent to assignee
   - Email: "New action item assigned: [Title]"
6. Action item appears in:
   - Meeting's action items list
   - Assignee's personal action items dashboard
   - Board's action items report

### Error Flows

- **No assignee selected**: Show "Please select an assignee"
- **Due date in past**: Show "Due date must be in the future"
- **Assignee not a board member**: Show "Assignee must be a board member"

### Business Rules

- Action items linked to originating meeting
- Assignee must be member of the board/committee
- Due date required for tracking
- Multiple action items can be assigned to same person
- Action items carry forward until completed

---

## Flow 4: Track and Update Action Items

**Actor**: Assignee / Board Secretary  
**Flow**: Action Items Dashboard → View → Update Progress

### Steps

1. Navigate to Action Items (sidebar) or Dashboard widget
2. View action items list:
   - Filter by: Board, Status, Assignee, Due date
   - Sort by: Due date (default), Priority, Status
   - Group by: Board, Meeting, Assignee
3. **Status indicators**:
   - 🔵 Not Started
   - 🟡 In Progress
   - 🟢 Completed
   - 🔴 Overdue
4. Click action item to view details
5. **Update progress**:
   - Change status: Not Started → In Progress → Completed
   - Add progress notes: "Draft report completed, pending review"
   - Attach documents (if applicable)
6. Click "Save Update"
7. Progress history recorded with timestamp

### Error Flows

- **No action items**: Show "No action items found"

### Business Rules

- Assignee can update their own action items
- Secretary can update any action item for their board
- Progress notes create audit trail
- Overdue items highlighted in red
- Reminders sent 3 days before due date
- Escalation to Chairman if overdue > 7 days

---

## Flow 5: Complete Action Item

**Actor**: Assignee  
**Flow**: Action Item → Mark Complete → Add Completion Notes → Submit

### Steps

1. Navigate to action item
2. Click "Mark as Complete"
3. **Completion modal**:
   - Add completion notes (optional but recommended)
   - Attach deliverables (documents, reports)
   - Confirm completion
4. Click "Complete"
5. System actions:
   - Status → "Completed"
   - Completion date recorded
   - Notification sent to Secretary
   - Action item removed from "pending" lists
6. Action item remains visible in meeting history

### Error Flows

- **Already completed**: Show "Action item already completed"

### Business Rules

- Only assignee or Secretary can mark complete
- Completion date auto-recorded
- Completed items visible in reports
- Cannot "uncomplete" (create new item if needed)
- Completion notes help with future reference

---

## Flow 6: Generate Meeting Report

**Actor**: Board Secretary / Chairman  
**Flow**: Meeting Details → Generate Report → Select Format → Download

### Steps

1. Navigate to completed meeting
2. Click "Generate Report" button
3. **Select report type**:
   - **Summary Report**: Key decisions and action items
   - **Full Minutes**: Complete approved minutes
   - **Attendance Report**: Who attended, duration
   - **Action Items Report**: All action items with status
4. **Select format**:
   - PDF (default)
   - Word (.docx)
   - Excel (for attendance/action items)
5. **Customize** (optional):
   - Include/exclude sections
   - Add cover page
   - Include board branding
6. Click "Generate"
7. Report generated and downloaded
8. Copy saved to meeting documents

### Error Flows

- **Minutes not approved**: Show "Full minutes report requires approved minutes"
- **Generation failed**: Show "Report generation failed. Try again."

### Business Rules

- Summary report available immediately after meeting
- Full minutes report requires approved minutes
- Reports include board branding (logo, colors)
- Reports stored with meeting documents
- Chairman can generate reports for any board
- Members can only generate for their boards

---

## Summary: Action Item Lifecycle

```
Created → Not Started → In Progress → Completed
                ↓
            Overdue (if past due date and not completed)
```

**Notifications**:
- Created: Assignee notified
- 3 days before due: Reminder to assignee
- Overdue: Escalation to Secretary
- 7+ days overdue: Escalation to Chairman
- Completed: Secretary notified

---

## Summary: Minutes Lifecycle

```
Draft → Pending Approval → Approved
              ↓
        Changes Requested → (back to Draft)
```

**Timeline**:
- Meeting ends → Secretary has 7 days to create minutes
- Minutes submitted → Chairman has 3 days to review
- Approved → Distributed to all members within 24 hours

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Minutes Editor | `/meetings/:id/minutes/edit` | Create/edit minutes |
| Minutes View | `/meetings/:id/minutes` | View approved minutes |
| Action Items List | `/action-items` | All action items dashboard |
| Action Item Detail | `/action-items/:id` | View/update action item |
| Meeting Report | `/meetings/:id/report` | Generate reports |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Rich Text Editor | Custom (Quill/TipTap) | Draft minutes content |
| Action Item Card | `Card` | Display action item |
| Status Tag | `Tag` with colors | Show status |
| Progress Timeline | `Timeline` | Show update history |
| Due Date Badge | `Badge` | Highlight overdue |
| Report Generator | `Modal` + `Radio.Group` | Select report options |
| Assignee Select | `Select` with search | Choose assignee |
| Priority Select | `Select` | Set priority level |

