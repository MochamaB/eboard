/**
 * Documents API Client
 * API functions for document management with polymorphic attachment support
 */

import type {
  Document,
  DocumentAttachment,
  DocumentVersion,
  DocumentTag,
  DocumentFilter,
  UploadDocumentPayload,
  UpdateDocumentPayload,
  AttachDocumentPayload,
  DocumentEntityType,
  AttachmentWithDocument,
} from '../types/document.types';

const API_BASE = '/api';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}


// ============================================================================
// DOCUMENT CRUD ENDPOINTS
// ============================================================================

/**
 * Get all documents with optional filters
 */
export async function getDocuments(filters?: DocumentFilter): Promise<Document[]> {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }

  const url = `${API_BASE}/documents${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Invalid response from server');
  }

  const result: ApiResponse<Document[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch documents');
  }

  return result.data || [];
}

/**
 * Get a single document by ID
 */
export async function getDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${API_BASE}/documents/${documentId}`);

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Document not found');
  }

  const result: ApiResponse<Document> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch document');
  }

  return result.data!;
}

/**
 * Upload a new document
 * Note: File is sent as FormData
 */
export async function uploadDocument(
  file: File,
  metadata: UploadDocumentPayload
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', metadata.name);
  formData.append('category', metadata.category);
  
  if (metadata.boardId) {
    formData.append('boardId', metadata.boardId);
  }
  if (metadata.description) {
    formData.append('description', metadata.description);
  }
  if (metadata.tags) {
    formData.append('tags', JSON.stringify(metadata.tags));
  }
  if (metadata.accessLevel) {
    formData.append('accessLevel', metadata.accessLevel);
  }
  if (metadata.isConfidential !== undefined) {
    formData.append('isConfidential', String(metadata.isConfidential));
  }
  if (metadata.watermarkEnabled !== undefined) {
    formData.append('watermarkEnabled', String(metadata.watermarkEnabled));
  }

  const response = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    body: formData,
  });

  const result: ApiResponse<Document> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to upload document');
  }

  return result.data!;
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  payload: UpdateDocumentPayload
): Promise<Document> {
  const response = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result: ApiResponse<Document> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update document');
  }

  return result.data!;
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete document');
  }
}

// ============================================================================
// DOCUMENT VERSION ENDPOINTS
// ============================================================================

/**
 * Get version history for a document
 */
export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const response = await fetch(`${API_BASE}/documents/${documentId}/versions`);

  const result: ApiResponse<DocumentVersion[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch document versions');
  }

  return result.data || [];
}

/**
 * Upload a new version of a document
 */
export async function uploadDocumentVersion(
  documentId: string,
  file: File,
  changeNotes?: string
): Promise<DocumentVersion> {
  const formData = new FormData();
  formData.append('file', file);
  if (changeNotes) {
    formData.append('changeNotes', changeNotes);
  }

  const response = await fetch(`${API_BASE}/documents/${documentId}/versions`, {
    method: 'POST',
    body: formData,
  });

  const result: ApiResponse<DocumentVersion> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to upload document version');
  }

  return result.data!;
}

/**
 * Restore a previous version as the current version
 */
export async function restoreDocumentVersion(
  documentId: string,
  versionId: string
): Promise<Document> {
  const response = await fetch(
    `${API_BASE}/documents/${documentId}/versions/${versionId}/restore`,
    { method: 'POST' }
  );

  const result: ApiResponse<Document> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to restore document version');
  }

  return result.data!;
}

// ============================================================================
// POLYMORPHIC ATTACHMENT ENDPOINTS
// ============================================================================

/**
 * Get documents attached to any entity (polymorphic)
 */
export async function getEntityDocuments(
  entityType: DocumentEntityType,
  entityId: string
): Promise<AttachmentWithDocument[]> {
  const response = await fetch(`${API_BASE}/${entityType}s/${entityId}/documents`);

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return [];
  }

  const result: ApiResponse<AttachmentWithDocument[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch entity documents');
  }

  return result.data || [];
}

/**
 * Get documents for a meeting
 */
export async function getMeetingDocuments(meetingId: string): Promise<AttachmentWithDocument[]> {
  return getEntityDocuments('meeting', meetingId);
}

/**
 * Get documents for an agenda item
 */
export async function getAgendaItemDocuments(agendaItemId: string): Promise<AttachmentWithDocument[]> {
  return getEntityDocuments('agenda_item', agendaItemId);
}

/**
 * Get documents for a board
 */
export async function getBoardDocuments(boardId: string): Promise<Document[]> {
  const response = await fetch(`${API_BASE}/boards/${boardId}/documents`);

  const result: ApiResponse<Document[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch board documents');
  }

  return result.data || [];
}

/**
 * Attach a document to an entity (polymorphic)
 */
export async function attachDocument(
  payload: AttachDocumentPayload
): Promise<DocumentAttachment> {
  const { entityType, entityId, documentId, ...rest } = payload;
  
  const response = await fetch(
    `${API_BASE}/${entityType}s/${entityId}/documents/${documentId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    }
  );

  const result: ApiResponse<DocumentAttachment> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to attach document');
  }

  return result.data!;
}

/**
 * Attach document to a meeting
 */
export async function attachDocumentToMeeting(
  meetingId: string,
  documentId: string,
  options?: Partial<Omit<AttachDocumentPayload, 'entityType' | 'entityId' | 'documentId'>>
): Promise<DocumentAttachment> {
  return attachDocument({
    entityType: 'meeting',
    entityId: meetingId,
    documentId,
    ...options,
  });
}

/**
 * Attach document to an agenda item
 */
export async function attachDocumentToAgendaItem(
  agendaItemId: string,
  documentId: string,
  options?: Partial<Omit<AttachDocumentPayload, 'entityType' | 'entityId' | 'documentId'>>
): Promise<DocumentAttachment> {
  return attachDocument({
    entityType: 'agenda_item',
    entityId: agendaItemId,
    documentId,
    ...options,
  });
}

/**
 * Detach a document from an entity (polymorphic)
 */
export async function detachDocument(
  entityType: DocumentEntityType,
  entityId: string,
  documentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/${entityType}s/${entityId}/documents/${documentId}`,
    { method: 'DELETE' }
  );

  const result: ApiResponse<void> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to detach document');
  }
}

/**
 * Detach document from a meeting
 */
export async function detachDocumentFromMeeting(
  meetingId: string,
  documentId: string
): Promise<void> {
  return detachDocument('meeting', meetingId, documentId);
}

/**
 * Detach document from an agenda item
 */
export async function detachDocumentFromAgendaItem(
  agendaItemId: string,
  documentId: string
): Promise<void> {
  return detachDocument('agenda_item', agendaItemId, documentId);
}

// ============================================================================
// DOCUMENT TAGS ENDPOINTS
// ============================================================================

/**
 * Get all document tags
 */
export async function getDocumentTags(boardId?: string): Promise<DocumentTag[]> {
  const url = boardId 
    ? `${API_BASE}/documents/tags?boardId=${boardId}`
    : `${API_BASE}/documents/tags`;
    
  const response = await fetch(url);

  const result: ApiResponse<DocumentTag[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch document tags');
  }

  return result.data || [];
}

/**
 * Create a new document tag
 */
export async function createDocumentTag(
  name: string,
  boardId?: string,
  color?: string
): Promise<DocumentTag> {
  const response = await fetch(`${API_BASE}/documents/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, boardId, color }),
  });

  const result: ApiResponse<DocumentTag> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create document tag');
  }

  return result.data!;
}

// ============================================================================
// DOCUMENT UTILITY ENDPOINTS
// ============================================================================

/**
 * Get document download URL
 */
export async function getDocumentDownloadUrl(documentId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/documents/${documentId}/download-url`);

  const result: ApiResponse<{ url: string }> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to get download URL');
  }

  return result.data!.url;
}

/**
 * Get document view URL (for inline viewing)
 */
export async function getDocumentViewUrl(documentId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/documents/${documentId}/view-url`);

  const result: ApiResponse<{ url: string }> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to get view URL');
  }

  return result.data!.url;
}

/**
 * Search documents
 */
export async function searchDocuments(
  query: string,
  filters?: Omit<DocumentFilter, 'search'>
): Promise<Document[]> {
  return getDocuments({ ...filters, search: query });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const documentsApi = {
  // CRUD
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  
  // Versions
  getDocumentVersions,
  uploadDocumentVersion,
  restoreDocumentVersion,
  
  // Polymorphic attachments
  getEntityDocuments,
  getMeetingDocuments,
  getAgendaItemDocuments,
  getBoardDocuments,
  attachDocument,
  attachDocumentToMeeting,
  attachDocumentToAgendaItem,
  detachDocument,
  detachDocumentFromMeeting,
  detachDocumentFromAgendaItem,
  
  // Tags
  getDocumentTags,
  createDocumentTag,
  
  // Utilities
  getDocumentDownloadUrl,
  getDocumentViewUrl,
  searchDocuments,
};

export default documentsApi;
