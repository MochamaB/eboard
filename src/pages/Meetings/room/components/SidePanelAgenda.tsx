/**
 * Side Panel - Agenda Tab
 * Displays meeting agenda with navigation controls
 */

import React from 'react';
import { Button, Space, Typography, Empty } from 'antd';
import { 
  CheckOutlined, 
  CaretRightFilled, 
  ClockCircleOutlined, 
  LeftOutlined, 
  RightOutlined 
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const { Text } = Typography;

const SidePanelAgenda: React.FC = () => {
  const { roomState, actions } = useMeetingRoom();
  const { agendaItems, currentAgendaItemId } = roomState;
  const permissions = useMeetingRoomPermissions();
  
  const currentIndex = agendaItems.findIndex(item => item.id === currentAgendaItemId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < agendaItems.length - 1;
  
  const handlePrevItem = () => {
    if (canGoPrev) {
      actions.navigateToItem(agendaItems[currentIndex - 1].id);
    }
  };
  
  const handleNextItem = () => {
    if (canGoNext) {
      actions.navigateToItem(agendaItems[currentIndex + 1].id);
    }
  };
  
  const getItemStatusIcon = (item: typeof agendaItems[0]) => {
    if (item.id === currentAgendaItemId) {
      return <CaretRightFilled style={{ color: '#1890ff' }} />;
    }
    if (item.status === 'completed') {
      return <CheckOutlined style={{ color: '#52c41a' }} />;
    }
    if (item.status === 'skipped') {
      return <span style={{ color: '#999', fontSize: 12 }}>—</span>;
    }
    return <span style={{ 
      display: 'inline-block', 
      width: 14, 
      height: 14, 
      borderRadius: '50%', 
      border: '2px solid #d9d9d9' 
    }} />;
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Agenda List */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>Agenda</Text>
        
        {agendaItems.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No agenda items" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {agendaItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: item.id === currentAgendaItemId ? '1px solid #1890ff' : '1px solid #f0f0f0',
                  background: item.id === currentAgendaItemId ? '#e6f7ff' : '#fff',
                  cursor: permissions.canNavigateAgenda ? 'pointer' : 'default',
                  opacity: item.status === 'completed' ? 0.6 : 1,
                }}
                onClick={() => permissions.canNavigateAgenda && actions.navigateToItem(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 2 }}>
                    {getItemStatusIcon(item)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.itemNumber}
                      </Text>
                      <Space size={4}>
                        <ClockCircleOutlined style={{ fontSize: 11, color: '#999' }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.estimatedDuration}m
                        </Text>
                      </Space>
                    </div>
                    <Text 
                      strong={item.id === currentAgendaItemId}
                      style={{ 
                        display: 'block',
                        fontSize: 13,
                        color: item.id === currentAgendaItemId ? '#1890ff' : undefined,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </Text>
                    {item.id === currentAgendaItemId && (
                      <Text style={{ fontSize: 11, color: '#1890ff' }}>▶ Current Item</Text>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Navigation Controls */}
      {permissions.canNavigateAgenda && (
        <div style={{ borderTop: '1px solid #f0f0f0', padding: 16 }}>
          <Space style={{ width: '100%', marginBottom: 8 }}>
            <Button 
              icon={<LeftOutlined />}
              disabled={!canGoPrev}
              onClick={handlePrevItem}
              style={{ flex: 1 }}
            >
              Previous
            </Button>
            <Button 
              disabled={!canGoNext}
              onClick={handleNextItem}
              style={{ flex: 1 }}
            >
              Next
              <RightOutlined />
            </Button>
          </Space>
          
          <Space style={{ width: '100%' }}>
            <Button 
              icon={<CheckOutlined />}
              disabled={!currentAgendaItemId}
              onClick={() => currentAgendaItemId && actions.markItemDiscussed(currentAgendaItemId)}
              style={{ flex: 1 }}
            >
              Mark Discussed
            </Button>
            <Button 
              type="text"
              disabled={!currentAgendaItemId}
              onClick={() => currentAgendaItemId && actions.deferItem(currentAgendaItemId)}
            >
              Defer
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default SidePanelAgenda;
