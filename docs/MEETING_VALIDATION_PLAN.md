# Meeting Validation Implementation Plan

This document outlines the comprehensive validation system for meeting creation and management.

---

## Current Implementation (Phase 1 - Frontend Time Validations)

**File:** `src/pages/Meetings/steps/MeetingDetailsStep.tsx`

### Implemented Validations

| Validation | Type | Message |
|------------|------|---------|
| Start time in past | Error | "Start time cannot be in the past" |
| Minimum lead time | Error | "Meeting must be at least 30 minutes from now" |
| End time before start | Error | "End time must be after start time" |
| Minimum duration | Error | "Meeting must be at least 15 minutes" |
| Maximum duration | Error | "Meeting cannot exceed 8 hours" |

### Constants Used
```typescript
const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 480; // 8 hours
const MIN_LEAD_TIME_MINUTES = 30;
```

---

## Future Implementation Phases

### Phase 2: Backend Time Validation (Mirror Frontend)

**File:** `eBoard.Application/Meetings/Validators/CreateMeetingValidator.cs`

```csharp
public class CreateMeetingValidator : AbstractValidator<CreateMeetingRequest>
{
    public CreateMeetingValidator()
    {
        RuleFor(x => x.StartTime)
            .GreaterThan(DateTime.UtcNow.AddMinutes(30))
            .WithMessage("Meeting must be at least 30 minutes from now");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("End time must be after start time");

        RuleFor(x => x)
            .Must(x => (x.EndTime - x.StartTime).TotalMinutes >= 15)
            .WithMessage("Meeting must be at least 15 minutes");

        RuleFor(x => x)
            .Must(x => (x.EndTime - x.StartTime).TotalHours <= 8)
            .WithMessage("Meeting cannot exceed 8 hours");
    }
}
```

---

### Phase 3: Clash Detection Service

**File:** `eBoard.Application/Meetings/Services/IMeetingValidationService.cs`

```csharp
public interface IMeetingValidationService
{
    /// <summary>
    /// Full validation for meeting creation
    /// </summary>
    Task<ValidationResult> ValidateCreateAsync(CreateMeetingRequest request, int boardId);

    /// <summary>
    /// Check for meetings on the same board that overlap
    /// </summary>
    Task<List<MeetingConflict>> CheckBoardConflictsAsync(
        int boardId,
        DateTime start,
        DateTime end,
        int? excludeMeetingId = null);

    /// <summary>
    /// Check if participants have other meetings at the same time
    /// </summary>
    Task<List<ParticipantConflict>> CheckParticipantConflictsAsync(
        List<int> userIds,
        DateTime start,
        DateTime end,
        int? excludeMeetingId = null);

    /// <summary>
    /// Check if venue is available (for physical/hybrid meetings)
    /// </summary>
    Task<VenueConflict?> CheckVenueConflictAsync(
        string venue,
        DateTime start,
        DateTime end,
        int? excludeMeetingId = null);
}
```

**Implementation:** `eBoard.Infrastructure/Services/MeetingValidationService.cs`

```csharp
public class MeetingValidationService : IMeetingValidationService
{
    private readonly eBoardDbContext _context;

    public async Task<List<MeetingConflict>> CheckBoardConflictsAsync(
        int boardId, DateTime start, DateTime end, int? excludeMeetingId = null)
    {
        var query = _context.Meetings
            .Where(m => m.BoardId == boardId)
            .Where(m => m.Status != MeetingStatus.Cancelled)
            .Where(m => m.Status != MeetingStatus.Completed)
            .Where(m => m.StartTime < end && m.EndTime > start); // Overlap check

        if (excludeMeetingId.HasValue)
        {
            query = query.Where(m => m.Id != excludeMeetingId.Value);
        }

        return await query.Select(m => new MeetingConflict
        {
            MeetingId = m.Id,
            MeetingTitle = m.Title,
            StartTime = m.StartTime,
            EndTime = m.EndTime
        }).ToListAsync();
    }

    public async Task<List<ParticipantConflict>> CheckParticipantConflictsAsync(
        List<int> userIds, DateTime start, DateTime end, int? excludeMeetingId = null)
    {
        var query = _context.MeetingParticipants
            .Include(mp => mp.Meeting)
            .Include(mp => mp.User)
            .Where(mp => userIds.Contains(mp.UserId))
            .Where(mp => mp.Meeting.Status != MeetingStatus.Cancelled)
            .Where(mp => mp.Meeting.Status != MeetingStatus.Completed)
            .Where(mp => mp.Meeting.StartTime < end && mp.Meeting.EndTime > start);

        if (excludeMeetingId.HasValue)
        {
            query = query.Where(mp => mp.MeetingId != excludeMeetingId.Value);
        }

        return await query.Select(mp => new ParticipantConflict
        {
            UserId = mp.UserId,
            UserName = $"{mp.User.FirstName} {mp.User.LastName}",
            ConflictingMeetingId = mp.MeetingId,
            ConflictingMeetingTitle = mp.Meeting.Title
        }).ToListAsync();
    }
}
```

---

### Phase 4: Conflict Check API Endpoint

**File:** `eBoard.API/Controllers/MeetingsController.cs`

```csharp
/// <summary>
/// Check for scheduling conflicts before creating/updating a meeting
/// </summary>
[HttpGet("check-conflicts")]
[Authorize(Policy = "meetings.view")]
public async Task<IActionResult> CheckConflicts(
    [FromRoute] int boardId,
    [FromQuery] DateTime startTime,
    [FromQuery] DateTime endTime,
    [FromQuery] int? excludeMeetingId,
    [FromQuery] List<int>? participantIds)
{
    var boardConflicts = await _validationService.CheckBoardConflictsAsync(
        boardId, startTime, endTime, excludeMeetingId);

    var participantConflicts = participantIds?.Any() == true
        ? await _validationService.CheckParticipantConflictsAsync(
            participantIds, startTime, endTime, excludeMeetingId)
        : new List<ParticipantConflict>();

    return Ok(new ConflictCheckResponse
    {
        HasConflicts = boardConflicts.Any() || participantConflicts.Any(),
        BoardConflicts = boardConflicts,
        ParticipantConflicts = participantConflicts
    });
}
```

---

### Phase 5: Frontend Conflict Warning UI

**File:** `src/hooks/api/useMeetingConflicts.ts`

```typescript
export const useMeetingConflicts = (
  boardId: number,
  startTime: string,
  endTime: string,
  participantIds?: number[],
  excludeMeetingId?: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['meeting-conflicts', boardId, startTime, endTime, participantIds],
    queryFn: () => meetingsApi.checkConflicts(boardId, {
      startTime,
      endTime,
      participantIds,
      excludeMeetingId,
    }),
    enabled: options?.enabled ?? (!!startTime && !!endTime),
    staleTime: 30_000, // 30 seconds
  });
};
```

**UI Integration in MeetingDetailsStep:**
```tsx
// After time selection, show conflict warnings
{conflicts?.boardConflicts?.length > 0 && (
  <Alert
    type="error"
    message="Board Schedule Conflict"
    description={
      <ul>
        {conflicts.boardConflicts.map(c => (
          <li key={c.meetingId}>
            "{c.meetingTitle}" - {formatTime(c.startTime)} to {formatTime(c.endTime)}
          </li>
        ))}
      </ul>
    }
  />
)}

{conflicts?.participantConflicts?.length > 0 && (
  <Alert
    type="warning"
    message="Participant Conflicts"
    description={
      <ul>
        {conflicts.participantConflicts.map(c => (
          <li key={`${c.userId}-${c.conflictingMeetingId}`}>
            {c.userName} has "{c.conflictingMeetingTitle}"
          </li>
        ))}
      </ul>
    }
  />
)}
```

---

### Phase 6: BoardSettings Extension

**File:** `eBoard.Domain/Entities/BoardSettings.cs`

Add fields for configurable validation rules:

```csharp
// Meeting Validation Settings
public int MinMeetingDurationMinutes { get; set; } = 15;
public int MaxMeetingDurationMinutes { get; set; } = 480;
public int MinNoticeMinutes { get; set; } = 30;
public int BusinessHoursStart { get; set; } = 7;  // 7 AM
public int BusinessHoursEnd { get; set; } = 20;   // 8 PM
public bool AllowWeekendMeetings { get; set; } = true;
public int MaxMeetingsPerDay { get; set; } = 5;

// Notice period by meeting type (JSON)
// {"regular":1440,"special":10080,"agm":30240,"emergency":60}
public string? MeetingTypeNoticePeriods { get; set; }
```

---

### Phase 7: Holiday Management (Optional)

**New Entity:** `eBoard.Domain/Entities/Holiday.cs`

```csharp
public class Holiday : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string? Region { get; set; } // null = global
    public int? BoardId { get; set; } // null = all boards
    public bool IsRecurring { get; set; } = false;
    public HolidayType Type { get; set; } = HolidayType.PublicHoliday;
}

public enum HolidayType
{
    PublicHoliday,
    CompanyHoliday,
    BoardSpecific
}
```

---

### Phase 8: Venue Management (Optional)

**New Entity:** `eBoard.Domain/Entities/Venue.cs`

```csharp
public class Venue : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int Capacity { get; set; }
    public int? BoardId { get; set; } // null = shared venue
    public string? Amenities { get; set; } // JSON array
    public bool IsActive { get; set; } = true;
    public string? ContactInfo { get; set; }
    public string? Notes { get; set; }
}
```

---

## Validation Summary by Severity

### Errors (Block Save)
- Start time in past
- End time before start time
- Duration < minimum
- Duration > maximum
- Board has overlapping meeting (same exact time)
- Missing required fields

### Warnings (Allow Save with Confirmation)
- Participant has conflicting meeting
- Meeting outside business hours
- Meeting on weekend
- Meeting on holiday
- Short notice period for meeting type
- Venue near/at capacity

### Info (Display Only)
- X participants available
- Suggested alternative times
- Similar meetings scheduled this week

---

## Implementation Priority

| Phase | Component | Priority | Effort | Status |
|-------|-----------|----------|--------|--------|
| 1 | Frontend time validations | P0 | 1h | ✅ Done |
| 2 | Backend time validations | P0 | 1h | Pending |
| 3 | Clash detection service | P1 | 3h | Pending |
| 4 | Conflict check API | P1 | 1h | Pending |
| 5 | Frontend conflict UI | P1 | 2h | Pending |
| 6 | BoardSettings extension | P2 | 2h | Pending |
| 7 | Holiday management | P3 | 4h | Optional |
| 8 | Venue management | P3 | 4h | Optional |

---

## Related Files

- `src/pages/Meetings/steps/MeetingDetailsStep.tsx` - Frontend time validation
- `src/pages/Meetings/CreateMeetingPage.tsx` - Meeting creation wizard
- `eBoard.Application/Meetings/` - Backend validation services
- `eBoard.API/Controllers/MeetingsController.cs` - API endpoints
