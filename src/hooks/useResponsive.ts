/**
 * Responsive Utility Hooks
 *
 * NOTE: The main `useResponsive()` hook has been moved to ResponsiveContext
 * for better performance (single observer instead of multiple).
 *
 * Import from '@/hooks' or '@/contexts' - both work due to re-exports.
 *
 * This file now only contains utility hooks for specific use cases.
 */

import { useState, useEffect } from 'react';
import { useResponsive as useResponsiveContext } from '../contexts/ResponsiveContext';

/**
 * Hook for responsive media query matching
 * Returns boolean indicating if media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
};

/**
 * Hook for device-specific behavior
 * Convenience hook for common device detection
 */
export const useDeviceDetection = () => {
  const responsive = useResponsiveContext();

  return {
    isTouchDevice: useMediaQuery('(pointer: coarse)'),
    isHoverDevice: useMediaQuery('(hover: hover)'),
    isHighDensity: useMediaQuery('(-webkit-min-device-pixel-ratio: 2)'),
    isReducedMotion: useMediaQuery('(prefers-reduced-motion: reduce)'),
    isDarkMode: useMediaQuery('(prefers-color-scheme: dark)'),
    ...responsive,
  };
};

/**
 * Hook for responsive container sizing
 * Returns appropriate container max-width and padding
 */
export const useResponsiveContainer = () => {
  const { isMobile, isTablet } = useResponsiveContext();

  return {
    maxWidth: isMobile ? '100%' : isTablet ? '100%' : '1200px',
    padding: isMobile ? 16 : isTablet ? 24 : 32,
    margin: '0 auto',
  };
};
