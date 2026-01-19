# Module 2: Board Management - User Flows

**Module**: Board Management  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Browse Boards Index Page
2. Create New Board
3. Create New Committee
4. Edit Board/Committee Settings
5. Add Member to Board
6. Add Member to Committee
7. Remove Member from Board
8. View Board Hierarchy
9. Configure Board Branding
10. Bulk Import Factory Boards
11. Switch Organization Context

---

## Flow 1: Browse Boards Index Page

**Actor**: System Admin / Chairman  
**Flow**: Navigate to Boards → View List → Filter/Search → Select Board

### Steps

1. Navigate to Boards (sidebar menu)
2. **Boards Index Page displays**:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  BOARDS                                     [+ New Board]   │
   ├─────────────────────────────────────────────────────────────┤
   │  [All] [Main Board] [Subsidiaries] [Factories] [Committees] │
   ├─────────────────────────────────────────────────────────────┤
   │  Search: [________________________] [🔍]  Zone: [All ▼]    │
   ├─────────────────────────────────────────────────────────────┤
   │  Board Name        │ Type       │ Members │ Status │ Compl. │
   │  ──────────────────┼────────────┼─────────┼────────┼────────│
   │  KTDA Main Board   │ Main       │ 15      │ Active │ ✓ 100% │
   │  ├─ Audit Comm.    │ Committee  │ 5       │ Active │ ✓ 100% │
   │  ├─ HR Committee   │ Committee  │ 6       │ Active │ ⚠ 83%  │
   │  KETEPA Limited    │ Subsidiary │ 8       │ Active │ ✓ 100% │
   │  Chai Trading Co.  │ Subsidiary │ 7       │ Active │ ✓ 92%  │
   │  Chebut Factory    │ Factory    │ 7       │ Active │ ⚠ 75%  │
   │  Kapkatet Factory  │ Factory    │ 6       │ Active │ ✓ 100% │
   └─────────────────────────────────────────────────────────────┘
   │  Showing 1-20 of 90 boards/committees      [< 1 2 3 4 5 >]  │
   └─────────────────────────────────────────────────────────────┘
   ```
3. **Tab options**:
   - **All**: All boards and committees
   - **Main Board**: Main board only (with committees nested)
   - **Subsidiaries**: All 8 subsidiary boards
   - **Factories**: All 69 factory boards (with Zone filter)
   - **Committees**: All committees across all boards
4. **Filters**:
   - Zone dropdown (for factories)
   - Status: Active / Inactive
   - Compliance: Compliant / Warning / Non-Compliant
5. **Table columns**:
   - Board Name (indented for committees)
   - Type (Main/Subsidiary/Factory/Committee)
   - Member Count
   - Status badge
   - Compliance indicator
   - Actions (View, Edit, Settings)
6. **Click board row** → Navigate to Board Details
7. **Expand/Collapse**: Click arrow to show/hide committees

### Error Flows

- **No boards found**: Show "No boards match your filters"
- **No access**: Redirect to dashboard with error

### Business Rules

- System Admin sees all 78 boards + committees
- Chairman sees all 78 boards + committees
- Board Secretary sees only their assigned boards
- Committees shown nested under parent board
- Compliance calculated from meeting frequency
- Default sort: Type (Main → Subsidiaries → Factories)

---

## Flow 2: Create New Board

**Actor**: System Admin  
**Flow**: Board List → Create Form → Configure Settings → Save

### Steps

1. Navigate to Board Management (sidebar)
2. Click "+ New Board" button
3. Select Board Type: Main / Subsidiary / Factory
4. Enter board information:
   - Board Name (required)
   - Parent Board (auto-set for Subsidiary/Factory)
   - Zone (required for Factory boards)
   - Description (optional)
   - Status: Active (default)
5. Configure board settings:
   - Quorum percentage (default by type)
   - Meeting frequency requirement
   - Voting threshold (Simple Majority default)
   - Confirmation required: Yes/No
   - Designated approver (if confirmation required)
6. Click "Create Board"
7. Success message displayed
8. Redirect to Board Details page

### Error Flows

- **Board name exists**: Show error "Board name already exists"
- **Missing required fields**: Highlight fields, show validation messages
- **Invalid quorum percentage**: Show error "Quorum must be between 1-100%"

### Business Rules

- Only one Main Board allowed in system
- Subsidiary boards automatically linked to Main Board
- Factory boards must have Zone assigned
- Default quorum: Main 50%, Subsidiary 60%, Factory 60%

---

## Flow 3: Create New Committee

**Actor**: System Admin  
**Flow**: Board Details → Add Committee → Select Members → Save

### Steps

1. Navigate to parent board's detail page
2. Click "Committees" tab
3. Click "+ New Committee" button
4. Enter committee information:
   - Committee Name (required)
   - Parent Board (pre-filled, read-only)
   - Description (optional)
   - Status: Active (default)
5. Configure committee settings:
   - Quorum percentage (default 60%)
   - Meeting frequency (Quarterly/Monthly/As Needed)
   - Voting threshold
   - Confirmation required: Yes/No (optional for committees)
   - Designated approver (Committee Chairman default)
6. Add initial members:
   - System shows ONLY parent board members in dropdown
   - Select members and assign roles (Chairman, Member, Secretary)
   - Minimum 3 members recommended
7. Click "Create Committee"
8. Success message displayed
9. Committee appears in parent board's Committees tab

### Error Flows

- **Committee name exists on parent board**: Show error "Committee already exists for this board"
- **No members selected**: Show warning "Committee has no members. Continue anyway?"
- **Selected user not on parent board**: Should not happen (dropdown filtered)

### Business Rules

- Committee members MUST be members of parent board
- Committee inherits parent board branding
- Committee appears as tab when parent board selected in Organization Selector
- One Committee Chairman per committee

---

## Flow 4: Edit Board/Committee Settings

**Actor**: System Admin  
**Flow**: Board Details → Edit → Update Settings → Save

### Steps

1. Navigate to Board/Committee detail page
2. Click "Settings" tab or "Edit" button
3. Modify allowed fields:
   - Name, Description, Status
   - Quorum percentage
   - Meeting frequency
   - Voting threshold
   - Confirmation settings
4. Click "Save Changes"
5. Success message displayed
6. Changes take effect immediately

### Error Flows

- **Deactivating board with scheduled meetings**: Show warning "Board has 3 upcoming meetings. Deactivate anyway?"
- **Changing quorum below current attendance**: Show info only (historical meetings unaffected)

### Business Rules

- Cannot change board type after creation
- Cannot change parent board for committees
- Cannot delete Main Board
- Deactivating board hides it from Organization Selector

---

## Flow 5: Add Member to Board

**Actor**: System Admin / Board Secretary  
**Flow**: Board Details → Members Tab → Add Member → Assign Role

### Steps

1. Navigate to Board detail page
2. Click "Members" tab
3. Click "+ Add Member" button
4. Search/select user from dropdown
   - Shows all active users not already on this board
5. Select role: Chairman / Vice Chairman / Member / Secretary / Observer
6. Set effective date (default: today)
7. Set end date (optional)
8. Click "Add Member"
9. Success message displayed
10. Member appears in members list

### Error Flows

- **User already on board**: User not shown in dropdown
- **Adding second Chairman**: Show error "Board already has a Chairman. Replace existing?"
- **User account inactive**: Show warning "User account is inactive"

### Business Rules

- One Chairman per board
- One Secretary per board (can have multiple if needed)
- Adding Chairman to Main Board grants access to all 78 boards
- Member added receives notification email

---

## Flow 6: Add Member to Committee

**Actor**: System Admin / Board Secretary  
**Flow**: Committee Details → Members Tab → Add Member → Assign Role

### Steps

1. Navigate to Committee detail page (via parent board → Committees tab)
2. Click "Members" tab
3. Click "+ Add Member" button
4. Search/select user from dropdown
   - **CRITICAL**: Shows ONLY users who are members of parent board
5. Select role: Committee Chairman / Committee Member / Committee Secretary
6. Set effective date (default: today)
7. Set end date (optional)
8. Click "Add Member"
9. Success message displayed
10. Member appears in committee members list

### Error Flows

- **User not on parent board**: User not shown in dropdown (filtered out)
- **Adding second Committee Chairman**: Show error "Committee already has a Chairman"

### Business Rules

- Committee members MUST be parent board members
- Dropdown only shows parent board members
- User can be on multiple committees of same parent board
- Committee member added receives notification email

---

## Flow 7: Remove Member from Board

**Actor**: System Admin / Board Secretary  
**Flow**: Board Details → Members Tab → Remove → Confirm

### Steps

1. Navigate to Board detail page
2. Click "Members" tab
3. Find member in list
4. Click "Remove" action (or trash icon)
5. System checks for committee memberships:
   - If member is on child committees, show warning:
     "User is also member of: Audit Committee, HR Committee. Remove from committees too?"
   - Options: "Remove from all" / "Keep on committees" / "Cancel"
6. Confirm removal
7. Success message displayed
8. Member removed from board (and committees if selected)

### Error Flows

- **Removing only Chairman**: Show error "Cannot remove Chairman. Assign new Chairman first."
- **Removing only Secretary**: Show warning "Board will have no Secretary. Continue?"

### Business Rules

- Removing from parent board CAN cascade to child committees (user choice)
- If user chooses "Keep on committees" → user remains on committees but loses parent board access (invalid state - should force removal)
- Actually: Removing from parent board MUST remove from child committees (enforce rule)
- Chairman removal requires replacement first

---

## Flow 8: View Board Hierarchy

**Actor**: Any User (filtered by access)  
**Flow**: Board Management → Hierarchy View → Expand/Collapse → Click Details

### Steps

1. Navigate to Board Management
2. Click "Hierarchy View" tab
3. View tree structure:
   ```
   KTDA Group
   ├── Main Board (15 members) ✓ Compliant
   │   ├── Nomination Committee (4)
   │   ├── HR Committee (5)
   │   ├── Sales & Marketing Committee (6)
   │   └── Audit Committee (5)
   ├── Subsidiaries (8)
   │   ├── KETEPA Limited (8) ✓
   │   │   └── KETEPA Audit Committee (3)
   │   ├── Chai Trading Company (7) ✓
   │   └── ... (6 more)
   └── Factories by Zone (69)
       ├── Zone 1 (12 factories)
       │   ├── Chebut Factory (7) ✓
       │   └── ...
       └── ... (more zones)
   ```
4. Click expand/collapse icons to show/hide children
5. Click any board/committee name to view details
6. Use search box to find specific board
7. Use filters: Type, Zone, Status, Compliance

### Error Flows

- **No access to board**: Board not shown in hierarchy (filtered by user's memberships)

### Business Rules

- Users only see boards they're members of
- Chairman sees all 78 boards + all committees
- Compliance status shown: ✓ Green / ⚠ Yellow / ✗ Red
- Click board → navigates to Board Details page

---

## Flow 9: Configure Board Branding

**Actor**: System Admin  
**Flow**: Board Details → Branding Tab → Upload Logo → Set Colors → Preview → Save

### Steps

1. Navigate to Board detail page (Main Board or Subsidiary only)
2. Click "Branding" tab
3. **Logo Configuration**:
   - Click "Upload Logo"
   - Select file (PNG, SVG, max 2MB)
   - Preview logo in header mockup
   - Option: "Use parent logo" (for subsidiaries)
4. **Color Theme Configuration**:
   - Pick Primary Color (color picker or hex input)
   - Pick Secondary Color
   - Pick Sidebar Background Color
   - Select Theme Mode: Light / Dark
5. **Preview**:
   - Click "Preview" to see full layout with new branding
   - Shows header, sidebar, sample content
6. Click "Save Branding"
7. Success message displayed
8. Branding applies when this board selected in Organization Selector

### Error Flows

- **Invalid file type**: Show error "Only PNG and SVG files allowed"
- **File too large**: Show error "File must be under 2MB"
- **Invalid color format**: Show error "Enter valid hex color (e.g., #1890ff)"

### Business Rules

- Only Main Board and Subsidiaries have custom branding
- Factories use KTDA parent branding (no branding tab)
- Committees inherit parent board branding (no branding tab)
- KTDA Group (All) branding is configurable (can match Main Board)

---

## Flow 10: Bulk Import Factory Boards

**Actor**: System Admin  
**Flow**: Board Management → Import → Upload CSV → Map Columns → Validate → Import

### Steps

1. Navigate to Board Management
2. Click "Import Boards" button
3. Download CSV template (optional)
4. Upload CSV file with factory board data:
   ```csv
   name,zone,description,quorum,status
   "Chebut Tea Factory","Zone 1","Chebut factory board",60,Active
   "Kapkatet Tea Factory","Zone 1","Kapkatet factory board",60,Active
   ```
5. System shows column mapping preview
6. Map CSV columns to board fields
7. Click "Validate"
8. System shows validation results:
   - Valid rows: 65
   - Errors: 4 (duplicate names, invalid zone)
   - Click to see error details
9. Fix errors or proceed with valid rows only
10. Click "Import"
11. Progress bar shows import status
12. Success: "65 factory boards imported successfully"

### Error Flows

- **Invalid CSV format**: Show error "Invalid file format. Download template."
- **Duplicate board names**: Show in validation "Row 5: Board name already exists"
- **Invalid zone**: Show in validation "Row 12: Invalid zone 'Zone X'"
- **Import fails mid-way**: Rollback all, show error

### Business Rules

- Bulk import only for Factory boards
- All imported boards set to Factory type automatically
- Parent board auto-set to Main Board
- Duplicate names rejected
- Import is atomic (all succeed or all fail)

---

## Flow 11: Switch Organization Context

**Actor**: Any User  
**Flow**: Click Organization Selector → Select Board/Subsidiary/Factory → UI Updates

### Steps

1. Click Organization Selector dropdown in header
2. View hierarchical options:
   - KTDA Group (All)
   - KTDA Main Board
   - Subsidiaries (expandable)
   - Factories by Zone (expandable)
3. Click desired organization
4. **UI Updates**:
   - Header logo changes to selected org's logo
   - Color theme updates (sidebar, buttons, accents)
   - Sidebar menu items update (e.g., no Committees for factories)
   - Page content filters to selected organization
5. If board has committees:
   - Committee tabs appear below header
   - Default tab: "Board"
   - Click committee tab to filter to that committee
6. Selection persists across page navigation

### Error Flows

- **No access to selected board**: Board not shown in dropdown (pre-filtered)

### Business Rules

- Users only see boards they're members of in dropdown
- Chairman sees all options
- Factories grouped by Zone in dropdown
- Committees are NOT in dropdown (appear as tabs)
- Selection stored in session (persists until logout)
- User can set default organization in profile settings

---

## Summary: Pages Required for Module 2

| Page | Route | Purpose |
|------|-------|---------|
| Board List | `/boards` | List all boards with filters |
| Board Create | `/boards/create` | Create new board form |
| Board Details | `/boards/:id` | View board info, members, committees |
| Board Edit | `/boards/:id/edit` | Edit board settings |
| Board Branding | `/boards/:id/branding` | Configure logo and colors |
| Committee Create | `/boards/:id/committees/create` | Create committee for board |
| Committee Details | `/committees/:id` | View committee info, members |
| Hierarchy View | `/boards/hierarchy` | Visual tree of all boards |
| Import Boards | `/boards/import` | Bulk import factory boards |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Organization Selector | `TreeSelect` or custom `Dropdown` | Switch board context |
| Committee Tabs | `Tabs` | Switch between board and committees |
| Board Hierarchy Tree | `Tree` | Visual hierarchy display |
| Member Table | `Table` with actions | List and manage members |
| Branding Preview | Custom | Preview logo and colors |
| CSV Import | `Upload` + `Table` | Bulk import with validation |
| Color Picker | `ColorPicker` (antd v5) | Select theme colors |

