-- ============================================================================
-- Migration: Add Participant RoleScope (Value = 3)
-- Purpose: Separate non-voting participant roles (observer, presenter, guest)
--          from full board member roles
-- Author: System
-- Date: 2026-02-21
-- ============================================================================

-- IMPORTANT: Run this script BEFORE updating the backend RoleScope enum
-- and deploying the new code. This ensures data consistency.

BEGIN TRANSACTION;

PRINT 'Starting RoleScope Participant migration...';

-- ============================================================================
-- STEP 1: Update Roles table
-- Change observer, presenter, guest from Board (1) to Participant (3)
-- ============================================================================

PRINT 'Updating Roles table...';

UPDATE [dbo].[Roles]
SET [Scope] = 3  -- Participant
WHERE [Code] IN ('observer', 'presenter', 'guest')
  AND [Scope] = 1;  -- Currently Board

-- Verify the update
IF @@ROWCOUNT = 3
BEGIN
    PRINT '✓ Successfully updated 3 roles to Participant scope';
    PRINT '  - observer: Board (1) → Participant (3)';
    PRINT '  - presenter: Board (1) → Participant (3)';
    PRINT '  - guest: Board (1) → Participant (3)';
END
ELSE
BEGIN
    PRINT '✗ WARNING: Expected to update 3 roles, but updated ' + CAST(@@ROWCOUNT AS VARCHAR(10));
    PRINT '  Check if roles were already updated or codes have changed.';
END

-- ============================================================================
-- STEP 2: Update UserBoardRole table
-- Update scope for any user-role assignments that use these roles
-- The Scope in UserBoardRole must match the role's scope
-- ============================================================================

PRINT '';
PRINT 'Updating UserBoardRole assignments...';

UPDATE ubr
SET ubr.[Scope] = 3  -- Participant
FROM [dbo].[UserBoardRole] ubr
INNER JOIN [dbo].[Roles] r ON ubr.[RoleId] = r.[Id]
WHERE r.[Code] IN ('observer', 'presenter', 'guest')
  AND ubr.[Scope] = 1;  -- Currently Board

DECLARE @affectedAssignments INT = @@ROWCOUNT;

IF @affectedAssignments > 0
BEGIN
    PRINT '✓ Successfully updated ' + CAST(@affectedAssignments AS VARCHAR(10)) + ' UserBoardRole assignments';
END
ELSE
BEGIN
    PRINT '✓ No existing UserBoardRole assignments needed updating';
END

-- ============================================================================
-- STEP 3: Verification
-- ============================================================================

PRINT '';
PRINT 'Verifying changes...';

-- Check Roles table
DECLARE @participantRoleCount INT;
SELECT @participantRoleCount = COUNT(*)
FROM [dbo].[Roles]
WHERE [Code] IN ('observer', 'presenter', 'guest')
  AND [Scope] = 3;

IF @participantRoleCount = 3
BEGIN
    PRINT '✓ All 3 participant roles have correct scope (3)';
END
ELSE
BEGIN
    PRINT '✗ ERROR: Only ' + CAST(@participantRoleCount AS VARCHAR(10)) + ' roles have Participant scope!';
    ROLLBACK TRANSACTION;
    RAISERROR('Verification failed - rolling back transaction', 16, 1);
    RETURN;
END

-- Check UserBoardRole table for scope mismatches
DECLARE @mismatchCount INT;
SELECT @mismatchCount = COUNT(*)
FROM [dbo].[UserBoardRole] ubr
INNER JOIN [dbo].[Roles] r ON ubr.[RoleId] = r.[Id]
WHERE r.[Code] IN ('observer', 'presenter', 'guest')
  AND ubr.[Scope] != r.[Scope];

IF @mismatchCount = 0
BEGIN
    PRINT '✓ All UserBoardRole scopes match their role scopes';
END
ELSE
BEGIN
    PRINT '✗ ERROR: Found ' + CAST(@mismatchCount AS VARCHAR(10)) + ' UserBoardRole records with mismatched scope!';
    ROLLBACK TRANSACTION;
    RAISERROR('Scope mismatch detected - rolling back transaction', 16, 1);
    RETURN;
END

-- ============================================================================
-- STEP 4: Display summary
-- ============================================================================

PRINT '';
PRINT '========================================';
PRINT 'Migration Summary';
PRINT '========================================';

-- Show updated roles
SELECT
    [Code],
    [Name],
    [Scope] AS ScopeValue,
    CASE [Scope]
        WHEN 0 THEN 'Global'
        WHEN 1 THEN 'Board'
        WHEN 2 THEN 'BoardLeadership'
        WHEN 3 THEN 'Participant'
        ELSE 'Unknown'
    END AS ScopeName
FROM [dbo].[Roles]
WHERE [Code] IN ('observer', 'presenter', 'guest')
ORDER BY [Code];

PRINT '';
PRINT 'Roles by Scope:';

SELECT
    CASE [Scope]
        WHEN 0 THEN 'Global'
        WHEN 1 THEN 'Board'
        WHEN 2 THEN 'BoardLeadership'
        WHEN 3 THEN 'Participant'
        ELSE 'Unknown'
    END AS ScopeName,
    [Scope] AS ScopeValue,
    COUNT(*) AS RoleCount,
    STRING_AGG([Code], ', ') AS RoleCodes
FROM [dbo].[Roles]
GROUP BY [Scope]
ORDER BY [Scope];

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT TRANSACTION;

PRINT '';
PRINT '========================================';
PRINT '✓ Migration completed successfully!';
PRINT '========================================';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Update backend: eBoard.Domain/Enums/RoleScope.cs';
PRINT '2. Update seeder: eBoard.Infrastructure/Persistence/Seeders/RolePermissionSeeder.cs';
PRINT '3. Update frontend: src/types/lookup.types.ts and validation hooks';
PRINT '4. Deploy updated code';

GO
