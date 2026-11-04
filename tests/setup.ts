import { cleanup } from "@testing-library/react";
import { createElement, type ComponentType, type ReactNode } from "react";
import { afterEach, vi } from "vitest";

import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";

type DynamicModule =
  ComponentType<Record<string, unknown>> | { default?: ComponentType<Record<string, unknown>> };

/** next/dynamic → resolve eagerly in unit tests (Recharts plot stays lazy in the app). */
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<DynamicModule>, options?: { loading?: () => ReactNode }) => {
    let Resolved: ComponentType<Record<string, unknown>> | null = null;
    void loader().then((mod) => {
      Resolved = typeof mod === "function" ? mod : (mod.default ?? null);
    });
    function DynamicProxy(props: Record<string, unknown>) {
      if (!Resolved) {
        return (options?.loading?.() as ReactNode) ?? null;
      }
      return createElement(Resolved, props);
    }
    return DynamicProxy;
  },
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    // Prefer reduced motion in tests so GSAP exits complete synchronously.
    matches: query.includes("prefers-reduced-motion: reduce"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
});

/** Radix Select uses Pointer Capture APIs not implemented in jsdom. */
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
