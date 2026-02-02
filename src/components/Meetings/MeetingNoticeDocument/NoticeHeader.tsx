/**
 * NoticeHeader Component
 * Formal document letterhead with logo and contact details
 * Styled to look like a professional PDF/Word document header
 */

import React from 'react';
import { Avatar } from 'antd';
import type { BoardBranding, BoardContactInfo } from '../../../types/board.types';

interface NoticeHeaderProps {
  boardName: string;
  parentBoardName?: string;
  boardType?: 'main' | 'subsidiary' | 'committee' | 'factory';
  logoUrl?: string;
  branding?: BoardBranding | null;
  contactInfo?: BoardContactInfo | null;
  compact?: boolean;
}

export const NoticeHeader: React.FC<NoticeHeaderProps> = ({
  boardName,
  parentBoardName,
  boardType,
  logoUrl,
  branding,
  contactInfo,
  compact = false,
}) => {
  const primaryColor = branding?.primaryColor || '#324721';

  const getBoardTypeLabel = () => {
    if (!boardType || boardType === 'main') return null;
    switch (boardType) {
      case 'subsidiary':
        return parentBoardName ? `A subsidiary of ${parentBoardName}` : null;
      case 'committee':
        return parentBoardName ? `Committee of ${parentBoardName}` : null;
      case 'factory':
        return parentBoardName ? `Factory under ${parentBoardName}` : null;
      default:
        return null;
    }
  };

  const typeLabel = getBoardTypeLabel();

  return (
    <div className="notice-header" style={{ borderBottom: `3px solid ${primaryColor}` }}>
      {/* Letterhead - Logo left, Contact right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: compact ? '16px 24px' : '24px 32px',
          gap: 24,
        }}
      >
        {/* Left: Logo and Board Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={boardName}
              style={{
                height: compact ? 48 : 64,
                maxWidth: compact ? 100 : 140,
                objectFit: 'contain',
              }}
            />
          ) : (
            <Avatar
              size={compact ? 48 : 64}
              style={{
                backgroundColor: primaryColor,
                color: '#fff',
                fontWeight: 'bold',
                fontSize: compact ? 20 : 24,
              }}
            >
              {boardName.charAt(0)}
            </Avatar>
          )}
          <div>
            <div
              style={{
                color: primaryColor,
                fontSize: compact ? 18 : 22,
                fontWeight: 700,
                lineHeight: 1.2,
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {boardName}
            </div>
            {typeLabel && (
              <div
                style={{
                  color: '#666',
                  fontSize: compact ? 10 : 11,
                  fontStyle: 'italic',
                  marginTop: 2,
                }}
              >
                {typeLabel}
              </div>
            )}
          </div>
        </div>

        {/* Right: Contact Details */}
        {contactInfo && (
          <div
            style={{
              textAlign: 'right',
              fontSize: compact ? 10 : 11,
              color: '#444',
              lineHeight: 1.6,
            }}
          >
            <div>{contactInfo.address}</div>
            <div>{contactInfo.poBox}, {contactInfo.city}</div>
            <div>{contactInfo.country}</div>
            <div style={{ marginTop: 4 }}>
              Tel: {contactInfo.phone}
              {contactInfo.phoneAlt && ` | ${contactInfo.phoneAlt}`}
            </div>
            <div>Email: {contactInfo.email}</div>
            <div>{contactInfo.website}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeHeader;
