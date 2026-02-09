/**
 * Minutes Templates Table - Database-like structure
 * Stores reusable minutes templates for different board and meeting types
 */

import type { BoardType, MeetingType } from '../../../types/minutes.types';

export interface MinutesTemplateSectionData {
  orderIndex: number;
  title: string;
  placeholder: string;
  required: boolean;
  autoPopulate: boolean; // Whether this section is auto-populated from meeting data
}

export interface MinutesTemplateRow {
  id: string;
  name: string;
  description: string | null;
  boardType: BoardType;
  meetingType: MeetingType;
  sections: string; // JSON array of MinutesTemplateSectionData
  htmlTemplate: string; // HTML structure with placeholders
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isGlobal: boolean;
}

// ============================================================================
// MINUTES TEMPLATES TABLE DATA
// ============================================================================

export const minutesTemplatesTable: MinutesTemplateRow[] = [
  // ========================================================================
  // GLOBAL TEMPLATES
  // ========================================================================
  {
    id: 'template-standard-minutes',
    name: 'Standard Board Meeting Minutes',
    description: 'Default template for regular board meeting minutes',
    boardType: 'all',
    meetingType: 'regular',
    sections: JSON.stringify([
      {
        orderIndex: 1,
        title: 'Meeting Details',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 2,
        title: 'Attendance',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 3,
        title: 'Call to Order',
        placeholder: 'The meeting was called to order at [time] by [chairman name].',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 4,
        title: 'Approval of Previous Minutes',
        placeholder: 'The minutes of the [previous meeting date] were reviewed and discussed.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 5,
        title: 'Matters Arising',
        placeholder: 'The following matters arising from the previous minutes were discussed:',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 6,
        title: 'Agenda Items',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 7,
        title: 'Votes and Resolutions',
        placeholder: '',
        required: false,
        autoPopulate: true,
      },
      {
        orderIndex: 8,
        title: 'Action Items',
        placeholder: 'The following action items were assigned:',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 9,
        title: 'Next Meeting',
        placeholder: 'The next meeting is scheduled for [date] at [time].',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 10,
        title: 'Adjournment',
        placeholder: 'There being no other business, the meeting was adjourned at [time].',
        required: true,
        autoPopulate: true,
      },
    ] as MinutesTemplateSectionData[]),
    htmlTemplate: `<div class="minutes-document">
<h1>{{boardName}} - Meeting Minutes</h1>

<div class="meeting-details">
<p><strong>Date:</strong> {{meetingDate}}</p>
<p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
<p><strong>Location:</strong> {{location}}</p>
<p><strong>Meeting Type:</strong> {{meetingType}}</p>
</div>

<h2>1. Attendance</h2>
<div class="attendance">
<p><strong>Present:</strong></p>
<ul>{{presentMembers}}</ul>
<p><strong>Apologies:</strong></p>
<ul>{{apologies}}</ul>
<p><strong>Absent:</strong></p>
<ul>{{absent}}</ul>
<p><strong>Quorum:</strong> {{quorumStatus}}</p>
</div>

<h2>2. Call to Order</h2>
<p>The meeting was called to order at {{startTime}} by {{chairman}}.</p>

<h2>3. Approval of Previous Minutes</h2>
<p>[To be completed by secretary]</p>

<h2>4. Matters Arising</h2>
<p>[To be completed by secretary]</p>

<h2>5. Agenda Items</h2>
{{agendaItems}}

<h2>6. Votes and Resolutions</h2>
{{votesAndResolutions}}

<h2>7. Action Items</h2>
<p>[Action items will be added as they are created]</p>

<h2>8. Next Meeting</h2>
<p><strong>Date:</strong> [To be determined]</p>
<p><strong>Time:</strong> [To be determined]</p>

<h2>9. Adjournment</h2>
<p>There being no other business, the meeting was adjourned at {{endTime}}.</p>

<div class="signatures">
<p><strong>Minutes prepared by:</strong> {{secretary}}</p>
<p><strong>Date:</strong> {{currentDate}}</p>
</div>
</div>`,
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },

  {
    id: 'template-emergency-minutes',
    name: 'Emergency Meeting Minutes',
    description: 'Streamlined template for emergency meeting minutes',
    boardType: 'all',
    meetingType: 'emergency',
    sections: JSON.stringify([
      {
        orderIndex: 1,
        title: 'Meeting Details',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 2,
        title: 'Attendance',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 3,
        title: 'Emergency Declaration',
        placeholder: 'Emergency meeting convened to address [situation].',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 4,
        title: 'Situation Analysis',
        placeholder: 'Detailed presentation of the emergency situation.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 5,
        title: 'Discussion',
        placeholder: 'Discussion of response options and proposed actions.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 6,
        title: 'Decisions and Actions',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 7,
        title: 'Adjournment',
        placeholder: 'Meeting adjourned at [time].',
        required: true,
        autoPopulate: true,
      },
    ] as MinutesTemplateSectionData[]),
    htmlTemplate: `<div class="minutes-document emergency">
<h1>{{boardName}} - Emergency Meeting Minutes</h1>

<div class="meeting-details">
<p><strong>Date:</strong> {{meetingDate}}</p>
<p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
<p><strong>Location:</strong> {{location}}</p>
<p><strong>Meeting Type:</strong> Emergency</p>
</div>

<h2>1. Attendance</h2>
<div class="attendance">
<p><strong>Present:</strong></p>
<ul>{{presentMembers}}</ul>
<p><strong>Quorum:</strong> {{quorumStatus}}</p>
</div>

<h2>2. Emergency Declaration</h2>
<p>[To be completed by secretary]</p>

<h2>3. Situation Analysis</h2>
<p>[To be completed by secretary]</p>

<h2>4. Discussion</h2>
<p>[To be completed by secretary]</p>

<h2>5. Decisions and Actions</h2>
{{votesAndResolutions}}

<h2>6. Adjournment</h2>
<p>Meeting adjourned at {{endTime}}.</p>

<div class="signatures">
<p><strong>Minutes prepared by:</strong> {{secretary}}</p>
<p><strong>Date:</strong> {{currentDate}}</p>
</div>
</div>`,
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },

  {
    id: 'template-agm-minutes',
    name: 'Annual General Meeting Minutes',
    description: 'Template for Annual General Meeting minutes',
    boardType: 'main',
    meetingType: 'agm',
    sections: JSON.stringify([
      {
        orderIndex: 1,
        title: 'Meeting Details',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 2,
        title: 'Attendance',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 3,
        title: 'Call to Order',
        placeholder: 'The Annual General Meeting was called to order.',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 4,
        title: 'Approval of Previous AGM Minutes',
        placeholder: 'The minutes of the previous AGM were reviewed.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 5,
        title: 'Chairman\'s Report',
        placeholder: 'The Chairman presented the annual report.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 6,
        title: 'Financial Statements',
        placeholder: 'The audited financial statements were presented.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 7,
        title: 'Auditor\'s Report',
        placeholder: 'The auditor\'s report was presented.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 8,
        title: 'Election of Directors',
        placeholder: 'Elections were conducted for board positions.',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 9,
        title: 'Appointment of Auditors',
        placeholder: 'Auditors for the coming year were appointed.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 10,
        title: 'Any Other Business',
        placeholder: 'Other matters were discussed.',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 11,
        title: 'Adjournment',
        placeholder: 'The AGM was adjourned.',
        required: true,
        autoPopulate: true,
      },
    ] as MinutesTemplateSectionData[]),
    htmlTemplate: `<div class="minutes-document agm">
<h1>{{boardName}} - Annual General Meeting Minutes</h1>

<div class="meeting-details">
<p><strong>Date:</strong> {{meetingDate}}</p>
<p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
<p><strong>Location:</strong> {{location}}</p>
<p><strong>Meeting Type:</strong> Annual General Meeting</p>
</div>

<h2>1. Attendance</h2>
<div class="attendance">
<p><strong>Present:</strong></p>
<ul>{{presentMembers}}</ul>
<p><strong>Apologies:</strong></p>
<ul>{{apologies}}</ul>
<p><strong>Quorum:</strong> {{quorumStatus}}</p>
</div>

<h2>2. Call to Order</h2>
<p>The Annual General Meeting was called to order at {{startTime}} by {{chairman}}.</p>

<h2>3. Approval of Previous AGM Minutes</h2>
<p>[To be completed by secretary]</p>

<h2>4. Chairman's Report</h2>
<p>[To be completed by secretary]</p>

<h2>5. Financial Statements</h2>
<p>[To be completed by secretary]</p>

<h2>6. Auditor's Report</h2>
<p>[To be completed by secretary]</p>

<h2>7. Election of Directors</h2>
<p>[To be completed by secretary]</p>

<h2>8. Appointment of Auditors</h2>
<p>[To be completed by secretary]</p>

<h2>9. Any Other Business</h2>
<p>[To be completed by secretary]</p>

<h2>10. Adjournment</h2>
<p>The AGM was adjourned at {{endTime}}.</p>

<div class="signatures">
<p><strong>Minutes prepared by:</strong> {{secretary}}</p>
<p><strong>Date:</strong> {{currentDate}}</p>
</div>
</div>`,
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },

  {
    id: 'template-committee-minutes',
    name: 'Committee Meeting Minutes',
    description: 'Template for committee meeting minutes',
    boardType: 'committee',
    meetingType: 'committee',
    sections: JSON.stringify([
      {
        orderIndex: 1,
        title: 'Meeting Details',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 2,
        title: 'Attendance',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 3,
        title: 'Call to Order',
        placeholder: 'The committee meeting was called to order.',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 4,
        title: 'Approval of Previous Minutes',
        placeholder: 'The minutes of the previous meeting were reviewed.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 5,
        title: 'Committee Business',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 6,
        title: 'Recommendations to Board',
        placeholder: 'The committee recommends the following to the board:',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 7,
        title: 'Next Meeting',
        placeholder: 'Next meeting scheduled for [date].',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 8,
        title: 'Adjournment',
        placeholder: 'Meeting adjourned.',
        required: true,
        autoPopulate: true,
      },
    ] as MinutesTemplateSectionData[]),
    htmlTemplate: `<div class="minutes-document committee">
<h1>{{boardName}} - {{committeeName}} Minutes</h1>

<div class="meeting-details">
<p><strong>Date:</strong> {{meetingDate}}</p>
<p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
<p><strong>Location:</strong> {{location}}</p>
<p><strong>Meeting Type:</strong> Committee Meeting</p>
</div>

<h2>1. Attendance</h2>
<div class="attendance">
<p><strong>Present:</strong></p>
<ul>{{presentMembers}}</ul>
<p><strong>Apologies:</strong></p>
<ul>{{apologies}}</ul>
<p><strong>Quorum:</strong> {{quorumStatus}}</p>
</div>

<h2>2. Call to Order</h2>
<p>The committee meeting was called to order at {{startTime}} by {{chairman}}.</p>

<h2>3. Approval of Previous Minutes</h2>
<p>[To be completed by secretary]</p>

<h2>4. Committee Business</h2>
{{agendaItems}}

<h2>5. Recommendations to Board</h2>
<p>[To be completed by secretary]</p>

<h2>6. Next Meeting</h2>
<p>[To be determined]</p>

<h2>7. Adjournment</h2>
<p>Meeting adjourned at {{endTime}}.</p>

<div class="signatures">
<p><strong>Minutes prepared by:</strong> {{secretary}}</p>
<p><strong>Date:</strong> {{currentDate}}</p>
</div>
</div>`,
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },

  {
    id: 'template-factory-minutes',
    name: 'Factory Board Meeting Minutes',
    description: 'Template for factory board meeting minutes',
    boardType: 'factory',
    meetingType: 'regular',
    sections: JSON.stringify([
      {
        orderIndex: 1,
        title: 'Meeting Details',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 2,
        title: 'Attendance',
        placeholder: '',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 3,
        title: 'Call to Order',
        placeholder: 'Meeting called to order.',
        required: true,
        autoPopulate: true,
      },
      {
        orderIndex: 4,
        title: 'Approval of Previous Minutes',
        placeholder: 'Previous minutes reviewed.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 5,
        title: 'Production Report',
        placeholder: 'Production statistics and quality metrics presented.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 6,
        title: 'Financial Report',
        placeholder: 'Factory financial performance reviewed.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 7,
        title: 'Operations Update',
        placeholder: 'Equipment status and operational issues discussed.',
        required: true,
        autoPopulate: false,
      },
      {
        orderIndex: 8,
        title: 'Farmer Relations',
        placeholder: 'Updates on farmer engagement and leaf supply.',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 9,
        title: 'Any Other Business',
        placeholder: 'Other matters discussed.',
        required: false,
        autoPopulate: false,
      },
      {
        orderIndex: 10,
        title: 'Adjournment',
        placeholder: 'Meeting adjourned.',
        required: true,
        autoPopulate: true,
      },
    ] as MinutesTemplateSectionData[]),
    htmlTemplate: `<div class="minutes-document factory">
<h1>{{boardName}} - Factory Board Minutes</h1>

<div class="meeting-details">
<p><strong>Date:</strong> {{meetingDate}}</p>
<p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
<p><strong>Location:</strong> {{location}}</p>
</div>

<h2>1. Attendance</h2>
<div class="attendance">
<p><strong>Present:</strong></p>
<ul>{{presentMembers}}</ul>
<p><strong>Apologies:</strong></p>
<ul>{{apologies}}</ul>
<p><strong>Quorum:</strong> {{quorumStatus}}</p>
</div>

<h2>2. Call to Order</h2>
<p>Meeting called to order at {{startTime}} by {{chairman}}.</p>

<h2>3. Approval of Previous Minutes</h2>
<p>[To be completed by secretary]</p>

<h2>4. Production Report</h2>
<p>[To be completed by secretary]</p>

<h2>5. Financial Report</h2>
<p>[To be completed by secretary]</p>

<h2>6. Operations Update</h2>
<p>[To be completed by secretary]</p>

<h2>7. Farmer Relations</h2>
<p>[To be completed by secretary]</p>

<h2>8. Any Other Business</h2>
<p>[To be completed by secretary]</p>

<h2>9. Adjournment</h2>
<p>Meeting adjourned at {{endTime}}.</p>

<div class="signatures">
<p><strong>Minutes prepared by:</strong> {{secretary}}</p>
<p><strong>Date:</strong> {{currentDate}}</p>
</div>
</div>`,
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    isGlobal: false,
  },
];
