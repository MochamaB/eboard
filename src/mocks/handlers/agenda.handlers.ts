/**
 * Agenda API Handlers - MSW Request Handlers
 * Mock API endpoints for agenda management
 */

import { http, HttpResponse } from 'msw';
import {
  getAgendaByMeetingId,
  getAgendaById,
  getAllAgendaTemplates,
  getTemplateById,
  createAgendaFromTemplate,
  updateAgendaStatus,
  addAgendaItem,
  updateAgendaItem,
  deleteAgendaItem,
  reorderAgendaItems,
} from '../db/queries/agendaQueries';
import { agendasTable } from '../db/tables/agendas';
import { agendaItemsTable } from '../db/tables/agendaItems';
import type {
  CreateAgendaPayload,
  UpdateAgendaPayload,
  CreateAgendaItemPayload,
  UpdateAgendaItemPayload,
  ReorderAgendaItemsPayload,
  PublishAgendaPayload,
  CreateAgendaTemplatePayload,
} from '../../types/agenda.types';

const API_BASE = '/api';

export const agendaHandlers = [
  // ========================================================================
  // AGENDA ENDPOINTS
  // ========================================================================

  /**
   * GET /api/meetings/:meetingId/agenda
   * Get agenda for a specific meeting
   */
  http.get(`${API_BASE}/meetings/:meetingId/agenda`, ({ params }) => {
    try {
      const { meetingId } = params;
      const agenda = getAgendaByMeetingId(meetingId as string);

      if (!agenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found for this meeting' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: agenda,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch agenda' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/meetings/:meetingId/agenda
   * Create agenda for a meeting (optionally from template)
   */
  http.post(`${API_BASE}/meetings/:meetingId/agenda`, async ({ params, request }) => {
    try {
      const { meetingId } = params;
      const payload = (await request.json()) as CreateAgendaPayload;

      // Check if agenda already exists
      const existingAgenda = getAgendaByMeetingId(meetingId as string);
      if (existingAgenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda already exists for this meeting' },
          { status: 400 }
        );
      }

      // If template provided, create from template
      if (payload.templateId) {
        const { agendaId } = createAgendaFromTemplate(
          meetingId as string,
          payload.templateId,
          1, // TODO: Get from auth context
          'Current User'
        );

        const agenda = getAgendaById(agendaId);
        return HttpResponse.json({
          success: true,
          data: agenda,
          message: 'Agenda created from template',
        });
      }

      // Create agenda (empty or with imported items)
      const now = new Date().toISOString();
      const agendaId = `agenda-${meetingId}`;
      const newAgenda = {
        id: agendaId,
        meetingId: meetingId as string,
        status: 'draft' as const,
        publishedAt: null,
        publishedBy: null,
        publishedByName: null,
        pdfDocumentId: null,
        pdfDocumentUrl: null,
        version: 1,
        templateId: null,
        templateName: null,
        createdBy: 1, // TODO: Get from auth
        createdByName: 'Current User',
        createdAt: now,
        updatedAt: now,
      };

      agendasTable.push(newAgenda);

      // If items provided (from document import), create them
      if (payload.items && payload.items.length > 0) {
        payload.items.forEach((item, index) => {
          const itemId = `item-${agendaId}-${index + 1}`;
          agendaItemsTable.push({
            id: itemId,
            meetingId: meetingId as string,
            agendaId,
            orderIndex: item.orderIndex,
            parentItemId: null,
            itemNumber: String(index + 1),
            title: item.title,
            description: item.description || '',
            itemType: item.itemType,
            estimatedDuration: item.estimatedDuration,
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
          });
        });
      }

      const agenda = getAgendaById(agendaId);
      return HttpResponse.json({
        success: true,
        data: agenda,
        message: payload.items ? `Agenda created with ${payload.items.length} imported items` : 'Agenda created',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create agenda' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/agendas/:agendaId
   * Update agenda (e.g., status)
   */
  http.put(`${API_BASE}/agendas/:agendaId`, async ({ params, request }) => {
    try {
      const { agendaId } = params;
      const payload = (await request.json()) as UpdateAgendaPayload;

      const agenda = agendasTable.find(a => a.id === agendaId);
      if (!agenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found' },
          { status: 404 }
        );
      }

      if (payload.status) {
        agenda.status = payload.status;
        agenda.updatedAt = new Date().toISOString();
      }

      const updatedAgenda = getAgendaById(agendaId as string);
      return HttpResponse.json({
        success: true,
        data: updatedAgenda,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update agenda' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/agendas/:agendaId/publish
   * Publish agenda
   */
  http.post(`${API_BASE}/agendas/:agendaId/publish`, async ({ params, request }) => {
    try {
      const { agendaId } = params;
      const payload = (await request.json()) as PublishAgendaPayload;

      const agenda = agendasTable.find(a => a.id === agendaId);
      if (!agenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found' },
          { status: 404 }
        );
      }

      if (agenda.status === 'published') {
        // Republish - increment version
        agenda.version += 1;
      }

      updateAgendaStatus(
        agendaId as string,
        'published',
        payload.publishedBy,
        'Current User' // TODO: Get from user lookup
      );

      const publishedAgenda = getAgendaById(agendaId as string);
      return HttpResponse.json({
        success: true,
        data: publishedAgenda,
        message: 'Agenda published successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to publish agenda' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/agendas/:agendaId
   * Delete agenda
   */
  http.delete(`${API_BASE}/agendas/:agendaId`, ({ params }) => {
    try {
      const { agendaId } = params;

      const index = agendasTable.findIndex(a => a.id === agendaId);
      if (index === -1) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found' },
          { status: 404 }
        );
      }

      // Check if published
      const agenda = agendasTable[index];
      if (agenda.status === 'published') {
        return HttpResponse.json(
          { success: false, message: 'Cannot delete published agenda' },
          { status: 400 }
        );
      }

      agendasTable.splice(index, 1);

      return HttpResponse.json({
        success: true,
        message: 'Agenda deleted',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete agenda' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // AGENDA ITEM ENDPOINTS
  // ========================================================================

  /**
   * POST /api/agendas/:agendaId/items
   * Add agenda item
   */
  http.post(`${API_BASE}/agendas/:agendaId/items`, async ({ params, request }) => {
    try {
      const { agendaId } = params;
      const payload = (await request.json()) as CreateAgendaItemPayload;

      const agenda = agendasTable.find(a => a.id === agendaId);
      if (!agenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found' },
          { status: 404 }
        );
      }

      // Cannot add items to published agenda (except ad-hoc during meeting)
      if (agenda.status === 'published' && !payload.isAdHoc) {
        return HttpResponse.json(
          { success: false, message: 'Cannot add items to published agenda' },
          { status: 400 }
        );
      }

      addAgendaItem(agendaId as string, agenda.meetingId, {
        ...payload,
        attachedDocumentIds: JSON.stringify(payload.attachedDocumentIds || []),
      });

      const updatedAgenda = getAgendaById(agendaId as string);
      return HttpResponse.json({
        success: true,
        data: updatedAgenda,
        message: 'Agenda item added',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to add agenda item' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/agendas/:agendaId/items/:itemId
   * Update agenda item
   */
  http.put(`${API_BASE}/agendas/:agendaId/items/:itemId`, async ({ params, request }) => {
    try {
      const { agendaId, itemId } = params;
      const payload = (await request.json()) as UpdateAgendaItemPayload;

      const agenda = agendasTable.find(a => a.id === agendaId);
      if (!agenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found' },
          { status: 404 }
        );
      }

      // Cannot edit published agenda items (except during meeting execution)
      const allowedUpdates = ['status', 'actualStartTime', 'actualEndTime', 'actualDuration'];
      const isExecutionUpdate = Object.keys(payload).every(key => allowedUpdates.includes(key));

      if (agenda.status === 'published' && !isExecutionUpdate) {
        return HttpResponse.json(
          { success: false, message: 'Cannot edit published agenda items' },
          { status: 400 }
        );
      }

      const updates: any = { ...payload };
      if (payload.attachedDocumentIds) {
        updates.attachedDocumentIds = JSON.stringify(payload.attachedDocumentIds);
      }

      updateAgendaItem(itemId as string, updates);

      const updatedAgenda = getAgendaById(agendaId as string);
      return HttpResponse.json({
        success: true,
        data: updatedAgenda,
        message: 'Agenda item updated',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update agenda item' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/agendas/:agendaId/items/:itemId
   * Delete agenda item
   */
  http.delete(`${API_BASE}/agendas/:agendaId/items/:itemId`, ({ params }) => {
    try {
      const { agendaId, itemId } = params;

      const agenda = agendasTable.find(a => a.id === agendaId);
      if (!agenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found' },
          { status: 404 }
        );
      }

      if (agenda.status === 'published') {
        return HttpResponse.json(
          { success: false, message: 'Cannot delete items from published agenda' },
          { status: 400 }
        );
      }

      deleteAgendaItem(itemId as string);

      const updatedAgenda = getAgendaById(agendaId as string);
      return HttpResponse.json({
        success: true,
        data: updatedAgenda,
        message: 'Agenda item deleted',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete agenda item' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/agendas/:agendaId/items/reorder
   * Reorder agenda items
   */
  http.post(`${API_BASE}/agendas/:agendaId/items/reorder`, async ({ params, request }) => {
    try {
      const { agendaId } = params;
      const payload = (await request.json()) as ReorderAgendaItemsPayload;

      const agenda = agendasTable.find(a => a.id === agendaId);
      if (!agenda) {
        return HttpResponse.json(
          { success: false, message: 'Agenda not found' },
          { status: 404 }
        );
      }

      if (agenda.status === 'published') {
        return HttpResponse.json(
          { success: false, message: 'Cannot reorder items in published agenda' },
          { status: 400 }
        );
      }

      reorderAgendaItems(agendaId as string, payload.itemOrders);

      const updatedAgenda = getAgendaById(agendaId as string);
      return HttpResponse.json({
        success: true,
        data: updatedAgenda,
        message: 'Agenda items reordered',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to reorder agenda items' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // AGENDA TEMPLATE ENDPOINTS
  // ========================================================================

  /**
   * GET /api/agenda-templates
   * Get all agenda templates
   */
  http.get(`${API_BASE}/agenda-templates`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const boardType = url.searchParams.get('boardType') || undefined;

      const templates = getAllAgendaTemplates(boardType);

      return HttpResponse.json({
        success: true,
        data: templates,
        total: templates.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch templates' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/agenda-templates/:templateId
   * Get single agenda template
   */
  http.get(`${API_BASE}/agenda-templates/:templateId`, ({ params }) => {
    try {
      const { templateId } = params;
      const template = getTemplateById(templateId as string);

      if (!template) {
        return HttpResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: template,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch template' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/agenda-templates
   * Create new agenda template
   */
  http.post(`${API_BASE}/agenda-templates`, async ({ request }) => {
    try {
      const payload = (await request.json()) as CreateAgendaTemplatePayload;

      const templateId = `template-${Date.now()}`;
      const now = new Date().toISOString();

      const newTemplate = {
        id: templateId,
        name: payload.name,
        description: payload.description || null,
        boardType: payload.boardType,
        items: JSON.stringify(payload.items),
        createdBy: 1, // TODO: Get from auth
        createdByName: 'Current User',
        createdAt: now,
        updatedAt: now,
        isGlobal: payload.isGlobal || false,
      };

      // In a real implementation, this would be saved to database
      // For now, we just return the created template
      return HttpResponse.json({
        success: true,
        data: { ...newTemplate, items: payload.items },
        message: 'Template created',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create template' },
        { status: 500 }
      );
    }
  }),
];
