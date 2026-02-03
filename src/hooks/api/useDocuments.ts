/**
 * Documents React Query Hooks
 * Custom hooks for document management using React Query
 * Supports polymorphic attachments to any entity type
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import * as documentsApi from '../../api/documents.api';
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
} from '../../types/document.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters?: DocumentFilter) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  versions: (id: string) => [...documentKeys.detail(id), 'versions'] as const,
  
  // Polymorphic entity documents
  entity: (entityType: DocumentEntityType, entityId: string) =>
    [...documentKeys.all, 'entity', entityType, entityId] as const,
  meeting: (meetingId: string) => documentKeys.entity('meeting', meetingId),
  agendaItem: (agendaItemId: string) => documentKeys.entity('agenda_item', agendaItemId),
  board: (boardId: string) => [...documentKeys.all, 'board', boardId] as const,
  
  // Tags
  tags: () => [...documentKeys.all, 'tags'] as const,
  tagsByBoard: (boardId?: string) => [...documentKeys.tags(), boardId] as const,
};

// ============================================================================
// DOCUMENT QUERY HOOKS
// ============================================================================

/**
 * Get all documents with optional filters
 */
export const useDocuments = (
  filters?: DocumentFilter,
  options?: Omit<UseQueryOptions<Document[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentsApi.getDocuments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get a single document by ID
 */
export const useDocument = (
  documentId: string,
  options?: Omit<UseQueryOptions<Document>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentKeys.detail(documentId),
    queryFn: () => documentsApi.getDocument(documentId),
    enabled: !!documentId,
    ...options,
  });
};

/**
 * Get document versions
 */
export const useDocumentVersions = (
  documentId: string,
  options?: Omit<UseQueryOptions<DocumentVersion[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentKeys.versions(documentId),
    queryFn: () => documentsApi.getDocumentVersions(documentId),
    enabled: !!documentId,
    ...options,
  });
};

// ============================================================================
// POLYMORPHIC ENTITY DOCUMENT HOOKS
// ============================================================================

/**
 * Get documents for any entity (polymorphic)
 */
export const useEntityDocuments = (
  entityType: DocumentEntityType,
  entityId: string,
  options?: Omit<UseQueryOptions<AttachmentWithDocument[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentKeys.entity(entityType, entityId),
    queryFn: () => documentsApi.getEntityDocuments(entityType, entityId),
    enabled: !!entityType && !!entityId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Get documents for a meeting
 */
export const useMeetingDocuments = (
  meetingId: string,
  options?: Omit<UseQueryOptions<AttachmentWithDocument[]>, 'queryKey' | 'queryFn'>
) => {
  return useEntityDocuments('meeting', meetingId, options);
};

/**
 * Get documents for an agenda item
 */
export const useAgendaItemDocuments = (
  agendaItemId: string,
  options?: Omit<UseQueryOptions<AttachmentWithDocument[]>, 'queryKey' | 'queryFn'>
) => {
  return useEntityDocuments('agenda_item', agendaItemId, options);
};

/**
 * Get documents for a board
 */
export const useBoardDocuments = (
  boardId: string,
  options?: Omit<UseQueryOptions<Document[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentKeys.board(boardId),
    queryFn: () => documentsApi.getBoardDocuments(boardId),
    enabled: !!boardId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ============================================================================
// DOCUMENT TAGS HOOKS
// ============================================================================

/**
 * Get document tags
 */
export const useDocumentTags = (
  boardId?: string,
  options?: Omit<UseQueryOptions<DocumentTag[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentKeys.tagsByBoard(boardId),
    queryFn: () => documentsApi.getDocumentTags(boardId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// ============================================================================
// DOCUMENT MUTATION HOOKS
// ============================================================================

/**
 * Upload a new document
 */
export const useUploadDocument = (
  options?: Omit<UseMutationOptions<Document, Error, { file: File; metadata: UploadDocumentPayload }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, metadata }) => documentsApi.uploadDocument(file, metadata),
    onSuccess: (data) => {
      // Invalidate document lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      // Invalidate board documents if boardId exists
      if (data.boardId) {
        queryClient.invalidateQueries({ queryKey: documentKeys.board(data.boardId) });
      }
    },
    ...options,
  });
};

/**
 * Update document metadata
 */
export const useUpdateDocument = (
  documentId: string,
  options?: Omit<UseMutationOptions<Document, Error, UpdateDocumentPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => documentsApi.updateDocument(documentId, payload),
    onSuccess: (data) => {
      // Update document in cache
      queryClient.setQueryData(documentKeys.detail(documentId), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    ...options,
  });
};

/**
 * Delete a document
 */
export const useDeleteDocument = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId) => documentsApi.deleteDocument(documentId),
    onSuccess: (_, documentId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(documentId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    ...options,
  });
};

/**
 * Upload a new version of a document
 */
export const useUploadDocumentVersion = (
  documentId: string,
  options?: Omit<UseMutationOptions<DocumentVersion, Error, { file: File; changeNotes?: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, changeNotes }) =>
      documentsApi.uploadDocumentVersion(documentId, file, changeNotes),
    onSuccess: () => {
      // Invalidate document and versions
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(documentId) });
    },
    ...options,
  });
};

/**
 * Restore a previous version
 */
export const useRestoreDocumentVersion = (
  documentId: string,
  options?: Omit<UseMutationOptions<Document, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId) => documentsApi.restoreDocumentVersion(documentId, versionId),
    onSuccess: (data) => {
      queryClient.setQueryData(documentKeys.detail(documentId), data);
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(documentId) });
    },
    ...options,
  });
};

// ============================================================================
// ATTACHMENT MUTATION HOOKS
// ============================================================================

/**
 * Attach a document to an entity (polymorphic)
 */
export const useAttachDocument = (
  options?: Omit<UseMutationOptions<DocumentAttachment, Error, AttachDocumentPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => documentsApi.attachDocument(payload),
    onSuccess: (_, variables) => {
      // Invalidate entity documents
      queryClient.invalidateQueries({
        queryKey: documentKeys.entity(variables.entityType, variables.entityId),
      });
    },
    ...options,
  });
};

/**
 * Attach document to a meeting
 */
export const useAttachDocumentToMeeting = (
  meetingId: string,
  options?: Omit<
    UseMutationOptions<
      DocumentAttachment,
      Error,
      { documentId: string; options?: Partial<Omit<AttachDocumentPayload, 'entityType' | 'entityId' | 'documentId'>> }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, options: attachOptions }) =>
      documentsApi.attachDocumentToMeeting(meetingId, documentId, attachOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.meeting(meetingId) });
    },
    ...options,
  });
};

/**
 * Attach document to an agenda item
 */
export const useAttachDocumentToAgendaItem = (
  agendaItemId: string,
  options?: Omit<
    UseMutationOptions<
      DocumentAttachment,
      Error,
      { documentId: string; options?: Partial<Omit<AttachDocumentPayload, 'entityType' | 'entityId' | 'documentId'>> }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, options: attachOptions }) =>
      documentsApi.attachDocumentToAgendaItem(agendaItemId, documentId, attachOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.agendaItem(agendaItemId) });
    },
    ...options,
  });
};

/**
 * Detach a document from an entity (polymorphic)
 */
export const useDetachDocument = (
  options?: Omit<
    UseMutationOptions<void, Error, { entityType: DocumentEntityType; entityId: string; documentId: string }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, entityId, documentId }) =>
      documentsApi.detachDocument(entityType, entityId, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.entity(variables.entityType, variables.entityId),
      });
    },
    ...options,
  });
};

/**
 * Detach document from a meeting
 */
export const useDetachDocumentFromMeeting = (
  meetingId: string,
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId) => documentsApi.detachDocumentFromMeeting(meetingId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.meeting(meetingId) });
    },
    ...options,
  });
};

/**
 * Detach document from an agenda item
 */
export const useDetachDocumentFromAgendaItem = (
  agendaItemId: string,
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId) => documentsApi.detachDocumentFromAgendaItem(agendaItemId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.agendaItem(agendaItemId) });
    },
    ...options,
  });
};

// ============================================================================
// TAG MUTATION HOOKS
// ============================================================================

/**
 * Create a new document tag
 */
export const useCreateDocumentTag = (
  options?: Omit<UseMutationOptions<DocumentTag, Error, { name: string; boardId?: string; color?: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, boardId, color }) => documentsApi.createDocumentTag(name, boardId, color),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.tagsByBoard(variables.boardId) });
    },
    ...options,
  });
};
