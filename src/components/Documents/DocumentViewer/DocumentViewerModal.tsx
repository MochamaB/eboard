/**
 * DocumentViewerModal Component
 * Modal for viewing documents (PDF, images, etc.)
 */

import React, { useState, useRef } from 'react';
import { Modal, Button, Tooltip, Space, Spin, Typography, message as antMessage } from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  ExpandOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined,
  FileOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useBoardContext, useAuth } from '../../../contexts';
import type { Document } from '../../../types/document.types';

const { Text } = Typography;

interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  onDownload?: (document: Document) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  open,
  onClose,
  document,
  onDownload,
}) => {
  const { theme, currentBoard } = useBoardContext();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!document) return null;

  const isPdf = document.fileType === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'].includes(
    document.fileType
  );
  const isOffice = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(
    document.fileType
  );
  const isText = ['txt', 'rtf', 'csv'].includes(document.fileType);
  const isVideo = ['mp4', 'avi', 'mov'].includes(document.fileType);
  const isAudio = ['mp3', 'wav'].includes(document.fileType);
  const isArchive = ['zip', 'rar', '7z'].includes(document.fileType);
  const totalPages = document.pageCount || 1;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleDownload = () => {
    if (onDownload && document) {
      onDownload(document);
    } else {
      // Fallback: open URL in new tab
      window.open(document.url, '_blank');
    }
  };

  const handlePrint = () => {
    if (document.watermarkEnabled) {
      antMessage.warning('Printing is restricted for watermarked documents');
      return;
    }
    window.open(document.url, '_blank');
  };

  const handleOpenInNewTab = () => {
    if (document.watermarkEnabled) {
      antMessage.warning('Opening in new tab is restricted for watermarked documents');
      return;
    }
    window.open(document.url, '_blank');
  };

  const handleFullscreen = async () => {
    if (!contentRef.current) return;
    
    try {
      if (!isFullscreen) {
        await contentRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      antMessage.error('Failed to toggle fullscreen mode');
    }
  };

  // Render watermark overlay with repeating pattern
  const renderWatermark = () => {
    if (!document.watermarkEnabled) return null;

    const userName = user?.fullName || 'Unknown User';
    const boardName = document.boardName || currentBoard?.name || 'Board Document';
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const watermarkColor = document.isConfidential ? '#dc2626' : theme.primaryColor;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 1000,
          overflow: 'hidden',
        }}
      >
        {/* Repeating diagonal watermarks with user name */}
        {Array.from({ length: 24 }).map((_, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;
          // Alternate between user name and board name/confidential
          const isUserName = index % 2 === 0;
          const text = isUserName 
            ? userName.toUpperCase()
            : document.isConfidential 
              ? 'CONFIDENTIAL'
              : boardName.toUpperCase();
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${row * 20}%`,
                left: `${col * 25}%`,
                transform: 'rotate(-45deg)',
                fontSize: isUserName ? '28px' : '24px',
                fontWeight: 'bold',
                color: isUserName 
                  ? `${theme.primaryColor}18` 
                  : document.isConfidential 
                    ? `${watermarkColor}15`
                    : `${watermarkColor}12`,
                textAlign: 'center',
                letterSpacing: '4px',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </div>
          );
        })}
        
        {/* Center prominent watermark with larger user name */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            textAlign: 'center',
          }}
        >
          {document.isConfidential && (
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: `${watermarkColor}40`,
                marginBottom: '16px',
                textShadow: `0 0 20px ${watermarkColor}30`,
                letterSpacing: '8px',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
              }}
            >
              CONFIDENTIAL
            </div>
          )}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: `${theme.primaryColor}35`,
              marginBottom: '12px',
              letterSpacing: '8px',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              textShadow: `0 0 15px ${theme.primaryColor}20`,
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: `${theme.primaryColor}22`,
              marginBottom: '8px',
              letterSpacing: '6px',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            {boardName}
          </div>
          <div
            style={{
              fontSize: '16px',
              color: `${theme.primaryColor}18`,
              letterSpacing: '2px',
              marginTop: '8px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {timestamp}
          </div>
        </div>
      </div>
    );
  };

  // Render content based on file type
  const renderContent = () => {
    if (isPdf) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#525659',
            position: 'relative',
          }}
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Spin size="large" />
            </div>
          )}
          <iframe
            src={`${document.url}#page=${currentPage}&zoom=${zoom}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
            onLoad={() => setLoading(false)}
            title={document.name}
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#525659',
            overflow: 'auto',
          }}
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Spin size="large" />
            </div>
          )}
          <img
            src={document.url}
            alt={document.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom / 100})`,
              transition: 'transform 0.2s',
            }}
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
          }}
        >
          <video
            src={document.url}
            controls
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            onLoadedData={() => setLoading(false)}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.backgroundTertiary,
            gap: 24,
          }}
        >
          <FileOutlined style={{ fontSize: 64, color: theme.textSecondary }} />
          <Text strong style={{ fontSize: 16 }}>{document.name}</Text>
          <audio
            src={document.url}
            controls
            style={{ width: '80%', maxWidth: 500 }}
            onLoadedData={() => setLoading(false)}
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    if (isOffice) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.backgroundTertiary,
            gap: 16,
            padding: 24,
          }}
        >
          <FileOutlined style={{ fontSize: 64, color: theme.textSecondary }} />
          <Text strong style={{ fontSize: 16 }}>{document.name}</Text>
          <Text type="secondary" style={{ textAlign: 'center', maxWidth: 500 }}>
            Office document preview is not available in development mode.
            In production, these files can be viewed using Microsoft Office Online viewer.
          </Text>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
              Download to View
            </Button>
          </Space>
        </div>
      );
    }

    if (isText) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.backgroundTertiary,
            gap: 16,
            padding: 24,
          }}
        >
          <FileOutlined style={{ fontSize: 64, color: theme.textSecondary }} />
          <Text strong style={{ fontSize: 16 }}>{document.name}</Text>
          <Text type="secondary">
            Text file preview is not available. Download to view contents.
          </Text>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Download to View
          </Button>
        </div>
      );
    }

    if (isArchive) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.backgroundTertiary,
            gap: 16,
          }}
        >
          <FileOutlined style={{ fontSize: 64, color: theme.textSecondary }} />
          <Text strong style={{ fontSize: 16 }}>{document.name}</Text>
          <Text type="secondary">
            Archive file - download to extract contents
          </Text>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Download Archive
          </Button>
        </div>
      );
    }

    // Unsupported file type
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.backgroundTertiary,
          gap: 16,
        }}
      >
        <FileOutlined style={{ fontSize: 64, color: theme.textDisabled }} />
        <Text type="secondary">
          Preview not available for this file type
        </Text>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
          Download to View
        </Button>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileOutlined />
          <Text ellipsis style={{ maxWidth: 400 }}>
            {document.name}
          </Text>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ top: 20 }}
      styles={{
        body: {
          padding: 0,
          height: 'calc(90vh - 110px)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: `1px solid ${theme.borderColor}`,
          backgroundColor: theme.backgroundSecondary,
        }}
      >
        {/* Left: Page Navigation (for PDFs) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPdf && totalPages > 1 && (
            <>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
              />
              <Text>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                type="text"
                icon={<RightOutlined />}
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              />
            </>
          )}
        </div>

        {/* Center: Zoom Controls */}
        <Space>
          <Tooltip title="Zoom Out">
            <Button
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            />
          </Tooltip>
          <Text style={{ minWidth: 50, textAlign: 'center' }}>{zoom}%</Text>
          <Tooltip title="Zoom In">
            <Button
              type="text"
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            />
          </Tooltip>
        </Space>

        {/* Right: Actions */}
        <Space>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
          <Tooltip title={document.watermarkEnabled ? 'Print restricted for watermarked documents' : 'Print'}>
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              disabled={document.watermarkEnabled}
            />
          </Tooltip>
          <Tooltip title={document.watermarkEnabled ? 'Opening in new tab is restricted' : 'Open in New Tab'}>
            <Button
              type="text"
              icon={<ExpandOutlined />}
              onClick={handleOpenInNewTab}
              disabled={document.watermarkEnabled}
            />
          </Tooltip>
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={handleFullscreen}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Content Area */}
      <div ref={contentRef} style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
        {renderContent()}
        {renderWatermark()}
      </div>
    </Modal>
  );
};

export default DocumentViewerModal;
