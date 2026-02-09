/**
 * Meeting Documents Tab
 * Manage documents attached to a meeting
 */

import React, { useState, useCallback } from 'react';
import { Button, Space, Spin, Alert, message, Modal, Card, Typography, Empty } from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import { useMeetingPermissions } from '../../../hooks/meetings/useMeetingPermissions';
import {
  useMeetingDocuments,
  useAttachDocumentToMeeting,
  useDetachDocumentFromMeeting,
  useDocument,
} from '../../../hooks/api/useDocuments';
import {
  AttachedDocumentsList,
  DocumentPickerModal,
  DocumentUploadModal,
  DocumentViewerModal,
} from '../../../components/Documents';
import type { Meeting } from '../../../types/meeting.types';
import type { Document, DocumentSummary } from '../../../types/document.types';

const { Text } = Typography;

interface MeetingDocumentsTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingDocumentsTab: React.FC<MeetingDocumentsTabProps> = ({
  meeting,
  themeColor,
}) => {
  const { theme, currentBoard } = useBoardContext();
  const permissions = useMeetingPermissions();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);

  // Fetch full document when viewing
  const { data: fullDocument, isLoading: loadingFullDocument } = useDocument(
    viewingDocumentId || '',
    {
      enabled: !!viewingDocumentId,
    }
  );

  // Set viewer document when full document is loaded
  React.useEffect(() => {
    if (fullDocument && viewingDocumentId) {
      setViewerDocument(fullDocument);
      setViewingDocumentId(null);
    }
  }, [fullDocument, viewingDocumentId]);

  // Status flags
  const isCancelled = meeting.status === 'cancelled';
  const isApproved = meeting.status === 'scheduled' && meeting.subStatus === 'approved';
  const isCompleted = meeting.status === 'completed';
  const isRejected = meeting.status === 'scheduled' && meeting.subStatus === 'rejected';

  // Determine if documents can be edited
  const canEditDocuments = 
    meeting.status === 'draft' || 
    (meeting.status === 'scheduled' && (meeting.subStatus === 'pending_approval' || meeting.subStatus === 'rejected'));

  // Fetch meeting documents
  const { data: attachments = [], isLoading, error, refetch } = useMeetingDocuments(meeting.id);

  // Extract documents from attachments
  const documents = attachments.map(att => att.document);

  // Mutations
  const attachMutation = useAttachDocumentToMeeting(meeting.id, {
    onSuccess: () => {
      message.success('Document attached successfully');
      setPickerOpen(false);
      refetch();
    },
    onError: (error) => {
      message.error(`Failed to attach document: ${error.message}`);
    },
  });

  const detachMutation = useDetachDocumentFromMeeting(meeting.id, {
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
      content: `Are you sure you want to remove "${document.name}" from this meeting?`,
      okText: 'Remove',
      okType: 'danger',
      onOk: () => detachMutation.mutate(document.id),
    });
  }, [detachMutation]);

  const handleViewDocument = useCallback((document: Document | DocumentSummary) => {
    // Fetch full document before viewing
    setViewingDocumentId(document.id);
  }, []);

  const handleDownloadDocument = useCallback((document: Document | DocumentSummary) => {
    window.open(document.url, '_blank');
  }, []);

  const handleUploadSuccess = useCallback((uploadedDocument?: Document) => {
    if (uploadedDocument) {
      // Attach the uploaded document to the meeting
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
    return (
      <Alert
        type="error"
        message="Failed to load documents"
        description={error.message}
        showIcon
        style={{ margin: '16px 0' }}
      />
    );
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Cancellation Banner */}
      {isCancelled && (
        <Alert
          message="Meeting Cancelled"
          description="This meeting has been cancelled. Documents are read-only."
          type="warning"
          icon={<StopOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Approved Banner */}
      {isApproved && (
        <Alert
          message="Meeting Approved"
          description="This meeting has been approved. Documents are finalized and cannot be modified."
          type="info"
          icon={<CheckCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <Alert
          message="Meeting Rejected"
          description="This meeting was rejected. You can modify documents and resubmit."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Completed Banner */}
      {isCompleted && (
        <Alert
          message="Meeting Completed"
          description="This meeting has been completed. Documents are archived and read-only."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Documents List */}
      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Loading documents...</Text>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <Empty
            image={<FolderOpenOutlined style={{ fontSize: 64, color: theme.textDisabled }} />}
            description={
              <Space direction="vertical" size={8}>
                <Text strong>No Documents Attached</Text>
                <Text type="secondary">
                  Upload new documents or attach existing ones to this meeting
                </Text>
              </Space>
            }
            style={{ padding: '40px 0' }}
          >
            <Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setUploadOpen(true)}
                style={{
                  backgroundColor: themeColor || theme.primaryColor,
                  borderColor: themeColor || theme.primaryColor,
                }}
              >
                Upload Document
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setPickerOpen(true)}
              >
                Attach Existing
              </Button>
            </Space>
          </Empty>
        ) : (
          <AttachedDocumentsList
            documents={documents}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
            onRemove={canEditDocuments ? handleRemoveDocument : undefined}
            onAttach={canEditDocuments ? () => setPickerOpen(true) : undefined}
            onUpload={canEditDocuments ? () => setUploadOpen(true) : undefined}
            showAttachButton={canEditDocuments}
            showUploadButton={canEditDocuments}
            showRemoveButton={canEditDocuments}
            showEntityLabels={true}
            title="Meeting Documents"
            emptyText="No documents attached"
          />
        )}
      </Card>

      {/* Document Picker Modal */}
      <DocumentPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAttachDocuments}
        boardId={currentBoard?.id}
        excludeIds={attachedDocumentIds}
        multiple={true}
        title="Attach Documents to Meeting"
      />

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        boardId={currentBoard?.id || meeting.boardId}
        defaultCategory="board_pack"
      />

      {/* Viewer Modal */}
      <DocumentViewerModal
        open={!!viewerDocument}
        onClose={() => setViewerDocument(null)}
        document={viewerDocument}
        onDownload={handleDownloadDocument}
      />
    </div>
  );
};

export default MeetingDocumentsTab;
