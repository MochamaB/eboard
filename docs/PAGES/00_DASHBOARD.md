# Dashboard Page Specification

**Route**: `/` or `/dashboard`  
**Access**: All authenticated users  
**Version**: 1.0  
**Last Updated**: January 2026

---

## 1. Page Overview

The Dashboard is the main landing page after login. It provides a personalized overview of the user's boards, upcoming meetings, pending tasks, and recent activity. The content adapts based on the user's role and board memberships.

---

## 2. Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (64px)                                                              │
│  [Logo] [KTDA Main Board ▼]  [🔍 Search...]              [🔔 5] [👤 Profile]│
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  Welcome back, John Kamau                                      │
│            │  Last login: Today at 9:30 AM                                  │
│  Dashboard │  ────────────────────────────────────────────────────────────  │
│  ●         │                                                                │
│  Meetings  │  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  Documents │  │  MY BOARDS              │  │  QUICK STATS            │     │
│  Notific.  │  │  ───────────────────    │  │  ───────────────────    │     │
│  Reports   │  │  [Grid of board cards]  │  │  Meetings: 3 this week  │     │
│  ─────     │  │                         │  │  Action Items: 5 pending│     │
│  Users     │  │                         │  │  Documents: 2 to review │     │
│  Boards    │  └─────────────────────────┘  └─────────────────────────┘     │
│  Settings  │                                                                │
│  Admin     │  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│            │  │  UPCOMING MEETINGS      │  │  PENDING ACTION ITEMS   │     │
│            │  │  ───────────────────    │  │  ───────────────────    │     │
│            │  │  [List of meetings]     │  │  [List of action items] │     │
│            │  │                         │  │                         │     │
│            │  │  [View All Meetings →]  │  │  [View All Tasks →]     │     │
│            │  └─────────────────────────┘  └─────────────────────────┘     │
│            │                                                                │
│            │  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│            │  │  RECENT DOCUMENTS       │  │  RECENT NOTIFICATIONS   │     │
│            │  │  ───────────────────    │  │  ───────────────────    │     │
│            │  │  [List of documents]    │  │  [List of notifications]│     │
│            │  │                         │  │                         │     │
│            │  │  [View All Documents →] │  │  [View All →]           │     │
│            │  └─────────────────────────┘  └─────────────────────────┘     │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

---

## 3. Page Sections

### 3.1 Welcome Header

**Location**: Top of content area

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome back, John Kamau                      [📅 Jan 16, 2026]│
│  Last login: Today at 9:30 AM                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Components**: `Typography.Title`, `Typography.Text`

**Data**:
```typescript
interface WelcomeData {
  userName: string;
  lastLogin: Date;
  currentDate: Date;
}
```

---

### 3.2 My Boards Widget

**Location**: Top-left (2/3 width on desktop)

**Purpose**: Quick access to user's board memberships

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  MY BOARDS                                        [View All →]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ [KTDA Logo]  │  │ [Audit Icon] │  │ [KETEPA Logo]│          │
│  │              │  │              │  │              │          │
│  │ KTDA Main    │  │ Audit        │  │ KETEPA       │          │
│  │ Board        │  │ Committee    │  │ Limited      │          │
│  │              │  │              │  │              │          │
│  │ 15 members   │  │ 5 members    │  │ 8 members    │          │
│  │ Next: Feb 15 │  │ Next: Jan 20 │  │ Next: Jan 25 │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ [Factory]    │  │ [Factory]    │  │ [+3 more]    │          │
│  │ Chebut       │  │ Kapkatet     │  │              │          │
│  │ Factory      │  │ Factory      │  │ View all     │          │
│  │ 7 members    │  │ 6 members    │  │ boards       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

**Components**: `Card`, `Row`, `Col`, `Avatar`, `Typography`

**Props**:
```typescript
interface BoardCardProps {
  id: string;
  name: string;
  type: 'main' | 'subsidiary' | 'factory' | 'committee';
  logo?: string;
  memberCount: number;
  nextMeeting?: {
    date: Date;
    title: string;
  };
  brandColor?: string;
}

interface MyBoardsWidgetProps {
  boards: BoardCardProps[];
  maxVisible: number;  // Default: 6
  onBoardClick: (boardId: string) => void;
  onViewAll: () => void;
}
```

**Behavior**:
- Click board card → Update Organization Selector + Navigate to board's meetings
- Show max 6 boards, "+X more" card if more
- Cards show board branding color as accent
- "Next meeting" shows date or "No upcoming meetings"

**Ant Design**: `Card`, `Row`, `Col`, `Avatar`, `Badge`

---

### 3.3 Quick Stats Widget

**Location**: Top-right (1/3 width on desktop)

**Purpose**: At-a-glance statistics

**Structure**:
```
┌─────────────────────────────────────┐
│  QUICK STATS                        │
├─────────────────────────────────────┤
│                                     │
│  📅  3  Meetings this week          │
│  ─────────────────────────────────  │
│  ✅  5  Pending action items        │
│  ─────────────────────────────────  │
│  📄  2  Documents to review         │
│  ─────────────────────────────────  │
│  🗳️  1  Active vote                 │
│                                     │
└─────────────────────────────────────┘
```

**Components**: `Card`, `Statistic`, `List`

**Props**:
```typescript
interface QuickStatsProps {
  meetingsThisWeek: number;
  pendingActionItems: number;
  documentsToReview: number;
  activeVotes: number;
}
```

**Behavior**:
- Click stat row → Navigate to relevant page
- Numbers update in real-time
- Highlight if urgent (e.g., overdue items in red)

**Ant Design**: `Card`, `Statistic`, `Space`

---

### 3.4 Upcoming Meetings Widget

**Location**: Middle-left (1/2 width)

**Purpose**: Show next 5 meetings across all boards

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  UPCOMING MEETINGS                                [View All →]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔵 TODAY                                                    ││
│  │    Q4 Audit Review                              2:00 PM     ││
│  │    Audit Committee • Virtual                   [Join →]     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📅 TOMORROW                                                 ││
│  │    Monthly Board Meeting                       10:00 AM     ││
│  │    KTDA Main Board • Boardroom 1                            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📅 JAN 20                                                   ││
│  │    Budget Review                               9:00 AM      ││
│  │    Finance Committee • Virtual                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  No more meetings this week                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Components**: `Card`, `List`, `Tag`, `Button`

**Props**:
```typescript
interface UpcomingMeeting {
  id: string;
  title: string;
  boardName: string;
  boardId: string;
  date: Date;
  time: string;
  location: string;
  isVirtual: boolean;
  canJoin: boolean;  // Within 15 min of start
}

interface UpcomingMeetingsWidgetProps {
  meetings: UpcomingMeeting[];
  maxVisible: number;  // Default: 5
  onMeetingClick: (meetingId: string) => void;
  onJoinClick: (meetingId: string) => void;
  onViewAll: () => void;
}
```

**Behavior**:
- Grouped by date (Today, Tomorrow, Date)
- "Join" button appears 15 min before virtual meetings
- Click meeting → Navigate to meeting details
- Board name shown with color indicator
- Empty state: "No upcoming meetings"

**Ant Design**: `Card`, `List`, `List.Item`, `Tag`, `Button`, `Typography`

---

### 3.5 Pending Action Items Widget

**Location**: Middle-right (1/2 width)

**Purpose**: Show user's pending action items

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  PENDING ACTION ITEMS                             [View All →]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ OVERDUE                                                  ││
│  │    Prepare Q4 budget report                                 ││
│  │    KTDA Main Board • Due: Jan 10            [Mark Done ✓]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🔴 DUE TODAY                                                ││
│  │    Review audit findings                                    ││
│  │    Audit Committee • Due: Jan 16            [Mark Done ✓]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🟡 DUE THIS WEEK                                            ││
│  │    Submit compliance report                                 ││
│  │    KETEPA Limited • Due: Jan 20             [Mark Done ✓]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │    Prepare meeting agenda                                   ││
│  │    Finance Committee • Due: Jan 22          [Mark Done ✓]   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Components**: `Card`, `List`, `Tag`, `Button`, `Checkbox`

**Props**:
```typescript
interface ActionItem {
  id: string;
  title: string;
  boardName: string;
  boardId: string;
  meetingId: string;
  dueDate: Date;
  status: 'overdue' | 'due_today' | 'due_this_week' | 'upcoming';
  priority: 'high' | 'medium' | 'low';
}

interface ActionItemsWidgetProps {
  items: ActionItem[];
  maxVisible: number;  // Default: 5
  onItemClick: (itemId: string) => void;
  onMarkDone: (itemId: string) => void;
  onViewAll: () => void;
}
```

**Behavior**:
- Grouped by urgency (Overdue → Due Today → Due This Week)
- Overdue items highlighted in red
- Quick "Mark Done" action
- Click item → Navigate to meeting minutes
- Empty state: "No pending action items 🎉"

**Ant Design**: `Card`, `List`, `List.Item`, `Tag`, `Button`, `Checkbox`

---

### 3.6 Recent Documents Widget

**Location**: Bottom-left (1/2 width)

**Purpose**: Show recently uploaded/shared documents

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  RECENT DOCUMENTS                                 [View All →]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📄 Q4 Financial Report.pdf                      2 hours ago ││
│  │    KTDA Main Board • 2.4 MB                    [View →]     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📄 Audit Findings Summary.docx                  Yesterday   ││
│  │    Audit Committee • 1.1 MB                    [View →]     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📄 Board Pack - January 2026.pdf                2 days ago  ││
│  │    KTDA Main Board • 15.2 MB                   [View →]     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Components**: `Card`, `List`, `Typography`, `Button`

**Props**:
```typescript
interface RecentDocument {
  id: string;
  name: string;
  type: string;  // File extension
  size: string;
  boardName: string;
  boardId: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface RecentDocumentsWidgetProps {
  documents: RecentDocument[];
  maxVisible: number;  // Default: 5
  onDocumentClick: (docId: string) => void;
  onViewAll: () => void;
}
```

**Behavior**:
- Show file icon based on type (PDF, DOC, XLS, etc.)
- Relative time (2 hours ago, Yesterday, etc.)
- Click → Open document viewer
- Empty state: "No recent documents"

**Ant Design**: `Card`, `List`, `List.Item`, `Typography`, `Button`

---

### 3.7 Recent Notifications Widget

**Location**: Bottom-right (1/2 width)

**Purpose**: Show recent notifications (mirrors bell dropdown)

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  RECENT NOTIFICATIONS                             [View All →]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔵 New document uploaded                        10 min ago  ││
│  │    Q4 Financial Report • KTDA Main Board                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🔵 Meeting reminder                             1 hour ago  ││
│  │    Q4 Audit Review starts in 1 hour                         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ○  Minutes published                            Yesterday   ││
│  │    January Board Meeting • KETEPA Limited                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Components**: `Card`, `List`, `Badge`

**Props**:
```typescript
interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  boardName: string;
  isRead: boolean;
  createdAt: Date;
  link: string;
}

interface NotificationsWidgetProps {
  notifications: Notification[];
  maxVisible: number;  // Default: 5
  onNotificationClick: (notification: Notification) => void;
  onViewAll: () => void;
}
```

**Behavior**:
- Blue dot for unread
- Click → Navigate to related item + mark as read
- Relative time display
- Empty state: "No new notifications"

**Ant Design**: `Card`, `List`, `List.Item`, `Badge`, `Typography`

---

## 4. Role-Based Variations

### 4.1 Chairman Dashboard

Additional widgets for Chairman role:

```
┌─────────────────────────────────────────────────────────────────┐
│  PENDING APPROVALS                                              │
├─────────────────────────────────────────────────────────────────┤
│  📝 2 Minutes awaiting approval                                 │
│  ✅ 1 Meeting confirmation pending                              │
│                                                    [Review →]   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BOARD COMPLIANCE OVERVIEW                                      │
├─────────────────────────────────────────────────────────────────┤
│  Main Board: ✓ Compliant    Subsidiaries: ⚠ 1 Warning          │
│  Factories: ⚠ 5 Warnings    Committees: ✓ All Compliant        │
│                                                    [Details →]  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Secretary Dashboard

Additional widgets for Secretary role:

```
┌─────────────────────────────────────────────────────────────────┐
│  MEETINGS TO PREPARE                                            │
├─────────────────────────────────────────────────────────────────┤
│  📋 Q4 Audit Review - Agenda not published                      │
│  📄 Monthly Board Meeting - Board pack incomplete               │
│                                                    [Prepare →]  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 System Admin Dashboard

Additional widgets for Admin role:

```
┌─────────────────────────────────────────────────────────────────┐
│  SYSTEM STATUS                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Users: 350 active    Storage: 45% used    Uptime: 99.9%       │
│  Last backup: Today 3:00 AM                       [Admin →]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Responsive Behavior

### Desktop (≥1200px)
- 2-column grid for widgets
- My Boards: 6 cards visible
- All widgets visible

### Tablet (768px - 1199px)
- 2-column grid, narrower
- My Boards: 4 cards visible
- Widgets stack in 2 columns

### Mobile (<768px)
- Single column layout
- My Boards: Horizontal scroll
- Widgets stack vertically
- Collapsible sidebar

---

## 6. Data Loading

### API Endpoints

| Widget | Endpoint | Method |
|--------|----------|--------|
| My Boards | `GET /api/users/me/boards` | GET |
| Quick Stats | `GET /api/dashboard/stats` | GET |
| Upcoming Meetings | `GET /api/meetings?upcoming=true&limit=5` | GET |
| Action Items | `GET /api/action-items?assignee=me&status=pending` | GET |
| Recent Documents | `GET /api/documents?recent=true&limit=5` | GET |
| Notifications | `GET /api/notifications?limit=5` | GET |

### Loading States

```jsx
// Each widget shows skeleton while loading
<Card loading={isLoading}>
  <Skeleton active />
</Card>
```

### Error States

```jsx
// Each widget handles errors gracefully
<Card>
  <Result
    status="error"
    title="Failed to load"
    extra={<Button onClick={retry}>Retry</Button>}
  />
</Card>
```

---

## 7. Component Tree

```
DashboardPage
├── WelcomeHeader
├── Row (gutter: 24)
│   ├── Col (span: 16)
│   │   └── MyBoardsWidget
│   │       └── BoardCard (×6)
│   └── Col (span: 8)
│       └── QuickStatsWidget
├── Row (gutter: 24)
│   ├── Col (span: 12)
│   │   └── UpcomingMeetingsWidget
│   │       └── MeetingListItem (×5)
│   └── Col (span: 12)
│       └── ActionItemsWidget
│           └── ActionItemListItem (×5)
├── Row (gutter: 24)
│   ├── Col (span: 12)
│   │   └── RecentDocumentsWidget
│   │       └── DocumentListItem (×5)
│   └── Col (span: 12)
│       └── NotificationsWidget
│           └── NotificationListItem (×5)
└── RoleSpecificWidgets (conditional)
    ├── ChairmanApprovals (if chairman)
    ├── SecretaryTasks (if secretary)
    └── AdminStatus (if admin)
```

---

## 8. State Management

```typescript
interface DashboardState {
  // Data
  boards: BoardCardProps[];
  stats: QuickStatsProps;
  meetings: UpcomingMeeting[];
  actionItems: ActionItem[];
  documents: RecentDocument[];
  notifications: Notification[];
  
  // Loading states
  isLoadingBoards: boolean;
  isLoadingStats: boolean;
  isLoadingMeetings: boolean;
  isLoadingActionItems: boolean;
  isLoadingDocuments: boolean;
  isLoadingNotifications: boolean;
  
  // Errors
  errors: Record<string, Error | null>;
}
```

---

## 9. Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Click board card | Card click | Navigate to `/meetings?board={boardId}` |
| Click meeting | List item click | Navigate to `/meetings/{meetingId}` |
| Join meeting | "Join" button | Navigate to `/meetings/{meetingId}/live` |
| Mark action done | Checkbox/button | API call, update list |
| View document | "View" button | Navigate to `/documents/{docId}/view` |
| Click notification | List item click | Navigate to link, mark as read |
| View all (any widget) | "View All" link | Navigate to respective index page |

---

## 10. Ant Design Components Used

| Component | Usage |
|-----------|-------|
| `Layout.Content` | Page container |
| `Row`, `Col` | Grid layout |
| `Card` | Widget containers |
| `Typography.Title` | Section headers |
| `Typography.Text` | Body text |
| `List`, `List.Item` | Item lists |
| `Avatar` | Board logos, user avatars |
| `Badge` | Notification indicators |
| `Tag` | Status tags |
| `Button` | Actions |
| `Statistic` | Quick stats numbers |
| `Skeleton` | Loading states |
| `Result` | Error states |
| `Empty` | Empty states |

---

## 11. File Structure

```
src/
├── pages/
│   └── Dashboard/
│       ├── index.tsx              # Main page component
│       ├── Dashboard.tsx          # Page layout
│       └── components/
│           ├── WelcomeHeader.tsx
│           ├── MyBoardsWidget.tsx
│           ├── BoardCard.tsx
│           ├── QuickStatsWidget.tsx
│           ├── UpcomingMeetingsWidget.tsx
│           ├── ActionItemsWidget.tsx
│           ├── RecentDocumentsWidget.tsx
│           ├── NotificationsWidget.tsx
│           └── RoleSpecificWidgets/
│               ├── ChairmanApprovals.tsx
│               ├── SecretaryTasks.tsx
│               └── AdminStatus.tsx
├── hooks/
│   └── useDashboard.ts            # Data fetching hook
└── services/
    └── dashboardService.ts        # API calls
```

---

**END OF DASHBOARD PAGE SPECIFICATION**
