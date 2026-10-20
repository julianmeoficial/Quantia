"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Usar con `gsap.matchMedia()` para respetar `prefers-reduced-motion`. */
export const MOTION_QUERIES = {
  allowMotion: "(prefers-reduced-motion: no-preference)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
