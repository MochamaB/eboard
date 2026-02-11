/**
 * Hooks Index
 * Re-export all hooks
 */

export * from './api';
export { useTabNavigation } from './useTabNavigation';

// Responsive hooks - now using Context pattern for better performance
// Import from contexts for the optimized version
export { useResponsive, useResponsiveContext } from '../contexts/ResponsiveContext';

// Legacy responsive hooks - still available but deprecated
export { useMediaQuery, useDeviceDetection, useResponsiveContainer } from './useResponsive';
