import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DASHBOARD_FILTER_DEFAULTS,
  REPORTS_FILTER_DEFAULTS,
  dashboardFiltersSchema,
  reportsFiltersSchema,
} from "@/features/filters";

import { useUrlFilters } from "./useUrlFilters";

const replace = vi.fn();
let search = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(search),
}));

describe("useUrlFilters", () => {
  beforeEach(() => {
    replace.mockReset();
    search = "";
  });

  it("reads dashboard filters from the URL", () => {
    search = "q=lab&status=DELAYED";
    const { result } = renderHook(() =>
      useUrlFilters({
        schema: dashboardFiltersSchema,
        defaults: DASHBOARD_FILTER_DEFAULTS,
        pathname: "/dashboard",
      }),
    );
    expect(result.current.values).toEqual({
      q: "lab",
      status: "DELAYED",
      page: 1,
      pageSize: 20,
    });
    expect(result.current.isFiltered).toBe(true);
  });

  it("clears filters to a clean pathname", () => {
    search = "q=lab&status=ACTIVE";
    const { result } = renderHook(() =>
      useUrlFilters({
        schema: dashboardFiltersSchema,
        defaults: DASHBOARD_FILTER_DEFAULTS,
        pathname: "/dashboard",
      }),
    );

    act(() => {
      result.current.clearFilters();
    });

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  it("supports reportsFiltersSchema for a future /reportes share link", () => {
    search = "projectId=550e8400-e29b-41d4-a716-446655440000";
    const { result } = renderHook(() =>
      useUrlFilters({
        schema: reportsFiltersSchema,
        defaults: REPORTS_FILTER_DEFAULTS,
        pathname: "/reportes",
      }),
    );
    expect(result.current.values.projectId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.current.isFiltered).toBe(true);
  });
});
