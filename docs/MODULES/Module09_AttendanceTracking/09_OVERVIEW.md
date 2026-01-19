# Module 9: Attendance and Participation Tracking

**Purpose**: Track who attends meetings and their participation

## What We Need:

### 1. Automatic Attendance Tracking
- System automatically records when participants join meeting
- Record join time and leave time
- Mark attendance status:
  - Present (joined on time)
  - Late (joined after start time)
  - Left Early (left before end time)
  - Absent (never joined)

### 2. Manual Attendance Adjustment
- Secretary can manually adjust attendance
- Example: Mark someone as present if they called in separately
- Record reason for absence (apologies, no notice)

### 3. Quorum Calculation
- Real-time display of quorum status during meeting
- Example: "8 of 10 board members present - Quorum met"
- Alert if quorum is lost during meeting (someone leaves)

### 4. Attendance Reports (Board-Specific and Consolidated)
- Generate attendance report for each meeting
- **Per-Board Statistics**: Attendance rate per board member for each board
  - Example: "John attended 10 of 12 Main Board meetings (83%), 8 of 10 KETEPA meetings (80%)"
- **Consolidated Statistics**: Overall attendance across all boards user is member of
- **Chairman View**: Attendance statistics across all 78 boards
- Identify members with poor attendance on specific boards
- Export reports to Excel or PDF with board breakdown

### 5. Participation Metrics (Optional)
- Track speaking time per participant
- Count chat messages sent
- Count votes cast
- Engagement score to identify active vs. passive participants
