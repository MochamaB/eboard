/**
 * Board API Handlers (Refactored)
 * MSW handlers using the new database-like structure
 */

import { http, HttpResponse, delay } from 'msw';
import { 
  filterBoards, 
  getBoardById, 
  toBoardObject, 
  getBoardTree,
  getBoardMembers,
  getMainBoard,
  getSubsidiaries,
  getBoardsByType,
} from '../db/queries/boardQueries';
import type { Board } from '../../types/board.types';

export const boardsHandlers = [
  // GET /api/boards - List boards with pagination and filters
  http.get('/api/boards', async ({ request }) => {
    await delay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search') || undefined;
    const type = url.searchParams.get('type') as Board['type'] | undefined;
    const status = url.searchParams.get('status') as Board['status'] | undefined;
    const zone = url.searchParams.get('zone') || undefined;
    const boardId = url.searchParams.get('boardId') || undefined;
    const parentId = url.searchParams.get('parentId') || undefined;
    
    const result = filterBoards({
      search,
      type,
      status,
      zone,
      boardId,
      parentId,
      page,
      pageSize,
    });
    
    return HttpResponse.json(result);
  }),

  // GET /api/boards/tree - Get board hierarchy tree
  http.get('/api/boards/tree', async () => {
    await delay(200);
    return HttpResponse.json({ data: getBoardTree() });
  }),

  // GET /api/boards/main - Get main board
  http.get('/api/boards/main', async () => {
    await delay(200);
    const mainBoard = getMainBoard();
    if (!mainBoard) {
      return HttpResponse.json({ message: 'Main board not found' }, { status: 404 });
    }
    return HttpResponse.json({ data: toBoardObject(mainBoard) });
  }),

  // GET /api/boards/subsidiaries - Get all subsidiaries
  http.get('/api/boards/subsidiaries', async () => {
    await delay(200);
    const subsidiaries = getSubsidiaries();
    return HttpResponse.json({ 
      data: subsidiaries.map(toBoardObject),
      total: subsidiaries.length,
    });
  }),

  // GET /api/boards/factories - Get all factories
  http.get('/api/boards/factories', async () => {
    await delay(200);
    const factories = getBoardsByType('factory');
    return HttpResponse.json({ 
      data: factories.map(toBoardObject),
      total: factories.length,
    });
  }),

  // GET /api/boards/:id - Get single board
  http.get('/api/boards/:id', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    const boardRow = getBoardById(id as string);
    
    if (!boardRow) {
      return HttpResponse.json(
        { message: 'Board not found' },
        { status: 404 }
      );
    }
    
    // Return board object directly (not wrapped in { data: ... })
    return HttpResponse.json(toBoardObject(boardRow));
  }),

  // GET /api/boards/:id/members - Get board members
  http.get('/api/boards/:id/members', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    const members = getBoardMembers(id as string);
    
    return HttpResponse.json({
      data: members,
      total: members.length,
    });
  }),

  // POST /api/boards - Create board (placeholder)
  http.post('/api/boards', async ({ request }) => {
    await delay(300);
    const body = await request.json() as Partial<Board>;
    
    // For now, just return success with the data
    return HttpResponse.json({
      data: { id: `new-${Date.now()}`, ...body },
      message: 'Board created successfully',
    }, { status: 201 });
  }),

  // PUT /api/boards/:id - Update board (placeholder)
  http.put('/api/boards/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as Partial<Board>;
    
    const boardRow = getBoardById(id as string);
    if (!boardRow) {
      return HttpResponse.json({ message: 'Board not found' }, { status: 404 });
    }
    
    return HttpResponse.json({
      data: { ...toBoardObject(boardRow), ...body },
      message: 'Board updated successfully',
    });
  }),

  // DELETE /api/boards/:id - Delete board (placeholder)
  http.delete('/api/boards/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    
    const boardRow = getBoardById(id as string);
    if (!boardRow) {
      return HttpResponse.json({ message: 'Board not found' }, { status: 404 });
    }
    
    return new HttpResponse(null, { status: 204 });
  }),
];
