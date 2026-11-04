"use client";

import type { PaginatedProgressResponse } from "@quantia/contracts";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import type { ProgressListFilters } from "@/features/filters";
import { listProjectProgress } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export type ProjectProgressListQuery = Omit<ProgressListFilters, "projectId" | "taskId"> & {
  projectId: string;
  taskId: string;
};

type Snapshot = {
  status: "idle" | "loading" | "ready" | "error";
  data: PaginatedProgressResponse | null;
  error: ApiError | null;
  stale: boolean;
};

const INITIAL: Snapshot = { status: "idle", data: null, error: null, stale: false };

export function useProjectProgressList(query: ProjectProgressListQuery | null) {
  const { status: authStatus } = useAuth();
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  const active = authStatus === "authenticated" && Boolean(query?.projectId);

  if (!active && snapshot.status !== "idle") {
    setSnapshot(INITIAL);
  }

  useEffect(() => {
    if (!active || !query?.projectId) return;

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSnapshot((prev) =>
        prev.data
          ? { ...prev, error: null, status: "loading", stale: false }
          : { status: "loading", data: null, error: null, stale: false },
      );

      try {
        const result = await listProjectProgress(query.projectId, {
          page: query.page,
          pageSize: query.pageSize,
          taskId: query.taskId || undefined,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        });
        if (cancelled) return;
        setSnapshot({ status: "ready", data: result, error: null, stale: false });
      } catch (cause: unknown) {
        if (cancelled) return;
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setSnapshot((prev) =>
          prev.data
            ? { status: "ready", data: prev.data, error: apiError, stale: true }
            : { status: "error", data: null, error: apiError, stale: false },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    query?.page,
    query?.pageSize,
    query?.projectId,
    query?.sortBy,
    query?.sortOrder,
    query?.taskId,
    tick,
  ]);

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
    data: snapshot.data,
    error: snapshot.error,
    stale: snapshot.stale,
    reload,
  };
}
