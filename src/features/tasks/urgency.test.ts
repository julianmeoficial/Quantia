import { describe, expect, it } from "vitest";

import { daysUntilEndOfWeek, urgencyBucket } from "./urgency";

describe("urgency", () => {
  // Friday 23 Oct 2026 12:00 Bogotá → week ends Sunday 25 → offset 2
  const friday = new Date("2026-10-23T17:00:00.000Z");

  it("computes days until Sunday for a Friday", () => {
    expect(daysUntilEndOfWeek(friday)).toBe(2);
  });

  it("buckets overdue, this week and upcoming", () => {
    expect(urgencyBucket("2026-10-20T05:00:00.000Z", friday)).toBe("overdue");
    expect(urgencyBucket("2026-10-23T05:00:00.000Z", friday)).toBe("thisWeek");
    expect(urgencyBucket("2026-10-25T05:00:00.000Z", friday)).toBe("thisWeek");
    expect(urgencyBucket("2026-10-26T05:00:00.000Z", friday)).toBe("upcoming");
    expect(urgencyBucket(null, friday)).toBe("upcoming");
  });
});
