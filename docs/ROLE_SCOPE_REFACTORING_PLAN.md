# Role & Scope Refactoring Plan (Clean Slate Approach)

## Executive Summary

This document outlines a comprehensive plan to refactor the role and scope architecture from a **location-coupled system** to a **polymorphic assignment system** where roles (WHAT) and scopes (WHERE) are completely decoupled.

**Approach**: Clean slate migration (development environment) - drop all data, create new schema, reseed from scratch.

**Timeline**: 4-5 weeks (vs 9 weeks with data migration)

---

## The Core Problem

### Current Design Flaw

```
UserBoardRoles {
  UserId: 5,
  RoleId: 6,           // board_secretary
  BoardId: 123,        // Hardcoded - can ONLY link to boards!
  Scope: 1             // Enum mixing WHERE and WHAT
}
```

**Issues:**
❌ Can't assign roles to committees or meetings
❌ Scope enum conflates location (board) with privilege (leadership)
❌ Can't represent "Jane is Secretary at Board A but Member at Committee B"
❌ No clear hierarchy: Is Global > Board or Board > Global?

### The Insight

**Roles** define **WHAT** you can do (Chairman, Secretary, Member)
**Scopes** define **WHERE** you operate (Admin, Global, Board, Committee, Meeting)
**Permissions** define **ACTIONS** allowed (meetings.edit, documents.upload)

These are **orthogonal concerns** and should be separate!

---

## New Architecture

### 1. Role Categories (WHAT Authority You Have)

```csharp
// eBoard.Domain/Enums/RoleCategory.cs
public enum RoleCategory
{
    SystemAdmin = 0,        // Platform administrators
    ExecutiveLeadership = 1, // Organization-wide executives
    BoardLeadership = 2,     // Board-level leadership
    Secretariat = 3,         // Administrative secretaries
    Member = 4,              // Regular members
    Participant = 5,         // Non-voting participants
}
```

**Role Hierarchy** (0 = highest privilege):

| Level | Role Code | Category | Description |
|-------|-----------|----------|-------------|
| 0 | super_user | SystemAdmin | Bypasses all permissions |
| 1 | system_admin | SystemAdmin | Full platform access |
| 2 | group_chairman | ExecutiveLeadership | Cross-board executive |
| 3 | group_company_secretary | ExecutiveLeadership | Cross-board secretariat |
| 4 | chairman | BoardLeadership | Board chairman |
| 5 | vice_chairman | BoardLeadership | Board vice chairman |
| 6 | company_secretary | Secretariat | Company-level secretary |
| 7 | board_secretary | Secretariat | Board-level secretary |
| 8 | committee_secretary | Secretariat | Committee secretary |
| 9 | board_member | Member | Regular board member |
| 10 | committee_member | Member | Committee member |
| 11 | executive_member | Member | Executive team member |
| 12 | observer | Participant | Non-voting observer |
| 13 | guest | Participant | Meeting guest |
| 14 | presenter | Participant | Meeting presenter |

### 2. Scope Levels (WHERE You Operate)

```csharp
// eBoard.Domain/Enums/ScopeType.cs
public enum ScopeType
{
    Admin = 0,      // Platform-wide (no entity)
    Global = 1,     // Organization-wide (no entity)
    Board = 2,      // Specific board
    Committee = 3,  // Specific committee
    Meeting = 4,    // Specific meeting
}
```

**Scope Hierarchy** (lower can act on higher):

```
Admin (0) ─┐
           ├─> Can act on all levels
Global (1) ┘
           ├─> Can act on Board, Committee, Meeting
Board (2)  ┘
           ├─> Can act on Committee (under this board), Meeting
Committee (3)
           ├─> Can act on Meeting (of this committee)
Meeting (4)
```

**Rule**: `userScopeLevel <= targetScopeLevel` means **can act**

Examples:
- Admin (0) can act on Board (2): `0 <= 2` ✓
- Global (1) can act on Committee (3): `1 <= 3` ✓
- Board (2) cannot act on Global (1): `2 > 1` ✗

---

## Database Schema

### New UserRoleAssignments Table

```sql
-- Replaces UserBoardRoles
CREATE TABLE UserRoleAssignments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    RoleId INT NOT NULL,

    -- Scope (WHERE they operate)
    ScopeType VARCHAR(20) NOT NULL,   -- 'Admin', 'Global', 'Board', 'Committee', 'Meeting'
    ScopeLevel INT NOT NULL,          -- 0=Admin, 1=Global, 2=Board, 3=Committee, 4=Meeting

    -- Polymorphic Foreign Keys (only ONE is non-null based on ScopeType)
    BoardId INT NULL,
    CommitteeId INT NULL,
    MeetingId INT NULL,

    -- Metadata
    StartDate DATE NOT NULL DEFAULT GETDATE(),
    EndDate DATE NULL,
    IsDefault BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy INT NULL,

    -- Foreign Keys
    CONSTRAINT FK_UserRoleAssignments_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoleAssignments_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    CONSTRAINT FK_UserRoleAssignments_Boards FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoleAssignments_Committees FOREIGN KEY (CommitteeId) REFERENCES Committees(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoleAssignments_Meetings FOREIGN KEY (MeetingId) REFERENCES Meetings(Id) ON DELETE CASCADE,

    -- Check Constraint: Exactly one scope entity must match ScopeType
    CONSTRAINT CHK_UserRoleAssignments_ScopeConsistency CHECK (
        (ScopeType = 'Admin' AND ScopeLevel = 0 AND BoardId IS NULL AND CommitteeId IS NULL AND MeetingId IS NULL) OR
        (ScopeType = 'Global' AND ScopeLevel = 1 AND BoardId IS NULL AND CommitteeId IS NULL AND MeetingId IS NULL) OR
        (ScopeType = 'Board' AND ScopeLevel = 2 AND BoardId IS NOT NULL AND CommitteeId IS NULL AND MeetingId IS NULL) OR
        (ScopeType = 'Committee' AND ScopeLevel = 3 AND CommitteeId IS NOT NULL AND BoardId IS NULL AND MeetingId IS NULL) OR
        (ScopeType = 'Meeting' AND ScopeLevel = 4 AND MeetingId IS NOT NULL AND BoardId IS NULL AND CommitteeId IS NULL)
    ),

    -- Unique constraint: One role per user per scope entity
    CONSTRAINT UQ_UserRoleAssignments_UserRoleScope UNIQUE (UserId, RoleId, ScopeType, BoardId, CommitteeId, MeetingId)
);

-- Indexes for performance
CREATE INDEX IX_UserRoleAssignments_User_Active ON UserRoleAssignments(UserId, IsActive) WHERE IsActive = 1;
CREATE INDEX IX_UserRoleAssignments_Scope_Level ON UserRoleAssignments(ScopeType, ScopeLevel);
CREATE INDEX IX_UserRoleAssignments_Board ON UserRoleAssignments(BoardId) WHERE BoardId IS NOT NULL;
CREATE INDEX IX_UserRoleAssignments_Committee ON UserRoleAssignments(CommitteeId) WHERE CommitteeId IS NOT NULL;
CREATE INDEX IX_UserRoleAssignments_Meeting ON UserRoleAssignments(MeetingId) WHERE MeetingId IS NOT NULL;
```

### Updated Roles Table

```sql
ALTER TABLE Roles
ADD Category VARCHAR(30) NOT NULL DEFAULT 'Member',
ADD HierarchyLevel INT NOT NULL DEFAULT 10,
ADD IsSingular BIT DEFAULT 0;  -- TRUE for chairman/vice_chairman (only one per board)

-- Remove Scope column (no longer needed)
ALTER TABLE Roles DROP COLUMN Scope;
```

---

## Assignment Examples

```sql
-- User 1: System Admin (platform-wide access)
INSERT INTO UserRoleAssignments (UserId, RoleId, ScopeType, ScopeLevel, BoardId, CommitteeId, MeetingId)
SELECT 1, (SELECT Id FROM Roles WHERE Code = 'system_admin'), 'Admin', 0, NULL, NULL, NULL;

-- User 2: Group Chairman (organization-wide)
INSERT INTO UserRoleAssignments (UserId, RoleId, ScopeType, ScopeLevel, BoardId, CommitteeId, MeetingId)
SELECT 2, (SELECT Id FROM Roles WHERE Code = 'group_chairman'), 'Global', 1, NULL, NULL, NULL;

-- User 3: Chairman of Board 123
INSERT INTO UserRoleAssignments (UserId, RoleId, ScopeType, ScopeLevel, BoardId, CommitteeId, MeetingId)
SELECT 3, (SELECT Id FROM Roles WHERE Code = 'chairman'), 'Board', 2, 123, NULL, NULL;

-- User 3: Also Member of Committee 456 (different role, different scope!)
INSERT INTO UserRoleAssignments (UserId, RoleId, ScopeType, ScopeLevel, BoardId, CommitteeId, MeetingId)
SELECT 3, (SELECT Id FROM Roles WHERE Code = 'committee_member'), 'Committee', 3, NULL, 456, NULL;

-- User 4: Guest at Meeting 789
INSERT INTO UserRoleAssignments (UserId, RoleId, ScopeType, ScopeLevel, BoardId, CommitteeId, MeetingId)
SELECT 4, (SELECT Id FROM Roles WHERE Code = 'guest'), 'Meeting', 4, NULL, NULL, 789;
```

---

## Permission Checking Logic

### Updated Authorization Handler

```csharp
// eBoard.Infrastructure/Auth/PermissionAuthorizationHandler.cs

protected override async Task HandleRequirementAsync(
    AuthorizationHandlerContext context,
    PermissionRequirement requirement)
{
    var userId = GetUserIdFromClaims(context.User);
    if (userId == null) return;

    // Extract target entity from route
    var (entityType, entityId) = ExtractTargetFromRoute();

    // Check if user is SuperUser (bypasses all checks)
    if (await IsSuperUser(userId.Value))
    {
        context.Succeed(requirement);
        return;
    }

    // Get applicable role assignments for this user
    var assignments = await GetApplicableAssignments(userId.Value, entityType, entityId);

    // Collect all permissions from applicable roles
    var permissions = assignments
        .SelectMany(a => a.Role.RolePermissions)
        .Select(rp => rp.Permission.Code)
        .Distinct()
        .ToHashSet();

    if (permissions.Contains(requirement.Permission))
    {
        context.Succeed(requirement);
    }
}

private async Task<List<UserRoleAssignment>> GetApplicableAssignments(
    int userId,
    string entityType,
    int? entityId)
{
    var query = _context.UserRoleAssignments
        .Include(a => a.Role)
            .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
        .Where(a => a.UserId == userId && a.IsActive);

    // Target scope level for the requested entity
    int targetLevel = entityType switch
    {
        "Board" => 2,
        "Committee" => 3,
        "Meeting" => 4,
        _ => 1  // Global
    };

    // Rule: User's ScopeLevel <= Target level means can act
    query = query.Where(a =>
        // Higher scope (lower level number) can act on this target
        a.ScopeLevel <= targetLevel ||
        // OR exact match on the specific entity
        (entityType == "Board" && a.BoardId == entityId) ||
        (entityType == "Committee" && a.CommitteeId == entityId) ||
        (entityType == "Meeting" && a.MeetingId == entityId)
    );

    return await query.ToListAsync();
}

private async Task<bool> IsSuperUser(int userId)
{
    return await _context.UserRoleAssignments
        .AnyAsync(a => a.UserId == userId
                    && a.Role.Code == "super_user"
                    && a.ScopeType == ScopeType.Admin
                    && a.IsActive);
}
```

---

## Frontend Changes

### 1. Fully Dynamic Scope System

```typescript
// src/types/role.types.ts

// DELETE hardcoded enum
// export const RoleScopeSchema = z.enum(['global', 'board', ...]); ❌

// NEW: Fetch from backend
export const ScopeLookupSchema = z.object({
  code: z.string(),              // 'admin', 'global', 'board', 'committee', 'meeting'
  name: z.string(),              // 'Admin', 'Global', 'Board', 'Committee', 'Meeting'
  description: z.string(),
  level: z.number(),             // 0-4 (hierarchy level)
  requiresEntity: z.boolean(),   // TRUE if needs BoardId/CommitteeId/MeetingId
});

export const RoleLookupSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),          // 'SystemAdmin', 'BoardLeadership', etc.
  hierarchyLevel: z.number(),    // 0-14 (role privilege level)
  isSingular: z.boolean(),       // TRUE for chairman/vice_chairman
  permissions: z.array(z.string()),
});

export const UserRoleAssignmentSchema = z.object({
  id: z.number(),
  userId: z.number(),
  roleId: z.number(),
  roleCode: z.string(),
  roleName: z.string(),
  scopeType: z.string(),         // 'Admin', 'Global', 'Board', 'Committee', 'Meeting'
  scopeLevel: z.number(),
  boardId: z.number().nullable(),
  boardName: z.string().nullable(),
  committeeId: z.number().nullable(),
  committeeName: z.string().nullable(),
  meetingId: z.number().nullable(),
  meetingTitle: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isDefault: z.boolean(),
});

export type ScopeLookup = z.infer<typeof ScopeLookupSchema>;
export type RoleLookup = z.infer<typeof RoleLookupSchema>;
export type UserRoleAssignment = z.infer<typeof UserRoleAssignmentSchema>;
```

### 2. Scope Service

```typescript
// src/services/scopeService.ts

export class ScopeService {
  /**
   * Check if userScope can act on targetScope
   * Rule: userLevel <= targetLevel (lower number = higher privilege)
   */
  static canActOn(
    userScopeLevel: number,
    targetScopeLevel: number
  ): boolean {
    return userScopeLevel <= targetScopeLevel;
  }

  /**
   * Get scope by code from lookups
   */
  static getScopeByCode(code: string, scopes: ScopeLookup[]): ScopeLookup | undefined {
    return scopes.find(s => s.code === code);
  }

  /**
   * Check if scope requires entity ID (Board/Committee/Meeting)
   */
  static requiresEntity(scopeCode: string, scopes: ScopeLookup[]): boolean {
    const scope = this.getScopeByCode(scopeCode, scopes);
    return scope?.requiresEntity ?? false;
  }

  /**
   * Get available scopes for a role category
   */
  static getAvailableScopes(
    roleCategory: string,
    scopes: ScopeLookup[]
  ): ScopeLookup[] {
    // SystemAdmin roles can only be assigned at Admin/Global scope
    if (roleCategory === 'SystemAdmin') {
      return scopes.filter(s => s.code === 'admin' || s.code === 'global');
    }

    // ExecutiveLeadership roles at Global scope
    if (roleCategory === 'ExecutiveLeadership') {
      return scopes.filter(s => s.code === 'global');
    }

    // BoardLeadership, Secretariat, Member roles at Board/Committee
    if (['BoardLeadership', 'Secretariat', 'Member'].includes(roleCategory)) {
      return scopes.filter(s => ['board', 'committee'].includes(s.code));
    }

    // Participant roles at Meeting
    if (roleCategory === 'Participant') {
      return scopes.filter(s => s.code === 'meeting');
    }

    return scopes;
  }
}
```

### 3. Lookups Context

```typescript
// src/contexts/LookupsContext.tsx

interface LookupsContextType {
  roles: RoleLookup[];
  scopes: ScopeLookup[];           // NEW: Fetched from backend
  permissions: PermissionLookup[]; // NEW: Fetched from backend

  // Helpers
  getRoleByCode: (code: string) => RoleLookup | undefined;
  getScopeByCode: (code: string) => ScopeLookup | undefined;
  canScopeActOn: (userLevel: number, targetLevel: number) => boolean;

  isLoading: boolean;
}

export const LookupsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fetch scopes from backend
  const { data: scopesData } = useQuery({
    queryKey: ['lookups', 'scopes'],
    queryFn: () => lookupsApi.getScopes(),
    staleTime: Infinity, // Cache indefinitely
  });

  const scopes = useMemo(() => scopesData?.data || [], [scopesData]);

  const getScopeByCode = useCallback((code: string) => {
    return scopes.find(s => s.code === code);
  }, [scopes]);

  const canScopeActOn = useCallback((userLevel: number, targetLevel: number) => {
    return ScopeService.canActOn(userLevel, targetLevel);
  }, []);

  // ... rest of context
};
```

### 4. Role Assignment Component

```typescript
// src/components/users/RoleAssignmentForm.tsx

export const RoleAssignmentForm: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleLookup | null>(null);
  const [selectedScope, setSelectedScope] = useState<string>('');
  const { roles, scopes } = useLookups();

  // Available scopes based on selected role's category
  const availableScopes = useMemo(() => {
    if (!selectedRole) return [];
    return ScopeService.getAvailableScopes(selectedRole.category, scopes);
  }, [selectedRole, scopes]);

  // Show entity selector (Board/Committee/Meeting) if scope requires it
  const selectedScopeInfo = scopes.find(s => s.code === selectedScope);
  const needsEntity = selectedScopeInfo?.requiresEntity ?? false;

  return (
    <Form>
      {/* Step 1: Select Role */}
      <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
        <Select
          options={roles.map(r => ({
            value: r.id,
            label: r.name,
            category: r.category
          }))}
          onChange={(roleId) => {
            const role = roles.find(r => r.id === roleId);
            setSelectedRole(role || null);
            setSelectedScope(''); // Reset scope
          }}
          optionRender={(option) => (
            <div>
              <div>{option.label}</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {option.data.category} • Level {roles.find(r => r.id === option.value)?.hierarchyLevel}
              </div>
            </div>
          )}
        />
      </Form.Item>

      {/* Step 2: Select Scope (filtered by role category) */}
      {selectedRole && (
        <Form.Item name="scopeType" label="Scope" rules={[{ required: true }]}>
          <Select
            options={availableScopes.map(s => ({
              value: s.code,
              label: s.name,
              description: s.description
            }))}
            onChange={(scope) => setSelectedScope(scope)}
            optionRender={(option) => (
              <div>
                <div>{option.label}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{option.data.description}</div>
              </div>
            )}
          />
        </Form.Item>
      )}

      {/* Step 3: Select Entity (Board/Committee/Meeting) if needed */}
      {needsEntity && selectedScope === 'board' && (
        <Form.Item name="boardId" label="Board" rules={[{ required: true }]}>
          <BoardSelector />
        </Form.Item>
      )}

      {needsEntity && selectedScope === 'committee' && (
        <Form.Item name="committeeId" label="Committee" rules={[{ required: true }]}>
          <CommitteeSelector />
        </Form.Item>
      )}

      {needsEntity && selectedScope === 'meeting' && (
        <Form.Item name="meetingId" label="Meeting" rules={[{ required: true }]}>
          <MeetingSelector />
        </Form.Item>
      )}
    </Form>
  );
};
```

---

## Implementation Plan (Clean Slate)

### Phase 1: Backend Schema (Week 1)

**Day 1-2**: Drop & Recreate
- ✅ Delete all migration files
- ✅ Drop database
- ✅ Create new initial migration with UserRoleAssignments table
- ✅ Add enums (ScopeType, RoleCategory)
- ✅ Update Role entity (add Category, HierarchyLevel, remove Scope)

**Day 3-4**: Controllers & DTOs
- ✅ Create RoleAssignmentController
- ✅ Add DTOs (ScopeLookupDto, UserRoleAssignmentDto)
- ✅ Update UsersController (role assignments CRUD)
- ✅ Update BoardsController (member queries)
- ✅ Add LookupsController endpoints (/scopes, /role-categories)

**Day 5**: Authorization
- ✅ Update PermissionAuthorizationHandler
- ✅ Implement scope hierarchy checking
- ✅ Add SuperUser bypass logic

### Phase 2: Backend Seeders (Week 2)

**Day 1-2**: Role & Permission Seeders
- ✅ Update RolePermissionSeeder with new role structure
- ✅ Add all 14 roles with correct categories and hierarchy
- ✅ Assign permissions to roles

**Day 3-4**: User & Assignment Seeders
- ✅ Create UserRoleAssignmentSeeder
- ✅ Seed test users with various assignments
- ✅ Test different scope combinations

**Day 5**: Testing
- ✅ Test all seeded data
- ✅ Verify permission checks work
- ✅ Test scope hierarchy logic

### Phase 3: Frontend Foundation (Week 3)

**Day 1-2**: Types & Services
- ✅ Update type definitions (remove hardcoded enums)
- ✅ Create ScopeService
- ✅ Update API clients (scopes, role-assignments)

**Day 3-4**: Contexts & Hooks
- ✅ Update LookupsContext (fetch scopes)
- ✅ Update AuthContext (new permission checking)
- ✅ Remove useBoardRoleValidation (obsolete)
- ✅ Create useRoleAssignments hook

**Day 5**: Remove Hardcoding
- ✅ Delete all KNOWN_ROLES constants
- ✅ Delete all scope checking functions
- ✅ Update all components using hardcoded checks

### Phase 4: Frontend Components (Week 4)

**Day 1-2**: Core Components
- ✅ Create RoleAssignmentForm component
- ✅ Update MemberSelector (use new assignments)
- ✅ Update ParticipantSelector (meeting assignments)

**Day 3-4**: User Pages
- ✅ Update CreateUserPage (new assignment flow)
- ✅ Update EditUserPage (manage multiple assignments)
- ✅ Update UserDetailsPage (display all assignments)

**Day 5**: Board Pages
- ✅ Update BoardEditPage (members tab)
- ✅ Update BoardDetailsPage (members display)

### Phase 5: Testing & Polish (Week 5)

**Day 1-2**: Integration Testing
- ✅ Test user creation with role assignments
- ✅ Test board member management
- ✅ Test meeting participant invitations
- ✅ Test permission checks

**Day 3-4**: Bug Fixes
- ✅ Fix any discovered issues
- ✅ Improve UI/UX
- ✅ Add loading states

**Day 5**: Documentation
- ✅ Update API documentation
- ✅ Create user guide
- ✅ Update developer docs

---

## Migration Checklist

### Backend Cleanup
- [ ] Delete all existing migrations
- [ ] Drop development database
- [ ] Remove UserBoardRoles entity
- [ ] Remove RoleScope enum (or repurpose)
- [ ] Remove Scope column from Roles table

### Backend New Schema
- [ ] Create ScopeType enum (Admin, Global, Board, Committee, Meeting)
- [ ] Create RoleCategory enum (SystemAdmin, ExecutiveLeadership, etc.)
- [ ] Create UserRoleAssignments entity
- [ ] Update Role entity (add Category, HierarchyLevel, IsSingular)
- [ ] Create new initial migration
- [ ] Apply migration

### Backend Seeders
- [ ] Update RolePermissionSeeder with 14 roles
- [ ] Assign correct categories and hierarchy levels
- [ ] Create UserRoleAssignmentSeeder
- [ ] Seed super_user at Admin scope
- [ ] Seed test users with various assignments
- [ ] Run seeders

### Backend Authorization
- [ ] Update PermissionAuthorizationHandler
- [ ] Implement scope hierarchy checking (ScopeLevel comparison)
- [ ] Add SuperUser bypass
- [ ] Update UserAccessProjectionService
- [ ] Test authorization with new assignments

### Backend Controllers
- [ ] Create /api/lookups/scopes endpoint
- [ ] Create /api/lookups/role-categories endpoint
- [ ] Create /api/users/{id}/role-assignments (CRUD)
- [ ] Update /api/boards/{id}/members (query UserRoleAssignments)
- [ ] Update /api/committees/{id}/members (new endpoint)
- [ ] Update /api/meetings/{id}/participants (use assignments)

### Frontend Types
- [ ] Delete hardcoded RoleScopeSchema enum
- [ ] Create ScopeLookupSchema
- [ ] Update RoleLookupSchema (add category, hierarchyLevel)
- [ ] Create UserRoleAssignmentSchema
- [ ] Update all imports

### Frontend Services
- [ ] Create ScopeService class
- [ ] Add canActOn() method
- [ ] Add getAvailableScopes() method
- [ ] Update lookupsApi (add getScopes, getRoleCategories)
- [ ] Update usersApi (role-assignments CRUD)

### Frontend Contexts
- [ ] Update LookupsContext (fetch scopes from backend)
- [ ] Add scopes state to LookupsContext
- [ ] Add scope helper functions
- [ ] Update AuthContext (new permission checking logic)
- [ ] Remove hardcoded GLOBAL_ACCESS_ROLES

### Frontend Hooks
- [ ] Delete useBoardRoleValidation (obsolete)
- [ ] Create useRoleAssignments hook
- [ ] Update useMeetingPermissions (use ScopeService)
- [ ] Update all hooks using hardcoded scope checks

### Frontend Components
- [ ] Create RoleAssignmentForm component
- [ ] Update MemberSelector (remove hardcoding)
- [ ] Update BoardSelector (polymorphic assignments)
- [ ] Update ParticipantSelector (use assignments)
- [ ] Remove all KNOWN_ROLES constants

### Frontend Pages
- [ ] Update CreateUserPage (new assignment flow)
- [ ] Update EditUserPage (manage multiple assignments)
- [ ] Update UserDetailsPage (display all assignments)
- [ ] Update BoardEditPage (members with new structure)
- [ ] Update BoardDetailsPage (members display)
- [ ] Update CommitteeDetailsPage (committee members)
- [ ] Update MeetingDetailsPage (participants)

### Frontend Cleanup
- [ ] Delete all hardcoded scope constants
- [ ] Delete all hardcoded role code constants
- [ ] Remove SYSTEM_ROLE_INFO object
- [ ] Remove PERMISSION_CODES object
- [ ] Update Sidebar (remove hardcoded permission checks)

### Testing
- [ ] Test user creation with Admin scope
- [ ] Test user creation with Board scope
- [ ] Test user with multiple assignments (Board + Committee)
- [ ] Test permission checks across scopes
- [ ] Test SuperUser bypass
- [ ] Test chairman singularity constraint
- [ ] Test board member management
- [ ] Test committee member management
- [ ] Test meeting participant management

---

## Benefits After Refactoring

✅ **Polymorphic Assignments**: Same role at different organizational levels
✅ **No Data Migration**: Clean slate in development
✅ **Type Safety**: No more magic strings
✅ **Clear Hierarchy**: Admin > Global > Board > Committee > Meeting
✅ **Extensible**: Add new scopes without code changes
✅ **Dynamic**: All lookups from backend
✅ **Simplified**: No complex migration scripts
✅ **Faster**: 5 weeks vs 9 weeks

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Lost test data | Acceptable - development environment |
| Authorization bugs | Comprehensive test suite + staging validation |
| UI confusion | User guide + clear error messages |
| Performance issues | Indexed foreign keys + optimized queries |
| Breaking changes | Full rewrite - expect breaking changes |

---

## Timeline Summary

**Week 1**: Backend schema, entities, enums
**Week 2**: Backend seeders, test data
**Week 3**: Frontend foundation, contexts, services
**Week 4**: Frontend components, pages
**Week 5**: Testing, bug fixes, polish

**Total: 5 weeks**

**Comparison**: 5 weeks (clean slate) vs 9 weeks (with data migration) = **44% faster**

---

## Next Steps

1. ✅ Review and approve this plan
2. ✅ Create feature branch: `feat/polymorphic-role-assignments`
3. ✅ Drop development database
4. ✅ Delete all migrations
5. ✅ Start Phase 1: Backend Schema
