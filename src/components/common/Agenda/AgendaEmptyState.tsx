/**
 * Agenda Empty State Component
 * Displays "No Agenda Created" state with options to create from scratch or use template
 */

import React, { useState } from 'react';
import { Button, Dropdown, Space, Typography, Divider, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  FileAddOutlined,
  CopyOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { AgendaTemplate } from '../../../types/agenda.types';
import { DocumentUpload } from '../DocumentUpload';
import {
  parseDocumentToAgendaItems,
  type ParsedAgendaItem,
  SUPPORTED_DOCUMENT_TYPES,
} from '../../../utils/documentParser';

const { Title, Text } = Typography;

export interface AgendaEmptyStateProps {
  /** Handler for creating agenda from scratch */
  onCreateFromScratch: () => void;
  /** Handler for using a template */
  onUseTemplate: (templateId: string) => void;
  /** Handler for importing agenda from document - receives parsed items */
  onImportFromDocument?: (items: ParsedAgendaItem[], fileName: string) => void;
  /** Available templates */
  templates?: AgendaTemplate[];
  /** Loading state */
  loading?: boolean;
}

export const AgendaEmptyState: React.FC<AgendaEmptyStateProps> = ({
  onCreateFromScratch,
  onUseTemplate,
  onImportFromDocument,
  templates = [],
  loading = false,
}) => {
  const { theme } = useBoardContext();

  // Import state
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<string>('');
  const [importError, setImportError] = useState<string>('');

  // Handle file upload and parsing
  const handleFileSelect = async (file: File) => {
    if (!onImportFromDocument) return;

    setImportLoading(true);
    setImportError('');
    setImportProgress(10);
    setImportStatus('Reading document...');

    try {
      // Simulate progress for better UX
      setImportProgress(30);
      setImportStatus('Extracting text...');

      const result = await parseDocumentToAgendaItems(file);

      setImportProgress(70);
      setImportStatus(`Found ${result.items.length} items...`);

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 300));

      setImportProgress(100);
      setImportStatus('Creating agenda...');

      // Pass parsed items to parent
      onImportFromDocument(result.items, result.fileName);

      message.success(`Imported ${result.items.length} agenda items from ${file.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse document';
      setImportError(errorMessage);
      message.error(errorMessage);
    } finally {
      setImportLoading(false);
      setImportProgress(0);
      setImportStatus('');
    }
  };

  // Template dropdown menu items
  const templateMenuItems: MenuProps['items'] = templates.map((template) => ({
    key: template.id,
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '200px' }}>
        <span>{template.name}</span>
        <span style={{ color: theme.textSecondary, fontSize: '12px', marginLeft: '12px' }}>
          {template.items.length} items
        </span>
      </div>
    ),
    icon: <CopyOutlined style={{ color: theme.primaryColor }} />,
  }));

  const handleTemplateSelect: MenuProps['onClick'] = ({ key }) => {
    onUseTemplate(key);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          backgroundColor: theme.primaryLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <FileAddOutlined
          style={{
            fontSize: '28px',
            color: theme.primaryColor,
          }}
        />
      </div>

      {/* Title */}
      <Title level={5} style={{ margin: 0, marginBottom: '4px', color: theme.textPrimary, fontWeight: 500 }}>
        No Agenda Created
      </Title>

      {/* Description */}
      <Text
        style={{
          color: theme.textSecondary,
          marginBottom: '20px',
          fontSize: '14px',
        }}
      >
        Create an agenda to organize this meeting's discussion items.
      </Text>

      {/* Action Buttons */}
      <Space size="middle" style={{ marginBottom: '20px' }}>
        <Button
          type="primary"
          icon={<FileAddOutlined />}
          onClick={onCreateFromScratch}
          loading={loading}
          style={{
            backgroundColor: theme.primaryColor,
            borderColor: theme.primaryColor,
            height: '36px',
          }}
        >
          Start from Scratch
        </Button>
        <Dropdown
          menu={{ items: templateMenuItems, onClick: handleTemplateSelect }}
          disabled={templates.length === 0 || loading}
          trigger={['click']}
        >
          <Button
            icon={<CopyOutlined />}
            disabled={templates.length === 0}
            style={{
              borderColor: theme.primaryColor,
              color: theme.primaryColor,
              height: '36px',
            }}
          >
            Use Template <DownOutlined style={{ fontSize: '10px', marginLeft: '4px' }} />
          </Button>
        </Dropdown>
      </Space>

      {/* Document Import Section - Compact */}
      {onImportFromDocument && (
        <div style={{ width: '100%' }}>
          <Divider style={{ margin: '0 0 16px 0', fontSize: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>or import from document</Text>
          </Divider>
          
          <DocumentUpload
            accept={SUPPORTED_DOCUMENT_TYPES.join(',')}
            onFileSelect={handleFileSelect}
            loading={importLoading}
            progress={importProgress}
            statusMessage={importStatus}
            errorMessage={importError}
            compact
            placeholder="Drop file or click to upload"
            formatsText="PDF, Word, Text"
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
};
