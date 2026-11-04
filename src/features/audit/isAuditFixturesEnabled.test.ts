import { afterEach, describe, expect, it, vi } from "vitest";

describe("isAuditFixturesEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("is true only in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { isAuditFixturesEnabled } = await import("./isAuditFixturesEnabled");
    expect(isAuditFixturesEnabled()).toBe(true);
  });

  it("is false in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { isAuditFixturesEnabled } = await import("./isAuditFixturesEnabled");
    expect(isAuditFixturesEnabled()).toBe(false);
  });
});
