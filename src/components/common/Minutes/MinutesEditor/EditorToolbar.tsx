/**
 * EditorToolbar Component
 * Formatting toolbar for the minutes editor
 */

import React from 'react';
import { Button, Space, Divider, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  TableOutlined,
  UndoOutlined,
  RedoOutlined,
  PlusOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
  onInsertActionItem?: () => void;
  onInsertResolution?: () => void;
  primaryColor?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onInsertActionItem,
  onInsertResolution,
  primaryColor = '#324721',
}) => {
  if (!editor) {
    return null;
  }

  // Heading menu items
  const headingItems: MenuProps['items'] = [
    {
      key: 'h1',
      label: 'Heading 1',
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      key: 'h2',
      label: 'Heading 2',
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      key: 'h3',
      label: 'Heading 3',
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      key: 'paragraph',
      label: 'Normal Text',
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
  ];

  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#fafafa',
        borderBottom: '1px solid #d9d9d9',
        borderRadius: '4px 4px 0 0',
      }}
    >
      <Space wrap size={8}>
        {/* Text Formatting */}
        <Button.Group>
          <Tooltip title="Bold (Ctrl+B)">
            <Button
              size="small"
              icon={<BoldOutlined />}
              onClick={() => editor.chain().focus().toggleBold().run()}
              type={editor.isActive('bold') ? 'primary' : 'default'}
            />
          </Tooltip>
          <Tooltip title="Italic (Ctrl+I)">
            <Button
              size="small"
              icon={<ItalicOutlined />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              type={editor.isActive('italic') ? 'primary' : 'default'}
            />
          </Tooltip>
          <Tooltip title="Underline (Ctrl+U)">
            <Button
              size="small"
              icon={<UnderlineOutlined />}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              type={editor.isActive('underline') ? 'primary' : 'default'}
            />
          </Tooltip>
        </Button.Group>

        <Divider type="vertical" />

        {/* Headings */}
        <Dropdown menu={{ items: headingItems }} trigger={['click']}>
          <Button size="small">
            {editor.isActive('heading', { level: 1 }) ? 'H1' :
             editor.isActive('heading', { level: 2 }) ? 'H2' :
             editor.isActive('heading', { level: 3 }) ? 'H3' : 'Normal'}
          </Button>
        </Dropdown>

        <Divider type="vertical" />

        {/* Lists */}
        <Button.Group>
          <Tooltip title="Bullet List">
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              type={editor.isActive('bulletList') ? 'primary' : 'default'}
            />
          </Tooltip>
          <Tooltip title="Numbered List">
            <Button
              size="small"
              icon={<OrderedListOutlined />}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              type={editor.isActive('orderedList') ? 'primary' : 'default'}
            />
          </Tooltip>
        </Button.Group>

        <Divider type="vertical" />

        {/* Table */}
        <Tooltip title="Insert Table">
          <Button
            size="small"
            icon={<TableOutlined />}
            onClick={handleInsertTable}
          />
        </Tooltip>

        <Divider type="vertical" />

        {/* Undo/Redo */}
        <Button.Group>
          <Tooltip title="Undo (Ctrl+Z)">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            />
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Y)">
            <Button
              size="small"
              icon={<RedoOutlined />}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            />
          </Tooltip>
        </Button.Group>

        <Divider type="vertical" />

        {/* Insert Actions */}
        {onInsertActionItem && (
          <Tooltip title="Insert Action Item">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={onInsertActionItem}
              style={{ color: primaryColor }}
            >
              Action Item
            </Button>
          </Tooltip>
        )}

        {onInsertResolution && (
          <Tooltip title="Insert Resolution">
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={onInsertResolution}
              style={{ color: primaryColor }}
            >
              Resolution
            </Button>
          </Tooltip>
        )}
      </Space>
    </div>
  );
};

export default EditorToolbar;
