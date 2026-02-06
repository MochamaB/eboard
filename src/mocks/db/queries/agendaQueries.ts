/**
 * Agenda Query Helpers
 * Helper functions for querying agenda-related data
 */

import { agendasTable, AgendaRow } from '../tables/agendas';
import { agendaItemsTable, AgendaItemRow } from '../tables/agendaItems';
import { agendaTemplatesTable, AgendaTemplateRow, AgendaTemplateItemData } from '../tables/agendaTemplates';
import type { Agenda, AgendaItem, AgendaTemplate } from '../../../types/agenda.types';
import { idsMatch } from '../utils/idUtils';

/**
 * Get agenda with items by meeting ID
 */
export function getAgendaByMeetingId(meetingId: string): Agenda | null {
  const agendaRow = agendasTable.find(a => idsMatch(a.meetingId, meetingId));
  if (!agendaRow) return null;

  const items = agendaItemsTable
    .filter(item => idsMatch(item.agendaId, agendaRow.id))
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapAgendaItemRowToType);

  const totalEstimatedDuration = items.reduce((sum, item) => sum + item.estimatedDuration, 0);

  return {
    ...agendaRow,
    items,
    totalEstimatedDuration,
  };
}

/**
 * Get agenda by ID
 */
export function getAgendaById(agendaId: string): Agenda | null {
  const agendaRow = agendasTable.find(a => idsMatch(a.id, agendaId));
  if (!agendaRow) return null;

  const items = agendaItemsTable
    .filter(item => idsMatch(item.agendaId, agendaId))
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapAgendaItemRowToType);

  const totalEstimatedDuration = items.reduce((sum, item) => sum + item.estimatedDuration, 0);

  return {
    ...agendaRow,
    items,
    totalEstimatedDuration,
  };
}

/**
 * Get single agenda item by ID
 */
export function getAgendaItemById(itemId: string): AgendaItem | null {
  const itemRow = agendaItemsTable.find(item => idsMatch(item.id, itemId));
  if (!itemRow) return null;

  return mapAgendaItemRowToType(itemRow);
}

/**
 * Get all agenda templates
 */
export function getAllAgendaTemplates(boardType?: string): AgendaTemplate[] {
  let templates = agendaTemplatesTable;

  if (boardType && boardType !== 'all') {
    templates = templates.filter(t => t.boardType === boardType || t.boardType === 'all');
  }

  return templates.map(mapTemplateRowToType);
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): AgendaTemplate | null {
  const template = agendaTemplatesTable.find(t => idsMatch(t.id, templateId));
  if (!template) return null;

  return mapTemplateRowToType(template);
}

/**
 * Create agenda from template
 */
export function createAgendaFromTemplate(
  meetingId: string,
  templateId: string,
  createdBy: number,
  createdByName: string
): { agendaId: string; itemIds: string[] } {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  // Generate agenda ID
  const agendaId = `agenda-${meetingId}`;

  // Create agenda row
  const now = new Date().toISOString();
  const newAgenda: AgendaRow = {
    id: agendaId,
    meetingId,
    status: 'draft',
    publishedAt: null,
    publishedBy: null,
    publishedByName: null,
    pdfDocumentId: null,
    pdfDocumentUrl: null,
    version: 1,
    templateId: template.id,
    templateName: template.name,
    createdBy,
    createdByName,
    createdAt: now,
    updatedAt: now,
  };

  agendasTable.push(newAgenda);

  // Create agenda items from template
  const itemIds: string[] = [];
  template.items.forEach((templateItem, index) => {
    const itemId = `item-${agendaId}-${String(index + 1).padStart(3, '0')}`;
    itemIds.push(itemId);

    const newItem: AgendaItemRow = {
      id: itemId,
      meetingId,
      agendaId,
      orderIndex: templateItem.orderIndex,
      parentItemId: templateItem.parentItemId || null,
      itemNumber: String(templateItem.orderIndex),
      title: templateItem.title,
      description: templateItem.description || null,
      itemType: templateItem.itemType,
      estimatedDuration: templateItem.estimatedDuration,
      presenterId: null,
      presenterName: null,
      status: 'pending',
      actualStartTime: null,
      actualEndTime: null,
      actualDuration: null,
      attachedDocumentIds: '[]',
      isAdHoc: false,
      createdAt: now,
      updatedAt: now,
    };

    agendaItemsTable.push(newItem);
  });

  // Calculate item numbers
  const items = agendaItemsTable.filter(item => idsMatch(item.agendaId, agendaId));
  calculateItemNumbers(items);

  return { agendaId, itemIds };
}

/**
 * Calculate item numbers (1, 2, 2.1, 2.2, 3, etc.)
 */
export function calculateItemNumbers(items: AgendaItemRow[]): void {
  const sortedItems = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const numberMap = new Map<string | null, number>();

  sortedItems.forEach(item => {
    if (!item.parentItemId) {
      // Top-level item
      const num = (numberMap.get(null) || 0) + 1;
      numberMap.set(null, num);
      item.itemNumber = num.toString();
    } else {
      // Sub-item
      const parent = sortedItems.find(i => item.parentItemId && idsMatch(i.id, item.parentItemId));
      if (parent) {
        const subNum = (numberMap.get(item.parentItemId) || 0) + 1;
        numberMap.set(item.parentItemId, subNum);
        item.itemNumber = `${parent.itemNumber}.${subNum}`;
      }
    }
  });
}

/**
 * Map AgendaItemRow to AgendaItem type
 */
function mapAgendaItemRowToType(row: AgendaItemRow): AgendaItem {
  return {
    ...row,
    description: row.description || undefined,
    presenterId: row.presenterId || undefined,
    presenterName: row.presenterName || undefined,
    actualStartTime: row.actualStartTime || undefined,
    actualEndTime: row.actualEndTime || undefined,
    actualDuration: row.actualDuration || undefined,
    attachedDocumentIds: JSON.parse(row.attachedDocumentIds),
    parentItemId: row.parentItemId || undefined,
  };
}

/**
 * Map AgendaTemplateRow to AgendaTemplate type
 */
function mapTemplateRowToType(row: AgendaTemplateRow): AgendaTemplate {
  return {
    ...row,
    description: row.description || undefined,
    items: JSON.parse(row.items) as AgendaTemplateItemData[],
  };
}

/**
 * Update agenda status
 */
export function updateAgendaStatus(
  agendaId: string,
  status: 'draft' | 'published' | 'archived',
  publishedBy?: number,
  publishedByName?: string
): void {
  const agenda = agendasTable.find(a => idsMatch(a.id, agendaId));
  if (!agenda) {
    throw new Error(`Agenda ${agendaId} not found`);
  }

  agenda.status = status;
  agenda.updatedAt = new Date().toISOString();

  if (status === 'published') {
    agenda.publishedAt = new Date().toISOString();
    agenda.publishedBy = publishedBy || null;
    agenda.publishedByName = publishedByName || null;
    agenda.pdfDocumentId = `${agendaId}-pdf`;
    agenda.pdfDocumentUrl = `/mock-documents/${agendaId}.pdf`;
  }
}

/**
 * Add new agenda item
 */
export function addAgendaItem(
  agendaId: string,
  meetingId: string,
  itemData: Partial<AgendaItemRow>
): string {
  const agenda = agendasTable.find(a => idsMatch(a.id, agendaId));
  if (!agenda) {
    throw new Error(`Agenda ${agendaId} not found`);
  }

  const existingItems = agendaItemsTable.filter(item => idsMatch(item.agendaId, agendaId));
  const nextOrderIndex = Math.max(0, ...existingItems.map(i => i.orderIndex)) + 1;

  const itemId = `item-${agendaId}-${String(nextOrderIndex).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newItem: AgendaItemRow = {
    id: itemId,
    meetingId,
    agendaId,
    orderIndex: itemData.orderIndex ?? nextOrderIndex,
    parentItemId: itemData.parentItemId || null,
    itemNumber: String(itemData.orderIndex ?? nextOrderIndex),
    title: itemData.title || 'Untitled Item',
    description: itemData.description || null,
    itemType: itemData.itemType || 'discussion',
    estimatedDuration: itemData.estimatedDuration || 15,
    presenterId: itemData.presenterId || null,
    presenterName: itemData.presenterName || null,
    status: itemData.status || 'pending',
    actualStartTime: itemData.actualStartTime || null,
    actualEndTime: itemData.actualEndTime || null,
    actualDuration: itemData.actualDuration || null,
    attachedDocumentIds: itemData.attachedDocumentIds || '[]',
    isAdHoc: itemData.isAdHoc || false,
    createdAt: now,
    updatedAt: now,
  };

  agendaItemsTable.push(newItem);

  // Recalculate item numbers
  const items = agendaItemsTable.filter(item => idsMatch(item.agendaId, agendaId));
  calculateItemNumbers(items);

  // Update agenda timestamp
  agenda.updatedAt = now;

  return itemId;
}

/**
 * Update agenda item
 */
export function updateAgendaItem(itemId: string, updates: Partial<AgendaItemRow>): void {
  const item = agendaItemsTable.find(i => idsMatch(i.id, itemId));
  if (!item) {
    throw new Error(`Agenda item ${itemId} not found`);
  }

  Object.assign(item, updates, { updatedAt: new Date().toISOString() });

  // If order changed, recalculate numbers
  if (updates.orderIndex !== undefined || updates.parentItemId !== undefined) {
    const items = agendaItemsTable.filter(i => idsMatch(i.agendaId, item.agendaId));
    calculateItemNumbers(items);
  }
}

/**
 * Delete agenda item
 */
export function deleteAgendaItem(itemId: string): void {
  const index = agendaItemsTable.findIndex(i => idsMatch(i.id, itemId));
  if (index === -1) {
    throw new Error(`Agenda item ${itemId} not found`);
  }

  const item = agendaItemsTable[index];
  agendaItemsTable.splice(index, 1);

  // Recalculate item numbers
  const items = agendaItemsTable.filter(i => idsMatch(i.agendaId, item.agendaId));
  calculateItemNumbers(items);
}

/**
 * Reorder agenda items
 */
export function reorderAgendaItems(
  agendaId: string,
  itemOrders: Array<{ itemId: string; orderIndex: number; parentItemId?: string | null }>
): void {
  itemOrders.forEach(({ itemId, orderIndex, parentItemId }) => {
    const item = agendaItemsTable.find(i => idsMatch(i.id, itemId));
    if (item) {
      item.orderIndex = orderIndex;
      item.parentItemId = parentItemId !== undefined ? parentItemId : item.parentItemId;
      item.updatedAt = new Date().toISOString();
    }
  });

  // Recalculate item numbers
  const items = agendaItemsTable.filter(item => idsMatch(item.agendaId, agendaId));
  calculateItemNumbers(items);
}
