/**
 * Document Categories Hooks
 * React Query hooks for document category management
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as documentCategoriesApi from '../../api/documentCategories.api';
import type {
  DocumentCategory,
  CreateDocumentCategoryPayload,
  UpdateDocumentCategoryPayload,
  DocumentCategoryFilter,
} from '../../api/documentCategories.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const documentCategoryKeys = {
  all: ['documentCategories'] as const,
  lists: () => [...documentCategoryKeys.all, 'list'] as const,
  list: (filter?: DocumentCategoryFilter) => [...documentCategoryKeys.lists(), filter] as const,
  details: () => [...documentCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentCategoryKeys.details(), id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all document categories
 * Cached for 5 minutes since categories don't change frequently
 */
export const useDocumentCategories = (
  filter?: DocumentCategoryFilter,
  options?: Omit<UseQueryOptions<DocumentCategory[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentCategoryKeys.list(filter),
    queryFn: () => documentCategoriesApi.getDocumentCategories(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get active document categories for current board
 * Most common use case for dropdowns
 */
export const useActiveDocumentCategories = (
  boardId?: string,
  options?: Omit<UseQueryOptions<DocumentCategory[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useDocumentCategories(
    {
      boardId,
      isActive: true,
      includeGlobal: true, // Include global categories
    },
    options
  );
};

/**
 * Get a single document category by ID
 */
export const useDocumentCategory = (
  id: string,
  options?: Omit<UseQueryOptions<DocumentCategory, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: documentCategoryKeys.detail(id),
    queryFn: () => documentCategoriesApi.getDocumentCategory(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new document category (admin only)
 */
export const useCreateDocumentCategory = (
  options?: Omit<UseMutationOptions<DocumentCategory, Error, CreateDocumentCategoryPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentCategoriesApi.createDocumentCategory,
    onSuccess: () => {
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: documentCategoryKeys.lists() });
    },
    ...options,
  });
};

/**
 * Update a document category (admin only)
 */
export const useUpdateDocumentCategory = (
  id: string,
  options?: Omit<UseMutationOptions<DocumentCategory, Error, UpdateDocumentCategoryPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => documentCategoriesApi.updateDocumentCategory(id, payload),
    onSuccess: () => {
      // Invalidate lists and detail
      queryClient.invalidateQueries({ queryKey: documentCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentCategoryKeys.detail(id) });
    },
    ...options,
  });
};

/**
 * Delete a document category (admin only, non-system only)
 */
export const useDeleteDocumentCategory = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentCategoriesApi.deleteDocumentCategory,
    onSuccess: (_, id) => {
      // Invalidate lists and remove detail from cache
      queryClient.invalidateQueries({ queryKey: documentCategoryKeys.lists() });
      queryClient.removeQueries({ queryKey: documentCategoryKeys.detail(id) });
    },
    ...options,
  });
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Get category configuration by ID from cached data
 * Useful for getting category details without making a new request
 */
export const useCategoryConfig = (categoryId: string, boardId?: string) => {
  const { data: categories } = useActiveDocumentCategories(boardId);
  return categories?.find(cat => cat.id === categoryId);
};

/**
 * Get category options for Select/Dropdown components
 */
export const useCategoryOptions = (boardId?: string) => {
  const { data: categories, isLoading } = useActiveDocumentCategories(boardId);
  
  const options = categories?.map(cat => ({
    value: cat.id,
    label: cat.name,
    color: cat.color,
    icon: cat.icon,
  })) || [];

  return { options, isLoading };
};
