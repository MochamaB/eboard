# Module 2: Board Management

**Purpose**: Manage the 78 boards (1 Main + 8 Subsidiaries + 69 Factories) in the organization

## What We Need:

### 1. Create and Configure Boards and Committees
- Admin can create new boards and committees
- Board information:
  - Board name (e.g., "Main Board", "KETEPA Limited Board", "Chebut Tea Factory Board", "Audit Committee")
  - **Board type**: Main, Subsidiary, Factory, **Committee (NEW)**
  - **Parent board**: 
    - Subsidiaries linked to Main Board
    - **Committees MUST be linked to parent board** (e.g., Audit Committee → Main Board)
    - Committee members can only be selected from parent board members
  - Zone (for factory boards: e.g., Zone 1, Zone 2, Zone 3, etc.)
  - Board/Committee description
  - Status (Active, Inactive)
- Board-specific settings:
  - Default quorum percentage (e.g., Main Board: 50%, Committees: 60%, Factory Boards: 60%)
  - **Meeting frequency requirement** (per board type):
    - Main Board: Quarterly (4/year)
    - Subsidiaries: Monthly (12/year)
    - Committees: As needed or quarterly (configurable)
    - Factories: Monthly (12/year)
  - Voting thresholds (simple majority, 2/3, unanimous)
  - **Confirmation Requirement**: Whether meetings require confirmation before invitations sent (optional for committees)
  - **Designated Approver**: Who must sign meeting confirmations (Company Secretary, Chairman, etc.)
  - Examples:
    - Main Board: Confirmation required by Company Secretary (mandatory)
    - Audit Committee: Confirmation optional, if required then Committee Chairman signs
    - Factory Boards: Confirmation optional

### 2. Board and Committee Hierarchy Visualization
- Visual tree view showing complete governance structure:
  - **Main Board** at top
    - Main Board Committees (Nomination, HR, Sales & Marketing, Audit/Governance/Risk) as children
  - **8 Subsidiary Boards** as children of Main
    - Each subsidiary's committees (if any) as sub-children
  - **69 Factory Boards** organized by zone
    - Factory committees (if any) as children
- Click any board/committee to see details, members, and recent meetings
- Search and filter by:
  - Name
  - Type (Main, Subsidiary, Factory, Committee)
  - Parent board (for committees)
  - Zone (for factories)
  - Status (Active, Inactive)
- Example hierarchy:
  ```
  Main Board (15 members)
    ├── Nomination Committee (4 members)
    ├── HR Committee (5 members)
    ├── Sales & Marketing Committee (6 members)
    └── Audit Committee (5 members)
  KETEPA Board (8 members)
    └── KETEPA Audit Committee (3 members)
  Chebut Factory Board (7 members)
  ```

### 3. Board and Committee Membership Management
- **For Boards**: Add members to specific boards
- **For Committees (NEW)**:
  - Add members to committees
  - **Member validation**: System only shows users who are members of the parent board
  - Example: When adding members to Audit Committee, only Main Board members appear in dropdown
  - Cannot add someone to committee if they're not on parent board
  - If user is removed from parent board, automatically removed from all child committees
- Assign role for each membership:
  - Boards: Chairman, Vice Chairman, Member, Secretary, Observer
  - Committees: Committee Chairman, Committee Member, Committee Secretary
- Set membership effective dates (start date, optional end date)
- Remove members from boards/committees
- View all members of a specific board/committee
- View all boards AND committees a specific user belongs to
  - Example: "John is member of: Main Board, Audit Committee, HR Committee, KETEPA Board"
- **Cross-committee membership allowed**: User can be on multiple committees simultaneously
- Special rules:
  - Main Board Chairman automatically gets access to all subsidiary boards and all committees
  - Removing user from parent board triggers warning: "User is also on 3 committees. Remove from committees too?"

### 4. Board and Committee Dashboard
- For each board/committee, show:
  - Current members and their roles
  - **For committees**: Parent board name clearly displayed
  - Total meetings held this year
  - Last meeting date
  - Next scheduled meeting
  - Pending action items
  - Document count
  - **Compliance status per board type**:
    - Main Board: Quarterly meetings required (4/year minimum)
    - Subsidiaries: Monthly meetings required (12/year minimum)
    - Committees: Configurable per committee (e.g., Audit: Quarterly, HR: Bi-monthly)
    - Factories: Monthly meetings required (12/year minimum)
  - Compliance indicator: ✓ Compliant / ⚠ Warning / ✗ Non-Compliant

### 5. Board and Committee Activity Monitoring
- List of all active boards and committees with activity indicators
- Identify inactive entities (no meetings in 6+ months)
- Entities with compliance issues (not meeting minimum meeting requirements per board type)
- Entities with low attendance rates
- **Committee-specific monitoring**:
  - Committees with no meetings in current quarter
  - Committees with incomplete membership (fewer than 3 members)
  - Parent-child activity comparison (Main Board active but committees inactive)

### 6. Bulk Board and Committee Operations
- Bulk import factory boards from CSV file
- Bulk create committees for multiple boards (e.g., create Audit Committee for all 8 subsidiaries)
- Assign same user to multiple boards/committees at once:
  - Add Chairman to all 8 subsidiary boards
  - Add user to multiple committees (e.g., add John to Audit, HR, and Nomination committees)
- Apply same settings to multiple entities:
  - All factory boards get same quorum rule
  - All audit committees get same meeting frequency
- Validate committee memberships: "Check that all committee members are on parent boards"

### 7. Board Branding and Customization
- **Logo Configuration**:
  - Upload logo per board/subsidiary (PNG, SVG, max 2MB)
  - Logo displayed in header when organization selected
  - Factories use KTDA parent logo (no individual branding)
  - Committees inherit parent board logo (no separate branding)

- **Color Theme Configuration**:
  - Primary color (buttons, links, sidebar active states)
  - Secondary color (accents, highlights)
  - Sidebar background color
  - Theme mode: Light or Dark
  - Preview theme before saving
  - KTDA Group (All) and KTDA Main Board can share same branding (configurable)

- **Sidebar Menu Configuration**:
  - Enable/disable menu items per board type
  - Default configurations:
    - Main Board: All menu items enabled (Dashboard, Meetings, Documents, Members, Committees, Reports, Settings)
    - Subsidiaries: All menu items enabled
    - Factories: Committees menu hidden (factories typically have no committees)
  - Admin can customize menu items per board

- **Branding Inheritance**:
  - Committees inherit parent board branding (no separate branding)
  - Factory boards use KTDA parent branding (no individual branding)
  - Subsidiaries have individual branding (logo, colors)

- **Organization Selector** (Top Navigation):
  - Hierarchical dropdown replacing simple Board Switcher
  - Structure:
    - **KTDA Group (All)** - Aggregated view across all entities, configurable branding
    - **KTDA Main Board** - Main Board workspace with Main Board branding
    - **Subsidiaries (8)** - Expandable list, each with own branding
    - **Factories by Zone (69)** - Expandable by zone, all use KTDA branding
  - Behavior when organization selected:
    - Header logo changes to selected organization's logo
    - Color theme changes (sidebar, buttons, accents)
    - Sidebar menu items update based on board type configuration
    - Page content filters to selected organization's data
  - **Committees appear as horizontal tabs** within selected board (NOT in Organization Selector)
    - Example: Select "KTDA Main Board" → Tabs show: [Board] [Audit] [HR] [Nomination] [Sales]
    - Clicking committee tab filters content to that committee
    - Committee tabs inherit parent board branding
  - Selection persists across page navigation within session
  - User can set default organization for login in profile settings
