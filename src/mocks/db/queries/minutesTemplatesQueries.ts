/**
 * Minutes Templates Query Functions
 * Database query functions for minutes templates
 */

import { minutesTemplatesTable, type MinutesTemplateRow } from '../tables/minutesTemplates';
import type { 
  MinutesTemplate, 
  MinutesTemplateSection,
  CreateMinutesTemplatePayload,
  UpdateMinutesTemplatePayload,
  MinutesTemplateFilters,
  BoardType,
  MeetingType,
} from '../../../types/minutes.types';
import { normalizeId, idsMatch } from '../utils/idUtils';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert MinutesTemplateRow to MinutesTemplate (parse JSON fields)
 */
function rowToTemplate(row: MinutesTemplateRow): MinutesTemplate {
  return {
    ...row,
    sections: JSON.parse(row.sections) as MinutesTemplateSection[],
  };
}

/**
 * Convert MinutesTemplate to MinutesTemplateRow (stringify JSON fields)
 */
function templateToRow(template: MinutesTemplate): MinutesTemplateRow {
  return {
    ...template,
    description: template.description ?? null,
    sections: JSON.stringify(template.sections),
  };
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all minutes templates with optional filters
 */
export function getAllMinutesTemplates(filters?: MinutesTemplateFilters): MinutesTemplate[] {
  let templates = minutesTemplatesTable;

  if (filters?.boardType && filters.boardType !== 'all') {
    templates = templates.filter(
      t => t.boardType === filters.boardType || t.boardType === 'all'
    );
  }

  if (filters?.meetingType && filters.meetingType !== 'all') {
    templates = templates.filter(
      t => t.meetingType === filters.meetingType || t.meetingType === 'all'
    );
  }

  if (filters?.isGlobal !== undefined) {
    templates = templates.filter(t => t.isGlobal === filters.isGlobal);
  }

  return templates.map(rowToTemplate);
}

/**
 * Get minutes template by ID
 */
export function getMinutesTemplateById(templateId: string): MinutesTemplate | null {
  const template = minutesTemplatesTable.find(t => idsMatch(t.id, templateId));
  return template ? rowToTemplate(template) : null;
}

/**
 * Get templates by board type
 */
export function getMinutesTemplatesByBoardType(boardType: BoardType): MinutesTemplate[] {
  const templates = minutesTemplatesTable.filter(
    t => t.boardType === boardType || t.boardType === 'all'
  );
  return templates.map(rowToTemplate);
}

/**
 * Get templates by meeting type
 */
export function getMinutesTemplatesByMeetingType(meetingType: MeetingType): MinutesTemplate[] {
  const templates = minutesTemplatesTable.filter(
    t => t.meetingType === meetingType || t.meetingType === 'all'
  );
  return templates.map(rowToTemplate);
}

/**
 * Get global templates
 */
export function getGlobalMinutesTemplates(): MinutesTemplate[] {
  const templates = minutesTemplatesTable.filter(t => t.isGlobal);
  return templates.map(rowToTemplate);
}

/**
 * Get user-created templates
 */
export function getUserMinutesTemplates(userId: number): MinutesTemplate[] {
  const templates = minutesTemplatesTable.filter(
    t => !t.isGlobal && t.createdBy === userId
  );
  return templates.map(rowToTemplate);
}

/**
 * Create new minutes template
 */
export function createMinutesTemplate(
  payload: CreateMinutesTemplatePayload,
  userId: number,
  userName: string
): MinutesTemplate {
  const now = new Date().toISOString();
  const templateId = `template-${normalizeId(payload.name)}-${Date.now()}`;

  const newTemplate: MinutesTemplate = {
    id: templateId,
    name: payload.name,
    description: payload.description || null,
    boardType: payload.boardType,
    meetingType: payload.meetingType,
    sections: payload.sections,
    htmlTemplate: payload.htmlTemplate,
    createdBy: userId,
    createdByName: userName,
    createdAt: now,
    updatedAt: now,
    isGlobal: payload.isGlobal || false,
  };

  minutesTemplatesTable.push(templateToRow(newTemplate));
  return newTemplate;
}

/**
 * Update minutes template
 */
export function updateMinutesTemplate(
  templateId: string,
  payload: UpdateMinutesTemplatePayload
): MinutesTemplate | null {
  const index = minutesTemplatesTable.findIndex(t => idsMatch(t.id, templateId));
  
  if (index === -1) {
    return null;
  }

  const existingTemplate = rowToTemplate(minutesTemplatesTable[index]);
  const now = new Date().toISOString();

  const updatedTemplate: MinutesTemplate = {
    ...existingTemplate,
    ...payload,
    updatedAt: now,
  };

  minutesTemplatesTable[index] = templateToRow(updatedTemplate);
  return updatedTemplate;
}

/**
 * Delete minutes template
 */
export function deleteMinutesTemplate(templateId: string): boolean {
  const index = minutesTemplatesTable.findIndex(t => idsMatch(t.id, templateId));
  
  if (index === -1) {
    return false;
  }

  // Don't allow deletion of global templates
  if (minutesTemplatesTable[index].isGlobal) {
    return false;
  }

  minutesTemplatesTable.splice(index, 1);
  return true;
}

/**
 * Check if template exists
 */
export function minutesTemplateExists(templateId: string): boolean {
  return minutesTemplatesTable.some(t => idsMatch(t.id, templateId));
}

/**
 * Get template count by filters
 */
export function getMinutesTemplateCount(filters?: MinutesTemplateFilters): number {
  return getAllMinutesTemplates(filters).length;
}
