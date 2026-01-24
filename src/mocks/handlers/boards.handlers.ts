/**
 * Board API Handlers
 * MSW handlers for board management endpoints
 */

import { http, HttpResponse, delay } from 'msw';
import { 
  mockBoards, 
  mockBoardTree, 
  mockBoardListItems,
} from '../data/boards';
import { mockUsers } from '../data/users';
import type { Board, BoardMember } from '../../types/board.types';

// Mutable copies for CRUD operations
let boards = [...mockBoards];
let boardListItems = [...mockBoardListItems];

// Helper to derive board members from users data
const getBoardMembersFromUsers = (boardId: string): BoardMember[] => {
  return mockUsers
    .filter(user => user.boardMemberships?.some(m => m.boardId === boardId && m.isActive))
    .map(user => {
      const membership = user.boardMemberships?.find(m => m.boardId === boardId && m.isActive);
      const role = membership?.role || 'board_member';
      // Map user primaryRole to display title
      const titleMap: Record<string, string> = {
        chairman: 'Chairman',
        vice_chairman: 'Vice Chairman',
        company_secretary: 'Company Secretary',
        ceo: 'CEO',
        board_member: 'Director',
      };
      return {
        id: `member-${user.id}`,
        membershipId: `membership-${membership?.id || user.id}`,
        userId: String(user.id),
        fullName: user.fullName,
        email: user.email,
        role: role,
        startDate: membership?.startDate || user.createdAt,
        endDate: membership?.endDate || null,
        isActive: membership?.isActive ?? true,
        title: titleMap[user.primaryRole] || titleMap[role] || 'Director',
        otherBoardsCount: (user.boardMemberships?.length || 1) - 1,
      };
    });
};

// Helper to generate next ID
const generateBoardId = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export const boardsHandlers = [
  // GET /api/boards - List boards with pagination and filters
  http.get('/api/boards', async ({ request }) => {
    await delay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const zone = url.searchParams.get('zone');
    const boardId = url.searchParams.get('boardId');
    const parentId = url.searchParams.get('parentId');
    
    let filteredBoards = [...boardListItems];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBoards = filteredBoards.filter(board =>
        board.name.toLowerCase().includes(searchLower) ||
        board.shortName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    if (type) {
      filteredBoards = filteredBoards.filter(board => board.type === type);
    }
    
    // Apply status filter
    if (status) {
      filteredBoards = filteredBoards.filter(board => board.status === status);
    }
    
    // Apply zone filter
    if (zone) {
      filteredBoards = filteredBoards.filter(board => board.zone === zone);
    }
    
    // Apply boardId + parentId filter (OR logic for showing board + its committees)
    // When both boardId and parentId are present with type='committee', 
    // show the board itself OR only committees (exclude subsidiaries/factories)
    if (boardId && parentId) {
      if (type === 'committee') {
        // Show board + only committees (not subsidiaries/factories)
        filteredBoards = filteredBoards.filter(board => 
          board.id === boardId || (board.parentId === parentId && board.type === 'committee')
        );
      } else {
        // Show board + all children
        filteredBoards = filteredBoards.filter(board => 
          board.id === boardId || board.parentId === parentId
        );
      }
    } else if (boardId) {
      filteredBoards = filteredBoards.filter(board => board.id === boardId);
    } else if (parentId) {
      filteredBoards = filteredBoards.filter(board => board.parentId === parentId);
    }
    
    const total = filteredBoards.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedBoards = filteredBoards.slice(startIndex, startIndex + pageSize);
    
    return HttpResponse.json({
      data: paginatedBoards,
      total,
      page,
      pageSize,
      totalPages,
    });
  }),

  // GET /api/boards/tree - Get board hierarchy tree
  http.get('/api/boards/tree', async () => {
    await delay(200);
    
    return HttpResponse.json({
      data: mockBoardTree,
    });
  }),

  // GET /api/boards/:id - Get single board details
  http.get('/api/boards/:id', async ({ params }) => {
    await delay(200);
    
    const id = params.id as string;
    const board = boards.find(b => b.id === id);
    
    if (!board) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(board);
  }),

  // POST /api/boards - Create new board
  http.post('/api/boards', async ({ request }) => {
    await delay(500);
    
    const body = await request.json() as Record<string, unknown>;
    const id = generateBoardId(body.name as string);
    
    // Check if ID already exists
    if (boards.find(b => b.id === id)) {
      return HttpResponse.json(
        { message: 'A board with this name already exists' },
        { status: 400 }
      );
    }
    
    const newBoard: Board = {
      id,
      name: body.name as string,
      shortName: body.shortName as string,
      description: body.description as string,
      type: body.type as Board['type'],
      parentId: body.parentId as string | undefined,
      parentName: body.parentId 
        ? boards.find(b => b.id === body.parentId)?.name 
        : undefined,
      zone: body.zone as Board['zone'],
      status: 'active',
      memberCount: 0,
      committeeCount: 0,
      settings: body.settings as Board['settings'],
      compliance: 0,
      meetingsThisYear: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    boards.push(newBoard);
    boardListItems.push({
      id: newBoard.id,
      name: newBoard.name,
      shortName: newBoard.shortName,
      type: newBoard.type,
      parentId: newBoard.parentId,
      parentName: newBoard.parentName,
      status: newBoard.status,
      zone: newBoard.zone,
      memberCount: newBoard.memberCount,
      committeeCount: newBoard.committeeCount,
      compliance: newBoard.compliance,
      lastMeetingDate: newBoard.lastMeetingDate,
    });
    
    return HttpResponse.json(newBoard, { status: 201 });
  }),

  // PUT /api/boards/:id - Update board
  http.put('/api/boards/:id', async ({ params, request }) => {
    await delay(300);
    
    const id = params.id as string;
    const boardIndex = boards.findIndex(b => b.id === id);
    
    if (boardIndex === -1) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Record<string, unknown>;
    const updatedBoard: Board = {
      ...boards[boardIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    } as Board;
    
    boards[boardIndex] = updatedBoard;
    
    // Update list item
    const listIndex = boardListItems.findIndex(b => b.id === id);
    if (listIndex !== -1) {
      boardListItems[listIndex] = {
        ...boardListItems[listIndex],
        name: updatedBoard.name,
        shortName: updatedBoard.shortName,
        status: updatedBoard.status,
        zone: updatedBoard.zone,
      };
    }
    
    return HttpResponse.json(updatedBoard);
  }),

  // DELETE /api/boards/:id - Deactivate board
  http.delete('/api/boards/:id', async ({ params }) => {
    await delay(300);
    
    const id = params.id as string;
    const boardIndex = boards.findIndex(b => b.id === id);
    
    if (boardIndex === -1) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    boards[boardIndex] = {
      ...boards[boardIndex],
      status: 'inactive',
      updatedAt: new Date().toISOString(),
    };
    
    const listIndex = boardListItems.findIndex(b => b.id === id);
    if (listIndex !== -1) {
      boardListItems[listIndex] = {
        ...boardListItems[listIndex],
        status: 'inactive',
      };
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================================================
  // BOARD MEMBERS ENDPOINTS
  // ============================================================================

  // GET /api/boards/:id/members - Get board members (derived from users data)
  http.get('/api/boards/:boardId/members', async ({ params, request }) => {
    await delay(200);
    
    const boardId = params.boardId as string;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role');
    
    // Derive board members from users data
    let filteredMembers = getBoardMembersFromUsers(boardId);
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMembers = filteredMembers.filter(m =>
        m.fullName.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (role) {
      filteredMembers = filteredMembers.filter(m => m.role === role);
    }
    
    const total = filteredMembers.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedMembers = filteredMembers.slice(startIndex, startIndex + pageSize);
    
    return HttpResponse.json({
      data: paginatedMembers,
      total,
      page,
      pageSize,
      totalPages,
    });
  }),

  // POST /api/boards/:id/members - Add member to board
  // Note: In a real app, this would update the user's boardMemberships in the database
  http.post('/api/boards/:boardId/members', async ({ params, request }) => {
    await delay(500);
    
    const boardId = params.boardId as string;
    const board = boards.find(b => b.id === boardId);
    
    if (!board) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Record<string, unknown>;
    
    // In a real implementation, this would add a boardMembership to the user
    // For now, return a mock response
    const newMember: BoardMember = {
      id: `member-${Date.now()}`,
      membershipId: `membership-${Date.now()}`,
      userId: body.userId as string,
      fullName: body.fullName as string || 'New Member',
      email: body.email as string || 'new@example.com',
      role: body.role as BoardMember['role'],
      startDate: body.startDate as string || new Date().toISOString().split('T')[0],
      endDate: null,
      isActive: true,
      title: body.title as string,
      otherBoardsCount: 0,
    };
    
    // Update board member count
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex !== -1) {
      boards[boardIndex] = {
        ...boards[boardIndex],
        memberCount: (boards[boardIndex].memberCount || 0) + 1,
      };
    }
    
    return HttpResponse.json(newMember, { status: 201 });
  }),

  // DELETE /api/boards/:boardId/members/:memberId - Remove member from board
  // Note: In a real app, this would update the user's boardMemberships in the database
  http.delete('/api/boards/:boardId/members/:memberId', async ({ params }) => {
    await delay(300);
    
    const { boardId, memberId } = params as { boardId: string; memberId: string };
    
    // In a real implementation, this would remove the boardMembership from the user
    // For now, just return success
    
    // Update board member count
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex !== -1 && boards[boardIndex].memberCount) {
      boards[boardIndex] = {
        ...boards[boardIndex],
        memberCount: boards[boardIndex].memberCount! - 1,
      };
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================================================
  // COMMITTEE ENDPOINTS
  // ============================================================================

  // GET /api/boards/:id/committees - Get board committees (committees are boards with type='committee')
  http.get('/api/boards/:boardId/committees', async ({ params }) => {
    await delay(200);
    
    const boardId = params.boardId as string;
    // Committees are now boards with type='committee' and parentId matching the board
    const boardCommittees = boards.filter(b => b.parentId === boardId && b.type === 'committee');
    
    return HttpResponse.json({
      data: boardCommittees,
      total: boardCommittees.length,
    });
  }),

  // POST /api/boards/:id/committees - Create committee (creates a board with type='committee')
  http.post('/api/boards/:boardId/committees', async ({ params, request }) => {
    await delay(500);
    
    const boardId = params.boardId as string;
    const parentBoard = boards.find(b => b.id === boardId);
    
    if (!parentBoard) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Record<string, unknown>;
    
    // Create committee as a board with type='committee'
    const newCommittee: Board = {
      id: `comm-${Date.now()}`,
      name: body.name as string,
      shortName: body.shortName as string,
      description: body.description as string,
      type: 'committee',
      parentId: boardId,
      parentName: parentBoard.name,
      status: 'active',
      memberCount: 0,
      committeeCount: 0,
      branding: parentBoard.branding, // Inherit branding from parent
      compliance: 100,
      meetingsThisYear: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    boards.push(newCommittee);
    
    // Update parent board committee count
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex !== -1) {
      boards[boardIndex] = {
        ...boards[boardIndex],
        committeeCount: (boards[boardIndex].committeeCount || 0) + 1,
      };
    }
    
    return HttpResponse.json(newCommittee, { status: 201 });
  }),

  // ============================================================================
  // USER BOARDS ENDPOINT
  // ============================================================================

  // GET /api/users/:userId/boards - Get boards for a user
  http.get('/api/users/:userId/boards', async () => {
    await delay(200);
    
    // Return subset of boards for demo
    const userBoards = boards.slice(0, 3);
    
    return HttpResponse.json({
      data: userBoards,
      total: userBoards.length,
    });
  }),

  // ============================================================================
  // BOARD STATISTICS
  // ============================================================================

  // GET /api/boards/:id/stats - Get board statistics
  http.get('/api/boards/:boardId/stats', async ({ params }) => {
    await delay(200);
    
    const boardId = params.boardId as string;
    const board = boards.find(b => b.id === boardId);
    
    if (!board) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      memberCount: board.memberCount || 0,
      committeeCount: board.committeeCount || 0,
      meetingsThisYear: board.meetingsThisYear || 0,
      compliance: board.compliance || 0,
      upcomingMeetings: 2,
      pendingResolutions: 5,
      documentsCount: 45,
    });
  }),
];

export default boardsHandlers;
