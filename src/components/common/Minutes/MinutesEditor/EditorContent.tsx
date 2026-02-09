/**
 * EditorContent Component
 * TipTap editor wrapper with custom styling for minutes content
 */

import React from 'react';
import { EditorContent as TipTapEditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

interface EditorContentProps {
  editor: Editor | null;
  placeholder?: string;
  minHeight?: number;
  primaryColor?: string;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  editor,
  placeholder = 'Start writing meeting minutes...',
  minHeight = 400,
  primaryColor = '#324721',
}) => {
  return (
    <>
      <div className="editor-content-wrapper">
        <TipTapEditorContent editor={editor} />
      </div>

      {/* Editor Styles */}
      <style>{`
        .editor-content-wrapper {
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 16px;
          min-height: ${minHeight}px;
          background: #fff;
          transition: border-color 0.3s;
        }

        .editor-content-wrapper:focus-within {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 2px ${primaryColor}15;
        }

        /* TipTap Editor Styles */
        .ProseMirror {
          outline: none;
          min-height: ${minHeight - 32}px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 14px;
          line-height: 1.8;
          color: #000;
        }

        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder}';
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        /* Headings */
        .ProseMirror h1 {
          font-size: 24px;
          font-weight: 700;
          color: ${primaryColor};
          margin: 32px 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid ${primaryColor};
          font-family: Georgia, 'Times New Roman', serif;
        }

        .ProseMirror h2 {
          font-size: 18px;
          font-weight: 700;
          color: ${primaryColor};
          margin: 24px 0 12px 0;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .ProseMirror h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 20px 0 10px 0;
          font-family: Georgia, 'Times New Roman', serif;
        }

        /* Paragraphs */
        .ProseMirror p {
          margin: 12px 0;
        }

        .ProseMirror p strong {
          font-weight: 600;
          color: #000;
        }

        /* Lists */
        .ProseMirror ul,
        .ProseMirror ol {
          margin: 12px 0;
          padding-left: 32px;
        }

        .ProseMirror li {
          margin: 8px 0;
          line-height: 1.6;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ul ul {
          list-style-type: circle;
          margin-top: 4px;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        /* Tables */
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }

        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }

        .ProseMirror th {
          background-color: ${primaryColor}15;
          font-weight: 600;
          color: ${primaryColor};
        }

        .ProseMirror tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        /* Blockquotes */
        .ProseMirror blockquote {
          margin: 16px 0;
          padding: 12px 20px;
          border-left: 4px solid ${primaryColor};
          background-color: #f5f5f5;
          font-style: italic;
        }

        /* Code */
        .ProseMirror code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .ProseMirror pre {
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 12px 0;
        }

        /* Horizontal Rule */
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 24px 0;
        }

        /* Selection */
        .ProseMirror ::selection {
          background-color: ${primaryColor}30;
        }

        /* Focus */
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </>
  );
};

export default EditorContent;
