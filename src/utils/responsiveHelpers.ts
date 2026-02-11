/**
 * Responsive Helper Functions
 * Utility functions for common responsive patterns
 */

import { type BreakpointKey, spacing, typography, components } from '../styles/responsive';

/**
 * Generate responsive CSS class names
 */
export const responsiveClasses = {
  // Container classes
  container: 'container-responsive',
  stack: 'stack-responsive',
  grid: 'grid-responsive',
  
  // Text classes
  'text-h1': 'text-responsive-h1',
  'text-h2': 'text-responsive-h2',
  'text-h3': 'text-responsive-h3',
  'text-h4': 'text-responsive-h4',
  'text-body': 'text-responsive-body',
  'text-small': 'text-responsive-small',
  'text-xs': 'text-responsive-xs',
  
  // Spacing classes
  'padding-responsive': 'padding-responsive',
  'margin-responsive': 'margin-responsive',
  'gap-responsive': 'gap-responsive',
} as const;

/**
 * Get responsive spacing value
 */
export const getResponsiveSpacing = (values: Partial<Record<BreakpointKey, number>>, currentBreakpoint: BreakpointKey): number => {
  const breakpointKeys: BreakpointKey[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointKeys.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointKeys.length; i++) {
    const key = breakpointKeys[i];
    if (values[key] !== undefined) {
      return values[key] as number;
    }
  }
  
  return values.xs || spacing.md; // Fallback
};

/**
 * Get responsive font size
 */
export const getResponsiveFontSize = (variant: keyof typeof typography) => {
  const config = typography[variant];
  
  // Return clamp function for fluid typography
  return `clamp(${config.min}, ${config.preferred}, ${config.max})`;
};

/**
 * Get responsive component configuration
 */
export const getResponsiveComponentConfig = <T extends keyof typeof components>(
  component: T,
  currentBreakpoint: BreakpointKey
) => {
  const config = components[component];
  const result: Record<string, any> = {};
  
  // Extract responsive values for each property
  Object.keys(config).forEach(key => {
    const prop = config[key as keyof typeof config];
    
    if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
      // This is a responsive object
      result[key] = getResponsiveSpacing(prop as any, currentBreakpoint);
    } else {
      // This is a static value
      result[key] = prop;
    }
  });
  
  return result;
};

/**
 * Generate responsive grid columns
 */
export const getResponsiveGridCols = (currentBreakpoint: BreakpointKey) => {
  const gridCols = {
    xs: 24,   // 1 column on mobile
    sm: 24,   // 1 column on small tablet
    md: 12,   // 2 columns on tablet
    lg: 8,    // 3 columns on desktop
    xl: 6,    // 4 columns on large desktop
    xxl: 6,   // 4 columns on extra large
  };
  
  return gridCols[currentBreakpoint];
};

/**
 * Generate responsive gutter sizes
 */
export const getResponsiveGutter = (values: Partial<Record<BreakpointKey, [number, number]>>, currentBreakpoint: BreakpointKey): [number, number] => {
  const breakpointKeys: BreakpointKey[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointKeys.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointKeys.length; i++) {
    const key = breakpointKeys[i];
    if (values[key] !== undefined) {
      return values[key] as [number, number];
    }
  }
  
  return values.xs || [spacing.md, spacing.md]; // Fallback
};

/**
 * Check if value should be hidden at current breakpoint
 */
export const shouldHideAtBreakpoint = (hideBreakpoints: BreakpointKey[], currentBreakpoint: BreakpointKey): boolean => {
  return hideBreakpoints.includes(currentBreakpoint);
};

/**
 * Check if value should be shown at current breakpoint
 */
export const shouldShowAtBreakpoint = (showBreakpoints: BreakpointKey[], currentBreakpoint: BreakpointKey): boolean => {
  return showBreakpoints.includes(currentBreakpoint);
};

/**
 * Generate responsive style object
 */
export const createResponsiveStyle = (
  styles: Record<string, Partial<Record<BreakpointKey, any>>>,
  currentBreakpoint: BreakpointKey
) => {
  const result: Record<string, any> = {};
  
  Object.keys(styles).forEach(property => {
    const values = styles[property];
    result[property] = getResponsiveSpacing(values as any, currentBreakpoint);
  });
  
  return result;
};

/**
 * Responsive image utilities
 */
export const responsiveImage = {
  // Get appropriate image size for current breakpoint
  getImageSize: (currentBreakpoint: BreakpointKey) => {
    const sizes = {
      xs: 400,   // Small mobile
      sm: 600,   // Large mobile
      md: 800,   // Tablet
      lg: 1200,  // Desktop
      xl: 1600,  // Large desktop
      xxl: 2000, // Extra large
    };
    
    return sizes[currentBreakpoint];
  },
  
  // Generate srcset for responsive images
  generateSrcSet: (baseUrl: string, extension: string = 'jpg') => {
    const sizes = [400, 600, 800, 1200, 1600, 2000];
    return sizes
      .map(size => `${baseUrl}-${size}w.${extension} ${size}w`)
      .join(', ');
  },
  
  // Generate sizes attribute for responsive images
  generateSizes: () => {
    return '(max-width: 576px) 400px, (max-width: 768px) 600px, (max-width: 992px) 800px, (max-width: 1200px) 1200px, 1600px';
  },
};

/**
 * Responsive animation utilities
 */
export const responsiveAnimation = {
  // Get animation duration based on device type
  getDuration: (currentBreakpoint: BreakpointKey) => {
    const durations = {
      xs: '0.15s',  // Faster on mobile
      sm: '0.2s',
      md: '0.2s',
      lg: '0.3s',   // Slower on desktop
      xl: '0.3s',
      xxl: '0.3s',
    };
    
    return durations[currentBreakpoint];
  },
  
  // Check if reduced motion is preferred
  shouldReduceMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

/**
 * Responsive touch utilities
 */
export const responsiveTouch = {
  // Get minimum touch target size
  getTouchTargetSize: (currentBreakpoint: BreakpointKey) => {
    const sizes = {
      xs: 44,   // 44px minimum for mobile
      sm: 44,
      md: 40,
      lg: 36,
      xl: 36,
      xxl: 36,
    };
    
    return sizes[currentBreakpoint];
  },
  
  // Check if device has touch capability
  isTouchDevice: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
};

/**
 * Responsive layout utilities
 */
export const responsiveLayout = {
  // Get sidebar width
  getSidebarWidth: (collapsed: boolean, currentBreakpoint: BreakpointKey) => {
    if (currentBreakpoint === 'xs' || currentBreakpoint === 'sm') {
      return collapsed ? 0 : 250; // Drawer on mobile
    }
    
    return collapsed ? 80 : 250; // Sider on desktop
  },
  
  // Get header height
  getHeaderHeight: (currentBreakpoint: BreakpointKey) => {
    const heights = {
      xs: 56,   // Smaller on mobile
      sm: 56,
      md: 64,
      lg: 64,
      xl: 64,
      xxl: 64,
    };
    
    return heights[currentBreakpoint];
  },
  
  // Get content margin
  getContentMargin: (sidebarWidth: number, currentBreakpoint: BreakpointKey) => {
    // Drawer mode (overlay) on mobile and tablet - no margin needed
    if (currentBreakpoint === 'xs' || currentBreakpoint === 'sm' || currentBreakpoint === 'md') {
      return 0;
    }

    // Sider mode on desktop (lg and above) - account for sidebar width
    return sidebarWidth;
  },
};

/**
 * Responsive form utilities
 */
export const responsiveForm = {
  // Get form layout columns
  getFormColumns: (currentBreakpoint: BreakpointKey) => {
    const columns = {
      xs: 1,   // Single column on mobile
      sm: 1,
      md: 2,   // Two columns on tablet
      lg: 2,
      xl: 3,   // Three columns on desktop
      xxl: 3,
    };
    
    return columns[currentBreakpoint];
  },
  
  // Get form field spacing
  getFieldSpacing: (currentBreakpoint: BreakpointKey) => {
    const spacing = {
      xs: 12,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 20,
      xxl: 24,
    };
    
    return spacing[currentBreakpoint];
  },
};

export default {
  responsiveClasses,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveComponentConfig,
  getResponsiveGridCols,
  getResponsiveGutter,
  shouldHideAtBreakpoint,
  shouldShowAtBreakpoint,
  createResponsiveStyle,
  responsiveImage,
  responsiveAnimation,
  responsiveTouch,
  responsiveLayout,
  responsiveForm,
};
