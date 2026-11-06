"use client";

import type { UserResponse } from "@quantia/contracts";
import { useCallback, useEffect, useState } from "react";

import { listUsers } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

type Snapshot = {
  status: "idle" | "loading" | "ready" | "error";
  coordinators: UserResponse[];
  error: ApiError | null;
};

const INITIAL: Snapshot = { status: "idle", coordinators: [], error: null };
const PAGE_SIZE = 50;
const MAX_PAGES = 10;

/** Active people with the Coordinador role. The API only lets administrators list users. */
export function isActiveCoordinator(user: Pick<UserResponse, "roles" | "isActive">): boolean {
  return user.isActive && user.roles.includes("COORDINADOR");
}

/**
 * Loads the current coordinators for the «Responsable del proyecto» picker.
 * `GET /users` has no role filter, so pages are read and filtered here.
 */
export function useCoordinators(enabled: boolean) {
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setSnapshot((prev) => ({ ...prev, status: "loading", error: null }));
      try {
        const found: UserResponse[] = [];
        for (let page = 1; page <= MAX_PAGES; page += 1) {
          const result = await listUsers({ page, pageSize: PAGE_SIZE, sortOrder: "asc" });
          found.push(...result.data.filter(isActiveCoordinator));
          if (page >= result.meta.totalPages) break;
        }
        if (cancelled) return;
        found.sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));
        setSnapshot({ status: "ready", coordinators: found, error: null });
      } catch (cause: unknown) {
        if (cancelled) return;
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setSnapshot((prev) => ({
          status: "error",
          coordinators: prev.coordinators,
          error: apiError,
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, tick]);

  return { ...snapshot, reload };
}
