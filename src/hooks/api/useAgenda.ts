/**
 * Agenda React Query Hooks
 * Custom hooks for agenda management using React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as agendaApi from '../../api/agenda.api';
import type {
  Agenda,
  AgendaTemplate,
  CreateAgendaPayload,
  UpdateAgendaPayload,
  CreateAgendaItemPayload,
  UpdateAgendaItemPayload,
  ReorderAgendaItemsPayload,
  PublishAgendaPayload,
  CreateAgendaTemplatePayload,
  UpdateAgendaTemplatePayload,
} from '../../types/agenda.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const agendaKeys = {
  all: ['agendas'] as const,
  byMeeting: (meetingId: string) => [...agendaKeys.all, 'meeting', meetingId] as const,
  templates: () => [...agendaKeys.all, 'templates'] as const,
  template: (templateId: string) => [...agendaKeys.templates(), templateId] as const,
  templatesByType: (boardType?: string) => [...agendaKeys.templates(), boardType] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get agenda for a meeting
 */
export const useAgenda = (
  meetingId: string,
  options?: Omit<UseQueryOptions<Agenda>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: agendaKeys.byMeeting(meetingId),
    queryFn: () => agendaApi.getAgendaByMeetingId(meetingId),
    enabled: !!meetingId && meetingId.length > 0,
    retry: false, // Don't retry on 404s
    staleTime: 0, // Always refetch when invalidated
    ...options,
  });
};

/**
 * Get all agenda templates
 */
export const useAgendaTemplates = (
  boardType?: string,
  options?: Omit<UseQueryOptions<AgendaTemplate[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: agendaKeys.templatesByType(boardType),
    queryFn: () => agendaApi.getAgendaTemplates(boardType),
    ...options,
  });
};

/**
 * Get single agenda template
 */
export const useAgendaTemplate = (
  templateId: string,
  options?: Omit<UseQueryOptions<AgendaTemplate>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: agendaKeys.template(templateId),
    queryFn: () => agendaApi.getAgendaTemplate(templateId),
    enabled: !!templateId,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create agenda
 */
export const useCreateAgenda = (
  options?: UseMutationOptions<Agenda, Error, CreateAgendaPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: CreateAgendaPayload) => agendaApi.createAgenda(payload),
    onSuccess: async (...args) => {
      const [_data, variables] = args;
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(variables.meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update agenda
 */
export const useUpdateAgenda = (
  agendaId: string,
  meetingId: string,
  options?: UseMutationOptions<Agenda, Error, UpdateAgendaPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: UpdateAgendaPayload) => agendaApi.updateAgenda(agendaId, payload),
    onSuccess: async (...args) => {
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Publish agenda
 */
export const usePublishAgenda = (
  agendaId: string,
  meetingId: string,
  options?: UseMutationOptions<Agenda, Error, PublishAgendaPayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: PublishAgendaPayload) => agendaApi.publishAgenda(agendaId, payload),
    onSuccess: async (...args) => {
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Delete agenda
 */
export const useDeleteAgenda = (
  meetingId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (agendaId: string) => agendaApi.deleteAgenda(agendaId),
    onSuccess: async (...args) => {
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

// ============================================================================
// AGENDA ITEM MUTATION HOOKS
// ============================================================================

/**
 * Add agenda item
 */
export const useAddAgendaItem = (
  agendaId: string,
  meetingId: string,
  options?: Omit<UseMutationOptions<Agenda, Error, CreateAgendaItemPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  const userOnSuccess = options?.onSuccess;
  
  return useMutation({
    ...options,
    mutationFn: (payload: CreateAgendaItemPayload) => agendaApi.addAgendaItem(agendaId, payload),
    onSuccess: async (...args) => {
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update agenda item
 */
export const useUpdateAgendaItem = (
  agendaId: string,
  meetingId: string,
  options?: Omit<UseMutationOptions<Agenda, Error, { itemId: string; payload: UpdateAgendaItemPayload }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  const userOnSuccess = options?.onSuccess;
  
  return useMutation({
    ...options,
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateAgendaItemPayload }) =>
      agendaApi.updateAgendaItem(agendaId, itemId, payload),
    onSuccess: async (...args) => {
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Delete agenda item
 */
export const useDeleteAgendaItem = (
  agendaId: string,
  meetingId: string,
  options?: Omit<UseMutationOptions<Agenda, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  const userOnSuccess = options?.onSuccess;
  
  return useMutation({
    ...options,
    mutationFn: (itemId: string) => agendaApi.deleteAgendaItem(agendaId, itemId),
    onSuccess: async (...args) => {
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Reorder agenda items
 */
export const useReorderAgendaItems = (
  agendaId: string,
  meetingId: string,
  options?: Omit<UseMutationOptions<Agenda, Error, ReorderAgendaItemsPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  const userOnSuccess = options?.onSuccess;
  
  return useMutation({
    ...options,
    mutationFn: (payload: ReorderAgendaItemsPayload) =>
      agendaApi.reorderAgendaItems(agendaId, payload),
    onSuccess: async (...args) => {
      // Refetch agenda query to update UI immediately
      await queryClient.refetchQueries({ queryKey: agendaKeys.byMeeting(meetingId) });
      
      // Call user's onSuccess callback after refetch
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

// ============================================================================
// AGENDA TEMPLATE MUTATION HOOKS
// ============================================================================

/**
 * Create agenda template
 */
export const useCreateAgendaTemplate = (
  options?: UseMutationOptions<AgendaTemplate, Error, CreateAgendaTemplatePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAgendaTemplatePayload) => agendaApi.createAgendaTemplate(payload),
    onSuccess: () => {
      // Invalidate templates query
      queryClient.invalidateQueries({ queryKey: agendaKeys.templates() });
    },
    ...options,
  });
};

/**
 * Update agenda template
 */
export const useUpdateAgendaTemplate = (
  templateId: string,
  options?: UseMutationOptions<AgendaTemplate, Error, UpdateAgendaTemplatePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAgendaTemplatePayload) =>
      agendaApi.updateAgendaTemplate(templateId, payload),
    onSuccess: () => {
      // Invalidate template queries
      queryClient.invalidateQueries({ queryKey: agendaKeys.template(templateId) });
      queryClient.invalidateQueries({ queryKey: agendaKeys.templates() });
    },
    ...options,
  });
};

/**
 * Delete agenda template
 */
export const useDeleteAgendaTemplate = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => agendaApi.deleteAgendaTemplate(templateId),
    onSuccess: () => {
      // Invalidate templates query
      queryClient.invalidateQueries({ queryKey: agendaKeys.templates() });
    },
    ...options,
  });
};
