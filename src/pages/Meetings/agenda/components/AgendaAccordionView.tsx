/**
 * Agenda Accordion View
 * Accordion view for agendas with support for view and edit modes
 * Supports nested items with inline editing
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Space, Typography, Empty, Spin, Tag, Button, Select } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  PlusOutlined,
  DeleteOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardContext } from '../../../../contexts';
import { AgendaHeader, ItemNumberBadge, ItemTypeTag, Accordion, type AccordionItem, InlineEditableField } from '../../../../components/common';
import type { Agenda, AgendaItem } from '../../../../types/agenda.types';
import { AgendaItemDocuments } from './AgendaItemDocuments';
import { AgendaItemVotes } from './AgendaItemVotes';
import { generateHierarchicalNumber, hasChildren as checkHasChildren, getChildItems as getChildren, getItemDepth, getDepthStyles } from '../../../../utils/agendaHierarchy';
import { calculateTotalDuration, calculateItemDurationWithChildren, formatDuration as formatDurationUtil } from '../../../../utils/agendaTimeManagement';

const { Text } = Typography;

// Sortable Accordion Item Component for Drag and Drop
interface SortableAccordionItemProps {
  item: AgendaItem;
  agenda: Agenda;
  theme: any;
  activeKeys: string[];
  onAccordionChange: (keys: string[]) => void;
}

const SortableAccordionItem: React.FC<SortableAccordionItemProps> = ({ 
  item, 
  agenda, 
  theme,
  activeKeys,
  onAccordionChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: item.id 
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  const hierarchicalNumber = generateHierarchicalNumber(item, agenda.items);
  const itemDepth = getItemDepth(item, agenda.items);
  const depthStyles = getDepthStyles(itemDepth, theme);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        style={{
          backgroundColor: depthStyles.backgroundColor,
          borderLeft: depthStyles.borderLeft,
          borderRadius: '8px',
          marginBottom: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* Drag Handle */}
        <div {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
          <HolderOutlined style={{ fontSize: '16px', color: '#8c8c8c' }} />
        </div>

        {/* Item Number */}
        <ItemNumberBadge
          number={hierarchicalNumber}
          isParent={!item.parentItemId}
          size="default"
        />

        {/* Item Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: '14px' }}>
            {item.title}
          </Text>
        </div>

        {/* Item Type */}
        <ItemTypeTag type={item.itemType} size="small" showIcon={false} />
      </div>
    </div>
  );
};

interface AgendaAccordionViewProps {
  /** Agenda data */
  agenda?: Agenda;
  /** Loading state */
  loading?: boolean;
  /** Display mode: 'view', 'edit', or 'execute' */
  mode?: 'view' | 'edit' | 'execute';
  /** Meeting scheduled duration in minutes */
  meetingDuration?: number;
  /** Meeting participants for presenter selection */
  participants?: Array<{ userId: number; name: string; roleName: string; avatar?: string }>;
  /** Meeting ID for document operations */
  meetingId?: string;
  /** Board ID for document operations */
  boardId?: string;
  /** Edit handler (shows for draft agendas) */
  onEdit?: () => void;
  /** Publish handler (shows for draft agendas) */
  onPublish?: () => void;
  /** Unpublish handler (shows for published agendas) */
  onUnpublish?: () => void;
  /** Export handler */
  onExport?: (branding: { boardName: string; primaryColor: string; logo?: string }) => void;
  /** Update item handler (edit mode) */
  onUpdateItem?: (itemId: string, updates: Partial<AgendaItem>) => void;
  /** Add sub-item handler (edit mode) */
  onAddSubItem?: (parentId: string) => void;
  /** Delete item handler (edit mode) */
  onDeleteItem?: (itemId: string) => void;
  /** Add item handler (edit mode) */
  onAddItem?: () => void;
  /** Toggle reorder mode handler */
  onToggleReorder?: () => void;
  /** Is reorder mode active */
  reorderMode?: boolean;
  /** Reorder items handler */
  onReorderItems?: (items: Array<{ itemId: string; orderIndex: number }>) => void;
  /** Callback when vote is created */
  onVoteCreated?: (voteId: string) => void;
}

export const AgendaAccordionView: React.FC<AgendaAccordionViewProps> = ({
  agenda,
  loading = false,
  mode = 'view',
  meetingDuration,
  participants = [],
  meetingId,
  boardId,
  onEdit,
  onPublish,
  onUnpublish,
  onExport,
  onUpdateItem,
  onAddSubItem,
  onDeleteItem,
  onAddItem,
  onToggleReorder,
  reorderMode = false,
  onReorderItems,
  onVoteCreated,
}) => {
  const { theme, currentBoard } = useBoardContext();
  
  // Get parent items (items without parentItemId)
  const parentItems = useMemo(() => {
    if (!agenda) return [];
    return agenda.items
      .filter((item) => !item.parentItemId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [agenda]);
  
  // Track expanded items
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  
  // Default first item expanded on load
  useEffect(() => {
    if (parentItems.length > 0 && activeKeys.length === 0) {
      setActiveKeys([parentItems[0].id]);
    }
  }, [parentItems]);

  // Handle accordion change
  const handleAccordionChange = (keys: string[]) => {
    setActiveKeys(keys);
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = parentItems.findIndex(item => item.id === active.id);
    const newIndex = parentItems.findIndex(item => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Reorder items locally
    const reorderedItems = arrayMove(parentItems, oldIndex, newIndex);
    
    // Create update payload with new orderIndex values
    const updates = reorderedItems.map((item, index) => ({
      itemId: item.id,
      orderIndex: index,
    }));
    
    // Call handler to save new order
    if (onReorderItems) {
      onReorderItems(updates);
    }
  };

  // Format duration
  const formatDuration = (minutes?: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  // Check if in edit mode
  const isEditMode = mode === 'edit';

  // Render item header content (without the expand icon - handled by Accordion)
  const renderItemHeaderContent = (item: AgendaItem, isSubItem: boolean = false) => {
    if (!agenda) return null;
    const itemHasChildren = checkHasChildren(item.id, agenda.items);
    const childItems = getChildren(item.id, agenda.items);
    const docCount = item.attachedDocumentIds?.length || 0;
    const hierarchicalNumber = generateHierarchicalNumber(item, agenda.items);
    
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          width: '100%',
        }}
      >
        {/* Item Number */}
        <ItemNumberBadge
          number={hierarchicalNumber}
          isParent={!item.parentItemId}
          size={isSubItem ? 'small' : 'default'}
        />

        {/* Item Title and Metadata */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* LEFT: Title + AD-HOC */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
              <InlineEditableField
                value={item.title}
                isEditing={isEditMode}
                type="text"
                onChange={(value) => onUpdateItem?.(item.id, { title: value as string })}
                style={{
                  fontSize: isSubItem ? '13px' : '14px',
                  fontWeight: 500,
                }}
              />

              {item.isAdHoc && (
                <Tag color="orange" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>
                  AD-HOC
                </Tag>
              )}
            </div>

            {/* RIGHT: Item Type */}
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              {isEditMode ? (
                <Select
                  value={item.itemType}
                  onChange={(value) => onUpdateItem?.(item.id, { itemType: value })}
                  size="small"
                  style={{ minWidth: '140px' }}
                  options={[
                    { label: 'Information', value: 'information' },
                    { label: 'Discussion', value: 'discussion' },
                    { label: 'Decision', value: 'decision' },
                    { label: 'Committee Report', value: 'committee_report' },
                  ]}
                  optionRender={(option) => (
                    <ItemTypeTag type={option.value as any} size="small" showIcon={false} />
                  )}
                >
                  {[
                    { label: 'Information', value: 'information' },
                    { label: 'Discussion', value: 'discussion' },
                    { label: 'Decision', value: 'decision' },
                    { label: 'Committee Report', value: 'committee_report' },
                  ].map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      <ItemTypeTag type={opt.value as any} size="small" showIcon={false} />
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <ItemTypeTag type={item.itemType} size="small" showIcon={false} />
              )}
            </div>
          </div>

          {/* Metadata Row */}
          <Space size="middle" style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
            {/* Duration */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ClockCircleOutlined />
              {(() => {
                const hasChildItems = checkHasChildren(item.id, agenda?.items || []);
                const totalDuration = hasChildItems 
                  ? calculateItemDurationWithChildren(item.id, agenda?.items || [])
                  : item.estimatedDuration;
                
                return (
                  <>
                    <InlineEditableField
                      value={item.estimatedDuration}
                      isEditing={isEditMode}
                      type="number"
                      min={1}
                      max={480}
                      suffix="min"
                      onChange={(value) => onUpdateItem?.(item.id, { estimatedDuration: value as number })}
                      formatter={(val) => formatDuration(val as number) || '-'}
                      size="small"
                    />
                    {hasChildItems && totalDuration !== item.estimatedDuration && (
                      <Text 
                        type="secondary" 
                        style={{ 
                          fontSize: '11px',
                          fontStyle: 'italic',
                        }}
                      >
                        (Total: {formatDurationUtil(totalDuration)})
                      </Text>
                    )}
                  </>
                );
              })()}
            </span>
            
            {/* Presenter */}
            {(item.presenterName || isEditMode) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserOutlined />
                {isEditMode ? (
                  <Select
                    value={item.presenterId || undefined}
                    onChange={(value) => {
                      const presenter = participants.find(p => p.userId === value);
                      onUpdateItem?.(item.id, {
                        presenterId: value || null,
                        presenterName: presenter?.name || null,
                      });
                    }}
                    placeholder="Select presenter"
                    allowClear
                    size="small"
                    style={{ minWidth: '150px' }}
                    showSearch
                    optionFilterProp="children"
                  >
                    {participants.map((participant) => (
                      <Select.Option key={participant.userId} value={participant.userId}>
                        {participant.name} ({participant.roleName})
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Text>{item.presenterName}</Text>
                )}
              </span>
            )}
            
            {/* Documents */}
            {docCount > 0 && (
              <span>
                <PaperClipOutlined style={{ marginRight: '4px' }} />
                {docCount} {docCount === 1 ? 'document' : 'documents'}
              </span>
            )}
            
            {/* Sub-items count */}
            {itemHasChildren && (
              <span style={{ color: theme.primaryColor }}>
                {childItems.length} sub-item{childItems.length !== 1 ? 's' : ''}
              </span>
            )}
          </Space>
        </div>

        {/* Action Buttons (Edit Mode Only) */}
        {isEditMode && (
          <div style={{ marginLeft: '12px', flexShrink: 0, display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onAddSubItem?.(item.id)}
              style={{ fontSize: '12px' }}
            >
              Add Sub-Item
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteItem?.(item.id)}
            />
          </div>
        )}
      </div>
    );
  };

  // Render item body content
  const renderItemBodyContent = (item: AgendaItem) => {
    if (!agenda) return null;
    const itemHasChildren = checkHasChildren(item.id, agenda.items);
    const childItems = getChildren(item.id, agenda.items);
    const docCount = item.attachedDocumentIds?.length || 0;

    // If item has children, show nested accordion
    if (itemHasChildren) {
      // Build nested accordion items with depth-based styling
      const nestedItems: AccordionItem[] = childItems.map((child: AgendaItem) => {
        const childDepth = getItemDepth(child, agenda.items);
        const childDepthStyles = getDepthStyles(childDepth, theme);
        
        return {
          key: child.id,
          header: renderItemHeaderContent(child, true),
          children: renderItemBodyContent(child),
          headerStyle: {
            backgroundColor: childDepthStyles.backgroundColor,
            borderLeft: childDepthStyles.borderLeft,
          },
        };
      });

      return (
        <div style={{ padding: '16px' }}>
          {/* Description for parent item */}
          <div style={{ marginBottom: '16px' }}>
            {isEditMode || item.description ? (
              <>
                <Text style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: theme.textSecondary }}>
                  Description
                </Text>
                <InlineEditableField
                  value={item.description || ''}
                  isEditing={isEditMode}
                  type="textarea"
                  placeholder="Add description..."
                  onChange={(value) => onUpdateItem?.(item.id, { description: value as string })}
                  style={{ fontSize: '13px' }}
                />
              </>
            ) : null}
          </div>
          
          {/* Nested sub-items accordion */}
          <Accordion
            items={nestedItems}
            defaultActiveKeys={childItems.length > 0 ? [childItems[0].id] : []}
            themedHeader={false}
            showLeftBorder={false}
          />
        </div>
      );
    }

    // Regular item content (no children)
    return (
      <div style={{ padding: '16px' }}>
        {/* Description */}
        {(isEditMode || item.description) && (
          <div style={{ marginBottom: '16px' }}>
            <Text style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: theme.textSecondary }}>
              Description
            </Text>
            <InlineEditableField
              value={item.description || ''}
              isEditing={isEditMode}
              type="textarea"
              placeholder="Add description..."
              onChange={(value) => onUpdateItem?.(item.id, { description: value as string })}
              style={{ fontSize: '13px' }}
            />
          </div>
        )}

        {/* Documents */}
        <AgendaItemDocuments
          agendaItemId={item.id}
          mode={mode}
          boardId={boardId || currentBoard?.id || item.meetingId}
          meetingId={meetingId || item.meetingId}
        />

        {/* Votes */}
        <AgendaItemVotes
          agendaItemId={item.id}
          agendaId={agenda.id}
          meetingId={meetingId || item.meetingId}
          boardId={boardId || currentBoard?.id || item.meetingId}
          mode={mode}
          agendaItems={agenda.items}
          onVoteCreated={onVoteCreated}
        />

        {/* No content message */}
        {!item.description && docCount === 0 && (
          <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
            No additional details
          </Text>
        )}
      </div>
    );
  };

  // Build accordion items from parent agenda items with depth-based styling
  const accordionItems: AccordionItem[] = !agenda ? [] : parentItems.map((item) => {
    const itemDepth = getItemDepth(item, agenda.items);
    const depthStyles = getDepthStyles(itemDepth, theme);
    
    return {
      key: item.id,
      header: renderItemHeaderContent(item, false),
      children: renderItemBodyContent(item),
      headerStyle: {
        backgroundColor: depthStyles.backgroundColor,
        borderLeft: depthStyles.borderLeft,
      },
    };
  });

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <Spin />
      </div>
    );
  }

  if (!agenda) {
    return (
      <Empty
        description="No agenda found for this meeting"
        style={{ marginTop: '60px' }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Shared Header Component */}
      <AgendaHeader
        status={agenda.status}
        itemCount={agenda.items.length}
        totalDuration={calculateTotalDuration(agenda.items)}
        meetingDuration={meetingDuration}
        publishedAt={agenda.publishedAt}
        publishedBy={agenda.publishedByName}
        onEdit={agenda.status === 'draft' ? onEdit : undefined}
        onPublish={agenda.status === 'draft' ? onPublish : undefined}
        onUnpublish={agenda.status === 'published' ? onUnpublish : undefined}
        onExport={onExport}
        onAddItem={mode === 'edit' ? onAddItem : undefined}
        onToggleReorder={onToggleReorder}
        reorderMode={reorderMode}
        mode={mode}
        showEditActions={mode === 'edit'}
      />

      {/* Agenda Items - Natural Flow Container */}
      <div>
        {agenda.items.length === 0 ? (
          <Empty
            description="No agenda items yet"
            style={{ marginTop: '60px', padding: '24px' }}
          />
        ) : reorderMode ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={parentItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div style={{ opacity: 0.9 }}>
                {parentItems.map((item) => (
                  <SortableAccordionItem
                    key={item.id}
                    item={item}
                    agenda={agenda}
                    theme={theme}
                    activeKeys={activeKeys}
                    onAccordionChange={handleAccordionChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <Accordion
            items={accordionItems}
            activeKeys={activeKeys}
            onChange={handleAccordionChange}
            themedHeader={true}
            showLeftBorder={true}
          />
        )}
      </div>
    </div>
  );
};
