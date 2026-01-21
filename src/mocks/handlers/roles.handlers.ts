/**
 * Role API Handlers
 * MSW handlers for role and permission endpoints
 */

import { http, HttpResponse, delay } from 'msw';
import { mockRoles, mockPermissions } from '../data/roles';
import type { Role } from '../../types';

// Mutable copy for create/update operations
let roles = [...mockRoles];
let nextRoleId = Math.max(...roles.map(r => r.id)) + 1;

export const rolesHandlers = [
  // GET /api/roles - List roles
  http.get('/api/roles', async ({ request }) => {
    await delay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const includeSystem = url.searchParams.get('includeSystem') !== 'false';
    
    let filteredRoles = [...roles];
    
    if (!includeSystem) {
      filteredRoles = filteredRoles.filter(role => !role.isSystem);
    }
    
    const total = filteredRoles.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedRoles = filteredRoles.slice(startIndex, startIndex + pageSize);
    
    return HttpResponse.json({
      data: paginatedRoles,
      total,
      page,
      pageSize,
      totalPages,
    });
  }),

  // GET /api/roles/:id - Get single role
  http.get('/api/roles/:id', async ({ params }) => {
    await delay(200);
    
    const id = parseInt(params.id as string);
    const role = roles.find(r => r.id === id);
    
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(role);
  }),

  // POST /api/roles - Create new role
  http.post('/api/roles', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as { name: string; description?: string; permissionIds: number[] };
    
    // Check if role name already exists
    if (roles.some(r => r.name.toLowerCase() === body.name.toLowerCase())) {
      return HttpResponse.json(
        { message: 'Role name already exists', field: 'name' },
        { status: 400 }
      );
    }
    
    const selectedPermissions = mockPermissions.filter(p => body.permissionIds.includes(p.id));
    
    const newRole: Role = {
      id: nextRoleId++,
      code: body.name.toLowerCase().replace(/\s+/g, '_'),
      name: body.name,
      description: body.description || '',
      isSystem: false,
      permissions: selectedPermissions,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    roles.push(newRole);
    
    return HttpResponse.json(newRole, { status: 201 });
  }),

  // PUT /api/roles/:id - Update role
  http.put('/api/roles/:id', async ({ params, request }) => {
    await delay(300);
    
    const id = parseInt(params.id as string);
    const roleIndex = roles.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return HttpResponse.json(
        { message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Cannot edit system roles
    if (roles[roleIndex].isSystem) {
      return HttpResponse.json(
        { message: 'Cannot modify system roles' },
        { status: 403 }
      );
    }
    
    const body = await request.json() as { name?: string; description?: string; permissionIds?: number[] };
    
    const updatedRole: Role = {
      ...roles[roleIndex],
      name: body.name || roles[roleIndex].name,
      description: body.description ?? roles[roleIndex].description,
      permissions: body.permissionIds 
        ? mockPermissions.filter(p => body.permissionIds!.includes(p.id))
        : roles[roleIndex].permissions,
      updatedAt: new Date().toISOString(),
    };
    
    roles[roleIndex] = updatedRole;
    
    return HttpResponse.json(updatedRole);
  }),

  // DELETE /api/roles/:id - Delete role
  http.delete('/api/roles/:id', async ({ params }) => {
    await delay(300);
    
    const id = parseInt(params.id as string);
    const roleIndex = roles.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return HttpResponse.json(
        { message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Cannot delete system roles
    if (roles[roleIndex].isSystem) {
      return HttpResponse.json(
        { message: 'Cannot delete system roles' },
        { status: 403 }
      );
    }
    
    // Cannot delete if users are assigned
    if (roles[roleIndex].userCount && roles[roleIndex].userCount > 0) {
      return HttpResponse.json(
        { message: 'Cannot delete role with assigned users' },
        { status: 400 }
      );
    }
    
    roles.splice(roleIndex, 1);
    
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/permissions - List all permissions
  http.get('/api/permissions', async () => {
    await delay(200);
    
    return HttpResponse.json({
      data: mockPermissions,
    });
  }),
];

export default rolesHandlers;
