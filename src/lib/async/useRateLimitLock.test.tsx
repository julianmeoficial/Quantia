import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRateLimitLock } from "./useRateLimitLock";

describe("useRateLimitLock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("locks, counts down, and unlocks", () => {
    const { result } = renderHook(() => useRateLimitLock());

    act(() => {
      result.current.start(3);
    });
    expect(result.current.locked).toBe(true);
    expect(result.current.remaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.locked).toBe(false);
    expect(result.current.justUnlocked).toBe(true);
  });

  it("reset clears the lock", () => {
    const { result } = renderHook(() => useRateLimitLock());
    act(() => {
      result.current.start(10);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.locked).toBe(false);
    expect(result.current.retryAfter).toBeNull();
  });
});
