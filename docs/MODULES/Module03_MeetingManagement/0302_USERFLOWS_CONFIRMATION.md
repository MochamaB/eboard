# Module 3: Meeting Management - Confirmation User Flows

**Module**: Meeting Management - Confirmation Phase  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Document

1. Submit Meeting for Confirmation
2. Review Pending Confirmations (Approver Dashboard)
3. Sign and Confirm Meeting
4. Reject Meeting Confirmation
5. Re-confirm After Changes
6. View Confirmation Status

---

## Flow 1: Submit Meeting for Confirmation

**Actor**: Board Secretary  
**Flow**: Meeting Details → Request Confirmation → Generate Document → Submit

### Steps

1. Navigate to Meeting Details page (status: "Draft")
2. Review meeting details are complete:
   - Date, time, location set
   - Participants populated
   - Agenda attached (optional but recommended)
3. Click "Request Confirmation" button
4. System generates confirmation document (PDF):
   - Board name and logo
   - Meeting title, date, time, venue
   - List of invited participants
   - Agenda summary (if available)
   - Approver details
5. **Preview confirmation document**:
   - View PDF in modal
   - Check all details are correct
6. **Add custom notes** (optional):
   - Special instructions
   - Dress code, parking info
   - Materials to bring
7. Click "Submit for Confirmation"
8. System actions:
   - Meeting status → "Pending Confirmation"
   - Notification sent to designated approver
   - Email: "Meeting Confirmation Required: [Board Name] - [Date]"
9. Success: "Confirmation request sent to [Approver Name]"

### Error Flows

- **Missing required fields**: Show error "Complete meeting details before requesting confirmation"
- **No agenda**: Show warning "No agenda attached. Continue anyway?"
- **Approver not configured**: Show error "No approver configured for this board. Contact admin."

### Business Rules

- Main Board meetings: Approver is always Company Secretary
- Other boards: Approver configured in board settings
- Confirmation document generated from template
- Document includes all meeting details at time of submission
- Changes after submission require re-confirmation

---

## Flow 2: Review Pending Confirmations (Approver Dashboard)

**Actor**: Company Secretary / Designated Approver  
**Flow**: Dashboard → Pending Confirmations → Review List

### Steps

1. Login as Company Secretary or designated approver
2. View Dashboard with pending confirmations widget:
   - Badge: "5 meetings awaiting your confirmation"
   - List showing:
     - Board/Committee name
     - Meeting date
     - Submitted by (Secretary name)
     - Days pending
3. Click "View All Pending" or individual meeting
4. Navigate to Pending Confirmations page:
   - Table with all pending meetings
   - Columns: Board, Meeting Title, Date, Submitted By, Submitted On
   - Sort by: Date (default), Board, Submitted date
   - Filter by: Board type, Date range
5. Click meeting row to review details

### Error Flows

- **No pending confirmations**: Show "No meetings pending your confirmation"

### Business Rules

- Company Secretary sees pending confirmations for ALL boards
- Board-specific approvers see only their board's pending confirmations
- Oldest pending shown first (FIFO)
- Meetings pending > 3 days highlighted in yellow
- Meetings pending > 7 days highlighted in red

---

## Flow 3: Sign and Confirm Meeting

**Actor**: Company Secretary / Designated Approver  
**Flow**: Pending Meeting → Review → Enter PIN → Sign → Confirm

### Steps

1. Open pending meeting from dashboard or list
2. Review meeting details:
   - Board/Committee name
   - Meeting title, date, time, location
   - Participant list
   - Agenda (if attached)
   - Documents (if attached)
3. View confirmation document (PDF preview)
4. Click "Sign and Confirm" button
5. **Authentication modal**:
   - Enter signature PIN/password
   - PIN authenticates access to digital certificate
6. Click "Apply Signature"
7. System applies digital signature:
   - Uses approver's X.509 certificate
   - Embeds signature in PDF using iText7
   - Adds visible signature block:
     - Name: "John Kamau"
     - Title: "Company Secretary"
     - Date/Time: "January 16, 2026 at 10:30 AM"
     - "Digitally Signed"
   - PDF becomes tamper-proof
8. System actions:
   - Meeting status → "Confirmed"
   - Invitations sent to all participants automatically
   - Signed PDF attached to invitation emails
   - Both unsigned and signed versions stored
9. Success: "Meeting confirmed. Invitations sent to 15 participants."

### Error Flows

- **Wrong PIN**: Show error "Invalid PIN. Please try again." (3 attempts max)
- **Certificate expired**: Show error "Your certificate has expired. Contact admin."
- **Certificate not found**: Show error "Digital certificate not configured. Contact admin."
- **Signing failed**: Show error "Signature failed. Please try again."

### Business Rules

- PIN required for each signature (not stored)
- Certificate stored securely in system
- Signature includes timestamp from server (trusted time)
- Signed document is legally binding
- Original unsigned version retained for audit
- Invitations sent automatically after confirmation

---

## Flow 4: Reject Meeting Confirmation

**Actor**: Company Secretary / Designated Approver  
**Flow**: Pending Meeting → Review → Reject → Enter Reason → Notify

### Steps

1. Open pending meeting from dashboard
2. Review meeting details
3. Identify issue (e.g., wrong date, missing agenda, conflict)
4. Click "Reject" button
5. **Rejection modal**:
   - Select reason:
     - "Incomplete information"
     - "Scheduling conflict"
     - "Agenda not approved"
     - "Quorum concerns"
     - "Other"
   - Enter detailed comments (required)
   - Example: "Please add the Q4 financial report to the agenda before resubmitting."
6. Click "Confirm Rejection"
7. System actions:
   - Meeting status → "Rejected"
   - Notification sent to Secretary
   - Email includes rejection reason and comments
8. Success: "Meeting confirmation rejected. Secretary notified."

### Error Flows

- **No reason provided**: Show error "Please provide a reason for rejection"

### Business Rules

- Rejection reason required for audit trail
- Secretary can revise and resubmit
- Rejected meetings can be edited freely
- Rejection does not delete meeting
- Multiple rejections allowed (iterative process)

---

## Flow 5: Re-confirm After Changes

**Actor**: Board Secretary → Approver  
**Flow**: Edit Confirmed Meeting → System Reverts Status → Resubmit → Re-sign

### Steps

1. Secretary navigates to confirmed meeting
2. Clicks "Edit" button
3. System shows warning:
   - "This meeting was previously confirmed."
   - "Any changes will require re-confirmation."
   - "Original confirmation will be marked as superseded."
4. Secretary confirms they want to proceed
5. Secretary makes changes (date, time, agenda, etc.)
6. Clicks "Save Changes"
7. System actions:
   - Meeting status → "Pending Confirmation"
   - Original signed document marked "Superseded"
   - New confirmation document generated with changes
   - Notification sent to approver
8. Approver reviews and signs (Flow 3)
9. New signed document replaces previous
10. Updated invitations sent to participants

### Error Flows

- **Minor change warning**: For small changes, show "This change requires re-confirmation. Continue?"

### Business Rules

- ANY change to confirmed meeting requires re-confirmation
- Original signed document retained (marked superseded)
- Audit trail shows: Original → Superseded → New
- Participants notified of changes after re-confirmation
- Version history maintained

---

## Flow 6: View Confirmation Status

**Actor**: Board Secretary / Board Member  
**Flow**: Meeting Details → Confirmation Tab → View Status and Documents

### Steps

1. Navigate to Meeting Details page
2. Click "Confirmation" tab
3. View confirmation status:
   - **Status badge**: Draft / Pending / Confirmed / Rejected
   - **Timeline**:
     - Created: Jan 10, 2026 by Jane (Secretary)
     - Submitted for confirmation: Jan 11, 2026
     - Confirmed: Jan 12, 2026 by John (Company Secretary)
4. View confirmation documents:
   - Unsigned version (original submission)
   - Signed version (with digital signature)
   - Click to download or preview
5. **If rejected**:
   - Show rejection reason and comments
   - Show who rejected and when
   - Secretary sees "Revise and Resubmit" button
6. **Signature verification**:
   - Click "Verify Signature" to check document integrity
   - Shows: "Signature valid. Document has not been modified."

### Error Flows

- **Document not found**: Show error "Confirmation document not available"

### Business Rules

- All board members can view confirmation status
- Only Secretary can resubmit after rejection
- Signed documents downloadable by all members
- Signature verification available to prove authenticity
- Full audit trail visible

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Pending Confirmations | `/confirmations` | Approver's pending list |
| Confirmation Review | `/meetings/:id/confirmation` | Review and sign |
| Confirmation Status | `/meetings/:id/confirmation/status` | View status/history |

---

## Summary: Key Components

| Component | Ant Design | Purpose |
|-----------|------------|---------|
| Pending Badge | `Badge` | Show count on dashboard |
| Confirmation List | `Table` | List pending confirmations |
| PDF Preview | Custom (react-pdf) | Preview confirmation document |
| PIN Input | `Input.Password` | Enter signature PIN |
| Signature Modal | `Modal` | Authentication for signing |
| Status Timeline | `Timeline` | Show confirmation history |
| Rejection Form | `Modal` + `Select` + `TextArea` | Capture rejection reason |
| Signature Verification | `Result` | Show verification result |

---

## Digital Signature Technical Notes

**Library**: iText7 (.NET)

**Signature Process**:
1. Load PDF document
2. Load approver's X.509 certificate (.pfx file)
3. Decrypt certificate with PIN
4. Create signature appearance (visible block)
5. Apply cryptographic signature
6. Save signed PDF

**Verification Process**:
1. Load signed PDF
2. Extract signature
3. Verify certificate chain
4. Check document hash matches signature
5. Confirm no modifications since signing

**Storage**:
- Certificates stored encrypted in database
- PIN never stored (entered each time)
- Signed PDFs stored in document storage
- Audit log records all signature events

