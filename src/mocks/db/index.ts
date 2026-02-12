/**
 * Mock Database - Main export
 * 
 * This provides a database-like structure for mock data.
 * Tables contain flat data (like SQL rows).
 * Queries provide relationship helpers (like SQL JOINs).
 * 
 * NOTE: Tables and queries have overlapping export names.
 * Import tables from './tables' and queries from './queries' directly
 * when you need both. This file re-exports only tables for convenience.
 */

// Tables (raw data) — primary export
export * from './tables';
