# Module 5: Document Management - User Flows

**Module**: Document Management (Board Pack)  
**Version**: 1.0  
**Last Updated**: January 2026

---

## Flows in This Module

1. Browse Documents Library (Index Page)
2. Upload Document to Meeting
3. Organize and Categorize Documents
4. View Document in Browser
5. Download Documents
6. Upload New Document Version
7. Search Documents
8. View Signed Confirmation Document
9. Manage Document Permissions
10. Create Board Pack (ZIP)
11. Delete/Archive Document

---

## Flow 1: Browse Documents Library (Index Page)

**Actor**: Any Board/Committee Member  
**Flow**: Sidebar → Documents → Browse/Filter → View Document

### Steps

1. Navigate to Documents (sidebar)
2. **Documents Index Page** displays:
   - Search bar (full-text search)
   - Filter panel
   - Tabs: All Documents | By Meeting | By Category | Recent
3. **Tabs**:
   - **All Documents** (default): All accessible documents
   - **By Meeting**: Documents grouped by meeting (expandable)
   - **By Category**: Documents grouped by category
   - **Recent**: Last 30 days, most recent first
4. **Filter options**:
   - Board/Committee dropdown (user's boards only, Chairman sees all)
   - Category: Agenda, Minutes, Reports, Presentations, etc.
   - Date range (upload date or meeting date)
   - File type: PDF, DOCX, XLSX, PPTX
   - Meeting: Link to specific meeting
   - Year: For historical documents
5. **Document list columns**:
   - Checkbox (for bulk actions)
   - Document name (with file type icon)
   - Board/Committee name
   - Meeting name (linked)
   - Category
   - Upload date
   - Actions menu
6. **Organization Selector integration**:
   - If specific board selected in header: list shows only that board's documents
   - If "KTDA Group (All)" selected: shows all user's documents
7. **Actions per document**:
   - View (opens in browser)
   - Download
   - Go to Meeting (navigate to meeting details)
   - Edit Details (Secretary only)
   - Delete (Secretary only)
8. **Bulk actions** (select multiple):
   - Download as ZIP
   - Move to category
9. **Quick access sidebar** (optional):
   - Recent Documents (last 5 viewed)
   - Starred/Favorites
   - Pending Minutes (for Secretary)

### Error Flows

- **No documents found**: Show "No documents found. Try different filters."
- **No access**: Documents from other boards not shown

### Business Rules

- Users only see documents for boards/committees they're members of
- Chairman sees documents across all 78 boards
- Full-text search available for PDFs
- Results always show board name for context
- Default sort: Most recent first
- Pagination: 20 documents per page

---

## Flow 2: Upload Document to Meeting

**Actor**: Board Secretary  
**Flow**: Meeting Details → Documents Tab → Upload → Categorize → Save

### Steps

1. Navigate to Meeting Details page
2. Click "Documents" tab
3. Click "+ Upload Document" button
4. **Upload interface**:
   - Drag and drop files onto upload area
   - Or click "Browse" to select files
   - Multiple files can be selected
5. **For each file**:
   - Progress bar shows upload percentage
   - File validated (type, size)
   - Supported: PDF, DOCX, XLSX, PPTX
   - Max size: 100MB per file
6. **Categorize document**:
   - Select category: Agenda, Financial Report, Committee Report, Presentation, Supporting Document
   - Add description (optional)
   - Link to agenda item (optional dropdown)
   - Add tags/keywords (optional)
7. Click "Save"
8. Document uploaded and linked to meeting
9. Document automatically tagged with board identifier
10. Notification sent to board members: "New document uploaded"

### Error Flows

- **File too large**: Show "File exceeds 100MB limit"
- **Invalid file type**: Show "Only PDF, DOCX, XLSX, PPTX files allowed"
- **Upload failed**: Show "Upload failed. Please try again."
- **Duplicate file name**: Show "File with this name exists. Rename or replace?"

### Business Rules

- Only Secretary can upload documents to meetings
- Documents automatically inherit board access restrictions
- Board identifier embedded in document metadata
- Upload logged in audit trail
- Guests cannot upload (unless explicitly allowed)

---

## Flow 3: Organize and Categorize Documents

**Actor**: Board Secretary  
**Flow**: Documents List → Select Document → Edit Details → Save

### Steps

1. Navigate to Meeting Details → Documents tab
2. View document list with current categories
3. Click document row or "Edit" icon
4. **Edit document details**:
   - Change category (dropdown)
   - Update description
   - Link/unlink agenda item
   - Add/remove tags
   - Reorder in list (drag and drop)
5. Click "Save Changes"
6. Document details updated
7. Changes reflected in document list

### Error Flows

- **Cannot edit signed document**: Show "Signed documents cannot be modified"

### Business Rules

- Only Secretary can organize documents
- Signed confirmation documents are read-only
- Category changes logged in audit trail
- Tags help with search functionality
- Documents can be linked to multiple agenda items

---

## Flow 4: View Document in Browser

**Actor**: Board/Committee Member  
**Flow**: Documents List → Click Document → View in Browser

### Steps

1. Navigate to Meeting Details → Documents tab
2. Click document name or "View" icon
3. **Document viewer opens**:
   - PDF rendered in browser (no download)
   - Word/Excel/PowerPoint converted to viewable format
4. **Viewer controls**:
   - Zoom in/out (slider or +/- buttons)
   - Rotate page (90° clockwise/counter-clockwise)
   - Full-screen mode
   - Page navigation (previous/next, go to page)
   - Page thumbnails sidebar
5. **For signed documents**:
   - Green checkmark: "Signature valid"
   - Show: "Signed by [Name] on [Date]"
   - Click for certificate details
6. **Optional watermark** (if enabled):
   - User's name and board name displayed
   - Prevents unauthorized sharing
7. Close viewer to return to documents list

### Error Flows

- **Document not found**: Show "Document not available"
- **No access**: Show "You don't have permission to view this document"
- **Corrupted file**: Show "Unable to display document. Try downloading."

### Business Rules

- Users can only view documents for their boards
- Chairman can view documents across all 78 boards
- View action logged in audit trail
- Watermark configurable per board
- No download required for viewing

---

## Flow 5: Download Documents

**Actor**: Board/Committee Member  
**Flow**: Documents List → Select → Download

### Steps

1. Navigate to Meeting Details → Documents tab
2. **Download single document**:
   - Click "Download" icon next to document
   - File downloads to device
3. **Download multiple documents**:
   - Check boxes next to desired documents
   - Click "Download Selected"
   - Files downloaded as ZIP
4. **Download all meeting documents**:
   - Click "Download Board Pack"
   - All meeting documents bundled as ZIP
   - ZIP organized by category folders
5. Download tracked in system

### Error Flows

- **Download restricted**: Show "Download not permitted for this document"
- **File not found**: Show "Document no longer available"

### Business Rules

- Download permissions configurable per role
- Some documents may be view-only (no download)
- All downloads logged with user, timestamp, IP
- Signed documents download as-is (signature preserved)
- Board pack includes all accessible documents

---

## Flow 6: Upload New Document Version

**Actor**: Board Secretary  
**Flow**: Document Details → Upload New Version → Confirm → Save

### Steps

1. Navigate to document in Documents list
2. Click "..." menu → "Upload New Version"
3. **Upload new file**:
   - Select or drag new file
   - Must be same file type as original
4. **Version details**:
   - System auto-assigns version number (v1.0 → v1.1)
   - Add version notes: "Updated financial figures"
   - Major version option: v1.1 → v2.0
5. Click "Upload Version"
6. New version uploaded
7. Previous version retained in history
8. Notification: "Document updated" sent to members who viewed previous version

### Error Flows

- **Different file type**: Show "New version must be same file type"
- **Cannot version signed document**: Show "Signed documents cannot be versioned"

### Business Rules

- Previous versions retained (not deleted)
- Version history shows all changes
- Users can view/download previous versions
- Signed confirmation documents cannot be versioned
- Version notes required for audit trail

---

## Flow 7: Search Documents

**Actor**: Board/Committee Member  
**Flow**: Documents → Search → Filter → View Results

### Steps

1. Navigate to Documents section (sidebar)
2. **Search bar**:
   - Enter search term (document name, content, keywords)
   - Press Enter or click Search
3. **Filter options**:
   - Board/Committee (dropdown - shows user's boards)
   - Meeting (dropdown)
   - Category (Agenda, Minutes, Reports, etc.)
   - Date range (from/to)
   - File type (PDF, DOCX, etc.)
4. **Search scope** (based on user role):
   - Regular user: Only their boards' documents
   - Chairman: All 78 boards' documents
5. **Results displayed**:
   - Document name
   - Board name (important for multi-board users)
   - Meeting name
   - Category
   - Date uploaded
   - Relevance score (if full-text search)
6. Click document to view
7. **Save search** (optional):
   - Click "Save Search"
   - Name the search
   - Access from "Saved Searches"

### Error Flows

- **No results**: Show "No documents found. Try different search terms."
- **Search too broad**: Show "Too many results. Please add filters."

### Business Rules

- Search respects board access permissions
- Full-text search available for PDFs
- Results always show board name for context
- Search history saved for user
- Chairman can filter by specific board

---

## Flow 8: View Signed Confirmation Document

**Actor**: Board/Committee Member  
**Flow**: Meeting Details → Confirmation Tab → View Signed Document

### Steps

1. Navigate to Meeting Details page
2. Click "Confirmation" tab
3. View confirmation status and documents:
   - **Unsigned version**: Original submission
   - **Signed version**: Digitally signed PDF
4. Click "View Signed Document"
5. **Document viewer with signature info**:
   - Document displayed
   - **Signature panel** (side or bottom):
     - ✓ Green checkmark: "Signature Valid"
     - Signed by: "John Kamau, Company Secretary"
     - Date/Time: "January 15, 2026 at 10:30 AM"
     - Certificate: "Valid until December 2027"
6. **Verify signature**:
   - Click "Verify Signature"
   - System checks: Certificate validity, Document integrity
   - Result: "Document has not been modified since signing"
7. Download signed PDF (signature embedded)

### Error Flows

- **Invalid signature**: Show ⚠ "Signature invalid. Document may have been modified."
- **Expired certificate**: Show ⚠ "Certificate expired. Signature was valid at time of signing."

### Business Rules

- Signed documents are immutable
- Cannot edit, delete, or version signed documents
- Signature verification available anytime
- Both unsigned and signed versions stored
- Audit trail shows all access to signed documents

---

## Flow 9: Manage Document Permissions

**Actor**: Board Secretary / System Admin  
**Flow**: Document Details → Permissions → Configure → Save

### Steps

1. Navigate to document in Documents list
2. Click "..." menu → "Manage Permissions"
3. **View current permissions**:
   - Who can view (default: all board members)
   - Who can download (default: all board members)
   - Who can print (configurable)
4. **Modify permissions**:
   - Toggle: "Allow download" (Yes/No)
   - Toggle: "Allow printing" (Yes/No)
   - Toggle: "Show watermark" (Yes/No)
   - Restrict to specific members (optional)
5. **Guest access** (for meeting documents):
   - Toggle: "Guests can view" (default: No)
   - If Yes, select which guests
6. Click "Save Permissions"
7. Permissions applied immediately

### Error Flows

- **Cannot restrict Chairman**: Show "Chairman always has full access"

### Business Rules

- Default: All board members can view and download
- Chairman always has full access (cannot be restricted)
- Guests have no access by default
- Permission changes logged in audit trail
- Watermark includes user name and timestamp

---

## Flow 10: Create Board Pack (ZIP)

**Actor**: Board Secretary  
**Flow**: Meeting Details → Documents → Create Board Pack → Download

### Steps

1. Navigate to Meeting Details → Documents tab
2. Click "Create Board Pack" button
3. **Configure board pack**:
   - Select documents to include (default: all)
   - Choose folder structure:
     - By category (Agenda/, Reports/, etc.)
     - Flat (all in one folder)
   - Include table of contents (PDF index)
   - Include meeting details cover page
4. Click "Generate Board Pack"
5. System creates ZIP file:
   - Progress indicator shown
   - "Generating board pack..."
6. **Download ready**:
   - Click "Download Board Pack"
   - ZIP file downloads
7. Board pack also saved to meeting documents

### Error Flows

- **No documents selected**: Show "Please select at least one document"
- **Generation failed**: Show "Failed to create board pack. Try again."

### Business Rules

- Board pack is snapshot at time of creation
- Useful for offline access during meetings
- Table of contents lists all documents with page numbers
- Cover page shows meeting details and participant list
- Board pack can be regenerated if documents change

---

## Flow 11: Delete/Archive Document

**Actor**: Board Secretary  
**Flow**: Document Details → Delete/Archive → Confirm

### Steps

1. Navigate to document in Documents list
2. Click "..." menu → "Delete" or "Archive"
3. **If Delete**:
   - Confirmation: "Delete this document permanently?"
   - Warning: "This action cannot be undone"
   - Enter reason for deletion (required)
   - Click "Delete"
   - Document removed from meeting
4. **If Archive**:
   - Confirmation: "Archive this document?"
   - Info: "Archived documents are hidden but can be restored"
   - Click "Archive"
   - Document moved to archive
5. Action logged in audit trail

### Error Flows

- **Cannot delete signed document**: Show "Signed documents cannot be deleted"
- **Cannot delete after meeting**: Show "Documents cannot be deleted after meeting completion" (configurable)

### Business Rules

- Signed confirmation documents CANNOT be deleted
- Deletion requires reason for compliance
- Archived documents can be restored
- Auto-archive after configurable period (e.g., 2 years)
- Deletion logged with user, timestamp, reason
- Admin can configure deletion restrictions

---

## Summary: Document Access Matrix

| User Role | View Own Board | View Other Boards | Download | Upload | Delete |
|-----------|----------------|-------------------|----------|--------|--------|
| Board Member | ✓ | ✗ | ✓ (configurable) | ✗ | ✗ |
| Board Secretary | ✓ | ✗ | ✓ | ✓ | ✓ |
| Chairman | ✓ | ✓ (all 78) | ✓ | ✗ | ✗ |
| Guest | Limited | ✗ | ✗ (default) | ✗ | ✗ |
| System Admin | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Summary: Pages Required

| Page | Route | Purpose |
|------|-------|---------|
| Documents Index | `/documents` | Tabbed document library (All, By Meeting, By Category, Recent) |
| Meeting Documents | `/meetings/:id/documents` | Documents for specific meeting |
| Document Viewer | `/documents/:id/view` | In-browser document viewing |
| Document Details | `/documents/:id` | Document info and versions |
| Upload Document | `/meetings/:id/documents/upload` | Upload interface |

---

## Summary: Key Components

| Component | Ant Design / Library | Purpose |
|-----------|---------------------|---------|
| Upload Area | `Upload.Dragger` | Drag-and-drop upload |
| Progress Bar | `Progress` | Upload progress |
| Document List | `Table` | List with actions |
| PDF Viewer | react-pdf / PDF.js | In-browser PDF viewing |
| Category Select | `Select` | Categorize documents |
| Tag Input | `Select` mode="tags" | Add keywords |
| Search Input | `Input.Search` | Search documents |
| Filter Panel | `Form` + `Select` + `DatePicker` | Filter options |
| Version History | `Timeline` | Show document versions |
| Permission Toggles | `Switch` | Configure access |

