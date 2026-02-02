/**
 * User API Handlers (Refactored)
 * MSW handlers using the new database-like structure
 */

import { http, HttpResponse, delay } from 'msw';
import { filterUsers, getUserById } from '../db/queries/userQueries';
import { usersTable } from '../db/tables/users';
import { getUserMemberships } from '../db/queries/userQueries';

export const usersHandlers = [
  // GET /api/users - List users with pagination and filters
  http.get('/api/users', async ({ request }) => {
    await delay(300);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search') || undefined;
    const status = url.searchParams.get('status') as 'active' | 'inactive' | 'pending' | 'suspended' | undefined;
    const role = url.searchParams.get('role') || undefined;
    const boardId = url.searchParams.get('boardId') || undefined;
    
    const result = filterUsers({
      search,
      status,
      role,
      boardId,
      page,
      pageSize,
    });
    
    // Transform to UserListItem format (must match UserListItemSchema)
    const data = result.data.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      primaryRole: user.primaryRole,
      status: user.status,
      boardCount: user.boardMemberships?.length || 0,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLoginAt,
      createdAt: user.createdAt,
    }));
    
    return HttpResponse.json({
      data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  }),

  // GET /api/users/:id - Get single user
  http.get('/api/users/:id', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    const user = getUserById(parseInt(id as string));
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get memberships
    const memberships = getUserMemberships(user.id);
    
    return HttpResponse.json({
      data: {
        ...user,
        boardMemberships: memberships,
      },
    });
  }),

  // POST /api/users - Create user
  http.post('/api/users', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as {
      email: string;
      firstName: string;
      lastName: string;
      primaryRole: string;
    };
    
    // Check if email already exists
    const existing = usersTable.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      return HttpResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user (in real app, this would insert into DB)
    const newUser = {
      id: Math.max(...usersTable.map(u => u.id)) + 1,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: `${body.firstName} ${body.lastName}`,
      phone: (body as any).phone || null,
      alternatePhone: (body as any).alternatePhone || null,
      alternateEmail: (body as any).alternateEmail || null,
      employeeId: null,
      avatar: null,
      timezone: 'Africa/Nairobi',
      primaryRole: body.primaryRole,
      status: 'pending' as const,
      mfaEnabled: false,
      mfaSetupComplete: false,
      hasCertificate: false,
      certificateExpiry: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    
    return HttpResponse.json({
      data: newUser,
      message: 'User created successfully',
    }, { status: 201 });
  }),

  // PUT /api/users/:id - Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    const user = getUserById(parseInt(id as string));
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Partial<typeof user>;
    
    return HttpResponse.json({
      data: { ...user, ...body, updatedAt: new Date().toISOString() },
      message: 'User updated successfully',
    });
  }),

  // DELETE /api/users/:id - Delete user
  http.delete('/api/users/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const user = getUserById(parseInt(id as string));
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/users/:id/boards - Get user's board memberships
  http.get('/api/users/:id/boards', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    const user = getUserById(parseInt(id as string));
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const memberships = getUserMemberships(user.id);
    
    return HttpResponse.json({
      data: memberships,
      total: memberships.length,
    });
  }),
];
