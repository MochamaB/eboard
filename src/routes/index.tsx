import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Dashboard } from '../pages/Dashboard';
import { UsersIndexPage } from '../pages/Users';

// Placeholder components for routes
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: 24 }}>
    <h2>{title}</h2>
    <p>This page is under construction.</p>
  </div>
);

// Auth pages (placeholders)
const LoginPage = () => <PlaceholderPage title="Login" />;
const ForgotPasswordPage = () => <PlaceholderPage title="Forgot Password" />;

// Main pages (placeholders)
const MeetingsPage = () => <PlaceholderPage title="Meetings" />;
const MeetingsCalendarPage = () => <PlaceholderPage title="Meetings Calendar" />;
const CreateMeetingPage = () => <PlaceholderPage title="Create Meeting" />;

const DocumentsPage = () => <PlaceholderPage title="Documents" />;
const BoardPacksPage = () => <PlaceholderPage title="Board Packs" />;
const TemplatesPage = () => <PlaceholderPage title="Document Templates" />;

const NotificationsPage = () => <PlaceholderPage title="Notifications" />;

const ReportsPage = () => <PlaceholderPage title="Reports" />;
const MeetingReportsPage = () => <PlaceholderPage title="Meeting Reports" />;
const AttendanceReportsPage = () => <PlaceholderPage title="Attendance Reports" />;
const ComplianceReportsPage = () => <PlaceholderPage title="Compliance Reports" />;

const RolesPage = () => <PlaceholderPage title="Roles & Permissions" />;
const CreateUserPage = () => <PlaceholderPage title="Create User" />;
const UserDetailPage = () => <PlaceholderPage title="User Details" />;

const BoardsPage = () => <PlaceholderPage title="Boards" />;
const CommitteesPage = () => <PlaceholderPage title="Committees" />;

const SettingsPage = () => <PlaceholderPage title="Settings" />;
const AdminPage = () => <PlaceholderPage title="Admin" />;

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Root redirect to default organization
      {
        path: '/',
        element: <Navigate to="/ktda-main/dashboard" replace />,
      },

      // Auth routes (no sidebar)
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/auth/login',
            element: <LoginPage />,
          },
          {
            path: '/auth/forgot-password',
            element: <ForgotPasswordPage />,
          },
        ],
      },

      // Main app routes (with sidebar) - all under /:orgId
      {
        path: '/:orgId',
        element: <AppLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      // Meetings
      {
        path: 'meetings',
        element: <MeetingsPage />,
      },
      {
        path: 'meetings/calendar',
        element: <MeetingsCalendarPage />,
      },
      {
        path: 'meetings/create',
        element: <CreateMeetingPage />,
      },

      // Documents
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      {
        path: 'documents/board-packs',
        element: <BoardPacksPage />,
      },
      {
        path: 'documents/templates',
        element: <TemplatesPage />,
      },

      // Notifications
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },

      // Reports
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'reports/meetings',
        element: <MeetingReportsPage />,
      },
      {
        path: 'reports/attendance',
        element: <AttendanceReportsPage />,
      },
      {
        path: 'reports/compliance',
        element: <ComplianceReportsPage />,
      },

      // Users
      {
        path: 'users',
        element: <UsersIndexPage />,
      },
      {
        path: 'users/create',
        element: <CreateUserPage />,
      },
      {
        path: 'users/:id',
        element: <UserDetailPage />,
      },
      {
        path: 'users/:id/edit',
        element: <UserDetailPage />,
      },
      {
        path: 'users/roles',
        element: <RolesPage />,
      },

      // Boards
      {
        path: 'boards',
        element: <BoardsPage />,
      },
      {
        path: 'boards/committees',
        element: <CommitteesPage />,
      },

      // Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'settings/*',
        element: <SettingsPage />,
      },

      // Admin
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'admin/*',
        element: <AdminPage />,
      },
    ],
  },
    ],
  },
]);

export default router;
