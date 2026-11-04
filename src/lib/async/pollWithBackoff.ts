export type PollWithBackoffOptions<T> = {
  fetch: () => Promise<T>;
  isDone: (value: T) => boolean;
  onUpdate?: (value: T) => void;
  signal?: AbortSignal;
  /** First wait before the next fetch. Default 2000. */
  initialDelayMs?: number;
  /** Cap for exponential backoff. Default 30_000. */
  maxDelayMs?: number;
  /** Stop polling after this budget. Default 5 minutes. */
  maxDurationMs?: number;
};

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Polls with report-style backoff: 2s → 4s → 8s … capped at 30s, stop ~5 min.
 * Returns the last value when `isDone` is true, or the last fetched value when
 * the time budget expires. Returns `null` if aborted before any successful fetch.
 */
export async function pollWithBackoff<T>(options: PollWithBackoffOptions<T>): Promise<T | null> {
  const {
    fetch: fetchValue,
    isDone,
    onUpdate,
    signal,
    initialDelayMs = 2000,
    maxDelayMs = 30_000,
    maxDurationMs = 5 * 60_000,
  } = options;

  const startedAt = Date.now();
  let delayMs = initialDelayMs;
  let last: T | null = null;

  while (!signal?.aborted) {
    if (Date.now() - startedAt >= maxDurationMs) {
      return last;
    }

    try {
      await delay(delayMs, signal);
    } catch {
      return last;
    }

    if (signal?.aborted) return last;

    try {
      const value = await fetchValue();
      last = value;
      onUpdate?.(value);
      if (isDone(value)) return value;
    } catch {
      // Keep polling on transient errors until budget expires or abort.
    }

    delayMs = Math.min(delayMs * 2, maxDelayMs);
  }

  return last;
}
