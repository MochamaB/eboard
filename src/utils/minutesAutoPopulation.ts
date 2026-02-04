/**
 * Minutes Auto-Population Utilities
 * Functions for auto-populating minutes content from existing meeting data
 */

import type { AgendaItem } from '../types/agenda.types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface MeetingData {
  id: string;
  title: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  locationType: 'physical' | 'virtual' | 'hybrid';
  physicalLocation?: string | null;
  meetingLink?: string | null;
}

export interface ParticipantData {
  userId: number;
  userName: string;
  roleTitle: string;
  attendanceStatus: 'present' | 'absent' | 'apology' | 'late';
  joinedAt?: string | null;
  leftAt?: string | null;
}

export interface AgendaItemData extends AgendaItem {
  hierarchicalNumber: string;
}

export interface VoteData {
  id: string;
  title: string;
  entityType: string;
  entityId: string;
  outcome?: 'passed' | 'failed' | 'invalid';
  voteSummary?: {
    totalVotes: number;
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
    percentage: number;
  };
}

export interface MinutesAutoPopulationData {
  meeting: MeetingData;
  participants: ParticipantData[];
  agendaItems: AgendaItemData[];
  votes: VoteData[];
  quorumMet: boolean;
  quorumPercentage: number;
}

// ============================================================================
// HTML GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate meeting header section
 */
export function generateMeetingHeader(meeting: MeetingData): string {
  const date = new Date(meeting.scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const location = meeting.locationType === 'physical' 
    ? meeting.physicalLocation || 'Not specified'
    : meeting.locationType === 'virtual'
    ? 'Virtual Meeting'
    : 'Hybrid Meeting';

  return `
<div class="meeting-header">
  <h1>${meeting.title}</h1>
  <p><strong>Date:</strong> ${date}</p>
  <p><strong>Time:</strong> ${meeting.startTime} - ${meeting.endTime}</p>
  <p><strong>Location:</strong> ${location}</p>
  ${meeting.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>` : ''}
</div>
  `.trim();
}

/**
 * Generate attendance section
 */
export function generateAttendanceSection(
  participants: ParticipantData[],
  quorumMet: boolean,
  quorumPercentage: number
): string {
  const present = participants.filter(p => p.attendanceStatus === 'present');
  const apologies = participants.filter(p => p.attendanceStatus === 'apology');
  const absent = participants.filter(p => p.attendanceStatus === 'absent');

  const presentList = present.length > 0
    ? present.map(p => `<li>${p.userName} (${p.roleTitle})</li>`).join('\n    ')
    : '<li>None</li>';

  const apologiesList = apologies.length > 0
    ? apologies.map(p => `<li>${p.userName} (${p.roleTitle})</li>`).join('\n    ')
    : '<li>None</li>';

  const absentList = absent.length > 0
    ? absent.map(p => `<li>${p.userName} (${p.roleTitle})</li>`).join('\n    ')
    : '<li>None</li>';

  const quorumStatus = quorumMet
    ? `<p class="quorum-met"><strong>Quorum Status:</strong> Met (${quorumPercentage.toFixed(1)}%)</p>`
    : `<p class="quorum-not-met"><strong>Quorum Status:</strong> Not Met (${quorumPercentage.toFixed(1)}%)</p>`;

  return `
<div class="attendance-section">
  <h2>1. Attendance</h2>
  ${quorumStatus}
  
  <h3>Present (${present.length})</h3>
  <ul>
    ${presentList}
  </ul>
  
  ${apologies.length > 0 ? `
  <h3>Apologies (${apologies.length})</h3>
  <ul>
    ${apologiesList}
  </ul>
  ` : ''}
  
  ${absent.length > 0 ? `
  <h3>Absent (${absent.length})</h3>
  <ul>
    ${absentList}
  </ul>
  ` : ''}
</div>
  `.trim();
}

/**
 * Generate agenda items section
 */
export function generateAgendaItemsSection(agendaItems: AgendaItemData[]): string {
  if (agendaItems.length === 0) {
    return `
<div class="agenda-section">
  <h2>2. Agenda Items</h2>
  <p>No agenda items available.</p>
</div>
    `.trim();
  }

  const itemsHtml = agendaItems.map(item => {
    const depth = item.hierarchicalNumber.split('.').length - 1;
    const headingLevel = Math.min(depth + 3, 6); // h3 to h6
    const presenter = item.presenterName ? ` - Presented by ${item.presenterName}` : '';
    
    return `
  <div class="agenda-item" data-item-id="${item.id}">
    <h${headingLevel}>${item.hierarchicalNumber}. ${item.title}${presenter}</h${headingLevel}>
    ${item.description ? `<p>${item.description}</p>` : ''}
    <div class="discussion-notes">
      <p><em>[Discussion notes to be added]</em></p>
    </div>
  </div>
    `.trim();
  }).join('\n\n  ');

  return `
<div class="agenda-section">
  <h2>2. Agenda Items</h2>
  ${itemsHtml}
</div>
  `.trim();
}

/**
 * Generate votes section
 */
export function generateVotesSection(votes: VoteData[]): string {
  if (votes.length === 0) {
    return '';
  }

  const votesHtml = votes.map((vote, index) => {
    const outcomeText = vote.outcome 
      ? `<strong>Outcome:</strong> ${vote.outcome.toUpperCase()}`
      : '<strong>Outcome:</strong> Pending';

    const summaryHtml = vote.voteSummary ? `
    <ul>
      <li>Total Votes: ${vote.voteSummary.totalVotes}</li>
      <li>For: ${vote.voteSummary.votesFor} (${vote.voteSummary.percentage.toFixed(1)}%)</li>
      <li>Against: ${vote.voteSummary.votesAgainst}</li>
      <li>Abstentions: ${vote.voteSummary.abstentions}</li>
    </ul>
    ` : '';

    return `
  <div class="vote-item" data-vote-id="${vote.id}">
    <h4>${index + 1}. ${vote.title}</h4>
    <p>${outcomeText}</p>
    ${summaryHtml}
  </div>
    `.trim();
  }).join('\n\n  ');

  return `
<div class="votes-section">
  <h2>3. Votes and Decisions</h2>
  ${votesHtml}
</div>
  `.trim();
}

/**
 * Generate action items section placeholder
 */
export function generateActionItemsSection(): string {
  return `
<div class="action-items-section">
  <h2>4. Action Items</h2>
  <p><em>[Action items will be added during minutes editing]</em></p>
</div>
  `.trim();
}

/**
 * Generate closing section
 */
export function generateClosingSection(): string {
  return `
<div class="closing-section">
  <h2>5. Next Meeting</h2>
  <p><em>[Details of next meeting to be confirmed]</em></p>
  
  <h2>6. Adjournment</h2>
  <p><em>[Time of adjournment to be recorded]</em></p>
</div>
  `.trim();
}

// ============================================================================
// MAIN AUTO-POPULATION FUNCTION
// ============================================================================

/**
 * Generate complete minutes HTML from meeting data
 */
export function generateMinutesFromMeetingData(data: MinutesAutoPopulationData): string {
  const sections = [
    generateMeetingHeader(data.meeting),
    generateAttendanceSection(data.participants, data.quorumMet, data.quorumPercentage),
    generateAgendaItemsSection(data.agendaItems),
    generateVotesSection(data.votes),
    generateActionItemsSection(),
    generateClosingSection(),
  ];

  return sections.join('\n\n');
}

/**
 * Generate plain text version from HTML
 */
export function generatePlainTextFromHtml(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up extra whitespace
  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple blank lines to double
    .replace(/[ \t]+/g, ' ') // Multiple spaces to single
    .trim();
  
  return text;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute);
}

// ============================================================================
// HELPER FUNCTIONS FOR DATA EXTRACTION
// ============================================================================

/**
 * Generate hierarchical number for agenda item
 */
export function generateHierarchicalNumber(
  item: AgendaItem,
  allItems: AgendaItem[]
): string {
  if (!item.parentItemId) {
    const rootItems = allItems
      .filter(i => !i.parentItemId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const index = rootItems.findIndex(i => i.id === item.id);
    return String(index + 1);
  }
  
  const parent = allItems.find(i => i.id === item.parentItemId);
  if (!parent) return '?';
  
  const parentNumber = generateHierarchicalNumber(parent, allItems);
  const siblings = allItems
    .filter(i => i.parentItemId === item.parentItemId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const index = siblings.findIndex(i => i.id === item.id);
  
  return `${parentNumber}.${index + 1}`;
}

/**
 * Add hierarchical numbers to agenda items
 */
export function addHierarchicalNumbers(agendaItems: AgendaItem[]): AgendaItemData[] {
  return agendaItems.map(item => ({
    ...item,
    hierarchicalNumber: generateHierarchicalNumber(item, agendaItems),
  }));
}

/**
 * Sort agenda items in display order (parents before children)
 */
export function sortAgendaItemsForDisplay(items: AgendaItemData[]): AgendaItemData[] {
  const sorted: AgendaItemData[] = [];
  const itemMap = new Map(items.map(item => [item.id, item]));
  
  function addItemAndChildren(item: AgendaItemData) {
    sorted.push(item);
    const children = items
      .filter(i => i.parentItemId === item.id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    children.forEach(child => addItemAndChildren(child));
  }
  
  // Add root items and their children
  items
    .filter(item => !item.parentItemId)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .forEach(rootItem => addItemAndChildren(rootItem));
  
  return sorted;
}
