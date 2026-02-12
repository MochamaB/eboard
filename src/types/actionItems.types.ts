/**
 * Action Items Types - Task management from meetings and minutes
 * Zod schemas and TypeScript types for action items
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & STATUS
// ============================================================================

export const ActionItemStatusSchema = z.enum([
  'open',         // Not started
  'in_progress',  // Work in progress
  'completed',    // Task completed
  'cancelled',    // Task cancelled
]);

export type ActionItemStatus = z.infer<typeof ActionItemStatusSchema>;

export const ActionItemPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

export type ActionItemPriority = z.infer<typeof ActionItemPrioritySchema>;

export const ActionItemSourceSchema = z.enum([
  'minutes',      // Created from minutes
  'meeting',      // Created during meeting
  'agenda_item',  // Linked to specific agenda item
  'manual',       // Manually created
]);

export type ActionItemSource = z.infer<typeof ActionItemSourceSchema>;

// ============================================================================
// ACTION ITEM SCHEMA
// ============================================================================

export const ActionItemSchema = z.object({
  id: z.string(),

  // Source tracking (polymorphic)
  source: ActionItemSourceSchema,
  sourceId: z.string().nullable().optional(),  // minutesId, meetingId, agendaItemId
  meetingId: z.string(),                        // Always link to meeting for context
  boardId: z.string(),

  // Action details
  title: z.string(),
  description: z.string().nullable().optional(),

  // Assignment
  assignedTo: z.number(),                       // userId
  assignedToName: z.string().optional(),         // Resolved display name
  assignedBy: z.number(),                       // userId

  // Timeline
  dueDate: z.string(),                          // ISO date
  priority: ActionItemPrioritySchema,

  // Status
  status: ActionItemStatusSchema,
  completedAt: z.string().nullable().optional(),
  completedBy: z.number().nullable().optional(),
  completionNotes: z.string().nullable().optional(),

  // Related entities
  relatedAgendaItemId: z.string().nullable().optional(),
  relatedDocumentIds: z.array(z.string()).optional().default([]),

  // Reminders
  reminderSent: z.boolean().default(false),
  lastReminderSentAt: z.string().nullable().optional(),

  // Metadata
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ActionItem = z.infer<typeof ActionItemSchema>;

// ============================================================================
// API PAYLOADS
// ============================================================================

// Create Action Item
export const CreateActionItemPayloadSchema = z.object({
  meetingId: z.string(),
  boardId: z.string(),
  source: ActionItemSourceSchema.optional().default('manual'),
  sourceId: z.string().optional(),

  title: z.string(),
  description: z.string().optional(),

  assignedTo: z.number(),
  dueDate: z.string(),
  priority: ActionItemPrioritySchema.optional().default('medium'),

  relatedAgendaItemId: z.string().optional(),
  relatedDocumentIds: z.array(z.string()).optional(),
});

export type CreateActionItemPayload = z.infer<typeof CreateActionItemPayloadSchema>;

// Update Action Item
export const UpdateActionItemPayloadSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  assignedTo: z.number().optional(),
  dueDate: z.string().optional(),
  priority: ActionItemPrioritySchema.optional(),
  relatedDocumentIds: z.array(z.string()).optional(),
});

export type UpdateActionItemPayload = z.infer<typeof UpdateActionItemPayloadSchema>;

// Update Status
export const UpdateActionItemStatusPayloadSchema = z.object({
  status: ActionItemStatusSchema,
  completionNotes: z.string().optional(),
});

export type UpdateActionItemStatusPayload = z.infer<typeof UpdateActionItemStatusPayloadSchema>;

// Complete Action Item
export const CompleteActionItemPayloadSchema = z.object({
  completionNotes: z.string().optional(),
});

export type CompleteActionItemPayload = z.infer<typeof CompleteActionItemPayloadSchema>;

// ============================================================================
// FILTER & QUERY SCHEMAS
// ============================================================================

export const ActionItemFiltersSchema = z.object({
  meetingId: z.string().optional(),
  boardId: z.string().optional(),
  assignedTo: z.number().optional(),
  status: ActionItemStatusSchema.optional(),
  priority: ActionItemPrioritySchema.optional(),
  source: ActionItemSourceSchema.optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  overdue: z.boolean().optional(),
});

export type ActionItemFilters = z.infer<typeof ActionItemFiltersSchema>;

// ============================================================================
// STATISTICS
// ============================================================================

export interface ActionItemsStats {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  overdue: number;
  dueSoon: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ACTION_ITEM_STATUS_LABELS: Record<ActionItemStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ACTION_ITEM_STATUS_COLORS: Record<ActionItemStatus, string> = {
  open: 'default',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
};

export const ACTION_ITEM_STATUS_ICONS: Record<ActionItemStatus, string> = {
  open: 'FileTextOutlined',
  in_progress: 'SyncOutlined',
  completed: 'CheckCircleOutlined',
  cancelled: 'CloseCircleOutlined',
};

export const ACTION_ITEM_PRIORITY_LABELS: Record<ActionItemPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const ACTION_ITEM_PRIORITY_COLORS: Record<ActionItemPriority, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export const ACTION_ITEM_PRIORITY_ICONS: Record<ActionItemPriority, string> = {
  low: 'ArrowDownOutlined',
  medium: 'MinusOutlined',
  high: 'ArrowUpOutlined',
  urgent: 'WarningOutlined',
};

export const ACTION_ITEM_SOURCE_LABELS: Record<ActionItemSource, string> = {
  minutes: 'From Minutes',
  meeting: 'From Meeting',
  agenda_item: 'From Agenda',
  manual: 'Manual',
};

// Helper: Check if action item is overdue
export const isActionItemOverdue = (actionItem: ActionItem): boolean => {
  if (actionItem.status === 'completed' || actionItem.status === 'cancelled') {
    return false;
  }
  return new Date(actionItem.dueDate) < new Date();
};

// Helper: Get days until due
export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
