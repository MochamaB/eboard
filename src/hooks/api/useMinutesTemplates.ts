/**
 * Minutes Templates React Query Hooks
 * Custom hooks for minutes templates management using React Query
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as minutesTemplatesApi from '../../api/minutesTemplates.api';
import type {
  MinutesTemplate,
  CreateMinutesTemplatePayload,
  UpdateMinutesTemplatePayload,
  MinutesTemplateFilters,
} from '../../types/minutes.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const minutesTemplatesKeys = {
  all: ['minutes-templates'] as const,
  list: (filters?: MinutesTemplateFilters) => [...minutesTemplatesKeys.all, 'list', filters] as const,
  byId: (templateId: string) => [...minutesTemplatesKeys.all, 'id', templateId] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all minutes templates with optional filters
 */
export const useMinutesTemplates = (
  filters?: MinutesTemplateFilters,
  options?: Omit<UseQueryOptions<MinutesTemplate[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesTemplatesKeys.list(filters),
    queryFn: () => minutesTemplatesApi.getAllMinutesTemplates(filters),
    ...options,
  });
};

/**
 * Get minutes template by ID
 */
export const useMinutesTemplate = (
  templateId: string,
  options?: Omit<UseQueryOptions<MinutesTemplate>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: minutesTemplatesKeys.byId(templateId),
    queryFn: () => minutesTemplatesApi.getMinutesTemplateById(templateId),
    enabled: !!templateId && templateId.length > 0,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create minutes template
 */
export const useCreateMinutesTemplate = (
  options?: UseMutationOptions<MinutesTemplate, Error, CreateMinutesTemplatePayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: CreateMinutesTemplatePayload) => minutesTemplatesApi.createMinutesTemplate(payload),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: minutesTemplatesKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Update minutes template
 */
export const useUpdateMinutesTemplate = (
  templateId: string,
  options?: UseMutationOptions<MinutesTemplate, Error, UpdateMinutesTemplatePayload>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (payload: UpdateMinutesTemplatePayload) => 
      minutesTemplatesApi.updateMinutesTemplate(templateId, payload),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: minutesTemplatesKeys.all });
      await queryClient.invalidateQueries({ queryKey: minutesTemplatesKeys.byId(templateId) });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};

/**
 * Delete minutes template
 */
export const useDeleteMinutesTemplate = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  const userOnSuccess = options?.onSuccess;

  return useMutation({
    ...options,
    mutationFn: (templateId: string) => minutesTemplatesApi.deleteMinutesTemplate(templateId),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: minutesTemplatesKeys.all });
      
      if (userOnSuccess) {
        return userOnSuccess(...args);
      }
    },
  });
};
