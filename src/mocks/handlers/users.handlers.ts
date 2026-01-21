/**
 * User API Handlers
 * MSW handlers for user management endpoints
 */

import { http, HttpResponse, delay } from 'msw';
import { mockUsers, mockUserListItems, getUserById, getUserByEmail } from '../data/users';
import type { User, UserListItem } from '../../types';

// Mutable copy for create/update operations
let users = [...mockUsers];
let userListItems = [...mockUserListItems];
let nextUserId = Math.max(...users.map(u => u.id)) + 1;

export const usersHandlers = [
  // GET /api/users - List users with pagination and filters
  http.get('/api/users', async ({ request }) => {
    await delay(300); // Simulate network delay
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    const boardId = url.searchParams.get('boardId');
    
    let filteredUsers = [...userListItems];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    // Apply role filter
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.primaryRole === role);
    }
    
    // Apply board filter (need to check full user data)
    if (boardId) {
      const userIdsWithBoard = users
        .filter(u => u.boardMemberships.some(m => m.boardId === boardId))
        .map(u => u.id);
      filteredUsers = filteredUsers.filter(user => userIdsWithBoard.includes(user.id));
    }
    
    // Pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
    
    return HttpResponse.json({
      data: paginatedUsers,
      total,
      page,
      pageSize,
      totalPages,
    });
  }),

  // GET /api/users/:id - Get single user
  http.get('/api/users/:id', async ({ params }) => {
    await delay(200);
    
    const id = parseInt(params.id as string);
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(user);
  }),

  // POST /api/users - Create new user
  http.post('/api/users', async ({ request }) => {
    await delay(500);
    
    const body = await request.json() as Record<string, unknown>;
    
    // Check if email already exists
    if (getUserByEmail(body.email as string)) {
      return HttpResponse.json(
        { message: 'Email already exists', field: 'email' },
        { status: 400 }
      );
    }
    
    const newUser: User = {
      id: nextUserId++,
      email: body.email as string,
      firstName: body.firstName as string,
      lastName: body.lastName as string,
      fullName: `${body.firstName} ${body.lastName}`,
      phone: (body.phone as string) || null,
      employeeId: (body.employeeId as string) || null,
      avatar: null,
      timezone: 'Africa/Nairobi',
      primaryRole: body.primaryRole as User['primaryRole'],
      status: 'pending',
      mfaEnabled: body.requireMfa as boolean || false,
      mfaSetupComplete: false,
      hasCertificate: false,
      certificateExpiry: null,
      boardMemberships: ((body.boardAssignments as Array<{boardId: string; role: string; startDate: string}>) || []).map((assignment, index) => ({
        id: Date.now() + index,
        boardId: assignment.boardId,
        boardName: assignment.boardId, // Would be resolved from boards data
        boardType: 'main' as const,
        role: assignment.role as 'member',
        startDate: assignment.startDate,
        endDate: null,
        isActive: true,
      })),
      lastLogin: null,
      lastPasswordChange: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin@ktda.co.ke',
    };
    
    users.push(newUser);
    userListItems.push({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: newUser.fullName,
      phone: newUser.phone,
      avatar: newUser.avatar,
      primaryRole: newUser.primaryRole,
      status: newUser.status,
      boardCount: newUser.boardMemberships.length,
      mfaEnabled: newUser.mfaEnabled,
      lastLogin: newUser.lastLogin,
      createdAt: newUser.createdAt,
    });
    
    return HttpResponse.json(newUser, { status: 201 });
  }),

  // PUT /api/users/:id - Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    await delay(300);
    
    const id = parseInt(params.id as string);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Record<string, unknown>;
    const updatedUser = {
      ...users[userIndex],
      ...body,
      fullName: body.firstName && body.lastName 
        ? `${body.firstName} ${body.lastName}`
        : users[userIndex].fullName,
      updatedAt: new Date().toISOString(),
    };
    
    users[userIndex] = updatedUser as User;
    
    // Update list item too
    const listIndex = userListItems.findIndex(u => u.id === id);
    if (listIndex !== -1) {
      userListItems[listIndex] = {
        ...userListItems[listIndex],
        firstName: updatedUser.firstName as string,
        lastName: updatedUser.lastName as string,
        fullName: updatedUser.fullName as string,
        phone: updatedUser.phone as string | null,
        primaryRole: updatedUser.primaryRole as UserListItem['primaryRole'],
        status: updatedUser.status as UserListItem['status'],
      };
    }
    
    return HttpResponse.json(updatedUser);
  }),

  // DELETE /api/users/:id - Deactivate user
  http.delete('/api/users/:id', async ({ params }) => {
    await delay(300);
    
    const id = parseInt(params.id as string);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    users[userIndex] = {
      ...users[userIndex],
      status: 'inactive',
      updatedAt: new Date().toISOString(),
    };
    
    const listIndex = userListItems.findIndex(u => u.id === id);
    if (listIndex !== -1) {
      userListItems[listIndex] = {
        ...userListItems[listIndex],
        status: 'inactive',
      };
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/users/check-email - Check email availability
  http.get('/api/users/check-email', async ({ request }) => {
    await delay(200);
    
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return HttpResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    const exists = getUserByEmail(email);
    
    return HttpResponse.json({
      available: !exists,
      message: exists ? 'Email already in use' : 'Email is available',
    });
  }),

  // POST /api/users/bulk-deactivate - Bulk deactivate users
  http.post('/api/users/bulk-deactivate', async ({ request }) => {
    await delay(500);
    
    const body = await request.json() as { userIds: number[]; reason?: string };
    const { userIds } = body;
    
    userIds.forEach(id => {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status: 'inactive',
          updatedAt: new Date().toISOString(),
        };
      }
      
      const listIndex = userListItems.findIndex(u => u.id === id);
      if (listIndex !== -1) {
        userListItems[listIndex] = {
          ...userListItems[listIndex],
          status: 'inactive',
        };
      }
    });
    
    return HttpResponse.json({ success: true, count: userIds.length });
  }),

  // GET /api/users/:id/activities - Get user activity log
  http.get('/api/users/:id/activities', async ({ params }) => {
    await delay(200);
    
    const id = parseInt(params.id as string);
    
    // Mock activity data
    const activities = [
      {
        id: 1,
        userId: id,
        action: 'login',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        createdAt: '2026-01-21T09:30:00Z',
      },
      {
        id: 2,
        userId: id,
        action: 'document_view',
        description: 'Viewed document: Q4 Financial Report',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        createdAt: '2026-01-21T09:35:00Z',
      },
      {
        id: 3,
        userId: id,
        action: 'meeting_join',
        description: 'Joined meeting: Main Board Q1 Review',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        createdAt: '2026-01-20T14:00:00Z',
      },
    ];
    
    return HttpResponse.json({
      data: activities,
      total: activities.length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  }),

  // POST /api/users/:id/resend-welcome - Resend welcome email
  http.post('/api/users/:id/resend-welcome', async ({ params }) => {
    await delay(300);
    
    const id = parseInt(params.id as string);
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({ success: true, message: 'Welcome email sent' });
  }),
];

export default usersHandlers;
