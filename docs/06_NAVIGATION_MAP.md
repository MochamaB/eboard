# eBoard Navigation & Routing Map

**Version**: 1.0  
**Last Updated**: January 2026  
**Technology**: React Router v6

---

## Table of Contents

1. [Route Structure Overview](#1-route-structure-overview)
2. [Public Routes (Unauthenticated)](#2-public-routes-unauthenticated)
3. [Protected Routes (Authenticated)](#3-protected-routes-authenticated)
4. [Sidebar Menu Structure](#4-sidebar-menu-structure)
5. [Breadcrumb Patterns](#5-breadcrumb-patterns)
6. [Role-Based Access](#6-role-based-access)
7. [Deep Linking](#7-deep-linking)
8. [Route Guards](#8-route-guards)

---

## 1. Route Structure Overview

### Base URL Structure

```
https://eboard.ktda.co.ke/
├── /auth/*                    # Public authentication routes
├── /                          # Dashboard (default after login)
├── /meetings/*                # Meeting management
├── /documents/*               # Document library
├── /notifications/*           # Notifications
├── /reports/*                 # Reports & analytics
├── /users/*                   # User management (Admin/Secretary)
├── /boards/*                  # Board management (Admin/Secretary/Chairman)
├── /settings/*                # User settings
└── /admin/*                   # System administration (Admin only)
```

### URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `:id` | Resource ID (UUID) | `/meetings/abc-123-def` |
| `:boardId` | Board context | `/boards/main-board-id` |
| `:committeeId` | Committee context | `/boards/main-board-id/committees/audit-id` |
| `?tab=` | Active tab | `/meetings/abc-123?tab=agenda` |
| `?filter=` | Filter state | `/users?filter=active` |
| `?page=` | Pagination | `/notifications?page=2` |

---

## 2. Public Routes (Unauthenticated)

Routes accessible without authentication.

| Route | Page | Description |
|-------|------|-------------|
| `/auth/login` | Login | Email/password login |
| `/auth/mfa` | MFA Verification | 6-digit code entry |
| `/auth/forgot-password` | Forgot Password | Request password reset |
| `/auth/reset-password/:token` | Reset Password | Set new password |
| `/auth/register/:token` | Complete Registration | New user setup (from invite) |
| `/auth/certificate-login` | Certificate Login | Digital certificate authentication |

### Login Flow Routes

```
/auth/login
    ↓ (success)
/auth/mfa (if MFA enabled)
    ↓ (success)
/ (Dashboard)
```

---

## 3. Protected Routes (Authenticated)

All routes below require authentication.

### 3.1 Dashboard

| Route | Page | Module | Access |
|-------|------|--------|--------|
| `/` | Dashboard | - | All users |
| `/dashboard` | Dashboard (alias) | - | All users |

**Dashboard Widgets**:
- My Boards summary
- Upcoming Meetings (next 7 days)
- Pending Action Items
- Recent Notifications
- Quick Actions

---

### 3.2 Meetings (Module 3)

| Route | Page | Access |
|-------|------|--------|
| `/meetings` | Meetings Index | All users |
| `/meetings?view=calendar` | Calendar View | All users |
| `/meetings?view=list` | List View | All users |
| `/meetings?tab=upcoming` | Upcoming Tab | All users |
| `/meetings?tab=past` | Past Meetings Tab | All users |
| `/meetings/create` | Create Meeting | Secretary |
| `/meetings/:id` | Meeting Details | Meeting participants |
| `/meetings/:id?tab=overview` | Overview Tab | Meeting participants |
| `/meetings/:id?tab=participants` | Participants Tab | Meeting participants |
| `/meetings/:id?tab=agenda` | Agenda Tab (Module 6) | Meeting participants |
| `/meetings/:id?tab=documents` | Documents Tab | Meeting participants |
| `/meetings/:id?tab=votes` | Votes Tab (Module 7) | Meeting participants |
| `/meetings/:id?tab=minutes` | Minutes Tab (Module 8) | Meeting participants |
| `/meetings/:id?tab=attendance` | Attendance Tab (Module 9) | Meeting participants |
| `/meetings/:id/edit` | Edit Meeting | Secretary |
| `/meetings/:id/live` | Live Meeting (Module 4) | Meeting participants |
| `/meetings/:id/confirmation` | Meeting Confirmation | Chairman |

---

### 3.3 Documents (Module 5)

| Route | Page | Access |
|-------|------|--------|
| `/documents` | Documents Library | All users |
| `/documents?tab=all` | All Documents | All users |
| `/documents?tab=board-packs` | Board Packs | All users |
| `/documents?tab=minutes` | Published Minutes | All users |
| `/documents?tab=policies` | Policies | All users |
| `/documents/upload` | Upload Document | Secretary |
| `/documents/:id` | Document Details | Based on permissions |
| `/documents/:id/view` | Document Viewer | Based on permissions |
| `/documents/:id/versions` | Version History | Based on permissions |

---

### 3.4 Notifications (Module 10)

| Route | Page | Access |
|-------|------|--------|
| `/notifications` | Notifications Index | All users |
| `/notifications?tab=all` | All Notifications | All users |
| `/notifications?tab=unread` | Unread Only | All users |
| `/notifications?tab=meetings` | Meeting Notifications | All users |
| `/notifications?tab=documents` | Document Notifications | All users |
| `/notifications?tab=tasks` | Task Notifications | All users |
| `/notifications?tab=votes` | Vote Notifications | All users |

---

### 3.5 Reports (Module 11)

| Route | Page | Access |
|-------|------|--------|
| `/reports` | Reports Dashboard | All users |
| `/reports/meetings` | Meeting Summary Report | All users |
| `/reports/attendance` | Attendance Analytics | All users |
| `/reports/action-items` | Action Items Report | All users |
| `/reports/documents` | Document Usage Report | Secretary, Admin |
| `/reports/compliance` | Compliance Report | Secretary, Admin, Chairman |
| `/reports/system-usage` | System Usage Report | Admin |
| `/reports/chairman-dashboard` | Chairman's Dashboard | Chairman |

---

### 3.6 Users (Module 1)

| Route | Page | Access |
|-------|------|--------|
| `/users` | Users Index | Admin, Secretary |
| `/users?tab=all` | All Users | Admin, Secretary |
| `/users?tab=active` | Active Users | Admin, Secretary |
| `/users?tab=inactive` | Inactive Users | Admin, Secretary |
| `/users?tab=by-board` | Users by Board | Admin, Secretary |
| `/users?tab=by-role` | Users by Role | Admin, Secretary |
| `/users/create` | Create User | Admin |
| `/users/import` | Bulk Import | Admin |
| `/users/:id` | User Profile | Admin, Secretary, Self |
| `/users/:id?tab=details` | Details Tab | Admin, Secretary, Self |
| `/users/:id?tab=boards` | Board Memberships | Admin, Secretary |
| `/users/:id?tab=activity` | Activity Log | Admin |
| `/users/:id?tab=security` | Security Settings | Admin, Self |
| `/users/:id/edit` | Edit User | Admin |
| `/users/roles` | Roles & Permissions | Admin |
| `/users/roles/:id` | Role Details | Admin |
| `/users/roles/create` | Create Custom Role | Admin |

---

### 3.7 Boards (Module 2)

| Route | Page | Access |
|-------|------|--------|
| `/boards` | Boards Index | Admin, Secretary, Chairman |
| `/boards?tab=all` | All Boards | Admin, Secretary, Chairman |
| `/boards?tab=main` | Main Board | Admin, Secretary, Chairman |
| `/boards?tab=subsidiaries` | Subsidiaries | Admin, Secretary, Chairman |
| `/boards?tab=factories` | Factories | Admin, Secretary, Chairman |
| `/boards?tab=committees` | All Committees | Admin, Secretary, Chairman |
| `/boards/hierarchy` | Board Hierarchy View | Admin, Secretary, Chairman |
| `/boards/create` | Create Board | Admin |
| `/boards/import` | Bulk Import Factories | Admin |
| `/boards/:id` | Board Details | Admin, Secretary, Chairman |
| `/boards/:id?tab=overview` | Overview Tab | Admin, Secretary, Chairman |
| `/boards/:id?tab=members` | Members Tab | Admin, Secretary, Chairman |
| `/boards/:id?tab=committees` | Committees Tab | Admin, Secretary, Chairman |
| `/boards/:id?tab=meetings` | Meetings Tab | Admin, Secretary, Chairman |
| `/boards/:id?tab=documents` | Documents Tab | Admin, Secretary, Chairman |
| `/boards/:id?tab=branding` | Branding Tab | Admin |
| `/boards/:id?tab=settings` | Settings Tab | Admin |
| `/boards/:id/edit` | Edit Board | Admin |
| `/boards/:id/committees/create` | Create Committee | Admin |
| `/boards/:id/committees/:committeeId` | Committee Details | Admin, Secretary, Chairman |

---

### 3.8 Settings

| Route | Page | Access |
|-------|------|--------|
| `/settings` | Settings Overview | All users |
| `/settings/profile` | Profile Settings | All users |
| `/settings/security` | Security Settings | All users |
| `/settings/security/mfa` | MFA Setup | All users |
| `/settings/security/password` | Change Password | All users |
| `/settings/security/certificate` | Digital Certificate | All users |
| `/settings/notifications` | Notification Preferences | All users |

---

### 3.9 Admin (Module 12)

| Route | Page | Access |
|-------|------|--------|
| `/admin` | Admin Dashboard | System Admin |
| `/admin/settings` | System Settings | System Admin |
| `/admin/settings/general` | General Settings | System Admin |
| `/admin/settings/email` | Email Configuration | System Admin |
| `/admin/settings/sms` | SMS Configuration | System Admin |
| `/admin/settings/notifications` | Notification Templates | System Admin |
| `/admin/settings/security` | Security Settings | System Admin |
| `/admin/audit-logs` | Audit Logs | System Admin |
| `/admin/audit-logs/:id` | Audit Log Details | System Admin |
| `/admin/backups` | Backup Management | System Admin |
| `/admin/system-health` | System Health Monitor | System Admin |

---

## 4. Sidebar Menu Structure

### Menu Configuration

```typescript
interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  path: string;
  roles: string[];  // 'all' or specific roles
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    path: '/',
    roles: ['all'],
  },
  {
    key: 'meetings',
    label: 'Meetings',
    icon: <CalendarOutlined />,
    path: '/meetings',
    roles: ['all'],
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: <FileOutlined />,
    path: '/documents',
    roles: ['all'],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <BellOutlined />,
    path: '/notifications',
    roles: ['all'],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChartOutlined />,
    path: '/reports',
    roles: ['all'],
  },
  { type: 'divider' },
  {
    key: 'users',
    label: 'Users',
    icon: <UserOutlined />,
    path: '/users',
    roles: ['admin', 'secretary'],
  },
  {
    key: 'boards',
    label: 'Boards',
    icon: <BankOutlined />,
    path: '/boards',
    roles: ['admin', 'secretary', 'chairman'],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    path: '/settings',
    roles: ['all'],
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: <ToolOutlined />,
    path: '/admin',
    roles: ['admin'],
  },
];
```

### Menu Visibility by Role

| Menu Item | Member | Secretary | Chairman | System Admin |
|-----------|--------|-----------|----------|--------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Meetings | ✓ | ✓ | ✓ | ✓ |
| Documents | ✓ | ✓ | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | ✓ | ✓ |
| Users | ✗ | ✓ | ✗ | ✓ |
| Boards | ✗ | ✓ | ✓ | ✓ |
| Settings | ✓ | ✓ | ✓ | ✓ |
| Admin | ✗ | ✗ | ✗ | ✓ |

---

## 5. Breadcrumb Patterns

### Breadcrumb Structure

```typescript
interface BreadcrumbItem {
  label: string;
  path?: string;  // Optional - last item has no path
}
```

### Examples by Route

| Route | Breadcrumbs |
|-------|-------------|
| `/` | Home |
| `/meetings` | Home > Meetings |
| `/meetings/create` | Home > Meetings > Create Meeting |
| `/meetings/:id` | Home > Meetings > {Meeting Title} |
| `/meetings/:id?tab=agenda` | Home > Meetings > {Meeting Title} > Agenda |
| `/users` | Home > Users |
| `/users/:id` | Home > Users > {User Name} |
| `/boards` | Home > Boards |
| `/boards/:id` | Home > Boards > {Board Name} |
| `/boards/:id/committees/:cid` | Home > Boards > {Board Name} > {Committee Name} |
| `/settings/notifications` | Home > Settings > Notifications |
| `/admin/audit-logs` | Home > Admin > Audit Logs |

### Breadcrumb Component Usage

```jsx
<Breadcrumb
  items={[
    { title: <Link to="/">Home</Link> },
    { title: <Link to="/meetings">Meetings</Link> },
    { title: 'Q1 Board Review' },  // Current page - no link
  ]}
/>
```

---

## 6. Role-Based Access

### Role Definitions

| Role | Code | Description |
|------|------|-------------|
| System Admin | `admin` | Full system access |
| Board Chairman | `chairman` | Board oversight, all boards access |
| Board Secretary | `secretary` | Board management, user management |
| Board Member | `member` | Standard board member access |
| Committee Chairman | `committee_chairman` | Committee-specific chairman |
| Observer | `observer` | Read-only access |
| Guest/Presenter | `guest` | Limited time-slot access |

### Permission Matrix

| Permission | Admin | Chairman | Secretary | Member | Observer |
|------------|-------|----------|-----------|--------|----------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Meetings | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Meeting | ✓ | ✗ | ✓ | ✗ | ✗ |
| Edit Meeting | ✓ | ✗ | ✓ | ✗ | ✗ |
| View Documents | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload Documents | ✓ | ✗ | ✓ | ✗ | ✗ |
| View Users | ✓ | ✗ | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Boards | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage Boards | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✓ | ✓ |
| System Admin | ✓ | ✗ | ✗ | ✗ | ✗ |
| Cast Vote | ✓ | ✓ | ✓ | ✓ | ✗ |
| Approve Minutes | ✗ | ✓ | ✗ | ✗ | ✗ |
| Confirm Meeting | ✗ | ✓ | ✗ | ✗ | ✗ |

---

## 7. Deep Linking

### Notification Deep Links

When clicking a notification, navigate to the specific resource:

| Notification Type | Deep Link |
|-------------------|-----------|
| Meeting Invitation | `/meetings/:meetingId` |
| Meeting Reminder | `/meetings/:meetingId` |
| Meeting Started | `/meetings/:meetingId/live` |
| Document Uploaded | `/documents/:documentId` |
| Agenda Published | `/meetings/:meetingId?tab=agenda` |
| Vote Opened | `/meetings/:meetingId?tab=votes` |
| Action Item Assigned | `/meetings/:meetingId?tab=minutes#action-:actionId` |
| Minutes Published | `/meetings/:meetingId?tab=minutes` |
| Confirmation Requested | `/meetings/:meetingId/confirmation` |

### Email Deep Links

Email links include authentication token for seamless access:

```
https://eboard.ktda.co.ke/meetings/abc-123?token=xyz-auth-token
```

### Board Context Preservation

When navigating via deep link, update Organization Selector:

```typescript
// On navigation to /meetings/:id
const meeting = await getMeeting(id);
setCurrentBoard(meeting.boardId);  // Update Organization Selector
setActiveCommittee(meeting.committeeId);  // Update Committee Tab if applicable
```

---

## 8. Route Guards

### Authentication Guard

```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  
  return children;
};
```

### Role Guard

```typescript
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  
  if (!allowedRoles.includes(user.role) && !allowedRoles.includes('all')) {
    return <Navigate to="/" />;  // Redirect to dashboard
  }
  
  return children;
};

// Usage
<Route 
  path="/admin/*" 
  element={
    <RoleGuard allowedRoles={['admin']}>
      <AdminLayout />
    </RoleGuard>
  } 
/>
```

### Board Access Guard

```typescript
const BoardAccessGuard = ({ boardId, children }) => {
  const { user } = useAuth();
  const { data: hasAccess } = useQuery(['boardAccess', boardId], 
    () => checkBoardAccess(user.id, boardId)
  );
  
  if (!hasAccess) {
    return <AccessDenied message="You don't have access to this board" />;
  }
  
  return children;
};
```

### Meeting Access Guard

```typescript
const MeetingAccessGuard = ({ meetingId, children }) => {
  const { user } = useAuth();
  const { data: meeting } = useQuery(['meeting', meetingId]);
  
  // Check if user is participant or has board access
  const isParticipant = meeting?.participants.includes(user.id);
  const hasChairmanAccess = user.role === 'chairman';
  
  if (!isParticipant && !hasChairmanAccess) {
    return <AccessDenied message="You are not a participant of this meeting" />;
  }
  
  return children;
};
```

---

## 9. Router Configuration

### React Router Setup

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'mfa', element: <MFAPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
      { path: 'register/:token', element: <RegisterPage /> },
      { path: 'certificate-login', element: <CertificateLoginPage /> },
    ],
  },
  
  // Protected routes
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <Navigate to="/" replace /> },
      
      // Meetings
      {
        path: 'meetings',
        children: [
          { index: true, element: <MeetingsIndexPage /> },
          { path: 'create', element: <RoleGuard allowedRoles={['admin', 'secretary']}><CreateMeetingPage /></RoleGuard> },
          { path: ':id', element: <MeetingDetailsPage /> },
          { path: ':id/edit', element: <RoleGuard allowedRoles={['admin', 'secretary']}><EditMeetingPage /></RoleGuard> },
          { path: ':id/live', element: <LiveMeetingPage /> },
          { path: ':id/confirmation', element: <RoleGuard allowedRoles={['chairman']}><MeetingConfirmationPage /></RoleGuard> },
        ],
      },
      
      // Documents
      {
        path: 'documents',
        children: [
          { index: true, element: <DocumentsIndexPage /> },
          { path: 'upload', element: <RoleGuard allowedRoles={['admin', 'secretary']}><UploadDocumentPage /></RoleGuard> },
          { path: ':id', element: <DocumentDetailsPage /> },
          { path: ':id/view', element: <DocumentViewerPage /> },
        ],
      },
      
      // Notifications
      {
        path: 'notifications',
        element: <NotificationsIndexPage />,
      },
      
      // Reports
      {
        path: 'reports',
        children: [
          { index: true, element: <ReportsDashboardPage /> },
          { path: 'meetings', element: <MeetingSummaryReport /> },
          { path: 'attendance', element: <AttendanceReport /> },
          { path: 'action-items', element: <ActionItemsReport /> },
          { path: 'documents', element: <RoleGuard allowedRoles={['admin', 'secretary']}><DocumentUsageReport /></RoleGuard> },
          { path: 'compliance', element: <RoleGuard allowedRoles={['admin', 'secretary', 'chairman']}><ComplianceReport /></RoleGuard> },
          { path: 'system-usage', element: <RoleGuard allowedRoles={['admin']}><SystemUsageReport /></RoleGuard> },
          { path: 'chairman-dashboard', element: <RoleGuard allowedRoles={['chairman']}><ChairmanDashboard /></RoleGuard> },
        ],
      },
      
      // Users
      {
        path: 'users',
        element: <RoleGuard allowedRoles={['admin', 'secretary']}><Outlet /></RoleGuard>,
        children: [
          { index: true, element: <UsersIndexPage /> },
          { path: 'create', element: <RoleGuard allowedRoles={['admin']}><CreateUserPage /></RoleGuard> },
          { path: 'import', element: <RoleGuard allowedRoles={['admin']}><ImportUsersPage /></RoleGuard> },
          { path: 'roles', element: <RoleGuard allowedRoles={['admin']}><RolesPage /></RoleGuard> },
          { path: 'roles/create', element: <RoleGuard allowedRoles={['admin']}><CreateRolePage /></RoleGuard> },
          { path: 'roles/:id', element: <RoleGuard allowedRoles={['admin']}><RoleDetailsPage /></RoleGuard> },
          { path: ':id', element: <UserProfilePage /> },
          { path: ':id/edit', element: <RoleGuard allowedRoles={['admin']}><EditUserPage /></RoleGuard> },
        ],
      },
      
      // Boards
      {
        path: 'boards',
        element: <RoleGuard allowedRoles={['admin', 'secretary', 'chairman']}><Outlet /></RoleGuard>,
        children: [
          { index: true, element: <BoardsIndexPage /> },
          { path: 'hierarchy', element: <BoardHierarchyPage /> },
          { path: 'create', element: <RoleGuard allowedRoles={['admin']}><CreateBoardPage /></RoleGuard> },
          { path: 'import', element: <RoleGuard allowedRoles={['admin']}><ImportBoardsPage /></RoleGuard> },
          { path: ':id', element: <BoardDetailsPage /> },
          { path: ':id/edit', element: <RoleGuard allowedRoles={['admin']}><EditBoardPage /></RoleGuard> },
          { path: ':id/committees/create', element: <RoleGuard allowedRoles={['admin']}><CreateCommitteePage /></RoleGuard> },
          { path: ':id/committees/:committeeId', element: <CommitteeDetailsPage /> },
        ],
      },
      
      // Settings
      {
        path: 'settings',
        children: [
          { index: true, element: <SettingsOverviewPage /> },
          { path: 'profile', element: <ProfileSettingsPage /> },
          { path: 'security', element: <SecuritySettingsPage /> },
          { path: 'security/mfa', element: <MFASetupPage /> },
          { path: 'security/password', element: <ChangePasswordPage /> },
          { path: 'security/certificate', element: <CertificateSettingsPage /> },
          { path: 'notifications', element: <NotificationPreferencesPage /> },
        ],
      },
      
      // Admin
      {
        path: 'admin',
        element: <RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'settings', element: <SystemSettingsPage /> },
          { path: 'settings/general', element: <GeneralSettingsPage /> },
          { path: 'settings/email', element: <EmailConfigPage /> },
          { path: 'settings/sms', element: <SMSConfigPage /> },
          { path: 'settings/notifications', element: <NotificationTemplatesPage /> },
          { path: 'settings/security', element: <SecurityConfigPage /> },
          { path: 'audit-logs', element: <AuditLogsPage /> },
          { path: 'audit-logs/:id', element: <AuditLogDetailsPage /> },
          { path: 'backups', element: <BackupManagementPage /> },
          { path: 'system-health', element: <SystemHealthPage /> },
        ],
      },
    ],
  },
  
  // 404
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

---

## 10. Summary

### Route Count by Section

| Section | Routes | Access |
|---------|--------|--------|
| Authentication | 6 | Public |
| Dashboard | 1 | All users |
| Meetings | 8 | All users (some restricted) |
| Documents | 5 | All users (some restricted) |
| Notifications | 1 | All users |
| Reports | 8 | All users (some restricted) |
| Users | 10 | Admin, Secretary |
| Boards | 9 | Admin, Secretary, Chairman |
| Settings | 7 | All users |
| Admin | 11 | System Admin only |
| **Total** | **66** | - |

### Key Navigation Patterns

1. **Index → Details → Edit**: Standard CRUD pattern
2. **Tabs via Query Params**: `/resource/:id?tab=name`
3. **Filters via Query Params**: `/resource?filter=value&page=1`
4. **Nested Resources**: `/boards/:id/committees/:committeeId`
5. **Role-Based Visibility**: Menu items and routes filtered by role
6. **Deep Linking**: Notifications and emails link directly to resources

---

**END OF NAVIGATION MAP**
