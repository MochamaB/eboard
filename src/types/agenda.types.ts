/**
 * Agenda Management Types
 * Zod schemas and TypeScript types for agenda and agenda items
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const AgendaStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
]);

export const AgendaItemTypeSchema = z.enum([
  'discussion',       // Topic for discussion, no vote
  'decision',         // Requires vote or resolution
  'information',      // Report or update, no discussion
  'committee_report', // Report from committee
]);

export const AgendaItemStatusSchema = z.enum([
  'pending',      // Not started yet
  'in_progress',  // Currently being discussed
  'completed',    // Discussion completed
  'skipped',      // Skipped/postponed
]);

// ============================================================================
// NESTED SCHEMAS
// ============================================================================

// Agenda Item
export const AgendaItemSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  agendaId: z.string(),

  // Order and hierarchy
  orderIndex: z.number(),
  parentItemId: z.string().nullable().optional(), // For sub-items (e.g., 2.1, 2.2)
  itemNumber: z.string(), // Auto-generated: "1", "2.1", "3", etc.

  // Basic info
  title: z.string(),
  description: z.string().optional(),
  itemType: AgendaItemTypeSchema,

  // Time allocation
  estimatedDuration: z.number(), // minutes

  // Presenter
  presenterId: z.number().nullable().optional(),
  presenterName: z.string().nullable().optional(),

  // Execution tracking (during meeting)
  status: AgendaItemStatusSchema.default('pending'),
  actualStartTime: z.string().nullable().optional(),
  actualEndTime: z.string().nullable().optional(),
  actualDuration: z.number().nullable().optional(), // calculated

  // Document attachments
  attachedDocumentIds: z.array(z.string()).default([]),

  // Ad-hoc items (added during meeting)
  isAdHoc: z.boolean().default(false),

  // Metadata
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Agenda (parent of items)
export const AgendaSchema = z.object({
  id: z.string(),
  meetingId: z.string(),

  // Status
  status: AgendaStatusSchema,

  // Publishing
  publishedAt: z.string().nullable().optional(),
  publishedBy: z.number().nullable().optional(),
  publishedByName: z.string().nullable().optional(),
  pdfDocumentId: z.string().nullable().optional(), // Generated PDF
  pdfDocumentUrl: z.string().nullable().optional(),
  version: z.number().default(1), // Increments on republish

  // Items
  items: z.array(AgendaItemSchema),
  totalEstimatedDuration: z.number(), // Sum of all items

  // Template info (if created from template)
  templateId: z.string().nullable().optional(),
  templateName: z.string().nullable().optional(),

  // Metadata
  createdBy: z.number(),
  createdByName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Agenda Template Item (for templates)
export const AgendaTemplateItemSchema = z.object({
  orderIndex: z.number(),
  parentItemId: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().optional(),
  itemType: AgendaItemTypeSchema,
  estimatedDuration: z.number(),
});

// Agenda Template
export const AgendaTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),

  // Board type filter
  boardType: z.enum(['main', 'subsidiary', 'factory', 'committee', 'all']),

  // Template items (no meetingId/agendaId)
  items: z.array(AgendaTemplateItemSchema),

  // Metadata
  createdBy: z.number(),
  createdByName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isGlobal: z.boolean().default(false), // Admin templates
});

// ============================================================================
// API PAYLOADS
// ============================================================================

// Item payload for document import (simplified, no IDs)
export const ImportedAgendaItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  itemType: AgendaItemTypeSchema,
  estimatedDuration: z.number(),
  orderIndex: z.number(),
});

export const CreateAgendaPayloadSchema = z.object({
  meetingId: z.string(),
  templateId: z.string().optional(), // If creating from template
  items: z.array(ImportedAgendaItemSchema).optional(), // If importing from document
});

export const UpdateAgendaPayloadSchema = z.object({
  status: AgendaStatusSchema.optional(),
});

export const CreateAgendaItemPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  itemType: AgendaItemTypeSchema,
  estimatedDuration: z.number().min(1).max(480).default(15),
  presenterId: z.number().nullable().optional(),
  presenterName: z.string().nullable().optional(),
  parentItemId: z.string().nullable().optional(),
  orderIndex: z.number(),
  isAdHoc: z.boolean().default(false),
  attachedDocumentIds: z.array(z.string()).default([]),
});

export const UpdateAgendaItemPayloadSchema = CreateAgendaItemPayloadSchema.partial().extend({
  status: AgendaItemStatusSchema.optional(),
  actualStartTime: z.string().optional(),
  actualEndTime: z.string().optional(),
});

export const ReorderAgendaItemsPayloadSchema = z.object({
  itemOrders: z.array(z.object({
    itemId: z.string(),
    orderIndex: z.number(),
    parentItemId: z.string().nullable().optional(),
  })),
});

export const PublishAgendaPayloadSchema = z.object({
  publishedBy: z.number(),
});

export const CreateAgendaTemplatePayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  boardType: z.enum(['main', 'subsidiary', 'factory', 'committee', 'all']),
  items: z.array(AgendaTemplateItemSchema),
  isGlobal: z.boolean().default(false),
});

export const UpdateAgendaTemplatePayloadSchema = CreateAgendaTemplatePayloadSchema.partial();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AgendaStatus = z.infer<typeof AgendaStatusSchema>;
export type AgendaItemType = z.infer<typeof AgendaItemTypeSchema>;
export type AgendaItemStatus = z.infer<typeof AgendaItemStatusSchema>;
export type AgendaItem = z.infer<typeof AgendaItemSchema>;
export type Agenda = z.infer<typeof AgendaSchema>;
export type AgendaTemplateItem = z.infer<typeof AgendaTemplateItemSchema>;
export type AgendaTemplate = z.infer<typeof AgendaTemplateSchema>;
export type ImportedAgendaItem = z.infer<typeof ImportedAgendaItemSchema>;
export type CreateAgendaPayload = z.infer<typeof CreateAgendaPayloadSchema>;
export type UpdateAgendaPayload = z.infer<typeof UpdateAgendaPayloadSchema>;
export type CreateAgendaItemPayload = z.infer<typeof CreateAgendaItemPayloadSchema>;
export type UpdateAgendaItemPayload = z.infer<typeof UpdateAgendaItemPayloadSchema>;
export type ReorderAgendaItemsPayload = z.infer<typeof ReorderAgendaItemsPayloadSchema>;
export type PublishAgendaPayload = z.infer<typeof PublishAgendaPayloadSchema>;
export type CreateAgendaTemplatePayload = z.infer<typeof CreateAgendaTemplatePayloadSchema>;
export type UpdateAgendaTemplatePayload = z.infer<typeof UpdateAgendaTemplatePayloadSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const AGENDA_STATUS_LABELS: Record<AgendaStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

export const AGENDA_STATUS_COLORS: Record<AgendaStatus, string> = {
  draft: 'default',
  published: 'success',
  archived: 'default',
};

export const AGENDA_ITEM_TYPE_LABELS: Record<AgendaItemType, string> = {
  discussion: 'Discussion',
  decision: 'Decision',
  information: 'Information',
  committee_report: 'Committee Report',
};

export const AGENDA_ITEM_TYPE_ICONS: Record<AgendaItemType, string> = {
  discussion: '💬',
  decision: '✓',
  information: 'ℹ️',
  committee_report: '📋',
};

export const AGENDA_ITEM_TYPE_COLORS: Record<AgendaItemType, string> = {
  discussion: 'blue',
  decision: 'green',
  information: 'cyan',
  committee_report: 'purple',
};

export const AGENDA_ITEM_STATUS_LABELS: Record<AgendaItemStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
};

export const AGENDA_ITEM_STATUS_COLORS: Record<AgendaItemStatus, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  skipped: 'warning',
};

// Default durations by item type (minutes)
export const DEFAULT_ITEM_DURATIONS: Record<AgendaItemType, number> = {
  discussion: 15,
  decision: 20,
  information: 10,
  committee_report: 15,
};
