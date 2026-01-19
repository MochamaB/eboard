# Module 3: Meeting Management

**Purpose**: Schedule, organize, and track board meetings

## What We Need:

### 1. Board/Committee Selection (CRITICAL)
- When creating meeting, Secretary MUST select which board OR committee the meeting is for
- Dropdown showing:
  - All boards where Secretary has permissions
  - **All committees where Secretary is a member** (NEW)
- Examples: "Main Board", "Audit Committee", "KETEPA Limited Board", "Chebut Tea Factory Board"
- Meeting cannot be created without board/committee selection
- Board/Committee name displayed prominently throughout meeting lifecycle
- **For committees**: Parent board name also shown (e.g., "Audit Committee (Main Board)")

### 2. Meeting Scheduling and Calendar Integration
- Secretary can create new meetings with title, date/time, duration, and description for selected board
- Ability to schedule recurring meetings (weekly, monthly, quarterly, annually)
- Example: Add all 12 monthly board meetings for the year at once for Chebut Factory Board
- Calendar view showing:
  - All meetings across all boards user is member of (combined view)
  - Filter by specific board (e.g., show only Main Board meetings)
  - Color-code meetings by board type (Main=blue, Subsidiary=green, Factory=yellow)
- Multi-board calendar view for Chairman showing all 78 boards' meetings

### 3. Meeting Types
- Support different meeting types: Regular Board Meeting, Special Meeting, Annual General Meeting, Committee Meeting, Emergency Meeting
- Each type can have different default settings:
  - Default duration
  - Default quorum rules
  - **Confirmation requirement override** (e.g., Emergency Meetings skip confirmation, AGMs force confirmation)
  - Designated approver for that meeting type

### 4. Participant Management (Board/Committee-Specific)
- Participant list auto-populated from selected board's or committee's members
- Only members of the selected board/committee can be added as participants
- **For committees**: Only committee members appear in participant list (subset of parent board)
- Roles inherited from board/committee membership (Chairman, Members, Secretary, etc.)
- Set quorum requirement based on board/committee's default (e.g., "50% of members must be present")
- Track RSVP status (Accepted, Declined, Tentative, No Response)
- Chairman (Main Board) appears in all subsidiary board meetings and all committee meetings automatically

### 5. Guest/Presenter Management (NEW)
- Secretary can add **Guests/Presenters** to meeting (users who are NOT board/committee members)
- Common use cases:
  - General Managers presenting to board
  - Department heads presenting reports
  - External consultants
  - Subject matter experts
- **Add Guest to Meeting**:
  - Search for user by name/email (must have user account)
  - If user doesn't exist, create guest account first
  - Specify guest details:
    - Name and role/title (e.g., "GM of KETEPA", "Sales Manager")
    - **Presentation time slot**: From 10:30 AM to 11:00 AM (30 minutes)
    - **Presentation topic**: "Q4 Sales Performance Report"
    - **Documents guest can upload**: Allow guest to upload presentation materials
- **Guest Permissions (Configurable by Chairman)**:
  - Join meeting: Yes (only during designated time slot)
  - Upload documents: Yes (presentation materials only)
  - View board/committee documents: No (default) - Chairman can override
  - Share screen: Yes (for presentation)
  - Vote: No (never allowed)
  - Chat: Yes (during their session)
  - **Receive meeting minutes after meeting**: Chairman decides Yes/No per guest
- **Guest Access Control**:
  - Guest cannot join meeting before designated time
  - Guest placed in waiting room until Chairman admits them
  - Chairman removes guest after presentation (automatic or manual)
  - Guest loses access to meeting after removal
- **Guest Document Access**:
  - Guests can only see documents they uploaded
  - Cannot access board pack or other meeting documents (unless Chairman grants access)
- Multiple guests can be added to same meeting with different time slots

### 6. Meeting Confirmation Requirement
- When creating meeting, system determines if confirmation is required based on:
  - **Priority 1**: Meeting type override (Emergency = no confirmation, AGM = force confirmation)
  - **Priority 2**: Per-meeting toggle (if board/type allows override)
  - **Priority 3**: Board default setting (Main Board = required, Factories = optional)
- If confirmation required:
  - Display: "This meeting requires confirmation by [Company Secretary/Chairman]"
  - Meeting remains in "Pending Confirmation" status
  - Invitations NOT sent until confirmed
- If confirmation not required:
  - Meeting proceeds directly to "Scheduled" status
  - Invitations sent immediately

### 7. Meeting Confirmation Document Generation and Digital Signature
- **Generate Confirmation Document**:
  - Board Secretary clicks "Request Confirmation" after creating meeting
  - System generates official meeting notice/confirmation PDF from template
  - Template includes:
    - Board name and logo
    - Meeting title, date, time, venue (physical/virtual)
    - List of invited participants
    - Agenda summary
    - Company Secretary/Approver details
  - Secretary can add custom fields:
    - Special instructions (e.g., "Please arrive 15 minutes early")
    - Dress code, parking instructions, materials to bring
    - Any other meeting-specific notes
- **Preview and Edit**:
  - Secretary can preview PDF before sending for signature
  - Make edits to custom fields if needed
  - Cannot edit auto-populated fields (date, time, participants)
- **Digital Signature Workflow**:
  - System notifies designated approver (Company Secretary or board-specific approver)
  - Approver reviews meeting details and confirmation document
  - Approver enters their password/PIN to authenticate
  - System applies digital signature to PDF using approver's certificate:
    - Uses iText7 library for PDF signing
    - Embeds X.509 certificate
    - Adds visible signature block showing: Name, Title, Date/Time, "Digitally Signed"
    - PDF becomes tamper-proof (any changes invalidate signature)
  - Signature includes:
    - Reason: "Meeting Confirmation"
    - Location: "KTDA Headquarters"
    - Timestamp: Exact date and time of signing
- **Post-Signature Actions**:
  - Meeting status changes to "Confirmed"
  - System automatically sends invitations to all participants
  - Signed confirmation PDF attached to invitation email
  - Original unsigned version and signed version both stored for audit
- **Rejection/Changes**:
  - Approver can reject confirmation with reason
  - Meeting returns to "Draft" status
  - Secretary notified to make changes
  - If meeting details change after confirmation, must be re-confirmed (new signature required)

### 8. Meeting Invitations
- **For meetings requiring confirmation**: Invitations sent automatically AFTER confirmation signature
- **For meetings not requiring confirmation**: Invitations sent immediately when meeting is scheduled
- Email includes:
  - Meeting details
  - Calendar attachment (.ics file)
  - Join link (for virtual meetings)
  - **Signed confirmation document** (if confirmation was required)
- Email subject examples:
  - With confirmation: "Meeting Confirmed: Main Board - February 15, 2026"
  - Without confirmation: "Meeting Scheduled: Chebut Factory Board - February 20, 2026"
- Send reminder emails 24 hours before meeting and 1 hour before meeting
- Allow Secretary to resend invitations

### 9. Meeting Status Workflow
- **Draft** - meeting created but not finalized
- **Pending Confirmation** - awaiting approver's signature (only if confirmation required)
- **Confirmed** - approver signed confirmation document
- **Scheduled** - invitations sent, waiting for meeting time (for meetings not requiring confirmation, or after confirmation)
- **In Progress** - meeting currently happening
- **Completed** - meeting finished
- **Cancelled** - meeting cancelled with reason recorded
- **Rejected** - approver rejected confirmation (meeting must be revised)

### 10. Multi-Board and Committee Meeting Dashboard
- **Combined View**: See all upcoming meetings across all boards AND committees user is member of
- **Entity Filter**: Filter by:
  - Specific board (e.g., only Main Board meetings)
  - Specific committee (e.g., only Audit Committee meetings)
  - Entity type (show only committee meetings, or only board meetings)
  - Parent board (show Main Board + all its committees)
- **Entity Switcher**: Quick switch between boards/committees to see entity-specific dashboard
- **Chairman View**: Chairman sees all boards (78) + all committees in one consolidated dashboard
- Quick access to meeting documents and agenda
- Display pending action items from previous meetings (across all entities or per entity)
- Show meeting statistics per board/committee:
  - Example: "Attended 10 of 12 Main Board meetings, 8 of 10 Audit Committee meetings, 7 of 8 KETEPA meetings"
- Visual indicator showing which board/committee each meeting belongs to
- Color-coding: Main Board (blue), Committees (purple), Subsidiaries (green), Factories (yellow)

### 11. Cross-Board Meetings (Optional Future Phase)
- Ability to create joint meetings involving multiple boards
- Example: Joint Main Board and KETEPA Board strategic planning meeting
- Participants from multiple boards
- Documents accessible to all participating boards

### 12. Edit and Cancel Meetings
- Secretary can edit meeting details at any stage before meeting starts
- **If meeting already confirmed**: Changes require re-confirmation (new signature)
  - System notifies: "Meeting was previously confirmed. Changes will require re-confirmation."
  - Meeting status reverts to "Pending Confirmation"
  - New confirmation document generated with updated details
- **If meeting not yet confirmed**: Edit freely without re-confirmation
- Cancel meeting with notification sent to all participants
- Reschedule meeting with automatic re-invitation (requires re-confirmation if already confirmed)
- Cannot edit meetings after completion (maintain audit trail)

### 13. Company Secretary Role (Single Person for All Boards and Committees)
- One Company Secretary for entire KTDA organization
- Has digital signature certificate stored in system
- Certificate secured with password/PIN (entered each time signing)
- Main Board meetings ALWAYS require Company Secretary confirmation
- Other boards can designate different approvers (Chairman, Vice Chairman) in board settings
- Company Secretary can view all pending confirmations across all 78 boards
- Dashboard showing: "5 meetings awaiting your confirmation" with board names
