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
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import {
  useMeetingDocuments,
  useAttachDocumentToMeeting,
  useDetachDocumentFromMeeting,
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);

  // Fetch meeting documents
  const { data: attachments = [], isLoading, error, refetch } = useMeetingDocuments(meeting.id);

  // Map attachments to documents with entity metadata preserved
  const documents = attachments.map(att => ({
    ...att.document,
    entityLabel: att.entityLabel,
    entityType: att.entityType,
    entityId: att.entityId,
  }));

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
    setViewerDocument(document as Document);
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
      {/* Action Buttons */}
      <Card
        style={{
          marginBottom: 16,
          backgroundColor: theme.backgroundSecondary,
        }}
        bodyStyle={{ padding: 16 }}
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
            Upload New
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setPickerOpen(true)}
          >
            Attach Existing
          </Button>
        </Space>
      </Card>

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
            onRemove={handleRemoveDocument}
            onAttach={() => setPickerOpen(true)}
            onUpload={() => setUploadOpen(true)}
            showAttachButton={true}
            showUploadButton={true}
            showRemoveButton={true}
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
