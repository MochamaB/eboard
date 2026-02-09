/**
 * DocumentUploadModal Component
 * Modal for uploading documents with metadata form
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Space,
  message,
  Tag,
  Spin,
} from 'antd';
import { useBoardContext } from '../../../contexts';
import { useUploadDocument } from '../../../hooks/api/useDocuments';
import { useActiveDocumentCategories } from '../../../hooks/api/useDocumentCategories';
import type { DocumentAccessLevel, Document as DocumentType } from '../../../types/document.types';
import { DocumentDropzone } from './DocumentDropzone';

const { TextArea } = Input;
const { Option } = Select;

// Access level options (still hardcoded - can be made dynamic later)
const ACCESS_LEVEL_OPTIONS: { value: DocumentAccessLevel; label: string }[] = [
  { value: 'board_members', label: 'Board Members Only' },
  { value: 'participants', label: 'Meeting Participants' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'public', label: 'Public' },
];

interface FormValues {
  name: string;
  description?: string;
  category: string;
  accessLevel: DocumentAccessLevel;
  tags?: string[];
  isConfidential: boolean;
  watermarkEnabled: boolean;
}

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (uploadedDocument?: DocumentType) => void;
  boardId?: string;
  defaultCategory?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onClose,
  onSuccess,
  boardId,
  defaultCategory = 'attachment',
}) => {
  const { theme, currentBoard } = useBoardContext();
  const [form] = Form.useForm<FormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  
  // Fetch dynamic categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useActiveDocumentCategories(
    boardId || currentBoard?.id
  );

  // Debug logging
  console.log('[DocumentUploadModal] Categories state:', {
    boardId: boardId || currentBoard?.id,
    categoriesCount: categories?.length || 0,
    isLoading: categoriesLoading,
    error: categoriesError,
    categories: categories,
  });

  const uploadMutation = useUploadDocument({
    onSuccess: (uploadedDocument: DocumentType) => {
      message.success('Document uploaded successfully');
      handleClose();
      onSuccess?.(uploadedDocument);
    },
    onError: (error) => {
      message.error(error.message || 'Failed to upload document');
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    // Auto-fill name from filename (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    form.setFieldValue('name', nameWithoutExt);
  }, [form]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    form.setFieldValue('name', '');
  }, [form]);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setTagInput('');
    form.resetFields();
    onClose();
  }, [form, onClose]);

  const handleSubmit = async () => {
    console.log('=== UPLOAD SUBMIT STARTED ===');
    
    if (!selectedFile) {
      message.warning('Please select a file to upload');
      return;
    }

    try {
      const values = await form.validateFields();
      
      // Debug logging
      console.log('[DocumentUploadModal] Form values:', values);
      console.log('[DocumentUploadModal] Flags:', {
        isConfidential: values.isConfidential,
        watermarkEnabled: values.watermarkEnabled,
      });
      console.log('[DocumentUploadModal] All form fields:', form.getFieldsValue());
      
      await uploadMutation.mutateAsync({
        file: selectedFile,
        metadata: {
          name: values.name,
          description: values.description,
          category: values.category,
          boardId: boardId || currentBoard?.id || null,
          accessLevel: values.accessLevel,
          tags: values.tags,
          isConfidential: values.isConfidential,
          watermarkEnabled: values.watermarkEnabled,
        },
      });
    } catch (error) {
      // Form validation error - handled by antd
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getFieldValue('tags') || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setFieldValue('tags', [...currentTags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getFieldValue('tags') || [];
    form.setFieldValue(
      'tags',
      currentTags.filter((tag: string) => tag !== tagToRemove)
    );
  };

  return (
    <Modal
      title="Upload Document"
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText="Upload Document"
      okButtonProps={{
        loading: uploadMutation.isPending,
        disabled: !selectedFile,
        style: {
          backgroundColor: theme.primaryColor,
          borderColor: theme.primaryColor,
        },
      }}
      width={560}
      destroyOnClose
    >
      {/* Dropzone */}
      <div style={{ marginBottom: 24 }}>
        <DocumentDropzone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onRemoveFile={handleRemoveFile}
          loading={uploadMutation.isPending}
        />
      </div>

      {/* Metadata Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          category: defaultCategory,
          accessLevel: 'board_members',
          isConfidential: true,
          watermarkEnabled: true,
          tags: [],
        }}
      >
        {/* Document Name */}
        <Form.Item
          name="name"
          label="Document Name"
          rules={[{ required: true, message: 'Please enter document name' }]}
        >
          <Input placeholder="Enter document name" />
        </Form.Item>

        {/* Category & Access Level */}
        <Space style={{ width: '100%' }} size={16}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
            style={{ flex: 1 }}
          >
            <Select 
              placeholder="Select category"
              loading={categoriesLoading}
              notFoundContent={categoriesLoading ? <Spin size="small" /> : 'No categories available'}
            >
              {categories?.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  <Tag color={cat.color} style={{ marginRight: 8 }}>
                    {cat.name}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="accessLevel"
            label="Access Level"
            style={{ flex: 1 }}
          >
            <Select placeholder="Select access level">
              {ACCESS_LEVEL_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Space>

        {/* Description */}
        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="Optional description..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Tags */}
        <Form.Item name="tags" label="Tags">
          <div>
            <Input
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault();
                handleAddTag();
              }}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {(form.getFieldValue('tags') || []).map((tag: string) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                  style={{ marginBottom: 4 }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </Form.Item>

        {/* Security Options */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            padding: '12px 16px',
            backgroundColor: theme.backgroundTertiary,
            borderRadius: 6,
          }}
        >
          <Form.Item
            name="isConfidential"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Checkbox style={{ color: theme.textPrimary }}>
              Confidential
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="watermarkEnabled"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Checkbox style={{ color: theme.textPrimary }}>
              Enable Watermark
            </Checkbox>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default DocumentUploadModal;
