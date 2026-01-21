# eBoard Meeting System - UI/UX Specification

**Version**: 1.0  
**Date**: January 15, 2026  
**Technology**: React 18 + TypeScript + Ant Design + Tailwind CSS

---

## 1. Design Principles

- **Clarity**: Clear visual hierarchy, easy-to-understand interfaces
- **Efficiency**: Minimize clicks to reach key features (max 3 clicks)
- **Consistency**: Unified design language across all modules
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- **Responsiveness**: Works seamlessly on desktop (1920px), tablet (768px), mobile (375px)
- **Professional**: Enterprise-grade design suitable for board governance

---

## 2. Component Library (Ant Design)

### 2.1 Form Components

| Component | Ant Design | Usage | Validation |
|-----------|-----------|-------|------------|
| Text Input | `Input` | Name, email, general text | Required, max length, pattern |
| Email Input | `Input type="email"` | Email addresses | Email format, unique |
| Phone Input | `Input` with mask | Phone numbers | Format: +254XXXXXXXXX |
| Password Input | `Input.Password` | Passwords, PINs | Min 12 chars, complexity |
| Number Input | `InputNumber` | Numeric values, durations | Min/max, step |
| Textarea | `Input.TextArea` | Descriptions, notes | Max length, rows |
| Date Picker | `DatePicker` | Single dates | Date range validation |
| Date Range | `DatePicker.RangePicker` | Start/end dates | End > Start |
| Time Picker | `TimePicker` | Meeting times | Format: 24h or 12h |
| Select | `Select` | Dropdowns (roles, boards) | Required, options |
| Multi-Select | `Select mode="multiple"` | Multiple boards | Min/max selections |
| Auto Complete | `AutoComplete` | Search with suggestions | Async data loading |
| Radio Group | `Radio.Group` | Mutually exclusive options | Required |
| Checkbox | `Checkbox` | Multiple selections | Min selections |
| Switch | `Switch` | Toggle on/off | Boolean values |
| File Upload | `Upload` | Documents, certificates | File type, size (100MB max) |
| Rich Text Editor | `ReactQuill` or TinyMCE | Meeting minutes, descriptions | HTML sanitization |

**Validation States:**
- Default (gray border)
- Focus (blue border)
- Success (green border + checkmark)
- Error (red border + error message below)
- Disabled (gray background)

---

### 2.2 Data Display Components

| Component | Ant Design | Usage |
|-----------|-----------|-------|
| Table | `Table` | User lists, board lists, meeting lists |
| Tree | `Tree` | Board hierarchy, committee structure |
| List | `List` | Notifications, activity logs |
| Card | `Card` | Dashboard widgets, summary cards |
| Descriptions | `Descriptions` | User profile details, meeting info |
| Statistic | `Statistic` | Dashboard metrics (meeting count, attendance %) |
| Tag | `Tag` | Status badges (Active, Inactive) |
| Badge | `Badge` | Board types (Main=blue, Committee=purple) |
| Avatar | `Avatar` | User profile pictures |
| Timeline | `Timeline` | Activity logs, audit trail |
| Calendar | `Calendar` | Meeting calendar view |

**Table Configuration:**
- **Features**: Sorting, filtering, pagination, row selection, expandable rows
- **Pagination**: 10, 25, 50, 100 per page
- **Actions Column**: Edit, Delete, View (icon buttons on right)
- **Export**: CSV, Excel, PDF buttons above table
- **Responsive**: Stacks on mobile, horizontal scroll on tablet

---

### 2.3 Navigation Components

**Top Navigation Bar:**
```jsx
<Layout.Header>
  - Logo (left)
  - Global Search (Ant Design: AutoComplete)
  - Board Switcher (Select dropdown if user on multiple boards)
  - Notifications (Badge with count)
  - User Profile (Dropdown menu)
</Layout.Header>
```

**Sidebar Navigation:**
```jsx
<Layout.Sider collapsible>
  - Menu (Ant Design: Menu)
    - Dashboard
    - Meetings
    - Documents
    - Reports
    - Settings
    - User Management
    - Board Management
  - Active state highlighting
  - Icons (from @ant-design/icons)
</Layout.Sider>
```

**Breadcrumbs:**
```jsx
<Breadcrumb>
  Home > User Management > Add User
</Breadcrumb>
```

---

### 2.4 Feedback Components

**Notifications:**
- **Toast Messages**: `message.success()`, `message.error()`, `message.warning()`, `message.info()`
  - Position: Top-center
  - Duration: 3 seconds (auto-dismiss)
  - Actions: None (informational only)
  
- **Notification Drawer**: `notification.open()`
  - Position: Top-right
  - Duration: 4.5 seconds or manual dismiss
  - Actions: Click to navigate, dismiss button
  - Use for: Important updates, meeting invitations

- **Alert Banners**: `Alert`
  - Position: Top of content area
  - Types: success, info, warning, error
  - Closable: Yes (X icon)
  - Use for: Persistent messages (account pending approval, certificate expiring)

**Loading States:**
- **Button Loading**: `Button loading={true}`
- **Spin**: `Spin` for page/section loading
- **Skeleton**: `Skeleton` for table/card placeholders while data loads
- **Progress Bar**: `Progress` for file uploads, multi-step processes

**Modals:**
- **Confirmation Dialog**: `Modal.confirm()` - Delete, Remove actions
- **Form Modal**: `Modal` - Quick forms (Add to Board, Change Role)
- **Info Modal**: `Modal` with read-only content
- **Sizes**: Small (400px), Medium (600px), Large (800px), Fullscreen

---

### 2.5 Button Components

| Type | Style | Usage | Color |
|------|-------|-------|-------|
| Primary | `type="primary"` | Main actions (Create, Save, Submit) | Blue |
| Default | `type="default"` | Secondary actions (Cancel, Back) | White/Gray |
| Dashed | `type="dashed"` | Alternative actions (Add Another) | Dashed border |
| Text | `type="text"` | Minimal actions (Edit, View Details) | No background |
| Link | `type="link"` | Link-style actions | Underline on hover |
| Danger | `danger` | Destructive actions (Delete, Remove) | Red |

**Sizes**: `size="small"` (24px), `size="middle"` (32px - default), `size="large"` (40px)

**States**: Default, Hover, Active, Disabled, Loading

**Icon Buttons**: `Button icon={<EditOutlined />}` or `Button shape="circle"`

---

### 2.6 Wizard/Stepper Components

**Vertical Stepper** (for complex flows like User Registration):
```jsx
<Steps direction="vertical" current={currentStep}>
  <Steps.Step title="Basic Information" />
  <Steps.Step title="Role Selection" />
  <Steps.Step title="Board Assignment" />
  <Steps.Step title="Review & Confirm" />
</Steps>
```
- Step indicator on left (30% width)
- Form content on right (70% width)
- Progress: Completed (checkmark), Active (number), Upcoming (gray)
- Navigation: Back/Next buttons at bottom

**Horizontal Stepper** (for short flows):
```jsx
<Steps current={currentStep}>
  <Steps.Step title="Step 1" />
  <Steps.Step title="Step 2" />
  <Steps.Step title="Step 3" />
</Steps>
```
- Steps across top
- Content below
- Use for 6+ step processes or combined multi-flow wizards

---

### 2.7 UI Pattern Selection Rules

Use these rules to determine the correct UI pattern for each operation type.

#### 2.7.1 CREATE Operations

| Condition | UI Pattern | Layout | Example |
|-----------|------------|--------|---------|
| 1 logical section | **Single Page Form** | Full page with sidebar | Create simple record |
| 2-5 steps | **Vertical Wizard** | Full page, steps on left (30%), content right (70%) | Create Board (3 steps), Create User (5 steps) |
| 6+ steps or combined flows | **Horizontal Wizard** | Full page, steps across top | Meeting Creation with sub-flows |

**Important**: Create forms are ALWAYS full page. Never use modals for create operations.

#### 2.7.2 EDIT Operations

| Condition | UI Pattern | Layout | Example |
|-----------|------------|--------|---------|
| 1-2 fields inline | **Popover Edit** | Inline popover | Change user role |
| Single section | **Single Page Form** | Full page with sidebar | Edit basic info |
| Multiple sections | **Vertical Tabs Page** | Full page, tabs on left | Board Details (Info, Settings, Members) |
| Multi-step process | **Vertical Wizard** | Full page (rare for edit) | Complex reconfiguration |

**Important**: Edit forms are ALWAYS full page with vertical tabs for multiple sections. Never use modals for edit operations.

#### 2.7.3 VIEW/DETAIL Operations

| Condition | UI Pattern | Layout | Example |
|-----------|------------|--------|---------|
| Single entity, multiple aspects | **Detail Page with Vertical Tabs** | Full page, tabs on left | User Profile, Board Details |
| List of items | **Index Page with Table** | Full page with filters | Users List, Boards List |
| Hierarchical data | **Tree View** | Full page with expandable tree | Board Hierarchy |

#### 2.7.4 QUICK ACTIONS (Modal/Popover Allowed)

Modals and popovers are ONLY used for:

| Action Type | UI Pattern | Example |
|-------------|------------|---------|
| Simple yes/no confirmation | **Popconfirm** | Delete item, Remove member |
| Cascade warning confirmation | **Confirmation Modal** | Remove from board (affects committees) |
| Quick selection (1-2 fields) | **Modal Form** | Add existing member to board (select user + role) |
| Inline field edit | **Popover** | Change role dropdown |

**Never use modals for**:
- Creating new entities (users, boards, meetings)
- Editing multiple fields
- Multi-step processes
- Complex forms with validation

#### 2.7.5 Wizard Step Count Rules

| Steps | Orientation | Layout |
|-------|-------------|--------|
| 2-5 steps | **Vertical** | Steps sidebar on left (30%), content on right (70%) |
| 6+ steps | **Horizontal** | Steps bar across top, content below |

**Vertical Wizard Layout**:
```
┌───────────────┬─────────────────────────────────────────┐
│  STEPS        │  STEP CONTENT                           │
│  ───────────  │  ─────────────────────────────────────  │
│  ● Step 1     │                                         │
│  ○ Step 2     │  [Form fields for current step]         │
│  ○ Step 3     │                                         │
│               │                    [Cancel]  [Next →]   │
└───────────────┴─────────────────────────────────────────┘
```

**Horizontal Wizard Layout** (6+ steps):
```
┌─────────────────────────────────────────────────────────┐
│ [●1 Info] → [○2 Details] → [○3 Config] → ... → [○6 Review] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Form fields for current step]                         │
│                                                         │
│                           [← Back]  [Cancel]  [Next →]  │
└─────────────────────────────────────────────────────────┘
```

#### 2.7.6 Edit Page Tabs Layout

For edit pages with multiple sections, use vertical tabs:

```
┌───────────────┬─────────────────────────────────────────┐
│  TABS         │  TAB CONTENT                            │
│  ───────────  │  ─────────────────────────────────────  │
│  ● General    │                                         │
│  ○ Settings   │  [Form fields for current tab]          │
│  ○ Members    │                                         │
│  ○ Branding   │                         [Save Changes]  │
└───────────────┴─────────────────────────────────────────┘
```

#### 2.7.7 Decision Flowchart

```
Is it a CREATE operation?
├── Yes → How many steps?
│         ├── 1 section → Single Page Form
│         ├── 2-5 steps → Vertical Wizard (full page)
│         └── 6+ steps → Horizontal Wizard (full page)
│
├── Is it an EDIT operation?
│   ├── Yes → How many sections?
│   │         ├── 1-2 fields → Popover (inline)
│   │         ├── 1 section → Single Page Form
│   │         └── Multiple sections → Vertical Tabs Page
│
├── Is it a VIEW operation?
│   ├── Yes → Detail Page with Vertical Tabs
│
├── Is it a DELETE/REMOVE?
│   ├── Yes → Simple? → Popconfirm
│   │         Has cascade? → Confirmation Modal
│
└── Is it a quick selection (add existing item)?
    └── Yes → Modal Form (1-2 fields only)
```

---

### 2.8 Specialized Components

**Meeting-Specific:**
- **Calendar**: `Calendar` for month/week/day views
- **Video Grid**: Custom grid layout (CSS Grid) for participants
- **Meeting Status Badge**: `Badge` with colors:
  - Draft (gray)
  - Pending Confirmation (orange)
  - Confirmed (blue)
  - In Progress (green)
  - Completed (green)
  - Cancelled (red)
- **Participant List**: `List` with `Avatar` and online status indicator

**Board-Specific:**
- **Board Type Badge**: `Tag` with colors:
  - Main Board (blue - `color="blue"`)
  - Subsidiary (green - `color="green"`)
  - Factory (gold - `color="gold"`)
  - Committee (purple - `color="purple"`)
- **Hierarchy Tree**: `Tree` with checkboxes for selection
- **Compliance Indicator**: `Badge status="success/warning/error"` with icons

**Document-Specific:**
- **PDF Viewer**: `iframe` or React-PDF component in Modal
- **Document List**: `Table` with download/preview actions
- **Version History**: `Timeline` showing document versions
- **Digital Signature Display**: Custom component showing certificate details

**MFA-Specific:**
- **QR Code**: `QRCode` from `antd` (v5+) or `qrcode.react`
- **6-Digit Code Input**: Custom component (6 separate inputs with auto-focus)

---

## 3. Page Layouts

### 3.1 Main Application Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Top Navigation (64px height)                                    │
│ [Org Logo] [KETEPA Limited ▼] [Search]       [🔔] [User Avatar] │
│            ↑ Organization Selector                              │
├────────┬────────────────────────────────────────────────────────┤
│        │ ┌─────────────────────────────────────────────────┐   │
│ Sidebar│ │ [Board] [Audit] [Finance] [HR]  ← Committee Tabs │   │
│ (themed│ └─────────────────────────────────────────────────┘   │
│ colors)│                                                        │
│        │ Breadcrumbs: Home > Meetings                          │
│ 📊 Dash│ ─────────────────────────────────────────────────────  │
│ 📅 Meet│                                                        │
│ � Docs│ Page Header: Meetings              [+ New Meeting]    │
│ 👥 Memb│ ─────────────────────────────────────────────────────  │
│ � Repo│                                                        │
│ ⚙️ Sett│ [Filters/Search Bar]                                  │
│        │                                                        │
│ (Menu  │ ┌──────────────────────────────────────┐              │
│ items  │ │                                       │              │
│ vary by│ │      Main Content                    │              │
│ board  │ │      (Table / Form / Cards / Grid)   │              │
│ type)  │ │                                       │              │
│        │ └──────────────────────────────────────┘              │
│        │                                                        │
│        │ [Pagination or Action Buttons]                        │
└────────┴────────────────────────────────────────────────────────┘
```

**Organization Selector Dropdown Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏢 KTDA GROUP                                                   │
│    ○ All Entities (Aggregated View)                            │
│ ─────────────────────────────────────────────────────────────  │
│ 🔵 MAIN BOARD                                                   │
│    ○ KTDA Main Board                                           │
│ ─────────────────────────────────────────────────────────────  │
│ 🟢 SUBSIDIARIES (8)                                             │
│    ○ All Subsidiaries                                          │
│    ○ KETEPA Limited                                            │
│    ○ Chai Trading Company                                      │
│    ○ KTDA MS Limited                                           │
│    ○ Greenland Fedha                                           │
│    ○ Majani Insurance                                          │
│    ○ KTDA Power                                                │
│    ○ TEMEC                                                     │
│    ○ KTDA Foundation                                           │
│ ─────────────────────────────────────────────────────────────  │
│ 🟡 FACTORIES BY ZONE (69)                                       │
│    ○ All Factories                                             │
│    ▶ Zone 1 (expand to see factories)                          │
│    ▶ Zone 2                                                    │
│    ▶ Zone 3                                                    │
│    ▶ ... (more zones)                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Branding Behavior by Selection:**

| Selection | Logo | Colors | Sidebar Menu | Committee Tabs |
|-----------|------|--------|--------------|----------------|
| KTDA Group (All) | KTDA Logo | Configurable (can match Main Board) | Full menu | Hidden |
| KTDA Main Board | KTDA Logo | KTDA Main theme | Full menu | [Board] [Audit] [HR] [Nomination] [Sales] |
| KETEPA Limited | KETEPA Logo | KETEPA theme | Full menu | [Board] + KETEPA committees |
| Other Subsidiaries | Subsidiary Logo | Subsidiary theme | Full menu | [Board] + their committees |
| All Factories | KTDA Logo | KTDA theme | No Committees menu | Hidden |
| Zone X Factories | KTDA Logo | KTDA theme | No Committees menu | Hidden |
| Specific Factory | KTDA Logo | KTDA theme | No Committees menu | Hidden |

**Committee Tabs Behavior:**
- Appear only when a board with committees is selected
- First tab "[Board]" shows parent board data
- Other tabs show respective committee data
- Clicking tab filters all page content to that committee
- Tabs inherit parent board branding (no separate colors)

**Implementation:**
```jsx
<Layout style={{ minHeight: '100vh' }}>
  <Layout.Header>
    <div className="logo">{/* Dynamic org logo */}</div>
    <OrganizationSelector 
      value={currentOrg} 
      onChange={handleOrgChange} 
    />
    <Input.Search placeholder="Search..." />
    <Badge count={notifications.length}>
      <BellOutlined />
    </Badge>
    <UserDropdown />
  </Layout.Header>
  <Layout>
    <Layout.Sider 
      collapsible 
      style={{ background: currentOrg.sidebarColor }}
    >
      <Menu items={getMenuItems(currentOrg.boardType)} />
    </Layout.Sider>
    <Layout.Content style={{ padding: 24 }}>
      {currentOrg.committees?.length > 0 && (
        <Tabs 
          activeKey={activeCommittee} 
          onChange={setActiveCommittee}
          items={[
            { key: 'board', label: 'Board' },
            ...currentOrg.committees.map(c => ({ key: c.id, label: c.name }))
          ]}
        />
      )}
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Page Title" extra={[<Button type="primary">+ New</Button>]} />
      <Card>
        {/* Page Content filtered by currentOrg and activeCommittee */}
      </Card>
    </Layout.Content>
  </Layout>
</Layout>
```

---

### 3.2 Page Templates

**Dashboard Page:**
- Grid of statistics cards (`Row` + `Col` + `Card`)
- Quick action buttons
- Recent activity list
- Upcoming meetings calendar widget

**List Page** (Users, Boards, Meetings):
- Search bar + filters (top)
- Add/Import buttons (top right)
- Data table with pagination
- Bulk action toolbar (when rows selected)

**Detail/Profile Page** (User Profile, Board Details):
- Tabs (`Tabs`) for different sections
- Edit button (if permissions allow)
- Metadata sidebar or bottom section

**Form Page** (Create/Edit):
- Wizard stepper (if multi-step)
- OR Single-page form with sections
- Save/Cancel buttons (bottom or sticky footer)
- Auto-save draft indicator

**Meeting Page** (During Meeting):
- Video grid (main area, 70%)
- Sidebar (participants, chat, documents - 30%)
- Bottom toolbar (mic, camera, share screen, leave)
- Agenda panel (collapsible)

**Settings Page:**
- Vertical tabs on left (30%)
- Settings panels on right (70%)
- Save button per section

---

### 3.3 Responsive Breakpoints

```css
/* Ant Design default breakpoints */
xs: 0-575px    /* Mobile - Stack all columns, hide sidebar */
sm: 576-767px  /* Mobile landscape - Stack, collapsible sidebar */
md: 768-991px  /* Tablet - 2 columns, collapsible sidebar */
lg: 992-1199px /* Desktop - Full layout */
xl: 1200-1599px /* Large desktop */
xxl: 1600px+   /* Extra large desktop */
```

**Responsive Behavior:**
- **Mobile (xs, sm)**: Sidebar hidden by default (drawer on menu icon), single column layout, tables scroll horizontally
- **Tablet (md)**: Sidebar collapsible, 2-column grids, tables fit or scroll
- **Desktop (lg+)**: Full sidebar, multi-column grids, tables fit

---

## 4. Color Palette

### 4.1 Primary Colors (Ant Design Defaults)

```
Primary Blue:   #1890ff  (buttons, links, Main Board)
Success Green:  #52c41a  (success messages, Subsidiaries)
Warning Orange: #faad14  (warnings, Factories, pending status)
Error Red:      #f5222d  (errors, danger buttons)
Info Cyan:      #13c2c2  (info messages)
Purple:         #722ed1  (Committees)
```

### 4.2 Neutral Colors

```
Text Primary:   rgba(0, 0, 0, 0.85)
Text Secondary: rgba(0, 0, 0, 0.65)
Text Disabled:  rgba(0, 0, 0, 0.25)
Border:         #d9d9d9
Background:     #f0f2f5
Card:           #ffffff
```

### 4.3 Board Type Colors

```css
.board-main { color: #1890ff; }       /* Blue */
.board-subsidiary { color: #52c41a; } /* Green */
.board-factory { color: #faad14; }    /* Gold */
.board-committee { color: #722ed1; }  /* Purple */
```

### 4.4 Status Colors

```css
.status-draft { color: #8c8c8c; }           /* Gray */
.status-pending { color: #faad14; }         /* Orange */
.status-confirmed { color: #1890ff; }       /* Blue */
.status-in-progress { color: #52c41a; }     /* Green */
.status-completed { color: #52c41a; }       /* Green */
.status-cancelled { color: #f5222d; }       /* Red */
```

---

## 5. Typography

### 5.1 Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;
```

### 5.2 Font Sizes

```css
h1: 38px (Page titles)
h2: 30px (Section headers)
h3: 24px (Subsection headers)
h4: 20px (Card titles)
body: 14px (Default text)
small: 12px (Secondary text, captions)
```

### 5.3 Font Weights

```css
Regular: 400 (Body text)
Medium:  500 (Emphasized text)
Semibold: 600 (Subheadings)
Bold:    700 (Headings)
```

---

## 6. Spacing System

Use multiples of 8px for consistency:

```css
xs: 8px   (tight spacing)
sm: 16px  (default spacing)
md: 24px  (comfortable spacing - default page padding)
lg: 32px  (section spacing)
xl: 48px  (major section breaks)
```

**Ant Design Grid System:**
- 24-column grid
- Gutter: 16px default
- Responsive: `<Col xs={24} sm={12} md={8} lg={6} xl={4}>`

---

## 7. Navigation Structure (Sitemap)

```
eBoard System
│
├── Dashboard (/)
│   ├── My Boards Widget
│   ├── Upcoming Meetings Widget
│   ├── Pending Actions Widget
│   └── Recent Activity Widget
│
├── User Management (/users)
│   ├── User List
│   ├── Add User (Wizard)
│   ├── User Profile (/users/:id)
│   │   ├── Details Tab
│   │   ├── Board Memberships Tab
│   │   ├── Activity Log Tab
│   │   └── Security Settings Tab
│   └── Bulk Import
│
├── Board Management (/boards)
│   ├── Board List
│   ├── Board Hierarchy (Tree View)
│   ├── Add Board/Committee
│   └── Board Details (/boards/:id)
│       ├── Overview Tab
│       ├── Members Tab
│       ├── Meetings Tab
│       ├── Documents Tab
│       └── Settings Tab
│
├── Meetings (/meetings)
│   ├── Meeting Calendar
│   ├── Meeting List
│   ├── Create Meeting (Wizard)
│   ├── Meeting Details (/meetings/:id)
│   │   ├── Overview Tab
│   │   ├── Participants Tab
│   │   ├── Agenda Tab
│   │   ├── Documents Tab
│   │   ├── Votes Tab
│   │   └── Minutes Tab
│   └── Live Meeting (/meetings/:id/live)
│       ├── Video Grid
│       ├── Participant Sidebar
│       ├── Chat Panel
│       └── Control Toolbar
│
├── Documents (/documents)
│   ├── Document Library (Board-filtered)
│   ├── Upload Documents
│   ├── Document Preview Modal
│   └── Document Versions
│
├── Reports (/reports)
│   ├── Meeting Summary
│   ├── Attendance Analytics
│   ├── Action Items
│   ├── Compliance Dashboard
│   └── System Usage
│
└── Settings (/settings)
    ├── Profile Settings
    ├── Board Settings (if admin)
    ├── Security (MFA, Password, Certificate)
    ├── Notifications Preferences
    └── System Admin (if admin)
        ├── User Management
        ├── System Configuration
        ├── Audit Logs
        └── Backup & Recovery
```

---

## 8. Accessibility Guidelines

### 8.1 Keyboard Navigation
- All interactive elements accessible via Tab
- Escape closes modals/dropdowns
- Arrow keys navigate menus, lists, calendar
- Enter/Space activates buttons, checkboxes

### 8.2 Screen Reader Support
- ARIA labels on all form fields
- ARIA roles on custom components
- Alt text on images/icons
- Semantic HTML (nav, main, aside, section)

### 8.3 Visual Accessibility
- Color contrast ratio: 4.5:1 minimum (WCAG AA)
- Focus indicators visible on all interactive elements
- Error messages not relying solely on color
- Text resizable up to 200%

### 8.4 Ant Design Accessibility
- Most Ant Design components are accessible by default
- Ensure custom components maintain accessibility
- Test with screen readers (NVDA, JAWS, VoiceOver)

---

## 9. Component Usage Examples

### Example 1: User Registration Wizard

```jsx
<Steps direction="vertical" current={currentStep}>
  <Steps.Step title="Basic Information" />
  <Steps.Step title="Role Selection" />
  <Steps.Step title="Board Assignment" />
  <Steps.Step title="Review" />
</Steps>

<Form layout="vertical">
  {currentStep === 0 && (
    <>
      <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
        <Input placeholder="Enter full name" />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
        <Input type="email" placeholder="user@ktda.co.ke" />
      </Form.Item>
    </>
  )}
  
  {currentStep === 1 && (
    <Form.Item label="Role" name="role" rules={[{ required: true }]}>
      <Select placeholder="Select role">
        <Select.Option value="admin">System Administrator</Select.Option>
        <Select.Option value="secretary">Board Secretary</Select.Option>
        <Select.Option value="member">Board Member</Select.Option>
      </Select>
    </Form.Item>
  )}
</Form>

<Space style={{ marginTop: 24 }}>
  {currentStep > 0 && <Button onClick={handleBack}>Back</Button>}
  {currentStep < 3 && <Button type="primary" onClick={handleNext}>Next</Button>}
  {currentStep === 3 && <Button type="primary" onClick={handleSubmit}>Create User</Button>}
</Space>
```

### Example 2: Board List Table

```jsx
<Table
  dataSource={boards}
  columns={[
    {
      title: 'Board Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => (
        <Link to={`/boards/${record.id}`}>{text}</Link>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Main', value: 'main' },
        { text: 'Subsidiary', value: 'subsidiary' },
        { text: 'Factory', value: 'factory' },
        { text: 'Committee', value: 'committee' },
      ],
      render: (type) => (
        <Tag color={getBoardTypeColor(type)}>{type}</Tag>
      )
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
        </Space>
      )
    }
  ]}
  pagination={{ pageSize: 25 }}
  rowSelection={{ type: 'checkbox' }}
/>
```

---

## 10. Design System Resources

**Ant Design:**
- Documentation: https://ant.design/components/overview/
- Figma UI Kit: https://ant.design/docs/resources (for wireframing)
- Icons: @ant-design/icons (1000+ icons)

**Tailwind CSS:**
- Documentation: https://tailwindcss.com/docs
- Play CDN: For quick prototyping

**Color Tools:**
- Ant Design Colors: https://ant.design/docs/spec/colors
- Coolors: https://coolors.co/ (palette generator)

**Admin Templates (Reference):**
- Ant Design Pro: https://pro.ant.design/ (React, free, open-source)
- Ant Design Admin: https://github.com/zuiidea/antd-admin

---

## 11. Implementation Notes

### 11.1 Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Buttons, Inputs, Cards
│   ├── layout/         # AppLayout, Sidebar, Header
│   ├── forms/          # FormWizard, CustomForm
│   └── tables/         # DataTable, TreeTable
├── pages/              # Page components
│   ├── Dashboard/
│   ├── Users/
│   ├── Boards/
│   ├── Meetings/
│   └── Settings/
├── services/           # API calls (Axios)
├── store/              # Redux/Zustand state
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── assets/             # Images, fonts, icons
└── styles/             # Global CSS, Tailwind config
```

### 11.2 State Management Strategy

**Local State:** Component-level state (useState) for form inputs, UI toggles
**Global State:** Redux Toolkit or Zustand for:
- User authentication & profile
- Current board context
- Real-time notifications
- Meeting state (when live)

### 11.3 API Integration

```typescript
// Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    message.error(error.response?.data?.message || 'An error occurred');
    return Promise.reject(error);
  }
);
```

---

**END OF UI/UX SPECIFICATION**
