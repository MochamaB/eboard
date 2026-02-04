# Meeting Lifecycle Events - Comprehensive Mapping

**Created:** February 4, 2026  
**Purpose:** Map all events across the three meeting phases with affected tables/modules

---

## 📊 Overview: Three Phases

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           MEETING LIFECYCLE                                          │
├─────────────────────┬─────────────────────┬─────────────────────────────────────────┤
│    PRE-MEETING      │   DURING MEETING    │           POST-MEETING                  │
│    (draft/scheduled)│   (in_progress)     │           (completed)                   │
├─────────────────────┼─────────────────────┼─────────────────────────────────────────┤
│ • Create meeting    │ • Start meeting     │ • Create minutes                        │
│ • Configure         │ • Join meeting      │ • Review/approve minutes                │
│ • Add participants  │ • Manage attendance │ • Create action items                   │
│ • Add agenda        │ • Present documents │ • Track action items                    │
│ • Add documents     │ • Conduct votes     │ • Record resolutions                    │
│ • Submit approval   │ • Record meeting    │ • Generate reports                      │
│ • Approve/reject    │ • End meeting       │ • Archive meeting                       │
│ • Reschedule        │                     │                                         │
│ • Cancel            │                     │                                         │
└─────────────────────┴─────────────────────┴─────────────────────────────────────────┘
```

---

## 🔵 PHASE 1: PRE-MEETING

### Status: `draft` (subStatus: `incomplete` | `complete`)

#### Event: MEETING_CREATED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary clicks "Create Meeting" |
| **Actor** | Board Secretary |
| **Status Change** | → `draft.incomplete` |
| **Tables Affected** | `meetings` (INSERT) |
| **Data Created** | Meeting record with basic info |

#### Event: PARTICIPANTS_ADDED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary adds/removes participants |
| **Actor** | Board Secretary |
| **Status Change** | None (stays in draft) |
| **Tables Affected** | `meetingParticipants` (INSERT/UPDATE/DELETE) |
| **Data Created** | Participant records linked to meeting |
| **Validation Impact** | Affects `minParticipants` check |

#### Event: AGENDA_CREATED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary creates/updates agenda |
| **Actor** | Board Secretary |
| **Status Change** | None (stays in draft) |
| **Tables Affected** | `agendas` (INSERT), `agendaItems` (INSERT/UPDATE) |
| **Data Created** | Agenda with items linked to meeting |
| **Validation Impact** | Affects `minAgendaItems` check |

#### Event: DOCUMENTS_ATTACHED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary uploads documents |
| **Actor** | Board Secretary |
| **Status Change** | None (stays in draft) |
| **Tables Affected** | `documents` (INSERT), `documentAttachments` (INSERT) |
| **Data Created** | Document records linked to meeting |
| **Validation Impact** | Affects `requiredDocuments` check |

#### Event: CONFIGURATION_COMPLETE
| Attribute | Value |
|-----------|-------|
| **Trigger** | Validation service detects all requirements met |
| **Actor** | System (automatic) |
| **Status Change** | `draft.incomplete` → `draft.complete` |
| **Tables Affected** | `meetings` (UPDATE subStatus), `meetingEvents` (INSERT) |
| **Data Created** | Event record marking configuration complete |

#### Event: MEETING_UPDATED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary edits meeting details |
| **Actor** | Board Secretary |
| **Status Change** | May revert `draft.complete` → `draft.incomplete` if validation fails |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event record with change details |

---

### Status: `scheduled` (subStatus: `pending_approval` | `approved` | `rejected`)

#### Event: SUBMITTED_FOR_APPROVAL
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary clicks "Submit for Approval" |
| **Actor** | Board Secretary |
| **Status Change** | `draft.complete` → `scheduled.pending_approval` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event with submission notes, unsigned document reference |
| **Notifications** | Email/push to designated approver |
| **Documents Generated** | Unsigned confirmation PDF |

#### Event: SCHEDULED_DIRECTLY
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary schedules meeting (no approval required) |
| **Actor** | Board Secretary |
| **Status Change** | `draft.complete` → `scheduled.approved` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event marking direct scheduling |
| **Notifications** | Invitations sent to all participants |
| **Business Rule** | Only for meeting types that skip approval (emergency, etc.) |

#### Event: APPROVED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Approver signs and confirms meeting |
| **Actor** | Chairman / Company Secretary |
| **Status Change** | `scheduled.pending_approval` → `scheduled.approved` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT), `documentSignatures` (INSERT) |
| **Data Created** | Event with signature reference, signed document |
| **Notifications** | Invitations sent to all participants, confirmation to secretary |
| **Documents Generated** | Signed confirmation PDF |

#### Event: REJECTED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Approver rejects meeting |
| **Actor** | Chairman / Company Secretary |
| **Status Change** | `scheduled.pending_approval` → `scheduled.rejected` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event with rejection reason and comments |
| **Notifications** | Rejection notice to secretary with reason |

#### Event: REVISION_STARTED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary starts revising rejected meeting |
| **Actor** | Board Secretary |
| **Status Change** | `scheduled.rejected` → `draft.incomplete` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event marking revision start |

#### Event: RESCHEDULED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary changes meeting date/time |
| **Actor** | Board Secretary |
| **Status Change** | May require re-approval depending on board settings |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event with previous and new schedule |
| **Notifications** | Update sent to all participants |
| **Business Rule** | If already approved, may need re-confirmation |

#### Event: CANCELLED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary/Admin cancels meeting |
| **Actor** | Board Secretary / Admin |
| **Status Change** | Any pre-meeting status → `cancelled` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event with cancellation reason |
| **Notifications** | Cancellation notice to all participants |
| **Terminal State** | Yes - no further transitions |

---

## 🟢 PHASE 2: DURING MEETING

### Status: `in_progress` (no subStatus)

#### Event: MEETING_STARTED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Host clicks "Start Meeting" |
| **Actor** | Chairman / Board Secretary |
| **Status Change** | `scheduled.approved` → `in_progress` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Event with actual start time |
| **Notifications** | "Meeting has started" to all participants |
| **External Actions** | Generate Jitsi room URL, enable video conference |

#### Event: PARTICIPANT_JOINED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Participant joins video conference |
| **Actor** | Any participant |
| **Status Change** | None |
| **Tables Affected** | `meetingParticipants` (UPDATE attendance), `meetingEvents` (INSERT) |
| **Data Created** | Join timestamp, attendance record |

#### Event: PARTICIPANT_LEFT
| Attribute | Value |
|-----------|-------|
| **Trigger** | Participant leaves video conference |
| **Actor** | Any participant |
| **Status Change** | None |
| **Tables Affected** | `meetingParticipants` (UPDATE attendance), `meetingEvents` (INSERT) |
| **Data Created** | Leave timestamp, duration calculated |

#### Event: QUORUM_ACHIEVED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Minimum participants joined |
| **Actor** | System (automatic) |
| **Status Change** | None |
| **Tables Affected** | `meetingEvents` (INSERT) |
| **Data Created** | Event marking quorum achieved |

#### Event: VOTE_STARTED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Chairman initiates vote |
| **Actor** | Chairman |
| **Status Change** | None |
| **Tables Affected** | `votes` (INSERT), `voteOptions` (INSERT), `voteEligibility` (INSERT) |
| **Data Created** | Vote record with options and eligible voters |

#### Event: VOTE_CAST
| Attribute | Value |
|-----------|-------|
| **Trigger** | Participant submits vote |
| **Actor** | Eligible voter |
| **Status Change** | None |
| **Tables Affected** | `votesCast` (INSERT), `voteActions` (INSERT) |
| **Data Created** | Individual vote record |

#### Event: VOTE_CLOSED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Chairman closes vote or time expires |
| **Actor** | Chairman / System |
| **Status Change** | None |
| **Tables Affected** | `votes` (UPDATE), `voteResults` (INSERT) |
| **Data Created** | Vote results, outcome determination |

#### Event: RECORDING_STARTED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Host starts recording |
| **Actor** | Chairman / Board Secretary |
| **Status Change** | None |
| **Tables Affected** | `meetingEvents` (INSERT) |
| **Data Created** | Recording start event |

#### Event: RECORDING_STOPPED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Host stops recording or meeting ends |
| **Actor** | Chairman / Board Secretary / System |
| **Status Change** | None |
| **Tables Affected** | `meetingEvents` (INSERT), `documents` (INSERT - recording file) |
| **Data Created** | Recording file reference |

#### Event: MEETING_ENDED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Host clicks "End Meeting" or last participant leaves |
| **Actor** | Chairman / Board Secretary / System |
| **Status Change** | `in_progress` → `completed.recent` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT), `meetingParticipants` (UPDATE final attendance) |
| **Data Created** | Event with end time, duration, final attendance |
| **Notifications** | "Meeting has ended" to all, prompt to create minutes |

---

## 🟠 PHASE 3: POST-MEETING

### Status: `completed` (subStatus: `recent` | `archived`)

#### Event: MINUTES_CREATED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary clicks "Create Minutes" |
| **Actor** | Board Secretary |
| **Status Change** | None (stays `completed.recent`) |
| **Tables Affected** | `minutes` (INSERT) |
| **Data Created** | Minutes record with draft content |
| **Pre-populated** | Attendees, agenda items, vote results |

#### Event: MINUTES_UPDATED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary edits minutes |
| **Actor** | Board Secretary |
| **Status Change** | None |
| **Tables Affected** | `minutes` (UPDATE) |
| **Data Created** | Updated content, version increment |

#### Event: MINUTES_SUBMITTED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary submits minutes for approval |
| **Actor** | Board Secretary |
| **Status Change** | None (meeting status unchanged) |
| **Tables Affected** | `minutes` (UPDATE status), `meetingEvents` (INSERT) |
| **Data Created** | Minutes status → `pending_review` |
| **Notifications** | "Minutes ready for approval" to Chairman |

#### Event: MINUTES_APPROVED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Chairman approves minutes |
| **Actor** | Chairman |
| **Status Change** | None (meeting status unchanged) |
| **Tables Affected** | `minutes` (UPDATE), `minutesSignatures` (INSERT), `meetingEvents` (INSERT) |
| **Data Created** | Approval record, signature |
| **Notifications** | "Minutes approved" to all board members |
| **Documents Generated** | Final approved minutes PDF |

#### Event: MINUTES_REVISION_REQUESTED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Chairman requests changes |
| **Actor** | Chairman |
| **Status Change** | None |
| **Tables Affected** | `minutes` (UPDATE status), `minutesComments` (INSERT), `meetingEvents` (INSERT) |
| **Data Created** | Revision request with comments |
| **Notifications** | "Changes requested" to Secretary |

#### Event: ACTION_ITEM_CREATED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary creates action item |
| **Actor** | Board Secretary |
| **Status Change** | None |
| **Tables Affected** | `actionItems` (INSERT) |
| **Data Created** | Action item linked to meeting and agenda item |
| **Notifications** | "New action item assigned" to assignee |

#### Event: ACTION_ITEM_UPDATED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Assignee or Secretary updates action item |
| **Actor** | Assignee / Board Secretary |
| **Status Change** | None |
| **Tables Affected** | `actionItems` (UPDATE) |
| **Data Created** | Updated action item |

#### Event: ACTION_ITEM_COMPLETED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Assignee marks action item complete |
| **Actor** | Assignee |
| **Status Change** | None |
| **Tables Affected** | `actionItems` (UPDATE status) |
| **Data Created** | Completion record |
| **Notifications** | "Action item completed" to Secretary |

#### Event: RESOLUTION_RECORDED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Secretary records formal resolution |
| **Actor** | Board Secretary |
| **Status Change** | None |
| **Tables Affected** | `resolutions` (INSERT) |
| **Data Created** | Resolution linked to meeting and vote |

#### Event: MEETING_ARCHIVED
| Attribute | Value |
|-----------|-------|
| **Trigger** | Manual archive or auto after X days |
| **Actor** | Board Secretary / System |
| **Status Change** | `completed.recent` → `completed.archived` |
| **Tables Affected** | `meetings` (UPDATE), `meetingEvents` (INSERT) |
| **Data Created** | Archive event |
| **Business Rule** | All post-meeting work should be complete |
| **Effect** | Meeting becomes read-only |

---

## 📋 Tables Summary by Module

### Core Meeting Module
| Table | Purpose | Phase(s) |
|-------|---------|----------|
| `meetings` | Meeting configuration and status | All |
| `meetingEvents` | All workflow events (NEW/EXPANDED) | All |
| `meetingParticipants` | Invited participants and attendance | Pre, During |

### Agenda Module
| Table | Purpose | Phase(s) |
|-------|---------|----------|
| `agendas` | Agenda container | Pre |
| `agendaItems` | Individual agenda items | Pre |
| `agendaTemplates` | Reusable agenda templates | Pre |

### Documents Module
| Table | Purpose | Phase(s) |
|-------|---------|----------|
| `documents` | Document records | All |
| `documentAttachments` | Links documents to meetings | Pre, Post |
| `documentSignatures` | Digital signatures | Pre (approval), Post (minutes) |
| `documentVersions` | Version history | All |

### Voting Module
| Table | Purpose | Phase(s) |
|-------|---------|----------|
| `votes` | Vote definitions | During |
| `voteOptions` | Vote choices | During |
| `votesCast` | Individual votes | During |
| `voteResults` | Aggregated results | During, Post |
| `voteEligibility` | Who can vote | During |
| `voteActions` | Vote audit trail | During |
| `voteConfigurations` | Vote settings | Pre (setup) |

### Minutes Module
| Table | Purpose | Phase(s) |
|-------|---------|----------|
| `minutes` | Minutes content and status | Post |
| `minutesComments` | Review comments | Post |
| `minutesSignatures` | Approval signatures | Post |

### Action Items Module
| Table | Purpose | Phase(s) |
|-------|---------|----------|
| `actionItems` | Tasks from meeting | Post |

### Resolutions Module
| Table | Purpose | Phase(s) |
|-------|---------|----------|
| `resolutions` | Formal decisions | Post |

---

## 🔄 Proposed `meetingEvents` Table

Unified event log replacing/expanding `meetingConfirmationHistory`:

```typescript
type MeetingEventType = 
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
  | 'resolution_recorded';

interface MeetingEventRow {
  id: string;
  meetingId: string;
  eventType: MeetingEventType;
  
  // State tracking
  fromStatus: MeetingStatus | null;
  fromSubStatus: string | null;
  toStatus: MeetingStatus | null;
  toSubStatus: string | null;
  
  // Actor
  performedBy: number;
  performedAt: string;
  
  // Event-specific data
  metadata: {
    // Approval events
    signatureId?: string;
    signatureImageUrl?: string;
    rejectionReason?: string;
    rejectionComments?: string;
    documentId?: string;
    
    // Reschedule events
    previousDate?: string;
    previousTime?: string;
    newDate?: string;
    newTime?: string;
    
    // Cancellation
    cancellationReason?: string;
    
    // Participant events
    participantId?: number;
    joinTime?: string;
    leaveTime?: string;
    
    // Vote events
    voteId?: string;
    
    // Minutes events
    minutesId?: string;
    
    // Action item events
    actionItemId?: string;
    
    // Generic
    notes?: string;
  } | null;
  
  createdAt: string;
}
```

---

## ❓ Decision Points

1. **Rename `meetingConfirmationHistory` → `meetingEvents`?**
   - Pros: Single source of truth, full audit trail
   - Cons: Migration effort, more data in one table

2. **Keep status on `meetings` table as cached value?**
   - Recommended: Yes, for query performance
   - Update status when inserting events

3. **Which events need their own tables vs just `meetingEvents`?**
   - Own tables: Votes, Minutes, Action Items (complex data)
   - Events only: Status changes, participant join/leave

4. **Granularity of events?**
   - High: Every participant join/leave
   - Medium: Key milestones only
   - Recommendation: High for audit, can filter for display

---

**Last Updated:** February 4, 2026
