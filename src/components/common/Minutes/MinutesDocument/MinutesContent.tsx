/**
 * MinutesContent Component
 * Display sanitized HTML content of minutes
 */

import React, { useMemo } from 'react';
import { Empty } from 'antd';
import DOMPurify from 'dompurify';

interface MinutesContentProps {
  content: string;
  primaryColor?: string;
}

export const MinutesContent: React.FC<MinutesContentProps> = ({
  content,
  primaryColor = '#324721',
}) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'div', 'span',
        'strong', 'em', 'u', 's', 'sub', 'sup',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'pre', 'code',
        'a', 'img',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'class', 'style',
        'colspan', 'rowspan',
      ],
    });
  }, [content]);

  if (!content) {
    return (
      <Empty
        description="No content available"
        style={{ padding: '40px 0' }}
      />
    );
  }

  return (
    <>
      <div
        className="minutes-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      
      {/* Inline styles for this component */}
      <style>{`
        .minutes-content {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 14px;
          line-height: 1.8;
          color: #000;
          max-width: 100%;
        }

        .minutes-content h1 {
          font-size: 24px;
          font-weight: 700;
          color: ${primaryColor};
          margin: 32px 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid ${primaryColor};
          page-break-after: avoid;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .minutes-content h2 {
          font-size: 18px;
          font-weight: 700;
          color: ${primaryColor};
          margin: 24px 0 12px 0;
          page-break-after: avoid;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .minutes-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 20px 0 10px 0;
          page-break-after: avoid;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .minutes-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: #444;
          margin: 16px 0 8px 0;
          page-break-after: avoid;
        }

        .minutes-content p {
          margin: 12px 0;
          text-align: justify;
        }

        .minutes-content p strong {
          font-weight: 600;
          color: #000;
        }

        .minutes-content ul,
        .minutes-content ol {
          margin: 12px 0;
          padding-left: 32px;
        }

        .minutes-content li {
          margin: 8px 0;
          line-height: 1.6;
        }

        .minutes-content ul {
          list-style-type: disc;
        }

        .minutes-content ul ul {
          list-style-type: circle;
          margin-top: 4px;
        }

        .minutes-content ol {
          list-style-type: decimal;
        }

        .minutes-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          page-break-inside: avoid;
        }

        .minutes-content th,
        .minutes-content td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }

        .minutes-content th {
          background-color: ${primaryColor}15;
          font-weight: 600;
          color: ${primaryColor};
        }

        .minutes-content tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        .minutes-content blockquote {
          margin: 16px 0;
          padding: 12px 20px;
          border-left: 4px solid ${primaryColor};
          background-color: #f5f5f5;
          font-style: italic;
        }

        .minutes-content pre {
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 12px 0;
        }

        .minutes-content code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .minutes-content a {
          color: ${primaryColor};
          text-decoration: underline;
        }

        .minutes-content a:hover {
          color: ${primaryColor}dd;
        }

        .minutes-content hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 24px 0;
        }

        .minutes-content img {
          max-width: 100%;
          height: auto;
          margin: 16px 0;
        }

        @media print {
          .minutes-content {
            font-size: 11pt !important;
            line-height: 1.6 !important;
          }
          
          .minutes-content h1 {
            font-size: 18pt !important;
          }
          
          .minutes-content h2 {
            font-size: 14pt !important;
          }
          
          .minutes-content h3 {
            font-size: 12pt !important;
          }
          
          .minutes-content p {
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
    </>
  );
};

export default MinutesContent;
