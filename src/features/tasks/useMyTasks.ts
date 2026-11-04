"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { pollWithBackoff } from "@/lib/async/pollWithBackoff";
import { queryKeys } from "@/lib/api/query-keys";
import { ApiError } from "@/lib/api/errors";

import { fetchMyTasks, type MyTasksResult } from "./fetchMyTasks";

export type MyTasksStatus = "idle" | "loading" | "ready" | "error";

export type UseMyTasksState = {
  status: MyTasksStatus;
  data: MyTasksResult | null;
  error: ApiError | null;
  reload: () => void;
};

function hasPendingSync(data: MyTasksResult | null | undefined): boolean {
  return Boolean(data?.tasks.some((task) => task.syncStatus === "PENDING"));
}

function toApiError(cause: unknown): ApiError {
  return cause instanceof ApiError ? cause : new ApiError("unknown", null);
}

export function useMyTasks(): UseMyTasksState {
  const { user, status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const enabled = authStatus === "authenticated" && Boolean(user);
  const userId = user?.id ?? "";

  const query = useQuery({
    queryKey: queryKeys.myTasks(userId),
    queryFn: () => fetchMyTasks(userId),
    enabled,
  });

  const reload = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.myTasks(userId) });
  }, [queryClient, userId]);

  const pendingSync = hasPendingSync(query.data);

  useEffect(() => {
    if (!pendingSync || !enabled || !userId) return;

    const controller = new AbortController();

    void pollWithBackoff({
      fetch: () => fetchMyTasks(userId),
      isDone: (result) => !hasPendingSync(result),
      signal: controller.signal,
      onUpdate: (result) => {
        queryClient.setQueryData(queryKeys.myTasks(userId), result);
      },
    });

    return () => {
      controller.abort();
    };
  }, [pendingSync, enabled, userId, queryClient]);

  if (!enabled) {
    return { status: "idle", data: null, error: null, reload };
  }

  if (query.isPending && !query.data) {
    return { status: "loading", data: null, error: null, reload };
  }

  if (query.isError && !query.data) {
    return { status: "error", data: null, error: toApiError(query.error), reload };
  }

  return {
    status: "ready",
    data: query.data ?? null,
    error: query.error ? toApiError(query.error) : null,
    reload,
  };
}
