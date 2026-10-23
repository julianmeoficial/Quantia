import { describe, expect, it } from "vitest";

import { formatCOP } from "./currency";
import { formatDate, toApiDate } from "./date";
import { formatPercent } from "./percent";
import { formatRelativeDue } from "./relative-due";

describe("format", () => {
  it("formats COP without decimals", () => {
    expect(formatCOP("1250000.00")).toMatch(/\$\s?1\.250\.000/);
    expect(formatCOP("")).toBe("—");
  });

  it("formats a Bogota calendar date", () => {
    expect(formatDate("2026-10-15T05:00:00.000Z")).toBe("15/10/2026");
    expect(formatDate("nope")).toBe("—");
  });

  it("builds an API date from DD/MM/AAAA at Bogota midnight", () => {
    expect(toApiDate("15/10/2026")).toBe("2026-10-15T05:00:00.000Z");
    expect(toApiDate("31/02/2026")).toBeNull();
  });

  it("formats a percent with at most one decimal", () => {
    expect(formatPercent(45.64)).toBe("45,6 %");
    expect(formatPercent(Number.NaN)).toBe("—");
  });

  it("formats relative due labels in Bogota days", () => {
    const now = new Date("2026-10-23T17:00:00.000Z");
    expect(formatRelativeDue("2026-10-20T05:00:00.000Z", now)).toBe("Vencida");
    expect(formatRelativeDue("2026-10-23T05:00:00.000Z", now)).toBe("Hoy");
    expect(formatRelativeDue("2026-10-24T05:00:00.000Z", now)).toBe("1 día");
    expect(formatRelativeDue("2026-10-25T05:00:00.000Z", now)).toBe("2 días");
    expect(formatRelativeDue(null, now)).toBe("—");
  });
});
