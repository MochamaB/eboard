# Module 8: Meeting Minutes - Implementation Plan

**Module**: Meeting Minutes  
**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: In Progress

---

## 📊 Current Implementation Status

### ✅ Complete Components

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| **Mock Data** | ✅ Complete | `src/mocks/db/tables/` | 5 minutes, comments, signatures |
| Minutes Table | ✅ Complete | `minutes.ts` | MTG-007 (draft), MTG-008 (published) |
| Comments Table | ✅ Complete | `minutesComments.ts` | Full comment system |
| Signatures Table | ✅ Complete | `minutesSignatures.ts` | Digital signatures |
| Action Items | ✅ Complete | `actionItems.ts` | 19 records, linked to minutes |
| Resolutions | ✅ Complete | `resolutions.ts` | 6 records, linked to meetings |
| **Types & Schemas** | ✅ Complete | `src/types/minutes.types.ts` | All Zod schemas |
| **Query Functions** | ✅ Complete | `src/mocks/db/queries/minutesQueries.ts` | Case-insensitive ID matching |
| **API Client** | ✅ Complete | `src/api/minutes.api.ts` | All CRUD + workflow endpoints |
| **MSW Handlers** | ✅ Complete | `src/mocks/handlers/minutes.handlers.ts` | All API endpoints mocked |
| **React Query Hooks** | ✅ Complete | `src/hooks/api/useMinutes.ts` | All queries + mutations |
| **Tab Container** | ✅ Complete | `src/pages/Meetings/tabs/MeetingMinutesTab.tsx` | Phase-aware orchestrator |
| **Status Badge** | ✅ Complete | `src/components/common/Minutes/MinutesStatusBadge.tsx` | Themed status display |
| **Comment Panel** | ✅ Complete | `src/components/common/Minutes/MinutesCommentPanel.tsx` | Full comment UI |
| **Workflow Timeline** | ✅ Complete | `src/components/common/Minutes/MinutesWorkflowTimeline.tsx` | Progress visualization |
| **Signature Panel** | ✅ Exists | `src/components/common/Minutes/MinutesSignaturePanel.tsx` | Needs integration |

### ❌ Missing Components

| Component | Priority | Estimated Effort | Dependencies |
|-----------|----------|------------------|--------------|
| **MinutesEditor** | 🔴 HIGH | 2-3 days | Rich text editor library |
| **MinutesViewer** | 🔴 HIGH | 1 day | HTML sanitization |
| **Template Selector** | 🟡 MEDIUM | 1 day | Template definitions |
| **Auto-population Service** | 🔴 HIGH | 1 day | Meeting data queries |
| **Inline Action Item Form** | 🟡 MEDIUM | 1 day | Action items API |
| **Approval Actions UI** | 🔴 HIGH | 1 day | Workflow hooks |
| **Request Revision Modal** | 🔴 HIGH | 0.5 day | Form validation |
| **Publish Minutes Modal** | 🟡 MEDIUM | 0.5 day | PDF generation (optional) |
| **PDF Generation** | 🟢 LOW | 2 days | Backend implementation |

---

## 🎯 Implementation Phases

### **Phase 1: Core Editor & Viewer** (Week 1)

#### **Step 1.1: Create MinutesViewer Component**
**File**: `src/components/common/Minutes/MinutesViewer.tsx`

**Purpose**: Display minutes in read-only mode with proper formatting

**Features**:
- Render HTML content safely (sanitize with DOMPurify)
- Display meeting metadata header
- Show vote results and resolutions
- Display action items section
- Show signatures (if approved/published)
- Download PDF button
- Print functionality
- Responsive layout

**Props Interface**:
```typescript
interface MinutesViewerProps {
  minutes: Minutes;
  meeting: Meeting;
  showActions?: boolean;
  showComments?: boolean;
  showSignatures?: boolean;
  onDownloadPDF?: () => void;
  onPrint?: () => void;
}
```

**Component Structure**:
```tsx
<Card>
  {/* Header Section */}
  <MinutesHeader minutes={minutes} meeting={meeting} />
  
  {/* Content Section */}
  <div className="minutes-content">
    {/* Sanitized HTML content */}
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  </div>
  
  {/* Signatures Section (if approved/published) */}
  {showSignatures && <MinutesSignaturePanel minutesId={minutes.id} />}
  
  {/* Actions Section */}
  {showActions && (
    <Space>
      <Button icon={<DownloadOutlined />} onClick={onDownloadPDF}>
        Download PDF
      </Button>
      <Button icon={<PrinterOutlined />} onClick={onPrint}>
        Print
      </Button>
    </Space>
  )}
</Card>
```

**Dependencies**:
- `dompurify` - HTML sanitization
- `react-to-print` - Print functionality (optional)

---

#### **Step 1.2: Create MinutesEditor Component**
**File**: `src/components/common/Minutes/MinutesEditor.tsx`

**Purpose**: Rich text editor for creating/editing minutes

**Features**:
- Rich text editing with TipTap
- Auto-save every 30 seconds
- Word count display
- Character count display
- Last saved indicator
- Formatting toolbar (bold, italic, headings, lists, tables)
- Insert action item button
- Insert resolution button
- Undo/Redo support
- Keyboard shortcuts

**Props Interface**:
```typescript
interface MinutesEditorProps {
  minutes: Minutes;
  meeting: Meeting;
  onSave: (content: string) => void;
  onSubmit?: () => void;
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds, default 30000
  readOnly?: boolean;
}
```

**Component Structure**:
```tsx
<Card>
  {/* Editor Toolbar */}
  <div className="editor-toolbar">
    <Space>
      {/* Formatting buttons */}
      <Button.Group>
        <Button icon={<BoldOutlined />} onClick={toggleBold} />
        <Button icon={<ItalicOutlined />} onClick={toggleItalic} />
        <Button icon={<UnderlineOutlined />} onClick={toggleUnderline} />
      </Button.Group>
      
      {/* Insert buttons */}
      <Button icon={<PlusOutlined />} onClick={insertActionItem}>
        Add Action Item
      </Button>
      
      {/* Status indicators */}
      <Text type="secondary">
        {isSaving ? 'Saving...' : `Last saved: ${lastSavedTime}`}
      </Text>
      <Text type="secondary">
        {wordCount} words
      </Text>
    </Space>
  </div>
  
  {/* TipTap Editor */}
  <EditorContent editor={editor} />
  
  {/* Action Buttons */}
  <Space style={{ marginTop: 16 }}>
    <Button onClick={handleSave}>Save Draft</Button>
    {onSubmit && (
      <Button type="primary" onClick={onSubmit}>
        Submit for Review
      </Button>
    )}
  </Space>
</Card>
```

**Dependencies**:
- `@tiptap/react` - Rich text editor
- `@tiptap/starter-kit` - Basic extensions
- `@tiptap/extension-table` - Table support
- `lodash.debounce` - Auto-save debouncing

**Auto-Save Implementation**:
```typescript
const debouncedSave = useMemo(
  () => debounce((content: string) => {
    onSave(content);
    setLastSavedTime(new Date());
  }, autoSaveInterval),
  [onSave, autoSaveInterval]
);

useEffect(() => {
  if (autoSave && editor) {
    const content = editor.getHTML();
    debouncedSave(content);
  }
}, [editor?.state.doc, autoSave, debouncedSave]);
```

---

### **Phase 2: Auto-Population & Templates** (Week 1-2)

#### **Step 2.1: Create Auto-Population Service**
**File**: `src/services/minutesAutoPopulation.ts`

**Purpose**: Generate initial minutes content from meeting data

**Main Function**:
```typescript
export function generateMinutesFromMeeting(
  meeting: Meeting,
  attendance: Participant[],
  agenda: AgendaItem[],
  votes: Vote[],
  resolutions: Resolution[],
  template?: MinutesTemplate
): string {
  // Generate HTML content based on template
}
```

**Template Structure**:
```html
<div class="minutes-document">
  <h1>{boardName} - Meeting Minutes</h1>
  
  <div class="meeting-details">
    <p><strong>Date:</strong> {date}</p>
    <p><strong>Time:</strong> {startTime} - {endTime}</p>
    <p><strong>Location:</strong> {location}</p>
    <p><strong>Meeting Type:</strong> {meetingType}</p>
  </div>

  <h2>1. Attendance</h2>
  <div class="attendance">
    <p><strong>Present:</strong></p>
    <ul>
      {presentMembers.map(m => <li>{m.name} - {m.role}</li>)}
    </ul>
    <p><strong>Apologies:</strong></p>
    <ul>
      {apologies.map(m => <li>{m.name}</li>)}
    </ul>
    <p><strong>Absent:</strong></p>
    <ul>
      {absent.map(m => <li>{m.name}</li>)}
    </ul>
    <p><strong>Quorum:</strong> {quorumStatus}</p>
  </div>

  <h2>2. Call to Order</h2>
  <p>The meeting was called to order at {startTime} by {chairman}.</p>

  <h2>3. Approval of Previous Minutes</h2>
  <p>[To be completed by secretary]</p>

  <h2>4. Matters Arising</h2>
  <p>[To be completed by secretary]</p>

  <h2>5. Agenda Items</h2>
  {agenda.map((item, index) => `
    <h3>5.${index + 1} ${item.title}</h3>
    <p><strong>Presenter:</strong> ${item.presenter}</p>
    <p><strong>Discussion:</strong> [To be completed]</p>
    <p><strong>Decision:</strong> [To be completed]</p>
  `)}

  <h2>6. Votes and Resolutions</h2>
  {votes.map(vote => `
    <div class="vote-result">
      <p><strong>Motion:</strong> ${vote.motion}</p>
      <p><strong>Result:</strong> ${vote.result} (${vote.yesCount} Yes, ${vote.noCount} No, ${vote.abstainCount} Abstain)</p>
    </div>
  `)}
  
  {resolutions.map(res => `
    <div class="resolution">
      <p><strong>${res.resolutionNumber}:</strong> ${res.title}</p>
      <p>${res.text}</p>
    </div>
  `)}

  <h2>7. Action Items</h2>
  <p>[Action items will be added as they are created]</p>

  <h2>8. Next Meeting</h2>
  <p><strong>Date:</strong> [To be determined]</p>
  <p><strong>Time:</strong> [To be determined]</p>

  <h2>9. Adjournment</h2>
  <p>There being no other business, the meeting was adjourned at {endTime}.</p>
  
  <div class="signatures">
    <p><strong>Minutes prepared by:</strong> {secretary}</p>
    <p><strong>Date:</strong> {currentDate}</p>
  </div>
</div>
```

**Helper Functions**:
```typescript
function formatAttendance(participants: Participant[]): {
  present: Participant[];
  apologies: Participant[];
  absent: Participant[];
} {
  // Group participants by attendance status
}

function formatVoteResults(votes: Vote[]): string {
  // Format vote results as HTML
}

function formatResolutions(resolutions: Resolution[]): string {
  // Format resolutions as HTML
}

function calculateQuorum(
  present: number,
  required: number
): { met: boolean; status: string } {
  // Calculate quorum status
}
```

---

#### **Step 2.2: Create Template Selector**
**File**: `src/components/common/Minutes/MinutesTemplateSelector.tsx`

**Purpose**: Let secretary choose a template when creating minutes

**Features**:
- List of available templates
- Template preview
- Board-specific templates
- Meeting type-specific templates

**Props Interface**:
```typescript
interface MinutesTemplateSelectorProps {
  boardId: string;
  meetingType: string;
  onSelect: (template: MinutesTemplate) => void;
  onCancel: () => void;
}
```

**Template Types**:
```typescript
interface MinutesTemplate {
  id: string;
  name: string;
  description: string;
  meetingTypes: string[]; // ['board', 'committee', 'agm', 'emergency']
  sections: TemplateSection[];
  preview: string; // HTML preview
}

interface TemplateSection {
  id: string;
  title: string;
  order: number;
  required: boolean;
  placeholder: string;
}
```

**Default Templates**:
1. **Standard Board Meeting**
   - All sections included
   - Formal structure
   
2. **Emergency Meeting**
   - Simplified structure
   - Focus on urgent matters
   
3. **Committee Meeting**
   - Committee-specific sections
   - Less formal
   
4. **Annual General Meeting (AGM)**
   - Annual reports section
   - Elections section
   - Financial statements
   
5. **Special Meeting**
   - Custom agenda focus
   - Flexible structure

---

### **Phase 3: Approval Workflow UI** (Week 2)

#### **Step 3.1: Create Approval Actions Component**
**File**: `src/components/common/Minutes/MinutesApprovalActions.tsx`

**Purpose**: Action buttons for minutes workflow

**Features**:
- Context-aware buttons based on status and role
- Confirmation modals for critical actions
- Loading states
- Success/error notifications

**Props Interface**:
```typescript
interface MinutesApprovalActionsProps {
  minutes: Minutes;
  meeting: Meeting;
  isSecretary: boolean;
  isChairman: boolean;
  isBoardMember: boolean;
  onSubmit?: () => void;
  onApprove?: () => void;
  onRequestRevision?: () => void;
  onPublish?: () => void;
  onDownloadPDF?: () => void;
}
```

**Button Logic**:
```typescript
// For Secretary - Draft Status
{isSecretary && minutes.status === 'draft' && (
  <>
    <Button onClick={onSubmit} type="primary">
      Submit for Review
    </Button>
    <Button onClick={handleSaveDraft}>
      Save Draft
    </Button>
  </>
)}

// For Chairman - Pending Review Status
{isChairman && minutes.status === 'pending_review' && (
  <>
    <Button onClick={onApprove} type="primary" icon={<CheckOutlined />}>
      Approve Minutes
    </Button>
    <Button onClick={onRequestRevision} danger icon={<CloseOutlined />}>
      Request Revision
    </Button>
  </>
)}

// For Secretary - Approved Status
{isSecretary && minutes.status === 'approved' && (
  <Button onClick={onPublish} type="primary" icon={<GlobalOutlined />}>
    Publish Minutes
  </Button>
)}

// For All - Published Status
{minutes.status === 'published' && (
  <>
    <Button onClick={onDownloadPDF} icon={<DownloadOutlined />}>
      Download PDF
    </Button>
    <Button onClick={handleExport} icon={<ExportOutlined />}>
      Export
    </Button>
  </>
)}
```

---

#### **Step 3.2: Create Request Revision Modal**
**File**: `src/components/common/Minutes/RequestRevisionModal.tsx`

**Purpose**: Chairman requests changes to minutes

**Features**:
- Revision reason (required)
- Specific sections to revise (optional)
- Deadline for revision
- Predefined reason templates

**Props Interface**:
```typescript
interface RequestRevisionModalProps {
  open: boolean;
  minutes: Minutes;
  onSubmit: (payload: RequestRevisionPayload) => void;
  onCancel: () => void;
  loading?: boolean;
}
```

**Form Structure**:
```tsx
<Modal
  title="Request Minutes Revision"
  open={open}
  onCancel={onCancel}
  footer={null}
>
  <Form onFinish={handleSubmit}>
    <Form.Item
      label="Reason for Revision"
      name="reason"
      rules={[{ required: true, message: 'Please provide a reason' }]}
    >
      <Select placeholder="Select a reason">
        <Option value="incorrect_vote_count">Incorrect vote count</Option>
        <Option value="missing_discussion">Missing discussion details</Option>
        <Option value="attendance_errors">Attendance errors</Option>
        <Option value="action_items_unclear">Action items need clarification</Option>
        <Option value="resolution_wording">Resolution wording needs adjustment</Option>
        <Option value="other">Other (specify below)</Option>
      </Select>
    </Form.Item>
    
    <Form.Item
      label="Additional Details"
      name="details"
      rules={[{ required: true, message: 'Please provide details' }]}
    >
      <TextArea
        rows={4}
        placeholder="Provide specific details about what needs to be revised..."
      />
    </Form.Item>
    
    <Form.Item
      label="Sections to Revise"
      name="sections"
    >
      <Select mode="multiple" placeholder="Select specific sections (optional)">
        <Option value="attendance">Attendance</Option>
        <Option value="agenda_items">Agenda Items</Option>
        <Option value="votes">Votes and Resolutions</Option>
        <Option value="action_items">Action Items</Option>
        <Option value="other">Other Sections</Option>
      </Select>
    </Form.Item>
    
    <Form.Item
      label="Revision Deadline"
      name="deadline"
    >
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>
    
    <Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          Request Revision
        </Button>
        <Button onClick={onCancel}>
          Cancel
        </Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>
```

---

#### **Step 3.3: Create Publish Minutes Modal**
**File**: `src/components/common/Minutes/PublishMinutesModal.tsx`

**Purpose**: Configure publishing options

**Features**:
- Generate PDF checkbox
- Include digital signature checkbox
- Distribution list selection
- Email notification checkbox
- Preview before publish

**Props Interface**:
```typescript
interface PublishMinutesModalProps {
  open: boolean;
  minutes: Minutes;
  meeting: Meeting;
  onPublish: (payload: PublishMinutesPayload) => void;
  onCancel: () => void;
  loading?: boolean;
}
```

**Form Structure**:
```tsx
<Modal
  title="Publish Minutes"
  open={open}
  onCancel={onCancel}
  width={600}
  footer={null}
>
  <Form onFinish={handlePublish} initialValues={{
    generatePdf: true,
    includeSignature: true,
    sendNotification: true,
  }}>
    <Alert
      message="Publishing Minutes"
      description="Once published, these minutes will become the official record and cannot be edited."
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
    />
    
    <Form.Item
      name="generatePdf"
      valuePropName="checked"
    >
      <Checkbox>Generate PDF version</Checkbox>
    </Form.Item>
    
    <Form.Item
      name="includeSignature"
      valuePropName="checked"
    >
      <Checkbox>Include digital signature</Checkbox>
    </Form.Item>
    
    <Form.Item
      name="sendNotification"
      valuePropName="checked"
    >
      <Checkbox>Send email notification to all participants</Checkbox>
    </Form.Item>
    
    <Form.Item
      label="Distribution List"
      name="recipients"
    >
      <Select
        mode="multiple"
        placeholder="Select recipients (default: all participants)"
      >
        {participants.map(p => (
          <Option key={p.id} value={p.id}>
            {p.name} - {p.role}
          </Option>
        ))}
      </Select>
    </Form.Item>
    
    <Divider />
    
    <Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          Publish Minutes
        </Button>
        <Button onClick={handlePreview}>
          Preview
        </Button>
        <Button onClick={onCancel}>
          Cancel
        </Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>
```

---

### **Phase 4: Action Items Integration** (Week 2)

#### **Step 4.1: Create Inline Action Item Form**
**File**: `src/components/common/Minutes/InlineActionItemForm.tsx`

**Purpose**: Add action items while writing minutes

**Features**:
- Quick add form (modal or drawer)
- Auto-link to current agenda item
- Insert formatted text into minutes
- Create action item record

**Props Interface**:
```typescript
interface InlineActionItemFormProps {
  open: boolean;
  meetingId: string;
  minutesId: string;
  agendaItems: AgendaItem[];
  currentAgendaItemId?: string;
  onSubmit: (actionItem: ActionItem) => void;
  onCancel: () => void;
  onInsertToMinutes?: (formattedText: string) => void;
}
```

**Form Structure**:
```tsx
<Modal
  title="Add Action Item"
  open={open}
  onCancel={onCancel}
  footer={null}
>
  <Form onFinish={handleSubmit}>
    <Form.Item
      label="Description"
      name="description"
      rules={[{ required: true, message: 'Please provide a description' }]}
    >
      <TextArea
        rows={3}
        placeholder="Describe the action item..."
      />
    </Form.Item>
    
    <Form.Item
      label="Assigned To"
      name="assignedTo"
      rules={[{ required: true, message: 'Please assign to someone' }]}
    >
      <Select
        showSearch
        placeholder="Select a board member"
        filterOption={(input, option) =>
          option?.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {boardMembers.map(member => (
          <Option key={member.id} value={member.id}>
            {member.name} - {member.role}
          </Option>
        ))}
      </Select>
    </Form.Item>
    
    <Form.Item
      label="Due Date"
      name="dueDate"
      rules={[{ required: true, message: 'Please set a due date' }]}
    >
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>
    
    <Form.Item
      label="Priority"
      name="priority"
      initialValue="medium"
    >
      <Select>
        <Option value="low">Low</Option>
        <Option value="medium">Medium</Option>
        <Option value="high">High</Option>
      </Select>
    </Form.Item>
    
    <Form.Item
      label="Related Agenda Item"
      name="agendaItemId"
      initialValue={currentAgendaItemId}
    >
      <Select placeholder="Link to agenda item (optional)">
        {agendaItems.map(item => (
          <Option key={item.id} value={item.id}>
            {item.title}
          </Option>
        ))}
      </Select>
    </Form.Item>
    
    <Form.Item>
      <Checkbox checked={insertToMinutes} onChange={e => setInsertToMinutes(e.target.checked)}>
        Insert into minutes content
      </Checkbox>
    </Form.Item>
    
    <Form.Item>
      <Space>
        <Button type="primary" htmlType="submit">
          Add Action Item
        </Button>
        <Button onClick={onCancel}>
          Cancel
        </Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>
```

**Formatted Text Generation**:
```typescript
function formatActionItemForMinutes(actionItem: ActionItem): string {
  return `
    <div class="action-item">
      <p><strong>ACTION:</strong> ${actionItem.description}</p>
      <p><strong>Assigned to:</strong> ${actionItem.assignedToName}</p>
      <p><strong>Due:</strong> ${formatDate(actionItem.dueDate)}</p>
      <p><strong>Priority:</strong> ${actionItem.priority}</p>
    </div>
  `;
}
```

---

### **Phase 5: Integration with MeetingMinutesTab** (Week 2-3)

#### **Step 5.1: Update MeetingMinutesTab Component**
**File**: `src/pages/Meetings/tabs/MeetingMinutesTab.tsx`

**Changes Required**:

1. **Import New Components**:
```typescript
import { MinutesEditor } from '../../../components/common/Minutes/MinutesEditor';
import { MinutesViewer } from '../../../components/common/Minutes/MinutesViewer';
import { MinutesApprovalActions } from '../../../components/common/Minutes/MinutesApprovalActions';
import { MinutesTemplateSelector } from '../../../components/common/Minutes/MinutesTemplateSelector';
import { RequestRevisionModal } from '../../../components/common/Minutes/RequestRevisionModal';
import { PublishMinutesModal } from '../../../components/common/Minutes/PublishMinutesModal';
import { InlineActionItemForm } from '../../../components/common/Minutes/InlineActionItemForm';
```

2. **Add State Management**:
```typescript
const [showTemplateSelector, setShowTemplateSelector] = useState(false);
const [showRevisionModal, setShowRevisionModal] = useState(false);
const [showPublishModal, setShowPublishModal] = useState(false);
const [showActionItemForm, setShowActionItemForm] = useState(false);
```

3. **Add Mutation Hooks**:
```typescript
const updateMinutesMutation = useUpdateMinutes(minutes?.id, meeting.id);
const submitMinutesMutation = useSubmitMinutes(minutes?.id, meeting.id);
const approveMinutesMutation = useApproveMinutes(minutes?.id, meeting.id);
const requestRevisionMutation = useRequestRevision(minutes?.id, meeting.id);
const publishMinutesMutation = usePublishMinutes(minutes?.id, meeting.id);
```

4. **Add Handler Functions**:
```typescript
const handleSave = (content: string) => {
  updateMinutesMutation.mutate({ content });
};

const handleSubmitForReview = () => {
  submitMinutesMutation.mutate({ reviewDeadline: addDays(new Date(), 3) });
};

const handleApprove = () => {
  approveMinutesMutation.mutate({ approvalNotes: 'Approved as presented' });
};

const handleRequestRevision = (payload: RequestRevisionPayload) => {
  requestRevisionMutation.mutate(payload);
  setShowRevisionModal(false);
};

const handlePublish = (payload: PublishMinutesPayload) => {
  publishMinutesMutation.mutate(payload);
  setShowPublishModal(false);
};
```

5. **Replace Placeholder Content** (Lines 334-353):
```typescript
{/* Replace placeholder with actual components */}
<Space direction="vertical" size={16} style={{ width: '100%' }}>
  {/* Workflow Timeline */}
  <MinutesWorkflowTimeline minutes={minutes} />
  
  {/* Editor or Viewer */}
  {minutes.status === 'draft' && canEditMinutes ? (
    <MinutesEditor
      minutes={minutes}
      meeting={meeting}
      onSave={handleSave}
      onSubmit={handleSubmitForReview}
      autoSave={true}
    />
  ) : (
    <MinutesViewer
      minutes={minutes}
      meeting={meeting}
      showActions={true}
      showSignatures={minutes.status === 'approved' || minutes.status === 'published'}
      onDownloadPDF={handleDownloadPDF}
      onPrint={handlePrint}
    />
  )}
  
  {/* Comment Panel (for pending review) */}
  {minutes.status === 'pending_review' && minutes.allowComments && (
    <MinutesCommentPanel
      minutesId={minutes.id}
      comments={comments}
      allowComments={true}
      onAddComment={handleAddComment}
      onResolveComment={handleResolveComment}
      onDeleteComment={handleDeleteComment}
      currentUserId={user.id}
      isSecretary={isSecretary}
    />
  )}
  
  {/* Approval Actions */}
  <MinutesApprovalActions
    minutes={minutes}
    meeting={meeting}
    isSecretary={isSecretary}
    isChairman={isChairman}
    isBoardMember={isBoardMember}
    onSubmit={handleSubmitForReview}
    onApprove={handleApprove}
    onRequestRevision={() => setShowRevisionModal(true)}
    onPublish={() => setShowPublishModal(true)}
    onDownloadPDF={handleDownloadPDF}
  />
</Space>

{/* Modals */}
<RequestRevisionModal
  open={showRevisionModal}
  minutes={minutes}
  onSubmit={handleRequestRevision}
  onCancel={() => setShowRevisionModal(false)}
  loading={requestRevisionMutation.isPending}
/>

<PublishMinutesModal
  open={showPublishModal}
  minutes={minutes}
  meeting={meeting}
  onPublish={handlePublish}
  onCancel={() => setShowPublishModal(false)}
  loading={publishMinutesMutation.isPending}
/>
```

6. **Update Create Minutes Flow** (Lines 237-265):
```typescript
{canCreateMinutes ? (
  <Space direction="vertical" size={8}>
    <Button
      type="primary"
      size="large"
      icon={<PlusOutlined />}
      onClick={() => setShowTemplateSelector(true)}
      style={{ backgroundColor: themeColor, borderColor: themeColor }}
    >
      Create Minutes
    </Button>
    <Text type="secondary" style={{ fontSize: '12px' }}>
      Select a template and auto-populate with meeting details
    </Text>
  </Space>
) : (
  <Alert
    message="Waiting for Secretary"
    description="The board secretary will create the minutes for this meeting."
    type="info"
    showIcon
  />
)}

{/* Template Selector Modal */}
<MinutesTemplateSelector
  open={showTemplateSelector}
  boardId={meeting.boardId}
  meetingType={meeting.meetingType}
  onSelect={handleTemplateSelect}
  onCancel={() => setShowTemplateSelector(false)}
/>
```

---

### **Phase 6: Enhanced Features** (Week 3)

#### **Step 6.1: Signature Panel Integration**
- Display signatures for approved/published minutes
- Show verification status
- Digital signature capture (if available)
- Signature history

#### **Step 6.2: Version History**
**File**: `src/components/common/Minutes/MinutesVersionHistory.tsx`

**Features**:
- List all versions
- Show changes between versions
- Restore previous version (if in draft)
- Version comparison view

#### **Step 6.3: Search & Filter**
**File**: `src/components/common/Minutes/MinutesSearch.tsx`

**Features**:
- Full-text search within minutes
- Filter by status, board, date range
- Advanced search (by author, keyword, etc.)
- Export search results

---

### **Phase 7: PDF Generation** (Week 4 - Optional)

#### **Step 7.1: Client-Side PDF Generation**
**Library**: `jsPDF` + `html2canvas`

**Features**:
- Convert HTML to PDF
- Include board branding
- Add signatures
- Page numbers and headers
- Watermark for draft versions

**Alternative**: Backend PDF generation (ASP.NET Core)
- Better formatting control
- Include digital signatures
- Server-side storage
- Consistent across browsers

---

## 📦 Dependencies to Install

### **Required**
```json
{
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "@tiptap/extension-table": "^2.1.0",
  "@tiptap/extension-table-row": "^2.1.0",
  "@tiptap/extension-table-cell": "^2.1.0",
  "@tiptap/extension-table-header": "^2.1.0",
  "dompurify": "^3.0.0",
  "@types/dompurify": "^3.0.0",
  "lodash.debounce": "^4.0.8",
  "@types/lodash.debounce": "^4.0.7"
}
```

### **Optional**
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "react-to-print": "^2.14.0"
}
```

---

## 🧪 Testing Strategy

### **Unit Tests**
- Auto-population service
- Template generation
- HTML sanitization
- Word count calculation

### **Integration Tests**
- Create minutes flow
- Submit for review flow
- Approval flow
- Publish flow
- Comment system

### **E2E Tests**
- Full minutes lifecycle (draft → published)
- Revision request flow
- Multi-user collaboration
- Permission enforcement

---

## 📊 Implementation Timeline

### **Week 1: Core Functionality**
- ✅ Day 1: MinutesViewer component
- ✅ Day 2-3: MinutesEditor component (with TipTap)
- ✅ Day 4: Auto-population service
- ✅ Day 5: Template selector

### **Week 2: Workflow & Actions**
- ✅ Day 1: Approval actions component
- ✅ Day 2: Request revision modal
- ✅ Day 3: Publish modal
- ✅ Day 4: Inline action item form
- ✅ Day 5: Integration with MeetingMinutesTab

### **Week 3: Polish & Testing**
- ✅ Day 1-2: Comment panel integration
- ✅ Day 3: Signature panel integration
- ✅ Day 4: Testing all workflows
- ✅ Day 5: Bug fixes and refinements

### **Week 4: Advanced Features** (Optional)
- ⏳ Day 1-2: PDF generation
- ⏳ Day 3: Version history
- ⏳ Day 4: Advanced search
- ⏳ Day 5: Performance optimization

---

## ✅ Success Criteria

1. ✅ Secretary can create minutes from template
2. ✅ Auto-population works correctly with meeting data
3. ✅ Rich text editing is smooth and intuitive
4. ✅ Auto-save prevents data loss
5. ✅ Chairman can approve/reject minutes
6. ✅ Comment system enables collaboration
7. ✅ Published minutes are read-only and permanent
8. ✅ PDF generation works (if implemented)
9. ✅ All workflows tested with mock data
10. ✅ Performance is acceptable (< 2s load time)

---

## 🚀 Next Steps

1. **Install Dependencies**: Add TipTap and DOMPurify to package.json
2. **Create MinutesViewer**: Start with read-only display
3. **Create MinutesEditor**: Implement rich text editing
4. **Build Auto-Population**: Generate initial content
5. **Add Workflow UI**: Approval actions and modals
6. **Integrate Components**: Update MeetingMinutesTab
7. **Test End-to-End**: Verify all workflows
8. **Polish & Optimize**: Refine UX and performance

---

## 📝 Notes

- **Rich Text Editor Choice**: TipTap is recommended for its React-friendly API, extensibility, and TypeScript support
- **Auto-Save Strategy**: Debounce at 30 seconds, store in localStorage as backup
- **PDF Generation**: Consider backend generation for better quality and digital signatures
- **Mobile Support**: Editor may be read-only on mobile, optimized for tablet editing
- **Offline Support**: Auto-save to localStorage, sync when online
- **Performance**: Lazy load editor, virtualize long documents

---

## 🔗 Related Documents

- `08_OVERVIEW.md` - Module overview and requirements
- `08_USERFLOWS.md` - Detailed user flows
- `0307_PRE_POST_MEETING_IMPLEMENTATION.md` - Pre/post meeting architecture
- `0304_USERFLOWS_POSTMEETING.md` - Post-meeting workflows

---

**Last Updated**: February 9, 2026  
**Status**: Ready for Implementation  
**Next Review**: After Phase 1 completion
