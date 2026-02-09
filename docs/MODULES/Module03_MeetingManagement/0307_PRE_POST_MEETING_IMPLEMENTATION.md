# Pre-Meeting and Post-Meeting Implementation Plan

**Module**: Meeting Management - Pre/Post Meeting Phases  
**Version**: 1.0  
**Last Updated**: February 2026

---

## 1. Overview

This document details the implementation plan for the Pre-Meeting and Post-Meeting phases of the meeting lifecycle. These phases use the **Meeting Detail Page** with tab-based navigation, where actions and UI elements are controlled by the meeting's current status, sub-status, and user role.

---

## 2. Pre-Meeting Phase

### 2.1 Status Flow

```
draft.incomplete → draft.complete → scheduled.pending_approval → scheduled.approved
                                                              ↘ scheduled.rejected → (back to draft.complete)
```

### 2.2 Status Definitions

| Status | SubStatus | Description | Next Actions |
|--------|-----------|-------------|--------------|
| draft | incomplete | Missing required fields or validations failing | Complete configuration |
| draft | complete | All validations passed, ready for submission | Submit for approval |
| scheduled | pending_approval | Awaiting chairman/approver action | Approve or Reject |
| scheduled | approved | Confirmed, ready for execution | Start meeting (when time) |
| scheduled | rejected | Rejected with reason, needs revision | Revise and resubmit |

### 2.3 Tab-by-Tab Actions

#### Notice Tab

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| draft.* | View draft notice | All |
| scheduled.pending_approval | Submit for approval (if not submitted), View notice | Secretary |
| scheduled.pending_approval | Approve, Reject | Chairman/Approver |
| scheduled.approved | View approved notice, Download PDF | All |
| scheduled.rejected | View rejection reason, Edit and resubmit | Secretary |

**Implementation Requirements**
- Add "Submit for Approval" button (draft.complete + secretary)
- Add "Approve" and "Reject" buttons (pending_approval + approver role)
- Add rejection reason modal with predefined reasons
- Show approval/rejection history timeline
- PDF download for approved notices

#### Participants Tab

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| draft.* | Add/remove participants, Set roles | Secretary |
| scheduled.pending_approval | Add/remove participants | Secretary |
| scheduled.approved | View only (list finalized) | All |
| scheduled.rejected | Add/remove participants | Secretary |

**Implementation Requirements**
- Add "Add Participant" button with member/guest picker
- Add "Remove" action on each participant row
- Role assignment dropdown (chairman, secretary, member, guest)
- RSVP status display and manual override
- Quorum calculation display
- Read-only mode when approved

#### Agenda Tab

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| draft.* | Add/edit/delete/reorder items | Secretary |
| scheduled.pending_approval | Add/edit/delete/reorder items | Secretary |
| scheduled.approved | View only, Download agenda | All |
| scheduled.rejected | Add/edit/delete/reorder items | Secretary |

**Implementation Requirements**
- Add item modal with full configuration
- Drag-and-drop reordering
- Sub-item support (nested agenda)
- Time allocation per item
- Presenter assignment
- Document linking per item
- Read-only mode when approved

#### Documents Tab

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| draft.* | Upload, attach, remove documents | Secretary |
| scheduled.pending_approval | Upload, attach, remove documents | Secretary |
| scheduled.approved | View, download only | All |
| scheduled.rejected | Upload, attach, remove documents | Secretary |

**Implementation Requirements**
- Upload new document functionality
- Attach existing document from library
- Remove document from meeting
- Document categorization (board pack, presentation, reference)
- Visibility settings (all participants vs members only)
- Read-only mode when approved

#### Votes Tab (Pre-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| All pre-meeting | View placeholder message | All |

**Implementation Requirements**
- Show informational message: "Votes will be conducted during the meeting"
- Optionally show pre-configured vote templates if any

#### Minutes Tab (Pre-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| All pre-meeting | View placeholder message | All |

**Implementation Requirements**
- Show informational message: "Minutes will be available after the meeting"

#### Activity Tab

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| All | View activity timeline | All |

**Implementation Requirements**
- Show all meeting events chronologically
- Filter by event type
- Show actor, timestamp, and details for each event

---

## 3. Post-Meeting Phase

### 3.1 Status Flow

```
completed.recent → completed.archived
```

### 3.2 Status Definitions

| Status | SubStatus | Description | Next Actions |
|--------|-----------|-------------|--------------|
| completed | recent | Active post-meeting work period | Create/edit minutes, action items |
| completed | archived | Read-only historical record | View and export only |

### 3.3 Tab-by-Tab Actions

#### Notice Tab (Post-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| completed.* | View final notice, Download PDF | All |

**Implementation Requirements**
- Read-only notice display
- Show final confirmation status
- PDF download with signatures

#### Participants Tab (Post-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| completed.* | View attendance record | All |

**Implementation Requirements**
- Show final attendance (present, absent, late, left early)
- Join/leave timestamps for each participant
- Duration in meeting
- Export attendance report

#### Agenda Tab (Post-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| completed.* | View agenda with outcomes | All |

**Implementation Requirements**
- Show each item with discussion status
- Time spent vs allocated
- Linked resolutions and action items
- Deferred items highlighted

#### Documents Tab (Post-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| completed.recent | View, download, add post-meeting docs | Secretary |
| completed.archived | View, download only | All |

**Implementation Requirements**
- View and download all meeting documents
- Add post-meeting documents (recent only)
- Recording links if applicable
- Read-only when archived

#### Votes Tab (Post-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| completed.* | View all vote results | All |

**Implementation Requirements**
- List all votes conducted
- Show motion, results, outcome for each
- Detailed breakdown on click
- Link to resolutions created from votes

#### Minutes Tab (Post-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| completed.recent (no minutes) | Create minutes | Secretary |
| completed.recent (draft minutes) | Edit minutes, Submit for approval | Secretary |
| completed.recent (pending approval) | Approve minutes | Chairman |
| completed.recent (approved minutes) | View, Download, Export | All |
| completed.archived | View, Download, Export | All |

**Implementation Requirements**
- Minutes creation wizard/editor
- Rich text editing with templates
- Auto-population from meeting data (attendance, votes, resolutions)
- Approval workflow for minutes
- PDF export with signatures
- Read-only when archived

#### Activity Tab (Post-Meeting)

| Status.SubStatus | Available Actions | Who Can Act |
|------------------|-------------------|-------------|
| completed.* | View complete activity timeline | All |

**Implementation Requirements**
- Full meeting lifecycle events
- During-meeting events (joins, leaves, votes, etc.)
- Post-meeting events (minutes created, approved, etc.)

---

## 4. Cancelled State

### 4.1 Definition

Cancelled is a terminal state that can occur from any pre-meeting status.

### 4.2 Tab Behavior

All tabs become read-only with a cancellation banner showing:
- Cancellation reason
- Cancelled by (user)
- Cancellation timestamp

---

## 5. Two-Layer Permission System

### 5.1 Architecture Overview

The meeting permission system uses a **two-layer approach** that extends the existing role-based permission system.

**Layer 1: Base Permissions (Existing System)**
- Already implemented in `AuthContext` via `hasPermission(code, boardId)`
- Configured by admins in Admin Panel → Roles & Permissions
- Stored in `permissions.ts` and `rolePermissions.ts`
- Examples: `meetings.edit`, `voting.cast`, `minutes.create`

**Layer 2: Meeting Contextual Permissions (New - `useMeetingPermissions`)**
- Computed at runtime based on meeting state
- NOT configurable in UI - these are business logic rules
- Combines Layer 1 check with meeting state checks

### 5.2 How Permissions Are Checked

Each contextual permission combines both layers:

```
contextualPermission = basePermission AND meetingStateCondition
```

**Example: canApprove**
```
canApprove = 
  hasPermission('meetings.edit', boardId)           // Layer 1: base capability
  AND meeting.status === 'scheduled'                // Layer 2: status check
  AND meeting.subStatus === 'pending_approval'      // Layer 2: substatus check
  AND (user.id === meeting.approverId OR hasRole('chairman'))  // Layer 2: role check
```

### 5.3 useMeetingPermissions Hook

This hook takes inputs from existing systems and computes contextual permissions:

**Inputs (from existing systems)**
- `meeting` - from MeetingPhaseContext
- `hasPermission(code, boardId)` - from AuthContext
- `user` - from AuthContext
- `boardId` - from BoardContext

**Outputs (computed permissions)**

| Permission | Base Permission Required | Meeting State Condition |
|------------|-------------------------|------------------------|
| canEditMeeting | `meetings.edit` | draft.* OR scheduled.rejected |
| canEditParticipants | `meetings.edit` | draft.* OR scheduled.pending_approval OR scheduled.rejected |
| canEditAgenda | `meetings.edit` | draft.* OR scheduled.pending_approval OR scheduled.rejected |
| canEditDocuments | `documents.upload` | draft.* OR scheduled.pending_approval OR scheduled.rejected |
| canSubmitForApproval | `meetings.edit` | draft.complete AND user is secretary |
| canApprove | `meetings.edit` | scheduled.pending_approval AND user is approver |
| canReject | `meetings.edit` | scheduled.pending_approval AND user is approver |
| canCancel | `meetings.cancel` | pre-meeting phase |
| canCreateMinutes | `minutes.create` | completed.recent AND no minutes exist |
| canEditMinutes | `minutes.create` | completed.recent AND minutes in draft |
| canApproveMinutes | `minutes.approve` | completed.recent AND minutes pending approval |
| isReadOnly | (none) | completed.archived OR cancelled |
| canExport | `reports.export` | always (if participant) |
| canDownload | `documents.download` | always (if participant) |

### 5.4 Permission Display in UI

**Base Permissions (Layer 1)**
- Configured in: Admin Panel → Roles & Permissions
- Displayed in: Role management UI with checkboxes
- Who configures: System Admin

**Contextual Permissions (Layer 2)**
- NOT displayed as configuration options
- Manifests as: Button enabled/disabled states, action visibility
- Who configures: No one - these are business logic rules

### 5.5 UI Behavior Based on Permissions

| Scenario | UI Behavior |
|----------|-------------|
| User lacks base permission | Action button hidden entirely |
| User has base permission but meeting state doesn't allow | Button disabled with tooltip explaining why |
| User has both base permission and state allows | Button enabled and functional |
| Meeting is read-only | All edit actions hidden, read-only banner shown |

### 5.6 Integration with Existing AuthContext

The hook uses existing AuthContext methods:

```
// From AuthContext (already exists)
const { hasPermission, user } = useAuth();

// Check base permission
const canEditBase = hasPermission('meetings.edit', boardId);

// Combine with meeting state for contextual permission
const canEditMeeting = canEditBase && (
  meeting.status === 'draft' || 
  (meeting.status === 'scheduled' && meeting.subStatus === 'rejected')
);
```

No changes needed to AuthContext or the existing permission tables.

---

## 6. Implementation Plan

### Phase 1: Permission System (Week 1)

**Tasks**
1. Create meetingPermissions.types.ts with all permission definitions
2. Create useMeetingPermissions hook with computation logic
3. Enhance MeetingPhaseContext to expose permissions
4. Add unit tests for permission computation

**Deliverables**
- Permission types defined
- Hook implemented and tested
- Context enhanced

### Phase 2: Notice Tab Enhancement (Week 2 - Days 1-2)

**Tasks**
1. Add approval action buttons (Approve/Reject)
2. Create rejection reason modal
3. Implement submit for approval action
4. Add approval history display
5. Gate all actions with permissions

**Deliverables**
- Full approval workflow in Notice tab
- Actions properly gated

### Phase 3: Participants Tab Enhancement (Week 2 - Days 3-4)

**Tasks**
1. Add participant picker modal
2. Implement add/remove participant actions
3. Add role assignment functionality
4. Implement read-only mode for approved meetings
5. Add attendance display for post-meeting

**Deliverables**
- Full participant management
- Phase-aware UI

### Phase 4: Agenda Tab Enhancement (Week 2 - Day 5)

**Tasks**
1. Refactor to use MeetingPhaseContext instead of local mode logic
2. Ensure edit actions respect permissions
3. Add read-only mode styling
4. Show outcomes in post-meeting view

**Deliverables**
- Agenda tab using centralized permissions

### Phase 5: Documents Tab Enhancement (Week 3 - Days 1-2)

**Tasks**
1. Gate upload/attach/remove buttons with permissions
2. Add read-only mode for approved/archived meetings
3. Allow post-meeting document additions (completed.recent)

**Deliverables**
- Documents tab phase-aware

### Phase 6: Votes Tab Enhancement (Week 3 - Day 3)

**Tasks**
1. Add pre-meeting placeholder state
2. Enhance post-meeting results display
3. Link votes to resolutions

**Deliverables**
- Votes tab phase-aware

### Phase 7: Minutes Tab Enhancement (Week 3 - Days 4-5)

**Tasks**
1. Verify existing phase logic (already implemented)
2. Add minutes approval workflow
3. Enhance archived state handling

**Deliverables**
- Minutes tab fully functional

### Phase 8: Activity Tab Enhancement (Week 4 - Day 1)

**Tasks**
1. Add event type filtering
2. Enhance event display with more details
3. Add export functionality

**Deliverables**
- Enhanced activity timeline

### Phase 9: Integration Testing (Week 4 - Days 2-5)

**Tasks**
1. Test all status transitions
2. Test permission enforcement
3. Test role-based access
4. Fix edge cases

**Deliverables**
- Fully tested pre/post meeting functionality

---

## 7. UI/UX Guidelines

### 7.1 Read-Only Indicators

When a tab is read-only:
- Show a subtle banner: "This meeting is [approved/archived/cancelled]. Content is read-only."
- Disable all edit controls (grayed out or hidden)
- Remove action buttons that don't apply

### 7.2 Action Button Placement

- Primary actions in tab header area
- Destructive actions (remove, cancel) require confirmation
- Approval actions prominently displayed when pending

### 7.3 Status Transitions

- Show loading state during status changes
- Display success/error messages
- Refresh data after successful transitions

### 7.4 Permission Denied Handling

- Hide actions user cannot perform (preferred)
- Or show disabled with tooltip explaining why
- Never show error after click for permission issues

---

## 8. API Endpoints Required

### Pre-Meeting Actions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /meetings/{id}/submit | POST | Submit for approval |
| /meetings/{id}/approve | POST | Approve meeting |
| /meetings/{id}/reject | POST | Reject meeting |
| /meetings/{id}/cancel | POST | Cancel meeting |
| /meetings/{id}/participants | POST | Add participant |
| /meetings/{id}/participants/{pid} | DELETE | Remove participant |

### Post-Meeting Actions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /meetings/{id}/minutes | POST | Create minutes |
| /meetings/{id}/minutes | PUT | Update minutes |
| /meetings/{id}/minutes/submit | POST | Submit minutes for approval |
| /meetings/{id}/minutes/approve | POST | Approve minutes |
| /meetings/{id}/archive | POST | Archive meeting |

---

## 9. Success Criteria

1. All tabs respect meeting phase and status
2. Actions are properly gated by permissions
3. UI clearly indicates read-only states
4. Approval workflow functions end-to-end
5. Minutes workflow functions end-to-end
6. No permission-related errors in production

---

## Related Documents

- 0306_MEETING_ARCHITECTURE_OVERVIEW.md - Overall architecture
- 0308_MEETING_ROOM_IMPLEMENTATION.md - Live meeting room details
