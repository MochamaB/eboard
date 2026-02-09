/**
 * Minutes Table (Mock Data)
 * Meeting minutes records with workflow status tracking
 */

export type MinutesStatus = 'draft' | 'pending_review' | 'revision_requested' | 'approved' | 'published';

export interface MinutesRow {
  id: string;
  meetingId: string;

  // Content
  content: string;
  contentPlainText: string;

  // Template used (optional)
  templateId: string | null;

  // Status
  status: MinutesStatus;

  // Workflow tracking - Creation
  createdBy: number;
  createdAt: string;
  updatedAt: string;

  // Workflow tracking - Submission
  submittedAt: string | null;
  submittedBy: number | null;

  // Workflow tracking - Approval
  approvedAt: string | null;
  approvedBy: number | null;
  approvalNotes: string | null;

  // Workflow tracking - Revision
  revisionRequestedAt: string | null;
  revisionRequestedBy: number | null;
  revisionReason: string | null;

  // Workflow tracking - Publishing
  publishedAt: string | null;
  publishedBy: number | null;

  // Version tracking
  version: number;

  // Generated assets
  pdfUrl: string | null;

  // Settings
  allowComments: boolean;
  reviewDeadline: string | null;

  // Metadata
  wordCount: number;
  estimatedReadTime: number;
}

export const minutesTable: MinutesRow[] = [
  // ========================================================================
  // MTG-008: Chai Trading Board - Q4 2025 Review (PUBLISHED)
  // ========================================================================
  {
    id: 'minutes-mtg008-001',
    meetingId: 'MTG-008',
    content: `<div class="minutes-document">
<h1>Chai Trading Board - Q4 2025 Review</h1>

<h2>1. Attendance</h2>
<p><strong>Present:</strong></p>
<ul>
<li>Mathews Odiero - Chairman</li>
<li>Isaac Chege - Board Secretary</li>
<li>Hon. James Githinji - Board Member</li>
</ul>
<p><strong>Quorum:</strong> Met (3 of 4 voting members present)</p>

<h2>2. Call to Order</h2>
<p>The meeting was called to order at 10:00 AM by the Chairman, Mathews Odiero.</p>

<h2>3. Approval of Previous Minutes</h2>
<p>The minutes of the Q3 2025 board meeting were reviewed and discussed.</p>
<p><strong>Resolution:</strong> RESOLVED that the minutes of the Q3 2025 board meeting be and are hereby approved as presented.</p>
<p><strong>Vote:</strong> 3 Yes, 0 No, 0 Abstain - PASSED</p>

<h2>4. Sales Performance Review</h2>
<p>The Sales Manager presented Q4 2025 sales performance, highlighting a 15% increase in domestic sales and strong export performance in the East African region.</p>

<h2>5. Export Market Strategy</h2>
<p>The Chairman presented the proposed East African market expansion strategy, focusing on Tanzania and Uganda markets with a projected budget of KES 12M.</p>
<p>After detailed discussion, the board unanimously supported the strategy.</p>
<p><strong>Resolution:</strong> RESOLVED that the proposed East African market expansion strategy with a budget allocation of KES 12M be and is hereby approved.</p>
<p><strong>Vote:</strong> 3 Yes, 0 No, 0 Abstain - PASSED</p>

<h2>6. Action Items</h2>
<ul>
<li>Prepare detailed market analysis for Tanzania and Uganda markets - Sales Manager - Due: February 15, 2025</li>
<li>Circulate approved export strategy document to all department heads - Board Secretary - Due: February 1, 2025</li>
<li>Schedule follow-up meeting with finance team for budget allocation - Chairman - Due: February 10, 2025</li>
</ul>

<h2>7. Adjournment</h2>
<p>There being no other business, the meeting was adjourned at 12:00 PM.</p>

<p><strong>Minutes prepared by:</strong> Isaac Chege, Board Secretary</p>
<p><strong>Date:</strong> October 15, 2025</p>
</div>`,
    contentPlainText: 'Chai Trading Board - Q4 2025 Review. Attendance: Present: Mathews Odiero - Chairman, Isaac Chege - Board Secretary, Hon. James Githinji - Board Member. Quorum: Met (3 of 4 voting members present). Call to Order: The meeting was called to order at 10:00 AM by the Chairman. Approval of Previous Minutes: The minutes of the Q3 2025 board meeting were reviewed and approved unanimously. Sales Performance Review: Q4 2025 sales showed 15% increase in domestic sales. Export Market Strategy: Proposed East African expansion strategy with KES 12M budget approved unanimously. Action Items assigned. Meeting adjourned at 12:00 PM.',
    templateId: 'template-standard-minutes',
    status: 'published',
    createdBy: 18,
    createdAt: '2025-10-15T14:00:00Z',
    updatedAt: '2025-10-17T10:00:00Z',
    submittedAt: '2025-10-16T09:00:00Z',
    submittedBy: 18,
    approvedAt: '2025-10-16T15:00:00Z',
    approvedBy: 3,
    approvalNotes: 'Approved as presented. Excellent work on capturing all key decisions.',
    revisionRequestedAt: null,
    revisionRequestedBy: null,
    revisionReason: null,
    publishedAt: '2025-10-17T10:00:00Z',
    publishedBy: 18,
    version: 3,
    pdfUrl: '/mock-documents/minutes-mtg008-001.pdf',
    allowComments: false,
    reviewDeadline: null,
    wordCount: 2450,
    estimatedReadTime: 10,
  },

  // ========================================================================
  // MTG-002: Emergency Strategy Meeting (DRAFT)
  // ========================================================================
  {
    id: 'minutes-mtg002-001',
    meetingId: 'MTG-002',
    content: `<div class="minutes-document">
<h1>KTDA Management Services - Emergency Board Meeting Minutes</h1>
<p><strong>Date:</strong> January 15, 2026</p>
<p><strong>Time:</strong> 2:00 PM - 4:05 PM</p>
<p><strong>Location:</strong> Virtual Meeting (Jitsi)</p>

<h2>1. Attendance</h2>
<p><strong>Present:</strong></p>
<ul>
<li>Hon. Chege Kirundi - Chairman</li>
<li>Kenneth Muhia - Company Secretary</li>
<li>6 Board Members (names to be confirmed)</li>
</ul>
<p><strong>Quorum:</strong> Met (7 voting members present)</p>

<h2>2. Call to Order - Emergency Declaration</h2>
<p>The Chairman called the emergency meeting to order at 2:00 PM, citing urgent market conditions requiring immediate board attention.</p>

<h2>3. Market Conditions Analysis</h2>
<p>The Finance Director presented analysis of recent global tea price fluctuations and their impact on KTDA operations. Key concerns included...</p>
<p>[DRAFT NOTE: Need to add specific figures and detailed analysis from presentation]</p>

<h2>4. Strategic Response Plan</h2>
<p>Extended discussion on proposed response measures including market stabilization, communication strategy, and stakeholder engagement.</p>
<p>[DRAFT NOTE: Need to expand on discussion points and member contributions]</p>

<h2>5. Communications Strategy (Ad-Hoc Item)</h2>
<p>Added during meeting by Chairman. Discussion on external communications approach.</p>
<p>[DRAFT NOTE: To be completed]</p>

<h2>6. Approval of Immediate Actions</h2>
<p><strong>Resolution:</strong> RESOLVED that the emergency response actions including market stabilization measures and communication plan be and are hereby approved for immediate implementation.</p>
<p><strong>Vote:</strong> 6 Yes, 0 No, 1 Abstain - PASSED</p>

<h2>7. Action Items</h2>
<ul>
<li>Implement market stabilization measures - CEO - Due: January 18, 2026 - URGENT</li>
<li>Prepare external communication statement - Communications Director - Due: January 16, 2026 - URGENT</li>
<li>Convene stakeholder briefing session - Chairman - Due: January 20, 2026</li>
<li>Monitor daily market indicators and report - Finance Director - Due: January 30, 2026</li>
</ul>

<h2>8. Adjournment</h2>
<p>Meeting adjourned at 4:05 PM.</p>

<p><strong>Minutes prepared by:</strong> Kenneth Muhia, Company Secretary</p>
<p><strong>Status:</strong> DRAFT - In Progress</p>
</div>`,
    contentPlainText: 'KTDA Management Services - Emergency Board Meeting Minutes. Date: January 15, 2026. Time: 2:00 PM - 4:05 PM. Virtual Meeting. Emergency meeting convened to address sudden drop in global tea prices. Comprehensive response plan discussed and approved. Vote: 6 Yes, 0 No, 1 Abstain. Four urgent action items assigned. Meeting adjourned at 4:05 PM. DRAFT STATUS.',
    templateId: 'template-emergency-minutes',
    status: 'draft',
    createdBy: 17,
    createdAt: '2026-01-15T18:00:00Z',
    updatedAt: '2026-01-16T11:30:00Z',
    submittedAt: null,
    submittedBy: null,
    approvedAt: null,
    approvedBy: null,
    approvalNotes: null,
    revisionRequestedAt: null,
    revisionRequestedBy: null,
    revisionReason: null,
    publishedAt: null,
    publishedBy: null,
    version: 1,
    pdfUrl: null,
    allowComments: true,
    reviewDeadline: null,
    wordCount: 1200,
    estimatedReadTime: 5,
  },

  // ========================================================================
  // MTG-006: Finance Committee - January 2026 (APPROVED)
  // ========================================================================
  {
    id: 'minutes-mtg006-001',
    meetingId: 'MTG-006',
    content: `<div class="minutes-document">
<h1>Finance Committee - Meeting Minutes</h1>
<p><strong>Date:</strong> January 8, 2026</p>
<p><strong>Time:</strong> 9:00 AM - 11:00 AM</p>
<p><strong>Location:</strong> Virtual Meeting</p>

<h2>1. Attendance</h2>
<p><strong>Present:</strong></p>
<ul>
<li>Hon. G.G Kagombe - Committee Chair</li>
<li>Hon. P Langat - Committee Member</li>
<li>Hon. J Mutai - Committee Member</li>
<li>Isaac Chege - Board Secretary</li>
</ul>
<p><strong>Quorum:</strong> Met (3 of 3 voting members present)</p>

<h2>2. Call to Order</h2>
<p>The Committee Chair called the meeting to order at 9:00 AM.</p>

<h2>3. December 2025 Financial Review</h2>
<p>The CFO presented the December 2025 financial statements, highlighting strong revenue performance and controlled operational expenses. Year-end results exceeded budget projections by 8%.</p>

<h2>4. Q1 2026 Investment Portfolio Review</h2>
<p>Detailed review of current investment portfolio performance. Discussion on rebalancing strategy to optimize returns while managing risk exposure.</p>
<p><strong>Resolution:</strong> RESOLVED by consensus that the investment portfolio be rebalanced as recommended by the CFO, with increased allocation to fixed income instruments.</p>

<h2>5. Budget Variance Analysis</h2>
<p>Analysis of Q4 2025 budget variances across departments. Committee noted excellent cost control in operations department.</p>

<h2>6. Action Items</h2>
<ul>
<li>Review Q1 investment portfolio performance - CFO - Due: February 1, 2026</li>
<li>Prepare detailed variance report for board presentation - Finance Manager - Due: February 5, 2026</li>
</ul>

<h2>7. Next Meeting</h2>
<p>Next committee meeting scheduled for February 12, 2026.</p>

<h2>8. Adjournment</h2>
<p>Meeting adjourned at 11:00 AM.</p>

<p><strong>Minutes prepared by:</strong> Isaac Chege, Board Secretary</p>
</div>`,
    contentPlainText: 'Finance Committee Meeting Minutes. January 8, 2026. 9:00 AM - 11:00 AM. Virtual Meeting. Attendance: Committee Chair, 2 members, Secretary. Quorum met. December 2025 financial review showed strong performance, 8% above budget. Investment portfolio rebalancing approved by consensus. Budget variance analysis completed. Two action items assigned. Next meeting February 12, 2026. Adjourned 11:00 AM.',
    templateId: 'template-committee-minutes',
    status: 'approved',
    createdBy: 18,
    createdAt: '2026-01-08T14:00:00Z',
    updatedAt: '2026-01-09T16:00:00Z',
    submittedAt: '2026-01-09T10:00:00Z',
    submittedBy: 18,
    approvedAt: '2026-01-09T16:00:00Z',
    approvedBy: 4,
    approvalNotes: 'Approved. Ready for distribution to committee members and board.',
    revisionRequestedAt: null,
    revisionRequestedBy: null,
    revisionReason: null,
    publishedAt: null,
    publishedBy: null,
    version: 1,
    pdfUrl: null,
    allowComments: false,
    reviewDeadline: null,
    wordCount: 1800,
    estimatedReadTime: 7,
  },

  // ========================================================================
  // MTG-010: Chai Trading Board - January 2025 (PENDING REVIEW)
  // ========================================================================
  {
    id: 'minutes-mtg010-001',
    meetingId: 'MTG-010',
    content: `<div class="minutes-document">
<h1>Chai Trading Co. Ltd - Board Meeting Minutes</h1>
<p><strong>Date:</strong> January 22, 2025</p>
<p><strong>Time:</strong> 10:00 AM - 12:00 PM</p>
<p><strong>Location:</strong> Virtual Meeting</p>

<h2>1. Attendance</h2>
<p><strong>Present:</strong></p>
<ul>
<li>Hon. W Korir - Chairman</li>
<li>Hon. M Kiprop - Board Member</li>
<li>Hon. J Mutai - Board Member</li>
<li>Jane Njeri - Board Secretary</li>
</ul>
<p><strong>Quorum:</strong> Met (3 of 3 voting members present)</p>

<h2>2. Call to Order</h2>
<p>The Chairman called the meeting to order at 10:00 AM.</p>

<h2>3. Q4 2024 Export Performance</h2>
<p>The Export Manager presented Q4 2024 export performance data. Total export volume reached 2.5 million kg, representing a 12% increase over Q3 2024. Key markets included Pakistan, Egypt, and UK.</p>

<h2>4. Export Contract Terms Review</h2>
<p>Discussion on revised export contract terms for Q1 2025, including pricing structures, payment terms, and quality specifications. Board members expressed satisfaction with proposed terms.</p>
<p><strong>Resolution:</strong> RESOLVED that the revised export contract terms for Q1 2025 be and are hereby approved for implementation.</p>
<p><strong>Decision:</strong> Unanimous approval</p>

<h2>5. Market Development Strategy</h2>
<p>Presentation on market development opportunities in Middle East and North African regions. Board discussed resource allocation and timeline for market entry.</p>

<h2>6. Action Items</h2>
<ul>
<li>Finalize Q1 export contracts with approved terms - Export Manager - Due: February 5, 2025</li>
<li>Prepare market entry feasibility study for MENA region - Business Development - Due: March 1, 2025</li>
<li>Schedule stakeholder meeting with key buyers - Chairman - Due: February 15, 2025</li>
</ul>

<h2>7. Next Meeting</h2>
<p>Next board meeting scheduled for February 22, 2025.</p>

<h2>8. Adjournment</h2>
<p>Meeting adjourned at 11:45 AM.</p>

<p><strong>Minutes prepared by:</strong> Jane Njeri, Board Secretary</p>
<p><strong>Submitted for review:</strong> January 23, 2025</p>
</div>`,
    contentPlainText: 'Chai Trading Co. Ltd Board Meeting Minutes. January 22, 2025. 10:00 AM - 12:00 PM. Virtual Meeting. Attendance: Chairman, 2 board members, Secretary. Quorum met. Q4 2024 export performance: 2.5M kg, 12% increase. Export contract terms for Q1 2025 approved unanimously. Market development strategy for MENA region discussed. Three action items assigned. Next meeting February 22, 2025. Adjourned 11:45 AM.',
    templateId: 'template-standard-minutes',
    status: 'pending_review',
    createdBy: 19,
    createdAt: '2025-01-22T16:00:00Z',
    updatedAt: '2025-01-23T09:00:00Z',
    submittedAt: '2025-01-23T09:00:00Z',
    submittedBy: 19,
    approvedAt: null,
    approvedBy: null,
    approvalNotes: null,
    revisionRequestedAt: null,
    revisionRequestedBy: null,
    revisionReason: null,
    publishedAt: null,
    publishedBy: null,
    version: 1,
    pdfUrl: null,
    allowComments: true,
    reviewDeadline: '2025-01-25T17:00:00Z',
    wordCount: 2100,
    estimatedReadTime: 8,
  },

  // ========================================================================
  // MTG-007: KTDA MS Board - January 2026 (DRAFT - completed.recent)
  // ========================================================================
  {
    id: 'minutes-mtg007-001',
    meetingId: 'MTG-007',
    content: `<div class="minutes-document">
<h1>KTDA Management Services - Board Meeting Minutes</h1>
<p><strong>Date:</strong> January 28, 2026</p>
<p><strong>Time:</strong> 9:00 AM - 12:30 PM</p>
<p><strong>Location:</strong> KTDA Head Office - Board Room</p>

<h2>1. Attendance</h2>
<p><strong>Present:</strong></p>
<ul>
<li>Hon. Chege Kirundi - Chairman</li>
<li>Kenneth Muhia - Company Secretary</li>
<li>Hon. James Githinji - Board Member</li>
<li>Hon. G.G Kagombe - Board Member</li>
<li>Hon. P Langat - Board Member</li>
<li>Hon. J Mutai - Board Member</li>
<li>Hon. W Korir - Board Member</li>
<li>Hon. M Kiprop - Board Member</li>
</ul>
<p><strong>Quorum:</strong> Met (8 of 11 voting members present)</p>

<h2>2. Call to Order</h2>
<p>The meeting was called to order at 9:00 AM by the Chairman, Hon. Chege Kirundi.</p>

<h2>3. Approval of Previous Minutes</h2>
<p>The minutes of the December 2025 board meeting were reviewed. After discussion, the board unanimously approved the minutes as presented.</p>
<p><strong>Resolution:</strong> RESOLVED that the minutes of the December 2025 board meeting be and are hereby approved.</p>
<p><strong>Vote:</strong> 8 Yes, 0 No, 0 Abstain - PASSED</p>

<h2>4. Q4 2025 Financial Performance Review</h2>
<p>The CFO presented a comprehensive review of Q4 2025 financial performance. Key highlights included:</p>
<ul>
<li>Total revenue: KES 2.8B (12% increase YoY)</li>
<li>Operating expenses: KES 1.9B (within budget)</li>
<li>Net profit: KES 650M (15% increase YoY)</li>
<li>Cash reserves: KES 1.2B (healthy liquidity position)</li>
</ul>
<p>The board commended management for the strong financial performance and prudent cost management.</p>

<h2>5. Q1 2026 Budget Approval</h2>
<p>The CFO presented the proposed Q1 2026 operational budget totaling KES 520M. The budget includes:</p>
<ul>
<li>Operational expenses: KES 380M</li>
<li>Capital expenditure: KES 100M (factory upgrades)</li>
<li>Marketing and development: KES 40M</li>
</ul>
<p>After detailed discussion and clarifications, the board approved the budget.</p>
<p><strong>Resolution:</strong> RESOLVED that the Q1 2026 Operational Budget totaling KES 520M be and is hereby approved for implementation.</p>
<p><strong>Vote:</strong> 7 Yes, 0 No, 1 Abstain - PASSED</p>

<h2>6. Market Review and Strategic Positioning</h2>
<p>The Marketing Director presented an analysis of current market trends and competitive positioning. Discussion focused on emerging opportunities in the East African market and strategies to maintain market leadership.</p>

<h2>7. Factory Expansion Proposal</h2>
<p>The Operations Manager presented a proposal for factory capacity expansion at the Kericho facility. The proposal includes:</p>
<ul>
<li>New processing line installation</li>
<li>Warehouse expansion (additional 5,000 sq meters)</li>
<li>Estimated cost: KES 85M</li>
<li>Expected completion: Q3 2026</li>
</ul>
<p>The board discussed the proposal extensively and requested additional feasibility studies.</p>

<h2>8. Action Items</h2>
<ul>
<li>Prepare detailed budget breakdown for Q1 capital expenditure - CFO - Due: February 15, 2026</li>
<li>Schedule factory site visits for board members - Operations Manager - Due: February 10, 2026</li>
<li>Draft new procurement policy for board review - Legal Department - Due: February 28, 2026</li>
</ul>

<h2>9. Any Other Business</h2>
<p>The Chairman reminded members of the upcoming AGM scheduled for March 2026. The Secretary was instructed to circulate the AGM preparation timeline.</p>

<h2>10. Next Meeting</h2>
<p>The next board meeting is scheduled for February 25, 2026, at 9:00 AM.</p>

<h2>11. Adjournment</h2>
<p>There being no other business, the meeting was adjourned at 12:30 PM.</p>

<p><strong>Minutes prepared by:</strong> Kenneth Muhia, Company Secretary</p>
<p><strong>Status:</strong> DRAFT - Pending Review</p>
<p><strong>Note:</strong> These minutes are in draft form and subject to approval at the next board meeting.</p>
</div>`,
    contentPlainText: 'KTDA Management Services - Board Meeting Minutes. Date: January 28, 2026. Time: 9:00 AM - 12:30 PM. Location: KTDA Head Office - Board Room. Attendance: Chairman, Secretary, and 6 board members present. Quorum met (8 of 11). Previous minutes approved unanimously. Q4 2025 financial performance reviewed - revenue KES 2.8B (12% increase), net profit KES 650M (15% increase). Q1 2026 operational budget of KES 520M approved (7 Yes, 1 Abstain). Market review and factory expansion proposal discussed. Three action items assigned with February deadlines. Next meeting scheduled for February 25, 2026. Meeting adjourned at 12:30 PM. DRAFT STATUS - pending review.',
    templateId: 'template-standard-minutes',
    status: 'draft',
    createdBy: 17,
    createdAt: '2026-01-28T13:30:00Z',
    updatedAt: '2026-01-29T10:15:00Z',
    submittedAt: null,
    submittedBy: null,
    approvedAt: null,
    approvedBy: null,
    approvalNotes: null,
    revisionRequestedAt: null,
    revisionRequestedBy: null,
    revisionReason: null,
    publishedAt: null,
    publishedBy: null,
    version: 1,
    pdfUrl: null,
    allowComments: true,
    reviewDeadline: null,
    wordCount: 3500,
    estimatedReadTime: 14,
  },
];
