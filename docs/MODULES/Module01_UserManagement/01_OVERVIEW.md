# Module 1: User Management & Authentication

**Purpose**: Manage users, roles, and secure access to the system

## What We Need:

### 1. User Registration
- Admin can create user accounts with email, name, phone number, and role
- System sends temporary password to new users via email
- Users must change password on first login

### 2. User Login
- Users login with email and password
- System locks account after 5 failed login attempts for 15 minutes
- Session expires after 30 minutes of inactivity

### 3. Multi-Factor Authentication (MFA)
- Board members and administrators must enable MFA
- Support Google Authenticator or Microsoft Authenticator app
- Provide backup codes for account recovery

### 4. Multi-Board Membership
- Users can be members of multiple boards simultaneously
- Each board membership has its own role assignment
- Example: John is Chairman on Main Board, Member on KETEPA Board, Observer on Chebut Factory Board
- Chairman (Main Board) automatically has access to all 78 boards
- Users only see boards they're members of (except Chairman who sees all)

### 5. User Roles (Per Board and Committee)
- System Administrator - full system access across all boards and committees
- Board Secretary - can create meetings, upload documents, manage participants for their board(s)/committee(s)
- Chairman - can control meetings, start votes, approve minutes (Main Board Chairman sees all boards and committees)
- Vice Chairman - similar to Chairman but for specific board/committee
- Board Member - can join meetings, vote, view documents for their board(s)
- Committee Member - can join committee meetings, vote, view committee documents
- Executive Member - CEO, Company Secretary, Group Finance Director (special status)
- Observer - can view meetings but cannot vote
- **Guest/Presenter (NEW)** - Non-board member invited to present at specific meeting
  - Temporary access to specific meeting only
  - Can join meeting at designated time slot
  - Can upload presentation documents
  - Can share screen during presentation
  - Cannot vote
  - Cannot view other board/committee documents
  - Access controlled by Chairman (can admit/remove)
  - Chairman sets whether guest receives meeting minutes after meeting

### 6. Board Membership Management
- Admin can add user to specific board with specific role
- Admin can view all boards a user belongs to
- Admin can remove user from board or change role on board
- Track membership start date and end date (if membership expires)
- When Chairman role is assigned on Main Board, automatically grant access to all subsidiary boards

### 7. Password Management
- Minimum password: 12 characters with uppercase, lowercase, number, special character
- Users can reset forgotten password via email link
- Password reset link expires after 1 hour

### 8. User Profile
- Users can update their name, phone number, profile picture, and timezone
- Users can view their meeting history and attendance record across all boards
- Users can see list of all boards they're members of with their role on each board
- Users can switch between boards to view board-specific information

### 9. Digital Signature Certificate Management (NEW)
- **Company Secretary Only** (initially):
  - Upload digital certificate (X.509 .pfx/.p12 file) to system
  - Certificate stored encrypted in database
  - Password/PIN required for each signature operation (not stored)
  - View certificate details: Issuer, Valid From/To, Subject
  - Certificate expiry warning 30 days before expiration
  - Replace/renew certificate when expired
- **Future**: Other users (Chairmen) can upload certificates if designated as approvers
- Certificate validation:
  - Verify certificate is valid (not expired)
  - Verify certificate chain of trust
  - Check certificate revocation status
