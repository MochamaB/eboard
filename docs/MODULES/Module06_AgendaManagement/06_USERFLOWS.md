# Module 6: Agenda Management - User Flows

**Module**: Agenda Management  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Create Agenda for Meeting
2. Add Agenda Item
3. Reorder Agenda Items
4. Link Document to Agenda Item
5. Create Agenda Template
6. Apply Agenda Template
7. Publish Agenda
8. Edit Published Agenda (Republish)
9. Execute Agenda During Meeting
10. Add Ad-Hoc Item During Meeting

---

## Flow 1: Create Agenda for Meeting

**Actor**: Board Secretary  
**Flow**: Meeting Details → Agenda Tab → Create Agenda → Add Items

### Steps

1. Navigate to Meeting Details page
2. Click "Agenda" tab
3. If no agenda exists:
   - Click "Create Agenda" button
   - Options:
     - "Start from scratch"
     - "Use template" (see Flow 6)
4. **Agenda editor opens**:
   - Meeting details shown at top (board, date, time)
   - Empty agenda item list
   - "+ Add Item" button
5. Add agenda items (see Flow 2)
6. Reorder items as needed (see Flow 3)
7. Click "Save Draft"
8. Agenda saved with status "Draft"

### Error Flows

- **Agenda already exists**: Show existing agenda, offer to edit
- **Meeting cancelled**: Show "Cannot create agenda for cancelled meeting"

### Business Rules

- Only Secretary can create agenda
- One agenda per meeting
- Agenda starts in "Draft" status
- Can be edited freely until published
- Auto-save every 30 seconds

---

## Flow 2: Add Agenda Item

**Actor**: Board Secretary  
**Flow**: Agenda Editor → Add Item → Enter Details → Save

### Steps

1. In Agenda Editor, click "+ Add Item"
2. **New item form**:
   - Title (required): "Approval of Previous Minutes"
   - Description (optional): Detailed explanation
   - Item Type (required):
     - Discussion Item (topic for discussion)
     - Decision Item (requires vote/resolution)
     - Information Item (report, no discussion)
     - Committee Report (report from committee)
   - Time Allocation: 15 minutes (default varies by type)
   - Presenter (optional): Select from participants
3. Click "Add"
4. Item added to agenda list
5. **Auto-numbering**:
   - Items numbered automatically: 1, 2, 3...
   - Sub-items: 2.1, 2.2, 2.3...
6. Repeat for additional items

### Error Flows

- **No title**: Show "Title is required"
- **Invalid time**: Show "Time must be at least 1 minute"

### Business Rules

- Default time by type:
  - Discussion: 15 minutes
  - Decision: 20 minutes
  - Information: 10 minutes
  - Committee Report: 15 minutes
- Presenter must be meeting participant
- Total time calculated automatically
- Warning if total exceeds meeting duration

---

## Flow 3: Reorder Agenda Items

**Actor**: Board Secretary  
**Flow**: Agenda Editor → Drag Item → Drop in New Position

### Steps

1. In Agenda Editor, view agenda items list
2. **Drag and drop**:
   - Click and hold item's drag handle (⋮⋮)
   - Drag to new position
   - Drop to place
3. **Keyboard alternative**:
   - Select item
   - Use Up/Down arrow buttons
4. Numbering updates automatically
5. **Create sub-item**:
   - Drag item slightly right under parent
   - Item becomes sub-item (e.g., 2.1)
6. Changes saved automatically

### Error Flows

- **Cannot move during meeting**: Show "Agenda locked during meeting"

### Business Rules

- Drag and drop for easy reordering
- Sub-items indent under parent
- Numbering always sequential
- Reordering allowed until agenda is published
- After publish: requires republish to reorder

---

## Flow 4: Link Document to Agenda Item

**Actor**: Board Secretary  
**Flow**: Agenda Item → Attach Document → Select/Upload → Link

### Steps

1. In Agenda Editor, click agenda item
2. Click "Attach Document" or document icon
3. **Select document**:
   - **From meeting documents**: List of already uploaded docs
   - **Upload new**: Upload new document
4. If selecting existing:
   - Check document(s) to link
   - Click "Attach"
5. If uploading new:
   - Upload file (see Document Management flows)
   - Auto-linked to this agenda item
6. Document appears under agenda item
7. **Multiple documents** can be linked to one item

### Error Flows

- **Document not found**: Show "Document no longer available"
- **No permission**: Show "You don't have access to this document"

### Business Rules

- Documents linked to agenda items appear during that item's discussion
- Same document can be linked to multiple items
- Linked documents shown in published agenda
- During meeting: documents auto-display when item is active

---

## Flow 5: Create Agenda Template

**Actor**: Board Secretary / System Admin  
**Flow**: Settings → Agenda Templates → Create → Add Items → Save

### Steps

1. Navigate to Settings → Agenda Templates
2. Click "+ New Template"
3. **Template details**:
   - Template name: "Standard Monthly Board Meeting"
   - Board type: Main Board / Subsidiary / Factory / Committee / All
   - Description (optional)
4. **Add template items**:
   - Same process as adding agenda items
   - Items are placeholders (no specific dates/presenters)
   - Example items:
     1. Call to Order (Information, 5 min)
     2. Approval of Previous Minutes (Decision, 10 min)
     3. Financial Report (Committee Report, 20 min)
     4. CEO Update (Information, 15 min)
     5. New Business (Discussion, 30 min)
     6. Any Other Business (Discussion, 15 min)
     7. Adjournment (Information, 5 min)
5. Click "Save Template"
6. Template available for future meetings

### Error Flows

- **Duplicate name**: Show "Template with this name already exists"

### Business Rules

- Templates are reusable across meetings
- Templates can be board-type specific or global
- Secretary can create templates for their boards
- Admin can create global templates
- Templates can be edited or deleted

---

## Flow 6: Apply Agenda Template

**Actor**: Board Secretary  
**Flow**: Create Agenda → Use Template → Select Template → Customize

### Steps

1. Navigate to Meeting Details → Agenda tab
2. Click "Create Agenda"
3. Select "Use Template"
4. **Template selection**:
   - List of available templates
   - Filter by board type
   - Preview template items
5. Select template (e.g., "Standard Monthly Board Meeting")
6. Click "Apply Template"
7. **Agenda populated** with template items:
   - All items copied to agenda
   - Times and types preserved
   - Presenters blank (to be assigned)
8. **Customize**:
   - Add/remove items as needed
   - Assign presenters
   - Adjust times
   - Link documents
9. Click "Save Draft"

### Error Flows

- **Template not found**: Show "Template no longer available"

### Business Rules

- Template is starting point, fully customizable
- Applying template replaces any existing draft
- Confirmation required if draft exists
- Template items can be modified for this meeting
- Original template unchanged

---

## Flow 7: Publish Agenda

**Actor**: Board Secretary  
**Flow**: Agenda Editor → Review → Publish → Notify Participants

### Steps

1. In Agenda Editor, review complete agenda
2. **Pre-publish checklist**:
   - All items have titles ✓
   - Time allocations set ✓
   - Total time within meeting duration ✓
   - Key documents attached ✓
3. Click "Publish Agenda"
4. **Confirmation dialog**:
   - "Publish agenda to all participants?"
   - "Agenda will be locked after publishing"
   - Preview of notification email
5. Click "Confirm Publish"
6. System actions:
   - Agenda status → "Published"
   - Generate PDF version of agenda
   - Send notification to all participants
   - Email includes: Agenda PDF, meeting details, join link
7. **Agenda locked**:
   - Cannot edit without republishing
   - "Edit" button shows "Republish Required"
8. Success: "Agenda published. 15 participants notified."

### Error Flows

- **Missing required fields**: Show checklist with errors
- **No items**: Show "Agenda must have at least one item"
- **Total time exceeds meeting**: Show warning, allow override

### Business Rules

- Publishing locks the agenda
- All participants receive notification
- PDF generated for offline access
- Agenda visible in Meeting Details for all participants
- Publish timestamp recorded

---

## Flow 8: Edit Published Agenda (Republish)

**Actor**: Board Secretary  
**Flow**: Published Agenda → Edit → Modify → Republish

### Steps

1. Navigate to Meeting Details → Agenda tab
2. View published agenda (locked)
3. Click "Edit Agenda"
4. **Warning dialog**:
   - "This agenda has been published"
   - "Changes will require republishing"
   - "Participants will be notified of changes"
5. Click "Continue to Edit"
6. Agenda unlocked for editing
7. Make changes:
   - Add/remove/reorder items
   - Update times
   - Change presenters
8. Click "Republish Agenda"
9. System actions:
   - New PDF generated
   - Notification sent: "Agenda Updated"
   - Email highlights changes (if possible)
   - Previous version retained for audit
10. Agenda re-locked

### Error Flows

- **Meeting already started**: Show "Cannot edit agenda during meeting"
- **Meeting completed**: Show "Cannot edit agenda after meeting"

### Business Rules

- Republishing required for any changes after publish
- Participants notified of updates
- Version history maintained
- Cannot edit during or after meeting
- Changes tracked in audit trail

---

## Flow 9: Execute Agenda During Meeting

**Actor**: Chairman  
**Flow**: During Meeting → Agenda Panel → Navigate Items → Track Progress

### Steps

1. During active meeting, view Agenda Panel
2. **Agenda display**:
   - List of all agenda items
   - Current item highlighted
   - Status indicators: Pending, In Progress, Complete, Skipped
   - Time allocated vs. time spent
3. **Start first item**:
   - Click "Start" on first item
   - Item status → "In Progress"
   - Timer starts counting
4. **During item discussion**:
   - Timer shows elapsed time
   - Warning when approaching allocated time
   - Red when over time
   - Linked documents accessible
5. **Complete item**:
   - Click "Complete" when done
   - Item status → "Complete"
   - Actual time recorded
   - Move to next item
6. **Skip item**:
   - Click "Skip" to postpone
   - Item status → "Skipped"
   - Note: "Postponed to next meeting"
7. **Navigate items**:
   - Can jump to any item (not strictly sequential)
   - Previous items remain accessible
8. All participants see current item highlighted

### Error Flows

- **Meeting not started**: Show "Start meeting first"
- **No agenda**: Show "No agenda for this meeting"

### Business Rules

- Only Chairman can control agenda execution
- All participants see current item
- Time tracking automatic
- Skipped items noted in minutes
- Actual vs. allocated time recorded for analytics

---

## Flow 10: Add Ad-Hoc Item During Meeting

**Actor**: Chairman  
**Flow**: During Meeting → Agenda Panel → Add Item → Discuss

### Steps

1. During active meeting, in Agenda Panel
2. Click "+ Add Item" (ad-hoc)
3. **Quick add form**:
   - Title (required): "Urgent: Security Incident"
   - Type: Discussion / Decision / Information
   - Time: 10 minutes (default)
4. Click "Add"
5. Item added to agenda:
   - Marked as "Ad-Hoc" or "Unplanned"
   - Can be inserted at current position or end
6. Discuss item as normal
7. Mark complete when done
8. Ad-hoc items included in meeting minutes

### Error Flows

- **No title**: Show "Title is required"

### Business Rules

- Only Chairman can add ad-hoc items
- Ad-hoc items marked distinctly
- Included in minutes with "Ad-Hoc" label
- Time tracking same as regular items
- Can be added at any point during meeting

---

## Summary: Agenda Status Lifecycle

```
Draft → Published → (Republished) → Executed → Archived
         ↓
      Locked (edit requires republish)
```

**Status Definitions**:
- **Draft**: Being created, editable
- **Published**: Sent to participants, locked
- **Executed**: Used during meeting
- **Archived**: Meeting completed, read-only

---

## Summary: Agenda Item Types

| Type | Icon | Default Time | Purpose |
|------|------|--------------|---------|
| Discussion | 💬 | 15 min | Topic for discussion, no vote |
| Decision | ✓ | 20 min | Requires vote or resolution |
| Information | ℹ️ | 10 min | Report or update, no discussion |
| Committee Report | 📋 | 15 min | Report from committee |

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Agenda Editor | `/meetings/:id/agenda/edit` | Create/edit agenda |
| Agenda View | `/meetings/:id/agenda` | View published agenda |
| Agenda Templates | `/settings/agenda-templates` | Manage templates |
| Template Editor | `/settings/agenda-templates/:id` | Edit template |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Agenda List | `List` with drag-drop | Display/reorder items |
| Item Form | `Form` + `Modal` | Add/edit agenda item |
| Type Select | `Select` | Choose item type |
| Time Input | `InputNumber` | Set time allocation |
| Timer Display | Custom | Show elapsed/remaining time |
| Status Badge | `Tag` | Show item status |
| Template Select | `Select` with preview | Choose template |
| Drag Handle | `HolderOutlined` | Reorder items |
| Document Link | `Button` + `Modal` | Attach documents |
| Progress Bar | `Progress` | Show time progress |

