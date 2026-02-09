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
export * from './meetingEvents'; // NEW - Event-driven audit log
export * from './meetingConfirmationHistory'; // DEPRECATED - Use meetingEvents instead
export * from './agendas';
export * from './agendaItems';
export * from './agendaTemplates';

// Voting tables (multi-table architecture)
export * from './votes';
export * from './voteConfigurations';
export * from './voteOptions';
export * from './voteEligibility';
export * from './votesCast';
export * from './voteActions';
export * from './voteResults';

// Minutes tables
export * from './minutes';
export * from './minutesComments';
export * from './minutesSignatures';
export * from './minutesTemplates';
export * from './actionItems';
export * from './resolutions';

// DEPRECATED: boardMemberships.ts - replaced by userBoardRoles.ts
// export * from './boardMemberships';
