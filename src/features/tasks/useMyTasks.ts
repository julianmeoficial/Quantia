"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api/errors";

import { fetchMyTasks, type MyTasksResult } from "./fetchMyTasks";

export type MyTasksStatus = "idle" | "loading" | "ready" | "error";

export type UseMyTasksState = {
  status: MyTasksStatus;
  data: MyTasksResult | null;
  error: ApiError | null;
  reload: () => void;
};

type Snapshot = {
  status: MyTasksStatus;
  data: MyTasksResult | null;
  error: ApiError | null;
};

const INITIAL: Snapshot = { status: "idle", data: null, error: null };

export function useMyTasks(): UseMyTasksState {
  const { user, status: authStatus } = useAuth();
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) return;

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSnapshot((prev) =>
        prev.data ? { ...prev, error: null } : { status: "loading", data: null, error: null },
      );

      try {
        const result = await fetchMyTasks(user.id);
        if (cancelled) return;
        setSnapshot({ status: "ready", data: result, error: null });
      } catch (cause: unknown) {
        if (cancelled) return;
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setSnapshot((prev) =>
          prev.data
            ? { ...prev, error: apiError }
            : { status: "error", data: null, error: apiError },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus, user, tick]);

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

  return { ...snapshot, reload };
}
