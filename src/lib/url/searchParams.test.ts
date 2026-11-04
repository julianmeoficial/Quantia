import { describe, expect, it } from "vitest";
import { z } from "zod";

import { fromSearchParams, isFilteredAgainstDefaults, toSearchParams } from "./searchParams";
import {
  DASHBOARD_FILTER_DEFAULTS,
  PROJECT_LIST_FILTER_DEFAULTS,
  dashboardFiltersSchema,
  projectListFiltersSchema,
  reportsFiltersSchema,
} from "@/features/filters";

describe("toSearchParams", () => {
  it("omits values that match defaults", () => {
    const params = toSearchParams(
      { q: "", status: "all", page: 1 },
      { q: "", status: "all", page: 1 },
    );
    expect(params.toString()).toBe("");
  });

  it("keeps only non-default filters", () => {
    const params = toSearchParams(
      { q: "agua", status: "DELAYED", page: 2 },
      { q: "", status: "all", page: 1 },
    );
    expect(params.get("q")).toBe("agua");
    expect(params.get("status")).toBe("DELAYED");
    expect(params.get("page")).toBe("2");
  });
});

describe("fromSearchParams", () => {
  it("parses dashboard filters", () => {
    const params = new URLSearchParams("q=sensores&status=ACTIVE");
    expect(fromSearchParams(params, dashboardFiltersSchema, DASHBOARD_FILTER_DEFAULTS)).toEqual({
      q: "sensores",
      status: "ACTIVE",
    });
  });

  it("falls back to defaults on invalid status", () => {
    const params = new URLSearchParams("status=NOPE&q=x");
    const result = fromSearchParams(params, dashboardFiltersSchema, DASHBOARD_FILTER_DEFAULTS);
    expect(result.status).toBe("all");
    expect(result.q).toBe("x");
  });

  it("parses project list pagination and sort", () => {
    const params = new URLSearchParams("page=3&pageSize=10&sortBy=createdAt&sortOrder=desc");
    expect(
      fromSearchParams(params, projectListFiltersSchema, PROJECT_LIST_FILTER_DEFAULTS),
    ).toEqual({
      q: "",
      status: "all",
      page: 3,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("accepts reports projectId uuid and rejects junk per field", () => {
    const good = fromSearchParams(
      new URLSearchParams("projectId=550e8400-e29b-41d4-a716-446655440000"),
      reportsFiltersSchema,
      { projectId: "" },
    );
    expect(good.projectId).toBe("550e8400-e29b-41d4-a716-446655440000");

    const bad = fromSearchParams(
      new URLSearchParams("projectId=not-a-uuid"),
      reportsFiltersSchema,
      { projectId: "" },
    );
    expect(bad.projectId).toBe("");
  });
});

describe("isFilteredAgainstDefaults", () => {
  it("ignores page by default", () => {
    expect(
      isFilteredAgainstDefaults(
        { q: "", status: "all", page: 4 },
        { q: "", status: "all", page: 1 },
      ),
    ).toBe(false);
  });

  it("detects q/status changes", () => {
    expect(
      isFilteredAgainstDefaults(
        { q: "a", status: "all", page: 1 },
        { q: "", status: "all", page: 1 },
      ),
    ).toBe(true);
  });
});

describe("coerce helpers", () => {
  it("uses zod coerce for pageSize", () => {
    const schema = z.object({ pageSize: z.coerce.number().int().min(1).max(50).default(20) });
    const result = fromSearchParams(new URLSearchParams("pageSize=abc"), schema, { pageSize: 20 });
    expect(result.pageSize).toBe(20);
  });
});
