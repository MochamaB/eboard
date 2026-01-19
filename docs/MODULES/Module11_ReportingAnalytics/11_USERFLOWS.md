# Module 11: Reporting and Analytics - User Flows

**Module**: Reporting and Analytics  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. View Dashboard Overview
2. Generate Meeting Summary Report
3. View Attendance Analytics
4. Generate Action Items Report
5. View Document Usage Report
6. Generate Compliance Report
7. View System Usage Statistics (Admin)
8. Schedule Automated Reports
9. Export Report Data
10. Chairman Consolidated Dashboard

---

## Flow 1: View Dashboard Overview

**Actor**: Board/Committee Member  
**Flow**: Login → Dashboard → View Key Metrics

### Steps

1. User logs in to eBoard
2. Dashboard displays based on role:
   - **Regular Member**: Their boards/committees only
   - **Secretary**: Their boards with management metrics
   - **Chairman**: All 78 boards + committees
3. **Dashboard widgets**:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │  DASHBOARD                                              │
   ├─────────────────────────────────────────────────────────┤
   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
   │  │ Upcoming    │ │ Action      │ │ Documents   │       │
   │  │ Meetings    │ │ Items       │ │ Pending     │       │
   │  │     5       │ │    12       │ │     3       │       │
   │  └─────────────┘ └─────────────┘ └─────────────┘       │
   │                                                         │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │ UPCOMING MEETINGS                                │   │
   │  │ • [Main Board] Q1 Review - Tomorrow 10:00 AM    │   │
   │  │ • [Audit Comm] Monthly Review - Jan 20          │   │
   │  │ • [KETEPA] Budget Meeting - Jan 22              │   │
   │  └─────────────────────────────────────────────────┘   │
   │                                                         │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │ ACTION ITEMS DUE SOON                            │   │
   │  │ • Prepare Q1 budget - Due Jan 18 [Main Board]   │   │
   │  │ • Review audit findings - Due Jan 19 [Audit]    │   │
   │  └─────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────┘
   ```
4. Click any widget to drill down
5. Organization Selector filters dashboard content

### Error Flows

- **No data**: Show "No upcoming meetings or tasks"

### Business Rules

- Dashboard personalized per user
- Shows only user's boards/committees
- Chairman sees consolidated view
- Real-time data updates
- Configurable widget layout

---

## Flow 2: Generate Meeting Summary Report

**Actor**: Secretary / Chairman  
**Flow**: Reports → Meeting Summary → Configure → Generate

### Steps

1. Navigate to Reports → Meeting Summary
2. **Configure report**:
   - Scope:
     - Single board/committee
     - Multiple boards (Chairman)
     - All boards (Chairman only)
   - Date range: Last 6 months
   - Group by: Board Type / Month / Status
3. Click "Generate Report"
4. **Report displays**:
   ```
   MEETING SUMMARY REPORT
   Period: July 2025 - January 2026
   
   CONSOLIDATED SUMMARY
   Total Meetings: 156
   ├── Main Board: 12 meetings
   ├── Main Board Committees: 24 meetings
   ├── Subsidiaries: 24 meetings
   └── Factories: 96 meetings
   
   BY STATUS
   Completed: 140 (90%)
   Cancelled: 10 (6%)
   Rescheduled: 6 (4%)
   
   ATTENDANCE OVERVIEW
   Average Attendance: 82%
   Quorum Met: 150 of 156 (96%)
   
   DECISIONS MADE
   Total Votes: 89
   Resolutions Passed: 78
   Resolutions Failed: 11
   
   GUEST PARTICIPATION
   Total Guests: 45
   Presentations: 32
   ```
5. **Drill down**:
   - Click board type to see individual boards
   - Click meeting to see details

### Error Flows

- **No meetings in range**: Show "No meetings found"
- **Access denied**: Show "You don't have access to these boards"

### Business Rules

- Secretary sees their boards only
- Chairman sees all 78 boards
- Committee meetings shown with parent board
- Export available (PDF, Excel)

---

## Flow 3: View Attendance Analytics

**Actor**: Secretary / Chairman  
**Flow**: Reports → Attendance → View Analytics

### Steps

1. Navigate to Reports → Attendance Analytics
2. **Select scope**:
   - Single board/committee
   - Compare multiple boards
   - All boards (Chairman)
3. **Attendance dashboard**:
   ```
   ATTENDANCE ANALYTICS
   
   OVERALL STATISTICS
   Average Attendance Rate: 82%
   On-Time Rate: 75%
   Quorum Achievement: 96%
   
   BY MEMBER (Top/Bottom)
   ┌────────────────────────────────────────────┐
   │ Member        │ Main │ Audit │ KETEPA │ Avg│
   ├────────────────────────────────────────────┤
   │ John Kamau    │ 100% │  90%  │   85%  │ 92%│
   │ Mary Wanjiku  │  92% │  85%  │   80%  │ 86%│
   │ James Mwangi  │  67% │  60%  │   70%  │ 66%│ ⚠️
   └────────────────────────────────────────────┘
   
   TREND CHART
   [Line chart showing attendance over 6 months]
   
   CONCERNS
   ⚠️ James Mwangi: Below 75% threshold
   ⚠️ Kericho Factory: 65% avg attendance
   ```
4. **Filter options**:
   - Date range
   - Board type
   - Member
5. Click member for detailed history

### Error Flows

- **No data**: Show "No attendance data for selected period"

### Business Rules

- Highlights members below threshold
- Compares across boards for multi-board members
- Identifies overloaded members
- Trend analysis over time

---

## Flow 4: Generate Action Items Report

**Actor**: Secretary / Chairman / Member  
**Flow**: Reports → Action Items → Filter → View

### Steps

1. Navigate to Reports → Action Items
2. **Filter options**:
   - Status: Open / In Progress / Completed / Overdue
   - Board/Committee
   - Assignee
   - Date range
   - Priority
3. **Report displays**:
   ```
   ACTION ITEMS REPORT
   
   SUMMARY
   Total Open: 45
   Overdue: 12 ⚠️
   Due This Week: 8
   Completed (Last 30 Days): 23
   
   BY ASSIGNEE
   ┌─────────────────────────────────────────┐
   │ Assignee      │ Open │ Overdue │ Done  │
   ├─────────────────────────────────────────┤
   │ John Kamau    │  8   │    2    │  15   │
   │ Mary Wanjiku  │  5   │    0    │  12   │
   │ Peter Ochieng │  12  │    5    │   8   │ ⚠️
   └─────────────────────────────────────────┘
   
   BY BOARD/COMMITTEE
   Main Board: 15 open (3 overdue)
   Audit Committee: 8 open (2 overdue)
   KETEPA: 10 open (4 overdue)
   
   OVERDUE ITEMS
   1. [Main Board] Prepare budget - Due Jan 10 (6 days overdue)
   2. [Audit] Submit findings - Due Jan 12 (4 days overdue)
   ```
4. Click item to view details
5. Export to Excel for tracking

### Error Flows

- **No items**: Show "No action items match filters"

### Business Rules

- Members see their assigned items
- Secretary sees all board items
- Chairman sees all items across boards
- Overdue items highlighted
- Completion rate tracked

---

## Flow 5: View Document Usage Report

**Actor**: Secretary / Admin  
**Flow**: Reports → Documents → View Usage

### Steps

1. Navigate to Reports → Document Usage
2. **Select scope**:
   - Single board
   - All boards (Admin)
3. **Report displays**:
   ```
   DOCUMENT USAGE REPORT
   
   STORAGE SUMMARY
   Total Documents: 1,245
   Total Size: 4.2 GB of 10 GB (42%)
   
   BY CATEGORY
   ├── Minutes: 320 (1.2 GB)
   ├── Financial Reports: 180 (800 MB)
   ├── Presentations: 245 (1.5 GB)
   └── Other: 500 (700 MB)
   
   MOST VIEWED (Last 30 Days)
   1. Q4 Financial Report.pdf - 45 views
   2. Annual Budget 2026.xlsx - 38 views
   3. Strategic Plan.pptx - 32 views
   
   MOST DOWNLOADED
   1. Board Pack Jan 2026.zip - 28 downloads
   2. Q4 Financial Report.pdf - 25 downloads
   
   UNUSED DOCUMENTS (6+ months)
   ⚠️ 45 documents not accessed
   [View List]
   ```
4. Click document for details
5. Option to archive unused documents

### Error Flows

- **No documents**: Show "No documents found"

### Business Rules

- Tracks views and downloads
- Identifies unused documents
- Storage monitoring
- Per-board breakdown available

---

## Flow 6: Generate Compliance Report

**Actor**: Chairman / Admin  
**Flow**: Reports → Compliance → Generate

### Steps

1. Navigate to Reports → Compliance
2. **Compliance dashboard**:
   ```
   COMPLIANCE REPORT
   
   SYSTEM-WIDE COMPLIANCE
   Total Entities: 90 (78 boards + 12 committees)
   Compliant: 85 (94%) ✓
   Non-Compliant: 5 (6%) ⚠️
   
   BY ENTITY TYPE
   ┌────────────────────────────────────────────────┐
   │ Type          │ Required │ Actual │ Status    │
   ├────────────────────────────────────────────────┤
   │ Main Board    │ 4/year   │ 4      │ ✓ 100%    │
   │ Committees    │ Varies   │ 11/12  │ ⚠️ 92%    │
   │ Subsidiaries  │ 12/year  │ 11.5   │ ⚠️ 96%    │
   │ Factories     │ 12/year  │ 10.8   │ ⚠️ 90%    │
   └────────────────────────────────────────────────┘
   
   NON-COMPLIANT ENTITIES
   ⚠️ Kericho Factory: 8 of 12 meetings (67%)
   ⚠️ Nandi Hills Factory: 9 of 12 meetings (75%)
   ⚠️ HR Committee: 4 of 6 meetings (67%)
   
   QUORUM ISSUES
   Meetings without quorum: 6
   ├── Kericho Factory: 3 meetings
   └── Nandi Hills Factory: 3 meetings
   
   MINUTES APPROVAL TIME
   Average: 5 days
   Longest: 15 days (Kisii Factory)
   Target: 7 days
   ```
3. **Drill down**:
   - Click entity for detailed compliance
   - View specific meetings
4. **Alerts**:
   - Entities with no meetings in 6+ months
   - Declining compliance trends

### Error Flows

- **Data incomplete**: Show "Some data may be incomplete"

### Business Rules

- Chairman and Admin access only
- Tracks meeting frequency requirements
- Monitors quorum achievement
- Minutes approval time tracked
- Alerts for non-compliance

---

## Flow 7: View System Usage Statistics (Admin)

**Actor**: System Admin  
**Flow**: Admin → Reports → System Usage

### Steps

1. Navigate to Admin → System Usage
2. **System statistics**:
   ```
   SYSTEM USAGE STATISTICS
   
   USER STATISTICS
   Total Users: 350
   Active (Last 30 Days): 280 (80%)
   Inactive: 70 (20%)
   
   ENTITY MEMBERSHIP
   Users on 1 entity: 150
   Users on 2-5 entities: 120
   Users on 6-10 entities: 60
   Users on 11+ entities: 20 ⚠️ (potentially overloaded)
   
   MEETING STATISTICS
   Meetings This Month: 45
   Average Duration: 1h 45m
   Peak Usage: Tuesdays 10:00 AM
   
   STORAGE
   Total Used: 4.2 GB of 10 GB
   ├── Main Board: 800 MB
   ├── Subsidiaries: 1.2 GB
   ├── Factories: 1.8 GB
   └── Committees: 400 MB
   
   GUEST USAGE
   Unique Guests: 120
   Presentations This Month: 15
   Most Frequent: Dr. Jane Smith (8 presentations)
   
   BANDWIDTH
   Peak: 2.5 Gbps (Tuesday 10:00 AM)
   Average: 500 Mbps
   ```
3. **Charts**:
   - Usage over time
   - Peak hours heatmap
   - Storage growth trend
4. Export for capacity planning

### Error Flows

- **Data unavailable**: Show "Usage data temporarily unavailable"

### Business Rules

- Admin-only access
- Real-time and historical data
- Capacity planning insights
- Identifies overloaded users
- Performance monitoring

---

## Flow 8: Schedule Automated Reports

**Actor**: Secretary / Chairman / Admin  
**Flow**: Reports → Schedule → Configure → Save

### Steps

1. Navigate to Reports → Scheduled Reports
2. Click "+ New Scheduled Report"
3. **Configure schedule**:
   ```
   SCHEDULE REPORT
   
   Report Type: [Meeting Summary ▼]
   
   Scope: [KTDA Main Board ▼]
   
   Frequency:
   ○ Daily
   ● Weekly (Monday)
   ○ Monthly (1st of month)
   ○ Quarterly
   
   Time: [8:00 AM ▼]
   
   Delivery:
   [✓] Email to me
   [✓] Email to: [board-secretary@ktda.co.ke]
   [○] Save to Documents
   
   Format: [PDF ▼]
   ```
4. Click "Save Schedule"
5. Report generated and delivered automatically
6. View scheduled reports list
7. Edit or delete schedules

### Error Flows

- **Invalid email**: Show "Please enter valid email"
- **Generation failed**: Retry and notify admin

### Business Rules

- Users can schedule for their boards
- Chairman can schedule for any board
- Multiple recipients allowed
- Reports archived for reference
- Can pause/resume schedules

---

## Flow 9: Export Report Data

**Actor**: Any User with Report Access  
**Flow**: View Report → Export → Download

### Steps

1. View any report
2. Click "Export" button
3. **Export options**:
   - Format:
     - PDF (formatted report)
     - Excel (data with charts)
     - CSV (raw data)
   - Scope:
     - Current view
     - Full report
   - Include:
     - ✓ Charts and graphs
     - ✓ Summary statistics
     - ✓ Detailed data
     - ✓ Board branding
4. Click "Generate Export"
5. File downloads
6. Export logged in audit trail

### Error Flows

- **Export failed**: Show "Export failed. Try again."
- **Too much data**: Show "Please narrow date range"

### Business Rules

- Export respects access permissions
- Board branding included
- Audit trail for compliance
- Large exports may be emailed
- Data anonymization options (Admin)

---

## Flow 10: Chairman Consolidated Dashboard

**Actor**: Chairman  
**Flow**: Dashboard → Consolidated View → All Boards

### Steps

1. Chairman logs in
2. **Consolidated dashboard**:
   ```
   CHAIRMAN DASHBOARD
   All 78 Boards + 12 Committees
   
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ Meetings    │ │ Compliance  │ │ Action      │ │ Attendance  │
   │ This Month  │ │ Rate        │ │ Items Open  │ │ Average     │
   │     45      │ │    94%      │ │    156      │ │    82%      │
   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
   
   BOARDS NEEDING ATTENTION
   ⚠️ Kericho Factory: Low attendance (65%)
   ⚠️ HR Committee: Missed 2 meetings
   ⚠️ Nandi Hills: 5 overdue action items
   
   UPCOMING ACROSS ALL BOARDS
   • [Main Board] Q1 Review - Tomorrow
   • [Audit] Monthly Review - Jan 20
   • [KETEPA] Budget Meeting - Jan 22
   • [Kericho] Monthly Meeting - Jan 23
   • ... and 12 more this week
   
   QUICK FILTERS
   [Main Board] [Subsidiaries] [Factories] [Committees]
   
   RECENT ACTIVITY
   • Minutes approved: Main Board Q4 Review
   • Vote passed: KETEPA Budget Approval
   • New document: Audit Committee Report
   ```
3. **Drill down**:
   - Click any metric for details
   - Filter by board type
   - Filter by region (factories)
4. **Quick actions**:
   - View any board's details
   - Access any meeting
   - Review any report

### Error Flows

- **Data loading**: Show "Loading dashboard..."

### Business Rules

- Chairman-exclusive view
- Aggregates all 78 boards + committees
- Highlights issues requiring attention
- One-click access to any entity
- Real-time updates

---

## Summary: Report Types

| Report | Audience | Scope |
|--------|----------|-------|
| Meeting Summary | Secretary, Chairman | Per-board or consolidated |
| Attendance Analytics | Secretary, Chairman | Per-board or consolidated |
| Action Items | All users | Personal or board-wide |
| Document Usage | Secretary, Admin | Per-board or system |
| Compliance | Chairman, Admin | System-wide |
| System Usage | Admin only | System-wide |

---

## Summary: Dashboard Widgets

| Widget | Shows | Updates |
|--------|-------|---------|
| Upcoming Meetings | Next 5 meetings | Real-time |
| Action Items | Open/overdue count | Real-time |
| Attendance | Average rate | Daily |
| Compliance | Overall percentage | Daily |
| Documents | Pending/new count | Real-time |

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | Overview metrics |
| Meeting Report | `/reports/meetings` | Meeting summary |
| Attendance Report | `/reports/attendance` | Attendance analytics |
| Action Items Report | `/reports/action-items` | Task tracking |
| Document Report | `/reports/documents` | Usage statistics |
| Compliance Report | `/reports/compliance` | Compliance tracking |
| System Usage | `/admin/reports/usage` | System statistics |
| Scheduled Reports | `/reports/scheduled` | Manage schedules |

---

## Summary: Key Components

| Component | Ant Design / Library | Purpose |
|-----------|---------------------|---------|
| Dashboard Grid | `Row` + `Col` | Layout widgets |
| Statistic Card | `Card` + `Statistic` | Key metrics |
| Charts | Ant Charts (Line, Bar, Pie) | Visualizations |
| Data Table | `Table` | Detailed data |
| Filter Panel | `Form` + `Select` + `DatePicker` | Filter options |
| Export Button | `Button` + `Dropdown` | Export options |
| Alert List | `List` + `Alert` | Issues/warnings |
| Schedule Form | `Form` + `TimePicker` | Configure schedules |

