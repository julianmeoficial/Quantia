import type { Transition } from "motion/react";

import { motion as motionTokens } from "@/theme";

/** DESIGN.md ease/standard = cubic-bezier(0.2, 0, 0, 1) as a Motion/GSAP-friendly tuple. */
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;
export const EASE_EMPHASIZED = [0.3, 0, 0, 1] as const;

const { fast, base, slow } = motionTokens.durationSeconds;

/** Motion transitions mapped 1:1 to the 150 / 200 / 250 ms tokens. */
export const transitions = {
  fast: { duration: fast, ease: EASE_STANDARD },
  base: { duration: base, ease: EASE_STANDARD },
  slow: { duration: slow, ease: EASE_EMPHASIZED },
  /**
   * Layout (FLIP) moves: critically damped spring (damping ratio ≈ 1.04) → settles in
   * ~250 ms with no overshoot or bounce, as DESIGN.md §12 requires.
   */
  layout: { type: "spring", stiffness: 420, damping: 42, mass: 0.9 },
} satisfies Record<string, Transition>;

/** Duration tokens for GSAP (seconds). */
export const gsapDurations = { fast, base, slow } as const;
