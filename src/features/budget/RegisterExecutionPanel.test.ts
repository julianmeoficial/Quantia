import { describe, expect, it } from "vitest";

import { normalizeAmount } from "./RegisterExecutionPanel";

describe("normalizeAmount", () => {
  it("accepts plain, thousand-separated and decimal-comma amounts", () => {
    expect(normalizeAmount("1500000")).toBe("1500000");
    expect(normalizeAmount("1.500.000")).toBe("1500000");
    expect(normalizeAmount("1.500.000,50")).toBe("1500000.50");
    expect(normalizeAmount("1500000,5")).toBe("1500000.5");
    expect(normalizeAmount("1500000.25")).toBe("1500000.25");
  });

  it("rejects empty, negative or malformed values", () => {
    expect(normalizeAmount("")).toBeNull();
    expect(normalizeAmount("-5")).toBeNull();
    expect(normalizeAmount("abc")).toBeNull();
    expect(normalizeAmount("1,2,3")).toBeNull();
  });
});
