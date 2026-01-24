/**
 * Role API Handlers (Refactored)
 * MSW handlers using the new database-like structure
 */

import { http, HttpResponse, delay } from 'msw';
import { rolesTable } from '../db/tables/roles';
import { permissionsTable } from '../db/tables/permissions';
import { rolePermissionsTable } from '../db/tables/rolePermissions';

export const rolesHandlers = [
  // GET /api/roles - List roles
  http.get('/api/roles', async ({ request }) => {
    await delay(200);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const includeSystem = url.searchParams.get('includeSystem') !== 'false';
    
    let filteredRoles = [...rolesTable];
    
    if (!includeSystem) {
      filteredRoles = filteredRoles.filter(role => !role.isSystemRole);
    }
    
    // Add permissions to each role
    const rolesWithPermissions = filteredRoles.map(role => {
      const permissionIds = rolePermissionsTable
        .filter(rp => rp.roleId === role.id)
        .map(rp => rp.permissionId);
      
      const permissions = permissionsTable
        .filter(p => permissionIds.includes(p.id))
        .map(p => p.code);
      
      return {
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        isSystem: role.isSystemRole,
        permissions,
        userCount: 0, // Would be calculated from users table
      };
    });
    
    const total = rolesWithPermissions.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedRoles = rolesWithPermissions.slice(startIndex, startIndex + pageSize);
    
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
    const role = rolesTable.find(r => r.id === id);
    
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Get permissions for this role
    const permissionIds = rolePermissionsTable
      .filter(rp => rp.roleId === role.id)
      .map(rp => rp.permissionId);
    
    const permissions = permissionsTable
      .filter(p => permissionIds.includes(p.id))
      .map(p => p.code);
    
    return HttpResponse.json({
      data: {
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        isSystem: role.isSystemRole,
        permissions,
      },
    });
  }),

  // GET /api/permissions - List all permissions
  http.get('/api/permissions', async () => {
    await delay(200);
    
    // Group permissions by category
    const categories = [...new Set(permissionsTable.map(p => p.category))];
    const grouped = categories.map(category => ({
      category,
      permissions: permissionsTable
        .filter(p => p.category === category)
        .map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          description: p.description,
        })),
    }));
    
    return HttpResponse.json({
      data: grouped,
      total: permissionsTable.length,
    });
  }),

  // POST /api/roles - Create role (placeholder)
  http.post('/api/roles', async ({ request }) => {
    await delay(300);
    const body = await request.json() as { name: string; description: string; permissions: string[] };
    
    return HttpResponse.json({
      data: {
        id: Math.max(...rolesTable.map(r => r.id)) + 1,
        name: body.name,
        description: body.description,
        isSystem: false,
        permissions: body.permissions,
      },
      message: 'Role created successfully',
    }, { status: 201 });
  }),

  // PUT /api/roles/:id - Update role (placeholder)
  http.put('/api/roles/:id', async ({ params, request }) => {
    await delay(300);
    
    const id = parseInt(params.id as string);
    const role = rolesTable.find(r => r.id === id);
    
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Partial<{ name: string; description: string; permissions: string[] }>;
    
    return HttpResponse.json({
      data: {
        id: role.id,
        name: body.name || role.name,
        description: body.description || role.description,
        isSystem: role.isSystemRole,
        permissions: body.permissions || [],
      },
      message: 'Role updated successfully',
    });
  }),

  // DELETE /api/roles/:id - Delete role (placeholder)
  http.delete('/api/roles/:id', async ({ params }) => {
    await delay(300);
    
    const id = parseInt(params.id as string);
    const role = rolesTable.find(r => r.id === id);
    
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found' },
        { status: 404 }
      );
    }
    
    if (role.isSystemRole) {
      return HttpResponse.json(
        { message: 'Cannot delete system role' },
        { status: 400 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),
];
