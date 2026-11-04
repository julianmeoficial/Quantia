"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { z } from "zod";

import { fromSearchParams, isFilteredAgainstDefaults, toSearchParams } from "./searchParams";

export type UseUrlFiltersOptions<S extends z.ZodType> = {
  schema: S;
  defaults: z.infer<S>;
  pathname: string;
  /** Keys that do not count toward `isFiltered` (default: page). */
  ignoreFilteredKeys?: readonly string[];
};

export type UseUrlFiltersResult<T extends Record<string, unknown>> = {
  values: T;
  setFilters: (patch: Partial<T>) => void;
  clearFilters: () => void;
  isFiltered: boolean;
};

export function useUrlFilters<S extends z.ZodType>({
  schema,
  defaults,
  pathname,
  ignoreFilteredKeys = ["page"],
}: UseUrlFiltersOptions<S>): UseUrlFiltersResult<z.infer<S> & Record<string, unknown>> {
  type Values = z.infer<S> & Record<string, unknown>;
  const router = useRouter();
  const searchParams = useSearchParams();

  const values = useMemo(
    () => fromSearchParams(searchParams, schema, defaults) as Values,
    [defaults, schema, searchParams],
  );

  const replace = useCallback(
    (next: Values) => {
      const params = toSearchParams(next, defaults as Values);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [defaults, pathname, router],
  );

  const setFilters = useCallback(
    (patch: Partial<Values>) => {
      replace({ ...values, ...patch });
    },
    [replace, values],
  );

  const clearFilters = useCallback(() => {
    replace({ ...(defaults as Values) });
  }, [defaults, replace]);

  const isFiltered = useMemo(
    () => isFilteredAgainstDefaults(values, defaults as Values, ignoreFilteredKeys),
    [defaults, ignoreFilteredKeys, values],
  );

  return { values, setFilters, clearFilters, isFiltered };
}
