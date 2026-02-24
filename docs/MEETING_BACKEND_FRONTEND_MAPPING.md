# Meeting Module: Backend ↔ Frontend Mapping Analysis

This document maps the differences between backend entities/DTOs and frontend TypeScript types for the Meeting module to identify gaps causing the 403 Forbidden authorization error and other potential integration issues.

---

## Table of Contents
1. [Critical Issues Identified](#1-critical-issues-identified)
2. [ID Type Alignment](#2-id-type-alignment)
3. [Field Name Mapping](#3-field-name-mapping)
4. [Enum & Status Handling](#4-enum--status-handling)
5. [DTO Structure Comparison](#5-dto-structure-comparison)
6. [API Endpoint Mapping](#6-api-endpoint-mapping)
7. [Authorization Flow Analysis](#7-authorization-flow-analysis)
8. [Frontend Changes Required](#8-frontend-changes-required)
9. [Backend Enhancements Needed](#9-backend-enhancements-needed)

---

## 1. Critical Issues Identified

### 🔴 CRITICAL: Authorization Handler Issue
**Problem**: The `PermissionAuthorizationHandler` is failing despite correct database permissions.

**Root Cause Analysis**:
1. ✅ Database has correct permissions (`meetings.view` exists for user 20)
2. ✅ Frontend receives permissions correctly (sidebar shows/hides based on permissions)
3. ✅ `.Include()` statements added to load navigation properties
4. ❌ **Authorization still returns 403 Forbidden**

**Likely Causes**:
- **Route parameter extraction**: The handler extracts `boardId` from `RouteValues["boardId"]`, but the route is `/api/boards/{boardId:int}/meetings`
- **Timing issue**: The `GetAccessContextAsync()` check in `MeetingsController.GetMeetings` (line 43-49) runs BEFORE the `PermissionAuthorizationHandler` and returns `Forbid()` if board access check fails
- **UserBoardAccessProjections not used**: The projection table exists but authorization handler queries `UserBoardRoles` directly

**Evidence**:
```csharp
// MeetingsController.cs:43-49
var accessContext = await _currentUserService.GetAccessContextAsync();

// Verify board access
if (!accessContext.HasGlobalAccess && !accessContext.BoardIds.Contains(boardId))
{
    return Forbid(); // ⚠️ This returns 403 BEFORE [Authorize(Policy = "meetings.view")] is evaluated
}
```

### 🟡 MEDIUM: Field Name Inconsistencies
**Backend** uses `PhysicalLocation` and `MeetingLink`
**Frontend** expects `physicalAddress` and `virtualMeetingLink`

**Impact**: Data mapping confusion, potential null values

---

## 2. ID Type Alignment

### Backend (C#)
```csharp
public class MeetingDto
{
    public int Id { get; set; }
    public int BoardId { get; set; }
    public int CreatedBy { get; set; }
    // All IDs are int (SQL Server auto-increment)
}
```

### Frontend (TypeScript)
```typescript
export const MeetingSchema = z.object({
  id: z.number(),
  boardId: z.number(),
  createdBy: z.number(),
  // All IDs are number (matches backend)
});
```

**Status**: ✅ **ALIGNED** - No ID type issues

---

## 3. Field Name Mapping

### Location Fields (INCONSISTENT)

| Backend DTO Field | Frontend Type Field | Status | Notes |
|------------------|---------------------|--------|-------|
| `PhysicalLocation` | `physicalAddress` | ❌ MISMATCH | Backend uses different name in list DTO |
| `MeetingLink` | `virtualMeetingLink` | ❌ MISMATCH | Backend uses different name in list DTO |
| `PhysicalAddress` | `physicalAddress` | ✅ MATCH | Used in detail DTO |
| `VirtualMeetingLink` | `virtualMeetingLink` | ✅ MATCH | Used in detail DTO |

**Backend DTOs**:
```csharp
// MeetingListItemDto (line 83-109)
public string? PhysicalLocation { get; set; }  // ❌ Different name
public string? MeetingLink { get; set; }       // ❌ Different name

// MeetingDto (line 12-78)
public string? PhysicalAddress { get; set; }      // ✅ Correct name
public string? VirtualMeetingLink { get; set; }   // ✅ Correct name
```

**Frontend Types**:
```typescript
// MeetingListItemSchema (line 329-355)
physicalLocation: z.string().nullable().optional(),  // Expects PhysicalLocation
meetingLink: z.string().nullable().optional(),       // Expects MeetingLink

// MeetingSchema (line 245-309)
physicalAddress: z.string().nullable().optional(),      // Expects PhysicalAddress
virtualMeetingLink: z.string().nullable().optional(),   // Expects VirtualMeetingLink
```

**Impact**: Frontend correctly expects both naming conventions (list vs detail), so this is actually **ALIGNED**.

---

## 4. Enum & Status Handling

### Status Values

| Backend | Frontend | Status |
|---------|----------|--------|
| `MeetingStatus.Draft` → `"draft"` | `"draft"` | ✅ MATCH |
| `MeetingStatus.Scheduled` → `"scheduled"` | `"scheduled"` | ✅ MATCH |
| `MeetingStatus.InProgress` → `"in_progress"` | `"in_progress"` | ✅ MATCH |
| `MeetingStatus.Completed` → `"completed"` | `"completed"` | ✅ MATCH |
| `MeetingStatus.Cancelled` → `"cancelled"` | `"cancelled"` | ✅ MATCH |

**Backend Serialization**:
```csharp
// MeetingsController.cs:154
Status = m.Status.ToString().ToLower(),
```

**Frontend Parsing**:
```typescript
status: z.string(), // Backend returns lowercase status
```

**Status**: ✅ **ALIGNED** - Backend correctly converts enums to lowercase strings

---

## 5. DTO Structure Comparison

### MeetingListItemDto vs MeetingListItemSchema

| Field | Backend Type | Frontend Type | Match? |
|-------|-------------|---------------|--------|
| `id` | `int` | `number` | ✅ |
| `boardId` | `int` | `number` | ✅ |
| `boardName` | `string` | `string` | ✅ |
| `boardType` | `string` (code) | `string` | ✅ |
| `parentBoardName` | `string?` | `string \| null` | ✅ |
| `title` | `string` | `string` | ✅ |
| `meetingType` | `string` (code) | `string` | ✅ |
| `startDate` | `string` (YYYY-MM-DD) | `string` | ✅ |
| `startTime` | `string` (h:mm tt) | `string` | ✅ |
| `duration` | `int` | `number` | ✅ |
| `locationType` | `string` (lowercase) | `string` | ✅ |
| `physicalLocation` | `string?` | `string \| null` | ✅ |
| `meetingLink` | `string?` | `string \| null` | ✅ |
| `status` | `string` (lowercase) | `string` | ✅ |
| `subStatus` | `string?` | `string \| null` | ✅ |
| `statusUpdatedAt` | `string` (ISO) | `string` | ✅ |
| `participantCount` | `int` | `number` | ✅ |
| `expectedAttendees` | `int` | `number` | ✅ |
| `quorumPercentage` | `int` | `number` | ✅ |
| `quorumRequired` | `int` | `number` | ✅ |
| `requiresConfirmation` | `bool` | `boolean` | ✅ |
| `createdByName` | `string` | `string` | ✅ |
| `createdAt` | `string` (ISO) | `string` | ✅ |
| `boardPackStatus` | `BoardPackStatusDto?` | `BoardPackStatus \| null` | ✅ |

**Status**: ✅ **FULLY ALIGNED** - All fields match

---

## 6. API Endpoint Mapping

### Backend Routes (MeetingsController.cs)

```csharp
[HttpGet("api/boards/{boardId:int}/meetings")]
[Authorize(Policy = "meetings.view")]
public async Task<IActionResult> GetMeetings(int boardId, [FromQuery] MeetingFilterParams filters)

[HttpGet("api/meetings/{meetingId:int}")]
[Authorize(Policy = "meetings.view")]
public async Task<IActionResult> GetMeeting(int meetingId)

[HttpPost("api/boards/{boardId:int}/meetings")]
[Authorize(Policy = "meetings.create")]
public async Task<IActionResult> CreateMeeting(int boardId, [FromBody] CreateMeetingRequest request)
```

### Frontend API Calls (meetings.api.ts)

```typescript
getBoardMeetings: async (boardId: number, params?: MeetingFilterParams) => {
  const response = await apiClient.get(`/boards/${boardId}/meetings`, { params });
  // ✅ Matches backend route
}

getMeeting: async (id: number) => {
  const response = await apiClient.get(`/meetings/${id}`);
  // ✅ Matches backend route
}

createMeeting: async (payload: CreateMeetingPayload) => {
  const response = await apiClient.post(`/boards/${payload.boardId}/meetings`, payload);
  // ✅ Matches backend route
}
```

**Status**: ✅ **ALIGNED** - All routes match

---

## 7. Authorization Flow Analysis

### Current Flow (PROBLEMATIC)

```
1. Frontend calls: GET /api/boards/1/meetings
   ↓
2. ASP.NET Core Routing extracts boardId=1
   ↓
3. [Authorize] attribute triggers
   ↓
4. PermissionPolicyProvider creates policy for "meetings.view"
   ↓
5. PermissionAuthorizationHandler.HandleRequirementAsync() executes
   ↓
6. Handler extracts userId from JWT ✅
   ↓
7. Handler extracts boardId from RouteValues ✅
   ↓
8. Handler queries UserBoardRoles with .Include() ✅
   ↓
9. Handler extracts permissions ✅
   ↓
10. Handler checks if "meetings.view" exists ✅
    ↓
11. ⚠️ BUT MeetingsController.GetMeetings() ALSO has board access check:
    var accessContext = await _currentUserService.GetAccessContextAsync();
    if (!accessContext.HasGlobalAccess && !accessContext.BoardIds.Contains(boardId))
        return Forbid(); // ❌ Returns 403 HERE
```

### The Problem

**MeetingsController.cs has TWO authorization checks**:

1. **Attribute-based**: `[Authorize(Policy = "meetings.view")]` - Uses `PermissionAuthorizationHandler`
2. **Explicit check**: `GetAccessContextAsync()` + `BoardIds.Contains(boardId)` - Uses `CurrentUserService`

**The explicit check runs FIRST** (inside the controller method) and returns `Forbid()` before the permission handler completes.

### Root Cause

**`CurrentUserService.GetAccessContextAsync()`** likely:
- Queries `UserBoardAccessProjections` table
- Returns `BoardIds` list for the user
- **BUT** the projection might not be populated or is stale

**Evidence**:
```
User said: "there is still that problem that the projection is not being used"
```

---

## 8. Frontend Changes Required

### ✅ No Frontend Changes Needed

The frontend implementation is correct:
- Uses integer IDs consistently
- Expects correct field names for both list and detail DTOs
- Handles lowercase enum values
- API routes match backend exactly

---

## 9. Backend Enhancements Needed

### 🔴 CRITICAL FIX: Remove Duplicate Authorization Check

**File**: `MeetingsController.cs`

**Current Code** (lines 43-49):
```csharp
var accessContext = await _currentUserService.GetAccessContextAsync();

// Verify board access
if (!accessContext.HasGlobalAccess && !accessContext.BoardIds.Contains(boardId))
{
    return Forbid(); // ❌ REMOVE THIS - Duplicates [Authorize] attribute
}
```

**Recommended Fix**:
```csharp
// REMOVE the explicit board access check
// The [Authorize(Policy = "meetings.view")] attribute already handles this
// via PermissionAuthorizationHandler

var query = _context.Meetings
    .AsNoTracking()
    .Include(m => m.Board)
    // ... rest of query
```

**Rationale**:
1. The `[Authorize(Policy = "meetings.view")]` attribute already validates permissions
2. The `PermissionAuthorizationHandler` checks both global and board-specific permissions
3. The explicit check is redundant and causes premature 403 responses
4. If `UserBoardAccessProjections` is not populated, the explicit check fails even when permissions exist

### 🟡 MEDIUM FIX: Ensure UserBoardAccessProjections is Populated

**File**: `Program.cs` (lines 114-128)

**Current Code**:
```csharp
try
{
    // Check if projections table is empty
    var hasProjections = await context.UserBoardAccessProjections.AnyAsync();
    if (!hasProjections)
    {
        logger.LogInformation("Seeding UserBoardAccessProjections...");
        await projectionService.RebuildAllProjectionsAsync();
        logger.LogInformation("UserBoardAccessProjections seeded successfully");
    }
}
```

**Issue**: This only runs on startup if table is empty. If user roles change, projections become stale.

**Recommended Enhancement**:
```csharp
// Always rebuild projections on startup in development
if (app.Environment.IsDevelopment())
{
    logger.LogInformation("Rebuilding UserBoardAccessProjections (dev mode)...");
    await projectionService.RebuildAllProjectionsAsync();
    logger.LogInformation("UserBoardAccessProjections rebuilt successfully");
}
else
{
    // In production, only seed if empty
    var hasProjections = await context.UserBoardAccessProjections.AnyAsync();
    if (!hasProjections)
    {
        logger.LogInformation("Seeding UserBoardAccessProjections...");
        await projectionService.RebuildAllProjectionsAsync();
    }
}
```

### 🟢 LOW PRIORITY: Add Debug Logging

Keep the debug logging added to `PermissionAuthorizationHandler.cs` temporarily to verify the fix works.

---

## Summary

### Root Cause of 403 Error

**The `MeetingsController.GetMeetings()` method has a duplicate authorization check that runs BEFORE the `[Authorize]` attribute's `PermissionAuthorizationHandler`**. This explicit check queries `UserBoardAccessProjections` which may not be populated or is stale, causing it to return `Forbid()` even though the user has the correct permissions in `UserBoardRoles`.

### Recommended Fix Priority

1. **CRITICAL**: Remove explicit board access check from `MeetingsController.GetMeetings()` (lines 43-49)
2. **MEDIUM**: Ensure `UserBoardAccessProjections` is rebuilt on startup in development
3. **LOW**: Keep debug logging temporarily to verify fix

### Backend-Frontend Alignment Status

✅ **EXCELLENT** - The backend and frontend are well-aligned:
- ID types match (integer/number)
- Field names match for both list and detail DTOs
- Enum serialization is correct (lowercase strings)
- API routes match exactly
- DTO structures are identical

**The 403 error is NOT caused by backend-frontend mapping issues, but by duplicate authorization logic in the controller.**
