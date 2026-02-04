/**
 * Votes Cast Table (Mock Data)
 * Append-only record of every vote cast
 * NEVER updated or deleted - insert new row for vote changes
 */

export interface VoteCastRow {
  id: string;
  voteId: string;
  optionId: string;
  userId: number | null; // null if anonymous
  userName?: string;
  weightApplied: number;
  castAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export const votesCastTable: VoteCastRow[] = [
  // ========================================================================
  // Vote 1: MTG-008 - Minutes Approval (vote-mtg008-001)
  // Duration: 10:06 - 10:08 (2 minutes)
  // Result: 3 Yes, 0 No, 0 Abstain → PASSED
  // ========================================================================
  {
    id: 'cast-vote-mtg008-001-001',
    voteId: 'vote-mtg008-001',
    optionId: 'opt-vote-mtg008-001-yes',
    userId: 3,
    userName: 'Mathews Odiero',
    weightApplied: 1.0,
    castAt: '2025-01-15T10:06:30.000Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg008-001-002',
    voteId: 'vote-mtg008-001',
    optionId: 'opt-vote-mtg008-001-yes',
    userId: 4,
    userName: 'Hon G.G Kagombe',
    weightApplied: 1.0,
    castAt: '2025-01-15T10:07:15.000Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg008-001-003',
    voteId: 'vote-mtg008-001',
    optionId: 'opt-vote-mtg008-001-yes',
    userId: 18,
    userName: 'Isaac Mungai Chege',
    weightApplied: 1.0,
    castAt: '2025-01-15T10:07:45.000Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0',
  },

  // ========================================================================
  // Vote 2: MTG-008 - Export Strategy (vote-mtg008-002)
  // Duration: 11:25 - 11:30 (5 minutes)
  // Result: 3 Yes, 0 No, 0 Abstain → PASSED
  // ========================================================================
  {
    id: 'cast-vote-mtg008-002-001',
    voteId: 'vote-mtg008-002',
    optionId: 'opt-vote-mtg008-002-yes',
    userId: 3,
    userName: 'Mathews Odiero',
    weightApplied: 1.0,
    castAt: '2025-01-15T11:26:00.000Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg008-002-002',
    voteId: 'vote-mtg008-002',
    optionId: 'opt-vote-mtg008-002-yes',
    userId: 4,
    userName: 'Hon G.G Kagombe',
    weightApplied: 1.0,
    castAt: '2025-01-15T11:27:30.000Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg008-002-003',
    voteId: 'vote-mtg008-002',
    optionId: 'opt-vote-mtg008-002-yes',
    userId: 18,
    userName: 'Isaac Mungai Chege',
    weightApplied: 1.0,
    castAt: '2025-01-15T11:29:00.000Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0',
  },

  // ========================================================================
  // Vote 3: MTG-002 - Emergency Actions (vote-mtg002-001)
  // Duration: 15:58 - 16:03 (5 minutes)
  // Result: 6 Yes, 0 No, 1 Abstain → PASSED
  // ========================================================================
  {
    id: 'cast-vote-mtg002-001-001',
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-yes',
    userId: 1,
    userName: 'Chege Kirundi',
    weightApplied: 1.0,
    castAt: '2025-01-08T15:59:00.000Z',
    ipAddress: '192.168.1.201',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg002-001-002',
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-yes',
    userId: 2,
    userName: 'James Ombasa Omweno',
    weightApplied: 1.0,
    castAt: '2025-01-08T15:59:30.000Z',
    ipAddress: '192.168.1.202',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg002-001-003',
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-yes',
    userId: 4,
    userName: 'Hon G.G Kagombe',
    weightApplied: 1.0,
    castAt: '2025-01-08T16:00:00.000Z',
    ipAddress: '192.168.1.203',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg002-001-004',
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-yes',
    userId: 5,
    userName: 'James Githinji Mwangi',
    weightApplied: 1.0,
    castAt: '2025-01-08T16:00:45.000Z',
    ipAddress: '192.168.1.204',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg002-001-005',
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-yes',
    userId: 6,
    userName: "David Ndung'u",
    weightApplied: 1.0,
    castAt: '2025-01-08T16:01:15.000Z',
    ipAddress: '192.168.1.205',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg002-001-006',
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-yes',
    userId: 7,
    userName: 'John Mthamo Wasusana',
    weightApplied: 1.0,
    castAt: '2025-01-08T16:01:45.000Z',
    ipAddress: '192.168.1.206',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'cast-vote-mtg002-001-007',
    voteId: 'vote-mtg002-001',
    optionId: 'opt-vote-mtg002-001-abstain',
    userId: 8,
    userName: 'Enos Njeru',
    weightApplied: 1.0,
    castAt: '2025-01-08T16:02:30.000Z',
    ipAddress: '192.168.1.207',
    userAgent: 'Mozilla/5.0',
  },
];
