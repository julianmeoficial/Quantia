export const space = [
  "0",
  "0.25rem",
  "0.5rem",
  "0.75rem",
  "1rem",
  "1.25rem",
  "1.5rem",
  "2rem",
  "2.5rem",
  "3rem",
  "4rem",
  "5rem",
  "6rem",
] as const;

export const radii = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999rem",
} as const;

export const borderWidths = {
  thin: "0.0625rem",
  thick: "0.125rem",
} as const;

export const fonts = {
  sans: "var(--font-sans), system-ui, sans-serif",
  mono: "var(--font-mono), ui-monospace, monospace",
} as const;

type TypographyToken = {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing: string;
};

export const typography = {
  displayLarge: {
    fontSize: "2.5rem",
    lineHeight: "3rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  headingLarge: {
    fontSize: "2rem",
    lineHeight: "2.5rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  headingMedium: { fontSize: "1.5rem", lineHeight: "2rem", fontWeight: 600, letterSpacing: "0" },
  headingSmall: { fontSize: "1.25rem", lineHeight: "1.75rem", fontWeight: 600, letterSpacing: "0" },
  bodyLarge: { fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: 400, letterSpacing: "0" },
  bodyMedium: { fontSize: "1rem", lineHeight: "1.5rem", fontWeight: 400, letterSpacing: "0" },
  bodySmall: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 400, letterSpacing: "0" },
  label: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 500, letterSpacing: "0" },
  caption: { fontSize: "0.75rem", lineHeight: "1rem", fontWeight: 400, letterSpacing: "0.01em" },
} as const satisfies Record<string, TypographyToken>;

export const elevation = {
  none: "none",
  sm: "0 0.0625rem 0.125rem rgb(16 24 40 / 0.06)",
  md: "0 0.25rem 0.5rem -0.125rem rgb(16 24 40 / 0.1)",
  lg: "0 0.75rem 1.5rem -0.25rem rgb(16 24 40 / 0.14)",
} as const;

export const motion = {
  duration: {
    fast: "150ms",
    base: "200ms",
    slow: "250ms",
  },
  durationSeconds: {
    fast: 0.15,
    base: 0.2,
    slow: 0.25,
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.3, 0, 0, 1)",
  },
} as const;

export const breakpoints = {
  mobile: "24.375rem",
  tablet: "48rem",
  desktop: "90rem",
} as const;

export const media = {
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
} as const;

export const sizes = {
  touchTarget: "2.75rem",
  containerMax: "90rem",
} as const;

export const zIndices = {
  base: 0,
  sticky: 100,
  overlay: 200,
  modal: 300,
  toast: 400,
} as const;
