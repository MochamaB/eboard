# Module 1: User Management - Page Specifications

**Module**: User Management & Authentication  
**Version**: 2.0  
**Last Updated**: January 2026

---

## Table of Contents

1. [Users Index Page](#1-users-index-page)
2. [Create User Wizard](#2-create-user-wizard)
3. [User Details Page](#3-user-details-page)
4. [Edit User Page](#4-edit-user-page)
5. [Roles & Permissions Page](#5-roles--permissions-page)
6. [Create Role Page](#6-create-role-page)
7. [Edit Role Page](#7-edit-role-page)
8. [Login Page](#8-login-page)
9. [First-Time Login / Change Password](#9-first-time-login--change-password)
10. [MFA Verification Page](#10-mfa-verification-page)
11. [Password Reset Flow](#11-password-reset-flow)
12. [MFA Setup Wizard](#12-mfa-setup-wizard)

---

## 1. Users Index Page

**Route**: `/users`  
**Access**: System Admin, Board Secretary  
**Purpose**: Browse, search, filter, and manage all users

### 1.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  USERS                                        [+ New User]    │
│            │  ───────────────────────────────────────────────────────────   │
│  Dashboard │                                                                │
│  Meetings  │  [All Users] [Active] [Inactive] [By Board ▼] [By Role ▼]     │
│  Documents │  ───────────────────────────────────────────────────────────   │
│  Notific.  │                                                                │
│  Reports   │  Search: [________________________] [🔍]   [Export ▼]         │
│  ─────     │  ───────────────────────────────────────────────────────────   │
│  Users ●   │                                                                │
│  Boards    │  ┌─────────────────────────────────────────────────────────┐  │
│  Settings  │  │ ☑ │ 👤 Name       │ Email          │ Role   │ Boards │ │  │
│  Admin     │  ├───┼───────────────┼────────────────┼────────┼────────┼─┤  │
│            │  │ ☐ │ John Kamau    │ john@ktda.co.ke│ Member │ 3      │…│  │
│            │  │ ☐ │ Mary Wanjiku  │ mary@ktda.co.ke│ Secr.  │ 2      │…│  │
│            │  │ ☐ │ Peter Ochieng │ peter@ktda... │Chairman│ 78     │…│  │
│            │  │ ☐ │ Jane Muthoni  │ jane@ktda.co.ke│ Member │ 1      │…│  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  Showing 1-20 of 350 users                [< 1 2 3 ... 18 >]  │
│            │                                                                │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │ ☑ 3 selected    [Export] [Send Email] [Deactivate] [×] │  │
│            │  └─────────────────────────────────────────────────────────┘  │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 1.2 Components

| Component | Ant Design | Props/Config |
|-----------|------------|--------------|
| Page Header | `PageHeader` | title="Users", extra=[NewUserButton] |
| Filter Tabs | `Tabs` | items=[All, Active, Inactive, By Board, By Role] |
| Search Bar | `Input.Search` | placeholder="Search by name, email..." |
| Export Dropdown | `Dropdown` | items=[CSV, Excel] |
| Users Table | `Table` | rowSelection, pagination, columns |
| Bulk Action Bar | `Affix` | bottom=0, visible when selected |
| User Avatar | `Avatar` | src={user.avatar}, fallback={initials} |
| Status Tag | `Tag` | color={active ? 'green' : 'default'} |
| Actions | `Dropdown` | items=[View, Edit, Deactivate] |

### 1.3 Table Columns

```typescript
const columns: ColumnsType<User> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (name, record) => (
      <Space>
        <Avatar src={record.avatar}>{getInitials(name)}</Avatar>
        <span>{name}</span>
      </Space>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: true,
  },
  {
    title: 'Role',
    dataIndex: 'primaryRole',
    key: 'role',
    filters: roleFilters,
    render: (role) => <Tag>{role}</Tag>,
  },
  {
    title: 'Boards',
    dataIndex: 'boardCount',
    key: 'boards',
    sorter: true,
    render: (count, record) => (
      <Tooltip title={record.boards.join(', ')}>
        <Badge count={count} showZero />
      </Tooltip>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : 'default'}>
        {status}
      </Tag>
    ),
  },
  {
    title: 'Last Login',
    dataIndex: 'lastLogin',
    key: 'lastLogin',
    sorter: true,
    render: (date) => dayjs(date).fromNow(),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Dropdown menu={{ items: actionItems(record) }}>
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    ),
  },
];
```

### 1.4 State Management

```typescript
interface UsersIndexState {
  // Data
  users: User[];
  totalCount: number;
  
  // Filters
  activeTab: 'all' | 'active' | 'inactive' | 'by-board' | 'by-role';
  searchQuery: string;
  selectedBoard: string | null;
  selectedRole: string | null;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Selection
  selectedRowKeys: string[];
  
  // Loading
  isLoading: boolean;
  
  // Sorting
  sortField: string;
  sortOrder: 'ascend' | 'descend';
}
```

### 1.5 API Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| List users | `GET /api/users` | GET |
| Search users | `GET /api/users?search={query}` | GET |
| Filter by board | `GET /api/users?boardId={id}` | GET |
| Filter by role | `GET /api/users?role={role}` | GET |
| Export users | `GET /api/users/export?format={csv|xlsx}` | GET |
| Bulk deactivate | `POST /api/users/bulk-deactivate` | POST |
| Bulk email | `POST /api/users/bulk-email` | POST |

### 1.6 Actions

| Action | Trigger | Result |
|--------|---------|--------|
| New User | Click "+ New User" | Navigate to `/users/create` |
| View User | Click row or "View" | Navigate to `/users/:id` |
| Edit User | Click "Edit" | Navigate to `/users/:id/edit` |
| Deactivate | Click "Deactivate" | Confirm modal → API call |
| Export | Click "Export" | Download file |
| Bulk Select | Check rows | Show bulk action bar |
| Search | Type + Enter | Filter table |
| Tab Change | Click tab | Update filter |

---

## 2. Create User Wizard

**Route**: `/users/create`  
**Access**: System Admin  
**Purpose**: Create new user account using multi-step wizard
**UI Pattern**: Multi-Step Wizard (5 steps)

### 2.1 Wizard Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Users                                              │
│            │                                                                │
│            │  CREATE NEW USER                                               │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │  ● Basic Info  ○ Role  ○ Boards  ○ Security  ○ Review  │  │
│            │  │  ════════════════════════════════════════════════════   │  │
│            │  │  Step 1 of 5                                            │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ BASIC INFORMATION ─────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Full Name *                                            │  │
│            │  │  [_________________________________________________]   │  │
│            │  │                                                         │  │
│            │  │  Email Address *                                        │  │
│            │  │  [_________________________________________________]   │  │
│            │  │  ✓ Email is available                                   │  │
│            │  │                                                         │  │
│            │  │  Phone Number                                           │  │
│            │  │  [_________________________________________________]   │  │
│            │  │                                                         │  │
│            │  │  Employee ID                                            │  │
│            │  │  [_________________________________________________]   │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │                                    [Cancel]  [Next →]         │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 2.2 Step 1: Basic Information (Always Visible)

**Fields:**
- Full Name (required, min 2 chars)
- Email Address (required, valid email, unique - async validation)
- Phone Number (optional, valid format)
- Employee ID (optional)

**Validation:** Per-field validation, email uniqueness checked on blur

### 2.3 Step 2: Role & Permissions (Always Visible)

```
┌─ ROLE & PERMISSIONS ────────────────────────────────────────────┐
│                                                                 │
│  System Role *                                                  │
│  [Board Member                                             ▼]  │
│                                                                 │
│  Role Description:                                              │
│  Can attend meetings, view documents, and cast votes on         │
│  boards they are assigned to.                                   │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Security Settings                                              │
│                                                                 │
│  ☑ Require Multi-Factor Authentication                         │
│    (Auto-enabled for Admin, Chairman, Secretary roles)         │
│                                                                 │
│  Account Status                                                 │
│  ○ Active (can login immediately)                               │
│  ○ Inactive (account created but disabled)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                              [← Previous]  [Next →]
```

### 2.4 Step 3: Board Assignments (Conditional)

**Condition:** Show only if selected role requires board membership

```
┌─ BOARD ASSIGNMENTS ─────────────────────────────────────────────┐
│                                                                 │
│  Assign user to boards and committees:                          │
│                                                                 │
│  [+ Add Board Assignment]                                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Board/Committee       │ Role on Board  │ Start Date │   │   │
│  ├───────────────────────┼────────────────┼────────────┼───┤   │
│  │ KTDA Main Board       │ Member         │ Today      │ ✕ │   │
│  │ ├─ Audit Committee    │ Member         │ Today      │ ✕ │   │
│  │ KETEPA Limited        │ Secretary      │ Today      │ ✕ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ Committee members must be members of the parent board.     │
│                                                                 │
│  ℹ️ Chairman role on Main Board grants access to all 78 boards │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                              [← Previous]  [Next →]
```

### 2.5 Step 4: Security (Conditional)

**Condition:** Show only if role = Company Secretary

```
┌─ SECURITY SETTINGS ─────────────────────────────────────────────┐
│                                                                 │
│  Digital Certificate (Optional)                                 │
│                                                                 │
│  Upload a digital certificate for document signing.             │
│  This can also be done later from the user's profile.           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │     📄 Drag and drop .pfx or .p12 file here            │   │
│  │                                                         │   │
│  │     or [Browse Files]                                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Certificate Password                                           │
│  [_________________________________________________]           │
│                                                                 │
│  [Skip for now]                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                              [← Previous]  [Next →]
```

### 2.6 Step 5: Review & Confirm (Always Visible)

```
┌─ REVIEW & CONFIRM ──────────────────────────────────────────────┐
│                                                                 │
│  Please review the information before creating the user.        │
│                                                                 │
│  ┌─ BASIC INFORMATION ──────────────────────────────── [Edit] ─┐│
│  │  Name:        John Kamau                                    ││
│  │  Email:       john.kamau@ktda.co.ke                         ││
│  │  Phone:       +254 712 345 678                              ││
│  │  Employee ID: EMP-2024-001                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─ ROLE & PERMISSIONS ─────────────────────────────── [Edit] ─┐│
│  │  System Role: Board Member                                  ││
│  │  MFA Required: Yes                                          ││
│  │  Status:      Active                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─ BOARD ASSIGNMENTS ──────────────────────────────── [Edit] ─┐│
│  │  • KTDA Main Board (Member)                                 ││
│  │    └─ Audit Committee (Member)                              ││
│  │  • KETEPA Limited (Secretary)                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─ SECURITY ───────────────────────────────────────── [Edit] ─┐│
│  │  Digital Certificate: Not uploaded                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  ⚠️ A temporary password will be sent to:                      │
│     john.kamau@ktda.co.ke                                       │
│                                                                 │
│  The password expires in 24 hours.                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                              [← Previous]  [Create User]
```

### 2.7 Success Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ USER CREATED SUCCESSFULLY                              [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         ✓                                       │
│                                                                 │
│  John Kamau has been created successfully.                      │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  ✉️ Login credentials sent to:                                  │
│     john.kamau@ktda.co.ke                                       │
│                                                                 │
│  The temporary password expires in 24 hours.                    │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  [Create Another User]  [View User Profile]  [Back to List]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.8 Email Failed Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ USER CREATED - EMAIL FAILED                           [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  John Kamau has been created, but the email could not be sent.  │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Temporary Password (share manually):                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Xk9#mP2$vL5n                              [📋 Copy]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ This password expires in 24 hours.                         │
│  ⚠️ This is the only time you can view this password.          │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│                    [View User Profile]  [Back to List]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.9 Form Fields

```typescript
interface CreateUserWizardForm {
  // Step 1: Basic Info
  fullName: string;        // Required, min 2 chars
  email: string;           // Required, valid email, unique
  phone?: string;          // Optional, valid phone format
  employeeId?: string;     // Optional
  
  // Step 2: Role & Permissions
  systemRole: SystemRole;  // Required
  requireMfa: boolean;     // Default based on role
  status: 'active' | 'inactive';
  
  // Step 3: Board Assignments (conditional)
  boardAssignments: {
    boardId: string;
    roleOnBoard: BoardRole;
  }[];
  
  // Step 4: Security (conditional - Company Secretary only)
  certificate?: File;      // Optional .pfx/.p12
  certificatePassword?: string;
}

// Wizard step configuration
const wizardSteps = [
  { key: 'basic', title: 'Basic Info', required: true },
  { key: 'role', title: 'Role', required: true },
  { key: 'boards', title: 'Boards', required: (form) => roleRequiresBoard(form.systemRole) },
  { key: 'security', title: 'Security', required: (form) => form.systemRole === 'company_secretary' },
  { key: 'review', title: 'Review', required: true },
];
```

### 2.10 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Steps Indicator | `Steps` | Show wizard progress |
| Step Content | `Card` | Current step content |
| Back Link | `Button` type="link" | Navigate back to list |
| Form | `Form` | Form container |
| Name Input | `Input` | Full name |
| Email Input | `Input` | Email with validation |
| Phone Input | `Input` | Phone with mask |
| Role Select | `Select` | System role dropdown |
| MFA Checkbox | `Checkbox` | Require MFA toggle |
| Board Selector | `TreeSelect` | Hierarchical board selection |
| Board List | `List` | Show assigned boards |
| Certificate Upload | `Upload.Dragger` | Drag & drop file upload |
| Review Card | `Card` | Summary section with Edit link |
| Success Modal | `Modal` | Creation success |
| Navigation Buttons | `Space` + `Button` | Previous/Next/Cancel |

### 2.11 Validation Rules

```typescript
const validationRules = {
  fullName: [
    { required: true, message: 'Name is required' },
    { min: 2, message: 'Name must be at least 2 characters' },
  ],
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' },
    { validator: checkEmailUnique, message: 'Email already exists' },
  ],
  phone: [
    { pattern: /^\+?[0-9]{10,15}$/, message: 'Invalid phone format' },
  ],
  systemRole: [
    { required: true, message: 'Role is required' },
  ],
  boardAssignments: [
    { validator: validateCommitteeParent, message: 'Committee requires parent board membership' },
  ],
};
```

### 2.12 Board Assignment Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  ADD BOARD ASSIGNMENT                                     [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Select Board/Committee *                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔍 Search boards...                                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ▼ KTDA Main Board                                       │   │
│  │   ├─ Audit Committee                                    │   │
│  │   ├─ Finance Committee                                  │   │
│  │   └─ HR Committee                                       │   │
│  │ ▼ Subsidiaries                                          │   │
│  │   ├─ KETEPA Limited                                     │   │
│  │   ├─ Chai Trading Company                               │   │
│  │   └─ ...                                                │   │
│  │ ▼ Factories (Zone 1)                                    │   │
│  │   ├─ Chebut Factory                                     │   │
│  │   └─ ...                                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Role on this Board *                                           │
│  [Board Member                                            ▼]   │
│                                                                 │
│  Start Date                                                     │
│  [📅 Today                                                 ]   │
│                                                                 │
│                                    [Cancel]  [Add Assignment]   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.13 API Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Check email | `GET /api/users/check-email?email={email}` | GET |
| Get boards | `GET /api/boards/tree` | GET |
| Create user | `POST /api/users` | POST |
| Upload cert | `POST /api/users/:id/certificate` | POST |

---

## 3. User Details Page

**Route**: `/users/:id`  
**Access**: System Admin, Board Secretary (own boards), Self  
**Purpose**: View user profile and manage memberships

### 3.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Users                                              │
│            │                                                                │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │  [Avatar]                                               │  │
│            │  │                                                         │  │
│            │  │  John Kamau                              [Edit Profile] │  │
│            │  │  john.kamau@ktda.co.ke                                  │  │
│            │  │  +254 712 345 678                                       │  │
│            │  │                                                         │  │
│            │  │  Role: Board Member          Status: ● Active           │  │
│            │  │  Last Login: Today at 9:30 AM                           │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  [Details] [Board Memberships] [Activity Log] [Security]      │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─ BOARD MEMBERSHIPS ─────────────────────────────────────┐  │
│            │  │                                        [+ Add to Board] │  │
│            │  │                                                         │  │
│            │  │  KTDA Main Board                                        │  │
│            │  │  Role: Member • Since: Jan 2024           [Edit][Remove]│  │
│            │  │  ├─ Audit Committee                                     │  │
│            │  │  │  Role: Member • Since: Mar 2024        [Edit][Remove]│  │
│            │  │                                                         │  │
│            │  │  KETEPA Limited                                         │  │
│            │  │  Role: Secretary • Since: Jun 2024        [Edit][Remove]│  │
│            │  │                                                         │  │
│            │  │  Chebut Factory                                         │  │
│            │  │  Role: Observer • Since: Sep 2024         [Edit][Remove]│  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 3.2 Tab Content

#### Details Tab
- Personal information (name, email, phone, employee ID)
- System role
- Account status
- Created date
- Last modified

#### Board Memberships Tab
- Hierarchical list of all board/committee memberships
- Role on each board
- Membership start date
- Actions: Edit role, Remove from board
- Add to new board button

#### Activity Log Tab
- Recent actions by user
- Login history
- Document views
- Meeting attendance
- Filterable by date range and action type

#### Security Tab
- MFA status (enabled/disabled)
- MFA setup/reset button
- Digital certificate status
- Certificate upload/replace
- Password reset button
- Active sessions

### 3.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Profile Card | `Card` | User header info |
| Avatar | `Avatar` size=80 | User photo |
| Status Badge | `Badge` | Active/Inactive |
| Tabs | `Tabs` | Content sections |
| Descriptions | `Descriptions` | Key-value details |
| Board Tree | `Tree` | Hierarchical memberships |
| Timeline | `Timeline` | Activity log |
| Table | `Table` | Sessions list |

### 3.4 State

```typescript
interface UserDetailsState {
  user: User | null;
  activeTab: 'details' | 'boards' | 'activity' | 'security';
  isLoading: boolean;
  
  // Activity tab
  activities: Activity[];
  activityFilter: {
    dateRange: [Date, Date];
    actionType: string | null;
  };
  
  // Security tab
  sessions: Session[];
}
```

### 3.5 Add to Board Modal

**UI Pattern**: Modal Form (from Flow 7)

```
┌─────────────────────────────────────────────────────────────────┐
│  ADD TO BOARD                                              [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Select Board/Committee *                                       │
│  [🔍 Search boards...                                      ▼]  │
│                                                                 │
│  Role on Board *                                                │
│  [Member                                                   ▼]  │
│                                                                 │
│  Start Date                                                     │
│  [📅 Today                                                  ]  │
│                                                                 │
│  End Date (Optional)                                            │
│  [📅 Select date                                            ]  │
│                                                                 │
│  ⚠️ Committee members must be members of the parent board.     │
│                                                                 │
│                                    [Cancel]  [Add to Board]     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Remove from Board Confirmation

**UI Pattern**: Popconfirm (simple) or Modal (cascade warning)

**Simple Case:**
```
┌─────────────────────────────────────────┐
│  Remove from KTDA Main Board?           │
│                                         │
│  [Cancel]  [Remove]                     │
└─────────────────────────────────────────┘
```

**Cascade Case (user on child committees):**
```
┌─────────────────────────────────────────────────────────────────┐
│  REMOVE FROM BOARD                                         [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚠️ John Kamau is also a member of these committees:           │
│                                                                 │
│  • Audit Committee                                              │
│  • HR Committee                                                 │
│                                                                 │
│  Removing from KTDA Main Board will also remove from these      │
│  committees.                                                    │
│                                                                 │
│                    [Cancel]  [Remove from All]                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.7 Edit Role Popover

**UI Pattern**: Inline Edit/Popover (from Flow 9)

```
┌─────────────────────────────────────────┐
│  EDIT ROLE                              │
├─────────────────────────────────────────┤
│                                         │
│  Role on Board                          │
│  [Secretary                        ▼]  │
│                                         │
│  Effective Date                         │
│  [📅 Today                          ]  │
│                                         │
│  [Cancel]  [Update]                     │
└─────────────────────────────────────────┘
```

### 3.8 Upload Certificate Modal

**UI Pattern**: Modal Form with states (from Flow 10)

```
┌─────────────────────────────────────────────────────────────────┐
│  UPLOAD DIGITAL CERTIFICATE                                [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │     📄 Drag and drop .pfx or .p12 file here            │   │
│  │                                                         │   │
│  │     or [Browse Files]                                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Certificate Password *                                         │
│  [_________________________________________________]           │
│                                                                 │
│                                    [Cancel]  [Upload]           │
└─────────────────────────────────────────────────────────────────┘
```

**Validating State:**
```
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📄 certificate.pfx                           [Remove]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  🔄 Validating certificate...                                  │
```

**Success State:**
```
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Certificate validated successfully                   │   │
│  │                                                         │   │
│  │  Subject: John Kamau                                    │   │
│  │  Issuer: KTDA Certificate Authority                     │   │
│  │  Expires: Dec 31, 2026                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
```

### 3.9 API Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Get user | `GET /api/users/:id` | GET |
| Get memberships | `GET /api/users/:id/boards` | GET |
| Add to board | `POST /api/users/:id/boards` | POST |
| Update membership | `PUT /api/users/:id/boards/:boardId` | PUT |
| Remove from board | `DELETE /api/users/:id/boards/:boardId` | DELETE |
| Get activity | `GET /api/users/:id/activity` | GET |
| Get sessions | `GET /api/users/:id/sessions` | GET |
| Reset password | `POST /api/users/:id/reset-password` | POST |
| Reset MFA | `POST /api/users/:id/reset-mfa` | POST |
| Upload certificate | `POST /api/users/:id/certificate` | POST |
| Delete certificate | `DELETE /api/users/:id/certificate` | DELETE |

---

## 4. Edit User Page

**Route**: `/users/:id/edit`  
**Access**: System Admin  
**Purpose**: Edit user details and settings

### 4.1 Page Layout

Similar to Create User Page but:
- Pre-populated with existing data
- "Save Changes" instead of "Create User"
- Additional "Deactivate Account" button
- Cannot change email (display only)

### 4.2 Form Fields

```typescript
interface EditUserForm {
  fullName: string;
  // email: readonly
  phone?: string;
  employeeId?: string;
  systemRole: SystemRole;
  requireMfa: boolean;
  status: 'active' | 'inactive';
  deactivationReason?: string;  // Required if status = inactive
}
```

### 4.3 Deactivation Flow

1. Click "Deactivate Account"
2. Modal appears:
   ```
   ┌─────────────────────────────────────────────────────────────────┐
   │  DEACTIVATE USER                                          [×]   │
   ├─────────────────────────────────────────────────────────────────┤
   │                                                                 │
   │  ⚠️ Are you sure you want to deactivate John Kamau?            │
   │                                                                 │
   │  This will:                                                     │
   │  • Prevent the user from logging in                             │
   │  • Remove them from all active meetings                         │
   │  • Preserve their historical data                               │
   │                                                                 │
   │  Reason for deactivation *                                      │
   │  [_______________________________________________________]     │
   │                                                                 │
   │                              [Cancel]  [Deactivate Account]     │
   └─────────────────────────────────────────────────────────────────┘
   ```
3. Enter reason (required)
4. Confirm deactivation
5. User status updated, notification sent

---

## 5. Roles & Permissions Page

**Route**: `/users/roles`  
**Access**: System Admin  
**Purpose**: View and manage system roles

### 5.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ROLES & PERMISSIONS                      [+ Custom Role]     │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  SYSTEM ROLES (Cannot be modified)                             │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │ Role              │ Users │ Scope       │ Actions      │  │
│            │  ├───────────────────┼───────┼─────────────┼──────────────┤  │
│            │  │ System Admin      │   3   │ System-wide │ [View]       │  │
│            │  │ Chairman          │   1   │ All Boards  │ [View]       │  │
│            │  │ Board Secretary   │  78   │ Per-Board   │ [View]       │  │
│            │  │ Board Member      │ 250   │ Per-Board   │ [View]       │  │
│            │  │ Committee Member  │  80   │ Per-Board   │ [View]       │  │
│            │  │ Observer          │  20   │ Per-Board   │ [View]       │  │
│            │  │ Guest             │  45   │ Per-Meeting │ [View]       │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  CUSTOM ROLES                                                  │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │ Role              │ Users │ Scope       │ Actions      │  │
│            │  ├───────────────────┼───────┼─────────────┼──────────────┤  │
│            │  │ Report Viewer     │  15   │ Per-Board   │ [Edit][Del]  │  │
│            │  │ Document Manager  │   8   │ Per-Board   │ [Edit][Del]  │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 5.2 Role Details Modal

When clicking "View" on any role:

```
┌─────────────────────────────────────────────────────────────────┐
│  BOARD SECRETARY - Permissions                             [×]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MEETINGS                                                       │
│  ✓ Create meetings                                              │
│  ✓ Edit meetings                                                │
│  ✓ Cancel meetings                                              │
│  ✓ View all meetings                                            │
│  ✗ Delete meetings                                              │
│                                                                 │
│  DOCUMENTS                                                      │
│  ✓ Upload documents                                             │
│  ✓ View documents                                               │
│  ✓ Download documents                                           │
│  ✗ Delete documents                                             │
│                                                                 │
│  VOTING                                                         │
│  ✓ Create votes                                                 │
│  ✓ Cast votes                                                   │
│  ✓ View results                                                 │
│  ✓ Close votes                                                  │
│                                                                 │
│  MINUTES                                                        │
│  ✓ Create minutes                                               │
│  ✓ Edit minutes                                                 │
│  ✗ Approve minutes (Chairman only)                              │
│  ✓ Publish minutes                                              │
│                                                                 │
│  USERS                                                          │
│  ✓ View board members                                           │
│  ✗ Create users                                                 │
│  ✗ Edit users                                                   │
│  ✗ Delete users                                                 │
│                                                                 │
│                                                       [Close]   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Section Title | `Typography.Title` | System/Custom headers |
| Roles Table | `Table` | List roles |
| User Count | `Badge` | Show user count |
| Scope Tag | `Tag` | System-wide/Per-Board |
| View Button | `Button` | Open details modal |
| Edit Button | `Button` | Navigate to edit |
| Delete Button | `Popconfirm` + `Button` | Delete with confirm |
| Permissions Modal | `Modal` | Show permissions |
| Permission Item | `Space` + `CheckOutlined`/`CloseOutlined` | Permission row |

---

## 6. Create/Edit Role Page

**Route**: `/users/roles/create` or `/users/roles/:id/edit`  
**Access**: System Admin  
**Purpose**: Create or edit custom roles

### 6.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Roles                                              │
│            │                                                                │
│            │  CREATE CUSTOM ROLE                                            │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  Role Name *        [_______________________________]         │
│            │                                                                │
│            │  Description        [_______________________________]         │
│            │                                                                │
│            │  Scope *            [Per-Board                        ▼]      │
│            │                                                                │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  PERMISSIONS                                                   │
│            │                                                                │
│            │  ┌─ MEETINGS ──────────────────────────────────────────────┐  │
│            │  │ ☐ Create meetings                                       │  │
│            │  │ ☐ Edit meetings                                         │  │
│            │  │ ☐ Cancel meetings                                       │  │
│            │  │ ☑ View meetings                                         │  │
│            │  │ ☐ Delete meetings                                       │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ DOCUMENTS ─────────────────────────────────────────────┐  │
│            │  │ ☐ Upload documents                                      │  │
│            │  │ ☑ View documents                                        │  │
│            │  │ ☑ Download documents                                    │  │
│            │  │ ☐ Delete documents                                      │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ REPORTS ───────────────────────────────────────────────┐  │
│            │  │ ☑ View meeting reports                                  │  │
│            │  │ ☑ View attendance reports                               │  │
│            │  │ ☑ View compliance reports                               │  │
│            │  │ ☑ Export reports                                        │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │                              [Cancel]  [Create Role]          │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 6.2 Form Fields

```typescript
interface RoleForm {
  name: string;           // Required, unique
  description?: string;
  scope: 'system-wide' | 'per-board';
  permissions: {
    meetings: string[];
    documents: string[];
    voting: string[];
    minutes: string[];
    reports: string[];
    users: string[];
    boards: string[];
    admin: string[];
  };
}
```

### 6.3 Permission Groups

```typescript
const permissionGroups = {
  meetings: [
    'meetings.create',
    'meetings.edit',
    'meetings.cancel',
    'meetings.view',
    'meetings.delete',
  ],
  documents: [
    'documents.upload',
    'documents.view',
    'documents.download',
    'documents.delete',
  ],
  voting: [
    'voting.create',
    'voting.cast',
    'voting.view_results',
    'voting.close',
  ],
  minutes: [
    'minutes.create',
    'minutes.edit',
    'minutes.approve',
    'minutes.publish',
  ],
  reports: [
    'reports.meetings',
    'reports.attendance',
    'reports.compliance',
    'reports.export',
  ],
  users: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
  ],
};
```

---

## 7. Login Page

**Route**: `/auth/login`  
**Access**: Public  
**UI Pattern**: Auth Flow (1-2 steps)

### 7.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                     eBoard Portal                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Email                                                  │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  Password                                               │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  ☐ Remember me                    Forgot password?      │   │
│  │                                                         │   │
│  │  [              Sign In              ]                  │   │
│  │                                                         │   │
│  │  ─────────────────── or ───────────────────            │   │
│  │                                                         │   │
│  │  [         Sign in with Certificate         ]          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                   © 2026 KTDA. All rights reserved.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Error States

**Invalid Credentials:**
```
│  │  ⚠️ Invalid email or password                          │   │
│  │                                                         │   │
│  │  Email                                                  │   │
│  │  [john@ktda.co.ke_________________________________] ⚠  │   │
```

**Account Locked:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                     Account Locked                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  🔒 Your account has been temporarily locked due to     │   │
│  │     too many failed login attempts.                     │   │
│  │                                                         │   │
│  │     Please try again in 12 minutes.                     │   │
│  │                                                         │   │
│  │     Or contact support if you need immediate access.    │   │
│  │                                                         │   │
│  │  [           Contact Support           ]                │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Logo | `Image` | KTDA branding |
| Form | `Form` | Login form |
| Email Input | `Input` | Email field |
| Password Input | `Input.Password` | Password with toggle |
| Remember Checkbox | `Checkbox` | Remember me |
| Submit Button | `Button` type="primary" block | Sign in |
| Certificate Button | `Button` block | Alternative login |
| Error Alert | `Alert` type="error" | Error messages |

---

## 8. First-Time Login / Change Password

**Route**: `/auth/change-password`  
**Access**: After first login with temporary password  
**UI Pattern**: Auth Flow (forced step)

### 8.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                   Change Your Password                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Welcome! Please set a new password to continue.        │   │
│  │                                                         │   │
│  │  New Password *                                         │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Strong      │   │
│  │                                                         │   │
│  │  Password Requirements:                                 │   │
│  │  ✓ At least 12 characters                               │   │
│  │  ✓ One uppercase letter                                 │   │
│  │  ✗ One lowercase letter                                 │   │
│  │  ✗ One number                                           │   │
│  │  ✗ One special character (!@#$%^&*)                     │   │
│  │                                                         │   │
│  │  Confirm Password *                                     │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  [           Set Password & Continue           ]        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Password Input | `Input.Password` | New password |
| Strength Meter | `Progress` | Password strength |
| Requirements List | Custom | Checklist with icons |
| Confirm Input | `Input.Password` | Confirm password |
| Submit Button | `Button` type="primary" block | Continue |

---

## 9. MFA Verification Page

**Route**: `/auth/mfa`  
**Access**: After successful login (if MFA enabled)  
**UI Pattern**: Auth Flow (step 2)

### 9.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                  Two-Factor Authentication                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Enter the 6-digit code from your authenticator app     │   │
│  │                                                         │   │
│  │           [_] [_] [_] [_] [_] [_]                       │   │
│  │                                                         │   │
│  │  [              Verify              ]                   │   │
│  │                                                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  Having trouble?                                        │   │
│  │  • Use a backup code                                    │   │
│  │  • Contact support                                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Backup Code Entry

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                     Use Backup Code                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Enter one of your backup codes                         │   │
│  │                                                         │   │
│  │  Backup Code                                            │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  [              Verify              ]                   │   │
│  │                                                         │   │
│  │  ← Back to authenticator code                           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Code Input | Custom (6 inputs) | Auto-focus, auto-submit |
| Verify Button | `Button` type="primary" | Submit code |
| Backup Link | `Button` type="link" | Switch to backup |

---

## 10. Password Reset Flow

**Route**: `/auth/forgot-password`, `/auth/reset-password/:token`  
**Access**: Public  
**UI Pattern**: Auth Flow (3 steps)

### 10.1 Step 1: Request Reset

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                     Reset Password                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Enter your email address and we'll send you a link    │   │
│  │  to reset your password.                                │   │
│  │                                                         │   │
│  │  Email                                                  │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  [           Send Reset Link           ]               │   │
│  │                                                         │   │
│  │  ← Back to login                                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Step 2: Email Sent Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                     Check Your Email                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                         ✉️                              │   │
│  │                                                         │   │
│  │  We've sent a password reset link to:                   │   │
│  │  john.kamau@ktda.co.ke                                  │   │
│  │                                                         │   │
│  │  The link expires in 1 hour.                            │   │
│  │                                                         │   │
│  │  Didn't receive the email?                              │   │
│  │  [Resend] (available in 60 seconds)                     │   │
│  │                                                         │   │
│  │  ← Back to login                                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Step 3: Set New Password

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                   Set New Password                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  New Password *                                         │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░  Very Strong │   │
│  │                                                         │   │
│  │  Confirm Password *                                     │   │
│  │  [_________________________________________________]   │   │
│  │                                                         │   │
│  │  [           Reset Password           ]                 │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Success State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│                   Password Updated                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                         ✓                               │   │
│  │                                                         │   │
│  │  Your password has been updated successfully.           │   │
│  │                                                         │   │
│  │  Redirecting to login in 3 seconds...                   │   │
│  │                                                         │   │
│  │  [           Go to Login           ]                    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. MFA Setup Wizard

**Route**: `/auth/mfa-setup`  
**Access**: After first login (if MFA required)  
**UI Pattern**: Setup Wizard (3 steps)

### 11.1 Step 1: Scan QR Code

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│              Set Up Two-Factor Authentication                   │
│                                                                 │
│              ● Scan  ○ Verify  ○ Backup Codes                   │
│              ═══════════════════════════════                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  1. Download an authenticator app:                      │   │
│  │     • Google Authenticator                              │   │
│  │     • Microsoft Authenticator                           │   │
│  │     • Authy                                             │   │
│  │                                                         │   │
│  │  2. Scan this QR code with your app:                    │   │
│  │                                                         │   │
│  │              ┌─────────────────┐                        │   │
│  │              │                 │                        │   │
│  │              │    [QR CODE]    │                        │   │
│  │              │                 │                        │   │
│  │              └─────────────────┘                        │   │
│  │                                                         │   │
│  │  Can't scan? Enter this code manually:                  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  ABCD-EFGH-IJKL-MNOP                   [Copy]   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │                                          [Next →]       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Step 2: Verify Code

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│              Set Up Two-Factor Authentication                   │
│                                                                 │
│              ✓ Scan  ● Verify  ○ Backup Codes                   │
│              ═══════════════════════════════                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Enter the 6-digit code from your authenticator app     │   │
│  │  to verify setup:                                       │   │
│  │                                                         │   │
│  │           [_] [_] [_] [_] [_] [_]                       │   │
│  │                                                         │   │
│  │                              [← Back]  [Verify]         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Step 3: Save Backup Codes

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [KTDA Logo]                              │
│                                                                 │
│              Set Up Two-Factor Authentication                   │
│                                                                 │
│              ✓ Scan  ✓ Verify  ● Backup Codes                   │
│              ═══════════════════════════════                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Save these backup codes in a safe place.               │   │
│  │  You can use them if you lose access to your app.       │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  1. XXXX-XXXX-XXXX    6. XXXX-XXXX-XXXX        │   │   │
│  │  │  2. XXXX-XXXX-XXXX    7. XXXX-XXXX-XXXX        │   │   │
│  │  │  3. XXXX-XXXX-XXXX    8. XXXX-XXXX-XXXX        │   │   │
│  │  │  4. XXXX-XXXX-XXXX    9. XXXX-XXXX-XXXX        │   │   │
│  │  │  5. XXXX-XXXX-XXXX   10. XXXX-XXXX-XXXX        │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  [📥 Download]  [📋 Copy All]                          │   │
│  │                                                         │   │
│  │  ☐ I have saved these backup codes                      │   │
│  │                                                         │   │
│  │                                    [Complete Setup]     │   │
│  │                                    (disabled until ☑)   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Steps | `Steps` | Progress indicator |
| QR Code | `QRCode` (antd v5) | Authenticator setup |
| Manual Key | `Typography.Text` copyable | Alternative to QR |
| Code Input | Custom (6 inputs) | Verification code |
| Backup Codes | `Typography.Text` | Display codes |
| Download Button | `Button` | Download as text file |
| Copy Button | `Button` | Copy to clipboard |
| Checkbox | `Checkbox` | Confirm saved |

---

## 12. Bulk Actions (Users Index)

**UI Pattern**: Contextual Actions (sticky bar)

### 12.1 Bulk Action Bar

```
┌─────────────────────────────────────────────────────────────────┐
│  ☑ 12 users selected    [Export ▼] [Send Email] [Deactivate] [×]│
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Export Dropdown

```
┌─────────────────────┐
│  Export as:         │
├─────────────────────┤
│  📄 CSV             │
│  📊 Excel (.xlsx)   │
└─────────────────────┘
```

### 12.3 Send Email Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  SEND EMAIL TO 12 USERS                                    [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Recipients:                                                    │
│  [John Kamau] [Mary Wanjiku] [+10 more]                        │
│                                                                 │
│  Subject *                                                      │
│  [_________________________________________________]           │
│                                                                 │
│  Message *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [B] [I] [U] [Link] [List]                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │                                                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                    [Cancel]  [Send Email]       │
└─────────────────────────────────────────────────────────────────┘
```

### 12.4 Bulk Deactivate Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  DEACTIVATE 12 USERS                                       [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚠️ Are you sure you want to deactivate these users?           │
│                                                                 │
│  This will:                                                     │
│  • Prevent them from logging in                                 │
│  • Remove them from upcoming meetings                           │
│  • Send notification emails                                     │
│                                                                 │
│  ⚠️ Cannot deactivate: Peter Ochieng (Chairman)                │
│     This user will be skipped.                                  │
│                                                                 │
│  Reason for deactivation *                                      │
│  [_______________________________________________________]     │
│                                                                 │
│                              [Cancel]  [Deactivate 11 Users]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. File Structure

```
src/
├── pages/
│   ├── Users/
│   │   ├── index.tsx                 # Users Index
│   │   ├── UsersIndex.tsx
│   │   ├── CreateUserWizard.tsx      # Multi-step wizard
│   │   ├── UserDetails.tsx
│   │   ├── EditUser.tsx
│   │   └── components/
│   │       ├── UsersTable.tsx
│   │       ├── UserFilters.tsx
│   │       ├── BulkActionBar.tsx
│   │       ├── CreateUserSteps/
│   │       │   ├── BasicInfoStep.tsx
│   │       │   ├── RoleStep.tsx
│   │       │   ├── BoardsStep.tsx
│   │       │   ├── SecurityStep.tsx
│   │       │   └── ReviewStep.tsx
│   │       ├── BoardAssignmentModal.tsx
│   │       ├── UserProfileCard.tsx
│   │       ├── BoardMembershipsList.tsx
│   │       ├── AddToBoardModal.tsx
│   │       ├── EditRolePopover.tsx
│   │       ├── RemoveBoardModal.tsx
│   │       ├── ActivityTimeline.tsx
│   │       ├── SecuritySettings.tsx
│   │       ├── UploadCertificateModal.tsx
│   │       ├── BulkEmailModal.tsx
│   │       └── BulkDeactivateModal.tsx
│   ├── Roles/
│   │   ├── index.tsx                 # Roles Index
│   │   ├── RolesIndex.tsx
│   │   ├── CreateRole.tsx
│   │   ├── EditRole.tsx
│   │   └── components/
│   │       ├── RolesTable.tsx
│   │       ├── RoleDetailsModal.tsx
│   │       ├── RoleForm.tsx
│   │       └── PermissionsGrid.tsx
│   └── Auth/
│       ├── Login.tsx
│       ├── ChangePassword.tsx        # First-time login
│       ├── MfaVerification.tsx
│       ├── ForgotPassword.tsx
│       ├── ResetPassword.tsx
│       ├── MfaSetupWizard.tsx        # 3-step wizard
│       └── components/
│           ├── LoginForm.tsx
│           ├── PasswordStrengthMeter.tsx
│           ├── PasswordRequirements.tsx
│           ├── MfaCodeInput.tsx
│           ├── QrCodeDisplay.tsx
│           └── BackupCodesDisplay.tsx
├── hooks/
│   ├── useUsers.ts
│   ├── useUser.ts
│   ├── useRoles.ts
│   ├── useAuth.ts
│   └── useWizard.ts                  # Wizard state management
└── services/
    ├── usersService.ts
    ├── rolesService.ts
    └── authService.ts
```

---

## 14. Summary

| Page | Route | UI Pattern | Access |
|------|-------|------------|--------|
| Users Index | `/users` | Index/List with bulk actions | Admin, Secretary |
| Create User Wizard | `/users/create` | **Multi-Step Wizard (5 steps)** | Admin |
| User Details | `/users/:id` | Detail Page with Tabs | Admin, Secretary, Self |
| Edit User | `/users/:id/edit` | Form Page | Admin |
| Roles Index | `/users/roles` | Index with Modal Details | Admin |
| Create Role | `/users/roles/create` | Form with Accordion | Admin |
| Edit Role | `/users/roles/:id/edit` | Form with Impact Preview | Admin |
| Login | `/auth/login` | Auth Flow (1-2 steps) | Public |
| Change Password | `/auth/change-password` | Auth Flow (forced) | First login |
| MFA Verify | `/auth/mfa` | Auth Flow (step 2) | After login |
| Forgot Password | `/auth/forgot-password` | Auth Flow (step 1) | Public |
| Reset Password | `/auth/reset-password/:token` | Auth Flow (step 3) | Public |
| MFA Setup | `/auth/mfa-setup` | **Setup Wizard (3 steps)** | First login |

### Key UI Patterns Used

| Pattern | Pages | Description |
|---------|-------|-------------|
| Multi-Step Wizard | Create User, MFA Setup | Step indicator, Previous/Next, Review step |
| Index/List Page | Users Index, Roles Index | Table, filters, bulk actions |
| Detail Page with Tabs | User Details | Header card, tabbed content |
| Modal Form | Add to Board, Upload Certificate | Centered modal with form |
| Popconfirm/Popover | Remove from Board, Edit Role | Inline confirmation/edit |
| Auth Flow | Login, Password Reset, MFA | Centered card, no sidebar |
| Contextual Actions | Bulk Actions | Sticky bottom bar |

---

**END OF MODULE 1 PAGE SPECIFICATIONS**
