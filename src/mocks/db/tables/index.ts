/**
 * Database Tables - Export all tables
 */

export * from './boards';
export * from './users';
export * from './userSessions';
export * from './roles';
export * from './permissions';
export * from './rolePermissions';
export * from './userBoardRoles';
export * from './boardSettings';
export * from './boardTypes';

// Document tables (refactored - lean architecture)
export * from './documents';
export * from './documentAttachments';
export * from './documentVersions';
export * from './documentSignatures';
export * from './documentAccessLogs';
export * from './documentPermissions';
export * from './documentTags';
export * from './documentCategories';

// Meeting tables
export * from './meetings';
export * from './meetingTypes';
export * from './meetingParticipants';
export * from './meetingConfirmationHistory';
export * from './agendas';
export * from './agendaItems';
export * from './agendaTemplates';

// DEPRECATED: boardMemberships.ts - replaced by userBoardRoles.ts
// export * from './boardMemberships';
