/**
 * DocumentPreview Component
 * Inline document viewer for the meeting room when a document is being cast.
 * 
 * Features:
 * - PDF iframe rendering with page navigation
 * - Watermark overlay (reused pattern from DocumentViewerModal)
 * - Confidential indicator
 * - Casting indicator (who is presenting, "Casting to all")
 * - Stop casting button for presenter/host
 * - Zoom controls
 * 
 * Uses castingDocument state from MeetingRoomContext.
 * Security features match DocumentViewerModal implementation.
 */

import React, { useState } from 'react';
import { Button, Space, Typography, Tooltip, Tag } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  StopOutlined,
  DesktopOutlined,
  LockOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { useBoardContext, useAuth } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const { Text } = Typography;

const getFileIcon = (fileType?: string, size = 24) => {
  switch (fileType?.toLowerCase()) {
    case 'pdf': return <FilePdfOutlined style={{ fontSize: size, color: '#ff4d4f' }} />;
    case 'xlsx': case 'xls': return <FileExcelOutlined style={{ fontSize: size, color: '#52c41a' }} />;
    case 'docx': case 'doc': return <FileWordOutlined style={{ fontSize: size, color: '#1890ff' }} />;
    case 'png': case 'jpg': case 'jpeg': return <FileImageOutlined style={{ fontSize: size, color: '#722ed1' }} />;
    default: return <FileTextOutlined style={{ fontSize: size, color: '#666' }} />;
  }
};

const DocumentPreview: React.FC = () => {
  const { roomState, actions, capabilities } = useMeetingRoom();
  const { theme, currentBoard } = useBoardContext();
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const permissions = useMeetingRoomPermissions();
  const { castingDocument } = roomState;

  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  if (!castingDocument) return null;

  const {
    documentName,
    documentUrl,
    fileType,
    currentPage,
    totalPages,
    casterName,
    watermarkEnabled,
    isConfidential,
  } = castingDocument;

  const isPdf = fileType === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileType);
  const canStop = capabilities.canStopCasting && permissions.canCastDocument;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handlePrevPage = () => actions.navigatePage(Math.max(currentPage - 1, 1));
  const handleNextPage = () => actions.navigatePage(Math.min(currentPage + 1, totalPages));

  // Watermark overlay (adapted from DocumentViewerModal)
  const renderWatermark = () => {
    if (!watermarkEnabled) return null;

    const userName = user?.fullName || 'Unknown User';
    const boardName = currentBoard?.name || 'Board Document';
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const watermarkColor = isConfidential ? '#dc2626' : theme.primaryColor;

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
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        {/* Repeating diagonal watermarks */}
        {Array.from({ length: 12 }).map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const isUserName = index % 2 === 0;
          const text = isUserName
            ? userName.toUpperCase()
            : isConfidential
              ? 'CONFIDENTIAL'
              : boardName.toUpperCase();

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${row * 25}%`,
                left: `${col * 33}%`,
                transform: 'rotate(-45deg)',
                fontSize: isUserName ? '22px' : '18px',
                fontWeight: 'bold',
                color: isUserName
                  ? `${theme.primaryColor}18`
                  : isConfidential
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

        {/* Center prominent watermark */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            textAlign: 'center',
          }}
        >
          {isConfidential && (
            <div
              style={{
                fontSize: '40px',
                fontWeight: 'bold',
                color: `${watermarkColor}40`,
                marginBottom: '12px',
                textShadow: `0 0 20px ${watermarkColor}30`,
                letterSpacing: '8px',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              CONFIDENTIAL
            </div>
          )}
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: `${theme.primaryColor}30`,
              letterSpacing: '6px',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: '14px',
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

  // Document content renderer
  const renderContent = () => {
    if (isPdf) {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', zIndex: 5,
              color: '#fff', fontSize: 14,
            }}>
              Loading document...
            </div>
          )}
          <iframe
            src={`${documentUrl}#page=${currentPage}&zoom=${zoom}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            onLoad={() => setLoading(false)}
            title={documentName}
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'auto',
        }}>
          <img
            src={documentUrl}
            alt={documentName}
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

    // Unsupported file type placeholder
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12,
      }}>
        {getFileIcon(fileType, 48)}
        <Text style={{ color: '#999', fontSize: 14 }}>{documentName}</Text>
        <Text style={{ color: '#666', fontSize: 12 }}>
          Document preview — Integration pending
        </Text>
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      borderRadius: isMobile ? 8 : 12,
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1a2e',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '6px 10px' : '8px 16px',
        background: theme.backgroundSecondary,
        borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}`,
        flexWrap: 'wrap',
        gap: 6,
      }}>
        {/* Left: Doc info + casting indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {getFileIcon(fileType, 18)}
          <Text strong ellipsis style={{ maxWidth: isMobile ? 120 : 200, fontSize: 13 }}>
            {documentName}
          </Text>
          {isConfidential && (
            <Tag color="red" icon={<LockOutlined />} style={{ margin: 0, fontSize: 10 }}>
              Confidential
            </Tag>
          )}
          <Tag
            color={theme.primaryColor}
            icon={<DesktopOutlined />}
            style={{ margin: 0, fontSize: 10 }}
          >
            {isMobile ? 'Casting' : `${casterName} — Casting to all`}
          </Tag>
        </div>

        {/* Right: Page nav + zoom + stop */}
        <Space size={isMobile ? 2 : 4} wrap={false}>
          {/* Page navigation */}
          {isPdf && totalPages > 1 && (
            <>
              <Tooltip title="Previous Page">
                <Button
                  type="text"
                  size="small"
                  icon={<LeftOutlined />}
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                />
              </Tooltip>
              <Text style={{ fontSize: 12, minWidth: isMobile ? 40 : 60, textAlign: 'center' }}>
                {currentPage}/{totalPages}
              </Text>
              <Tooltip title="Next Page">
                <Button
                  type="text"
                  size="small"
                  icon={<RightOutlined />}
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                />
              </Tooltip>
            </>
          )}

          {/* Zoom controls */}
          <Tooltip title="Zoom Out">
            <Button type="text" size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={zoom <= 50} />
          </Tooltip>
          <Text style={{ fontSize: 11, minWidth: 30, textAlign: 'center' }}>{zoom}%</Text>
          <Tooltip title="Zoom In">
            <Button type="text" size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={zoom >= 200} />
          </Tooltip>

          {/* Stop casting */}
          {canStop && (
            <Tooltip title="Stop Casting">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={actions.stopCasting}
              >
                {!isMobile && 'Stop'}
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Content area */}
      <div style={{
        flex: 1,
        minHeight: isMobile ? 200 : 300,
        maxHeight: isMobile ? 300 : 450,
        position: 'relative',
        backgroundColor: '#525659',
        overflow: 'hidden',
      }}>
        {renderContent()}
        {renderWatermark()}
      </div>
    </div>
  );
};

export default React.memo(DocumentPreview);
