# eBoard Component Specification

**Version**: 1.0  
**Last Updated**: January 2026  
**Technology**: React + TypeScript + Ant Design 5.x + TailwindCSS

---

## Table of Contents

1. [Layout Components](#1-layout-components)
2. [Navigation Components](#2-navigation-components)
3. [Data Display Components](#3-data-display-components)
4. [Form Components](#4-form-components)
5. [Feedback Components](#5-feedback-components)
6. [Specialized Components](#6-specialized-components)
7. [State Components](#7-state-components)

---

## 1. Layout Components

### 1.1 AppLayout

**Purpose**: Main application shell wrapping all authenticated pages

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (64px)                                                  │
│  [Logo] [Org Selector ▼] [🔍 Search...]        [🔔] [👤 Profile]│
├────────────┬────────────────────────────────────────────────────┤
│            │ ┌────────────────────────────────────────────────┐ │
│  SIDEBAR   │ │ [Board] [Audit] [Finance] [HR] ← Committee Tabs│ │
│  (themed)  │ └────────────────────────────────────────────────┘ │
│            │                                                    │
│  Dashboard │  Breadcrumbs: Home > Meetings                      │
│  Meetings  │  ───────────────────────────────────────────────── │
│  Documents │                                                    │
│  Agenda    │  Page Header: Meetings            [+ New Meeting]  │
│  Voting    │  ───────────────────────────────────────────────── │
│  Minutes   │                                                    │
│  Reports   │  [Filters/Search Bar]                              │
│  Admin     │                                                    │
│            │  ┌──────────────────────────────────────────────┐  │
│  (Menu     │  │                                              │  │
│  varies by │  │      Main Content                            │  │
│  board     │  │      (Table / Form / Cards / Grid)           │  │
│  type)     │  │                                              │  │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                    │
│            │  [Pagination or Action Buttons]                    │
└────────────┴────────────────────────────────────────────────────┘
```

**Key Layout Rules**:
- Committee Tabs appear **inside content area**, not in header
- Committee Tabs only visible when a board with committees is selected
- Sidebar colors change based on selected organization's branding
- Header contains: Logo, Org Selector, Search, Notifications, User Profile

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Page content |
| `sidebarCollapsed` | `boolean` | `false` | Sidebar collapsed state |
| `showFooter` | `boolean` | `false` | Show footer |

**Ant Design**: `Layout`, `Layout.Header`, `Layout.Sider`, `Layout.Content`

---

### 1.2 Header

**Purpose**: Top navigation bar with branding, organization selector, search, and user menu

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [≡] [KTDA Logo]  [KTDA Main Board ▼]  [🔍 Search...]  [🔔 5] [👤▼]│
└─────────────────────────────────────────────────────────────────┘
      │       │              │                │           │      │
      │       │              │                │           │      └─ User Profile Dropdown
      │       │              │                │           └─ Notifications
      │       │              │                └─ Global Search
      │       │              └─ Organization Selector
      │       └─ Dynamic Logo (changes per board)
      └─ Sidebar Toggle (mobile)
```

**Note**: Committee Tabs are NOT in the header. They appear in the content area.

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `string` | KTDA logo | Current board logo URL |
| `boardName` | `string` | required | Current board name |
| `notificationCount` | `number` | `0` | Unread notifications |
| `user` | `User` | required | Current user info |
| `onMenuToggle` | `() => void` | - | Toggle sidebar |
| `onBoardChange` | `(boardId) => void` | - | Board selection change |
| `onSearch` | `(query) => void` | - | Global search handler |

**Ant Design**: `Layout.Header`, `Space`, `Avatar`, `Badge`, `Dropdown`, `Input.Search`

---

### 1.3 Sidebar

**Purpose**: Main navigation menu with role-based visibility

**Structure**:
```
┌────────────────┐
│ 📊 Dashboard   │  ← Active (highlighted)
│ 📅 Meetings    │
│ 📄 Documents   │
│ � Notifications│
│ � Reports     │
│ ─────────────  │
│ � Users       │  ← Admin, Secretary only
│ 🏢 Boards      │  ← Admin, Secretary, Chairman
│ ⚙️ Settings    │  ← All users (personal)
│ 🔧 Admin       │  ← System Admin only
└────────────────┘
```

**Menu Items by Role**:

| Menu Item | All Users | Secretary | Chairman | System Admin |
|-----------|-----------|-----------|----------|--------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Meetings | ✓ | ✓ | ✓ | ✓ |
| Documents | ✓ | ✓ | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | ✓ | ✓ |
| Users | ✗ | ✓ | ✗ | ✓ |
| Boards | ✗ | ✓ | ✓ | ✓ |
| Settings | ✓ | ✓ | ✓ | ✓ |
| Admin | ✗ | ✗ | ✗ | ✓ |

**Note**: Agenda, Voting, Minutes, and Attendance are accessed via **Meeting Details tabs**, not sidebar.

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collapsed` | `boolean` | `false` | Collapsed state |
| `activeKey` | `string` | required | Current active menu |
| `userRole` | `string` | required | User role for menu filtering |
| `userPermissions` | `string[]` | `[]` | User permissions array |
| `onMenuClick` | `(key) => void` | - | Menu item click handler |

**Menu Configuration**:
```typescript
const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', roles: ['all'] },
  { key: 'meetings', icon: <CalendarOutlined />, label: 'Meetings', roles: ['all'] },
  { key: 'documents', icon: <FileOutlined />, label: 'Documents', roles: ['all'] },
  { key: 'notifications', icon: <BellOutlined />, label: 'Notifications', roles: ['all'] },
  { key: 'reports', icon: <BarChartOutlined />, label: 'Reports', roles: ['all'] },
  { type: 'divider' },
  { key: 'users', icon: <UserOutlined />, label: 'Users', roles: ['admin', 'secretary'] },
  { key: 'boards', icon: <BankOutlined />, label: 'Boards', roles: ['admin', 'secretary', 'chairman'] },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings', roles: ['all'] },
  { key: 'admin', icon: <ToolOutlined />, label: 'Admin', roles: ['admin'] },
];
```

**Ant Design**: `Layout.Sider`, `Menu`

---

### 1.4 PageHeader

**Purpose**: Page title, breadcrumbs, and primary actions

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Home / Meetings / Q1 Board Review                               │
│                                                                 │
│ Q1 Board Review                              [Edit] [+ Action]  │
│ KTDA Main Board • Scheduled • Feb 15, 2026                      │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Page title |
| `subtitle` | `string` | - | Optional subtitle |
| `breadcrumbs` | `Breadcrumb[]` | `[]` | Breadcrumb items |
| `actions` | `ReactNode` | - | Action buttons |
| `tags` | `Tag[]` | `[]` | Status tags |
| `backUrl` | `string` | - | Back button URL |

**Ant Design**: `PageHeader` (or custom), `Breadcrumb`, `Tag`, `Space`, `Button`

---

### 1.5 ContentCard

**Purpose**: Container for page sections

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Section Title                                    [Action Button] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Content goes here                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `extra` | `ReactNode` | - | Extra content (actions) |
| `children` | `ReactNode` | required | Card content |
| `loading` | `boolean` | `false` | Loading state |
| `bordered` | `boolean` | `true` | Show border |

**Ant Design**: `Card`

---

## 2. Navigation Components

### 2.1 OrganizationSelector

**Purpose**: Hierarchical dropdown to select board/subsidiary/factory context

**Structure**:
```
┌─────────────────────────────────┐
│ KTDA Main Board            ▼   │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ 🔍 Search boards...             │
├─────────────────────────────────┤
│ ⭐ KTDA Group (All)             │
├─────────────────────────────────┤
│ 🏛️ KTDA Main Board              │
├─────────────────────────────────┤
│ 🏢 Subsidiaries                 │
│   ├─ KETEPA Limited             │
│   ├─ Chai Trading Company       │
│   └─ ... (6 more)               │
├─────────────────────────────────┤
│ 🏭 Factories                    │
│   ├─ Zone 1 (12)                │
│   │   ├─ Chebut Factory         │
│   │   └─ ...                    │
│   ├─ Zone 2 (10)                │
│   └─ ... (more zones)           │
└─────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Selected board ID |
| `boards` | `BoardHierarchy` | required | Board hierarchy data |
| `onChange` | `(boardId) => void` | - | Selection change |
| `showAllOption` | `boolean` | `true` | Show "KTDA Group (All)" |
| `placeholder` | `string` | "Select board" | Placeholder text |

**Ant Design**: `TreeSelect` or custom `Dropdown` + `Tree`

**Data Structure**:
```typescript
interface BoardHierarchy {
  id: string;
  name: string;
  type: 'main' | 'subsidiary' | 'factory' | 'group';
  zone?: string;
  logo?: string;
  children?: BoardHierarchy[];
}
```

---

### 2.2 CommitteeTabs

**Purpose**: Horizontal tabs to switch between board and its committees

**Location**: First element inside Content Area (NOT in header)

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [Board]  [Audit Committee]  [HR Committee]  [Nomination Comm.]  │
│    ▲                                                            │
│ active                                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Visibility Rules**:
- Only visible when selected organization has committees
- Hidden for: KTDA Group (All), All Factories, Zone views, individual factories
- Visible for: Main Board, Subsidiaries with committees

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `boardName` | `string` | required | Parent board name |
| `committees` | `Committee[]` | `[]` | List of committees |
| `activeKey` | `string` | "board" | Active tab key |
| `onChange` | `(key) => void` | - | Tab change handler |
| `visible` | `boolean` | `true` | Show/hide tabs |

**Ant Design**: `Tabs`

**Placement in Layout**:
```jsx
<Layout.Content>
  {/* Committee Tabs - FIRST element in content */}
  {currentOrg.committees?.length > 0 && (
    <CommitteeTabs 
      boardName={currentOrg.name}
      committees={currentOrg.committees}
      activeKey={activeCommittee}
      onChange={setActiveCommittee}
    />
  )}
  
  {/* Then Breadcrumbs */}
  <Breadcrumb items={breadcrumbItems} />
  
  {/* Then Page Header */}
  <PageHeader title="Page Title" />
  
  {/* Then Page Content */}
  {children}
</Layout.Content>
```

**Data Structure**:
```typescript
interface Committee {
  id: string;
  name: string;
  shortName?: string;
  memberCount: number;
}
```

---

### 2.3 TabNavigation

**Purpose**: Generic tab navigation for index pages

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [All]  [Active]  [Inactive]  [By Board ▼]  [By Role ▼]          │
│   ▲                                                             │
│ active (with count badge)                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabItem[]` | required | Tab definitions |
| `activeKey` | `string` | required | Active tab |
| `onChange` | `(key) => void` | - | Tab change |

**Ant Design**: `Tabs` or `Radio.Group` with button style

**Data Structure**:
```typescript
interface TabItem {
  key: string;
  label: string;
  count?: number;
  dropdown?: DropdownItem[];
}
```

---

## 3. Data Display Components

### 3.1 DataTable

**Purpose**: Reusable table with search, filters, pagination, and bulk actions

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Search: [__________________] [🔍]    [Filter ▼]  [Export ▼]     │
├─────────────────────────────────────────────────────────────────┤
│ ☑ │ Name          │ Email           │ Role    │ Status │ Actions│
│ ──┼───────────────┼─────────────────┼─────────┼────────┼────────│
│ ☐ │ John Kamau    │ john@ktda.co.ke │ Member  │ Active │ ••• ▼  │
│ ☐ │ Mary Wanjiku  │ mary@ktda.co.ke │ Secr.   │ Active │ ••• ▼  │
├─────────────────────────────────────────────────────────────────┤
│ Showing 1-20 of 350                           [< 1 2 3 ... >]   │
└─────────────────────────────────────────────────────────────────┘

When items selected:
┌─────────────────────────────────────────────────────────────────┐
│ ☑ 5 selected    [Export] [Email] [Deactivate]              [×]  │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | required | Column definitions |
| `dataSource` | `any[]` | required | Table data |
| `loading` | `boolean` | `false` | Loading state |
| `pagination` | `PaginationConfig` | - | Pagination config |
| `rowSelection` | `boolean` | `false` | Enable row selection |
| `onSearch` | `(value) => void` | - | Search handler |
| `filters` | `Filter[]` | `[]` | Filter definitions |
| `bulkActions` | `BulkAction[]` | `[]` | Bulk action buttons |
| `onRowClick` | `(record) => void` | - | Row click handler |
| `exportOptions` | `ExportOption[]` | `[]` | Export formats |

**Ant Design**: `Table`, `Input.Search`, `Select`, `Dropdown`, `Pagination`

**Data Structure**:
```typescript
interface Column {
  key: string;
  title: string;
  dataIndex: string;
  sortable?: boolean;
  render?: (value, record) => ReactNode;
  width?: number | string;
}

interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick: (selectedRows) => void;
}
```

---

### 3.2 StatCard

**Purpose**: Display key metrics on dashboards

**Structure**:
```
┌─────────────────┐
│ Upcoming        │
│ Meetings        │
│                 │
│      12         │
│   ↑ 3 this week │
└─────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Metric label |
| `value` | `number \| string` | required | Metric value |
| `prefix` | `ReactNode` | - | Icon or prefix |
| `suffix` | `string` | - | Unit suffix |
| `trend` | `{ value: number, direction: 'up' \| 'down' }` | - | Trend indicator |
| `onClick` | `() => void` | - | Click handler |
| `loading` | `boolean` | `false` | Loading state |

**Ant Design**: `Card`, `Statistic`

---

### 3.3 StatusBadge

**Purpose**: Display status with color coding

**Variants**:
```
[● Active]     - Green
[● Inactive]   - Gray
[● Pending]    - Orange
[● Completed]  - Blue
[● Cancelled]  - Red
[● Draft]      - Default
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | required | Status value |
| `type` | `'dot' \| 'tag'` | `'tag'` | Display type |
| `size` | `'small' \| 'default'` | `'default'` | Size |

**Ant Design**: `Tag`, `Badge`

**Status Color Map**:
```typescript
const statusColors = {
  active: 'green',
  inactive: 'default',
  pending: 'orange',
  completed: 'blue',
  cancelled: 'red',
  draft: 'default',
  scheduled: 'cyan',
  in_progress: 'processing',
  approved: 'green',
  rejected: 'red',
};
```

---

### 3.4 UserAvatar

**Purpose**: Display user with avatar and name

**Structure**:
```
[👤] John Kamau
     john@ktda.co.ke
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `User` | required | User object |
| `showEmail` | `boolean` | `false` | Show email |
| `showRole` | `boolean` | `false` | Show role badge |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | Avatar size |
| `onClick` | `() => void` | - | Click handler |

**Ant Design**: `Avatar`, `Space`, `Typography.Text`

---

### 3.5 BoardCard

**Purpose**: Display board/committee info in card format

**Structure**:
```
┌─────────────────────────────────────────┐
│ [Logo]  KTDA Main Board                 │
│         Main Board • 15 members         │
│                                         │
│ Compliance: ████████░░ 85%              │
│ Next Meeting: Feb 15, 2026              │
│                                    [→]  │
└─────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `board` | `Board` | required | Board data |
| `showCompliance` | `boolean` | `true` | Show compliance bar |
| `showNextMeeting` | `boolean` | `true` | Show next meeting |
| `onClick` | `() => void` | - | Click handler |

**Ant Design**: `Card`, `Progress`, `Avatar`, `Space`

---

### 3.6 MeetingCard

**Purpose**: Display meeting summary in card format

**Structure**:
```
┌─────────────────────────────────────────┐
│ Q1 Board Review              [Scheduled]│
│ KTDA Main Board                         │
│                                         │
│ 📅 Feb 15, 2026 • 10:00 AM - 12:00 PM   │
│ 📍 Virtual (Jitsi)                      │
│ 👥 12 of 15 confirmed                   │
│                                         │
│ [View Details]              [Join Call] │
└─────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `meeting` | `Meeting` | required | Meeting data |
| `showBoard` | `boolean` | `true` | Show board name |
| `showActions` | `boolean` | `true` | Show action buttons |
| `compact` | `boolean` | `false` | Compact mode |

**Ant Design**: `Card`, `Tag`, `Space`, `Button`

---

### 3.7 DocumentCard

**Purpose**: Display document with preview and actions

**Structure**:
```
┌─────────────────────────────────────────┐
│ [PDF]  Q4 Financial Report.pdf          │
│        2.5 MB • Uploaded Jan 10, 2026   │
│        By: Mary Wanjiku                 │
│                                         │
│        [View] [Download] [•••]          │
└─────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `document` | `Document` | required | Document data |
| `showUploader` | `boolean` | `true` | Show uploader |
| `actions` | `Action[]` | `['view', 'download']` | Available actions |
| `onView` | `() => void` | - | View handler |
| `onDownload` | `() => void` | - | Download handler |

**Ant Design**: `Card`, `Space`, `Button`, `Dropdown`

---

### 3.8 TimelineItem

**Purpose**: Display activity/history items

**Structure**:
```
● 10:30 AM  John Kamau joined the meeting
│
● 10:32 AM  Agenda item 1 started
│           "Opening and Welcome"
│
● 10:45 AM  Vote opened: Budget Approval
│           [View Results]
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineEvent[]` | required | Timeline events |
| `mode` | `'left' \| 'right' \| 'alternate'` | `'left'` | Layout mode |

**Ant Design**: `Timeline`

---

## 4. Form Components

### 4.1 FormSection

**Purpose**: Group related form fields with title

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Meeting Details                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Title *                                                         │
│ [Q1 Board Review                                            ]   │
│                                                                 │
│ Date *                        Time *                            │
│ [Feb 15, 2026      📅]       [10:00 AM ▼] to [12:00 PM ▼]      │
│                                                                 │
│ Location                                                        │
│ ○ Virtual  ● Physical  ○ Hybrid                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Section title |
| `description` | `string` | - | Section description |
| `children` | `ReactNode` | required | Form fields |
| `collapsible` | `boolean` | `false` | Allow collapse |

**Ant Design**: `Card`, `Form`, `Divider`

---

### 4.2 SearchInput

**Purpose**: Search input with icon and clear button

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Search value |
| `placeholder` | `string` | "Search..." | Placeholder |
| `onChange` | `(value) => void` | - | Change handler |
| `onSearch` | `(value) => void` | - | Search submit |
| `loading` | `boolean` | `false` | Loading state |
| `allowClear` | `boolean` | `true` | Show clear button |

**Ant Design**: `Input.Search`

---

### 4.3 FilterDropdown

**Purpose**: Dropdown with filter options

**Structure**:
```
[Filter ▼]
    │
    ▼
┌─────────────────────┐
│ Status              │
│ [All ▼]             │
│                     │
│ Board Type          │
│ [All ▼]             │
│                     │
│ Date Range          │
│ [Last 30 days ▼]    │
│                     │
│ [Reset] [Apply]     │
└─────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `FilterConfig[]` | required | Filter definitions |
| `values` | `Record<string, any>` | `{}` | Current values |
| `onChange` | `(values) => void` | - | Change handler |
| `onReset` | `() => void` | - | Reset handler |

**Ant Design**: `Dropdown`, `Form`, `Select`, `DatePicker`

---

### 4.4 DateRangePicker

**Purpose**: Select date range with presets

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `[Date, Date]` | - | Selected range |
| `onChange` | `(range) => void` | - | Change handler |
| `presets` | `Preset[]` | default presets | Quick select options |
| `format` | `string` | "DD/MM/YYYY" | Date format |

**Presets**:
- Today
- Last 7 days
- Last 30 days
- This month
- Last month
- This quarter
- This year

**Ant Design**: `DatePicker.RangePicker`

---

### 4.5 FileUpload

**Purpose**: Upload files with drag-and-drop

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     📁 Drag files here or click to upload                       │
│                                                                 │
│     Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX            │
│     Max size: 50MB                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Uploaded:
┌─────────────────────────────────────────────────────────────────┐
│ [PDF] Q4_Report.pdf                    2.5 MB    [×]            │
│ [DOC] Meeting_Notes.docx               1.2 MB    [×]            │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `File[]` | `[]` | Uploaded files |
| `onChange` | `(files) => void` | - | Change handler |
| `accept` | `string` | - | Accepted file types |
| `maxSize` | `number` | 50MB | Max file size |
| `maxCount` | `number` | - | Max file count |
| `multiple` | `boolean` | `true` | Allow multiple |

**Ant Design**: `Upload`, `Upload.Dragger`

---

### 4.6 RichTextEditor

**Purpose**: WYSIWYG editor for minutes, descriptions

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [B] [I] [U] [S] │ [H1] [H2] │ [•] [1.] │ [🔗] [📷] │ [</>]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ The board discussed the following items:                        │
│                                                                 │
│ 1. Q4 Financial Review                                          │
│    - Revenue exceeded targets by 15%                            │
│    - Operating costs reduced by 8%                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | HTML content |
| `onChange` | `(html) => void` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `minHeight` | `number` | 200 | Minimum height |

**Library**: TinyMCE, Quill, or React-Quill

---

### 4.7 MemberSelector

**Purpose**: Select users/members with search and multi-select

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [🔍 Search members...]                                          │
├─────────────────────────────────────────────────────────────────┤
│ Selected (3):                                                   │
│ [👤 John Kamau ×] [👤 Mary Wanjiku ×] [👤 Peter Ochieng ×]      │
├─────────────────────────────────────────────────────────────────┤
│ Available:                                                      │
│ ☐ [👤] Jane Muthoni - Board Member                              │
│ ☐ [👤] James Mwangi - Board Member                              │
│ ☐ [👤] Grace Akinyi - Observer                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[]` | `[]` | Selected user IDs |
| `options` | `User[]` | required | Available users |
| `onChange` | `(userIds) => void` | - | Change handler |
| `multiple` | `boolean` | `true` | Allow multiple |
| `showRole` | `boolean` | `true` | Show user roles |
| `filterByBoard` | `string` | - | Filter by board ID |

**Ant Design**: `Select` with mode="multiple", custom option render

---

## 5. Feedback Components

### 5.1 ConfirmModal

**Purpose**: Confirmation dialog for destructive actions

**Structure**:
```
┌─────────────────────────────────────────┐
│ ⚠️ Cancel Meeting?                       │
├─────────────────────────────────────────┤
│                                         │
│ Are you sure you want to cancel         │
│ "Q1 Board Review"?                      │
│                                         │
│ This will notify all 15 participants.   │
│                                         │
│              [Cancel]  [Yes, Cancel It] │
└─────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Visibility |
| `title` | `string` | required | Modal title |
| `message` | `string \| ReactNode` | required | Confirmation message |
| `confirmText` | `string` | "Confirm" | Confirm button text |
| `cancelText` | `string` | "Cancel" | Cancel button text |
| `danger` | `boolean` | `false` | Danger styling |
| `onConfirm` | `() => void` | - | Confirm handler |
| `onCancel` | `() => void` | - | Cancel handler |
| `loading` | `boolean` | `false` | Loading state |

**Ant Design**: `Modal.confirm` or custom `Modal`

---

### 5.2 FormDrawer

**Purpose**: Side drawer for create/edit forms

**Structure**:
```
                              ┌─────────────────────────────────┐
                              │ Create Meeting              [×] │
                              ├─────────────────────────────────┤
                              │                                 │
                              │ Title *                         │
                              │ [                           ]   │
                              │                                 │
                              │ Date *                          │
                              │ [                      📅]      │
                              │                                 │
                              │ ... more fields ...             │
                              │                                 │
                              ├─────────────────────────────────┤
                              │        [Cancel]  [Create]       │
                              └─────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Visibility |
| `title` | `string` | required | Drawer title |
| `width` | `number \| string` | 500 | Drawer width |
| `children` | `ReactNode` | required | Form content |
| `onClose` | `() => void` | - | Close handler |
| `footer` | `ReactNode` | - | Footer buttons |
| `loading` | `boolean` | `false` | Loading state |

**Ant Design**: `Drawer`

---

### 5.3 NotificationDropdown

**Purpose**: Notification bell with dropdown list

**Structure**:
```
[🔔 5]
   │
   ▼
┌─────────────────────────────────────────┐
│ Notifications                      [⚙️] │
├─────────────────────────────────────────┤
│ 🔵 [Main Board] New document uploaded   │
│    Q4 Financial Report.pdf              │
│    2 minutes ago                        │
├─────────────────────────────────────────┤
│ 🔵 [Audit] Meeting starts in 1 hour     │
│    Q4 Audit Review                      │
│    58 minutes ago                       │
├─────────────────────────────────────────┤
│ ○  [KETEPA] Minutes published           │
│    January Board Meeting                │
│    Yesterday                            │
├─────────────────────────────────────────┤
│ [View All Notifications]                │
└─────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `Notification[]` | `[]` | Notification list |
| `unreadCount` | `number` | `0` | Unread count |
| `onNotificationClick` | `(notification) => void` | - | Click handler |
| `onMarkAllRead` | `() => void` | - | Mark all read |
| `onViewAll` | `() => void` | - | View all handler |

**Ant Design**: `Badge`, `Dropdown`, `List`

---

### 5.4 Toast

**Purpose**: Brief feedback messages

**Variants**:
```
✓ Meeting created successfully
⚠ Document upload failed. Please try again.
ℹ Your session will expire in 5 minutes
✗ Error: Unable to connect to server
```

**Usage**: Use Ant Design's `message` API

```typescript
message.success('Meeting created successfully');
message.error('Document upload failed');
message.warning('Session expiring soon');
message.info('Document is being processed');
```

**Ant Design**: `message`

---

## 6. Specialized Components

### 6.1 VotePanel

**Purpose**: Display vote options and cast vote

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Budget Approval for Q1 2026                          [Open]     │
│ Proposed by: Chairman • Opened: 10:45 AM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Do you approve the proposed Q1 2026 budget of KES 50M?          │
│                                                                 │
│ ○ Yes, I approve                                                │
│ ○ No, I do not approve                                          │
│ ○ Abstain                                                       │
│                                                                 │
│                                              [Submit Vote]      │
├─────────────────────────────────────────────────────────────────┤
│ Votes cast: 8 of 12 (67%)    Quorum: 50% ✓                      │
│ ████████████░░░░░░░░                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `vote` | `Vote` | required | Vote data |
| `userVote` | `string \| null` | `null` | User's current vote |
| `onVote` | `(option) => void` | - | Vote handler |
| `showResults` | `boolean` | `false` | Show live results |
| `disabled` | `boolean` | `false` | Disable voting |

**Ant Design**: `Card`, `Radio.Group`, `Progress`, `Button`

---

### 6.2 VoteResults

**Purpose**: Display vote results with chart

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Vote Results: Budget Approval                        [Passed ✓] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Yes        ████████████████████░░░░░░░░░░  10 (67%)             │
│ No         ████░░░░░░░░░░░░░░░░░░░░░░░░░░   3 (20%)             │
│ Abstain    ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░   2 (13%)             │
│                                                                 │
│ Total votes: 15 of 15 (100%)                                    │
│ Threshold: Simple Majority (>50%) ✓                             │
├─────────────────────────────────────────────────────────────────┤
│ [View Vote Details]                          [Export Results]   │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `vote` | `Vote` | required | Vote with results |
| `showVoters` | `boolean` | `false` | Show who voted what |
| `onExport` | `() => void` | - | Export handler |

**Ant Design**: `Card`, `Progress`, `Tag`

---

### 6.3 AgendaList

**Purpose**: Display and manage agenda items

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ AGENDA                                          [+ Add Item]    │
├─────────────────────────────────────────────────────────────────┤
│ ≡ 1. Opening and Welcome                    5 min    [Completed]│
│      Presenter: Chairman                                        │
├─────────────────────────────────────────────────────────────────┤
│ ≡ 2. Confirmation of Previous Minutes      10 min   [In Progress]│
│      📄 Minutes_Dec_2025.pdf                                    │
├─────────────────────────────────────────────────────────────────┤
│ ≡ 3. Financial Report                      30 min    [Pending]  │
│      Presenter: CFO                                             │
│      📄 Q4_Financial_Report.pdf                                 │
│      🗳️ Budget Approval Vote                                    │
├─────────────────────────────────────────────────────────────────┤
│ ≡ 4. Any Other Business                    15 min    [Pending]  │
├─────────────────────────────────────────────────────────────────┤
│ ≡ 5. Closing                                5 min    [Pending]  │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AgendaItem[]` | required | Agenda items |
| `editable` | `boolean` | `false` | Allow editing |
| `draggable` | `boolean` | `false` | Allow reordering |
| `onReorder` | `(items) => void` | - | Reorder handler |
| `onItemClick` | `(item) => void` | - | Item click |
| `onAddItem` | `() => void` | - | Add item handler |
| `activeItem` | `string` | - | Currently active item |

**Ant Design**: `List`, `Tag`, custom drag-and-drop

---

### 6.4 AttendanceList

**Purpose**: Display meeting attendance with status

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ATTENDANCE                              Quorum: 8/15 (53%) ✓    │
├─────────────────────────────────────────────────────────────────┤
│ [👤] John Kamau       Chairman      [Present ▼]    10:00 AM    │
│ [👤] Mary Wanjiku     Secretary     [Present ▼]    10:02 AM    │
│ [👤] Peter Ochieng    Member        [Present ▼]    10:05 AM    │
│ [👤] Jane Muthoni     Member        [Absent ▼]     -           │
│ [👤] James Mwangi     Member        [Apology ▼]    -           │
│      Reason: Medical appointment                                │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attendees` | `Attendee[]` | required | Attendee list |
| `quorumRequired` | `number` | - | Quorum percentage |
| `editable` | `boolean` | `false` | Allow status change |
| `onStatusChange` | `(userId, status) => void` | - | Status change |
| `showJoinTime` | `boolean` | `true` | Show join times |

**Ant Design**: `List`, `Select`, `Tag`, `Progress`

---

### 6.5 QuorumIndicator

**Purpose**: Show quorum status

**Structure**:
```
Quorum: 8/15 (53%)  ✓ Met
████████████████░░░░░░░░░░░░░░
        ▲
     Required: 50%
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `present` | `number` | required | Present count |
| `total` | `number` | required | Total members |
| `required` | `number` | 50 | Required percentage |
| `size` | `'small' \| 'default'` | `'default'` | Size |

**Ant Design**: `Progress`, `Tag`

---

### 6.6 ActionItemCard

**Purpose**: Display action item with status and assignee

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ☐ Prepare Q1 budget proposal                         [Overdue]  │
│   Assigned to: John Kamau                                       │
│   Due: Jan 15, 2026 (3 days overdue)                            │
│   From: Main Board - Q4 Review Meeting                          │
│                                                                 │
│   [Mark Complete]  [Edit]  [Reassign]                           │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actionItem` | `ActionItem` | required | Action item data |
| `onComplete` | `() => void` | - | Complete handler |
| `onEdit` | `() => void` | - | Edit handler |
| `showSource` | `boolean` | `true` | Show meeting source |

**Ant Design**: `Card`, `Checkbox`, `Tag`, `Space`

---

## 7. State Components

### 7.1 EmptyState

**Purpose**: Display when no data available

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         📅                                      │
│                                                                 │
│              No upcoming meetings                               │
│                                                                 │
│     You don't have any meetings scheduled.                      │
│     Create a new meeting to get started.                        │
│                                                                 │
│                   [+ Create Meeting]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | Empty state icon |
| `title` | `string` | required | Title text |
| `description` | `string` | - | Description text |
| `action` | `ReactNode` | - | Action button |

**Ant Design**: `Empty`, `Button`

---

### 7.2 LoadingState

**Purpose**: Display while loading data

**Variants**:
- **Full page**: Centered spinner with text
- **Card**: Skeleton loading
- **Table**: Row skeletons
- **Inline**: Small spinner

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'spinner' \| 'skeleton'` | `'spinner'` | Loading type |
| `text` | `string` | "Loading..." | Loading text |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | Size |

**Ant Design**: `Spin`, `Skeleton`

---

### 7.3 ErrorState

**Purpose**: Display error messages

**Structure**:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         ⚠️                                      │
│                                                                 │
│              Something went wrong                               │
│                                                                 │
│     We couldn't load the meeting data.                          │
│     Please try again or contact support.                        │
│                                                                 │
│                   [Try Again]  [Go Back]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | "Something went wrong" | Error title |
| `message` | `string` | - | Error message |
| `onRetry` | `() => void` | - | Retry handler |
| `onBack` | `() => void` | - | Back handler |

**Ant Design**: `Result`

---

## Component File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── PageHeader.tsx
│   │   └── ContentCard.tsx
│   ├── navigation/
│   │   ├── OrganizationSelector.tsx
│   │   ├── CommitteeTabs.tsx
│   │   └── TabNavigation.tsx
│   ├── data-display/
│   │   ├── DataTable.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── UserAvatar.tsx
│   │   ├── BoardCard.tsx
│   │   ├── MeetingCard.tsx
│   │   ├── DocumentCard.tsx
│   │   └── TimelineItem.tsx
│   ├── forms/
│   │   ├── FormSection.tsx
│   │   ├── SearchInput.tsx
│   │   ├── FilterDropdown.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── FileUpload.tsx
│   │   ├── RichTextEditor.tsx
│   │   └── MemberSelector.tsx
│   ├── feedback/
│   │   ├── ConfirmModal.tsx
│   │   ├── FormDrawer.tsx
│   │   └── NotificationDropdown.tsx
│   ├── specialized/
│   │   ├── VotePanel.tsx
│   │   ├── VoteResults.tsx
│   │   ├── AgendaList.tsx
│   │   ├── AttendanceList.tsx
│   │   ├── QuorumIndicator.tsx
│   │   └── ActionItemCard.tsx
│   └── states/
│       ├── EmptyState.tsx
│       ├── LoadingState.tsx
│       └── ErrorState.tsx
└── index.ts
```

---

## Summary

| Category | Components | Count |
|----------|------------|-------|
| Layout | AppLayout, Header, Sidebar, PageHeader, ContentCard | 5 |
| Navigation | OrganizationSelector, CommitteeTabs, TabNavigation | 3 |
| Data Display | DataTable, StatCard, StatusBadge, UserAvatar, BoardCard, MeetingCard, DocumentCard, TimelineItem | 8 |
| Forms | FormSection, SearchInput, FilterDropdown, DateRangePicker, FileUpload, RichTextEditor, MemberSelector | 7 |
| Feedback | ConfirmModal, FormDrawer, NotificationDropdown, Toast | 4 |
| Specialized | VotePanel, VoteResults, AgendaList, AttendanceList, QuorumIndicator, ActionItemCard | 6 |
| States | EmptyState, LoadingState, ErrorState | 3 |
| **Total** | | **36** |

---

**END OF COMPONENT SPECIFICATION**
