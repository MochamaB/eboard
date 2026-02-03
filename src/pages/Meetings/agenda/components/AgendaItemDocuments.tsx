/**
 * AgendaItemDocuments Component
 * Manages documents attached to a specific agenda item
 */

import React, { useState, useCallback } from 'react';
import { message, Modal } from 'antd';
import {
  AttachedDocumentsList,
  DocumentPickerModal,
  DocumentUploadModal,
  DocumentViewerModal,
} from '../../../../components/Documents';
import {
  useAgendaItemDocuments,
  useAttachDocumentToAgendaItem,
  useDetachDocumentFromAgendaItem,
} from '../../../../hooks/api/useDocuments';
import type { Document, DocumentSummary } from '../../../../types/document.types';

interface AgendaItemDocumentsProps {
  agendaItemId: string;
  mode: 'edit' | 'view' | 'execute';
  boardId: string;
  meetingId: string;
}

export const AgendaItemDocuments: React.FC<AgendaItemDocumentsProps> = ({
  agendaItemId,
  mode,
  boardId,
  meetingId,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);

  // Fetch documents for this agenda item
  const { data: attachments = [], isLoading, error, refetch } = useAgendaItemDocuments(agendaItemId);
  
  // Extract documents from attachments
  const documents = attachments.map(att => att.document);

  // Mutations
  const attachMutation = useAttachDocumentToAgendaItem(agendaItemId, {
    onSuccess: () => {
      message.success('Document attached successfully');
      setPickerOpen(false);
      refetch();
    },
    onError: (error) => {
      message.error(`Failed to attach document: ${error.message}`);
    },
  });

  const detachMutation = useDetachDocumentFromAgendaItem(agendaItemId, {
    onSuccess: () => {
      message.success('Document removed successfully');
      refetch();
    },
    onError: (error) => {
      message.error(`Failed to remove document: ${error.message}`);
    },
  });

  // Handlers
  const handleAttachDocuments = useCallback((selectedDocs: Document[]) => {
    selectedDocs.forEach(doc => {
      attachMutation.mutate({
        documentId: doc.id,
        options: {
          isPrimary: false,
          displayOrder: documents.length,
          notes: undefined,
          visibleToGuests: false,
        },
      });
    });
  }, [attachMutation, documents.length]);

  const handleRemoveDocument = useCallback((document: Document | DocumentSummary) => {
    Modal.confirm({
      title: 'Remove Document',
      content: `Are you sure you want to remove "${document.name}" from this agenda item?`,
      okText: 'Remove',
      okType: 'danger',
      onOk: () => detachMutation.mutate(document.id),
    });
  }, [detachMutation]);

  const handleViewDocument = useCallback((document: Document | DocumentSummary) => {
    setViewerDocument(document as Document);
  }, []);

  const handleDownloadDocument = useCallback((document: Document | DocumentSummary) => {
    window.open(document.url, '_blank');
  }, []);

  const handleUploadSuccess = useCallback((uploadedDocument?: Document) => {
    if (uploadedDocument) {
      // Auto-attach uploaded document to this agenda item
      attachMutation.mutate({
        documentId: uploadedDocument.id,
        options: {
          isPrimary: false,
          displayOrder: documents.length,
          notes: undefined,
          visibleToGuests: false,
        },
      });
    }
    setUploadOpen(false);
  }, [attachMutation, documents.length]);

  // Get already attached document IDs to exclude from picker
  const attachedDocumentIds = documents.map(doc => doc.id);

  if (error) {
    return null; // Silently fail - agenda item can exist without documents
  }

  return (
    <>
      <AttachedDocumentsList
        documents={documents}
        onView={handleViewDocument}
        onDownload={handleDownloadDocument}
        onRemove={mode === 'edit' ? handleRemoveDocument : undefined}
        onAttach={mode === 'edit' ? () => setPickerOpen(true) : undefined}
        onUpload={mode === 'edit' ? () => setUploadOpen(true) : undefined}
        showAttachButton={mode === 'edit'}
        showUploadButton={mode === 'edit'}
        showRemoveButton={mode === 'edit'}
        compact={true}
        title="Attached Documents"
        emptyText="No documents attached"
        hideEmptyState={true}
      />

      {/* Document Picker Modal */}
      <DocumentPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAttachDocuments}
        boardId={boardId}
        excludeIds={attachedDocumentIds}
        multiple={true}
        title="Attach Documents to Agenda Item"
      />

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        boardId={boardId}
        defaultCategory="attachment"
      />

      {/* Viewer Modal */}
      <DocumentViewerModal
        open={!!viewerDocument}
        onClose={() => setViewerDocument(null)}
        document={viewerDocument}
        onDownload={handleDownloadDocument}
      />
    </>
  );
};

export default AgendaItemDocuments;
