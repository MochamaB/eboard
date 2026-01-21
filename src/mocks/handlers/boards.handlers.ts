/**
 * Board API Handlers
 * MSW handlers for board management endpoints
 */

import { http, HttpResponse, delay } from 'msw';
import { mockBoards, mockBoardTree, getBoardById } from '../data/boards';

export const boardsHandlers = [
  // GET /api/boards - List boards
  http.get('/api/boards', async ({ request }) => {
    await delay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    
    let filteredBoards = [...mockBoards];
    
    if (type) {
      filteredBoards = filteredBoards.filter(board => board.type === type);
    }
    
    if (status) {
      filteredBoards = filteredBoards.filter(board => board.status === status);
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

  // GET /api/boards/:id - Get single board
  http.get('/api/boards/:id', async ({ params }) => {
    await delay(200);
    
    const id = params.id as string;
    const board = getBoardById(id);
    
    if (!board) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(board);
  }),

  // GET /api/boards/tree - Get board tree for selection
  http.get('/api/boards/tree', async () => {
    await delay(200);
    
    return HttpResponse.json({
      data: mockBoardTree,
    });
  }),

  // GET /api/users/:userId/boards - Get boards for a user
  http.get('/api/users/:userId/boards', async ({ params }) => {
    await delay(200);
    
    // Return subset of boards for demo
    const userBoards = mockBoards.slice(0, 3);
    
    return HttpResponse.json(userBoards);
  }),
];

export default boardsHandlers;
