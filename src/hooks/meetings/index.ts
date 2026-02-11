/**
 * Meeting Hooks Barrel Export
 * Centralized export for all meeting-related hooks
 */

export { useMeetingPermissions } from './useMeetingPermissions';
export { useMeetingRoomPermissions } from './useMeetingRoomPermissions';
export { useModeVisibility } from './useModeVisibility';

// Re-export types for convenience
export type { 
  MeetingPermissions, 
  MeetingRoomPermissions,
  PermissionContext,
  RoomState,
} from '../../types/meetingPermissions.types';
export type { ModeVisibility } from './useModeVisibility';
