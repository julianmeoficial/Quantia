"use client";

import { useRef, type DependencyList, type RefObject } from "react";

import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";

import { gsapDurations } from "./tokens";

export type GsapRevealOptions = {
  /** Children to reveal inside the scope. Default: `[data-reveal]`. */
  selector?: string;
  /** Vertical offset in px (transform only). */
  y?: number;
  /** Seconds between items; capped so long lists never delay content. */
  stagger?: number;
  /** Re-run when these change (e.g. data finished loading). */
  dependencies?: DependencyList;
  /** Skip the reveal (e.g. while showing a skeleton). */
  disabled?: boolean;
};

const MAX_TOTAL_STAGGER = 0.24;

/**
 * Short, interruptible entrance for freshly loaded content (opacity + translateY, 200 ms).
 * Runs only with `prefers-reduced-motion: no-preference`; otherwise content is static.
 * `clearProps` hands control back to CSS so hover/focus styles are not overridden.
 */
export function useGsapReveal<T extends HTMLElement>(
  options: GsapRevealOptions = {},
): RefObject<T | null> {
  const scope = useRef<T | null>(null);
  const {
    selector = "[data-reveal]",
    y = 8,
    stagger = 0.035,
    dependencies = [],
    disabled,
  } = options;

  useGSAP(
    () => {
      if (disabled || !scope.current) return;
      const targets = gsap.utils.toArray<HTMLElement>(selector, scope.current);
      if (targets.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.allowMotion, () => {
        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration: gsapDurations.base,
          ease: "power2.out",
          stagger: Math.min(stagger, MAX_TOTAL_STAGGER / targets.length),
          clearProps: "opacity,visibility,transform",
        });
      });
      return () => mm.revert();
    },
    { scope, dependencies: [disabled, selector, ...dependencies] },
  );

  return scope;
}
