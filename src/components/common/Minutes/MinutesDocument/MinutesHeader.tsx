/**
 * MinutesHeader Component
 * Professional document letterhead for minutes
 * Reuses the same pattern as NoticeHeader
 */

import React from 'react';
import { Avatar } from 'antd';

interface MinutesHeaderProps {
  boardName: string;
  boardType?: 'main' | 'subsidiary' | 'committee' | 'factory';
  parentBoardName?: string;
  logoUrl?: string;
  primaryColor?: string;
  contactInfo?: {
    address: string;
    poBox: string;
    city: string;
    country: string;
    phone: string;
    phoneAlt?: string;
    email: string;
    website: string;
  } | null;
  compact?: boolean;
}

export const MinutesHeader: React.FC<MinutesHeaderProps> = ({
  boardName,
  boardType,
  parentBoardName,
  logoUrl,
  primaryColor = '#324721',
  contactInfo,
  compact = false,
}) => {
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
    <div className="minutes-header">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 24,
          marginBottom: 32,
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
            <div
              style={{
                color: '#666',
                fontSize: compact ? 10 : 11,
                fontStyle: 'italic',
                marginTop: 2,
              }}
            >
              Meeting Minutes
            </div>
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

export default MinutesHeader;
