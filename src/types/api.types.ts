/**
 * Common API Types
 * Shared types for API requests and responses
 */

import { z } from 'zod';

// Pagination
export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  sortField: z.string().optional(),
  sortOrder: z.enum(['ascend', 'descend']).optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

// API Error
export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  field: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

// Types
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
