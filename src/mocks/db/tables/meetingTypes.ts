/**
 * Meeting Types Table
 * Defines the different types of meetings in the system
 */

import type { MeetingType } from '../../../types/meeting.types';

export interface MeetingTypeRow {
  id: string;
  code: MeetingType;
  label: string;
  description: string;
  defaultDuration: number; // in minutes
  requiresNotice: boolean; // requires advance notice
  noticeMinimumDays?: number; // minimum days notice required
  sortOrder: number;
}

export const meetingTypesTable: MeetingTypeRow[] = [
  {
    id: 'mt-1',
    code: 'regular',
    label: 'Regular Board Meeting',
    description: 'Scheduled periodic board meeting',
    defaultDuration: 240, // 4 hours
    requiresNotice: true,
    noticeMinimumDays: 7,
    sortOrder: 1,
  },
  {
    id: 'mt-2',
    code: 'special',
    label: 'Special Board Meeting',
    description: 'Ad-hoc meeting for specific matters',
    defaultDuration: 180, // 3 hours
    requiresNotice: true,
    noticeMinimumDays: 3,
    sortOrder: 2,
  },
  {
    id: 'mt-3',
    code: 'agm',
    label: 'Annual General Meeting',
    description: 'Yearly shareholders meeting',
    defaultDuration: 300, // 5 hours
    requiresNotice: true,
    noticeMinimumDays: 21,
    sortOrder: 3,
  },
  {
    id: 'mt-4',
    code: 'emergency',
    label: 'Emergency Board Meeting',
    description: 'Urgent matters requiring immediate attention',
    defaultDuration: 120, // 2 hours
    requiresNotice: false,
    sortOrder: 4,
  },
  {
    id: 'mt-5',
    code: 'committee',
    label: 'Committee Meeting',
    description: 'Specialized committee session',
    defaultDuration: 120, // 2 hours
    requiresNotice: true,
    noticeMinimumDays: 5,
    sortOrder: 5,
  },
];

// Helper function to get meeting type by code
export const getMeetingTypeByCode = (code: MeetingType): MeetingTypeRow | undefined => {
  return meetingTypesTable.find(mt => mt.code === code);
};

// Helper function to get all meeting types sorted
export const getAllMeetingTypes = (): MeetingTypeRow[] => {
  return meetingTypesTable.sort((a, b) => a.sortOrder - b.sortOrder);
};

// Helper function to get meeting types for a specific board type
export const getMeetingTypesForBoardType = (boardType: 'main' | 'subsidiary' | 'committee' | 'factory'): MeetingTypeRow[] => {
  // Committees typically only have committee meetings
  if (boardType === 'committee') {
    return meetingTypesTable.filter(mt => mt.code === 'committee' || mt.code === 'regular');
  }
  
  // Main boards have access to all meeting types
  return getAllMeetingTypes();
};
