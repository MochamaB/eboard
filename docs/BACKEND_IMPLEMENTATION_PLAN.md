# eBoard Backend Implementation Plan

## Document Information
- **Project Name**: eBoard Meeting System
- **Version**: 1.0
- **Date**: February 13, 2026
- **Technology Stack**: ASP.NET Core 8 Web API, SQL Server, Entity Framework Core, SignalR
- **Architecture**: Clean Architecture (N-Tier)

---

## 1. Project Structure

```
eBoard-api/
├── eBoard.sln
├── eBoard.Domain/              # Entities, Enums, Value Objects, Interfaces
│   ├── Entities/
│   ├── Enums/
│   ├── ValueObjects/
│   └── Interfaces/
├── eBoard.Application/         # Business Logic, DTOs, Services, Validators
│   ├── DTOs/
│   ├── Interfaces/
│   ├── Services/
│   ├── Validators/
│   └── Mappings/
├── eBoard.Infrastructure/      # EF Core, Repositories, External Services
│   ├── Data/
│   │   ├── Context/
│   │   ├── Configurations/     # Fluent API entity configs
│   │   ├── Migrations/
│   │   └── Seeders/
│   ├── Repositories/
│   └── Services/
└── eBoard.API/                 # Controllers, Middleware, SignalR Hubs
    ├── Controllers/
    ├── Hubs/
    ├── Middleware/
    └── Filters/
```

---

## 2. Scaffolding Commands

```powershell
# Create solution
dotnet new sln -n eBoard -o C:\Users\KTDA\source\repos\eboard-api
cd C:\Users\KTDA\source\repos\eboard-api

# Create projects
dotnet new classlib -n eBoard.Domain
dotnet new classlib -n eBoard.Application
dotnet new classlib -n eBoard.Infrastructure
dotnet new webapi -n eBoard.API

# Add to solution
dotnet sln add eBoard.Domain eBoard.Application eBoard.Infrastructure eBoard.API

# Add project references
dotnet add eBoard.Application reference eBoard.Domain
dotnet add eBoard.Infrastructure reference eBoard.Application
dotnet add eBoard.API reference eBoard.Infrastructure

# Key NuGet packages — Domain
dotnet add eBoard.Domain package MediatR.Contracts

# Key NuGet packages — Application
dotnet add eBoard.Application package AutoMapper
dotnet add eBoard.Application package FluentValidation
dotnet add eBoard.Application package MediatR

# Key NuGet packages — Infrastructure
dotnet add eBoard.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
dotnet add eBoard.Infrastructure package Microsoft.EntityFrameworkCore.Tools
dotnet add eBoard.Infrastructure package Microsoft.AspNetCore.Identity.EntityFrameworkCore

# Key NuGet packages — API
dotnet add eBoard.API package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add eBoard.API package Microsoft.AspNetCore.SignalR
dotnet add eBoard.API package Swashbuckle.AspNetCore
dotnet add eBoard.API package Serilog.AspNetCore
```

---

## 3. Implementation Phases

### Phase 1: Foundation (Week 1–2)

#### 1.1 Domain Entities
Map from existing TypeScript types (`src/types/*.types.ts`) and mock tables (`src/mocks/db/tables/*.ts`).

| Priority | Entity | Source Mock Table | Key Relationships |
|----------|--------|-------------------|-------------------|
| 1 | `User` | `users.ts` | → UserBoardRoles, MeetingParticipants |
| 2 | `Board` | `boards.ts` | → BoardSettings, BoardBranding, BoardTypes |
| 3 | `BoardType` | `boardTypes.ts` | → Boards |
| 4 | `BoardSettings` | `boardSettings.ts` | → Board (1:1) |
| 5 | `BoardBranding` | `boardBranding.ts` | → Board (1:1) |
| 6 | `Role` | `roles.ts` | → RolePermissions, UserBoardRoles |
| 7 | `Permission` | `permissions.ts` | → RolePermissions |
| 8 | `RolePermission` | `rolePermissions.ts` | → Role, Permission |
| 9 | `UserBoardRole` | `userBoardRoles.ts` | → User, Board, Role |
| 10 | `UserSession` | `userSessions.ts` | → User |

#### 1.2 Database Context & Configuration
- Create `eBoardDbContext` extending `IdentityDbContext`
- Fluent API configurations for each entity (indexes, constraints, relationships)
- Initial migration + seed data (port from mock table data)

#### 1.3 Authentication & Authorization
- JWT access token + refresh token flow
- ASP.NET Identity for user management
- Custom `IAuthorizationHandler` for multi-board role checks
- Claims: `userId`, `boardId`, `roles[]`, `permissions[]`
- Middleware: extract `boardId` from route, validate user membership

#### 1.4 Base CRUD Controllers
- `AuthController` — login, refresh, logout, change-password
- `UsersController` — CRUD, board memberships, sessions
- `BoardsController` — CRUD, settings, branding, members
- `RolesController` — CRUD, permission assignments

#### 1.5 API Conventions
- Route pattern: `api/{boardId}/[resource]` (mirrors frontend `/:boardId/` routing)
- Global routes (cross-board): `api/admin/[resource]`
- Standard response envelope: `{ data, message, errors, pagination }`
- Pagination: `?page=1&pageSize=20&sortBy=&sortOrder=`
- Filtering: query string parameters matching frontend filter patterns

---

### Phase 2: Meeting Core (Week 3–4)

#### 2.1 Meeting Entities

| Priority | Entity | Source Mock Table | Key Relationships |
|----------|--------|-------------------|-------------------|
| 1 | `Meeting` | `meetings.ts` | → Board, MeetingType, Participants, Agendas |
| 2 | `MeetingType` | `meetingTypes.ts` | → Meetings |
| 3 | `MeetingParticipant` | `meetingParticipants.ts` | → Meeting, User |
| 4 | `MeetingEvent` | `meetingEvents.ts` | → Meeting, User |
| 5 | `MeetingConfirmationHistory` | `meetingConfirmationHistory.ts` | → Meeting, MeetingParticipant |
| 6 | `Agenda` | `agendas.ts` | → Meeting, AgendaItems |
| 7 | `AgendaItem` | `agendaItems.ts` | → Agenda, parent AgendaItem |
| 8 | `AgendaTemplate` | `agendaTemplates.ts` | → Board |
| 9 | `Document` | `documents.ts` | → Board, Meeting |
| 10 | `DocumentCategory` | `documentCategories.ts` | → Documents |
| 11 | `DocumentVersion` | `documentVersions.ts` | → Document |
| 12 | `DocumentAttachment` | `documentAttachments.ts` | → AgendaItem, Meeting |
| 13 | `DocumentPermission` | `documentPermissions.ts` | → Document, User/Role |
| 14 | `DocumentTag` | `documentTags.ts` | → Document |
| 15 | `DocumentSignature` | `documentSignatures.ts` | → Document, User |
| 16 | `DocumentAccessLog` | `documentAccessLogs.ts` | → Document, User |

#### 2.2 Meeting State Machine
Central to the application — implement as a domain service:

```
Status Flow:
  draft (incomplete | complete)
    → scheduled (pending_approval | approved | rejected)
      → in_progress
        → completed (recent | archived)
    → cancelled

Allowed Transitions:
  draft.incomplete  → draft.complete        (validation passes)
  draft.complete    → scheduled.pending_approval (secretary submits)
  draft.complete    → scheduled.approved    (direct schedule, if permitted)
  scheduled.pending_approval → scheduled.approved  (approver approves)
  scheduled.pending_approval → scheduled.rejected  (approver rejects)
  scheduled.rejected → draft.complete       (secretary revises)
  scheduled.approved → in_progress          (host starts meeting)
  scheduled.approved → cancelled            (authorized cancellation)
  in_progress       → completed.recent      (host ends meeting)
  completed.recent  → completed.archived    (auto after X days or manual)
  any (except completed/cancelled) → cancelled
```

Implement as `MeetingStateMachine` service with:
- `CanTransition(meeting, targetStatus, user)` — permission check
- `Transition(meeting, targetStatus, user, reason?)` — execute + emit event
- `GetAllowedTransitions(meeting, user)` — for UI display
- Each transition creates a `MeetingEvent` audit record

#### 2.3 Meeting CRUD
- `MeetingsController` — full CRUD with status-aware validation
- Create: validates required fields per status (mirrors `meetingValidation.ts`)
- Update: only allowed fields based on current status + user role
- Participants: invite, confirm, update role, remove (mirrors `confirmationWorkflow.ts`)
- Agenda: hierarchical CRUD, reorder, time allocation
- Documents: upload to storage, attach to meetings/agenda items

#### 2.4 Approval Workflow
- `ApprovalsController` — list pending, review, approve/reject
- Approval creates `MeetingEvent` with type `approval_granted` or `approval_rejected`
- Rejection requires reason, transitions meeting back to `draft.complete`
- Notification trigger on approval status change

---

### Phase 3: Meeting Execution (Week 5–6)

#### 3.1 Voting Entities

| Priority | Entity | Source Mock Table |
|----------|--------|-------------------|
| 1 | `Vote` | `votes.ts` |
| 2 | `VoteOption` | `voteOptions.ts` |
| 3 | `VoteConfiguration` | `voteConfigurations.ts` |
| 4 | `VoteEligibility` | `voteEligibility.ts` |
| 5 | `VoteCast` | `votesCast.ts` |
| 6 | `VoteResult` | `voteResults.ts` |
| 7 | `VoteAction` | `voteActions.ts` |

#### 3.2 Voting Engine
- `VotingService` — create vote, open/close, cast ballot, tally results
- Support voting methods: simple_majority, two_thirds, unanimous, weighted
- Secret ballot: store votes without linking to user (separate audit trail)
- Quorum check before allowing vote to proceed
- Auto-close on timer expiry or all eligible votes cast
- Results calculation with tie-breaking rules

#### 3.3 Minutes Entities

| Priority | Entity | Source Mock Table |
|----------|--------|-------------------|
| 1 | `Minutes` | `minutes.ts` |
| 2 | `MinutesTemplate` | `minutesTemplates.ts` |
| 3 | `MinutesComment` | `minutesComments.ts` |
| 4 | `MinutesSignature` | `minutesSignatures.ts` |

#### 3.4 Minutes Workflow
- Auto-populate from meeting data (agenda, votes, attendance) — mirrors `minutesAutoPopulation.ts`
- Rich text storage (HTML from TipTap editor)
- Review workflow: draft → in_review → revision_requested → approved → signed
- Comment/annotation system per section
- Digital signature collection (Chairman + Secretary minimum)
- PDF export generation

#### 3.5 Action Items & Resolutions

| Entity | Source Mock Table |
|--------|-------------------|
| `ActionItem` | `actionItems.ts` |
| `Resolution` | `resolutions.ts` |

- Action items: assign, track, update status, due date reminders
- Resolutions: create from vote results, numbering, categorization

---

### Phase 4: Real-Time & Notifications (Week 7–8)

#### 4.1 SignalR Hub — `MeetingRoomHub`
Central hub for live meeting features:

```csharp
public class MeetingRoomHub : Hub
{
    // Connection management
    Task JoinMeetingRoom(string meetingId)
    Task LeaveMeetingRoom(string meetingId)
    
    // Participant presence
    Task UpdateParticipantStatus(string meetingId, string status)  // connected, in_room, away
    Task UpdateConnectionType(string meetingId, string type)       // physical, virtual
    
    // Meeting control (host only)
    Task StartMeeting(string meetingId)
    Task PauseMeeting(string meetingId)
    Task ResumeMeeting(string meetingId)
    Task EndMeeting(string meetingId)
    
    // Agenda progression
    Task MoveToAgendaItem(string meetingId, string agendaItemId)
    Task StartAgendaTimer(string meetingId, string agendaItemId)
    Task PauseAgendaTimer(string meetingId, string agendaItemId)
    
    // Voting
    Task OpenVote(string meetingId, string voteId)
    Task CastVote(string meetingId, string voteId, string optionId)
    Task CloseVote(string meetingId, string voteId)
    
    // Document casting (show document to all participants)
    Task CastDocument(string meetingId, string documentId, int? page)
    Task StopCasting(string meetingId)
    
    // Chat/Notes (optional)
    Task SendMessage(string meetingId, string message)
}
```

**Broadcast Events (Server → Clients):**
- `ParticipantJoined`, `ParticipantLeft`, `ParticipantStatusChanged`
- `MeetingStarted`, `MeetingPaused`, `MeetingResumed`, `MeetingEnded`
- `AgendaItemChanged`, `AgendaTimerUpdate`
- `VoteOpened`, `VoteCastReceived`, `VoteClosed`, `VoteResultsAvailable`
- `DocumentCasted`, `DocumentPageChanged`, `CastingStopped`
- `ModeChanged` (physical/virtual/hybrid transition)

#### 4.2 Notification Service
- `INotificationService` with implementations:
  - `InAppNotificationService` — store in DB, deliver via SignalR
  - `EmailNotificationService` — SendGrid/SMTP for meeting invites, reminders, approvals
- Notification triggers:
  - Meeting created/updated/cancelled
  - Participant invited/removed
  - Approval requested/granted/rejected
  - Vote opened/closed
  - Minutes ready for review/approved
  - Action item assigned/due soon/overdue
  - Meeting starting soon (15min, 5min reminders)

#### 4.3 Background Jobs
- Use `IHostedService` or Hangfire for:
  - Meeting reminder emails (scheduled)
  - Auto-archive completed meetings after X days
  - Vote auto-close on timer expiry
  - Action item due date reminders
  - Session cleanup

---

## 4. Frontend Migration Strategy

### Approach: Gradual Module-by-Module Swap

Keep MSW running alongside real API. Use environment variable to toggle:

```typescript
// src/api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL || ''; // empty = MSW intercepts

// .env.development
VITE_API_URL=                          # MSW mode (current)

// .env.development.local  
VITE_API_URL=https://localhost:7001/api  # Real API mode
```

### Migration Order (matches backend phases):
1. **Auth** — swap login/logout first, enables real JWT
2. **Users + Roles** — user management against real DB
3. **Boards** — board CRUD, settings, branding
4. **Meetings CRUD** — creation, listing, detail (biggest payoff)
5. **Participants** — invitation, confirmation
6. **Agenda** — hierarchical CRUD
7. **Documents** — upload + storage
8. **Approvals** — workflow
9. **Voting** — create, cast, results
10. **Minutes** — editor, workflow, signatures
11. **Action Items + Resolutions**
12. **Notifications** — real-time via SignalR
13. **Meeting Room** — SignalR hub for live features

### Per-Module Migration Checklist:
- [ ] Create EF Core entities + migration
- [ ] Implement repository + service
- [ ] Create controller with matching routes
- [ ] Test with Swagger/Postman
- [ ] Update frontend API module to point to real endpoint
- [ ] Verify frontend works with real data
- [ ] Remove corresponding mock handler (or keep as fallback)

---

## 5. Database Schema Overview

### Core Tables (Phase 1)
```
Users, Boards, BoardTypes, BoardSettings, BoardBranding,
Roles, Permissions, RolePermissions, UserBoardRoles, UserSessions
```

### Meeting Tables (Phase 2)
```
Meetings, MeetingTypes, MeetingParticipants, MeetingEvents,
MeetingConfirmationHistory, Agendas, AgendaItems, AgendaTemplates,
Documents, DocumentCategories, DocumentVersions, DocumentAttachments,
DocumentPermissions, DocumentTags, DocumentSignatures, DocumentAccessLogs
```

### Execution Tables (Phase 3)
```
Votes, VoteOptions, VoteConfigurations, VoteEligibility,
VotesCast, VoteResults, VoteActions,
Minutes, MinutesTemplates, MinutesComments, MinutesSignatures,
ActionItems, Resolutions
```

### Infrastructure Tables (Phase 4)
```
Notifications, NotificationPreferences, AuditLogs
```

**Total: ~40 tables** (mirrors existing mock DB exactly)

---

## 6. Key Design Decisions

### 6.1 Multi-Board Data Isolation
- All queries filter by `boardId` from route parameter
- `IBoardScopedRepository<T>` base repository auto-applies board filter
- System admin bypasses board filter
- Chairman (Main Board) gets cross-board access

### 6.2 Meeting State Machine
- Centralized in `MeetingStateMachine` domain service
- Every transition creates an audit event
- Permission checks embedded in transition logic
- Frontend calls `GET /api/{boardId}/meetings/{id}/allowed-transitions` to know what buttons to show

### 6.3 File Storage
- Abstract via `IFileStorageService`
- Local implementation for development
- Azure Blob Storage for production
- Documents stored with versioning (each upload = new version)

### 6.4 Real-Time Architecture
- SignalR with Redis backplane for scale-out
- Meeting room = SignalR group per meeting
- Participant presence tracked via connection lifecycle
- Mode (physical/virtual/hybrid) computed server-side, broadcast to all clients

---

## 7. Environment Setup

### Prerequisites
- .NET 8 SDK
- SQL Server 2022 (or SQL Server Express / LocalDB for dev)
- Visual Studio 2022 or VS Code with C# Dev Kit
- Node.js 20+ (for frontend, already have)

### Connection String (development)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=eBoardDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "your-256-bit-secret-key-here-change-in-production",
    "Issuer": "eBoard.API",
    "Audience": "eBoard.Client",
    "AccessTokenExpiryMinutes": 30,
    "RefreshTokenExpiryDays": 7
  }
}
```

---

## 8. Timeline Summary

| Phase | Weeks | Focus | Outcome |
|-------|-------|-------|---------|
| **Phase 1** | 1–2 | Foundation (Auth, Users, Boards, Roles) | Real login, user/board management |
| **Phase 2** | 3–4 | Meeting Core (CRUD, Participants, Agenda, Docs) | Meeting creation & management with persistence |
| **Phase 3** | 5–6 | Execution (Voting, Minutes, Actions, Resolutions) | Complete meeting lifecycle |
| **Phase 4** | 7–8 | Real-Time (SignalR, Notifications, Background Jobs) | Live meeting room, notifications |

**Total estimated: 8 weeks** for full backend + frontend migration

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Schema mismatch with mock data | Mock tables are the blueprint — map 1:1 |
| Frontend breaks during migration | Gradual swap with env toggle, keep MSW as fallback |
| Complex meeting state logic | State machine pattern with comprehensive unit tests |
| Real-time reliability | SignalR with Redis backplane, reconnection logic |
| File storage complexity | Abstract interface, start with local, swap to Azure later |
| Multi-board permission complexity | Centralized authorization handler, thorough test coverage |
