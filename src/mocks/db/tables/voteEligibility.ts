/**
 * Vote Eligibility Table (Mock Data)
 * Defines who can vote with their weights
 */

export interface VoteEligibilityRow {
  id: string;
  voteId: string;
  userId: number;
  userName: string;
  userRole: string;
  weight: number;
  eligible: boolean;
}

export const voteEligibilityTable: VoteEligibilityRow[] = [
  // ========================================================================
  // Eligibility for vote-mtg008-001 (3 KETEPA board members)
  // ========================================================================
  {
    id: 'elig-vote-mtg008-001-001',
    voteId: 'vote-mtg008-001',
    userId: 3,
    userName: 'Mathews Odiero',
    userRole: 'Chairman',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg008-001-002',
    voteId: 'vote-mtg008-001',
    userId: 4,
    userName: 'Hon G.G Kagombe',
    userRole: 'Board Member',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg008-001-003',
    voteId: 'vote-mtg008-001',
    userId: 18,
    userName: 'Isaac Mungai Chege',
    userRole: 'Board Secretary',
    weight: 1.0,
    eligible: true,
  },

  // ========================================================================
  // Eligibility for vote-mtg008-002 (Same 3 KETEPA board members)
  // ========================================================================
  {
    id: 'elig-vote-mtg008-002-001',
    voteId: 'vote-mtg008-002',
    userId: 3,
    userName: 'Mathews Odiero',
    userRole: 'Chairman',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg008-002-002',
    voteId: 'vote-mtg008-002',
    userId: 4,
    userName: 'Hon G.G Kagombe',
    userRole: 'Board Member',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg008-002-003',
    voteId: 'vote-mtg008-002',
    userId: 18,
    userName: 'Isaac Mungai Chege',
    userRole: 'Board Secretary',
    weight: 1.0,
    eligible: true,
  },

  // ========================================================================
  // Eligibility for vote-mtg002-001 (7 KTDA MS board members)
  // ========================================================================
  {
    id: 'elig-vote-mtg002-001-001',
    voteId: 'vote-mtg002-001',
    userId: 1,
    userName: 'Chege Kirundi',
    userRole: 'Chairman',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg002-001-002',
    voteId: 'vote-mtg002-001',
    userId: 2,
    userName: 'James Ombasa Omweno',
    userRole: 'Vice Chairman',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg002-001-003',
    voteId: 'vote-mtg002-001',
    userId: 4,
    userName: 'Hon G.G Kagombe',
    userRole: 'Board Member',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg002-001-004',
    voteId: 'vote-mtg002-001',
    userId: 5,
    userName: 'James Githinji Mwangi',
    userRole: 'Board Member',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg002-001-005',
    voteId: 'vote-mtg002-001',
    userId: 6,
    userName: "David Ndung'u",
    userRole: 'Board Member',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg002-001-006',
    voteId: 'vote-mtg002-001',
    userId: 7,
    userName: 'John Mthamo Wasusana',
    userRole: 'Board Member',
    weight: 1.0,
    eligible: true,
  },
  {
    id: 'elig-vote-mtg002-001-007',
    voteId: 'vote-mtg002-001',
    userId: 8,
    userName: 'Enos Njeru',
    userRole: 'Board Member',
    weight: 1.0,
    eligible: true,
  },
];
