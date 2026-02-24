# Frontend to Backend Transition Guide

## Frontend Architecture

```
src/
├── types/          → Zod schemas + TypeScript types (contracts)
├── api/            → HTTP client functions (fetch/axios calls)
├── hooks/api/      → React Query wrappers (caching, state)
├── contexts/       → Global state (auth, board, theme)
├── mocks/          → MSW handlers + fake data (to be removed)
├── pages/          → Route components (consume hooks)
└── components/     → UI components (receive data via props)
```

---

## Data Flow

```
Backend API
    ↓
src/api/*.api.ts          → Raw HTTP calls, returns unknown
    ↓
src/types/*.types.ts      → Zod parse/validate response
    ↓
src/hooks/api/use*.ts     → React Query (cache, loading, error)
    ↓
src/pages/*               → useXxx() hooks, pass to components
    ↓
src/components/*          → Display typed data
```

---

## Layer Responsibilities

### `types/*.types.ts`
**Purpose**: Define contracts between frontend and backend

| Contains | Example |
|----------|---------|
| Zod schemas | `MeetingSchema`, `UserSchema` |
| Inferred types | `type Meeting = z.infer<typeof MeetingSchema>` |
| Request payloads | `CreateMeetingPayload`, `UpdateUserPayload` |
| Response types | `PaginatedResponse<T>`, `ApiResponse<T>` |
| Enums (fixed values) | `MeetingStatus`, `RSVPStatus` |
| Label constants | `MEETING_STATUS_LABELS` (keep for UI) |

**Transition Rule**: Zod schemas must match backend DTOs exactly. When backend changes, update schema first.

---

### `api/*.api.ts`
**Purpose**: HTTP layer - fetch data, return typed responses

```typescript
// Pattern
export const meetingsApi = {
  getAll: (boardId: number, params?: MeetingFilterParams) =>
    client.get<PaginatedResponse<Meeting>>(`/boards/${boardId}/meetings`, params),

  getById: (boardId: number, id: number) =>
    client.get<Meeting>(`/boards/${boardId}/meetings/${id}`),

  create: (boardId: number, payload: CreateMeetingPayload) =>
    client.post<Meeting>(`/boards/${boardId}/meetings`, payload),
};
```

**Transition Rule**:
- Remove mock imports
- Point to real endpoints
- Return type must match Zod schema

---

### `hooks/api/use*.ts`
**Purpose**: React Query wrappers - caching, loading states, mutations

```typescript
// Query (GET)
export const useMeetings = (boardId: number, params?: MeetingFilterParams) => {
  return useQuery({
    queryKey: ['meetings', boardId, params],
    queryFn: () => meetingsApi.getAll(boardId, params),
    enabled: !!boardId,
  });
};

// Mutation (POST/PUT/DELETE)
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, payload }) => meetingsApi.create(boardId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meetings'] }),
  });
};
```

**Transition Rule**: No changes needed if api layer is correct.

---

### `mocks/`
**Purpose**: MSW handlers for development (REMOVE when backend ready)

**Transition Rule**:
1. Set `VITE_ENABLE_MOCKING=false` in `.env`
2. Delete `mocks/` folder when fully migrated
3. Keep seed data scripts if needed for backend seeding

---

## ID Type Transition

| Before (Mock) | After (Backend) |
|---------------|-----------------|
| `id: string` | `id: number` |
| `boardId: string` | `boardId: number` |
| `meetingId: string` | `meetingId: number` |

**URL params remain strings** - parse in components:
```typescript
const { meetingId } = useParams();
const numericId = meetingId ? Number(meetingId) : 0;
const { data } = useMeeting(numericId);
```

---

## Lookup Tables vs Enums

| Backend Lookups (configurable) | Backend Enums (fixed) |
|--------------------------------|----------------------|
| MeetingType (regular, special) | MeetingStatus (draft, scheduled) |
| DocumentCategory | RSVPStatus |
| AgendaItemType | AttendanceStatus |
| VotingThreshold | LocationType |

**Rule**:
- Lookups → Fetch from `/api/lookups/*`, store in context
- Enums → Keep as Zod schemas, match backend exactly

---

## Transition Checklist

### Per Entity (Meeting, User, Board, etc.)

1. **Types** (`src/types/{entity}.types.ts`)
   - [ ] Zod schema matches backend DTO
   - [ ] IDs are `z.number()`
   - [ ] Foreign keys use correct types
   - [ ] Remove mock-specific fields

2. **API** (`src/api/{entity}.api.ts`)
   - [ ] Endpoints match backend routes
   - [ ] Request payloads match backend expectations
   - [ ] Response parsing uses Zod `.parse()` or `.safeParse()`

3. **Hooks** (`src/hooks/api/use{Entity}.ts`)
   - [ ] Query keys are consistent
   - [ ] Enabled conditions are correct
   - [ ] Mutations invalidate correct queries

4. **Pages/Components**
   - [ ] URL params parsed to numbers
   - [ ] Navigation uses `routePrefix` (slug, not id)
   - [ ] API calls use numeric IDs

---

## Quick Reference

```typescript
// ✅ Correct patterns
const { data } = useMeeting(Number(meetingId));           // Parse URL param
navigate(`/${routePrefix}/meetings/${meeting.id}`);       // Use slug for URL
meetingsApi.create(boardId, payload);                     // Use number for API

// ❌ Wrong patterns
const { data } = useMeeting(meetingId);                   // String to number API
navigate(`/${currentBoard.id}/meetings`);                 // Number in URL
meetingsApi.create(String(boardId), payload);             // String to number API
```
