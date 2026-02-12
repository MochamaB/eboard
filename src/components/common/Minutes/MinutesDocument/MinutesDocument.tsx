/**
 * MinutesDocument Component
 * Main orchestrator for displaying meeting minutes
 * Two-column responsive layout: Content (left) + Workflow Panel (right)
 */

import React from 'react';
import { Grid } from 'antd';
import { MinutesHeader } from './MinutesHeader';
import { MinutesContent } from './MinutesContent';
import { MinutesWorkflowPanel } from './MinutesWorkflowPanel';
import type { Minutes } from '../../../../types/minutes.types';
import type { Meeting } from '../../../../types/meeting.types';
import './MinutesDocument.css';

const { useBreakpoint } = Grid;

export interface MinutesDocumentProps {
  minutes: Minutes;
  meeting: Meeting;
  
  // Board context (passed as props, not from context)
  boardName: string;
  boardType?: 'main' | 'subsidiary' | 'factory' | 'committee';
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
  
  // Display options
  showActions?: boolean;
  showSignatures?: boolean;
  archivedDate?: string;
  
  // Callbacks
  onDownloadPDF?: () => void;
  onPrint?: () => void;
  
  // Styling
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MinutesDocument: React.FC<MinutesDocumentProps> = ({
  minutes,
  meeting,
  boardName,
  boardType,
  parentBoardName,
  logoUrl,
  primaryColor = '#324721',
  contactInfo,
  showActions = true,
  showSignatures: _showSignatures = true,
  archivedDate,
  onDownloadPDF,
  onPrint,
  compact = false,
  className = '',
  style,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div 
      className={`minutes-document ${className}`}
      style={style}
    >
      {/* Two-Column Layout: Content (left) + Sidebar (right) */}
      <div className={`minutes-document__layout ${isMobile ? 'minutes-document__layout--mobile' : ''}`}>
        {/* Main Content Column */}
        <div className="minutes-document__content">
          {/* Letterhead - Compact on left */}
          <MinutesHeader
            boardName={boardName}
            boardType={boardType}
            parentBoardName={parentBoardName}
            logoUrl={logoUrl}
            primaryColor={primaryColor}
            contactInfo={contactInfo}
            compact={compact}
          />
          
          {/* Minutes Content - starts immediately after header */}
          <MinutesContent
            content={minutes.content}
            primaryColor={primaryColor}
          />
        </div>

        {/* Sidebar Column - Workflow Panel */}
        <div className="minutes-document__sidebar">
          <MinutesWorkflowPanel
            minutes={minutes}
            meetingTitle={meeting.title}
            archivedDate={archivedDate}
            primaryColor={primaryColor}
            showActions={showActions}
            onDownloadPDF={onDownloadPDF}
            onPrint={onPrint}
          />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .minutes-document__sidebar {
            display: none !important;
          }
          
          .minutes-document__content {
            width: 100% !important;
            max-width: 100% !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            margin: 2cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default MinutesDocument;
