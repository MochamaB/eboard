/**
 * Board Types
 * Based on existing organization structure and docs
 */

import { z } from 'zod';
import { BoardRoleSchema } from './role.types';

// Board types (from docs/02_REQUIREMENTS_DOCUMENT.md)
export const BoardTypeSchema = z.enum([
  'main',        // Main Board (1)
  'subsidiary',  // Subsidiary Boards (8)
  'factory',     // Factory Boards (69)
  'committee',   // Committees (variable)
]);

// Board status
export const BoardStatusSchema = z.enum(['active', 'inactive']);

// Committee (simplified)
export const CommitteeSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  parentBoardId: z.string(),
});

// Board
export const BoardSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  type: BoardTypeSchema,
  parentId: z.string().optional(),
  status: BoardStatusSchema,
  zone: z.number().optional(), // For factory boards
  quorumPercentage: z.number().default(50),
  memberCount: z.number().optional(),
  committees: z.array(CommitteeSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Board tree node (for hierarchical selection)
export const BoardTreeNodeSchema: z.ZodType<BoardTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: BoardTypeSchema,
    children: z.array(BoardTreeNodeSchema).optional(),
  })
);

export interface BoardTreeNode {
  id: string;
  name: string;
  type: 'main' | 'subsidiary' | 'factory' | 'committee';
  children?: BoardTreeNode[];
}

// Board membership (user's membership on a board)
export const BoardMembershipSchema = z.object({
  id: z.number(),
  boardId: z.string(),
  boardName: z.string(),
  boardType: BoardTypeSchema,
  role: BoardRoleSchema,
  startDate: z.string(),
  endDate: z.string().nullable(),
  isActive: z.boolean(),
});

// Types
export type BoardType = z.infer<typeof BoardTypeSchema>;
export type BoardStatus = z.infer<typeof BoardStatusSchema>;
export type Committee = z.infer<typeof CommitteeSchema>;
export type Board = z.infer<typeof BoardSchema>;
export type BoardMembership = z.infer<typeof BoardMembershipSchema>;
