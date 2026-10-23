"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP);

/** Register ScrollTrigger only in real browsers (jsdom lacks matchMedia by default). */
if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Usar con `gsap.matchMedia()` para respetar `prefers-reduced-motion`. */
export const MOTION_QUERIES = {
  allowMotion: "(prefers-reduced-motion: no-preference)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
