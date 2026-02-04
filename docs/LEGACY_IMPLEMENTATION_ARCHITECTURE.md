# Module Implementation Blueprint

**Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Comprehensive guide for implementing a complete module in the eboard system from foundation to UI

---

## Table of Contents

1. [Overview](#overview)
2. [General Implementation Method](#general-implementation-method)
3. [Phase 1: Foundation Layer](#phase-1-foundation-layer)
4. [Phase 2: Mock Service Worker (MSW) Setup](#phase-2-mock-service-worker-msw-setup)
5. [Phase 3: Reusable Components](#phase-3-reusable-components)
6. [Phase 4: Page Implementation](#phase-4-page-implementation)
7. [Phase 5: Testing & Verification](#phase-5-testing--verification)
8. [Example: User Management Module](#example-user-management-module)
9. [Checklist](#checklist)

---

## Overview

This document provides a systematic approach to implementing a complete module in the eboard system. Each module follows a layered architecture that ensures:

- **Type Safety**: Zod schemas with TypeScript type inference
- **API Integration**: Axios-based API client with error handling
- **State Management**: React Query for server state
- **Mock Development**: MSW for development without backend dependency
- **Reusability**: Shared components and patterns
- **Maintainability**: Clear separation of concerns

---

## General Implementation Method

### Architecture Layers (Bottom-Up)

```
┌─────────────────────────────────────────┐
│         UI Layer (Pages/Views)          │
│  - Index Pages (List/Table views)      │
│  - Detail Pages (View/Edit)            │
│  - Create/Wizard Pages                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Reusable Components Layer          │
│  - DataTable, FilterBar, WizardForm    │
│  - Domain-specific components           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         React Query Hooks Layer         │
│  - useEntity, useEntities               │
│  - useCreateEntity, useUpdateEntity     │
│  - Custom hooks for specific operations │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           API Functions Layer           │
│  - CRUD operations                      │
│  - Specialized endpoints                │
│  - Request/Response handling            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         MSW Handlers Layer              │
│  - Mock API responses                   │
│  - Request interception                 │
│  - Mock data management                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Mock Data Layer                │
│  - Sample entities                      │
│  - Helper functions                     │
│  - Data relationships                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Types & Schemas Layer           │
│  - Zod schemas for validation           │
│  - TypeScript types (inferred)          │
│  - Filter/Query parameter types         │
└─────────────────────────────────────────┘
```

### Implementation Order

**Always implement from bottom to top:**

1. **Types & Schemas** → Define the data structure
2. **Mock Data** → Create sample data
3. **MSW Handlers** → Mock API responses
4. **API Functions** → Define API calls
5. **React Query Hooks** → State management
6. **Reusable Components** → UI building blocks
7. **Pages/Views** → User-facing interfaces

---

## Phase 1: Foundation Layer

### Step 1.1: Define Types & Schemas

**Location:** `src/types/{module}.types.ts`

**Purpose:** Define all data structures, validation schemas, and TypeScript types for the module.

**Key Components:**

1. **Entity Schema** - Main data structure
2. **List Item Schema** - Simplified version for tables/lists
3. **Create Payload Schema** - Data for creating new entities
4. **Update Payload Schema** - Data for updating entities
5. **Filter Params Interface** - Query parameters for filtering
6. **Helper Functions** - Type guards, validators, etc.

**Example Structure:**

```typescript
/**
 * {Module} Types
 * Zod schemas and TypeScript types for {module} management
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const EntityStatusSchema = z.enum(['active', 'inactive', 'pending']);
export type EntityStatus = z.infer<typeof EntityStatusSchema>;

// ============================================================================
// MAIN ENTITY SCHEMA
// ============================================================================

export const EntitySchema = z.object({
  id: z.number(),
  name: z.string(),
  status: EntityStatusSchema,
  // ... other fields
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
});

export type Entity = z.infer<typeof EntitySchema>;

// ============================================================================
// LIST ITEM SCHEMA (for tables/lists)
// ============================================================================

export const EntityListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: EntityStatusSchema,
  // ... simplified fields
  createdAt: z.string(),
});

export type EntityListItem = z.infer<typeof EntityListItemSchema>;

// ============================================================================
// PAYLOAD SCHEMAS (for create/update)
// ============================================================================

export const CreateEntityPayloadSchema = EntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type CreateEntityPayload = z.infer<typeof CreateEntityPayloadSchema>;

export const UpdateEntityPayloadSchema = CreateEntityPayloadSchema.partial();
export type UpdateEntityPayload = z.infer<typeof UpdateEntityPayloadSchema>;

// ============================================================================
// FILTER PARAMS
// ============================================================================

export interface EntityFilterParams {
  search?: string;
  status?: EntityStatus;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const isActiveEntity = (entity: Entity): boolean => {
  return entity.status === 'active';
};
```

**Best Practices:**

- Use Zod for runtime validation and type inference
- Keep schemas DRY using `.omit()`, `.pick()`, `.partial()`
- Document complex fields with JSDoc comments
- Export both schemas and inferred types
- Group related schemas with clear section headers

### Step 1.2: Create API Client Configuration

**Location:** `src/api/client.ts` (shared across modules)

**Purpose:** Configure Axios instance with interceptors for authentication and error handling.

**Key Features:**

- Base URL configuration
- Request interceptor for auth tokens
- Response interceptor for error handling
- Token refresh logic

### Step 1.3: Define API Functions

**Location:** `src/api/{module}.api.ts`

**Purpose:** Define all API calls for the module with proper typing and validation.

**Standard CRUD Operations:**

```typescript
/**
 * {Module} API
 * API functions for {module} management
 */

import apiClient from './client';
import { z } from 'zod';
import {
  EntitySchema,
  EntityListItemSchema,
  CreateEntityPayloadSchema,
  UpdateEntityPayloadSchema,
  type Entity,
  type EntityListItem,
  type CreateEntityPayload,
  type UpdateEntityPayload,
  type EntityFilterParams,
} from '../types/{module}.types';
import type { PaginatedResponse } from '../types/api.types';

// Response schemas
const EntitiesListResponseSchema = z.object({
  data: z.array(EntityListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const entitiesApi = {
  /**
   * Get paginated list of entities
   */
  getEntities: async (params?: EntityFilterParams): Promise<PaginatedResponse<EntityListItem>> => {
    const response = await apiClient.get('/entities', { params });
    return EntitiesListResponseSchema.parse(response.data);
  },

  /**
   * Get single entity by ID
   */
  getEntity: async (id: number): Promise<Entity> => {
    const response = await apiClient.get(`/entities/${id}`);
    return EntitySchema.parse(response.data);
  },

  /**
   * Create new entity
   */
  createEntity: async (payload: CreateEntityPayload): Promise<Entity> => {
    const validatedPayload = CreateEntityPayloadSchema.parse(payload);
    const response = await apiClient.post('/entities', validatedPayload);
    return EntitySchema.parse(response.data);
  },

  /**
   * Update existing entity
   */
  updateEntity: async (id: number, payload: UpdateEntityPayload): Promise<Entity> => {
    const validatedPayload = UpdateEntityPayloadSchema.parse(payload);
    const response = await apiClient.put(`/entities/${id}`, validatedPayload);
    return EntitySchema.parse(response.data);
  },

  /**
   * Delete entity (soft delete)
   */
  deleteEntity: async (id: number): Promise<void> => {
    await apiClient.delete(`/entities/${id}`);
  },

  // Add specialized endpoints as needed
};

export default entitiesApi;
```

**Best Practices:**

- Validate all payloads before sending
- Parse all responses with Zod schemas
- Use async/await consistently
- Document each function with JSDoc
- Group related operations together
- Export as named object for easier mocking

### Step 1.4: Create React Query Hooks

**Location:** `src/hooks/api/use{Module}.ts`

**Purpose:** Create React Query hooks for state management and caching.

**Standard Hooks:**

```typescript
/**
 * {Module} React Query Hooks
 * Hooks for {module} management operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesApi } from '../../api';
import type {
  Entity,
  EntityListItem,
  CreateEntityPayload,
  UpdateEntityPayload,
  EntityFilterParams,
} from '../../types';
import type { PaginatedResponse } from '../../types/api.types';

// Query keys
export const entityKeys = {
  all: ['entities'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (params?: EntityFilterParams) => [...entityKeys.lists(), params] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id: number) => [...entityKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of entities
 */
export const useEntities = (params?: EntityFilterParams) => {
  return useQuery<PaginatedResponse<EntityListItem>>({
    queryKey: entityKeys.list(params),
    queryFn: () => entitiesApi.getEntities(params),
  });
};

/**
 * Hook to fetch single entity by ID
 */
export const useEntity = (id: number) => {
  return useQuery<Entity>({
    queryKey: entityKeys.detail(id),
    queryFn: () => entitiesApi.getEntity(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new entity
 */
export const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEntityPayload) => entitiesApi.createEntity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing entity
 */
export const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEntityPayload }) =>
      entitiesApi.updateEntity(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(entityKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
};

/**
 * Hook to delete an entity
 */
export const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => entitiesApi.deleteEntity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
};
```

**Best Practices:**

- Define query keys at the top for consistency
- Use hierarchical query keys for better cache management
- Invalidate related queries on mutations
- Use `enabled` option for conditional queries
- Document each hook's purpose
- Handle loading and error states in components

---

## Phase 2: Mock Service Worker (MSW) Setup

### Step 2.1: Create Mock Data

**Location:** `src/mocks/data/{module}.ts`

**Purpose:** Create realistic sample data for development and testing.

**Structure:**

```typescript
/**
 * Mock {Module} Data
 * Sample data for development and testing
 */

import type { Entity, EntityListItem } from '../../types';

// Sample entities
export const mockEntities: Entity[] = [
  {
    id: 1,
    name: 'Sample Entity 1',
    status: 'active',
    // ... other fields
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    createdBy: 'admin@ktda.co.ke',
  },
  {
    id: 2,
    name: 'Sample Entity 2',
    status: 'inactive',
    // ... other fields
    createdAt: '2024-03-20T00:00:00Z',
    updatedAt: '2026-01-19T10:15:00Z',
    createdBy: 'admin@ktda.co.ke',
  },
  // Add 10-20 realistic samples
];

// Convert to list items for table display
export const mockEntityListItems: EntityListItem[] = mockEntities.map(entity => ({
  id: entity.id,
  name: entity.name,
  status: entity.status,
  // ... simplified fields
  createdAt: entity.createdAt,
}));

// Helper to get entity by ID
export const getEntityById = (id: number): Entity | undefined => {
  return mockEntities.find(entity => entity.id === id);
};

// Helper to get entity by name
export const getEntityByName = (name: string): Entity | undefined => {
  return mockEntities.find(entity => entity.name.toLowerCase() === name.toLowerCase());
};
```

**Best Practices:**

- Create 10-20 realistic samples with varied data
- Include edge cases (empty fields, long text, special characters)
- Use realistic dates (recent past to present)
- Include relationships to other entities
- Provide helper functions for common lookups
- Document any special data patterns

### Step 2.2: Create MSW Handlers

**Location:** `src/mocks/handlers/{module}.handlers.ts`

**Purpose:** Intercept API calls and return mock data during development.

**Structure:**

```typescript
/**
 * Mock {Module} Handlers
 * MSW handlers for {module} API endpoints
 */

import { http, HttpResponse } from 'msw';
import { mockEntities, mockEntityListItems, getEntityById } from '../data/{module}';
import type { EntityFilterParams } from '../../types/{module}.types';

const BASE_URL = '/api';

export const entityHandlers = [
  // GET /api/entities - List with filtering, pagination, sorting
  http.get(`${BASE_URL}/entities`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const sortField = url.searchParams.get('sortField') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'descend';

    // Filter entities
    let filteredEntities = [...mockEntityListItems];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEntities = filteredEntities.filter(entity =>
        entity.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status) {
      filteredEntities = filteredEntities.filter(entity => entity.status === status);
    }

    // Apply sorting
    filteredEntities.sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortOrder === 'ascend' ? comparison : -comparison;
    });

    // Apply pagination
    const total = filteredEntities.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEntities = filteredEntities.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedEntities,
      total,
      page,
      pageSize,
      totalPages,
    });
  }),

  // GET /api/entities/:id - Get single entity
  http.get(`${BASE_URL}/entities/:id`, ({ params }) => {
    const id = parseInt(params.id as string);
    const entity = getEntityById(id);

    if (!entity) {
      return HttpResponse.json(
        { message: 'Entity not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(entity);
  }),

  // POST /api/entities - Create new entity
  http.post(`${BASE_URL}/entities`, async ({ request }) => {
    const payload = await request.json();
    
    const newEntity = {
      id: mockEntities.length + 1,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user@ktda.co.ke',
    };

    mockEntities.push(newEntity);

    return HttpResponse.json(newEntity, { status: 201 });
  }),

  // PUT /api/entities/:id - Update entity
  http.put(`${BASE_URL}/entities/:id`, async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const payload = await request.json();
    const entityIndex = mockEntities.findIndex(e => e.id === id);

    if (entityIndex === -1) {
      return HttpResponse.json(
        { message: 'Entity not found' },
        { status: 404 }
      );
    }

    const updatedEntity = {
      ...mockEntities[entityIndex],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    mockEntities[entityIndex] = updatedEntity;

    return HttpResponse.json(updatedEntity);
  }),

  // DELETE /api/entities/:id - Delete entity
  http.delete(`${BASE_URL}/entities/:id`, ({ params }) => {
    const id = parseInt(params.id as string);
    const entityIndex = mockEntities.findIndex(e => e.id === id);

    if (entityIndex === -1) {
      return HttpResponse.json(
        { message: 'Entity not found' },
        { status: 404 }
      );
    }

    mockEntities.splice(entityIndex, 1);

    return HttpResponse.json({ message: 'Entity deleted successfully' });
  }),
];
```

**Best Practices:**

- Implement all CRUD operations
- Support filtering, pagination, and sorting
- Return proper HTTP status codes
- Handle error cases (404, 400, etc.)
- Mutate mock data for realistic behavior
- Add delays for realistic network simulation (optional)
- Document query parameters

### Step 2.3: Register Handlers

**Location:** `src/mocks/handlers/index.ts`

**Purpose:** Combine all handlers for MSW initialization.

```typescript
import { userHandlers } from './users.handlers';
import { roleHandlers } from './roles.handlers';
import { entityHandlers } from './{module}.handlers';
// ... other handlers

export const handlers = [
  ...userHandlers,
  ...roleHandlers,
  ...entityHandlers,
  // ... other handlers
];
```

---

## Phase 3: Reusable Components

### Step 3.1: Identify Common Patterns

Before creating pages, identify reusable components needed:

- **DataTable** - For list/index pages
- **FilterBar** - For filtering data
- **WizardForm** - For multi-step creation
- **DetailView** - For viewing entity details
- **StatusBadge** - For status indicators
- **ActionButtons** - For common actions

### Step 3.2: Create/Extend Components

**Location:** `src/components/common/` or `src/components/{module}/`

**Decision Criteria:**

- **Common components** (`src/components/common/`) - Used across multiple modules
- **Module-specific components** (`src/components/{module}/`) - Domain-specific logic

---

## Phase 4: Page Implementation

### Step 4.1: Index/List Page

**Location:** `src/pages/{Module}/{Module}IndexPage.tsx`

**Purpose:** Display paginated, filterable, sortable list of entities.

**Key Features:**

- Integration with `useEntities` hook
- DataTable with columns configuration
- FilterBar for search and filters
- Bulk actions (if applicable)
- Navigation to detail/create pages
- Export functionality (if applicable)

**Structure:**

```typescript
/**
 * {Module} Index Page
 * Displays paginated list of entities with filtering and search
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DataTable, FilterBar } from '../../components/common';
import { useEntities, useDeleteEntity } from '../../hooks/api';
import { useOrgTheme } from '../../contexts';
import type { EntityListItem, EntityStatus } from '../../types';
import type { ColumnsType } from 'antd/es/table';

export const EntitiesIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrg } = useOrgTheme();
  
  // State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build filter params
  const filterParams = useMemo(() => ({
    search: searchValue || undefined,
    status: statusFilter !== 'all' ? (statusFilter as EntityStatus) : undefined,
    page,
    pageSize,
  }), [searchValue, statusFilter, page, pageSize]);

  // Fetch data
  const { data, isLoading, error } = useEntities(filterParams);
  const deleteEntity = useDeleteEntity();

  // Table columns
  const columns: ColumnsType<EntityListItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: EntityStatus) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    // ... other columns
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/${currentOrg.id}/entities/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleDelete = async (id: number) => {
    try {
      await deleteEntity.mutateAsync(id);
      message.success('Entity deleted successfully');
    } catch (error) {
      message.error('Failed to delete entity');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Entities</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${currentOrg.id}/entities/create`)}
        >
          Create Entity
        </Button>
      </div>

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
        onSearch={setSearchValue}
        onReset={() => {
          setStatusFilter('all');
          setSearchValue('');
        }}
      />

      <DataTable
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize || 20);
          },
        }}
        rowKey="id"
      />
    </div>
  );
};
```

### Step 4.2: Create/Wizard Page

**Location:** `src/pages/{Module}/Create{Module}Page.tsx`

**Purpose:** Multi-step form for creating new entities.

**Key Features:**

- WizardForm component integration
- Step-by-step data collection
- Validation at each step
- Integration with `useCreateEntity` hook
- Success/error handling
- Navigation after creation

### Step 4.3: Detail/Edit Page

**Location:** `src/pages/{Module}/{Module}DetailPage.tsx`

**Purpose:** View and edit entity details.

**Key Features:**

- Fetch entity with `useEntity` hook
- Display entity information
- Edit mode toggle
- Integration with `useUpdateEntity` hook
- Related data display
- Action buttons (delete, archive, etc.)

### Step 4.4: Register Routes

**Location:** `src/routes/index.tsx`

**Purpose:** Add routes for all module pages.

```typescript
// In routes configuration
{
  path: 'entities',
  element: <EntitiesIndexPage />,
},
{
  path: 'entities/create',
  element: <CreateEntityPage />,
},
{
  path: 'entities/:id',
  element: <EntityDetailPage />,
},
{
  path: 'entities/:id/edit',
  element: <EntityDetailPage />,
},
```

---

## Phase 5: Testing & Verification

### Step 5.1: Manual Testing Checklist

- [ ] Index page loads with mock data
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Pagination works
- [ ] Sorting works (if implemented)
- [ ] Create page opens and validates
- [ ] Entity creation succeeds
- [ ] Detail page displays entity
- [ ] Edit functionality works
- [ ] Delete functionality works
- [ ] Error states display properly
- [ ] Loading states display properly

### Step 5.2: Integration Testing

- [ ] Navigation between pages works
- [ ] Query cache updates after mutations
- [ ] Filters persist on navigation (if applicable)
- [ ] Organization context filtering works
- [ ] Permissions are respected (if applicable)

---

## Example: User Management Module

### Complete File Structure

```
src/
├── types/
│   └── user.types.ts              # Zod schemas & TypeScript types
├── api/
│   ├── client.ts                  # Shared Axios instance
│   └── users.api.ts               # User API functions
├── hooks/
│   └── api/
│       └── useUsers.ts            # React Query hooks
├── mocks/
│   ├── data/
│   │   └── users.ts               # Mock user data
│   └── handlers/
│       ├── users.handlers.ts      # MSW handlers
│       └── index.ts               # Combined handlers
├── components/
│   └── common/
│       ├── DataTable/
│       ├── FilterBar/
│       └── WizardForm/
├── pages/
│   └── Users/
│       ├── UsersIndexPage.tsx     # List page
│       ├── CreateUserPage.tsx     # Create wizard
│       ├── UserDetailPage.tsx     # Detail/Edit page
│       └── index.ts               # Exports
└── routes/
    └── index.tsx                  # Route configuration
```

### Implementation Timeline

**Phase 1: Foundation (Day 1)**
- ✅ Created `user.types.ts` with all schemas
- ✅ Created `users.api.ts` with CRUD operations
- ✅ Created `useUsers.ts` with React Query hooks

**Phase 2: MSW Setup (Day 1)**
- ✅ Created `users.ts` mock data (17 users)
- ✅ Created `users.handlers.ts` with all endpoints
- ✅ Registered handlers in MSW

**Phase 3: Components (Day 2)**
- ✅ Created `DataTable` component
- ✅ Created `FilterBar` component
- ✅ Created `WizardForm` component

**Phase 4: Pages (Day 2-3)**
- ✅ Created `UsersIndexPage` with filtering
- ⏳ Create `CreateUserPage` with wizard
- ⏳ Create `UserDetailPage` with edit

### Key Implementation Details

#### 1. Types & Schemas (`user.types.ts`)

```typescript
// System roles enum
export const SystemRoleSchema = z.enum([
  'system_admin',
  'board_secretary',
  'chairman',
  'vice_chairman',
  'board_member',
  'committee_member',
  'executive_member',
  'observer',
  'guest',
]);

// User status enum
export const UserStatusSchema = z.enum(['active', 'inactive', 'pending']);

// Board membership schema
export const BoardMembershipSchema = z.object({
  id: z.number(),
  boardId: z.string(),
  boardName: z.string(),
  boardType: z.enum(['main', 'subsidiary', 'committee', 'factory']),
  role: z.enum(['chairman', 'vice_chairman', 'secretary', 'member', 'observer']),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isActive: z.boolean(),
});

// Main user schema
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  employeeId: z.string().nullable(),
  avatar: z.string().nullable(),
  timezone: z.string(),
  primaryRole: SystemRoleSchema,
  status: UserStatusSchema,
  mfaEnabled: z.boolean(),
  mfaSetupComplete: z.boolean(),
  hasCertificate: z.boolean(),
  certificateExpiry: z.string().nullable(),
  boardMemberships: z.array(BoardMembershipSchema),
  lastLogin: z.string().nullable(),
  lastPasswordChange: z.string().nullable(),
  failedLoginAttempts: z.number(),
  lockedUntil: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
});

// Filter params
export interface UserFilterParams {
  search?: string;
  status?: UserStatus;
  role?: string;
  boardId?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}
```

#### 2. Mock Data (`users.ts`)

Created 17 realistic users:
- 1 Board Chairman (Chege Kirundi)
- 1 Vice Chairman (James Ombasa)
- 1 Acting CEO (Eng Francis Miano)
- 12 Board Member Directors (representing different zones)
- 1 Company Secretary (Mathews Odera Ogutu)
- 1 System Administrator

Each user has:
- Realistic names and emails
- Multiple board memberships
- Proper roles and statuses
- Recent login timestamps
- Varied MFA and certificate status

#### 3. MSW Handlers (`users.handlers.ts`)

Implemented handlers for:
- `GET /api/users` - List with filtering, pagination, sorting
- `GET /api/users/:id` - Single user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/check-email` - Email availability check
- `POST /api/users/bulk-deactivate` - Bulk deactivation
- `GET /api/users/:id/activities` - User activity log
- `POST /api/users/:id/resend-welcome` - Resend welcome email

Filtering logic:
- Search by name or email
- Filter by status
- Filter by role
- **Filter by boardId** (checks board memberships)
- Pagination support
- Sorting support

#### 4. Users Index Page (`UsersIndexPage.tsx`)

Key features implemented:
- **Organization Context Integration**: Filters users by current org/committee
- **Dynamic Board Filtering**: 
  - `/ktda-main/users` → Shows KTDA Main Board members
  - `/ketepa/users` → Shows KETEPA members
  - `/ktda-main/users?committee=audit` → Shows Audit Committee members
- **Search**: By name or email
- **Status Filter**: All, Active, Inactive, Pending
- **Role Filter**: All system roles
- **Pagination**: 20 items per page
- **Actions**: View, Edit, Delete
- **Bulk Actions**: Deactivate, Send Email
- **Export**: CSV, Excel

Critical bug fix:
```typescript
// Fixed committee filter logic to handle 'all' and 'board' as non-filtering values
const effectiveBoardId = useMemo(() => {
  if (boardFilter) return boardFilter;
  // Fixed: Check for both 'all' and 'board'
  if (activeCommittee && activeCommittee !== 'all' && activeCommittee !== 'board') {
    return activeCommittee;
  }
  if (currentOrg && currentOrg.type !== 'group') return currentOrg.id;
  return undefined;
}, [boardFilter, activeCommittee, currentOrg]);
```

---

## Checklist

### Foundation Layer
- [ ] Types & schemas defined in `src/types/{module}.types.ts`
- [ ] All enums and interfaces documented
- [ ] Zod schemas for validation
- [ ] TypeScript types inferred from schemas
- [ ] Filter params interface defined
- [ ] Helper functions created

### API Layer
- [ ] API functions in `src/api/{module}.api.ts`
- [ ] All CRUD operations implemented
- [ ] Request payload validation
- [ ] Response parsing with Zod
- [ ] Error handling
- [ ] Specialized endpoints (if needed)

### React Query Layer
- [ ] Hooks in `src/hooks/api/use{Module}.ts`
- [ ] Query keys defined
- [ ] List hook with filtering
- [ ] Detail hook with ID
- [ ] Create mutation with cache invalidation
- [ ] Update mutation with cache update
- [ ] Delete mutation with cache invalidation
- [ ] Specialized hooks (if needed)

### Mock Data Layer
- [ ] Mock data in `src/mocks/data/{module}.ts`
- [ ] 10-20 realistic samples
- [ ] Helper functions for lookups
- [ ] Relationships to other entities
- [ ] Edge cases included

### MSW Layer
- [ ] Handlers in `src/mocks/handlers/{module}.handlers.ts`
- [ ] GET list with filtering, pagination, sorting
- [ ] GET single by ID
- [ ] POST create
- [ ] PUT update
- [ ] DELETE delete
- [ ] Specialized endpoints
- [ ] Error cases handled
- [ ] Handlers registered in `index.ts`

### Component Layer
- [ ] Reusable components identified
- [ ] Components created/extended
- [ ] Props interfaces defined
- [ ] Component documentation

### Page Layer
- [ ] Index page created
- [ ] Create/wizard page created
- [ ] Detail/edit page created
- [ ] Routes registered
- [ ] Navigation working
- [ ] Organization context integration (if applicable)

### Testing & Verification
- [ ] Manual testing completed
- [ ] All CRUD operations work
- [ ] Filtering works
- [ ] Pagination works
- [ ] Sorting works
- [ ] Error states display
- [ ] Loading states display
- [ ] Integration between pages works

---

## Best Practices Summary

### 1. Type Safety
- Always use Zod for runtime validation
- Infer TypeScript types from Zod schemas
- Validate all API payloads and responses
- Use strict TypeScript configuration

### 2. Code Organization
- Follow the layered architecture
- Keep files focused and single-purpose
- Use consistent naming conventions
- Group related functionality

### 3. State Management
- Use React Query for server state
- Define clear query keys hierarchy
- Invalidate queries appropriately
- Handle loading and error states

### 4. Mock Development
- Create realistic mock data
- Implement all API endpoints
- Support filtering, pagination, sorting
- Handle error cases

### 5. Component Design
- Build reusable components first
- Keep components focused
- Use composition over inheritance
- Document props and usage

### 6. Testing
- Test each layer independently
- Verify integration between layers
- Test error scenarios
- Test edge cases

### 7. Documentation
- Document complex logic
- Add JSDoc comments to functions
- Keep this blueprint updated
- Document deviations from standard patterns

---

## Troubleshooting Common Issues

### Issue: Mock data not loading
**Solution:** Check MSW initialization in `main.tsx` and verify handlers are registered

### Issue: Filters not working
**Solution:** Verify filter params are passed correctly through the chain: Page → Hook → API → MSW

### Issue: Cache not updating after mutation
**Solution:** Check query key invalidation in mutation hooks

### Issue: TypeScript errors on Zod schemas
**Solution:** Ensure schemas are properly defined and types are inferred correctly

### Issue: Organization context not filtering
**Solution:** Verify `effectiveBoardId` logic and MSW handler filtering

---

## Next Steps

After completing a module:

1. **Code Review**: Review all files for consistency and best practices
2. **Documentation**: Update this blueprint with lessons learned
3. **Refactoring**: Extract common patterns into reusable utilities
4. **Testing**: Add unit and integration tests
5. **Backend Integration**: Replace MSW with real API calls
6. **Performance**: Optimize queries and caching strategies

---

**End of Blueprint**
