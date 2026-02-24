# Meeting Temporal State Implementation Plan

This document outlines how **time** should affect meeting status and transitions.

---

## Problem Statement

Currently, meeting status transitions are entirely **manual**:
- User clicks "Start Meeting" → status becomes `inprogress`
- User clicks "End Meeting" → status becomes `completed`

**Gap**: The system doesn't automatically reflect temporal reality:
- A scheduled meeting whose start time has passed still shows as "scheduled"
- No notifications for overdue meetings
- No prevention of starting meetings scheduled for the future

---

## Time-Based Scenarios

| Scenario | Current Behavior | Expected Behavior |
|----------|------------------|-------------------|
| T-15 min before start | No change | Show "Upcoming", enable early join |
| T = start time | No change | Show "Ready to Start", highlight |
| T+30 min (not started) | No change | Show "Overdue", send notification |
| T+60 min (not started) | No change | Option: Auto-cancel as "Missed" |
| During meeting, T > end time | No change | Show "Running Over", warn host |
| Meeting never started, T > end time | No change | Mark as "Missed", auto-cancel |

---

## Proposed Solution: Hybrid Approach

### 1. Computed Temporal State (Real-time)

Add a computed property that evaluates meeting time state on every access.

### 2. Background Job (Batch Operations)

Periodic job for notifications and optional auto-cancellation.

---

## Implementation Details

### Step 1: MeetingTemporalState Enum

**File:** `eBoard.Domain/Enums/MeetingTemporalState.cs`

```csharp
namespace eBoard.Domain.Enums;

/// <summary>
/// Computed temporal state based on meeting time vs current time.
/// This is NOT stored - it's computed on access.
/// </summary>
public enum MeetingTemporalState
{
    /// <summary>
    /// Start time is more than 15 minutes away
    /// </summary>
    Future,

    /// <summary>
    /// Start time is within 15 minutes (can join lobby)
    /// </summary>
    Upcoming,

    /// <summary>
    /// Start time has been reached, meeting can be started
    /// </summary>
    ReadyToStart,

    /// <summary>
    /// Start time + grace period passed, meeting not started
    /// </summary>
    Overdue,

    /// <summary>
    /// Meeting is currently in progress
    /// </summary>
    InProgress,

    /// <summary>
    /// Meeting in progress but past scheduled end time
    /// </summary>
    RunningOver,

    /// <summary>
    /// Meeting has ended (completed or cancelled)
    /// </summary>
    Ended,

    /// <summary>
    /// Meeting was never started and end time has passed
    /// </summary>
    Missed
}
```

### Step 2: Configuration Constants

**File:** `eBoard.Domain/Constants/MeetingTimeConstants.cs`

```csharp
namespace eBoard.Domain.Constants;

public static class MeetingTimeConstants
{
    /// <summary>
    /// Minutes before start time when meeting becomes "Upcoming" and lobby opens
    /// </summary>
    public const int UPCOMING_WINDOW_MINUTES = 15;

    /// <summary>
    /// Minutes before start time when "Start Meeting" button becomes active
    /// </summary>
    public const int READY_TO_START_WINDOW_MINUTES = 5;

    /// <summary>
    /// Minutes after start time before meeting is marked "Overdue"
    /// </summary>
    public const int OVERDUE_GRACE_MINUTES = 30;

    /// <summary>
    /// Minutes after start time before meeting is auto-cancelled (0 = disabled)
    /// </summary>
    public const int AUTO_CANCEL_MINUTES = 60;

    /// <summary>
    /// Minutes after end time to show "Running Over" warning
    /// </summary>
    public const int RUNNING_OVER_THRESHOLD_MINUTES = 5;
}
```

### Step 3: Extension Method for Temporal State

**File:** `eBoard.Domain/Extensions/MeetingTimeExtensions.cs`

```csharp
using eBoard.Domain.Constants;
using eBoard.Domain.Entities;
using eBoard.Domain.Enums;

namespace eBoard.Domain.Extensions;

public static class MeetingTimeExtensions
{
    /// <summary>
    /// Get the full start datetime by combining ScheduledDate and StartTime
    /// </summary>
    public static DateTime GetStartDateTime(this Meeting meeting)
    {
        if (meeting.StartTime == null)
            return meeting.ScheduledDate.ToDateTime(TimeOnly.MinValue);

        return meeting.ScheduledDate.ToDateTime(meeting.StartTime.Value);
    }

    /// <summary>
    /// Get the full end datetime by combining ScheduledDate, StartTime, and Duration
    /// </summary>
    public static DateTime GetEndDateTime(this Meeting meeting)
    {
        var start = meeting.GetStartDateTime();
        return start.AddMinutes(meeting.Duration ?? 60);
    }

    /// <summary>
    /// Compute the temporal state based on current time
    /// </summary>
    public static MeetingTemporalState GetTemporalState(this Meeting meeting)
    {
        return meeting.GetTemporalState(DateTime.UtcNow);
    }

    /// <summary>
    /// Compute the temporal state based on a specific reference time
    /// (Useful for testing)
    /// </summary>
    public static MeetingTemporalState GetTemporalState(this Meeting meeting, DateTime referenceTime)
    {
        var startDateTime = meeting.GetStartDateTime();
        var endDateTime = meeting.GetEndDateTime();

        // Terminal states - check stored status first
        if (meeting.Status == MeetingStatus.Completed)
            return MeetingTemporalState.Ended;

        if (meeting.Status == MeetingStatus.Cancelled)
            return MeetingTemporalState.Ended;

        // Currently in progress
        if (meeting.Status == MeetingStatus.InProgress)
        {
            if (referenceTime > endDateTime.AddMinutes(MeetingTimeConstants.RUNNING_OVER_THRESHOLD_MINUTES))
                return MeetingTemporalState.RunningOver;

            return MeetingTemporalState.InProgress;
        }

        // Pre-meeting states (draft, scheduled)
        // Check if completely missed (past end time, never started)
        if (referenceTime > endDateTime)
            return MeetingTemporalState.Missed;

        // Check if overdue (past start + grace period, not started)
        if (referenceTime > startDateTime.AddMinutes(MeetingTimeConstants.OVERDUE_GRACE_MINUTES))
            return MeetingTemporalState.Overdue;

        // Ready to start (within start window)
        if (referenceTime >= startDateTime.AddMinutes(-MeetingTimeConstants.READY_TO_START_WINDOW_MINUTES))
            return MeetingTemporalState.ReadyToStart;

        // Upcoming (within lobby window)
        if (referenceTime >= startDateTime.AddMinutes(-MeetingTimeConstants.UPCOMING_WINDOW_MINUTES))
            return MeetingTemporalState.Upcoming;

        // Future
        return MeetingTemporalState.Future;
    }

    /// <summary>
    /// Get minutes until meeting start (negative if past)
    /// </summary>
    public static int GetMinutesUntilStart(this Meeting meeting)
    {
        var startDateTime = meeting.GetStartDateTime();
        return (int)(startDateTime - DateTime.UtcNow).TotalMinutes;
    }

    /// <summary>
    /// Check if meeting can be started now based on time
    /// </summary>
    public static bool CanStartNow(this Meeting meeting)
    {
        if (meeting.Status != MeetingStatus.Scheduled || meeting.SubStatus != "approved")
            return false;

        var temporalState = meeting.GetTemporalState();
        return temporalState == MeetingTemporalState.ReadyToStart ||
               temporalState == MeetingTemporalState.Overdue;
    }

    /// <summary>
    /// Check if it's too early to start the meeting
    /// </summary>
    public static bool IsTooEarlyToStart(this Meeting meeting)
    {
        var temporalState = meeting.GetTemporalState();
        return temporalState == MeetingTemporalState.Future ||
               temporalState == MeetingTemporalState.Upcoming;
    }
}
```

### Step 4: Update PreMeetingStateMachine

**File:** `eBoard.Infrastructure/Services/PreMeetingStateMachine.cs`

Add time-based checks to `GetScheduledTransitions`:

```csharp
private IEnumerable<AllowedTransition> GetScheduledTransitions(Meeting meeting, HashSet<string> userPermissions)
{
    var transitions = new List<AllowedTransition>();

    // ... existing pending_approval and rejected handling ...

    if (meeting.SubStatus == "approved")
    {
        var temporalState = meeting.GetTemporalState();

        // Can only start if time permits
        if (meeting.CanStartNow())
        {
            var label = temporalState == MeetingTemporalState.Overdue
                ? "Start Meeting (Overdue)"
                : "Start Meeting";

            transitions.Add(new AllowedTransition
            {
                TargetStatus = MeetingStatus.InProgress,
                TargetSubStatus = null,
                Label = label,
                Description = temporalState == MeetingTemporalState.Overdue
                    ? "Meeting is past scheduled start time"
                    : "Start the meeting now",
                RequiresReason = false,
                RequiredPermission = PERM_MEETINGS_CONTROL
            });
        }
        else if (meeting.IsTooEarlyToStart())
        {
            // Optionally add a disabled/info transition to show why Start isn't available
            var minutesUntil = meeting.GetMinutesUntilStart();
            transitions.Add(new AllowedTransition
            {
                TargetStatus = MeetingStatus.InProgress,
                TargetSubStatus = null,
                Label = $"Start Meeting (in {minutesUntil} min)",
                Description = $"Meeting can be started {MeetingTimeConstants.READY_TO_START_WINDOW_MINUTES} minutes before scheduled time",
                RequiresReason = false,
                RequiredPermission = PERM_MEETINGS_CONTROL,
                IsDisabled = true,
                DisabledReason = $"Too early - wait {minutesUntil - MeetingTimeConstants.READY_TO_START_WINDOW_MINUTES} more minutes"
            });
        }

        // If completely missed, show cancel option prominently
        if (temporalState == MeetingTemporalState.Missed)
        {
            transitions.Add(new AllowedTransition
            {
                TargetStatus = MeetingStatus.Cancelled,
                TargetSubStatus = "missed",
                Label = "Mark as Missed",
                Description = "Meeting was not held - mark as missed",
                RequiresReason = false,
                RequiredPermission = PERM_MEETINGS_CANCEL
            });
        }
    }

    return transitions;
}
```

### Step 5: Update AllowedTransition DTO

**File:** `eBoard.Application/Meetings/DTOs/AllowedTransition.cs`

```csharp
public class AllowedTransition
{
    public MeetingStatus TargetStatus { get; set; }
    public string? TargetSubStatus { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool RequiresReason { get; set; }
    public string? RequiredPermission { get; set; }

    // NEW: Time-based availability
    public bool IsDisabled { get; set; } = false;
    public string? DisabledReason { get; set; }
}
```

### Step 6: Update MeetingDetailDto

**File:** `eBoard.Application/Meetings/DTOs/MeetingDetailDto.cs`

```csharp
public class MeetingDetailDto
{
    // ... existing fields ...

    // NEW: Temporal information
    /// <summary>
    /// Computed temporal state (future, upcoming, ready_to_start, overdue, etc.)
    /// </summary>
    public string TemporalState { get; set; } = "future";

    /// <summary>
    /// Whether the meeting can be started right now
    /// </summary>
    public bool CanStartNow { get; set; }

    /// <summary>
    /// Minutes until start time (negative if past)
    /// </summary>
    public int MinutesUntilStart { get; set; }

    /// <summary>
    /// Minutes until end time (negative if past)
    /// </summary>
    public int MinutesUntilEnd { get; set; }

    /// <summary>
    /// Human-readable time status message
    /// </summary>
    public string? TimeStatusMessage { get; set; }
}
```

### Step 7: Background Job for Notifications

**File:** `eBoard.Infrastructure/Jobs/MeetingTimeCheckJob.cs`

```csharp
using Quartz;
using eBoard.Domain.Extensions;
using eBoard.Domain.Enums;
using eBoard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace eBoard.Infrastructure.Jobs;

/// <summary>
/// Periodic job to check meeting times and send notifications.
/// Runs every 5 minutes.
/// </summary>
[DisallowConcurrentExecution]
public class MeetingTimeCheckJob : IJob
{
    private readonly eBoardDbContext _context;
    private readonly INotificationService _notifications;
    private readonly ILogger<MeetingTimeCheckJob> _logger;

    public MeetingTimeCheckJob(
        eBoardDbContext context,
        INotificationService notifications,
        ILogger<MeetingTimeCheckJob> logger)
    {
        _context = context;
        _notifications = notifications;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var now = DateTime.UtcNow;
        _logger.LogInformation("Running MeetingTimeCheckJob at {Time}", now);

        // 1. Find meetings becoming "Upcoming" (send reminder)
        await SendUpcomingReminders(now);

        // 2. Find meetings that are "Overdue" (not started)
        await SendOverdueNotifications(now);

        // 3. Auto-cancel missed meetings (optional, configurable)
        await AutoCancelMissedMeetings(now);

        // 4. Warn about running-over meetings
        await SendRunningOverWarnings(now);
    }

    private async Task SendUpcomingReminders(DateTime now)
    {
        var upcomingStart = now.AddMinutes(MeetingTimeConstants.UPCOMING_WINDOW_MINUTES);
        var reminderSentCutoff = now.AddMinutes(-MeetingTimeConstants.UPCOMING_WINDOW_MINUTES);

        var upcomingMeetings = await _context.Meetings
            .Include(m => m.Participants)
            .ThenInclude(p => p.User)
            .Where(m => m.Status == MeetingStatus.Scheduled)
            .Where(m => m.SubStatus == "approved")
            .Where(m => m.ScheduledDate == DateOnly.FromDateTime(now) ||
                        m.ScheduledDate == DateOnly.FromDateTime(now.AddDays(1)))
            .ToListAsync();

        foreach (var meeting in upcomingMeetings)
        {
            var startDateTime = meeting.GetStartDateTime();
            if (startDateTime > now && startDateTime <= upcomingStart)
            {
                // Check if reminder already sent (use MeetingEvents)
                var reminderSent = await _context.MeetingEvents
                    .AnyAsync(e => e.MeetingId == meeting.Id &&
                                   e.EventType == "upcoming_reminder_sent" &&
                                   e.PerformedAt > reminderSentCutoff);

                if (!reminderSent)
                {
                    await _notifications.SendMeetingUpcomingReminder(meeting);

                    // Record that reminder was sent
                    _context.MeetingEvents.Add(new MeetingEvent
                    {
                        MeetingId = meeting.Id,
                        EventType = "upcoming_reminder_sent",
                        PerformedAt = now,
                        PerformedBy = 0, // System
                        PerformedByName = "System"
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SendOverdueNotifications(DateTime now)
    {
        var overdueThreshold = now.AddMinutes(-MeetingTimeConstants.OVERDUE_GRACE_MINUTES);

        var overdueMeetings = await _context.Meetings
            .Include(m => m.Participants.Where(p => p.Role != null &&
                (p.Role.Code == "chairman" || p.Role.Code == "board_secretary")))
            .ThenInclude(p => p.User)
            .Where(m => m.Status == MeetingStatus.Scheduled)
            .Where(m => m.SubStatus == "approved")
            .Where(m => m.ScheduledDate <= DateOnly.FromDateTime(now))
            .ToListAsync();

        foreach (var meeting in overdueMeetings)
        {
            if (meeting.GetTemporalState() == MeetingTemporalState.Overdue)
            {
                // Check if overdue notification already sent
                var notificationSent = await _context.MeetingEvents
                    .AnyAsync(e => e.MeetingId == meeting.Id &&
                                   e.EventType == "overdue_notification_sent");

                if (!notificationSent)
                {
                    await _notifications.SendMeetingOverdueNotification(meeting);

                    _context.MeetingEvents.Add(new MeetingEvent
                    {
                        MeetingId = meeting.Id,
                        EventType = "overdue_notification_sent",
                        PerformedAt = now,
                        PerformedBy = 0,
                        PerformedByName = "System"
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task AutoCancelMissedMeetings(DateTime now)
    {
        // Skip if auto-cancel is disabled
        if (MeetingTimeConstants.AUTO_CANCEL_MINUTES <= 0)
            return;

        var missedMeetings = await _context.Meetings
            .Where(m => m.Status == MeetingStatus.Scheduled)
            .Where(m => m.SubStatus == "approved")
            .ToListAsync();

        foreach (var meeting in missedMeetings)
        {
            if (meeting.GetTemporalState() == MeetingTemporalState.Missed)
            {
                _logger.LogInformation("Auto-cancelling missed meeting {MeetingId}: {Title}",
                    meeting.Id, meeting.Title);

                meeting.Status = MeetingStatus.Cancelled;
                meeting.SubStatus = "auto_cancelled";
                meeting.CancellationReason = "Meeting was not started before scheduled end time";
                meeting.CancelledAt = now;
                meeting.CancelledBy = null; // System

                _context.MeetingEvents.Add(new MeetingEvent
                {
                    MeetingId = meeting.Id,
                    EventType = "meeting_auto_cancelled",
                    FromStatus = "scheduled",
                    FromSubStatus = "approved",
                    ToStatus = "cancelled",
                    ToSubStatus = "auto_cancelled",
                    PerformedAt = now,
                    PerformedBy = 0,
                    PerformedByName = "System",
                    Metadata = "{\"reason\":\"Meeting not started before end time\"}"
                });

                await _notifications.SendMeetingAutoCancelledNotification(meeting);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SendRunningOverWarnings(DateTime now)
    {
        var inProgressMeetings = await _context.Meetings
            .Include(m => m.Participants.Where(p => p.Role != null && p.Role.Code == "chairman"))
            .ThenInclude(p => p.User)
            .Where(m => m.Status == MeetingStatus.InProgress)
            .ToListAsync();

        foreach (var meeting in inProgressMeetings)
        {
            if (meeting.GetTemporalState() == MeetingTemporalState.RunningOver)
            {
                // Check if warning already sent
                var warningSent = await _context.MeetingEvents
                    .AnyAsync(e => e.MeetingId == meeting.Id &&
                                   e.EventType == "running_over_warning_sent");

                if (!warningSent)
                {
                    await _notifications.SendMeetingRunningOverWarning(meeting);

                    _context.MeetingEvents.Add(new MeetingEvent
                    {
                        MeetingId = meeting.Id,
                        EventType = "running_over_warning_sent",
                        PerformedAt = now,
                        PerformedBy = 0,
                        PerformedByName = "System"
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
    }
}
```

### Step 8: Register Background Job

**File:** `eBoard.API/Program.cs`

```csharp
// Add Quartz for background jobs
builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("MeetingTimeCheckJob");
    q.AddJob<MeetingTimeCheckJob>(opts => opts.WithIdentity(jobKey));

    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity("MeetingTimeCheckJob-trigger")
        .WithCronSchedule("0 */5 * * * ?") // Every 5 minutes
    );
});

builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);
```

---

## Frontend Integration

### Update MeetingDetailDto Mapping

When mapping to DTO, include temporal information:

```csharp
var dto = new MeetingDetailDto
{
    // ... existing mapping ...
    TemporalState = meeting.GetTemporalState().ToString().ToLowerInvariant(),
    CanStartNow = meeting.CanStartNow(),
    MinutesUntilStart = meeting.GetMinutesUntilStart(),
    MinutesUntilEnd = (int)(meeting.GetEndDateTime() - DateTime.UtcNow).TotalMinutes,
    TimeStatusMessage = GetTimeStatusMessage(meeting)
};
```

### Frontend Type Update

**File:** `src/types/meeting.types.ts`

```typescript
export type MeetingTemporalState =
  | 'future'
  | 'upcoming'
  | 'ready_to_start'
  | 'overdue'
  | 'inprogress'
  | 'running_over'
  | 'ended'
  | 'missed';

export interface Meeting {
  // ... existing fields ...

  // Temporal information (computed by backend)
  temporalState: MeetingTemporalState;
  canStartNow: boolean;
  minutesUntilStart: number;
  minutesUntilEnd: number;
  timeStatusMessage?: string;
}
```

### UI Indicator Component

**File:** `src/components/Meetings/MeetingTimeStatus.tsx`

```tsx
const MeetingTimeStatus: React.FC<{ meeting: Meeting }> = ({ meeting }) => {
  const getStatusConfig = () => {
    switch (meeting.temporalState) {
      case 'upcoming':
        return {
          color: 'blue',
          icon: <ClockCircleOutlined />,
          text: `Starts in ${meeting.minutesUntilStart} min`,
        };
      case 'ready_to_start':
        return {
          color: 'green',
          icon: <PlayCircleOutlined />,
          text: 'Ready to Start',
        };
      case 'overdue':
        return {
          color: 'orange',
          icon: <WarningOutlined />,
          text: `Overdue by ${Math.abs(meeting.minutesUntilStart)} min`,
        };
      case 'running_over':
        return {
          color: 'red',
          icon: <ExclamationCircleOutlined />,
          text: `Running over by ${Math.abs(meeting.minutesUntilEnd)} min`,
        };
      case 'missed':
        return {
          color: 'red',
          icon: <CloseCircleOutlined />,
          text: 'Missed',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};
```

---

## Implementation Priority

| Phase | Component | Priority | Effort | Dependencies |
|-------|-----------|----------|--------|--------------|
| 1 | `MeetingTemporalState` enum | P0 | 15 min | None |
| 2 | `MeetingTimeConstants` | P0 | 15 min | None |
| 3 | `MeetingTimeExtensions` | P0 | 1 hr | Phase 1-2 |
| 4 | Update `PreMeetingStateMachine` | P1 | 1 hr | Phase 3 |
| 5 | Update DTOs | P1 | 30 min | Phase 3 |
| 6 | Update API mapping | P1 | 30 min | Phase 5 |
| 7 | Frontend types & component | P1 | 1 hr | Phase 6 |
| 8 | Background job (Quartz) | P2 | 2 hr | Phase 3 |
| 9 | Notification service | P2 | 2 hr | Phase 8 |

---

## Configuration Options (BoardSettings)

Future enhancement - make time constants configurable per board:

```csharp
public class MeetingRequirement
{
    // ... existing fields ...

    // Time-based settings
    public int UpcomingWindowMinutes { get; set; } = 15;
    public int ReadyToStartWindowMinutes { get; set; } = 5;
    public int OverdueGraceMinutes { get; set; } = 30;
    public int AutoCancelMinutes { get; set; } = 0; // 0 = disabled
    public bool SendUpcomingReminders { get; set; } = true;
    public bool SendOverdueNotifications { get; set; } = true;
}
```

---

## Related Files

- `eBoard.Domain/Enums/MeetingTemporalState.cs` - Enum definition
- `eBoard.Domain/Constants/MeetingTimeConstants.cs` - Time thresholds
- `eBoard.Domain/Extensions/MeetingTimeExtensions.cs` - Computation logic
- `eBoard.Infrastructure/Services/PreMeetingStateMachine.cs` - State transitions
- `eBoard.Infrastructure/Jobs/MeetingTimeCheckJob.cs` - Background processing
- `src/types/meeting.types.ts` - Frontend types
- `src/components/Meetings/MeetingTimeStatus.tsx` - UI component
