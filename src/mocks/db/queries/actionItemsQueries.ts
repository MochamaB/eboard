/**
 * Action Items Query Helpers
 * Helper functions for querying action items data
 */

import { actionItemsTable } from '../tables/actionItems';
import type {
  ActionItemRow,
  ActionItemStatus,
  ActionItemPriority,
  ActionItemSource,
} from '../tables/actionItems';
import { idsMatch } from '../utils/idUtils';

// ============================================================================
// ACTION ITEMS QUERIES
// ============================================================================

/**
 * Get action item by ID
 */
export function getActionItemById(actionItemId: string): ActionItemRow | null {
  return actionItemsTable.find(a => idsMatch(a.id, actionItemId)) || null;
}

/**
 * Get action items by meeting ID
 */
export function getActionItemsByMeetingId(meetingId: string): ActionItemRow[] {
  return actionItemsTable
    .filter(a => idsMatch(a.meetingId, meetingId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get action items by board ID
 */
export function getActionItemsByBoardId(boardId: string): ActionItemRow[] {
  return actionItemsTable
    .filter(a => idsMatch(a.boardId, boardId))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Get action items assigned to user
 */
export function getActionItemsByAssignee(userId: number): ActionItemRow[] {
  return actionItemsTable
    .filter(a => a.assignedTo === userId)
    .sort((a, b) => {
      // Sort by priority first, then due date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
}

/**
 * Get action items by source
 */
export function getActionItemsBySource(
  source: ActionItemSource,
  sourceId: string
): ActionItemRow[] {
  return actionItemsTable.filter(
    a => a.source === source && a.sourceId && idsMatch(a.sourceId, sourceId)
  );
}

/**
 * Get all action items with filters
 */
export function getAllActionItems(filters?: {
  meetingId?: string;
  boardId?: string;
  assignedTo?: number;
  status?: ActionItemStatus;
  priority?: ActionItemPriority;
  source?: ActionItemSource;
  overdue?: boolean;
}): ActionItemRow[] {
  let results = [...actionItemsTable];

  if (filters?.meetingId) {
    results = results.filter(a => idsMatch(a.meetingId, filters.meetingId!));
  }

  if (filters?.boardId) {
    results = results.filter(a => idsMatch(a.boardId, filters.boardId!));
  }

  if (filters?.assignedTo) {
    results = results.filter(a => a.assignedTo === filters.assignedTo);
  }

  if (filters?.status) {
    results = results.filter(a => a.status === filters.status);
  }

  if (filters?.priority) {
    results = results.filter(a => a.priority === filters.priority);
  }

  if (filters?.source) {
    results = results.filter(a => a.source === filters.source);
  }

  if (filters?.overdue) {
    const now = new Date();
    results = results.filter(a => {
      if (a.status === 'completed' || a.status === 'cancelled') return false;
      return new Date(a.dueDate) < now;
    });
  }

  return results.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

/**
 * Get overdue action items
 */
export function getOverdueActionItems(userId?: number): ActionItemRow[] {
  const now = new Date();
  let results = actionItemsTable.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false;
    return new Date(a.dueDate) < now;
  });

  if (userId) {
    results = results.filter(a => a.assignedTo === userId);
  }

  return results.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

/**
 * Get action items due soon (within next 7 days)
 */
export function getActionItemsDueSoon(userId?: number): ActionItemRow[] {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  let results = actionItemsTable.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false;
    const dueDate = new Date(a.dueDate);
    return dueDate >= now && dueDate <= sevenDaysFromNow;
  });

  if (userId) {
    results = results.filter(a => a.assignedTo === userId);
  }

  return results.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

/**
 * Create action item
 */
export function createActionItem(data: {
  meetingId: string;
  boardId: string;
  source?: ActionItemSource;
  sourceId?: string;
  title: string;
  description?: string;
  assignedTo: number;
  assignedBy: number;
  dueDate: string;
  priority?: ActionItemPriority;
  relatedAgendaItemId?: string;
  relatedDocumentIds?: string[];
}): ActionItemRow {
  const now = new Date().toISOString();
  const newActionItem: ActionItemRow = {
    id: `action-${data.meetingId}-${Date.now()}`,
    source: data.source || 'manual',
    sourceId: data.sourceId || null,
    meetingId: data.meetingId,
    boardId: data.boardId,
    title: data.title,
    description: data.description || null,
    assignedTo: data.assignedTo,
    assignedBy: data.assignedBy,
    dueDate: data.dueDate,
    priority: data.priority || 'medium',
    status: 'open',
    completedAt: null,
    completedBy: null,
    completionNotes: null,
    relatedAgendaItemId: data.relatedAgendaItemId || null,
    relatedDocumentIds: JSON.stringify(data.relatedDocumentIds || []),
    reminderSent: false,
    lastReminderSentAt: null,
    createdAt: now,
    updatedAt: now,
  };

  actionItemsTable.push(newActionItem);
  return newActionItem;
}

/**
 * Update action item
 */
export function updateActionItem(
  actionItemId: string,
  data: {
    title?: string;
    description?: string;
    assignedTo?: number;
    dueDate?: string;
    priority?: ActionItemPriority;
    relatedDocumentIds?: string[];
  }
): ActionItemRow | null {
  const index = actionItemsTable.findIndex(a => idsMatch(a.id, actionItemId));
  if (index === -1) return null;

  const actionItem = actionItemsTable[index];

  actionItemsTable[index] = {
    ...actionItem,
    title: data.title !== undefined ? data.title : actionItem.title,
    description: data.description !== undefined ? data.description : actionItem.description,
    assignedTo: data.assignedTo !== undefined ? data.assignedTo : actionItem.assignedTo,
    dueDate: data.dueDate !== undefined ? data.dueDate : actionItem.dueDate,
    priority: data.priority !== undefined ? data.priority : actionItem.priority,
    relatedDocumentIds: data.relatedDocumentIds !== undefined
      ? JSON.stringify(data.relatedDocumentIds)
      : actionItem.relatedDocumentIds,
    updatedAt: new Date().toISOString(),
  };

  return actionItemsTable[index];
}

/**
 * Update action item status
 */
export function updateActionItemStatus(
  actionItemId: string,
  status: ActionItemStatus,
  completionNotes?: string
): ActionItemRow | null {
  const index = actionItemsTable.findIndex(a => idsMatch(a.id, actionItemId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  const actionItem = actionItemsTable[index];

  actionItemsTable[index] = {
    ...actionItem,
    status,
    completedAt: status === 'completed' ? now : null,
    completedBy: status === 'completed' ? actionItem.assignedTo : null,
    completionNotes: completionNotes || null,
    updatedAt: now,
  };

  return actionItemsTable[index];
}

/**
 * Complete action item
 */
export function completeActionItem(
  actionItemId: string,
  completedBy: number,
  completionNotes?: string
): ActionItemRow | null {
  const index = actionItemsTable.findIndex(a => idsMatch(a.id, actionItemId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  actionItemsTable[index] = {
    ...actionItemsTable[index],
    status: 'completed',
    completedAt: now,
    completedBy,
    completionNotes: completionNotes || null,
    updatedAt: now,
  };

  return actionItemsTable[index];
}

/**
 * Delete action item
 */
export function deleteActionItem(actionItemId: string): boolean {
  const index = actionItemsTable.findIndex(a => idsMatch(a.id, actionItemId));
  if (index === -1) return false;

  actionItemsTable.splice(index, 1);
  return true;
}

/**
 * Mark reminder sent
 */
export function markReminderSent(actionItemId: string): ActionItemRow | null {
  const index = actionItemsTable.findIndex(a => idsMatch(a.id, actionItemId));
  if (index === -1) return null;

  actionItemsTable[index] = {
    ...actionItemsTable[index],
    reminderSent: true,
    lastReminderSentAt: new Date().toISOString(),
  };

  return actionItemsTable[index];
}

/**
 * Get action items statistics for a user
 */
export function getActionItemsStats(userId: number): {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueSoon: number;
} {
  const userItems = getActionItemsByAssignee(userId);
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    total: userItems.length,
    open: userItems.filter(a => a.status === 'open').length,
    inProgress: userItems.filter(a => a.status === 'in_progress').length,
    completed: userItems.filter(a => a.status === 'completed').length,
    overdue: userItems.filter(a => {
      if (a.status === 'completed' || a.status === 'cancelled') return false;
      return new Date(a.dueDate) < now;
    }).length,
    dueSoon: userItems.filter(a => {
      if (a.status === 'completed' || a.status === 'cancelled') return false;
      const dueDate = new Date(a.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    }).length,
  };
}
