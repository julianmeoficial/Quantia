"use client";

import type { UserResponse } from "@quantia/contracts";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { listUsers } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import type { UsersListFilters } from "@/features/filters";

type Snapshot = {
  status: "idle" | "loading" | "ready" | "error";
  users: UserResponse[];
  total: number;
  error: ApiError | null;
  stale: boolean;
};

const INITIAL: Snapshot = {
  status: "idle",
  users: [],
  total: 0,
  error: null,
  stale: false,
};

export function useUsersList(query: UsersListFilters) {
  const { status: authStatus } = useAuth();
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSnapshot((prev) =>
        prev.users.length > 0
          ? { ...prev, status: "loading", error: null, stale: false }
          : { ...INITIAL, status: "loading" },
      );

      try {
        const result = await listUsers({
          page: query.page,
          pageSize: query.pageSize,
          sortOrder: query.sortOrder,
        });
        if (cancelled) return;
        setSnapshot({
          status: "ready",
          users: result.data,
          total: result.meta.total,
          error: null,
          stale: false,
        });
      } catch (cause: unknown) {
        if (cancelled) return;
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setSnapshot((prev) =>
          prev.users.length > 0
            ? {
                status: "ready",
                users: prev.users,
                total: prev.total,
                error: apiError,
                stale: true,
              }
            : {
                status: "error",
                users: [],
                total: 0,
                error: apiError,
                stale: false,
              },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus, query.page, query.pageSize, query.sortOrder, tick]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [reload]);

  return {
    status: snapshot.status,
    users: snapshot.users,
    total: snapshot.total,
    error: snapshot.error,
    stale: snapshot.stale,
    reload,
  };
}
