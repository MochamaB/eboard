# Module 10: Notifications - User Flows

**Module**: Notifications  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Browse Notifications Index Page
2. Receive Email Notification
3. View In-App Notifications (Bell Dropdown)
4. Mark Notification as Read
5. Click Notification to Navigate
6. Configure Notification Preferences
7. Set Quiet Hours
8. Enable Digest Mode
9. Manage SMS Notifications
10. View Notification History
11. Admin: Configure System Notifications

---

## Flow 1: Browse Notifications Index Page

**Actor**: Any User  
**Flow**: Navigate to Notifications → View List → Filter/Search → Take Action

### Steps

1. Click "Notifications" in sidebar menu
2. **Notifications Index Page displays**:
   ```
   ┌─────────────────────────────────────────────────────────────────┐
   │  NOTIFICATIONS                                   [Mark All Read]│
   ├─────────────────────────────────────────────────────────────────┤
   │  [All] [Unread (5)] [Meetings] [Documents] [Tasks] [Votes]      │
   ├─────────────────────────────────────────────────────────────────┤
   │  Search: [________________________] [🔍]  Board: [All ▼]        │
   ├─────────────────────────────────────────────────────────────────┤
   │  TODAY                                                          │
   │  ─────────────────────────────────────────────────────────────  │
   │  🔵 [KTDA Main Board] New document uploaded          10:30 AM   │
   │     Q4 Financial Report.pdf                                     │
   │     [View Document]                                             │
   │  ─────────────────────────────────────────────────────────────  │
   │  🔵 [Audit Committee] Meeting reminder               9:15 AM    │
   │     Q4 Audit Review starts in 1 hour                            │
   │     [View Meeting]                                              │
   │  ─────────────────────────────────────────────────────────────  │
   │  YESTERDAY                                                      │
   │  ─────────────────────────────────────────────────────────────  │
   │  ○  [KETEPA Limited] Minutes published               4:30 PM    │
   │     January Board Meeting                                       │
   │     [View Minutes]                                              │
   │  ─────────────────────────────────────────────────────────────  │
   │  ○  [Main Board] Action item assigned                2:15 PM    │
   │     Prepare Q1 budget proposal - Due Jan 20                     │
   │     [View Action Item]                                          │
   └─────────────────────────────────────────────────────────────────┘
   │  Showing 1-20 of 156 notifications            [< 1 2 3 4 5 >]   │
   └─────────────────────────────────────────────────────────────────┘
   ```
3. **Tab options**:
   - **All**: All notifications
   - **Unread**: Only unread (with count badge)
   - **Meetings**: Meeting-related notifications
   - **Documents**: Document uploads, agenda, minutes
   - **Tasks**: Action items assigned/due
   - **Votes**: Vote opened/closed notifications
4. **Filters**:
   - Board/Committee dropdown
   - Date range
   - Search by keyword
5. **Notification indicators**:
   - 🔵 Blue dot: Unread
   - ○ No dot: Read
   - Board name in brackets with color coding
6. **Actions per notification**:
   - Click to navigate to related item
   - Hover → "Mark as read/unread" icon
   - Hover → "Delete" icon
7. **Bulk actions**:
   - "Mark All Read" button
   - Select multiple → Mark read / Delete

### Error Flows

- **No notifications**: Show "No notifications yet" empty state
- **No results**: Show "No notifications match your filters"
- **Load error**: Show "Unable to load notifications. Try again."

### Business Rules

- Notifications grouped by date (Today, Yesterday, This Week, Older)
- Sorted by date (newest first)
- Paginated: 20 per page
- Unread count shown in tab badge
- Board name always visible for multi-board context
- Clicking notification marks it as read and navigates
- History retained for 90 days
- Deleted notifications removed permanently

---

## Flow 2: Receive Email Notification

**Actor**: Board/Committee Member  
**Flow**: System Event → Generate Email → Deliver to User

### Steps

1. **Triggering events**:
   - Meeting invitation created
   - Meeting reminder (24h, 1h before)
   - Meeting started
   - New document uploaded
   - Agenda published
   - Vote opened
   - Action item assigned
   - Minutes published
   - Meeting cancelled/rescheduled
   - Confirmation requested/approved
2. System generates email:
   - **Subject**: "[KTDA Main Board] Meeting Invitation - Q1 Review"
   - **Board tag** prominently displayed
   - Clear action required (if any)
3. **Email content**:
   ```
   ┌─────────────────────────────────────────┐
   │  [KTDA Logo]                            │
   │                                         │
   │  KTDA MAIN BOARD                        │
   │  Meeting Invitation                     │
   │                                         │
   │  You are invited to:                    │
   │  Q1 Board Review Meeting                │
   │                                         │
   │  Date: February 15, 2026                │
   │  Time: 10:00 AM - 12:00 PM              │
   │  Location: Virtual (Jitsi)              │
   │                                         │
   │  [View Meeting Details]  [Add to Cal]   │
   │                                         │
   │  ─────────────────────────────────────  │
   │  You received this because you are a    │
   │  member of KTDA Main Board.             │
   └─────────────────────────────────────────┘
   ```
4. Email delivered to user's registered email
5. User clicks link to access system

### Error Flows

- **Email delivery failed**: Retry 3 times, log failure
- **Invalid email**: Flag user account for admin review

### Business Rules

- All emails clearly identify the board
- Board branding (logo, colors) applied
- Unsubscribe link included (for non-critical)
- Critical notifications cannot be unsubscribed
- Email templates configurable by admin

---

## Flow 3: View In-App Notifications (Bell Dropdown)

**Actor**: Any User  
**Flow**: Click Bell Icon → View List → Read Notifications

### Steps

1. User sees notification bell in header
2. **Unread badge**:
   - Red circle with count: "5"
   - Pulses briefly for new notifications
3. Click bell icon
4. **Notification dropdown**:
   ```
   ┌─────────────────────────────────────────┐
   │  Notifications                    [⚙️]  │
   │  ─────────────────────────────────────  │
   │  🔵 [KTDA Main Board]                   │
   │     New document uploaded               │
   │     Q4 Financial Report.pdf             │
   │     2 minutes ago                       │
   │  ─────────────────────────────────────  │
   │  🔵 [Audit Committee]                   │
   │     Meeting starts in 1 hour            │
   │     Q4 Audit Review                     │
   │     58 minutes ago                      │
   │  ─────────────────────────────────────  │
   │  ○  [KETEPA Limited]                    │
   │     Minutes published                   │
   │     January Board Meeting               │
   │     Yesterday                           │
   │  ─────────────────────────────────────  │
   │  [View All Notifications]               │
   └─────────────────────────────────────────┘
   ```
5. **Indicators**:
   - 🔵 Blue dot: Unread
   - ○ No dot: Read
   - Board name in brackets
6. Scroll for more notifications
7. Click "View All" for full list

### Error Flows

- **No notifications**: Show "No notifications"
- **Loading error**: Show "Unable to load notifications"

### Business Rules

- Shows last 10 notifications in dropdown
- Grouped by time (Today, Yesterday, This Week)
- Board name always visible
- Real-time updates via WebSocket
- Persists across sessions

---

## Flow 4: Mark Notification as Read

**Actor**: Any User  
**Flow**: View Notification → Mark Read → Update Count

### Steps

1. **Auto-mark as read**:
   - Click notification → Marked as read
   - Navigate to related item → Marked as read
2. **Manual mark as read**:
   - Hover notification → Show "Mark as read" icon
   - Click icon → Notification marked as read
   - Blue dot removed
3. **Mark all as read**:
   - Click "..." menu in dropdown
   - Select "Mark all as read"
   - All notifications marked as read
   - Badge count resets to 0
4. **Mark as unread**:
   - Click "..." on read notification
   - Select "Mark as unread"
   - Blue dot restored

### Error Flows

- **Update failed**: Show "Failed to update. Try again."

### Business Rules

- Reading notification doesn't delete it
- Unread count updates immediately
- Syncs across devices
- Read status persisted

---

## Flow 5: Click Notification to Navigate

**Actor**: Any User  
**Flow**: Click Notification → Navigate to Related Item

### Steps

1. Click notification in dropdown or list
2. System determines target:
   | Notification Type | Navigates To |
   |-------------------|--------------|
   | Meeting invitation | Meeting Details |
   | Document uploaded | Document viewer |
   | Agenda published | Meeting Agenda |
   | Vote opened | Meeting (vote panel) |
   | Action item assigned | Action item details |
   | Minutes published | Minutes viewer |
   | Confirmation requested | Confirmation page |
3. User navigated to target page
4. Notification marked as read
5. Context preserved (correct board selected)

### Error Flows

- **Item deleted**: Show "This item is no longer available"
- **No access**: Show "You don't have access to this item"

### Business Rules

- Deep linking to specific content
- Board context maintained
- Organization Selector updates if needed
- Works from email links too

---

## Flow 6: Configure Notification Preferences

**Actor**: Any User  
**Flow**: Settings → Notifications → Configure → Save

### Steps

1. Navigate to Settings → Notifications
2. **Notification categories**:
   ```
   NOTIFICATION PREFERENCES
   
   Meeting Notifications
   ├── Meeting invitations      [Email ✓] [In-App ✓] [SMS ○]
   ├── Meeting reminders        [Email ✓] [In-App ✓] [SMS ✓]
   ├── Meeting started          [Email ○] [In-App ✓] [SMS ○]
   └── Meeting cancelled        [Email ✓] [In-App ✓] [SMS ○]
   
   Document Notifications
   ├── New document uploaded    [Email ○] [In-App ✓] [SMS ○]
   ├── Agenda published         [Email ✓] [In-App ✓] [SMS ○]
   └── Minutes published        [Email ✓] [In-App ✓] [SMS ○]
   
   Task Notifications
   ├── Action item assigned     [Email ✓] [In-App ✓] [SMS ○]
   ├── Action item due soon     [Email ✓] [In-App ✓] [SMS ○]
   └── Action item overdue      [Email ✓] [In-App ✓] [SMS ✓]
   
   Voting Notifications
   ├── Vote opened              [Email ○] [In-App ✓] [SMS ○]
   └── Vote results             [Email ✓] [In-App ✓] [SMS ○]
   ```
3. Toggle channels for each notification type
4. Click "Save Preferences"
5. Preferences applied immediately

### Error Flows

- **Save failed**: Show "Failed to save preferences"

### Business Rules

- Some notifications mandatory (cannot disable)
- In-app always enabled for critical items
- SMS requires phone number verified
- Preferences per user, not per board
- Admin can enforce certain notifications

---

## Flow 7: Set Quiet Hours

**Actor**: Any User  
**Flow**: Settings → Notifications → Quiet Hours → Configure

### Steps

1. Navigate to Settings → Notifications
2. Scroll to "Quiet Hours" section
3. **Configure quiet hours**:
   ```
   QUIET HOURS
   
   Enable quiet hours: [Toggle ON]
   
   Start time: [10:00 PM ▼]
   End time:   [7:00 AM ▼]
   
   Days: [Mon ✓] [Tue ✓] [Wed ✓] [Thu ✓] [Fri ✓] [Sat ✓] [Sun ✓]
   
   During quiet hours:
   ○ Pause all notifications
   ● Pause non-critical only
   ○ Deliver but don't alert
   
   Critical notifications (always delivered):
   - Emergency meetings
   - Meeting starting now
   - Urgent action items
   ```
4. Click "Save"
5. Quiet hours active during specified times

### Error Flows

- **Invalid time range**: Show "End time must be after start time"

### Business Rules

- Quiet hours respect user's timezone
- Critical notifications bypass quiet hours
- Notifications queued, delivered after quiet hours
- Can be temporarily disabled

---

## Flow 8: Enable Digest Mode

**Actor**: Any User  
**Flow**: Settings → Notifications → Digest Mode → Configure

### Steps

1. Navigate to Settings → Notifications
2. Scroll to "Digest Mode" section
3. **Configure digest**:
   ```
   DIGEST MODE
   
   Enable digest mode: [Toggle ON]
   
   Frequency:
   ○ Daily (sent at 8:00 AM)
   ● Twice daily (8:00 AM and 4:00 PM)
   ○ Weekly (Monday 8:00 AM)
   
   Include in digest:
   [✓] Upcoming meetings (next 7 days)
   [✓] New documents
   [✓] Pending action items
   [✓] Unread notifications summary
   
   Exclude from digest (send immediately):
   [✓] Meeting starting reminders
   [✓] Urgent action items
   [✓] Vote notifications
   ```
4. Click "Save"
5. **Digest email example**:
   ```
   Your Daily eBoard Digest - January 16, 2026
   
   📅 UPCOMING MEETINGS (3)
   - [Main Board] Q1 Review - Tomorrow 10:00 AM
   - [Audit Committee] Monthly Review - Jan 20
   - [KETEPA] Budget Meeting - Jan 22
   
   📄 NEW DOCUMENTS (2)
   - Q4 Financial Report (Main Board)
   - Audit Findings Summary (Audit Committee)
   
   ✅ ACTION ITEMS (1 due soon)
   - Prepare budget proposal - Due Jan 18
   
   🔔 UNREAD NOTIFICATIONS (5)
   [View All in eBoard]
   ```

### Error Flows

- **Digest generation failed**: Retry, notify admin

### Business Rules

- Digest consolidates multiple notifications
- Reduces email volume
- Critical items still sent immediately
- Digest respects quiet hours
- Can be combined with regular notifications

---

## Flow 9: Manage SMS Notifications

**Actor**: Any User  
**Flow**: Settings → Notifications → SMS → Configure

### Steps

1. Navigate to Settings → Notifications
2. Scroll to "SMS Notifications" section
3. **Verify phone number** (if not done):
   - Enter phone number
   - Click "Send Verification Code"
   - Enter code received
   - Phone verified ✓
4. **Configure SMS**:
   ```
   SMS NOTIFICATIONS
   
   Phone: +254 7XX XXX XXX [Verified ✓]
   
   Enable SMS: [Toggle ON]
   
   Send SMS for:
   [✓] Meeting starting in 30 minutes
   [✓] Emergency meeting alerts
   [✓] Overdue action items
   [○] Vote opened
   [○] Document uploaded
   
   Note: SMS is for critical alerts only.
   Standard rates may apply.
   ```
5. Click "Save"

### Error Flows

- **Invalid phone**: Show "Please enter valid phone number"
- **Verification failed**: Show "Code incorrect. Try again."
- **SMS delivery failed**: Log and retry

### Business Rules

- SMS for critical notifications only
- Phone must be verified
- User can opt out anytime
- SMS costs may apply (inform user)
- Limited to prevent spam

---

## Flow 10: View Notification History

**Actor**: Any User  
**Flow**: Notifications → View All → Browse History

### Steps

1. Click "View All Notifications" from dropdown
2. **Full notification list**:
   - All notifications (read and unread)
   - Paginated (20 per page)
   - Sorted by date (newest first)
3. **Filter options**:
   - Board/Committee
   - Notification type
   - Date range
   - Read/Unread status
4. **Search**:
   - Search by keyword
   - Search by meeting name
5. **Actions**:
   - Click to navigate
   - Mark as read/unread
   - Delete notification
6. **Bulk actions**:
   - Select multiple
   - Mark all as read
   - Delete selected

### Error Flows

- **No results**: Show "No notifications match your filters"

### Business Rules

- History retained for 90 days
- Deleted notifications removed permanently
- Can filter by board for multi-board users
- Export not available (privacy)

---

## Flow 11: Admin: Configure System Notifications

**Actor**: System Admin  
**Flow**: Admin → Settings → Notifications → Configure

### Steps

1. Navigate to Admin → System Settings → Notifications
2. **Email configuration**:
   - SMTP settings
   - From address
   - Reply-to address
   - Email templates
3. **SMS configuration**:
   - SMS gateway settings
   - API credentials
   - Rate limits
4. **Notification templates**:
   - Edit email templates
   - Customize subject lines
   - Add/remove board branding
5. **Default preferences**:
   - Set defaults for new users
   - Mandatory notifications (cannot disable)
6. **Reminder timing**:
   - Meeting reminder: 24h, 1h before
   - Action item reminder: 3 days, 1 day before
7. Click "Save Configuration"

### Error Flows

- **Invalid SMTP**: Show "SMTP connection failed"
- **Template error**: Show "Template syntax error"

### Business Rules

- Admin controls system-wide settings
- Users can customize within admin limits
- Some notifications cannot be disabled
- Templates support variables ({{meeting_name}}, etc.)
- Changes apply to future notifications

---

## Summary: Notification Types

| Type | Email | In-App | SMS | Mandatory |
|------|-------|--------|-----|-----------|
| Meeting Invitation | ✓ | ✓ | ○ | Yes |
| Meeting Reminder (24h) | ✓ | ✓ | ○ | No |
| Meeting Reminder (1h) | ✓ | ✓ | ✓ | No |
| Meeting Started | ○ | ✓ | ○ | No |
| Meeting Cancelled | ✓ | ✓ | ○ | Yes |
| Document Uploaded | ○ | ✓ | ○ | No |
| Agenda Published | ✓ | ✓ | ○ | No |
| Vote Opened | ○ | ✓ | ○ | No |
| Action Item Assigned | ✓ | ✓ | ○ | No |
| Action Item Overdue | ✓ | ✓ | ✓ | No |
| Minutes Published | ✓ | ✓ | ○ | No |
| Confirmation Requested | ✓ | ✓ | ○ | Yes |

---

## Summary: Notification Channels

| Channel | Use Case | Delivery |
|---------|----------|----------|
| **Email** | Detailed info, documents | Async |
| **In-App** | Real-time updates | Instant |
| **SMS** | Critical alerts only | Instant |
| **Digest** | Daily/weekly summary | Scheduled |

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Notifications Index | `/notifications` | Browse all notifications (sidebar menu) |
| Notification Settings | `/settings/notifications` | Configure preferences |
| Admin Notifications | `/admin/settings/notifications` | System config |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Bell Icon | `Badge` + `BellOutlined` | Notification indicator |
| Dropdown | `Dropdown` + `List` | Quick view |
| Notification Item | `List.Item` | Individual notification |
| Toggle Switch | `Switch` | Enable/disable |
| Time Picker | `TimePicker` | Quiet hours |
| Phone Input | `Input` | SMS number |
| Filter Panel | `Form` + `Select` | Filter notifications |

