/**
 * Minutes Templates API Handlers - MSW Request Handlers
 * Mock API endpoints for minutes templates management
 */

import { http, HttpResponse } from 'msw';
import {
  getAllMinutesTemplates,
  getMinutesTemplateById,
  createMinutesTemplate,
  updateMinutesTemplate,
  deleteMinutesTemplate,
} from '../db/queries/minutesTemplatesQueries';
import type {
  CreateMinutesTemplatePayload,
  UpdateMinutesTemplatePayload,
  MinutesTemplateFilters,
} from '../../types/minutes.types';

const API_BASE = '/api';

export const minutesTemplatesHandlers = [
  // ========================================================================
  // MINUTES TEMPLATES ENDPOINTS
  // ========================================================================

  /**
   * GET /api/minutes-templates
   * Get all minutes templates with optional filters
   */
  http.get(`${API_BASE}/minutes-templates`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const filters: MinutesTemplateFilters = {};

      const boardType = url.searchParams.get('boardType');
      const meetingType = url.searchParams.get('meetingType');
      const isGlobal = url.searchParams.get('isGlobal');

      if (boardType) filters.boardType = boardType as any;
      if (meetingType) filters.meetingType = meetingType as any;
      if (isGlobal) filters.isGlobal = isGlobal === 'true';

      const templates = getAllMinutesTemplates(filters);

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
   * GET /api/minutes-templates/:templateId
   * Get specific minutes template by ID
   */
  http.get(`${API_BASE}/minutes-templates/:templateId`, ({ params }) => {
    try {
      const { templateId } = params;
      const template = getMinutesTemplateById(templateId as string);

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
   * POST /api/minutes-templates
   * Create new minutes template
   */
  http.post(`${API_BASE}/minutes-templates`, async ({ request }) => {
    try {
      const payload = (await request.json()) as CreateMinutesTemplatePayload;
      
      // Mock user context (in real app, get from auth)
      const userId = 1;
      const userName = 'Current User';

      const template = createMinutesTemplate(payload, userId, userName);

      return HttpResponse.json(
        {
          success: true,
          data: template,
          message: 'Template created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create template' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/minutes-templates/:templateId
   * Update minutes template
   */
  http.put(`${API_BASE}/minutes-templates/:templateId`, async ({ params, request }) => {
    try {
      const { templateId } = params;
      const payload = (await request.json()) as UpdateMinutesTemplatePayload;

      const template = updateMinutesTemplate(templateId as string, payload);

      if (!template) {
        return HttpResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: template,
        message: 'Template updated successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update template' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/minutes-templates/:templateId
   * Delete minutes template
   */
  http.delete(`${API_BASE}/minutes-templates/:templateId`, ({ params }) => {
    try {
      const { templateId } = params;
      const success = deleteMinutesTemplate(templateId as string);

      if (!success) {
        return HttpResponse.json(
          { success: false, message: 'Template not found or cannot be deleted' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete template' },
        { status: 500 }
      );
    }
  }),
];
