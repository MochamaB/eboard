/**
 * MinutesEditor Component
 * Main orchestrator for editing meeting minutes with rich text editor
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { message } from 'antd';

import { EditorToolbar } from './EditorToolbar';
import { EditorContent } from './EditorContent';
import { EditorStatusBar } from './EditorStatusBar';
import { EditorActionButtons } from './EditorActionButtons';
import { useAutoSave } from './useAutoSave';
import type { Minutes } from '../../../../types/minutes.types';
import type { Meeting } from '../../../../types/meeting.types';

interface MinutesEditorProps {
  minutes: Minutes;
  meeting: Meeting;
  onSave: (content: string) => Promise<void>;
  onSubmit?: () => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  readOnly?: boolean;
  primaryColor?: string;
}

export const MinutesEditor: React.FC<MinutesEditorProps> = ({
  minutes,
  meeting: _meeting,
  onSave,
  onSubmit,
  autoSave = true,
  autoSaveInterval = 30000,
  readOnly = false,
  primaryColor = '#324721',
}) => {
  const [content, setContent] = useState(minutes.content);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(autoSave);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: 'Start writing meeting minutes...',
      }),
    ],
    content: minutes.content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setHasChanges(true);
      
      // Trigger auto-save if enabled
      if (autoSaveEnabled) {
        triggerAutoSave(html);
      }
    },
  });

  // Auto-save hook
  const { lastSaved, isSaving, error, saveNow } = useAutoSave({
    onSave: async (contentToSave: string) => {
      await onSave(contentToSave);
      setHasChanges(false);
      message.success('Minutes saved successfully');
    },
    interval: autoSaveInterval,
    enabled: autoSaveEnabled,
  });

  // Trigger auto-save function
  const triggerAutoSave = useCallback((contentToSave: string) => {
    if (autoSaveEnabled && contentToSave) {
      saveNow(contentToSave);
    }
  }, [autoSaveEnabled, saveNow]);

  // Manual save handler
  const handleSave = useCallback(async () => {
    if (!content) return;
    await saveNow(content);
  }, [content, saveNow]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;
    
    // Save first, then submit
    if (hasChanges) {
      await handleSave();
    }
    
    onSubmit();
  }, [onSubmit, hasChanges, handleSave]);

  // Toggle auto-save
  const handleToggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);

  // Insert action item template
  const handleInsertActionItem = useCallback(() => {
    if (!editor) return;
    
    const actionItemTemplate = `
<h3>Action Item</h3>
<p><strong>Task:</strong> [Describe the action item]</p>
<p><strong>Assigned to:</strong> [Person name]</p>
<p><strong>Due date:</strong> [Date]</p>
<p><strong>Status:</strong> Pending</p>
`;
    
    editor.chain().focus().insertContent(actionItemTemplate).run();
  }, [editor]);

  // Insert resolution template
  const handleInsertResolution = useCallback(() => {
    if (!editor) return;
    
    const resolutionTemplate = `
<h3>Resolution</h3>
<p><strong>Resolution:</strong> RESOLVED that [resolution text]</p>
<p><strong>Vote:</strong> [X] Yes, [Y] No, [Z] Abstain - [PASSED/FAILED]</p>
`;
    
    editor.chain().focus().insertContent(resolutionTemplate).run();
  }, [editor]);

  // Calculate word count
  const wordCount = editor?.storage.characterCount?.words() || 
    content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;

  // Calculate character count
  const characterCount = editor?.storage.characterCount?.characters() || 
    content.replace(/<[^>]*>/g, '').length;

  // Can submit if there's content and no unsaved changes
  const canSubmit = !!content && !hasChanges && !isSaving;

  // Update editor content when minutes change
  useEffect(() => {
    if (editor && minutes.content !== editor.getHTML()) {
      editor.commands.setContent(minutes.content);
      setContent(minutes.content);
    }
  }, [minutes.content, editor]);

  return (
    <div className="minutes-editor">
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        onInsertActionItem={handleInsertActionItem}
        onInsertResolution={handleInsertResolution}
        primaryColor={primaryColor}
      />

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        placeholder="Start writing meeting minutes..."
        minHeight={500}
        primaryColor={primaryColor}
      />

      {/* Status Bar */}
      <EditorStatusBar
        wordCount={wordCount}
        characterCount={characterCount}
        lastSaved={lastSaved}
        isSaving={isSaving}
        autoSaveEnabled={autoSaveEnabled}
        onToggleAutoSave={handleToggleAutoSave}
        error={error}
      />

      {/* Action Buttons */}
      <EditorActionButtons
        onSave={handleSave}
        onSubmit={onSubmit ? handleSubmit : undefined}
        isSaving={isSaving}
        canSubmit={canSubmit}
        primaryColor={primaryColor}
      />
    </div>
  );
};

export default MinutesEditor;
