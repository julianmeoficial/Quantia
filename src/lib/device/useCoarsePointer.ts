"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * True when the primary input is a finger (phones, tablets). False for mouse and trackpad,
 * including Macs. Used to choose touch gestures (swipe, tap-to-reveal) or pointer ones
 * (hover toolbars, Enter-to-send). Server and first paint assume a fine pointer.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
