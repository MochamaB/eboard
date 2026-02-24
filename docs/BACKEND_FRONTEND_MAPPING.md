# Backend ↔ Frontend Field Mapping Guide

This document maps the differences between the backend entities and frontend TypeScript types to ensure proper API response formatting.

---

## 1. ID Type Alignment

### Decision: Frontend Adapts to Integer IDs ✅

The backend uses integer auto-increment primary keys (industry standard for relational databases). The frontend will be updated to use integers instead of strings.

**Why integers over strings:**
- ✅ 3-5x faster database performance (indexing, joins)
- ✅ Smaller storage footprint (4 bytes vs 36+ for UUIDs)
- ✅ No collision risk with auto-increment
- ✅ Type safety - clear distinction from string fields

| Entity | Current Frontend | Backend Type | Frontend Change |
|--------|-----------------|--------------|-----------------|
| Meeting.id | `z.string()` | `int` | Change to `z.number()` |
| Meeting.boardId | `z.string()` | `int` | Change to `z.number()` |
| Participant.id | `z.string()` | `int` | Change to `z.number()` |
| Participant.userId | `z.union([z.string(), z.number()])` | `int` | Change to `z.number()` |
| MeetingEvent.id | `z.string()` | `int` | Change to `z.number()` |
| MeetingEvent.meetingId | `z.string()` | `int` | Change to `z.number()` |

### Frontend Type Changes Required

```typescript
// src/types/meeting.types.ts - BEFORE
export const MeetingSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  // ...
});

// src/types/meeting.types.ts - AFTER
export const MeetingSchema = z.object({
  id: z.number(),
  boardId: z.number(),
  // ...
});
```

### URL Parameter Handling

React Router params are always strings, so parse them:
```typescript
const { meetingId } = useParams();
const id = Number(meetingId);
// Then use: useMeeting(id)
```

### Backend DTO Format

Backend returns integers directly (JSON numbers):
```csharp
public class MeetingDto
{
    public int Id { get; set; }       // Returns as JSON number
    public int BoardId { get; set; }  // Returns as JSON number
    // ...
}
```

---

## 2. Field Name Mismatches

### Meeting Entity

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `startDate` | `ScheduledDate` | Frontend: ISO string "YYYY-MM-DD", Backend: DateTime |
| `startTime` | `StartTime` | Frontend: string "HH:mm", Backend: TimeSpan |
| `endDateTime` | *calculated* | Frontend expects this, calculate from ScheduledDate + StartTime + Duration |
| `physicalAddress` | `PhysicalLocation` | Name difference only |
| `virtualMeetingLink` | `MeetingLink` | Name difference only |
| `meetingType` | `MeetingType.Code` | Frontend: string enum, Backend: FK to lookup |
| `boardName` | `Board.Name` | Navigation property |
| `boardType` | `Board.BoardType` | Navigation property |
| `createdByName` | `Creator.FullName` | Navigation property |
| `createdBy` | `CreatedBy` | Frontend: string, Backend: int |
| `cancelledBy` | `CancelledBy` | Frontend: number, Backend: int? |

### MeetingParticipant Entity

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `name` | `User.FullName` | Navigation property |
| `email` | `User.Email` | Navigation property |
| `avatar` | `User.AvatarUrl` | Navigation property |
| `boardRole` | `Role` | Complex: need role details |
| `rsvpStatus` | `RsvpStatus` | Frontend missing 'pending' value |
| `isGuest` | *derived* | Check if `RoleTitle` contains "Guest" or similar |
| `guestRole` | `RoleTitle` | When user is a guest |
| `timeSlotStart` | `PresentationStartTime` | DateTime to string |
| `timeSlotEnd` | `PresentationEndTime` | DateTime to string |
| `canViewDocuments` | `CanViewBoardDocuments` | Name difference |
| `receiveMinutes` | *missing* | **ADD TO BACKEND** |

### MeetingEvent Entity

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `eventType` | `EventType` | Both strings, match |
| `performedBy` | `PerformedBy` | Frontend: number, Backend: int |
| `performedByName` | `PerformedByName` | Both strings, match |
| `performedAt` | `PerformedAt` | Frontend: string, Backend: DateTime |
| `metadata` | `Metadata` | Both JSON objects |
| `createdAt` | `CreatedAt` | BaseEntity provides this |

---

## 3. Missing Fields in Backend

### Meeting Entity - Fields to Add

```csharp
// Fields needed for frontend compatibility
public string? ParentBoardId { get; set; }     // For committee meetings (FK to parent board)
public bool IsRecurring { get; set; }          // Recurrence flag
public string? RecurrencePattern { get; set; } // JSON for recurrence config
public string? RecurrenceGroupId { get; set; } // Group ID for recurring meetings
public int ExpectedAttendees { get; set; }     // Calculated or stored
```

### Meeting Entity - Confirmation Fields (Overlap with Status)

The frontend has redundant confirmation tracking:
- `confirmationStatus` ('pending' | 'approved' | 'rejected')
- `confirmedBy`, `confirmedByName`, `confirmedAt`
- `rejectionReason`, `confirmationDocumentUrl`

**Backend Approach**: Use Status + SubStatus model instead:
- `scheduled.pending_approval` = confirmationStatus: 'pending'
- `scheduled.approved` = confirmationStatus: 'approved'
- `scheduled.rejected` = confirmationStatus: 'rejected'

The confirmedBy/At and rejectionReason are stored in MeetingEvent metadata.

### MeetingParticipant Entity - Fields to Add

```csharp
public bool ReceiveMinutes { get; set; } = false; // Missing field
```

---

## 4. RSVP Status Mismatch

| Frontend Values | Backend Enum Values |
|----------------|---------------------|
| 'accepted' | Accepted |
| 'declined' | Declined |
| 'tentative' | Tentative |
| 'no_response' | NoResponse |
| *missing* | **Pending** |

**Resolution Options**:
1. Add 'pending' to frontend RSVPStatusSchema
2. Map backend 'Pending' to frontend 'no_response'

**Recommendation**: Add 'pending' to frontend (it's used in mock data already).

---

## 5. DTO Structures for API Responses

### MeetingDto (Full Detail)

```csharp
public class MeetingDto
{
    // IDs as integers (frontend will adapt)
    public int Id { get; set; }
    public int BoardId { get; set; }

    // Board info (from navigation)
    public string BoardName { get; set; }
    public string BoardType { get; set; }
    public int? ParentBoardId { get; set; }
    public string? ParentBoardName { get; set; }

    // Basic info
    public string Title { get; set; }
    public string? Description { get; set; }
    public string MeetingType { get; set; } // MeetingType.Code

    // Schedule - FRONTEND FIELD NAMES
    public string StartDate { get; set; }      // Format: "YYYY-MM-DD"
    public string StartTime { get; set; }      // Format: "HH:mm"
    public int Duration { get; set; }          // Minutes
    public string EndDateTime { get; set; }    // Calculated ISO datetime
    public string Timezone { get; set; }

    // Location - FRONTEND FIELD NAMES
    public string LocationType { get; set; }
    public string? LocationDetails { get; set; }
    public string? VirtualMeetingLink { get; set; }  // Backend: MeetingLink
    public string? PhysicalAddress { get; set; }     // Backend: PhysicalLocation

    // Participants
    public List<MeetingParticipantDto> Participants { get; set; }
    public int QuorumPercentage { get; set; }
    public int QuorumRequired { get; set; }
    public int ExpectedAttendees { get; set; }

    // Confirmation (derived from status)
    public bool RequiresConfirmation { get; set; }
    public string? ConfirmationStatus { get; set; }  // Derived from SubStatus
    public int? ConfirmedBy { get; set; }
    public string? ConfirmedByName { get; set; }
    public string? ConfirmedAt { get; set; }
    public string? RejectionReason { get; set; }
    public string? ConfirmationDocumentUrl { get; set; }

    // Status
    public string Status { get; set; }
    public string? SubStatus { get; set; }
    public string StatusUpdatedAt { get; set; }

    // Overrides
    public MeetingOverridesDto? Overrides { get; set; }
    public string? OverrideReason { get; set; }

    // Recurrence
    public bool IsRecurring { get; set; }
    public RecurrencePatternDto? RecurrencePattern { get; set; }
    public string? RecurrenceGroupId { get; set; }

    // Metadata
    public int CreatedBy { get; set; }
    public string CreatedByName { get; set; }
    public string CreatedAt { get; set; }
    public string UpdatedAt { get; set; }
    public string? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
}
```

### MeetingListItemDto (For Tables)

```csharp
public class MeetingListItemDto
{
    public int Id { get; set; }
    public int BoardId { get; set; }
    public string BoardName { get; set; }
    public string BoardType { get; set; }
    public string? ParentBoardName { get; set; }
    public string Title { get; set; }
    public string MeetingType { get; set; }
    public string StartDate { get; set; }
    public string StartTime { get; set; }
    public int Duration { get; set; }
    public string LocationType { get; set; }
    public string? PhysicalLocation { get; set; }  // Note: different from detail DTO
    public string? MeetingLink { get; set; }       // Note: different from detail DTO
    public string Status { get; set; }
    public string? SubStatus { get; set; }
    public string StatusUpdatedAt { get; set; }
    public int ParticipantCount { get; set; }
    public int ExpectedAttendees { get; set; }
    public int QuorumPercentage { get; set; }
    public int QuorumRequired { get; set; }
    public bool RequiresConfirmation { get; set; }
    public string CreatedByName { get; set; }
    public string CreatedAt { get; set; }
    public BoardPackStatusDto? BoardPackStatus { get; set; }
}
```

### MeetingParticipantDto

```csharp
public class MeetingParticipantDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string? Avatar { get; set; }
    public BoardRoleDto BoardRole { get; set; }  // Role details
    public string RsvpStatus { get; set; }
    public bool IsGuest { get; set; }
    public string? GuestRole { get; set; }
    public string? TimeSlotStart { get; set; }
    public string? TimeSlotEnd { get; set; }
    public string? PresentationTopic { get; set; }
    public bool CanViewDocuments { get; set; }
    public bool CanShareScreen { get; set; }
    public bool ReceiveMinutes { get; set; }
}
```

---

## 6. Key Frontend Files That Will Change

### Files to Modify

| File | Changes Needed |
|------|----------------|
| `src/types/meeting.types.ts` | Change all `z.string()` IDs to `z.number()`, add 'pending' to RSVPStatusSchema |
| `src/types/board.types.ts` | Change boardId types from string to number |
| `src/types/user.types.ts` | Verify userId types are number |
| `src/api/meetings.api.ts` | Update endpoints to real API, remove mock fallbacks |
| `src/hooks/api/useMeetings.ts` | Update query key types (string → number for IDs) |
| `src/pages/Meetings/**` | Parse URL params: `Number(useParams().meetingId)` |
| `src/mocks/handlers/meetings.handlers.ts` | **OBSOLETE** - to be removed |
| `src/mocks/db/tables/meetings.ts` | **OBSOLETE** - to be removed |
| `src/mocks/db/tables/meetingParticipants.ts` | **OBSOLETE** - to be removed |

### ID Comparison Changes

```typescript
// Before (string comparison)
if (meeting.id === "MTG-001")
if (String(userId) === String(participant.userId))
participants.find(p => p.id === participantId)

// After (number comparison)
if (meeting.id === 1)
if (userId === participant.userId)
participants.find(p => p.id === participantId)  // Both are numbers now
```

### URL Parameter Parsing

```typescript
// In page components using useParams
const { meetingId } = useParams<{ meetingId: string }>();
const meeting = useMeeting(Number(meetingId));

// In navigation
navigate(`/meetings/${meeting.id}`);  // number auto-converts to string in URL
```

### Files That Work Without Changes

These files consume the Meeting type and will work once types are updated:
- `src/contexts/MeetingPhaseContext.tsx` - Phase derivation (uses status, not IDs)
- `src/contexts/MeetingRoomContext.tsx` - Room state management

---

## 7. API Response Format

All list endpoints should return paginated responses:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

Backend should return:
```csharp
public class PaginatedResponse<T>
{
    public List<T> Data { get; set; }
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
```

---

## 8. Date/Time Format Standards

**Project Standard: 12-hour AM/PM format for all time display**

| Field Type | Frontend Display | Backend Storage | DTO Output Format |
|-----------|------------------|-----------------|-------------------|
| Date only | "Dec 20, 2024" or "2024-12-20" | `DateTime` | `.ToString("yyyy-MM-dd")` |
| Time only | "2:30 PM" | `TimeSpan` | `.ToString(@"h\:mm tt")` * |
| DateTime | "Dec 20, 2024 2:30 PM" | `DateTime` | `.ToString("yyyy-MM-ddTHH:mm:ss")` |

### Time Format Implementation

**Backend DTO Helper:**
```csharp
// Extension method for TimeSpan to 12-hour format
public static string ToAmPmString(this TimeSpan time)
{
    var dateTime = DateTime.Today.Add(time);
    return dateTime.ToString("h:mm tt");  // "2:30 PM"
}

// Usage in DTO mapping
StartTime = meeting.StartTime?.ToAmPmString()  // "2:30 PM"
```

**Frontend Display:**
```typescript
// If backend sends "14:30" (24-hour), convert on frontend
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Or use date-fns/dayjs
import { format, parse } from 'date-fns';
const formatTime = (time: string) => format(parse(time, 'HH:mm', new Date()), 'h:mm a');
```

### Recommendation: Backend Returns AM/PM Format

To keep frontend simple, backend should return pre-formatted AM/PM strings:

```csharp
public class MeetingDto
{
    public string StartTime { get; set; }  // "2:30 PM" (already formatted)
    // ...
}
```

Frontend can display directly without conversion.

---

## 9. Meeting Type Resolution

Frontend expects `meetingType` as string ('regular', 'special', etc.).
Backend stores `MeetingTypeId` as FK to `MeetingTypeLookup`.

**Resolution in DTO**:
```csharp
MeetingType = meeting.MeetingType.Code  // Use lookup Code field
```

---

## 10. Summary of Changes Needed

### Backend Entity Updates

1. **Meeting.cs** - Add:
   - `IsRecurring`, `RecurrencePattern`, `RecurrenceGroupId`
   - Or create separate `MeetingRecurrence` entity

2. **MeetingParticipant.cs** - Add:
   - `ReceiveMinutes`

### Backend DTOs to Create

1. `MeetingDto` - Full detail response (with integer IDs)
2. `MeetingListItemDto` - List/table response
3. `MeetingParticipantDto` - Participant info
4. `MeetingEventDto` - Audit trail
5. `CreateMeetingRequest` - Create payload
6. `UpdateMeetingRequest` - Update payload
7. `BoardPackStatusDto` - Agenda/docs/minutes status

### Frontend Type Changes (Priority)

1. **ID Type Migration** - Change all ID fields from `z.string()` to `z.number()`:
   - `meeting.types.ts` - Meeting, MeetingParticipant, MeetingEvent schemas
   - `board.types.ts` - Board-related ID fields
   - `user.types.ts` - User ID fields

2. **RSVP Status** - Add 'pending' to RSVPStatusSchema in `meeting.types.ts`

3. **API Layer** - Update `meetings.api.ts` to call real endpoints

4. **Remove Mock Data**:
   - `src/mocks/handlers/meetings.handlers.ts`
   - `src/mocks/db/tables/meetings.ts`
   - `src/mocks/db/tables/meetingParticipants.ts`

5. **URL Parameter Parsing** - Add `Number()` conversion in page components
