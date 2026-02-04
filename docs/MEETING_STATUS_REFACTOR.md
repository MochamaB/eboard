# Meeting Status Model Refactor - Implementation Tracker

**Created:** February 4, 2026  
**Last Updated:** February 4, 2026  
**Status:** In Progress  
**Priority:** High

---

## 📋 Overview

This document tracks the implementation of the new meeting status model for eBoard. The refactor introduces a **Status + SubStatus** approach for cleaner lifecycle management, validation gates, and phase tracking.

---

## 🎯 New Model: Status + SubStatus

### Core Concept

Instead of 10 flat statuses, we use **5 primary statuses** with **contextual sub-statuses**:

```typescript
// Primary Status (5 values - lifecycle stages)
type MeetingStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// SubStatus (contextual within each status)
type DraftSubStatus = 'incomplete' | 'complete';
type ScheduledSubStatus = 'pending_approval' | 'approved' | 'rejected';
type CompletedSubStatus = 'recent' | 'archived';
// in_progress and cancelled have no subStatus
```

### Benefits
- **Simpler primary status** - Only 5 core lifecycle states
- **Clear separation** - Status = "where in lifecycle", SubStatus = "what's happening there"
- **Easier filtering** - Filter by status for broad views, subStatus for detailed
- **Direct phase mapping** - 1:1 mapping to UI phases
- **Extensible** - Can add subStatuses without changing core flow

---

## 🔄 New Status Flow

```
DRAFT                      SCHEDULED                    IN_PROGRESS    COMPLETED
┌───────────────────┐      ┌───────────────────────┐    ┌──────────┐   ┌─────────────────┐
│                   │      │                       │    │          │   │                 │
│  incomplete ─────►│─────►│  pending_approval     │    │    -     │   │  recent         │
│       │           │      │         │             │    │          │   │    │            │
│       ▼           │      │         ▼             │    │          │   │    ▼            │
│  complete ◄──────►│      │  approved ───────────►│───►│          │──►│  archived       │
│                   │      │         │             │    │          │   │                 │
└───────────────────┘      │         ▼             │    └──────────┘   └─────────────────┘
        ▲                  │  rejected ───────────►│ (back to draft.incomplete)
        │                  │                       │
        └──────────────────┴───────────────────────┘
        
                    ══════ Any status can → CANCELLED ══════
```

### Transition Rules

| From | To | Trigger |
|------|-----|---------|
| `draft.incomplete` | `draft.complete` | Validation passes (all requirements met) |
| `draft.complete` | `scheduled.pending_approval` | Submit for approval (if required) |
| `draft.complete` | `scheduled.approved` | Auto-approve (no approval required) |
| `scheduled.pending_approval` | `scheduled.approved` | Chairman approves |
| `scheduled.pending_approval` | `scheduled.rejected` | Chairman rejects |
| `scheduled.rejected` | `draft.incomplete` | User starts revision |
| `scheduled.approved` | `in_progress` | Meeting starts |
| `in_progress` | `completed.recent` | Meeting ends |
| `completed.recent` | `completed.archived` | Manual archive or auto after X days |
| Any (except archived) | `cancelled` | User cancels meeting |

---

## 📊 Status + SubStatus Definitions

### Primary Status: `draft`
Meeting is being created/configured.

| SubStatus | Description | Actions Available |
|-----------|-------------|-------------------|
| `incomplete` | Missing required items | Edit, Add participants/agenda/docs |
| `complete` | All requirements met | Submit for approval, Schedule directly |

### Primary Status: `scheduled`
Meeting is scheduled and going through approval (if required).

| SubStatus | Description | Actions Available |
|-----------|-------------|-------------------|
| `pending_approval` | Awaiting chairman sign-off | Approve, Reject, Cancel |
| `approved` | Ready to happen | Start meeting, Cancel |
| `rejected` | Needs revision | Revise (→ draft.incomplete), Cancel |

### Primary Status: `in_progress`
Meeting is currently happening. No subStatus needed.

| SubStatus | Description | Actions Available |
|-----------|-------------|-------------------|
| - | Meeting active | End meeting, Record, Vote |

### Primary Status: `completed`
Meeting has ended.

| SubStatus | Description | Actions Available |
|-----------|-------------|-------------------|
| `recent` | Active post-meeting work | Create/edit minutes, Approve votes, Action items, Resolutions |
| `archived` | Read-only historical record | View only |

### Primary Status: `cancelled`
Meeting was cancelled. Terminal state, no subStatus.

| SubStatus | Description | Actions Available |
|-----------|-------------|-------------------|
| - | Meeting cancelled | View only |

---

## 🎯 Phase Indicator Mapping

| Status | SubStatus | Phase | Step State | Visual |
|--------|-----------|-------|------------|--------|
| `draft` | `incomplete` | Pre-Meeting | active | Step 1 processing |
| `draft` | `complete` | Pre-Meeting | active (ready) | Step 1 processing ✓ |
| `scheduled` | `pending_approval` | Pre-Meeting | active | Step 1 processing |
| `scheduled` | `approved` | Pre-Meeting | completed | Step 1 ✓ |
| `scheduled` | `rejected` | Pre-Meeting | error | Step 1 ✗ |
| `in_progress` | - | During Meeting | active | Step 2 processing |
| `completed` | `recent` | Post-Meeting | active | Step 3 processing |
| `completed` | `archived` | Post-Meeting | completed | Step 3 ✓ |
| `cancelled` | - | (frozen at last phase) | cancelled | Badge shown |

---

## 🔐 Validation Service Design

### Data Sources (Hierarchical)

```
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION HIERARCHY                      │
├─────────────────────────────────────────────────────────────┤
│  1. SYSTEM DEFAULTS (base requirements)                      │
│     └── Minimum requirements for any meeting                 │
│                                                              │
│  2. BOARD SETTINGS (organization rules)                      │
│     └── Override system defaults per board                   │
│     └── e.g., "Finance Committee requires 3 participants"    │
│                                                              │
│  3. MEETING TYPE SETTINGS (per meeting type)                 │
│     └── Override board settings per meeting type             │
│     └── e.g., "Emergency meetings skip approval"             │
│                                                              │
│  4. MEETING-LEVEL OVERRIDES (per individual meeting)         │
│     └── Override for specific meeting                        │
│     └── e.g., "This meeting: docs optional (sensitive)"      │
└─────────────────────────────────────────────────────────────┘
```

### Requirements Schema

```typescript
interface MeetingRequirements {
  // Participant requirements
  minParticipants: number;
  requireChairman: boolean;
  requireSecretary: boolean;
  requireQuorum: boolean;
  
  // Agenda requirements
  minAgendaItems: number;
  agendaRequired: boolean;
  
  // Document requirements
  documentsRequired: boolean;
  requiredDocumentTypes: string[]; // e.g., ['agenda', 'notice']
  
  // Approval requirements
  requiresApproval: boolean;
  approverRoles: string[]; // e.g., ['chairman']
  
  // Overridable flags (for meeting-level exceptions)
  allowAgendaOverride: boolean;    // Can skip agenda for sensitive meetings
  allowDocumentOverride: boolean;  // Can skip docs for classified meetings
}
```

### Override Use Cases

| Scenario | Override | Reason |
|----------|----------|--------|
| Sensitive meeting | `documentsRequired: false` | Avoid document leaks before meeting |
| Classified agenda | `agendaRequired: false` | Agenda details are confidential |
| Emergency meeting | `requiresApproval: false` | No time for approval process |
| Ad-hoc meeting | `minAgendaItems: 0` | Quick sync, no formal agenda |

### Validation Flow

```
1. Load SYSTEM DEFAULTS
2. Merge with BOARD SETTINGS (if exists)
3. Merge with MEETING TYPE SETTINGS (if exists)
4. Apply MEETING-LEVEL OVERRIDES (if set by creator)
5. Validate meeting against final requirements
6. Return { isValid: boolean, errors: string[], warnings: string[] }
```

---

## 📁 Implementation Checklist

### Phase A: Foundation (Types & Mock Data)

- [ ] **A1. `src/types/meeting.types.ts`**
  - Update `MeetingStatusSchema` to 5 primary statuses: `draft`, `scheduled`, `in_progress`, `completed`, `cancelled`
  - Add `MeetingSubStatusSchema` with contextual values
  - Add `DraftSubStatus`: `incomplete`, `complete`
  - Add `ScheduledSubStatus`: `pending_approval`, `approved`, `rejected`
  - Add `CompletedSubStatus`: `recent`, `archived`
  - Update `Meeting` interface to include `subStatus` field

- [ ] **A2. `src/mocks/db/tables/meetings.ts`**
  - Update `MeetingStatus` type to 5 values
  - Add `MeetingSubStatus` type
  - Add `subStatus` field to `MeetingRow` interface
  - Update all meeting records with valid status + subStatus combinations
  - Migrate existing statuses:
    - `pending_confirmation` → `scheduled` + `pending_approval`
    - `confirmed` → `scheduled` + `approved`
    - `completed` → `completed` + `recent` or `archived`

- [ ] **A3. `src/mocks/db/queries/meetingQueries.ts`**
  - Update status references to use status + subStatus
  - Add query helpers for combined states
  - Update transition validation for new model

- [ ] **A4. `src/mocks/handlers/meetings.handlers.ts`**
  - Update status validation in handlers
  - Ensure transitions follow new flow
  - Handle subStatus in API responses

---

### Phase B: Validation Service

- [ ] **B1. `src/types/meetingRequirements.types.ts`** (NEW FILE)
  - Define `MeetingRequirements` interface
  - Define `MeetingRequirementsOverride` interface
  - Define `ValidationResult` interface

- [ ] **B2. `src/utils/meetingValidation.ts`** (NEW FILE)
  - Implement `getSystemDefaults()` - base requirements
  - Implement `getBoardRequirements(boardId)` - from board settings
  - Implement `getMeetingTypeRequirements(meetingType)` - per type
  - Implement `getMergedRequirements(meeting)` - hierarchical merge
  - Implement `validateMeeting(meeting)` - returns ValidationResult
  - Implement `canTransitionTo(meeting, targetStatus)` - transition validation

- [ ] **B3. `src/utils/meetingConfirmation.ts`**
  - Update to use new status + subStatus model
  - Update `getInitialMeetingStatus()` to return `{ status: 'draft', subStatus: 'incomplete' }`

- [ ] **B4. `src/mocks/db/tables/meetingConfirmationHistory.ts`**
  - Update event types: `confirmed` → `approved`
  - Ensure alignment with new model

- [ ] **B5. `src/mocks/db/tables/boardSettings.ts`** (UPDATE or CREATE)
  - Add meeting requirements per board
  - Add meeting type requirements
  - Add override permissions

---

### Phase C: Context & Phase Indicator

- [ ] **C1. `src/contexts/MeetingPhaseContext.tsx`**
  - Update `getPhaseInfo()` to use status + subStatus
  - Phase mapping:
    - `draft.*` → pre-meeting
    - `scheduled.*` → pre-meeting (completed if approved)
    - `in_progress` → during-meeting
    - `completed.*` → post-meeting
  - Handle `rejected` as error state
  - Handle `cancelled` as frozen state

- [ ] **C2. `src/components/common/MeetingPhaseIndicator/MeetingPhaseIndicator.tsx`**
  - Update `getStepStatus()` for new model
  - Visual states:
    - `process` for active steps
    - `finish` for completed steps
    - `error` for rejected (scheduled.rejected)
    - `wait` for future steps
  - Show subStatus context in indicator if needed

---

### Phase D: UI Components

- [ ] **D1. `src/pages/Meetings/MeetingDetailPage.tsx`**
  - Update status-based conditional rendering for status + subStatus
  - Update action buttons:
    - Draft: "Complete Setup" (when valid), "Submit for Approval"
    - Scheduled: "Approve", "Reject", "Start Meeting"
    - Completed: "Archive Meeting"
  - Show validation errors for draft.incomplete

- [ ] **D2. `src/pages/Meetings/MeetingsIndexPage.tsx`**
  - Update status filter options
  - Support filtering by status and/or subStatus
  - Update status badge display

- [ ] **D3. `src/pages/Meetings/tabs/MeetingMinutesTab.tsx`**
  - Handle `completed.archived` as read-only
  - `completed.recent` allows editing

- [ ] **D4. Status Badge Components**
  - Update to show combined status + subStatus
  - Badge colors:
    - `draft.incomplete` - grey
    - `draft.complete` - blue
    - `scheduled.pending_approval` - orange
    - `scheduled.approved` - green
    - `scheduled.rejected` - red
    - `in_progress` - blue/active
    - `completed.recent` - green
    - `completed.archived` - grey
    - `cancelled` - red/muted

---

### Phase E: Meeting Creation Flow

- [ ] **E1. `src/pages/Meetings/MeetingCreatePage.tsx`**
  - Integrate validation service
  - Show real-time configuration completeness
  - Auto-transition to `draft.complete` when requirements met
  - Show override options for sensitive meetings

- [ ] **E2. Meeting creation wizard steps**
  - Show validation status per step
  - Indicate required vs optional items
  - Allow setting overrides (skip agenda, skip docs)

---

### Phase F: API & Hooks

- [ ] **F1. `src/api/meetings.api.ts`**
  - Update status-related API calls
  - Handle subStatus in requests/responses
  - Add transition endpoints if needed

- [ ] **F2. `src/hooks/api/useMeetings.ts`**
  - Update status-based query filters
  - Add `useArchiveMeeting()` hook
  - Add `useTransitionMeetingStatus()` hook

---

### Phase G: Bug Fixes (Related)

- [ ] **G1. Fix Minutes API error handling**
  - 404 should return null, not throw error
  - Update `src/api/minutes.api.ts`
  - Update `src/hooks/api/useMinutes.ts`

---

## 📊 Progress Summary

| Phase | Description | Status | Files |
|-------|-------------|--------|-------|
| A | Foundation (Types & Mock Data) | ⬜ Not Started | 4 files |
| B | Validation Service | ⬜ Not Started | 5 files |
| C | Context & Phase Indicator | ⬜ Not Started | 2 files |
| D | UI Components | ⬜ Not Started | 4+ files |
| E | Meeting Creation Flow | ⬜ Not Started | 2 files |
| F | API & Hooks | ⬜ Not Started | 2 files |
| G | Bug Fixes | ⬜ Not Started | 2 files |

**Total Files: ~20-22 files**

---

## 🔄 Mock Data Migration

### Meetings to Update:

| Meeting ID | Current Status | New Status | New SubStatus | Reason |
|------------|----------------|------------|---------------|--------|
| mtg-001 | scheduled | scheduled | approved | Ready to happen |
| mtg-002 | completed | completed | archived | Old meeting |
| mtg-003 | draft | draft | incomplete | Being created |
| mtg-004 | pending_confirmation | scheduled | pending_approval | Awaiting approval |
| mtg-005 | confirmed | scheduled | approved | Was confirmed |
| mtg-006 | completed | completed | recent | Has draft minutes |
| mtg-007 | in_progress | in_progress | - | Currently active |
| (new) | - | draft | complete | Ready for submission |
| (new) | - | scheduled | rejected | Test rejection flow |

### Test Coverage Needed:

1. **draft.incomplete** - Meeting being created, missing requirements
2. **draft.complete** - All requirements met, ready for submission
3. **scheduled.pending_approval** - Awaiting chairman approval
4. **scheduled.approved** - Approved, ready to start
5. **scheduled.rejected** - Rejected, needs revision
6. **in_progress** - Meeting currently happening
7. **completed.recent** - Meeting ended, post-meeting work active
8. **completed.archived** - Old meeting, read-only
9. **cancelled** - Cancelled meeting

---

## ⚠️ Breaking Changes

1. **TypeScript Errors**: Changing status model will cause errors until all files updated
2. **Status values removed**: `pending_confirmation`, `confirmed`, `rejected` (now subStatuses)
3. **New subStatus field**: All meeting queries/displays must handle subStatus
4. **Meeting interface change**: `subStatus` field added to Meeting type

---

## 📝 Notes

- Implementation should follow phase order (A → B → C → D → E → F → G)
- Phase A must be completed first as all other phases depend on it
- Phase E (Creation Flow) can be deferred if time-constrained
- Test thoroughly after each phase before proceeding
- The subStatus field is optional for `in_progress` and `cancelled` statuses

---

## 🏁 Completion Criteria

- [ ] All status + subStatus transitions work correctly
- [ ] Phase indicator shows correct visual states for all combinations
- [ ] Minutes tab works for all meeting status/subStatus combinations
- [ ] No TypeScript errors
- [ ] Mock data is consistent with new model
- [ ] Validation service prevents invalid transitions
- [ ] Validation service supports hierarchical overrides

---

## 💬 Discussion: Validation Service Design

### Question: Where does validation get data from?

**Answer: Hierarchical merge from multiple sources**

```
SYSTEM DEFAULTS → BOARD SETTINGS → MEETING TYPE → MEETING OVERRIDES
```

### Data Sources:

1. **System Defaults** (`src/utils/meetingValidation.ts`)
   - Hardcoded base requirements
   - e.g., `minParticipants: 2`, `requireChairman: true`

2. **Board Settings** (`boardSettings` table/API)
   - Per-board customization
   - e.g., Finance Committee requires 3 participants

3. **Meeting Type Settings** (within board settings or separate)
   - Per meeting type rules
   - e.g., Emergency meetings skip approval

4. **Meeting-Level Overrides** (on meeting record itself)
   - Individual meeting exceptions
   - Set by creator with appropriate permissions

### Override Scenarios:

| Scenario | What to Override | Why |
|----------|------------------|-----|
| Sensitive meeting | `documentsRequired: false` | Avoid document leaks before meeting |
| Classified agenda | `agendaRequired: false` | Agenda details are confidential |
| Emergency meeting | `requiresApproval: false` | No time for approval process |
| Ad-hoc sync | `minAgendaItems: 0` | Quick meeting, no formal agenda |

### Meeting Record Fields for Overrides:

```typescript
interface Meeting {
  // ... existing fields ...
  
  // Validation overrides (set during creation)
  overrides?: {
    skipAgenda?: boolean;        // Don't require agenda
    skipDocuments?: boolean;     // Don't require documents
    skipApproval?: boolean;      // Auto-approve (if permitted)
    customMinParticipants?: number;
  };
  
  // Reason for overrides (audit trail)
  overrideReason?: string;
}
```

### Permission Check for Overrides:

Not everyone can set overrides. Typically:
- **Secretary** can request overrides
- **Chairman** must approve sensitive overrides
- **System Admin** can override anything

This can be configured in board settings:
```typescript
interface BoardSettings {
  // ... existing fields ...
  
  meetingOverridePermissions: {
    allowSecretarySkipAgenda: boolean;
    allowSecretarySkipDocuments: boolean;
    requireApprovalForOverrides: boolean;
  };
}
```

---

**Last Updated:** February 4, 2026
