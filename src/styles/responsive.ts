/**
 * Responsive Design Configuration
 * Central configuration for all responsive behavior in the eBoard application
 */

// Standardized breakpoint system
export const breakpoints = {
  xs: 0,      // Phone portrait (320px+)
  sm: 576,    // Phone landscape (576px+)
  md: 768,    // Tablet portrait (768px+)
  lg: 992,    // Desktop/Tablet landscape (992px+)
  xl: 1200,   // Large desktop (1200px+)
  xxl: 1600,  // Extra large desktop (1600px+)
} as const;

export type BreakpointKey = keyof typeof breakpoints;

// Breakpoint ranges for device detection
export const breakpointRanges = {
  mobile: [breakpoints.xs, breakpoints.md - 1],      // 0 - 767px
  tablet: [breakpoints.md, breakpoints.lg - 1],       // 768 - 991px
  desktop: [breakpoints.lg, breakpoints.xl - 1],      // 992 - 1199px
  largeDesktop: [breakpoints.xl, breakpoints.xxl - 1], // 1200 - 1599px
  extraLarge: [breakpoints.xxl, Infinity],            // 1600px+
} as const;

// Responsive spacing scale
export const spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 16,   // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  xxl: 48,  // 3rem
  xxxl: 64, // 4rem
} as const;

// Responsive container padding
export const containerPadding = {
  mobile: spacing.md,
  tablet: spacing.lg,
  desktop: spacing.xl,
  largeDesktop: spacing.xl,
  extraLarge: spacing.xxl,
} as const;

// Responsive typography scale
// Headings: h1–h4 (bold/semibold, used for titles and section headers)
// Text:     textLg, text, textSm (body copy at different sizes)
// Meta:     caption, sectionLabel (labels, badges, uppercase headers)
export const typography = {
  // ── Headings ──
  h1: {
    min: '1.5rem',    // 24px
    preferred: '4vw',
    max: '2.5rem',    // 40px
    lineHeight: 1.2,
    weight: 700,
  },
  h2: {
    min: '1.25rem',   // 20px
    preferred: '3.5vw',
    max: '2rem',      // 32px
    lineHeight: 1.3,
    weight: 600,
  },
  h3: {
    min: '1.125rem',  // 18px
    preferred: '3vw',
    max: '1.5rem',    // 24px
    lineHeight: 1.4,
    weight: 600,
  },
  h4: {
    min: '1rem',      // 16px
    preferred: '2.5vw',
    max: '1.25rem',   // 20px
    lineHeight: 1.4,
    weight: 500,
  },

  // ── Text (body copy) ──
  textLg: {
    min: '0.9375rem', // 15px
    preferred: '2.2vw',
    max: '1.0625rem', // 17px
    lineHeight: 1.5,
    weight: 400,
  },
  text: {
    min: '0.8125rem', // 13px
    preferred: '2vw',
    max: '1rem',      // 16px
    lineHeight: 1.5,
    weight: 400,
  },
  textSm: {
    min: '0.75rem',   // 12px
    preferred: '1.5vw',
    max: '0.875rem',  // 14px
    lineHeight: 1.4,
    weight: 400,
  },

  // ── Meta (captions, labels, badges) ──
  caption: {
    min: '0.6875rem', // 11px
    preferred: '1.3vw',
    max: '0.8125rem', // 13px
    lineHeight: 1.4,
    weight: 400,
  },
  sectionLabel: {
    min: '0.625rem',  // 10px
    preferred: '1.2vw',
    max: '0.75rem',   // 12px
    lineHeight: 1.4,
    weight: 600,
  },

  // ── Aliases (backward compatibility) ──
  body: {
    min: '0.8125rem', // 13px
    preferred: '2vw',
    max: '1rem',      // 16px
    lineHeight: 1.5,
    weight: 400,
  },
  small: {
    min: '0.75rem',   // 12px
    preferred: '1.5vw',
    max: '0.875rem',  // 14px
    lineHeight: 1.4,
    weight: 400,
  },
  xs: {
    min: '0.625rem',  // 10px
    preferred: '1.2vw',
    max: '0.75rem',   // 12px
    lineHeight: 1.4,
    weight: 400,
  },
} as const;

// Responsive grid systems
export const gridColumns = {
  xs: 24,   // 1 column on mobile
  sm: 24,   // 1 column on small tablet
  md: 12,   // 2 columns on tablet
  lg: 8,    // 3 columns on desktop
  xl: 6,    // 4 columns on large desktop
  xxl: 6,   // 4 columns on extra large
} as const;

// Component-specific responsive configurations
export const components = {
  // Card configurations
  card: {
    padding: {
      mobile: spacing.md,
      tablet: spacing.lg,
      desktop: spacing.xl,
    },
    borderRadius: {
      mobile: 8,
      desktop: 12,
    },
    shadow: {
      mobile: '0 2px 4px rgba(0,0,0,0.1)',
      desktop: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  
  // Button configurations
  button: {
    height: {
      small: { mobile: 28, desktop: 32 },
      medium: { mobile: 32, desktop: 36 },
      large: { mobile: 40, desktop: 48 },
    },
    padding: {
      mobile: '8px 16px',
      desktop: '12px 24px',
    },
  },
  
  // Form configurations
  form: {
    labelSize: {
      mobile: 13,
      desktop: 14,
    },
    inputHeight: {
      mobile: 32,
      desktop: 36,
    },
    gap: {
      mobile: spacing.sm,
      desktop: spacing.md,
    },
  },
  
  // Table configurations
  table: {
    padding: {
      mobile: spacing.sm,
      desktop: spacing.md,
    },
    fontSize: {
      mobile: 12,
      desktop: 14,
    },
  },
  
  // Chart configurations
  chart: {
    height: {
      mobile: 250,
      tablet: 300,
      desktop: 400,
    },
    margin: {
      mobile: 16,
      desktop: 24,
    },
  },
} as const;

// Media query helpers
export const mediaQueries = {
  // Min-width queries
  up: (breakpoint: BreakpointKey) => `@media (min-width: ${breakpoints[breakpoint]}px)`,
  
  // Max-width queries  
  down: (breakpoint: BreakpointKey) => {
    const maxWidth = breakpoint === 'xs' ? breakpoints.sm - 1 : breakpoints[breakpoint] - 1;
    return `@media (max-width: ${maxWidth}px)`;
  },
  
  // Between queries
  between: (minBreakpoint: BreakpointKey, maxBreakpoint: BreakpointKey) => 
    `@media (min-width: ${breakpoints[minBreakpoint]}px) and (max-width: ${breakpoints[maxBreakpoint] - 1}px)`,
  
  // Device-specific queries
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg}px)`,
} as const;

// Utility functions for responsive values
export const getResponsiveValue = <T>(
  values: Partial<Record<BreakpointKey, T>>,
  currentBreakpoint: BreakpointKey
): T => {
  // Find the largest breakpoint <= current that has a value
  const breakpointKeys: BreakpointKey[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointKeys.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointKeys.length; i++) {
    const key = breakpointKeys[i];
    if (values[key] !== undefined) {
      return values[key] as T;
    }
  }
  
  // Fallback to xs if no value found
  return values.xs as T;
};

// Generate clamp function for fluid values
export const clamp = (min: string, preferred: string, max: string) => 
  `clamp(${min}, ${preferred}, ${max})`;

// Generate responsive typography CSS
export const getTypographyCSS = (variant: keyof typeof typography) => {
  const config = typography[variant];
  return {
    fontSize: clamp(config.min, config.preferred, config.max),
    lineHeight: config.lineHeight,
    fontWeight: config.weight,
  };
};

export default {
  breakpoints,
  breakpointRanges,
  spacing,
  containerPadding,
  typography,
  gridColumns,
  components,
  mediaQueries,
  getResponsiveValue,
  clamp,
  getTypographyCSS,
};
