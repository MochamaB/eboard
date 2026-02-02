/**
 * NoticeSignatureBlock Component
 * Prepared by and Approved by sections with signature lines
 * 
 * Displays different content based on approval status:
 * - none: Only "Prepared By" section
 * - pending: "Prepared By" + "Awaiting Approval" placeholder
 * - approved: "Prepared By" + "Approved By" with digital signature indicator
 * - rejected: "Prepared By" + "Rejected" with reason
 */

import React from 'react';
import dayjs from 'dayjs';

interface SignatureInfo {
  name: string;
  title?: string;
  date?: string;
  signatureId?: string;
  signatureImageUrl?: string; // Base64 data URL of drawn signature
}

interface RejectionInfo {
  name: string;
  reason: string;
  reasonLabel: string;
  comments?: string;
  date: string;
}

export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface NoticeSignatureBlockProps {
  preparedBy: SignatureInfo;
  boardName?: string;
  compact?: boolean;
  
  // Approval status from MeetingConfirmationHistory
  approvalStatus?: ApprovalStatus;
  
  // Approved by info (when approved)
  approvedBy?: SignatureInfo;
  
  // Rejection info (when rejected)
  rejectedBy?: RejectionInfo;
}

export const NoticeSignatureBlock: React.FC<NoticeSignatureBlockProps> = ({
  preparedBy,
  boardName,
  compact = false,
  approvalStatus = 'none',
  approvedBy,
  rejectedBy,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return dayjs(dateStr).format('DD MMMM YYYY');
  };

  // Render a signature section
  const renderSignatureSection = (
    label: string,
    info: SignatureInfo,
    showSignature: boolean = true,
    isApprover: boolean = false
  ) => (
    <div style={{ minWidth: compact ? 180 : 220 }}>
      <div style={{ 
        fontSize: compact ? 11 : 12, 
        color: '#666', 
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {label}
      </div>
      
      {/* Signature - Image or Cursive fallback */}
      {showSignature && (
        <>
          {info.signatureImageUrl ? (
            // Display drawn signature image
            <div
              style={{
                marginBottom: 4,
                borderBottom: '1px solid #333',
                display: 'inline-block',
                paddingBottom: 4,
                minWidth: compact ? 150 : 180,
              }}
            >
              <img 
                src={info.signatureImageUrl} 
                alt={`${info.name}'s signature`}
                style={{
                  maxWidth: compact ? 150 : 200,
                  maxHeight: compact ? 50 : 60,
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            // Fallback to cursive text signature
            <div
              style={{
                fontFamily: '"Brush Script MT", "Segoe Script", cursive',
                fontSize: compact ? 20 : 24,
                color: '#1a365d',
                marginBottom: 4,
                borderBottom: '1px solid #333',
                display: 'inline-block',
                paddingBottom: 4,
                minWidth: compact ? 150 : 180,
              }}
            >
              {info.name}
            </div>
          )}
        </>
      )}

      {/* Name and Title */}
      <div style={{ marginTop: showSignature ? 8 : 0 }}>
        <div style={{ fontWeight: 600 }}>
          {info.name}
        </div>
        {info.title && (
          <div style={{ fontSize: compact ? 12 : 13, color: '#444' }}>
            {info.title}
          </div>
        )}
        {info.date && (
          <div style={{ fontSize: compact ? 11 : 12, color: '#666', marginTop: 4 }}>
            Date: {formatDate(info.date)}
          </div>
        )}
        {isApprover && info.signatureId && (
          <div style={{ 
            fontSize: compact ? 10 : 11, 
            color: '#52c41a', 
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span style={{ fontSize: 14 }}>✓</span>
            Digitally Signed
          </div>
        )}
      </div>
    </div>
  );

  // Render awaiting approval placeholder
  const renderAwaitingApproval = () => (
    <div style={{ minWidth: compact ? 180 : 220 }}>
      <div style={{ 
        fontSize: compact ? 11 : 12, 
        color: '#666', 
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Approved By
      </div>
      
      <div style={{
        padding: '16px 24px',
        border: '2px dashed #d9d9d9',
        borderRadius: 4,
        textAlign: 'center',
        color: '#999',
      }}>
        <div style={{ fontSize: compact ? 12 : 13, fontStyle: 'italic' }}>
          Awaiting Approval
        </div>
        <div style={{ fontSize: compact ? 10 : 11, marginTop: 4 }}>
          Pending confirmation signature
        </div>
      </div>
    </div>
  );

  // Render rejection info
  const renderRejection = () => {
    if (!rejectedBy) return null;
    
    return (
      <div style={{ minWidth: compact ? 180 : 220 }}>
        <div style={{ 
          fontSize: compact ? 11 : 12, 
          color: '#ff4d4f', 
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 600,
        }}>
          Rejected
        </div>
        
        <div style={{
          padding: '12px 16px',
          border: '1px solid #ffccc7',
          borderRadius: 4,
          background: '#fff2f0',
        }}>
          <div style={{ fontWeight: 600, color: '#cf1322' }}>
            {rejectedBy.name}
          </div>
          <div style={{ 
            fontSize: compact ? 11 : 12, 
            color: '#cf1322',
            marginTop: 4,
          }}>
            Reason: {rejectedBy.reasonLabel}
          </div>
          {rejectedBy.comments && (
            <div style={{ 
              fontSize: compact ? 11 : 12, 
              color: '#595959',
              marginTop: 8,
              fontStyle: 'italic',
            }}>
              "{rejectedBy.comments}"
            </div>
          )}
          <div style={{ 
            fontSize: compact ? 10 : 11, 
            color: '#8c8c8c',
            marginTop: 8,
          }}>
            Date: {formatDate(rejectedBy.date)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="notice-signature-block"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: compact ? 24 : 48,
        marginTop: 32,
        paddingTop: 24,
        borderTop: '1px solid #e8e8e8',
      }}
    >
      {/* Prepared By - Always shown */}
      {renderSignatureSection('Prepared By', preparedBy, true, false)}

      {/* Approval Section - Based on status */}
      {approvalStatus === 'pending' && renderAwaitingApproval()}
      
      {approvalStatus === 'approved' && approvedBy && (
        renderSignatureSection('Approved By', approvedBy, true, true)
      )}
      
      {approvalStatus === 'rejected' && renderRejection()}

      {/* Board Name - shown at bottom if provided */}
      {boardName && approvalStatus === 'none' && (
        <div style={{ 
          width: '100%', 
          marginTop: 16, 
          fontSize: compact ? 11 : 12,
          color: '#666',
        }}>
          {boardName}
        </div>
      )}
    </div>
  );
};

export default NoticeSignatureBlock;
