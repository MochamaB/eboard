# Module Implementation Blueprint

**Version:** 2.0  
**Last Updated:** February 2026  
**Purpose:** Comprehensive guide for implementing modules in the eBoard system based on actual architecture

**Based on**: Production Agenda Module Analysis

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
3. [Implementation Phases](#implementation-phases)
4. [Phase 1: Type Definitions](#phase-1-type-definitions)
5. [Phase 2: API Layer (Fetch-based)](#phase-2-api-layer)
6. [Phase 3: React Query Hooks](#phase-3-react-query-hooks)
7. [Phase 4: Mock Service Worker Setup](#phase-4-mock-service-worker-setup)
8. [Phase 5: Utility Functions (Optional)](#phase-5-utility-functions)
9. [Phase 6: Component Implementation](#phase-6-component-implementation)
10. [Phase 7: Page Integration](#phase-7-page-integration)
11. [Advanced Patterns](#advanced-patterns)
12. [Reference: Agenda Module](#reference-agenda-module)
13. [Checklist](#implementation-checklist)

---

## Overview

This blueprint documents the **actual architecture** used in the eBoard project. The system uses:

- **Frontend**: React 18 with TypeScript
- **Backend**: ASP.NET Core 8 Web API  
- **Database**: SQL Server
- **API Communication**: Native Fetch API (not Axios)
- **Response Format**: `ApiResponse<T>` wrapper with `success`, `data`, `message`
- **State Management**: React Query (TanStack Query)
- **Validation**: Zod schemas for runtime validation
- **Mock Development**: MSW (Mock Service Worker)
- **UI Framework**: Ant Design

### Core Principles

✅ **Type Safety First** - Zod schemas with TypeScript inference  
✅ **Fetch-Based API** - Native fetch with typed responses  
✅ **React Query Caching** - Automatic cache management with refetchQueries  
✅ **Mock-First Development** - Work without backend dependency  
✅ **Layered Architecture** - Clear separation of concerns  
✅ **Mode-Based Rendering** - Support view/edit/execute modes  
✅ **Hierarchical Data** - Parent-child relationships when needed  
✅ **Inline Editing** - Direct field editing without modals  

---

## Architecture Summary

### Layer Structure (Bottom to Top)

```
┌─────────────────────────────────────────────┐
│         Types & Schemas Layer               │
│  - Zod schemas for validation               │
│  - TypeScript types (inferred)              │
│  - Enums, Constants, Payloads               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Mock Data Layer                    │
│  - Tables (in-memory storage)               │
│  - Query Functions (CRUD)                   │
│  - Sample data & relationships              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         MSW Handlers Layer                  │
│  - http.get, http.post, etc.                │
│  - ApiResponse<T> formatting                │
│  - Request interception                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            API Layer                        │
│  - Fetch-based calls                        │
│  - Content-type validation                  │
│  - ApiResponse<T> parsing                   │
│  - Error handling                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       React Query Hooks Layer               │
│  - Query hooks (useEntity)                  │
│  - Mutation hooks (useCreateEntity)         │
│  - Query keys management                    │
│  - refetchQueries on mutations              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Utility Functions Layer                │
│  - Hierarchy (parent-child logic)           │
│  - Time calculations                        │
│  - Data transformations                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     Reusable Components Layer               │
│  - Domain components (ItemCard, Header)     │
│  - Common components (DataTable, Badge)     │
│  - UI utilities                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           UI/Page Layer                     │
│  - Tab Containers (routing, mode logic)     │
│  - View Components (orchestrator)           │
│  - Display Components (UI rendering)        │
│  - Modals/Forms                             │
└─────────────────────────────────────────────┘
```

### Implementation Order

**Always implement from bottom to top:**

1. Types & Schemas → Define data structure  
2. Mock Data → Create sample entities  
3. MSW Handlers → Intercept API calls  
4. API Functions → Define fetch-based calls  
5. React Query Hooks → State management  
6. Utility Functions → Complex logic (if needed)  
7. Reusable Components → UI building blocks  
8. Pages/Views → User-facing interfaces  

---

## Implementation Phases

*See detailed sections below for each phase.*

---

## Phase 1: Type Definitions

**File**: `src/types/{module}.types.ts`

**Refer to**: `@c:\Dev\eboard\src\types\agenda.types.ts` (280 lines)

### What to Include

- Enum schemas (status, type, etc.)
- Nested/child schemas (for hierarchical data)
- Main entity schema
- Template schemas (if applicable)
- API payload schemas (Create, Update, Delete)
- Type exports (z.infer)
- Constants (labels, colors, icons)

### Key Pattern: Hierarchical Data Support

For parent-child relationships:

```typescript
export const EntityItemSchema = z.object({
  id: z.string(),
  parentItemId: z.string().nullable().optional(), // Parent reference
  orderIndex: z.number(),                         // Sibling order
  itemNumber: z.string(),                         // Auto: "1", "1.1", "2"
  // ... other fields
});
```

---

## Phase 2: API Layer

**File**: `src/api/{module}.api.ts`

**Refer to**: `@c:\Dev\eboard\src\api\agenda.api.ts` (322 lines)

### Critical Architecture Points

🔑 **Use native `fetch`** (NOT Axios)  
🔑 **ApiResponse<T> wrapper**: `{ success: boolean; data?: T; message?: string }`  
🔑 **Content-Type validation** before JSON parsing  
🔑 **Error handling** with proper messages  

### Example Pattern

```typescript
const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function getEntity(id: string): Promise<Entity> {
  const response = await fetch(`${API_BASE}/entities/${id}`);
  
  // Validate content-type
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Entity not found');
  }

  const result: ApiResponse<Entity> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch entity');
  }

  return result.data!;
}
```

---

## Phase 3: React Query Hooks

**File**: `src/hooks/api/use{Module}.ts`

**Refer to**: `@c:\Dev\eboard\src\hooks\api\useAgenda.ts` (363 lines)

### Critical Patterns

🔑 **Query Keys Factory** at top  
🔑 **refetchQueries** instead of just invalidateQueries  
🔑 **Preserve user's onSuccess** callback  

### Example Pattern

```typescript
export const entityKeys = {
  all: ['entities'] as const,
  byId: (id: string) => [...entityKeys.all, 'detail', id] as const,
};

export const useCreateEntity = (options?) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload) => api.createEntity(payload),
    onSuccess: async (...args) => {
      // Refetch (not just invalidate)
      await queryClient.refetchQueries({ queryKey: entityKeys.byId(id) });
      
      // Call user's callback
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};
```

---

## Phase 4: Mock Service Worker Setup

**Files**: 
- `src/mocks/db/tables/{entities}.ts`
- `src/mocks/db/queries/{module}Queries.ts`
- `src/mocks/handlers/{module}.handlers.ts`

**Refer to**: Agenda module mock structure

### MSW Handler Pattern

```typescript
import { http, HttpResponse } from 'msw';

export const entityHandlers = [
  http.get('/api/entities/:id', ({ params }) => {
    const entity = getEntityById(params.id as string);
    
    if (!entity) {
      return HttpResponse.json(
        { success: false, message: 'Entity not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: entity,
    });
  }),
];
```

---

## Phase 5: Utility Functions

**When needed**: Hierarchical data, time calculations, complex transformations

**Files**: `src/utils/{module}*.ts`

**Refer to**: 
- `@c:\Dev\eboard\src\utils\agendaHierarchy.ts` (336 lines)
- `@c:\Dev\eboard\src\utils\agendaTimeManagement.ts`

### Common Utilities

- `generateHierarchicalNumber()` - Create "1", "1.1", "1.2" numbering
- `getChildItems()` - Get direct children
- `getDescendants()` - Get all descendants (recursive)
- `getItemDepth()` - Calculate nesting level
- `hasChildren()` - Check for child items
- `getDepthStyles()` - Visual styling by depth
- `calculateTotalDuration()` - Sum durations
- `formatDuration()` - Display as "2h 30m"

---

## Phase 6: Component Implementation

### Component Hierarchy

```
Page Container → View Component → Display Component → Reusable Components
```

**Refer to Agenda Module**:
1. `MeetingAgendaTab.tsx` - Page container (133 lines)
2. `AgendaView.tsx` - Orchestrator (391 lines)
3. `AgendaAccordionView.tsx` - Display logic (491 lines)
4. `AgendaItemCard.tsx` - Reusable card

### Key Patterns

- **Mode-based rendering**: `'edit' | 'view' | 'execute'`
- **Empty state**: Multiple creation options
- **Inline editing**: `InlineEditableField` component
- **Nested accordions**: For hierarchical data
- **Action callbacks**: Passed down from container

---

## Phase 7: Page Integration

1. Register routes
2. Add to navigation
3. Test CRUD operations
4. Verify cache updates
5. Test mode transitions

---

## Advanced Patterns

### 1. Hierarchical Data Management

See `agendaHierarchy.ts` for complete implementation patterns.

### 2. Mode-Based Rendering

```typescript
const getViewMode = (): 'edit' | 'view' | 'execute' => {
  if (status === 'completed') return 'view';
  if (status === 'in_progress') return 'execute';
  return 'edit';
};
```

### 3. Inline Editing

Use `InlineEditableField` component for direct editing without modals.

### 4. Publishing Workflow

- Draft → Published → Archived
- Version tracking
- Prevent editing published items

---

## Reference: Agenda Module

**Complete file structure**:

```
src/
├── types/agenda.types.ts (280 lines)
├── api/agenda.api.ts (322 lines)
├── hooks/api/useAgenda.ts (363 lines)
├── utils/
│   ├── agendaHierarchy.ts (336 lines)
│   └── agendaTimeManagement.ts
├── components/common/Agenda/
│   ├── AgendaHeader.tsx
│   ├── AgendaItemCard.tsx
│   ├── AgendaStatusBadge.tsx
│   ├── AgendaEmptyState.tsx
│   ├── ItemNumberBadge.tsx
│   └── ItemTypeTag.tsx
├── pages/Meetings/
│   ├── tabs/MeetingAgendaTab.tsx (133 lines)
│   └── agenda/components/
│       ├── AgendaView.tsx (391 lines)
│       ├── AgendaAccordionView.tsx (491 lines)
│       ├── AgendaItemModal.tsx
│       └── AgendaItemDocuments.tsx
└── mocks/
    ├── db/tables/ (agendas, agendaItems, agendaTemplates)
    ├── db/queries/agendaQueries.ts
    └── handlers/agenda.handlers.ts
```

Study this module for advanced patterns.

---

## Implementation Checklist

### Foundation
- [ ] Types with Zod schemas
- [ ] Fetch-based API functions
- [ ] React Query hooks with refetchQueries
- [ ] Mock data tables
- [ ] MSW handlers with ApiResponse format

### Components
- [ ] Reusable domain components
- [ ] Page container with mode logic
- [ ] View orchestrator component
- [ ] Display component with rendering
- [ ] Modals/forms for creation

### Integration
- [ ] Routes registered
- [ ] Navigation updated
- [ ] CRUD operations tested
- [ ] Cache invalidation verified
- [ ] Mode transitions working

### Advanced (if needed)
- [ ] Utility functions for complex logic
- [ ] Hierarchical data support
- [ ] Inline editing implemented
- [ ] Publishing workflow
- [ ] Empty state with options

---

**Document Version**: 2.0  
**Last Verified**: February 2026  
**Reference Implementation**: Agenda Module

