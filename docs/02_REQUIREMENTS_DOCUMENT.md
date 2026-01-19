# Online Board Meeting System - Requirements Document

## Document Information
- **Project Name**: eBoard Meeting System
- **Version**: 2.0 (Multi-Board Edition)
- **Date**: January 15, 2026
- **Technology Stack**: ASP.NET Core 8, SQL Server, Jitsi Meet
- **Document Type**: Functional Requirements
- **Organization**: KTDA (78 Boards + Committees: 1 Main Board + 8 Subsidiaries + 69 Factories + Standing Committees)

---

## Overview

This document outlines the core modules and their requirements for the eBoard Meeting System. Each module describes what needs to be built and what functionality it must provide.

### KTDA Multi-Board and Committee Structure

The system must support **boards and committees** in a hierarchical structure:

**Primary Boards (78):**
- **1 Main Board** (15 members: Chairman, Vice Chairman, 9 Board Members, 3 Executive Members)
- **8 Subsidiary Boards** (KTDA MS, KETEPA, Chai Trading, Greenland Fedha, Majani Insurance, KTDA Power, TEMEC, KTDA Foundation)
- **69 Factory Boards** (distributed across 7 regions)

**Committees (Variable Count):**
- **Main Board Committees** (e.g., Nomination, HR, Sales & Marketing, Audit/Governance/Risk)
  - Members selected from Main Board members only
  - Each committee: 3-6 members typically
- **Subsidiary Board Committees** (optional, configurable per subsidiary)
  - Members selected from respective subsidiary board members
- **Factory Board Committees** (optional, if needed)

**Total Estimated Entities**: 78 boards + 10-20 committees = ~90-100 governance entities

**Key Requirements:**
- Users can be members of multiple boards and committees with different roles on each
- Chairman has access to all boards and committees
- Committee members must be members of the parent board
- Users can be members of multiple committees simultaneously
- Other users only see boards/committees they're members of
- Each board and committee operates independently with full meeting, document, voting, and minutes functionality
- Reporting must consolidate data across all boards and committees

---

## Module 1: User Management & Authentication

**Purpose**: Manage users, roles, and secure access to the system

### What We Need:

1. **User Registration**
   - Admin can create user accounts with email, name, phone number, and role
   - System sends temporary password to new users via email
   - Users must change password on first login

2. **User Login**
   - Users login with email and password
   - System locks account after 5 failed login attempts for 15 minutes
   - Session expires after 30 minutes of inactivity

3. **Multi-Factor Authentication (MFA)**
   - Board members and administrators must enable MFA
   - Support Google Authenticator or Microsoft Authenticator app
   - Provide backup codes for account recovery

4. **Multi-Board Membership**
   - Users can be members of multiple boards simultaneously
   - Each board membership has its own role assignment
   - Example: John is Chairman on Main Board, Member on KETEPA Board, Observer on Chebut Factory Board
   - Chairman (Main Board) automatically has access to all 78 boards
   - Users only see boards they're members of (except Chairman who sees all)

5. **User Roles (Per Board and Committee)**
   - System Administrator - full system access across all boards and committees
   - Board Secretary - can create meetings, upload documents, manage participants for their board(s)/committee(s)
   - Chairman - can control meetings, start votes, approve minutes (Main Board Chairman sees all boards and committees)
   - Vice Chairman - similar to Chairman but for specific board/committee
   - Board Member - can join meetings, vote, view documents for their board(s)
   - Committee Member - can join committee meetings, vote, view committee documents
   - Executive Member - CEO, Company Secretary, Group Finance Director (special status)
   - Observer - can view meetings but cannot vote
   - **Guest/Presenter (NEW)** - Non-board member invited to present at specific meeting
     - Temporary access to specific meeting only
     - Can join meeting at designated time slot
     - Can upload presentation documents
     - Can share screen during presentation
     - Cannot vote
     - Cannot view other board/committee documents
     - Access controlled by Chairman (can admit/remove)
     - Chairman sets whether guest receives meeting minutes after meeting

6. **Board Membership Management**
   - Admin can add user to specific board with specific role
   - Admin can view all boards a user belongs to
   - Admin can remove user from board or change role on board
   - Track membership start date and end date (if membership expires)
   - When Chairman role is assigned on Main Board, automatically grant access to all subsidiary boards

7. **Password Management**
   - Minimum password: 12 characters with uppercase, lowercase, number, special character
   - Users can reset forgotten password via email link
   - Password reset link expires after 1 hour

8. **User Profile**
   - Users can update their name, phone number, profile picture, and timezone
   - Users can view their meeting history and attendance record across all boards
   - Users can see list of all boards they're members of with their role on each board
   - Users can switch between boards to view board-specific information

9. **Digital Signature Certificate Management (NEW)**
   - **Company Secretary Only** (initially):
     - Upload digital certificate (X.509 .pfx/.p12 file) to system
     - Certificate stored encrypted in database
     - Password/PIN required for each signature operation (not stored)
     - View certificate details: Issuer, Valid From/To, Subject
     - Certificate expiry warning 30 days before expiration
     - Replace/renew certificate when expired
   - **Future**: Other users (Chairmen) can upload certificates if designated as approvers
   - Certificate validation:
     - Verify certificate is valid (not expired)
     - Verify certificate chain of trust
     - Check certificate revocation status

---

## Module 2: Board Management

**Purpose**: Manage the 78 boards (1 Main + 8 Subsidiaries + 69 Factories) in the organization

### What We Need:

1. **Create and Configure Boards and Committees**
   - Admin can create new boards and committees
   - Board information:
     - Board name (e.g., "Main Board", "KETEPA Limited Board", "Chebut Tea Factory Board", "Audit Committee")
     - **Board type**: Main, Subsidiary, Factory, **Committee (NEW)**
     - **Parent board**: 
       - Subsidiaries linked to Main Board
       - **Committees MUST be linked to parent board** (e.g., Audit Committee → Main Board)
       - Committee members can only be selected from parent board members
     - Zone (for factory boards: e.g., Zone 1, Zone 2, Zone 3, etc.)
     - Board/Committee description
     - Status (Active, Inactive)
   - Board-specific settings:
     - Default quorum percentage (e.g., Main Board: 50%, Committees: 60%, Factory Boards: 60%)
     - **Meeting frequency requirement** (per board type):
       - Main Board: Quarterly (4/year)
       - Subsidiaries: Monthly (12/year)
       - Committees: As needed or quarterly (configurable)
       - Factories: Monthly (12/year)
     - Voting thresholds (simple majority, 2/3, unanimous)
     - **Confirmation Requirement**: Whether meetings require confirmation before invitations sent (optional for committees)
     - **Designated Approver**: Who must sign meeting confirmations (Company Secretary, Chairman, etc.)
     - Examples:
       - Main Board: Confirmation required by Company Secretary (mandatory)
       - Audit Committee: Confirmation optional, if required then Committee Chairman signs
       - Factory Boards: Confirmation optional

2. **Board and Committee Hierarchy Visualization**
   - Visual tree view showing complete governance structure:
     - **Main Board** at top
       - Main Board Committees (Nomination, HR, Sales & Marketing, Audit/Governance/Risk) as children
     - **8 Subsidiary Boards** as children of Main
       - Each subsidiary's committees (if any) as sub-children
     - **69 Factory Boards** organized by region
       - Factory committees (if any) as children
   - Click any board/committee to see details, members, and recent meetings
   - Search and filter by:
     - Name
     - Type (Main, Subsidiary, Factory, Committee)
     - Parent board (for committees)
     - Region (for factories)
     - Status (Active, Inactive)
   - Example hierarchy:
     ```
     Main Board (15 members)
       ├── Nomination Committee (4 members)
       ├── HR Committee (5 members)
       ├── Sales & Marketing Committee (6 members)
       └── Audit Committee (5 members)
     KETEPA Board (8 members)
       └── KETEPA Audit Committee (3 members)
     Chebut Factory Board (7 members)
     ```

3. **Board and Committee Membership Management**
   - **For Boards**: Add members to specific boards
   - **For Committees (NEW)**:
     - Add members to committees
     - **Member validation**: System only shows users who are members of the parent board
     - Example: When adding members to Audit Committee, only Main Board members appear in dropdown
     - Cannot add someone to committee if they're not on parent board
     - If user is removed from parent board, automatically removed from all child committees
   - Assign role for each membership:
     - Boards: Chairman, Vice Chairman, Member, Secretary, Observer
     - Committees: Committee Chairman, Committee Member, Committee Secretary
   - Set membership effective dates (start date, optional end date)
   - Remove members from boards/committees
   - View all members of a specific board/committee
   - View all boards AND committees a specific user belongs to
     - Example: "John is member of: Main Board, Audit Committee, HR Committee, KETEPA Board"
   - **Cross-committee membership allowed**: User can be on multiple committees simultaneously
   - Special rules:
     - Main Board Chairman automatically gets access to all subsidiary boards and all committees
     - Removing user from parent board triggers warning: "User is also on 3 committees. Remove from committees too?"

4. **Board and Committee Dashboard**
   - For each board/committee, show:
     - Current members and their roles
     - **For committees**: Parent board name clearly displayed
     - Total meetings held this year
     - Last meeting date
     - Next scheduled meeting
     - Pending action items
     - Document count
     - **Compliance status per board type**:
       - Main Board: Quarterly meetings required (4/year minimum)
       - Subsidiaries: Monthly meetings required (12/year minimum)
       - Committees: Configurable per committee (e.g., Audit: Quarterly, HR: Bi-monthly)
       - Factories: Monthly meetings required (12/year minimum)
     - Compliance indicator: ✓ Compliant / ⚠ Warning / ✗ Non-Compliant

5. **Board and Committee Activity Monitoring**
   - List of all active boards and committees with activity indicators
   - Identify inactive entities (no meetings in 6+ months)
   - Entities with compliance issues (not meeting minimum meeting requirements per board type)
   - Entities with low attendance rates
   - **Committee-specific monitoring**:
     - Committees with no meetings in current quarter
     - Committees with incomplete membership (fewer than 3 members)
     - Parent-child activity comparison (Main Board active but committees inactive)

6. **Bulk Board and Committee Operations**
   - Bulk import factory boards from CSV file
   - Bulk create committees for multiple boards (e.g., create Audit Committee for all 8 subsidiaries)
   - Assign same user to multiple boards/committees at once:
     - Add Chairman to all 8 subsidiary boards
     - Add user to multiple committees (e.g., add John to Audit, HR, and Nomination committees)
   - Apply same settings to multiple entities:
     - All factory boards get same quorum rule
     - All audit committees get same meeting frequency
   - Validate committee memberships: "Check that all committee members are on parent boards"

7. **Board Branding and Customization**
   - **Logo Configuration**:
     - Upload logo per board/subsidiary (PNG, SVG, max 2MB)
     - Logo displayed in header when organization selected
     - Factories use KTDA parent logo (no individual branding)
     - Committees inherit parent board logo (no separate branding)
   
   - **Color Theme Configuration**:
     - Primary color (buttons, links, sidebar active states)
     - Secondary color (accents, highlights)
     - Sidebar background color
     - Theme mode: Light or Dark
     - Preview theme before saving
     - KTDA Group (All) and KTDA Main Board can share same branding (configurable)
   
   - **Sidebar Menu Configuration**:
     - Enable/disable menu items per board type
     - Default configurations:
       - Main Board: All menu items enabled (Dashboard, Meetings, Documents, Members, Committees, Reports, Settings)
       - Subsidiaries: All menu items enabled
       - Factories: Committees menu hidden (factories typically have no committees)
     - Admin can customize menu items per board
   
   - **Branding Inheritance**:
     - Committees inherit parent board branding (no separate branding)
     - Factory boards use KTDA parent branding (no individual branding)
     - Subsidiaries have individual branding (logo, colors)
   
   - **Organization Selector** (Top Navigation):
     - Hierarchical dropdown replacing simple Board Switcher
     - Structure:
       - **KTDA Group (All)** - Aggregated view across all entities, configurable branding
       - **KTDA Main Board** - Main Board workspace with Main Board branding
       - **Subsidiaries (8)** - Expandable list, each with own branding
       - **Factories by Zone (69)** - Expandable by zone, all use KTDA branding
     - Behavior when organization selected:
       - Header logo changes to selected organization's logo
       - Color theme changes (sidebar, buttons, accents)
       - Sidebar menu items update based on board type configuration
       - Page content filters to selected organization's data
     - **Committees appear as horizontal tabs** within selected board (NOT in Organization Selector)
       - Example: Select "KTDA Main Board" → Tabs show: [Board] [Audit] [HR] [Nomination] [Sales]
       - Clicking committee tab filters content to that committee
       - Committee tabs inherit parent board branding
     - Selection persists across page navigation within session
     - User can set default organization for login in profile settings

---

## Module 3: Meeting Management

**Purpose**: Schedule, organize, and track board meetings

### What We Need:

1. **Board/Committee Selection (CRITICAL)**
   - When creating meeting, Secretary MUST select which board OR committee the meeting is for
   - Dropdown showing:
     - All boards where Secretary has permissions
     - **All committees where Secretary is a member** (NEW)
   - Examples: "Main Board", "Audit Committee", "KETEPA Limited Board", "Chebut Tea Factory Board"
   - Meeting cannot be created without board/committee selection
   - Board/Committee name displayed prominently throughout meeting lifecycle
   - **For committees**: Parent board name also shown (e.g., "Audit Committee (Main Board)")

2. **Meeting Scheduling and Calendar Integration**
   - Secretary can create new meetings with title, date/time, duration, and description for selected board
   - Ability to schedule recurring meetings (weekly, monthly, quarterly, annually)
   - Example: Add all 12 monthly board meetings for the year at once for Chebut Factory Board
   - Calendar view showing:
     - All meetings across all boards user is member of (combined view)
     - Filter by specific board (e.g., show only Main Board meetings)
     - Color-code meetings by board type (Main=blue, Subsidiary=green, Factory=yellow)
   - Multi-board calendar view for Chairman showing all 78 boards' meetings

3. **Meeting Types**
   - Support different meeting types: Regular Board Meeting, Special Meeting, Annual General Meeting, Committee Meeting, Emergency Meeting
   - Each type can have different default settings:
     - Default duration
     - Default quorum rules
     - **Confirmation requirement override** (e.g., Emergency Meetings skip confirmation, AGMs force confirmation)
     - Designated approver for that meeting type

4. **Participant Management (Board/Committee-Specific)**
   - Participant list auto-populated from selected board's or committee's members
   - Only members of the selected board/committee can be added as participants
   - **For committees**: Only committee members appear in participant list (subset of parent board)
   - Roles inherited from board/committee membership (Chairman, Members, Secretary, etc.)
   - Set quorum requirement based on board/committee's default (e.g., "50% of members must be present")
   - Track RSVP status (Accepted, Declined, Tentative, No Response)
   - Chairman (Main Board) appears in all subsidiary board meetings and all committee meetings automatically

5. **Guest/Presenter Management (NEW)**
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

6. **Meeting Confirmation Requirement**
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

7. **Meeting Confirmation Document Generation and Digital Signature**
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

8. **Meeting Invitations**
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

9. **Meeting Status Workflow**
   - **Draft** - meeting created but not finalized
   - **Pending Confirmation** - awaiting approver's signature (only if confirmation required)
   - **Confirmed** - approver signed confirmation document
   - **Scheduled** - invitations sent, waiting for meeting time (for meetings not requiring confirmation, or after confirmation)
   - **In Progress** - meeting currently happening
   - **Completed** - meeting finished
   - **Cancelled** - meeting cancelled with reason recorded
   - **Rejected** - approver rejected confirmation (meeting must be revised)

10. **Multi-Board and Committee Meeting Dashboard**
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

11. **Cross-Board Meetings (Optional Future Phase)**
   - Ability to create joint meetings involving multiple boards
   - Example: Joint Main Board and KETEPA Board strategic planning meeting
   - Participants from multiple boards
   - Documents accessible to all participating boards

12. **Edit and Cancel Meetings**
   - Secretary can edit meeting details at any stage before meeting starts
   - **If meeting already confirmed**: Changes require re-confirmation (new signature)
     - System notifies: "Meeting was previously confirmed. Changes will require re-confirmation."
     - Meeting status reverts to "Pending Confirmation"
     - New confirmation document generated with updated details
   - **If meeting not yet confirmed**: Edit freely without re-confirmation
   - Cancel meeting with notification sent to all participants
   - Reschedule meeting with automatic re-invitation (requires re-confirmation if already confirmed)
   - Cannot edit meetings after completion (maintain audit trail)

13. **Company Secretary Role (Single Person for All Boards and Committees)**
   - One Company Secretary for entire KTDA organization
   - Has digital signature certificate stored in system
   - Certificate secured with password/PIN (entered each time signing)
   - Main Board meetings ALWAYS require Company Secretary confirmation
   - Other boards can designate different approvers (Chairman, Vice Chairman) in board settings
   - Company Secretary can view all pending confirmations across all 78 boards
   - Dashboard showing: "5 meetings awaiting your confirmation" with board names

---

## Module 4: Video Conferencing (Jitsi Meet Integration)

**Purpose**: Enable board members to join virtual meetings with video and audio

### What We Need:

1. **Join Meeting (Board-Specific)**
   - One-click join button on meeting page
   - System generates secure Jitsi meeting room URL with board identifier (e.g., eboard-mainboard-{meetingId}, eboard-ketepa-{meetingId})
   - Users automatically identified by their name from profile
   - System verifies user is member of that board before allowing join
   - Waiting room for guests (Chairman must admit them)
   - Chairman can join any meeting across all 78 boards

2. **Video and Audio Controls**
   - Turn camera on/off
   - Mute/unmute microphone
   - Select which camera/microphone to use (if multiple devices)
   - Chairman can mute all participants at once

3. **Screen Sharing**
   - Any participant can share their screen (with permission)
   - Share entire screen or specific application window
   - Only one person can share screen at a time

4. **Meeting Layout Options**
   - Grid view - see all participants equally
   - Speaker view - active speaker shown large, others small
   - Pin specific participant's video

5. **Chat Functionality**
   - Public chat visible to all participants
   - Private messages between two participants
   - Share files in chat (images, small documents)
   - Chat history saved with meeting record

6. **Hand Raising**
   - Participants can raise hand to request to speak
   - Chairman sees queue of raised hands
   - Chairman can lower hands and manage speaking order

7. **Recording**
   - Chairman or Secretary can start/stop recording
   - All participants see notification when recording starts
   - Recording includes video, audio, screen shares, and chat
   - Recordings stored securely and available after meeting

8. **Participant Management**
   - See list of all participants (who's in the meeting)
   - **Participants categorized**:
     - Board/Committee Members (voting participants)
     - **Guests/Presenters** (non-voting, marked with "Guest" label)
   - See who has camera on/off, mic muted/unmuted
   - Chairman can remove disruptive participants
   - **Chairman can admit/remove guests**:
     - "Admit Guest: [Name]" button when guest's time slot arrives
     - "Remove Guest: [Name]" button after presentation
     - Auto-remove guest after time slot expires (configurable)
   - Lock meeting to prevent new participants from joining

9. **Network Quality Indicator**
   - Show connection quality (good, fair, poor)
   - Display warning if connection is unstable

---

## Module 5: Document Management (Board Pack)

**Purpose**: Upload, organize, and share meeting documents securely with board-level access control

### What We Need:

1. **Document Upload (Board-Specific)**
   - Secretary can upload documents for meetings on their board(s)
   - Documents automatically tagged with board identifier
   - Support PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX)
   - Maximum file size: 100MB per file
   - Drag and drop to upload multiple files at once
   - Upload progress bar showing percentage

2. **Document Organization**
   - Categorize documents by type:
     - Agenda
     - Meeting Minutes
     - **Meeting Confirmation/Notice** (NEW - auto-generated, digitally signed)
     - Financial Reports
     - Committee Reports
     - Presentations
     - Supporting Documents
   - Link documents to specific agenda items
   - Tag documents with keywords for easy searching
   - Meeting confirmation documents stored in two versions:
     - Original unsigned PDF
     - Digitally signed PDF (final, immutable)

3. **Document Viewing**
   - View PDF documents directly in browser (no download required)
   - Preview Word, Excel, PowerPoint documents online
   - Zoom in/out, rotate pages
   - Full-screen viewing mode
   - Page thumbnails for quick navigation

4. **Document Download**
   - Download individual documents
   - Download all meeting documents as ZIP file
   - Track who downloaded which documents and when
   - Restrict download permissions by user role

5. **Document Versioning**
   - Upload new version of existing document
   - Keep history of all previous versions with dates
   - View and compare different versions
   - Restore previous version if needed
   - Version numbering: v1.0, v1.1, v2.0

6. **Document Security (Board-Level Access Control)**
   - **Critical**: Users can ONLY access documents for boards they're members of
   - Main Board documents only visible to Main Board members
   - KETEPA Board documents only visible to KETEPA Board members
   - Factory A documents NOT visible to Factory B board members
   - Chairman (Main Board) can access documents across all 78 boards
   - Only meeting participants can access meeting documents
   - Documents encrypted when stored
   - Optional watermark with user's name and board name on viewed documents
   - Prevent printing or copying (optional setting)
   - Documents auto-deleted after configurable time (e.g., after 2 years)
   - **Meeting Confirmation Documents**:
     - Digitally signed PDFs are immutable (cannot be edited or deleted)
     - Signature validation shown when viewing (green checkmark if valid)
     - Show signature details: Signed by, Date/Time, Certificate validity
     - Warning if signature is invalid or certificate expired

7. **Document Search (Board-Filtered)**
   - Search documents by name, type, date, or content
   - Filter documents by board, meeting, category, date range
   - Search scope:
     - **User View**: Search only within boards user is member of
     - **Chairman View**: Search across all 78 boards
     - **Board Filter**: Limit search to specific board
   - Full-text search inside PDF documents
   - Save frequently used searches
   - Search results show which board each document belongs to

8. **Document Annotations** (Optional for future phase)
   - Add personal notes on documents
   - Highlight text
   - Draw on PDF pages
   - Annotations private to user (not shared)

---

## Module 6: Agenda Management

**Purpose**: Create, organize, and execute meeting agendas

### What We Need:

1. **Agenda Builder**
   - Secretary creates agenda for each meeting
   - Add agenda items with title and description
   - Set time allocation for each item (e.g., 15 minutes)
   - Drag and drop to reorder items
   - Agenda numbering automatic (1, 2, 3, 2.1, 2.2, etc.)

2. **Agenda Item Types**
   - Discussion Item - topic for discussion only
   - Decision Item - requires vote or resolution
   - Information Item - report or update (no discussion)
   - Committee Report - report from committee
   - Associate time with each item type

3. **Agenda Templates**
   - Create reusable agenda templates
   - Example: Standard monthly board meeting template with recurring items (approval of previous minutes, financial report, CEO update, etc.)
   - Apply template when creating new meeting agenda

4. **Link Documents to Agenda Items**
   - Attach supporting documents to specific agenda items
   - Example: Attach financial report PDF to "Financial Report" agenda item
   - Documents appear when that agenda item is being discussed

5. **Publish Agenda**
   - Secretary publishes agenda to all participants
   - Generate PDF version of agenda
   - Send notification email when agenda is published
   - Lock agenda after publishing (requires republish to make changes)

6. **Agenda Execution During Meeting**
   - Display current agenda item prominently during meeting
   - Chairman can mark item as "in progress"
   - Timer counts down time allocated for each item
   - Mark item as complete, skipped, or postponed
   - Add unplanned items during meeting (ad-hoc items)
   - Track actual time spent on each item vs. allocated time

---

## Module 7: Voting and Polling

**Purpose**: Conduct formal votes and informal polls during meetings with board-specific eligibility

### What We Need:

1. **Create Vote (Board-Specific)**
   - Chairman creates vote linked to agenda item for their board's meeting
   - Enter motion or resolution text
   - Choose vote type:
     - Yes/No/Abstain
     - Multiple choice (A, B, C, D options)
     - Open ballot (everyone sees who voted what)
     - Secret ballot (anonymous votes)
   - Set quorum requirement based on board's rules (e.g., "10 members must vote")
   - Set passing threshold based on board's rules (e.g., "50% Yes votes to pass", "66% Yes votes", "100% unanimous")
   - Different boards can have different voting thresholds

2. **Cast Vote (Board Eligibility Check)**
   - Only members of that specific board can vote
   - System verifies user's role on the board (Observers cannot vote, Members can vote)
   - Board members see vote notification in meeting
   - Clear voting interface with large buttons
   - Must confirm vote before submitting
   - Cannot change vote after submission (unless Chairman reopens vote)
   - Option to abstain from voting
   - Vote eligibility based on role on THAT board (user might be Observer on one board but Member on another)

3. **Real-Time Vote Results**
   - See vote count updating in real-time
   - Quorum status indicator (e.g., "8 of 10 required members voted")
   - Show result: Passed or Failed
   - For open ballots, show who voted what
   - For secret ballots, show only totals

4. **Vote History**
   - Record all votes with timestamps
   - Who voted what and when
   - Final result and whether quorum was met
   - Export vote results to PDF
   - Votes automatically recorded in meeting minutes

5. **Informal Polls**
   - Quick polls for non-binding decisions
   - Example: "What time works best for next meeting?"
   - Real-time response collection
   - Anonymous responses
   - Display results as chart (bar graph, pie chart)

6. **Proxy Voting** (Optional for future phase)
   - Board member can assign proxy to another member
   - Proxy valid for specific meeting or date range
   - Proxy vote recorded separately
   - Audit trail for all proxy assignments

---

## Module 8: Meeting Minutes

**Purpose**: Record, approve, and publish official meeting minutes

### What We Need:

1. **Minutes Creation**
   - Secretary takes minutes during or after meeting
   - Rich text editor for formatting (bold, italic, lists, headings)
   - Auto-populate with:
     - Meeting title, date, time
     - List of attendees (from attendance tracking)
     - Agenda structure
     - Vote results
   - Auto-save draft every 30 seconds (prevent data loss)

2. **Minutes Template**
   - Standard minutes format:
     - Meeting details (date, time, location/virtual)
     - Attendance and apologies
     - Approval of previous minutes
     - Matters arising
     - Agenda items discussed
     - Decisions and resolutions
     - Action items
     - Next meeting date
     - Adjournment time
   - Different templates for different meeting types

3. **Action Items from Minutes**
   - Create action items while writing minutes
   - Action item includes:
     - Description of task
     - Assigned to (board member)
     - Due date
     - Priority (Low, Medium, High)
     - Status (Open, In Progress, Completed)
   - Action items tracked separately and sent as reminders

4. **Minutes Approval Workflow**
   - Secretary submits draft minutes for review
   - Board members can comment or suggest edits
   - Chairman reviews and provides final approval
   - After approval, minutes are locked (read-only)
   - Approval recorded with date and approver name

5. **Publish Minutes**
   - Approved minutes distributed to all participants via email
   - Generate official PDF version with digital signature (optional)
   - Minutes added to meeting archive
   - Minutes available for future reference

6. **Minutes Search and Archive**
   - Search all past minutes by keyword, date, or topic
   - Filter by meeting type or date range
   - Download minutes as PDF
   - Link to related documents and recordings

---

## Module 9: Attendance and Participation Tracking

**Purpose**: Track who attends meetings and their participation

### What We Need:

1. **Automatic Attendance Tracking**
   - System automatically records when participants join meeting
   - Record join time and leave time
   - Mark attendance status:
     - Present (joined on time)
     - Late (joined after start time)
     - Left Early (left before end time)
     - Absent (never joined)

2. **Manual Attendance Adjustment**
   - Secretary can manually adjust attendance
   - Example: Mark someone as present if they called in separately
   - Record reason for absence (apologies, no notice)

3. **Quorum Calculation**
   - Real-time display of quorum status during meeting
   - Example: "8 of 10 board members present - Quorum met"
   - Alert if quorum is lost during meeting (someone leaves)

4. **Attendance Reports (Board-Specific and Consolidated)**
   - Generate attendance report for each meeting
   - **Per-Board Statistics**: Attendance rate per board member for each board
     - Example: "John attended 10 of 12 Main Board meetings (83%), 8 of 10 KETEPA meetings (80%)"
   - **Consolidated Statistics**: Overall attendance across all boards user is member of
   - **Chairman View**: Attendance statistics across all 78 boards
   - Identify members with poor attendance on specific boards
   - Export reports to Excel or PDF with board breakdown

5. **Participation Metrics** (Optional)
   - Track speaking time per participant
   - Count chat messages sent
   - Count votes cast
   - Engagement score to identify active vs. passive participants

---

## Module 10: Notifications

**Purpose**: Keep users informed about meetings and system activities

### What We Need:

1. **Email Notifications (Board-Tagged)**
   - Meeting invitation (with board name: "Main Board Meeting" vs "KETEPA Board Meeting")
   - Meeting reminder (24 hours before, 1 hour before) with board identification
   - Meeting started notification
   - New document uploaded (specify which board)
   - Agenda published (specify which board)
   - Vote opened (specify which board)
   - Action item assigned (specify from which board/meeting)
   - Minutes published (specify which board)
   - Meeting cancelled or rescheduled (specify which board)
   - All notifications clearly indicate which board they relate to

2. **In-App Notifications**
   - Notification bell icon showing unread count
   - Dropdown list of recent notifications
   - Click notification to go to related item
   - Mark as read/unread
   - Clear all notifications

3. **SMS Notifications** (Optional)
   - Critical reminders only (meeting starting in 30 minutes)
   - Emergency meeting alerts
   - User can opt-in or opt-out of SMS

4. **Notification Preferences**
   - Users can choose which notifications to receive
   - Choose delivery method (email, in-app, SMS)
   - Set quiet hours (e.g., no notifications between 10 PM - 7 AM)
   - Digest mode (daily summary instead of real-time)

---

## Module 11: Reporting and Analytics

**Purpose**: Generate consolidated and board-specific reports across all 78 boards

### What We Need:

1. **Meeting Summary Report (Consolidated and Per-Board/Committee)**
   - **Consolidated Report**: All meetings across all boards AND committees in date range
     - Group by entity type (Main, Subsidiary, Factory, **Committee**)
     - Total meetings examples:
       - Main Board: 12 meetings
       - Main Board Committees: 24 meetings (4 committees × 6 meetings avg)
       - Subsidiaries: 96 meetings
       - Factories: 828 meetings
   - **Per-Entity Report**: Meetings for specific board or committee
   - **Committee Aggregation**: Show committee meetings alongside parent board
     - Example: "Main Board Governance (16 meetings): Main Board (12) + Audit Committee (4)"
   - **Chairman View**: Access to reports across all boards and committees
   - **User View**: Reports only for boards/committees they're members of
   - Meeting status, attendance, duration
   - Decisions made and votes taken
   - **Guest participation statistics**: Number of guests, presentation topics
   - Export to PDF or Excel with board/committee breakdown

2. **Attendance Analytics (Multi-Board and Committee)**
   - **Per-Entity Attendance**: Attendance rate per member per board/committee
     - Example: "John: Main Board 85%, Audit Committee 90%, KETEPA 80%, Chebut Factory 75%"
   - **Consolidated Attendance**: Overall attendance across all boards and committees
   - **Cross-Entity Comparison**: Compare attendance rates across boards and committees
   - **Committee-Specific Analytics**:
     - Committee attendance vs parent board attendance
     - Members active on parent board but absent from committees
   - Attendance trends over time (graph) per entity or consolidated
   - Meetings where quorum was not met (by board/committee)
   - Late arrivals and early departures (by entity)
   - Most and least attended entities
   - **Identify overloaded members**: Members on too many boards/committees
     - Example: "John is on 1 board + 5 committees (potentially overloaded)"

3. **Action Items Report (Consolidated Across Boards and Committees)**
   - **Consolidated View**: All open action items across all boards AND committees user is member of
   - **Per-Entity View**: Action items from specific board or committee
   - **Chairman View**: Action items across all boards (78) and committees
   - Overdue action items (past due date) with board/committee identification
   - Completed action items by entity
   - Action items by assignee across all entities:
     - Example: "John has 20 pending action items: 5 from Main Board, 3 from Audit Committee, 4 from HR Committee, 3 from KETEPA, 5 from factories"
   - Action item completion rate per board/committee
   - **Committee action item flow**: Track if committee recommendations become board action items
   - Identify assignees with overdue items

4. **Document Usage Report**
   - Most downloaded documents
   - Document view counts
   - Storage usage statistics
   - Documents not accessed in 6+ months

5. **Compliance Report (Critical for Boards and Committees)**
   - **System-Wide Compliance Dashboard**:
     - Total entities: ~90-100 (78 boards + committees)
     - Boards: 78 (1 Main + 8 Subsidiaries + 69 Factories)
     - Committees: Variable (estimate 10-20)
     - Entities meeting requirements: 85 of 90 (94%)
     - Entities not meeting requirements: 5 entities (list them with entity type)
   - **Per-Entity Compliance by Type**:
     - **Main Board**: Quarterly meetings = 4/year required
     - **Subsidiaries**: Monthly meetings = 12/year required
     - **Committees**: Per committee configuration (e.g., Audit: Quarterly = 4/year, HR: Bi-monthly = 6/year)
     - **Factories**: Monthly meetings = 12/year required
     - Compliance status: ✓ Compliant / ⚠ Warning / ✗ Non-Compliant
   - **Regional Compliance** (for factories):
     - Kiambu Region: 9 of 10 factories compliant
     - Kisii Region: 12 of 13 factories compliant
   - **Committee Compliance**:
     - Committees meeting frequency requirements
     - Committees with quorum issues
     - Parent board compliant but committees non-compliant (flag for attention)
   - Quorum achievement rate per entity
   - Minutes approval time (days from meeting to approval) per entity
   - Voting participation rate per entity
   - Alert for entities with no meetings in 6+ months

6. **System Usage Statistics (Admin - Multi-Board and Committee)**
   - Active users count (total, per board, per committee)
   - Most active entities (by meeting count)
   - Least active entities (potential issues)
   - Peak usage times
   - Storage capacity used (total, per board type, per committee)
   - Bandwidth consumption
   - **Entity membership distribution**:
     - Users on 1 entity only: 150 users
     - Users on 2-5 entities: 80 users
     - Users on 6-10 entities: 30 users
     - Users on 11+ entities: 10 users (potentially overloaded)
   - **Committee vs Board membership**:
     - Users on boards but no committees: 100 users
     - Users on multiple committees: 50 users
   - **Guest/Presenter usage**:
     - Number of unique guests in system
     - Most frequent presenters
     - Guest presentations per month
   - Chairman dashboard usage statistics

---

## Module 12: System Administration

**Purpose**: Configure and manage the system

### What We Need:

1. **User Management (Multi-Board Context)**
   - Create, edit, delete user accounts
   - Bulk import users from CSV file with board assignments
   - Activate or deactivate user accounts (affects all board memberships)
   - Reset user passwords
   - **View User's Board Memberships**: See all boards a user belongs to with roles
   - **Add User to Multiple Boards**: Assign user to multiple boards at once with different roles
   - **Remove User from Board**: Remove user from specific board without deleting account
   - **Transfer User**: Move user from one board to another (e.g., factory manager promoted)

2. **System Configuration (Global and Per-Board)**
   - **Global Settings**:
     - Set organization details (name: KTDA, logo, timezone)
     - Set security policies (password requirements, session timeout, MFA enforcement)
     - Configure email templates
   - **Per-Board Settings**:
     - Configure default meeting settings per board type (Main: quarterly, Factories: monthly)
     - Set quorum percentage per board
     - Set voting thresholds per board
     - Configure board-specific notification preferences
   - **Apply Settings to Multiple Boards**: Bulk apply same settings to all factory boards

3. **Role and Permission Management (Board-Aware)**
   - Define what each role can do on their board(s)
   - Permissions are board-specific (Secretary on Main Board ≠ Secretary on Factory Board)
   - Example: Board Secretary can create meetings for their board(s) but cannot delete users
   - Create custom roles if needed
   - Assign permissions to roles
   - Chairman (Main Board) has special override permissions across all boards

4. **Audit Logs (Multi-Board)**
   - View complete log of all system actions across all 78 boards
   - Who did what, on which board, when, and from which IP address
   - Filter logs by:
     - User
     - Board (show only Main Board actions)
     - Action type
     - Date range
   - Export logs for compliance audits (per board or consolidated)
   - Logs cannot be edited or deleted (immutable)
   - Track cross-board activities (e.g., Chairman accessing all boards)

5. **Backup and Recovery**
   - Schedule automatic daily backups
   - Manually trigger backup on demand
   - View backup history
   - Restore from backup if needed
   - Test backup integrity

6. **System Health Monitoring**
   - Dashboard showing system status (all systems operational)
   - Database connection status
   - File storage capacity
   - Jitsi video service status
   - Email service status
   - Alert admin if any service is down

---

## Integration Requirements

### What We Need to Integrate:

1. **Jitsi Meet (Video Conferencing)**
   - Use free Jitsi servers (meet.jit.si) for MVP
   - Self-host Jitsi later if needed
   - Generate secure meeting room URLs
   - JWT authentication for private rooms

2. **Digital Signature Library (NEW)**
   - **iText7** (AGPL License - Free for open source, or purchase commercial license)
   - NuGet Package: `itext7` and `itext7.bouncy-castle-adapter`
   - Used for:
     - PDF generation
     - Digital signature embedding
     - Signature verification
     - PDF tamper detection
   - Alternative: Syncfusion PDF (Free Community License for companies < $1M revenue)

3. **File Storage**
   - Azure Blob Storage or AWS S3 for document storage
   - Local file system for development/testing
   - CDN for fast document delivery

4. **Email Service**
   - SendGrid, AWS SES, or Office 365 SMTP
   - Send transactional emails (invitations, notifications)
   - Track email delivery status

5. **SMS Service** (Optional)
   - Twilio for SMS notifications
   - Used for critical alerts only

6. **Calendar Integration** (Future Phase)
   - Google Calendar sync
   - Outlook Calendar sync
   - Two-way synchronization

---

## Security Requirements

### What We Need:

1. **Authentication Security**
   - Strong password enforcement
   - Multi-factor authentication for sensitive roles
   - Account lockout after failed attempts
   - Session timeout after inactivity

2. **Data Encryption**
   - HTTPS/TLS for all connections
   - Encrypt documents at rest (storage)
   - Encrypt database (SQL Server TDE)
   - Secure password hashing (BCrypt)

3. **Access Control**
   - Role-based permissions strictly enforced
   - Users can only access meetings they're invited to
   - Document access restricted by meeting participation
   - Regular permission audits

4. **Audit and Compliance**
   - Complete audit trail of all actions
   - Immutable logs (cannot be changed)
   - Log retention for 7 years (compliance requirement)
   - Regular security reviews

5. **Data Backup and Recovery**
   - Daily automated backups
   - Off-site backup storage
   - Recovery time objective: 4 hours
   - Regular backup restore tests

---

## Performance Requirements

### What We Need:

1. **Response Time**
   - Web pages load in under 3 seconds
   - API responses in under 500ms
   - Document preview loads in under 5 seconds
   - Video connection establishes in under 10 seconds

2. **Scalability (Multi-Board and Committee System)**
   - Support 500 registered users across all boards and committees
   - Support **~90-100 active entities** (78 boards + 10-20 committees)
   - Support 30 simultaneous meetings across all entities
   - Support 50 participants per meeting (including board members + guests)
   - Handle 2500 API requests per minute (increased for multi-entity queries)
   - Database must efficiently handle entity-filtered queries (board/committee membership checks)
   - User can be member of up to 15 entities simultaneously (boards + committees)
   - Support up to 10 guests per meeting

3. **Availability**
   - System uptime: 99.9% (about 8 hours downtime per year)
   - Scheduled maintenance during off-peak hours
   - Automatic failover for critical components

---

## User Experience Requirements

### What We Need:

1. **Ease of Use**
   - New users can join their first meeting within 5 minutes
   - Maximum 3 clicks to reach any feature
   - Clear error messages with guidance
   - Consistent design across all pages

2. **Responsive Design**
   - Works on desktop, tablet, and mobile browsers
   - Optimized for screens from 375px to 1920px wide
   - Touch-friendly buttons and controls on mobile

3. **Accessibility**
   - Keyboard navigation for all features
   - Screen reader support
   - High contrast mode option
   - Text size adjustable

4. **Help and Training**
   - Context-sensitive help tooltips
   - Video tutorials for key features
   - User manual (PDF)
   - In-app guided tour for first-time users

---

## Implementation Notes for Multi-Board System

### Critical Success Factors:
1. **Entity Isolation**: Users must ONLY see data for boards/committees they're members of
2. **Chairman Exception**: Main Board Chairman has all-board and all-committee access
3. **Committee Membership Validation**: Committee members must be members of parent board
4. **Guest Access Control**: Guests limited to designated time slots and cannot vote
5. **Performance**: Entity filtering must not slow down queries significantly
6. **User Experience**: Clear board/committee identification in all interfaces
7. **Reporting**: Both consolidated and per-entity reporting required with committee aggregation

### Development Priority:
**Phase 1 (MVP - 6 months)**:
- Main Board + 8 Subsidiaries (9 boards)
- 4 Main Board Committees (Nomination, HR, Sales & Marketing, Audit)
- Guest/Presenter functionality
- Meeting confirmation with digital signature
- Total: 13 entities

**Phase 2 (3 months)**:
- Add factory boards incrementally by region (start with 1-2 regions)
- Add subsidiary committees if needed
- ~20-30 entities total

**Phase 3 (3 months)**:
- Full 78-board deployment
- All committees for subsidiaries/factories
- ~90-100 entities total

### Database Considerations:
**Boards/Committees Table:**
- Unified `Boards` table with `BoardType` enum (Main, Subsidiary, Factory, Committee)
- `ParentBoardId` for committees (references parent board)
- Every major table (Meetings, Documents, Votes, Minutes) must have `BoardId` foreign key
- All queries must include entity membership check
- Indexes on `BoardId` fields critical for performance
- Consider partitioning for factory boards if needed

**Committee-Specific Requirements:**
- Enforce foreign key constraint: Committee members must exist in parent board members
- Cascade delete: Removing user from parent board removes from child committees
- Validation trigger: Prevent adding non-parent-board members to committee

**Guest/Presenter Table:**
- `MeetingGuests` table linking guests to specific meetings
- Fields: GuestId, MeetingId, TimeSlotStart, TimeSlotEnd, PresentationTopic, CanReceiveMinutes, DocumentAccessLevel
- Guests are users but not board members (no BoardMembership records)

---

## Key Features Summary:

✅ **Multi-Board Structure**: 78 boards (Main, Subsidiaries, Factories)
✅ **Committee Support**: Committees linked to parent boards with member validation
✅ **Guest/Presenter System**: Non-board members can present at meetings
✅ **Meeting Confirmation**: Digital signature workflow with iText7
✅ **Board-Level Access Control**: Users only see their boards/committees
✅ **Consolidated Reporting**: Reports across all entities with per-board type compliance
✅ **Video Conferencing**: Jitsi Meet integration (free)
✅ **Chairman All-Access**: Main Board Chairman sees all entities

## Total System Scope:

- **Entities**: ~90-100 (78 boards + 10-20 committees)
- **Users**: ~500 (board members, committee members, guests)
- **Meetings**: ~1000/year estimate
- **Documents**: ~10,000/year estimate
- **Modules**: 12 core modules

---

## Document Approval

| Role | Name | Date |
|------|------|------|
| Board Secretary (Main Board) | | |
| IT Manager | | |
| Project Manager | | |
| Chairman | | |
| Company Secretary | | |

---

**END OF REQUIREMENTS DOCUMENT**
