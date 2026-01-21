/**
 * Mock Boards Data
 * Uses existing organization data from src/data/organizations.ts
 */

import type { Board, BoardTreeNode } from '../../types';
import { organizations } from '../../data/organizations';

// Convert organizations to Board type for API responses
export const mockBoards: Board[] = organizations.map(org => ({
  id: org.id,
  name: org.name,
  shortName: org.shortName,
  type: org.type === 'group' ? 'main' : org.type,
  parentId: org.parentId,
  status: 'active',
  zone: org.zone,
  quorumPercentage: org.type === 'main' ? 50 : org.type === 'committee' ? 60 : 60,
  memberCount: org.type === 'main' ? 15 : org.type === 'subsidiary' ? 10 : org.type === 'factory' ? 8 : 5,
  committees: org.committees?.map(c => ({
    id: c.id,
    name: c.name,
    shortName: c.shortName,
    parentBoardId: org.id,
  })),
  createdAt: '2020-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}));

// Build hierarchical tree for board selection
export const mockBoardTree: BoardTreeNode[] = [
  {
    id: 'ktda-main',
    name: 'KTDA Main Board',
    type: 'main',
    children: [
      // Main Board Committees
      { id: 'audit', name: 'Audit Committee', type: 'committee' },
      { id: 'hr', name: 'HR Committee', type: 'committee' },
      { id: 'nomination', name: 'Nomination Committee', type: 'committee' },
      { id: 'sales', name: 'Sales Committee', type: 'committee' },
      { id: 'finance', name: 'Finance Committee', type: 'committee' },
    ],
  },
  {
    id: 'subsidiaries',
    name: 'Subsidiaries',
    type: 'subsidiary',
    children: [
      {
        id: 'ketepa',
        name: 'KETEPA Limited',
        type: 'subsidiary',
        children: [
          { id: 'ketepa-audit', name: 'Audit Committee', type: 'committee' },
          { id: 'ketepa-hr', name: 'HR Committee', type: 'committee' },
        ],
      },
      { id: 'chai-trading', name: 'Chai Trading Company', type: 'subsidiary' },
      { id: 'chai-logistics', name: 'Chai Logistics Limited', type: 'subsidiary' },
      { id: 'greenland-fedha', name: 'Greenland Fedha Limited', type: 'subsidiary' },
      { id: 'majani-insurance', name: 'Majani Insurance Brokers', type: 'subsidiary' },
      { id: 'ktda-power', name: 'KTDA Power Company', type: 'subsidiary' },
      { id: 'temec', name: 'TEMEC', type: 'subsidiary' },
      { id: 'ktda-foundation', name: 'KTDA Foundation', type: 'subsidiary' },
      { id: 'dmcc', name: 'DMCC Tea Trading', type: 'subsidiary' },
    ],
  },
  {
    id: 'factories-zone1',
    name: 'Factories (Zone 1)',
    type: 'factory',
    children: [
      { id: 'factory-chebut', name: 'Chebut Tea Factory', type: 'factory' },
      { id: 'factory-kapkatet', name: 'Kapkatet Tea Factory', type: 'factory' },
    ],
  },
  {
    id: 'factories-zone2',
    name: 'Factories (Zone 2)',
    type: 'factory',
    children: [
      { id: 'factory-litein', name: 'Litein Tea Factory', type: 'factory' },
      { id: 'factory-mogogosiek', name: 'Mogogosiek Tea Factory', type: 'factory' },
    ],
  },
];

// Helper to get board by ID
export const getBoardById = (id: string): Board | undefined => {
  return mockBoards.find(board => board.id === id);
};

export default mockBoards;
