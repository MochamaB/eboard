# Module 11: Reporting and Analytics

**Purpose**: Generate consolidated and board-specific reports across all 78 boards

## What We Need:

### 1. Meeting Summary Report (Consolidated and Per-Board/Committee)
- **Consolidated Report**: All meetings across all boards AND committees in date range
  - Group by entity type (Main, Subsidiary, Factory, **Committee**)
  - Total meetings examples:
    - Main Board: 12 meetings
    - Main Board Committees: 24 meetings (4 committees × 6 meetings avg)
    - Subsidiaries: 96 meetings
    - Factories: 828 meetings
- **Per-Entity Report**: Meetings for specific board or committee
- **Committee Aggregation**: Show committee meetings alongside parent board
  - Example: "Main Board Governance (16 meetings): Main Board (12) + Audit Committee (4)"
- **Chairman View**: Access to reports across all boards and committees
- **User View**: Reports only for boards/committees they're members of
- Meeting status, attendance, duration
- Decisions made and votes taken
- **Guest participation statistics**: Number of guests, presentation topics
- Export to PDF or Excel with board/committee breakdown

### 2. Attendance Analytics (Multi-Board and Committee)
- **Per-Entity Attendance**: Attendance rate per member per board/committee
  - Example: "John: Main Board 85%, Audit Committee 90%, KETEPA 80%, Chebut Factory 75%"
- **Consolidated Attendance**: Overall attendance across all boards and committees
- **Cross-Entity Comparison**: Compare attendance rates across boards and committees
- **Committee-Specific Analytics**:
  - Committee attendance vs parent board attendance
  - Members active on parent board but absent from committees
- Attendance trends over time (graph) per entity or consolidated
- Meetings where quorum was not met (by board/committee)
- Late arrivals and early departures (by entity)
- Most and least attended entities
- **Identify overloaded members**: Members on too many boards/committees
  - Example: "John is on 1 board + 5 committees (potentially overloaded)"

### 3. Action Items Report (Consolidated Across Boards and Committees)
- **Consolidated View**: All open action items across all boards AND committees user is member of
- **Per-Entity View**: Action items from specific board or committee
- **Chairman View**: Action items across all boards (78) and committees
- Overdue action items (past due date) with board/committee identification
- Completed action items by entity
- Action items by assignee across all entities:
  - Example: "John has 20 pending action items: 5 from Main Board, 3 from Audit Committee, 4 from HR Committee, 3 from KETEPA, 5 from factories"
- Action item completion rate per board/committee
- **Committee action item flow**: Track if committee recommendations become board action items
- Identify assignees with overdue items

### 4. Document Usage Report
- Most downloaded documents
- Document view counts
- Storage usage statistics
- Documents not accessed in 6+ months

### 5. Compliance Report (Critical for Boards and Committees)
- **System-Wide Compliance Dashboard**:
  - Total entities: ~90-100 (78 boards + committees)
  - Boards: 78 (1 Main + 8 Subsidiaries + 69 Factories)
  - Committees: Variable (estimate 10-20)
  - Entities meeting requirements: 85 of 90 (94%)
  - Entities not meeting requirements: 5 entities (list them with entity type)
- **Per-Entity Compliance by Type**:
  - **Main Board**: Quarterly meetings = 4/year required
  - **Subsidiaries**: Monthly meetings = 12/year required
  - **Committees**: Per committee configuration (e.g., Audit: Quarterly = 4/year, HR: Bi-monthly = 6/year)
  - **Factories**: Monthly meetings = 12/year required
  - Compliance status: ✓ Compliant / ⚠ Warning / ✗ Non-Compliant
- **Regional Compliance** (for factories):
  - Kiambu Region: 9 of 10 factories compliant
  - Kisii Region: 12 of 13 factories compliant
- **Committee Compliance**:
  - Committees meeting frequency requirements
  - Committees with quorum issues
  - Parent board compliant but committees non-compliant (flag for attention)
- Quorum achievement rate per entity
- Minutes approval time (days from meeting to approval) per entity
- Voting participation rate per entity
- Alert for entities with no meetings in 6+ months

### 6. System Usage Statistics (Admin - Multi-Board and Committee)
- Active users count (total, per board, per committee)
- Most active entities (by meeting count)
- Least active entities (potential issues)
- Peak usage times
- Storage capacity used (total, per board type, per committee)
- Bandwidth consumption
- **Entity membership distribution**:
  - Users on 1 entity only: 150 users
  - Users on 2-5 entities: 80 users
  - Users on 6-10 entities: 30 users
  - Users on 11+ entities: 10 users (potentially overloaded)
- **Committee vs Board membership**:
  - Users on boards but no committees: 100 users
  - Users on multiple committees: 50 users
- **Guest/Presenter usage**:
  - Number of unique guests in system
  - Most frequent presenters
  - Guest presentations per month
- Chairman dashboard usage statistics
