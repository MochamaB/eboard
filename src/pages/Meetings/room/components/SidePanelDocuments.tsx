/**
 * Side Panel - Documents Tab
 * Displays meeting documents with casting controls
 */

import React from 'react';
import { Button, Space, Typography, Divider } from 'antd';
import { 
  FileTextOutlined, 
  DesktopOutlined, 
  StopOutlined,
  DownloadOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const { Text } = Typography;

const SidePanelDocuments: React.FC = () => {
  const { roomState, actions } = useMeetingRoom();
  const { castingDocument } = roomState;
  const permissions = useMeetingRoomPermissions();
  
  // TODO: Get documents from meeting data or API
  // For now, using placeholder data
  const documents = [
    { id: 'doc-1', name: 'Financial Report Q4.pdf', type: 'pdf' },
    { id: 'doc-2', name: 'Budget Analysis.xlsx', type: 'xlsx' },
    { id: 'doc-3', name: 'Meeting Agenda.pdf', type: 'pdf' },
  ];
  
  const currentItemDocs = documents.slice(0, 2); // Placeholder
  const allDocs = documents;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* Current Item Documents */}
        <div>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
            Current Item Documents ({currentItemDocs.length})
          </Text>
          
          {currentItemDocs.length === 0 ? (
            <Text type="secondary">No documents for this item</Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentItemDocs.map((doc) => (
                <div 
                  key={doc.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: castingDocument?.documentId === doc.id 
                      ? '1px solid #1890ff' 
                      : '1px solid #f0f0f0',
                    background: castingDocument?.documentId === doc.id ? '#e6f7ff' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileTextOutlined style={{ fontSize: 24, color: '#666' }} />
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
                      {castingDocument?.documentId === doc.id && (
                        <Text style={{ fontSize: 11, color: '#1890ff' }}>📺 Currently Casting</Text>
                      )}
                    </div>
                  </div>
                  
                  <Space style={{ marginTop: 12, width: '100%' }}>
                    <Button icon={<EyeOutlined />} style={{ flex: 1 }}>
                      View
                    </Button>
                    
                    {permissions.canCastDocument && (
                      castingDocument?.documentId === doc.id ? (
                        <Button 
                          icon={<StopOutlined />}
                          style={{ flex: 1 }}
                          onClick={actions.stopCasting}
                        >
                          Stop
                        </Button>
                      ) : (
                        <Button 
                          icon={<DesktopOutlined />}
                          style={{ flex: 1 }}
                          onClick={() => actions.startCasting(doc.id)}
                          disabled={!!castingDocument}
                        >
                          Cast
                        </Button>
                      )
                    )}
                  </Space>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Divider />
        
        {/* All Meeting Documents */}
        <div>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
            All Meeting Documents ({allDocs.length})
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {allDocs.map((doc) => (
              <div 
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <FileTextOutlined style={{ color: '#666' }} />
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
          
          <Button block icon={<DownloadOutlined />} style={{ marginTop: 12 }}>
            Download All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidePanelDocuments;
