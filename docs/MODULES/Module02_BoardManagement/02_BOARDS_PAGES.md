# Module 2: Board Management - Page Specifications

**Module**: Board Management  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Table of Contents

1. [Boards Index Page](#1-boards-index-page)
2. [Board Hierarchy Page](#2-board-hierarchy-page)
3. [Create Board Page](#3-create-board-page)
4. [Board Details Page](#4-board-details-page)
5. [Edit Board Page](#5-edit-board-page)
6. [Board Branding Page](#6-board-branding-page)
7. [Create Committee Page](#7-create-committee-page)
8. [Committee Details Page](#8-committee-details-page)
9. [Import Boards Page](#9-import-boards-page)

---

## 1. Boards Index Page

**Route**: `/boards`  
**Access**: System Admin, Board Secretary, Chairman  
**Purpose**: Browse, search, and filter all boards and committees

### 1.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  BOARDS                                        [+ New Board]  │
│            │  ───────────────────────────────────────────────────────────   │
│  Dashboard │                                                                │
│  Meetings  │  [All] [Main Board] [Subsidiaries] [Factories] [Committees]   │
│  Documents │  ───────────────────────────────────────────────────────────   │
│  Notific.  │                                                                │
│  Reports   │  Search: [____________________] [🔍]   Zone: [All ▼]          │
│  ─────     │  ───────────────────────────────────────────────────────────   │
│  Users     │                                                                │
│  Boards ●  │  ┌─────────────────────────────────────────────────────────┐  │
│  Settings  │  │ Board Name       │ Type      │ Members │ Status │ Compl.│  │
│  Admin     │  ├──────────────────┼───────────┼─────────┼────────┼───────┤  │
│            │  │ ▼ KTDA Main Board│ Main      │ 15      │ Active │ ✓ 100%│  │
│            │  │   ├─ Audit Comm. │ Committee │ 5       │ Active │ ✓ 100%│  │
│            │  │   ├─ HR Committee│ Committee │ 6       │ Active │ ⚠ 83% │  │
│            │  │   └─ Finance Comm│ Committee │ 5       │ Active │ ✓ 100%│  │
│            │  │ KETEPA Limited   │ Subsidiary│ 8       │ Active │ ✓ 100%│  │
│            │  │ Chai Trading Co. │ Subsidiary│ 7       │ Active │ ✓ 92% │  │
│            │  │ Chebut Factory   │ Factory   │ 7       │ Active │ ⚠ 75% │  │
│            │  │ Kapkatet Factory │ Factory   │ 6       │ Active │ ✓ 100%│  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  Showing 1-20 of 90 boards/committees    [< 1 2 3 4 5 >]      │
│            │                                                                │
│            │  [📊 Hierarchy View]  [📥 Import Factories]                   │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 1.2 Components

| Component | Ant Design | Props/Config |
|-----------|------------|--------------|
| Page Header | `PageHeader` | title="Boards", extra=[NewBoardButton] |
| Filter Tabs | `Tabs` | items=[All, Main, Subsidiaries, Factories, Committees] |
| Search Bar | `Input.Search` | placeholder="Search boards..." |
| Zone Filter | `Select` | options=[All, Zone 1-7] |
| Boards Table | `Table` | expandable, pagination |
| Type Tag | `Tag` | color by type |
| Status Badge | `Badge` | status={active ? 'success' : 'default'} |
| Compliance | `Progress` | type="circle", size="small" |
| Actions | `Dropdown` | items=[View, Edit, Settings] |

### 1.3 Table Columns

```typescript
const columns: ColumnsType<Board> = [
  {
    title: 'Board Name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (name, record) => (
      <Space>
        {record.logo && <Avatar src={record.logo} size="small" />}
        <span style={{ fontWeight: record.type === 'main' ? 600 : 400 }}>
          {name}
        </span>
      </Space>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    filters: typeFilters,
    render: (type) => (
      <Tag color={typeColors[type]}>{type}</Tag>
    ),
  },
  {
    title: 'Members',
    dataIndex: 'memberCount',
    key: 'members',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
    render: (status) => (
      <Badge status={status === 'active' ? 'success' : 'default'} text={status} />
    ),
  },
  {
    title: 'Compliance',
    dataIndex: 'compliance',
    key: 'compliance',
    sorter: true,
    render: (value) => (
      <Progress 
        type="circle" 
        percent={value} 
        size={32}
        status={value >= 90 ? 'success' : value >= 70 ? 'normal' : 'exception'}
      />
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Dropdown menu={{ items: getActionItems(record) }}>
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    ),
  },
];
```

### 1.4 Expandable Rows (Committees)

```typescript
const expandedRowRender = (board: Board) => {
  if (!board.committees?.length) return null;
  
  return (
    <Table
      columns={committeeColumns}
      dataSource={board.committees}
      pagination={false}
      size="small"
      showHeader={false}
    />
  );
};
```

### 1.5 State Management

```typescript
interface BoardsIndexState {
  // Data
  boards: Board[];
  totalCount: number;
  
  // Filters
  activeTab: 'all' | 'main' | 'subsidiaries' | 'factories' | 'committees';
  searchQuery: string;
  selectedZone: string | null;
  statusFilter: 'all' | 'active' | 'inactive';
  complianceFilter: 'all' | 'compliant' | 'warning' | 'non-compliant';
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Expansion
  expandedRowKeys: string[];
  
  // Loading
  isLoading: boolean;
}
```

### 1.6 API Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| List boards | `GET /api/boards` | GET |
| Filter by type | `GET /api/boards?type={type}` | GET |
| Filter by zone | `GET /api/boards?zone={zone}` | GET |
| Search boards | `GET /api/boards?search={query}` | GET |
| Get board with committees | `GET /api/boards/:id?include=committees` | GET |

---

## 2. Board Hierarchy Page

**Route**: `/boards/hierarchy`  
**Access**: System Admin, Board Secretary, Chairman  
**Purpose**: Visual tree view of all boards and committees

### 2.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Boards                                             │
│            │                                                                │
│            │  BOARD HIERARCHY                                               │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  Search: [____________________] [🔍]   [Expand All] [Collapse] │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  🏢 KTDA Group                                          │  │
│            │  │  │                                                       │  │
│            │  │  ├── 🏛️ KTDA Main Board (15 members) ✓                  │  │
│            │  │  │   ├── 📋 Nomination Committee (4)                    │  │
│            │  │  │   ├── 📋 HR Committee (5)                            │  │
│            │  │  │   ├── 📋 Sales & Marketing Committee (6)             │  │
│            │  │  │   └── 📋 Audit Committee (5) ✓                       │  │
│            │  │  │                                                       │  │
│            │  │  ├── 🏢 Subsidiaries (8)                                │  │
│            │  │  │   ├── KETEPA Limited (8) ✓                           │  │
│            │  │  │   │   └── 📋 KETEPA Audit Committee (3)              │  │
│            │  │  │   ├── Chai Trading Company (7) ✓                     │  │
│            │  │  │   ├── KTDA MS Limited (6) ✓                          │  │
│            │  │  │   └── ... (5 more)                                   │  │
│            │  │  │                                                       │  │
│            │  │  └── 🏭 Factories by Zone (69)                          │  │
│            │  │      ├── Zone 1 (12 factories)                          │  │
│            │  │      │   ├── Chebut Factory (7) ✓                       │  │
│            │  │      │   ├── Kapkatet Factory (6) ✓                     │  │
│            │  │      │   └── ... (10 more)                              │  │
│            │  │      ├── Zone 2 (10 factories)                          │  │
│            │  │      └── ... (5 more zones)                             │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  Legend: ✓ Compliant  ⚠ Warning  ✗ Non-Compliant              │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 2.2 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Tree | `Tree` | Hierarchical display |
| Search | `Input.Search` | Filter tree nodes |
| Expand/Collapse | `Button` | Toggle all nodes |
| Tree Node | Custom | Board info with status |
| Legend | `Space` + `Tag` | Status indicators |

### 2.3 Tree Data Structure

```typescript
interface TreeNode {
  key: string;
  title: ReactNode;
  icon?: ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  selectable?: boolean;
}

const buildTreeData = (boards: Board[]): TreeNode[] => {
  return [
    {
      key: 'ktda-group',
      title: 'KTDA Group',
      icon: <BankOutlined />,
      children: [
        {
          key: 'main-board',
          title: renderBoardNode(mainBoard),
          icon: <CrownOutlined />,
          children: mainBoard.committees.map(c => ({
            key: c.id,
            title: renderCommitteeNode(c),
            icon: <TeamOutlined />,
            isLeaf: true,
          })),
        },
        {
          key: 'subsidiaries',
          title: `Subsidiaries (${subsidiaries.length})`,
          icon: <BankOutlined />,
          children: subsidiaries.map(s => ({
            key: s.id,
            title: renderBoardNode(s),
            children: s.committees?.map(c => ({
              key: c.id,
              title: renderCommitteeNode(c),
              isLeaf: true,
            })),
          })),
        },
        {
          key: 'factories',
          title: `Factories by Zone (${factories.length})`,
          icon: <ShopOutlined />,
          children: zones.map(zone => ({
            key: `zone-${zone.id}`,
            title: `${zone.name} (${zone.factories.length} factories)`,
            children: zone.factories.map(f => ({
              key: f.id,
              title: renderBoardNode(f),
              isLeaf: true,
            })),
          })),
        },
      ],
    },
  ];
};
```

### 2.4 Tree Node Renderer

```typescript
const renderBoardNode = (board: Board) => (
  <Space>
    <span>{board.name}</span>
    <Badge count={board.memberCount} showZero style={{ backgroundColor: '#52c41a' }} />
    {board.compliance >= 90 && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
    {board.compliance >= 70 && board.compliance < 90 && <WarningOutlined style={{ color: '#faad14' }} />}
    {board.compliance < 70 && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
  </Space>
);
```

### 2.5 Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Click node | Tree node click | Navigate to board/committee details |
| Search | Type in search | Filter and highlight matching nodes |
| Expand All | Button click | Expand all tree nodes |
| Collapse All | Button click | Collapse all tree nodes |

---

## 3. Create Board Page

**Route**: `/boards/create`  
**Access**: System Admin  
**Purpose**: Create new board (Main, Subsidiary, or Factory)

### 3.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Boards                                             │
│            │                                                                │
│            │  CREATE NEW BOARD                                              │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─ BOARD TYPE ────────────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Select board type:                                     │  │
│            │  │                                                         │  │
│            │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │  │
│            │  │  │ 🏛️ Main     │ │ 🏢 Subsidiary│ │ 🏭 Factory  │       │  │
│            │  │  │ Board       │ │             │ │             │       │  │
│            │  │  │ (disabled)  │ │ ● Selected  │ │             │       │  │
│            │  │  └─────────────┘ └─────────────┘ └─────────────┘       │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ BASIC INFORMATION ─────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Board Name *       [_______________________________]  │  │
│            │  │                                                         │  │
│            │  │  Zone *             [Zone 1                        ▼]  │  │
│            │  │  (Factory only)                                         │  │
│            │  │                                                         │  │
│            │  │  Description        [_______________________________]  │  │
│            │  │                     [_______________________________]  │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ BOARD SETTINGS ────────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Quorum Percentage *    [60        ] %                  │  │
│            │  │                                                         │  │
│            │  │  Meeting Frequency      [Quarterly                 ▼]  │  │
│            │  │                                                         │  │
│            │  │  Voting Threshold       [Simple Majority           ▼]  │  │
│            │  │                                                         │  │
│            │  │  ☑ Require Meeting Confirmation                        │  │
│            │  │                                                         │  │
│            │  │  Designated Approver    [Board Chairman            ▼]  │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │                              [Cancel]  [Create Board]         │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 3.2 Form Fields

```typescript
interface CreateBoardForm {
  // Type
  type: 'main' | 'subsidiary' | 'factory';
  
  // Basic Info
  name: string;           // Required
  zone?: string;          // Required for factory
  description?: string;
  
  // Settings
  quorumPercentage: number;  // Default by type: Main 50%, Others 60%
  meetingFrequency: 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  votingThreshold: 'simple_majority' | 'two_thirds' | 'unanimous';
  requireConfirmation: boolean;
  designatedApprover?: 'chairman' | 'secretary' | 'specific_user';
  approverId?: string;    // If specific_user
  
  // Status
  status: 'active' | 'inactive';  // Default: active
}
```

### 3.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Type Selector | `Radio.Group` + `Card` | Select board type |
| Form | `Form` | Form container |
| Name Input | `Input` | Board name |
| Zone Select | `Select` | Zone dropdown (factory only) |
| Description | `Input.TextArea` | Optional description |
| Quorum Input | `InputNumber` | Percentage 1-100 |
| Frequency Select | `Select` | Meeting frequency |
| Threshold Select | `Select` | Voting threshold |
| Confirmation Switch | `Switch` | Require confirmation |
| Approver Select | `Select` | Designated approver |

### 3.4 Validation Rules

```typescript
const validationRules = {
  name: [
    { required: true, message: 'Board name is required' },
    { min: 3, message: 'Name must be at least 3 characters' },
    { validator: checkNameUnique, message: 'Board name already exists' },
  ],
  zone: [
    { required: true, message: 'Zone is required for factory boards' },
  ],
  quorumPercentage: [
    { required: true, message: 'Quorum is required' },
    { type: 'number', min: 1, max: 100, message: 'Quorum must be 1-100%' },
  ],
};
```

### 3.5 Conditional Fields

```typescript
// Zone field only for Factory type
{form.type === 'factory' && (
  <Form.Item name="zone" label="Zone" rules={validationRules.zone}>
    <Select options={zoneOptions} />
  </Form.Item>
)}

// Main Board type disabled if already exists
<Radio.Button value="main" disabled={mainBoardExists}>
  Main Board {mainBoardExists && '(exists)'}
</Radio.Button>
```

---

## 4. Board Details Page

**Route**: `/boards/:id`  
**Access**: System Admin, Board Secretary, Chairman  
**Purpose**: View board information, members, committees, and settings

### 4.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Boards                                             │
│            │                                                                │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │  [Board Logo]                                           │  │
│            │  │                                                         │  │
│            │  │  KTDA Main Board                        [Edit] [⚙️]    │  │
│            │  │  Main Board • Active • ✓ 100% Compliant                 │  │
│            │  │                                                         │  │
│            │  │  15 Members • 4 Committees • 12 Meetings (2026)         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  [Overview] [Members] [Committees] [Meetings] [Settings]      │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─ MEMBERS ───────────────────────────────────────────────┐  │
│            │  │                                          [+ Add Member] │  │
│            │  │                                                         │  │
│            │  │  ┌───────────────────────────────────────────────────┐ │  │
│            │  │  │ 👤 Name          │ Role      │ Since    │ Actions │ │  │
│            │  │  ├──────────────────┼───────────┼──────────┼─────────┤ │  │
│            │  │  │ Peter Ochieng    │ Chairman  │ Jan 2020 │ [Edit]  │ │  │
│            │  │  │ Mary Wanjiku     │ Secretary │ Mar 2021 │ [Edit]  │ │  │
│            │  │  │ John Kamau       │ Member    │ Jun 2022 │ [Edit]  │ │  │
│            │  │  │ Jane Muthoni     │ Member    │ Sep 2023 │ [Edit]  │ │  │
│            │  │  │ ... (11 more)    │           │          │         │ │  │
│            │  │  └───────────────────────────────────────────────────┘ │  │
│            │  │                                                         │  │
│            │  │  Showing 1-10 of 15 members            [< 1 2 >]       │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 4.2 Tab Content

#### Overview Tab
- Board description
- Key statistics (members, meetings, compliance)
- Recent activity
- Quick actions

#### Members Tab
- Members table with roles
- Add/Edit/Remove member actions
- Role distribution chart
- Export members list

#### Committees Tab (Main Board & Subsidiaries only)
- List of committees
- Create new committee button
- Committee cards with member count
- Navigate to committee details

#### Meetings Tab
- Upcoming meetings list
- Past meetings list
- Meeting statistics
- Link to create meeting

#### Settings Tab
- Board settings form
- Quorum, frequency, voting threshold
- Confirmation settings
- Branding link (Main/Subsidiary only)

### 4.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Board Header | `Card` | Logo, name, stats |
| Tabs | `Tabs` | Content sections |
| Members Table | `Table` | List members |
| Add Member Modal | `Modal` + `Form` | Add new member |
| Edit Role Modal | `Modal` + `Select` | Change member role |
| Committee Cards | `Card` | Committee summary |
| Statistics | `Statistic` | Key numbers |
| Activity Timeline | `Timeline` | Recent activity |

### 4.4 Members Table

```typescript
const memberColumns: ColumnsType<BoardMember> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name, record) => (
      <Space>
        <Avatar src={record.avatar}>{getInitials(name)}</Avatar>
        <div>
          <div>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      </Space>
    ),
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role) => (
      <Tag color={roleColors[role]}>{role}</Tag>
    ),
  },
  {
    title: 'Member Since',
    dataIndex: 'startDate',
    key: 'since',
    render: (date) => dayjs(date).format('MMM YYYY'),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Button size="small" onClick={() => openEditModal(record)}>Edit</Button>
        <Popconfirm title="Remove member?" onConfirm={() => removeMember(record.id)}>
          <Button size="small" danger>Remove</Button>
        </Popconfirm>
      </Space>
    ),
  },
];
```

### 4.5 Add Member Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  ADD MEMBER TO BOARD                                       [×]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Select User *                                                  │
│  [🔍 Search users...                                       ▼]  │
│                                                                 │
│  Role on Board *                                                │
│  [Member                                                   ▼]  │
│                                                                 │
│  Effective Date                                                 │
│  [📅 Today                                                  ]  │
│                                                                 │
│  End Date (Optional)                                            │
│  [📅 Select date                                            ]  │
│                                                                 │
│                                    [Cancel]  [Add Member]       │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 State Management

```typescript
interface BoardDetailsState {
  board: Board | null;
  activeTab: 'overview' | 'members' | 'committees' | 'meetings' | 'settings';
  
  // Members
  members: BoardMember[];
  membersPage: number;
  isAddMemberModalOpen: boolean;
  isEditMemberModalOpen: boolean;
  selectedMember: BoardMember | null;
  
  // Committees
  committees: Committee[];
  
  // Meetings
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
  
  // Loading
  isLoading: boolean;
}
```

### 4.7 API Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Get board | `GET /api/boards/:id` | GET |
| Get members | `GET /api/boards/:id/members` | GET |
| Add member | `POST /api/boards/:id/members` | POST |
| Update member | `PUT /api/boards/:id/members/:memberId` | PUT |
| Remove member | `DELETE /api/boards/:id/members/:memberId` | DELETE |
| Get committees | `GET /api/boards/:id/committees` | GET |
| Get meetings | `GET /api/boards/:id/meetings` | GET |

---

## 5. Edit Board Page

**Route**: `/boards/:id/edit`  
**Access**: System Admin  
**Purpose**: Edit board settings

### 5.1 Page Layout

Similar to Create Board but:
- Pre-populated with existing data
- Board type is read-only
- "Save Changes" instead of "Create Board"
- Additional "Deactivate Board" option

### 5.2 Deactivation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  DEACTIVATE BOARD                                          [×]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚠️ Are you sure you want to deactivate KTDA Main Board?       │
│                                                                 │
│  This will:                                                     │
│  • Hide the board from Organization Selector                    │
│  • Cancel 3 upcoming meetings                                   │
│  • Preserve all historical data                                 │
│                                                                 │
│  ⚠️ This board has 4 committees that will also be deactivated. │
│                                                                 │
│  Reason for deactivation *                                      │
│  [_______________________________________________________]     │
│                                                                 │
│                              [Cancel]  [Deactivate Board]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Board Branding Page

**Route**: `/boards/:id/branding`  
**Access**: System Admin  
**Purpose**: Configure board logo and color theme

### 6.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Board Details                                      │
│            │                                                                │
│            │  BOARD BRANDING - KTDA Main Board                              │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─ LOGO ──────────────────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Current Logo:                                          │  │
│            │  │  ┌─────────────┐                                        │  │
│            │  │  │             │                                        │  │
│            │  │  │ [KTDA Logo] │    [Upload New Logo]                   │  │
│            │  │  │             │    [Remove Logo]                       │  │
│            │  │  └─────────────┘                                        │  │
│            │  │                                                         │  │
│            │  │  Recommended: PNG or SVG, max 2MB, min 200x200px        │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ COLOR THEME ───────────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Primary Color        [#1890ff] [🎨]                    │  │
│            │  │                                                         │  │
│            │  │  Secondary Color      [#52c41a] [🎨]                    │  │
│            │  │                                                         │  │
│            │  │  Sidebar Background   [#001529] [🎨]                    │  │
│            │  │                                                         │  │
│            │  │  Sidebar Text         [#ffffff] [🎨]                    │  │
│            │  │                                                         │  │
│            │  │  Theme Mode:  ○ Light  ● Dark                           │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ PREVIEW ───────────────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  ┌─────────────────────────────────────────────────┐   │  │
│            │  │  │ [Logo] KTDA Main Board     [🔔] [👤]            │   │  │
│            │  │  ├────────┬────────────────────────────────────────┤   │  │
│            │  │  │        │                                        │   │  │
│            │  │  │ Dashb. │  Sample Content                        │   │  │
│            │  │  │ Meetng │                                        │   │  │
│            │  │  │ Docs   │  [Primary Button]  [Secondary]         │   │  │
│            │  │  │        │                                        │   │  │
│            │  │  └────────┴────────────────────────────────────────┘   │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │                    [Reset to Default]  [Save Branding]        │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 6.2 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Logo Upload | `Upload` | Upload logo image |
| Logo Preview | `Image` | Show current logo |
| Color Picker | `ColorPicker` | Select colors |
| Color Input | `Input` | Hex color input |
| Theme Radio | `Radio.Group` | Light/Dark mode |
| Preview Card | Custom | Live preview |

### 6.3 Form Fields

```typescript
interface BrandingForm {
  logo?: File;
  primaryColor: string;      // Hex color
  secondaryColor: string;
  sidebarBackground: string;
  sidebarText: string;
  themeMode: 'light' | 'dark';
}
```

### 6.4 Preview Component

```typescript
const BrandingPreview: React.FC<{ branding: BrandingForm }> = ({ branding }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: branding.primaryColor,
        },
      }}
    >
      <div className="preview-container">
        <div 
          className="preview-header" 
          style={{ backgroundColor: branding.primaryColor }}
        >
          {branding.logo && <img src={URL.createObjectURL(branding.logo)} alt="Logo" />}
          <span>KTDA Main Board</span>
        </div>
        <div className="preview-body">
          <div 
            className="preview-sidebar"
            style={{ 
              backgroundColor: branding.sidebarBackground,
              color: branding.sidebarText,
            }}
          >
            <div>Dashboard</div>
            <div>Meetings</div>
            <div>Documents</div>
          </div>
          <div className="preview-content">
            <Button type="primary">Primary Button</Button>
            <Button>Secondary</Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};
```

---

## 7. Create Committee Page

**Route**: `/boards/:id/committees/create`  
**Access**: System Admin  
**Purpose**: Create new committee under a board

### 7.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to KTDA Main Board                                    │
│            │                                                                │
│            │  CREATE NEW COMMITTEE                                          │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─ COMMITTEE INFORMATION ─────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Parent Board         KTDA Main Board (read-only)       │  │
│            │  │                                                         │  │
│            │  │  Committee Name *     [_______________________________] │  │
│            │  │                                                         │  │
│            │  │  Description          [_______________________________] │  │
│            │  │                        [_______________________________] │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ COMMITTEE SETTINGS ────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Quorum Percentage *    [60        ] %                  │  │
│            │  │                                                         │  │
│            │  │  Meeting Frequency      [Quarterly                 ▼]  │  │
│            │  │                                                         │  │
│            │  │  Voting Threshold       [Simple Majority           ▼]  │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ INITIAL MEMBERS ───────────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  Select members from KTDA Main Board:                   │  │
│            │  │                                                         │  │
│            │  │  [+ Add Member]                                         │  │
│            │  │                                                         │  │
│            │  │  ┌───────────────────────────────────────────────────┐ │  │
│            │  │  │ 👤 Peter Ochieng    │ Committee Chairman │ [Remove]│ │  │
│            │  │  │ 👤 Mary Wanjiku     │ Committee Secretary│ [Remove]│ │  │
│            │  │  │ 👤 John Kamau       │ Committee Member   │ [Remove]│ │  │
│            │  │  └───────────────────────────────────────────────────┘ │  │
│            │  │                                                         │  │
│            │  │  ⚠️ Minimum 3 members recommended                       │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │                           [Cancel]  [Create Committee]        │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 7.2 Key Behavior

- **Member dropdown only shows parent board members**
- Committee Chairman must be selected
- Minimum 3 members recommended (warning if less)
- Committee inherits parent board branding

### 7.3 Form Fields

```typescript
interface CreateCommitteeForm {
  parentBoardId: string;     // Read-only, from URL
  name: string;              // Required
  description?: string;
  quorumPercentage: number;  // Default: 60
  meetingFrequency: 'monthly' | 'quarterly' | 'as_needed';
  votingThreshold: 'simple_majority' | 'two_thirds' | 'unanimous';
  members: {
    userId: string;
    role: 'committee_chairman' | 'committee_secretary' | 'committee_member';
  }[];
}
```

---

## 8. Committee Details Page

**Route**: `/boards/:boardId/committees/:committeeId`  
**Access**: System Admin, Board Secretary, Chairman, Committee Members  
**Purpose**: View committee information and members

### 8.1 Page Layout

Similar to Board Details but:
- Shows parent board link
- No "Committees" tab (committees don't have sub-committees)
- No "Branding" tab (inherits from parent)
- Members dropdown filtered to parent board members only

### 8.2 Header

```
┌─────────────────────────────────────────────────────────────────┐
│  [Committee Icon]                                               │
│                                                                 │
│  Audit Committee                            [Edit] [⚙️]        │
│  Committee of KTDA Main Board • Active • ✓ 100% Compliant      │
│                                                                 │
│  5 Members • 4 Meetings (2026)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Import Boards Page

**Route**: `/boards/import`  
**Access**: System Admin  
**Purpose**: Bulk import factory boards from CSV

### 9.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Boards                                             │
│            │                                                                │
│            │  IMPORT FACTORY BOARDS                                         │
│            │  ───────────────────────────────────────────────────────────   │
│            │                                                                │
│            │  ┌─ STEP 1: UPLOAD FILE ───────────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  [📥 Download CSV Template]                             │  │
│            │  │                                                         │  │
│            │  │  ┌─────────────────────────────────────────────────┐   │  │
│            │  │  │                                                 │   │  │
│            │  │  │     📄 Drag and drop CSV file here             │   │  │
│            │  │  │                                                 │   │  │
│            │  │  │     or [Browse Files]                          │   │  │
│            │  │  │                                                 │   │  │
│            │  │  └─────────────────────────────────────────────────┘   │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌─ STEP 2: PREVIEW & VALIDATE ────────────────────────────┐  │
│            │  │                                                         │  │
│            │  │  ✓ 65 valid rows    ✗ 4 errors                         │  │
│            │  │                                                         │  │
│            │  │  ┌───────────────────────────────────────────────────┐ │  │
│            │  │  │ Row │ Name              │ Zone   │ Status │ Error │ │  │
│            │  │  ├─────┼───────────────────┼────────┼────────┼───────┤ │  │
│            │  │  │ 1   │ Chebut Factory    │ Zone 1 │ ✓      │       │ │  │
│            │  │  │ 2   │ Kapkatet Factory  │ Zone 1 │ ✓      │       │ │  │
│            │  │  │ 5   │ Duplicate Name    │ Zone 2 │ ✗      │ Exists│ │  │
│            │  │  │ 12  │ Invalid Factory   │ Zone X │ ✗      │ Zone  │ │  │
│            │  │  └───────────────────────────────────────────────────┘ │  │
│            │  │                                                         │  │
│            │  │  ☑ Skip rows with errors                               │  │
│            │  │                                                         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │                              [Cancel]  [Import 65 Boards]     │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 9.2 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Upload Dragger | `Upload.Dragger` | File upload area |
| Template Download | `Button` | Download CSV template |
| Preview Table | `Table` | Show parsed data |
| Validation Status | `Alert` | Show valid/error counts |
| Error Tag | `Tag` color="error" | Show row errors |
| Skip Checkbox | `Checkbox` | Skip error rows |
| Progress | `Progress` | Import progress |

### 9.3 CSV Template

```csv
name,zone,description,quorum,status
"Chebut Tea Factory","Zone 1","Chebut factory board",60,Active
"Kapkatet Tea Factory","Zone 1","Kapkatet factory board",60,Active
"Litein Tea Factory","Zone 2","Litein factory board",60,Active
```

### 9.4 Import Flow

1. Download template (optional)
2. Upload CSV file
3. System parses and validates
4. Show preview with errors highlighted
5. User can skip error rows or cancel to fix
6. Click Import → Progress bar
7. Success message with count

---

## 10. File Structure

```
src/
├── pages/
│   └── Boards/
│       ├── index.tsx                 # Boards Index
│       ├── BoardsIndex.tsx
│       ├── BoardHierarchy.tsx
│       ├── CreateBoard.tsx
│       ├── BoardDetails.tsx
│       ├── EditBoard.tsx
│       ├── BoardBranding.tsx
│       ├── CreateCommittee.tsx
│       ├── CommitteeDetails.tsx
│       ├── ImportBoards.tsx
│       └── components/
│           ├── BoardsTable.tsx
│           ├── BoardFilters.tsx
│           ├── BoardTypeSelector.tsx
│           ├── BoardForm.tsx
│           ├── BoardHeader.tsx
│           ├── MembersTable.tsx
│           ├── AddMemberModal.tsx
│           ├── EditMemberModal.tsx
│           ├── CommitteeCard.tsx
│           ├── HierarchyTree.tsx
│           ├── BrandingForm.tsx
│           ├── BrandingPreview.tsx
│           ├── CsvUploader.tsx
│           └── ImportPreviewTable.tsx
├── hooks/
│   ├── useBoards.ts
│   ├── useBoard.ts
│   ├── useBoardMembers.ts
│   ├── useCommittees.ts
│   └── useBoardHierarchy.ts
└── services/
    ├── boardsService.ts
    ├── membersService.ts
    └── committeesService.ts
```

---

## 11. Summary

| Page | Route | Components | Access |
|------|-------|------------|--------|
| Boards Index | `/boards` | Table, Tabs, Filters | Admin, Secretary, Chairman |
| Board Hierarchy | `/boards/hierarchy` | Tree, Search | Admin, Secretary, Chairman |
| Create Board | `/boards/create` | Form, Type Selector | Admin |
| Board Details | `/boards/:id` | Tabs, Tables, Modals | Admin, Secretary, Chairman |
| Edit Board | `/boards/:id/edit` | Form | Admin |
| Board Branding | `/boards/:id/branding` | Upload, ColorPicker, Preview | Admin |
| Create Committee | `/boards/:id/committees/create` | Form, Member Selector | Admin |
| Committee Details | `/boards/:boardId/committees/:id` | Tabs, Tables | Admin, Secretary, Chairman, Members |
| Import Boards | `/boards/import` | Upload, Table, Progress | Admin |

---

**END OF MODULE 2 PAGE SPECIFICATIONS**
