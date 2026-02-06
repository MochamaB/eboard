/**
 * Meeting Confirmation Requirements Helper
 * Determines if a meeting requires confirmation based on business rules
 */

import type { MeetingType } from '../types/meeting.types';

export interface BoardConfirmationSettings {
  type: 'main' | 'subsidiary' | 'committee' | 'factory';
  confirmationRequired?: boolean;
  approverRoleId?: number;
}

/**
 * Check if a meeting requires confirmation based on board type, meeting type, and board settings
 * 
 * Business Rules:
 * - Main Board meetings ALWAYS require confirmation
 * - Emergency meetings skip confirmation (override)
 * - AGM always requires confirmation (override)
 * - Factory/Subsidiary: check board settings
 * - Committees: typically optional (check board settings)
 */
export const checkConfirmationRequired = (
  boardType: 'main' | 'subsidiary' | 'committee' | 'factory',
  meetingType: MeetingType,
  boardSettings?: BoardConfirmationSettings
): boolean => {
  // Emergency meetings skip confirmation (highest priority)
  if (meetingType === 'emergency') {
    return false;
  }

  // AGM always requires confirmation
  if (meetingType === 'agm') {
    return true;
  }

  // Main Board meetings ALWAYS require confirmation
  if (boardType === 'main') {
    return true;
  }

  // Factory/Subsidiary: check board settings
  if (boardType === 'factory' || boardType === 'subsidiary') {
    return boardSettings?.confirmationRequired ?? true; // Default to true for safety
  }

  // Committees: typically optional, check board settings
  if (boardType === 'committee') {
    return boardSettings?.confirmationRequired ?? false; // Default to false for committees
  }

  // Default: require confirmation for safety
  return true;
};

/**
 * Get the initial status for a new meeting based on confirmation requirement
 * Returns status+subStatus per the new meeting lifecycle model
 */
export const getInitialMeetingStatus = (requiresConfirmation: boolean): { 
  status: 'draft' | 'scheduled'; 
  subStatus: 'incomplete' | 'approved' 
} => {
  // All new meetings start as draft.incomplete
  // They transition to scheduled.approved if no approval required
  return requiresConfirmation 
    ? { status: 'draft', subStatus: 'incomplete' }
    : { status: 'scheduled', subStatus: 'approved' };
};

/**
 * Get the approver role for a meeting based on board type
 * Returns the role code that should approve the meeting
 */
export const getApproverRole = (boardType: 'main' | 'subsidiary' | 'committee' | 'factory'): string => {
  switch (boardType) {
    case 'main':
      return 'group_company_secretary'; // Main board requires Group Company Secretary
    case 'subsidiary':
      return 'company_secretary'; // Subsidiary requires Company Secretary
    case 'factory':
      return 'company_secretary'; // Factory board requires Company Secretary
    case 'committee':
      return 'chairman'; // Committee requires Chairman approval
    default:
      return 'group_company_secretary'; // Default to highest authority
  }
};
