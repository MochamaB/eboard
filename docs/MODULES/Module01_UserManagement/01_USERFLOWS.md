# Module 1: User Management & Authentication - User Flows

**Version**: 1.0  
**Date**: January 15, 2026

---

## All Flows in This Module

1. Browse Users Index Page
2. User Registration (Admin Creates User)
3. User Login (First-Time)
4. User Login (Regular)
5. Password Reset (Forgot Password)
6. MFA Setup
7. Add User to Board
8. Remove User from Board
9. Change User Role on Board
10. Upload Digital Certificate
11. View User Profile
12. View System Roles
13. Create Custom Role
14. Edit Role Permissions
15. Bulk User Operations

---

## Flow 1: Browse Users Index Page

**Actor**: System Admin / Board Secretary  
**Flow**: Navigate to Users → View List → Filter/Search → Select User

### Steps

1. Navigate to Users (sidebar menu)
2. **Users Index Page displays**:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  USERS                                    [+ New User]      │
   ├─────────────────────────────────────────────────────────────┤
   │  [All Users] [Active] [Inactive] [By Board ▼] [By Role ▼]  │
   ├─────────────────────────────────────────────────────────────┤
   │  Search: [________________________] [🔍]                    │
   ├─────────────────────────────────────────────────────────────┤
   │  ☑ │ Name          │ Email           │ Role    │ Boards │  │
   │  ──┼───────────────┼─────────────────┼─────────┼────────┼──│
   │  ☐ │ John Kamau    │ john@ktda.co.ke │ Member  │ 3      │  │
   │  ☐ │ Mary Wanjiku  │ mary@ktda.co.ke │ Secr.   │ 2      │  │
   │  ☐ │ Peter Ochieng │ peter@ktda.co.ke│ Chairman│ 78     │  │
   │  ☐ │ Jane Muthoni  │ jane@ktda.co.ke │ Member  │ 1      │  │
   └─────────────────────────────────────────────────────────────┘
   │  Showing 1-20 of 350 users              [< 1 2 3 ... 18 >] │
   └─────────────────────────────────────────────────────────────┘
   ```
3. **Tab options**:
   - **All Users**: All users in system
   - **Active**: Currently active accounts
   - **Inactive**: Deactivated accounts
   - **By Board**: Filter by specific board membership
   - **By Role**: Filter by system role
4. **Search**: Search by name, email, or employee ID
5. **Table columns**:
   - Checkbox (for bulk actions)
   - Name (with avatar)
   - Email
   - Primary Role
   - Board Count (click to expand)
   - Status badge (Active/Inactive)
   - Last Login
   - Actions (View, Edit, Deactivate)
6. **Click user row** → Navigate to User Details
7. **Bulk actions** (when items selected):
   - Export Selected
   - Deactivate Selected
   - Send Email to Selected

### Error Flows

- **No users found**: Show "No users match your search"
- **No access**: Redirect to dashboard with error

### Business Rules

- System Admin sees all users
- Board Secretary sees only users on their boards
- Chairman sees all users
- Pagination: 20 users per page
- Default sort: Name ascending

### UI Pattern

- **Page Type**: Index/List Page
- **Layout**: Full page with sidebar
- **Components**:
  - Filter tabs (segmented control)
  - Search bar with instant filter
  - Dropdown and input filters to aid in filtering
  - Data table with row selection
  - Bulk action bar (sticky bottom, appears on selection)
  - Pagination
- **Interactions**:
  - Row click → Navigate to details
  - Checkbox → Enable bulk actions
  - Tab click → Filter data
- **Empty State**: Illustration + "No users found" message
- **Loading**: Skeleton table rows

---

## Flow 2: User Registration (Admin Creates User)

**Flow**: Enter Basic Info → Select Role → Assign to Board(s) → Optional Certificate → Review → Submit → Email Sent

### Steps

1. Click "Add User" button
2. Enter: Name, Email, Phone
   - Validation: Email format, email unique, phone format
3. Select Role from dropdown
   - Options: Admin, Secretary, Chairman, Vice Chairman, Member, Committee Member, Executive, Observer, Guest
4. **IF** Role requires board membership **THEN**
   - Select board(s) from list
   - For each board, select role on that board
   - **IF** selecting committee **THEN** validate parent board membership exists
5. **IF** Role = "Company Secretary" **THEN**
   - Option to upload digital certificate (.pfx/.p12)
   - Can skip and do later
6. Set: MFA Required (Yes/No), Account Status (Active/Inactive)
7. Review summary of entered information
8. Click "Create User"
9. System generates temporary password
10. System sends email with credentials to user
11. Success message displayed
12. Return to User List

### Error Flows

- **Email already exists**: Show error "Email already registered", stay on form
- **Committee without parent board**: Show error "User must be member of [Parent Board]", allow correction
- **Certificate upload fails**: Show error, allow skip or retry
- **Email send fails**: Show warning, display temp password to admin for manual sharing

### Business Rules

- Email must be unique
- Main Board Chairman gets automatic access to all 78 boards
- Committee members must have parent board membership
- Temporary password expires in 24 hours
- MFA required for: Admin, Chairman, Secretary, Company Secretary

### UI Pattern

- **Page Type**: Multi-Step Wizard - vertical
- **Layout**: Full page with step indicator
- **Steps**:
  1. **Basic Information** (always visible)
     - Fields: Name, Email, Phone, Employee ID
  2. **Role & Permissions** (always visible)
     - Fields: System Role dropdown, MFA checkbox
  3. **Board Assignments** (conditional: show if role requires board)
     - Fields: Board tree selector, role per board
  4. **Security** (conditional: show if role = Company Secretary)
     - Fields: Certificate upload
  5. **Review & Confirm** (always visible)
     - Summary of all entered data with Edit links
- **Navigation**: 
  - Previous/Next buttons
  - Step indicator clickable for completed steps
  - Cancel returns to list with confirmation
- **Validation**: Per-step validation before Next
- **Success**: 
  - Modal: "User Created Successfully"
  - Options: [Create Another] [View User] [Back to List]
  - Shows email sent confirmation
  - If email fails: Display temp password for manual sharing
- **Error**: Inline field errors, toast for API errors

---

## Flow 3: User Login (First-Time)

**Flow**: Enter Credentials → Validate → Force Password Change → MFA Setup (if required) → Dashboard

### Steps

1. Enter: Email, Temporary Password
2. Click "Sign In"
3. System detects first login
4. Enter: New Password, Confirm Password
   - Validation: 12+ chars, uppercase, lowercase, number, special char
5. **IF** MFA required **THEN** redirect to MFA Setup (Flow 5)
6. **ELSE** redirect to Dashboard

### Error Flows

- **Invalid credentials**: Show error, stay on login page
- **Temp password expired (>24 hours)**: Redirect to Password Reset (Flow 4)
- **Account inactive**: Show error, notify admin

### UI Pattern

- **Page Type**: Auth Flow (2-step)
- **Layout**: Centered card, no sidebar
- **Step 1 - Login**:
  - Standard login form
  - On success → redirect to Step 2
- **Step 2 - Change Password**:
  - Full page form (not modal)
  - Fields: New Password, Confirm Password
  - Password strength indicator
  - Requirements checklist (12+ chars, uppercase, etc.)
- **Navigation**: No back button (forced flow)
- **Success**: Redirect to MFA Setup (if required) or Dashboard
- **Error**: Inline validation, alert banner for API errors

---

## Flow 4: User Login (Regular)

**Flow**: Enter Credentials → Validate → MFA Code (if enabled) → Dashboard

### Steps

1. Enter: Email, Password
2. Click "Sign In"
3. **IF** MFA enabled **THEN** enter 6-digit code from authenticator
4. Redirect to Dashboard

### Error Flows

- **Invalid credentials (5 attempts)**: Lock account for 15 minutes
- **Invalid MFA code (3 attempts)**: Lock account, send email notification

### UI Pattern

- **Page Type**: Auth Flow (1-2 steps)
- **Layout**: Centered card, no sidebar
- **Step 1 - Login**:
  - Email + Password fields
  - "Forgot Password?" link
  - "Sign In" button
- **Step 2 - MFA** (conditional: if MFA enabled):
  - 6-digit code input (auto-focus, auto-submit on 6 digits)
  - "Use backup code" link
  - Resend code option (if SMS)
- **Loading**: Button spinner during auth
- **Error**: 
  - Invalid credentials: Shake animation + error message
  - Account locked: Full page message with unlock time
- **Success**: Redirect to Dashboard

---

## Flow 5: Password Reset

**Flow**: Request Reset → Email Link → Enter New Password → Confirmation

### Steps

1. Click "Forgot Password?" on login page
2. Enter: Email address
3. System sends reset link (expires in 1 hour)
4. User clicks link in email
5. Enter: New Password, Confirm Password
6. System updates password
7. Redirect to login page

### Error Flows

- **Link expired**: Show error, allow new request
- **Link already used**: Show error, allow new request

### UI Pattern

- **Page Type**: Auth Flow (3 steps)
- **Layout**: Centered card, no sidebar
- **Step 1 - Request Reset**:
  - Email input field
  - "Send Reset Link" button
- **Step 2 - Email Sent** (confirmation):
  - Success illustration
  - "Check your email" message
  - "Resend" link (with cooldown timer)
- **Step 3 - New Password** (from email link):
  - New Password + Confirm Password
  - Password strength indicator
  - Requirements checklist
- **Success**: 
  - "Password Updated" message
  - Auto-redirect to login (3 seconds) or "Go to Login" button
- **Error**: Inline validation, expired link shows "Request New Link" button

---

## Flow 6: MFA Setup

**Flow**: Scan QR Code → Enter Verification Code → Save Backup Codes → Complete

### Steps

1. System generates QR code
2. User scans QR code with authenticator app
3. Enter 6-digit code from app
4. System displays 10 backup codes
5. User saves/downloads backup codes
6. Click "Complete Setup"
7. MFA enabled

### Error Flows

- **Invalid code**: Show error, allow retry

### UI Pattern

- **Page Type**: Setup Wizard (3 steps) - Vertical
- **Layout**: Centered card, no sidebar (part of onboarding)
- **Step 1 - QR Code**:
  - Large QR code display
  - "Can't scan?" link → shows manual key
  - App download links (Google Authenticator, Authy)
- **Step 2 - Verify**:
  - 6-digit code input
  - "Verify" button
- **Step 3 - Backup Codes**:
  - Display 10 backup codes in grid
  - "Download" and "Copy" buttons
  - Checkbox: "I have saved these codes"
  - "Complete Setup" button (disabled until checkbox)
- **Success**: Redirect to Dashboard with success toast
- **Error**: Invalid code shows error, allows retry

---

## Flow 7: Add User to Board

**Flow**: Find User → Select Board → Assign Role → Confirm

### Steps

1. Search user by name or email
2. Click user to view profile
3. Click "Add to Board"
4. Select board from list
5. Select role for that board
6. Set start date (default: today)
7. **IF** committee selected **THEN** validate parent board membership
8. Click "Add"
9. User receives notification

### Error Flows

- **Committee without parent board**: Show error with parent board name
- **User already member**: Show warning, allow role change

### UI Pattern

- **Page Type**: Modal Form
- **Trigger**: "Add to Board" button on User Details page
- **Layout**: Centered modal (medium width)
- **Fields**:
  - Board selector (TreeSelect with hierarchy)
  - Role dropdown (filtered by board type)
  - Start date (DatePicker, default: today)
  - End date (DatePicker, optional)
- **Validation**: 
  - Committee selection checks parent board membership
  - Shows inline error if validation fails
- **Success**: Close modal, refresh board list, show success toast
- **Error**: Inline field errors, modal stays open

---

## Flow 8: Remove User from Board

**Flow**: View User → Select Board → Confirm Removal

### Steps

1. View user's board memberships
2. Click "Remove" next to board
3. **IF** board has child committees where user is member **THEN** show warning
4. Confirm removal
5. User receives notification

### UI Pattern

- **Page Type**: Confirmation Popover/Modal
- **Trigger**: "Remove" button/icon on board membership row
- **Layout**: Popconfirm (simple) or Modal (if cascade warning)
- **Simple Case**:
  - Popconfirm: "Remove from [Board Name]?"
  - Buttons: [Cancel] [Remove]
- **Cascade Case** (user on child committees):
  - Modal with warning message
  - List of affected committees
  - Options: [Cancel] [Remove from Board Only] [Remove from All]
- **Success**: Refresh board list, show success toast
- **Error**: Toast with error message

---

## Flow 9: Change User Role on Board

**Flow**: View User → Edit Board → Select New Role → Save

### Steps

1. View user's board memberships
2. Click "Edit" next to board
3. Select new role from dropdown
4. Click "Update"
5. User receives notification

### Business Rules

- Changing from Main Board Chairman removes all-board access
- Changing to Main Board Chairman grants all-board access

### UI Pattern

- **Page Type**: Inline Edit or Modal
- **Trigger**: "Edit" button on board membership row
- **Layout**: Popover or small modal
- **Fields**:
  - Role dropdown (current role pre-selected)
  - Effective date (optional)
- **Warning**: If changing Chairman role, show impact message
- **Success**: Close popover, refresh row, show success toast
- **Error**: Inline error in popover

---

## Flow 10: Upload Digital Certificate

**Flow**: Select File → Enter Password → Validate → Save

### Steps

1. Navigate to Security Settings
2. Click "Upload Certificate"
3. Select certificate file (.pfx or .p12)
4. Enter certificate password
5. System validates certificate
6. Certificate stored encrypted
7. Success message

### Error Flows

- **Invalid file format**: Show error, allow retry
- **Wrong password**: Show error, allow retry
- **Expired certificate**: Show error, reject upload

### UI Pattern

- **Page Type**: Modal Form
- **Trigger**: "Upload Certificate" button in Security tab
- **Layout**: Centered modal (small width)
- **Fields**:
  - File upload (drag & drop area)
  - Password input (for .pfx/.p12)
- **States**:
  - Empty: Drag & drop zone
  - File selected: Show filename, size, remove button
  - Validating: Spinner with "Validating certificate..."
  - Success: Green checkmark, certificate details
- **Success**: Close modal, show certificate info in Security tab
- **Error**: Inline error below upload area, allow retry

---

## Flow 11: View User Profile

**Flow**: Navigate to Profile → View Details/Boards/Activity

### Steps

1. Click user name/profile icon
2. View tabs:
   - **Details**: Name, email, phone, role
   - **Board Memberships**: Hierarchical list of all boards and committees
   - **Activity Log**: Recent actions
   - **Security**: MFA status, last login, certificate details
3. Edit information as allowed by permissions

### UI Pattern

- **Page Type**: Detail Page with Tabs
- **Layout**: Full page with sidebar
- **Header**: 
  - Avatar (large), Name, Email, Status badge
  - Action buttons: [Edit] [Deactivate] (based on permissions)
- **Tabs**:
  1. **Details**: Read-only info cards (Personal, Contact, Employment)
  2. **Board Memberships**: Table with boards, roles, dates, actions
  3. **Activity Log**: Timeline of recent actions (filterable)
  4. **Security**: MFA status, last login, sessions, certificate
- **Edit Mode**: 
  - Click "Edit" → Navigate to Edit page OR inline edit
  - Each tab can have its own edit capability
- **Loading**: Skeleton for each tab content

---

## Flow 12: View System Roles

**Actor**: System Admin  
**Flow**: Admin → Roles → View List → Click Role for Details

### Steps

1. Navigate to Admin → Roles & Permissions
2. **Roles list displays**:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  ROLES & PERMISSIONS                    [+ Custom Role]     │
   ├─────────────────────────────────────────────────────────────┤
   │  SYSTEM ROLES (Cannot be deleted)                           │
   │  ┌─────────────────────────────────────────────────────────┐│
   │  │ Role              │ Users │ Scope       │ Actions      ││
   │  ├─────────────────────────────────────────────────────────┤│
   │  │ System Admin      │   3   │ System-wide │ [View]       ││
   │  │ Chairman          │   1   │ All Boards  │ [View]       ││
   │  │ Board Secretary   │  78   │ Per-Board   │ [View]       ││
   │  │ Board Member      │ 250   │ Per-Board   │ [View]       ││
   │  │ Committee Member  │  80   │ Per-Board   │ [View]       ││
   │  │ Observer          │  20   │ Per-Board   │ [View]       ││
   │  │ Guest             │  45   │ Per-Meeting │ [View]       ││
   │  └─────────────────────────────────────────────────────────┘│
   │                                                             │
   │  CUSTOM ROLES                                               │
   │  ┌─────────────────────────────────────────────────────────┐│
   │  │ Role              │ Users │ Scope       │ Actions      ││
   │  ├─────────────────────────────────────────────────────────┤│
   │  │ Report Viewer     │  15   │ Per-Board   │ [Edit][Del]  ││
   │  │ Document Manager  │   8   │ Per-Board   │ [Edit][Del]  ││
   │  └─────────────────────────────────────────────────────────┘│
   └─────────────────────────────────────────────────────────────┘
   ```
3. Click role to view permissions
4. **Role Details modal**:
   ```
   BOARD SECRETARY - Permissions
   
   MEETINGS
   ✓ Create meetings
   ✓ Edit meetings
   ✓ Cancel meetings
   ✓ View all meetings
   ✗ Delete meetings
   
   DOCUMENTS
   ✓ Upload documents
   ✓ View documents
   ✓ Download documents
   ✗ Delete documents
   
   VOTING
   ✓ Create votes
   ✓ Cast votes
   ✓ View results
   ✓ Close votes
   
   MINUTES
   ✓ Create minutes
   ✓ Edit minutes
   ✗ Approve minutes (Chairman only)
   ✓ Publish minutes
   
   USERS
   ✓ View board members
   ✗ Create users
   ✗ Edit users
   ✗ Delete users
   ```
5. Close modal to return to list

### Error Flows

- **No access**: Show "You don't have permission to view roles"

### Business Rules

- System roles cannot be edited or deleted
- Custom roles can be created, edited, deleted
- Permissions are grouped by module
- User count shows how many users have this role

### UI Pattern

- **Page Type**: Index Page with Modal Details
- **Layout**: Full page with sidebar
- **Sections**:
  - System Roles table (read-only, View action only)
  - Custom Roles table (Edit, Delete actions)
- **Role Details**:
  - Trigger: Click "View" or role name
  - Type: Modal (read-only for system roles)
  - Content: Permissions grouped by module with checkmarks
- **Actions**:
  - "+ Custom Role" button → Navigate to Create page
  - "Edit" → Navigate to Edit page
  - "Delete" → Popconfirm with user count warning
- **Loading**: Skeleton tables

---

## Flow 13: Create Custom Role

**Actor**: System Admin  
**Flow**: Roles → Create → Name Role → Set Permissions → Save

### Steps

1. Navigate to Admin → Roles & Permissions
2. Click "+ Custom Role"
3. **Enter role details**:
   - Role Name (required, unique)
   - Description (optional)
   - Scope: System-wide / Per-Board
4. **Configure permissions by module**:
   ```
   CREATE CUSTOM ROLE
   
   Role Name: [Report Viewer          ]
   Description: [Can view reports only]
   Scope: [Per-Board ▼]
   
   PERMISSIONS
   
   ┌─ MEETINGS ─────────────────────────────┐
   │ ☐ Create meetings                      │
   │ ☐ Edit meetings                        │
   │ ☐ Cancel meetings                      │
   │ ☑ View meetings                        │
   │ ☐ Delete meetings                      │
   └────────────────────────────────────────┘
   
   ┌─ DOCUMENTS ────────────────────────────┐
   │ ☐ Upload documents                     │
   │ ☑ View documents                       │
   │ ☑ Download documents                   │
   │ ☐ Delete documents                     │
   └────────────────────────────────────────┘
   
   ┌─ REPORTS ──────────────────────────────┐
   │ ☑ View meeting reports                 │
   │ ☑ View attendance reports              │
   │ ☑ View compliance reports              │
   │ ☑ Export reports                       │
   └────────────────────────────────────────┘
   
   [Cancel]                          [Create Role]
   ```
5. Click "Create Role"
6. Success: "Role created successfully"
7. Role appears in Custom Roles list

### Error Flows

- **Role name exists**: Show "Role name already exists"
- **No permissions selected**: Show "Select at least one permission"

### Business Rules

- Role names must be unique
- At least one permission required
- Custom roles can be assigned to users
- Audit log records role creation

### UI Pattern

- **Page Type**: Full Page Form
- **Layout**: Full page with sidebar
- **Sections**:
  1. **Role Information** (Card)
     - Role Name input
     - Description textarea
     - Scope dropdown
  2. **Permissions** (Card with collapsible sections)
     - Grouped by module (Meetings, Documents, Voting, etc.)
     - Each module is collapsible accordion
     - Checkboxes for each permission
     - "Select All" / "Clear All" per module
- **Navigation**:
  - Back link to Roles list
  - [Cancel] [Create Role] buttons at bottom
- **Validation**: 
  - Name required and unique (async check)
  - At least one permission required
- **Success**: Redirect to Roles list with success toast
- **Error**: Inline field errors, scroll to first error

---

## Flow 14: Edit Role Permissions

**Actor**: System Admin  
**Flow**: Roles → Select Custom Role → Edit → Modify Permissions → Save

### Steps

1. Navigate to Admin → Roles & Permissions
2. Find custom role in list
3. Click "Edit" action
4. **Edit role form**:
   - Modify name (if needed)
   - Modify description
   - Toggle permissions on/off
5. **Preview impact**:
   - System shows: "This change affects 15 users"
   - List affected users (optional expand)
6. Click "Save Changes"
7. Confirm: "Update permissions for 15 users?"
8. Click "Confirm"
9. Success: "Role updated successfully"
10. Changes take effect immediately for all users with this role

### Error Flows

- **Cannot edit system role**: Edit button disabled for system roles
- **Role in use, removing critical permission**: Show warning

### Business Rules

- System roles cannot be edited
- Changes apply immediately to all users with role
- Audit log records permission changes
- Cannot remove all permissions (at least one required)

### UI Pattern

- **Page Type**: Full Page Form (same as Create)
- **Layout**: Full page with sidebar
- **Pre-populated**: All fields filled with current values
- **Impact Preview**:
  - Alert banner: "This role is assigned to X users"
  - Expandable list of affected users
- **Confirmation**:
  - On Save → Confirmation modal
  - "Update permissions for X users?"
  - [Cancel] [Confirm] buttons
- **Success**: Redirect to Roles list with success toast
- **Error**: Inline validation, modal for API errors

---

## Flow 15: Bulk User Operations

**Actor**: System Admin  
**Flow**: Users Index → Select Multiple → Choose Action → Execute

### Steps

1. Navigate to Users Index Page
2. Select multiple users using checkboxes
3. **Bulk action bar appears**:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  ☑ 12 users selected    [Export] [Email] [Deactivate] [×]  │
   └─────────────────────────────────────────────────────────────┘
   ```
4. **Export Selected**:
   - Click "Export"
   - Select format: CSV / Excel
   - Download file with user data
5. **Email Selected**:
   - Click "Email"
   - Compose email modal opens
   - Enter subject and message
   - Click "Send"
   - Email sent to all selected users
6. **Deactivate Selected**:
   - Click "Deactivate"
   - Confirm: "Deactivate 12 users?"
   - Enter reason (required)
   - Click "Confirm"
   - All selected users deactivated
   - Users receive notification email
7. **Select All**:
   - Click header checkbox
   - All visible users selected
   - Option: "Select all 350 users" link

### Error Flows

- **Cannot deactivate self**: Show "You cannot deactivate your own account"
- **Cannot deactivate Chairman**: Show "Chairman account requires special approval"
- **Email send failed**: Show "Failed to send to 2 users" with details

### Business Rules

- Cannot bulk deactivate own account
- Cannot bulk deactivate Chairman
- Export respects data privacy rules
- All bulk actions logged in audit trail
- Maximum 100 users per bulk operation

### UI Pattern

- **Page Type**: Contextual Actions (part of Index page)
- **Trigger**: Select one or more rows in Users table
- **Layout**: Sticky bottom bar (Affix)
- **Bar Content**:
  - Selection count: "☑ 12 users selected"
  - Action buttons: [Export] [Email] [Deactivate]
  - Clear selection: [×] button
- **Export Action**:
  - Dropdown: CSV / Excel
  - Immediate download (no modal)
- **Email Action**:
  - Modal: Compose email form
  - Fields: Subject, Message (rich text)
  - Recipients shown as tags
  - [Cancel] [Send] buttons
- **Deactivate Action**:
  - Modal: Confirmation with reason
  - Warning if includes protected users
  - Reason textarea (required)
  - [Cancel] [Deactivate] buttons
- **Select All**:
  - Header checkbox selects visible page
  - Link appears: "Select all 350 users"
- **Success**: Toast notification, refresh table
- **Error**: Toast with details, partial success handling

---

## Summary: Key Business Rules

- Email must be unique across all users
- Main Board Chairman automatically accesses all 78 boards
- Committee members must have parent board membership
- Removing from parent board triggers cascade to child committees
- Temporary passwords expire in 24 hours
- Account locks after 5 failed login attempts (15 minutes)
- MFA required for: Admin, Chairman, Secretary, Company Secretary
- Password reset links expire in 1 hour
- Digital certificates required for Company Secretary only (initially)

---

## Summary: Pages Required for Module 1

| Page | Route | Purpose |
|------|-------|---------|  
| Users Index | `/users` | Browse all users |
| User Create | `/users/create` | Create new user |
| User Details | `/users/:id` | View user profile |
| User Edit | `/users/:id/edit` | Edit user details |
| Roles List | `/admin/roles` | View all roles |
| Role Create | `/admin/roles/create` | Create custom role |
| Role Edit | `/admin/roles/:id/edit` | Edit role permissions |
| Login | `/login` | User authentication |
| Password Reset | `/reset-password` | Reset password flow |
| MFA Setup | `/mfa-setup` | Configure MFA |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|  
| User Table | `Table` with selection | List users |
| User Form | `Form` | Create/edit user |
| Role Card | `Card` | Display role info |
| Permission Grid | `Checkbox.Group` | Toggle permissions |
| Bulk Action Bar | `Affix` + `Space` | Bulk operations |
| Search Input | `Input.Search` | Search users |
| Filter Tabs | `Tabs` | Filter by status |
| Avatar | `Avatar` | User profile image |

---

**END OF MODULE 1 USER FLOWS**
