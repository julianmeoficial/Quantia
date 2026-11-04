/**
 * Non-color foundations not (yet) exported from Figma Semantic / Primitives.
 * Typography and elevation follow DESIGN.md; breakpoints follow DS-93 QA widths.
 */

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

/** Maps DESIGN.md type/* → theme.typography.* (camelCase API). */
export const typography = {
  displayLarge: {
    fontSize: "3rem",
    lineHeight: "3.5rem",
    fontWeight: 500,
    letterSpacing: "-0.02em",
  },
  headingLarge: {
    fontSize: "2rem",
    lineHeight: "2.5rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  headingMedium: {
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 600,
    letterSpacing: "0",
  },
  headingSmall: {
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    fontWeight: 600,
    letterSpacing: "0",
  },
  bodyLarge: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 400,
    letterSpacing: "0",
  },
  bodyMedium: {
    fontSize: "1rem",
    lineHeight: "1.5rem",
    fontWeight: 400,
    letterSpacing: "0",
  },
  bodyStrong: {
    fontSize: "1rem",
    lineHeight: "1.5rem",
    fontWeight: 600,
    letterSpacing: "0",
  },
  bodySmall: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 400,
    letterSpacing: "0",
  },
  label: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    letterSpacing: "0",
  },
  button: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 600,
    letterSpacing: "0",
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 400,
    letterSpacing: "0.01em",
  },
  metric: {
    fontSize: "2rem",
    lineHeight: "2.5rem",
    fontWeight: 600,
    letterSpacing: "0",
  },
} as const satisfies Record<string, TypographyToken>;

/** Elevation: light defaults; dark modes use stronger shadows at consume time if needed. */
export const elevation = {
  none: "none",
  sm: "0 0.125rem 0.5rem rgb(24 32 42 / 0.08)",
  md: "0 0.5rem 1.5rem rgb(24 32 42 / 0.16)",
  lg: "0 0.5rem 1.5rem rgb(0 0 0 / 0.24)",
} as const;

/** DS-93 QA breakpoints: 390 / 768 / 1280 / 1440. */
export const breakpoints = {
  sm: "24.375rem",
  md: "48rem",
  lg: "80rem",
  xl: "90rem",
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function mediaUp(breakpoint: Breakpoint): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

export const media = {
  up: mediaUp,
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
  /** @deprecated Prefer media.up('md') */
  tablet: mediaUp("md"),
  /** @deprecated Prefer media.up('xl') */
  desktop: mediaUp("xl"),
} as const;

export const zIndices = {
  base: 0,
  sticky: 100,
  overlay: 200,
  modal: 300,
  /** Menus/selects portaled above Sheet/Dialog. */
  dropdown: 350,
  toast: 400,
} as const;
