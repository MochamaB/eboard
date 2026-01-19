# Module 5: Document Management (Board Pack)

**Purpose**: Upload, organize, and share meeting documents securely with board-level access control

## What We Need:

### 1. Document Upload (Board-Specific)
- Secretary can upload documents for meetings on their board(s)
- Documents automatically tagged with board identifier
- Support PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX)
- Maximum file size: 100MB per file
- Drag and drop to upload multiple files at once
- Upload progress bar showing percentage

### 2. Document Organization
- Categorize documents by type:
  - Agenda
  - Meeting Minutes
  - **Meeting Confirmation/Notice** (NEW - auto-generated, digitally signed)
  - Financial Reports
  - Committee Reports
  - Presentations
  - Supporting Documents
- Link documents to specific agenda items
- Tag documents with keywords for easy searching
- Meeting confirmation documents stored in two versions:
  - Original unsigned PDF
  - Digitally signed PDF (final, immutable)

### 3. Document Viewing
- View PDF documents directly in browser (no download required)
- Preview Word, Excel, PowerPoint documents online
- Zoom in/out, rotate pages
- Full-screen viewing mode
- Page thumbnails for quick navigation

### 4. Document Download
- Download individual documents
- Download all meeting documents as ZIP file
- Track who downloaded which documents and when
- Restrict download permissions by user role

### 5. Document Versioning
- Upload new version of existing document
- Keep history of all previous versions with dates
- View and compare different versions
- Restore previous version if needed
- Version numbering: v1.0, v1.1, v2.0

### 6. Document Security (Board-Level Access Control)
- **Critical**: Users can ONLY access documents for boards they're members of
- Main Board documents only visible to Main Board members
- KETEPA Board documents only visible to KETEPA Board members
- Factory A documents NOT visible to Factory B board members
- Chairman (Main Board) can access documents across all 78 boards
- Only meeting participants can access meeting documents
- Documents encrypted when stored
- Optional watermark with user's name and board name on viewed documents
- Prevent printing or copying (optional setting)
- Documents auto-deleted after configurable time (e.g., after 2 years)
- **Meeting Confirmation Documents**:
  - Digitally signed PDFs are immutable (cannot be edited or deleted)
  - Signature validation shown when viewing (green checkmark if valid)
  - Show signature details: Signed by, Date/Time, Certificate validity
  - Warning if signature is invalid or certificate expired

### 7. Document Search (Board-Filtered)
- Search documents by name, type, date, or content
- Filter documents by board, meeting, category, date range
- Search scope:
  - **User View**: Search only within boards user is member of
  - **Chairman View**: Search across all 78 boards
  - **Board Filter**: Limit search to specific board
- Full-text search inside PDF documents
- Save frequently used searches
- Search results show which board each document belongs to

### 8. Document Annotations (Optional for future phase)
- Add personal notes on documents
- Highlight text
- Draw on PDF pages
- Annotations private to user (not shared)
