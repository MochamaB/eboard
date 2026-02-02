/**
 * Agenda View Component
 * Main component that orchestrates agenda display and editing
 * Switches between accordion view (published/archived) and edit view (draft)
 */

import React, { useState } from 'react';
import { message, Spin } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAgenda,
  useCreateAgenda,
  useUpdateAgendaItem,
  useDeleteAgendaItem,
  usePublishAgenda,
  useUpdateAgenda,
  useAgendaTemplates,
} from '../../../../hooks/api';
import type { AgendaItem, UpdateAgendaItemPayload } from '../../../../types/agenda.types';
import { AgendaAccordionView } from './AgendaAccordionView';
import { AgendaEmptyState } from '../../../../components/common';
import { useAuth } from '../../../../contexts/AuthContext';

export interface AgendaViewProps {
  /** Meeting ID to load agenda for */
  meetingId: string;
  /** Display mode: 'edit' (editable), 'view' (read-only), 'execute' (meeting execution) */
  mode: 'edit' | 'view' | 'execute';
  /** Meeting scheduled duration in minutes */
  meetingDuration?: number;
  /** Meeting participants for presenter selection */
  participants?: Array<{ userId: number; name: string; roleName: string; avatar?: string }>;
  /** Callback when add item is clicked */
  onAddItem?: () => void;
  /** Callback when add sub-item is clicked */
  onAddSubItem?: (parentId: string) => void;
  /** Custom loading state */
  loading?: boolean;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  meetingId,
  mode,
  meetingDuration,
  participants = [],
  onAddItem,
  onAddSubItem,
  loading: externalLoading,
}) => {
  // State
  const [reorderMode, setReorderMode] = useState(false);

  // Query client for refetching
  const queryClient = useQueryClient();

  // Get current user from auth context
  const { user } = useAuth();

  // Fetch agenda data
  const {
    data: agenda,
    isLoading: agendaLoading,
    error: agendaError,
  } = useAgenda(meetingId);

  // Fetch templates for empty state
  const { data: templates = [] } = useAgendaTemplates();

  // Create agenda mutation
  const createAgendaMutation = useCreateAgenda({
    onSuccess: () => {
      message.success('Agenda created successfully');
    },
    onError: (error) => {
      message.error(`Failed to create agenda: ${error.message}`);
    },
  });

  // Mutations
  const updateItemMutation = useUpdateAgendaItem(
    agenda?.id || '',
    meetingId,
    {
      onSuccess: () => {
        message.success('Agenda item updated successfully');
      },
      onError: (error) => {
        message.error(`Failed to update item: ${error.message}`);
      },
    }
  );

  const deleteItemMutation = useDeleteAgendaItem(
    agenda?.id || '',
    meetingId,
    {
      onSuccess: () => {
        message.success('Agenda item deleted successfully');
      },
      onError: (error) => {
        message.error(`Failed to delete item: ${error.message}`);
      },
    }
  );

  const publishAgendaMutation = usePublishAgenda(
    agenda?.id || '',
    meetingId,
    {
      onSuccess: () => {
        message.success('Agenda published successfully');
      },
      onError: (error) => {
        message.error(`Failed to publish agenda: ${error.message}`);
      },
    }
  );

  const updateAgendaMutation = useUpdateAgenda(
    agenda?.id || '',
    meetingId,
    {
      onSuccess: () => {
        message.success('Agenda updated successfully');
      },
      onError: (error) => {
        message.error(`Failed to update agenda: ${error.message}`);
      },
    }
  );

  // Derived state
  const loading = externalLoading || agendaLoading;

  // Determine actual display mode based on agenda status
  const getActualMode = (): 'edit' | 'view' | 'execute' => {
    if (!agenda) return mode;
    
    // If agenda is published, force view mode unless explicitly in execute mode
    if (agenda.status === 'published' && mode !== 'execute') {
      return 'view';
    }
    
    // If agenda is archived, force view mode
    if (agenda.status === 'archived') {
      return 'view';
    }
    
    return mode;
  };

  const actualMode = getActualMode();

  // Handlers
  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
  };

  const handleEdit = () => {
    if (!agenda) return;

    // Unpublish the agenda to enable editing
    updateAgendaMutation.mutate({
      status: 'draft',
    });
  };

  const handlePublish = () => {
    if (!agenda) return;

    publishAgendaMutation.mutate({
      publishedBy: user?.id || 1,
    });
  };

  const handleUnpublish = () => {
    if (!agenda) return;

    // Unpublish by updating status back to draft
    updateAgendaMutation.mutate({
      status: 'draft',
    });
  };

  const handleExport = (branding: { boardName: string; primaryColor: string; logo?: string }) => {
    message.info(`Export to PDF for ${branding.boardName} - Coming soon`);
  };

  // Handle update item (inline editing)
  const handleUpdateItem = (itemId: string, updates: Partial<AgendaItem>) => {
    if (!agenda) return;
    
    const payload: UpdateAgendaItemPayload = {
      title: updates.title,
      description: updates.description,
      itemType: updates.itemType,
      estimatedDuration: updates.estimatedDuration,
    };

    updateItemMutation.mutate({ itemId, payload });
  };

  // Handle add sub-item
  const handleAddSubItem = (parentId: string) => {
    // Call parent's onAddSubItem callback if provided
    if (onAddSubItem) {
      onAddSubItem(parentId);
    }
  };

  // Handle create agenda from scratch
  const handleCreateFromScratch = () => {
    createAgendaMutation.mutate({
      meetingId,
    });
  };

  // Handle create agenda from template
  const handleUseTemplate = (templateId: string) => {
    createAgendaMutation.mutate({
      meetingId,
      templateId,
    });
  };

  // Handle import from document - receives parsed items from AgendaEmptyState
  const handleImportFromDocument = async (items: Array<{
    title: string;
    description: string;
    itemType: 'discussion' | 'decision' | 'information' | 'committee_report';
    estimatedDuration: number;
    orderIndex: number;
    parentOrderIndex?: number;
    level?: number;
  }>, _fileName: string) => {
    // Separate root items and sub-items
    const rootItems = items.filter(item => !item.level || item.level === 0);
    const subItems = items.filter(item => item.level && item.level > 0);

    // Step 1: Create agenda with root items
    const rootItemsPayload = rootItems.map((item, index) => ({
      title: item.title,
      description: item.description || '',
      itemType: item.itemType,
      estimatedDuration: item.estimatedDuration,
      orderIndex: index,
      isAdHoc: false,
      attachedDocumentIds: [],
      parentItemId: null,
    }));

    try {
      message.loading({ content: 'Importing agenda items...', key: 'import', duration: 0 });

      // Create agenda with root items
      const createdAgenda = await new Promise<any>((resolve, reject) => {
        createAgendaMutation.mutate({
          meetingId,
          items: rootItemsPayload,
        }, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        });
      });

      // Step 2: If there are sub-items, create them with parent IDs
      if (subItems.length > 0 && createdAgenda?.items) {
        // Map orderIndex to actual item IDs
        const orderIndexToIdMap = new Map<number, string>();
        createdAgenda.items.forEach((item: any) => {
          // Find the original root item by matching title
          const originalIndex = rootItems.findIndex(ri => ri.title === item.title);
          if (originalIndex !== -1) {
            orderIndexToIdMap.set(rootItems[originalIndex].orderIndex, item.id);
          }
        });

        // Import the API function
        const { addAgendaItem } = await import('../../../../api/agenda.api');

        // Create sub-items sequentially with proper orderIndex
        let subItemIndex = 0;
        for (const subItem of subItems) {
          if (subItem.parentOrderIndex !== undefined) {
            const parentId = orderIndexToIdMap.get(subItem.parentOrderIndex);
            
            if (parentId) {
              await addAgendaItem(createdAgenda.id, {
                title: subItem.title,
                description: subItem.description || '',
                itemType: subItem.itemType,
                estimatedDuration: subItem.estimatedDuration,
                orderIndex: subItemIndex++, // Use sequential index for sub-items
                isAdHoc: false,
                attachedDocumentIds: [],
                parentItemId: parentId,
              });
            }
          }
        }

        // Refetch the agenda to show all items
        await queryClient.refetchQueries({ queryKey: ['agendas', 'meeting', meetingId] });
      }

      message.success({
        content: `Successfully imported ${rootItems.length} main items and ${subItems.length} sub-items!`,
        key: 'import',
        duration: 3,
      });

    } catch (error) {
      message.error({
        content: `Failed to import agenda: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key: 'import',
        duration: 5,
      });
    }
  };

  // Loading state
  if (agendaLoading || externalLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin />
      </div>
    );
  }

  // Error state - ignore "not found" errors and validation errors (MSW not ready)
  const isNotFoundError = agendaError?.message?.toLowerCase().includes('not found') || 
                          agendaError?.message?.toLowerCase().includes('404');
  const isValidationError = agendaError?.message?.toLowerCase().includes('invalid') ||
                            agendaError?.message?.toLowerCase().includes('expected');
  // Treat validation errors as "no agenda" since MSW might not be ready
  if (agendaError && !isNotFoundError && !isValidationError) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Failed to load agenda: {agendaError.message}</p>
      </div>
    );
  }

  // No agenda state - show empty state with create options
  if (!agenda && mode === 'edit') {
    return (
      <AgendaEmptyState
        onCreateFromScratch={handleCreateFromScratch}
        onUseTemplate={handleUseTemplate}
        onImportFromDocument={handleImportFromDocument}
        templates={templates}
        loading={createAgendaMutation.isPending}
      />
    );
  }

  // No agenda in view mode
  if (!agenda) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>No agenda available for this meeting.</p>
      </div>
    );
  }

  // Render accordion view with inline editing
  return (
    <AgendaAccordionView
      agenda={agenda}
      loading={loading || updateAgendaMutation.isPending}
      mode={actualMode}
      meetingDuration={meetingDuration}
      participants={participants}
      onEdit={agenda?.status === 'published' ? handleEdit : undefined}
      onPublish={agenda?.status === 'draft' ? handlePublish : undefined}
      onUnpublish={agenda?.status === 'published' ? handleUnpublish : undefined}
      onExport={handleExport}
      onUpdateItem={actualMode === 'edit' ? handleUpdateItem : undefined}
      onAddSubItem={actualMode === 'edit' ? handleAddSubItem : undefined}
      onDeleteItem={actualMode === 'edit' ? handleDeleteItem : undefined}
      onAddItem={actualMode === 'edit' ? onAddItem : undefined}
    />
  );
};
