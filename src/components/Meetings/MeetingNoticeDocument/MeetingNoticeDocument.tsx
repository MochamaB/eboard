/**
 * MeetingNoticeDocument Component
 * Formal meeting notice document styled like a PDF/Word document
 * 
 * Supports multiple modes:
 * - preview: Secretary preview before submission
 * - approval: Approver review with signature section
 * - rsvp: Member RSVP view with response buttons
 * - email: Static HTML for email notifications
 * - print: Print/PDF export friendly
 * - execution: During meeting reference
 */

import React from 'react';
import type { Meeting } from '../../../types/meeting.types';
import { MEETING_TYPE_LABELS } from '../../../types/meeting.types';
import type { Board, BoardBranding, BoardContactInfo } from '../../../types/board.types';
import type { AgendaItem } from '../../../types/agenda.types';
import type { ConfirmationDisplayInfo } from '../../../utils/confirmationWorkflow';
import { NoticeHeader } from './NoticeHeader';
import { NoticeMeetingDetails } from './NoticeMeetingDetails';
import { NoticeAgenda } from './NoticeAgenda';
import { NoticeParticipants } from './NoticeParticipants';
import { NoticeSignatureBlock, type ApprovalStatus } from './NoticeSignatureBlock';
import { NoticeRsvpSection } from './NoticeRsvpSection';
import './MeetingNoticeDocument.css';

export type NoticeMode = 'preview' | 'approval' | 'rsvp' | 'email' | 'print' | 'execution';

export interface MeetingNoticeDocumentProps {
  meeting: Meeting;
  
  // Board context (can be passed or derived from meeting)
  board?: Board | null;
  parentBoard?: Board | null;
  branding?: BoardBranding | null;
  contactInfo?: BoardContactInfo | null;
  logoUrl?: string;
  
  // Display mode
  mode?: NoticeMode;
  
  // Custom content
  customNotes?: string | string[];
  agendaItems?: AgendaItem[];
  
  // Confirmation data (from MeetingConfirmationHistory)
  confirmationInfo?: ConfirmationDisplayInfo;
  
  // Legacy approval props (deprecated - use confirmationInfo instead)
  approverName?: string;
  approverTitle?: string;
  approvalDate?: string;
  digitalSignature?: string;
  
  // RSVP section
  currentRsvpResponse?: 'attending' | 'not_attending' | 'tentative';
  rsvpDeadline?: string;
  
  // Callbacks
  onApprove?: () => void;
  onReject?: () => void;
  onRsvp?: (response: 'attending' | 'not_attending' | 'tentative') => void;
  onEdit?: () => void;
  
  // Styling
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MeetingNoticeDocument: React.FC<MeetingNoticeDocumentProps> = ({
  meeting,
  board,
  parentBoard,
  branding,
  contactInfo,
  logoUrl,
  mode = 'preview',
  customNotes,
  agendaItems,
  confirmationInfo,
  approverName,
  approverTitle,
  approvalDate,
  digitalSignature,
  currentRsvpResponse,
  rsvpDeadline,
  onRsvp,
  compact = false,
  className = '',
  style,
}) => {
  const primaryColor = branding?.primaryColor || '#324721';
  
  // Determine what sections to show based on mode
  const showNotes = mode !== 'execution' && !!customNotes;
  const showSignatureBlock = mode !== 'execution';
  const showApprovalSection = mode === 'approval' || (mode === 'print' && !!approverName);
  const showRsvpSection = mode === 'rsvp';

  // Determine approval status for signature block and watermark
  const approvalStatus: ApprovalStatus = confirmationInfo?.status || 'none';
  
  // Determine if we should show watermark based on mode and status
  const showWatermark = (
    (mode === 'preview' && approvalStatus !== 'approved') ||
    (mode === 'approval' && approvalStatus === 'pending') ||
    (approvalStatus === 'rejected')
  );
  
  // Determine watermark type
  const getWatermarkClass = (): string => {
    if (approvalStatus === 'rejected') return 'notice-watermark notice-watermark--rejected';
    if (approvalStatus === 'pending') return 'notice-watermark notice-watermark--pending';
    return 'notice-watermark notice-watermark--draft';
  };
  
  const getWatermarkText = (): string => {
    if (approvalStatus === 'rejected') return 'REJECTED';
    if (approvalStatus === 'pending') return 'AWAITING SIGNATURE';
    return 'DRAFT';
  };

  // Get board info from props or meeting
  const boardName = board?.name || meeting.boardName;
  const boardType = board?.type || meeting.boardType;
  const parentBoardName = parentBoard?.name || meeting.parentBoardName;
  const boardContactInfo = contactInfo || board?.contactInfo;

  // Check if agenda items are provided
  const hasAgendaItems = agendaItems && agendaItems.length > 0;

  // Notes array
  const notesArray = customNotes 
    ? (Array.isArray(customNotes) ? customNotes : [customNotes])
    : [
        'Please ensure that you review all materials provided in advance to facilitate a productive discussion.',
        'Should you have any additional topics for the agenda, please submit them at least 3 days before the meeting.',
      ];

  return (
    <div
      className={`meeting-notice-document meeting-notice-document--${mode} ${showWatermark ? 'meeting-notice-document--with-watermark' : ''} ${className}`}
      style={{
        background: '#fff',
        border: '1px solid #d9d9d9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        fontFamily: 'Georgia, "Times New Roman", Times, serif',
        fontSize: compact ? 13 : 14,
        lineHeight: 1.7,
        color: '#333',
        maxWidth: 800,
        margin: '0 auto',
        position: 'relative',
        ...style,
      }}
    >
      {/* Watermark */}
      {showWatermark && (
        <div className={getWatermarkClass()}>
          {getWatermarkText()}
        </div>
      )}
      {/* Letterhead Header */}
      <NoticeHeader
        boardName={boardName}
        parentBoardName={parentBoardName}
        boardType={boardType}
        logoUrl={logoUrl}
        branding={branding}
        contactInfo={boardContactInfo}
        compact={compact}
      />

      {/* Document Body */}
      <div style={{ padding: compact ? '24px' : '32px 40px' }}>
        {/* Document Title */}
        <h1
          style={{
            textAlign: 'center',
            fontSize: compact ? 20 : 24,
            fontWeight: 700,
            color: primaryColor,
            margin: '0 0 8px 0',
            fontFamily: 'Georgia, "Times New Roman", Times, serif',
          }}
        >
          {MEETING_TYPE_LABELS[meeting.meetingType]} Notice
        </h1>

        {/* Meeting Title as Subtitle */}
        <h2
          style={{
            textAlign: 'center',
            fontSize: compact ? 16 : 18,
            fontWeight: 600,
            color: '#444',
            margin: '0 0 24px 0',
            fontFamily: 'Georgia, "Times New Roman", Times, serif',
          }}
        >
          {meeting.title}
        </h2>

        {/* Board Name and Meeting Type */}
        <div style={{ marginBottom: 8 }}>
          <strong>{boardName}</strong>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>{MEETING_TYPE_LABELS[meeting.meetingType]}</strong>
        </div>

        {/* Meeting Details */}
        <NoticeMeetingDetails
          startDate={meeting.startDate}
          startTime={meeting.startTime}
          duration={meeting.duration}
          locationType={meeting.locationType}
          locationDetails={meeting.locationDetails}
          virtualMeetingLink={meeting.virtualMeetingLink}
          quorumRequired={meeting.quorumRequired}
          quorumPercentage={meeting.quorumPercentage}
          primaryColor={primaryColor}
          compact={compact}
        />

        {/* Salutation */}
        <p style={{ marginBottom: 16 }}>
          <strong>Dear Board Members,</strong>
        </p>

        {/* Body Text */}
        <p style={{ textAlign: 'justify', marginBottom: 16 }}>
          This notice serves to inform you of the upcoming {MEETING_TYPE_LABELS[meeting.meetingType].toLowerCase()} scheduled for the 
          above date and time. {meeting.description || 'Your attendance is requested to discuss important matters.'}
        </p>

        {/* Agenda Section */}
        {hasAgendaItems && (
          <NoticeAgenda
            agendaItems={agendaItems}
            compact={compact}
          />
        )}

        {/* Participants Section */}
        {meeting.participants && meeting.participants.length > 0 && (
          <NoticeParticipants
            participants={meeting.participants}
            primaryColor={primaryColor}
            compact={compact}
          />
        )}

        {/* Notes Section */}
        {showNotes || notesArray.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            {notesArray.map((note, index) => (
              <p key={index} style={{ textAlign: 'justify', marginBottom: 8 }}>
                {note}
              </p>
            ))}
          </div>
        ) : null}

        {/* Closing */}
        <p style={{ marginBottom: 24 }}>
          We look forward to your valuable contributions.
        </p>

        <p style={{ marginBottom: 32 }}>
          Best Regards,
        </p>

        {/* Signature Block */}
        {showSignatureBlock && (
          <NoticeSignatureBlock
            preparedBy={{
              name: confirmationInfo?.preparedBy?.name || meeting.createdByName || 'Board Secretary',
              title: confirmationInfo?.preparedBy?.title || 'Board Secretary',
              date: confirmationInfo?.preparedBy?.date || meeting.createdAt,
            }}
            approvalStatus={approvalStatus}
            approvedBy={
              confirmationInfo?.approvedBy
                ? {
                    name: confirmationInfo.approvedBy.name,
                    title: confirmationInfo.approvedBy.title,
                    date: confirmationInfo.approvedBy.date,
                    signatureId: confirmationInfo.approvedBy.signatureId,
                    signatureImageUrl: confirmationInfo.approvedBy.signatureImageUrl,
                  }
                : showApprovalSection && approverName
                  ? {
                      name: approverName,
                      title: approverTitle,
                      date: approvalDate,
                      signatureId: digitalSignature,
                    }
                  : undefined
            }
            rejectedBy={confirmationInfo?.rejectedBy}
            compact={compact}
            boardName={boardName}
          />
        )}

        {/* RSVP Section */}
        {showRsvpSection && (
          <NoticeRsvpSection
            onRsvp={onRsvp}
            currentResponse={currentRsvpResponse}
            deadline={rsvpDeadline}
            compact={compact}
          />
        )}
      </div>
    </div>
  );
};

export default MeetingNoticeDocument;
