"use client";

import type { PaginatedProjectsResponse, ProjectStatus } from "@quantia/contracts";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { ALL_STATUSES, type ProjectListFilters } from "@/features/filters";
import { listProjects } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export type ProjectsListStatus = "idle" | "loading" | "ready" | "error";

export type UseProjectsListState = {
  status: ProjectsListStatus;
  data: PaginatedProjectsResponse | null;
  error: ApiError | null;
  stale: boolean;
  reload: () => void;
};

type Snapshot = {
  status: ProjectsListStatus;
  data: PaginatedProjectsResponse | null;
  error: ApiError | null;
  stale: boolean;
};

const INITIAL: Snapshot = { status: "idle", data: null, error: null, stale: false };

export type ProjectsListQuery = Pick<
  ProjectListFilters,
  "q" | "status" | "page" | "pageSize" | "sortBy" | "sortOrder"
>;

export function useProjectsList(query: ProjectsListQuery): UseProjectsListState {
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
        prev.data
          ? { ...prev, error: null, status: "loading", stale: false }
          : { status: "loading", data: null, error: null, stale: false },
      );

      try {
        const statusParam =
          query.status === ALL_STATUSES ? undefined : (query.status as ProjectStatus);
        const result = await listProjects({
          page: query.page,
          pageSize: query.pageSize,
          q: query.q || undefined,
          status: statusParam,
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
    authStatus,
    query.page,
    query.pageSize,
    query.q,
    query.sortBy,
    query.sortOrder,
    query.status,
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
