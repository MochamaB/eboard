/**
 * Agenda Time Management Utilities
 * Functions for calculating and managing agenda item durations
 */

import type { AgendaItem } from '../types/agenda.types';

/**
 * Calculate total duration for an agenda including all items
 */
export function calculateTotalDuration(items: AgendaItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.estimatedDuration || 0);
  }, 0);
}

/**
 * Calculate duration for a specific item including its children
 */
export function calculateItemDurationWithChildren(
  itemId: string,
  allItems: AgendaItem[]
): number {
  const item = allItems.find(i => i.id === itemId);
  if (!item) return 0;

  // Get all descendants
  const descendants = getDescendants(itemId, allItems);
  
  // Sum item duration + all descendant durations
  const itemDuration = item.estimatedDuration || 0;
  const childrenDuration = descendants.reduce((sum, child) => {
    return sum + (child.estimatedDuration || 0);
  }, 0);

  return itemDuration + childrenDuration;
}

/**
 * Get all descendant items (children, grandchildren, etc.)
 */
function getDescendants(itemId: string, allItems: AgendaItem[]): AgendaItem[] {
  const descendants: AgendaItem[] = [];
  const directChildren = allItems.filter(item => item.parentItemId === itemId);

  for (const child of directChildren) {
    descendants.push(child);
    descendants.push(...getDescendants(child.id, allItems));
  }

  return descendants;
}

/**
 * Format duration in minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Calculate actual duration from start and end times
 */
export function calculateActualDuration(
  startTime: string | null,
  endTime: string | null
): number | null {
  if (!startTime || !endTime) return null;

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.round(durationMs / 60000);

  return durationMinutes;
}

/**
 * Check if agenda duration exceeds meeting scheduled duration
 */
export function checkDurationExceeded(
  agendaDuration: number,
  meetingDuration: number
): {
  exceeded: boolean;
  difference: number;
  percentage: number;
} {
  const exceeded = agendaDuration > meetingDuration;
  const difference = agendaDuration - meetingDuration;
  const percentage = (agendaDuration / meetingDuration) * 100;

  return {
    exceeded,
    difference,
    percentage,
  };
}

/**
 * Calculate remaining time in a meeting
 */
export function calculateRemainingTime(
  totalDuration: number,
  completedItems: AgendaItem[]
): number {
  const usedTime = completedItems.reduce((sum, item) => {
    return sum + (item.actualDuration || item.estimatedDuration || 0);
  }, 0);

  return totalDuration - usedTime;
}

/**
 * Get time status for an item (on-time, over-time, etc.)
 */
export function getItemTimeStatus(item: AgendaItem): {
  status: 'pending' | 'on-time' | 'over-time' | 'completed';
  variance: number | null;
} {
  if (!item.actualStartTime) {
    return { status: 'pending', variance: null };
  }

  if (!item.actualEndTime) {
    return { status: 'on-time', variance: null };
  }

  const actualDuration = item.actualDuration || 0;
  const estimatedDuration = item.estimatedDuration || 0;
  const variance = actualDuration - estimatedDuration;

  const status = variance > 0 ? 'over-time' : 'on-time';

  return { status, variance };
}
