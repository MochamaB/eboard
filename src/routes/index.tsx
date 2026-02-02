import React from 'react';
import { createBrowserRouter, useNavigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Dashboard } from '../pages/Dashboard';
import { UsersIndexPage, CreateUserPage as CreateUserPageComponent } from '../pages/Users';
import { BoardsIndexPage, BoardDetailsPage, BoardCreatePage as BoardCreatePageComponent } from '../pages/Boards';
import { MeetingsIndexPage, MeetingCreatePage, MeetingDetailPage } from '../pages/Meetings';
import { ApprovalsIndexPage, ApprovalReviewPage } from '../pages/Approvals';
import { LoginPage } from '../pages/Auth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Placeholder components for routes
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: 24 }}>
    <h2>{title}</h2>
    <p>This page is under construction.</p>
  </div>
);

// Auth pages (placeholders)
const ForgotPasswordPage = () => <PlaceholderPage title="Forgot Password" />;

// Main pages (placeholders)
const MeetingsCalendarPage = () => <PlaceholderPage title="Meetings Calendar" />;

const DocumentsPage = () => <PlaceholderPage title="Documents" />;
const BoardPacksPage = () => <PlaceholderPage title="Board Packs" />;
const TemplatesPage = () => <PlaceholderPage title="Document Templates" />;

const NotificationsPage = () => <PlaceholderPage title="Notifications" />;

const ReportsPage = () => <PlaceholderPage title="Reports" />;
const MeetingReportsPage = () => <PlaceholderPage title="Meeting Reports" />;
const AttendanceReportsPage = () => <PlaceholderPage title="Attendance Reports" />;
const ComplianceReportsPage = () => <PlaceholderPage title="Compliance Reports" />;

const RolesPage = () => <PlaceholderPage title="Roles & Permissions" />;
const UserDetailPage = () => <PlaceholderPage title="User Details" />;

const BoardDetailPage = () => <PlaceholderPage title="Board Details" />;
const BoardEditPage = () => <PlaceholderPage title="Edit Board" />;
const BoardMembersPage = () => <PlaceholderPage title="Board Members" />;
const CommitteesPage = () => <PlaceholderPage title="Committees" />;

const SettingsPage = () => <PlaceholderPage title="Settings" />;
const AdminPage = () => <PlaceholderPage title="Admin" />;

// Dynamic redirect component - redirects to user's primary board
const DynamicBoardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, getPrimaryBoard } = useAuth();
  
  React.useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true });
      return;
    }
    
    const primaryBoard = getPrimaryBoard();
    if (primaryBoard) {
      navigate(`/${primaryBoard.id}/dashboard`, { replace: true });
    } else {
      // Fallback to ktda-ms if no primary board
      navigate('/ktda-ms/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, getPrimaryBoard, navigate]);
  
  // Show loading while determining redirect
  return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
};

// Global boards page (for 'View All Boards' mode)
const GlobalBoardsPage: React.FC = () => {
  return <BoardsIndexPage />;
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Root redirect - dynamically redirects to user's primary board
      {
        path: '/',
        element: <ProtectedRoute><DynamicBoardRedirect /></ProtectedRoute>,
      },
      
      // Global boards route (for 'View All Boards' mode - not under /:boardId)
      {
        path: '/boards',
        element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <GlobalBoardsPage />,
          },
        ],
      },

      // "View All" routes - aggregated view across all boards
      {
        path: '/all',
        element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'meetings',
            element: <MeetingsIndexPage />,
          },
          {
            path: 'approvals',
            element: <ApprovalsIndexPage />,
          },
          {
            path: 'users',
            element: <UsersIndexPage />,
          },
          {
            path: 'documents',
            element: <DocumentsPage />,
          },
          {
            path: 'boards',
            element: <GlobalBoardsPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'notifications',
            element: <NotificationsPage />,
          },
        ],
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

      // Main app routes (with sidebar) - all under /:boardId
      // Protected: requires authentication
      {
        path: '/:boardId',
        element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      // Meetings
      {
        path: 'meetings',
        element: <MeetingsIndexPage />,
      },
      {
        path: 'meetings/calendar',
        element: <MeetingsCalendarPage />,
      },
      {
        path: 'meetings/create',
        element: <MeetingCreatePage />,
      },
      {
        path: 'meetings/:meetingId',
        element: <MeetingDetailPage />,
      },

      // Approvals
      {
        path: 'approvals',
        element: <ApprovalsIndexPage />,
      },
      {
        path: 'approvals/:meetingId',
        element: <ApprovalReviewPage />,
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
        element: <CreateUserPageComponent />,
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
        element: <BoardsIndexPage />,
      },
      {
        path: 'boards/create',
        element: <BoardCreatePageComponent />,
      },
      {
        path: 'boards/:targetBoardId/details',
        element: <BoardDetailsPage />,
      },
      {
        path: 'boards/:id/edit',
        element: <BoardEditPage />,
      },
      {
        path: 'boards/:id/members',
        element: <BoardMembersPage />,
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
