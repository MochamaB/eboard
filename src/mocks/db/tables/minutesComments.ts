/**
 * Minutes Comments Table (Mock Data)
 * Review comments and feedback on meeting minutes
 */

export type CommentType = 'general' | 'section' | 'highlight';

export interface MinutesCommentRow {
  id: string;
  minutesId: string;

  // Comment content
  comment: string;
  commentType: CommentType;

  // Reference to content
  sectionReference: string | null;
  highlightedText: string | null;
  textPosition: {
    start: number;
    end: number;
  } | null;

  // Author
  createdBy: number;
  createdAt: string;
  updatedAt: string | null;

  // Status
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: number | null;

  // Threading (for replies)
  parentCommentId: string | null;

  // Secretary response
  secretaryResponse: string | null;
  respondedAt: string | null;
  respondedBy: number | null;
}

export const minutesCommentsTable: MinutesCommentRow[] = [
  // ========================================================================
  // MTG-010: Chai Trading Board - Comments on pending review minutes
  // ========================================================================

  // Comment 1: Section-specific feedback
  {
    id: 'comment-mtg010-001',
    minutesId: 'minutes-mtg010-001',
    comment: 'Please clarify the export volume figures mentioned in section 3. The presentation showed 2.5 million kg, but I recall the discussion mentioning 2.8 million kg including pending shipments.',
    commentType: 'section',
    sectionReference: 'Section 3: Q4 2024 Export Performance',
    highlightedText: null,
    textPosition: null,
    createdBy: 5, // Hon. P Langat
    createdAt: '2025-01-23T14:00:00Z',
    updatedAt: null,
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
    parentCommentId: null,
    secretaryResponse: null,
    respondedAt: null,
    respondedBy: null,
  },

  // Comment 2: Specific text correction (RESOLVED)
  {
    id: 'comment-mtg010-002',
    minutesId: 'minutes-mtg010-001',
    comment: 'The date mentioned should be January 15, not January 16. The stakeholder meeting was confirmed for the 15th during our discussion.',
    commentType: 'highlight',
    sectionReference: 'Section 6: Action Items',
    highlightedText: 'February 16, 2025',
    textPosition: {
      start: 1845,
      end: 1861,
    },
    createdBy: 6, // Hon. J Mutai
    createdAt: '2025-01-23T15:30:00Z',
    updatedAt: '2025-01-23T16:00:00Z',
    resolved: true,
    resolvedAt: '2025-01-23T16:00:00Z',
    resolvedBy: 19,
    parentCommentId: null,
    secretaryResponse: 'Corrected to February 15, 2025. Thank you for catching this.',
    respondedAt: '2025-01-23T16:00:00Z',
    respondedBy: 19,
  },

  // Comment 3: Missing information
  {
    id: 'comment-mtg010-003',
    minutesId: 'minutes-mtg010-001',
    comment: 'The action item for market analysis is missing the assigned person. This was assigned to the Business Development Manager during the meeting.',
    commentType: 'general',
    sectionReference: null,
    highlightedText: null,
    textPosition: null,
    createdBy: 7, // Hon. W Korir (Chairman)
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: null,
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
    parentCommentId: null,
    secretaryResponse: null,
    respondedAt: null,
    respondedBy: null,
  },

  // Comment 4: Clarification request
  {
    id: 'comment-mtg010-004',
    minutesId: 'minutes-mtg010-001',
    comment: 'Could you add more detail about the pricing structure discussion? This was a key point that needs to be clearly documented.',
    commentType: 'section',
    sectionReference: 'Section 4: Export Contract Terms Review',
    highlightedText: null,
    textPosition: null,
    createdBy: 8, // Hon. M Kiprop
    createdAt: '2025-01-24T11:30:00Z',
    updatedAt: null,
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
    parentCommentId: null,
    secretaryResponse: null,
    respondedAt: null,
    respondedBy: null,
  },

  // Comment 5: Secretary's clarification (RESOLVED)
  {
    id: 'comment-mtg010-005',
    minutesId: 'minutes-mtg010-001',
    comment: 'I will add a paragraph detailing the pricing structure components: base price, quality premium, and payment term adjustments as discussed.',
    commentType: 'general',
    sectionReference: null,
    highlightedText: null,
    textPosition: null,
    createdBy: 19, // Jane Njeri (Secretary)
    createdAt: '2025-01-24T14:00:00Z',
    updatedAt: '2025-01-24T14:00:00Z',
    resolved: true,
    resolvedAt: '2025-01-24T14:00:00Z',
    resolvedBy: 19,
    parentCommentId: 'comment-mtg010-004',
    secretaryResponse: 'Updated section 4 with detailed pricing structure breakdown.',
    respondedAt: '2025-01-24T14:00:00Z',
    respondedBy: 19,
  },
];
