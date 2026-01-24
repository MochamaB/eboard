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
**UI Pattern**: **Vertical Wizard (3 steps)**

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
│  ┌──────┐  │  ┌───────────────┬─────────────────────────────────────────┐  │
│  │STEPS │  │  │  STEPS        │  STEP 2: BOARD INFORMATION              │  │
│  │      │  │  │  ───────────  │  ───────────────────────────────────── │  │
│  │Step 1│  │  │               │                                         │  │
│  │Board │  │  │  ✓ Board Type │  Board Name *                           │  │
│  │Type  │  │  │               │  [_____________________________________] │  │
│  │      │  │  │  ● Information│                                         │  │
│  │Step 2│  │  │               │  Parent Board (auto-set for Subsidiary) │  │
│  │Info  │  │  │  ○ Settings   │  [KTDA Main Board                   ▼] │  │
│  │      │  │  │               │                                         │  │
│  │Step 3│  │  │               │  Zone * (Factory only, hidden for others)│  │
│  │Config│  │  │               │  [Zone 1                            ▼] │  │
│  │      │  │  │               │                                         │  │
│  └──────┘  │  │               │  Description                            │  │
│            │  │               │  [_____________________________________] │  │
│            │  │               │  [_____________________________________] │  │
│            │  │               │                                         │  │
│            │  │               │  Status                                 │  │
│            │  │               │  ● Active  ○ Inactive                   │  │
│            │  │               │                                         │  │
│            │  │               │                  [← Back]  [Next →]     │  │
│            │  └───────────────┴─────────────────────────────────────────┘  │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

**Step 1: Board Type** (Radio card selection)
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 🏛️ Main     │ │ 🏢 Subsidiary│ │ 🏭 Factory  │
│ Board       │ │             │ │             │
│ (disabled)  │ │ ● Selected  │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Step 2: Board Information** (shown above in wireframe)

**Step 3: Settings**
```
Quorum Percentage *    [60        ] %
Meeting Frequency      [Quarterly                 ▼]
Voting Threshold       [Simple Majority           ▼]
☑ Require Meeting Confirmation
Designated Approver    [Board Chairman            ▼]
```

### 3.2 Wizard Steps

**Step 1: Board Type**
- Radio card selection (Main/Subsidiary/Factory)
- Main Board option disabled if already exists
- Visual cards with icons
- Automatic defaults applied on selection

**Step 2: Board Information**
- Board name (required)
- Parent board (auto-set: Main for Subsidiary/Factory, read-only)
- Zone (required for Factory only, field shown conditionally)
- Description (optional textarea)
- Status (Active/Inactive radio, default: Active)

**Step 3: Settings**
- Quorum percentage (default by type: Main 50%, Others 60%)
- Meeting frequency dropdown
- Voting threshold dropdown
- Require confirmation checkbox
- Designated approver (if confirmation required)

### 3.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Wizard Container | `Steps` direction="vertical" | Step indicator sidebar |
| Step Content | `Card` | Step form container |
| Type Selector | `Radio.Group` + `Card` | Select board type (Step 1) |
| Form | `Form` layout="vertical" | Form container |
| Name Input | `Input` | Board name |
| Zone Select | `Select` | Zone dropdown (factory only) |
| Description | `Input.TextArea` rows={3} | Optional description |
| Quorum Input | `InputNumber` min={1} max={100} | Percentage 1-100 |
| Frequency Select | `Select` | Meeting frequency |
| Threshold Select | `Select` | Voting threshold |
| Confirmation Checkbox | `Checkbox` | Require confirmation |
| Approver Select | `Select` | Designated approver |
| Navigation Buttons | `Button` | Back, Next, Create Board |

### 3.4 Form State

```typescript
interface CreateBoardWizardState {
  currentStep: number;  // 0, 1, 2

  // Step 1
  type: 'main' | 'subsidiary' | 'factory';

  // Step 2
  name: string;
  zone?: string;          // Required for factory
  description?: string;
  status: 'active' | 'inactive';

  // Step 3
  quorumPercentage: number;
  meetingFrequency: 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  votingThreshold: 'simple_majority' | 'two_thirds' | 'unanimous';
  requireConfirmation: boolean;
  designatedApprover?: 'chairman' | 'secretary' | 'specific_user';
  approverId?: string;
}
```

### 3.5 Validation Rules (Per Step)

**Step 1 Validation:**
```typescript
const step1Validation = {
  type: [
    { required: true, message: 'Please select a board type' },
  ],
};
```

**Step 2 Validation:**
```typescript
const step2Validation = {
  name: [
    { required: true, message: 'Board name is required' },
    { min: 3, message: 'Name must be at least 3 characters' },
    { max: 100, message: 'Name must not exceed 100 characters' },
    { validator: checkNameUnique, message: 'Board name already exists' },
  ],
  zone: [
    { required: true, message: 'Zone is required for factory boards' },
  ],
  description: [
    { max: 500, message: 'Description must not exceed 500 characters' },
  ],
};
```

**Step 3 Validation:**
```typescript
const step3Validation = {
  quorumPercentage: [
    { required: true, message: 'Quorum is required' },
    { type: 'number', min: 1, max: 100, message: 'Quorum must be 1-100%' },
  ],
  meetingFrequency: [
    { required: true, message: 'Meeting frequency is required' },
  ],
  votingThreshold: [
    { required: true, message: 'Voting threshold is required' },
  ],
};
```

### 3.6 Conditional Logic

```typescript
// Zone field only shown for Factory type (Step 2)
{formData.type === 'factory' && (
  <Form.Item name="zone" label="Zone *" rules={step2Validation.zone}>
    <Select
      options={zoneOptions}
      placeholder="Select zone"
    />
  </Form.Item>
)}

// Main Board type disabled if already exists (Step 1)
<Radio.Button value="main" disabled={mainBoardExists}>
  <Card className="board-type-card">
    <BankOutlined />
    <div>Main Board</div>
    {mainBoardExists && <Tag>Already exists</Tag>}
  </Card>
</Radio.Button>

// Designated approver only shown if confirmation required (Step 3)
{formData.requireConfirmation && (
  <Form.Item name="designatedApprover" label="Designated Approver">
    <Select
      options={[
        { value: 'chairman', label: 'Board Chairman' },
        { value: 'secretary', label: 'Board Secretary' },
      ]}
    />
  </Form.Item>
)}
```

### 3.7 Navigation Logic

```typescript
const handleNext = async () => {
  try {
    // Validate current step
    await form.validateFields(getStepFields(currentStep));

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit
      await handleSubmit();
    }
  } catch (error) {
    // Validation failed, stay on current step
    message.error('Please fix validation errors');
  }
};

const handleBack = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1);
  }
};

const getStepFields = (step: number): string[] => {
  switch (step) {
    case 0: return ['type'];
    case 1: return ['name', 'zone', 'description', 'status'];
    case 2: return ['quorumPercentage', 'meetingFrequency', 'votingThreshold'];
    default: return [];
  }
};
```

---

## 4. Board Details Page

**Route**: `/boards/:id`
**Access**: System Admin, Board Secretary, Chairman
**Purpose**: View and edit board information, members, committees, and settings
**UI Pattern**: **Vertical Tabs Page**

### 4.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │  ← Back to Boards                                             │
│            │                                                                │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │  [Logo]  KTDA Main Board              [Main] [● Active] │  │
│            │  │  15 Members • 4 Committees • 12 Meetings (2026)         │  │
│            │  │                                          [Deactivate]   │  │
│            │  └─────────────────────────────────────────────────────────┘  │
│            │                                                                │
│            │  ┌────────────┬──────────────────────────────────────────┐    │
│            │  │            │                                          │    │
│            │  │  TABS      │  GENERAL INFORMATION                     │    │
│            │  │  ────────  │  ──────────────────────────────────────  │    │
│            │  │            │                                          │    │
│            │  │ ● General  │  Board Name *                            │    │
│            │  │            │  [KTDA Main Board                     ]  │    │
│            │  │ ○ Settings │                                          │    │
│            │  │            │  Board Type                              │    │
│            │  │ ○ Members  │  [Main Board] (read-only)                │    │
│            │  │            │                                          │    │
│            │  │ ○ Committees│  Description                            │    │
│            │  │            │  [The main governing board...         ]  │    │
│            │  │ ○ Branding │                                          │    │
│            │  │            │  Status                                  │    │
│            │  │            │  ● Active  ○ Inactive                    │    │
│            │  │            │                                          │    │
│            │  │            │                       [Save Changes]     │    │
│            │  └────────────┴──────────────────────────────────────────┘    │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 4.2 Tab Structure

**Tabs appear on LEFT side (20% width), content on right (80%):**

#### Tab 1: General
- Board name (editable)
- Board type (read-only, displayed as tag)
- Parent board (if applicable, read-only)
- Zone (if factory, read-only)
- Description (editable textarea)
- Status (Active/Inactive radio buttons)
- Per-tab save button: "Save Changes"

#### Tab 2: Settings
- Quorum percentage (editable)
- Meeting frequency (dropdown)
- Voting threshold (dropdown)
- Require confirmation (checkbox)
- Designated approver (conditional select)
- Per-tab save button: "Save Changes"

#### Tab 3: Members
- Members table with roles
- "+ Add Member" button (opens modal - see Flow 5)
- Remove member action (opens confirmation modal - see Flow 7)
- No save button (actions are immediate)

#### Tab 4: Committees (Main Board & Subsidiaries only)
- List of committees (cards or table)
- "+ Create Committee" button (navigates to wizard)
- Committee cards with:
  - Committee name
  - Member count
  - Chairman name
  - Click to navigate to committee details
- Hidden for Factory boards

#### Tab 5: Branding (Main Board & Subsidiaries only)
- Logo upload section
- Color theme pickers (primary, secondary, sidebar)
- Live preview panel
- Per-tab save button: "Save Branding"
- Hidden for Factory boards and Committees

### 4.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Board Header | `Card` or custom | Logo, name, type, status, stats |
| Vertical Tabs | `Tabs` tabPosition="left" | Navigation tabs |
| General Form | `Form` layout="vertical" | Edit basic info |
| Settings Form | `Form` layout="vertical" | Edit board settings |
| Members Table | `Table` | List members with actions |
| Add Member Modal | `Modal` + `Form` | Add new member (see Flow 5) |
| Remove Modal | `Modal` | Cascade warning (see Flow 7) |
| Committee Cards | `Card` | Committee summary cards |
| Branding Upload | `Upload.Dragger` | Logo upload |
| Color Pickers | `ColorPicker` | Theme colors |
| Preview Panel | Custom | Branding live preview |
| Save Button | `Button` type="primary" | Per-tab save |
| Deactivate Button | `Button` danger | Deactivate board (in header) |

### 4.4 Tab-Specific Details

#### General Tab Form Fields
```typescript
interface GeneralTabForm {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}
```

#### Settings Tab Form Fields
```typescript
interface SettingsTabForm {
  quorumPercentage: number;
  meetingFrequency: 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  votingThreshold: 'simple_majority' | 'two_thirds' | 'unanimous';
  requireConfirmation: boolean;
  designatedApprover?: string;
}
```

#### Members Tab - Table Columns
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
          <Text type="secondary" size="small">{record.email}</Text>
        </div>
      </Space>
    ),
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role) => <Tag color={roleColors[role]}>{role}</Tag>,
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
      <Button
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleRemoveMember(record)}
      >
        Remove
      </Button>
    ),
  },
];
```

#### Branding Tab Form Fields
```typescript
interface BrandingTabForm {
  logo?: File;
  primaryColor: string;
  secondaryColor: string;
  sidebarBackground: string;
  themeMode: 'light' | 'dark';
}
```

### 4.5 State Management

```typescript
interface BoardDetailsState {
  board: Board | null;
  activeTab: 'general' | 'settings' | 'members' | 'committees' | 'branding';

  // Forms (one per tab)
  generalForm: GeneralTabForm;
  settingsForm: SettingsTabForm;
  brandingForm: BrandingTabForm;

  // Members Tab
  members: BoardMember[];
  membersPage: number;
  isAddMemberModalOpen: boolean;
  isRemoveModalOpen: boolean;
  selectedMember: BoardMember | null;

  // Committees Tab
  committees: Committee[];

  // Loading & Saving
  isLoading: boolean;
  isSaving: { [key: string]: boolean };  // Per-tab saving state
}
```

### 4.6 API Endpoints

| Action | Endpoint | Method | Tab |
|--------|----------|--------|-----|
| Get board | `GET /api/boards/:id` | GET | All |
| Update general info | `PUT /api/boards/:id` | PUT | General |
| Update settings | `PUT /api/boards/:id/settings` | PUT | Settings |
| Get members | `GET /api/boards/:id/members` | GET | Members |
| Add member | `POST /api/boards/:id/members` | POST | Members |
| Remove member | `DELETE /api/boards/:id/members/:memberId` | DELETE | Members |
| Get committees | `GET /api/boards/:id/committees` | GET | Committees |
| Update branding | `PUT /api/boards/:id/branding` | PUT | Branding |
| Upload logo | `POST /api/boards/:id/logo` | POST | Branding |
| Deactivate board | `POST /api/boards/:id/deactivate` | POST | Header action |

### 4.7 Deactivation Flow

Triggered by "Deactivate" button in header:

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

## 5. Committee Details Page

**Route**: `/committees/:id`
**Access**: System Admin, Board Secretary, Chairman, Committee Members
**Purpose**: View and edit committee information and members
**UI Pattern**: **Vertical Tabs Page** (similar to Board Details)

### 5.1 Differences from Board Details

- Shows parent board link in header
- No "Committees" tab (committees don't have sub-committees)
- No "Branding" tab (inherits from parent board)
- Members dropdown filtered to parent board members only
- Only 3 tabs: General, Settings, Members

### 5.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to KTDA Main Board                                      │
│                                                                 │
│  Audit Committee                              [Committee] [●]   │
│  Committee of KTDA Main Board • 5 Members                       │
│                                                                 │
│  ┌────────────┬──────────────────────────────────────────────┐ │
│  │            │                                              │ │
│  │  TABS      │  GENERAL INFORMATION                         │ │
│  │  ────────  │  ────────────────────────────────────────── │ │
│  │            │                                              │ │
│  │ ● General  │  Committee Name *                            │ │
│  │            │  [Audit Committee                         ]  │ │
│  │ ○ Settings │                                              │ │
│  │            │  Parent Board                                │ │
│  │ ○ Members  │  [KTDA Main Board] (read-only)               │ │
│  │            │                                              │ │
│  │            │  Description                                 │ │
│  │            │  [Reviews financial matters...            ]  │ │
│  │            │                                              │ │
│  │            │                        [Save Changes]        │ │
│  └────────────┴──────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Create Committee Page

**Route**: `/boards/:id/committees/create`
**Access**: System Admin
**Purpose**: Create new committee under a board
**UI Pattern**: **Vertical Wizard (4 steps)**

### 6.1 Page Layout

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
│            │  ┌───────────────┬─────────────────────────────────────────┐  │
│            │  │  STEPS        │  STEP 3: ADD MEMBERS                    │  │
│            │  │  ───────────  │  ───────────────────────────────────── │  │
│            │  │               │                                         │  │
│            │  │  ✓ Information│  Select members from KTDA Main Board:   │  │
│            │  │               │                                         │  │
│            │  │  ✓ Settings   │  [🔍 Search members...]  [+ Add]        │  │
│            │  │               │                                         │  │
│            │  │  ● Members    │  Selected (3):                          │  │
│            │  │               │  ┌─────────────────────────────────┐   │  │
│            │  │  ○ Review     │  │ [👤] Peter Ochieng   [Chairman▼]×│  │  │
│            │  │               │  │ [👤] Mary Wanjiku   [Secretary▼]×│  │  │
│            │  │               │  │ [👤] John Kamau      [Member  ▼]×│  │  │
│            │  │               │  └─────────────────────────────────┘   │  │
│            │  │               │                                         │  │
│            │  │               │  Available (12 more):                   │  │
│            │  │               │  ☐ [👤] Jane Muthoni - Board Member     │  │
│            │  │               │  ☐ [👤] James Mwangi - Board Member     │  │
│            │  │               │  ☐ [👤] Alice Njeri - Board Member      │  │
│            │  │               │                                         │  │
│            │  │               │  ⚠️ Minimum 3 members recommended       │  │
│            │  │               │                                         │  │
│            │  │               │                  [← Back]  [Next →]     │  │
│            │  └───────────────┴─────────────────────────────────────────┘  │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 6.2 Wizard Steps

**Step 1: Committee Information**
- Parent board (read-only, from URL context)
- Committee name (required)
- Description (optional textarea)
- Status (Active/Inactive, default: Active)

**Step 2: Settings**
- Quorum percentage (default: 60%)
- Meeting frequency (Quarterly/Monthly/As Needed)
- Voting threshold (Simple Majority/Two-Thirds/Unanimous)
- Require confirmation (optional checkbox)
- Designated approver (if confirmation required)

**Step 3: Add Members**
- Member selector (filtered to parent board members only)
- Role assignment for each member
- Checkboxes for selecting multiple members
- Minimum 3 members recommended warning

**Step 4: Review**
- Summary of all entered data
- Committee info, settings, and members list
- Edit buttons to go back to specific steps
- Final "Create Committee" button

### 6.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Wizard Container | `Steps` direction="vertical" | Step indicator sidebar |
| Step Content | `Card` | Step form container |
| Parent Board Display | `Input` disabled | Show parent board (read-only) |
| Name Input | `Input` | Committee name |
| Description | `Input.TextArea` rows={3} | Optional description |
| Settings Form | `Form` layout="vertical" | Step 2 settings |
| Member Selector | Custom + `Checkbox.Group` | Select members with roles |
| Role Dropdown | `Select` | Assign role per member |
| Review Summary | `Descriptions` | Step 4 summary display |
| Navigation Buttons | `Button` | Back, Next, Create Committee |

### 6.4 Form State

```typescript
interface CreateCommitteeWizardState {
  currentStep: number;  // 0, 1, 2, 3

  // Step 1
  parentBoardId: string;     // From URL
  name: string;
  description?: string;
  status: 'active' | 'inactive';

  // Step 2
  quorumPercentage: number;  // Default: 60
  meetingFrequency: 'monthly' | 'quarterly' | 'as_needed';
  votingThreshold: 'simple_majority' | 'two_thirds' | 'unanimous';
  requireConfirmation: boolean;
  designatedApprover?: string;

  // Step 3
  members: {
    userId: string;
    name: string;
    avatar?: string;
    role: 'committee_chairman' | 'committee_secretary' | 'committee_member';
  }[];
}
```

### 6.5 Key Behavior

- **Member dropdown filtered to parent board members only**
- One Committee Chairman required (validation in Step 3)
- Minimum 3 members recommended (warning, not blocking)
- Committee inherits parent board branding
- Step navigation validates current step before proceeding

---

## 7. Import Boards Page

**Route**: `/boards/import`
**Access**: System Admin
**Purpose**: Bulk import factory boards from CSV
**UI Pattern**: **Vertical Wizard (4 steps)**

### 7.1 Page Layout

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
│            │  ┌───────────────┬─────────────────────────────────────────┐  │
│            │  │  STEPS        │  STEP 3: VALIDATE DATA                  │  │
│            │  │  ───────────  │  ───────────────────────────────────── │  │
│            │  │               │                                         │  │
│            │  │  ✓ Upload     │  Validation Results                     │  │
│            │  │               │  ───────────────────────────────────    │  │
│            │  │  ✓ Map Columns│                                         │  │
│            │  │               │  ✓ Valid rows: 65                       │  │
│            │  │  ● Validate   │  ✗ Invalid rows: 4                      │  │
│            │  │               │                                         │  │
│            │  │  ○ Import     │  Error Details:                         │  │
│            │  │               │  ┌───────────────────────────────────┐ │  │
│            │  │               │  │ Row│ Name          │ Error        │ │  │
│            │  │               │  ├────┼───────────────┼──────────────┤ │  │
│            │  │               │  │ 5  │ Chebut Factory│ Name exists  │ │  │
│            │  │               │  │ 12 │ Test Factory  │ Invalid zone │ │  │
│            │  │               │  │ 28 │ (empty)       │ Name required│ │  │
│            │  │               │  │ 45 │ Kapkatet      │ Name exists  │ │  │
│            │  │               │  └───────────────────────────────────┘ │  │
│            │  │               │                                         │  │
│            │  │               │  ☐ Skip invalid rows and import valid   │  │
│            │  │               │                                         │  │
│            │  │               │                  [← Back]  [Import →]   │  │
│            │  └───────────────┴─────────────────────────────────────────┘  │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### 7.2 Wizard Steps

**Step 1: Upload File**
- Download CSV template button
- File upload dragger (drag & drop or browse)
- Accepted format: CSV only
- Shows file name and size after upload
- Auto-validates file format

**Step 2: Map Columns**
- Shows CSV headers and system fields side by side
- Dropdown to map each CSV column to system field
- Auto-detects common column names
- Preview of first 3 rows with mapping
- Validates required fields are mapped

**Step 3: Validate Data**
- Shows validation results summary (valid count, error count)
- Table of all rows with validation status
- Error details for each invalid row
- Option to "Skip invalid rows and import valid only"
- Can go back to fix file or continue with valid rows

**Step 4: Import Progress**
- Progress bar showing import status
- Real-time count of imported boards
- Success/failure summary
- Option to view imported boards
- Rollback on critical errors

### 7.3 Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Wizard Container | `Steps` direction="vertical" | Step indicator sidebar |
| Upload Dragger | `Upload.Dragger` | File upload area (Step 1) |
| Template Download | `Button` | Download CSV template |
| Column Mapper | `Select` + `Table` | Map CSV to system fields (Step 2) |
| Validation Table | `Table` | Show validation results (Step 3) |
| Validation Alert | `Alert` | Summary of valid/error counts |
| Error Tag | `Tag` color="error" | Show row errors |
| Skip Checkbox | `Checkbox` | Skip error rows option |
| Progress Bar | `Progress` | Import progress (Step 4) |
| Result Summary | `Result` | Success/failure summary |
| Navigation Buttons | `Button` | Back, Next, Import |

### 7.4 CSV Template

```csv
name,zone,description,quorum,status
"Chebut Tea Factory","Zone 1","Chebut factory board",60,Active
"Kapkatet Tea Factory","Zone 1","Kapkatet factory board",60,Active
"Litein Tea Factory","Zone 2","Litein factory board",60,Active
```

### 7.5 Validation Rules

```typescript
interface ValidationRule {
  field: string;
  rules: Array<{
    type: 'required' | 'unique' | 'enum' | 'format';
    message: string;
  }>;
}

const csvValidationRules: ValidationRule[] = [
  {
    field: 'name',
    rules: [
      { type: 'required', message: 'Name is required' },
      { type: 'unique', message: 'Name already exists' },
    ],
  },
  {
    field: 'zone',
    rules: [
      { type: 'required', message: 'Zone is required' },
      { type: 'enum', message: 'Invalid zone (must be Zone 1-7)' },
    ],
  },
  {
    field: 'quorum',
    rules: [
      { type: 'format', message: 'Must be number between 1-100' },
    ],
  },
];
```

### 7.6 State Management

```typescript
interface ImportBoardsWizardState {
  currentStep: number;  // 0, 1, 2, 3

  // Step 1
  uploadedFile: File | null;

  // Step 2
  csvHeaders: string[];
  columnMapping: Record<string, string>;  // csvColumn -> systemField
  previewRows: any[];

  // Step 3
  validRows: any[];
  invalidRows: Array<{ row: number; data: any; errors: string[] }>;
  skipInvalidRows: boolean;

  // Step 4
  importProgress: number;  // 0-100
  importedCount: number;
  failedCount: number;
  isImporting: boolean;
}
```

---

## 8. File Structure

```
src/
├── pages/
│   └── Boards/
│       ├── index.tsx                     # Boards Index
│       ├── BoardsIndex.tsx               # List page
│       ├── BoardHierarchy.tsx            # Tree view
│       ├── CreateBoard/                  # Vertical wizard (3 steps)
│       │   ├── index.tsx
│       │   ├── Step1BoardType.tsx
│       │   ├── Step2Information.tsx
│       │   └── Step3Settings.tsx
│       ├── BoardDetails/                 # Vertical tabs page
│       │   ├── index.tsx
│       │   ├── GeneralTab.tsx
│       │   ├── SettingsTab.tsx
│       │   ├── MembersTab.tsx
│       │   ├── CommitteesTab.tsx
│       │   └── BrandingTab.tsx
│       ├── CreateCommittee/              # Vertical wizard (4 steps)
│       │   ├── index.tsx
│       │   ├── Step1Information.tsx
│       │   ├── Step2Settings.tsx
│       │   ├── Step3Members.tsx
│       │   └── Step4Review.tsx
│       ├── CommitteeDetails/             # Vertical tabs page
│       │   ├── index.tsx
│       │   ├── GeneralTab.tsx
│       │   ├── SettingsTab.tsx
│       │   └── MembersTab.tsx
│       ├── ImportBoards/                 # Vertical wizard (4 steps)
│       │   ├── index.tsx
│       │   ├── Step1Upload.tsx
│       │   ├── Step2MapColumns.tsx
│       │   ├── Step3Validate.tsx
│       │   └── Step4Import.tsx
│       └── components/
│           ├── BoardsTable.tsx
│           ├── BoardFilters.tsx
│           ├── BoardTypeCards.tsx       # Radio card selector
│           ├── BoardHeader.tsx
│           ├── MembersTable.tsx
│           ├── AddMemberModal.tsx       # Modal form (Flow 5, 6)
│           ├── RemoveMemberModal.tsx    # Confirmation modal (Flow 7)
│           ├── CommitteeCard.tsx
│           ├── HierarchyTree.tsx
│           ├── BrandingPreview.tsx      # Live preview
│           ├── ColumnMapper.tsx         # CSV column mapping
│           ├── ValidationTable.tsx      # Import validation results
│           └── DeactivateModal.tsx      # Board deactivation
├── hooks/
│   ├── useBoards.ts
│   ├── useBoard.ts
│   ├── useBoardMembers.ts
│   ├── useCommittees.ts
│   ├── useBoardHierarchy.ts
│   ├── useBoardWizard.ts               # Multi-step wizard state
│   └── useImportWizard.ts              # Import wizard state
└── services/
    ├── boardsService.ts
    ├── membersService.ts
    ├── committeesService.ts
    └── importService.ts
```

---

## 9. Summary

| Page | Route | UI Pattern | Access | Notes |
|------|-------|------------|--------|-------|
| Boards Index | `/boards` | Index/List Page | Admin, Secretary, Chairman | Table with filters |
| Board Hierarchy | `/boards/hierarchy` | Tree View Page | Admin, Secretary, Chairman | Expandable tree |
| Create Board | `/boards/create` | **Vertical Wizard (3 steps)** | Admin | Type → Info → Settings |
| Board Details | `/boards/:id` | **Vertical Tabs Page** | Admin, Secretary, Chairman | General, Settings, Members, Committees, Branding |
| Create Committee | `/boards/:id/committees/create` | **Vertical Wizard (4 steps)** | Admin | Info → Settings → Members → Review |
| Committee Details | `/committees/:id` | **Vertical Tabs Page** | Admin, Secretary, Chairman, Members | General, Settings, Members (no Branding) |
| Import Boards | `/boards/import` | **Vertical Wizard (4 steps)** | Admin | Upload → Map → Validate → Import |

### UI Patterns Used

| Pattern | Pages | Description |
|---------|-------|-------------|
| Index/List Page | Boards Index | Table with filters, tabs, expandable rows |
| Tree View Page | Board Hierarchy | Expandable tree with search |
| **Vertical Wizard** | Create Board (3), Create Committee (4), Import (4) | Steps on left 30%, content right 70% |
| **Vertical Tabs Page** | Board Details, Committee Details | Tabs on left 20%, content right 80% |
| Modal Form | Add Member | Quick action for 4 fields |
| Confirmation Modal | Remove Member, Deactivate | Cascade warning modals |

---

**END OF MODULE 2 PAGE SPECIFICATIONS**
