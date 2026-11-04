import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { pollWithBackoff } from "./pollWithBackoff";

describe("pollWithBackoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls until isDone and returns the terminal value", async () => {
    let n = 0;
    const updates: number[] = [];

    const promise = pollWithBackoff({
      fetch: async () => {
        n += 1;
        return n;
      },
      isDone: (value) => value >= 3,
      onUpdate: (value) => {
        updates.push(value);
      },
      initialDelayMs: 1000,
      maxDelayMs: 1000,
      maxDurationMs: 60_000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBe(3);
    expect(updates).toEqual([1, 2, 3]);
  });

  it("stops when aborted and returns the last value", async () => {
    const controller = new AbortController();
    let n = 0;

    const promise = pollWithBackoff({
      fetch: async () => {
        n += 1;
        return n;
      },
      isDone: () => false,
      signal: controller.signal,
      initialDelayMs: 1000,
      maxDelayMs: 1000,
      maxDurationMs: 60_000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    controller.abort();
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBe(1);
  });
});
