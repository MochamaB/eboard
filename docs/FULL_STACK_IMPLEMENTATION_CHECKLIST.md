# Full Stack Implementation Checklist

A systematic guide for implementing any entity/module from backend to frontend in the eBoard project.

---

## Overview: The Full Stack Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (ASP.NET Core)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. DOMAIN LAYER (eBoard.Domain)                                            │
│     └── Entities, Enums, Value Objects, Interfaces                         │
│                              ↓                                              │
│  2. INFRASTRUCTURE LAYER (eBoard.Infrastructure)                            │
│     └── DbContext, Configurations, Migrations, Seeders, Services           │
│                              ↓                                              │
│  3. APPLICATION LAYER (eBoard.Application)                                  │
│     └── DTOs, Interfaces, Validators                                       │
│                              ↓                                              │
│  4. API LAYER (eBoard.API)                                                  │
│     └── Controllers, Middleware, Program.cs registration                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                           FRONTEND (React + TypeScript)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  5. TYPES LAYER (src/types)                                                 │
│     └── Zod schemas, TypeScript types, Constants                           │
│                              ↓                                              │
│  6. API LAYER (src/api)                                                     │
│     └── HTTP client functions (axios calls)                                │
│                              ↓                                              │
│  7. HOOKS LAYER (src/hooks/api)                                             │
│     └── React Query wrappers (useQuery, useMutation)                       │
│                              ↓                                              │
│  8. UI LAYER (src/pages, src/components)                                    │
│     └── Pages, Components, Forms                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Backend - Domain Layer

**Project**: `eBoard.Domain`
**Location**: `eBoard.Domain/Entities/{EntityName}.cs`

### 1.1 Entity Checklist
- [ ] Entity inherits from `BaseEntity` (provides Id, CreatedAt, UpdatedAt)
- [ ] Implement `ISoftDeletable` if entity can be soft-deleted
- [ ] All foreign keys are `int` type
- [ ] Nullable properties use `?` (maps to optional in TypeScript)
- [ ] Navigation properties initialized with `= null!` or `= new List<T>()`
- [ ] XML comment references the frontend type it maps to

### 1.2 Enum Checklist
**Location**: `eBoard.Domain/Enums/{EnumName}.cs`
- [ ] Enum values match frontend enum values (case-insensitive)
- [ ] Use PascalCase in C# (will be converted to lowercase in JSON)
- [ ] Document any special serialization needs

### 1.3 Value Object Checklist
**Location**: `eBoard.Domain/ValueObjects/{ValueObjectName}.cs`
- [ ] Value objects are immutable or have simple setters
- [ ] Will be stored as JSON in database (owned entity)
- [ ] Property names match frontend exactly (camelCase in JSON)

### 1.4 Lookup Entity Checklist
**Location**: `eBoard.Domain/LookupEntities/{LookupName}Lookup.cs`
- [ ] Inherit from `BaseLookupEntity`
- [ ] Use for configurable/dynamic data (not fixed enums)
- [ ] Will have a seeder to populate initial data

---

## Phase 2: Backend - Infrastructure Layer

**Project**: `eBoard.Infrastructure`

### 2.1 DbContext Checklist
**Location**: `eBoard.Infrastructure/Persistence/eBoardDbContext.cs`
- [ ] DbSet name is plural (Meetings, Users, Boards)
- [ ] Use `=> Set<T>()` pattern
- [ ] Group related entities together with comments

### 2.2 Entity Configuration Checklist
**Location**: `eBoard.Infrastructure/Persistence/Configurations/{EntityName}Configuration.cs`
- [ ] File named `{EntityName}Configuration.cs`
- [ ] Implements `IEntityTypeConfiguration<T>`
- [ ] All required properties marked with `.IsRequired()`
- [ ] String properties have `.HasMaxLength()`
- [ ] Enums converted to strings with `.HasConversion<string>()`
- [ ] Value objects use `.OwnsOne()` with `.ToJson()`
- [ ] All relationships defined with correct delete behavior
- [ ] Indexes added for frequently queried columns
- [ ] Soft delete filter applied if `ISoftDeletable`

### 2.3 Migration Checklist
**Commands**:
```bash
dotnet ef migrations add {MigrationName} --project eBoard.Infrastructure --startup-project eBoard.API
dotnet ef database update --project eBoard.Infrastructure --startup-project eBoard.API
```
- [ ] Migration name is descriptive (AddMeetingEntity, not Migration1)
- [ ] Review generated migration file before applying
- [ ] Check for unintended changes to other tables
- [ ] Test migration can be rolled back

### 2.4 Seeder Checklist
**Location**: `eBoard.Infrastructure/Persistence/Seeders/{EntityName}Seeder.cs`
- [ ] Seeder is idempotent (checks if data exists before seeding)
- [ ] Uses `Code` as business key (not Id)
- [ ] Seeder registered in Program.cs
- [ ] Runs after migrations

### 2.5 Service Checklist
**Location**: `eBoard.Infrastructure/Services/{ServiceName}.cs`
- [ ] Service implements interface from Application layer
- [ ] Uses constructor injection for dependencies
- [ ] Registered in DI container
- [ ] Uses `Scoped` lifetime for database-dependent services

---

## Phase 3: Backend - Application Layer

**Project**: `eBoard.Application`

### 3.1 DTO Checklist
**Location**: `eBoard.Application/{Module}/DTOs/{DtoName}.cs`

**List DTO** (lightweight, for tables):
- [ ] Contains only essential fields for display
- [ ] No nested collections
- [ ] Includes computed fields (counts, status labels)

**Detail DTO** (full object):
- [ ] Contains all entity fields
- [ ] Includes nested related objects
- [ ] Contains display names for lookups (e.g., `TypeName` alongside `Type`)

**Request DTO** (for POST/PUT):
- [ ] All fields optional for updates (PATCH-like)
- [ ] Validation attributes where needed
- [ ] Uses lookup codes (strings) not IDs for configurable data

**General DTO Rules**:
- [ ] DTO property names use camelCase (JSON serialization)
- [ ] Enums serialized as lowercase strings
- [ ] Dates formatted as strings ("YYYY-MM-DD", ISO format)
- [ ] Times formatted as strings ("h:mm tt" for display, "HH:mm" for input)
- [ ] Nullable properties use `?`
- [ ] Collections initialized to empty lists

### 3.2 Service Interface Checklist
**Location**: `eBoard.Application/{Module}/I{ServiceName}.cs`
- [ ] Interface in Application layer
- [ ] Implementation in Infrastructure layer
- [ ] Result types defined for complex operations
- [ ] Methods return Task for async operations

---

## Phase 4: Backend - API Layer

**Project**: `eBoard.API`

### 4.1 Controller Checklist
**Location**: `eBoard.API/Controllers/{EntityName}sController.cs`
- [ ] Controller has `[ApiController]` and `[Authorize]` attributes
- [ ] Each endpoint has `[Authorize(Policy = "permission.action")]`
- [ ] Route follows pattern: `api/{entity}s` or `api/{parent}/{parentId}/{entity}s`
- [ ] List endpoints use `[FromQuery]` for filter parameters
- [ ] Create/Update endpoints use `[FromBody]` for request body
- [ ] All responses wrapped in `ApiResponse<T>`
- [ ] Paginated responses use `PaginatedResponse<T>`
- [ ] Error responses return appropriate status codes
- [ ] `AsNoTracking()` used for read-only queries
- [ ] Proper `.Include()` for navigation properties
- [ ] **Enums converted to lowercase strings in DTOs using `.ToString().ToLower()`**
- [ ] **Use proper DTOs (not anonymous objects) for all responses**
- [ ] **Create/Update endpoints return full DTO (not just `{id, slug}`)**

### 4.2 Filter Parameters Checklist
**Location**: `eBoard.Application/{Module}/DTOs/{FilterParams}.cs`
- [ ] All filter fields are nullable/optional
- [ ] Defaults for pagination (Page=1, PageSize=20)
- [ ] Sort field and order support

### 4.3 Program.cs Registration
- [ ] Services registered with correct lifetime (Scoped for DB services)
- [ ] DbContext configured
- [ ] Authorization policies configured

---

## Phase 5: Frontend - Types Layer

**Location**: `src/types/{entity}.types.ts`

### 5.1 Zod Schema Checklist
- [ ] All IDs are `z.number()` (not `z.string()`)
- [ ] Nullable fields use `.nullable().optional()`
- [ ] Enum values are lowercase (match backend serialization)
- [ ] Schema property names match backend DTO exactly (camelCase)
- [ ] List schema is lightweight (no nested collections)
- [ ] Detail schema includes all fields
- [ ] Response schemas wrap data in expected structure
- [ ] Types exported using `z.infer<typeof Schema>`

### 5.2 Constants Checklist
- [ ] UI constants (labels, colors) defined for enums
- [ ] **Deprecated constants marked with `@deprecated` JSDoc**
- [ ] **Use `useLookups()` context for configurable data (see Lookups section)**

---

## Phase 6: Frontend - API Layer

**Location**: `src/api/{entity}.api.ts`

### 6.1 API Function Checklist
- [ ] All functions are `async` and return `Promise<T>`
- [ ] Use `apiClient` from `./client.ts`
- [ ] Use `safeParseResponse` for Zod validation
- [ ] Routes match backend exactly
- [ ] IDs are numbers (not strings)
- [ ] Request payloads typed correctly
- [ ] Return types match Zod schemas
- [ ] Descriptive function names

---

## Phase 7: Frontend - Hooks Layer

**Location**: `src/hooks/api/use{Entity}.ts`

### 7.1 React Query Hooks Checklist
- [ ] Query keys are centralized and consistent
- [ ] `enabled` option prevents unnecessary fetches
- [ ] `staleTime` configured appropriately
- [ ] Mutations invalidate related queries on success
- [ ] Cache updates use `setQueryData` when possible
- [ ] Mutation variables typed correctly
- [ ] Export individual hooks (not default export)

---

## Phase 8: Frontend - UI Layer

**Location**: `src/pages/`, `src/components/`

### 8.1 Page/Component Checklist
- [ ] Parse URL params to numbers: `Number(useParams().id)`
- [ ] Use hooks from `hooks/api/` layer
- [ ] Use constants from types for labels/colors
- [ ] **Use `useLookups()` context for dropdown options**
- [ ] Handle loading and error states
- [ ] Use `routePrefix` for navigation (board slug)
- [ ] Mutations show loading state on buttons
- [ ] Forms use controlled components
- [ ] Dates formatted correctly for API

---

## Lookups Implementation

### Overview
Lookups are database-driven configurable values (not hardcoded enums). They provide dropdown options, display names, and metadata.

### Backend Lookup Tables
| Lookup | Endpoint | Fields |
|--------|----------|--------|
| Board Types | `/api/lookups/board-types` | id, code, name, description, icon |
| Board Zones | `/api/lookups/board-zones` | id, code, name, description |
| Meeting Types | `/api/lookups/meeting-types` | id, code, name, description, defaultDuration |
| Meeting Frequencies | `/api/lookups/meeting-frequencies` | id, code, name, description |
| Voting Thresholds | `/api/lookups/voting-thresholds` | id, code, name, description, percentage |
| Document Categories | `/api/lookups/document-categories` | id, code, name, description, icon, color |
| Agenda Item Types | `/api/lookups/agenda-item-types` | id, code, name, description |
| Resolution Categories | `/api/lookups/resolution-categories` | id, code, name, description |
| Roles | `/api/lookups/roles` | id, code, name, description, permissions |

### Frontend Lookup Infrastructure (✅ Implemented)

| File | Purpose |
|------|---------|
| `src/api/lookups.api.ts` | HTTP client for all lookup endpoints |
| `src/hooks/api/useLookups.ts` | React Query hooks for each lookup |
| `src/types/lookup.types.ts` | TypeScript types for lookup responses |
| `src/contexts/LookupsContext.tsx` | Global lookup state management |

### Using Lookups in Components

**Get dropdown options:**
```tsx
const { boardTypeOptions, meetingFrequencyOptions } = useLookups();
// Returns: [{ value: 'main', label: 'Main Board', id: 1 }, ...]
```

**Get lookup by code:**
```tsx
const { getBoardTypeByCode, getMeetingTypeByCode } = useLookups();
const typeInfo = getBoardTypeByCode('main');
// Returns: { id: 1, code: 'main', name: 'Main Board', description: '...', icon: '...' }
```

**Resolve code to ID (for form submission):**
```tsx
const { getBoardTypeByCode } = useLookups();
const typeId = getBoardTypeByCode(formValues.type)?.id;
```

### Lookup vs Enum Decision

| Use Lookup (Database) | Use Enum (Code) |
|-----------------------|-----------------|
| Values may change over time | Values are fixed system states |
| Admin can configure | Developer must change code |
| Has rich metadata (icons, colors) | Simple status values |
| Examples: Board Types, Meeting Types | Examples: MeetingStatus, RSVPStatus |

### Migration Status

**Board Module Lookups:**
- [x] `boardTypeOptions` - Used in BasicInfoStep, BoardSelectionStep
- [x] `boardZoneOptions` - Used in BasicInfoStep
- [x] `meetingFrequencyOptions` - Used in BoardSettingsStep
- [x] `votingThresholdOptions` - Used in BoardSettingsStep

**Deprecated Constants (to be removed):**
- `BOARD_TYPE_LABELS` - Use `useLookups().getBoardTypeByCode(code)?.name`
- `BOARD_TYPE_COLORS` - Use theme colors or lookup metadata
- `ZONE_LABELS` - Use `useLookups().getBoardZoneByCode(code)?.name`
- `BOARD_ROLE_LABELS` - Use `useLookups().getRoleByCode(code)?.name`

---

## Quick Reference

### Backend Entity Creation Order
```
1. eBoard.Domain/Entities/{Name}.cs        → Entity class
2. eBoard.Domain/Enums/{Name}.cs           → Enums (if needed)
3. eBoardDbContext.cs                       → Add DbSet
4. {Name}Configuration.cs                   → EF Core config
5. dotnet ef migrations add {Name}          → Create migration
6. dotnet ef database update                → Apply migration
7. {Name}Seeder.cs                          → Seed data (optional)
8. {Name}Dto.cs, Create{Name}Request.cs     → DTOs
9. {Name}sController.cs                     → Controller
10. Program.cs                              → Register services
```

### Frontend Implementation Order
```
1. src/types/{entity}.types.ts              → Zod schemas + types
2. src/api/{entity}.api.ts                  → API functions
3. src/hooks/api/use{Entity}.ts             → React Query hooks
4. src/pages/{Entity}/                      → Pages
5. src/routes/index.tsx                     → Add routes
```

### Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| Entity | PascalCase singular | `Meeting` |
| DbSet | PascalCase plural | `Meetings` |
| Controller | PascalCase plural + Controller | `MeetingsController` |
| DTO | PascalCase + Dto | `MeetingDto`, `MeetingListItemDto` |
| Request | PascalCase + Request | `CreateMeetingRequest` |
| Schema | PascalCase + Schema | `MeetingSchema` |
| Type | PascalCase | `Meeting` |
| API function | camelCase verb + noun | `getMeeting`, `createMeeting` |
| Hook | use + PascalCase | `useMeeting`, `useCreateMeeting` |
| Query key | lowercase array | `['meetings', 'list', boardId]` |

### Field Type Mapping

| C# Type | TypeScript Type | Zod Schema |
|---------|-----------------|------------|
| `int` | `number` | `z.number()` |
| `string` | `string` | `z.string()` |
| `string?` | `string \| null` | `z.string().nullable()` |
| `bool` | `boolean` | `z.boolean()` |
| `DateTime` | `string` (ISO) | `z.string()` |
| `enum` | `string` (lowercase) | `z.enum([...])` or `z.string()` |
| `List<T>` | `T[]` | `z.array(TSchema)` |
| `T?` (nullable) | `T \| null` | `TSchema.nullable()` |

---

## Board Module Findings

### Completed Backend Fixes
1. **Phase 1**: Controllers now use proper DTOs (not anonymous objects)
2. **Phase 2**: Create/Update endpoints return full `BoardDto`
3. **Enum Serialization**: `JsonStringEnumConverter` added globally

### Controller DTO Usage
| Endpoint | DTO Used |
|----------|----------|
| GET /boards | `BoardListItemDto` |
| GET /boards/{id} | `BoardDto` with `BoardContactInfoDto` |
| GET /boards/{id}/settings | `BoardSettingsDto` |
| GET /boards/{id}/branding | `BoardBrandingDto` |
| GET /boards/{id}/children | `List<BoardListItemDto>` |
| POST /boards | Returns `BoardDto` |
| PUT /boards/{id} | Returns `BoardDto` |

### Frontend Component Migration Status
| Component | Uses Lookups | Notes |
|-----------|-------------|-------|
| BasicInfoStep.tsx | ✅ | Uses `boardTypeOptions`, `boardZoneOptions` |
| BoardSettingsStep.tsx | ✅ | Uses `meetingFrequencyOptions`, `votingThresholdOptions` |
| BoardSelectionStep.tsx | ✅ | Uses `boardTypeOptions`, `meetingTypeOptions` |

### Pending Items
- [ ] Remove deprecated constants from `board.types.ts` (gradual migration)
- [ ] Fix duplicate authorization in `MeetingsController` (13 instances)
- [ ] Add connection pool configuration
