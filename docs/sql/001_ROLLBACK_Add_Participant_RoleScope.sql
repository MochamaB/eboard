-- ============================================================================
-- ROLLBACK Migration: Remove Participant RoleScope (Value = 3)
-- Purpose: Revert observer, presenter, guest roles back to Board scope
-- Author: System
-- Date: 2026-02-21
-- ============================================================================

-- WARNING: Only run this if you need to rollback the Participant scope migration
-- This will revert the roles back to Board (1) scope

BEGIN TRANSACTION;

PRINT 'Starting RoleScope Participant migration ROLLBACK...';

-- ============================================================================
-- STEP 1: Revert Roles table
-- Change observer, presenter, guest from Participant (3) back to Board (1)
-- ============================================================================

PRINT 'Reverting Roles table...';

UPDATE [dbo].[Roles]
SET [Scope] = 1  -- Board
WHERE [Code] IN ('observer', 'presenter', 'guest')
  AND [Scope] = 3;  -- Currently Participant

-- Verify the update
IF @@ROWCOUNT = 3
BEGIN
    PRINT '✓ Successfully reverted 3 roles to Board scope';
    PRINT '  - observer: Participant (3) → Board (1)';
    PRINT '  - presenter: Participant (3) → Board (1)';
    PRINT '  - guest: Participant (3) → Board (1)';
END
ELSE
BEGIN
    PRINT '✗ WARNING: Expected to revert 3 roles, but updated ' + CAST(@@ROWCOUNT AS VARCHAR(10));
    PRINT '  Check if roles were already reverted.';
END

-- ============================================================================
-- STEP 2: Revert UserBoardRole table
-- Update scope for any user-role assignments back to Board
-- ============================================================================

PRINT '';
PRINT 'Reverting UserBoardRole assignments...';

UPDATE ubr
SET ubr.[Scope] = 1  -- Board
FROM [dbo].[UserBoardRole] ubr
INNER JOIN [dbo].[Roles] r ON ubr.[RoleId] = r.[Id]
WHERE r.[Code] IN ('observer', 'presenter', 'guest')
  AND ubr.[Scope] = 3;  -- Currently Participant

DECLARE @affectedAssignments INT = @@ROWCOUNT;

IF @affectedAssignments > 0
BEGIN
    PRINT '✓ Successfully reverted ' + CAST(@affectedAssignments AS VARCHAR(10)) + ' UserBoardRole assignments';
END
ELSE
BEGIN
    PRINT '✓ No UserBoardRole assignments needed reverting';
END

-- ============================================================================
-- STEP 3: Verification
-- ============================================================================

PRINT '';
PRINT 'Verifying rollback...';

-- Check Roles table
DECLARE @boardRoleCount INT;
SELECT @boardRoleCount = COUNT(*)
FROM [dbo].[Roles]
WHERE [Code] IN ('observer', 'presenter', 'guest')
  AND [Scope] = 1;

IF @boardRoleCount = 3
BEGIN
    PRINT '✓ All 3 roles reverted to Board scope (1)';
END
ELSE
BEGIN
    PRINT '✗ ERROR: Only ' + CAST(@boardRoleCount AS VARCHAR(10)) + ' roles have Board scope!';
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
PRINT 'Rollback Summary';
PRINT '========================================';

-- Show reverted roles
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

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT TRANSACTION;

PRINT '';
PRINT '========================================';
PRINT '✓ Rollback completed successfully!';
PRINT '========================================';
PRINT '';
PRINT 'WARNING: If you already updated the backend code with Participant enum,';
PRINT 'you must revert those code changes as well.';

GO
