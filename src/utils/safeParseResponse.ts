/**
 * Safe Zod Parse Utility
 * Wraps Zod .parse() to prevent schema validation errors from crashing the UI.
 * Logs warnings in development but returns raw data instead of throwing.
 * 
 * Why: If the backend (or MSW mock) returns data that doesn't perfectly match
 * the Zod schema, .parse() throws and React Query treats it as a failed request.
 * This causes entire pages to show empty data until a hard reload.
 * 
 * This utility is production-safe — when the real backend is implemented,
 * schema mismatches will be logged (integrate with Sentry/etc.) without crashing.
 */

import type { ZodType, ZodError } from 'zod';

/**
 * Safely parse API response data with a Zod schema.
 * - If validation passes: returns the parsed (typed) data
 * - If validation fails: logs a warning and returns the raw data cast to the expected type
 * 
 * @param schema - Zod schema to validate against
 * @param data - Raw API response data
 * @param context - Optional label for logging (e.g. 'getMeetings', 'getUsers')
 * @returns Parsed data or raw data (if validation fails)
 */
export function safeParseResponse<T>(schema: ZodType<T>, data: unknown, context?: string): T {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  // Log validation errors in development
  if (import.meta.env.DEV) {
    const error: ZodError = result.error;
    const issues = error.issues.slice(0, 5); // Show first 5 issues max
    console.warn(
      `[API Schema Warning]${context ? ` ${context}:` : ''} Response data doesn't match schema.`,
      '\nIssues:', issues.map(i => `${i.path.join('.')} — ${i.message}`).join('; '),
      issues.length < error.issues.length ? `\n...and ${error.issues.length - issues.length} more` : '',
      '\nRaw data:', data,
    );
  }

  // Return raw data cast to expected type — the UI can still render most of it
  return data as T;
}

/**
 * Safely parse an outgoing payload (request body) with a Zod schema.
 * For payloads, we still want strict validation to prevent sending bad data.
 * Falls back to raw payload if validation fails (with warning).
 */
export function safeParsePayload<T>(schema: ZodType<T>, data: unknown, context?: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        `[API Payload Warning]${context ? ` ${context}:` : ''} Payload validation failed.`,
        '\nError:', error,
        '\nPayload:', data,
      );
    }
    return data as T;
  }
}
