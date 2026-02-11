/**
 * Side Panel - Agenda Tab
 * Displays meeting agenda with navigation controls
 */

import React from 'react';
import { Button, Space, Typography, Empty, Tooltip } from 'antd';
import { 
  CheckOutlined, 
  CaretRightFilled, 
  ClockCircleOutlined, 
  LeftOutlined, 
  RightOutlined 
} from '@ant-design/icons';
import { useBoardContext } from '../../../../contexts';
import { useResponsive } from '../../../../contexts/ResponsiveContext';
import { useMeetingRoom } from '../../../../contexts/MeetingRoomContext';
import { useMeetingRoomPermissions } from '../../../../hooks/meetings';

const { Text } = Typography;

const SidePanelAgenda: React.FC = () => {
  const { roomState, actions, capabilities } = useMeetingRoom();
  const { theme } = useBoardContext();
  const { isMobile } = useResponsive();
  const { agendaItems, currentAgendaItemId } = roomState;
  const permissions = useMeetingRoomPermissions();

  const canNavigate = capabilities.canNavigateAgenda && permissions.canNavigateAgenda;
  const canMark = capabilities.canMarkItemDiscussed && permissions.canMarkItemDiscussed;
  const canDefer = capabilities.canDeferItem && permissions.canDeferItem;
  
  const currentIndex = agendaItems.findIndex(item => item.id === currentAgendaItemId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < agendaItems.length - 1;
  
  const itemPadding = isMobile ? 8 : 12;
  
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
      return <CaretRightFilled style={{ color: theme.primaryColor }} />;
    }
    if (item.status === 'completed') {
      return <CheckOutlined style={{ color: theme.successColor }} />;
    }
    if (item.status === 'skipped') {
      return <span style={{ color: theme.textTertiary, fontSize: 12 }}>—</span>;
    }
    return <span style={{ 
      display: 'inline-block', 
      width: 14, 
      height: 14, 
      borderRadius: '50%', 
      border: `2px solid ${theme.borderColor}` 
    }} />;
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Agenda List */}
      <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? 12 : 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>Agenda</Text>
        
        {agendaItems.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No agenda items" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
            {agendaItems.map((item) => {
              const isCurrent = item.id === currentAgendaItemId;
              return (
                <div
                  key={item.id}
                  style={{
                    padding: itemPadding,
                    borderRadius: 8,
                    border: isCurrent ? `1px solid ${theme.primaryColor}` : `1px solid ${theme.borderColorLight}`,
                    background: isCurrent ? theme.primaryLight : theme.backgroundSecondary,
                    cursor: canNavigate ? 'pointer' : 'default',
                    opacity: item.status === 'completed' ? 0.6 : 1,
                  }}
                  onClick={() => canNavigate && actions.navigateToItem(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 8 : 12 }}>
                    <div style={{ marginTop: 2 }}>
                      {getItemStatusIcon(item)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.itemNumber}
                        </Text>
                        <Space size={4}>
                          <ClockCircleOutlined style={{ fontSize: 11, color: theme.textTertiary }} />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {item.estimatedDuration}m
                          </Text>
                        </Space>
                      </div>
                      <Text 
                        strong={isCurrent}
                        style={{ 
                          display: 'block',
                          fontSize: 13,
                          color: isCurrent ? theme.primaryColor : undefined,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </Text>
                      {isCurrent && (
                        <Text style={{ fontSize: 11, color: theme.primaryColor }}>▶ Current Item</Text>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Navigation Controls */}
      {canNavigate && (
        <div style={{ borderTop: `1px solid ${theme.borderColor}`, padding: isMobile ? 12 : 16 }}>
          <Space style={{ width: '100%', marginBottom: 8 }}>
            {isMobile ? (
              <>
                <Tooltip title="Previous">
                  <Button icon={<LeftOutlined />} disabled={!canGoPrev} onClick={handlePrevItem} style={{ flex: 1 }} />
                </Tooltip>
                <Tooltip title="Next">
                  <Button icon={<RightOutlined />} disabled={!canGoNext} onClick={handleNextItem} style={{ flex: 1 }} />
                </Tooltip>
              </>
            ) : (
              <>
                <Button icon={<LeftOutlined />} disabled={!canGoPrev} onClick={handlePrevItem} style={{ flex: 1 }}>
                  Previous
                </Button>
                <Button disabled={!canGoNext} onClick={handleNextItem} style={{ flex: 1 }}>
                  Next <RightOutlined />
                </Button>
              </>
            )}
          </Space>
          
          <Space style={{ width: '100%' }}>
            <Button 
              icon={<CheckOutlined />}
              disabled={!currentAgendaItemId || !canMark}
              onClick={() => currentAgendaItemId && actions.markItemDiscussed(currentAgendaItemId)}
              style={{ flex: 1 }}
            >
              {isMobile ? 'Done' : 'Mark Discussed'}
            </Button>
            <Button 
              type="text"
              disabled={!currentAgendaItemId || !canDefer}
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

export default React.memo(SidePanelAgenda);
