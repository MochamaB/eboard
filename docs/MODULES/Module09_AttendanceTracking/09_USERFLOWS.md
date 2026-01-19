# Module 9: Attendance Tracking - User Flows

**Module**: Attendance and Participation Tracking  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Automatic Attendance Recording
2. View Real-Time Attendance
3. Manual Attendance Adjustment
4. Record Apologies
5. Monitor Quorum Status
6. View Meeting Attendance Report
7. View Member Attendance History
8. Generate Board Attendance Report
9. Chairman Consolidated View
10. Export Attendance Data

---

## Flow 1: Automatic Attendance Recording

**Actor**: System (Automatic)  
**Flow**: Participant Joins → System Records → Tracks Duration

### Steps

1. Meeting starts (Chairman clicks "Start Meeting")
2. System begins attendance tracking
3. **When participant joins**:
   - Record: User ID, Join Time
   - Calculate: On-time or Late
   - Status set based on join time:
     - **Present**: Joined within 5 minutes of start
     - **Late**: Joined more than 5 minutes after start
4. **During meeting**:
   - Track continuous presence
   - Record if participant leaves and rejoins
   - Note disconnection events
5. **When participant leaves**:
   - Record: Leave Time
   - If before meeting ends: Mark "Left Early"
6. **When meeting ends**:
   - Final attendance status calculated
   - Duration calculated for each participant
   - Attendance record saved

### Error Flows

- **Connection issues**: System records disconnection, tracks reconnection
- **Participant never joins**: Status remains "Absent"

### Business Rules

- Attendance tracked automatically via video conferencing
- Late threshold configurable (default: 5 minutes)
- Multiple join/leave events recorded
- Total meeting time calculated
- Guests tracked separately from members

---

## Flow 2: View Real-Time Attendance

**Actor**: Chairman / Secretary  
**Flow**: During Meeting → Participants Panel → View Attendance

### Steps

1. During active meeting, view Participants panel
2. **Attendance display**:
   ```
   ATTENDANCE (12 of 15)
   ──────────────────────
   ✓ John Kamau (Chairman) - Joined 10:00
   ✓ Mary Wanjiku - Joined 10:02
   ⏰ Peter Ochieng - Joined 10:15 (Late)
   ✓ Sarah Njeri - Joined 10:01
   ...
   ──────────────────────
   ✗ James Mwangi - Absent
   ✗ David Kiprop - Absent
   📧 Grace Akinyi - Apologies received
   ```
3. **Status indicators**:
   - ✓ Green: Present (on time)
   - ⏰ Yellow: Late
   - ✗ Red: Absent
   - 📧 Gray: Apologies
   - 🚪 Orange: Left Early
4. **Real-time updates**:
   - New joins appear immediately
   - Status changes reflected
5. Click participant for details:
   - Join time
   - Connection quality
   - Speaking time (if tracked)

### Error Flows

- **Panel not loading**: Show "Loading participants..." with retry

### Business Rules

- Chairman and Secretary see full attendance
- Regular members see participant list only
- Real-time via WebSocket
- Guests shown in separate section

---

## Flow 3: Manual Attendance Adjustment

**Actor**: Board Secretary  
**Flow**: Meeting Details → Attendance → Edit → Save

### Steps

1. Navigate to Meeting Details (during or after meeting)
2. Click "Attendance" tab
3. View attendance list
4. Click "Edit Attendance"
5. **Adjust attendance**:
   - Change status dropdown:
     - Present → Absent
     - Absent → Present
     - Late → Present
   - Add reason (required for changes):
     - "Joined via phone, not video"
     - "Technical difficulties prevented joining"
   - Adjust times if needed
6. Click "Save Changes"
7. Changes logged with:
   - Who made the change
   - Original value
   - New value
   - Reason
   - Timestamp

### Error Flows

- **No reason provided**: Show "Please provide reason for adjustment"
- **Meeting not found**: Show "Meeting attendance not available"

### Business Rules

- Only Secretary can adjust attendance
- All changes logged for audit
- Reason required for any change
- Original automatic record preserved
- Changes reflected in reports

---

## Flow 4: Record Apologies

**Actor**: Board Secretary / Board Member  
**Flow**: Before Meeting → Submit Apology → Record

### Steps

1. **Member submits apology**:
   - Navigate to upcoming meeting
   - Click "Send Apologies"
   - Enter reason: "Unable to attend due to travel"
   - Click "Submit"
   - Confirmation: "Apologies recorded"
2. **Secretary records apology** (on behalf):
   - Navigate to Meeting Details → Attendance
   - Click "Record Apology"
   - Select member
   - Enter reason
   - Click "Save"
3. **Apology display**:
   - Member marked as "Apologies" (not Absent)
   - Reason visible to Chairman/Secretary
   - Counted separately in reports

### Error Flows

- **Meeting already ended**: Show "Cannot submit apologies for past meetings"
- **Already submitted**: Show "Apologies already recorded"

### Business Rules

- Apologies can be submitted before meeting
- Apologies different from unexplained absence
- Apologies count toward attendance statistics differently
- Secretary can record on behalf of member
- Apologies appear in meeting minutes

---

## Flow 5: Monitor Quorum Status

**Actor**: Chairman / Secretary  
**Flow**: During Meeting → View Quorum → Alert if Lost

### Steps

1. During meeting, quorum indicator visible:
   ```
   ┌─────────────────────────────┐
   │  QUORUM: MET ✓             │
   │  12 of 10 required present │
   │  ████████████░░░ 80%       │
   └─────────────────────────────┘
   ```
2. **Quorum calculation**:
   - Based on board's quorum rules
   - Only voting members counted
   - Guests don't count toward quorum
3. **If member leaves**:
   - Quorum recalculated
   - If still met: No action
   - If lost: Alert triggered
4. **Quorum lost alert**:
   ```
   ⚠️ QUORUM LOST
   Only 9 of 10 required members present
   Meeting cannot proceed with formal business
   ```
5. **Options when quorum lost**:
   - Pause meeting
   - Continue informal discussion
   - Adjourn meeting
6. Chairman decides action

### Error Flows

- **Quorum never met**: Show "Quorum not met. Cannot start formal business."

### Business Rules

- Quorum required for formal votes
- Different boards may have different quorum rules
- Quorum loss doesn't auto-end meeting
- Chairman decides how to proceed
- Quorum status recorded in minutes

---

## Flow 6: View Meeting Attendance Report

**Actor**: Board Secretary / Chairman  
**Flow**: Meeting Details → Attendance Tab → View Report

### Steps

1. Navigate to completed Meeting Details
2. Click "Attendance" tab
3. **Attendance summary**:
   ```
   ATTENDANCE REPORT
   Meeting: Q4 Board Review
   Date: January 15, 2026
   
   Total Members: 15
   Present: 12 (80%)
   Late: 2
   Apologies: 1
   Absent: 2
   
   Quorum Required: 10
   Quorum Status: Met ✓
   ```
4. **Detailed list**:
   | Member | Status | Join Time | Leave Time | Duration |
   |--------|--------|-----------|------------|----------|
   | John K. | Present | 10:00 | 12:30 | 2h 30m |
   | Mary W. | Late | 10:15 | 12:30 | 2h 15m |
   | James M. | Absent | - | - | - |
5. **Export options**:
   - Download PDF
   - Download Excel

### Error Flows

- **No attendance data**: Show "Attendance not recorded for this meeting"

### Business Rules

- Available after meeting ends
- Shows all attendance details
- Includes quorum status
- Can be included in minutes
- Exportable for records

---

## Flow 7: View Member Attendance History

**Actor**: Chairman / Secretary / System Admin  
**Flow**: Member Profile → Attendance History → View Statistics

### Steps

1. Navigate to Board Management → Members
2. Select member
3. Click "Attendance History"
4. **Per-board attendance**:
   ```
   ATTENDANCE HISTORY: John Kamau
   
   KTDA Main Board
   ├── Meetings Attended: 10 of 12 (83%)
   ├── Late: 2 times
   ├── Apologies: 1
   └── Absent without notice: 1
   
   KETEPA Limited
   ├── Meetings Attended: 8 of 10 (80%)
   ├── Late: 1 time
   ├── Apologies: 1
   └── Absent without notice: 0
   
   Audit Committee
   ├── Meetings Attended: 6 of 6 (100%)
   └── Perfect attendance
   ```
5. **Filter options**:
   - Date range
   - Specific board/committee
   - Year
6. **Trend chart**:
   - Attendance rate over time
   - Comparison to board average

### Error Flows

- **No history**: Show "No attendance records for this member"

### Business Rules

- Chairman can view all members' history
- Secretary can view their board's members
- Members can view their own history
- Used for compliance and governance
- Poor attendance flagged for review

---

## Flow 8: Generate Board Attendance Report

**Actor**: Board Secretary / Chairman  
**Flow**: Board Dashboard → Reports → Attendance Report

### Steps

1. Navigate to Board Dashboard
2. Click "Reports" → "Attendance Report"
3. **Configure report**:
   - Date range: Last 6 months
   - Include: All meetings / Specific type
   - Format: Summary / Detailed
4. Click "Generate Report"
5. **Report displays**:
   ```
   BOARD ATTENDANCE REPORT
   KTDA Main Board
   Period: July 2025 - January 2026
   
   SUMMARY
   Total Meetings: 12
   Average Attendance: 85%
   Quorum Met: 12 of 12 (100%)
   
   MEMBER STATISTICS
   | Member | Attended | Rate | Late | Absent |
   |--------|----------|------|------|--------|
   | John K. | 12/12 | 100% | 0 | 0 |
   | Mary W. | 11/12 | 92% | 2 | 1 |
   | James M. | 8/12 | 67% | 1 | 3 |
   
   ATTENDANCE TREND
   [Chart showing monthly attendance rates]
   
   CONCERNS
   ⚠️ James Mwangi: Below 75% threshold
   ```
6. **Export options**:
   - Download PDF
   - Download Excel
   - Email to board

### Error Flows

- **No meetings in range**: Show "No meetings found in selected period"

### Business Rules

- Secretary generates for their board
- Chairman can generate for any board
- Identifies attendance concerns
- Used for governance compliance
- Can be shared with board

---

## Flow 9: Chairman Consolidated View

**Actor**: Chairman  
**Flow**: Dashboard → Attendance Overview → All Boards

### Steps

1. Navigate to Chairman Dashboard
2. Click "Attendance Overview"
3. **Consolidated view across all 78 boards**:
   ```
   ATTENDANCE OVERVIEW - ALL BOARDS
   
   SUMMARY (Last 6 Months)
   Total Meetings: 156
   Average Attendance: 82%
   Quorum Issues: 3 meetings
   
   BY BOARD TYPE
   | Type | Meetings | Avg Attendance |
   |------|----------|----------------|
   | Main Board | 12 | 88% |
   | Subsidiaries | 24 | 85% |
   | Factories | 108 | 80% |
   | Committees | 12 | 90% |
   
   BOARDS NEEDING ATTENTION
   ⚠️ Kericho Factory: 65% avg attendance
   ⚠️ Nandi Hills Factory: 70% avg attendance
   
   MEMBERS WITH POOR ATTENDANCE
   ⚠️ James Mwangi (Main Board): 67%
   ⚠️ Peter Ochieng (KETEPA): 60%
   ```
4. **Drill down**:
   - Click board to see detailed report
   - Click member to see their history
5. **Filter options**:
   - By region/zone
   - By board type
   - Date range

### Error Flows

- **Data loading**: Show "Loading attendance data..."

### Business Rules

- Chairman-only view
- Aggregates all 78 boards
- Highlights concerns
- Supports governance oversight
- Exportable for board reports

---

## Flow 10: Export Attendance Data

**Actor**: Board Secretary / Chairman  
**Flow**: Attendance Report → Export → Download

### Steps

1. From any attendance view/report
2. Click "Export" button
3. **Export options**:
   - Format:
     - PDF (formatted report)
     - Excel (raw data)
     - CSV (data only)
   - Scope:
     - Single meeting
     - Date range
     - All meetings
   - Include:
     - ✓ Member names
     - ✓ Join/leave times
     - ✓ Duration
     - ✓ Status
     - ✓ Apology reasons
4. Click "Generate Export"
5. File downloads
6. **Bulk export** (Chairman):
   - Export all boards' attendance
   - Organized by board in Excel tabs

### Error Flows

- **Export failed**: Show "Export failed. Please try again."
- **Too much data**: Show "Please narrow date range"

### Business Rules

- Secretary can export their board
- Chairman can export any/all boards
- Exports include board branding
- Audit trail records exports
- Used for compliance reporting

---

## Summary: Attendance Status Types

| Status | Icon | Description |
|--------|------|-------------|
| Present | ✓ Green | Joined on time, stayed until end |
| Late | ⏰ Yellow | Joined after grace period |
| Left Early | 🚪 Orange | Left before meeting ended |
| Apologies | 📧 Gray | Notified in advance |
| Absent | ✗ Red | Did not attend, no notice |

---

## Summary: Quorum Rules

| Board Type | Default Quorum |
|------------|----------------|
| Main Board | 50% of members |
| Subsidiaries | 50% of members |
| Factories | 50% of members |
| Committees | Majority present |

*Note: Each board can configure its own quorum rules*

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Meeting Attendance | `/meetings/:id/attendance` | View/edit meeting attendance |
| Member Attendance | `/members/:id/attendance` | Member's attendance history |
| Board Attendance Report | `/boards/:id/reports/attendance` | Board attendance report |
| Chairman Overview | `/dashboard/attendance` | Consolidated view |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Attendance List | `Table` | Display attendance |
| Status Badge | `Tag` | Show attendance status |
| Quorum Indicator | `Progress` + `Alert` | Show quorum status |
| Attendance Chart | `Line` / `Bar` (Ant Charts) | Trend visualization |
| Export Button | `Button` + `Dropdown` | Export options |
| Filter Panel | `Form` + `Select` + `DatePicker` | Filter options |
| Alert Banner | `Alert` | Quorum warnings |
| Member Card | `Card` | Member attendance summary |

