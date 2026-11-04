import { afterEach, describe, expect, it, vi } from "vitest";

describe("isCallFixturesEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("is true only in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { isCallFixturesEnabled } = await import("./isCallFixturesEnabled");
    expect(isCallFixturesEnabled()).toBe(true);
  });

  it("is false in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { isCallFixturesEnabled } = await import("./isCallFixturesEnabled");
    expect(isCallFixturesEnabled()).toBe(false);
  });
});
