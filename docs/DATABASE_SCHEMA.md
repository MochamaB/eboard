# eBoard Database Schema

**Complete database schema for the eBoard system with polymorphic relationships and modular design.**

---

## Design Principles

1. **Polymorphic Relationships**: Documents, votes, and notifications can attach to any entity
2. **Role-Based Access Control**: Permissions determined by user roles and participant types
3. **Board-Centric**: All data scoped to boards for multi-tenancy
4. **Modular**: Each module can be built independently
5. **Audit Trail**: Track who did what and when

---

## Table Summary

### ✅ Core Tables (Implemented)
- `boards` - Board/committee/subsidiary/factory entities
- `users` - System users
- `boardMemberships` - User-board relationships (junction table)
- `roles` - System roles and permissions
- `boardSettings` - Board-specific configuration
- `boardBranding` - Board themes and branding

### 🎯 Meetings Module (Phase 1)
- `meetings` - Meeting records
- `meetingParticipants` - Meeting participants with role-based permissions

### 📄 Documents Module (Polymorphic)
- `documents` - File storage with polymorphic attachments
- `documentAccessLogs` - Document access audit trail

### 📋 Agenda Module
- `agendaItems` - Meeting agenda items
- `agendaTemplates` - Reusable agenda templates
- `agendaTemplateItems` - Template item definitions

### 🗳️ Voting Module (Polymorphic)
- `votes` - Vote definitions with polymorphic targets
- `voteOptions` - Multiple choice options
- `voteCasts` - Individual vote records

### 📝 Minutes & Actions Module
- `meetingMinutes` - Meeting minutes (tightly coupled to meetings)
- `minutesComments` - Review comments on minutes
- `actionItems` - Task assignments from meetings
- `actionItemUpdates` - Action item progress tracking

### 🔔 Notifications Module
- `notifications` - User notifications
- `notificationPreferences` - User notification settings

### 🔐 Digital Signatures Module
- `digitalSignatures` - Digital signature records for documents

---

## Core Tables (Already Implemented)

### boards
Board/committee/subsidiary/factory entities.

```typescript
{
  id: string (PK)
  name: string
  shortName: string
  description: string
  type: 'main' | 'subsidiary' | 'committee' | 'factory'
  parentId: string | null (FK → boards)
  status: 'active' | 'inactive'
  zone: 'zone_1' | 'zone_2' | ... | null
  memberCount: number
  committeeCount: number
  compliance: number
  meetingsThisYear: number
  lastMeetingDate: string | null
  nextMeetingDate: string | null
  createdAt: string
  updatedAt: string
}
```

### users
System users with primary role.

```typescript
{
  id: number (PK)
  email: string
  emailtwo: string
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  phonetwo: string | null
  employeeId: string | null
  avatar: string | null
  timezone: string
  primaryRole: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  mfaEnabled: boolean
  mfaSetupComplete: boolean
  hasCertificate: boolean
  certificateExpiry: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}
```

### boardMemberships
User-board relationships (junction table).

```typescript
{
  id: number (PK)
  userId: number (FK → users)
  boardId: string (FK → boards)
  role: 'chairman' | 'vice_chairman' | 'board_member' | 'board_secretary' | 'committee_chair' | 'committee_member' | 'observer' | 'guest'
  startDate: string
  endDate: string | null
  isActive: boolean
}
```

### roles
System roles and permissions.

```typescript
{
  id: string (PK)
  name: string
  label: string
  description: string
  permissions: string[] (JSON array)
  isSystemRole: boolean
  createdAt: string
  updatedAt: string
}
```

### boardSettings
Board-specific configuration.

```typescript
{
  boardId: string (PK, FK → boards)
  quorumPercentage: number
  meetingFrequency: 'monthly' | 'quarterly' | 'bi_monthly' | 'as_needed'
  votingThreshold: 'simple_majority' | 'two_thirds' | 'three_quarters' | 'unanimous'
  confirmationRequired: boolean
  designatedApproverRole: string | null
  minMeetingsPerYear: number
  allowVirtualMeetings: boolean
  requireAttendanceTracking: boolean
}
```

### boardBranding
Board themes and branding.

```typescript
{
  boardId: string (PK, FK → boards)
  logoMain: string
  logoSmall: string | null
  logoDark: string | null
  logoLight: string | null
  primaryColor: string
  primaryHover: string
  primaryLight: string
  primaryContrast: string
  secondaryColor: string
  secondaryHover: string
  accentColor: string
  sidebarBg: string
  sidebarBgGradient: string | null
  sidebarTextColor: string
  sidebarActiveColor: string
  sidebarActiveBg: string
}
```

---

## Meetings Module

### meetings
Meeting records with workflow status.

```typescript
{
  id: string (PK)
  boardId: string (FK → boards)

  // Basic info
  title: string
  description: string
  meetingType: 'regular' | 'special' | 'emergency' | 'annual' | 'committee'

  // Scheduling
  scheduledDate: string
  startTime: string
  endTime: string
  duration: number // minutes
  timezone: string

  // Location
  locationType: 'physical' | 'virtual' | 'hybrid'
  physicalLocation: string | null
  meetingLink: string | null

  // Workflow status
  status: 'draft' | 'pending_confirmation' | 'confirmed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'

  // Confirmation workflow
  confirmationRequired: boolean
  confirmedBy: number | null (FK → users)
  confirmedAt: string | null
  confirmationDocumentId: string | null (FK → documents)
  rejectionReason: string | null

  // Quorum settings
  quorumPercentage: number
  quorumRequired: number // calculated absolute number

  // Metadata
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string
  cancelledBy: number | null (FK → users)
  cancelledAt: string | null
  cancellationReason: string | null
}
```

**Relationships:**
- Belongs to: `boards` (many-to-one)
- Has many: `meetingParticipants`, `agendaItems`, `votes`, `documents` (polymorphic)
- Has one: `meetingMinutes`

### meetingParticipants
Meeting participants with unified role-based permissions (includes members, guests, observers).

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings)
  userId: number (FK → users)

  // Participant type determines access level
  participantType: 'member' | 'secretary' | 'chairman' | 'guest' | 'presenter' | 'observer'

  // Role context (for display)
  roleTitle: string | null // e.g., "GM of KETEPA", "Sales Manager", "Board Member"

  // RSVP
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'tentative'
  rsvpAt: string | null
  rsvpNote: string | null

  // Attendance tracking (Module 9)
  attendanceStatus: 'present' | 'absent' | 'late' | 'left_early' | 'excused' | null
  joinedAt: string | null
  leftAt: string | null

  // Permissions (role-based)
  canVote: boolean // members=true, guests=false, observers=false
  canUploadDocuments: boolean
  canViewBoardDocuments: boolean // guests=false by default
  canShareScreen: boolean

  // Guest-specific (only for participantType='guest' or 'presenter')
  presentationTopic: string | null
  presentationStartTime: string | null
  presentationEndTime: string | null
  admittedAt: string | null
  removedAt: string | null

  // Flags
  isRequired: boolean // for quorum calculation

  // Metadata
  addedBy: number (FK → users)
  addedAt: string
}
```

**Relationships:**
- Belongs to: `meetings` (many-to-one)
- Belongs to: `users` (many-to-one)

**Access Control by Participant Type:**
- **member**: Full access, can vote, view all documents
- **chairman**: Full access, can vote, can admit/remove guests
- **secretary**: Full access, cannot vote, manages meeting
- **guest/presenter**: Limited access, cannot vote, time-restricted
- **observer**: View-only, cannot vote, cannot upload

---

## Documents Module (Polymorphic Media Module)

### documents
File storage with polymorphic attachments to ANY entity.

```typescript
{
  id: string (PK)

  // POLYMORPHIC RELATIONSHIP - Can attach to any entity
  attachedToType: 'board' | 'meeting' | 'agenda_item' | 'action_item' | 'user' | 'vote' | 'minutes' | null
  attachedToId: string | null

  // Document hierarchy (optional)
  parentDocumentId: string | null (FK → documents)

  // File details
  fileName: string
  originalFileName: string
  fileSize: number // bytes
  mimeType: string
  fileExtension: string
  storageUrl: string
  storagePath: string

  // Categorization
  documentType: 'agenda' | 'minutes' | 'confirmation' | 'financial_report' | 'committee_report' | 'presentation' | 'supporting' | 'contract' | 'policy' | 'other'
  category: string | null
  tags: string[] // JSON array

  // Versioning
  version: string
  versionNumber: number
  isLatestVersion: boolean

  // Security & Access Control
  visibilityLevel: 'public' | 'board_members' | 'meeting_participants' | 'restricted' | 'private'
  boardId: string | null (FK → boards)
  isConfidential: boolean
  requiresWatermark: boolean
  allowDownload: boolean
  allowPrint: boolean
  allowCopy: boolean
  expiresAt: string | null

  // Digital signature
  isDigitallySigned: boolean
  signatureId: string | null (FK → digitalSignatures)

  // Metadata
  uploadedBy: number (FK → users)
  uploadedAt: string
  updatedAt: string
  description: string | null
}
```

**Polymorphic Examples:**
```typescript
// Meeting confirmation document
{ attachedToType: 'meeting', attachedToId: 'mtg-001' }

// Agenda item presentation
{ attachedToType: 'agenda_item', attachedToId: 'agenda-001' }

// Board policy document
{ attachedToType: 'board', attachedToId: 'ktda-ms' }

// User certificate
{ attachedToType: 'user', attachedToId: '30' }
```

### documentAccessLogs
Audit trail for document access.

```typescript
{
  id: string (PK)
  documentId: string (FK → documents)
  userId: number (FK → users)
  accessType: 'view' | 'download' | 'print' | 'share'
  accessedAt: string
  ipAddress: string | null
  userAgent: string | null
}
```

---

## Agenda Module

### agendaItems
Meeting agenda items with execution tracking.

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings)

  // Item details
  title: string
  description: string | null
  itemType: 'discussion' | 'decision' | 'information' | 'committee_report'

  // Order and numbering
  orderIndex: number
  itemNumber: string // '1', '2', '2.1', '2.2', '3'
  parentItemId: string | null (FK → agendaItems) // for nested items

  // Timing
  allocatedDuration: number | null // minutes
  actualDuration: number | null // minutes

  // Presenter
  presenterId: number | null (FK → users)
  presenterNotes: string | null

  // Status (during meeting)
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'postponed' | 'added_ad_hoc'
  startedAt: string | null
  completedAt: string | null

  // Outcomes
  requiresVote: boolean
  outcomeNotes: string | null

  // Metadata
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string
}
```

**Relationships:**
- Belongs to: `meetings` (many-to-one)
- Has many: `documents` (polymorphic), `votes` (polymorphic)

### agendaTemplates
Reusable agenda templates per board.

```typescript
{
  id: string (PK)
  boardId: string (FK → boards)
  name: string
  description: string | null
  isDefault: boolean
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string
}
```

### agendaTemplateItems
Items within agenda templates.

```typescript
{
  id: string (PK)
  templateId: string (FK → agendaTemplates)
  title: string
  description: string | null
  itemType: 'discussion' | 'decision' | 'information' | 'committee_report'
  orderIndex: number
  parentItemId: string | null // for nested items
  allocatedDuration: number | null
  requiresVote: boolean
}
```

---

## Voting Module (Polymorphic)

### votes
Vote definitions with polymorphic targets (vote on anything!).

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings)

  // POLYMORPHIC RELATIONSHIP - What are we voting on?
  voteOnType: 'agenda_item' | 'action_item' | 'meeting_location' | 'policy' | 'resolution' | 'other'
  voteOnId: string | null

  // Vote details
  title: string
  description: string
  motionText: string

  // Configuration
  voteType: 'yes_no_abstain' | 'multiple_choice' | 'ranking' | 'approval'
  ballotType: 'open' | 'secret'
  allowChangeVote: boolean

  // Eligibility (board-specific)
  boardId: string (FK → boards)
  quorumRequired: number
  passingThreshold: number // percentage

  // Status
  status: 'draft' | 'open' | 'closed' | 'cancelled'
  openedAt: string | null
  closedAt: string | null
  reopenedAt: string | null

  // Results
  totalEligibleVoters: number
  totalVotesCast: number
  yesVotes: number | null
  noVotes: number | null
  abstainVotes: number | null
  quorumMet: boolean
  passed: boolean
  result: string | null

  // Metadata
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string
}
```

**Polymorphic Examples:**
```typescript
// Vote on agenda item
{ voteOnType: 'agenda_item', voteOnId: 'agenda-001' }

// Vote on meeting location
{ voteOnType: 'meeting_location', voteOnId: null, voteType: 'multiple_choice' }

// Vote on policy
{ voteOnType: 'policy', voteOnId: 'policy-001' }

// Vote on action item completion
{ voteOnType: 'action_item', voteOnId: 'action-001' }
```

### voteOptions
Options for multiple choice votes.

```typescript
{
  id: string (PK)
  voteId: string (FK → votes)
  optionText: string
  optionDescription: string | null
  orderIndex: number
  voteCount: number
}
```

### voteCasts
Individual vote records.

```typescript
{
  id: string (PK)
  voteId: string (FK → votes)
  userId: number (FK → users)

  // Vote choice
  choiceType: 'yes' | 'no' | 'abstain' | 'option' | 'ranking'
  choiceValue: string | null // option ID or JSON array for ranking

  // Proxy (future)
  isProxyVote: boolean
  proxyGrantedBy: number | null (FK → users)

  // Metadata
  castedAt: string
  updatedAt: string | null
}
```

---

## Minutes & Actions Module

### meetingMinutes
Meeting minutes (tightly coupled to meetings, one-to-one).

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings) // One-to-one

  // Content
  content: string // rich text JSON/HTML
  summary: string | null

  // Structured sections (JSON)
  sections: {
    attendance: string | null
    approvalOfPreviousMinutes: string | null
    mattersArising: string | null
    agendaDiscussions: string | null
    decisionsAndResolutions: string | null
    actionItems: string | null
    nextMeetingDate: string | null
    adjournmentTime: string | null
  }

  // Workflow
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'published'
  submittedAt: string | null
  submittedBy: number | null (FK → users)
  approvedAt: string | null
  approvedBy: number | null (FK → users)
  publishedAt: string | null

  // Generated document
  pdfDocumentId: string | null (FK → documents)

  // Metadata
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string
  lastAutoSaveAt: string
}
```

### minutesComments
Review comments on minutes.

```typescript
{
  id: string (PK)
  minutesId: string (FK → meetingMinutes)
  userId: number (FK → users)

  // Comment details
  commentText: string
  commentType: 'suggestion' | 'correction' | 'question' | 'approval' | 'rejection'
  section: string | null

  // Resolution
  resolved: boolean
  resolvedBy: number | null (FK → users)
  resolvedAt: string | null
  resolution: string | null

  // Metadata
  createdAt: string
  updatedAt: string
}
```

### actionItems
Task assignments from meetings (per meeting or per agenda item).

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings)

  // Optional links
  minutesId: string | null (FK → meetingMinutes)
  agendaItemId: string | null (FK → agendaItems)
  parentActionItemId: string | null (FK → actionItems) // for sub-tasks

  // Task details
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Assignment
  assignedTo: number (FK → users)
  assignedBy: number (FK → users)
  dueDate: string
  reminderDays: number | null

  // Status
  status: 'open' | 'in_progress' | 'blocked' | 'completed' | 'cancelled' | 'overdue'
  completedAt: string | null
  completionNotes: string | null

  // Progress
  progressPercentage: number // 0-100
  estimatedHours: number | null
  actualHours: number | null

  // Approval
  requiresApproval: boolean
  approvedBy: number | null (FK → users)
  approvedAt: string | null

  // Metadata
  createdAt: string
  updatedAt: string
}
```

### actionItemUpdates
Progress tracking for action items.

```typescript
{
  id: string (PK)
  actionItemId: string (FK → actionItems)
  userId: number (FK → users)

  // Update details
  updateType: 'progress' | 'comment' | 'status_change' | 'completion' | 'attachment'
  content: string

  // Status change tracking
  oldStatus: string | null
  newStatus: string | null
  oldProgress: number | null
  newProgress: number | null

  // Metadata
  createdAt: string
}
```

---

## Notifications Module

### notifications
User notifications with polymorphic entity references.

```typescript
{
  id: string (PK)
  userId: number (FK → users)

  // Notification details
  notificationType: 'meeting_invitation' | 'meeting_reminder' | 'meeting_started' | 'document_uploaded' | 'agenda_published' | 'vote_opened' | 'action_item_assigned' | 'minutes_published' | 'meeting_cancelled' | 'meeting_confirmed' | 'comment_added' | 'vote_closed'
  title: string
  message: string

  // POLYMORPHIC RELATIONSHIP
  relatedEntityType: 'meeting' | 'document' | 'agenda_item' | 'vote' | 'action_item' | 'minutes' | 'board' | null
  relatedEntityId: string | null

  // Context
  boardId: string | null (FK → boards)
  meetingId: string | null (FK → meetings)

  // Delivery
  channels: string[] // JSON: ['email', 'in_app', 'sms']
  emailSentAt: string | null
  smsSentAt: string | null
  emailDelivered: boolean
  smsDelivered: boolean
  failureReason: string | null

  // Status
  isRead: boolean
  readAt: string | null

  // Priority
  priority: 'low' | 'normal' | 'high' | 'urgent'

  // Metadata
  createdAt: string
  expiresAt: string | null
}
```

### notificationPreferences
User notification preferences.

```typescript
{
  id: string (PK)
  userId: number (FK → users)

  // Per type preferences
  notificationType: string
  enableEmail: boolean
  enableInApp: boolean
  enableSMS: boolean

  // Schedule
  quietHoursEnabled: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null

  // Digest mode
  digestMode: boolean
  digestFrequency: 'daily' | 'weekly' | null
  digestTime: string | null

  // Board-specific override
  boardId: string | null (FK → boards)
}
```

---

## Digital Signatures Module

### digitalSignatures
Digital signature records for documents.

```typescript
{
  id: string (PK)
  documentId: string (FK → documents)

  // Signer
  signedBy: number (FK → users)
  signerRole: string
  signedAt: string

  // Certificate
  certificateId: string
  certificateSubject: string
  certificateIssuer: string
  certificateValidFrom: string
  certificateValidTo: string
  certificateFingerprint: string
  certificateData: string // PEM format

  // Signature
  signatureAlgorithm: string
  signatureHash: string
  signatureReason: string
  signatureLocation: string
  signatureContactInfo: string | null

  // Validation
  isValid: boolean
  lastValidatedAt: string | null
  validationErrors: string[] | null // JSON

  // Metadata
  ipAddress: string | null
  userAgent: string | null
  timestamp: string
}
```

---

## Entity Relationship Diagram

```
boards (1) ----< (N) boardMemberships (N) >---- (1) users
  |                                                 |
  | (1)                                             | (1)
  |                                                 |
  v (N)                                             v (N)
meetings                                      meetingParticipants
  |                                                 ^
  | (1)                                             |
  |                                                 | (N)
  v (N)                                             |
agendaItems ----------------------------------------+
  |
  | (1)
  |
  v (N)
documents (POLYMORPHIC: can attach to meetings, agendaItems, actionItems, etc.)
  |
  | (1)
  |
  v (N)
documentAccessLogs

meetings (1) ---- (1) meetingMinutes (1) ----< (N) minutesComments
  |
  | (1)
  |
  v (N)
actionItems (1) ----< (N) actionItemUpdates

meetings (1) ----< (N) votes (POLYMORPHIC: can vote on agendaItems, actionItems, etc.)
  |
  | (1)
  |
  +---- (N) voteOptions
  |
  +---- (N) voteCasts

users (1) ----< (N) notifications (POLYMORPHIC: related to any entity)
  |
  | (1)
  |
  v (N)
notificationPreferences

documents (1) ----< (N) digitalSignatures
```

---

## Implementation Order

### Phase 1: Meetings Core ✅
```
meetings
meetingParticipants
```

### Phase 2: Documents (Polymorphic)
```
documents
documentAccessLogs
```

### Phase 3: Agenda
```
agendaItems
agendaTemplates
agendaTemplateItems
```

### Phase 4: Voting (Polymorphic)
```
votes
voteOptions
voteCasts
```

### Phase 5: Minutes & Actions
```
meetingMinutes
minutesComments
actionItems
actionItemUpdates
```

### Phase 6: Notifications
```
notifications
notificationPreferences
```

### Phase 7: Digital Signatures
```
digitalSignatures
```

---

## ASP.NET Core Implementation Notes

Each TypeScript table maps to:
1. **C# Entity Class** - EF Core entity
2. **DbSet** in `ApplicationDbContext`
3. **Migration** - Code-first database migration
4. **Repository** - Data access layer (optional)
5. **DTO Classes** - API response models

### Example Mapping

**TypeScript Table:**
```typescript
meetings { id: string, boardId: string, title: string, ... }
```

**C# Entity:**
```csharp
public class Meeting
{
    public string Id { get; set; }
    public string BoardId { get; set; }
    public string Title { get; set; }

    // Navigation properties
    public Board Board { get; set; }
    public ICollection<MeetingParticipant> Participants { get; set; }
}
```

**EF Core Configuration:**
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Meeting>(entity =>
    {
        entity.HasKey(e => e.Id);
        entity.HasOne(e => e.Board)
              .WithMany(b => b.Meetings)
              .HasForeignKey(e => e.BoardId);
    });
}
```

---

## Total Table Count

- **Core**: 6 tables (implemented)
- **Meetings**: 2 tables
- **Documents**: 2 tables
- **Agenda**: 3 tables
- **Voting**: 3 tables
- **Minutes & Actions**: 4 tables
- **Notifications**: 2 tables
- **Digital Signatures**: 1 table

**Total: 23 tables**

---

## Next Steps

1. ✅ Implement meetings core (2 tables)
2. Create query functions for meetings
3. Create MSW handlers
4. Build React API layer
5. Build React Query hooks
6. Build UI components
7. Build pages

Each subsequent module can be built independently following the same pattern.
