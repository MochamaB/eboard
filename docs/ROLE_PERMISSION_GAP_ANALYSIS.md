# Role & Permission Gap Analysis
**Date:** February 18, 2026  
**Purpose:** Identify gaps between backend role/permission system and frontend hardcoded types

---

## Executive Summary

**Key Finding:** Roles and permissions are **already dynamic** in the backend with full CRUD API endpoints. The frontend has hardcoded enums and display constants that should be replaced with API-fetched data.

**Critical Differences:**
1. Backend has 14 roles (including `superuser`), frontend enum has 13
2. Backend has 40+ permissions across 11 categories, frontend only defines 8 categories
3. Backend supports custom role creation, frontend assumes fixed role set
4. Backend has role scope (Global vs Board), frontend doesn't distinguish clearly

---

## Backend Analysis

### Roles Table Structure
**Entity:** `Role` (eBoard.Domain.Entities.Role)
- `Id` (int) - Primary key
- `Code` (string) - Unique identifier (e.g., "chairman", "board_member")
- `Name` (string) - Display name
- `Description` (string) - Role description
- `IsSystemRole` (bool) - System roles cannot be deleted
- `Scope` (RoleScope enum) - Global or Board
- Navigation: `RolePermissions`, `UserBoardRoles`

### Seeded Roles (14 total)

#### Global Scope (4 roles):
1. **superuser** - Bypasses all logic, system owner only
2. **system_admin** - Full system access across all boards
3. **group_chairman** - Group-level chairman with access to all boards
4. **group_company_secretary** - Group-level secretary with cross-board access

#### Board Scope (10 roles):
5. **chairman** - Board chairman with elevated privileges
6. **vice_chairman** - Deputy to chairman
7. **board_secretary** - Board-specific secretary
8. **board_member** - Regular board member with voting rights
9. **committee_member** - Committee participant
10. **executive_member** - Executive (CEO, CFO, etc.)
11. **observer** - View-only access
12. **presenter** - Can present in meetings
13. **guest** - Limited temporary access
14. **company_secretary** - Board-specific company secretary

### Permissions Table Structure
**Entity:** `Permission` (eBoard.Domain.Entities.Permission)
- `Id` (int) - Primary key
- `Code` (string) - Unique identifier (e.g., "meetings.create")
- `Name` (string) - Display name
- `Description` (string) - Permission description
- `Category` (string) - Grouping category

### Seeded Permissions (40 total across 11 categories)

#### Users (5 permissions):
- users.view, users.create, users.edit, users.delete, users.bulk

#### Boards (5 permissions):
- boards.view, boards.create, boards.edit, boards.members, boards.view_all

#### Meetings (7 permissions):
- meetings.view, meetings.create, meetings.edit, meetings.cancel
- meetings.approve, meetings.control, meetings.present

#### Agenda (2 permissions):
- agenda.manage, agenda.propose

#### Documents (4 permissions):
- documents.view, documents.upload, documents.delete, documents.download

#### Voting (4 permissions):
- voting.view, voting.create, voting.cast, voting.start

#### Minutes (5 permissions):
- minutes.view, minutes.create, minutes.edit, minutes.approve, minutes.sign

#### Actions (2 permissions):
- actions.view, actions.manage

#### Resolutions (2 permissions):
- resolutions.view, resolutions.manage

#### Templates (1 permission):
- templates.manage

#### Reports (3 permissions):
- reports.view, reports.export, reports.all

#### Settings (2 permissions):
- settings.view, settings.edit

### API Endpoints Available

**RolesController** (`/api/admin/roles`) - **[Authorize]** required:
- `GET /api/admin/roles` - List all roles with pagination, filtering
- `GET /api/admin/roles/{id}` - Get single role with permissions
- `POST /api/admin/roles` - Create custom role
- `PUT /api/admin/roles/{id}` - Update role (system roles protected)
- `DELETE /api/admin/roles/{id}` - Delete role (system roles protected)

**PermissionsController** (`/api/admin/permissions`) - **[Authorize]** required:
- `GET /api/admin/permissions` - Get all permissions grouped by category

---

## Frontend Analysis

### Current Implementation

#### Hardcoded Enums (`role.types.ts`):

**SystemRoleSchema** (13 roles):
```typescript
z.enum([
  'system_admin',
  'group_chairman',
  'group_company_secretary',
  'board_secretary',
  'chairman',
  'vice_chairman',
  'company_secretary',
  'board_member',
  'committee_member',
  'executive_member',
  'presenter',
  'observer',
  'guest',
])
```

**BoardRoleSchema** (5 roles):
```typescript
z.enum([
  'chairman',
  'vice_chairman',
  'secretary',
  'member',
  'observer',
])
```

**PermissionCategorySchema** (9 categories):
```typescript
z.enum([
  'users',
  'boards',
  'meetings',
  'documents',
  'voting',
  'minutes',
  'reports',
  'settings',
  'admin',
])
```

#### Hardcoded Display Constants:

**SYSTEM_ROLE_INFO** - Labels, descriptions, colors for each role
**BOARD_ROLE_INFO** - Labels and colors for board roles

#### Components Using Hardcoded Roles:
- `CreateUserPage.tsx` - Role dropdown (4 uses)
- `UsersIndexPage.tsx` - Role display and filtering (3 uses)
- `constants/roles.ts` - Centralized role constants (2 uses)

---

## Gap Analysis

### 1. Missing Role in Frontend
❌ **Frontend missing:** `superuser` role (exists in backend)

### 2. Role Scope Not Distinguished
❌ **Frontend issue:** No clear distinction between Global and Board scope roles
- Backend: `scope` field (global/board)
- Frontend: Separate enums but no scope property

### 3. Permission Categories Mismatch
❌ **Frontend has extra:** `admin` category (not in backend)
❌ **Frontend missing:** `agenda`, `actions`, `resolutions`, `templates` categories

### 4. Dynamic vs Static
❌ **Backend:** Supports custom role creation (non-system roles)
❌ **Frontend:** Assumes fixed set of roles, no support for custom roles

### 5. Display Metadata
❌ **Frontend:** Hardcoded labels, descriptions, colors in `SYSTEM_ROLE_INFO`
❌ **Backend:** Has name and description, but no color metadata

---

## Recommended Approach

### Option 1: Full Dynamic Roles (Recommended)
**Treat roles like lookups** - Fetch from API and use dynamically

**Pros:**
- ✅ Supports custom roles automatically
- ✅ Single source of truth (database)
- ✅ No code changes needed for new roles
- ✅ Consistent with lookup pattern we just implemented

**Cons:**
- ⚠️ Requires authentication (roles are admin endpoints)
- ⚠️ Need to handle loading states
- ⚠️ Color metadata needs to be added to backend or kept in frontend

**Implementation:**
1. Create `/api/roles` endpoint (public or auth-required)
2. Add role fetching to lookup infrastructure
3. Update components to use dynamic role data
4. Keep color mapping in frontend (UI concern)

### Option 2: Hybrid Approach
**Keep system roles as enums, fetch custom roles dynamically**

**Pros:**
- ✅ Type safety for known system roles
- ✅ Supports custom roles
- ✅ Less breaking changes

**Cons:**
- ⚠️ More complex logic
- ⚠️ Still requires API for custom roles
- ⚠️ Doesn't fully solve the problem

### Option 3: Keep Static (Not Recommended)
**Update frontend enums to match backend exactly**

**Pros:**
- ✅ Simple, no API changes
- ✅ No loading states

**Cons:**
- ❌ Doesn't support custom roles
- ❌ Requires code deployment for new roles
- ❌ Inconsistent with lookup pattern

---

## Permissions Analysis

### Should Permissions Be Dynamic?

**Current State:**
- Backend: 40 permissions seeded, fixed set
- Frontend: Only categories defined, individual permissions not used in UI

**Recommendation:** **Keep permissions static (enums)**

**Reasoning:**
1. Permissions are **code-level authorization checks** - tied to backend logic
2. Adding new permission requires backend code changes anyway
3. Frontend doesn't display individual permissions in most UIs
4. Permission checks are done via `usePermissions()` hook with string codes
5. Only admin role management UI needs full permission list (can fetch there)

**Exception:** Role management pages should fetch permissions from API for CRUD operations

---

## Implementation Plan

### Phase 1: Add Public Roles Endpoint ✅
Create lightweight endpoint for role dropdown data:
```
GET /api/roles
Response: [{ id, code, name, description, scope, isSystem }]
```

### Phase 2: Extend Lookup Infrastructure ✅
Add roles to lookup system:
- Add `RoleLookupSchema` to `lookup.types.ts`
- Add `getRoles()` to `lookups.api.ts`
- Add `useRoles()` hook to `useLookups.ts`
- Add to `LookupsContext`

### Phase 3: Update Frontend Types ✅
- Keep `SystemRoleSchema` as string (not enum)
- Keep `BoardRoleSchema` as string (not enum)
- Add `scope` field to role types
- Add `superuser` to role lists

### Phase 4: Update Components ✅
- `CreateUserPage.tsx` - Use `roleOptions` from lookups
- `UsersIndexPage.tsx` - Use `getRoleByCode()` helper
- Remove hardcoded `SYSTEM_ROLE_INFO` and `BOARD_ROLE_INFO`
- Keep color mapping in frontend (UI concern)

### Phase 5: Admin Role Management (Future)
- Fetch full role+permission data for admin pages
- Use existing `/api/admin/roles` endpoints
- Support custom role CRUD

---

## Other Hardcoded Types to Review

### 1. Document Categories ✅
**Status:** Already migrated to lookups in Phase 3

### 2. Agenda Item Types ✅
**Status:** Already migrated to lookups in Phase 3

### 3. Resolution Categories ✅
**Status:** Already migrated to lookups in Phase 3

### 4. Meeting Statuses ✅
**Status:** Correctly kept as enums (system states)

### 5. User Statuses ✅
**Status:** Correctly kept as enums (system states)

### 6. Board Statuses ✅
**Status:** Correctly kept as enums (system states)

### 7. Location Types ✅
**Status:** Correctly kept as enums (system states: physical, virtual, hybrid)

### 8. RSVP Status ✅
**Status:** Correctly kept as enums (system states)

---

## Summary

### What Should Be Dynamic (Fetch from API):
✅ **Roles** - Support custom roles, single source of truth
✅ **Board Types** - Already done
✅ **Board Zones** - Already done
✅ **Meeting Types** - Already done
✅ **Meeting Frequencies** - Already done
✅ **Voting Thresholds** - Already done
✅ **Document Categories** - Already done
✅ **Agenda Item Types** - Already done
✅ **Resolution Categories** - Already done

### What Should Stay Static (Enums):
✅ **Permissions** - Code-level authorization, tied to backend logic
✅ **All Status Enums** - System states (BoardStatus, UserStatus, MeetingStatus, etc.)
✅ **Location Types** - System states (physical, virtual, hybrid)
✅ **RSVP Status** - System states
✅ **Vote Outcomes** - System states
✅ **Role Scope** - System enum (global, board)

### UI-Only Constants (Keep in Frontend):
✅ **Color mappings** - UI concern, not business logic
✅ **Icon mappings** - UI concern (unless stored in backend)
✅ **Display preferences** - UI concern

---

## Next Steps

1. ✅ Create `/api/roles` endpoint (decide: public or auth-required)
2. ✅ Add roles to lookup infrastructure
3. ✅ Update frontend role types to use strings
4. ✅ Update components to use dynamic role data
5. ⏭️ Test role dropdown and display in user management
6. ⏭️ (Future) Implement admin role management UI for custom roles
