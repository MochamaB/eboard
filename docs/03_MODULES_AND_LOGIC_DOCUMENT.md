# Online Board Meeting System - Modules and Logic Document

## Document Information
- **Project Name**: eBoard Meeting System
- **Version**: 1.1
- **Date**: January 19, 2026
- **Technology Stack**: React 18, TypeScript, ASP.NET Core 8, SQL Server
- **Document Type**: Technical Architecture & Design Specification

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Organization-Based Routing](#2-organization-based-routing)
3. [Technology Stack](#3-technology-stack)
4. [Module Breakdown](#4-module-breakdown)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [Business Logic Flows](#7-business-logic-flows)
8. [Integration Architecture](#8-integration-architecture)
9. [Security Implementation](#9-security-implementation)

---

## 1. System Architecture Overview

### 1.1 Architecture Pattern
**Layered N-Tier Architecture with Clean Architecture Principles**

---

## 2. Organization-Based Routing

### 2.1 Overview
All application routes are scoped by organization ID to ensure proper data isolation and context management. Every authenticated route includes `/:orgId` as a URL parameter.

### 2.2 URL Structure
```
/:orgId/{module}/{resource}

Examples:
/ktda-main/dashboard
/ketepa/meetings/123
/temec/users
/factory-chebut/reports/attendance
```

### 2.3 Implementation Details

**Frontend Routing (React Router v6):**
- Root route (`/`) redirects to default organization: `/ktda-main/dashboard`
- All protected routes are nested under `/:orgId` parent route
- `AppLayout` component extracts `orgId` from URL and syncs with context
- Invalid `orgId` redirects to default organization

**Organization Context Sync:**
```typescript
// AppLayout extracts orgId from URL
const { orgId } = useParams<{ orgId: string }>();

// Validates and syncs with OrgThemeContext
useEffect(() => {
  if (orgId) {
    const org = getOrganizationById(orgId);
    if (org) {
      setCurrentOrg(orgId); // Updates theme, logo, committees
    } else {
      navigate('/ktda-main/dashboard', { replace: true });
    }
  }
}, [orgId]);
```

**Navigation Behavior:**
- Organization selector changes URL: `navigate(`/${newOrgId}/dashboard`)`
- Sidebar menu items include orgId: `navigate(`/${orgId}/meetings`)`
- Browser back/forward buttons work correctly
- Bookmarks and shared links include organization context

### 2.4 Data Filtering Logic

All API calls must filter data by organization:

**Backend API Pattern:**
```csharp
[HttpGet("{orgId}/meetings")]
public async Task<IActionResult> GetMeetings(string orgId)
{
    // Validate user has access to organization
    if (!await _authService.CanAccessOrganization(User, orgId))
        return Forbid();
    
    // Filter data by organization
    var meetings = await _meetingService.GetByOrganizationAsync(orgId);
    return Ok(meetings);
}
```

**Frontend API Call:**
```typescript
// Always include orgId in API requests
const meetings = await api.get(`/${orgId}/meetings`);
const users = await api.get(`/${orgId}/users`);
```

### 2.5 Security Considerations
- Organization access validated on every API request
- User permissions checked per organization
- Cross-organization data leakage prevented
- Audit trails include organization context

---

## 3. System Architecture Overview (continued)

### 3.1 Architecture Pattern (continued)
**Layered N-Tier Architecture with Clean Architecture Principles**

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│           Blazor Server / React + Bootstrap                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    API Gateway Layer                         │
│         ASP.NET Core 8 Web API + SignalR Hubs               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Application Layer (Services)                │
│        Business Logic + CQRS Pattern + Validation           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Domain Layer (Entities)                    │
│           Domain Models + Value Objects + Rules             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│          Infrastructure Layer (Data + Services)              │
│     EF Core + File Storage + Email + Cache + Video API      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Data Layer                              │
│                   SQL Server Database                        │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Project Structure

```
eBoardMeeting.Solution/
├── src/
│   ├── eBoardMeeting.Domain/              # Entities, Value Objects, Enums
│   ├── eBoardMeeting.Application/         # Services, DTOs, Commands, Queries
│   ├── eBoardMeeting.Infrastructure/      # EF Core, Repositories, External APIs
│   ├── eBoardMeeting.API/                 # REST Controllers, Middleware
│   ├── eBoardMeeting.SignalR/             # WebSocket Hubs (Video, Chat, Notifications)
│   ├── eBoardMeeting.Web/                 # Frontend (Blazor/React)
│   └── eBoardMeeting.Shared/              # Constants, Utilities, Extensions
├── tests/
│   ├── eBoardMeeting.UnitTests/
│   ├── eBoardMeeting.IntegrationTests/
│   └── eBoardMeeting.E2ETests/
└── docs/
```

---

## 2. Technology Stack

### 2.1 Backend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | ASP.NET Core | 8.0 | Web API framework |
| Language | C# | 12.0 | Programming language |
| ORM | Entity Framework Core | 8.0 | Database access |
| Database | SQL Server | 2022 | Data storage |
| Caching | Redis | 7.0+ | Session/cache |
| Real-time | SignalR | 8.0 | WebSockets |
| Auth | ASP.NET Identity | 8.0 | Authentication |
| Jobs | Hangfire | 1.8+ | Background tasks |
| Logging | Serilog | 3.1+ | Structured logging |
| Validation | FluentValidation | 11.9+ | Input validation |
| Mapping | AutoMapper | 12.0+ | Object mapping |
| API Docs | Swagger | 6.5+ | API documentation |

### 2.2 Frontend Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Blazor Server / React | UI Framework |
| CSS | Bootstrap 5.3 + Tailwind | Styling |
| Video | WebRTC Native | Browser video/audio |
| PDF Viewer | PDF.js | Document viewing |
| Editor | Quill.js | Rich text editing |
| Charts | Chart.js | Analytics |

### 2.3 Third-Party Services

| Service | Provider Options | Purpose |
|---------|-----------------|---------|
| Video API | Twilio Video / Agora.io | Video conferencing |
| File Storage | Azure Blob / AWS S3 | Document storage |
| Email | SendGrid / AWS SES | Email notifications |
| SMS | Twilio | SMS alerts |
| CDN | Azure CDN / CloudFlare | Content delivery |

---

## 3. Module Breakdown

### 3.1 Core Modules

#### Module 1: User Management & Authentication
**Namespace**: `eBoardMeeting.Application.Users`

**Key Components:**
- User Registration & Login
- Role-Based Access Control (RBAC)
- Multi-Factor Authentication (MFA)
- Password Management
- Session Management
- User Profile Management

**Entities:**
- User, Role, UserRole, Permission, RolePermission, UserSession

**Services:**
- `IUserService`, `IRoleService`, `IAuthenticationService`

**API Endpoints:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/enable-mfa
GET  /api/users
POST /api/users
PUT  /api/users/{id}
```

---

#### Module 2: Meeting Management
**Namespace**: `eBoardMeeting.Application.Meetings`

**Key Components:**
- Meeting Creation & Scheduling
- Participant Management
- Meeting Invitations & RSVP
- Meeting Status Workflow
- Quorum Tracking
- Meeting Dashboard

**Entities:**
- Meeting, MeetingParticipant, MeetingInvitation, MeetingRecurrence

**Enums:**
- MeetingStatus (Draft, Scheduled, InProgress, Completed, Cancelled)
- ParticipantRole (Chairman, Member, Secretary, Observer)

**Services:**
- `IMeetingService`, `IParticipantService`, `IInvitationService`

**API Endpoints:**
```
GET  /api/meetings
POST /api/meetings
PUT  /api/meetings/{id}
POST /api/meetings/{id}/schedule
POST /api/meetings/{id}/start
POST /api/meetings/{id}/end
GET  /api/meetings/{id}/participants
POST /api/meetings/{id}/participants
```

**Business Logic - Meeting Start Flow:**
```
1. Verify Chairman/Secretary permission
2. Check meeting status = Scheduled
3. Perform roll call
4. Validate quorum
5. Update status to InProgress
6. Create video session
7. Notify participants
8. Start recording (if enabled)
```

---

#### Module 3: Video Conferencing
**Namespace**: `eBoardMeeting.Application.VideoConference`

**Key Components:**
- Video Session Management
- Twilio/Agora Integration
- Media Controls (video, audio, screen share)
- Recording Management
- Network Quality Monitoring

**Entities:**
- VideoSession, Participant, MediaStream

**Services:**
- `IVideoConferenceService`, `IMediaService`, `IRecordingService`

**SignalR Hub:**
```csharp
public class VideoConferenceHub : Hub
{
    Task JoinMeeting(Guid meetingId);
    Task LeaveMeeting(Guid meetingId);
    Task ToggleVideo(bool enabled);
    Task ToggleMicrophone(bool enabled);
    Task StartScreenShare();
    Task RaiseHand();
    Task SendChatMessage(string message);
}
```

**API Endpoints:**
```
POST /api/video/sessions
GET  /api/video/sessions/{id}/token
POST /api/video/sessions/{id}/recording/start
POST /api/video/sessions/{id}/recording/stop
```

**Twilio Integration:**
```
1. Create Twilio Room when meeting starts
2. Generate Access Token for each participant
3. Token contains: userId, room name, permissions
4. Client connects using Twilio SDK
5. SignalR handles supplementary features (chat, hand raising)
```

---

#### Module 4: Document Management
**Namespace**: `eBoardMeeting.Application.Documents`

**Key Components:**
- Document Upload/Download
- Version Control
- Document Categorization
- Access Control & Permissions
- Document Search
- PDF Viewing

**Entities:**
- Document, DocumentVersion, DocumentCategory, DocumentAccessLog

**Services:**
- `IDocumentService`, `IVersionService`, `IDocumentSecurityService`

**API Endpoints:**
```
POST /api/documents/upload
GET  /api/documents/{id}
GET  /api/documents/{id}/download
GET  /api/documents/{id}/versions
POST /api/documents/{id}/versions
GET  /api/meetings/{meetingId}/documents
```

**Document Upload Flow:**
```
1. Validate file type and size
2. Generate unique filename
3. Upload to Azure Blob Storage
4. Create document record
5. Extract metadata
6. Set permissions
7. Create thumbnail
8. Return document URL
```

---

#### Module 5: Agenda Management
**Namespace**: `eBoardMeeting.Application.Agendas`

**Key Components:**
- Agenda Builder
- Agenda Items Management
- Agenda Templates
- Real-time Agenda Execution
- Time Tracking

**Entities:**
- Agenda, AgendaItem, AgendaTemplate

**Services:**
- `IAgendaService`, `IAgendaExecutionService`

**API Endpoints:**
```
GET  /api/meetings/{meetingId}/agenda
POST /api/meetings/{meetingId}/agenda
POST /api/meetings/{meetingId}/agenda/items
PUT  /api/meetings/{meetingId}/agenda/items/reorder
POST /api/meetings/{meetingId}/agenda/publish
POST /api/meetings/{meetingId}/agenda/items/{itemId}/start
```

---

#### Module 6: Voting & Polling
**Namespace**: `eBoardMeeting.Application.Voting`

**Key Components:**
- Vote Creation & Management
- Vote Casting
- Quorum Validation
- Result Calculation
- Real-time Vote Updates
- Polling System

**Entities:**
- Vote, VoteCast, VoteResult, Poll, PollResponse

**Enums:**
- VoteType (YesNo, MultipleChoice, SecretBallot, OpenBallot)
- VoteStatus (Draft, Open, Closed, Finalized)

**Services:**
- `IVotingService`, `IPollingService`

**API Endpoints:**
```
POST /api/votes
POST /api/votes/{id}/open
POST /api/votes/{id}/cast
POST /api/votes/{id}/close
GET  /api/votes/{id}/results
```

**Vote Calculation Logic:**
```csharp
public bool CalculateVoteResult(Vote vote)
{
    int totalVotes = vote.VoteCasts.Count;
    int yesVotes = vote.VoteCasts.Count(v => v.VoteOption == "Yes");
    
    // Check quorum
    if (totalVotes < vote.QuorumRequired) return false;
    
    // Calculate based on threshold
    decimal yesPercentage = (decimal)yesVotes / totalVotes * 100;
    return yesPercentage >= vote.PassThreshold;
}
```

---

#### Module 7: Meeting Minutes
**Namespace**: `eBoardMeeting.Application.Minutes`

**Key Components:**
- Minutes Creation & Editing
- Action Items Management
- Approval Workflow
- Minutes Publishing
- PDF Generation

**Entities:**
- MeetingMinutes, ActionItem, MinutesApproval

**Services:**
- `IMinutesService`, `IActionItemService`, `IPdfGenerationService`

**API Endpoints:**
```
GET  /api/meetings/{meetingId}/minutes
POST /api/meetings/{meetingId}/minutes
POST /api/meetings/{meetingId}/minutes/submit-review
POST /api/meetings/{meetingId}/minutes/approve
GET  /api/meetings/{meetingId}/action-items
POST /api/action-items
PUT  /api/action-items/{id}
```

---

#### Module 8: Notifications
**Namespace**: `eBoardMeeting.Application.Notifications`

**Key Components:**
- Email Notifications
- SMS Alerts
- In-App Notifications
- Push Notifications
- Notification Preferences

**Entities:**
- Notification, NotificationTemplate, UserNotificationPreference

**Services:**
- `INotificationService`, `IEmailService`, `ISmsService`

**SignalR Hub:**
```csharp
public class NotificationHub : Hub
{
    Task SendNotification(Notification notification);
    Task MarkAsRead(Guid notificationId);
}
```

**API Endpoints:**
```
GET /api/notifications
GET /api/notifications/unread-count
PUT /api/notifications/{id}/read
```

---

#### Module 9: Reporting & Analytics
**Namespace**: `eBoardMeeting.Application.Reporting`

**Key Components:**
- Meeting Reports
- Attendance Analytics
- Document Usage Reports
- Compliance Reports
- System Usage Statistics

**Services:**
- `IReportingService`, `IAnalyticsService`

**API Endpoints:**
```
GET /api/reports/meetings
GET /api/reports/attendance
GET /api/reports/documents
POST /api/reports/custom
GET /api/reports/{id}/export
```

---

#### Module 10: Administration
**Namespace**: `eBoardMeeting.Application.Administration`

**Key Components:**
- System Configuration
- User Management
- Role & Permission Management
- Audit Logs
- System Monitoring
- Backup Management

**Services:**
- `IAdministrationService`, `IAuditService`, `IBackupService`

**API Endpoints:**
```
GET  /api/admin/users
POST /api/admin/users/bulk-import
GET  /api/admin/audit-logs
GET  /api/admin/system-health
POST /api/admin/backup
```

---

## 4. Database Design

### 4.1 Core Tables

#### Users Table
```sql
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20),
    IsActive BIT DEFAULT 1,
    MfaEnabled BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

#### Meetings Table
```sql
CREATE TABLE Meetings (
    MeetingId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    QuorumRequired INT,
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
);
```

#### MeetingParticipants Table
```sql
CREATE TABLE MeetingParticipants (
    ParticipantId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeetingId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    RsvpStatus NVARCHAR(20) DEFAULT 'Pending',
    JoinedAt DATETIME2,
    LeftAt DATETIME2,
    FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

#### Documents Table
```sql
CREATE TABLE Documents (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeetingId UNIQUEIDENTIFIER,
    FileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NOT NULL,
    StoragePath NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(50) NOT NULL,
    UploadedBy UNIQUEIDENTIFIER NOT NULL,
    UploadedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId),
    FOREIGN KEY (UploadedBy) REFERENCES Users(UserId)
);
```

#### Agendas & AgendaItems Tables
```sql
CREATE TABLE Agendas (
    AgendaId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeetingId UNIQUEIDENTIFIER NOT NULL UNIQUE,
    PublishedAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId) ON DELETE CASCADE
);

CREATE TABLE AgendaItems (
    ItemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AgendaId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    ItemType NVARCHAR(50) NOT NULL,
    ItemOrder INT NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (AgendaId) REFERENCES Agendas(AgendaId) ON DELETE CASCADE
);
```

#### Votes & VoteCasts Tables
```sql
CREATE TABLE Votes (
    VoteId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeetingId UNIQUEIDENTIFIER NOT NULL,
    Question NVARCHAR(500) NOT NULL,
    VoteType NVARCHAR(50) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Draft',
    QuorumRequired INT,
    PassThreshold DECIMAL(5,2),
    OpenedAt DATETIME2,
    ClosedAt DATETIME2,
    FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId) ON DELETE CASCADE
);

CREATE TABLE VoteCasts (
    CastId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VoteId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    VoteOption NVARCHAR(100) NOT NULL,
    CastAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (VoteId) REFERENCES Votes(VoteId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    UNIQUE (VoteId, UserId)
);
```

#### Minutes & ActionItems Tables
```sql
CREATE TABLE MeetingMinutes (
    MinutesId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeetingId UNIQUEIDENTIFIER NOT NULL UNIQUE,
    Content NVARCHAR(MAX),
    Status NVARCHAR(50) DEFAULT 'Draft',
    PreparedBy UNIQUEIDENTIFIER NOT NULL,
    ApprovedBy UNIQUEIDENTIFIER,
    PublishedAt DATETIME2,
    FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId) ON DELETE CASCADE,
    FOREIGN KEY (PreparedBy) REFERENCES Users(UserId)
);

CREATE TABLE ActionItems (
    ActionItemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeetingId UNIQUEIDENTIFIER NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    AssignedTo UNIQUEIDENTIFIER NOT NULL,
    DueDate DATE,
    Priority NVARCHAR(20) DEFAULT 'Medium',
    Status NVARCHAR(20) DEFAULT 'Open',
    FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId),
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserId)
);
```

#### VideoSessions & ChatMessages Tables
```sql
CREATE TABLE VideoSessions (
    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MeetingId UNIQUEIDENTIFIER NOT NULL,
    TwilioRoomSid NVARCHAR(200),
    StartedAt DATETIME2 DEFAULT GETUTCDATE(),
    EndedAt DATETIME2,
    RecordingUrl NVARCHAR(1000),
    FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId) ON DELETE CASCADE
);

CREATE TABLE ChatMessages (
    MessageId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    IsPrivate BIT DEFAULT 0,
    SentAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (SessionId) REFERENCES VideoSessions(SessionId) ON DELETE CASCADE,
    FOREIGN KEY (SenderId) REFERENCES Users(UserId)
);
```

#### Notifications & AuditLogs Tables
```sql
CREATE TABLE Notifications (
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX),
    Status NVARCHAR(20) DEFAULT 'Pending',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ReadAt DATETIME2,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);

CREATE TABLE AuditLogs (
    LogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId UNIQUEIDENTIFIER,
    Action NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(100),
    EntityId UNIQUEIDENTIFIER,
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

---

## 5. API Design

### 5.1 RESTful API Conventions

**Standards:**
- HTTP Methods: GET, POST, PUT, DELETE
- Status Codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found)
- Pagination: `?page=1&pageSize=20`
- Filtering: `?status=scheduled&startDate=2026-01-15`
- Sorting: `?sortBy=startTime&order=asc`

**Request/Response Format:**
```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "errors": [{"field": "email", "message": "Invalid format"}],
  "message": "Validation failed"
}
```

### 5.2 Authentication

**JWT Token:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Token Payload:**
```json
{
  "sub": "user-guid",
  "email": "user@company.com",
  "role": ["BoardMember"],
  "permissions": ["meetings:create", "votes:cast"],
  "exp": 1705330500
}
```

### 5.3 Key API Endpoints

**Authentication:**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh-token
```

**Meetings:**
```
GET    /api/meetings
POST   /api/meetings
PUT    /api/meetings/{id}
DELETE /api/meetings/{id}
POST   /api/meetings/{id}/start
POST   /api/meetings/{id}/end
GET    /api/meetings/{id}/participants
```

**Documents:**
```
POST /api/documents/upload
GET  /api/documents/{id}/download
GET  /api/meetings/{meetingId}/documents
```

**Voting:**
```
POST /api/votes
POST /api/votes/{id}/cast
GET  /api/votes/{id}/results
```

**Video:**
```
POST /api/video/sessions
GET  /api/video/sessions/{id}/token
```

---

## 6. Business Logic Flows

### 6.1 Meeting Lifecycle Flow

```
1. CREATE MEETING (Secretary)
   ├─> Validate meeting data
   ├─> Set status = Draft
   ├─> Create meeting record
   └─> Return meeting details

2. SCHEDULE MEETING (Secretary)
   ├─> Add participants
   ├─> Send invitations
   ├─> Create calendar events
   ├─> Set status = Scheduled
   └─> Send reminders (24h, 1h before)

3. START MEETING (Chairman/Secretary)
   ├─> Verify time window
   ├─> Perform roll call
   ├─> Check quorum
   ├─> Create video session
   ├─> Set status = InProgress
   └─> Start recording

4. CONDUCT MEETING
   ├─> Follow agenda items
   ├─> Conduct votes
   ├─> Take minutes
   └─> Create action items

5. END MEETING (Chairman)
   ├─> Finalize attendance
   ├─> Stop recording
   ├─> Set status = Completed
   └─> Generate summary

6. POST-MEETING
   ├─> Approve minutes
   ├─> Publish minutes
   ├─> Archive documents
   └─> Track action items
```

### 6.2 Authentication Flow

```
1. User submits credentials
2. Validate email/password
3. Check MFA status
4. If MFA enabled → Verify OTP
5. Generate JWT access token (15 min)
6. Generate refresh token (7 days)
7. Create user session
8. Log login event
9. Return tokens to client
```

### 6.3 Document Upload Flow

```
1. Validate file (type, size)
2. Generate unique filename
3. Upload to Azure Blob Storage
4. Save document record to database
5. Extract metadata (size, pages)
6. Set permissions by role
7. Create thumbnail for preview
8. Return document URL
9. Notify relevant users
```

### 6.4 Voting Flow

```
1. Chairman creates vote
2. Link vote to agenda item
3. Set quorum & passing threshold
4. Open vote (status = Open)
5. Notify eligible voters (SignalR)
6. Board members cast votes
7. Real-time vote count updates
8. Chairman closes vote
9. Validate quorum met
10. Calculate result (passed/failed)
11. Lock results
12. Record in minutes
13. Notify all participants
```

---

## 7. Integration Architecture

### 7.1 Twilio Video Integration

**Setup:**
```csharp
public class TwilioVideoService : IVideoConferenceService
{
    private readonly string _accountSid;
    private readonly string _apiKeySid;
    private readonly string _apiKeySecret;
    
    public async Task<string> CreateRoomAsync(Guid meetingId)
    {
        var room = await RoomResource.CreateAsync(
            uniqueName: $"meeting-{meetingId}",
            type: RoomResource.RoomTypeEnum.Group,
            recordParticipantsOnConnect: true
        );
        return room.Sid;
    }
    
    public string GenerateAccessToken(Guid userId, string roomName)
    {
        var grant = new VideoGrant { Room = roomName };
        var token = new Token(_accountSid, _apiKeySid, _apiKeySecret,
            identity: userId.ToString(),
            grants: new HashSet<IGrant> { grant }
        );
        return token.ToJwt();
    }
}
```

### 7.2 Azure Blob Storage Integration

```csharp
public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    
    public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient("documents");
        var blobClient = containerClient.GetBlobClient(fileName);
        
        await blobClient.UploadAsync(fileStream, overwrite: true);
        
        return blobClient.Uri.ToString();
    }
    
    public async Task<Stream> DownloadFileAsync(string fileName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient("documents");
        var blobClient = containerClient.GetBlobClient(fileName);
        
        return await blobClient.OpenReadAsync();
    }
}
```

### 7.3 Email Service Integration

```csharp
public class SendGridEmailService : IEmailService
{
    private readonly ISendGridClient _client;
    
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var msg = new SendGridMessage
        {
            From = new EmailAddress("noreply@eboard.com", "eBoard System"),
            Subject = subject,
            HtmlContent = body
        };
        msg.AddTo(new EmailAddress(to));
        
        await _client.SendEmailAsync(msg);
    }
}
```

---

## 8. Security Implementation

### 8.1 Authentication & Authorization

**JWT Configuration:**
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"]))
        };
    });
```

**Policy-Based Authorization:**
```csharp
services.AddAuthorization(options =>
{
    options.AddPolicy("RequireBoardMemberRole", policy =>
        policy.RequireRole("BoardMember", "Chairman"));
        
    options.AddPolicy("CanStartMeeting", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "Permission" && 
            c.Value == "meetings:start")));
});
```

### 8.2 Data Encryption

**Connection String (SQL Server TDE):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=server;Database=eBoardDB;Encrypt=True;TrustServerCertificate=False;"
  }
}
```

**File Encryption:**
- Azure Blob Storage: Server-side encryption enabled
- SQL Server: Transparent Data Encryption (TDE)
- Passwords: BCrypt hashing with salt

### 8.3 Security Headers

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
    await next();
});
```

---

## 9. Deployment Configuration

### 9.1 Development Environment

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=eBoardDB_Dev;Trusted_Connection=True;"
  },
  "Redis": {
    "Configuration": "localhost:6379"
  },
  "Twilio": {
    "AccountSid": "dev_account_sid",
    "ApiKeySid": "dev_api_key",
    "ApiKeySecret": "dev_secret"
  }
}
```

### 9.2 Production Environment

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=eBoardDB;User Id=sa;Password=***;Encrypt=True;"
  },
  "Azure": {
    "BlobStorage": "https://ebboard storage.blob.core.windows.net",
    "KeyVault": "https://eboard-keyvault.vault.azure.net/"
  },
  "Twilio": {
    "AccountSid": "prod_account_sid"
  }
}
```

### 9.3 Deployment Commands

```bash
# Publish application
dotnet publish -c Release -o ./publish

# Run migrations
dotnet ef database update --project eBoardMeeting.Infrastructure

# Start application
dotnet eBoardMeeting.API.dll
```

---

## 10. Development Guidelines

### 10.1 Coding Standards

- Follow C# naming conventions (PascalCase for classes, camelCase for variables)
- Use async/await for I/O operations
- Implement dependency injection
- Write XML documentation comments
- Use nullable reference types
- Follow SOLID principles

### 10.2 Error Handling

```csharp
public async Task<Result<Meeting>> CreateMeetingAsync(CreateMeetingCommand command)
{
    try
    {
        // Business logic
        var meeting = new Meeting { ... };
        await _repository.AddAsync(meeting);
        
        return Result<Meeting>.Success(meeting);
    }
    catch (ValidationException ex)
    {
        _logger.LogWarning(ex, "Validation failed");
        return Result<Meeting>.Failure(ex.Errors);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating meeting");
        return Result<Meeting>.Failure("An error occurred");
    }
}
```

### 10.3 Testing Strategy

**Unit Tests:**
- Test business logic in isolation
- Mock dependencies
- Achieve >80% code coverage

**Integration Tests:**
- Test API endpoints
- Use in-memory database
- Test external service integrations

**E2E Tests:**
- Test complete user workflows
- Use Selenium/Playwright
- Test critical paths

---

## Document Approval

| Role | Name | Date |
|------|------|------|
| Technical Lead | | |
| Software Architect | | |
| Project Manager | | |
| Security Officer | | |

---

**END OF MODULES AND LOGIC DOCUMENT**
