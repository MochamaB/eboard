# eBoard Domain Entity Plan

## Document Information
- **Date**: February 13, 2026
- **Purpose**: Complete mapping of all domain entities from frontend mock tables to C# classes
- **Decisions Applied**: Hybrid enums/lookup tables, no JSON columns, fully relational

---

## 1. Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Enums** | Hard-coded for status/logic fields | Code branches on these values |
| **Lookup Tables** | DB-managed for configurable types | Admin can add/edit from frontend |
| **JSON Columns** | None | Full queryability, reporting, migrations |
| **Nested Objects** | Flattened into columns or 1:1 entities | Simpler queries, indexable |
| **IDs** | `int` auto-increment for all entities | Faster joins, smaller indexes |
| **Enum Storage** | Stored as `int` in DB | Performant queries, type-safe |
| **Dates** | `DateTime` (UTC) | Consistent timezone handling |
| **Soft Delete** | `IsActive` / `Status` fields | No hard deletes on core entities |

---

## 2. Folder Structure

```
eBoard.Domain/
├── Common/
│   ├── BaseEntity.cs                    # int Id, CreatedAt, UpdatedAt
│   ├── IAuditableEntity.cs              # CreatedBy, UpdatedBy interface
│   └── ISoftDeletable.cs                # IsDeleted, DeletedAt interface
│
├── Enums/
│   ├── UserStatus.cs                    # Active, Inactive, Pending, Suspended
│   ├── BoardStatus.cs                   # Active, Inactive
│   ├── RoleScope.cs                     # Global, Board
│   ├── MeetingStatus.cs                 # Draft, Scheduled, InProgress, Completed, Cancelled
│   ├── DraftSubStatus.cs               # Incomplete, Complete
│   ├── ScheduledSubStatus.cs           # PendingApproval, Approved, Rejected
│   ├── CompletedSubStatus.cs           # Recent, Archived
│   ├── LocationType.cs                  # Physical, Virtual, Hybrid
│   ├── RSVPStatus.cs                    # Pending, Accepted, Declined, Tentative, NoResponse
│   ├── AttendanceStatus.cs              # Present, Absent, Late, LeftEarly, Excused
│   ├── AgendaStatus.cs                  # Draft, Published, Archived
│   ├── AgendaItemStatus.cs              # Pending, InProgress, Completed, Skipped
│   ├── DocumentStatus.cs               # Draft, Active, Archived, Deleted
│   ├── DocumentSource.cs               # Upload, Generated, Template, External
│   ├── StorageProvider.cs               # Local, Azure, S3, GCS
│   ├── VoteStatus.cs                    # Draft, Configured, Open, Closed, Archived
│   ├── VoteOutcome.cs                   # Passed, Failed, Invalid
│   ├── MinutesStatus.cs                 # Draft, PendingReview, RevisionRequested, Approved, Published
│   ├── ActionItemStatus.cs              # Open, InProgress, Completed, Cancelled
│   ├── ActionItemPriority.cs            # Low, Medium, High, Urgent
│   ├── ResolutionDecision.cs            # Approved, Rejected, Tabled, Withdrawn, Consensus
│   ├── ImplementationStatus.cs          # Pending, InProgress, Completed, Cancelled
│   ├── DeviceType.cs                    # Mobile, Tablet, Desktop, Unknown
│   ├── SignatureMethod.cs               # Digital, Electronic, Wet
│   ├── MinutesSignatureMethod.cs        # Digital, Biometric, Pin
│   ├── DocumentAccessAction.cs          # View, Download, Print, Share
│   ├── PermissionGranteeType.cs         # User, Role, Board, Committee, Meeting
│   └── CommentType.cs                   # General, Section, Highlight
│
├── Entities/
│   │
│   │── ── ── PHASE 1: Foundation ── ── ──
│   │
│   ├── User.cs
│   ├── Board.cs
│   ├── BoardSettings.cs
│   ├── BoardBranding.cs
│   ├── BoardMeetingRequirement.cs       # 1:1 with BoardSettings (was nested object)
│   ├── BoardMeetingTypeRequirement.cs   # 1:many with BoardSettings (was Record<>)
│   ├── BoardOverrideRole.cs             # 1:many with BoardSettings (was string[])
│   ├── Role.cs
│   ├── Permission.cs
│   ├── RolePermission.cs
│   ├── UserBoardRole.cs
│   ├── UserSession.cs
│   │
│   │── ── ── PHASE 2: Meeting Core ── ── ──
│   │
│   ├── Meeting.cs
│   ├── MeetingParticipant.cs
│   ├── MeetingEvent.cs
│   ├── Agenda.cs
│   ├── AgendaItem.cs
│   ├── Document.cs
│   ├── DocumentVersion.cs
│   ├── DocumentAttachment.cs
│   ├── DocumentPermission.cs
│   ├── DocumentSignature.cs
│   ├── DocumentAccessLog.cs
│   ├── DocumentTag.cs
│   ├── DocumentTagAssignment.cs
│   │
│   │── ── ── PHASE 3: Execution ── ── ──
│   │
│   ├── Vote.cs
│   ├── VoteOption.cs
│   ├── VoteConfiguration.cs
│   ├── VoteEligibility.cs
│   ├── VoteCast.cs
│   ├── VoteResult.cs
│   ├── VoteResultSummary.cs
│   ├── VoteAction.cs
│   ├── Minutes.cs
│   ├── MinutesComment.cs
│   ├── MinutesSignature.cs
│   ├── ActionItem.cs
│   ├── Resolution.cs
│   │
│   │── ── ── PHASE 4: Infrastructure ── ── ──
│   │
│   ├── Notification.cs                  # (new - no mock table yet)
│   ├── NotificationPreference.cs        # (new - no mock table yet)
│   └── AuditLog.cs                      # (new - no mock table yet)
│
└── LookupEntities/
    ├── LookupBase.cs                    # Base: Id, Code, Name, Description, SortOrder, IsActive
    ├── BoardTypeLookup.cs               # main, subsidiary, committee, factory
    ├── MeetingTypeLookup.cs             # regular, special, emergency, agm, committee
    ├── DocumentCategoryLookup.cs        # agenda, minutes, financial, etc.
    ├── BoardZoneLookup.cs               # zone_1 through zone_7
    ├── MeetingFrequencyLookup.cs        # monthly, quarterly, bi_monthly, as_needed
    ├── VotingThresholdLookup.cs         # simple_majority, two_thirds, etc.
    ├── AgendaItemTypeLookup.cs          # discussion, decision, information, committee_report
    ├── ActionItemSourceLookup.cs        # minutes, meeting, agenda_item, manual
    ├── ResolutionCategoryLookup.cs      # policy, financial, operational, strategic, governance
    │
    │── ── ── Templates ── ── ──
    │
    ├── AgendaTemplate.cs                # Reusable agenda templates
    ├── AgendaTemplateItem.cs            # Child items of agenda templates
    ├── MinutesTemplate.cs               # Reusable minutes templates
    └── MinutesTemplateSection.cs        # Child sections of minutes templates
```

---

## 3. Entity Details — Phase 1: Foundation

### 3.1 Common Base Classes

#### `BaseEntity` (for int-keyed entities)
| Property | Type | Notes |
|----------|------|-------|
| Id | `int` | Auto-increment PK |
| CreatedAt | `DateTime` | UTC, set on create |
| UpdatedAt | `DateTime` | UTC, updated on save |

#### `IAuditableEntity` (interface)
| Property | Type | Notes |
|----------|------|-------|
| CreatedBy | `int` | FK → User |
| UpdatedBy | `int?` | FK → User |

#### `ISoftDeletable` (interface)
| Property | Type | Notes |
|----------|------|-------|
| IsDeleted | `bool` | Soft delete flag |
| DeletedAt | `DateTime?` | When deleted |

---

### 3.2 `User`
**Source**: `users.ts` → `UserRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| Email | `string` | unique, required | Login identifier |
| FirstName | `string` | required | |
| MiddleName | `string?` | | |
| LastName | `string` | required | |
| FullName | `string` | computed or stored | |
| Phone | `string?` | | Primary phone |
| AlternatePhone | `string?` | | |
| AlternateEmail | `string?` | | |
| EmployeeId | `string?` | | e.g., "DIR-001" |
| Avatar | `string?` | | URL/path |
| Timezone | `string` | default "Africa/Nairobi" | |
| Zone | `string?` | | e.g., "Zone 3" |
| Status | `UserStatus` | enum → int | Active/Inactive/Pending/Suspended |
| MfaEnabled | `bool` | default false | |
| MfaSetupComplete | `bool` | default false | |
| HasCertificate | `bool` | default false | |
| CertificateExpiry | `DateTime?` | | |
| LastLoginAt | `DateTime?` | | |
| PasswordHash | `string` | **NEW** (not in mock) | For auth |
| RefreshToken | `string?` | **NEW** | JWT refresh |
| RefreshTokenExpiry | `DateTime?` | **NEW** | |
| FailedLoginAttempts | `int` | **NEW** default 0 | Account lockout |
| LockoutEnd | `DateTime?` | **NEW** | |

**Navigation Properties**:
- `ICollection<UserBoardRole> BoardRoles`
- `ICollection<UserSession> Sessions`

---

### 3.3 `Board`
**Source**: `boards.ts` → `BoardRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| Slug | `string` | unique, required | URL-friendly: "ktda-ms", "ketepa" |
| Name | `string` | required | |
| ShortName | `string` | required | |
| Description | `string` | | |
| BoardTypeId | `int` | FK → BoardTypeLookup | Was inline `type` enum |
| ParentId | `int?` | FK → Board (self-ref) | Hierarchy |
| Status | `BoardStatus` | enum → int | Active/Inactive |
| ZoneId | `int?` | FK → BoardZoneLookup | Was inline zone string |
| MemberCount | `int` | default 0 | Denormalized counter |
| CommitteeCount | `int` | default 0 | Denormalized counter |
| Compliance | `int` | default 0 | Percentage |
| MeetingsThisYear | `int` | default 0 | Denormalized counter |
| LastMeetingDate | `DateTime?` | | |
| NextMeetingDate | `DateTime?` | | |
| **Contact Info (flattened)** | | | |
| ContactAddress | `string?` | | |
| ContactPoBox | `string?` | | |
| ContactCity | `string?` | | |
| ContactCountry | `string?` | | |
| ContactPhone | `string?` | | |
| ContactPhoneAlt | `string?` | | |
| ContactEmail | `string?` | | |
| ContactWebsite | `string?` | | |

**Navigation Properties**:
- `BoardTypeLookup BoardType`
- `BoardZoneLookup? Zone`
- `Board? Parent`
- `ICollection<Board> Children`
- `BoardSettings Settings` (1:1)
- `BoardBranding Branding` (1:1)
- `ICollection<UserBoardRole> Members`
- `ICollection<Meeting> Meetings`

---

### 3.4 `BoardSettings`
**Source**: `boardSettings.ts` → `BoardSettingsRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| BoardId | `int` | FK → Board, unique | 1:1 |
| QuorumPercentage | `int` | default 50 | |
| MeetingFrequencyId | `int` | FK → MeetingFrequencyLookup | Was inline enum |
| VotingThresholdId | `int` | FK → VotingThresholdLookup | Was inline enum |
| ConfirmationRequired | `bool` | default true | |
| ApproverRoleId | `int` | FK → Role | Which role approves |
| MinMeetingsPerYear | `int` | default 4 | |
| AllowVirtualMeetings | `bool` | default true | |
| RequireAttendanceTracking | `bool` | default true | |
| **Override Permissions (flattened)** | | | |
| AllowSecretarySkipAgenda | `bool` | default false | |
| AllowSecretarySkipDocuments | `bool` | default false | |
| RequireApprovalForOverrides | `bool` | default true | |

**Navigation Properties**:
- `Board Board`
- `Role ApproverRole`
- `MeetingFrequencyLookup MeetingFrequency`
- `VotingThresholdLookup VotingThreshold`
- `BoardMeetingRequirement MeetingRequirement` (1:1)
- `ICollection<BoardMeetingTypeRequirement> MeetingTypeRequirements`
- `ICollection<BoardOverrideRole> OverrideRoles`

---

### 3.5 `BoardMeetingRequirement`
**Source**: `meetingRequirements.types.ts` → `MeetingRequirements` (was nested in BoardSettings)

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| BoardSettingsId | `int` | FK → BoardSettings, unique | 1:1 |
| MinParticipants | `int` | default 0 | |
| RequireChairman | `bool` | default true | |
| RequireSecretary | `bool` | default true | |
| RequireQuorum | `bool` | default true | |
| QuorumPercentage | `int?` | | Override board default |
| MinAgendaItems | `int` | default 0 | |
| AgendaRequired | `bool` | default true | |
| DocumentsRequired | `bool` | default false | |
| MinDocuments | `int?` | | |
| RequiresApproval | `bool` | default true | |
| AllowAgendaOverride | `bool` | default false | |
| AllowDocumentOverride | `bool` | default false | |
| AllowApprovalOverride | `bool` | default false | |

---

### 3.6 `BoardMeetingTypeRequirement`
**Source**: `meetingRequirements.types.ts` → `meetingTypeRequirements` (was `Record<string, Partial<MeetingRequirements>>`)

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| BoardSettingsId | `int` | FK → BoardSettings | |
| MeetingTypeId | `int` | FK → MeetingTypeLookup | Which meeting type |
| MinParticipants | `int?` | | Null = use default |
| RequireChairman | `bool?` | | |
| RequireSecretary | `bool?` | | |
| RequireQuorum | `bool?` | | |
| QuorumPercentage | `int?` | | |
| MinAgendaItems | `int?` | | |
| AgendaRequired | `bool?` | | |
| DocumentsRequired | `bool?` | | |
| RequiresApproval | `bool?` | | |

---

### 3.7 `BoardOverrideRole`
**Source**: `meetingRequirements.types.ts` → `allowedOverrideRoles: string[]`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| BoardSettingsId | `int` | FK → BoardSettings | |
| RoleId | `int` | FK → Role | |

---

### 3.8 `BoardBranding`
**Source**: `boardBranding.ts` → `BoardBrandingRow` (all 40+ color fields stay flat)

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| BoardId | `int` | FK → Board, unique | 1:1 |
| LogoMain | `string` | | Path/URL |
| LogoSmall | `string?` | | |
| LogoDark | `string?` | | |
| LogoLight | `string?` | | |
| PrimaryColor | `string` | | Hex |
| PrimaryHover | `string` | | |
| PrimaryLight | `string` | | |
| PrimaryContrast | `string` | | |
| SecondaryColor | `string` | | |
| SecondaryHover | `string` | | |
| AccentColor | `string` | | |
| SuccessColor | `string` | | |
| SuccessLight | `string` | | |
| WarningColor | `string` | | |
| WarningLight | `string` | | |
| ErrorColor | `string` | | |
| ErrorLight | `string` | | |
| InfoColor | `string` | | |
| InfoLight | `string` | | |
| BackgroundPrimary | `string` | | |
| BackgroundSecondary | `string` | | |
| BackgroundTertiary | `string` | | |
| BackgroundQuaternary | `string` | | |
| BackgroundHover | `string` | | |
| BackgroundActive | `string` | | |
| BackgroundDisabled | `string` | | |
| TextPrimary | `string` | | |
| TextSecondary | `string` | | |
| TextTertiary | `string` | | |
| TextDisabled | `string` | | |
| TextPlaceholder | `string` | | |
| TextInverse | `string` | | |
| BorderColor | `string` | | |
| BorderColorHover | `string` | | |
| BorderColorLight | `string` | | |
| BorderColorStrong | `string` | | |
| BorderColorFocus | `string` | | |
| DepthLevel1Bg | `string` | | |
| DepthLevel2Bg | `string` | | |
| DepthLevel3Bg | `string` | | |
| SurfaceElevated | `string` | | |
| SurfaceSunken | `string` | | |
| SurfaceOverlay | `string` | | |
| SidebarBg | `string` | | |
| SidebarBgGradient | `string?` | | |
| SidebarTextColor | `string` | | |
| SidebarActiveColor | `string` | | |
| SidebarActiveBg | `string` | | |
| LinkColor | `string` | | |
| LinkHover | `string` | | |
| LinkActive | `string` | | |

---

### 3.9 `Role`
**Source**: `roles.ts` → `RoleRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| Code | `string` | unique, required | "system_admin", "chairman", etc. |
| Name | `string` | required | Display name |
| Description | `string` | | |
| IsSystemRole | `bool` | default false | Cannot be deleted |
| Scope | `RoleScope` | enum → int | Global / Board |

**Navigation Properties**:
- `ICollection<RolePermission> RolePermissions`
- `ICollection<UserBoardRole> UserBoardRoles`

---

### 3.10 `Permission`
**Source**: `permissions.ts` → `PermissionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| Code | `string` | unique, required | "meetings.create", "documents.upload" |
| Name | `string` | required | |
| Description | `string` | | |
| Category | `string` | required | "meetings", "documents", "voting", etc. |

**Navigation Properties**:
- `ICollection<RolePermission> RolePermissions`

---

### 3.11 `RolePermission`
**Source**: `rolePermissions.ts` → `RolePermissionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| RoleId | `int` | PK, FK → Role | Composite key |
| PermissionId | `int` | PK, FK → Permission | Composite key |

**Navigation Properties**:
- `Role Role`
- `Permission Permission`

---

### 3.12 `UserBoardRole`
**Source**: `userBoardRoles.ts` → `UserBoardRoleRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | |
| UserId | `int` | FK → User | |
| Scope | `RoleScope` | enum → int | Must match Role.Scope |
| BoardId | `int?` | FK → Board | Null when scope = Global |
| RoleId | `int` | FK → Role | |
| IsDefault | `bool` | default false | Default board on login |
| StartDate | `DateTime` | required | |
| EndDate | `DateTime?` | | Null = active |
| AssignedBy | `int` | FK → User | |

**Navigation Properties**:
- `User User`
- `Board? Board`
- `Role Role`
- `User AssignedByUser`

---

### 3.13 `UserSession`
**Source**: `userSessions.ts` → `UserSessionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `Guid` | PK | GUID |
| UserId | `int` | FK → User | |
| DeviceType | `DeviceType` | enum → int | |
| DeviceName | `string` | | |
| Browser | `string` | | |
| BrowserVersion | `string` | | |
| OperatingSystem | `string` | | |
| IpAddress | `string` | | |
| Location | `string?` | | |
| UserAgent | `string` | | |
| SessionToken | `string` | | |
| IsActive | `bool` | default true | |
| LastAccessedAt | `DateTime` | | |
| FirstAccessedAt | `DateTime` | | |
| ExpiresAt | `DateTime` | | |

**Navigation Properties**:
- `User User`

---

## 4. Entity Details — Phase 2: Meeting Core

### 4.1 `Meeting`
**Source**: `meetings.ts` → `MeetingRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| ReferenceNumber | `string` | unique, required | Display ID: "MTG-001" format |
| BoardId | `int` | FK → Board | |
| Title | `string` | required | |
| Description | `string` | | |
| MeetingTypeId | `int` | FK → MeetingTypeLookup | Was inline enum |
| ScheduledDate | `DateTime` | | |
| StartTime | `TimeSpan` | | HH:mm |
| EndTime | `TimeSpan` | | HH:mm |
| Duration | `int` | | Minutes |
| Timezone | `string` | default "Africa/Nairobi" | |
| LocationType | `LocationType` | enum → int | Physical/Virtual/Hybrid |
| PhysicalLocation | `string?` | | |
| MeetingLink | `string?` | | |
| Status | `MeetingStatus` | enum → int | Draft/Scheduled/InProgress/Completed/Cancelled |
| SubStatus | `string?` | | Contextual sub-status |
| StatusUpdatedAt | `DateTime` | | |
| OverrideSkipAgenda | `bool` | default false | Was nested object |
| OverrideSkipDocuments | `bool` | default false | |
| OverrideSkipApproval | `bool` | default false | |
| OverrideCustomMinParticipants | `int?` | | |
| OverrideReason | `string?` | | |
| QuorumPercentage | `int` | | |
| QuorumRequired | `int` | | Calculated absolute number |
| RequiresConfirmation | `bool` | | |
| CreatedBy | `int` | FK → User | |

**Navigation Properties**:
- `Board Board`
- `MeetingTypeLookup MeetingType`
- `User Creator`
- `ICollection<MeetingParticipant> Participants`
- `ICollection<MeetingEvent> Events`
- `Agenda? Agenda`
- `ICollection<Vote> Votes`
- `Minutes? Minutes`
- `ICollection<ActionItem> ActionItems`
- `ICollection<Resolution> Resolutions`

---

### 4.2 `MeetingParticipant`
**Source**: `meetingParticipants.ts` → `MeetingParticipantRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MeetingId | `int` | FK → Meeting | |
| UserId | `int` | FK → User | |
| RoleId | `int` | FK → Role | |
| RoleTitle | `string?` | | Denormalized context title (e.g. "Acting Chairman") |
| RsvpStatus | `RSVPStatus` | enum → int | |
| RsvpAt | `DateTime?` | | |
| RsvpNote | `string?` | | |
| AttendanceStatus | `AttendanceStatus?` | enum → int | |
| JoinedAt | `DateTime?` | | |
| LeftAt | `DateTime?` | | |
| CanVote | `bool` | | |
| CanUploadDocuments | `bool` | | |
| CanViewBoardDocuments | `bool` | | |
| CanShareScreen | `bool` | | |
| PresentationTopic | `string?` | | Guest/presenter only |
| PresentationStartTime | `DateTime?` | | |
| PresentationEndTime | `DateTime?` | | |
| AdmittedAt | `DateTime?` | | |
| RemovedAt | `DateTime?` | | |
| IsRequired | `bool` | | For quorum calculation |
| AddedBy | `int` | FK → User | |
| AddedAt | `DateTime` | | |

**Navigation Properties**:
- `Meeting Meeting`
- `User User`
- `Role Role`
- `User AddedByUser`

---

### 4.3 `MeetingEvent`
**Source**: `meetingEvents.ts` → `MeetingEventRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MeetingId | `int` | FK → Meeting | |
| EventType | `string` | required | 31 event types (stored as string) |
| FromStatus | `string?` | | |
| FromSubStatus | `string?` | | |
| ToStatus | `string?` | | |
| ToSubStatus | `string?` | | |
| PerformedBy | `int` | FK → User | |
| PerformedByName | `string` | | Denormalized snapshot |
| PerformedAt | `DateTime` | | |
| Metadata | `string?` | | JSON string for event-specific data |
| CreatedAt | `DateTime` | | |

> **Note**: `Metadata` is the ONE exception where we use a JSON string column. Event metadata is polymorphic (different shape per event type), write-once/read-only, and never queried/filtered on. It's purely for audit display.

---

### 4.4 `Agenda`
**Source**: `agendas.ts` → `AgendaRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MeetingId | `int` | FK → Meeting, unique | 1:1 |
| Status | `AgendaStatus` | enum → int | |
| PublishedAt | `DateTime?` | | |
| PublishedBy | `int?` | FK → User | |
| PublishedByName | `string?` | | Denormalized |
| PdfDocumentId | `int?` | FK → Document | |
| PdfDocumentUrl | `string?` | | |
| Version | `int` | default 1 | |
| TemplateId | `int?` | FK → AgendaTemplate | |
| TemplateName | `string?` | | Denormalized |
| CreatedBy | `int` | FK → User | |
| CreatedByName | `string` | | Denormalized |

**Navigation Properties**:
- `Meeting Meeting`
- `ICollection<AgendaItem> Items`

---

### 4.5 `AgendaItem`
**Source**: `agendaItems.ts` → `AgendaItemRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MeetingId | `int` | FK → Meeting | For direct queries |
| AgendaId | `int` | FK → Agenda | |
| OrderIndex | `int` | | Sort order |
| ParentItemId | `int?` | FK → AgendaItem (self-ref) | Hierarchy |
| ItemNumber | `string` | | "1", "1.1", "1.1.1" |
| Title | `string` | required | |
| Description | `string?` | | |
| ItemTypeId | `int` | FK → AgendaItemTypeLookup | Was inline enum |
| EstimatedDuration | `int` | | Minutes |
| PresenterId | `int?` | FK → User | |
| PresenterName | `string?` | | Denormalized |
| Status | `AgendaItemStatus` | enum → int | |
| ActualStartTime | `DateTime?` | | |
| ActualEndTime | `DateTime?` | | |
| ActualDuration | `int?` | | |
| IsAdHoc | `bool` | default false | Added during meeting |

**Navigation Properties**:
- `Agenda Agenda`
- `AgendaItem? Parent`
- `ICollection<AgendaItem> Children`
- `ICollection<DocumentAttachment> Attachments`
- `ICollection<Vote> Votes`

---

### 4.6 `Document`
**Source**: `documents.ts` → `DocumentRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| Name | `string` | required | |
| Description | `string?` | | |
| FileName | `string` | required | |
| FileExtension | `string` | | |
| FileType | `string` | | pdf, docx, xlsx, etc. |
| MimeType | `string` | | |
| FileSize | `long` | | Bytes |
| PageCount | `int?` | | |
| StorageProvider | `StorageProvider` | enum → int | |
| StorageKey | `string` | | |
| StorageBucket | `string?` | | |
| Url | `string` | | |
| ThumbnailUrl | `string?` | | |
| CategoryId | `int` | FK → DocumentCategoryLookup | |
| BoardId | `int?` | FK → Board | |
| UploadedBy | `int` | FK → User | |
| UploadedByName | `string` | | Denormalized |
| UploadedAt | `DateTime` | | |
| Source | `DocumentSource` | enum → int | |
| Status | `DocumentStatus` | enum → int | |
| IsConfidential | `bool` | default false | |
| WatermarkEnabled | `bool` | default false | |

**Navigation Properties**:
- `Board? Board`
- `User Uploader`
- `ICollection<DocumentVersion> Versions`
- `ICollection<DocumentAttachment> Attachments`
- `ICollection<DocumentPermission> Permissions`
- `ICollection<DocumentSignature> Signatures`
- `ICollection<DocumentAccessLog> AccessLogs`
- `ICollection<DocumentTagAssignment> TagAssignments`

---

### 4.7 `DocumentVersion`
**Source**: `documentVersions.ts` → `DocumentVersionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| DocumentId | `int` | FK → Document | |
| VersionNumber | `int` | | |
| FileName | `string` | | |
| FileSize | `long` | | |
| Url | `string` | | |
| UploadedBy | `int` | FK → User | |
| UploadedByName | `string` | | |
| UploadedAt | `DateTime` | | |
| ChangeNotes | `string?` | | |
| IsLatest | `bool` | | |

---

### 4.8 `DocumentAttachment`
**Source**: `documentAttachments.ts` → `DocumentAttachmentRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| DocumentId | `int` | FK → Document | |
| EntityType | `string` | | "meeting", "agenda_item", "board", etc. |
| EntityId | `int` | | Polymorphic FK (int, resolved by EntityType) |
| AttachedBy | `int` | FK → User | |
| AttachedByName | `string` | | |
| AttachedAt | `DateTime` | | |
| IsPrimary | `bool` | default false | |
| DisplayOrder | `int` | default 0 | |
| Notes | `string?` | | |
| VisibleToGuests | `bool` | default true | |

---

### 4.9 `DocumentPermission`
**Source**: `documentPermissions.ts` → `DocumentPermissionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| DocumentId | `int` | FK → Document | |
| GranteeType | `PermissionGranteeType` | enum → int | |
| GranteeId | `int` | | Polymorphic FK (int, resolved by GranteeType) |
| CanView | `bool` | | |
| CanDownload | `bool` | | |
| CanPrint | `bool` | | |
| CanShare | `bool` | | |
| CanPresent | `bool` | | |
| ExpiresAt | `DateTime?` | | |
| GrantedBy | `int` | FK → User | |
| GrantedByName | `string` | | |
| GrantedAt | `DateTime` | | |

---

### 4.10 `DocumentSignature`
**Source**: `documentSignatures.ts` → `DocumentSignatureRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| DocumentId | `int` | FK → Document | |
| SignedBy | `int` | FK → User | |
| SignedByName | `string` | | |
| SignedAt | `DateTime` | | |
| SignatureMethod | `SignatureMethod` | enum → int | |
| SignatureData | `string?` | | Hash/cert reference |
| CertificateId | `string?` | | |
| IsValid | `bool` | | |
| ValidatedAt | `DateTime?` | | |
| ExpiresAt | `DateTime?` | | |

---

### 4.11 `DocumentAccessLog`
**Source**: `documentAccessLogs.ts` → `DocumentAccessLogRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| DocumentId | `int` | FK → Document | |
| UserId | `int` | FK → User | |
| UserName | `string` | | Denormalized |
| Action | `DocumentAccessAction` | enum → int | |
| IpAddress | `string?` | | |
| UserAgent | `string?` | | |
| AccessedAt | `DateTime` | | |

---

### 4.12 `DocumentTag`
**Source**: `documentTags.ts` → `DocumentTagRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| Name | `string` | required | |
| Slug | `string` | unique | |
| Color | `string?` | | Hex |
| Description | `string?` | | |
| BoardId | `int?` | FK → Board | Null = system-wide |
| IsSystem | `bool` | default false | |
| CreatedAt | `DateTime` | | |
| CreatedBy | `int?` | FK → User | |

---

### 4.13 `DocumentTagAssignment`
**Source**: `documentTags.ts` → `DocumentTagAssignmentRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| DocumentId | `int` | FK → Document | |
| TagId | `int` | FK → DocumentTag | |
| AssignedBy | `int` | FK → User | |
| AssignedAt | `DateTime` | | |

---

## 5. Entity Details — Phase 3: Execution

### 5.1 `Vote`
**Source**: `votes.ts` → `VoteRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| EntityType | `string?` | | "agenda", "agenda_item", etc. |
| EntityId | `int?` | | Polymorphic FK (int, resolved by EntityType) |
| MeetingId | `int` | FK → Meeting | |
| BoardId | `int` | FK → Board | |
| Title | `string` | required | |
| Description | `string?` | | |
| Status | `VoteStatus` | enum → int | |
| Outcome | `VoteOutcome?` | enum → int | |
| CreatedBy | `int` | FK → User | |
| CreatedByName | `string` | | |
| CreatedAt | `DateTime` | | |
| OpenedAt | `DateTime?` | | |
| ClosedAt | `DateTime?` | | |

**Navigation Properties**:
- `Meeting Meeting`
- `Board Board`
- `VoteConfiguration Configuration` (1:1)
- `ICollection<VoteOption> Options`
- `ICollection<VoteEligibility> EligibleVoters`
- `ICollection<VoteCast> CastVotes`
- `VoteResultSummary? ResultSummary`
- `ICollection<VoteResult> Results`
- `ICollection<VoteAction> Actions`

---

### 5.2 `VoteOption`
**Source**: `voteOptions.ts` → `VoteOptionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| VoteId | `int` | FK → Vote | |
| Label | `string` | required | |
| Description | `string?` | | |
| DisplayOrder | `int` | | |

---

### 5.3 `VoteConfiguration`
**Source**: `voteConfigurations.ts` → `VoteConfigurationRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| VoteId | `int` | FK → Vote, unique | 1:1 |
| VotingMethod | `string` | | "yes_no", "yes_no_abstain", "multiple_choice", "ranked" |
| QuorumRequired | `bool` | | |
| QuorumPercentage | `int` | | |
| PassThresholdPercentage | `int` | | |
| PassingRule | `string` | | "simple_majority", "two_thirds", etc. |
| Anonymous | `bool` | | Secret ballot |
| AllowAbstain | `bool` | | |
| AllowChangeVote | `bool` | | |
| TimeLimit | `int?` | | Seconds |
| AutoCloseWhenAllVoted | `bool` | | |
| CreatedAt | `DateTime` | | |

---

### 5.4 `VoteEligibility`
**Source**: `voteEligibility.ts` → `VoteEligibilityRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| VoteId | `int` | FK → Vote | |
| UserId | `int` | FK → User | |
| UserName | `string` | | Denormalized |
| UserRole | `string` | | Denormalized |
| Weight | `decimal` | default 1.0 | |
| Eligible | `bool` | default true | |

---

### 5.5 `VoteCast`
**Source**: `votesCast.ts` → `VoteCastRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| VoteId | `int` | FK → Vote | |
| OptionId | `int` | FK → VoteOption | |
| UserId | `int?` | FK → User | Null if anonymous |
| UserName | `string?` | | |
| WeightApplied | `decimal` | | |
| CastAt | `DateTime` | | |
| IpAddress | `string?` | | |
| UserAgent | `string?` | | |

---

### 5.6 `VoteResult`
**Source**: `voteResults.ts` → `VoteResultRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| VoteId | `int` | PK, FK → Vote | Composite key |
| OptionId | `int` | PK, FK → VoteOption | Composite key |
| OptionLabel | `string` | | Denormalized |
| TotalWeight | `decimal` | | |
| VoteCount | `int` | | |
| Percentage | `decimal` | | |
| IsWinner | `bool` | | |

---

### 5.7 `VoteResultSummary`
**Source**: `voteResults.ts` → `VoteResultsSummaryRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| VoteId | `int` | PK, FK → Vote | 1:1 |
| TotalEligible | `int` | | |
| TotalVoted | `int` | | |
| TotalWeight | `decimal` | | |
| QuorumRequired | `int` | | |
| QuorumMet | `bool` | | |
| ThresholdPercentage | `decimal` | | |
| Outcome | `VoteOutcome` | enum → int | |
| ComputedAt | `DateTime` | | |

---

### 5.8 `VoteAction`
**Source**: `voteActions.ts` → `VoteActionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| VoteId | `int` | FK → Vote | |
| ActionType | `string` | | "created", "opened", "vote_cast", etc. |
| PerformedBy | `int` | FK → User | |
| PerformedByName | `string` | | |
| Metadata | `string?` | | JSON string (audit data, same exception as MeetingEvent) |
| CreatedAt | `DateTime` | | |

---

### 5.9 `Minutes`
**Source**: `minutes.ts` → `MinutesRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MeetingId | `int` | FK → Meeting, unique | 1:1 |
| Content | `string` | | HTML from TipTap |
| ContentPlainText | `string` | | For search |
| TemplateId | `int?` | FK → MinutesTemplate | |
| Status | `MinutesStatus` | enum → int | |
| CreatedBy | `int` | FK → User | |
| SubmittedAt | `DateTime?` | | |
| SubmittedBy | `int?` | FK → User | |
| ApprovedAt | `DateTime?` | | |
| ApprovedBy | `int?` | FK → User | |
| ApprovalNotes | `string?` | | |
| RevisionRequestedAt | `DateTime?` | | |
| RevisionRequestedBy | `int?` | FK → User | |
| RevisionReason | `string?` | | |
| PublishedAt | `DateTime?` | | |
| PublishedBy | `int?` | FK → User | |
| Version | `int` | default 1 | |
| PdfUrl | `string?` | | |
| AllowComments | `bool` | default true | |
| ReviewDeadline | `DateTime?` | | |
| WordCount | `int` | default 0 | |
| EstimatedReadTime | `int` | default 0 | Minutes |

**Navigation Properties**:
- `Meeting Meeting`
- `ICollection<MinutesComment> Comments`
- `ICollection<MinutesSignature> Signatures`

---

### 5.10 `MinutesComment`
**Source**: `minutesComments.ts` → `MinutesCommentRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MinutesId | `int` | FK → Minutes | |
| Comment | `string` | required | |
| CommentType | `CommentType` | enum → int | |
| SectionReference | `string?` | | |
| HighlightedText | `string?` | | |
| TextPositionStart | `int?` | | Was nested object, flattened |
| TextPositionEnd | `int?` | | |
| CreatedBy | `int` | FK → User | |
| CreatedAt | `DateTime` | | |
| UpdatedAt | `DateTime?` | | |
| Resolved | `bool` | default false | |
| ResolvedAt | `DateTime?` | | |
| ResolvedBy | `int?` | FK → User | |
| ParentCommentId | `int?` | FK → MinutesComment (self-ref) | Threading |
| SecretaryResponse | `string?` | | |
| RespondedAt | `DateTime?` | | |
| RespondedBy | `int?` | FK → User | |

---

### 5.11 `MinutesSignature`
**Source**: `minutesSignatures.ts` → `MinutesSignatureRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MinutesId | `int` | FK → Minutes | |
| SignedBy | `int` | FK → User | |
| SignerRole | `string` | | |
| SignerName | `string` | | |
| SignatureHash | `string` | | |
| SignatureMethod | `MinutesSignatureMethod` | enum → int | |
| CertificateId | `string?` | | |
| Verified | `bool` | default false | |
| VerificationDate | `DateTime?` | | |
| SignedAt | `DateTime` | | |
| SignatureData | `string?` | | Image/drawn signature |

---

### 5.12 `ActionItem`
**Source**: `actionItems.ts` → `ActionItemRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| Source | `string` | | "minutes", "meeting", "agenda_item", "manual" |
| SourceId | `int?` | | Polymorphic FK (int, resolved by Source) |
| MeetingId | `int` | FK → Meeting | |
| BoardId | `int` | FK → Board | |
| Title | `string` | required | |
| Description | `string?` | | |
| AssignedTo | `int` | FK → User | |
| AssignedBy | `int` | FK → User | |
| DueDate | `DateTime` | | |
| Priority | `ActionItemPriority` | enum → int | |
| Status | `ActionItemStatus` | enum → int | |
| CompletedAt | `DateTime?` | | |
| CompletedBy | `int?` | FK → User | |
| CompletionNotes | `string?` | | |
| RelatedAgendaItemId | `int?` | FK → AgendaItem | |
| ReminderSent | `bool` | default false | |
| LastReminderSentAt | `DateTime?` | | |

**Navigation Properties**:
- `Meeting Meeting`
- `Board Board`
- `User Assignee`
- `User Assigner`
- `AgendaItem? RelatedAgendaItem`

---

### 5.13 `Resolution`
**Source**: `resolutions.ts` → `ResolutionRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MeetingId | `int` | FK → Meeting | |
| BoardId | `int` | FK → Board | |
| ResolutionNumber | `string` | unique | "RES-KETE-2025-001" |
| Title | `string` | required | |
| Text | `string` | | Full resolution text |
| CategoryId | `int` | FK → ResolutionCategoryLookup | Was inline enum |
| Decision | `ResolutionDecision` | enum → int | |
| DecisionDate | `DateTime` | | |
| VoteId | `int?` | FK → Vote | |
| VoteSummary | `string?` | | |
| AgendaItemId | `int?` | FK → AgendaItem | |
| RequiresFollowUp | `bool` | default false | |
| FollowUpDeadline | `DateTime?` | | |
| FollowUpNotes | `string?` | | |
| ImplementationStatus | `ImplementationStatus` | enum → int | |
| ImplementedAt | `DateTime?` | | |
| CreatedBy | `int` | FK → User | |

**Navigation Properties**:
- `Meeting Meeting`
- `Board Board`
- `Vote? Vote`
- `AgendaItem? AgendaItem`
- `ResolutionCategoryLookup Category`

---

## 6. Lookup Tables (Admin-Configurable)

All lookup tables share a common base:

### `LookupBase`
| Property | Type | Notes |
|----------|------|-------|
| Id | `int` | Auto-increment PK |
| Code | `string` | Unique, machine-readable |
| Name | `string` | Display name |
| Description | `string?` | |
| SortOrder | `int` | For UI ordering |
| IsActive | `bool` | Soft-disable |

### Lookup Entities (all extend LookupBase)

| Entity | Source | Extra Fields |
|--------|--------|-------------|
| `BoardTypeLookup` | `boardTypes.ts` | `Icon` (string) |
| `MeetingTypeLookup` | `meetingTypes.ts` | `DefaultDuration` (int), `RequiresNotice` (bool), `NoticeMinimumDays` (int?) |
| `DocumentCategoryLookup` | `documentCategories.ts` | `Color` (string), `Icon` (string?), `IsSystem` (bool), `BoardId` (int? FK) |
| `BoardZoneLookup` | — (new) | — |
| `MeetingFrequencyLookup` | — (from boardSettings enum) | — |
| `VotingThresholdLookup` | — (from boardSettings enum) | `Percentage` (int) |
| `AgendaItemTypeLookup` | `agendaItems.ts` | — |
| `ResolutionCategoryLookup` | `resolutions.ts` | — |

---

## 7. Template Entities (Full Details)

### 7.1 `AgendaTemplate`
**Source**: `agendaTemplates.ts` → `AgendaTemplateRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| Name | `string` | required | |
| Description | `string?` | | |
| BoardTypeId | `int?` | FK → BoardTypeLookup | Null = all board types |
| IsGlobal | `bool` | default true | Available to all boards |
| CreatedBy | `int` | FK → User | |
| CreatedByName | `string` | | Denormalized |
| CreatedAt | `DateTime` | | |
| UpdatedAt | `DateTime` | | |

**Navigation Properties**:
- `BoardTypeLookup? BoardType`
- `User Creator`
- `ICollection<AgendaTemplateItem> Items`

---

### 7.2 `AgendaTemplateItem`
**Source**: `agendaTemplates.ts` → `AgendaTemplateItemData` (was JSON array in template)

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| AgendaTemplateId | `int` | FK → AgendaTemplate | |
| OrderIndex | `int` | | Sort order |
| ParentItemId | `int?` | FK → AgendaTemplateItem (self-ref) | Hierarchy |
| Title | `string` | required | |
| Description | `string?` | | |
| ItemTypeId | `int` | FK → AgendaItemTypeLookup | |
| EstimatedDuration | `int` | | Minutes |

**Navigation Properties**:
- `AgendaTemplate Template`
- `AgendaTemplateItem? Parent`
- `ICollection<AgendaTemplateItem> Children`
- `AgendaItemTypeLookup ItemType`

---

### 7.3 `MinutesTemplate`
**Source**: `minutesTemplates.ts` → `MinutesTemplateRow`

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| Name | `string` | required | |
| Description | `string?` | | |
| BoardTypeId | `int?` | FK → BoardTypeLookup | Null = all board types |
| MeetingTypeId | `int?` | FK → MeetingTypeLookup | Null = all meeting types |
| HtmlTemplate | `string` | | HTML structure with placeholders |
| IsGlobal | `bool` | default true | |
| CreatedBy | `int` | FK → User | |
| CreatedByName | `string` | | Denormalized |
| CreatedAt | `DateTime` | | |
| UpdatedAt | `DateTime` | | |

**Navigation Properties**:
- `BoardTypeLookup? BoardType`
- `MeetingTypeLookup? MeetingType`
- `User Creator`
- `ICollection<MinutesTemplateSection> Sections`

---

### 7.4 `MinutesTemplateSection`
**Source**: `minutesTemplates.ts` → `MinutesTemplateSectionData` (was JSON array in template)

| Property | Type | DB Column | Notes |
|----------|------|-----------|-------|
| Id | `int` | PK | Auto-increment |
| MinutesTemplateId | `int` | FK → MinutesTemplate | |
| OrderIndex | `int` | | Sort order |
| Title | `string` | required | |
| Placeholder | `string` | | Default content hint |
| Required | `bool` | default false | |
| AutoPopulate | `bool` | default false | Auto-fill from meeting data |

**Navigation Properties**:
- `MinutesTemplate Template`

---

## 8. Entity Count Summary

| Phase | Entities | Enums | Lookups |
|-------|----------|-------|---------|
| **Common** | 1 base + 2 interfaces | — | 1 base |
| **Phase 1: Foundation** | 10 | 3 | 4 |
| **Phase 2: Meeting Core** | 11 | 7 | 2 |
| **Phase 3: Execution** | 13 | 10 | 1 |
| **Phase 4: Infrastructure** | 3 (new) | — | — |
| **Templates** | 4 | — | — |
| **TOTAL** | **42 entities** | **20 enums** | **8 lookups + 4 templates** |

> **Changes from previous version**: Removed `BaseStringEntity` (all PKs are now `int`), removed `MeetingConfirmationHistory`, removed `ConfirmationEventType` enum, removed `RejectionReasonLookup`. All string IDs/FKs converted to `int`. All enums stored as `int` in DB. Added `Board.Slug`, `Meeting.ReferenceNumber` for human-readable identifiers. Added full template entity detail sections.

---

## 9. Implementation Order

### Step 1: Common + Enums (do first)
Create `Common/`, all `Enums/`, and `LookupBase`

### Step 2: Phase 1 Entities
User, Board, BoardSettings, BoardBranding, BoardMeetingRequirement, BoardMeetingTypeRequirement, BoardOverrideRole, Role, Permission, RolePermission, UserBoardRole, UserSession + Phase 1 lookups

### Step 3: Phase 2 Entities
Meeting, MeetingParticipant, MeetingEvent, Agenda, AgendaItem, Document + all document sub-entities + Phase 2 lookups

### Step 4: Phase 3 Entities
Vote + all vote sub-entities, Minutes + sub-entities, ActionItem, Resolution + Phase 3 lookups

### Step 5: Templates
AgendaTemplate, AgendaTemplateItem, MinutesTemplate, MinutesTemplateSection

### Step 6: Phase 4 Entities
Notification, NotificationPreference, AuditLog
