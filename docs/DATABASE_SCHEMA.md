# eBoard Database Schema

**Complete database schema for the eBoard system with polymorphic relationships and modular design.**

**Last Updated:** February 4, 2026  
**Version:** 2.0 (Status + SubStatus Model)

---

## Design Principles

1. **Polymorphic Relationships**: Documents, votes, and notifications can attach to any entity
2. **Role-Based Access Control**: Permissions determined by user roles and participant types
3. **Board-Centric**: All data scoped to boards for multi-tenancy
4. **Modular**: Each module can be built independently
5. **Audit Trail**: Track who did what and when via event tables
6. **Event Emission**: All state changes emit events to audit tables

---

## Table Summary

### ✅ Core Tables (Implemented)
- `boards` - Board/committee/subsidiary/factory entities
- `boardTypes` - Board type definitions
- `users` - System users
- `userBoardRoles` - User-board-role relationships (junction table)
- `roles` - System roles
- `permissions` - System permissions
- `rolePermissions` - Role-permission mappings
- `boardSettings` - Board-specific configuration
- `boardBranding` - Board themes and branding
- `userSessions` - Active user sessions

### 🎯 Meetings Module
- `meetings` - Meeting records with status + subStatus ⚠️ UPDATED
- `meetingParticipants` - Meeting participants with role-based permissions
- `meetingEvents` - All meeting workflow events (audit trail) ⚠️ NEW (replaces meetingConfirmationHistory)
- `meetingTypes` - Meeting type definitions

### 📄 Documents Module (Lean + Related Tables)
- `documents` - Core document metadata
- `documentAttachments` - Links documents to entities (polymorphic)
- `documentVersions` - Version history
- `documentSignatures` - Digital signatures
- `documentAccessLogs` - View/download tracking
- `documentPermissions` - Access control
- `documentTags` - Tags and assignments
- `documentCategories` - Document categorization

### 📋 Agenda Module
- `agendas` - Agenda container per meeting
- `agendaItems` - Meeting agenda items
- `agendaTemplates` - Reusable agenda templates

### 🗳️ Voting Module (Event-Sourced)
- `votes` - Vote definitions with polymorphic targets
- `voteConfigurations` - Immutable voting rules snapshot
- `voteOptions` - Multiple choice options
- `voteEligibility` - Who can vote with weights
- `votesCast` - Individual vote records (append-only)
- `voteResults` - Cached computed results
- `voteActions` - Voting audit trail

### 📝 Minutes Module
- `minutes` - Meeting minutes with workflow status
- `minutesComments` - Review comments on minutes
- `minutesSignatures` - Approval signatures

### ✅ Action Items Module
- `actionItems` - Task assignments from meetings

### � Resolutions Module
- `resolutions` - Formal board decisions

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
Meeting records with status + subStatus model. Configuration data only - workflow state derived from events.

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

  // Status + SubStatus Model
  // Primary status (5 values - lifecycle stages)
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  
  // SubStatus (contextual within each status)
  // draft: 'incomplete' | 'complete'
  // scheduled: 'pending_approval' | 'approved' | 'rejected'
  // completed: 'recent' | 'archived'
  // in_progress, cancelled: null (no subStatus)
  subStatus: string | null

  // Cached timestamp of last status change (derived from meetingEvents)
  statusUpdatedAt: string

  // Validation Overrides (for sensitive/emergency meetings)
  overrides: {
    skipAgenda?: boolean        // Don't require agenda
    skipDocuments?: boolean     // Don't require documents
    skipApproval?: boolean      // Auto-approve (if permitted)
    customMinParticipants?: number
  } | null
  overrideReason: string | null

  // Quorum settings
  quorumPercentage: number
  quorumRequired: number // calculated absolute number

  // Metadata
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string
}
```

**Status + SubStatus Combinations:**
| Status | SubStatus | Description |
|--------|-----------|-------------|
| `draft` | `incomplete` | Meeting being created, missing requirements |
| `draft` | `complete` | All requirements met, ready for submission |
| `scheduled` | `pending_approval` | Awaiting chairman approval |
| `scheduled` | `approved` | Approved, ready to start |
| `scheduled` | `rejected` | Rejected, needs revision |
| `in_progress` | `null` | Meeting currently happening |
| `completed` | `recent` | Meeting ended, post-meeting work active |
| `completed` | `archived` | Old meeting, read-only |
| `cancelled` | `null` | Meeting cancelled |

**Relationships:**
- Belongs to: `boards` (many-to-one)
- Has many: `meetingParticipants`, `meetingEvents`, `agendaItems`, `votes`, `documents` (polymorphic)
- Has one: `minutes`

### meetingEvents 
Unified event log for all meeting workflow events. Replaces `meetingConfirmationHistory`.

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings)
  
  // Event type - all possible events across meeting lifecycle
  eventType: 
    // Creation & Configuration
    | 'meeting_created'
    | 'meeting_updated'
    | 'participants_updated'
    | 'agenda_updated'
    | 'documents_updated'
    | 'configuration_complete'
    
    // Approval Workflow
    | 'submitted_for_approval'
    | 'approved'
    | 'rejected'
    | 'revision_started'
    | 'scheduled_directly'
    
    // Lifecycle
    | 'rescheduled'
    | 'cancelled'
    | 'meeting_started'
    | 'meeting_ended'
    | 'archived'
    
    // During Meeting
    | 'participant_joined'
    | 'participant_left'
    | 'quorum_achieved'
    | 'vote_started'
    | 'vote_closed'
    | 'recording_started'
    | 'recording_stopped'
    
    // Post Meeting
    | 'minutes_created'
    | 'minutes_submitted'
    | 'minutes_approved'
    | 'minutes_revision_requested'
    | 'action_item_created'
    | 'action_item_completed'
    | 'resolution_recorded'

  // State tracking
  fromStatus: string | null      // Previous status
  fromSubStatus: string | null   // Previous subStatus
  toStatus: string | null        // New status (null if no change)
  toSubStatus: string | null     // New subStatus

  // Actor
  performedBy: number (FK → users)
  performedAt: string

  // Event-specific data (flexible JSON)
  metadata: {
    // Approval events
    signatureId?: string
    signatureImageUrl?: string
    rejectionReason?: 'incomplete_information' | 'scheduling_conflict' | 'agenda_not_approved' | 'quorum_concerns' | 'other'
    rejectionComments?: string
    submissionNotes?: string
    
    // Document references
    unsignedDocumentId?: string
    signedDocumentId?: string
    
    // Reschedule events
    previousDate?: string
    previousTime?: string
    newDate?: string
    newTime?: string
    
    // Cancellation
    cancellationReason?: string
    
    // Participant events
    participantId?: number
    joinTime?: string
    leaveTime?: string
    
    // Vote events
    voteId?: string
    
    // Minutes events
    minutesId?: string
    
    // Action item events
    actionItemId?: string
    
    // Generic
    notes?: string
  } | null

  createdAt: string
}
```

**Relationships:**
- Belongs to: `meetings` (many-to-one)
- Belongs to: `users` via performedBy (many-to-one)

**Event Types by Phase:**
- **Pre-Meeting**: meeting_created, meeting_updated, participants_updated, agenda_updated, documents_updated, configuration_complete, submitted_for_approval, approved, rejected, revision_started, scheduled_directly, rescheduled, cancelled
- **During Meeting**: meeting_started, participant_joined, participant_left, quorum_achieved, vote_started, vote_closed, recording_started, recording_stopped, meeting_ended
- **Post-Meeting**: minutes_created, minutes_submitted, minutes_approved, minutes_revision_requested, action_item_created, action_item_completed, resolution_recorded, archived

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

### meetingConfirmationHistory ⚠️ DEPRECATED
**This table is replaced by `meetingEvents` above.** Kept for reference during migration only.

---

## Documents Module (Lean + Related Tables)

### documents
Core document metadata only. Related data in separate tables.

```typescript
{
  id: string (PK)
  name: string
  description: string | null
  
  // File Metadata (immutable after upload)
  fileName: string
  fileExtension: string
  fileType: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'image' | 'video' | 'audio' | 'other'
  mimeType: string
  fileSize: number
  pageCount: number | null
  
  // Storage (immutable)
  storageProvider: 'local' | 'azure' | 's3' | 'gcs'
  storageKey: string
  storageBucket: string | null
  url: string
  thumbnailUrl: string | null
  
  // Organization
  categoryId: string (FK → documentCategories)
  boardId: string | null (FK → boards)
  
  // Upload Info
  uploadedBy: number (FK → users)
  uploadedByName: string
  uploadedAt: string
  source: 'upload' | 'generated' | 'imported' | 'scanned'
  
  // Status
  status: 'draft' | 'active' | 'archived' | 'deleted'
  
  // Security
  watermarkEnabled: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
}
```

### documentAttachments
Links documents to entities (polymorphic).

```typescript
{
  id: string (PK)
  documentId: string (FK → documents)
  
  // Polymorphic relationship
  entityType: 'meeting' | 'agenda_item' | 'minutes' | 'action_item' | 'vote' | 'resolution' | 'board'
  entityId: string
  
  // Context
  attachmentType: 'primary' | 'supporting' | 'reference' | 'generated'
  displayOrder: number
  
  // Metadata
  attachedBy: number (FK → users)
  attachedAt: string
}
```

### documentVersions
Version history for documents.

```typescript
{
  id: string (PK)
  documentId: string (FK → documents)
  versionNumber: number
  
  // File details for this version
  fileName: string
  fileSize: number
  storageKey: string
  url: string
  
  // Change tracking
  changeDescription: string | null
  createdBy: number (FK → users)
  createdAt: string
  
  // Status
  isCurrent: boolean
}
```

### documentSignatures
Digital signatures on documents.

```typescript
{
  id: string (PK)
  documentId: string (FK → documents)
  
  // Signer
  signedBy: number (FK → users)
  signerName: string
  signerRole: string
  
  // Signature details
  signatureHash: string
  signatureMethod: 'digital' | 'biometric' | 'pin'
  certificateId: string | null
  
  // Verification
  verified: boolean
  verificationDate: string | null
  
  signedAt: string
  signatureData: string | null // Base64 image
}
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

### documentPermissions
Access control for documents.

```typescript
{
  id: string (PK)
  documentId: string (FK → documents)
  
  // Permission target (user or role)
  targetType: 'user' | 'role' | 'board'
  targetId: string
  
  // Permissions
  canView: boolean
  canDownload: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
  
  // Validity
  expiresAt: string | null
  
  grantedBy: number (FK → users)
  grantedAt: string
}
```

### documentCategories
Document categorization.

```typescript
{
  id: string (PK)
  name: string
  description: string | null
  parentId: string | null (FK → documentCategories)
  boardId: string | null (FK → boards)
  color: string | null
  icon: string | null
  sortOrder: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}
```

### documentTags
Tags for documents.

```typescript
{
  id: string (PK)
  documentId: string (FK → documents)
  tag: string
  createdBy: number (FK → users)
  createdAt: string
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

## Voting Module (Event-Sourced)

### votes
Lean vote definitions with polymorphic entity relationships.

```typescript
{
  id: string (PK)
  
  // Polymorphic - what are we voting on?
  entityType: 'agenda_item' | 'minutes' | 'action_item' | 'resolution'
  entityId: string
  
  meetingId: string (FK → meetings)
  boardId: string (FK → boards)
  
  // Vote details
  title: string
  description: string | null

  // Status
  status: 'draft' | 'configured' | 'open' | 'closed' | 'archived'
  outcome: 'passed' | 'failed' | 'invalid' | null
  
  // Metadata
  createdBy: number (FK → users)
  createdByName: string
  createdAt: string
  openedAt: string | null
  closedAt: string | null
}
```

### voteConfigurations
Immutable voting rules snapshot - locked after voting opens.

```typescript
{
  id: string (PK)
  voteId: string (FK → votes)
  
  // Voting method
  votingMethod: 'yes_no' | 'yes_no_abstain' | 'multiple_choice' | 'ranked'
  
  // Quorum and threshold
  quorumRequired: boolean
  quorumPercentage: number
  passThresholdPercentage: number
  passingRule: 'simple_majority' | 'two_thirds' | 'three_quarters' | 'unanimous'
  
  // Options
  anonymous: boolean
  allowAbstain: boolean
  allowChangeVote: boolean
  timeLimit: number | null // seconds
  autoCloseWhenAllVoted: boolean
  
  createdAt: string
}
```

### voteOptions
Choices available for each vote.

```typescript
{
  id: string (PK)
  voteId: string (FK → votes)
  label: string
  description: string | null
  displayOrder: number
}
```

### voteEligibility
Defines who can vote with their weights.

```typescript
{
  id: string (PK)
  voteId: string (FK → votes)
  userId: number (FK → users)
  userName: string
  userRole: string
  weight: number // default 1.0
  eligible: boolean
}
```

### votesCast
Append-only record of every vote cast. NEVER updated or deleted.

```typescript
{
  id: string (PK)
  voteId: string (FK → votes)
  optionId: string (FK → voteOptions)
  userId: number | null // null if anonymous
  userName: string | null
  weightApplied: number
  castAt: string
  ipAddress: string | null
  userAgent: string | null
}
```

### voteResults
Cached computed results - DERIVED from votesCast. For performance only.

```typescript
// Per-option results
{
  voteId: string (FK → votes)
  optionId: string (FK → voteOptions)
  optionLabel: string
  totalWeight: number
  voteCount: number
  percentage: number
  isWinner: boolean
}

// Summary results
{
  voteId: string (FK → votes)
  totalEligible: number
  totalVoted: number
  totalWeight: number
  quorumRequired: number
  quorumMet: boolean
  thresholdPercentage: number
  outcome: 'passed' | 'failed' | 'invalid'
  computedAt: string
}
```

### voteActions
Audit log - captures EVERY action in voting lifecycle.

```typescript
{
  id: string (PK)
  voteId: string (FK → votes)
  actionType: 'created' | 'configured' | 'opened' | 'vote_cast' | 'vote_changed' | 'closed' | 'results_generated' | 'reopened' | 'archived'
  performedBy: number (FK → users)
  performedByName: string
  metadata: Record<string, any> | null // JSON for action-specific data
  createdAt: string
}
```

---

## Minutes Module

### minutes
Meeting minutes with workflow status tracking.

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings)

  // Content
  content: string // Rich HTML content
  contentPlainText: string // Plain text for search

  // Template used (optional)
  templateId: string | null

  // Status workflow
  status: 'draft' | 'pending_review' | 'revision_requested' | 'approved' | 'published'

  // Workflow tracking - Creation
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string

  // Workflow tracking - Submission
  submittedAt: string | null
  submittedBy: number | null (FK → users)

  // Workflow tracking - Approval
  approvedAt: string | null
  approvedBy: number | null (FK → users)
  approvalNotes: string | null

  // Workflow tracking - Revision
  revisionRequestedAt: string | null
  revisionRequestedBy: number | null (FK → users)
  revisionReason: string | null

  // Workflow tracking - Publishing
  publishedAt: string | null
  publishedBy: number | null (FK → users)

  // Version tracking
  version: number

  // Generated assets
  pdfUrl: string | null

  // Settings
  allowComments: boolean
  reviewDeadline: string | null

  // Metadata
  wordCount: number
  estimatedReadTime: number // minutes
}
```

### minutesComments
Review comments and feedback on meeting minutes.

```typescript
{
  id: string (PK)
  minutesId: string (FK → minutes)

  // Comment content
  comment: string
  commentType: 'general' | 'section' | 'highlight'

  // Reference to content
  sectionReference: string | null
  highlightedText: string | null
  textPosition: { start: number, end: number } | null

  // Author
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string | null

  // Status
  resolved: boolean
  resolvedAt: string | null
  resolvedBy: number | null (FK → users)

  // Threading (for replies)
  parentCommentId: string | null (FK → minutesComments)

  // Secretary response
  secretaryResponse: string | null
  respondedAt: string | null
  respondedBy: number | null (FK → users)
}
```

### minutesSignatures
Digital signatures for approved and published minutes.

```typescript
{
  id: string (PK)
  minutesId: string (FK → minutes)

  // Signer
  signedBy: number (FK → users)
  signerRole: string
  signerName: string

  // Digital signature
  signatureHash: string
  signatureMethod: 'digital' | 'biometric' | 'pin'
  certificateId: string | null

  // Verification
  verified: boolean
  verificationDate: string | null

  signedAt: string

  // Optional: Image/data
  signatureData: string | null // Base64
}
```

---

## Action Items Module

### actionItems
Tasks and action items from meetings and minutes.

```typescript
{
  id: string (PK)

  // Source tracking (polymorphic)
  source: 'minutes' | 'meeting' | 'agenda_item' | 'manual'
  sourceId: string | null
  meetingId: string (FK → meetings)
  boardId: string (FK → boards)

  // Action details
  title: string
  description: string | null

  // Assignment
  assignedTo: number (FK → users)
  assignedBy: number (FK → users)

  // Timeline
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'

  // Status
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  completedAt: string | null
  completedBy: number | null (FK → users)
  completionNotes: string | null

  // Related entities
  relatedAgendaItemId: string | null (FK → agendaItems)
  relatedDocumentIds: string // JSON array

  // Reminders
  reminderSent: boolean
  lastReminderSentAt: string | null

  // Metadata
  createdAt: string
  updatedAt: string
}
```

---

## Resolutions Module

### resolutions
Formal board decisions and resolutions from meetings.

```typescript
{
  id: string (PK)
  meetingId: string (FK → meetings)
  boardId: string (FK → boards)

  // Resolution details
  resolutionNumber: string // e.g., 'RES-KTDA-2026-001'
  title: string
  text: string // Full resolution text
  category: 'policy' | 'financial' | 'operational' | 'strategic' | 'governance' | 'other'

  // Decision
  decision: 'approved' | 'rejected' | 'tabled' | 'withdrawn' | 'consensus'
  decisionDate: string

  // Voting (optional - some resolutions are by consensus)
  voteId: string | null (FK → votes)
  voteSummary: string | null

  // Related entities
  agendaItemId: string | null (FK → agendaItems)
  relatedDocumentIds: string // JSON array

  // Follow-up
  requiresFollowUp: boolean
  followUpDeadline: string | null
  followUpNotes: string | null

  // Implementation tracking
  implementationStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  implementedAt: string | null

  // Metadata
  createdBy: number (FK → users)
  createdAt: string
  updatedAt: string
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

- **Core**: 10 tables (boards, boardTypes, users, userBoardRoles, roles, permissions, rolePermissions, boardSettings, boardBranding, userSessions)
- **Meetings**: 4 tables (meetings, meetingParticipants, meetingEvents, meetingTypes)
- **Documents**: 8 tables (documents, documentAttachments, documentVersions, documentSignatures, documentAccessLogs, documentPermissions, documentCategories, documentTags)
- **Agenda**: 3 tables (agendas, agendaItems, agendaTemplates)
- **Voting**: 7 tables (votes, voteConfigurations, voteOptions, voteEligibility, votesCast, voteResults, voteActions)
- **Minutes**: 3 tables (minutes, minutesComments, minutesSignatures)
- **Action Items**: 1 table (actionItems)
- **Resolutions**: 1 table (resolutions)
- **Notifications**: 2 tables
- **Digital Signatures**: 1 table

**Total: 40 tables**

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
