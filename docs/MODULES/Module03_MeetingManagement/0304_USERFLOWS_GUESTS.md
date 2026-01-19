# Module 3: Meeting Management - Guest/Presenter User Flows

**Module**: Meeting Management - Guest/Presenter Management  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Document

1. Invite Guest/Presenter to Meeting
2. Configure Guest Permissions
3. Guest Receives Invitation
4. Guest Joins Meeting
5. Manage Guest During Meeting
6. Remove Guest from Meeting

---

## Flow 1: Invite Guest/Presenter to Meeting

**Actor**: Board Secretary  
**Flow**: Meeting Details → Add Guest → Search User → Set Time Slot → Send Invitation

### Steps

1. Navigate to Meeting Details page
2. Click "Participants" tab
3. Click "+ Add Guest/Presenter" button
4. **Search for user**:
   - Search by name or email
   - If user exists: Select from results
   - If user doesn't exist: Click "Create Guest Account"
5. **If creating new guest account**:
   - Enter: Name, Email, Phone (optional)
   - Enter: Title/Role (e.g., "General Manager, KETEPA")
   - Click "Create Account"
   - Guest account created with limited permissions
6. **Set guest details for this meeting**:
   - **Presentation Topic**: "Q4 Sales Performance Report"
   - **Time Slot Start**: 10:30 AM
   - **Time Slot End**: 11:00 AM (30 minutes)
   - **Documents to Present**: Allow guest to upload? Yes/No
7. Click "Add Guest"
8. Guest added to meeting participants (marked as "Guest")
9. Invitation NOT sent yet (see Flow 3)

### Error Flows

- **Email already exists**: Show existing user, allow selection
- **Invalid time slot**: Show "Time slot must be within meeting duration"
- **Time slot overlap**: Show "Time slot overlaps with another guest"

### Business Rules

- Guests are NOT board/committee members
- Guests have limited access (no voting, limited documents)
- Each guest must have designated time slot
- Multiple guests can be added with different time slots
- Guest accounts persist for future meetings

---

## Flow 2: Configure Guest Permissions

**Actor**: Chairman / Board Secretary  
**Flow**: Meeting Details → Guest → Configure Permissions → Save

### Steps

1. Navigate to Meeting Details → Participants tab
2. Find guest in participant list
3. Click "Configure" or gear icon next to guest
4. **Permission settings**:
   
   | Permission | Default | Options |
   |------------|---------|---------|
   | Join meeting | Yes | During time slot only |
   | Upload documents | Yes | Presentation materials |
   | View board documents | No | Chairman can override |
   | Share screen | Yes | For presentation |
   | Vote | No | Never allowed |
   | Chat | Yes | During session |
   | Receive minutes | No | Chairman decides |
   
5. **Modify permissions as needed**:
   - Toggle "View board documents" → Yes (if needed)
   - Toggle "Receive minutes after meeting" → Yes
6. Click "Save Permissions"
7. Permissions applied to this guest for this meeting

### Error Flows

- **Cannot enable voting**: Show "Guests cannot vote in board meetings"

### Business Rules

- Voting NEVER allowed for guests (hard rule)
- Document access is per-meeting (not permanent)
- Chairman has final say on permissions
- Default permissions are restrictive
- Permissions can be changed before and during meeting

---

## Flow 3: Guest Receives Invitation

**Actor**: System → Guest  
**Flow**: Meeting Confirmed → System Sends Invitation → Guest Receives Email

### Steps

1. Meeting is confirmed (or scheduled if no confirmation required)
2. System sends invitation to guest:
   - **Email subject**: "Presentation Invitation: [Board Name] Meeting - [Date]"
   - **Email content**:
     - Meeting details (date, time, location)
     - Guest's presentation topic
     - Guest's time slot: "Your presentation: 10:30 AM - 11:00 AM"
     - Join link (active only during time slot)
     - Instructions for uploading presentation materials
     - Note: "You will be admitted by the Chairman during your time slot"
3. Guest can:
   - Add to calendar (.ics attachment)
   - Upload presentation materials (if allowed)
   - Confirm attendance (optional RSVP)

### Error Flows

- **Email delivery failed**: Notify Secretary, allow resend

### Business Rules

- Guest invitation sent with board member invitations
- Guest invitation has different template (emphasizes time slot)
- Join link works only during designated time slot
- Guest cannot access meeting before their slot
- Reminder sent 1 hour before guest's time slot

---

## Flow 4: Guest Joins Meeting

**Actor**: Guest/Presenter  
**Flow**: Time Slot Arrives → Click Join → Waiting Room → Admitted → Present

### Steps

1. Guest receives reminder: "Your presentation starts in 15 minutes"
2. Guest clicks "Join Meeting" link
3. **Before time slot**:
   - Message: "Your presentation slot begins at 10:30 AM"
   - "Please wait. You will be able to join at that time."
   - Countdown timer shown
4. **At time slot start**:
   - "Join Meeting" button becomes active
   - Guest clicks to join
5. **Pre-join screen**:
   - Camera/microphone preview
   - Display name (pre-filled)
   - Click "Join"
6. **Waiting room**:
   - Message: "Please wait. The Chairman will admit you shortly."
   - Chairman receives notification: "Guest [Name] is waiting"
7. **Chairman admits guest**
8. Guest joins meeting:
   - Can see other participants
   - Can share screen for presentation
   - Can chat
   - **Cannot** see board documents (unless permission granted)
   - **Cannot** vote
9. Guest presents during their time slot
10. After presentation:
    - Chairman thanks guest
    - Guest removed from meeting (manual or automatic)

### Error Flows

- **Too early**: Show "Your time slot has not started yet"
- **Too late**: Show "Your time slot has ended. Contact the Secretary."
- **Meeting not started**: Show "Meeting has not started yet"
- **Not recognized**: Show "You are not invited to this meeting"

### Business Rules

- Guest can only join during their designated time slot
- 15-minute grace period before slot (can wait in lobby)
- Guest placed in waiting room until Chairman admits
- Guest sees limited participant list
- Guest cannot access meeting after their slot ends

---

## Flow 5: Manage Guest During Meeting

**Actor**: Chairman  
**Flow**: During Meeting → Guest Panel → Monitor → Control Access

### Steps

1. During meeting, Chairman sees guest status:
   - Waiting guests (in lobby)
   - Active guests (in meeting)
   - Upcoming guests (time slot not started)
2. **When guest's time slot approaches**:
   - Notification: "Guest [Name] is ready for their presentation"
   - Chairman can admit early or wait for exact time
3. **Admit guest**:
   - Click "Admit" in waiting room panel
   - Guest joins meeting
   - Announcement: "[Name] has joined the meeting"
4. **During guest presentation**:
   - Monitor guest's screen share
   - Can mute/unmute guest
   - Can stop guest's screen share if needed
5. **After presentation**:
   - Chairman thanks guest
   - Option A: Click "Remove Guest" to end their session
   - Option B: Allow guest to leave voluntarily
   - Option C: Guest auto-removed when time slot ends (if configured)
6. **Grant additional access** (if needed):
   - "Allow [Guest] to view board pack" → Yes
   - "Extend time slot by 15 minutes" → Confirm

### Error Flows

- **Guest not responding**: Show "Guest is not responding. Remove from waiting room?"

### Business Rules

- Chairman controls guest admission
- Secretary can also manage guests (if host)
- Guest time slot is guideline (Chairman can extend)
- Auto-removal at slot end is optional (configurable)
- All guest activities logged for minutes

---

## Flow 6: Remove Guest from Meeting

**Actor**: Chairman  
**Flow**: During Meeting → Select Guest → Remove → Confirm

### Steps

1. During meeting, locate guest in participants panel
2. Click "Remove" next to guest name
3. **Confirmation modal**:
   - "Remove [Guest Name] from meeting?"
   - "Guest will not be able to rejoin."
   - Options: "Remove" / "Cancel"
4. Click "Remove"
5. System actions:
   - Guest disconnected from meeting
   - Message to guest: "You have been removed from the meeting. Thank you for your presentation."
   - Guest cannot rejoin (link deactivated)
   - Removal logged in meeting record
6. Meeting continues with board members

### Error Flows

- **Guest already left**: Show "Guest has already left the meeting"

### Business Rules

- Only Chairman or host can remove guests
- Removed guests cannot rejoin same meeting
- Removal is immediate (no grace period)
- Polite message shown to guest
- Removal recorded in meeting minutes

---

## Summary: Guest vs Board Member Comparison

| Capability | Board Member | Guest/Presenter |
|------------|--------------|-----------------|
| Join meeting | Anytime | During time slot only |
| Waiting room | Yes (admitted by host) | Yes (admitted by Chairman) |
| View participants | Full list | Limited list |
| View board documents | Yes | No (unless granted) |
| Upload documents | Yes | Presentation only |
| Share screen | Yes | Yes (for presentation) |
| Vote | Yes | Never |
| Chat | Yes | Yes (during session) |
| Receive minutes | Yes | Chairman decides |
| Access after meeting | Yes | No |

---

## Summary: Guest Lifecycle

```
Invited → Invitation Sent → Time Slot Arrives → Waiting Room → Admitted → Presenting → Removed/Left
```

**Key Timestamps**:
- Invitation sent: When meeting confirmed
- Reminder: 1 hour before time slot
- Join enabled: At time slot start
- Auto-remove: At time slot end (optional)

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Add Guest | `/meetings/:id/guests/add` | Add guest to meeting |
| Guest Permissions | `/meetings/:id/guests/:guestId` | Configure permissions |
| Guest Upload | `/meetings/:id/guests/:guestId/upload` | Guest uploads materials |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Guest Search | `Select` with search | Find/create guest |
| Time Slot Picker | `TimePicker.RangePicker` | Set presentation slot |
| Permission Toggles | `Switch` | Configure access |
| Guest Badge | `Tag` color="orange" | Identify guests in list |
| Waiting Room Panel | Custom | Show waiting guests |
| Countdown Timer | Custom | Time until slot |
| Remove Confirmation | `Modal` | Confirm guest removal |

---

## Guest Account Notes

**Guest Account Creation**:
- Minimal information required (name, email)
- No password set initially
- Magic link for meeting access
- Account persists for future invitations
- Can be converted to full user if needed

**Guest Data Retention**:
- Guest participation logged per meeting
- Presentation materials stored with meeting
- Guest cannot access past meetings
- Admin can delete guest accounts

