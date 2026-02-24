# Pre-Meeting Phase - Backend/Frontend Gap Analysis

**Date**: February 24, 2026
**Phase**: Pre-Meeting (CRUD + Approval)
**Build Status**: ❌ 226 TypeScript Errors

---

## Executive Summary

The backend API for the pre-meeting phase is **~90% complete** with proper DTOs and endpoints. However, the frontend has **226 TypeScript build errors** caused by **schema mismatches** between backend DTOs and frontend types. The errors fall into **4 main categories**:

1. **Enum Type Mismatches** (150+ errors): `status`, `locationType`, `boardType` are strings but components expect enum literals
2. **BoardRole Structure Change** (40+ errors): Changed from `string` to `{id, code, name}` object
3. **Nullable vs Optional** (20+ errors): Backend uses `null`, frontend expects `undefined`
4. **Calendar ID Type** (5+ errors): FullCalendar expects string IDs, backend returns numbers

**Good News**: ✅ No agenda/documents/votes/minutes implementation needed for pre-meeting phase to work
**Bad News**: ❌ Frontend schemas must be fixed before backend integration can work

---

## 1. Do We Need Agenda, Documents, Votes, Minutes?

### Answer: **NO** for Pre-Meeting Phase ✅

**Pre-Meeting Phase Scope** (from FULL_STACK_IMPLEMENTATION_CHECKLIST.md):
- Create meeting (draft)
- Update meeting details
- Add/remove participants
- Manage RSVP responses
- Submit for approval
- Approve/reject meeting
- Transition meeting to scheduled status

**What IS Required:**
- ✅ Meeting CRUD endpoints (implemented)
- ✅ Participant management (implemented)
- ✅ Meeting status transitions (implemented)
- ✅ Meeting events/audit trail (implemented)
- ✅ Meeting validation (implemented)

**What is NOT Required:**
- ❌ Full agenda CRUD - only track status (`none`, `draft`, `published`)
- ❌ Document upload/management - only track count
- ❌ Voting system - only track count
- ❌ Minutes creation/editing - only track status (`none`, `draft`, `published`)

**Backend Implementation Status:**
```csharp
// Backend already has placeholder DTO for board pack status
public class BoardPackStatusDto
{
    public AgendaStatusDto Agenda { get; set; } = new();      // ✅ Status only
    public DocumentsStatusDto Documents { get; set; } = new(); // ✅ Count only
    public MinutesStatusDto Minutes { get; set; } = new();     // ✅ Status only
    public VotesStatusDto Votes { get; set; } = new();         // ✅ Count only
}
```

This is sufficient for pre-meeting phase. Full CRUD for these entities comes in Phase 3.

---

## 2. The 226 TypeScript Errors - Root Causes

### Category 1: Enum Type Mismatches (150+ errors)

**Problem**: Zod schemas define fields as `z.string()`, but React components import and use enum types that expect literal unions.

#### Error Pattern:
```typescript
// xerrors.txt:65-74
src/components/Meetings/MeetingCalendar.tsx:214:49 - error TS2322:
Type 'string' is not assignable to type '"draft" | "scheduled" | "inprogress" | "completed" | "cancelled"'.

214   <MeetingStatusBadge status={meeting.status} />
                          ~~~~~~
```

#### Root Cause:
```typescript
// ❌ CURRENT (src/types/meeting.types.ts:289)
export const MeetingSchema = z.object({
  status: z.string(),          // ← Returns string type
  locationType: z.string(),    // ← Returns string type
  boardType: z.string(),       // ← Returns string type
});

// Component expects specific enum (src/components/Meetings/MeetingStatusBadge.tsx:12)
interface MeetingStatusBadgeProps {
  status: MeetingStatus;  // ← Expects 'draft' | 'scheduled' | 'inprogress' | etc.
}
```

#### Solution:
```typescript
// ✅ FIXED - Use the enum schemas we already defined
export const MeetingSchema = z.object({
  status: MeetingStatusSchema,          // Use enum, not z.string()
  locationType: LocationTypeSchema,     // Use enum, not z.string()
  boardType: z.string(),                // Keep as string (lookup code)
});

export const MeetingListItemSchema = z.object({
  status: MeetingStatusSchema,          // Use enum
  locationType: LocationTypeSchema,     // Use enum
  boardType: z.string(),                // Keep as string
});
```

**Files Affected**: 70+ component files expecting enum types

---

### Category 2: BoardRole Structure Change (40+ errors)

**Problem**: Backend changed `boardRole` from string to object `{id, code, name}`, but many components still expect string for role comparison.

#### Error Pattern:
```typescript
// xerrors.txt:188-198
src/components/Meetings/MeetingNoticeDocument/NoticeParticipants.tsx:86:39 - error TS2345:
Argument of type '{ id: number; code: string; name: string; } | null | undefined'
is not assignable to parameter of type 'string'.

86   const priorityA = getRolePriority(a.boardRole);
                                       ~~~~~~~~~~~
```

#### Root Cause:
```typescript
// ❌ OLD CODE (expects string)
function getRolePriority(role: string): number {
  const priorities = {
    'chairman': 1,
    'secretary': 2,
    'member': 3,
  };
  return priorities[role] || 999;
}

// ✅ NEW DATA STRUCTURE (backend returns object)
{
  boardRole: {
    id: 5,
    code: "chairman",
    name: "Chairman"
  }
}
```

#### Solution:
```typescript
// ✅ FIXED - Accept object and use .code property
function getRolePriority(role: { code: string } | null | undefined): number {
  if (!role) return 999;
  const priorities = {
    'chairman': 1,
    'secretary': 2,
    'member': 3,
  };
  return priorities[role.code] || 999;
}

// Update all role comparisons
if (participant.boardRole?.code === 'chairman') { ... }  // ✅
if (participant.boardRole === 'chairman') { ... }        // ❌ OLD
```

**Files Requiring Updates**: ~15 component files using role comparisons

---

### Category 3: Nullable vs Optional Mismatches (20+ errors)

**Problem**: Backend returns `null` for optional fields, but React components expect `undefined` or don't accept `null`.

#### Error Pattern:
```typescript
// xerrors.txt:135-144
src/components/Meetings/MeetingNoticeDocument/MeetingNoticeDocument.tsx:175:9 - error TS2322:
Type 'string | null | undefined' is not assignable to type 'string | undefined'.
Type 'null' is not assignable to type 'string | undefined'.

175   parentBoardName={parentBoardName}
      ~~~~~~~~~~~~~~~
```

#### Root Cause:
```typescript
// Backend DTO (allows null)
public string? ParentBoardName { get; set; }  // Can be null

// Frontend schema (correctly handles null)
parentBoardName: z.string().nullable().optional()  // ✅ Correct

// Component props (doesn't accept null)
interface NoticeHeaderProps {
  parentBoardName?: string;  // ❌ Only allows string | undefined
}
```

#### Solution:
```typescript
// ✅ Option 1: Update component props to accept null
interface NoticeHeaderProps {
  parentBoardName?: string | null;  // Accept both undefined and null
}

// ✅ Option 2: Coalesce null to undefined when passing
<NoticeHeader
  parentBoardName={meeting.parentBoardName ?? undefined}
/>
```

**Files Requiring Updates**: ~10 component files with nullable props

---

### Category 4: Calendar ID Type Mismatch (5+ errors)

**Problem**: FullCalendar library expects string event IDs, but meetings have numeric IDs.

#### Error Pattern:
```typescript
// xerrors.txt:218-225
src/components/Meetings/MeetingsCalendarView/MeetingsCalendarView.tsx:94:9 - error TS2322:
Types of property 'id' are incompatible.
Type 'number' is not assignable to type 'string'.
```

#### Solution:
```typescript
// ✅ Convert meeting ID to string for FullCalendar
const events: EventInput[] = meetings.map(meeting => ({
  id: String(meeting.id),  // Convert number to string
  title: meeting.title,
  // ...
}));
```

---

## 3. Backend vs Frontend Schema Comparison

### ✅ MATCHING FIELDS (No Changes Needed)

| Field | Backend DTO | Frontend Schema | Status |
|-------|-------------|-----------------|--------|
| `id` | `int` | `z.number()` | ✅ Match |
| `boardId` | `int` | `z.number()` | ✅ Match |
| `title` | `string` | `z.string()` | ✅ Match |
| `description` | `string?` | `z.string().nullable().optional()` | ✅ Match |
| `meetingType` | `string` (code) | `z.string()` | ✅ Match |
| `startDate` | `string` (YYYY-MM-DD) | `z.string()` | ✅ Match |
| `startTime` | `string` (h:mm tt) | `z.string()` | ✅ Match |
| `duration` | `int` | `z.number()` | ✅ Match |
| `timezone` | `string` | `z.string()` | ✅ Match |
| `quorumPercentage` | `int` | `z.number()` | ✅ Match |
| `quorumRequired` | `int` | `z.number()` | ✅ Match |
| `expectedAttendees` | `int` | `z.number()` | ✅ Match |
| `requiresConfirmation` | `bool` | `z.boolean()` | ✅ Match |
| `isRecurring` | `bool` | `z.boolean()` | ✅ Match |
| `createdBy` | `int` | `z.number()` | ✅ Match |
| `participants` | `List<MeetingParticipantDto>` | `z.array(MeetingParticipantSchema)` | ✅ Match |

### ⚠️ MISMATCHES (Require Frontend Fixes)

| Field | Backend DTO | Frontend Schema | Fix Required |
|-------|-------------|-----------------|--------------|
| `status` | `string` (lowercase) | `z.string()` ❌ | Change to `MeetingStatusSchema` ✅ |
| `locationType` | `string` (lowercase) | `z.string()` ❌ | Change to `LocationTypeSchema` ✅ |
| `boardType` | `string` (code) | `z.string()` ✅ | Keep as string, but components need update |
| `boardRole` (participant) | `RoleDto` object | `ParticipantBoardRoleSchema` ✅ | Schema correct, components need `.code` |
| `recurrenceGroupId` | `string?` | `z.string().nullable()` ⚠️ | Backend should be `string?`, frontend OK |

### 📝 NAMING DIFFERENCES (Already Handled by Backend)

The backend DTO **already uses frontend field names** per BACKEND_FRONTEND_MAPPING.md:

| Frontend Name | Backend Entity Field | Backend DTO Field |
|--------------|---------------------|-------------------|
| `virtualMeetingLink` | `MeetingLink` | `VirtualMeetingLink` ✅ |
| `physicalAddress` | `PhysicalLocation` | `PhysicalAddress` ✅ |
| `startDate` | `ScheduledDate` | `StartDate` ✅ |
| `startTime` | `StartTime` | `StartTime` ✅ |

**Conclusion**: Backend DTOs are correctly aligned. Frontend schemas need fixing.

---

## 4. Specific Fixes Required

### Priority 1: Fix Enum Schemas (Critical)

**File**: `src/types/meeting.types.ts`

```typescript
// BEFORE (lines 245-309)
export const MeetingSchema = z.object({
  // ...
  status: z.string(),           // ❌ Wrong
  locationType: z.string(),     // ❌ Wrong
  // ...
});

export const MeetingListItemSchema = z.object({
  // ...
  status: z.string(),           // ❌ Wrong
  locationType: z.string(),     // ❌ Wrong
  // ...
});

// AFTER
export const MeetingSchema = z.object({
  // ...
  status: MeetingStatusSchema,         // ✅ Fixed
  locationType: LocationTypeSchema,    // ✅ Fixed
  // ...
});

export const MeetingListItemSchema = z.object({
  // ...
  status: MeetingStatusSchema,         // ✅ Fixed
  locationType: LocationTypeSchema,    // ✅ Fixed
  // ...
});
```

**Impact**: Fixes ~150 errors

---

### Priority 2: Fix BoardRole Comparisons (High)

**Files**: All components using role comparisons

#### Pattern 1: Role Priority/Sorting
```typescript
// src/components/Meetings/MeetingNoticeDocument/NoticeParticipants.tsx

// BEFORE
function getRolePriority(role: string): number { ... }
const priorityA = getRolePriority(a.boardRole);  // ❌ Error

// AFTER
function getRolePriority(role: { code: string } | null | undefined): number {
  if (!role) return 999;
  return ROLE_PRIORITIES[role.code] || 999;
}
const priorityA = getRolePriority(a.boardRole);  // ✅ Fixed
```

#### Pattern 2: Role Filtering
```typescript
// BEFORE
.filter(p => !IN_ATTENDANCE_ROLES.includes(p.boardRole))  // ❌ Error

// AFTER
.filter(p => !p.boardRole || !IN_ATTENDANCE_ROLES.includes(p.boardRole.code))  // ✅ Fixed
```

#### Pattern 3: Role Display
```typescript
// BEFORE
<span>{participant.boardRole}</span>  // ❌ Shows [object Object]

// AFTER
<span>{participant.boardRole?.name ?? 'No Role'}</span>  // ✅ Shows "Chairman"
```

**Files to Update**:
- `src/components/Meetings/MeetingNoticeDocument/NoticeParticipants.tsx`
- `src/components/Meetings/ParticipantList.tsx`
- `src/components/common/Agenda/AgendaItemCard.tsx` (if using roles)
- Any custom role comparison logic

**Impact**: Fixes ~40 errors

---

### Priority 3: Fix Nullable Props (Medium)

**Pattern**: Components expecting `string | undefined` but receiving `string | null | undefined`

```typescript
// OPTION 1: Update component props (preferred)
interface ComponentProps {
  parentBoardName?: string | null;  // ✅ Accept null
  locationDetails?: string | null;
  virtualMeetingLink?: string | null;
}

// OPTION 2: Coalesce when passing (if props can't change)
<Component
  parentBoardName={meeting.parentBoardName ?? undefined}
  locationDetails={meeting.locationDetails ?? undefined}
/>
```

**Files to Update**: ~10 components with strict `string | undefined` props

**Impact**: Fixes ~20 errors

---

### Priority 4: Fix Calendar ID Type (Low)

**File**: `src/components/Meetings/MeetingsCalendarView/MeetingsCalendarView.tsx`

```typescript
// BEFORE
const events: EventInput[] = meetings.map(meeting => ({
  id: meeting.id,  // ❌ number, FullCalendar expects string
  // ...
}));

// AFTER
const events: EventInput[] = meetings.map(meeting => ({
  id: String(meeting.id),  // ✅ Convert to string
  // ...
}));
```

**Impact**: Fixes ~5 errors

---

### Priority 5: Fix Board Type Enums (Low)

**Problem**: Components expect board type to be specific literals like `'main' | 'subsidiary'` but schema allows any string.

```typescript
// Component expects
interface NoticeHeaderProps {
  boardType?: 'main' | 'subsidiary' | 'committee' | 'factory';
}

// Backend sends string code (dynamic lookup)
boardType: "main"  // Could be any board type code
```

**Solution**: Either use `useLookups()` to validate, or make props accept `string`:

```typescript
// OPTION 1: Accept any string (recommended - supports custom board types)
interface NoticeHeaderProps {
  boardType?: string;
}

// OPTION 2: Use lookup validation in component
const { getBoardTypeByCode } = useLookups();
const validBoardType = getBoardTypeByCode(meeting.boardType);
```

**Impact**: Fixes ~10 errors

---

## 5. Testing Strategy

After fixes are applied, follow this testing sequence:

### Step 1: Build Check
```bash
npm run build
```
Expected: 0 errors

### Step 2: Enable Real API
```env
# .env.development.local
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Test Pre-Meeting Phase

#### 3.1 Meeting CRUD
- [ ] Create draft meeting (status: draft.incomplete)
- [ ] Update meeting details
- [ ] View meeting in list
- [ ] View meeting detail page
- [ ] Verify all fields display correctly

#### 3.2 Participant Management
- [ ] Add board member participant
- [ ] Add guest participant
- [ ] Update participant permissions
- [ ] Remove participant
- [ ] Verify RSVP status changes

#### 3.3 Meeting Validation
- [ ] Incomplete meeting shows validation errors
- [ ] Complete meeting enables submit button
- [ ] Required fields enforced

#### 3.4 Approval Workflow
- [ ] Submit meeting for approval (transition: draft.complete → scheduled.pending_approval)
- [ ] View meeting in approvals page
- [ ] Approve meeting (transition: scheduled.pending_approval → scheduled.approved)
- [ ] Reject meeting (transition: scheduled.pending_approval → scheduled.rejected)
- [ ] Resubmit after rejection (transition: scheduled.rejected → draft.complete → scheduled.pending_approval)

#### 3.5 Status Transitions
- [ ] Verify allowed transitions endpoint works
- [ ] Verify UI shows only allowed actions
- [ ] Verify meeting events audit trail records all changes

---

## 6. Implementation Checklist

### Frontend Type Fixes (Must Do First)

- [ ] **Fix `MeetingSchema` and `MeetingListItemSchema`**
  - [ ] Change `status: z.string()` → `status: MeetingStatusSchema`
  - [ ] Change `locationType: z.string()` → `locationType: LocationTypeSchema`

- [ ] **Update all role comparison functions**
  - [ ] `getRolePriority()` - accept object, use `.code`
  - [ ] `getRoleDisplayName()` - accept object, use `.name`
  - [ ] `IN_ATTENDANCE_ROLES.includes()` - check `.code` property

- [ ] **Fix component props for nullable fields**
  - [ ] `parentBoardName?: string | null`
  - [ ] `locationDetails?: string | null`
  - [ ] `virtualMeetingLink?: string | null`

- [ ] **Fix calendar ID conversion**
  - [ ] Convert `meeting.id` to string for FullCalendar events

- [ ] **Fix board type props**
  - [ ] Change strict unions to `string` or add validation

### Backend Verification (Should Already Work)

- [ ] **Verify DTO serialization**
  - [ ] Enums serialize as lowercase strings ✅ (JsonStringEnumConverter)
  - [ ] Dates format as ISO strings ✅
  - [ ] Times format as "h:mm tt" ✅

- [ ] **Verify endpoints return correct DTOs**
  - [ ] GET `/boards/{id}/meetings` → `PaginatedResponse<MeetingListItemDto>` ✅
  - [ ] GET `/meetings/{id}` → `MeetingDto` ✅
  - [ ] POST `/boards/{id}/meetings` → `MeetingDto` ✅
  - [ ] PUT `/meetings/{id}` → `MeetingDto` ✅

- [ ] **Verify permission checks work**
  - [ ] `meetings.view` policy ✅
  - [ ] `meetings.create` policy ✅
  - [ ] `meetings.edit` policy ✅
  - [ ] Board-scoped authorization ✅

### Integration Testing

- [ ] **Test with real backend**
  - [ ] Point frontend to backend API
  - [ ] Verify CORS configured correctly
  - [ ] Test meeting CRUD operations
  - [ ] Test participant management
  - [ ] Test approval workflow
  - [ ] Test status transitions

---

## 7. Summary

### ✅ What's Working

1. **Backend API** - Fully functional with proper DTOs
2. **Backend Authorization** - Permission system with caching works
3. **Backend State Machine** - Meeting status transitions validated
4. **Backend Audit Trail** - Meeting events recorded correctly
5. **API Contract** - DTOs match frontend field names

### ❌ What's Broken

1. **Frontend Type Schemas** - Using `z.string()` instead of enum schemas
2. **Frontend Role Handling** - Components expect string, receive object
3. **Frontend Nullable Handling** - Some props don't accept `null`
4. **Frontend Calendar** - Expects string IDs, receives numbers

### 🎯 Next Steps

1. **Fix frontend schemas** (30 minutes)
   - Update `MeetingSchema` and `MeetingListItemSchema` to use enum schemas

2. **Fix role comparisons** (1 hour)
   - Update all functions/filters using `boardRole` to access `.code` property

3. **Fix nullable props** (30 minutes)
   - Add `| null` to component props or use `??` operator

4. **Test integration** (2 hours)
   - Run full pre-meeting workflow with real backend
   - Verify all CRUD operations work
   - Verify approval workflow works

**Estimated Total Effort**: 4 hours to fix all frontend issues

### 🚀 After Fixes

The pre-meeting phase should be **100% functional** with:
- Meeting CRUD ✅
- Participant management ✅
- Approval workflow ✅
- Status transitions ✅
- Audit trail ✅

**No agenda/documents/votes/minutes implementation needed** - those come in Phase 3.
