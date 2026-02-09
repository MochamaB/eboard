/**
 * Documents API Handlers - MSW Request Handlers
 * Mock API endpoints for document management with polymorphic attachments
 */

import { http, HttpResponse } from 'msw';
import { documentsTable, type DocumentRow } from '../db/tables/documents';
import { documentAttachmentsTable, type DocumentAttachmentRow } from '../db/tables/documentAttachments';
import { documentVersionsTable } from '../db/tables/documentVersions';
import { documentTagsTable } from '../db/tables/documentTags';
import { documentSignaturesTable, isDocumentSigned } from '../db/tables/documentSignatures';
import { documentPermissionsTable, type DocumentPermissionRow } from '../db/tables/documentPermissions';
import { agendaItemsTable } from '../db/tables/agendaItems';
import type { DocumentEntityType } from '../../types/document.types';
import { boardsTable } from '../db/tables/boards';

const API_BASE = '/api';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get board name by ID
 */
const getBoardName = (boardId: string | null): string | null => {
  if (!boardId) return null;
  const board = boardsTable.find((b) => b.id === boardId);
  return board ? board.shortName : null;
};

/**
 * Check if document has restrictive permissions (is confidential)
 */
const isDocumentConfidential = (documentId: string): boolean => {
  const permissions = documentPermissionsTable.filter(p => p.documentId === documentId);
  
  // Document is confidential if:
  // 1. It has user-specific permissions (not role/board-wide)
  // 2. OR it has very limited role-based permissions
  const hasUserSpecificPermissions = permissions.some(p => p.granteeType === 'user');
  const hasOnlyRestrictedRoles = permissions.every(p => 
    p.granteeType === 'user' || 
    (p.granteeType === 'role' && ['chairman', 'secretary'].includes(p.granteeId))
  );
  
  return hasUserSpecificPermissions || (permissions.length > 0 && hasOnlyRestrictedRoles);
};

/**
 * Create default restrictive permissions for confidential documents
 * Grants access to: uploader, chairman, and secretary
 */
const createDefaultConfidentialPermissions = (
  documentId: string,
  uploadedBy: number,
  boardId: string
) => {
  const now = new Date().toISOString();
  const generateId = () => `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Permission 1: Grant full access to uploader
  documentPermissionsTable.push({
    id: generateId(),
    documentId,
    granteeType: 'user',
    granteeId: uploadedBy.toString(),
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: uploadedBy,
    grantedByName: 'System',
    grantedAt: now,
  });

  // Permission 2: Grant full access to board chairman (role-based)
  documentPermissionsTable.push({
    id: generateId(),
    documentId,
    granteeType: 'role',
    granteeId: 'chairman',
    canView: true,
    canDownload: true,
    canPrint: true,
    canShare: true,
    canPresent: false,
    expiresAt: null,
    grantedBy: uploadedBy,
    grantedByName: 'System',
    grantedAt: now,
  });

  // Permission 3: Grant view-only access to board secretary (role-based)
  documentPermissionsTable.push({
    id: generateId(),
    documentId,
    granteeType: 'role',
    granteeId: 'secretary',
    canView: true,
    canDownload: true,
    canPrint: false,
    canShare: false,
    canPresent: false,
    expiresAt: null,
    grantedBy: uploadedBy,
    grantedByName: 'System',
    grantedAt: now,
  });
};

/**
 * Transform DocumentRow to API Document format
 * Now uses lean document structure - related data comes from separate tables
 */
const transformDocument = (row: DocumentRow) => ({
  ...row,
  boardName: getBoardName(row.boardId),
  // Computed fields from related tables
  isSigned: isDocumentSigned(row.id),
  isConfidential: row.isConfidential, // Use the field from document row directly
  category: row.categoryId, // For backward compatibility
});

/**
 * Get document summary for attachments
 */
const getDocumentSummary = (documentId: string) => {
  const doc = documentsTable.find((d) => d.id === documentId);
  if (!doc) return null;
  return {
    id: doc.id,
    name: doc.name,
    categoryId: doc.categoryId,
    category: doc.categoryId, // For backward compatibility
    fileType: doc.fileType,
    fileExtension: doc.fileExtension,
    fileSize: doc.fileSize,
    url: doc.url,
    thumbnailUrl: doc.thumbnailUrl,
    uploadedByName: doc.uploadedByName,
    uploadedAt: doc.uploadedAt,
    status: doc.status,
    isSigned: isDocumentSigned(doc.id),
    isConfidential: doc.isConfidential, // Use the field from document row directly
    watermarkEnabled: doc.watermarkEnabled,
  };
};

/**
 * Transform attachment with document details
 */
const transformAttachmentWithDocument = (attachment: DocumentAttachmentRow) => ({
  ...attachment,
  document: getDocumentSummary(attachment.documentId),
});

// ============================================================================
// DOCUMENT HANDLERS
// ============================================================================

export const documentHandlers = [
  // ========================================================================
  // DOCUMENT CRUD ENDPOINTS
  // ========================================================================

  /**
   * GET /api/documents
   * Get all documents with optional filters
   */
  http.get(`${API_BASE}/documents`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');
      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status');
      const search = url.searchParams.get('search');

      let documents = [...documentsTable];

      // Apply filters
      if (boardId) {
        documents = documents.filter((d) => d.boardId === boardId);
      }
      if (category) {
        documents = documents.filter((d) => d.categoryId === category);
      }
      if (status) {
        documents = documents.filter((d) => d.status === status);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        documents = documents.filter(
          (d) =>
            d.name.toLowerCase().includes(searchLower) ||
            d.description?.toLowerCase().includes(searchLower) ||
            d.fileName.toLowerCase().includes(searchLower)
        );
      }

      return HttpResponse.json({
        success: true,
        data: documents.map(transformDocument),
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch documents' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/documents/:documentId
   * Get a single document by ID
   */
  http.get(`${API_BASE}/documents/:documentId`, ({ params }) => {
    try {
      const { documentId } = params;
      const document = documentsTable.find((d) => d.id === documentId);

      if (!document) {
        return HttpResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: transformDocument(document),
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch document' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/documents
   * Upload a new document (mock - just creates record)
   */
  http.post(`${API_BASE}/documents`, async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const name = formData.get('name') as string;
      const category = formData.get('category') as string;
      const boardId = formData.get('boardId') as string;
      const description = formData.get('description') as string | null;
      
      // Read confidential and watermark flags
      const isConfidential = formData.get('isConfidential') === 'true';
      const watermarkEnabled = formData.get('watermarkEnabled') === 'true';

      // Debug logging
      console.log('[Mock API] Upload document - flags:', {
        isConfidential,
        watermarkEnabled,
        isConfidentialRaw: formData.get('isConfidential'),
        watermarkEnabledRaw: formData.get('watermarkEnabled'),
      });

      if (!file || !name || !category || !boardId) {
        return HttpResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }

      const newId = `doc-${Date.now()}`;
      const fileExtension = file.name.split('.').pop() || 'pdf';
      const now = new Date().toISOString();

      // Lean document structure - no versioning, signatures, access control fields
      const newDocument: DocumentRow = {
        id: newId,
        name,
        description: description || null,
        fileName: file.name,
        fileExtension,
        fileType: fileExtension as DocumentRow['fileType'],
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        pageCount: null,
        storageProvider: 'local',
        storageKey: `documents/${newId}/${file.name}`,
        storageBucket: null,
        url: '/mock-documents/sample.pdf',
        thumbnailUrl: null,
        categoryId: category,
        boardId,
        uploadedBy: 17,
        uploadedByName: 'Kenneth Muhia',
        uploadedAt: now,
        source: 'upload',
        status: 'published',
        isConfidential,
        watermarkEnabled,
        createdAt: now,
        updatedAt: now,
      };

      documentsTable.push(newDocument);
      
      // Create confidential permissions if needed
      if (isConfidential) {
        createDefaultConfidentialPermissions(newId, 17, boardId);
      }

      return HttpResponse.json({
        success: true,
        data: transformDocument(newDocument),
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to upload document' },
        { status: 500 }
      );
    }
  }),

  /**
   * PUT /api/documents/:documentId
   * Update document metadata
   */
  http.put(`${API_BASE}/documents/:documentId`, async ({ params, request }) => {
    try {
      const { documentId } = params;
      const updates = await request.json() as Partial<DocumentRow>;
      const index = documentsTable.findIndex((d) => d.id === documentId);

      if (index === -1) {
        return HttpResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      const document = documentsTable[index];
      const updatedDocument: DocumentRow = {
        ...document,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      documentsTable[index] = updatedDocument;

      return HttpResponse.json({
        success: true,
        data: transformDocument(updatedDocument),
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update document' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/documents/:documentId
   * Delete a document
   */
  http.delete(`${API_BASE}/documents/:documentId`, ({ params }) => {
    try {
      const { documentId } = params;
      const index = documentsTable.findIndex((d) => d.id === documentId);

      if (index === -1) {
        return HttpResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      documentsTable.splice(index, 1);

      // Also remove attachments
      const attachmentIndices = documentAttachmentsTable
        .map((a, i) => (a.documentId === documentId ? i : -1))
        .filter((i) => i !== -1)
        .reverse();
      attachmentIndices.forEach((i) => documentAttachmentsTable.splice(i, 1));

      return HttpResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to delete document' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // DOCUMENT VERSION ENDPOINTS
  // ========================================================================

  /**
   * GET /api/documents/:documentId/versions
   * Get version history
   */
  http.get(`${API_BASE}/documents/:documentId/versions`, ({ params }) => {
    try {
      const { documentId } = params;
      const versions = documentVersionsTable.filter((v) => v.documentId === documentId);

      return HttpResponse.json({
        success: true,
        data: versions,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch versions' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // POLYMORPHIC ENTITY DOCUMENT ENDPOINTS
  // ========================================================================

  /**
   * GET /api/meetings/:meetingId/documents
   * Get all documents related to a meeting (meeting-level + agenda items)
   * Aggregates documents from:
   * - Documents attached directly to the meeting
   * - Documents attached to agenda items belonging to this meeting
   */
  http.get(`${API_BASE}/meetings/:meetingId/documents`, ({ params }) => {
    try {
      const { meetingId } = params;
      
      // 1. Get documents attached directly to the meeting
      const meetingAttachments = documentAttachmentsTable.filter(
        (a) => a.entityType === 'meeting' && a.entityId === meetingId
      );

      // 2. Get all agenda items for this meeting
      const agendaItems = agendaItemsTable.filter(
        (item) => item.meetingId === meetingId
      );
      
      // Create a map for quick agenda item lookup
      const agendaItemMap = new Map(
        agendaItems.map(item => [item.id, item])
      );
      const agendaItemIds = agendaItems.map((item) => item.id);

      // 3. Get documents attached to those agenda items
      const agendaItemAttachments = documentAttachmentsTable.filter(
        (a) => a.entityType === 'agenda_item' && agendaItemIds.includes(a.entityId)
      );

      // 4. Combine all attachments
      const allAttachments = [...meetingAttachments, ...agendaItemAttachments];

      // 5. Deduplicate by documentId (keep first occurrence with metadata)
      const seenDocumentIds = new Set<string>();
      const uniqueAttachments = allAttachments.filter((attachment) => {
        if (seenDocumentIds.has(attachment.documentId)) {
          return false;
        }
        seenDocumentIds.add(attachment.documentId);
        return true;
      });

      // 6. Transform with entity metadata
      const transformedAttachments = uniqueAttachments.map((attachment) => {
        const baseAttachment = transformAttachmentWithDocument(attachment);
        
        // Add entity label for display
        let entityLabel = 'Meeting';
        if (attachment.entityType === 'agenda_item') {
          const agendaItem = agendaItemMap.get(attachment.entityId);
          if (agendaItem) {
            // Format: "Item 2" or "Item 3.1" for sub-items
            const itemNumber = agendaItem.itemNumber;
            // Optionally include short title (first 30 chars)
            const shortTitle = agendaItem.title.length > 30 
              ? agendaItem.title.substring(0, 30) + '...'
              : agendaItem.title;
            entityLabel = `Item ${itemNumber}: ${shortTitle}`;
          }
        }
        
        return {
          ...baseAttachment,
          entityLabel,
          entityType: attachment.entityType,
          entityId: attachment.entityId,
        };
      });

      return HttpResponse.json({
        success: true,
        data: transformedAttachments.filter((a) => a.document),
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch meeting documents' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/agenda_items/:agendaItemId/documents
   * Get documents attached to an agenda item
   */
  http.get(`${API_BASE}/agenda_items/:agendaItemId/documents`, ({ params }) => {
    try {
      const { agendaItemId } = params;
      const attachments = documentAttachmentsTable.filter(
        (a) => a.entityType === 'agenda_item' && a.entityId === agendaItemId
      );

      return HttpResponse.json({
        success: true,
        data: attachments.map(transformAttachmentWithDocument).filter((a) => a.document),
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch agenda item documents' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/boards/:boardId/documents
   * Get all documents for a board
   */
  http.get(`${API_BASE}/boards/:boardId/documents`, ({ params }) => {
    try {
      const { boardId } = params;
      const documents = documentsTable.filter((d) => d.boardId === boardId);

      return HttpResponse.json({
        success: true,
        data: documents.map(transformDocument),
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch board documents' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/meetings/:meetingId/documents/:documentId
   * Attach document to a meeting
   */
  http.post(`${API_BASE}/meetings/:meetingId/documents/:documentId`, async ({ params, request }) => {
    try {
      const { meetingId, documentId } = params;
      const options = await request.json().catch(() => ({})) as Partial<DocumentAttachmentRow>;

      // Check document exists
      const document = documentsTable.find((d) => d.id === documentId);
      if (!document) {
        return HttpResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      // Check if already attached
      const existing = documentAttachmentsTable.find(
        (a) => a.entityType === 'meeting' && a.entityId === meetingId && a.documentId === documentId
      );
      if (existing) {
        return HttpResponse.json(
          { success: false, message: 'Document already attached' },
          { status: 400 }
        );
      }

      const newAttachment: DocumentAttachmentRow = {
        id: `att-${Date.now()}`,
        documentId: documentId as string,
        entityType: 'meeting',
        entityId: meetingId as string,
        attachedBy: 17,
        attachedByName: 'Kenneth Muhia',
        attachedAt: new Date().toISOString(),
        isPrimary: options.isPrimary || false,
        displayOrder: options.displayOrder || 0,
        notes: options.notes || null,
        visibleToGuests: options.visibleToGuests || false,
      };

      documentAttachmentsTable.push(newAttachment);

      return HttpResponse.json({
        success: true,
        data: newAttachment,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to attach document' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/agenda_items/:agendaItemId/documents/:documentId
   * Attach document to an agenda item
   */
  http.post(`${API_BASE}/agenda_items/:agendaItemId/documents/:documentId`, async ({ params, request }) => {
    try {
      const { agendaItemId, documentId } = params;
      const options = await request.json().catch(() => ({})) as Partial<DocumentAttachmentRow>;

      const document = documentsTable.find((d) => d.id === documentId);
      if (!document) {
        return HttpResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      const existing = documentAttachmentsTable.find(
        (a) => a.entityType === 'agenda_item' && a.entityId === agendaItemId && a.documentId === documentId
      );
      if (existing) {
        return HttpResponse.json(
          { success: false, message: 'Document already attached' },
          { status: 400 }
        );
      }

      const newAttachment: DocumentAttachmentRow = {
        id: `att-${Date.now()}`,
        documentId: documentId as string,
        entityType: 'agenda_item',
        entityId: agendaItemId as string,
        attachedBy: 17,
        attachedByName: 'Kenneth Muhia',
        attachedAt: new Date().toISOString(),
        isPrimary: options.isPrimary || false,
        displayOrder: options.displayOrder || 0,
        notes: options.notes || null,
        visibleToGuests: options.visibleToGuests || false,
      };

      documentAttachmentsTable.push(newAttachment);

      return HttpResponse.json({
        success: true,
        data: newAttachment,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to attach document' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/meetings/:meetingId/documents/:documentId
   * Detach document from a meeting
   */
  http.delete(`${API_BASE}/meetings/:meetingId/documents/:documentId`, ({ params }) => {
    try {
      const { meetingId, documentId } = params;
      const index = documentAttachmentsTable.findIndex(
        (a) => a.entityType === 'meeting' && a.entityId === meetingId && a.documentId === documentId
      );

      if (index === -1) {
        return HttpResponse.json(
          { success: false, message: 'Attachment not found' },
          { status: 404 }
        );
      }

      documentAttachmentsTable.splice(index, 1);

      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to detach document' },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/agenda_items/:agendaItemId/documents/:documentId
   * Detach document from an agenda item
   */
  http.delete(`${API_BASE}/agenda_items/:agendaItemId/documents/:documentId`, ({ params }) => {
    try {
      const { agendaItemId, documentId } = params;
      const index = documentAttachmentsTable.findIndex(
        (a) => a.entityType === 'agenda_item' && a.entityId === agendaItemId && a.documentId === documentId
      );

      if (index === -1) {
        return HttpResponse.json(
          { success: false, message: 'Attachment not found' },
          { status: 404 }
        );
      }

      documentAttachmentsTable.splice(index, 1);

      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to detach document' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // DOCUMENT TAGS ENDPOINTS
  // ========================================================================

  /**
   * GET /api/documents/tags
   * Get all document tags
   */
  http.get(`${API_BASE}/documents/tags`, ({ request }) => {
    try {
      const url = new URL(request.url);
      const boardId = url.searchParams.get('boardId');

      let tags = [...documentTagsTable];
      if (boardId) {
        tags = tags.filter((t) => t.boardId === null || t.boardId === boardId);
      }

      return HttpResponse.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch tags' },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /api/documents/tags
   * Create a new tag
   */
  http.post(`${API_BASE}/documents/tags`, async ({ request }) => {
    try {
      const payload = await request.json() as { name: string; boardId?: string; color?: string };
      const { name, boardId, color } = payload;

      const newTag = {
        id: `tag-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        color: color || null,
        description: null,
        boardId: boardId || null,
        isSystem: false,
        documentCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 17,
      };

      documentTagsTable.push(newTag);

      return HttpResponse.json({
        success: true,
        data: newTag,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create tag' },
        { status: 500 }
      );
    }
  }),

  // ========================================================================
  // UTILITY ENDPOINTS
  // ========================================================================

  /**
   * GET /api/documents/:documentId/download-url
   * Get download URL
   */
  http.get(`${API_BASE}/documents/:documentId/download-url`, ({ params }) => {
    try {
      const { documentId } = params;
      const document = documentsTable.find((d) => d.id === documentId);

      if (!document) {
        return HttpResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: { url: document.url },
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to get download URL' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/documents/:documentId/view-url
   * Get view URL
   */
  http.get(`${API_BASE}/documents/:documentId/view-url`, ({ params }) => {
    try {
      const { documentId } = params;
      const document = documentsTable.find((d) => d.id === documentId);

      if (!document) {
        return HttpResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: { url: document.url },
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to get view URL' },
        { status: 500 }
      );
    }
  }),
];
