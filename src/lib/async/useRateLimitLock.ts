"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RateLimitLock = {
  /** True while the countdown has remaining seconds. */
  locked: boolean;
  remaining: number;
  /** Seconds passed to the last `start` call (for announcements). */
  retryAfter: number | null;
  /** True after a lock reaches zero once (for “ya puedes” copy). */
  justUnlocked: boolean;
  start: (seconds: number) => void;
  reset: () => void;
};

function normalizeSeconds(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value) || value <= 0) return 0;
  return Math.trunc(value);
}

/**
 * Shared Retry-After countdown for 429 UI. Does not invent a duration when unused.
 */
export function useRateLimitLock(initialSeconds?: number | null): RateLimitLock {
  const initial = normalizeSeconds(initialSeconds);
  const [remaining, setRemaining] = useState(initial);
  const [retryAfter, setRetryAfter] = useState<number | null>(initial > 0 ? initial : null);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [generation, setGeneration] = useState(initial > 0 ? 1 : 0);
  const remainingRef = useRef(initial);

  const start = useCallback((seconds: number) => {
    const safe = normalizeSeconds(seconds);
    remainingRef.current = safe;
    setRemaining(safe);
    setRetryAfter(safe > 0 ? safe : null);
    setJustUnlocked(false);
    setGeneration((value) => value + 1);
  }, []);

  const reset = useCallback(() => {
    remainingRef.current = 0;
    setRemaining(0);
    setRetryAfter(null);
    setJustUnlocked(false);
    setGeneration(0);
  }, []);

  useEffect(() => {
    if (generation === 0) return;
    if (remainingRef.current <= 0) return;
    const id = window.setInterval(() => {
      const next = remainingRef.current <= 1 ? 0 : remainingRef.current - 1;
      remainingRef.current = next;
      setRemaining(next);
      if (next === 0) {
        setJustUnlocked(true);
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [generation]);

  return {
    locked: remaining > 0,
    remaining,
    retryAfter,
    justUnlocked,
    start,
    reset,
  };
}
