# Module 12: System Administration - User Flows

**Module**: System Administration  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Create User Account
2. Bulk Import Users
3. Manage User Board Memberships
4. Deactivate/Reactivate User
5. Reset User Password
6. Configure Global Settings
7. Configure Board-Specific Settings
8. Manage Roles and Permissions
9. View Audit Logs
10. Manage Backups
11. Monitor System Health

---

## Flow 1: Create User Account

**Actor**: System Admin  
**Flow**: Admin → Users → Create → Enter Details → Assign Boards → Save

### Steps

1. Navigate to Admin → User Management
2. Click "+ New User"
3. **Enter user details**:
   - Full name (required)
   - Email address (required, unique)
   - Phone number (optional)
   - Employee ID (optional)
   - Profile photo (optional)
4. **Set credentials**:
   - Generate temporary password, OR
   - Send password setup email
5. **Assign to boards**:
   - Select board(s) from list
   - For each board, select role:
     - Board Member
     - Board Secretary
     - Committee Member
     - Observer
   - Can assign to multiple boards with different roles
6. **Set account options**:
   - Account status: Active
   - Require password change on first login: Yes
   - Enable MFA: Per policy
7. Click "Create User"
8. System actions:
   - Account created
   - Welcome email sent
   - User added to selected boards
9. Success: "User created successfully"

### Error Flows

- **Email exists**: Show "User with this email already exists"
- **Invalid email**: Show "Please enter valid email address"
- **No boards selected**: Show "Please assign user to at least one board"

### Business Rules

- Email must be unique
- At least one board assignment required
- Password must meet security policy
- Welcome email includes login instructions
- Audit log records creation

---

## Flow 2: Bulk Import Users

**Actor**: System Admin  
**Flow**: Admin → Users → Import → Upload CSV → Map Fields → Import

### Steps

1. Navigate to Admin → User Management
2. Click "Import Users"
3. **Download template**:
   - Click "Download CSV Template"
   - Template includes: Name, Email, Phone, Board, Role
4. **Prepare CSV file**:
   ```csv
   Name,Email,Phone,Board,Role
   John Kamau,john@ktda.co.ke,+254700000001,KTDA Main Board,Board Member
   Mary Wanjiku,mary@ktda.co.ke,+254700000002,KETEPA Limited,Board Secretary
   Peter Ochieng,peter@ktda.co.ke,+254700000003,Kericho Factory,Board Member
   ```
5. **Upload file**:
   - Drag and drop or browse
   - File validated
6. **Map fields**:
   - System auto-maps columns
   - Confirm or adjust mappings
7. **Preview import**:
   - Show first 10 rows
   - Highlight any errors (invalid email, unknown board)
   - Show: "45 valid, 3 errors"
8. **Handle errors**:
   - Fix in CSV and re-upload, OR
   - Skip invalid rows
9. Click "Import"
10. **Import progress**:
    - Progress bar
    - "Importing 45 users..."
11. **Results**:
    - Imported: 45
    - Skipped: 3
    - Download error report

### Error Flows

- **Invalid file format**: Show "Please upload CSV file"
- **Missing required columns**: Show "Missing columns: Email, Board"
- **Duplicate emails**: Show "5 duplicate emails found"

### Business Rules

- CSV format required
- Email must be unique
- Board names must match exactly
- Role names must be valid
- Bulk import logged in audit trail
- Welcome emails sent to all imported users

---

## Flow 3: Manage User Board Memberships

**Actor**: System Admin  
**Flow**: Admin → Users → Select User → Manage Boards → Save

### Steps

1. Navigate to Admin → User Management
2. Search and select user
3. Click "Manage Board Memberships"
4. **View current memberships**:
   ```
   BOARD MEMBERSHIPS: John Kamau
   
   ┌────────────────────────────────────────────┐
   │ Board              │ Role           │ Since│
   ├────────────────────────────────────────────┤
   │ KTDA Main Board    │ Board Member   │ 2020 │
   │ Audit Committee    │ Committee Mbr  │ 2021 │
   │ KETEPA Limited     │ Board Member   │ 2022 │
   │ Kericho Factory    │ Chairman       │ 2019 │
   └────────────────────────────────────────────┘
   ```
5. **Add to board**:
   - Click "+ Add to Board"
   - Select board from dropdown
   - Select role
   - Click "Add"
6. **Change role**:
   - Click role dropdown on existing membership
   - Select new role
   - Confirm change
7. **Remove from board**:
   - Click "Remove" on membership
   - Confirm: "Remove John from KETEPA Limited?"
   - User removed from that board only
8. Click "Save Changes"
9. Changes applied immediately

### Error Flows

- **Already member**: Show "User is already a member of this board"
- **Cannot remove last board**: Show "User must belong to at least one board"

### Business Rules

- User can have different roles on different boards
- Removing from board doesn't delete user account
- Role changes take effect immediately
- All changes logged in audit trail
- Chairman role has special restrictions

---

## Flow 4: Deactivate/Reactivate User

**Actor**: System Admin  
**Flow**: Admin → Users → Select User → Deactivate/Reactivate

### Steps

1. Navigate to Admin → User Management
2. Search and select user
3. **Deactivate user**:
   - Click "Deactivate Account"
   - Enter reason: "Employee resigned"
   - Confirm: "Deactivate this account?"
   - Click "Confirm"
4. System actions:
   - Account status → Inactive
   - User cannot log in
   - Removed from all active meetings
   - Board memberships preserved (for reactivation)
   - Email sent: "Your account has been deactivated"
5. **Reactivate user**:
   - Find user (filter: Inactive)
   - Click "Reactivate Account"
   - Confirm: "Reactivate this account?"
   - Click "Confirm"
6. System actions:
   - Account status → Active
   - User can log in
   - Board memberships restored
   - Email sent: "Your account has been reactivated"

### Error Flows

- **Cannot deactivate self**: Show "You cannot deactivate your own account"
- **Cannot deactivate Chairman**: Show "Chairman account requires special approval"

### Business Rules

- Deactivation is reversible (not deletion)
- Board memberships preserved
- Reason required for audit trail
- Cannot deactivate own account
- Chairman deactivation requires approval

---

## Flow 5: Reset User Password

**Actor**: System Admin  
**Flow**: Admin → Users → Select User → Reset Password

### Steps

1. Navigate to Admin → User Management
2. Search and select user
3. Click "Reset Password"
4. **Reset options**:
   - Generate temporary password
   - Send password reset email
5. **If temporary password**:
   - System generates secure password
   - Display to admin (one time)
   - Admin communicates to user securely
   - User must change on next login
6. **If reset email**:
   - Email sent to user
   - Link valid for 24 hours
   - User sets new password
7. Success: "Password reset successfully"

### Error Flows

- **Email delivery failed**: Show "Failed to send email. Try again."
- **User inactive**: Show "Cannot reset password for inactive user"

### Business Rules

- Temporary passwords expire on first use
- Reset links expire after 24 hours
- Password must meet security policy
- Reset action logged in audit trail
- User notified of password change

---

## Flow 6: Configure Global Settings

**Actor**: System Admin  
**Flow**: Admin → Settings → Global → Configure → Save

### Steps

1. Navigate to Admin → System Settings
2. Click "Global Settings"
3. **Organization settings**:
   - Organization name: "KTDA"
   - Logo: Upload/change
   - Primary color: #1890ff
   - Timezone: Africa/Nairobi
   - Date format: DD/MM/YYYY
4. **Security settings**:
   - Password minimum length: 8
   - Require uppercase: Yes
   - Require numbers: Yes
   - Require special characters: Yes
   - Session timeout: 30 minutes
   - MFA enforcement: Optional / Required
   - Failed login lockout: 5 attempts
5. **Email settings**:
   - SMTP server configuration
   - From address
   - Email templates
6. **Meeting defaults**:
   - Default meeting duration: 2 hours
   - Default reminder times: 24h, 1h
   - Recording enabled: Yes
7. Click "Save Settings"
8. Settings applied system-wide

### Error Flows

- **Invalid SMTP**: Show "SMTP connection failed"
- **Invalid settings**: Show specific validation errors

### Business Rules

- Global settings apply to all boards
- Some settings can be overridden per board
- Changes take effect immediately
- Settings changes logged in audit trail
- Backup before major changes recommended

---

## Flow 7: Configure Board-Specific Settings

**Actor**: System Admin  
**Flow**: Admin → Boards → Select Board → Settings → Configure

### Steps

1. Navigate to Admin → Board Management
2. Select board (e.g., "KTDA Main Board")
3. Click "Board Settings"
4. **Meeting settings**:
   - Default meeting frequency: Quarterly
   - Default meeting duration: 3 hours
   - Quorum percentage: 50%
   - Voting threshold: Simple Majority
5. **Notification settings**:
   - Meeting reminders: 48h, 24h, 1h
   - Document upload notifications: Yes
   - Minutes published notifications: Yes
6. **Branding** (if enabled):
   - Board logo
   - Primary color
   - Header text
7. **Confirmation settings**:
   - Require meeting confirmation: Yes
   - Designated approver: Chairman
   - Digital signature required: Yes
8. Click "Save Settings"
9. Settings apply to this board only

### Error Flows

- **Invalid quorum**: Show "Quorum cannot exceed 100%"

### Business Rules

- Board settings override global defaults
- Each board can have unique settings
- Factory boards may share common settings
- Changes logged in audit trail
- Can copy settings from another board

---

## Flow 8: Manage Roles and Permissions

**Actor**: System Admin  
**Flow**: Admin → Roles → View/Edit → Configure Permissions

### Steps

1. Navigate to Admin → Roles & Permissions
2. **View existing roles**:
   ```
   SYSTEM ROLES
   
   ┌────────────────────────────────────────────┐
   │ Role              │ Users │ Type          │
   ├────────────────────────────────────────────┤
   │ System Admin      │   3   │ System        │
   │ Chairman          │   1   │ System        │
   │ Board Secretary   │  78   │ Board-level   │
   │ Board Member      │ 250   │ Board-level   │
   │ Committee Member  │  80   │ Board-level   │
   │ Observer          │  20   │ Board-level   │
   │ Guest             │  45   │ Meeting-level │
   └────────────────────────────────────────────┘
   ```
3. Click role to view permissions
4. **Permission categories**:
   - Meetings: Create, Edit, Delete, View, Start
   - Documents: Upload, View, Download, Delete
   - Voting: Create Vote, Cast Vote, View Results
   - Minutes: Create, Edit, Approve, Publish
   - Users: View, Create, Edit, Delete
   - Settings: View, Edit
5. **Edit permissions**:
   - Toggle permissions on/off
   - Permissions are board-scoped
6. **Create custom role** (optional):
   - Click "+ New Role"
   - Enter role name
   - Configure permissions
   - Assign to users
7. Click "Save"

### Error Flows

- **Cannot edit system roles**: Show "System roles cannot be modified"
- **Role in use**: Show "Cannot delete role with assigned users"

### Business Rules

- System roles (Admin, Chairman) cannot be deleted
- Board-level roles are scoped to specific boards
- Chairman has cross-board permissions
- Custom roles can be created
- Permission changes take effect immediately

---

## Flow 9: View Audit Logs

**Actor**: System Admin  
**Flow**: Admin → Audit Logs → Filter → View → Export

### Steps

1. Navigate to Admin → Audit Logs
2. **View log entries**:
   ```
   AUDIT LOG
   
   ┌──────────────────────────────────────────────────────────────┐
   │ Time        │ User       │ Board      │ Action    │ Details │
   ├──────────────────────────────────────────────────────────────┤
   │ 10:30:15    │ John K.    │ Main Board │ Login     │ Success │
   │ 10:32:45    │ Mary W.    │ KETEPA     │ Upload    │ Q4.pdf  │
   │ 10:35:22    │ Admin      │ System     │ User Edit │ Peter O.│
   │ 10:40:00    │ John K.    │ Main Board │ Vote Cast │ Motion 1│
   └──────────────────────────────────────────────────────────────┘
   ```
3. **Filter options**:
   - User: Select specific user
   - Board: Select specific board
   - Action type: Login, Document, Meeting, Vote, Admin
   - Date range: From/To
   - IP address: Search
4. **View details**:
   - Click entry for full details
   - Shows: User, Board, Action, Timestamp, IP, User Agent
5. **Export logs**:
   - Click "Export"
   - Select format: CSV, PDF
   - Select date range
   - Download file
6. Logs are read-only (cannot edit or delete)

### Error Flows

- **No results**: Show "No log entries match filters"
- **Export too large**: Show "Please narrow date range"

### Business Rules

- Logs are immutable (cannot be edited/deleted)
- Retained for 7 years (configurable)
- All user actions logged
- Cross-board activities tracked
- Required for compliance audits

---

## Flow 10: Manage Backups

**Actor**: System Admin  
**Flow**: Admin → Backups → View/Create/Restore

### Steps

1. Navigate to Admin → Backup & Recovery
2. **View backup schedule**:
   ```
   BACKUP CONFIGURATION
   
   Automatic Backups: Enabled ✓
   Frequency: Daily at 2:00 AM
   Retention: 30 days
   Storage: AWS S3
   
   RECENT BACKUPS
   ┌────────────────────────────────────────────┐
   │ Date       │ Size   │ Status  │ Actions   │
   ├────────────────────────────────────────────┤
   │ Jan 16     │ 2.5 GB │ ✓ Valid │ [Restore] │
   │ Jan 15     │ 2.4 GB │ ✓ Valid │ [Restore] │
   │ Jan 14     │ 2.4 GB │ ✓ Valid │ [Restore] │
   └────────────────────────────────────────────┘
   ```
3. **Create manual backup**:
   - Click "Backup Now"
   - Confirm: "Create backup now?"
   - Progress shown
   - Backup created and verified
4. **Restore from backup**:
   - Click "Restore" on backup
   - Warning: "This will replace current data"
   - Enter confirmation code
   - Restore initiated
   - System temporarily unavailable
5. **Test backup**:
   - Click "Test Integrity"
   - System verifies backup is valid
   - Report: "Backup integrity verified"

### Error Flows

- **Backup failed**: Show "Backup failed. Check storage."
- **Restore failed**: Show "Restore failed. Contact support."

### Business Rules

- Daily automatic backups required
- Backups encrypted at rest
- Retention period configurable
- Restore requires confirmation
- Backup status monitored

---

## Flow 11: Monitor System Health

**Actor**: System Admin  
**Flow**: Admin → System Health → View Dashboard

### Steps

1. Navigate to Admin → System Health
2. **Health dashboard**:
   ```
   SYSTEM HEALTH
   
   Overall Status: ✓ All Systems Operational
   
   SERVICES
   ┌────────────────────────────────────────────┐
   │ Service          │ Status  │ Response     │
   ├────────────────────────────────────────────┤
   │ Web Application  │ ✓ Up    │ 45ms         │
   │ Database         │ ✓ Up    │ 12ms         │
   │ File Storage     │ ✓ Up    │ 89ms         │
   │ Jitsi Video      │ ✓ Up    │ 120ms        │
   │ Email Service    │ ✓ Up    │ 200ms        │
   │ SMS Gateway      │ ⚠ Slow  │ 2500ms       │
   └────────────────────────────────────────────┘
   
   RESOURCES
   CPU Usage: 35%    [████░░░░░░]
   Memory:    60%    [██████░░░░]
   Storage:   42%    [████░░░░░░]
   
   RECENT ALERTS
   ⚠ SMS Gateway slow response - Jan 16, 10:30 AM
   ✓ Resolved: Database connection issue - Jan 15
   ```
3. **Configure alerts**:
   - Set thresholds for each service
   - Configure notification recipients
   - Set alert channels (email, SMS)
4. **View history**:
   - Uptime history
   - Performance trends
   - Incident log
5. **Manual health check**:
   - Click "Run Health Check"
   - All services tested
   - Report generated

### Error Flows

- **Service down**: Alert triggered, admin notified
- **Cannot connect**: Show "Unable to check service status"

### Business Rules

- Health checks run every 5 minutes
- Alerts sent for any service issues
- Historical data retained for 90 days
- Critical services have stricter thresholds
- Automatic escalation for prolonged issues

---

## Summary: Admin Permission Matrix

| Action | System Admin | Chairman | Secretary |
|--------|--------------|----------|-----------|
| Create User | ✓ | ✗ | ✗ |
| Manage Board Members | ✓ | ✗ | ✗ |
| Global Settings | ✓ | ✗ | ✗ |
| Board Settings | ✓ | ✗ | ✗ |
| View Audit Logs | ✓ | ✓ (own boards) | ✗ |
| Manage Backups | ✓ | ✗ | ✗ |
| System Health | ✓ | ✗ | ✗ |

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| User Management | `/admin/users` | Manage users |
| User Import | `/admin/users/import` | Bulk import |
| User Details | `/admin/users/:id` | Edit user |
| Global Settings | `/admin/settings` | System config |
| Board Settings | `/admin/boards/:id/settings` | Board config |
| Roles | `/admin/roles` | Manage roles |
| Audit Logs | `/admin/audit-logs` | View logs |
| Backups | `/admin/backups` | Manage backups |
| System Health | `/admin/health` | Monitor status |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| User Table | `Table` with search | List users |
| User Form | `Form` | Create/edit user |
| CSV Upload | `Upload` | Bulk import |
| Settings Form | `Form` + `Tabs` | Configuration |
| Permission Grid | `Table` + `Switch` | Manage permissions |
| Log Table | `Table` with filters | Audit logs |
| Health Cards | `Card` + `Badge` | Service status |
| Progress Bars | `Progress` | Resource usage |
| Alert List | `Alert` + `List` | System alerts |

