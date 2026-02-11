/**
 * Side Panel - Documents Tab
 * Displays meeting documents with casting controls
 */

import React, { useMemo } from 'react';
import { Button, Space, Typography, Divider, Spin, Empty, Tooltip } from 'antd';
import { 
  FileTextOutlined, 
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  DesktopOutlined, 
  StopOutlined,
  DownloadOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';
import { useMeetingDocuments } from '../../../../hooks/api/useDocuments';

const { Text } = Typography;

const getFileIcon = (fileExtension?: string, size = 24) => {
  switch (fileExtension?.toLowerCase()) {
    case 'pdf': return <FilePdfOutlined style={{ fontSize: size, color: '#ff4d4f' }} />;
    case 'xlsx': case 'xls': return <FileExcelOutlined style={{ fontSize: size, color: '#52c41a' }} />;
    case 'docx': case 'doc': return <FileWordOutlined style={{ fontSize: size, color: '#1890ff' }} />;
    case 'png': case 'jpg': case 'jpeg': return <FileImageOutlined style={{ fontSize: size, color: '#722ed1' }} />;
    default: return <FileTextOutlined style={{ fontSize: size, color: '#666' }} />;
  }
};

const SidePanelDocuments: React.FC = () => {
  const { roomState, actions, capabilities } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const { castingDocument, meetingId, currentAgendaItem } = roomState;
  const permissions = useMeetingRoomPermissions();

  const canCast = capabilities.canCastDocument && permissions.canCastDocument;
  const canStop = capabilities.canStopCasting && permissions.canCastDocument;
  
  const iconSize = isMobile ? 20 : 24;
  const panelPadding = isMobile ? 12 : 16;
  
  // Fetch meeting documents dynamically via existing hook
  const { data: meetingDocs, isLoading } = useMeetingDocuments(meetingId);
  
  // All meeting documents mapped to a simple shape for rendering
  const allDocs = useMemo(() => {
    if (!meetingDocs) return [];
    return meetingDocs.map(att => ({
      id: att.document.id,
      name: att.document.name,
      fileExtension: att.document.fileExtension,
      url: att.document.url,
    }));
  }, [meetingDocs]);
  
  // Current agenda item documents: filter by attachedDocumentIds on the current item
  const currentItemDocs = useMemo(() => {
    if (!currentAgendaItem?.attachedDocumentIds || currentAgendaItem.attachedDocumentIds.length === 0) {
      return [];
    }
    return allDocs.filter(doc => currentAgendaItem.attachedDocumentIds.includes(doc.id));
  }, [allDocs, currentAgendaItem]);
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: panelPadding }}>
        {/* Current Item Documents */}
        <div>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
            Current Item Documents ({currentItemDocs.length})
          </Text>
          
          {currentItemDocs.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents for this item" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentItemDocs.map((doc) => {
                const isCasting = castingDocument?.documentId === doc.id;
                return (
                  <div 
                    key={doc.id}
                    style={{
                      padding: isMobile ? 8 : 12,
                      borderRadius: 8,
                      border: isCasting
                        ? `1px solid ${theme.primaryColor}` 
                        : `1px solid ${theme.borderColorLight}`,
                      background: isCasting ? theme.primaryLight : theme.backgroundSecondary,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
                      {getFileIcon(doc.fileExtension, iconSize)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text 
                          strong 
                          style={{ 
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {doc.name}
                        </Text>
                        {isCasting && (
                          <Text style={{ fontSize: 11, color: theme.primaryColor }}>📺 Currently Casting</Text>
                        )}
                      </div>
                    </div>
                    
                    <Space style={{ marginTop: isMobile ? 8 : 12, width: '100%' }}>
                      {isMobile ? (
                        <>
                          <Tooltip title="View"><Button icon={<EyeOutlined />} style={{ flex: 1 }} /></Tooltip>
                          {canCast || canStop ? (
                            isCasting ? (
                              <Tooltip title="Stop Casting"><Button icon={<StopOutlined />} style={{ flex: 1 }} onClick={actions.stopCasting} disabled={!canStop} /></Tooltip>
                            ) : (
                              <Tooltip title="Cast"><Button icon={<DesktopOutlined />} style={{ flex: 1 }} onClick={() => actions.startCasting(doc.id)} disabled={!!castingDocument || !canCast} /></Tooltip>
                            )
                          ) : null}
                        </>
                      ) : (
                        <>
                          <Button icon={<EyeOutlined />} style={{ flex: 1 }}>View</Button>
                          {canCast || canStop ? (
                            isCasting ? (
                              <Button icon={<StopOutlined />} style={{ flex: 1 }} onClick={actions.stopCasting} disabled={!canStop}>Stop</Button>
                            ) : (
                              <Button icon={<DesktopOutlined />} style={{ flex: 1 }} onClick={() => actions.startCasting(doc.id)} disabled={!!castingDocument || !canCast}>Cast</Button>
                            )
                          ) : null}
                        </>
                      )}
                    </Space>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <Divider style={{ borderColor: theme.borderColorLight }} />
        
        {/* All Meeting Documents */}
        <div>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
            All Meeting Documents ({allDocs.length})
          </Text>
          
          {allDocs.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents attached" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {allDocs.map((doc) => (
                <div 
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 8 : 12,
                    padding: isMobile ? 6 : 8,
                    borderRadius: 8,
                  }}
                >
                  {getFileIcon(doc.fileExtension, iconSize)}
                  <Text 
                    style={{ 
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {doc.name}
                  </Text>
                  <Button type="text" size="small" icon={<DownloadOutlined />} />
                </div>
              ))}
            </div>
          )}
          
          {allDocs.length > 0 && (
            <Button block icon={<DownloadOutlined />} style={{ marginTop: 12 }}>
              Download All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SidePanelDocuments);
