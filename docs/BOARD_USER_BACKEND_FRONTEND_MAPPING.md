# Board & User Module: Backend ↔ Frontend Mapping Guide

This document maps the differences between backend entities and frontend TypeScript types for Board and User modules to ensure proper API response formatting and migration from mock data to real backend integration.

---

## Table of Contents
1. [ID Type Alignment](#1-id-type-alignment)
2. [Board Module Mapping](#2-board-module-mapping)
3. [User Module Mapping](#3-user-module-mapping)
4. [Enum & Status Handling](#4-enum--status-handling)
5. [DTO Structures](#5-dto-structures)
6. [Frontend Changes Required](#6-frontend-changes-required)
7. [Backend Enhancements Needed](#7-backend-enhancements-needed)
8. [Migration Checklist](#8-migration-checklist)

---

## 1. ID Type Alignment

### Current Problem: Inconsistent ID Handling

**Backend**: Uses integer auto-increment primary keys (SQL Server standard)
```csharp
public class Board : BaseEntity  // BaseEntity.Id is int
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    // ...
}
```

**Frontend (Current - PROBLEMATIC)**: Uses flexible union types with string transformation
```typescript
export const BoardSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  numericId: z.number().optional(), // Workaround for API calls
  parentId: z.union([z.string(), z.number(), z.null()]).optional(),
  // ...
});
```

### Decision: Frontend Adapts to Integer IDs ✅

**Why integers over strings:**
- ✅ 3-5x faster database performance (indexing, joins)
- ✅ Smaller storage footprint (4 bytes vs 36+ for UUIDs)
- ✅ No collision risk with auto-increment
- ✅ Type safety - clear distinction from string fields
- ✅ Consistency with Meeting module (already uses integers)
- ✅ No mock data to maintain (system not released yet)

### ID Fields to Migrate

| Entity | Current Frontend | Backend Type | Frontend Change |
|--------|-----------------|--------------|-----------------|
| Board.id | `z.union([z.string(), z.number()]).transform(String)` | `int` | Change to `z.number()` |
| Board.parentId | `z.union([z.string(), z.number(), z.null()])` | `int?` | Change to `z.number().nullable()` |
| BoardMembership.id | `z.union([z.string(), z.number()])` | `int` | Change to `z.number()` |
| BoardMembership.userId | `z.union([z.string(), z.number()])` | `int` | Change to `z.number()` |
| BoardMembership.boardId | `z.string()` | `int` | Change to `z.number()` |
| User.id | `z.number()` | `int` | ✅ Already correct |
| UserBoardRole.id | N/A | `int` | Add to frontend types |
| UserBoardRole.userId | N/A | `int` | Add to frontend types |
| UserBoardRole.boardId | N/A | `int?` | Add to frontend types |

### Remove Workaround Fields

- Remove `numericId` field from all schemas (no longer needed)
- Remove all `String(id)` conversions throughout codebase
- Update URL parameter parsing: `Number(useParams().boardId)`

---

## 2. Board Module Mapping

### 2.1 Board Entity

#### Backend Entity (eBoard.Domain.Entities.Board)
```csharp
public class Board : BaseEntity, ISoftDeletable
{
    public string Slug { get; set; }
    public string Name { get; set; }
    public string ShortName { get; set; }
    public string Description { get; set; }
    public int BoardTypeId { get; set; }           // FK to lookup
    public int? ParentId { get; set; }
    public BoardStatus Status { get; set; }        // Enum (0=Active, 1=Inactive)
    public int? ZoneId { get; set; }               // FK to lookup
    public int MemberCount { get; set; }
    public int CommitteeCount { get; set; }
    public int Compliance { get; set; }
    public int MeetingsThisYear { get; set; }
    public DateTime? LastMeetingDate { get; set; }
    public DateTime? NextMeetingDate { get; set; }
    
    // Contact Info (flattened)
    public string? ContactAddress { get; set; }
    public string? ContactPoBox { get; set; }
    public string? ContactCity { get; set; }
    public string? ContactCountry { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactPhoneAlt { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactWebsite { get; set; }
    
    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    
    // Navigation
    public BoardTypeLookup BoardType { get; set; }
    public BoardZoneLookup? Zone { get; set; }
    public Board? Parent { get; set; }
    public ICollection<Board> Children { get; set; }
    public BoardSettings Settings { get; set; }
    public BoardBranding Branding { get; set; }
}
```

#### Frontend Type (src/types/board.types.ts)
```typescript
export const BoardSchema = z.object({
  id: z.number(),                    // CHANGE: Remove union, use number
  slug: z.string().optional(),
  name: z.string(),
  shortName: z.string(),
  description: z.string().nullable().optional(),
  type: BoardTypeSchema,             // Frontend: string enum
  parentId: z.number().nullable().optional(),  // CHANGE: Remove union
  parentName: z.string().nullable().optional(),
  status: BoardStatusSchema,         // Frontend: 'active' | 'inactive'
  zone: ZoneSchema,
  memberCount: z.number().default(0),
  committeeCount: z.number().default(0),
  compliance: z.number().min(0).max(100).default(100),
  meetingsThisYear: z.number().default(0),
  lastMeetingDate: z.string().nullable().optional(),
  nextMeetingDate: z.string().nullable().optional(),
  contactInfo: BoardContactInfoSchema.optional(),
  settings: BoardSettingsSchema.optional(),
  branding: BoardBrandingSchema.optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});
```

#### Field Mapping

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `id` | `Id` | Backend: int, Frontend: CHANGE to number |
| `slug` | `Slug` | Both strings ✅ |
| `name` | `Name` | Both strings ✅ |
| `type` | `BoardType.Code` | Backend: FK to lookup, Frontend: string |
| `parentId` | `ParentId` | Backend: int?, Frontend: CHANGE to number nullable |
| `status` | `Status` | Backend: enum (0/1), Frontend: 'active'/'inactive' |
| `zone` | `Zone.Name` | Backend: FK to lookup, Frontend: string |
| `contactInfo` | Flattened fields | Backend: 8 separate fields, Frontend: nested object |
| `settings` | Navigation property | Backend: 1:1 relation, Frontend: nested object |
| `branding` | Navigation property | Backend: 1:1 relation, Frontend: nested object |

### 2.2 BoardSettings Entity

#### Backend Entity
```csharp
public class BoardSettings : BaseEntity
{
    public int BoardId { get; set; }
    public int QuorumPercentage { get; set; } = 50;
    public int MeetingFrequencyId { get; set; }      // FK to lookup
    public int VotingThresholdId { get; set; }       // FK to lookup
    public bool ConfirmationRequired { get; set; }
    public int ApproverRoleId { get; set; }          // FK to Role
    public int MinMeetingsPerYear { get; set; }
    public bool AllowVirtualMeetings { get; set; }
    public bool RequireAttendanceTracking { get; set; }
    public bool AllowSecretarySkipAgenda { get; set; }
    public bool AllowSecretarySkipDocuments { get; set; }
    public bool RequireApprovalForOverrides { get; set; }
}
```

#### Frontend Type
```typescript
export const BoardSettingsSchema = z.object({
  quorumPercentage: z.number().min(0).max(100).default(50),
  meetingFrequency: MeetingFrequencySchema.default('quarterly'),  // String enum
  votingThreshold: VotingThresholdSchema.default('simple_majority'),
  confirmationRequired: z.boolean().default(true),
  designatedApprover: z.string().optional(),      // MISSING: Should be roleId
  designatedApproverRole: z.string().optional(),  // Role code
  minMeetingsPerYear: z.number().default(4),
  allowVirtualMeetings: z.boolean().default(true),
  requireAttendanceTracking: z.boolean().default(true),
});
```

#### Field Mapping

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `meetingFrequency` | `MeetingFrequency.Code` | Backend: FK, Frontend: string enum |
| `votingThreshold` | `VotingThreshold.Code` | Backend: FK, Frontend: string enum |
| `designatedApprover` | `ApproverRoleId` | Frontend: MISSING proper mapping |
| `designatedApproverRole` | `ApproverRole.Code` | Navigation property |
| **MISSING** | `AllowSecretarySkipAgenda` | Frontend needs to add |
| **MISSING** | `AllowSecretarySkipDocuments` | Frontend needs to add |
| **MISSING** | `RequireApprovalForOverrides` | Frontend needs to add |

### 2.3 BoardBranding Entity

#### Backend Entity
```csharp
public class BoardBranding : BaseEntity
{
    public int BoardId { get; set; }
    public string LogoMain { get; set; }
    public string? LogoSmall { get; set; }
    public string? LogoDark { get; set; }
    public string? LogoLight { get; set; }
    public string PrimaryColor { get; set; }
    // ... 40+ color fields (matches frontend exactly) ✅
}
```

#### Frontend Type
```typescript
export const BoardBrandingSchema = z.object({
  logo: BoardLogoSchema.optional(),
  primaryColor: z.string().default('#324721'),
  // ... 40+ color fields ✅
});
```

**Status**: ✅ Backend and frontend branding fields match well. Only difference is logo structure (backend: flat fields, frontend: nested object).

### 2.4 UserBoardRole (Board Membership)

#### Backend Entity
```csharp
public class UserBoardRole : BaseEntity
{
    public int UserId { get; set; }
    public RoleScope Scope { get; set; }     // Enum: Global=0, Board=1
    public int? BoardId { get; set; }
    public int RoleId { get; set; }
    public bool IsDefault { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int AssignedBy { get; set; }
    
    // Navigation
    public User User { get; set; }
    public Board? Board { get; set; }
    public Role Role { get; set; }
}
```

#### Frontend Type (BoardMemberSchema)
```typescript
export const BoardMemberSchema = z.object({
  id: z.number(),                    // CHANGE: Remove union
  membershipId: z.number().optional(),  // CHANGE: Remove union
  userId: z.number(),                // CHANGE: Remove union
  fullName: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  roleCode: z.string().optional(),
  role: z.string().optional(),
  roleName: z.string().optional(),
  roleId: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  userStatus: z.union([z.string(), z.number()]).optional(),  // CHANGE: to string
});
```

#### Field Mapping

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `id` | `UserBoardRole.Id` | CHANGE to number |
| `userId` | `UserId` | CHANGE to number |
| `roleCode` | `Role.Code` | Navigation property |
| `roleName` | `Role.Name` | Navigation property |
| `roleId` | `RoleId` | Backend: int, Frontend: optional number |
| **MISSING** | `Scope` | Frontend should add (global vs board) |
| **MISSING** | `AssignedBy` | Frontend should add |

---

## 3. User Module Mapping

### 3.1 User Entity

#### Backend Entity (eBoard.Domain.Entities.User)
```csharp
public class User : BaseEntity
{
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string LastName { get; set; }
    public string FullName { get; set; }
    public string? Phone { get; set; }
    public string? AlternatePhone { get; set; }
    public string? AlternateEmail { get; set; }
    public string? EmployeeId { get; set; }
    public string? Avatar { get; set; }
    public string Timezone { get; set; } = "Africa/Nairobi";
    public string? Zone { get; set; }
    public UserStatus Status { get; set; }  // Enum: Active=0, Inactive=1, Pending=2, Suspended=3
    public bool MfaEnabled { get; set; }
    public bool MfaSetupComplete { get; set; }
    public bool HasCertificate { get; set; }
    public DateTime? CertificateExpiry { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    // Auth fields
    public string PasswordHash { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEnd { get; set; }
}
```

#### Frontend Type (src/types/user.types.ts)
```typescript
export const UserSchema = z.object({
  id: z.number(),                    // ✅ Already correct
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  alternatePhone: z.string().nullable(),
  alternateEmail: z.string().email().nullable(),
  employeeId: z.string().nullable(),
  avatar: z.string().nullable(),
  timezone: z.string().default('Africa/Nairobi'),
  primaryRole: SystemRoleSchema,     // COMPUTED from UserBoardRoles
  status: UserStatusSchema,          // 'active' | 'inactive' | 'pending'
  mfaEnabled: z.boolean(),
  mfaSetupComplete: z.boolean(),
  hasCertificate: z.boolean(),
  certificateExpiry: z.string().nullable(),
  boardMemberships: z.array(BoardMembershipSchema),
  lastLogin: z.string().nullable(),
  lastPasswordChange: z.string().nullable(),  // MISSING in backend
  failedLoginAttempts: z.number(),
  lockedUntil: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().nullable(),
});
```

#### Field Mapping

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `id` | `Id` | ✅ Both integers |
| `status` | `Status` | Backend: enum (0-3), Frontend: string |
| `primaryRole` | Computed from `UserBoardRoles` | Backend: needs DTO logic |
| `boardMemberships` | `UserBoardRoles` navigation | Backend: needs DTO mapping |
| `lastLogin` | `LastLoginAt` | Backend: DateTime?, Frontend: string |
| `lockedUntil` | `LockoutEnd` | Backend: DateTime?, Frontend: string |
| `lastPasswordChange` | **MISSING** | Backend needs to add |
| **MISSING** | `MiddleName` | Frontend should add |
| **MISSING** | `Zone` | Frontend should add |
| **MISSING** | `Suspended` status | Frontend enum missing value |

### 3.2 Auth/Login Response

#### Backend DTO (eBoard.Application.Auth.DTOs.LoginResponse)
```csharp
public class LoginResponse
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public DateTime ExpiresAt { get; set; }
    public UserInfo User { get; set; }
}

public class UserInfo
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName { get; set; }
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string Timezone { get; set; }
    public string Status { get; set; }
    public bool MfaEnabled { get; set; }
    public List<UserBoardRoleInfo> BoardRoles { get; set; }
}

public class UserBoardRoleInfo
{
    public int Id { get; set; }
    public string Scope { get; set; }      // "global" or "board"
    public int? BoardId { get; set; }
    public string? BoardSlug { get; set; }
    public string? BoardName { get; set; }
    public int RoleId { get; set; }
    public string RoleCode { get; set; }
    public string RoleName { get; set; }
    public bool IsDefault { get; set; }
    public List<string> Permissions { get; set; }
}
```

#### Frontend Type (src/types/auth.types.ts)
```typescript
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string(),
  user: z.object({
    id: z.number(),                  // ✅ Already correct
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    phone: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    timezone: z.string(),
    status: z.string(),
    mfaEnabled: z.boolean(),
    boardRoles: z.array(UserBoardRoleInfoSchema),
  }),
});

export const UserBoardRoleInfoSchema = z.object({
  id: z.number(),                    // ✅ Already correct
  scope: z.string(),
  boardId: z.number().nullable(),    // ✅ Already correct
  boardSlug: z.string().nullable().optional(),
  boardName: z.string().nullable().optional(),
  roleId: z.number(),                // ✅ Already correct
  roleCode: z.string(),
  roleName: z.string(),
  isDefault: z.boolean(),
  permissions: z.array(z.string()),
});
```

**Status**: ✅ Auth types are already correctly aligned with backend!

---

## 4. Enum & Status Handling

### 4.1 BoardStatus

**Backend Enum**:
```csharp
public enum BoardStatus
{
    Active = 0,
    Inactive = 1
}
```

**Frontend Schema (CURRENT - PROBLEMATIC)**:
```typescript
export const BoardStatusSchema = z.union([
  z.enum(['active', 'inactive', 'Active', 'Inactive']),
  z.number()
]).transform(val => {
  if (typeof val === 'number') return val === 0 ? 'active' : 'inactive';
  return val.toLowerCase() as 'active' | 'inactive';
});
```

**Recommended Frontend Schema**:
```typescript
export const BoardStatusSchema = z.enum(['active', 'inactive']);
```

**Backend DTO Mapping**:
```csharp
Status = board.Status.ToString().ToLower()  // "active" or "inactive"
```

### 4.2 UserStatus

**Backend Enum**:
```csharp
public enum UserStatus
{
    Active = 0,
    Inactive = 1,
    Pending = 2,
    Suspended = 3
}
```

**Frontend Schema (MISSING 'suspended')**:
```typescript
export const UserStatusSchema = z.enum(['active', 'inactive', 'pending']);
```

**Fix**: Add 'suspended' to frontend enum:
```typescript
export const UserStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended']);
```

### 4.3 RoleScope

**Backend Enum**:
```csharp
public enum RoleScope
{
    Global = 0,
    Board = 1
}
```

**Frontend**: Uses string "global" | "board" ✅

**Backend DTO Mapping**:
```csharp
Scope = ubr.Scope.ToString().ToLower()  // "global" or "board"
```

### 4.4 Lookup Tables (BoardType, Zone, etc.)

**Backend Pattern**: Foreign keys to lookup tables
```csharp
public int BoardTypeId { get; set; }
public BoardTypeLookup BoardType { get; set; }  // Navigation
```

**Frontend Pattern**: String codes
```typescript
type: z.string()  // "main", "subsidiary", "factory", "committee"
```

**Backend DTO Mapping**:
```csharp
Type = board.BoardType.Code,
TypeName = board.BoardType.Name
```

---

## 5. DTO Structures

### 5.1 BoardDto (Full Detail)

**Recommended Backend DTO**:
```csharp
public class BoardDto
{
    // IDs as integers
    public int Id { get; set; }
    public string Slug { get; set; }
    public int? ParentId { get; set; }
    public string? ParentName { get; set; }
    
    // Basic info
    public string Name { get; set; }
    public string ShortName { get; set; }
    public string? Description { get; set; }
    public string Type { get; set; }           // BoardType.Code
    public string TypeName { get; set; }       // BoardType.Name
    public string Status { get; set; }         // "active" or "inactive"
    public string? Zone { get; set; }          // Zone.Name
    
    // Counts
    public int MemberCount { get; set; }
    public int CommitteeCount { get; set; }
    
    // Compliance
    public int Compliance { get; set; }
    public int MeetingsThisYear { get; set; }
    public DateTime? LastMeetingDate { get; set; }
    public DateTime? NextMeetingDate { get; set; }
    
    // Contact info (nested object for frontend)
    public BoardContactInfoDto? ContactInfo { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BoardContactInfoDto
{
    public string? Address { get; set; }
    public string? PoBox { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? PhoneAlt { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
}
```

### 5.2 BoardListItemDto (For Tables)

**Current Backend Response** (BoardsController.GetBoards):
```csharp
// Returns anonymous object - should be proper DTO
new {
    Id,
    Slug,
    Name,
    ShortName,
    Description,
    Type = BoardType.Code,
    TypeName = BoardType.Name,
    ParentId,
    ParentName,
    Status,
    Zone,
    MemberCount,
    CommitteeCount,
    Compliance,
    MeetingsThisYear,
    LastMeetingDate,
    NextMeetingDate,
    LogoMain,
    LogoSmall
}
```

**Recommendation**: Create proper DTO class for type safety and reusability.

### 5.3 BoardMemberDto

**Current Backend Response** (BoardsController.GetBoardMembers):
```csharp
new {
    Id = ubr.Id,
    UserId = ubr.UserId,
    Email = ubr.User.Email,
    FullName = ubr.User.FullName,
    Avatar = ubr.User.Avatar,
    Phone = ubr.User.Phone,
    UserStatus = ubr.User.Status,
    RoleId = ubr.RoleId,
    RoleCode = ubr.Role.Code,
    RoleName = ubr.Role.Name,
    IsDefault = ubr.IsDefault,
    StartDate = ubr.StartDate,
    EndDate = ubr.EndDate
}
```

**Frontend Expects**:
```typescript
{
  id: number,
  membershipId: number,
  userId: number,
  fullName: string,
  email: string,
  avatar: string | null,
  roleCode: string,
  role: string,
  roleName: string,
  roleId: number,
  startDate: string,
  endDate: string | null,
  isActive: boolean,
  isDefault: boolean,
  userStatus: string
}
```

**Gaps**:
- Backend returns `Id` but frontend expects both `id` and `membershipId`
- Frontend expects `role` field (should map from `RoleCode`)
- Frontend expects `isActive` (computed from `EndDate`)
- Backend returns `UserStatus` as enum, frontend expects string

### 5.4 UserDto (Full Detail)

**Recommended Backend DTO**:
```csharp
public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string LastName { get; set; }
    public string FullName { get; set; }
    public string? Phone { get; set; }
    public string? AlternatePhone { get; set; }
    public string? AlternateEmail { get; set; }
    public string? EmployeeId { get; set; }
    public string? Avatar { get; set; }
    public string Timezone { get; set; }
    public string? Zone { get; set; }
    public string Status { get; set; }          // "active", "inactive", "pending", "suspended"
    public bool MfaEnabled { get; set; }
    public bool MfaSetupComplete { get; set; }
    public bool HasCertificate { get; set; }
    public DateTime? CertificateExpiry { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEnd { get; set; }
    public List<UserBoardRoleDto> BoardRoles { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### 5.5 UserListItemDto (For Tables)

**Current Backend Response** (UsersController.GetUsers):
```csharp
new {
    Id,
    Email,
    FirstName,
    LastName,
    FullName,
    Phone,
    Avatar,
    PrimaryRole = roleInfo.PrimaryRole,  // Computed
    Status = Status.ToString().ToLower(),
    BoardCount = boardInfo.BoardCount,   // Computed
    MfaEnabled,
    LastLogin,
    CreatedAt
}
```

**Status**: ✅ Matches frontend expectations well!

---

## 6. Frontend Changes Required

### 6.1 Type Definition Changes

**File: `src/types/board.types.ts`**

```typescript
// BEFORE
export const BoardSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  numericId: z.number().optional(),
  parentId: z.union([z.string(), z.number(), z.null()]).optional(),
  // ...
});

// AFTER
export const BoardSchema = z.object({
  id: z.number(),
  slug: z.string().optional(),
  parentId: z.number().nullable().optional(),
  // ...
});

// Apply same changes to:
// - BoardListItemSchema
// - BoardMembershipSchema
// - BoardMemberSchema
// - CommitteeSchema
```

**File: `src/types/user.types.ts`**

```typescript
// ADD 'suspended' to status enum
export const UserStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended']);

// ADD missing fields
export const UserSchema = z.object({
  // ... existing fields
  middleName: z.string().nullable().optional(),
  zone: z.string().nullable().optional(),
  // ...
});
```

**File: `src/types/board.types.ts` - BoardSettings**

```typescript
export const BoardSettingsSchema = z.object({
  // ... existing fields
  allowSecretarySkipAgenda: z.boolean().default(false),
  allowSecretarySkipDocuments: z.boolean().default(false),
  requireApprovalForOverrides: z.boolean().default(true),
});
```

### 6.2 API Layer Changes

**File: `src/api/boards.api.ts`**

```typescript
// BEFORE
updateBoard: async (id: string, payload: UpdateBoardPayload): Promise<Board> => {
  const response = await apiClient.put(`/boards/${id}`, payload);
  return safeParseResponse(BoardSchema, response.data, 'updateBoard');
},

// AFTER
updateBoard: async (id: number, payload: UpdateBoardPayload): Promise<Board> => {
  const response = await apiClient.put(`/boards/${id}`, payload);
  return safeParseResponse(BoardSchema, response.data, 'updateBoard');
},

// Update ALL methods to use number parameters
getBoard: async (id: number) => { ... }
deleteBoard: async (id: number) => { ... }
getBoardMembers: async (boardId: number, ...) => { ... }
// etc.
```

**File: `src/api/users.api.ts`**

Already uses `number` parameters ✅

### 6.3 Context Changes

**File: `src/contexts/BoardContext.tsx`**

```typescript
// BEFORE
return {
  id: b.slug || String(b.id),
  numericId: b.id,
  parentId: b.parentId ? String(b.parentId) : undefined,
  // ...
};

// AFTER
return {
  id: b.id,
  slug: b.slug,
  parentId: b.parentId ?? undefined,
  // ...
};

// Remove ALL String() conversions
// Remove numericId references
```

**File: `src/contexts/MeetingRoomContext.tsx`**

```typescript
// BEFORE
String(p.userId) === String(user.id)

// AFTER
p.userId === user.id
```

### 6.4 Component Changes

**File: `src/pages/Boards/components/BoardMembersSection.tsx`**

```typescript
// BEFORE
const stringBoardId = boardId ? String(boardId) : '';
const initialMembers = existingBoardMembers.map(member => ({
  userId: String(member.userId),
  // ...
}));
let filtered = allUsers.filter(user => !selectedUserIds.has(String(user.id)));

// AFTER
const initialMembers = existingBoardMembers.map(member => ({
  userId: member.userId,  // Keep as number
  // ...
}));
let filtered = allUsers.filter(user => !selectedUserIds.has(user.id));

// Update form field types from string to number
// Update Select.Option value to use numbers
```

**File: `src/pages/Boards/BoardEditPage.tsx`**

```typescript
// BEFORE
const { boardId } = useParams<{ boardId: string }>();
const numericBoardId = boardId ? parseInt(boardId, 10) : undefined;

// AFTER
const { boardId } = useParams<{ boardId: string }>();
const id = boardId ? Number(boardId) : undefined;

if (!id || isNaN(id)) {
  return <NotFound />;
}

// Use `id` (number) throughout
```

### 6.5 Remove Mock Data

- Delete `src/mocks/handlers/boards.handlers.ts`
- Delete `src/mocks/handlers/users.handlers.ts`
- Delete `src/mocks/db/tables/boards.ts`
- Delete `src/mocks/db/tables/users.ts`
- Delete `src/mocks/db/queries/boardQueries.ts`
- Update MSW setup to remove board/user handlers

---

## 7. Backend Enhancements Needed

### 7.1 Create Proper DTOs

**Recommendation**: Replace anonymous objects with proper DTO classes for:
- Type safety
- Reusability
- Documentation
- Easier testing

**Files to Create**:
- `eBoard.Application/Boards/DTOs/BoardDto.cs`
- `eBoard.Application/Boards/DTOs/BoardListItemDto.cs`
- `eBoard.Application/Boards/DTOs/BoardMemberDto.cs`
- `eBoard.Application/Boards/DTOs/BoardSettingsDto.cs`
- `eBoard.Application/Boards/DTOs/BoardBrandingDto.cs`
- `eBoard.Application/Users/DTOs/UserDto.cs`
- `eBoard.Application/Users/DTOs/UserListItemDto.cs`

### 7.2 Add Missing Endpoints

**Boards**:
- ✅ `GET /api/boards` - Exists (with pagination)
- ✅ `GET /api/boards/{id}` - Exists
- ✅ `GET /api/boards/{id}/members` - Exists
- ✅ `GET /api/boards/{id}/settings` - Exists
- ✅ `GET /api/boards/{id}/branding` - Exists
- ✅ `GET /api/boards/{id}/children` - Exists
- ❌ `POST /api/boards` - **MISSING** (Create board)
- ❌ `PUT /api/boards/{id}` - **MISSING** (Update board)
- ❌ `DELETE /api/boards/{id}` - **MISSING** (Soft delete)
- ❌ `POST /api/boards/{id}/members` - **MISSING** (Add member)
- ❌ `DELETE /api/boards/{boardId}/members/{memberId}` - **MISSING** (Remove member)
- ❌ `PUT /api/boards/{id}/settings` - **MISSING** (Update settings)
- ❌ `PUT /api/boards/{id}/branding` - **MISSING** (Update branding)

**Users**:
- ✅ `GET /api/users` - Exists (scoped to user's boards)
- ✅ `GET /api/users/me` - Exists
- ✅ `GET /api/admin/users` - Exists
- ✅ `GET /api/admin/users/{id}` - Exists
- ❌ `POST /api/users` - **MISSING** (Create user)
- ❌ `PUT /api/users/{id}` - **MISSING** (Update user)
- ❌ `DELETE /api/users/{id}` - **MISSING** (Deactivate user)
- ❌ `POST /api/users/{id}/avatar` - **MISSING** (Upload avatar)
- ❌ `POST /api/users/{id}/certificate` - **MISSING** (Upload certificate)

### 7.3 Add Slug-Based Board Lookup

**Current**: Only supports numeric ID lookup
```csharp
[HttpGet("{boardId:int}")]
public async Task<IActionResult> GetBoard(int boardId)
```

**Needed**: Support slug-based lookup
```csharp
[HttpGet("{identifier}")]
public async Task<IActionResult> GetBoard(string identifier)
{
    Board? board;
    
    // Try parse as int first
    if (int.TryParse(identifier, out var id))
    {
        board = await _context.Boards.FindAsync(id);
    }
    else
    {
        // Lookup by slug
        board = await _context.Boards.FirstOrDefaultAsync(b => b.Slug == identifier);
    }
    
    // ...
}
```

### 7.4 Fix Response Format Consistency

**Current Issue**: Some endpoints return raw arrays, some return paginated objects

**Fix**: All list endpoints should return consistent paginated format:
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

**Example**: `GET /api/boards/{id}/members` currently returns raw array, should return:
```csharp
return Ok(ApiResponse<object>.Ok(new PaginatedResponse<BoardMemberDto>
{
    Data = members,
    Total = members.Count,
    Page = 1,
    PageSize = members.Count,
    TotalPages = 1
}));
```

### 7.5 Add Computed Fields

**BoardMemberDto needs**:
- `isActive` - Computed from `EndDate == null || EndDate > DateTime.UtcNow`
- `membershipId` - Map from `UserBoardRole.Id`
- `role` - Map from `Role.Code`

**UserDto needs**:
- `primaryRole` - Computed from `UserBoardRoles.OrderByDescending(r => r.IsDefault).First().Role.Code`
- `boardCount` - Count of distinct boards user is assigned to

---

## 8. Migration Checklist

### Phase 1: Backend Preparation ✅

- [ ] Create DTO classes for Board module
- [ ] Create DTO classes for User module
- [ ] Add missing CRUD endpoints for boards
- [ ] Add missing CRUD endpoints for users
- [ ] Add slug-based board lookup
- [ ] Ensure all list endpoints return paginated format
- [ ] Add computed fields to DTOs (isActive, primaryRole, etc.)
- [ ] Test all endpoints with Postman/Swagger

### Phase 2: Frontend Type Updates ✅

- [ ] Update `board.types.ts` - Remove union types, use `z.number()`
- [ ] Update `user.types.ts` - Add 'suspended' status, missing fields
- [ ] Update `BoardSettingsSchema` - Add missing override fields
- [ ] Remove `numericId` field from all schemas
- [ ] Update `BoardStatusSchema` - Remove complex transform logic
- [ ] Verify all ID fields are `z.number()`

### Phase 3: API Layer Updates ✅

- [ ] Update `boards.api.ts` - All methods use `number` parameters
- [ ] Verify `users.api.ts` - Already uses `number` parameters
- [ ] Update response schemas to match backend DTOs
- [ ] Remove any mock fallback logic

### Phase 4: Context Updates ✅

- [ ] Update `BoardContext.tsx` - Remove `String()` conversions
- [ ] Remove `numericId` logic from BoardContext
- [ ] Update `MeetingRoomContext.tsx` - Remove `String(userId)` comparisons
- [ ] Update any other contexts using board/user IDs

### Phase 5: Component Updates ✅

- [ ] Update `BoardMembersSection.tsx` - Remove all `String()` conversions
- [ ] Update form field types from `string` to `number`
- [ ] Update Select options to use numeric values
- [ ] Update `BoardEditPage.tsx` - Parse URL params, remove conversions
- [ ] Update `BoardsIndexPage.tsx` - Remove `String()` conversions
- [ ] Update all board detail pages - Parse URL params as numbers
- [ ] Add validation for invalid/NaN IDs

### Phase 6: Remove Mock Infrastructure ✅

- [ ] Delete board mock handlers
- [ ] Delete user mock handlers
- [ ] Delete board mock data tables
- [ ] Delete user mock data tables
- [ ] Update MSW setup configuration
- [ ] Remove mock data imports

### Phase 7: Testing ✅

- [ ] Test board list page - IDs display correctly
- [ ] Test board detail page - URL params parse correctly
- [ ] Test board edit page - Form loads and updates work
- [ ] Test board members - Adding/removing works
- [ ] Test user list page - Data loads correctly
- [ ] Test user detail page - Profile displays correctly
- [ ] Test authentication - Login and token refresh work
- [ ] Test board context - Switching boards works
- [ ] Test navigation - All links use numeric IDs

---

## Common Patterns to Replace

```typescript
// ❌ REMOVE THESE PATTERNS
String(board.id)
String(user.id)
board.numericId
boardId ? String(boardId) : ''
String(p.userId) === String(user.id)
selectedUserIds.has(String(user.id))
value={String(u.id)}
z.union([z.string(), z.number()]).transform(String)
parseInt(boardId, 10)

// ✅ REPLACE WITH
board.id
user.id
board.id
boardId
p.userId === user.id
selectedUserIds.has(user.id)
value={u.id}
z.number()
Number(boardId)
```

---

## Summary

This migration will:
- ✅ Eliminate type mismatches between frontend and backend
- ✅ Remove unnecessary `String()` conversions (29+ instances)
- ✅ Simplify code by removing `numericId` workaround
- ✅ Align boards and users with meeting module pattern
- ✅ Fix runtime errors caused by type inconsistencies
- ✅ Enable proper backend integration with type safety
- ✅ Improve performance with native number comparisons
- ✅ Prepare for production deployment

**Recommendation**: Implement this migration for boards and users **before** or **alongside** the meeting migration to ensure consistency across all modules.
