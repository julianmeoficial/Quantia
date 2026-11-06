"use client";

/**
 * Haptic feedback for the web, as far as browsers allow it:
 * - Android Chrome/Edge/Firefox: `navigator.vibrate` (short, distinct patterns per intent).
 * - iOS/iPadOS Safari 18+: toggling a native `<input type="checkbox" switch>` produces the
 *   system "selection" tick. It only fires inside a user gesture (tap/click handler).
 * - Mac trackpads (Force Touch): there is no web API; the browser never exposes the Taptic
 *   Engine, so desktop feedback stays visual (Motion/GSAP), never simulated.
 *
 * Every call is a no-op on the server, in tests and when the person asked for reduced motion
 * (vibration is motion too).
 */
export type HapticKind = "selection" | "light" | "success" | "warning";

const PATTERN: Record<HapticKind, number | number[]> = {
  selection: 6,
  light: 10,
  success: [10, 40, 14],
  warning: [18, 60, 18],
};

let iosSwitch: HTMLLabelElement | null = null;

function iosLabel(): HTMLLabelElement | null {
  if (iosSwitch?.isConnected) return iosSwitch;
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.id = "quantia-haptic-switch";
  input.tabIndex = -1;
  input.setAttribute("aria-hidden", "true");
  const label = document.createElement("label");
  label.htmlFor = input.id;
  label.setAttribute("aria-hidden", "true");
  label.style.cssText =
    "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;left:-1px;top:-1px;";
  label.appendChild(input);
  document.body.appendChild(label);
  iosSwitch = label;
  return label;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function haptic(kind: HapticKind = "selection"): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (prefersReducedMotion()) return;
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(PATTERN[kind]);
    return;
  }
  // iOS Safari has no vibrate(); the native switch gives a system tick (one per call).
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  if (!coarse) return;
  try {
    // Keep the caret where it was (e.g. the chat composer): the switch must never steal focus.
    const focused = document.activeElement as HTMLElement | null;
    iosLabel()?.click();
    if (focused && document.activeElement !== focused) focused.focus({ preventScroll: true });
  } catch {
    // Feedback is a nicety: never let it break the action that triggered it.
  }
}
