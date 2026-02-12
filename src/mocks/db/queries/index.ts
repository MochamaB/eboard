/**
 * Database Queries - Export all query functions
 * 
 * Some query files export the same function names. We handle conflicts here:
 * - getUserRoleOnBoard: in userBoardQueries (returns string|null) vs tables/userBoardRoles (returns row)
 * - getActionItemsByMeetingId: in minutesQueries AND actionItemsQueries
 * - getResolutionsByMeetingId: in minutesQueries AND resolutionsQueries
 */

export * from './boardQueries';
export * from './userQueries';
export * from './userBoardQueries';
export * from './meetingQueries';
export * from './agendaQueries';
export * from './votingQueries';
export * from './minutesTemplatesQueries';
export * from './userSessionQueries';
export * from './notificationQueries';

// minutesQueries — exclude conflicting names
export {
  getMinutesByMeetingId,
  getMinutesById,
  submitMinutesForReview,
  approveMinutes,
  requestMinutesRevision,
  publishMinutes,
  getCommentsByMinutesId,
  addComment,
  getCommentById,
  resolveComment,
  getSignaturesByMinutesId,
  addSignature,
} from './minutesQueries';

// actionItemsQueries — full export (wins over minutesQueries for getActionItemsByMeetingId)
export * from './actionItemsQueries';

// resolutionsQueries — full export (wins over minutesQueries for getResolutionsByMeetingId)
export * from './resolutionsQueries';

// roleQueries — selective to avoid conflicts with boardQueries.getBoardMembers
export {
  getRolePermissions,
  getRolePermissionCodes,
  getUserPermissionsOnBoard,
  getUserPermissionCodesOnBoard,
  userHasPermissionOnBoard,
  getAllUserPermissions,
  getAllUserPermissionCodes,
  getUserRoleObjectOnBoard,
  userHasGlobalRole,
  getUserGlobalRole,
  isSystemAdmin,
  isGroupChairman,
  isGroupCompanySecretary,
  getUserBoardAccess,
  canAccessAllBoards,
  getBoardChairman,
  getBoardSecretary,
} from './roleQueries';

// Re-export from tables for convenience
export { getRoleById, getRoleByCode } from '../tables/roles';
